import { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import FilterBar from "../components/FilterBar";
import { dashboard as dashboardApi } from "../api/client";

// --- Mock Data ---
const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", email: "elif@bank.com" },
  manager: { id: 2, name: "Burak Şen", role: "manager", email: "burak@bank.com" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", email: "zeynep@bank.com" },
  super: { id: 4, name: "Toygun Baysal", role: "super", email: "toygun@bank.com" },
};

const MOCK_ACTIVITIES = [
  { id: 1, user: "Elif Yılmaz", action: "Vaka oluşturdu", caseId: 2471, caseName: "Şüpheli EFT Transferi", time: "2026-03-06T14:30:00", type: "create" },
  { id: 2, user: "Mehmet Öz", action: "Vaka kapattı", caseId: 2468, caseName: "Kart Dolandırıcılığı", time: "2026-03-06T14:17:00", type: "close" },
  { id: 3, user: "Ayşe Tan", action: "Yorum ekledi", caseId: 2465, caseName: "Hesap Ele Geçirme", time: "2026-03-06T14:00:00", type: "comment" },
  { id: 4, user: "Can Yıldız", action: "Vaka atadı", caseId: 2470, caseName: "Çoklu Kanal Fraud", time: "2026-03-06T13:32:00", type: "assign" },
  { id: 5, user: "Elif Yılmaz", action: "Dosya yükledi", caseId: 2463, caseName: "Sahte Kimlik Başvurusu", time: "2026-03-06T12:30:00", type: "upload" },
  { id: 6, user: "Burak Şen", action: "Kapatma onayladı", caseId: 2460, caseName: "POS Dolandırıcılığı", time: "2026-03-06T11:30:00", type: "approve" },
  { id: 7, user: "Selin Aydın", action: "Review tamamladı", caseId: 2459, caseName: "ATM Skimming", time: "2026-03-06T10:30:00", type: "review" },
  { id: 8, user: "Elif Yılmaz", action: "Yorum ekledi", caseId: 2471, caseName: "Şüpheli EFT Transferi", time: "2026-03-06T10:00:00", type: "comment" },
  { id: 9, user: "Mehmet Öz", action: "Vaka oluşturdu", caseId: 2467, caseName: "Başvuru Sahteciliği", time: "2026-03-06T09:45:00", type: "create" },
  { id: 10, user: "Can Yıldız", action: "Dosya yükledi", caseId: 2470, caseName: "Çoklu Kanal Fraud", time: "2026-03-06T09:15:00", type: "upload" },
  { id: 11, user: "Ayşe Tan", action: "Vaka atadı", caseId: 2465, caseName: "Hesap Ele Geçirme", time: "2026-03-06T08:50:00", type: "assign" },
  { id: 12, user: "Burak Şen", action: "Vaka kapattı", caseId: 2455, caseName: "İç Fraud Şüphesi", time: "2026-03-06T08:20:00", type: "close" },
  { id: 13, user: "Selin Aydın", action: "Yorum ekledi", caseId: 2459, caseName: "ATM Skimming", time: "2026-03-05T17:00:00", type: "comment" },
  { id: 14, user: "Elif Yılmaz", action: "Vaka oluşturdu", caseId: 2458, caseName: "Dijital Cüzdan Kötüye Kullanım", time: "2026-03-05T16:30:00", type: "create" },
  { id: 15, user: "Mehmet Öz", action: "Review tamamladı", caseId: 2456, caseName: "Sahte Belge Dolandırıcılığı", time: "2026-03-05T15:45:00", type: "review" },
  { id: 16, user: "Can Yıldız", action: "Kapatma onayladı", caseId: 2453, caseName: "Online Bankacılık Fraud", time: "2026-03-05T14:00:00", type: "approve" },
  { id: 17, user: "Ayşe Tan", action: "Vaka oluşturdu", caseId: 2452, caseName: "Kimlik Hırsızlığı", time: "2026-03-05T11:30:00", type: "create" },
  { id: 18, user: "Elif Yılmaz", action: "Vaka atadı", caseId: 2450, caseName: "Sahte Çek İşlemi", time: "2026-03-05T10:15:00", type: "assign" },
  { id: 19, user: "Burak Şen", action: "Dosya yükledi", caseId: 2448, caseName: "Kredi Başvuru Sahteciliği", time: "2026-03-05T09:00:00", type: "upload" },
  { id: 20, user: "Mehmet Öz", action: "Vaka kapattı", caseId: 2445, caseName: "Hesap Açılış Dolandırıcılığı", time: "2026-03-04T16:45:00", type: "close" },
  { id: 21, user: "Selin Aydın", action: "Yorum ekledi", caseId: 2444, caseName: "Kara Para Aklama Şüphesi", time: "2026-03-04T15:20:00", type: "comment" },
  { id: 22, user: "Can Yıldız", action: "Vaka oluşturdu", caseId: 2442, caseName: "Sigorta Dolandırıcılığı", time: "2026-03-04T14:00:00", type: "create" },
  { id: 23, user: "Elif Yılmaz", action: "Review tamamladı", caseId: 2440, caseName: "Sahte Fatura İşlemi", time: "2026-03-04T12:30:00", type: "review" },
  { id: 24, user: "Ayşe Tan", action: "Kapatma onayladı", caseId: 2438, caseName: "Mükerrer Ödeme Talebi", time: "2026-03-04T11:00:00", type: "approve" },
  { id: 25, user: "Burak Şen", action: "Vaka atadı", caseId: 2435, caseName: "Yetkisiz Erişim Girişimi", time: "2026-03-04T09:30:00", type: "assign" },
];

// --- Icons ---
const Icons = {
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  ChevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Export: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

// --- Action config ---
const ACTION_ICONS = {
  create:  { icon: "+", color: "#059669", label: "Oluşturma" },
  close:   { icon: "✓", color: "#7C3AED", label: "Kapatma" },
  comment: { icon: "💬", color: "#2563EB", label: "Yorum" },
  assign:  { icon: "→", color: "#D97706", label: "Atama" },
  upload:  { icon: "↑", color: "#0891B2", label: "Dosya Yükleme" },
  approve: { icon: "✓", color: "#059669", label: "Onay" },
  review:  { icon: "◎", color: "#7C3AED", label: "İnceleme" },
};

const ACTION_CHIPS = Object.entries(ACTION_ICONS).map(([key, val]) => ({
  key,
  label: val.label,
  bg: `${val.color}18`,
  color: val.color,
  border: `${val.color}40`,
}));

const TEAM_USERS = [
  { value: "", label: "Tüm Kullanıcılar" },
  { value: "Elif Yılmaz", label: "Elif Yılmaz" },
  { value: "Mehmet Öz", label: "Mehmet Öz" },
  { value: "Ayşe Tan", label: "Ayşe Tan" },
  { value: "Can Yıldız", label: "Can Yıldız" },
  { value: "Selin Aydın", label: "Selin Aydın" },
  { value: "Burak Şen", label: "Burak Şen" },
];

// --- Style constants ---
const COLORS = {
  primary: "#1E40AF",
  primaryLight: "#3B82F6",
  bg: "#F1F5F9",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
};

// --- Helpers ---
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

const PAGE_SIZE_OPTIONS = [
  { value: "15", label: "15 / sayfa" },
  { value: "25", label: "25 / sayfa" },
  { value: "50", label: "50 / sayfa" },
];

export default function SCMActivities({ onNavigate, currentRole = "analyst", onRoleChange, selectedDomain = "payment", onDomainChange, notifications = [], onMarkAllRead, onMarkRead, showToast } = {}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    actionTypes: [],
    userName: "",
    dateFrom: "",
    dateTo: "",
  });

  const user = USERS[currentRole];
  const isManager = currentRole === "manager";

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ actionTypes: [], userName: "", dateFrom: "", dateTo: "" });
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.actionTypes.length) c++;
    if (filters.userName) c++;
    if (filters.dateFrom || filters.dateTo) c++;
    return c;
  }, [filters]);

  // Fetch activities
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = {
      domain: selectedDomain,
      page,
      limit: pageSize,
      search: debouncedSearch || undefined,
      action_type: filters.actionTypes.length === 1 ? filters.actionTypes[0] : undefined,
      user_name: currentRole === "analyst" ? user.name : (filters.userName || undefined),
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
    };

    dashboardApi.activity(params)
      .then(res => {
        if (cancelled) return;
        const rows = (res.data || res);
        const mapped = (Array.isArray(rows) ? rows : []).map((a, i) => ({
          id: a.id || i,
          user: a.user_name,
          action: a.action,
          caseId: a.case_id,
          caseName: a.case_name || '',
          time: a.created_at,
          type: a.action_type || 'create',
          detail: a.detail || '',
        }));
        setActivities(mapped);
        setTotalCount(res.total || mapped.length);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Fallback to mock data with client-side filtering
        let mock = [...MOCK_ACTIVITIES];
        if (currentRole === "analyst") mock = mock.filter(a => a.user === user.name);
        if (filters.actionTypes.length) mock = mock.filter(a => filters.actionTypes.includes(a.type));
        if (filters.userName) mock = mock.filter(a => a.user === filters.userName);
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          mock = mock.filter(a => a.caseName.toLowerCase().includes(q) || String(a.caseId).includes(q));
        }
        const total = mock.length;
        const start = (page - 1) * pageSize;
        setActivities(mock.slice(start, start + pageSize));
        setTotalCount(total);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedDomain, page, pageSize, debouncedSearch, filters, currentRole, user.name]);

  // Client-side multi-action-type filter (when multiple selected, API only supports single)
  const displayActivities = useMemo(() => {
    if (filters.actionTypes.length > 1) {
      return activities.filter(a => filters.actionTypes.includes(a.type));
    }
    return activities;
  }, [activities, filters.actionTypes]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const dateStr = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });

  return (
    <div className="scm-layout">
      <Sidebar
        activePage="activities"
        onNavigate={onNavigate}
        user={user}
        selectedDomain={selectedDomain}
        onDomainChange={onDomainChange}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(c => !c)}
        notifications={notifications}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{
          height: 64, background: "#fff", borderBottom: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: COLORS.text }}>Son Aktiviteler</h1>
            <p style={{ fontSize: 12, color: COLORS.textSecondary, margin: 0 }}>
              {isManager ? "Tüm ekip aktiviteleri" : "Kendi aktiviteleriniz"} &middot; {dateStr}
            </p>
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
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: COLORS.textSecondary }}>
              <Icons.Globe /> TR
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
            flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: 220, maxWidth: 400 }}>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Vaka adı veya ID ile ara..."
                size="md"
              />
            </div>
            <FilterBar.Toggle open={showFilters} onToggle={() => setShowFilters(o => !o)} activeCount={activeFilterCount} />
            <button
              onClick={() => showToast && showToast("success", `${totalCount} aktivite Excel (.xlsx) olarak indiriliyor...`)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
                borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: "#F8FAFC", color: COLORS.text,
                border: `1.5px solid ${COLORS.border}`, transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#059669"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#059669"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = COLORS.text; e.currentTarget.style.borderColor = COLORS.border; }}
            >
              <Icons.Export /> Export
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
              <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
                {totalCount} aktivite
              </span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{
                  padding: "6px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}`,
                  fontSize: 12, color: COLORS.text, background: "#fff", cursor: "pointer",
                }}
              >
                {PAGE_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <FilterBar.Panel onReset={resetFilters} style={{ marginBottom: 16 }}>
              <FilterBar.ChipGroup
                label="Aksiyon Tipi"
                options={ACTION_CHIPS}
                selected={filters.actionTypes}
                onToggle={key => {
                  const next = filters.actionTypes.includes(key)
                    ? filters.actionTypes.filter(k => k !== key)
                    : [...filters.actionTypes, key];
                  updateFilter("actionTypes", next);
                }}
              />
              {isManager && (
                <FilterBar.Select
                  label="Kullanıcı"
                  value={filters.userName}
                  onChange={v => updateFilter("userName", v)}
                  options={TEAM_USERS}
                />
              )}
              <FilterBar.DateRange
                label="Tarih Aralığı"
                from={filters.dateFrom}
                to={filters.dateTo}
                onFromChange={v => updateFilter("dateFrom", v)}
                onToChange={v => updateFilter("dateTo", v)}
              />
            </FilterBar.Panel>
          )}

          {/* Activity List */}
          <div style={{
            background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
          }}>
            {loading ? (
              // Skeleton
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  padding: "16px 22px", borderBottom: `1px solid ${COLORS.border}`,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#E2E8F0", animation: "actPulse 1.4s ease-in-out infinite" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, width: "60%", borderRadius: 4, background: "#E2E8F0", marginBottom: 6, animation: "actPulse 1.4s ease-in-out infinite" }} />
                    <div style={{ height: 12, width: "40%", borderRadius: 4, background: "#F1F5F9", animation: "actPulse 1.4s ease-in-out infinite" }} />
                  </div>
                  <div style={{ width: 80, height: 12, borderRadius: 4, background: "#F1F5F9", animation: "actPulse 1.4s ease-in-out infinite" }} />
                  <style>{`@keyframes actPulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
                </div>
              ))
            ) : displayActivities.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: COLORS.textSecondary }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📋</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Aktivite bulunamadı</div>
                <div style={{ fontSize: 12 }}>Filtrelerinizi değiştirerek tekrar deneyebilirsiniz.</div>
              </div>
            ) : (
              displayActivities.map(act => {
                const actionCfg = ACTION_ICONS[act.type] || ACTION_ICONS.create;
                return (
                  <div
                    key={act.id}
                    style={{
                      padding: "14px 22px", borderBottom: `1px solid ${COLORS.border}`,
                      display: "flex", alignItems: "flex-start", gap: 12,
                    }}
                  >
                    {/* Action icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0, marginTop: 2,
                      background: `${actionCfg.color}14`, color: actionCfg.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, fontWeight: 700,
                    }}>
                      {actionCfg.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600 }}>{act.user}</span>
                        <span style={{ color: COLORS.textSecondary }}> {act.action}</span>
                      </div>
                      <div style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{ color: COLORS.primaryLight, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>#{act.caseId}</span>
                        <span style={{ color: COLORS.textSecondary }}>—</span>
                        <span style={{ color: COLORS.text, fontWeight: 500 }}>{act.caseName}</span>
                      </div>
                      {act.detail && (
                        <div style={{ fontSize: 11.5, color: COLORS.textSecondary, marginTop: 3, lineHeight: 1.4 }}>
                          {act.detail}
                        </div>
                      )}
                    </div>

                    {/* Time */}
                    <div style={{ flexShrink: 0, textAlign: "right", marginTop: 2 }}>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary, whiteSpace: "nowrap" }}>
                        {formatRelativeTime(act.time)}
                      </div>
                      <div style={{ fontSize: 10, color: COLORS.textSecondary, opacity: 0.7, whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                        {formatDate(act.time)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 4, marginTop: 20,
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  width: 32, height: 32, borderRadius: 6, border: `1px solid ${COLORS.border}`,
                  background: "#fff", cursor: page === 1 ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: page === 1 ? COLORS.border : COLORS.text,
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                <Icons.ChevronLeft />
              </button>

              {(() => {
                const pages = [];
                const maxVisible = 7;
                let start = Math.max(1, page - Math.floor(maxVisible / 2));
                let end = Math.min(totalPages, start + maxVisible - 1);
                if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

                if (start > 1) {
                  pages.push(1);
                  if (start > 2) pages.push("...");
                }
                for (let i = start; i <= end; i++) pages.push(i);
                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push("...");
                  pages.push(totalPages);
                }

                return pages.map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} style={{ width: 32, textAlign: "center", fontSize: 12, color: COLORS.textSecondary }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        minWidth: 32, height: 32, borderRadius: 6, fontSize: 12, fontWeight: 600,
                        border: page === p ? "none" : `1px solid ${COLORS.border}`,
                        background: page === p ? COLORS.primary : "#fff",
                        color: page === p ? "#fff" : COLORS.text,
                        cursor: "pointer", padding: "0 8px",
                      }}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  width: 32, height: 32, borderRadius: 6, border: `1px solid ${COLORS.border}`,
                  background: "#fff", cursor: page === totalPages ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: page === totalPages ? COLORS.border : COLORS.text,
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                <Icons.ChevronRight />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
