from common import branchen_richtwert, load_kpi_config, load_sectors

CONFIG = load_kpi_config()
SECTORS = load_sectors()
KPI = {k["id"]: k for k in CONFIG["kpis"]}
TOL = CONFIG["ampel"]["gelbToleranz"]
BRANCHE = {"current_ratio", "tilgungsdauer", "roe", "roa", "ros", "roic", "equity_ratio", "debt_equity", "adg2"}
FINANZEN = {"roe", "ros", "roic", "tilgungsdauer"}


def test_genau_neun_kennzahlen_haben_branchen_richtwerte():
    assert {k for k, v in KPI.items() if "richtwertBranche" in v} == BRANCHE


def test_sektoren_existieren_und_finanzen_nur_rentabilitaet():
    for kid in BRANCHE:
        rb = KPI[kid]["richtwertBranche"]
        assert rb["quelle"]
        assert set(rb["werte"]) <= set(SECTORS)
        assert ("Financials" in rb["werte"]) == (kid in FINANZEN)
        for rw in rb["werte"].values():
            assert rw["label"] and ("min" in rw or "max" in rw)


def test_werte_aus_recherche():
    assert branchen_richtwert(KPI["roic"], "Utilities") == {"min": 0.04, "label": "≥ 4 %"}
    assert branchen_richtwert(KPI["tilgungsdauer"], "Utilities")["max"] == 9.5
    assert branchen_richtwert(KPI["cash_ratio"], "Utilities") is None
    assert branchen_richtwert(KPI["equity_ratio"], "Financials") is None


def test_ausnahmen_aus_plausibilitaets_check():
    """Wo die Quelle nicht zu unseren Firmen passt, gilt der allgemeine Richtwert (docs/BRANCHEN_RICHTWERTE.md)."""
    ausnahmen = {
        "current_ratio": {"Utilities", "Consumer Staples", "Health Care"},
        "adg2": {"Consumer Staples"},
        "roa": {"Utilities", "Energy"},
        "debt_equity": {"Health Care", "Materials"},
        "tilgungsdauer": {"Energy", "Real Estate"},
    }
    for kid, sectors in ausnahmen.items():
        for sector in sectors:
            assert branchen_richtwert(KPI[kid], sector) is None, (kid, sector)


# --- Task 2: Pipeline ---
import json  # noqa: E402

from build_dataset import build  # noqa: E402
from load_supabase import company_rows  # noqa: E402
from scoring import ampel, ampel_branche  # noqa: E402


def test_ampel_branche_versorger_roic():
    k = KPI["roic"]
    assert ampel_branche(0.05, k, "Utilities", TOL) == "green" and ampel(0.05, k, TOL) == "red"
    assert ampel_branche(0.04, k, "Utilities", TOL) == "green"
    assert ampel_branche(0.033, k, "Utilities", TOL) == "yellow"
    assert ampel_branche(0.031, k, "Utilities", TOL) == "red"


def test_ohne_branchen_richtwert_gleich_buch():
    for v in (0.1, 0.5, 1.2):
        assert ampel_branche(v, KPI["cash_ratio"], "Utilities", TOL) == ampel(v, KPI["cash_ratio"], TOL)
    assert ampel_branche(0.3, KPI["equity_ratio"], "Financials", TOL) == ampel(0.3, KPI["equity_ratio"], TOL)
    assert ampel_branche(None, KPI["roic"], "Utilities", TOL) == "grey"


def test_negatives_eigenkapital_auch_branche_rot():
    assert ampel_branche(-3.0, KPI["debt_equity"], "Industrials", TOL) == "red"


def _dataset(tmp_path):
    tickers = tmp_path / "tickers.csv"
    tickers.write_text("ticker,name,sector,index,country\nX.SW,Firma X,Industrials,SMI,CH\n", encoding="utf-8")
    balance = {"Current Assets": 140.0, "Current Liabilities": 100.0, "Total Assets": 500.0, "Stockholders Equity": 300.0}
    (tmp_path / "X.SW.json").write_text(json.dumps({
        "info": {"marketCap": 10e9, "currency": "CHF", "financialCurrency": "CHF"},
        "balance_sheet": {"2024": balance, "2025": balance},
        "income_stmt": {"2025": {"Net Income": 30.0}}, "cashflow": {}, "fetched_at": "2026-11-05",
    }), encoding="utf-8")
    return build(tmp_path, tickers, fx={"CHF": 1.25})


def test_dataset_hat_ampel_branche(tmp_path):
    kpis = _dataset(tmp_path)["companies"][0]["kpis"]
    assert all(k["ampelBranche"] in {"green", "yellow", "red", "grey"} for k in kpis.values())
    # Current Ratio 140 %: Buch 150 % -> gelb, Industrie >= 135 % -> grün
    assert kpis["current_ratio"]["ampel"] == "yellow" and kpis["current_ratio"]["ampelBranche"] == "green"


def test_supabase_rows_haben_ampel_branche(tmp_path):
    _, kpi_rows, _ = company_rows(_dataset(tmp_path))
    cr = {r["year"]: r for r in kpi_rows if r["kpi_id"] == "current_ratio"}
    assert cr[2025]["ampel_branche"] == "green" and cr[2024]["ampel_branche"] is None
