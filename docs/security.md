# Security and privacy

## Administrative access

The old app decoded client-supplied bearer tokens without verifying the signature. The replacement issues a random 256-bit session token after successful authentication, stores its SHA-256 digest in SQLite, and sends the token in an HttpOnly, SameSite=Lax cookie. Sessions expire after seven days and logout revokes them. HTTPS origins use Secure cookies. Use HTTPS for hosted deployments.

Bootstrap requires the configured setup token. Within a write transaction, the store checks that the users table is empty before creating the first account. New passwords must contain at least 12 characters and fit bcrypt's 72-byte limit. Existing bcrypt hashes remain valid. SQLite tracks login attempts per username and per trusted address over a 15-minute window. Without an address, sign-ins share the address limit.

Admin API routes derive the owner from the session and bind that ID in SQL. They require the configured public origin on mutations, accept JSON, and limit request bodies to 64 KiB. Redirects validate stored destinations as well as new ones. Security headers prevent framing, disable embedded objects and MIME sniffing, and omit the referrer.

## Visitor attribution

By default, a GET records a visit and its user agent. Its visitor ID and location are unknown. To enable unique-IP counts, place the server behind a trusted reverse proxy and set `TRUST_PROXY=true`. Only the proxy should be able to reach the application port.

The proxy must **replace** any incoming `X-Forwarded-For` with the verified client IP. It must also remove or replace `X-Visitor-Country` and `X-Visitor-City`. Country and city are optional. An nginx proxy that receives traffic directly from visitors can set these headers as follows.

```nginx
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header X-Visitor-Country "";
proxy_set_header X-Visitor-City "";
```

If another proxy sits in front of nginx, configure its verified client-address handling first. The app takes the first forwarded address when trust is enabled.

The store normalizes the IP and hashes it with HMAC-SHA-256 using a random key stored in the database. The admin view shows a shortened visitor ID. Unique counts use the complete digest and exclude missing or invalid addresses. People behind one IP count once, and one person using different IPs can count several times.

Migration converts the logical values of historical IPs in place. Protect old backups, database journals, the database key, stored user agents, and location data. Deleting a link removes its visit rows in the same transaction.
