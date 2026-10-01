/**
 * portrait-composer.js
 * Модульный процедурный генератор 2D-портретов (Layered Comic / Cel-shaded Paper Doll Compositor).
 * Послойная сборка на HTML5 Canvas (765x1024) с динамическим тинтингом (multiply),
 * поддержкой рас, полов, черт лица, причесок, бород, доспехов, аксессуаров и фонов.
 */

// ============================================================================
// 1. ПАЛИТРЫ ЦВЕТОВ (PALETTES)
// ============================================================================
export const PORTRAIT_PALETTES = {
  skin: {
    pale: { fill: '#fcefe8', shadow: '#eacdc0', name: 'Бледная' },
    fair: { fill: '#f6d5be', shadow: '#e1b194', name: 'Светлая' },
    tan: { fill: '#e1b996', shadow: '#bf7d52', name: 'Смуглая / Загорелая' },
    bronze: { fill: '#b57448', shadow: '#96552c', name: 'Бронзовая' },
    dark: { fill: '#6d422a', shadow: '#502c18', name: 'Тёмная' },
    ebony: { fill: '#40271c', shadow: '#2d1810', name: 'Глубокая тёмная' },
    orc_green: { fill: '#809c69', shadow: '#5c7847', name: 'Зеленоватая (Полуорк)' },
    drow_grey: { fill: '#6c7582', shadow: '#4d5561', name: 'Пепельно-серая (Дроу)' },
    celestial_gold: { fill: '#fae3a2', shadow: '#dfbe68', name: 'Золотистая' },
    tiefling_red: { fill: '#c33c41', shadow: '#993f3f', name: 'Красноватая (Тифлинг)' }
  },

  hair: {
    black: { fill: '#231e23', highlight: '#3f3a40', name: 'Черные' },
    dark_brown: { fill: '#422818', highlight: '#5c412f', name: 'Темно-каштановые' },
    chestnut: { fill: '#784b2d', highlight: '#855137', name: 'Каштановые' },
    auburn: { fill: '#8d3b25', highlight: '#b85337', name: 'Медно-рыжие' },
    ginger: { fill: '#be6e32', highlight: '#ea8652', name: 'Ярко-рыжие' },
    blonde: { fill: '#f5d75f', highlight: '#fbf0b5', name: 'Золотистый блонд' },
    platinum: { fill: '#e8e4dc', highlight: '#fbf9f5', name: 'Платиновый блонд' },
    grey: { fill: '#9ea2a8', highlight: '#b5bac0', name: 'С сединой' },
    white: { fill: '#e8e8ed', highlight: '#ffffff', name: 'Белоснежные' }
  },

  eyes: {
    brown: '#6b4226',
    dark_brown: '#382012',
    hazel: '#82653b',
    amber: '#dcb432',
    green: '#3cbe6e',
    emerald: '#208c58',
    blue: '#5096f0',
    ice_blue: '#78b5e3',
    grey: '#94a3b8',
    violet: '#8e44ad',
    red: '#c0392b'
  },

  clothes: {
    warrior_steel: { main: '#8ca0c3', trim: '#b4c4dd', name: 'Стальные латы' },
    warrior_gold: { main: '#d2af46', trim: '#f7d377', name: 'Золоченые доспехи' },
    warrior_dark: { main: '#525b68', trim: '#8693a4', name: 'Вороненая сталь' },
    ranger_leather: { main: '#a07350', trim: '#cca17b', name: 'Дубленая кожа' },
    ranger_green: { main: '#5c7a42', trim: '#82a865', name: 'Лесной егерь' },
    rogue_dark: { main: '#41324b', trim: '#634e70', name: 'Сумеречная тень' },
    rogue_charcoal: { main: '#2c3539', trim: '#48555c', name: 'Ночной уголь' },
    cleric_ivory: { main: '#e6d7eb', trim: '#fbf5fd', name: 'Светлое облачение' },
    cleric_gold: { main: '#dfb858', trim: '#fae39b', name: 'Солнечный клирик' },
    mage_purple: { main: '#6b3ba6', trim: '#9761da', name: 'Тайный фиолетовый' },
    mage_crimson: { main: '#8a2535', trim: '#b84457', name: 'Багровый чародей' },
    commoner_tan: { main: '#8c6d53', trim: '#ba9a7f', name: 'Простая туника' }
  },

  horns: {
    ram_dark: '#4b3c4b',
    ram_bone: '#8c7b6d',
    ram_obsidian: '#29252c'
  },

  stroke: '#1e1c1f',
  strokeWidth: 2.4
};

// ============================================================================
// 2. КАТАЛОГ СЛОЕВ В assets/images/portraits/layers/
// ============================================================================
export const LAYER_PATHS = {
  backgrounds: {
    bg_parchment: 'assets/images/portraits/layers/backgrounds/bg_parchment.png',
    bg_tavern: 'assets/images/portraits/layers/backgrounds/bg_tavern.png',
    bg_night_forest: 'assets/images/portraits/layers/backgrounds/bg_night_forest.png',
    bg_shield: 'assets/images/portraits/layers/backgrounds/bg_shield.png'
  },
  hair_back: {
    hair_back_ponytail: 'assets/images/portraits/layers/hair_back/hair_back_ponytail.png',
    hair_back_braids: 'assets/images/portraits/layers/hair_back/hair_back_braids.png'
  },
  bodies: {
    body_male: 'assets/images/portraits/layers/bodies/body_male.png',
    body_female: 'assets/images/portraits/layers/bodies/body_female.png'
  },
  faces: {
    face_neutral: 'assets/images/portraits/layers/faces/face_neutral.png',
    face_warrior: 'assets/images/portraits/layers/faces/face_warrior.png',
    face_sly: 'assets/images/portraits/layers/faces/face_sly.png',
    irises_neutral: 'assets/images/portraits/layers/faces/irises_neutral.png',
    irises_warrior: 'assets/images/portraits/layers/faces/irises_warrior.png',
    irises_sly: 'assets/images/portraits/layers/faces/irises_sly.png'
  },
  beards: {
    beard_full: 'assets/images/portraits/layers/beards/beard_full.png',
    beard_goatee: 'assets/images/portraits/layers/beards/beard_goatee.png',
    beard_dwarf: 'assets/images/portraits/layers/beards/beard_dwarf.png',
    beard_stubble: 'assets/images/portraits/layers/beards/beard_stubble.png'
  },
  clothes: {
    cuirass_knight: 'assets/images/portraits/layers/clothes/cuirass_knight.png',
    armor_ranger: 'assets/images/portraits/layers/clothes/armor_ranger.png',
    cowl_rogue: 'assets/images/portraits/layers/clothes/cowl_rogue.png',
    robe_cleric: 'assets/images/portraits/layers/clothes/robe_cleric.png',
    robe_mage: 'assets/images/portraits/layers/clothes/robe_mage.png'
  },
  accessories: {
    eyepatch: 'assets/images/portraits/layers/accessories/eyepatch.png',
    horns_tiefling: 'assets/images/portraits/layers/accessories/horns_tiefling.png',
    scar_cheek: 'assets/images/portraits/layers/accessories/scar_cheek.png'
  },
  hair_front: {
    hair_buzz: 'assets/images/portraits/layers/hair_front/hair_buzz.png',
    hair_messy: 'assets/images/portraits/layers/hair_front/hair_messy.png',
    hair_flowing: 'assets/images/portraits/layers/hair_front/hair_flowing.png',
    hair_sleek: 'assets/images/portraits/layers/hair_front/hair_sleek.png',
    hair_bald: 'assets/images/portraits/layers/hair_front/hair_bald.png'
  }
};

// ============================================================================
// 3. КЭШИРОВАНИЕ И ПРЕДЗАГРУЗКА ИЗОБРАЖЕНИЙ
// ============================================================================
const imageCache = new Map();

/**
 * Загрузить или получить из кэша изображение слоя
 * @param {string} src
 * @returns {Promise<HTMLImageElement|null>}
 */
export function loadLayerImage(src) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) {
    const entry = imageCache.get(src);
    if (entry.img && entry.img.complete && entry.img.naturalWidth > 0) {
      return Promise.resolve(entry.img);
    }
    return entry.promise;
  }

  if (typeof Image === 'undefined') return Promise.resolve(null);

  const img = new Image();
  const promise = new Promise((resolve) => {
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`[PortraitComposer] Не удалось загрузить слой: ${src}`);
      resolve(null);
    };
  });
  img.src = src;
  imageCache.set(src, { img, promise });
  return promise;
}

/**
 * Предзагрузка всех доступных слоев в память браузера
 */
export function preloadPortraitLayers() {
  const promises = [];
  for (const cat of Object.values(LAYER_PATHS)) {
    for (const path of Object.values(cat)) {
      promises.push(loadLayerImage(path));
    }
  }
  return Promise.all(promises);
}

// Запустить фоновую предзагрузку при наличии DOM
if (typeof window !== 'undefined') {
  setTimeout(() => preloadPortraitLayers(), 80);
}

// ============================================================================
// 4. ГЕНЕРАТОР РЕЦЕПТА ПОРТРЕТА (RECIPE BUILDER)
// ============================================================================

/**
 * Создаёт рецепт портрета на основе объекта NPC (из generateFullNPC)
 */
export function buildPortraitRecipeFromNPC(npc) {
  const race = npc?.raceKey || 'human';
  const gender = npc?.gender || 'Мужчина';
  const isMale = gender === 'Мужчина' || gender === 'male';
  const age = typeof npc?.age === 'number' ? npc.age : 30;
  const ageStage = npc?.ageStage || (age > 60 ? 'old' : (age > 35 ? 'mature' : 'young'));
  const traits = npc?.extendedTraits;

  // 1. Модель тела (манекен)
  const body = isMale ? 'body_male.png' : 'body_female.png';

  // 2. Тон кожи
  let skinColor = PORTRAIT_PALETTES.skin.fair.fill;
  let skinKey = 'fair';

  if (race === 'halforc' || race === 'orc') {
    skinColor = PORTRAIT_PALETTES.skin.orc_green.fill;
    skinKey = 'orc_green';
  } else if (race === 'tiefling') {
    skinColor = PORTRAIT_PALETTES.skin.tiefling_red.fill;
    skinKey = 'tiefling_red';
  } else if (race === 'drow') {
    skinColor = PORTRAIT_PALETTES.skin.drow_grey.fill;
    skinKey = 'drow_grey';
  } else if (race === 'elf' || race === 'halfelf') {
    skinKey = Math.random() > 0.5 ? 'pale' : 'fair';
    skinColor = PORTRAIT_PALETTES.skin[skinKey].fill;
  } else if (race === 'dwarf') {
    skinKey = Math.random() > 0.4 ? 'tan' : 'fair';
    skinColor = PORTRAIT_PALETTES.skin[skinKey].fill;
  } else {
    const tones = ['fair', 'pale', 'tan', 'bronze', 'dark'];
    skinKey = tones[Math.floor(Math.random() * tones.length)];
    skinColor = PORTRAIT_PALETTES.skin[skinKey].fill;
  }

  // 3. Цвет волос (с учетом возраста и расы)
  let hairColor = PORTRAIT_PALETTES.hair.dark_brown.fill;
  let hairKey = 'dark_brown';

  if (ageStage === 'old' || age > 65) {
    hairKey = Math.random() > 0.3 ? 'grey' : 'white';
    hairColor = PORTRAIT_PALETTES.hair[hairKey].fill;
  } else if (race === 'drow') {
    hairKey = Math.random() > 0.4 ? 'white' : 'platinum';
    hairColor = PORTRAIT_PALETTES.hair[hairKey].fill;
  } else if (race === 'elf') {
    const elfColors = ['platinum', 'blonde', 'black', 'dark_brown'];
    hairKey = elfColors[Math.floor(Math.random() * elfColors.length)];
    hairColor = PORTRAIT_PALETTES.hair[hairKey].fill;
  } else if (race === 'dwarf') {
    const dwarfColors = ['ginger', 'chestnut', 'dark_brown', 'black', 'grey'];
    hairKey = dwarfColors[Math.floor(Math.random() * dwarfColors.length)];
    hairColor = PORTRAIT_PALETTES.hair[hairKey].fill;
  } else {
    const standardColors = ['black', 'dark_brown', 'chestnut', 'auburn', 'ginger', 'blonde'];
    hairKey = standardColors[Math.floor(Math.random() * standardColors.length)];
    hairColor = PORTRAIT_PALETTES.hair[hairKey].fill;
  }

  // 4. Лицо (лайн-арт) и форма глаз
  let face = 'face_neutral.png';
  let eyes = 'irises_neutral.png';
  const profRole = (npc?.profession?.role || '').toLowerCase();
  const profTitle = (npc?.profession?.title || '').toLowerCase();

  const isWarrior = profRole.includes('воин') || profRole.includes('страж') || profRole.includes('боец') || profTitle.includes('кузнец') || race === 'halforc' || race === 'dwarf';
  const isRogue = profRole.includes('вор') || profRole.includes('убийца') || profRole.includes('разбой') || profRole.includes('следопыт') || profRole.includes('бард');

  if (isWarrior) {
    face = 'face_warrior.png';
    eyes = 'irises_warrior.png';
  } else if (isRogue) {
    face = 'face_sly.png';
    eyes = 'irises_sly.png';
  } else {
    face = Math.random() > 0.4 ? 'face_neutral.png' : 'face_sly.png';
    eyes = face === 'face_neutral.png' ? 'irises_neutral.png' : 'irises_sly.png';
  }

  // 5. Цвет глаз (синхронизация с детальными чертами)
  let eyeColor = PORTRAIT_PALETTES.eyes.brown;
  const eyesText = traits?.face?.eyes?.textRu || '';

  if (eyesText.includes('Голуб') || eyesText.includes('синие')) {
    eyeColor = PORTRAIT_PALETTES.eyes.ice_blue;
  } else if (eyesText.includes('Зелен') || eyesText.includes('изумруд')) {
    eyeColor = PORTRAIT_PALETTES.eyes.green;
  } else if (eyesText.includes('Серые')) {
    eyeColor = PORTRAIT_PALETTES.eyes.grey;
  } else if (eyesText.includes('Янтар') || eyesText.includes('желтые') || eyesText.includes('золот')) {
    eyeColor = PORTRAIT_PALETTES.eyes.amber;
  } else if (eyesText.includes('Фиолет') || eyesText.includes('аметист')) {
    eyeColor = PORTRAIT_PALETTES.eyes.violet;
  } else if (eyesText.includes('Красн') || eyesText.includes('алые')) {
    eyeColor = PORTRAIT_PALETTES.eyes.red;
  } else {
    if (race === 'elf') eyeColor = PORTRAIT_PALETTES.eyes.green;
    else if (race === 'tiefling') eyeColor = PORTRAIT_PALETTES.eyes.amber;
    else if (race === 'halforc') eyeColor = PORTRAIT_PALETTES.eyes.amber;
    else if (race === 'dwarf') eyeColor = PORTRAIT_PALETTES.eyes.blue;
    else {
      const eyePool = [PORTRAIT_PALETTES.eyes.brown, PORTRAIT_PALETTES.eyes.blue, PORTRAIT_PALETTES.eyes.green, PORTRAIT_PALETTES.eyes.hazel];
      eyeColor = eyePool[Math.floor(Math.random() * eyePool.length)];
    }
  }

  // 6. Прическа (спереди и сзади)
  let hairFront = 'hair_sleek.png';
  let hairBack = null;

  const hairText = traits?.face?.hair?.textRu || '';
  if ((hairText.includes('Лыс') || hairText.includes('Брит') || (isMale && race !== 'elf' && race !== 'dwarf' && ageStage === 'old' && Math.random() > 0.65)) && race !== 'tiefling') {
    hairFront = 'hair_bald.png';
    hairBack = null;
  } else if (hairText.includes('кос') || hairText.includes('Длинн') || hairText.includes('локон')) {
    hairFront = 'hair_flowing.png';
    hairBack = Math.random() > 0.4 ? 'hair_back_braids.png' : 'hair_back_ponytail.png';
  } else if (hairText.includes('Коротко') || hairText.includes('машинку') || hairText.includes('ежик')) {
    hairFront = 'hair_buzz.png';
    hairBack = null;
  } else if (hairText.includes('кудр') || hairText.includes('патл') || hairText.includes('непричёс') || hairText.includes('Растреп')) {
    hairFront = 'hair_messy.png';
    hairBack = (!isMale && Math.random() > 0.5) ? 'hair_back_ponytail.png' : null;
  } else if (isMale) {
    if (race === 'dwarf') {
      const dwarfHair = ['hair_buzz.png', 'hair_messy.png', 'hair_flowing.png'];
      hairFront = dwarfHair[Math.floor(Math.random() * dwarfHair.length)];
      if (hairFront === 'hair_flowing.png') hairBack = 'hair_back_braids.png';
    } else if (race === 'elf') {
      hairFront = Math.random() > 0.5 ? 'hair_sleek.png' : 'hair_flowing.png';
      if (hairFront === 'hair_flowing.png') hairBack = 'hair_back_ponytail.png';
    } else {
      const maleHair = ['hair_buzz.png', 'hair_sleek.png', 'hair_messy.png', 'hair_flowing.png'];
      hairFront = maleHair[Math.floor(Math.random() * maleHair.length)];
      if (hairFront === 'hair_flowing.png') hairBack = Math.random() > 0.5 ? 'hair_back_ponytail.png' : 'hair_back_braids.png';
    }
  } else {
    // Female
    const femaleHair = ['hair_flowing.png', 'hair_sleek.png', 'hair_messy.png'];
    hairFront = femaleHair[Math.floor(Math.random() * femaleHair.length)];
    if (hairFront === 'hair_flowing.png') {
      hairBack = Math.random() > 0.4 ? 'hair_back_braids.png' : null;
    } else if (hairFront === 'hair_sleek.png') {
      hairBack = 'hair_back_ponytail.png';
    }
  }

  // 7. Растительность на лице (борода / усы - только мужчины)
  let beard = null;
  if (isMale) {
    if (race === 'dwarf') {
      beard = Math.random() > 0.3 ? 'beard_dwarf.png' : 'beard_full.png';
    } else if (race !== 'elf') {
      const r = Math.random();
      if (r < 0.25) beard = 'beard_stubble.png';
      else if (r < 0.45) beard = 'beard_goatee.png';
      else if (r < 0.65) beard = 'beard_full.png';
      else beard = null;
    }
  }

  // 8. Одежда / Наплечники
  let clothes = 'armor_ranger.png';
  let clothesColor = PORTRAIT_PALETTES.clothes.ranger_leather.main;
  let clothesKey = 'ranger_leather';

  if (isWarrior) {
    clothes = 'cuirass_knight.png';
    clothesKey = Math.random() > 0.4 ? 'warrior_steel' : 'warrior_gold';
    clothesColor = PORTRAIT_PALETTES.clothes[clothesKey].main;
  } else if (profRole.includes('маг') || profRole.includes('волшеб') || profRole.includes('чародей')) {
    clothes = 'robe_mage.png';
    clothesKey = Math.random() > 0.4 ? 'mage_purple' : 'mage_crimson';
    clothesColor = PORTRAIT_PALETTES.clothes[clothesKey].main;
  } else if (profRole.includes('жрец') || profRole.includes('священник') || profTitle.includes('монах')) {
    clothes = 'robe_cleric.png';
    clothesKey = Math.random() > 0.3 ? 'cleric_ivory' : 'cleric_gold';
    clothesColor = PORTRAIT_PALETTES.clothes[clothesKey].main;
  } else if (profRole.includes('вор') || profRole.includes('убийца') || profRole.includes('разбой')) {
    clothes = 'cowl_rogue.png';
    clothesKey = Math.random() > 0.4 ? 'rogue_dark' : 'rogue_charcoal';
    clothesColor = PORTRAIT_PALETTES.clothes[clothesKey].main;
  } else if (profRole.includes('следопыт') || profRole.includes('охотник') || profRole.includes('егерь')) {
    clothes = 'armor_ranger.png';
    clothesKey = Math.random() > 0.4 ? 'ranger_green' : 'ranger_leather';
    clothesColor = PORTRAIT_PALETTES.clothes[clothesKey].main;
  } else {
    const defaultStyles = [
      { file: 'armor_ranger.png', key: 'ranger_leather' },
      { file: 'cowl_rogue.png', key: 'rogue_dark' },
      { file: 'robe_cleric.png', key: 'cleric_ivory' },
      { file: 'cuirass_knight.png', key: 'warrior_steel' }
    ];
    const picked = defaultStyles[Math.floor(Math.random() * defaultStyles.length)];
    clothes = picked.file;
    clothesKey = picked.key;
    clothesColor = PORTRAIT_PALETTES.clothes[clothesKey].main;
  }

  // 9. Аксессуары & Шрамы
  let horns = race === 'tiefling' ? 'horns_tiefling.png' : null;
  let hornColor = horns ? PORTRAIT_PALETTES.horns.ram_dark : null;

  let scar = null;
  const scarText = traits?.physical?.scar?.textRu || '';
  if (scarText.includes('глаз') || scarText.includes('лицо') || scarText.includes('щек') || (isWarrior && Math.random() < 0.35)) {
    scar = 'scar_cheek.png';
  }

  let eyepatch = null;
  if ((isWarrior || profRole.includes('пират') || profRole.includes('ветеран')) && Math.random() < 0.18) {
    eyepatch = 'eyepatch.png';
  }

  // 10. Фон
  let bg = 'bg_shield.png';
  if (isWarrior || profRole.includes('паладин') || profRole.includes('страж')) {
    bg = 'bg_shield.png';
  } else if (profRole.includes('следопыт') || profRole.includes('друид') || profRole.includes('охотник')) {
    bg = 'bg_night_forest.png';
  } else if (isRogue || profRole.includes('бард') || profRole.includes('купец')) {
    bg = 'bg_tavern.png';
  } else {
    bg = 'bg_parchment.png';
  }

  return {
    // Растровые слои и параметры
    bg,
    hairBack,
    body,
    skinColor,
    face,
    eyes,
    eyeColor,
    scar,
    beard,
    clothes,
    clothesColor,
    horns,
    hornColor,
    eyepatch,
    hairFront,
    hairColor,
    occludeBody: true,

    // Обратная совместимость с векторным генератором SVG
    raceKey: race,
    gender,
    ageStage,
    skinKey,
    hairKey,
    eyeColorLeft: eyeColor,
    eyeColorRight: eyeColor,
    frontHair: hairFront,
    backHair: hairBack,
    clothesKey,
    accessory: scar || eyepatch || horns,
    flip: false,
    bgStyle: 'circle'
  };
}

// ============================================================================
// 5. CANVAS КОМПОЗИТОР (HTML5 CANVAS RENDERER)
// ============================================================================

let scratchCanvas = null;
let scratchCtx = null;

function getScratchContext() {
  if (!scratchCanvas && typeof document !== 'undefined') {
    scratchCanvas = document.createElement('canvas');
    scratchCanvas.width = 765;
    scratchCanvas.height = 1024;
    scratchCtx = scratchCanvas.getContext('2d');
  }
  return { scratchCanvas, scratchCtx };
}

/**
 * Отрисовать тонированный слой методом multiply с маскированием
 */
function drawTintedLayer(destCtx, img, colorHex, clipBody = false) {
  if (!img) return;
  const { scratchCanvas, scratchCtx } = getScratchContext();
  if (!scratchCanvas || !scratchCtx) {
    destCtx.drawImage(img, 0, 0, destCtx.canvas.width, destCtx.canvas.height);
    return;
  }

  scratchCtx.globalCompositeOperation = 'source-over';
  scratchCtx.clearRect(0, 0, 765, 1024);

  if (colorHex) {
    // 1. Заливаем монохромную подложку цветом тинта
    scratchCtx.fillStyle = colorHex;
    scratchCtx.fillRect(0, 0, 765, 1024);

    // 2. Смешиваем умножением (multiply): черные линии остаются черными, белые блики яркими
    scratchCtx.globalCompositeOperation = 'multiply';
    scratchCtx.drawImage(img, 0, 0, 765, 1024);

    // 3. Восстанавливаем альфа-канал оригинального PNG
    scratchCtx.globalCompositeOperation = 'destination-in';
    scratchCtx.drawImage(img, 0, 0, 765, 1024);
  } else {
    // Без перекраски (чистый слой)
    scratchCtx.drawImage(img, 0, 0, 765, 1024);
  }

  // Обрезка торса и предплечий манекена под доспехами
  if (clipBody) {
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.fillRect(0, 600, 765, 424);
    scratchCtx.fillRect(0, 480, 160, 544);
    scratchCtx.fillRect(650, 480, 115, 544);
  }

  // Отрисовка на целевой canvas
  destCtx.drawImage(scratchCanvas, 0, 0, destCtx.canvas.width, destCtx.canvas.height);
}

/**
 * Рендерит послойный портрет на целевой HTML5 Canvas
 * @param {object} recipe
 * @param {HTMLCanvasElement} targetCanvas
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderPortraitToCanvas(recipe, targetCanvas) {
  if (!targetCanvas || !recipe) return null;
  const ctx = targetCanvas.getContext('2d');
  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

  // 1. Фон (Background)
  if (recipe.bg) {
    const bgImg = await loadLayerImage(`assets/images/portraits/layers/backgrounds/${recipe.bg}`);
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, targetCanvas.width, targetCanvas.height);
    }
  }

  // 2. Волосы сзади (Hair Back)
  if (recipe.hairBack) {
    const hbImg = await loadLayerImage(`assets/images/portraits/layers/hair_back/${recipe.hairBack}`);
    if (hbImg) drawTintedLayer(ctx, hbImg, recipe.hairColor);
  }

  // 3. Тело / Шея (Body) с отсечением торса под одеждой
  if (recipe.body) {
    const bodyImg = await loadLayerImage(`assets/images/portraits/layers/bodies/${recipe.body}`);
    if (bodyImg) drawTintedLayer(ctx, bodyImg, recipe.skinColor, recipe.occludeBody !== false);
  }

  // 4. Лайн-арт лица и склеры глаз (Face)
  if (recipe.face) {
    const faceImg = await loadLayerImage(`assets/images/portraits/layers/faces/${recipe.face}`);
    if (faceImg) drawTintedLayer(ctx, faceImg, null);
  }

  // 5. Радужки глаз (Irises)
  if (recipe.eyes) {
    const eyeImg = await loadLayerImage(`assets/images/portraits/layers/faces/${recipe.eyes}`);
    if (eyeImg) drawTintedLayer(ctx, eyeImg, recipe.eyeColor);
  }

  // 6. Шрам на щеке (Scar)
  if (recipe.scar) {
    const scarImg = await loadLayerImage(`assets/images/portraits/layers/accessories/${recipe.scar}`);
    if (scarImg) drawTintedLayer(ctx, scarImg, null);
  }

  // 7. Борода и усы (Beard)
  if (recipe.beard) {
    const beardImg = await loadLayerImage(`assets/images/portraits/layers/beards/${recipe.beard}`);
    if (beardImg) drawTintedLayer(ctx, beardImg, recipe.hairColor);
  }

  // 8. Одежда / Наплечники (Clothes)
  if (recipe.clothes) {
    const clothesImg = await loadLayerImage(`assets/images/portraits/layers/clothes/${recipe.clothes}`);
    if (clothesImg) drawTintedLayer(ctx, clothesImg, recipe.clothesColor);
  }

  // 9. Рога тифлинга (Horns)
  if (recipe.horns) {
    const hornsImg = await loadLayerImage(`assets/images/portraits/layers/accessories/${recipe.horns}`);
    if (hornsImg) drawTintedLayer(ctx, hornsImg, recipe.hornColor || PORTRAIT_PALETTES.horns.ram_dark);
  }

  // 10. Повязка на глаз (Eyepatch)
  if (recipe.eyepatch) {
    const epImg = await loadLayerImage(`assets/images/portraits/layers/accessories/${recipe.eyepatch}`);
    if (epImg) drawTintedLayer(ctx, epImg, null);
  }

  // 11. Волосы спереди (Hair Front)
  if (recipe.hairFront) {
    const hfImg = await loadLayerImage(`assets/images/portraits/layers/hair_front/${recipe.hairFront}`);
    if (hfImg) drawTintedLayer(ctx, hfImg, recipe.hairColor);
  }

  return targetCanvas;
}

let exportCanvas = null;

/**
 * Получить PNG Data URL портрета
 * @param {object} recipe
 * @param {object} [options]
 * @returns {Promise<string>}
 */
export async function renderPortraitDataUrl(recipe, options = {}) {
  if (typeof document === 'undefined') return '';
  const width = options.width || 765;
  const height = options.height || 1024;
  if (!exportCanvas) {
    exportCanvas = document.createElement('canvas');
  }
  exportCanvas.width = width;
  exportCanvas.height = height;

  await renderPortraitToCanvas(recipe, exportCanvas);
  return exportCanvas.toDataURL('image/png');
}

// ============================================================================
// 6. SVG ФОЛЛБЕК РЕНДЕРЕР (ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ)
// ============================================================================

export function renderPortraitSVG(recipe) {
  const p = PORTRAIT_PALETTES;
  const skinCol = p.skin[recipe.skinKey] || p.skin.fair;
  const hairCol = p.hair[recipe.hairKey] || p.hair.dark_brown;
  const clothesCol = p.clothes[recipe.clothesKey] || p.clothes.commoner_tan;
  const sc = p.stroke;
  const sw = p.strokeWidth;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%" class="procedural-portrait-svg">
  <rect width="200" height="240" rx="10" fill="#1c1a24" />
  <circle cx="100" cy="115" r="82" fill="#262332" stroke="#2e2b3b" stroke-width="2" />
  <g id="character-base">
    <path d="M 83 130 L 83 176 Q 100 186 117 176 L 117 130 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" />
    <path d="M 32 240 C 36 194, 68 172, 83 172 L 117 172 C 132 172, 164 194, 168 240 Z" fill="${clothesCol.main}" stroke="${sc}" stroke-width="${sw}" />
    <path d="M 68 85 C 68 55, 132 55, 132 85 C 132 120, 115 145, 100 145 C 85 145, 68 120, 68 85 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" />
    <circle cx="88" cy="98" r="3.5" fill="${recipe.eyeColorLeft || '#3b729f'}" />
    <circle cx="112" cy="98" r="3.5" fill="${recipe.eyeColorRight || '#3b729f'}" />
    <path d="M 98 98 L 102 110 L 97 112" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" />
    <path d="M 94 124 Q 100 128 106 124" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" />
  </g>
</svg>
  `.trim();
}

/**
 * Преобразует SVG в Data URL для установки в `<img src="...">` или фоном
 */
export function getPortraitDataUrl(recipe) {
  if (recipe && recipe._cachedDataUrl) {
    return recipe._cachedDataUrl;
  }
  const svg = renderPortraitSVG(recipe);
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
