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
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (lv:LinhVucNghienCuu) WHERE lv.id = $id
            DETACH DELETE lv
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Xóa thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

