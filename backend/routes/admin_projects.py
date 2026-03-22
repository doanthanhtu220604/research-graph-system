"""
Admin API - Quản lý Đề tài Nghiên cứu
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_projects_bp = Blueprint("admin_projects_api", __name__)

@admin_projects_bp.route("/de-tai", methods=["POST"])
def create_de_tai():
    data = request.json
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (dt:DeTaiNghienCuu {
                ten_de_tai: $ten_de_tai,
                cap_de_tai: $cap_de_tai,
                nam_bat_dau: $nam_bat_dau,
                nam_ket_thuc: $nam_ket_thuc,
                tom_tat: $tom_tat,
                link: $link
            })
            RETURN id(dt) AS id
        """, data)
        return jsonify({"status": "ok", "message": "Thêm đề tài thành công", "id": result[0]["id"]})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_projects_bp.route("/de-tai/<int:id>", methods=["PUT"])
def update_de_tai(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (dt:DeTaiNghienCuu) WHERE id(dt) = $id
            SET dt.ten_de_tai = $ten_de_tai,
                dt.cap_de_tai = $cap_de_tai,
                dt.nam_bat_dau = $nam_bat_dau,
                dt.nam_ket_thuc = $nam_ket_thuc,
                dt.tom_tat = $tom_tat,
                dt.link = $link
        """, {"id": id, **data})
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_projects_bp.route("/de-tai/<int:id>", methods=["DELETE"])
def delete_de_tai(id):
    conn = get_neo4j_connection()
    try:
        conn.write("MATCH (dt:DeTaiNghienCuu) WHERE id(dt) = $id DETACH DELETE dt", {"id": id})
        return jsonify({"status": "ok", "message": "Xóa thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
