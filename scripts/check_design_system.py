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
    expect(re.search(r'@import url\("system/'+name+r'\.css(?:\?v=\d+)?"\)', legacy_entry) is not None,
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
expect("--ds-project-title-size: clamp(19px,5vw,24px)" in tokens and
       ":is(#selected,#beyond-ui,#experience) .ds-project-card" in
       (ROOT / "css/system/portfolio-projects.css").read_text("utf-8"),
       "Mobile cases must use the same Figma ProjectCard typography")
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
expect("--ds-project-metadata-size: 16px" in tokens and
       "--ds-project-description-size: 16px" in tokens and
       "--ds-project-description-line: 20px" in tokens,
       "Shared Figma card metadata and description scale must be defined once")
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
# One Figma project-card system: 3 sections, 2 component types, 1 slider engine.
work_data = (ROOT / "js/data/work-experience.js").read_text("utf-8")
work_render = (ROOT / "js/sections/experience-v42.js").read_text("utf-8")
cards_js = (ROOT / "js/system/portfolio-cards.js").read_text("utf-8")
cards_css = (ROOT / "css/system/portfolio-projects.css").read_text("utf-8")
work_css = (ROOT / "css/sections/experience-v42.css").read_text("utf-8")
featured_css = (ROOT / "css/v25-block3-slider-v5.css").read_text("utf-8")
beyond_css = (ROOT / "css/sections/beyond-mobile-morph.css").read_text("utf-8")
featured_engine = (ROOT / "js/v25-block3-slider-v3.js").read_text("utf-8")
expect("css/system/portfolio-projects.css?v=" in html and
       "js/system/portfolio-cards.js?v=" in html and
       "js/data/work-experience.js?v=" in html,
       "Portfolio components and single work data source must load on homepage")
expect(html.index("js/system/portfolio-cards.js?v=") <
       html.index("js/data/work-experience.js?v=") <
       html.index("js/sections/experience-v42.js?v="),
       "Shared components and data must be initialized before work rendering")
for name, value in {
    "--ds-project-width: 356px": "card width",
    "--ds-project-height: 512px": "card height",
    "--ds-project-radius: 32px": "radius",
    "--ds-project-title-size: 24px": "title",
    "--ds-project-title-line: 28px": "title leading",
    "--ds-project-description-size: 16px": "description",
    "--ds-project-description-line: 20px": "description leading",
}.items():
    expect(name in tokens, "Figma card token missing: " + value)
expect("SF Pro" in tokens, "Figma SF Pro family must be first in typography tokens")
expect(':is(#selected,#beyond-ui,#experience) .ds-project-card' in cards_css,
       "Every section must consume the same ProjectCard styles")
expect("function createProject(" in cards_js and "function createReview(" in cards_js
       and "function hydrate(" in cards_js,
       "Shared project and testimonial component factories must exist")
expect("components.createProject(project)" in work_render and
       "components.createReview(review)" in work_render and
       "data.periods" in work_render,
       "Work history must render from data using shared components")
expect("function bindRail(" in featured_engine and
       'document.querySelectorAll("#experience.sx42-ready .sx42-period")' in featured_engine and
       "controls.hidden=max<=2" in featured_engine,
       "Featured and Experience must use one overflow-aware carousel engine")
expect("sx42-fact" not in work_render and
       "sx42-progress" not in work_render,
       "Separate achievement slides and custom pagination must not return")
expect("ds-review-card" in cards_js and
       'createElement("a","sx42-card sx42-review")' not in cards_js and
       "sx25b3-arrow" not in cards_js.split("function createReview(")[1].split("function hydrate(")[0],
       "Testimonials have no destination arrow and are not links")
expect((ROOT / "assets/icons/experience/quote.svg").is_file(),
       "Original quote SVG must exist for testimonials")
site_contract = (ROOT / "css/system/site-contract.css").read_text("utf-8")
expect("font:500 var(--ds-font-h6)/var(--ds-line-h6)" in work_css and
       "font:600 var(--ds-font-h3)/var(--ds-line-h3)" in work_css and
       "--ds-font-h2" in site_contract and "--ds-line-h2" in site_contract,
       "Work dates, headings and section titles must use design-system tokens")
expect('/css/system/site-contract.css?v=' in html and
       (ROOT / "docs/DESIGN_SYSTEM_CONTRACT.md").is_file(),
       "Global design contract must load and be documented")
expect('sx25b3-inner sx25b3-inner--gallery' in html and
       '#selected .sx25b3-inner--gallery' in featured_css,
       "Featured gallery must start at the approved container grid")
expect('перед&nbsp;компанией.' in html,
       "Featured introduction must not orphan its final word")
expect("periodCardOverrides" in work_data and
       'approved2020?.title' in work_render,
       "All 2020 card titles must be sourced from approved PDF overrides")
expect("!important" not in work_css and
       "sx42-card-metric" not in work_css and
       "sx42-fact" not in work_css,
       "Work layout stylesheet must not duplicate ProjectCard styling")
expect('sx44-portal' in beyond_css and
       "sx43-scroll-stack" in beyond_css,
       "Beyond UI scroll morph must remain intact")
expect("sx25b3-card-foot" in cards_css and
       "sx25b3-laurel" in cards_css and
       "sx25b3-arrow" in cards_css,
       "Metric and SVG arrow primitives must be shared")
# Figma source metrics: no missing laurels on the four reported light cards.
metrics_match = re.search(r' const coverMetrics=(\{[^\n]+\});', work_data)
if metrics_match:
    metrics_map = json.loads(metrics_match.group(1))
    for slug, expected in {
        "echo-app": "9", "vita-ai": "4,4",
        "luch": "4,9", "city-exchange": "4,2k",
        "chatus": "841k", "starhash-benchmark": "34,2k",
        "2space": "182", "digital-lawyer": "#1",
    }.items():
        expect(slug in metrics_map and metrics_map[slug][0] == expected,
               f"Figma project achievement missing or changed: {slug}")
    expect(len(metrics_map) >= 49,
           "Restored source PDF achievements must not disappear")
else:
    expect(False, "Source PDF achievement map not found")
expect("white-space:pre-line" in cards_css and
       '"parking":["4,9","оценка приложения\\nв App Store & Google Play"]' in work_data and
       '"digital-lawyer":["#1","продукт недели\\nна Product Radar"]' in work_data,
       "Approved PDF achievement breaks must be retained by shared cards")
expect('"parking":"light"' not in cards_js and
       '"digital-lawyer":"light"' not in cards_js and
       '"forfis-new-site":"light"' in cards_js and
       '"bill-split":"light"' in cards_js,
       "Source PDF card contrast must not regress")
expect('periodDefaultYear' in work_render and
       '"greenbox":"2025"' in work_render,
       "2025 project years must not derive from 2024 period start")
expect("--ds-project-title-weight:" in tokens and
       "var(--ds-project-title-weight)" in cards_css and
       "font-size:var(--ds-project-title-size)" in cards_css and
       "line-height:var(--ds-project-title-line)" in cards_css,
       "Project typography must use only approved design tokens")
# Parse the actual period-specific source registry: merely finding a string
# is not enough to prove the full Figma card list survived the next revision.
period_source_match = re.search(
    r' const pdfPeriodCards=(\{[\s\S]*?\});\s*const periodCardOverrides=', work_data)
if period_source_match:
    source_cards = json.loads(period_source_match.group(1))
    for period_id, expected_count in (("forfis", 15), ("bonape", 27), ("summer-2026", 7), ("auto-2026", 4)):
        records = source_cards.get(period_id, {})
        expect(len(records) == expected_count,
               f"Source PDF period {period_id} must contain {expected_count} projects")
        missing = [slug for slug, card in records.items()
                   if not all(card.get(k) for k in
                              ("name", "title", "description", "category", "year", "tone"))
                   or not isinstance(card.get("metric"), list)
                   or len(card.get("metric", [])) != 2
                   or not all(card.get("metric", []))]
        expect(not missing,
               f"Missing PDF content, contrast or achievement in {period_id}: {missing}")
        period_slugs_match = re.search(
            rf'\{{id:"{period_id}",[\s\S]*?slugs:(\[[^\]]+\])',
            work_data)
        if period_slugs_match:
            rendered_slugs = json.loads(period_slugs_match.group(1))
            expect(rendered_slugs == list(records),
                   f"Project order differs from PDF registry in {period_id}")
        else:
            expect(False, f"Missing project list for {period_id}")
    expect("poizon-shop" not in source_cards.get("bonape", {}),
           "POIZON SHOP must remain excluded from the portfolio")
    expect((ROOT / "assets/cases/rdmart/cover-work.svg").is_file(),
           "RDMART project cover must exist")
else:
    expect(False, "PDF period cards registry missing or not valid JSON")
expect('"bonape": {' in work_data and
       '"forfis": {' in work_data and
       '"rdmart": {' in work_data and
       "fromPdf?.tone" in work_render and
       "fromPdf?.year" in work_render,
       "PDF-specific card content, contrast and year must be source-driven")
expect("css/system/portfolio-projects.css" in html,
       "Every project section must load canonical Figma card CSS")
legacy_mobile = (ROOT / "css/v39-beyond-mobile-space.css").read_text("utf-8")
expect("#selected .sx25b3-card p," not in legacy_mobile,
       "Do not accidentally apply 800px Beyond runway to Featured descriptions")
legacy_beyond = (ROOT / "css/v33-beyond-ui-story.css").read_text("utf-8")
expect("#selected .sx25b3-metric {padding-right:24px!important;}" not in legacy_beyond,
       "Remove outdated duplicated metric overrides")
expect((ROOT / "scripts/check_portfolio_browser.py").is_file(),
       "Actual desktop/mobile Chrome regression test must be committed")
work_periods = re.findall(r'\{id:"([^"]+)",date:"', work_data)
expect(len(work_periods) == 12 and len(set(work_periods)) == 12,
       "All twelve distinct approved employment periods must be retained")
match = re.search(r"uploadedCovers=new Set\((\[[^\n]*\])\)", work_data)
if match:
    imported = json.loads(match.group(1))
    for slug in imported:
        expect((ROOT / "assets" / "cases" / slug / "cover-work.png").is_file(),
               f"Missing source artwork: {slug}")
else:
    expect(False, "Work cover manifest not found")
review_match = re.search(r' const reviews=(\{[^\n]+\});', work_data)
if review_match:
    reviews = json.loads(review_match.group(1))
    authors = [review["id"] for group in reviews.values() for review in group]
    expect(len(authors) == 15 and len(set(authors)) == 15,
           "All fifteen signed client reviews must remain unique")
    for author in authors:
        expect((ROOT / "assets" / "reviews" / (author+".png")).is_file(),
               f"Review portrait missing: {author}")
    private = reviews.get("private-2025", [])
    expect(any(r["id"] == "vlad-b" and r.get("after") == "vlad-bykov" for r in private),
           "Vlad B. review must follow Vlad Bykov")
    expect(any(r["id"] == "denis-k" and r.get("after") == "echo-app" for r in private),
           "Denis K. review must follow ECHO")
else:
    expect(False, "Work review manifest not found")
private_match = re.search(r'\{id:"private-2025",[^\n]+?slugs:(\[[^\]]+\]),facts:', work_data)
if private_match:
    private_slugs = json.loads(private_match.group(1))
    expect(private_slugs[:4] == ["vlad-bykov","echo-app","chatus","propuska"],
           "Private practice projects must keep Figma source order")
else:
    expect(False, "Private practice card sequence missing")
if errors:
    print("Design system check FAILED:")
    for error in errors:
        print(" -", error)
    sys.exit(1)
print(f"Design system checks passed. {len(parser.urls)} existing media refs, 12 periods, 15 reviews, one ProjectCard.")
