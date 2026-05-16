"""
Admin API - Quản lý Công trình Nghiên cứu
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_publications_bp = Blueprint("admin_publications_api", __name__)

@admin_publications_bp.route("/cong-trinh", methods=["POST"])
def create_cong_trinh():
    data = request.json
    giang_vien_ids = data.pop("giang_vien_ids", [])
    tac_gia_ngoai_names = data.pop("tac_gia_ngoai_names", [])
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (ct:CongTrinhNghienCuu {
                ten_cong_trinh: $ten_cong_trinh,
                nam_xuat_ban: $nam_xuat_ban,
                tom_tat: $tom_tat,
                trang_thai: coalesce($trang_thai, 'Đang thực hiện'),
                link: $link,
                created_at: timestamp()
            })
            SET ct.id = 'ct_' + toString(id(ct))
            RETURN ct.id AS id
        """, data)
        new_id = result[0]["id"]

        # Gán tác giả ngay khi tạo (nếu có)
        if giang_vien_ids:
            conn.write("""
                UNWIND $gv_ids AS gv_id
                MATCH (gv:GiangVien), (ct:CongTrinhNghienCuu)
                WHERE gv.id = gv_id AND ct.id = $ct_id
                MERGE (gv)-[:LA_TAC_GIA_CUA]->(ct)
            """, {"ct_id": new_id, "gv_ids": giang_vien_ids})

        # Gán tác giả ngoài
        for ten in tac_gia_ngoai_names:
            ten = ten.strip()
            if not ten:
                continue
            conn.write("""
                MERGE (tgn:TacGiaNgoai {ho_va_ten: $ten})
                ON CREATE SET tgn.id = 'tgn_' + toString(id(tgn))
                WITH tgn
                MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $ct_id
                MERGE (tgn)-[:DONG_TAC_GIA]->(ct)
            """, {"ten": ten, "ct_id": new_id})

        return jsonify({"status": "ok", "message": "Thêm công trình thành công", "id": new_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_publications_bp.route("/cong-trinh/<id>", methods=["PUT"])
def update_cong_trinh(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
            SET ct.ten_cong_trinh = $ten_cong_trinh,
                ct.nam_xuat_ban = $nam_xuat_ban,
                ct.tom_tat = $tom_tat,
                ct.trang_thai = coalesce($trang_thai, 'Hoàn thành'),
                ct.link = $link
        """, {"id": id, **data})
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
