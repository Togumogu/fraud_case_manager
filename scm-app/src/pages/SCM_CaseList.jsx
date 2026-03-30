import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import FilterBar from "../components/FilterBar";
import { approvals as approvalsApi, cases as casesApi } from "../api/client";

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", roleLabel: "Fraud Analist" },
  manager: { id: 2, name: "Burak Şen", role: "manager", roleLabel: "Yönetici" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", roleLabel: "Admin" },
};

const ACTIVE_USERS = [
  { id: 1, name: "Elif Yılmaz", role: "Fraud Analist" },
  { id: 4, name: "Mehmet Öz", role: "Fraud Analist" },
  { id: 5, name: "Ayşe Tan", role: "Fraud Analist" },
  { id: 6, name: "Can Yıldız", role: "Fraud Analist" },
  { id: 7, name: "Selin Aydın", role: "İnceleyici" },
  { id: 2, name: "Burak Şen", role: "Yönetici" },
];

const FRAUD_DOMAINS = [
  { id: "payment", label: "Payment Fraud", icon: "₺" },
  { id: "credit_card", label: "Credit Card Fraud", icon: "💳" },
  { id: "application", label: "Application Fraud", icon: "📋" },
  { id: "account_takeover", label: "Account Takeover", icon: "🔓" },
  { id: "internal", label: "Internal Fraud", icon: "🏢" },
];

const FX_RATES = { TRY: { TRY: 1, USD: 0.0278 }, USD: { TRY: 36.0, USD: 1 }, EUR: { TRY: 39.0, USD: 1.087 } };
const convertAmount = (amount, from, to) => from === to ? amount : Math.round(amount * FX_RATES[from][to]);

const STATUS_CONFIG = {
  Open: { label: "Open", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  Closed: { label: "Closed", bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  "Pending Closure": { label: "Pending Closure", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  "Pending Reopen": { label: "Pending Reopen", bg: "#EDE9FE", color: "#5B21B6", border: "#DDD6FE" },
  "Pending Delete": { label: "Pending Delete", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  Deleted: { label: "Deleted", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
};
const SEVERITY_CONFIG = {
  critical: { label: "Kritik", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  high: { label: "Yüksek", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  medium: { label: "Orta", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  low: { label: "Düşük", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};

const REVIEW_REQUESTS = [
  { id: 1, caseId: 2470, caseName: "Çoklu Kanal Fraud", requestedBy: "Mehmet Öz", requestedAt: "06.03.2026 10:15" },
  { id: 2, caseId: 2463, caseName: "Sahte Kimlik Başvurusu", requestedBy: "Ayşe Tan", requestedAt: "05.03.2026 14:30" },
  { id: 3, caseId: 2458, caseName: "Mobil Bankacılık Fraud", requestedBy: "Can Yıldız", requestedAt: "04.03.2026 09:45" },
];
const PENDING_APPROVALS = [
  { id: 1, type: "case_close", caseId: 2469, caseName: "Sahte Belge Dolandırıcılığı", requestedBy: "Elif Yılmaz", requestedAt: "05.03.2026 14:22", reason: "Soruşturma Tamamlandı" },
  { id: 2, type: "case_close", caseId: 2466, caseName: "Online Bankacılık Fraud", requestedBy: "Mehmet Öz", requestedAt: "05.03.2026 11:05", reason: "Çözüme Kavuşturuldu" },
  { id: 3, type: "case_delete", caseId: 2455, caseName: "Test Vakası", requestedBy: "Can Yıldız", requestedAt: "04.03.2026 16:30", reason: "Mükerrer" },
];

const generateCases = () => [
  { id: 2471, name: "Şüpheli EFT Transferi", status: "Open", severity: "critical", owner: null, createUser: "Elif Yılmaz", createDate: "06.03.2026", updateUser: "Elif Yılmaz", updateDate: "06.03.2026", totalAmount: 284500, currency: "TRY" },
  { id: 2470, name: "Çoklu Kanal Fraud", status: "Open", severity: "high", owner: "Mehmet Öz", createUser: "Burak Şen", createDate: "06.03.2026", updateUser: "Mehmet Öz", updateDate: "06.03.2026", totalAmount: 157200, currency: "TRY" },
  { id: 2469, name: "Sahte Belge Dolandırıcılığı", status: "Pending Closure", severity: "high", owner: "Elif Yılmaz", createUser: "Elif Yılmaz", createDate: "05.03.2026", updateUser: "Elif Yılmaz", updateDate: "06.03.2026", totalAmount: 92000, currency: "TRY" },
  { id: 2468, name: "Kart Dolandırıcılığı", status: "Closed", severity: "medium", owner: "Ayşe Tan", createUser: "Ayşe Tan", createDate: "05.03.2026", updateUser: "Burak Şen", updateDate: "06.03.2026", totalAmount: 43750, currency: "TRY" },
  { id: 2467, name: "Başvuru Sahteciliği", status: "Open", severity: "medium", owner: null, createUser: "Can Yıldız", createDate: "05.03.2026", updateUser: "Can Yıldız", updateDate: "05.03.2026", totalAmount: 0, currency: "TRY" },
  { id: 2466, name: "Online Bankacılık Fraud", status: "Pending Closure", severity: "medium", owner: "Mehmet Öz", createUser: "Mehmet Öz", createDate: "04.03.2026", updateUser: "Mehmet Öz", updateDate: "05.03.2026", totalAmount: 178300, currency: "USD" },
  { id: 2465, name: "Hesap Ele Geçirme", status: "Open", severity: "critical", owner: "Ayşe Tan", createUser: "Burak Şen", createDate: "04.03.2026", updateUser: "Ayşe Tan", updateDate: "05.03.2026", totalAmount: 520000, currency: "TRY" },
  { id: 2464, name: "İç Fraud Şüphesi", status: "Open", severity: "high", owner: null, createUser: "Burak Şen", createDate: "05.03.2026", updateUser: "Burak Şen", updateDate: "05.03.2026", totalAmount: 65000, currency: "TRY" },
  { id: 2463, name: "Sahte Kimlik Başvurusu", status: "Open", severity: "medium", owner: "Elif Yılmaz", createUser: "Elif Yılmaz", createDate: "04.03.2026", updateUser: "Elif Yılmaz", updateDate: "05.03.2026", totalAmount: 31200, currency: "TRY" },
  { id: 2462, name: "Dijital Cüzdan Fraud", status: "Open", severity: "low", owner: "Can Yıldız", createUser: "Selin Aydın", createDate: "03.03.2026", updateUser: "Can Yıldız", updateDate: "04.03.2026", totalAmount: 8900, currency: "TRY" },
  { id: 2461, name: "Dijital Cüzdan Kötüye Kullanım", status: "Open", severity: "medium", owner: null, createUser: "Can Yıldız", createDate: "04.03.2026", updateUser: "Can Yıldız", updateDate: "04.03.2026", totalAmount: 14500, currency: "EUR" },
  { id: 2460, name: "POS Dolandırıcılığı", status: "Closed", severity: "high", owner: "Mehmet Öz", createUser: "Mehmet Öz", createDate: "02.03.2026", updateUser: "Burak Şen", updateDate: "04.03.2026", totalAmount: 198000, currency: "TRY" },
  { id: 2459, name: "ATM Skimming", status: "Closed", severity: "critical", owner: "Elif Yılmaz", createUser: "Elif Yılmaz", createDate: "01.03.2026", updateUser: "Elif Yılmaz", updateDate: "03.03.2026", totalAmount: 345600, currency: "TRY" },
  { id: 2458, name: "Mobil Bankacılık Fraud", status: "Open", severity: "high", owner: "Ayşe Tan", createUser: "Burak Şen", createDate: "01.03.2026", updateUser: "Ayşe Tan", updateDate: "03.03.2026", totalAmount: 72400, currency: "TRY" },
  { id: 2457, name: "Kredi Başvurusu Fraud", status: "Open", severity: "low", owner: "Can Yıldız", createUser: "Can Yıldız", createDate: "28.02.2026", updateUser: "Can Yıldız", updateDate: "02.03.2026", totalAmount: 250000, currency: "TRY" },
  { id: 2456, name: "Çek Dolandırıcılığı", status: "Closed", severity: "medium", owner: "Elif Yılmaz", createUser: "Elif Yılmaz", createDate: "27.02.2026", updateUser: "Burak Şen", updateDate: "01.03.2026", totalAmount: 56700, currency: "TRY" },
  { id: 2455, name: "Test Vakası", status: "Deleted", severity: "low", owner: "Can Yıldız", createUser: "Can Yıldız", createDate: "25.02.2026", updateUser: "Burak Şen", updateDate: "28.02.2026", totalAmount: 0, currency: "TRY" },
];

// ═══════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════
const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  CaseCreate: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Cases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  MyCases: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Export: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  MoreV: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  ChevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Eye: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Assign: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  Sort: ({ dir }) => dir === "asc" ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg> : dir === "desc" ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.3"><path d="M7 10l5-5 5 5zM7 14l5 5 5-5z"/></svg>,
  Review: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Approval: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  DeletedCases: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  TransactionSearch: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Globe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};

const COLORS = {
  sidebar: "#0F172A", sidebarHover: "#1E293B", sidebarActive: "#1E40AF",
  primary: "#1E40AF", primaryLight: "#3B82F6",
  bg: "#F1F5F9", text: "#0F172A", textSecondary: "#64748B",
  border: "#E2E8F0", success: "#059669", warning: "#D97706", danger: "#DC2626",
};

const formatCurrency = (a, c) => ({ TRY: "₺", USD: "$", EUR: "€" }[c] || "") + a.toLocaleString("tr-TR");
const Badge = ({ config }) => <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.border}`, whiteSpace: "nowrap" }}>{config.label}</span>;
const colInputStyle = { width: "100%", padding: "5px 7px", borderRadius: 5, fontSize: 11, border: `1px solid ${COLORS.border}`, outline: "none", boxSizing: "border-box", background: "#fff" };

// ═══════════════════════════════════════════════════════════════
// DRAWER (no Düzenle button)
// ═══════════════════════════════════════════════════════════════
const CaseDrawer = ({ caseData, onClose, onNavigate }) => {
  if (!caseData) return null;
  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 440, background: "#fff", boxShadow: "-8px 0 30px rgba(0,0,0,0.12)", zIndex: 1000, display: "flex", flexDirection: "column", animation: "slideIn 0.25s ease-out" }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 }}>VAKA #{caseData.id}</div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{caseData.name}</h2>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}><Badge config={STATUS_CONFIG[caseData.status]} /><Badge config={SEVERITY_CONFIG[caseData.severity]} /></div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, color: COLORS.textSecondary }}><Icons.X /></button>
      </div>
      <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
        {[["Atanan", caseData.owner || "Atanmamış"], ["Oluşturan", caseData.createUser], ["Oluşturma Tarihi", caseData.createDate], ["Son Güncelleyen", caseData.updateUser], ["Güncelleme Tarihi", caseData.updateDate], ["Para Birimi", caseData.currency], ["Toplam Tutar", formatCurrency(caseData.totalAmount, caseData.currency)]].map(([l, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
            <span style={{ color: COLORS.textSecondary }}>{l}</span>
            <span style={{ fontWeight: 600, color: v === "Atanmamış" ? COLORS.warning : COLORS.text }}>{v}</span>
          </div>
        ))}
        <button onClick={() => { onClose(); if (onNavigate) onNavigate("case_detail", caseData); }} style={{ width: "100%", marginTop: 24, padding: "10px 16px", background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Detayları Gör</button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function SCMCaseList({ onNavigate, cases: casesProp, casesLoading = false, onCaseUpdated, initialNavKey = "cases", currentRole = "analyst", onRoleChange, selectedDomain = "payment", onDomainChange, myCasesCount = 0, pendingApprovalsCount = 0, reviewCount = 0, notifications = [], onMarkAllRead, onMarkRead, showToast } = {}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const cases = casesProp ?? [];
  const NAVKEY_TO_VIEW = { cases: "case_list", my_cases: "my_cases", pending_approvals: "approvals", deleted_cases: "deleted" };
  const [activeView, setActiveView] = useState(NAVKEY_TO_VIEW[initialNavKey] || "case_list");

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: [], severity: [], owner: "", dateFrom: "", dateTo: "" });
  const [colSearch, setColSearch] = useState({ id: "", name: "", status: "", severity: "", owner: "", createDate: "", updateDate: "", totalAmount: "" });
  const [displayCurrency, setDisplayCurrency] = useState("original");

  const [sortCol, setSortCol] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [assignDropdown, setAssignDropdown] = useState(null);
  const [selectedCases, setSelectedCases] = useState(new Set());

  const [drawerCase, setDrawerCase] = useState(null);

  const actionsRef = useRef(null);
  const user = USERS[currentRole];
  const isManager = currentRole === "manager" || currentRole === "admin";

  useEffect(() => {
    const h = (e) => { if (actionsRef.current && !actionsRef.current.contains(e.target)) { setAssignDropdown(null); } };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    approvalsApi.list({ status: 'pending' }).then(rows => setPendingApprovals(rows.map(a => ({
      id: a.id,
      type: a.type,
      caseId: a.case_id,
      caseName: a.case_name,
      requestedBy: a.requested_by,
      requestedAt: a.requested_at ? String(a.requested_at).replace('T', ' ').slice(0, 16) : '—',
      reason: a.reason,
      severity: a.severity,
    })))).catch((err) => {
      if (showToast) showToast("error", err?.message || "Onay listesi yüklenemedi");
    });
  }, []);

  const handleApproval = (approval, approved) => {
    let newStatus;
    if (approval.type === 'case_reopen') {
      newStatus = approved ? 'Open' : 'Closed';
    } else if (approval.type === 'case_delete') {
      newStatus = approved ? 'Deleted' : 'Open';
    } else {
      newStatus = approved ? 'Closed' : 'Open';
    }
    approvalsApi.update(approval.id, { status: approved ? 'approved' : 'rejected', approved_by: currentRole })
      .catch((err) => { if (showToast) showToast("error", err?.message || "Onay güncellenemedi"); });
    casesApi.update(approval.caseId, { status: newStatus, update_user: currentRole })
      .catch((err) => { if (showToast) showToast("error", err?.message || "Vaka durumu güncellenemedi"); });
    if (onCaseUpdated) {
      const lc = cases.find(c => c.id === approval.caseId);
      if (lc) onCaseUpdated({ ...lc, status: newStatus });
    }
    setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
    if (showToast) showToast("success", approved ? "Onay verildi" : "Onay reddedildi");
  };

  const viewMap = { case_list: ["Vaka Listesi", "Case List"], my_cases: ["Vakalarım", "My Cases"], reviews: ["İncelemem İçin Gönderilenler", "Pending Reviews"], approvals: ["Onay Bekleyenler", "Pending Approvals"], deleted: ["Silinmiş Vakalar", "Deleted Cases"] };
  const [viewTitle, viewSub] = viewMap[activeView] || viewMap.case_list;

  const isHidden = c => c.status === "Deleted" || c.status === "Pending Delete";
  const baseCases = activeView === "case_list" ? cases.filter(c => !isHidden(c)) : activeView === "my_cases" ? cases.filter(c => c.owner === user.name && !isHidden(c)) : activeView === "deleted" ? cases.filter(c => c.status === "Deleted" || c.status === "Pending Delete") : cases.filter(c => !isHidden(c));

  const filteredCases = baseCases.filter(c => {
    if (searchTerm.length >= 2) { const s = searchTerm.toLowerCase(); if (!String(c.id).includes(s) && !c.name.toLowerCase().includes(s) && !(c.owner || "").toLowerCase().includes(s)) return false; }
    if (filters.status.length > 0 && !filters.status.includes(c.status)) return false;
    if (filters.severity.length > 0 && !filters.severity.includes(c.severity)) return false;
    if (filters.owner === "__unassigned__" && c.owner !== null) return false;
    if (filters.owner && filters.owner !== "__unassigned__" && c.owner !== filters.owner) return false;
    if (colSearch.id && !String(c.id).includes(colSearch.id)) return false;
    if (colSearch.name && !c.name.toLowerCase().includes(colSearch.name.toLowerCase())) return false;
    if (colSearch.status && !c.status.toLowerCase().includes(colSearch.status.toLowerCase())) return false;
    if (colSearch.severity) { const sl = SEVERITY_CONFIG[c.severity]?.label || ""; if (!sl.toLowerCase().includes(colSearch.severity.toLowerCase()) && !c.severity.toLowerCase().includes(colSearch.severity.toLowerCase())) return false; }
    if (colSearch.owner && !(c.owner || "atanmamış").toLowerCase().includes(colSearch.owner.toLowerCase())) return false;
    if (colSearch.createDate && !c.createDate.includes(colSearch.createDate)) return false;
    if (colSearch.updateDate && !c.updateDate.includes(colSearch.updateDate)) return false;
    if (colSearch.totalAmount && !String(c.totalAmount).includes(colSearch.totalAmount)) return false;
    return true;
  });

  const sortedCases = [...filteredCases].sort((a, b) => { let aV = a[sortCol], bV = b[sortCol]; if (sortCol === "totalAmount") { aV = +aV; bV = +bV; } if (typeof aV === "string") { aV = aV.toLowerCase(); bV = (bV || "").toLowerCase(); } return aV < bV ? (sortDir === "asc" ? -1 : 1) : aV > bV ? (sortDir === "asc" ? 1 : -1) : 0; });
  const totalPages = Math.ceil(sortedCases.length / perPage);
  const paginated = sortedCases.slice((page - 1) * perPage, page * perPage);
  const handleSort = col => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("asc"); } setPage(1); };
  const updateCol = (col, val) => { setColSearch(p => ({ ...p, [col]: val })); setPage(1); };
  const summary = { total: baseCases.length, open: baseCases.filter(c => c.status === "Open").length, closed: baseCases.filter(c => c.status === "Closed").length, myCases: baseCases.filter(c => c.owner === user.name).length };
  const toggleStatus = s => { setFilters(f => ({ ...f, status: f.status.includes(s) ? f.status.filter(x => x !== s) : [...f.status, s] })); setPage(1); };
  const toggleSeverity = s => { setFilters(f => ({ ...f, severity: f.severity.includes(s) ? f.severity.filter(x => x !== s) : [...f.severity, s] })); setPage(1); };
  const changeView = v => { setActiveView(v); setPage(1); setSearchTerm(""); setAssignDropdown(null); setSelectedCases(new Set()); setColSearch({ id: "", name: "", status: "", severity: "", owner: "", createDate: "", updateDate: "", totalAmount: "" }); setFilters({ status: [], severity: [], owner: "", dateFrom: "", dateTo: "" }); };

  const toggleSelect = (id) => setSelectedCases(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleSelectAll = () => { const pageIds = paginated.map(c => c.id); const allSelected = pageIds.every(id => selectedCases.has(id)); setSelectedCases(prev => { const next = new Set(prev); pageIds.forEach(id => allSelected ? next.delete(id) : next.add(id)); return next; }); };
  const allPageSelected = paginated.length > 0 && paginated.every(c => selectedCases.has(c.id));

  const isCaseTable = ["case_list", "my_cases", "deleted"].includes(activeView);

  const tableCols = [
    { key: "_check", label: "", w: 40 },
    { key: "id", label: "Case ID", w: 85, type: "text" },
    { key: "name", label: "Vaka Adı", w: null, type: "text" },
    { key: "status", label: "Durum", w: 130, type: "text" },
    { key: "severity", label: "Önem", w: 95, type: "text" },
    { key: "owner", label: "Atanan", w: 140, type: "text" },
    { key: "createDate", label: "Oluşturma", w: 100, type: "text" },
    { key: "updateDate", label: "Güncelleme", w: 100, type: "text" },
    { key: "totalAmount", label: displayCurrency === "original" ? "Toplam Tutar" : `Toplam Tutar (${displayCurrency})`, w: 150, type: "text", align: "right" },
  ];

  // Sidebar için aktif sayfa anahtarını türet
  const VIEW_TO_NAVKEY = { case_list: "cases", my_cases: "my_cases", reviews: "reviews", approvals: "pending_approvals", deleted: "deleted_cases" };
  const sidebarActivePage = VIEW_TO_NAVKEY[activeView] || "cases";

  // Sidebar navigasyon — alt görünümler bu sayfada iç, diğerleri dışarı
  const handleNavigation = (key, data) => {
    const viewMap = { my_cases: "my_cases", pending_approvals: "approvals", deleted_cases: "deleted", cases: "case_list" };
    if (viewMap[key] !== undefined) {
      changeView(viewMap[key]);
    } else if (onNavigate) {
      onNavigate(key, data);
    }
  };

  return (
    <div className="scm-layout">
      <Sidebar
        activePage={sidebarActivePage}
        onNavigate={handleNavigation}
        user={USERS[currentRole]}
        selectedDomain={selectedDomain}
        onDomainChange={onDomainChange}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(c => !c)}
        myCasesCount={myCasesCount}
        pendingApprovalsCount={pendingApprovalsCount}
        reviewCount={reviewCount}
        notifications={notifications}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
      />

      {/* ════════════ MAIN ════════════ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 64, background: "#fff", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <div><h1 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{viewTitle}</h1><p style={{ margin: 0, fontSize: 12, color: COLORS.textSecondary }}>{viewSub}</p></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
              {Object.entries(USERS).map(([k, u]) => (
                <button key={k} onClick={() => { onRoleChange && onRoleChange(k); setPage(1); }} style={{
                  padding: "6px 14px", fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", letterSpacing: "0.02em",
                  background: currentRole === k ? COLORS.primary : "#fff", color: currentRole === k ? "#fff" : COLORS.textSecondary,
                }}>{u.role === "analyst" ? "Analist" : u.roleLabel}</button>
              ))}
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: COLORS.textSecondary }}><Icons.Globe /> TR</button>
          </div>
        </header>

        <div style={{ padding: 28, flex: 1, overflowY: "auto" }}>
          {/* Reviews View */}
          {activeView === "reviews" && (
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}` }}><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>İncelemem İçin Gönderilenler</h3><p style={{ margin: 0, fontSize: 12, color: COLORS.textSecondary }}>Başka kullanıcılar tarafından size review için gönderilmiş vakalar</p></div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#F8FAFC" }}>{["Case ID", "Vaka Adı", "Gönderen", "Tarih", "Durum", ""].map((h, i) => <th key={i} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: COLORS.textSecondary, borderBottom: `2px solid ${COLORS.border}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {REVIEW_REQUESTS.map(r => { const lc = cases.find(c => c.id === r.caseId); return (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} onClick={() => lc && onNavigate && onNavigate("case_detail", lc)}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: COLORS.primary }}>#{r.caseId}</td><td style={{ padding: "12px 14px", fontWeight: 600 }}>{r.caseName}</td><td style={{ padding: "12px 14px", color: COLORS.textSecondary }}>{r.requestedBy}</td><td style={{ padding: "12px 14px", color: COLORS.textSecondary, fontSize: 12 }}>{r.requestedAt}</td>
                      <td style={{ padding: "12px 14px" }}><Badge config={{ label: "Bekliyor", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" }} /></td>
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}><button onClick={() => { if (onNavigate) onNavigate("review_inbox"); }} style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: COLORS.primary, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>İncele</button></td>
                    </tr>); })}
                </tbody>
              </table>
            </div>
          )}

          {/* Approvals View */}
          {activeView === "approvals" && (
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}` }}><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Onay Bekleyenler</h3><p style={{ margin: 0, fontSize: 12, color: COLORS.textSecondary }}>Maker-Checker onayı bekleyen vaka kapatma ve silme talepleri</p></div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#F8FAFC" }}>{["Tür", "Case ID", "Vaka Adı", "Talep Eden", "Tarih", "Neden", ""].map((h, i) => <th key={i} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: COLORS.textSecondary, borderBottom: `2px solid ${COLORS.border}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {pendingApprovals.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: COLORS.textSecondary, fontSize: 13 }}>Onay bekleyen talep bulunmuyor.</td></tr>
                  )}
                  {pendingApprovals.map(a => { const lc = cases.find(c => c.id === a.caseId); return (
                    <tr key={a.id} style={{ borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} onClick={() => lc && onNavigate && onNavigate("case_detail", lc)}>
                      <td style={{ padding: "12px 14px" }}><Badge config={a.type === "case_close" ? { label: "Kapatma", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" } : a.type === "case_reopen" ? { label: "Yeniden Açma", bg: "#EDE9FE", color: "#5B21B6", border: "#DDD6FE" } : { label: "Silme", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" }} /></td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: COLORS.primary }}>#{a.caseId}</td><td style={{ padding: "12px 14px", fontWeight: 600 }}>{a.caseName}</td><td style={{ padding: "12px 14px", color: COLORS.textSecondary }}>{a.requestedBy}</td><td style={{ padding: "12px 14px", color: COLORS.textSecondary, fontSize: 12 }}>{a.requestedAt}</td><td style={{ padding: "12px 14px", color: COLORS.textSecondary, fontSize: 12 }}>{a.reason}</td>
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}><div style={{ display: "flex", gap: 6 }}><button onClick={() => handleApproval(a, true)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: COLORS.success, color: "#fff", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Onayla</button><button onClick={() => handleApproval(a, false)} style={{ padding: "5px 12px", borderRadius: 6, border: `1.5px solid ${COLORS.danger}`, background: "#fff", color: COLORS.danger, fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Reddet</button></div></td>
                    </tr>); })}
                </tbody>
              </table>
            </div>
          )}

          {/* Case Table */}
          {isCaseTable && (<>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[{ l: "Toplam Vaka", s: "Total Cases", v: summary.total, c: COLORS.primary }, { l: "Açık Vakalar", s: "Open Cases", v: summary.open, c: "#2563EB" }, { l: "Kapatılan Vakalar", s: "Closed Cases", v: summary.closed, c: COLORS.success }, { l: "Vakalarım", s: "My Cases", v: summary.myCases, c: "#7C3AED" }].map((card, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: `1px solid ${COLORS.border}`, cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: card.c }} />
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 500 }}>{card.l}</div><div style={{ fontSize: 10, color: COLORS.textSecondary, opacity: 0.7 }}>{card.s}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: card.c, marginTop: 6 }}>{card.v}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              {/* Search + Currency + Filter + Export */}
              <div style={{ padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                <SearchInput
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                  placeholder="Case ID, vaka adı veya kullanıcı ara..."
                  style={{ flex: 1, maxWidth: 400 }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 8, padding: 3 }}>
                    {[{ key: "original", label: "Default" }, { key: "TRY", label: "₺ TRY" }, { key: "USD", label: "$ USD" }].map(o => (
                      <button key={o.key} onClick={() => setDisplayCurrency(o.key)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", fontSize: 11.5, fontWeight: 600, cursor: "pointer", background: displayCurrency === o.key ? COLORS.primary : "transparent", color: displayCurrency === o.key ? "#fff" : COLORS.textSecondary, transition: "all 0.15s" }}>{o.label}</button>
                    ))}
                  </div>
                  <div style={{ width: 1, height: 28, background: COLORS.border }} />
                  <FilterBar.Toggle
                    open={showFilters}
                    onToggle={() => setShowFilters(f => !f)}
                    activeCount={filters.severity.length + filters.status.length + (filters.owner ? 1 : 0)}
                  />
                  <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#F8FAFC", color: COLORS.text, border: `1.5px solid ${COLORS.border}` }}
                    onMouseEnter={e => { e.currentTarget.style.background = COLORS.success; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = COLORS.success; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = COLORS.text; e.currentTarget.style.borderColor = COLORS.border; }}>
                    <Icons.Export /> Export
                    {selectedCases.size > 0 && <span style={{ minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: COLORS.primary, color: "#fff", padding: "0 5px" }}>{selectedCases.size}</span>}
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <FilterBar.Panel onReset={() => { setFilters({ status: [], severity: [], owner: "", dateFrom: "", dateTo: "" }); setPage(1); }}>
                  <FilterBar.ChipGroup
                    label="DURUM"
                    options={Object.entries(STATUS_CONFIG)
                      .filter(([k]) => activeView !== "deleted" || k === "Deleted")
                      .map(([k, cfg]) => ({ key: k, ...cfg }))}
                    selected={filters.status}
                    onToggle={toggleStatus}
                  />
                  <FilterBar.ChipGroup
                    label="ÖNEM DERECESİ"
                    options={Object.entries(SEVERITY_CONFIG).map(([k, cfg]) => ({ key: k, ...cfg }))}
                    selected={filters.severity}
                    onToggle={toggleSeverity}
                  />
                  <FilterBar.Select
                    label="ATANAN"
                    value={filters.owner}
                    onChange={e => { setFilters(f => ({ ...f, owner: e.target.value })); setPage(1); }}
                    options={[
                      { value: "", label: "Tümü" },
                      { value: "__unassigned__", label: "Atanmamış" },
                      ...ACTIVE_USERS.map(u => ({ value: u.name, label: u.name })),
                    ]}
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

              {/* Selection Bar */}
              {selectedCases.size > 0 && (
                <div style={{ padding: "10px 22px", borderBottom: `1px solid ${COLORS.border}`, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: COLORS.primary }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{selectedCases.size}</span>
                    vaka seçildi
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setSelectedCases(new Set())} style={{ padding: "5px 14px", borderRadius: 6, border: `1.5px solid ${COLORS.border}`, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: COLORS.textSecondary }}>Seçimi Temizle</button>
                    <button style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: COLORS.success, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><Icons.Export /> Seçilenleri Export Et</button>
                  </div>
                </div>
              )}

              {/* TABLE */}
              <div style={{ overflowX: "auto" }} ref={actionsRef}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {tableCols.map(col => col.key === "_check" ? (
                        <th key={col.key} style={{ padding: "12px 8px 6px", width: col.w, borderBottom: `1px solid ${COLORS.border}`, textAlign: "center" }}>
                          <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll} style={{ width: 15, height: 15, cursor: "pointer", accentColor: COLORS.primary }} />
                        </th>
                      ) : (
                        <th key={col.key} style={{ padding: "12px 8px 6px", textAlign: col.align || "left", fontSize: 11.5, fontWeight: 700, color: COLORS.textSecondary, letterSpacing: 0.3, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap", width: col.w || "auto", cursor: "pointer", userSelect: "none" }} onClick={() => handleSort(col.key)}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{col.label}<Icons.Sort dir={sortCol === col.key ? sortDir : null} /></span>
                        </th>
                      ))}
                    </tr>
                    <tr style={{ background: "#F8FAFC" }}>
                      {tableCols.map(col => <th key={`s-${col.key}`} style={{ padding: "0 8px 8px", borderBottom: `2px solid ${COLORS.border}` }}>
                        {col.key !== "_check" ? <input value={colSearch[col.key] || ""} onChange={e => updateCol(col.key, e.target.value)} placeholder="Ara..." style={colInputStyle} onFocus={e => e.target.style.borderColor = COLORS.primaryLight} onBlur={e => e.target.style.borderColor = COLORS.border} /> : <div />}
                      </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {casesLoading && <style>{`@keyframes kpiPulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>}
                    {casesLoading && Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        {[40, 85, null, 130, 95, 140, 100, 100, 150].map((w, j) => (
                          <td key={j} style={{ padding: "12px 8px" }}>
                            <div style={{
                              height: 14, borderRadius: 6, background: "#E2E8F0",
                              width: j === 0 ? 16 : `${55 + Math.floor(Math.sin(i * 7 + j) * 30)}%`,
                              animation: "kpiPulse 1.4s ease-in-out infinite",
                              animationDelay: `${(i + j) * 0.06}s`,
                            }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {!casesLoading && paginated.map(c => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: "background 0.1s", background: selectedCases.has(c.id) ? "#EFF6FF" : "transparent" }}
                        onMouseEnter={e => { if (!selectedCases.has(c.id)) e.currentTarget.style.background = "#FAFBFC"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = selectedCases.has(c.id) ? "#EFF6FF" : "transparent"; }}>
                        <td style={{ padding: "11px 8px", textAlign: "center" }}>
                          <input type="checkbox" checked={selectedCases.has(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: 15, height: 15, cursor: "pointer", accentColor: COLORS.primary }} />
                        </td>
                        <td style={{ padding: "11px 8px", fontWeight: 700, color: COLORS.primary, cursor: "pointer" }} onClick={() => setDrawerCase(c)}>#{c.id}</td>
                        <td style={{ padding: "11px 8px", fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }} onClick={() => setDrawerCase(c)}>{c.name}</td>
                        <td style={{ padding: "11px 8px" }}><Badge config={STATUS_CONFIG[c.status]} /></td>
                        <td style={{ padding: "11px 8px" }}><Badge config={SEVERITY_CONFIG[c.severity]} /></td>
                        <td style={{ padding: "11px 8px" }}>
                          {c.owner === null ? (
                            <div style={{ position: "relative" }}>
                              {assignDropdown === c.id ? (
                                <div style={{ position: "absolute", top: -8, left: 0, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 30, width: 200, maxHeight: 200, overflowY: "auto" }}>
                                  {(isManager ? ACTIVE_USERS : ACTIVE_USERS.filter(u => u.id === user.id)).map(u => (
                                    <div key={u.id} onClick={() => {
                                      const updated = { ...c, owner: u.name };
                                      if (onCaseUpdated) onCaseUpdated(updated);
                                      else setLocalCases(prev => prev.map(x => x.id === c.id ? updated : x));
                                      setAssignDropdown(null);
                                    }} style={{ padding: "8px 14px", fontSize: 12, cursor: "pointer", borderBottom: `1px solid ${COLORS.border}` }}
                                      onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                      <div style={{ fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 10.5, color: COLORS.textSecondary }}>{u.role}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : <button onClick={() => setAssignDropdown(c.id)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: "pointer", background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: 4 }}><Icons.Assign />{isManager ? "Ata" : "Üstüme Al"}</button>}
                            </div>
                          ) : <span style={{ fontSize: 13 }}>{c.owner}</span>}
                        </td>
                        <td style={{ padding: "11px 8px", color: COLORS.textSecondary, fontSize: 12 }}>{c.createDate}</td>
                        <td style={{ padding: "11px 8px", color: COLORS.textSecondary, fontSize: 12 }}>{c.updateDate}</td>
                        <td style={{ padding: "11px 8px", fontWeight: 700, fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>
                          {c.totalAmount > 0 ? (displayCurrency === "original" ? formatCurrency(c.totalAmount, c.currency) : <span>{formatCurrency(convertAmount(c.totalAmount, c.currency, displayCurrency), displayCurrency)}{c.currency !== displayCurrency && <span style={{ fontSize: 10, fontWeight: 400, color: COLORS.textSecondary, marginLeft: 4 }}>({formatCurrency(c.totalAmount, c.currency)})</span>}</span>) : <span style={{ color: COLORS.textSecondary, fontWeight: 400 }}>—</span>}
                        </td>
                      </tr>
                    ))}
                    {!casesLoading && paginated.length === 0 && <tr><td colSpan={tableCols.length} style={{ padding: 40, textAlign: "center", color: COLORS.textSecondary }}>Filtre kriterlerine uygun vaka bulunamadı.</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ padding: "14px 22px", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.textSecondary }}>
                  <span>Sayfa başına:</span>
                  <select value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${COLORS.border}`, fontSize: 12, outline: "none", background: "#fff" }}>{[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}</select>
                  <span style={{ marginLeft: 8 }}>{filteredCases.length} vakadan {Math.min((page - 1) * perPage + 1, filteredCases.length)}–{Math.min(page * perPage, filteredCases.length)} gösteriliyor</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.4 : 1, display: "flex", alignItems: "center" }}><Icons.ChevronLeft /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: page === p ? `1.5px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`, background: page === p ? COLORS.primary : "#fff", color: page === p ? "#fff" : COLORS.text, cursor: "pointer" }}>{p}</button>
                  ))}
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.4 : 1, display: "flex", alignItems: "center" }}><Icons.ChevronRight /></button>
                </div>
              </div>
            </div>
          </>)}
        </div>
      </main>

      {/* Overlays */}
      <CaseDrawer caseData={drawerCase} onClose={() => setDrawerCase(null)} onNavigate={handleNavigation} />
    </div>
  );
}
