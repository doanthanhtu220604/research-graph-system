import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from backend.services.neo4j_connection import get_neo4j_connection

conn = get_neo4j_connection()
res = conn.write("MATCH (gv:GiangVien) WHERE gv.email IS NULL OR gv.email = '' REMOVE gv.password RETURN count(gv) as count")
print(f"Removed passwords for {res[0]['count']} lecturers without emails.")
