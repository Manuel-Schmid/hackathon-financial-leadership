"""BACH (ECCBSO, Bilanzdatenbank der europäischen Zentralbanken) -> Kennzahlen pro GICS-Branche.

Grosse Unternehmen (Umsatz >= 50 Mio. EUR, size "2"), variable Stichprobe ("0"), letztes Jahr <= 2024 pro Land.
- Quartil-Kennzahlen (Firmenebene): r17 Current Ratio, r12 Verschuldungsgrad, r11 (EK-Quote = 1/r11).
  Über Länder x NACE-Zellen: nach Firmenzahl gewichteter Median der Zell-Mediane.
- Aggregat-Kennzahlen (Summe der Beträge): ROA, Anlagedeckung II.
"""
from __future__ import annotations

import csv
import io
import urllib.request
import zipfile
from pathlib import Path

CACHE = Path(__file__).parent / "cache"
URL = "https://www.bach.banque-france.fr/bach-ws-fo/ws/log-documentation/downloadocs?file_name=bach.zip"
MAX_YEAR = 2024

GICS_NACE = {
    "Information Technology": ["C26", "J62", "J63"],
    "Health Care": ["C21", "Q86"],
    "Industrials": ["C27", "C28", "C30", "H49", "H50", "H51", "H52", "N"],
    "Consumer Discretionary": ["C29", "C13", "C14", "C15", "G45", "G47", "I55", "I56"],
    "Consumer Staples": ["C10", "C11", "C12"],
    "Energy": ["B06", "B09", "C19"],
    "Utilities": ["D35", "E36"],
    "Materials": ["C20", "C17", "C23", "C24", "B07", "B08"],
    "Communication Services": ["J58", "J59", "J60", "J61"],
    "Real Estate": ["L68"],
}
ALL = "Zc"  # Total NACE ohne Holdings und Head Offices


def _rows() -> dict[tuple[str, int, str], dict]:
    CACHE.mkdir(exist_ok=True)
    path = CACHE / "bach.zip"
    if not path.exists():
        print("Lade BACH (~195 MB) ...")
        urllib.request.urlretrieve(URL, path)
    z = zipfile.ZipFile(path)
    f = io.TextIOWrapper(z.open(z.namelist()[0]), encoding="utf-8")
    f.readline()  # "nb_lignes=..."
    rows = {}
    for r in csv.DictReader(f, delimiter=";"):
        if r["size"] == "2" and r["sample"] == "0" and 2021 <= int(r["year"]) <= MAX_YEAR:
            rows[(r["country"], int(r["year"]), r["sector"])] = r
    return rows


def _num(row: dict, key: str) -> float | None:
    v = row.get(key)
    return float(v) if v not in (None, "") else None


def _wmedian(pairs: list[tuple[float | None, float | None]]) -> float | None:
    pairs = sorted((v, w) for v, w in pairs if v is not None and w)
    total, acc = sum(w for _, w in pairs), 0.0
    for v, w in pairs:
        acc += w
        if acc >= total / 2:
            return v
    return None


def _values(cells: list[dict]) -> dict[str, float | None]:
    out: dict[str, float | None] = {}
    for kpi, code, invert in (("current_ratio", "r17", False), ("debt_equity", "r12", False), ("equity_ratio", "r11", True)):
        v = _wmedian([(_num(r, f"{code}_q2"), _num(r, f"{code}_nbq")) for r in cells])
        out[kpi] = None if v is None else (100 / v if invert else v / 100)
    a = cl = a1 = gain = 0.0
    for r in cells:
        ta, to = _num(r, "total_assets"), _num(r, "turnover")
        need = [_num(r, k) for k in ("r16_wm", "A1_wm", "It3_wm", "I10_wm")]
        if ta is None or to is None or None in need:
            continue
        r16, a1_wm, it3, i10 = need
        a += ta
        cl += r16 * ta / 100
        a1 += a1_wm * ta / 100
        gain += (it3 + i10) * to / 100
    out["roa"] = gain / a if a else None
    out["adg2"] = (a - cl) / a1 if a1 else None
    return out


def sector_values() -> tuple[dict[str, dict], dict]:
    """({GICS-Sektor: {kpi: wert}}, {kpi: wert über alle Branchen})."""
    rows = _rows()
    latest: dict[str, int] = {}
    for c, y, _ in rows:
        latest[c] = max(latest.get(c, 0), y)

    def cells(codes: list[str]) -> list[dict]:
        return [r for (c, y, s), r in rows.items() if s in codes and y == latest[c] and (_num(r, "nb_firms") or 0) >= 3]

    return {s: _values(cells(codes)) for s, codes in GICS_NACE.items()}, _values(cells([ALL]))
