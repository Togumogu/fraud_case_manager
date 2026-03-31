import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Table from "../components/Table";
import { SEVERITY_CONFIG } from "../components/Badge";
import { dashboard as dashboardApi, approvals as approvalsApi, cases as casesApi } from "../api/client";

// --- Mock Data ---
const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", email: "elif@bank.com" },
  manager: { id: 2, name: "Burak Şen", role: "manager", email: "burak@bank.com" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", email: "zeynep@bank.com" },
  super: { id: 4, name: "Toygun Baysal", role: "super", email: "toygun@bank.com" },
};

const KPI_DATA = {
  totalCases: 247,
  openCases: 83,
  closedCases: 152,
  myCases: 14,
  pendingTransactions: 37,
  pendingReviews: 5,
};

const RECENT_ACTIVITIES = [
  { id: 1, user: "Elif Yılmaz", action: "Vaka oluşturdu", caseId: "#2471", caseName: "Şüpheli EFT Transferi", time: "2 dk önce", type: "create" },
  { id: 2, user: "Mehmet Öz", action: "Vaka kapattı", caseId: "#2468", caseName: "Kart Dolandırıcılığı", time: "15 dk önce", type: "close" },
  { id: 3, user: "Ayşe Tan", action: "Yorum ekledi", caseId: "#2465", caseName: "Hesap Ele Geçirme", time: "32 dk önce", type: "comment" },
  { id: 4, user: "Can Yıldız", action: "Vaka atadı", caseId: "#2470", caseName: "Çoklu Kanal Fraud", time: "1 sa önce", type: "assign" },
  { id: 5, user: "Elif Yılmaz", action: "Dosya yükledi", caseId: "#2463", caseName: "Sahte Kimlik Başvurusu", time: "2 sa önce", type: "upload" },
  { id: 6, user: "Burak Şen", action: "Kapatma onayladı", caseId: "#2460", caseName: "POS Dolandırıcılığı", time: "3 sa önce", type: "approve" },
  { id: 7, user: "Selin Aydın", action: "Review tamamladı", caseId: "#2459", caseName: "ATM Skimming", time: "4 sa önce", type: "review" },
];

const PENDING_APPROVALS = [
  { id: 1, type: "case_close", caseId: "#2469", caseName: "Sahte Belge Dolandırıcılığı", requestedBy: "Elif Yılmaz", requestedAt: "05.03.2026 14:22", reason: "Soruşturma Tamamlandı", severity: "high" },
  { id: 2, type: "case_close", caseId: "#2466", caseName: "Online Bankacılık Fraud", requestedBy: "Mehmet Öz", requestedAt: "05.03.2026 11:05", reason: "Çözüme Kavuşturuldu", severity: "medium" },
  { id: 3, type: "case_delete", caseId: "#2455", caseName: "Test Vakası", requestedBy: "Can Yıldız", requestedAt: "04.03.2026 16:30", reason: "Mükerrer", severity: "low" },
];

const UNASSIGNED_CASES = [
  { id: 2471, name: "Şüpheli EFT Transferi", date: "06.03.2026", severity: "critical", domain: "Payment Fraud" },
  { id: 2470, name: "Çoklu Kanal Fraud", date: "06.03.2026", severity: "high", domain: "Credit Card Fraud" },
  { id: 2467, name: "Başvuru Sahteciliği", date: "05.03.2026", severity: "medium", domain: "Application Fraud" },
  { id: 2464, name: "İç Fraud Şüphesi", date: "05.03.2026", severity: "high", domain: "Internal Fraud" },
  { id: 2461, name: "Dijital Cüzdan Kötüye Kullanım", date: "04.03.2026", severity: "medium", domain: "Payment Fraud" },
];

const ACTIVE_USERS = [
  { id: 4, name: "Mehmet Öz", role: "Fraud Analist" },
  { id: 5, name: "Ayşe Tan", role: "Fraud Analist" },
  { id: 6, name: "Can Yıldız", role: "Fraud Analist" },
  { id: 7, name: "Selin Aydın", role: "İnceleyici" },
];

const FRAUD_DOMAINS = [
  { id: "payment", label: "Payment Fraud", icon: "₺", color: "#0891B2" },
  { id: "credit_card", label: "Credit Card Fraud", icon: "💳", color: "#8B5CF6" },
  { id: "application", label: "Application Fraud", icon: "📋", color: "#F59E0B" },
  { id: "account_takeover", label: "Account Takeover", icon: "🔓", color: "#EF4444" },
  { id: "internal", label: "Internal Fraud", icon: "🏢", color: "#6366F1" },
];

// --- Icons as SVG components ---
const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  CaseCreate: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Cases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  MyCases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Collapse: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  TotalCases: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  OpenCases: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  ClosedCases: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Clock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Review: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Transaction: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Domain: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  TransactionSearch: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};


const ACTION_ICONS = {
  create: { icon: "+", color: "#059669" },
  close: { icon: "✓", color: "#7C3AED" },
  comment: { icon: "💬", color: "#2563EB" },
  assign: { icon: "→", color: "#D97706" },
  upload: { icon: "↑", color: "#0891B2" },
  approve: { icon: "✓", color: "#059669" },
  review: { icon: "◎", color: "#7C3AED" },
};

// --- Helper functions ---
function formatRelativeTime(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
}

// --- Style constants ---
const COLORS = {
  sidebar: "#0F172A",
  sidebarHover: "#1E293B",
  sidebarActive: "#1E40AF",
  primary: "#1E40AF",
  primaryLight: "#3B82F6",
  accent: "#F59E0B",
  bg: "#F1F5F9",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
};

export default function SCMDashboard({ onNavigate, currentRole = "analyst", onRoleChange, selectedDomain = "payment", onDomainChange, cases, notifications = [], onMarkAllRead, onMarkRead, showToast } = {}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assignDropdown, setAssignDropdown] = useState(null);
  const [animatedKPIs, setAnimatedKPIs] = useState({});
  const [kpiLoading, setKpiLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState(RECENT_ACTIVITIES);
  const [pendingApprovals, setPendingApprovals] = useState(PENDING_APPROVALS);
  const [unassignedCases, setUnassignedCases] = useState(UNASSIGNED_CASES);
  const [panelsLoading, setPanelsLoading] = useState(true);

  const user = USERS[currentRole];
  const isManager = currentRole === "manager" || currentRole === "admin";

  useEffect(() => {
    let cancelled = false;
    setKpiLoading(true);
    setPanelsLoading(true);
    // Try to load from API; fall back to mock constants on error
    Promise.all([
      dashboardApi.kpis({ domain: selectedDomain }),
      dashboardApi.activity({ domain: selectedDomain }),
      dashboardApi.unassignedCases({ domain: selectedDomain }),
      ...(isManager ? [approvalsApi.list({ status: 'pending', domain: selectedDomain })] : []),
    ]).then(([kpis, activity, unassigned, approvalsData]) => {
      if (cancelled) return;
      // KPIs — compute myCases from passed cases prop
      const USERS_BY_ROLE = { analyst: "Elif Yılmaz", manager: "Burak Şen", admin: "Zeynep Demir", super: "Toygun Baysal" };
      const myName = USERS_BY_ROLE[currentRole];
      const myCases = cases ? cases.filter(c => c.status !== "Deleted" && !c.is_deleted && c.owner === myName).length : 0;
      setTimeout(() => { if (!cancelled) setAnimatedKPIs({ ...kpis, myCases }); }, 200);
      setKpiLoading(false);

      // Activity feed — map to display format
      const ACTION_TYPE_MAP = { create: "create", comment: "comment", assign: "assign", upload: "upload", close: "close", review: "review", approve: "approve", delete: "close" };
      const activityRows = activity.data || activity;
      setRecentActivities(activityRows.map((a, i) => ({
        id: a.id || i,
        user: a.user_name,
        action: a.action,
        caseId: `#${a.case_id}`,
        caseName: a.case_name || '',
        time: formatRelativeTime(a.created_at),
        type: ACTION_TYPE_MAP[a.action_type] || 'create',
      })));

      // Unassigned cases
      setUnassignedCases(unassigned.map(c => ({
        id: c.id,
        name: c.name,
        date: c.date,
        severity: c.severity,
        domain: c.domain,
      })));

      // Approvals (manager/admin only)
      if (approvalsData) {
        setPendingApprovals(approvalsData.map(a => ({
          id: a.id,
          type: a.type,
          caseId: `#${a.case_id}`,
          caseName: a.case_name,
          requestedBy: a.requested_by,
          requestedAt: formatDate(a.requested_at),
          reason: a.reason,
          severity: a.severity,
        })));
      }
      setPanelsLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      // API unavailable — use mock KPI_DATA
      setTimeout(() => { if (!cancelled) setAnimatedKPIs(KPI_DATA); }, 200);
      setKpiLoading(false);
      setPanelsLoading(false);
      if (showToast) showToast("error", err?.message || "Dashboard verileri yüklenemedi");
    });
    return () => { cancelled = true; };
  }, [currentRole, selectedDomain]);

  const handleApproval = (approval, approved) => {
    const numericId = parseInt(String(approval.caseId).replace('#', ''), 10);
    approvalsApi.update(approval.id, { status: approved ? 'approved' : 'rejected', approved_by: currentRole })
      .catch((err) => { if (showToast) showToast("error", err?.message || "Onay işlemi başarısız"); });
    casesApi.update(numericId, { status: approved ? 'Closed' : 'Open', update_user: currentRole })
      .catch((err) => { if (showToast) showToast("error", err?.message || "Vaka durumu güncellenemedi"); });
    setPendingApprovals(prev => prev.filter(a => a.id !== approval.id));
    if (showToast) showToast("success", approved ? "Onay verildi" : "Onay reddedildi");
    dashboardApi.kpis({ domain: selectedDomain }).then(k => setAnimatedKPIs(prev => ({ ...prev, ...k }))).catch(() => {});
  };

  const kpiCards = [
    { key: "totalCases", label: "Toplam Vaka", sublabel: "Total Cases", value: animatedKPIs.totalCases || 0, icon: <Icons.TotalCases />, color: "#3B82F6", bg: "#EFF6FF", nav: "cases" },
    { key: "openCases", label: "Açık Vakalar", sublabel: "Open Cases", value: animatedKPIs.openCases || 0, icon: <Icons.OpenCases />, color: "#F59E0B", bg: "#FFFBEB", nav: "cases" },
    { key: "closedCases", label: "Kapatılan Vakalar", sublabel: "Closed Cases", value: animatedKPIs.closedCases || 0, icon: <Icons.ClosedCases />, color: "#059669", bg: "#ECFDF5", nav: "cases" },
    { key: "myCases", label: "Vakalarım", sublabel: "My Cases", value: animatedKPIs.myCases || 0, icon: <Icons.MyCases />, color: "#7C3AED", bg: "#F5F3FF", nav: "my_cases" },
    { key: "pendingTransactions", label: "Bekleyen İşlemler", sublabel: "Pending Transactions", value: animatedKPIs.pendingTransactions || 0, icon: <Icons.Transaction />, color: "#0891B2", bg: "#ECFEFF", nav: "case_creation" },
    { key: "pendingReviews", label: "Review Bekleyenler", sublabel: "Pending Review", value: animatedKPIs.pendingReviews || 0, icon: <Icons.Review />, color: "#DB2777", bg: "#FDF2F8", nav: "my_cases" },
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Column definitions for the Unassigned Cases table — defined here so render
  // functions can close over assignDropdown / setAssignDropdown / isManager.
  const unassignedColumns = useMemo(() => [
    {
      key: "id",
      label: "Case ID",
      width: 90,
      sortable: true,
      monospace: true,
      render: v => (
        <span style={{ fontWeight: 700, color: COLORS.primaryLight }}>#{v}</span>
      ),
    },
    {
      key: "name",
      label: "Vaka Adı",
      sortable: true,
      maxWidth: 220,
      render: v => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      key: "date",
      label: "Tarih",
      sortable: true,
      render: v => <span style={{ color: COLORS.textSecondary, fontSize: 12 }}>{v}</span>,
    },
    {
      key: "severity",
      label: "Önem",
      render: v => <Table.Badge config={SEVERITY_CONFIG[v]} />,
    },
    {
      key: "_action",
      label: "",
      width: 120,
      render: (_, row) => (
        <div style={{ position: "relative" }}>
          {isManager ? (
            <>
              <button
                onClick={e => { e.stopPropagation(); setAssignDropdown(assignDropdown === row.id ? null : row.id); }}
                style={{
                  padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  background: COLORS.primary, color: "#fff", border: "none",
                  cursor: "pointer", transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Ata
              </button>
              {assignDropdown === row.id && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: "absolute", top: "100%", right: 0, marginTop: 4,
                    width: 220, background: "#fff", borderRadius: 10,
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)", zIndex: 50,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11.5, fontWeight: 600, color: COLORS.textSecondary }}>
                    Kullanıcı Seç
                  </div>
                  {ACTIVE_USERS.map(u => (
                    <div
                      key={u.id}
                      onClick={() => {
                        casesApi.update(row.id, { owner: u.name, update_user: user.name })
                          .then(() => {
                            setUnassignedCases(prev => prev.filter(c => c.id !== row.id));
                            if (showToast) showToast("success", `Vaka #${row.id} — ${u.name} kişisine atandı`);
                          })
                          .catch((err) => { if (showToast) showToast("error", err?.message || "Atama başarısız"); });
                        setAssignDropdown(null);
                      }}
                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                      <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{u.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
                casesApi.update(row.id, { owner: user.name, update_user: user.name })
                  .then(() => {
                    setUnassignedCases(prev => prev.filter(c => c.id !== row.id));
                    if (showToast) showToast("success", `Vaka #${row.id} üstünüze atandı`);
                  })
                  .catch((err) => { if (showToast) showToast("error", err?.message || "Atama başarısız"); });
              }}
              style={{
                padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                background: "#fff", color: COLORS.primary,
                border: `1px solid ${COLORS.primary}`, cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.primary; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = COLORS.primary; }}
            >
              Üstüme Al
            </button>
          )}
        </div>
      ),
    },
  ], [assignDropdown, setAssignDropdown, isManager]);

  return (
    <div className="scm-layout">
      <Sidebar
        activePage="dashboard"
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

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Header */}
        <header style={{
          height: 64, background: "#fff", borderBottom: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: COLORS.text }}>Dashboard</h1>
            <p style={{ fontSize: 12, color: COLORS.textSecondary, margin: 0 }}>Fraud soruşturma yönetim paneli</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Role Switcher (Demo) */}
            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
              {["analyst", "manager", "admin", "super"].map(role => (
                <button
                  key={role}
                  onClick={() => onRoleChange && onRoleChange(role)}
                  style={{
                    padding: "6px 14px", fontSize: 11.5, fontWeight: 600, border: "none",
                    cursor: "pointer", letterSpacing: "0.02em",
                    background: currentRole === role ? COLORS.primary : "#fff",
                    color: currentRole === role ? "#fff" : COLORS.textSecondary,
                    transition: "all 0.15s ease",
                  }}
                >
                  {role === "analyst" ? "Analist" : role === "manager" ? "Yönetici" : role === "admin" ? "Admin" : "Super"}
                </button>
              ))}
            </div>

            {/* Language */}
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: COLORS.textSecondary }}>
              <Icons.Globe /> TR
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ flex: 1, overflow: "auto", padding: 28 }} onClick={() => { setAssignDropdown(null); }}>
          {/* Welcome Banner */}
          <div style={{
            background: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #2563EB 100%)",
            borderRadius: 16, padding: "24px 32px", marginBottom: 24,
            color: "#fff", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", right: 60, bottom: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Hoş Geldiniz, {user.name}</h2>
              <p style={{ margin: 0, fontSize: 13.5, opacity: 0.8 }}>
                {dateStr} &middot; Son giriş: 06.03.2026 08:45
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            {kpiLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{
                    background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`,
                    padding: "22px 20px", display: "flex", flexDirection: "column", gap: 12,
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#E2E8F0", animation: "kpiPulse 1.4s ease-in-out infinite" }} />
                    <div style={{ height: 28, width: "55%", borderRadius: 6, background: "#E2E8F0", animation: "kpiPulse 1.4s ease-in-out infinite" }} />
                    <div style={{ height: 14, width: "70%", borderRadius: 4, background: "#F1F5F9", animation: "kpiPulse 1.4s ease-in-out infinite" }} />
                    <style>{`@keyframes kpiPulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
                  </div>
                ))
              : kpiCards.map((card) => (
                  <Card.KPI
                    key={card.key}
                    icon={card.icon}
                    value={card.value}
                    label={card.label}
                    sublabel={card.sublabel}
                    iconColor={card.color}
                    accentColor={card.color}
                    onClick={() => { if (onNavigate) onNavigate(card.nav); }}
                  />
                ))
            }
          </div>

          {/* Row 2: Panels */}
          <div style={{ display: "grid", gridTemplateColumns: isManager ? "1fr 1fr" : "1fr", gap: 20, marginBottom: 24 }}>
            {/* Recent Activities */}
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Son Aktiviteler</h3>
                  <p style={{ margin: 0, fontSize: 11.5, color: COLORS.textSecondary }}>
                    {isManager ? "Tüm ekip aktiviteleri" : "Kendi aktiviteleriniz"}
                  </p>
                </div>
                <span onClick={() => onNavigate && onNavigate("activities")} style={{ fontSize: 12, color: COLORS.primaryLight, cursor: "pointer", fontWeight: 500 }}>Tümünü Gör →</span>
              </div>
              <div style={{ maxHeight: 380, overflow: "auto" }}>
                {panelsLoading ? Array.from({ length: isManager ? 5 : 4 }).map((_, i) => (
                  <div key={i} style={{ padding: "14px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "#E2E8F0", animation: "kpiPulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, width: `${60 + (i % 3) * 15}%`, borderRadius: 4, background: "#E2E8F0", marginBottom: 8, animation: "kpiPulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.1 + 0.05}s` }} />
                      <div style={{ height: 12, width: `${40 + (i % 2) * 20}%`, borderRadius: 4, background: "#F1F5F9", animation: "kpiPulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.1 + 0.1}s` }} />
                    </div>
                  </div>
                )) : recentActivities.slice(0, isManager ? 7 : 4).map(act => {
                  const actionCfg = ACTION_ICONS[act.type];
                  return (
                    <div
                      key={act.id}
                      style={{ padding: "14px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginTop: 2,
                        background: `${actionCfg.color}14`, color: actionCfg.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700,
                      }}>
                        {actionCfg.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 600 }}>{act.user}</span>
                          <span style={{ color: COLORS.textSecondary }}> {act.action}</span>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.primaryLight, fontWeight: 500 }}>{act.caseId} — {act.caseName}</div>
                      </div>
                      <span style={{ fontSize: 11, color: COLORS.textSecondary, whiteSpace: "nowrap", flexShrink: 0, marginTop: 3 }}>{act.time}</span>
                    </div>
                  );
                })
                }
              </div>
            </div>

            {/* Pending Approvals (Manager/Admin only) */}
            {isManager && (
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
                <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Onay Bekleyenler</h3>
                    <p style={{ margin: 0, fontSize: 11.5, color: COLORS.textSecondary }}>Maker-Checker onay kuyrugu</p>
                  </div>
                  <div style={{
                    padding: "4px 10px", borderRadius: 20,
                    background: "#FEF3C7", color: "#92400E",
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {pendingApprovals.length} bekleyen
                  </div>
                </div>
                <div style={{ maxHeight: 380, overflow: "auto" }}>
                  {panelsLoading ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ padding: "16px 22px", borderBottom: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <div style={{ height: 14, width: 60, borderRadius: 4, background: "#E2E8F0", animation: "kpiPulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.12}s` }} />
                        <div style={{ height: 14, width: 50, borderRadius: 4, background: "#E2E8F0", animation: "kpiPulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.12 + 0.04}s` }} />
                      </div>
                      <div style={{ height: 14, width: `${55 + i * 12}%`, borderRadius: 4, background: "#E2E8F0", marginBottom: 10, animation: "kpiPulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.12 + 0.08}s` }} />
                      <div style={{ height: 12, width: `${70 - i * 10}%`, borderRadius: 4, background: "#F1F5F9", marginBottom: 12, animation: "kpiPulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.12 + 0.12}s` }} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ height: 30, width: 80, borderRadius: 7, background: "#E2E8F0", animation: "kpiPulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.12 + 0.16}s` }} />
                        <div style={{ height: 30, width: 70, borderRadius: 7, background: "#F1F5F9", animation: "kpiPulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.12 + 0.2}s` }} />
                      </div>
                    </div>
                  )) : pendingApprovals.map(approval => (
                    <div
                      key={approval.id}
                      style={{ padding: "16px 22px", borderBottom: `1px solid ${COLORS.border}` }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primaryLight }}>{approval.caseId}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                              background: approval.type === "case_close" ? "#DBEAFE" : "#FEE2E2",
                              color: approval.type === "case_close" ? "#1E40AF" : "#991B1B",
                              textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>
                              {approval.type === "case_close" ? "KAPATMA" : "SİLME"}
                            </span>
                            <span style={{
                              ...(() => { const s = SEVERITY_CONFIG[approval.severity]; return { background: s.bg, color: s.color, border: `1px solid ${s.border}` }; })(),
                              fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 4,
                            }}>
                              {SEVERITY_CONFIG[approval.severity].label}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{approval.caseName}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 }}>
                        <span style={{ fontWeight: 500 }}>{approval.requestedBy}</span> — {approval.requestedAt} · Neden: {approval.reason}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{
                          padding: "7px 18px", borderRadius: 7, border: "none",
                          background: COLORS.success, color: "#fff",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                          transition: "all 0.15s ease",
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                          onClick={() => handleApproval(approval, true)}
                        >
                          <Icons.Check /> Onayla
                        </button>
                        <button style={{
                          padding: "7px 18px", borderRadius: 7,
                          border: `1px solid ${COLORS.danger}`,
                          background: "#fff", color: COLORS.danger,
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                          transition: "all 0.15s ease",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = COLORS.danger; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = COLORS.danger; }}
                          onClick={() => handleApproval(approval, false)}
                        >
                          <Icons.X /> Reddet
                        </button>
                      </div>
                    </div>
                  ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Unassigned Cases */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Atanmamış Vakalar</h3>
                <p style={{ margin: 0, fontSize: 11.5, color: COLORS.textSecondary }}>Henüz bir analiste atanmamış son vakalar</p>
              </div>
              <span onClick={() => onNavigate && onNavigate("cases")} style={{ fontSize: 12, color: COLORS.primaryLight, cursor: "pointer", fontWeight: 500 }}>Vaka Listesi →</span>
            </div>
            <Table
              columns={unassignedColumns}
              rows={unassignedCases}
              keyProp="id"
              paginate={false}
              loading={panelsLoading}
              loadingRows={4}
              emptyMessage="Atanmamış vaka bulunamadı."
            />
          </div>

          {/* Footer spacer */}
          <div style={{ height: 32 }} />
        </main>
      </div>
    </div>
  );
}
