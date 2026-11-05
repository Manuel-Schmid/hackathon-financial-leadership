# Kennzahlen, Richtwerte und Scoring

Quellen: Buch „Grundlagen der finanziellen Führung“ (HSG), Kapitel 11 Performance Measurement:
**S. 292** (Übersicht Kennzahlen + Formeln), **S. 293** (Tabelle 53: Richtwerte im Branchenvergleich).
Folien Vorlesung 7 (Geberit-Beispiel, Zieldreieck).

Die maschinenlesbare Version steht in `config/kpis.json` (eine Quelle der Wahrheit für Python + Frontend).

## Zieldreieck → drei Achsen
Rentabilität, Liquidität und Sicherheit (Risiko) stehen in **konkurrierendem Verhältnis** (Abbildung 106). Wir zeigen die Risiko-Achse als **Sicherheit** (hoch = wenig Risiko), damit auf allen Achsen „hoch = gut“ gilt.

## Kennzahlen
| ID | Kennzahl | Formel (S. 292) | Richtwert (S. 293) | Achse | Richtung | Im Score |
|---|---|---|---|---|---|---|
| cash_ratio | Liquiditätsgrad I (Cash Ratio) | Flüssige Mittel / kurzfr. FK | 80 % | Liquidität | höher besser | ja |
| quick_ratio | Liquiditätsgrad II (Quick Ratio) | (Flüssige Mittel + Forderungen) / kurzfr. FK | > 100 % | Liquidität | höher besser | ja |
| current_ratio | Liquiditätsgrad III (Current Ratio) | Umlaufvermögen / kurzfr. FK | 150 % | Liquidität | höher besser | ja |
| cashflow_ratio | Cashflow Ratio | Operativer CF / kurzfr. Verbindlichkeiten | – | Liquidität | höher besser | ja |
| fcf | Free Cashflow | Op. CF + CF Investitionstätigkeit − Mindestdividende | > 0 | Liquidität | höher besser | nur Ampel |
| tilgungsdauer | Tilgungsdauer | (Finanzverbindlichkeiten − Flüssige Mittel) / Free Cashflow | 2–5 Jahre | Liquidität | tiefer besser | nur Detail |
| roe | Eigenkapitalrendite (ROE) | Jahresgewinn / Ø Eigenkapital | 10–15 % | Rentabilität | höher besser | ja |
| roa | Gesamtkapitalrendite (ROA) | (Jahresgewinn + FK-Zinsen) / Ø Gesamtkapital | > 7 % | Rentabilität | höher besser | ja |
| ebit_margin | EBIT-Marge | EBIT / Nettoumsatz | – | Rentabilität | höher besser | ja |
| ros | Reingewinnmarge (ROS) / Umsatzrendite | Reingewinn / Nettoumsatz | 1–10 % | Rentabilität | höher besser | ja |
| ebitda_margin | EBITDA-Marge | EBITDA / Nettoumsatz | – | Rentabilität | höher besser | nur Detail |
| roic | Rendite auf invest. Kapital (ROIC) | NOPAT / Ø investiertes Kapital | 10 % (RONOA) | Rentabilität | höher besser | nur Detail |
| equity_ratio | Eigenkapitalquote | Eigenkapital / Gesamtkapital | 25–50 % | Sicherheit | höher besser | ja |
| debt_equity | Verschuldungsgrad (Debt Equity Ratio) | Fremdkapital / Eigenkapital | 100–230 % | Sicherheit | tiefer besser | ja |
| adg2 | Anlagedeckungsgrad II | (EK + langfr. FK) / Anlagevermögen | > 100 % | Sicherheit | höher besser | ja |
| gearing | Gearing | (verzinsl. FK − Flüssige Mittel) / Eigenkapital | – | Sicherheit | tiefer besser | nur Detail |
| interest_cover | Zinsdeckungsfaktor | Operativer CF vor FK-Zinsen / FK-Zinsen | – | Sicherheit | höher besser | nur Detail |

Fussnoten Buch: Nettoumsatz = Umsatz − Umsatzminderungen. Investiertes Kapital = betriebsnotwendiges Vermögen (NOA). NOPAT = EBIT − Steueraufwand. Ø = (Anfangsbestand + Endbestand) / 2.

### Richtwerte nach Branche (Tabelle 53)
Kreuz = Kennzahl ist für diese Branche besonders relevant.

| Kennzahl | Bank | Einzelhandel | Grosshandel | Automobil | Anlagebau | Richtwert |
|---|---|---|---|---|---|---|
| Cash Ratio | X | X | | | X | 80 % |
| Quick Ratio | | | X | X | | > 100 % |
| Current Ratio | | X | X | X | | 150 % |
| Free Cashflow | X | X | X | X | X | > 0 |
| Tilgungsdauer | X | | | | | 2–5 J |
| Debitorenfrist | | | X | X | X | 40 d |
| Lagerreichweite | | X | X | X | | 10–180 d |
| Gesamtkapitalrendite | X | | | | X | > 7 % |
| Eigenkapitalrendite | | X | X | X | | 10–15 % |
| RONOA | | | | X | X | 10 % |
| Umsatzrendite | X | | | | X | 1–10 % |
| Eigenkapitalquote | X | X | X | | X | 25–50 % |
| Fremdkapitalquote | X | X | X | | X | 50–75 % |
| Verschuldungsgrad | X | | | | X | 100–230 % |
| Anlagedeckungsgrad 2 | | X | | X | X | > 100 % |

Buch: „Die Richtwerte sind exemplarische Erwartungswerte und müssen der aktuellen Anwendung, insbesondere der spezifischen Unternehmenssituation, der wirtschaftlichen Lage und den Besonderheiten der Branche angepasst werden.“

## Scoring (festgelegt)
1. Kennzahlen pro Unternehmen für das **letzte Geschäftsjahr** berechnen (Ø-Werte aus Vorjahr und aktuellem Jahr).
2. Jede Kennzahl mit „Im Score = ja“ in einen Teilscore 0–100 umrechnen: **Perzentil-Rang** innerhalb aller nicht-finanziellen Unternehmen der Datenbank (bestes = 100). Bei „tiefer besser“ umgekehrt.
3. **Achsen-Score** = Durchschnitt der vorhandenen Teilscores (fehlende Werte zählen nicht).
4. **Gesamt-Score** = gewichteter Durchschnitt der drei Achsen. Standard 1/3 je Achse; im Profil wählbar: konservativ (L 25 / R 25 / S 50), ausgewogen (33/33/33), renditeorientiert (L 20 / R 60 / S 20).
5. **Ampel** separat und absolut gegen den Richtwert: grün = erfüllt, gelb = bis 20 % daneben, rot = deutlich daneben, grau = kein Richtwert/keine Daten.
6. **Finanzsektor** (GICS „Financials“, Banken/Versicherungen): Liquiditätsgrade nicht sinnvoll. Liquiditäts-Score leer; Rentabilität aus ROE + ROA, Sicherheit aus EK-Quote + Verschuldungsgrad; Perzentil nur innerhalb des Finanzsektors. Im UI hohler Punkt + Hinweis „eingeschränkt vergleichbar“. Im Würfel Liquidität = 50 (Mitte) mit gestrichelter Markierung.

## Referenzwerte für Tests: VAT Group 2025 (CHF Tausend, Folien VL3–VL5)
Rohdaten: Umlaufvermögen 475'720 · kurzfr. FK 362'014 · Flüssige Mittel 140'940 · Forderungen 125'765 · Vorräte 190'021 · Anlagevermögen 787'158 · Total Aktiven 1'262'878 (2024: 1'294'746) · Total FK 469'709 · langfr. FK 107'695 · Eigenkapital 793'169 (2024: 753'877) · Finanzverbindlichkeiten kurzfr. 203'626 / langfr. 44'656 · Nettoumsatz 1'073'516 · EBITDA 321'577 · EBIT 272'810 · Reingewinn 214'280 · Op. CF 299'172 · Inv. CF −68'784 · Dividende bezahlt 187'364 · Zinsen bezahlt 4'461.

| Kennzahl | Erwartet |
|---|---|
| Cash Ratio | 38.9 % |
| Quick Ratio | 73.7 % |
| Current Ratio | 131.4 % |
| Cashflow Ratio | 82.6 % |
| Free Cashflow (VL4) | 43'024 |
| Tilgungsdauer | 2.49 J |
| Zinsdeckungsfaktor | 68.1 |
| ROE | 27.7 % |
| ROA | 17.1 % |
| EBIT-Marge | 25.4 % |
| EBITDA-Marge | 30.0 % |
| ROS | 20.0 % |
| EK-Quote | 62.8 % (2024: 58.2 %) |
| Verschuldungsgrad | 59.2 % |
| Anlagedeckungsgrad II | 114.4 % |
| Gearing | 13.5 % |

Geberit (Folien VL7, Mio. CHF) als zweiter Check: Liquiditätsgrad III 2015 = 960.8 / 466.3 = 206.0 % · EK-Quote 2015 = 1'482.2 / 3'553.8 = 41.7 % · ADG II 2015 = (1'482.2 + 1'605.3) / 2'593.0 = 119.1 % · ROE 2015 = 422.4 / ((1'482.2 + 1'717.1)/2) = 26.4 % · Cashflow Ratio 2015 = 612.1 / 466.3 = 131.3 %.

## Hinweis Yahoo-Felder (yfinance)
Feldnamen können je nach Firma fehlen oder variieren. Mapping mit Fallbacks, z.B.:
- Umlaufvermögen: `Current Assets`
- kurzfr. FK: `Current Liabilities`
- Flüssige Mittel: `Cash And Cash Equivalents` (Fallback `Cash Cash Equivalents And Short Term Investments`)
- Forderungen: `Accounts Receivable` / `Receivables`
- Eigenkapital: `Stockholders Equity` (Fallback `Total Equity Gross Minority Interest`)
- Total FK: `Total Liabilities Net Minority Interest`
- Anlagevermögen: `Total Non Current Assets`
- langfr. FK: `Total Non Current Liabilities Net Minority Interest`
- Finanzverbindlichkeiten: `Total Debt`
- Nettoumsatz: `Total Revenue`; EBIT: `EBIT` / `Operating Income`; EBITDA: `EBITDA`; Reingewinn: `Net Income`
- Op. CF: `Operating Cash Flow`; Inv. CF: `Investing Cash Flow`; Dividende: `Cash Dividends Paid`; Zinsen: `Interest Paid Supplemental Data` / `Interest Expense`
Fehlt ein Feld → Kennzahl `null`, nie 0.
