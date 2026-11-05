import { useEffect, useState } from 'react';
import { readSession, writeSession } from './storage';

/**
 * Wie useState, aber im sessionStorage gemerkt: bleibt beim Seitenwechsel und Neuladen im selben
 * Browser-Tab erhalten und ist nach dem Schliessen des Fensters weg. `restore` prüft den gespeicherten Wert.
 */
export function useSessionState<T>(key: string, restore: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => restore(readSession<unknown>(key, null)));
  useEffect(() => writeSession(key, value), [key, value]);
  return [value, setValue] as const;
}
