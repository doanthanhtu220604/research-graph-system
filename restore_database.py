import sys
import os
import csv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))
from backend.services.neo4j_connection import get_neo4j_connection

def main():
    conn = get_neo4j_connection()
    csv_path = r"d:\research-graph-system\neo4j_export\nodes_DeTaiNghienCuu.csv"
    
    if not os.path.exists(csv_path):
        print(f"Error: Backup CSV not found at {csv_path}")
        return
        
    print("RESTORING ORIGINAL VALUES FROM CSV BACKUP...")
    
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            node_id = row['id']
            # Lấy cấp đề tài ban đầu
            original_cap = row['cap_de_tai']
            
            if not original_cap:
                original_cap = 'CHƯA XÁC ĐỊNH'
            else:
                # Chuẩn hóa viết hoa giống như cơ sở dữ liệu trước đây
                original_cap = original_cap.upper().strip()
                
            # Cập nhật lại vào Neo4j
            query = """
            MATCH (d:DeTaiNghienCuu {id: $id})
            SET d.cap_de_tai = $cap
            RETURN count(d) as count
            """
            res = conn.write(query, {'id': node_id, 'cap': original_cap})
            count = res[0]['count'] if res else 0
            if count > 0:
                print(f"Restored project {node_id} -> '{original_cap}'")
            else:
                print(f"Project node {node_id} not found in database.")

    # Kiểm tra các đề tài mới tạo không có trong CSV nếu có
    query_cleanup = """
    MATCH (d:DeTaiNghienCuu)
    WHERE d.cap_de_tai IS NULL OR d.cap_de_tai = 'Khác' OR d.cap_de_tai = 'Cấp cơ sở' OR d.cap_de_tai = 'Cấp Bộ' OR d.cap_de_tai = 'Cấp Tỉnh' OR d.cap_de_tai = 'Cấp Nhà nước'
    SET d.cap_de_tai = 'CHƯA XÁC ĐỊNH'
    RETURN count(d) as count
    """
    res = conn.write(query_cleanup)
    print(f"Cleaned up {res[0]['count']} new/unmapped nodes to 'CHƯA XÁC ĐỊNH'")

    # Show final levels count
    query_final = "MATCH (d:DeTaiNghienCuu) RETURN DISTINCT d.cap_de_tai as cap, count(d) as count"
    results = conn.query(query_final)
    print("\nDATABASE RESTORED SUCCESFULLY:")
    for r in results:
        print(f"- '{r['cap']}' (Count: {r['count']})")

if __name__ == '__main__':
    main()
