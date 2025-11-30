"use client";

import { FormEvent, useMemo, useState } from "react";
import { YEARS, MAKES, VEHICLE_MAKE_MODELS } from "@/data/vehicleOptions";

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

  const availableModels = useMemo(() => {
    if (!form.make) return [];
    const models = VEHICLE_MAKE_MODELS[form.make] ?? [];
    // Deduplicate model names so we don't get duplicate React keys (e.g., "C-HR" twice)
    const uniqueModels = Array.from(new Set(models));
    return uniqueModels;
  }, [form.make]);

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
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.year !== undefined ? String(form.year) : ""}
                  onChange={e =>
                    updateField("year", e.target.value ? Number(e.target.value) : undefined)
                  }
                >
                  <option value="">Select year</option>
                  {YEARS.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
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
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.make}
                  onChange={e => {
                    const newMake = e.target.value;
                    setForm(prev => ({
                      ...prev,
                      make: newMake,
                      model: "",
                    }));
                  }}
                >
                  <option value="">Select make</option>
                  {MAKES.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Model</label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  value={form.model}
                  onChange={e => updateField("model", e.target.value)}
                  disabled={!form.make}
                >
                  {!form.make ? (
                    <option value="">Select a make first</option>
                  ) : (
                    <>
                      <option value="">All models</option>
                      {availableModels.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </>
                  )}
                </select>
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