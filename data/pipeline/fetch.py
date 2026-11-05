"""Yahoo Finance -> data/cache/<ticker>.json. Fortsetzbar, ein Abruf pro Ticker mit Pause.

    python fetch.py --only SMI --limit 20
    python fetch.py --resume
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import random
import time

from common import CACHE_DIR, TICKERS_CSV


def frame_to_years(df) -> dict[str, dict[str, float]]:
    """DataFrame (Zeilen = Felder, Spalten = Stichtage) -> {"2025": {"Total Assets": 1.0}}."""
    if df is None or df.empty:
        return {}
    years: dict[str, dict[str, float]] = {}
    for col in df.columns:
        year = str(col.year)
        values = {}
        for field, value in df[col].items():
            if value is not None and not (isinstance(value, float) and math.isnan(value)):
                values[str(field)] = float(value)
        if values:
            years.setdefault(year, values)
    return years


def fetch_ticker(symbol: str) -> dict:
    import yfinance as yf  # erst hier: Tests und Berechnung laufen ohne yfinance

    t = yf.Ticker(symbol)
    info = t.info or {}
    return {
        "ticker": symbol,
        "info": {
            "marketCap": info.get("marketCap"),
            "currency": info.get("currency"),
            "financialCurrency": info.get("financialCurrency"),
        },
        "balance_sheet": frame_to_years(t.balance_sheet),
        "income_stmt": frame_to_years(t.income_stmt),
        "cashflow": frame_to_years(t.cashflow),
        "fetched_at": time.strftime("%Y-%m-%d"),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="nur dieser Index: SP500, SMI, SMIM")
    ap.add_argument("--limit", type=int)
    ap.add_argument("--resume", action="store_true", help="vorhandene Cache-Dateien überspringen")
    args = ap.parse_args()

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    with TICKERS_CSV.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if args.only:
        rows = [r for r in rows if r["index"] == args.only]
    if args.limit:
        rows = rows[: args.limit]

    failed: list[str] = []
    for i, row in enumerate(rows, 1):
        symbol = row["ticker"]
        path = CACHE_DIR / f"{symbol}.json"
        if args.resume and path.exists():
            continue
        try:
            data = fetch_ticker(symbol)
            if not data["balance_sheet"]:
                raise ValueError("keine Bilanz")
            path.write_text(json.dumps(data), encoding="utf-8")
            print(f"[{i}/{len(rows)}] {symbol} ok", flush=True)
        except Exception as exc:  # Yahoo wirft vieles; ein Ticker darf den Lauf nicht stoppen
            failed.append(symbol)
            print(f"[{i}/{len(rows)}] {symbol} FEHLER: {exc}", flush=True)
        time.sleep(random.uniform(0.5, 1.0))

    print(f"Fertig. Fehlgeschlagen ({len(failed)}): {', '.join(failed) or '-'}")


if __name__ == "__main__":
    main()
