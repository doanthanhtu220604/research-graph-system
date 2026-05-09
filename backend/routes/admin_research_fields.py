"""
Admin API - Quản lý Lĩnh vực nghiên cứu
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_research_fields_bp = Blueprint("admin_research_fields_api", __name__)

@admin_research_fields_bp.route("/linh-vuc", methods=["POST"])
def create_linh_vuc():
    data = request.json
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (lv:LinhVucNghienCuu {
                ten_linh_vuc: $ten_linh_vuc
            })
            SET lv.id = 'lv_' + toString(id(lv))
            RETURN lv.id AS id
        """, data)
        lv_id = result[0]["id"] if result else None
        return jsonify({"status": "ok", "message": "Thêm lĩnh vực nghiên cứu thành công", "id": lv_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_research_fields_bp.route("/linh-vuc/<id>", methods=["PUT"])
def update_linh_vuc(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (lv:LinhVucNghienCuu) WHERE lv.id = $id
            SET lv.ten_linh_vuc = $ten_linh_vuc
        """, {"id": id, **data})
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_research_fields_bp.route("/linh-vuc/<id>", methods=["DELETE"])
def delete_linh_vuc(id):
    """Xóa mềm lĩnh vực nghiên cứu."""
    data = request.json or {}
    note = data.get('note', '')
    conn = get_neo4j_connection()
    
    # Ở đây chúng ta hỗ trợ cả id nội bộ (integer) và id chuỗi (lv_...)
    query_match = "WHERE lv.id = $id"
    if id.isdigit():
        query_match = "WHERE id(lv) = toInteger($id)"

    result = conn.write(f"""
        MATCH (lv:LinhVucNghienCuu)
        {query_match}
        SET lv.is_deleted = true,
            lv.deleted_at = timestamp(),
            lv.deleted_note = $note
        RETURN lv
    """, {"id": id, "note": note})
    
    if not result:
        return jsonify({"status": "error", "message": "Không tìm thấy lĩnh vực"}), 404

    return jsonify({"status": "ok", "message": "Đã chuyển vào thùng rác"})
