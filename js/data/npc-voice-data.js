/**
 * Randomattic - NPC Voice, Speech Patterns & Mannerisms Data
 * Compiled and translated from files/NPC/npc_voice.xlsx
 */

export const NPC_VOICE_DATA = {
  "speed": [
    {
      "roll": 1,
      "key": "slow",
      "nameRu": "Медленная речь",
      "descRu": "Говорит размеренно, неспешно, делая весомые паузы между фразами"
    },
    {
      "roll": 2,
      "key": "medium",
      "nameRu": "Умеренный темп",
      "descRu": "Обычная естественная скорость речи, привычный повседневный диалог"
    },
    {
      "roll": 3,
      "key": "fast",
      "nameRu": "Быстрая речь",
      "descRu": "Тараторит, слова льются сплошным быстрым потоком, едва успевая за мыслью"
    }
  ],
  "pitch": [
    {
      "roll": 1,
      "key": "low",
      "nameRu": "Низкий тон",
      "descRu": "Глубокий басовитый тон или низкое бархатное контральто"
    },
    {
      "roll": 2,
      "key": "medium",
      "nameRu": "Средний тон",
      "descRu": "Естественная средняя высота голоса, нейтральный регистр"
    },
    {
      "roll": 3,
      "key": "high",
      "nameRu": "Высокий тон",
      "descRu": "Высокий, звонкий или писклявый тон, привлекающий всеобщее внимание"
    }
  ],
  "textures": [
    {
      "roll": 1,
      "key": "gruff",
      "nameRu": "Хриплый / Грубый",
      "descRu": "Низкий хриплый голос, словно закалённый ветрами, пылью или крепким табаком"
    },
    {
      "roll": 2,
      "key": "smooth",
      "nameRu": "Бархатистый / Мягкий",
      "descRu": "Приятный, льющийся как шёлк или мёд, успокаивающий слух"
    },
    {
      "roll": 3,
      "key": "strained",
      "nameRu": "Напряжённый / Сдавленный",
      "descRu": "Звучит натужно, словно персонаж постоянно сдерживает сильное напряжение или боль"
    },
    {
      "roll": 4,
      "key": "relaxed",
      "nameRu": "Расслабленный / Спокойный",
      "descRu": "Ленивый, непринуждённый, умиротворяющий тон уверенного в себе человека"
    },
    {
      "roll": 5,
      "key": "breathy",
      "nameRu": "С придыханием / Вкрадчивый",
      "descRu": "Шелестящий, таинственный шёпот или мягкое придыхание в каждом слове"
    },
    {
      "roll": 6,
      "key": "wolfish",
      "nameRu": "Гортанный / «Волчий»",
      "descRu": "Утробный, рычащий звук из глубины глотки, отдающий звериной угрозой"
    },
    {
      "roll": 7,
      "key": "scratchy",
      "nameRu": "Скрипучий / Дребезжащий",
      "descRu": "Сухой старческий или скрипучий тембр, похожий на скрип несмазанных петель"
    },
    {
      "roll": 8,
      "key": "nasal",
      "nameRu": "Гнусавый / В нос",
      "descRu": "Гнусавое прононсовое звучание, отдающее в носоглотку"
    }
  ],
  "speechPatterns": [
    {
      "roll": 1,
      "textEn": "Incoherent except for a few key words",
      "textRu": "Бессвязная речь: понятны лишь отдельные ключевые слова среди потока бормотания"
    },
    {
      "roll": 2,
      "textEn": "Stutters",
      "textRu": "Заикается при волнении или споре"
    },
    {
      "roll": 3,
      "textEn": "lots of um",
      "textRu": "Часто тянет паузы звуками «э-э-эм...», «хм-м-м...»"
    },
    {
      "roll": 4,
      "textEn": "lots of like",
      "textRu": "Постоянно вставляет словечки-паразиты («как бы», «типа», «значит»)"
    },
    {
      "roll": 5,
      "textEn": "lots of swearing",
      "textRu": "Сыплет сочными ругательствами, проклятиями и крепкими трактирными словами"
    },
    {
      "roll": 6,
      "textEn": "uses thee's and thou's",
      "textRu": "Изъясняется высокопарно и старомодно («се сие», «уповаю на вашу милость»)"
    },
    {
      "roll": 7,
      "textEn": "never stops to breathe",
      "textRu": "Тараторит без пауз на вдох, задыхаясь к концу предложения"
    },
    {
      "roll": 8,
      "textEn": "Short, clipped sentences",
      "textRu": "Говорит рублеными, предельно краткими предложениями"
    },
    {
      "roll": 9,
      "textEn": "talks in third person",
      "textRu": "Говорит о себе исключительно в третьем лице («он полагает», «она недовольна»)"
    },
    {
      "roll": 10,
      "textEn": "doesn't conjugate well (\"me make good soup\")",
      "textRu": "Путает падежи, времена и окончания («моя твоя понимать», «вчера ходить лес»)"
    },
    {
      "roll": 11,
      "textEn": "all S-sounds become Z-sounds",
      "textRu": "Все звуки «С» шепеляво заменяет на «З» («зюдарь», «зпазибо»)"
    },
    {
      "roll": 12,
      "textEn": "all w-sounds become v-sounds",
      "textRu": "Звуки «В» произносит глухо, почти как «Ф» или «У»"
    },
    {
      "roll": 13,
      "textEn": "R's arrrrrre always rrrrrrrolled",
      "textRu": "Утрированно и раскатисто рычит на каждом звуке «Р-р-р»"
    },
    {
      "roll": 14,
      "textEn": "never uses contractions",
      "textRu": "Никогда не сокращает слова и обороты речи, говорит академически полно"
    },
    {
      "roll": 15,
      "textEn": "Whiny",
      "textRu": "Говорит капризным, вечно ноющим и плаксивым тоном"
    },
    {
      "roll": 16,
      "textEn": "stuffy nose",
      "textRu": "Говорит словно с вечно заложенным носом"
    },
    {
      "roll": 17,
      "textEn": "tongue stuck to back of teeth",
      "textRu": "Язык словно прилипает к верхним зубам, порождая приглушённый звук"
    },
    {
      "roll": 18,
      "textEn": "opens mouth too wide",
      "textRu": "Чрезмерно широко разевает рот при произнесении каждого гласного"
    },
    {
      "roll": 19,
      "textEn": "clenched teeth",
      "textRu": "Цедит слова сквозь плотно сжатые зубы"
    },
    {
      "roll": 20,
      "textEn": "barely opens lips",
      "textRu": "Едва шевелит губами при разговоре, словно чревовещатель"
    },
    {
      "roll": 21,
      "textEn": "all Th-sounds become Z-sounds",
      "textRu": "Звуки «Т/Д» мягко шепелявит в свистящие полузвуки"
    },
    {
      "roll": 22,
      "textEn": "repeats the last few words of a sentence/thought (\"nice to meet you, meet you.\")",
      "textRu": "Эхом повторяет последние слова своей фразы («рад знакомству, знакомству...»)"
    },
    {
      "roll": 23,
      "textEn": "uses full titles or descriptions (\"jon-farmers-son\"\")",
      "textRu": "Всегда использует полные титулы и описания («Джон, сын мельника из Верхней Деревни»)"
    },
    {
      "roll": 24,
      "textEn": "repeats adj/adv for more impact (\"pretty-pretty!\")",
      "textRu": "Удваивает прилагательные для пущего эффекта («красивый-красивый!», «страшный-страшный!»)"
    },
    {
      "roll": 25,
      "textEn": "Nouns end with \"en\"/\"sen\" (applesen, moosen)",
      "textRu": "Причудливо склоняет существительные с архаичными окончаниями"
    },
    {
      "roll": 26,
      "textEn": "L-sounds become w-sounds",
      "textRu": "Сюсюкает, заменяя твердые «Л» на мягкие «В» или «У»"
    },
    {
      "roll": 27,
      "textEn": "repeats the last word you say before responding",
      "textRu": "Эхом повторяет последнее услышанное от собеседника слово перед тем, как ответить"
    },
    {
      "roll": 28,
      "textEn": "sings everything",
      "textRu": "Произносит слова нараспев, словно читает балладу или стих"
    },
    {
      "roll": 29,
      "textEn": "does the wrong emphasis on the wrong syllables",
      "textRu": "Постоянно делает нелепые ударения на случайные слоги"
    },
    {
      "roll": 30,
      "textEn": "pauses often",
      "textRu": "Делает неожиданно долгие, драматические паузы посреди простой фразы"
    },
    {
      "roll": 31,
      "textEn": "staccato speech",
      "textRu": "Говорит отрывистым, сухим стаккато"
    },
    {
      "roll": 32,
      "textEn": "Monotonous",
      "textRu": "Абсолютно монотонный бубнёж на одной ноте, лишённый любых эмоций"
    },
    {
      "roll": 33,
      "textEn": "whistles on S-sounds",
      "textRu": "Заметно присвистывает на свистящих и шипящих согласных"
    },
    {
      "roll": 34,
      "textEn": "Heavy lisp on Th and S (th-ufferin th-uckertash!)",
      "textRu": "Сильно шепелявит, коверкая шипящие"
    },
    {
      "roll": 35,
      "textEn": "Light lisp",
      "textRu": "Лёгкая, едва уловимая пикантная шепелявость"
    },
    {
      "roll": 36,
      "textEn": "r-sounds become w-sounds",
      "textRu": "Картавит, подменяя твердое «Р» мягким горловым звуком"
    },
    {
      "roll": 37,
      "textEn": "severe underbite",
      "textRu": "Говорит с выдвинутой нижней челюстью (нижний прикус)"
    },
    {
      "roll": 38,
      "textEn": "severe overbite",
      "textRu": "Говорит с выступающей верхней челюстью (глубокий прикус)"
    },
    {
      "roll": 39,
      "textEn": "speaks out of the corner of his mouth",
      "textRu": "Говорит уголком рта, скривив половину лица"
    },
    {
      "roll": 40,
      "textEn": "always pouting",
      "textRu": "Говорит с вечно обиженно надутыми губами"
    },
    {
      "roll": 41,
      "textEn": "\"ar\" becomes \"ayr\" (cart = cayrt, bear = beayr)",
      "textRu": "Нараспев растягивает гласные («ну-у-у, ка-а-ак же та-а-ак...»)"
    },
    {
      "roll": 42,
      "textEn": "soft letters are elongated (\"sso, hhow arre yyou?\")",
      "textRu": "Сильно затягивает шипящие и мягкие согласные («ссслушшшаю вассс»)"
    },
    {
      "roll": 43,
      "textEn": "slurrs words",
      "textRu": "Проглатывает и смазывает окончания слов"
    },
    {
      "roll": 44,
      "textEn": "mouth is always full when talking",
      "textRu": "Всегда говорит с набитым ртом (жуёт хлеб, табак или травинку)"
    },
    {
      "roll": 45,
      "textEn": "Sighs after each sentence",
      "textRu": "Тяжело и сокрушённо вздыхает после каждого предложения"
    },
    {
      "roll": 46,
      "textEn": "Never uses am/is/are/was/were (“I big.” “She pretty.”)",
      "textRu": "Опускает глаголы-связки («я сильный», «он воин», «дорога плохой»)"
    },
    {
      "roll": 47,
      "textEn": "Responds in the form of questions",
      "textRu": "Привык отвечать вопросом на вопрос"
    },
    {
      "roll": 48,
      "textEn": "Always over-exaggerates",
      "textRu": "Всегда драматизирует и нагнетает масштаб любого пустяка"
    },
    {
      "roll": 49,
      "textEn": "Never tells the complete truth",
      "textRu": "Никогда не отвечает прямо, всегда недоговаривает или юлит"
    },
    {
      "roll": 50,
      "textEn": "mutters to self",
      "textRu": "Постоянно приглушённо бормочет себе под нос дополнительные ремарки"
    }
  ],
  "mannerisms": [
    {
      "roll": 1,
      "textEn": "pulls on ear",
      "textRu": "Теребит или потягивает мочку уха во время раздумий"
    },
    {
      "roll": 2,
      "textEn": "taps chin",
      "textRu": "Задумчиво постукивает пальцем по подбородку"
    },
    {
      "roll": 3,
      "textEn": "wrings hands",
      "textRu": "Нервно заламывает, разминает или потирает ладони"
    },
    {
      "roll": 4,
      "textEn": "flexes arms",
      "textRu": "Разминает плечи и демонстративно напрягает руки"
    },
    {
      "roll": 5,
      "textEn": "puffs out chest",
      "textRu": "Горделиво выпячивает грудь колесом"
    },
    {
      "roll": 6,
      "textEn": "clenches fist(s)",
      "textRu": "Периодически сжимает кулаки в пылу разговора"
    },
    {
      "roll": 7,
      "textEn": "clenches jaw",
      "textRu": "Сжимает челюсти так, что на скулах ходят желваки"
    },
    {
      "roll": 8,
      "textEn": "looks at the speakers forehead",
      "textRu": "Смотрит собеседнику прямо в лоб, демонстративно избегая глаз"
    },
    {
      "roll": 9,
      "textEn": "taps nose",
      "textRu": "Прикладывает или постукивает пальцем по кончику носа"
    },
    {
      "roll": 10,
      "textEn": "licks lips",
      "textRu": "Часто и нервно облизывает губы"
    },
    {
      "roll": 11,
      "textEn": "chews nails",
      "textRu": "Сгрызает заусенцы или ногти на пальцах"
    },
    {
      "roll": 12,
      "textEn": "chews straw/tobacco/gum",
      "textRu": "Постоянно жуёт травинку, табак или древесную смолку"
    },
    {
      "roll": 13,
      "textEn": "clicks tounge",
      "textRu": "Цокает языком, когда о чем-то напряжённо думает"
    },
    {
      "roll": 14,
      "textEn": "acts bored",
      "textRu": "Демонстративно скучает, прикрывает рот при зевке"
    },
    {
      "roll": 15,
      "textEn": "swallows a lot",
      "textRu": "Часто судорожно сглатывает слюну"
    },
    {
      "roll": 16,
      "textEn": "pulls/twists clothing",
      "textRu": "Поправляет, отряхивает или теребит полы своей одежды"
    },
    {
      "roll": 17,
      "textEn": "covers mouth when speaking",
      "textRu": "Прикрывает рот ладонью всякий раз, когда произносит слова"
    },
    {
      "roll": 18,
      "textEn": "sniffs often",
      "textRu": "Шмыгает носом каждые несколько секунд"
    },
    {
      "roll": 19,
      "textEn": "bites lips",
      "textRu": "Нервно закусывает нижнюю губу"
    },
    {
      "roll": 20,
      "textEn": "teeth chatter or grind",
      "textRu": "Громко скрежещет или щёлкает зубами от раздражения"
    },
    {
      "roll": 21,
      "textEn": "coughing (genuine)",
      "textRu": "Покашливает в кулак перед каждой важной фразой"
    },
    {
      "roll": 22,
      "textEn": "constantly clears throat (think umbridge)",
      "textRu": "Постоянно прочищает горло притворным или нервным «кхм-кхм»"
    },
    {
      "roll": 23,
      "textEn": "adjusts glasses/spectacles",
      "textRu": "Поправляет очки, пенсне или монокль на переносице"
    },
    {
      "roll": 24,
      "textEn": "caresses a coin",
      "textRu": "Задумчиво поглаживает ребром пальца старинную монету"
    },
    {
      "roll": 25,
      "textEn": "strokes chin/beard",
      "textRu": "Поглаживает бороду, усы или гладкий подбородок"
    },
    {
      "roll": 26,
      "textEn": "invades personal space",
      "textRu": "Беспардонно вторгается в личное пространство собеседника, подходя вплотную"
    },
    {
      "roll": 27,
      "textEn": "flips a coin",
      "textRu": "Ловко подбрасывает и ловит на лету монетку или игральную кость"
    },
    {
      "roll": 28,
      "textEn": "rests hand on hilt of sword/dagger",
      "textRu": "Держит напряжённую руку на рукояти меча или кинжала"
    },
    {
      "roll": 29,
      "textEn": "shamelessly hits on all male PCs (winks, waggle-brows, touching, etc)",
      "textRu": "Открыто и заигрывающе подмигивает мужским персонажам"
    },
    {
      "roll": 30,
      "textEn": "shamelessly hits on all female PCs (winks, waggle-brows, touching, etc)",
      "textRu": "Открыто и заигрывающе подмигивает женским персонажам"
    },
    {
      "roll": 31,
      "textEn": "Rarely blinks",
      "textRu": "Смотрит в упор немигающим хищным или стеклянным взглядом"
    },
    {
      "roll": 32,
      "textEn": "Excessive blinking",
      "textRu": "Чрезмерно часто, судорожно моргает"
    },
    {
      "roll": 33,
      "textEn": "Pops lips",
      "textRu": "Характерно причмокивает губами после каждой мысли"
    },
    {
      "roll": 34,
      "textEn": "Flexes muscles",
      "textRu": "Потягивается и поигрывает мускулами при смене позы"
    },
    {
      "roll": 35,
      "textEn": "Taps foot",
      "textRu": "Нетерпеливо отбивает носком сапога быстрый ритм"
    },
    {
      "roll": 36,
      "textEn": "Never looks at the person talking",
      "textRu": "Смотрит куда угодно (в пол, на потолок, в сторону), избегая зрительного контакта"
    },
    {
      "roll": 37,
      "textEn": "Eyes constantly shifting around",
      "textRu": "Глаза постоянно и настороженно бегают по сторонам"
    },
    {
      "roll": 38,
      "textEn": "Gets lost in a daze",
      "textRu": "Посреди фразы внезапно замирает и уходит в глубокую прострацию"
    },
    {
      "roll": 39,
      "textEn": "Easily distracted",
      "textRu": "Легко отвлекается на любой шорох, птицу или блестящую вещь"
    },
    {
      "roll": 40,
      "textEn": "Cracks knuckles",
      "textRu": "Громко похрустывает суставами пальцев"
    },
    {
      "roll": 41,
      "textEn": "Drums fingers",
      "textRu": "Барабанит пальцами по поясу, ножнам или краю стола"
    },
    {
      "roll": 42,
      "textEn": "Waggles eyebrows",
      "textRu": "Выразительно и комично поигрывает бровями"
    },
    {
      "roll": 43,
      "textEn": "Picks nose",
      "textRu": "Не стесняясь, почёсывает или ковыряет в ухе / носу"
    },
    {
      "roll": 44,
      "textEn": "Holds head high",
      "textRu": "Высокомерно задирает подбородок кверху, глядя сверху вниз"
    },
    {
      "roll": 45,
      "textEn": "Delayed reactions",
      "textRu": "Реагирует на слова собеседника с заметной заторможенностью"
    },
    {
      "roll": 46,
      "textEn": "Slumps shoulders",
      "textRu": "Сильно сутулит спину и втягивает голову в плечи"
    },
    {
      "roll": 47,
      "textEn": "Shuffles feet",
      "textRu": "Беспокойно переминается с ноги на ногу"
    },
    {
      "roll": 48,
      "textEn": "Jogs in place",
      "textRu": "Постоянно пританцовывает или покачивается взад-вперёд на пятках"
    },
    {
      "roll": 49,
      "textEn": "Writes down every word said",
      "textRu": "Лихорадочно строчит в блокноте каждое услышанное слово"
    },
    {
      "roll": 50,
      "textEn": "Only looks at the speaker’s chin",
      "textRu": "Упорно смотрит исключительно на подбородок собеседника"
    }
  ]
};
