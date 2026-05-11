"""
Admin API - Thùng rác (Soft Delete)
Hỗ trợ xóa mềm (soft delete), xem danh sách thùng rác, khôi phục và xóa vĩnh viễn
cho các loại node: GiangVien, CongTrinhNghienCuu, DeTaiNghienCuu.
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_trash_bp = Blueprint("admin_trash_api", __name__)


# ─────────────────────────────────────────────────────────────
# SOFT DELETE  (chuyển vào thùng rác)
# ─────────────────────────────────────────────────────────────

@admin_trash_bp.route("/trash/<entity_type>/<id>", methods=["DELETE"])
def soft_delete(entity_type, id):
    """
    Đánh dấu node là đã xóa (is_deleted=true) thay vì DETACH DELETE thật sự.
    entity_type: 'giang-vien' | 'cong-trinh' | 'de-tai'
    """
    label_map = {
        "giang-vien": "GiangVien",
        "cong-trinh": "CongTrinhNghienCuu",
        "de-tai":     "DeTaiNghienCuu",
        "linh-vuc":   "LinhVucNghienCuu",
        "tac-gia-ngoai": "TacGiaNgoai",
        "bo-mon": "BoMon"
    }
    label = label_map.get(entity_type)
    if not label:
        return jsonify({"status": "error", "message": f"Loại entity '{entity_type}' không hợp lệ"}), 400

    conn = get_neo4j_connection()
    try:
        result = conn.write(f"""
            MATCH (n:{label}) WHERE n.id = $id AND coalesce(n.is_deleted, false) = false
            SET n.is_deleted   = true,
                n.deleted_at   = timestamp(),
                n.deleted_note = coalesce($note, '')
            RETURN n.id AS id
        """, {"id": id, "note": request.json.get("note", "") if request.is_json else ""})

        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy hoặc đã bị xóa"}), 404

        return jsonify({"status": "ok", "message": "Đã chuyển vào thùng rác"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# LIST TRASH  (danh sách thùng rác)
# ─────────────────────────────────────────────────────────────

@admin_trash_bp.route("/trash", methods=["GET"])
def list_trash():
    """Lấy tất cả node đã bị xóa mềm, phân theo loại."""
    conn = get_neo4j_connection()
    try:
        items = []

        # Giảng viên
        gv_list = conn.query("""
            MATCH (n:GiangVien) WHERE n.is_deleted = true
            RETURN n.id AS id, n.ho_va_ten AS ten, n.hoc_vi AS hoc_vi,
                   n.deleted_at AS deleted_at, n.deleted_note AS note,
                   n.trang_thai AS trang_thai,
                   'giang-vien' AS type
            ORDER BY n.deleted_at DESC
        """)
        for r in gv_list:
            items.append({
                "id":         r["id"],
                "ten":        r["ten"] or "N/A",
                "sub":        r["hoc_vi"] or "",
                "type":       "giang-vien",
                "type_label": "Giảng viên",
                "deleted_at": r["deleted_at"],
                "note":       r["note"] or "",
                "trang_thai": r["trang_thai"] or ""
            })

        # Công trình
        ct_list = conn.query("""
            MATCH (n:CongTrinhNghienCuu) WHERE n.is_deleted = true
            RETURN n.id AS id, n.ten_cong_trinh AS ten, n.nam_xuat_ban AS nam,
                   n.deleted_at AS deleted_at, n.deleted_note AS note,
                   n.trang_thai AS trang_thai,
                   'cong-trinh' AS type
            ORDER BY n.deleted_at DESC
        """)
        for r in ct_list:
            items.append({
                "id":         r["id"],
                "ten":        r["ten"] or "N/A",
                "sub":        f"Năm: {r['nam']}" if r["nam"] else "",
                "type":       "cong-trinh",
                "type_label": "Công trình",
                "deleted_at": r["deleted_at"],
                "note":       r["note"] or "",
                "trang_thai": r["trang_thai"] or ""
            })

        # Đề tài
        dt_list = conn.query("""
            MATCH (n:DeTaiNghienCuu) WHERE n.is_deleted = true
            RETURN n.id AS id, n.ten_de_tai AS ten, n.cap_de_tai AS cap,
                   n.deleted_at AS deleted_at, n.deleted_note AS note,
                   n.trang_thai AS trang_thai,
                   'de-tai' AS type
            ORDER BY n.deleted_at DESC
        """)
        for r in dt_list:
            items.append({
                "id":         r["id"],
                "ten":        r["ten"] or "N/A",
                "sub":        r["cap"] or "",
                "type":       "de-tai",
                "type_label": "Đề tài",
                "deleted_at": r["deleted_at"],
                "note":       r["note"] or "",
                "trang_thai": r["trang_thai"] or ""
            })

        # Lĩnh vực nghiên cứu
        lv_list = conn.query("""
            MATCH (n:LinhVucNghienCuu) WHERE n.is_deleted = true
            RETURN id(n) AS id, n.ten_linh_vuc AS ten,
                   n.deleted_at AS deleted_at, n.deleted_note AS note,
                   'linh-vuc' AS type
            ORDER BY n.deleted_at DESC
        """)
        for r in lv_list:
            items.append({
                "id":         str(r["id"]),
                "ten":        r["ten"] or "N/A",
                "sub":        "Lĩnh vực nghiên cứu",
                "type":       "linh-vuc",
                "type_label": "Lĩnh vực",
                "deleted_at": r["deleted_at"],
                "note":       r["note"] or "",
            })

        # Tác giả ngoài
        tgn_list = conn.query("""
            MATCH (n:TacGiaNgoai) WHERE n.is_deleted = true
            RETURN n.id AS id, n.ho_va_ten AS ten, n.don_vi_cong_tac AS don_vi,
                   n.deleted_at AS deleted_at, n.deleted_note AS note,
                   'tac-gia-ngoai' AS type
            ORDER BY n.deleted_at DESC
        """)
        for r in tgn_list:
            items.append({
                "id":         r["id"],
                "ten":        r["ten"] or "N/A",
                "sub":        r["don_vi"] or "Tác giả ngoài",
                "type":       "tac-gia-ngoai",
                "type_label": "Tác giả ngoài",
                "deleted_at": r["deleted_at"],
                "note":       r["note"] or "",
            })

        # Bộ môn
        bm_list = conn.query("""
            MATCH (n:BoMon) WHERE n.is_deleted = true
            RETURN n.id AS id, n.ten_bo_mon AS ten,
                   n.deleted_at AS deleted_at, n.deleted_note AS note,
                   'bo-mon' AS type
            ORDER BY n.deleted_at DESC
        """)
        for r in bm_list:
            items.append({
                "id":         r["id"],
                "ten":        r["ten"] or "N/A",
                "sub":        "Bộ môn",
                "type":       "bo-mon",
                "type_label": "Bộ môn",
                "deleted_at": r["deleted_at"],
                "note":       r["note"] or "",
            })

        # Sắp xếp tổng hợp theo thời gian xóa (mới nhất trước)
        items.sort(key=lambda x: x["deleted_at"] or 0, reverse=True)

        return jsonify({"status": "ok", "data": items, "total": len(items)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# RESTORE  (khôi phục)
# ─────────────────────────────────────────────────────────────

@admin_trash_bp.route("/trash/<entity_type>/<id>/restore", methods=["PUT"])
def restore(entity_type, id):
    label_map = {
        "giang-vien": "GiangVien",
        "cong-trinh": "CongTrinhNghienCuu",
        "de-tai":     "DeTaiNghienCuu",
        "linh-vuc":   "LinhVucNghienCuu",
        "tac-gia-ngoai": "TacGiaNgoai",
        "bo-mon": "BoMon"
    }
    label = label_map.get(entity_type)
    if not label:
        return jsonify({"status": "error", "message": f"Loại entity '{entity_type}' không hợp lệ"}), 400

    conn = get_neo4j_connection()
    try:
        query = f"MATCH (n:{label}) WHERE n.id = $id AND n.is_deleted = true"
        if entity_type == 'linh-vuc':
            query = f"MATCH (n:{label}) WHERE id(n) = toInteger($id) AND n.is_deleted = true"

        result = conn.write(f"""
            {query}
            REMOVE n.is_deleted, n.deleted_at, n.deleted_note
            // Restore status based on label: Publication -> 'Đã duyệt', Project -> 'Đang thực hiện'
            SET n.trang_thai = CASE 
                WHEN 'CongTrinhNghienCuu' IN labels(n) THEN 'Đã duyệt'
                WHEN 'DeTaiNghienCuu' IN labels(n) THEN 'Đang thực hiện'
                ELSE n.trang_thai
            END
            RETURN n
        """, {"id": id})

        if not result:
            return jsonify({"status": "error", "message": "Không tìm thấy trong thùng rác hoặc không thể khôi phục"}), 404

        return jsonify({"status": "ok", "message": "Khôi phục thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# APPROVE RESTORE (duyệt khôi phục từ yêu cầu giảng viên)
# ─────────────────────────────────────────────────────────────

@admin_trash_bp.route("/trash/<entity_type>/<id>/approve-restore", methods=["PUT"])
def approve_restore(entity_type, id):
    return restore(entity_type, id) # Logic giống hệt restore thông thường nhưng dùng route khác để rõ ràng

# ─────────────────────────────────────────────────────────────
# PERMANENT DELETE  (xóa vĩnh viễn)
# ─────────────────────────────────────────────────────────────

@admin_trash_bp.route("/trash/<entity_type>/<id>/permanent", methods=["DELETE"])
def permanent_delete(entity_type, id):
    label_map = {
        "giang-vien": "GiangVien",
        "cong-trinh": "CongTrinhNghienCuu",
        "de-tai":     "DeTaiNghienCuu",
        "linh-vuc":   "LinhVucNghienCuu",
        "tac-gia-ngoai": "TacGiaNgoai",
        "bo-mon": "BoMon"
    }
    label = label_map.get(entity_type)
    if not label:
        return jsonify({"status": "error", "message": f"Loại entity '{entity_type}' không hợp lệ"}), 400

    conn = get_neo4j_connection()
    try:
        query = f"MATCH (n:{label}) WHERE n.id = $id AND n.is_deleted = true"
        if entity_type == 'linh-vuc':
            query = f"MATCH (n:{label}) WHERE id(n) = toInteger($id) AND n.is_deleted = true"

        result = conn.write(f"""
            {query}
            DETACH DELETE n
            RETURN count(n) AS deleted
        """, {"id": id})

        return jsonify({"status": "ok", "message": "Đã xóa vĩnh viễn"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# EMPTY TRASH  (dọn sạch thùng rác)
# ─────────────────────────────────────────────────────────────

@admin_trash_bp.route("/trash/empty", methods=["DELETE"])
def empty_trash():
    """Xóa vĩnh viễn TẤT CẢ node đang trong thùng rác."""
    conn = get_neo4j_connection()
    try:
        total = 0
        labels = ["GiangVien", "CongTrinhNghienCuu", "DeTaiNghienCuu", "LinhVucNghienCuu", "TacGiaNgoai", "BoMon"]
        for label in labels:
            result = conn.write(f"""
                MATCH (n:{label}) WHERE n.is_deleted = true
                WITH n, count(n) AS c
                DETACH DELETE n
                RETURN c
            """)
            if result:
                total += result[0].get("c", 0) or 0

        return jsonify({"status": "ok", "message": f"Đã xóa vĩnh viễn tất cả mục trong thùng rác", "deleted": total})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# TRASH COUNT  (đếm số mục trong thùng rác - dùng cho badge)
# ─────────────────────────────────────────────────────────────

@admin_trash_bp.route("/trash/count", methods=["GET"])
def trash_count():
    conn = get_neo4j_connection()
    try:
        total = 0
        labels = ["GiangVien", "CongTrinhNghienCuu", "DeTaiNghienCuu", "LinhVucNghienCuu", "TacGiaNgoai", "BoMon"]
        for label in labels:
            result = conn.query(f"""
                MATCH (n:{label}) WHERE n.is_deleted = true
                RETURN count(n) AS c
            """)
            if result:
                total += result[0].get("c", 0) or 0
        return jsonify({"status": "ok", "count": total})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
