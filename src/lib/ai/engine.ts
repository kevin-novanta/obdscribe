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

  const dtcMap = new Map(dtcRows.map((row: { code: string; genericMeaning: string }) => [row.code, row.genericMeaning] as const));

  const codesWithMeaning = codesNormalized.map((code: string) => ({
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