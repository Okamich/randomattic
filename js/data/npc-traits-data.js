/**
 * Randomattic - NPC Extended Traits Data (Face, Physical, Accessories, Emotions, Faith/Flaws)
 * Translated and compiled from files/NPC/NPC_TRAITS.xlsx
 */

export const NPC_EXTENDED_TRAITS_DATA = {
  "eyes": {
    "id": "eyes",
    "count": 20,
    "options": [
      {
        "roll": 1,
        "textEn": "Sleepy eyes.",
        "textRu": "Сонные, отяжелевшие веки"
      },
      {
        "roll": 2,
        "textEn": "Shifty eyes.",
        "textRu": "Бегающий, вороватый взгляд"
      },
      {
        "roll": 3,
        "textEn": "Watery eyes.",
        "textRu": "Слезящиеся, блестящие глаза"
      },
      {
        "roll": 4,
        "textEn": "Bright eyes.",
        "textRu": "Яркие, живые глаза"
      },
      {
        "roll": 5,
        "textEn": "Cold eyes.",
        "textRu": "Холодный, леденящий взгляд"
      },
      {
        "roll": 6,
        "textEn": "Smiling eyes.",
        "textRu": "Улыбчивые, лучистые глаза"
      },
      {
        "roll": 7,
        "textEn": "Close-set eyes.",
        "textRu": "Близко посаженные глаза"
      },
      {
        "roll": 8,
        "textEn": "Wild eyes.",
        "textRu": "Дикий, свирепый или безумный взгляд"
      },
      {
        "roll": 9,
        "textEn": "Distant eyes.",
        "textRu": "Отрешённый, устремлённый вдаль взгляд"
      },
      {
        "roll": 10,
        "textEn": "A lazy eye.",
        "textRu": "«Ленивый» глаз (лёгкое косоглазие)"
      },
      {
        "roll": 11,
        "textEn": "Piercing eyes.",
        "textRu": "Пронзительный, словно сверлящий насквозь взгляд"
      },
      {
        "roll": 12,
        "textEn": "Watchful eyes.",
        "textRu": "Бдительные, настороженные глаза"
      },
      {
        "roll": 13,
        "textEn": "Dark eyes.",
        "textRu": "Глубокие тёмные, почти угольные глаза"
      },
      {
        "roll": 14,
        "textEn": "Hooded eyes.",
        "textRu": "Глаза с тяжёлыми, нависшими веками"
      },
      {
        "roll": 15,
        "textEn": "Eyes of two different colors.",
        "textRu": "Гетерохромия (глаза разного цвета)"
      },
      {
        "roll": 16,
        "textEn": "Slightly crossed eyes.",
        "textRu": "Слегка скошенные к переносице глаза"
      },
      {
        "roll": 17,
        "textEn": "Wide eyes.",
        "textRu": "Широко распахнутые удивлённые глаза"
      },
      {
        "roll": 18,
        "textEn": "Beautiful eyes.",
        "textRu": "Необычайно красивые, притягательные глаза"
      },
      {
        "roll": 19,
        "textEn": "Beady eyes.",
        "textRu": "Маленькие глаза-бусинки"
      },
      {
        "roll": 20,
        "textEn": "Penetrating eyes.",
        "textRu": "Проницательный, пристальный взгляд"
      }
    ]
  },
  "hair": {
    "id": "hair",
    "count": 20,
    "options": [
      {
        "roll": 1,
        "textEn": "Thick hair.",
        "textRu": "Густая, плотная шевелюра"
      },
      {
        "roll": 2,
        "textEn": "Wispy hair.",
        "textRu": "Тонкие, пушистые редкие волосы"
      },
      {
        "roll": 3,
        "textEn": "Straight hair.",
        "textRu": "Прямые, гладко спадающие волосы"
      },
      {
        "roll": 4,
        "textEn": "Wavy hair.",
        "textRu": "Волнистые мягкие локоны"
      },
      {
        "roll": 5,
        "textEn": "Curly hair.",
        "textRu": "Крутые кудри или завитки"
      },
      {
        "roll": 6,
        "textEn": "Wiry hair.",
        "textRu": "Жёсткие, проволочные волосы"
      },
      {
        "roll": 7,
        "textEn": "Oily hair.",
        "textRu": "Жирные, лоснящиеся пряди"
      },
      {
        "roll": 8,
        "textEn": "Lush hair.",
        "textRu": "Пышная, роскошная копна волос"
      },
      {
        "roll": 9,
        "textEn": "Poofy hair.",
        "textRu": "Взъерошенные, торчащие пуфом волосы"
      },
      {
        "roll": 10,
        "textEn": "Long braids.",
        "textRu": "Длинные тугие косы"
      },
      {
        "roll": 11,
        "textEn": "Braids tight against the head.",
        "textRu": "Косички, плотно заплетённые по черепу"
      },
      {
        "roll": 12,
        "textEn": "Very long hair.",
        "textRu": "Очень длинные волосы ниже пояса"
      },
      {
        "roll": 13,
        "textEn": "Greasy hair.",
        "textRu": "Сальные, непричёсанные патлы"
      },
      {
        "roll": 14,
        "textEn": "Unruly hair.",
        "textRu": "Непокорные, торчащие во все стороны вихры"
      },
      {
        "roll": 15,
        "textEn": "An unusual hairstyle.",
        "textRu": "Причудливая, необычная для этих мест причёска"
      },
      {
        "roll": 16,
        "textEn": "An outdated hairstyle.",
        "textRu": "Старомодная, консервативная стрижка"
      },
      {
        "roll": 17,
        "textEn": "A high-maintenance hairstyle.",
        "textRu": "Сложная, требующая тщательного ухода укладка"
      },
      {
        "roll": 18,
        "textEn": "Short-cropped hair.",
        "textRu": "Коротко остриженные под машинку/ножницы волосы"
      },
      {
        "roll": 19,
        "textEn": "A shaved head.",
        "textRu": "Бритая наголо голова"
      },
      {
        "roll": 20,
        "textEn": "No hair at all.",
        "textRu": "Абсолютная природная лысина"
      }
    ]
  },
  "mouth": {
    "id": "mouth",
    "count": 10,
    "options": [
      {
        "roll": 1,
        "textEn": "Full lips.",
        "textRu": "Полные, чувственные губы"
      },
      {
        "roll": 2,
        "textEn": "Buck-teeth.",
        "textRu": "Выпирающие вперёд резцы («заячьи зубы»)"
      },
      {
        "roll": 3,
        "textEn": "Thin lips.",
        "textRu": "Тонкие, поджатые губы-ниточки"
      },
      {
        "roll": 4,
        "textEn": "Rotting teeth.",
        "textRu": "Потемневшие, подгнившие зубы"
      },
      {
        "roll": 5,
        "textEn": "Crooked teeth.",
        "textRu": "Неровные, вкривь растущие зубы"
      },
      {
        "roll": 6,
        "textEn": "A broken or missing tooth.",
        "textRu": "Сломанный или выбитый передний зуб"
      },
      {
        "roll": 7,
        "textEn": "Pursed lips.",
        "textRu": "Вечно плотно сжатые, насупленные губы"
      },
      {
        "roll": 8,
        "textEn": "Dry, cracked lips.",
        "textRu": "Сухие, потрескавшиеся на ветру губы"
      },
      {
        "roll": 9,
        "textEn": "One or more false teeth.",
        "textRu": "Один или несколько фальшивых зубов (золотой, деревянный или костяной)"
      },
      {
        "roll": 10,
        "textEn": "A mouth that hangs open.",
        "textRu": "Полуоткрытый, вечно приоткрытый рот"
      }
    ]
  },
  "nose": {
    "id": "nose",
    "count": 12,
    "options": [
      {
        "roll": 1,
        "textEn": "A crooked nose.",
        "textRu": "Кривой нос (со следами перелома)"
      },
      {
        "roll": 2,
        "textEn": "A bulbous nose.",
        "textRu": "Мясистый нос «картошкой»"
      },
      {
        "roll": 3,
        "textEn": "A narrow nose.",
        "textRu": "Узкий, тонкий нос"
      },
      {
        "roll": 4,
        "textEn": "A button nose.",
        "textRu": "Аккуратный нос «пуговкой»"
      },
      {
        "roll": 5,
        "textEn": "A long nose.",
        "textRu": "Длинный, вытянутый нос"
      },
      {
        "roll": 6,
        "textEn": "A broad nose.",
        "textRu": "Широкий, приплюснутый нос"
      },
      {
        "roll": 7,
        "textEn": "An angular nose.",
        "textRu": "Острый, угловатый нос"
      },
      {
        "roll": 8,
        "textEn": "A round nose.",
        "textRu": "Круглый, мягкий нос"
      },
      {
        "roll": 9,
        "textEn": "A broken nose.",
        "textRu": "Явно сломанный и криво сросшийся нос"
      },
      {
        "roll": 10,
        "textEn": "A hawk-like nose.",
        "textRu": "Хищный нос с горбинкой («ястребиный»)"
      },
      {
        "roll": 11,
        "textEn": "A wide nose.",
        "textRu": "Крупный, широкий нос"
      },
      {
        "roll": 12,
        "textEn": "A delicate nose.",
        "textRu": "Тонкий, изящный аристократический носик"
      }
    ]
  },
  "ears": {
    "id": "ears",
    "count": 12,
    "options": [
      {
        "roll": 1,
        "textEn": "Over-sized ears.",
        "textRu": "Огромные, оттопыренные уши"
      },
      {
        "roll": 2,
        "textEn": "Long ear lobes.",
        "textRu": "Длинные, вытянутые мочки ушей"
      },
      {
        "roll": 3,
        "textEn": "Small ears.",
        "textRu": "Маленькие, аккуратные ушки"
      },
      {
        "roll": 4,
        "textEn": "Uneven ears.",
        "textRu": "Асимметричные, неровные уши"
      },
      {
        "roll": 5,
        "textEn": "Hairy ears.",
        "textRu": "Волосатые уши с торчащими пучками"
      },
      {
        "roll": 6,
        "textEn": "Pointy ears.",
        "textRu": "Заострённые кверху кончики ушей"
      },
      {
        "roll": 7,
        "textEn": "Short ear lobes.",
        "textRu": "Крошечные, почти сросшиеся мочки"
      },
      {
        "roll": 8,
        "textEn": "Ears that stick out.",
        "textRu": "Лопоухие, сильно торчащие в стороны уши"
      },
      {
        "roll": 9,
        "textEn": "Jug-handle ears.",
        "textRu": "Уши торчком («ручки от кувшина»)"
      },
      {
        "roll": 10,
        "textEn": "Elaborately pierced ears.",
        "textRu": "Уши с богатым пирсингом (множество колец и сережек)"
      },
      {
        "roll": 11,
        "textEn": "Cauliflower ears.",
        "textRu": "Поломанные борцовские уши («пельмени»)"
      },
      {
        "roll": 12,
        "textEn": "Ears with improbable tufts of hair.",
        "textRu": "Уши с диковинными пучками густой шерсти"
      }
    ]
  },
  "chin": {
    "id": "chin",
    "count": 8,
    "options": [
      {
        "roll": 1,
        "textEn": "A pronounced chin.",
        "textRu": "Тяжёлый, резко выраженный подбородок"
      },
      {
        "roll": 2,
        "textEn": "A cleft chin.",
        "textRu": "Подбородок с глубокой мужественной ямочкой"
      },
      {
        "roll": 3,
        "textEn": "A dimple on the chin.",
        "textRu": "Очаровательная ямочка на подбородке"
      },
      {
        "roll": 4,
        "textEn": "A rounded chin.",
        "textRu": "Мягкий, округлый подбородок"
      },
      {
        "roll": 5,
        "textEn": "A sharp jawline.",
        "textRu": "Острая, словно выточенная линия челюсти"
      },
      {
        "roll": 6,
        "textEn": "A square jaw.",
        "textRu": "Тяжёлая квадратная волевая челюсть"
      },
      {
        "roll": 7,
        "textEn": "A round jaw.",
        "textRu": "Круглая, пухлая челюсть"
      },
      {
        "roll": 8,
        "textEn": "An underbite.",
        "textRu": "Выпирающая вперёд челюсть (нижний прикус)"
      }
    ]
  },
  "otherFace": {
    "id": "otherFace",
    "count": 8,
    "options": [
      {
        "roll": 1,
        "textEn": "High cheekbones.",
        "textRu": "Высокие, рельефные скулы"
      },
      {
        "roll": 2,
        "textEn": "Tight, drawn cheeks.",
        "textRu": "Впалые, обтянутые кожей худые щёки"
      },
      {
        "roll": 3,
        "textEn": "Chubby cheeks.",
        "textRu": "Пухлые, румяные щёчки"
      },
      {
        "roll": 4,
        "textEn": "An unpleasant pustule.",
        "textRu": "Неприятная сыпь или воспалённый нарыв на лице"
      },
      {
        "roll": 5,
        "textEn": "A large mole.",
        "textRu": "Крупная, заметная родинка на щеке"
      },
      {
        "roll": 6,
        "textEn": "A beauty mark.",
        "textRu": "Изящная тёмная мушка над губой"
      },
      {
        "roll": 7,
        "textEn": "Freckles.",
        "textRu": "Россыпь ярких солнечных веснушек"
      },
      {
        "roll": 8,
        "textEn": "Terrible scarring.",
        "textRu": "Грубые шрамы от оспы, ожогов или клинка"
      }
    ]
  },
  "height": {
    "id": "height",
    "count": 6,
    "options": [
      {
        "roll": 1,
        "textEn": "Unusually short.",
        "textRu": "Необычайно низкий рост (карлик среди своего народа)"
      },
      {
        "roll": 2,
        "textEn": "Short in stature.",
        "textRu": "Заметно ниже среднего роста"
      },
      {
        "roll": 3,
        "textEn": "Average height.",
        "textRu": "Среднего, ничем не примечательного роста"
      },
      {
        "roll": 4,
        "textEn": "Slightly above average height.",
        "textRu": "Чуть выше среднего роста"
      },
      {
        "roll": 5,
        "textEn": "Well above average height.",
        "textRu": "Заметно выше большинства сородичей"
      },
      {
        "roll": 6,
        "textEn": "Unusually tall.",
        "textRu": "Исполинский, необычайно высокий рост"
      }
    ]
  },
  "body": {
    "id": "body",
    "count": 20,
    "options": [
      {
        "roll": 1,
        "textEn": "Thin and delicate.",
        "textRu": "Худощавое, хрупкое телосложение"
      },
      {
        "roll": 2,
        "textEn": "Of average build.",
        "textRu": "Обычное, среднее телосложение"
      },
      {
        "roll": 3,
        "textEn": "Well-muscled.",
        "textRu": "Мускулистое, крепко сбитое атлетичное тело"
      },
      {
        "roll": 4,
        "textEn": "Slightly overweight.",
        "textRu": "Слегка полноватое телосложение с брюшком"
      },
      {
        "roll": 5,
        "textEn": "Grotesquely obese.",
        "textRu": "Грузное, крайне тучное телосложение"
      },
      {
        "roll": 6,
        "textEn": "Lean and lanky.",
        "textRu": "Худощавое, долговязое тело"
      },
      {
        "roll": 7,
        "textEn": "Lithe and lean.",
        "textRu": "Гибкое, поджарое и жилистое тело"
      },
      {
        "roll": 8,
        "textEn": "Thin and wiry.",
        "textRu": "Сухощавое, жилистое телосложение"
      },
      {
        "roll": 9,
        "textEn": "Sinewy and strong.",
        "textRu": "Мощное, жилистое и жилисто-крепкое тело"
      },
      {
        "roll": 10,
        "textEn": "Flabby and weak.",
        "textRu": "Дряблое, рыхлое телосложение без мышц"
      },
      {
        "roll": 11,
        "textEn": "Lumpy or bent.",
        "textRu": "Сутулое, искривлённое или угловатое тело"
      },
      {
        "roll": 12,
        "textEn": "Thin and flimsy.",
        "textRu": "Тонкое, хрупкое и легковесное телосложение"
      },
      {
        "roll": 13,
        "textEn": "Soft and chubby.",
        "textRu": "Мягкое, пухлое и округлое тело"
      },
      {
        "roll": 14,
        "textEn": "Thin and petite.",
        "textRu": "Миниатюрное, тонкокостное телосложение"
      },
      {
        "roll": 15,
        "textEn": "Pudgy.",
        "textRu": "Коренастое, плотное и пухловатое тело"
      },
      {
        "roll": 16,
        "textEn": "Big and broad.",
        "textRu": "Широкоплечее, массивное богатырское сложение"
      },
      {
        "roll": 17,
        "textEn": "Stocky and strong.",
        "textRu": "Крепкое, кряжистое и приземистое телосложение"
      },
      {
        "roll": 18,
        "textEn": "Bony.",
        "textRu": "Костлявое тело, обтянутое кожей (видны ребра)"
      },
      {
        "roll": 19,
        "textEn": "Wide and ponderous.",
        "textRu": "Широкое, тяжеловесное и неповоротливое тело"
      },
      {
        "roll": 20,
        "textEn": "Covered in hair.",
        "textRu": "Густо покрытое волосами или шерстью тело"
      }
    ]
  },
  "hands": {
    "id": "hands",
    "count": 6,
    "options": [
      {
        "roll": 1,
        "textEn": "Powerful hands.",
        "textRu": "Мощные, мозолистые кузнечные руки"
      },
      {
        "roll": 2,
        "textEn": "Delicate hands.",
        "textRu": "Тонкие, изящные руки музыканта или мага"
      },
      {
        "roll": 3,
        "textEn": "Rough hands.",
        "textRu": "Огрубевшие, обветренные крестьянские руки"
      },
      {
        "roll": 4,
        "textEn": "Soft hands.",
        "textRu": "Мягкие, холёные барские ладони"
      },
      {
        "roll": 5,
        "textEn": "A light touch.",
        "textRu": "Лёгкое, порхающее касание искусного вора или лекаря"
      },
      {
        "roll": 6,
        "textEn": "A heavy touch.",
        "textRu": "Тяжёлое, сокрушительное пудовое рукопожатие"
      }
    ]
  },
  "scar": {
    "id": "scar",
    "count": 4,
    "options": [
      {
        "roll": 1,
        "textEn": "A jagged scar.",
        "textRu": "Рваный зазубренный шрам от когтей или зазубренного топора"
      },
      {
        "roll": 2,
        "textEn": "A dark purple scar.",
        "textRu": "Тёмно-фиолетовый застарелый шрам от ядовитого клинка"
      },
      {
        "roll": 3,
        "textEn": "An angry red scar.",
        "textRu": "Воспалённый багрово-красный свежий рубец"
      },
      {
        "roll": 4,
        "textEn": "A long, thin scar.",
        "textRu": "Длинный, тонкий как нить дуэльный шрам"
      }
    ]
  },
  "tattoo": {
    "id": "tattoo",
    "count": 12,
    "options": [
      {
        "roll": 1,
        "textEn": "A dagger tattoo.",
        "textRu": "Татуировка кинжала, капающего кровью"
      },
      {
        "roll": 2,
        "textEn": "An arrow tattoo.",
        "textRu": "Татуировка острой стрелы на предплечье"
      },
      {
        "roll": 3,
        "textEn": "An anchor tattoo.",
        "textRu": "Морская татуировка якоря"
      },
      {
        "roll": 4,
        "textEn": "A skull tattoo.",
        "textRu": "Зловещая татуировка человеческого черепа"
      },
      {
        "roll": 5,
        "textEn": "A pair of crossed bones tattoo.",
        "textRu": "Пиратская татуировка скрещённых костей"
      },
      {
        "roll": 6,
        "textEn": "A snake tattoo.",
        "textRu": "Татуировка извивающейся ядовитой змеи"
      },
      {
        "roll": 7,
        "textEn": "A scorpion tattoo.",
        "textRu": "Татуировка чёрного скорпиона"
      },
      {
        "roll": 8,
        "textEn": "A spider web tattoo.",
        "textRu": "Татуировка паутины на локте или шее"
      },
      {
        "roll": 9,
        "textEn": "A heart tattoo.",
        "textRu": "Татуировка пылающего или пронзённого сердца"
      },
      {
        "roll": 10,
        "textEn": "A ring of thorns tattoo.",
        "textRu": "Татуировка тернового венца вокруг запястья"
      },
      {
        "roll": 11,
        "textEn": "A mermaid tattoo.",
        "textRu": "Красочная татуировка русалки или сирены"
      },
      {
        "roll": 12,
        "textEn": "A dragon tattoo.",
        "textRu": "Искусная татуировка огнедышащего дракона"
      }
    ]
  },
  "jewelry": {
    "id": "jewelry",
    "count": 12,
    "options": [
      {
        "roll": 1,
        "textEn": "An earring.",
        "textRu": "Одиночная серьга в ухе"
      },
      {
        "roll": 2,
        "textEn": "Two earrings.",
        "textRu": "Две серьги в одном или обоих ушах"
      },
      {
        "roll": 3,
        "textEn": "A small chain about the neck.",
        "textRu": "Тонкая металлическая цепочка на шее"
      },
      {
        "roll": 4,
        "textEn": "A large chain about the neck.",
        "textRu": "Массивная тяжёлая цепь на шее"
      },
      {
        "roll": 5,
        "textEn": "A tight choker about the neck.",
        "textRu": "Тугой кожаный или металлический чокер на шее"
      },
      {
        "roll": 6,
        "textEn": "A brooch.",
        "textRu": "Старинная винтажная брошь на воротнике"
      },
      {
        "roll": 7,
        "textEn": "A ring.",
        "textRu": "Скромное металлическое кольцо на пальце"
      },
      {
        "roll": 8,
        "textEn": "Several rings.",
        "textRu": "Несколько перстней на пальцах обеих рук"
      },
      {
        "roll": 9,
        "textEn": "A bracelet.",
        "textRu": "Браслет на запястье (костяной, плетёный или металлический)"
      },
      {
        "roll": 10,
        "textEn": "A nose ring.",
        "textRu": "Кольцо в носу (септум или в крыле носа)"
      },
      {
        "roll": 11,
        "textEn": "A medallion.",
        "textRu": "Массивный медальон с тайным знаком или гербом"
      },
      {
        "roll": 12,
        "textEn": "An ornate belt.",
        "textRu": "Богато украшенный пояс с гравированной пряжкой"
      }
    ]
  },
  "clothes": {
    "id": "clothes",
    "count": 8,
    "options": [
      {
        "roll": 1,
        "textEn": "Crisp and new.",
        "textRu": "С иголочки: свежая, наглаженная и чистая одежда"
      },
      {
        "roll": 2,
        "textEn": "Fashionable and hip.",
        "textRu": "Модная, франтовская и стильная одежда по последнему слову столицы"
      },
      {
        "roll": 3,
        "textEn": "A bit old-fashioned.",
        "textRu": "Слегка старомодный, винтажный покрой наряда"
      },
      {
        "roll": 4,
        "textEn": "Of the highest quality.",
        "textRu": "Одежда высочайшего качества из дорогого сукна или бархата"
      },
      {
        "roll": 5,
        "textEn": "Faded, but in good condition.",
        "textRu": "Выцветшая от солнца и стирок, но вполне добротная одежда"
      },
      {
        "roll": 6,
        "textEn": "Faded and patched.",
        "textRu": "Поношенная одежда с аккуратными заплатками на локтях и коленях"
      },
      {
        "roll": 7,
        "textEn": "Torn in places; missing buttons.",
        "textRu": "Одежда местами надорвана, не хватает нескольких пуговиц"
      },
      {
        "roll": 8,
        "textEn": "Tattered and worn.",
        "textRu": "Ветхие, обтрёпанные лохмотья бродяги"
      }
    ]
  },
  "jewelryMaterial": {
    "id": "jewelryMaterial",
    "count": 8,
    "options": [
      {
        "roll": 1,
        "textEn": "Steel.",
        "textRu": "Воронёная или полированная сталь"
      },
      {
        "roll": 2,
        "textEn": "Bronze.",
        "textRu": "Античная литая бронза"
      },
      {
        "roll": 3,
        "textEn": "Pewter.",
        "textRu": "Тёмное матовое олово (пьютер)"
      },
      {
        "roll": 4,
        "textEn": "Silver.",
        "textRu": "Чистое сияющее серебро"
      },
      {
        "roll": 5,
        "textEn": "Gold.",
        "textRu": "Благородное массивное золото"
      },
      {
        "roll": 6,
        "textEn": "Platinum.",
        "textRu": "Редкая тускло-белая платина"
      },
      {
        "roll": 7,
        "textEn": "Copper.",
        "textRu": "Кованая патинированная медь"
      },
      {
        "roll": 8,
        "textEn": "One or more gemstones (d12): 1. amethyst; 2. crystal; 3. diamond; 4. emerald; 5. jade; 6. obsidian; 7. opal; 8. pearl; 9. ruby; 10. sapphire; 11. topaz; 12. turquoise.",
        "textRu": "Украшено самоцветами (аметист, обсидиан, янтарь или рубин)"
      }
    ]
  },
  "calmTrait": {
    "id": "calmTrait",
    "count": 32,
    "options": [
      {
        "roll": 1,
        "textEn": "Compassionate",
        "textRu": "Сострадательный и мягкосердечный"
      },
      {
        "roll": 2,
        "textEn": "Cheerful",
        "textRu": "Жизнерадостный и неунывающий"
      },
      {
        "roll": 3,
        "textEn": "Reserved",
        "textRu": "Сдержанный и немногословный"
      },
      {
        "roll": 4,
        "textEn": "Outspoken",
        "textRu": "Прямолинейный и открытый"
      },
      {
        "roll": 5,
        "textEn": "Uninterested",
        "textRu": "Равнодушный и безучастный ко всему вокруг"
      },
      {
        "roll": 6,
        "textEn": "Gruff",
        "textRu": "Грубоватый и сварливый"
      },
      {
        "roll": 7,
        "textEn": "Eager",
        "textRu": "Энергичный и полный энтузиазма"
      },
      {
        "roll": 8,
        "textEn": "Deceitful",
        "textRu": "Лживый, двуличный и скользкий"
      },
      {
        "roll": 9,
        "textEn": "Foolish",
        "textRu": "Глуповатый и простодушный"
      },
      {
        "roll": 10,
        "textEn": "Strict",
        "textRu": "Строгий, требовательный педант"
      },
      {
        "roll": 11,
        "textEn": "Agreeable",
        "textRu": "Покладистый, мирный и уступчивый"
      },
      {
        "roll": 12,
        "textEn": "Mischeivious",
        "textRu": "Озорной, любящий невинные проказы"
      },
      {
        "roll": 13,
        "textEn": "Angry",
        "textRu": "Раздражительный, легко впадающий во гнев"
      },
      {
        "roll": 14,
        "textEn": "Fearful",
        "textRu": "Боязливый, пугливый и робкий"
      },
      {
        "roll": 15,
        "textEn": "Manipulative",
        "textRu": "Манипулятивный, ищущий во всём личную выгоду"
      },
      {
        "roll": 16,
        "textEn": "Devout",
        "textRu": "Набожный, истово верующий в богов"
      },
      {
        "roll": 17,
        "textEn": "Greedy",
        "textRu": "Жадный, считающий каждую медную монетку"
      },
      {
        "roll": 18,
        "textEn": "Funny",
        "textRu": "Остроумный шутник и балагур"
      },
      {
        "roll": 19,
        "textEn": "Dour",
        "textRu": "Угрюмый, мрачный меланхолик"
      },
      {
        "roll": 20,
        "textEn": "Fun-Loving",
        "textRu": "Весёлый жизнелюб, обожающий праздники и пиры"
      },
      {
        "roll": 21,
        "textEn": "Lazy",
        "textRu": "Ленивый, предпочитающий созерцать, а не действовать"
      },
      {
        "roll": 22,
        "textEn": "Driven",
        "textRu": "Целеустремлённый и неутомимый труженик"
      },
      {
        "roll": 23,
        "textEn": "Boastful",
        "textRu": "Хвастливый бахвал, преувеличивающий свои подвиги"
      },
      {
        "roll": 24,
        "textEn": "Artistic",
        "textRu": "Творческий, тонко чувствующий искусство"
      },
      {
        "roll": 25,
        "textEn": "Assertive",
        "textRu": "Напористый, уверенно отстаивающий своё мнение"
      },
      {
        "roll": 26,
        "textEn": "Carefree",
        "textRu": "Беззаботный, живущий одним днём"
      },
      {
        "roll": 27,
        "textEn": "Cautious",
        "textRu": "Осторожный, сто раз всё перепроверяющий"
      },
      {
        "roll": 28,
        "textEn": "Confident",
        "textRu": "Уверенный в своих силах и правоте"
      },
      {
        "roll": 29,
        "textEn": "Thoughtful",
        "textRu": "Вдумчивый философ и наблюдатель"
      },
      {
        "roll": 30,
        "textEn": "Loyal",
        "textRu": "Преданный и верный до гроба друг"
      },
      {
        "roll": 31,
        "textEn": "Sophisticated",
        "textRu": "Утончённый, знающий светский этикет аристократ"
      },
      {
        "roll": 32,
        "textEn": "Weak-Willed",
        "textRu": "Слабовольный, легко поддающийся чужому влиянию"
      }
    ]
  },
  "mood": {
    "id": "mood",
    "count": 20,
    "options": [
      {
        "roll": 1,
        "textEn": "Agreeable.",
        "textRu": "Благодушное, сговорчивое настроение"
      },
      {
        "roll": 2,
        "textEn": "Carefree.",
        "textRu": "Беззаботное, весёлое расположение духа"
      },
      {
        "roll": 3,
        "textEn": "Curious.",
        "textRu": "Любопытное, заинтересованное настроение"
      },
      {
        "roll": 4,
        "textEn": "Eager.",
        "textRu": "Нетерпеливое, рвущееся в бой состояние"
      },
      {
        "roll": 5,
        "textEn": "Friendly.",
        "textRu": "Дружелюбное, радушное настроение"
      },
      {
        "roll": 6,
        "textEn": "Happy.",
        "textRu": "Счастливое, радостное состояние"
      },
      {
        "roll": 7,
        "textEn": "Hopeful.",
        "textRu": "Обнадёженное, полное светлых надежд"
      },
      {
        "roll": 8,
        "textEn": "Upbeat.",
        "textRu": "Приподнятое, оптимистичное настроение"
      },
      {
        "roll": 9,
        "textEn": "Indifferent.",
        "textRu": "Безразличное, отстранённое настроение"
      },
      {
        "roll": 10,
        "textEn": "Bored.",
        "textRu": "Скучающее, томное состояние"
      },
      {
        "roll": 11,
        "textEn": "Focused.",
        "textRu": "Предельно сосредоточенное и собранное"
      },
      {
        "roll": 12,
        "textEn": "Suspicious.",
        "textRu": "Подозрительное, ожидающее подвоха"
      },
      {
        "roll": 13,
        "textEn": "Tired.",
        "textRu": "Усталое, вымотанное до предела"
      },
      {
        "roll": 14,
        "textEn": "Withdrawn.",
        "textRu": "Замкнутое, ушедшее в себя"
      },
      {
        "roll": 15,
        "textEn": "Disagreeable.",
        "textRu": "Ворчливое, недовольное всем вокруг"
      },
      {
        "roll": 16,
        "textEn": "Agitated.",
        "textRu": "Взвинченное, нервное и встревоженное"
      },
      {
        "roll": 17,
        "textEn": "Angry.",
        "textRu": "Раздражённое, готовое взорваться гневом"
      },
      {
        "roll": 18,
        "textEn": "Despondent.",
        "textRu": "Удручённое, печальное состояние"
      },
      {
        "roll": 19,
        "textEn": "Gloomy.",
        "textRu": "Мрачное, угрюмое расположение духа"
      },
      {
        "roll": 20,
        "textEn": "Nervous.",
        "textRu": "Нервозное, дерганое состояние"
      }
    ]
  },
  "stressTrait": {
    "id": "stressTrait",
    "count": 32,
    "options": [
      {
        "roll": 1,
        "textEn": "Withdrawn",
        "textRu": "Замыкается в себе, уходя в полное молчание"
      },
      {
        "roll": 2,
        "textEn": "Murderous",
        "textRu": "Становится кровожадным и жестоким"
      },
      {
        "roll": 3,
        "textEn": "Obsessive",
        "textRu": "Становится одержимым навязчивыми идеями"
      },
      {
        "roll": 4,
        "textEn": "Authoritarian",
        "textRu": "Включает деспотичного тирана и автократа"
      },
      {
        "roll": 5,
        "textEn": "Determined",
        "textRu": "Обретает холодную стальную решимость"
      },
      {
        "roll": 6,
        "textEn": "Brave",
        "textRu": "Проявляет отчаянную безрассудную храбрость"
      },
      {
        "roll": 7,
        "textEn": "Spiteful",
        "textRu": "Становится язвительным и злопамятным"
      },
      {
        "roll": 8,
        "textEn": "Belligerent",
        "textRu": "Лезет в драку, задирает окружающих"
      },
      {
        "roll": 9,
        "textEn": "Caustic",
        "textRu": "Сыплет едким, ядовитым сарказмом"
      },
      {
        "roll": 10,
        "textEn": "Reckless",
        "textRu": "Действует очертя голову, совершая безумные поступки"
      },
      {
        "roll": 11,
        "textEn": "Argumentative",
        "textRu": "Лезет на рожон в бессмысленные споры"
      },
      {
        "roll": 12,
        "textEn": "Gluttonous",
        "textRu": "Начинает жадно и компульсивно объедаться или пить"
      },
      {
        "roll": 13,
        "textEn": "Overly Protective",
        "textRu": "Впадает в гиперопеку, паникуя за безопасность других"
      },
      {
        "roll": 14,
        "textEn": "Angry",
        "textRu": "Впадает в слепой, неконтролируемый гнев"
      },
      {
        "roll": 15,
        "textEn": "Cowardly",
        "textRu": "Трусит, готов бросить всё и сбежать в укрытие"
      },
      {
        "roll": 16,
        "textEn": "Meticulous",
        "textRu": "Впадает в маниакальный педантизм и въедливость"
      },
      {
        "roll": 17,
        "textEn": "Sarcastic",
        "textRu": "Язвительно высмеивает любые попытки исправить ситуацию"
      },
      {
        "roll": 18,
        "textEn": "Stubborn",
        "textRu": "Упрямится намертво, отказываясь сдвинуться с места"
      },
      {
        "roll": 19,
        "textEn": "Destructive",
        "textRu": "Крушит всё вокруг, вымещая злобу на вещах"
      },
      {
        "roll": 20,
        "textEn": "Practical",
        "textRu": "Становится циничным прагматиком без капли жалости"
      },
      {
        "roll": 21,
        "textEn": "Pushy",
        "textRu": "Давит на всех своим авторитетом, требуя подчинения"
      },
      {
        "roll": 22,
        "textEn": "Fanatical",
        "textRu": "Впадает в религиозный фанатизм и молитвенный экстаз"
      },
      {
        "roll": 23,
        "textEn": "Secretive",
        "textRu": "Становится скрытным параноиком, не доверяя никому"
      },
      {
        "roll": 24,
        "textEn": "Scornful",
        "textRu": "Смотрит на всех с неприкрытым презрением"
      },
      {
        "roll": 25,
        "textEn": "Courageous",
        "textRu": "Проявляет несгибаемое мужество защитника"
      },
      {
        "roll": 26,
        "textEn": "Impractical",
        "textRu": "Предлагает абсурдные и невыполнимые планы"
      },
      {
        "roll": 27,
        "textEn": "Calculating",
        "textRu": "Становится расчетливым, ледяным манипулятором"
      },
      {
        "roll": 28,
        "textEn": "Industrious",
        "textRu": "Лихорадочно бросается в бессмысленную кипучую работу"
      },
      {
        "roll": 29,
        "textEn": "Manipulative",
        "textRu": "Использует других как щит для спасения собственной шкуры"
      },
      {
        "roll": 30,
        "textEn": "Destructive",
        "textRu": "Стремится уничтожить источник проблемы любой ценой"
      },
      {
        "roll": 31,
        "textEn": "Compulsive",
        "textRu": "Совершает навязчивые повторяющиеся ритуалы"
      },
      {
        "roll": 32,
        "textEn": "Intolerant",
        "textRu": "Становится абсолютно нетерпимым к любым ошибкам других"
      }
    ]
  },
  "faith": {
    "id": "faith",
    "count": 8,
    "options": [
      {
        "roll": 1,
        "textEn": "Quiet true believer.",
        "textRu": "Истинный тихий верующий: носит веру в сердце без показухи"
      },
      {
        "roll": 2,
        "textEn": "Casual observer.",
        "textRu": "Случайный прихожанин: заходит в храм лишь по большим праздникам"
      },
      {
        "roll": 3,
        "textEn": "Critical student.",
        "textRu": "Вдумчивый исследователь: изучает священные тексты критическим умом"
      },
      {
        "roll": 4,
        "textEn": "Outspoken cynic.",
        "textRu": "Открытый циник и скептик: не верит в милость богов"
      },
      {
        "roll": 5,
        "textEn": "Open-minded seeker.",
        "textRu": "Ищущий странник: открыт новым богам, философиям и мистическим тайнам"
      },
      {
        "roll": 6,
        "textEn": "Broken heretic.",
        "textRu": "Сломленный еретик: отрёкся от прежнего культа из-за личной трагедии"
      },
      {
        "roll": 7,
        "textEn": "Cautious listener.",
        "textRu": "Осторожный слушатель: присматривается к жрецам и знамениям"
      },
      {
        "roll": 8,
        "textEn": "Fanatical true believer.",
        "textRu": "Фанатичный истовый ревнитель веры: готов покарать любого нечестивца"
      }
    ]
  },
  "prejudice": {
    "id": "prejudice",
    "count": 6,
    "options": [
      {
        "roll": 1,
        "textEn": "Other genders.",
        "textRu": "Предвзятость к иному полу / гендеру"
      },
      {
        "roll": 2,
        "textEn": "An age group (d3): 1. children; 2. teenagers; 3. elderly.",
        "textRu": "Предвзятость к возрасту (недолюбливает детей, юнцов или дряхлых стариков)"
      },
      {
        "roll": 3,
        "textEn": "A social class (d3): 1. ruling class and authority figures; 2. powerful rich; 3. destitute poor.",
        "textRu": "Классовая неприязнь (ненавидит знать и стражу, богатеев-выскочек либо нищих оборванцев)"
      },
      {
        "roll": 4,
        "textEn": "Social deviants (d3): 1. beggars; 2. drunks; 3. drug-users.",
        "textRu": "Презрение к маргиналам (терпеть не может попрошаек, пьяниц или курильщиков дурмана)"
      },
      {
        "roll": 5,
        "textEn": "A profession (d12): 1. farmers; 2. artists; 3. clergy; 4. soldiers; 5. fishers; 6. harlots; 7. miners; 8. merchants; 9. scholars; 10. herders; 11. sailors; 12. mages",
        "textRu": "Профессиональное предубеждение (недолюбливает магов, жрецов, солдат, торговцев или наёмников)"
      },
      {
        "roll": 6,
        "textEn": "A race (d8): 1. dwarves; 2. elves; 3. gnomes;; 4. goblins; 5. half-breeds; 5. halflings; 6. humans; 7. orcs; 8. reptilians.",
        "textRu": "Расовая предвзятость (испытывает недоверие к эльфам, дварфам, оркам, полукровкам или рептилиям)"
      }
    ]
  },
  "flaw": {
    "id": "flaw",
    "count": 20,
    "options": [
      {
        "roll": 1,
        "textEn": "Fidgets.",
        "textRu": "Нервно теребит вещи, крутит кольца и не может усидеть на месте"
      },
      {
        "roll": 2,
        "textEn": "Drinks too much.",
        "textRu": "Слишком много и жадно пьёт крепкий эль и вино"
      },
      {
        "roll": 3,
        "textEn": "Eats too much.",
        "textRu": "Не знает меры в еде, предаваясь чревоугодию"
      },
      {
        "roll": 4,
        "textEn": "Swears often.",
        "textRu": "Грязно и смачно сквернословит в любом обществе"
      },
      {
        "roll": 5,
        "textEn": "Has poor hygiene.",
        "textRu": "Имеет отвратительную гигиену и пренебрегает мытьём"
      },
      {
        "roll": 6,
        "textEn": "Can’t resist flirting.",
        "textRu": "Не может удержаться от неуместного флирта и заигрываний"
      },
      {
        "roll": 7,
        "textEn": "Can’t stop staring.",
        "textRu": "Беспардонно пялится на собеседников в упор"
      },
      {
        "roll": 8,
        "textEn": "Sweats profusely and easily.",
        "textRu": "Обильно и мгновенно покрывается липким потом при малейшем волнении"
      },
      {
        "roll": 9,
        "textEn": "Is a habitual liar.",
        "textRu": "Патологический лжец: врёт даже там, где в этом нет нужды"
      },
      {
        "roll": 10,
        "textEn": "Embellishes the truth.",
        "textRu": "Приукрашивает правду ради красного словца"
      },
      {
        "roll": 11,
        "textEn": "Exaggerates details.",
        "textRu": "Чрезмерно гиперболизирует любые мелкие подробности"
      },
      {
        "roll": 12,
        "textEn": "Has a short temper.",
        "textRu": "Вспыльчив как порох, мгновенно выходит из себя по пустякам"
      },
      {
        "roll": 13,
        "textEn": "Is melodramatic.",
        "textRu": "Мелодраматичен: любую мелочь превращает в трагедию века"
      },
      {
        "roll": 14,
        "textEn": "Gossips.",
        "textRu": "Заядлый сплетник, собирающий и разносящий чужие грязные тайны"
      },
      {
        "roll": 15,
        "textEn": "Chews with an open mouth.",
        "textRu": "Громко чавкает и жуёт с открытым ртом"
      },
      {
        "roll": 16,
        "textEn": "Often sniffs audibly.",
        "textRu": "Постоянно шумно и громко втягивает носом воздух"
      },
      {
        "roll": 17,
        "textEn": "Believes what you tell him/her.",
        "textRu": "Наивно верит всему, что ему скажут на слово"
      },
      {
        "roll": 18,
        "textEn": "Is skeptical of everything.",
        "textRu": "Патологический скептик: подозревает обман в каждом добром слове"
      },
      {
        "roll": 19,
        "textEn": "Paces.",
        "textRu": "Беспокойно мечется взад-вперёд шагами во время разговора"
      },
      {
        "roll": 20,
        "textEn": "Makes poor eye contact.",
        "textRu": "Упорно избегает прямого взгляда в глаза, отводя взор"
      }
    ]
  }
};
