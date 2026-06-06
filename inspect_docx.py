import zipfile
import re
import xml.etree.ElementTree as ET

docx_path = "ThamKhao_BaoCao_ĐATN_TonHuynhPhuongLan (2).docx"

try:
    with zipfile.ZipFile(docx_path) as z:
        doc_xml = z.read("word/document.xml")
        root = ET.fromstring(doc_xml)
        
        # NS map for word
        namespaces = {
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
        }
        
        paragraphs = []
        for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            text = "".join(node.text for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text)
            if text:
                paragraphs.append(text)
                
        with open("docx_output.txt", "w", encoding="utf-8") as out:
            out.write(f"Total paragraphs read: {len(paragraphs)}\n")
            
            # Search for "MATCH" or "Cypher" or "truy vấn"
            matches = []
            for idx, p in enumerate(paragraphs):
                if "cypher" in p.lower() or "match" in p.upper() or "truy vấn" in p.lower():
                    matches.append((idx, p))
                    
            out.write(f"\n--- Found {len(matches)} matches: ---\n")
            for idx, p in matches[:50]:
                out.write(f"[{idx}]: {p[:100]}\n")
                # Print nearby paragraphs if it has "MATCH" or "Cypher"
                if "cypher" in p.lower() or "match" in p.upper():
                    out.write("  Context:\n")
                    start = max(0, idx - 2)
                    end = min(len(paragraphs), idx + 8)
                    for j in range(start, end):
                        out.write(f"    {j}: {paragraphs[j][:120]}\n")
                    out.write("-" * 40 + "\n")
            
except Exception as e:
    print("Error:", e)
