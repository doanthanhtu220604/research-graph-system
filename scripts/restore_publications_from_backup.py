# -*- coding: utf-8 -*-
"""
Safety recovery script:
Restores the CongTrinhNghienCuu nodes back to the state in the backup JSON file.

Run: python -m scripts.restore_publications_from_backup
"""

import os
import sys
import json

# Fix encoding on Windows
sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

from backend.services.neo4j_connection import get_neo4j_connection

def main():
    backup_path = os.path.join(project_root, "neo4j_export", "backup_publications_before_revert.json")
    if not os.path.exists(backup_path):
        print(f"ERROR: Backup file not found at {backup_path}")
        return
        
    print(f"Loading backup data from {backup_path}...")
    with open(backup_path, "r", encoding="utf-8") as f:
        backup_data = json.load(f)
        
    print(f"Loaded {len(backup_data)} records to restore.")
    
    conn = get_neo4j_connection()
    success_count = 0
    error_count = 0
    
    for item in backup_data:
        ct_id = item["id"]
        try:
            conn.write("""
                MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
                SET ct.ten_cong_trinh = $ten_en,
                    ct.ten_cong_trinh_vi = $ten_vi,
                    ct.slug = $slug,
                    ct.slug_vi = $slug_vi
            """, {
                "id": ct_id,
                "ten_en": item["ten_cong_trinh"],
                "ten_vi": item["ten_cong_trinh_vi"],
                "slug": item["slug"],
                "slug_vi": item["slug_vi"]
            })
            success_count += 1
        except Exception as e:
            error_count += 1
            print(f"  ✗ Error restoring {ct_id}: {e}")
            
    print(f"\nRestore finished:")
    print(f"  ✓ Successfully restored: {success_count}")
    print(f"  ✗ Failed restores       : {error_count}")
    print("="*60)

if __name__ == "__main__":
    main()
