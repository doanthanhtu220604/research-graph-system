# -*- coding: utf-8 -*-
"""
Script to revert translations of research work titles (CongTrinhNghienCuu):
- Restores original titles to ct.ten_cong_trinh.
- Sets ct.ten_cong_trinh_vi to ''.
- Updates ct.slug based on the restored title.
- Sets ct.slug_vi to ''.

Run: python -m scripts.revert_translate_publications
"""

import os
import sys
import csv
import json
import unicodedata
import re

# Fix encoding on Windows
sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

from backend.services.neo4j_connection import get_neo4j_connection

# ─── Slug generator ────────────────────────────────────────────────────────
def generate_slug(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "d")
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")

# ─── Vietnamese character detection ────────────────────────────────────────
def is_likely_vietnamese(text: str) -> bool:
    viet_chars = set("àáâãăắằẳẵặấầẩẫậèéêếềểễệìíîïòóôõơớờởỡợúùưứừửữựỳýỷỹỵđ"
                     "ÀÁÂÃĂẮẰẲẴẶẤẦẨẪẬÈÉÊẾỀỂỄỆÌÍÎÏÒÓÔÕƠỚỜỞỠỢÚÙƯỨỪỬỮỰỲÝỶỸỴĐ")
    return any(c in viet_chars for c in text)

def main():
    conn = get_neo4j_connection()
    
    # 1. Fetch current DB state of all CongTrinhNghienCuu nodes
    print("Step 1: Fetching current state of all CongTrinhNghienCuu nodes...")
    db_nodes = conn.query("""
        MATCH (ct:CongTrinhNghienCuu)
        RETURN ct.id AS id, 
               ct.ten_cong_trinh AS ten_cong_trinh, 
               ct.ten_cong_trinh_vi AS ten_cong_trinh_vi, 
               ct.slug AS slug, 
               ct.slug_vi AS slug_vi
        ORDER BY ct.id
    """)
    
    total_nodes = len(db_nodes)
    print(f"Found {total_nodes} nodes in database.")
    
    # 2. Save complete JSON backup of the current state
    backup_path = os.path.join(project_root, "neo4j_export", "backup_publications_before_revert.json")
    backup_data = []
    for node in db_nodes:
        backup_data.append({
            "id": node["id"],
            "ten_cong_trinh": node["ten_cong_trinh"] or "",
            "ten_cong_trinh_vi": node["ten_cong_trinh_vi"] or "",
            "slug": node["slug"] or "",
            "slug_vi": node["slug_vi"] or ""
        })
        
    with open(backup_path, "w", encoding="utf-8") as bf:
        json.dump(backup_data, bf, ensure_ascii=False, indent=4)
    print(f"✓ Created safety backup at: {backup_path}")
    
    # 3. Load original CSV backup
    csv_path = os.path.join(project_root, "neo4j_export", "nodes_CongTrinhNghienCuu.csv")
    csv_mapping = {}
    if os.path.exists(csv_path):
        print(f"Step 2: Loading original titles from CSV backup at: {csv_path}")
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                csv_mapping[row["id"]] = row["ten_cong_trinh"]
        print(f"Loaded {len(csv_mapping)} records from CSV.")
    else:
        print("⚠ WARNING: Original CSV backup not found! Running in fallback mode.")
    
    # 4. Explicit mapping for new nodes (not in CSV)
    new_nodes_mapping = {
        "ct_54": "ỨNG DỤNG THUẬT TOÁN NHÁNH CẬN ĐỂ GIẢI MỘT SỐ BÀI TOÁN TỐI ƯU LIÊN QUAN ĐẾN CHU TRÌNH HAMILTON DỰA TRÊN BÀI TOÁN TSP",
        "ct_307": "LÝ THUYẾT HỌC TẬP VÀ ĐIỀU KHIỂN MÁY",
        "ct_308": "SUY LUẬN NHÂN QUẢ TRÊN CÁC ĐỒ THỊ ĐƯỢC LÀM GIÀU BẰNG ONTOLOGY NHẰM XÂY DỰNG TRÍ TUỆ NHÂN TẠO Y TẾ CÓ KHẢ NĂNG GIẢI THÍCH",
        "ct_329": "APRIORI-DT HYBRID ALGORITHM AND EXPERIMENTAL"
    }
    
    # 5. Process reverts
    print("\nStep 3: Calculating revert properties for each node...")
    updates = []
    
    for node in db_nodes:
        ct_id = node["id"]
        current_ten = node["ten_cong_trinh"] or ""
        current_vi = node["ten_cong_trinh_vi"] or ""
        
        original_title = None
        
        # Check CSV mapping first
        if ct_id in csv_mapping:
            original_title = csv_mapping[ct_id]
        # Check new nodes mapping next
        elif ct_id in new_nodes_mapping:
            original_title = new_nodes_mapping[ct_id]
        # Fallback heuristic
        else:
            if current_vi and is_likely_vietnamese(current_vi):
                # If current_vi is Vietnamese, and it was a translation/original,
                # we assume original was Vietnamese.
                original_title = current_vi
            else:
                original_title = current_ten
        
        # Decide reverted fields
        # If the original title was Vietnamese:
        #   ten_cong_trinh = original_title (Vietnamese)
        #   ten_cong_trinh_vi = ""
        # If the original title was English:
        #   ten_cong_trinh = original_title (English)
        #   ten_cong_trinh_vi = ""
        
        reverted_title = original_title.strip()
        reverted_vi = ""
        
        new_slug = generate_slug(reverted_title)
        new_slug_vi = ""
        
        # Check if any change is actually needed
        if (reverted_title != current_ten or 
            reverted_vi != current_vi or 
            new_slug != node["slug"] or 
            new_slug_vi != node["slug_vi"]):
            
            updates.append({
                "id": ct_id,
                "old_title": current_ten,
                "old_vi": current_vi,
                "new_title": reverted_title,
                "new_vi": reverted_vi,
                "new_slug": new_slug,
                "new_slug_vi": new_slug_vi
            })
            
    print(f"Planned updates for {len(updates)} nodes out of {total_nodes} total.")
    
    # 6. Execute updates
    if not updates:
        print("✓ All nodes are already in their correct reverted state. No changes made.")
        return
        
    print("\nStep 4: Executing Neo4j updates...")
    success_count = 0
    error_count = 0
    
    for item in updates:
        ct_id = item["id"]
        try:
            # Handle slug duplicate conflicts by adding suffix if needed
            slug_candidate = item["new_slug"]
            existing = conn.query_single("""
                MATCH (ct:CongTrinhNghienCuu)
                WHERE ct.slug = $slug AND ct.id <> $id
                  AND coalesce(ct.is_deleted, false) = false
                RETURN ct.id AS dup_id
            """, {"slug": slug_candidate, "id": ct_id})
            
            if existing:
                slug_candidate = f"{slug_candidate}-{ct_id}"
            
            conn.write("""
                MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
                SET ct.ten_cong_trinh = $new_title,
                    ct.ten_cong_trinh_vi = $new_vi,
                    ct.slug = $slug,
                    ct.slug_vi = $slug_vi
            """, {
                "id": ct_id,
                "new_title": item["new_title"],
                "new_vi": item["new_vi"],
                "slug": slug_candidate,
                "slug_vi": item["new_slug_vi"]
            })
            success_count += 1
        except Exception as e:
            error_count += 1
            print(f"  ✗ Error updating {ct_id}: {e}")
            
    print(f"\nMigration finished:")
    print(f"  ✓ Successfully updated: {success_count}")
    print(f"  ✗ Failed updates      : {error_count}")
    print("="*60)
    
if __name__ == "__main__":
    main()
