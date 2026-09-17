/**
 * Randomattic - Unified Utilities Facade
 * Единая точка доступа ко всем базовым утилитам системы.
 *
 * Пример использования:
 * import { dice, currency, random, storage } from '../utils/index.js';
 * // или
 * import { rollFormula, formatCoins, pickOne } from '../utils/index.js';
 */

import * as dice from './dice.js';
import * as currency from './currency.js';
import * as random from './random.js';
import { storage } from './storage.js';

export { dice, currency, random, storage };

// Прямой реэкспорт самых частых функций для максимального удобства:
export {
  rollDie,
  rollDice,
  rollFormula,
  rollAdvantage,
  rollDisadvantage,
  getDiceHistory,
  clearDiceHistory
} from './dice.js';

export {
  toCopper,
  fromCopper,
  convert,
  formatCoins,
  calculateChange,
  applyPriceModifier,
  COIN_RATES,
  COIN_NAMES
} from './currency.js';

export {
  randInt,
  pickOne,
  pickMultiple,
  weightedChoice,
  shuffle,
  chance
} from './random.js';
