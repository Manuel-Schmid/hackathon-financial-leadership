# Branchen-Richtwerte

Erzeugt `richtwertBranche` in `config/kpis.json`. Methode und Quellen: `docs/BRANCHEN_RICHTWERTE.md`.

```bash
python data/research/branchen_richtwerte.py          # Werte in config/kpis.json schreiben
python data/research/branchen_richtwerte.py --check  # Tabelle und Anteil grün (Buch -> Branche)
```

- `bach.py`: BACH (ECCBSO), lädt beim ersten Lauf `bach.zip` (~195 MB) nach `cache/`
- `damodaran.py`: Damodaran (NYU Stern), lädt 4 HTML-Tabellen nach `cache/`
- `cache/` ist nicht im Repo. Nach dem Schreiben `python data/pipeline/refresh_from_json.py` (Ampeln neu) und `load_supabase.py` laufen lassen.
