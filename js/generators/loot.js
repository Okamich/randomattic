/**
 * Randomattic - Loot & Treasure Hoard Generator Module
 * Процедурная генерация сокровищниц, россыпей монет, самоцветов и магии D&D 5e
 */

import { rollFormula } from '../utils/dice.js';
import { formatCoins } from '../utils/currency.js';
import { pickOne, pickMultiple, randInt } from '../utils/random.js';

export const GEMS_DATA = [
  { name: 'Азурит', category: 'Непрозрачный синий', valueGp: 10 },
  { name: 'Бирюза', category: 'Светло-голубой камень', valueGp: 10 },
  { name: 'Малахит', category: 'Узорчатый зеленый', valueGp: 10 },
  { name: 'Глаз тигра', category: 'Золотисто-коричневый', valueGp: 10 },
  { name: 'Хризоберилл', category: 'Желто-зеленый прозрачный', valueGp: 50 },
  { name: 'Халцедон', category: 'Белый полупрозрачный', valueGp: 50 },
  { name: 'Цитрин', category: 'Бледно-желтый кварц', valueGp: 50 },
  { name: 'Кровавик', category: 'Темно-зеленый с красным', valueGp: 50 },
  { name: 'Аметист', category: 'Глубокий фиолетовый', valueGp: 100 },
  { name: 'Жемчужина', category: 'Чистый перламутр', valueGp: 100 },
  { name: 'Нефрит', category: 'Светло-зеленый прозрачный', valueGp: 100 },
  { name: 'Турмалин', category: 'Многоцветный кристалл', valueGp: 100 },
  { name: 'Топаз', category: 'Золотисто-желтый кристалл', valueGp: 500 },
  { name: 'Аквамарин', category: 'Цвет морской волны', valueGp: 500 },
  { name: 'Черный жемчуг', category: 'Редчайший морской дар', valueGp: 500 },
  { name: 'Сапфир', category: 'Глубокий васильковый', valueGp: 1000 },
  { name: 'Огненный опал', category: 'Сверкающий оранжевый', valueGp: 1000 },
  { name: 'Рубин огненный', category: 'Алый драконий камень', valueGp: 1000 },
  { name: 'Изумруд чистой воды', category: 'Насыщенный зеленый', valueGp: 1000 },
  { name: 'Звездчатый рубин', category: 'Сияющая звезда в камне', valueGp: 5000 },
  { name: 'Алмаз чистой воды', category: 'Идеальный ограненный бриллиант', valueGp: 5000 }
];

export const ART_OBJECTS_DATA = [
  { name: 'Серебряный кубок с гравировкой дракона', category: 'Посуда', valueGp: 25, desc: 'Тонкая чеканка работы эльфийских мастеров' },
  { name: 'Резная костяная статуэтка богини удачи', category: 'Идол', valueGp: 25, desc: 'Вырезана из бивня мамонта с позолотой' },
  { name: 'Золотое кольцо с маленьким изумрудом', category: 'Ювелирка', valueGp: 250, desc: 'На внутренней стороне выгравировано тайное имя' },
  { name: 'Шелковый церемониальный плащ с золотой вышивкой', category: 'Одежда', valueGp: 250, desc: 'Ткань пахнет благовониями и миррой' },
  { name: 'Церемониальный кинжал в ножнах из чешуи виверны', category: 'Оружие', valueGp: 750, desc: 'Рукоять инкрустирована гранатами' },
  { name: 'Золотой ларец с гравировкой лунных фаз', category: 'Шкатулка', valueGp: 750, desc: 'Оснащен хитрым замком гномьей работы' },
  { name: 'Платиновая корона с черными опалами', category: 'Регалия', valueGp: 2500, desc: 'Древний венец правителей павшей империи' },
  { name: 'Икона из слоновой кости в золотом окладе', category: 'Реликвия', valueGp: 2500, desc: 'Изображение вознесения древнего паладина' },
  { name: 'Золотая погребальная маска с рубиновыми слезами', category: 'Реликвия', valueGp: 7500, desc: 'Принадлежала царю-жрецу древних династий' }
];

export const MAGIC_ITEMS_DATA = [
  { name: 'Зелье Лечения (Potion of Healing)', type: 'Зелье', rarity: 'common', rarityLabel: 'Обычный', desc: 'Восстанавливает 2d4 + 2 хитов при употреблении.' },
  { name: 'Свиток: Огненный Шар (Fireball)', type: 'Свиток', rarity: 'uncommon', rarityLabel: 'Необычный', desc: 'Сотворяет заклинание 3-го круга (урон 8d6 огнем по области 20 фт).' },
  { name: 'Свиток: Невидимость (Invisibility)', type: 'Свиток', rarity: 'uncommon', rarityLabel: 'Необычный', desc: 'Скрывает цель от глаз на срок до 1 часа.' },
  { name: 'Сумка Хранения (Bag of Holding)', type: 'Чудесный предмет', rarity: 'uncommon', rarityLabel: 'Необычный', desc: 'Вмещает до 500 фунтов при собственном неизменном весе в 15 фунтов.' },
  { name: 'Плащ Защиты (Cloak of Protection)', type: 'Одеяние', rarity: 'uncommon', rarityLabel: 'Необычный', desc: 'Дарует бонус +1 к Классу Доспеха и всем спасброскам владельца.' },
  { name: 'Сапоги Эльфийской Походки', type: 'Обувь', rarity: 'uncommon', rarityLabel: 'Необычный', desc: 'Шаги владельца становятся абсолютно бесшумными.' },
  { name: 'Длинный меч +1 (Руническая Сталь)', type: 'Оружие', rarity: 'uncommon', rarityLabel: 'Необычный', desc: 'Бонус +1 к броскам атаки и урону; тускло светится рядом с нежитью.' },
  { name: 'Кольцо Водного Дыхания', type: 'Кольцо', rarity: 'uncommon', rarityLabel: 'Необычный', desc: 'Позволяет дышать под водой неограниченное время.' },
  { name: 'Булава Разрушения (Mace of Disruption)', type: 'Оружие', rarity: 'rare', rarityLabel: 'Редкий', desc: 'Наносит дополнительно 2d6 урона излучением исчадиям и нежити.' },
  { name: 'Кольцо Защиты (Ring of Protection)', type: 'Кольцо', rarity: 'rare', rarityLabel: 'Редкий', desc: '+1 к КД и спасброскам; носитель ощущает прилив ментальной стойкости.' },
  { name: 'Пояс Силы Великана Холмов', type: 'Пояс', rarity: 'rare', rarityLabel: 'Редкий', desc: 'Устанавливает показатель Силы владельца равным 21.' },
  { name: 'Огненный Язык (Flame Tongue)', type: 'Оружие', rarity: 'rare', rarityLabel: 'Редкий', desc: 'По слову-команде лезвие вспыхивает пламенем, нанося +2d6 огнем.' },
  { name: 'Амулет Здоровья (Amulet of Health)', type: 'Амулет', rarity: 'rare', rarityLabel: 'Редкий', desc: 'Устанавливает показатель Телосложения владельца равным 19.' },
  { name: 'Посох Силы (Staff of Power)', type: 'Посох', rarity: 'very_rare', rarityLabel: 'Очень редкий', desc: 'Дарует +2 к атакам и спасброскам заклинаний, запас 20 зарядов могучей магии.' },
  { name: 'Кольцо Регенерации', type: 'Кольцо', rarity: 'very_rare', rarityLabel: 'Очень редкий', desc: 'Восстанавливает 1d6 хитов каждые 10 минут и заживляет утраченные конечности.' },
  { name: 'Святой Каратель (Holy Avenger)', type: 'Оружие', rarity: 'legendary', rarityLabel: 'Легендарный', desc: 'Легендарный меч паладина (+3, +2d10 урона излучением, аура защиты от заклинаний).' },
  { name: 'Сфера Аннигиляции (Sphere of Annihilation)', type: 'Артефакт', rarity: 'legendary', rarityLabel: 'Легендарный', desc: 'Черная парящая пустота диаметром 2 фута, распыляющая материю в ничто.' }
];

/**
 * Сгенерировать сокровище
 * @param {object} options { crTier: '0-4'|'5-10'|'11-16'|'17+', type: 'hoard'|'individual', multiplier: 1 }
 * @returns {object}
 */
export function generateLoot(options = {}) {
  const tier = options.crTier || '0-4';
  const type = options.type || 'hoard';
  const multiplier = parseFloat(options.multiplier || '1.0');

  let coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  let gemsList = [];
  let artsList = [];
  let magicList = [];

  if (type === 'individual') {
    // Индивидуальная карманная добыча
    if (tier === '0-4') {
      coins.cp = Math.round(rollFormula('4d6').total * multiplier);
      coins.sp = Math.round(rollFormula('3d6').total * multiplier);
      coins.gp = Math.round(rollFormula('2d6').total * multiplier);
    } else if (tier === '5-10') {
      coins.sp = Math.round(rollFormula('4d6 * 10').total * multiplier);
      coins.gp = Math.round(rollFormula('2d6 * 10').total * multiplier);
      coins.pp = Math.round(rollFormula('1d6').total * multiplier);
    } else if (tier === '11-16') {
      coins.gp = Math.round(rollFormula('4d6 * 100').total * multiplier);
      coins.pp = Math.round(rollFormula('1d6 * 10').total * multiplier);
    } else {
      // 17+
      coins.gp = Math.round(rollFormula('8d6 * 100').total * multiplier);
      coins.pp = Math.round(rollFormula('3d6 * 100').total * multiplier);
    }
  } else {
    // Сокровищница в сундуке (Hoard)
    if (tier === '0-4') {
      coins.cp = Math.round(rollFormula('6d6 * 100').total * multiplier);
      coins.sp = Math.round(rollFormula('3d6 * 100').total * multiplier);
      coins.gp = Math.round(rollFormula('2d6 * 10').total * multiplier);

      const gemPool = GEMS_DATA.filter(g => g.valueGp <= 50);
      const gemPicks = pickMultiple(gemPool, randInt(2, 4));
      gemsList = gemPicks.map(g => ({
        ...g,
        count: randInt(1, 3),
        totalGp: 0
      })).map(g => ({ ...g, totalGp: g.valueGp * g.count }));

      const artPool = ART_OBJECTS_DATA.filter(a => a.valueGp <= 25);
      const artPicks = pickMultiple(artPool, randInt(1, 2));
      artsList = artPicks.map(a => ({
        ...a,
        count: 1,
        totalGp: a.valueGp
      }));

      const magicPool = MAGIC_ITEMS_DATA.filter(m => m.rarity === 'common' || m.rarity === 'uncommon');
      magicList = pickMultiple(magicPool, randInt(1, 2));
    } else if (tier === '5-10') {
      coins.cp = Math.round(rollFormula('2d6 * 100').total * multiplier);
      coins.sp = Math.round(rollFormula('2d6 * 1000').total * multiplier);
      coins.gp = Math.round(rollFormula('6d6 * 100').total * multiplier);
      coins.pp = Math.round(rollFormula('3d6 * 10').total * multiplier);

      const gemPool = GEMS_DATA.filter(g => g.valueGp >= 50 && g.valueGp <= 500);
      const gemPicks = pickMultiple(gemPool, randInt(3, 6));
      gemsList = gemPicks.map(g => ({
        ...g,
        count: randInt(1, 4),
        totalGp: 0
      })).map(g => ({ ...g, totalGp: g.valueGp * g.count }));

      const artPool = ART_OBJECTS_DATA.filter(a => a.valueGp >= 25 && a.valueGp <= 250);
      const artPicks = pickMultiple(artPool, randInt(1, 3));
      artsList = artPicks.map(a => ({
        ...a,
        count: 1,
        totalGp: a.valueGp
      }));

      const magicPool = MAGIC_ITEMS_DATA.filter(m => m.rarity === 'uncommon' || m.rarity === 'rare');
      magicList = pickMultiple(magicPool, randInt(2, 4));
    } else if (tier === '11-16') {
      coins.gp = Math.round(rollFormula('12d6 * 1000').total * multiplier);
      coins.pp = Math.round(rollFormula('8d6 * 1000').total * multiplier);

      const gemPool = GEMS_DATA.filter(g => g.valueGp >= 500 && g.valueGp <= 1000);
      const gemPicks = pickMultiple(gemPool, randInt(4, 8));
      gemsList = gemPicks.map(g => ({
        ...g,
        count: randInt(2, 5),
        totalGp: 0
      })).map(g => ({ ...g, totalGp: g.valueGp * g.count }));

      const artPool = ART_OBJECTS_DATA.filter(a => a.valueGp >= 250 && a.valueGp <= 2500);
      const artPicks = pickMultiple(artPool, randInt(2, 4));
      artsList = artPicks.map(a => ({
        ...a,
        count: 1,
        totalGp: a.valueGp
      }));

      const magicPool = MAGIC_ITEMS_DATA.filter(m => m.rarity === 'rare' || m.rarity === 'very_rare');
      magicList = pickMultiple(magicPool, randInt(2, 4));
    } else {
      // 17+
      coins.gp = Math.round(rollFormula('12d6 * 10000').total * multiplier);
      coins.pp = Math.round(rollFormula('8d6 * 10000').total * multiplier);

      const gemPool = GEMS_DATA.filter(g => g.valueGp >= 1000);
      const gemPicks = pickMultiple(gemPool, randInt(6, 12));
      gemsList = gemPicks.map(g => ({
        ...g,
        count: randInt(2, 6),
        totalGp: 0
      })).map(g => ({ ...g, totalGp: g.valueGp * g.count }));

      const artPool = ART_OBJECTS_DATA.filter(a => a.valueGp >= 750);
      const artPicks = pickMultiple(artPool, randInt(3, 5));
      artsList = artPicks.map(a => ({
        ...a,
        count: 1,
        totalGp: a.valueGp
      }));

      const magicPool = MAGIC_ITEMS_DATA.filter(m => m.rarity === 'rare' || m.rarity === 'very_rare' || m.rarity === 'legendary');
      magicList = pickMultiple(magicPool, randInt(3, 5));
    }
  }

  // Расчет общей стоимости в GP
  const coinsGp = (coins.cp / 100) + (coins.sp / 10) + (coins.ep / 2) + coins.gp + (coins.pp * 10);
  const gemsGp = gemsList.reduce((acc, g) => acc + g.totalGp, 0);
  const artsGp = artsList.reduce((acc, a) => acc + a.totalGp, 0);
  const totalEstimatedGp = Math.round(coinsGp + gemsGp + artsGp);

  const tierLabels = {
    '0-4': 'CR 0–4 (Начинающие)',
    '5-10': 'CR 5–10 (Опытные)',
    '11-16': 'CR 11–16 (Мастера)',
    '17+': 'CR 17+ (Легенды)'
  };

  return {
    tier: `CR ${tier}`,
    tierLabel: tierLabels[tier] || `CR ${tier}`,
    type: type === 'hoard' ? 'Сокровищница логова (Сундук)' : 'Индивидуальная добыча',
    typeKey: type,
    multiplier,
    coins,
    coinsGp: Math.round(coinsGp),
    coinsFormatted: formatCoins(coins),
    gems: gemsList,
    gemsGp,
    arts: artsList,
    artsGp,
    magicItems: magicList,
    totalEstimatedGp
  };
}
