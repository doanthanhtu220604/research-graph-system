
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.getcwd(), "backend")))

from services.neo4j_connection import Neo4jConnection

def search_nodes():
    with Neo4jConnection() as conn:
        print("--- Tim kiem cac label lien quan den 'baibao' ---")
        labels = conn.query("CALL db.labels() YIELD label RETURN label")
        for r in labels:
            label = r["label"]
            if "baibao" in label.lower():
                count = conn.query(f"MATCH (n:{label}) RETURN count(n) AS count")[0]["count"]
                print(f"Phat hien label: '{label}' - So luong node: {count}")
                
        # Kiem tra xem co node nao khong co label nhung co property lien quan khong?
        # (Khong can thiet lam nhung cu check)
        
        print("\n--- Kiem tra tat ca cac label hien tai ---")
        for r in labels:
            label = r["label"]
            count = conn.query(f"MATCH (n:{label}) RETURN count(n) AS count")[0]["count"]
            if count > 0:
                print(f"Label '{label}': {count} nodes")
            else:
                print(f"Label '{label}': 0 nodes (Dinh ranh?)")

if __name__ == "__main__":
    search_nodes()
