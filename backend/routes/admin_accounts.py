"""
Admin API - Quản lý Tài khoản Giảng viên & Admin
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_accounts_bp = Blueprint("admin_accounts_api", __name__)


# ─────────────────────────────────────────────────────────────
# TÀI KHOẢN GIẢNG VIÊN
# ─────────────────────────────────────────────────────────────

@admin_accounts_bp.route("/accounts", methods=["GET"])
def get_all_accounts():
    """Lấy danh sách tất cả tài khoản giảng viên."""
    conn = get_neo4j_connection()
    try:
        results = conn.query("""
            MATCH (gv:GiangVien)
            WHERE coalesce(gv.is_deleted, false) = false
            OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
            RETURN gv.id AS id,
                   gv.ho_va_ten AS ho_va_ten,
                   gv.email AS email,
                   gv.username AS username,
                   gv.bo_mon AS bo_mon,
                   gv.hoc_vi AS hoc_vi,
                   CASE WHEN gv.password IS NOT NULL AND gv.password <> '' THEN true ELSE false END AS co_tai_khoan,
                   gv.trang_thai_tk AS trang_thai_tk
            ORDER BY gv.ho_va_ten
        """)
        accounts = []
        for r in results:
            accounts.append({
                "id": r["id"],
                "ho_va_ten": r["ho_va_ten"],
                "email": r["email"],
                "username": r["username"],
                "bo_mon": r["bo_mon"],
                "hoc_vi": r["hoc_vi"],
                "co_tai_khoan": r["co_tai_khoan"],
                "trang_thai_tk": r["trang_thai_tk"] or "Hoạt động",
            })
        return jsonify({"status": "ok", "data": accounts})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_accounts_bp.route("/accounts/<gv_id>/reset-password", methods=["PUT"])
def reset_password(gv_id):
    """Đặt lại mật khẩu cho tài khoản giảng viên."""
    data = request.json or {}
    new_password = data.get("new_password", "").strip()
    if not new_password:
        return jsonify({"status": "error", "message": "Mật khẩu mới không được để trống"}), 400

    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            MATCH (gv:GiangVien) WHERE gv.id = $id
            SET gv.password = $password
            RETURN gv.id AS id
        """, {"id": gv_id, "password": new_password})
        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy giảng viên"}), 404
        return jsonify({"status": "ok", "message": "Đặt lại mật khẩu thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_accounts_bp.route("/accounts/<gv_id>/toggle-status", methods=["PUT"])
def toggle_account_status(gv_id):
    """Khoá hoặc mở khoá tài khoản giảng viên."""
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            MATCH (gv:GiangVien) WHERE gv.id = $id
            SET gv.trang_thai_tk = CASE
                WHEN coalesce(gv.trang_thai_tk, 'Hoạt động') = 'Hoạt động' THEN 'Bị khoá'
                ELSE 'Hoạt động'
            END
            RETURN gv.trang_thai_tk AS trang_thai_tk
        """, {"id": gv_id})
        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy giảng viên"}), 404
        new_status = result[0]["trang_thai_tk"]
        return jsonify({"status": "ok", "message": f"Tài khoản đã được {'mở khoá' if new_status == 'Hoạt động' else 'khoá'}", "trang_thai_tk": new_status})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_accounts_bp.route("/accounts/<gv_id>/set-password", methods=["POST"])
def set_password(gv_id):
    """Tạo tài khoản ban đầu cho giảng viên (gồm email và password)."""
    data = request.json or {}
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email:
        return jsonify({"status": "error", "message": "Email không được để trống"}), 400
    if not password:
        return jsonify({"status": "error", "message": "Mật khẩu không được để trống"}), 400
    if len(password) < 6:
        return jsonify({"status": "error", "message": "Mật khẩu phải từ 6 ký tự"}), 400

    conn = get_neo4j_connection()
    try:
        check = conn.query("MATCH (g:GiangVien) WHERE (g.email = $email OR g.username = $email) AND coalesce(g.is_deleted, false) = false RETURN g.id AS id", {"email": email})
        if check and any(r["id"] != gv_id for r in check):
            return jsonify({"status": "error", "message": "Địa chỉ email/tên đăng nhập này đã được sử dụng"}), 400

        result = conn.write("""
            MATCH (gv:GiangVien) WHERE gv.id = $id
            SET gv.email = $email,
                gv.username = $email,
                gv.password = $password,
                gv.trang_thai_tk = 'Hoạt động'
            RETURN gv.id AS id
        """, {"id": gv_id, "password": password, "email": email})

        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy giảng viên"}), 404
        return jsonify({"status": "ok", "message": "Tạo tài khoản thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# TÀI KHOẢN ADMIN
# ─────────────────────────────────────────────────────────────

@admin_accounts_bp.route("/accounts/admins", methods=["GET"])
def get_all_admins():
    """Lấy danh sách tất cả tài khoản Admin."""
    conn = get_neo4j_connection()
    try:
        results = conn.query("""
            MATCH (a:Admin)
            RETURN a.id AS id,
                   a.ho_va_ten AS ho_va_ten,
                   a.username AS username,
                   a.email AS email
            ORDER BY a.ho_va_ten
        """)
        admins = []
        for r in results:
            admins.append({
                "id": r["id"],
                "ho_va_ten": r["ho_va_ten"] or r["username"],
                "username": r["username"],
                "email": r["email"] or "",
            })
        return jsonify({"status": "ok", "data": admins})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_accounts_bp.route("/accounts/admins", methods=["POST"])
def create_admin():
    """Tạo tài khoản Admin mới (chỉ admin mặc định 'admin' được phép tạo)."""
    requester_id = request.args.get("requester_id", "").strip()
    if requester_id != "admin":
        return jsonify({"status": "error", "message": "Chỉ tài khoản admin mặc định mới có quyền tạo admin mới"}), 403

    data = request.json or {}
    ho_va_ten = data.get("ho_va_ten", "").strip()
    username  = data.get("username",  "").strip()
    email     = data.get("email",     "").strip()
    password  = data.get("password",  "").strip()

    if not username:
        return jsonify({"status": "error", "message": "Tên đăng nhập không được để trống"}), 400
    if not password or len(password) < 6:
        return jsonify({"status": "error", "message": "Mật khẩu phải từ 6 ký tự"}), 400

    conn = get_neo4j_connection()
    try:
        # Kiểm tra trùng username
        existing = conn.query_single(
            "MATCH (a:Admin) WHERE a.username = $username OR a.id = $username RETURN a.id AS id",
            {"username": username}
        )
        if existing:
            return jsonify({"status": "error", "message": "Tên đăng nhập đã tồn tại"}), 400

        conn.write("""
            CREATE (a:Admin {
                id: $username,
                username: $username,
                ho_va_ten: $ho_va_ten,
                email: $email,
                password: $password,
                anh_dai_dien: ''
            })
        """, {
            "username": username,
            "ho_va_ten": ho_va_ten or username,
            "email": email,
            "password": password,
        })
        return jsonify({"status": "ok", "message": "Tạo tài khoản Admin thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_accounts_bp.route("/accounts/admins/<admin_id>", methods=["DELETE"])
def delete_admin(admin_id):
    """Xóa tài khoản Admin (chỉ admin mặc định 'admin' được phép xóa)."""
    requester_id = request.args.get("requester_id", "").strip()
    if requester_id != "admin":
        return jsonify({"status": "error", "message": "Chỉ tài khoản admin mặc định mới có quyền xóa các admin khác"}), 403
    if admin_id == "admin":
        return jsonify({"status": "error", "message": "Không thể xóa tài khoản admin mặc định"}), 403

    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            MATCH (a:Admin) WHERE a.id = $id AND a.id <> 'admin'
            DETACH DELETE a
            RETURN count(a) AS deleted
        """, {"id": admin_id})
        return jsonify({"status": "ok", "message": "Đã xóa tài khoản Admin"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_accounts_bp.route("/accounts/admins/<admin_id>/reset-password", methods=["PUT"])
def reset_admin_password(admin_id):
    """Đặt lại mật khẩu cho tài khoản Admin."""
    data = request.json or {}
    new_password = data.get("new_password", "").strip()
    if not new_password or len(new_password) < 6:
        return jsonify({"status": "error", "message": "Mật khẩu phải từ 6 ký tự"}), 400

    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            MATCH (a:Admin) WHERE a.id = $id
            SET a.password = $password
            RETURN a.id AS id
        """, {"id": admin_id, "password": new_password})
        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy tài khoản Admin"}), 404
        return jsonify({"status": "ok", "message": "Đặt lại mật khẩu thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
