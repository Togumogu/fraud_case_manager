---
name: obs_search_filter
description: SearchInput + FilterBar component review findings from 2026-03-18
type: project
---

## Reviewed 2026-03-18 — SearchInput & FilterBar in SCM_CaseList + SCM_TransactionSearch

### Critical Gaps
- SearchInput uses CSS classes but pages (SCM_CaseList, SCM_TransactionSearch) are not importing any global CSS that provides `.scm-search` styles — the styles live in `src/styles/components/filter.css` which must be imported somewhere in main.jsx or index.css to take effect. Visually the component renders correctly, implying the styles ARE loaded (via src/styles/index.css presumably).
- `FilterBar.Panel` accepts a `style` prop in SCM_TransactionSearch (`style={{ marginBottom: 16 }}`) but the `FilterBarPanel` component definition does NOT spread `style` onto the wrapper div — this prop is silently ignored.
- `role="searchbox"` on an `<input type="search">` is redundant and technically incorrect — `type="search"` already has implicit searchbox role; explicit role attribute should be removed.
- The clear button (22x22px) is below the 44x44px minimum touch target size required by WCAG 2.5.5.
- `.scm-select` has `appearance: none` but no custom chevron icon — the dropdown arrow is hidden on Chromium/macOS, making it look like a plain text field with no affordance.
- FilterBar.Toggle `activeCount` badge: when toggle is active (blue background), badge uses `rgba(255,255,255,0.28)` — very low contrast against the blue button.
- Vaka Listesi: Filtreler button sits to the RIGHT of currency toggle; İşlem Arama: Filtreler button sits IMMEDIATELY RIGHT of SearchInput. Placement inconsistency across the two pages.
- FilterBar panel on Vaka Listesi has ChipGroups (visual toggle chips); on İşlem Arama it has all Select dropdowns. The richer chip interaction is missing from the transaction page for Durum and Kaynak which would benefit from it.
- `scm-filter-chip--selected` has no CSS rules of its own — selected styling is applied entirely via inline style from config data. This means focus-visible styling still works, but the selected state has no fallback if config data is missing bg/color/border.
- Date inputs show browser-native "gg.aa.yyyy" placeholder (Chrome Turkish locale), which is correct for the platform but small and low-contrast.
- No visible separator/divider between ChipGroup sections in the filter panel — groups run together at small widths when flex-wrap kicks in.
- `color-mix()` in `.scm-filter-reset:hover` background is not supported in all browsers (needs Safari 16.2+, Chrome 111+) — acceptable for a banking internal tool but worth noting.

### What Works Well
- SearchInput icon color transitions to blue on focus-within — nice micro-interaction.
- Clear button appears only when filled (opacity transition), tabIndex=-1 when empty — correct pattern.
- `aria-expanded`, `aria-controls` on FilterBar.Toggle — good ARIA.
- `role="group"` + `aria-label` on ChipGroup — correct grouping semantics.
- `role="checkbox"` + `aria-checked` on chips — correct for multi-select pattern.
- `prefers-reduced-motion` respected in filter panel reveal animation.
- Reset button auto-aligns to right via `margin-left: auto` — clean layout.
- `[data-theme="dark"]` overrides present for key elements.
