#!/usr/bin/env python3
"""Create gallery manifests for arbitrary image names (HTML editing not needed)."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parent/'assets'/'cases'
valid={'.webp','.png','.jpg','.jpeg','.avif'}
for folder in root.rglob('*'):
 if not folder.is_dir(): continue
 imgs=[p.name for p in folder.iterdir() if p.is_file() and p.suffix.lower() in valid]
 # Skip ordinary product folders containing cover/hero etc; only named gallery subfolders
 if folder.name not in {'site','dashboard','terminal','catalog','accounts','orders','ui','gameplay','economy','client','operator','admin','gallery'}:continue
 def key(name):return [int(x) if x.isdigit() else x.lower() for x in re.split(r'(\d+)',name)]
 imgs.sort(key=key)
 if imgs:(folder/'gallery.json').write_text(json.dumps(imgs,ensure_ascii=False,indent=2),encoding='utf-8')
 elif (folder/'gallery.json').exists(): (folder/'gallery.json').unlink()
print('Gallery manifests are updated.')
