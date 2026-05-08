import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv('.env')
URI = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
USERNAME = os.getenv('NEO4J_USERNAME', 'neo4j')
PASSWORD = os.getenv('NEO4J_PASSWORD', 'password')

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
with driver.session() as session:
    res = session.run("MATCH (g:GiangVien) WHERE g.ho_va_ten IN ['Nguyễn Hữu Hiếu', 'Trần Thị Thanh Vân'] RETURN g.ho_va_ten AS ten, g.id AS id, g.ma_gv AS ma")
    for r in res:
        print(f"Name: {r['ten']}, ID: {r['id']}, ma: {r['ma']}")
        if not r['id']:
            print("Missing id, fixing...")
            session.run("MATCH (g:GiangVien {ho_va_ten: $name}) SET g.id = 'gv_' + toString(id(g))", name=r['ten'])
driver.close()
