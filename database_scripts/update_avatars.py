"""
Script: Lay anh dai dien giang vien tu trang chuyen gia NTU va cap nhat vao Neo4j.
Nguon: https://chuyengia.ntu.edu.vn/chuyengia/timkiem/index/DV_13
"""

import re
import sys
import os
import json

# Fix lỗi in tiếng Việt trên Windows
if hasattr(sys.stdout, 'reconfigure') and sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import requests  # type: ignore
from bs4 import BeautifulSoup, Tag  # type: ignore
import urllib3  # type: ignore

# Thêm thư mục gốc của project vào path để import backend module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from backend.services.neo4j_connection import Neo4jConnection

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://chuyengia.ntu.edu.vn"
PAGE_URL = f"{BASE_URL}/chuyengia/timkiem/index/DV_13"


def clean_name(raw_name):
    """Loại bỏ học vị (TS., ThS., PGS., GS., ...) khỏi tên để so sánh."""
    # Loại bỏ các tiền tố học vị phổ biến
    cleaned = re.sub(r'^(PGS\.\s*TS\.|GS\.\s*TS\.|TS\.|ThS\.|PGS\.|GS\.|CN\.|KS\.)\s*', '', raw_name.strip())
    return cleaned.strip()


def scrape_experts():
    """Scrape tên + ảnh đại diện từ trang chuyên gia NTU."""
    print(f"[1/3] Đang tải trang: {PAGE_URL}")
    response = requests.get(PAGE_URL, verify=False, timeout=15)
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')

    experts = []
    # Mỗi chuyên gia nằm trong một div.card-body
    cards = soup.find_all('div', class_='card-body')
    for card in cards:
        if not isinstance(card, Tag):
            continue
            
        img = card.find('img', src=lambda s: s and 'PersonelImage' in s)
        if not img:
            continue

        # Tên nằm trong thẻ h4
        h4 = card.find('h4')
        if not h4 or not isinstance(h4, Tag):
            continue

        raw_name = h4.get_text(strip=True)
        
        img = card.find('img', src=lambda s: s and 'PersonelImage' in s)
        if not img or not isinstance(img, Tag):
            continue

        image_src = str(img.get('src', ''))
        image_url = f"{BASE_URL}{image_src}" if image_src.startswith('/') else image_src

        experts.append({
            'raw_name': raw_name,
            'cleaned_name': clean_name(raw_name),
            'image_url': image_url
        })

    print(f"   -> Tìm thấy {len(experts)} chuyên gia trên trang web.")
    return experts


def update_neo4j(experts):
    """Cập nhật thuộc tính anh_dai_dien cho các node GiangVien trong Neo4j."""
    print("[2/3] Đang kết nối Neo4j và cập nhật ảnh đại diện...")

    with Neo4jConnection() as conn:
        # Lấy danh sách giảng viên hiện có
        gv_list = conn.query("""
            MATCH (gv:GiangVien)
            RETURN gv.ho_va_ten AS ho_va_ten, id(gv) AS gv_id
        """)

        matched = 0
        unmatched_experts = []

        for expert in experts:
            found = False
            expert_name_lower = expert['cleaned_name'].lower().strip()

            for gv in gv_list:
                gv_name = gv['ho_va_ten'] or ''
                gv_name_lower = gv_name.lower().strip()

                # So sánh tên đã làm sạch
                if expert_name_lower == gv_name_lower or expert_name_lower in gv_name_lower or gv_name_lower in expert_name_lower:
                    conn.write("""
                        MATCH (gv:GiangVien) WHERE id(gv) = $gv_id
                        SET gv.anh_dai_dien = $url
                    """, {"gv_id": gv['gv_id'], "url": expert['image_url']})
                    print(f"   [OK] {expert['raw_name']} -> {gv['ho_va_ten']} (id={gv['gv_id']})")
                    matched += 1
                    found = True
                    break

            if not found:
                unmatched_experts.append(expert['raw_name'])

        print(f"\n[3/3] KẾT QUẢ:")
        print(f"   - Đã gán ảnh thành công: {matched}/{len(experts)}")
        if unmatched_experts:
            print(f"   - Không khớp tên ({len(unmatched_experts)}):")
            for name in unmatched_experts:
                print(f"     * {name}")


if __name__ == '__main__':
    experts = scrape_experts()
    if experts:
        update_neo4j(experts)
    else:
        print("Không tìm thấy dữ liệu chuyên gia nào!")
