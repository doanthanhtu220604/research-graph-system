from backend.services.neo4j_connection import get_neo4j_connection
import json

def find_lecturer():
    conn = get_neo4j_connection()
    name = "Vũ Đình Hòa"
    query = """
    MATCH (gv:GiangVien) 
    WHERE gv.ho_va_ten = $name
    OPTIONAL MATCH (gv)-[r:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
    RETURN gv {.*} as info, collect(ct.id) as publications
    """
    res = conn.query(query, {"name": name})
    with open("scratch/lecturer_result.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    find_lecturer()
