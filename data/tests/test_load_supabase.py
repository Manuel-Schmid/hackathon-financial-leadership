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
