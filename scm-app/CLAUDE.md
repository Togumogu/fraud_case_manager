# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fraud Case Manager** is a Turkish-language banking fraud case management platform. Built with React 19 + Vite. Integrates with **FDM (Fraud Data Mart)** as a read-only transaction source and **SAS SFD** as the fraud detection/scoring engine. Authentication via **KeyCloak (OIDC)** with LDAP and local user support.

All UI text is bilingual (Turkish primary, English secondary). Dates use DD.MM.YYYY format (tr-TR locale). Currency options are **Orijinal Para Birimi** (from SFD), TRY, USD — EUR is not included.

## Commands

```bash
npm run dev       # Start dev server (Vite, localhost:5173)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Core Architecture Principles

- **SCM does not mark transactions.** Transactions are marked upstream by Alert Triage ("Send to Case Manager") and flow through FDM to SCM's Transaction Management screen.
- **Cases** are created from one or more selected transactions. Cases support parent-child hierarchical nesting and sibling (peer-level) relationships.
- **Review ≠ Maker-Checker:** Review is informal peer feedback, non-blocking, audit-logged only. Maker-Checker is the formal mandatory dual-approval workflow required for case closure and user creation.
- **Domain is the primary isolation boundary.** Each fraud type is an independent domain instance with its own cases, users, settings, dashboard metrics, and reports. `"Tüm Domainler"` is never a valid selection.
- All data stored in FDM via REST API. MinIO for file storage. No separate PostgreSQL schema for SCM core data.

## Project Structure

```
scm-app/
├── src/
│   ├── main.jsx                        # Entry point
│   ├── SCM_App.jsx                     # Router — activePage state + KEY_MAP
│   ├── pages/                          # All 8 page components
│   │   ├── SCM_Dashboard.jsx
│   │   ├── SCM_CaseList.jsx
│   │   ├── SCM_CaseCreation.jsx
│   │   ├── SCM_CaseDetail.jsx
│   │   ├── SCM_Review.jsx
│   │   ├── SCM_TransactionSearch.jsx
│   │   ├── SCM_Reports.jsx
│   │   └── SCM_Settings.jsx
│   └── assets/                         # Static assets
├── project_knowledge/                  # Spec docs & flow diagrams (not served)
│   ├── SCM_Teknik_Spesifikasyon_v*.docx
│   ├── SFD_Case_Management_Design.xlsx
│   └── Workflows/                      # Per-screen flow diagram JPGs + FigJam files
├── public/
├── CLAUDE.md
├── package.json
└── vite.config.js
```

**Planned additions (create when first needed):**
- `src/constants/` — shared design tokens (`COLORS`, `C`), shared `Icons` object
- `src/data/` — shared mock data (currently embedded per-component)
- `src/hooks/` — shared custom hooks

## Routing — `src/SCM_App.jsx`

Single-level client-side routing via `activePage` state. The `KEY_MAP` object maps sidebar nav keys to page keys — some nav keys alias to the same page (e.g. `my_cases` → `cases`, handled internally by `SCMCaseList`). Props passed to page components: `onNavigate(key, data?)` and `initialCase` (for `SCMCaseDetail`).

`selectedCase` state in `SCM_App` stores the case object passed when navigating to `case_detail`. `SCMCaseDetail` receives it as `initialCase` prop and is keyed by `selectedCase?.id` to force remount on case change.

## Page Components (`src/pages/`)

| File | Purpose |
|------|---------|
| `SCM_Dashboard.jsx` | KPI cards, activity feed, pending approvals — **reference standard for sidebar/header patterns** |
| `SCM_CaseList.jsx` | Case table — 3-part sidebar: `navItems` + `casesSubItems` + `bottomNav`. Row clicks navigate to `case_detail`. |
| `SCM_CaseCreation.jsx` | Multi-step case creation + transaction search table |
| `SCM_CaseDetail.jsx` | Six tabs: Varlıklar, Yorumlar, Ekler, Geçmiş, İşlemler, İlişkili Vakalar. Back button → `onNavigate("cases")`. |
| `SCM_Review.jsx` | Peer review: internal reviewer KPIs + external OTP-verified read-only flow |
| `SCM_TransactionSearch.jsx` | Investigative-only transaction search (no case assignment from here) |
| `SCM_Reports.jsx` | 50+ report types, standard mode only, preview/download flow |
| `SCM_Settings.jsx` | Domain settings, roles, maker-checker, notifications |

## State Management

Local `useState`/`useEffect`/`useRef`/`useCallback` only — no Redux, no Context. All data is mock data embedded within each component (arrays/objects defined at module level). No API calls.

Every component has these standard states: `darkMode`, `showUserMenu`, `showNotifications` (name may vary: `notifPanelOpen` in Settings, `showNotifPanel` in CaseDetail).

## Styling

CSS custom properties (CSS variables) via `src/styles/` directory — **no UI libraries, no Tailwind**. Legacy pages still have `const COLORS`/`const C` inline constants; these are replaced gradually.

**Design tokens:** defined in `src/styles/tokens.css` — two-layer system (primitives → semantic). Dark mode via `[data-theme="dark"]` on `<html>`. Dark mode state owned by `Sidebar.jsx` (reads/writes `localStorage("scm-theme")`).

**Design system:** dark sidebar `#0F172A` (always-on), blue primary `var(--color-primary)` = `#1E40AF`, amber accent `#F59E0B`, light gray background `var(--color-bg-app)` = `#F1F5F9`. Fonts: **DM Sans** for UI, **JetBrains Mono** for IDs/amounts/data fields — loaded once in `src/styles/typography.css`.

**Shared components in `src/components/`:**
- `Badge.jsx` — exports `SEVERITY_CONFIG`, `STATUS_CONFIG`, `MARK_STATUS_CONFIG` for use in filter chips
- `Card.jsx`, `Modal.jsx`, `Table.jsx`, `Sidebar.jsx` — CSS-class-driven (no `injectStyles()`)
- `SearchInput.jsx` — controlled search input with magnifier icon + animated clear button. Props: `value`, `onChange`, `placeholder`, `size` (sm/md/lg), `disabled`, `className`, `style`
- `FilterBar.jsx` — composable filter system exported as namespace object:
  - `FilterBar.Toggle` — filter button with badge count; props: `open`, `onToggle`, `activeCount`
  - `FilterBar.Panel` — collapsible container; props: `onReset`, `children`, `style`
  - `FilterBar.ChipGroup` — multi-select toggle chips; props: `label`, `options[]` ({key,label,bg,color,border}), `selected[]`, `onToggle`
  - `FilterBar.Select` — dropdown; props: `label`, `value`, `onChange`, `options[]` ({value,label})
  - `FilterBar.Input` — text field; props: `label`, `value`, `onChange`, `placeholder`
  - `FilterBar.DateRange` — from/to date pair; props: `label`, `from`, `to`, `onFromChange`, `onToChange`
  - `FilterBar.NumberRange` — min/max numeric pair; props: `label`, `min`, `max`, `onMinChange`, `onMaxChange`

## Key Patterns

### Sidebar / Navigation

Every page component contains its own full sidebar. When adding a new nav item, it must be added to **all 8 components** plus `KEY_MAP` in `SCM_App.jsx`.

**`SCM_CaseList.jsx` is special**: uses three arrays — `navItems` (top), `casesSubItems` (expandable under "Vaka Listesi"), `bottomNav` (bottom). New cross-module nav items go into `bottomNav`.

Sidebar bottom section contains: clickable profile avatar/name (toggles `showUserMenu` dropdown with "Çıkış Yap"), dark mode toggle button (moon/sun), notification bell. Dark mode is managed by `Sidebar.jsx` internally — sets `document.documentElement.dataset.theme` and writes to `localStorage("scm-theme")`. Pages no longer hold `darkMode` state.

### Icons

Each component defines its own icons object — `const Icons = {...}` in most files, `const I = {...}` in `SCM_CaseDetail` and `SCM_Review`. When adding a new icon, it must be added to every component's icons object independently.

### Domain Concepts

- **Fraud domains:** Payment Fraud, Credit Card Fraud, Application Fraud, Account Takeover, Internal Fraud
- **User roles:** Analyst (Fraud Analist), Manager (Yönetici), Admin — Admin has settings-only access, no case/transaction visibility
- **Case status:** Open, Closed, Pending Closure. Deletion: always requires Maker-Checker; soft-delete only; open cases only.
- **Severity:** Critical, High, Medium, Low
- **Entity types:** Customer (Müşteri), Account (Hesap), Card (Kart), Device (Cihaz)
- **Transaction mark status:** Marked, Unmarked, Case Assigned, Under Review
- **Case hierarchy depth:** validated with `altSeviyeSayisi` using strict `>` (not `>=`) against `maxSeviye`
- **Fraud amount distribution:** bank share + customer share = total exactly; remainder shown as "Belirlenmemiş"; color-coded visual bar (blue/amber/gray), not input fields

### Key Business Rules

- Closing a case requires a mandatory closing comment in the modal.
- External reviewer auth: magic link is single-use, 72-hour expiry, 30-minute inactivity timeout; OTP is 6-digit (not name input).
- Case deletion always requires Maker-Checker regardless of domain settings.
- User Management is accessible to Manager and Admin (not Admin-only).
- SLA removed from dashboard UI; focus is on operational process monitoring (unmarked transaction idle time, unassigned cases, case aging).

### Reports Flow (`SCM_Reports.jsx`)

Standard reports only (Manuel Rapor Oluşturma tab has been removed). `reportStatus` state machine: `idle` → `loading` → `ready` → `sent`. When ready, a preview modal opens automatically. "Dosya İndir" opens a format picker (xlsx/docx) → doc preview modal (Excel grid or Word page mock) → confirm download.

### Filter Panels

Transaction filter panels in `SCM_CaseCreation` and `SCM_TransactionSearch` use a `filters` state object. When `filters.entityType` is set, an `entityId` input appears dynamically. Both panels have a `resetFilters()` function that must include all filter keys including `entityId`.

## Terminology

| Turkish | English |
|---------|---------|
| vaka | case |
| işlem | transaction |
| varlık | entity |
| senaryo | scenario |
| aksiyon | action |
| havuz | pool |
| Üst Vaka | parent case |
| Alt Vaka | child case |
| Kardeş Vaka | sibling case |
| İnceleme | review (informal, non-blocking) |
| Onay Bekleyenler | pending approvals (maker-checker) |
| Vakalarım | my cases |
| maker-checker | formal dual-approval workflow |

## Diagrams

Flow diagrams must always be drawn via the **Figma MCP connector** (`Figma:generate_diagram`) — never as HTML or Mermaid files. If the Figma connector is offline, inform Toygun and wait; do not use alternatives.

Figma color convention: blue `#CCE5FF` = screens, green `#D5F5E3` = start/end/toggles, yellow `#FFD700` = decisions, red `#FF4444` = errors, orange `#FFA500` = conditional/warning, purple `#E8DAEF` = backend actions, dark purple `#7C3AED` = database nodes. Turkish characters must be used correctly in all labels — no ASCII substitution. Node IDs must be ASCII-only even when labels use Turkish characters. Flat flowchart LR layout preferred over swimlane subgraphs.

## Reference Files

All reference files are in `project_knowledge/` (not served, not imported by the app):

- `project_knowledge/SCM_Teknik_Spesifikasyon_v*.docx` — technical specification
- `project_knowledge/SFD_Case_Management_Design.xlsx` — SFD integration design
- `project_knowledge/Workflows/*.jpg` — per-screen flow diagram images
- `project_knowledge/Workflows/*.jam` — FigJam source files
