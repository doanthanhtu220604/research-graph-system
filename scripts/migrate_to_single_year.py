import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, r'd:\research-graph-system')
from backend.services.neo4j_connection import get_neo4j_connection

def main():
    try:
        conn = get_neo4j_connection()
        print("Đang sao chép nam_bat_dau sang nam và xóa các thuộc tính cũ...")
        result = conn.write("""
            MATCH (dt:DeTaiNghienCuu)
            SET dt.nam = toInteger(dt.nam_bat_dau)
            REMOVE dt.nam_bat_dau, dt.nam_ket_thuc, dt.nam_thuc_hien
            RETURN count(dt) AS count
        """)
        print(f"Hoàn thành! Đã cập nhật {result[0]['count']} đề tài nghiên cứu.")
    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    main()
