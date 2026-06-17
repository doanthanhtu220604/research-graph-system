"""
Admin API - Quản lý Đề tài Nghiên cứu
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection, generate_slug

admin_projects_bp = Blueprint("admin_projects_api", __name__)

@admin_projects_bp.route("/de-tai", methods=["POST"])
def create_de_tai():
    data = request.json
    chu_nhiem_ids = data.pop("chu_nhiem_ids", [])
    tham_gia_ids  = data.pop("tham_gia_ids", [])
    # Loại bỏ trùng lặp: nếu là chủ nhiệm thì không làm thành viên tham gia
    tham_gia_ids  = [x for x in tham_gia_ids if x not in chu_nhiem_ids]
    tac_gia_ngoai_ids = data.pop("tac_gia_ngoai_ids", [])
    nam_val = data.pop("nam", None) or data.pop("nam_bat_dau", None) or data.pop("nam_ket_thuc", None)
    data["nam"] = int(nam_val) if nam_val is not None and str(nam_val).isdigit() else None
    
    conn = get_neo4j_connection()
    try:
        ten_de_tai = data.get("ten_de_tai", "")
        ten_de_tai = " ".join(ten_de_tai.split())
        data["ten_de_tai"] = ten_de_tai
        if not ten_de_tai:
            return jsonify({"status": "error", "message": "Tên đề tài không được để trống"}), 400

        slug = generate_slug(ten_de_tai)
        exists = conn.query_single("""
            MATCH (dt:DeTaiNghienCuu)
            WHERE dt.slug = $slug AND coalesce(dt.is_deleted, false) = false
            RETURN dt.id AS id
        """, {"slug": slug})
        if exists:
            return jsonify({"status": "error", "message": "Đề tài nghiên cứu với tên này đã tồn tại trong hệ thống"}), 400

        result = conn.write("""
            CREATE (dt:DeTaiNghienCuu {
                ten_de_tai: toUpper($ten_de_tai),
                slug: $slug,
                cap_de_tai: toUpper($cap_de_tai),
                nam: $nam,
                tom_tat: $tom_tat,
                trang_thai: coalesce($trang_thai, 'Đang thực hiện'),
                link: $link
            })
            SET dt.id = 'dt_' + toString(id(dt))
            RETURN dt.id AS id
        """, {**data, "slug": slug})
        new_id = result[0]["id"]

        # Gán Chủ nhiệm
        if chu_nhiem_ids:
            conn.write("""
                UNWIND $gv_ids AS gv_id
                MATCH (gv:GiangVien), (dt:DeTaiNghienCuu)
                WHERE gv.id = gv_id AND dt.id = $dt_id
                MERGE (gv)-[:CHU_NHIEM]->(dt)
            """, {"dt_id": new_id, "gv_ids": chu_nhiem_ids})

        # Gán Thành viên
        if tham_gia_ids:
            conn.write("""
                UNWIND $gv_ids AS gv_id
                MATCH (gv:GiangVien), (dt:DeTaiNghienCuu)
                WHERE gv.id = gv_id AND dt.id = $dt_id
                MERGE (gv)-[:THAM_GIA]->(dt)
            """, {"dt_id": new_id, "gv_ids": tham_gia_ids})

        # Gán tác giả ngoài
        if tac_gia_ngoai_ids:
            conn.write("""
                UNWIND $tgn_ids AS tgn_id
                MATCH (tgn:TacGiaNgoai), (dt:DeTaiNghienCuu)
                WHERE tgn.id = tgn_id AND dt.id = $dt_id
                MERGE (tgn)-[:DONG_TAC_GIA]->(dt)
            """, {"dt_id": new_id, "tgn_ids": tac_gia_ngoai_ids})

        return jsonify({"status": "ok", "message": "Thêm đề tài thành công", "id": new_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_projects_bp.route("/de-tai/<id>", methods=["PUT"])
def update_de_tai(id):
    data = dict(request.json)
    nam_val = data.pop("nam", None) or data.pop("nam_bat_dau", None) or data.pop("nam_ket_thuc", None)
    data["nam"] = int(nam_val) if nam_val is not None and str(nam_val).isdigit() else None
    ten_de_tai = data.get("ten_de_tai", "")
    ten_de_tai = " ".join(ten_de_tai.split())
    data["ten_de_tai"] = ten_de_tai
    slug = generate_slug(ten_de_tai)
    
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id
            SET dt.ten_de_tai = toUpper($ten_de_tai),
                dt.slug = $slug,
                dt.cap_de_tai = toUpper($cap_de_tai),
                dt.nam = $nam,
                dt.tom_tat = $tom_tat,
                dt.trang_thai = coalesce($trang_thai, 'Hoàn thành'),
                dt.link = $link
        """, {"id": id, **data, "slug": slug})
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_projects_bp.route("/de-tai/<id>/approve", methods=["PUT"])
def approve_de_tai(id):
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id
            SET dt.trang_thai = CASE
                WHEN dt.old_status IS NOT NULL AND trim(dt.old_status) <> '' THEN dt.old_status
                ELSE 'Đang thực hiện'
            END
            REMOVE dt.old_status
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Duyệt đề tài thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_projects_bp.route("/de-tai/<id>", methods=["DELETE"])
def delete_de_tai(id):
    conn = get_neo4j_connection()
    try:
        from flask import request as _req
        note = _req.json.get("note", "") if _req.is_json else ""
        
        # Kiểm tra trạng thái trước khi xóa
        status_res = conn.query_single("MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id RETURN dt.trang_thai AS status", {'id': id})
        if status_res and status_res.get('status') == 'Đang thực hiện':
            return jsonify({'status': 'error', 'message': 'Không thể xóa đề tài đang thực hiện. Vui lòng chuyển trạng thái sang "Hoàn thành" trước khi xóa.'}), 400

        result = conn.write("""
            MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id AND coalesce(dt.is_deleted, false) = false
            SET dt.is_deleted   = true,
                dt.deleted_at   = timestamp(),
                dt.deleted_note = $note,
                dt.old_status   = dt.trang_thai
            RETURN dt.id AS id
        """, {"id": id, "note": note})
        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy đề tài"}), 404
        return jsonify({"status": "ok", "message": "Đã chuyển vào thùng rác"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_projects_bp.route("/de-tai/<id>/approve-delete", methods=["PUT"])
def approve_delete_de_tai(id):
    conn = get_neo4j_connection()
    try:
        # Khi phê duyệt xóa, ta không cần check trạng thái vì giảng viên đã gửi yêu cầu xóa 
        # (và giảng viên đã bị chặn nếu status là 'Đang thực hiện' ở lecturer_api)
        conn.write("""
            MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id
            SET dt.is_deleted = true,
                dt.deleted_at = timestamp(),
                dt.old_status = CASE WHEN dt.trang_thai = 'Yêu cầu xóa' THEN 'Hoàn thành' ELSE dt.trang_thai END,
                dt.trang_thai = 'Đã vào thùng rác'
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Đã phê duyệt xóa đề tài. Đề tài đã được chuyển vào thùng rác."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_projects_bp.route("/de-tai/<id>/reject", methods=["PUT"])
def reject_de_tai(id):
    conn = get_neo4j_connection()
    try:
        status_res = conn.query_single("MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id RETURN dt.trang_thai AS status", {'id': id})
        if not status_res:
            return jsonify({"status": "error", "message": "Không tìm thấy đề tài"}), 404
            
        status = status_res.get('status')
        if status == 'Chờ duyệt':
            conn.write("""
                MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id
                SET dt.trang_thai = 'Từ chối'
            """, {"id": id})
            return jsonify({"status": "ok", "message": "Đã từ chối duyệt tạo mới đề tài"})
        elif status == 'Yêu cầu xóa' or status == 'Yêu cầu đổi trạng thái':
            conn.write("""
                MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id
                SET dt.trang_thai = coalesce(dt.old_status, 'Hoàn thành')
                REMOVE dt.old_status
            """, {"id": id})
            return jsonify({"status": "ok", "message": "Đã từ chối yêu cầu hành động và khôi phục trạng thái cũ"})
        else:
            return jsonify({"status": "error", "message": "Không hỗ trợ từ chối ở trạng thái hiện tại"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_projects_bp.route("/de-tai", methods=["GET"])
def get_all_de_tai():
    """Lấy danh sách tất cả đề tài nghiên cứu cho Admin (bao gồm cả chưa duyệt, từ chối, v.v., không bao gồm đã xóa mềm)."""
    conn = get_neo4j_connection()
    try:
        results = conn.query("""
            MATCH (dt:DeTaiNghienCuu)
            WHERE coalesce(dt.is_deleted, false) = false
            OPTIONAL MATCH (gv_cn:GiangVien)-[:CHU_NHIEM]->(dt)
            WHERE coalesce(gv_cn.is_deleted, false) = false
            OPTIONAL MATCH (gv_tv:GiangVien)-[:THAM_GIA]->(dt)
            WHERE coalesce(gv_tv.is_deleted, false) = false
            OPTIONAL MATCH (tgn:TacGiaNgoai)-[:CHU_NHIEM|THAM_GIA|DONG_TAC_GIA]->(dt)
            WHERE coalesce(tgn.trang_thai, 'Đã duyệt') = 'Đã duyệt'
            RETURN dt,
                   collect(DISTINCT gv_cn.ho_va_ten) AS chu_nhiem,
                   collect(DISTINCT gv_tv.ho_va_ten) AS thanh_vien,
                   collect(DISTINCT tgn.ho_va_ten)   AS tac_gia_ngoai
            ORDER BY toInteger(dt.nam) DESC,
                     coalesce(dt.created_at, 0) DESC,
                     id(dt) DESC
        """)
        de_tai_list = []
        for r in results:
            dt = dict(r["dt"])
            if "nam" in dt:
                dt["nam_bat_dau"] = dt["nam"]
                dt["nam_ket_thuc"] = dt["nam"]
                dt["nam_thuc_hien"] = str(dt["nam"])
            dt["chu_nhiem"]    = [t for t in (r["chu_nhiem"] or []) if t]
            dt["thanh_vien"]   = [t for t in (r["thanh_vien"] or []) if t]
            dt["tac_gia_ngoai"] = [t for t in (r["tac_gia_ngoai"] or []) if t]
            de_tai_list.append(dt)
        return jsonify({"status": "ok", "data": de_tai_list})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_projects_bp.route("/de-tai/<id>", methods=["GET"])
def get_de_tai_detail(id):
    """Lấy chi tiết đề tài nghiên cứu cho Admin (bao gồm cả trạng thái chưa duyệt)."""
    conn = get_neo4j_connection()
    try:
        result = conn.query_single("""
            MATCH (dt:DeTaiNghienCuu) 
            WHERE dt.id = $id AND coalesce(dt.is_deleted, false) = false
            OPTIONAL MATCH (gv:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt)
            RETURN dt, collect(CASE WHEN gv IS NOT NULL THEN {id: gv.id, ten: gv.ho_va_ten, vai_tro: type(r), is_deleted: coalesce(gv.is_deleted, false)} END) AS thanh_vien
        """, {"id": id})

        tac_gia_ngoai_res = conn.query("""
            MATCH (tgn:TacGiaNgoai)-[r:CHU_NHIEM|THAM_GIA|DONG_TAC_GIA]->(dt:DeTaiNghienCuu)
            WHERE dt.id = $id
            RETURN tgn.ho_va_ten AS ten, tgn.don_vi_cong_tac AS don_vi, type(r) AS vai_tro, coalesce(tgn.trang_thai, 'Đã duyệt') AS trang_thai
        """, {"id": id})

        if not result or not result.get("dt"):
            return jsonify({"status": "error", "message": "Không tìm thấy đề tài"}), 404
            
        data = dict(result["dt"])
        if "nam" in data:
            data["nam_bat_dau"] = data["nam"]
            data["nam_ket_thuc"] = data["nam"]
            data["nam_thuc_hien"] = str(data["nam"])
        data["thanh_vien"] = result["thanh_vien"]
        data["tac_gia_ngoai"] = [
            {"ten": r["ten"], "don_vi": r["don_vi"], "vai_tro": r["vai_tro"], "trang_thai": r["trang_thai"]} for r in tac_gia_ngoai_res
        ]
        return jsonify({"status": "ok", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

