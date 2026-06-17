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
    data = request.json or {}
    ho_va_ten = data.get("ho_va_ten", "").strip().upper()
    don_vi_cong_tac = data.get("don_vi_cong_tac", "").strip().upper()

    if not ho_va_ten:
        return jsonify({"status": "error", "message": "Họ và tên không được để trống"}), 400

    conn = get_neo4j_connection()
    try:
        # Check duplicate
        existing = conn.query_single("""
            MATCH (tgn:TacGiaNgoai)
            WHERE toUpper(tgn.ho_va_ten) = $ho_va_ten
              AND toUpper(coalesce(tgn.don_vi_cong_tac, '')) = $don_vi_cong_tac
              AND coalesce(tgn.is_deleted, false) = false
            RETURN tgn.id AS id
        """, {"ho_va_ten": ho_va_ten, "don_vi_cong_tac": don_vi_cong_tac})

        if existing:
            org_msg = f" thuộc đơn vị '{don_vi_cong_tac}'" if don_vi_cong_tac else ""
            return jsonify({
                "status": "error",
                "message": f"Tác giả ngoài '{ho_va_ten}'{org_msg} đã tồn tại trong hệ thống."
            }), 400

        result = conn.write("""
            CREATE (tgn:TacGiaNgoai {
                ho_va_ten: toUpper($ho_va_ten),
                don_vi_cong_tac: toUpper($don_vi_cong_tac),
                hoc_vi: toUpper($hoc_vi),
                chuc_danh: toUpper($chuc_danh),
                chuc_vu: toUpper($chuc_vu),
                email: $email,
                trang_thai: 'Đã duyệt',
                is_deleted: false
            })
            SET tgn.id = 'tgn_' + toString(id(tgn))
            RETURN tgn.id AS id
        """, {
            "ho_va_ten": data.get("ho_va_ten", "").strip(),
            "don_vi_cong_tac": data.get("don_vi_cong_tac", "").strip(),
            "hoc_vi": data.get("hoc_vi", "").strip(),
            "chuc_danh": data.get("chuc_danh", "").strip(),
            "chuc_vu": data.get("chuc_vu", "").strip(),
            "email": data.get("email", "").strip()
        })
        new_id = result[0]["id"]
        return jsonify({"status": "ok", "message": "Thêm tác giả ngoài thành công", "id": new_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_external_authors_bp.route("/tac-gia-ngoai/<id>", methods=["PUT"])
def update_tac_gia_ngoai(id):
    data = request.json or {}
    ho_va_ten = data.get("ho_va_ten", "").strip().upper()
    don_vi_cong_tac = data.get("don_vi_cong_tac", "").strip().upper()

    if not ho_va_ten:
        return jsonify({"status": "error", "message": "Họ và tên không được để trống"}), 400

    conn = get_neo4j_connection()
    try:
        # Check duplicate
        existing = conn.query_single("""
            MATCH (tgn:TacGiaNgoai)
            WHERE toUpper(tgn.ho_va_ten) = $ho_va_ten
              AND toUpper(coalesce(tgn.don_vi_cong_tac, '')) = $don_vi_cong_tac
              AND coalesce(tgn.is_deleted, false) = false
              AND tgn.id <> $id
            RETURN tgn.id AS id
        """, {"ho_va_ten": ho_va_ten, "don_vi_cong_tac": don_vi_cong_tac, "id": id})

        if existing:
            org_msg = f" thuộc đơn vị '{don_vi_cong_tac}'" if don_vi_cong_tac else ""
            return jsonify({
                "status": "error",
                "message": f"Tác giả ngoài '{ho_va_ten}'{org_msg} đã tồn tại trong hệ thống."
            }), 400

        conn.write("""
            MATCH (tgn:TacGiaNgoai) WHERE tgn.id = $id
            SET tgn.ho_va_ten = toUpper($ho_va_ten),
                tgn.don_vi_cong_tac = toUpper($don_vi_cong_tac),
                tgn.hoc_vi = toUpper($hoc_vi),
                tgn.chuc_danh = toUpper($chuc_danh),
                tgn.chuc_vu = toUpper($chuc_vu),
                tgn.email = $email
        """, {
            "id": id,
            "ho_va_ten": data.get("ho_va_ten", "").strip(),
            "don_vi_cong_tac": data.get("don_vi_cong_tac", "").strip(),
            "hoc_vi": data.get("hoc_vi", "").strip(),
            "chuc_danh": data.get("chuc_danh", "").strip(),
            "chuc_vu": data.get("chuc_vu", "").strip(),
            "email": data.get("email", "").strip()
        })
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
            ORDER BY dt.nam DESC
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
        
        projects_data = []
        for r in projects:
            item = dict(r["item"])
            if "nam" in item:
                item["nam_bat_dau"] = item["nam"]
                item["nam_ket_thuc"] = item["nam"]
                item["nam_thuc_hien"] = str(item["nam"])
            projects_data.append(item)

        return jsonify({
            "status": "ok", 
            "data": {
                "info": author_res["info"],
                "publications": [r["item"] for r in publications],
                "projects": projects_data,
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


@admin_external_authors_bp.route("/tac-gia-ngoai/<id>/reject", methods=["PUT"])
def reject_tac_gia_ngoai(id):
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (tgn:TacGiaNgoai) WHERE tgn.id = $id
            SET tgn.is_deleted = true,
                tgn.deleted_at = timestamp(),
                tgn.deleted_note = 'Từ chối duyệt tác giả ngoài',
                tgn.trang_thai = 'Từ chối'
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Đã từ chối duyệt tác giả ngoài"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
