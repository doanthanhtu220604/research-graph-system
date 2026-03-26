# script: Cập nhật thuộc tính bị thiếu cho các node CongTrinhNghienCuu

import sys, os, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, r'd:\research-graph-system')
from backend.services.neo4j_connection import Neo4jConnection

def main():
    try:
        with Neo4jConnection() as conn:
            print('Updating nodes...')
            query = """
                MATCH (n:CongTrinhNghienCuu)
                SET n.link = coalesce(n.link, ""),
                    n.loai_an_pham = coalesce(n.loai_an_pham, ""),
                    n.tom_tat = coalesce(n.tom_tat, ""),
                    n.nam_xuat_ban = coalesce(n.nam_xuat_ban, ""),
                    n.ten_cong_trinh = coalesce(n.ten_cong_trinh, "")
                RETURN count(n) as updated_nodes
            """
            res = conn.query_single(query)
            print("Nodes updated:", res)
            
            print('\nCheck missing properties now:')
            check_query = """
                MATCH (n:CongTrinhNghienCuu)
                RETURN count(n) as total,
                       count(n.link) as has_link, 
                       count(n.loai_an_pham) as has_loai,
                       count(n.nam_xuat_ban) as has_nam,
                       count(n.ten_cong_trinh) as has_ten,
                       count(n.tom_tat) as has_tom_tat
            """
            res_check = conn.query(check_query)
            print("Property counts:", res_check)

    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    main()
