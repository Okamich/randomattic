/**
 * Randomattic - Generators Registry
 * Централизованный каталог генераторов и инструментов настольных игр.
 */

export const CATEGORIES = [
  { id: 'all', label: 'Все инструменты', icon: '✨' },
  { id: 'd20', label: 'D20 Таблицы', icon: '🎲' },
  { id: 'characters', label: 'Персонажи & NPC', icon: '🧙' },
  { id: 'locations', label: 'Локации & Мир', icon: '🏰' },
  { id: 'loot', label: 'Добыча & Сокровища', icon: '🪙' }
];

export const GENERATORS = [
  {
    id: 'd20-hub-generator',
    viewId: 'd20-hub',
    title: 'Каталог Таблиц D20',
    category: 'd20',
    badge: 'Для Мастера',
    badgeType: 'dm',
    bgImage: 'files/D20/fallen_god.jpg',
    description: '12 официальных таблиц D20: Смерть Богов, Дикая Магия, Порталы, Договоры, Фамильяры, Травмы при 0 хитов.',
    icon: '🎲',
    status: 'ready',
    tags: ['D20 Таблицы', 'Катаклизмы', 'Магия', 'Квесты'],
    exampleOutput: 'D20 [12]: «Повсюду начинают появляться временные разломы, вещи из прошлого переходят в настоящее».',
    actionText: 'Открыть каталог D20'
  },
  {
    id: 'tavern-generator',
    viewId: 'tavern',
    title: 'Генератор Таверн & Постоялых Дворов',
    category: 'locations',
    badge: 'Для Мастера',
    badgeType: 'dm',
    bgImage: 'assets/images/cards/card-tavern.jpg',
    description: 'Полная процедурная таверна по таблицам D&D: названия, меню 11 местностей, комнаты, штат, слухи и атмосфера.',
    icon: '🍺',
    status: 'ready',
    tags: ['Таверна', 'Выпивка', 'Слухи', 'Меню', 'Отдых'],
    exampleOutput: 'Постоялый двор «Свистящая Жаба» (Тропики): Муравьи в шоколаде (3 мм), драка в зале, уютная обстановка.',
    actionText: 'Создать таверну'
  },
  {
    id: 'name-generator',
    viewId: 'names',
    title: 'Генератор НИП & Персонажей',
    category: 'characters',
    badge: 'Игрокам & Мастерам',
    badgeType: 'common',
    bgImage: 'assets/images/cards/card-names.jpg',
    description: 'Процедурные имена по 13 расам, возраст, воспитание полукровок, черты внешности и характер.',
    icon: '🧙',
    status: 'ready',
    tags: ['НИП', 'Имена', '13 Рас D&D', 'Характер', 'Внешность'],
    exampleOutput: '«Тариэль Чернозим» — полуэльф 28 лет отроду, воспитанный среди людей в городе...',
    actionText: 'Создать НИПа'
  },
  {
    id: 'loot-generator',
    viewId: 'loot',
    title: 'Генератор Сокровищ & Лута',
    category: 'loot',
    badge: 'Добыча',
    badgeType: 'loot',
    bgImage: 'assets/images/cards/card-loot.jpg',
    description: 'Индивидуальная добыча монстров и сокровищницы по уровню опасности (CR); россыпи монет, драгоценности, артефакты.',
    icon: '👑',
    status: 'ready',
    tags: ['Лут', 'Сундуки', 'Золото', 'CR Таблицы'],
    exampleOutput: 'Сундук (CR 1-4): 140 мм, 70 см, 25 зм, резная статуэтка из слоновой кости (25 зм) и Зелье Лечения.',
    actionText: 'Вскрыть сундук'
  }
];

