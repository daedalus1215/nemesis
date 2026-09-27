# Spec 1 — Theme context, MUI theme switch, menu toggle

**Depends on Spec 0.**

## Goal

The user picks Light / Dark / Auto from the avatar menu; the choice applies
immediately app-wide, survives reload, and Auto follows the OS live.

## Commits (one git commit each, in order)

### Commit 1 — `refactor(theme): build MUI themes from a mode`

[`context/theme.tsx`](../../frontend/src/context/theme.tsx):

- Extract the current palette into shared brand constants; export
  `buildTheme(mode: 'light' | 'dark'): Theme`.
- `buildTheme('dark')` must produce **exactly** today's theme (no behavior
  change); `buildTheme('light')` uses the light values from Spec 0 Commit 1
  (same green/purple hue family, white surfaces, `colorScheme: 'light'`).

### Commit 2 — `feat(theme): theme context with auto mode and persistence`

New `context/theme-context.tsx` (provider + hook):

- State `mode: 'light' | 'dark' | 'auto'`, persisted to `localStorage`
  (key `nemesis.theme`); default when absent: `'dark'`.
- `resolvedMode = mode === 'auto'
  ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
  : mode`, recomputed live via a `matchMedia` change listener while
  `mode === 'auto'`.
- On `resolvedMode` change, set `data-theme={resolvedMode}` on the `#root`
  element (drives the `index.css` tokens).
- `ThemeProvider theme={useMemo(() => buildTheme(resolvedMode), [resolvedMode])}`.
- [`main.tsx`](../../frontend/src/main.tsx): wrap the app in the new
  provider, replacing the static `ThemeProvider theme={theme}`; keep
  `CssBaseline`.

### Commit 3 — `feat(theme): theme items in the avatar menu`

[`BaseAppBar.tsx`](../../frontend/src/components/BaseAppBar/BaseAppBar.tsx):

- Above the existing "Sign Out" item, add three `MenuItem`s — *Light*,
  *Dark*, *Auto* — with `@mui/icons-material` icons (`LightMode`,
  `DarkMode`, `AutoAwesome`).
- The active mode shows a check/radio indicator; selecting one closes the
  menu and updates the context.

## Acceptance criteria

- Switching modes restyles the whole app immediately — MUI components and
  CSS-module pages alike — including the landing/login pages (they are inside
  the provider).
- Reload restores the stored choice; with `localStorage` cleared, the app is
  dark.
- In Auto: OS light → light theme; flipping the OS theme while the app is
  open flips the app without a reload.

## Out of scope

- Custom palettes or per-page themes.
- Native OS form-control styling beyond the CSS `color-scheme` property.

## Tests

- No frontend test runner exists today; verify manually via the acceptance
  criteria (including the live OS-flip case in Auto).
