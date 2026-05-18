"""
Admin API - Quản lý Công trình Nghiên cứu
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_publications_bp = Blueprint("admin_publications_api", __name__)

@admin_publications_bp.route("/cong-trinh", methods=["POST"])
def create_cong_trinh():
    data = request.json
    tac_gia_chinh_ids = data.pop("tac_gia_chinh_ids", [])
    cong_su_ids = data.pop("cong_su_ids", [])
    tac_gia_ngoai_ids = data.pop("tac_gia_ngoai_ids", [])
    conn = get_neo4j_connection()
    try:
        # Ensure all expected fields exist in data so that Cypher parameters match cleanly
        for field in ["ten_cong_trinh", "nam_xuat_ban", "noi_xuat_ban", "tom_tat", "trang_thai", "link"]:
            if field not in data:
                data[field] = None

        result = conn.write("""
            CREATE (ct:CongTrinhNghienCuu {
                ten_cong_trinh: toUpper($ten_cong_trinh),
                nam_xuat_ban: $nam_xuat_ban,
                noi_xuat_ban: $noi_xuat_ban,
                tom_tat: $tom_tat,
                trang_thai: coalesce($trang_thai, 'Đang thực hiện'),
                link: $link,
                created_at: timestamp()
            })
            SET ct.id = 'ct_' + toString(id(ct))
            RETURN ct.id AS id
        """, data)
        new_id = result[0]["id"]

        # Gán Tác giả chính ngay khi tạo
        if tac_gia_chinh_ids:
            conn.write("""
                UNWIND $gv_ids AS gv_id
                MATCH (gv:GiangVien), (ct:CongTrinhNghienCuu)
                WHERE gv.id = gv_id AND ct.id = $ct_id
                MERGE (gv)-[:TAC_GIA_CHINH]->(ct)
            """, {"ct_id": new_id, "gv_ids": tac_gia_chinh_ids})

        # Gán Cộng sự ngay khi tạo
        if cong_su_ids:
            conn.write("""
                UNWIND $gv_ids AS gv_id
                MATCH (gv:GiangVien), (ct:CongTrinhNghienCuu)
                WHERE gv.id = gv_id AND ct.id = $ct_id
                MERGE (gv)-[:CONG_SU]->(ct)
            """, {"ct_id": new_id, "gv_ids": cong_su_ids})

        # Gán tác giả ngoài
        if tac_gia_ngoai_ids:
            conn.write("""
                UNWIND $tgn_ids AS tgn_id
                MATCH (tgn:TacGiaNgoai), (ct:CongTrinhNghienCuu)
                WHERE tgn.id = tgn_id AND ct.id = $ct_id
                MERGE (tgn)-[:DONG_TAC_GIA]->(ct)
            """, {"ct_id": new_id, "tgn_ids": tac_gia_ngoai_ids})

        return jsonify({"status": "ok", "message": "Thêm công trình thành công", "id": new_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_publications_bp.route("/cong-trinh/<id>", methods=["PUT"])
def update_cong_trinh(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        params = {
            "id": id,
            "ten_cong_trinh": data.get("ten_cong_trinh"),
            "nam_xuat_ban": data.get("nam_xuat_ban"),
            "noi_xuat_ban": data.get("noi_xuat_ban"),
            "tom_tat": data.get("tom_tat"),
            "trang_thai": data.get("trang_thai"),
            "link": data.get("link")
        }
        conn.write("""
            MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
            SET ct.ten_cong_trinh = toUpper($ten_cong_trinh),
                ct.nam_xuat_ban = $nam_xuat_ban,
                ct.noi_xuat_ban = $noi_xuat_ban,
                ct.tom_tat = $tom_tat,
                ct.trang_thai = coalesce($trang_thai, 'Hoàn thành'),
                ct.link = $link
        """, params)
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_publications_bp.route("/cong-trinh/<id>/approve", methods=["PUT"])
def approve_cong_trinh(id):
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
            SET ct.trang_thai = 'Đang thực hiện'
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Duyệt công trình thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_publications_bp.route("/cong-trinh/<id>", methods=["DELETE"])
def delete_cong_trinh(id):
    conn = get_neo4j_connection()
    try:
        from flask import request as _req
        note = _req.json.get("note", "") if _req.is_json else ""

        # Kiểm tra trạng thái trước khi xóa
        status_res = conn.query_single("MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id RETURN ct.trang_thai AS status", {'id': id})
        if status_res and status_res.get('status') == 'Đang thực hiện':
            return jsonify({'status': 'error', 'message': 'Không thể xóa công trình đang thực hiện. Vui lòng chuyển trạng thái sang "Hoàn thành" trước khi xóa.'}), 400

        result = conn.write("""
            MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id AND coalesce(ct.is_deleted, false) = false
            SET ct.is_deleted   = true,
                ct.deleted_at   = timestamp(),
                ct.deleted_note = $note,
                ct.old_status   = ct.trang_thai
            RETURN ct.id AS id
        """, {"id": id, "note": note})
        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy công trình"}), 404
        return jsonify({"status": "ok", "message": "Đã chuyển vào thùng rác"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_publications_bp.route("/cong-trinh/<id>/approve-delete", methods=["PUT"])
def approve_delete_cong_trinh(id):
    conn = get_neo4j_connection()
    try:
        # Tương tự đề tài, khi phê duyệt xóa ta tin tưởng logic ở lecturer_api đã chặn 'Đang thực hiện'
        conn.write("""
            MATCH (n:CongTrinhNghienCuu) WHERE n.id = $id
            SET n.is_deleted = true,
                n.deleted_at = timestamp(),
                n.old_status = CASE WHEN n.trang_thai = 'Yêu cầu xóa' THEN 'Hoàn thành' ELSE n.trang_thai END,
                n.trang_thai = 'Đã vào thùng rác'
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Đã phê duyệt xóa công trình. Công trình đã được chuyển vào thùng rác."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
