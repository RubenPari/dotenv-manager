# Repository Guidelines

## Project Structure & Module Organization

This npm workspaces monorepo contains four packages:

- `api/` — Express + Prisma REST API (`src/`, `prisma/`, `test/`)
- `cli/` — Node.js CLI (`src/`, `test/`)
- `web/` — Angular 21 SPA (`src/app/`, `public/`, `test/`)
- `shared/` — Zod schemas and utilities (`src/`), published to npm

Source code is in each workspace's `src/`. Tests are co-located or in `test/`. Build outputs go to `dist/` and are git-ignored.

## Build, Test, and Development Commands

Run from the repo root:

```bash
npm install       # Install workspace dependencies
npm run dev       # Start API + Web concurrently
npm run dev:api   # API with tsx watch
npm run dev:web   # Angular dev server (localhost:4200)
npm run build     # Build shared → api → cli → web
npm run test      # Run all workspace tests
npm run lint      # Lint all workspaces
npm run typecheck # TypeScript project-wide check
npm run format    # Auto-format with Prettier
```

API requires a local Postgres instance. Run `docker compose up -d` before migrations (`npm run db:migrate --workspace=api`).

## Coding Style & Naming Conventions

- **Language:** TypeScript (ES2022, strict mode).
- **Formatting:** Prettier (`singleQuote`, `trailingComma: all`, `printWidth: 100`).
- **Linting:** ESLint with `typescript-eslint`.
  - `no-explicit-any` is an error.
  - Unused args are allowed if prefixed with `_`.
- **Naming:** `camelCase` for variables/functions, `PascalCase` for classes/types, `kebab-case` for files. Angular components use `.component.ts`, `.service.ts`, etc.

## Testing Guidelines

- **API/CLI/Shared:** Jest with `ts-jest`. Coverage outputs to `coverage/`.
- **Web:** Vitest for unit tests; Playwright for E2E.
- Run per workspace:
  ```bash
  npm run test --workspace=api
  npm run test:e2e --workspace=api
  npm run e2e --workspace=web
  ```
- Tests must be deterministic and not rely on unmocked external services.

## Commit & Pull Request Guidelines

- Follow **Conventional Commits**: `type(scope): description`
  - Types: `feat`, `fix`, `chore`, `test`, `refactor`
  - Example: `feat(api): add health check endpoint`
- Keep commits focused.
- PRs must pass `npm run lint`, `npm run typecheck`, and `npm run test`.

## Architecture Overview

- The **API** is an Express REST service with JWT auth and rate limiting, backed by PostgreSQL via Prisma.
- The **CLI** calls the API via axios and is published as `@rubenpari/dotenv-cli`.
- The **Web** app is an Angular SPA using Tailwind CSS.
- The **Shared** package contains Zod schemas consumed by API and CLI.

## Agent-Specific Instructions

- Never commit `.env` files or secrets. Use `api/.env.example` as a reference.
- `esbuild` is pinned in `package.json` overrides for build consistency; do not upgrade it independently.
- After editing Prisma models, run `npm run db:generate --workspace=api` to regenerate the client.
