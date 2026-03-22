# -*- coding: utf-8 -*-
"""
Xóa các node TacGiaNgoai trùng tên với GiangVien.
Trước khi xóa, chuyển toàn bộ quan hệ sang node GiangVien tương ứng.
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.services.neo4j_connection import get_neo4j_connection

conn = get_neo4j_connection()

# 1. Tìm các TacGiaNgoai trùng tên GiangVien
duplicates = conn.query("""
    MATCH (tgn:TacGiaNgoai)
    WHERE EXISTS {
        MATCH (gv:GiangVien) WHERE gv.ho_va_ten = tgn.ho_va_ten
    }
    MATCH (gv:GiangVien {ho_va_ten: tgn.ho_va_ten})
    RETURN tgn.ho_va_ten AS ten, id(tgn) AS tgn_id, id(gv) AS gv_id
""")

print(f"Tìm thấy {len(duplicates)} TacGiaNgoai trùng tên với GiangVien:")
for d in duplicates:
    print(f"  - {d['ten']} (TGN id={d['tgn_id']}, GV id={d['gv_id']})")

if len(duplicates) == 0:
    print("Không có gì để xóa.")
    exit()

# 2. Chuyển quan hệ từ TacGiaNgoai sang GiangVien, rồi xóa TacGiaNgoai
conn.query("""
    MATCH (tgn:TacGiaNgoai)
    WHERE EXISTS {
        MATCH (gv:GiangVien) WHERE gv.ho_va_ten = tgn.ho_va_ten
    }
    MATCH (gv:GiangVien {ho_va_ten: tgn.ho_va_ten})
    
    // Chuyển quan hệ đi ra
    OPTIONAL MATCH (tgn)-[r_out]->(target)
    WHERE target <> gv
    FOREACH (_ IN CASE WHEN r_out IS NOT NULL THEN [1] ELSE [] END |
        MERGE (gv)-[:LA_TAC_GIA_CUA]->(target)
    )
    
    WITH tgn, gv
    // Chuyển quan hệ đi vào
    OPTIONAL MATCH (source)-[r_in]->(tgn)
    WHERE source <> gv
    FOREACH (_ IN CASE WHEN r_in IS NOT NULL THEN [1] ELSE [] END |
        MERGE (source)-[:CO_TAC_GIA]->(gv)
    )
    
    // Xóa node TacGiaNgoai trùng
    WITH tgn
    DETACH DELETE tgn
""")

print("\n✅ Đã xóa thành công các node TacGiaNgoai trùng lặp!")
print("Các quan hệ đã được chuyển sang node GiangVien tương ứng.")
