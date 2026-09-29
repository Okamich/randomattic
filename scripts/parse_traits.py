# -*- coding: utf-8 -*-
import openpyxl, sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('files/NPC/NPC_TRAITS.xlsx', data_only=True)

def parse_items_from_cells(sheet, min_r, max_r, col_list):
    results = []
    for r in range(min_r, max_r + 1):
        for c in col_list:
            v = sheet.cell(r, c).value
            if v:
                v = str(v).strip()
                # matches "1. Some text" or "10. Some text"
                m = re.match(r'^(\d+)\.\s*(.*)$', v)
                if m:
                    results.append({"roll": int(m.group(1)), "textEn": m.group(2).strip()})
                else:
                    results.append({"textEn": v})
    # sort by roll if roll present
    if all('roll' in x for x in results):
        results.sort(key=lambda x: x['roll'])
    return results

tables = {}

# SHEET: face
f = wb['face']
tables['eyes'] = parse_items_from_cells(f, 6, 25, [1])
tables['hair'] = parse_items_from_cells(f, 6, 25, [5])
tables['mouth'] = parse_items_from_cells(f, 6, 15, [9])
tables['nose'] = parse_items_from_cells(f, 6, 11, [13, 15]) # row 6-11 has col 13 (1..6) and col 15 (7..12)
tables['ears'] = parse_items_from_cells(f, 14, 19, [13, 15]) # row 14-19 has col 13 (1..6) and col 15 (7..12)
tables['chin'] = parse_items_from_cells(f, 18, 25, [9])
tables['otherFace'] = parse_items_from_cells(f, 22, 25, [13, 15])

# SHEET: PHYSICAL
p = wb['PHYSICAL']
tables['height'] = parse_items_from_cells(p, 6, 11, [1])
tables['body'] = parse_items_from_cells(p, 6, 25, [5])
tables['hands'] = parse_items_from_cells(p, 14, 19, [1])
tables['scar'] = parse_items_from_cells(p, 22, 25, [1])

# SHEET: ACCESSORIES
a = wb['ACCESSORIES']
tables['tattoo'] = parse_items_from_cells(a, 6, 17, [1])
tables['jewelry'] = parse_items_from_cells(a, 6, 17, [5])
tables['clothes'] = parse_items_from_cells(a, 20, 27, [1])
tables['jewelryMaterial'] = parse_items_from_cells(a, 20, 27, [5])

# SHEET: EMOTIONS
e = wb['EMOTIONS']
tables['calmTrait'] = parse_items_from_cells(e, 6, 13, [1, 3, 5, 7])
tables['mood'] = parse_items_from_cells(e, 6, 25, [9])
tables['stressTrait'] = parse_items_from_cells(e, 16, 23, [1, 3, 5, 7])

# SHEET: FAITH_BELIEFS_FLAWS
fb = wb['FAITH_BELIEFS_FLAWS']
tables['faith'] = parse_items_from_cells(fb, 6, 13, [1])
tables['prejudice'] = parse_items_from_cells(fb, 6, 11, [4])
tables['flaw'] = parse_items_from_cells(fb, 17, 36, [1])

for k, v in tables.items():
    rolls = [x.get('roll') for x in v]
    print(f"Table '{k}': {len(v)} items. Rolls: {rolls[:3]}...{rolls[-3:] if len(rolls)>=3 else ''}")

with open('files/NPC/traits_parsed.json', 'w', encoding='utf-8') as out:
    json.dump(tables, out, ensure_ascii=False, indent=2)
print("Saved to files/NPC/traits_parsed.json!")
