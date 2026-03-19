import sys
import os
import csv

# Thêm thư mục gốc vào path để import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.neo4j_connection import get_neo4j_connection

def export_data():
    conn = get_neo4j_connection()
    try:
        export_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "neo4j_export")
        os.makedirs(export_dir, exist_ok=True)
        print(f"Bắt đầu xuất dữ liệu ra thư mục: {export_dir}")
        
        schema = conn.get_schema_info()
        labels = schema.get("labels", [])
        rel_types = schema.get("relationship_types", [])

        # 1. Xuất Nodes
        for label in labels:
            query = f"MATCH (n:{label}) RETURN id(n) AS neo4j_id, keys(n) AS keys, properties(n) AS props"
            results = conn.query(query)
            if not results:
                continue
                
            # Lấy danh sách tất cả các thuộc tính có thể có
            all_keys = set(["neo4j_id"])
            for r in results:
                all_keys.update(r['keys'])
            all_keys = list(all_keys)
            
            filepath = os.path.join(export_dir, f"nodes_{label}.csv")
            with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=all_keys)
                writer.writeheader()
                for r in results:
                    row = {'neo4j_id': r['neo4j_id']}
                    row.update(r['props'])
                    writer.writerow(row)
            print(f"- Exported {len(results)} {label} nodes.")

        # 2. Xuất Relationships
        for rel in rel_types:
            query = f"MATCH (a)-[r:{rel}]->(b) RETURN id(a) AS start_id, type(r) AS rel_type, id(b) AS end_id, properties(r) AS props, labels(a) AS start_labels, labels(b) AS end_labels"
            results = conn.query(query)
            if not results:
                continue
                
            all_keys = set(["start_id", "start_labels", "rel_type", "end_id", "end_labels"])
            for r in results:
                all_keys.update(r['props'].keys())
            all_keys = list(all_keys)
                
            filepath = os.path.join(export_dir, f"rels_{rel}.csv")
            with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=all_keys)
                writer.writeheader()
                for r in results:
                    row = {
                        'start_id': r['start_id'],
                        'start_labels': '|'.join(r['start_labels']),
                        'rel_type': r['rel_type'],
                        'end_id': r['end_id'],
                        'end_labels': '|'.join(r['end_labels'])
                    }
                    row.update(r['props'])
                    writer.writerow(row)
            print(f"- Exported {len(results)} {rel} relationships.")
            
        print("Đã hoàn tất xuất dữ liệu!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    export_data()
