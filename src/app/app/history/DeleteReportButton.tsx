"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DeleteReportButtonProps = {
  reportId: string;
};

export function DeleteReportButton({ reportId }: DeleteReportButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let message = "Failed to delete report";
        try {
          const body = await res.json();
          if (body?.message) {
            message = body.message;
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      // Refresh the history page so the deleted row disappears
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete report");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 underline disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error && (
        <span className="text-xs text-red-500">
          {error}
        </span>
      )}
    </span>
  );
}