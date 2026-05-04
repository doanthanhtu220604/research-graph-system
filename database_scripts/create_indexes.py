import sys
import os

# Fix lỗi in tiếng Việt trên Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Thêm thư mục gốc vào sys.path để có thể import từ backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services.neo4j_connection import get_neo4j_connection

def create_database_indexes():
    """
    Hàm tự động tạo các chỉ mục (Index) và ràng buộc (Constraint) cho Neo4j.
    Chạy script này một lần khi khởi tạo hệ thống để tăng tốc độ truy vấn.
    """
    conn = get_neo4j_connection()
    try:
        print("Đang tiến hành tạo Index cho CSDL Neo4j...")
        
        # Danh sách các câu lệnh tạo Index (Sử dụng IF NOT EXISTS để tránh lỗi nếu đã có)
        cypher_queries = [
            # Tối ưu tìm kiếm Giảng Viên theo tên
            "CREATE INDEX giangvien_ten_idx IF NOT EXISTS FOR (n:GiangVien) ON (n.ho_va_ten)",
            
            # (Gợi ý thêm) Nếu Giảng Viên có mã GV và nó là duy nhất, bạn nên dùng CONSTRAINT
            # "CREATE CONSTRAINT giangvien_ma_unique IF NOT EXISTS FOR (n:GiangVien) REQUIRE n.ma_gv IS UNIQUE",
            
            # Tối ưu tìm kiếm Bài Báo theo tên
            "CREATE INDEX baibao_ten_idx IF NOT EXISTS FOR (n:BaiBao) ON (n.ten_bai_bao)",
            
            # Tối ưu tìm kiếm Đề Tài theo tên
            "CREATE INDEX detai_ten_idx IF NOT EXISTS FOR (n:DeTai) ON (n.ten_de_tai)",
            
            # (Tùy chọn) Tối ưu tìm kiếm theo năm xuất bản/thực hiện
            "CREATE INDEX baibao_nam_idx IF NOT EXISTS FOR (n:BaiBao) ON (n.nam_xuat_ban)",
            "CREATE INDEX detai_nam_idx IF NOT EXISTS FOR (n:DeTai) ON (n.nam_bat_dau)"
        ]
        
        for query in cypher_queries:
            try:
                conn.write(query)
                print(f"✔️ Đã chạy: {query}")
            except Exception as e:
                print(f"⚠️ Lỗi (có thể do sai cú pháp hoặc đã tồn tại): {e}")

        print("\n=> Hoàn tất quá trình tạo Index!")
        
    finally:
        conn.close()

if __name__ == "__main__":
    create_database_indexes()
