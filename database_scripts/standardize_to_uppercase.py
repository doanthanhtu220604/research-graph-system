# -*- coding: utf-8 -*-
"""
Script to standardize database to uppercase and deduplicate nodes.
"""

import sys
import os
import io

# Set encoding to UTF-8 for console output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add project root to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.neo4j_connection import Neo4jConnection

def standardize_properties(conn):
    print("=== [1] Standardizing properties to uppercase ===")
    
    # Label: LinhVucNghienCuu -> ten_linh_vuc
    res = conn.write("""
        MATCH (lv:LinhVucNghienCuu)
        WHERE lv.ten_linh_vuc IS NOT NULL AND lv.ten_linh_vuc <> toUpper(lv.ten_linh_vuc)
        SET lv.ten_linh_vuc = toUpper(lv.ten_linh_vuc)
        RETURN count(lv) AS count
    """)
    print(f"LinhVucNghienCuu ten_linh_vuc updated: {res[0]['count'] if res else 0}")
    
    # Label: BoMon -> ten_bo_mon
    res = conn.write("""
        MATCH (bm:BoMon)
        WHERE bm.ten_bo_mon IS NOT NULL AND bm.ten_bo_mon <> toUpper(bm.ten_bo_mon)
        SET bm.ten_bo_mon = toUpper(bm.ten_bo_mon)
        RETURN count(bm) AS count
    """)
    print(f"BoMon ten_bo_mon updated: {res[0]['count'] if res else 0}")

    # Label: GiangVien -> ho_va_ten, hoc_vi, chuc_danh, chuc_vu, chuyen_nganh
    res = conn.write("""
        MATCH (gv:GiangVien)
        SET gv.ho_va_ten = CASE WHEN gv.ho_va_ten IS NOT NULL THEN toUpper(gv.ho_va_ten) ELSE gv.ho_va_ten END,
            gv.hoc_vi = CASE WHEN gv.hoc_vi IS NOT NULL THEN toUpper(gv.hoc_vi) ELSE gv.hoc_vi END,
            gv.chuc_danh = CASE WHEN gv.chuc_danh IS NOT NULL THEN toUpper(gv.chuc_danh) ELSE gv.chuc_danh END,
            gv.chuc_vu = CASE WHEN gv.chuc_vu IS NOT NULL THEN toUpper(gv.chuc_vu) ELSE gv.chuc_vu END,
            gv.chuyen_nganh = CASE WHEN gv.chuyen_nganh IS NOT NULL THEN toUpper(gv.chuyen_nganh) ELSE gv.chuyen_nganh END,
            gv.pending_ho_va_ten = CASE WHEN gv.pending_ho_va_ten IS NOT NULL THEN toUpper(gv.pending_ho_va_ten) ELSE gv.pending_ho_va_ten END,
            gv.pending_hoc_vi = CASE WHEN gv.pending_hoc_vi IS NOT NULL THEN toUpper(gv.pending_hoc_vi) ELSE gv.pending_hoc_vi END,
            gv.pending_chuc_danh = CASE WHEN gv.pending_chuc_danh IS NOT NULL THEN toUpper(gv.pending_chuc_danh) ELSE gv.pending_chuc_danh END,
            gv.pending_chuc_vu = CASE WHEN gv.pending_chuc_vu IS NOT NULL THEN toUpper(gv.pending_chuc_vu) ELSE gv.pending_chuc_vu END,
            gv.pending_chuyen_nganh = CASE WHEN gv.pending_chuyen_nganh IS NOT NULL THEN toUpper(gv.pending_chuyen_nganh) ELSE gv.pending_chuyen_nganh END,
            gv.pending_bo_mon = CASE WHEN gv.pending_bo_mon IS NOT NULL THEN toUpper(gv.pending_bo_mon) ELSE gv.pending_bo_mon END
        RETURN count(gv) AS count
    """)
    print(f"GiangVien name and educational details updated: {res[0]['count'] if res else 0}")
    
    # Label: TacGiaNgoai -> ho_va_ten, hoc_vi, chuc_danh, don_vi_cong_tac
    res = conn.write("""
        MATCH (tgn:TacGiaNgoai)
        SET tgn.ho_va_ten = CASE WHEN tgn.ho_va_ten IS NOT NULL THEN toUpper(tgn.ho_va_ten) ELSE tgn.ho_va_ten END,
            tgn.hoc_vi = CASE WHEN tgn.hoc_vi IS NOT NULL THEN toUpper(tgn.hoc_vi) ELSE tgn.hoc_vi END,
            tgn.chuc_danh = CASE WHEN tgn.chuc_danh IS NOT NULL THEN toUpper(tgn.chuc_danh) ELSE tgn.chuc_danh END,
            tgn.don_vi_cong_tac = CASE WHEN tgn.don_vi_cong_tac IS NOT NULL THEN toUpper(tgn.don_vi_cong_tac) ELSE tgn.don_vi_cong_tac END
        RETURN count(tgn) AS count
    """)
    print(f"TacGiaNgoai details updated: {res[0]['count'] if res else 0}")

    # Label: CongTrinhNghienCuu -> ten_cong_trinh, noi_xuat_ban
    res = conn.write("""
        MATCH (ct:CongTrinhNghienCuu)
        SET ct.ten_cong_trinh = CASE WHEN ct.ten_cong_trinh IS NOT NULL THEN toUpper(ct.ten_cong_trinh) ELSE ct.ten_cong_trinh END,
            ct.noi_xuat_ban = CASE WHEN ct.noi_xuat_ban IS NOT NULL THEN toUpper(ct.noi_xuat_ban) ELSE ct.noi_xuat_ban END
        RETURN count(ct) AS count
    """)
    print(f"CongTrinhNghienCuu details updated: {res[0]['count'] if res else 0}")

    # Label: DeTaiNghienCuu -> ten_de_tai, cap_de_tai
    res = conn.write("""
        MATCH (dt:DeTaiNghienCuu)
        SET dt.ten_de_tai = CASE WHEN dt.ten_de_tai IS NOT NULL THEN toUpper(dt.ten_de_tai) ELSE dt.ten_de_tai END,
            dt.cap_de_tai = CASE WHEN dt.cap_de_tai IS NOT NULL THEN toUpper(dt.cap_de_tai) ELSE dt.cap_de_tai END
        RETURN count(dt) AS count
    """)
    print(f"DeTaiNghienCuu details updated: {res[0]['count'] if res else 0}")

    # Label: DaiHoc -> ten_dai_hoc
    res = conn.write("""
        MATCH (dh:DaiHoc)
        WHERE dh.ten_dai_hoc IS NOT NULL AND dh.ten_dai_hoc <> toUpper(dh.ten_dai_hoc)
        SET dh.ten_dai_hoc = toUpper(dh.ten_dai_hoc)
        RETURN count(dh) AS count
    """)
    print(f"DaiHoc details updated: {res[0]['count'] if res else 0}")

    # Label: TruongCon -> ten_truong
    res = conn.write("""
        MATCH (tc:TruongCon)
        WHERE tc.ten_truong IS NOT NULL AND tc.ten_truong <> toUpper(tc.ten_truong)
        SET tc.ten_truong = toUpper(tc.ten_truong)
        RETURN count(tc) AS count
    """)
    print(f"TruongCon details updated: {res[0]['count'] if res else 0}")

    # Label: Khoa -> ten_khoa
    res = conn.write("""
        MATCH (k:Khoa)
        WHERE k.ten_khoa IS NOT NULL AND k.ten_khoa <> toUpper(k.ten_khoa)
        SET k.ten_khoa = toUpper(k.ten_khoa)
        RETURN count(k) AS count
    """)
    print(f"Khoa details updated: {res[0]['count'] if res else 0}")


def deduplicate_label(conn, label, key_prop):
    print(f"\n=== [2] Deduplicating label {label} by property {key_prop} ===")
    
    # Query to find duplicate groups
    query = f"""
    MATCH (n:{label})
    WHERE n.{key_prop} IS NOT NULL AND n.{key_prop} <> ""
    WITH n.{key_prop} AS key_val, collect(n) AS nodes
    WHERE size(nodes) > 1
    RETURN key_val, [x in nodes | {{id: id(x), string_id: x.id}}] AS nodes_info
    """
    duplicates = conn.query(query)
    print(f"Found {len(duplicates)} duplicate groups of {label}.")
    
    total_merged = 0
    for group in duplicates:
        key_val = group["key_val"]
        nodes_info = group["nodes_info"]
        
        # Sort nodes: survivors first
        # We prioritize nodes with a valid string_id (e.g. gv_3, ct_12) and then by lowest internal id
        nodes_info.sort(key=lambda x: (0 if x["string_id"] else 1, x["id"]))
        
        survivor_info = nodes_info[0]
        surv_id = survivor_info["id"]
        
        print(f"Merging duplicate group '{key_val}' (survivor Neo4j ID: {surv_id}):")
        
        for dup_info in nodes_info[1:]:
            dup_id = dup_info["id"]
            print(f"  <- Merging duplicate Neo4j ID: {dup_id}")
            
            # 1. Fetch properties of both
            props_res = conn.query_single("""
                MATCH (surv) WHERE id(surv) = $surv_id
                MATCH (dup) WHERE id(dup) = $dup_id
                RETURN properties(surv) AS surv_props, properties(dup) AS dup_props
            """, {"surv_id": surv_id, "dup_id": dup_id})
            
            if props_res:
                surv_props = props_res["surv_props"] or {}
                dup_props = props_res["dup_props"] or {}
                
                # Merge: duplicate properties are copied to survivor only if survivor doesn't have them (or has empty value)
                merged_props = dup_props.copy()
                merged_props.update({k: v for k, v in surv_props.items() if v is not None and v != ""})
                
                # Write back to survivor
                conn.write("MATCH (surv) WHERE id(surv) = $surv_id SET surv = $props", {"surv_id": surv_id, "props": merged_props})
            
            # 2. Redirect all relationships of duplicate node to survivor
            rels = conn.query("""
                MATCH (dup) WHERE id(dup) = $dup_id
                MATCH (dup)-[r]-(other)
                RETURN type(r) AS type, startNode(r) = dup AS is_outgoing, id(other) AS other_id, properties(r) AS props
            """, {"dup_id": dup_id})
            
            for rel in rels:
                rel_type = rel["type"]
                other_id = rel["other_id"]
                props = rel["props"]
                if rel["is_outgoing"]:
                    conn.write(f"""
                        MATCH (surv), (other)
                        WHERE id(surv) = $surv_id AND id(other) = $other_id
                        MERGE (surv)-[r:{rel_type}]->(other)
                        ON CREATE SET r = $props
                        ON MATCH SET r += $props
                    """, {"surv_id": surv_id, "other_id": other_id, "props": props})
                else:
                    conn.write(f"""
                        MATCH (surv), (other)
                        WHERE id(surv) = $surv_id AND id(other) = $other_id
                        MERGE (other)-[r:{rel_type}]->(surv)
                        ON CREATE SET r = $props
                        ON MATCH SET r += $props
                    """, {"surv_id": surv_id, "other_id": other_id, "props": props})
            
            # 3. Detach delete duplicate node
            conn.write("MATCH (dup) WHERE id(dup) = $dup_id DETACH DELETE dup", {"dup_id": dup_id})
            total_merged += 1
            
    print(f"Finished deduplication for {label}. Total merged: {total_merged}")


def main():
    try:
        with Neo4jConnection() as conn:
            # Step 1: Standardize properties to uppercase
            standardize_properties(conn)
            
            # Step 2: Deduplicate nodes
            # We run deduplication on:
            # - LinhVucNghienCuu (ten_linh_vuc)
            # - BoMon (ten_bo_mon)
            # - TacGiaNgoai (ho_va_ten)
            # - CongTrinhNghienCuu (ten_cong_trinh)
            # - DeTaiNghienCuu (ten_de_tai)
            deduplicate_label(conn, "LinhVucNghienCuu", "ten_linh_vuc")
            deduplicate_label(conn, "BoMon", "ten_bo_mon")
            deduplicate_label(conn, "TacGiaNgoai", "ho_va_ten")
            deduplicate_label(conn, "CongTrinhNghienCuu", "ten_cong_trinh")
            deduplicate_label(conn, "DeTaiNghienCuu", "ten_de_tai")
            
            print("\n✅ Database standardization and deduplication completed successfully!")
            
    except Exception as e:
        print(f"\n❌ Error during execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
