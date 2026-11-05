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
                        "ampel_branche": kpi["ampelBranche"] if point["year"] == c["fiscalYear"] else None,
                    }
                )
    return companies, kpis, scores


def stale_tickers(existing: list[str], data: dict) -> list[str]:
    """Ticker in Supabase, die nicht mehr in companies.json stehen (z. B. entfernte Aktienklassen)."""
    current = {c["ticker"] for c in data["companies"]}
    return sorted(set(existing) - current)


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

    # Upsert löscht nichts: Firmen, die nicht mehr im Universum sind, explizit entfernen.
    # kpis, scores und watchlist_items folgen per "on delete cascade".
    existing = [r["ticker"] for r in client.table("companies").select("ticker").execute().data]
    stale = stale_tickers(existing, data)
    if stale:
        client.table("companies").delete().in_("ticker", stale).execute()
    print(f"entfernt: {len(stale)} Firmen {stale}")


if __name__ == "__main__":
    main()
