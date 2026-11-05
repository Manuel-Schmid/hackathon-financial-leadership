# Design: Branchen-Richtwerte

Stand 05.11.2026 · Branch `branchenangepasste_kennzahlen` · Recherche und Herleitung: `docs/BRANCHEN_RICHTWERTE.md`

## Absicht
Die Ampeln messen heute jede Firma an den Richtwerten aus dem Buch (S. 292–293). Für einige Branchen sagt die Ampel darum nur, in welcher Branche eine Firma ist: Bei der ROIC sind 9 % der Versorger grün, bei der Tilgungsdauer 0 % der Immobilienfirmen. Neu gibt es pro Branche eigene Richtwerte, belegt mit Primärquellen (BACH der europäischen Zentralbanken, Damodaran/NYU Stern). Sie gelten beim Vergleich von Firmen derselben Branche. Über Branchen hinweg bleibt das Buch massgebend.

Für die Präsentation zeigt das zwei Dinge: Wir hinterfragen die Richtwerte aus dem Buch mit Quellen, und wir haben gesehen, dass das Buch ungefähr dem Median über alle Branchen entspricht.

## Ziele
- Branchen-Richtwerte für **9 Kennzahlen**: Current Ratio, Tilgungsdauer, ROE, ROA, Umsatzrendite, ROIC, EK-Quote, Verschuldungsgrad, Anlagedeckung II.
- Die Werte stehen in der Tabelle «Ergebnis» in `docs/BRANCHEN_RICHTWERTE.md` (Methode: Buch-Richtwert × Branchenfaktor).
- **Finanzen:** Branchen-Richtwerte nur für ROE, Umsatzrendite, ROIC und Tilgungsdauer. Alle anderen Kennzahlen dieser Branche messen wir am Buch.
- Jede Kennzahl mit Branchen-Richtwert bekommt eine zweite Ampel, `ampelBranche`. Sie wird nach derselben Regel berechnet wie die heutige Ampel (`scoring.ampel`, Gelb-Toleranz 20 %), nur mit dem Richtwert der Branche.
- Die Quelle steht bei jedem Branchen-Richtwert und auf der Methodik-Seite.

## Wo welcher Richtwert gilt
| Ansicht | Richtwert und Ampel |
|---|---|
| Vergleich, alle Firmen aus derselben Branche | Branche. Die Spaltenüberschrift heisst «Richtwert {Branche}». Die Ampeln und das Fazit verwenden `ampelBranche` |
| Vergleich mit Firmen aus verschiedenen Branchen | Buch (wie heute), dazu der Hinweis «Firmen aus verschiedenen Branchen: Richtwerte aus dem Buch» |
| Detailseite | Beide nebeneinander: eine Spalte für den Buch-Richtwert mit Ampel, eine für den Branchen-Richtwert mit Ampel. Die Spalte «Branchen-Median» bleibt |
| Kurzkarte im Explorer | Branche: Richtwert und Ampel der Branche |
| Würfel, Scores, Liste, Filter | unverändert |

Hat eine Kennzahl für eine Branche keinen eigenen Richtwert (Cash Ratio, Quick Ratio, FCF; bei Finanzen auch die Bilanz-Kennzahlen), gilt der Buch-Richtwert. Dann ist `ampelBranche` gleich `ampel`, und als Richtwert erscheint der Buch-Wert, gekennzeichnet mit «Buch».

## Nicht-Ziele
- Branchen-Richtwerte für Cash Ratio und Quick Ratio: Die Quellen sind dafür zu schwach, siehe Abschnitt «Qualität pro Kennzahl» in `docs/BRANCHEN_RICHTWERTE.md`.
- Scores, die nur innerhalb einer Branche gerechnet werden: Die Punkte im Würfel bleiben über alle Firmen vergleichbar.
- Die Quellen automatisch aktualisieren. Die Werte werden einmal erhoben und dann fest gespeichert.
- Feinere Branchen als die 11 GICS-Sektoren.

## Anti-Ziele
- Der Branchen-Richtwert darf den Buch-Richtwert nirgends stillschweigend ersetzen. Wo ein Branchen-Richtwert gilt, muss das sichtbar sein: Überschrift, Kennzeichnung «Buch»/«Branche», Methodik-Seite.
- Keine Zahl ohne Quelle.

## Vorgaben (aus CLAUDE.md)
- Kennzahlen und Richtwerte stehen nur in `config/kpis.json`.
- Die Pipeline berechnet die Ampeln, das Frontend nicht.
- Datenzugriff im Frontend nur über `DataSource`. Keine Datei über ~250 Zeilen.
- Selbstchecks: build, typecheck, Vitest und pytest (inkl. VAT-Test) grün, Klicktest im Browser, Notiz in `docs/ENTSCHEIDE.md`.
- `docs/PROGRAMMIERPLAN.md` nachführen.

## Entschiedenes «Wie»
**Konfiguration.** Jede der 9 Kennzahlen bekommt in `config/kpis.json` ein Feld `richtwertBranche`:
```json
"richtwertBranche": {
  "quelle": "Damodaran (NYU Stern), US, 01/2026: ROIC; Buch-Richtwert × Branchenfaktor",
  "werte": { "Utilities": { "min": 0.04, "label": "≥ 4 %" }, "...": {} }
}
```
Die Schlüssel sind die englischen Sektornamen aus `config/sectors.json`. Für fehlende Sektoren gilt das Buch.

**Herleitung reproduzierbar.** Die Auswertungsskripte kommen nach `data/research/`:
- BACH-Auswertung, Damodaran-Auswertung, Faktor-Methode und Prüfung gegen unsere Daten
- dazu ein Skript, das die Werte in `config/kpis.json` schreibt

Die Rohdaten (BACH-ZIP ~195 MB, Damodaran-HTML) kommen nach `data/research/cache/` und nicht ins Repo. Die Download-Adressen stehen im Skript.

**Pipeline.** `build_dataset.company_from_cache` setzt pro Kennzahl zusätzlich `ampelBranche`. `load_supabase.py` schreibt das Feld als `ampel_branche` in die Tabelle `kpis`, nur für das letzte Geschäftsjahr (wie `ampel`).

**Supabase.** In `supabase/schema.sql` kommt dazu:
```sql
alter table public.kpis add column if not exists ampel_branche text check (ampel_branche in ('green','yellow','red','grey'));
```
Diesen Befehl muss jemand mit Zugang einmal im SQL-Editor von Supabase ausführen; über die REST-API geht das nicht. `SupabaseSource` liest `select('*')`. Fehlt die Spalte, fällt `ampelBranche` auf `ampel` zurück, und die App läuft trotzdem.

**Frontend.**
- `CompanyKpi` bekommt das Feld `ampelBranche: Ampel`.
- `lib/config` bekommt eine Hilfsfunktion, die den Richtwert einer Kennzahl für eine Branche liefert und angibt, ob er aus der Branche oder aus dem Buch stammt.
- `CompareTable` und `buildFazit` wählen Buch oder Branche danach, ob alle Firmen aus derselben Branche sind.
- `KpiSection` bekommt die zweite Richtwert-Spalte, `QuickCard` die Branchen-Ampel. Auf der Methodik-Seite kommt ein Abschnitt «Branchen-Richtwerte» dazu (Methode, Quellen, Tabelle).

## Eigene Entscheide beim Gegenlesen (bitte prüfen)
- Ein Vergleich mit nur einer Firma gilt als «gleiche Branche» und zeigt den Branchen-Richtwert.
- Die Tilgungsdauer bei Finanzen stützt sich auf Debt/EBITDA von Damodaran. Für Banken ist das nur bedingt aussagekräftig, bleibt aber wie vorgeschlagen drin.
- `ampelBranche` gibt es nur für das letzte Geschäftsjahr, wie heute `ampel`. Die Verlaufskurven bleiben ohne Ampel.

## Dem Umsetzer überlassen
- Genaue Texte, Spaltenbreiten und die Darstellung der Kennzeichnung «Buch»/«Branche», im Stil der bestehenden Tabellen (`docs/BRANDING.md`, Mockups).
- Wie die Tabelle auf der Methodik-Seite aufgeteilt wird, falls sie zu breit wird.
- Tests: pytest prüft, dass jeder Sektor in `richtwertBranche` in `sectors.json` existiert und dass `ampelBranche == ampel`, wo kein Branchen-Richtwert gilt. Dazu ein konkreter Fall: Versorger mit ROIC 5 % ergibt `ampelBranche` grün und `ampel` rot. Vitest prüft die Wahl von Buch oder Branche im Vergleich.
- `companies.json` neu erzeugen. Auf diesem Laptop gibt es keinen Yahoo-Cache. Wie bei den Aktienklassen geht das aus `companies.json` (Werte vorhanden, `ampelBranche` neu berechnen), am besten mit derselben Funktion wie in der Pipeline.
