# -*- coding: utf-8 -*-
import sys
import os
import csv

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, project_root)

from backend.services.neo4j_connection import get_neo4j_connection

def main():
    csv_path = os.path.join(project_root, "neo4j_export", "nodes_CongTrinhNghienCuu.csv")
    csv_ids = set()
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            csv_ids.add(row["id"])
            
    conn = get_neo4j_connection()
    try:
        db_nodes = conn.query("""
            MATCH (ct:CongTrinhNghienCuu)
            RETURN ct.id AS id, ct.ten_cong_trinh AS ten_en, ct.ten_cong_trinh_vi AS ten_vi
        """)
        
        new_nodes = []
        for node in db_nodes:
            if node["id"] not in csv_ids:
                new_nodes.append(node)
                
        output_file = os.path.join(os.path.dirname(__file__), "new_nodes_info.txt")
        with open(output_file, "w", encoding="utf-8") as out:
            out.write(f"Number of new nodes in DB not in CSV: {len(new_nodes)}\n")
            for node in new_nodes:
                out.write(f"ID: {node['id']}\n")
                out.write(f"  EN: {node['ten_en']}\n")
                out.write(f"  VI: {node['ten_vi']}\n\n")
        print("Done writing to new_nodes_info.txt")
            
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    main()
