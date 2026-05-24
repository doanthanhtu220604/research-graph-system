import logging
import os
from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, jsonify
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from backend.services.neo4j_connection import get_neo4j_connection
from backend.services.email_service import send_reset_password_email

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth_routes', __name__)

# Serializer để tạo / xác thực token reset password (hết hạn sau 15 phút)
def _get_serializer():
    secret = os.getenv("SECRET_KEY", "dev-secret-key")
    return URLSafeTimedSerializer(secret, salt="password-reset")


# ============================================================
# ĐĂNG NHẬP
# ============================================================

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Không có dữ liệu đăng nhập'}), 400
            
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({'status': 'error', 'message': 'Vui lòng nhập tài khoản và mật khẩu'}), 400
        conn = get_neo4j_connection()
        # 1. Kiểm tra/Tạo tài khoản Admin (trong CSDL Neo4j)
        conn.write("""
            MERGE (a:Admin {username: 'admin'})
            ON CREATE SET a.id = 'admin',
                          a.password = 'admin',
                          a.ho_va_ten = 'Administrator',
                          a.email = 'admin@system',
                          a.anh_dai_dien = ''
            ON MATCH SET a.id = 'admin'
        """)
            
        admin_result = conn.query_single("""
            MATCH (a:Admin)
            WHERE (a.username = $username OR a.email = $username OR a.id = $username) AND a.password = $password
            RETURN a.id AS id, a.ho_va_ten AS ten, a.email AS email, a.anh_dai_dien AS avatar
        """, parameters={'username': username, 'password': password})
        
        if admin_result:
            return jsonify({
                'status': 'ok',
                'data': {
                    'role': 'admin',
                    'user': {
                        'id': admin_result['id'],
                        'name': admin_result['ten'],
                        'email': admin_result['email'],
                        'avatar': admin_result['avatar'] or ''
                    }
                }
            })
            
        # 2. Kiểm tra tài khoản Giảng viên (trên Neo4j)
        query = """
        MATCH (g:GiangVien)
        WHERE (g.username = $username OR g.email = $username OR g.id = $username) AND g.password = $password
        RETURN g.id AS id, g.ho_va_ten AS ten, g.email AS email, g.bo_mon AS bo_mon, g.anh_dai_dien AS avatar, g.vai_tro AS vai_tro
        """
        result = conn.query_single(query, parameters={'username': username, 'password': password})
        
        if result:
            user_role = 'admin' if result.get('vai_tro') == 'admin' else 'lecturer'
            return jsonify({
                'status': 'ok',
                'data': {
                    'role': user_role,
                    'user': {
                        'id': result['id'],
                        'name': result['ten'],
                        'email': result['email'],
                        'department': result['bo_mon'],
                        'avatar': result['avatar']
                    }
                }
            })
            
        return jsonify({'status': 'error', 'message': 'Tài khoản hoặc mật khẩu không chính xác'}), 401
        
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================
# QUÊN MẬT KHẨU — Bước 1: Yêu cầu gửi link reset
# ============================================================

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Nhận email, kiểm tra tồn tại và gửi link reset password."""
    try:
        data = request.get_json()
        email = (data.get('email', '') if data else '').strip().lower()

        if not email:
            return jsonify({'status': 'error', 'message': 'Vui lòng nhập địa chỉ email'}), 400

        conn = get_neo4j_connection()
        result = conn.query_single(
            "MATCH (g:GiangVien) WHERE toLower(g.email) = $email RETURN g.id AS id, g.ho_va_ten AS ten, g.email AS email",
            parameters={'email': email}
        )

        # Dù tài khoản có tồn tại hay không, luôn trả về thông báo thành công
        # (tránh lộ thông tin người dùng - best practice bảo mật)
        if result and result.get('id'):
            s = _get_serializer()
            token = s.dumps(result['id'])   # Mã hoá gv_id vào token
            
            base_url = os.getenv("APP_BASE_URL", "http://localhost:5000")
            reset_link = f"{base_url}/reset-password.html?token={token}"
            
            sent = send_reset_password_email(
                recipient_email=result['email'],
                reset_link=reset_link,
                user_name=result.get('ten')
            )
            
            if not sent:
                # Trả về lỗi chi tiết nếu email thất bại (chỉ trong môi trường dev)
                logger.warning(f"[ForgotPW] Gửi email thất bại tới {email}")
                return jsonify({
                    'status': 'error',
                    'message': 'Không thể gửi email. Vui lòng kiểm tra cấu hình SMTP trong file .env và thử lại.'
                }), 500
        else:
            logger.info(f"[ForgotPW] Email không tồn tại trong hệ thống: {email}")

        return jsonify({
            'status': 'ok',
            'message': 'Nếu email tồn tại trong hệ thống, chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.'
        })

    except Exception as e:
        logger.error(f"Error in forgot_password: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================
# QUÊN MẬT KHẨU — Bước 2: Xác thực token và đặt mật khẩu mới
# ============================================================

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Xác thực token và cập nhật mật khẩu mới."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Không có dữ liệu'}), 400

        token = data.get('token', '').strip()
        new_password = data.get('new_password', '').strip()

        if not token:
            return jsonify({'status': 'error', 'message': 'Token không hợp lệ'}), 400
        if not new_password or len(new_password) < 6:
            return jsonify({'status': 'error', 'message': 'Mật khẩu phải có ít nhất 6 ký tự'}), 400

        # Xác thực token (hết hạn sau 900 giây = 15 phút)
        s = _get_serializer()
        try:
            gv_id = s.loads(token, max_age=900)
        except SignatureExpired:
            return jsonify({'status': 'error', 'message': 'Liên kết đã hết hạn (15 phút). Vui lòng thực hiện lại yêu cầu.'}), 400
        except BadSignature:
            return jsonify({'status': 'error', 'message': 'Liên kết không hợp lệ hoặc đã bị thay đổi.'}), 400

        # Cập nhật mật khẩu mới vào Neo4j
        conn = get_neo4j_connection()
        result = conn.query_single(
            "MATCH (g:GiangVien) WHERE g.id = $id RETURN g.id AS id",
            parameters={'id': gv_id}
        )

        if not result:
            return jsonify({'status': 'error', 'message': 'Tài khoản không tồn tại'}), 404

        conn.query(
            "MATCH (g:GiangVien) WHERE g.id = $id SET g.password = $password",
            parameters={'id': gv_id, 'password': new_password}
        )

        logger.info(f"[ResetPW] Đặt lại mật khẩu thành công cho: {gv_id}")
        return jsonify({'status': 'ok', 'message': 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.'})

    except Exception as e:
        logger.error(f"Error in reset_password: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================
# KIỂM TRA TOKEN HỢP LỆ (dùng khi tải trang reset-password)
# ============================================================

@auth_bp.route('/verify-reset-token', methods=['POST'])
def verify_reset_token():
    """Kiểm tra token còn hợp lệ không (dùng khi load trang reset-password)."""
    try:
        data = request.get_json()
        token = (data.get('token', '') if data else '').strip()

        if not token:
            return jsonify({'status': 'error', 'message': 'Thiếu token'}), 400

        s = _get_serializer()
        try:
            s.loads(token, max_age=900)
            return jsonify({'status': 'ok'})
        except SignatureExpired:
            return jsonify({'status': 'error', 'message': 'Liên kết đã hết hạn. Vui lòng thực hiện lại yêu cầu.'}), 400
        except BadSignature:
            return jsonify({'status': 'error', 'message': 'Liên kết không hợp lệ.'}), 400

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================
# HỒ SƠ & TÀI KHOẢN (PROFILE & PASSWORD)
# ============================================================

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    try:
        user_id = request.args.get('id', '').strip()
        role = request.args.get('role', '').strip()
        
        if not user_id or not role:
            return jsonify({'status': 'error', 'message': 'Thiếu id hoặc role'}), 400
            
        conn = get_neo4j_connection()
        result = None
        if role == 'admin':
            result = conn.query_single("""
                MATCH (a:Admin) WHERE a.id = $id
                RETURN a.id AS id, a.ho_va_ten AS ho_va_ten, a.email AS email, a.anh_dai_dien AS anh_dai_dien, a.username AS username
            """, parameters={'id': user_id})
            
        if not result:
            result = conn.query_single("""
                MATCH (g:GiangVien) WHERE g.id = $id
                RETURN g.id AS id, g.ho_va_ten AS ho_va_ten, g.email AS email, g.anh_dai_dien AS anh_dai_dien, g.username AS username
            """, parameters={'id': user_id})
            
        if result:
            return jsonify({
                'status': 'ok',
                'data': {
                    'id': result['id'],
                    'ho_va_ten': result['ho_va_ten'],
                    'email': result['email'],
                    'avatar': result['anh_dai_dien'] or '',
                    'username': result['username'] or ''
                }
            })
            
        return jsonify({'status': 'error', 'message': 'Không tìm thấy tài khoản'}), 404
        
    except Exception as e:
        logger.error(f"Error in get_profile: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Không có dữ liệu'}), 400
            
        user_id = data.get('id', '').strip()
        role = data.get('role', '').strip()
        ho_va_ten = data.get('ho_va_ten', '').strip()
        email = data.get('email', '').strip()
        avatar = data.get('avatar', '').strip()
        
        if not user_id or not role or not ho_va_ten or not email:
            return jsonify({'status': 'error', 'message': 'Vui lòng điền đủ thông tin bắt buộc'}), 400
            
        conn = get_neo4j_connection()
        result = None
        if role == 'admin':
            result = conn.write("""
                MATCH (a:Admin) WHERE a.id = $id
                SET a.ho_va_ten = $ho_va_ten,
                    a.email = $email,
                    a.anh_dai_dien = $avatar
                RETURN a.id AS id, a.ho_va_ten AS ho_va_ten, a.email AS email, a.anh_dai_dien AS avatar
            """, {'id': user_id, 'ho_va_ten': ho_va_ten, 'email': email, 'avatar': avatar})
            
        if not result:
            result = conn.write("""
                MATCH (g:GiangVien) WHERE g.id = $id
                SET g.ho_va_ten = $ho_va_ten,
                    g.email = $email,
                    g.anh_dai_dien = $avatar
                RETURN g.id AS id, g.ho_va_ten AS ho_va_ten, g.email AS email, g.anh_dai_dien AS avatar
            """, {'id': user_id, 'ho_va_ten': ho_va_ten, 'email': email, 'avatar': avatar})
            
        if result:
            return jsonify({
                'status': 'ok',
                'message': 'Cập nhật thông tin thành công',
                'data': {
                    'id': result[0]['id'],
                    'name': result[0]['ho_va_ten'],
                    'email': result[0]['email'],
                    'avatar': result[0]['avatar'] or ''
                }
            })
            
        return jsonify({'status': 'error', 'message': 'Không tìm thấy tài khoản để cập nhật'}), 404
        
    except Exception as e:
        logger.error(f"Error in update_profile: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@auth_bp.route('/change-password', methods=['PUT'])
def change_password():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Không có dữ liệu'}), 400
            
        user_id = data.get('id', '').strip()
        role = data.get('role', '').strip()
        old_password = data.get('old_password', '').strip()
        new_password = data.get('new_password', '').strip()
        
        if not user_id or not role or not old_password or not new_password:
            return jsonify({'status': 'error', 'message': 'Vui lòng điền đủ thông tin'}), 400
            
        if len(new_password) < 6:
            return jsonify({'status': 'error', 'message': 'Mật khẩu mới phải từ 6 ký tự'}), 400
            
        conn = get_neo4j_connection()
        is_admin_node = False
        if role == 'admin':
            check = conn.query_single("MATCH (a:Admin) WHERE a.id = $id RETURN a.password AS password", {'id': user_id})
            if check:
                is_admin_node = True
                if check['password'] != old_password:
                    return jsonify({'status': 'error', 'message': 'Mật khẩu cũ không chính xác'}), 400
                conn.write("MATCH (a:Admin) WHERE a.id = $id SET a.password = $password", {'id': user_id, 'password': new_password})
                
        if not is_admin_node:
            check = conn.query_single("MATCH (g:GiangVien) WHERE g.id = $id RETURN g.password AS password", {'id': user_id})
            if not check:
                return jsonify({'status': 'error', 'message': 'Không tìm thấy tài khoản'}), 404
            if check['password'] != old_password:
                return jsonify({'status': 'error', 'message': 'Mật khẩu cũ không chính xác'}), 400
            conn.write("MATCH (g:GiangVien) WHERE g.id = $id SET g.password = $password", {'id': user_id, 'password': new_password})
            
        return jsonify({'status': 'ok', 'message': 'Đổi mật khẩu thành công'})
        
    except Exception as e:
        logger.error(f"Error in change_password: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================
# ĐĂNG KÝ TÀI KHOẢN GIẢNG VIÊN
# ============================================================

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Không có dữ liệu đăng ký'}), 400
            
        ma_gv = data.get('ma_gv', '').strip()
        ho_va_ten = data.get('ho_va_ten', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        # Sử dụng email làm tên đăng nhập
        username = email
        
        if not ma_gv:
            return jsonify({'status': 'error', 'message': 'Mã giảng viên không được để trống'}), 400
        if not ho_va_ten:
            return jsonify({'status': 'error', 'message': 'Họ và tên không được để trống'}), 400
        if not email:
            return jsonify({'status': 'error', 'message': 'Email không được để trống'}), 400
        if not password:
            return jsonify({'status': 'error', 'message': 'Mật khẩu không được để trống'}), 400
        if len(password) < 6:
            return jsonify({'status': 'error', 'message': 'Mật khẩu phải từ 6 ký tự trở lên'}), 400

        conn = get_neo4j_connection()

        # Kiểm tra trùng lặp mã giảng viên
        check_ma = conn.query_single("""
            MATCH (g:GiangVien)
            WHERE g.ma_gv = $ma_gv AND coalesce(g.is_deleted, false) = false
            RETURN g.id AS id
        """, parameters={'ma_gv': ma_gv})
        if check_ma:
            return jsonify({'status': 'error', 'message': f'Mã giảng viên {ma_gv} đã tồn tại trong hệ thống. Đăng ký thất bại!'}), 400

        # Kiểm tra trùng lặp email (cũng là tên đăng nhập)
        check_email = conn.query_single("""
            MATCH (g:GiangVien)
            WHERE (g.email = $email OR g.username = $username) AND coalesce(g.is_deleted, false) = false
            RETURN g.id AS id
        """, parameters={'email': email, 'username': username})
        if check_email:
            return jsonify({'status': 'error', 'message': f'Email/Tài khoản {email} đã được đăng ký. Đăng ký thất bại!'}), 400

        # Tạo giảng viên mới
        result = conn.write("""
            CREATE (gv:GiangVien {
                ma_gv: $ma_gv,
                ho_va_ten: $ho_va_ten,
                hoc_vi: $hoc_vi,
                chuc_danh: $chuc_danh,
                chuc_vu: $chuc_vu,
                email: $email,
                dien_thoai: $dien_thoai,
                chuyen_nganh: $chuyen_nganh,
                trang_thai_cong_tac: coalesce($trang_thai_cong_tac, 'Đang công tác'),
                anh_dai_dien: $anh_dai_dien,
                username: $username,
                password: $password,
                trang_thai_tk: 'Hoạt động',
                vai_tro: 'giang_vien'
            })
            SET gv.id = 'gv_' + toString(id(gv))
            RETURN gv.id AS id
        """, {
            'ma_gv': ma_gv,
            'ho_va_ten': ho_va_ten,
            'hoc_vi': data.get('hoc_vi', '').strip(),
            'chuc_danh': data.get('chuc_danh', '').strip(),
            'chuc_vu': data.get('chuc_vu', '').strip(),
            'email': email,
            'dien_thoai': data.get('dien_thoai', '').strip(),
            'chuyen_nganh': data.get('chuyen_nganh', '').strip(),
            'trang_thai_cong_tac': data.get('trang_thai_cong_tac', 'Đang công tác'),
            'anh_dai_dien': data.get('anh_dai_dien', '').strip(),
            'username': username,
            'password': password
        })

        gv_id = result[0]["id"] if result else None

        # Thiết lập bộ môn (nếu có)
        bo_mon = data.get('bo_mon', '').strip()
        if bo_mon and gv_id:
            conn.write("""
                MATCH (gv:GiangVien) WHERE gv.id = $gv_id
                MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                ON CREATE SET bm.id = 'bm_' + toString(id(bm)),
                             bm.created_at = timestamp()
                MERGE (gv)-[:THUOC_BO_MON]->(bm)
            """, {"gv_id": gv_id, "bo_mon": bo_mon})

        return jsonify({'status': 'ok', 'message': 'Đăng ký tài khoản giảng viên thành công! Bạn có thể sử dụng Email này để đăng nhập.'})

    except Exception as e:
        logger.error(f"Error in register: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


