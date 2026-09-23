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
import {
  generateFullNPC,
  getRussianAgeWord,
  NPC_RACE_AGE_RANGES,
  NPC_HALFBREED_ORIGINS
} from './generators/npc.js';
import { generateTavern } from './generators/taverns.js';
import { generateLoot } from './generators/loot.js';
import { generateD20Event } from './generators/d20.js';
import {
  generateTavernEnhanced,
  BIOMES,
  TAVERN_TYPES,
  TAVERN_CATEGORIES,
  RACE_PORTRAIT_KEYS,
  OCCUPANCY_LEVELS
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

  if (boardEl) boardEl.style.display = 'none';
  if (genEl) {
    genEl.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Все экраны генераторов используют широкий презентационный режим
  if (mainContainer) mainContainer.classList.add('container-fluid-tavern');

  const namesWs = document.getElementById('names-dashboard-workspace');
  const lootWs = document.getElementById('loot-dashboard-workspace');
  const d20Ws = document.getElementById('d20-dashboard-workspace');
  const tavernWs = document.getElementById('tavern-dashboard-workspace');

  if (namesWs) namesWs.style.display = 'none';
  if (lootWs) lootWs.style.display = 'none';
  if (d20Ws) d20Ws.style.display = 'none';
  if (tavernWs) tavernWs.style.display = 'none';

  if (viewId === 'names') {
    if (namesWs) {
      namesWs.style.display = 'flex';
      initNamesDashboard();
    }
  } else if (viewId === 'loot') {
    if (lootWs) {
      lootWs.style.display = 'flex';
      initLootDashboard();
    }
  } else if (viewId === 'tavern') {
    if (tavernWs) {
      tavernWs.style.display = 'flex';
      initTavernDashboard();
    }
  } else {
    // d20-hub, d20-wild-magic, d20-secret-societies, d20-artefacts, d20-potions
    if (d20Ws) {
      d20Ws.style.display = 'flex';
      initD20Dashboard(viewId);
    }
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

  const namesWs = document.getElementById('names-dashboard-workspace');
  const lootWs = document.getElementById('loot-dashboard-workspace');
  const d20Ws = document.getElementById('d20-dashboard-workspace');
  const tavernWs = document.getElementById('tavern-dashboard-workspace');

  if (mainContainer) mainContainer.classList.remove('container-fluid-tavern');
  if (namesWs) namesWs.style.display = 'none';
  if (lootWs) lootWs.style.display = 'none';
  if (d20Ws) d20Ws.style.display = 'none';
  if (tavernWs) tavernWs.style.display = 'none';

  if (boardEl) boardEl.style.display = 'block';
  if (genEl) genEl.style.display = 'none';
}

function setupGeneratorViewEvents() {
  setupNamesEvents();
  setupLootEvents();
  setupD20Events();
  document.getElementById('btn-back-from-tavern')?.addEventListener('click', () => closeGeneratorView());
}

// ==========================================================================
// 1. ГЕНЕРАТОР НИП И ПЕРСОНАЖЕЙ (NPC & CHARACTERS DASHBOARD CONTROLLER)
// ==========================================================================
const namesState = {
  initialized: false,
  locks: {
    race: false,
    gender: false,
    profession: false,
    age: false,
    origin: false,
    appCount: false,
    persCount: false,
    count: false
  },
  lastNPC: null
};

function initNamesDashboard() {
  setupNamesEvents();
  executeNamesGenerator();
}

function updateHalfbreedControlsVisibility(raceKey) {
  const halfbreedRow = document.getElementById('n-halfbreed-row');
  const kinWrapper = document.getElementById('n-halfelf-kin-wrapper');
  const originSelect = document.getElementById('n-param-origin');
  if (!halfbreedRow || !originSelect) return;

  if (raceKey === 'halfelf' || raceKey === 'halforc') {
    halfbreedRow.style.display = 'flex';
    const origins = NPC_HALFBREED_ORIGINS[raceKey] || [];
    
    const currentVal = originSelect.value;
    originSelect.innerHTML = `<option value="any">🎲 Случайное воспитание</option>` +
      origins.map(o => `<option value="${o.id}">${o.title}</option>`).join('');

    if (currentVal && origins.some(o => o.id === currentVal)) {
      originSelect.value = currentVal;
    }

    if (kinWrapper) {
      kinWrapper.style.display = (raceKey === 'halfelf') ? 'block' : 'none';
    }
  } else {
    halfbreedRow.style.display = 'none';
    if (kinWrapper) kinWrapper.style.display = 'none';
  }
}

function updateAgeSliderForRace(raceKey) {
  const ageSlider = document.getElementById('n-param-age');
  const ageVal = document.getElementById('n-val-age');
  if (!ageSlider || !ageVal) return;

  const range = NPC_RACE_AGE_RANGES[raceKey] || NPC_RACE_AGE_RANGES.human;
  ageSlider.min = range.min;
  ageSlider.max = range.max;

  if (!namesState.locks.age) {
    const defaultVal = range.mature || Math.round((range.min + range.max) / 3);
    ageSlider.value = defaultVal;
    ageVal.textContent = `${defaultVal} ${getRussianAgeWord(defaultVal)}`;
  }
}

function setupNamesEvents() {
  if (namesState.initialized) return;
  namesState.initialized = true;

  // Кнопка «Назад»
  document.getElementById('btn-back-from-names')?.addEventListener('click', () => closeGeneratorView());

  // Замки блокировки
  const lockDefs = [
    { id: 'btn-lock-n-race', key: 'race' },
    { id: 'btn-lock-n-gender', key: 'gender' },
    { id: 'btn-lock-n-profession', key: 'profession' },
    { id: 'btn-lock-n-age', key: 'age' },
    { id: 'btn-lock-n-origin', key: 'origin' },
    { id: 'btn-lock-n-app-count', key: 'appCount' },
    { id: 'btn-lock-n-pers-count', key: 'persCount' },
    { id: 'btn-lock-n-count', key: 'count' }
  ];

  lockDefs.forEach(({ id, key }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      namesState.locks[key] = !namesState.locks[key];
      btn.classList.toggle('locked', namesState.locks[key]);
      btn.textContent = namesState.locks[key] ? '🔒' : '🔓';
    });
  });

  // Изменение расы: адаптируем слайдер возраста и видимость настроек полукровки
  const raceSelect = document.getElementById('n-param-race');
  if (raceSelect) {
    raceSelect.addEventListener('change', (e) => {
      const selectedRace = e.target.value;
      updateAgeSliderForRace(selectedRace);
      updateHalfbreedControlsVisibility(selectedRace);
    });
  }

  // Слайдер возраста
  const ageSlider = document.getElementById('n-param-age');
  const ageVal = document.getElementById('n-val-age');
  if (ageSlider && ageVal) {
    ageSlider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      ageVal.textContent = `${val} ${getRussianAgeWord(val)}`;
    });
  }

  // Кнопка генерации
  document.getElementById('btn-reroll-names')?.addEventListener('click', () => {
    executeNamesGenerator();
  });

  // Сбросить все замки
  document.getElementById('btn-unlock-all-names')?.addEventListener('click', () => {
    lockDefs.forEach(({ id, key }) => {
      namesState.locks[key] = false;
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.remove('locked');
        btn.textContent = '🔓';
      }
    });
  });

  // Копировать краткое структурированное описание (Requirement 9)
  document.getElementById('btn-copy-narrative')?.addEventListener('click', () => {
    if (!namesState.lastNPC) return;
    const text = namesState.lastNPC.structuredSummary;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-copy-narrative');
      if (btn) {
        btn.innerHTML = '✔ Скопировано!';
        setTimeout(() => {
          btn.innerHTML = '📋 Копировать';
        }, 1800);
      }
    });
  });

  // Копировать полное досье НИПа
  document.getElementById('btn-copy-names-summary')?.addEventListener('click', () => {
    if (!namesState.lastNPC) return;
    const npc = namesState.lastNPC;
    const text = npc.fullDossierText || npc.structuredSummary;

    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-copy-names-summary');
      if (btn) {
        btn.innerHTML = '<span>✔</span><span>Скопировано!</span>';
        setTimeout(() => {
          btn.innerHTML = '<span>📋</span><span>Копировать НИПа</span>';
        }, 2000);
      }
    });
  });
}

function executeNamesGenerator() {
  const raceEl = document.getElementById('n-param-race');
  const genderEl = document.getElementById('n-param-gender');
  const profEl = document.getElementById('n-param-profession');
  const ageEl = document.getElementById('n-param-age');
  const ageVal = document.getElementById('n-val-age');
  const originEl = document.getElementById('n-param-origin');
  const elfkinEl = document.getElementById('n-param-elfkin');
  const appCountEl = document.getElementById('n-param-app-count');
  const persCountEl = document.getElementById('n-param-pers-count');
  const countEl = document.getElementById('n-param-count');

  const race = (namesState.locks.race && raceEl) ? raceEl.value : (raceEl?.value || 'any');
  const gender = (namesState.locks.gender && genderEl) ? genderEl.value : (genderEl?.value || 'any');
  const profession = (namesState.locks.profession && profEl) ? profEl.value : (profEl?.value || 'any');
  const age = (namesState.locks.age && ageEl) ? Number(ageEl.value) : 'random';
  const halfbreedOrigin = (namesState.locks.origin && originEl) ? originEl.value : (originEl?.value || 'any');
  const elfKinAll = elfkinEl ? elfkinEl.checked : true;
  const appearanceCount = (namesState.locks.appCount && appCountEl) ? Number(appCountEl.value) : Number(appCountEl?.value || 2);
  const personalityCount = (namesState.locks.persCount && persCountEl) ? Number(persCountEl.value) : Number(persCountEl?.value || 1);
  const count = (namesState.locks.count && countEl) ? Number(countEl.value) : Number(countEl?.value || 3);

  const npc = generateFullNPC({
    race,
    gender,
    profession,
    age,
    halfbreedOrigin,
    elfKinAll,
    appearanceCount,
    personalityCount,
    count
  });

  namesState.lastNPC = npc;

  // Если возраст не был заблокирован, синхронизируем контрол слайдера
  if (!namesState.locks.age && ageEl && ageVal) {
    const range = NPC_RACE_AGE_RANGES[npc.raceKey] || NPC_RACE_AGE_RANGES.human;
    ageEl.min = range.min;
    ageEl.max = range.max;
    ageEl.value = npc.age;
    ageVal.textContent = `${npc.age} ${npc.ageWord}`;
  }

  // Обновляем видимость настроек полукровки
  updateHalfbreedControlsVisibility(npc.raceKey);

  // Портрет
  const portraitImg = document.getElementById('hero-portrait-img');
  if (portraitImg) {
    portraitImg.src = npc.portraitPath;
    portraitImg.onerror = () => {
      portraitImg.src = 'assets/images/portraits/human_male.jpg';
    };
  }

  // Имя и бейдж
  const nameTitle = document.getElementById('hero-name-title');
  if (nameTitle) nameTitle.textContent = npc.name;

  const roleBadge = document.getElementById('hero-badge-role');
  if (roleBadge) {
    roleBadge.textContent = npc.profession
      ? `${npc.profession.icon} ${npc.profession.title}`
      : (npc.ageStage === 'old' ? 'Старейшина' : (npc.ageStage === 'young' ? 'Молодой' : 'Зрелый'));
  }

  // Бейджи
  const badgesList = document.getElementById('hero-badges-list');
  if (badgesList) {
    let badgesHtml = `
      <span class="tavern-card-badge">${npc.race}</span>
      <span class="tavern-card-badge">${npc.gender}</span>
      <span class="tavern-card-badge" style="background:rgba(212, 175, 55, 0.2); border-color:#ffd54f; color:#ffd54f;">${npc.ageFormatted}</span>
    `;
    if (npc.profession) {
      badgesHtml += `<span class="tavern-card-badge" style="background:rgba(212, 175, 55, 0.25); border-color:#ffd54f; color:#ffe082;">${npc.profession.icon} ${npc.profession.title}</span>`;
    }
    if (npc.isHalfbreed && npc.halfbreedOrigin) {
      badgesHtml += `<span class="tavern-card-badge" style="background:rgba(120, 80, 200, 0.2); border-color:#b388ff; color:#d1c4e9;">${npc.halfbreedOrigin.title}</span>`;
    }
    badgesList.innerHTML = badgesHtml;
  }

  // Сводное краткое описание (Requirement 9)
  const narrativeText = document.getElementById('npc-narrative-text');
  if (narrativeText) {
    narrativeText.textContent = `«${npc.structuredSummary}»`;
  }

  // Детализация: Внешность, Характер (Дарование + Взаимодействие + Манера), Характеристики, Привязанность, Слабость, Идеал
  const detailsGrid = document.getElementById('hero-details-grid');
  if (detailsGrid) {
    let detailsHtml = '<div class="npc-details-container">';

    // Профессия и роль
    if (npc.profession) {
      detailsHtml += `
        <div class="npc-detail-block">
          <div class="npc-detail-title">💼 Профессия & Роль:</div>
          <div class="npc-detail-content"><strong>${npc.profession.icon} ${npc.profession.title}</strong> — ${npc.profession.role}</div>
        </div>
      `;
    }

    // 1. Внешность (DMG «ВНЕШНОСТЬ ПМ», к20, может быть несколько)
    const appBadges = npc.appearance.items.map(it => `<span class="npc-tag-badge">👁️ ${it.name}</span>`).join(' ');
    detailsHtml += `
      <div class="npc-detail-block">
        <div class="npc-detail-title">👗 Внешность (к20 DMG):</div>
        <div class="npc-detail-tags">${appBadges}</div>
        <div class="npc-detail-subtext">${npc.appearance.textSummary}</div>
      </div>
    `;

    // 2. Характер = Дарование (к20) + Взаимодействие (к12) + Манера (к20)
    detailsHtml += `
      <div class="npc-detail-block">
        <div class="npc-detail-title">🧠 Характер (DMG):</div>
        <div class="npc-character-grid">
          <div class="npc-char-item"><span class="char-lbl">🎯 Дарование:</span> <strong>${npc.character.talentText}</strong></div>
          <div class="npc-char-item"><span class="char-lbl">🤝 Взаимодействие:</span> <strong>${npc.character.interactionText}</strong> <span class="char-desc">(${npc.character.interactions.map(i => i.desc).join(', ')})</span></div>
          <div class="npc-char-item"><span class="char-lbl">🎭 Манера:</span> <strong>${npc.character.mannerismText}</strong></div>
        </div>
      </div>
    `;

    // 3. Отдельно: Характеристики (Высокая и Низкая, к6 DMG)
    detailsHtml += `
      <div class="npc-detail-block">
        <div class="npc-detail-title">⚔️ Характеристики (к6 DMG):</div>
        <div class="npc-abilities-row">
          <div class="ability-pill high">
            <span class="ability-icon">🔼</span>
            <span class="ability-name">Высокая: ${npc.abilities.high.stat}</span>
            <span class="ability-desc">(${npc.abilities.high.desc})</span>
          </div>
          <div class="ability-pill low">
            <span class="ability-icon">🔽</span>
            <span class="ability-name">Низкая: ${npc.abilities.low.stat}</span>
            <span class="ability-desc">(${npc.abilities.low.desc})</span>
          </div>
        </div>
      </div>
    `;

    // 4. Отдельно: Идеал, Привязанность, Слабость
    detailsHtml += `
      <div class="npc-detail-block">
        <div class="npc-triad-grid">
          <div class="triad-item">
            <span class="triad-label">⚖️ Идеал (к6):</span>
            <div class="triad-value"><strong>${npc.ideal.name}</strong> <span class="triad-cat">(${npc.ideal.category})</span></div>
          </div>
          <div class="triad-item">
            <span class="triad-label">🔗 Привязанность (к10):</span>
            <div class="triad-value"><strong>${npc.bond.textSummary}</strong></div>
          </div>
          <div class="triad-item">
            <span class="triad-label">🗝️ Слабость (к12):</span>
            <div class="triad-value"><strong>${npc.flaw.textSummary}</strong></div>
          </div>
        </div>
      </div>
    `;

    // Воспитание полукровки (если применимо)
    if (npc.isHalfbreed && npc.halfbreedOrigin) {
      detailsHtml += `
        <div class="npc-detail-block">
          <div class="npc-detail-title">🏡 Воспитание & Культура:</div>
          <div class="npc-detail-content">${npc.halfbreedOrigin.description}</div>
        </div>
      `;
    }

    detailsHtml += '</div>';
    detailsGrid.innerHTML = detailsHtml;
  }

  // Таблица альтернативных вариантов
  const tbody = document.getElementById('tbody-names-variants');
  if (tbody) {
    tbody.innerHTML = npc.variants.map(v => `
      <tr>
        <td style="text-align: center; font-weight: 700; color: var(--accent-primary);">${v.id}</td>
        <td><strong style="color: #f0c97d;">${v.fullName}</strong></td>
        <td><span class="tavern-card-badge" style="font-size: 0.78rem; background: rgba(212, 175, 55, 0.15); border-color: #ffd54f; color: #ffe082;">${v.professionTitle}</span></td>
        <td>${v.race}</td>
        <td>${v.gender}</td>
        <td><span class="tavern-card-badge">${v.age}</span></td>
        <td>
          <div style="font-size: 0.78rem; line-height: 1.3;">
            <div>⚖️ <strong>${v.ideal.name}</strong> <span style="color: var(--text-muted);">(${v.ideal.category})</span></div>
            <div style="color: var(--text-muted);">🤝 ${v.character.interactionText} • 🎭 ${v.character.mannerismText}</div>
          </div>
        </td>
        <td style="text-align: right;">
          <button class="btn-mini-copy" data-copy="${v.fullDossierText.replace(/"/g, '&quot;')}" title="Копировать полное досье">📋 Досье</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-mini-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.copy).then(() => {
          btn.textContent = '✔ Копия';
          setTimeout(() => {
            btn.textContent = '📋 Досье';
          }, 1500);
        });
      });
    });
  }
}

// ==========================================================================
// 2. СОКРОВИЩА И ЛУТ (LOOT & TREASURE HOARD DASHBOARD CONTROLLER)
// ==========================================================================
const lootDashboardState = {
  initialized: false,
  locks: {
    cr: false,
    type: false,
    mult: false
  },
  lastLoot: null
};

function initLootDashboard() {
  setupLootEvents();
  executeLootGenerator();
}

function setupLootEvents() {
  if (lootDashboardState.initialized) return;
  lootDashboardState.initialized = true;

  document.getElementById('btn-back-from-loot')?.addEventListener('click', () => closeGeneratorView());

  const lockDefs = [
    { id: 'btn-lock-l-cr', key: 'cr' },
    { id: 'btn-lock-l-type', key: 'type' },
    { id: 'btn-lock-l-mult', key: 'mult' }
  ];

  lockDefs.forEach(({ id, key }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      lootDashboardState.locks[key] = !lootDashboardState.locks[key];
      btn.classList.toggle('locked', lootDashboardState.locks[key]);
      btn.textContent = lootDashboardState.locks[key] ? '🔒' : '🔓';
    });
  });

  document.getElementById('btn-reroll-loot')?.addEventListener('click', () => {
    executeLootGenerator();
  });

  document.getElementById('btn-unlock-all-loot')?.addEventListener('click', () => {
    lockDefs.forEach(({ id, key }) => {
      lootDashboardState.locks[key] = false;
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.remove('locked');
        btn.textContent = '🔓';
      }
    });
  });

  document.getElementById('btn-copy-loot-summary')?.addEventListener('click', () => {
    if (!lootDashboardState.lastLoot) return;
    const l = lootDashboardState.lastLoot;
    const text = `Добыча [${l.tierLabel} | ${l.type}]\nОбщая стоимость: ~${l.totalEstimatedGp.toLocaleString('ru-RU')} зм\nМонеты: ${l.coinsFormatted}\nСамоцветы: ${l.gems.map(g => `${g.name} x${g.count} (${g.totalGp} зм)`).join('; ') || 'нет'}\nЦенности: ${l.arts.map(a => `${a.name} (${a.valueGp} зм)`).join('; ') || 'нет'}\nМагия: ${l.magicItems.map(m => `${m.name} [${m.rarityLabel}]`).join('; ') || 'нет'}`;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-copy-loot-summary');
      if (btn) {
        btn.innerHTML = '<span>✔</span><span>Скопировано!</span>';
        setTimeout(() => {
          btn.innerHTML = '<span>📋</span><span>Копировать опись</span>';
        }, 2000);
      }
    });
  });
}

function executeLootGenerator() {
  const crEl = document.getElementById('l-param-cr');
  const typeEl = document.getElementById('l-param-type');
  const multEl = document.getElementById('l-param-mult');

  const crTier = (lootDashboardState.locks.cr && crEl) ? crEl.value : (crEl?.value || '0-4');
  const type = (lootDashboardState.locks.type && typeEl) ? typeEl.value : (typeEl?.value || 'hoard');
  const multiplier = (lootDashboardState.locks.mult && multEl) ? parseFloat(multEl.value) : parseFloat(multEl?.value || '1.0');

  const loot = generateLoot({ crTier, type, multiplier });
  lootDashboardState.lastLoot = loot;

  // Сводка
  const tierBadge = document.getElementById('hoard-badge-tier');
  if (tierBadge) tierBadge.textContent = loot.tierLabel;

  const totalVal = document.getElementById('hoard-total-val');
  if (totalVal) totalVal.textContent = `~${loot.totalEstimatedGp.toLocaleString('ru-RU')} зм`;

  const summaryStats = document.getElementById('hoard-summary-stats');
  if (summaryStats) {
    summaryStats.innerHTML = `
      <p><strong>📦 Категория:</strong> ${loot.type}</p>
      <p><strong>🪙 Монеты в золоте:</strong> ${loot.coinsGp.toLocaleString('ru-RU')} зм</p>
      <p><strong>💎 Драгоценности:</strong> ${(loot.gemsGp + loot.artsGp).toLocaleString('ru-RU')} зм</p>
      <p><strong>✨ Магических находок:</strong> ${loot.magicItems.length} шт.</p>
    `;
  }

  // Таблица монет
  const tbodyCoins = document.getElementById('tbody-loot-coins');
  if (tbodyCoins) {
    const coinRows = [
      { name: 'Медные монеты (мм / CP)', count: loot.coins.cp, gp: (loot.coins.cp / 100).toFixed(2), cls: 'coin-cp', icon: '🥉' },
      { name: 'Серебряные монеты (см / SP)', count: loot.coins.sp, gp: (loot.coins.sp / 10).toFixed(1), cls: 'coin-sp', icon: '⚪' },
      { name: 'Электрумовые монеты (эм / EP)', count: loot.coins.ep, gp: (loot.coins.ep / 2).toFixed(1), cls: 'coin-ep', icon: '🔘' },
      { name: 'Золотые монеты (зм / GP)', count: loot.coins.gp, gp: loot.coins.gp, cls: 'coin-gp', icon: '🟡' },
      { name: 'Платиновые монеты (пм / PP)', count: loot.coins.pp, gp: loot.coins.pp * 10, cls: 'coin-pp', icon: '💎' }
    ].filter(c => c.count > 0);

    if (coinRows.length === 0) {
      tbodyCoins.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">В кошельке пусто</td></tr>`;
    } else {
      tbodyCoins.innerHTML = coinRows.map(c => `
        <tr>
          <td><span class="coin-badge ${c.cls}">${c.icon} ${c.name}</span></td>
          <td><strong>${c.count.toLocaleString('ru-RU')}</strong></td>
          <td style="text-align: right;"><span class="cost-badge">${c.gp} зм</span></td>
        </tr>
      `).join('') + `
        <tr style="border-top: 2px solid var(--border-color, #5a422e); background: rgba(0,0,0,0.3);">
          <td colspan="2"><strong>Всего в монетах:</strong></td>
          <td style="text-align: right;"><strong style="color: #ffd54f;">${loot.coinsGp.toLocaleString('ru-RU')} зм</strong></td>
        </tr>
      `;
    }
  }

  // Таблица самоцветов и искусства
  const tbodyGems = document.getElementById('tbody-loot-gems');
  if (tbodyGems) {
    const items = [...loot.gems, ...loot.arts];
    if (items.length === 0) {
      tbodyGems.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Драгоценных камней и редкостей нет</td></tr>`;
    } else {
      tbodyGems.innerHTML = items.map(item => `
        <tr>
          <td>
            <strong>${item.name}</strong>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${item.category || item.desc || ''}</div>
          </td>
          <td>${item.count} шт.</td>
          <td style="text-align: right;"><span class="cost-badge">${item.totalGp} зм</span></td>
        </tr>
      `).join('');
    }
  }

  // Таблица магии
  const tbodyMagic = document.getElementById('tbody-loot-magic');
  if (tbodyMagic) {
    if (loot.magicItems.length === 0) {
      tbodyMagic.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Магических предметов не обнаружено</td></tr>`;
    } else {
      tbodyMagic.innerHTML = loot.magicItems.map(m => `
        <tr>
          <td><strong style="color: #ffd54f;">${m.name}</strong></td>
          <td><span class="tavern-card-badge">${m.type}</span></td>
          <td><span class="rarity-badge rarity-${m.rarity}">${m.rarityLabel}</span></td>
          <td style="font-size: 0.78rem; color: var(--text-primary);">${m.desc}</td>
        </tr>
      `).join('');
    }
  }
}

// ==========================================================================
// 3. D20 ТАБЛИЦЫ СОБЫТИЙ (D20 TABLES DASHBOARD CONTROLLER)
// ==========================================================================
const d20DashboardState = {
  initialized: false,
  locks: {
    table: false,
    roll: false
  },
  activeTableId: 'fallen-gods',
  lastEvent: null
};

function initD20Dashboard(viewId) {
  setupD20Events();

  // Заполнение селектора таблиц D20
  const tableSelect = document.getElementById('d20-param-table');
  if (tableSelect && tableSelect.children.length === 0) {
    tableSelect.innerHTML = D20_CATALOG.map(t => `
      <option value="${t.id}">${t.icon} ${t.title}</option>
    `).join('');
  }

  // Заполнение селектора броска
  const rollSelect = document.getElementById('d20-param-roll');
  if (rollSelect && rollSelect.children.length === 0) {
    let options = '<option value="random">🎲 Случайный бросок d20</option>';
    for (let i = 1; i <= 20; i++) {
      options += `<option value="${i}">Выпало на кости: ${i}</option>`;
    }
    rollSelect.innerHTML = options;
  }

  // Прямая адресация из каталога
  const directMap = {
    'd20-wild-magic': 'wild-magic',
    'd20-secret-societies': 'secret-societies',
    'd20-artefacts': 'artefacts-clues',
    'd20-potions': 'strange-potions'
  };

  if (directMap[viewId] && !d20DashboardState.locks.table) {
    d20DashboardState.activeTableId = directMap[viewId];
    if (tableSelect) tableSelect.value = directMap[viewId];
  } else if (!d20DashboardState.locks.table && tableSelect) {
    d20DashboardState.activeTableId = tableSelect.value || 'fallen-gods';
  }

  executeD20DashboardGenerator();
}

function setupD20Events() {
  if (d20DashboardState.initialized) return;
  d20DashboardState.initialized = true;

  document.getElementById('btn-back-from-d20')?.addEventListener('click', () => closeGeneratorView());

  const lockDefs = [
    { id: 'btn-lock-d20-table', key: 'table' },
    { id: 'btn-lock-d20-roll', key: 'roll' }
  ];

  lockDefs.forEach(({ id, key }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      d20DashboardState.locks[key] = !d20DashboardState.locks[key];
      btn.classList.toggle('locked', d20DashboardState.locks[key]);
      btn.textContent = d20DashboardState.locks[key] ? '🔒' : '🔓';
    });
  });

  document.getElementById('btn-reroll-d20')?.addEventListener('click', () => {
    executeD20DashboardGenerator();
  });

  document.getElementById('btn-unlock-all-d20')?.addEventListener('click', () => {
    lockDefs.forEach(({ id, key }) => {
      d20DashboardState.locks[key] = false;
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.remove('locked');
        btn.textContent = '🔓';
      }
    });
  });

  document.getElementById('btn-copy-d20-summary')?.addEventListener('click', () => {
    if (!d20DashboardState.lastEvent) return;
    const ev = d20DashboardState.lastEvent;
    const text = `[${ev.tableTitle}] d20: ${ev.roll}\n${ev.text}\nСовет Мастеру: ${ev.dmTip}`;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-copy-d20-summary');
      if (btn) {
        btn.innerHTML = '<span>✔</span><span>Скопировано!</span>';
        setTimeout(() => {
          btn.innerHTML = '<span>📋</span><span>Копировать событие</span>';
        }, 2000);
      }
    });
  });
}

function executeD20DashboardGenerator() {
  const tableEl = document.getElementById('d20-param-table');
  const rollEl = document.getElementById('d20-param-roll');

  const tableId = (d20DashboardState.locks.table && tableEl) ? tableEl.value : (tableEl?.value || d20DashboardState.activeTableId);
  const rollVal = (d20DashboardState.locks.roll && rollEl) ? rollEl.value : (rollEl?.value || 'random');
  const rollNum = rollVal !== 'random' ? parseInt(rollVal, 10) : undefined;

  const eventData = generateD20Event({ tableId, rollNum });
  d20DashboardState.lastEvent = eventData;
  d20DashboardState.activeTableId = eventData.tableId;

  if (tableEl && tableEl.value !== eventData.tableId) {
    tableEl.value = eventData.tableId;
  }

  // Шапка D20
  const headerTitle = document.getElementById('d20-header-title');
  if (headerTitle) headerTitle.textContent = `RAND-OM-ATTIC | ${eventData.tableTitle}`;

  const headerSub = document.getElementById('d20-header-subtitle');
  if (headerSub) headerSub.textContent = eventData.tableDescription;

  const headerIcon = document.getElementById('d20-header-icon');
  if (headerIcon) headerIcon.textContent = eventData.icon;

  // Витрина события
  const showcaseTitle = document.getElementById('d20-showcase-title');
  if (showcaseTitle) showcaseTitle.innerHTML = `<span>${eventData.icon}</span> Событие: d20 = ${eventData.roll}`;

  const categoryBadge = document.getElementById('d20-badge-category');
  if (categoryBadge) categoryBadge.textContent = eventData.badge;

  const bannerImg = document.getElementById('d20-banner-img');
  if (bannerImg) {
    bannerImg.src = eventData.bgImage;
    bannerImg.onerror = () => {
      bannerImg.src = 'files/D20/wild_magic.png';
    };
  }

  const tableNameEl = document.getElementById('d20-event-table-name');
  if (tableNameEl) tableNameEl.textContent = eventData.tableTitle;

  const glowNumber = document.getElementById('d20-glow-number');
  if (glowNumber) glowNumber.textContent = `d20: ${eventData.roll}`;

  const eventText = document.getElementById('d20-event-text');
  if (eventText) eventText.textContent = eventData.text;

  const dmTip = document.getElementById('d20-dm-tip');
  if (dmTip) dmTip.innerHTML = `<strong>Совет Мастеру:</strong> ${eventData.dmTip}`;

  // Реестр таблицы 1-20
  const tbody = document.getElementById('tbody-d20-full');
  if (tbody && eventData.items) {
    tbody.innerHTML = eventData.items.map(item => {
      const isRolled = String(item.roll) === String(eventData.roll);
      return `
        <tr class="${isRolled ? 'd20-row-rolled' : ''}" id="d20-row-${item.roll}">
          <td style="text-align: center;">
            <span class="d20-roll-pill">${item.roll}</span>
          </td>
          <td style="font-size: 0.82rem; line-height: 1.4;">
            ${isRolled ? '<strong style="color:#ffd54f;">► </strong>' : ''}${item.text}
          </td>
          <td style="text-align: right;">
            <button class="btn-mini-copy" data-copy="d20 [${item.roll}]: ${item.text}" title="Копировать строку">📋 Копия</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-mini-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.copy).then(() => {
          btn.textContent = '✔ Копия';
          setTimeout(() => {
            btn.textContent = '📋 Копия';
          }, 1500);
        });
      });
    });

    // Плавная прокрутка к активной строке таблицы
    setTimeout(() => {
      const rolledEl = tbody.querySelector('.d20-row-rolled');
      if (rolledEl) {
        rolledEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
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
    setupStaffCardSync();
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

  // 4. Occupancy / Crowd
  const crowdSel = document.getElementById('t-param-crowd');
  if (crowdSel) {
    crowdSel.innerHTML = `<option value="random">🎲 Любая заполненность</option>` +
      OCCUPANCY_LEVELS.map(o => `<option value="${o.id}">${o.name} (${o.formulaDesc})</option>`).join('');
  }

  // 5. Atmospheres
  const atmoSel = document.getElementById('t-param-atmo');
  if (atmoSel) {
    atmoSel.innerHTML = `<option value="random">🎲 Любая атмосфера</option>` +
      TAVERN_DATA.atmospheres.map(a => `<option value="${a.mood}">${a.mood}</option>`).join('');
  }

  // 6. Races
  const raceSel = document.getElementById('p-param-race');
  if (raceSel) {
    const races = Object.keys(RACE_PORTRAIT_KEYS);
    raceSel.innerHTML = `<option value="random">🎲 Любая раса</option>` +
      races.map(r => `<option value="${r}">${r}</option>`).join('');
  }
}

function setupTavernEventListeners() {
  // Back button
  document.getElementById('btn-back-from-tavern')?.addEventListener('click', () => {
    closeGeneratorView();
  });

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
          const concreteVal = item.optKey === 'crowd'
            ? tavernState.currentData.params.occupancy
            : tavernState.currentData.params[item.optKey];
          if (concreteVal) {
            el.value = concreteVal;
          }
        }
        tavernState.options[item.optKey] = el.value;
      }
    });
  });

  // Innkeeper Age slider display value & sync
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
  // Sync options from controls: crowd & age roll dynamically on reroll unless locked!
  TAVERN_LOCK_ITEMS.forEach(item => {
    if (!tavernState.locks[item.lockKey]) {
      if (item.optKey === 'crowd' || item.optKey === 'innkeeperAge') {
        tavernState.options[item.optKey] = 'random';
      } else {
        const el = document.getElementById(item.inputId);
        if (el) {
          tavernState.options[item.optKey] = el.value;
        }
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
  // Occupancy select dynamically updates on reroll unless locked
  if (!tavernState.locks.lockCrowd) {
    const crowdEl = document.getElementById('t-param-crowd');
    if (crowdEl && tavernState.options.crowd !== 'random') {
      crowdEl.value = data.params.occupancy;
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
  // Innkeeper Age slider dynamically updates on reroll unless locked
  if (!tavernState.locks.lockAge) {
    const ageEl = document.getElementById('p-param-age');
    const ageVal = document.getElementById('p-val-age');
    if (ageEl && ageVal) {
      ageEl.value = data.params.innkeeperAge;
      ageVal.textContent = data.params.innkeeperAge;
    }
    tavernState.options.innkeeperAge = data.params.innkeeperAge;
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
      <div class="details-item"><span class="details-label">• Тип и Категория:</span> ${data.tavern.type} (${data.tavern.category})</div>
      <div class="details-item"><span class="details-label">• Описание:</span> <span style="color:var(--accent-primary, #e2b76f); font-style: italic;">«${data.tavern.description}»</span></div>
      <div class="details-item"><span class="details-label">• Владелец:</span> ${data.patron.fullName} (${data.patron.race}, ${data.patron.genderText}, ${data.patron.age} лет)</div>
      <div class="details-item"><span class="details-label">• Заполненность зала:</span> <strong>${data.tavern.occupancy}</strong> (${data.tavern.crowdCount} чел.) — <span style="color:var(--accent-primary, #e2b76f); font-style: italic;">«${data.tavern.occupancyNarrative}»</span></div>
      <div class="details-item"><span class="details-label">• Атмосфера:</span> <strong>${data.tavern.atmosphere}</strong> — ${data.tavern.atmosphereDesc}</div>
      <div class="details-item"><span class="details-label">• Номера и штат:</span> ${data.rooms.length} комнат, персонал: ${data.tavern.staffSummary} + владелец</div>
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
    if (data.rooms.length === 0) {
      roomsTbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 22px 12px; color: var(--text-muted);">
            🚫 <em>В этом заведении нет комнат для ночлега — только общий трапезный зал.</em>
          </td>
        </tr>
      `;
    } else {
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
  if (staffCountEl) staffCountEl.textContent = `${data.roster.length} чел. (${data.tavern.staffSummary})`;

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
  if (visitorsCountEl) {
    visitorsCountEl.textContent = `${data.visitors.length} гостей (${data.tavern.occupancy})`;
  }

  const visitorsTbody = document.getElementById('t-visitors-tbody');
  if (visitorsTbody) {
    if (data.visitors.length === 0) {
      visitorsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 26px 12px; color: var(--text-muted); font-style: italic;">
            🍃 В зале совершенно пусто — ни одной живой души, кроме трактирщика и прислуги.
          </td>
        </tr>
      `;
    } else {
      visitorsTbody.innerHTML = data.visitors.map(v => `
        <tr>
          <td><strong>${v.name}</strong></td>
          <td><span style="color:var(--accent-primary); font-weight:600;">${v.role}</span></td>
          <td><span class="result-badge" style="margin:0;">${v.dndClass}</span></td>
          <td>${v.race}</td>
          <td>${v.age}</td>
          <td style="font-size:0.78rem;">${v.activity}</td>
        </tr>
      `).join('');
    }
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

  // Sync staff roster card height to exactly match tavern details card
  requestAnimationFrame(() => {
    syncStaffCardHeight();
  });
}

function setupStaffCardSync() {
  window.addEventListener('resize', () => {
    syncStaffCardHeight();
  });

  const detailsCard = document.getElementById('card-tavern-details');
  if (detailsCard) {
    const layout = detailsCard.querySelector('.details-layout');
    if (layout && window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        syncStaffCardHeight();
      });
      ro.observe(layout);
    }
    const sketchImg = document.getElementById('t-details-sketch');
    if (sketchImg) {
      sketchImg.addEventListener('load', () => syncStaffCardHeight());
    }
  }
}

function syncStaffCardHeight() {
  const detailsCard = document.getElementById('card-tavern-details');
  const staffCard = document.getElementById('card-tavern-staff');
  if (!detailsCard || !staffCard) return;

  if (window.innerWidth > 1200) {
    const header = detailsCard.querySelector('.tavern-card-header');
    const layout = detailsCard.querySelector('.details-layout');
    
    // Calculate true natural content height of tavern details
    const headerH = header ? header.offsetHeight : 36;
    const layoutH = layout ? layout.offsetHeight : 380;
    // 24px padding (12 top + 12 bottom) + 10px gap + 2px border = 36px
    const naturalHeight = headerH + layoutH + 36;

    if (naturalHeight > 0) {
      detailsCard.style.height = `${naturalHeight}px`;
      detailsCard.style.maxHeight = `${naturalHeight}px`;
      staffCard.style.height = `${naturalHeight}px`;
      staffCard.style.maxHeight = `${naturalHeight}px`;
    }
  } else {
    detailsCard.style.height = '';
    detailsCard.style.maxHeight = '';
    staffCard.style.maxHeight = '380px';
    staffCard.style.height = '';
  }
}

function copyTavernSummary() {
  const d = tavernState.currentData;
  if (!d) return;

  const btn = document.getElementById('btn-copy-tavern-summary');

  const text = `
🏰 ${d.tavern.name} (${d.tavern.category}, ${d.tavern.type})
Местность: ${d.tavern.location}
Описание: «${d.tavern.description}»
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
${d.rooms.length === 0 ? '  - В заведении нет номеров для ночлега (только общий трапезный зал)' : d.rooms.map(r => `  - №${r.roomNumber} ${r.typeDesc} | ${r.cost} | ${r.status}${r.tenant ? ` (${r.tenant})` : ''} [${r.note}]`).join('\n')}

👥 Персонал (${d.tavern.staffSummary} + владелец):
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

