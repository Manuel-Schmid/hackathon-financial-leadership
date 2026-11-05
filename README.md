# KUBUS – Kennzahlen im Zieldreieck

Hackathon „Finanzielle Führung“ HS26 (HSG). Web-App zum Vergleich von Unternehmen (S&P 500 + SMI/SMIM) anhand von Kennzahlen: jede Firma als Punkt in einem 3D-Würfel mit den Achsen **Liquidität, Rentabilität, Sicherheit**, dazu Filter, Detailseiten, Vergleich und Watchlists pro Kunde.

## Schnellstart (ohne Supabase)
Die Daten liegen im Repo, Watchlists werden dann im Browser gespeichert:

```bash
cd web
npm install
npm run dev
```

Danach http://localhost:5173 öffnen.

> **Stand:** Explorer, Detailseite, Vergleich, Watchlists und Methodik laufen mit echten Daten. Login und Supabase sind geschrieben, aber noch ungetestet. Details: `docs/PROGRAMMIERPLAN.md`.

## Dokumentation
- `CLAUDE.md` – Kontext und Regeln für AI-Assistenten (und alle anderen): zuerst lesen
- `docs/AUFGABE.md` – Aufgabenstellung und Präsentation
- `docs/PLAN.md` – Umsetzungsplan
- `docs/PROGRAMMIERPLAN.md` – Stand, Code-Aufteilung, „Wo ändere ich was?“
- `docs/KENNZAHLEN.md` – Formeln, Richtwerte, Scoring (Buch S. 292–293)
- `docs/BRANDING.md` – Name, Farben, Schriften, Mockups
- `docs/ENTSCHEIDE.md` – Entscheide, Weg, Gelernt
- `config/` – Kennzahlen- und Branchen-Konfiguration (eine Quelle der Wahrheit)

## Tests
```bash
python3 -m pytest data/tests
```

```bash
npm --prefix web test
```

## Mit Login (Supabase)
1. `.env.example` nach `.env` kopieren und Supabase-Werte eintragen (nie committen)
2. `supabase/schema.sql` im Supabase SQL-Editor ausführen, unter Authentication „Confirm email“ ausschalten
3. Daten laden: `data/.venv/bin/python data/pipeline/load_supabase.py`

## Daten neu holen
```bash
python3 -m venv data/.venv
```

```bash
data/.venv/bin/pip install -r data/requirements.txt
```

```bash
data/.venv/bin/python data/pipeline/run_all.py
```

Bereits geholte Firmen liegen in `data/cache/` und werden übersprungen. Nur neu rechnen, ohne Abruf: `data/.venv/bin/python data/pipeline/export_json.py`
