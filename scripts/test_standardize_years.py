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
    conn = get_neo4j_connection()
    nodes = conn.query("MATCH (dt:DeTaiNghienCuu) RETURN dt.id AS id, dt.ma_so AS ma_so, dt.nam_thuc_hien AS nam_thuc_hien, dt.nam_bat_dau AS nam_bat_dau, dt.nam_ket_thuc AS nam_ket_thuc")
    
    print("Dự kiến chuẩn hóa các đề tài:")
    print(f"{'ID':<8} | {'Mã số':<15} | {'Năm TH':<15} | {'Năm BD':<6} | {'Năm KT':<6} | {'Năm mới':<6}")
    print("-" * 75)
    for n in nodes:
        target_year = determine_year(n)
        print(f"{n.get('id'):<8} | {str(n.get('ma_so')):<15} | {str(n.get('nam_thuc_hien')):<15} | {str(n.get('nam_bat_dau')):<6} | {str(n.get('nam_ket_thuc')):<6} | {target_year:<6}")

if __name__ == "__main__":
    main()
