import os
import sys

# Đảm bảo in unicode ra console
if hasattr(sys.stdout, 'reconfigure') and sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Thêm path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.services.neo4j_connection import get_neo4j_connection

def setup_lecturer_accounts():
    conn = get_neo4j_connection()
    if not conn:
        print("Lỗi kết nối CSDL Neo4j")
        return
        
    try:
        # Kiểm tra xem có bao nhiêu tài khoản Giảng viên và xem họ có thuộc tính password chưa
        # Nếu chưa có password, gán mặc định là "123456"
        query = """
        MATCH (g:GiangVien)
        WHERE g.password IS NULL
        SET g.password = '123456'
        RETURN count(g) as updated_count
        """
        result = conn.write(query)
        updated_count = result[0]['updated_count'] if result else 0
        print(f"Đã cập nhật mật khẩu mặc định ('123456') cho {updated_count} Giảng viên.")
        
        # Xem thử 5 Giảng viên để lấy email test
        query_dev = """
        MATCH (g:GiangVien)
        WHERE g.email IS NOT NULL AND g.email <> ''
        RETURN g.ho_va_ten AS ten, g.email AS email, g.password AS password
        LIMIT 5
        """
        test_gvs = conn.query(query_dev)
        print("\nMột số tài khoản để test (Email - Mật khẩu):")
        for g in test_gvs:
            print(f"- {g.get('ten')}: {g.get('email')} - {g.get('password')}")
            
    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    setup_lecturer_accounts()
