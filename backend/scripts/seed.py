"""
Seed-скрипт: создаёт тестовые данные SignBridge.

Загружает жесты-слова русского жестового языка с видеофайлами
из папки /app/uploads/words/.

Запуск:
  docker exec signbridge-backend-1 python scripts/seed.py
"""
import asyncio
import os
import sys

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

# ─── Конфигурация путей к медиа ───
UPLOADS_DIR = "/app/uploads/words"
PUBLIC_BASE = os.getenv(
    "PUBLIC_BASE_URL", "https://signbridge.duckdns.org"
) + "/uploads/words"

# ─── Категории ───
CATEGORIES = [
    ("Семья", "family", "Члены семьи: мама, папа, бабушка, дедушка"),
    ("Еда и напитки", "food", "Продукты питания и базовые напитки"),
    ("Базовые понятия", "basic", "Часто употребительные слова повседневной жизни"),
    ("Экстренная помощь", "emergency", "Жесты для вызова помощи в опасной ситуации"),
]

# ─── Список жестов (title, slug категории, описание) ───
GESTURES = [
    # Семья
    ("Мама", "family", "Жест «мама» — открытая ладонь у щеки, поглаживающее движение."),
    ("Папа", "family", "Жест «папа» — закрытый кулак, прикосновение ко лбу или виску."),
    ("Бабушка", "family", "Жест «бабушка» — рука движется от подбородка дугой вперёд (старшее поколение по женской линии)."),
    ("Дедушка", "family", "Жест «дедушка» — рука движется ото лба дугой вперёд (старшее поколение по мужской линии)."),

    # Еда и напитки
    ("Еда", "food", "Жест «еда» — пальцы собраны щепотью, движение ко рту."),
    ("Вода", "food", "Жест «вода» — рука в форме буквы «W» (три пальца) у рта."),
    ("Рис", "food", "Жест «рис» — мелкие постукивающие движения пальцами."),
    ("Яблоко", "food", "Жест «яблоко» — кулак прокручивается у щеки."),
    ("Вишня", "food", "Жест «вишня» — щепоть у уха (имитация серёжки)."),

    # Базовые понятия
    ("Книга", "basic", "Жест «книга» — две ладони раскрываются как страницы."),
    ("Люди", "basic", "Жест «люди» — указательные пальцы поочерёдно движутся вперёд."),
    ("Время", "basic", "Жест «время» — указательный палец постукивает по запястью."),

    # Экстренная помощь
    ("Мне нужна ваша помощь", "emergency", "Фраза для просьбы о помощи. Сочетание жестов «мне», «нужна», «ваша», «помощь»."),
    ("Мне нужно к врачу", "emergency", "Фраза для сообщения о необходимости медицинской помощи."),
    ("Скорая помощь", "emergency", "Жест для обозначения службы скорой медицинской помощи."),
    ("Я вызову полицию", "emergency", "Фраза-предупреждение о вызове правоохранительных органов."),
]


def find_media_file(title: str) -> tuple[str, str] | None:
    """Найти медиа-файл для жеста по точному совпадению с названием.

    Сначала проверяем существующее имя как есть, затем варианты регистра.
    Возвращаем (url, media_type) или None.
    """
    if not os.path.isdir(UPLOADS_DIR):
        return None

    # Только видео — картинки игнорируются
    extensions = [
        ("mp4", "video"), ("webm", "video"), ("mov", "video"),
    ]

    candidates = {title, title.lower(), title.capitalize()}

    for cand in candidates:
        for ext, mtype in extensions:
            fname = f"{cand}.{ext}"
            if os.path.isfile(os.path.join(UPLOADS_DIR, fname)):
                # URL-encoded имя для корректной работы кириллицы
                from urllib.parse import quote
                return f"{PUBLIC_BASE}/{quote(fname)}", mtype
    return None


async def run():
    async with AsyncSessionLocal() as session:
        # ─── 1. Полная очистка жестов и медиа ───
        await session.execute(delete(Media))
        await session.execute(delete(Gesture))

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
            else:
                # обновим имя/описание на случай если изменилось
                existing = next(c for c in existing_cats if c.slug == slug)
                existing.name = name
                existing.description = desc

        # Удаляем категории не из актуального списка
        active_slugs = {s for _, s, _ in CATEGORIES}
        for c in existing_cats:
            if c.slug not in active_slugs:
                await session.delete(c)
        await session.flush()

        # ─── 3. Жесты + медиа ───
        added_gestures = 0
        added_media = 0
        missing_media = []
        for title, cat_slug, desc in GESTURES:
            g = Gesture(
                title=title,
                description=desc,
                category_id=cat_id_by_slug[cat_slug],
            )
            session.add(g)
            await session.flush()
            added_gestures += 1

            media_info = find_media_file(title)
            if media_info:
                url, mtype = media_info
                session.add(Media(gesture_id=g.id, file_url=url, media_type=mtype, order=0))
                added_media += 1
            else:
                missing_media.append(title)

        # ─── 4. Пользователи ───
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

    print(f"\n=== Готово ===")
    print(f"  Категорий: {len(CATEGORIES)}")
    print(f"  Жестов: {added_gestures}")
    print(f"  Медиафайлов подключено: {added_media}")
    if missing_media:
        print(f"  ⚠ Без медиа ({len(missing_media)}): {', '.join(missing_media)}")


if __name__ == "__main__":
    asyncio.run(run())
