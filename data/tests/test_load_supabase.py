from build_tickers import build_rows
from load_supabase import stale_tickers


def test_stale_tickers_only_removed_ones():
    data = {"companies": [{"ticker": "GOOGL"}, {"ticker": "VACN.SW"}]}
    assert stale_tickers(["GOOGL", "GOOG", "VACN.SW", "FOX"], data) == ["FOX", "GOOG"]
    assert stale_tickers(["GOOGL"], data) == []


def test_one_share_class_per_company():
    """Alphabet, Fox und News Corp nur mit einer Aktienklasse (gleiche Finanzzahlen, sonst doppelte Punkte)."""
    tickers = {r["ticker"] for r in build_rows()}
    assert {"GOOGL", "FOXA", "NWSA"} <= tickers
    assert not {"GOOG", "FOX", "NWS"} & tickers
    bases = [r["name"].split(" (Class")[0] for r in build_rows()]
    assert len(bases) == len(set(bases))


class _Query:
    def __init__(self, fail):
        self.fail = fail

    def select(self, *_):
        return self

    def limit(self, *_):
        return self

    def execute(self):
        if self.fail:
            raise RuntimeError("column kpis.ampel_branche does not exist")
        return self


class _Client:
    def __init__(self, fail):
        self.fail = fail

    def table(self, _):
        return _Query(self.fail)


def test_schema_check_bricht_vor_dem_laden_ab_wenn_spalte_fehlt():
    import pytest
    from load_supabase import check_schema

    with pytest.raises(SystemExit, match="alter table public.kpis add column"):
        check_schema(_Client(fail=True))
    check_schema(_Client(fail=False))  # Spalte vorhanden: kein Abbruch
