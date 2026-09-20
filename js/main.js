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
import {
  generateTavernEnhanced,
  BIOMES,
  TAVERN_TYPES,
  TAVERN_CATEGORIES,
  RACE_PORTRAIT_KEYS
} from './generators/tavern-enhanced.js';

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
  const mainContainer = document.querySelector('main.container');
  const genTopBar = document.querySelector('.generator-top-bar');

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

  const standardWorkspace = document.getElementById('standard-generator-workspace');
  const tavernWorkspace = document.getElementById('tavern-dashboard-workspace');

  if (viewId === 'tavern') {
    if (mainContainer) mainContainer.classList.add('container-fluid-tavern');
    if (genTopBar) genTopBar.style.display = 'none';
    if (standardWorkspace) standardWorkspace.style.display = 'none';
    if (tavernWorkspace) {
      tavernWorkspace.style.display = 'flex';
      initTavernDashboard();
    }
  } else {
    if (mainContainer) mainContainer.classList.remove('container-fluid-tavern');
    if (genTopBar) genTopBar.style.display = 'flex';
    if (standardWorkspace) standardWorkspace.style.display = 'grid';
    if (tavernWorkspace) tavernWorkspace.style.display = 'none';
    renderGeneratorSettings(viewId);
    executeCurrentGenerator();
  }
}

export function closeGeneratorView(updateHash = true) {
  state.currentView = 'board';
  if (updateHash) {
    window.location.hash = '';
  }

  const boardEl = document.getElementById('view-board');
  const genEl = document.getElementById('view-generator');
  const mainContainer = document.querySelector('main.container');
  const genTopBar = document.querySelector('.generator-top-bar');

  if (mainContainer) mainContainer.classList.remove('container-fluid-tavern');
  if (genTopBar) genTopBar.style.display = 'flex';
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

  const backFromTavernBtn = document.getElementById('btn-back-from-tavern');
  if (backFromTavernBtn) {
    backFromTavernBtn.addEventListener('click', () => {
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

// ==========================================================================
// TAVERN ARCHITECT DASHBOARD CONTROLLER (Matching TGR_1_main reference)
// ==========================================================================

const tavernState = {
  options: {
    location: 'random',
    type: 'random',
    category: 'random',
    crowd: 8,
    atmosphere: 'random',
    innkeeperGender: 'random',
    innkeeperRace: 'random',
    innkeeperAge: 38
  },
  locks: {
    lockLocation: false,
    lockType: false,
    lockCategory: false,
    lockCrowd: false,
    lockAtmosphere: false,
    lockGender: false,
    lockRace: false,
    lockAge: false
  },
  currentData: null,
  isInitialized: false
};

const TAVERN_LOCK_ITEMS = [
  { btnId: 'btn-lock-loc', lockKey: 'lockLocation', inputId: 't-param-loc', optKey: 'location' },
  { btnId: 'btn-lock-type', lockKey: 'lockType', inputId: 't-param-type', optKey: 'type' },
  { btnId: 'btn-lock-cat', lockKey: 'lockCategory', inputId: 't-param-cat', optKey: 'category' },
  { btnId: 'btn-lock-crowd', lockKey: 'lockCrowd', inputId: 't-param-crowd', optKey: 'crowd' },
  { btnId: 'btn-lock-atmo', lockKey: 'lockAtmosphere', inputId: 't-param-atmo', optKey: 'atmosphere' },
  { btnId: 'btn-lock-gender', lockKey: 'lockGender', inputId: 'p-param-gender', optKey: 'innkeeperGender' },
  { btnId: 'btn-lock-race', lockKey: 'lockRace', inputId: 'p-param-race', optKey: 'innkeeperRace' },
  { btnId: 'btn-lock-age', lockKey: 'lockAge', inputId: 'p-param-age', optKey: 'innkeeperAge' }
];

function initTavernDashboard() {
  if (!tavernState.isInitialized) {
    populateTavernSelects();
    setupTavernEventListeners();
    tavernState.isInitialized = true;
  }
  rerollTavern();
}

function populateTavernSelects() {
  // 1. Locations
  const locSel = document.getElementById('t-param-loc');
  if (locSel) {
    locSel.innerHTML = `<option value="random">🎲 Любая местность</option>` +
      BIOMES.map(b => `<option value="${b}">${b}</option>`).join('');
  }

  // 2. Types
  const typeSel = document.getElementById('t-param-type');
  if (typeSel) {
    typeSel.innerHTML = `<option value="random">🎲 Любой тип</option>` +
      TAVERN_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
  }

  // 3. Categories
  const catSel = document.getElementById('t-param-cat');
  if (catSel) {
    catSel.innerHTML = `<option value="random">🎲 Любая категория</option>` +
      TAVERN_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  // 4. Atmospheres
  const atmoSel = document.getElementById('t-param-atmo');
  if (atmoSel) {
    atmoSel.innerHTML = `<option value="random">🎲 Любая атмосфера</option>` +
      TAVERN_DATA.atmospheres.map(a => `<option value="${a.mood}">${a.mood}</option>`).join('');
  }

  // 5. Races
  const raceSel = document.getElementById('p-param-race');
  if (raceSel) {
    const races = Object.keys(RACE_PORTRAIT_KEYS);
    raceSel.innerHTML = `<option value="random">🎲 Любая раса</option>` +
      races.map(r => `<option value="${r}">${r}</option>`).join('');
  }
}

function setupTavernEventListeners() {
  // Reroll button
  document.getElementById('btn-reroll-tavern')?.addEventListener('click', () => {
    rerollTavern();
  });

  // Unlock all button
  document.getElementById('btn-unlock-all-tavern')?.addEventListener('click', () => {
    TAVERN_LOCK_ITEMS.forEach(item => {
      tavernState.locks[item.lockKey] = false;
      const btn = document.getElementById(item.btnId);
      if (btn) {
        btn.classList.remove('locked');
        btn.textContent = '🔓';
        btn.title = 'Заблокировать от случайного броска';
      }
    });
  });

  // Copy summary button
  document.getElementById('btn-copy-tavern-summary')?.addEventListener('click', () => {
    copyTavernSummary();
  });

  // Lock buttons toggle
  TAVERN_LOCK_ITEMS.forEach(item => {
    const btn = document.getElementById(item.btnId);
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isLocked = !tavernState.locks[item.lockKey];
      tavernState.locks[item.lockKey] = isLocked;
      btn.classList.toggle('locked', isLocked);
      btn.textContent = isLocked ? '🔒' : '🔓';
      btn.title = isLocked ? 'Заблокировано от случайного броска' : 'Разблокировано (будет перегенерировано)';

      const el = document.getElementById(item.inputId);
      if (isLocked && el) {
        // If current element is set to 'random', lock the currently generated concrete value!
        if (el.value === 'random' && tavernState.currentData && tavernState.currentData.params) {
          const concreteVal = tavernState.currentData.params[item.optKey];
          if (concreteVal) {
            el.value = concreteVal;
          }
        }
        tavernState.options[item.optKey] = el.value;
      }
    });
  });

  // Sliders display values & sync
  const crowdSlider = document.getElementById('t-param-crowd');
  const crowdVal = document.getElementById('t-val-crowd');
  if (crowdSlider && crowdVal) {
    crowdSlider.addEventListener('input', (e) => {
      crowdVal.textContent = e.target.value;
      tavernState.options.crowd = Number(e.target.value);
    });
  }

  const ageSlider = document.getElementById('p-param-age');
  const ageVal = document.getElementById('p-val-age');
  if (ageSlider && ageVal) {
    ageSlider.addEventListener('input', (e) => {
      ageVal.textContent = e.target.value;
      tavernState.options.innkeeperAge = Number(e.target.value);
    });
  }

  // Inputs change sync (when changed manually)
  TAVERN_LOCK_ITEMS.forEach(item => {
    const el = document.getElementById(item.inputId);
    if (!el) return;
    el.addEventListener('change', () => {
      tavernState.options[item.optKey] = el.value;
    });
  });
}

function rerollTavern() {
  // Sync options from controls for unlocked items if user specifically selected a non-random value
  TAVERN_LOCK_ITEMS.forEach(item => {
    if (!tavernState.locks[item.lockKey]) {
      const el = document.getElementById(item.inputId);
      if (el) {
        tavernState.options[item.optKey] = el.value;
      }
    }
  });

  const generated = generateTavernEnhanced(tavernState.options, tavernState.locks);
  tavernState.currentData = generated;

  renderTavernUI(generated);
}

function renderTavernUI(data) {
  if (!data) return;

  // 1. Sync parameter controls if not locked and not kept in random mode
  if (!tavernState.locks.lockLocation) {
    const locEl = document.getElementById('t-param-loc');
    if (locEl && tavernState.options.location !== 'random') locEl.value = data.params.location;
  }
  if (!tavernState.locks.lockType) {
    const typeEl = document.getElementById('t-param-type');
    if (typeEl && tavernState.options.type !== 'random') typeEl.value = data.params.type;
  }
  if (!tavernState.locks.lockCategory) {
    const catEl = document.getElementById('t-param-cat');
    if (catEl && tavernState.options.category !== 'random') catEl.value = data.params.category;
  }
  if (!tavernState.locks.lockCrowd) {
    const crowdEl = document.getElementById('t-param-crowd');
    const crowdVal = document.getElementById('t-val-crowd');
    if (crowdEl && crowdVal) {
      crowdEl.value = data.params.crowd;
      crowdVal.textContent = data.params.crowd;
    }
  }
  if (!tavernState.locks.lockAtmosphere) {
    const atmoEl = document.getElementById('t-param-atmo');
    if (atmoEl && tavernState.options.atmosphere !== 'random') atmoEl.value = data.params.atmosphere;
  }
  if (!tavernState.locks.lockGender) {
    const genderEl = document.getElementById('p-param-gender');
    if (genderEl && tavernState.options.innkeeperGender !== 'random') genderEl.value = data.params.innkeeperGender;
  }
  if (!tavernState.locks.lockRace) {
    const raceEl = document.getElementById('p-param-race');
    if (raceEl && tavernState.options.innkeeperRace !== 'random') raceEl.value = data.params.innkeeperRace;
  }
  if (!tavernState.locks.lockAge) {
    const ageEl = document.getElementById('p-param-age');
    const ageVal = document.getElementById('p-val-age');
    if (ageEl && ageVal) {
      ageEl.value = data.params.innkeeperAge;
      ageVal.textContent = data.params.innkeeperAge;
    }
  }

  // 2. Tavern Details Card
  const detailsTitle = document.getElementById('t-details-title');
  if (detailsTitle) detailsTitle.innerHTML = `<span>🏠</span> ${data.tavern.name}`;
  
  const detailsBadge = document.getElementById('t-details-badge');
  if (detailsBadge) detailsBadge.textContent = `${data.tavern.category} • ${data.tavern.location}`;

  const detailsSketch = document.getElementById('t-details-sketch');
  if (detailsSketch) detailsSketch.src = data.tavern.sketchPath;

  const detailsSpecs = document.getElementById('t-details-specs');
  if (detailsSpecs) {
    detailsSpecs.innerHTML = `
      <div class="details-item"><span class="details-label">• Имя:</span> <strong>${data.tavern.name}</strong></div>
      <div class="details-item"><span class="details-label">• Местоположение:</span> ${data.tavern.location}</div>
      <div class="details-item"><span class="details-label">• Тип и Класс:</span> ${data.tavern.type} (${data.tavern.category})</div>
      <div class="details-item"><span class="details-label">• Владелец:</span> ${data.patron.fullName} (${data.patron.race}, ${data.patron.genderText}, ${data.patron.age} лет)</div>
      <div class="details-item"><span class="details-label">• Заполненность зала:</span> ${data.tavern.crowdDesc}</div>
      <div class="details-item"><span class="details-label">• Атмосфера:</span> <strong>${data.tavern.atmosphere}</strong> — ${data.tavern.atmosphereDesc}</div>
      <div class="details-item"><span class="details-label">• Слухи (Тема дня):</span> «${data.tavern.rumor}»</div>
      <div class="details-item"><span class="details-label">• Случайное событие:</span> ${data.tavern.event}</div>
      <div class="details-item"><span class="details-label">• Особое меню ⭐:</span> «${data.tavern.specialPair.dish}» и напиток «${data.tavern.specialPair.drink}»</div>
    `;
  }

  // 3. Room Description Table
  const roomsCountEl = document.getElementById('t-rooms-count');
  if (roomsCountEl) roomsCountEl.textContent = `${data.rooms.length} номеров`;

  const roomsTbody = document.getElementById('t-rooms-tbody');
  if (roomsTbody) {
    roomsTbody.innerHTML = data.rooms.map(r => `
      <tr>
        <td style="font-weight:700; text-align:center;">${r.roomNumber}</td>
        <td>${r.typeDesc}</td>
        <td><span class="cost-badge">${r.cost}</span></td>
        <td>
          ${r.isOccupied 
            ? `<span class="badge-occupied" title="${r.tenant}">🔴 Занято</span><div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">${r.tenant}</div>` 
            : `<span class="badge-vacant">🟢 Свободно</span>`}
        </td>
        <td><span class="${r.noteType === 'positive' ? 'room-note-pos' : 'room-note-neg'}">«${r.note}»</span></td>
      </tr>
    `).join('');
  }

  // 4. Patron Profile Card
  const pPortrait = document.getElementById('p-profile-portrait');
  if (pPortrait) {
    pPortrait.src = data.patron.portraitPath;
    pPortrait.onerror = () => {
      pPortrait.src = 'assets/images/portraits/human_male.jpg';
    };
  }

  const pName = document.getElementById('p-profile-name');
  if (pName) pName.textContent = data.patron.fullName;

  const pMeta = document.getElementById('p-profile-meta');
  if (pMeta) pMeta.textContent = `${data.patron.race} • ${data.patron.genderText} • ${data.patron.age} лет`;

  const pBio = document.getElementById('p-profile-bio');
  if (pBio) pBio.textContent = data.patron.backstory;

  const pQuirk = document.getElementById('p-profile-quirk');
  if (pQuirk) pQuirk.textContent = data.patron.quirk;

  const pSecret = document.getElementById('p-profile-secret');
  if (pSecret) pSecret.textContent = data.patron.secret;

  // 5. Tavern Staff Roster Table
  const staffCountEl = document.getElementById('t-staff-count');
  if (staffCountEl) staffCountEl.textContent = `${data.roster.length} сотрудников`;

  const rosterTbody = document.getElementById('t-roster-tbody');
  if (rosterTbody) {
    rosterTbody.innerHTML = data.roster.map(s => `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td><span style="color:var(--accent-primary); font-weight:600;">${s.role}</span></td>
        <td>${s.race}</td>
        <td>${s.age}</td>
        <td style="font-size:0.78rem;">${s.trait}</td>
        <td style="font-size:0.78rem; color:var(--text-muted);">${s.skill}</td>
      </tr>
    `).join('');
  }

  // 6. Visitors Table
  const visitorsCountEl = document.getElementById('t-visitors-count');
  if (visitorsCountEl) visitorsCountEl.textContent = `${data.visitors.length} гостей`;

  const visitorsTbody = document.getElementById('t-visitors-tbody');
  if (visitorsTbody) {
    visitorsTbody.innerHTML = data.visitors.map(v => `
      <tr>
        <td><strong>${v.name}</strong></td>
        <td>${v.role}</td>
        <td><span class="result-badge" style="margin:0;">${v.dndClass}</span></td>
        <td>${v.race}</td>
        <td>${v.age}</td>
        <td style="font-size:0.78rem;">${v.activity}</td>
      </tr>
    `).join('');
  }

  // 7. Menu & Prices Table
  const menuTbody = document.getElementById('t-menu-tbody');
  if (menuTbody) {
    menuTbody.innerHTML = data.menu.map(m => `
      <tr style="${m.isSpecial ? 'background: rgba(212, 175, 55, 0.08);' : ''}">
        <td><small style="color:var(--text-muted); font-weight:600;">${m.category}</small></td>
        <td><strong>${m.name}</strong></td>
        <td><span class="cost-badge">${m.cost}</span></td>
        <td>${m.isSpecial ? '<span class="badge-special">Особое ⭐</span>' : '—'}</td>
        <td style="font-size:0.78rem; color:var(--text-secondary);">${m.desc}</td>
      </tr>
    `).join('');
  }
}

function copyTavernSummary() {
  const d = tavernState.currentData;
  if (!d) return;

  const btn = document.getElementById('btn-copy-tavern-summary');

  const text = `
🏰 ${d.tavern.name} (${d.tavern.category}, ${d.tavern.type})
Местность: ${d.tavern.location}
Атмосфера: ${d.tavern.atmosphere} — ${d.tavern.atmosphereDesc}
Заполненность: ${d.tavern.crowdDesc}

👤 Владелец: ${d.patron.fullName} (${d.patron.race}, ${d.patron.genderText}, ${d.patron.age} лет)
- Особенность: ${d.patron.quirk}
- Тайна: ${d.patron.secret}

⭐ Особое меню региона (${d.tavern.location}):
- Фирменное блюдо: ${d.tavern.specialPair.dish}
- Фирменный напиток: ${d.tavern.specialPair.drink}

🗣️ Слух дня: «${d.tavern.rumor}»
⚡ Происшествие: ${d.tavern.event}

🛏️ Номера (${d.rooms.length} комнат):
${d.rooms.map(r => `  - №${r.roomNumber} ${r.typeDesc} | ${r.cost} | ${r.status}${r.tenant ? ` (${r.tenant})` : ''} [${r.note}]`).join('\n')}

👥 Персонал:
${d.roster.map(s => `  - ${s.role}: ${s.name} (${s.race}, ${s.age} л.) — ${s.trait}`).join('\n')}

🎲 Завсегдатаи и гости (${d.visitors.length} чел.):
${d.visitors.map(v => `  - ${v.name} (${v.role}, ${v.dndClass}, ${v.race}) — ${v.activity}`).join('\n')}
`.trim();

  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      btn.innerHTML = '<span>✔</span><span>Скопировано!</span>';
      setTimeout(() => {
        btn.innerHTML = '<span>📋</span><span>Копировать сводку</span>';
      }, 2000);
    }
  });
}

