/**
 * Randomattic - Tavern & Inn Generator Module
 * Построен на основе официальных таблиц из files/Tavern/Random_tavern.xlsm
 */

import { TAVERN_DATA } from '../data/tavern-data.js';
import { pickOne, randInt } from '../utils/random.js';

export function generateTavern(options = {}) {
  const locKey = options.location && options.location !== 'any' ? options.location : pickOne(Object.keys(TAVERN_DATA.menus_by_location));
  const establishmentClass = options.classType || pickOne(['cheap', 'normal', 'luxury']);

  // 1. Генерация названия
  const isFemaleNoun = Math.random() < 0.4;
  const adjList = isFemaleNoun ? TAVERN_DATA.names.adjectives_f : TAVERN_DATA.names.adjectives_m;
  const adj = pickOne(adjList) || 'Пьяный';
  const noun = pickOne(TAVERN_DATA.names.nouns) || 'Дракон';
  
  const prefixes = ['Таверна', 'Постоялый двор', 'Пивная', 'Трактир', 'Привал'];
  const prefix = pickOne(prefixes);
  const name = `${prefix} «${adj} ${noun}»`;

  // 2. Меню по местности из таблицы
  const menuPool = TAVERN_DATA.menus_by_location[locKey] || TAVERN_DATA.menus_by_location['ТРОПИКИ'] || [];
  const menuItem = pickOne(menuPool) || {
    dish: 'Жареный кабан с лесными травами',
    drink: 'Эль «Гномья Память»'
  };

  // 3. Атмосфера
  const atmObj = pickOne(TAVERN_DATA.atmospheres) || {
    mood: 'Уют',
    desc: 'В таверне царит тепло, эль льется рекой, а посетители довольны жизнью.'
  };

  // 4. Слухи и события
  const rumor = pickOne(TAVERN_DATA.rumors) || 'В заброшенных руинах на востоке видели странные огни.';
  const event = pickOne(TAVERN_DATA.events) || 'Кто-то роняет кружку, и раздаётся взрыв смеха.';

  // 5. Класс заведения, комнаты и цены
  const classConfigs = {
    cheap: {
      label: 'Дешёвое заведение',
      sharedHallPrice: '2 мм',
      privateRoomPrice: '5 мм',
      rooms: randInt(1, 4),
      servants: randInt(1, 2),
      bouncers: randInt(0, 1),
      desc: 'Пожалуй, лучшее, что можно позволить за скромные медяки. Простая обстановка, сквозняк, но чисто.'
    },
    normal: {
      label: 'Обычное добротное заведение',
      sharedHallPrice: '2 см',
      privateRoomPrice: '5 см',
      rooms: randInt(4, 8),
      servants: randInt(2, 4),
      bouncers: randInt(1, 2),
      desc: 'Хорошее заведение с крепким штатом рабочих. Есть свободные комнаты, сытная пища и надежная охрана.'
    },
    luxury: {
      label: 'Роскошный постоялый двор',
      sharedHallPrice: '2 зм',
      privateRoomPrice: '10 зм (Апартаменты дворянина)',
      rooms: randInt(8, 16),
      servants: randInt(5, 8),
      bouncers: randInt(2, 4),
      desc: 'Изысканные скатерти, мягкие перины, винный погреб и учтивые слуги. Место для купцов и знати.'
    }
  };

  const currentClass = classConfigs[establishmentClass] || classConfigs.normal;

  // 6. Хозяин заведения
  const races = ['Человек', 'Дварф', 'Эльф', 'Полурослик', 'Тифлинг', 'Полуэльф', 'Драконорожденный'];
  const keeperRace = options.innkeeperRace && options.innkeeperRace !== 'any' ? options.innkeeperRace : pickOne(races);
  const keeperGender = pickOne(['мужчина', 'женщина']);
  const keeperAge = keeperRace === 'Эльф' ? randInt(110, 240) : (keeperRace === 'Дварф' ? randInt(60, 180) : randInt(25, 65));
  
  const keeperFirstNames = ['Барнаби', 'Терин', 'Гунтраз', 'Окино', 'Эльза', 'Хельга', 'Вульфрик', 'Кордрек', 'Листра', 'Торгрим'];
  const keeperSurnames = ['Темнокамень', 'Пьянокровь', 'Рудобой', 'Камнеждун', 'Кузнедух', 'Среброшлем', 'Сталеглот'];
  const keeperName = `${pickOne(keeperFirstNames)} ${pickOne(keeperSurnames)}`;

  // 7. Посетители
  const crowdLevels = [
    'Пусто (пара местных зевак)',
    'Несколько человек за дальними столиками',
    'Небольшая оживленная компания',
    'Толпа — почти все столы заняты',
    'Переполненное заведение, яблоку негде упасть'
  ];
  const crowd = pickOne(crowdLevels);

  return {
    name,
    location: locKey,
    classLabel: currentClass.label,
    innkeeper: `${keeperName} (${keeperRace}, ${keeperGender}, ${keeperAge} лет)`,
    roomsInfo: `Комнат: ${currentClass.rooms}, прислуги: ${currentClass.servants}, вышибал: ${currentClass.bouncers}`,
    roomPrices: `Общий зал: ${currentClass.sharedHallPrice} | Отдельная комната: ${currentClass.privateRoomPrice}`,
    dish: menuItem.dish,
    drink: menuItem.drink,
    atmosphere: `${atmObj.mood} — ${atmObj.desc}`,
    classDescription: currentClass.desc,
    crowd,
    rumor,
    event
  };
}
