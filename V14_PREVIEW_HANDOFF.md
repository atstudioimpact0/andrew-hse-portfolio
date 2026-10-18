# ANDREW PORTFOLIO V14 — Independent Design Preview

**Selected direction:** Editorial Signature + Quiet Technical.
**Status:** Preview only. **Do not merge or deploy to production main without explicit user approval.**
**Branch:** `preview/andrew-v14-editorial-technical`
**Preserved approved archive:** `archive/andrew-v13-approved-2026-10-18` (commit `cb4a833f51f246de72de2b2cd71334b53cb11d58`).

## Design decisions

- Typographic editorial first screen, real uploaded portrait, one clear human-centered HSE statement.
- Warm mineral paper + deep graphite green + subtle copper, fine grid lines and restrained technical micro-labels.
- Three calm collection entries (film, signs, drawings). Gallery opens only when requested, not as a full-page wall.
- 16 case topics as deduplicated expandable list; 25 sample references mapped exactly once.
- Original 2 uploaded MP4 files appear in film collection after actual successful HEAD request; other 4 registrations remain hidden until uploaded.
- 8 published signage artworks plus 4 work graphics are available in collection.
- 4 conceptual SVG drawing previews remain labeled **NOT A SITE DRAWING**, with actual operational details excluded. If sanitized real WebPs are later uploaded they may replace illustrations.
- Bilingual Arabic RTL and English LTR, mobile responsiveness and reduced-motion support.
- All existing independent user project source files and media preserved. No copyright-restricted template files copied or new paid platform activated.

## Review flow

1. Inspect the GitHub PR's Vercel *preview deployment* URL, not https://andrew.atstudioimpact.com (production).
2. Check the English and Arabic previews at / and /ar.html.
3. Test #videos, #signs, #layouts links, focus/close, actual MP4 playback, non-repeating scope list and mobile layouts.
4. Only after explicit sign-off, consider production merge and rollback plan. Until then: NO PRODUCTION CHANGES.

## QA limitations

This branch includes automated syntax/content/asset assertions. A successful build is not a substitute for an external real-browser, keyboard and visual acceptance review. No final design approval is implied.
