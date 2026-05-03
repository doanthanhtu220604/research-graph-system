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
            
        # 1. Kiểm tra tài khoản Admin (tài khoản cứng)
        if username == 'admin' and password == 'admin':
            return jsonify({
                'status': 'ok',
                'data': {
                    'role': 'admin',
                    'user': {
                        'id': 0,
                        'name': 'Administrator',
                        'email': 'admin@system'
                    }
                }
            })
            
        # 2. Kiểm tra tài khoản Giảng viên (trên Neo4j)
        conn = get_neo4j_connection()
        query = """
        MATCH (g:GiangVien)
        WHERE (g.username = $username OR g.email = $username OR g.id = $username) AND g.password = $password
        RETURN g.id AS id, g.ho_va_ten AS ten, g.email AS email, g.bo_mon AS bo_mon, g.anh_dai_dien AS avatar
        """
        result = conn.query_single(query, parameters={'username': username, 'password': password})
        
        if result:
            return jsonify({
                'status': 'ok',
                'data': {
                    'role': 'lecturer',
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
