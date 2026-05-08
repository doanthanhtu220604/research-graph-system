import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv('.env')
URI = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
USERNAME = os.getenv('NEO4J_USERNAME', 'neo4j')
PASSWORD = os.getenv('NEO4J_PASSWORD', 'password')

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
with driver.session() as session:
    session.run("MATCH (g:GiangVien {ho_va_ten: 'Nguyễn Thủy Đoan Trang'}) SET g.ma_gv = '2005002'")
    
    # Check if we should insert the missing ones
    session.run("MERGE (g:GiangVien {ho_va_ten: 'Nguyễn Hữu Hiếu'}) SET g.ma_gv = '2019015'")
    session.run("MERGE (g:GiangVien {ho_va_ten: 'Trần Thị Thanh Vân'}) SET g.ma_gv = '2003012'")
driver.close()
print('Done fixing missing/mismatched names.')
