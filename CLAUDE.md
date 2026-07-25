# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Minha Pelota** — web app for managing amateur football groups (peladas), replacing WhatsApp + spreadsheets. Admins manage groups, players, match schedules, attendance, and payments. Players self-confirm attendance via public token links.

Stack: **PHP 8.2 + Laravel 12** backend, **React + Inertia.js + TypeScript** SPA frontend, **Tailwind CSS** (utilities) + **CSS Modules** (Retro components), SQLite (testing) / MySQL (dev/prod).

## Commands

### Development
```bash
composer run dev          # Starts all dev services: Laravel, Vite, queue, Pail logs
npm run dev               # Vite + php artisan serve only (lighter alternative)
```

### Docker (manual/visual testing via the running container)
The project also runs in Docker (`minha-pelota-app-1` / `minha-pelota-web-1` at `http://localhost`), backed by a persistent sqlite volume (`storage/dev/database.sqlite`, mounted at `/app/storage/dev`), separate from the local checkout's `database.sqlite`.

The plain `compose.yaml` + `compose.override.yaml` combo runs a **production-built** image (assets baked in at `docker build` time) — it has **no hot reload**. For any manual/visual verification in the browser via this container, always bring it up with the HMR overlay instead:
```bash
docker compose -f compose.yaml -f compose.override.yaml -f compose.hmr.yaml up -d
```
This mounts `app/`, `routes/`, `config/`, `resources/`, `database/`, `public/` read-only into the `app` container (backend edits apply without rebuild) and runs a real Vite dev server in a separate `vite` service (port 5180) with HMR — no rebuild needed for frontend changes either. `vendor/`, `storage/`, `bootstrap/cache` still come from the image (correct `www-data` ownership preserved). `vite.config.js` reads `VITE_DEV_SERVER_ORIGIN` (set only inside this compose file) to make Vite write a browsable URL to `public/hot` instead of `0.0.0.0`.

Only fall back to a full rebuild (`docker build -t minha-pelota:latest . && docker compose up -d --force-recreate app web`, no HMR overlay) when the image itself changed (Dockerfile, PHP extensions, composer deps) — not for routine PHP/JS edits.

To reset the container's data: `docker compose exec app php artisan migrate:fresh --force`. Factories don't work inside this container (`fakerphp/faker` is a dev dependency, stripped by `composer install --no-dev` in the image) — seed manually via `php artisan tinker` with plain `new Model()` + `->save()`, not `Model::factory()`.

### Testing
```bash
composer run test                              # All PHPUnit tests (clears config first)
php artisan test --filter=GroupLifecycleTest   # Single test class
php artisan test tests/Feature/PlayersTest.php # Single test file

# E2E (Playwright) — requires separate server
npm run e2e:server        # Start server for e2e (port 8010/5180)
npm run e2e               # Run all Playwright tests
npm run e2e:headed        # Run with browser visible
npm run e2e:ui            # Playwright UI mode
npm run e2e:install       # Install Chromium (first-time setup)
```

### Frontend quality
```bash
npm run typecheck         # TypeScript type check (no emit)
npm run lint              # ESLint on resources/js/**
npm run lint:fix          # ESLint with auto-fix
npm run format            # Prettier on resources/js/**
```

### Build
```bash
npm run build             # Production Vite build → public/build/
php artisan pint          # PHP code style fixer
```

## Architecture

### Request flow
Inertia.js bridges Laravel (backend) and React (frontend): controllers call `Inertia::render('Page/Name', $props)`, and React pages receive those props directly as typed TypeScript props.

Named routes are available in frontend via the Ziggy `route()` function (`/* global route */` comment at top of files that use it). Navigation between pages uses `router.visit()` or `router.post()` from `@inertiajs/react`.

### Backend structure
- `app/Http/Controllers/` — all controllers are flat (no subdirectories). `GroupController` handles group CRUD; specialized controllers handle sub-resources (`GroupMatchController`, `GroupMatchAttendanceController`, `GroupMatchPaymentController`, `GroupMatchGenerationController`, `PlayerController`, `InviteController`, `MatchAttendancePublicController`)
- `app/Models/` — `Game` is the match model (not `Match`). Key relationships: `Group → Game (matches)`, `Game → MatchAttendance`, `Game → MatchPayment`, `Group → Player` (many-to-many via `group_player`)
- `app/Enums/PhysicalCondition.php` — canonical enum with `normalize()` for backward compat. The same values exist as `PhysicalCondition` enum in `resources/js/types/index.ts`
- Routes are in `routes/web.php` (many inline closures with Inertia renders) and `routes/api.php`

### Authorization model
Two roles: **admin** (`is_admin` flag on User/Player, also `owner_player_id` on Group) and **player**. Admin routes check `abort_unless((bool) ($user->is_admin ?? false), 403)`. Route `/` redirects to `admin.home` or `player.home` based on role.

### Frontend structure
- `resources/js/Pages/` — Inertia page components, organized by domain (`Groups/`, `Home/`, `Presence/`, `Invite/`)
- `resources/js/features/` — controller hooks (e.g. `useGroupShowController`) that encapsulate all form state, handlers, and router calls for a page; pages import these and pass results to presentational components
- `resources/js/Components/retro/` — the entire UI component library with retro pixel-art style. **Must use CSS Modules** (`ComponentName.module.css`). Do not add new Tailwind utility classes directly to retro components
- `resources/js/config/navigation.ts` — centralized nav item definitions with `labelKey` refs to locale strings
- `resources/js/locales/pt-BR.ts` — all user-facing strings. All UI text must go through `useLocale` → `t('key')`
- Path alias `@/` resolves to `resources/js/`

### Localization
All user-facing strings use the `useLocale()` hook. Components call `const { t } = useLocale()` and reference keys from `pt-BR.ts`. Add new keys to `pt-BR.ts`; never hardcode Portuguese text in components.

### Testing patterns
- PHPUnit tests use SQLite in-memory (`DB_DATABASE=:memory:`). Feature tests boot the full Laravel app
- Playwright e2e tests live in `tests/e2e/`, each spec is a feature domain. `global-setup.ts` resets and seeds the database before the test suite
- `tests/e2e/setup/db.ts` handles database reset/seed for e2e runs

## Code conventions
- Frontend indentation: **2 spaces** (Prettier `tabWidth: 2`, `printWidth: 100`, single quotes, trailing commas)
- Retro UI components in `Components/retro/` use CSS Modules — migrate legacy inline Tailwind classes when touching those components
- `PhysicalCondition` enum values are in Portuguese (`otimo`, `regular`, `ruim`, `machucado`, `unknown`) — keep backend and frontend in sync
- `Game` model represents a match (not `Match`, which is a reserved word conflict)
