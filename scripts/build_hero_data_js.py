# -*- coding: utf-8 -*-
"""
build_hero_data_js.py
Compiles D&D 5e Hero data from 'files/Hero/Генератор Герои.xlsx'
into a structured JavaScript module 'js/data/hero-data.js'.
"""
import glob, openpyxl, json, re, os, sys

def clean_val(v):
    if v is None:
        return ""
    s = str(v).strip()
    # Strip leading "1. ", "2. ", etc.
    s = re.sub(r'^\d+[\.\-\–\s]+', '', s).strip()
    return s

# Load our comprehensive translation dictionary
with open('files/Hero/hero_ru_dict.json', 'r', encoding='utf-8') as f:
    RU_DICT = json.load(f)

# Common base translations
EXTRA_TRANSLATIONS = {
    # Races
    "dragonborn": "Драконорождённый",
    "dwarf": "Дварф",
    "dark elf": "Дроу (тёмный эльф)",
    "high elf": "Высший эльф",
    "wood elf": "Лесной эльф",
    "gnome": "Гном",
    "half-elf": "Полуэльф",
    "half-orc": "Полуорк",
    "halfling": "Полурослик",
    "human": "Человек",
    "tiefling": "Тифлинг",

    # Exotic races
    "centaur": "Кентавр",
    "dryad": "Дриада",
    "duergar": "Дуэргар",
    "kobold": "Кобольд",
    "genasi": "Дженази",
    "goblin": "Гоблин",
    "hobgoblin": "Хобгоблин",
    "medusa": "Медуза",
    "minotaur": "Минотавр",
    "lizardfolk": "Людоящер",
    "ogre": "Огр",
    "pixie": "Пикси",
    "revenant": "Ревенант",
    "satyr": "Сатир",
    "shadar-kai": "Шадар-кай",
    "troll": "Тролль",
    "vampire": "Вампир",
    "werebear": "Медведь-оборотень",
    "wererat": "Крыса-оборотень",
    "werewolf": "Волк-оборотень",

    # Backgrounds
    "acolyte": "Послушник (Acolyte)",
    "charlatan": "Шарлатан (Charlatan)",
    "criminal": "Преступник (Criminal)",
    "entertainer": "Артист (Entertainer)",
    "folk hero": "Народный герой (Folk Hero)",
    "gladiator": "Гладиатор (Gladiator)",
    "guild artisan": "Гильдейский ремесленник (Guild Artisan)",
    "guild merchant": "Купец гильдии (Guild Merchant)",
    "hermit": "Отшельник (Hermit)",
    "knight": "Рыцарь (Knight)",
    "noble": "Дворянин (Noble)",
    "outlander": "Чужеземец (Outlander)",
    "pirate": "Пират (Pirate)",
    "sage": "Мудрец (Sage)",
    "sailor": "Моряк (Sailor)",
    "soldier": "Солдат (Soldier)",
    "spy": "Шпион (Spy)",
    "urchin": "Беспризорник (Urchin)",
    "amnesiac": "Потерявший память (Amnesiac)",
    "hero of prophecy": "Герой пророчества (Hero of Prophecy)"
}
RU_DICT.update(EXTRA_TRANSLATIONS)

CLASS_INFO = {
    "(герой) Плут": {
        "id": "rogue",
        "nameRu": "Плут",
        "nameEn": "Rogue",
        "icon": "🗡️",
        "primaryAbility": "Ловкость (Dexterity)",
        "subclasses": ["Мистический ловкач (Arcane Trickster)", "Убийца (Assassin)", "Вор (Thief)"]
    },
    "(герой) Чародей": {
        "id": "sorcerer",
        "nameRu": "Чародей",
        "nameEn": "Sorcerer",
        "icon": "✨",
        "primaryAbility": "Харизма (Charisma)",
        "subclasses": ["Драконья кровь (Draconic Bloodline)", "Дикая магия (Wild Magic)"]
    },
    "(герой) Колдун": {
        "id": "warlock",
        "nameRu": "Колдун",
        "nameEn": "Warlock",
        "icon": "👁️",
        "primaryAbility": "Харизма (Charisma)",
        "subclasses": ["Архифея (Archfey)", "Исчадие (Fiend)", "Великий Древний (Great Old One)"]
    },
    "(герой) Волшебник": {
        "id": "wizard",
        "nameRu": "Волшебник",
        "nameEn": "Wizard",
        "icon": "📜",
        "primaryAbility": "Интеллект (Intelligence)",
        "subclasses": [
            "Школа Ограждения (Abjuration)", "Школа Воплощения (Conjuration)",
            "Школа Прорицания (Divination)", "Школа Очарования (Enchantment)",
            "Школа Эвокации (Evocation)", "Школа Иллюзий (Illusion)",
            "Школа Некромантии (Necromancy)", "Школа Превращения (Transmutation)"
        ]
    },
    "(герой) Варвар": {
        "id": "barbarian",
        "nameRu": "Варвар",
        "nameEn": "Barbarian",
        "icon": "🪓",
        "primaryAbility": "Сила (Strength)",
        "subclasses": ["Берсерк (Berserker)", "Тотемический воин (Totem Warrior)"]
    },
    "(герой) Бард": {
        "id": "bard",
        "nameRu": "Бард",
        "nameEn": "Bard",
        "icon": "🪕",
        "primaryAbility": "Харизма (Charisma)",
        "subclasses": ["Коллегия Знаний (College of Lore)", "Коллегия Доблести (College of Valor)"]
    },
    "(герой) Клирик": {
        "id": "cleric",
        "nameRu": "Клирик / Жрец",
        "nameEn": "Cleric",
        "icon": "⚡",
        "primaryAbility": "Мудрость (Wisdom)",
        "subclasses": [
            "Домен Жизни (Life Domain)", "Домен Света (Light Domain)",
            "Домен Войны (War Domain)", "Домен Бури (Tempest Domain)",
            "Домен Обмана (Trickery Domain)", "Домен Знания (Knowledge Domain)",
            "Домен Природы (Nature Domain)", "Домен Смерти (Death Domain)"
        ]
    },
    "(герой) Друид": {
        "id": "druid",
        "nameRu": "Друид",
        "nameEn": "Druid",
        "icon": "🍃",
        "primaryAbility": "Мудрость (Wisdom)",
        "subclasses": ["Круг Земли (Circle of the Land)", "Круг Луны (Circle of the Moon)"]
    },
    "(герой) Воин": {
        "id": "fighter",
        "nameRu": "Воин",
        "nameEn": "Fighter",
        "icon": "🛡️",
        "primaryAbility": "Сила / Ловкость",
        "subclasses": ["Мастер боевых искусств (Battle Master)", "Чемпион (Champion)", "Мистический рыцарь (Eldritch Knight)"]
    },
    "(герой) Монах": {
        "id": "monk",
        "nameRu": "Монах",
        "nameEn": "Monk",
        "icon": "🥋",
        "primaryAbility": "Ловкость / Мудрость",
        "subclasses": ["Путь Открытой Ладони (Open Hand)", "Путь Тени (Shadow)", "Путь Четырёх Стихий (Four Elements)"]
    },
    "(герой) Паладин": {
        "id": "paladin",
        "nameRu": "Паладин",
        "nameEn": "Paladin",
        "icon": "⚔️",
        "primaryAbility": "Сила / Харизма",
        "subclasses": ["Клятва Преданности (Devotion)", "Клятва Древних (Ancients)", "Клятва Мести (Vengeance)", "Клятвопреступник (Oathbreaker)"]
    },
    "(герой) Следопыт": {
        "id": "ranger",
        "nameRu": "Следопыт",
        "nameEn": "Ranger",
        "icon": "🏹",
        "primaryAbility": "Ловкость / Мудрость",
        "subclasses": ["Охотник (Hunter)", "Повелитель зверей (Beast Master)"]
    }
}

TABLE_METADATA = [
    {"key": "grewUpIn", "titleRu": "Место взросления", "icon": "🌍"},
    {"key": "pastProfession", "titleRu": "Прошлое занятие", "icon": "📜"},
    {"key": "pride", "titleRu": "Предмет гордости", "icon": "🌟"},
    {"key": "flaw", "titleRu": "Слабость / Изъян", "icon": "🎭"},
    {"key": "adventurerReason", "titleRu": "Мотивация странствий", "icon": "🎯"},
    {"key": "favoredCombat", "titleRu": "Боевой стиль / Любимое оружие/заклинание", "icon": "⚔️"},
    {"key": "classTrait", "titleRu": "Классовая особенность", "icon": "✨"},
    {"key": "carrying", "titleRu": "Памятная вещь при себе", "icon": "🎒"},
    {"key": "wearing", "titleRu": "Характерная одежда / Доспех", "icon": "🧥"},
    {"key": "keenInterest", "titleRu": "Особый интерес / Страсть", "icon": "🎲"}
]

def compile_hero_data():
    files = glob.glob('files/Hero/*.xlsx')
    if not files:
        raise FileNotFoundError("Hero generator excel file not found in files/Hero/")
    
    wb = openpyxl.load_workbook(files[0], data_only=True)
    
    # 1. Parse sheet "(герой) Игрок"
    ws_player = wb["(герой) Игрок"]
    races = []
    for r in range(3, 15):
        val = clean_val(ws_player.cell(r, 1).value)
        if not val:
            continue
        if "monster or member" in val.lower():
            match = re.search(r'\((d20)\):\s*(.*)', val)
            exotics = []
            if match:
                items = match.group(2).split(';')
                for it in items:
                    it_clean = re.sub(r'^\s*\d+[\.\-\–\s]+', '', it).strip().rstrip('.')
                    if it_clean:
                        exotics.append({
                            "nameEn": it_clean,
                            "nameRu": RU_DICT.get(it_clean.lower(), it_clean.capitalize())
                        })
            races.append({
                "id": "exotic",
                "nameEn": "Exotic Race / Monster",
                "nameRu": "Экзотическая раса / Существо",
                "isExotic": True,
                "subraces": exotics
            })
        else:
            name_en = re.sub(r'^[Aa]n?\s+', '', val).rstrip('.').strip()
            name_ru = RU_DICT.get(name_en.lower(), name_en.capitalize())
            races.append({
                "id": re.sub(r'[^a-z0-9]+', '_', name_en.lower()).strip('_'),
                "nameEn": name_en,
                "nameRu": name_ru,
                "isExotic": False
            })

    backgrounds = []
    for r in range(17, 37):
        val = clean_val(ws_player.cell(r, 1).value)
        if not val:
            continue
        base_name = re.sub(r'^[Aa]n?\s+', '', val).rstrip('.').strip()
        if "amnesiac" in val.lower():
            backgrounds.append({
                "id": "amnesiac",
                "nameEn": "Amnesiac",
                "nameRu": "Потерявший память",
                "desc": "Личность со смутными обрывками забытого прошлого, открывающимися во снах."
            })
        elif "hero of prophecy" in val.lower():
            backgrounds.append({
                "id": "hero_of_prophecy",
                "nameEn": "Hero of Prophecy",
                "nameRu": "Избранник пророчества",
                "desc": "Тот, кто оставил прежнюю жизнь, вняв древнему знамению и зову высшей судьбы."
            })
        else:
            name_en = base_name.rstrip('.')
            name_ru = RU_DICT.get(name_en.lower(), name_en)
            backgrounds.append({
                "id": re.sub(r'[^a-z0-9]+', '_', name_en.lower()).strip('_'),
                "nameEn": name_en,
                "nameRu": name_ru,
                "desc": f"Прошлое героя, связанное с ремеслом или призванием: {name_ru}."
            })

    # 2. Parse 12 class sheets dynamically
    classes_data = {}
    for sname, info in CLASS_INFO.items():
        if sname not in wb.sheetnames:
            continue
        ws = wb[sname]
        
        tables_found = []
        for r in range(1, ws.max_row + 1):
            for c in [1, 5, 9]:
                v = str(ws.cell(r, c).value or '').strip()
                if re.match(r'^d\d+\s+', v):
                    options = []
                    for ro in range(r + 1, ws.max_row + 1):
                        vo = str(ws.cell(ro, c).value or '').strip()
                        if re.match(r'^\d+\.', vo):
                            clean_s = re.sub(r'^\d+[\.\-\–\s]+', '', vo).strip()
                            ru_s = RU_DICT.get(clean_s, clean_s)
                            options.append({
                                "id": len(options) + 1,
                                "textEn": clean_s,
                                "textRu": ru_s
                            })
                        elif options:
                            break
                    tables_found.append({
                        "header": v,
                        "options": options
                    })

        class_entry = {
            "id": info["id"],
            "nameRu": info["nameRu"],
            "nameEn": info["nameEn"],
            "icon": info["icon"],
            "primaryAbility": info["primaryAbility"],
            "subclasses": info["subclasses"],
            "tables": {}
        }

        # Map each found table to its corresponding TABLE_METADATA entry
        for idx, t_meta in enumerate(TABLE_METADATA):
            if idx < len(tables_found):
                t_obj = tables_found[idx]
                class_entry["tables"][t_meta["key"]] = {
                    "header": t_obj["header"],
                    "titleRu": t_meta["titleRu"],
                    "icon": t_meta["icon"],
                    "options": t_obj["options"]
                }
        
        classes_data[info["id"]] = class_entry

    # 3. Associates / Rivals Templates & Archetypes
    associate_roles = [
        {"role": "Наставник (Mentor)", "type": "positive", "badge": "badge-mentor", "desc": "Обучил основам мастерства, мудр, но требователен."},
        {"role": "Преданный соратник (Ally)", "type": "positive", "badge": "badge-ally", "desc": "Делил огонь и невзгоды, готов прийти на помощь."},
        {"role": "Заклятый враг (Nemesis)", "type": "hostile", "badge": "badge-nemesis", "desc": "Виновен в личной трагедии героя, жаждет его гибели."},
        {"role": "Тайный покровитель (Benefactor)", "type": "neutral", "badge": "badge-benefactor", "desc": "Влиятельная фигура, финансирующая или направляющая странствия."},
        {"role": "Должник / Подопечный (Ward)", "type": "neutral", "badge": "badge-ward", "desc": "Герой поклялся защищать его или взыскать долг чести."},
        {"role": "Родственник / Кровник (Kin)", "type": "family", "badge": "badge-kin", "desc": "Связан кровными узами, хранит тайны семьи."},
        {"role": "Соперник гильдии (Rival)", "type": "hostile", "badge": "badge-rival", "desc": "Всегда стремится оказаться на шаг впереди и опорочить имя героя."}
    ]

    hero_data = {
        "races": races,
        "backgrounds": backgrounds,
        "classes": classes_data,
        "associateRoles": associate_roles
    }

    out_file = "js/data/hero-data.js"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("/**\n")
        f.write(" * Hero Crafter / Architect Data Module\n")
        f.write(" * Auto-generated from files/Hero/Генератор Герои.xlsx\n")
        f.write(" */\n\n")
        f.write("export const HERO_DATA = ")
        json.dump(hero_data, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Generated {out_file} successfully! Total classes: {len(classes_data)}, races: {len(races)}, backgrounds: {len(backgrounds)}.")

if __name__ == "__main__":
    compile_hero_data()
