"""
Neo4j Connection Module
Quản lý kết nối đến Neo4j database cho Knowledge Map system.
"""

import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load biến môi trường từ file .env
load_dotenv()


class Neo4jConnection:
    """
    Quản lý kết nối Neo4j database.
    Hỗ trợ context manager (with statement).

    Sử dụng:
        with Neo4jConnection() as neo4j_conn:
            result = neo4j_conn.query("MATCH (n) RETURN n LIMIT 10")
    """

    def __init__(self, uri=None, username=None, password=None):
        self._uri = uri or os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self._username = username or os.getenv("NEO4J_USERNAME", "neo4j")
        self._password = password or os.getenv("NEO4J_PASSWORD", "")
        self._driver = None

    def connect(self):
        """Tạo kết nối đến Neo4j."""
        if self._driver is None:
            try:
                self._driver = GraphDatabase.driver(
                    self._uri,
                    auth=(self._username, self._password)
                )
                # Kiểm tra kết nối
                self._driver.verify_connectivity()
                print(f"[OK] Ket noi Neo4j thanh cong tai {self._uri}")
            except Exception as e:
                print(f"[ERROR] Loi ket noi Neo4j: {e}")
                raise
        return self

    def close(self):
        """Đóng kết nối Neo4j."""
        if self._driver:
            self._driver.close()
            self._driver = None
            print("[CLOSED] Da dong ket noi Neo4j")

    def query(self, cypher_query, parameters=None, db=None):
        """
        Chạy Cypher query và trả về kết quả.

        Args:
            cypher_query: Câu lệnh Cypher
            parameters: Dict tham số cho query (optional)
            db: Tên database (optional, mặc định là neo4j)

        Returns:
            List[dict]: Danh sách kết quả
        """
        if self._driver is None:
            self.connect()

        try:
            with self._driver.session(database=db) as session:
                result = session.run(cypher_query, parameters or {})
                return [record.data() for record in result]
        except Exception as e:
            print(f"[ERROR] Loi query: {e}")
            raise

    def query_single(self, cypher_query, parameters=None, db=None):
        """
        Chạy Cypher query và trả về 1 kết quả duy nhất.

        Args:
            cypher_query: Câu lệnh Cypher
            parameters: Dict tham số cho query (optional)
            db: Tên database (optional)

        Returns:
            dict hoặc None
        """
        results = self.query(cypher_query, parameters, db)
        return results[0] if results else None

    def write(self, cypher_query, parameters=None, db=None):
        """
        Chạy Cypher write query (CREATE, MERGE, DELETE, SET).

        Args:
            cypher_query: Câu lệnh Cypher
            parameters: Dict tham số cho query (optional)
            db: Tên database (optional)

        Returns:
            List[dict]: Danh sách kết quả
        """
        if self._driver is None:
            self.connect()

        try:
            with self._driver.session(database=db) as session:
                result = session.execute_write(
                    lambda tx: list(tx.run(cypher_query, parameters or {}))
                )
                return [record.data() for record in result]
        except Exception as e:
            print(f"[ERROR] Loi write query: {e}")
            raise

    def get_node_count(self):
        """Đếm tổng số node trong database."""
        result = self.query_single("MATCH (n) RETURN count(n) AS count")
        return result["count"] if result else 0

    def get_relationship_count(self):
        """Đếm tổng số relationship trong database."""
        result = self.query_single("MATCH ()-[r]->() RETURN count(r) AS count")
        return result["count"] if result else 0

    def get_schema_info(self):
        """Lấy thông tin schema: các label và relationship types."""
        labels = self.query("CALL db.labels() YIELD label RETURN label")
        rel_types = self.query(
            "CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType"
        )
        return {
            "labels": [r["label"] for r in labels],
            "relationship_types": [r["relationshipType"] for r in rel_types],
        }

    # Context manager
    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        return False


# Singleton instance cho toàn bộ app
_connection = None


def get_neo4j_connection():
    """Lấy singleton Neo4j connection instance."""
    global _connection
    if _connection is None:
        _connection = Neo4jConnection()
        _connection.connect()
    return _connection


def close_neo4j_connection():
    """Đóng singleton connection."""
    global _connection
    if _connection:
        _connection.close()
        _connection = None
