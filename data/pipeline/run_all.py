"""Gesamter Lauf: Ticker -> Yahoo-Abruf (fortsetzbar) -> companies.json -> Bericht.

Supabase separat: python load_supabase.py
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent


def run(script: str, *args: str) -> None:
    subprocess.run([sys.executable, str(HERE / script), *args], check=True)


if __name__ == "__main__":
    run("build_tickers.py")
    run("fetch.py", "--resume", *sys.argv[1:])
    run("export_json.py")
    run("report.py")
