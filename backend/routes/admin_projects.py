"""
Admin API - Quản lý Đề tài Nghiên cứu
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_projects_bp = Blueprint("admin_projects_api", __name__)

@admin_projects_bp.route("/de-tai", methods=["POST"])
def create_de_tai():
    data = request.json
    chu_nhiem_ids = data.pop("chu_nhiem_ids", [])
    tham_gia_ids  = data.pop("tham_gia_ids", [])
    tac_gia_ngoai_ids = data.pop("tac_gia_ngoai_ids", [])
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (dt:DeTaiNghienCuu {
                ten_de_tai: $ten_de_tai,
                cap_de_tai: $cap_de_tai,
                nam_bat_dau: $nam_bat_dau,
                nam_ket_thuc: $nam_ket_thuc,
                tom_tat: $tom_tat,
                trang_thai: coalesce($trang_thai, 'Đang thực hiện'),
                link: $link,
                created_at: timestamp()
            })
            SET dt.id = 'dt_' + toString(id(dt))
            RETURN dt.id AS id
        """, data)
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
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id
            SET dt.ten_de_tai = $ten_de_tai,
                dt.cap_de_tai = $cap_de_tai,
                dt.nam_bat_dau = $nam_bat_dau,
                dt.nam_ket_thuc = $nam_ket_thuc,
                dt.tom_tat = $tom_tat,
                dt.trang_thai = coalesce($trang_thai, 'Hoàn thành'),
                dt.link = $link
        """, {"id": id, **data})
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_projects_bp.route("/de-tai/<id>/approve", methods=["PUT"])
def approve_de_tai(id):
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id
            SET dt.trang_thai = 'Đang thực hiện'
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
