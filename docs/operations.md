# Operate the shortener

## Docker

Run one container behind an HTTPS reverse proxy. Set the public origin to the exact URL that browsers use. A named volume keeps the database across container replacements.

```sh
export SETUP_TOKEN="$(openssl rand -hex 32)"
docker run -d --name shortener --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  -v shortener-data:/app/data \
  -e PUBLIC_BASE_URL=https://go.example.com \
  -e SETUP_TOKEN \
  ghcr.io/pboos/url-shortener:development
```

Retrieve the token from the shell where you generated it and use it at `/admin/setup`. After the first account exists, you can remove the variable when replacing the container. Use a version tag for a reproducible deployment. A `v*` release must have been published for that tag or `latest` to exist.

| Variable            | Purpose                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PUBLIC_BASE_URL`   | HTTP or HTTPS origin used for short links, QR codes, and browser origin checks. Defaults to `http://localhost:3000`. Set it explicitly in production.                                |
| `ROOT_REDIRECT_URL` | Optional absolute HTTP or HTTPS destination for `/`, without embedded credentials. Unset, blank, or invalid values return a plain 404. Valid values return 302 for GET and HEAD.     |
| `DATABASE_PATH`     | SQLite filename. Defaults to `./data/sqlite.db`, which resolves to `/app/data/sqlite.db` in Docker.                                                                                  |
| `SETUP_TOKEN`       | Server-generated secret required to register the first account. Existing accounts sign in without it.                                                                                |
| `TRUST_PROXY`       | Defaults to `false`. Enable only behind a proxy that overwrites the visitor headers and blocks direct access to the app. See [visitor attribution](security.md#visitor-attribution). |
| `HOSTNAME`, `PORT`  | Bind address and port for the standalone server. The image listens on `0.0.0.0:3000`.                                                                                                |

For example, set `ROOT_REDIRECT_URL=https://www.example.com/welcome` and restart the server. The redirect preserves the destination's own query string and fragment and discards query parameters from the incoming request.

Give SQLite a persistent local filesystem with working file locks. The runtime process uses UID and GID 1000 and needs write access to the database directory, the database file, and SQLite's journal files.

## Upgrade from Nuxt

1. Record the current image and volume or bind-mount path. Stop the old app so it cannot write during the cutover.
2. Back up the old database. For example, run the following commands from the directory containing the old `data/` mount. Create the backup outside that mount.

   ```sh
   umask 077
   mkdir -p backups
   sqlite3 data/sqlite.db ".backup 'backups/pre-next.sqlite.db'"
   sqlite3 backups/pre-next.sqlite.db 'PRAGMA integrity_check; SELECT count(*) FROM users; SELECT count(*) FROM links; SELECT count(*) FROM visits;'
   ```

   Expect `ok` followed by the three row counts. Keep this backup private. It contains the historical IP addresses and password hashes.

3. Rehearse on a copy of the backup. Point `DATABASE_PATH` at the copy or mount its directory at `/app/data` with the copy named `sqlite.db`. On Linux, give UID 1000 write access to that dedicated directory and its files. For example, use `sudo chown -R 1000:1000 /path/to/shortener-data` after verifying the path. Old containers ran as root.
4. Start the new app and visit `/admin`. The first database access runs the migration inside a transaction. Large visit histories take longer because the migration rewrites the IP column and builds indexes. Confirm the row counts before opening any short links. Sign in with an existing account and check a known link, its QR settings, and its history. A `HEAD` request can check the destination without adding a visit.
5. Deploy against the original mount with the same public domain. Keep `PUBLIC_BASE_URL` set. The old `NUXT_APP_BASE_URL` and `NUXT_BASE_URL` are accepted as fallbacks. Old bearer tokens expire at cutover. Users sign in again and the service no longer needs `NUXT_JWT_SECRET`.

Existing keys, bcrypt password hashes, counters, visit times and stored QR blobs carry over. The studio reads legacy dot styles and colors. Upload a raster copy of a legacy linked logo to embed it in new exports. Advanced legacy gradients, corner settings, and logo dimensions take the new studio defaults. Editing a destination preserves the original QR blob. Saving a QR design replaces that blob. Existing printed codes continue to resolve through the same short URL.

Only HTTP and HTTPS destinations without embedded credentials can redirect. Owners can edit older unsupported destinations in the admin interface.

### Roll back

Stop the new container. Retain its data directory separately if it has accepted writes. Restore the pre-upgrade backup as `sqlite.db` in a clean data directory and start the old image against it. This restores the state at backup time. Reconcile any links created after the backup before switching traffic back. The historical IP conversion is one-way.

## Image publishing

The checks run on pull requests, on pushes to `main`, and on Git tags beginning with `v`. After checks pass, eligible push jobs build the Docker image, start it as the runtime user, and check the setup endpoint before publishing.

| Git event                          | GHCR tags                         |
| ---------------------------------- | --------------------------------- |
| Pull request                       | No image build or push            |
| Push to `main`                     | `development`                     |
| Push Git tag, for example `v2.0.0` | `development`, `v2.0.0`, `latest` |

Pushing a release tag updates all three tags to that release commit. Release names must also be valid container tags. Publishing uses the repository's GitHub Actions token with package write permission scoped to the publish job.
