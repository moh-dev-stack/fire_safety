# Login page

**Route:** `/login`  
**Source:** `src/pages/LoginPage.tsx`  
**Auth:** `src/auth/AuthProvider.tsx` → `api.login` in `src/lib/api.ts`  
**Layout:** Full-screen (outside `AppLayout`). Unauthenticated users hitting protected routes are sent here with `location.state.from` preserved (see `ProtectedRoute`).

## Purpose

Sign in before accessing team home, rota, incidents, and map.

## UI elements

| Control | Behaviour |
|---------|-----------|
| **Password** | Password input, `autoComplete="current-password"`, required. |
| **Sign in** | Primary button; disabled while request in flight; label becomes “Signing in…”. |
| **Error region** | `role="alert"`; shows message from failed `login()` or generic “Login failed”. |

## Defaults and copy (POC)

- Initial **password** field state is **`1234`** (matches the fixed password checked in **`api/login.ts`** — not configurable via env).
- Page title line: **Fire & Safety — Jalsa 2026**.
- Body copy references **24–26 July 2026** and states the password is **1234** (keep copy aligned with `JALSA_DAYS` in `src/model/incident.ts` if dates diverge).

## Post-login navigation

- If already **authenticated**, renders `<Navigate>` to `from` pathname when present and not `/login`, else **`/`**.
- Successful login is handled by parent auth state; no separate success banner on this page.

## POC limitations & likely adjustments

- Replace with real identity (SSO, MFA, password policies, account recovery).
- Replace the fixed **`1234`** gate in **`api/login.ts`** for production; consider separate “demo” vs “prod” builds.
- Rate limiting and audit logging belong on the server, not in this doc’s scope — but plan for them.
- **When you change login UX or server password logic**, update this file and the main [README.md](../README.md) if needed.
