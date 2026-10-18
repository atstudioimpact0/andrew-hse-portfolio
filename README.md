# Current release — V11 (18 October 2026)

The bilingual personal portfolio at **https://andrew.atstudioimpact.com** uses a much quieter entry page. A visitor sees only three collection buttons — **Films & Video, Safety Signs, Layouts & Drawings** — and opens each library on demand. The original 16 professional case studies, 25 source sample records and 6 video registrations are preserved in the repository. Neither AT Studio production site nor ATS branding is used.

## Actual media availability

**The public GitHub repository still has zero files in `assets/` as of the V11 release.** Video titles and image paths recorded in metadata are *not* uploaded MP4s or WebP images. The UI intentionally waits for an actual media load/HEAD success and never displays broken thumbnails as if they were published. Sensitive original operational layouts, emergency routes, medical contact data and lifting details must stay private.

To complete the missing binary upload from the owner's Windows device:

1. Download the **Andrew_HSE_V9_ReadyToPublish.zip** package from the earlier ChatGPT delivery to **Downloads**. Put the four later approved source MP4 files in Downloads too (the script recognizes Arabic-Indic date digits in filenames).
2. Install **Git for Windows** and **FFmpeg/FFprobe** if absent, using free tools; authenticate GitHub write access.
3. Download **[tools/Publish-All-Approved-Media.ps1](tools/Publish-All-Approved-Media.ps1)** to Downloads, then run in Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\Publish-All-Approved-Media.ps1"
```

The script checks file signatures, converts new videos to mobile-friendly MP4 with a WebP cover, stages only allowlisted media files and asks for explicit public-release clearance before pushing to the dedicated repository. It does **not** upload confidential layout originals and never uses a force push. If some source files aren't in Downloads, those are skipped and must be uploaded later.

After the push, the **V11 Portfolio QA** workflow reports missing media; the live site must be checked on desktop and mobile before saying that playback is complete.

---

# Andrew Tharwat — Independent HSE Portfolio

Standalone professional portfolio (Arabic / English) for **Andrew Tharwat Boshra Thabet**, HSE Supervisor.

## Architecture
- An entirely independent static website. No AT Studio application, database, administrative panel, shared runtime, or credentials.
- English `index.html`, Arabic `ar.html`, styles, responsive client-side case-study gallery, accessible dialogs.
- No confidential operating layouts, original lifting plans, hospital routes, site worker photographs or unverified video files are stored here.
- Employer/site names, roles and examples are described at a high level. Full project evidence should only be uploaded after authorization.
- Actual video source: https://andrew-tharwat-portfolio.vercel.app/projects/hse-awareness-series — links are external until first-party media have been verified and permission cleared.
- Official custom domain: `https://andrew.atstudioimpact.com` — Vercel domain assignment is **verified** and linked to independent project `prj_lVw5rL3d2jK8E0Hg7uZWxcQiZFjj` (verified on 2026-10-17); full live HTTP/UX validation remains pending because the connected Vercel API denies project/deployment reads.
- All publishing and domain changes must target the **dedicated** Vercel project; never the ATS project.

## Status
Initial deployment was shown as READY on the user's Vercel dashboard and custom-domain assignment now reports verified. Public media binaries are still missing (the video manifest contains two entries, but the MP4/WebP files have not been committed). Site stays `noindex` until release review. Do not generate final CV QR until the custom-domain page and media have been tested.


## V9 — Visual portfolio improvements (2026-10-17)

The independent `main` branch now includes bilingual progressive visual enhancements. A curated V9 **site and media review package** was prepared separately from source ZIPs, including:

- 12 original selected design/artwork excerpts and a portrait (all listed as public excerpts or crops in the source V6 manifest).
- Two MP4 files of AI-assisted HSE educational scenarios, compressed to about 5.3 MB each with AAC audio, together with their WebP covers.
- Original sensitive construction routes, emergency operation drawings, lift plans and medical route details have **not** been placed in the public repository.

**GitHub media binaries are still absent.** The bilingual `data/videos.json` is metadata prepared for the two video files, and `video.js` checks that the actual MP4 exists before showing it. `media-enhancements.js` shows only images that have actually loaded and preserves text cards as fallback.

The approved media package can be uploaded from the separately generated V9 media ZIP (or the guarded Windows PowerShell publishing helper distributed alongside it). Because this repository is public, the helper deliberately requires an explicit rights-clearance confirmation. It never imports or modifies AT Studio live-site files.

The full V9 review package is a separate self-contained ZIP, not currently pushed as the production HTML. The production domain is verified, but live visual/browser verification of recently pushed GitHub changes remains pending due Vercel connector access restrictions.

## Media audit — 2026-10-17

A direct recursive GitHub tree audit of `main` confirmed **zero** binary images and videos in `assets/`. These assets are not yet published:
- Eight selected bilingual safety-signage WebP images.
- Four visual campaign/event work samples.
- One personal portrait.
- Two video-cover WebP images.
- Two AI-assisted HSE educational MP4 files.

This is **13 curated pictures + 2 video posters + 2 videos = 17 missing binaries**. The remaining original site-operational plans are explicitly excluded from the public release. The text cards and source-page links remain accessible while binaries are absent.

### Release route

- Windows PowerShell publisher: `tools/Publish-Andrew-Media.ps1` (updated to autodetect an extracted assets directory or selected Media ZIP; supports `-MediaZip`).
- Repository file verifier: `python tools/audit_media.py`.
- Publishing requires explicit confirmation of public-display rights for the **specific** images and videos; the public GitHub repository is not the place for source emergency, route, or lifting-plan operational originals.
- The GitHub/Vercel connection currently supports source updates but not reading/uploading the model's container binary files or reading this new project's Vercel deployments. Do not claim a live media release until those files appear in the Git tree and load over the domain.
