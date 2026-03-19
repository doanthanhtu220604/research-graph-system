import sys
import os
import csv
import math

# Thêm thư mục gốc vào path để import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.neo4j_connection import get_neo4j_connection

def import_data():
    conn = get_neo4j_connection()
    export_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "neo4j_export")
    
    if not os.path.exists(export_dir):
        print(f"Thư mục {export_dir} không tồn tại!")
        return

    try:
        print(f"Bắt đầu import dữ liệu từ thư mục: {export_dir}")
        
        # 1. Cập nhật Nodes
        for filename in os.listdir(export_dir):
            if filename.startswith("nodes_") and filename.endswith(".csv"):
                label = filename.replace("nodes_", "").replace(".csv", "")
                filepath = os.path.join(export_dir, filename)
                
                with open(filepath, 'r', encoding='utf-8-sig') as f:
                    # Tự động nhận diện dấu phẩy hay chấm phẩy (Excel việt nam hay lưu bằng phẩy)
                    sample = f.read(2048)
                    f.seek(0)
                    try:
                        dialect = csv.Sniffer().sniff(sample)
                        reader = csv.DictReader(f, dialect=dialect)
                    except:
                        reader = csv.DictReader(f, delimiter=';')
                    count_updated = 0
                    count_created = 0
                    for row in reader:
                        neo4j_id = row.pop('neo4j_id', None)
                        
                        # Xóa các giá trị rỗng và các cột dư thừa (None)
                        clean_row = {k: v for k, v in row.items() if k is not None and v != ''}
                        
                        if neo4j_id and neo4j_id.isdigit():
                            # Cập nhật node đã có
                            query = f"""
                            MATCH (n) WHERE id(n) = $id
                            SET n += $props
                            """
                            conn.write(query, {"id": int(neo4j_id), "props": clean_row})
                            count_updated += 1
                        else:
                            # Tạo mới node nếu chưa có ID
                            query = f"""
                            CREATE (n:{label})
                            SET n = $props
                            """
                            conn.write(query, {"props": clean_row})
                            count_created += 1
                
                print(f"- {label}: Đã cập nhật {count_updated} nodes cũ, tạo mới {count_created} nodes.")

        # LƯU Ý: Import Relationships phức tạp hơn nếu có Node mới chưa có ID.
        # Ở kịch bản cơ bản này, chúng ta tập trung hỗ trợ Cập Nhật Properties của Node hoặc Tạo Node Rời.
        print("\\nĐã hoàn tất quá trình import (Lưu ý: Quan hệ mới từ node mới cần script nâng cao hơn).")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    import_data()
