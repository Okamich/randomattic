/**
 * Randomattic - Theme Manager (Dark / Light)
 * Управляет темами оформлений:
 * - 'dark' (Midnight Attic)
 * - 'light' (Scholar's Parchment)
 * Сохраняет предпочтение в localStorage и учитывает системные настройки.
 */

const THEME_STORAGE_KEY = 'randomattic_theme';

export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  let initialTheme = savedTheme;

  if (!initialTheme) {
    // Если пользователь еще не выбирал тему — проверяем системную
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    initialTheme = prefersLight ? 'light' : 'dark';
  }

  applyTheme(initialTheme);

  // Слушаем изменения системной темы, если пользователь явно не сохранил выбор
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  // Привязываем переключатель
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

export function applyTheme(theme) {
  const targetTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', targetTheme);
  localStorage.setItem(THEME_STORAGE_KEY, targetTheme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.innerHTML = targetTheme === 'light' ? '🌙' : '☀️';
    toggleBtn.setAttribute('title', targetTheme === 'light' ? 'Переключить на темную тему (Midnight Attic)' : 'Переключить на светлую тему (Scholar\'s Parchment)');
    toggleBtn.setAttribute('aria-label', toggleBtn.getAttribute('title'));
  }
}

export function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}
