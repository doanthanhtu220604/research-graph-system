import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv('.env')
URI = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
USERNAME = os.getenv('NEO4J_USERNAME', 'neo4j')
PASSWORD = os.getenv('NEO4J_PASSWORD', 'password')

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
with driver.session() as session:
    res = session.run("MATCH (g:GiangVien) WHERE g.trang_thai_cong_tac IS NULL SET g.trang_thai_cong_tac = 'Đang công tác' RETURN count(g) as count")
    for r in res:
        print(f"Đã cập nhật {r['count']} giảng viên thành 'Đang công tác'")
driver.close()
