"""Plausibilität nach dem Lauf: VAT-Check, Anteil fehlender Werte, grösste Ausreisser."""
from __future__ import annotations

import json

from common import WEB_JSON, load_kpi_config

VAT_EXPECTED = {"equity_ratio": 0.628, "current_ratio": 1.314, "roe": 0.277, "ebit_margin": 0.254}


def main() -> None:
    data = json.loads(WEB_JSON.read_text(encoding="utf-8"))
    companies = data["companies"]
    config = load_kpi_config()
    print(f"{len(companies)} Firmen, Stand {data['meta']['asOf']}\n")

    print("VAT (Yahoo vs. Folien):")
    vat = next((c for c in companies if c["ticker"] == "VACN.SW"), None)
    if vat is None:
        print("  VACN.SW fehlt im Datensatz")
    else:
        print(f"  Geschäftsjahr {vat['fiscalYear']}, Scores {vat['scores']}")
        for kpi_id, expected in VAT_EXPECTED.items():
            print(f"  {kpi_id:15} {vat['kpis'][kpi_id]['value']}  (Folie 2025: {expected})")

    print("\nFehlende Werte pro Kennzahl:")
    for kpi in config["kpis"]:
        missing = sum(1 for c in companies if c["kpis"][kpi["id"]]["value"] is None)
        print(f"  {kpi['id']:15} {missing / max(len(companies), 1):6.1%}")

    print("\nAusreisser (grösste Beträge, ohne FCF):")
    values = [
        (abs(c["kpis"][k["id"]]["value"]), c["ticker"], k["id"], c["kpis"][k["id"]]["value"])
        for c in companies
        for k in config["kpis"]
        if k["unit"] != "currency" and c["kpis"][k["id"]]["value"] is not None
    ]
    for _, ticker, kpi_id, value in sorted(values, reverse=True)[:20]:
        print(f"  {ticker:10} {kpi_id:15} {value:.2f}")


if __name__ == "__main__":
    main()
