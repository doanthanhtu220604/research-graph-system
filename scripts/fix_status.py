import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from backend.services.neo4j_connection import get_neo4j_connection

conn = get_neo4j_connection()
conn.write("MATCH (ct:CongTrinhNghienCuu) WHERE ct.trang_thai = 'Đang làm' SET ct.trang_thai = 'Đang thực hiện'")
print("Done fixing status in Neo4j.")
