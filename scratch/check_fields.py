import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.services.neo4j_connection import get_neo4j_connection

def check():
    conn = get_neo4j_connection()
    with open("scratch/check_fields_output.txt", "w", encoding="utf-8") as f:
        f.write("--- All LinhVucNghienCuu in DB ---\n")
        fields = conn.query("MATCH (lv:LinhVucNghienCuu) RETURN lv.ten_linh_vuc AS name, labels(lv) AS labels")
        for row in fields:
            f.write(f"- {row['name']}\n")
            
        f.write("\n--- NGHIEN_CUU relationships count ---\n")
        count_rel = conn.query_single("MATCH ()-[r:NGHIEN_CUU]->() RETURN count(r) AS count")
        f.write(f"Total NGHIEN_CUU: {count_rel['count'] if count_rel else 0}\n")
        
        f.write("\n--- GiangVien relationship types ---\n")
        rel_types = conn.query("MATCH (gv:GiangVien)-[r]->(n) RETURN type(r) AS rel_type, labels(n)[0] AS target_label, count(r) AS count")
        for r in rel_types:
            f.write(f"- GiangVien -[{r['rel_type']}]-> {r['target_label']}: {r['count']}\n")
            
        f.write("\n--- Properties on GiangVien nodes (first 5) ---\n")
        gvs = conn.query("MATCH (gv:GiangVien) RETURN properties(gv) AS props LIMIT 5")
        for g in gvs:
            f.write(f"- {g['props'].get('ho_va_ten')}: keys: {list(g['props'].keys())}\n")
            if 'huong_nghien_cuu' in g['props']:
                f.write(f"  huong_nghien_cuu: {g['props']['huong_nghien_cuu']}\n")
            if 'linh_vuc' in g['props']:
                f.write(f"  linh_vuc: {g['props']['linh_vuc']}\n")

if __name__ == "__main__":
    check()
