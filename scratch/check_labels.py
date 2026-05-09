
import sys
import os

# Thêm đường dẫn backend vào sys.path để import được services
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), "backend")))

from services.neo4j_connection import Neo4jConnection

def check_labels():
    with Neo4jConnection() as conn:
        print("--- Kiem tra cac nhan (labels) trong CSDL ---")
        schema = conn.get_schema_info()
        labels = schema.get("labels", [])
        print(f"Cac nhan hien co: {labels}")
        
        target_labels = ["BAIBAO", "BaiBao"]
        for label in target_labels:
            if label in labels:
                count_res = conn.query(f"MATCH (n:{label}) RETURN count(n) AS count")
                count = count_res[0]["count"] if count_res else 0
                print(f"Nhan '{label}' ton tai voi {count} nodes.")
                
                # Lay thu mot vai node de xem du lieu
                if count > 0:
                    sample = conn.query(f"MATCH (n:{label}) RETURN n LIMIT 1")
                    print(f"Du lieu mau cua node '{label}': {sample[0]['n'] if sample else 'N/A'}")
            else:
                print(f"Nhan '{label}' khong ton tai.")

if __name__ == "__main__":
    check_labels()
