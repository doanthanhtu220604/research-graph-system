"""
Migration script: Thêm thuộc tính trang_thai vào CongTrinhNghienCuu và DeTaiNghienCuu.
Mặc định tất cả đặt là 'Hoàn thành'.

Chạy từ thư mục gốc dự án:
    python -m backend.scripts.add_trang_thai
"""

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

try:
    from backend.services.neo4j_connection import get_neo4j_connection
except ImportError:
    print("Error: Could not import backend.services.neo4j_connection.")
    sys.exit(1)


def migrate():
    try:
        conn = get_neo4j_connection()

        targets = ["CongTrinhNghienCuu", "DeTaiNghienCuu"]
        total_updated = 0

        for label in targets:
            print(f"Adding 'trang_thai' to {label} nodes (where not already set)...")
            query = f"""
                MATCH (n:{label})
                WHERE n.trang_thai IS NULL
                SET n.trang_thai = 'Hoàn thành'
                RETURN count(n) AS count
            """
            result = conn.write(query)
            count = result[0]["count"] if result else 0
            print(f"  -> Updated {count} {label} nodes.")
            total_updated += count

        print(f"\nDone! Total nodes updated: {total_updated}")

    except Exception as e:
        print(f"Error during migration: {e}")
        sys.exit(1)


if __name__ == "__main__":
    migrate()
