FROM node:20 as build
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build
RUN cp -r node_modules/geoip-lite/data .output/server/node_modules/geoip-lite/


FROM node:20-slim as app
WORKDIR /app
COPY --from=build --chown=node:node /app/.output /app
COPY --from=build --chown=node:node /app/server/db/migrations /app/server/db/migrations
EXPOSE 3000
CMD [ "node", "server/index.mjs" ]
