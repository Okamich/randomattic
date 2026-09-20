/**
 * Randomattic - Main Application Controller
 * Управление каталогом, карточками и экранами генераторов с настройками
 */

import { initTheme } from './theme.js';
import { CATEGORIES, GENERATORS } from './data/generators-registry.js';
import { D20_CATALOG } from './data/d20-data.js';
import { TAVERN_DATA } from './data/tavern-data.js';
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
import { generateD20Event } from './generators/d20.js';

// Текущее состояние приложения
const state = {
  selectedCategory: 'all',
  searchQuery: '',
  currentView: 'board', // 'board' или viewId
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
    const validViews = ['names', 'tavern', 'loot', 'd20-hub', 'd20-wild-magic', 'd20-secret-societies', 'd20-artefacts', 'd20-potions'];
    
    if (hash && validViews.includes(hash)) {
      openGeneratorView(hash, false);
    } else {
      closeGeneratorView(false);
    }
  };

  window.addEventListener('hashchange', handleHash);
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

  grid.querySelectorAll('.generator-card').forEach(card => {
    card.addEventListener('click', () => {
      const viewId = card.dataset.view;
      if (viewId) {
        window.location.hash = viewId;
      }
    });
  });
}

function createCardHTML(gen) {
  const tagsHTML = gen.tags.map(t => `<span class="card-tag">#${t}</span>`).join('');
  const bgStyle = gen.bgImage ? `style="background-image: url('${gen.bgImage}');"` : '';

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

  const boardEl = document.getElementById('view-board');
  const genEl = document.getElementById('view-generator');

  if (boardEl) boardEl.style.display = 'none';
  if (genEl) {
    genEl.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const genMeta = GENERATORS.find(g => g.viewId === viewId) || {
    title: 'Генератор',
    icon: '🎲'
  };

  document.getElementById('gen-header-icon').textContent = genMeta.icon;
  document.getElementById('gen-header-title').textContent = genMeta.title;

  renderGeneratorSettings(viewId);
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
// Настройки для каждого генератора
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

    case 'tavern': {
      const locations = Object.keys(TAVERN_DATA.menus_by_location);
      const locOptions = locations.map(l => `<option value="${l}">${l}</option>`).join('');

      container.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="setting-tavern-loc">Местность заведения</label>
          <select class="form-select" id="setting-tavern-loc">
            <option value="any">🎲 Случайная местность</option>
            ${locOptions}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="setting-tavern-class">Класс заведения</label>
          <select class="form-select" id="setting-tavern-class">
            <option value="cheap">Дешёвое (для простолюдинов и наемников)</option>
            <option value="normal" selected>Обычное (добротный постоялый двор)</option>
            <option value="luxury">Роскошное (для купцов и знати)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="setting-tavern-race">Раса хозяина</label>
          <select class="form-select" id="setting-tavern-race">
            <option value="any">🎲 Случайная раса</option>
            <option value="Человек">Человек</option>
            <option value="Дварф">Дварф</option>
            <option value="Эльф">Эльф</option>
            <option value="Полурослик">Полурослик</option>
            <option value="Тифлинг">Тифлинг</option>
            <option value="Драконорожденный">Драконорожденный</option>
          </select>
        </div>
      `;
      break;
    }

    case 'd20-hub': {
      const tableOptions = D20_CATALOG.map(t => `<option value="${t.id}">${t.icon} ${t.title}</option>`).join('');
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="setting-d20-table">Таблица D20</label>
          <select class="form-select" id="setting-d20-table">
            <option value="all">🎲 Случайная из всех 12 таблиц</option>
            ${tableOptions}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="setting-d20-roll">Бросок кубика d20</label>
          <select class="form-select" id="setting-d20-roll">
            <option value="random">🎲 Бросить d20 случайно</option>
            ${Array.from({length: 20}, (_, i) => `<option value="${i+1}">Значение: ${i+1}</option>`).join('')}
          </select>
        </div>
      `;
      break;
    }

    case 'd20-wild-magic':
    case 'd20-secret-societies':
    case 'd20-artefacts':
    case 'd20-potions': {
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="setting-d20-single-roll">Бросок d20</label>
          <select class="form-select" id="setting-d20-single-roll">
            <option value="random">🎲 Бросить кубик d20 случайно</option>
            ${Array.from({length: 20}, (_, i) => `<option value="${i+1}">Значение: ${i+1}</option>`).join('')}
          </select>
        </div>
      `;
      break;
    }

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

    default:
      container.innerHTML = `<p style="color:var(--color-text-muted);">Настройки по умолчанию.</p>`;
      break;
  }
}

// ==========================================================================
// Выполнение генерации
// ==========================================================================
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
      const location = document.getElementById('setting-tavern-loc')?.value || 'any';
      const classType = document.getElementById('setting-tavern-class')?.value || 'normal';
      const innkeeperRace = document.getElementById('setting-tavern-race')?.value || 'any';

      const tavern = generateTavern({ location, classType, innkeeperRace });
      state.currentResultText = `${tavern.name} [${tavern.classLabel} | ${tavern.location}]\nХозяин: ${tavern.innkeeper}\nЦены: ${tavern.roomPrices}\nШтат: ${tavern.roomsInfo}\nБлюдо: ${tavern.dish}\nВыпивка: ${tavern.drink}\nАтмосфера: ${tavern.atmosphere}\nЗаполненность: ${tavern.crowd}\nСлух: ${tavern.rumor}\nСобытие: ${tavern.event}`;

      resultContainer.innerHTML = `
        <div class="result-item-card">
          <h4 class="result-item-title">${tavern.name}</h4>
          <div class="result-item-meta">
            <span class="result-badge">${tavern.classLabel}</span>
            <span class="result-badge">${tavern.location}</span>
            <span class="result-badge">${tavern.crowd}</span>
          </div>
          <div class="result-item-body" style="display:flex; flex-direction:column; gap:0.75rem;">
            <p><strong>👤 Хозяин:</strong> ${tavern.innkeeper}</p>
            <p><strong>🛏️ Ночлег & Цены:</strong> ${tavern.roomPrices} (${tavern.roomsInfo})</p>
            <p><strong>🕯️ Обстановка:</strong> ${tavern.classDescription}</p>
            <p><strong>🍲 Особое блюдо местности:</strong> ${tavern.dish}</p>
            <p><strong>🍺 Выпивка в кружке:</strong> ${tavern.drink}</p>
            <p><strong>🎭 Настроение в зале:</strong> ${tavern.atmosphere}</p>
            <p><strong>🗣️ Свежий слух:</strong> «${tavern.rumor}»</p>
            <p><strong>⚡ Происшествие:</strong> ${tavern.event}</p>
          </div>
        </div>
      `;
      break;
    }

    case 'd20-hub': {
      const tableId = document.getElementById('setting-d20-table')?.value || 'all';
      const rollVal = document.getElementById('setting-d20-roll')?.value || 'random';
      const rollNum = rollVal !== 'random' ? parseInt(rollVal, 10) : undefined;

      const evt = generateD20Event({ tableId, rollNum });
      state.currentResultText = `[${evt.tableTitle}] d20 = ${evt.roll}\n${evt.text}`;

      resultContainer.innerHTML = `
        <div class="result-item-card">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">
            <h4 class="result-item-title">${evt.icon} ${evt.tableTitle}</h4>
            <span style="font-family:var(--font-display); font-size:1.8rem; font-weight:bold; color:var(--color-accent); background:var(--color-surface); padding:0.2rem 0.8rem; border-radius:10px; border:1px solid var(--color-border);">
              d20: ${evt.roll}
            </span>
          </div>
          <div class="result-item-meta">
            <span class="result-badge">${evt.badge}</span>
            <span>${evt.tableDescription}</span>
          </div>
          <p class="result-item-body" style="font-size:1.1rem; line-height:1.6; margin-top:0.5rem; background:rgba(0,0,0,0.2); padding:1rem; border-radius:8px; border-left:3px solid var(--color-accent);">
            ${evt.text}
          </p>
        </div>
      `;
      break;
    }

    case 'd20-wild-magic':
    case 'd20-secret-societies':
    case 'd20-artefacts':
    case 'd20-potions': {
      const map = {
        'd20-wild-magic': 'wild-magic',
        'd20-secret-societies': 'secret-societies',
        'd20-artefacts': 'artefacts-clues',
        'd20-potions': 'strange-potions'
      };
      const tableId = map[state.currentView];
      const rollVal = document.getElementById('setting-d20-single-roll')?.value || 'random';
      const rollNum = rollVal !== 'random' ? parseInt(rollVal, 10) : undefined;

      const evt = generateD20Event({ tableId, rollNum });
      state.currentResultText = `[${evt.tableTitle}] d20 = ${evt.roll}\n${evt.text}`;

      resultContainer.innerHTML = `
        <div class="result-item-card">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">
            <h4 class="result-item-title">${evt.icon} ${evt.tableTitle}</h4>
            <span style="font-family:var(--font-display); font-size:1.8rem; font-weight:bold; color:var(--color-accent); background:var(--color-surface); padding:0.2rem 0.8rem; border-radius:10px; border:1px solid var(--color-border);">
              d20: ${evt.roll}
            </span>
          </div>
          <div class="result-item-meta">
            <span class="result-badge">${evt.badge}</span>
          </div>
          <p class="result-item-body" style="font-size:1.1rem; line-height:1.6; margin-top:0.5rem; background:rgba(0,0,0,0.2); padding:1rem; border-radius:8px; border-left:3px solid var(--color-accent);">
            ${evt.text}
          </p>
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
      // rollDie(sides, true) сохраняет бросок в историю
      const result = rollDie(sides, true);
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
