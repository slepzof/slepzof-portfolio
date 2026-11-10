# SLEPZOF v12

Built **on top of v11**, not a new site. The original pages, navigation, stage data, catalog, images, and cases remain intact.

## Updated

- Rebuilt the layout of project cards using the supplied colorful editorial grid reference: flexible mixed-size mosaics, a large feature tile with companion cards, separate compositions by project count, and no intentionally empty holes.
- Gave project tiles a saturated brand-ready palette. Colors are set by project slug in `js/v12.js`, and can be adjusted individually under `explicit`.
- Card imagery now meets the right/top/bottom edges and can be replaced in `assets/cases/<slug>/cover.webp`. The inset 4px outline remains above all visuals.
- Unified outlined role chips without rainbow coloring per role. Restored decorative laurel wreaths around the numerical metrics.
- Applied the same tile system to the full catalog, with existing search and role filters still intact, plus compact responsive layouts for tablets and phones.
- Preserved horizontal slide navigation where a period spans multiple groups, and didn't add arrows to one-page periods.

## Run

Unzip, open the site directory, and run: `python3 -m http.server 8000`.

## Files introduced

- `css/v12.css` (card and responsive grid visual system)
- `js/v12.js` (project background palette and semantic tile classes)
- `assets/icons/laurel.svg` (statistic decorations)

Existing v11 content can be maintained normally. For custom brand colors, change `explicit[slug]` rather than editing many pages.
