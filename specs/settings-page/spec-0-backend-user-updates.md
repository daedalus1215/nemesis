# Spec 0 — Backend: username and password updates

## Goal

A signed-in user can change their username and password via two protected
endpoints. Both require the current password; both operate only on the
account named by the JWT.

## Decisions

- Endpoints mirror chronus/omega: `PUT /users/username` and
  `PUT /users/password`.
- Validation matches nemesis's registration rules (username 3–20; new
  password via `IsPasswordStrongValidator`).
- Self-service only: the target id is the token's `user.userId` — no client
  id is accepted or checked (chronus's `user.userId !== userId` guard is
  dead code there because its action fills the command from the same token;
  nemesis does not carry the redundant field).
- A wrong current password is `400`, not `401`: the session is valid and
  only the input is wrong. The frontend's global axios handler treats any
  `401` as "session expired" — it clears the token and hard-redirects to
  `/login` — which would hide the form error and log the user out.
  (Missing/invalid tokens still get `401` from the guard.)

## Commits (one git commit each, in order)

### Commit 1 — `feat(users): update-username action (PUT /users/username)`

New `users/app/actions/update-username-action/` (action, request DTO,
swagger) + `users/domain/transaction-scripts/update-username-TS/` (command
+ transaction script).

- `UpdateUsernameRequestDto`: `newUsername` (`IsString`, 3–20),
  `currentPassword` (`IsString`).
- `UpdateUsernameCommand`: `{ userId: number; newUsername: string; currentPassword: string }`.
- TS rules, in order:
  1. Load user by `userId` via `findByIdWithPassword` — the password column
     is `select: false` on the entity, so a plain `findById` returns no
     hash — `404` if missing.
  2. Trimmed `newUsername` outside 3–20 chars → `400`.
  3. Trimmed name equals current username → `400`
     "New username must be different from current username".
  4. `findByUsername(trimmed)` returns *another* user → `409`
     "Username already exists".
  5. `bcrypt.compare(currentPassword, user.password)` fails → `400`
     "Current password is incorrect".
  6. `repository.update(userId, { username: trimmed })`.
  7. Return the projection `{ id, username }` — no password.
- Action: `@Controller('users')`, `@Put('username')`, `@HttpCode(200)`,
  `@ProtectedAction(UpdateUsernameSwagger)`, body DTO + `@GetAuthUser()`.
- `UsersService.updateUsername(command)` delegates to the TS.
- Register the action + TS in `users.module.ts`.

### Commit 2 — `feat(users): update-password action (PUT /users/password)`

New `users/app/actions/update-password-action/` +
`users/domain/transaction-scripts/update-password-TS/`.

- `UpdatePasswordRequestDto`: `currentPassword`, `newPassword`,
  `confirmPassword` (all `IsString`).
- Action rejects `newPassword !== confirmPassword` → `400`
  "New password and confirmation password do not match", then delegates.
- TS rules, in order:
  1. Load user by `userId` → `404`.
  2. `bcrypt.compare(currentPassword, ...)` fails → `400`.
  3. `bcrypt.compare(newPassword, ...)` succeeds → `400`
     "New password must be different from current password".
  4. `IsPasswordStrongValidator.apply(newPassword)` → `400` (reused from
     `create-user-ts/validators/`).
  5. `bcrypt.hash(newPassword, configService.get('BCRYPT_SALT_ROUNDS', 12))`
     — same salt rounds as registration.
  6. `repository.update(userId, { password: hashed })`; return `void`.
- Action returns `{ success: true }` on `200`.
- Wire through `UsersService`; register in `users.module.ts` (the validator
  is already a provider there).

## Acceptance criteria

- `PUT /users/username` with the correct current password and a free 3–20
  char name → `200` with `{ id, username }` showing the new name; login with
  the new name works and the old name no longer logs in.
- Rejected: wrong current password (`400`), name already taken (`409`),
  same name (`400`), name under 3 or over 20 chars (`400`), missing token
  (`401`).
- `PUT /users/password` with matching new/confirm, a correct current
  password, and a strong new password → `200 { success: true }`; login with
  the old password fails, the new one works; the existing JWT stays valid
  (session kept).
- Rejected: wrong current password (`400`), mismatched confirmation (`400`),
  weak new password (`400`), new password identical to current (`400`).

## Out of scope

- No UI (Spec 1).
- No email or other profile fields — the user has exactly id, username,
  password.
- No invalidation of existing tokens (stateless JWT).

## Tests

- `update-username-TS/__specs__/update-username.transaction.script.spec.ts`:
  happy path; missing user; same name; uniqueness conflict; wrong current
  password; short name.
- `update-password-TS/__specs__/update-password.transaction.script.spec.ts`:
  happy path; missing user; wrong current password; weak new password; new
  equals current.
- Follow the existing `__specs__/*.spec.ts` convention (jest, mocked
  repository).
