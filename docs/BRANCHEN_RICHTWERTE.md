# Branchen-Richtwerte: Recherche und Vorschlag

Stand: 05.11.2026 · Branch `branchenangepasste_kennzahlen` · noch nicht umgesetzt

## Ziel
Vergleicht man Firmen derselben Branche, sollen die Ampeln an Branchen-Richtwerten gemessen werden. Bei Vergleichen über Branchen hinweg gelten weiterhin die Richtwerte aus dem Buch (S. 292–293).

## Befund in unseren Daten (548 Firmen)
Die Buch-Richtwerte treffen einzelne Branchen systematisch:

| Kennzahl (Buch) | Branche | Median der Branche | Anteil grün |
|---|---|---|---|
| Cash Ratio (80 %) | Versorger | 4 % | 0 % |
| ROA (> 7 %) | Versorger | 5 % | 3 % |
| ROIC (10 %) | Versorger / Immobilien | 7 % / 6 % | 9 % / 12 % |
| Tilgungsdauer (2–5 J.) | Immobilien | 72 Jahre | 0 % |
| ROE (10–15 %) | Immobilien | 7 % | 31 % |

## Quellen
Nur Primärquellen mit offengelegter Methode:

1. **BACH – Bank for the Accounts of Companies Harmonized**, ECCBSO (Bilanzdatenbank der europäischen Zentralbanken, u. a. Deutsche Bundesbank, Banque de France, Banca d'Italia, Banco de España). Datenstand 14.09.2026, frei herunterladbar: <https://www.bach.banque-france.fr/?lang=en>. Methodik: [BACH User Guide Summary (ECCBSO)](https://www.eccbso.org/system/files/inline-files/BACH_Summary_Userguide.pdf).
   Verwendet wurden die Grössenklasse «Large» (Umsatz ≥ 50 Mio. €) und die Stichprobe «variable», jeweils das letzte Jahr pro Land (2024, Österreich 2023). Das sind 12 Länder und rund 40'000 Firmen.
   BACH weist für jede Kennzahl Quartile und den gewichteten Mittelwert aus. Die Definitionen passen genau zu unseren Formeln: Current Ratio (r17), Verschuldungsgrad (r12 = Fremdkapital / Eigenkapital) und EK-Quote (1 / r11).
2. **Aswath Damodaran, NYU Stern** – Branchendaten für kotierte US-Firmen, Stand 09.01.2026 (5'994 Firmen in 94 Industrien): [Datenübersicht](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datacurrent.html). Verwendet wurden Net Margin, ROE, ROIC und Debt/EBITDA.
3. **US Census Bureau, Quarterly Financial Report (QFR)**, über [FRED](https://fred.stlouisfed.org/series/QFRTCAMFGUSNO) – Umlaufvermögen und kurzfristiges Fremdkapital US-amerikanischer Konzerne (konsolidiert). Damit wurde die Current Ratio gegengeprüft (Durchschnitt der letzten 4 Quartale bis Q2 2026).

Rein kommerzielle oder SEO-Benchmarkseiten wurden nicht verwendet.

## Wichtiger Befund: Das Buch entspricht dem Median über alle Branchen
| Kennzahl | Buch | BACH, alle grossen Firmen |
|---|---|---|
| Current Ratio | 150 % | Median 146 % |
| EK-Quote | 25–50 % | Quartile 22 % / 37 % / 55 % |
| Verschuldungsgrad | 100–230 % | Median 169 % |
| ROE | 10–15 % | Median 13 % |
| Anlagedeckung II | > 100 % | 118 % |

Ausnahmen sind die Cash Ratio (Buch 80 %, BACH 15 %) und die Quick Ratio (Buch 100 %, BACH 50 %). Bei diesen beiden ist der Buch-Richtwert deutlich strenger als der heutige Durchschnitt.

## Methode: Branchenfaktor
**Branchen-Richtwert = Buch-Richtwert × (Wert der Branche / Wert aller Branchen)**, wobei beide Werte aus derselben Quelle stammen.

- Das Buch bleibt der Anker. Die Quelle liefert nur, wie stark eine Branche vom Durchschnitt abweicht. Damit fallen auch die Niveau-Unterschiede zwischen der Quelle und unseren Firmen weg, etwa zwischen Einzelabschluss und Konzernabschluss.
- Die Branchenzuordnung zu GICS ist über NACE-Codes (BACH) bzw. die 94 Damodaran-Industrien (siehe Anhang) gelöst. Bei Damodaran zählt der Median der Industrien einer Branche, damit Industrien mit vielen Firmen (z. B. ~500 Biotechs) die Gesundheit nicht dominieren.
- Gerundet wird auf 5 Prozentpunkte (ab 20 %), 1 Prozentpunkt (3–20 %) und halbe Jahre.

| Kennzahl | Quelle | Messgrösse in der Quelle |
|---|---|---|
| Cash Ratio | BACH | Kasse/Bank (A7) / kurzfristiges FK (r16), Aggregat |
| Quick Ratio | BACH | (A7 + Forderungen L+L) / kurzfristiges FK, Aggregat |
| Current Ratio | BACH | r17, Median |
| Tilgungsdauer | Damodaran | Debt to EBITDA (Näherung, BACH hat keine Geldflussrechnung) |
| ROE | Damodaran | ROE |
| ROA | BACH | (Jahresgewinn + Zinsen) / Bilanzsumme, Aggregat |
| Umsatzrendite | Damodaran | Net Margin |
| ROIC | Damodaran | ROIC |
| EK-Quote | BACH | 1 / r11, Median |
| Verschuldungsgrad | BACH | r12, Median |
| Anlagedeckung II | BACH | (Bilanzsumme − kurzfristiges FK) / Anlagevermögen, Aggregat |

## Ergebnis: Branchen-Richtwerte
| Branche | Cash Ratio | Quick Ratio | Current Ratio | Tilgungsdauer | ROE | ROA | Umsatzrendite | ROIC | EK-Quote | Verschuldungsgrad | Anlagedeckung II |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Buch** | 80 % | > 100 % | 150 % | 2–5 Jahre | 10–15 % | > 7 % | 1–10 % | 10 % (RONOA) | 25–50 % | 100–230 % | > 100 % |
| Technologie | ≥ 85 % | ≥ 110 % | ≥ 160 % | 1.5–3.5 J. | 13–20 % | ≥ 8 % | 1.5–16 % | ≥ 18 % | 25–45 % | 115–260 % | ≥ 105 % |
| Gesundheit | ≥ 115 % | ≥ 115 % | Buch* | 2–5 J. | 8–13 % | ≥ 6 % | 1–9 % | ≥ 12 % | 35–75 % | Buch* | ≥ 105 % |
| Industrie | ≥ 70 % | ≥ 90 % | ≥ 135 % | 1.5–4 J. | 13–19 % | ≥ 6 % | 1–10 % | ≥ 11 % | 25–45 % | 110–250 % | ≥ 90 % |
| Zyklischer Konsum | ≥ 80 % | ≥ 75 % | ≥ 140 % | 2–5 J. | 10–15 % | ≥ 7 % | 0.5–7 % | ≥ 10 % | 20–45 % | 120–275 % | ≥ 100 % |
| Basiskonsum | ≥ 75 % | ≥ 120 % | Buch* | 2–4.5 J. | 10–15 % | ≥ 8 % | 0.5–5 % | ≥ 12 % | 30–60 % | 75–170 % | Buch* |
| Finanzen | Buch | Buch | Buch | 3–7.5 J. | 13–19 % | Buch | 2–20 % | ≥ 10 % | Buch | Buch | Buch |
| Energie | ≥ 60 % | ≥ 85 % | ≥ 135 % | Buch* | 8–12 % | Buch* | 1–11 % | ≥ 8 % | 25–50 % | 100–225 % | ≥ 90 % |
| Versorger | ≥ 75 % | ≥ 110 % | Buch* | 3.5–9.5 J. | 8–12 % | Buch* | 2–19 % | ≥ 4 % | 25–50 % | 105–240 % | ≥ 95 % |
| Werkstoffe | ≥ 85 % | ≥ 105 % | ≥ 175 % | 1.5–3.5 J. | 6–8 % | ≥ 8 % | 0.5–5 % | ≥ 8 % | 35–65 % | Buch* | ≥ 110 % |
| Kommunikation | ≥ 55 % | ≥ 85 % | ≥ 125 % | 2–5.5 J. | 10–15 % | ≥ 3 % | 1–11 % | ≥ 9 % | 25–50 % | 100–230 % | ≥ 85 % |
| Immobilien | ≥ 160 % | ≥ 85 % | ≥ 130 % | Buch* | 4–6 % | ≥ 4 % | 2–18 % | ≥ 4 % | 20–45 % | 120–275 % | ≥ 90 % |

«Buch» heisst: Die Quelle deckt die Kennzahl für diese Branche nicht ab. BACH enthält keine Finanzunternehmen.
«Buch*» heisst: Nach dem Plausibilitäts-Check vom 06.11.2026 gestrichen (siehe unten), es gilt der allgemeine Richtwert.

## Prüfung gegen unsere Daten (Anteil grün: Buch → Branche)
Wo die Quelle passt, wird die Ampel deutlich aussagekräftiger:
- Versorger ROIC 9 % → 97 %, Immobilien ROIC 12 % → 77 %
- Immobilien ROE 31 % → 76 %, Immobilien ROA 19 % → 69 %, Kommunikation ROA 44 % → 72 %
- Versorger Anlagedeckung II 16 % → 56 %, Immobilien 28 % → 81 %
- Werkstoffe EK-Quote 97 % → 71 % (vorher fast alle grün, jetzt wird unterschieden)

Wo die Quelle nicht passt, bleibt die Ampel einseitig:
- Versorger Current Ratio 12 % → 12 %, Cash Ratio 0 % → 0 %. BACH-Versorger (europäische Einzelgesellschaften, Median 134 %) sind viel liquider als kotierte US-Versorger (Median 77 %).
- Gegenprobe mit QFR (US-Konzerne): Pharma 1.33 und Telekom 0.85 liegen klar unter BACH (Gesundheit 1.81, Kommunikation 1.24). Industrie insgesamt liegt mit 1.39 nahe beim Buch.

## Qualität pro Kennzahl
| Einstufung | Kennzahlen | Begründung |
|---|---|---|
| gut belegt | ROE, Umsatzrendite, ROIC, Tilgungsdauer | Damodaran: kotierte, konsolidierte US-Firmen, also unser Universum |
| belegt, mit Vorbehalt | EK-Quote, Verschuldungsgrad, Current Ratio, ROA, Anlagedeckung II | BACH: Zentralbankstatistik und exakte Definitionen, aber Einzelabschlüsse europäischer Firmen nach nationalem Recht |
| schwach | Cash Ratio, Quick Ratio | Nur Aggregat und Einzelabschluss; Ausreisser (Immobilien ≥ 160 %, Gesundheit ≥ 115 %) wenig plausibel für kotierte Konzerne |

## Grenzen
- **Einzelabschluss vs. Konzern:** In BACH-Einzelabschlüssen stecken konzerninterne Forderungen und Verbindlichkeiten. Das verzerrt vor allem die Liquidität. Der Branchenfaktor mildert das, beseitigt es aber nicht.
- **Region:** BACH umfasst Europa, Damodaran die USA; unser Universum besteht zu rund 90 % aus US-Firmen.
- **Finanzen:** Für Bankbilanzen gibt es keine vergleichbare Quelle. Basel III verlangt eine Leverage Ratio von mindestens 3 %, das misst aber Kernkapital / Engagement und nicht die EK-Quote nach Buch.
- **Branchengliederung:** Die Zuordnung von NACE- bzw. Damodaran-Industrien zu GICS-Branchen ist ein eigener Entscheid (Anhang).

## Plausibilitäts-Check (06.11.2026)
Alle Branchen-Richtwerte gegen unsere 548 Firmen geprüft (Anteil grün mit Buch- und mit Branchen-Richtwert). Bei 10 Werten machte der Branchenwert die Ampel schlechter als das Buch, weil die Quelle nicht zu kotierten US-Konzernen passt. Diese Werte sind gestrichen (`AUSNAHMEN` in `data/research/branchen_richtwerte.py`), es gilt der allgemeine Richtwert:

| Branche | Kennzahl | gestrichener Wert | Median unserer Firmen | grün Branche → jetzt | Grund |
|---|---|---|---|---|---|
| Versorger | ROA | ≥ 8 % | 5 % | 0 % → 3 % | BACH 2024: Gewinne durch hohe Energiepreise |
| Versorger | Current Ratio | ≥ 140 % | 77 % | 12 % → 12 % | europäische Einzelabschlüsse viel liquider |
| Basiskonsum | Current Ratio | ≥ 160 % | 98 % | 17 % → 19 % | US-Detailhandel mit wenig Umlaufvermögen |
| Basiskonsum | Anlagedeckung II | ≥ 120 % | 99 % | 19 % → 47 % | wie oben |
| Energie | ROA | ≥ 8 % | 7 % | 24 % → 57 % | BACH 2024: Gewinne durch hohe Energiepreise |
| Energie | Tilgungsdauer | 1–2.5 Jahre | 4.2 J. | 21 % → 57 % | Debt/EBITDA passt nicht zu Nettoschulden/FCF bei hohen Investitionen |
| Gesundheit | Current Ratio | ≥ 185 % | 158 % | 41 % → 54 % | QFR: US-Pharma 133 % statt BACH 181 % |
| Gesundheit | Verschuldungsgrad | 50–115 % | 109 % | 48 % → 77 % | US-Pharma stärker verschuldet |
| Werkstoffe | Verschuldungsgrad | 60–140 % | 137 % | 52 % → 84 % | US-Werkstoffe stärker verschuldet |
| Immobilien | Tilgungsdauer | 4.5–11 Jahre | 72 J. | 0 % → 0 % | Kennzahl bei Immobilien kaum aussagekräftig |

Offen bleibt: Bei Versorgern (Current Ratio, ROA), Basiskonsum (Current Ratio) und Immobilien (Tilgungsdauer) passt auch das Buch nicht; dort ist die Ampel weiterhin meist rot. Nicht geändert, weil nicht kritisch: Umsatzrendite (Untergrenze fast überall erfüllt), Versorger ROIC ≥ 4 %, Darstellung der Bereiche (nur eine Grenze wird geprüft).

## Entscheide (05.11.2026)
1. Branchen-Richtwerte gibt es für 9 Kennzahlen, alle ausser Cash Ratio und Quick Ratio (Quelle zu schwach).
2. Finanzbranche: Branchen-Richtwerte nur für ROE, Umsatzrendite, ROIC und Tilgungsdauer. Bei den Bilanz-Kennzahlen gilt das Buch.
3. Vergleich: Sind alle Firmen aus derselben Branche, gilt der Branchen-Richtwert, sonst das Buch. Die Detailseite zeigt beide Richtwerte. Die Kurzkarte zeigt den Branchen-Richtwert.

Umsetzung: `docs/superpowers/specs/2026-11-05-branchen-richtwerte-design.md`

## Anhang: Zuordnung zu GICS
| Branche | BACH (NACE) | Damodaran-Industrien (Auswahl) |
|---|---|---|
| Technologie | C26, J62, J63 | Semiconductor, Software, Computers, Computer Services, Telecom Equipment |
| Gesundheit | C21, Q86 | Drugs (Pharma/Biotech), Healthcare Products/Services, Hospitals |
| Industrie | C27, C28, C30, H49–H52, N | Aerospace/Defense, Machinery, Electrical Equipment, Transportation, Business Services |
| Zyklischer Konsum | C13–C15, C29, G45, G47, I55, I56 | Auto, Retail, Restaurants, Hotel/Gaming, Apparel, Homebuilding |
| Basiskonsum | C10–C12 | Food Processing, Beverages, Household Products, Tobacco, Grocery |
| Energie | B06, B09, C19 | Oil/Gas (alle), Oilfield Services, Coal |
| Versorger | D35, E36 | Utility (General/Water), Power, Green & Renewable Energy |
| Werkstoffe | B07, B08, C17, C20, C23, C24 | Chemicals, Metals & Mining, Steel, Paper, Packaging |
| Kommunikation | J58–J61 | Telecom, Cable TV, Broadcasting, Entertainment, Advertising |
| Immobilien | L68 | R.E.I.T., Real Estate (alle) |
| Finanzen | – | Banks, Insurance, Brokerage, Asset Management, Financial Services |

Die Auswertungsskripte (BACH, Damodaran, Faktor-Methode, Prüfung) liegen lokal vor und kommen bei der Umsetzung nach `data/research/`.
