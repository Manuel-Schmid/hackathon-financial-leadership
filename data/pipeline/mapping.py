"""Yahoo-Feldnamen -> unsere Begriffe. Erster vorhandener Name gewinnt. Fehlt alles: None, nie 0."""
from __future__ import annotations

BALANCE = {
    "current_assets": ["Current Assets"],
    "current_liabilities": ["Current Liabilities"],
    "cash": ["Cash And Cash Equivalents", "Cash Cash Equivalents And Short Term Investments"],
    "receivables": ["Accounts Receivable", "Receivables"],
    "noncurrent_assets": ["Total Non Current Assets"],
    "total_assets": ["Total Assets"],
    "total_liabilities": ["Total Liabilities Net Minority Interest"],
    "noncurrent_liabilities": ["Total Non Current Liabilities Net Minority Interest"],
    "equity": ["Stockholders Equity", "Total Equity Gross Minority Interest"],
    "total_debt": ["Total Debt"],
    "invested_capital": ["Invested Capital"],
}
INCOME = {
    "revenue": ["Total Revenue", "Operating Revenue"],
    "ebit": ["EBIT", "Operating Income"],
    "ebitda": ["EBITDA", "Normalized EBITDA"],
    "net_income": ["Net Income", "Net Income Common Stockholders"],
    "tax": ["Tax Provision"],
    "interest_expense": ["Interest Expense", "Interest Expense Non Operating"],
}
CASHFLOW = {
    "op_cf": ["Operating Cash Flow", "Cash Flow From Continuing Operating Activities"],
    "inv_cf": ["Investing Cash Flow", "Cash Flow From Continuing Investing Activities"],
    "dividends": ["Cash Dividends Paid", "Common Stock Dividend Paid"],
    "interest_paid": ["Interest Paid Supplemental Data"],
}


def _pick(values: dict, names: list[str]) -> float | None:
    for name in names:
        if values.get(name) is not None:
            return values[name]
    return None


def map_year(raw: dict, year: str) -> dict[str, float | None]:
    """Ein Cache-Eintrag + Jahr -> {current_assets: ..., revenue: ...}."""
    out: dict[str, float | None] = {}
    for section, spec in (("balance_sheet", BALANCE), ("income_stmt", INCOME), ("cashflow", CASHFLOW)):
        values = raw.get(section, {}).get(year, {})
        for field, names in spec.items():
            out[field] = _pick(values, names)

    # Yahoo verbucht Abflüsse negativ, die Formeln rechnen mit Beträgen.
    # Keine Dividende ausgewiesen heisst hier 0 (FCF bleibt berechenbar), kein fehlender Wert.
    has_cashflow = bool(raw.get("cashflow", {}).get(year))
    out["dividends"] = abs(out["dividends"]) if out["dividends"] is not None else (0.0 if has_cashflow else None)
    interest = out["interest_paid"] if out["interest_paid"] is not None else out["interest_expense"]
    out["interest"] = abs(interest) if interest is not None else None
    return out


def available_years(raw: dict) -> list[int]:
    return sorted(int(y) for y in raw.get("balance_sheet", {}))
