import sys
import os

# Thêm thư mục gốc vào path để import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.neo4j_connection import get_neo4j_connection

def rollback_duplicates():
    conn = get_neo4j_connection()
    try:
        # Tìm các node mà có tên thuộc tính chứa dấu phẩy (bị dính chùm do sai delimiter)
        query = """
        MATCH (n)
        WHERE ANY(k in keys(n) WHERE k CONTAINS ',')
        RETURN count(n) as total
        """
        result = conn.query_single(query)
        print(f"Số lượng node bị lỗi (dính chùm do sai dấu phẩy): {result['total']}")
        
        if result['total'] > 0:
            query_delete = """
            MATCH (n)
            WHERE ANY(k in keys(n) WHERE k CONTAINS ',')
            DELETE n
            RETURN count(n) as deleted
            """
            res_del = conn.write(query_delete)
            print(f"Đã xóa {res_del[0]['deleted']} node lỗi!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    rollback_duplicates()
