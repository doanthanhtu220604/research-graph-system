import sys, os, urllib.request, re, ssl, html
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.services.neo4j_connection import get_neo4j_connection

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_html(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

def scrape_and_import():
    conn = get_neo4j_connection()
    url_list = "https://chuyengia.ntu.edu.vn/chuyengia/timkiem/index/DV_13"
    print(f"Fetching faculty list at {url_list}...")
    list_html = fetch_html(url_list)
    
    links = re.findall(r'href="(/chuyengia/timkiem/PersonelInfo/[^"]*)"', list_html, re.IGNORECASE)
    links = list(set(["https://chuyengia.ntu.edu.vn" + l for l in links]))
    
    print(f"Found {len(links)} lecturers in IT Faculty")
    
    # Đảm bảo Khoa CNTT tồn tại
    conn.write("MERGE (k:Khoa {ten_khoa: 'Khoa Công nghệ thông tin'})")
    
    for link in links:
        print(f"Processing {link} ...")
        prof_html = fetch_html(link)
        if not prof_html:
            continue
            
        # 1. Tìm tên
        name_match = re.search(r'<h4[^>]*style="color:darkblue"[^>]*>(.*?)</h4>', prof_html, re.IGNORECASE)
        name = html.unescape(re.sub(r'<[^>]+>', '', name_match.group(1)).strip()) if name_match else None
        
        # Bỏ đi các tiền tố học hàm, học vị để khớp với Database hiện tại
        if name:
            name = re.sub(r'^(GS\.|PGS\.|TS\.|ThS\.|Ths\.|KS\.|CN\.)\s*', '', name, flags=re.IGNORECASE).strip()
        
        if not name:
            print(f"  -> Could not find Name, skipping.")
            continue
            
        print(f"  -> Giảng viên: {name}")
        
        # 2. Tìm Email (nếu có)
        email_m = re.search(r'Email[:\s]*(?:<[^>]+>)*\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', prof_html, re.IGNORECASE)
        email = email_m.group(1) if email_m else ""
        
        # Cập nhật / Tạo node Giảng Viên
        query_gv = """
        MERGE (g:GiangVien {ho_va_ten: $name})
        ON CREATE SET g.email = $email, g.chuc_danh = 'Chưa xác định', g.hoc_vi = 'Chưa xác định'
        """
        conn.write(query_gv, {'name': name, 'email': email})
        
        # 3. Tìm Công trình
        pub_section_match = re.search(r'CÔNG TRÌNH KHOA HỌC ĐƯỢC CÔNG BỐ.*?(<h[234]|$)', prof_html, re.IGNORECASE | re.DOTALL)
        pub_count = 0
        if pub_section_match:
            pub_section = pub_section_match.group(0)
            pubs = re.findall(r'<div class="pt-1 pb-1">\[\d+\]\s*(.*?)</div>', pub_section, re.IGNORECASE | re.DOTALL)
            for pub_html in pubs:
                title_m = re.search(r'<i>(.*?)</i>', pub_html, re.IGNORECASE | re.DOTALL)
                title = html.unescape(re.sub(r'<[^>]+>', '', title_m.group(1)).strip()) if title_m else None
                if not title:
                    title = html.unescape(re.sub(r'<[^>]+>', '', pub_html).strip()[:100]) + "..." # Fallback
                
                year_m = re.findall(r'\b(19\d\d|20\d\d)\b', pub_html)
                year = year_m[-1] if year_m else ""
                
                if title:
                    query_pub = """
                    MATCH (g:GiangVien {ho_va_ten: $name})
                    MERGE (c:CongTrinhNghienCuu {ten_cong_trinh: $title})
                    ON CREATE SET c.nam_xuat_ban = $year
                    MERGE (g)-[:LA_TAC_GIA_CUA]->(c)
                    """
                    conn.write(query_pub, {'name': name, 'title': title, 'year': year})
                    pub_count += 1
                    
        # 4. Tìm Đề tài
        detai_section_match = re.search(r'CÁC ĐỀ TÀI, DỰ ÁN.*?(<h[234]|$)', prof_html, re.IGNORECASE | re.DOTALL)
        dt_count = 0
        if detai_section_match:
            detai_section = detai_section_match.group(0)
            tables = re.findall(r'<table[^>]*>.*?</table>', detai_section, re.IGNORECASE | re.DOTALL)
            for table in tables:
                rows = re.findall(r'<tr[^>]*>.*?</tr>', table, re.IGNORECASE | re.DOTALL)
                for row in rows[1:]: # Bỏ qua dòng tiêu đề
                    cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.IGNORECASE | re.DOTALL)
                    if len(cells) >= 4:
                        dt_name = html.unescape(re.sub(r'<[^>]+>', '', cells[1]).strip())
                        dt_cap = html.unescape(re.sub(r'<[^>]+>', '', cells[2]).strip())
                        dt_nam = html.unescape(re.sub(r'<[^>]+>', '', cells[3]).strip())
                        
                        if dt_name:
                            query_dt = """
                            MATCH (g:GiangVien {ho_va_ten: $name})
                            MERGE (d:DeTaiNghienCuu {ten_de_tai: $title})
                            ON CREATE SET d.cap_de_tai = $cap, d.nam_thuc_hien = $year
                            MERGE (g)-[:CHU_NHIEM]->(d)
                            """
                            conn.write(query_dt, {'name': name, 'title': dt_name, 'cap': dt_cap, 'year': dt_nam})
                            dt_count += 1
                            
        print(f"  -> Đã chèn {dt_count} đề tài và {pub_count} công trình.")
                        
    print("Hoàn tất bóc tách dữ liệu Khoa CNTT và nạp vào Neo4j!")
    conn.close()

if __name__ == '__main__':
    scrape_and_import()
