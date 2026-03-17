import { useState } from "react";
import SCMDashboard from "./SCM_Dashboard";
import SCMCaseList from "./pages/SCM_CaseList";
import SCMCaseCreation from "./SCM_CaseCreation";
import SCMCaseDetail from "./SCM_CaseDetail";
import SCMReview from "./SCM_Review";
import SCMTransactionSearch from "./SCM_TransactionSearch";
import SCMReports from "./SCM_Reports";
import SCMSettings from "./SCM_Settings";

// Nav key → canonical page key
const KEY_MAP = {
  dashboard:         "dashboard",
  case_creation:     "case_creation",
  cases:             "cases",
  my_cases:          "cases",        // CaseList handles the "my cases" sub-view internally
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

export default function SCMApp() {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedCase, setSelectedCase] = useState(null);

  const navigate = (key, data) => {
    const page = KEY_MAP[key];
    if (page) {
      if (key === "case_detail" && data) setSelectedCase(data);
      setActivePage(page);
    }
  };

  const p = { onNavigate: navigate };

  return (
    <>
      {activePage === "dashboard"      && <SCMDashboard        {...p} />}
      {activePage === "case_creation"  && <SCMCaseCreation     {...p} />}
      {activePage === "cases"          && <SCMCaseList         {...p} />}
      {activePage === "case_detail"    && <SCMCaseDetail       {...p} key={selectedCase?.id} initialCase={selectedCase} />}
      {activePage === "review"         && <SCMReview           {...p} />}
      {activePage === "txn_search"     && <SCMTransactionSearch {...p} />}
      {activePage === "reports"        && <SCMReports          {...p} />}
      {activePage === "settings"       && <SCMSettings         {...p} />}
    </>
  );
}
