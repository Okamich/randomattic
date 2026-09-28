/**
 * Randomattic - Town & Settlement Generator
 * Procedural generation engine for Villages, Towns, Cities, and Metropolises.
 * Aligned with files/Town/Генератор поселения.xlsx and References/TownReferences/2.jpg.
 */

import {
  TOWN_SIZES,
  LAYOUT_STYLES,
  CONSTRUCTION_MATERIALS,
  PREDOMINANT_RACES,
  PRIMARY_INDUSTRIES,
  WEALTH_LEVELS,
  RELIGIOUS_FOCUS,
  SOCIAL_STRATIFICATIONS,
  GEOGRAPHY_ORIGINS,
  DISTRICTS_CATALOG,
  RACE_RELATIONS,
  RULER_STATUS,
  CURRENT_MISFORTUNES,
  LANDMARKS,
  TOWN_PRIDE,
  WATCH_SYMBOLS,
  WATCH_COLORS,
  WATCH_CAPTAINS,
  WATCH_REPUTATIONS,
  GANG_SCHEMES,
  GANG_PRESETS,
  GUILDS_PRESETS,
  SHOPS_PRESETS,
  TEMPLES_PRESETS,
  QUICK_NPCS,
  RUMORS,
  SENSORY_SCENES,
  TOWN_NAME_PRESETS,
  TOWN_NAME_ROOTS
} from '../data/town-data.js';

// Helper: Pick random element
function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Pick N unique elements
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, arr.length));
}

// Helper: Random integer in range [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Format population number with spaces
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Generate Procedural Settlement Name
 */
export function generateTownName() {
  if (Math.random() < 0.6) {
    return pickRandom(TOWN_NAME_PRESETS);
  }
  const rootObj = pickRandom(TOWN_NAME_ROOTS);
  const epithet = rootObj.epithet || (rootObj.prefix + rootObj.root + rootObj.suffix);
  const titles = ['Град', 'Твердыня', 'Причал', 'Предел', 'Оплот', 'Взморье', 'Рубеж', 'Дол'];
  if (Math.random() < 0.4) {
    return `${pickRandom(titles)} ${epithet}`;
  }
  return epithet;
}

/**
 * Main procedural settlement generator
 * @param {Object} options - User options & locks
 */
export function generateTown(options = {}) {
  // 1. Resolve Settlement Size
  let sizeKey = options.size;
  if (!sizeKey || sizeKey === 'random' || !TOWN_SIZES[sizeKey]) {
    const keys = Object.keys(TOWN_SIZES);
    sizeKey = pickRandom(keys);
  }
  const sizeConfig = TOWN_SIZES[sizeKey];

  // 2. Resolve POI Density
  let poiDensity = options.poiDensity || 'normal'; // 'low' | 'normal' | 'high' | 'very_high'
  const densityMultipliers = {
    low: 0.75,
    normal: 1.0,
    high: 1.25,
    very_high: 1.5
  };
  const densityMult = densityMultipliers[poiDensity] || 1.0;

  // 3. Resolve Parameters
  const layoutKey = (options.layout && LAYOUT_STYLES[options.layout]) ? options.layout : pickRandom(Object.keys(LAYOUT_STYLES));
  const layout = LAYOUT_STYLES[layoutKey];

  const materialKey = (options.material && CONSTRUCTION_MATERIALS[options.material]) ? options.material : pickRandom(Object.keys(CONSTRUCTION_MATERIALS));
  const material = CONSTRUCTION_MATERIALS[materialKey];

  const raceKey = (options.race && PREDOMINANT_RACES[options.race]) ? options.race : pickRandom(Object.keys(PREDOMINANT_RACES));
  const race = PREDOMINANT_RACES[raceKey];

  const industryKey = (options.industry && PRIMARY_INDUSTRIES[options.industry]) ? options.industry : pickRandom(Object.keys(PRIMARY_INDUSTRIES));
  const industry = PRIMARY_INDUSTRIES[industryKey];

  const wealthKey = (options.wealth && WEALTH_LEVELS[options.wealth]) ? options.wealth : pickRandom(Object.keys(WEALTH_LEVELS));
  const wealth = WEALTH_LEVELS[wealthKey];

  const religionKey = (options.religion && RELIGIOUS_FOCUS[options.religion]) ? options.religion : pickRandom(Object.keys(RELIGIOUS_FOCUS));
  const religion = RELIGIOUS_FOCUS[religionKey];

  const stratificationKey = (options.stratification && SOCIAL_STRATIFICATIONS[options.stratification]) ? options.stratification : pickRandom(Object.keys(SOCIAL_STRATIFICATIONS));
  const stratification = SOCIAL_STRATIFICATIONS[stratificationKey];

  // Threat & Power
  const stability = Number.isInteger(options.stability) ? options.stability : randInt(2, 4);
  const crime = Number.isInteger(options.crime) ? options.crime : randInt(1, 4);
  const monsters = Number.isInteger(options.monsters) ? options.monsters : randInt(1, 3);
  const guildPowerLevels = ['Слабая / Номинальная', 'Умеренная', 'Высокая', 'Тотальный контроль'];
  const guildPower = options.guildPower && options.guildPower !== 'random' ? options.guildPower : pickRandom(guildPowerLevels);

  // 4. Calculate Population & Building Estimate
  const minPop = sizeConfig.popRange[0];
  const maxPop = sizeConfig.popRange[1];
  let population = randInt(minPop, maxPop);
  if (wealthKey === 'luxurious') population = Math.floor(population * 1.15);
  if (wealthKey === 'poor') population = Math.floor(population * 0.85);

  const totalBuildingsEstimate = Math.max(25, Math.floor(population * sizeConfig.buildingEstimateRatio * densityMult));

  // 5. Procedural Details
  const townName = options.name || generateTownName();
  const geography = pickRandom(GEOGRAPHY_ORIGINS);
  const landmark = pickRandom(LANDMARKS);
  const townPride = pickRandom(TOWN_PRIDE);
  const misfortune = pickRandom(CURRENT_MISFORTUNES);
  const ruler = pickRandom(RULER_STATUS);
  const raceRelation = pickRandom(RACE_RELATIONS);
  const sensoryScene = pickRandom(SENSORY_SCENES);

  // Watch & Order
  const watchSymbol = pickRandom(WATCH_SYMBOLS);
  const watchColor = pickRandom(WATCH_COLORS);
  const watchCaptain = pickRandom(WATCH_CAPTAINS);
  const watchReputation = pickRandom(WATCH_REPUTATIONS);

  // Gang & Crime
  const gangPreset = pickRandom(GANG_PRESETS);
  const gangScheme = pickRandom(GANG_SCHEMES);

  // Guild
  const guildObj = pickRandom(GUILDS_PRESETS);

  // Choose Map Illustration based on settlement size
  const sizeMapImages = {
    village: 'assets/images/towns/village_map.jpg',
    town: 'assets/images/towns/town_map.jpg',
    city: 'assets/images/towns/city_map.jpg',
    metropolis: 'assets/images/towns/metropolis_map.jpg'
  };
  const mapImage = sizeMapImages[sizeKey] || 'assets/images/towns/city_map.jpg';

  // 6. Generate Districts Table
  const districtCount = Math.min(
    DISTRICTS_CATALOG.length,
    Math.max(2, Math.round(sizeConfig.districtsCount * (densityMult >= 1.25 ? 1.2 : 1.0)))
  );
  const sampledDistricts = pickN(DISTRICTS_CATALOG, districtCount);

  // Allocate buildings across districts
  let remainingBuildings = totalBuildingsEstimate;
  const districts = sampledDistricts.map((d, idx) => {
    const isLast = idx === sampledDistricts.length - 1;
    const share = isLast ? remainingBuildings : Math.max(10, Math.floor(totalBuildingsEstimate / districtCount + randInt(-8, 8)));
    remainingBuildings -= share;

    let badgeClass = 'busy';
    if (d.type.includes('Опасный') || d.type.includes('Бедный')) badgeClass = 'dangerous';
    else if (d.type.includes('Элитный') || d.type.includes('Власть')) badgeClass = 'elite';
    else if (d.type.includes('Магический') || d.type.includes('Научный')) badgeClass = 'arcane';
    else if (d.type.includes('Портовый') || d.type.includes('Торговый')) badgeClass = 'moderate';

    const streetsSample = d.streets && d.streets.length > 0 ? pickN(d.streets, Math.min(3, d.streets.length)).join(', ') : 'Главный проспект, Ремесленный тупик';

    return {
      id: d.id,
      name: d.nameRu,
      nameEn: d.nameEn,
      typePoi: d.type,
      badgeClass: badgeClass,
      estimatedBuildings: Math.max(12, share),
      streets: streetsSample,
      notes: `${d.desc} (Улицы: ${streetsSample})`
    };
  });

  // 7. Citizens, Heroes & Wizards Roster (Table 2)
  const rosterCount = sizeKey === 'village' ? 6 : sizeKey === 'town' ? 8 : 10;
  const sampledNpcs = pickN(QUICK_NPCS, rosterCount);
  const citizenNamesPool = [
    'Алвин Вереск', 'Брунор Железнобокий', 'Лисандра Валмор', 'Тариэль Лунный Шепот',
    'Гаррет Быстроног', 'Мордред Тенехват', 'Элоиза де Монфор', 'Вульфгар Буревестник',
    'Кaelен Златоуст', 'Фандра Двурукая', 'Северин Архивариус', 'Октавия Рассветная'
  ];

  const citizens = sampledNpcs.map((npc, idx) => {
    const name = citizenNamesPool[idx % citizenNamesPool.length];
    return {
      name: name,
      role: npc.role,
      race: npc.race,
      age: npc.age,
      goal: npc.goal,
      item: npc.item,
      notes: `${npc.goal}. При себе: ${npc.item}.`
    };
  });

  // 8. Establishments & Opportunities (Table 3)
  const establishments = [];

  // Shops
  const sampledShops = pickN(SHOPS_PRESETS, sizeKey === 'village' ? 2 : 3);
  sampledShops.forEach(shop => {
    establishments.push({
      name: shop.name,
      type: shop.type,
      owner: shop.owner,
      servicesPrices: 'Стандартные расценки D&D 5e',
      quirkClues: `${shop.condition}. ${shop.quirk}`
    });
  });

  // Taverns
  const tavernNames = [
    '«Свистящая Жаба»', '«Золотой Грифон»', '«Ржавый Якорь»', '«Бочонок и Перо»',
    '«Приют Странника»', '«Веселый Горгулья»'
  ];
  const tavernCount = sizeKey === 'village' ? 1 : sizeKey === 'town' ? 2 : 3;
  for (let i = 0; i < tavernCount; i++) {
    establishments.push({
      name: tavernNames[i % tavernNames.length],
      type: 'Таверна и постоялый двор',
      owner: 'Добродушный хозяин-трактирщик с семьей',
      servicesPrices: 'Ночлег: 5 см - 2 зм; Эль: 4 мм; Рагу: 1 см',
      quirkClues: 'Шумный очаг, доска городских объявлений и свежие слухи за кружкой'
    });
  }

  // Temples
  const sampledTemples = pickN(TEMPLES_PRESETS, sizeKey === 'village' ? 1 : 2);
  sampledTemples.forEach(temple => {
    establishments.push({
      name: temple.name,
      type: 'Святилище / Собор',
      owner: `Служители культа (${temple.dedication})`,
      servicesPrices: 'Пожертвования, благословения, малое исцеление',
      quirkClues: `${temple.feature}. Реликвия: ${temple.relic}`
    });
  });

  // 9. Structured Narrative Sections
  const stabilityTexts = [
    '1/5: Город бурлит от недовольства, на стенах появляются революционные листовки, а магистрат окружил себя наемниками.',
    '2/5: Напряженная обстановка: задержки жалования страже и споры знати грозят перерасти в уличные потасовки.',
    '3/5: Обычный городской порядок: закон соблюдается, хотя под ковром плетутся интриги.',
    '4/5: Высокая стабильность: патрули стражи бдительны, суды работают строго по кодексу.',
    '5/5: Абсолютный железный порядок: комендантский час, доносчики и жестокие кары за малейшее неповиновение.'
  ];

  const crimeTexts = [
    '1/5: Спокойные улицы, преступность почти сведена к нулю благодаря репутации стражи.',
    '2/5: Мелкие щипачи и карманники на рыночных площадях; на окраинах безопасно.',
    '3/5: Активный криминал: шайка контролирует контрабанду и притоны в трущобах.',
    '4/5: Засилье преступных синдикатов: воры взимают дань со всех лавок, стража подкуплена.',
    '5/5: Закон трущоб: власть стражи заканчивается у центральных ворот; город поделен между головорезами.'
  ];

  const monsterTexts = [
    '1/5: Окрестности безопасны, фермы и тракты процветают без помех.',
    '2/5: Одиночные дикие хищники и редкие стаи волков тревожат дальние хутора.',
    '3/5: Набеги гоблиноидов или разбойников на торговые караваны требуют сопровождения.',
    '4/5: Опасная осада чудовищ: чудовища из топей или пещер регулярно нападают на дозоры.',
    '5/5: Тень древнего ужаса: в окрестных руинах пробудилось чудовище (дракон, лич или бехолдер).'
  ];

  const narrative = {
    description: `${townName} — ${sizeConfig.title.toLowerCase()} (${geography.nameRu}), выстроенное преимущество из таких материалов, как ${material.title.toLowerCase()}. Архитектура выдержана в стиле «${layout.title}»: ${layout.desc} Горожане особенно гордятся своим наследием: ${townPride}. Главным ориентиром и визитной карточкой служит ${landmark.toLowerCase()}.`,
    buildingsCitizens: `Общее расчетное число строений: около ${formatNumber(totalBuildingsEstimate)}. В городе проживает около ${formatNumber(population)} человек (${race.title.toLowerCase()}). ${raceRelation}. ${sensoryScene}`,
    rumors: pickN(RUMORS, 3),
    clues: [
      `Странные знаки гильдии воров появились на воротах купеческого особняка в квартале «${districts[0]?.name || 'Центральный'}».`,
      `Капитан стражи тайно разыскивает надежную группу чужеземцев для ночной облавы на убежище банды «${gangPreset.name}».`,
      `В архивной башне обнаружена карта с запечатанным входом в катакомбы под старым собором.`
    ],
    events: [
      `Ежегодная ремесленная ярмарка: мастера гильдии «${guildObj.trade}» выставляют лучшие изделия на главной площади.`,
      `Торжественный крестный ход в честь покровителя города с благословением торговых обозов и кораблей.`,
      `Публичное слушание в магистрате по делу о недавнем заговоре и контрабанде на таможне.`
    ],
    opponents: `Преступное подполье представляет банда «${gangPreset.name}» (отличительный знак: ${gangPreset.symbol}, цвета: ${gangPreset.color}). Их текущая схема: ${gangScheme}. Уровень криминала: ${crimeTexts[crime - 1]}. Угроза монстров: ${monsterTexts[monsters - 1]}.`,
    rulers: `Форма правления: ${stratification.title}. Во главе власти стоит: ${ruler}. Религиозная основа: ${religion.title} (${religion.desc}). Текущее главное бедствие или испытание поселения: ${misfortune}.`,
    watch: `Городская стража носит форму цветов «${watchColor}» с геральдической эмблемой: ${watchSymbol}. Капитан стражи: ${watchCaptain}. Общественная репутация стражников: ${watchReputation}. Стабильность: ${stabilityTexts[stability - 1]}.`,
    guilds: `Ведущее экономическое влияние держит «${guildObj.trade}». Текущий статус: ${guildObj.status}. Теневая сторона: ${guildObj.illicit}. Активное поручение гильдии: ${guildObj.quest}. Власть гильдий в совете: ${guildPower}.`,
    treasures: `Среди горожан ходят легенды о забытом тайнике первых основателей, спрятанном в глубинах фундаментов, а также о реликвии собора — «${TEMPLES_PRESETS[0]?.relic || 'Священный артефакт'}».`,
    battles: `В летописях запечатлена великая историческая осада «Семи Дней», когда городские стены выдержали натиск превосходящих сил врага благодаря мужеству ополчения и искусству гильдейских инженеров.`,
    heroes: `В городе можно встретить прославленных личностей, таких как верховный мастер ${citizens[0]?.name || 'Магистр'} (${citizens[0]?.role || 'Ученый'}) и легендарный дуэлянт ${citizens[1]?.name || 'Ветеран'}.`
  };

  // 10. Generate Markdown Export String
  const exportMarkdown = `# ДОСЬЕ ПОСЕЛЕНИЯ: ${townName.toUpperCase()}
**Тип:** ${sizeConfig.title} (${sizeConfig.enTitle}) | **Население:** ~${formatNumber(population)} (${race.title})
**Планировка:** ${layout.title} | **Материалы:** ${material.title} | **Экономика:** ${industry.title}
**Уровень богатства:** ${wealth.title} | **Власть:** ${stratification.title}

---

## 🏛️ Описание и градостроительство
${narrative.description}

- **Застройка:** ~${formatNumber(totalBuildingsEstimate)} зданий.
- **Отношения рас:** ${raceRelation}
- **Атмосфера улиц:** ${sensoryScene}

## ⚖️ Власть, Стража и Закон
- **Правитель:** ${narrative.rulers}
- **Городская стража:** Символ — «${watchSymbol}», цвета — «${watchColor}».
- **Капитан стражи:** ${watchCaptain}.
- **Репутация стражи:** ${watchReputation}.
- **Стабильность:** ${stabilityTexts[stability - 1]}

## 🗡️ Преступный мир и Угрозы
- **Банда:** «${gangPreset.name}» (Эмблема: ${gangPreset.symbol}, цвета: ${gangPreset.color}).
- **Теневая схема:** ${gangScheme}.
- **Преступность:** ${crimeTexts[crime - 1]}
- **Угроза монстров:** ${monsterTexts[monsters - 1]}

## 📜 Городские слухи
${narrative.rumors.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 🔍 Зацепки для приключений
${narrative.clues.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

## 🗺️ Районы и кварталы (Districts & POI)
| Район | Тип / POI | Зданий (прим.) | Описание и улицы |
| :--- | :--- | :--- | :--- |
${districts.map(d => `| **${d.name}** | ${d.typePoi} | ~${d.estimatedBuildings} | ${d.notes} |`).join('\n')}

---

## 👥 Известные жители и герои
| Имя | Роль | Раса / Возраст | Цель и особый предмет |
| :--- | :--- | :--- | :--- |
${citizens.map(c => `| **${c.name}** | ${c.role} | ${c.race}, ${c.age} | ${c.notes} |`).join('\n')}

---

## 🏪 Заведения и достопримечательности
| Заведение | Тип | Владелец / Обстановка | Особенность / Зацепка |
| :--- | :--- | :--- | :--- |
${establishments.map(e => `| **${e.name}** | ${e.type} | ${e.owner} | ${e.quirkClues} |`).join('\n')}
`;

  // 11. Generate CSV Export String
  let exportCsv = `"DISTRICTS & POI"\n"District Name","Type/POI","Estimated Buildings","Notes & Streets"\n`;
  districts.forEach(d => {
    exportCsv += `"${d.name}","${d.typePoi}","${d.estimatedBuildings}","${d.notes.replace(/"/g, '""')}"\n`;
  });
  exportCsv += `\n"CITIZENS, HEROES & WIZARDS"\n"Name","Role","Race","Age","Goal & Item"\n`;
  citizens.forEach(c => {
    exportCsv += `"${c.name}","${c.role}","${c.race}","${c.age}","${c.notes.replace(/"/g, '""')}"\n`;
  });
  exportCsv += `\n"ESTABLISHMENTS & OPPORTUNITIES"\n"Establishment Name","Type","Owner & Ambience","Quirks & Clues"\n`;
  establishments.forEach(e => {
    exportCsv += `"${e.name}","${e.type}","${e.owner.replace(/"/g, '""')}","${e.quirkClues.replace(/"/g, '""')}"\n`;
  });

  return {
    meta: {
      name: townName,
      sizeKey: sizeKey,
      sizeTitle: sizeConfig.title,
      sizeEnTitle: sizeConfig.enTitle,
      population: population,
      populationFormatted: formatNumber(population),
      totalBuildingsEstimate: totalBuildingsEstimate,
      layoutKey: layoutKey,
      layoutTitle: layout.title,
      materialKey: materialKey,
      materialTitle: material.title,
      raceKey: raceKey,
      raceTitle: race.title,
      industryKey: industryKey,
      industryTitle: industry.title,
      wealthKey: wealthKey,
      wealthTitle: wealth.title,
      religionKey: religionKey,
      religionTitle: religion.title,
      stratificationKey: stratificationKey,
      stratificationTitle: stratification.title,
      stability: stability,
      crime: crime,
      monsters: monsters,
      guildPower: guildPower,
      poiDensity: poiDensity,
      mapImage: mapImage
    },
    narrative: narrative,
    districts: districts,
    citizens: citizens,
    establishments: establishments,
    exportMarkdown: exportMarkdown,
    exportCsv: exportCsv
  };
}
