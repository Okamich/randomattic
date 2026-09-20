/**
 * Randomattic - D20 Tables Generator Module
 * Построен на основе официальных таблиц из files/D20/D20.xlsx
 */

import { D20_CATALOG } from '../data/d20-data.js';
import { rollDie } from '../utils/dice.js';
import { pickOne } from '../utils/random.js';

const DM_TIPS_BY_BADGE = {
  'Катаклизмы': 'Используйте это глобальное событие как катализатор новой сюжетной арки или внезапный вызов миру игроков.',
  'Аномалии': 'Дикая магия изменяет окружение! Опишите игрокам звуковые и визуальные искажения реальности.',
  'Интриги': 'Дайте игрокам намек или улику через случайного NPC или подслушанный в таверне разговор.',
  'Квесты': 'Сделайте эту зацепку ключевой целью для разведки или наградой за спасение пленника.',
  'Алхимия': 'Опишите цвет, запах и пузырьки зелья до того, как персонаж сделает первый глоток.',
  'Опасности': 'Убедитесь, что игроки ощущают смертельную угрозу до того, как сработает механизм.'
};

/**
 * Сгенерировать случайное событие из каталога D20 таблиц
 * @param {object} options { tableId: 'all' | string, rollNum?: number }
 * @returns {object}
 */
export function generateD20Event(options = {}) {
  let table = null;

  if (options.tableId && options.tableId !== 'all') {
    table = D20_CATALOG.find(t => t.id === options.tableId);
  }

  if (!table) {
    table = pickOne(D20_CATALOG);
  }

  const roll = (options.rollNum && options.rollNum >= 1 && options.rollNum <= 20)
    ? parseInt(options.rollNum, 10)
    : rollDie(20);

  // Ищем элемент с этим номером броска в таблице
  const item = table.items.find(it => String(it.roll) === String(roll)) || table.items[0];

  const dmTip = DM_TIPS_BY_BADGE[table.badge] || 'Импровизируйте с последствиями, поощряя креативные решения игроков.';

  return {
    tableId: table.id,
    tableTitle: table.title,
    tableDescription: table.description,
    icon: table.icon,
    badge: table.badge,
    badgeType: table.badgeType || 'dm',
    bgImage: table.bgImage,
    roll,
    text: item ? item.text : 'Событие не определено',
    dmTip,
    items: table.items || []
  };
}
