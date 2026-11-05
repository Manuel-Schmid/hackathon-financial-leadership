# Programmierplan KUBUS

Technische Ergänzung zu `docs/PLAN.md`: Der Plan sagt, **was** wir bauen. Dieses Dokument sagt, **wie der Code aufgeteilt ist**, was fertig ist und wo man etwas ändert. Bitte den Stand unten nachführen.

## Stand

| Schritt | Inhalt | Status |
|---|---|---|
| 1 | Gerüst Frontend (Vite, Tailwind, Router, Layout) | fertig |
| 2 | Datenbank (`supabase/schema.sql`) | ausgeführt; öffentlich lesen geht, öffentlich schreiben wird blockiert |
| 3a | Pipeline: Ticker, Mapping, Kennzahlen, Scoring, JSON-Export | fertig, Tests grün (u. a. VAT 2025, Geberit 2015) |
| 3b | Yahoo-Abruf (`fetch.py`) | gelaufen, Ergebnis in `web/public/data/companies.json` |
| 3c | `load_supabase.py` | gelaufen; `SupabaseSource` liefert dieselben Daten wie `companies.json` (0 Abweichungen, Tabelle `financials` bleibt leer) |
| 4 | Explorer: Würfel, Filter, Liste, Kurzkarte, Watchlist-Leiste | fertig, im Browser geprüft |
| 5 | Detailseite | fertig, im Browser geprüft |
| 6 | Konto: Gastmodus und Watchlists im Browser | fertig, im Browser geprüft |
| 6b | Konto: Login, Registrieren, Profil, `SupabaseWatchlistStore` | geschrieben, **ungetestet** (braucht zwei registrierte Konten) |
| 7 | Vergleich und Methodik | fertig, im Browser geprüft |
| 8 | Offline-Modus (JSON + Gast) | getestet: bei fehlenden Tabellen und bei unerreichbarem Supabase; ohne Netz dauert der Start rund 8 s. Mit `VITE_DATA_MODE=json` startet die App sofort aus der Datei |
| 8b | Demo-Konten, Screenshots für die Abgabe | offen |
| 9 | Branchen-Richtwerte (`richtwertBranche`, `ampelBranche`), Branch `branchenangepasste_kennzahlen` | fertig, im Browser geprüft (JSON-Modus); Supabase braucht die Spalte `ampel_branche` |

## Grundregel: Abhängigkeiten zeigen nur in eine Richtung

```text
config/*.json  ──►  data/pipeline  ──►  companies.json / Supabase  ──►  DataSource  ──►  Seiten + Komponenten
      └───────────────────────────────────────────────────────────────►  lib/config.ts ──┘
```

- Komponenten kennen weder Supabase noch die JSON-Datei, nur `DataSource` und `WatchlistStore`.
- Die Pipeline berechnet Kennzahlen, Scores und Ampeln. Das Frontend rechnet sie nicht nochmals, es rechnet nur die Gesamtgewichtung nach Profil, Filter, Sortierung und Branchen-Median.

## Wo ändere ich was?

| Ich will … | Datei | Danach |
|---|---|---|
| Richtwert, Formeltext oder Label ändern | `config/kpis.json` | `export_json.py` (Ampeln neu) |
| Kennzahl in den Score nehmen oder herausnehmen | `inScore` in `config/kpis.json` | `export_json.py` (Scores neu) |
| Neue Kennzahl | `config/kpis.json` + Funktion in `data/pipeline/kpis.py` | Test prüft, dass beide übereinstimmen |
| Anlegerprofil oder Gewichtung ändern | `profile` in `config/kpis.json` | nichts |
| Gelb-Toleranz der Ampel | `ampel.gelbToleranz` in `config/kpis.json` | `export_json.py` |
| Yahoo-Feld hat anderen Namen | `data/pipeline/mapping.py` | `export_json.py` |
| Branchen-Richtwerte neu erheben | `data/research/branchen_richtwerte.py` (Quellen in `docs/BRANCHEN_RICHTWERTE.md`) | `refresh_from_json.py` oder `export_json.py`, dann `load_supabase.py` |
| Scoring-Methode | `data/pipeline/scoring.py` (Regeln in `docs/KENNZAHLEN.md`) | `export_json.py` |
| Firmen im Universum | `data/raw/*.csv` | `run_all.py` |
| Branchenname oder -farbe | `config/sectors.json` | `export_json.py` |
| Farben, Schriften | Tailwind-Tokens in `web/tailwind.config.js` | nichts |
| Andere Datenquelle | neue Klasse, die `DataSource` erfüllt | Auswahl in `web/src/data/index.ts` |

`export_json.py` braucht keinen neuen Abruf bei Yahoo, es rechnet aus `data/cache/` neu.

## Module

### Pipeline (`data/pipeline/`)
| Datei | Aufgabe |
|---|---|
| `common.py` | Pfade, Laden der Konfiguration, Grössenklasse |
| `build_tickers.py` | `data/raw/*.csv` → `data/tickers.csv` |
| `fetch.py` | Yahoo → `data/cache/<ticker>.json`, fortsetzbar |
| `mapping.py` | Yahoo-Feldnamen → unsere Begriffe, mit Fallbacks |
| `kpis.py` | die 17 Formeln als Register pro `id` |
| `scoring.py` | Perzentile, Achsen-Scores, Ampeln |
| `build_dataset.py` | setzt alles zum Frontend-Format zusammen |
| `export_json.py` | schreibt `web/public/data/companies.json` |
| `load_supabase.py` | Upsert in Supabase, einziger Ort mit Secret Key |
| `report.py` | Plausibilität: VAT, fehlende Werte, Ausreisser |
| `run_all.py` | alles der Reihe nach |

### Frontend (`web/src/`)
| Ordner | Aufgabe |
|---|---|
| `lib/` | reine Funktionen ohne React: `config`, `format`, `ampel`, `weighting`, `filters`, `medians`, `fazit`, `compare`, `storage` (mit Vitest getestet) |
| `data/` | `types`, `DataSource`, `JsonSource`, `SupabaseSource`, `index` (Auswahl + Rückfall auf JSON), `DataProvider` |
| `auth/` | `AuthProvider`, `useAuth` |
| `watchlists/` | `WatchlistStore`, `SupabaseWatchlistStore`, `LocalWatchlistStore`, `WatchlistProvider` |
| `components/` | `layout/`, `cube/`, `filters/`, `list/`, `company/`, `compare/`, `ui/`, keine Datei über ~250 Zeilen |
| `pages/` | `Explorer`, `Compare`, `CompanyDetail`, `Watchlists`, `Method`, `Login`, `Profile`, nur Zusammensetzung |

## Datenentscheide, die man kennen muss

Festgelegt beim Programmieren, damit der Score nicht in die Irre führt:

- **Negatives Eigenkapital:** Der Verschuldungsgrad wird negativ und wäre als „tiefer besser“ sonst der beste Wert. Darum `negativeIsWorst` in `config/kpis.json`: schlechtester Rang, rote Ampel. Die ROE bleibt dann leer, weil Verlust / negatives EK eine falsche positive Rendite ergäbe.
- **Tilgungsdauer** ist leer, wenn der Free Cashflow nicht positiv ist.
- **Keine ausgewiesene Dividende** zählt als 0, sonst wäre der FCF jeder Firma ohne Dividende leer.
- **Ø-Kennzahlen** (ROE, ROA, ROIC) sind leer, wenn das Vorjahr fehlt. Das älteste Jahr der Sparkline ist darum oft leer.
- **Ampel über dem Richtwert-Band** bleibt bei „höher besser“ grün (VAT: ROE 27.7 % bei Richtwert 10–15 %), wie in den Mockups.
- **Keine Kennzahl ohne Richtwert hat eine Ampel** (grau). Die Mockups zeigen bei der EBIT-Marge grün, das sind Beispielwerte. Massgebend ist `docs/KENNZAHLEN.md`.
- **Gesamt-Score im Finanzsektor:** Die fehlende Liquiditäts-Achse wird nicht als 0 gezählt, ihr Gewicht verteilt sich auf die anderen Achsen.
- **Vergleich, bester Wert beim FCF:** Keine Hervorhebung, wenn die Firmen in verschiedenen Währungen berichten. Aus demselben Grund kein Branchen-Median beim FCF.
- **Yahoo vs. Geschäftsbericht:** siehe Abschnitt „Abweichungen“ in `docs/KENNZAHLEN.md`.

## Offene Punkte für das Team

1. **SMI/SMIM-Liste prüfen** (`data/raw/smi_smim.csv`, Entwurf aus dem Gedächtnis). Sie hat 21 SMI + 27 SMIM = 48 Titel, sollte aber 20 + 30 haben. Zu prüfen sind besonders Sandoz (steht unter SMIM) und die fehlenden Titel. Bereits korrigiert, weil Yahoo die alten Symbole nicht mehr kennt: Roche ist `RO.SW` statt `ROG.SW`, Baloise + Helvetia sind `HBAN.SW`.
2. **Supabase-Projekt anlegen**, `.env` ausfüllen, `supabase/schema.sql` ausführen, „Confirm email“ ausschalten.
3. **10 Firmen gegen Geschäftsberichte prüfen** und die Ausreisser aus `report.py` durchgehen.
4. ~~**Doppelte Titel**~~ erledigt: GOOG, FOX, NWS aus `data/raw/sp500.csv` entfernt, je eine Aktienklasse bleibt (GOOGL, FOXA, NWSA), 548 Firmen, Namen ohne „(Class A)“. Supabase ist nachgeführt (548 Firmen, 0 Abweichungen zu `companies.json`).
5. **Demo-Konten und Screenshots** für die Abgabe, sobald Supabase läuft.
