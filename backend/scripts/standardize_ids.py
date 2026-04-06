import sys
import os

# Add the project root to sys.path so we can import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

try:
    from backend.services.neo4j_connection import get_neo4j_connection
except ImportError:
    print("Error: Could not import backend.services.neo4j_connection. Please run this script from the project root or ensure PYTHONPATH is correct.")
    sys.exit(1)

def migrate():
    try:
        conn = get_neo4j_connection()
        entities = {
            "GiangVien": "gv",
            "CongTrinhNghienCuu": "ct",
            "DeTaiNghienCuu": "dt",
            "LinhVucNghienCuu": "lv",
            "BoMon": "bm",
            "Khoa": "kh"
        }

        total_updated = 0
        for label, prefix in entities.items():
            print(f"Standardizing {label} nodes...")
            # We use a simple pattern: prefix_ + internal_id
            # This ensures uniqueness and a clear readable format
            query = f"""
            MATCH (n:{label})
            SET n.id = '{prefix}_' + toString(id(n))
            RETURN count(n) as count
            """
            result = conn.write(query)
            count = result[0]["count"] if result else 0
            print(f"Updated {count} {label} nodes.")
            total_updated += count

        print(f"Successfully standardized {total_updated} nodes in total.")
    except Exception as e:
        print(f"Error during migration: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate()
