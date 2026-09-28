# -*- coding: utf-8 -*-
"""
Script to extract and format settlement generation data from
files/Town/Генератор поселения.xlsx into js/data/town-data.js
"""

import openpyxl
import json
import os

wb = openpyxl.load_workbook(r'files/Town/Генератор поселения.xlsx', data_only=True)

def cell(ws, r, c):
    v = ws.cell(r, c).value
    return str(v).strip() if v is not None else ''

# 1. Sheet 1: Размер
ws1 = wb.worksheets[0]
geography_origins = []
for r in range(24, 34):
    v = cell(ws1, r, 2)
    if v:
        geography_origins.append(v)

resources_list = []
for r in range(36, 55):
    v = cell(ws1, r, 2)
    if v:
        resources_list.append(v)

# 2. Sheet 2: Планировка города
ws2 = wb.worksheets[1]
districts_raw = []
for r in range(5, 25):
    d_name = cell(ws2, r, 2)
    streets = []
    for c in range(8, 25):
        s_val = cell(ws2, r, c)
        if s_val and not s_val.startswith('('):
            streets.append(s_val)
    if d_name:
        districts_raw.append({
            'name': d_name,
            'streets': streets
        })

# 3. Sheet 4: О Поселении
ws4 = wb.worksheets[3]
race_relations = []
for r in range(3, 10):
    v = cell(ws4, r, 2)
    if v: race_relations.append(v)

rulers = []
for r in range(13, 30):
    v = cell(ws4, r, 2)
    if v: rulers.append(v)

misfortunes = []
for r in range(3, 29):
    v = cell(ws4, r, 9)
    if v: misfortunes.append(v)

landmarks = []
for r in range(3, 23):
    v = cell(ws4, r, 15)
    if v: landmarks.append(v)

pride = []
for r in range(3, 35):
    v = cell(ws4, r, 22)
    if v: pride.append(v)

# 4. Sheet 23: Стража
ws23 = wb.worksheets[22]
watch_colors = [cell(ws23, r, 2) for r in range(4, 16) if cell(ws23, r, 2)]
watch_symbols = [cell(ws23, r, 4) for r in range(4, 16) if cell(ws23, r, 4)]
watch_captains = [cell(ws23, r, 6) for r in range(4, 16) if cell(ws23, r, 6)]
watch_reputation = [cell(ws23, r, 8) for r in range(4, 14) if cell(ws23, r, 8)]
watch_armor = [cell(ws23, r, 10) for r in range(4, 10) if cell(ws23, r, 10)]

# 5. Sheet 19: Городские банды
ws19 = wb.worksheets[18]
gang_schemes = [cell(ws19, r, 1) for r in range(4, 12) if cell(ws19, r, 1)]
gang_symbols = [cell(ws19, r, 4) for r in range(4, 24) if cell(ws19, r, 4)]

# 6. Sheet 43: Магазин
ws43 = wb.worksheets[42]
shop_wares = [cell(ws43, r, 1) for r in range(4, 34) if cell(ws43, r, 1)]
shop_types = [cell(ws43, r, 3) for r in range(4, 14) if cell(ws43, r, 3)]
shop_owners = [cell(ws43, r, 5) for r in range(4, 16) if cell(ws43, r, 5)]
shop_quirks = [cell(ws43, r, 7) for r in range(4, 34) if cell(ws43, r, 7)]

# 7. Sheet 48 & 49: Гильдии
ws48 = wb.worksheets[47]
craft_trades = [cell(ws48, r, 1) for r in range(4, 24) if cell(ws48, r, 1)]
guild_status = [cell(ws48, r, 3) for r in range(4, 12) if cell(ws48, r, 3)]
guild_illicit = [cell(ws48, r, 5) for r in range(4, 12) if cell(ws48, r, 5)]

# 8. Sheet 14 & 15: Храмы
ws14 = wb.worksheets[13]
temple_gods = [cell(ws14, r, 3) for r in range(4, 16) if cell(ws14, r, 3)]
temple_features = [cell(ws14, r, 5) for r in range(4, 16) if cell(ws14, r, 5)]

# 9. Sheet 12: Горожане
ws12 = wb.worksheets[11]
quick_npcs = [
    {'role': 'Алхимик (Аптекарь)', 'goal': 'Ищет редкие горные травы и поставщиков', 'item': 'Необычное искрящееся зелье в фиале'},
    {'role': 'Городской стражник', 'goal': 'Выслеживает шайку карманников на рынке', 'item': 'Официальный ордер на арест с гербовой печатью'},
    {'role': 'Торговец специями', 'goal': 'Пытается договориться о снижении городской пошлины', 'item': 'Запечатанный мешочек с шафраном и корицей'},
    {'role': 'Знатный дворянин', 'goal': 'Интригует против конкурирующего патрицианского дома', 'item': 'Шелковый платок с вышитым родовым гербом'},
    {'role': 'Храмовый послушник', 'goal': 'Собирает пожертвования на восстановление святыни', 'item': 'Священный символ и медная чаша'},
    {'role': 'Провидец / Астролог', 'goal': 'Предостерегает прохожих от надвигающегося затмения', 'item': 'Астролябия из потертой латуни'},
    {'role': 'Опытный кузнец', 'goal': 'Ищет учеников для выполнения крупного заказа для стражи', 'item': 'Тяжелый молот с личным клеймом'},
    {'role': 'Трактирщик', 'goal': 'Ищет крепких наёмников, чтобы успокоить буйных матросов', 'item': 'Связка тяжелых железных ключей'},
    {'role': 'Ловкий карманник', 'goal': 'Ищет зазевавшегося богатого чужеземца', 'item': 'Острый кинжал-засапожник и воровские отмычки'},
    {'role': 'Менестрель / Бродячий бард', 'goal': 'Собирает слухи для новой баллады о бургомистре', 'item': 'Лютня с резным грифом'}
]

# 10. Sheet 22: События и уличные сцены
ws22 = wb.worksheets[21]
scenes = [cell(ws22, r, 1) for r in range(4, 24) if cell(ws22, r, 1)]

print('Done extracting raw data.')
