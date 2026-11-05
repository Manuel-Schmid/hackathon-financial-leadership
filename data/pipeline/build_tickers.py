"""data/raw/*.csv -> data/tickers.csv (ticker, name, sector, index, country)."""
from __future__ import annotations

import csv

from common import RAW_DIR, TICKERS_CSV, load_sectors


def yahoo_symbol(symbol: str) -> str:
    """Yahoo schreibt Klassen mit Bindestrich (BRK.B -> BRK-B); .SW bleibt."""
    return symbol if symbol.endswith(".SW") else symbol.replace(".", "-")


def build_rows() -> list[dict]:
    sectors = load_sectors()
    rows: list[dict] = []
    seen: set[str] = set()

    def add(ticker: str, name: str, sector: str, index: str, country: str) -> None:
        if sector not in sectors:
            raise ValueError(f"Unbekannter Sektor '{sector}' bei {ticker}: fehlt in config/sectors.json")
        if ticker in seen:
            return
        seen.add(ticker)
        rows.append({"ticker": ticker, "name": name, "sector": sector, "index": index, "country": country})

    with (RAW_DIR / "sp500.csv").open(encoding="utf-8") as f:
        for r in csv.DictReader(f):
            add(yahoo_symbol(r["Symbol"]), r["Security"], r["GICS Sector"], "SP500", "US")
    with (RAW_DIR / "smi_smim.csv").open(encoding="utf-8") as f:
        for r in csv.DictReader(f):
            add(r["Symbol"], r["Security"], r["GICS Sector"], r["Index"], "CH")
    return rows


def main() -> None:
    rows = build_rows()
    with TICKERS_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["ticker", "name", "sector", "index", "country"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"{len(rows)} Ticker nach {TICKERS_CSV}")


if __name__ == "__main__":
    main()
