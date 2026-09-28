/**
 * Randomattic - Hero Architect & Foundry Generator Module
 * Generates deep procedural D&D 5e characters based on official tables,
 * sprite atlas portraits, dynamic associates, equipment, and personality breakdown.
 */

import { HERO_DATA } from '../data/hero-data.js';
import { NAMES_DATA } from './names.js';
import { pickOne, pickMultiple, randInt } from '../utils/random.js';

const ALIGNMENTS = [
  'Принципиальный добрый (Lawful Good)',
  'Нейтральный добрый (Neutral Good)',
  'Хаотичный добрый (Chaotic Good)',
  'Принципиальный нейтральный (Lawful Neutral)',
  'Истинно нейтральный (True Neutral)',
  'Хаотичный нейтральный (Chaotic Neutral)'
];

const LEGACY_EPITHETS = [
  'Клинок Рассвета', 'Несущий Бурю', 'Тень Безмолвия', 'Сердце Титана',
  'Хранитель Пепла', 'Око Северных Ветров', 'Бич Чудовищ', 'Железный Взор',
  'Вестник Забытых', 'Охотник за Звёздами', 'Рука Справедливости', 'Глас Бездны',
  'Львиное Сердце', 'Перо и Сталь', 'Блуждающий Огонь', 'Несломленный'
];

const GENDERS = ['male', 'female'];

export function generateHero(options = {}) {
  const currentHero = options.currentHero || null;
  const locks = options.locks || {};

  // 1. Race
  let selectedRace;
  if (locks.race && currentHero?.race) {
    selectedRace = currentHero.race;
  } else if (options.race && options.race !== 'random') {
    selectedRace = HERO_DATA.races.find(r => r.id === options.race) || HERO_DATA.races[0];
  } else {
    selectedRace = pickOne(HERO_DATA.races);
  }

  // Handle exotic subrace
  let raceNameRu = selectedRace.nameRu;
  let raceNameEn = selectedRace.nameEn;
  let subrace = null;
  if (selectedRace.isExotic && selectedRace.subraces?.length) {
    subrace = pickOne(selectedRace.subraces);
    raceNameRu = `${selectedRace.nameRu} (${subrace.nameRu})`;
    raceNameEn = `${selectedRace.nameEn} (${subrace.nameEn})`;
  }

  // 2. Class
  let classKey;
  if (locks.classId && currentHero?.class) {
    classKey = currentHero.class.id;
  } else if (options.classId && options.classId !== 'random' && HERO_DATA.classes[options.classId]) {
    classKey = options.classId;
  } else {
    const classKeys = Object.keys(HERO_DATA.classes);
    classKey = pickOne(classKeys);
  }
  const classDef = HERO_DATA.classes[classKey];
  const subclass = pickOne(classDef.subclasses);

  // 3. Gender
  let gender;
  if (locks.gender && currentHero?.gender) {
    gender = currentHero.gender;
  } else if (options.gender && options.gender !== 'random') {
    gender = options.gender;
  } else {
    gender = pickOne(GENDERS);
  }

  // 4. Name
  let name;
  if (locks.name && currentHero?.name) {
    name = currentHero.name;
  } else {
    name = generateHeroName(selectedRace.id, gender);
  }

  // 5. Portrait (Sprite Atlas coordinates: 6x6 grid = 36 portraits)
  let portrait;
  if (locks.portrait && currentHero?.portrait) {
    portrait = currentHero.portrait;
  } else {
    const idx = randInt(0, 35);
    const row = Math.floor(idx / 6);
    const col = idx % 6;
    portrait = {
      index: idx,
      row: row,
      col: col,
      url: `assets/images/portraits/heroes/hero_${row}_${col}.jpg`,
      // CSS background-position for the atlas master sheet
      atlasX: (col / 5) * 100,
      atlasY: (row / 5) * 100
    };
  }

  // 6. Background
  let background;
  if (locks.background && currentHero?.background) {
    background = currentHero.background;
  } else {
    background = pickOne(HERO_DATA.backgrounds);
  }

  // 7. Ability & Sliders
  const traitComplexity = options.traitComplexity !== undefined ? Number(options.traitComplexity) : 3;
  const backstoryDetail = options.backstoryDetail !== undefined ? Number(options.backstoryDetail) : 3;
  let primaryAbility = classDef.primaryAbility;
  if (options.primaryAbility && options.primaryAbility !== 'auto') {
    const abilityMap = {
      str: 'Сила (Strength)',
      dex: 'Ловкость (Dexterity)',
      con: 'Телосложение (Constitution)',
      int: 'Интеллект (Intelligence)',
      wis: 'Мудрость (Wisdom)',
      cha: 'Харизма (Charisma)'
    };
    primaryAbility = abilityMap[options.primaryAbility] || primaryAbility;
  }

  // 8. Class Specific 10 Tables
  const tables = classDef.tables;
  const pickTableOption = (tableKey) => {
    const tbl = tables[tableKey];
    if (!tbl || !tbl.options || tbl.options.length === 0) return { textRu: '—', textEn: '—' };
    return pickOne(tbl.options);
  };

  const grewUpIn = (locks.grewUpIn && currentHero?.details?.origin) ? currentHero.details.origin : pickTableOption('grewUpIn');
  const pastProfession = (locks.pastProfession && currentHero?.details?.pastProfession) ? currentHero.details.pastProfession : pickTableOption('pastProfession');
  const pride = (locks.pride && currentHero?.details?.corePersonality) ? currentHero.details.corePersonality : pickTableOption('pride');
  const flaw = (locks.flaw && currentHero?.details?.fearsAndFlaws) ? currentHero.details.fearsAndFlaws : pickTableOption('flaw');
  const adventurerReason = (locks.adventurerReason && currentHero?.details?.ultimateGoal) ? currentHero.details.ultimateGoal : pickTableOption('adventurerReason');
  const favoredCombat = (locks.favoredCombat && currentHero?.details?.favoredCombat) ? currentHero.details.favoredCombat : pickTableOption('favoredCombat');
  const classTrait = (locks.classTrait && currentHero?.details?.classTrait) ? currentHero.details.classTrait : pickTableOption('classTrait');
  const carrying = (locks.carrying && currentHero?.details?.carrying) ? currentHero.details.carrying : pickTableOption('carrying');
  const wearing = (locks.wearing && currentHero?.details?.wearing) ? currentHero.details.wearing : pickTableOption('wearing');
  const keenInterest = (locks.keenInterest && currentHero?.details?.keenInterest) ? currentHero.details.keenInterest : pickTableOption('keenInterest');

  // 9. Custom Traits (4 Slots)
  const defaultCustomSlots = [
    { id: 1, title: 'Прошлое призвание', key: 'pastProfession', option: pastProfession },
    { id: 2, title: 'Источник гордости', key: 'pride', option: pride },
    { id: 3, title: 'Слабость / Изъян', key: 'flaw', option: flaw },
    { id: 4, title: 'Зов странствий', key: 'adventurerReason', option: adventurerReason }
  ];

  let customTraits = [];
  if (options.customTraits && Array.isArray(options.customTraits) && options.customTraits.length === 4) {
    customTraits = options.customTraits.map((slot, idx) => {
      if (slot.locked && slot.option) {
        return slot;
      }
      const fallback = defaultCustomSlots[idx];
      const targetKey = slot.key || fallback.key;
      const opt = pickTableOption(targetKey);
      return {
        id: idx + 1,
        title: slot.title || fallback.title,
        key: targetKey,
        locked: false,
        option: opt
      };
    });
  } else {
    customTraits = defaultCustomSlots.map(s => ({ ...s, locked: false }));
  }

  // 10. Age & Alignment
  const age = calculateAge(selectedRace.id);
  const alignment = pickOne(ALIGNMENTS);
  const legacyTitle = pickOne(LEGACY_EPITHETS);

  // 11. Narrative Bio Summary
  const bioSummary = generateBioSummary({
    name,
    gender,
    raceNameRu,
    classNameRu: classDef.nameRu,
    subclass,
    background: background.nameRu,
    grewUpIn: grewUpIn.textRu,
    pastProfession: pastProfession.textRu,
    pride: pride.textRu,
    flaw: flaw.textRu,
    adventurerReason: adventurerReason.textRu,
    carrying: carrying.textRu,
    wearing: wearing.textRu,
    keenInterest: keenInterest.textRu,
    backstoryDetail
  });

  // 12. Known Associates & Rivals
  const associates = generateAssociates({ heroName: name, heroRace: selectedRace.id });

  // 13. Personality Breakdown
  const personalityBreakdown = [
    {
      facet: 'Гордость и мастерство',
      description: pride.textRu,
      trigger: 'Когда подвергают сомнению статус или боевой авторитет',
      note: 'Вдохновляет союзников, но может перерасти в дерзкое упрямство'
    },
    {
      facet: 'Слабость и искушение',
      description: flaw.textRu,
      trigger: 'В минуты крайнего переутомления или праздного отдыха в кабаке',
      note: 'Главная уязвимость, которой могут воспользоваться враги'
    },
    {
      facet: 'Движущий мотив',
      description: adventurerReason.textRu,
      trigger: 'При виде угнетённых или получении намёков на старые тайны',
      note: 'Причина, по которой герой не может вернуться к оседлой жизни'
    },
    {
      facet: 'Тайная страсть',
      description: keenInterest.textRu,
      trigger: 'Во время долгих стоянок у ночного лагерного костра',
      note: 'Позволяет сохранять человечность и снимать боевой стресс'
    },
    {
      facet: 'Классовый почерк',
      description: classTrait.textRu,
      trigger: 'В начале боя или при решении нестандартных задач',
      note: 'Уникальная грань таланта, приобретенная долгой практикой'
    }
  ];

  // 14. Equipment & Possessions
  const equipment = [
    {
      item: wearing.textRu,
      category: 'Одежда / Доспехи',
      quality: 'Добротное / Закалённое',
      status: 'На персонаже',
      notes: 'Не раз спасало жизнь в опасных передрягах'
    },
    {
      item: carrying.textRu,
      category: 'Личная реликвия',
      quality: 'Уникальное / Памятное',
      status: 'В потайном кармане',
      notes: 'Связано с прошлым и личным обетом'
    },
    {
      item: favoredCombat.textRu,
      category: 'Оружие / Магический фокус',
      quality: 'Сбалансированное',
      status: 'Наготове в ножнах / руках',
      notes: 'Основной инструмент выживания и сокрушения врагов'
    },
    {
      item: tables.classTrait?.titleRu || 'Классовый арсенал',
      category: 'Специальное снаряжение',
      quality: 'Мастерское исполнение',
      status: 'В походной перевязи',
      notes: classTrait.textRu
    },
    {
      item: 'Походный набор искателя приключений',
      category: 'Припасы и снаряжение',
      quality: 'Стандартное походное',
      status: 'В заплечном рюкзаке',
      notes: 'Сухпаёк на 5 дней, шёлковый шнур, огниво, бурдюк с вином и факелы'
    }
  ];

  // 15. Key Story Events & Achievements
  const storyEvents = [
    {
      event: 'Рождение и истоки',
      description: `Вырос в месте: ${grewUpIn.textRu}. Раннее знакомство с суровыми реалиями мира.`,
      timeline: 'Юность (10-15 лет назад)',
      outcome: 'Закалка характера и понимание ценности верных товарищей.'
    },
    {
      event: 'Прежняя жизнь',
      description: `Ремесло и занятия: ${pastProfession.textRu}. Вхождение в гильдию или общину.`,
      timeline: 'Зрелость (5-7 лет назад)',
      outcome: 'Обретение профессиональных навыков и первых покровителей.'
    },
    {
      event: 'Переломный момент',
      description: `Испытание, проявившее изъян: ${flaw.textRu}. Событие разрушило привычный уклад жизни.`,
      timeline: 'Кризис (2-3 года назад)',
      outcome: 'Осознание необходимости кардинальных перемен и готовность к риску.'
    },
    {
      event: 'Зов странствий',
      description: `Принятие обета странника: ${adventurerReason.textRu}. Выход на большак с реликвией (${carrying.textRu}).`,
      timeline: 'Недавнее прошлое (несколько месяцев назад)',
      outcome: 'Вступление в гильдию авантюристов и поиск верного отряда.'
    }
  ];

  // 16. Compile Result Object
  const hero = {
    id: 'hero_' + Date.now() + '_' + randInt(100, 999),
    name,
    gender,
    age,
    alignment,
    race: {
      id: selectedRace.id,
      nameRu: raceNameRu,
      nameEn: raceNameEn,
      subrace
    },
    class: {
      id: classDef.id,
      nameRu: classDef.nameRu,
      nameEn: classDef.nameEn,
      icon: classDef.icon,
      primaryAbility,
      subclass
    },
    background,
    portrait,
    legacyTitle,
    bioSummary,
    customTraits,
    details: {
      origin: grewUpIn,
      pastProfession,
      corePersonality: pride,
      fearsAndFlaws: flaw,
      ultimateGoal: adventurerReason,
      favoredCombat,
      classTrait,
      carrying,
      wearing,
      keenInterest
    },
    associates,
    personalityBreakdown,
    equipment,
    storyEvents
  };

  // Generate exports
  hero.exportMarkdown = generateMarkdownExport(hero);
  hero.exportCsv = generateCsvExport(hero);

  return hero;
}

/**
 * Generates an authentic fantasy name based on race & gender
 */
function generateHeroName(raceId, gender) {
  const raceKey = (raceId === 'dark_elf' || raceId === 'high_elf' || raceId === 'wood_elf') ? 'elf'
    : (raceId === 'exotic') ? pickOne(['human', 'tiefling', 'halforc', 'dragonborn'])
    : (NAMES_DATA[raceId] ? raceId : 'human');

  const raceSet = NAMES_DATA[raceKey] || NAMES_DATA.human;
  const firstName = pickOne(raceSet[gender] || raceSet.male);
  const surname = pickOne(raceSet.surnames || ['Безымянный']);
  return `${firstName} ${surname}`;
}

/**
 * Calculates plausible age based on fantasy race
 */
function calculateAge(raceId) {
  if (raceId.includes('elf')) return randInt(95, 220);
  if (raceId === 'dwarf') return randInt(45, 160);
  if (raceId === 'gnome') return randInt(40, 140);
  if (raceId === 'halfling') return randInt(25, 75);
  if (raceId === 'halforc') return randInt(17, 35);
  if (raceId === 'dragonborn') return randInt(18, 50);
  return randInt(20, 52); // Human / Tiefling
}

/**
 * Assembles a multi-paragraph evocative narrative bio
 */
function generateBioSummary(p) {
  const pronSubj = p.gender === 'female' ? 'Она' : 'Он';
  const pronObj = p.gender === 'female' ? 'её' : 'его';
  const pronPoss = p.gender === 'female' ? 'ею' : 'им';
  const verbGrew = p.gender === 'female' ? 'выросла' : 'вырос';
  const verbWas = p.gender === 'female' ? 'была' : 'был';
  const verbBecame = p.gender === 'female' ? 'стала' : 'стал';
  const verbBegan = p.gender === 'female' ? 'отправилась' : 'отправился';

  const para1 = `${p.name} — ${p.raceNameRu.toLowerCase()}, посвятивший свою судьбу пути ${p.classNameRu} (${p.subclass}). ${pronSubj} ${verbGrew} в таком месте, как ${p.grewUpIn.toLowerCase()}, где с ранних лет познал цену выживания и дисциплины. В прежние годы ${pronSubj} ${verbWas} ${p.pastProfession.toLowerCase()}, что заложило прочный фундамент ${pronObj} жизненного опыта и кругозора.`;

  const para2 = `Своей главной гордостью ${p.name} по праву считает ${p.pride.toLowerCase()}, хотя соратники знают и об уязвимой стороне: ${p.flaw.toLowerCase()}. Внешний облик завершает ${p.wearing.toLowerCase()}, а при себе герой неизменно держит ${p.carrying.toLowerCase()}, напоминая себе о данной клятве. На привалах ${pronSubj} нередко находит утешение, погружаясь в ${p.keenInterest.toLowerCase()}.`;

  const para3 = `Решение ступить на стезю искателя приключений не было случайным: неодолимое стремление ${p.adventurerReason.toLowerCase()} заставило покинуть родные края. Теперь ${p.name} странствует по неизведанным землям, готовый встретить любую опасность во всеоружии.`;

  return `${para1}\n\n${para2}\n\n${para3}`;
}

/**
 * Generates 4-5 dynamic associates & rivals
 */
function generateAssociates({ heroName, heroRace }) {
  const archetypes = [
    {
      role: 'Наставник (Mentor)',
      type: 'positive',
      badge: 'badge-mentor',
      template: 'Обучил героя азам военного дела и ритуалов, сохраняет строгую отцовскую опеку.'
    },
    {
      role: 'Преданный соратник (Ally)',
      type: 'positive',
      badge: 'badge-ally',
      template: 'Вместе выжили в засаде разбойников на перевале; делит с героем последний кусок хлеба.'
    },
    {
      role: 'Заклятый враг (Nemesis)',
      type: 'hostile',
      badge: 'badge-nemesis',
      template: 'Виновен в гибели близких героя; жаждет сломить его волю и репутацию.'
    },
    {
      role: 'Тайный покровитель (Benefactor)',
      type: 'neutral',
      badge: 'badge-benefactor',
      template: 'Влиятельный городской вельможа, снабжающий отряд ценными картами и слухами.'
    },
    {
      role: 'Должник / Подопечный (Ward)',
      type: 'neutral',
      badge: 'badge-ward',
      template: 'Молодой послушник, поклявшийся служить герою в знак искупления старого долга.'
    }
  ];

  const npcRaces = ['Человек', 'Эльф', 'Дварф', 'Полуорк', 'Тифлинг', 'Полурослик'];
  const npcTitles = ['Капитан стражи', 'Брат ордена', 'Торговец древностями', 'Глава гильдии', 'Охотник за головами', 'Учёный архивариус'];

  return archetypes.map((arch, i) => {
    const rRace = pickOne(npcRaces);
    const rGender = pickOne(GENDERS);
    const rName = generateHeroName('human', rGender);
    const rTitle = pickOne(npcTitles);
    return {
      id: i + 1,
      name: rName,
      role: arch.role,
      type: arch.type,
      badge: arch.badge,
      race: rRace,
      affiliation: rTitle,
      notes: arch.template
    };
  });
}

/**
 * Builds full Markdown export string
 */
function generateMarkdownExport(hero) {
  let md = `# Досье героя: ${hero.name} («${hero.legacyTitle}»)\n\n`;
  md += `**Раса:** ${hero.race.nameRu} | **Класс:** ${hero.class.nameRu} (${hero.class.subclass})\n`;
  md += `**Пол:** ${hero.gender === 'female' ? 'Женский' : 'Мужской'} | **Возраст:** ${hero.age} | **Мировоззрение:** ${hero.alignment}\n`;
  md += `**Основная характеристика:** ${hero.class.primaryAbility} | **Предыстория:** ${hero.background.nameRu}\n\n`;

  md += `## 📜 Биографическое резюме\n${hero.bioSummary}\n\n`;

  md += `## 🎭 Ключевые черты и особенности\n`;
  hero.customTraits.forEach(t => {
    md += `- **${t.title}:** ${t.option.textRu}\n`;
  });
  md += `\n`;

  md += `## 👥 Связи и соперники (Associates & Rivals)\n`;
  md += `| Имя | Роль | Раса | Статус / Организация | Примечания |\n`;
  md += `| --- | --- | --- | --- | --- |\n`;
  hero.associates.forEach(a => {
    md += `| ${a.name} | ${a.role} | ${a.race} | ${a.affiliation} | ${a.notes} |\n`;
  });
  md += `\n`;

  md += `## 🌟 Грань личности (Personality Breakdown)\n`;
  md += `| Грань | Описание | Триггер / Влияние | Заметка |\n`;
  md += `| --- | --- | --- | --- |\n`;
  hero.personalityBreakdown.forEach(p => {
    md += `| ${p.facet} | ${p.description} | ${p.trigger} | ${p.note} |\n`;
  });
  md += `\n`;

  md += `## 🎒 Снаряжение и реликвии (Equipment)\n`;
  md += `| Предмет | Категория | Качество | Статус | Примечания |\n`;
  md += `| --- | --- | --- | --- | --- |\n`;
  hero.equipment.forEach(e => {
    md += `| ${e.item} | ${e.category} | ${e.quality} | ${e.status} | ${e.notes} |\n`;
  });
  md += `\n`;

  md += `## 📖 Хроника ключевых событий\n`;
  hero.storyEvents.forEach(s => {
    md += `### ${s.event} (${s.timeline})\n`;
    md += `*${s.description}*\n**Итог:** ${s.outcome}\n\n`;
  });

  return md;
}

/**
 * Builds CSV export string
 */
function generateCsvExport(hero) {
  const rows = [
    ['Параметр', 'Значение'],
    ['Имя', hero.name],
    ['Титул', hero.legacyTitle],
    ['Раса', hero.race.nameRu],
    ['Класс', `${hero.class.nameRu} (${hero.class.subclass})`],
    ['Пол', hero.gender === 'female' ? 'Женский' : 'Мужской'],
    ['Возраст', hero.age],
    ['Мировоззрение', hero.alignment],
    ['Предыстория', hero.background.nameRu],
    ['Основная характеристика', hero.class.primaryAbility],
    ['Место взросления', hero.details.origin.textRu],
    ['Прошлое занятие', hero.details.pastProfession.textRu],
    ['Гордость', hero.details.corePersonality.textRu],
    ['Изъян', hero.details.fearsAndFlaws.textRu],
    ['Мотивация', hero.details.ultimateGoal.textRu],
    ['Боевой стиль / Оружие', hero.details.favoredCombat.textRu],
    ['Памятная вещь', hero.details.carrying.textRu],
    ['Одежда / Доспехи', hero.details.wearing.textRu],
    ['Особый интерес', hero.details.keenInterest.textRu]
  ];

  return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}
