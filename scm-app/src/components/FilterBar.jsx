/**
 * SADE SCM — FilterBar
 *
 * Composable filter system. Use FilterBar.Toggle for the button and
 * FilterBar.Panel as the collapsible container for filter groups.
 *
 * Sub-components (attach as children of FilterBar.Panel):
 *   FilterBar.ChipGroup   — multi-select toggle chips (status, severity…)
 *   FilterBar.Select      — single-select <select> dropdown
 *   FilterBar.Input       — free-text filter field
 *   FilterBar.DateRange   — paired date inputs (from — to)
 *   FilterBar.NumberRange — paired numeric inputs (min — max)
 *
 * Usage:
 *   // In the toolbar row:
 *   <FilterBar.Toggle open={showFilters} onToggle={…} activeCount={2} />
 *
 *   // Below the toolbar row (sibling, not child):
 *   {showFilters && (
 *     <FilterBar.Panel onReset={resetFilters}>
 *       <FilterBar.ChipGroup label="DURUM" options={statusOpts} selected={filters.status} onToggle={toggleStatus} />
 *       <FilterBar.Select label="ATANAN" value={filters.owner} onChange={…} options={ownerOpts} />
 *       <FilterBar.DateRange label="TARİH" from={filters.dateFrom} to={filters.dateTo} onFromChange={…} onToChange={…} />
 *     </FilterBar.Panel>
 *   )}
 */

const FilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ResetIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
  </svg>
);

// ─── FilterBar.Toggle ─────────────────────────────────────

/**
 * The toggle button that opens/closes the filter panel.
 *
 * @param {boolean}  open        - Whether the panel is currently open
 * @param {function} onToggle    - Called on click
 * @param {number}   [activeCount=0] - Number of active filters (shows badge)
 */
function FilterBarToggle({ open, onToggle, activeCount = 0 }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`scm-filter-toggle${open ? " scm-filter-toggle--active" : ""}`}
      aria-expanded={open}
      aria-controls="scm-filter-panel"
    >
      <FilterIcon />
      Filtreler
      {activeCount > 0 && (
        <span
          className="scm-filter-badge"
          aria-label={`${activeCount} aktif filtre`}
        >
          {activeCount}
        </span>
      )}
    </button>
  );
}

// ─── FilterBar.Panel ─────────────────────────────────────

/**
 * The collapsible filter panel. Render conditionally based on `open` state.
 * Place after the toolbar row in your layout.
 *
 * @param {function} [onReset] - Called when the "Filtreleri Sıfırla" button is clicked
 * @param {ReactNode} children - FilterBar.ChipGroup, Select, Input, etc.
 * @param {object}   [style]   - Extra inline styles on the panel wrapper
 */
function FilterBarPanel({ onReset, children, style }) {
  return (
    <div
      className="scm-filter-panel"
      id="scm-filter-panel"
      role="region"
      aria-label="Filtre Paneli"
      style={style}
    >
      {children}
      {onReset && (
        <button type="button" className="scm-filter-reset" onClick={onReset}>
          <ResetIcon /> Filtreleri Sıfırla
        </button>
      )}
    </div>
  );
}

// ─── FilterBar.ChipGroup ──────────────────────────────────

/**
 * A row of toggle chips for multi-select filters (e.g. status, severity).
 *
 * @param {string}   label    - Section heading shown above chips (e.g. "DURUM")
 * @param {Array<{key: string, label: string, bg: string, color: string, border: string}>} options
 * @param {string[]} selected - Currently selected keys
 * @param {function} onToggle - Called with the toggled key
 */
function FilterBarChipGroup({ label, options, selected, onToggle }) {
  return (
    <div className="scm-filter-group" role="group" aria-label={label}>
      <span className="scm-filter-group__label">{label}</span>
      <div className="scm-filter-chips">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              className={`scm-filter-chip${isSelected ? " scm-filter-chip--selected" : ""}`}
              style={
                isSelected
                  ? { background: opt.bg, color: opt.color, borderColor: opt.border }
                  : undefined
              }
              onClick={() => onToggle(opt.key)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── FilterBar.Select ─────────────────────────────────────

/**
 * Single-select dropdown filter.
 *
 * @param {string}   label   - Section heading (uppercase label)
 * @param {string}   value   - Controlled value
 * @param {function} onChange
 * @param {Array<{value: string, label: string}>} options
 * @param {object}   [style] - Extra style on the <select>
 */
function FilterBarSelect({ label, value, onChange, options, style }) {
  return (
    <div className="scm-filter-group">
      <label className="scm-filter-group__label">{label}</label>
      <select
        className="scm-select"
        value={value}
        onChange={onChange}
        style={{ minWidth: 150, ...style }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── FilterBar.Input ──────────────────────────────────────

/**
 * Free-text filter input field.
 *
 * @param {string}   label
 * @param {string}   value
 * @param {function} onChange
 * @param {string}   [placeholder]
 * @param {object}   [style] - Extra style on the <input>
 */
function FilterBarInput({ label, value, onChange, placeholder = "", style }) {
  return (
    <div className="scm-filter-group">
      <label className="scm-filter-group__label">{label}</label>
      <input
        type="text"
        className="scm-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ minWidth: 160, ...style }}
      />
    </div>
  );
}

// ─── FilterBar.DateRange ──────────────────────────────────

/**
 * Paired date inputs for a from–to date range filter.
 *
 * @param {string}   label
 * @param {string}   from        - ISO date string (YYYY-MM-DD)
 * @param {string}   to
 * @param {function} onFromChange
 * @param {function} onToChange
 */
function FilterBarDateRange({ label, from, to, onFromChange, onToChange }) {
  return (
    <div className="scm-filter-group">
      <span className="scm-filter-group__label">{label}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="date"
          className="scm-input"
          value={from}
          onChange={onFromChange}
          aria-label="Başlangıç tarihi"
        />
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1 }}>—</span>
        <input
          type="date"
          className="scm-input"
          value={to}
          onChange={onToChange}
          aria-label="Bitiş tarihi"
        />
      </div>
    </div>
  );
}

// ─── FilterBar.NumberRange ────────────────────────────────

/**
 * Paired numeric inputs for a min–max range filter.
 *
 * @param {string}   label
 * @param {string}   min
 * @param {string}   max
 * @param {function} onMinChange
 * @param {function} onMaxChange
 * @param {string}   [placeholderMin="Min"]
 * @param {string}   [placeholderMax="Max"]
 * @param {object}   [inputStyle] - Extra style on each numeric input
 */
function FilterBarNumberRange({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  placeholderMin = "Min",
  placeholderMax = "Max",
  inputStyle,
}) {
  return (
    <div className="scm-filter-group">
      <span className="scm-filter-group__label">{label}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="number"
          className="scm-input"
          value={min}
          onChange={onMinChange}
          placeholder={placeholderMin}
          aria-label={`${label} minimum`}
          style={{ width: 90, ...inputStyle }}
        />
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1 }}>—</span>
        <input
          type="number"
          className="scm-input"
          value={max}
          onChange={onMaxChange}
          placeholder={placeholderMax}
          aria-label={`${label} maksimum`}
          style={{ width: 90, ...inputStyle }}
        />
      </div>
    </div>
  );
}

// ─── Namespace export ─────────────────────────────────────

const FilterBar = {
  Toggle: FilterBarToggle,
  Panel: FilterBarPanel,
  ChipGroup: FilterBarChipGroup,
  Select: FilterBarSelect,
  Input: FilterBarInput,
  DateRange: FilterBarDateRange,
  NumberRange: FilterBarNumberRange,
};

export default FilterBar;
