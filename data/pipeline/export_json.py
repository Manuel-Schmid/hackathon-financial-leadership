"""Datensatz -> web/public/data/companies.json (Offline-Modus und Entwicklung)."""
from __future__ import annotations

import json

from build_dataset import build
from common import CACHE_DIR, WEB_JSON


def fetch_fx() -> dict[str, float]:
    """Aktueller Kurs in USD, gespeichert in data/cache/fx.json; ohne Netz der letzte Stand."""
    path = CACHE_DIR / "fx.json"
    try:
        import yfinance as yf

        rate = float(yf.Ticker("CHFUSD=X").fast_info["last_price"])
        rates = {"CHF": rate}
        path.write_text(json.dumps(rates), encoding="utf-8")
        return rates
    except Exception as exc:
        print(f"FX nicht abrufbar ({exc}), nutze letzten Stand oder Rückfallwert")
        return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def main() -> None:
    data = build(fx=fetch_fx())
    WEB_JSON.parent.mkdir(parents=True, exist_ok=True)
    WEB_JSON.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{data['meta']['count']} Firmen nach {WEB_JSON}")


if __name__ == "__main__":
    main()
