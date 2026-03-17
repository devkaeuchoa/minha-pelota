# Changelog

All notable changes to this project will be documented in this file.

## v0.0.1 — Groups domain foundation

### Added
- Initial **Groups** domain: `Group` model, migration and factory.
- REST API for groups in `Api\GroupController` with JSON resources.
- Web groups controller (`GroupController`) with Inertia responses and authorization.
- Inertia/React UI for groups: `Create`, `Edit`, `Form`, `Index`, `Show`.
- Batch delete flow for groups on the index page and single delete on the show page.
- Player API endpoints via `Api\GroupPlayerController` and form requests.
- Frontend TypeScript tooling: `tsconfig.json`, shared types in `resources/js/types`, and ESLint/Prettier integration.

### Changed
- `weekday` field changed from string to integer (0–6) across migration, factory, API, and UI.
- Main entrypoint migrated from `app.jsx` to `app.tsx` with dual resolution for `.jsx` and `.tsx` pages.
- Layout and shared UI components migrated from `.jsx` to `.tsx` with typed props.
- Root route `/` now redirects to the authenticated groups list.
- UI structure updated to use semantic BEM-style classes layered on Tailwind utilities.
- `slug` on groups is now generated automatically from the `name` field (accent-normalized, kebab-case, read-only).

### Tooling and DX
- ESLint v9 flat config (`eslint.config.mjs`) configured for JS/TS + React + Hooks + Prettier.
- Prettier config and ignore files added for consistent formatting.
- NPM scripts added/updated:
  - `npm run lint` / `npm run lint:fix`
  - `npm run format`
  - `npm run typecheck` (`tsc --noEmit`)

