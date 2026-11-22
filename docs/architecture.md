# Architecture

## Routes and components

Next.js App Router runs on Node.js. The admin pages render per request because setup and sessions depend on the live SQLite database. The server reads the configured public origin once per page request. The client uses that origin when displaying or copying links and generating QR codes.

| Route                                    | Responsibility                                                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                      | Open the admin workspace.                                                                                                                          |
| `/[key]`                                 | Resolve an HTTP(S) destination. GET records a visit and returns a temporary redirect. HEAD returns the same destination without recording a visit. |
| `/admin`, `/admin/[key]`                 | Search and manage links, inspect visit history, edit QR designs, or delete a link with confirmation.                                               |
| `/admin/setup`, `/admin/login`           | Bootstrap a new database or sign in to an existing account.                                                                                        |
| `/api/setup`, `/api/auth`, `/api/logout` | Read setup status, create the first account, and issue or revoke a session.                                                                        |
| `/api/links`                             | List the signed-in owner's links or create one. GET accepts `q`, `page`, and `pageSize`.                                                           |
| `/api/links/[key]`                       | Read, patch, or delete one owned link. Changing a key changes the public URL and keeps its history.                                                |
| `/api/links/[key]/visits`                | Return lifetime totals, daily counts for the last seven UTC calendar days, and a page of visits in reverse chronological order.                    |

## UI conventions

Admin screens compose the shadcn/ui primitives in `components/ui/`. Buttons, tables, form controls, dialogs, and cards share the theme in `app/globals.css`. The generated TypeScript files are part of this repository. To add a primitive, run `npx shadcn@4.23.0 add <component>` from the repository root and review the generated diff. `components.json` selects the New York style and the existing Lucide icon set.

Tailwind CSS 4 generates the primitive styles at build time. Keep screen-specific layout and media queries in CSS modules beside their components. `components/qr/` renders and exports codes in the browser with `qr-code-styling`, using the short URL as the payload. The QR module handles logo resizing locally. `app/globals.css` contains shared design tokens and base styles.

## Data and boundaries

`lib/contracts.ts` defines the response shapes used by React and the API. Route handlers authenticate, validate external input, and delegate to `lib/store.ts`. `lib/http.ts` handles errors, request limits, and origin checks. `lib/auth.ts` owns session cookies. `lib/qr.ts` parses current designs and interprets legacy QR JSON.

The store opens SQLite lazily through Node's built-in driver. It enables foreign keys, WAL and a busy timeout. Every admin link query includes the owner ID. A public GET inserts the visit and increments the counter in one transaction. Historical counters are preserved even if a legacy counter differs from the number of stored visit rows.

A version in `app_migrations` records each successful schema upgrade. Add future versions in order within the same transaction as their data changes and version marker. Preserve the original schema in `tests/fixtures/legacy.sql` so tests continue to start from the Nuxt database.

## Verify changes

`tests/store.test.ts` exercises migration, one-time setup, owner scoping, search, counter rollback, and visit statistics with actual SQLite databases. `scripts/verify-http.mjs` boots the production build against fresh and legacy fixtures and drives the HTTP routes, including logout, expiry, throttling, and trusted-proxy behavior.

For a UI change, create a link, search for its destination, copy the short URL, follow it, and inspect its visit timestamp. Save a QR design, reload, download an image, and scan it. Check the same screens at a narrow viewport.
