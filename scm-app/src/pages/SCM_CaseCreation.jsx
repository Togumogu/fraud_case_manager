import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { fdm } from "../api/client";

// ─── Mock Data ───
const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", email: "elif@bank.com" },
  manager: { id: 2, name: "Burak Şen", role: "manager", email: "burak@bank.com" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", email: "zeynep@bank.com" },
};

const ACTIVE_USERS = [
  { id: 1, name: "Elif Yılmaz", role: "Fraud Analist" },
  { id: 4, name: "Mehmet Öz", role: "Fraud Analist" },
  { id: 5, name: "Ayşe Tan", role: "Fraud Analist" },
  { id: 6, name: "Can Yıldız", role: "Fraud Analist" },
  { id: 2, name: "Burak Şen", role: "Yönetici" },
  { id: 7, name: "Selin Aydın", role: "İnceleyici" },
];

const FRAUD_DOMAINS = [
  { id: "payment", label: "Payment Fraud", icon: "₺", color: "#0891B2" },
  { id: "credit_card", label: "Credit Card Fraud", icon: "💳", color: "#8B5CF6" },
  { id: "application", label: "Application Fraud", icon: "📋", color: "#F59E0B" },
  { id: "account_takeover", label: "Account Takeover", icon: "🔓", color: "#EF4444" },
  { id: "internal", label: "Internal Fraud", icon: "🏢", color: "#6366F1" },
];

const SEVERITIES = [
  { key: "critical", label: "Kritik", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  { key: "high", label: "Yüksek", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  { key: "medium", label: "Orta", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  { key: "low", label: "Düşük", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
];

const ENTITY_TYPES = ["Müşteri", "Hesap", "Kart", "Cihaz"];

const EXISTING_CASES = [
  { id: 2471, name: "Şüpheli EFT Transferi", status: "Open", severity: "critical", domain: "payment", assignee: "Elif Yılmaz", date: "06.03.2026", txnCount: 3 },
  { id: 2470, name: "Çoklu Kanal Fraud", status: "Open", severity: "high", domain: "credit_card", assignee: "Can Yıldız", date: "06.03.2026", txnCount: 5 },
  { id: 2468, name: "Kart Dolandırıcılığı", status: "Open", severity: "high", domain: "credit_card", assignee: "Mehmet Öz", date: "05.03.2026", txnCount: 2 },
  { id: 2467, name: "Başvuru Sahteciliği", status: "Open", severity: "medium", domain: "application", assignee: "Ayşe Tan", date: "05.03.2026", txnCount: 4 },
  { id: 2465, name: "Hesap Ele Geçirme", status: "Open", severity: "critical", domain: "account_takeover", assignee: "Elif Yılmaz", date: "05.03.2026", txnCount: 7 },
  { id: 2464, name: "İç Fraud Şüphesi", status: "Open", severity: "high", domain: "internal", assignee: "Burak Şen", date: "05.03.2026", txnCount: 1 },
  { id: 2461, name: "Dijital Cüzdan Kötüye Kullanım", status: "Open", severity: "medium", domain: "payment", assignee: "Can Yıldız", date: "04.03.2026", txnCount: 3 },
  { id: 2459, name: "ATM Skimming Vakası", status: "Open", severity: "high", domain: "credit_card", assignee: "Selin Aydın", date: "04.03.2026", txnCount: 6 },
  { id: 2455, name: "Sahte Belge Dolandırıcılığı", status: "Open", severity: "medium", domain: "application", assignee: "Mehmet Öz", date: "03.03.2026", txnCount: 2 },
  { id: 2450, name: "Toplu Transfer Anomalisi", status: "Open", severity: "critical", domain: "payment", assignee: "Elif Yılmaz", date: "02.03.2026", txnCount: 9 },
  { id: 2447, name: "POS Cihazı Manipülasyonu", status: "Open", severity: "high", domain: "credit_card", assignee: "Ayşe Tan", date: "01.03.2026", txnCount: 4 },
  { id: 2443, name: "Kimlik Doğrulama Bypass", status: "Open", severity: "critical", domain: "account_takeover", assignee: "Can Yıldız", date: "28.02.2026", txnCount: 5 },
];

// Exchange rates (illustrative, from System_Setting or external service)
const FX_RATES = {
  TRY: { TRY: 1, USD: 0.0278, EUR: 0.0256 },
  USD: { TRY: 36.0, USD: 1, EUR: 0.92 },
  EUR: { TRY: 39.0, USD: 1.087, EUR: 1 },
};
const convertAmount = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  return Math.round(amount * FX_RATES[fromCurrency][toCurrency]);
};

const DOMAIN_TO_SOURCE = {
  payment: "payment_fraud",
  credit_card: "cc_fraud",
  application: "app_fraud",
  account_takeover: "ato_fraud",
  internal: "int_fraud",
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

// ─── Icons ───
const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  CaseCreate: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Cases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  MyCases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Lock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ExternalLink: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  CheckCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  AlertTriangle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  ChevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Domain: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Link: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  TransactionSearch: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  SortAsc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7-7 7 7"/></svg>,
  SortDesc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// ─── Color System ───
const C = {
  sidebar: "#0F172A", sidebarHover: "#1E293B", sidebarActive: "#1E40AF",
  primary: "#1E40AF", primaryLight: "#3B82F6", primaryBg: "#EFF6FF",
  bg: "#F1F5F9", card: "#FFFFFF", text: "#0F172A", textSecondary: "#64748B",
  border: "#E2E8F0", success: "#059669", warning: "#D97706", danger: "#DC2626",
};

const SEV_COLORS = {
  Critical: { bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  High: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  Medium: { bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  Low: { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};

const MARK_COLORS = {
  Marked: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
  Unmarked: { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
  "Case Assigned": { bg: "#EDE9FE", color: "#5B21B6", border: "#C4B5FD" },
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

const formatCurrency = (amount, currency) => {
  const symbols = { TRY: "₺", USD: "$", EUR: "€" };
  return `${symbols[currency] || ""}${amount.toLocaleString("tr-TR")}`;
};

// ─── Main Component ───
export default function SCMCaseCreation({ onNavigate, transactions: transactionsProp, cases: casesProp, onCaseCreated, currentRole = "analyst", onRoleChange, notifications = [], onMarkAllRead, onMarkRead, showToast: showToastProp } = {}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Domain selection (system-wide, from sidebar)
  const [selectedDomain, setSelectedDomain] = useState("payment");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    markStatus: "Marked",
    entityType: "",
    entityId: "",
    scoreMin: "",
    scoreMax: "",
    dateFrom: "",
    dateTo: "",
  });

  // Selection state — Map<id, txnObject> for cross-page persistence
  const [selectedTxns, setSelectedTxns] = useState(new Map());

  // API state
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Currency display toggle
  const [displayCurrency, setDisplayCurrency] = useState("original"); // "original" | "TRY" | "USD"

  // Column search (inline table header search)
  const [colSearch, setColSearch] = useState({ id: "", customer: "", entityType: "", entityKey: "", score: "", markStatus: "", date: "", amount: "" });

  // Sort state
  const [sortCol, setSortCol] = useState(null); // column key
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  const handleSort = (col) => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortCol(null); setSortDir("asc"); } // 3rd click resets
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [caseForm, setCaseForm] = useState({ name: "", domain: "", severity: "", assignee: "", description: "", parentCaseId: null });
  const [formErrors, setFormErrors] = useState({});
  const [parentSearchQuery, setParentSearchQuery] = useState("");

  // Detail drawer
  const [drawerTxn, setDrawerTxn] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Toast
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const user = USERS[currentRole];
  const isManager = currentRole === "manager" || currentRole === "admin";

  // Fetch transactions from API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const markStatusParam = (filters.markStatus && filters.markStatus !== "Tümü") ? filters.markStatus : undefined;
    fdm.transactions({
      domain: DOMAIN_TO_SOURCE[selectedDomain],
      page, limit: perPage,
      search: debouncedSearch || undefined,
      mark_status: markStatusParam,
      entity_type: filters.entityType || undefined,
      entity_key: filters.entityId || undefined,
      score_min: filters.scoreMin || undefined,
      score_max: filters.scoreMax || undefined,
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
    }).then(result => {
      if (!cancelled) {
        let rows = result.data.map(normalizeTransaction);
        if (!markStatusParam) rows = rows.filter(t => t.markStatus !== "Case Assigned");
        setTransactions(rows);
        setTotalCount(result.total);
      }
    }).catch((err) => {
      if (!cancelled) {
        setTransactions([]);
        setTotalCount(0);
        const localToast = (t, m) => { setToast({ type: t, msg: m }); setTimeout(() => setToast(null), 4000); };
        (showToastProp || localToast)("error", err?.message || "İşlemler yüklenemedi");
      }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedDomain, page, perPage, debouncedSearch,
      filters.markStatus, filters.entityType, filters.entityId,
      filters.scoreMin, filters.scoreMax, filters.dateFrom, filters.dateTo]);

  // Client-side filtering: colSearch inline table filters only
  const filtered = transactions.filter(t => {
    if (colSearch.id && !t.id.toLowerCase().includes(colSearch.id.toLowerCase())) return false;
    if (colSearch.customer && !t.customerName.toLowerCase().includes(colSearch.customer.toLowerCase()) && !t.customerNo.toLowerCase().includes(colSearch.customer.toLowerCase())) return false;
    if (colSearch.entityType && !t.entityType.toLowerCase().includes(colSearch.entityType.toLowerCase())) return false;
    if (colSearch.entityKey && !t.entityKey.toLowerCase().includes(colSearch.entityKey.toLowerCase())) return false;
    if (colSearch.score && !String(t.score).includes(colSearch.score) && !t.severity.toLowerCase().includes(colSearch.score.toLowerCase())) return false;
    if (colSearch.markStatus && !t.markStatus.toLowerCase().includes(colSearch.markStatus.toLowerCase()) && !(STATUS_STYLES[t.markStatus]?.label || "").toLowerCase().includes(colSearch.markStatus.toLowerCase())) return false;
    if (colSearch.date && !t.createDate.includes(colSearch.date)) return false;
    if (colSearch.amount && !String(t.amount).includes(colSearch.amount)) return false;
    return true;
  });

  // Sort
  const SORT_ACCESSORS = {
    id: t => t.id,
    customer: t => t.customerName,
    entityType: t => t.entityType,
    entityKey: t => t.entityKey,
    score: t => t.score,
    markStatus: t => t.markStatus,
    date: t => { const p = t.createDate.split(/[.\s:]/); return new Date(2026, parseInt(p[1])-1, parseInt(p[0]), parseInt(p[2]||0), parseInt(p[3]||0)); },
    amount: t => t.amount,
  };

  const sorted = sortCol ? [...filtered].sort((a, b) => {
    const av = SORT_ACCESSORS[sortCol](a);
    const bv = SORT_ACCESSORS[sortCol](b);
    let cmp = 0;
    if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
    else if (av instanceof Date && bv instanceof Date) cmp = av - bv;
    else cmp = String(av).localeCompare(String(bv), "tr");
    return sortDir === "asc" ? cmp : -cmp;
  }) : filtered;

  const totalPages = Math.ceil(totalCount / perPage);
  const paged = sorted;

  const handleSelectAll = () => {
    const next = new Map(selectedTxns);
    if (paged.every(t => selectedTxns.has(t.id))) {
      paged.forEach(t => next.delete(t.id));
    } else {
      paged.forEach(t => next.set(t.id, t));
    }
    setSelectedTxns(next);
  };

  const handleSelect = (t) => {
    const next = new Map(selectedTxns);
    if (next.has(t.id)) next.delete(t.id); else next.set(t.id, t);
    setSelectedTxns(next);
  };

  const handleCreateCase = () => {
    const errors = {};
    if (!caseForm.name.trim()) {
      errors.name = "Vaka adı zorunludur";
    } else if (caseForm.name.trim().length < 3) {
      errors.name = "Vaka adı en az 3 karakter olmalıdır";
    }
    if (!caseForm.severity) errors.severity = "Önem derecesi seçilmelidir";
    if (selectedTxns.size === 0) errors.txns = "En az bir işlem seçilmelidir";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Gather selected transaction objects
    const txnObjects = Array.from(selectedTxns.values());
    const totalAmount = txnObjects.reduce((s, t) => s + t.amount, 0);
    const currency = txnObjects.length > 0 ? txnObjects[0].currency : "TRY";

    // Determine today string
    const d = new Date();
    const today = `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;

    // Next ID: use shared cases state if available, else fall back to EXISTING_CASES
    const allCasesForId = casesProp || EXISTING_CASES;
    const maxId = Math.max(...allCasesForId.map(c => c.id), 2471);
    const newId = maxId + 1;

    const newCase = {
      id: newId,
      name: caseForm.name.trim(),
      status: "Open",
      severity: caseForm.severity,
      owner: caseForm.assignee || user.name,
      ownerId: user.id,
      createUser: user.name,
      createDate: today,
      createTime: `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`,
      updateUser: user.name,
      updateDate: today,
      updateTime: `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`,
      description: caseForm.description || "",
      totalAmount,
      currency,
      bankShare: Math.round(totalAmount * 0.6),
      customerShare: Math.round(totalAmount * 0.4),
      domain: caseForm.domain || selectedDomain,
      parentCaseId: caseForm.parentCaseId || null,
      transactions: txnObjects,
    };

    setSubmitting(true);
    if (onCaseCreated) {
      onCaseCreated(newCase);
    } else {
      // Fallback: just show toast (no shared state)
      const parentCase = caseForm.parentCaseId ? EXISTING_CASES.find(c => c.id === caseForm.parentCaseId) : null;
      const parentInfo = parentCase ? ` (Üst Vaka: #${parentCase.id})` : "";
      setToast({ type: "success", msg: `Vaka "${newCase.name}" başarıyla oluşturuldu. ${selectedTxns.size} işlem vakaya eklendi.${parentInfo}` });
      setTimeout(() => setToast(null), 4000);
    }
    setSubmitting(false);

    setShowCreateModal(false);
    setSelectedTxns(new Map());
    setCaseForm({ name: "", domain: "", severity: "", assignee: "", description: "", parentCaseId: null });
    setFormErrors({});
    setParentSearchQuery("");
  };

  const resetFilters = () => {
    setFilters({ markStatus: "Marked", entityType: "", entityId: "", scoreMin: "", scoreMax: "", dateFrom: "", dateTo: "" });
    setColSearch({ id: "", source: "", entityType: "", entityKey: "", score: "", triggerRule: "", markStatus: "", date: "", amount: "" });
    setSearchQuery(""); setDebouncedSearch(""); clearTimeout(searchTimerRef.current); setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "markStatus" && v === "Marked") return false;
    return v !== "";
  }).length;

  return (
    <div className="scm-layout">
      <Sidebar
        activePage="case_creation"
        onNavigate={onNavigate}
        user={USERS[currentRole]}
        selectedDomain={selectedDomain}
        onDomainChange={setSelectedDomain}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(c => !c)}
        notifications={notifications}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
      />

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Header */}
        <header style={{ height: 64, background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Vaka Oluşturma</h1>
            <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>İşaretlenmiş işlemlerden soruşturma vakası oluşturun</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              {["analyst", "manager", "admin"].map(role => (
                <button key={role} onClick={() => onRoleChange && onRoleChange(role)} style={{
                  padding: "6px 14px", fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", letterSpacing: "0.02em",
                  background: currentRole === role ? C.primary : "#fff",
                  color: currentRole === role ? "#fff" : C.textSecondary,
                  transition: "all 0.15s ease",
                }}>
                  {role === "analyst" ? "Analist" : role === "manager" ? "Yönetici" : "Admin"}
                </button>
              ))}
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: C.textSecondary }}>
              <Icons.Globe /> TR
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: 28 }}>

          {/* Info Banner */}
          <div style={{
            background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
            borderRadius: 12, padding: "16px 22px", marginBottom: 20,
            border: "1px solid #BFDBFE", display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <div style={{ color: C.primaryLight, marginTop: 1, flexShrink: 0 }}><Icons.Info /></div>
            <div style={{ fontSize: 13, color: "#1E3A8A", lineHeight: 1.6 }}>
              <strong>İşlem Listesi:</strong> Alert Triage'de işaretlenmiş (Marked) işlemler varsayılan olarak gösterilir.
              Arama fonksiyonu ile FDM'den son 3 aylık tüm işlemler arasında arama yapabilirsiniz.
              Bir veya birden fazla işlem seçerek yeni soruşturma vakası oluşturabilirsiniz.
            </div>
          </div>

          {/* Action Bar */}
          <div style={{
            background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`,
            padding: "16px 22px", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
          }}>
            {/* Left: Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, flex: 1, maxWidth: 400,
                background: "#F8FAFC", borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 12px",
              }}>
                <Icons.Search />
                <input
                  type="text" placeholder="İşlem ID, Müşteri No veya Müşteri Adı ile ara..."
                  value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); clearTimeout(searchTimerRef.current); searchTimerRef.current = setTimeout(() => setDebouncedSearch(e.target.value), 350); }}
                  style={{
                    flex: 1, border: "none", background: "transparent", padding: "10px 0",
                    fontSize: 13, outline: "none", color: C.text,
                  }}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setDebouncedSearch(""); clearTimeout(searchTimerRef.current); setPage(1); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 2 }}>
                    <Icons.X />
                  </button>
                )}
              </div>
              <button onClick={() => setShowFilterPanel(!showFilterPanel)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
                borderRadius: 8, border: `1px solid ${showFilterPanel ? C.primaryLight : C.border}`,
                background: showFilterPanel ? C.primaryBg : "#fff", cursor: "pointer",
                fontSize: 13, fontWeight: 500, color: showFilterPanel ? C.primary : C.textSecondary,
                transition: "all 0.15s ease", position: "relative",
              }}>
                <Icons.Filter />
                Filtrele
                {activeFilterCount > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -6, width: 20, height: 20,
                    borderRadius: "50%", background: C.primaryLight, color: "#fff",
                    fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{activeFilterCount}</span>
                )}
              </button>
            </div>

            {/* Right: Selected + Create */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {selectedTxns.size > 0 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                  background: "#FEF3C7", borderRadius: 8, border: "1px solid #FDE68A",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>
                    {selectedTxns.size} işlem seçildi
                  </span>
                  <button onClick={() => setSelectedTxns(new Map())} style={{
                    background: "none", border: "none", cursor: "pointer", color: "#92400E",
                    display: "flex", padding: 0, fontSize: 12,
                  }}>
                    <Icons.X />
                  </button>
                </div>
              )}
              <button
                onClick={() => selectedTxns.size > 0 && setShowCreateModal(true)}
                disabled={selectedTxns.size === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 22px",
                  borderRadius: 10, border: "none", cursor: selectedTxns.size > 0 ? "pointer" : "not-allowed",
                  background: selectedTxns.size > 0 ? "linear-gradient(135deg, #1E40AF, #2563EB)" : "#E2E8F0",
                  color: selectedTxns.size > 0 ? "#fff" : "#94A3B8",
                  fontSize: 13.5, fontWeight: 600, transition: "all 0.2s ease",
                  boxShadow: selectedTxns.size > 0 ? "0 4px 14px rgba(30,64,175,0.3)" : "none",
                }}
              >
                <Icons.Plus />
                Vaka Oluştur
              </button>
            </div>
          </div>

          {/* Filter Panel (Collapsible) */}
          {showFilterPanel && (
            <div style={{
              background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`,
              padding: "20px 22px", marginBottom: 16,
              animation: "slideDown 0.2s ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Filtreler</h4>
                <button onClick={resetFilters} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, color: C.primaryLight, fontWeight: 500,
                }}>Filtreleri Sıfırla</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {/* İşaretlenme Durumu */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>İşaretlenme Durumu</label>
                  <select value={filters.markStatus} onChange={e => { setFilters(f => ({ ...f, markStatus: e.target.value })); setPage(1); }}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: "#F8FAFC", outline: "none", color: C.text }}>
                    <option value="Tümü">Tümü</option>
                    <option value="Marked">Marked (İşaretlenmiş)</option>
                    <option value="Unmarked">Unmarked (İşaretlenmemiş)</option>
                  </select>
                </div>
                {/* Varlık Türü */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Varlık Türü</label>
                  <select value={filters.entityType} onChange={e => { setFilters(f => ({ ...f, entityType: e.target.value, entityId: "" })); setPage(1); }}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: "#F8FAFC", outline: "none", color: C.text }}>
                    <option value="">Tümü</option>
                    <option value="Customer">Müşteri</option>
                    <option value="Account">Hesap</option>
                    <option value="Card">Kart</option>
                    <option value="Device">Cihaz</option>
                  </select>
                </div>
                {filters.entityType && (
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {{ Customer: "Müşteri", Account: "Hesap", Card: "Kart", Device: "Cihaz" }[filters.entityType]} ID
                    </label>
                    <input type="text" placeholder={`${{ Customer: "Müşteri", Account: "Hesap", Card: "Kart", Device: "Cihaz" }[filters.entityType]} ID giriniz...`} value={filters.entityId} onChange={e => { setFilters(f => ({ ...f, entityId: e.target.value })); setPage(1); }} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: "#F8FAFC", outline: "none", color: C.text, boxSizing: "border-box" }} />
                  </div>
                )}
                {/* Fraud Skoru */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Fraud Skoru Aralığı</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="number" placeholder="Min" min="0" max="100" value={filters.scoreMin}
                      onChange={e => { setFilters(f => ({ ...f, scoreMin: e.target.value })); setPage(1); }}
                      style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: "#F8FAFC", outline: "none", width: 60 }} />
                    <span style={{ color: C.textSecondary, alignSelf: "center" }}>—</span>
                    <input type="number" placeholder="Max" min="0" max="100" value={filters.scoreMax}
                      onChange={e => { setFilters(f => ({ ...f, scoreMax: e.target.value })); setPage(1); }}
                      style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: "#F8FAFC", outline: "none", width: 60 }} />
                  </div>
                </div>
                {/* Tarih */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Tarih Aralığı</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="date" value={filters.dateFrom}
                      onChange={e => { setFilters(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                      style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: "#F8FAFC", outline: "none" }} />
                    <input type="date" value={filters.dateTo}
                      onChange={e => { setFilters(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
                      style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: "#F8FAFC", outline: "none" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {/* Table Header Info */}
            <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>İşlem Listesi</h3>
                <span style={{ fontSize: 12, color: C.textSecondary, background: "#F1F5F9", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>
                  {totalCount} işlem
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Currency Display Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500 }}>Tutar gösterim:</span>
                  <div style={{ display: "flex", gap: 0, borderRadius: 7, overflow: "hidden", border: `1px solid ${C.border}` }}>
                    {[
                      { key: "original", label: "Default" },
                      { key: "TRY", label: "₺ TRY" },
                      { key: "USD", label: "$ USD" },
                    ].map(opt => (
                      <button key={opt.key} onClick={() => setDisplayCurrency(opt.key)} style={{
                        padding: "5px 12px", fontSize: 11, fontWeight: 600, border: "none",
                        cursor: "pointer", letterSpacing: "0.02em",
                        background: displayCurrency === opt.key ? C.primary : "#fff",
                        color: displayCurrency === opt.key ? "#fff" : C.textSecondary,
                        transition: "all 0.15s ease",
                      }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Per Page */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.textSecondary }}>Sayfa başına:</span>
                  <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                    style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, background: "#F8FAFC", outline: "none" }}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            {(() => {
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
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th style={{ width: 44, padding: "12px 14px", borderBottom: `2px solid ${C.border}`, textAlign: "center" }}>
                      <input type="checkbox"
                        checked={paged.length > 0 && paged.every(t => selectedTxns.has(t.id))}
                        onChange={handleSelectAll}
                        style={{ width: 16, height: 16, cursor: "pointer", accentColor: C.primaryLight }}
                      />
                    </th>
                    {tableCols.map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)} style={{ padding: "12px 14px", fontSize: 11.5, fontWeight: 600, color: C.textSecondary, textAlign: col.align || "left", cursor: "pointer", userSelect: "none", borderBottom: `2px solid ${C.border}`, width: col.w || "auto", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: col.align === "right" ? "flex-end" : "flex-start" }}>{col.label} <SortIcon col={col.key} /></div>
                      </th>
                    ))}
                    <th style={{ width: 50, padding: "12px 14px", borderBottom: `2px solid ${C.border}` }} />
                  </tr>
                  <tr style={{ background: "#FAFBFD" }}>
                    <td style={{ padding: "6px 8px", borderBottom: `1px solid ${C.border}` }} />
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
                  {loading && <tr><td colSpan={tableCols.length + 2} style={{ padding: "48px 20px", textAlign: "center", color: C.textSecondary, fontSize: 13 }}>Yükleniyor...</td></tr>}
                  {!loading && paged.length === 0 && <tr><td colSpan={tableCols.length + 2} style={{ padding: "48px 20px", textAlign: "center", color: C.textSecondary, fontSize: 13 }}>Arama kriterlerine uygun işlem bulunamadı.</td></tr>}
                  {!loading && paged.map(t => {
                    const isSelected = selectedTxns.has(t.id);
                    const sevStyle = SEVERITY_STYLES[t.severity];
                    const statusStyle = STATUS_STYLES[t.markStatus];
                    const displayAmount = displayCurrency === "original" ? t.amount : convertAmount(t.amount, t.currency, displayCurrency);
                    const displayCurr = displayCurrency === "original" ? t.currency : displayCurrency;
                    return (
                      <tr key={t.id} style={{ borderBottom: "1px solid #F1F5F9", background: isSelected ? "#EFF6FF" : "transparent", transition: "background 0.1s", cursor: "pointer" }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#F8FAFC"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isSelected ? "#EFF6FF" : "transparent"; }}
                      >
                        <td style={{ padding: "11px 14px", textAlign: "center", width: 44 }}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleSelect(t)}
                            style={{ width: 16, height: 16, cursor: "pointer", accentColor: C.primaryLight }} />
                        </td>
                        <td style={{ padding: "11px 14px", fontWeight: 600, color: C.primaryLight, fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5 }}>{t.id}</td>
                        <td style={{ padding: "11px 14px" }}><div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{t.customerName}</div><div style={{ fontSize: 10.5, color: C.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{t.customerNo}</div></td>
                        <td style={{ padding: "11px 14px", fontSize: 12.5, color: C.text }}>{t.entityType}</td>
                        <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.text }}>{t.entityKey}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 30, height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}><div style={{ width: `${t.score}%`, height: "100%", borderRadius: 3, background: sevStyle.color }} /></div>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: sevStyle.color, fontFamily: "'JetBrains Mono', monospace" }}>{t.score}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 14px" }}><Badge config={statusStyle} /></td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: C.textSecondary }}>{t.createDate}</td>
                        <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 600, color: sevStyle.color }}>
                          {formatCurrency(displayAmount, displayCurr)}
                          {displayCurrency === "original" && <div style={{ fontSize: 9.5, color: C.textSecondary, fontWeight: 400 }}>{t.currency}</div>}
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }} onClick={() => setDrawerTxn(t)}><div style={{ color: C.primaryLight, opacity: 0.5 }}><Icons.Eye /></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
              );
            })()}

            {/* Pagination */}
            <div style={{
              padding: "14px 22px", borderTop: `1px solid ${C.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: C.textSecondary }}>
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalCount)} / {totalCount} işlem gösteriliyor
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ ...pgBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}>
                  <Icons.ChevronLeft />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p;
                  if (totalPages <= 5) p = i + 1;
                  else if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                  return (
                    <button key={p} onClick={() => setPage(p)} style={{
                      ...pgBtn,
                      background: page === p ? C.primary : "transparent",
                      color: page === p ? "#fff" : C.textSecondary,
                      fontWeight: page === p ? 700 : 500,
                    }}>{p}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ ...pgBtn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}>
                  <Icons.ChevronRight />
                </button>
              </div>
            </div>
          </div>

          <div style={{ height: 32 }} />
        </main>
      </div>

      {/* ── Transaction Detail Drawer ── */}
      {drawerTxn && (
        <>
          <div onClick={() => setDrawerTxn(null)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 300,
            animation: "fadeIn 0.2s ease",
          }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 440,
            background: "#fff", zIndex: 301, boxShadow: "-8px 0 30px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column",
            animation: "slideIn 0.25s ease",
          }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>İşlem Detayı</h3>
                <span style={{ fontSize: 13, color: C.primaryLight, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{drawerTxn.id}</span>
              </div>
              <button onClick={() => setDrawerTxn(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4 }}>
                <Icons.X />
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "İşlem Kaynağı", value: drawerTxn.sourceLabel, color: drawerTxn.sourceColor, isBadge: true },
                  { label: "Varlık Türü", value: drawerTxn.entityType },
                  { label: "Varlık Anahtarı", value: drawerTxn.entityKey, mono: true },
                  { label: "Fraud Skoru", value: `${drawerTxn.score} (${drawerTxn.severity})` },
                  { label: "Tetikleyici Kural", value: drawerTxn.triggerRule, mono: true },
                  { label: "İşaretlenme Durumu", value: drawerTxn.markStatus },
                  { label: "Oluşturma Tarihi", value: drawerTxn.createDate },
                  { label: "Tutar", value: formatCurrency(drawerTxn.amount, drawerTxn.currency), mono: true },
                  { label: "Para Birimi", value: drawerTxn.currency },
                  { label: "Tutar (TRY)", value: drawerTxn.currency === "TRY" ? "—" : formatCurrency(convertAmount(drawerTxn.amount, drawerTxn.currency, "TRY"), "TRY"), mono: true },
                  { label: "Müşteri No", value: drawerTxn.customerNo, mono: true },
                  { label: "Müşteri Adı", value: drawerTxn.customerName },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
                    {item.isBadge ? (
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 5, background: `${item.color}14`, color: item.color, border: `1px solid ${item.color}30` }}>{item.value}</span>
                    ) : (
                      <div style={{ fontSize: 13.5, fontWeight: 500, fontFamily: item.mono ? "'JetBrains Mono', monospace" : "inherit" }}>{item.value}</div>
                    )}
                  </div>
                ))}
              </div>
              {/* Fraud Score Gauge */}
              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>Fraud Skor Dağılımı</div>
                <div style={{ width: "100%", height: 12, borderRadius: 6, background: "#E2E8F0", overflow: "hidden", marginBottom: 8 }}>
                  <div style={{
                    width: `${drawerTxn.score}%`, height: "100%", borderRadius: 6,
                    background: `linear-gradient(90deg, ${drawerTxn.score >= 86 ? "#DC2626" : drawerTxn.score >= 61 ? "#F59E0B" : "#3B82F6"}, ${drawerTxn.score >= 86 ? "#EF4444" : drawerTxn.score >= 61 ? "#FBBF24" : "#60A5FA"})`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textSecondary }}>
                  <span>0</span>
                  <span>Low (30)</span>
                  <span>Medium (60)</span>
                  <span>High (85)</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Create Case Modal ── */}
      {showCreateModal && (
        <>
          <div onClick={() => { setShowCreateModal(false); setParentSearchQuery(""); }} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400,
            animation: "fadeIn 0.2s ease",
          }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 560, maxHeight: "90vh", background: "#fff", borderRadius: 16, zIndex: 401,
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)", animation: "scaleIn 0.2s ease",
            overflow: "hidden",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "22px 28px", borderBottom: `1px solid ${C.border}`,
              background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1E3A8A" }}>Yeni Vaka Oluştur</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#3B82F6" }}>{selectedTxns.size} işlem seçildi</p>
              </div>
              <button onClick={() => { setShowCreateModal(false); setParentSearchQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex", padding: 4 }}>
                <Icons.X />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "calc(90vh - 160px)" }}>
              {/* Vaka Adı */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Vaka Adı <span style={{ color: C.danger }}>*</span></label>
                <input type="text" placeholder="Örn: Şüpheli EFT Transferi"
                  value={caseForm.name} onChange={e => setCaseForm(f => ({ ...f, name: e.target.value }))}
                  style={{ ...inputStyle, borderColor: formErrors.name ? C.danger : C.border }} />
                {formErrors.name && <span style={errStyle}>{formErrors.name}</span>}
              </div>

              {/* Alan + Önem (2 col) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={labelStyle}>Alan (Domain)</label>
                  <div style={{
                    ...inputStyle, display: "flex", alignItems: "center", gap: 8,
                    background: "#F1F5F9", color: C.textSecondary, cursor: "not-allowed",
                  }}>
                    <span style={{ fontSize: 14 }}>{FRAUD_DOMAINS.find(d => d.id === selectedDomain)?.icon}</span>
                    <span style={{ fontWeight: 500, color: C.text }}>{FRAUD_DOMAINS.find(d => d.id === selectedDomain)?.label}</span>
                    <span style={{ marginLeft: "auto", display: "flex", color: "#94A3B8" }}><Icons.Lock /></span>
                  </div>
                  <span style={{ fontSize: 11, color: C.textSecondary, marginTop: 4, display: "block" }}>Sistem domain seçiminize göre belirlenir</span>
                </div>
                <div>
                  <label style={labelStyle}>Önem Derecesi <span style={{ color: C.danger }}>*</span></label>
                  <select value={caseForm.severity} onChange={e => setCaseForm(f => ({ ...f, severity: e.target.value }))}
                    style={{ ...inputStyle, borderColor: formErrors.severity ? C.danger : C.border }}>
                    <option value="">Seçiniz</option>
                    {SEVERITIES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                  {formErrors.severity && <span style={errStyle}>{formErrors.severity}</span>}
                </div>
              </div>

              {/* Atama */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Atama</label>
                <select value={caseForm.assignee} onChange={e => setCaseForm(f => ({ ...f, assignee: e.target.value }))}
                  style={inputStyle}>
                  <option value="">Unassigned (Atanmamış)</option>
                  {isManager
                    ? ACTIVE_USERS.map(u => <option key={u.id} value={u.name}>{u.name} — {u.role}</option>)
                    : <option value={user.name}>{user.name} (Kendime Ata)</option>
                  }
                </select>
                <span style={{ fontSize: 11, color: C.textSecondary, marginTop: 4, display: "block" }}>
                  {isManager ? "Herhangi bir aktif kullanıcıya atayabilirsiniz." : "Yalnızca kendinize atayabilir veya atanmamış bırakabilirsiniz."}
                </span>
              </div>

              {/* Açıklama */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Açıklama <span style={{ color: C.textSecondary, fontWeight: 400 }}>(Opsiyonel)</span></label>
                <textarea placeholder="Vaka hakkında ek notlar..."
                  value={caseForm.description} onChange={e => setCaseForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </div>

              {/* Üst Vaka (Parent Case) Seçimi */}
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icons.Link /> Üst Vaka (Parent Case)
                    <span style={{ color: C.textSecondary, fontWeight: 400 }}>(Opsiyonel)</span>
                  </span>
                </label>

                {/* Selected parent display */}
                {caseForm.parentCaseId ? (() => {
                  const pc = EXISTING_CASES.find(c => c.id === caseForm.parentCaseId);
                  if (!pc) return null;
                  const sevCfg = SEV_COLORS[pc.severity.charAt(0).toUpperCase() + pc.severity.slice(1)] || SEV_COLORS.Medium;
                  return (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      borderRadius: 8, border: `1px solid ${C.primaryLight}40`,
                      background: `${C.primaryBg}`, marginBottom: 10,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                      }}>
                        #{pc.id}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pc.name}</div>
                        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
                          {pc.assignee} · {pc.txnCount} işlem · {pc.date}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                        background: sevCfg.bg, color: sevCfg.color, border: `1px solid ${sevCfg.border}`,
                        textTransform: "capitalize", flexShrink: 0,
                      }}>{pc.severity}</span>
                      <button onClick={() => setCaseForm(f => ({ ...f, parentCaseId: null }))} style={{
                        background: "none", border: "none", cursor: "pointer", color: C.textSecondary,
                        display: "flex", padding: 2, flexShrink: 0,
                      }}>
                        <Icons.X />
                      </button>
                    </div>
                  );
                })() : null}

                {/* Search + Case List */}
                {!caseForm.parentCaseId && (
                  <div style={{
                    border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden",
                  }}>
                    {/* Search input */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "0 12px", borderBottom: `1px solid ${C.border}`, background: "#F8FAFC",
                    }}>
                      <Icons.Search />
                      <input
                        type="text" placeholder="Vaka ID veya adı ile ara..."
                        value={parentSearchQuery}
                        onChange={e => setParentSearchQuery(e.target.value)}
                        style={{
                          flex: 1, border: "none", background: "transparent", padding: "9px 0",
                          fontSize: 12.5, outline: "none", color: C.text,
                        }}
                      />
                      {parentSearchQuery && (
                        <button onClick={() => setParentSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 2 }}>
                          <Icons.X />
                        </button>
                      )}
                    </div>

                    {/* Case list */}
                    <div style={{ maxHeight: 180, overflow: "auto" }}>
                      {EXISTING_CASES
                        .filter(c => {
                          if (!parentSearchQuery) return true;
                          const q = parentSearchQuery.toLowerCase();
                          return String(c.id).includes(q) || c.name.toLowerCase().includes(q) || c.assignee.toLowerCase().includes(q);
                        })
                        .map(c => {
                          const sevCfg = SEV_COLORS[c.severity.charAt(0).toUpperCase() + c.severity.slice(1)] || SEV_COLORS.Medium;
                          const domainInfo = FRAUD_DOMAINS.find(d => d.id === c.domain);
                          return (
                            <div
                              key={c.id}
                              onClick={() => { setCaseForm(f => ({ ...f, parentCaseId: c.id })); setParentSearchQuery(""); }}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "9px 14px", cursor: "pointer",
                                borderBottom: `1px solid ${C.border}`,
                                transition: "background 0.1s ease",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                              <span style={{
                                fontSize: 11, fontWeight: 700, color: C.primaryLight,
                                fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, width: 48,
                              }}>#{c.id}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                                <div style={{ fontSize: 10.5, color: C.textSecondary, marginTop: 1, display: "flex", alignItems: "center", gap: 6 }}>
                                  {domainInfo && <span>{domainInfo.icon}</span>}
                                  <span>{c.assignee}</span>
                                  <span>·</span>
                                  <span>{c.txnCount} işlem</span>
                                  <span>·</span>
                                  <span>{c.date}</span>
                                </div>
                              </div>
                              <span style={{
                                fontSize: 9.5, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                                background: sevCfg.bg, color: sevCfg.color, border: `1px solid ${sevCfg.border}`,
                                textTransform: "capitalize", flexShrink: 0,
                              }}>{c.severity}</span>
                            </div>
                          );
                        })
                      }
                      {EXISTING_CASES.filter(c => {
                        if (!parentSearchQuery) return true;
                        const q = parentSearchQuery.toLowerCase();
                        return String(c.id).includes(q) || c.name.toLowerCase().includes(q) || c.assignee.toLowerCase().includes(q);
                      }).length === 0 && (
                        <div style={{ padding: "20px 14px", textAlign: "center", color: C.textSecondary, fontSize: 12.5 }}>
                          Eşleşen vaka bulunamadı
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <span style={{ fontSize: 11, color: C.textSecondary, marginTop: 6, display: "block" }}>
                  Oluşturulacak vaka seçilen üst vakanın alt vakası (child) olarak ilişkilendirilir.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 28px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, background: "#F8FAFC", flexWrap: "wrap" }}>
              {formErrors.txns && (
                <span style={{ ...errStyle, marginTop: 0, marginRight: "auto" }}>{formErrors.txns}</span>
              )}
              <button onClick={() => { setShowCreateModal(false); setParentSearchQuery(""); setFormErrors({}); }} style={{
                padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: "#fff", color: C.textSecondary, fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}>İptal</button>
              <button onClick={handleCreateCase} disabled={submitting} style={{
                padding: "10px 24px", borderRadius: 8, border: "none",
                background: submitting ? "#94A3B8" : "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: submitting ? "none" : "0 4px 14px rgba(30,64,175,0.3)",
                opacity: submitting ? 0.8 : 1,
              }}>{submitting ? "Oluşturuluyor..." : "Oluştur"}</button>
            </div>
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 500,
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 22px", borderRadius: 12,
          background: toast.type === "success" ? "#ECFDF5" : "#FEF2F2",
          border: `1px solid ${toast.type === "success" ? "#A7F3D0" : "#FECACA"}`,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)", animation: "slideUp 0.3s ease",
          maxWidth: 420,
        }}>
          <span style={{ color: toast.type === "success" ? C.success : C.danger, flexShrink: 0 }}>
            {toast.type === "success" ? <Icons.CheckCircle /> : <Icons.AlertTriangle />}
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: toast.type === "success" ? "#065F46" : "#991B1B", lineHeight: 1.4 }}>
            {toast.msg}
          </span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", padding: 0, flexShrink: 0 }}>
            <Icons.X />
          </button>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }
        input[type="checkbox"] { cursor: pointer; }
        select { cursor: pointer; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
}

// ─── Shared Styles ───
const pgBtn = {
  width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0",
  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 12, fontWeight: 500, cursor: "pointer", color: "#64748B",
};
const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6,
};
const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid #E2E8F0", fontSize: 13, background: "#F8FAFC",
  outline: "none", color: "#0F172A", boxSizing: "border-box",
};
const errStyle = { fontSize: 11, color: "#DC2626", marginTop: 4, display: "block" };
