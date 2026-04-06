import { useState, useEffect, useCallback } from "react";
import PageTransition from "./components/PageTransition";
import SCMDashboard from "./pages/SCM_Dashboard";
import SCMCaseList from "./pages/SCM_CaseList";
import SCMCaseCreation from "./pages/SCM_CaseCreation";
import SCMCaseDetail from "./pages/SCM_CaseDetail";
import SCMReview from "./pages/SCM_Review";
import SCMTransactionSearch from "./pages/SCM_TransactionSearch";
import SCMReports from "./pages/SCM_Reports";
import SCMSettings from "./pages/SCM_Settings";
import SCMActivities from "./pages/SCM_Activities";
import Toast from "./components/Toast";
import { cases as casesApi, fdm as fdmApi, settings as settingsApi } from "./api/client";
import { generateCases, generateTransactions, DOMAIN_TO_SOURCE } from "./data/mockData";

// Nav key → canonical page key
const KEY_MAP = {
  dashboard:         "dashboard",
  activities:        "activities",
  case_creation:     "case_creation",
  cases:             "cases",
  my_cases:          "cases",
  reviews:           "review",
  review_inbox:      "review",
  review_sent:       "review",
  txn_search:        "txn_search",
  reports:           "reports",
  settings:          "settings",
  user_mgmt:         "settings",
  case_detail:       "case_detail",
  pending_approvals: "cases",
  deleted_cases:     "cases",
};

// Sidebar case sub-key → CaseList internal view
const CASE_VIEW_MAP = {
  cases:             "case_list",
  my_cases:          "my_cases",
  pending_approvals: "approvals",
  deleted_cases:     "deleted",
};

// Generates a new case ID (max existing + 1)
const nextCaseId = (cases) => Math.max(...cases.map(c => c.id), 2471) + 1;

// Today helper → "DD.MM.YYYY"
const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
};

export default function SCMApp() {
  const [activePage,    setActivePage]    = useState("dashboard");
  const [selectedCase,  setSelectedCase]  = useState(null);
  const [initialNavKey, setInitialNavKey] = useState("cases");
  const [currentRole,   setCurrentRole]   = useState(() => localStorage.getItem("scm-role") || "analyst");
  const [selectedDomain, setSelectedDomain] = useState(() => localStorage.getItem("scm-domain") || "payment");

  const onDomainChange = useCallback((id) => {
    setSelectedDomain(id);
    localStorage.setItem("scm-domain", id);
    setActivePage(prev => prev === "case_detail" ? "dashboard" : prev);
  }, []);

  const onRoleChange = (role) => {
    setCurrentRole(role);
    localStorage.setItem("scm-role", role);
    if (role === "admin") {
      const adminAllowed = new Set(["dashboard", "reports", "settings"]);
      setActivePage(p => adminAllowed.has(p) ? p : "dashboard");
    }
    // super can see everything — no page restriction needed
  };

  // ── Domain list (dynamic, loaded from API) ──
  const DEFAULT_DOMAINS = [
    { id: "payment",          label: "Payment Fraud",       icon: "₺",  color: "#0891B2" },
    { id: "credit_card",      label: "Credit Card Fraud",   icon: "💳", color: "#8B5CF6" },
    { id: "application",      label: "Application Fraud",   icon: "📋", color: "#F59E0B" },
    { id: "account_takeover", label: "Account Takeover",    icon: "🔓", color: "#EF4444" },
    { id: "internal",         label: "Internal Fraud",      icon: "🏢", color: "#6366F1" },
  ];
  const [fraudDomains, setFraudDomains] = useState(DEFAULT_DOMAINS);

  useEffect(() => {
    settingsApi.domainList().then(rows => {
      if (rows && rows.length > 0) setFraudDomains(rows);
    }).catch(() => {});
  }, []);

  // ── Shared state ──
  const [cases,        setCases]        = useState(() => generateCases());
  const [transactions, setTransactions] = useState(() => generateTransactions());
  const [apiReady,     setApiReady]     = useState(false);
  const [casesLoading, setCasesLoading] = useState(true);

  // ── Toast state ──
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((type, msg, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, type, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Notification state ──
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem("scm-notifications") || "[]"); } catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem("scm-notifications", JSON.stringify(notifications.slice(0, 50)));
  }, [notifications]);
  const addNotification = useCallback((type, msg, caseId = null) => {
    setNotifications(prev => [{ id: Date.now() + Math.random(), type, msg, time: Date.now(), read: false, caseId }, ...prev].slice(0, 50));
  }, []);
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);
  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  // Load cases and transactions from API; re-fetch when domain changes
  useEffect(() => {
    setCasesLoading(true);
    let cancelled = false;
    Promise.all([
      casesApi.list({ limit: 200, domain: selectedDomain }),
      fdmApi.transactions({ limit: 200, domain: DOMAIN_TO_SOURCE[selectedDomain] }),
    ]).then(([casesRes, txnsRes]) => {
      if (cancelled) return;
      // Normalize API case shape → frontend shape
      const normalized = casesRes.data.map(c => ({
        ...c,
        transactions:  c.transactions || [],
        createDate:    c.create_date,
        updateDate:    c.update_date,
        createUser:    c.create_user,
        updateUser:    c.update_user,
        totalAmount:   c.total_amount,
        bankShare:     c.bank_share    ?? 0,
        customerShare: c.customer_share ?? 0,
      }));
      setCases(normalized);

      const normalizedTxns = txnsRes.data.map(t => ({
        id:           t.id,
        source:       t.source,
        sourceLabel:  t.source_label,
        sourceColor:  t.source_color,
        entityType:   t.entity_type,
        entityKey:    t.entity_key,
        severity:     t.severity,
        score:        t.score,
        triggerRule:  t.trigger_rule,
        markStatus:   t.mark_status,
        createDate:   t.create_date,
        caseId:       t.case_id ? `#${t.case_id}` : null,
        amount:       t.amount,
        currency:     t.currency,
        customerName: t.customer_name,
        customerNo:   t.customer_no,
      }));
      setTransactions(normalizedTxns);
      setApiReady(true);
      setCasesLoading(false);
    }).catch(() => {
      // API unavailable — filter mock data by domain
      const domainSource = DOMAIN_TO_SOURCE[selectedDomain];
      setCases(generateCases().filter(c => c.domain_id === selectedDomain));
      setTransactions(generateTransactions().filter(t => t.source === domainSource));
      setApiReady(false);
      setCasesLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedDomain]);

  const refreshCases = useCallback(() => {
    casesApi.list({ limit: 200, domain: selectedDomain }).then(res => {
      const normalized = res.data.map(c => ({
        ...c,
        transactions:  c.transactions || [],
        createDate:    c.create_date,
        updateDate:    c.update_date,
        createUser:    c.create_user,
        updateUser:    c.update_user,
        totalAmount:   c.total_amount,
        bankShare:     c.bank_share    ?? 0,
        customerShare: c.customer_share ?? 0,
      }));
      setCases(normalized);
    }).catch(() => {});
  }, [selectedDomain]);

  const ADMIN_ALLOWED_PAGES = new Set(["dashboard", "reports", "settings"]);

  const navigate = (key, data) => {
    const page = KEY_MAP[key];
    if (page) {
      if (currentRole === "admin" && !ADMIN_ALLOWED_PAGES.has(page)) return;
      if (key === "case_detail" && data) setSelectedCase(data);
      if (page === "cases") setInitialNavKey(key);
      setActivePage(page);
    }
  };

  // Called by CaseCreation when user confirms "Vaka Oluştur"
  const onCaseCreated = (newCase) => {
    // Optimistic update
    setCases(prev => [newCase, ...prev]);
    if (newCase.transactions?.length) {
      const ids = new Set(newCase.transactions.map(t => t.id));
      setTransactions(prev => prev.map(t => ids.has(t.id) ? { ...t, markStatus: "Case Assigned", caseId: `#${newCase.id}` } : t));
    }
    addNotification("case_created", `Vaka oluşturuldu — ${newCase.name}`, newCase.id);
    // Persist to API if available, then refresh
    if (apiReady) {
      casesApi.create({
        name: newCase.name,
        description: newCase.description,
        status: newCase.status,
        severity: newCase.severity,
        owner: newCase.owner,
        create_user: newCase.createUser || newCase.create_user,
        currency: newCase.currency,
        domain_id: newCase.domain_id || selectedDomain,
        total_amount: newCase.totalAmount || newCase.total_amount || 0,
        transaction_ids: newCase.transactions?.map(t => t.id) || [],
      }).then(() => refreshCases()).catch((err) => {
        showToast("error", err?.message || "Vaka API'ye kaydedilemedi");
      });
    }
    showToast("success", `Vaka "${newCase.name}" başarıyla oluşturuldu. Vaka listesine yönlendiriliyorsunuz...`);
    setTimeout(() => navigate("cases"), 1500);
  };

  // Called by CaseDetail when case is mutated (close, edit, etc.)
  const onCaseUpdated = (updatedCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? { ...c, ...updatedCase } : c));
    setSelectedCase(prev => prev && prev.id === updatedCase.id ? { ...prev, ...updatedCase } : prev);
    // Persist to API if available
    if (apiReady && updatedCase.id) {
      const payload = {};
      if (updatedCase.status !== undefined)      payload.status       = updatedCase.status;
      if (updatedCase.severity !== undefined)    payload.severity     = updatedCase.severity;
      if (updatedCase.owner !== undefined)       payload.owner        = updatedCase.owner;
      if (updatedCase.name !== undefined)        payload.name         = updatedCase.name;
      if (updatedCase.close_reason !== undefined) payload.close_reason = updatedCase.close_reason;
      if (updatedCase.updateUser || updatedCase.update_user) payload.update_user = updatedCase.updateUser || updatedCase.update_user;
      if (Object.keys(payload).length > 0) {
        casesApi.update(updatedCase.id, payload).catch((err) => {
          showToast("error", err?.message || "Vaka güncellenemedi");
        });
      }
    }
  };

  const USERS_BY_ROLE = { analyst: "Elif Yılmaz", manager: "Burak Şen", admin: "Zeynep Demir", super: "Toygun Baysal" };
  const currentUserName = USERS_BY_ROLE[currentRole];
  const myCasesCount = cases.filter(c => c.status !== "Deleted" && c.owner === currentUserName).length;
  const pendingApprovalsCount = cases.filter(c => c.status === "Pending Closure").length;
  const reviewCount = cases.filter(c => c.status === "Under Review").length;

  const p = { onNavigate: navigate, currentRole, onRoleChange, selectedDomain, onDomainChange, myCasesCount, pendingApprovalsCount, reviewCount, notifications, addNotification, onMarkAllRead: markAllRead, onMarkRead: markRead, showToast, fraudDomains, onDomainsChange: setFraudDomains };

  return (
    <>
      <PageTransition key={activePage}>
        {activePage === "dashboard"      && <SCMDashboard         {...p} cases={cases} />}
        {activePage === "activities"     && <SCMActivities        {...p} />}
        {activePage === "case_creation"  && <SCMCaseCreation      {...p} transactions={transactions} cases={cases} onCaseCreated={onCaseCreated} />}
        {activePage === "cases"          && <SCMCaseList          {...p} cases={cases} casesLoading={casesLoading} onCaseUpdated={onCaseUpdated} initialNavKey={initialNavKey} />}
        {activePage === "case_detail"    && <SCMCaseDetail        {...p} key={selectedCase?.id} initialCase={selectedCase} onCaseUpdated={onCaseUpdated} />}
        {activePage === "review"         && <SCMReview            {...p} />}
        {activePage === "txn_search"     && <SCMTransactionSearch {...p} transactions={transactions} />}
        {activePage === "reports"        && <SCMReports           {...p} />}
        {activePage === "settings"       && <SCMSettings          {...p} />}
      </PageTransition>
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export { nextCaseId, todayStr };
