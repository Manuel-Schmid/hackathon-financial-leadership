import type { Watchlist, WatchlistPatch } from './WatchlistStore';

/**
 * Was beim Speichern von Name und Kunde an den Store geht: null = nichts geändert,
 * 'invalid' = leerer Name (nicht erlaubt). Werte werden getrimmt, ein leerer Kunde wird null.
 */
export function detailsPatch(list: Watchlist, name: string, client: string): WatchlistPatch | null | 'invalid' {
  const nextName = name.trim();
  const nextClient = client.trim() || null;
  if (!nextName) return 'invalid';
  if (nextName === list.name && nextClient === list.clientName) return null;
  return { name: nextName, clientName: nextClient };
}
