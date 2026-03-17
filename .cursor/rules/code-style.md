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
