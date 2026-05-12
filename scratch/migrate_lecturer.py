from backend.services.neo4j_connection import get_neo4j_connection

def migrate_lecturer_to_external():
    conn = get_neo4j_connection()
    lecturer_name = "Vũ Đình Hòa"
    
    lecturer = conn.query_single("""
        MATCH (gv:GiangVien {ho_va_ten: $name})
        RETURN gv.id as id, gv.hoc_vi as hoc_vi
    """, {"name": lecturer_name})
    
    if not lecturer:
        return
    
    gv_id = lecturer["id"]
    hoc_vi = lecturer["hoc_vi"]

    res_tgn = conn.write("""
        MERGE (tgn:TacGiaNgoai {ho_va_ten: $name})
        ON CREATE SET 
            tgn.hoc_vi = $hoc_vi,
            tgn.don_vi_cong_tac = 'Đại học Nha Trang (Cựu giảng viên)',
            tgn.id = 'tgn_' + toString(id(tgn)),
            tgn.is_deleted = false
        RETURN tgn.id as id
    """, {
        "name": lecturer_name,
        "hoc_vi": hoc_vi
    })
    tgn_id = res_tgn[0]["id"]

    conn.write("""
        MATCH (gv:GiangVien {id: $gv_id})-[r:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
        MATCH (tgn:TacGiaNgoai {id: $tgn_id})
        MERGE (tgn)-[new_r:DONG_TAC_GIA]->(ct)
        SET new_r += properties(r)
        DELETE r
    """, {"gv_id": gv_id, "tgn_id": tgn_id})

    conn.write("""
        MATCH (gv:GiangVien {id: $gv_id})-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
        MATCH (tgn:TacGiaNgoai {id: $tgn_id})
        MERGE (tgn)-[new_r:DONG_TAC_GIA]->(dt)
        SET new_r.vai_tro = type(r)
        DELETE r
    """, {"gv_id": gv_id, "tgn_id": tgn_id})

    conn.write("""
        MATCH (gv:GiangVien {id: $gv_id})<-[r:CO_PROFILE]-(acc:Account)
        DETACH DELETE acc
    """, {"gv_id": gv_id})

    conn.write("""
        MATCH (gv:GiangVien {id: $gv_id})
        DETACH DELETE gv
    """, {"gv_id": gv_id})

if __name__ == "__main__":
    migrate_lecturer_to_external()
