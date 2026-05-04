"""
Collaboration Network API
Cung cấp dữ liệu phân tích mạng lưới hợp tác nghiên cứu giữa các giảng viên.
- Top cặp hợp tác nhiều nhất
- Top giảng viên kết nối nhiều nhất (Degree Centrality)
- Giảng viên "cầu nối" giữa các bộ môn (Bridge Connector)
- Dữ liệu đồ thị Vis.js cho mạng lưới hợp tác
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

collaboration_bp = Blueprint("collaboration", __name__, url_prefix="/api/collaboration")


# ============================================================
# 1. Thống kê tổng quan mạng lưới
# ============================================================

@collaboration_bp.route("/overview")
def get_collaboration_overview():
    """Thống kê tổng quan về mạng lưới hợp tác."""
    try:
        conn = get_neo4j_connection()

        # Tổng số mối quan hệ hợp tác qua công trình
        collab_ct = conn.query_single("""
            MATCH (gv1:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)
            WHERE id(gv1) < id(gv2)
            RETURN count(DISTINCT [gv1.id, gv2.id]) AS total
        """)

        # Tổng số mối quan hệ hợp tác qua đề tài
        collab_dt = conn.query_single("""
            MATCH (gv1:GiangVien)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)<-[:CHU_NHIEM|THAM_GIA]-(gv2:GiangVien)
            WHERE id(gv1) < id(gv2)
            RETURN count(DISTINCT [gv1.id, gv2.id]) AS total
        """)

        # Số GV tham gia ít nhất 1 hợp tác
        active_collab = conn.query_single("""
            MATCH (gv1:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)
            WHERE gv1 <> gv2
            WITH collect(DISTINCT gv1) + collect(DISTINCT gv2) AS gvs
            UNWIND gvs AS gv
            RETURN count(DISTINCT gv) AS total
        """)

        # Công trình có nhiều tác giả nhất
        max_authors = conn.query_single("""
            MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
            WITH ct, count(gv) AS so_tac_gia
            WHERE so_tac_gia > 1
            RETURN max(so_tac_gia) AS max_authors
        """)

        return jsonify({
            "status": "ok",
            "data": {
                "collab_pairs_ct": int(collab_ct["total"]) if collab_ct else 0,
                "collab_pairs_dt": int(collab_dt["total"]) if collab_dt else 0,
                "active_collaborators": int(active_collab["total"]) if active_collab else 0,
                "max_authors_in_paper": int(max_authors["max_authors"]) if max_authors and max_authors.get("max_authors") else 0,
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================
# 2. Top cặp hợp tác nhiều nhất
# ============================================================

@collaboration_bp.route("/top-pairs")
def get_top_pairs():
    """Top các cặp giảng viên hợp tác nhiều nhất (kết hợp công trình + đề tài)."""
    try:
        conn = get_neo4j_connection()
        limit = int(request.args.get("limit", 10))

        results = conn.query("""
            MATCH (gv1:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)
            WHERE id(gv1) < id(gv2)
            WITH gv1, gv2, count(DISTINCT ct) AS so_ct
            OPTIONAL MATCH (gv1)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)<-[:CHU_NHIEM|THAM_GIA]-(gv2)
            WITH gv1, gv2, so_ct, count(DISTINCT dt) AS so_dt
            WITH gv1, gv2, so_ct, so_dt, (so_ct + so_dt) AS tong_hop_tac
            ORDER BY tong_hop_tac DESC
            LIMIT $limit
            OPTIONAL MATCH (gv1)-[:THUOC_BO_MON]->(bm1:BoMon)
            OPTIONAL MATCH (gv2)-[:THUOC_BO_MON]->(bm2:BoMon)
            RETURN
                gv1.id AS id1, gv1.ho_va_ten AS ten1, gv1.hoc_vi AS hoc_vi1, bm1.ten_bo_mon AS bo_mon1,
                gv2.id AS id2, gv2.ho_va_ten AS ten2, gv2.hoc_vi AS hoc_vi2, bm2.ten_bo_mon AS bo_mon2,
                so_ct, so_dt, tong_hop_tac
        """, {"limit": limit})

        pairs = []
        for r in results:
            pairs.append({
                "gv1": {
                    "id": r["id1"], "ten": r["ten1"],
                    "hoc_vi": r["hoc_vi1"], "bo_mon": r["bo_mon1"]
                },
                "gv2": {
                    "id": r["id2"], "ten": r["ten2"],
                    "hoc_vi": r["hoc_vi2"], "bo_mon": r["bo_mon2"]
                },
                "so_cong_trinh": int(r["so_ct"]) if r["so_ct"] else 0,
                "so_de_tai": int(r["so_dt"]) if r["so_dt"] else 0,
                "tong_hop_tac": int(r["tong_hop_tac"]) if r["tong_hop_tac"] else 0,
            })

        return jsonify({"status": "ok", "data": pairs})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================
# 3. Top giảng viên kết nối nhiều nhất (Degree Centrality)
# ============================================================

@collaboration_bp.route("/top-connectors")
def get_top_connectors():
    """Top giảng viên có nhiều mối quan hệ hợp tác nhất (Degree Centrality)."""
    try:
        conn = get_neo4j_connection()
        limit = int(request.args.get("limit", 10))

        results = conn.query("""
            MATCH (gv:GiangVien)
            OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)
            WHERE gv <> gv2
            WITH gv, count(DISTINCT gv2) AS cong_su_ct
            OPTIONAL MATCH (gv)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)<-[:CHU_NHIEM|THAM_GIA]-(gv3:GiangVien)
            WHERE gv <> gv3
            WITH gv, cong_su_ct, count(DISTINCT gv3) AS cong_su_dt
            WHERE (cong_su_ct + cong_su_dt) > 0
            WITH gv, cong_su_ct, cong_su_dt, (cong_su_ct + cong_su_dt) AS tong_cong_su
            ORDER BY tong_cong_su DESC
            LIMIT $limit
            OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
            OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA]->(ct2:CongTrinhNghienCuu)
            RETURN gv.id AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi,
                   gv.anh_dai_dien AS avatar, bm.ten_bo_mon AS bo_mon,
                   cong_su_ct, cong_su_dt, tong_cong_su,
                   count(DISTINCT ct2) AS so_cong_trinh
        """, {"limit": limit})

        connectors = []
        for r in results:
            connectors.append({
                "id": r["id"],
                "ten": r["ten"],
                "hoc_vi": r["hoc_vi"],
                "avatar": r["avatar"],
                "bo_mon": r["bo_mon"],
                "cong_su_qua_ct": int(r["cong_su_ct"]) if r["cong_su_ct"] else 0,
                "cong_su_qua_dt": int(r["cong_su_dt"]) if r["cong_su_dt"] else 0,
                "tong_cong_su": int(r["tong_cong_su"]) if r["tong_cong_su"] else 0,
                "so_cong_trinh": int(r["so_cong_trinh"]) if r["so_cong_trinh"] else 0,
            })

        return jsonify({"status": "ok", "data": connectors})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================
# 4. Giảng viên "cầu nối" giữa các bộ môn (Bridge Connector)
# ============================================================

@collaboration_bp.route("/bridge-connectors")
def get_bridge_connectors():
    """Tìm giảng viên kết nối với nhiều bộ môn khác nhau (Bridge Connector)."""
    try:
        conn = get_neo4j_connection()

        results = conn.query("""
            MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm_own:BoMon)
            MATCH (gv)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)-[:THUOC_BO_MON]->(bm2:BoMon)
            WHERE gv <> gv2 AND bm_own <> bm2
            WITH gv, bm_own, collect(DISTINCT bm2.ten_bo_mon) AS bo_mon_ket_noi,
                 count(DISTINCT gv2) AS so_cong_su_khac_bm
            WHERE so_cong_su_khac_bm > 0
            ORDER BY size(bo_mon_ket_noi) DESC, so_cong_su_khac_bm DESC
            LIMIT 10
            OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA]->(ct2:CongTrinhNghienCuu)
            RETURN gv.id AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi,
                   gv.anh_dai_dien AS avatar, bm_own.ten_bo_mon AS bo_mon_chinh,
                   bo_mon_ket_noi, so_cong_su_khac_bm,
                   size(bo_mon_ket_noi) AS so_bo_mon_ket_noi,
                   count(DISTINCT ct2) AS so_cong_trinh
        """)

        bridges = []
        for r in results:
            bridges.append({
                "id": r["id"],
                "ten": r["ten"],
                "hoc_vi": r["hoc_vi"],
                "avatar": r["avatar"],
                "bo_mon_chinh": r["bo_mon_chinh"],
                "bo_mon_ket_noi": list(r["bo_mon_ket_noi"]) if r["bo_mon_ket_noi"] else [],
                "so_bo_mon_ket_noi": int(r["so_bo_mon_ket_noi"]) if r["so_bo_mon_ket_noi"] else 0,
                "so_cong_su_khac_bm": int(r["so_cong_su_khac_bm"]) if r["so_cong_su_khac_bm"] else 0,
                "so_cong_trinh": int(r["so_cong_trinh"]) if r["so_cong_trinh"] else 0,
            })

        return jsonify({"status": "ok", "data": bridges})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================
# 5. Đồ thị mạng lưới hợp tác (cho Vis.js)
# ============================================================

@collaboration_bp.route("/graph")
def get_collaboration_graph():
    """
    Lấy dữ liệu đồ thị mạng lưới hợp tác giảng viên cho Vis.js.
    Chỉ bao gồm các GV có ít nhất 1 quan hệ hợp tác.
    Độ dày cạnh = số lượng công trình/đề tài chung.
    Kích thước node = số lượng cộng sự.
    """
    try:
        conn = get_neo4j_connection()
        filter_bm = request.args.get("bo_mon", "")
        min_collab = int(request.args.get("min_collab", 1))

        # Lấy các cặp hợp tác qua công trình
        pairs_ct = conn.query("""
            MATCH (gv1:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)
            WHERE id(gv1) < id(gv2)
            WITH gv1, gv2, count(DISTINCT ct) AS so_ct
            WHERE so_ct >= $min_collab
            RETURN gv1.id AS id1, gv2.id AS id2, so_ct, 0 AS so_dt
        """, {"min_collab": min_collab})

        # Lấy các cặp hợp tác qua đề tài
        pairs_dt = conn.query("""
            MATCH (gv1:GiangVien)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)<-[:CHU_NHIEM|THAM_GIA]-(gv2:GiangVien)
            WHERE id(gv1) < id(gv2)
            WITH gv1, gv2, count(DISTINCT dt) AS so_dt
            WHERE so_dt >= 1
            RETURN gv1.id AS id1, gv2.id AS id2, 0 AS so_ct, so_dt
        """)

        # Gộp thành map các cặp
        edge_map = {}
        for r in pairs_ct:
            key = (r["id1"], r["id2"])
            edge_map[key] = {"so_ct": int(r["so_ct"]), "so_dt": 0}
        for r in pairs_dt:
            key = (r["id1"], r["id2"])
            if key in edge_map:
                edge_map[key]["so_dt"] = int(r["so_dt"])
            else:
                edge_map[key] = {"so_ct": 0, "so_dt": int(r["so_dt"])}

        # Lọc theo min_collab tổng
        edge_map = {k: v for k, v in edge_map.items() if v["so_ct"] + v["so_dt"] >= min_collab}

        if not edge_map:
            return jsonify({"status": "ok", "nodes": [], "edges": []})

        # Lấy ID các GV xuất hiện
        gv_ids = set()
        for (id1, id2) in edge_map.keys():
            gv_ids.add(id1)
            gv_ids.add(id2)

        # Tính degree (số cộng sự) của từng GV
        degree_map = {}
        for (id1, id2) in edge_map.keys():
            degree_map[id1] = degree_map.get(id1, 0) + 1
            degree_map[id2] = degree_map.get(id2, 0) + 1

        # Tính max degree để scale node size
        max_degree = max(degree_map.values()) if degree_map else 1

        # Màu theo bộ môn
        bm_colors = {
            "Bộ môn Công nghệ Phần mềm": "#4F8EF7",
            "Bộ môn Mạng máy tính": "#2ECC71",
            "Bộ môn Hệ thống thông tin": "#F39C12",
            "Bộ môn Khoa học máy tính": "#E74C3C",
            "Bộ môn Kỹ thuật máy tính": "#9B59B6",
        }
        default_color = "#95A5A6"

        # Lấy thông tin GV
        gv_info_results = conn.query("""
            MATCH (gv:GiangVien)
            WHERE gv.id IN $ids
            OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
            OPTIONAL MATCH (gv)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
            RETURN gv.id AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi,
                   gv.anh_dai_dien AS avatar, bm.ten_bo_mon AS bo_mon,
                   collect(DISTINCT lv.ten_linh_vuc) AS linh_vuc
        """, {"ids": list(gv_ids)})

        gv_info_map = {}
        for r in gv_info_results:
            # Lọc theo bộ môn nếu có filter
            if filter_bm and r["bo_mon"] != filter_bm:
                continue
            gv_info_map[r["id"]] = {
                "ten": r["ten"],
                "hoc_vi": r["hoc_vi"],
                "avatar": r["avatar"],
                "bo_mon": r["bo_mon"],
                "linh_vuc": list(r["linh_vuc"]) if r["linh_vuc"] else [],
            }

        # Build nodes
        nodes = []
        for gv_id, info in gv_info_map.items():
            degree = degree_map.get(gv_id, 1)
            # Scale kích thước node: min 15, max 45
            size = 15 + int((degree / max_degree) * 30)
            color = bm_colors.get(info["bo_mon"], default_color)
            nodes.append({
                "id": gv_id,
                "label": info["ten"] or gv_id,
                "title": info["ten"],
                "group": info["bo_mon"] or "Khác",
                "color": color,
                "size": size,
                "degree": degree,
                "hoc_vi": info["hoc_vi"],
                "bo_mon": info["bo_mon"],
                "linh_vuc": info["linh_vuc"],
                "shape": "dot",
            })

        # Build edges (chỉ giữa các GV còn trong gv_info_map sau filter)
        edges = []
        edge_id = 0
        for (id1, id2), counts in edge_map.items():
            if id1 not in gv_info_map or id2 not in gv_info_map:
                continue
            tong = counts["so_ct"] + counts["so_dt"]
            # Độ dày cạnh: scale từ 1 đến 8
            width = min(8, 1 + tong)
            edges.append({
                "id": edge_id,
                "from": id1,
                "to": id2,
                "width": width,
                "so_cong_trinh": counts["so_ct"],
                "so_de_tai": counts["so_dt"],
                "tong": tong,
                "title": f"{counts['so_ct']} công trình, {counts['so_dt']} đề tài chung",
                "color": {"color": "rgba(79,142,247,0.35)", "highlight": "#4F8EF7", "hover": "#4F8EF7"},
            })
            edge_id += 1

        # Legend cho bộ môn
        legend = {bm: {"color": color} for bm, color in bm_colors.items()}
        legend["Khác"] = {"color": default_color}

        return jsonify({
            "status": "ok",
            "nodes": nodes,
            "edges": edges,
            "legend": legend,
        })
    except Exception as e:
        import traceback
        return jsonify({"status": "error", "message": str(e), "trace": traceback.format_exc()}), 500


# ============================================================
# 6. Lấy danh sách bộ môn (cho dropdown filter)
# ============================================================

@collaboration_bp.route("/bo-mon")
def get_bo_mon_list():
    """Lấy danh sách bộ môn cho dropdown filter."""
    try:
        conn = get_neo4j_connection()
        results = conn.query("""
            MATCH (bm:BoMon)
            OPTIONAL MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm)
            RETURN bm.ten_bo_mon AS ten, count(gv) AS so_gv
            ORDER BY so_gv DESC
        """)
        return jsonify({
            "status": "ok",
            "data": [{"ten": r["ten"], "so_gv": int(r["so_gv"])} for r in results]
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
