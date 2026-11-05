# KUBUS – Kennzahlen im Zieldreieck

Hackathon „Finanzielle Führung“ HS26 (HSG). Web-App zum Vergleich von Unternehmen (S&P 500 + SMI/SMIM) anhand von Kennzahlen: jede Firma als Punkt in einem 3D-Würfel mit den Achsen **Liquidität, Rentabilität, Sicherheit**, dazu Filter, Detailseiten, Vergleich und Watchlists pro Kunde.

> **Stand:** Konzept, Konfiguration, Datenbankschema und Berechnung (Kennzahlen, Scoring, Tests) sind im Repo. Das Frontend und der echte Yahoo-Abruf folgen. Details: `docs/PROGRAMMIERPLAN.md`.

## Dokumentation
- `CLAUDE.md` – Kontext und Regeln für AI-Assistenten (und alle anderen): zuerst lesen
- `docs/AUFGABE.md` – Aufgabenstellung und Präsentation
- `docs/PLAN.md` – Umsetzungsplan
- `docs/PROGRAMMIERPLAN.md` – Stand, Code-Aufteilung, „Wo ändere ich was?“
- `docs/KENNZAHLEN.md` – Formeln, Richtwerte, Scoring (Buch S. 292–293)
- `docs/BRANDING.md` – Name, Farben, Schriften, Mockups
- `docs/ENTSCHEIDE.md` – Entscheide, Weg, Gelernt
- `config/` – Kennzahlen- und Branchen-Konfiguration (eine Quelle der Wahrheit)

## Tests der Berechnung
Braucht nur `pytest`, kein Netz und kein yfinance:

```bash
python3 -m pytest data/tests
```

## Setup
1. `.env.example` nach `.env` kopieren und Supabase-Werte eintragen (nie committen)
2. `supabase/schema.sql` im Supabase SQL-Editor ausführen
3. Daten: `python3 -m venv data/.venv && data/.venv/bin/pip install -r data/requirements.txt && data/.venv/bin/python data/pipeline/run_all.py`
4. App (sobald vorhanden): `cd web && npm install && npm run dev` → http://localhost:5173
