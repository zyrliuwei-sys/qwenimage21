# Homepage visual specification

Reference computed styles at 1728px viewport: body background `rgb(246,245,239)`, foreground `rgb(28,43,35)`, body font `Manrope`; header height 94px. Main content max width 1280px. Hero is a two-column grid, 604px / 654px with 22px gap and 53px top padding. Hero H1 uses Manrope, 79px, weight 600, line-height 80.58px. Gallery starts with 88px top padding; H2 is 49px, weight 500, line-height 53.9px. About section uses `rgb(237,238,229)`; creation section uses `rgb(25,40,31)`. Primary button background is `rgb(28,43,35)` with 7px radius.

First-version implementation adapts this palette, font, spacing, thin rules and gallery rhythm. The hero uses a new collage created for QwenImage AI. The seven cards all use original concept imagery. Component states: all/photography/concept/edit filters; empty search; image detail modal; mobile navigation closed/open. See `BEHAVIORS.md` for tested behavior.

Image assets: `/imgs/qwen/editorial-contact-sheet.jpg` and `/imgs/qwen/atelier-contact-sheet.jpg` provide individually framed original concepts through CSS crop positions. Additional original photographs under `/imgs/qwen/` give the gallery, studio, sign-in page and dashboard distinct artwork. No image assets were taken from the reference site.
