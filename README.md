# URL shortener

Self-host short links on your own domain. The admin workspace lets you search by key or destination, copy a short URL, see visits over time, and download customized QR codes as SVG or PNG. Next.js serves the React interface and redirects. SQLite stores accounts, links, QR designs, and visits.

## Run locally

Use Node.js 24.13 or newer. The Docker image and CI use Node 24.

```sh
npm ci
cp .env.example .env.local
openssl rand -hex 32
```

Set `SETUP_TOKEN` in `.env.local` to the generated value. Run `npm run dev` and open [the admin workspace](http://localhost:3000/admin). On a new database, enter that token to create the first account. An existing installation opens the sign-in page. The default database is `data/sqlite.db`.

## Check a change

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:http
npx playwright install --only-shell chromium
npm run test:browser
```

Use `npm run format` to apply formatting. The HTTP check starts the standalone production server on loopback with temporary databases. Set `TEST_PORT` if port 3197 is occupied. The browser test uses port 3198 and decodes a downloaded QR code.

## Guides

- [Operations](docs/operations.md) covers Docker, environment variables, backups, upgrading from Nuxt, and image tags.
- [Architecture](docs/architecture.md) maps the routes, contracts, storage, and tests.
- [Security](docs/security.md) explains access control and how to configure visitor attribution.
- [Contributor instructions](AGENTS.md) point coding agents to the guide for each task.
