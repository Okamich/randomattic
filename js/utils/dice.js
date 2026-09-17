/**
 * Randomattic - Dice Rolling Engine
 * Поддерживает стандартный набор D&D (d4, d6, d8, d10, d12, d20, d100),
 * парсинг формул бросков (например: "2d20kh1 + 1d8 + 4"), броски с преимуществом и историю.
 */

// Хранилище истории последних бросков (в памяти сессии)
const diceHistory = [];
const MAX_HISTORY_LENGTH = 50;

/**
 * Бросок одного кубика со сторонами sides.
 * @param {number} sides Количество граней (по умолчанию 20)
 * @param {boolean} record Записывать ли в историю бросков (по умолчанию true)
 * @returns {number}
 */
export function rollDie(sides = 20, record = true) {
  const s = Math.max(1, Math.floor(sides));
  const result = Math.floor(Math.random() * s) + 1;
  
  if (record) {
    const isCritSuccess = s === 20 && result === 20;
    const isCritFail = s === 20 && result === 1;
    recordRoll({
      type: 'single',
      sides: s,
      total: result,
      text: `1d${s} = ${result}${isCritSuccess ? ' (Критический успех!)' : ''}${isCritFail ? ' (Критический провал!)' : ''}`,
      isCritSuccess,
      isCritFail,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  return result;
}

/**
 * Бросок нескольких кубиков.
 * @param {number} count Количество кубиков
 * @param {number} sides Грани кубика
 * @returns {number[]} Массив выпавших значений
 */
export function rollDice(count = 1, sides = 20) {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides, false));
  }
  return rolls;
}

/**
 * Бросок d20 с преимуществом (Advantage): бросаем 2d20, берем максимальное.
 * @param {number} modifier Модификатор к броску (по умолчанию 0)
 * @returns {object} Результат с подробностями
 */
export function rollAdvantage(modifier = 0) {
  const d1 = rollDie(20);
  const d2 = rollDie(20);
  const selected = Math.max(d1, d2);
  const ignored = Math.min(d1, d2);
  const total = selected + modifier;
  const isCritSuccess = selected === 20;
  const isCritFail = selected === 1;

  const result = {
    type: 'advantage',
    rolls: [d1, d2],
    selected,
    ignored,
    modifier,
    total,
    isCritSuccess,
    isCritFail,
    text: `Advantage [${d1}, ${d2}] -> ${selected} ${modifier >= 0 ? '+' : ''}${modifier} = ${total}`,
    timestamp: new Date().toLocaleTimeString()
  };

  recordRoll(result);
  return result;
}

/**
 * Бросок d20 с помехой (Disadvantage): бросаем 2d20, берем минимальное.
 * @param {number} modifier Модификатор к броску (по умолчанию 0)
 * @returns {object} Результат с подробностями
 */
export function rollDisadvantage(modifier = 0) {
  const d1 = rollDie(20);
  const d2 = rollDie(20);
  const selected = Math.min(d1, d2);
  const ignored = Math.max(d1, d2);
  const total = selected + modifier;
  const isCritSuccess = selected === 20;
  const isCritFail = selected === 1;

  const result = {
    type: 'disadvantage',
    rolls: [d1, d2],
    selected,
    ignored,
    modifier,
    total,
    isCritSuccess,
    isCritFail,
    text: `Disadvantage [${d1}, ${d2}] -> ${selected} ${modifier >= 0 ? '+' : ''}${modifier} = ${total}`,
    timestamp: new Date().toLocaleTimeString()
  };

  recordRoll(result);
  return result;
}

/**
 * Парсер и исполнитель произвольных формул броска кубиков D&D.
 * Примеры формул:
 * - "d20"
 * - "1d20 + 5"
 * - "2d6 + 1d4 + 3"
 * - "2d20kh1 + 4" (преимущество через нотацию keep-highest)
 * - "2d20kl1" (помеха через нотацию keep-lowest)
 * - "4d6kh3" (генерация характеристик D&D)
 *
 * @param {string} formulaStr Формула броска
 * @returns {object} Результат броска
 */
export function rollFormula(formulaStr) {
  if (!formulaStr || typeof formulaStr !== 'string') {
    return { error: 'Неверный формат формулы', total: 0 };
  }

  const clean = formulaStr.toLowerCase().replace(/\s+/g, '');
  // Регулярное выражение для токенов: ([+-]?)(число d грань (kh/kl число)?) или просто ([+-]?число)
  // Токенизируем строку
  const regex = /([+-]?)(?:(\d*)d(\d+)(?:(kh|kl)(\d+)?)?|(\d+))/g;
  let match;
  let total = 0;
  const parts = [];

  while ((match = regex.exec(clean)) !== null) {
    const [fullMatch, signStr, countStr, sidesStr, keepType, keepCountStr, constantStr] = match;

    if (!fullMatch) break;

    const sign = signStr === '-' ? -1 : 1;

    if (constantStr !== undefined) {
      // Это константный модификатор (например, +3 или -2)
      const num = parseInt(constantStr, 10) * sign;
      total += num;
      parts.push({
        type: 'constant',
        value: num,
        sign: sign >= 0 ? '+' : '-',
        raw: `${sign >= 0 ? '+' : '-'}${Math.abs(num)}`
      });
    } else if (sidesStr !== undefined) {
      // Это бросок кубиков (например, 2d6 или 4d6kh3)
      const count = countStr ? parseInt(countStr, 10) : 1;
      const sides = parseInt(sidesStr, 10);
      const rawRolls = rollDice(count, sides);

      let keptRolls = [...rawRolls];
      let droppedRolls = [];

      if (keepType) {
        const keepCount = keepCountStr ? parseInt(keepCountStr, 10) : 1;
        const sorted = [...rawRolls].sort((a, b) => keepType === 'kh' ? b - a : a - b);
        keptRolls = sorted.slice(0, keepCount);
        droppedRolls = sorted.slice(keepCount);
      }

      const sum = keptRolls.reduce((a, b) => a + b, 0);
      const contribution = sum * sign;
      total += contribution;

      parts.push({
        type: 'dice',
        count,
        sides,
        rawRolls,
        keptRolls,
        droppedRolls,
        keepType,
        sum,
        contribution,
        sign: sign >= 0 ? '+' : '-'
      });
    }
  }

  // Человекочитаемое представление расчёта
  const breakdownStr = parts.map((p, idx) => {
    if (p.type === 'constant') {
      return (idx === 0 && p.value >= 0) ? `${p.value}` : `${p.sign} ${Math.abs(p.value)}`;
    }
    const rollsStr = `[${p.rawRolls.join(', ')}]`;
    const prefix = (idx === 0 && p.sign === '+') ? '' : `${p.sign} `;
    return `${prefix}${p.count}d${p.sides} ${rollsStr}${p.keepType ? ` (${p.sum})` : ''}`;
  }).join(' ');

  const result = {
    type: 'formula',
    formula: formulaStr,
    total,
    parts,
    breakdown: breakdownStr,
    text: `${formulaStr} = ${total} (${breakdownStr})`,
    timestamp: new Date().toLocaleTimeString()
  };

  recordRoll(result);
  return result;
}

/**
 * Записать бросок в историю
 */
function recordRoll(item) {
  diceHistory.unshift(item);
  if (diceHistory.length > MAX_HISTORY_LENGTH) {
    diceHistory.pop();
  }
}

/**
 * Получить историю бросков текущей сессии
 * @returns {object[]}
 */
export function getDiceHistory() {
  return [...diceHistory];
}

/**
 * Очистить историю бросков
 */
export function clearDiceHistory() {
  diceHistory.length = 0;
}
