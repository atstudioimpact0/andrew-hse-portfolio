# Andrew Portfolio V14 — Template Selection / Design Brief

**Status:** Design investigation and selection ONLY. No production design update authorized until Andrew chooses a concept and reviews a working preview.

## Preservation & safe rollback

- Immutable reference commit: `cb4a833f51f246de72de2b2cd71334b53cb11d58`.
- Approved archive branch: `archive/andrew-v13-approved-2026-10-18`.
- Production site: https://andrew.atstudioimpact.com (Arabic: /ar.html), independent of AT Studio company.
- The production branch `main` must remain untouched while exploring V14.
- Existing source documents remain: `data.js` (16 professional scopes and 25 original example labels); `data/videos.json` (6 approved registrations).
- Real binaries at approved snapshot: 8 signs, 5 work/portrait WebPs, 2 video posters, 2 playable MP4s (17 binary assets); plus 4 *conceptual*, explicitly non-operational SVG drawing previews. Four later MP4 source files remain **unpublished**.
- The 4 conceptual layouts are not evidence of real engineering or site drawings and must be identified as conceptual only.
- Never publicly release original restricted site layouts, traffic routing, evacuation details, medical route maps, technical lifting calculations, employee faces, project logos, or confidential information without authorization.
- Preserve accurate role boundaries (HSE Supervisor; PTW document coordination, not final PTW sign-off; GIZMO follow-up/submission, not independent consultant approval; lifting drawings based on team supplied data, not certified engineering).

## Desired direction

A quiet, very professional **personal** portfolio, neither a generic creative-agency landing page nor a crowded HSE corporate dashboard. Reflect the combination of professional site safety coordination, reporting, digital document systems and visual communication. One clear identity, refined typography, excellent bilingual RTL/LTR layouts, mobile-first, accessible and quick.

Main landing stays short: identity, one-sentence philosophy, three meaningful collection entry points (Films / Safety Signs / Technical Layouts), concise unique text index of all 16 scopes, About, Contact. The first viewport must not be a multi-card directory.

## Three researched reference directions

### A — Editorial Signature (recommended for first preview)
- Visual reference: Aster Bloom (Framer; limited license): https://www.framer.com/marketplace/templates/aster-bloom/
- Approach: strong bespoke typographic hierarchy, soft editorial spacing, portrait used once with restraint, one accent, quiet lines; personal, memorable, not an agency.
- Replace its Framer CMS/gallery with independent static HTML/CSS and existing asset/manifests. Do not copy restricted source, trademarked images or template code.

### B — Visual Archive
- Visual reference: Noveau (Framer; limited license): https://www.framer.com/marketplace/templates/noveau/
- Approach: minimal photo-and-video archive, hero identity followed by three single-line gallery doors. Each collection takes over view as an independent immersive library, not wall of mixed work.
- Risk: video/image emphasis is weak while only 2/6 videos are published, and may underplay professional HSE credibility.

### C — Quiet Technical (open source baseline)
- Visual reference: Mercer Lite (free HTML template): https://mikesmithdesign.co.uk/themes/free/mercer/
- Approach: graphite/ivory, precision typesetting, very restrained industrial aesthetic; strong CV/role communication with an understated project archive.
- Advantage: static HTML no build step; source license permits personal use. Risk: too brutalist/dark could feel generic tech portfolio; adapt specifically to Andrew.

## Non-negotiable design/QA criteria

1. Never delete source data, already uploaded media, or functioning video collection logic.
2. Keep Arabic and English equal-quality, not a translated afterthought.
3. Exactly one entry for every one of 16 work scopes; preserve all 25 sample labels in their relevant detail area with no duplicates.
4. Maintain three on-demand collection entrances with reliable deep links and keyboard accessible dialogs or dedicated pages.
5. Actual images/videos display only once accessible; missing files never look like published work.
6. Existing portrait, signs and media must not be lost or stretched. The original 4 SVG layout previews retain the conceptual disclosure.
7. No artificial KPIs, career claims, confidential source documents or employer-branded UI.
8. No paid services, no switch to Framer, no new complex framework, no website migration; preserve Vercel/GitHub paths.
9. Before production: desktop 1440, mobile 390, RTL and LTR, all entrypoints, audio/video playback, all assets, semantic landmarks, keyboard focus, accessibility and screenshots need QA.
10. Production update occurs only after user explicitly approves a test preview of one design direction.

## Selection stage

1. User chooses A, B or C (or hybrid).
2. Build a separate preview branch with two language views and real authorized content (not placeholders).
3. Review screenshots and interaction, then refine once.
4. Merge only after approval and rollback verification.
