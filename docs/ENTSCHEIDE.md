# Entscheide, Weg und Gelernt

Laufend ergänzen (Uhrzeit · was · warum · was hat (nicht) funktioniert). Grundlage für die Präsentationsteile „Weg“ und „Gelernt“.

| Zeit | Entscheid / Ereignis | Warum / Ergebnis |
|---|---|---|
| Do 11:00 | Aufgabe erhalten (VL7, Folie 40) | Tool zum Vergleich von Unternehmen anhand von Kennzahlen |
| Do 12:00 | Idee: Zieldreieck als 3D-Würfel | Verbindet Theorie (Abb. 106 Buch) mit einer Darstellung „auf einen Blick“ |
| Do 12:30 | Achse „Sicherheit“ statt „Risiko“ | Auf allen Achsen gilt hoch = gut, Ideal-Ecke eindeutig |
| Do 12:30 | S&P 500 + SMI/SMIM, Banken mit Hinweis | Relevantes Universum für Wealth Manager; Banken-Bilanzen anders aufgebaut |
| Do 12:30 | Supabase mit Login + Watchlists pro Kunde | Use Case Wealth Manager aus der Aufgabenstellung |
| Do 12:30 | Präsentation lokal, Offline-Modus | Unabhängig vom WLAN im Raum |
| Do 12:45 | Perzentil-Scores + absolute Ampeln | Robust gegen Ausreisser, leicht erklärbar; Richtwerte aus Buch S. 293 |
| Do 13:00 | Umsetzung mit Claude Code im Repo | Code direkt auf dem Laptop, Yahoo erreichbar, Push mit eigenem Login |
| Do | Pipeline vor dem Frontend, zuerst mit VAT- und Geberit-Zahlen getestet | Die Formeln stimmen mit den Folien überein, bevor echte Daten fliessen; 45 Tests grün |
| Do | Negatives Eigenkapital zählt beim Verschuldungsgrad als schlechtester Rang | Sonst hätten überschuldete Firmen den besten Wert („tiefer = besser“), gefunden beim Schreiben der Scoring-Regeln |
| Do | SMI/SMIM-Liste offen | Entwurf hat 21 + 28 statt 20 + 30 Titel, muss gegen six-group.com geprüft werden |
| Do | Yahoo-Abruf getestet, bevor das Frontend entstand | Grösstes Risiko zuerst: lief ohne Sperre, VAT-Bilanz stimmt exakt mit den Folien |
| Do | Yahoo-EBIT weicht vom Geschäftsbericht ab (24.3 % statt 25.4 %) | Gelernt: Datenanbieter bereinigen Posten; Formel ist korrekt, Grenze wird auf der Methodik-Seite offengelegt |
| Do | Fehler: Würfel unsichtbar, weil die lange Liste die Rasterzeile auf 13'000 px dehnte | Nur im Browser sichtbar, Build und Tests waren grün. Gelernt: Selbstcheck im Browser ist nötig |
| Do | Three.js-Tone-Mapping ausgeschaltet | Es verfälschte die Branding-Farben (grauer Boden) |
| Do | Voller Yahoo-Abruf: alle 551 Titel, rund 12 Minuten statt der geplanten 30–45 | Drei Symbole aus der Handliste waren ungültig (Roche, Baloise, Helvetia), korrigiert. Keine Drosselung |
| Do | Supabase gefüllt und gegen die JSON-Datei verglichen | 45'407 Kennzahl-Zeilen, 0 Abweichungen. Beim Prüfen gefunden: seitenweises Laden braucht eine eindeutige Sortierung, sonst fehlen Zeilen an den Seitengrenzen |
| Do | Design-Überarbeitung Schritt für Schritt auf Branch `Frontend-Design` | Farbwelt Nachtblau und Gold, Akzent Pflaume, Logo «Offene Ecke», Suche mit Filter-Karte und Börsenwert-Regler, Detailseite in drei Spalten. Gelernt: Fehler wie der Absturz durch `scrollTo` zeigten sich nur im Browser, nicht in Build und Tests |
| Do | Georg Fischer mit Verschuldungsgrad −397 geprüft | Kein Fehler: Yahoo weist negatives Eigenkapital aus; 32 Firmen sind so, die Regel „schlechtester Rang“ greift |
