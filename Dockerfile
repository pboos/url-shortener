FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
LABEL org.opencontainers.image.source="https://github.com/pboos/url-shortener"
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
RUN mkdir -p data .next/cache && chown node:node data .next/cache
USER node
EXPOSE 3000
CMD ["node", "server.js"]
