"""companies.json -> Supabase (Upsert). Einziger Ort, der den Secret Key liest."""
from __future__ import annotations

import json
import os

from common import ROOT, WEB_JSON

BATCH = 500


def company_rows(data: dict) -> tuple[list[dict], list[dict], list[dict]]:
    companies, kpis, scores = [], [], []
    for c in data["companies"]:
        companies.append(
            {
                "ticker": c["ticker"],
                "name": c["name"],
                "sector": c["sector"],
                "sector_de": c["sectorDe"],
                "index": c["index"],
                "country": c["country"],
                "currency": c["currency"],
                "market_cap_usd": c["marketCapUsd"],
                "size_class": c["sizeClass"],
                "is_financial": c["isFinancial"],
                "fiscal_year": c["fiscalYear"],
                "as_of": data["meta"]["asOf"],
            }
        )
        scores.append({"ticker": c["ticker"], "year": c["fiscalYear"], **c["scores"]})
        for kpi_id, kpi in c["kpis"].items():
            for point in kpi["history"]:
                kpis.append(
                    {
                        "ticker": c["ticker"],
                        "year": point["year"],
                        "kpi_id": kpi_id,
                        "value": point["value"],
                        # Ampel gilt für das letzte Geschäftsjahr, so wie im Frontend-Modell
                        "ampel": kpi["ampel"] if point["year"] == c["fiscalYear"] else None,
                    }
                )
    return companies, kpis, scores


def main() -> None:
    from dotenv import load_dotenv
    from supabase import create_client

    load_dotenv(ROOT / ".env")
    client = create_client(os.environ["VITE_SUPABASE_URL"], os.environ["SUPABASE_SECRET_KEY"])
    data = json.loads(WEB_JSON.read_text(encoding="utf-8"))
    companies, kpis, scores = company_rows(data)
    for table, rows in (("companies", companies), ("scores", scores), ("kpis", kpis)):
        for start in range(0, len(rows), BATCH):
            client.table(table).upsert(rows[start : start + BATCH]).execute()
        print(f"{table}: {len(rows)} Zeilen")


if __name__ == "__main__":
    main()
