"""
API Routes cho Knowledge Map.
Cung cấp endpoints để frontend truy vấn dữ liệu từ Neo4j.
"""

from flask import Blueprint, jsonify, request
import unicodedata
from backend.services.neo4j_connection import get_neo4j_connection
from backend.services.gemini_service import gemini_service

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/translate", methods=["POST"])
def translate_content():
    """Dịch nội dung sử dụng Google Translate (miễn phí)."""
    from deep_translator import GoogleTranslator
    data = request.json
    text = data.get("text", "").strip()
    target_lang = data.get("target_lang", "vi").strip()
    
    # Map sang mã ngôn ngữ ISO
    lang_map = {
        "vi": "vi",
        "en": "en",
        "Tiếng Việt": "vi",
        "Tiếng Anh": "en"
    }
    target = lang_map.get(target_lang, "vi")
    
    if not text:
        return jsonify({"status": "error", "message": "Nội dung trống"}), 400
        
    try:
        # GoogleTranslator tự động xử lý các đoạn văn dài bằng cách chia nhỏ (chunking)
        translated = GoogleTranslator(source='auto', target=target).translate(text)
        if translated:
            return jsonify({"status": "ok", "translatedText": translated})
        else:
            return jsonify({"status": "error", "message": "Không thể dịch nội dung này"}), 500
    except Exception as e:
        print(f"[Translation Error] {e}")
        return jsonify({"status": "error", "message": f"Lỗi dịch thuật: {str(e)}"}), 500


# ============================================================
# GIẢNG VIÊN
# ============================================================

@api_bp.route("/giang-vien")
def get_all_giang_vien():
    """Lấy danh sách tất cả giảng viên (không bao gồm đã xóa mềm)."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (gv:GiangVien)
        WHERE coalesce(gv.is_deleted, false) = false
        OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
        OPTIONAL MATCH (gv)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
            WHERE coalesce(lv.is_deleted, false) = false
        RETURN gv, bm.ten_bo_mon AS bo_mon,
               collect(DISTINCT lv.ten_linh_vuc) AS linh_vuc
        ORDER BY gv.ho_va_ten
    """)
    giang_vien_list = []
    for r in results:
        gv = dict(r["gv"])
        gv["bo_mon"] = r["bo_mon"]
        gv["linh_vuc"] = [lv for lv in (r["linh_vuc"] or []) if lv]
        giang_vien_list.append(gv)
    return jsonify({"status": "ok", "data": giang_vien_list})


@api_bp.route("/giang-vien/<gv_id>")
def get_giang_vien_detail(gv_id):
    """Lấy chi tiết giảng viên và các mối quan hệ."""
    conn = get_neo4j_connection()

    # Thông tin cơ bản
    gv = conn.query_single("""
        MATCH (gv:GiangVien) 
        WHERE gv.id = $id AND coalesce(gv.is_deleted, false) = false
        OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
        RETURN gv, bm.ten_bo_mon AS bo_mon
    """, {"id": gv_id})

    if not gv:
        return jsonify({"status": "error", "message": "Không tìm thấy giảng viên"}), 404

    # Công trình nghiên cứu
    cong_trinh = conn.query("""
        MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
        WHERE gv.id = $id AND coalesce(ct.is_deleted, false) = false
        RETURN ct, type(r) AS vai_tro
        ORDER BY ct.nam_xuat_ban DESC
    """, {"id": gv_id})

    # Đề tài nghiên cứu
    de_tai = conn.query("""
        MATCH (gv:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
        WHERE gv.id = $id AND coalesce(dt.is_deleted, false) = false
        RETURN dt, type(r) AS vai_tro
        ORDER BY dt.nam_bat_dau DESC
    """, {"id": gv_id})

    linh_vuc = conn.query("""
        MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
        WHERE gv.id = $id AND coalesce(lv.is_deleted, false) = false
        RETURN lv.ten_linh_vuc AS ten_linh_vuc
    """, {"id": gv_id})

    result = dict(gv["gv"]) if gv and "gv" in gv else {}
    result["bo_mon"] = gv["bo_mon"] if gv and "bo_mon" in gv else None

    # Check if cong_trinh is actually returned a valid node
    result["cong_trinh"] = []
    for r in cong_trinh:
        if r.get("ct"):
            ct_item = dict(r["ct"])
            ct_item["vai_tro"] = r.get("vai_tro")
            result["cong_trinh"].append(ct_item)
            
    # Check if de_tai is actually returned a valid node
    result["de_tai"] = []
    for r in de_tai:
        if r.get("dt"):
            dt_item = dict(r["dt"])
            dt_item["vai_tro"] = r.get("vai_tro")
            result["de_tai"].append(dt_item)

    # Lĩnh vực nghiên cứu
    result["linh_vuc"] = [r["ten_linh_vuc"] for r in linh_vuc if r.get("ten_linh_vuc")]

    return jsonify({"status": "ok", "data": result})


# ============================================================
# CÔNG TRÌNH NGHIÊN CỨU
# ============================================================

@api_bp.route("/cong-trinh")
def get_all_cong_trinh():
    """Lấy danh sách công trình nghiên cứu (không bao gồm đã xóa mềm)."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (ct:CongTrinhNghienCuu)
        WHERE coalesce(ct.is_deleted, false) = false
        OPTIONAL MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct)
        OPTIONAL MATCH (tgn:TacGiaNgoai)-[:TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(ct)
        WHERE coalesce(tgn.trang_thai, 'Đã duyệt') = 'Đã duyệt'
        RETURN ct,
               collect(DISTINCT gv.ho_va_ten) AS tac_gia,
               collect(DISTINCT tgn.ho_va_ten) AS tac_gia_ngoai
        ORDER BY toInteger(ct.nam_xuat_ban) DESC, coalesce(ct.created_at, 0) DESC, id(ct) DESC
    """)
    cong_trinh_list = []
    for r in results:
        ct = dict(r["ct"])
        ct["tac_gia"] = [t for t in (r["tac_gia"] or []) if t]
        ct["tac_gia_ngoai"] = [t for t in (r["tac_gia_ngoai"] or []) if t]
        cong_trinh_list.append(ct)
    return jsonify({"status": "ok", "data": cong_trinh_list})


@api_bp.route("/cong-trinh/<ct_id>")
def get_cong_trinh_detail(ct_id):
    """Lấy chi tiết công trình nghiên cứu."""
    conn = get_neo4j_connection()
    result = conn.query_single("""
        MATCH (ct:CongTrinhNghienCuu) 
        WHERE ct.id = $id AND coalesce(ct.is_deleted, false) = false
        OPTIONAL MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct)
        WHERE coalesce(gv.is_deleted, false) = false
        RETURN ct, collect({ten: gv.ho_va_ten, vai_tro: type(r)}) AS tac_gia
    """, {"id": ct_id})

    tac_gia_ngoai_res = conn.query("""
        MATCH (tgn:TacGiaNgoai)-[r:TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(ct:CongTrinhNghienCuu)
        WHERE ct.id = $id AND coalesce(tgn.trang_thai, 'Đã duyệt') = 'Đã duyệt'
        RETURN tgn.ho_va_ten AS ten, tgn.don_vi_cong_tac AS don_vi, type(r) AS vai_tro
    """, {"id": ct_id})
    
    if not result or not result.get("ct"):
        return jsonify({"status": "error", "message": "Không tìm thấy công trình"}), 404
        
    data = dict(result["ct"])
    data["tac_gia"] = result["tac_gia"]
    data["tac_gia_ngoai"] = [
        {"ten": r["ten"], "don_vi": r["don_vi"], "vai_tro": r["vai_tro"]} for r in tac_gia_ngoai_res
    ]
    return jsonify({"status": "ok", "data": data})


# ============================================================
# ĐỀ TÀI NGHIÊN CỨU
# ============================================================

@api_bp.route("/de-tai")
def get_all_de_tai():
    """Lấy danh sách đề tài nghiên cứu (không bao gồm đã xóa mềm)."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (dt:DeTaiNghienCuu)
        WHERE coalesce(dt.is_deleted, false) = false
        OPTIONAL MATCH (gv_cn:GiangVien)-[:CHU_NHIEM]->(dt)
        OPTIONAL MATCH (gv_tv:GiangVien)-[:THAM_GIA]->(dt)
        OPTIONAL MATCH (tgn:TacGiaNgoai)-[:CHU_NHIEM|THAM_GIA|DONG_TAC_GIA]->(dt)
        WHERE coalesce(tgn.trang_thai, 'Đã duyệt') = 'Đã duyệt'
        RETURN dt,
               collect(DISTINCT gv_cn.ho_va_ten) AS chu_nhiem,
               collect(DISTINCT gv_tv.ho_va_ten) AS thanh_vien,
               collect(DISTINCT tgn.ho_va_ten)   AS tac_gia_ngoai
        ORDER BY toInteger(dt.nam_bat_dau) DESC, coalesce(dt.created_at, 0) DESC, id(dt) DESC
    """)
    de_tai_list = []
    for r in results:
        dt = dict(r["dt"])
        dt["chu_nhiem"]    = [t for t in (r["chu_nhiem"] or []) if t]
        dt["thanh_vien"]   = [t for t in (r["thanh_vien"] or []) if t]
        dt["tac_gia_ngoai"] = [t for t in (r["tac_gia_ngoai"] or []) if t]
        de_tai_list.append(dt)
    return jsonify({"status": "ok", "data": de_tai_list})


@api_bp.route("/de-tai/<dt_id>")
def get_de_tai_detail(dt_id):
    """Lấy chi tiết đề tài nghiên cứu."""
    conn = get_neo4j_connection()
    result = conn.query_single("""
        MATCH (dt:DeTaiNghienCuu) 
        WHERE dt.id = $id AND coalesce(dt.is_deleted, false) = false
        OPTIONAL MATCH (gv:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt)
        WHERE coalesce(gv.is_deleted, false) = false
        RETURN dt, collect({ten: gv.ho_va_ten, vai_tro: type(r)}) AS thanh_vien
    """, {"id": dt_id})

    tac_gia_ngoai_res = conn.query("""
        MATCH (tgn:TacGiaNgoai)-[r:CHU_NHIEM|THAM_GIA|DONG_TAC_GIA]->(dt:DeTaiNghienCuu)
        WHERE dt.id = $id AND coalesce(tgn.trang_thai, 'Đã duyệt') = 'Đã duyệt'
        RETURN tgn.ho_va_ten AS ten, tgn.don_vi_cong_tac AS don_vi, type(r) AS vai_tro
    """, {"id": dt_id})

    if not result or not result.get("dt"):
        return jsonify({"status": "error", "message": "Không tìm thấy đề tài"}), 404
        
    data = dict(result["dt"])
    data["thanh_vien"] = result["thanh_vien"]
    data["tac_gia_ngoai"] = [
        {"ten": r["ten"], "don_vi": r["don_vi"], "vai_tro": r["vai_tro"]} for r in tac_gia_ngoai_res
    ]
    return jsonify({"status": "ok", "data": data})


# ============================================================
# TÌM KIẾM
# ============================================================

# ============================================================
# LĨNH VỰC NGHIÊN CỨU
# ============================================================

@api_bp.route("/linh-vuc")
def get_all_linh_vuc():
    """Lấy danh sách lĩnh vực nghiên cứu."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (lv:LinhVucNghienCuu)
        WHERE coalesce(lv.is_deleted, false) = false
        RETURN lv
        ORDER BY lv.ten_linh_vuc
    """)
    linh_vuc_list = []
    for r in results:
        lv = dict(r["lv"])
        linh_vuc_list.append(lv)
    return jsonify({"status": "ok", "data": linh_vuc_list})

def remove_accents(input_str):
    if not input_str:
        return ""
    s = str(input_str)
    s = unicodedata.normalize('NFD', s)
    s = "".join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('đ', 'd').replace('Đ', 'D')
    return s.lower()

@api_bp.route("/search")
def search():
    """Tìm kiếm tổng hợp theo từ khóa với bộ lọc loại thực thể (không phân biệt dấu)."""
    q = request.args.get("q", "").strip()
    search_type = request.args.get("type", "all").strip().lower()
    
    if not q:
        return jsonify({"status": "ok", "data": []})

    q_normalized = remove_accents(q)

    # Bản đồ mapping giữa search_type và label trong Neo4j
    type_to_label = {
        "giang_vien": "GiangVien",
        "cong_trinh": "CongTrinhNghienCuu",
        "de_tai": "DeTaiNghienCuu"
    }
    
    label_filter = ""
    if search_type in type_to_label:
        label_filter = f":{type_to_label[search_type]}"

    try:
        conn = get_neo4j_connection()
        # Lấy tất cả các node phù hợp kèm theo các mối quan hệ tác giả/thành viên
        query = f"""
            MATCH (n{label_filter})
            WHERE coalesce(n.is_deleted, false) = false
              AND NOT (n:TacGiaNgoai AND coalesce(n.trang_thai, 'Đã duyệt') <> 'Đã duyệt')
              AND NOT (n:TacGiaNgoai AND EXISTS {{
                MATCH (gv:GiangVien) WHERE gv.ho_va_ten = n.ho_va_ten
            }})
            OPTIONAL MATCH (tg)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(n)
            WHERE NOT (tg:TacGiaNgoai) OR coalesce(tg.trang_thai, 'Đã duyệt') = 'Đã duyệt'
            OPTIONAL MATCH (tv)-[:CHU_NHIEM|THAM_GIA]->(n)
            RETURN n, labels(n) AS labels,
                   collect(DISTINCT tg.ho_va_ten) AS related_authors,
                   collect(DISTINCT tv.ho_va_ten) AS related_members
        """
        
        results = conn.query(query)

        data = []
        for r in results:
            item = dict(r["n"])
            labels = r["labels"] or []
            
            # Xác định các trường để thực hiện tìm kiếm toàn diện
            if "GiangVien" in labels or "TacGiaNgoai" in labels:
                search_text = " ".join([
                    str(item.get("ho_va_ten") or ""),
                    str(item.get("hoc_vi") or ""),
                    str(item.get("chuc_danh") or ""),
                    str(item.get("chuc_vu") or ""),
                    str(item.get("chuyen_nganh") or "")
                ])
            elif "CongTrinhNghienCuu" in labels:
                authors_str = " ".join(r.get("related_authors") or [])
                search_text = " ".join([
                    str(item.get("ten_cong_trinh") or ""),
                    str(item.get("nam_xuat_ban") or ""),
                    str(item.get("noi_xuat_ban") or ""),
                    authors_str
                ])
            elif "DeTaiNghienCuu" in labels:
                members_str = " ".join(r.get("related_members") or [])
                search_text = " ".join([
                    str(item.get("ten_de_tai") or ""),
                    str(item.get("nam_bat_dau") or ""),
                    str(item.get("nam_ket_thuc") or ""),
                    str(item.get("cap_de_tai") or ""),
                    members_str
                ])
            elif "BoMon" in labels:
                search_text = item.get("ten_bo_mon") or ""
            elif "Khoa" in labels:
                search_text = item.get("ten_khoa") or ""
            elif "LinhVucNghienCuu" in labels:
                search_text = item.get("ten_linh_vuc") or ""
            elif "NhomNghienCuu" in labels:
                search_text = item.get("ten_nhom") or ""
            else:
                # Fallback: ghép tất cả các trường tên
                search_text = " ".join([
                    str(item.get("ho_va_ten") or ""),
                    str(item.get("ten_cong_trinh") or ""),
                    str(item.get("ten_de_tai") or ""),
                    str(item.get("ten_bo_mon") or ""),
                    str(item.get("ten_khoa") or ""),
                    str(item.get("ten_linh_vuc") or ""),
                    str(item.get("ten_nhom") or "")
                ])
            
            normalized_search_text = remove_accents(search_text)
            
            if q_normalized in normalized_search_text:
                item["_labels"] = labels
                data.append(item)
                
                # Giới hạn 30 kết quả
                if len(data) >= 30:
                    break

        return jsonify({"status": "ok", "data": data, "query": q, "type": search_type})


    except Exception as e:
        print(f"[SEARCH ERROR] {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================
# GRAPH DATA (cho Vis.js visualization)
# ============================================================

@api_bp.route("/graph/all")
def get_full_graph():
    """Lấy toàn bộ dữ liệu đồ thị cho visualization."""
    conn = get_neo4j_connection()

    # Lấy tất cả nodes
    nodes_result = conn.query("""
        MATCH (n)
        WHERE n.id IS NOT NULL AND coalesce(n.is_deleted, false) = false
        RETURN n.id AS id, labels(n) AS labels, properties(n) AS props
    """)

    # Lấy tất cả relationships
    edges_result = conn.query("""
        MATCH (a)-[r]->(b)
        WHERE a.id IS NOT NULL AND b.id IS NOT NULL
          AND coalesce(a.is_deleted, false) = false
          AND coalesce(b.is_deleted, false) = false
        RETURN a.id AS source, b.id AS target, type(r) AS type,
               properties(r) AS props
    """)

    # Map label -> color và shape cho Vis.js
    label_config = {
        "GiangVien": {"color": "#4F8EF7", "shape": "dot", "size": 25},
        "CongTrinhNghienCuu": {"color": "#2ECC71", "shape": "diamond", "size": 18},
        "DeTaiNghienCuu": {"color": "#F39C12", "shape": "triangle", "size": 20},
        "BoMon": {"color": "#E74C3C", "shape": "square", "size": 22},
        "Khoa": {"color": "#9B59B6", "shape": "star", "size": 30},
        "LinhVucNghienCuu": {"color": "#1ABC9C", "shape": "hexagon", "size": 22},
        "NhomNghienCuu": {"color": "#E67E22", "shape": "triangle", "size": 20},
    }

    nodes = []
    for n in nodes_result:
        label = n["labels"][0] if n["labels"] else "Unknown"
        config = label_config.get(label, {"color": "#95A5A6", "shape": "dot", "size": 15})

        # Tạo display label
        props = n["props"]
        display_label = (
            props.get("ho_va_ten")
            or props.get("ten_cong_trinh")
            or props.get("ten_de_tai")
            or props.get("ten_bo_mon")
            or props.get("ten_khoa")
            or props.get("ten_linh_vuc")
            or props.get("ten_nhom")
            or str(props.get("id", ""))
        )

        nodes.append({
            "id": n["id"],  # Standardized string ID (gv_5, ct_10...)
            "label": display_label,
            "group": label,
            "color": config["color"],
            "shape": config["shape"],
            "size": config["size"],
            "properties": props,
        })

    edges = []
    for e in edges_result:
        edges.append({
            "from": e["source"],
            "to": e["target"],
            "label": e["type"],
            "arrows": "to",
            "properties": e["props"],
        })

    return jsonify({
        "status": "ok",
        "nodes": nodes,
        "edges": edges,
        "legend": label_config,
    })


@api_bp.route("/graph/node/<node_id>")
def get_node_graph(node_id):
    """Lấy đồ thị xung quanh 1 node cụ thể (depth=1)."""
    conn = get_neo4j_connection()

    results = conn.query("""
        MATCH (center)
        WHERE center.id = $node_id
        WITH center
        MATCH (center)-[r]-(neighbor)
        RETURN center, r, neighbor,
               center.id AS center_id, neighbor.id AS neighbor_id,
               labels(center) AS center_labels, labels(neighbor) AS neighbor_labels,
               type(r) AS rel_type
    """, {"node_id": node_id})

    label_config = {
        "GiangVien": {"color": "#4F8EF7", "shape": "dot", "size": 25},
        "CongTrinhNghienCuu": {"color": "#2ECC71", "shape": "diamond", "size": 18},
        "DeTaiNghienCuu": {"color": "#F39C12", "shape": "triangle", "size": 20},
        "BoMon": {"color": "#E74C3C", "shape": "square", "size": 22},
        "Khoa": {"color": "#9B59B6", "shape": "star", "size": 30},
        "LinhVucNghienCuu": {"color": "#1ABC9C", "shape": "hexagon", "size": 22},
        "NhomNghienCuu": {"color": "#E67E22", "shape": "triangle", "size": 20},
    }

    nodes_map = {}
    edges = []

    for r in results:
        # Center node
        cid = r["center_id"]
        if cid not in nodes_map:
            clabel = r["center_labels"][0] if r["center_labels"] else "Unknown"
            cprops = dict(r["center"])
            cconfig = label_config.get(clabel, {"color": "#95A5A6", "shape": "dot", "size": 15})
            nodes_map[cid] = {
                "id": cid,
                "label": cprops.get("ho_va_ten") or cprops.get("ten_cong_trinh")
                         or cprops.get("ten_de_tai") or cprops.get("ten_bo_mon")
                         or cprops.get("ten_khoa") or str(cprops.get("id", "")),
                "group": clabel,
                "color": cconfig["color"],
                "shape": cconfig["shape"],
                "size": cconfig["size"] + 10,
                "properties": cprops,
            }

        # Neighbor node
        nid = r["neighbor_id"]
        if nid not in nodes_map:
            nlabel = r["neighbor_labels"][0] if r["neighbor_labels"] else "Unknown"
            nprops = dict(r["neighbor"])
            nconfig = label_config.get(nlabel, {"color": "#95A5A6", "shape": "dot", "size": 15})
            nodes_map[nid] = {
                "id": nid,
                "label": nprops.get("ho_va_ten") or nprops.get("ten_cong_trinh")
                         or nprops.get("ten_de_tai") or nprops.get("ten_bo_mon")
                         or nprops.get("ten_khoa") or str(nprops.get("id", "")),
                "group": nlabel,
                "color": nconfig["color"],
                "shape": nconfig["shape"],
                "size": nconfig["size"],
                "properties": nprops,
            }

        edges.append({
            "from": cid,
            "to": nid,
            "label": r["rel_type"],
            "arrows": "to",
        })

    return jsonify({
        "status": "ok",
        "nodes": list(nodes_map.values()),
        "edges": edges,
        "legend": label_config,
    })


# ============================================================
# THỐNG KÊ
# ============================================================

@api_bp.route("/stats/overview")
def get_overview_stats():
    """Thống kê tổng quan."""
    try:
        conn = get_neo4j_connection()

        gv_count = conn.query_single("MATCH (n:GiangVien) WHERE coalesce(n.is_deleted, false) = false RETURN count(n) AS count")
        ct_count = conn.query_single("MATCH (n:CongTrinhNghienCuu) WHERE coalesce(n.is_deleted, false) = false RETURN count(n) AS count")
        dt_count = conn.query_single("MATCH (n:DeTaiNghienCuu) WHERE coalesce(n.is_deleted, false) = false RETURN count(n) AS count")
        bm_count = conn.query_single("MATCH (n:BoMon) WHERE coalesce(n.is_deleted, false) = false RETURN count(n) AS count")

        # Top giảng viên theo số công trình
        top_gv = conn.query("""
            MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
            WHERE coalesce(gv.is_deleted, false) = false AND coalesce(ct.is_deleted, false) = false
            RETURN gv.ho_va_ten AS ten, gv.id AS id, count(ct) AS so_cong_trinh
            ORDER BY so_cong_trinh DESC
            LIMIT 10
        """)

        # Thống kê công trình theo năm xuất bản (5 năm gần nhất)
        ct_theo_nam = conn.query("""
            MATCH (ct:CongTrinhNghienCuu)
            WHERE ct.nam_xuat_ban IS NOT NULL AND toString(ct.nam_xuat_ban) <> '' AND coalesce(ct.is_deleted, false) = false
            RETURN toInteger(ct.nam_xuat_ban) AS nam, count(ct) AS so_luong
            ORDER BY nam ASC
        """)

        # Thống kê đề tài theo cấp
        dt_theo_cap = conn.query("""
            MATCH (dt:DeTaiNghienCuu)
            WHERE dt.cap_de_tai IS NOT NULL AND coalesce(dt.is_deleted, false) = false
            RETURN dt.cap_de_tai AS cap, count(dt) AS so_luong
            ORDER BY so_luong DESC
        """)

        # Thống kê đề tài theo năm bắt đầu
        dt_theo_nam = conn.query("""
            MATCH (dt:DeTaiNghienCuu)
            WHERE dt.nam_bat_dau IS NOT NULL AND toString(dt.nam_bat_dau) <> ''
            RETURN toInteger(dt.nam_bat_dau) AS nam, count(dt) AS so_luong
            ORDER BY nam ASC
        """)

        # ── Đề tài đang thực hiện ──────────────────────────────────────────
        dt_dang_thuc_hien = conn.query("""
            MATCH (dt:DeTaiNghienCuu)
            WHERE dt.trang_thai = 'Đang thực hiện'
            OPTIONAL MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt)
            RETURN dt.id AS id,
                   dt.ten_de_tai AS ten_de_tai,
                   dt.cap_de_tai AS cap_de_tai,
                   dt.nam_bat_dau AS nam_bat_dau,
                   dt.nam_ket_thuc AS nam_ket_thuc,
                   collect(gv.ho_va_ten)[0] AS chu_nhiem
            ORDER BY dt.nam_bat_dau DESC
            LIMIT 6
        """)

        # ── Công trình mới nhất ─────────────────────────────────────────────
        ct_moi = conn.query("""
            MATCH (ct:CongTrinhNghienCuu)
            WHERE ct.nam_xuat_ban IS NOT NULL
            OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct)
            RETURN ct.id AS id,
                   ct.ten_cong_trinh AS ten_cong_trinh,
                   ct.loai_an_pham AS loai_an_pham,
                   ct.nam_xuat_ban AS nam_xuat_ban,
                   collect(gv.ho_va_ten) AS tac_gia
            ORDER BY ct.nam_xuat_ban DESC
            LIMIT 6
        """)

        # ── Thống kê công trình theo loại ấn phẩm ───────────────────────────
        ct_theo_loai = conn.query("""
            MATCH (ct:CongTrinhNghienCuu)
            WHERE ct.loai_an_pham IS NOT NULL AND coalesce(ct.is_deleted, false) = false
            RETURN ct.loai_an_pham AS loai, count(ct) AS so_luong
            ORDER BY so_luong DESC
        """)

        # ── Thống kê giảng viên theo học vị ─────────────────────────────────
        gv_theo_hoc_vi = conn.query("""
            MATCH (gv:GiangVien)
            WHERE gv.hoc_vi IS NOT NULL AND coalesce(gv.is_deleted, false) = false
            RETURN gv.hoc_vi AS hoc_vi, count(gv) AS so_luong
            ORDER BY so_luong DESC
        """)

        # ── Thống kê giảng viên theo bộ môn ─────────────────────────────────
        gv_theo_bo_mon = conn.query("""
            MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm:BoMon)
            WHERE coalesce(gv.is_deleted, false) = false
            RETURN bm.ten_bo_mon AS bo_mon, count(gv) AS so_luong
            ORDER BY so_luong DESC
        """)

        return jsonify({
            "status": "ok",
            "stats": {
                "giang_vien": int(gv_count["count"]) if gv_count else 0,
                "cong_trinh": int(ct_count["count"]) if ct_count else 0,
                "de_tai": int(dt_count["count"]) if dt_count else 0,
                "bo_mon": int(bm_count["count"]) if bm_count else 0,
            },
            "top_giang_vien": top_gv,
            "cong_trinh_theo_nam": [{"nam": r["nam"], "so_luong": int(r["so_luong"])} for r in ct_theo_nam],
            "de_tai_theo_nam": [{"nam": r["nam"], "so_luong": int(r["so_luong"])} for r in dt_theo_nam],
            "de_tai_theo_cap": [{"cap": r["cap"], "so_luong": int(r["so_luong"])} for r in dt_theo_cap],
            "cong_trinh_theo_loai": [{"loai": r["loai"], "so_luong": int(r["so_luong"])} for r in ct_theo_loai],
            "giang_vien_theo_hoc_vi": [{"hoc_vi": r["hoc_vi"], "so_luong": int(r["so_luong"])} for r in gv_theo_hoc_vi],
            "giang_vien_theo_bo_mon": [{"bo_mon": r["bo_mon"], "so_luong": int(r["so_luong"])} for r in gv_theo_bo_mon],
            "de_tai_dang_thuc_hien": [
                {
                    "id": r["id"],
                    "ten_de_tai": r["ten_de_tai"],
                    "cap_de_tai": r["cap_de_tai"],
                    "nam_bat_dau": r["nam_bat_dau"],
                    "nam_ket_thuc": r["nam_ket_thuc"],
                    "chu_nhiem": r["chu_nhiem"],
                }
                for r in dt_dang_thuc_hien
            ],
            "cong_trinh_moi": [
                {
                    "id": r["id"],
                    "ten_cong_trinh": r["ten_cong_trinh"],
                    "loai_an_pham": r["loai_an_pham"],
                    "nam_xuat_ban": r["nam_xuat_ban"],
                    "tac_gia": r["tac_gia"],
                }
                for r in ct_moi
            ],
        })
    except Exception as e:
        import traceback
        return jsonify({
            "status": "error",
            "error": str(e),
            "trace": traceback.format_exc()
        }), 500


@api_bp.route("/stats/trends")
def get_stats_trends():
    """Phân tích và xác định các hướng nghiên cứu mới nổi và từ khóa công nghệ mới."""
    try:
        conn = get_neo4j_connection()
        
        # 1. Phân tích xu hướng theo lĩnh vực nghiên cứu (LinhVucNghienCuu)
        # Lấy tất cả lĩnh vực
        lv_nodes = conn.query("""
            MATCH (lv:LinhVucNghienCuu)
            WHERE coalesce(lv.is_deleted, false) = false
            RETURN lv.id AS id, lv.ten_linh_vuc AS ten_linh_vuc
        """)
        
        # Lấy tất cả giảng viên và quan hệ nghiên cứu
        gv_lv_relations = conn.query("""
            MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
            WHERE coalesce(gv.is_deleted, false) = false AND coalesce(lv.is_deleted, false) = false
            RETURN gv.ho_va_ten AS gv_ten, lv.ten_linh_vuc AS lv_ten
        """)
        
        # Lấy tất cả bài báo cùng tác giả
        ct_nodes = conn.query("""
            MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
            WHERE coalesce(gv.is_deleted, false) = false AND coalesce(ct.is_deleted, false) = false
            RETURN ct.id AS id, ct.ten_cong_trinh AS title, ct.tom_tat AS summary, ct.nam_xuat_ban AS nam, gv.ho_va_ten AS gv_ten
        """)

        # Xây dựng danh sách lĩnh vực của từng giảng viên
        gv_fields = {}
        for r in gv_lv_relations:
            gv = r["gv_ten"]
            lv = r["lv_ten"]
            if gv not in gv_fields:
                gv_fields[gv] = []
            gv_fields[gv].append(lv)

        # Tạo cấu trúc lưu trữ công trình theo lĩnh vực
        field_papers = {lv["ten_linh_vuc"]: {"total": set(), "recent": set(), "lecturers": set(), "id": lv["id"]} for lv in lv_nodes}

        def to_int(v):
            try:
                return int(v)
            except:
                return 0

        # Hàm kiểm tra trùng khớp từ khóa
        import re
        def check_match(title, summary, field_name):
            text = f"{title or ''} {summary or ''}"
            text_norm = remove_accents(text.lower())
            field_norm = remove_accents(field_name.lower())
            
            if field_norm in text_norm:
                return True
                
            mappings = {
                "machine learning": ["hoc may", "machine learning", "ml", "classification", "deep learning", "neural network", "svm", "knn", "random forest"],
                "data science": ["khoa hoc du lieu", "data science", "analytics", "prediction", "du bao", "statistical"],
                "business intelligence": ["tri tue kinh doanh", "business intelligence", "dashboard", "kho du lieu", "data warehouse", "bi "],
                "data mining": ["khai pha du lieu", "data mining", "clustering", "association rule", "apriori", "phan cum"],
                "big data": ["du lieu lon", "big data", "hadoop", "spark", "mapreduce", "nosql", "cloud computing"],
                "system analysis and design": ["thiet ke he thong", "system analysis", "uml", "use case", "diagram", "analysing", "software design"]
            }
            
            for key, terms in mappings.items():
                if key in field_norm:
                    for term in terms:
                        if term in text_norm:
                            return True
            
            ignore_words = {"and", "or", "design", "analysis", "system", "phan", "tich", "thiet", "ke", "he", "thong", "cua", "trong", "cho"}
            field_words = [w for w in re.findall(r'\b\w+\b', field_norm) if w not in ignore_words and len(w) > 2]
            for w in field_words:
                if w in text_norm:
                    return True
                    
            return False

        # Phân phối bài báo vào lĩnh vực tương ứng của giảng viên dựa trên từ khóa tiêu đề/tóm tắt
        for ct in ct_nodes:
            ct_id = ct["id"]
            title = ct["title"]
            summary = ct["summary"]
            nam = ct["nam"]
            gv = ct["gv_ten"]
            
            fields_of_gv = gv_fields.get(gv, [])
            if not fields_of_gv:
                continue
                
            matched_any = False
            for field in fields_of_gv:
                if field in field_papers:
                    if check_match(title, summary, field):
                        field_papers[field]["total"].add(ct_id)
                        if nam and to_int(nam) >= 2023:
                            field_papers[field]["recent"].add(ct_id)
                        field_papers[field]["lecturers"].add(gv)
                        matched_any = True
            
            # Fallback: Nếu không khớp từ khóa đặc trưng nào, gán tạm vào lĩnh vực đầu tiên của giảng viên
            if not matched_any and fields_of_gv:
                first_field = fields_of_gv[0]
                if first_field in field_papers:
                    field_papers[first_field]["total"].add(ct_id)
                    if nam and to_int(nam) >= 2023:
                        field_papers[first_field]["recent"].add(ct_id)
                    field_papers[first_field]["lecturers"].add(gv)

        trends = []
        for field, stats in field_papers.items():
            tong = len(stats["total"])
            ganday = len(stats["recent"])
            cugiang = tong - ganday
            
            # Tính toán tỷ lệ tăng trưởng và điểm xu hướng
            growth_rate = round((ganday / (cugiang + 1)) * 100, 1)
            trend_score = round((ganday * 2.0) + (growth_rate * 0.05), 1)
            
            if tong > 0:
                trends.append({
                    "id": stats["id"],
                    "ten_linh_vuc": field,
                    "tong_so_bai": tong,
                    "so_bai_gan_day": ganday,
                    "growth_rate": growth_rate,
                    "trend_score": trend_score,
                    "giang_vien_chot": list(stats["lecturers"])[:3]
                })
            
        # Sắp xếp theo điểm xu hướng giảm dần
        trends = sorted(trends, key=lambda x: x["trend_score"], reverse=True)
        
        # 2. Phân tích trích xuất từ khóa mới nổi từ tiêu đề và tóm tắt bài báo
        pubs = conn.query("""
            MATCH (ct:CongTrinhNghienCuu)
            WHERE coalesce(ct.is_deleted, false) = false AND ct.nam_xuat_ban IS NOT NULL
            RETURN ct.ten_cong_trinh AS title, ct.tom_tat AS summary, toInteger(ct.nam_xuat_ban) AS nam
        """)
        
        # Trích xuất từ khóa bằng NLP cơ bản
        import re
        stopwords = {
            # Tiếng Việt có dấu
            "và", "của", "là", "trong", "cho", "với", "các", "những", "được", "về", "một", "đã", "có", "tại", "để", "này", "từ", 
            "sự", "trên", "nhằm", "vào", "đến", "theo", "qua", "như", "bằng", "đối", "tượng", "kết", "quả", "ứng", "dụng", "nghiên", 
            "cứu", "phát", "triển", "đề", "tài", "hệ", "thống", "xây", "dựng", "phân", "tích", "đánh", "giá", "giải", "pháp", "học", 
            "tập", "quản", "lý", "dữ", "liệu", "thông", "tin", "khoa", "học", "công", "nghệ", "một", "số", "chủ", "đề", "dựa", "hiệu",
            "quả", "nâng", "cao", "tối", "ưu", "thực", "trạng", "nhu", "cầu", "thế", "hệ", "mới", "hướng", "dẫn", "khảo", "sát",
            "thiết", "kế", "chương", "trình", "mô", "hình", "phương", "pháp", "kiểu", "loại", "mục", "tiêu", "nhiệm", "vụ", "nội", "dung",
            "bài", "báo", "cáo", "xuất", "bản", "tập", "thể", "cá", "nhân", "trường", "đại", "học",
            # Tiếng Việt không dấu
            "va", "cua", "la", "trong", "cho", "voi", "cac", "nhung", "duoc", "ve", "mot", "da", "co", "tai", "de", "nay", "tu", 
            "su", "tren", "nham", "vao", "den", "theo", "qua", "nhu", "bang", "doi", "tuong", "ket", "qua", "ung", "dung", "nghien", 
            "cuu", "phat", "trien", "de", "tai", "he", "thong", "xay", "dung", "phan", "tich", "danh", "gia", "giai", "phap", "hoc", 
            "tap", "quan", "ly", "du", "lieu", "thong", "tin", "khoa", "hoc", "cong", "nghe", "mot", "so", "chu", "de", "dua", "hieu",
            "qua", "nang", "cao", "toi", "uu", "thuc", "trang", "nhu", "cau", "the", "he", "moi", "huong", "dan", "khao", "sat",
            "thiet", "ke", "chuong", "trinh", "mo", "hinh", "phuong", "phap", "kieu", "loai", "muc", "tieu", "niem", "vu", "noi", "dung",
            "bai", "bao", "cao", "xuat", "ban", "tap", "the", "ca", "nhan", "truong", "dai", "hoc",
            # Tiếng Anh
            "and", "the", "a", "of", "in", "to", "for", "with", "on", "at", "by", "an", "is", "are", "was", "were", "be", "been",
            "has", "have", "had", "it", "its", "they", "their", "this", "that", "these", "those", "from", "using", "based", 
            "analysis", "design", "development", "implementation", "study", "research", "system", "model", "method", "approach",
            "evaluation", "application", "framework", "algorithm", "paper", "data", "results", "proposed", "new", "using", "use"
        }
        
        def is_stopword(w):
            w_lower = w.lower()
            w_no_accents = remove_accents(w_lower)
            return (
                w_lower in stopwords or 
                w_no_accents in stopwords or 
                len(w_no_accents) <= 2 or 
                w_no_accents.isdigit()
            )
        
        recent_year = 2022
        word_counts = {}
        for p in pubs:
            if not p["nam"] or p["nam"] < recent_year:
                continue
            text = f"{p.get('title', '')} {p.get('summary', '') or ''}"
            words = re.findall(r'\b\w+\b', text.lower())
            
            # Extract unigrams, bigrams, and trigrams
            for i in range(len(words)):
                w1 = words[i]
                if not is_stopword(w1):
                    word_counts[w1] = word_counts.get(w1, 0) + 1.0
                
                if i < len(words) - 1:
                    w2 = words[i+1]
                    if not is_stopword(w1) and not is_stopword(w2):
                        bigram = f"{w1} {w2}"
                        word_counts[bigram] = word_counts.get(bigram, 0) + 1.8
                        
                if i < len(words) - 2:
                    w2 = words[i+1]
                    w3 = words[i+2]
                    if not is_stopword(w1) and not is_stopword(w2) and not is_stopword(w3):
                        trigram = f"{w1} {w2} {w3}"
                        word_counts[trigram] = word_counts.get(trigram, 0) + 2.5
                        
        sorted_kws = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        keywords = []
        seen = set()
        for kw, score in sorted_kws:
            display_kw = kw.title()
            if any(is_stopword(w) for w in kw.split()):
                continue
                
            # Lọc các từ đơn tiếng Việt (thường là các âm tiết đơn lẻ như "Toán", "Mạng"...)
            if " " not in kw:
                has_non_ascii = any(ord(c) > 127 for c in kw)
                if has_non_ascii or len(kw) <= 3:
                    continue
                    
            if display_kw not in seen:
                seen.add(display_kw)
                keywords.append({
                    "keyword": display_kw,
                    "score": round(score, 1)
                })
                if len(keywords) >= 15:
                    break
                    
        return jsonify({
            "status": "ok",
            "trends": trends[:8],
            "keywords": keywords
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
