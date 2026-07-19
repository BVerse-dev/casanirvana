# Casa Nirvana marketing site (WordPress)

This directory is the local working copy of the Casa Nirvana marketing site.
Only the custom `saliver-child` theme is versioned. WordPress core, the parent
theme, plugins, uploads, caches, local configuration, and database exports are
kept locally and ignored by Git.

## Versioned source

- `wp-content/themes/saliver-child/`

## Local-only runtime

- WordPress core and `wp-config.php`
- Third-party themes and plugins
- `wp-content/uploads/`
- Database exports under `sql/`
- Cache and generated files

The current local site is served at `http://localhost:8882/`. Do not commit
credentials, database dumps, generated caches, or licensed theme/plugin files.

## Migration direction

The WordPress site is retained as the visual and content reference while the
marketing experience is assessed for a controlled migration to Next.js. A
Next.js rebuild should reproduce the approved design as React components and
optimized assets; it should not attempt to execute Elementor or WordPress PHP.

