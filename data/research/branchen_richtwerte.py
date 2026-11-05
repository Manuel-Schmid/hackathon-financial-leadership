"""Branchen-Richtwert = Buch-Richtwert x Branchenfaktor (Branche / alle Branchen, gleiche Quelle).

    python data/research/branchen_richtwerte.py          # schreibt richtwertBranche in config/kpis.json
    python data/research/branchen_richtwerte.py --check  # nur Tabelle und Anteil grün (Buch -> Branche)

Herleitung und Quellen: docs/BRANCHEN_RICHTWERTE.md
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
sys.path.insert(1, str(HERE.parent / "pipeline"))

import bach  # noqa: E402
import damodaran  # noqa: E402
from common import CONFIG_DIR, WEB_JSON, load_kpi_config  # noqa: E402
from scoring import ampel  # noqa: E402

QUELLE = {
    "bach": "BACH (ECCBSO), grosse Unternehmen, Daten 2024: {m}; allgemeiner Richtwert × Branchenfaktor",
    "damodaran": "Damodaran (NYU Stern), US, 01/2026: {m}; allgemeiner Richtwert × Branchenfaktor",
}
KPI_SOURCE = {
    "current_ratio": ("bach", "Current Ratio (r17), Median"),
    "roa": ("bach", "(Jahresgewinn + Zinsen) / Bilanzsumme"),
    "equity_ratio": ("bach", "Eigenkapital / Bilanzsumme (1/r11), Median"),
    "debt_equity": ("bach", "Fremdkapital / Eigenkapital (r12), Median"),
    "adg2": ("bach", "(Bilanzsumme − kurzfristiges FK) / Anlagevermögen"),
    "tilgungsdauer": ("damodaran", "Debt to EBITDA"),
    "roe": ("damodaran", "ROE"),
    "ros": ("damodaran", "Net Margin"),
    "roic": ("damodaran", "ROIC"),
}


def nice(v: float, unit: str) -> float:
    if unit == "years":
        return round(v * 2) / 2
    step = 0.05 if v >= 0.2 else (0.01 if v >= 0.03 else 0.005)
    return round(round(v / step) * step, 4)


def label(rw: dict, unit: str) -> str:
    def num(v: float) -> str:
        return f"{v:g}" if unit == "years" else f"{v * 100:.1f}".rstrip("0").rstrip(".")
    suffix = " Jahre" if unit == "years" else " %"
    if "min" in rw and "max" in rw:
        return f"{num(rw['min'])}–{num(rw['max'])}{suffix}"
    return ("≥ " if "min" in rw else "≤ ") + num(rw.get("min", rw.get("max"))) + suffix


def compute(config: dict) -> dict[str, dict]:
    sources = {"bach": bach.sector_values(), "damodaran": damodaran.sector_values()}
    result = {}
    for kpi in config["kpis"]:
        if kpi["id"] not in KPI_SOURCE:
            continue
        src, metric = KPI_SOURCE[kpi["id"]]
        by_sector, overall = sources[src]
        base = {k: v for k, v in kpi["richtwert"].items() if k in ("min", "max")}
        werte = {}
        for sector, vals in by_sector.items():
            value, total = vals.get(kpi["id"]), overall[kpi["id"]]
            if value is None or not total or value <= 0:
                continue
            rw = {k: nice(v * value / total, kpi["unit"]) for k, v in base.items()}
            werte[sector] = {**rw, "label": label(rw, kpi["unit"])}
        result[kpi["id"]] = {"quelle": QUELLE[src].format(m=metric), "werte": werte}
    return result


def check(config: dict, result: dict) -> None:
    companies = json.loads(WEB_JSON.read_text(encoding="utf-8"))["companies"]
    tol = config["ampel"]["gelbToleranz"]
    for kpi in config["kpis"]:
        if kpi["id"] not in result:
            continue
        print(f"\n== {kpi['short']} (Buch {kpi['richtwert']['label']})")
        for sector, rw in result[kpi["id"]]["werte"].items():
            cs = [c["kpis"][kpi["id"]]["value"] for c in companies if c["sector"] == sector]
            cs = [v for v in cs if v is not None]
            book = sum(ampel(v, kpi, tol) == "green" for v in cs)
            new = sum(ampel(v, {**kpi, "richtwert": rw}, tol) == "green" for v in cs)
            print(f"  {sector:24} {rw['label']:>14}   n={len(cs):3}  grün {100 * book / max(len(cs), 1):3.0f}% -> {100 * new / max(len(cs), 1):3.0f}%")


def write(result: dict) -> None:
    path = CONFIG_DIR / "kpis.json"
    config = json.loads(path.read_text(encoding="utf-8"))
    for kpi in config["kpis"]:
        if kpi["id"] in result:
            kpi["richtwertBranche"] = result[kpi["id"]]
    path.write_text(json.dumps(config, ensure_ascii=False, indent=2).replace("\n", "\r\n"), encoding="utf-8", newline="")
    print(f"richtwertBranche für {len(result)} Kennzahlen nach {path}")


if __name__ == "__main__":
    cfg = load_kpi_config()
    res = compute(cfg)
    if "--check" in sys.argv:
        check(cfg, res)
    else:
        write(res)
