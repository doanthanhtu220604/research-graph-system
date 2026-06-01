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
            ORDER BY CASE WHEN coalesce(tgn.trang_thai, 'Đã duyệt') = 'Chờ duyệt' THEN 0 ELSE 1 END,
                     coalesce(tgn.created_at, 0) DESC,
                     tgn.ho_va_ten
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

@admin_external_authors_bp.route("/tac-gia-ngoai/<id>/detail", methods=["GET"])
def get_tac_gia_ngoai_detail(id):
    """Lấy chi tiết tác giả ngoài và các công trình/đề tài tham gia."""
    conn = get_neo4j_connection()
    try:
        # Lấy thông tin cơ bản
        author_res = conn.query_single("""
            MATCH (tgn:TacGiaNgoai) WHERE tgn.id = $id
            RETURN tgn {.*} as info
        """, {"id": id})
        
        if not author_res:
            return jsonify({"status": "error", "message": "Không tìm thấy tác giả"}), 404
            
        # Lấy danh sách công trình tham gia
        publications = conn.query("""
            MATCH (tgn:TacGiaNgoai)-[:TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(ct:CongTrinhNghienCuu)
            WHERE tgn.id = $id AND coalesce(ct.is_deleted, false) = false
            RETURN ct {.*} as item
            ORDER BY ct.nam_xuat_ban DESC
        """, {"id": id})
        
        # Lấy danh sách đề tài tham gia
        projects = conn.query("""
            MATCH (tgn:TacGiaNgoai)-[:CHU_NHIEM|THAM_GIA|DONG_TAC_GIA]->(dt:DeTaiNghienCuu)
            WHERE tgn.id = $id AND coalesce(dt.is_deleted, false) = false
            RETURN dt {.*} as item
            ORDER BY dt.nam_bat_dau DESC
        """, {"id": id})
        
        # Lấy danh sách giảng viên đã hợp tác (từ cả CT và DT)
        collaborators = conn.query("""
            MATCH (tgn:TacGiaNgoai)-[:TAC_GIA_CHINH|CONG_SU|CHU_NHIEM|THAM_GIA|DONG_TAC_GIA]->(work)
            WHERE tgn.id = $id AND (work:CongTrinhNghienCuu OR work:DeTaiNghienCuu)
            AND coalesce(work.is_deleted, false) = false
            MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU|CHU_NHIEM|THAM_GIA]->(work)
            WITH gv, count(work) AS workCount
            RETURN gv {
                .id, .ho_va_ten, .hoc_vi, .chuc_danh, .anh_dai_dien,
                count: workCount
            } as lecturer
            ORDER BY workCount DESC
        """, {"id": id})
        
        return jsonify({
            "status": "ok", 
            "data": {
                "info": author_res["info"],
                "publications": [r["item"] for r in publications],
                "projects": [r["item"] for r in projects],
                "collaborators": [r["lecturer"] for r in collaborators]
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_external_authors_bp.route("/tac-gia-ngoai/<id>/approve", methods=["PUT"])
def approve_tac_gia_ngoai(id):
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (tgn:TacGiaNgoai) WHERE tgn.id = $id
            SET tgn.trang_thai = 'Đã duyệt'
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Đã duyệt tác giả ngoài thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
