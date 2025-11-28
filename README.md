# OBDscribe

**OBDscribe** is an AI-powered **service writer copilot** for auto repair shops.

Given:

- Vehicle information (year, make, model, trim, mileage)
- OBD-II trouble codes
- Customer complaint + notes

…it generates:

- A **Tech View**: diagnostic summary for technicians
- A **Customer View**: plain-language explanation and recommendations

This repo contains the **v0.1.0 demo build**: a full-stack Next.js app with authentication, AI integration, database persistence, and basic rate limiting.

---

## Features (v0.1.0 – Demo Ready)

- 🔐 **Email/password auth**
  - Demo user seeded in the database (see seeding notes).
  - Logged-in users access the `/app/new-report` experience.

- 🧾 **New Report flow**
  - Form for vehicle details, OBD codes, complaint, and notes.
  - Simple desktop-style layout for service writer use.

- 🤖 **AI-generated reports**
  - Calls OpenAI via a dedicated AI engine module.
  - Returns **Tech View** and **Customer View** as structured JSON.
  - Responses are flattened into a clean API payload for the frontend.

- 🗄️ **Postgres + Prisma persistence**
  - Reports are stored in a Postgres database via Prisma.
  - Includes prompt versioning and maintenance suggestions fields.

- 🚦 **Basic rate limiting**
  - In-memory rate limiter for `/api/generate-report` keyed by IP.
  - Returns `429` when a client sends too many requests in a short window.

- 🩺 **Health check**
  - `GET /api/health` endpoint for simple liveliness checks.

---

## Tech Stack

**Frontend**

- Next.js 16 (App Router)
- React + TypeScript
- Tailwind CSS (global styling + simple layout)

**Backend**

- Next.js API routes (Node / TypeScript)
- Authentication via email/password + signed session cookie
- Basic rate limiting on AI-heavy routes

**Database & ORM**

- PostgreSQL
- Prisma ORM (v7)
  - `@prisma/client`
  - `@prisma/adapter-pg` + `pg` driver

**AI Integration**

- OpenAI Node SDK
- Configurable models via environment variables:
  - `OBDSCRIBE_AI_MODEL` (default / standard)
  - `OBDSCRIBE_AI_MODEL_PREMIUM` (optional higher-tier)
- AI engine encapsulated in `src/lib/ai/engine.ts`:
  - Receives a structured input object
  - Returns strongly-typed JSON for Tech/Customer views and optional metadata

**Other**

- Rate limiter module: `src/lib/rateLimiter.ts`
- Logging helper: `src/lib/logger.ts`
- Shared types for AI and reports: `src/types/report.ts`

---

## Project Status

**Current version:** `v0.1.0`  

This version is intended as an **internal/demo build**, not production:

- All core flows are working end-to-end.
- Assumes a trusted environment and a single demo shop/user.
- No multi-tenant billing, SSO, or role management yet.

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/kevin-novanta/obdscribe.git
cd obdscribe
```

### 2. Install dependencies

```bash
pnpm install
```

> You can use `npm` or `yarn` if you prefer, but the repo is set up for `pnpm`.

### 3. Environment variables

Create a `.env.local` file in the project root (Next.js will automatically load it):

```bash
cp .env.example .env.local
```

Then fill in:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/obdscribe?schema=public"

# OpenAI
OPENAI_API_KEY="sk-..."

# AI models
OBDSCRIBE_AI_MODEL="gpt-4.1-mini"     # or another reasonably priced model
OBDSCRIBE_AI_MODEL_PREMIUM="gpt-5.1"  # optional higher-tier model

# App config (example)
APP_ENV="development"
```

> Make sure your local Postgres instance is running and the `obdscribe` database exists.

### 4. Prisma: migrate the database

```bash
pnpx prisma migrate dev --name init_schema
```

This will:

- Apply the initial schema
- Generate the Prisma client into `node_modules/.prisma`

If you change `prisma/schema.prisma` later, run `migrate dev` again with a new migration name.

### 5. Seed demo data

Connect to your `obdscribe` database (example using `psql`):

```bash
psql "postgresql://user:password@localhost:5432/obdscribe"
```

Then insert a demo shop and user (adjust if your schema differs):

```sql
-- 1) Demo shop
INSERT INTO "Shop" ("id", "name", "createdAt", "updatedAt")
VALUES ('shop_demo_1', 'Demo Auto Repair', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 2) Demo user (password: DemoPass123!)
INSERT INTO "User" ("id", "email", "passwordHash", "role", "shopId", "createdAt", "updatedAt")
VALUES (
  'user_demo_1',
  'demo@shop.com',
  '$2b$10$UTf1rvQag9uqcJGS7hy6K.m65XU2gAkIutQYehLc0wDY/wEGO0/.K', -- bcrypt hash
  'advisor',
  'shop_demo_1',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
```

Exit `psql` with:

```sql
\q
```

### 6. Run the dev server

```bash
pnpm dev
```

By default, the app runs at:

- `http://localhost:3000`

---

## Using the Demo

### 1. Log in

Visit:

- `http://localhost:3000/login`

Use the demo credentials:

- **Email:** `demo@shop.com`
- **Password:** `DemoPass123!`

On success you should land on `/app/new-report`.

### 2. Create a new report

On `/app/new-report`, fill in:

- Vehicle year, make, model, trim, mileage
- OBD-II code(s) (e.g., `P0171` or `P0301, P0420`)
- Customer complaint
- Optional notes

Click **Generate report**.

The app will:

1. Call `/api/generate-report`
2. Run validation + rate limiting
3. Call the AI engine with a structured payload
4. Persist the output via Prisma
5. Return:
   - `techView`
   - `customerView`
   - `maintenanceSuggestions`
   - optional `riskAssessment`, `estimateRange`

The UI will then render the Tech View and Customer View in the panel.

---

## Key Files & Directories

- `src/app/login/page.tsx`  
  Login UI.

- `src/app/app/layout.tsx`  
  Authenticated layout (shell for the “app” section).

- `src/app/app/new-report/page.tsx`  
  New Report form UI; calls the generate-report API.

- `src/app/api/auth/login/route.ts`  
  Email/password login endpoint; issues `session` cookie.

- `src/app/api/generate-report/route.ts`  
  Core API that:
  - Validates input
  - Applies rate limiting
  - Invokes AI engine
  - Persists report via Prisma
  - Returns structured JSON to the frontend

- `src/app/api/health/route.ts`  
  Simple health-check endpoint.

- `src/lib/ai/engine.ts`  
  AI engine wrapper around OpenAI:
  - Builds prompt/context
  - Chooses model based on `mode` and env vars
  - Parses JSON output into typed `GenerateReportOutput`.

- `src/lib/db.ts`  
  Prisma client setup using the Postgres adapter.

- `src/lib/auth.ts`, `src/lib/session.ts`  
  Auth helper utilities for login and session parsing.

- `src/lib/logger.ts`  
  Minimal logging helper (wraps `console` with prefixes).

- `src/lib/rateLimiter.ts`  
  In-memory rate limiter keyed by IP.

- `src/types/report.ts`  
  Shared TypeScript types for AI engine inputs/outputs.

- `prisma/schema.prisma`  
  Database schema (Shop, User, Report, etc.).

- `docs/`  
  Additional documentation, evidence, and notes (e.g. AI engine config, add-ons, design docs).

---

## API Overview

### `POST /api/generate-report`

**Request body (simplified):**

```json
{
  "make": "Toyota",
  "model": "Corolla",
  "trim": "SE",
  "mileage": 60500,
  "year": 2018,
  "codes": "P0301, P0171",
  "complaint": "Check engine light and rough idle at stops.",
  "notes": "Seems worse on cold start.",
  "mode": "production"
}
```

The backend normalizes this into:

- A `vehicle` object
- A `codes` array

**Response (simplified):**

```json
{
  "id": "rep_123",
  "techView": "...",
  "customerView": "...",
  "maintenanceSuggestions": ["...", "..."],
  "riskAssessment": null,
  "estimateRange": null
}
```

(Return shape is designed to be easy to consume from React.)

---

## Rate Limiting

The `generate-report` endpoint uses a simple in-memory rate limiter:

- Window: 60 seconds
- Max requests: 20 per IP

Implementation: `src/lib/rateLimiter.ts`.

If a client exceeds the limit, the API responds:

```json
{
  "message": "Too many requests. Please wait a moment and try again."
}
```

with HTTP status `429`.

---

## Development Notes

- **Prisma v7** uses the newer configuration pattern where:
  - Connection string lives in env (`DATABASE_URL`)
  - Adapter is passed at client construction time.
- **AI models**:
  - Using `gpt-4.1-mini` or similar as a default is a good balance of cost vs. quality.
  - You can switch to other models via env without changing code.
- **Auth** is intentionally minimal:
  - A single demo user for v0.
  - Enough to simulate real-world, authenticated usage.

---

## Roadmap Ideas

These are **not** implemented in `v0.1.0` but are natural next steps:

- 📜 **Report History**
  - Paginated list of past reports per shop.
  - Detail view with Tech/Customer views and metadata.

- 💵 **Estimate Ranges**
  - Integrate a job catalog for typical labor/parts ranges.
  - Let shops configure labor rates and markups.

- 🧠 **Smarter AI**
  - Use retrieval of past similar cases.
  - Include VIN-decoded details and job catalog context in prompts.

- 🖥️ **Desktop-like distribution**
  - Package as a local app (e.g., desktop shell) for service desks.

- 🔐 **Production-grade auth**
  - Multi-user, roles, password reset, etc.

---

## License

This project currently does **not** specify a license.  
If you intend to open source it, consider adding an MIT or similar license in a `LICENSE` file.

---

## Contact

Built by **Kevin (kevin-novanta)**.

If you have questions or ideas for OBDscribe:

- GitHub: https://github.com/kevin-novanta
- (Add LinkedIn / email / portfolio link here)
