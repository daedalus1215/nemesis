# Spec 1 — Frontend: settings page

## Goal

A `/settings` page behind the auth guard with Change Username, Change
Password, and Appearance (light / dark / auto) sections, reachable from the
sidebar on desktop and from the top-bar avatar on every viewport.

## Decisions

- Layout follows the chronus/omega "Account Settings" page (title,
  subtitle, one card per section) in nemesis's CSS-modules style.
- Username change requires the current password; on success the user is
  logged out and navigated to `/login` (the JWT still holds the old name —
  same flow as chronus).
- The theme section reuses `useThemeMode()` — Light / Dark / Auto buttons
  with the active one checked. Same state as the top-bar `ThemeToggle`, so
  both stay in sync automatically; no new persistence.
- No sign-out button on the page (the shell already has two).

## Commits (one git commit each, in order)

### Commit 1 — `feat(frontend): settings page with username, password, theme`

New `pages/SettingsPage/`:

- `SettingsPage.tsx` + `SettingsPage.module.css` — "Account Settings"
  heading + subtitle, then the three section cards.
- `components/ChangeUsernameForm/` — new username + current password fields.
  Client-side validation: 3–20 chars, current password non-empty. On
  success: `logout()` + `navigate('/login', { replace: true })`. On error:
  show the API error message.
- `components/ChangePasswordForm/` — current / new / confirm fields.
  Client-side validation: new/confirm match, 8+ chars with an upper, lower,
  number and special character (same rule as registration, stated in the
  helper text). On success: inline success message; the session is kept.
- `components/ThemeSettings/` — three Light / Dark / Auto buttons bound to
  `useThemeMode()`, active one highlighted.
- `hooks/useUpdateUsername.ts` + `hooks/useUpdatePassword.ts` — plain axios
  via the shared `api` instance (the same state-hook style as
  `useFetchInvoices`, not react-query).
- `api/urls.ts`: `UPDATE_USERNAME_URL = '/users/username'`,
  `UPDATE_PASSWORD_URL = '/users/password'`.

### Commit 2 — `feat(frontend): route and nav entry for settings`

- `App.tsx`: `<Route path="/settings" element={<SettingsPage />} />` in the
  authenticated block. Unauthenticated visitors hit the existing `*`
  redirect to `/login`.
- `AppShell.tsx`:
  - `navItems` gains `{ label: "Settings", to: "/settings", icon: <Settings /> }`
    (MUI `Settings` icon) — last in the sidebar list.
  - The top-bar avatar is wrapped in `<Link to="/settings">` with a
    `title="Settings"` (mobile entry point; the sidebar is hidden there).
- `BottomNavigation` unchanged — the five keys stay.

## Acceptance criteria

- `/settings` renders while signed in; hitting it while signed out
  redirects to `/login` (existing catch-all).
- Username: correct current password + a free name → the user lands on the
  login page; signing in with the new name works and the sidebar/top bar
  show the new name.
- Password: a valid change shows the inline success message, the old
  password no longer logs in, the new one does, and the session is not
  dropped (the user is still on `/settings`).
- Theme: picking Light / Dark / Auto on the page re-themes the app
  immediately, matches the top-bar toggle's active item, and survives a
  reload (existing `localStorage` persistence).
- Sidebar shows the Settings item on desktop; on a narrow viewport the
  top-bar avatar links to `/settings`.

## Out of scope

- No backend changes (Spec 0).
- No email or other profile fields.

## Tests

- No frontend test suite exists in this repo; verify with the production
  build + a live E2E pass on dev with both accounts (issuer and recipient),
  covering: rename + re-login, password change + re-login, each theme
  mode, and mobile-width nav.
