from backend.services.neo4j_connection import get_neo4j_connection

def main():
    conn = get_neo4j_connection()
    # Delete the test lecturer and any associated department relationships
    conn.write("""
        MATCH (g:GiangVien)
        WHERE g.ma_gv = 'GV_TEST_REG' OR g.username = 'test_username_gv' OR g.email = 'test_gv_reg@nhatranguni.edu.vn'
        DETACH DELETE g
    """)
    print("Database cleanup of test accounts completed successfully.")

if __name__ == "__main__":
    main()
