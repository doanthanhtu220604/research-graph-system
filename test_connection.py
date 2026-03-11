"""
Test ket noi Neo4j Database.
Chay script nay de kiem tra ket noi den Neo4j da hoat dong chua.

Cach dung:
    python test_connection.py
"""

import sys
import os
import io

# Fix encoding cho Windows terminal
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Thêm thư mục gốc vào path
sys.path.insert(0, os.path.dirname(__file__))

from backend.services.neo4j_connection import Neo4jConnection


def test_connection():
    """Kiểm tra kết nối và hiển thị thông tin database."""
    print("=" * 55)
    print("  TEST KẾT NỐI NEO4J - KNOWLEDGE MAP KHOA CNTT")
    print("=" * 55)
    print()

    try:
        with Neo4jConnection() as conn:
            # Test 1: Kết nối cơ bản
            print("📌 Test 1: Kết nối cơ bản")
            result = conn.query_single("RETURN 1 AS num, 'Hello Neo4j!' AS message")
            print(f"   Kết quả: {result}")
            print()

            # Test 2: Đếm nodes
            print("📌 Test 2: Thống kê database")
            node_count = conn.get_node_count()
            rel_count = conn.get_relationship_count()
            print(f"   Tổng số nodes: {node_count}")
            print(f"   Tổng số relationships: {rel_count}")
            print()

            # Test 3: Schema
            print("📌 Test 3: Schema database")
            schema = conn.get_schema_info()
            if schema["labels"]:
                print(f"   Node Labels: {', '.join(schema['labels'])}")
            else:
                print("   Node Labels: (chưa có)")

            if schema["relationship_types"]:
                print(f"   Relationship Types: {', '.join(schema['relationship_types'])}")
            else:
                print("   Relationship Types: (chưa có)")
            print()

            # Test 4: Hiển thị mẫu dữ liệu (nếu có)
            if node_count > 0:
                print("📌 Test 4: Mẫu dữ liệu (5 nodes đầu tiên)")
                samples = conn.query(
                    "MATCH (n) RETURN labels(n) AS labels, "
                    "properties(n) AS props LIMIT 5"
                )
                for i, sample in enumerate(samples, 1):
                    print(f"   {i}. [{', '.join(sample['labels'])}] {sample['props']}")
                print()

            print("=" * 55)
            print("  ✅ TẤT CẢ TESTS ĐỀU THÀNH CÔNG!")
            print("=" * 55)

    except Exception as e:
        print()
        print("=" * 55)
        print(f"  ❌ LỖI KẾT NỐI: {e}")
        print("=" * 55)
        print()
        print("🔧 Hướng dẫn khắc phục:")
        print("   1. Kiểm tra Neo4j đang chạy (http://localhost:7474)")
        print("   2. Kiểm tra file .env có đúng thông tin kết nối:")
        print("      NEO4J_URI=bolt://localhost:7687")
        print("      NEO4J_USERNAME=neo4j")
        print("      NEO4J_PASSWORD=<mật khẩu của bạn>")
        print("   3. Thử kết nối qua Neo4j Browser trước")
        sys.exit(1)


if __name__ == "__main__":
    test_connection()
