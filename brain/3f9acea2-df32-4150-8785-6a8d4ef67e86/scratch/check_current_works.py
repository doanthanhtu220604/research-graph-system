# -*- coding: utf-8 -*-
import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, project_root)

from backend.services.neo4j_connection import get_neo4j_connection

def main():
    conn = get_neo4j_connection()
    try:
        # Count total CongTrinhNghienCuu nodes
        total = conn.query_single("MATCH (ct:CongTrinhNghienCuu) RETURN count(ct) AS count")
        
        # Count works with non-empty Vietnamese title
        has_vi = conn.query_single("MATCH (ct:CongTrinhNghienCuu) WHERE ct.ten_cong_trinh_vi IS NOT NULL AND ct.ten_cong_trinh_vi <> '' RETURN count(ct) AS count")
        
        # Count works with empty/null Vietnamese title
        no_vi = conn.query_single("MATCH (ct:CongTrinhNghienCuu) WHERE ct.ten_cong_trinh_vi IS NULL OR ct.ten_cong_trinh_vi = '' RETURN count(ct) AS count")
        
        print(f"Total CongTrinhNghienCuu nodes: {total}")
        print(f"Nodes with ten_cong_trinh_vi: {has_vi}")
        print(f"Nodes without ten_cong_trinh_vi: {no_vi}")
        
        # Show a few examples of nodes with ten_cong_trinh_vi
        examples = conn.query("""
            MATCH (ct:CongTrinhNghienCuu)
            WHERE ct.ten_cong_trinh_vi IS NOT NULL AND ct.ten_cong_trinh_vi <> ''
            RETURN ct.id AS id, ct.ten_cong_trinh AS ten_en, ct.ten_cong_trinh_vi AS ten_vi, ct.slug AS slug, ct.slug_vi AS slug_vi
            LIMIT 5
        """)
        print("\nExamples with Vietnamese title:")
        for ex in examples:
            print(f"ID: {ex['id']}")
            print(f"  EN: {ex['ten_en']}")
            print(f"  VI: {ex['ten_vi']}")
            print(f"  slug: {ex['slug']}")
            print(f"  slug_vi: {ex['slug_vi']}")
            
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    main()
