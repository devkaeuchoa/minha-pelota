# Changelog

All notable changes to this project will be documented in this file.

## v0.2.0 — Match attendance and generation options

### Added

- **Match attendance flow** (admin + public):
  - Admin management page for presence and lineup visualization.
  - Public token-based page for players to confirm or decline attendance by phone number.
  - Match attendance link generation per match with expiration at the match date/time.
- **Attendance domain models and persistence**:
  - `match_attendance_links` and `match_attendance` tables with proper relations and constraints.
  - `MatchAttendanceLink` and `MatchAttendance` models with integration into `Game` and `Player`.
- **Retro components for lineup and presence UX**:
  - `RetroPitch` for field visualization with configurable player limit.
  - Reserve indicators above the field with visual placeholders when empty.
  - `RetroPhysicalConditionEmoji` to display physical condition status in list UIs.
- **Physical condition canonical enum support**:
  - Backend enum normalization and API consistency for `otimo`, `regular`, `ruim`, `machucado`, `unknown`.
  - Frontend enum alignment in shared TypeScript types.
- **Match generation options in Group UI**:
  - Dedicated generation section in `Groups/Show` inside accordion.
  - Presets for current month, 3, 6, and 12 months.
  - Custom month selection (1–12) posting to `groups.matches.generate-months`.
- **Feature tests**:
  - Coverage for multi-month generation (`generate-months`) including owner authorization and months validation.

### Changed

- **Groups show page layout**:
  - Added a dedicated “Gerar Datas” accordion between details and invite sections.
  - Group details now display only the next scheduled match as a value field.
  - Dates strip moved out of details and into generation context.
- **Presence list behavior**:
  - Confirmed players are prioritized to the top and highlighted in green.
  - Presence management desktop layout updated to show field on the left and list on the right from large screens.
- **Retro list/grid styling architecture**:
  - `RetroPlayerList` and `RetroRosterGrid` styles migrated to CSS modules.
  - Mobile overflow and desktop scroll-snap improvements in roster/list presentation.

## v0.1.0 — Retro UI & Players domain

### Added

- **Retro UI Kit** for the web app, inspired by the Retro Soccer design:
  - Core layout and chrome: `RetroLayout`, `RetroTitleBar`, `RetroSectionHeader`, `RetroPanel`, `RetroInfoCard`.
  - Form components: `RetroFormField`, `RetroTextInput`, `RetroPasswordInput`, `RetroTextarea`, `RetroCheckbox`, `RetroRadio`, `RetroSelect`, `RetroSlider`, `RetroNumberStepper`, `RetroFileInput`, `RetroDatePicker`, `RetroButton`, `RetroIconButton`.
  - Status and feedback: `RetroStatusPill`, `RetroBannerAlert`, `RetroInlineInfo`, `RetroControlHintBar`.
  - Navigation and controls: `RetroModeSelect`, `RetroSegmentedControl`, `RetroLevelSelector`.
  - Data display: `RetroValueDisplay`, `RetroTeamCard`, `RetroStatBar`, `RetroStatsPanel`, `RetroTable` (with header/row/cell components).
  - Players-specific components: `RetroPlayerList`, `RetroRosterGrid`, `RetroSearchInput`.
  - Accordion and layout helpers: `RetroAccordion`, `RetroDesktopNavbar`, `RetroMobileNavbar`, `RetroAppShell`.
- **Global retro theming**:
  - Tailwind `fontSize` scale bumped so `text-base` is larger and the kit has a more prominent, arcade feel.
  - Custom retro CSS utilities merged into `app.css` (metallic backgrounds, scanlines, borders, text shadows, input tweaks).
- **Players domain**:
  - `Player` model, migration, factory and `group_player` pivot table.
  - HTTP layer: `PlayerController` with store/update/destroy and batch attach of existing players to a group.
  - Form requests: `StorePlayerRequest`, `UpdatePlayerRequest`, `InvitePlayerRequest`.
  - Routes for managing players within a group and invite flows.
- **Player management UI**:
  - New `Groups/Players` page with two-column layout:
    - Left: available players (multi-select, controlled search).
    - Right: players already in the group (single selection).
  - Batch add and remove actions with optimistic UI and retro-styled controls.
  - Roster grid (`RetroRosterGrid`) on the group show page to visualize the team in columns.
- **Invite flow**:
  - `InviteController` with accept/success pages implemented in Inertia/React.
  - Invite summary and player form components under `features/invite`.
- **Navigation shell**:
  - `RetroAppShell` layout wrapping pages with responsive header:
    - Desktop: `RetroDesktopNavbar` with system status and version chip.
    - Mobile: `RetroMobileNavbar` with back arrow `IconButton` and hamburger menu using the same retro metal style.
  - Centralized navigation config in `resources/js/config/navigation.ts`.
- **Datetime utilities**:
  - `WEEKDAY_LABELS_PT_BR`, `getWeekdayLabel` and `getWeekdayLabelFromIndex` in `utils/datetime.ts`.
  - `GroupDetailsSection` and invite summary now show localized weekday labels instead of raw indices.
- **Tests**:
  - `InviteTest` covering the invite flow.
  - `PlayersTest` covering the players domain and group association behavior.

### Changed

- **Groups UI refactor to Retro kit**:
  - `Groups/Index`, `Groups/Form`, `Groups/Show` and `Groups/Players` now use `RetroAppShell` and Retro UI components instead of the default Breeze/Laravel UI.
  - Table views migrated to `RetroTable` to better match the reference design and maintain consistent column sizing and horizontal overflow on mobile where needed.
- **Group details and invites**:
  - `GroupDetailsSection` reworked to match the retro info card style and to display human-readable weekdays.
  - Group invite section wrapped in a `RetroAccordion` with titles matching the link state (active/inactive).
  - Group players section enhanced with the new roster grid and retro-styled players table.
- **Typography and spacing**:
  - Text sizes across the Retro components adjusted so the previous `text-lg` behaves as the new base size, with other sizes scaled proportionally.
- **Routing and redirects**:
  - Player removal now keeps the user on the players management screen when the action originates there, and falls back to the group show page otherwise.

### Tooling and DX

- Added `code-style` rule documentation under `.cursor/rules` to guide future changes in this repo.
- New utilities under `resources/js/utils` (`datetime`, `group`, `phone`) to centralize common formatting and parsing logic.

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
