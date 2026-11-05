import json

import pytest

from build_dataset import build
from build_tickers import build_rows, yahoo_symbol
from common import load_kpi_config, size_class
from scoring import ampel, percentile_ranks, score_companies

CONFIG = load_kpi_config()
KPI = {k["id"]: k for k in CONFIG["kpis"]}
TOL = CONFIG["ampel"]["gelbToleranz"]


@pytest.mark.parametrize(
    "kpi_id,value,expected",
    [
        ("current_ratio", 1.314, "yellow"),  # VAT, Mockup: gelb
        ("cash_ratio", 0.389, "red"),
        ("roe", 0.277, "green"),  # über dem Band bleibt grün
        ("equity_ratio", 0.628, "green"),
        ("debt_equity", 0.592, "green"),  # unter dem Band ist bei "tiefer besser" gut
        ("debt_equity", 2.70, "yellow"),  # Mockup Nestlé: 270 %
        ("debt_equity", 5.25, "red"),
        ("debt_equity", -3.0, "red"),  # negatives Eigenkapital
        ("fcf", 43024, "green"),
        ("fcf", -1, "red"),
        ("fcf", 0, "red"),
        ("ebit_margin", 0.25, "grey"),  # kein Richtwert
        ("roe", None, "grey"),
    ],
)
def test_ampel(kpi_id, value, expected):
    assert ampel(value, KPI[kpi_id], TOL) == expected


def test_percentile_best_is_100_and_ignores_none():
    ranks = percentile_ranks({"a": 1.0, "b": 2.0, "c": 3.0, "d": None}, KPI["current_ratio"])
    assert ranks == {"a": 0.0, "b": 50.0, "c": 100.0}


def test_percentile_lower_is_better_inverts():
    ranks = percentile_ranks({"a": 1.0, "b": 2.0, "c": 3.0}, KPI["gearing"])
    assert ranks["a"] == 100.0 and ranks["c"] == 0.0


def test_percentile_ties_share_rank():
    ranks = percentile_ranks({"a": 1.0, "b": 1.0, "c": 2.0}, KPI["current_ratio"])
    assert ranks["a"] == ranks["b"] == 25.0


def test_negative_equity_ranks_worst_not_best():
    ranks = percentile_ranks({"neg": -5.0, "low": 0.5, "high": 3.0}, KPI["debt_equity"])
    assert ranks["neg"] == 0.0 and ranks["low"] == 100.0


def test_financials_ranked_separately_without_liquidity():
    companies = [
        {"ticker": "A", "isFinancial": False, "kpis": {"current_ratio": 1.0, "roe": 0.1}},
        {"ticker": "B", "isFinancial": False, "kpis": {"current_ratio": 2.0, "roe": 0.2}},
        {"ticker": "BANK1", "isFinancial": True, "kpis": {"current_ratio": 9.0, "roe": 0.01}},
        {"ticker": "BANK2", "isFinancial": True, "kpis": {"current_ratio": 9.0, "roe": 0.02}},
    ]
    scores = score_companies(companies, CONFIG)
    assert scores["B"]["liquiditaet"] == 100.0
    assert scores["BANK1"]["liquiditaet"] is None
    assert scores["BANK2"]["rentabilitaet"] == 100.0  # Rang nur innerhalb des Finanzsektors
    assert scores["A"]["sicherheit"] is None  # keine Werte: bleibt leer


def test_size_class_limits():
    assert [size_class(v) for v in (11e9, 5e9, 1e9, None)] == ["Large", "Mid", "Small", None]


def test_ticker_list_is_consistent():
    rows = build_rows()
    assert yahoo_symbol("BRK.B") == "BRK-B" and yahoo_symbol("VACN.SW") == "VACN.SW"
    assert len({r["ticker"] for r in rows}) == len(rows)
    assert any(r["ticker"] == "VACN.SW" for r in rows)


def test_build_dataset_end_to_end(tmp_path):
    """Cache-Datei -> Frontend-Format, ohne Yahoo."""
    tickers = tmp_path / "tickers.csv"
    tickers.write_text("ticker,name,sector,index,country\nX.SW,Firma X,Industrials,SMI,CH\n", encoding="utf-8")
    balance = {"Current Assets": 150.0, "Current Liabilities": 100.0, "Total Assets": 500.0, "Stockholders Equity": 300.0}
    (tmp_path / "X.SW.json").write_text(
        json.dumps(
            {
                "info": {"marketCap": 10e9, "currency": "CHF", "financialCurrency": "CHF"},
                "balance_sheet": {"2024": balance, "2025": balance},
                "income_stmt": {"2025": {"Net Income": 30.0}},
                "cashflow": {},
                "fetched_at": "2026-11-05",
            }
        ),
        encoding="utf-8",
    )
    data = build(tmp_path, tickers, fx={"CHF": 1.25})
    company = data["companies"][0]
    assert data["meta"] == {"asOf": "2026-11-05", "source": "Yahoo Finance", "count": 1}
    assert company["marketCapUsd"] == 12.5e9 and company["sizeClass"] == "Large"
    assert company["sectorDe"] == "Industrie" and company["fiscalYear"] == 2025
    assert company["kpis"]["current_ratio"]["value"] == 1.5
    assert company["kpis"]["current_ratio"]["ampel"] == "green"
    assert company["kpis"]["roe"]["value"] == pytest.approx(0.1)
    assert [p["year"] for p in company["kpis"]["roe"]["history"]] == [2024, 2025]
    assert company["kpis"]["ros"]["value"] is None  # kein Umsatz im Cache
    assert company["scores"]["liquiditaet"] == 50.0
