"""
Seed-скрипт: создаёт тестовые данные.

Запуск:
  docker exec signbridge-backend-1 python scripts/seed.py
"""
import asyncio
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.models.user import User
from app.models.category import Category
from app.models.gesture import Gesture
from app.core.security import hash_password

engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

CATEGORIES = [
    ("Приветствия", "greeting", "Жесты приветствия и прощания"),
    ("Числа", "numbers", "Числа от 0 до 100"),
    ("Алфавит", "alphabet", "Дактильный алфавит РЖЯ"),
    ("Семья", "family", "Члены семьи"),
    ("Еда", "food", "Продукты питания и блюда"),
    ("Цвета", "colors", "Основные цвета"),
    ("Эмоции", "emotions", "Чувства и эмоции"),
]

GESTURES = [
    ("Привет", 1, "Машем рукой на уровне плеча"),
    ("Пока", 1, "Опускаем руку с прощальным жестом"),
    ("Спасибо", 1, "Рука от подбородка вниз"),
    ("Один", 2, "Указательный палец вверх"),
    ("Два", 2, "Указательный и средний пальцы"),
    ("Три", 2, "Три пальца вверх"),
    ("А", 3, "Буква А дактильного алфавита"),
    ("Б", 3, "Буква Б дактильного алфавита"),
    ("В", 3, "Буква В дактильного алфавита"),
    ("Мама", 4, "Открытая ладонь у щеки"),
    ("Папа", 4, "Закрытый кулак у виска"),
    ("Хлеб", 5, "Движение нарезки"),
    ("Вода", 5, "W-форма руки у рта"),
    ("Красный", 6, "Указательный палец по губам"),
    ("Синий", 6, "Буква B с движением"),
    ("Радость", 7, "Круговые движения ладонями по груди"),
    ("Грусть", 7, "Ладони вниз по щекам"),
    ("Пожалуйста", 1, "Ладонь по кругу на груди"),
    ("Пять", 2, "Все пять пальцев"),
    ("Десять", 2, "Встряхивание руки с большим пальцем"),
]


async def run():
    async with AsyncSessionLocal() as session:
        # Категории
        existing_cats = (await session.execute(select(Category))).scalars().all()
        existing_slugs = {c.slug for c in existing_cats}
        added_cats = {}
        for name, slug, desc in CATEGORIES:
            if slug not in existing_slugs:
                cat = Category(name=name, slug=slug, description=desc)
                session.add(cat)
                await session.flush()
            else:
                cat = next(c for c in existing_cats if c.slug == slug)
            added_cats[slug] = cat.id

        # Жесты
        existing_gestures = {g.title for g in (await session.execute(select(Gesture))).scalars().all()}
        slugs = [s for _, s, _ in CATEGORIES]
        gesture_cat_map = {i + 1: slugs[i] for i in range(len(slugs))}
        added = 0
        for title, cat_num, desc in GESTURES:
            if title not in existing_gestures:
                slug = gesture_cat_map[cat_num]
                cat_id = added_cats.get(slug)
                g = Gesture(title=title, description=desc, category_id=cat_id)
                session.add(g)
                added += 1

        # Пользователи
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

    print(f"  + {added} жестов, {len(CATEGORIES)} категорий")
    print("\nГотово!")


if __name__ == "__main__":
    asyncio.run(run())
