# Aufgabenstellung Hackathon 2026

Quelle: Vorlesung 7 „Hackathon“, Folie 40 (Dr. Daniel Tinner, HSG, HS2026).

> Entwickelt ein Tool, anhand dessen man Unternehmen mit Kennzahlen vergleichen kann und füttert dieses mit ein paar Unternehmensdaten (Tipp: Yahoo Finance / Bloomberg, APIs).
> Das Tool soll genutzt werden können, um Unternehmen auszuwählen und hinsichtlich ihrer Kennzahlen zu vergleichen. Es könnte beispielsweise einem Wealth Manager dazu dienen, die besten Aktientipps für seine Kunden zu finden, oder Kunden aufzuzeigen, wie sich Unternehmen in ihren Fundamentaldaten unterscheiden.
> Ihr habt 24h Zeit.

## Abgabe
- Live-Demo (bei uns: **lokal auf localhost**, Präsentations-Laptop + Backup-Laptop)
- Screenshots (Print Screens)
- Folien, falls notwendig
- Inhaltlich: Wie sind wir es angegangen? Was hat funktioniert (Weg)? Was haben wir gelernt?

## Präsentation
- 20 Minuten Präsentation, danach 20 Minuten Diskussion (Stärken, Schwächen des Tools)
- Termin Abgabe: Freitag, 06.11.2026, 12:00

## Ablauf der 20 Minuten (Plan)
| Minuten | Inhalt |
|---|---|
| 0–2 | Problem: Ein Wealth Manager will Unternehmen schnell vergleichen; 20 Kennzahlen pro Firma sind zu viel für einen Blick |
| 2–4 | Idee: Zieldreieck der Vorlesung (Rentabilität, Liquidität, Sicherheit) als 3D-Würfel |
| 4–12 | Live-Demo als Geschichte: „Kunde Müller sucht eine sichere Industrie-Aktie“ → Login als Beraterin → Filter Industrie + Large → Würfel drehen → VAT und Geberit in Watchlist → Vergleich → Detailseite VAT (Zahlen kennt die Klasse aus den Folien) |
| 12–15 | Methodik: Kennzahlen, Richtwerte (Buch S. 292–293), Scoring, Datenquelle |
| 15–18 | Weg: Vorgehen, was hat funktioniert, was nicht |
| 18–20 | Gelernt und Ausblick |

## Diskussion vorbereiten
| | Punkte |
|---|---|
| Stärken | Ein Blick auf alle drei Ziele; Verbindung zur Theorie (Zieldreieck, Buch S. 292–293); echte Daten; Drill-down bis zur Formel; Ampeln mit Richtwerten; persönliche Watchlists pro Kunde |
| Schwächen | Scores sind eine Vereinfachung (Gewichtung = Werturteil); Perzentile relativ zur Auswahl; nur Jahresdaten; Yahoo-Daten ungeprüft/lückenhaft; Banken nur eingeschränkt vergleichbar; keine Marktbewertung (KGV) im Score; keine Prognose |
| Ausbau | Gewichtung nach Kundenprofil, Bewertungskennzahlen aus VL6 (KGV, EV/EBITDA), Quartalsdaten, Branchen-Benchmarks, Zeitachse als Animation |

## Rollen in der Demo
- **Angemeldete Person** = Wealth Manager / Kundenberaterin (z.B. Demo-Konto „Lea Meier“)
- **Watchlist** = pro Kunde, z.B. „Kunde Müller · konservativ“ (der Kunde hat kein eigenes Konto)
