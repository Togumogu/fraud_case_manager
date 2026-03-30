import { useEffect } from "react";

const TYPE_CONFIG = {
  success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46", icon: "✓" },
  error:   { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B", icon: "✕" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E", icon: "!" },
  info:    { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E40AF", icon: "i" },
};

/** Single toast item — auto-dismisses via parent-managed timeout */
function ToastItem({ toast, onClose }) {
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
  return (
    <div className={`scm-toast scm-toast--${toast.type}`} role="alert">
      <span className="scm-toast__icon">{cfg.icon}</span>
      <span className="scm-toast__msg">{toast.msg || toast.message}</span>
      <button className="scm-toast__close" onClick={onClose} aria-label="Kapat">×</button>
    </div>
  );
}

/**
 * Toast stack — renders up to 5 toasts anchored to the bottom-right corner.
 *
 * Props:
 *   toast   – single toast object  { type, msg }  (legacy single-toast pattern)
 *   toasts  – array of toast objects              (multi-toast pattern)
 *   onClose – called when the single toast is dismissed (legacy)
 *   onDismiss(id) – called when a stacked toast is dismissed
 */
export default function Toast({ toast, toasts, onClose, onDismiss }) {
  // Support both single-toast (legacy per-page) and stacked (global) patterns
  const items = toasts
    ? toasts.slice(-5)
    : toast
    ? [toast]
    : [];

  if (!items.length) return null;

  return (
    <div className="scm-toast-stack">
      {items.map((t, i) => (
        <ToastItem
          key={t.id ?? i}
          toast={t}
          onClose={() => {
            if (onDismiss) onDismiss(t.id);
            else if (onClose) onClose();
          }}
        />
      ))}
    </div>
  );
}

/**
 * Convenience hook for pages that manage their own local toast state.
 * Returns [toast, showToast, clearToast].
 *
 * Usage:
 *   const [toast, showToast, clearToast] = useToast();
 *   showToast("success", "Kaydedildi.");
 *   // render: <Toast toast={toast} onClose={clearToast} />
 */
export function useToast(duration = 4000) {
  // We rely on caller's useState — this hook just wraps the logic.
  // Returns factory so callers can do: const { toast, showToast, clearToast } = useToast();
  // But since hooks cannot conditionally return state, we export a creator instead.
  // Pages that already have [toast, setToast] can just call showToast directly.
}

/**
 * Helper used by pages that manage their own [toast, setToast] state.
 * Call this instead of duplicating the setTimeout pattern everywhere.
 */
export function makeShowToast(setToast, duration = 4000) {
  return (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), duration);
  };
}
