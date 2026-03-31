// ─── Shared mock data for SCM App ───
// All pages pull from here; SCM_App lifts state and passes via props.

export const DOMAIN_TO_SOURCE = {
  payment:          "payment_fraud",
  credit_card:      "cc_fraud",
  application:      "app_fraud",
  account_takeover: "ato_fraud",
  internal:         "int_fraud",
};

export const SHARED_USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", roleLabel: "Fraud Analist", email: "elif@bank.com" },
  manager: { id: 2, name: "Burak Şen", role: "manager", roleLabel: "Yönetici", email: "burak@bank.com" },
  admin:   { id: 3, name: "Zeynep Demir", role: "admin", roleLabel: "Admin", email: "zeynep@bank.com" },
  super:   { id: 4, name: "Toygun Baysal", role: "super", roleLabel: "Super Admin", email: "toygun@bank.com" },
};

// generateCases and generateTransactions now return [] — data comes from the API.
// The full seed data lives in scm-api/db/seed/.
export const generateCases = () => [
  { id: 2471, name: "Şüpheli EFT Transferi",           status: "Open",            severity: "critical", owner: null,          createUser: "Elif Yılmaz",  createDate: "06.03.2026", updateUser: "Elif Yılmaz",  updateDate: "06.03.2026", totalAmount: 284500,  currency: "TRY", domain_id: "payment",          transactions: [] },
  { id: 2470, name: "Çoklu Kanal Fraud",                status: "Open",            severity: "high",     owner: "Mehmet Öz",   createUser: "Burak Şen",    createDate: "06.03.2026", updateUser: "Mehmet Öz",    updateDate: "06.03.2026", totalAmount: 157200,  currency: "TRY", domain_id: "payment",          transactions: [] },
  { id: 2469, name: "Sahte Belge Dolandırıcılığı",      status: "Pending Closure", severity: "high",     owner: "Elif Yılmaz", createUser: "Elif Yılmaz",  createDate: "05.03.2026", updateUser: "Elif Yılmaz",  updateDate: "06.03.2026", totalAmount: 92000,   currency: "TRY", domain_id: "application",      transactions: [] },
  { id: 2468, name: "Kart Dolandırıcılığı",             status: "Closed",          severity: "medium",   owner: "Ayşe Tan",    createUser: "Ayşe Tan",     createDate: "05.03.2026", updateUser: "Burak Şen",    updateDate: "06.03.2026", totalAmount: 43750,   currency: "TRY", domain_id: "credit_card",      transactions: [] },
  { id: 2467, name: "Başvuru Sahteciliği",              status: "Open",            severity: "medium",   owner: null,          createUser: "Can Yıldız",   createDate: "05.03.2026", updateUser: "Can Yıldız",   updateDate: "05.03.2026", totalAmount: 0,       currency: "TRY", domain_id: "application",      transactions: [] },
  { id: 2466, name: "Online Bankacılık Fraud",          status: "Pending Closure", severity: "medium",   owner: "Mehmet Öz",   createUser: "Mehmet Öz",    createDate: "04.03.2026", updateUser: "Mehmet Öz",    updateDate: "05.03.2026", totalAmount: 178300,  currency: "USD", domain_id: "payment",          transactions: [] },
  { id: 2465, name: "Hesap Ele Geçirme",                status: "Open",            severity: "critical", owner: "Ayşe Tan",    createUser: "Burak Şen",    createDate: "04.03.2026", updateUser: "Ayşe Tan",     updateDate: "05.03.2026", totalAmount: 520000,  currency: "TRY", domain_id: "account_takeover", transactions: [] },
  { id: 2464, name: "İç Fraud Şüphesi",                status: "Open",            severity: "high",     owner: null,          createUser: "Burak Şen",    createDate: "05.03.2026", updateUser: "Burak Şen",    updateDate: "05.03.2026", totalAmount: 65000,   currency: "TRY", domain_id: "internal",         transactions: [] },
  { id: 2463, name: "Sahte Kimlik Başvurusu",           status: "Open",            severity: "medium",   owner: "Elif Yılmaz", createUser: "Elif Yılmaz",  createDate: "04.03.2026", updateUser: "Elif Yılmaz",  updateDate: "05.03.2026", totalAmount: 31200,   currency: "TRY", domain_id: "application",      transactions: [] },
  { id: 2462, name: "Dijital Cüzdan Fraud",             status: "Open",            severity: "low",      owner: "Can Yıldız",  createUser: "Selin Aydın",  createDate: "03.03.2026", updateUser: "Can Yıldız",   updateDate: "04.03.2026", totalAmount: 8900,    currency: "TRY", domain_id: "payment",          transactions: [] },
  { id: 2461, name: "Dijital Cüzdan Kötüye Kullanım",  status: "Open",            severity: "medium",   owner: null,          createUser: "Can Yıldız",   createDate: "04.03.2026", updateUser: "Can Yıldız",   updateDate: "04.03.2026", totalAmount: 14500,   currency: "EUR", domain_id: "payment",          transactions: [] },
  { id: 2460, name: "POS Dolandırıcılığı",             status: "Closed",          severity: "high",     owner: "Mehmet Öz",   createUser: "Mehmet Öz",    createDate: "02.03.2026", updateUser: "Burak Şen",    updateDate: "04.03.2026", totalAmount: 198000,  currency: "TRY", domain_id: "credit_card",      transactions: [] },
  { id: 2459, name: "ATM Skimming",                    status: "Closed",          severity: "critical", owner: "Elif Yılmaz", createUser: "Elif Yılmaz",  createDate: "01.03.2026", updateUser: "Elif Yılmaz",  updateDate: "03.03.2026", totalAmount: 345600,  currency: "TRY", domain_id: "credit_card",      transactions: [] },
  { id: 2458, name: "Mobil Bankacılık Fraud",           status: "Open",            severity: "high",     owner: "Ayşe Tan",    createUser: "Burak Şen",    createDate: "01.03.2026", updateUser: "Ayşe Tan",     updateDate: "03.03.2026", totalAmount: 72400,   currency: "TRY", domain_id: "payment",          transactions: [] },
  { id: 2457, name: "Kredi Başvurusu Fraud",            status: "Open",            severity: "low",      owner: "Can Yıldız",  createUser: "Can Yıldız",   createDate: "28.02.2026", updateUser: "Can Yıldız",   updateDate: "02.03.2026", totalAmount: 250000,  currency: "TRY", domain_id: "application",      transactions: [] },
  { id: 2456, name: "Çek Dolandırıcılığı",             status: "Closed",          severity: "medium",   owner: "Elif Yılmaz", createUser: "Elif Yılmaz",  createDate: "27.02.2026", updateUser: "Burak Şen",    updateDate: "01.03.2026", totalAmount: 56700,   currency: "TRY", domain_id: "payment",          transactions: [] },
  { id: 2455, name: "Test Vakası",                      status: "Deleted",         severity: "low",      owner: "Can Yıldız",  createUser: "Can Yıldız",   createDate: "25.02.2026", updateUser: "Burak Şen",    updateDate: "28.02.2026", totalAmount: 0,       currency: "TRY", domain_id: "internal",         transactions: [] },
];

// Deterministic version so IDs don't change across re-renders
const FIXED_SEED = [
  { src: "payment_fraud",  sev: "Critical", et: "Customer",  day: "14", mon: "01", hour: "08", min: "22", cur: "TRY", amt: 284500, cn: "Ahmet Kara",    cno: "C487234", ms: "Marked" },
  { src: "cc_fraud",       sev: "Critical", et: "Card",      day: "02", mon: "02", hour: "13", min: "45", cur: "TRY", amt: 62200,  cn: "Fatma Demir",   cno: "C519832", ms: "Marked" },
  { src: "payment_fraud",  sev: "Critical", et: "Account",   day: "21", mon: "01", hour: "17", min: "01", cur: "USD", amt: 3800,   cn: "Murat Yılmaz",  cno: "C302011", ms: "Marked" },
  { src: "int_fraud",      sev: "Critical", et: "Device",    day: "08", mon: "01", hour: "22", min: "55", cur: "TRY", amt: 175000, cn: "Zehra Aksoy",   cno: "C411209", ms: "Marked" },
  { src: "cc_fraud",       sev: "Critical", et: "Card",      day: "17", mon: "02", hour: "09", min: "10", cur: "TRY", amt: 98400,  cn: "Emre Çelik",    cno: "C522301", ms: "Marked" },
  { src: "app_fraud",      sev: "Critical", et: "Customer",  day: "05", mon: "01", hour: "11", min: "33", cur: "EUR", amt: 9200,   cn: "Sude Öztürk",   cno: "C398820", ms: "Marked" },
  { src: "payment_fraud",  sev: "Critical", et: "Account",   day: "28", mon: "01", hour: "15", min: "48", cur: "TRY", amt: 221000, cn: "Ahmet Kara",    cno: "C487234", ms: "Marked" },
  { src: "cc_fraud",       sev: "Critical", et: "Card",      day: "11", mon: "02", hour: "07", min: "59", cur: "TRY", amt: 43750,  cn: "Fatma Demir",   cno: "C519832", ms: "Marked" },
  { src: "payment_fraud",  sev: "High",     et: "Customer",  day: "19", mon: "01", hour: "10", min: "17", cur: "TRY", amt: 157200, cn: "Murat Yılmaz",  cno: "C302011", ms: "Marked" },
  { src: "cc_fraud",       sev: "High",     et: "Account",   day: "03", mon: "02", hour: "16", min: "42", cur: "TRY", amt: 72400,  cn: "Zehra Aksoy",   cno: "C411209", ms: "Marked" },
  { src: "app_fraud",      sev: "High",     et: "Customer",  day: "25", mon: "01", hour: "12", min: "05", cur: "USD", amt: 5600,   cn: "Emre Çelik",    cno: "C522301", ms: "Marked" },
  { src: "int_fraud",      sev: "High",     et: "Device",    day: "14", mon: "02", hour: "19", min: "30", cur: "TRY", amt: 65000,  cn: "Sude Öztürk",   cno: "C398820", ms: "Marked" },
  { src: "payment_fraud",  sev: "High",     et: "Account",   day: "07", mon: "01", hour: "08", min: "55", cur: "TRY", amt: 92000,  cn: "Ahmet Kara",    cno: "C487234", ms: "Marked" },
  { src: "cc_fraud",       sev: "High",     et: "Card",      day: "22", mon: "01", hour: "14", min: "20", cur: "TRY", amt: 31200,  cn: "Fatma Demir",   cno: "C519832", ms: "Marked" },
  { src: "app_fraud",      sev: "High",     et: "Customer",  day: "10", mon: "02", hour: "09", min: "45", cur: "TRY", amt: 45000,  cn: "Murat Yılmaz",  cno: "C302011", ms: "Marked" },
  { src: "int_fraud",      sev: "High",     et: "Device",    day: "01", mon: "02", hour: "23", min: "11", cur: "EUR", amt: 7800,   cn: "Zehra Aksoy",   cno: "C411209", ms: "Marked" },
  { src: "payment_fraud",  sev: "High",     et: "Account",   day: "16", mon: "01", hour: "11", min: "28", cur: "TRY", amt: 178300, cn: "Emre Çelik",    cno: "C522301", ms: "Marked" },
  { src: "cc_fraud",       sev: "High",     et: "Card",      day: "27", mon: "01", hour: "16", min: "53", cur: "TRY", amt: 56700,  cn: "Sude Öztürk",   cno: "C398820", ms: "Marked" },
  { src: "payment_fraud",  sev: "Medium",   et: "Customer",  day: "04", mon: "01", hour: "10", min: "36", cur: "TRY", amt: 22000,  cn: "Ahmet Kara",    cno: "C487234", ms: "Marked" },
  { src: "app_fraud",      sev: "Medium",   et: "Customer",  day: "20", mon: "01", hour: "13", min: "02", cur: "TRY", amt: 15500,  cn: "Fatma Demir",   cno: "C519832", ms: "Marked" },
  { src: "cc_fraud",       sev: "Medium",   et: "Account",   day: "09", mon: "02", hour: "08", min: "19", cur: "TRY", amt: 8900,   cn: "Murat Yılmaz",  cno: "C302011", ms: "Marked" },
  { src: "payment_fraud",  sev: "Medium",   et: "Card",      day: "23", mon: "01", hour: "17", min: "44", cur: "USD", amt: 3200,   cn: "Zehra Aksoy",   cno: "C411209", ms: "Marked" },
  { src: "int_fraud",      sev: "Medium",   et: "Device",    day: "12", mon: "02", hour: "12", min: "08", cur: "TRY", amt: 5000,   cn: "Emre Çelik",    cno: "C522301", ms: "Marked" },
  { src: "app_fraud",      sev: "Medium",   et: "Customer",  day: "06", mon: "01", hour: "20", min: "57", cur: "TRY", amt: 1250,   cn: "Sude Öztürk",   cno: "C398820", ms: "Marked" },
  { src: "cc_fraud",       sev: "Medium",   et: "Card",      day: "18", mon: "01", hour: "07", min: "33", cur: "TRY", amt: 43200,  cn: "Ahmet Kara",    cno: "C487234", ms: "Marked" },
  { src: "payment_fraud",  sev: "Medium",   et: "Account",   day: "26", mon: "01", hour: "15", min: "16", cur: "TRY", amt: 9800,   cn: "Fatma Demir",   cno: "C519832", ms: "Marked" },
  { src: "int_fraud",      sev: "Medium",   et: "Device",    day: "13", mon: "02", hour: "11", min: "41", cur: "EUR", amt: 4500,   cn: "Murat Yılmaz",  cno: "C302011", ms: "Marked" },
  { src: "app_fraud",      sev: "Medium",   et: "Customer",  day: "02", mon: "01", hour: "18", min: "07", cur: "TRY", amt: 67500,  cn: "Zehra Aksoy",   cno: "C411209", ms: "Marked" },
  { src: "payment_fraud",  sev: "Low",      et: "Account",   day: "15", mon: "01", hour: "09", min: "25", cur: "TRY", amt: 2300,   cn: "Emre Çelik",    cno: "C522301", ms: "Unmarked" },
  { src: "cc_fraud",       sev: "Low",      et: "Card",      day: "24", mon: "01", hour: "14", min: "50", cur: "TRY", amt: 8400,   cn: "Sude Öztürk",   cno: "C398820", ms: "Unmarked" },
  { src: "app_fraud",      sev: "Low",      et: "Customer",  day: "11", mon: "01", hour: "21", min: "15", cur: "TRY", amt: 14000,  cn: "Ahmet Kara",    cno: "C487234", ms: "Marked" },
  { src: "int_fraud",      sev: "Low",      et: "Device",    day: "28", mon: "02", hour: "06", min: "40", cur: "USD", amt: 1100,   cn: "Fatma Demir",   cno: "C519832", ms: "Unmarked" },
  { src: "payment_fraud",  sev: "Low",      et: "Account",   day: "05", mon: "02", hour: "10", min: "03", cur: "TRY", amt: 5500,   cn: "Murat Yılmaz",  cno: "C302011", ms: "Marked" },
  { src: "cc_fraud",       sev: "High",     et: "Card",      day: "17", mon: "01", hour: "13", min: "28", cur: "TRY", amt: 345600, cn: "Zehra Aksoy",   cno: "C411209", ms: "Case Assigned", caseId: "#2459" },
  { src: "payment_fraud",  sev: "Critical", et: "Customer",  day: "09", mon: "01", hour: "19", min: "53", cur: "TRY", amt: 520000, cn: "Emre Çelik",    cno: "C522301", ms: "Case Assigned", caseId: "#2465" },
  { src: "app_fraud",      sev: "Medium",   et: "Customer",  day: "22", mon: "02", hour: "08", min: "18", cur: "TRY", amt: 31500,  cn: "Sude Öztürk",   cno: "C398820", ms: "Case Assigned", caseId: "#2463" },
  { src: "int_fraud",      sev: "High",     et: "Device",    day: "14", mon: "02", hour: "15", min: "43", cur: "EUR", amt: 8900,   cn: "Ahmet Kara",    cno: "C487234", ms: "Case Assigned", caseId: "#2464" },
  { src: "cc_fraud",       sev: "Critical", et: "Account",   day: "03", mon: "01", hour: "11", min: "08", cur: "TRY", amt: 198000, cn: "Fatma Demir",   cno: "C519832", ms: "Case Assigned", caseId: "#2460" },
  { src: "payment_fraud",  sev: "Low",      et: "Customer",  day: "26", mon: "02", hour: "16", min: "33", cur: "TRY", amt: 3700,   cn: "Murat Yılmaz",  cno: "C302011", ms: "Unmarked" },
  { src: "app_fraud",      sev: "Medium",   et: "Card",      day: "08", mon: "02", hour: "07", min: "58", cur: "TRY", amt: 250000, cn: "Zehra Aksoy",   cno: "C411209", ms: "Marked" },
  { src: "int_fraud",      sev: "Low",      et: "Device",    day: "20", mon: "01", hour: "12", min: "23", cur: "TRY", amt: 6600,   cn: "Emre Çelik",    cno: "C522301", ms: "Unmarked" },
  { src: "cc_fraud",       sev: "Medium",   et: "Card",      day: "01", mon: "03", hour: "09", min: "48", cur: "TRY", amt: 18200,  cn: "Sude Öztürk",   cno: "C398820", ms: "Marked" },
];

const SOURCE_LABELS = { payment_fraud: "Payment Fraud", cc_fraud: "Credit Card Fraud", app_fraud: "Application Fraud", int_fraud: "Internal Fraud" };
const SOURCE_COLORS = { payment_fraud: "#3B82F6", cc_fraud: "#8B5CF6", app_fraud: "#F59E0B", int_fraud: "#EF4444" };
const SEV_SCORE_RANGE = { Critical: [86, 99], High: [61, 85], Medium: [31, 60], Low: [10, 30] };

// Deterministic "random" score in range based on index
const scoreFor = (sev, idx) => {
  const [lo, hi] = SEV_SCORE_RANGE[sev];
  return lo + (idx * 7) % (hi - lo + 1);
};
const entityKeyFor = (et, idx) => {
  if (et === "Customer") return `C${100000 + idx * 1337 % 900000}`;
  if (et === "Account")  return `TR${1000000000 + idx * 99991 % 9000000000}`;
  if (et === "Card")     return `**** **** **** ${String(1000 + idx * 311 % 9000)}`;
  return `DEV-${String(10000 + idx * 277 % 90000)}`;
};

export const generateTransactions = () =>
  FIXED_SEED.map((s, i) => ({
    id: `TRX-${String(900100 + i)}`,
    source: s.src,
    sourceLabel: SOURCE_LABELS[s.src],
    sourceColor: SOURCE_COLORS[s.src],
    entityType: s.et,
    entityKey: entityKeyFor(s.et, i),
    severity: s.sev,
    score: scoreFor(s.sev, i),
    triggerRule: `RULE-${100 + (i * 37) % 500}`,
    markStatus: s.ms,
    createDate: `${s.day}.${s.mon}.2026 ${s.hour}:${s.min}`,
    caseId: s.caseId || null,
    amount: s.amt,
    currency: s.cur,
    customerName: s.cn,
    customerNo: s.cno,
  }));
