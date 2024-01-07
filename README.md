# URL Shortener service

URL Shortener service setup with Nuxt.js with a local sqlite database using drizzle.

## Docker

Run this on your server using docker:
```bash
docker run --rm \
  -p 3000:3000 \
  -env NUXT_JWT_SECRET=mysecret \
  -env NUXT_APP_BASE_URL=https://mydomain.com/ \
   -v $(pwd)/data:/app/data pboos/url-shortener
```

Or docker-compose:
```bash
version: '3.1'

services:
  pes-url-shortener:
    image: pboos/url-shortener
    restart: unless-stopped
    volumes:
      - /data/pes.ch/url-shortener-data:/app/data
    environment:
      NUXT_JWT_SECRET: 0a1b1709a744d5de86bf96909351ec1fcec769cbce49e146ac69b3a95736acbb
      NUXT_BASE_URL: https://pes.ch/
```

## Env variables

- `NUXT_JWT_SECRET` (optional)
  - Defines the secret used to sign JWT tokens.
- `NUXT_APP_BASE_URL` (optional)
  - Defines the base URL of the application. Defaults to `/`.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

### Drizzle

Generate migrations

```bash
npm exec drizzle-kit generate:sqlite --out migrations --schema db/schema.ts
```

Push migrations to database

```bash
npm exec drizzle-kit push:sqlite
```

Start Drizzle Studio (graphical UI to manipulate DB)

```bash
npm exec drizzle-kit studio
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
