# -*- coding: utf-8 -*-
"""
Script to create DaiHoc, TruongCon, and Khoa nodes,
and link them using TRUC_THUOC relationship.
"""

import sys
import os
import io

# Set encoding to UTF-8 for console output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add project root to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.neo4j_connection import Neo4jConnection

def main():
    try:
        with Neo4jConnection() as conn:
            print("=== [1] Creating/Updating DaiHoc Node ===")
            dai_hoc_query = """
            MERGE (d:DaiHoc {id: 'dai_hoc_nha_trang'})
            SET d.ten_dai_hoc = 'Trường Đại học Nha Trang',
                d.ten_viet_tat = 'NTU',
                d.website = 'https://ntu.edu.vn',
                d.dia_chi = '02 Tôn Thất Tùng, Nha Trang, Khánh Hòa'
            RETURN d
            """
            d_res = conn.query(dai_hoc_query)
            print("DaiHoc Node Created/Updated:", d_res)

            print("\n=== [2] Creating/Updating TruongCon Nodes & Relationships ===")
            truong_con_data = [
                {
                    "id": "tr_ky_thuat_cong_nghe",
                    "ten_truong": "Trường Kỹ thuật và Công nghệ"
                },
                {
                    "id": "tr_kinh_te_kinh_doanh",
                    "ten_truong": "Trường Kinh tế và Kinh doanh"
                },
                {
                    "id": "tr_thuy_san_kh_su_song",
                    "ten_truong": "Trường Thủy sản và Khoa học sự sống"
                }
            ]
            
            for tc in truong_con_data:
                tc_query = """
                MATCH (d:DaiHoc {id: 'dai_hoc_nha_trang'})
                MERGE (tc:TruongCon {id: $id})
                SET tc.ten_truong = $ten_truong
                MERGE (tc)-[:TRUC_THUOC]->(d)
                RETURN tc.id, tc.ten_truong
                """
                tc_res = conn.query(tc_query, tc)
                print(f"TruongCon created & linked: {tc_res}")

            print("\n=== [3] Creating/Updating Khoa Nodes & Relationships ===")
            khoa_data = [
                {
                    "id": "kh_46",
                    "ten_khoa": "Khoa Công nghệ thông tin"
                },
                {
                    "id": "kh_khxh_nhan_van",
                    "ten_khoa": "Khoa Khoa học Xã hội và Nhân văn"
                },
                {
                    "id": "kh_ngoai_ngu",
                    "ten_khoa": "Khoa Ngoại ngữ"
                }
            ]

            for kh in khoa_data:
                kh_query = """
                MATCH (d:DaiHoc {id: 'dai_hoc_nha_trang'})
                MERGE (k:Khoa {id: $id})
                SET k.ten_khoa = $ten_khoa
                MERGE (k)-[:TRUC_THUOC]->(d)
                RETURN k.id, k.ten_khoa
                """
                kh_res = conn.query(kh_query, kh)
                print(f"Khoa created/updated & linked: {kh_res}")

            print("\n=== [4] Verification ===")
            count_query = """
            MATCH (n)
            WHERE labels(n)[0] IN ['DaiHoc', 'TruongCon', 'Khoa']
            RETURN labels(n)[0] AS label, count(n) AS count
            """
            print("Node counts in DB:", conn.query(count_query))

            rel_query = """
            MATCH (a)-[r:TRUC_THUOC]->(b)
            RETURN labels(a)[0] AS source_label, a.id AS source_id, 
                   type(r) AS rel, 
                   labels(b)[0] AS target_label, b.id AS target_id
            """
            print("TRUC_THUOC Relationships in DB:")
            for rel in conn.query(rel_query):
                print(f"  ({rel['source_label']}:{rel['source_id']}) -[{rel['rel']}]-> ({rel['target_label']}:{rel['target_id']})")

    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    main()
