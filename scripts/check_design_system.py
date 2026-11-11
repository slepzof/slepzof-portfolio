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
expect("rail.append(wrapper)" in morph and "for(let i=0;i<7;i++)" in morph,
       "Seven portals must be fourth cards of their project stacks")
expect("content.append(head,stats,tools)" in morph and
       "portal.panel.insertBefore(el,before)" in morph,
       "The original title, description, metrics and tools must live in one chapter")
expect("focus=cardFor" not in morph, "Full radar must not turn into a detached tile")
expect("sx45OwnerSkill" in morph and "sx45OwnerSkill" in controller,
       "Moved skill metrics must retain the correct counter owner")
expect("previousLabelled" in morph and "panel.setAttribute('aria-labelledby',portal.previousLabelled)" in morph,
       "Mobile-only section labels must restore on desktop")
expect("--sx44-hero-height" in morph,
       "Next-skill portal hero must shrink to release its original content")
expect("function attachStack(panel)" in morph and "sx43-scroll-stack" in morph,
       "Mobile cards must form a vertical scroll-driven stack")
expect("touchstart" not in morph and "touchend" not in morph,
       "Mobile case cards must not intercept touch events")
morph_css = (ROOT / "css/sections/beyond-mobile-morph.css").read_text("utf-8")
expect("--sx43-radar-shift" in morph_css, "Safari-safe radar transform must remain explicit")
expect("gap:24px!important" in morph_css, "Mobile case cards need a 24px normal-flow gap")
expect("-webkit-mask-image:none!important" in morph_css,
       "Legacy horizontal slider gradient must be disabled in mobile deck")
expect("font-size:clamp(21px,5.65vw,24px)!important" in morph_css,
       "Mobile cases must use Featured Projects typographic scale")
expect("height:var(--sx44-hero-height,505px)" in morph_css,
       "Next-skill card hero height must animate, not leave a blank fixed area")
expect("position:sticky!important" in morph_css and "--sx43-stack-peek" in morph_css
       and "z-index:3!important" in morph_css, "Three cases must overlap in order")
expect(" * var(--sx43" not in morph_css,
       "Avoid unsupported CSS calc multiplication on older iOS Safari")
expect("window.scrollTo(" not in morph and "preventDefault()" not in morph.split("function draw(){")[1].split("const schedule=")[0],
       "Scroll-bound portal morph may not hijack native scrolling")
expect("sx44-portal-chart" in morph_css and "sx44-portal-content" in morph_css,
       "Portal card must contain both its rotating diagram and real copy")
expect("sx43-scroll-stack" in controller and "sx44-portal" in controller,
       "Shared carousel and radar taps must support the mobile portal")
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
