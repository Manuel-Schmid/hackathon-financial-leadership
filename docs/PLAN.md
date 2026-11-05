# Umsetzungsplan KUBUS

Stand: Do 05.11.2026, 13:00. Abgabe: Fr 06.11.2026, 12:00. Plan-Dokument (Original, kommentierbar): https://claude.ai/artifact/HVubiJfq5UGerTBJYQED2o

## 1. Ziel
Eine Web-App, die Unternehmen im **Zieldreieck der finanziellen Führung** (Liquidität, Rentabilität, Sicherheit) als interaktiven 3D-Würfel zeigt: filterbar, vergleichbar, mit allen Kennzahlen im Detail. Nutzer: Wealth Manager / Kundenberater, die pro Kunde Watchlists führen.

## 2. Funktionsumfang
### Seiten
1. **Explorer (Start)** – siehe `docs/mockups/explorer.png`
   - Filterleiste: Datenbank (S&P 500, SMI/SMIM, beide), Branche (11 GICS-Sektoren, deutsch), Grösse (Large > 10 Mrd. USD, Mid 2–10, Small < 2), Suche (Name/Ticker), Schalter „Banken & Versicherungen“, Zurücksetzen
   - 3D-Würfel: Achsen Liquidität (x), Rentabilität (y), Sicherheit (z), 0–100. Drehen (OrbitControls), Zoom, Hover-Tooltip (Name + 3 Scores), Klick → Kurzkarte. Punktfarbe = Branche, Punktgrösse = Marktkapitalisierung, gefilterte Firmen ausgegraut/ausgeblendet, Finanzsektor als hohle Punkte. Ideal-Ecke (100/100/100) markiert. Labels nur für ausgewählte + Watchlist-Firmen. Lot-Linien zum Boden für ausgewählte Firmen.
   - Liste rechts: gefilterte Firmen, sortierbar (Gesamt, L, R, S, Name, Börsenwert), drei Mini-Balken, Stern = zur aktiven Watchlist
   - Kurzkarte: 3 Scores, 4–5 Kernkennzahlen mit Ampel, Buttons „★ Favorit“, „Details →“
   - Watchlist-Leiste unten: aktive Watchlist mit Chips, Button „Vergleichen (n) →“
2. **Vergleich** – siehe `docs/mockups/compare.png`
   - bis 4 Firmen: Karten mit Gesamt-Score (nach Profil-Gewichtung) + L/R/S
   - Radar der drei Achsen
   - Tabelle der wichtigsten Kennzahlen (Current Ratio, Cash Ratio, FCF, ROE, EBIT-Marge, ROS, EK-Quote, Verschuldungsgrad, ADG II) mit Richtwert, Ampel, bester Wert pro Zeile hervorgehoben
   - automatisch erzeugtes Kurzfazit (regelbasiert, z.B. „X am sichersten, Y am rentabelsten, Z unter Richtwert bei …“)
3. **Detailseite** (`/firma/:ticker`)
   - Kopf: Name, Ticker, Branche, Index, Börsenwert, Geschäftsjahr, Währung, 3 Scores
   - alle 17 Kennzahlen gruppiert nach Achse: Wert, Formel (Tooltip), Richtwert, Ampel, Sparkline 4 Jahre, Branchen-Median
   - Hinweisbox bei Finanzsektor
4. **Watchlists** – Liste der eigenen Watchlists (anlegen, umbenennen, löschen, aktiv setzen), Kundenname + Anlegerprofil pro Watchlist
5. **Methodik** – Zieldreieck, Formeln + Richtwerte (aus `config/kpis.json` generiert), Scoring-Erklärung, Datenquelle mit Stand-Datum, Grenzen
6. **Login / Registrieren / Profil** – E-Mail + Passwort (Supabase Auth), Profil: Anzeigename, Standard-Anlegerprofil

### Prioritäten
| Priorität | Funktion |
|---|---|
| Must | Würfel mit echten Daten, Filter, Liste, Kurzkarte, Detailseite, Login, Watchlists, Vergleich |
| Should | Ampeln, Sparklines, Branchen-Median, Methodik, Offline-Modus, Kurzfazit |
| Nice | Gewichtungs-Regler live, Bewertungskennzahlen (KGV, EV/EBITDA aus VL6), Zeitachse/Animation, Dark Mode |

## 3. Daten
- Universum: `data/raw/sp500.csv` (503, mit GICS-Sektor) + `data/raw/smi_smim.csv` (50, **Zusammensetzung bitte gegen six-group.com prüfen**, Entwurf aus dem Gedächtnis)
- `data/pipeline/build_tickers.py` → `data/tickers.csv` (Ticker, Name, Sektor, Index, Land)
- `data/pipeline/fetch.py` → yfinance: `balance_sheet`, `income_stmt`, `cashflow` (jährlich, 4 Jahre), `info` (marketCap, currency, financialCurrency); Cache pro Ticker in `data/cache/<ticker>.json`; Pause 0.5–1 s; `--only SMI`, `--limit 50`, `--resume`
- `data/pipeline/kpis.py` → Mapping (siehe `docs/KENNZAHLEN.md`) + Kennzahlen pro Jahr (Formeln je `id` aus `config/kpis.json`)
- `data/pipeline/scoring.py` → Perzentile, Achsen-Scores, Ampeln (Regeln in `docs/KENNZAHLEN.md`)
- `data/pipeline/export_json.py` → `web/public/data/companies.json` (Offline-Modus + Entwicklung)
- `data/pipeline/load_supabase.py` → Upsert in Supabase (Secret Key aus `.env`)
- `data/pipeline/report.py` → Plausibilität: VAT-Check + Top-20-Ausreisser + Anteil fehlender Werte pro Kennzahl
- Tests: `data/tests/test_kpis.py` mit VAT-Referenzwerten

### Supabase-Tabellen (`supabase/schema.sql`)
| Tabelle | Inhalt | Rechte (RLS) |
|---|---|---|
| companies | ticker (PK), name, sector, sector_de, index, country, currency, market_cap_usd, size_class, is_financial, fiscal_year_end | alle lesen |
| financials | ticker, year, jsonb raw | alle lesen |
| kpis | ticker, year, kpi_id, value, ampel | alle lesen |
| scores | ticker, year, liquiditaet, rentabilitaet, sicherheit | alle lesen |
| profiles | id (= auth.users.id), display_name, investor_profile | nur eigene Zeile |
| watchlists | id, user_id, name, client_name, investor_profile, is_active, created_at | nur eigene |
| watchlist_items | watchlist_id, ticker, added_at | nur über eigene Watchlist |
Trigger `on_auth_user_created`: Profil + erste Watchlist „Meine Favoriten“ anlegen. Schreiben auf companies/financials/kpis/scores nur mit Secret Key (Pipeline).

### Datenstruktur im Frontend (gleich für Supabase und JSON)
```ts
type AxisScores = { liquiditaet: number | null; rentabilitaet: number | null; sicherheit: number | null };
type Company = {
  ticker: string; name: string; sector: string; sectorDe: string; index: 'SP500' | 'SMI' | 'SMIM';
  country: string; currency: string; marketCapUsd: number | null; sizeClass: 'Large' | 'Mid' | 'Small';
  isFinancial: boolean; fiscalYear: number; scores: AxisScores;
  kpis: Record<string, { value: number | null; ampel: 'green' | 'yellow' | 'red' | 'grey'; history: { year: number; value: number | null }[] }>;
};
interface DataSource {
  listCompanies(): Promise<Company[]>;
  getCompany(ticker: string): Promise<Company | null>;
  meta(): Promise<{ asOf: string; source: string; count: number }>;
}
interface WatchlistStore { /* list, create, rename, remove, addItem, removeItem, setActive */ }
// Implementierungen: SupabaseSource / JsonSource, SupabaseWatchlistStore / LocalWatchlistStore (Gastmodus)
```

## 4. Technik
| Teil | Wahl |
|---|---|
| Frontend | React 18 + Vite + TypeScript, react-router |
| 3D | three + @react-three/fiber + @react-three/drei (OrbitControls, Html), Punkte als InstancedMesh |
| Diagramme | Recharts (Radar, Sparklines) |
| Styling | Tailwind CSS, Branding-Tokens aus `docs/BRANDING.md` |
| Backend | Supabase (Postgres, Auth E-Mail/Passwort, RLS) via @supabase/supabase-js |
| Pipeline | Python 3.10+, yfinance, pandas, supabase-py, python-dotenv, pytest |
| Tests | Vitest (Frontend-Logik: Ampel, Gewichtung, Filter), pytest (Kennzahlen) |
| Start | `npm install && npm run dev` in `web/` → http://localhost:5173 |

### Ordnerstruktur
```text
Projekt/                      (= Git-Repo)
  CLAUDE.md  README.md  .env (lokal!)  .env.example  .gitignore
  config/      kpis.json, sectors.json            ← eine Quelle der Wahrheit
  data/        raw/, pipeline/, tests/, cache/ (gitignored), tickers.csv
  supabase/    schema.sql, seed_demo.sql
  web/         Vite-App
    src/lib/         config.ts (lädt ../config), format.ts, ampel.ts, weighting.ts, filters.ts
    src/data/        types.ts, DataSource.ts, SupabaseSource.ts, JsonSource.ts, index.ts (Auswahl + Fallback)
    src/auth/        AuthProvider.tsx, useAuth.ts
    src/watchlists/  WatchlistStore.ts, SupabaseWatchlistStore.ts, LocalWatchlistStore.ts, WatchlistProvider.tsx
    src/components/  layout/, cube/, filters/, list/, company/, compare/, ui/
    src/pages/       Explorer, Compare, CompanyDetail, Watchlists, Method, Login, Profile
  docs/        PLAN.md, AUFGABE.md, KENNZAHLEN.md, BRANDING.md, ENTSCHEIDE.md, mockups/, brand/
```

### Umgebungsvariablen (`.env`, nicht im Repo)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...      # Frontend
SUPABASE_SECRET_KEY=...                # nur Pipeline (load_supabase.py)
VITE_DATA_MODE=auto                    # auto | supabase | json
```
Vite liest `.env` aus `web/` – entweder `envDir: '..'` in `vite.config.ts` setzen oder `.env` dorthin kopieren.

## 5. Umsetzung in 8 Schritten (mit Selbstcheck)
1. **Gerüst** – Vite-App in `web/`, Tailwind + Fonts + Tokens, Router, Layout (Kopfzeile mit Logo, Navigation, Datenstand, User), leere Seiten, README, `.gitignore`. *Check:* build, typecheck, Screenshot Startseite.
2. **Datenbank** – `supabase/schema.sql` (Tabellen, RLS, Trigger). In Supabase SQL-Editor ausführen. *Check:* Tabellen sichtbar, Test-User anlegen → Profil + Watchlist entstehen.
3. **Daten** – Pipeline + Tests; zuerst `--only SMI --limit 20`, dann alles. *Check:* pytest grün (VAT-Werte), `report.py` ansehen, JSON + Supabase gefüllt.
4. **Explorer** – Würfel, Filter, Liste, Kurzkarte, Watchlist-Leiste. *Check:* 550 Punkte flüssig, Filter wirken auf Würfel + Liste, Klick öffnet Kurzkarte.
5. **Detailseite** – alle Kennzahlen, Formeln, Richtwerte, Ampeln, Sparklines, Branchen-Median. *Check:* VAT-Seite zeigt Referenzwerte.
6. **Konto** – Login, Registrieren, Profil, Watchlists (Supabase + Gastmodus). *Check:* zwei Konten sehen nur ihre Watchlists.
7. **Vergleich + Methodik** – Karten, Radar, Tabelle, Kurzfazit, Gewichtung nach Profil; Methodik aus `config/kpis.json`. *Check:* 4 Firmen vergleichen, Gewichtung ändert Gesamt-Score.
8. **Absichern** – Offline-Modus (Supabase aus → JSON + LocalStorage), Demo-Konten + Demo-Watchlists (`seed_demo.sql` oder Skript), Lade-/Fehlerzustände, Screenshots aller Seiten nach `docs/screenshots/`. *Check:* App ohne Internet starten.

## 6. Zeitplan
| Zeit | Claude Code | Team |
|---|---|---|
| Do 13:00–15:00 | Schritte 1–2, Pipeline schreiben | Supabase-Schema ausführen, SMI/SMIM-Liste prüfen, Story der Präsentation |
| Do 15:00–18:00 | Schritt 3 (Daten ziehen) + 4 (Explorer) | 10 Firmen gegen Geschäftsberichte prüfen |
| Do 18:00–20:00 | Schritte 5–7 | Erster Test, Fehlerliste |
| **Do 20:00** | **MVP komplett** | |
| Do 20:00–23:00 | Fixes, Schritt 8 | Zweiter Test, Methodik-Texte, `docs/ENTSCHEIDE.md` |
| Fr 07:00–09:00 | letzte Fixes | Gesamttest auf beiden Laptops, Screenshots |
| **Fr 09:00** | **Feature-Freeze** | |
| Fr 09:00–11:00 | Folien-Entwurf, Demo-Skript | Folien, 2× Probe mit Stoppuhr |
| Fr 11:00–12:00 | Puffer | Abgabe |

## 7. Risiken
| Risiko | Gegenmassnahme |
|---|---|
| Yahoo drosselt bei 550 Abrufen | Pausen, Cache, `--resume`; Plan B: SMI/SMIM + 150 grösste S&P-Titel |
| Felder fehlen/heissen anders | Fallback-Mapping, Kennzahl `null`, zählt nicht im Score |
| Kein Internet bei Präsentation | Offline-Modus (JSON + Gast-Watchlists) |
| Login hängt an E-Mail-Bestätigung | „Confirm email“ in Supabase aus, Demo-Konten vorab |
| Würfel ruckelt | InstancedMesh, wenige Labels |
| Zu viel Umfang | Must-Liste, Feature-Freeze Fr 09:00 |
