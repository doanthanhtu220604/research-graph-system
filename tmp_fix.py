import re

with open('d:/research-graph-system/backend/routes/lecturer_api.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace simple GiangVien patterns
content = re.sub(
    r'toString\(id\(g\)\)\s*=\s*toString\(\$([a-zA-Z0-9_]+)\)\s*OR\s*toString\(g\.id\)\s*=\s*toString\(\$\1\)',
    r'(g.id IS NOT NULL AND toString(g.id) = toString($\1)) OR (g.id IS NULL AND toString(id(g)) = toString($\1))',
    content
)

# Replace CongTrinh patterns
content = re.sub(
    r'toString\(id\(ct\)\)\s*=\s*toString\(\$([a-zA-Z0-9_]+)\)\s*OR\s*toString\(ct\.id\)\s*=\s*toString\(\$\1\)',
    r'(ct.id IS NOT NULL AND toString(ct.id) = toString($\1)) OR (ct.id IS NULL AND toString(id(ct)) = toString($\1))',
    content
)

# Replace DeTai patterns
content = re.sub(
    r'toString\(id\(dt\)\)\s*=\s*toString\(\$([a-zA-Z0-9_]+)\)\s*OR\s*toString\(dt\.id\)\s*=\s*toString\(\$\1\)',
    r'(dt.id IS NOT NULL AND toString(dt.id) = toString($\1)) OR (dt.id IS NULL AND toString(id(dt)) = toString($\1))',
    content
)

with open('d:/research-graph-system/backend/routes/lecturer_api.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done lecturer_api.py')

# Also fix auth.py
with open('d:/research-graph-system/backend/routes/auth.py', 'r', encoding='utf-8') as f:
    auth_content = f.read()

auth_content = re.sub(
    r'toString\(g\.id\)\s*=\s*toString\(\$username\)\s*OR\s*toString\(id\(g\)\)\s*=\s*toString\(\$username\)',
    r'(g.id IS NOT NULL AND toString(g.id) = toString($username)) OR (g.id IS NULL AND toString(id(g)) = toString($username))',
    auth_content
)

with open('d:/research-graph-system/backend/routes/auth.py', 'w', encoding='utf-8') as f:
    f.write(auth_content)
print('Done auth.py')
