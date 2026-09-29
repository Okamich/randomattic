# -*- coding: utf-8 -*-
"""
scripts/build_npc_voice_traits_job.py
Extracts, translates, and compiles data from:
- files/NPC/npc_voice.xlsx
- files/NPC/npc_job.xlsx
- files/NPC/NPC_TRAITS.xlsx
into clean JavaScript ES modules.
"""

import openpyxl, sys, json, os, re

sys.stdout.reconfigure(encoding='utf-8')

def extract_raw_voice():
    wb = openpyxl.load_workbook('files/NPC/npc_voice.xlsx', data_only=True)
    sheet = wb.active
    
    speed = [
        {"roll": 1, "key": "slow", "textEn": "Slow", "textRu": "Медленная, размеренная речь"},
        {"roll": 2, "key": "medium", "textEn": "Medium", "textRu": "Обычный, умеренный темп"},
        {"roll": 3, "key": "fast", "textEn": "Fast", "textRu": "Быстрая, торопливая речь"}
    ]
    pitch = [
        {"roll": 1, "key": "low", "textEn": "Low", "textRu": "Низкий, басовитый тон"},
        {"roll": 2, "key": "medium", "textEn": "Medium", "textRu": "Средний, естественный тон"},
        {"roll": 3, "key": "high", "textEn": "High", "textRu": "Высокий, звонкий тон"}
    ]
    textures = [
        {"roll": 1, "key": "gruff", "textEn": "Gruff", "textRu": "Хриплый, грубый"},
        {"roll": 2, "key": "smooth", "textEn": "Smooth", "textRu": "Бархатистый, мягкий"},
        {"roll": 3, "key": "strained", "textEn": "Strained", "textRu": "Напряжённый, сдавленный"},
        {"roll": 4, "key": "relaxed", "textEn": "Relaxed", "textRu": "Расслабленный, спокойный"},
        {"roll": 5, "key": "breathy", "textEn": "Breathy", "textRu": "С придыханием, вкрадчивый"},
        {"roll": 6, "key": "wolfish", "textEn": "Wolfish (from the back of the throat)", "textRu": "Гортанный, рычащий («волчий»)"},
        {"roll": 7, "key": "scratchy", "textEn": "Scratchy", "textRu": "Скрипучий, дребезжащий"},
        {"roll": 8, "key": "nasal", "textEn": "Nasal", "textRu": "Гнусавый, в нос"}
    ]

    speech_patterns = []
    mannerisms = []

    for r in range(16, sheet.max_row + 1):
        c1, c2 = sheet.cell(r, 1).value, sheet.cell(r, 2).value
        c5, c6 = sheet.cell(r, 5).value, sheet.cell(r, 6).value
        if c1 is not None and c2 is not None:
            speech_patterns.append({"roll": int(c1), "textEn": str(c2).strip()})
        if c5 is not None and c6 is not None:
            mannerisms.append({"roll": int(c5), "textEn": str(c6).strip()})

    return {
        "speed": speed,
        "pitch": pitch,
        "textures": textures,
        "speechPatterns": speech_patterns,
        "mannerisms": mannerisms
    }

def extract_raw_jobs():
    wb = openpyxl.load_workbook('files/NPC/npc_job.xlsx', data_only=True)
    sheet = wb.active
    jobs = []
    for r in range(2, sheet.max_row + 1):
        c1, c2 = sheet.cell(r, 1).value, sheet.cell(r, 2).value
        if c2 is not None:
            jobs.append({
                "roll": int(c1) if c1 is not None else len(jobs) + 1,
                "titleRu": str(c2).strip()
            })
    return jobs

def extract_raw_traits():
    wb = openpyxl.load_workbook('files/NPC/NPC_TRAITS.xlsx', data_only=True)
    traits = {}
    for sname in wb.sheetnames:
        sheet = wb[sname]
        traits[sname] = []
        for r in range(1, sheet.max_row + 1):
            row_items = []
            for c in range(1, sheet.max_column + 1):
                val = sheet.cell(r, c).value
                if val is not None:
                    row_items.append((c, str(val).strip()))
            if row_items:
                traits[sname].append({"row": r, "items": row_items})
    return traits

if __name__ == '__main__':
    v = extract_raw_voice()
    j = extract_raw_jobs()
    t = extract_raw_traits()
    with open('files/NPC/raw_voice_extracted.json', 'w', encoding='utf-8') as f:
        json.dump(v, f, ensure_ascii=False, indent=2)
    with open('files/NPC/raw_jobs_extracted.json', 'w', encoding='utf-8') as f:
        json.dump(j, f, ensure_ascii=False, indent=2)
    with open('files/NPC/raw_traits_extracted.json', 'w', encoding='utf-8') as f:
        json.dump(t, f, ensure_ascii=False, indent=2)
    print("Extracted voice, jobs, and traits raw files successfully!")
