import { useState, useEffect, useCallback, useRef } from "react";

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

// Generate 60 transactions across all statuses
const generateTransactions = () => {
  const sources = ["payment_fraud", "cc_fraud", "app_fraud", "ato_fraud", "int_fraud"];
  const sourceLabels = { payment_fraud: "Payment Fraud", cc_fraud: "Credit Card Fraud", app_fraud: "Application Fraud", ato_fraud: "Account Takeover", int_fraud: "Internal Fraud" };
  const sourceColors = { payment_fraud: "#3B82F6", cc_fraud: "#8B5CF6", app_fraud: "#F59E0B", ato_fraud: "#EF4444", int_fraud: "#6366F1" };
  const entityTypes = ["Customer", "Account", "Card", "Device"];
  const severities = ["Low", "Medium", "High", "Critical"];
  const severityScores = { Low: [10, 30], Medium: [31, 60], High: [61, 85], Critical: [86, 99] };
  const allStatuses = ["Marked", "Unmarked", "Case Assigned", "Under Review"];
  const customerNames = ["Ahmet Kara", "Fatma Demir", "Murat Yılmaz", "Zehra Aksoy", "Emre Çelik", "Sude Öztürk", "Ali Koç", "Deniz Aydın", "Baran Şimşek", "Naz Erdem"];
  const triggerRules = ["RULE-101", "RULE-205", "RULE-312", "RULE-418", "RULE-507", "RULE-623", "RULE-734", "RULE-891", "RULE-156", "RULE-277"];

  return Array.from({ length: 60 }, (_, i) => {
    const src = sources[i % sources.length];
    const sev = i < 10 ? "Critical" : i < 25 ? "High" : i < 42 ? "Medium" : severities[Math.floor(Math.random() * severities.length)];
    const range = severityScores[sev];
    const status = allStatuses[Math.floor(Math.random() * allStatuses.length)];
    const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    const month = String(Math.floor(Math.random() * 3) + 1).padStart(2, "0");
    const hour = String(Math.floor(Math.random() * 24)).padStart(2, "0");
    const min = String(Math.floor(Math.random() * 60)).padStart(2, "0");
    const currency = ["TRY", "USD", "EUR"][Math.floor(Math.random() * 3)];
    const amount = Math.floor(Math.random() * 500000) + 500;

    return {
      id: `TRX-${String(900100 + i)}`,
      source: src,
      sourceLabel: sourceLabels[src],
      sourceColor: sourceColors[src],
      entityType,
      entityKey: entityType === "Customer" ? `C${100000 + Math.floor(Math.random() * 900000)}` :
        entityType === "Account" ? `TR${Math.floor(Math.random() * 9000000000) + 1000000000}` :
        entityType === "Card" ? `**** **** **** ${String(Math.floor(Math.random() * 9000) + 1000)}` :
        `DEV-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      severity: sev,
      score: Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0],
      triggerRule: triggerRules[Math.floor(Math.random() * triggerRules.length)],
      markStatus: status,
      createDate: `${day}.${month}.2026 ${hour}:${min}`,
      caseId: status === "Case Assigned" ? `#${2400 + Math.floor(Math.random() * 70)}` : null,
      amount,
      currency,
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      customerNo: `C${100000 + Math.floor(Math.random() * 900000)}`,
    };
  });
};

const TRANSACTIONS = generateTransactions();

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

const _UNUSED_QuickSearchOverlay = ({ isOpen, onClose, onSelectTransaction }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) { setQuery(""); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  const results = query.length >= 2 ? TRANSACTIONS.filter(t => {
    const q = query.toLowerCase();
    return t.id.toLowerCase().includes(q) || t.customerNo.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) || t.entityKey.toLowerCase().includes(q);
  }).slice(0, 8) : [];

  const handleKeyDown = (e) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(results.length - 1, i + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(0, i - 1)); }
    if (e.key === "Enter" && results[selectedIndex]) { onSelectTransaction(results[selectedIndex]); onClose(); }
  };

  if (!isOpen) return null;

  return (<>
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(4px)", zIndex: 9000, animation: "qsFadeIn 0.15s ease",
    }} />
    <div style={{
      position: "fixed", top: "18%", left: "50%", transform: "translateX(-50%)",
      width: 580, maxHeight: "60vh", background: "#fff", borderRadius: 16,
      boxShadow: "0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)",
      zIndex: 9001, display: "flex", flexDirection: "column", overflow: "hidden",
      animation: "qsSlideIn 0.2s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
        <Icons.Search />
        <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }} onKeyDown={handleKeyDown}
          placeholder="İşlem ID, Müşteri No veya Müşteri Adı ile hızlı arama..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: C.text, background: "transparent", fontFamily: "'DM Sans', sans-serif" }}
        />
        <kbd style={{ padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "#F1F5F9", color: C.textSecondary, border: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono', monospace" }}>ESC</kbd>
      </div>

      <div style={{ flex: 1, overflow: "auto", maxHeight: 400 }}>
        {query.length < 2 && (
          <div style={{ padding: "32px 20px", textAlign: "center", color: C.textSecondary }}>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>En az 2 karakter girerek FDM'deki son 3 aylık işlemler arasında hızlı arama yapın.</div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16 }}>
              {[{ label: "İşlem ID", example: "TRX-900" }, { label: "Müşteri No", example: "C100" }, { label: "Müşteri Adı", example: "Ahmet" }].map(hint => (
                <div key={hint.label} style={{ padding: "8px 14px", borderRadius: 8, background: "#F8FAFC", border: `1px solid ${C.border}`, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 2 }}>{hint.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textSecondary }}>{hint.example}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {query.length >= 2 && results.length === 0 && (
          <div style={{ padding: "32px 20px", textAlign: "center", color: C.textSecondary, fontSize: 13 }}>
            <span style={{ fontSize: 28, display: "block", marginBottom: 8, opacity: 0.4 }}>?</span>
            "{query}" ile eşleşen işlem bulunamadı.
          </div>
        )}

        {results.map((txn, idx) => {
          const sevStyle = SEVERITY_STYLES[txn.severity];
          const statusStyle = STATUS_STYLES[txn.markStatus];
          return (
            <div key={txn.id} onClick={() => { onSelectTransaction(txn); onClose(); }} onMouseEnter={() => setSelectedIndex(idx)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", cursor: "pointer",
                background: idx === selectedIndex ? "#F1F5F9" : "transparent",
                borderBottom: `1px solid ${idx === selectedIndex ? "transparent" : "#F8FAFC"}`,
                transition: "background 0.1s",
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: sevStyle.bg, border: `1.5px solid ${sevStyle.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: sevStyle.color, fontFamily: "'JetBrains Mono', monospace",
              }}>{txn.score}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.primaryLight, fontFamily: "'JetBrains Mono', monospace" }}>{txn.id}</span>
                  <span style={{ fontSize: 11, color: C.textSecondary }}>{txn.customerName}</span>
                  <Badge config={statusStyle} />
                </div>
                <div style={{ fontSize: 11.5, color: C.textSecondary, marginTop: 3, display: "flex", gap: 12 }}>
                  <span>{txn.sourceLabel}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{txn.entityKey}</span>
                  <span>{txn.createDate}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{formatCurrency(txn.amount, txn.currency)}</div>
                <div style={{ fontSize: 10, color: C.textSecondary }}>{txn.currency}</div>
              </div>
              <div style={{ color: idx === selectedIndex ? C.primaryLight : "transparent", transition: "color 0.1s" }}><Icons.ArrowRight /></div>
            </div>
          );
        })}
      </div>

      {query.length >= 2 && results.length > 0 && (
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.border}`, background: "#F8FAFC", display: "flex", gap: 16, fontSize: 11, color: C.textSecondary }}>
          {[{ key: "↑↓", label: "Gezin" }, { key: "Enter", label: "Detay aç" }, { key: "Esc", label: "Kapat" }].map(h => (
            <span key={h.key}><kbd style={{ padding: "1px 5px", borderRadius: 3, border: `1px solid ${C.border}`, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: "#fff" }}>{h.key}</kbd> {h.label}</span>
          ))}
        </div>
      )}
    </div>
    <style>{`
      @keyframes qsFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes qsSlideIn { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    `}</style>
  </>);
};


// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════
export default function SCMTransactionSearch({ onNavigate } = {}) {
  const [currentRole, setCurrentRole] = useState("analyst");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("txn_search");
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("payment");
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({ markStatus: "Tümü", entityType: "", entityId: "", scoreMin: "", scoreMax: "", dateFrom: "", dateTo: "", source: "", amountMin: "", amountMax: "" });
  const [colSearch, setColSearch] = useState({ id: "", source: "", entityType: "", entityKey: "", score: "", triggerRule: "", markStatus: "", date: "", amount: "", customer: "" });
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [displayCurrency, setDisplayCurrency] = useState("original");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [drawerTxn, setDrawerTxn] = useState(null);

  const user = USERS[currentRole];
  const sW = sidebarCollapsed ? 72 : 260;

  const activeFilterCount = Object.entries(filters).reduce((c, [k, v]) => c + (k === "markStatus" ? (v !== "Tümü" ? 1 : 0) : (v ? 1 : 0)), 0);

  const filtered = TRANSACTIONS.filter(t => {
    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase();
      if (!t.id.toLowerCase().includes(q) && !t.customerNo.toLowerCase().includes(q) && !t.customerName.toLowerCase().includes(q) && !t.entityKey.toLowerCase().includes(q)) return false;
    }
    if (colSearch.id && !t.id.toLowerCase().includes(colSearch.id.toLowerCase())) return false;
    if (colSearch.source && !t.sourceLabel.toLowerCase().includes(colSearch.source.toLowerCase())) return false;
    if (colSearch.entityType && !t.entityType.toLowerCase().includes(colSearch.entityType.toLowerCase())) return false;
    if (colSearch.entityKey && !t.entityKey.toLowerCase().includes(colSearch.entityKey.toLowerCase())) return false;
    if (colSearch.score && !String(t.score).includes(colSearch.score) && !t.severity.toLowerCase().includes(colSearch.score.toLowerCase())) return false;
    if (colSearch.triggerRule && !t.triggerRule.toLowerCase().includes(colSearch.triggerRule.toLowerCase())) return false;
    if (colSearch.markStatus && !t.markStatus.toLowerCase().includes(colSearch.markStatus.toLowerCase()) && !(STATUS_STYLES[t.markStatus]?.label || "").toLowerCase().includes(colSearch.markStatus.toLowerCase())) return false;
    if (colSearch.date && !t.createDate.includes(colSearch.date)) return false;
    if (colSearch.amount && !String(t.amount).includes(colSearch.amount)) return false;
    if (colSearch.customer && !t.customerName.toLowerCase().includes(colSearch.customer.toLowerCase()) && !t.customerNo.toLowerCase().includes(colSearch.customer.toLowerCase())) return false;
    if (filters.markStatus && filters.markStatus !== "Tümü" && t.markStatus !== filters.markStatus) return false;
    if (filters.entityType && !t.entityType.toLowerCase().includes(filters.entityType.toLowerCase())) return false;
    if (filters.entityId && !t.entityKey.toLowerCase().includes(filters.entityId.toLowerCase())) return false;
    if (filters.source && !t.sourceLabel.toLowerCase().includes(filters.source.toLowerCase())) return false;
    if (filters.scoreMin && t.score < parseInt(filters.scoreMin)) return false;
    if (filters.scoreMax && t.score > parseInt(filters.scoreMax)) return false;
    if (filters.amountMin && t.amount < parseInt(filters.amountMin)) return false;
    if (filters.amountMax && t.amount > parseInt(filters.amountMax)) return false;
    return true;
  });

  const SORT_ACCESSORS = {
    id: t => t.id, source: t => t.sourceLabel, entityType: t => t.entityType, entityKey: t => t.entityKey,
    score: t => t.score, triggerRule: t => t.triggerRule, markStatus: t => t.markStatus, customer: t => t.customerName,
    date: t => { const p = t.createDate.split(/[.\s:]/); return new Date(2026, parseInt(p[1]) - 1, parseInt(p[0]), parseInt(p[2] || 0), parseInt(p[3] || 0)); },
    amount: t => t.amount,
  };

  const sorted = sortCol ? [...filtered].sort((a, b) => {
    const av = SORT_ACCESSORS[sortCol](a), bv = SORT_ACCESSORS[sortCol](b);
    let cmp = typeof av === "number" && typeof bv === "number" ? av - bv : av instanceof Date && bv instanceof Date ? av - bv : String(av).localeCompare(String(bv), "tr");
    return sortDir === "asc" ? cmp : -cmp;
  }) : filtered;

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSort = (col) => {
    if (sortCol === col) { if (sortDir === "asc") setSortDir("desc"); else { setSortCol(null); setSortDir("asc"); } }
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ markStatus: "Tümü", entityType: "", entityId: "", scoreMin: "", scoreMax: "", dateFrom: "", dateTo: "", source: "", amountMin: "", amountMax: "" });
    setColSearch({ id: "", source: "", entityType: "", entityKey: "", score: "", triggerRule: "", markStatus: "", date: "", amount: "", customer: "" });
    setSearchQuery(""); setPage(1);
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", sublabel: "Ana Sayfa", icon: <Icons.Dashboard /> },
    { key: "case_creation", label: "Vaka Oluşturma", sublabel: "Case Creation", icon: <Icons.CaseCreate /> },
    { key: "cases", label: "Vaka Listesi", sublabel: "Case List", icon: <Icons.Cases /> },
    { key: "txn_search", label: "İşlem Arama", sublabel: "Transaction Search", icon: <Icons.TransactionSearch /> },
    { key: "reports", label: "Raporlar", sublabel: "Reports", icon: <Icons.Reports /> },
    ...(currentRole === "admin" ? [{ key: "settings", label: "Ayarlar", sublabel: "Settings", icon: <Icons.Settings /> }] : []),
  ];

  const tableCols = [
    { key: "id", label: "İşlem ID", w: 110 }, { key: "customer", label: "Müşteri", w: 140 },
    { key: "source", label: "Kaynak", w: 130 }, { key: "entityType", label: "Varlık Türü", w: 95 },
    { key: "entityKey", label: "Varlık Anahtarı", w: 150 }, { key: "score", label: "Skor", w: 80 },
    { key: "triggerRule", label: "Kural", w: 90 }, { key: "markStatus", label: "Durum", w: 115 },
    { key: "date", label: "Tarih", w: 120 },
    { key: "amount", label: displayCurrency === "original" ? "Tutar" : `Tutar (${displayCurrency})`, w: 130, align: "right" },
  ];

  const SortIcon = ({ col }) => sortCol !== col ? <span style={{ opacity: 0.3, fontSize: 10 }}>↕</span> : sortDir === "asc" ? <Icons.SortAsc /> : <Icons.SortDesc />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", ...(darkMode ? {filter:"invert(1) hue-rotate(180deg)"} : {}) }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* ════════ SIDEBAR ════════ */}
      <aside style={{ width: sW, background: C.sidebar, display: "flex", flexDirection: "column", transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0, zIndex: 100, position: "relative" }}>
        <div style={{ padding: sidebarCollapsed ? "20px 12px" : "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #3B82F6, #1E40AF)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>S</div>
            {!sidebarCollapsed && <div><div style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>SADE SCM</div><div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.05em" }}>Case Management</div></div>}
          </div>
        </div>

        <div style={{ padding: sidebarCollapsed ? "12px 8px" : "12px 16px" }}>
          <button onClick={() => setDomainMenuOpen(!domainMenuOpen)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", cursor: "pointer", color: "#E2E8F0", justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
            <span style={{ fontSize: 16 }}>{FRAUD_DOMAINS.find(d => d.id === selectedDomain)?.icon}</span>
            {!sidebarCollapsed && <><span style={{ fontSize: 12.5, fontWeight: 500, flex: 1, textAlign: "left" }}>{FRAUD_DOMAINS.find(d => d.id === selectedDomain)?.label}</span><Icons.ChevronDown /></>}
          </button>
          {domainMenuOpen && (
            <div style={{ marginTop: 4, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              {FRAUD_DOMAINS.map(domain => (
                <div key={domain.id} onClick={() => { setSelectedDomain(domain.id); setDomainMenuOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", cursor: "pointer", background: selectedDomain === domain.id ? "rgba(59,130,246,0.15)" : "transparent", color: selectedDomain === domain.id ? "#60A5FA" : "#CBD5E1", transition: "all 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = selectedDomain === domain.id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = selectedDomain === domain.id ? "rgba(59,130,246,0.15)" : "transparent"}>
                  <span style={{ fontSize: 13 }}>{domain.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: selectedDomain === domain.id ? 600 : 400 }}>{domain.label}</span>
                  {selectedDomain === domain.id && <span style={{ marginLeft: "auto", color: "#60A5FA", display: "flex" }}><Icons.Check /></span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setActiveNav(item.key); if (onNavigate) onNavigate(item.key); }} title={sidebarCollapsed ? item.label : undefined}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarCollapsed ? "12px 16px" : "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: activeNav === item.key ? "rgba(59,130,246,0.15)" : "transparent", color: activeNav === item.key ? "#60A5FA" : "#94A3B8", transition: "all 0.15s", width: "100%", textAlign: "left", justifyContent: sidebarCollapsed ? "center" : "flex-start" }}
              onMouseEnter={e => { if (activeNav !== item.key) e.currentTarget.style.background = C.sidebarHover; }}
              onMouseLeave={e => { if (activeNav !== item.key) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
              {!sidebarCollapsed && <div><div style={{ fontSize: 13.5, fontWeight: activeNav === item.key ? 600 : 500, lineHeight: 1.3 }}>{item.label}</div><div style={{ fontSize: 10.5, color: "#475569", lineHeight: 1.2 }}>{item.sublabel}</div></div>}
            </button>
          ))}
        </nav>

        <div style={{ padding: sidebarCollapsed ? "16px 8px" : "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
            <div onClick={() => setShowUserMenu(!showUserMenu)} style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{user.name.split(" ").map(n => n[0]).join("")}</div>
            {!sidebarCollapsed && <div onClick={() => setShowUserMenu(!showUserMenu)} style={{ flex: 1, overflow: "hidden", cursor: "pointer" }}><div style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user.name}</div><div style={{ color: "#64748B", fontSize: 11 }}>{user.roleLabel}</div></div>}
            {/* Dark Mode Toggle */}
            <button onClick={e => { e.stopPropagation(); setDarkMode(d => !d); }} title={darkMode ? "Açık Mod" : "Koyu Mod"} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", flexShrink: 0 }}>
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button onClick={e => { e.stopPropagation(); setShowNotifications(!showNotifications); }} style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: showNotifications ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: showNotifications ? "#60A5FA" : "#94A3B8" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = showNotifications ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}>
                <Icons.Bell />
                <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0F172A" }}>3</span>
              </button>
              {showNotifications && (
                <div onClick={e => e.stopPropagation()} style={{ position: "fixed", bottom: 72, left: sidebarCollapsed ? 80 : 268, width: 360, background: "#fff", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.15)", border: `1px solid ${C.border}`, zIndex: 200, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Bildirimler</div></div>
                  <div style={{ maxHeight: 300, overflow: "auto" }}>
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} style={{ display: "flex", gap: 10, padding: "12px 20px", borderBottom: "1px solid #F8FAFC", background: n.unread ? "#FAFBFE" : "#fff" }}>
                        {n.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primaryLight, flexShrink: 0, marginTop: 6 }} />}
                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{n.msg}</div><div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3 }}>{n.time}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {showUserMenu && (
            <div onClick={e => e.stopPropagation()} style={{ position: "fixed", bottom: 72, left: sidebarCollapsed ? 80 : 268, background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: 180, zIndex: 400, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#64748B" }}>{user.name}</div>
              <button onClick={() => setShowUserMenu(false)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#EF4444", textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><Icons.LogOut /> Çıkış Yap</button>
            </div>
          )}
        </div>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ position: "absolute", top: 24, right: -14, width: 28, height: 28, borderRadius: "50%", border: `2px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 101, transform: sidebarCollapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s ease" }}><Icons.ChevronRight /></button>
      </aside>

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
                <button key={role} onClick={() => setCurrentRole(role)} style={{ padding: "6px 14px", fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", background: currentRole === role ? C.primary : "#fff", color: currentRole === role ? "#fff" : C.textSecondary, transition: "all 0.15s" }}>
                  {role === "analyst" ? "Analist" : role === "manager" ? "Yönetici" : role === "admin" ? "Admin" : "Super"}
                </button>
              ))}
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: C.textSecondary }}><Icons.Globe /> TR</button>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: 28 }} onClick={() => { setShowNotifications(false); setDomainMenuOpen(false); setShowUserMenu(false); }}>
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
              { label: "Toplam İşlem", value: TRANSACTIONS.length, color: C.primary, sub: "Son 3 ay" },
              { label: "İşaretli", value: TRANSACTIONS.filter(t => t.markStatus === "Marked").length, color: C.warning, sub: "Marked" },
              { label: "Vakaya Atanan", value: TRANSACTIONS.filter(t => t.markStatus === "Case Assigned").length, color: C.primaryLight, sub: "Case Assigned" },
              { label: "Kritik Skorlu", value: TRANSACTIONS.filter(t => t.severity === "Critical").length, color: C.danger, sub: "Skor ≥ 86" },
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, maxWidth: 420, background: "#F8FAFC", borderRadius: 8, border: `1px solid ${C.border}`, padding: "0 12px" }}>
                <Icons.Search />
                <input type="text" placeholder="İşlem ID, Müşteri No veya Müşteri Adı ile ara..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  style={{ flex: 1, border: "none", background: "transparent", padding: "10px 0", fontSize: 13, outline: "none", color: C.text }} />
                {searchQuery && <button onClick={() => { setSearchQuery(""); setPage(1); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 2 }}><Icons.X /></button>}
              </div>
              <button onClick={() => setShowFilterPanel(!showFilterPanel)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: `1px solid ${showFilterPanel ? C.primaryLight : C.border}`, background: showFilterPanel ? C.primaryBg : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: showFilterPanel ? C.primary : C.textSecondary }}>
                <Icons.Filter /> Filtreler
                {activeFilterCount > 0 && <span style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: C.primary, color: "#fff" }}>{activeFilterCount}</span>}
              </button>
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
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 22px", marginBottom: 16, animation: "fadeSlideDown 0.2s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>İşaretlenme Durumu</label>
                  <select value={filters.markStatus} onChange={e => { setFilters(f => ({ ...f, markStatus: e.target.value })); setPage(1); }} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC", color: C.text }}>
                    <option value="Tümü">Tümü</option><option value="Marked">Marked (İşaretli)</option><option value="Unmarked">Unmarked (İşaretsiz)</option><option value="Case Assigned">Case Assigned (Vakaya Atandı)</option><option value="Under Review">Under Review (İncelemede)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>İşlem Kaynağı</label>
                  <select value={filters.source} onChange={e => { setFilters(f => ({ ...f, source: e.target.value })); setPage(1); }} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC", color: C.text }}>
                    <option value="">Tümü</option><option value="Payment Fraud">Payment Fraud</option><option value="Credit Card Fraud">Credit Card Fraud</option><option value="Application Fraud">Application Fraud</option><option value="Account Takeover">Account Takeover</option><option value="Internal Fraud">Internal Fraud</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>Varlık Türü</label>
                  <select value={filters.entityType} onChange={e => { setFilters(f => ({ ...f, entityType: e.target.value, entityId: "" })); setPage(1); }} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC", color: C.text }}>
                    <option value="">Tümü</option><option value="Customer">Müşteri</option><option value="Account">Hesap</option><option value="Card">Kart</option><option value="Device">Cihaz</option>
                  </select>
                </div>
                {filters.entityType && (
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>
                      {{ Customer: "Müşteri", Account: "Hesap", Card: "Kart", Device: "Cihaz" }[filters.entityType]} ID
                    </label>
                    <input type="text" placeholder={`${{ Customer: "Müşteri", Account: "Hesap", Card: "Kart", Device: "Cihaz" }[filters.entityType]} ID giriniz...`} value={filters.entityId} onChange={e => { setFilters(f => ({ ...f, entityId: e.target.value })); setPage(1); }} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC", color: C.text, boxSizing: "border-box" }} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>Fraud Skoru Aralığı</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="number" placeholder="Min" value={filters.scoreMin} onChange={e => { setFilters(f => ({ ...f, scoreMin: e.target.value })); setPage(1); }} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC" }} />
                    <input type="number" placeholder="Max" value={filters.scoreMax} onChange={e => { setFilters(f => ({ ...f, scoreMax: e.target.value })); setPage(1); }} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>Tutar Aralığı</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="number" placeholder="Min" value={filters.amountMin} onChange={e => { setFilters(f => ({ ...f, amountMin: e.target.value })); setPage(1); }} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC" }} />
                    <input type="number" placeholder="Max" value={filters.amountMax} onChange={e => { setFilters(f => ({ ...f, amountMax: e.target.value })); setPage(1); }} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC" }} />
                  </div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>Tarih Aralığı</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC" }} />
                    <span style={{ display: "flex", alignItems: "center", color: C.textSecondary, fontSize: 12 }}>—</span>
                    <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, outline: "none", background: "#F8FAFC" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 12.5, color: C.textSecondary }}>
              <strong style={{ color: C.text }}>{filtered.length}</strong> işlem bulundu
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
                  {paginated.length === 0 && <tr><td colSpan={tableCols.length + 1} style={{ padding: "48px 20px", textAlign: "center", color: C.textSecondary, fontSize: 13 }}>Arama kriterlerine uygun işlem bulunamadı.</td></tr>}
                  {paginated.map(txn => {
                    const sevStyle = SEVERITY_STYLES[txn.severity];
                    const statusStyle = STATUS_STYLES[txn.markStatus];
                    const displayAmount = displayCurrency === "original" ? txn.amount : convertAmount(txn.amount, txn.currency, displayCurrency);
                    const displayCurr = displayCurrency === "original" ? txn.currency : displayCurrency;
                    return (
                      <tr key={txn.id} onClick={() => setDrawerTxn(txn)} style={{ cursor: "pointer", borderBottom: "1px solid #F1F5F9", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "11px 14px", fontWeight: 600, color: C.primaryLight, fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5 }}>{txn.id}</td>
                        <td style={{ padding: "11px 14px" }}><div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{txn.customerName}</div><div style={{ fontSize: 10.5, color: C.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{txn.customerNo}</div></td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${txn.sourceColor}15`, color: txn.sourceColor, border: `1px solid ${txn.sourceColor}30` }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: txn.sourceColor }} />{txn.sourceLabel.split(" ")[0]}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12.5, color: C.text }}>{txn.entityType}</td>
                        <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.text }}>{txn.entityKey}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 30, height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}><div style={{ width: `${txn.score}%`, height: "100%", borderRadius: 3, background: sevStyle.color }} /></div>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: sevStyle.color, fontFamily: "'JetBrains Mono', monospace" }}>{txn.score}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: C.textSecondary }}>{txn.triggerRule}</td>
                        <td style={{ padding: "11px 14px" }}><Badge config={statusStyle} /></td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: C.textSecondary }}>{txn.createDate}</td>
                        <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 600, color: C.text }}>
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
                <span style={{ fontSize: 12.5, color: C.textSecondary, marginRight: 8 }}>{(page - 1) * perPage + 1}–{Math.min(page * perPage, sorted.length)} / {sorted.length}</span>
                {(() => {
                  const pgBtn = { width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.textSecondary };
                  const pages = []; const maxV = 5;
                  let start = Math.max(1, page - Math.floor(maxV / 2)); let end = Math.min(totalPages, start + maxV - 1);
                  if (end - start < maxV - 1) start = Math.max(1, end - maxV + 1);
                  for (let p = start; p <= end; p++) pages.push(p);
                  return (<>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...pgBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer", transform: "rotate(180deg)" }}><Icons.ChevronRight /></button>
                    {pages.map(p => <button key={p} onClick={() => setPage(p)} style={{ ...pgBtn, background: page === p ? C.primary : "#fff", color: page === p ? "#fff" : C.textSecondary, fontWeight: page === p ? 700 : 500, border: page === p ? "none" : `1px solid ${C.border}` }}>{p}</button>)}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...pgBtn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}><Icons.ChevronRight /></button>
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
