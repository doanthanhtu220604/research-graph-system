import sys, os, re
sys.path.append(os.getcwd())
from backend.services.neo4j_connection import get_neo4j_connection

conn = get_neo4j_connection()
results = conn.query('MATCH (dt:DeTaiNghienCuu) WHERE dt.nam_thuc_hien IS NOT NULL AND dt.nam_bat_dau IS NULL RETURN id(dt) as n_id, dt.nam_thuc_hien as nam')

updates = []
for r in results:
    nam_str = str(r['nam']).strip()
    bd = None
    kt = None
    
    # Extract numbers
    nums = re.findall(r'\d{4}', nam_str)
    if len(nums) == 1:
        bd = int(nums[0])
        kt = int(nums[0])
    elif len(nums) >= 2:
        bd = int(nums[0])
        kt = int(nums[1])
        if bd > kt:
            bd, kt = kt, bd
    
    if bd is not None:
        updates.append({
            'n_id': r['n_id'],
            'bd': bd,
            'kt': kt
        })

if updates:
    for u in updates:
        conn.write('MATCH (dt:DeTaiNghienCuu) WHERE id(dt) = $n_id SET dt.nam_bat_dau = $bd, dt.nam_ket_thuc = $kt', u)
    print(f'Migrated {len(updates)} projects.')
else:
    print('No projects to migrate.')
