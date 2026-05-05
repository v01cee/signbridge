import type { Gesture } from "../types";

const now = new Date().toISOString();

export const MOCK_GESTURES: Gesture[] = [
  // Приветствия
  { id: 1,  title: "Привет",         description: "Поднять руку и помахать открытой ладонью в сторону собеседника. Движение лёгкое, дружелюбное.",          category_id: 1, created_at: now, updated_at: now, media: [] },
  { id: 2,  title: "До свидания",    description: "Открытая ладонь направлена вперёд, пальцы смыкаются и разжимаются несколько раз.",                      category_id: 1, created_at: now, updated_at: now, media: [] },
  { id: 3,  title: "Доброе утро",    description: "Правая рука поднимается от уровня живота вверх, раскрываясь как солнце на горизонте.",                  category_id: 1, created_at: now, updated_at: now, media: [] },
  { id: 4,  title: "Добрый вечер",   description: "Рука плавно опускается вниз, имитируя заход солнца. Движение медленное и плавное.",                     category_id: 1, created_at: now, updated_at: now, media: [] },
  { id: 5,  title: "Как дела?",      description: "Обе руки разводятся в стороны с вопросительным выражением лица. Брови приподняты.",                     category_id: 1, created_at: now, updated_at: now, media: [] },
  { id: 6,  title: "Рад познакомиться", description: "Правая рука прикладывается к груди, затем вытягивается вперёд в жесте приветствия.",                category_id: 1, created_at: now, updated_at: now, media: [] },

  // Базовые фразы
  { id: 7,  title: "Да",             description: "Кулак ритмично кивает вниз-вверх, имитируя кивок головой.",                                             category_id: 2, created_at: now, updated_at: now, media: [] },
  { id: 8,  title: "Нет",            description: "Указательный и средний пальцы вместе качаются из стороны в сторону, как метроном.",                    category_id: 2, created_at: now, updated_at: now, media: [] },
  { id: 9,  title: "Спасибо",        description: "Пальцы правой руки касаются губ, затем рука движется вперёд, как будто посылая благодарность.",         category_id: 2, created_at: now, updated_at: now, media: [] },
  { id: 10, title: "Пожалуйста",     description: "Открытая ладонь прикладывается к груди и делает круговое движение по часовой стрелке.",                 category_id: 2, created_at: now, updated_at: now, media: [] },
  { id: 11, title: "Извините",       description: "Кулак правой руки круговым движением трётся о грудь. Выражение лица извиняющееся.",                    category_id: 2, created_at: now, updated_at: now, media: [] },
  { id: 12, title: "Помогите",       description: "Левая рука лежит ладонью вверх, правый кулак ставится на неё и обе руки поднимаются вверх.",            category_id: 2, created_at: now, updated_at: now, media: [] },
  { id: 13, title: "Не понимаю",     description: "Указательный палец касается виска и делает небольшое движение, затем руки разводятся в стороны.",       category_id: 2, created_at: now, updated_at: now, media: [] },
  { id: 14, title: "Повторите",      description: "Указательный палец правой руки делает круговое движение в воздухе, затем указывает вперёд.",             category_id: 2, created_at: now, updated_at: now, media: [] },

  // Числа
  { id: 15, title: "Один",           description: "Поднять указательный палец вверх. Остальные пальцы сжаты в кулак.",                                     category_id: 3, created_at: now, updated_at: now, media: [] },
  { id: 16, title: "Два",            description: "Указательный и средний пальцы подняты вверх и слегка разведены. Жест «V» или «мир».",                   category_id: 3, created_at: now, updated_at: now, media: [] },
  { id: 17, title: "Три",            description: "Большой, указательный и средний пальцы подняты вверх. Остальные сжаты.",                                category_id: 3, created_at: now, updated_at: now, media: [] },
  { id: 18, title: "Четыре",         description: "Четыре пальца вытянуты вверх, большой палец прижат к ладони.",                                          category_id: 3, created_at: now, updated_at: now, media: [] },
  { id: 19, title: "Пять",           description: "Все пять пальцев широко раскрыты и направлены вверх. Открытая ладонь.",                                 category_id: 3, created_at: now, updated_at: now, media: [] },
  { id: 20, title: "Десять",         description: "Кулак с поднятым большим пальцем встряхивается из стороны в сторону.",                                  category_id: 3, created_at: now, updated_at: now, media: [] },

  // Семья
  { id: 21, title: "Мама",           description: "Большой палец правой руки касается подбородка, остальные пальцы раскрыты и направлены вверх.",          category_id: 4, created_at: now, updated_at: now, media: [] },
  { id: 22, title: "Папа",           description: "Большой палец правой руки касается лба, остальные пальцы раскрыты и направлены вверх.",                 category_id: 4, created_at: now, updated_at: now, media: [] },
  { id: 23, title: "Брат",           description: "Указательный палец сначала у лба (мужской знак), затем складывается с другим указательным пальцем.",    category_id: 4, created_at: now, updated_at: now, media: [] },
  { id: 24, title: "Сестра",         description: "Большой палец у подбородка (женский знак), затем оба указательных пальца складываются вместе.",         category_id: 4, created_at: now, updated_at: now, media: [] },
  { id: 25, title: "Бабушка",        description: "Жест «мама» плавно движется вперёд дугой, обозначая поколение.",                                        category_id: 4, created_at: now, updated_at: now, media: [] },
  { id: 26, title: "Дедушка",        description: "Жест «папа» плавно движется вперёд дугой, обозначая поколение.",                                        category_id: 4, created_at: now, updated_at: now, media: [] },

  // Эмоции
  { id: 27, title: "Радость",        description: "Обе руки с открытыми ладонями делают круговые движения у груди, как будто тепло расходится от сердца.", category_id: 5, created_at: now, updated_at: now, media: [] },
  { id: 28, title: "Грусть",         description: "Обе руки опускаются от лица вниз, пальцы расслаблены. Лицо передаёт печаль.",                           category_id: 5, created_at: now, updated_at: now, media: [] },
  { id: 29, title: "Я тебя люблю",   description: "Большой палец, указательный и мизинец подняты — классический жест «ILY» на американском языке жестов.",category_id: 5, created_at: now, updated_at: now, media: [] },
  { id: 30, title: "Злость",         description: "Пальцы обеих рук согнуты и напряжены у груди, как когти. Выражение лица суровое.",                      category_id: 5, created_at: now, updated_at: now, media: [] },
  { id: 31, title: "Удивление",      description: "Обе руки с раскрытыми пальцами поднимаются вверх резким движением. Рот и глаза широко открыты.",        category_id: 5, created_at: now, updated_at: now, media: [] },
  { id: 32, title: "Страх",          description: "Обе руки с раскрытыми пальцами резко выбрасываются перед грудью. Тело слегка откидывается назад.",      category_id: 5, created_at: now, updated_at: now, media: [] },
];

export const MOCK_CATEGORIES = [
  { id: 1, name: "Приветствия",   slug: "greetings",   description: "Жесты для начала и завершения общения" },
  { id: 2, name: "Базовые фразы", slug: "basic",       description: "Часто используемые слова и выражения" },
  { id: 3, name: "Числа",         slug: "numbers",     description: "Цифры и счёт" },
  { id: 4, name: "Семья",         slug: "family",      description: "Члены семьи и родственники" },
  { id: 5, name: "Эмоции",        slug: "emotions",    description: "Чувства и состояния" },
];
