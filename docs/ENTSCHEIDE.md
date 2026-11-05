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
| Do | KPI-Edge-Cases & Abgrenzungen geschärft | 1) Bei EK ≤ 0: Gearing = null, ADG II = rot & schlechtester Rang, ROE erst ab 2 % EK-Quote (verhindert +15'367 % ROE bei AbbVie oder +1'603 % bei Colgate durch Aktienrückkäufe). 2) Tilgungsdauer bei Netto-Cash auf 0.0 J. statt negativ. 3) ROA bei fehlendem Zinsfeld mit Zins = 0 berechnet (holt u.a. Apple & Eli Lilly rein). 4) Unvollständiges letztes Jahr fällt auf letztes komplettes Jahr zurück (FERG, SKYD, ADM). 5) Krankenversicherer ohne UV (ELV, HUM) als Finanzsektor eingestuft, Immobilien-Hinweis ergänzt -> alle 548 Firmen im Würfel |
| Do | Doppelte Aktienklassen entfernt: GOOG, FOX, NWS (behalten: GOOGL, FOXA, NWSA) | Gleiche Firma, gleiche Zahlen, zwei Punkte im Würfel; zählten im Perzentil-Ranking doppelt. Jetzt 548 Firmen, Scores ändern sich um höchstens 0.4 Punkte. Neu bewertet aus `companies.json` (ohne Yahoo-Cache), `load_supabase.py` löscht jetzt auch Firmen, die nicht mehr im Universum sind |
| Do | Namen ohne „(Class A)“, Supabase nachgeführt | Secret Key nur in `.env`. Ohne die Python-Pakete per REST-API geladen (gleiche Zeilen wie `load_supabase.py`). Danach mit dem Publishable Key geprüft: 548 Firmen, 45'152 Kennzahl-Zeilen, Scores identisch mit der JSON-Datei, die drei alten Ticker inkl. Kennzahlen gelöscht |
| Do | Branchen-Richtwerte statt nur Buch-Richtwerte | Buch-Richtwerte trafen ganze Branchen (ROIC: 9 % der Versorger grün, Tilgungsdauer: 0 % der Immobilien). Recherche in Primärquellen (BACH der Zentralbanken, Damodaran/NYU). Gelernt: Das Buch entspricht fast genau dem Median aller grossen Firmen in BACH. Methode: Buch × Branchenfaktor für 9 Kennzahlen; Cash/Quick Ratio nicht (Quellen zu schwach). Gilt im Vergleich innerhalb einer Branche, auf der Detailseite neben dem Buch, in der Kurzkarte |
| Do | In der Oberfläche «allgemeiner Richtwert» statt «Buch» | «Richtwert Buch» / «wie Buch» wirkte unprofessionell. Die Quelle (Buch S. 292–293) steht auf der Methodik-Seite. Ohne Branchenwert zeigt die Detailseite den allgemeinen Wert hellgrau mit Tooltip |
| Do | Detailseite nach Redesign: zwei Richtwert-Zeilen pro Kennzahl («Allgemein …» und «Branche …», je mit Ampel) | Die neue Detailseite hat schmale Kennzahl-Zeilen statt einer Tabelle. Die Branchen-Zeile erscheint nur, wenn die Branche einen eigenen, abweichenden Wert hat; Kurzform «J.» und ohne «(RONOA)», damit die Zeile in 132 px passt |
| Do | Explorer-Filter und Sortierung im sessionStorage | Bleiben beim Seitenwechsel und Neuladen erhalten, sind nach dem Schliessen des Fensters weg (Wunsch: nicht bei jedem Klick auf eine Firma neu filtern). Gespeicherte Werte werden Feld für Feld geprüft, damit alte Daten den Explorer nicht brechen |
