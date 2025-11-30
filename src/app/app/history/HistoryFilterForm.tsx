"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MAKES, VEHICLE_MAKE_MODELS } from "@/data/vehicleOptions";

type HistorySearchParams = {
  make?: string;
  model?: string;
  code?: string;
  q?: string;
  from?: string;
  to?: string;
};

export default function HistoryFilterForm({
  searchParams,
}: {
  searchParams: HistorySearchParams;
}) {
  const router = useRouter();

  // seed from server searchParams
  const [make, setMake] = useState(searchParams.make ?? "");
  const [model, setModel] = useState(searchParams.model ?? "");
  const [code, setCode] = useState(searchParams.code ?? "");
  const [q, setQ] = useState(searchParams.q ?? "");
  const [from, setFrom] = useState(searchParams.from ?? "");
  const [to, setTo] = useState(searchParams.to ?? "");

  const modelsForMake = useMemo(() => {
    if (!make) return [];
    return VEHICLE_MAKE_MODELS[make] ?? [];
  }, [make]);

  // when make changes, clear model + keep it disabled until we recompute
  function handleMakeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setMake(value);
    setModel(""); // reset model whenever make changes
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (code) params.set("code", code);
    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const qs = params.toString();
    router.push(qs ? `/app/history?${qs}` : "/app/history");
  }

  function handleClear() {
    setMake("");
    setModel("");
    setCode("");
    setQ("");
    setFrom("");
    setTo("");
    router.push("/app/history");
  }

  return (
    <form
      className="grid gap-2 md:grid-cols-6 text-sm mb-4"
      onSubmit={handleSubmit}
    >
      {/* Make */}
      <div className="flex flex-col">
        <label className="mb-1">Make</label>
        <select
          name="make"
          value={make}
          onChange={handleMakeChange}
          className="border rounded px-2 py-1 bg-white"
        >
          <option value="">All makes</option>
          {MAKES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Model – greyed out & disabled until make is chosen */}
      <div className="flex flex-col">
        <label className="mb-1">Model</label>
        <select
          name="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border rounded px-2 py-1 bg-white"
          disabled={!make}
        >
          <option value="">
            {make ? "All models" : "Select a make first"}
          </option>
          {make &&
            modelsForMake.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
        </select>
      </div>

      {/* OBD Code */}
      <div className="flex flex-col">
        <label className="mb-1">OBD Code</label>
        <input
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="e.g. P0301"
        />
      </div>

      {/* Complaint search */}
      <div className="flex flex-col md:col-span-2">
        <label className="mb-1">Complaint Search</label>
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="rough idle, misfire..."
        />
      </div>

      {/* From */}
      <div className="flex flex-col">
        <label className="mb-1">From</label>
        <input
          type="date"
          name="from"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* To */}
      <div className="flex flex-col">
        <label className="mb-1">To</label>
        <input
          type="date"
          name="to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-end gap-2 md:col-span-2">
        <button
          type="submit"
          className="border rounded px-3 py-1 text-sm bg-gray-900 text-white"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-gray-600 underline"
        >
          Clear
        </button>
      </div>
    </form>
  );
}