# Dotenv Manager

Developer-first tool to **manage `.env` variables across multiple projects and environments** from a **CLI** and an optional **Web UI**.

This repository is an npm workspaces monorepo:

- `api/`: Express + TypeScript REST API + Prisma (PostgreSQL)
- `cli/`: Node.js CLI (`dm`) for day-to-day operations
- `web/`: Angular app (optional UI)

## Features (high level)

- Centralized management of environment variables per project and per environment (dev/staging/prod/custom)
- Secrets encrypted at rest (AES-256-GCM)
- Diff / sync workflows (push & pull) from the CLI
- Optional web dashboard/editor

## Requirements

- Node.js (recommended: latest LTS)
- npm
- Docker (optional, for local Postgres)

## Quick start

Install dependencies from the repo root:

```bash
npm install
```

### 1) Start Postgres (Docker)

```bash
docker compose up -d
```

### 2) Configure and run the API

```bash
cp api/.env.example api/.env
npm run dev:api
```

In a separate terminal, run database migrations:

```bash
npm run db:migrate --workspace=api
```

### 3) Run the web app (optional)

```bash
npm run dev:web
```

By default, the UI expects the API at `http://localhost:3000` and serves on `http://localhost:4200`.

### 4) Build everything

```bash
npm run build
```

## Common scripts

From repo root:

```bash
npm run dev
npm run build
npm run test
npm run lint
```

Per workspace:

```bash
npm run dev --workspace=api
npm run dev --workspace=cli
npm run dev --workspace=web
```

## Configuration & secrets

- Do **not** commit real `.env` files. This repo ignores `.env*` by default (see `.gitignore`).
- Use `api/.env.example` as a template.

## Docs

- Requirements / functional spec: `REQUISITI.md`
