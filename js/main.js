/**
 * Randomattic - Main Application Controller
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
  randInt,
  pickOne
} from './utils/index.js';

// Текущее состояние приложения
const state = {
  selectedCategory: 'all',
  searchQuery: ''
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
});

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
// Рендер карточек генераторов
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

  // Привязываем кнопки карточек
  grid.querySelectorAll('.card-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const genId = btn.dataset.genId;
      handleCardAction(genId);
    });
  });

  // Привязываем кнопки обновления примера
  grid.querySelectorAll('.btn-reroll-example').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const genId = btn.dataset.genId;
      rerollCardExample(genId);
    });
  });
}

function createCardHTML(gen) {
  const tagsHTML = gen.tags.map(t => `<span class="card-tag">#${t}</span>`).join('');

  return `
    <article class="generator-card" data-id="${gen.id}">
      <div class="card-header">
        <div class="card-icon-title-group">
          <div class="card-icon">${gen.icon}</div>
          <div>
            <h3 class="card-title">${gen.title}</h3>
          </div>
        </div>
        <span class="card-badge badge-${gen.badgeType}">${gen.badge}</span>
      </div>

      <p class="card-description">${gen.description}</p>

      <div class="card-example-box">
        <div class="card-example-header">
          <span>Пример результата</span>
          <button class="btn-reroll-example" data-gen-id="${gen.id}" title="Сгенерировать другой пример" style="color:var(--color-accent);font-size:0.8rem;">🔄 Ещё</button>
        </div>
        <p class="card-example-text" id="example-text-${gen.id}">${gen.exampleOutput}</p>
      </div>

      <div class="card-tags">
        ${tagsHTML}
      </div>

      <button class="card-action-btn" data-gen-id="${gen.id}">
        <span>${gen.actionText}</span>
        <span>→</span>
      </button>
    </article>
  `;
}

// ==========================================================================
// Динамический реролл примера прямо на карточке
// ==========================================================================
function rerollCardExample(genId) {
  const el = document.getElementById(`example-text-${genId}`);
  if (!el) return;

  switch (genId) {
    case 'dice-roller': {
      const roll = rollFormula('2d20kh1 + 1d8 + 3');
      el.textContent = `Бросок: ${roll.formula} = ${roll.total} (Детали: ${roll.breakdown})`;
      break;
    }
    case 'currency-converter': {
      const randomCp = randInt(250, 4500);
      const coins = fromCopper(randomCp);
      el.textContent = `${randomCp} медных монет = ${formatCoins(coins)}`;
      break;
    }
    case 'name-generator': {
      const firstNames = ['Тариэль', 'Брунхильда', 'Мордред', 'Люмиэль', 'Корвак', 'Гримрок', 'Изольда'];
      const epithets = ['Звездочёт', 'Железный Кулак', 'Шепчущий в Тенях', 'Пепельное Сердце', 'Громобой', 'Лунный Клык'];
      const races = ['полуэльф', 'дварф', 'тифлинг', 'человек', 'дроу'];
      el.textContent = `«${pickOne(firstNames)} ${pickOne(epithets)}» — ${pickOne(races)}.`;
      break;
    }
    case 'tavern-generator': {
      const names = ['«Гарцующий Грифон»', '«Ржавая Секира»', '«Убежище Контрабандиста»', '«Кружка с Дыркой»', '«Око Бехолдера»'];
      const drinks = ['эль "Гномья Ярость" (4 мм)', 'огненная настойка на коре мандрагоры (2 см)', 'эльфийское белое вино (1 зм)'];
      const gossip = ['в старых шахтах слышен гул барабанов', 'дочь барона сбежала с труппой менестрелей', 'местный кузнец скупает серебро'];
      el.textContent = `${pickOne(names)} — фирменный напиток: ${pickOne(drinks)}; слух: ${pickOne(gossip)}.`;
      break;
    }
    case 'loot-generator': {
      const cr = randInt(1, 10);
      const gp = randInt(10, 250);
      const trinkets = ['старинное серебряное зеркальце', 'шелковый мешочек с рубиновой крошкой', 'медный ключ с гравировкой дракона'];
      el.textContent = `Сундук (CR ${cr}): ${gp} зм, ${pickOne(trinkets)} и Свиток заклинания.`;
      break;
    }
    default:
      el.textContent = 'Пример обновлен: создано с помощью утилит Randomattic.';
      break;
  }
}

// ==========================================================================
// Обработка клика по карточке
// ==========================================================================
function handleCardAction(genId) {
  if (genId === 'dice-roller') {
    openDiceDrawer();
    return;
  }

  // Для остальных генераторов в первой версии открываем быстрый интерактив
  rerollCardExample(genId);
  const card = document.querySelector(`[data-id="${genId}"]`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.boxShadow = '0 0 30px var(--color-accent)';
    setTimeout(() => {
      card.style.boxShadow = '';
    }, 1000);
  }
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
// Быстрый дайс-роллер (Quick Dice Drawer)
// ==========================================================================
function setupDiceDrawer() {
  const openBtn = document.getElementById('btn-open-dice');
  const closeBtn = document.getElementById('dice-drawer-close');
  const overlay = document.getElementById('dice-drawer-overlay');
  const drawer = document.getElementById('dice-drawer');

  if (openBtn) openBtn.addEventListener('click', openDiceDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDiceDrawer);
  if (overlay) overlay.addEventListener('click', closeDiceDrawer);

  // Клики по стандартным кубикам
  document.querySelectorAll('.dice-die-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sides = parseInt(btn.dataset.sides, 10) || 20;
      const result = rollDie(sides);
      displayDiceResult(result, `1d${sides}`);
    });
  });

  // Преимущество / Помеха
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

  // Кастомная формула
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

  // Очистка истории
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
