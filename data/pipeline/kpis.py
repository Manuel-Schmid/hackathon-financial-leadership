"""Die 17 Kennzahlen (Buch S. 292). Je id eine Funktion; Metadaten stehen in config/kpis.json.

Neue Kennzahl: Eintrag in config/kpis.json + Funktion hier. test_kpis prüft, dass beide übereinstimmen.
"""
from __future__ import annotations

from typing import Callable

Fields = dict[str, float | None]


def _div(a: float | None, b: float | None) -> float | None:
    if a is None or b is None or b == 0:
        return None
    return a / b


def _avg(a: float | None, b: float | None) -> float | None:
    return None if a is None or b is None else (a + b) / 2


def _fcf(c: Fields) -> float | None:
    if c["op_cf"] is None or c["inv_cf"] is None or c["dividends"] is None:
        return None
    return c["op_cf"] + c["inv_cf"] - c["dividends"]


def _tilgungsdauer(c: Fields, p: Fields | None) -> float | None:
    fcf = _fcf(c)
    # Ohne positiven Free Cashflow lässt sich nichts tilgen: Kennzahl ist nicht aussagekräftig.
    if fcf is None or fcf <= 0 or c["total_debt"] is None or c["cash"] is None:
        return None
    return (c["total_debt"] - c["cash"]) / fcf


def _quick(c: Fields, p: Fields | None) -> float | None:
    if c["cash"] is None or c["receivables"] is None:
        return None
    return _div(c["cash"] + c["receivables"], c["current_liabilities"])


def _roe(c: Fields, p: Fields | None) -> float | None:
    avg = _avg(c["equity"], p["equity"]) if p else None
    # Negatives Eigenkapital: Verlust / negatives EK ergäbe eine falsche positive Rendite.
    return None if avg is None or avg <= 0 else _div(c["net_income"], avg)


def _roa(c: Fields, p: Fields | None) -> float | None:
    avg = _avg(c["total_assets"], p["total_assets"]) if p else None
    if c["net_income"] is None or c["interest"] is None:
        return None
    return _div(c["net_income"] + c["interest"], avg)


def _roic(c: Fields, p: Fields | None) -> float | None:
    avg = _avg(c["invested_capital"], p["invested_capital"]) if p else None
    if c["ebit"] is None or c["tax"] is None or avg is None or avg <= 0:
        return None
    return (c["ebit"] - c["tax"]) / avg


def _adg2(c: Fields, p: Fields | None) -> float | None:
    if c["equity"] is None or c["noncurrent_liabilities"] is None:
        return None
    return _div(c["equity"] + c["noncurrent_liabilities"], c["noncurrent_assets"])


def _gearing(c: Fields, p: Fields | None) -> float | None:
    if c["total_debt"] is None or c["cash"] is None:
        return None
    return _div(c["total_debt"] - c["cash"], c["equity"])


def _interest_cover(c: Fields, p: Fields | None) -> float | None:
    if c["op_cf"] is None or c["interest"] is None:
        return None
    return _div(c["op_cf"] + c["interest"], c["interest"])


KPI_FUNCS: dict[str, Callable[[Fields, Fields | None], float | None]] = {
    "cash_ratio": lambda c, p: _div(c["cash"], c["current_liabilities"]),
    "quick_ratio": _quick,
    "current_ratio": lambda c, p: _div(c["current_assets"], c["current_liabilities"]),
    "cashflow_ratio": lambda c, p: _div(c["op_cf"], c["current_liabilities"]),
    "fcf": lambda c, p: _fcf(c),
    "tilgungsdauer": _tilgungsdauer,
    "roe": _roe,
    "roa": _roa,
    "ebit_margin": lambda c, p: _div(c["ebit"], c["revenue"]),
    "ros": lambda c, p: _div(c["net_income"], c["revenue"]),
    "ebitda_margin": lambda c, p: _div(c["ebitda"], c["revenue"]),
    "roic": _roic,
    "equity_ratio": lambda c, p: _div(c["equity"], c["total_assets"]),
    "debt_equity": lambda c, p: _div(c["total_liabilities"], c["equity"]),
    "adg2": _adg2,
    "gearing": _gearing,
    "interest_cover": _interest_cover,
}


def compute_kpis(current: Fields, previous: Fields | None) -> dict[str, float | None]:
    return {kpi_id: func(current, previous) for kpi_id, func in KPI_FUNCS.items()}
