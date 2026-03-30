/**
 * Table — production-grade data table for SADE SCM
 *
 * Features:
 *   - Sortable columns (client-side by default, or server-side via onSort)
 *   - Per-column search sub-row (opt-in per column with searchable: true)
 *   - Checkbox multi-selection with select-all + indeterminate state
 *   - Built-in client-side pagination with smart ellipsis
 *   - Loading state (shimmer skeleton rows)
 *   - Empty state with configurable message and optional icon
 *   - Custom cell renderers via column.render(value, row, rowIndex)
 *   - Horizontal scroll with minimum width
 *   - Left-border accent on selected rows
 *
 * Sub-components:
 *   Table.Badge      — status / severity pill
 *   Table.ScoreBar   — fraud score progress bar (0–100)
 *
 * ColumnDef shape:
 * {
 *   key:          string                                   — row object key
 *   label:        string | ReactNode                       — header label
 *   width?:       number | string                          — column width
 *   maxWidth?:    number                                   — cell max-width + ellipsis
 *   align?:       "left" | "center" | "right"             — default "left"
 *   sortable?:    boolean
 *   searchable?:  boolean                                  — shows search input under header
 *   monospace?:   boolean                                  — JetBrains Mono for cell text
 *   render?:      (value, row, rowIndex) => ReactNode
 *   headerStyle?: object
 *   cellStyle?:   object
 * }
 */

import { useState, useMemo, useCallback } from "react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
// Mirrors COLORS / C constants across all page files.
const T = {
  cardBg:         "#FFFFFF",
  cardBorder:     "#E2E8F0",
  headerBg:       "#F8FAFC",
  hoverBg:        "#FAFBFC",
  selectedBg:     "#EFF6FF",
  selectedAccent: "#BFDBFE",
  pageBg:         "#F1F5F9",

  primary:      "#1E40AF",
  primaryLight: "#3B82F6",
  success:      "#059669",
  warning:      "#D97706",
  danger:       "#DC2626",
  accent:       "#F59E0B",

  text:          "#0F172A",
  textSecondary: "#64748B",
  textDisabled:  "#CBD5E1",

  fontUI:   "'DM Sans', system-ui, sans-serif",
  fontData: "'JetBrains Mono', monospace",

  fast:   "150ms ease-out",
  reveal: "250ms cubic-bezier(0.16,1,0.3,1)",
};

// CSS classes and keyframes are in src/styles/components/table.css

// ─── Shimmer block ─────────────────────────────────────────────────────────────
function Shimmer({ width = "65%", height = 13, radius = 5 }) {
  return (
    <div
      className="scm-tbl-shimmer-bg"
      style={{
        display: "inline-block",
        width, height, borderRadius: radius,
        background: "linear-gradient(90deg,#EDF2F7 25%,#E2E8F0 50%,#EDF2F7 75%)",
        backgroundSize: "1200px 100%",
        animation: "scm-tbl-shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// ─── SortIcon ──────────────────────────────────────────────────────────────────
// Paired ▲▼ arrows; active arrow glows in primaryLight.
function SortIcon({ active, dir }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex", flexDirection: "column",
        lineHeight: 0, gap: 1.5, marginLeft: 4,
        verticalAlign: "middle", flexShrink: 0,
      }}
    >
      <span style={{
        fontSize: 7, lineHeight: 1,
        color: active && dir === "asc" ? T.primaryLight : T.textDisabled,
        transition: `color ${T.fast}`,
      }}>▲</span>
      <span style={{
        fontSize: 7, lineHeight: 1,
        color: active && dir === "desc" ? T.primaryLight : T.textDisabled,
        transition: `color ${T.fast}`,
      }}>▼</span>
    </span>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
// Smart ellipsis: always shows page 1, last, current ± 1, with "…" gaps.
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const core = new Set(
    [1, total, current, current - 1, current + 1].filter(p => p >= 1 && p <= total)
  );
  const sorted = [...core].sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

function Pagination({ page, totalRows, perPage, onPage, onPerPage, pageSizeOptions, entityLabel }) {
  const totalPages = Math.ceil(totalRows / perPage);
  const start = Math.min((page - 1) * perPage + 1, totalRows);
  const end   = Math.min(page * perPage, totalRows);

  return (
    <div className="scm-table-pagination">
      {/* Left: per-page selector + row count */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>Sayfa başına:</span>
        <select
          className="scm-per-page-select"
          value={perPage}
          onChange={e => { onPerPage(+e.target.value); onPage(1); }}
        >
          {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {totalRows > 0 ? (
          <span style={{ marginLeft: 4 }}>
            <strong style={{ color: "var(--color-text-primary)" }}>{totalRows}</strong>
            {" "}{entityLabel}dan {start}–{end} gösteriliyor
          </span>
        ) : (
          <span>Kayıt yok</span>
        )}
      </div>

      {/* Right: page buttons */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            disabled={page <= 1}
            onClick={() => onPage(1)}
            className="scm-pagination-btn"
            aria-label="İlk sayfa"
          >⏮</button>
          <button
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="scm-pagination-btn"
            aria-label="Önceki sayfa"
          >‹</button>

          {getPageNumbers(page, totalPages).map((p, i) =>
            p === "…"
              ? (
                <span
                  key={`ellipsis-${i}`}
                  style={{ padding: "0 4px", fontSize: 12 }}
                >…</span>
              )
              : (
                <button
                  key={p}
                  onClick={() => onPage(p)}
                  className={`scm-pagination-btn${page === p ? " scm-pagination-btn--active" : ""}`}
                  aria-label={`Sayfa ${p}`}
                  aria-current={page === p ? "page" : undefined}
                >{p}</button>
              )
          )}

          <button
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
            className="scm-pagination-btn"
            aria-label="Sonraki sayfa"
          >›</button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPage(totalPages)}
            className="scm-pagination-btn"
            aria-label="Son sayfa"
          >⏭</button>
        </div>
      )}
    </div>
  );
}

// ─── Table.Badge ───────────────────────────────────────────────────────────────
/**
 * Status / severity pill.
 * Pass either a { config } object or individual { label, bg, color, border } props.
 *
 * @example
 * <Table.Badge config={STATUS_CONFIG["Open"]} />
 * <Table.Badge label="Kritik" bg="#FEE2E2" color="#991B1B" border="#FECACA" />
 */
function TableBadge({ config, label, bg, color, border }) {
  const c = config ?? { label, bg, color, border };
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 6,
      fontSize: 11.5, fontWeight: 600,
      fontFamily: T.fontUI,
      background: c.bg   ?? T.pageBg,
      color:      c.color ?? T.textSecondary,
      border:     `1px solid ${c.border ?? T.cardBorder}`,
      whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  );
}

// ─── Table.ScoreBar ────────────────────────────────────────────────────────────
/**
 * Fraud score progress bar used in transaction tables.
 *
 * @param {number} score — 0 to 100
 */
function TableScoreBar({ score }) {
  const pct   = Math.min(100, Math.max(0, Number(score) || 0));
  const color = pct >= 75 ? T.danger
              : pct >= 50 ? T.accent
              : pct >= 25 ? T.warning
              : T.success;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
      <div style={{
        flex: 1, height: 5, borderRadius: 99,
        background: T.pageBg, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color, borderRadius: 99,
          transition: "width 0.3s ease",
        }} />
      </div>
      <span style={{
        fontSize: 11.5, fontWeight: 700,
        fontFamily: T.fontData,
        color, minWidth: 28, textAlign: "right",
      }}>{pct}</span>
    </div>
  );
}

// ─── Table (main) ──────────────────────────────────────────────────────────────
/**
 * Production-grade data table.
 *
 * @param {ColumnDef[]} columns
 * @param {object[]}    rows
 * @param {string}     [keyProp="id"]           — unique key field on each row
 *
 * Sorting:
 * @param {string}            [defaultSortCol]  — initial sort column key
 * @param {"asc"|"desc"}      [defaultSortDir]
 * @param {Function}          [onSort]          — (col, dir) => void for server-side sort
 *
 * Selection:
 * @param {boolean}           [selectable]           — show checkbox column
 * @param {Set}               [selectedKeys]          — controlled; omit for uncontrolled
 * @param {Function}          [onSelectionChange]     — (Set) => void
 *
 * Pagination:
 * @param {boolean}           [paginate=true]
 * @param {number}            [defaultPageSize=10]
 * @param {number[]}          [pageSizeOptions=[10,25,50]]
 * @param {string}            [entityLabel="kayıt"]  — used in "X kayıtdan Y–Z gösteriliyor"
 *
 * State:
 * @param {boolean}           [loading]
 * @param {number}            [loadingRows=5]
 * @param {string}            [emptyMessage]
 * @param {ReactNode}         [emptyIcon]
 *
 * Layout:
 * @param {number}            [minWidth=700]    — minimum table width in px
 * @param {Function}          [onRowClick]      — (row) => void
 * @param {object}            [style]
 */
export function Table({
  columns = [],
  rows = [],
  keyProp = "id",

  // Sort
  defaultSortCol,
  defaultSortDir = "asc",
  onSort,

  // Selection
  selectable = false,
  selectedKeys,
  onSelectionChange,

  // Pagination
  paginate = true,
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  entityLabel = "kayıt",

  // State
  loading = false,
  loadingRows = 5,
  emptyMessage = "Kayıt bulunamadı.",
  emptyIcon,

  // Layout
  minWidth = 700,
  onRowClick,
  style = {},
}) {
  // ── Internal state ────────────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState(defaultSortCol ?? null);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [colSearch, setColSearch] = useState({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPageSize);
  const [_selected, _setSelected] = useState(new Set());

  // Controlled vs uncontrolled selection
  const isControlledSel = selectedKeys !== undefined;
  const selection    = isControlledSel ? selectedKeys : _selected;
  const setSelection = isControlledSel ? onSelectionChange : _setSelected;

  // Whether the search sub-row should render
  const hasSearchRow = columns.some(c => c.searchable);

  // Prepend checkbox column when selectable
  const allCols = useMemo(() => {
    if (!selectable) return columns;
    return [{ key: "__check", label: "", width: 44, _isCheckbox: true }, ...columns];
  }, [columns, selectable]);

  // ── Data pipeline: filter → sort → paginate ───────────────────────────────
  const searched = useMemo(() => {
    if (!rows?.length) return [];
    return rows.filter(row =>
      columns.every(col => {
        if (!col.searchable) return true;
        const term = (colSearch[col.key] ?? "").toLowerCase().trim();
        if (!term) return true;
        return String(row[col.key] ?? "").toLowerCase().includes(term);
      })
    );
  }, [rows, colSearch, columns]);

  const sorted = useMemo(() => {
    if (onSort) return searched;         // server-side: caller controls order
    if (!sortCol) return searched;
    return [...searched].sort((a, b) => {
      const cmp = String(a[sortCol] ?? "").localeCompare(
        String(b[sortCol] ?? ""), "tr", { numeric: true }
      );
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [searched, sortCol, sortDir, onSort]);

  const totalRows = sorted.length;
  const paginated = useMemo(() => {
    if (!paginate) return sorted;
    return sorted.slice((page - 1) * perPage, page * perPage);
  }, [sorted, paginate, page, perPage]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSort = useCallback(key => {
    const newDir = sortCol === key && sortDir === "asc" ? "desc" : "asc";
    setSortCol(key);
    setSortDir(newDir);
    setPage(1);
    onSort?.(key, newDir);
  }, [sortCol, sortDir, onSort]);

  const updateColSearch = useCallback((key, val) => {
    setColSearch(prev => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  // ── Selection helpers ─────────────────────────────────────────────────────
  const pageKeys        = useMemo(() => paginated.map(r => r[keyProp]), [paginated, keyProp]);
  const allPageSelected = pageKeys.length > 0 && pageKeys.every(k => selection.has(k));
  const someSelected    = pageKeys.some(k => selection.has(k));

  const toggleAll = useCallback(() => {
    const next = new Set(selection);
    if (allPageSelected) pageKeys.forEach(k => next.delete(k));
    else pageKeys.forEach(k => next.add(k));
    setSelection(next);
  }, [allPageSelected, pageKeys, selection, setSelection]);

  const toggleRow = useCallback(key => {
    const next = new Set(selection);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelection(next);
  }, [selection, setSelection]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={style}>

      {/* ── Scrollable table ────────────────────────────────────────────── */}
      <div style={{ overflowX: "auto" }}>
        <table className="scm-table" style={{ minWidth }}>

          {/* ── Head ──────────────────────────────────────────────────── */}
          <thead>
            {/* Column label row */}
            <tr>
              {allCols.map(col => {
                if (col._isCheckbox) {
                  return (
                    <th key="__check" style={{
                      width: col.width ?? 44,
                      textAlign: "center",
                      borderBottomWidth: hasSearchRow ? 1 : 2,
                    }}>
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={el => { if (el) el.indeterminate = someSelected && !allPageSelected; }}
                        onChange={toggleAll}
                        aria-label="Tümünü seç"
                        style={{ width: 15, height: 15, cursor: "pointer", accentColor: "var(--color-primary)" }}
                      />
                    </th>
                  );
                }

                const isActive = sortCol === col.key;
                return (
                  <th
                    key={col.key}
                    className={[
                      col.sortable ? "sortable" : "",
                      isActive ? "active" : "",
                    ].filter(Boolean).join(" ") || undefined}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    style={{
                      textAlign: col.align ?? "left",
                      width: col.width ?? "auto",
                      borderBottomWidth: hasSearchRow ? 1 : 2,
                      ...col.headerStyle,
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                      {col.label}
                      {col.sortable && <SortIcon active={isActive} dir={sortDir} />}
                    </span>
                  </th>
                );
              })}
            </tr>

            {/* Column search sub-row */}
            {hasSearchRow && (
              <tr>
                {allCols.map(col => (
                  <th
                    key={`search-${col.key}`}
                    style={{ padding: "0 8px 8px" }}
                  >
                    {col.searchable ? (
                      <input
                        className="scm-tbl-search-input"
                        value={colSearch[col.key] ?? ""}
                        onChange={e => updateColSearch(col.key, e.target.value)}
                        placeholder="Ara..."
                        aria-label={`${typeof col.label === "string" ? col.label : col.key} filtrele`}
                      />
                    ) : <div />}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          {/* ── Body ──────────────────────────────────────────────────── */}
          <tbody className="scm-tbody">

            {/* Loading skeleton */}
            {loading && Array.from({ length: loadingRows }).map((_, ri) => (
              <tr key={`skeleton-${ri}`}>
                {allCols.map((col, ci) => (
                  <td key={col.key}>
                    {col._isCheckbox
                      ? <Shimmer width={15} height={15} radius={3} />
                      : <Shimmer width={`${45 + ((ri * 17 + ci * 11) % 38)}%`} height={13} />
                    }
                  </td>
                ))}
              </tr>
            ))}

            {/* Empty state */}
            {!loading && paginated.length === 0 && (
              <tr>
                <td
                  colSpan={allCols.length}
                  style={{ padding: "48px 24px", textAlign: "center" }}
                >
                  {emptyIcon && (
                    <div style={{ fontSize: 30, marginBottom: 10, color: "var(--color-text-disabled)", lineHeight: 1 }}>
                      {emptyIcon}
                    </div>
                  )}
                  <div style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && paginated.map((row, ri) => {
              const key        = row[keyProp];
              const isSelected = selection.has(key);
              return (
                <tr
                  key={key ?? ri}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? "button" : undefined}
                  aria-selected={isSelected || undefined}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={onRowClick
                    ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick(row); } }
                    : undefined}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {allCols.map(col => {
                    if (col._isCheckbox) {
                      return (
                        <td
                          key="__check"
                          style={{ padding: "11px 12px", textAlign: "center" }}
                          onClick={e => { e.stopPropagation(); toggleRow(key); }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(key)}
                            onClick={e => e.stopPropagation()}
                            aria-label="Satırı seç"
                            style={{ width: 15, height: 15, cursor: "pointer", accentColor: T.primary }}
                          />
                        </td>
                      );
                    }

                    const value = row[col.key];
                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: "11px 12px",
                          textAlign: col.align ?? "left",
                          fontFamily: col.monospace ? T.fontData : T.fontUI,
                          maxWidth: col.maxWidth,
                          overflow: col.maxWidth ? "hidden" : undefined,
                          textOverflow: col.maxWidth ? "ellipsis" : undefined,
                          whiteSpace: col.maxWidth ? "nowrap" : undefined,
                          ...col.cellStyle,
                        }}
                      >
                        {col.render ? col.render(value, row, ri) : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {paginate && !loading && (
        <Pagination
          page={page}
          totalRows={totalRows}
          perPage={perPage}
          onPage={setPage}
          onPerPage={p => { setPerPage(p); setPage(1); }}
          pageSizeOptions={pageSizeOptions}
          entityLabel={entityLabel}
        />
      )}
    </div>
  );
}

// ─── Sub-component attachments ─────────────────────────────────────────────────
Table.Badge    = TableBadge;
Table.ScoreBar = TableScoreBar;

export default Table;
