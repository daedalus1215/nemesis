# Settings page (username, password, theme)

**Problem.** There is no place to manage the account. The username is fixed
at registration and can never be changed, there is no way to change the
password (only
[register](../../backend/src/users/app/controllers/register-user-action/register-user.action.ts)
and
[login](../../backend/src/auth/app/actions/login.action.ts) exist), and the
theme choice exists only as a small top-bar menu
([`ThemeToggle`](../../frontend/src/components/ThemeToggle/ThemeToggle.tsx)).
The sibling home-lab apps (chronus, omega) ship an "Account Settings" page
with Change Username + Change Password forms — nemesis gets the same, plus
the light/dark/auto theme choice on that page.

## Decisions (locked)

- **Endpoints mirror chronus/omega:** `PUT /users/username` and
  `PUT /users/password`, both JWT-protected, both requiring the current
  password.
- **Username change forces re-login.** The JWT payload contains
  `username` (`auth.service.ts:29`), so after a successful change the
  session is cleared and the user lands on `/login` (same as chronus).
- **Password change keeps the session** — the password is not in the JWT.
- **Validation reuses nemesis's registration rules:** username 3–20 chars
  (`register-user.request.dto.ts`); new password via the existing
  `IsPasswordStrongValidator` (8+ chars, upper/lower/number/special) — not
  chronus's looser 6–50 rule.
- **Hashing matches registration:** `bcrypt.hash` with
  `BCRYPT_SALT_ROUNDS` from config (default 12).
- **Theme on the settings page** binds to the existing `ThemeContext` —
  same state as the top-bar `ThemeToggle`, no new persistence.
- **Placement:** a *Settings* item in the sidebar (desktop) and the top-bar
  avatar becomes a link to `/settings` (reachable on mobile, where the
  sidebar is hidden). The five-key bottom nav is unchanged.
- **No sign-out button on the page** — the shell already has one in the
  sidebar footer and the top bar.
- **No migration.** The users table already has exactly the fields involved
  (id, username, password).

## Specs

| # | Spec | Depends on | Status |
|---|------|-----------|--------|
| 0 | [Backend: PUT /users/username, PUT /users/password](./spec-0-backend-user-updates.md) | — | Not started |
| 1 | [Frontend: settings page, forms, theme, nav links](./spec-1-frontend-settings-page.md) | Spec 0 | Not started |

## Shared notes

- **Stateless JWT:** changing the username does not invalidate other tabs
  holding an old token — they keep showing the old name until the token
  expires (same as chronus). There is no session store to invalidate.
- **Auth model:** `AuthUser = { userId, username }` comes from the JWT
  (`get-auth-user.decorator.ts`). Actions always operate on the token's
  `userId` — never on an id supplied by the client.
- **Commit discipline:** small commits only — each numbered commit in the
  spec files is exactly one git commit.

## Tech stack

- Backend: NestJS + TypeORM + Postgres (action → transaction-script →
  repository), jest for `__specs__`.
- Frontend: React + Vite + Material-UI + Axios + CSS modules (no frontend
  test suite — verified by build + live E2E).
