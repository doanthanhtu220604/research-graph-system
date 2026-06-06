import os

def rename_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Precise replacements for title tags, descriptions, and logos
    content = content.replace("Knowledge Map Admin", "ntuknowledge Admin")
    content = content.replace("KnowledgeMap Admin", "ntuknowledge Admin")
    content = content.replace("Knowledge Map", "ntuknowledge")
    content = content.replace("KnowledgeMap", "ntuknowledge")
    content = content.replace("Bản đồ tri thức - ntuknowledge Admin", "Bản đồ tri thức - ntuknowledge Admin")
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {file_path}")

def main():
    frontend_dir = r"d:\research-graph-system\frontend"
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                rename_in_file(file_path)

if __name__ == "__main__":
    main()
