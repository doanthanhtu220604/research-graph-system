from backend.services.neo4j_connection import get_neo4j_connection
import json

def check_more():
    conn = get_neo4j_connection()
    id = "gv_54"
    query = """
    MATCH (gv:GiangVien {id: $id})
    OPTIONAL MATCH (gv)-[r1:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
    OPTIONAL MATCH (gv)-[r2:THUOC_BO_MON]->(bm:BoMon)
    OPTIONAL MATCH (gv)-[r3:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
    RETURN 
        collect(DISTINCT dt.id) as projects,
        collect(DISTINCT bm.ten_bo_mon) as departments,
        collect(DISTINCT lv.ten_linh_vuc) as research_fields
    """
    res = conn.query(query, {"id": id})
    with open("scratch/lecturer_more.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    check_more()
