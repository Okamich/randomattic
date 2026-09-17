/**
 * Randomattic - Local Storage Helper
 * Безопасная работа с браузерным хранилищем данных.
 */

const MEMORY_FALLBACK = {};

export const storage = {
  /**
   * Получить значение по ключу
   * @param {string} key
   * @param {any} defaultValue
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch {
      return MEMORY_FALLBACK[key] !== undefined ? MEMORY_FALLBACK[key] : defaultValue;
    }
  },

  /**
   * Сохранить значение по ключу
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      MEMORY_FALLBACK[key] = value;
    }
  },

  /**
   * Удалить значение по ключу
   * @param {string} key
   */
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      delete MEMORY_FALLBACK[key];
    }
  }
};
