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
    title: 'Генератор Имен & Титулов',
    category: 'characters',
    badge: 'Игрокам & Мастерам',
    badgeType: 'common',
    bgImage: 'assets/images/cards/card-names.jpg',
    description: 'Мгновенное создание имен для людей, эльфов, дварфов, тифлингов, дроу, родовых фамилий и героических прозвищ.',
    icon: '🪖',
    status: 'ready',
    tags: ['Имена', 'Расы D&D', 'Фамилии', 'Титулы'],
    exampleOutput: '«Эларион Лунный Шепот» — эльфийский следопыт из клана Серебряного Вереска.',
    actionText: 'Сгенерировать имя'
  },
  {
    id: 'wild-magic-generator',
    viewId: 'd20-wild-magic',
    title: 'Всплески Дикой Магии',
    category: 'd20',
    badge: 'Аномалии',
    badgeType: 'special',
    bgImage: 'files/D20/wild_magic.png',
    description: 'Случайные непредсказуемые эффекты при сотворении заклинаний: обмен телами, взрывы, дожди из кошек и собак.',
    icon: '🔮',
    status: 'ready',
    tags: ['Дикая магия', 'Чародей', 'Взрывы', 'Аномалии'],
    exampleOutput: 'D20 [4]: «С неба начинает лить дождь из собак и кошек! Урон 1d4/1d6 при падении».',
    actionText: 'Вызвать всплеск'
  },
  {
    id: 'secret-societies-generator',
    viewId: 'd20-secret-societies',
    title: 'Тайные Общества & Культы',
    category: 'd20',
    badge: 'Интриги',
    badgeType: 'dm',
    bgImage: 'files/D20/secret_society.jpg',
    description: 'Похитители душ Фигулари, гильдия гробовщиков, культы мифалларов, гномы-заговорщики и ящеролюди у власти.',
    icon: '👁️',
    status: 'ready',
    tags: ['Культы', 'Заговоры', 'Секреты', 'Гильдии'],
    exampleOutput: 'D20 [1]: «Фигулари: маскируются под гончаров, но делают ловушки для ловли душ своих политических оппонентов».',
    actionText: 'Раскрыть заговор'
  },
  {
    id: 'artefacts-generator',
    viewId: 'd20-artefacts',
    title: 'Артефакты & Зацепки для Квестов',
    category: 'd20',
    badge: 'Квесты',
    badgeType: 'loot',
    bgImage: 'files/D20/artefacts_and_clues.jpg',
    description: 'Чешуйки серебряных драконов, полые монеты с шифром, поддельные монеты воровских гильдий и ключи от хранилищ.',
    icon: '🗝️',
    status: 'ready',
    tags: ['Артефакты', 'Зацепки', 'Улики', 'Таинства'],
    exampleOutput: 'D20 [3]: «Поддельная золотая монета с черепом и воровским знаком; карманники возвращают её в ужасе».',
    actionText: 'Найти улику'
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
  },
  {
    id: 'strange-potions-generator',
    viewId: 'd20-potions',
    title: 'Странные Зелья & Мутации',
    category: 'loot',
    badge: 'Алхимия',
    badgeType: 'loot',
    bgImage: 'files/D20/strange_potions.jpg',
    description: 'Необычные алхимические отвары с побочными действиями: свечение пальцев, отрастание перьев, мудрость взамен ума.',
    icon: '🧪',
    status: 'ready',
    tags: ['Зелья', 'Мутации', 'Алхимия', 'Эффекты'],
    exampleOutput: 'D20 [12]: «Указательный палец начинает излучать яркий свет на 20 футов на 1d8 часов».',
    actionText: 'Испей зелье'
  }
];
