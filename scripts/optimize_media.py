#!/usr/bin/env python3
"""Responsive media generated only for the deployed site, not committed originals.

Current coverage:
- Existing Featured Projects / Beyond UI card artwork (sx25b3-art).
- Future HTML case/article images in assets/cases/<slug>/ and assets/articles/<slug>/.

Original PNG/JPEG/WebP images remain untouched. A SHA-tagged WebP srcset is
generated on GitHub Actions, with an optional persistent cache per variant.
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
from pathlib import Path
from PIL import Image, ImageOps

IMAGE = re.compile(r"<img\b[^>]*>", re.I | re.S)
SRC = re.compile(r"""\bsrc=(["'])(.*?)\1""", re.I)
CLASS = re.compile(r"""\bclass=(["'])(.*?)\1""", re.I)
QUALITY = 92
FORMATS = {".png", ".jpg", ".jpeg", ".webp"}
CACHE = Path(".media-cache")
CACHE_VERSION = "v1"


def optimize_media(out: Path, base: str) -> dict:
    CACHE.mkdir(exist_ok=True)
    variants: dict[tuple[str, bool], tuple[list[tuple[str, int]], int, int]] = {}
    originals = set()
    optimized_bytes = 0
    variant_count = 0
    rewritten_pages = 0

    def prepare(src: str, cover: bool):
        nonlocal optimized_bytes, variant_count
        key = (src, cover)
        if key in variants:
            return variants[key]
        file = out / src
        if not file.is_file() or file.suffix.lower() not in FORMATS:
            return None
        with Image.open(file) as img:
            width, height = img.size
            if width <= 0 or height <= 0:
                return None
            digest = hashlib.sha256(file.read_bytes()).hexdigest()[:14]
            targets = (480, 960, 1200) if cover else (720, 1440)
            targets = tuple(sorted({min(width, target) for target in targets}))
            result = []
            originals.add(src)
            for w in targets:
                cache_name = f"{CACHE_VERSION}-{digest}-w{w}-q{QUALITY}.webp"
                cached = CACHE / cache_name
                generated = file.parent / "optimized" / (
                    f"{file.stem}-{w}-{digest[:8]}.webp"
                )
                generated.parent.mkdir(parents=True, exist_ok=True)
                if not cached.exists():
                    source = ImageOps.exif_transpose(img)
                    if w != width:
                        h = round(height * w / width)
                        source = source.resize((w, h), Image.Resampling.LANCZOS)
                    if source.mode not in ("RGB", "RGBA"):
                        source = source.convert(
                            "RGBA" if "A" in source.getbands() or
                            "transparency" in source.info else "RGB"
                        )
                    source.save(cached, "WEBP", quality=QUALITY, method=5)
                # A generated variant must save bytes compared to the original.
                if cached.stat().st_size >= file.stat().st_size:
                    continue
                shutil.copy2(cached, generated)
                optimized_bytes += generated.stat().st_size
                variant_count += 1
                web = "/" + generated.relative_to(out).as_posix()
                result.append((base + web, w))
        if not result:
            return None
        variants[key] = (result, width, height)
        return variants[key]

    for html in out.rglob("*.html"):
        text = html.read_text("utf-8")
        case_count = 0

        def edit_tag(match):
            nonlocal case_count
            tag = match.group(0)
            if "srcset=" in tag.lower():
                return tag  # Never replace intentionally authored srcsets.
            source = SRC.search(tag)
            if not source:
                return tag
            url = source.group(2).split("?", 1)[0].split("#", 1)[0]
            prefix = base + "/"
            if not url.startswith(prefix):
                return tag
            asset = url[len(prefix):]
            cover = bool(CLASS.search(tag) and
                         "sx25b3-art" in CLASS.search(tag).group(2))
            gallery = asset.startswith(("assets/cases/", "assets/articles/"))
            if not (cover or gallery):
                return tag
            built = prepare(asset, cover)
            if not built:
                return tag
            images, width, height = built
            srcset = ", ".join(f"{variant_url} {w}w" for variant_url, w in images)
            in_beyond = (
                html.name == "index.html" and
                text.rfind('id="beyond-ui"', 0, match.start()) >
                text.rfind('id="selected"', 0, match.start())
            )
            sizes = (
                "(max-width:800px) calc(100vw - 40px), 270px" if cover and in_beyond
                else "(max-width:560px) 65vw, (max-width:850px) 315px, 356px"
                if cover else "(max-width:800px) 100vw, 1116px"
            )
            add = f' srcset="{srcset}" sizes="{sizes}"'
            if "decoding=" not in tag:
                add += ' decoding="async"'
            if "width=" not in tag:
                add += f' width="{width}"'
            if "height=" not in tag:
                add += f' height="{height}"'
            if gallery and "loading=" not in tag:
                # First actual case screenshot is eligible for LCP.
                add += ' loading="eager" fetchpriority="high"' if case_count == 0 else ' loading="lazy"'
            if gallery:
                case_count += 1
            closing = "/>" if tag.endswith("/>") else ">"
            return tag[:-len(closing)] + add + closing

        rendered = IMAGE.sub(edit_tag, text)
        if rendered != text:
            html.write_text(rendered, "utf-8")
            rewritten_pages += 1

    # Dynamic Work Experience covers are not in source HTML. Pre-generate
    # their responsive derivatives and a small manifest for the JS Card factory.
    cover_manifest = {}
    source_dir = out / "assets" / "cases"
    if source_dir.is_dir():
        for file in sorted(source_dir.glob("*/cover-work.png")):
            slug = file.parent.name
            asset_path = file.relative_to(out).as_posix()
            built = prepare(asset_path, True)
            if not built:
                continue
            images, width, height = built
            cover_manifest[slug] = {
                "src": images[-1][0],
                "srcset": ", ".join(f"{url} {w}w" for url, w in images),
                "width": width,
                "height": height,
            }
    manifest_path = out / "js" / "data" / "work-media.js"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        "/* Build-only responsive case media; source PNGs remain unchanged. */\\n"
        "window.SlepzofWorkMedia=Object.freeze("
        + json.dumps(cover_manifest, ensure_ascii=False, separators=(",", ":"))
        + ");\\n",
        encoding="utf-8",
    )

    report = {
        "sources": len(originals),
        "variants": variant_count,
        "variant_mb": round(optimized_bytes / 1_000_000, 2),
        "html_pages": rewritten_pages,
        "dynamic_covers": len(cover_manifest),
    }
    print("Responsive media:", report)
    return report
