FROM node:22-slim AS deps
WORKDIR /app

# Install dependencies for workspaces
COPY package.json package-lock.json tsconfig.json ./
COPY web/package.json web/package.json
COPY api/prisma api/prisma
COPY shared/package.json shared/package.json
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY shared ./shared
COPY web ./web

# Work around esbuild binary/version mismatch in monorepo installs by
# forcing the workspace to use the root esbuild installation.
RUN rm -rf web/node_modules/esbuild web/node_modules/@esbuild || true

RUN npm run build --workspace=shared && npm run build --workspace=web

FROM caddy:2-alpine AS runtime
WORKDIR /srv

COPY --from=build /app/web/dist/web/browser/ /srv/
COPY web/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
