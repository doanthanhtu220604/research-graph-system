import sys
import os
import pandas as pd

# Thêm thư mục gốc vào path để import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.neo4j_connection import get_neo4j_connection

def rename_chuyen_mon():
    print("Cập nhật trong Neo4j (đổi tên property)...")
    conn = get_neo4j_connection()
    try:
        query = """
        MATCH (gv:GiangVien) 
        WHERE gv.chuyen_mon IS NOT NULL
        SET gv.chuyen_nganh = gv.chuyen_mon
        REMOVE gv.chuyen_mon
        RETURN count(gv) as count
        """
        res = conn.write(query)
        count = res[0]['count'] if res else 0
        print(f"Đã đổi tên thuộc tính chuyen_mon -> chuyen_nganh cho {count} giảng viên")
    except Exception as e:
        print(f"Lỗi Neo4j: {e}")
    finally:
        conn.close()

    print("\nCập nhật trong file CSV...")
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "neo4j_export", "nodes_GiangVien.csv")
    try:
        df = pd.read_csv(csv_path, encoding='utf-8-sig', dtype={'password': str, 'dien_thoai': str})
        
        if 'chuyen_mon' in df.columns:
            df.rename(columns={'chuyen_mon': 'chuyen_nganh'}, inplace=True)
            df.to_csv(csv_path, index=False, encoding='utf-8-sig')
            print(f"Đã đổi tên cột chuyen_mon thành chuyen_nganh trong file CSV.")
        else:
            print("Cột chuyen_mon không tồn tại trong CSV hoặc đã được đổi tên.")
    except Exception as e:
        print(f"Lỗi cập nhật CSV: {e}")

if __name__ == '__main__':
    rename_chuyen_mon()
