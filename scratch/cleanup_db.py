
import sys
import os

# Fix Unicode issue on Windows
if hasattr(sys.stdout, 'reconfigure') and sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.getcwd(), "backend")))

from services.neo4j_connection import get_neo4j_connection

def cleanup_database():
    conn = get_neo4j_connection()
    try:
        print("--- Dang tien hanh don dep CSDL ---")
        
        # 1. Xoa cac index sai
        indexes_to_drop = [
            "baibao_ten_idx", 
            "baibao_nam_idx", 
            "detai_ten_idx", 
            "detai_nam_idx"
        ]
        
        for idx in indexes_to_drop:
            try:
                conn.write(f"DROP INDEX {idx}")
                print(f"[OK] Da xoa index: {idx}")
            except Exception as e:
                print(f"[INFO] Khong the xoa index {idx} (co the khong ton tai hoac da xoa): {e}")
        
        # 2. Xoa cac node co label BaiBao hoac DeTai
        conn.write("MATCH (n:BaiBao) DETACH DELETE n")
        conn.write("MATCH (n:DeTai) DETACH DELETE n")
        
        print("[OK] Da xoa cac node label 'BaiBao' va 'DeTai' (neu co).")
        
        print("\n--- Kiem tra lai cac label ---")
        labels = conn.query("CALL db.labels() YIELD label RETURN label")
        print(f"Cac nhan con lai: {[r['label'] for r in labels]}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    cleanup_database()
