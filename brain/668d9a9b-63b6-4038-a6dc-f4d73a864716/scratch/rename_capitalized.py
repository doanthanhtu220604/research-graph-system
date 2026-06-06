import os

def rename_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # We want to replace ntuknowledge and NTUKNOWLEDGE (and any other case variation)
    # with NTUKnowledge in visible parts.
    # Note: we need to be careful with things that should stay lowercase if there's any.
    # But logo text, title, emails, etc. should all be "NTUKnowledge".
    content = content.replace("ntuknowledge Admin", "NTUKnowledge Admin")
    content = content.replace("ntuknowledge", "NTUKnowledge")
    content = content.replace("NTUKNOWLEDGE", "NTUKnowledge")
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {file_path}")

def main():
    # Update HTML files
    frontend_dir = r"d:\research-graph-system\frontend"
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                rename_in_file(file_path)
                
    # Update backend Python files
    backend_dir = r"d:\research-graph-system\backend"
    for root, dirs, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                rename_in_file(file_path)

if __name__ == "__main__":
    main()
