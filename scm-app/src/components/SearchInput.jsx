import { useRef } from "react";

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Fraud Case Manager — SearchInput
 *
 * Controlled search input with a left magnifier icon and an animated
 * clear (×) button that appears only when the input has a value.
 *
 * @param {string}   value        - Controlled value
 * @param {function} onChange     - Standard input onChange handler
 * @param {string}   [placeholder="Ara..."]
 * @param {"sm"|"md"|"lg"} [size="md"]
 * @param {boolean}  [disabled=false]
 * @param {string}   [className]  - Extra class(es) on the wrapper
 * @param {object}   [style]      - Inline style on the wrapper (use for flex/width)
 * @param {string}   [id]         - id forwarded to the <input>
 * @param {string}   [aria-label] - Accessible label (defaults to placeholder)
 */
export default function SearchInput({
  value = "",
  onChange,
  placeholder = "Ara...",
  size = "md",
  disabled = false,
  className = "",
  style,
  id,
  "aria-label": ariaLabel,
}) {
  const inputRef = useRef(null);
  const filled = value.length > 0;

  const handleClear = () => {
    onChange?.({ target: { value: "" } });
    inputRef.current?.focus();
  };

  const wrapperClass = [
    "scm-search",
    `scm-search--${size}`,
    filled ? "scm-search--filled" : "",
    disabled ? "scm-search--disabled" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={wrapperClass} style={style}>
      <span className="scm-search__icon" aria-hidden="true">
        <SearchIcon />
      </span>

      <input
        ref={inputRef}
        id={id}
        type="search"
        className="scm-search__input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel ?? placeholder}
        autoComplete="off"
        spellCheck="false"
      />

      <button
        type="button"
        className="scm-search__clear"
        onClick={handleClear}
        aria-label="Aramayı temizle"
        tabIndex={filled ? 0 : -1}
      >
        <ClearIcon />
      </button>
    </div>
  );
}
