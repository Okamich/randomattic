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
  generateNPCMotives,
  generateNPCJob,
  generateNPCVoice,
  generateNPCExtendedTraits,
  buildPortraitRecipeFromNPC,
  renderPortraitSVG,
  getPortraitDataUrl,
  renderPortraitToCanvas,
  renderPortraitDataUrl,
  preloadPortraitLayers,
  NPC_JOBS_D100,
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
import { generateTown } from './generators/town.js';
import { generateHero } from './generators/hero.js';
import { HERO_DATA } from './data/hero-data.js';

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
    const validViews = ['names', 'town', 'tavern', 'loot', 'd20-hub', 'd20-wild-magic', 'd20-secret-societies', 'd20-artefacts', 'd20-potions', 'hero'];
    
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
  const townWs = document.getElementById('town-dashboard-workspace');
  const heroWs = document.getElementById('hero-dashboard-workspace');

  if (namesWs) namesWs.style.display = 'none';
  if (lootWs) lootWs.style.display = 'none';
  if (d20Ws) d20Ws.style.display = 'none';
  if (tavernWs) tavernWs.style.display = 'none';
  if (townWs) townWs.style.display = 'none';
  if (heroWs) heroWs.style.display = 'none';

  if (viewId === 'hero') {
    if (heroWs) {
      heroWs.style.display = 'flex';
      initHeroDashboard();
    }
  } else if (viewId === 'town') {
    if (townWs) {
      townWs.style.display = 'flex';
      initTownDashboard();
    }
  } else if (viewId === 'names') {
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
  const townWs = document.getElementById('town-dashboard-workspace');
  const heroWs = document.getElementById('hero-dashboard-workspace');

  if (mainContainer) mainContainer.classList.remove('container-fluid-tavern');
  if (namesWs) namesWs.style.display = 'none';
  if (lootWs) lootWs.style.display = 'none';
  if (d20Ws) d20Ws.style.display = 'none';
  if (tavernWs) tavernWs.style.display = 'none';
  if (townWs) townWs.style.display = 'none';
  if (heroWs) heroWs.style.display = 'none';

  if (boardEl) boardEl.style.display = 'block';
  if (genEl) genEl.style.display = 'none';
}

function setupGeneratorViewEvents() {
  setupNamesEvents();
  setupLootEvents();
  setupD20Events();
  setupTownEvents();
  setupHeroEvents();
  document.getElementById('btn-back-from-tavern')?.addEventListener('click', () => closeGeneratorView());
  document.getElementById('btn-back-from-town')?.addEventListener('click', () => closeGeneratorView());
  document.getElementById('btn-back-from-hero')?.addEventListener('click', () => closeGeneratorView());
}

// ==========================================================================
// 1. ГЕНЕРАТОР НИП И ПЕРСОНАЖЕЙ (NPC & CHARACTERS DASHBOARD CONTROLLER)
// ==========================================================================
const namesState = {
  initialized: false,
  portraitMode: 'vector',
  locks: {
    race: false,
    gender: false,
    profession: false,
    job: false,
    age: false,
    origin: false,
    appCount: false,
    persCount: false,
    count: false,
    reaction: false,
    motivation: false,
    area: false
  },
  lastNPC: null
};

function populateJobOptions() {
  const select = document.getElementById('n-param-job');
  if (!select || select.options.length > 1) return;
  const opts = NPC_JOBS_D100.map(j => `<option value="${j.roll}">${j.roll}. ${j.titleRu}</option>`).join('');
  select.innerHTML = '<option value="any" selected>🎲 Случайное занятие (d100)</option>' + opts;
}

function initNamesDashboard() {
  preloadPortraitLayers();
  populateJobOptions();
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
    { id: 'btn-lock-n-job', key: 'job' },
    { id: 'btn-lock-n-age', key: 'age' },
    { id: 'btn-lock-n-origin', key: 'origin' },
    { id: 'btn-lock-n-app-count', key: 'appCount' },
    { id: 'btn-lock-n-pers-count', key: 'persCount' },
    { id: 'btn-lock-n-count', key: 'count' },
    { id: 'btn-lock-n-reaction', key: 'reaction' },
    { id: 'btn-lock-n-motivation', key: 'motivation' },
    { id: 'btn-lock-n-area', key: 'area' }
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

  // Перебросить только сюжетные мотивы
  document.getElementById('btn-reroll-motives')?.addEventListener('click', () => {
    if (!namesState.lastNPC) return;
    const reactionEl = document.getElementById('n-param-reaction');
    const motivEl = document.getElementById('n-param-motivation');
    const areaEl = document.getElementById('n-param-area');

    const reaction = (namesState.locks.reaction && reactionEl) ? reactionEl.value : 'any';
    const motivation = (namesState.locks.motivation && motivEl) ? motivEl.value : 'any';
    const area = (namesState.locks.area && areaEl) ? areaEl.value : 'any';

    const newMotives = generateNPCMotives({ reaction, motivation, area });
    namesState.lastNPC.motives = newMotives;

    renderNPCMotives(newMotives);
    updateNPCDossierText(namesState.lastNPC);
  });

  // Копировать мотивы
  document.getElementById('btn-copy-motives')?.addEventListener('click', () => {
    if (!namesState.lastNPC || !namesState.lastNPC.motives) return;
    const text = namesState.lastNPC.motives.summaryText;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-copy-motives');
      if (btn) {
        btn.innerHTML = '✔ Скопировано!';
        setTimeout(() => {
          btn.innerHTML = '📋 Копировать';
        }, 1800);
      }
    });
  });

  // Перебросить только голос и повадки
  document.getElementById('btn-reroll-voice')?.addEventListener('click', () => {
    if (!namesState.lastNPC) return;
    const newVoice = generateNPCVoice({});
    namesState.lastNPC.voice = newVoice;
    renderNPCVoice(newVoice);
    updateNPCDossierText(namesState.lastNPC);
  });

  // Копировать голос
  document.getElementById('btn-copy-voice')?.addEventListener('click', () => {
    if (!namesState.lastNPC || !namesState.lastNPC.voice) return;
    const text = namesState.lastNPC.voice.summaryText;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-copy-voice');
      if (btn) {
        btn.innerHTML = '✔ Скопировано!';
        setTimeout(() => {
          btn.innerHTML = '📋 Копировать';
        }, 1800);
      }
    });
  });

  // Перебросить детальные черты
  document.getElementById('btn-reroll-traits')?.addEventListener('click', () => {
    if (!namesState.lastNPC) return;
    const newTraits = generateNPCExtendedTraits({});
    namesState.lastNPC.extendedTraits = newTraits;
    renderNPCTraits(newTraits);
    updateNPCDossierText(namesState.lastNPC);
  });

  // Копировать детальные черты
  document.getElementById('btn-copy-traits')?.addEventListener('click', () => {
    if (!namesState.lastNPC || !namesState.lastNPC.extendedTraits) return;
    const text = namesState.lastNPC.extendedTraits.summaryText;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-copy-traits');
      if (btn) {
        btn.innerHTML = '✔ Скопировано!';
        setTimeout(() => {
          btn.innerHTML = '📋 Копировать';
        }, 1800);
      }
    });
  });

  // Режим портрета: Вектор vs Растровый арт
  document.getElementById('btn-portrait-mode-vector')?.addEventListener('click', () => {
    namesState.portraitMode = 'vector';
    renderNPCPortrait(namesState.lastNPC);
  });

  document.getElementById('btn-portrait-mode-raster')?.addEventListener('click', () => {
    namesState.portraitMode = 'raster';
    renderNPCPortrait(namesState.lastNPC);
  });

  // Перебросить только внешность/портрет
  document.getElementById('btn-reroll-portrait-only')?.addEventListener('click', async () => {
    if (!namesState.lastNPC) return;
    const npc = namesState.lastNPC;
    const newRecipe = buildPortraitRecipeFromNPC({
      raceKey: npc.raceKey,
      gender: npc.gender,
      age: npc.age,
      ageStage: npc.ageStage,
      profession: npc.profession,
      extendedTraits: npc.extendedTraits
    });
    npc.portraitRecipe = newRecipe;
    npc.portraitSvg = renderPortraitSVG(newRecipe);
    npc.portraitDataUrl = getPortraitDataUrl(newRecipe);
    await renderNPCPortrait(npc);
  });
}

async function renderNPCPortrait(npc) {
  if (!npc) return;
  const canvasEl = document.getElementById('hero-portrait-canvas');
  const vectorContainer = document.getElementById('hero-portrait-vector');
  const imgEl = document.getElementById('hero-portrait-img');
  const btnVector = document.getElementById('btn-portrait-mode-vector');
  const btnRaster = document.getElementById('btn-portrait-mode-raster');

  if (namesState.portraitMode === 'vector') {
    if (canvasEl) {
      canvasEl.style.display = 'block';
      if (npc.portraitRecipe) {
        await renderPortraitToCanvas(npc.portraitRecipe, canvasEl);
      }
    }
    if (vectorContainer) vectorContainer.style.display = 'none';
    if (imgEl) imgEl.style.display = 'none';
    btnVector?.classList.add('active');
    btnRaster?.classList.remove('active');
  } else {
    if (canvasEl) canvasEl.style.display = 'none';
    if (vectorContainer) vectorContainer.style.display = 'none';
    if (imgEl) {
      imgEl.src = npc.portraitPath || 'assets/images/portraits/human_male.jpg';
      imgEl.style.display = 'block';
      imgEl.onerror = () => {
        imgEl.src = 'assets/images/portraits/human_male.jpg';
      };
    }
    btnRaster?.classList.add('active');
    btnVector?.classList.remove('active');
  }
}

function updateNPCDossierText(npc) {
  if (!npc) return;
  const raceTitle = npc.race;
  const genderText = npc.gender;
  const ageStr = npc.ageFormatted;
  const profession = npc.profession;
  const isHalfbreed = npc.isHalfbreed;
  const halfbreedOrigin = npc.halfbreedOrigin;
  const jobD100 = npc.jobD100;
  const voice = npc.voice;
  const t = npc.extendedTraits;

  let extraSections = '';
  if (t) {
    extraSections += `\n\n✨ Детальные черты:\n` +
      `  • Лицо: глаза — ${t.face.eyes.textRu}; нос — ${t.face.nose.textRu}; причёска — ${t.face.hair.textRu}; рот — ${t.face.mouth.textRu}; уши — ${t.face.ears.textRu}; подбородок — ${t.face.chin.textRu}; примета — ${t.face.otherFace.textRu}\n` +
      `  • Тело: ${t.physical.height.textRu}; ${t.physical.body.textRu}; руки — ${t.physical.hands.textRu}${t.physical.scar ? '; шрам — ' + t.physical.scar.textRu : ''}\n` +
      `  • Одежда & Украшения: ${t.accessories.clothes.textRu}; украшение — ${t.accessories.jewelry.textRu} (${t.accessories.jewelryMaterial.textRu})${t.accessories.tattoo ? '; тату — ' + t.accessories.tattoo.textRu : ''}`;
  }

  if (voice) {
    extraSections += `\n\n🗣️ Голос & Повадки:\n` +
      `  • Темп и тон: ${voice.speed.nameRu}, ${voice.pitch.nameRu}\n` +
      `  • Тембр: ${voice.texture.nameRu} (${voice.texture.descRu})\n` +
      `  • Речевая привычка: ${voice.speechPattern.textRu}\n` +
      `  • Физическая повадка: ${voice.mannerism.textRu}`;
  }

  let emotionsSection = '';
  if (t) {
    emotionsSection = `\n\n🎭 Эмоции & Вера:\n` +
      `  • В покое: ${t.emotions.calmTrait.textRu}\n` +
      `  • Текущее настроение: ${t.emotions.mood.textRu}\n` +
      `  • В стрессе: ${t.emotions.stressTrait.textRu}\n` +
      `  • Отношение к вере: ${t.beliefs.faith.textRu}\n` +
      `  • Предрассудок: ${t.beliefs.prejudice.textRu}\n` +
      `  • Бытовой изъян: ${t.beliefs.flaw.textRu}`;
  }

  npc.fullDossierText = `НИП: ${npc.name} (${raceTitle}, ${genderText}, ${ageStr})\n` +
    (profession ? `Профессия: ${profession.title} [${profession.role}] (Занятие d100: ${jobD100 ? jobD100.titleRu : '—'})\n` : (jobD100 ? `Занятие (d100): ${jobD100.titleRu}\n` : '')) +
    (isHalfbreed && halfbreedOrigin ? `Воспитание: ${halfbreedOrigin.description}\n` : '') +
    `Сводка: ${npc.structuredSummary}\n\n` +
    `👗 Внешность (DMG):\n  ${npc.appearance.items.map(i => i.name).join('; ')}` +
    extraSections +
    `\n\n🧠 Характер:\n` +
    `  • Дарование: ${npc.character.talentText}\n` +
    `  • Взаимодействие: ${npc.character.interactionText} (${npc.character.interactions.map(i => i.desc).join(', ')})\n` +
    `  • Манера: ${npc.character.mannerismText}\n\n` +
    `⚔️ Характеристики:\n` +
    `  • Высокая: ${npc.abilities.high.formatted}\n` +
    `  • Низкая: ${npc.abilities.low.formatted}\n\n` +
    `⚖️ Идеал: ${npc.ideal.formatted}\n` +
    `🔗 Привязанность: ${npc.bond.textSummary}\n` +
    `🗝️ Слабость или тайна: ${npc.flaw.textSummary}` +
    emotionsSection +
    `\n\n${npc.motives ? npc.motives.summaryText : ''}`;
}

function renderNPCMotives(motives) {
  const container = document.getElementById('npc-motives-content');
  if (!container || !motives) return;

  const r = motives.reaction;
  const m = motives.motivation;
  const a = motives.area;

  let attitudeClass = 'neutral';
  if (r.type === 'hostile') attitudeClass = 'hostile';
  else if (r.type === 'unfriendly') attitudeClass = 'unfriendly';
  else if (r.type === 'suspicious') attitudeClass = 'suspicious';
  else if (r.type === 'helpful') attitudeClass = 'helpful';
  else if (r.type === 'friendly') attitudeClass = 'friendly';
  else if (r.type === 'ally') attitudeClass = 'ally';

  container.innerHTML = `
    <!-- 1. Реакция -->
    <div class="npc-motive-row">
      <div class="npc-motive-row-title">
        <span>💬 Первичная реакция:</span>
        <span class="npc-motive-badge ${attitudeClass}">к20 [${r.roll}] • ${r.attitude}</span>
      </div>
      <div class="npc-motive-body">${r.htmlText}</div>
    </div>

    <!-- 2. Скрытые мотивы -->
    <div class="npc-motive-row">
      <div class="npc-motive-row-title">
        <span>🧭 Скрытый мотив:</span>
        <span class="npc-motive-badge theme">к20 [${m.roll}] • ${m.theme}</span>
      </div>
      <div class="npc-motive-body">${m.htmlText}</div>
    </div>

    <!-- 3. Обстановка / Местность -->
    <div class="npc-motive-row">
      <div class="npc-motive-row-title">
        <span>🗺️ Обстановка / Место:</span>
        <span class="npc-motive-badge area">к20 [${a.roll}] • ${a.theme}</span>
      </div>
      <div class="npc-motive-body">${a.htmlText}</div>
    </div>
  `;
}

function renderNPCVoice(voice) {
  const container = document.getElementById('npc-voice-content');
  if (!container || !voice) return;

  container.innerHTML = `
    <div class="npc-voice-pills">
      <span class="npc-voice-pill">⚡ Скорость: <strong>${voice.speed.nameRu}</strong></span>
      <span class="npc-voice-pill">🎵 Тон: <strong>${voice.pitch.nameRu}</strong></span>
      <span class="npc-voice-pill">🎙️ Тембр: <strong>${voice.texture.nameRu}</strong></span>
    </div>
    <div class="npc-motive-row">
      <div class="npc-motive-row-title">
        <span>💬 Речевая привычка (d50 [${voice.speechPattern.roll}]):</span>
      </div>
      <div class="npc-motive-body">${voice.speechPattern.textRu}</div>
    </div>
    <div class="npc-motive-row">
      <div class="npc-motive-row-title">
        <span>✋ Физическая повадка (d50 [${voice.mannerism.roll}]):</span>
      </div>
      <div class="npc-motive-body">${voice.mannerism.textRu}</div>
    </div>
  `;
}

function renderNPCTraits(traits) {
  const container = document.getElementById('npc-traits-content');
  if (!container || !traits) return;

  const f = traits.face;
  const p = traits.physical;
  const a = traits.accessories;
  const e = traits.emotions;
  const b = traits.beliefs;

  container.innerHTML = `
    <!-- Лицо -->
    <div class="npc-trait-section">
      <div class="npc-trait-section-title"><span>👁️</span> Черты лица:</div>
      <div class="npc-trait-section-body">
        <strong>Глаза:</strong> ${f.eyes.textRu} • <strong>Нос:</strong> ${f.nose.textRu} • <strong>Волосы:</strong> ${f.hair.textRu} • <strong>Рот:</strong> ${f.mouth.textRu} • <strong>Уши:</strong> ${f.ears.textRu} • <strong>Подбородок:</strong> ${f.chin.textRu} • <strong>Примета:</strong> ${f.otherFace.textRu}
      </div>
    </div>

    <!-- Телосложение -->
    <div class="npc-trait-section">
      <div class="npc-trait-section-title"><span>💪</span> Физические черты:</div>
      <div class="npc-trait-section-body">
        <strong>Рост:</strong> ${p.height.textRu} • <strong>Телосложение:</strong> ${p.body.textRu} • <strong>Руки:</strong> ${p.hands.textRu}${p.scar ? ` • <strong>Шрам:</strong> ${p.scar.textRu}` : ''}
      </div>
    </div>

    <!-- Одежда и Аксессуары -->
    <div class="npc-trait-section">
      <div class="npc-trait-section-title"><span>💍</span> Одежда & Украшения:</div>
      <div class="npc-trait-section-body">
        <strong>Наряд:</strong> ${a.clothes.textRu} • <strong>Украшение:</strong> ${a.jewelry.textRu} (${a.jewelryMaterial.textRu})${a.tattoo ? ` • <strong>Татуировка:</strong> ${a.tattoo.textRu}` : ''}
      </div>
    </div>

    <!-- Эмоции и Настрой -->
    <div class="npc-trait-section">
      <div class="npc-trait-section-title"><span>🎭</span> Эмоциональный спектр:</div>
      <div class="npc-trait-section-body">
        <strong>В покое:</strong> ${e.calmTrait.textRu} • <strong>Текущее настроение:</strong> ${e.mood.textRu} • <strong>В стрессе:</strong> ${e.stressTrait.textRu}
      </div>
    </div>

    <!-- Вера, взгляды и изъяны -->
    <div class="npc-trait-section">
      <div class="npc-trait-section-title"><span>🕊️</span> Вера, взгляды & изъяны:</div>
      <div class="npc-trait-section-body">
        <strong>Отношение к вере:</strong> ${b.faith.textRu} • <strong>Предрассудок:</strong> ${b.prejudice.textRu} • <strong>Бытовой изъян:</strong> ${b.flaw.textRu}
      </div>
    </div>
  `;
}

function executeNamesGenerator() {
  const raceEl = document.getElementById('n-param-race');
  const genderEl = document.getElementById('n-param-gender');
  const profEl = document.getElementById('n-param-profession');
  const jobEl = document.getElementById('n-param-job');
  const ageEl = document.getElementById('n-param-age');
  const ageVal = document.getElementById('n-val-age');
  const originEl = document.getElementById('n-param-origin');
  const elfkinEl = document.getElementById('n-param-elfkin');
  const appCountEl = document.getElementById('n-param-app-count');
  const persCountEl = document.getElementById('n-param-pers-count');
  const countEl = document.getElementById('n-param-count');
  const reactionEl = document.getElementById('n-param-reaction');
  const motivEl = document.getElementById('n-param-motivation');
  const areaEl = document.getElementById('n-param-area');

  const race = (namesState.locks.race && raceEl) ? raceEl.value : (raceEl?.value || 'any');
  const gender = (namesState.locks.gender && genderEl) ? genderEl.value : (genderEl?.value || 'any');
  const profession = (namesState.locks.profession && profEl) ? profEl.value : (profEl?.value || 'any');
  const job = (namesState.locks.job && jobEl) ? jobEl.value : (jobEl?.value || 'any');
  const age = (namesState.locks.age && ageEl) ? Number(ageEl.value) : 'random';
  const halfbreedOrigin = (namesState.locks.origin && originEl) ? originEl.value : (originEl?.value || 'any');
  const elfKinAll = elfkinEl ? elfkinEl.checked : true;
  const appearanceCount = (namesState.locks.appCount && appCountEl) ? Number(appCountEl.value) : Number(appCountEl?.value || 2);
  const personalityCount = (namesState.locks.persCount && persCountEl) ? Number(persCountEl.value) : Number(persCountEl?.value || 1);
  const count = (namesState.locks.count && countEl) ? Number(countEl.value) : Number(countEl?.value || 3);
  const reaction = (namesState.locks.reaction && reactionEl) ? reactionEl.value : (reactionEl?.value || 'any');
  const motivation = (namesState.locks.motivation && motivEl) ? motivEl.value : (motivEl?.value || 'any');
  const area = (namesState.locks.area && areaEl) ? areaEl.value : (areaEl?.value || 'any');

  const npc = generateFullNPC({
    race,
    gender,
    profession,
    job,
    age,
    halfbreedOrigin,
    elfKinAll,
    appearanceCount,
    personalityCount,
    count,
    reaction,
    motivation,
    area
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

  // Портрет (векторный или растровый арт)
  renderNPCPortrait(npc);

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
    if (npc.jobD100) {
      badgesHtml += `<span class="tavern-card-badge" style="background:rgba(0, 180, 216, 0.18); border-color:#00b4d8; color:#90e0ef;">🛠️ ${npc.jobD100.titleRu} [№${npc.jobD100.roll}]</span>`;
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

  // Сюжетные мотивы, реакция и обстановка
  renderNPCMotives(npc.motives);

  // Голос и особенности речи (npc_voice.xlsx)
  renderNPCVoice(npc.voice);

  // Детальные физические черты, повадки, одежда, вера (NPC_TRAITS.xlsx)
  renderNPCTraits(npc.extendedTraits);

  // Детализация: Внешность, Характер (Дарование + Взаимодействие + Манера), Характеристики, Привязанность, Слабость, Идеал
  const detailsGrid = document.getElementById('hero-details-grid');
  if (detailsGrid) {
    let detailsHtml = '<div class="npc-details-container">';

    // Профессия и роль
    if (npc.profession || npc.jobD100) {
      const profPart = npc.profession ? `<strong>${npc.profession.icon} ${npc.profession.title}</strong> — ${npc.profession.role}` : '';
      const jobPart = npc.jobD100 ? `<strong>🛠️ Занятие (к100 №${npc.jobD100.roll}):</strong> ${npc.jobD100.titleRu}` : '';
      detailsHtml += `
        <div class="npc-detail-block">
          <div class="npc-detail-title">💼 Профессия & Ремесло:</div>
          <div class="npc-detail-content">
            ${profPart ? `<div>${profPart}</div>` : ''}
            ${jobPart ? `<div style="${profPart ? 'margin-top: 4px;' : ''}">${jobPart}</div>` : ''}
          </div>
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
        <td style="text-align: center; vertical-align: middle;">
          <div class="variant-avatar-mini" title="${v.fullName}">
            <canvas class="variant-avatar-mini-canvas" width="192" height="256"></canvas>
          </div>
        </td>
        <td><strong style="color: #f0c97d;">${v.fullName}</strong></td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span class="tavern-card-badge" style="font-size: 0.78rem; background: rgba(212, 175, 55, 0.15); border-color: #ffd54f; color: #ffe082;">${v.professionTitle}</span>
            ${v.jobD100 ? `<span style="font-size: 0.74rem; color: #90e0ef;">🛠️ ${v.jobD100.titleRu}</span>` : ''}
          </div>
        </td>
        <td>${v.race}</td>
        <td>${v.gender}</td>
        <td><span class="tavern-card-badge">${v.age}</span></td>
        <td>
          <div style="font-size: 0.78rem; line-height: 1.35;">
            <div>⚖️ <strong>${v.ideal.name}</strong> <span style="color: var(--text-muted);">(${v.ideal.category})</span></div>
            <div style="color: var(--text-muted);">🤝 ${v.character.interactionText} • 🎭 ${v.character.mannerismText}</div>
            <div style="color: #ffd54f; font-size: 0.75rem; margin-top: 2px;">🎯 ${v.motives.reaction.attitude.split(' ')[0]} • ${v.motives.motivation.theme.split(' ')[0]}</div>
            ${v.voice ? `<div style="color: #80d8ff; font-size: 0.74rem; margin-top: 2px;">🗣️ ${v.voice.speed.nameRu}, ${v.voice.pitch.nameRu}, ${v.voice.texture.nameRu}</div>` : ''}
          </div>
        </td>
        <td style="text-align: right;">
          <button class="btn-mini-copy" data-copy="${v.fullDossierText.replace(/"/g, '&quot;')}" title="Копировать полное досье">📋 Досье</button>
        </td>
      </tr>
    `).join('');

    // Отрисовываем мини-портреты для каждого варианта
    const miniCanvases = tbody.querySelectorAll('.variant-avatar-mini-canvas');
    npc.variants.forEach((v, idx) => {
      const mc = miniCanvases[idx];
      if (mc && v.portraitRecipe) {
        renderPortraitToCanvas(v.portraitRecipe, mc);
      }
    });

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

// ==========================================================================
// 5. АРХИТЕКТОР ПОСЕЛЕНИЙ & ГОРОДОВ (TOWN & SETTLEMENT ARCHITECT CONTROLLER)
// ==========================================================================
const townState = {
  initialized: false,
  locks: {
    size: false,
    density: false,
    layout: false,
    material: false,
    race: false,
    industry: false,
    wealth: false,
    religion: false,
    stratification: false,
    stability: false,
    crime: false,
    monsters: false,
    guild: false
  },
  lastTown: null
};

function initTownDashboard() {
  setupTownEvents();
  if (!townState.lastTown) {
    executeTownGenerator();
  }
}

function setupTownEvents() {
  if (townState.initialized) return;
  townState.initialized = true;

  // Locks setup
  const lockBindings = [
    { btnId: 'btn-lock-t-size', key: 'size', inputId: 't-param-size', metaKey: 'sizeKey' },
    { btnId: 'btn-lock-t-density', key: 'density', inputId: 't-param-density' },
    { btnId: 'btn-lock-t-layout', key: 'layout', inputId: 't-param-layout', metaKey: 'layoutKey' },
    { btnId: 'btn-lock-t-material', key: 'material', inputId: 't-param-material', metaKey: 'materialKey' },
    { btnId: 'btn-lock-t-race', key: 'race', inputId: 't-param-race', metaKey: 'raceKey' },
    { btnId: 'btn-lock-t-industry', key: 'industry', inputId: 't-param-industry', metaKey: 'industryKey' },
    { btnId: 'btn-lock-t-wealth', key: 'wealth', inputId: 't-param-wealth', metaKey: 'wealthKey' },
    { btnId: 'btn-lock-t-religion', key: 'religion', inputId: 't-param-religion', metaKey: 'religionKey' },
    { btnId: 'btn-lock-t-stratification', key: 'stratification', inputId: 't-param-stratification', metaKey: 'stratificationKey' },
    { btnId: 'btn-lock-t-stability', key: 'stability', inputId: 't-param-stability' },
    { btnId: 'btn-lock-t-crime', key: 'crime', inputId: 't-param-crime' },
    { btnId: 'btn-lock-t-monsters', key: 'monsters', inputId: 't-param-monsters' },
    { btnId: 'btn-lock-t-guild', key: 'guild', inputId: 't-param-guild', metaKey: 'guildPower' }
  ];

  lockBindings.forEach(({ btnId, key, inputId, metaKey }) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      townState.locks[key] = !townState.locks[key];
      const isLocked = townState.locks[key];
      btn.textContent = isLocked ? '🔒' : '🔓';
      btn.classList.toggle('locked', isLocked);

      const inputEl = document.getElementById(inputId);
      if (!inputEl) return;

      if (isLocked) {
        // If locking a dropdown currently in 'random' mode, lock to the generated value
        if (metaKey && inputEl.value === 'random' && townState.lastTown && townState.lastTown.meta) {
          const concreteVal = townState.lastTown.meta[metaKey];
          if (concreteVal) inputEl.value = concreteVal;
        }
      } else {
        // When unlocking a dropdown, revert back to 'random'
        if (metaKey) {
          inputEl.value = 'random';
        }
      }
    });
  });

  // Slider Badges setup
  const densitySlider = document.getElementById('t-param-density');
  const densityVal = document.getElementById('t-val-density');
  const densityLabels = { '1': 'Низкая', '2': 'Обычная', '3': 'Высокая', '4': 'Очень выс.' };
  if (densitySlider && densityVal) {
    densitySlider.addEventListener('input', (e) => {
      densityVal.textContent = densityLabels[e.target.value] || 'Обычная';
    });
  }

  const stabilitySlider = document.getElementById('t-param-stability');
  const stabilityVal = document.getElementById('t-val-stability');
  if (stabilitySlider && stabilityVal) {
    stabilitySlider.addEventListener('input', (e) => {
      stabilityVal.textContent = `${e.target.value} / 5`;
    });
  }

  const crimeSlider = document.getElementById('t-param-crime');
  const crimeVal = document.getElementById('t-val-crime');
  if (crimeSlider && crimeVal) {
    crimeSlider.addEventListener('input', (e) => {
      crimeVal.textContent = `${e.target.value} / 5`;
    });
  }

  const monstersSlider = document.getElementById('t-param-monsters');
  const monstersVal = document.getElementById('t-val-monsters');
  if (monstersSlider && monstersVal) {
    monstersSlider.addEventListener('input', (e) => {
      monstersVal.textContent = `${e.target.value} / 5`;
    });
  }

  // Roll button
  document.getElementById('btn-reroll-town')?.addEventListener('click', () => {
    executeTownGenerator();
  });

  // Unlock all button: reset all locks and restore random on all controls
  document.getElementById('btn-unlock-all-town')?.addEventListener('click', () => {
    Object.keys(townState.locks).forEach(k => {
      townState.locks[k] = false;
    });
    lockBindings.forEach(({ btnId, inputId, metaKey }) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.textContent = '🔓';
        btn.classList.remove('locked');
      }
      if (metaKey) {
        const inputEl = document.getElementById(inputId);
        if (inputEl) inputEl.value = 'random';
      }
    });
  });

  // Copy dossier summary
  document.getElementById('btn-copy-town-summary')?.addEventListener('click', () => {
    copyTownSummary();
  });

  // Export Markdown
  document.getElementById('btn-export-town-md')?.addEventListener('click', () => {
    exportTownMarkdown();
  });

  // Export CSV
  document.getElementById('btn-export-town-csv')?.addEventListener('click', () => {
    exportTownCsv();
  });
}

function executeTownGenerator() {
  const densityMap = { '1': 'low', '2': 'normal', '3': 'high', '4': 'very_high' };
  const densitySlider = document.getElementById('t-param-density');

  const getSelectOpt = (lockKey, inputId) => {
    const el = document.getElementById(inputId);
    if (!el) return undefined;
    if (townState.locks[lockKey]) return el.value;
    if (el.value === 'random') return undefined;
    return el.value;
  };

  // Prepare generator options based on controls and lock state
  const options = {
    size: getSelectOpt('size', 't-param-size'),
    poiDensity: densityMap[densitySlider?.value] || 'normal',
    layout: getSelectOpt('layout', 't-param-layout'),
    material: getSelectOpt('material', 't-param-material'),
    race: getSelectOpt('race', 't-param-race'),
    industry: getSelectOpt('industry', 't-param-industry'),
    wealth: getSelectOpt('wealth', 't-param-wealth'),
    religion: getSelectOpt('religion', 't-param-religion'),
    stratification: getSelectOpt('stratification', 't-param-stratification'),
    stability: townState.locks.stability ? parseInt(document.getElementById('t-param-stability')?.value, 10) : undefined,
    crime: townState.locks.crime ? parseInt(document.getElementById('t-param-crime')?.value, 10) : undefined,
    monsters: townState.locks.monsters ? parseInt(document.getElementById('t-param-monsters')?.value, 10) : undefined,
    guildPower: getSelectOpt('guild', 't-param-guild')
  };

  const result = generateTown(options);
  townState.lastTown = result;

  // For sliders, update display if unlocked
  if (!townState.locks.stability && result.meta.stability) {
    const el = document.getElementById('t-param-stability');
    if (el) el.value = result.meta.stability;
    const val = document.getElementById('t-val-stability');
    if (val) val.textContent = `${result.meta.stability} / 5`;
  }
  if (!townState.locks.crime && result.meta.crime) {
    const el = document.getElementById('t-param-crime');
    if (el) el.value = result.meta.crime;
    const val = document.getElementById('t-val-crime');
    if (val) val.textContent = `${result.meta.crime} / 5`;
  }
  if (!townState.locks.monsters && result.meta.monsters) {
    const el = document.getElementById('t-param-monsters');
    if (el) el.value = result.meta.monsters;
    const val = document.getElementById('t-val-monsters');
    if (val) val.textContent = `${result.meta.monsters} / 5`;
  }

  // Render view
  renderTownView(result);
}

function renderTownView(town) {
  const { meta, narrative, districts, citizens, establishments } = town;

  // Header meta
  const nameEl = document.getElementById('town-display-name');
  if (nameEl) nameEl.textContent = meta.name;

  const typeEl = document.getElementById('t-meta-type');
  if (typeEl) typeEl.textContent = `${meta.sizeTitle} (${meta.sizeEnTitle})`;

  const popEl = document.getElementById('t-meta-pop');
  if (popEl) popEl.textContent = `~${meta.populationFormatted} жит.`;

  const wealthEl = document.getElementById('t-meta-wealth');
  if (wealthEl) wealthEl.textContent = `${meta.wealthTitle} • ${meta.industryTitle}`;

  const govEl = document.getElementById('t-meta-gov');
  if (govEl) govEl.textContent = meta.stratificationTitle;

  // Map & Badges
  const mapImg = document.getElementById('town-map-img');
  if (mapImg && meta.mapImage) mapImg.src = meta.mapImage;

  const mapTitle = document.getElementById('town-map-title');
  if (mapTitle) mapTitle.textContent = `План поселения: ${meta.name}`;

  const poiBadge = document.getElementById('town-map-poi-badge');
  if (poiBadge) poiBadge.textContent = `${districts.length} Районов`;

  const layoutBadge = document.getElementById('town-map-layout-badge');
  if (layoutBadge) layoutBadge.textContent = meta.layoutTitle;

  // Narratives
  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const setElHtml = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  setElText('town-narrative-desc', narrative.description);
  setElText('town-narrative-density', narrative.buildingsCitizens);
  setElHtml('town-narrative-rumors', `<ul>${narrative.rumors.map(r => `<li>«${r}»</li>`).join('')}</ul>`);
  setElHtml('town-narrative-clues', `<ul>${narrative.clues.map(c => `<li>${c}</li>`).join('')}</ul>`);
  setElHtml('town-narrative-events', `<ul>${narrative.events.map(ev => `<li>${ev}</li>`).join('')}</ul>`);
  setElText('town-narrative-opponents', narrative.opponents);
  setElText('town-narrative-rulers', narrative.rulers);
  setElText('town-narrative-watch', narrative.watch);
  setElText('town-narrative-guilds', narrative.guilds);
  setElText('town-narrative-treasures', narrative.treasures);
  setElText('town-narrative-battles', narrative.battles);
  setElText('town-narrative-heroes', narrative.heroes);

  // Table 1: Districts
  const districtsCountBadge = document.getElementById('town-districts-count');
  if (districtsCountBadge) districtsCountBadge.textContent = `${districts.length} районов`;

  const tbodyDistricts = document.getElementById('tbody-town-districts');
  if (tbodyDistricts) {
    tbodyDistricts.innerHTML = districts.map(d => `
      <tr>
        <td><strong>${d.name}</strong><br><small style="color:var(--text-muted);">${d.nameEn}</small></td>
        <td><span class="badge-town-${d.badgeClass}">${d.typePoi}</span></td>
        <td style="text-align: right; font-weight: 600; color: var(--accent-primary);">~${d.estimatedBuildings}</td>
        <td>${d.notes}</td>
      </tr>
    `).join('');
  }

  // Table 2: Citizens
  const citizensCountBadge = document.getElementById('town-citizens-count');
  if (citizensCountBadge) citizensCountBadge.textContent = `${citizens.length} жителей`;

  const tbodyCitizens = document.getElementById('tbody-town-citizens');
  if (tbodyCitizens) {
    tbodyCitizens.innerHTML = citizens.map(c => `
      <tr>
        <td><strong>${c.name}</strong><br><small style="color:var(--accent-primary);">${c.role}</small></td>
        <td>${c.race}</td>
        <td>${c.age}</td>
        <td>${c.notes}</td>
      </tr>
    `).join('');
  }

  // Table 3: Establishments
  const estabCountBadge = document.getElementById('town-establishments-count');
  if (estabCountBadge) estabCountBadge.textContent = `${establishments.length} заведений`;

  const tbodyEstab = document.getElementById('tbody-town-establishments');
  if (tbodyEstab) {
    tbodyEstab.innerHTML = establishments.map(e => `
      <tr>
        <td><strong>${e.name}</strong></td>
        <td><span class="badge-town-busy">${e.type}</span></td>
        <td><strong>${e.owner}</strong><br><small style="color:var(--text-muted);">${e.servicesPrices}</small></td>
        <td>${e.quirkClues}</td>
      </tr>
    `).join('');
  }
}

function copyTownSummary() {
  if (!townState.lastTown) return;
  const t = townState.lastTown;
  const text = `${t.meta.name} (${t.meta.sizeTitle})
Население: ~${t.meta.populationFormatted} (${t.meta.raceTitle})
Планировка: ${t.meta.layoutTitle} | Материалы: ${t.meta.materialTitle}
Экономика: ${t.meta.industryTitle} (${t.meta.wealthTitle})

Описание:
${t.narrative.description}

Районы:
${t.districts.map(d => `• ${d.name} (${d.typePoi}) — ~${d.estimatedBuildings} зданий`).join('\n')}

Слухи:
${t.narrative.rumors.map(r => `• ${r}`).join('\n')}`;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy-town-summary');
    if (btn) {
      btn.innerHTML = '<span>✔</span><span>Скопировано!</span>';
      setTimeout(() => {
        btn.innerHTML = '<span>📋</span><span>Копировать досье</span>';
      }, 2000);
    }
  });
}

function exportTownMarkdown() {
  if (!townState.lastTown) return;
  const md = townState.lastTown.exportMarkdown;
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${townState.lastTown.meta.name.replace(/[\/\s]/g, '_')}_dossier.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportTownCsv() {
  if (!townState.lastTown) return;
  const csv = townState.lastTown.exportCsv;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${townState.lastTown.meta.name.replace(/[\/\s]/g, '_')}_tables.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==========================================================================
// 6. АРХИТЕКТОР ГЕРОЕВ (HERO FOUNDRY / HERO CRAFTER DASHBOARD CONTROLLER)
// ==========================================================================
const heroState = {
  initialized: false,
  locks: {
    race: false,
    classId: false,
    gender: false,
    portrait: false
  },
  customTraitSlots: [
    { locked: false, key: 'pastProfession', title: 'Прошлое призвание', option: null },
    { locked: false, key: 'pride', title: 'Источник гордости', option: null },
    { locked: false, key: 'flaw', title: 'Слабость / Изъян', option: null },
    { locked: false, key: 'adventurerReason', title: 'Зов странствий', option: null }
  ],
  lastHero: null
};

function initHeroDashboard() {
  if (!heroState.initialized) {
    populateHeroSelects();
    heroState.initialized = true;
  }
  if (!heroState.lastHero) {
    executeHeroGenerator();
  }
}

function populateHeroSelects() {
  const raceSelect = document.getElementById('hero-select-race');
  if (raceSelect && raceSelect.options.length <= 1) {
    HERO_DATA.races.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.nameRu;
      raceSelect.appendChild(opt);
    });
  }

  const classSelect = document.getElementById('hero-select-class');
  if (classSelect && classSelect.options.length <= 1) {
    Object.values(HERO_DATA.classes).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.icon} ${c.nameRu} (${c.nameEn})`;
      classSelect.appendChild(opt);
    });
  }
}

function setupHeroEvents() {
  // Lock toggles
  const lockButtons = [
    { btnId: 'btn-lock-hero-race', key: 'race', selectId: 'hero-select-race' },
    { btnId: 'btn-lock-hero-class', key: 'classId', selectId: 'hero-select-class' },
    { btnId: 'btn-lock-hero-gender', key: 'gender', selectId: 'hero-select-gender' },
    { btnId: 'btn-lock-hero-portrait', key: 'portrait' }
  ];

  lockButtons.forEach(({ btnId, key, selectId }) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      heroState.locks[key] = !heroState.locks[key];
      const isLocked = heroState.locks[key];
      btn.textContent = isLocked ? '🔒' : '🔓';
      btn.classList.toggle('locked', isLocked);
      btn.title = isLocked ? 'Разблокировать' : 'Заблокировать';

      // If locking a select that was on 'random', sync with current hero
      if (isLocked && selectId && heroState.lastHero) {
        const sel = document.getElementById(selectId);
        if (sel && sel.value === 'random') {
          if (key === 'race') sel.value = heroState.lastHero.race.id;
          if (key === 'classId') sel.value = heroState.lastHero.class.id;
          if (key === 'gender') sel.value = heroState.lastHero.gender;
        }
      }
    });
  });

  // Custom trait reroll and lock buttons
  document.querySelectorAll('#card-hero-custom-traits .btn-trait-reroll').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slotIdx = parseInt(e.currentTarget.dataset.slot, 10);
      rerollHeroTraitSlot(slotIdx);
    });
  });

  document.querySelectorAll('#card-hero-custom-traits .btn-hero-lock').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slotIdx = parseInt(e.currentTarget.dataset.slot, 10);
      if (heroState.customTraitSlots[slotIdx]) {
        const slot = heroState.customTraitSlots[slotIdx];
        slot.locked = !slot.locked;
        e.currentTarget.textContent = slot.locked ? '🔒' : '🔓';
        e.currentTarget.classList.toggle('locked', slot.locked);
      }
    });
  });

  // Sliders display
  const sliderComplexity = document.getElementById('hero-slider-complexity');
  const valComplexity = document.getElementById('hero-val-complexity');
  if (sliderComplexity && valComplexity) {
    sliderComplexity.addEventListener('input', (e) => {
      valComplexity.textContent = e.target.value;
    });
  }

  const sliderBackstory = document.getElementById('hero-slider-backstory');
  const valBackstory = document.getElementById('hero-val-backstory');
  if (sliderBackstory && valBackstory) {
    sliderBackstory.addEventListener('input', (e) => {
      valBackstory.textContent = e.target.value;
    });
  }

  // Generate hero button
  document.getElementById('btn-generate-hero')?.addEventListener('click', () => {
    executeHeroGenerator();
  });

  // Unlock all
  document.getElementById('btn-unlock-all-hero')?.addEventListener('click', () => {
    Object.keys(heroState.locks).forEach(k => { heroState.locks[k] = false; });
    lockButtons.forEach(({ btnId, selectId }) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.textContent = '🔓';
        btn.classList.remove('locked');
      }
      if (selectId) {
        const sel = document.getElementById(selectId);
        if (sel) sel.value = 'random';
      }
    });
    // Unlock trait slots
    heroState.customTraitSlots.forEach(slot => {
      slot.locked = false;
    });
    document.querySelectorAll('#card-hero-custom-traits .btn-hero-lock').forEach(btn => {
      btn.textContent = '🔓';
      btn.classList.remove('locked');
    });
  });

  // Copy dossier
  document.getElementById('btn-copy-hero-summary')?.addEventListener('click', () => {
    copyHeroSummary();
  });

  // Export Markdown
  document.getElementById('btn-export-hero-md')?.addEventListener('click', () => {
    exportHeroMarkdown();
  });

  // Export CSV
  document.getElementById('btn-export-hero-csv')?.addEventListener('click', () => {
    exportHeroCsv();
  });
}

function rerollHeroTraitSlot(slotIdx) {
  if (!heroState.lastHero) return;
  const classKey = heroState.lastHero.class.id;
  const classDef = HERO_DATA.classes[classKey];
  const slot = heroState.customTraitSlots[slotIdx];
  if (!classDef || !slot) return;

  const tbl = classDef.tables[slot.key];
  if (!tbl || !tbl.options?.length) return;

  const opt = randInt(0, tbl.options.length - 1);
  slot.option = tbl.options[opt];
  renderHeroTraitSlots();
}

function executeHeroGenerator() {
  const getOpt = (lockKey, inputId) => {
    const el = document.getElementById(inputId);
    if (!el) return undefined;
    if (heroState.locks[lockKey]) return el.value;
    if (el.value === 'random') return undefined;
    return el.value;
  };

  const options = {
    race: getOpt('race', 'hero-select-race'),
    classId: getOpt('classId', 'hero-select-class'),
    gender: getOpt('gender', 'hero-select-gender'),
    primaryAbility: document.getElementById('hero-select-ability')?.value,
    traitComplexity: document.getElementById('hero-slider-complexity')?.value,
    backstoryDetail: document.getElementById('hero-slider-backstory')?.value,
    customTraits: heroState.customTraitSlots,
    locks: heroState.locks,
    currentHero: heroState.lastHero
  };

  const hero = generateHero(options);
  heroState.lastHero = hero;

  // Sync custom trait slots
  hero.customTraits.forEach((t, i) => {
    if (heroState.customTraitSlots[i]) {
      heroState.customTraitSlots[i].option = t.option;
      heroState.customTraitSlots[i].title = t.title;
      heroState.customTraitSlots[i].key = t.key;
    }
  });

  renderHeroView(hero);
}

function renderHeroView(hero) {
  // Profile
  const imgEl = document.getElementById('hero-foundry-portrait-img');
  if (imgEl && hero.portrait) {
    imgEl.src = hero.portrait.url;
  }
  const coordEl = document.getElementById('hero-portrait-coord');
  if (coordEl && hero.portrait) {
    coordEl.textContent = `Атлас [${hero.portrait.row};${hero.portrait.col}]`;
  }
  const nameEl = document.getElementById('hero-profile-name');
  if (nameEl) nameEl.textContent = hero.name;
  const titleEl = document.getElementById('hero-profile-title');
  if (titleEl) titleEl.textContent = `«${hero.legacyTitle}»`;
  const subEl = document.getElementById('hero-profile-sub');
  if (subEl) subEl.textContent = `${hero.race.nameRu} • ${hero.class.nameRu} • ${hero.gender === 'female' ? 'Женщина' : 'Мужчина'} • ${hero.age} лет`;
  const classBadge = document.getElementById('hero-profile-class-badge');
  if (classBadge) classBadge.textContent = `${hero.class.icon} ${hero.class.nameRu}`;
  const bioBox = document.getElementById('hero-bio-box');
  if (bioBox) {
    bioBox.innerHTML = hero.bioSummary.split('\n\n').map(p => `<p>${p}</p>`).join('');
  }

  // Trait slots
  renderHeroTraitSlots();

  // Details
  const legTitle = document.getElementById('hero-details-legacy-title');
  if (legTitle) legTitle.textContent = `«${hero.legacyTitle}»`;
  const alignBadge = document.getElementById('hero-details-alignment-badge');
  if (alignBadge) alignBadge.textContent = hero.alignment;

  const setDetail = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '—';
  };
  setDetail('hero-val-origin', hero.details.origin.textRu);
  setDetail('hero-val-subclass', hero.class.subclass);
  setDetail('hero-val-pride', hero.details.corePersonality.textRu);
  setDetail('hero-val-profession', `${hero.details.pastProfession.textRu} / Страсть: ${hero.details.keenInterest.textRu}`);
  setDetail('hero-val-flaw', hero.details.fearsAndFlaws.textRu);
  setDetail('hero-val-combat', hero.details.favoredCombat.textRu);
  setDetail('hero-val-carrying', hero.details.carrying.textRu);
  setDetail('hero-val-drive', hero.details.ultimateGoal.textRu);

  // Associates
  const assocTbody = document.getElementById('tbody-hero-associates');
  const assocCount = document.getElementById('hero-associates-count');
  if (assocCount) assocCount.textContent = `${hero.associates.length} персон`;
  if (assocTbody) {
    assocTbody.innerHTML = hero.associates.map(a => `
      <tr>
        <td><strong>${a.name}</strong></td>
        <td><span class="${a.badge}">${a.role}</span></td>
        <td>${a.race}</td>
        <td>${a.affiliation}</td>
        <td>${a.notes}</td>
      </tr>
    `).join('');
  }

  // Personality Breakdown
  const persTbody = document.getElementById('tbody-hero-personality');
  if (persTbody) {
    persTbody.innerHTML = hero.personalityBreakdown.map(p => `
      <tr>
        <td><strong>${p.facet}</strong></td>
        <td>${p.description}</td>
        <td>${p.trigger}</td>
        <td style="color:var(--color-text-muted);">${p.note}</td>
      </tr>
    `).join('');
  }

  // Equipment
  const equipTbody = document.getElementById('tbody-hero-equipment');
  if (equipTbody) {
    equipTbody.innerHTML = hero.equipment.map(e => `
      <tr>
        <td><strong>${e.item}</strong></td>
        <td>${e.category}</td>
        <td>${e.quality}</td>
        <td><span class="badge-mentor" style="font-size:0.7rem;">${e.status}</span></td>
        <td style="color:var(--color-text-muted);">${e.notes}</td>
      </tr>
    `).join('');
  }

  // Story Events
  const storyTbody = document.getElementById('tbody-hero-story');
  if (storyTbody) {
    storyTbody.innerHTML = hero.storyEvents.map(s => `
      <tr>
        <td><strong>${s.event}</strong></td>
        <td>${s.description}</td>
        <td><span class="town-card-badge" style="font-size:0.68rem;">${s.timeline}</span></td>
        <td>${s.outcome}</td>
      </tr>
    `).join('');
  }
}

function renderHeroTraitSlots() {
  heroState.customTraitSlots.forEach((slot, i) => {
    const idx = i + 1;
    const titleEl = document.getElementById(`hero-trait-title-${idx}`);
    const bodyEl = document.getElementById(`hero-trait-body-${idx}`);
    if (titleEl) titleEl.textContent = slot.title;
    if (bodyEl && slot.option) bodyEl.textContent = slot.option.textRu;
  });
}

function copyHeroSummary() {
  if (!heroState.lastHero) return;
  const h = heroState.lastHero;
  const summary = `Герой: ${h.name} «${h.legacyTitle}»\n` +
    `Раса: ${h.race.nameRu} | Класс: ${h.class.nameRu} (${h.class.subclass})\n` +
    `Возраст: ${h.age} лет | Мировоззрение: ${h.alignment}\n` +
    `Истоки: ${h.details.origin.textRu}\n` +
    `Гордость: ${h.details.corePersonality.textRu}\n` +
    `Изъян: ${h.details.fearsAndFlaws.textRu}\n` +
    `Зов судьбы: ${h.details.ultimateGoal.textRu}\n\n` +
    `${h.bioSummary}`;

  navigator.clipboard.writeText(summary).then(() => {
    const btn = document.getElementById('btn-copy-hero-summary');
    if (btn) {
      btn.innerHTML = '<span>✅</span><span>Скопировано!</span>';
      setTimeout(() => {
        btn.innerHTML = '<span>📋</span><span>Копировать досье</span>';
      }, 2000);
    }
  });
}

function exportHeroMarkdown() {
  if (!heroState.lastHero) return;
  const md = heroState.lastHero.exportMarkdown;
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${heroState.lastHero.name.replace(/[\/\s]/g, '_')}_hero_dossier.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportHeroCsv() {
  if (!heroState.lastHero) return;
  const csv = heroState.lastHero.exportCsv;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${heroState.lastHero.name.replace(/[\/\s]/g, '_')}_hero_traits.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


