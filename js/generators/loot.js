/**
 * Randomattic - Loot & Treasure Hoard Generator Module
 * Генерирует сокровища D&D 5e по CR (Уровням Опасности).
 */

import { rollFormula } from '../utils/dice.js';
import { formatCoins } from '../utils/currency.js';
import { pickOne, pickMultiple } from '../utils/random.js';

const GEMS = [
  'Азурит (10 зм)', 'Бирюза (10 зм)', 'Малахит (10 зм)', 'Хризоберилл (50 зм)',
  'Аметист (100 зм)', 'Жемчужина (100 зм)', 'Топаз (500 зм)', 'Сапфир (1000 зм)',
  'Рубин огненного блеска (1000 зм)', 'Алмаз чистой воды (5000 зм)'
];

const ART_OBJECTS = [
  'Серебряный кубок с гравировкой дракона (25 зм)',
  'Резная костяная статуэтка богини удачи (25 зм)',
  'Золотое кольцо с маленьким изумрудом (250 зм)',
  'Шелковый церемониальный плащ с золотой вышивкой (250 зм)',
  'Церемониальный кинжал в ножнах из драконьей чешуи (750 зм)',
  'Золотой ларец с гравировкой лунных фаз (750 зм)'
];

const MAGIC_ITEMS = [
  'Зелье Лечения (Potion of Healing, 2d4+2)',
  'Свиток заклинания: Огненный Шар (Fireball, 3 круг)',
  'Свиток заклинания: Невидимость (Invisibility, 2 круг)',
  'Сумка Хранения (Bag of Holding)',
  'Плащ Защиты (+1 к КД и спасброскам)',
  'Сапоги Эльфийской Походки',
  'Меч +1 с руническим свечением',
  'Кольцо Водного Дыхания'
];

/**
 * Сгенерировать сокровище
 * @param {object} options { crTier: '0-4', type: 'hoard'|'individual' }
 * @returns {object}
 */
export function generateLoot(options = {}) {
  const tier = options.crTier || '0-4';
  const type = options.type || 'hoard';

  let coins = {};
  let gemsList = [];
  let artsList = [];
  let magicList = [];

  if (type === 'individual') {
    // Карманная добыча монстра
    if (tier === '0-4') {
      const cpRoll = rollFormula('4d6').total;
      const spRoll = rollFormula('3d6').total;
      const gpRoll = rollFormula('2d6').total;
      coins = { cp: cpRoll, sp: spRoll, gp: gpRoll };
    } else if (tier === '5-10') {
      const spRoll = rollFormula('4d6 * 10').total;
      const gpRoll = rollFormula('2d6 * 10').total;
      coins = { sp: spRoll, gp: gpRoll };
    } else {
      const gpRoll = rollFormula('4d6 * 100').total;
      const ppRoll = rollFormula('1d6 * 10').total;
      coins = { gp: gpRoll, pp: ppRoll };
    }
  } else {
    // Сокровищница в сундуке (Hoard)
    if (tier === '0-4') {
      coins = {
        cp: rollFormula('6d6 * 100').total,
        sp: rollFormula('3d6 * 100').total,
        gp: rollFormula('2d6 * 10').total
      };
      gemsList = pickMultiple(GEMS.slice(0, 4), 2);
      artsList = pickMultiple(ART_OBJECTS.slice(0, 2), 1);
      magicList = [pickOne(MAGIC_ITEMS.slice(0, 3))];
    } else if (tier === '5-10') {
      coins = {
        cp: rollFormula('2d6 * 100').total,
        sp: rollFormula('2d6 * 1000').total,
        gp: rollFormula('6d6 * 100').total,
        pp: rollFormula('3d6 * 10').total
      };
      gemsList = pickMultiple(GEMS.slice(2, 7), 4);
      artsList = pickMultiple(ART_OBJECTS.slice(2, 5), 2);
      magicList = pickMultiple(MAGIC_ITEMS, 2);
    } else {
      coins = {
        gp: rollFormula('12d6 * 1000').total,
        pp: rollFormula('8d6 * 1000').total
      };
      gemsList = pickMultiple(GEMS.slice(5), 6);
      artsList = pickMultiple(ART_OBJECTS.slice(3), 3);
      magicList = pickMultiple(MAGIC_ITEMS.slice(3), 3);
    }
  }

  return {
    tier: `CR ${tier}`,
    type: type === 'hoard' ? 'Сокровищница логова (Сундук)' : 'Индивидуальная добыча',
    coinsFormatted: formatCoins(coins),
    gems: gemsList,
    arts: artsList,
    magicItems: magicList
  };
}
