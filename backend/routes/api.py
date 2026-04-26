"""
API Routes cho Knowledge Map.
Cung cấp endpoints để frontend truy vấn dữ liệu từ Neo4j.
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

api_bp = Blueprint("api", __name__, url_prefix="/api")


# ============================================================
# GIẢNG VIÊN
# ============================================================

@api_bp.route("/giang-vien")
def get_all_giang_vien():
    """Lấy danh sách tất cả giảng viên."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (gv:GiangVien)
        OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
        RETURN gv, bm.ten_bo_mon AS bo_mon
        ORDER BY gv.ho_va_ten
    """)
    giang_vien_list = []
    for r in results:
        gv = dict(r["gv"])
        gv["bo_mon"] = r["bo_mon"]
        giang_vien_list.append(gv)
    return jsonify({"status": "ok", "data": giang_vien_list})


@api_bp.route("/giang-vien/<gv_id>")
def get_giang_vien_detail(gv_id):
    """Lấy chi tiết giảng viên và các mối quan hệ."""
    conn = get_neo4j_connection()

    # Thông tin cơ bản
    gv = conn.query_single("""
        MATCH (gv:GiangVien) WHERE gv.id = $id
        OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
        RETURN gv, bm.ten_bo_mon AS bo_mon
    """, {"id": gv_id})

    if not gv:
        return jsonify({"status": "error", "message": "Không tìm thấy giảng viên"}), 404

    # Công trình nghiên cứu
    cong_trinh = conn.query("""
        MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
        WHERE gv.id = $id
        RETURN ct
        ORDER BY ct.nam_xuat_ban DESC
    """, {"id": gv_id})

    # Đề tài nghiên cứu
    de_tai = conn.query("""
        MATCH (gv:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
        WHERE gv.id = $id
        RETURN dt, type(r) AS vai_tro
    """, {"id": gv_id})

    # Lĩnh vực nghiên cứu
    linh_vuc = conn.query("""
        MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
        WHERE gv.id = $id
        RETURN lv.ten_linh_vuc AS ten_linh_vuc
    """, {"id": gv_id})

    result = dict(gv["gv"]) if gv and "gv" in gv else {}
    result["bo_mon"] = gv["bo_mon"] if gv and "bo_mon" in gv else None

    # Check if cong_trinh is actually returned a valid node
    result["cong_trinh"] = []
    for r in cong_trinh:
        if r.get("ct"):
            ct_item = dict(r["ct"])
            result["cong_trinh"].append(ct_item)
            
    # Check if de_tai is actually returned a valid node
    result["de_tai"] = []
    for r in de_tai:
        if r.get("dt"):
            dt_item = dict(r["dt"])
            result["de_tai"].append({"de_tai": dt_item, "vai_tro": r.get("vai_tro")})

    # Lĩnh vực nghiên cứu
    result["linh_vuc"] = [r["ten_linh_vuc"] for r in linh_vuc if r.get("ten_linh_vuc")]

    return jsonify({"status": "ok", "data": result})


# ============================================================
# CÔNG TRÌNH NGHIÊN CỨU
# ============================================================

@api_bp.route("/cong-trinh")
def get_all_cong_trinh():
    """Lấy danh sách công trình nghiên cứu."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (ct:CongTrinhNghienCuu)
        OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct)
        RETURN ct, collect(gv.ho_va_ten) AS tac_gia
        ORDER BY ct.nam_xuat_ban DESC, coalesce(ct.created_at, 0) DESC, id(ct) DESC
    """)
    cong_trinh_list = []
    for r in results:
        ct = dict(r["ct"])
        ct["tac_gia"] = r["tac_gia"]
        cong_trinh_list.append(ct)
    return jsonify({"status": "ok", "data": cong_trinh_list})


@api_bp.route("/cong-trinh/<ct_id>")
def get_cong_trinh_detail(ct_id):
    """Lấy chi tiết công trình nghiên cứu."""
    conn = get_neo4j_connection()
    result = conn.query_single("""
        MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
        OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct)
        RETURN ct, collect(gv.ho_va_ten) AS tac_gia
    """, {"id": ct_id})

    tac_gia_ngoai_res = conn.query("""
        MATCH (tgn:TacGiaNgoai)-[:DONG_TAC_GIA]->(ct:CongTrinhNghienCuu)
        WHERE ct.id = $id
        RETURN tgn.ho_va_ten AS ten, tgn.don_vi_cong_tac AS don_vi
    """, {"id": ct_id})
    
    if not result or not result.get("ct"):
        return jsonify({"status": "error", "message": "Không tìm thấy công trình"}), 404
        
    data = dict(result["ct"])
    data["tac_gia"] = result["tac_gia"]
    data["tac_gia_ngoai"] = [
        {"ten": r["ten"], "don_vi": r["don_vi"]} for r in tac_gia_ngoai_res
    ]
    return jsonify({"status": "ok", "data": data})


# ============================================================
# ĐỀ TÀI NGHIÊN CỨU
# ============================================================

@api_bp.route("/de-tai")
def get_all_de_tai():
    """Lấy danh sách đề tài nghiên cứu."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (dt:DeTaiNghienCuu)
        OPTIONAL MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt)
        RETURN dt, collect(gv.ho_va_ten) AS chu_nhiem
        ORDER BY coalesce(dt.created_at, 0) DESC, id(dt) DESC
    """)
    de_tai_list = []
    for r in results:
        dt = dict(r["dt"])
        dt["chu_nhiem"] = r["chu_nhiem"]
        de_tai_list.append(dt)
    return jsonify({"status": "ok", "data": de_tai_list})


@api_bp.route("/de-tai/<dt_id>")
def get_de_tai_detail(dt_id):
    """Lấy chi tiết đề tài nghiên cứu."""
    conn = get_neo4j_connection()
    result = conn.query_single("""
        MATCH (dt:DeTaiNghienCuu) WHERE dt.id = $id
        OPTIONAL MATCH (gv:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt)
        RETURN dt, collect({ten: gv.ho_va_ten, vai_tro: type(r)}) AS thanh_vien
    """, {"id": dt_id})

    tac_gia_ngoai_res = conn.query("""
        MATCH (tgn:TacGiaNgoai)-[:DONG_TAC_GIA]->(dt:DeTaiNghienCuu)
        WHERE dt.id = $id
        RETURN tgn.ho_va_ten AS ten, tgn.don_vi_cong_tac AS don_vi
    """, {"id": dt_id})

    if not result or not result.get("dt"):
        return jsonify({"status": "error", "message": "Không tìm thấy đề tài"}), 404
        
    data = dict(result["dt"])
    data["thanh_vien"] = result["thanh_vien"]
    data["tac_gia_ngoai"] = [
        {"ten": r["ten"], "don_vi": r["don_vi"]} for r in tac_gia_ngoai_res
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
        RETURN lv
        ORDER BY lv.ten_linh_vuc
    """)
    linh_vuc_list = []
    for r in results:
        lv = dict(r["lv"])
        linh_vuc_list.append(lv)
    return jsonify({"status": "ok", "data": linh_vuc_list})

@api_bp.route("/search")
def search():
    """Tìm kiếm tổng hợp theo từ khóa với bộ lọc loại thực thể."""
    q = request.args.get("q", "").strip()
    search_type = request.args.get("type", "all").strip().lower()
    
    if not q:
        return jsonify({"status": "ok", "data": []})

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
        # Xây dựng câu truy vấn động dựa trên label_filter
        query = f"""
            MATCH (n{label_filter})
            WHERE NOT (n:TacGiaNgoai AND EXISTS {{
                MATCH (gv:GiangVien) WHERE gv.ho_va_ten = n.ho_va_ten
            }})
              AND (toLower(coalesce(n.ho_va_ten, '')) CONTAINS toLower($q)
               OR toLower(coalesce(n.ten_cong_trinh, '')) CONTAINS toLower($q)
               OR toLower(coalesce(n.ten_de_tai, '')) CONTAINS toLower($q)
               OR toLower(coalesce(n.ten_bo_mon, '')) CONTAINS toLower($q)
               OR toLower(coalesce(n.ten_khoa, '')) CONTAINS toLower($q)
               OR toLower(coalesce(n.email, '')) CONTAINS toLower($q)
               OR toLower(coalesce(n.hoc_vi, '')) CONTAINS toLower($q)
               OR toLower(coalesce(n.chuc_danh, '')) CONTAINS toLower($q))
            RETURN n, labels(n) AS labels
            LIMIT 30
        """
        
        results = conn.query(query, {"q": q})

        data = []
        for r in results:
            item = dict(r["n"])
            item["_labels"] = r["labels"]
            data.append(item)
        return jsonify({"status": "ok", "data": data, "query": q, "type": search_type})

        data = []
        for r in results:
            item = dict(r["n"])
            item["id"] = r["node_id"]
            item["_labels"] = r["labels"]
            data.append(item)
        return jsonify({"status": "ok", "data": data, "query": q})
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
        WHERE n.id IS NOT NULL
        RETURN n.id AS id, labels(n) AS labels, properties(n) AS props
    """)

    # Lấy tất cả relationships
    edges_result = conn.query("""
        MATCH (a)-[r]->(b)
        WHERE a.id IS NOT NULL AND b.id IS NOT NULL
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

        gv_count = conn.query_single("MATCH (n:GiangVien) RETURN count(n) AS count")
        ct_count = conn.query_single("MATCH (n:CongTrinhNghienCuu) RETURN count(n) AS count")
        dt_count = conn.query_single("MATCH (n:DeTaiNghienCuu) RETURN count(n) AS count")
        bm_count = conn.query_single("MATCH (n:BoMon) RETURN count(n) AS count")

        # Top giảng viên theo số công trình
        top_gv = conn.query("""
            MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
            RETURN gv.ho_va_ten AS ten, gv.id AS id, count(ct) AS so_cong_trinh
            ORDER BY so_cong_trinh DESC
            LIMIT 10
        """)

        # Thống kê công trình theo năm xuất bản (5 năm gần nhất)
        ct_theo_nam = conn.query("""
            MATCH (ct:CongTrinhNghienCuu)
            WHERE ct.nam_xuat_ban IS NOT NULL AND toString(ct.nam_xuat_ban) <> ''
            RETURN toInteger(ct.nam_xuat_ban) AS nam, count(ct) AS so_luong
            ORDER BY nam ASC
        """)

        # Thống kê đề tài theo cấp
        dt_theo_cap = conn.query("""
            MATCH (dt:DeTaiNghienCuu)
            WHERE dt.cap_de_tai IS NOT NULL
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
            OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct)
            RETURN ct.id AS id,
                   ct.ten_cong_trinh AS ten_cong_trinh,
                   ct.loai_an_pham AS loai_an_pham,
                   ct.nam_xuat_ban AS nam_xuat_ban,
                   collect(gv.ho_va_ten) AS tac_gia
            ORDER BY ct.nam_xuat_ban DESC
            LIMIT 6
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
