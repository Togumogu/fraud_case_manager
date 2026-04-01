import { useState, useEffect } from "react";

// --- Mock Data ---
const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", email: "elif@bank.com" },
  manager: { id: 2, name: "Burak Şen", role: "manager", email: "burak@bank.com" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", email: "zeynep@bank.com" },
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
};

const SEVERITY_CONFIG = {
  critical: { label: "Kritik", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  high: { label: "Yüksek", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  medium: { label: "Orta", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  low: { label: "Düşük", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
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

export default function SCMDashboard({ onNavigate } = {}) {
  const [currentRole, setCurrentRole] = useState("manager");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [assignDropdown, setAssignDropdown] = useState(null);
  const [animatedKPIs, setAnimatedKPIs] = useState({});
  const [selectedDomain, setSelectedDomain] = useState("payment");
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);

  const user = USERS[currentRole];
  const isManager = currentRole === "manager" || currentRole === "admin";

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedKPIs(KPI_DATA);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { key: "dashboard", label: "Dashboard", sublabel: "Ana Sayfa", icon: <Icons.Dashboard /> },
    { key: "case_creation", label: "Vaka Oluşturma", sublabel: "Case Creation", icon: <Icons.CaseCreate /> },
    { key: "cases", label: "Vaka Listesi", sublabel: "Case List", icon: <Icons.Cases /> },
    { key: "my_cases", label: "Vakalarım", sublabel: "My Cases", icon: <Icons.MyCases /> },
    { key: "reports", label: "Raporlar", sublabel: "Reports", icon: <Icons.Reports /> },
    ...(currentRole === "admin" ? [{ key: "settings", label: "Ayarlar", sublabel: "Settings", icon: <Icons.Settings /> }] : []),
  ];

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

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", background: COLORS.bg, color: COLORS.text, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? 72 : 260,
        background: COLORS.sidebar,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        zIndex: 100,
        position: "relative",
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarCollapsed ? "20px 16px" : "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12, minHeight: 72 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
            S
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>Fraud Case Manager</div>
              <div style={{ color: "#64748B", fontSize: 11, letterSpacing: "0.03em" }}>Vaka Yöneticisi v1.0</div>
            </div>
          )}
        </div>

        {/* Domain Seçimi */}
        <div style={{ padding: sidebarCollapsed ? "10px 8px" : "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {!sidebarCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, padding: "0 4px" }}>
              Domain Seçimi
            </div>
          )}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDomainMenuOpen(!domainMenuOpen)}
              title={sidebarCollapsed ? FRAUD_DOMAINS.find(d => d.id === selectedDomain)?.label : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: sidebarCollapsed ? "8px" : "8px 12px",
                borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)", cursor: "pointer",
                color: "#E2E8F0", transition: "all 0.15s ease",
                justifyContent: sidebarCollapsed ? "center" : "space-between",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{FRAUD_DOMAINS.find(d => d.id === selectedDomain)?.icon}</span>
                {!sidebarCollapsed && (
                  <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {FRAUD_DOMAINS.find(d => d.id === selectedDomain)?.label}
                  </span>
                )}
              </div>
              {!sidebarCollapsed && (
                <span style={{ transition: "transform 0.2s ease", transform: domainMenuOpen ? "rotate(180deg)" : "rotate(0deg)", display: "flex", flexShrink: 0, color: "#64748B" }}>
                  <Icons.ChevronDown />
                </span>
              )}
            </button>
            {domainMenuOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0,
                width: sidebarCollapsed ? 200 : "100%",
                background: "#1E293B", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 300,
                overflow: "hidden",
                ...(sidebarCollapsed ? { left: 8 } : {}),
              }}>
                {FRAUD_DOMAINS.map(domain => (
                  <div
                    key={domain.id}
                    onClick={() => { setSelectedDomain(domain.id); setDomainMenuOpen(false); }}
                    style={{
                      padding: "10px 14px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      background: selectedDomain === domain.id ? "rgba(59,130,246,0.15)" : "transparent",
                      transition: "all 0.1s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = selectedDomain === domain.id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = selectedDomain === domain.id ? "rgba(59,130,246,0.15)" : "transparent"}
                  >
                    <span style={{ fontSize: 13 }}>{domain.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: selectedDomain === domain.id ? 600 : 400, color: selectedDomain === domain.id ? "#60A5FA" : "#CBD5E1" }}>
                      {domain.label}
                    </span>
                    {selectedDomain === domain.id && (
                      <span style={{ marginLeft: "auto", color: "#60A5FA", display: "flex" }}><Icons.Check /></span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setActiveNav(item.key); if (onNavigate) onNavigate(item.key); }}
              title={sidebarCollapsed ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: sidebarCollapsed ? "12px 16px" : "10px 16px",
                borderRadius: 8, border: "none", cursor: "pointer",
                background: activeNav === item.key ? "rgba(59,130,246,0.15)" : "transparent",
                color: activeNav === item.key ? "#60A5FA" : "#94A3B8",
                transition: "all 0.15s ease",
                width: "100%", textAlign: "left",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              onMouseEnter={e => { if (activeNav !== item.key) e.currentTarget.style.background = COLORS.sidebarHover; }}
              onMouseLeave={e => { if (activeNav !== item.key) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: activeNav === item.key ? 600 : 500, lineHeight: 1.3 }}>{item.label}</div>
                  <div style={{ fontSize: 10.5, color: "#475569", lineHeight: 1.2 }}>{item.sublabel}</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile + Notifications */}
        <div style={{ padding: sidebarCollapsed ? "16px 8px" : "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 600, fontSize: 13,
            }}>
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user.name}</div>
                <div style={{ color: "#64748B", fontSize: 11, textTransform: "capitalize" }}>{user.role === "analyst" ? "Fraud Analist" : user.role === "manager" ? "Yönetici" : "Admin"}</div>
              </div>
            )}
            {/* Notification Bell */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: "none",
                  background: showNotifications ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", position: "relative",
                  color: showNotifications ? "#60A5FA" : "#94A3B8",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = showNotifications ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}
              >
                <Icons.Bell />
                <span style={{
                  position: "absolute", top: 2, right: 2, width: 16, height: 16,
                  borderRadius: "50%", background: COLORS.danger, color: "#fff",
                  fontSize: 9, fontWeight: 700, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  border: "2px solid #0F172A",
                }}>3</span>
              </button>
              {showNotifications && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: "fixed", bottom: 72,
                    left: sidebarCollapsed ? 80 : 268,
                    width: 360,
                    background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.08)", zIndex: 300,
                    overflow: "hidden", color: COLORS.text,
                    transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Bildirimler</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: COLORS.danger, color: "#fff" }}>3 yeni</span>
                    </div>
                    <span style={{ fontSize: 12, color: COLORS.primaryLight, cursor: "pointer", fontWeight: 600 }}>Tümünü Okundu İşaretle</span>
                  </div>
                  <div style={{ maxHeight: 320, overflow: "auto" }}>
                    {[
                      { msg: "Vaka #2469 için kapatma onayı bekliyor", time: "5 dk önce", unread: true },
                      { msg: "Vaka #2471 size atandı", time: "2 sa önce", unread: true },
                      { msg: "Elif Yılmaz review tamamladı (#2465)", time: "4 sa önce", unread: true },
                    ].map((n, i) => (
                      <div key={i} style={{
                        padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`,
                        cursor: "pointer", background: n.unread ? "#FAFBFE" : "#fff",
                        display: "flex", alignItems: "flex-start", gap: 12,
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                        onMouseLeave={e => e.currentTarget.style.background = n.unread ? "#FAFBFE" : "#fff"}
                      >
                        {n.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primaryLight, flexShrink: 0, marginTop: 6 }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, color: COLORS.text, lineHeight: 1.5, fontWeight: n.unread ? 500 : 400 }}>{n.msg}</div>
                          <div style={{ fontSize: 11.5, color: COLORS.textSecondary, marginTop: 3 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "12px 20px", borderTop: `1px solid ${COLORS.border}`, textAlign: "center", background: "#F8FAFC" }}>
                    <span style={{ fontSize: 12.5, color: COLORS.primaryLight, cursor: "pointer", fontWeight: 600 }}>Tüm Bildirimleri Gör →</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: "absolute", top: 24, right: -14, width: 28, height: 28,
            borderRadius: "50%", border: `2px solid ${COLORS.border}`,
            background: "#fff", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 101,
            transition: "transform 0.3s ease",
            transform: sidebarCollapsed ? "rotate(0deg)" : "rotate(180deg)",
          }}
        >
          <Icons.ChevronRight />
        </button>
      </aside>

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
              {["analyst", "manager", "admin"].map(role => (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  style={{
                    padding: "6px 14px", fontSize: 11.5, fontWeight: 600, border: "none",
                    cursor: "pointer", letterSpacing: "0.02em",
                    background: currentRole === role ? COLORS.primary : "#fff",
                    color: currentRole === role ? "#fff" : COLORS.textSecondary,
                    transition: "all 0.15s ease",
                  }}
                >
                  {role === "analyst" ? "Analist" : role === "manager" ? "Yönetici" : "Admin"}
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
        <main style={{ flex: 1, overflow: "auto", padding: 28 }} onClick={() => { setShowNotifications(false); setAssignDropdown(null); setDomainMenuOpen(false); }}>
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
            {kpiCards.map((card, i) => (
              <div
                key={card.key}
                onClick={() => { setActiveNav(card.nav); if (onNavigate) onNavigate(card.nav); }}
                style={{
                  background: "#fff", borderRadius: 14, padding: "20px",
                  border: `1px solid ${COLORS.border}`,
                  cursor: "pointer", transition: "all 0.2s ease",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                    {card.icon}
                  </div>
                  <Icons.ChevronRight />
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: card.color, lineHeight: 1, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{card.label}</div>
                <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{card.sublabel}</div>
              </div>
            ))}
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
                <span style={{ fontSize: 12, color: COLORS.primaryLight, cursor: "pointer", fontWeight: 500 }}>Tümünü Gör →</span>
              </div>
              <div style={{ maxHeight: 380, overflow: "auto" }}>
                {RECENT_ACTIVITIES.slice(0, isManager ? 7 : 4).map(act => {
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
                })}
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
                    {PENDING_APPROVALS.length} bekleyen
                  </div>
                </div>
                <div style={{ maxHeight: 380, overflow: "auto" }}>
                  {PENDING_APPROVALS.map(approval => (
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
                        >
                          <Icons.X /> Reddet
                        </button>
                      </div>
                    </div>
                  ))}
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
              <span style={{ fontSize: 12, color: COLORS.primaryLight, cursor: "pointer", fontWeight: 500 }}>Vaka Listesi →</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Case ID", "Vaka Adı", "Alan (Domain)", "Tarih", "Önem", ""].map((h, i) => (
                      <th key={i} style={{ padding: "10px 22px", textAlign: "left", fontWeight: 600, color: COLORS.textSecondary, fontSize: 11.5, letterSpacing: "0.03em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {UNASSIGNED_CASES.map(c => {
                    const sev = SEVERITY_CONFIG[c.severity];
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                      >
                        <td style={{ padding: "12px 22px", fontWeight: 600, color: COLORS.primaryLight, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>#{c.id}</td>
                        <td style={{ padding: "12px 22px", fontWeight: 500 }}>{c.name}</td>
                        <td style={{ padding: "12px 22px" }}>
                          <span style={{ fontSize: 11.5, padding: "3px 10px", borderRadius: 5, background: "#F1F5F9", color: COLORS.textSecondary, fontWeight: 500 }}>{c.domain}</span>
                        </td>
                        <td style={{ padding: "12px 22px", color: COLORS.textSecondary, fontSize: 12 }}>{c.date}</td>
                        <td style={{ padding: "12px 22px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 5, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                            {sev.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 22px", position: "relative" }}>
                          {isManager ? (
                            <div style={{ position: "relative" }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setAssignDropdown(assignDropdown === c.id ? null : c.id); }}
                                style={{
                                  padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                                  background: COLORS.primary, color: "#fff", border: "none",
                                  cursor: "pointer", transition: "all 0.15s ease",
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                              >
                                Ata
                              </button>
                              {assignDropdown === c.id && (
                                <div
                                  onClick={e => e.stopPropagation()}
                                  style={{
                                    position: "absolute", top: "100%", right: 0, marginTop: 4,
                                    width: 220, background: "#fff", borderRadius: 10,
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)", zIndex: 50,
                                    overflow: "hidden",
                                  }}>
                                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11.5, fontWeight: 600, color: COLORS.textSecondary }}>
                                    Kullanıcı Seç
                                  </div>
                                  {ACTIVE_USERS.map(u => (
                                    <div
                                      key={u.id}
                                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}
                                      onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                      onClick={() => setAssignDropdown(null)}
                                    >
                                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                                      <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{u.role}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <button style={{
                              padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                              background: "#fff", color: COLORS.primary, border: `1px solid ${COLORS.primary}`,
                              cursor: "pointer", transition: "all 0.15s ease",
                            }}
                              onMouseEnter={e => { e.currentTarget.style.background = COLORS.primary; e.currentTarget.style.color = "#fff"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = COLORS.primary; }}
                            >
                              Üstüme Al
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer spacer */}
          <div style={{ height: 32 }} />
        </main>
      </div>
    </div>
  );
}
