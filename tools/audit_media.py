#!/usr/bin/env python3
"""Andrew HSE Portfolio public media audit.

Checks the 13 selected original artworks / portrait + 2 WebP video posters +
2 MP4 H.264/AAC films intended for the public, separately hosted portfolio.
No external services, packages, or project secrets are required.
"""
import json, sys
from pathlib import Path

BASE=Path(__file__).resolve().parent.parent
EXPECTED_IMAGES=[
"assets/signage/restricted-zone.webp",
"assets/signage/storage-area.webp",
"assets/signage/parking-area.webp",
"assets/signage/falling-objects.webp",
"assets/signage/drowsy-driving.webp",
"assets/signage/heat-stress.webp",
"assets/signage/water-conservation.webp",
"assets/signage/world-environment-day.webp",
"assets/work/andrew-portrait.webp",
"assets/work/safety-performance.webp",
"assets/work/six-million-hours.webp",
"assets/work/global-safety-day.webp",
"assets/work/hsse-board.webp",
]
POSTERS=[
"assets/video-posters/hse-decision-training.webp",
"assets/video-posters/site-safety-briefing.webp",
]
VIDEOS=[
"assets/videos/hse-decision-training.mp4",
"assets/videos/site-safety-briefing.mp4",
]
EXPECTED=EXPECTED_IMAGES+POSTERS+VIDEOS

def check_one(name):
 p=BASE/name
 if not p.is_file():
  return "MISSING",0
 size=p.stat().st_size
 if size<100:
  return "EMPTY_OR_TOO_SMALL",size
 with p.open("rb") as f:
  start=f.read(12)
 if name.endswith(".webp") and not (start[:4]==b"RIFF" and start[8:12]==b"WEBP"):
  return "BAD_WEBP_SIGNATURE",size
 if name.endswith(".mp4") and not(start[4:8]==b"ftyp"):
  return "BAD_MP4_SIGNATURE",size
 return "OK",size

def main():
 rows=[(n,*check_one(n)) for n in EXPECTED]
 manifest_path=BASE/"data/videos.json"
 try:
  videos=json.loads(manifest_path.read_text(encoding="utf-8"))["videos"]
  srcs=sorted([v["src"] for v in videos])
  posters=sorted([v["poster"] for v in videos])
  manifest_ok=srcs==sorted(VIDEOS) and posters==sorted(POSTERS)
 except (OSError,ValueError,KeyError,TypeError):
  manifest_ok=False
 print("ANDREW HSE V9 — REPOSITORY MEDIA AUDIT")
 for name,status,size in rows:
  print(f"{status:>19} | {size:>9} | {name}")
 missing=[n for n,status,_ in rows if status!="OK"]
 print(f"Images: {len(EXPECTED_IMAGES)} original artwork + portrait")
 print(f"Posters: {len(POSTERS)} | Videos: {len(VIDEOS)} | Manifest correct: {manifest_ok}")
 print(f"Media present & signed: {len(rows)-len(missing)}/{len(rows)}")
 if missing or not manifest_ok:
  print("FAIL: media is not yet fully uploaded. Do not mark visual portfolio complete.")
  return 1
 print("PASS: all required public-safe paths are present and have expected signatures.")
 print("NOTE: this checks files in repository, not deployment/CDN, publication rights or video playback.")
 return 0

if __name__=="__main__":
 sys.exit(main())
