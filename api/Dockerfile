FROM node:22-slim AS deps
WORKDIR /app

# Install dependencies for workspaces
COPY package.json package-lock.json tsconfig.json ./
COPY api/package.json api/package.json
COPY api/prisma api/prisma
COPY shared/package.json shared/package.json
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY shared ./shared
COPY api ./api

RUN npm run build --workspace=shared \
  && npm run db:generate --workspace=api \
  && npm run build --workspace=api

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Prisma engines need OpenSSL at runtime.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Only runtime artifacts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared ./shared
COPY --from=build /app/api/package.json ./api/package.json
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/prisma ./api/prisma

EXPOSE 3000
CMD ["node", "api/dist/index.js"]
