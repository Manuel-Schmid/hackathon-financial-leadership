/** Lokales Datum als JJJJ-MM-TT (toISOString wäre UTC und abends schon der nächste Tag). */
export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Dokumenttitel während des Drucks: Browser schlagen ihn als PDF-Dateinamen vor.
 * Kunde, sonst Name der Watchlist; in Dateinamen verbotene Zeichen werden zu «-».
 */
export function reportTitle(list: { name: string; clientName: string | null }, date: Date): string {
  const who = (list.clientName || list.name).replace(/[\\/:*?"<>|]/g, '-');
  return `KUBUS Kundenreport – ${who} – ${isoDate(date)}`;
}
