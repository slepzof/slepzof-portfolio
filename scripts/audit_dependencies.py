#!/usr/bin/env python3
"""SLEPZOF read-only dependency inventory.

Usage:
  python3 scripts/audit_dependencies.py
  python3 scripts/audit_dependencies.py --markdown docs/DEPENDENCY_REPORT.md

Lists CSS/JS references from public HTML, checks missing linked files,
and identifies UNREFERENCED CANDIDATES. Never deletes any file.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {"dist", ".git", "__pycache__", "docs/archive"}
ASSET_PATH = re.compile(r"""(?:(?:["']|url\(\s*["']?))((?:/)?(?:css|js)/[A-Za-z0-9_./-]+\.(?:css|js))(?:\?[^"'\)\s]*)?""")
IMPORT_RE = re.compile(r"""@import\s+(?:url\()?["']([^"']+\.css)["']""")

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in {"src", "href"} or not value:
                continue
            if value.startswith(("http:", "https:", "//", "data:", "#")):
                continue
            clean = urlsplit(value).path
            if clean.endswith((".js", ".css")):
                self.paths.add(clean)

def source_files(suffix):
    return sorted(
        p for p in ROOT.rglob("*" + suffix)
        if not any("/" + exclude + "/" in p.as_posix() for exclude in EXCLUDE_DIRS)
        and p.is_file()
    )

def page_files():
    return [p for p in source_files(".html")
            if not p.relative_to(ROOT).as_posix().startswith(("docs/archive/", "admin/"))]

def source_ref(page, value):
    if value.startswith("/"):
        return value.lstrip("/")
    return (page.parent / value).relative_to(ROOT).as_posix()

def inspect():
    refs = defaultdict(set)
    missing = defaultdict(set)
    pages = page_files()
    for page in pages:
        parser = Links()
        parser.feed(page.read_text(encoding="utf-8"))
        for value in parser.paths:
            path = source_ref(page, value)
            refs[path].add(page.relative_to(ROOT).as_posix())
            if not (ROOT / path).is_file():
                missing[path].add(page.relative_to(ROOT).as_posix())
    # Account for CSS @imports (e.g., shared design-system styles in css/v10.css).
    for css in source_files(".css"):
        try:
            contents = css.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for item in IMPORT_RE.findall(contents):
            if item.startswith(("http:", "https:")):
                continue
            dep = (item.lstrip("/") if item.startswith("/")
                   else (css.parent / item).relative_to(ROOT).as_posix())
            refs[dep].add(css.relative_to(ROOT).as_posix())
            if not (ROOT / dep).is_file():
                missing[dep].add(css.relative_to(ROOT).as_posix())
    code = [
        p.relative_to(ROOT).as_posix()
        for p in source_files(".css") + source_files(".js")
        if not p.relative_to(ROOT).as_posix().startswith("admin/")
    ]
    unreferenced = sorted(name for name in code if name not in refs)
    return pages, refs, missing, unreferenced

def build_report(pages, refs, missing, unreferenced):
    css_count = sum(1 for p in refs if p.endswith(".css"))
    js_count = sum(1 for p in refs if p.endswith(".js"))
    lines = [
        "# SLEPZOF dependency audit",
        "",
        "Generated from source files. This is an inventory, NOT approval to delete any file.",
        "",
        f"- HTML pages scanned: {len(pages)}",
        f"- Referenced CSS paths: {css_count}",
        f"- Referenced JavaScript paths: {js_count}",
        f"- Missing linked CSS/JS: {len(missing)}",
        f"- Unreferenced CSS/JS candidates: {len(unreferenced)}",
        "",
        "## Missing local links", "",
    ]
    if missing:
        for filename, consumers in sorted(missing.items()):
            lines.append(f"- \`{filename}\` (from {', '.join(sorted(consumers)[:3])})")
    else:
        lines.append("No missing CSS or JavaScript paths found.")
    lines += ["", "## Unreferenced candidates", ""]
    if unreferenced:
        lines += [f"- \`{filename}\`" for filename in unreferenced]
    else:
        lines.append("No obvious unreferenced CSS/JS files.")
    lines += ["", "## Most widely used styles/scripts", "",
              "| File | Referenced from |", "| --- | ---: |"]
    for filename, consumers in sorted(refs.items(), key=lambda x: (-len(x[1]), x[0]))[:35]:
        lines.append(f"| \`{filename}\` | {len(consumers)} |")
    lines += ["", "## Before deleting any candidate", "",
              "Check CSS @imports, inline JS strings, dynamic scripts, CMS dependencies and non-HTML consumers. Then remove only in a dedicated test commit and visually compare the published pages."]
    return "\n".join(lines) + "\n"

def main():
    argp = argparse.ArgumentParser()
    argp.add_argument("--markdown", help="Write audit report to path relative to repo root")
    args = argp.parse_args()
    pages, refs, missing, unreferenced = inspect()
    report = build_report(pages, refs, missing, unreferenced)
    print(report)
    if args.markdown:
        destination = ROOT / args.markdown
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(report, encoding="utf-8")
    # Read-only report: do not fail CI due to historical file references.
    return 0

if __name__ == "__main__":
    sys.exit(main())
