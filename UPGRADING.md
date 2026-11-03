# Upgrading

## 2026-11-03: Crawlable footer badges

Deploy the footer badge types, parser, validator, link renderer and admin UI together. Badge metadata (title, aria-label, data-\*), link text and rel qualifiers now survive saving and rendering. Existing image entries remain supported; no database migration is needed. Opus55video and Rumpelstiltskin now load badges during SSR; Rumpelstiltskin mounts them in its active footer. Re-paste original provider snippets where earlier submissions stripped verification attributes, then verify public HTML before resuming pending submissions.
