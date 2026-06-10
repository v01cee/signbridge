# SignBridge 🤟

**Платформа изучения русского жестового языка (РЖЯ)** — словарь жестов с категориями, поиском, избранным и пользовательским контентом.

🌐 **Live demo:** https://signbridge.duckdns.org
📱 **Мобильное приложение:** React Native + Expo (см. `mobile/`)
🐳 **Развёрнуто:** Docker Compose на Ubuntu VPS

---

## Тестовые аккаунты

| Email | Пароль | Роль |
|---|---|---|
| `admin@signbridge.dev` | `admin123` | Администратор |
| `demo@signbridge.dev` | `demo123` | Обычный пользователь |

---

## Возможности

- 📖 **Словарь жестов** с фильтрацией по 7 категориям (Приветствия, Числа, Алфавит, Семья, Еда, Цвета, Эмоции)
- 🎯 **Тренировка** — интерактивное заучивание жестов: викторина (угадай жест по описанию) и карточки (самопроверка) с XP, уровнями, сериями и прогрессом по каждому жесту
- 🔍 **Полнотекстовый поиск** жестов по названию
- 🎥 **Медиафайлы** (видео/изображения) для каждого жеста
- ⭐ **Избранное** — сохранение жестов для авторизованных пользователей
- ➕ **Создание жестов** пользователями с указанием категории
- 🔐 **JWT авторизация** (регистрация / вход)
- 📱 **PWA** — установка на телефон через Chrome → «Установить приложение»
- 📲 **Native APK** (Android, через Expo EAS) для нативного опыта
- 🌑 **Тёмная тема** во всём интерфейсе

---

## Архитектура

```
┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web (React)    │     │  Mobile (Expo)   │     │   PWA / TWA     │
│   Vite + TS      │     │  React Native    │     │   Android APK   │
└────────┬─────────┘     └────────┬─────────┘     └────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                    ┌─────────────────────────┐
                    │   nginx + Let's Encrypt │
                    │   signbridge.duckdns.org│
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       FastAPI           │
                    │  /api/v1/* endpoints    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     PostgreSQL 16       │
                    │ users, categories,      │
                    │ gestures, media,        │
                    │ favorites, progress     │
                    └─────────────────────────┘
```

---

## Технологический стек

### Frontend (Web)
- **React 18** + **TypeScript** + **Vite 5**
- **TanStack Query v5** — кэширование API
- **Zustand** + persist — JWT хранится в localStorage
- **React Router v6** — SPA маршрутизация
- **vite-plugin-pwa** — генерация manifest + Service Worker

### Mobile (React Native)
- **Expo SDK 51** + **React Native 0.74**
- **React Navigation v6** (Native Stack)
- **AsyncStorage** — токен сессии
- **EAS Build** — облачная сборка APK без локального Android Studio

### Backend
- **Python 3.11** + **FastAPI 0.115** (async)
- **SQLAlchemy 2.0** async + **asyncpg**
- **Pydantic v2** — схемы и валидация
- **python-jose** — JWT (HS256, срок 7 дней)
- **passlib[bcrypt]** — хеширование паролей

### Инфраструктура
- **Docker Compose** (postgres + backend + frontend)
- **Multi-stage build** для frontend (Node.js builder → nginx)
- **nginx** на хосте как reverse proxy
- **Let's Encrypt** через certbot — автообновление сертификата
- **DuckDNS** — бесплатный поддомен

---

## Структура репозитория

```
SignBridge/
├── backend/                  # FastAPI приложение
│   ├── app/
│   │   ├── core/             # config, database, security, dependencies
│   │   ├── models/           # SQLAlchemy модели
│   │   ├── schemas/          # Pydantic схемы
│   │   ├── repositories/     # data-access слой
│   │   ├── services/         # бизнес-логика
│   │   └── routers/          # HTTP эндпоинты
│   ├── scripts/seed.py       # тестовые данные
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                 # Web (React + Vite)
│   ├── src/
│   │   ├── pages/            # HomePage, GestureDetailPage, PracticePage, ...
│   │   ├── components/       # GestureCard, Header, ...
│   │   ├── api/              # HTTP клиенты
│   │   ├── hooks/            # useCategories, useIsMobile, useIsStandalone
│   │   ├── store/            # Zustand: authStore, progressStore (геймификация)
│   │   └── data/             # mock fallback
│   ├── public/
│   │   ├── icon-192.png      # PWA иконки
│   │   ├── icon-512.png
│   │   ├── SignBridge.apk    # TWA APK для скачивания
│   │   └── .well-known/
│   │       └── assetlinks.json  # Digital Asset Links для TWA
│   ├── Dockerfile            # dev
│   ├── Dockerfile.prod       # multi-stage: build + nginx
│   ├── nginx.conf            # production reverse proxy
│   └── vite.config.ts        # включает vite-plugin-pwa
│
├── mobile/                   # Native (React Native + Expo)
│   ├── src/
│   │   ├── screens/          # Login, Register, Home, GestureDetail, Favorites, CreateGesture, Profile
│   │   ├── components/       # PrimaryButton, TextField, GestureCard, ...
│   │   ├── api/              # client, auth, gestures, favorites, categories
│   │   ├── store/auth.tsx    # Context + AsyncStorage
│   │   ├── navigation/       # NativeStackNavigator
│   │   ├── theme.ts          # цвета, отступы, радиусы
│   │   └── utils/emoji.ts
│   ├── app.json
│   ├── eas.json              # профиль сборки EAS
│   └── package.json
│
├── docker-compose.yml        # dev стек (db + backend + frontend dev-server)
├── docker-compose.prod.yml   # prod стек (db + backend + frontend nginx)
├── PWA_DEPLOY.md             # инструкция по PWA Builder
└── README.md                 # этот файл
```

---

## REST API (примеры)

Базовый URL: `https://signbridge.duckdns.org/api/v1`

```
POST   /auth/register          — регистрация
POST   /auth/login             — логин (form-data, возвращает JWT)
GET    /auth/me                — текущий пользователь

GET    /categories/            — список категорий
GET    /gestures/?q=&category_id=   — поиск жестов
GET    /gestures/{id}          — жест с медиа
POST   /gestures/              — создать (требует JWT)

GET    /favorites/             — мои избранные (JWT)
POST   /favorites/?gesture_id= — добавить
DELETE /favorites/{gesture_id} — удалить

GET    /health                 — healthcheck
```

Полная Swagger UI: https://signbridge.duckdns.org/api/docs (если включён в проде)

---

## Локальный запуск

### Dev (с hot-reload):
```bash
docker compose up -d --build
docker exec signbridge-backend-1 python scripts/seed.py
# → http://localhost:5173
```

### Production-стек:
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
docker exec signbridge-backend-1 python scripts/seed.py
# → http://localhost:8088
```

### Mobile (Expo Go):
```bash
cd mobile
npm install --legacy-peer-deps
npx expo start    # → QR-код для Expo Go
```

### Mobile APK (EAS):
```bash
cd mobile
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

---

## Развёртывание на VPS (Ubuntu)

1. Установить Docker и Docker Compose
2. `git clone https://github.com/v01cee/signbridge && cd signbridge`
3. `cp .env.example .env` → отредактировать секреты
4. `docker compose -f docker-compose.prod.yml --env-file .env up -d --build`
5. Настроить nginx reverse proxy на порт **8088** (см. конфиг ниже)
6. Получить HTTPS:
```bash
certbot --nginx -d signbridge.duckdns.org --agree-tos -m you@email.com --redirect
```

Конфиг nginx (`/etc/nginx/sites-available/signbridge.duckdns.org`):
```nginx
server {
    listen 80;
    server_name signbridge.duckdns.org;
    client_max_body_size 50M;
    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## License

MIT
