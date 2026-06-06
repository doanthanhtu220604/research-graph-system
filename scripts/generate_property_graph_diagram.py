import os
from PIL import Image, ImageDraw, ImageFont

def draw_property_graph():
    # Canvas parameters
    width, height = 1000, 520
    # Background color (very light gray/white)
    bg_color = (250, 250, 253)
    image = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(image)

    # Color scheme
    purple_fill = (233, 233, 255)
    purple_border = (93, 92, 222)
    purple_text = (30, 30, 90)
    
    gray_line = (80, 80, 100)
    
    prop_fill = (248, 248, 255)
    prop_border = (142, 141, 223)
    
    rel_prop_fill = (255, 248, 235)
    rel_prop_border = (239, 160, 79)
    
    text_dark = (40, 40, 50)
    text_muted = (100, 100, 120)

    # Fonts loading
    # We will try loading system fonts
    font_bold = None
    font_regular = None
    font_small = None
    
    # Try different common font paths on Windows
    font_paths = [
        "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\calibri.ttf"
    ]
    font_bold_paths = [
        "C:\\Windows\\Fonts\\segoeuib.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\calibrib.ttf"
    ]
    
    for path in font_bold_paths:
        if os.path.exists(path):
            try:
                font_bold = ImageFont.truetype(path, 18)
                font_title = ImageFont.truetype(path, 22)
                break
            except:
                pass
                
    for path in font_paths:
        if os.path.exists(path):
            try:
                font_regular = ImageFont.truetype(path, 15)
                font_small = ImageFont.truetype(path, 13)
                break
            except:
                pass
                
    if font_bold is None:
        font_bold = ImageFont.load_default()
        font_title = ImageFont.load_default()
    if font_regular is None:
        font_regular = ImageFont.load_default()
    if font_small is None:
        font_small = ImageFont.load_default()

    # Draw Nodes
    # Node 1: gv:GiangVien
    n1_center = (200, 180)
    n1_r = 75
    draw.ellipse(
        [n1_center[0] - n1_r, n1_center[1] - n1_r, n1_center[0] + n1_r, n1_center[1] + n1_r],
        fill=purple_fill,
        outline=purple_border,
        width=3
    )
    # Node 1 Text
    label1 = "gv:GiangVien"
    w, h = draw.textsize(label1, font=font_bold) if hasattr(draw, "textsize") else (80, 20)
    # PIL older versions vs new version text size
    try:
        _, _, w, h = draw.textbbox((0, 0), label1, font=font_bold)
    except:
        pass
    draw.text((n1_center[0] - w/2, n1_center[1] - h/2), label1, fill=purple_text, font=font_bold)

    # Node 2: bm:BoMon
    n2_center = (800, 180)
    n2_r = 75
    draw.ellipse(
        [n2_center[0] - n2_r, n2_center[1] - n2_r, n2_center[0] + n2_r, n2_center[1] + n2_r],
        fill=purple_fill,
        outline=purple_border,
        width=3
    )
    # Node 2 Text
    label2 = "bm:BoMon"
    try:
        _, _, w, h = draw.textbbox((0, 0), label2, font=font_bold)
    except:
        w, h = 80, 20
    draw.text((n2_center[0] - w/2, n2_center[1] - h/2), label2, fill=purple_text, font=font_bold)

    # Draw Relationship Arrow (from n1 to n2)
    # Start at boundary of n1 (200 + 75 = 275)
    # End at boundary of n2 (800 - 75 = 725)
    arrow_start = (n1_center[0] + n1_r, n1_center[1])
    arrow_end = (n2_center[0] - n2_r, n2_center[1])
    
    # Line
    draw.line([arrow_start, (arrow_end[0] - 8, arrow_end[1])], fill=gray_line, width=3)
    # Arrow head
    draw.polygon(
        [
            arrow_end, 
            (arrow_end[0] - 12, arrow_end[1] - 8), 
            (arrow_end[0] - 12, arrow_end[1] + 8)
        ], 
        fill=gray_line
    )

    # Relationship Type Label in the middle
    rel_label = "THUOC_BO_MON"
    try:
        _, _, rw, rh = draw.textbbox((0, 0), rel_label, font=font_bold)
    except:
        rw, rh = 120, 20
    rel_center = (500, 180)
    
    # Background box for relationship text to cover the line
    padding_x, padding_y = 12, 6
    draw.rectangle(
        [
            rel_center[0] - rw/2 - padding_x, 
            rel_center[1] - rh/2 - padding_y, 
            rel_center[0] + rw/2 + padding_x, 
            rel_center[1] + rh/2 + padding_y
        ],
        fill=(255, 255, 255),
        outline=gray_line,
        width=1
    )
    draw.text((rel_center[0] - rw/2, rel_center[1] - rh/2), rel_label, fill=gray_line, font=font_bold)

    # Properties Box 1 (for Node 1)
    # Dotted line
    draw.line([(n1_center[0], n1_center[1] + n1_r), (n1_center[0], 310)], fill=prop_border, width=2)
    # Box
    prop1_rect = [70, 310, 330, 480]
    draw.rectangle(prop1_rect, fill=prop_fill, outline=prop_border, width=2)
    # Header
    draw.text((85, 320), "THUỘC TÍNH (PROPERTIES)", fill=purple_text, font=font_bold)
    draw.line([(85, 345), (315, 345)], fill=prop_border, width=1)
    # Property values
    props1 = [
        "id: \"gv_01\"",
        "ho_ten: \"Nguyễn Văn A\"",
        "hoc_vi: \"Tiến sĩ\"",
        "chuyen_nganh: \"CNPM\""
    ]
    y_offset = 355
    for prop in props1:
        draw.text((85, y_offset), prop, fill=text_dark, font=font_regular)
        y_offset += 25

    # Properties Box 2 (for Node 2)
    # Dotted line
    draw.line([(n2_center[0], n2_center[1] + n2_r), (n2_center[0], 310)], fill=prop_border, width=2)
    # Box
    prop2_rect = [670, 310, 930, 460]
    draw.rectangle(prop2_rect, fill=prop_fill, outline=prop_border, width=2)
    # Header
    draw.text((685, 320), "THUỘC TÍNH (PROPERTIES)", fill=purple_text, font=font_bold)
    draw.line([(685, 345), (915, 345)], fill=prop_border, width=1)
    # Property values
    props2 = [
        "id: \"bm_01\"",
        "ten_bo_mon: \"Công nghệ phần mềm\"",
        "ma_bo_mon: \"CNPM\""
    ]
    y_offset = 355
    for prop in props2:
        draw.text((685, y_offset), prop, fill=text_dark, font=font_regular)
        y_offset += 25

    # Properties Box 3 (for Relationship)
    # Dotted line from relationship box to relationship line
    draw.line([(500, 210), (500, 290)], fill=rel_prop_border, width=2)
    # Box
    prop3_rect = [390, 290, 610, 400]
    draw.rectangle(prop3_rect, fill=rel_prop_fill, outline=rel_prop_border, width=2)
    # Header
    draw.text((405, 300), "THUỘC TÍNH (PROPERTIES)", fill=(180, 90, 20), font=font_bold)
    draw.line([(405, 325), (595, 325)], fill=rel_prop_border, width=1)
    # Property values
    props3 = [
        "tu_nam: 2015",
        "vai_tro: \"Trưởng bộ môn\""
    ]
    y_offset = 335
    for prop in props3:
        draw.text((405, y_offset), prop, fill=text_dark, font=font_regular)
        y_offset += 25

    # Annotations for Three Features (Nodes, Relationships, Properties)
    # 1. Label for Node
    draw.text((80, 60), "1. Nút (Node)", fill=purple_border, font=font_bold)
    draw.text((80, 85), "- Biểu diễn thực thể", fill=text_muted, font=font_small)
    draw.line([(140, 110), (160, 130)], fill=purple_border, width=2) # pointer line

    # 2. Label for Relationship
    draw.text((430, 60), "2. Quan hệ (Relationship)", fill=gray_line, font=font_bold)
    draw.text((430, 85), "- Kết nối có hướng giữa các thực thể", fill=text_muted, font=font_small)
    draw.line([(500, 110), (500, 150)], fill=gray_line, width=2) # pointer line

    # 3. Label for Property
    draw.text((720, 60), "3. Thuộc tính (Property)", fill=rel_prop_border, font=font_bold)
    draw.text((720, 85), "- Lưu trữ cặp Key-Value trên Nút & Quan hệ", fill=text_muted, font=font_small)

    os.makedirs("docs", exist_ok=True)
    image.save("docs/graph_db_properties.png", "PNG")
    print("Image saved successfully to docs/graph_db_properties.png")

if __name__ == "__main__":
    draw_property_graph()
