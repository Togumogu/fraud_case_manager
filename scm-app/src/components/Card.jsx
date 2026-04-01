/**
 * Card — reusable card component family for NEXUS
 *
 * Variants:
 *   <Card>              — base wrapper, compose freely
 *   <Card.KPI>          — icon + metric + label + optional trend badge
 *   <Card.Stat>         — compact label-above / number-below, no icon
 *   <Card.Panel>        — sectioned card: header / scrollable body / footer
 *   <Card.Header>       — header row with border-bottom
 *   <Card.Body>         — padded body section
 *   <Card.Footer>       — footer row with border-top + subtle bg
 *
 * All states handled: default · hover (lift) · pressed · focus-visible ·
 * selected · disabled · loading (shimmer skeleton)
 *
 * 100% inline CSS — matches the project's styling convention.
 * Tokens mirror the COLORS constant used across all page components.
 */

import { useState } from "react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
// Mirror the COLORS / C constants used across all page files.
const T = {
  // Surfaces
  cardBg:       "#FFFFFF",
  cardBorder:   "#E2E8F0",
  pageBg:       "#F1F5F9",

  // Brand
  primary:      "#1E40AF",
  primaryLight: "#3B82F6",

  // Semantic
  success:      "#059669",
  warning:      "#D97706",
  danger:       "#DC2626",
  accent:       "#F59E0B",
  purple:       "#7C3AED",

  // Text
  text:          "#0F172A",
  textSecondary: "#64748B",
  textDisabled:  "#CBD5E1",

  // Geometry
  radiusCard:  14,
  radiusIcon:  12,
  radiusBadge: 6,

  // Typography
  fontUI:   "'DM Sans', system-ui, sans-serif",
  fontData: "'JetBrains Mono', monospace",

  // Motion
  fast:   "150ms ease-out",
  reveal: "250ms cubic-bezier(0.16,1,0.3,1)",
};

// Ghost (translucent) variants for icon boxes and trend badges
const ghost = (hex, alpha = 0.10) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Keyframes and focus ring are in src/styles/components/card.css

// ─── Shimmer ───────────────────────────────────────────────────────────────────
function Shimmer({ width = "100%", height = 14, radius = 6, style: s = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: "linear-gradient(90deg, #EDF2F7 25%, #E2E8F0 50%, #EDF2F7 75%)",
      backgroundSize: "1200px 100%",
      animation: "scm-shimmer 1.5s ease-in-out infinite",
      flexShrink: 0,
      ...s,
    }} />
  );
}

// ─── TrendBadge ───────────────────────────────────────────────────────────────
/**
 * Small coloured badge showing percentage change.
 * @param {number}  value  — positive = up (green), negative = down (red)
 * @param {string} [label] — optional text after the number, e.g. "bu hafta"
 */
function TrendBadge({ value, label }) {
  if (value === undefined || value === null) return null;
  const up    = value >= 0;
  const color = up ? T.success : T.danger;
  const bg    = ghost(color, 0.10);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: bg, color, borderRadius: T.radiusBadge,
      padding: "2px 8px", fontSize: 11, fontWeight: 600,
      fontFamily: T.fontData,
      animation: "scm-trend-in 0.3s ease",
      whiteSpace: "nowrap",
    }}>
      <span>{up ? "↑" : "↓"}</span>
      <span>{Math.abs(value)}%</span>
      {label && (
        <span style={{
          fontFamily: T.fontUI, fontWeight: 400,
          opacity: 0.75, fontSize: 10, marginLeft: 1,
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ─── IconBox ──────────────────────────────────────────────────────────────────
/**
 * Coloured icon container — matches the pattern used across all page files.
 * @param {string} color  — icon + tint colour
 * @param {number} size   — box size in px (default 42)
 */
function IconBox({ children, color = T.primary, size = 42 }) {
  return (
    <div aria-hidden="true" style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: T.radiusIcon,
      background: ghost(color, 0.12),
      display: "flex", alignItems: "center", justifyContent: "center",
      color,
      fontSize: Math.round(size * 0.44),
    }}>
      {children}
    </div>
  );
}

// ─── Card (base) ──────────────────────────────────────────────────────────────
/**
 * Base card wrapper. All other Card.* variants compose from this.
 *
 * @param {boolean}  interactive  — enables hover lift + keyboard activation
 * @param {boolean}  selected     — blue selection ring
 * @param {boolean}  disabled     — dims card, suppresses interaction
 * @param {string}   accentColor  — optional 3px coloured top bar
 * @param {Function} onClick
 * @param {object}   style        — override / extend root styles
 */
export function Card({
  children,
  interactive = false,
  selected    = false,
  disabled    = false,
  accentColor,
  onClick,
  style = {},
  // a11y pass-throughs
  role,
  "aria-label": ariaLabel,
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isInteractive = interactive || !!onClick;

  // Layered shadows: ambient + key light
  const shadowDefault  = "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
  const shadowHover    = "0 8px 20px rgba(0,0,0,0.09), 0 4px 8px rgba(0,0,0,0.05)";
  const shadowSelected = `0 0 0 3px ${ghost(T.primaryLight, 0.25)}`;

  const rootStyle = {
    position: "relative",
    fontFamily: T.fontUI,
    background: disabled ? "#FAFBFC" : T.cardBg,
    borderRadius: T.radiusCard,
    border: selected
      ? `1.5px solid ${T.primaryLight}`
      : `1px solid ${disabled ? "#EEF2F7" : T.cardBorder}`,
    overflow: "hidden",
    cursor: isInteractive
      ? disabled ? "not-allowed" : "pointer"
      : "default",
    opacity: disabled ? 0.55 : 1,
    userSelect: isInteractive ? "none" : undefined,
    transition: `transform ${T.fast}, box-shadow ${T.fast}, border-color ${T.fast}`,
    boxShadow: selected
      ? shadowSelected
      : hovered && isInteractive && !disabled
        ? shadowHover
        : shadowDefault,
    transform: pressed && isInteractive && !disabled
      ? "translateY(0) scale(0.996)"
      : hovered && isInteractive && !disabled
        ? "translateY(-2px)"
        : "translateY(0)",
    ...style,
  };

  return (
    <div
      className="scm-card"
      style={rootStyle}
      role={role ?? (isInteractive ? "button" : undefined)}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      aria-pressed={isInteractive && selected ? true : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={isInteractive && !disabled && onClick
        ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } }
        : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {/* Optional coloured top accent bar */}
      {accentColor && (
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 3, background: accentColor,
          borderRadius: `${T.radiusCard}px ${T.radiusCard}px 0 0`,
        }} />
      )}
      {children}
    </div>
  );
}

// ─── Card.Header ──────────────────────────────────────────────────────────────
/**
 * Flex row with border-bottom. Put title on the left, actions on the right.
 */
Card.Header = function CardHeader({ children, style = {} }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px",
      borderBottom: `1px solid ${T.cardBorder}`,
      gap: 12,
      ...style,
    }}>
      {children}
    </div>
  );
};

// ─── Card.Body ────────────────────────────────────────────────────────────────
Card.Body = function CardBody({ children, style = {} }) {
  return (
    <div style={{ padding: "20px", ...style }}>
      {children}
    </div>
  );
};

// ─── Card.Footer ──────────────────────────────────────────────────────────────
Card.Footer = function CardFooter({ children, style = {} }) {
  return (
    <div style={{
      padding: "12px 20px",
      borderTop: `1px solid ${T.cardBorder}`,
      background: T.pageBg,
      display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8,
      ...style,
    }}>
      {children}
    </div>
  );
};

// ─── Card.KPI ─────────────────────────────────────────────────────────────────
/**
 * Metric card — icon + large numeric value + label + optional trend badge.
 * Used in Dashboard summary row and CaseList stats bar.
 *
 * @param {React.ReactNode} icon         — icon element (emoji or SVG)
 * @param {string|number}   value        — the metric value, e.g. "142" or "4.2k"
 * @param {string}          label        — primary label, e.g. "Açık Vakalar"
 * @param {string}         [sublabel]    — secondary label, e.g. "bu ay"
 * @param {{ value: number, label?: string }} [trend] — % change badge
 * @param {string}         [iconColor]   — tint colour for icon box
 * @param {string}         [accentColor] — top bar colour
 * @param {boolean}        [loading]     — shimmer skeleton
 * @param {boolean}        [interactive]
 * @param {boolean}        [selected]
 * @param {boolean}        [disabled]
 * @param {Function}       [onClick]
 */
Card.KPI = function CardKPI({
  icon,
  value,
  label,
  sublabel,
  trend,
  iconColor   = T.primary,
  accentColor,
  loading     = false,
  interactive = true,
  selected    = false,
  disabled    = false,
  onClick,
}) {
  return (
    <Card
      interactive={interactive}
      selected={selected}
      disabled={disabled}
      accentColor={accentColor}
      onClick={onClick}
      aria-label={label}
      style={{ padding: "20px" }}
    >
      {/* Row 1: icon left, trend right */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 14, gap: 8,
      }}>
        {loading
          ? <Shimmer width={42} height={42} radius={T.radiusIcon} />
          : <IconBox color={iconColor} size={42}>{icon}</IconBox>
        }
        {loading
          ? <Shimmer width={54} height={20} radius={T.radiusBadge} />
          : trend && <TrendBadge {...trend} />
        }
      </div>

      {/* Value */}
      {loading
        ? <Shimmer width="52%" height={26} radius={6} style={{ marginBottom: 8 }} />
        : (
          <div style={{
            fontSize: 26, fontWeight: 700,
            fontFamily: T.fontData,
            color: T.text, lineHeight: 1,
            marginBottom: 6, letterSpacing: "-0.5px",
          }}>
            {value}
          </div>
        )
      }

      {/* Label */}
      {loading
        ? <Shimmer width="68%" height={13} radius={4} style={{ marginBottom: 4 }} />
        : (
          <div style={{
            fontSize: 13, fontWeight: 500, color: T.text,
            marginBottom: sublabel ? 3 : 0,
          }}>
            {label}
          </div>
        )
      }

      {/* Sublabel */}
      {!loading && sublabel && (
        <div style={{ fontSize: 11, color: T.textSecondary }}>
          {sublabel}
        </div>
      )}
      {loading && sublabel !== undefined && (
        <Shimmer width="45%" height={11} radius={4} />
      )}
    </Card>
  );
};

// ─── Card.Stat ────────────────────────────────────────────────────────────────
/**
 * Compact stat — label above, big number below. No icon. Good for dense grids.
 *
 * @param {string}        label
 * @param {string|number} value
 * @param {string}       [unit]   — appended after value in a lighter style
 * @param {string}       [color]  — number colour
 * @param {boolean}      [loading]
 */
Card.Stat = function CardStat({
  label,
  value,
  unit,
  color   = T.primary,
  loading = false,
}) {
  return (
    <Card style={{ padding: "16px 18px" }}>
      {loading ? (
        <>
          <Shimmer width="60%" height={11} radius={4} style={{ marginBottom: 10 }} />
          <Shimmer width="42%" height={22} radius={5} />
        </>
      ) : (
        <>
          <div style={{
            fontSize: 11, fontWeight: 500,
            color: T.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8, fontFamily: T.fontUI,
          }}>
            {label}
          </div>
          <div style={{
            fontSize: 22, fontWeight: 700,
            fontFamily: T.fontData,
            color, letterSpacing: "-0.3px",
            display: "flex", alignItems: "baseline", gap: 4,
          }}>
            {value}
            {unit && (
              <span style={{
                fontSize: 12, fontWeight: 400,
                color: T.textSecondary, fontFamily: T.fontUI,
              }}>
                {unit}
              </span>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

// ─── Card.Panel ───────────────────────────────────────────────────────────────
/**
 * Sectioned card — header (title + optional icon + optional action) /
 * scrollable body / optional footer. Used for activity feeds, approval queues,
 * table containers, settings sections.
 *
 * @param {string}          title
 * @param {string}         [subtitle]
 * @param {React.ReactNode}[icon]
 * @param {string}         [iconColor]
 * @param {React.ReactNode}[action]       — element rendered in header right slot
 * @param {number}         [maxBodyHeight] — px; enables scrolling
 * @param {React.ReactNode}[footer]
 * @param {boolean}        [loading]
 */
Card.Panel = function CardPanel({
  title,
  subtitle,
  icon,
  iconColor = T.primary,
  action,
  children,
  maxBodyHeight,
  footer,
  loading = false,
}) {
  return (
    <Card>
      {/* Header */}
      <Card.Header>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {icon && !loading && (
            <IconBox color={iconColor} size={34}>{icon}</IconBox>
          )}
          {loading && icon && (
            <Shimmer width={34} height={34} radius={10} style={{ flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            {loading
              ? <Shimmer width={130} height={14} radius={4} />
              : (
                <div style={{
                  fontSize: 14, fontWeight: 600, color: T.text,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {title}
                </div>
              )
            }
            {subtitle && !loading && (
              <div style={{ fontSize: 11, color: T.textSecondary, marginTop: 1 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {action && !loading && (
          <div style={{ flexShrink: 0 }}>{action}</div>
        )}
      </Card.Header>

      {/* Body */}
      <div style={{
        maxHeight: maxBodyHeight,
        overflowY: maxBodyHeight ? "auto" : undefined,
      }}>
        {loading ? (
          <div style={{
            padding: "20px",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Shimmer width={36} height={36} radius={10} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <Shimmer width={`${55 + i * 8}%`} height={13} radius={4} />
                  <Shimmer width={`${35 + i * 5}%`} height={11} radius={4} />
                </div>
              </div>
            ))}
          </div>
        ) : children}
      </div>

      {/* Footer */}
      {footer && !loading && (
        <Card.Footer>{footer}</Card.Footer>
      )}
    </Card>
  );
};

// ─── Named sub-component exports ──────────────────────────────────────────────
export const { Header, Body, Footer, KPI, Stat, Panel } = Card;

export default Card;
