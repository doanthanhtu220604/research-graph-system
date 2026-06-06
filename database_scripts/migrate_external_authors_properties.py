import sys
import os

# Thêm thư mục gốc vào path để import backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.neo4j_connection import get_neo4j_connection

def migrate_external_authors():
    conn = get_neo4j_connection()
    try:
        # Check current status
        check_query = """
        MATCH (tgn:TacGiaNgoai)
        RETURN count(tgn) as total,
               sum(case when tgn.hoc_vi is null then 1 else 0 end) as missing_hoc_vi,
               sum(case when tgn.chuc_danh is null then 1 else 0 end) as missing_chuc_danh,
               sum(case when tgn.don_vi_cong_tac is null then 1 else 0 end) as missing_don_vi,
               sum(case when tgn.email is null then 1 else 0 end) as missing_email,
               sum(case when tgn.trang_thai is null then 1 else 0 end) as missing_trang_thai,
               sum(case when tgn.is_deleted is null then 1 else 0 end) as missing_is_deleted
        """
        status = conn.query_single(check_query)
        print("Status before standardization:")
        if status is not None:
            print(f"Total TacGiaNgoai: {status['total']}")
            print(f" - Missing hoc_vi: {status['missing_hoc_vi']}")
            print(f" - Missing chuc_danh: {status['missing_chuc_danh']}")
            print(f" - Missing don_vi_cong_tac: {status['missing_don_vi']}")
            print(f" - Missing email: {status['missing_email']}")
            print(f" - Missing trang_thai: {status['missing_trang_thai']}")
            print(f" - Missing is_deleted: {status['missing_is_deleted']}")
        else:
            print("Failed to retrieve status.")

        # Perform migration
        update_query = """
        MATCH (tgn:TacGiaNgoai)
        SET tgn.hoc_vi = coalesce(tgn.hoc_vi, ""),
            tgn.chuc_danh = coalesce(tgn.chuc_danh, ""),
            tgn.don_vi_cong_tac = coalesce(tgn.don_vi_cong_tac, ""),
            tgn.email = coalesce(tgn.email, ""),
            tgn.trang_thai = coalesce(tgn.trang_thai, "Đã duyệt"),
            tgn.is_deleted = coalesce(tgn.is_deleted, false)
        RETURN count(tgn) as updated
        """
        result = conn.write(update_query)
        print(f"\nSuccessfully standardized {result[0]['updated']} TacGiaNgoai nodes.")

    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_external_authors()
