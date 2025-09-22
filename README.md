# Flex-O-Bot

Lightweight Next.js 14 application for managing flexible work scheduling. This project uses the Next.js app router and Supabase for authentication and session management.

## Quick start

1. Install dependencies

```powershell
npm install
```

2. Create a `.env.local` in the project root with the required Supabase keys:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

3. Run the dev server

```powershell
npm run dev
```

Open http://localhost:3000 in your browser.

## Build / Production

To build and serve a production build:

```powershell
npm run build
npm run start
```

## Architecture & key patterns

- Next.js 14 (app router). UI and route handlers live under `app/`.
- Server components are the default. Add `"use client"` at the top of a file to make it a client component (see `app/contexts/AuthContext.tsx`).
- Global layout and app-level providers are in `app/layout.tsx`.

Auth and session handling

- Supabase client is created in `app/lib/supabase.ts`. It requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and will throw if missing.
- Client-side auth state and redirect logic is centralized in `app/contexts/AuthContext.tsx`. The provider wraps the app in `app/layout.tsx`.
- Use auth utility exports from `app/utils/auth.ts` (which wraps `app/utils/authHelpers.ts`) for sign in/up/out and session checks.

Routes

- Protected manager routes: `app/manager/*` (login, register, dashboard, poll management).
- Public share routes: `app/poll/[shareLink]`.

Developer guidance and conventions

- Prefer the exported helpers in `app/utils/auth.ts` to keep behavior consistent.
- Avoid duplicating redirect logic — rely on `AuthProvider` and `requireAuth()` for server components.
- Console logs in auth files are intentionally present for debugging; reduce verbosity for production changes.

Key files to inspect

- `app/layout.tsx` — app layout + `AuthProvider`.
- `app/contexts/AuthContext.tsx` — client auth logic and redirect rules.
- `app/lib/supabase.ts` — supabase client + env checks.
- `app/utils/authHelpers.ts` & `app/utils/auth.ts` — auth flows and helpers.



```
flex-o-bot
├─ app
│  ├─ android-chrome-192x192.png
│  ├─ android-chrome-512x512.png
│  ├─ apple-touch-icon.png
│  ├─ components
│  │  ├─ AddUserForm.tsx
│  │  ├─ AuthDebugger.tsx
│  │  ├─ CountdownTimer.tsx
│  │  ├─ ErrorAlert.tsx
│  │  ├─ Icons.tsx
│  │  ├─ LoadingSpinner.tsx
│  │  ├─ LoadingWrapper.tsx
│  │  ├─ RouteGuard.tsx
│  │  ├─ SkeletonLoader.tsx
│  │  └─ TimerSelector.tsx
│  ├─ contexts
│  │  └─ AuthContext.tsx
│  ├─ favicon-16x16.png
│  ├─ favicon-32x32.png
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ hooks
│  │  ├─ useAutoDrawResults.ts
│  │  ├─ useCountdown.ts
│  │  ├─ useDebounce.ts
│  │  ├─ useErrorHandler.ts
│  │  ├─ useFormValidation.ts
│  │  ├─ useLocalStorage.ts
│  │  ├─ usePagination.ts
│  │  └─ VirtualizedList.tsx
│  ├─ layout.tsx
│  ├─ lib
│  │  └─ supabase.ts
│  ├─ manager
│  │  ├─ create-poll
│  │  │  └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  ├─ poll
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ register
│  │  │  └─ page.tsx
│  │  └─ users
│  │     └─ page.tsx
│  ├─ page.tsx
│  ├─ poll
│  │  └─ [shareLink]
│  │     └─ page.tsx
│  ├─ site.webmanifest
│  ├─ types
│  │  └─ index.ts
│  └─ utils
│     ├─ auth.ts
│     ├─ authHelpers.ts
│     ├─ timer.ts
│     └─ validation.ts
├─ copy-files.bat
├─ database.sql
├─ next.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ svg
│  │  ├─ 24-hours-service-symbol-svgrepo-com.svg
│  │  ├─ bars-graph-svgrepo-com.svg
│  │  ├─ check-badge-svgrepo-com.svg
│  │  ├─ dashboard-alt-svgrepo-com.svg
│  │  ├─ eye-svgrepo-com.svg
│  │  ├─ flash-svgrepo-com.svg
│  │  ├─ friendly-iq-svgrepo-com.svg
│  │  ├─ hand-svgrepo-com.svg
│  │  ├─ login-3-svgrepo-com.svg
│  │  ├─ manage-dates-svgrepo-com.svg
│  │  ├─ morning-svgrepo-com.svg
│  │  ├─ plus-svgrepo-com.svg
│  │  ├─ sign-out-svgrepo-com.svg
│  │  ├─ sunset-afternoon-dusktwilight-svgrepo-com.svg
│  │  ├─ user-svgrepo-com.svg
│  │  └─ winner-cup-10-svgrepo-com.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ tailwind.config.js
└─ tsconfig.json

```