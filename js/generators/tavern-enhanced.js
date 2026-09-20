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
      return `${type} «${adjNom} ${nounNom}»`;
    case 2:
      return `${type} «${adjGen} ${nounGen}»`;
    case 3:
      return `«${adjNom} ${nounNom}»`;
    case 4:
      return `«${nounNom} и ${nounNom2}»`;
    case 5:
      return `${type} «${adjNom} ${nounNom}»`;
    case 6:
      return patronName ? `${type} ${patronName}` : `${type} «${adjNom} ${nounNom}»`;
    default:
      return `${type} «${adjNom} ${nounNom}»`;
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
 * Generate Procedural Rooms matching category
 */
function generateRooms(category) {
  const tier = TAVERN_DATA.room_tiers[category] || TAVERN_DATA.room_tiers['Обычное'];
  const count = getRandomInt(tier.rooms_min, tier.rooms_max);
  const rooms = [];

  const visitorOccupants = [
    'Странствующий купец с охраной',
    'Эльфийский посланник',
    'Уставший наёмник',
    'Семья беженцев',
    'Загадочный учёный-маг',
    'Дворцовый чиновник инкогнито',
    'Бард со своей труппой'
  ];

  for (let i = 1; i <= count; i++) {
    let typeDesc = '';
    let cost = '';
    
    if (i === 1) {
      typeDesc = 'Общий спальный зал (Койки у очага, шумный)';
      cost = tier.common;
    } else if (i === count && (category === 'Обычное' || category === 'Роскошное')) {
      typeDesc = 'Люкс / Дворянские апартаменты (Камин, мягкая перина, ванна)';
      cost = tier.luxury;
    } else {
      typeDesc = 'Обычная комната (Деревянная кровать, сундук, свеча)';
      cost = tier.private;
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
 * Generate Tavern Staff Roster
 */
function generateRoster(category, innkeeper) {
  const roster = [];
  // 1. Owner
  roster.push({
    role: 'Трактирщик (Владелец)',
    name: innkeeper.fullName,
    race: innkeeper.race,
    age: innkeeper.age,
    trait: innkeeper.quirk,
    skill: 'Дипломатия и управление'
  });

  // Base staff roles depending on tier
  const staffTypes = [
    { role: 'Шеф-повар', skill: 'Кулинарные шедевры' },
    { role: 'Старший бармен', skill: 'Миксология и знание слухов' },
    { role: 'Вышибала', skill: 'Запугивание и атлетика' },
    { role: 'Служанка', skill: 'Проворство и внимание' },
    { role: 'Трактирный бард', skill: 'Игра на лютне и песни' }
  ];

  const staffCount = category === 'Дешёвое' ? 2 : category === 'Обычное' ? 4 : 5;
  const races = Object.keys(RACE_PORTRAIT_KEYS);

  for (let i = 0; i < staffCount; i++) {
    const sType = staffTypes[i % staffTypes.length];
    const sRace = getRandomItem(races);
    const sGender = Math.random() > 0.5 ? 'm' : 'f';
    const raceData = TAVERN_DATA.races_innkeeper[sRace] || TAVERN_DATA.races_innkeeper['Человек'];
    const names = sGender === 'm' ? raceData.m : raceData.f;
    const sName = getRandomItem(names && names.length ? names : ['Джей', 'Кара', 'Морган']);
    const [minA, maxA] = RACE_AGE_RANGES[sRace] || [20, 50];

    roster.push({
      role: sType.role,
      name: sName,
      race: sRace,
      age: getRandomInt(minA, Math.floor(maxA * 0.7)),
      trait: getRandomItem(TAVERN_DATA.personality_traits),
      skill: sType.skill
    });
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
 * Generate Visitors currently in the tavern
 */
function generateVisitors(crowdCount) {
  const visitors = [];
  const races = Object.keys(RACE_PORTRAIT_KEYS);
  const count = Math.max(2, Math.min(crowdCount || 6, 12));

  for (let i = 0; i < count; i++) {
    const arch = getRandomItem(TAVERN_DATA.visitor_archetypes);
    const vRace = getRandomItem(races);
    const vGender = Math.random() > 0.5 ? 'm' : 'f';
    const raceData = TAVERN_DATA.races_innkeeper[vRace] || TAVERN_DATA.races_innkeeper['Человек'];
    const names = vGender === 'm' ? raceData.m : raceData.f;
    const vName = getRandomItem(names && names.length ? names : ['Рейн', 'Варис', 'Лира']);
    const [minA, maxA] = RACE_AGE_RANGES[vRace] || [20, 50];

    visitors.push({
      name: vName,
      role: arch.role,
      dndClass: arch.class,
      race: vRace,
      age: getRandomInt(minA, Math.floor(maxA * 0.8)),
      activity: arch.activity
    });
  }

  return visitors;
}

/**
 * Main Generator Function with Lock State Support
 */
export function generateTavernEnhanced(currentOptions = {}, lockState = {}) {
  // 1. Resolve Location
  const location = (lockState.lockLocation && currentOptions.location)
    ? currentOptions.location
    : (currentOptions.location && currentOptions.location !== 'random' ? currentOptions.location : getRandomItem(BIOMES));

  // 2. Resolve Type
  const type = (lockState.lockType && currentOptions.type)
    ? currentOptions.type
    : (currentOptions.type && currentOptions.type !== 'random' ? currentOptions.type : getRandomItem(TAVERN_TYPES));

  // 3. Resolve Category
  const category = (lockState.lockCategory && currentOptions.category)
    ? currentOptions.category
    : (currentOptions.category && currentOptions.category !== 'random' ? currentOptions.category : getRandomItem(TAVERN_CATEGORIES));

  // 4. Resolve Crowd
  const crowd = (lockState.lockCrowd && currentOptions.crowd !== undefined)
    ? Number(currentOptions.crowd)
    : (currentOptions.crowd !== undefined && currentOptions.crowd !== 'random' ? Number(currentOptions.crowd) : getRandomInt(3, 20));

  // 5. Resolve Atmosphere
  let atmosphereObj;
  if (lockState.lockAtmosphere && currentOptions.atmosphere && currentOptions.atmosphere !== 'random') {
    atmosphereObj = TAVERN_DATA.atmospheres.find(a => a.mood === currentOptions.atmosphere) || getRandomItem(TAVERN_DATA.atmospheres);
  } else {
    atmosphereObj = getRandomItem(TAVERN_DATA.atmospheres);
  }

  // 6. Innkeeper Parameters (Gender, Race, Age)
  const innkeeperGender = (lockState.lockGender && currentOptions.innkeeperGender)
    ? currentOptions.innkeeperGender
    : currentOptions.innkeeperGender;
  
  const innkeeperRace = (lockState.lockRace && currentOptions.innkeeperRace)
    ? currentOptions.innkeeperRace
    : currentOptions.innkeeperRace;

  const innkeeperAge = (lockState.lockAge && currentOptions.innkeeperAge)
    ? currentOptions.innkeeperAge
    : currentOptions.innkeeperAge;

  const innkeeper = generateInnkeeper(innkeeperGender, innkeeperRace, innkeeperAge);

  // 7. Tavern Name
  const tavernName = generateTavernName(type, innkeeper.firstName);

  // 8. Rumor & Event
  const rumor = getRandomItem(TAVERN_DATA.rumors);
  const event = getRandomItem(TAVERN_DATA.events);

  // 9. Rooms
  const rooms = generateRooms(category);

  // 10. Roster
  const roster = generateRoster(category, innkeeper);

  // 11. Menu
  const { specialPair, menuRows } = generateMenu(location, category);

  // 12. Visitors
  const visitors = generateVisitors(crowd);

  // 13. Schematic Sketch
  const sketchPath = 'assets/images/taverns/tavern_sketch_classic.jpg';

  // Crowd narrative
  let crowdDesc = '';
  if (crowd <= 4) crowdDesc = `Практически пусто (${crowd} чел.), лишь редкие одинокие путники тихо сидят по углам.`;
  else if (crowd <= 12) crowdDesc = `Умеренно оживлённо (${crowd} чел.), несколько столов заняты беседующими гостями.`;
  else if (crowd <= 22) crowdDesc = `Шумно и многолюдно (${crowd} чел.), смех, стук кружек и оживлённые споры.`;
  else crowdDesc = `Яблоку негде упасть (${crowd}+ чел.), гулянка в самом разгаре, за столами теснятся гости!`;

  return {
    params: {
      location,
      type,
      category,
      crowd,
      atmosphere: atmosphereObj.mood,
      innkeeperGender: innkeeper.gender,
      innkeeperRace: innkeeper.race,
      innkeeperAge: innkeeper.age
    },
    tavern: {
      name: tavernName,
      type,
      category,
      location,
      sketchPath,
      atmosphere: atmosphereObj.mood,
      atmosphereDesc: atmosphereObj.desc,
      crowdDesc,
      crowdCount: crowd,
      rumor,
      event,
      specialPair
    },
    patron: innkeeper,
    rooms,
    roster,
    menu: menuRows,
    visitors
  };
}

export { BIOMES, TAVERN_TYPES, TAVERN_CATEGORIES, RACE_PORTRAIT_KEYS, RACE_AGE_RANGES };
