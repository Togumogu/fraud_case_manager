import { useState } from "react";
import Avatar from "./Avatar";
import appIcon from "../assets/Fraud case manager app icon.png";

// ─── Sabit veriler ───────────────────────────────────────────────
const FRAUD_DOMAINS = [
  { id: "payment",         label: "Payment Fraud",       icon: "₺" },
  { id: "credit_card",     label: "Credit Card Fraud",   icon: "💳" },
  { id: "application",     label: "Application Fraud",   icon: "📋" },
  { id: "account_takeover",label: "Account Takeover",    icon: "🔓" },
  { id: "internal",        label: "Internal Fraud",      icon: "🏢" },
];

const NOTIF_COLORS = {
  case_created:        "#059669",
  case_closed_pending: "#D97706",
  case_closed:         "#059669",
  case_assigned:       "#2563EB",
  case_updated:        "#64748B",
  review_sent:         "#7C3AED",
  comment_added:       "#0891B2",
  case_deleted:        "#DC2626",
  default:             "#64748B",
};

function relTime(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)    return "şimdi";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} dk önce`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} sa önce`;
  return `${Math.floor(diff / 86400000)} gün önce`;
}

const ROLE_LABELS = {
  analyst: "Fraud Analist",
  manager: "Yönetici",
  admin:   "Admin",
  super:   "Super Admin",
};

const CASES_KEYS = ["cases", "my_cases", "reviews", "pending_approvals", "deleted_cases"];

// ─ Üst menü düğmesi (modül seviyesinde) ─
function NavBtn({ navKey, label, sublabel, icon, activePage, collapsed, onNavClick }) {
  const active = activePage === navKey;
  return (
    <button
      onClick={() => onNavClick(navKey)}
      title={collapsed ? label : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: collapsed ? "12px 16px" : "10px 16px",
        borderRadius: 8, border: "none", cursor: "pointer",
        width: "100%", textAlign: "left",
        background: active ? "rgba(59,130,246,0.15)" : "transparent",
        color:      active ? "#60A5FA"             : "#94A3B8",
        transition: "all 0.15s ease",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.sidebarHover; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ flexShrink: 0, display: "flex" }}>{icon}</span>
      {!collapsed && (
        <div>
          <div style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, lineHeight: 1.3 }}>{label}</div>
          <div style={{ fontSize: 10.5, color: "#475569", lineHeight: 1.2 }}>{sublabel}</div>
        </div>
      )}
    </button>
  );
}

// ─ Vaka Listesi alt öğesi (modül seviyesinde) ─
function SubItem({ navKey, label, sublabel, icon, count, activePage, onNavClick }) {
  const active = activePage === navKey;
  return (
    <div
      onClick={e => { e.stopPropagation(); onNavClick(navKey); }}
      style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "7px 10px 7px 14px", borderRadius: 8, marginBottom: 1, cursor: "pointer",
        background: active ? "rgba(59,130,246,0.15)" : "transparent",
        color:      active ? "#60A5FA"             : "#94A3B8",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.sidebarHover; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ flexShrink: 0, display: "flex", opacity: active ? 1 : 0.6 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: active ? 600 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        <div style={{ fontSize: 9, color: "#475569" }}>{sublabel}</div>
      </div>
      {count > 0 && (
        <span style={{ minWidth: 20, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, padding: "0 5px", background: "rgba(255,255,255,0.1)", color: "#fff", flexShrink: 0 }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ─── İkonlar ─────────────────────────────────────────────────────
const I = {
  Dashboard:         () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Activity:          () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  CaseCreate:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Cases:             () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  MyCases:           () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Review:            () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Approval:          () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  DeletedCases:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  TransactionSearch: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Reports:           () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings:          () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell:              () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  ChevronDown:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Check:             () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Moon:              () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun:               () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  LogOut:            () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Menu:              () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
};

const C = {
  sidebar:      "#0F172A",
  sidebarHover: "#1E293B",
  danger:       "#DC2626",
  primaryLight: "#3B82F6",
  border:       "#E2E8F0",
};

// ─── Ortak Sidebar Bileşeni ───────────────────────────────────────
//
// Props:
//   activePage       – aktif menü anahtarı (örn. "dashboard", "my_cases")
//   onNavigate       – (key: string) => void
//   darkMode         – boolean
//   onDarkModeToggle – () => void
//   user             – { name, role, roleLabel? }
//   selectedDomain   – string (domain ID)
//   onDomainChange   – (id: string) => void
//   collapsed        – boolean
//   onCollapseToggle – () => void
//
export default function Sidebar({
  activePage       = "dashboard",
  onNavigate,
  // darkMode / onDarkModeToggle props intentionally ignored —
  // dark mode is now managed internally via localStorage / data-theme attribute
  // eslint-disable-next-line no-unused-vars
  darkMode,
  // eslint-disable-next-line no-unused-vars
  onDarkModeToggle,
  user             = { name: "Elif Yılmaz", role: "analyst" },
  selectedDomain   = "payment",
  onDomainChange,
  collapsed        = false,
  onCollapseToggle,
  myCasesCount        = 0,
  pendingApprovalsCount = 0,
  reviewCount         = 0,
  notifications       = [],
  onMarkAllRead,
  onMarkRead,
}) {
  const [domainMenuOpen,  setDomainMenuOpen]  = useState(false);
  const [showNotifPanel,  setShowNotifPanel]  = useState(false);
  const [showUserMenu,    setShowUserMenu]    = useState(false);
  const [casesMenuOpen, setCasesMenuOpen] = useState(() => {
    const saved = localStorage.getItem("scm-cases-menu-open");
    return saved !== null ? saved === "true" : CASES_KEYS.includes(activePage);
  });
  const toggleCasesMenu = () => setCasesMenuOpen(o => {
    const next = !o;
    localStorage.setItem("scm-cases-menu-open", next);
    return next;
  });
  const [isDark, setIsDark] = useState(
    () => document.documentElement.dataset.theme === "dark"
  );

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("scm-theme", next ? "dark" : "light");
  };

  const isSuper    = user.role === "super";
  const isManager  = user.role === "manager" || user.role === "admin" || isSuper;
  const isAdmin    = user.role === "admin";
  const roleLabel  = user.roleLabel || ROLE_LABELS[user.role] || user.role;
  const sW         = collapsed ? 72 : 260;
  const isCasesActive = CASES_KEYS.includes(activePage);

  const nav = (key) => {
    if (onNavigate) onNavigate(key);
  };

  const handleTopNavClick = (key) => {
    nav(key);
  };

  const currentDomain = FRAUD_DOMAINS.find(d => d.id === selectedDomain);

  return (
    <aside style={{
      width: sW, background: C.sidebar,
      display: "flex", flexDirection: "column",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      flexShrink: 0, zIndex: 100, position: "relative",
    }}>

      {/* ── Logo + Daraltma Butonu ── */}
      <div style={{ padding: collapsed ? "20px 16px" : "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12, minHeight: 72 }}>
        <img src={appIcon} alt="SCM" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
        {!collapsed && (
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>SADE SCM</div>
            <div style={{ color: "#64748B", fontSize: 11, letterSpacing: "0.03em" }}>Vaka Yöneticisi v1.0</div>
          </div>
        )}
        {onCollapseToggle && (
          <button
            onClick={onCollapseToggle}
            title={collapsed ? "Genişlet" : "Daralt"}
            style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >
            <I.Menu />
          </button>
        )}
      </div>

      {/* ── Domain Seçimi ── */}
      <div style={{ padding: collapsed ? "10px 8px" : "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {!collapsed && (
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, padding: "0 4px" }}>
            Domain Seçimi
          </div>
        )}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDomainMenuOpen(o => !o)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "8px" : "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", cursor: "pointer", color: "#E2E8F0", transition: "all 0.15s ease", justifyContent: collapsed ? "center" : "space-between" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>{currentDomain?.icon}</span>
              {!collapsed && <span style={{ fontSize: 12.5, fontWeight: 500 }}>{currentDomain?.label}</span>}
            </div>
            {!collapsed && (
              <span style={{ transition: "transform 0.2s", transform: domainMenuOpen ? "rotate(180deg)" : "rotate(0deg)", display: "flex", color: "#64748B" }}>
                <I.ChevronDown />
              </span>
            )}
          </button>

          {domainMenuOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: collapsed ? 8 : 0, width: collapsed ? 200 : "100%", background: "#1E293B", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 300, overflow: "hidden" }}>
              {FRAUD_DOMAINS.map(d => (
                <div
                  key={d.id}
                  onClick={() => { if (onDomainChange) onDomainChange(d.id); setDomainMenuOpen(false); }}
                  style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: selectedDomain === d.id ? "rgba(59,130,246,0.15)" : "transparent" }}
                  onMouseEnter={e => e.currentTarget.style.background = selectedDomain === d.id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = selectedDomain === d.id ? "rgba(59,130,246,0.15)" : "transparent"}
                >
                  <span style={{ fontSize: 13 }}>{d.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: selectedDomain === d.id ? 600 : 400, color: selectedDomain === d.id ? "#60A5FA" : "#CBD5E1" }}>{d.label}</span>
                  {selectedDomain === d.id && <span style={{ marginLeft: "auto", color: "#60A5FA", display: "flex" }}><I.Check /></span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigasyon ── */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>

        <NavBtn navKey="dashboard"     label="Dashboard"       sublabel="Ana Sayfa"          icon={<I.Dashboard />}       activePage={activePage} collapsed={collapsed} onNavClick={handleTopNavClick} />
        {(!isAdmin || isSuper) && <NavBtn navKey="case_creation" label="Vaka Oluşturma"  sublabel="Case Creation"       icon={<I.CaseCreate />}      activePage={activePage} collapsed={collapsed} onNavClick={handleTopNavClick} />}

        {/* ─ Vaka Listesi (genişletilebilir) ─ */}
        {(!isAdmin || isSuper) && <div style={{ display: "flex", alignItems: "center", borderRadius: 8, overflow: "hidden", background: isCasesActive ? "rgba(59,130,246,0.15)" : "transparent", transition: "background 0.15s ease" }}
          onMouseEnter={e => { if (!isCasesActive) e.currentTarget.style.background = C.sidebarHover; }}
          onMouseLeave={e => { if (!isCasesActive) e.currentTarget.style.background = "transparent"; }}
        >
          <button
            onClick={() => nav("cases")}
            title={collapsed ? "Vaka Listesi" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: collapsed ? "12px 16px" : "10px 16px",
              border: "none", cursor: "pointer", flex: 1,
              textAlign: "left", background: "transparent",
              color: isCasesActive ? "#60A5FA" : "#94A3B8",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <span style={{ flexShrink: 0, display: "flex" }}><I.Cases /></span>
            {!collapsed && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>Vaka Listesi</div>
                <div style={{ fontSize: 10.5, color: "#475569", lineHeight: 1.2 }}>Case List</div>
              </div>
            )}
          </button>
          {!collapsed && (
            <button
              onClick={e => { e.stopPropagation(); toggleCasesMenu(); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, border: "none", cursor: "pointer",
                background: "transparent", color: "#64748B", flexShrink: 0,
                marginRight: 8,
              }}
              title={casesMenuOpen ? "Kapat" : "Aç"}
            >
              <span style={{ transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)", transform: casesMenuOpen ? "rotate(0deg)" : "rotate(-90deg)", display: "flex" }}>
                <I.ChevronDown />
              </span>
            </button>
          )}
        </div>}

        {/* ─ Alt menü öğeleri (animasyonlu) ─ */}
        {(!isAdmin || isSuper) && <div style={{
          overflow: "hidden",
          maxHeight: (casesMenuOpen && !collapsed) ? 300 : 0,
          opacity:   (casesMenuOpen && !collapsed) ? 1 : 0,
          transition: "max-height 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease",
        }}>
          <div style={{ marginLeft: 20, borderLeft: "2px solid rgba(255,255,255,0.1)", marginBottom: 6 }}>
            <SubItem navKey="my_cases"          label="Vakalarım"          sublabel="My Cases"          icon={<I.MyCases />}       count={myCasesCount}          activePage={activePage} onNavClick={nav} />
            <SubItem navKey="reviews"           label="İnceleme"           sublabel="Review Inbox"      icon={<I.Review />}        count={reviewCount}          activePage={activePage} onNavClick={nav} />
            {isManager && (
              <SubItem navKey="pending_approvals" label="Onay Bekleyenler"   sublabel="Pending Approvals" icon={<I.Approval />}      count={pendingApprovalsCount} activePage={activePage} onNavClick={nav} />
            )}
            <SubItem navKey="deleted_cases"     label="Silinmiş Vakalar"   sublabel="Deleted Cases"     icon={<I.DeletedCases />}  count={1}  activePage={activePage} onNavClick={nav} />
          </div>
        </div>}

        {(!isAdmin || isSuper) && <NavBtn navKey="txn_search" label="İşlem Arama" sublabel="Transaction Search" icon={<I.TransactionSearch />} activePage={activePage} collapsed={collapsed} onNavClick={handleTopNavClick} />}
        <NavBtn navKey="reports"    label="Raporlar"    sublabel="Reports"             icon={<I.Reports />}           activePage={activePage} collapsed={collapsed} onNavClick={handleTopNavClick} />
        {(!isAdmin || isSuper) && <NavBtn navKey="activities"    label="Son Aktiviteler" sublabel="Recent Activities"   icon={<I.Activity />}        activePage={activePage} collapsed={collapsed} onNavClick={handleTopNavClick} />}
        {(isAdmin || isSuper) && (
          <NavBtn navKey="settings" label="Ayarlar" sublabel="Settings" icon={<I.Settings />} activePage={activePage} collapsed={collapsed} onNavClick={handleTopNavClick} />
        )}
      </nav>

      {/* ── Alt Bölüm: Profil · Koyu Mod · Bildirim ── */}
      <div style={{ padding: collapsed ? "16px 8px" : "16px", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>

        {/* Kullanıcı menüsü */}
        {showUserMenu && (
          <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 16, width: 220, background: "#1E293B", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 30px rgba(0,0,0,0.3)", zIndex: 200, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ color: "#F8FAFC", fontWeight: 600, fontSize: 13 }}>{user.name}</div>
              <div style={{ color: "#64748B", fontSize: 11 }}>{roleLabel}</div>
            </div>
            <div
              onClick={() => setShowUserMenu(false)}
              style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#F87171" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <I.LogOut /><span style={{ fontSize: 13 }}>Çıkış Yap</span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
          {/* Avatar */}
          <Avatar name={user.name} size={34} onClick={() => setShowUserMenu(s => !s)} />

          {/* İsim / Rol */}
          {!collapsed && (
            <div onClick={() => setShowUserMenu(s => !s)} style={{ flex: 1, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user.name}</div>
              <div style={{ color: "#64748B", fontSize: 11 }}>{roleLabel}</div>
            </div>
          )}

          {/* Koyu Mod */}
          <button
            onClick={e => { e.stopPropagation(); toggleDarkMode(); }}
            title={isDark ? "Açık Mod" : "Koyu Mod"}
            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >
            {isDark ? <I.Sun /> : <I.Moon />}
          </button>

          {/* Bildirim Zili */}
          {(() => {
            const unread = notifications.filter(n => !n.read).length;
            return (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button
                  onClick={e => { e.stopPropagation(); setShowNotifPanel(s => !s); }}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: showNotifPanel ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: showNotifPanel ? "#60A5FA" : "#94A3B8" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = showNotifPanel ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}
                  title="Bildirimler"
                >
                  <I.Bell />
                  {unread > 0 && (
                    <span style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0F172A", padding: "0 2px" }}>
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>

                {showNotifPanel && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{ position: "fixed", bottom: 72, left: collapsed ? 80 : 268, width: 360, background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", zIndex: 300, overflow: "hidden", color: "#0F172A" }}
                  >
                    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Bildirimler</span>
                        {unread > 0 && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: C.danger, color: "#fff" }}>{unread} yeni</span>}
                      </div>
                      {unread > 0 && (
                        <span
                          onClick={() => { if (onMarkAllRead) onMarkAllRead(); }}
                          style={{ fontSize: 12, color: C.primaryLight, cursor: "pointer", fontWeight: 600 }}
                        >
                          Tümünü Okundu İşaretle
                        </span>
                      )}
                    </div>
                    <div style={{ maxHeight: 340, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "32px 20px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                          Henüz bildirim yok
                        </div>
                      ) : notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (onMarkRead) onMarkRead(n.id);
                            if (n.caseId && onNavigate) { onNavigate("case_detail", { id: n.caseId }); setShowNotifPanel(false); }
                          }}
                          style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, cursor: n.caseId ? "pointer" : "default", background: n.read ? "#fff" : "#F0F6FF", display: "flex", alignItems: "flex-start", gap: 12, transition: "background .15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                          onMouseLeave={e => e.currentTarget.style.background = n.read ? "#fff" : "#F0F6FF"}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: NOTIF_COLORS[n.type] || NOTIF_COLORS.default, flexShrink: 0, marginTop: 5 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, lineHeight: 1.4, color: "#0F172A" }}>{n.msg}</div>
                            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{relTime(n.time)}</div>
                          </div>
                          {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB", flexShrink: 0, marginTop: 6 }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </aside>
  );
}
