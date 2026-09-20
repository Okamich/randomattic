/**
 * Enhanced Tavern and Patron Generator for Randomattic
 * Follows the 3-column architecture from TavernGeneratorReferences (TGR_1_main.jpg)
 */

import { TAVERN_DATA } from '../data/tavern-data.js';
import { randInt as getRandomInt, pickOne as getRandomItem } from '../utils/random.js';
import { formatCoins } from '../utils/currency.js';

// Race slug mapping for portraits
const RACE_PORTRAIT_KEYS = {
  'Человек': 'human',
  'Эльф': 'elf',
  'Дварф': 'dwarf',
  'Полурослик': 'halfling',
  'Тифлинг': 'tiefling',
  'Драконорожденный': 'dragonborn',
  'Полуэльф': 'halfelf',
  'Полуорк': 'halforc',
  'Гном': 'gnome'
};

// Age defaults by race
const RACE_AGE_RANGES = {
  'Человек': [18, 65],
  'Эльф': [100, 450],
  'Дварф': [40, 250],
  'Полурослик': [20, 90],
  'Тифлинг': [20, 75],
  'Драконорожденный': [16, 70],
  'Полуэльф': [20, 140],
  'Полуорк': [16, 50],
  'Гном': [30, 300]
};

const BIOMES = [
  'БОЛЬШОЙ ГОРОД',
  'ДЕРЕВНЯ',
  'ПОРТОВЫЙ ГОРОД',
  'ГОРЫ',
  'ЛЕСА',
  'РАВНИНА',
  'БОЛОТО',
  'ПОДЗЕМЬЕ',
  'ПОЛЯРНАЯ ТУНДРА',
  'ПУСТЫНЯ',
  'ТРОПИКИ',
  'ЗАБРОШЕННАЯ ДОРОГА'
];

const TAVERN_TYPES = ['Таверна', 'Постоялый двор', 'Пивная', 'Трактир'];
const TAVERN_CATEGORIES = ['Дешёвое', 'Обычное', 'Роскошное'];

const FEM_NOUNS = new Set([
  'Птица', 'Бочка', 'Кобыла', 'Нимфа', 'Гарпия', 'Ложка', 'Жаба', 'Бутылка', 
  'Гавань', 'Фея', 'Принцесса', 'Служанка', 'Девка', 'Королева', 'Дева', 
  'Гончая', 'Кружка', 'Героиня', 'Белка', 'Стрела', 'Охотница', 'Змея', 'Галера', 'Чаша', 'Обезьяна'
]);

/**
 * Generate full tavern name with proper Russian declensions and gender agreement
 */
function generateTavernName(type, patronName) {
  const safeType = (!type || type.toLowerCase() === 'random') ? getRandomItem(TAVERN_TYPES) : type;

  const nounIndex = getRandomInt(0, TAVERN_DATA.names.nouns_nom.length - 1);
  const nounNom = TAVERN_DATA.names.nouns_nom[nounIndex];
  const nounGen = TAVERN_DATA.names.nouns_gen[nounIndex] || nounNom;

  const isFem = FEM_NOUNS.has(nounNom) || nounNom.endsWith('а') || nounNom.endsWith('я');
  
  const adjNom = isFem 
    ? getRandomItem(TAVERN_DATA.names.adjectives_f_nom) 
    : getRandomItem(TAVERN_DATA.names.adjectives_m_nom);

  const adjGen = isFem 
    ? getRandomItem(TAVERN_DATA.names.adjectives_f_gen) 
    : getRandomItem(TAVERN_DATA.names.adjectives_m_gen);

  const nounNom2 = getRandomItem(TAVERN_DATA.names.nouns_nom);

  const roll = getRandomInt(1, 7);
  switch (roll) {
    case 1:
      return `${safeType} «${adjNom} ${nounNom}»`;
    case 2:
      return `${safeType} «${adjGen} ${nounGen}»`;
    case 3:
      return `«${adjNom} ${nounNom}»`;
    case 4:
      return `«${nounNom} и ${nounNom2}»`;
    case 5:
      return `${safeType} «${adjNom} ${nounNom}»`;
    case 6:
      return patronName ? `${safeType} ${patronName}` : `${safeType} «${adjNom} ${nounNom}»`;
    default:
      return `${safeType} «${adjNom} ${nounNom}»`;
  }
}

/**
 * Procedural Patron Generator (Innkeeper)
 */
function generateInnkeeper(chosenGender, chosenRace, chosenAge) {
  const gender = (chosenGender && chosenGender !== 'random') 
    ? chosenGender 
    : (Math.random() > 0.5 ? 'm' : 'f');
  
  const races = Object.keys(RACE_PORTRAIT_KEYS);
  const race = (chosenRace && chosenRace !== 'random' && races.includes(chosenRace))
    ? chosenRace
    : getRandomItem(races);

  const [minAge, maxAge] = RACE_AGE_RANGES[race] || [20, 60];
  const age = (chosenAge && chosenAge !== 'random' && Number(chosenAge) > 0)
    ? Number(chosenAge)
    : getRandomInt(minAge, maxAge);

  const raceData = TAVERN_DATA.races_innkeeper[race] || TAVERN_DATA.races_innkeeper['Человек'];
  const nameList = gender === 'm' ? raceData.m : raceData.f;
  const firstName = getRandomItem(nameList && nameList.length > 0 ? nameList : ['Алара', 'Борин', 'Эдриан']);
  const clan = getRandomItem(raceData.clans && raceData.clans.length > 0 ? raceData.clans : ['Темнокамень', 'Светлолесье']);
  const fullName = `${firstName} ${clan}`;

  const raceSlug = RACE_PORTRAIT_KEYS[race] || 'human';
  const genderSlug = gender === 'm' ? 'male' : 'female';
  
  // High quality portrait image path
  const portraitPath = `assets/images/portraits/${raceSlug}_${genderSlug}.jpg`;

  const secret = getRandomItem(TAVERN_DATA.innkeeper_secrets);
  const quirk = getRandomItem(TAVERN_DATA.innkeeper_quirks);

  const backstoryTemplates = [
    `Опытный владелец заведения, управляющий этим местом уже много лет. Славится своим гостеприимством и знанием всех местных слухов.`,
    `Бывший странник и искатель приключений, остепенившийся и открывший уютное пристанище для путников со всех уголков мира.`,
    `Унаследовал заведение от семьи и хранит старинные традиции варки эля и фирменных блюд, передаваемые из поколения в поколение.`,
    `Харизматичный хозяин, держащий заведение в ежовых рукавицах, благодаря чему здесь редко случаются опасные драки.`
  ];
  const backstory = getRandomItem(backstoryTemplates);

  return {
    firstName,
    clan,
    fullName,
    gender,
    genderText: gender === 'm' ? 'Мужчина' : 'Женщина',
    race,
    age,
    portraitPath,
    secret,
    quirk,
    backstory
  };
}

/**
 * 12 Establishment Tiers matching Excel Sheet 4 & user reference screenshots:
 * - Rooms count
 * - Staff ratio (servants & bouncers)
 * - Narrative description reflecting category & tier
 */
export const TAVERN_ESTABLISHMENT_TIERS = [
  {
    tierIndex: 0,
    roomsCount: 0,
    servantsCount: 1,
    bouncersCount: 0,
    staffSummary: '1 прислуга',
    descriptions: {
      'Дешёвое': 'Без каких-либо жилых помещений, а единственный работник бегает не переставая.',
      'Обычное': 'Однако, общее положение дел оставляет желать лучшего.',
      'Роскошное': 'Но что в нём такого роскошного — не понятно. Комнат нет, прислуги считай что тоже... Ужас!'
    }
  },
  {
    tierIndex: 1,
    roomsCount: 2,
    servantsCount: 1,
    bouncersCount: 0,
    staffSummary: '1 прислуга',
    descriptions: {
      'Дешёвое': 'Имея две комнаты и одного работника, это заведение не лучше и не хуже других.',
      'Обычное': 'Здесь хотя бы есть где переночевать, но в остальном — не лучшее место за такие деньги.',
      'Роскошное': 'Но что в нём такого роскошного — не понятно. Комнат мало, прислуги считай тоже... Ужас!'
    }
  },
  {
    tierIndex: 2,
    roomsCount: 4,
    servantsCount: 2,
    bouncersCount: 0,
    staffSummary: '2 прислуги',
    descriptions: {
      'Дешёвое': 'С четырьмя комнатами обслуживается парой работников.',
      'Обычное': 'Здесь хотя бы есть где переночевать, но в остальном — не лучшее место за такие деньги.',
      'Роскошное': 'Но что в нём такого роскошного — не понятно. Комнат мало, прислуги считай тоже... Ужас!'
    }
  },
  {
    tierIndex: 3,
    roomsCount: 4,
    servantsCount: 3,
    bouncersCount: 1,
    staffSummary: '3 прислуги, 1 вышибала',
    descriptions: {
      'Дешёвое': 'Пожалуй, лучшее, что можно позволить за те деньги, что тут просят. Целых 4 комнаты, 3 прислуги и даже один вышибала.',
      'Обычное': 'Здесь хотя бы есть где переночевать и шанс, что вас не убьют во сне, но в остальном — не лучшее место за такие деньги.',
      'Роскошное': 'Но что в нём такого роскошного — не понятно. Комнат мало, прислуги считай тоже... Ужас! Хорошо, что хоть кто-то здесь следит за порядком.'
    }
  },
  {
    tierIndex: 4,
    roomsCount: 4,
    servantsCount: 4,
    bouncersCount: 2,
    staffSummary: '4 прислуги, 2 вышибалы',
    descriptions: {
      'Дешёвое': 'Несмотря на свой статус, это заведение очень даже ничего. Есть свободные комнаты, прислуга и охрана.',
      'Обычное': 'С небольшим количеством комнат и хорошим штатом рабочих.',
      'Роскошное': 'Но что в нём такого роскошного — не понятно. Самое обычное заведение, комнаты, прислуга. Правда, денег просят за это немерено.'
    }
  },
  {
    tierIndex: 5,
    roomsCount: 6,
    servantsCount: 4,
    bouncersCount: 2,
    staffSummary: '4 прислуги, 2 вышибалы',
    descriptions: {
      'Дешёвое': 'Несмотря на свой статус, это заведение очень даже ничего. Есть свободные комнаты, прислуга и охрана.',
      'Обычное': 'С обычным количеством комнат и хорошим штатом рабочих.',
      'Роскошное': 'Но что в нём такого роскошного — не понятно. Самое обычное заведение, комнаты, прислуга. Правда, денег просят за это немерено.'
    }
  },
  {
    tierIndex: 6,
    roomsCount: 6,
    servantsCount: 5,
    bouncersCount: 2,
    staffSummary: '5 прислуг, 2 вышибалы',
    descriptions: {
      'Дешёвое': 'Несмотря на свой статус, это заведение очень даже ничего. Есть свободные комнаты, прислуга и охрана.',
      'Обычное': 'С обычным количеством комнат и обширным штатом рабочих.',
      'Роскошное': 'Но что в нём такого роскошного — не понятно. Самое обычное заведение, комнаты, прислуга. Правда, денег просят за это немерено.'
    }
  },
  {
    tierIndex: 7,
    roomsCount: 8,
    servantsCount: 5,
    bouncersCount: 2,
    staffSummary: '5 прислуг, 2 вышибалы',
    descriptions: {
      'Дешёвое': 'Несмотря на свой статус, это заведение очень даже ничего. Есть свободные комнаты, прислуга и охрана.',
      'Обычное': 'С обычным количеством комнат и обширным штатом рабочих.',
      'Роскошное': 'Не самое худшее заведение, но до роскошного не дотягивает.'
    }
  },
  {
    tierIndex: 8,
    roomsCount: 8,
    servantsCount: 6,
    bouncersCount: 2,
    staffSummary: '6 прислуг, 2 вышибалы',
    descriptions: {
      'Дешёвое': 'Похоже, очень сильно любит своих клиентов — такого обслуживания и охраны свет ещё не видывал.',
      'Обычное': 'Несмотря на свой статус, это заведение имеет большое количество комнат, прислуги и охраны.',
      'Роскошное': 'Пожалуй, это заведение стоит своих денег, но могло быть и лучше.'
    }
  },
  {
    tierIndex: 9,
    roomsCount: 10,
    servantsCount: 7,
    bouncersCount: 2,
    staffSummary: '7 прислуг, 2 вышибалы',
    descriptions: {
      'Дешёвое': 'Похоже, очень сильно любит своих клиентов — такого обслуживания и охраны свет ещё не видывал.',
      'Обычное': 'Несмотря на свой статус, это заведение имеет большое количество комнат, прислуги и охраны.',
      'Роскошное': 'Пожалуй, это заведение стоит своих денег.'
    }
  },
  {
    tierIndex: 10,
    roomsCount: 10,
    servantsCount: 7,
    bouncersCount: 4,
    staffSummary: '7 прислуг, 4 вышибалы',
    descriptions: {
      'Дешёвое': 'Похоже, очень сильно любит своих клиентов — такого обслуживания и охраны свет ещё не видывал.',
      'Обычное': 'Несмотря на свой статус, это заведение имеет большое количество комнат, прислуги и охраны.',
      'Роскошное': 'Пожалуй, это заведение стоит своих денег.'
    }
  },
  {
    tierIndex: 11,
    roomsCount: 12,
    servantsCount: 8,
    bouncersCount: 6,
    staffSummary: '8+ прислуг, 6+ вышибал',
    descriptions: {
      'Дешёвое': 'Похоже, очень сильно любит своих клиентов — такого обслуживания и охраны свет ещё не видывал.',
      'Обычное': 'Несмотря на свой статус, это заведение имеет большое количество комнат, прислуги и охраны.',
      'Роскошное': 'Это самое лучшее заведение, что я когда-либо видел.'
    }
  }
];

/**
 * Pick establishment tier weighted by category
 */
function pickTierForCategory(category) {
  let weights;
  if (category === 'Дешёвое') {
    // Mostly tiers 0-4, rare higher
    weights = [24, 22, 18, 14, 10, 4, 3, 2, 1, 1, 1, 0];
  } else if (category === 'Роскошное') {
    // Mostly tiers 7-11, but can be overpriced lower tiers
    weights = [2, 2, 3, 4, 6, 8, 10, 14, 16, 15, 12, 8];
  } else {
    // 'Обычное' - balanced mid-range
    weights = [5, 7, 10, 14, 18, 16, 12, 8, 5, 3, 1, 1];
  }
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return TAVERN_ESTABLISHMENT_TIERS[i];
    r -= weights[i];
  }
  return TAVERN_ESTABLISHMENT_TIERS[0];
}

/**
 * Generate Procedural Rooms matching category & establishment tier
 */
function generateRooms(category, tier) {
  const count = tier.roomsCount;
  if (count === 0) {
    return [];
  }

  const rooms = [];
  const visitorOccupants = [
    'Странствующий купец с охраной',
    'Эльфийский посланник',
    'Уставший наёмник',
    'Семья беженцев',
    'Загадочный учёный-маг',
    'Дворцовый чиновник инкогнито',
    'Бард со своей труппой',
    'Охотник за головами',
    'Паломник из дальних земель'
  ];

  for (let i = 1; i <= count; i++) {
    let typeDesc = '';
    let cost = '';
    
    if (category === 'Дешёвое') {
      if (i === 1) {
        typeDesc = 'Общий зал (Связка соломенных коек у очага)';
        cost = '2 мм';
      } else {
        typeDesc = 'Обычная каморка (Скрипучая кровать, огарок свечи)';
        cost = '5 мм';
      }
    } else if (category === 'Роскошное') {
      if (i >= count - 1) {
        typeDesc = 'Апартаменты дворянина (Шёлковое бельё, камин, мраморная ванна)';
        cost = '10 зм';
      } else {
        typeDesc = 'Обычный номер (Мягкая перина, дубовый шкаф, гардероб)';
        cost = '2 зм';
      }
    } else { // Обычное
      if (i === 1) {
        typeDesc = 'Общий зал (Койки в мансарде, шерстяные одеяла)';
        cost = '2 см';
      } else if (i === count) {
        typeDesc = 'Люкс путешественника (Камин, большая кровать, столик)';
        cost = '1 зм';
      } else {
        typeDesc = 'Обычная комната (Деревянная кровать, сундук, свеча)';
        cost = '5 см';
      }
    }

    const isOccupied = Math.random() < 0.45;
    const quirkObj = getRandomItem(TAVERN_DATA.room_quirks);

    rooms.push({
      roomNumber: i,
      typeDesc,
      cost,
      status: isOccupied ? 'Занято' : 'Свободно',
      isOccupied,
      tenant: isOccupied ? getRandomItem(visitorOccupants) : null,
      note: quirkObj.text,
      noteType: quirkObj.type
    });
  }

  return rooms;
}

/**
 * Generate Tavern Staff Roster strictly matching tier's servant & bouncer counts
 */
function generateRoster(category, innkeeper, tier) {
  const roster = [];

  // 1. Owner / Innkeeper
  roster.push({
    role: 'Трактирщик (Владелец)',
    name: innkeeper.fullName,
    race: innkeeper.race,
    age: innkeeper.age,
    trait: innkeeper.quirk,
    skill: 'Дипломатия и управление заведением'
  });

  const races = Object.keys(RACE_PORTRAIT_KEYS);

  // Servant role archetypes
  const servantRoles = [
    { role: 'Помощник / Слуга', skill: 'Универсальная помощь и уборка' },
    { role: 'Шеф-повар', skill: 'Кулинарные шедевры и выпечка' },
    { role: 'Старший бармен', skill: 'Миксология и сбор слухов' },
    { role: 'Служанка', skill: 'Проворство и внимание к гостям' },
    { role: 'Трактирный бард', skill: 'Игра на лютне и песни' },
    { role: 'Помощник повара', skill: 'Разделка дичи и соления' },
    { role: 'Горничная', skill: 'Смена белья и уют в номерах' },
    { role: 'Погребщик / Завхоз', skill: 'Учёт бочек и запасов' }
  ];

  // Bouncer role archetypes
  const bouncerRoles = [
    { role: 'Вышибала', skill: 'Запугивание и атлетика' },
    { role: 'Охранник зала', skill: 'Кулачный бой и зоркость' },
    { role: 'Начальник охраны', skill: 'Тактика усмирения и дубинка' },
    { role: 'Сторож у входа', skill: 'Бдительность и фейсконтроль' },
    { role: 'Трактирный страж', skill: 'Владение древковым оружием' },
    { role: 'Вышибала караула', skill: 'Удержание толпы в драках' }
  ];

  // Helper to generate an NPC staff member
  const createStaff = (roleObj) => {
    const sRace = getRandomItem(races);
    const sGender = Math.random() > 0.5 ? 'm' : 'f';
    const raceData = TAVERN_DATA.races_innkeeper[sRace] || TAVERN_DATA.races_innkeeper['Человек'];
    const names = sGender === 'm' ? raceData.m : raceData.f;
    const sName = getRandomItem(names && names.length ? names : ['Джей', 'Кара', 'Морган']);
    const [minA, maxA] = RACE_AGE_RANGES[sRace] || [20, 50];

    return {
      role: roleObj.role,
      name: sName,
      race: sRace,
      age: getRandomInt(minA, Math.min(maxA, 70)),
      trait: getRandomItem(TAVERN_DATA.personality_traits),
      skill: roleObj.skill
    };
  };

  // Add servants (tier.servantsCount)
  for (let i = 0; i < tier.servantsCount; i++) {
    const roleDef = servantRoles[i % servantRoles.length];
    roster.push(createStaff(roleDef));
  }

  // Add bouncers (tier.bouncersCount)
  for (let j = 0; j < tier.bouncersCount; j++) {
    const roleDef = bouncerRoles[j % bouncerRoles.length];
    roster.push(createStaff(roleDef));
  }

  return roster;
}

/**
 * Generate Menu with Special Regional Dishes and Drinks
 */
function generateMenu(location, category) {
  const biomeKey = location.toUpperCase();
  const biomeItems = TAVERN_DATA.biome_menus[biomeKey] || TAVERN_DATA.biome_menus['БОЛЬШОЙ ГОРОД'] || [];
  
  const specialPair = biomeItems.length > 0 
    ? getRandomItem(biomeItems) 
    : { dish: 'Фирменное жаркое из дичи', drink: 'Старосельский креплёный эль' };

  const specialCostDish = category === 'Дешёвое' ? '3 мм' : category === 'Обычное' ? '2 см' : '2 зм';
  const specialCostDrink = category === 'Дешёвое' ? '1 мм' : category === 'Обычное' ? '1 см' : '1 зм';

  const menuRows = [];

  // Regional Specials
  menuRows.push({
    category: 'Особое меню ⭐',
    name: specialPair.dish,
    cost: specialCostDish,
    flag: 'Особое ⭐',
    desc: `Региональное блюдо (${location})`,
    isSpecial: true
  });

  menuRows.push({
    category: 'Особое меню ⭐',
    name: specialPair.drink,
    cost: specialCostDrink,
    flag: 'Особое ⭐',
    desc: `Региональный напиток (${location})`,
    isSpecial: true
  });

  // Appetizers
  TAVERN_DATA.standard_menu.snacks.slice(0, 3).forEach(item => {
    menuRows.push({
      category: 'Закуски',
      name: item.name,
      cost: item.cost,
      flag: '—',
      desc: item.desc,
      isSpecial: false
    });
  });

  // Mains
  TAVERN_DATA.standard_menu.mains.slice(0, 3).forEach(item => {
    menuRows.push({
      category: 'Обед / Ужин',
      name: item.name,
      cost: item.cost,
      flag: '—',
      desc: item.desc,
      isSpecial: false
    });
  });

  // Drinks
  TAVERN_DATA.standard_menu.drinks.slice(0, 4).forEach(item => {
    menuRows.push({
      category: 'Выпивка',
      name: item.name,
      cost: item.cost,
      flag: '—',
      desc: item.desc,
      isSpecial: false
    });
  });

  return {
    specialPair,
    menuRows
  };
}

/**
 * Occupancy Levels (Количество Посетителей) - Table 1 from user reference media_1789933202346.png
 * Formula based on Occupancy and Room Count
 */
export const OCCUPANCY_LEVELS = [
  {
    id: 'Пусто',
    name: 'Пусто',
    formulaDesc: '0 чел.',
    calculate: () => 0,
    narrative: 'В заведении совершенно пусто — ни единой живой души, лишь трактирщик протирает стойку.'
  },
  {
    id: 'Несколько человек',
    name: 'Несколько человек',
    formulaDesc: '1к8 чел.',
    calculate: () => getRandomInt(1, 8),
    narrative: 'Редкие посетители, пара одиноких путников тихо сидят за дальними столами.'
  },
  {
    id: 'Небольшая толпа',
    name: 'Небольшая толпа',
    formulaDesc: '1к6 + 10 чел.',
    calculate: () => getRandomInt(1, 6) + 10,
    narrative: 'Умеренно оживлённо, несколько столов заняты негромко беседующими гостями.'
  },
  {
    id: 'Суматоха',
    name: 'Суматоха',
    formulaDesc: '1к8 + 5 × комнат',
    calculate: (rooms) => getRandomInt(1, 8) + 5 * rooms,
    narrative: 'В зале суматоха, звон кружек и тарелок, слуги едва успевают разносить заказы!'
  },
  {
    id: 'Толпа',
    name: 'Толпа',
    formulaDesc: '1к10 + 10 × комнат',
    calculate: (rooms) => getRandomInt(1, 10) + 10 * rooms,
    narrative: 'Шумно и многолюдно, густой табачный дым, громкие песни, смех и жаркие споры!'
  },
  {
    id: 'Переполненное заведение',
    name: 'Переполненное заведение',
    formulaDesc: '2к10 + 15 × комнат',
    calculate: (rooms) => getRandomInt(1, 10) + getRandomInt(1, 10) + 15 * rooms,
    narrative: 'Яблоку негде упасть! Заведение трещит по швам, постояльцы теснятся за столами и у входа!'
  }
];

/**
 * Visitor Archetypes Database - Tables 2, 3, 4 from media_1789933202346.png
 */
const VISITOR_ROLE_TEMPLATES = {
  'Городской страж': {
    role: 'Городской страж',
    dndClass: 'Воин',
    activities: [
      'Пьёт кружку эля после караула, положив шлем на лавку',
      'Бдительно высматривает зачинщиков драк и беглых преступников',
      'Травит байки о ночных погонях по городским трущобам',
      'Жалуется сослуживцу на низкое жалованье и строгого сержанта'
    ]
  },
  'Нищий': {
    role: 'Нищий',
    dndClass: 'Обыватель',
    activities: [
      'Греется у очага, надеясь выпросить хлебную корку или медный грош',
      'Тихо подбирает недоеденные остатки со столов, пока трактирщик отвернулся',
      'Слушает разговоры постояльцев, надеясь продать ценный слух',
      'Дремлет в тёмном углу, закутавшись в дырявый дорожный плащ'
    ]
  },
  'Бард': {
    role: 'Бард',
    dndClass: 'Бард',
    activities: [
      'Наигрывает на лютне залихватскую балладу под аплодисменты зала',
      'Настраивает струны и записывает в блокнот услышанную городскую сплетню',
      'Флиртует со служанкой, обещая посвятить ей романтическую поэму',
      'Декламирует сказание о древнем герое, собирая монеты в шляпу'
    ]
  },
  'Подозрительный тип': {
    role: 'Подозрительный тип',
    dndClass: 'Плут',
    activities: [
      'Низко надвинул капюшон, незаметно наблюдая за входящими гостями',
      'Крутит в пальцах зазубренный кинжал и ждёт тайного связного',
      'Шёпотом ведёт переговоры в глухом углу, взвешивая тугой кошель',
      'Делает вид, что спит за столом, но чутко ловит каждое брошенное слово'
    ]
  },
  'Обыватель': {
    role: 'Обыватель',
    dndClass: 'Обыватель',
    activities: [
      'Смакует горячее рагу после долгого рабочего дня',
      'Играет с соседом в кости на медные монеты под стук кружек',
      'Оживлённо спорит о последних городских налогах и указах',
      'Неторопливо курит трубку, глядя на огонь в очаге'
    ]
  },
  'МП искатель приключений': {
    role: 'Искатель приключений',
    dndClasses: ['Воин', 'Плут', 'Следопыт', 'Варвар', 'Волшебник', 'Жрец', 'Паладин', 'Чародей', 'Друид', 'Бард', 'Монах', 'Колдун'],
    activities: [
      'Изучает потёртую карту катакомб, делая пометки углем',
      'Точит боевой клинок и расспрашивает о монстрах в округе',
      'Ищет смельчаков в отряд для спуска в древнее подземелье',
      'Хвастается трофеем из логова чудовища перед собравшейся толпой'
    ]
  },
  'Торговец': {
    role: 'Торговец',
    dndClass: 'Обыватель',
    activities: [
      'Сверяет записи в амбарной книге при свете сальной свечи',
      'Торгуется с заезжим караванщиком о цене на пряности и ткани',
      'Ищет надёжную наёмную стражу для сопровождения обоза',
      'Угощает деловых партнёров элем в честь удачной торговой сделки'
    ]
  },
  'Жрец': {
    role: 'Жрец',
    dndClass: 'Жрец',
    activities: [
      'Тихо читает священное писание и благословляет трапезу',
      'Выслушивает исповедь встревоженного прихожанина',
      'Перевязывает рану уставшему путешественнику молитвой исцеления',
      'Собирает пожертвования на местную обитель или храм'
    ]
  },
  'Военная элита': {
    role: 'Военная элита',
    dndClass: 'Паладин',
    activities: [
      'Офицер в начищенных латах изучает тактическую карту гарнизона',
      'Ведёт вербовку опытных бойцов в элитный королевский полк',
      'Пьёт выдержанный бренди в кругу боевых офицеров',
      'Оценивающим взглядом бывалого воина осматривает оружие гостей'
    ]
  },
  'Дворянин': {
    role: 'Дворянин',
    dndClass: 'Аристократ',
    activities: [
      'Трапезничает за отдельным столом, брезгливо оглядывая простолюдинов',
      'Неторопливо потягивает коллекционное вино из фамильного кубка',
      'Обсуждает придворные интриги и политику столичных домов',
      'Нанимает тайных агентов для деликатного фамильного поручения'
    ]
  }
};

// "Другое*" пул: любой другой уникальный посетитель
const OTHER_VISITORS_POOL = [
  { role: 'Следопыт', dndClass: 'Следопыт', activity: 'Торгуется с поваром о цене свежей оленьей туши' },
  { role: 'Ученик чародея', dndClass: 'Волшебник', activity: 'Тихо шепчет слова заклинаний, читая магический свиток' },
  { role: 'Алхимик', dndClass: 'Ремесленник', activity: 'Бережно перекладывает стеклянные склянки с редкими зельями' },
  { role: 'Бродячий монах', dndClass: 'Монах', activity: 'Медитирует на лавке, абстрагировавшись от трактирного гомона' },
  { role: 'Тайный культист', dndClass: 'Колдун', activity: 'Прячет под плащом зловещий амулет, выискивая жертву' },
  { role: 'Беглый каторжник', dndClass: 'Плут', activity: 'Нервно озирается при каждом звуке и прячет шрам от кандалов' },
  { role: 'Кузнец-оружейник', dndClass: 'Ремесленник', activity: 'Обсуждает с воинами качество стали и балансировку мечей' },
  { role: 'Странствующий лекарь', dndClass: 'Друид', activity: 'Растирает целебные травы в ступке, источая аромат мяты' }
];

/**
 * Pick Role key based on Tavern Category (Tables 2, 3, 4)
 */
function pickVisitorRole(category) {
  if (category === 'Дешёвое') {
    // Таблица 2: ПОСЕТИТЕЛИ ДЕШЁВОГО ЗАВЕДЕНИЯ
    const pool = [
      'Городской страж',
      'Нищий',
      'Бард',
      'Подозрительный тип',
      'Обыватель',
      'МП искатель приключений'
    ];
    return getRandomItem(pool);
  } else if (category === 'Роскошное') {
    // Таблица 4: ПОСЕТИТЕЛИ ДОРОГОГО ЗАВЕДЕНИЯ
    const pool = [
      'Подозрительный тип',
      'Торговец',
      'Бард',
      'Дворянин',
      'Военная элита',
      'Жрец',
      'МП искатель приключений',
      'Другое*'
    ];
    return getRandomItem(pool);
  } else {
    // Таблица 3: ПОСЕТИТЕЛИ ОБЫЧНОГО ЗАВЕДЕНИЯ
    const pool = [
      'Подозрительный тип',
      'Торговец',
      'Бард',
      'Обыватель',
      'МП искатель приключений',
      'Городской страж',
      'Важный МП'
    ];
    const picked = getRandomItem(pool);
    if (picked === 'Важный МП') {
      // Важный МП (к4): 1 — Жрец; 2 — Военная элита; 3 — Дворянин; 4 — Другое*
      const d4 = getRandomInt(1, 4);
      if (d4 === 1) return 'Жрец';
      if (d4 === 2) return 'Военная элита';
      if (d4 === 3) return 'Дворянин';
      return 'Другое*';
    }
    return picked;
  }
}

/**
 * Generate Visitors currently in the tavern
 */
function generateVisitors(crowdCount, category = 'Обычное') {
  const visitors = [];
  const races = Object.keys(RACE_PORTRAIT_KEYS);
  const count = Math.max(0, Number(crowdCount) || 0);

  for (let i = 0; i < count; i++) {
    const roleKey = pickVisitorRole(category);
    const vRace = getRandomItem(races);
    const vGender = Math.random() > 0.5 ? 'm' : 'f';
    const raceData = TAVERN_DATA.races_innkeeper[vRace] || TAVERN_DATA.races_innkeeper['Человек'];
    const names = vGender === 'm' ? raceData.m : raceData.f;
    const vName = getRandomItem(names && names.length ? names : ['Рейн', 'Варис', 'Лира']);
    const [minA, maxA] = RACE_AGE_RANGES[vRace] || [20, 50];
    const age = getRandomInt(minA, Math.floor(maxA * 0.8));

    let roleName, dndClass, activity;

    if (roleKey === 'Другое*') {
      const other = getRandomItem(OTHER_VISITORS_POOL);
      roleName = other.role;
      dndClass = other.dndClass;
      activity = other.activity;
    } else if (roleKey === 'МП искатель приключений') {
      const templ = VISITOR_ROLE_TEMPLATES[roleKey];
      roleName = templ.role;
      dndClass = getRandomItem(templ.dndClasses);
      activity = getRandomItem(templ.activities);
    } else {
      const templ = VISITOR_ROLE_TEMPLATES[roleKey];
      roleName = templ.role;
      dndClass = templ.dndClass;
      activity = getRandomItem(templ.activities);
    }

    visitors.push({
      name: vName,
      role: roleName,
      dndClass: dndClass,
      race: vRace,
      age: age,
      activity: activity
    });
  }

  return visitors;
}

/**
 * Main Generator Function with Lock State Support
 */
export function generateTavernEnhanced(currentOptions = {}, lockState = {}) {
  // 1. Resolve Location
  const location = (lockState.lockLocation && currentOptions.location && currentOptions.location !== 'random')
    ? currentOptions.location
    : (currentOptions.location && currentOptions.location !== 'random' ? currentOptions.location : getRandomItem(BIOMES));

  // 2. Resolve Type
  const type = (lockState.lockType && currentOptions.type && currentOptions.type !== 'random')
    ? currentOptions.type
    : (currentOptions.type && currentOptions.type !== 'random' ? currentOptions.type : getRandomItem(TAVERN_TYPES));

  // 3. Resolve Category
  const category = (lockState.lockCategory && currentOptions.category && currentOptions.category !== 'random')
    ? currentOptions.category
    : (currentOptions.category && currentOptions.category !== 'random' ? currentOptions.category : getRandomItem(TAVERN_CATEGORIES));

  // 4. Establishment Tier (Rooms count, staff ratio, narrative description from Excel sheet 4)
  const tier = pickTierForCategory(category);
  const description = tier.descriptions[category] || tier.descriptions['Обычное'];

  // 5. Resolve Occupancy & Crowd Count (Table 1 from reference media_1789933202346.png)
  let resolvedOccupancy;
  if (lockState.lockCrowd && currentOptions.crowd && currentOptions.crowd !== 'random') {
    resolvedOccupancy = OCCUPANCY_LEVELS.find(o => o.id === currentOptions.crowd || o.name === currentOptions.crowd);
    if (!resolvedOccupancy) {
      resolvedOccupancy = OCCUPANCY_LEVELS[1]; // fallback
    }
  } else {
    // Weighted random selection: common crowd levels roll most frequently
    const pool = [
      'Несколько человек',
      'Несколько человек',
      'Небольшая толпа',
      'Небольшая толпа',
      'Суматоха',
      'Суматоха',
      'Толпа',
      'Переполненное заведение',
      'Пусто'
    ];
    const pickedId = getRandomItem(pool);
    resolvedOccupancy = OCCUPANCY_LEVELS.find(o => o.id === pickedId) || OCCUPANCY_LEVELS[1];
  }

  const crowd = resolvedOccupancy.calculate(tier.roomsCount);

  // 6. Resolve Atmosphere
  let atmosphereObj;
  if (lockState.lockAtmosphere && currentOptions.atmosphere && currentOptions.atmosphere !== 'random') {
    atmosphereObj = TAVERN_DATA.atmospheres.find(a => a.mood === currentOptions.atmosphere) || getRandomItem(TAVERN_DATA.atmospheres);
  } else {
    atmosphereObj = getRandomItem(TAVERN_DATA.atmospheres);
  }

  // 7. Innkeeper Parameters (Gender, Race, Age - Age changes dynamically on roll unless locked)
  const innkeeperGender = (lockState.lockGender && currentOptions.innkeeperGender && currentOptions.innkeeperGender !== 'random')
    ? currentOptions.innkeeperGender
    : (currentOptions.innkeeperGender && currentOptions.innkeeperGender !== 'random' ? currentOptions.innkeeperGender : 'random');
  
  const innkeeperRace = (lockState.lockRace && currentOptions.innkeeperRace && currentOptions.innkeeperRace !== 'random')
    ? currentOptions.innkeeperRace
    : (currentOptions.innkeeperRace && currentOptions.innkeeperRace !== 'random' ? currentOptions.innkeeperRace : 'random');

  const innkeeperAge = (lockState.lockAge && currentOptions.innkeeperAge !== undefined && currentOptions.innkeeperAge !== 'random')
    ? Number(currentOptions.innkeeperAge)
    : 'random';

  const innkeeper = generateInnkeeper(innkeeperGender, innkeeperRace, innkeeperAge);

  // 8. Tavern Name
  const tavernName = generateTavernName(type, innkeeper.firstName);

  // 9. Rumor & Event
  const rumor = getRandomItem(TAVERN_DATA.rumors);
  const event = getRandomItem(TAVERN_DATA.events);

  // 10. Rooms (Based on tier roomsCount & category prices)
  const rooms = generateRooms(category, tier);

  // 11. Staff Roster (Based on tier servants & bouncers ratio)
  const roster = generateRoster(category, innkeeper, tier);

  // 12. Menu
  const { specialPair, menuRows } = generateMenu(location, category);

  // 13. Visitors (Based on rolled crowd count and category Tables 2, 3, 4)
  const visitors = generateVisitors(crowd, category);

  // 14. Schematic Sketch
  const sketchPath = 'assets/images/taverns/tavern_sketch_classic.jpg';

  // Crowd narrative
  const crowdDesc = `${resolvedOccupancy.name} (${crowd} чел.) — ${resolvedOccupancy.narrative}`;

  return {
    params: {
      location,
      type,
      category,
      occupancy: resolvedOccupancy.id,
      crowd,
      atmosphere: atmosphereObj.mood,
      innkeeperGender: innkeeper.gender,
      innkeeperRace: innkeeper.race,
      innkeeperAge: innkeeper.age,
      tierIndex: tier.tierIndex,
      roomsCount: tier.roomsCount,
      servantsCount: tier.servantsCount,
      bouncersCount: tier.bouncersCount
    },
    tavern: {
      name: tavernName,
      type,
      category,
      location,
      sketchPath,
      atmosphere: atmosphereObj.mood,
      atmosphereDesc: atmosphereObj.desc,
      description,
      occupancy: resolvedOccupancy.name,
      occupancyFormula: resolvedOccupancy.formulaDesc,
      occupancyNarrative: resolvedOccupancy.narrative,
      crowdDesc,
      crowdCount: crowd,
      rumor,
      event,
      specialPair,
      tierIndex: tier.tierIndex,
      roomsCount: tier.roomsCount,
      servantsCount: tier.servantsCount,
      bouncersCount: tier.bouncersCount,
      staffSummary: tier.staffSummary
    },
    patron: innkeeper,
    rooms,
    roster,
    menu: menuRows,
    visitors
  };
}

export { BIOMES, TAVERN_TYPES, TAVERN_CATEGORIES, RACE_PORTRAIT_KEYS, RACE_AGE_RANGES };

