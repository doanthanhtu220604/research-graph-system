import urllib.request
import re

url = "https://chuyengia.ntu.edu.vn/chuyengia/timkiem/index/DV_13"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    # Bỏ qua SSL warning nếu có
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8')
        
    # Tìm tất cả các link chứa PersonelInfo
    links = re.findall(r'href="([^"]*/PersonelInfo/[^"]*)"', html)
    # Tìm tên giảng viên (thường nằm sát thẻ a)
    # Regex cơ bản lấy đoạn text sau thẻ a
    matches = re.findall(r'<a[^>]*href="([^"]*/PersonelInfo/[^"]*)"[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
    
    print(f"Total links found: {len(matches)}")
    for href, name in matches[:10]:
        name_clean = re.sub(r'<[^>]+>', '', name).strip()
        print(f"Link: {href} - Name: {name_clean}")
        
except Exception as e:
    print(f"Error: {e}")
