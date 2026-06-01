# -*- coding: utf-8 -*-
with open(r'd:\research-graph-system\scratch\generate_use_cases.py', 'r', encoding='utf-8') as f:
    text = f.read()

namespace = {}
exec(text, namespace)
use_cases = namespace['use_cases']

out = []
for idx, uc in enumerate(use_cases):
    out.append(f"UC {idx+1}: {uc['title']} | Actor: {uc['actor']}")

with open(r'd:\research-graph-system\scratch\actor_inspect.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(out))
