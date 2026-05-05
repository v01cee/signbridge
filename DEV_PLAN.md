# SignBridge — Детальный план разработки

## Текущее состояние

**Backend (FastAPI):**
- ✅ Модели: User, Gesture, Category, Media, LearningProgress, Favorite
- ✅ CRUD жестов (роутер, сервис, репозиторий)
- ✅ Авторизация (JWT)
- ✅ Роутер categories (список + создание)
- ✅ Поиск и фильтрация жестов (query params: q, category_id)
- ❌ Роутеры: favorites, progress
- ❌ Загрузка медиа

**Frontend (React + Vite + TS):**
- ✅ Страницы: HomePage, GestureDetailPage, CreateGesturePage
- ✅ Компоненты: Header, GestureCard, SearchBar
- ✅ Демо-режим с моками
- ✅ Авторизация (Zustand store, Login/Register pages, ProtectedRoute)
- ❌ Уроки / режим обучения
- ❌ MediaPipe (распознавание жестов)

---

## Этап 1 — Рабочий продукт

### 1.1 Авторизация (Backend)

**Зависимости добавить в requirements.txt:**
```
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
```

**Создать файлы:**

`backend/app/core/security.py`
- `hash_password(password)` → str
- `verify_password(plain, hashed)` → bool
- `create_access_token(data, expires_delta)` → str
- `decode_token(token)` → payload

`backend/app/routers/auth.py`
- `POST /api/v1/auth/register` — регистрация, возвращает UserRead
- `POST /api/v1/auth/login` — логин, возвращает `{ access_token, token_type }`
- `GET /api/v1/auth/me` — текущий пользователь (защищённый)

`backend/app/routers/users.py`
- `GET /api/v1/users/{user_id}` — профиль пользователя
- `PATCH /api/v1/users/me` — обновить профиль

**Изменить:**
- `backend/app/core/dependencies.py` — добавить `get_current_user`
- `backend/app/core/config.py` — добавить `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`

---

### 1.2 Авторизация (Frontend)

**Создать файлы:**

`frontend/src/api/auth.ts`
- `register(email, username, password)` → UserRead
- `login(email, password)` → TokenResponse
- `getMe()` → UserRead

`frontend/src/store/authStore.ts` (Zustand)
- state: `user`, `token`, `isAuthenticated`
- actions: `login`, `logout`, `setUser`

`frontend/src/pages/LoginPage.tsx`
- Форма: email + password
- Ссылка на регистрацию

`frontend/src/pages/RegisterPage.tsx`
- Форма: email + username + password

`frontend/src/components/ProtectedRoute.tsx`
- Редирект на /login если не авторизован

**Изменить:**
- `frontend/src/App.tsx` — добавить роуты /login, /register
- `frontend/src/components/Header.tsx` — кнопки логин/выход + имя пользователя
- `frontend/src/api/gestures.ts` — добавить Authorization header

**Установить пакеты:**
```
zustand
```

---

### 1.3 Категории и жесты (Backend)

**Создать:**

`backend/app/routers/categories.py`
- `GET /api/v1/categories` — список категорий
- `POST /api/v1/categories` — создать (только superuser)

`backend/app/repositories/category.py`
- `get_all()`, `get_by_slug()`, `create()`

**Изменить:**
- `backend/app/routers/gesture.py` — добавить фильтр по category_id, поиск по title
- `backend/app/routers/api.py` — подключить новые роутеры

---

### 1.4 Загрузка медиа (Backend)

`backend/app/routers/media.py`
- `POST /api/v1/media/upload` — загрузить файл (видео/изображение)
  - Сохранять в `backend/static/uploads/`
  - Возвращать URL файла
- `DELETE /api/v1/media/{media_id}` — удалить

**Изменить:**
- `backend/app/main.py` — добавить `StaticFiles` mount на `/static`

---

### 1.5 Прогресс и избранное (Backend)

`backend/app/routers/progress.py`
- `GET /api/v1/progress` — прогресс текущего пользователя
- `POST /api/v1/progress/{gesture_id}` — записать результат практики
  - body: `{ score: int }` (0-100)

`backend/app/routers/favorites.py`
- `GET /api/v1/favorites` — список избранных жестов
- `POST /api/v1/favorites/{gesture_id}` — добавить в избранное
- `DELETE /api/v1/favorites/{gesture_id}` — убрать из избранного

---

### 1.6 Режим обучения (Frontend)

`frontend/src/pages/LearnPage.tsx`
- Выбор категории → список жестов для изучения
- Очередь карточек (flashcard-режим)
- Кнопки: "Знаю" / "Ещё раз"
- Результат в конце + запись прогресса

`frontend/src/pages/ProfilePage.tsx`
- Статистика: сколько жестов изучено, последняя активность
- Список избранного
- Прогресс по категориям (прогресс-бары)

**Изменить:**
- `frontend/src/App.tsx` — добавить роуты /learn, /profile
- `frontend/src/components/Header.tsx` — ссылка "Учиться"

---

### 1.7 MediaPipe — распознавание жестов

**Установить пакеты:**
```
@mediapipe/hands
@mediapipe/camera_utils
@tensorflow/tfjs
```

`frontend/src/hooks/useHandPose.ts`
- Инициализация MediaPipe Hands
- Получение 21 точки руки из видеопотока
- Возвращает `landmarks: Landmark[]`

`frontend/src/components/GestureChecker.tsx`
- Открывает камеру
- Показывает оверлей с точками руки
- Сравнивает позицию с эталоном жеста
- Возвращает `{ match: boolean, confidence: number }`

`frontend/src/pages/PracticePage.tsx`
- Показывает эталонное видео жеста
- Рядом — камера пользователя с GestureChecker
- Прогресс-индикатор совпадения
- "Засчитано!" при confidence > 0.8

---

### 1.8 Миграции и Docker

**Создать:**

`backend/alembic/versions/002_add_auth_fields.py`
- Если нужны новые поля в таблицах

**Изменить:**
- `docker-compose.yml` — добавить переменные `SECRET_KEY`, `ALGORITHM`

---

## Этап 2 — Геймификация

### Новые модели

`backend/app/models/gamification.py`
- `UserStats` — xp, level, streak_days, streak_last_date
- `Achievement` — name, description, icon, condition_type, condition_value
- `UserAchievement` — user_id, achievement_id, earned_at
- `Challenge` — title, description, xp_reward, start_date, end_date, condition
- `ChallengeParticipant` — user_id, challenge_id, progress, completed

### Логика XP

`backend/app/services/gamification.py`
- `award_xp(user_id, amount, reason)` — начислить XP, пересчитать уровень
- `check_achievements(user_id)` — проверить и выдать новые ачивки
- `update_streak(user_id)` — обновить стрик при ежедневном входе
- XP за действия:
  - Пройден жест: +10 XP
  - Стрик 7 дней: +50 XP
  - Пройден челлендж: +100-500 XP

### Роутеры

`backend/app/routers/gamification.py`
- `GET /api/v1/stats/me` — XP, уровень, стрик, ачивки
- `GET /api/v1/leaderboard` — топ 50 пользователей по XP
- `GET /api/v1/challenges` — активные челленджи
- `POST /api/v1/challenges/{id}/join` — вступить в челлендж

### Frontend

`frontend/src/components/XPBar.tsx` — полоска опыта с уровнем
`frontend/src/components/StreakBadge.tsx` — огонёк стрика
`frontend/src/components/AchievementToast.tsx` — всплывашка новой ачивки
`frontend/src/pages/LeaderboardPage.tsx` — таблица лидеров
`frontend/src/pages/ChallengesPage.tsx` — список челленджей

---

## Этап 3 — Соцсеть

### Новые модели

`backend/app/models/social.py`
- `Post` — user_id, video_url, description, gesture_id (опц.), created_at
- `Follow` — follower_id, following_id
- `Like` — user_id, post_id
- `Comment` — user_id, post_id, text

### Роутеры

`backend/app/routers/feed.py`
- `GET /api/v1/feed` — лента постов (от подписок + рекомендации)
- `POST /api/v1/posts` — создать пост (видео)
- `POST /api/v1/posts/{id}/like` — лайк
- `POST /api/v1/posts/{id}/comments` — комментарий

`backend/app/routers/social.py`
- `POST /api/v1/follow/{user_id}` — подписаться
- `DELETE /api/v1/follow/{user_id}` — отписаться
- `GET /api/v1/users/{user_id}/followers`
- `GET /api/v1/users/{user_id}/following`

### Frontend

`frontend/src/pages/FeedPage.tsx` — лента в стиле TikTok (вертикальный скролл)
`frontend/src/pages/UserProfilePage.tsx` — публичный профиль с постами
`frontend/src/components/VideoPost.tsx` — карточка поста с лайком/комментами

---

## Этап 4 — B2B

### Новые модели

`backend/app/models/corporate.py`
- `Company` — name, inn, contact_email, plan_type, expires_at
- `CompanyMember` — company_id, user_id, role

### Роутеры

`backend/app/routers/corporate.py`
- `POST /api/v1/corporate/invite` — пригласить сотрудника
- `GET /api/v1/corporate/dashboard` — статистика по компании
- `GET /api/v1/corporate/export` — выгрузка прогресса сотрудников (CSV)

---

## Этап 5 — Маркетплейс переводчиков

### Новые модели

`backend/app/models/marketplace.py`
- `Interpreter` — user_id, bio, languages, rate_per_hour, verified, rating
- `Booking` — client_id, interpreter_id, scheduled_at, status, price
- `Review` — booking_id, rating, text

### Роутеры

`backend/app/routers/marketplace.py`
- `GET /api/v1/interpreters` — каталог переводчиков (фильтры, сортировка)
- `POST /api/v1/bookings` — забронировать сессию
- `POST /api/v1/bookings/{id}/review` — оставить отзыв

### WebRTC

- Видеозвонок внутри платформы (WebRTC peer-to-peer или через сервер медиа)
- Библиотека: `simple-peer` (frontend) + сигнальный сервер на WebSocket (backend)

---

## Порядок работы

```
1.1 Auth backend     ← начать здесь
1.2 Auth frontend
1.3 Categories backend
1.4 Media upload
1.5 Progress + Favorites
1.6 Learn page frontend
1.7 MediaPipe
1.8 Migrations + Docker
       ↓
    Этап 2
       ↓
    Этап 3
       ↓
    Этап 4
       ↓
    Этап 5
```
