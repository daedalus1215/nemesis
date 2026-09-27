# Theme toggle (light / dark / auto)

**Problem.** The theme is hard-coded dark:
[`theme.tsx`](../../frontend/src/context/theme.tsx) sets `mode: 'dark'`, and
there is no light palette, no persistence, and no way to switch. The app's
CSS is already tokenized — ~26 of 33 CSS files reference the
`var(--color-*)` tokens defined in
[`index.css`](../../frontend/src/index.css) — so light mode is a second
token set plus a handful of hardcoded values, not a rewrite.

## Decisions (locked)
- **Placement:** the live top bar is the
  [`AppShell`](../../frontend/src/components/AppShell/AppShell.tsx) header —
  `BaseAppBar` turned out to be dead code (imported nowhere), so the toggle
  ships as a *Theme: …* button there opening *Light* / *Dark* / *Auto* with
  a check on the active one. No new page.
- **Auto:** follows the OS `prefers-color-scheme` **live** — a `matchMedia`
  listener, so flipping the OS theme while the app is open is reflected
  immediately.
- **Persistence:** the choice is stored in `localStorage`; the default for
  users who never choose is **dark** — exactly today's behavior, so nobody
  gets a surprise light flash.
- **Light palette:** brand hues are kept, but the bright green `#8be75f`
  fails contrast on white, so light mode uses a darker green primary (and a
  darker purple secondary for text/fills). Surfaces are white / `#f5f5f5`,
  text near-black.
- **Tokenization:** the ~43 hardcoded dark hex values in module CSS are
  replaced with tokens — they would break in light mode anyway.

## Specs

| # | Spec | Depends on | Status |
|---|------|-----------|--------|
| 0 | [Light palette: token set + tokenize hardcoded hex](./spec-0-light-palette-tokens.md) | — | Done |
| 1 | [Theme context, MUI theme switch, menu toggle](./spec-1-theme-context-toggle.md) | Spec 0 | Done |

## Shared notes

- The MUI palette and the CSS tokens express the **same** brand values; the
  light sets must stay in lockstep across `theme.tsx` and `index.css`.
- `@mui/icons-material` is already a dependency (icons for the menu items).
- Theme tokens are scoped to `#root`; `data-theme` is set on
  `document.documentElement` (the CSS `:root[data-theme="light"]` selectors
  key off the html element, which is also where the pre-paint default
  lives).

## Tech stack

- Frontend only: React + Vite + Material-UI v7 + CSS modules with custom
  properties. No backend changes.
