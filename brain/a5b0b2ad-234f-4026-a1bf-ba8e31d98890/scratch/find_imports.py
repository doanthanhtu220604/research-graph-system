import os
import ast

def get_imports_from_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            tree = ast.parse(f.read(), filename=filepath)
        except SyntaxError:
            return set()
    
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split('.')[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.add(node.module.split('.')[0])
    return imports

def main():
    backend_dir = r"d:\research-graph-system\backend"
    all_imports = set()
    for root, _, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                all_imports.update(get_imports_from_file(filepath))
    
    # Filter out local modules and standard libraries (rough approximation)
    print("All imported top-level modules:")
    for imp in sorted(all_imports):
        print(f" - {imp}")

if __name__ == "__main__":
    main()
