/**
 * Badge — status / severity pill for NEXUS
 *
 * A standalone version of Table.Badge that can be used anywhere —
 * in headers, detail panels, activity feeds, and inside table cells.
 *
 * Also exports shared config objects so all pages can import them
 * instead of defining local SEVERITY_CONFIG / STATUS_CONFIG copies.
 *
 * Usage:
 *   import Badge, { SEVERITY_CONFIG, STATUS_CONFIG } from "../components/Badge";
 *
 *   <Badge label="Custom" variant="medium" />
 *   <Badge.Severity value="critical" />
 *   <Badge.Status   value="Open" />
 *   <Badge.MarkStatus value="Marked" />
 *
 * Config objects (pass to Table.Badge or use in render fns):
 *   SEVERITY_CONFIG["high"]  → { label, bg, color, border }
 *   STATUS_CONFIG["Closed"]  → { label, bg, color, border }
 *
 * Styling via CSS classes (src/styles/components/badge.css).
 */

// ─── Shared config objects ──────────────────────────────────────────────────────
// Import these to replace per-file SEVERITY_CONFIG / STATUS_CONFIG definitions.

export const SEVERITY_CONFIG = {
  critical: { label: "Kritik",  bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  high:     { label: "Yüksek",  bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  medium:   { label: "Orta",    bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  low:      { label: "Düşük",   bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};

export const STATUS_CONFIG = {
  "Open":            { label: "Açık",             bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  "Closed":          { label: "Kapalı",            bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  "Pending Closure": { label: "Kapanış Bekliyor",  bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
};

export const MARK_STATUS_CONFIG = {
  "Marked":        { label: "İşaretlendi",    bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  "Unmarked":      { label: "İşaretsiz",      bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
  "Case Assigned": { label: "Vakaya Atandı",  bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  "Under Review":  { label: "İncelemede",     bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
};

// Maps config keys → CSS class modifier for .scm-badge--{variant}
const SEVERITY_VARIANT = { critical: "critical", high: "high", medium: "medium", low: "low" };
const STATUS_VARIANT   = { "Open": "open", "Closed": "closed", "Pending Closure": "pending" };
const MARK_VARIANT     = { "Marked": "marked", "Unmarked": "unmarked", "Case Assigned": "assigned", "Under Review": "review" };

// ─── Badge (base) ──────────────────────────────────────────────────────────────
/**
 * Generic pill badge.
 *
 * @param {string}  label             — display text
 * @param {string} [variant]          — CSS modifier (critical/high/medium/low/open/closed/pending/…)
 * @param {string} [bg]               — override background colour (legacy inline support)
 * @param {string} [color]            — override text colour (legacy inline support)
 * @param {string} [border]           — override border colour (legacy inline support)
 * @param {"sm"|"md"|"lg"} [size="md"]
 */
export function Badge({ label, variant, bg, color, border, size = "md" }) {
  // If explicit colour overrides are provided (legacy Table.Badge usage), use inline style.
  if (bg || color || border) {
    return (
      <span className={`scm-badge scm-badge--${size}`} style={{
        background: bg     ?? undefined,
        color:      color  ?? undefined,
        borderColor:border ?? undefined,
      }}>
        {label}
      </span>
    );
  }

  const variantClass = variant ? ` scm-badge--${variant}` : "";
  return (
    <span className={`scm-badge scm-badge--${size}${variantClass}`}>
      {label}
    </span>
  );
}

// ─── Badge.Severity ────────────────────────────────────────────────────────────
Badge.Severity = function BadgeSeverity({ value, size }) {
  const cfg = SEVERITY_CONFIG[value];
  if (!cfg) return null;
  return <Badge label={cfg.label} variant={SEVERITY_VARIANT[value]} size={size} />;
};

// ─── Badge.Status ──────────────────────────────────────────────────────────────
Badge.Status = function BadgeStatus({ value, size }) {
  const cfg = STATUS_CONFIG[value];
  if (!cfg) return <Badge label={value} size={size} />;
  return <Badge label={cfg.label} variant={STATUS_VARIANT[value]} size={size} />;
};

// ─── Badge.MarkStatus ──────────────────────────────────────────────────────────
Badge.MarkStatus = function BadgeMarkStatus({ value, size }) {
  const cfg = MARK_STATUS_CONFIG[value];
  if (!cfg) return <Badge label={value} size={size} />;
  return <Badge label={cfg.label} variant={MARK_VARIANT[value]} size={size} />;
};

export default Badge;
