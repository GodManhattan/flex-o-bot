This repository is a Next.js 14 app (app router) focused on scheduling and auth using Supabase.

Quick context

- Framework: Next.js 14 (app router). Entry UI code is under `app/` (server & client components). Global layout lives in `app/layout.tsx`.
- Auth: Supabase JS client in `app/lib/supabase.ts`. Client-side auth helpers live in `app/utils/*` and `app/contexts/AuthContext.tsx` wraps the app and handles redirect logic.
- Manager routes: Protected pages under `app/manager/*` (login, register, dashboard, poll management). Public share pages under `app/poll/[shareLink]`.
- Styling: Tailwind CSS configured via `tailwind.config.js` and `globals.css` in `app/`.

Developer workflows (commands)

- Start dev server: `npm run dev` (uses `next dev --turbopack`). Use this for local development.
- Build for production: `npm run build` then `npm run start` to serve the build.

Environment

- The app expects Supabase env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `app/lib/supabase.ts` throws if missing — set these before running dev or build.

Patterns & conventions to follow

- Auth: Use the exported helpers in `app/utils/auth.ts` (which wrap `app/utils/authHelpers.ts`). Prefer `signIn`, `signUp`, `signOut`, `getSession`, `getUser` to keep behavior consistent.
- Client vs Server components: Files under `app/` default to server components unless they include `"use client"` at top (see `app/contexts/AuthContext.tsx`). Follow that convention to avoid hydration/auth issues.
- Routing protections: `AuthProvider` automatically redirects based on pathname. Avoid duplicating redirect logic in pages; instead rely on `requireAuth()` in server components or the client `useAuth()` hook when needed.
- Logging: Many modules include console logs for auth flows; these are intentional for debugging. Keep them when troubleshooting auth issues, but remove or reduce verbosity for production changes.

Key files to reference when editing features

- `app/layout.tsx` — global layout + `AuthProvider` wrapping.
- `app/contexts/AuthContext.tsx` — client-side auth state, listener, and redirect behavior.
- `app/lib/supabase.ts` — supabase client creation and env var checks.
- `app/utils/authHelpers.ts` & `app/utils/auth.ts` — centralized auth flows and enhanced error messages.
- `app/manager/*` and `app/poll/*` — primary route handlers and UI.

Testing & safety notes for AI agents

- Do not assume server-side middleware; this app uses Supabase session APIs and client-side listeners. Use `requireAuth()` in server components when you need server-side protection.
- Avoid adding secret keys to repo. Use environment variables and the existing client pattern.
- Small, localized changes are preferred. When changing auth flows, update both `AuthContext` (client) and `authHelpers` (shared logic) to keep behavior consistent.

If you change public behavior, update or add a short README note in `app/` describing the rationale and any env var changes.

If anything above is unclear or you want different emphasis (tests, CI, or DB), tell me which areas to expand and I'll iterate.
