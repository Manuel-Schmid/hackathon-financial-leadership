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


MIGRATION = (
    "alter table public.kpis add column if not exists ampel_branche text "
    "check (ampel_branche in ('green', 'yellow', 'red', 'grey'));"
)


def check_schema(client) -> None:
    """Vor dem Laden prüfen, ob kpis.ampel_branche existiert; sonst bräche der Upsert nach companies/scores ab."""
    try:
        client.table("kpis").select("ampel_branche").limit(1).execute()
    except Exception as exc:  # PostgREST meldet unbekannte Spalten als Fehler
        raise SystemExit(f"Spalte kpis.ampel_branche fehlt ({exc}). Einmal im Supabase SQL-Editor ausführen:\n{MIGRATION}") from exc


def _load_env(path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip("'\""))


def _rest_request(url: str, key: str, method: str, path: str, body: object = None, prefer: str = "") -> object:
    import urllib.request

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    data_bytes = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(f"{url.rstrip('/')}/rest/v1/{path}", data=data_bytes, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw else None


def main() -> None:
    from urllib.parse import quote

    _load_env(ROOT / ".env")
    url = os.environ["VITE_SUPABASE_URL"]
    key = os.environ["SUPABASE_SECRET_KEY"]
    try:
        _rest_request(url, key, "GET", "kpis?select=ampel_branche&limit=1")
    except Exception as exc:
        raise SystemExit(f"Spalte kpis.ampel_branche fehlt ({exc}). Einmal im Supabase SQL-Editor ausführen:\n{MIGRATION}") from exc
    data = json.loads(WEB_JSON.read_text(encoding="utf-8"))
    companies, kpis, scores = company_rows(data)
    for table, rows in (("companies", companies), ("scores", scores), ("kpis", kpis)):
        for start in range(0, len(rows), BATCH):
            _rest_request(url, key, "POST", table, rows[start : start + BATCH], prefer="resolution=merge-duplicates")
        print(f"{table}: {len(rows)} Zeilen")

    # Falls das letzte vollständige Geschäftsjahr zurückgesetzt wurde (z. B. 2024 statt unvollständigem 2025),
    # alte Zeilen > fiscalYear in scores und kpis löschen.
    max_year = max(c["fiscalYear"] for c in data["companies"])
    for c in data["companies"]:
        if c["fiscalYear"] < max_year:
            t_q = quote(c["ticker"], safe="")
            _rest_request(url, key, "DELETE", f"scores?ticker=eq.{t_q}&year=gt.{c['fiscalYear']}")
            _rest_request(url, key, "DELETE", f"kpis?ticker=eq.{t_q}&year=gt.{c['fiscalYear']}")

    # Upsert löscht nichts: Firmen, die nicht mehr im Universum sind, explizit entfernen.
    # kpis, scores und watchlist_items folgen per "on delete cascade".
    existing_rows = _rest_request(url, key, "GET", "companies?select=ticker") or []
    existing = [r["ticker"] for r in existing_rows]
    stale = stale_tickers(existing, data)
    if stale:
        in_list = ",".join(quote(t, safe="") for t in stale)
        _rest_request(url, key, "DELETE", f"companies?ticker=in.({in_list})")
    print(f"entfernt: {len(stale)} Firmen {stale}")


if __name__ == "__main__":
    main()
