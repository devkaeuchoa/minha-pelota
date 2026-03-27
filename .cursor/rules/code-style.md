---
description: Code style and formatting conventions for the minha-pelota project. Apply to all frontend files (JS, JSX, TS, TSX).
globs: ['resources/js/**/*.{ts,tsx,js,jsx}']
---

# Code Style

## Indentation

All frontend code (JS/TS/JSX/TSX) MUST use **2 spaces** for indentation, matching the project's Prettier configuration (`tabWidth: 2` in `.prettierrc.json`).

Do NOT use 4-space indentation in frontend files. This is the single most important formatting rule.

## Reference

The full Prettier config is in `.prettierrc.json`:

- `tabWidth: 2`
- `printWidth: 100`
- `singleQuote: true`
- `trailingComma: "all"`
- `semi: true`
- `arrowParens: "always"`

When generating or editing frontend code, follow these settings exactly.

## Retro UI Components

All new or updated components inside `resources/js/Components/retro/` MUST use CSS Modules for styling.

- Prefer `ComponentName.module.css` in the same folder as the component.
- Import styles as `import styles from './ComponentName.module.css';`.
- Avoid adding new Tailwind utility classes directly in Retro UI component markup.
- If a Retro UI component still uses inline utility classes from legacy code, migrate it to CSS Modules whenever that component is touched.
