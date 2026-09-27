# Spec 0 — Light palette: token set + tokenize hardcoded hex

## Goal

With `#root[data-theme='light']`, every page renders a correct, readable
light theme. Dark mode is pixel-identical to today.

## Commits (one git commit each, in order)

### Commit 1 — `feat(theme): light-mode color tokens`

[`index.css`](../../frontend/src/index.css):

- Keep the current token block as the default `#root` set; scope it
  explicitly (`#root[data-theme='dark']`) and move `color-scheme` per mode
  (dark → `dark`, light → `light`) instead of today's `light dark`.
- Add the light override `#root[data-theme='light'] { … }`:
  - Surfaces: `--color-background: #fafafa; --color-surface: #ffffff;
    --color-surface-2: #f1f3f4; --color-card: #ffffff; --color-sidebar: #f5f5f5;`
  - Text: `--color-text-primary: #1f1f1f; --color-text-secondary: #5f6368;
    --color-muted: #9aa0a6;`
  - Lines/shadow: `--color-divider: #dadce0; --color-border: #dadce0;
    --color-shadow: rgba(0, 0, 0, 0.12);`
  - Brand (same hue family, contrast-safe on white): darker green primary
    (e.g. `--color-primary: #3f8f1f; --color-primary-light: #5aa832;
    --color-primary-dark: #2f6f14`) and a darker purple secondary for
    text/fills (e.g. `#a13390`).
  - Semantic status tokens (`--color-success/-error/-info/-warning`) stay;
    verify each is readable on white.

### Commit 2 — `refactor(css): replace hardcoded dark hex values with tokens`

- The ~43 hardcoded hex lines across `*.module.css` are replaced with the
  `var(--color-*)` tokens from `index.css`. Where a value is genuinely new
  (e.g. a shadow tint), add a token to `index.css` with both dark and light
  values.
- Mechanical change: in dark mode every replaced value equals today's token
  value, so there is **no visual change** in dark mode.

## Acceptance criteria

- With `data-theme='light'` set on `#root`: login, landing, invoice
  list/detail, recurring list/detail, accounts list/detail, transfer pages,
  and the money page all show light surfaces, dark text, readable brand
  buttons, and visible dividers/shadows.
- Dark mode is unchanged (Commit 2 is a visual no-op in dark).

## Out of scope

- The toggle UI (Spec 1).
- Brand color changes in dark mode.

## Tests

- No CSS unit tests exist in the repo; verify manually via the acceptance
  criteria. For Commit 2, confirm the dark-mode values are byte-equivalent to
  the tokens they replace (no dark-mode visual diff).
