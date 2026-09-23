/**
 * Randomattic - Procedural NPC & Character Generation Engine
 * Built upon verified Excel data from files/NPC/:
 * - npc_names.xlsx (11 distinct races + half-elves + half-orcs)
 * - npc_appearance.xlsx (10 appearance categories with gender agreement)
 * - npc_personality.xlsx (5 personality categories with gender agreement)
 */

import {
  NPC_NAMES_DATA,
  NPC_APPEARANCE_DATA,
  NPC_PERSONALITY_DATA,
  NPC_RACE_AGE_RANGES,
  NPC_HALFBREED_ORIGINS,
  NPC_PROFESSIONS,
  DMG_APPEARANCE,
  DMG_ABILITIES_HIGH,
  DMG_ABILITIES_LOW,
  DMG_TALENTS,
  DMG_INTERACTIONS,
  DMG_MANNERISMS,
  DMG_IDEALS,
  DMG_BONDS,
  DMG_FLAWS_SECRETS
} from '../data/npc-data.js';

export {
  NPC_NAMES_DATA,
  NPC_APPEARANCE_DATA,
  NPC_PERSONALITY_DATA,
  NPC_RACE_AGE_RANGES,
  NPC_HALFBREED_ORIGINS,
  NPC_PROFESSIONS,
  DMG_APPEARANCE,
  DMG_ABILITIES_HIGH,
  DMG_ABILITIES_LOW,
  DMG_TALENTS,
  DMG_INTERACTIONS,
  DMG_MANNERISMS,
  DMG_IDEALS,
  DMG_BONDS,
  DMG_FLAWS_SECRETS
};

import { pickOne, pickMultiple, randInt } from '../utils/random.js';

export const NPC_RACE_TITLES = {
  human: 'Человек',
  elf: 'Эльф',
  dwarf: 'Дварф',
  halfling: 'Полурослик',
  tiefling: 'Тифлинг',
  dragonborn: 'Драконорожденный',
  halfelf: 'Полуэльф',
  halforc: 'Полуорк',
  gnome: 'Гном',
  drow: 'Дроу',
  eladrin: 'Элдарин',
  orc: 'Орк',
  tabaxi: 'Табакси'
};

export const NPC_RACE_SLUGS = {
  human: 'human',
  elf: 'elf',
  dwarf: 'dwarf',
  halfling: 'halfling',
  tiefling: 'tiefling',
  dragonborn: 'dragonborn',
  halfelf: 'halfelf',
  halforc: 'halforc',
  gnome: 'gnome',
  drow: 'elf',
  eladrin: 'elf',
  orc: 'halforc',
  tabaxi: 'mystery'
};

/**
 * Русское склонение возраста (год, года, лет)
 * @param {number} age
 * @returns {string}
 */
export function getRussianAgeWord(age) {
  const mod100 = age % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'лет';
  const mod10 = age % 10;
  if (mod10 === 1) return 'год';
  if (mod10 >= 2 && mod10 <= 4) return 'года';
  return 'лет';
}

/**
 * Сгенерировать возраст для расы по диапазону
 * @param {string} raceKey
 * @param {number|string} chosenAge
 * @returns {{age: number, ageWord: string, ageStage: string}}
 */
export function generateNPCAge(raceKey, chosenAge) {
  const range = NPC_RACE_AGE_RANGES[raceKey] || NPC_RACE_AGE_RANGES.human;
  let age = 0;

  if (chosenAge && chosenAge !== 'random' && !isNaN(Number(chosenAge)) && Number(chosenAge) > 0) {
    age = Math.max(1, Math.round(Number(chosenAge)));
  } else {
    age = randInt(range.min, range.max);
  }

  let ageStage = 'mature';
  if (age < range.mature) {
    ageStage = 'young';
  } else if (age >= range.old) {
    ageStage = 'old';
  }

  return {
    age,
    ageWord: getRussianAgeWord(age),
    ageStage
  };
}

/**
 * Сгенерировать воспитание и происхождение полукровки
 * @param {string} raceKey
 * @param {string} chosenOrigin
 * @param {'male'|'female'} gender
 * @returns {object|null}
 */
export function generateHalfbreedOrigin(raceKey, chosenOrigin, gender) {
  if (raceKey !== 'halfelf' && raceKey !== 'halforc') return null;

  const pool = NPC_HALFBREED_ORIGINS[raceKey] || [];
  if (pool.length === 0) return null;

  let origin = null;
  if (chosenOrigin && chosenOrigin !== 'any') {
    origin = pool.find(o => o.id === chosenOrigin) || pool[0];
  } else {
    origin = pickOne(pool);
  }

  const desc = gender === 'female' ? origin.descF : origin.descM;
  return {
    id: origin.id,
    title: origin.title,
    description: desc,
    preferredNamePool: origin.preferredNamePool,
    preferredClanPool: origin.preferredClanPool
  };
}

/**
 * Сгенерировать имя и клан НИПа
 * @param {string} raceKey
 * @param {'male'|'female'} gender
 * @param {object} [halfbreedInfo]
 * @param {boolean} [elfKinAll=true]
 * @returns {{fullName: string, firstName: string, surname: string, nickname?: string}}
 */
export function generateNPCName(raceKey, gender, halfbreedInfo = null, elfKinAll = true) {
  const isFemale = gender === 'female';

  // 1. Табакси
  if (raceKey === 'tabaxi') {
    const tabData = NPC_NAMES_DATA.tabaxi;
    const firstName = pickOne(tabData.names);
    const nickname = pickOne(tabData.nicknames);
    const clan = pickOne(tabData.clans);
    return {
      firstName,
      nickname,
      surname: clan,
      fullName: `${firstName} («${nickname}») из клана ${clan}`
    };
  }

  // 2. Полуэльф
  if (raceKey === 'halfelf') {
    let elvenRaces = ['elf'];
    if (elfKinAll) {
      elvenRaces = ['elf', 'drow', 'eladrin'];
    }

    const humanData = NPC_NAMES_DATA.human;
    const pickElvenName = () => {
      const chosenElvenRace = pickOne(elvenRaces);
      const eData = NPC_NAMES_DATA[chosenElvenRace] || NPC_NAMES_DATA.elf;
      return pickOne(isFemale ? eData.f : eData.m);
    };
    const pickElvenClan = () => {
      const chosenElvenRace = pickOne(elvenRaces);
      const eData = NPC_NAMES_DATA[chosenElvenRace] || NPC_NAMES_DATA.elf;
      return pickOne(eData.clans);
    };

    let firstName = '';
    let surname = '';

    const prefName = halfbreedInfo?.preferredNamePool || 'mixed';
    const prefClan = halfbreedInfo?.preferredClanPool || 'mixed';

    if (prefName === 'human') {
      firstName = pickOne(isFemale ? humanData.f : humanData.m);
    } else if (prefName === 'elf') {
      firstName = pickElvenName();
    } else {
      firstName = Math.random() < 0.5 ? pickOne(isFemale ? humanData.f : humanData.m) : pickElvenName();
    }

    if (prefClan === 'human') {
      surname = pickOne(humanData.clans);
    } else if (prefClan === 'elf') {
      surname = pickElvenClan();
    } else {
      surname = Math.random() < 0.5 ? pickOne(humanData.clans) : pickElvenClan();
    }

    return {
      firstName,
      surname,
      fullName: `${firstName} ${surname}`
    };
  }

  // 3. Полуорк
  if (raceKey === 'halforc') {
    const humanData = NPC_NAMES_DATA.human;
    const orcData = NPC_NAMES_DATA.orc;

    let firstName = '';
    let surname = '';

    const prefName = halfbreedInfo?.preferredNamePool || 'mixed';
    const prefClan = halfbreedInfo?.preferredClanPool || 'mixed';

    if (prefName === 'human') {
      firstName = pickOne(isFemale ? humanData.f : humanData.m);
    } else if (prefName === 'orc') {
      firstName = pickOne(isFemale ? orcData.f : orcData.m);
    } else {
      firstName = Math.random() < 0.5 ? pickOne(isFemale ? humanData.f : humanData.m) : pickOne(isFemale ? orcData.f : orcData.m);
    }

    if (prefClan === 'human') {
      surname = pickOne(humanData.clans);
    } else if (prefClan === 'orc') {
      surname = pickOne(orcData.clans);
    } else {
      surname = Math.random() < 0.5 ? pickOne(humanData.clans) : pickOne(orcData.clans);
    }

    return {
      firstName,
      surname,
      fullName: `${firstName} ${surname}`
    };
  }

  // 4. Обычные расы
  const raceData = NPC_NAMES_DATA[raceKey] || NPC_NAMES_DATA.human;
  const namePool = isFemale ? raceData.f : raceData.m;
  const firstName = pickOne(namePool && namePool.length ? namePool : ['Эдриан']);
  const surname = pickOne(raceData.clans && raceData.clans.length ? raceData.clans : ['Темнокамень']);

  return {
    firstName,
    surname,
    fullName: `${firstName} ${surname}`
  };
}

/**
 * Сгенерировать черты внешности с учетом расы, пола и возраста
 * @param {string} raceKey
 * @param {'male'|'female'} gender
 * @param {string} ageStage
 * @param {number} count
 * @returns {{items: Array, textSummary: string}}
 */
export function generateNPCAppearance(raceKey, gender, ageStage = 'mature', count = 4) {
  const isFemale = gender === 'female';
  const categories = Object.keys(NPC_APPEARANCE_DATA);

  // Выбираем категории без повторов
  const chosenCategories = pickMultiple(categories, Math.min(count, categories.length));

  // Обязательно даем телосложение или рост в первых чертах для естественности описания
  if (!chosenCategories.includes('height') && !chosenCategories.includes('build')) {
    chosenCategories[0] = Math.random() < 0.5 ? 'height' : 'build';
  }

  const selectedTraits = [];

  for (const catKey of chosenCategories) {
    const cat = NPC_APPEARANCE_DATA[catKey];
    if (!cat || !cat.items || cat.items.length === 0) continue;

    let candidateItems = cat.items;

    // Корректировка волос по возрасту
    if (catKey === 'hair') {
      if (ageStage === 'old') {
        const grey = cat.items.find(i => i.id === 'grey_hair');
        if (grey && Math.random() < 0.65) {
          candidateItems = [grey];
        }
      }
      // Эльфы обычно не носят бород
      if (['elf', 'drow', 'eladrin'].includes(raceKey)) {
        candidateItems = candidateItems.filter(i => i.id !== 'braided' || isFemale);
      }
    }

    const item = pickOne(candidateItems);
    const fragment = isFemale ? item.f : item.m;
    const standalone = isFemale ? item.standaloneF : item.standaloneM;

    selectedTraits.push({
      category: cat.title,
      categoryKey: catKey,
      label: item.label,
      raw: item.raw,
      standalone,
      fragment
    });
  }

  // Формируем благозвучное текстовое описание внешности
  // Начинаем с заглавной буквы
  const fragments = selectedTraits.map(t => t.fragment);
  let textSummary = '';
  if (fragments.length > 0) {
    const joined = fragments.join(', ');
    textSummary = joined.charAt(0).toUpperCase() + joined.slice(1);
  } else {
    textSummary = isFemale ? 'Привлекательной внешности' : 'Привлекательной внешности';
  }

  return {
    items: selectedTraits,
    textSummary
  };
}

/**
 * Сгенерировать черты характера с учетом расы, пола и возраста
 * @param {string} raceKey
 * @param {'male'|'female'} gender
 * @param {string} ageStage
 * @param {number} count
 * @returns {{items: Array, textSummary: string}}
 */
export function generateNPCPersonality(raceKey, gender, ageStage = 'mature', count = 4) {
  const isFemale = gender === 'female';
  const categories = Object.keys(NPC_PERSONALITY_DATA);

  // Выбираем ключевые категории характера
  // Рекомендуемый набор: temperament, social или intellect, habits, quirks
  const chosenCategories = pickMultiple(categories, Math.min(count, categories.length));

  if (!chosenCategories.includes('temperament')) {
    chosenCategories[0] = 'temperament';
  }

  const selectedTraits = [];

  for (const catKey of chosenCategories) {
    const cat = NPC_PERSONALITY_DATA[catKey];
    if (!cat || !cat.items || cat.items.length === 0) continue;

    let candidateItems = cat.items;

    // Влияние возраста на характер
    if (ageStage === 'old' && catKey === 'intellect') {
      const wise = cat.items.find(i => i.id === 'wise');
      if (wise && Math.random() < 0.6) candidateItems = [wise];
    } else if (ageStage === 'young' && catKey === 'intellect') {
      const curious = cat.items.find(i => i.id === 'curious');
      if (curious && Math.random() < 0.6) candidateItems = [curious];
    }

    const item = pickOne(candidateItems);
    const fragment = isFemale ? item.f : item.m;

    selectedTraits.push({
      category: cat.title,
      categoryKey: catKey,
      label: item.label,
      raw: item.raw,
      fragment
    });
  }

  // Формируем литературное описание характера
  // Темперамент и отношение к окружающим группируются: "По характеру осторожный, дружелюбный..."
  const tempAndSocial = selectedTraits.filter(t => ['temperament', 'social', 'intellect'].includes(t.categoryKey));
  const otherTraits = selectedTraits.filter(t => !['temperament', 'social', 'intellect'].includes(t.categoryKey));

  let textSummary = '';
  if (tempAndSocial.length > 0) {
    textSummary += `По характеру ${tempAndSocial.map(t => t.fragment).join(', ')}`;
  }

  if (otherTraits.length > 0) {
    const otherPart = otherTraits.map(t => t.fragment).join(', ');
    if (textSummary) {
      textSummary += `. ${otherPart.charAt(0).toUpperCase() + otherPart.slice(1)}`;
    } else {
      textSummary = otherPart.charAt(0).toUpperCase() + otherPart.slice(1);
    }
  }

  return {
    items: selectedTraits,
    textSummary
  };
}

/**
 * Сгенерировать внешность по таблице DMG «ВНЕШНОСТЬ ПМ» (к20)
 * @param {'male'|'female'} gender
 * @param {number} count Количество черт (по умолчанию 2, может быть несколько)
 * @returns {{items: Array, textSummary: string}}
 */
export function generateDMGAppearance(gender, count = 2) {
  const isFemale = gender === 'female';
  const numItems = Math.max(1, Math.min(count, 5));
  const chosenIndices = [];

  while (chosenIndices.length < numItems && chosenIndices.length < DMG_APPEARANCE.length) {
    const idx = randInt(0, DMG_APPEARANCE.length - 1);
    if (!chosenIndices.includes(idx)) {
      chosenIndices.push(idx);
    }
  }

  const items = chosenIndices.map(idx => {
    const raw = DMG_APPEARANCE[idx];
    return {
      id: raw.id,
      name: raw.text,
      text: isFemale ? raw.f : raw.m,
      desc: isFemale ? raw.f : raw.m
    };
  });

  const textSummary = items.map(it => it.text).join('; ');

  return {
    items,
    textSummary
  };
}

/**
 * Сгенерировать характер по DMG: Дарование (к20) + Взаимодействие (к12) + Манера (к20)
 * @param {'male'|'female'} gender
 * @param {number} talentCount
 * @param {number} mannerCount
 * @param {number} interactionCount
 * @returns {object}
 */
export function generateDMGCharacter(gender, talentCount = 1, mannerCount = 1, interactionCount = 1) {
  const isFemale = gender === 'female';

  // 1. Дарование (к20)
  const talents = [];
  const talentPool = [...DMG_TALENTS];
  const tCount = Math.max(1, Math.min(talentCount, 4));
  for (let i = 0; i < tCount && talentPool.length > 0; i++) {
    const idx = randInt(0, talentPool.length - 1);
    talents.push(talentPool.splice(idx, 1)[0]);
  }

  // 2. Особенности взаимодействия (к12)
  const interactions = [];
  const interactionPool = [...DMG_INTERACTIONS];
  const iCount = Math.max(1, Math.min(interactionCount, 3));
  for (let i = 0; i < iCount && interactionPool.length > 0; i++) {
    const idx = randInt(0, interactionPool.length - 1);
    const item = interactionPool.splice(idx, 1)[0];
    interactions.push({
      id: item.id,
      name: item.text,
      desc: isFemale ? item.f : item.m
    });
  }

  // 3. Манеры (к20)
  const mannerisms = [];
  const mannerPool = [...DMG_MANNERISMS];
  const mCount = Math.max(1, Math.min(mannerCount, 4));
  for (let i = 0; i < mCount && mannerPool.length > 0; i++) {
    const idx = randInt(0, mannerPool.length - 1);
    const item = mannerPool.splice(idx, 1)[0];
    mannerisms.push({
      id: item.id,
      name: item.text,
      desc: isFemale ? item.f : item.m
    });
  }

  const talentText = talents.join(', ');
  const interactionText = interactions.map(i => i.name).join(', ');
  const mannerismText = mannerisms.map(m => m.name).join(', ');

  const narrativeParts = [];
  if (interactions.length > 0) {
    narrativeParts.push(`в общении ${interactions.map(i => i.desc).join(' и ')}`);
  }
  if (talents.length > 0) {
    narrativeParts.push(`дарование: ${talentText.toLowerCase()}`);
  }
  if (mannerisms.length > 0) {
    narrativeParts.push(`манера: ${mannerisms.map(m => m.desc).join(', ')}`);
  }

  const textSummary = narrativeParts.join('; ');

  return {
    talents,
    talentText,
    interactions,
    interactionText,
    mannerisms,
    mannerismText,
    textSummary
  };
}

/**
 * Сгенерировать характеристики по DMG «ХАРАКТЕРИСТИКИ ПМ» (к6 высокая, к6 низкая)
 * @param {'male'|'female'} gender
 * @returns {object}
 */
export function generateDMGAbilities(gender) {
  const isFemale = gender === 'female';
  const highIdx = randInt(0, DMG_ABILITIES_HIGH.length - 1);
  const highItem = DMG_ABILITIES_HIGH[highIdx];

  // Низкая характеристика не должна совпадать с высокой
  let lowIdx = randInt(0, DMG_ABILITIES_LOW.length - 1);
  while (lowIdx === highIdx) {
    lowIdx = randInt(0, DMG_ABILITIES_LOW.length - 1);
  }
  const lowItem = DMG_ABILITIES_LOW[lowIdx];

  const highDesc = isFemale ? highItem.f : highItem.m;
  const lowDesc = isFemale ? lowItem.f : lowItem.m;

  return {
    high: {
      stat: highItem.stat,
      desc: highDesc,
      rawDesc: highItem.desc,
      formatted: `${highItem.stat} — ${highDesc}`
    },
    low: {
      stat: lowItem.stat,
      desc: lowDesc,
      rawDesc: lowItem.desc,
      formatted: `${lowItem.stat} — ${lowDesc}`
    },
    textSummary: `Высокая: ${highItem.stat} (${highDesc}); Низкая: ${lowItem.stat} (${lowDesc})`
  };
}

/**
 * Сгенерировать идеал по DMG «ИДЕАЛЫ ПМ» (к6 по 6 категориям)
 * @returns {object}
 */
export function generateDMGIdeal() {
  const categories = Object.keys(DMG_IDEALS);
  const catKey = pickOne(categories);
  const group = DMG_IDEALS[catKey];
  const name = pickOne(group.items);

  return {
    categoryKey: catKey,
    category: group.category,
    name,
    formatted: `${name} (${group.category} идеал)`,
    shortFormatted: `${name} (${group.category})`
  };
}

/**
 * Сгенерировать привязанность по DMG «ПРИВЯЗАННОСТИ ПМ» (к10, на 10 — две привязанности)
 * @returns {object}
 */
export function generateDMGBond() {
  const roll = randInt(1, 10);
  let items = [];

  if (roll === 10) {
    const pool = [...DMG_BONDS];
    const idx1 = randInt(0, pool.length - 1);
    const item1 = pool.splice(idx1, 1)[0];
    const idx2 = randInt(0, pool.length - 1);
    const item2 = pool[idx2];
    items = [item1, item2];
  } else {
    items = [DMG_BONDS[roll - 1]];
  }

  return {
    roll,
    items,
    isDouble: roll === 10,
    textSummary: items.join('; ')
  };
}

/**
 * Сгенерировать слабость или тайну по DMG «СЛАБОСТИ И ТАЙНЫ ПМ» (к12)
 * @returns {object}
 */
export function generateDMGFlaw() {
  const roll = randInt(1, DMG_FLAWS_SECRETS.length);
  const name = DMG_FLAWS_SECRETS[roll - 1];

  return {
    roll,
    name,
    textSummary: name
  };
}

/**
 * Сгенерировать профессию/роль НИПа с учетом пола
 * @param {string} chosenProfession
 * @param {'male'|'female'} gender
 * @returns {object|null}
 */
export function generateNPCProfession(chosenProfession, gender) {
  if (chosenProfession === 'none') {
    return null;
  }
  const isFemale = gender === 'female';
  const keys = Object.keys(NPC_PROFESSIONS);
  let profKey = '';

  if (chosenProfession && chosenProfession !== 'any' && NPC_PROFESSIONS[chosenProfession]) {
    profKey = chosenProfession;
  } else {
    profKey = pickOne(keys);
  }

  const p = NPC_PROFESSIONS[profKey];
  return {
    id: p.id,
    key: profKey,
    enTitle: p.enTitle,
    title: isFemale ? p.f : p.m,
    baseTitle: p.title,
    role: isFemale ? p.roleF : p.roleM,
    narrative: isFemale ? p.narrativeF : p.narrativeM,
    icon: p.icon,
    badge: p.badge
  };
}

/**
 * Сгенерировать полного NPC по заданным параметрам в точности по Книге Мастера (DMG 5e)
 * @param {object} options
 * @returns {object}
 */
export function generateFullNPC(options = {}) {
  // 1. Раса
  const allRaceKeys = Object.keys(NPC_RACE_TITLES);
  let raceKey = (options.race && options.race !== 'any' && NPC_RACE_TITLES[options.race])
    ? options.race
    : pickOne(allRaceKeys);

  const raceTitle = NPC_RACE_TITLES[raceKey] || 'Человек';

  // 2. Пол
  let gender = options.gender;
  if (!gender || gender === 'any' || (gender !== 'male' && gender !== 'female')) {
    gender = pickOne(['male', 'female']);
  }
  const genderText = gender === 'male' ? 'Мужчина' : 'Женщина';

  // 3. Возраст
  const ageData = generateNPCAge(raceKey, options.age);

  // 4. Профессия / Роль
  const profession = generateNPCProfession(options.profession, gender);

  // 5. Полукровка: происхождение и воспитание
  const isHalfbreed = raceKey === 'halfelf' || raceKey === 'halforc';
  const elfKinAll = options.elfKinAll !== false;
  const halfbreedOrigin = isHalfbreed
    ? generateHalfbreedOrigin(raceKey, options.halfbreedOrigin, gender)
    : null;

  // 6. Имя и фамилия / клан / прозвище
  const nameData = generateNPCName(raceKey, gender, halfbreedOrigin, elfKinAll);

  // 7. Внешность (DMG «ВНЕШНОСТЬ ПМ», к20, может быть несколько)
  const appearanceCount = Number(options.appearanceCount) || 2;
  const appearanceData = generateDMGAppearance(gender, appearanceCount);

  // 8. Характер = Дарование (к20) + Взаимодействие (к12) + Манера (к20) (так же может быть несколько)
  const persOption = Number(options.personalityCount) || 1;
  const talentCount = persOption >= 2 ? 2 : 1;
  const mannerCount = persOption >= 2 ? 2 : 1;
  const interactionCount = persOption >= 2 ? 2 : 1;
  const characterData = generateDMGCharacter(gender, talentCount, mannerCount, interactionCount);

  // 9. Отдельные блоки DMG: Характеристики, Идеал, Привязанность, Слабость
  const abilitiesData = generateDMGAbilities(gender);
  const idealData = generateDMGIdeal();
  const bondData = generateDMGBond();
  const flawData = generateDMGFlaw();

  // 10. Портрет
  const raceSlug = NPC_RACE_SLUGS[raceKey] || 'human';
  const genderSlug = gender === 'male' ? 'male' : 'female';
  const portraitPath = `assets/images/portraits/${raceSlug}_${genderSlug}.jpg`;

  // 11. Составление структурированного краткого описания:
  // "{имя_фамилия} — это {раса} {профессия}, {возраст} лет отроду, (если полукровка: кем и где был воспитан). Внешность: {внешность}. Характер: {характер}."
  const raceLower = raceTitle.toLowerCase();
  const ageStr = `${ageData.age} ${ageData.ageWord} отроду`;

  let upbringingPart = '';
  if (isHalfbreed && halfbreedOrigin) {
    upbringingPart = `${halfbreedOrigin.description}, `;
  }

  const professionClause = profession ? `, ${profession.narrative}` : '';
  const appearanceClause = appearanceData.textSummary;
  const characterClause = characterData.textSummary;

  const structuredSummary = `${nameData.fullName} — это ${raceLower}${professionClause}, ${ageStr}, ${upbringingPart}внешность: ${appearanceClause}. По характеру: ${characterClause}.`;

  // Полная текстовая карточка для копирования
  const fullDossierText = `НИП: ${nameData.fullName} (${raceTitle}, ${genderText}, ${ageData.age} ${ageData.ageWord})\n` +
    (profession ? `Профессия: ${profession.title} [${profession.role}]\n` : '') +
    (isHalfbreed && halfbreedOrigin ? `Воспитание: ${halfbreedOrigin.description}\n` : '') +
    `Сводка: ${structuredSummary}\n\n` +
    `👗 Внешность:\n  ${appearanceData.items.map(i => i.name).join('; ')}\n\n` +
    `🧠 Характер:\n` +
    `  • Дарование: ${characterData.talentText}\n` +
    `  • Взаимодействие: ${characterData.interactionText} (${characterData.interactions.map(i => i.desc).join(', ')})\n` +
    `  • Манера: ${characterData.mannerismText}\n\n` +
    `⚔️ Характеристики:\n` +
    `  • Высокая: ${abilitiesData.high.formatted}\n` +
    `  • Низкая: ${abilitiesData.low.formatted}\n\n` +
    `⚖️ Идеал: ${idealData.formatted}\n` +
    `🔗 Привязанность: ${bondData.textSummary}\n` +
    `🗝️ Слабость или тайна: ${flawData.textSummary}`;

  // 12. Генерация альтернативных вариантов для списка
  const count = parseInt(options.count || '3', 10);
  const variants = [];
  for (let i = 0; i < count; i++) {
    const vHalfbreed = isHalfbreed
      ? generateHalfbreedOrigin(raceKey, options.halfbreedOrigin, gender)
      : null;
    const vName = generateNPCName(raceKey, gender, vHalfbreed, elfKinAll);
    const vAge = generateNPCAge(raceKey, 'random');
    const vProf = generateNPCProfession(options.profession, gender);
    const vApp = generateDMGAppearance(gender, 1);
    const vChar = generateDMGCharacter(gender, 1, 1, 1);
    const vAbilities = generateDMGAbilities(gender);
    const vIdeal = generateDMGIdeal();
    const vBond = generateDMGBond();
    const vFlaw = generateDMGFlaw();

    let vUpbringing = '';
    if (isHalfbreed && vHalfbreed) {
      vUpbringing = `${vHalfbreed.description}, `;
    }

    const vProfClause = vProf ? `, ${vProf.narrative}` : '';
    const vSummary = `${vName.fullName} — это ${raceLower}${vProfClause}, ${vAge.age} ${vAge.ageWord} отроду, ${vUpbringing}внешность: ${vApp.textSummary}. По характеру: ${vChar.textSummary}.`;

    const vFullDossier = `НИП: ${vName.fullName} (${raceTitle}, ${genderText}, ${vAge.age} ${vAge.ageWord})\n` +
      (vProf ? `Профессия: ${vProf.title} [${vProf.role}]\n` : '') +
      (isHalfbreed && vHalfbreed ? `Воспитание: ${vHalfbreed.description}\n` : '') +
      `Внешность: ${vApp.items.map(it => it.name).join('; ')}\n` +
      `Характер: дарование — ${vChar.talentText}; взаимодействие — ${vChar.interactionText}; манера — ${vChar.mannerismText}\n` +
      `Характеристики: высокая — ${vAbilities.high.formatted}; низкая — ${vAbilities.low.formatted}\n` +
      `Идеал: ${vIdeal.formatted}\n` +
      `Привязанность: ${vBond.textSummary}\n` +
      `Слабость: ${vFlaw.textSummary}`;

    variants.push({
      id: i + 1,
      fullName: vName.fullName,
      firstName: vName.firstName,
      surname: vName.surname,
      nickname: vName.nickname,
      race: raceTitle,
      gender: genderText,
      age: `${vAge.age} ${vAge.ageWord}`,
      profession: vProf,
      professionTitle: vProf ? `${vProf.icon} ${vProf.title}` : '—',
      upbringingTitle: vHalfbreed ? vHalfbreed.title : '—',
      appearance: vApp,
      character: vChar,
      abilities: vAbilities,
      ideal: vIdeal,
      bond: vBond,
      flaw: vFlaw,
      structuredSummary: vSummary,
      fullDossierText: vFullDossier
    });
  }

  return {
    name: nameData.fullName,
    firstName: nameData.firstName,
    surname: nameData.surname,
    nickname: nameData.nickname,
    race: raceTitle,
    raceKey,
    raceSlug,
    gender: genderText,
    genderSlug,
    age: ageData.age,
    ageWord: ageData.ageWord,
    ageFormatted: `${ageData.age} ${ageData.ageWord}`,
    ageStage: ageData.ageStage,
    profession,
    professionTitle: profession ? `${profession.icon} ${profession.title}` : 'Без профессии',
    isHalfbreed,
    halfbreedOrigin,
    appearance: appearanceData,
    character: characterData,
    personality: characterData,
    abilities: abilitiesData,
    ideal: idealData,
    bond: bondData,
    flaw: flawData,
    structuredSummary,
    fullDossierText,
    portraitPath,
    variants
  };
}
