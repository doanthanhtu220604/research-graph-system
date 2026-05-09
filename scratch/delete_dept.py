import os
import sys
from dotenv import load_dotenv

# Thêm thư mục gốc vào Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.neo4j_connection import Neo4jConnection

def delete_department():
    load_dotenv()
    target_name = "Hệ thống thông tin quản lý"
    
    with Neo4jConnection() as conn:
        # Sử dụng DETACH DELETE để xóa cả node và các quan hệ liên quan
        query = """
        MATCH (n:BoMon {ten_bo_mon: $name})
        DETACH DELETE n
        RETURN count(n) as deleted_count
        """
        results = conn.write(query, {"name": target_name})
        
        deleted_count = results[0]["deleted_count"] if results else 0
        print(f"Deleted {deleted_count} node(s).")

if __name__ == "__main__":
    delete_department()
