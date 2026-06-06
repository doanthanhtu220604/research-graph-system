import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, r'd:\research-graph-system')
from backend.services.neo4j_connection import get_neo4j_connection

def determine_year(node):
    ma_so = node.get('ma_so')
    nam_thuc_hien = node.get('nam_thuc_hien')
    nam_bat_dau = node.get('nam_bat_dau')
    nam_ket_thuc = node.get('nam_ket_thuc')
    
    # 1. Check ma_so (TR2022...)
    if ma_so:
        match = re.search(r'TR(\d{4})', str(ma_so))
        if match:
            return int(match.group(1))
            
    # 2. Check nam_thuc_hien for any 4-digit year
    if nam_thuc_hien:
        match = re.search(r'\d{4}', str(nam_thuc_hien))
        if match:
            return int(match.group(0))
            
    # 3. Use nam_bat_dau
    if nam_bat_dau is not None:
        try:
            return int(nam_bat_dau)
        except:
            pass
            
    # 4. Use nam_ket_thuc
    if nam_ket_thuc is not None:
        try:
            return int(nam_ket_thuc)
        except:
            pass
            
    return 2024 # Default fallback

def main():
    try:
        conn = get_neo4j_connection()
        nodes = conn.query("MATCH (dt:DeTaiNghienCuu) RETURN dt.id AS id, dt.ma_so AS ma_so, dt.nam_thuc_hien AS nam_thuc_hien, dt.nam_bat_dau AS nam_bat_dau, dt.nam_ket_thuc AS nam_ket_thuc")
        
        print("Đang tiến hành chuẩn hóa năm cho các đề tài...")
        updated_count = 0
        for n in nodes:
            target_year = determine_year(n)
            conn.write("""
                MATCH (dt:DeTaiNghienCuu {id: $id})
                SET dt.nam_bat_dau = $year,
                    dt.nam_ket_thuc = $year,
                    dt.nam_thuc_hien = toString($year)
            """, {
                'id': n.get('id'),
                'year': target_year
            })
            updated_count += 1
            
        print(f"Thành công! Đã chuẩn hóa {updated_count} đề tài nghiên cứu.")
    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    main()
