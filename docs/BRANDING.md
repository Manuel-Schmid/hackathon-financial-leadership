# Branding KUBUS

**Name:** KUBUS · **Untertitel:** Kennzahlen im Zieldreieck
Alternativen (falls umbenannt wird): Trilemma, Triax, Dreiklang, CubeScore, Fundamentum.

## Logo
«Offene Ecke»: Würfel als Linie, an der Ideal-Ecke offen, dort steht nur der goldene Punkt (#D99A1C). Die Ecke ist das Ziel.

- `web/public/logo.svg`: weisse Linien, für nachtblaue Flächen (Kopf- und Fusszeile); Kopie in `docs/brand/logo.svg`
- `web/public/favicon.svg`: Browser-Tab, Linien wechseln mit hellem und dunklem Modus
- Auf hellen Flächen nachtblaue Linien verwenden (siehe `favicon.svg`)

## Farben: Farbwelt A «Nachtblau und Gold»
Die Werte stehen nur in `config/theme.json` (Tailwind und Würfel lesen daraus). Dort ändern, nicht in Komponenten.

| Token | Rolle | Hex |
|---|---|---|
| L | Liquidität | #2F6FDE (soft #E2EBFB) |
| R | Rentabilität | #D99A1C (soft #FAF0D6, Text auf hell #96690B) |
| S | Sicherheit | #1C8C66 (soft #DDF1E8) |
| accent | Auswahl, Ideal-Ecke, Badges | #5A2A82 Pflaume (soft #EEE5F5) |
| ink / text | Kopfzeile, Text | #0B1D3A |
| paper | Hintergrund | #F7F4EC |
| card | Karten | #FFFFFF, Rand #E4DECF |
| muted | Sekundärtext | #5F6B7E |
| good / warn / bad | Ampel | #1C8C66 / #E0A100 / #D9443B |
Branchenfarben: `config/sectors.json`.

Regeln: Jede Achse hat überall dieselbe Farbe (Würfel, Balken, Radar, Tabellen). Ampelfarben nur für Richtwert-Vergleich.

## Schriften (Google Fonts / @fontsource)
- **Sora** 600/700: Logo, Titel
- **Manrope** 400–700: Fliesstext, UI
- **JetBrains Mono** 400/600: Zahlen (gleich breite Ziffern)

## Vorlagen
Die Mockups zeigen noch die alten Farben von vor Farbwelt A.

`docs/mockups/explorer.png`, `docs/mockups/compare.png` (+ HTML-Quellen; Fonts darin verweisen auf node_modules und laden ohne Installation nicht). `docs/brand/brand-mockup.css` enthält die Tokens als CSS-Variablen.
