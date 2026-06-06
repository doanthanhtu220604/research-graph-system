import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, r'd:\research-graph-system')
from backend.services.neo4j_connection import get_neo4j_connection

def main():
    try:
        conn = get_neo4j_connection()
        print("Đang xóa thuộc tính loai_an_pham khỏi tất cả các node CongTrinhNghienCuu...")
        result = conn.write("""
            MATCH (ct:CongTrinhNghienCuu)
            REMOVE ct.loai_an_pham
            RETURN count(ct) AS count
        """)
        print(f"Hoàn thành! Đã cập nhật {result[0]['count']} node CongTrinhNghienCuu.")
    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    main()
