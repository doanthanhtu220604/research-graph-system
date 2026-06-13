"""
Admin API - Quản lý Công trình Nghiên cứu
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection, generate_slug

admin_publications_bp = Blueprint("admin_publications_api", __name__)

@admin_publications_bp.route("/cong-trinh", methods=["POST"])
def create_cong_trinh():
    data = request.json
    tac_gia_chinh_ids = data.pop("tac_gia_chinh_ids", [])
    cong_su_ids = data.pop("cong_su_ids", [])
    tac_gia_ngoai_ids = data.pop("tac_gia_ngoai_ids", [])
    conn = get_neo4j_connection()
    try:
        ten_cong_trinh = data.get("ten_cong_trinh", "")
        ten_cong_trinh = " ".join(ten_cong_trinh.split())
        data["ten_cong_trinh"] = ten_cong_trinh
        if not ten_cong_trinh:
            return jsonify({"status": "error", "message": "Tên công trình không được để trống"}), 400

        ten_cong_trinh_vi = " ".join(data.get("ten_cong_trinh_vi", "").split())
        data["ten_cong_trinh_vi"] = ten_cong_trinh_vi

        slug = generate_slug(ten_cong_trinh)
        exists_en = conn.query_single("""
            MATCH (ct:CongTrinhNghienCuu)
            WHERE ct.slug = $slug AND coalesce(ct.is_deleted, false) = false
            RETURN ct.id AS id
        """, {"slug": slug})
        if exists_en:
            return jsonify({"status": "error", "message": "Công trình nghiên cứu với tên tiếng Anh này đã tồn tại trong hệ thống"}), 400

        # Kiểm tra trùng tên tiếng Việt (nếu có)
        if ten_cong_trinh_vi:
            slug_vi = generate_slug(ten_cong_trinh_vi)
            exists_vi = conn.query_single("""
                MATCH (ct:CongTrinhNghienCuu)
                WHERE ct.slug_vi = $slug_vi AND coalesce(ct.is_deleted, false) = false
                RETURN ct.id AS id
            """, {"slug_vi": slug_vi})
            if exists_vi:
                return jsonify({"status": "error", "message": "Công trình nghiên cứu với tên tiếng Việt này đã tồn tại trong hệ thống"}), 400
            data["slug_vi"] = slug_vi
        else:
            data["slug_vi"] = None

        # Ensure all expected fields exist in data so that Cypher parameters match cleanly
        for field in ["ten_cong_trinh", "ten_cong_trinh_vi", "slug_vi", "nam_xuat_ban", "noi_xuat_ban", "tom_tat", "trang_thai", "link"]:
            if field not in data:
                data[field] = None

        result = conn.write("""
            CREATE (ct:CongTrinhNghienCuu {
                ten_cong_trinh: toUpper($ten_cong_trinh),
                ten_cong_trinh_vi: $ten_cong_trinh_vi,
                slug: $slug,
                slug_vi: $slug_vi,
                nam_xuat_ban: $nam_xuat_ban,
                noi_xuat_ban: toUpper($noi_xuat_ban),
                tom_tat: $tom_tat,
                trang_thai: coalesce($trang_thai, 'Đang thực hiện'),
                link: $link,
                created_at: timestamp()
            })
            SET ct.id = 'ct_' + toString(id(ct))
            RETURN ct.id AS id
        """, {**data, "slug": slug})
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
        ten_cong_trinh = data.get("ten_cong_trinh", "")
        ten_cong_trinh = " ".join(ten_cong_trinh.split())
        slug = generate_slug(ten_cong_trinh)

        ten_cong_trinh_vi = " ".join(data.get("ten_cong_trinh_vi", "").split())
        slug_vi = generate_slug(ten_cong_trinh_vi) if ten_cong_trinh_vi else None

        # Kiểm tra trùng tên tiếng Việt khi cập nhật (loại trừ chính nó)
        if slug_vi:
            exists_vi = conn.query_single("""
                MATCH (ct:CongTrinhNghienCuu)
                WHERE ct.slug_vi = $slug_vi AND ct.id <> $id AND coalesce(ct.is_deleted, false) = false
                RETURN ct.id AS id
            """, {"slug_vi": slug_vi, "id": id})
            if exists_vi:
                return jsonify({"status": "error", "message": "Công trình nghiên cứu với tên tiếng Việt này đã tồn tại trong hệ thống"}), 400

        params = {
            "id": id,
            "ten_cong_trinh": ten_cong_trinh,
            "ten_cong_trinh_vi": ten_cong_trinh_vi,
            "slug": slug,
            "slug_vi": slug_vi,
            "nam_xuat_ban": data.get("nam_xuat_ban"),
            "noi_xuat_ban": data.get("noi_xuat_ban"),
            "tom_tat": data.get("tom_tat"),
            "trang_thai": data.get("trang_thai"),
            "link": data.get("link")
        }
        conn.write("""
            MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
            SET ct.ten_cong_trinh = toUpper($ten_cong_trinh),
                ct.ten_cong_trinh_vi = $ten_cong_trinh_vi,
                ct.slug = $slug,
                ct.slug_vi = $slug_vi,
                ct.nam_xuat_ban = $nam_xuat_ban,
                ct.noi_xuat_ban = toUpper($noi_xuat_ban),
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
            SET ct.trang_thai = coalesce(ct.old_status, 'Đang thực hiện')
            REMOVE ct.old_status
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


@admin_publications_bp.route("/cong-trinh/<id>/reject", methods=["PUT"])
def reject_cong_trinh(id):
    conn = get_neo4j_connection()
    try:
        status_res = conn.query_single("MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id RETURN ct.trang_thai AS status", {'id': id})
        if not status_res:
            return jsonify({"status": "error", "message": "Không tìm thấy công trình"}), 404
            
        status = status_res.get('status')
        if status == 'Chờ duyệt':
            conn.write("""
                MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
                SET ct.trang_thai = 'Từ chối'
            """, {"id": id})
            return jsonify({"status": "ok", "message": "Đã từ chối duyệt tạo mới công trình"})
        elif status == 'Yêu cầu xóa' or status == 'Yêu cầu đổi trạng thái':
            conn.write("""
                MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
                SET ct.trang_thai = coalesce(ct.old_status, 'Hoàn thành')
                REMOVE ct.old_status
            """, {"id": id})
            return jsonify({"status": "ok", "message": "Đã từ chối yêu cầu hành động và khôi phục trạng thái cũ"})
        else:
            return jsonify({"status": "error", "message": "Không hỗ trợ từ chối ở trạng thái hiện tại"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
