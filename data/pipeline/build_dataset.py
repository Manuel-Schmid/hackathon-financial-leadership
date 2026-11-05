"""Cache + Konfiguration -> Datensatz im Format des Frontends (Company in docs/PLAN.md)."""
from __future__ import annotations

import csv
import json
import time
from pathlib import Path

from common import CACHE_DIR, TICKERS_CSV, load_kpi_config, load_sectors, size_class
from kpis import compute_kpis
from mapping import available_years, map_year
from scoring import ampel, score_companies

# Nur Rückfallwert, wenn kein Kurs abrufbar ist: USD pro Einheit der Kurswährung.
FX_FALLBACK = {"USD": 1.0, "CHF": 1.25, "EUR": 1.1, "GBP": 1.3}


def market_cap_usd(info: dict, fx: dict[str, float]) -> float | None:
    cap, currency = info.get("marketCap"), info.get("currency")
    rate = fx.get(currency) if currency else None
    return cap * rate if cap is not None and rate else None


def company_from_cache(row: dict, raw: dict, config: dict, sectors: dict, fx: dict[str, float]) -> dict | None:
    years = available_years(raw)
    if not years:
        return None
    tolerance = config["ampel"]["gelbToleranz"]
    mapped = {y: map_year(raw, str(y)) for y in years}
    per_year = {y: compute_kpis(mapped[y], mapped.get(y - 1)) for y in years}
    latest = years[-1]

    cap = market_cap_usd(raw.get("info", {}), fx)
    sector = sectors[row["sector"]]
    kpis = {}
    for kpi in config["kpis"]:
        value = per_year[latest][kpi["id"]]
        kpis[kpi["id"]] = {
            "value": value,
            "ampel": ampel(value, kpi, tolerance),
            "history": [{"year": y, "value": per_year[y][kpi["id"]]} for y in years],
        }
    info = raw.get("info", {})
    return {
        "ticker": row["ticker"],
        "name": row["name"],
        "sector": row["sector"],
        "sectorDe": sector["de"],
        "index": row["index"],
        "country": row["country"],
        "currency": info.get("financialCurrency") or info.get("currency") or "",
        "marketCapUsd": cap,
        "sizeClass": size_class(cap),
        "isFinancial": bool(sector.get("financial")),
        "fiscalYear": latest,
        "kpis": kpis,
    }


def add_scores(companies: list[dict], config: dict) -> None:
    flat = [
        {"ticker": c["ticker"], "isFinancial": c["isFinancial"], "kpis": {k: v["value"] for k, v in c["kpis"].items()}}
        for c in companies
    ]
    scores = score_companies(flat, config)
    for c in companies:
        c["scores"] = scores[c["ticker"]]


def build(cache_dir: Path = CACHE_DIR, tickers_csv: Path = TICKERS_CSV, fx: dict[str, float] | None = None) -> dict:
    config, sectors = load_kpi_config(), load_sectors()
    fx_rates = {**FX_FALLBACK, **(fx or {})}
    with tickers_csv.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    companies, fetched = [], []
    for row in rows:
        path = cache_dir / f"{row['ticker']}.json"
        if not path.exists():
            continue
        raw = json.loads(path.read_text(encoding="utf-8"))
        company = company_from_cache(row, raw, config, sectors, fx_rates)
        if company:
            companies.append(company)
            fetched.append(raw.get("fetched_at", ""))
    add_scores(companies, config)
    return {
        "meta": {
            "asOf": max(fetched, default=time.strftime("%Y-%m-%d")),
            "source": "Yahoo Finance",
            "count": len(companies),
        },
        "companies": companies,
    }
