from backend.services.neo4j_connection import get_neo4j_connection
import json

def debug_ids():
    conn = get_neo4j_connection()
    query = """
    MATCH (tgn:TacGiaNgoai) 
    WHERE tgn.id = 'tgn_305' OR tgn.ho_va_ten CONTAINS 'Auriol' OR tgn.ho_va_ten CONTAINS 'Hòa'
    RETURN tgn.id as id, tgn.ho_va_ten as name
    """
    res = conn.query(query)
    with open("scratch/debug_ids.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    debug_ids()
