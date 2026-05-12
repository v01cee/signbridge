# SignBridge — PWA + APK через PWA Builder

## ✅ Что уже готово (Шаг 1)

- `vite-plugin-pwa` подключён, генерирует `manifest.webmanifest` и Service Worker
- PNG-иконки 192×192 и 512×512 в `frontend/public/`
- `manifest` с `display: standalone`, `lang: ru`, нужными полями
- Гард `useIsStandalone()` в `<DownloadAPKBanner>` — баннер скрывается в установленном приложении
- Production-стек: `docker-compose.prod.yml` (nginx + multi-stage build)
- nginx настроен:
  - `/.well-known/assetlinks.json` отдаётся с правильным mime
  - `.apk` отдаётся как `application/vnd.android.package-archive`
  - SPA fallback, gzip, прокси на backend

## 🔍 Локальная проверка PWA

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Открой `http://localhost:8088` → DevTools → **Application → Manifest** — должно быть всё зелёное.
**Lighthouse PWA score должен быть ≥ 90.**

---

## 🌐 Шаг 2. HTTPS-деплой

PWA Builder требует **публичный HTTPS URL**. Варианты:

### Вариант A — VPS + Cloudflare Tunnel (бесплатно, без домена)

```bash
# На VPS:
docker compose -f docker-compose.prod.yml --env-file .env up -d
# Поставить cloudflared:
cloudflared tunnel --url http://localhost:8088
# Получишь URL: https://random-name.trycloudflare.com
```

### Вариант B — Vercel/Netlify (фронт) + Railway/Render (бэк)

Build команда для Vercel: `npm run build`, output: `dist`.

### Вариант C — VPS + домен + Caddy/nginx-proxy + Let's Encrypt

Авто-SSL через Caddyfile:
```
signbridge.example.com {
    reverse_proxy localhost:8088
}
```

---

## 📦 Шаг 3. Сгенерировать APK через PWA Builder

1. Открой <https://www.pwabuilder.com>
2. Вбей свой HTTPS URL → **Start**
3. Должны быть зелёные оценки PWA / Security / Manifest
4. **Package For Stores** → вкладка **Android**
5. ⚠️ Выбери **Google Play** (НЕ "Other Android" — там unsigned APK не ставится)
6. Заполни:
   - **Package ID:** `dev.signbridge.app` (уже в `app.json` mobile-папки и в `assetlinks.json`)
   - **App name:** `SignBridge`
   - **Version:** `1.0.0`
   - **Signing key:** `New` (сгенерится в zip)
7. **Generate** → скачается zip:
   - `app-release-signed.apk` — это ставить на телефон
   - `assetlinks.json` — с реальным SHA256, заменить на сайте
   - `signing.keystore` + пароли — **СОХРАНИ!** Без него не обновишь приложение

---

## 🔗 Шаг 4. Digital Asset Links (убрать Chrome URL-бар)

1. Достань из zip-а PWA Builder файл `assetlinks.json`
2. Скопируй его в `frontend/public/.well-known/assetlinks.json` (заменив существующий шаблон)
3. Передеплой фронт
4. Проверь: `curl https://yoursite.com/.well-known/assetlinks.json` должен вернуть JSON
5. Положи `app-release-signed.apk` как `frontend/public/SignBridge.apk` — баннер скачивания уже на него ссылается

---

## 📲 Шаг 5. Раздача

- APK доступен по `https://yoursite.com/SignBridge.apk`
- На главной автоматически показывается `<DownloadAPKBanner>` с кнопкой
- Внутри установленного приложения баннер **скрывается** (через `useIsStandalone()`)
- На телефоне юзеру: «Разрешить установку из неизвестных источников»

---

## ⚠️ Грабли

| Проблема | Причина | Фикс |
|---|---|---|
| «Приложение не установлено» | Unsigned APK из вкладки "Other Android" | Вкладка **Google Play** |
| PWA Builder ругается на иконки | SVG не принимает | Только PNG 192 и 512 (уже есть) |
| Chrome URL-бар сверху в APK | Нет/неверный `assetlinks.json` | Положить файл из PWA Builder zip |
| Lighthouse PWA fail | Нет `display: standalone` или HTTPS | ✅ уже настроено + HTTPS |
| Баннер «Скачать» в установленном app | Не проверен standalone | ✅ `useIsStandalone()` |
| Горизонтальный скролл на мобиле | Десктоп navbar | ✅ бургер-меню на ≤600px |
