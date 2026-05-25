import os
import re

admin_dir = r"d:\research-graph-system\frontend\admin"

# Regex for the import.html menu item
# Matches <li class="nav-item ...">...import.html...</li> across multiple lines
menu_regex = re.compile(
    r'([ \t]*)<li[^>]*class="nav-item[^"]*"[^>]*>\s*<a[^>]*href="import\.html"[^>]*>.*?</a>\s*</li>',
    re.DOTALL | re.IGNORECASE
)

# Regex for the exportCsvBtn
export_btn_regex = re.compile(
    r'<button\s+id="exportCsvBtn"[^>]*>.*?</button>',
    re.DOTALL | re.IGNORECASE
)

new_menu_template = """{indent}<li class="nav-item has-submenu" id="menu-data">
{indent}    <a href="#" class="nav-link submenu-toggle">
{indent}        <i class="fas fa-database"></i>
{indent}        <span>Dữ liệu</span>
{indent}        <i class="fas fa-chevron-down submenu-arrow" style="margin-left: auto; font-size: 10px; transition: transform 0.3s;"></i>
{indent}    </a>
{indent}    <ul class="submenu" style="display: none; list-style: none; padding-left: 20px; margin-top: 4px; margin-bottom: 4px;">
{indent}        <li class="submenu-item" id="submenu-import"><a href="import.html" class="nav-link" style="padding: 10px 16px; border-radius: var(--radius-sm);"><i class="fas fa-file-import"></i><span>Import dữ liệu</span></a></li>
{indent}        <li class="submenu-item" id="submenu-export"><a href="export.html" class="nav-link" style="padding: 10px 16px; border-radius: var(--radius-sm);"><i class="fas fa-file-export"></i><span>Xuất dữ liệu</span></a></li>
{indent}    </ul>
{indent}</li>"""

for filename in os.listdir(admin_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(admin_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace menu item
        match = menu_regex.search(content)
        if match:
            indent = match.group(1)
            new_menu = new_menu_template.format(indent=indent)
            content = menu_regex.sub(new_menu, content)
            print(f"Updated nav menu in {filename}")
        else:
            print(f"Could not find nav menu in {filename}")

        # Remove export CSV button
        if export_btn_regex.search(content):
            content = export_btn_regex.sub("", content)
            print(f"Removed export CSV button from {filename}")

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

print("Done updating navigation!")
