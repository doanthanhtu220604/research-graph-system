import os
import sys
from dotenv import load_dotenv

# Thêm thư mục gốc vào Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.neo4j_connection import Neo4jConnection

def verify_bomon():
    load_dotenv()
    with Neo4jConnection() as conn:
        query = "MATCH (n:BoMon) RETURN n.ten_bo_mon as name"
        results = conn.query(query)
        print(f"Remaining BoMon nodes: {len(results)}")
        for r in results:
            # Avoid printing Vietnamese directly to avoid encode error
            print(f"- {r['name'].encode('ascii', 'ignore').decode('ascii')} (original hidden)")

if __name__ == "__main__":
    verify_bomon()
