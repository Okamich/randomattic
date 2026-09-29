# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('files/NPC/motives_extracted_raw.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for k, v in data.items():
    print(f"=== [{k}] {v['header']} ===")
    for idx, r in enumerate(v['rows']):
        print(f"  {idx+1}. {r}")
