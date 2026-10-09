/**
 * A small stale-while-revalidate store for API data, shared by `useCached`.
 *
 * Entries live in memory and, optionally, in sessionStorage — so a return visit
 * (or a reload) paints the last known data immediately while a fresh copy is
 * fetched. sessionStorage rather than localStorage because this is private,
 * per-user data: it should not outlive the tab.
 */
export type CacheEntry<T> = { data: T; at: number };

const PREFIX = 'pp-cache:';
const memory = new Map<string, CacheEntry<unknown>>();

export function readCache<T>(key: string, persist: boolean): CacheEntry<T> | null {
  const hit = memory.get(key);
  if (hit) return hit as CacheEntry<T>;
  if (!persist || typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    memory.set(key, entry);
    return entry;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, entry: CacheEntry<T>, persist: boolean): void {
  memory.set(key, entry);
  if (!persist || typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full or blocked: the in-memory copy still serves this tab.
  }
}

/** Called on every sign-in and sign-out, so one account never sees another's data. */
export function clearDataCache(): void {
  memory.clear();
  if (typeof window === 'undefined') return;
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith(PREFIX)) sessionStorage.removeItem(key);
  }
}
