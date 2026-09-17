/**
 * Randomattic - Main Application Controller
 * Управление AppBoard, стилизованными карточками и экранами генераторов с настройками
 */

import { initTheme } from './theme.js';
import { CATEGORIES, GENERATORS } from './data/generators-registry.js';
import {
  rollDie,
  rollAdvantage,
  rollDisadvantage,
  rollFormula,
  getDiceHistory,
  clearDiceHistory,
  formatCoins,
  fromCopper,
  randInt
} from './utils/index.js';

import { generateCharacterName } from './generators/names.js';
import { generateTavern } from './generators/taverns.js';
import { generateLoot } from './generators/loot.js';

// Текущее состояние приложения
const state = {
  selectedCategory: 'all',
  searchQuery: '',
  currentView: 'board', // 'board' или viewId ('names', 'tavern', 'loot', 'dice')
  currentResultText: ''
};

// ==========================================================================
// Инициализация приложения
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderCategories();
  renderCards();
  setupSearch();
  setupDiceDrawer();
  setupRouter();
  setupGeneratorViewEvents();
});

// ==========================================================================
// Маршрутизация (Hash-based Router)
// ==========================================================================
function setupRouter() {
  const handleHash = () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && ['names', 'tavern', 'loot', 'dice'].includes(hash)) {
      openGeneratorView(hash, false);
    } else {
      closeGeneratorView(false);
    }
  };

  window.addEventListener('hashchange', handleHash);
  // Первоначальная проверка при открытии страницы
  handleHash();

  const brandLink = document.getElementById('brand-link');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '';
      closeGeneratorView();
    });
  }
}

// ==========================================================================
// Рендер категорий
// ==========================================================================
function renderCategories() {
  const container = document.getElementById('category-filter');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <button class="category-tab ${cat.id === state.selectedCategory ? 'active' : ''}" data-category="${cat.id}">
      <span>${cat.icon}</span>
      <span>${cat.label}</span>
    </button>
  `).join('');

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-tab');
    if (!btn) return;

    const catId = btn.dataset.category;
    state.selectedCategory = catId;

    document.querySelectorAll('.category-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.category === catId);
    });

    renderCards();
  });
}

// ==========================================================================
// Рендер карточек генераторов (В точности по референсу)
// ==========================================================================
function renderCards() {
  const grid = document.getElementById('generator-grid');
  if (!grid) return;

  const query = state.searchQuery.toLowerCase().trim();

  const filtered = GENERATORS.filter(item => {
    const matchesCategory = state.selectedCategory === 'all' || item.category === state.selectedCategory;
    const matchesSearch = !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">Ничего не найдено</h3>
        <p class="empty-state-text">Попробуйте изменить поисковый запрос или выбрать другую категорию свитков.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(gen => createCardHTML(gen)).join('');

  // Привязываем клик по карточке и кнопке
  grid.querySelectorAll('.generator-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const viewId = card.dataset.view;
      if (viewId) {
        window.location.hash = viewId;
      }
    });
  });
}

function createCardHTML(gen) {
  const tagsHTML = gen.tags.map(t => `<span class="card-tag">#${t}</span>`).join('');
  const bgStyle = gen.bgImage ? `style="--card-bg: url('${gen.bgImage}');"` : '';

  return `
    <article class="generator-card" data-id="${gen.id}" data-view="${gen.viewId || ''}" ${bgStyle}>
      <div class="card-content">
        <div class="card-header">
          <div class="card-icon-title-group">
            <div class="card-icon">${gen.icon}</div>
            <h3 class="card-title">${gen.title}</h3>
          </div>
          <span class="card-badge">${gen.badge}</span>
        </div>

        <div class="card-description-box">
          <p class="card-description">${gen.description}</p>
        </div>

        <div class="card-tags">
          ${tagsHTML}
        </div>

        <button class="card-action-btn" data-view="${gen.viewId || ''}">
          <span>${gen.actionText}</span>
          <span>→</span>
        </button>
      </div>
    </article>
  `;
}

// ==========================================================================
// Поиск
// ==========================================================================
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderCards();
  });
}

// ==========================================================================
// Переключение экранов: AppBoard <-> Экран Генератора с настройками
// ==========================================================================
export function openGeneratorView(viewId, updateHash = true) {
  state.currentView = viewId;
  if (updateHash) {
    window.location.hash = viewId;
  }

  // Если это дайс-роллер — можем открыть и рабочий стол, и выдвижной трей
  const boardEl = document.getElementById('view-board');
  const genEl = document.getElementById('view-generator');

  if (boardEl) boardEl.style.display = 'none';
  if (genEl) {
    genEl.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Находим метаданные генератора
  const genMeta = GENERATORS.find(g => g.viewId === viewId) || {
    title: 'Генератор',
    icon: '🎲'
  };

  document.getElementById('gen-header-icon').textContent = genMeta.icon;
  document.getElementById('gen-header-title').textContent = genMeta.title;

  // Рендерим форму настроек для данного генератора
  renderGeneratorSettings(viewId);

  // Сразу делаем одну первичную генерацию с дефолтными настройками
  executeCurrentGenerator();
}

export function closeGeneratorView(updateHash = true) {
  state.currentView = 'board';
  if (updateHash) {
    window.location.hash = '';
  }

  const boardEl = document.getElementById('view-board');
  const genEl = document.getElementById('view-generator');

  if (boardEl) boardEl.style.display = 'block';
  if (genEl) genEl.style.display = 'none';
}

function setupGeneratorViewEvents() {
  const backBtn = document.getElementById('btn-back-to-board');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      closeGeneratorView();
    });
  }

  const form = document.getElementById('generator-settings-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      executeCurrentGenerator();
    });
  }

  const copyBtn = document.getElementById('btn-copy-result');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (state.currentResultText) {
        navigator.clipboard.writeText(state.currentResultText).then(() => {
          copyBtn.innerHTML = '<span>✔</span><span>Скопировано!</span>';
          setTimeout(() => {
            copyBtn.innerHTML = '<span>📋</span><span>Копировать</span>';
          }, 2000);
        });
      }
    });
  }
}

// ==========================================================================
// Настройки и выполнение для каждого генератора
// ==========================================================================
function renderGeneratorSettings(viewId) {
  const container = document.getElementById('dynamic-settings-fields');
  if (!container) return;

  switch (viewId) {
    case 'names':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="setting-race">Раса персонажа</label>
          <select class="form-select" id="setting-race">
            <option value="any">🎲 Любая случайная раса</option>
            <option value="human">Человек (Северяне и Южане)</option>
            <option value="elf">Эльф (Высший / Лесной)</option>
            <option value="dwarf">Дварф (Горный / Подгорный)</option>
            <option value="tiefling">Тифлинг (Инфернальный род)</option>
            <option value="drow">Дроу (Тёмный эльф)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="setting-gender">Пол</label>
          <select class="form-select" id="setting-gender">
            <option value="any">🎲 Случайный</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="setting-format">Формат имени</label>
          <select class="form-select" id="setting-format">
            <option value="full">Имя + Родовая фамилия / Клан</option>
            <option value="epithet">Имя + Героический титул / Прозвище</option>
            <option value="simple">Только Имя</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="setting-count">Количество вариантов</label>
          <select class="form-select" id="setting-count">
            <option value="1">1 вариант</option>
            <option value="3" selected>3 варианта</option>
            <option value="5">5 вариантов</option>
          </select>
        </div>
      `;
      break;

    case 'tavern':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="setting-tavern-style">Тип заведения</label>
          <select class="form-select" id="setting-tavern-style">
            <option value="cozy">Уютный постоялый двор у тракта</option>
            <option value="shady">Злачный портовый притон контрабандистов</option>
            <option value="noble">Роскошная столичная таверна</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Что включить в свиток:</label>
          <label class="form-checkbox-label">
            <input type="checkbox" class="form-checkbox" id="check-menu" checked>
            <span>Меню: Фирменная еда и выпивка с ценами D&D</span>
          </label>
          <label class="form-checkbox-label">
            <input type="checkbox" class="form-checkbox" id="check-innkeeper" checked>
            <span>Хозяин заведения и его характерная черта</span>
          </label>
          <label class="form-checkbox-label">
            <input type="checkbox" class="form-checkbox" id="check-rumors" checked>
            <span>Слухи и зацепка для приключения</span>
          </label>
          <label class="form-checkbox-label">
            <input type="checkbox" class="form-checkbox" id="check-event" checked>
            <span>Случайное событие в зале прямо сейчас</span>
          </label>
        </div>
      `;
      break;

    case 'loot':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="setting-cr">Уровень опасности отряда (CR)</label>
          <select class="form-select" id="setting-cr">
            <option value="0-4" selected>CR 0–4 (Начинающие искатели приключений)</option>
            <option value="5-10">CR 5–10 (Опытные герои королевства)</option>
            <option value="11-16">CR 11–16 (Мастера континента)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="setting-loot-type">Тип добычи</label>
          <select class="form-select" id="setting-loot-type">
            <option value="hoard" selected>Сокровищница босса (Сундук в логове)</option>
            <option value="individual">Индивидуальная добыча из карманов монстра</option>
          </select>
        </div>
      `;
      break;

    case 'dice':
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="setting-dice-formula">Формула броска</label>
          <input type="text" class="form-input" id="setting-dice-formula" value="2d20kh1 + 1d8 + 4" placeholder="Напр: 2d6 + 3">
        </div>
        <p style="color:var(--color-text-muted); font-size:0.85rem; line-height:1.4;">
          Поддерживаются стандартные формулы D&D: преимущество <code>2d20kh1</code>, помеха <code>2d20kl1</code>, генерация характеристик <code>4d6kh3</code>, любые кости d4–d100.
        </p>
      `;
      break;

    default:
      container.innerHTML = `<p style="color:var(--color-text-muted);">Настройки по умолчанию.</p>`;
      break;
  }
}

function executeCurrentGenerator() {
  const resultContainer = document.getElementById('generator-result-content');
  if (!resultContainer) return;

  switch (state.currentView) {
    case 'names': {
      const race = document.getElementById('setting-race')?.value || 'any';
      const gender = document.getElementById('setting-gender')?.value || 'any';
      const format = document.getElementById('setting-format')?.value || 'full';
      const count = parseInt(document.getElementById('setting-count')?.value || '1', 10);

      const items = [];
      for (let i = 0; i < count; i++) {
        items.push(generateCharacterName({ race, gender, format }));
      }

      state.currentResultText = items.map(it => `${it.name} (${it.race}, ${it.gender}) ${it.titleDetail}`).join('\n');

      resultContainer.innerHTML = items.map(item => `
        <div class="result-item-card">
          <h4 class="result-item-title">${item.name}</h4>
          <div class="result-item-meta">
            <span class="result-badge">${item.race}</span>
            <span class="result-badge">${item.gender}</span>
            <span>${item.titleDetail}</span>
          </div>
          <p class="result-item-body" style="font-style:italic; color:var(--color-text-secondary);">${item.quote}</p>
        </div>
      `).join('');
      break;
    }

    case 'tavern': {
      const tavern = generateTavern();
      state.currentResultText = `${tavern.name}\nТрактирщик: ${tavern.innkeeper}\nЕда: ${tavern.dish}\nВыпивка: ${tavern.drink}\nСлух: ${tavern.rumor}\nСобытие: ${tavern.event}`;

      resultContainer.innerHTML = `
        <div class="result-item-card">
          <h4 class="result-item-title">${tavern.name}</h4>
          <div class="result-item-meta">
            <span class="result-badge">Таверна & Постоялый Двор</span>
          </div>
          <div class="result-item-body" style="display:flex; flex-direction:column; gap:0.75rem;">
            <p><strong>👤 Трактирщик:</strong> ${tavern.innkeeper}</p>
            <p><strong>🍲 Фирменное блюдо:</strong> ${tavern.dish}</p>
            <p><strong>🍺 Выпивка в кружке:</strong> ${tavern.drink}</p>
            <p><strong>🗣️ Свежий слух:</strong> «${tavern.rumor}»</p>
            <p><strong>⚡ Случайное событие в зале:</strong> ${tavern.event}</p>
          </div>
        </div>
      `;
      break;
    }

    case 'loot': {
      const crTier = document.getElementById('setting-cr')?.value || '0-4';
      const type = document.getElementById('setting-loot-type')?.value || 'hoard';
      const loot = generateLoot({ crTier, type });

      state.currentResultText = `Добыча [${loot.tier}, ${loot.type}]:\nМонеты: ${loot.coinsFormatted}\nСамоцветы: ${loot.gems.join(', ') || 'нет'}\nЦенности: ${loot.arts.join(', ') || 'нет'}\nМагия: ${loot.magicItems.join(', ') || 'нет'}`;

      resultContainer.innerHTML = `
        <div class="result-item-card">
          <h4 class="result-item-title">🏆 ${loot.type}</h4>
          <div class="result-item-meta">
            <span class="result-badge">${loot.tier}</span>
          </div>
          <div class="result-item-body" style="display:flex; flex-direction:column; gap:0.75rem;">
            <p><strong>🪙 Россыпь монет:</strong> <span style="color:var(--color-accent); font-weight:bold;">${loot.coinsFormatted}</span></p>
            ${loot.gems.length > 0 ? `<p><strong>💎 Драгоценные камни:</strong> ${loot.gems.join('; ')}</p>` : ''}
            ${loot.arts.length > 0 ? `<p><strong>🏺 Произведения искусства:</strong> ${loot.arts.join('; ')}</p>` : ''}
            ${loot.magicItems.length > 0 ? `<p><strong>✨ Магические предметы:</strong> ${loot.magicItems.join('; ')}</p>` : ''}
          </div>
        </div>
      `;
      break;
    }

    case 'dice': {
      const formula = document.getElementById('setting-dice-formula')?.value || '2d20kh1 + 1d8 + 4';
      const roll = rollFormula(formula);

      state.currentResultText = `${roll.formula} = ${roll.total} (${roll.breakdown})`;

      resultContainer.innerHTML = `
        <div class="result-item-card" style="text-align:center;">
          <h4 class="result-item-title" style="font-size:3.2rem; color:var(--color-accent); margin-bottom:0.2rem;">${roll.total}</h4>
          <div class="result-item-meta" style="justify-content:center;">
            <span class="result-badge">${roll.formula}</span>
          </div>
          <p class="result-item-body" style="font-size:1.1rem; color:var(--color-text-secondary); margin-top:0.5rem;">
            <strong>Расчёт:</strong> ${roll.breakdown}
          </p>
        </div>
      `;
      break;
    }

    default:
      resultContainer.innerHTML = `<div class="result-item-card"><p>Выберите генератор на главной доске.</p></div>`;
      break;
  }
}

// ==========================================================================
// Быстрый дайс-роллер (Quick Dice Drawer)
// ==========================================================================
function setupDiceDrawer() {
  const openBtn = document.getElementById('btn-open-dice');
  const closeBtn = document.getElementById('dice-drawer-close');
  const overlay = document.getElementById('dice-drawer-overlay');

  if (openBtn) openBtn.addEventListener('click', openDiceDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDiceDrawer);
  if (overlay) overlay.addEventListener('click', closeDiceDrawer);

  document.querySelectorAll('.dice-die-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sides = parseInt(btn.dataset.sides, 10) || 20;
      const result = rollDie(sides);
      displayDiceResult(result, `1d${sides}`);
    });
  });

  const btnAdv = document.getElementById('btn-advantage');
  const btnDis = document.getElementById('btn-disadvantage');

  if (btnAdv) {
    btnAdv.addEventListener('click', () => {
      const res = rollAdvantage(0);
      displayDiceResult(res.total, `Преимущество: [${res.rolls.join(', ')}] -> ${res.selected}`, res.isCritSuccess, res.isCritFail);
    });
  }

  if (btnDis) {
    btnDis.addEventListener('click', () => {
      const res = rollDisadvantage(0);
      displayDiceResult(res.total, `Помеха: [${res.rolls.join(', ')}] -> ${res.selected}`, res.isCritSuccess, res.isCritFail);
    });
  }

  const btnFormula = document.getElementById('btn-roll-formula');
  const formulaInput = document.getElementById('formula-input');

  if (btnFormula && formulaInput) {
    const handleFormulaRoll = () => {
      const val = formulaInput.value.trim();
      if (!val) return;
      const res = rollFormula(val);
      displayDiceResult(res.total, `${res.formula} = ${res.breakdown}`);
    };

    btnFormula.addEventListener('click', handleFormulaRoll);
    formulaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleFormulaRoll();
    });
  }

  const btnClearHist = document.getElementById('btn-clear-dice-history');
  if (btnClearHist) {
    btnClearHist.addEventListener('click', () => {
      clearDiceHistory();
      renderDiceHistory();
    });
  }
}

export function openDiceDrawer() {
  document.getElementById('dice-drawer')?.classList.add('active');
  document.getElementById('dice-drawer-overlay')?.classList.add('active');
  renderDiceHistory();
}

export function closeDiceDrawer() {
  document.getElementById('dice-drawer')?.classList.remove('active');
  document.getElementById('dice-drawer-overlay')?.classList.remove('active');
}

function displayDiceResult(total, detailText, isCritSuccess = false, isCritFail = false) {
  const numEl = document.getElementById('dice-result-num');
  const detailEl = document.getElementById('dice-result-detail');

  if (numEl) {
    numEl.textContent = total;
    numEl.className = 'dice-result-num';
    if (isCritSuccess || total === 20) numEl.classList.add('crit-success');
    if (isCritFail || total === 1) numEl.classList.add('crit-fail');
  }

  if (detailEl) {
    detailEl.textContent = detailText;
  }

  renderDiceHistory();
}

function renderDiceHistory() {
  const historyList = document.getElementById('dice-history-list');
  if (!historyList) return;

  const items = getDiceHistory();
  if (items.length === 0) {
    historyList.innerHTML = `<li style="color:var(--color-text-muted);font-size:0.8rem;text-align:center;">Бросков еще не было</li>`;
    return;
  }

  historyList.innerHTML = items.slice(0, 15).map(item => `
    <li class="history-item">
      <span><strong>${item.total}</strong> &nbsp; <small style="color:var(--color-text-secondary);">${item.text || item.formula || ''}</small></span>
      <span style="color:var(--color-text-muted);">${item.timestamp || ''}</span>
    </li>
  `).join('');
}
