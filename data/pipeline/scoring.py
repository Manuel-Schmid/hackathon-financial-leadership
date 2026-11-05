"""Perzentil-Scores und Ampeln (Regeln: docs/KENNZAHLEN.md, Abschnitt Scoring)."""
from __future__ import annotations

import math


def ampel(value: float | None, kpi: dict, tolerance: float) -> str:
    """Absolut gegen den Richtwert. Über dem Band bleibt bei 'höher besser' grün."""
    rw = kpi.get("richtwert")
    if value is None or not rw:
        return "grey"
    if kpi.get("negativeIsWorst") and value < 0:
        return "red"
    if kpi["direction"] == "lower":
        limit = rw.get("max", rw.get("min"))
        if value <= limit:
            return "green"
        return "yellow" if value <= limit * (1 + tolerance) else "red"
    limit = rw.get("min", rw.get("max"))
    # Richtwert "> 0" (FCF): keine Toleranz möglich, und 0 selbst erfüllt ihn nicht.
    if limit == 0:
        return "green" if value > 0 else "red"
    if value >= limit:
        return "green"
    return "yellow" if value >= limit * (1 - tolerance) else "red"


def percentile_ranks(values: dict[str, float | None], kpi: dict) -> dict[str, float]:
    """{ticker: wert} -> {ticker: 0..100}, bestes = 100. Gleiche Werte teilen den mittleren Rang."""
    lower = kpi["direction"] == "lower"

    def goodness(v: float) -> float:
        # Negativer Verschuldungsgrad = negatives Eigenkapital. Das wäre sonst "am wenigsten verschuldet".
        if kpi.get("negativeIsWorst") and v < 0:
            return -math.inf
        return -v if lower else v

    items = sorted(((goodness(v), t) for t, v in values.items() if v is not None), key=lambda x: x[0])
    n = len(items)
    if n == 0:
        return {}
    if n == 1:
        return {items[0][1]: 50.0}

    ranks: dict[str, float] = {}
    i = 0
    while i < n:
        j = i
        while j + 1 < n and items[j + 1][0] == items[i][0]:
            j += 1
        rank = (i + j) / 2 / (n - 1) * 100
        for k in range(i, j + 1):
            ranks[items[k][1]] = rank
        i = j + 1
    return ranks


def _axis_score(parts: list[float]) -> float | None:
    return round(sum(parts) / len(parts), 1) if parts else None


def score_companies(companies: list[dict], config: dict) -> dict[str, dict[str, float | None]]:
    """companies: [{ticker, isFinancial, kpis: {id: wert}}] -> {ticker: {achse: score}}.

    Nicht-Finanzfirmen und Finanzsektor werden getrennt gerankt; der Finanzsektor nur mit den
    Kennzahlen aus config.financialSector.scoreKpis und ohne Liquiditäts-Score.
    """
    kpis_by_id = {k["id"]: k for k in config["kpis"]}
    axes = list(config["axes"])
    regular = {a: [k["id"] for k in config["kpis"] if k["axis"] == a and k["inScore"] is True] for a in axes}
    financial = {a: config["financialSector"]["scoreKpis"].get(a, []) for a in axes}

    result: dict[str, dict[str, float | None]] = {}
    for is_fin, spec in ((False, regular), (True, financial)):
        group = [c for c in companies if bool(c["isFinancial"]) == is_fin]
        ranks = {
            kpi_id: percentile_ranks({c["ticker"]: c["kpis"].get(kpi_id) for c in group}, kpis_by_id[kpi_id])
            for ids in spec.values()
            for kpi_id in ids
        }
        for c in group:
            result[c["ticker"]] = {
                axis: _axis_score([ranks[k][c["ticker"]] for k in ids if c["ticker"] in ranks[k]])
                for axis, ids in spec.items()
            }
    return result
