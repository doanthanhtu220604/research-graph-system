from backend.services.neo4j_connection import get_neo4j_connection
import json

def find_lecturer():
    conn = get_neo4j_connection()
    name = "Nguyễn Hữu Xuân Trường"
    query = """
    MATCH (gv:GiangVien) 
    WHERE gv.ho_va_ten = $name
    RETURN gv {.*} as info
    """
    res = conn.query(query, {"name": name})
    with open("scratch/lecturer_result_truong.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    find_lecturer()
