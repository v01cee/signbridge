"""
Seed-скрипт: создаёт тестовые данные.

Все жесты сопровождаются реальными фотографиями из открытых источников
(Wikimedia Commons, public domain / CC0).

Запуск:
  docker exec signbridge-backend-1 python scripts/seed.py
"""
import asyncio
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete

from app.core.config import settings
from app.models.user import User
from app.models.category import Category
from app.models.gesture import Gesture
from app.models.media import Media
from app.core.security import hash_password

engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# ─── Изображения из Wikimedia Commons ───
# Дактильный алфавит — таблица из энциклопедии Брокгауза и Ефрона (1890–1907, public domain)
ALPHABET_CHART_OLD = (
    "https://upload.wikimedia.org/wikipedia/commons/d/d0/"
    "Brockhaus_and_Efron_Encyclopedic_Dictionary_b16_910-3.jpg"
)
# Современное фото таблицы (Новгородский музей, CC0)
ALPHABET_CHART_MUSEUM = (
    "https://upload.wikimedia.org/wikipedia/commons/0/09/"
    "Novgorod_Art_and_History_Museum_-_Russian_manual_alphabet.jpg"
)
# Сказка «Волк и лиса» на жестовом языке (Wikimedia, бесплатно)
TALE_VIDEO = (
    "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3e/"
    "%D0%92%D0%BE%D0%BB%D0%BA_%D0%B8_%D0%BB%D0%B8%D1%81%D0%B0_"
    "%D0%BD%D0%B0_%D0%B6%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%BE%D0%BC_"
    "%D1%8F%D0%B7%D1%8B%D0%BA%D0%B5_%28%22The_Wolf_and_the_Fox%22_"
    "in_sign_language%29.webm/"
    "%D0%92%D0%BE%D0%BB%D0%BA_%D0%B8_%D0%BB%D0%B8%D1%81%D0%B0_"
    "%D0%BD%D0%B0_%D0%B6%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%BE%D0%BC_"
    "%D1%8F%D0%B7%D1%8B%D0%BA%D0%B5_%28%22The_Wolf_and_the_Fox%22_"
    "in_sign_language%29.webm.720p.vp9.webm"
)
# Базовые ручные жесты — публичные фото
OK_GESTURE = (
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/"
    "OK_Hand_Gesture_%28cropped%29.jpg/640px-OK_Hand_Gesture_%28cropped%29.jpg"
)


CATEGORIES = [
    ("Алфавит", "alphabet", "Дактильный алфавит РЖЯ — 33 буквы"),
    ("Базовые жесты", "basic", "Часто употребительные жесты и фразы"),
    ("Видео", "videos", "Тексты и сказки на жестовом языке"),
]

# ─── Полный русский дактильный алфавит ───
# Каждая буква + краткое описание формы руки на основе классических справочников РЖЯ.
ALPHABET = [
    ("А", "Кулак, большой палец прижат сбоку. Ладонь направлена от себя."),
    ("Б", "Кулак, большой палец отведён в сторону вверх."),
    ("В", "Указательный и средний пальцы подняты и разведены (как «V»)."),
    ("Г", "Указательный палец направлен вперёд, остальные сжаты."),
    ("Д", "Большой и указательный пальцы образуют кольцо, остальные подняты."),
    ("Е", "Все пальцы согнуты в сторону ладони, образуя «коготь»."),
    ("Ё", "Жест «Е» с лёгким встряхиванием руки вверх."),
    ("Ж", "Указательный, средний и безымянный пальцы подняты и слегка раздвинуты."),
    ("З", "Указательный палец «рисует» в воздухе цифру 3."),
    ("И", "Мизинец поднят, остальные пальцы сжаты в кулак."),
    ("Й", "Жест «И» с короткой дугой влево."),
    ("К", "Указательный и средний пальцы вверх, большой между ними (как латинская K)."),
    ("Л", "Большой и указательный пальцы образуют угол (буква L)."),
    ("М", "Три пальца сверху лежат на большом, как латинская M."),
    ("Н", "Указательный и средний пальцы сверху лежат на большом (как латинская N)."),
    ("О", "Все пальцы соединены подушечками в окружность."),
    ("П", "Указательный и средний пальцы направлены вниз, остальные сжаты."),
    ("Р", "Указательный и средний пальцы скрещены."),
    ("С", "Полусогнутая рука в форме буквы C."),
    ("Т", "Большой палец между указательным и средним, остальные сжаты."),
    ("У", "Указательный и средний пальцы подняты и плотно соединены."),
    ("Ф", "Большой и указательный пальцы образуют кольцо, остальные три подняты."),
    ("Х", "Указательный палец согнут крючком, остальные сжаты."),
    ("Ц", "Жест «У», большой палец между указательным и средним."),
    ("Ч", "Указательный, средний и безымянный согнуты под прямым углом."),
    ("Ш", "Указательный, средний и безымянный подняты вверх, разведены."),
    ("Щ", "Жест «Ш» с движением руки вниз."),
    ("Ъ", "Кулак, большой палец загнут поверх остальных."),
    ("Ы", "Жест «И» с движением руки в сторону."),
    ("Ь", "Кулак, мизинец отведён в сторону."),
    ("Э", "Указательный палец «рисует» в воздухе букву Э."),
    ("Ю", "Сочетание жестов «И» и «У»."),
    ("Я", "Указательный палец направлен на себя, к груди."),
]

# ─── Дополнительные жесты с реальными фото ───
EXTRA_GESTURES = [
    {
        "title": "Знак «ОК»",
        "category_slug": "basic",
        "description": "Большой и указательный пальцы соединены в кольцо, остальные пальцы выпрямлены. Универсальный жест согласия и одобрения.",
        "media": [(OK_GESTURE, "image")],
    },
    {
        "title": "Таблица дактильного алфавита (музей)",
        "category_slug": "basic",
        "description": "Современное фото справочной таблицы русского дактильного алфавита из Новгородского художественного и исторического музея.",
        "media": [(ALPHABET_CHART_MUSEUM, "image")],
    },
    {
        "title": "Историческая таблица (Брокгауз, 1890)",
        "category_slug": "basic",
        "description": "Иллюстрация из Энциклопедического словаря Брокгауза и Ефрона: «Знаки русской азбуки глухонемых». Public domain.",
        "media": [(ALPHABET_CHART_OLD, "image")],
    },
    {
        "title": "«Волк и лиса» на жестовом языке",
        "category_slug": "videos",
        "description": "Русская народная сказка, исполненная на русском жестовом языке. Видео из Wikimedia Commons, CC BY-SA.",
        "media": [(TALE_VIDEO, "video")],
    },
]


async def run():
    async with AsyncSessionLocal() as session:
        # ─── 1. Полная очистка жестов и медиа ───
        await session.execute(delete(Media))
        await session.execute(delete(Gesture))
        # Категории не удаляем — могут быть ссылки на них в других таблицах

        # ─── 2. Категории ───
        existing_cats = (await session.execute(select(Category))).scalars().all()
        existing_slugs = {c.slug for c in existing_cats}
        cat_id_by_slug = {c.slug: c.id for c in existing_cats}
        for name, slug, desc in CATEGORIES:
            if slug not in existing_slugs:
                cat = Category(name=name, slug=slug, description=desc)
                session.add(cat)
                await session.flush()
                cat_id_by_slug[slug] = cat.id

        # Удаляем старые ненужные категории (если их слаги не в списке актуальных)
        active_slugs = {s for _, s, _ in CATEGORIES}
        for c in existing_cats:
            if c.slug not in active_slugs:
                await session.delete(c)

        await session.flush()

        # ─── 3. Алфавит ───
        alphabet_cat_id = cat_id_by_slug["alphabet"]
        for order_idx, (letter, desc) in enumerate(ALPHABET):
            g = Gesture(
                title=letter,
                description=desc,
                category_id=alphabet_cat_id,
            )
            session.add(g)
            await session.flush()
            session.add(
                Media(
                    gesture_id=g.id,
                    file_url=ALPHABET_CHART_OLD,
                    media_type="image",
                    order=0,
                )
            )

        # ─── 4. Дополнительные жесты с фото ───
        for item in EXTRA_GESTURES:
            cat_id = cat_id_by_slug[item["category_slug"]]
            g = Gesture(
                title=item["title"],
                description=item["description"],
                category_id=cat_id,
            )
            session.add(g)
            await session.flush()
            for i, (url, mtype) in enumerate(item["media"]):
                session.add(
                    Media(gesture_id=g.id, file_url=url, media_type=mtype, order=i)
                )

        # ─── 5. Пользователи ───
        admin_exists = (await session.execute(
            select(User).where(User.email == "admin@signbridge.dev")
        )).scalar_one_or_none()
        if not admin_exists:
            admin = User(
                email="admin@signbridge.dev",
                username="admin",
                hashed_password=hash_password("admin123"),
                is_active=True,
                is_superuser=True,
            )
            session.add(admin)
            print("  + admin@signbridge.dev / admin123")

        demo_exists = (await session.execute(
            select(User).where(User.email == "demo@signbridge.dev")
        )).scalar_one_or_none()
        if not demo_exists:
            demo = User(
                email="demo@signbridge.dev",
                username="demo",
                hashed_password=hash_password("demo123"),
                is_active=True,
            )
            session.add(demo)
            print("  + demo@signbridge.dev / demo123")

        await session.commit()

    print(f"  + {len(ALPHABET)} букв алфавита + {len(EXTRA_GESTURES)} доп. жестов")
    print(f"  + {len(CATEGORIES)} категорий")
    print("\nГотово!")


if __name__ == "__main__":
    asyncio.run(run())
