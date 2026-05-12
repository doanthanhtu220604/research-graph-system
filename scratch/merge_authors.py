from backend.services.neo4j_connection import get_neo4j_connection

def merge_authors():
    conn = get_neo4j_connection()
    alias_name = "Hoa V. Dinh"
    target_name = "Vũ Đình Hòa"
    
    # 1. Tim ID cua 2 tac gia
    alias = conn.query_single("MATCH (t:TacGiaNgoai {ho_va_ten: $name}) RETURN t.id as id", {"name": alias_name})
    target = conn.query_single("MATCH (t:TacGiaNgoai {ho_va_ten: $name}) RETURN t.id as id", {"name": target_name})
    
    if not alias or not target:
        return
        
    alias_id = alias["id"]
    target_id = target["id"]
    
    # 2. Chuyen cac quan he tu alias sang target
    # Su dung MERGE de tranh tao quan he trung lap neu ca 2 deu la tac gia cua 1 bai
    conn.write("""
        MATCH (old:TacGiaNgoai {id: $old_id})-[r:DONG_TAC_GIA]->(work)
        MATCH (new:TacGiaNgoai {id: $new_id})
        MERGE (new)-[new_r:DONG_TAC_GIA]->(work)
        SET new_r += properties(r)
        DELETE r
    """, {"old_id": alias_id, "new_id": target_id})
    
    # 3. Xoa node alias
    conn.write("MATCH (t:TacGiaNgoai {id: $id}) DETACH DELETE t", {"id": alias_id})

if __name__ == "__main__":
    merge_authors()
