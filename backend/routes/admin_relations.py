from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_relations_bp = Blueprint("admin_relations", __name__, url_prefix="/api/admin/relations")

# ==============================================================================
# QUAN HỆ CÔNG TRÌNH - GIẢNG VIÊN (Tác giả)
# ==============================================================================
@admin_relations_bp.route("/cong-trinh/<ct_id>/giang-vien", methods=["GET"])
def get_tac_gia_cong_trinh(ct_id):
    """Lấy danh sách ID các giảng viên là tác giả của công trình kèm vai trò."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
        WHERE ct.id = $id
        RETURN gv.id AS gv_id, gv.ho_va_ten AS ten, type(r) AS vai_tro
    """, {"id": ct_id})
    data = [{"id": r["gv_id"], "ten": r["ten"], "vai_tro": r["vai_tro"]} for r in results]
    return jsonify({"status": "ok", "data": data})


@admin_relations_bp.route("/cong-trinh/<ct_id>/giang-vien", methods=["PUT"])
def update_tac_gia_cong_trinh(ct_id):
    """
    Cập nhật danh sách tác giả cho công trình với vai trò (Tác giả chính / Cộng sự).
    Payload: {"tac_gia_chinh_ids": [12], "cong_su_ids": [15, 16]}
    """
    data = request.json
    tac_gia_chinh_ids = data.get("tac_gia_chinh_ids", [])
    cong_su_ids = data.get("cong_su_ids", [])
    
    conn = get_neo4j_connection()
    try:
        # 1. Xóa các quan hệ cũ (bao gồm cả quan hệ cũ LA_TAC_GIA_CUA)
        conn.query("""
            MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
            WHERE ct.id = $id
            DELETE r
        """, {"id": ct_id})
        
        # 2. Thêm Tác giả chính
        if tac_gia_chinh_ids:
            conn.query("""
                UNWIND $ids AS gv_id
                MATCH (gv:GiangVien), (ct:CongTrinhNghienCuu)
                WHERE gv.id = gv_id AND ct.id = $id
                MERGE (gv)-[:TAC_GIA_CHINH]->(ct)
            """, {"id": ct_id, "ids": tac_gia_chinh_ids})
            
        # 3. Thêm Cộng sự
        if cong_su_ids:
            conn.query("""
                UNWIND $ids AS gv_id
                MATCH (gv:GiangVien), (ct:CongTrinhNghienCuu)
                WHERE gv.id = gv_id AND ct.id = $id
                MERGE (gv)-[:CONG_SU]->(ct)
            """, {"id": ct_id, "ids": cong_su_ids})
            
        return jsonify({"status": "ok", "message": "Đã cập nhật vai trò tác giả công trình."})
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


# ==============================================================================
# QUAN HỆ VỚI TÁC GIẢ NGOÀI (DONG_TAC_GIA)
# ==============================================================================
@admin_relations_bp.route("/cong-trinh/<ct_id>/tac-gia-ngoai", methods=["GET"])
def get_tac_gia_ngoai_cong_trinh(ct_id):
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (tgn:TacGiaNgoai)-[r:TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(ct:CongTrinhNghienCuu)
        WHERE ct.id = $id
        RETURN tgn.id AS tgn_id, tgn.ho_va_ten AS ten, type(r) AS vai_tro
    """, {"id": ct_id})
    data = [{"id": r["tgn_id"], "ten": r["ten"], "vai_tro": r["vai_tro"]} for r in results]
    return jsonify({"status": "ok", "data": data})


@admin_relations_bp.route("/cong-trinh/<ct_id>/tac-gia-ngoai", methods=["PUT"])
def update_tac_gia_ngoai_cong_trinh(ct_id):
    data = request.json
    tac_gia_chinh_ngoai_ids = data.get("tac_gia_chinh_ngoai_ids")
    cong_su_ngoai_ids = data.get("cong_su_ngoai_ids")
    tgn_ids = data.get("tac_gia_ngoai_ids")
    
    conn = get_neo4j_connection()
    try:
        # Xóa các quan hệ cũ (bao gồm cả DONG_TAC_GIA cũ)
        conn.query("""
            MATCH (tgn:TacGiaNgoai)-[r:TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(ct:CongTrinhNghienCuu)
            WHERE ct.id = $id
            DELETE r
        """, {"id": ct_id})
        
        # Nếu gửi theo kiểu phân vai trò mới
        if tac_gia_chinh_ngoai_ids is not None or cong_su_ngoai_ids is not None:
            chinh_ids = tac_gia_chinh_ngoai_ids or []
            phu_ids = cong_su_ngoai_ids or []
            
            if chinh_ids:
                conn.query("""
                    UNWIND $ids AS tgn_id
                    MATCH (tgn:TacGiaNgoai), (ct:CongTrinhNghienCuu)
                    WHERE tgn.id = tgn_id AND ct.id = $id
                    MERGE (tgn)-[:TAC_GIA_CHINH]->(ct)
                """, {"id": ct_id, "ids": chinh_ids})
                
            if phu_ids:
                conn.query("""
                    UNWIND $ids AS tgn_id
                    MATCH (tgn:TacGiaNgoai), (ct:CongTrinhNghienCuu)
                    WHERE tgn.id = tgn_id AND ct.id = $id
                    MERGE (tgn)-[:CONG_SU]->(ct)
                """, {"id": ct_id, "ids": phu_ids})
        else:
            # Fallback cho kiểu cũ
            if tgn_ids:
                conn.query("""
                    UNWIND $tgn_ids AS tgn_id
                    MATCH (tgn:TacGiaNgoai), (ct:CongTrinhNghienCuu)
                    WHERE tgn.id = tgn_id AND ct.id = $id
                    MERGE (tgn)-[:DONG_TAC_GIA]->(ct)
                """, {"id": ct_id, "tgn_ids": tgn_ids})
                
        return jsonify({"status": "ok", "message": "Đã cập nhật tác giả ngoài cho công trình."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_relations_bp.route("/de-tai/<dt_id>/tac-gia-ngoai", methods=["GET"])
def get_tac_gia_ngoai_de_tai(dt_id):
    """Lấy danh sách Tác giả ngoài tham gia đề tài kèm vai trò."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (tgn:TacGiaNgoai)-[r:CHU_NHIEM|THAM_GIA|DONG_TAC_GIA]->(dt:DeTaiNghienCuu)
        WHERE dt.id = $id
        RETURN tgn.id AS tgn_id, tgn.ho_va_ten AS ten, type(r) AS vai_tro
    """, {"id": dt_id})
    data = [{"id": r["tgn_id"], "ten": r["ten"], "vai_tro": r["vai_tro"]} for r in results]
    return jsonify({"status": "ok", "data": data})


@admin_relations_bp.route("/de-tai/<dt_id>/tac-gia-ngoai", methods=["PUT"])
def update_tac_gia_ngoai_de_tai(dt_id):
    """
    Cập nhật danh sách Tác giả ngoài cho đề tài với vai trò.
    Payload: {"chu_nhiem_ngoai_ids": [...], "tham_gia_ngoai_ids": [...]}
    """
    data = request.json
    chu_nhiem_ids = data.get("chu_nhiem_ngoai_ids", [])
    tham_gia_ids = data.get("tham_gia_ngoai_ids", [])
    
    conn = get_neo4j_connection()
    try:
        # Xóa các quan hệ cũ (bao gồm cả DONG_TAC_GIA cũ)
        conn.query("""
            MATCH (tgn:TacGiaNgoai)-[r:CHU_NHIEM|THAM_GIA|DONG_TAC_GIA]->(dt:DeTaiNghienCuu)
            WHERE dt.id = $id
            DELETE r
        """, {"id": dt_id})
        
        # Thêm Chủ nhiệm ngoài
        if chu_nhiem_ids:
            conn.query("""
                UNWIND $ids AS tgn_id
                MATCH (tgn:TacGiaNgoai), (dt:DeTaiNghienCuu)
                WHERE tgn.id = tgn_id AND dt.id = $id
                MERGE (tgn)-[:CHU_NHIEM]->(dt)
            """, {"id": dt_id, "ids": chu_nhiem_ids})
            
        # Thêm Thành viên ngoài
        if tham_gia_ids:
            conn.query("""
                UNWIND $ids AS tgn_id
                MATCH (tgn:TacGiaNgoai), (dt:DeTaiNghienCuu)
                WHERE tgn.id = tgn_id AND dt.id = $id
                MERGE (tgn)-[:THAM_GIA]->(dt)
            """, {"id": dt_id, "ids": tham_gia_ids})
            
        return jsonify({"status": "ok", "message": "Đã cập nhật tác giả ngoài cho đề tài."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
