import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.services.neo4j_connection import get_neo4j_connection
conn = get_neo4j_connection()
res = conn.query_single("MATCH (n) WHERE ANY(k IN keys(n) WHERE k CONTAINS ',') RETURN count(n) AS c")
print(f"Tổng số node còn bị lỗi key: {res['c']}")
conn.close()
