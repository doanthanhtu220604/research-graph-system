from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_relations_bp = Blueprint("admin_relations", __name__, url_prefix="/api/admin/relations")

# ==============================================================================
# QUAN HỆ CÔNG TRÌNH - GIẢNG VIÊN (Tác giả)
# ==============================================================================
@admin_relations_bp.route("/cong-trinh/<ct_id>/giang-vien", methods=["GET"])
def get_tac_gia_cong_trinh(ct_id):
    """Lấy danh sách ID các giảng viên là tác giả của công trình."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
        WHERE ct.id = $id
        RETURN gv.id AS gv_id, gv.ho_va_ten AS ten
    """, {"id": ct_id})
    data = [{"id": r["gv_id"], "ten": r["ten"]} for r in results]
    return jsonify({"status": "ok", "data": data})


@admin_relations_bp.route("/cong-trinh/<ct_id>/giang-vien", methods=["PUT"])
def update_tac_gia_cong_trinh(ct_id):
    """
    Cập nhật danh sách tác giả cho công trình.
    Payload: {"giang_vien_ids": [12, 15, ...]}
    Xóa tất cả quan hệ LA_TAC_GIA_CUA hiện tại đến công trình này,
    sau đó tạo lại quan hệ mới cho các ID được gửi lên.
    """
    data = request.json
    gv_ids = data.get("giang_vien_ids", [])
    
    conn = get_neo4j_connection()
    try:
        # 1. Xóa các quan hệ cũ
        conn.query("""
            MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
            WHERE ct.id = $id
            DELETE r
        """, {"id": ct_id})
        
        # 2. Thêm các quan hệ mới
        if gv_ids:
            # Tạo node mới sử dụng UNWIND (truyền mảng ID vào)
            conn.query("""
                UNWIND $gv_ids AS gv_id
                MATCH (gv:GiangVien), (ct:CongTrinhNghienCuu)
                WHERE gv.id = gv_id AND ct.id = $id
                MERGE (gv)-[:LA_TAC_GIA_CUA]->(ct)
            """, {"id": ct_id, "gv_ids": gv_ids})
            
        return jsonify({"status": "ok", "message": "Đã cập nhật quan hệ tác giả công trình."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ==============================================================================
# QUAN HỆ ĐỀ TÀI - GIẢNG VIÊN (Chủ nhiệm / Thành viên)
# ==============================================================================
@admin_relations_bp.route("/de-tai/<dt_id>/giang-vien", methods=["GET"])
def get_thanh_vien_de_tai(dt_id):
    """Lấy danh sách Giảng viên tham gia đề tài và Vai trò của họ."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (gv:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
        WHERE dt.id = $id
        RETURN gv.id AS gv_id, gv.ho_va_ten AS ten, type(r) AS vai_tro
    """, {"id": dt_id})
    data = [{"id": r["gv_id"], "ten": r["ten"], "vai_tro": r["vai_tro"]} for r in results]
    return jsonify({"status": "ok", "data": data})


@admin_relations_bp.route("/de-tai/<dt_id>/giang-vien", methods=["PUT"])
def update_thanh_vien_de_tai(dt_id):
    """
    Cập nhật danh sách chủ nhiệm / thành viên tham gia.
    Payload: {"chu_nhiem_ids": [15], "tham_gia_ids": [12, 19, ...]}
    Xóa tất cả các liên kết CHU_NHIEM/THAM_GIA với dt_id sau đó tạo lại.
    """
    data = request.json
    chu_nhiem_ids = data.get("chu_nhiem_ids", [])
    tham_gia_ids = data.get("tham_gia_ids", [])
    
    conn = get_neo4j_connection()
    try:
        # Xóa các edge cũ
        conn.query("""
            MATCH (gv:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
            WHERE dt.id = $id
            DELETE r
        """, {"id": dt_id})
        
        # Thêm edge CHU_NHIEM
        if chu_nhiem_ids:
            conn.query("""
                UNWIND $chu_nhiem_ids AS gv_id
                MATCH (gv:GiangVien), (dt:DeTaiNghienCuu)
                WHERE gv.id = gv_id AND dt.id = $id
                MERGE (gv)-[:CHU_NHIEM]->(dt)
            """, {"id": dt_id, "chu_nhiem_ids": chu_nhiem_ids})
            
        # Thêm edge THAM_GIA
        if tham_gia_ids:
            conn.query("""
                UNWIND $tham_gia_ids AS gv_id
                MATCH (gv:GiangVien), (dt:DeTaiNghienCuu)
                WHERE gv.id = gv_id AND dt.id = $id
                MERGE (gv)-[:THAM_GIA]->(dt)
            """, {"id": dt_id, "tham_gia_ids": tham_gia_ids})
            
        return jsonify({"status": "ok", "message": "Đã cập nhật vai trò vào đề tài nghiên cứu."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
