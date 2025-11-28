# ~~OBDscribe – v0 Build Blueprint & Repo Layout~~

~~Version: 0.1~~  
~~Goal: Turn the existing OBDscribe specs into a **step-by-step build gameplan** that gets us to a working, demo-ready v0.~~

~~By the end of this blueprint, you should be able to:~~

- ~~Create a repo with a clean, scalable layout.~~
- ~~Configure env, DB, and AI wiring.~~
- ~~Implement auth, the New Report flow, and `/api/generate-report`.~~
- ~~Hit the v0 demo-ready checklist from your goals doc.~~

~~Each chapter includes:~~

- ~~**Files & directories** to create.~~
- ~~**What each piece does**.~~
- ~~**Manual testing** to run before committing.~~
- ~~A suggested **Git commit message**.~~

~~---~~

## ~~Chapter 0 – Prereqs, Tech Choices, and High-Level Shape~~

### ~~0.1 Core tech decisions~~

- ~~**Runtime:** Node.js 20+ (LTS).~~
- ~~**Package manager:** `pnpm` (you can substitute `npm` if you prefer).~~
- ~~**Framework:** Next.js 14+ with the App Router.~~
- ~~**Language:** TypeScript.~~
- ~~**Styling:** Tailwind CSS.~~
- ~~**Database:** Postgres (Supabase / Neon / Railway / local Docker).~~
- ~~**ORM:** Prisma.~~
- ~~**Auth:** Minimal email/password with JWT session cookie.~~
- ~~**AI:** OpenAI advanced reasoning model (e.g. `gpt-5.1-thinking`) via an internal `ai-engine` module.~~
- ~~**Hosting (later):** Vercel for Next.js; managed Postgres elsewhere.~~

### ~~0.2 v0 feature scope reminder~~

~~For v0, we are building:~~

- ~~`/login` – email/password login.~~
- ~~`/app/new-report` – New Report UI with:~~
  - ~~Vehicle + codes + complaint + notes.~~
  - ~~Generated Tech View, Customer View, and maintenance suggestions.~~
- ~~API routes:~~
  - ~~`/api/auth/login` – minimal auth.~~
  - ~~`/api/generate-report` – validate → enrich → AI → store → return JSON.~~
  - ~~`/api/health` – health check.~~
- ~~DB tables:~~
  - ~~shops, users, reports, dtc_codes, maintenance_bands.~~

~~Not required in v0 (can be v0.1+):~~

- ~~`/app/history`, `/app/settings` and their APIs.~~
- ~~Risk assessment, estimates, VIN decoding, external tools.~~

~~---~~

## ~~Chapter 1 – Repo Skeleton, Docs, and .gitignore~~

### ~~1.1 Recommended repo layout (top level)~~

~~From your `OBDscribe/` root, target this structure:~~

```text
OBDscribe/
  docs/
    obdscribe_master_product_engineering_spec_v0.2.md
    obdscribe_v0_goals_and_expectations.md
    README_docs.md
    .gitignore
  prisma/
    schema.prisma
  public/
  src/
    app/
    lib/
    types/
  .env.example
  .gitignore
  package.json
  pnpm-lock.yaml
  next.config.mjs
  postcss.config.mjs
  tailwind.config.ts
  tsconfig.json
  README.md
  LICENSE
```

~~**What each top-level piece is for:**~~

- ~~`docs/` – all product + engineering specs and internal docs.~~
- ~~`prisma/` – DB schema and migrations.~~
- ~~`public/` – static assets (logos, favicons, etc.).~~
- ~~`src/app/` – Next.js App Router routes (pages + layouts + API routes).~~
- ~~`src/lib/` – shared libraries (db client, AI engine, auth helpers, rate limiter).~~
- ~~`src/types/` – shared TypeScript types (GenerateReportInput/Output, etc.).~~
- ~~`.env.example` – template listing required environment variables.~~
- ~~`.gitignore` – ignore rules so you don’t commit node_modules, env, etc.~~
- ~~`README.md` – high-level repo overview.~~
- ~~`LICENSE` – license (MIT or your choice).~~

### ~~1.2 Root README~~

~~Create `README.md`:~~

```md
# OBDscribe

OBDscribe is an AI-powered service writer copilot for auto repair shops.

Core idea:
- Input: vehicle info, OBD codes, and customer complaint.
- Output: tech-facing summary, customer-facing explanation, and basic maintenance suggestions.

## Status

- v0 in active development.
- See `docs/obdscribe_master_product_engineering_spec_v0.2.md` and
  `docs/obdscribe_v0_goals_and_expectations.md` for product and engineering details.
```

### ~~1.3 Root .gitignore~~

~~Create `./.gitignore`:~~

```gitignore
# Node / Next / TypeScript
node_modules/
.next/
out/
dist/
.cache/
coverage/
.vscode/
.idea/
.DS_Store

# Env and secrets
.env
.env.local
.env.*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
logs/
*.log

# Build artifacts
*.tsbuildinfo

# OS
Thumbs.db
Desktop.ini

# Misc
*.swp
*.swo
*.tmp
```

### ~~1.4 docs/.gitignore~~

~~In `docs/`, create `docs/.gitignore`:~~

```gitignore
# Ignore exported/binary docs
*.pdf
*.doc
*.docx
*.ppt
*.pptx
*.xls
*.xlsx

# OS cruft
.DS_Store

# Editor backups
*~
*.tmp
```

### ~~1.5 LICENSE~~

~~Add MIT or similar in `LICENSE` if you want the repo to be open source. Otherwise you can skip or add a private notice.~~

~~---~~

### ~~1.6 Manual testing~~

- ~~From repo root, run `ls` and confirm the folders/files exist where expected.~~
- ~~Open `README.md` and the docs in VS Code – check that paths and naming are consistent.~~

### ~~1.7 Git commit~~

```bash
git add .
git commit -m "ch1: add repo skeleton, docs, and gitignore configuration"
git push
```

~~---~~

## ~~Chapter 2 – Initialize Next.js App (App Router, TS, Tailwind)~~

### ~~2.1 Scaffold Next.js~~

~~From repo root:~~

```bash
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir
```

~~If the CLI asks interactively:~~

- ~~Use `src/` directory: yes.~~
- ~~Use App Router: yes.~~

~~This creates:~~

- ~~`src/app/` with base pages.~~
- ~~`next.config.mjs`~~
- ~~`tsconfig.json`~~
- ~~`tailwind.config.ts`~~
- ~~`postcss.config.mjs`~~
- ~~`package.json`~~

### ~~2.2 Clean landing page~~

~~Edit `src/app/page.tsx`:~~

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">OBDscribe</h1>
        <p className="text-gray-500 text-sm">
          v0 is under construction. Go to <code>/login</code>.
        </p>
      </div>
    </main>
  );
}
```

### ~~2.3 Root layout~~

~~Ensure `src/app/layout.tsx` is wired as:~~

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OBDscribe",
  description: "Service writer copilot for auto repair shops",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
```

~~---~~

### ~~2.4 Manual testing~~

```bash
pnpm install
pnpm dev
```

- ~~Visit `http://localhost:3000`.~~
- ~~Confirm the placeholder homepage appears and there are no build errors.~~

### ~~2.5 Git commit~~

```bash
git add .
git commit -m "ch2: scaffold Next.js app with Tailwind and base layout"
git push
```

~~---~~

## ~~Chapter 3 – Env, Config, and .env.example~~

### ~~3.1 .env.example~~

~~Create `.env.example` at repo root:~~

```env
# Server / runtime
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/obdscribe

# Auth
AUTH_SECRET=change_me_to_a_long_random_value

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# App
APP_BASE_URL=http://localhost:3000
```

~~You’ll create an **untracked** `.env.local` by copying this file and filling real values.~~

### ~~3.2 next.config.mjs~~

~~Ensure `next.config.mjs` exists; default is fine for v0:~~

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

### ~~3.3 tsconfig.json~~

~~Update TS config to support `@/lib` and `@/types` imports:~~

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": "./src",
    "paths": {
      "@/app/*": ["app/*"],
      "@/lib/*": ["lib/*"],
      "@/types/*": ["types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

~~---~~

### ~~3.4 Manual testing~~

- ~~Copy `.env.example` → `.env.local`.~~
- ~~Fill in a dummy `DATABASE_URL` (you’ll fix it later when Postgres is ready).~~
- ~~Run `pnpm dev` – verify app still builds.~~

### ~~3.5 Git commit~~

```bash
git add .env.example next.config.mjs tsconfig.json
git commit -m "ch3: define env template, Next config, and TS path aliases"
git push
```

~~---~~

## ~~Chapter 4 – Database Setup with Prisma (Shops, Users, Reports, DTC Data)~~

### ~~4.1 Install Prisma~~

```bash
pnpm add -D prisma
pnpm add @prisma/client
pnpx prisma init
```

~~This creates:~~

- ~~`prisma/schema.prisma`~~
- ~~`.env` (you can ignore this and keep using `.env.local`, just ensure DATABASE_URL matches).~~

### ~~4.2 Define schema.prisma~~

~~Edit `prisma/schema.prisma`:~~

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Shop {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users   User[]
  reports Report[]
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         String   @default("advisor") // "owner" | "advisor" later
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  shop   Shop   @relation(fields: [shopId], references: [id])
  shopId String

  reports Report[]
}

model Report {
  id        String   @id @default(cuid())
  shop      Shop     @relation(fields: [shopId], references: [id])
  shopId    String
  user      User     @relation(fields: [userId], references: [id])
  userId    String

  vehicleYear   Int?
  vehicleMake   String?
  vehicleModel  String?
  vehicleTrim   String?
  mileage       Int?

  codesRaw      String   // raw input as typed, e.g. "P0301, P0171"
  complaint     String
  notes         String?

  techView               String
  customerView           String
  maintenanceSuggestions String // JSON-encoded array of strings

  promptVersion String
  mode          String   // "production" | "sandbox" | "debug"

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model DtcCode {
  code           String   @id
  genericMeaning String
  category       String?  // e.g. ignition, emissions
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model MaintenanceBand {
  id          Int      @id @default(autoincrement())
  minMileage  Int
  maxMileage  Int
  suggestions String   // JSON-encoded array of strings
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ~~4.3 Generate client and run migrations~~

```bash
pnpx prisma generate
pnpx prisma migrate dev --name init_schema
```

### ~~4.4 Seed some static data (via Prisma Studio)~~

~~Run:~~

```bash
pnpx prisma studio
```

- ~~Add a `Shop` row (e.g., `Demo Shop`).~~
- ~~Add a `User` row tied to that shop (you’ll fill `passwordHash` later).~~
- ~~Add a few `DtcCode` rows: P0301, P0171, P0420, etc.~~
- ~~Add a few `MaintenanceBand` rows (e.g., 0–30000, 30000–60000, etc.) with simple suggestions JSON.~~

---

### ~~4.5 Manual testing~~

- ~~Run `pnpx prisma studio` and confirm:~~
  - ~~Tables exist.~~
  - ~~You can insert sample data without errors.~~

### ~~4.6 Git commit~~

```bash
git add prisma/schema.prisma
git commit -m "ch4: define Prisma schema for shops, users, reports, and static data"
git push
```

~~---~~

## ~~Chapter 5 – Shared Types, DB Client, and Helpers~~

### ~~5.1 Shared report types~~

~~Create `src/types/report.ts`:~~

```ts
export type RiskLevel = "low" | "medium" | "high";

export type GenerateReportMode = "production" | "sandbox" | "debug";

export type GenerateReportInput = {
  mode?: GenerateReportMode;
  shopId: string;
  userId: string;
  vehicle: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    mileage?: number;
  };
  codes: string[];
  complaint: string;
  notes?: string;
};

export type GenerateReportOutput = {
  techView: string;
  customerView: string;
  maintenanceSuggestions: string[];
  riskAssessment?: {
    safety: RiskLevel;
    drivability: RiskLevel;
    longTermDamage: RiskLevel;
  };
  estimateRange?: {
    laborMin: number;
    laborMax: number;
    partsMin: number;
    partsMax: number;
    totalMin: number;
    totalMax: number;
  };
};
```

### ~~5.2 Prisma client wrapper~~

~~Create `src/lib/db.ts`:~~

```ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
```

### ~~5.3 Simple logger~~

~~Create `src/lib/logger.ts`:~~

```ts
export function logInfo(message: string, meta?: unknown) {
  console.log(`[INFO] ${message}`, meta ?? "");
}

export function logError(message: string, meta?: unknown) {
  console.error(`[ERROR] ${message}`, meta ?? "");
}
```

~~---~~

### ~~5.4 Manual testing~~

- ~~Run `pnpm dev` – ensure there are no TypeScript or import errors.~~
- ~~Optionally add a temporary API route using `prisma` to confirm it works, then remove it.~~

### 5.5 Git commit

```bash
git add src/types src/lib/db.ts src/lib/logger.ts
git commit -m "ch5: add shared report types, Prisma client, and logger"
git push
```

---

## Chapter 6 – Auth: Auth Helpers, /api/auth/login, and /login Page

### 6.1 Auth utilities

Install dependencies:

```bash
pnpm add bcryptjs jsonwebtoken
```

Create `src/lib/auth.ts`:

```ts
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";

export async function verifyUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

export function createSessionToken(userId: string, shopId: string) {
  return jwt.sign({ userId, shopId }, AUTH_SECRET, {
    expiresIn: "7d",
  });
}
```

### 6.2 Session parsing helper

Create `src/lib/session.ts`:

```ts
import jwt from "jsonwebtoken";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";

export type Session = {
  userId: string;
  shopId: string;
};

export function parseSessionToken(token: string | undefined | null): Session | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as Session;
    if (!decoded.userId || !decoded.shopId) return null;
    return decoded;
  } catch {
    return null;
  }
}
```

### 6.3 /api/auth/login route

Create `src/app/api/auth/login/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyUser, createSessionToken } from "@/lib/auth";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await verifyUser(email, password);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.id, user.shopId);

    const res = NextResponse.json({ message: "ok" });
    res.cookies.set("obdscribe_session", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    logError("Login failed", err);
    return NextResponse.json(
      { message: "Unexpected error" },
      { status: 500 }
    );
  }
}
```

### 6.4 /login page

Create `src/app/login/page.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Login failed");
      } else {
        window.location.href = "/app/new-report";
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">Sign in to OBDscribe</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-md py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
```

---

### 6.5 Manual testing

- Generate a bcrypt hash for a test password and store it in the `User` row via Prisma Studio.
- Run `pnpm dev`.
- Visit `/login` and log in using the seeded email/password.
- On success, you should be redirected to `/app/new-report` (route will be created next).

### 6.6 Git commit

```bash
git add src/lib/auth.ts src/lib/session.ts src/app/api/auth/login/route.ts src/app/login/page.tsx
git commit -m "ch6: implement basic email/password auth and login flow"
git push
```

---

## Chapter 7 – Authenticated Layout and New Report UI Shell

### 7.1 Authenticated app layout

Create `src/app/app/layout.tsx`:

```tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseSessionToken } from "@/lib/session";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("obdscribe_session")?.value;
  const session = parseSessionToken(token);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center px-4 border-b">
          <span className="font-semibold text-sm">OBDscribe</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2 text-sm">
          <Link href="/app/new-report" className="block px-2 py-1 rounded hover:bg-slate-100">
            New Report
          </Link>
          <Link href="/app/history" className="block px-2 py-1 rounded hover:bg-slate-100">
            History (later)
          </Link>
          <Link href="/app/settings" className="block px-2 py-1 rounded hover:bg-slate-100">
            Settings (later)
          </Link>
        </nav>
      </aside>
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
```

### 7.2 New Report page UI shell

Create `src/app/app/new-report/page.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";

type FormState = {
  year?: number;
  make: string;
  model: string;
  trim?: string;
  mileage?: number;
  codes: string;
  complaint: string;
  notes?: string;
};

export default function NewReportPage() {
  const [form, setForm] = useState<FormState>({
    make: "",
    model: "",
    codes: "",
    complaint: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techView, setTechView] = useState("");
  const [customerView, setCustomerView] = useState("");
  const [maintenanceSuggestions, setMaintenanceSuggestions] = useState<string[]>([]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to generate report");
      } else {
        const data = await res.json();
        setTechView(data.techView);
        setCustomerView(data.customerView);
        setMaintenanceSuggestions(data.maintenanceSuggestions || []);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
        <h1 className="text-lg font-semibold">New Report</h1>
      </header>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-auto">
        <section className="bg-white border rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-semibold">Vehicle & Complaint</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Year</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.year ?? ""}
                  onChange={e => updateField("year", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Mileage</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.mileage ?? ""}
                  onChange={e => updateField("mileage", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Make</label>
                <input
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.make}
                  onChange={e => updateField("make", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Model</label>
                <input
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.model}
                  onChange={e => updateField("model", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Trim (optional)</label>
              <input
                className="w-full border rounded px-2 py-1 text-sm"
                value={form.trim ?? ""}
                onChange={e => updateField("trim", e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">OBD Codes</label>
              <textarea
                className="w-full border rounded px-2 py-1 text-sm h-16"
                placeholder="P0301, P0171"
                value={form.codes}
                onChange={e => updateField("codes", e.target.value)}
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Format: P0301, P0171
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Customer Complaint</label>
              <textarea
                className="w-full border rounded px-2 py-1 text-sm h-20"
                value={form.complaint}
                onChange={e => updateField("complaint", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Tech Notes (optional)</label>
              <textarea
                className="w-full border rounded px-2 py-1 text-sm h-16"
                value={form.notes ?? ""}
                onChange={e => updateField("notes", e.target.value || undefined)}
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 bg-black text-white text-sm rounded disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="bg-white border rounded-lg p-4 space-y-2">
            <h2 className="text-sm font-semibold">Tech View</h2>
            <textarea
              className="w-full border rounded px-2 py-1 text-sm h-40"
              value={techView}
              onChange={e => setTechView(e.target.value)}
            />
          </div>
          <div className="bg-white border rounded-lg p-4 space-y-2">
            <h2 className="text-sm font-semibold">Customer View</h2>
            <textarea
              className="w-full border rounded px-2 py-1 text-sm h-40"
              value={customerView}
              onChange={e => setCustomerView(e.target.value)}
            />
          </div>
          <div className="bg-white border rounded-lg p-4 space-y-2">
            <h2 className="text-sm font-semibold">Maintenance Suggestions</h2>
            <textarea
              className="w-full border rounded px-2 py-1 text-sm h-24"
              value={maintenanceSuggestions.join("\n")}
              onChange={e => setMaintenanceSuggestions(e.target.value.split("\n"))}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

### 7.3 Manual testing

- Log in at `/login`.
- Confirm redirect to `/app/new-report`.
- Ensure layout renders correctly and inputs/outputs are visible (even though API isn’t wired yet).

### 7.4 Git commit

```bash
git add src/app/app
git commit -m "ch7: add authenticated app layout and New Report UI shell"
git push
```

---

## Chapter 8 – AI Engine and /api/generate-report (Core v0 Flow)

### 8.1 AI engine implementation

Install OpenAI SDK:

```bash
pnpm add openai
```

Create `src/lib/ai/engine.ts`:

```ts
import OpenAI from "openai";
import { GenerateReportInput, GenerateReportOutput } from "@/types/report";
import { prisma } from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT_VERSION = "1";

export async function generateReport(
  input: GenerateReportInput
): Promise<GenerateReportOutput> {
  const mode = input.mode ?? "production";

  const codesNormalized = input.codes
    .map(c => c.trim().toUpperCase())
    .filter(Boolean);

  const dtcRows = await prisma.dtcCode.findMany({
    where: { code: { in: codesNormalized } },
  });

  const dtcMap = new Map(dtcRows.map(row => [row.code, row.genericMeaning]));

  const codesWithMeaning = codesNormalized.map(code => ({
    code,
    meaning: dtcMap.get(code) ?? "Unknown code (provide a generic explanation).",
  }));

  const mileage = input.vehicle.mileage ?? null;
  const maintenanceBand = await findMaintenanceBand(mileage);

  const systemPrompt = `
You are an experienced automotive technician and service advisor.
You explain issues clearly, avoid overconfidence, and respect that final diagnosis belongs to human technicians.
Return only JSON matching the requested schema.
`;

  const userContext = {
    prompt_version: PROMPT_VERSION,
    mode,
    vehicle: input.vehicle,
    codes: codesWithMeaning,
    complaint: input.complaint,
    notes: input.notes ?? "",
    mileage_band: maintenanceBand,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-5.1-thinking",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content:
          "Given the following structured JSON, generate a tech view, customer view, and maintenance suggestions. " +
          "Return ONLY JSON with keys: techView (string), customerView (string), maintenanceSuggestions (string[])." +
          "\n\n" +
          JSON.stringify(userContext),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: any;

  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {
      techView:
        "We were unable to generate a detailed structured explanation. Please re-run the report or adjust inputs.",
      customerView:
        "We had trouble generating a detailed explanation this time. Please ask your service advisor to try again.",
      maintenanceSuggestions: [],
    };
  }

  const result: GenerateReportOutput = {
    techView: parsed.techView ?? "",
    customerView: parsed.customerView ?? "",
    maintenanceSuggestions: Array.isArray(parsed.maintenanceSuggestions)
      ? parsed.maintenanceSuggestions
      : [],
  };

  return result;
}

async function findMaintenanceBand(mileage: number | null) {
  if (mileage == null) return null;
  const band = await prisma.maintenanceBand.findFirst({
    where: {
      minMileage: { lte: mileage },
      maxMileage: { gte: mileage },
    },
  });
  return band
    ? {
        minMileage: band.minMileage,
        maxMileage: band.maxMileage,
      }
    : null;
}
```

### 8.2 /api/generate-report route

Create `src/app/api/generate-report/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSessionToken } from "@/lib/session";
import { generateReport } from "@/lib/ai/engine";
import { logError } from "@/lib/logger";

type Body = {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  mileage?: number;
  codes: string;
  complaint: string;
  notes?: string;
};

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("obdscribe_session")?.value;
  const session = parseSessionToken(cookie);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (!body.complaint || !body.codes) {
    return NextResponse.json(
      { message: "Complaint and codes are required" },
      { status: 400 }
    );
  }

  const codesArray = body.codes
    .split(",")
    .map(c => c.trim())
    .filter(Boolean);

  try {
    const aiOutput = await generateReport({
      mode: "production",
      shopId: session.shopId,
      userId: session.userId,
      vehicle: {
        year: body.year,
        make: body.make,
        model: body.model,
        trim: body.trim,
        mileage: body.mileage,
      },
      codes: codesArray,
      complaint: body.complaint,
      notes: body.notes,
    });

    const report = await prisma.report.create({
      data: {
        shopId: session.shopId,
        userId: session.userId,
        vehicleYear: body.year ?? null,
        vehicleMake: body.make ?? null,
        vehicleModel: body.model ?? null,
        vehicleTrim: body.trim ?? null,
        mileage: body.mileage ?? null,
        codesRaw: body.codes,
        complaint: body.complaint,
        notes: body.notes ?? "",
        techView: aiOutput.techView,
        customerView: aiOutput.customerView,
        maintenanceSuggestions: JSON.stringify(aiOutput.maintenanceSuggestions),
        promptVersion: "1",
        mode: "production",
      },
    });

    return NextResponse.json({
      id: report.id,
      techView: report.techView,
      customerView: report.customerView,
      maintenanceSuggestions: aiOutput.maintenanceSuggestions,
    });
  } catch (err) {
    logError("Failed to generate report", err);
    return NextResponse.json(
      { message: "Failed to generate report. Please try again." },
      { status: 500 }
    );
  }
}
```

---

### 8.3 Manual testing

- Ensure `OPENAI_API_KEY` is set in `.env.local`.
- Start app: `pnpm dev`.
- Log in via `/login`.
- Go to `/app/new-report` and enter:
  - A realistic vehicle (e.g., 2018 Toyota Corolla).
  - Some common OBD codes (P0301, P0171).
  - Mileage.
  - Complaint text.
- Click **Generate Report**:
  - You should see loading → AI output in Tech View, Customer View, and Maintenance Suggestions.
  - Check the `Report` table via Prisma Studio – a new row should be present with the saved data.

### 8.4 Git commit

```bash
git add src/lib/ai/engine.ts src/app/api/generate-report/route.ts
git commit -m "ch8: implement AI engine and core generate-report API"
git push
```

---

## Chapter 9 – Health Check and Basic Rate Limiting

### 9.1 /api/health route

Create `src/app/api/health/route.ts`:

```ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "v0.1.0",
  });
}
```

### 9.2 Simple rate limiter for /api/generate-report

Create `src/lib/rateLimiter.ts`:

```ts
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

type Entry = {
  windowStart: number;
  count: number;
};

const store = new Map<string, Entry>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { windowStart: now, count: 1 });
    return false;
  }

  // reset window
  if (now - entry.windowStart > WINDOW_MS) {
    store.set(key, { windowStart: now, count: 1 });
    return false;
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return true;
  }

  return false;
}
```

Wire it into `/api/generate-report/route.ts`:

```ts
import { isRateLimited } from "@/lib/rateLimiter";

// inside POST handler before heavy work:
const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "unknown";
if (isRateLimited(String(ip))) {
  return NextResponse.json(
    { message: "Too many requests. Please wait a moment and try again." },
    { status: 429 }
  );
}
```

---

### 9.3 Manual testing

- Hit `/api/health` in the browser → you should see `{ status: "ok", version: "v0.1.0" }`.
- On `/app/new-report`, spam the **Generate Report** button:
  - After ~20 requests within a minute, you should receive a 429 error with the friendly message.

### 9.4 Git commit

```bash
git add src/app/api/health/route.ts src/lib/rateLimiter.ts src/app/api/generate-report/route.ts
git commit -m "ch9: add health check and basic rate limiting for generate-report"
git push
```

---

## Chapter 10 – v0 Demo Checklist and Final Polish

### 10.1 UX polish passes

- Make sure labels and helper text are clear and readable.
- Confirm:
  - Disabled/loading states on buttons.
  - Form validation errors show meaningful messages.
- Optionally:
  - Add a small “This month: X reports generated” placeholder somewhere (future upgrade).

### 10.2 v0 demo-ready checklist

Confirm these conditions are true:

- [ ] A user can log in successfully.
- [ ] The **New Report** page loads and is usable.
- [ ] Submitting a valid form calls `/api/generate-report` and:
  - [ ] Writes a report row in Postgres.
  - [ ] Returns a structured response to the frontend.
- [ ] Tech View and Customer View are populated with AI-generated content and editable.
- [ ] Invalid inputs are handled with friendly error messages on the frontend.
- [ ] JSON failures or AI errors are handled with a clear message (no blank screen).
- [ ] `/api/health` returns `status: "ok"`.
- [ ] Basic rate limiting on `/api/generate-report` is active.
- [ ] At least one seeded `shop` and `user` is wired into login and data flow.
- [ ] The system can be used end-to-end for a small set of real-world test cases without crashing.

### 10.3 Manual end-to-end test flow

1. Seed data:
   - One `Shop` (e.g., “Demo Auto Repair”).
   - One `User` with bcrypt-hashed password.
   - A handful of `DtcCode` and `MaintenanceBand` entries.
2. Start the app: `pnpm dev`.
3. Log in at `/login`.
4. Go to `/app/new-report` and create 3–5 different reports:
   - Vary make/model/codes/complaints.
5. For each:
   - Confirm the AI outputs are returned and editable.
   - Check DB `Report` rows for proper saving.
6. Hit `/api/health` directly and confirm status.

### 10.4 Final v0 commit

When everything above is working:

```bash
git add .
git commit -m "ch10: polish UX and finalize OBDscribe v0 demo build"
git push
```

At this point, you have a **functional, stable, and solid-looking v0** of OBDscribe that:

- Matches your product + engineering specs.
- Implements the core New Report → AI → stored report flow.
- Is ready to demo to early shops, advisors, or mentors.
