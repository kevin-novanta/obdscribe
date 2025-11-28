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