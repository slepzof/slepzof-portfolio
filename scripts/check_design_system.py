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
expect("/css/sections/mobile-layout.css" in html, "Missing mobile layout stylesheet")
expect("/css/sections/beyond-mobile-morph.css" in html, "Missing mobile morph CSS")
expect("/js/sections/beyond-mobile-morph.js" in html, "Missing mobile morph JS")
morph = (ROOT / "js/sections/beyond-mobile-morph.js").read_text("utf-8")
controller = (ROOT / "js/v34-beyond-ui-story.js").read_text("utf-8")
expect("story.insertBefore(morph,column)" in morph, "Single original radar must enter morph stage")
expect("column.insertBefore(ch.wrap,panels[i+1])" in morph, "Seven small turns must be in natural flow")
expect("const step=d=>" in morph and "touchend" in morph, "Mobile project decks need swipe controls")
morph_css = (ROOT / "css/sections/beyond-mobile-morph.css").read_text("utf-8")
expect("--sx43-radar-shift" in morph_css and "--sx43-card-offset" in morph_css,
       "Safari-safe animation values must be explicit CSS properties")
expect(" * var(--sx43" not in morph_css,
       "Avoid unsupported CSS calc multiplication on older iOS Safari")
expect("window.scrollTo(" not in morph and "preventDefault()" not in morph.split("function draw(){")[1].split("function enable(){")[0], "Scroll-bound animations may not hijack scrolling")
expect("sx43-mobile-deck" in controller, "Desktop rail must skip mobile deck navigation")
expect("position:sticky;top:calc(var(--sx28-nav" in (ROOT / "css/sections/beyond-mobile-morph.css").read_text("utf-8"), "Morph sticky must be limited to the short runway")
expect("sx41-mobile-scroll" in html and "sx41-mobile-viewport" in html,
       "Missing mobile markets scroll shell")
expect("const mobileConsumed=" in markets_js,
       "Mobile markets must track scroll against the dedicated sticky shell")
mobile_layout = (ROOT / "css/sections/mobile-layout.css").read_text("utf-8")
expect("height:calc(var(--sx41-mobile-card-size) + 44px)" in mobile_layout,
       "Deck viewport must match its contents without blank vertical centering")
expect("runway=deckStep*(deck.length-1)+32" in markets_js,
       "Final card must release without the previous 200px blank hold")
expect("font-size:var(--ds-font-card,14px)" in mobile_layout,
       "Both metric and image descriptions must share the card typography token")
expect("padding:48px var(--ds-gutter) 96px" in mobile_layout,
       "Markets footer needs balanced entrance and a full exit spacing")
expect("/css/sections/home-entrance.css" in html, "Missing desktop loader stylesheet")
expect("/js/sections/home-entrance.js" in html, "Missing desktop loader script")
expect("sx-home-loading" in html, "Missing universal early loader state")
loader_css = (ROOT / "css/sections/home-entrance.css").read_text("utf-8")
loader_js = (ROOT / "js/sections/home-entrance.js").read_text("utf-8")
expect("animation:sx-home-fill 1.05s" in loader_css,
       "Universal S fill should remain clearly visible on mobile and desktop")
expect("1400-(performance.now()-started)" in loader_js,
       "Loader must have an intentional, bounded display time")
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
