"""
Admin API - Quản lý Công trình Nghiên cứu
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_publications_bp = Blueprint("admin_publications_api", __name__)

@admin_publications_bp.route("/cong-trinh", methods=["POST"])
def create_cong_trinh():
    data = request.json
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (ct:CongTrinhNghienCuu {
                ten_cong_trinh: $ten_cong_trinh,
                nam_xuat_ban: $nam_xuat_ban,
                loai_an_pham: $loai_an_pham,
                tom_tat: $tom_tat,
                link: $link
            })
            SET ct.id = 'ct_' + toString(id(ct))
            RETURN ct.id AS id
        """, data)
        return jsonify({"status": "ok", "message": "Thêm công trình thành công", "id": result[0]["id"]})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_publications_bp.route("/cong-trinh/<id>", methods=["PUT"])
def update_cong_trinh(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
            SET ct.ten_cong_trinh = $ten_cong_trinh,
                ct.nam_xuat_ban = $nam_xuat_ban,
                ct.loai_an_pham = $loai_an_pham,
                ct.tom_tat = $tom_tat,
                ct.link = $link
        """, {"id": id, **data})
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_publications_bp.route("/cong-trinh/<id>/approve", methods=["PUT"])
def approve_cong_trinh(id):
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
            SET ct.trang_thai = 'Đang làm'
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Duyệt công trình thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_publications_bp.route("/cong-trinh/<id>", methods=["DELETE"])
def delete_cong_trinh(id):
    conn = get_neo4j_connection()
    try:
        conn.write("MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id DETACH DELETE ct", {"id": id})
        return jsonify({"status": "ok", "message": "Xóa thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
