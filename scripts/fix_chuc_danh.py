import sys
import os
import pandas as pd

# Thêm thư mục gốc vào path để import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.neo4j_connection import get_neo4j_connection

def fix_chuc_danh():
    print("Cập nhật trong Neo4j...")
    conn = get_neo4j_connection()
    try:
        # Cập nhật GV thành Giảng viên
        query_gv = """
        MATCH (gv:GiangVien) 
        WHERE gv.chuc_danh = 'GV' OR gv.chuc_danh = 'Giảng Viên' 
        SET gv.chuc_danh = 'Giảng viên'
        RETURN count(gv) as count
        """
        res_gv = conn.write(query_gv)
        count_gv = res_gv[0]['count'] if res_gv else 0
        print(f"Đã cập nhật {count_gv} giảng viên có chức danh GV -> Giảng viên")

        # Cập nhật GVC thành Giảng viên chính
        query_gvc = """
        MATCH (gv:GiangVien) 
        WHERE gv.chuc_danh = 'GVC' OR gv.chuc_danh = 'Giảng Viên Chính'
        SET gv.chuc_danh = 'Giảng viên chính'
        RETURN count(gv) as count
        """
        res_gvc = conn.write(query_gvc)
        count_gvc = res_gvc[0]['count'] if res_gvc else 0
        print(f"Đã cập nhật {count_gvc} giảng viên có chức danh GVC -> Giảng viên chính")

    except Exception as e:
        print(f"Lỗi Neo4j: {e}")
    finally:
        conn.close()

    print("\nCập nhật trong file CSV...")
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "neo4j_export", "nodes_GiangVien.csv")
    try:
        df = pd.read_csv(csv_path, encoding='utf-8-sig', dtype={'password': str, 'dien_thoai': str})
        
        # Replace
        count_gv_csv = 0
        count_gvc_csv = 0
        
        for idx, row in df.iterrows():
            if row['chuc_danh'] == 'GV' or row['chuc_danh'] == 'Giảng Viên':
                df.at[idx, 'chuc_danh'] = 'Giảng viên'
                count_gv_csv += 1
            elif row['chuc_danh'] == 'GVC' or row['chuc_danh'] == 'Giảng Viên Chính':
                df.at[idx, 'chuc_danh'] = 'Giảng viên chính'
                count_gvc_csv += 1
                
        df.to_csv(csv_path, index=False, encoding='utf-8-sig')
        print(f"Đã lưu file CSV: GV ({count_gv_csv}), GVC ({count_gvc_csv})")
    except Exception as e:
        print(f"Lỗi cập nhật CSV: {e}")

if __name__ == '__main__':
    fix_chuc_danh()
