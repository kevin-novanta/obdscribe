# OBDscribe – Master Product & Engineering Spec v0.1

This document unifies three views of OBDscribe into **one concrete spec**:

- **Product roadmap & phases** – what we’re building and how it evolves.
- **Delivery & app shape** – how it shows up for service writers (web app SaaS).
- **Tech stack & AI architecture** – exactly how we’ll build and power it with OpenAI.

Use this as the single source of truth while building v1 and beyond.

---

# OBDscribe – Product Roadmap & App Spec v0.1

This document combines the high-level **product roadmap** (Phases 1–4) with the **delivery & app shape** decisions for OBDscribe. It reflects the current vision:

- Start as a **cloud web app** (desktop-first) with a simple, focused UI.
- Grow through well-defined phases from smart explainer → deep, integrated estimate generator.
- Stay B2B SaaS-focused for independent shops and service advisors.

---

# OBDscribe – Advanced Roadmap: Phases 1–4 (Detailed)

This document expands on the **Future Vision: Advanced OBDscribe Brain** and breaks each phase into:
- Objectives
- Scope (what’s in / out)
- UX overview
- Data & infra needs
- Success metrics
- Risks & guardrails

---

## Phase 1 – Smart Explainer (V1)

### 1. Objective

Deliver a **simple, fast tool** that turns:
- Vehicle info
- OBD codes
- Customer complaint

into:
- A tech-facing summary
- A customer-facing explanation
- Basic maintenance suggestions

…without needing any deep integrations or proprietary data.

### 2. Scope

**In:**
- Single-page web app (manual form input).
- LLM-powered text generation:
  - Tech summary
  - Customer explanation
  - Maintenance “while you’re here” suggestions by mileage band.
- Copy/print workflow:
  - Copy-to-clipboard buttons.
  - Print-friendly layout / export to PDF (even browser-native).

**Out (for now):**
- VIN decoding.
- Price estimation.
- Direct integration with SMS / DVI tools.
- User accounts & history (optional add-on at the tail end of Phase 1).

### 3. UX Overview

**Input section:**
- Year / Make / Model / Trim (free text or dropdowns).
- Mileage (numeric).
- OBD codes (textarea with basic validation, e.g., `P0301, P0171`).
- Complaint (free text).
- Tech notes (optional).

**Output section:**
- Two tabs or stacked cards:
  - **Tech View**
    - Overview
    - Likely causes
    - Recommended diagnostic checks
  - **Customer View**
    - Simple explanation
    - Why it matters
    - Recommended plan (A: must-do, B: optional/preventive)
    - Maintenance suggestions by mileage band

Everything editable inline after generation.

### 4. Data & Infra Needs

- Static JSON/DB:
  - Generic P0xxx code descriptions.
  - Mileage band rules (e.g., generic 30k/60k/90k maintenance ideas).
- Backend:
  - A single `/generate-report` endpoint.
  - LLM access with carefully designed prompts.
- Frontend:
  - Lightweight SPA or Next.js app.
  - Basic styling (Tailwind / simple CSS).

### 5. Success Metrics

- Time-to-first-report for a new user: **< 2 minutes**.
- Generation latency (perceived): **< 5 seconds**.
- Qualitative:
  - 3–6 pilot shops say:
    - “This saves me time.”
    - “This helps me explain jobs more clearly.”
- At least **1–2 shops** agree to pay for a beta plan if kept running.

### 6. Risks & Guardrails

- **Risk:** Overconfident language from the model.
  - **Guardrail:** Prompt to use “likely causes,” “recommended checks,” not definitive statements.
- **Risk:** Advisors feel AI is “too generic.”
  - **Guardrail:** Make output fully editable, encourage them to tweak and save “house style” patterns later.
- **Risk:** Scope creep into full SMS or DVI.
  - **Guardrail:** Keep V1 focused strictly on “codes + complaint → explanations.”

---

## Phase 2 – Context-Aware Diagnostics & Risk

### 1. Objective

Make OBDscribe **smarter about the specific vehicle** and add explicit **risk assessment** so service advisors can talk more confidently about urgency and safety.

### 2. Scope

**In:**
- VIN decoding or structured year/make/model lookup:
  - Engine type, transmission, trim where possible.
- Context-aware prompts:
  - Include platform/engine info in the AI reasoning.
- Explicit risk ratings:
  - Safety risk (low/med/high).
  - Drivability risk (low/med/high).
  - Long-term damage risk (low/med/high).
- Recommendation on:
  - “Is it safe to drive short distances?”
  - “Should this be treated as urgent?”

**Out (for now):**
- Price estimation.
- Deep integration with TSB/recall databases (can be hinted at, but not required).

### 3. UX Overview

**New elements:**
- VIN input (optional but recommended).
  - If VIN is present → decode and auto-fill vehicle details.
- Risk section in the output:
  - A simple block in both Tech and Customer views:
    - Tech View: more detail (why each risk rating was chosen).
    - Customer View: a short, clear line:
      - “We recommend addressing this soon because [reason].”
- Clear “Safe to Drive?” indicator:
  - e.g., “Short trips okay / Avoid highway / Not recommended to drive.”

### 4. Data & Infra Needs

- Integration with a VIN decoder API (for at least US-market vehicles).
- Possibly:
  - A simple internal table for common platform issues (optional, can come later).
- Prompt updates:
  - Include decoded vehicle metadata.
  - Ask model to think explicitly about risk categories.

### 5. Success Metrics

- Advisors say they feel more confident answering:
  - “Can I keep driving this?”
  - “How urgent is this?”
- Reduction in “I’m not sure” moments during phone calls.
- Positive feedback from pilot shops:
  - “This helps me handle nervous customers.”

### 6. Risks & Guardrails

- **Risk:** Overstating safety or danger.
  - **Guardrail:** Use cautious language; advise that final call is up to the shop.
- **Risk:** VIN decode failures / incomplete data.
  - **Guardrail:** Always gracefully fall back to Phase 1 behavior if decode fails.
- **Risk:** Liability fears from shops.
  - **Guardrail:** Clear messaging:
    - “OBDscribe provides guidance, but final decisions rest with your technicians and advisors.”

---

## Phase 3 – Rough Estimate Generator

### 1. Objective

Give service advisors a **sane, editable estimate range** (labor + parts) based on:
- Likely repair jobs inferred from diagnostics.
- The shop’s labor rate.
- Typical labor time and parts cost ranges for common jobs.

This is not perfect, but better than a blank page.

### 2. Scope

**In:**
- Shop-level settings:
  - Hourly labor rate.
- Internal catalog of:
  - Common repair jobs (e.g., O2 sensor replacement, ignition coil + plug, catalytic converter, etc.).
  - Typical labor hour ranges per job.
  - Typical parts price ranges per job (broad bands, not vehicle-specific yet).
- AI planner:
  - Maps likely root causes to likely jobs from the catalog.
  - Bundles jobs into a proposed repair plan.
- Estimate calculator:
  - labor_min = hours_min × rate
  - labor_max = hours_max × rate
  - total_min/max = labor + parts

**Out (for now):**
- Vehicle-specific labor times.
- Real-time parts pricing from a catalog or distributor.
- Taxes, shop fees, and discounts (can be added later).

### 3. UX Overview

**Settings page (shop-level):**
- Labor rate ($/hr).
- Default estimate style:
  - “Conservative” (wider ranges).
  - “Normal.”
  - “Aggressive” (narrower ranges).

**Output additions:**
- For each suggested repair:
  - Job description.
  - Estimated labor hours range.
  - Estimated parts cost range.
  - Total range for that line.
- Summary:
  - Combined estimate range for the whole recommended plan.
- All fields editable directly by the advisor before sharing.

### 4. Data & Infra Needs

- Static internal “job catalog”:
  - Job ID, name, description.
  - Typical labor_min, labor_max.
  - Typical parts_min, parts_max.
- Mapping logic:
  - Codes + symptoms + vehicle context → likely job IDs.
  - This can be:
    - A simple rules engine at first.
    - Augmented by the AI (with safety checks) over time.
- Back-end estimate module to compute ranges.

### 5. Success Metrics

- Advisors use the estimate feature instead of starting from scratch.
- Shops report:
  - Faster time-to-estimate on new jobs.
  - Fewer “I’ll call you back later once I run numbers” delays.
- No major complaints of totally unrealistic estimates (we expect occasional tweaks).

### 6. Risks & Guardrails

- **Risk:** Estimates too optimistic or too low.
  - **Guardrail:** Present as **range**, not exact; bias slightly high on labor hours and parts.
- **Risk:** Shops want more vehicle-specific accuracy.
  - **Guardrail:** Communicate this as an “assist tool,” and position Phase 4 as the answer for deeper accuracy.
- **Risk:** AI picks a weird job.
  - **Guardrail:** Advisors must approve each job line; provide a way to add/remove jobs manually.

---

## Phase 4 – Deep Data Mode / Integrations

### 1. Objective

Supercharge accuracy by integrating with:
- Labor time guides.
- Parts catalogs.
- Shop Management Systems (SMS) that already manage labor and parts.

OBDscribe becomes a **draft RO generator**, not just a narrative builder.

### 2. Scope

**In:**
- Integration with at least one:
  - Labor time provider (Mitchell1, ALLDATA, MOTOR, etc.).
  - Parts catalog / distributor or SMS that holds this data.
- VIN + job →:
  - Specific labor hours.
  - Part numbers and pricing from the shop’s preferred sources.
- AI-generated:
  - Draft RO with:
    - Line items.
    - Quantities.
    - Labor hours.
    - Parts and prices from real data.
  - Narrative explanation to accompany the RO.

**Out:**
- Acting as a full SMS replacement.
- Handling payments, full accounting, or deep inventory management (we remain a copilot that plugs into those systems).

### 3. UX Overview

**New capabilities:**
- After diagnostics + plan:
  - “Pull real labor & parts” button.
- OBDscribe:
  - Queries labor time guide with VIN + job.
  - Queries parts catalog or SMS for parts pricing.
- Displays:
  - Concrete line items with:
    - Job labels.
    - Labor hours.
    - Part names, SKUs, and prices.
  - Advisors can:
    - Edit line items.
    - Delete or add lines.
    - Push the final set into their SMS as an RO/estimate.

### 4. Data & Infra Needs

- Secure API integrations with:
  - Labor time databases.
  - Parts catalogs or SMS.
- OAuth / API keys per shop.
- Better logging and error handling:
  - If a lookup fails, we fall back to Phase 3 ranges.

### 5. Success Metrics

- Shops using integrated mode on a meaningful percentage of qualifying jobs.
- Measured reduction in:
  - Time to produce a polished estimate.
- Qualitative:
  - “This feels like it’s tied into our real data.”
- Foundation for:
  - Charging higher-tier pricing (Pro/Enterprise).

### 6. Risks & Guardrails

- **Risk:** Integration complexity and support burden.
  - **Guardrail:** Start with **one** or two partners and nail their flows before expanding.
- **Risk:** Data mismatch (e.g., wrong part for a VIN).
  - **Guardrail:** Always let the advisor review and edit; never auto-approve or auto-send without human review.
- **Risk:** Dependence on specific vendors.
  - **Guardrail:** Abstract integrations behind a clean internal interface; keep the option to swap providers.

---

## Phase Summary Table (Quick View)

| Phase | Nickname                      | Core Value                                      | Data Complexity | Integration Level |
|------|-------------------------------|------------------------------------------------|-----------------|-------------------|
| 1    | Smart Explainer               | Turns codes + complaint → clear explanations   | Low             | None              |
| 2    | Context-Aware & Risk          | Vehicle-aware reasoning + explicit risk levels | Low–Medium      | VIN decode only   |
| 3    | Rough Estimate Generator      | Adds editable estimate ranges                  | Medium          | None              |
| 4    | Deep Data / Integrated Drafts | Uses real labor & parts data for draft ROs     | High            | High              |

This roadmap keeps OBDscribe shippable early while still pointing toward a very powerful, VIN-aware, estimate-generating copilot for real-world shops.


---

# OBDscribe – Delivery & App Shape v0.1

## 1. Deployment Decision

**Platform:**  
- Primary: **Cloud web app**, optimized for desktop browsers.  
- Secondary (later): optional desktop wrapper (Electron/Tauri) and/or mobile companion.

**Why web first:**
- Fastest to ship and iterate.
- No installers or OS-specific headaches.
- Works on the PCs service writers already use at the counter.

---

## 2. App Structure (Routes & Navigation)

### 2.1 High-level routes

- `/login` – sign in
- `/signup` – invite-only or “request access” during early beta
- `/app/new-report` – **default landing after login**
- `/app/history` – list of past reports (optional in V1)
- `/app/settings` – shop info, labor rate, logo, user management (later)
- `/app/billing` – plan info, link to Stripe customer portal (later)

### 2.2 Layout

Think “TorqueDesk / shop software” but simpler:

**App shell:**
- Top bar:
  - Left: OBDscribe logo
  - Right: Shop name, user avatar dropdown (Profile, Settings, Logout)
- Left nav (vertical):
  - New Report
  - History
  - Settings
- Main content:
  - Changes depending on route, but **New Report** is the primary screen.

---

## 3. New Report Screen (Core UX)

### 3.1 Inputs (left column or top section)

- **Vehicle**
  - Year (input or dropdown)
  - Make (dropdown)
  - Model (dropdown/free text)
  - Trim (optional)
  - Mileage

- **Diagnostics**
  - OBD Codes (textarea, e.g. `P0420, P0301`)
  - Complaint (textarea – customer description)
  - Tech Notes (optional textarea – advisor/tech notes)

- Button: **[Generate Report]**

### 3.2 Outputs (right column or bottom section)

Tabs or stacked cards:

1. **Tech View**
   - Overview
   - Likely Causes
   - Recommended Checks
   - Risk Assessment (low/med/high – future Phase 2)

2. **Customer View**
   - What’s Happening
   - Why It Matters
   - Our Recommendation (Plan A / Plan B)
   - Maintenance Suggestions (based on mileage band)

**Actions:**
- Editable textareas for each section.
- Buttons:
  - **Copy Tech Summary**
  - **Copy Customer Explanation**
  - (Later) **Print / Download PDF**

---

## 4. Auth & Multi-tenant Shape

### 4.1 User model

- `Shop` (tenant)
  - name
  - address (optional)
  - labor_rate (for future estimates)
  - logo_url (future)

- `User`
  - email, password hash
  - role: `owner` | `advisor` (future)
  - shop_id (FK)

For V1, you can keep it to:
- Single user per shop,
- Manual onboarding (you create them in the DB).

### 4.2 Permissions (simple for now)

- Any logged-in user:
  - Can create reports for their shop.
  - Can see their shop’s history (if you implement history).
- Only `owner`:
  - Access to billing/settings (later).

---

## 5. Usage & Pricing Implementation (Early)

### 5.1 Usage tracking

Even if you don’t expose “credits” yet, track:

- `Report` table:
  - id
  - shop_id
  - user_id
  - inputs JSON (vehicle, codes, complaint)
  - outputs JSON (tech_view, customer_view, etc.)
  - created_at

From this you can derive:
- Reports per shop/month,
- Popular codes, etc.

### 5.2 UX for usage (without feeling consumer-y)

In `/app/settings` or a small card on New Report:

> **This month:** 23 reports generated

That’s it. No big “N of 100 credits” bar unless you decide to go usage-based later.

---

## 6. Suggested Tech Stack

You can swap pieces, but something like:

- **Frontend:** Next.js (React)  
- **UI:** Tailwind CSS  
- **Backend:** Next.js API routes or a small Node/Express server  
- **DB:** Postgres (Supabase / Railway / Neon)  
- **Auth:** NextAuth or Supabase Auth  
- **Payments (later):** Stripe (customer portal for self-serve plan changes)

---

## 7. Concrete Build Plan (Phase 0 – Ship Something)

### Step 1 – Skeleton app

1. `npx create-next-app obdscribe`
2. Build a layout with:
   - `/login` (fake login or hardcoded for now)
   - `/app/new-report` with the input + output sections
3. Hardcode a dummy API route (`/api/generate-report`) that returns mock text so you can design the UI before wiring real AI.

### Step 2 – Hook up the LLM

1. Implement `/api/generate-report`:
   - Validate inputs.
   - Build a structured prompt (like we specced earlier).
   - Call the AI model.
   - Return JSON: `{ tech_view, customer_view, maintenance_suggestions }`.
2. On the frontend:
   - Show loading state.
   - Render the returned text in editable textareas.

### Step 3 – Minimal auth

- Add very basic email/password login with a single seeded user (you) + maybe one test shop.
- Later, add proper signup/onboarding flows.

### Step 4 – Pilot with 1–2 shops

- Run it as a **single-tenant-ish** thing at first:
  - You manually create accounts in the DB.
- Gather:
  - Where they get confused,
  - What they wish it did,
  - Where the AI output isn’t trustworthy.

Then iterate.

---

## 8. Later: How to “upgrade” without rewriting

When you’re ready to make it feel more like TorqueDesk’s “local app”:

- Keep this same web app.
- Add:
  - Electron/Tauri wrapper that opens `https://app.obdscribe.com` inside a window.
  - Native icon + app name.
  - Auto-update pipeline.

No major refactor. You’re just giving shops an **“Install OBDscribe”** button on top of the SaaS you already built.



---

# OBDscribe – Tech Stack & AI Architecture v0.1

Goal: Build a **cloud web app** that uses a **powerful but affordable OpenAI reasoning model** to turn vehicle info + OBD codes + complaints into structured reports, with a clear path for the system to **get smarter over time** and use **live / up-to-date research** when needed.

We will:

- Use an advanced reasoning model (e.g. `gpt-5.1-thinking`).
- Enable tools for:
  - Web browsing / live search.
  - (Later) VIN decoding, job lookup, and possibly other custom tools.

---

## 1. High-Level Architecture

### 1.1 Components

- **Frontend Web App**
  - Tech: **Next.js (React)** + **TypeScript** + **Tailwind CSS**
  - Role:
    - UI for service writers (New Report, History, Settings).
    - Handles auth, forms, and displaying/editing AI output.

- **Backend / API Layer**
  - Tech: **Node.js + TypeScript**
    - Either:
      - Next.js API routes, or
      - Separate Express/NestJS service if you want hard separation later.
  - Role:
    - Validate requests.
    - Enrich inputs (code meanings, mileage bands, etc.).
    - Call the AI engine (OpenAI) via API.
    - Persist reports & metadata in DB.

- **AI Engine Layer**
  - Tech: Internal **`ai-engine` module/service** that wraps the OpenAI API.
  - Role:
    - Own prompts and schemas.
    - Handle tool-calling / JSON output.
    - Provide versioned “pipelines” (v1 explainer, v2 risk, v3 estimates, etc.).

- **Database**
  - Tech: **Postgres** (Supabase / Neon / Railway)
  - Role:
    - Shops, users, reports.
    - Code description tables.
    - Job catalog and cost ranges (later phases).
    - Feedback / ratings data for “getting smarter”.

- **Object / Log Storage** (optional but good)
  - Tech: S3-compatible (AWS S3, Cloudflare R2, Supabase storage)
  - Role:
    - Store raw AI request/response logs (for debugging/training).
    - Store generated PDFs if you go that route.

---

## 2. Frontend Stack Details

### 2.1 Next.js + Tailwind

- **Next.js**
  - File-based routing for `/login`, `/app/new-report`, `/app/history`, `/app/settings`.
  - Server-side rendering / static generation for fast load on shop desktops.
- **Tailwind CSS**
  - Fast iteration on UI.
  - Easy to give a “desktop app” look (TorqueDesk-style) with a left nav + main pane.

### 2.2 Core UI Pieces

- `NewReportPage`
  - Form for vehicle + codes + complaint.
  - Calls `/api/generate-report`.
  - Shows loading → then Tech View / Customer View outputs.

- `HistoryPage`
  - Table of past reports.
  - Filters by date, vehicle, codes.

- `SettingsPage`
  - Shop name, logo.
  - Labor rate (for future estimates).

- `Auth`
  - Simple email/password login (NextAuth or Supabase Auth to start).

---

## 3. Backend & API Design

### 3.1 Core endpoint: `/api/generate-report`

**Request (v1):**

```json
{
  "vehicle": {
    "year": 2018,
    "make": "Toyota",
    "model": "Corolla",
    "trim": "SE",
    "mileage": 60500
  },
  "codes": ["P0301", "P0171"],
  "complaint": "Check engine light, rough idle at stops.",
  "notes": "Happens mostly on cold start.",
  "shopId": "shop_123"
}
```

**Backend steps:**

1. **Validate & normalize**
   - Ensure codes look like `P0XXX`, uppercase, trimmed.
2. **Enrich**
   - Look up code meanings from a local table: `DtcCode { code, generic_meaning }`.
   - Determine mileage band (e.g., 0–30k, 30–60k, 60–90k).
3. **Call AI Engine**
   - Pass structured context into `aiEngine.generateReport(...)`.
4. **Persist**
   - Save inputs + AI outputs into `Report` table.
5. **Return JSON**
   - `tech_view`, `customer_view`, `maintenance_suggestions`.
   - (Later) `riskAssessment`, `estimateRange`, etc.

### 3.2 AI Engine Interface (TypeScript)

```ts
type GenerateReportInput = {
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim?: string;
    mileage?: number;
  };
  codes: { code: string; meaning: string }[];
  complaint: string;
  notes?: string;
  shopContext?: {
    laborRate?: number;
  };
};

type RiskLevel = "low" | "medium" | "high";

type GenerateReportOutput = {
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

export async function generateReport(
  input: GenerateReportInput
): Promise<GenerateReportOutput> {
  // calls OpenAI + post-processing here
}
```

Keep this interface stable so you can change internals (prompts, models, tools) without breaking the rest of the app.

---

## 4. AI Model Choice & “Live Research”

### 4.1 OpenAI model strategy

You want:

- Advanced reasoning  
- Affordable enough for frequent use  
- Ability to call tools for:
  - Web search / “live” lookups (e.g., recall info, newer repair bulletins, more up-to-date explanations)
  - (Later) internal tools like a VIN decoder, job catalog lookup, etc.

So:

- **Primary model:** an OpenAI reasoning / thinking model (e.g. `gpt-5.1-thinking`) for all report generation.
- **Tooling:**
  - A `web_search` / `browser` tool your AI engine can call for:
    - Up-to-date generic automotive info.
    - Newer bulletins or patterns if needed.
  - A `vin_decode` tool (your API) for taking VIN → structured vehicle data.
  - A `job_lookup` tool (later) for reading your internal job catalog for estimates.

You’ll configure the OpenAI chat call roughly like:

```ts
const response = await openai.chat.completions.create({
  model: "gpt-5.1-thinking",
  tools: [
    // web search tool
    // vin decode tool
    // job lookup tool
  ],
  tool_choice: "auto",
  response_format: { type: "json_object" },
  messages: [...]
});
```

### 4.2 Prompt strategy (v1 explainer)

- **System message:**
  - You are an experienced automotive technician and service advisor.
  - You:
    - Explain in clear language.
    - Never claim 100% certainty.
    - Respect that final diagnosis belongs to humans.

- **Context message:**
  - Include:
    - Vehicle info.
    - Code list with meanings.
    - Complaint + notes.
    - Mileage + mileage band.
    - Any shop labor rate (for future estimates).

- **User / tool instructions:**
  - Ask for a JSON object matching `GenerateReportOutput`.
  - Tell it when it is allowed to call tools:
    - e.g. “If you’re unsure of a code meaning or need more context, you may use the `web_search` tool.”

### 4.3 How it gets smarter over time

The “brain” improves via:

1. **Prompt versioning**
   - Start with `prompt_version = 1`.
   - Save `prompt_version` with each report.
   - When you tune prompts (change tone, structure, risk language), bump to `2`, `3`, etc.

2. **Context upgrades**
   - Phase 2:
     - Always include decoded VIN info (engine, transmission, etc.).
   - Phase 3:
     - Include a list of relevant jobs from the job catalog and their typical hours/parts ranges.
   - Phase 4:
     - Include lookup results from real labor/time + parts integrations.

3. **Feedback data**
   - Add per-report fields:
     - `advisor_rating` (1–5).
     - `advisor_feedback` (short note).
   - Periodically review low-rated outputs → adjust prompts, rules, or tool usage.

4. **Model upgrades**
   - Keep the `ai-engine` layer generic:
     - It knows which OpenAI model to call.
   - When OpenAI updates models:
     - You only need to change model name + maybe tool configuration in one place.

---

## 5. Data & “Knowledge” Layer

### 5.1 Early static data

- `dtc_codes` table:
  - `code` (PK)
  - `generic_meaning`
  - `category` (optional, e.g., emissions, ignition, fuel system)

- `maintenance_bands` table:
  - `0–30k`, `30–60k`, `60–90k`, etc.
  - Generic suggestions for each band.

- `job_catalog` table (Phase 3+):
  - `job_id`, `name`, `description`
  - `labor_min`, `labor_max`
  - `parts_min`, `parts_max`

You feed this data into the AI as context and/or via tools so it doesn’t hallucinate numbers.

### 5.2 Retrieval (later)

Once you have enough history:

- Index:
  - Past reports.
  - Patterns by code + vehicle.
- At generation time:
  - Retrieve similar cases → include short summaries in the prompt so the model can see:
    - “Here’s how similar cases were explained previously.”

---

## 6. Infra & Deployment

### 6.1 Hosting

- **Frontend + API**
  - Next.js app on **Vercel**, or
  - Frontend on Vercel + backend on Railway/Fly.io.

- **Database**
  - Managed Postgres:
    - **Supabase**, **Neon**, or **Railway**.

- **Secrets**
  - Store API keys (OpenAI, VIN decoder, etc.) in:
    - Vercel environment variables.
    - Or equivalent secret managers.

### 6.2 Observability

- Log:
  - AI requests (sanitized).
  - AI responses.
  - Any tool calls (`web_search`, `vin_decode`, `job_lookup`).
- Track:
  - Latency per `/api/generate-report`.
  - Error rate in VIN decode, etc.

---

## 7. Phase-by-Phase AI Evolution (Tech View)

### Phase 1 – Smart Explainer

- **Model:**
  - OpenAI reasoning model (`gpt-5.1-thinking` or similar).
- **Tools:**
  - None or minimal (maybe VIN decode later).
- **Output:**
  - Tech + customer views, maintenance suggestions.

### Phase 2 – Context & Risk

- **Model:**
  - Same reasoning model.
- **Tools:**
  - VIN decode.
  - Optional `web_search` for rare code clarifications.
- **Output:**
  - Adds `riskAssessment` block.

### Phase 3 – Rough Estimates

- **Model:**
  - Same reasoning model.
- **Tools:**
  - `job_lookup` tool that returns typical labor/parts ranges.
- **Output:**
  - Adds `estimateRange` field.
- **Math:**
  - Calculated on backend using shop’s labor rate.

### Phase 4 – Deep Data Integrations

- **Model:**
  - Same or upgraded OpenAI reasoning model.
- **Tools:**
  - External APIs:
    - Labor time guide.
    - Parts catalog.
    - SMS integrations.
- **Output:**
  - More precise estimates and draft RO data.

---

## 8. Summary

- **Frontend:** Next.js + TypeScript + Tailwind.
- **Backend:** Node/TypeScript + Postgres.
- **AI:** OpenAI advanced reasoning model (e.g., `gpt-5.1-thinking`) wrapped by your own `ai-engine`, with tools for:
  - VIN decode,
  - Job lookup,
  - Live web search when necessary.
- **Growth path:** start as a smart explainer and gradually layer in risk, estimates, and deep integrations as your data and usage grow.


---

# OBDscribe – v0 Implementation Notes and Constraints

This section refines the v0 (first working version) of OBDscribe, focusing on:
- What is actually implemented in the first build.
- What is explicitly deferred to later phases.
- Operational and safety concerns such as JSON reliability and rate limiting.

## 1. v0 Scope Adjustments

### 1.1 AI tools (web_search, vin_decode, job_lookup)

For **v0**, the AI engine will **not** use external tools:

- No `web_search` / browsing.
- No `vin_decode` tool.
- No `job_lookup` tool.

Instead, v0 will rely on:

- A single OpenAI reasoning model call.
- Local enrichment only (e.g., DTC meanings and mileage band classification from Postgres).

The tools remain part of the **future architecture**, but are not wired in for the first release. This keeps v0 simpler, faster, and easier to debug.

### 1.2 API surface (routes)

Full target API surface:

- `/api/generate-report` – core report generation.
- `/api/reports` – list reports (history).
- `/api/settings` – shop settings.
- `/api/auth/login` – login.
- `/api/health` – health check.

For **v0**, implementation is prioritized as:

- **Must-have now:**
  - `/api/generate-report`
  - `/api/auth/login` (even minimal / single-user is OK)

- **Nice-to-have shortly after v0 (v0.1+):**
  - `/api/reports`
  - `/api/settings`

- **Operational:**
  - `/api/health` should be implemented even in early v0 for debugging and uptime checks.

## 2. JSON Reliability and Error Handling

### 2.1 JSON-only contract

The `ai-engine` must treat JSON reliability as a first-class concern:

- All calls to OpenAI will request **JSON output only**.
- After receiving a response:
  - Attempt to parse JSON.
  - If parsing fails:
    - Option A: make a single retry with a stricter “return valid JSON only” instruction.
    - Option B (simpler for first pass): return a controlled error to the frontend.

Frontend behavior:

- Show a clear error message (“We could not generate a structured response. Please try again.”).
- Do not silently fail or show partial garbage output.

### 2.2 Error handling cases

Back-end error classes to explicitly handle:

- OpenAI error (timeout, quota, 5xx).
- Database error on save.
- Unexpected internal error.

Guidelines:

- If AI succeeds but DB save fails, still return the AI result to the frontend (log the DB error and mark it for investigation).
- All unexpected errors should be logged with a correlation ID so specific failures can be traced later.

## 3. Rate Limiting and Safety

Even for early pilots, add a lightweight rate-limit layer around `/api/generate-report`:

- Example: max N requests per IP or per user per minute.
- On limit exceeded, return a `429 Too Many Requests` with a friendly message.

This protects against:

- Accidental infinite loops in the frontend.
- Users hammering the button repeatedly.
- Cost overruns from a runaway bug.

Implementation detail is flexible (middleware, edge function, or library), but **some form of guard** should exist from day one.

## 4. Prompt Versioning and Modes

### 4.1 Prompt versioning

Add a `prompt_version` concept in the `ai-engine`:

- A constant such as `PROMPT_VERSION = "1"`.
- Include this:
  - In the prompt metadata.
  - In the `Report` row as `prompt_version`.

When prompts are changed (tone, structure, risk language), bump to `"2"`, `"3"`, etc. This makes it possible to compare behavior over time and understand why older reports might look different from newer ones.

### 4.2 Mode field in GenerateReportInput

Extend `GenerateReportInput` with a `mode` field:

- `mode?: "production" | "sandbox" | "debug"`

Semantics:

- `production`: real shops, normal logging, user-facing behavior.
- `sandbox`: internal / test usage (e.g., you testing against your own vehicles).
- `debug`: may enable extra logging or metadata later (token usage, internal reasoning snapshots, etc.).

For v0, logic can treat all modes the same; the key is to have the field in the type and persisted so future differentiation does not require a breaking change.

## 5. Multi-tenant Foundation from Day One

Even if early usage is just the founder or a very small number of shops, the data model should still:

- Use distinct `shops` and `users` tables.
- Always associate `Report` rows with a `shop_id` and `user_id`.

This aligns with the multi-tenant shape in the main spec and avoids painful refactors when onboarding real pilot shops.

In practice for v0:

- You may seed a single shop (e.g., `shop_demo`) and a single user.
- Auth can be minimal (single email/password), but still wired to that shop/user pair.
