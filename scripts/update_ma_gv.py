import os
import sys
from dotenv import load_dotenv
from neo4j import GraphDatabase

# Load .env từ thư mục gốc
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

data = [
    ("Phạm Thị Thu Thúy", "2001025"),
    ("Bùi Chí Thành", "2003011"),
    ("Lê Thị Bích Hằng", "2002006"),
    ("Phạm Thị Kim Ngoan", "2001023"),
    ("Nguyễn Đình Hưng", "2001011"),
    ("Bùi Thị Hồng Minh", "2002010"),
    ("Nguyễn Đình Cường", "2004006"),
    ("Nguyễn Thanh Quỳnh Châu", "1998003"),
    ("Đoàn Vũ Thịnh", "2008022"),
    ("Nguyễn Hải Triều", "2019023"),
    ("Nguyễn Văn Rạng", "2025007"),
    ("Ngô Nguyễn Tường Nghi", "2024024"),
    ("Hà Thị Thanh Ngà", "2004009"),
    ("Nguyễn Đình Hoàng Sơn", "2007031"),
    ("Nguyễn Thuỳ Đoan Trang", "2005002"),
    ("Nguyễn Thị Hương Lý", "2019024"),
    ("Nguyễn Hữu Hiếu", "2019015"),
    ("Trần Thị Thanh Vân", "2003012"),
    ("Lê Thị Chi Mai", "2025022"),
    ("Phạm Văn Nam", "1999010"),
    ("Mai Cường Thọ", "2004010"),
    ("Huỳnh Tuấn Anh", "2008005"),
    ("Nguyễn Huỳnh Huy", "2019025"),
    ("Cấn Thị Phượng", "2019026"),
    ("Nguyễn Mạnh Cương", "1999009")
]

def update_ma_gv():
    try:
        driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
        driver.verify_connectivity()
        print("Ket noi Neo4j thanh cong")
    except Exception as e:
        print(f"Loi ket noi Neo4j: {e}")
        return

    with driver.session() as session:
        for ten_gv, ma_gv in data:
            query = """
            MATCH (g:GiangVien {ho_va_ten: $ten_gv})
            SET g.ma_gv = $ma_gv
            RETURN count(g) as cnt
            """
            result = session.run(query, ten_gv=ten_gv, ma_gv=ma_gv)
            record = result.single()
            if record and record["cnt"] > 0:
                print(f"Cap nhat thanh cong: {ten_gv} -> {ma_gv}")
            else:
                print(f"Khong tim thay: {ten_gv}")

    driver.close()
    print("Hoan thanh.")

if __name__ == "__main__":
    update_ma_gv()
