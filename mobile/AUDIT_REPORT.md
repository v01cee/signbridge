# SignBridge Mobile — QA Audit Report

## Результат
TypeScript: **0 ошибок** (`npx tsc --noEmit`). Зависимости установлены (`npm install --legacy-peer-deps`, 1106 пакетов).

## Что найдено и исправлено
1. **Отсутствовала папка `assets/`** — `app.json` ссылался на `./assets/icon.png`, что заблокировало бы `expo start` / EAS build.
   - Создана `mobile/assets/` с минимальными PNG-заглушками (цвет фона `#0f1117` под темную тему):
     - `icon.png` 1024×1024
     - `adaptive-icon.png` 1024×1024
     - `splash.png` 1242×1242
     - `favicon.png` 48×48
   - В `app.json` добавлены ссылки `splash.image` и `android.adaptiveIcon.foregroundImage` (раньше были только `backgroundColor`, что вызывало бы warning при сборке).

2. **API-сигнатуры — без конфликтов.** Дубликата `createGesture` нет — создание жеста сделано инлайн через `apiJson<Gesture>('/gestures/', { method: 'POST', body }, token)` прямо в `CreateGesture.tsx`. `src/api/gestures.ts` экспортирует только `fetchGestures` / `fetchGesture`. `favorites.ts`, `auth.ts`, `categories.ts` — сигнатуры согласованы с экранами.

3. **Импорты компонентов** (`ScreenContainer`, `Header`, `PrimaryButton`, `TextField`, `EmptyState`, `GestureCard`, `CategoryChip`) — все default-экспорты, все экраны импортируют корректно. Конфликтов named/default не обнаружено.

## Возможные баги (не блокеры компиляции, не фиксил)
- В `CreateGesture.tsx` `ScreenContainer` обернут внутри другого `ScreenContainer` (строки 102-104) — двойной SafeArea/padding, потенциально дублирует отступы.
- `EXPO_PUBLIC_API_URL` берётся из env, fallback URL Cloudflare-туннеля захардкоден в `src/api/client.ts` — при пересоздании туннеля надо обновлять.
- Picker на iOS может требовать `itemStyle` для тёмной темы — частично обработано.

## Структура `mobile/`
```
App.tsx, app.json, eas.json, package.json, tsconfig.json
assets/ (icon, adaptive-icon, splash, favicon)
src/
  api/        (client, auth, categories, gestures, favorites)
  components/ (CategoryChip, EmptyState, GestureCard, Header,
               PrimaryButton, ScreenContainer, TextField)
  navigation/ (index.tsx — стек: Home/Login/Register/GestureDetail/
               Favorites/CreateGesture/Profile)
  screens/    (Home, Login, Register, GestureDetail, Favorites,
               CreateGesture, Profile)
  store/      (auth.tsx — AsyncStorage + Context)
  types/, utils/, theme.ts
```

## Как запустить (dev)
```bash
cd mobile
npm install --legacy-peer-deps          # один раз
npx expo start                          # QR + Metro
```
В Expo Go (Android/iOS) сканировать QR. Для веб-предпросмотра: `w` в терминале Metro.

Сменить backend URL: `EXPO_PUBLIC_API_URL=https://<новый-туннель>/api/v1 npx expo start --clear` либо отредактировать дефолт в `src/api/client.ts`.

## Сборка APK (EAS)
```bash
npm install -g eas-cli       # один раз
eas login
eas build --platform android --profile preview
```
Профиль `preview` в `eas.json` собирает APK (не AAB), ссылка на скачивание приходит в email/выводе. Для production: `--profile production`.

## Зависимость от Cloudflare-туннеля
URL backend (Cloudflare quick tunnel) **хардкоднут** как fallback в `src/api/client.ts`. Туннель временный — при перезапуске backend URL меняется. Решения:
- Поднять стабильный named tunnel (`cloudflared tunnel create`).
- Или передавать `EXPO_PUBLIC_API_URL` при запуске Expo / EAS build (`eas secret:create EXPO_PUBLIC_API_URL ...`).
