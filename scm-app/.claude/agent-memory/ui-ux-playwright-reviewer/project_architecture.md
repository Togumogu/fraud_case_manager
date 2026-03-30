---
name: project_architecture
description: CSS architecture note — new components use CSS files + tokens, not 100% inline CSS like legacy pages
type: project
---

CLAUDE.md states "100% inline CSS" but this is the convention for the 8 page components only. The newer shared components (SearchInput, FilterBar, Card, Table, Badge, Modal) introduced a CSS file layer under `src/styles/` with design tokens in `tokens.css`. These components use class-based styling (`.scm-search`, `.scm-filter-toggle`, etc.) referencing CSS custom properties (`--color-primary`, `--font-ui`, etc.).

**Why:** A component library approach was adopted to avoid repeating inline style objects across pages.
**How to apply:** When suggesting fixes for shared components, write CSS in `src/styles/components/filter.css` or `form.css`. For page-level layout wrappers, inline styles with COLORS/C constants remain correct.

Dark mode for these components uses `[data-theme="dark"]` attribute selectors in CSS, NOT the `filter: invert(1) hue-rotate(180deg)` approach used by legacy page components. This is an inconsistency to note when reviewing dark mode behavior.
