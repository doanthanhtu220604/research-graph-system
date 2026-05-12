from backend.services.neo4j_connection import get_neo4j_connection
import json

def find_alias():
    conn = get_neo4j_connection()
    query = """
    MATCH (tgn:TacGiaNgoai) 
    WHERE tgn.ho_va_ten = 'Hoa V. Dinh'
    OPTIONAL MATCH (tgn)-[r:DONG_TAC_GIA]->(ct)
    RETURN tgn {.*} as info, collect(ct.id) as works
    """
    res = conn.query(query)
    with open("scratch/alias_result.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    find_alias()
