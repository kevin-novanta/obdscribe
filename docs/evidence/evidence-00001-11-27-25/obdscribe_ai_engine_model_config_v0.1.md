# OBDscribe – AI Engine Model Config & Troubleshooting v0.1

## 1. Purpose

This document captures how the OBDscribe AI engine is currently configured to talk to OpenAI, how models are selected (default vs premium), and how to fix the common errors you just hit (`model_not_found` and duplicate `completion` variable).

---

## 2. File: `src/lib/ai/engine.ts` (current structure)

Key pieces:

```ts
import OpenAI from "openai";
import { GenerateReportInput, GenerateReportOutput } from "../../types/report";
import { prisma } from "../db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT_VERSION = "1";
const DEFAULT_MODEL = process.env.OBDSCRIBE_AI_MODEL ?? "gpt-5-mini";
const PREMIUM_MODEL = process.env.OBDSCRIBE_AI_MODEL_PREMIUM ?? "gpt-5.1";

export async function generateReport(
  input: GenerateReportInput
): Promise<GenerateReportOutput> {
  const mode = input.mode ?? "production";
  const model = mode === "premium" ? PREMIUM_MODEL : DEFAULT_MODEL;

  const codesNormalized = input.codes
    .map((c: string) => c.trim().toUpperCase())
    .filter(Boolean);

  const dtcRows = await prisma.dtcCode.findMany({
    where: { code: { in: codesNormalized } },
  });

  const dtcMap = new Map(
    dtcRows.map(
      (row: { code: string; genericMeaning: string }) =>
        [row.code, row.genericMeaning] as const
    )
  );

  const codesWithMeaning = codesNormalized.map((code: string) => ({
    code,
    meaning:
      dtcMap.get(code) ?? "Unknown code (provide a generic explanation).",
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

  const aiResponse = await openai.chat.completions.create({
    model,
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

  const raw = aiResponse.choices[0]?.message?.content ?? "{}";
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

---

## 3. Model selection logic

### 3.1 Modes

The engine uses an explicit mode on the input:

```ts
export type GenerateReportMode = "production" | "sandbox" | "debug" | "premium";
```

Inside `generateReport`:

```ts
const mode = input.mode ?? "production";
const model = mode === "premium" ? PREMIUM_MODEL : DEFAULT_MODEL;
```

So:

- If `input.mode === "premium"` → use `PREMIUM_MODEL`
- Otherwise → use `DEFAULT_MODEL`

### 3.2 Default and premium model constants

At the top of `engine.ts`:

```ts
const DEFAULT_MODEL = process.env.OBDSCRIBE_AI_MODEL ?? "gpt-5-mini";
const PREMIUM_MODEL = process.env.OBDSCRIBE_AI_MODEL_PREMIUM ?? "gpt-5.1";
```

This means:

- If `OBDSCRIBE_AI_MODEL` is set in the env, that value is used.
- If not, it falls back to `"gpt-5-mini"`.
- If `OBDSCRIBE_AI_MODEL_PREMIUM` is set, that value is used.
- If not, it falls back to `"gpt-5.1"`.

### 3.3 Recommended env values

For your local dev / v0:

```env
# OpenAI API key (required)
OPENAI_API_KEY=sk-...your-key-here

# Default model for normal usage (cheap, fast)
OBDSCRIBE_AI_MODEL=gpt-5-mini

# Premium / deep-dive / “second opinion” model
OBDSCRIBE_AI_MODEL_PREMIUM=gpt-5.1
```

If you ever want to force everything onto the big model for testing, you can temporarily set:

```env
OBDSCRIBE_AI_MODEL=gpt-5.1
```

---

## 4. Common errors and fixes

### 4.1 `model_not_found` with `gpt-5.1-mini`

**Error:**

```text
404 The model `gpt-5.1-mini` does not exist or you do not have access to it.
code: 'model_not_found'
```

**Cause:**

- `gpt-5.1-mini` is **not** a valid model name.
- Either:
  - Your `.env.local` or `.env` still has `OBDSCRIBE_AI_MODEL=gpt-5.1-mini`, or
  - The fallback in `engine.ts` used to be `"gpt-5.1-mini"`.

**Fix:**

1. In `.env.local` and `.env`, make sure you have:

   ```env
   OBDSCRIBE_AI_MODEL=gpt-5-mini
   OBDSCRIBE_AI_MODEL_PREMIUM=gpt-5.1
   ```

   Remove any `gpt-5.1-mini` strings.

2. In `engine.ts`, confirm:

   ```ts
   const DEFAULT_MODEL = process.env.OBDSCRIBE_AI_MODEL ?? "gpt-5-mini";
   const PREMIUM_MODEL = process.env.OBDSCRIBE_AI_MODEL_PREMIUM ?? "gpt-5.1";
   ```

3. Restart the dev server so env changes apply:

   ```bash
   pnpm dev
   ```

### 4.2 `the name 'completion' is defined multiple times`

**Error:**

```text
./src/lib/ai/engine.ts
the name `completion` is defined multiple times
```

**Cause:**
- There were two `const completion = ...` declarations in the same scope, which Turbopack doesn’t like.

**Fix (now applied):**

- The variable was renamed from `completion` to `aiResponse`, and the reference updated:

  ```ts
  const aiResponse = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [ /* ... */ ],
  });

  const raw = aiResponse.choices[0]?.message?.content ?? "{}";
  ```

After this change, there is no longer any `completion` variable in `generateReport`, so the duplicate-name error goes away.

---

## 5. How to test that everything works

1. Ensure env is set:

   ```env
   OPENAI_API_KEY=sk-...
   OBDSCRIBE_AI_MODEL=gpt-5-mini
   OBDSCRIBE_AI_MODEL_PREMIUM=gpt-5.1
   ```

2. Restart dev:

   ```bash
   cd "/Users/kevinnovanta/OBDscribe"
   pnpm dev
   ```

3. Log in with your seeded user:

   - Email: `demo@shop.com`
   - Password: `DemoPass123!`

4. Go to `/app/new-report`, fill a test case:

   - Year: 2018
   - Make: Toyota
   - Model: Corolla
   - Codes: `P0301, P0171`
   - Complaint: “Check engine light, rough idle at stops.”

5. Hit **Generate report**.

   - If everything is correct, you should see a generated **Tech View** and **Customer View** populated from the model.
   - If there’s another error, the server log will show it and you can add a new troubleshooting note to this doc.

---

## 6. Future tweaks

- Add a **UI toggle** or `mode` field in the request body so a shop can request `mode: "premium"` explicitly.
- Log the `model` actually used for each report (e.g. `model_used` field in the `Report` table) so you can measure cost vs. satisfaction later.
- Optionally add a watchdog that throws a clear error if `OPENAI_API_KEY` is missing or if `model` starts with an unknown prefix.
