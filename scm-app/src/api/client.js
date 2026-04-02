// ─── Thin fetch wrapper for the SCM API ───
// All pages use this — never call fetch() directly.

const BASE = '/api';

async function req(method, path, body, isFormData = false) {
  const opts = { method };
  if (body) {
    if (isFormData) {
      opts.body = body;
    } else {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

const get = (path) => req('GET', path);
const post = (path, body) => req('POST', path, body);
const patch = (path, body) => req('PATCH', path, body);
const del = (path, body) => req('DELETE', path, body);
const postForm = (path, formData) => req('POST', path, formData, true);

// ─── FDM (read-only) ───
export const fdm = {
  transactions: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))).toString();
    return get(`/fdm/transactions${qs ? '?' + qs : ''}`);
  },
  transaction: (id) => get(`/fdm/transactions/${id}`),
  entities: () => get('/fdm/entities'),
  domains: () => get('/fdm/domains'),
};

// ─── Cases ───
export const cases = {
  list: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))).toString();
    return get(`/cases${qs ? '?' + qs : ''}`);
  },
  get: (id) => get(`/cases/${id}`),
  create: (body) => post('/cases', body),
  update: (id, body) => patch(`/cases/${id}`, body),
  delete: (id, body) => del(`/cases/${id}`, body),
};

// ─── Case sub-resources ───
export const transactions = {
  list: (caseId) => get(`/cases/${caseId}/transactions`),
  link: (caseId, body) => post(`/cases/${caseId}/transactions`, body),
  unlink: (caseId, txnId) => del(`/cases/${caseId}/transactions/${txnId}`),
};

export const comments = {
  list: (caseId) => get(`/cases/${caseId}/comments`),
  create: (caseId, body) => post(`/cases/${caseId}/comments`, body),
};

export const attachments = {
  list: (caseId) => get(`/cases/${caseId}/attachments`),
  upload: (caseId, formData) => postForm(`/cases/${caseId}/attachments`, formData),
};

export const history = {
  list: (caseId) => get(`/cases/${caseId}/history`),
  create: (caseId, body) => post(`/cases/${caseId}/history`, body),
};

export const reviews = {
  list: (caseId) => get(`/cases/${caseId}/reviews`),
  listAll: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))).toString();
    return get(`/reviews${qs ? '?' + qs : ''}`);
  },
  create: (caseId, body) => post(`/cases/${caseId}/reviews`, body),
  update: (caseId, reviewId, body) => patch(`/cases/${caseId}/reviews/${reviewId}`, body),
};

export const relations = {
  list: (caseId) => get(`/cases/${caseId}/relations`),
  create: (caseId, body) => post(`/cases/${caseId}/relations`, body),
  delete: (caseId, relatedId) => del(`/cases/${caseId}/relations/${relatedId}`),
};

// ─── Users ───
export const users = {
  list: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))).toString();
    return get(`/users${qs ? '?' + qs : ''}`);
  },
};

// ─── Settings ───
export const settings = {
  getDomain: (domainId) => get(`/settings/domains/${domainId}`),
  updateDomain: (domainId, body) => patch(`/settings/domains/${domainId}`, body),
  auditLog: () => get('/settings/audit-log'),
  domainList: () => get('/settings/domain-list'),
  createDomain: (body) => post('/settings/domain-list', body),
  deleteDomain: (id) => del(`/settings/domain-list/${id}`),
};

// ─── Approvals ───
export const approvals = {
  list: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))).toString();
    return get(`/approvals${qs ? '?' + qs : ''}`);
  },
  create: (body) => post('/approvals', body),
  update: (id, body) => patch(`/approvals/${id}`, body),
};

// ─── Dashboard ───
const qs = (params) => {
  const s = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))).toString();
  return s ? '?' + s : '';
};
export const dashboard = {
  kpis: (params = {}) => get(`/dashboard/kpis${qs(params)}`),
  activity: (params = {}) => get(`/dashboard/activity${qs(params)}`),
  unassignedCases: (params = {}) => get(`/dashboard/unassigned-cases${qs(params)}`),
  trends: (params = {}) => get(`/dashboard/trends${qs(params)}`),
  severityDistribution: (params = {}) => get(`/dashboard/severity-distribution${qs(params)}`),
  domainHeatmap: () => get('/dashboard/domain-heatmap'),
  amountTrends: (params = {}) => get(`/dashboard/amount-trends${qs(params)}`),
  riskScoreDistribution: (params = {}) => get(`/dashboard/risk-score-distribution${qs(params)}`),
  analystPerformance: (params = {}) => get(`/dashboard/analyst-performance${qs(params)}`),
  fraudFunnel: (params = {}) => get(`/dashboard/fraud-funnel${qs(params)}`),
};

export default { fdm, cases, transactions, comments, attachments, history, reviews, relations, users, settings, approvals, dashboard };
