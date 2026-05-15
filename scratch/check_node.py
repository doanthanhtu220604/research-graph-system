from backend.services.neo4j_connection import get_neo4j_connection
conn = get_neo4j_connection()
res = conn.query("MATCH (n:GiangVien) WHERE n.id = 'gv_54' RETURN properties(n) as props")
if res:
    print(res[0]['props'].keys())
else:
    print("Not found")
