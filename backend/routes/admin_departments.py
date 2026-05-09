"""
Admin API - Quản lý Bộ môn
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_departments_bp = Blueprint("admin_departments_api", __name__)

@admin_departments_bp.route("/bo-mon", methods=["GET"])
def get_all_bo_mon():
    conn = get_neo4j_connection()
    try:
        results = conn.query("""
            MATCH (bm:BoMon)
            WHERE coalesce(bm.is_deleted, false) = false
            RETURN bm
            ORDER BY bm.ten_bo_mon
        """)
        bo_mon_list = []
        for r in results:
            bm = dict(r["bm"])
            bo_mon_list.append(bm)
        return jsonify({"status": "ok", "data": bo_mon_list})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_departments_bp.route("/bo-mon", methods=["POST"])
def create_bo_mon():
    data = request.json
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (bm:BoMon {
                ten_bo_mon: $ten_bo_mon
            })
            SET bm.id = 'bm_' + toString(id(bm)),
                bm.created_at = timestamp()
            RETURN bm.id AS id
        """, data)
        bm_id = result[0]["id"] if result else None
        return jsonify({"status": "ok", "message": "Thêm bộ môn thành công", "id": bm_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_departments_bp.route("/bo-mon/<id>", methods=["PUT"])
def update_bo_mon(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        # Nếu id là integer (id nội bộ) hoặc id chuỗi (bm_...)
        query_match = "WHERE bm.id = $id"
        if id.isdigit():
            query_match = "WHERE id(bm) = toInteger($id)"
            
        conn.write(f"""
            MATCH (bm:BoMon) {query_match}
            SET bm.ten_bo_mon = $ten_bo_mon,
                bm.updated_at = timestamp()
        """, {"id": id, **data})
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_departments_bp.route("/bo-mon/<id>", methods=["DELETE"])
def delete_bo_mon(id):
    """Xóa mềm bộ môn."""
    data = request.json or {}
    note = data.get('note', '')
    conn = get_neo4j_connection()
    
    query_match = "WHERE bm.id = $id"
    if id.isdigit():
        query_match = "WHERE id(bm) = toInteger($id)"

    result = conn.write(f"""
        MATCH (bm:BoMon)
        {query_match}
        SET bm.is_deleted = true,
            bm.deleted_at = timestamp(),
            bm.deleted_note = $note
        RETURN bm
    """, {"id": id, "note": note})
    
    if not result:
        return jsonify({"status": "error", "message": "Không tìm thấy bộ môn"}), 404

    return jsonify({"status": "ok", "message": "Đã chuyển vào thùng rác"})
