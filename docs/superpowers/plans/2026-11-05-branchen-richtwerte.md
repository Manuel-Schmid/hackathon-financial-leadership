# Branchen-Richtwerte Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Branchen-Richtwerte für 9 Kennzahlen mit eigener Ampel (`ampelBranche`). Sie gelten im Vergleich innerhalb einer Branche, auf der Detailseite (neben dem Buch-Richtwert) und in der Kurzkarte.

**Architecture:** Die Werte stehen in `config/kpis.json` (`richtwertBranche`), erzeugt von nachvollziehbaren Skripten in `data/research/`. Die Pipeline berechnet `ampelBranche` mit derselben Funktion `scoring.ampel`. Das Frontend wählt nur aus, welche Ampel und welcher Richtwert angezeigt werden.

**Tech Stack:** Python 3.13 + pytest (Pipeline), React + Vite + TypeScript + Vitest (Frontend), Supabase.

**Spec:** `docs/superpowers/specs/2026-11-05-branchen-richtwerte-design.md`. Werte und Quellen: `docs/BRANCHEN_RICHTWERTE.md`.

## Global Constraints
- Kennzahlen und Richtwerte stehen nur in `config/kpis.json`. Python und Frontend lesen beide daraus.
- Die Ampel berechnet die Pipeline. Das Frontend wählt nur zwischen `ampel` und `ampelBranche`.
- Branchen-Richtwerte gibt es für `current_ratio, tilgungsdauer, roe, roa, ros, roic, equity_ratio, debt_equity, adg2`. Für `Financials` nur `roe, ros, roic, tilgungsdauer`.
- Ohne Branchen-Richtwert gilt: `ampelBranche == ampel`, und der Richtwert wird als «Buch» gekennzeichnet.
- UI auf Deutsch in Schweizer Schreibweise («ss»). Keine Datei über ~250 Zeilen.
- Vor jedem Commit: `python -m pytest data/tests` grün. Ab Task 3 zusätzlich `npm run typecheck`, `npm test` und `npm run build` in `web/` grün.
- Keine Secrets in Code, Logs oder Commits.

## Review Focus
1. **Gemischter Vergleich mit einer Finanzfirma:** Branchen sind verschieden, also gilt das Buch. Nie darf es eine Mischung von Ampeln pro Zeile geben. → Vitest in Task 4 (`compareMode` mit gemischten Branchen).
2. **Alte Daten ohne `ampelBranche`** (z. B. Supabase vor dem ALTER oder eine alte `companies.json`): Die App läuft, `ampelBranche` fällt auf `ampel` zurück. → Vitest in Task 3 (`normalizeKpi`).
3. **Kennzahl ohne Branchen-Richtwert in einem Vergleich innerhalb einer Branche** (Cash Ratio, FCF): Es erscheint der Buch-Richtwert mit dem Zusatz «(Buch)», nicht «–». → Vitest in Task 4 (`richtwertFor` gibt `source: 'buch'`).
4. **Negativer Verschuldungsgrad** (negatives Eigenkapital): Auch die Branchen-Ampel ist rot. → pytest in Task 2.
5. **Grenzwerte der Branchen-Ampel:** gleiche Regel wie die Buch-Ampel, weil dieselbe Funktion verwendet wird. → pytest in Task 2 (Versorger ROIC 4 % grün, 3.3 % gelb, 3.1 % rot bei Gelb-Toleranz 20 %; die Grenze 3.2 % wird wegen der Gleitkomma-Rundung bewusst nicht getestet).

---

### Task 1: Branchen-Richtwerte erheben und in die Konfiguration schreiben

**Files:**
- Create: `data/research/bach.py`. Lädt `bach.zip` nach `data/research/cache/` (URL `https://www.bach.banque-france.fr/bach-ws-fo/ws/log-documentation/downloadocs?file_name=bach.zip`) und liefert die BACH-Branchenwerte. Inhaltlich wie `bach_sectors.py` aus der Recherche: Grössenklasse «2», Stichprobe «0», letztes Jahr ≤ 2024 pro Land, NACE-Zuordnung wie im Anhang von `docs/BRANCHEN_RICHTWERTE.md`.
- Create: `data/research/damodaran.py`. Lädt `margin.html`, `roe.html`, `pbvdata.html` und `dbtfund.html` von `https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/` nach `cache/`. Industrie-Zuordnung wie in der Recherche. Branchenwert und Gesamtwert sind jeweils der ungewichtete Median über die Industrien.
- Create: `data/research/branchen_richtwerte.py`. Berechnet nach der Faktor-Methode und schreibt die Werte in `config/kpis.json`. `--check` gibt nur die Tabelle und den Anteil grün aus.
- Create: `data/research/README.md`, 10 Zeilen: Zweck, Ablauf, Quellen.
- Modify: `.gitignore` um `data/research/cache/` ergänzen.
- Modify: `config/kpis.json`. Neues Feld `richtwertBranche` bei den 9 Kennzahlen.
- Test: `data/tests/test_branchen.py`

**Interfaces:**
- Produces: In `config/kpis.json` hat jede der 9 Kennzahlen das Feld `"richtwertBranche": {"quelle": str, "werte": {<GICS-Sektor englisch>: {"min"?: float, "max"?: float, "label": str}}}`.
- Produces: `common.py`: `def branchen_richtwert(kpi: dict, sector: str) -> dict | None`. Liefert `kpi["richtwertBranche"]["werte"].get(sector)` oder `None`.

- [ ] **Step 1: Write the failing tests** in `data/tests/test_branchen.py`

```python
CONFIG = load_kpi_config(); SECTORS = load_sectors(); KPI = {k["id"]: k for k in CONFIG["kpis"]}
BRANCHE = {"current_ratio","tilgungsdauer","roe","roa","ros","roic","equity_ratio","debt_equity","adg2"}

def test_genau_neun_kennzahlen_haben_branchen_richtwerte():
    assert {k for k, v in KPI.items() if "richtwertBranche" in v} == BRANCHE

def test_sektoren_existieren_und_finanzen_nur_rentabilitaet():
    for kid in BRANCHE:
        werte = KPI[kid]["richtwertBranche"]["werte"]
        assert set(werte) <= set(SECTORS)
        assert KPI[kid]["richtwertBranche"]["quelle"]
        assert ("Financials" in werte) == (kid in {"roe","ros","roic","tilgungsdauer"})

def test_werte_aus_recherche():
    assert branchen_richtwert(KPI["roic"], "Utilities") == {"min": 0.04, "label": "≥ 4 %"}
    assert branchen_richtwert(KPI["tilgungsdauer"], "Real Estate")["max"] == 11
    assert branchen_richtwert(KPI["cash_ratio"], "Utilities") is None
```

- [ ] **Step 2:** `python -m pytest data/tests/test_branchen.py -v` ergibt FAIL (Import oder Feld fehlt).
- [ ] **Step 3:** Skripte schreiben (aus den Recherche-Skripten übernehmen, Pfade auf `data/research/cache/`) und `branchen_richtwert` in `common.py` ergänzen. `python data/research/branchen_richtwerte.py` laufen lassen. Danach in `config/kpis.json` `cash_ratio` und `quick_ratio` ohne `richtwertBranche`; bei `Financials` nur die 4 Kennzahlen. Labels ohne «J.»-Duplikat, also z. B. «4.5–11 Jahre», «13–19 %», «≥ 4 %».
- [ ] **Step 4:** `python -m pytest data/tests -v` ergibt alles grün, inkl. VAT-Test. `python data/research/branchen_richtwerte.py --check` zeigt dieselben Werte wie die Ergebnis-Tabelle in `docs/BRANCHEN_RICHTWERTE.md`.
- [ ] **Step 5: Commit** `Branchen-Richtwerte aus BACH und Damodaran in kpis.json`

### Task 2: Pipeline berechnet `ampelBranche`

**Files:**
- Modify: `data/pipeline/build_dataset.py`, in `company_from_cache` ein zusätzliches Feld pro Kennzahl.
- Create: `data/pipeline/refresh_from_json.py`. Berechnet `ampel`, `ampelBranche` und die Scores aus der bestehenden `companies.json` neu, ohne Yahoo-Cache.
- Modify: `data/pipeline/load_supabase.py`, Spalte `ampel_branche` in den kpis-Zeilen.
- Test: `data/tests/test_branchen.py`

**Interfaces:**
- Consumes: `branchen_richtwert(kpi, sector)` aus Task 1, `scoring.ampel(value, kpi, tolerance)`.
- Produces: `scoring.py`: `def ampel_branche(value: float | None, kpi: dict, sector: str, tolerance: float) -> str`. Ist ein Branchen-Richtwert vorhanden, gilt `ampel(value, {**kpi, "richtwert": rw}, tolerance)`, sonst `ampel(value, kpi, tolerance)`.
- Produces: Jede Kennzahl in `companies.json` sieht so aus: `{"value", "ampel", "ampelBranche", "history"}`. Die kpis-Zeile in Supabase bekommt `"ampel_branche"`, gesetzt nur für das letzte Geschäftsjahr, sonst `None`.

- [ ] **Step 1: Write the failing tests**

```python
def test_ampel_branche_versorger_roic():
    k = KPI["roic"]
    assert ampel_branche(0.05, k, "Utilities", TOL) == "green" and ampel(0.05, k, TOL) == "red"
    assert ampel_branche(0.04, k, "Utilities", TOL) == "green"
    assert ampel_branche(0.033, k, "Utilities", TOL) == "yellow"
    assert ampel_branche(0.031, k, "Utilities", TOL) == "red"

def test_ohne_branchen_richtwert_gleich_buch():
    for v in (0.1, 0.5, 1.2):
        assert ampel_branche(v, KPI["cash_ratio"], "Utilities", TOL) == ampel(v, KPI["cash_ratio"], TOL)
    assert ampel_branche(0.3, KPI["equity_ratio"], "Financials", TOL) == ampel(0.3, KPI["equity_ratio"], TOL)

def test_negatives_eigenkapital_auch_branche_rot():
    assert ampel_branche(-3.0, KPI["debt_equity"], "Industrials", TOL) == "red"

def test_dataset_hat_ampel_branche(tmp_path):  # wie test_build_dataset_end_to_end, mit VAT-Cache
    ...  # jede Kennzahl hat "ampelBranche" in {"green","yellow","red","grey"}

def test_supabase_rows_haben_ampel_branche():
    # company_rows mit einer Mini-Firma: letztes Jahr -> ampel_branche gesetzt, Vorjahre -> None
```

- [ ] **Step 2:** pytest ergibt FAIL.
- [ ] **Step 3:** `ampel_branche` implementieren, in `company_from_cache` setzen, in `company_rows` übernehmen. `refresh_from_json.py`: liest `WEB_JSON`, setzt pro Firma und Kennzahl `ampel` und `ampelBranche` neu, ruft `add_scores` auf und schreibt die Datei kompakt wie `export_json.py`.
- [ ] **Step 4:** `python -m pytest data/tests -v` grün. Danach `python data/pipeline/refresh_from_json.py`. Prüfen: In `companies.json` haben alle Kennzahlen `ampelBranche`, und die Scores sind unverändert (gleiche Kennzahlen, gleiche Perzentile).
- [ ] **Step 5: Commit** `Pipeline: Branchen-Ampel pro Kennzahl`

### Task 3: Datenschicht im Frontend und Supabase-Schema

**Files:**
- Modify: `supabase/schema.sql`, nach der Tabelle `kpis`: `alter table public.kpis add column if not exists ampel_branche text check (ampel_branche in ('green','yellow','red','grey'));`
- Modify: `web/src/data/types.ts`. `CompanyKpi` bekommt `ampelBranche: Ampel`.
- Modify: `web/src/data/SupabaseSource.ts`. Liest `row.ampel_branche`, mit Fallback auf `ampel`.
- Modify: `web/src/data/JsonSource.ts`. Normalisiert über `normalizeKpi`.
- Create: `web/src/data/normalize.ts`
- Test: `web/src/lib/lib.test.ts`, oder neu `web/src/data/normalize.test.ts`

**Interfaces:**
- Produces: `export function normalizeKpi(k: Partial<CompanyKpi> & { value: number | null }): CompanyKpi`. Setzt `ampel ?? 'grey'`, `ampelBranche ?? ampel` und `history ?? []`.

- [ ] **Step 1: Test:** `normalizeKpi({ value: 1, ampel: 'red', history: [] }).ampelBranche === 'red'`, und `normalizeKpi({ value: 1, ampel: 'red', ampelBranche: 'green', history: [] }).ampelBranche === 'green'`.
- [ ] **Step 2:** `npm test` ergibt FAIL.
- [ ] **Step 3:** Implementieren und in beiden Sources verwenden.
- [ ] **Step 4:** typecheck, test und build grün.
- [ ] **Step 5: Commit** `Datenschicht: ampelBranche mit Rückfall auf Buch-Ampel`

### Task 4: Auswahllogik Buch oder Branche (`lib/`)

**Files:**
- Modify: `web/src/lib/config.ts`. `KpiDef` bekommt `richtwertBranche?: { quelle: string; werte: Record<string, Richtwert> }`. Zusätzlich `type Richtwert = { min?: number; max?: number; label: string }`.
- Create: `web/src/lib/richtwert.ts`
- Modify: `web/src/lib/fazit.ts`
- Test: `web/src/lib/lib.test.ts`

**Interfaces:**
- Produces in `lib/richtwert.ts`:
  - `export type RichtwertModus = 'buch' | 'branche'`
  - `export function compareMode(companies: Company[]): RichtwertModus`. Liefert `'branche'`, wenn alle Firmen denselben `sector` haben (auch bei nur einer Firma), sonst `'buch'`.
  - `export function richtwertFor(def: KpiDef, sector: string, modus: RichtwertModus): { label: string; source: 'buch' | 'branche' } | null`. Bei `'branche'` mit vorhandenem Wert kommt dieser Wert, sonst `def.richtwert` mit `source: 'buch'`. Ohne Richtwert: `null`.
  - `export function ampelFor(kpi: CompanyKpi | undefined, modus: RichtwertModus): Ampel`. Liefert `kpi.ampelBranche` oder `kpi.ampel`, ohne Kennzahl `'grey'`.
- Changes: `buildFazit(companies: Company[], modus: RichtwertModus = compareMode(companies))` zählt die roten Ampeln mit `ampelFor`.

- [ ] **Step 1: Tests**

```ts
const util = (t: string, sector = 'Utilities') => ({ ...fixture(t), sector });  // bestehender Fixture-Helper oder ein neuer, kleiner
expect(compareMode([util('A'), util('B')])).toBe('branche');
expect(compareMode([util('A'), util('B', 'Financials')])).toBe('buch');
expect(compareMode([util('A')])).toBe('branche');
expect(richtwertFor(KPI_BY_ID.get('roic')!, 'Utilities', 'branche')).toEqual({ label: '≥ 4 %', source: 'branche' });
expect(richtwertFor(KPI_BY_ID.get('cash_ratio')!, 'Utilities', 'branche')?.source).toBe('buch');
expect(richtwertFor(KPI_BY_ID.get('roic')!, 'Utilities', 'buch')?.source).toBe('buch');
expect(ampelFor({ value: 1, ampel: 'red', ampelBranche: 'green', history: [] }, 'branche')).toBe('green');
expect(ampelFor(undefined, 'buch')).toBe('grey');
```

- [ ] **Step 2:** `npm test` ergibt FAIL.
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** typecheck, test und build grün.
- [ ] **Step 5: Commit** `Auswahl Buch- oder Branchen-Richtwert`

### Task 5: Vergleich, Detailseite, Kurzkarte

**Files:**
- Modify: `web/src/components/compare/CompareTable.tsx`. `const modus = compareMode(companies)`. Die Spaltenüberschrift heisst `modus === 'branche' ? \`Richtwert ${companies[0].sectorDe}\` : 'Richtwert'`. Zelle: `richtwertFor(...)?.label`, bei `source === 'buch'` im Branchenmodus mit dem Zusatz « (Buch)». Ampel: `ampelFor`.
- Modify: `web/src/pages/Compare.tsx`. Bei `modus === 'buch'` und mehr als einer Firma steht über der Tabelle der Hinweis «Firmen aus verschiedenen Branchen: Richtwerte aus dem Buch». Das Fazit ruft `buildFazit(companies)` auf.
- Modify: `web/src/components/company/KpiSection.tsx`. Die Spalte «Richtwert» wird zu zwei Spalten: «Richtwert Buch» (Label und `AmpelDot ampel`) und «Richtwert {sectorDe}» (Label mit Kennzeichnung, `AmpelDot ampelBranche`). Die Ampel neben dem Wert fällt weg. `min-w` der Tabelle anpassen.
- Modify: `web/src/components/company/QuickCard.tsx`. «Richtwert {label}» aus `richtwertFor(def, company.sector, 'branche')`, Ampel `ampelBranche`. Bei Quelle Buch steht «Richtwert … (Buch)».

**Interfaces:**
- Consumes: `compareMode`, `richtwertFor`, `ampelFor` aus Task 4.

- [ ] **Step 1:** Umsetzen. Eine Komponente darf höchstens ~250 Zeilen haben. Wird `KpiSection` zu lang, kommt die Zeile in `KpiRow.tsx`.
- [ ] **Step 2:** typecheck, test und build grün.
- [ ] **Step 3: Browser** (`VITE_DATA_MODE=json`), jeweils die Konsole ohne Fehler:
  - Vergleich mit zwei Versorgern: Überschrift «Richtwert Versorger», ROIC «≥ 4 %», Cash Ratio «80 % (Buch)».
  - Vergleich Versorger + Bank: Hinweis sichtbar, Richtwerte aus dem Buch.
  - Detailseite eines Versorgers: zwei Richtwert-Spalten, ROIC mit roter Buch-Ampel und grüner Branchen-Ampel.
  - Kurzkarte: Branchen-Richtwert.
- [ ] **Step 4: Commit** `UI: Branchen-Richtwerte im Vergleich, auf der Detailseite und in der Kurzkarte`

### Task 6: Methodik-Seite, Supabase, Doku

**Files:**
- Create: `web/src/components/method/BranchenRichtwerte.tsx`. Kurztext zur Methode (Buch × Branchenfaktor; Buch ≈ Median aller Branchen in BACH) mit Quellen als Links (BACH, Damodaran) und einer Tabelle Branche × 9 Kennzahlen aus `KPIS[].richtwertBranche`, mit «Buch» für fehlende Werte.
- Modify: `web/src/pages/Method.tsx`. Die neue Komponente nach der Richtwert-Tabelle einbinden.
- Modify: `docs/ENTSCHEIDE.md` (Zeile «Branchen-Richtwerte»), `docs/PROGRAMMIERPLAN.md` (Stand: Schritt «9 Branchen-Richtwerte», Tabelle «Wo ändere ich was?» um Branchen-Richtwerte ergänzen), `docs/KENNZAHLEN.md` (kurzer Verweis).

- [ ] **Step 1:** Umsetzen. typecheck, test und build grün. Die Methodik-Seite im Browser prüfen; die Tabelle darf auf schmalen Bildschirmen horizontal scrollen.
- [ ] **Step 2: Supabase:** Die Person mit Zugang führt den `alter table`-Befehl aus Task 3 im SQL-Editor aus. Danach `load_supabase.py` laufen lassen (oder den REST-Weg wie beim letzten Mal). Prüfen: `ampel_branche` ist für das letzte Jahr gesetzt, die App im Modus `supabase` zeigt dieselben Ampeln wie im JSON-Modus.
- [ ] **Step 3: Commit** `Methodik: Branchen-Richtwerte; Doku nachgeführt`
