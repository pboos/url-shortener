# Working on this repository

Use Node.js 24.13 or newer and install the lockfile with `npm ci`. Start the app with `npm run dev`. Use a disposable `DATABASE_PATH` for tests and verification.

Read the guide for the area you are changing.

| Task                                                                    | Read first                                                                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Understand request flow, change an API, or build an admin screen        | [Architecture](docs/architecture.md)                                                               |
| Change SQLite, visit counting, or migration behavior                    | [Architecture](docs/architecture.md) and [upgrade procedure](docs/operations.md#upgrade-from-nuxt) |
| Change authentication, validation, proxy handling, or analytics privacy | [Security](docs/security.md)                                                                       |
| Configure, deploy, release, back up, or roll back the service           | [Operations](docs/operations.md)                                                                   |
| Run locally or check a change                                           | [README](README.md)                                                                                |

Use the shadcn/ui primitives in `components/ui/` for shared controls. Keep screen-specific layout in colocated CSS modules. See [UI conventions](docs/architecture.md#ui-conventions) before adding a component. Share response types through `lib/contracts.ts`. Scope admin queries by the session user in SQL. Add a migration test whenever a change affects existing databases.

Before submitting a change, run the checks listed in the README. For an admin change, exercise its normal browser flow. Update the corresponding guide when the behavior or operating requirements change.
