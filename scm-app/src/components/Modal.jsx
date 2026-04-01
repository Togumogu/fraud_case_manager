/**
 * Modal — generic overlay + dialog wrapper for NEXUS
 *
 * Usage:
 *   {showModal && (
 *     <Modal title="Vakayı Kapat" onClose={() => setShowModal(false)}>
 *       <p>Modal içerik buraya</p>
 *       <Modal.Footer>
 *         <Modal.Button label="İptal" onClick={() => setShowModal(false)} />
 *         <Modal.Button label="Kaydet" primary onClick={handleSave} />
 *       </Modal.Footer>
 *     </Modal>
 *   )}
 *
 * Sub-components:
 *   Modal.Footer   — flex row pinned at the bottom of the body, right-aligned
 *   Modal.Button   — action button (default / primary / danger / disabled)
 *   Modal.Section  — padded content block with optional border-top divider
 *
 * Props:
 *   title    {string}              — header title text
 *   onClose  {Function}           — called on backdrop click or Escape key
 *   width    {number}             — panel width in px (default 520)
 *   children {ReactNode}
 *
 * Keyboard: Escape closes the modal when onClose is provided.
 * Animation: backdrop fade-in + panel scale-in.
 * Styling via CSS classes (src/styles/components/modal.css).
 */

import { useEffect } from "react";

// ─── Close icon ────────────────────────────────────────────────────────────────
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>
  );
}

// ─── Modal (root) ──────────────────────────────────────────────────────────────
export default function Modal({ title, onClose, width = 520, children }) {
  useEffect(() => {
    if (!onClose) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="scm-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="scm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scm-modal-title"
        style={{ width }}
      >
        {/* Header */}
        <div className="scm-modal__header">
          <h3 id="scm-modal-title" className="scm-modal__title">
            {title}
          </h3>
          {onClose && (
            <button
              className="scm-modal__close"
              onClick={onClose}
              aria-label="Kapat"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="scm-modal__body">
          {children}
        </div>
      </div>
    </>
  );
}

// ─── Modal.Footer ──────────────────────────────────────────────────────────────
Modal.Footer = function ModalFooter({ children, style = {} }) {
  return (
    <div className="scm-modal__footer" style={style}>
      {children}
    </div>
  );
};

// ─── Modal.Button ──────────────────────────────────────────────────────────────
/**
 * @param {string}   label
 * @param {Function} onClick
 * @param {boolean}  primary  — filled blue (CTA)
 * @param {boolean}  danger   — filled red (destructive)
 * @param {boolean}  disabled
 * @param {string}  [bg]      — override fill for custom colour buttons
 */
Modal.Button = function ModalButton({ label, onClick, primary = false, danger = false, disabled = false, bg: customBg }) {
  const filled = primary || danger || !!customBg;
  const bgVal  = disabled ? "#CBD5E1"
               : customBg ? customBg
               : primary  ? "var(--color-primary)"
               : danger   ? "var(--color-danger)"
               : "var(--color-bg-surface)";
  const clrVal = (filled || disabled) ? "#fff" : "var(--color-text-primary)";
  const bdrVal = (filled || disabled) ? "none" : "1px solid var(--color-border)";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "9px 22px",
        borderRadius: "var(--radius-lg)",
        border: bdrVal,
        background: bgVal,
        color: clrVal,
        fontSize: "var(--text-base)",
        fontWeight: filled ? 600 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-ui)",
        transition: "opacity 0.15s ease",
        lineHeight: 1.4,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {label}
    </button>
  );
};

// ─── Modal.Section ─────────────────────────────────────────────────────────────
Modal.Section = function ModalSection({ children, borderTop = false, style = {} }) {
  return (
    <div style={{
      ...(borderTop ? { borderTop: "1px solid var(--color-border)", paddingTop: 16, marginTop: 16 } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
};
