# KUBUS – Anweisungen für Claude Code

Dieses Projekt ist der Hackathon „Finanzielle Führung HS26“ (HSG, Dr. Daniel Tinner).
Team: 4 Studierende. Abgabe: **Freitag, 06.11.2026, 12:00**. Präsentation lokal (localhost), kein Live-Link.

## Zuerst lesen
1. `docs/AUFGABE.md` – Aufgabenstellung, Abgabe, Präsentation
2. `docs/PLAN.md` – vollständiger Umsetzungsplan (Funktionen, Daten, Technik, 8 Schritte, Zeitplan); `docs/PROGRAMMIERPLAN.md` – aktueller Stand und Code-Aufteilung
3. `docs/KENNZAHLEN.md` + `config/kpis.json` – Formeln, Richtwerte, Scoring (Quelle: Buch „Grundlagen der finanziellen Führung“, S. 292–293)
4. `docs/BRANDING.md` + `docs/mockups/*.png` – so soll das UI aussehen

## Was wir bauen
**KUBUS – Kennzahlen im Zieldreieck.** Web-App, die ~550 Unternehmen (S&P 500 + SMI/SMIM) als Punkte in einem drehbaren 3D-Würfel zeigt. Achsen: **Liquidität, Rentabilität, Sicherheit** (Scores 0–100). Dazu Filter, Liste, Detailseite mit allen Kennzahlen, Vergleich von Favoriten, Login mit Profil und Watchlists (Supabase).

## Feste Entscheide (nicht ohne Rückfrage ändern)
- Achsen: Liquidität, Rentabilität, **Sicherheit** (nicht „Risiko“; hoch = gut auf allen Achsen)
- Daten: S&P 500 + SMI/SMIM; Banken & Versicherungen werden angezeigt, als hohle Punkte mit Hinweis „eingeschränkt vergleichbar“
- Stack: React + Vite + TypeScript, Three.js via @react-three/fiber + drei, Tailwind, Recharts, Supabase (Postgres + Auth + RLS), Python-Pipeline mit yfinance
- Läuft lokal mit `npm run dev`; Offline-Modus mit `companies.json` wenn Supabase nicht erreichbar
- UI-Sprache: Deutsch (Schweizer Schreibweise, „ss“ statt „ß“)

## Arbeitsregeln
1. **Modular bauen.** Eine Quelle der Wahrheit pro Thema:
   - Kennzahlen (Name, Formel-Text, Achse, Richtung, Richtwert, im Score ja/nein) nur in `config/kpis.json` – Python und Frontend lesen beide daraus.
   - Branchen/Farben in `config/sectors.json`, Branding-Farben als Tailwind-Tokens.
   - Datenzugriff im Frontend nur über ein `DataSource`-Interface (`SupabaseSource`, `JsonSource`), Komponenten kennen Supabase nicht direkt.
   - Kleine Komponenten, keine Datei über ~250 Zeilen.
2. **Selbstchecks nach jedem Schritt** – erst weiter, wenn grün:
   - `npm run build` und `npm run typecheck` ohne Fehler, `npm test` (Vitest) grün
   - `pytest` für die Pipeline grün; Pflicht-Test: VAT 2025 ergibt EK-Quote 62.8 %, Current Ratio 131 %, FCF (VL4) 43'024 TCHF (Zahlen in `docs/KENNZAHLEN.md`)
   - App im Browser öffnen, Seite durchklicken, Konsole ohne Fehler
   - kurze Notiz in `docs/ENTSCHEIDE.md` (was gemacht, was entschieden, was nicht geklappt hat) – brauchen wir für die Präsentation „Weg & Gelernt“
3. **Geheimnisse:** `.env` liegt nur lokal und ist in `.gitignore`. Niemals Keys committen, loggen oder in Code schreiben. Das Frontend nutzt nur den Publishable Key; der Secret Key wird nur von `data/pipeline/load_supabase.py` gelesen.
4. **Git:** kleine, sprechende Commits auf `main` (Team arbeitet parallel). Vor jedem Push: Build + Tests grün.
5. **Daten:** Rohdaten von Yahoo werden pro Ticker zwischengespeichert (`data/cache/`, nicht im Repo). Abrufe mit Pause (≈0.5–1 s), Wiederaufnahme nach Abbruch.

6. **Stand nachführen:** Status und Module stehen in `docs/PROGRAMMIERPLAN.md`. Wer einen Schritt abschliesst, aktualisiert dort die Tabelle.

## Aktueller Stand und nächster Schritt
Lies `docs/PROGRAMMIERPLAN.md`: Stand pro Schritt, Modul-Aufteilung, „Wo ändere ich was?“, Datenentscheide und offene Punkte.

## Bekannte Stolpersteine
- **Repo-Wurzel ist dieser Ordner** (`Projekt/`). Alle Befehle von hier aus, Remote: `Manuel-Schmid/hackathon-financial-leadership`.
- **iCloud:** Liegt der Ordner in iCloud-synchronisierten „Dokumente“, erzeugt iCloud Duplikate wie `Datei 2.js` in `node_modules` und zerstört den Build. Abhilfe: `node_modules` und `.venv` als `*.nosync`-Ordner anlegen und per Symlink einbinden (ist in `.gitignore` berücksichtigt).
- **Tests der Pipeline:** `python -m pytest data/tests` läuft auch ohne yfinance und ohne Netz. `fetch.py`, `load_supabase.py` und `export_json.py` (nur für den Wechselkurs) brauchen die Pakete aus `data/requirements.txt`.
- **Pakete und externe Tools** nicht ungefragt installieren; die Person am Laptop zuerst fragen.
