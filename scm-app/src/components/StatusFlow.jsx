/**
 * StatusFlow — horizontal case status pipeline indicator.
 *
 * Shows: Open → Pending Closure → Closed
 * Active node glows and pulses. Completed nodes show a checkmark.
 * Non-standard statuses (Pending Delete, Pending Reopen) fall back to a badge.
 *
 * @param {string} status — case status string
 */

const STEPS = [
  { key: "Open",            label: "Açık",              labelEn: "Open"            },
  { key: "Pending Closure", label: "Kapatma Bekliyor",  labelEn: "Pending Closure" },
  { key: "Closed",          label: "Kapatıldı",         labelEn: "Closed"          },
];

const STEP_COLORS = {
  complete: "#059669",
  active:   "#1E40AF",
  future:   "#CBD5E1",
};

// Checkmark SVG
function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StatusFlow({ status }) {
  // Non-standard statuses — render a simple badge instead
  const nonStandard = ["Pending Delete", "Pending Reopen", "Deleted"];
  if (nonStandard.includes(status)) {
    const cfg = {
      "Pending Delete":  { label: "Silme Bekliyor",    bg: "#FEE2E2", color: "#991B1B" },
      "Pending Reopen":  { label: "Yeniden Açma",      bg: "#EDE9FE", color: "#5B21B6" },
      "Deleted":         { label: "Silindi",            bg: "#FEE2E2", color: "#991B1B" },
    }[status] || { label: status, bg: "#F3F4F6", color: "#374151" };
    return (
      <span style={{
        display: "inline-flex", alignItems: "center",
        padding: "4px 12px", borderRadius: 999,
        background: cfg.bg, color: cfg.color,
        fontSize: 12, fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {cfg.label}
      </span>
    );
  }

  const activeIdx = STEPS.findIndex(s => s.key === status);
  const effectiveIdx = activeIdx === -1 ? 0 : activeIdx;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes scm-status-glow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(30,64,175,0.20); }
          50%       { box-shadow: 0 0 0 8px rgba(30,64,175,0.05); }
        }
        .scm-status-node-active {
          animation: scm-status-glow 2s ease-in-out infinite;
        }
      `}</style>

      {STEPS.map((step, i) => {
        const isComplete = i < effectiveIdx;
        const isActive   = i === effectiveIdx;

        const nodeColor = isComplete ? STEP_COLORS.complete
                        : isActive   ? STEP_COLORS.active
                        :              STEP_COLORS.future;

        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
            {/* Connector line before this node (except first) */}
            {i > 0 && (
              <div style={{
                width: 36, height: 2,
                background: i <= effectiveIdx ? STEP_COLORS.complete : STEP_COLORS.future,
                transition: "background 0.4s ease",
                ...(i > effectiveIdx ? { backgroundImage: `repeating-linear-gradient(90deg, ${STEP_COLORS.future} 0, ${STEP_COLORS.future} 4px, transparent 4px, transparent 8px)`, background: "none" } : {}),
              }} />
            )}

            {/* Node + label */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div
                className={isActive ? "scm-status-node-active" : ""}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: isComplete || isActive ? nodeColor : "transparent",
                  border: `2px solid ${nodeColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
              >
                {isComplete ? (
                  <Check />
                ) : isActive ? (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                ) : null}
              </div>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                color: isComplete ? STEP_COLORS.complete
                     : isActive   ? STEP_COLORS.active
                     :              STEP_COLORS.future,
                whiteSpace: "nowrap",
                transition: "color 0.3s ease",
              }}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
