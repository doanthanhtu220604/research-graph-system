import sys, os, json
sys.path.append(os.getcwd())
from backend.services.neo4j_connection import get_neo4j_connection
conn = get_neo4j_connection()
query = "MATCH (dt:DeTaiNghienCuu) WHERE dt.id = 'dt_273' RETURN properties(dt) as props"
result = conn.query_single(query)
print(json.dumps(result, indent=2))
