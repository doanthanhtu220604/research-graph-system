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
        if ten_cong_trinh:
            ten_cong_trinh = " ".join(ten_cong_trinh.split())
        data["ten_cong_trinh"] = ten_cong_trinh

        ten_cong_trinh_vi = data.get("ten_cong_trinh_vi", "")
        if ten_cong_trinh_vi:
            ten_cong_trinh_vi = " ".join(ten_cong_trinh_vi.split()).upper()
        data["ten_cong_trinh_vi"] = ten_cong_trinh_vi

        if not ten_cong_trinh and not ten_cong_trinh_vi:
            return jsonify({"status": "error", "message": "Phải điền ít nhất Tên công trình (tiếng Anh) hoặc Tên công trình (tiếng Việt)"}), 400

        slug = generate_slug(ten_cong_trinh) if ten_cong_trinh else None
        if slug:
            exists_en = conn.query_single("""
                MATCH (ct:CongTrinhNghienCuu)
                WHERE (ct.slug = $slug OR ct.slug_vi = $slug) AND coalesce(ct.is_deleted, false) = false
                RETURN ct.id AS id
            """, {"slug": slug})
            if exists_en:
                return jsonify({"status": "error", "message": "Công trình nghiên cứu với tên tiếng Anh này đã tồn tại trong hệ thống (trùng tên tiếng Anh hoặc tiếng Việt)"}), 400

        # Kiểm tra trùng tên tiếng Việt (nếu có)
        if ten_cong_trinh_vi:
            slug_vi = generate_slug(ten_cong_trinh_vi)
            exists_vi = conn.query_single("""
                MATCH (ct:CongTrinhNghienCuu)
                WHERE (ct.slug = $slug_vi OR ct.slug_vi = $slug_vi) AND coalesce(ct.is_deleted, false) = false
                RETURN ct.id AS id
            """, {"slug_vi": slug_vi})
            if exists_vi:
                return jsonify({"status": "error", "message": "Công trình nghiên cứu với tên tiếng Việt này đã tồn tại trong hệ thống (trùng tên tiếng Anh hoặc tiếng Việt)"}), 400
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
                ten_cong_trinh_vi: toUpper($ten_cong_trinh_vi),
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
        if ten_cong_trinh:
            ten_cong_trinh = " ".join(ten_cong_trinh.split())
        slug = generate_slug(ten_cong_trinh) if ten_cong_trinh else None

        ten_cong_trinh_vi = data.get("ten_cong_trinh_vi", "")
        if ten_cong_trinh_vi:
            ten_cong_trinh_vi = " ".join(ten_cong_trinh_vi.split()).upper()
        slug_vi = generate_slug(ten_cong_trinh_vi) if ten_cong_trinh_vi else None

        if not ten_cong_trinh and not ten_cong_trinh_vi:
            return jsonify({"status": "error", "message": "Phải điền ít nhất Tên công trình (tiếng Anh) hoặc Tên công trình (tiếng Việt)"}), 400

        # Kiểm tra trùng tên tiếng Anh khi cập nhật (loại trừ chính nó)
        if slug:
            exists_en = conn.query_single("""
                MATCH (ct:CongTrinhNghienCuu)
                WHERE (ct.slug = $slug OR ct.slug_vi = $slug) AND ct.id <> $id AND coalesce(ct.is_deleted, false) = false
                RETURN ct.id AS id
            """, {"slug": slug, "id": id})
            if exists_en:
                return jsonify({"status": "error", "message": "Công trình nghiên cứu với tên tiếng Anh này đã tồn tại trong hệ thống (trùng tên tiếng Anh hoặc tiếng Việt)"}), 400

        # Kiểm tra trùng tên tiếng Việt khi cập nhật (loại trừ chính nó)
        if slug_vi:
            exists_vi = conn.query_single("""
                MATCH (ct:CongTrinhNghienCuu)
                WHERE (ct.slug = $slug_vi OR ct.slug_vi = $slug_vi) AND ct.id <> $id AND coalesce(ct.is_deleted, false) = false
                RETURN ct.id AS id
            """, {"slug_vi": slug_vi, "id": id})
            if exists_vi:
                return jsonify({"status": "error", "message": "Công trình nghiên cứu với tên tiếng Việt này đã tồn tại trong hệ thống (trùng tên tiếng Anh hoặc tiếng Việt)"}), 400

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
                ct.ten_cong_trinh_vi = toUpper($ten_cong_trinh_vi),
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
            SET ct.trang_thai = CASE
                WHEN ct.old_status IS NOT NULL AND trim(ct.old_status) <> '' THEN ct.old_status
                ELSE 'Đang thực hiện'
            END
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


@admin_publications_bp.route("/cong-trinh", methods=["GET"])
def get_all_cong_trinh():
    """Lấy danh sách tất cả công trình nghiên cứu cho Admin (bao gồm cả chờ duyệt, từ chối, v.v., không bao gồm đã xóa mềm)."""
    conn = get_neo4j_connection()
    try:
        results = conn.query("""
            MATCH (ct:CongTrinhNghienCuu)
            WHERE coalesce(ct.is_deleted, false) = false
            OPTIONAL MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct)
            WHERE coalesce(gv.is_deleted, false) = false
            OPTIONAL MATCH (tgn:TacGiaNgoai)-[:TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(ct)
            WHERE coalesce(tgn.trang_thai, 'Đã duyệt') = 'Đã duyệt'
            RETURN ct,
                   collect(DISTINCT gv.ho_va_ten) AS tac_gia,
                   collect(DISTINCT tgn.ho_va_ten) AS tac_gia_ngoai
            ORDER BY
                CASE WHEN ct.trang_thai IN ['Chờ duyệt', 'Yêu cầu xóa', 'Yêu cầu khôi phục', 'Yêu cầu đổi trạng thái'] THEN 0 ELSE 1 END ASC,
                CASE WHEN ct.trang_thai IN ['Chờ duyệt', 'Yêu cầu xóa', 'Yêu cầu khôi phục', 'Yêu cầu đổi trạng thái'] THEN coalesce(ct.created_at, 0) ELSE 0 END DESC,
                toInteger(ct.nam_xuat_ban) DESC,
                id(ct) DESC
        """)
        cong_trinh_list = []
        for r in results:
            ct = dict(r["ct"])
            ct["tac_gia"] = [t for t in (r["tac_gia"] or []) if t]
            ct["tac_gia_ngoai"] = [t for t in (r["tac_gia_ngoai"] or []) if t]
            cong_trinh_list.append(ct)
        return jsonify({"status": "ok", "data": cong_trinh_list})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_publications_bp.route("/cong-trinh/<id>", methods=["GET"])
def get_cong_trinh_detail(id):
    """Lấy chi tiết công trình nghiên cứu cho Admin (bao gồm cả trạng thái chưa duyệt)."""
    conn = get_neo4j_connection()
    try:
        result = conn.query_single("""
            MATCH (ct:CongTrinhNghienCuu) 
            WHERE ct.id = $id AND coalesce(ct.is_deleted, false) = false
            OPTIONAL MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct)
            RETURN ct, collect(CASE WHEN gv IS NOT NULL THEN {id: gv.id, ten: gv.ho_va_ten, vai_tro: type(r), is_deleted: coalesce(gv.is_deleted, false)} END) AS tac_gia
        """, {"id": id})

        tac_gia_ngoai_res = conn.query("""
            MATCH (tgn:TacGiaNgoai)-[r:TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(ct:CongTrinhNghienCuu)
            WHERE ct.id = $id
            RETURN tgn.ho_va_ten AS ten, tgn.don_vi_cong_tac AS don_vi, type(r) AS vai_tro, coalesce(tgn.trang_thai, 'Đã duyệt') AS trang_thai
        """, {"id": id})
        
        if not result or not result.get("ct"):
            return jsonify({"status": "error", "message": "Không tìm thấy công trình"}), 404
            
        data = dict(result["ct"])
        data["tac_gia"] = result["tac_gia"]
        data["tac_gia_ngoai"] = [
            {"ten": r["ten"], "don_vi": r["don_vi"], "vai_tro": r["vai_tro"], "trang_thai": r["trang_thai"]} for r in tac_gia_ngoai_res
        ]
        return jsonify({"status": "ok", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

