FROM node:20 as build
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build


FROM node:20-slim as app
USER node
WORKDIR /app
COPY --from=build --chown=node:node /app/.output /app
COPY --from=build --chown=node:node /app/server/db/drizzle /app/server/db/drizzle
EXPOSE 3000
CMD [ "node", "server/index.mjs" ]
