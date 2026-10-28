# Offline layer

Lets the desktop and Android apps show what was last loaded while Nemesis
can't be reached. Read-only: nothing is queued to send later.

Ported from Omega's (`omega/frontend/src/offline/`, itself a copy of
Chronus's), keeping its file names and comments where the code is the same,
so a fix in one is easy to carry to the others.

## What's the same

- `offline-adapter.ts`, the read half: successful GETs are stored by URI and
  replayed verbatim when the backend is unreachable, rate-limited, or behind
  a Cloudflare Access rejection; once a request finds the backend
  unreachable, reads are answered locally at once while one goes out in the
  background to notice it coming back.
- `offline-errors.ts` (the Cloudflare helpers live in
  `src/tauri/cloudflare-access.ts`), `sync-status.ts`,
  `query-client-defaults.ts`.
- The IndexedDB database is `nemesis-offline`. **Never rename it**: that
  orphans what's stored on devices.

## What's different

- **No outbox.** Omega queues writes made offline and replays them later.
  Nemesis moves money: a transfer replayed hours later runs against balances
  that may have moved on. So the adapter's write half sends or refuses:
  while the backend seems unreachable a write is refused without being sent
  (`WRITE_REFUSED_OFFLINE`), and one that's sent and gets no answer says it
  may have gone through (`WRITE_UNANSWERED`). Writes get no default timeout,
  so the app never gives up on one the server might still carry out. With
  the outbox go temp ids, offline routes, the flusher, and Omega's
  cross-tab locks and channel (the apps have one window).
- **An expired session isn't ridden out.** A 401 signs out as it does on the
  web; the stored data stays for the same user's next login.
- **Only JSON is stored**, so a captive portal's page can't replace real data.
- `offline-reads.ts` answers an invoice's or recurring invoice's detail from
  the stored list, when the list is the newer copy: the backend maps both
  the same way.
- `offline-store.ts` keeps only `responses` and `meta`.
- `prefetch.ts` replaces `prefetch-calendar.ts`: the same one-at-a-time run
  that stops at the first sign of trouble, fetching what Nemesis's screens
  show. The list pages and it build their queries with the same helpers
  (`invoice-filters.ts`, `recurring-invoice-filters.ts`,
  `accountPaymentsParams`), since stored answers are keyed by exact URI.
- `install-offline-support.ts` keeps Omega's ownership rule (another user's
  data is deleted at login) and schedule (every 30 minutes, at once when the
  server comes back), without the flusher. Sign-out deletes everything; a
  generation counter keeps answers already on their way from being stored
  after that. `offline-data.ts` is how login, sign-out and Settings reach it
  without pulling IndexedDB into the web bundle.
