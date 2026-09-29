/**
 * portrait-composer.js
 * Модульный процедурный генератор плоских векторных портретов (Flat Minimalist with Outline).
 * Создает выразительные SVG-портреты послойной сборкой (Paper Doll Technique)
 * с поддержкой рас, полов, черт лица, причесок, бород, аксессуаров и динамических палитр.
 */

// ============================================================================
// 1. ПАЛИТРЫ ЦВЕТОВ (PALETTES)
// ============================================================================
export const PORTRAIT_PALETTES = {
  skin: {
    pale: { fill: '#fcefe8', shadow: '#eacdc0', name: 'Бледная' },
    fair: { fill: '#f6d5be', shadow: '#e1b194', name: 'Светлая' },
    tan: { fill: '#de9f74', shadow: '#bf7d52', name: 'Смуглая / Загорелая' },
    bronze: { fill: '#b57448', shadow: '#96552c', name: 'Бронзовая' },
    dark: { fill: '#6d422a', shadow: '#502c18', name: 'Тёмная' },
    ebony: { fill: '#40271c', shadow: '#2d1810', name: 'Глубокая тёмная' },
    orc_green: { fill: '#809c69', shadow: '#5c7847', name: 'Зеленоватая (Полуорк)' },
    drow_grey: { fill: '#6c7582', shadow: '#4d5561', name: 'Пепельно-серая (Дроу)' },
    celestial_gold: { fill: '#fae3a2', shadow: '#dfbe68', name: 'Златистая' },
    tiefling_red: { fill: '#c25e5e', shadow: '#993f3f', name: 'Красноватая (Тифлинг)' }
  },

  hair: {
    black: { fill: '#242124', highlight: '#3f3a40', name: 'Черные' },
    dark_brown: { fill: '#3d2b1f', highlight: '#5c412f', name: 'Темно-каштановые' },
    chestnut: { fill: '#633924', highlight: '#855137', name: 'Каштановые' },
    auburn: { fill: '#8d3b25', highlight: '#b85337', name: 'Медно-рыжие' },
    ginger: { fill: '#d4652f', highlight: '#ea8652', name: 'Ярко-рыжие' },
    blonde: { fill: '#e6c369', highlight: '#f5dc95', name: 'Золотистый блонд' },
    platinum: { fill: '#e8e2d5', highlight: '#fbf9f5', name: 'Платиновый блонд' },
    grey: { fill: '#8f9499', highlight: '#b5bac0', name: 'С сединой' },
    white: { fill: '#e3e7eb', highlight: '#ffffff', name: 'Белоснежные' }
  },

  eyes: {
    brown: '#4a2f1b',
    dark_brown: '#2a170d',
    hazel: '#6b5329',
    amber: '#c9822b',
    green: '#3c7a4b',
    emerald: '#208c58',
    blue: '#3b729f',
    ice_blue: '#78b5e3',
    grey: '#606b74',
    violet: '#684587',
    red: '#962b2b'
  },

  clothes: {
    warrior_steel: { main: '#475569', trim: '#94a3b8', armor: true },
    leather_brown: { main: '#5d4037', trim: '#8d6e63', armor: false },
    rogue_dark: { main: '#1e293b', trim: '#334155', armor: false },
    mage_purple: { main: '#4a2574', trim: '#d4af37', armor: false },
    mage_crimson: { main: '#781d28', trim: '#e0a96d', armor: false },
    cleric_ivory: { main: '#e2dfd2', trim: '#cca43b', armor: false },
    ranger_green: { main: '#2e4c34', trim: '#5c432d', armor: false },
    commoner_tan: { main: '#7a604c', trim: '#a68a72', armor: false },
    noble_gold: { main: '#1c3144', trim: '#d4af37', armor: false }
  },

  stroke: '#1e1c1f',
  strokeWidth: 2.4
};

// ============================================================================
// 2. БАЗОВЫЕ ШАБЛОНЫ SVG СЛОЕВ (SVG PATH TEMPLATES)
// ============================================================================

/**
 * Фоновая плашка
 */
function renderBg(style, idPrefix) {
  const bgColors = {
    circle: { bg: '#1c1a24', ring: '#2e2b3b', spot: '#262332' },
    parchment: { bg: '#2b2219', ring: '#453525', spot: '#382b1d' },
    forest: { bg: '#13231b', ring: '#1f3b2e', spot: '#183025' },
    royal: { bg: '#241b2e', ring: '#3b2b4a', spot: '#30223d' }
  };
  const c = bgColors[style] || bgColors.circle;

  return `
    <rect width="200" height="240" rx="10" fill="${c.bg}" />
    <circle cx="100" cy="115" r="82" fill="${c.spot}" />
    <circle cx="100" cy="115" r="82" fill="none" stroke="${c.ring}" stroke-width="2" stroke-dasharray="4 4" />
  `;
}

/**
 * Волосы сзади (ниспадающие за плечи)
 */
function renderBackHair(type, hairCol, sw, sc) {
  if (!type || type === 'none' || type === 'short') return '';

  if (type === 'long_straight') {
    return `
      <g id="back-hair">
        <path d="M 64 85 C 50 110, 48 160, 52 205 C 58 206, 68 200, 72 175 L 72 110 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" />
        <path d="M 136 85 C 150 110, 152 160, 148 205 C 142 206, 132 200, 128 175 L 128 110 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" />
      </g>
    `;
  }

  if (type === 'long_wavy') {
    return `
      <g id="back-hair">
        <path d="M 64 85 C 45 110, 46 140, 54 165 C 48 180, 48 198, 56 215 C 64 216, 74 195, 74 170 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" />
        <path d="M 136 85 C 155 110, 154 140, 146 165 C 152 180, 152 198, 144 215 C 136 216, 126 195, 126 170 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" />
      </g>
    `;
  }

  if (type === 'braids') {
    return `
      <g id="back-hair">
        <path d="M 62 90 C 52 120, 50 170, 56 220 C 62 220, 68 210, 68 170 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" />
        <path d="M 138 90 C 148 120, 150 170, 144 220 C 138 220, 132 210, 132 170 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" />
      </g>
    `;
  }

  if (type === 'ponytail_high') {
    return `
      <g id="back-hair">
        <path d="M 100 48 C 130 30, 155 50, 150 85 C 140 85, 120 60, 100 56 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" />
      </g>
    `;
  }

  return '';
}

/**
 * Шея, тело и плечи
 */
function renderNeckAndBody(skinCol, clothesCol, sw, sc) {
  return `
    <g id="neck-and-body">
      <!-- Шея -->
      <path d="M 83 130 L 83 176 Q 100 186 117 176 L 117 130 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      <!-- Тень подбородка на шее -->
      <path d="M 83 134 Q 100 152 117 134 L 117 142 Q 100 160 83 142 Z" fill="${skinCol.shadow}" />

      <!-- Торс / Плечи -->
      <path d="M 32 240 C 36 194, 68 172, 83 172 L 117 172 C 132 172, 164 194, 168 240 Z" fill="${clothesCol.main}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
    </g>
  `;
}

/**
 * Одежда (воротник, доспехи, мантия)
 */
function renderClothes(type, clothesCol, sw, sc) {
  if (type === 'armor') {
    return `
      <g id="clothes-overlay">
        <!-- Наплечники -->
        <path d="M 32 240 C 35 200, 58 184, 76 182 L 68 240 Z" fill="${clothesCol.trim}" stroke="${sc}" stroke-width="${sw}" />
        <path d="M 168 240 C 165 200, 142 184, 124 182 L 132 240 Z" fill="${clothesCol.trim}" stroke="${sc}" stroke-width="${sw}" />
        <!-- Горжет / нагрудник -->
        <path d="M 76 178 L 100 196 L 124 178 L 118 240 L 82 240 Z" fill="${clothesCol.main}" stroke="${sc}" stroke-width="${sw}" />
        <circle cx="100" cy="214" r="4" fill="${clothesCol.trim}" stroke="${sc}" stroke-width="1.5" />
      </g>
    `;
  }

  if (type === 'robe') {
    return `
      <g id="clothes-overlay">
        <!-- Стоячий воротник мантии -->
        <path d="M 74 158 L 84 184 L 100 240 L 116 184 L 126 158 C 120 168, 114 176, 100 176 C 86 176, 80 168, 74 158 Z" fill="${clothesCol.trim}" stroke="${sc}" stroke-width="${sw}" />
        <path d="M 96 184 L 100 240 L 104 184 Z" fill="${clothesCol.main}" stroke="${sc}" stroke-width="${sw}" />
      </g>
    `;
  }

  if (type === 'hood_down') {
    return `
      <g id="clothes-overlay">
        <!-- Спущенный капюшон вокруг шеи -->
        <path d="M 70 170 C 60 185, 75 205, 100 205 C 125 205, 140 185, 130 170 C 120 186, 80 186, 70 170 Z" fill="${clothesCol.trim}" stroke="${sc}" stroke-width="${sw}" />
      </g>
    `;
  }

  // По умолчанию: простая рубаха / туника с треугольным вырезом
  return `
    <g id="clothes-overlay">
      <path d="M 83 172 L 100 198 L 117 172" fill="none" stroke="${sc}" stroke-width="${sw}" />
      <path d="M 100 198 L 100 240" fill="none" stroke="${clothesCol.trim}" stroke-width="${sw}" stroke-dasharray="3 3" />
      <path d="M 78 174 Q 100 188 122 174" fill="none" stroke="${clothesCol.trim}" stroke-width="2" />
    </g>
  `;
}

/**
 * Форма головы / челюсти
 */
function renderHead(shape, skinCol, sw, sc) {
  if (shape === 'square') {
    // Мужественная широкая челюсть (воин, дварф)
    return `
      <path id="head-base" d="M 68 85 C 68 52, 132 52, 132 85 C 132 116, 126 142, 115 147 L 85 147 C 74 142, 68 116, 68 85 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
    `;
  }

  if (shape === 'pointed') {
    // Утонченное заостренное лицо (эльф, полуэльф)
    return `
      <path id="head-base" d="M 70 85 C 70 54, 130 54, 130 85 C 130 115, 116 145, 100 153 C 84 145, 70 115, 70 85 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
    `;
  }

  if (shape === 'round') {
    // Круглое добродушное лицо (халфлинг, гном, пухлый)
    return `
      <path id="head-base" d="M 64 88 C 64 58, 136 58, 136 88 C 136 122, 126 150, 100 151 C 74 150, 64 122, 64 88 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
    `;
  }

  // Овальное классическое
  return `
    <path id="head-base" d="M 68 85 C 68 54, 132 54, 132 85 C 132 118, 122 148, 100 150 C 78 148, 68 118, 68 85 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
  `;
}

/**
 * Уши (человеческие или эльфийские)
 */
function renderEars(type, skinCol, sw, sc) {
  if (type === 'elf_pointy') {
    return `
      <g id="ears">
        <!-- Левое эльфийское ухо -->
        <path d="M 69 105 C 52 100, 38 78, 48 73 C 58 76, 68 91, 69 107 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
        <path d="M 58 84 Q 54 93 67 98" fill="none" stroke="${skinCol.shadow}" stroke-width="1.8" />

        <!-- Правое эльфийское ухо -->
        <path d="M 131 105 C 148 100, 162 78, 152 73 C 142 76, 132 91, 131 107 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
        <path d="M 142 84 Q 146 93 133 98" fill="none" stroke="${skinCol.shadow}" stroke-width="1.8" />
      </g>
    `;
  }

  if (type === 'halfelf_short_point') {
    return `
      <g id="ears">
        <path d="M 69 105 C 56 100, 46 86, 54 82 C 60 84, 68 93, 69 107 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
        <path d="M 131 105 C 144 100, 154 86, 146 82 C 140 84, 132 93, 131 107 Z" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      </g>
    `;
  }

  // Обычные человеческие круглые
  return `
    <g id="ears">
      <path d="M 68 95 C 57 95, 57 115, 69 118" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      <path d="M 65 102 C 63 105, 64 110, 68 112" fill="none" stroke="${skinCol.shadow}" stroke-width="1.6" />
      <path d="M 132 95 C 143 95, 143 115, 131 118" fill="${skinCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      <path d="M 135 102 C 137 105, 136 110, 132 112" fill="none" stroke="${skinCol.shadow}" stroke-width="1.6" />
    </g>
  `;
}

/**
 * Глаза и брови
 */
function renderEyesAndBrows(eyeType, browType, leftColor, rightColor, sw, sc) {
  let leftIris = leftColor || '#4a2f1b';
  let rightIris = rightColor || leftIris;

  let eyePath = '';
  if (eyeType === 'squint') {
    // Прищуренные, суровые
    eyePath = `
      <!-- Левый глаз -->
      <path d="M 78 103 Q 86 98 94 103 Q 86 107 78 103 Z" fill="#ffffff" stroke="${sc}" stroke-width="${sw}" />
      <circle cx="86" cy="103" r="2.8" fill="${leftIris}" />
      <circle cx="87" cy="102" r="0.8" fill="#ffffff" />
      <!-- Правый глаз -->
      <path d="M 106 103 Q 114 98 122 103 Q 114 107 106 103 Z" fill="#ffffff" stroke="${sc}" stroke-width="${sw}" />
      <circle cx="114" cy="103" r="2.8" fill="${rightIris}" />
      <circle cx="115" cy="102" r="0.8" fill="#ffffff" />
    `;
  } else if (eyeType === 'wide_round') {
    // Большие круглые (молодой, любопытный)
    eyePath = `
      <path d="M 77 103 C 77 97, 95 97, 95 103 C 95 109, 77 109, 77 103 Z" fill="#ffffff" stroke="${sc}" stroke-width="${sw}" />
      <circle cx="86" cy="103" r="3.6" fill="${leftIris}" />
      <circle cx="87" cy="102" r="1.1" fill="#ffffff" />
      <path d="M 105 103 C 105 97, 123 97, 123 103 C 123 109, 105 109, 105 103 Z" fill="#ffffff" stroke="${sc}" stroke-width="${sw}" />
      <circle cx="114" cy="103" r="3.6" fill="${rightIris}" />
      <circle cx="115" cy="102" r="1.1" fill="#ffffff" />
    `;
  } else {
    // Классические миндалевидные
    eyePath = `
      <path d="M 77 103 Q 86 97 95 103 Q 86 108 77 103 Z" fill="#ffffff" stroke="${sc}" stroke-width="${sw}" />
      <circle cx="86" cy="103" r="3.2" fill="${leftIris}" />
      <circle cx="87" cy="101.8" r="1" fill="#ffffff" />
      <path d="M 105 103 Q 114 97 123 103 Q 114 108 105 103 Z" fill="#ffffff" stroke="${sc}" stroke-width="${sw}" />
      <circle cx="114" cy="103" r="3.2" fill="${rightIris}" />
      <circle cx="115" cy="101.8" r="1" fill="#ffffff" />
    `;
  }

  let browPath = '';
  if (browType === 'thick') {
    browPath = `
      <path d="M 74 94 Q 85 91 96 95" fill="none" stroke="${sc}" stroke-width="3.5" stroke-linecap="round" />
      <path d="M 104 95 Q 115 91 126 94" fill="none" stroke="${sc}" stroke-width="3.5" stroke-linecap="round" />
    `;
  } else if (browType === 'angry') {
    browPath = `
      <path d="M 75 91 L 95 96" fill="none" stroke="${sc}" stroke-width="2.6" stroke-linecap="round" />
      <path d="M 105 96 L 125 91" fill="none" stroke="${sc}" stroke-width="2.6" stroke-linecap="round" />
    `;
  } else if (browType === 'arched') {
    browPath = `
      <path d="M 76 96 Q 86 89 95 95" fill="none" stroke="${sc}" stroke-width="2.2" stroke-linecap="round" />
      <path d="M 105 95 Q 114 89 124 96" fill="none" stroke="${sc}" stroke-width="2.2" stroke-linecap="round" />
    `;
  } else {
    // Спокойные обычные
    browPath = `
      <path d="M 76 95 Q 86 92 95 95" fill="none" stroke="${sc}" stroke-width="2.4" stroke-linecap="round" />
      <path d="M 105 95 Q 114 92 124 95" fill="none" stroke="${sc}" stroke-width="2.4" stroke-linecap="round" />
    `;
  }

  return `
    <g id="eyes-and-brows">
      ${eyePath}
      ${browPath}
    </g>
  `;
}

/**
 * Нос
 */
function renderNose(type, sw, sc) {
  if (type === 'aquiline') {
    // Орлиный / горбинка
    return `
      <path id="nose" d="M 99 98 L 97 114 L 94 122 Q 100 126 104 122" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />
    `;
  }

  if (type === 'button') {
    // Курносый / кнопка
    return `
      <path id="nose" d="M 99 108 L 98 118 Q 100 123 103 120" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />
    `;
  }

  if (type === 'broad') {
    // Широкий / мощный
    return `
      <path id="nose" d="M 98 106 L 96 119 C 93 124, 107 124, 104 119" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />
    `;
  }

  // Прямой классический
  return `
    <path id="nose" d="M 99 100 L 97 120 Q 100 124 104 120" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" />
  `;
}

/**
 * Рот
 */
function renderMouth(type, sw, sc) {
  if (type === 'smile') {
    return `
      <path id="mouth" d="M 90 137 Q 100 145 110 137" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" />
    `;
  }

  if (type === 'smirk') {
    return `
      <path id="mouth" d="M 91 139 Q 100 140 111 135" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" />
    `;
  }

  if (type === 'frown') {
    return `
      <path id="mouth" d="M 91 141 Q 100 136 109 141" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" />
    `;
  }

  if (type === 'orc_tusks') {
    return `
      <g id="mouth">
        <path d="M 91 139 L 109 139" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" />
        <!-- Клыки -->
        <polygon points="93,140 95,134 97,140" fill="#ffffff" stroke="${sc}" stroke-width="1.4" />
        <polygon points="103,140 105,134 107,140" fill="#ffffff" stroke="${sc}" stroke-width="1.4" />
      </g>
    `;
  }

  // Нейтральный
  return `
    <path id="mouth" d="M 92 138 L 108 138" fill="none" stroke="${sc}" stroke-width="${sw}" stroke-linecap="round" />
  `;
}

/**
 * Морщины (активируются при зрелом или пожилом возрасте)
 */
function renderWrinkles(ageStage, sc) {
  if (ageStage !== 'old' && ageStage !== 'mature') return '';

  const alpha = ageStage === 'old' ? '0.45' : '0.22';
  return `
    <g id="wrinkles" stroke="${sc}" stroke-width="1.5" stroke-linecap="round" opacity="${alpha}">
      <!-- Лоб -->
      <path d="M 84 72 Q 100 70 116 72" fill="none" />
      <path d="M 88 77 Q 100 75 112 77" fill="none" />
      <!-- Носогубные складки -->
      <path d="M 87 124 Q 85 133 88 141" fill="none" />
      <path d="M 113 124 Q 115 133 112 141" fill="none" />
      <!-- Уголки глаз -->
      <path d="M 75 101 L 71 100" fill="none" />
      <path d="M 125 101 L 129 100" fill="none" />
    </g>
  `;
}

/**
 * Растительность на лице (борода, усы, щетина)
 */
function renderBeard(type, hairCol, sw, sc) {
  if (!type || type === 'none') return '';

  if (type === 'stubble') {
    return `
      <g id="beard" opacity="0.35">
        <circle cx="90" cy="144" r="0.8" fill="${sc}" />
        <circle cx="94" cy="145" r="0.8" fill="${sc}" />
        <circle cx="100" cy="146" r="0.8" fill="${sc}" />
        <circle cx="106" cy="145" r="0.8" fill="${sc}" />
        <circle cx="110" cy="144" r="0.8" fill="${sc}" />
        <circle cx="97" cy="134" r="0.8" fill="${sc}" />
        <circle cx="103" cy="134" r="0.8" fill="${sc}" />
      </g>
    `;
  }

  if (type === 'goatee') {
    return `
      <g id="beard">
        <!-- Усы -->
        <path d="M 91 135 Q 96 132 100 135 Q 104 132 109 135" fill="none" stroke="${sc}" stroke-width="2.6" stroke-linecap="round" />
        <!-- Эспаньолка на подбородке -->
        <path d="M 95 142 L 105 142 L 100 152 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      </g>
    `;
  }

  if (type === 'full_bushy') {
    return `
      <g id="beard">
        <!-- Пышная борода от челюсти вниз -->
        <path d="M 68 112 C 68 155, 78 175, 100 176 C 122 175, 132 155, 132 112 C 124 135, 116 148, 100 148 C 84 148, 76 135, 68 112 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
        <!-- Усы -->
        <path d="M 88 135 Q 100 130 100 135 Q 100 130 112 135 C 108 141, 92 141, 88 135 Z" fill="${hairCol.highlight}" stroke="${sc}" stroke-width="2" stroke-linejoin="round" />
      </g>
    `;
  }

  if (type === 'dwarf_long') {
    return `
      <g id="beard">
        <!-- Длинная дварфийская борода с кольцом -->
        <path d="M 68 112 C 65 160, 80 215, 100 220 C 120 215, 135 160, 132 112 C 124 135, 114 145, 100 145 C 86 145, 76 135, 68 112 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
        <!-- Золотое кольцо в бороде -->
        <rect x="94" y="198" width="12" height="6" rx="2" fill="#e6c369" stroke="${sc}" stroke-width="1.6" />
        <!-- Усы -->
        <path d="M 86 135 Q 100 128 114 135 Q 100 142 86 135 Z" fill="${hairCol.highlight}" stroke="${sc}" stroke-width="2" stroke-linejoin="round" />
      </g>
    `;
  }

  return '';
}

/**
 * Волосы спереди (челка, прическа)
 */
function renderFrontHair(type, hairCol, sw, sc) {
  if (!type || type === 'bald') {
    // Лысина с бликом
    return `
      <g id="hair-front">
        <path d="M 88 64 Q 96 60 105 62" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" />
      </g>
    `;
  }

  if (type === 'short_crop') {
    return `
      <g id="hair-front">
        <path d="M 67 85 C 64 52, 136 52, 133 85 C 125 74, 115 78, 100 75 C 85 78, 75 74, 67 85 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      </g>
    `;
  }

  if (type === 'side_part') {
    return `
      <g id="hair-front">
        <path d="M 67 85 C 64 50, 136 50, 133 85 C 122 70, 105 68, 92 78 C 82 72, 74 76, 67 85 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      </g>
    `;
  }

  if (type === 'messy_bangs') {
    return `
      <g id="hair-front">
        <path d="M 67 86 C 64 48, 136 48, 133 86 C 127 75, 122 88, 115 78 C 108 88, 102 76, 94 86 C 88 78, 80 88, 75 78 C 70 85, 67 86, 67 86 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      </g>
    `;
  }

  if (type === 'elf_swept') {
    return `
      <g id="hair-front">
        <path d="M 66 86 C 65 48, 135 48, 134 86 C 125 68, 110 65, 100 74 C 90 65, 75 68, 66 86 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      </g>
    `;
  }

  if (type === 'long_part') {
    return `
      <g id="hair-front">
        <path d="M 65 88 C 64 46, 136 46, 135 88 C 128 72, 116 80, 100 78 C 84 80, 72 72, 65 88 Z" fill="${hairCol.fill}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
        <!-- Пряди по бокам лица -->
        <path d="M 67 86 C 67 110, 72 135, 75 145 C 76 130, 72 105, 72 86 Z" fill="${hairCol.highlight}" />
        <path d="M 133 86 C 133 110, 128 135, 125 145 C 124 130, 128 105, 128 86 Z" fill="${hairCol.highlight}" />
      </g>
    `;
  }

  return '';
}

/**
 * Особые приметы (шрамы, очки, повязка на глаз, рога тифлинга)
 */
function renderAccessories(accType, raceKey, sw, sc) {
  let res = '';

  // Рога тифлинга
  if (raceKey === 'tiefling') {
    res += `
      <g id="tiefling-horns">
        <path d="M 76 65 C 65 40, 55 25, 45 28 C 50 42, 64 56, 72 68 Z" fill="#4a2530" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
        <path d="M 124 65 C 135 40, 145 25, 155 28 C 150 42, 136 56, 128 68 Z" fill="#4a2530" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round" />
      </g>
    `;
  }

  if (!accType || accType === 'none') return res;

  if (accType === 'scar_eye') {
    res += `
      <path id="scar" d="M 86 88 L 86 114" fill="none" stroke="#ab4444" stroke-width="2" stroke-linecap="round" opacity="0.85" />
    `;
  }

  if (accType === 'scar_cheek') {
    res += `
      <path id="scar" d="M 75 118 L 86 128" fill="none" stroke="#ab4444" stroke-width="2.2" stroke-linecap="round" opacity="0.85" />
    `;
  }

  if (accType === 'eyepatch') {
    res += `
      <g id="eyepatch">
        <path d="M 68 85 L 126 114" fill="none" stroke="${sc}" stroke-width="2" />
        <path d="M 78 102 C 78 95, 94 95, 94 102 C 94 110, 78 110, 78 102 Z" fill="#1e1e24" stroke="${sc}" stroke-width="2" />
      </g>
    `;
  }

  if (accType === 'earring') {
    res += `
      <circle cx="62" cy="115" r="3.5" fill="none" stroke="#d4af37" stroke-width="1.8" />
    `;
  }

  if (accType === 'freckles') {
    res += `
      <g id="freckles" fill="#ab7552" opacity="0.6">
        <circle cx="83" cy="112" r="0.9" />
        <circle cx="87" cy="114" r="0.9" />
        <circle cx="91" cy="113" r="0.9" />
        <circle cx="109" cy="113" r="0.9" />
        <circle cx="113" cy="114" r="0.9" />
        <circle cx="117" cy="112" r="0.9" />
      </g>
    `;
  }

  return res;
}

// ============================================================================
// 3. АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ РЕЦЕПТА ИЗ ДАННЫХ НИП (RECIPE BUILDER)
// ============================================================================

/**
 * Создаёт рецепт портрета на основе объекта NPC (из generateFullNPC)
 */
export function buildPortraitRecipeFromNPC(npc) {
  const race = npc?.raceKey || 'human';
  const gender = npc?.gender || 'Мужчина';
  const isMale = gender === 'Мужчина';
  const age = typeof npc?.age === 'number' ? npc.age : 30;
  const ageStage = npc?.ageStage || (age > 60 ? 'old' : (age > 35 ? 'mature' : 'young'));
  const traits = npc?.extendedTraits;

  // 1. Тон кожи
  let skinKey = 'fair';
  if (race === 'halforc') skinKey = 'orc_green';
  else if (race === 'tiefling') skinKey = 'tiefling_red';
  else if (race === 'elf' || race === 'halfelf') skinKey = Math.random() > 0.5 ? 'pale' : 'fair';
  else if (race === 'dwarf') skinKey = Math.random() > 0.4 ? 'tan' : 'fair';
  else {
    const tones = ['fair', 'pale', 'tan', 'bronze', 'dark'];
    skinKey = tones[Math.floor(Math.random() * tones.length)];
  }

  // 2. Цвет волос (с учетом возраста)
  let hairKey = 'dark_brown';
  if (ageStage === 'old' || age > 65) {
    hairKey = Math.random() > 0.3 ? 'grey' : 'white';
  } else if (race === 'elf') {
    const elfColors = ['platinum', 'golden', 'silver', 'black', 'dark_brown'];
    hairKey = elfColors[Math.floor(Math.random() * elfColors.length)] || 'platinum';
    if (hairKey === 'golden') hairKey = 'blonde';
    if (hairKey === 'silver') hairKey = 'white';
  } else {
    const standardColors = ['black', 'dark_brown', 'chestnut', 'auburn', 'ginger', 'blonde'];
    hairKey = standardColors[Math.floor(Math.random() * standardColors.length)];
  }

  // 3. Форма головы
  let headShape = 'oval';
  if (race === 'dwarf' || (race === 'halforc' && isMale)) headShape = 'square';
  else if (race === 'elf') headShape = 'pointed';
  else if (race === 'halfling' || race === 'gnome') headShape = 'round';
  else {
    const shapes = ['oval', 'square', 'pointed', 'round'];
    headShape = shapes[Math.floor(Math.random() * shapes.length)];
  }

  // 4. Уши
  let earType = 'human_round';
  if (race === 'elf' || race === 'tiefling') earType = 'elf_pointy';
  else if (race === 'halfelf') earType = 'halfelf_short_point';
  else if (race === 'gnome') earType = 'halfelf_short_point';

  // 5. Нос (синхронизируется с npc.extendedTraits.face.nose, если есть)
  let noseType = 'straight';
  const noseText = traits?.face?.nose?.textRu || '';
  if (noseText.includes('Орлиный') || noseText.includes('горбинк') || noseText.includes('крючковат')) {
    noseType = 'aquiline';
  } else if (noseText.includes('Курносый') || noseText.includes('кнопк') || noseText.includes('аккурат')) {
    noseType = 'button';
  } else if (noseText.includes('Широкий') || noseText.includes('приплюсн') || noseText.includes('сломан')) {
    noseType = 'broad';
  } else {
    const noses = ['straight', 'aquiline', 'button', 'broad'];
    noseType = noses[Math.floor(Math.random() * noses.length)];
  }

  // 6. Глаза (цвет и форма)
  let eyeColorLeft = PORTRAIT_PALETTES.eyes.brown;
  let eyeColorRight = eyeColorLeft;
  const eyesText = traits?.face?.eyes?.textRu || '';
  if (eyesText.includes('Гетерохромия')) {
    eyeColorLeft = PORTRAIT_PALETTES.eyes.blue;
    eyeColorRight = PORTRAIT_PALETTES.eyes.hazel;
  } else if (eyesText.includes('Голуб') || eyesText.includes('синие')) {
    eyeColorLeft = eyeColorRight = PORTRAIT_PALETTES.eyes.ice_blue;
  } else if (eyesText.includes('Зелен') || eyesText.includes('изумруд')) {
    eyeColorLeft = eyeColorRight = PORTRAIT_PALETTES.eyes.emerald;
  } else if (eyesText.includes('Серые')) {
    eyeColorLeft = eyeColorRight = PORTRAIT_PALETTES.eyes.grey;
  } else if (eyesText.includes('Янтар') || eyesText.includes('желтые')) {
    eyeColorLeft = eyeColorRight = PORTRAIT_PALETTES.eyes.amber;
  } else {
    const eyeColors = Object.values(PORTRAIT_PALETTES.eyes);
    eyeColorLeft = eyeColorRight = eyeColors[Math.floor(Math.random() * eyeColors.length)];
  }

  let eyeShape = 'almond';
  if (race === 'halforc' || ageStage === 'old') eyeShape = 'squint';
  else if (race === 'gnome' || race === 'halfling' || ageStage === 'young') eyeShape = 'wide_round';

  let browType = isMale ? (headShape === 'square' ? 'thick' : 'calm') : 'arched';
  if (race === 'halforc') browType = 'angry';

  // 7. Рот
  let mouthType = 'neutral';
  if (race === 'halforc') mouthType = 'orc_tusks';
  else {
    const mouths = ['neutral', 'smile', 'smirk', 'frown'];
    mouthType = mouths[Math.floor(Math.random() * mouths.length)];
  }

  // 8. Прическа и борода
  let frontHair = 'short_crop';
  let backHair = 'none';

  const hairText = traits?.face?.hair?.textRu || '';
  if (hairText.includes('Лыс') || hairText.includes('Брит')) {
    frontHair = 'bald';
    backHair = 'none';
  } else if (hairText.includes('Длинн') || hairText.includes('кос')) {
    frontHair = 'long_part';
    backHair = Math.random() > 0.5 ? 'long_wavy' : 'long_straight';
  } else if (race === 'elf') {
    frontHair = 'elf_swept';
    backHair = 'long_straight';
  } else {
    const hairChoices = isMale
      ? ['short_crop', 'side_part', 'messy_bangs', 'bald', 'long_part']
      : ['long_part', 'messy_bangs', 'side_part'];
    frontHair = hairChoices[Math.floor(Math.random() * hairChoices.length)];
    if (frontHair === 'long_part') backHair = 'long_wavy';
  }

  // Борода (только для мужчин)
  let beard = 'none';
  if (isMale) {
    if (race === 'dwarf') {
      beard = Math.random() > 0.3 ? 'dwarf_long' : 'full_bushy';
    } else if (race !== 'elf') {
      const beards = ['none', 'none', 'stubble', 'goatee', 'full_bushy'];
      beard = beards[Math.floor(Math.random() * beards.length)];
    }
  }

  // 9. Одежда (зависит от профессии)
  let clothesKey = 'commoner_tan';
  let clothesStyle = 'tunic';
  const profRole = (npc?.profession?.role || '').toLowerCase();
  const profTitle = (npc?.profession?.title || '').toLowerCase();

  if (profRole.includes('воин') || profRole.includes('страж') || profRole.includes('боец') || profTitle.includes('кузнец')) {
    clothesKey = 'warrior_steel';
    clothesStyle = 'armor';
  } else if (profRole.includes('маг') || profRole.includes('волшеб') || profRole.includes('чародей')) {
    clothesKey = 'mage_purple';
    clothesStyle = 'robe';
  } else if (profRole.includes('жрец') || profRole.includes('священник') || profTitle.includes('монах')) {
    clothesKey = 'cleric_ivory';
    clothesStyle = 'robe';
  } else if (profRole.includes('вор') || profRole.includes('убийца') || profRole.includes('разбой')) {
    clothesKey = 'rogue_dark';
    clothesStyle = 'hood_down';
  } else if (profRole.includes('следопыт') || profRole.includes('охотник') || profRole.includes('егерь')) {
    clothesKey = 'ranger_green';
    clothesStyle = 'tunic';
  }

  // 10. Особые приметы (аксессуары)
  let accessory = 'none';
  const scarText = traits?.physical?.scar?.textRu || '';
  if (scarText.includes('глаз') || scarText.includes('лицо')) {
    accessory = Math.random() > 0.4 ? 'scar_eye' : 'scar_cheek';
  } else if (Math.random() < 0.25) {
    const accs = ['none', 'earring', 'freckles', 'scar_cheek'];
    accessory = accs[Math.floor(Math.random() * accs.length)];
  }

  return {
    raceKey: race,
    gender,
    ageStage,
    skinKey,
    hairKey,
    headShape,
    earType,
    noseType,
    mouthType,
    eyeShape,
    browType,
    eyeColorLeft,
    eyeColorRight,
    frontHair,
    backHair,
    beard,
    clothesKey,
    clothesStyle,
    accessory,
    flip: Math.random() > 0.5,
    bgStyle: 'circle'
  };
}

// ============================================================================
// 4. КОМПОЗИТОР SVG (RENDERER)
// ============================================================================

/**
 * Рендерит законченную SVG-строку на основе рецепта
 */
export function renderPortraitSVG(recipe) {
  const p = PORTRAIT_PALETTES;
  const skinCol = p.skin[recipe.skinKey] || p.skin.fair;
  const hairCol = p.hair[recipe.hairKey] || p.hair.dark_brown;
  const clothesCol = p.clothes[recipe.clothesKey] || p.clothes.commoner_tan;
  const sc = p.stroke;
  const sw = p.strokeWidth;

  const flipTransform = recipe.flip ? 'transform="translate(200, 0) scale(-1, 1)"' : '';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%" class="procedural-portrait-svg">
  <!-- 1. Фоновая плашка -->
  ${renderBg(recipe.bgStyle)}

  <!-- Персонаж с возможностью горизонтального разворота -->
  <g id="character-layers" ${flipTransform}>
    <!-- 2. Волосы сзади -->
    ${renderBackHair(recipe.backHair, hairCol, sw, sc)}

    <!-- 3. Шея и тело -->
    ${renderNeckAndBody(skinCol, clothesCol, sw, sc)}

    <!-- 4. Одежда -->
    ${renderClothes(recipe.clothesStyle, clothesCol, sw, sc)}

    <!-- 5. Форма головы -->
    ${renderHead(recipe.headShape, skinCol, sw, sc)}

    <!-- 6. Уши -->
    ${renderEars(recipe.earType, skinCol, sw, sc)}

    <!-- 7. Глаза и брови -->
    ${renderEyesAndBrows(recipe.eyeShape, recipe.browType, recipe.eyeColorLeft, recipe.eyeColorRight, sw, sc)}

    <!-- 8. Нос -->
    ${renderNose(recipe.noseType, sw, sc)}

    <!-- 9. Рот -->
    ${renderMouth(recipe.mouthType, sw, sc)}

    <!-- 10. Морщины (если применимо) -->
    ${renderWrinkles(recipe.ageStage, sc)}

    <!-- 11. Растительность на лице (борода / усы) -->
    ${renderBeard(recipe.beard, hairCol, sw, sc)}

    <!-- 12. Волосы спереди (челка, прическа) -->
    ${renderFrontHair(recipe.frontHair, hairCol, sw, sc)}

    <!-- 13. Особые приметы (рога, шрамы, серьги) -->
    ${renderAccessories(recipe.accessory, recipe.raceKey, sw, sc)}
  </g>
</svg>
  `.trim();
}

/**
 * Преобразует SVG в Data URL для установки в `<img src="...">` или фоном
 */
export function getPortraitDataUrl(recipe) {
  const svg = renderPortraitSVG(recipe);
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
