/**
 * Randomattic - D20 Tables Generator Module
 * Построен на основе официальных таблиц из files/D20/D20.xlsx
 */

import { D20_CATALOG } from '../data/d20-data.js';
import { rollDie } from '../utils/dice.js';
import { pickOne } from '../utils/random.js';

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

  const roll = options.rollNum && options.rollNum >= 1 && options.rollNum <= 20
    ? options.rollNum
    : rollDie(20);

  // Ищем элемент с этим номером броска в таблице
  const item = table.items.find(it => String(it.roll) === String(roll)) || pickOne(table.items);

  return {
    tableId: table.id,
    tableTitle: table.title,
    tableDescription: table.description,
    icon: table.icon,
    badge: table.badge,
    bgImage: table.bgImage,
    roll,
    text: item ? item.text : 'Событие не определено'
  };
}
