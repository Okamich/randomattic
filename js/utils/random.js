/**
 * Randomattic - Random Utilities
 * Набор надежных функций генерации случайных данных для таблиц, лута и текстов.
 */

/**
 * Случайное целое число в диапазоне [min, max] включительно.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randInt(min, max) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

/**
 * Выбор одного случайного элемента из массива.
 * @template T
 * @param {T[]} array
 * @returns {T|null}
 */
export function pickOne(array) {
  if (!Array.isArray(array) || array.length === 0) return null;
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Выбор нескольких случайных элементов из массива.
 * @template T
 * @param {T[]} array Исходный массив
 * @param {number} count Желаемое количество
 * @param {boolean} allowDuplicates Разрешены ли повторения (по умолчанию false)
 * @returns {T[]}
 */
export function pickMultiple(array, count = 1, allowDuplicates = false) {
  if (!Array.isArray(array) || array.length === 0) return [];
  const qty = Math.max(1, Math.floor(count));

  if (allowDuplicates) {
    const result = [];
    for (let i = 0; i < qty; i++) {
      result.push(pickOne(array));
    }
    return result;
  }

  // Если дубликаты запрещены
  const pool = [...array];
  shuffle(pool);
  return pool.slice(0, Math.min(qty, pool.length));
}

/**
 * Взвешенный выбор элемента.
 * Каждый элемент должен иметь свойство `weight` (число) или передаваться как пара [item, weight].
 * Пример:
 * weightedChoice([
 *   { item: 'Обычный лут', weight: 80 },
 *   { item: 'Редкий амулет', weight: 15 },
 *   { item: 'Легендарный клинок', weight: 5 }
 * ]);
 *
 * @param {Array<{item: any, weight: number}|[any, number]>} list
 * @returns {any}
 */
export function weightedChoice(list) {
  if (!Array.isArray(list) || list.length === 0) return null;

  let totalWeight = 0;
  const normalized = list.map(entry => {
    let item, weight;
    if (Array.isArray(entry)) {
      [item, weight] = entry;
    } else if (entry && typeof entry === 'object') {
      item = entry.item !== undefined ? entry.item : entry;
      weight = entry.weight !== undefined ? Number(entry.weight) : 1;
    } else {
      item = entry;
      weight = 1;
    }
    const validWeight = Math.max(0, Number(weight) || 0);
    totalWeight += validWeight;
    return { item, weight: validWeight };
  });

  if (totalWeight <= 0) return pickOne(normalized)?.item || null;

  let roll = Math.random() * totalWeight;
  for (const entry of normalized) {
    if (roll < entry.weight) {
      return entry.item;
    }
    roll -= entry.weight;
  }

  return normalized[normalized.length - 1].item;
}

/**
 * Перемешивание массива на месте по алгоритму Фишера-Йетса (Fisher-Yates).
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function shuffle(array) {
  if (!Array.isArray(array)) return [];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Проверка вероятности (шанс в процентах от 0 до 100).
 * @param {number} percent Шанс успеха (например 35 -> 35%)
 * @returns {boolean} true если бросок успешен
 */
export function chance(percent) {
  return Math.random() * 100 < percent;
}
