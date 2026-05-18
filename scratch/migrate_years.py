import sys
sys.path.append(r'd:\research-graph-system')
from backend.services.neo4j_connection import get_neo4j_connection

def migrate():
    conn = get_neo4j_connection()
    
    # 1. Clean up empty string publication years
    print("Cleaning up empty string years...")
    r1 = conn.write("MATCH (ct:CongTrinhNghienCuu) WHERE ct.nam_xuat_ban = '' REMOVE ct.nam_xuat_ban RETURN count(ct) AS count")
    print("Cleaned empty strings count:", r1[0]["count"] if r1 else 0)
    
    # 2. Convert string years to integer
    print("Converting publication years to integer...")
    r2 = conn.write("MATCH (ct:CongTrinhNghienCuu) WHERE ct.nam_xuat_ban IS NOT NULL SET ct.nam_xuat_ban = toInteger(ct.nam_xuat_ban) RETURN count(ct) AS count")
    print("Converted publications count:", r2[0]["count"] if r2 else 0)
    
    # 3. Double check current type distribution
    from collections import Counter
    results = conn.query("MATCH (ct:CongTrinhNghienCuu) RETURN ct.nam_xuat_ban AS nam")
    counter = Counter(type(r['nam']) for r in results)
    print("Publication year type distribution after migration:", counter)

if __name__ == "__main__":
    migrate()
