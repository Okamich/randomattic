/**
 * Randomattic - D&D 5e Currency & Price Calculator
 * Стандартная монетная система D&D 5e:
 * - Медные монеты (CP - Copper Pieces) — базовая единица (1 cp)
 * - Серебряные монеты (SP - Silver Pieces) = 10 cp
 * - Электрумовые монеты (EP - Electrum Pieces) = 50 cp (5 sp)
 * - Золотые монеты (GP - Gold Pieces) = 100 cp (10 sp, 2 ep)
 * - Платиновые монеты (PP - Platinum Pieces) = 1000 cp (10 gp)
 */

export const COIN_RATES = {
  cp: 1,
  sp: 10,
  ep: 50,
  gp: 100,
  pp: 1000
};

export const COIN_NAMES = {
  ru: {
    cp: 'медн.',
    sp: 'серебр.',
    ep: 'электр.',
    gp: 'золот.',
    pp: 'платин.'
  },
  en: {
    cp: 'cp',
    sp: 'sp',
    ep: 'ep',
    gp: 'gp',
    pp: 'pp'
  }
};

/**
 * Перевести кошелек монет в общее количество медных монет (CP).
 * @param {object} coins Объект вида { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
 * @returns {number} Количество медных монет
 */
export function toCopper(coins = {}) {
  let copper = 0;
  if (coins.cp) copper += Number(coins.cp) * COIN_RATES.cp;
  if (coins.sp) copper += Number(coins.sp) * COIN_RATES.sp;
  if (coins.ep) copper += Number(coins.ep) * COIN_RATES.ep;
  if (coins.gp) copper += Number(coins.gp) * COIN_RATES.gp;
  if (coins.pp) copper += Number(coins.pp) * COIN_RATES.pp;
  return Math.max(0, Math.floor(copper));
}

/**
 * Оптимальный размен из медных монет по номиналам.
 * @param {number} copperCount Количество медных монет
 * @param {boolean} useElectrum Включать ли электрум (по умолчанию false, т.к. многие мастера его пропускают)
 * @returns {object} { pp, gp, ep, sp, cp }
 */
export function fromCopper(copperCount = 0, useElectrum = false) {
  let rem = Math.max(0, Math.floor(copperCount));

  const pp = Math.floor(rem / COIN_RATES.pp);
  rem %= COIN_RATES.pp;

  const gp = Math.floor(rem / COIN_RATES.gp);
  rem %= COIN_RATES.gp;

  let ep = 0;
  if (useElectrum) {
    ep = Math.floor(rem / COIN_RATES.ep);
    rem %= COIN_RATES.ep;
  }

  const sp = Math.floor(rem / COIN_RATES.sp);
  rem %= COIN_RATES.sp;

  const cp = rem;

  return { pp, gp, ep, sp, cp, totalCopper: copperCount };
}

/**
 * Конвертация из одной валюты в другую.
 * @param {number} amount Количество
 * @param {string} fromCoin Исходная валюта ('cp', 'sp', 'ep', 'gp', 'pp')
 * @param {string} toCoin Целевая валюта
 * @returns {number}
 */
export function convert(amount, fromCoin = 'gp', toCoin = 'cp') {
  const fromRate = COIN_RATES[fromCoin.toLowerCase()] || 1;
  const toRate = COIN_RATES[toCoin.toLowerCase()] || 1;
  const copper = Number(amount) * fromRate;
  return copper / toRate;
}

/**
 * Красивое форматирование монет в строку.
 * Например: { gp: 12, sp: 5, cp: 2 } -> "12 зм, 5 см, 2 мм"
 * @param {object} coins Объект монет
 * @param {string} lang 'ru' или 'en'
 * @returns {string}
 */
export function formatCoins(coins = {}, lang = 'ru') {
  const parts = [];
  const names = COIN_NAMES[lang] || COIN_NAMES.ru;

  if (coins.pp) parts.push(`${coins.pp} ${names.pp}`);
  if (coins.gp) parts.push(`${coins.gp} ${names.gp}`);
  if (coins.ep) parts.push(`${coins.ep} ${names.ep}`);
  if (coins.sp) parts.push(`${coins.sp} ${names.sp}`);
  if (coins.cp || parts.length === 0) parts.push(`${coins.cp || 0} ${names.cp}`);

  return parts.join(', ');
}

/**
 * Расчет сдачи при покупке.
 * @param {object} price Стоимость предмета (например, { gp: 5 })
 * @param {object} payment Чем заплатил игрок (например, { pp: 1 })
 * @returns {object} { canAfford, changeBreakdown, changeCopper }
 */
export function calculateChange(price, payment) {
  const priceCopper = toCopper(price);
  const paymentCopper = toCopper(payment);

  if (paymentCopper < priceCopper) {
    return {
      canAfford: false,
      deficitCopper: priceCopper - paymentCopper,
      change: fromCopper(0)
    };
  }

  const changeCopper = paymentCopper - priceCopper;
  return {
    canAfford: true,
    deficitCopper: 0,
    changeCopper,
    change: fromCopper(changeCopper)
  };
}

/**
 * Применить наценку или скидку к цене (например, за проверку Убеждения/Харизмы)
 * @param {object} price Цена { gp: 10 }
 * @param {number} percentPercentage Например: -15 (скидка 15%) или +20 (наценка 20%)
 * @returns {object} Новая цена с разбивкой по номиналам
 */
export function applyPriceModifier(price, percentPercentage = 0) {
  const baseCp = toCopper(price);
  const factor = 1 + (percentPercentage / 100);
  const adjustedCp = Math.max(1, Math.round(baseCp * factor));
  return fromCopper(adjustedCp);
}
