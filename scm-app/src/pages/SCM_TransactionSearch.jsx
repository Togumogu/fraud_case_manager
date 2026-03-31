import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import FilterBar from "../components/FilterBar";
import { fdm } from "../api/client";
import { DOMAIN_TO_SOURCE } from "../data/mockData";

// ─── Mock Data ───
const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", roleLabel: "Fraud Analist" },
  manager: { id: 2, name: "Burak Şen", role: "manager", roleLabel: "Yönetici" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", roleLabel: "Admin" },
  super: { id: 4, name: "Toygun Baysal", role: "super", roleLabel: "Super Admin" },
};

const FRAUD_DOMAINS = [
  { id: "payment", label: "Payment Fraud", icon: "₺", color: "#0891B2" },
  { id: "credit_card", label: "Credit Card Fraud", icon: "💳", color: "#8B5CF6" },
  { id: "application", label: "Application Fraud", icon: "📋", color: "#F59E0B" },
  { id: "account_takeover", label: "Account Takeover", icon: "🔓", color: "#EF4444" },
  { id: "internal", label: "Internal Fraud", icon: "🏢", color: "#6366F1" },
];

const FX_RATES = {
  TRY: { TRY: 1, USD: 0.0278, EUR: 0.0256 },
  USD: { TRY: 36.0, USD: 1, EUR: 0.92 },
  EUR: { TRY: 39.0, USD: 1.087, EUR: 1 },
};
const convertAmount = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  return Math.round(amount * FX_RATES[fromCurrency][toCurrency]);
};
const formatCurrency = (amount, currency) => {
  const symbols = { TRY: "₺", USD: "$", EUR: "€" };
  return `${symbols[currency] || ""}${amount.toLocaleString("tr-TR")}`;
};


function normalizeTransaction(t) {
  return {
    id: t.id, source: t.source,
    sourceLabel: t.source_label, sourceColor: t.source_color,
    entityType: t.entity_type, entityKey: t.entity_key,
    severity: t.severity, score: t.score,
    triggerRule: t.trigger_rule, markStatus: t.mark_status,
    createDate: t.create_date, caseId: t.case_id,
    amount: t.amount, currency: t.currency,
    customerName: t.customer_name, customerNo: t.customer_no,
  };
}

const NOTIFICATIONS = [
  { id: 1, msg: "Vaka #2471 için onay talebi gönderildi", time: "5 dk önce", unread: true },
  { id: 2, msg: "Yeni yorum: Vaka #2468", time: "12 dk önce", unread: true },
  { id: 3, msg: "Vaka #2465 durumu güncellendi", time: "1 saat önce", unread: false },
];

// ─── Icons ───
const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  CaseCreate: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Cases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  TransactionSearch: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Globe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Info: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  SortAsc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7-7 7 7"/></svg>,
  SortDesc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>,
  ArrowRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

// ─── Style Constants ───
const C = {
  sidebar: "#0F172A", sidebarHover: "#1E293B",
  primary: "#1E40AF", primaryLight: "#3B82F6", primaryBg: "#EFF6FF",
  bg: "#F1F5F9", text: "#0F172A", textSecondary: "#64748B",
  border: "#E2E8F0", success: "#059669", warning: "#D97706", danger: "#DC2626",
};

const SEVERITY_STYLES = {
  Critical: { label: "Kritik", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  High: { label: "Yüksek", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  Medium: { label: "Orta", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  Low: { label: "Düşük", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};
const STATUS_STYLES = {
  "Marked": { label: "İşaretli", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  "Unmarked": { label: "İşaretsiz", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
  "Case Assigned": { label: "Vakaya Atandı", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  "Under Review": { label: "İncelemede", bg: "#F3E8FF", color: "#6B21A8", border: "#DDD6FE" },
};

const Badge = ({ config }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 6,
    fontSize: 11, fontWeight: 600, background: config.bg, color: config.color,
    border: `1px solid ${config.border}`, whiteSpace: "nowrap",
  }}>{config.label}</span>
);



// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════
export default function SCMTransactionSearch({ onNavigate, currentRole = "analyst", onRoleChange, selectedDomain = "payment", onDomainChange, transactions: txnsProp, notifications = [], onMarkAllRead, onMarkRead } = {}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({ markStatus: [], entityType: "", entityId: "", scoreMin: "", scoreMax: "", dateFrom: "", dateTo: "", amountMin: "", amountMax: "" });
  const [colSearch, setColSearch] = useState({ id: "", entityType: "", entityKey: "", score: "", markStatus: "", date: "", amount: "", customer: "" });
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [displayCurrency, setDisplayCurrency] = useState("original");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [drawerTxn, setDrawerTxn] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = {
      domain: DOMAIN_TO_SOURCE[selectedDomain],
      page, limit: perPage,
      search: debouncedSearch || undefined,
      mark_status: filters.markStatus.length === 1 ? filters.markStatus[0] : undefined,
      entity_type: filters.entityType || undefined,
      entity_key: filters.entityId || undefined,
      score_min: filters.scoreMin || undefined,
      score_max: filters.scoreMax || undefined,
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
      min_amount: filters.amountMin || undefined,
      max_amount: filters.amountMax || undefined,
    };
    fdm.transactions(params).then(result => {
      if (!cancelled) {
        setTransactions(result.data.map(normalizeTransaction));
        setTotalCount(result.total);
      }
    }).catch(() => {
      if (!cancelled) { setTransactions([]); setTotalCount(0); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedDomain, page, perPage, debouncedSearch,
      filters.entityType, filters.entityId, filters.scoreMin, filters.scoreMax,
      filters.dateFrom, filters.dateTo, filters.amountMin, filters.amountMax]);

  const activeFilterCount = Object.entries(filters).reduce((c, [k, v]) => c + (Array.isArray(v) ? v.length : (v ? 1 : 0)), 0);

  const filtered = transactions.filter(t => {
    if (colSearch.id && !t.id.toLowerCase().includes(colSearch.id.toLowerCase())) return false;
    if (colSearch.entityType && !t.entityType.toLowerCase().includes(colSearch.entityType.toLowerCase())) return false;
    if (colSearch.entityKey && !t.entityKey.toLowerCase().includes(colSearch.entityKey.toLowerCase())) return false;
    if (colSearch.score && !String(t.score).includes(colSearch.score) && !t.severity.toLowerCase().includes(colSearch.score.toLowerCase())) return false;
    if (colSearch.markStatus && !t.markStatus.toLowerCase().includes(colSearch.markStatus.toLowerCase()) && !(STATUS_STYLES[t.markStatus]?.label || "").toLowerCase().includes(colSearch.markStatus.toLowerCase())) return false;
    if (colSearch.date && !t.createDate.includes(colSearch.date)) return false;
    if (colSearch.amount && !String(t.amount).includes(colSearch.amount)) return false;
    if (colSearch.customer && !t.customerName.toLowerCase().includes(colSearch.customer.toLowerCase()) && !t.customerNo.toLowerCase().includes(colSearch.customer.toLowerCase())) return false;
    if (filters.markStatus.length > 0 && !filters.markStatus.includes(t.markStatus)) return false;
    return true;
  });

  const SORT_ACCESSORS = {
    id: t => t.id, entityType: t => t.entityType, entityKey: t => t.entityKey,
    score: t => t.score, markStatus: t => t.markStatus, customer: t => t.customerName,
    date: t => { const p = t.createDate.split(/[.\s:]/); return new Date(2026, parseInt(p[1]) - 1, parseInt(p[0]), parseInt(p[2] || 0), parseInt(p[3] || 0)); },
    amount: t => t.amount,
  };

  const sorted = sortCol ? [...filtered].sort((a, b) => {
    const av = SORT_ACCESSORS[sortCol](a), bv = SORT_ACCESSORS[sortCol](b);
    let cmp = typeof av === "number" && typeof bv === "number" ? av - bv : av instanceof Date && bv instanceof Date ? av - bv : String(av).localeCompare(String(bv), "tr");
    return sortDir === "asc" ? cmp : -cmp;
  }) : filtered;

  const totalPages = Math.ceil(totalCount / perPage);
  const paginated = sorted;

  const handleSort = (col) => {
    if (sortCol === col) { if (sortDir === "asc") setSortDir("desc"); else { setSortCol(null); setSortDir("asc"); } }
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ markStatus: [], entityType: "", entityId: "", scoreMin: "", scoreMax: "", dateFrom: "", dateTo: "", amountMin: "", amountMax: "" });
    setColSearch({ id: "", entityType: "", entityKey: "", score: "", markStatus: "", date: "", amount: "", customer: "" });
    setSearchQuery(""); setDebouncedSearch(""); clearTimeout(searchTimerRef.current); setPage(1);
  };

  const tableCols = [
    { key: "id", label: "İşlem ID", w: 110 }, { key: "customer", label: "Müşteri", w: 140 },
    { key: "entityType", label: "Varlık Türü", w: 95 },
    { key: "entityKey", label: "Varlık Anahtarı", w: 150 }, { key: "score", label: "Skor", w: 80 },
    { key: "markStatus", label: "Durum", w: 115 },
    { key: "date", label: "Tarih", w: 120 },
    { key: "amount", label: displayCurrency === "original" ? "Tutar" : `Tutar (${displayCurrency})`, w: 130, align: "right" },
  ];

  const SortIcon = ({ col }) => sortCol !== col ? <span style={{ opacity: 0.3, fontSize: 10 }}>↕</span> : sortDir === "asc" ? <Icons.SortAsc /> : <Icons.SortDesc />;

  return (
    <div className="scm-layout">
      <Sidebar
        activePage="txn_search"
        onNavigate={onNavigate}
        user={USERS[currentRole]}
        selectedDomain={selectedDomain}
        onDomainChange={onDomainChange}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(c => !c)}
        notifications={notifications}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
      />

      {/* ════════ MAIN ════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 64, background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: C.text }}>İşlem Arama</h1>
            <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>FDM'deki son 3 aylık işlemler arasında araştırma yapın</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              {["analyst", "manager", "admin", "super"].map(role => (
                <button key={role} onClick={() => onRoleChange && onRoleChange(role)} style={{ padding: "6px 14px", fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", background: currentRole === role ? C.primary : "#fff", color: currentRole === role ? "#fff" : C.textSecondary, transition: "all 0.15s" }}>
                  {role === "analyst" ? "Analist" : role === "manager" ? "Yönetici" : role === "admin" ? "Admin" : "Super"}
                </button>
              ))}
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: C.textSecondary }}><Icons.Globe /> TR</button>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {/* Info Banner */}
          <div style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", borderRadius: 12, padding: "16px 22px", marginBottom: 20, border: "1px solid #BFDBFE", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ color: C.primaryLight, marginTop: 1, flexShrink: 0 }}><Icons.Info /></div>
            <div style={{ fontSize: 13, color: "#1E3A8A", lineHeight: 1.6 }}>
              <strong>İşlem Arama:</strong> FDM'deki son 3 aylık tüm işlemler arasında arama ve filtreleme yaparak detaylı inceleme gerçekleştirebilirsiniz.
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Toplam İşlem", value: totalCount, color: C.primary, sub: "Son 3 ay" },
              { label: "İşaretli", value: "—", color: C.warning, sub: "Marked" },
              { label: "Vakaya Atanan", value: "—", color: C.primaryLight, sub: "Case Assigned" },
              { label: "Kritik Skorlu", value: "—", color: C.danger, sub: "Skor ≥ 86" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: stat.color }} />
                <div style={{ fontSize: 11.5, color: C.textSecondary, fontWeight: 500 }}>{stat.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: C.textSecondary }}>{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
              <SearchInput
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); clearTimeout(searchTimerRef.current); searchTimerRef.current = setTimeout(() => setDebouncedSearch(e.target.value), 350); }}
                placeholder="İşlem ID, Müşteri No veya Müşteri Adı ile ara..."
                style={{ flex: 1, maxWidth: 420 }}
              />
              <FilterBar.Toggle
                open={showFilterPanel}
                onToggle={() => setShowFilterPanel(p => !p)}
                activeCount={activeFilterCount}
              />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 8, padding: 3 }}>
                {[{ key: "original", label: "Default" }, { key: "TRY", label: "₺ TRY" }, { key: "USD", label: "$ USD" }].map(o => (
                  <button key={o.key} onClick={() => setDisplayCurrency(o.key)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", fontSize: 11.5, fontWeight: 600, cursor: "pointer", background: displayCurrency === o.key ? C.primary : "transparent", color: displayCurrency === o.key ? "#fff" : C.textSecondary, transition: "all 0.15s" }}>{o.label}</button>
                ))}
              </div>
              {(activeFilterCount > 0 || searchQuery) && (
                <button onClick={resetFilters} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.danger}33`, background: "#FEF2F2", cursor: "pointer", fontSize: 12.5, fontWeight: 500, color: C.danger }}><Icons.X /> Temizle</button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <FilterBar.Panel onReset={resetFilters} style={{ marginBottom: 16 }}>
              <FilterBar.ChipGroup
                label="İŞARETLENME DURUMU"
                options={Object.entries(STATUS_STYLES).map(([k, cfg]) => ({ key: k, ...cfg }))}
                selected={filters.markStatus}
                onToggle={k => { setFilters(f => ({ ...f, markStatus: f.markStatus.includes(k) ? f.markStatus.filter(x => x !== k) : [...f.markStatus, k] })); setPage(1); }}
              />
              <FilterBar.Select
                label="VARLIK TÜRÜ"
                value={filters.entityType}
                onChange={e => { setFilters(f => ({ ...f, entityType: e.target.value, entityId: "" })); setPage(1); }}
                options={[
                  { value: "", label: "Tümü" },
                  { value: "Customer", label: "Müşteri" },
                  { value: "Account", label: "Hesap" },
                  { value: "Card", label: "Kart" },
                  { value: "Device", label: "Cihaz" },
                ]}
              />
              {filters.entityType && (
                <FilterBar.Input
                  label={{ Customer: "MÜŞTERİ", Account: "HESAP", Card: "KART", Device: "CİHAZ" }[filters.entityType] + " ID"}
                  value={filters.entityId}
                  onChange={e => { setFilters(f => ({ ...f, entityId: e.target.value })); setPage(1); }}
                  placeholder={`${{ Customer: "Müşteri", Account: "Hesap", Card: "Kart", Device: "Cihaz" }[filters.entityType]} ID giriniz...`}
                />
              )}
              <FilterBar.NumberRange
                label="FRAUD SKORU ARALIĞI"
                min={filters.scoreMin}
                max={filters.scoreMax}
                onMinChange={e => { setFilters(f => ({ ...f, scoreMin: e.target.value })); setPage(1); }}
                onMaxChange={e => { setFilters(f => ({ ...f, scoreMax: e.target.value })); setPage(1); }}
              />
              <FilterBar.NumberRange
                label="TUTAR ARALIĞI"
                min={filters.amountMin}
                max={filters.amountMax}
                onMinChange={e => { setFilters(f => ({ ...f, amountMin: e.target.value })); setPage(1); }}
                onMaxChange={e => { setFilters(f => ({ ...f, amountMax: e.target.value })); setPage(1); }}
              />
              <FilterBar.DateRange
                label="TARİH ARALIĞI"
                from={filters.dateFrom}
                to={filters.dateTo}
                onFromChange={e => { setFilters(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                onToChange={e => { setFilters(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
              />
            </FilterBar.Panel>
          )}

          {/* Results count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 12.5, color: C.textSecondary }}>
              <strong style={{ color: C.text }}>{totalCount}</strong> işlem bulundu
              {searchQuery && <span> — "{searchQuery}" araması</span>}
            </div>
          </div>

          {/* TABLE */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {tableCols.map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)} style={{ padding: "12px 14px", fontSize: 11.5, fontWeight: 600, color: C.textSecondary, textAlign: col.align || "left", cursor: "pointer", userSelect: "none", borderBottom: `2px solid ${C.border}`, width: col.w || "auto", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: col.align === "right" ? "flex-end" : "flex-start" }}>{col.label} <SortIcon col={col.key} /></div>
                      </th>
                    ))}
                    <th style={{ width: 50, padding: "12px 14px", borderBottom: `2px solid ${C.border}` }} />
                  </tr>
                  <tr style={{ background: "#FAFBFD" }}>
                    {tableCols.map(col => (
                      <td key={`s_${col.key}`} style={{ padding: "6px 8px", borderBottom: `1px solid ${C.border}` }}>
                        <input type="text" placeholder="..." value={colSearch[col.key] || ""} onChange={e => { setColSearch(prev => ({ ...prev, [col.key]: e.target.value })); setPage(1); }}
                          style={{ width: "100%", padding: "5px 8px", borderRadius: 5, border: `1px solid ${colSearch[col.key] ? C.primaryLight : "#E8ECF0"}`, fontSize: 11.5, outline: "none", background: colSearch[col.key] ? "#EFF6FF" : "#fff", color: C.text, boxSizing: "border-box" }} />
                      </td>
                    ))}
                    <td style={{ borderBottom: `1px solid ${C.border}` }} />
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={tableCols.length + 1} style={{ padding: "48px 20px", textAlign: "center", color: C.textSecondary, fontSize: 13 }}>Yükleniyor...</td></tr>}
                  {!loading && paginated.length === 0 && <tr><td colSpan={tableCols.length + 1} style={{ padding: "48px 20px", textAlign: "center", color: C.textSecondary, fontSize: 13 }}>Arama kriterlerine uygun işlem bulunamadı.</td></tr>}
                  {!loading && paginated.map(txn => {
                    const sevStyle = SEVERITY_STYLES[txn.severity];
                    const statusStyle = STATUS_STYLES[txn.markStatus];
                    const displayAmount = displayCurrency === "original" ? txn.amount : convertAmount(txn.amount, txn.currency, displayCurrency);
                    const displayCurr = displayCurrency === "original" ? txn.currency : displayCurrency;
                    return (
                      <tr key={txn.id} onClick={() => setDrawerTxn(txn)} style={{ cursor: "pointer", borderBottom: "1px solid #F1F5F9", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "11px 14px", fontWeight: 600, color: C.primaryLight, fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5 }}>{txn.id}</td>
                        <td style={{ padding: "11px 14px" }}><div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{txn.customerName}</div><div style={{ fontSize: 10.5, color: C.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{txn.customerNo}</div></td>
                        <td style={{ padding: "11px 14px", fontSize: 12.5, color: C.text }}>{txn.entityType}</td>
                        <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.text }}>{txn.entityKey}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 30, height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}><div style={{ width: `${txn.score}%`, height: "100%", borderRadius: 3, background: sevStyle.color }} /></div>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: sevStyle.color, fontFamily: "'JetBrains Mono', monospace" }}>{txn.score}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 14px" }}><Badge config={statusStyle} /></td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: C.textSecondary }}>{txn.createDate}</td>
                        <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 600, color: sevStyle.color }}>
                          {formatCurrency(displayAmount, displayCurr)}
                          {displayCurrency === "original" && <div style={{ fontSize: 9.5, color: C.textSecondary, fontWeight: 400 }}>{txn.currency}</div>}
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}><div style={{ color: C.primaryLight, opacity: 0.5 }}><Icons.Eye /></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderTop: `1px solid ${C.border}`, background: "#FAFBFD" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.textSecondary }}>
                <span>Sayfa başı:</span>
                <select value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, outline: "none" }}>
                  <option value={10}>10</option><option value={15}>15</option><option value={25}>25</option><option value={50}>50</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12.5, color: C.textSecondary, marginRight: 8 }}>{(page - 1) * perPage + 1}–{Math.min(page * perPage, totalCount)} / {totalCount}</span>
                {(() => {
                  const pgBtn = { width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.textSecondary };
                  const pages = []; const maxV = 5;
                  let start = Math.max(1, page - Math.floor(maxV / 2)); let end = Math.min(totalPages, start + maxV - 1);
                  if (end - start < maxV - 1) start = Math.max(1, end - maxV + 1);
                  for (let p = start; p <= end; p++) pages.push(p);
                  return (<>
                    <button onClick={() => setPage(1)} disabled={page === 1} style={{ ...pgBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 11 }}>⏮</button>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...pgBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer", transform: "rotate(180deg)" }}><Icons.ChevronRight /></button>
                    {pages.map(p => <button key={p} onClick={() => setPage(p)} style={{ ...pgBtn, background: page === p ? C.primary : "#fff", color: page === p ? "#fff" : C.textSecondary, fontWeight: page === p ? 700 : 500, border: page === p ? "none" : `1px solid ${C.border}` }}>{p}</button>)}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...pgBtn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}><Icons.ChevronRight /></button>
                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ ...pgBtn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 11 }}>⏭</button>
                  </>);
                })()}
              </div>
            </div>
          </div>
          <div style={{ height: 32 }} />
        </main>
      </div>

      {/* ═══ Transaction Detail Drawer ═══ */}
      {drawerTxn && (<>
        <div onClick={() => setDrawerTxn(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 300, animation: "fadeIn 0.2s ease" }} />
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, background: "#fff", zIndex: 301, boxShadow: "-8px 0 30px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", animation: "slideIn 0.25s ease" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>İşlem Detayı</h3><span style={{ fontSize: 13, color: C.primaryLight, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{drawerTxn.id}</span></div>
            <button onClick={() => setDrawerTxn(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4 }}><Icons.X /></button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <Badge config={SEVERITY_STYLES[drawerTxn.severity]} />
              <Badge config={STATUS_STYLES[drawerTxn.markStatus]} />
              {drawerTxn.caseId && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "#EFF6FF", color: C.primaryLight, border: "1px solid #BFDBFE" }}>Vaka {drawerTxn.caseId}</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Müşteri Adı", value: drawerTxn.customerName },
                { label: "Müşteri No", value: drawerTxn.customerNo, mono: true },
                { label: "İşlem Kaynağı", value: drawerTxn.sourceLabel, isBadge: true, color: drawerTxn.sourceColor },
                { label: "Varlık Türü", value: drawerTxn.entityType },
                { label: "Varlık Anahtarı", value: drawerTxn.entityKey, mono: true },
                { label: "Fraud Skoru", value: `${drawerTxn.score} (${drawerTxn.severity})` },
                { label: "Tetikleyici Kural", value: drawerTxn.triggerRule, mono: true },
                { label: "İşaretlenme Durumu", value: STATUS_STYLES[drawerTxn.markStatus]?.label || drawerTxn.markStatus },
                { label: "Oluşturma Tarihi", value: drawerTxn.createDate },
                { label: "Tutar", value: formatCurrency(drawerTxn.amount, drawerTxn.currency), mono: true },
                { label: "Para Birimi", value: drawerTxn.currency },
                { label: "Tutar (TRY)", value: drawerTxn.currency === "TRY" ? "—" : formatCurrency(convertAmount(drawerTxn.amount, drawerTxn.currency, "TRY"), "TRY"), mono: true },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4, fontWeight: 500 }}>{item.label}</div>
                  {item.isBadge ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />{item.value}
                    </span>
                  ) : <div style={{ fontSize: 13, fontWeight: 500, color: C.text, fontFamily: item.mono ? "'JetBrains Mono', monospace" : "inherit" }}>{item.value}</div>}
                </div>
              ))}
            </div>

            {/* Score Visual */}
            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 16, marginBottom: 20, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, marginBottom: 10 }}>Fraud Skor Dağılımı</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 10, borderRadius: 5, background: "#E5E7EB", overflow: "hidden" }}>
                  <div style={{ width: `${drawerTxn.score}%`, height: "100%", borderRadius: 5, background: `linear-gradient(90deg, ${SEVERITY_STYLES[drawerTxn.severity].color}, ${SEVERITY_STYLES[drawerTxn.severity].color}CC)`, transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: SEVERITY_STYLES[drawerTxn.severity].color, fontFamily: "'JetBrains Mono', monospace" }}>{drawerTxn.score}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {["Düşük", "Orta", "Yüksek", "Kritik"].map(l => <span key={l} style={{ fontSize: 9.5, color: C.textSecondary }}>{l}</span>)}
              </div>
            </div>

            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 20, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: C.textSecondary }}>
                <Icons.Clock /> İşlem zaman çizelgesi entegrasyon sonrası aktif olacaktır.
              </div>
            </div>
          </div>
        </div>
      </>)}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
}
