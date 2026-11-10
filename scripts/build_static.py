#!/usr/bin/env python3
"""Build public SLEPZOF HTML/CSS/JS for a GitHub Pages project-site subpath.

Set SITE_BASE_PATH=/slepzof-portfolio (default). The local server/admin stay private.
"""
from __future__ import annotations

import os
import re
from pathlib import Path
from shutil import copy2, copytree, rmtree

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"
BASE = "/" + os.environ.get("SITE_BASE_PATH", "/slepzof-portfolio").strip("/")
BASE = BASE.rstrip("/")
PUBLIC_DIRS = ("assets", "css", "js", "cases", "about", "projects", "work-with-me", "data")
PUBLIC_CMS = ("data.json", "pages.json", "chrome.json", "generated-pages.json")
ROOT_URL = re.compile(r"(?<![A-Za-z0-9._/\\-])/(?:assets|css|js|cases|about|projects|work-with-me|cms|data)(?=/|[\"'\x60?#])")
TEXT_SUFFIXES = {".html", ".css", ".js", ".json", ".svg"}


def main():
    required = ("index.html", "assets", "css", "js")
    missing = [part for part in required if not (ROOT / part).exists()]
    if missing:
        raise SystemExit("Missing SLEPZOF v35 files: " + ", ".join(missing))

    if OUT.exists():
        rmtree(OUT)
    OUT.mkdir()
    copy2(ROOT / "index.html", OUT / "index.html")

    for folder in PUBLIC_DIRS:
        source = ROOT / folder
        if source.is_dir():
            copytree(source, OUT / folder)

    for name in PUBLIC_CMS:
        source = ROOT / "cms" / name
        if source.is_file():
            target = OUT / "cms" / name
            target.parent.mkdir(parents=True, exist_ok=True)
            copy2(source, target)

    rewritten = 0
    for path in OUT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            raw = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        fixed = ROOT_URL.sub(lambda match: BASE + match.group(0), raw)
        if path.suffix.lower() == ".html":
            fixed = fixed.replace('href="/"', f'href="{BASE}/"')
            fixed = fixed.replace("href='/'", f"href='{BASE}/'")
        if path.as_posix().endswith("/cms/pages.json"):
            fixed = fixed.replace('"path": "/"', f'"path": "{BASE}/"')
        if fixed != raw:
            path.write_text(fixed, encoding="utf-8")
            rewritten += 1

    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    print(f"GitHub Pages build ready: {OUT}, base={BASE}/, modified_text_files={rewritten}")


if __name__ == "__main__":
    main()
