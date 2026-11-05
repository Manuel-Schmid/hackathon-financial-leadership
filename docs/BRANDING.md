# Branding KUBUS

**Name:** KUBUS · **Untertitel:** Kennzahlen im Zieldreieck
Alternativen (falls umbenannt wird): Trilemma, Triax, Dreiklang, CubeScore, Fundamentum.

## Logo
`docs/brand/logo.svg`: isometrischer Würfel, die drei sichtbaren Flächen = die drei Achsen
(oben Rentabilität gold, links Liquidität blau, rechts Sicherheit grün).

## Farben (als Tailwind-Tokens anlegen)
| Token | Rolle | Hex |
|---|---|---|
| L | Liquidität | #2F80ED (soft #E6F0FD) |
| R | Rentabilität | #E8A317 (soft #FDF3DC, Text auf hell #B07A00) |
| S | Sicherheit | #1E9E6A (soft #E2F4EC) |
| accent | Auswahl, Ideal-Ecke, Badges | #5B4BE0 |
| ink | Kopfzeile, Text | #0E1726 / Text #152033 |
| paper | Hintergrund | #F4F6F9 |
| card | Karten | #FFFFFF, Rand #E1E6EE |
| muted | Sekundärtext | #66748A |
| good / warn / bad | Ampel | #1E9E6A / #E0A100 / #D9443B |
Branchenfarben: `config/sectors.json`.

Regeln: Jede Achse hat überall dieselbe Farbe (Würfel, Balken, Radar, Tabellen). Ampelfarben nur für Richtwert-Vergleich.

## Schriften (Google Fonts / @fontsource)
- **Sora** 600/700: Logo, Titel
- **Manrope** 400–700: Fliesstext, UI
- **JetBrains Mono** 400/600: Zahlen (gleich breite Ziffern)

## Vorlagen
`docs/mockups/explorer.png`, `docs/mockups/compare.png` (+ HTML-Quellen; Fonts darin verweisen auf node_modules und laden ohne Installation nicht). `docs/brand/brand-mockup.css` enthält die Tokens als CSS-Variablen.
