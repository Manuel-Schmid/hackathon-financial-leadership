"""Damodaran (NYU Stern), US-Branchendaten Stand 09.01.2026 -> Kennzahlen pro GICS-Branche.

Branchenwert und Gesamtwert = ungewichteter Median über die Industrien (sonst dominieren z. B. ~500 Biotechs).
"""
from __future__ import annotations

import html
import re
import statistics
import urllib.request
from pathlib import Path

CACHE = Path(__file__).parent / "cache"
BASE = "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/"

GICS = {
    "Information Technology": ["Computer Services", "Computers/Peripherals", "Electronics (General)", "Information Services",
                               "Semiconductor", "Semiconductor Equip", "Software (Internet)", "Software (System & Application)",
                               "Telecom. Equipment", "Office Equipment & Services"],
    "Health Care": ["Drugs (Biotechnology)", "Drugs (Pharmaceutical)", "Healthcare Products", "Healthcare Support Services",
                    "Heathcare Information and Technology", "Hospitals/Healthcare Facilities"],
    "Industrials": ["Aerospace/Defense", "Air Transport", "Business & Consumer Services", "Electrical Equipment",
                    "Engineering/Construction", "Environmental & Waste Services", "Machinery", "Transportation",
                    "Transportation (Railroads)", "Trucking", "Shipbuilding & Marine", "Building Materials", "Diversified"],
    "Consumer Discretionary": ["Apparel", "Auto & Truck", "Auto Parts", "Electronics (Consumer & Office)", "Furn/Home Furnishings",
                               "Homebuilding", "Hotel/Gaming", "Recreation", "Restaurant/Dining", "Retail (Automotive)",
                               "Retail (Building Supply)", "Retail (Distributors)", "Retail (General)", "Retail (Special Lines)",
                               "Rubber& Tires", "Shoe", "Education"],
    "Consumer Staples": ["Beverage (Alcoholic)", "Beverage (Soft)", "Food Processing", "Food Wholesalers", "Household Products",
                         "Retail (Grocery and Food)", "Tobacco", "Farming/Agriculture"],
    "Energy": ["Coal & Related Energy", "Oil/Gas (Integrated)", "Oil/Gas (Production and Exploration)", "Oil/Gas Distribution",
               "Oilfield Svcs/Equip."],
    "Utilities": ["Power", "Utility (General)", "Utility (Water)", "Green & Renewable Energy"],
    "Materials": ["Chemical (Basic)", "Chemical (Diversified)", "Chemical (Specialty)", "Metals & Mining", "Packaging & Container",
                  "Paper/Forest Products", "Precious Metals", "Steel", "Construction Supplies"],
    "Communication Services": ["Advertising", "Broadcasting", "Cable TV", "Entertainment", "Publishing & Newspapers",
                               "Software (Entertainment)", "Telecom (Wireless)", "Telecom. Services"],
    "Real Estate": ["R.E.I.T.", "Real Estate (Development)", "Real Estate (General/Diversified)",
                    "Real Estate (Operations & Services)", "Retail (REITs)"],
    "Financials": ["Bank (Money Center)", "Banks (Regional)", "Brokerage & Investment Banking", "Financial Svcs. (Non-bank & Insurance)",
                   "Insurance (General)", "Insurance (Life)", "Insurance (Prop/Cas.)", "Investments & Asset Management", "Reinsurance"],
}

# Kennzahl -> (Datei, Spalte)
SOURCES = {
    "ros": ("margin", "Net Margin"),
    "roe": ("roe", "ROE (unadjusted)"),
    "roic": ("pbvdata", "ROIC"),
    "tilgungsdauer": ("dbtfund", "Debt to EBITDA"),
}


def _table(name: str) -> dict[str, dict[str, str]]:
    CACHE.mkdir(exist_ok=True)
    path = CACHE / f"damodaran_{name}.html"
    if not path.exists():
        urllib.request.urlretrieve(BASE + f"{name}.html", path)
    rows = []
    for r in re.findall(r"<tr.*?</tr>", path.read_text(encoding="latin-1"), re.S | re.I):
        rows.append([re.sub(r"\s+", " ", html.unescape(re.sub(r"<.*?>", "", c))).strip()
                     for c in re.findall(r"<t[dh].*?>(.*?)</t[dh]>", r, re.S | re.I)])
    hdr = next(r for r in rows if r and r[0].startswith("Industry"))
    return {r[0]: dict(zip(hdr, r)) for r in rows if r and r[0] and not r[0].startswith("Industry") and len(r) == len(hdr)}


def _num(s: str) -> float | None:
    s = s.replace(",", "").strip()
    if not s or s in ("NA", "#DIV/0!"):
        return None
    return float(s[:-1]) / 100 if s.endswith("%") else float(s)


def sector_values() -> tuple[dict[str, dict], dict]:
    """({GICS-Sektor: {kpi: wert}}, {kpi: wert über alle Industrien})."""
    tables = {t: _table(t) for t, _ in SOURCES.values()}
    mapped = {i for inds in GICS.values() for i in inds}
    unmapped = [i for i in tables["margin"] if i not in mapped and not i.startswith("Total")]
    if unmapped:
        raise ValueError(f"Damodaran-Industrien ohne Branche: {unmapped}")

    def med(kpi: str, inds) -> float:
        t, col = SOURCES[kpi]
        return statistics.median(v for i in inds if (v := _num(tables[t][i][col])) is not None)

    every = [i for i in tables["margin"] if not i.startswith("Total")]
    return ({s: {k: med(k, inds) for k in SOURCES} for s, inds in GICS.items()},
            {k: med(k, every) for k in SOURCES})
