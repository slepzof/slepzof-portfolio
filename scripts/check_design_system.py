#!/usr/bin/env python3
"""Validate design-system integration and homepage media without third-party deps."""
from pathlib import Path
from html.parser import HTMLParser
import json
import re
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
expect("rail.append(wrapper)" in morph and "for(let i=0;i<7;i++)" in morph and
       "rail.insertBefore(marker,wrapper)" in morph and "rail.append(runway)" in morph,
       "Seven fourth-card portals must have stable scroll anchors and runway")
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
expect("const measurements=portals.map" in morph and
       "y:portal.marker.getBoundingClientRect().top" in morph and
       "for(const {portal,y,railWidth} of measurements)" in morph,
       "Read stable marker geometry before changing card width to avoid Safari feedback loops")
expect("originalRailAttrs" in morph and
       "rail.removeAttribute('tabindex')" in morph and
       "if(c.classList.contains('sx43-scroll-stack'))return;" in controller,
       "Vertical stack must not keep horizontal keyboard navigation")
morph_css = (ROOT / "css/sections/beyond-mobile-morph.css").read_text("utf-8")
expect("--sx43-radar-shift" in morph_css, "Safari-safe radar transform must remain explicit")
expect("gap:24px!important" in morph_css, "Mobile case cards need a 24px normal-flow gap")
expect("-webkit-mask-image:none!important" in morph_css,
       "Legacy horizontal slider gradient must be disabled in mobile deck")
expect("font-size:clamp(21px,6.2vw,24px)!important" in morph_css,
       "Mobile cases must use Featured Projects typographic scale")
expect("const heroHeight=270;" in morph and
       "const stickyTop=stackedTop+(nav+10-stackedTop)*expand;" in morph,
       "Approved card keeps headline at 270px and expands vertically toward header")
expect("(.84-.06*ease((expand-.32)/.54))" in morph,
       "Expanded chapter must retain a low-opacity connected radar behind the title")
expect("rotate('+(45*(portal.i+turn))" in morph and
       "ease((distance-45)/210)" in morph and "ease((distance-300)/255)" in morph,
       "Fourth-card radar must rotate CLOCKWISE BEFORE centered expansion")
expect("details.append(stats,tools)" in morph and "content.append(head,stats,tools)" in morph and
       "portal.marker.remove()" in morph and "portal.runway.remove()" in morph,
       "Approved content must remain intact and temporary mobile nodes restore on desktop")
expect("font-size:clamp(11px,3.35vw,13px)!important" in morph_css and
       "font-size:clamp(13px,3.6vw,14px)!important" in morph_css,
       "Case metadata and description must reach the approved desktop type scale")
expect("height:var(--sx44-hero-height,505px)" in morph_css,
       "Next-skill card hero height must animate, not leave a blank fixed area")
expect("position:sticky!important" in morph_css and "--sx43-stack-peek" in morph_css
       and "z-index:3!important" in morph_css, "Three cases must overlap in order")
expect("border:4px solid var(--sx44-border" in morph_css,
       "Fourth skill card must have the approved 4px outline")
expect("transform:none!important" in morph_css and
       "top:var(--sx44-sticky-top" in morph_css,
       "Fourth card must stay centered and animate by native sticky positioning")
expect("sx44-portal-counter" not in morph and
       "counter.textContent" not in morph,
       "Unapproved 01 → 02 / 08 indicator must not be rendered")
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
expect("MIN_DWELL=1200,MAX_WAIT=2800" in loader_js and
       "fallback.decode()" in loader_js and
       "sx:hero-revealed" in loader_js,
       "Loader must wait for decoded hero poster, then release with a hard timeout")
hero_lottie = (ROOT / "js/v20.js").read_text("utf-8")
expect("requestIdleCallback" in hero_lottie and
       "sx:hero-revealed" in hero_lottie and
       "goToAndStop(0,true)" in hero_lottie,
       "Heavy Lottie must load after first paint and fade in only after first SVG frame")
expect("background-color:#141414!important" in loader_css,
       "Project cover text must be legible while images are loading")
expect('fetchpriority="high" loading="eager"' in html and
       'rel="preload" as="image" href="/assets/animations/hero-fallback.webp"' in html,
       "Hero fallback must be high priority instead of blocking on 9MB Lottie")
expect("optimize_media(OUT, BASE)" in (ROOT / "scripts/build_static.py").read_text("utf-8"),
       "GitHub Pages build must create responsive media without altering originals")
expect("slide=clamp((t-.16)/.56" in markets_js,
       "Desktop markets must scroll only after both rows enter the viewport")
expect("padding-left:var(--sx41-content-pad)" in markets_css,
       "Markets must clip on the left panel edge")
# Work Experience v42: keep approved 1116px grid and case navigation, including
# achievement cards. No rewrite of desktop card images is allowed.
experience_js = (ROOT / "js/sections/experience-v42.js").read_text("utf-8")
experience_css = (ROOT / "css/sections/experience-v42.css").read_text("utf-8")
expect('/css/sections/experience-v42.css' in html and
       '/js/sections/experience-v42.js' in html,
       "New work-experience section must load only after existing project content")
expect('const periods=[' in experience_js and
       'name:"BONAPE · SALUTE · ARTSAVUR"' in experience_js and
       'name:"Nutaku Projects · Аутсорс-дизайн"' in experience_js,
       "Work history must include consolidated employers and Nutaku")
expect('const arrow=el("span","sx42-card-arrow","↗")' in experience_js and
       'foot.append(arrow);card.append(foot)' in experience_js,
       "Every featured work case must keep its round arrow")
expect('const coverMetrics=' in experience_js and
       'const customMetric=coverMetrics[slug]' in experience_js and
       'card.href=review.href||"/projects/"' in experience_js,
       "Achievements must live inside their matching project covers and reviews must link")
expect('width:min(1116px' in experience_css and
       'aspect-ratio:1424/2048!important' in experience_css,
       "Experience carousel cards must follow the approved Featured sizing")
expect('IntersectionObserver' in experience_js and
       'prefers-reduced-motion:reduce' in experience_css,
       "Work experience scroll reveal must honor reduced motion")

# Work Experience v43 source-integrity and responsive design checks.
expect(experience_js.count('{id:"') == 12,
       "All twelve approved work history periods must exist in one timeline")
expect("uploadedCovers=new Set(" in experience_js and
       'img.src=workSrc;' in experience_js and
       "extraProjects" in experience_js,
       "New original project covers must replace old artwork in work history")
expect("sx42-review-portrait" in experience_css and
       "portrait.src=" in experience_js,
       "Confirmed uploaded testimonial portraits must render in source cards")
expect("sx42-period.sx42-visible .sx42-carousel" in experience_css and
       "sx42-card:nth-child(-n+3)" in experience_css,
       "Work experience sections and first three covers must reveal on scroll")
expect('width:calc(100% - 32px)' in experience_css and
       'flex-basis:clamp(244px,65vw,310px)' in experience_css,
       "Mobile work experience needs native 1.45-card swipe layout")
match = re.search(r"uploadedCovers=new Set\((\[[^\n]*\])\)", experience_js)
if match:
    covers = json.loads(match.group(1))
    for slug in covers:
        expect((ROOT / "assets" / "cases" / slug / "cover-work.png").is_file(),
               f"Missing source cover for work experience: {slug}")
else:
    expect(False, "Cannot read work-experience source image manifest")
review_data = re.search(r' const reviews=(\{[^\n]+\});\n for\(let pi=', experience_js)
expect(review_data is not None, "Missing source-matched testimonials")
if review_data:
    parsed_reviews = json.loads(review_data.group(1))
    used_portraits = []
    for period, entries in parsed_reviews.items():
        for review in entries:
            used_portraits.append(review["id"])
            expect((ROOT / "assets" / "reviews" / (review["id"] + ".png")).is_file(),
                   f"Missing testimonial portrait: {review['id']}")
            expect(review.get("href", "").startswith("/"),
                   f"Missing destination for testimonial: {review['id']}")
    expect(len(used_portraits) >= 11,
           "Figma reference requires source portrait cards across work history")
    expect("felix-g" in used_portraits and "alexey-rsk" in used_portraits
           and "david-t-hash-hedge" in used_portraits,
           "First periods must include real client reviews rather than text placeholders")
expect('sx42-fact' not in experience_js,
       "Achievement-only black slides must not be rendered; metrics belong on covers")

if errors:
    print("Design system check FAILED:")
    for error in errors:
        print(" -", error)
    sys.exit(1)
print(f"Design system check passed. {len(parser.urls)} core media checks, work-history sources and design tokens verified.")
