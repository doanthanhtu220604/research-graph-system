import sys
from backend.services.neo4j_connection import get_neo4j_connection

# Pairs of (target_id_english, duplicate_id_vietnamese, english_name, vietnamese_name)
pairs_to_merge = [
    ("lv_123", "lv_221", "DATA SCIENCE", "KHOA HỌC DỮ LIỆU"),
    ("lv_302", "lv_295", "MACHINE LEARNING", "HỌC MÁY"),
    ("lv_301", "lv_296", "DATA MINING", "KHAI THÁC DỮ LIỆU"),
    ("lv_303", "lv_222", "BIG DATA", "DỮ LIỆU LỚN")
]

def merge_fields():
    conn = get_neo4j_connection()
    for target_id, duplicate_id, en_name, vi_name in pairs_to_merge:
        print(f"Merging '{vi_name}' ({duplicate_id}) into '{en_name}' ({target_id})...")
        try:
            # Run Cypher merge
            conn.write("""
                MATCH (target:LinhVucNghienCuu {id: $target_id})
                MATCH (duplicate:LinhVucNghienCuu {id: $duplicate_id})
                
                // Redirect incoming NGHIEN_CUU relationships
                OPTIONAL MATCH (source:GiangVien)-[r:NGHIEN_CUU]->(duplicate)
                FOREACH (ignoreMe IN CASE WHEN r IS NOT NULL THEN [1] ELSE [] END |
                    MERGE (source)-[:NGHIEN_CUU]->(target)
                )
                
                // Delete duplicate node and remaining relationships
                DETACH DELETE duplicate
            """, {
                "target_id": target_id,
                "duplicate_id": duplicate_id
            })
            print(f" Successfully merged '{vi_name}' into '{en_name}'.")
        except Exception as e:
            print(f" Error merging '{vi_name}': {e}")

if __name__ == "__main__":
    merge_fields()
