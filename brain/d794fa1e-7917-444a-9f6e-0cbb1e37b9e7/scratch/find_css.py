import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

filepath = r"d:\research-graph-system\frontend\css\responsive_user.css"
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()
    for idx, line in enumerate(lines):
        if "@media" in line:
            print(f"{idx+1}: {line.strip()}")
