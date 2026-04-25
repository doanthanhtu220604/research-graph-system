"""
Admin API - Quản lý Tài khoản Giảng viên
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_accounts_bp = Blueprint("admin_accounts_api", __name__)


@admin_accounts_bp.route("/accounts", methods=["GET"])
def get_all_accounts():
    """Lấy danh sách tất cả tài khoản giảng viên (có mật khẩu đã được đặt)."""
    conn = get_neo4j_connection()
    try:
        results = conn.query("""
            MATCH (gv:GiangVien)
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
                "trang_thai_tk": r["trang_thai_tk"] or "Hoạt động"
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
    """Tạo tài khoản ban đầu cho giảng viên (gồm username và password)."""
    data = request.json or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    
    if not username:
        return jsonify({"status": "error", "message": "Tên tài khoản không được để trống"}), 400
    if not password:
        return jsonify({"status": "error", "message": "Mật khẩu không được để trống"}), 400

    conn = get_neo4j_connection()
    try:
        # Kiểm tra xem username đã tồn tại chưa
        check = conn.query("MATCH (g:GiangVien) WHERE g.username = $un OR g.email = $un RETURN g.id AS id", {"un": username})
        if check and any(r["id"] != gv_id for r in check):
            return jsonify({"status": "error", "message": "Tên tài khoản này đã được sử dụng"}), 400

        result = conn.write("""
            MATCH (gv:GiangVien) WHERE gv.id = $id
            SET gv.password = $password,
                gv.username = $username,
                gv.trang_thai_tk = 'Hoạt động'
            RETURN gv.id AS id
        """, {"id": gv_id, "password": password, "username": username})
        
        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy giảng viên"}), 404
        return jsonify({"status": "ok", "message": "Tạo tài khoản thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
