"""Gemeinsame Pfade und Konfiguration. config/ ist die einzige Quelle der Wahrheit."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG_DIR = ROOT / "config"
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
CACHE_DIR = DATA_DIR / "cache"
TICKERS_CSV = DATA_DIR / "tickers.csv"
WEB_JSON = ROOT / "web" / "public" / "data" / "companies.json"


def load_kpi_config() -> dict:
    return json.loads((CONFIG_DIR / "kpis.json").read_text(encoding="utf-8"))


def load_sectors() -> dict:
    return json.loads((CONFIG_DIR / "sectors.json").read_text(encoding="utf-8"))


def size_class(market_cap_usd: float | None) -> str | None:
    """Large > 10 Mrd., Mid 2–10 Mrd., Small < 2 Mrd. USD (docs/PLAN.md)."""
    if market_cap_usd is None:
        return None
    if market_cap_usd > 10e9:
        return "Large"
    if market_cap_usd >= 2e9:
        return "Mid"
    return "Small"
