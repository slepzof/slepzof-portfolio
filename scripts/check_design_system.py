#!/usr/bin/env python3
"""Validate design-system integration and homepage media without third-party deps."""
from pathlib import Path
from html.parser import HTMLParser
import sys

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text("utf-8")
legacy_entry = (ROOT / "css/v10.css").read_text("utf-8")
tokens = (ROOT / "css/system/tokens.css").read_text("utf-8")
markets_css = (ROOT / "css/v41-markets.css").read_text("utf-8")
markets_js = (ROOT / "js/v41-markets.js").read_text("utf-8")
errors = []

def expect(ok, why):
    if not ok:
        errors.append(why)

for name in ("tokens", "typography", "layout", "components"):
    expect(f'@import url("system/{name}.css")' in legacy_entry,
           f"Global design-system import missing in v10.css: {name}")
expect('/css/v10.css' in html, "Homepage must load the shared CSS entrypoint")
for token in ("--ds-container-max: 1116px", "--ds-font-h1: 56px",
              "--ds-font-h2: 48px", "--ds-font-h3: 40px",
              "--ds-font-lead-xl: 24px", "--ds-line-lead-xl: 32px"):
    expect(token in tokens, f"Design token missing: {token}")
expect('<div class="sx41-stage"><div class="sx41-scene">' in html,
       "Markets requires viewport stage and Figma scene")
expect('scene.style.transform' in markets_js, "Markets scene animation missing")
expect('stage.style.transform="translate3d' not in markets_js,
       "Do not transform sticky stage itself")
expect('--sx41-panel-width:min(var(--ds-container-max' in markets_css,
       "Markets panel must be aligned to global layout")

class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = set()
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in ("src", "srcset", "data-sx41-src") or not value:
                continue
            for part in value.split(","):
                url = part.strip().split(" ")[0].split("?")[0]
                if url.startswith(("/assets/home/process/", "/assets/home/markets/")):
                    self.urls.add(url)

parser = AssetParser()
parser.feed(html)
for asset in sorted(parser.urls):
    expect((ROOT / asset.lstrip("/")).is_file(), f"Missing media file: {asset}")
expect(len(parser.urls) == 21, f"Unexpected asset references: {len(parser.urls)} (expected 21 = 9 + 12)")
expect("/assets/process-v38/" not in html, "Outdated process image URL")
expect("/assets/markets/" not in html, "Outdated market image URL")
expect("/css/sections/home-entrance.css" in html, "Missing desktop loader stylesheet")
expect("/js/sections/home-entrance.js" in html, "Missing desktop loader script")
expect("sx-home-loading" in html, "Missing desktop early loader state")
expect("slide=clamp((t-.16)/.56" in markets_js,
       "Desktop markets must scroll only after both rows enter the viewport")
expect("padding-left:var(--sx41-content-pad)" in markets_css,
       "Markets must clip on the left panel edge")
if errors:
    print("Design system check FAILED:")
    for error in errors:
        print(" -", error)
    sys.exit(1)
print(f"Design system check passed. {len(parser.urls)} media files, required tokens and scene verified.")
