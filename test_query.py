# -*- coding: utf-8 -*-
from backend.services.neo4j_connection import get_neo4j_connection
import sys

def test_query():
    conn = get_neo4j_connection()
    try:
        q = "Bùi Chí Thành"
        results = conn.query("""
            MATCH (n)
            WHERE any(key IN keys(n) WHERE toLower(toString(n[key])) CONTAINS toLower($q))
            RETURN id(n) AS node_id, n, labels(n) AS labels
            LIMIT 5
        """, {"q": q})
        print(results)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    test_query()
