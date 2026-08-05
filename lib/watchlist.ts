const STORAGE_KEY = "donut-smp-watchlist";
const CHANGE_EVENT = "donut-smp-watchlist-changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getWatchlist(): string[] {
  return read();
}

export function isWatched(slug: string): boolean {
  return read().includes(slug);
}

export function toggleWatched(slug: string): boolean {
  const current = read();
  const watched = current.includes(slug);
  write(watched ? current.filter((s) => s !== slug) : [...current, slug]);
  return !watched;
}

/** Re-invokes the callback whenever the watchlist changes, including from
 * other components in the same tab (custom event) or other tabs (storage
 * event). Returns an unsubscribe function. */
export function subscribeWatchlist(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
