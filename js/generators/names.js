/**
 * Randomattic - Name & Character Generator Module
 * Включает расы D&D, родовые фамилии, кланы и прозвища.
 */

import { pickOne } from '../utils/random.js';

export const NAMES_DATA = {
  human: {
    male: ['Артур', 'Гарольд', 'Борис', 'Дариус', 'Роланд', 'Вульфрик', 'Эдмунд', 'Олдос', 'Освальд', 'Каспиан'],
    female: ['Эльза', 'Лиана', 'Мира', 'Селена', 'Беатрис', 'Аделин', 'Элеонора', 'Матильда', 'Ровена', 'Гвендолин'],
    surnames: ['Чернолесов', 'Камнеломов', 'Ясноглазый', 'Стальной Клинок', 'Штормовой', 'Солнцелов', 'Дубовый', 'Холодный Ветер']
  },
  elf: {
    male: ['Эларион', 'Тариэль', 'Фейлин', 'Сильфир', 'Каэлан', 'Арамиль', 'Эреван', 'Ивеллиос', 'Люмиэль', 'Варис'],
    female: ['Лириана', 'Алариэль', 'Мириэль', 'Сильвана', 'Эниэль', 'Келебриль', 'Нариэль', 'Элессиль', 'Тиана', 'Илития'],
    surnames: ['Лунный Шепот', 'Серебряный Вереск', 'Звездный Росток', 'Листопад', 'Тихий Дождь', 'Соколиное Крыло', 'Солнечная Роса']
  },
  dwarf: {
    male: ['Торгрим', 'Балин', 'Гримрок', 'Даглин', 'Броггар', 'Валдур', 'Торвин', 'Рурик', 'Килгор', 'Дункан'],
    female: ['Брунхильда', 'Хельга', 'Дагра', 'Хильда', 'Торга', 'Мардра', 'Герда', 'Ингрид', 'Висна', 'Берта'],
    surnames: ['Медноголовый', 'Железнорук', 'Каменный Щит', 'Глубокоруд', 'Твердолобый', 'Огнебород', 'Молотобоец']
  },
  tiefling: {
    male: ['Мордред', 'Азазель', 'Малакор', 'Каин', 'Бальтазар', 'Люциан', 'Баал', 'Орион', 'Зариэль', 'Тенебрус'],
    female: ['Лилит', 'Кармилла', 'Морриган', 'Акадия', 'Геката', 'Калипсо', 'Немезида', 'Вельвет', 'Сехмет', 'Ноктис'],
    surnames: ['Пепельное Сердце', 'Угли Тьмы', 'Сломанный Рог', 'Шепот Бездны', 'Багровая Кровь', 'Огненный Взор']
  },
  drow: {
    male: ['Дриззт', 'Джарлаксл', 'Закнафейн', 'Келнок', 'Валдир', 'Нимиэль', 'Малик', 'Фаэрун'],
    female: ['Малис', 'Викония', 'Ллосвара', 'Элистра', 'Зелара', 'Твилайт', 'Арания', 'Ксандра'],
    surnames: ['Дом До’Урден', 'Дом Баэнре', 'Тенеплёт', 'Ночной Паук', 'Ядовитое Жало', 'Черная Луна']
  }
};

export const EPITHETS = [
  'Звездочёт', 'Бесстрашный', 'Шепчущий в Тенях', 'Пепельное Сердце',
  'Громобой', 'Лунный Клык', 'Хранитель Очага', 'Одинокий Волк',
  'Ловец Снов', 'Разрушитель Чар', 'Странник Пустошей', 'Рыцарь Печального Образа'
];

/**
 * Сгенерировать имя по заданным параметрам
 * @param {object} options
 * @returns {object}
 */
export function generateCharacterName(options = {}) {
  const raceKey = options.race && options.race !== 'any' ? options.race : pickOne(Object.keys(NAMES_DATA));
  const gender = options.gender && options.gender !== 'any' ? options.gender : pickOne(['male', 'female']);
  const format = options.format || 'full'; // 'full' | 'epithet' | 'simple'

  const racePool = NAMES_DATA[raceKey] || NAMES_DATA.human;
  const firstName = pickOne(racePool[gender] || racePool.male);
  const surname = pickOne(racePool.surnames);
  const epithet = pickOne(EPITHETS);

  let fullName = firstName;
  let titleDetail = '';

  if (format === 'full') {
    fullName = `${firstName} ${surname}`;
    titleDetail = `Из рода ${surname}`;
  } else if (format === 'epithet') {
    fullName = `${firstName} «${epithet}»`;
    titleDetail = `Прозвище: ${epithet}`;
  } else {
    fullName = firstName;
  }

  const raceTitles = {
    human: 'Человек',
    elf: 'Эльф',
    dwarf: 'Дварф',
    tiefling: 'Тифлинг',
    drow: 'Дроу (Темный эльф)'
  };

  return {
    name: fullName,
    race: raceTitles[raceKey] || raceKey,
    gender: gender === 'male' ? 'Мужчина' : 'Женщина',
    titleDetail,
    quote: `«Да пребудут с тобой боги приключений на этой тропе...»`
  };
}
