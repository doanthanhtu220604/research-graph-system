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
                ten_linh_vuc: toUpper($ten_linh_vuc)
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
            SET lv.ten_linh_vuc = toUpper($ten_linh_vuc)
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

@admin_research_fields_bp.route("/linh-vuc/<id>/detail", methods=["GET"])
def get_linh_vuc_detail(id):
    conn = get_neo4j_connection()
    try:
        # 1. Info
        info_res = conn.query_single("""
            MATCH (lv:LinhVucNghienCuu) WHERE lv.id = $id AND coalesce(lv.is_deleted, false) = false
            RETURN lv.id AS id, lv.ten_linh_vuc AS ten_linh_vuc
        """, {"id": id})
        if not info_res:
            return jsonify({"status": "error", "message": "Không tìm thấy lĩnh vực nghiên cứu"}), 404
            
        info = dict(info_res)
        
        # 2. Lecturers
        lecturers_res = conn.query("""
            MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
            WHERE lv.id = $id AND coalesce(gv.is_deleted, false) = false
            OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
            RETURN gv.id AS id, gv.ho_va_ten AS ho_va_ten, gv.hoc_vi AS hoc_vi, 
                   gv.chuc_danh AS chuc_danh, gv.email AS email, bm.ten_bo_mon AS bo_mon,
                   gv.anh_dai_dien AS anh_dai_dien
            ORDER BY gv.ho_va_ten
        """, {"id": id})
        lecturers = [dict(r) for r in lecturers_res]
        
        # 3. Publications
        publications_res = conn.query("""
            MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu),
                  (gv)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
            WHERE lv.id = $id AND coalesce(gv.is_deleted, false) = false AND coalesce(ct.is_deleted, false) = false
            RETURN DISTINCT ct.id AS id, ct.ten_cong_trinh AS ten_cong_trinh, 
                            ct.nam_xuat_ban AS nam_xuat_ban, ct.noi_xuat_ban AS noi_xuat_ban
            ORDER BY ct.nam_xuat_ban DESC, ct.ten_cong_trinh
        """, {"id": id})
        publications = [dict(r) for r in publications_res]
        
        # 4. Projects
        projects_res = conn.query("""
            MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu),
                  (gv)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
            WHERE lv.id = $id AND coalesce(gv.is_deleted, false) = false AND coalesce(dt.is_deleted, false) = false
            RETURN DISTINCT dt.id AS id, dt.ten_de_tai AS ten_de_tai, 
                            dt.cap_de_tai AS cap_de_tai, dt.nam_bat_dau AS nam_bat_dau, 
                            dt.nam_ket_thuc AS nam_ket_thuc
            ORDER BY dt.nam_bat_dau DESC, dt.ten_de_tai
        """, {"id": id})
        projects = [dict(r) for r in projects_res]
        
        return jsonify({
            "status": "ok",
            "data": {
                "info": info,
                "lecturers": lecturers,
                "publications": publications,
                "projects": projects
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
