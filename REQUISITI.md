# ⚙️ Dotenv Manager — Documento di Analisi dei Requisiti

> Gestione `.env` multi-progetto da CLI e Web UI

| Campo | Valore |
|-------|--------|
| Versione | 1.0.0 — Draft |
| Stack | Express + TypeScript · Node.js CLI · PostgreSQL |
| Status | 🟡 In revisione |

---

## 1. Panoramica del Progetto

Dotenv Manager è uno strumento developer-first per la gestione centralizzata delle variabili d'ambiente su progetti multipli. Il sistema si articola in due interfacce complementari: una CLI interattiva per uso quotidiano da terminale e una Web UI Angular per visualizzazione, confronto e sincronizzazione tra ambienti.

Il problema affrontato è comune a ogni sviluppatore full-stack: mantenere sincronizzati e sicuri file `.env` su progetti diversi, tra ambienti diversi (dev/staging/prod), senza mai committare segreti per errore.

**🎯 Obiettivi:**

- Centralizzare la gestione di `.env` su più progetti da un unico tool
- Crittografare le variabili sensibili a riposo (AES-256-GCM)
- Supportare profili multi-ambiente (dev / staging / prod)
- Offrire diff visuale tra ambienti ed export sicuro
- Esporre una Web UI opzionale per visualizzazione e gestione

---

## 2. Stack Tecnologico

| Layer | Tecnologia | Motivazione |
|-------|-----------|-------------|
| CLI | Node.js + commander.js + inquirer | Esperienza UX da terminale, ampia community, compatibilità cross-platform |
| API Backend | Express + TypeScript | REST API robusta con type-safety, middleware ecosystem maturo |
| Web UI | Angular 20 + Angular HttpClient | SPA con architettura component-based, signals, routing e DI nativi |
| Styling | Tailwind CSS v4 | Utility-first, build veloce, coerenza con altri progetti |
| Database | PostgreSQL | Relazionale, supporto encryption-at-rest, JSON fields per metadata |
| Crittografia | Node.js crypto (AES-256-GCM) | Built-in, nessuna dipendenza esterna per operazioni critiche |
| Auth | JWT + bcrypt | Stateless, adatto a CLI + API, standard de facto |
| ORM | Prisma | Type-safe, migration automatiche, ottima DX con TypeScript |
| Testing | Jest + Supertest | Unit test Angular con Jest, API test con Supertest |

### Struttura Repository

```
dotenv-manager/
├── cli/                  # Pacchetto CLI (commander + inquirer)
│   ├── src/
│   │   ├── commands/     # init, add, get, diff, push, pull, export
│   │   ├── crypto/       # AES-256-GCM wrapper
│   │   └── config/       # ~/.dotenv-manager/config.json
│   └── package.json
├── api/                  # Express + TypeScript REST API
│   ├── src/
│   │   ├── routes/       # Endpoint REST
│   │   ├── middleware/   # Auth JWT, error handler
│   │   ├── services/     # Business logic
│   │   └── prisma/       # Schema + migrations
│   └── package.json
├── web/                  # Angular 20 SPA
│   ├── src/app/
│   │   ├── pages/        # Dashboard, Progetti, Diff, Settings
│   │   ├── components/   # UI atoms e molecules
│   │   └── services/     # HttpClient services (API calls)
│   └── package.json
└── docker-compose.yml
```

---

## 3. Requisiti Funzionali

| ID | Feature | Descrizione | Priorità | Area |
|----|---------|-------------|----------|------|
| F-01 | Registrazione / Login | Autenticazione con email + password, JWT access/refresh token, bcrypt hashing. | 🔴 Alta | Auth |
| F-02 | Gestione Progetti | CRUD progetti con nome, descrizione, slug univoco. Ogni progetto ha ambienti indipendenti. | 🔴 Alta | Core |
| F-03 | Ambienti Multi-Profilo | Ogni progetto supporta ambienti named (dev, staging, prod, custom). Isolamento completo. | 🔴 Alta | Core |
| F-04 | CRUD Variabili | Aggiungi, modifica, elimina variabili per ambiente. Distinzione key/value/descrizione. | 🔴 Alta | Core |
| F-05 | Crittografia at-Rest | I valori sensibili (marcati come secret) sono cifrati con AES-256-GCM prima del salvataggio. | 🔴 Alta | Sicurezza |
| F-06 | CLI — init | Inizializza un progetto locale, crea config e collega al backend se configurato. | 🔴 Alta | CLI |
| F-07 | CLI — push / pull | Sincronizza variabili locali → backend (push) e backend → locale (pull) per un ambiente. | 🔴 Alta | CLI |
| F-08 | CLI — diff | Confronto side-by-side tra due ambienti dello stesso progetto o tra locale e remoto. | 🔴 Alta | CLI |
| F-09 | Export sicuro | Esporta `.env` decifrato per un ambiente specifico; supporto `.env`, JSON, shell export. | 🟡 Media | CLI |
| F-10 | Web UI — Dashboard | Lista progetti con stato sincronia, ultimo aggiornamento e conteggio variabili per ambiente. | 🟡 Media | Web |
| F-11 | Web UI — Editor | Editor tabellare per variabili con toggle show/hide sui valori secret. | 🟡 Media | Web |
| F-12 | Web UI — Diff Viewer | Visualizzazione grafica differenze tra ambienti; highlight aggiunte/modifiche/rimozioni. | 🟡 Media | Web |
| F-13 | History / Audit Log | Traccia ogni modifica con timestamp, utente e valore precedente (solo chiavi, non valori). | 🟡 Media | Core |
| F-14 | Import da file | Import di un file `.env` esistente in un ambiente via CLI o Web UI. | 🟢 Bassa | CLI |
| F-15 | Variabili Required | Marca variabili come obbligatorie; la CLI avvisa se mancanti nel file locale. | 🟢 Bassa | Core |

### 3.1 Autenticazione

- Registrazione con email + password; validazione formato e complessità minima
- Login restituisce access token (15 min) + refresh token (30 giorni) via httpOnly cookie
- Endpoint `/auth/refresh` per rinnovo silenzioso del token
- La CLI salva il token in `~/.dotenv-manager/credentials` (permessi 600)

### 3.2 Crittografia

Le variabili marcate come `secret` non vengono mai salvate in chiaro nel database.

```typescript
// Schema cifratura (per ogni variabile secret)
encrypt(value: string, masterKey: Buffer): EncryptedPayload {
  const iv  = crypto.randomBytes(12);            // 96-bit IV
  const cipher = crypto.createCipheriv(
    "aes-256-gcm", masterKey, iv
  );
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();           // 128-bit tag
  return { iv, ciphertext, authTag };             // tutto in DB
}
```

- Il `masterKey` è derivato dalla password utente + server-side pepper (PBKDF2, 310.000 iterazioni)
- Il valore cifrato viene salvato come stringa base64 nel campo `value_encrypted`
- I valori non-secret restano in chiaro per performance e ricercabilità

---

## 4. API Endpoints (Express REST)

### Auth

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | Pubblico | Registrazione nuovo utente |
| `POST` | `/api/v1/auth/login` | Pubblico | Login, restituisce JWT |
| `POST` | `/api/v1/auth/logout` | JWT | Invalida refresh token |
| `POST` | `/api/v1/auth/refresh` | Refresh token | Rinnovo access token |

### Progetti

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| `GET` | `/api/v1/projects` | JWT | Lista progetti dell'utente |
| `POST` | `/api/v1/projects` | JWT | Crea nuovo progetto |
| `GET` | `/api/v1/projects/:id` | JWT | Dettaglio progetto |
| `PUT` | `/api/v1/projects/:id` | JWT | Modifica progetto |
| `DELETE` | `/api/v1/projects/:id` | JWT | Elimina progetto e relativi dati |

### Ambienti & Variabili

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| `GET` | `/api/v1/projects/:id/envs` | JWT | Lista ambienti del progetto |
| `POST` | `/api/v1/projects/:id/envs` | JWT | Crea ambiente (dev/staging/prod/custom) |
| `GET` | `/api/v1/projects/:id/envs/:env` | JWT | Legge variabili di un ambiente |
| `PUT` | `/api/v1/projects/:id/envs/:env` | JWT | Aggiornamento bulk variabili |
| `DELETE` | `/api/v1/projects/:id/envs/:env` | JWT | Elimina ambiente |
| `GET` | `/api/v1/projects/:id/envs/:env/export` | JWT | Export `.env` / JSON / shell |
| `GET` | `/api/v1/projects/:id/envs/:env/diff/:env2` | JWT | Diff tra due ambienti |
| `POST` | `/api/v1/projects/:id/envs/:env/import` | JWT | Import da file `.env` |

### Audit Log

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| `GET` | `/api/v1/projects/:id/envs/:env/history` | JWT | Cronologia modifiche ambiente |

---

## 5. Schema Database (Prisma)

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String
  createdAt     DateTime       @default(now())
  projects      Project[]
  refreshTokens RefreshToken[]
}

model Project {
  id          String   @id @default(cuid())
  userId      String
  name        String
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
  envs        Env[]
}

model Env {
  id        String     @id @default(cuid())
  projectId String
  name      String     // "dev" | "staging" | "prod" | custom
  project   Project    @relation(fields: [projectId], references: [id])
  variables Variable[]
  auditLogs AuditLog[]
  @@unique([projectId, name])
}

model Variable {
  id             String  @id @default(cuid())
  envId          String
  key            String
  value          String?           // plaintext (non-secret)
  valueEncrypted String?           // base64 AES-GCM (secret)
  isSecret       Boolean @default(false)
  isRequired     Boolean @default(false)
  description    String?
  env            Env     @relation(fields: [envId], references: [id])
  @@unique([envId, key])
}

model AuditLog {
  id        String   @id @default(cuid())
  envId     String
  action    String   // "CREATE" | "UPDATE" | "DELETE"
  key       String
  actorId   String
  createdAt DateTime @default(now())
  env       Env      @relation(fields: [envId], references: [id])
}
```

---

## 6. CLI — Comandi

| Comando | Sintassi | Descrizione |
|---------|----------|-------------|
| `dm init` | `dm init [--project <slug>]` | Inizializza il progetto nella directory corrente |
| `dm login` | `dm login` | Autenticazione interattiva o via browser |
| `dm env list` | `dm env list` | Elenca ambienti disponibili per il progetto corrente |
| `dm env use` | `dm env use <name>` | Imposta ambiente attivo per le operazioni successive |
| `dm var add` | `dm var add <KEY>` | Aggiunge/aggiorna variabile interattivamente |
| `dm var get` | `dm var get <KEY>` | Mostra valore di una variabile (con conferma per secret) |
| `dm var list` | `dm var list [--env <name>]` | Lista tutte le variabili dell'ambiente attivo |
| `dm push` | `dm push [--env <name>]` | Sincronizza `.env` locale → backend |
| `dm pull` | `dm pull [--env <name>]` | Scarica variabili dal backend e aggiorna `.env` locale |
| `dm diff` | `dm diff <env1> <env2>` | Confronto side-by-side tra due ambienti |
| `dm export` | `dm export [--format env\|json\|shell]` | Esporta variabili nel formato specificato |
| `dm import` | `dm import <file.env>` | Importa un file `.env` nell'ambiente attivo |
| `dm history` | `dm history [--limit 20]` | Mostra audit log delle ultime modifiche |

### Esempio sessione CLI

```bash
# Primo setup
$ dm login
  ✔ Autenticato come ruben@example.com

$ cd ~/projects/my-api
$ dm init --project my-api
  ✔ Progetto "my-api" collegato · ambienti: dev, staging, prod

# Aggiunta variabile
$ dm var add DATABASE_URL
  ? Valore: postgresql://localhost:5432/mydb
  ? È un segreto? Yes
  ? Descrizione (opzionale): Connection string principale
  ✔ DATABASE_URL aggiunto (cifrato)

# Confronto ambienti
$ dm diff dev prod
  KEY              DEV                    PROD
  DATABASE_URL     [secret] ✔             [secret] ✔
  REDIS_URL        redis://localhost       [MANCANTE] ✗
  LOG_LEVEL        debug                  info

# Push al backend
$ dm push --env dev
  ✔ 12 variabili sincronizzate (3 cifrate)
```

---

## 7. Requisiti Non Funzionali

### Sicurezza

- Nessun valore secret trasmesso in chiaro; TLS obbligatorio in produzione
- Rate limiting su endpoint auth (max 10 req/min per IP) con `express-rate-limit`
- Input validation con Zod su tutti gli endpoint
- `Helmet.js` per header HTTP di sicurezza
- Il file credentials locale ha permessi `600` (solo proprietario)
- Audit log non registra mai i valori delle variabili, solo le chiavi

### Performance

- La CLI deve rispondere in < 500ms per operazioni locali
- Le API devono rispondere in < 200ms per operazioni CRUD standard
- Pull di un progetto con 100 variabili: < 1s

### Qualità del Codice

- TypeScript strict mode abilitato su tutti i pacchetti
- ESLint + Prettier con configurazione condivisa nel monorepo
- Test coverage minima: 80% su API, 70% su logica CLI
- Tutti gli endpoint documentati con JSDoc / OpenAPI annotations

---

## 8. Roadmap di Sviluppo

| Fase | Durata est. | Obiettivi |
|------|------------|-----------|
| Fase 1 | 1–2 sett. | Setup monorepo · Schema Prisma · Auth Express (F-01) · Test infra |
| Fase 2 | 1–2 sett. | CRUD Progetti + Ambienti (F-02, F-03) · Layer crittografia (F-05) · CRUD Variabili (F-04) |
| Fase 3 | 1–2 sett. | CLI init, login, var add/get/list (F-06) · push/pull (F-07) · diff (F-08) |
| Fase 4 | 1 sett. | Web UI Angular: Dashboard + Editor (F-10, F-11) · Diff Viewer (F-12) |
| Fase 5 | 1 sett. | Audit log (F-13) · Export/Import (F-09, F-14) · Variabili required (F-15) |
| Fase 6 | 1 sett. | Docker Compose · README · Polishing · Test coverage ≥ 80% |

---

## 9. Configurazione Ambiente

```env
# api/.env

NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/dotenv_manager

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Crittografia master key (PBKDF2 input)
MASTER_KEY_PEPPER=random-server-side-pepper-32-chars

# CORS
CLIENT_URL=http://localhost:4200

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

---

## 10. Out of Scope (v1.0)

- Supporto multi-utente / team collaboration (futura v2)
- Integrazione diretta con CI/CD pipelines (GitHub Actions, GitLab CI)
- Plugin VS Code / JetBrains
- Self-hosting automatizzato (Helm chart, Railway one-click)
- Webhook su modifica variabili
- Rotazione automatica dei segreti

---

> 💡 **Valore Portfolio** — Questo progetto dimostra contemporaneamente: design CLI da zero con Node.js, crittografia applicata (AES-256-GCM), architettura REST con Express + TypeScript, gestione monorepo, e sensibilità per temi di sicurezza — un set di skill molto apprezzato in ambito backend e DevOps.
