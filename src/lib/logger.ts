// src/lib/logger.ts
export function logInfo(message: string, meta?: unknown) {
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.log("[INFO]", message, meta ?? "");
  }
}

export function logError(message: string, error?: unknown) {
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error("[ERROR]", message, error);
  }
}