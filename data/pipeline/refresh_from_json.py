"""Ampeln und Scores in companies.json neu berechnen, ohne Yahoo-Cache.

Für Änderungen an Richtwerten oder Scoring, wenn data/cache/ fehlt. Die Kennzahl-Werte bleiben unverändert.
"""
from __future__ import annotations

import json

from build_dataset import add_scores
from common import WEB_JSON, load_kpi_config
from scoring import ampel, ampel_branche


def refresh(data: dict, config: dict) -> dict:
    tolerance = config["ampel"]["gelbToleranz"]
    kpi_defs = {k["id"]: k for k in config["kpis"]}
    for c in data["companies"]:
        for kpi_id, kpi in c["kpis"].items():
            definition = kpi_defs[kpi_id]
            kpi["ampel"] = ampel(kpi["value"], definition, tolerance)
            kpi["ampelBranche"] = ampel_branche(kpi["value"], definition, c["sector"], tolerance)
    add_scores(data["companies"], config)
    return data


def main() -> None:
    data = refresh(json.loads(WEB_JSON.read_text(encoding="utf-8")), load_kpi_config())
    WEB_JSON.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{data['meta']['count']} Firmen neu bewertet: {WEB_JSON}")


if __name__ == "__main__":
    main()
