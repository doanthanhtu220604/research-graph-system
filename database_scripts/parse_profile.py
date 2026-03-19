import re

with open("profile.html", "r", encoding="utf-8") as f:
    html = f.read()

# Tìm tên giảng viên
name_match = re.search(r'<span id="Hoten"[^>]*>(.*?)</span>', html, re.IGNORECASE)
if not name_match:
    name_match = re.search(r'<div class="profile-name"[^>]*>(.*?)</div>', html, re.IGNORECASE)
if name_match:
    print("Name:", name_match.group(1).strip())

# Tìm các thẻ h3 hoặc thẻ tiêu đề để biết bảng nào chứa cái gì
headings = re.findall(r'<h[234][^>]*>(.*?)</h[234]>', html, re.IGNORECASE | re.DOTALL)
for h in headings:
    print("Heading:", re.sub(r'<[^>]+>', '', h).strip())

# Tìm tables
tables = re.findall(r'<table[^>]*>.*?</table>', html, re.IGNORECASE | re.DOTALL)
print("Found", len(tables), "tables")
for i, table in enumerate(tables):
    rows = re.findall(r'<tr[^>]*>.*?</tr>', table, re.IGNORECASE | re.DOTALL)
    if rows:
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', rows[0], re.IGNORECASE | re.DOTALL)
        clean_cells = [re.sub(r'<[^>]+>', '', c).strip() for c in cells]
        print(f"Table {i} Headers: {clean_cells}")
