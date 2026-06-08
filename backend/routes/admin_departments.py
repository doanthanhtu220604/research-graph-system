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
            OPTIONAL MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm)
            WHERE coalesce(gv.is_deleted, false) = false
            RETURN bm, count(gv) AS so_luong_gv
            ORDER BY bm.ten_bo_mon
        """)
        bo_mon_list = []
        for r in results:
            bm = dict(r["bm"])
            bm["so_luong_gv"] = r["so_luong_gv"]
            bo_mon_list.append(bm)
        return jsonify({"status": "ok", "data": bo_mon_list})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_departments_bp.route("/bo-mon/<id>/detail", methods=["GET"])
def get_bo_mon_detail(id):
    conn = get_neo4j_connection()
    try:
        # Support both bm.id = $id (standardized) and id(bm) = toInteger($id) (internal ID)
        query_match = "WHERE bm.id = $id"
        if id.isdigit():
            query_match = "WHERE id(bm) = toInteger($id)"

        # 1. Info & Aggregated Stats
        stats_res = conn.query_single(f"""
            MATCH (bm:BoMon)
            {query_match}
            AND coalesce(bm.is_deleted, false) = false
            OPTIONAL MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm)
            WHERE coalesce(gv.is_deleted, false) = false
            OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
            WHERE coalesce(ct.is_deleted, false) = false
            OPTIONAL MATCH (gv)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
            WHERE coalesce(dt.is_deleted, false) = false
            RETURN bm.id AS id, bm.ten_bo_mon AS ten_bo_mon,
                   count(DISTINCT gv) AS so_giang_vien,
                   count(DISTINCT ct) AS so_cong_trinh,
                   count(DISTINCT dt) AS so_de_tai
        """, {"id": id})

        if not stats_res or not stats_res.get("id"):
            return jsonify({"status": "error", "message": "Không tìm thấy bộ môn"}), 404

        info = {
            "id": stats_res["id"],
            "ten_bo_mon": stats_res["ten_bo_mon"],
            "so_giang_vien": stats_res["so_giang_vien"],
            "so_cong_trinh": stats_res["so_cong_trinh"],
            "so_de_tai": stats_res["so_de_tai"]
        }

        # 2. Detailed Lecturer List
        lecturers_res = conn.query(f"""
            MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm:BoMon)
            {query_match}
            AND coalesce(gv.is_deleted, false) = false
            OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
            WHERE coalesce(ct.is_deleted, false) = false
            OPTIONAL MATCH (gv)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
            WHERE coalesce(dt.is_deleted, false) = false
            RETURN gv.id AS id, gv.ho_va_ten AS ho_va_ten, gv.hoc_vi AS hoc_vi,
                   gv.chuc_danh AS chuc_danh, gv.email AS email, gv.dien_thoai AS dien_thoai,
                   gv.anh_dai_dien AS anh_dai_dien,
                   count(DISTINCT ct) AS so_cong_trinh,
                   count(DISTINCT dt) AS so_de_tai
            ORDER BY gv.ho_va_ten
        """, {"id": id})

        lecturers = [dict(r) for r in lecturers_res]

        return jsonify({
            "status": "ok",
            "data": {
                "info": info,
                "lecturers": lecturers
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_departments_bp.route("/bo-mon", methods=["POST"])
def create_bo_mon():
    data = request.json
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (bm:BoMon {
                ten_bo_mon: toUpper($ten_bo_mon)
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
            SET bm.ten_bo_mon = toUpper($ten_bo_mon),
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
