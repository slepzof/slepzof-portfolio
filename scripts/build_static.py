#!/usr/bin/env python3
"""Create a static-only preview of SLEPZOF for Cloudflare Pages.

The Python CMS server and local editor are intentionally not published.
Run from any directory: python3 scripts/build_static.py
"""
from __future__ import annotations
from pathlib import Path
from shutil import copytree, copy2, rmtree

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"

REQUIRED = ["index.html", "css", "js", "assets"]
PUBLIC_DIRS = ["assets", "css", "js", "about", "cases", "projects", "work-with-me", "data"]
PUBLIC_CMS_FILES = ["data.json", "pages.json", "chrome.json", "generated-pages.json"]


def main() -> None:
    missing = [name for name in REQUIRED if not (ROOT / name).exists()]
    if missing:
        raise SystemExit(
            "Missing site files: " + ", ".join(missing)
            + ". Extract v35 into the repository root before deploying."
        )

    if OUT.exists():
        rmtree(OUT)
    OUT.mkdir(parents=True)

    copy2(ROOT / "index.html", OUT / "index.html")
    for name in PUBLIC_DIRS:
        src = ROOT / name
        if src.is_dir():
            copytree(src, OUT / name)

    cms_dir = ROOT / "cms"
    if cms_dir.is_dir():
        target = OUT / "cms"
        for name in PUBLIC_CMS_FILES:
            source = cms_dir / name
            if source.is_file():
                target.mkdir(parents=True, exist_ok=True)
                copy2(source, target / name)

    print("SLEPZOF static preview ready:", OUT)
    print("Local server.py, admin/, draft QA pages and project documentation are not published.")


if __name__ == "__main__":
    main()
