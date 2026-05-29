"""
Admin API - Quản lý Giảng viên
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_lecturers_bp = Blueprint("admin_lecturers_api", __name__)

def clean_str(val, default=""):
    if val is None:
        return default
    return str(val).strip()

@admin_lecturers_bp.route("/giang-vien", methods=["POST"])
def create_giang_vien():
    data = request.json or {}
    conn = get_neo4j_connection()
    try:
        ma_gv = clean_str(data.get("ma_gv"))
        ho_va_ten = clean_str(data.get("ho_va_ten"))
        email = clean_str(data.get("email"))

        if not ma_gv:
            return jsonify({"status": "error", "message": "Mã giảng viên không được để trống hoặc chỉ chứa khoảng trắng."}), 400
        if not ho_va_ten:
            return jsonify({"status": "error", "message": "Họ và tên không được để trống hoặc chỉ chứa khoảng trắng."}), 400
        if not email:
            return jsonify({"status": "error", "message": "Email không được để trống hoặc chỉ chứa khoảng trắng."}), 400

        # Kiểm tra trùng lặp mã giảng viên hoặc email
        check_query = """
            MATCH (gv:GiangVien)
            WHERE gv.ma_gv = $ma_gv OR (gv.email = $email AND $email <> "")
            RETURN gv.id AS id, gv.ma_gv AS ma_gv, gv.email AS email
        """
        dup = conn.query(check_query, {"ma_gv": ma_gv, "email": email})
        if dup:
            for d in dup:
                if d["ma_gv"] == ma_gv:
                    return jsonify({"status": "error", "message": f"Mã giảng viên '{ma_gv}' đã tồn tại trong hệ thống."}), 400
                if email and d["email"] == email:
                    return jsonify({"status": "error", "message": f"Email '{email}' đã tồn tại trong hệ thống."}), 400

        props = {
            "ma_gv": ma_gv,
            "ho_va_ten": ho_va_ten,
            "hoc_vi": clean_str(data.get("hoc_vi")),
            "chuc_danh": clean_str(data.get("chuc_danh")),
            "chuc_vu": clean_str(data.get("chuc_vu")),
            "email": email,
            "dien_thoai": clean_str(data.get("dien_thoai")),
            "chuyen_nganh": clean_str(data.get("chuyen_nganh")),
            "trang_thai_cong_tac": clean_str(data.get("trang_thai_cong_tac"), "Đang công tác"),
            "anh_dai_dien": clean_str(data.get("anh_dai_dien"))
        }

        # Tạo Node GiangVien
        result = conn.write("""
            CREATE (gv:GiangVien {
                ma_gv: $ma_gv,
                ho_va_ten: $ho_va_ten,
                hoc_vi: $hoc_vi,
                chuc_danh: $chuc_danh,
                chuc_vu: $chuc_vu,
                email: $email,
                dien_thoai: $dien_thoai,
                chuyen_nganh: $chuyen_nganh,
                trang_thai_cong_tac: $trang_thai_cong_tac,
                anh_dai_dien: $anh_dai_dien
            })
            SET gv.id = 'gv_' + toString(id(gv))
            RETURN gv.id AS id
        """, props)
        gv_id = result[0]["id"] if result else None

        # Thiết lập quan hệ Bộ môn (nếu có)
        if data.get("bo_mon"):
            conn.write("""
                MATCH (gv:GiangVien) WHERE gv.id = $gv_id
                MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                ON CREATE SET bm.id = 'bm_' + toString(id(bm)),
                             bm.created_at = timestamp()
                MERGE (gv)-[:THUOC_BO_MON]->(bm)
            """, {"gv_id": gv_id, "bo_mon": data.get("bo_mon")})

        # Thiết lập quan hệ Lĩnh vực nghiên cứu (nếu có)
        if data.get("linh_vuc_ids"):
            for lv_id in data["linh_vuc_ids"]:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE gv.id = $gv_id
                    MATCH (lv:LinhVucNghienCuu) WHERE lv.id = $lv_id
                    MERGE (gv)-[:NGHIEN_CUU]->(lv)
                """, {"gv_id": gv_id, "lv_id": lv_id})
        
        if data.get("linh_vuc_names"):
            for lv_name in data["linh_vuc_names"]:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE gv.id = $gv_id
                    MERGE (lv:LinhVucNghienCuu {ten_linh_vuc: $lv_name})
                    ON CREATE SET lv.id = 'lv_' + toString(id(lv))
                    MERGE (gv)-[:NGHIEN_CUU]->(lv)
                """, {"gv_id": gv_id, "lv_name": lv_name})

        return jsonify({"status": "ok", "message": "Thêm giảng viên thành công", "id": gv_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_lecturers_bp.route("/giang-vien/<id>", methods=["PUT"])
def update_giang_vien(id):
    data = request.json or {}
    conn = get_neo4j_connection()
    try:
        ma_gv = clean_str(data.get("ma_gv"))
        ho_va_ten = clean_str(data.get("ho_va_ten"))
        email = clean_str(data.get("email"))

        if not ma_gv:
            return jsonify({"status": "error", "message": "Mã giảng viên không được để trống hoặc chỉ chứa khoảng trắng."}), 400
        if not ho_va_ten:
            return jsonify({"status": "error", "message": "Họ và tên không được để trống hoặc chỉ chứa khoảng trắng."}), 400
        if not email:
            return jsonify({"status": "error", "message": "Email không được để trống hoặc chỉ chứa khoảng trắng."}), 400

        # Kiểm tra trùng lặp mã giảng viên hoặc email với giảng viên khác
        check_query = """
            MATCH (gv:GiangVien)
            WHERE gv.id <> $id AND (gv.ma_gv = $ma_gv OR (gv.email = $email AND $email <> ""))
            RETURN gv.id AS id, gv.ma_gv AS ma_gv, gv.email AS email
        """
        dup = conn.query(check_query, {"id": id, "ma_gv": ma_gv, "email": email})
        if dup:
            for d in dup:
                if d["ma_gv"] == ma_gv:
                    return jsonify({"status": "error", "message": f"Mã giảng viên '{ma_gv}' đã tồn tại ở một giảng viên khác."}), 400
                if email and d["email"] == email:
                    return jsonify({"status": "error", "message": f"Email '{email}' đã tồn tại ở một giảng viên khác."}), 400

        props = {
            "id": id,
            "ma_gv": ma_gv,
            "ho_va_ten": ho_va_ten,
            "hoc_vi": clean_str(data.get("hoc_vi")),
            "chuc_danh": clean_str(data.get("chuc_danh")),
            "chuc_vu": clean_str(data.get("chuc_vu")),
            "email": email,
            "dien_thoai": clean_str(data.get("dien_thoai")),
            "chuyen_nganh": clean_str(data.get("chuyen_nganh")),
            "trang_thai_cong_tac": clean_str(data.get("trang_thai_cong_tac"), "Đang công tác"),
            "anh_dai_dien": clean_str(data.get("anh_dai_dien"))
        }

        conn.write("""
            MATCH (gv:GiangVien) WHERE gv.id = $id
            SET gv.ma_gv = $ma_gv,
                gv.ho_va_ten = $ho_va_ten,
                gv.hoc_vi = $hoc_vi,
                gv.chuc_danh = $chuc_danh,
                gv.chuc_vu = $chuc_vu,
                gv.email = $email,
                gv.dien_thoai = $dien_thoai,
                gv.chuyen_nganh = $chuyen_nganh,
                gv.trang_thai_cong_tac = $trang_thai_cong_tac,
                gv.anh_dai_dien = $anh_dai_dien
        """, props)

        if "bo_mon" in data:
            # Xóa quan hệ bộ môn cũ
            conn.write("""
                MATCH (gv:GiangVien)-[r:THUOC_BO_MON]->(:BoMon)
                WHERE gv.id = $id
                DELETE r
            """, {"id": id})

            # Tạo quan hệ bộ môn mới (nếu có dữ liệu)
            if data["bo_mon"]:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE gv.id = $id
                    MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                    ON CREATE SET bm.id = 'bm_' + toString(id(bm)),
                                 bm.created_at = timestamp()
                    MERGE (gv)-[:THUOC_BO_MON]->(bm)
                """, {"id": id, "bo_mon": data.get("bo_mon")})

        # Cập nhật quan hệ Lĩnh vực nghiên cứu
        if "linh_vuc_ids" in data or "linh_vuc_names" in data:
            # Xóa quan hệ lĩnh vực cũ
            conn.write("""
                MATCH (gv:GiangVien)-[r:NGHIEN_CUU]->(:LinhVucNghienCuu)
                WHERE gv.id = $id
                DELETE r
            """, {"id": id})

            # Tạo quan hệ lĩnh vực mới theo IDs
            if "linh_vuc_ids" in data:
                for lv_id in data["linh_vuc_ids"]:
                    conn.write("""
                        MATCH (gv:GiangVien) WHERE gv.id = $id
                        MATCH (lv:LinhVucNghienCuu) WHERE lv.id = $lv_id
                        MERGE (gv)-[:NGHIEN_CUU]->(lv)
                    """, {"id": id, "lv_id": lv_id})
            
            # Tạo quan hệ lĩnh vực mới theo Tên
            if "linh_vuc_names" in data:
                for lv_name in data["linh_vuc_names"]:
                    conn.write("""
                        MATCH (gv:GiangVien) WHERE gv.id = $id
                        MERGE (lv:LinhVucNghienCuu {ten_linh_vuc: $lv_name})
                        ON CREATE SET lv.id = 'lv_' + toString(id(lv))
                        MERGE (gv)-[:NGHIEN_CUU]->(lv)
                    """, {"id": id, "lv_name": lv_name})

        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
@admin_lecturers_bp.route("/giang-vien/<id>", methods=["DELETE"])
def delete_giang_vien(id):
    conn = get_neo4j_connection()
    try:
        from flask import request as _req
        note = _req.json.get("note", "") if _req.is_json else ""
        result = conn.write("""
            MATCH (gv:GiangVien) WHERE gv.id = $id AND coalesce(gv.is_deleted, false) = false
            SET gv.is_deleted   = true,
                gv.deleted_at   = timestamp(),
                gv.deleted_note = $note
            RETURN gv.id AS id
        """, {"id": id, "note": note})
        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy giảng viên"}), 404
        return jsonify({"status": "ok", "message": "Đã chuyển vào thùng rác"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_lecturers_bp.route("/giang-vien/<id>/approve-profile", methods=["PUT"])
def approve_profile_update(id):
    conn = get_neo4j_connection()
    try:
        # Check if the lecturer exists and has pending changes
        gv = conn.query_single("""
            MATCH (g:GiangVien) WHERE g.id = $id
            RETURN g.pending_ho_va_ten AS ho_va_ten,
                   g.pending_email AS email,
                   g.pending_anh_dai_dien AS anh_dai_dien,
                   g.pending_dien_thoai AS dien_thoai,
                   g.pending_hoc_vi AS hoc_vi,
                   g.pending_chuc_danh AS chuc_danh,
                   g.pending_chuc_vu AS chuc_vu,
                   g.pending_chuyen_nganh AS chuyen_nganh,
                   g.pending_bo_mon AS bo_mon,
                   g.pending_linh_vuc AS linh_vuc,
                   g.profile_edit_status AS profile_edit_status
        """, {'id': id})

        if not gv or gv.get('profile_edit_status') != 'Chờ duyệt':
            return jsonify({'status': 'error', 'message': 'Không tìm thấy yêu cầu chỉnh sửa thông tin chờ duyệt.'}), 404

        # Update the properties
        params = dict(gv)
        params['id'] = id
        conn.write("""
            MATCH (g:GiangVien) WHERE g.id = $id
            SET g.ho_va_ten = coalesce($ho_va_ten, g.ho_va_ten),
                g.email = coalesce($email, g.email),
                g.anh_dai_dien = coalesce($anh_dai_dien, g.anh_dai_dien),
                g.dien_thoai = $dien_thoai,
                g.hoc_vi = $hoc_vi,
                g.chuc_danh = $chuc_danh,
                g.chuc_vu = $chuc_vu,
                g.chuyen_nganh = $chuyen_nganh,
                g.profile_edit_status = 'Phê duyệt',
                g.pending_ho_va_ten = null,
                g.pending_email = null,
                g.pending_anh_dai_dien = null,
                g.pending_dien_thoai = null,
                g.pending_hoc_vi = null,
                g.pending_chuc_danh = null,
                g.pending_chuc_vu = null,
                g.pending_chuyen_nganh = null,
                g.pending_bo_mon = null,
                g.pending_linh_vuc = null
        """, params)

        # Update Department
        if 'bo_mon' in gv:
            conn.write("""
                MATCH (g:GiangVien)-[r:THUOC_BO_MON]->(:BoMon) WHERE g.id = $id DELETE r
            """, {'id': id})
            if gv['bo_mon']:
                conn.write("""
                    MATCH (g:GiangVien) WHERE g.id = $id
                    MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                    ON CREATE SET bm.id = 'bm_' + toString(id(bm)), bm.created_at = timestamp()
                    MERGE (g)-[:THUOC_BO_MON]->(bm)
                """, {'id': id, 'bo_mon': gv['bo_mon']})

        # Update Research Fields
        if 'linh_vuc' in gv:
            conn.write("""
                MATCH (g:GiangVien)-[r:NGHIEN_CUU]->(:LinhVucNghienCuu) WHERE g.id = $id DELETE r
            """, {'id': id})
            for lv_name in (gv['linh_vuc'] or []):
                if lv_name:
                    conn.write("""
                        MATCH (g:GiangVien) WHERE g.id = $id
                        MERGE (lv:LinhVucNghienCuu {ten_linh_vuc: $lv_name})
                        ON CREATE SET lv.id = 'lv_' + toString(id(lv))
                        MERGE (g)-[:NGHIEN_CUU]->(lv)
                    """, {'id': id, 'lv_name': lv_name})

        return jsonify({'status': 'ok', 'message': 'Phê duyệt thông tin giảng viên thành công.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_lecturers_bp.route("/giang-vien/<id>/reject-profile", methods=["PUT"])
def reject_profile_update(id):
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            MATCH (g:GiangVien) WHERE g.id = $id AND g.profile_edit_status = 'Chờ duyệt'
            SET g.profile_edit_status = 'Từ chối',
                g.pending_ho_va_ten = null,
                g.pending_email = null,
                g.pending_anh_dai_dien = null,
                g.pending_dien_thoai = null,
                g.pending_hoc_vi = null,
                g.pending_chuc_danh = null,
                g.pending_chuc_vu = null,
                g.pending_chuyen_nganh = null,
                g.pending_bo_mon = null,
                g.pending_linh_vuc = null
            RETURN g.id AS id
        """, {'id': id})

        if not result:
            return jsonify({'status': 'error', 'message': 'Không tìm thấy yêu cầu chỉnh sửa thông tin chờ duyệt.'}), 404

        return jsonify({'status': 'ok', 'message': 'Đã từ chối các thay đổi thông tin giảng viên.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
