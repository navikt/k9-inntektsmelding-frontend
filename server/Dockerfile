FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim

WORKDIR /app

COPY server/package.json ./
COPY node_modules ./node_modules
COPY server/dist ./dist
# Kun index.html. JS, CSS og source maps lastes fra cdn.nav.no
COPY app/dist/index.html ./public/index.html

EXPOSE 8080
CMD ["dist/index.js"]
