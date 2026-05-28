import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.services.neo4j_connection import get_neo4j_connection
from backend.routes.api import remove_accents

def check():
    conn = get_neo4j_connection()
    query = """
        MATCH (n)
        WHERE coalesce(n.is_deleted, false) = false
          AND NOT (n:TacGiaNgoai AND EXISTS {
            MATCH (gv:GiangVien) WHERE gv.ho_va_ten = n.ho_va_ten
        })
        RETURN n, labels(n) AS labels
    """
    
    results = conn.query(query)
    q_normalized = remove_accents("khoa")
    
    data = []
    for r in results:
        item = dict(r["n"])
        labels = r["labels"] or []
        
        # New proposed logic: search only by primary name/title field
        if "GiangVien" in labels or "TacGiaNgoai" in labels:
            search_text = item.get("ho_va_ten") or ""
        elif "CongTrinhNghienCuu" in labels:
            search_text = item.get("ten_cong_trinh") or ""
        elif "DeTaiNghienCuu" in labels:
            search_text = item.get("ten_de_tai") or ""
        elif "BoMon" in labels:
            search_text = item.get("ten_bo_mon") or ""
        elif "Khoa" in labels:
            search_text = item.get("ten_khoa") or ""
        elif "LinhVucNghienCuu" in labels:
            search_text = item.get("ten_linh_vuc") or ""
        elif "NhomNghienCuu" in labels:
            search_text = item.get("ten_nhom") or ""
        else:
            search_text = " ".join([
                str(item.get("ho_va_ten") or ""),
                str(item.get("ten_cong_trinh") or ""),
                str(item.get("ten_de_tai") or ""),
                str(item.get("ten_bo_mon") or ""),
                str(item.get("ten_khoa") or ""),
                str(item.get("ten_linh_vuc") or ""),
                str(item.get("ten_nhom") or "")
            ])
            
        normalized_search_text = remove_accents(search_text)
        
        if q_normalized in normalized_search_text:
            item["_labels"] = labels
            data.append(item)

    print(f"Total matching with new logic: {len(data)}")
    for item in data:
        label = item["_labels"][0] if item.get("_labels") else "Unknown"
        name = item.get("ho_va_ten") or item.get("ten_cong_trinh") or item.get("ten_de_tai") or item.get("ten_bo_mon") or item.get("ten_khoa") or item.get("ten_linh_vuc") or "N/A"
        print(f"- [{label}] {name}")

if __name__ == "__main__":
    check()
