"""Pflicht-Test: VAT 2025 (Folien VL3–VL5) und Geberit 2015 (VL7), Zahlen aus docs/KENNZAHLEN.md."""
import pytest

from common import load_kpi_config
from kpis import KPI_FUNCS, compute_kpis
from mapping import map_year

EMPTY = {
    k: None
    for k in (
        "current_assets current_liabilities cash receivables noncurrent_assets total_assets total_liabilities "
        "noncurrent_liabilities equity total_debt invested_capital revenue ebit ebitda net_income tax op_cf "
        "inv_cf dividends interest"
    ).split()
}

VAT_2025 = {
    **EMPTY,
    "current_assets": 475_720,
    "current_liabilities": 362_014,
    "cash": 140_940,
    "receivables": 125_765,
    "noncurrent_assets": 787_158,
    "total_assets": 1_262_878,
    "total_liabilities": 469_709,
    "noncurrent_liabilities": 107_695,
    "equity": 793_169,
    "total_debt": 203_626 + 44_656,
    "revenue": 1_073_516,
    "ebitda": 321_577,
    "ebit": 272_810,
    "net_income": 214_280,
    "op_cf": 299_172,
    "inv_cf": -68_784,
    "dividends": 187_364,
    "interest": 4_461,
}
VAT_2024 = {**EMPTY, "total_assets": 1_294_746, "equity": 753_877}


@pytest.mark.parametrize(
    "kpi_id,expected,tolerance",
    [
        ("cash_ratio", 0.389, 0.0005),
        ("quick_ratio", 0.737, 0.0005),
        ("current_ratio", 1.314, 0.0005),
        ("cashflow_ratio", 0.826, 0.0005),
        ("fcf", 43_024, 0.5),
        ("tilgungsdauer", 2.49, 0.005),
        ("interest_cover", 68.1, 0.05),
        ("roe", 0.277, 0.0005),
        ("roa", 0.171, 0.0005),
        ("ebit_margin", 0.254, 0.0005),
        ("ebitda_margin", 0.300, 0.0005),
        ("ros", 0.200, 0.0005),
        ("equity_ratio", 0.628, 0.0005),
        ("debt_equity", 0.592, 0.0005),
        ("adg2", 1.144, 0.0005),
        ("gearing", 0.135, 0.0005),
    ],
)
def test_vat_2025(kpi_id, expected, tolerance):
    assert compute_kpis(VAT_2025, VAT_2024)[kpi_id] == pytest.approx(expected, abs=tolerance)


def test_geberit_2015():
    current = {
        **EMPTY,
        "current_assets": 960.8,
        "current_liabilities": 466.3,
        "equity": 1482.2,
        "total_assets": 3553.8,
        "noncurrent_liabilities": 1605.3,
        "noncurrent_assets": 2593.0,
        "net_income": 422.4,
        "op_cf": 612.1,
    }
    k = compute_kpis(current, {**EMPTY, "equity": 1717.1})
    assert k["current_ratio"] == pytest.approx(2.060, abs=0.0005)
    assert k["equity_ratio"] == pytest.approx(0.417, abs=0.0005)
    assert k["adg2"] == pytest.approx(1.191, abs=0.0005)
    assert k["roe"] == pytest.approx(0.264, abs=0.0005)
    assert k["cashflow_ratio"] == pytest.approx(1.313, abs=0.0005)


def test_config_and_formulas_match():
    assert {k["id"] for k in load_kpi_config()["kpis"]} == set(KPI_FUNCS)


def test_missing_field_gives_none_never_zero():
    assert all(v is None for v in compute_kpis(EMPTY, None).values())


def test_no_previous_year_gives_no_average_kpis():
    k = compute_kpis(VAT_2025, None)
    assert k["roe"] is None and k["roa"] is None
    assert k["equity_ratio"] is not None


def test_negative_equity_gives_no_roe():
    current = {**VAT_2025, "equity": -100, "net_income": -50}
    assert compute_kpis(current, {**EMPTY, "equity": -100, "total_assets": 1})["roe"] is None
    # Auch beim Übergang ins negative EK (Durchschnitt noch positiv) müssen ROE und Gearing None sein:
    transition = compute_kpis({**VAT_2025, "equity": -10}, {**VAT_2024, "equity": 100})
    assert transition["roe"] is None
    assert transition["gearing"] is None


def test_tiny_equity_ratio_gives_no_roe():
    # EK-Quote < 2 % (z. B. 0.5 % durch Aktienrückkäufe) verzerrt ROE extrem -> None
    tiny_eq = {**VAT_2025, "equity": 5_000, "total_assets": 1_000_000}
    assert compute_kpis(tiny_eq, VAT_2024)["roe"] is None


def test_tilgungsdauer_needs_positive_fcf():
    assert compute_kpis({**VAT_2025, "op_cf": 0}, VAT_2024)["tilgungsdauer"] is None


def test_tilgungsdauer_net_cash_is_zero():
    net_cash = {**VAT_2025, "cash": 500_000, "total_debt": 100_000}
    assert compute_kpis(net_cash, VAT_2024)["tilgungsdauer"] == 0.0


def test_roa_without_interest_defaults_interest_to_zero():
    no_int = {**VAT_2025, "interest": None}
    k = compute_kpis(no_int, VAT_2024)
    assert k["roa"] == pytest.approx(214_280 / ((1_262_878 + 1_294_746) / 2), abs=0.0005)
    assert k["interest_cover"] is None


def test_mapping_fallbacks_and_signs():
    raw = {
        "balance_sheet": {"2025": {"Cash Cash Equivalents And Short Term Investments": 5.0}},
        "income_stmt": {"2025": {"Operating Income": 7.0, "Interest Expense": 2.0}},
        "cashflow": {"2025": {"Cash Dividends Paid": -3.0, "Operating Cash Flow": 9.0}},
    }
    m = map_year(raw, "2025")
    assert m["cash"] == 5.0 and m["ebit"] == 7.0
    assert m["dividends"] == 3.0 and m["interest"] == 2.0
    assert m["revenue"] is None


def test_mapping_no_dividend_means_zero_only_with_cashflow():
    assert map_year({"cashflow": {"2025": {"Operating Cash Flow": 1.0}}}, "2025")["dividends"] == 0.0
    assert map_year({}, "2025")["dividends"] is None
