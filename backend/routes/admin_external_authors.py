"""
Admin API - Quản lý Tác giả ngoài
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_external_authors_bp = Blueprint("admin_external_authors_api", __name__)

@admin_external_authors_bp.route("/tac-gia-ngoai", methods=["GET"])
def get_all_tac_gia_ngoai():
    conn = get_neo4j_connection()
    try:
        results = conn.query("""
            MATCH (tgn:TacGiaNgoai)
            WHERE coalesce(tgn.is_deleted, false) = false
            RETURN tgn
            ORDER BY tgn.ho_va_ten
        """)
        data = [dict(r["tgn"]) for r in results]
        return jsonify({"status": "ok", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_external_authors_bp.route("/tac-gia-ngoai", methods=["POST"])
def create_tac_gia_ngoai():
    data = request.json
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (tgn:TacGiaNgoai {
                ho_va_ten: $ho_va_ten,
                don_vi_cong_tac: $don_vi_cong_tac,
                hoc_vi: $hoc_vi,
                chuc_danh: $chuc_danh,
                email: $email
            })
            SET tgn.id = 'tgn_' + toString(id(tgn))
            RETURN tgn.id AS id
        """, data)
        new_id = result[0]["id"]
        return jsonify({"status": "ok", "message": "Thêm tác giả ngoài thành công", "id": new_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_external_authors_bp.route("/tac-gia-ngoai/<id>", methods=["PUT"])
def update_tac_gia_ngoai(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (tgn:TacGiaNgoai) WHERE tgn.id = $id
            SET tgn.ho_va_ten = $ho_va_ten,
                tgn.don_vi_cong_tac = $don_vi_cong_tac,
                tgn.hoc_vi = $hoc_vi,
                tgn.chuc_danh = $chuc_danh,
                tgn.email = $email
        """, {"id": id, **data})
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_external_authors_bp.route("/tac-gia-ngoai/<id>", methods=["DELETE"])
def delete_tac_gia_ngoai(id):
    """Xóa mềm tác giả ngoài."""
    data = request.json or {}
    note = data.get('note', '')
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (tgn:TacGiaNgoai) WHERE tgn.id = $id
            SET tgn.is_deleted = true,
                tgn.deleted_at = timestamp(),
                tgn.deleted_note = $note
        """, {"id": id, "note": note})
        return jsonify({"status": "ok", "message": "Đã chuyển vào thùng rác"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
