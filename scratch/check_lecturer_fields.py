import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.services.neo4j_connection import get_neo4j_connection

def check():
    conn = get_neo4j_connection()
    with open("scratch/check_lecturer_fields_output.txt", "w", encoding="utf-8") as f:
        f.write("--- Lecturers studying Data Science (variations) ---\n")
        query_str = """
        MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
        WHERE toLower(lv.ten_linh_vuc) IN ["khoa học dữ liệu", "data science"]
        RETURN gv.ho_va_ten AS ten, lv.ten_linh_vuc AS linh_vuc
        """
        results = conn.query(query_str)
        for r in results:
            f.write(f"- {r['ten']} -> {r['linh_vuc']}\n")
            
        f.write("\n--- All NGHIEN_CUU relationships in DB ---\n")
        all_rels = conn.query("""
            MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
            RETURN gv.ho_va_ten AS ten, lv.ten_linh_vuc AS linh_vuc
            ORDER BY lv.ten_linh_vuc
        """)
        for r in all_rels:
            f.write(f"- {r['ten']} -> {r['linh_vuc']}\n")

if __name__ == "__main__":
    check()
