import sys
import os

# Thêm thư mục gốc vào path để import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.neo4j_connection import get_neo4j_connection

def add_cap_de_tai():
    conn = get_neo4j_connection()
    try:
        # Check current nodes
        query_check = "MATCH (d:DeTaiNghienCuu) WHERE d.cap_de_tai IS NULL RETURN count(d) as total"
        result_check = conn.query_single(query_check)
        print(f"Total projects without cap_de_tai: {result_check['total']}")

        # Update nodes
        query_update = "MATCH (d:DeTaiNghienCuu) WHERE d.cap_de_tai IS NULL SET d.cap_de_tai = 'Chưa xác định' RETURN count(d) as updated"
        result_update = conn.write(query_update)
        print(f"Updated {result_update[0]['updated']} projects.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    add_cap_de_tai()
