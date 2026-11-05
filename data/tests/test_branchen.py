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
    assert branchen_richtwert(KPI["tilgungsdauer"], "Real Estate")["max"] == 11
    assert branchen_richtwert(KPI["cash_ratio"], "Utilities") is None
    assert branchen_richtwert(KPI["equity_ratio"], "Financials") is None
