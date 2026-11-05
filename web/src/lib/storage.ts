/** localStorage kann fehlen oder blockiert sein; die App muss trotzdem laufen. */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Gastdaten gelten dann nur bis zum Neuladen
  }
}

/** sessionStorage: bleibt beim Navigieren und Neuladen im selben Browser-Tab, ist nach dem Schliessen weg. */
export function readSession<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.sessionStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeSession(key: string, value: unknown): void {
  try {
    globalThis.sessionStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Blockiert (z. B. privater Modus): Filter gilt dann nur bis zum Seitenwechsel
  }
}
