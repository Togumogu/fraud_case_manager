const { getFdmDb } = require('../connection');

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
  { src: "cc_fraud",       sev: "High",     et: "Card",      day: "17", mon: "01", hour: "13", min: "28", cur: "TRY", amt: 345600, cn: "Zehra Aksoy",   cno: "C411209", ms: "Case Assigned", caseId: "2459" },
  { src: "payment_fraud",  sev: "Critical", et: "Customer",  day: "09", mon: "01", hour: "19", min: "53", cur: "TRY", amt: 520000, cn: "Emre Çelik",    cno: "C522301", ms: "Case Assigned", caseId: "2465" },
  { src: "app_fraud",      sev: "Medium",   et: "Customer",  day: "22", mon: "02", hour: "08", min: "18", cur: "TRY", amt: 31500,  cn: "Sude Öztürk",   cno: "C398820", ms: "Case Assigned", caseId: "2463" },
  { src: "int_fraud",      sev: "High",     et: "Device",    day: "14", mon: "02", hour: "15", min: "43", cur: "EUR", amt: 8900,   cn: "Ahmet Kara",    cno: "C487234", ms: "Case Assigned", caseId: "2464" },
  { src: "cc_fraud",       sev: "Critical", et: "Account",   day: "03", mon: "01", hour: "11", min: "08", cur: "TRY", amt: 198000, cn: "Fatma Demir",   cno: "C519832", ms: "Case Assigned", caseId: "2460" },
  { src: "payment_fraud",  sev: "Low",      et: "Customer",  day: "26", mon: "02", hour: "16", min: "33", cur: "TRY", amt: 3700,   cn: "Murat Yılmaz",  cno: "C302011", ms: "Unmarked" },
  { src: "app_fraud",      sev: "Medium",   et: "Card",      day: "08", mon: "02", hour: "07", min: "58", cur: "TRY", amt: 250000, cn: "Zehra Aksoy",   cno: "C411209", ms: "Marked" },
  { src: "int_fraud",      sev: "Low",      et: "Device",    day: "20", mon: "01", hour: "12", min: "23", cur: "TRY", amt: 6600,   cn: "Emre Çelik",    cno: "C522301", ms: "Unmarked" },
  { src: "cc_fraud",       sev: "Medium",   et: "Card",      day: "01", mon: "03", hour: "09", min: "48", cur: "TRY", amt: 18200,  cn: "Sude Öztürk",   cno: "C398820", ms: "Marked" },
];

const SOURCE_LABELS = { payment_fraud: "Payment Fraud", cc_fraud: "Credit Card Fraud", app_fraud: "Application Fraud", int_fraud: "Internal Fraud" };
const SOURCE_COLORS = { payment_fraud: "#3B82F6", cc_fraud: "#8B5CF6", app_fraud: "#F59E0B", int_fraud: "#EF4444" };
const SEV_SCORE_RANGE = { Critical: [86, 99], High: [61, 85], Medium: [31, 60], Low: [10, 30] };

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

// Extra transactions to fill to 500 total
const EXTRA_SOURCES = ["payment_fraud", "cc_fraud", "app_fraud", "int_fraud", "ato_fraud"];
const EXTRA_SEVS = ["Critical", "Critical", "High", "High", "High", "Medium", "Medium", "Medium", "Medium", "Low"];
const EXTRA_MARK = ["Marked", "Marked", "Marked", "Marked", "Marked", "Marked", "Unmarked", "Unmarked", "Case Assigned", "Under Review"];
const EXTRA_ET = ["Customer", "Customer", "Customer", "Account", "Account", "Card", "Card", "Device"];
const EXTRA_NAMES = ["Ahmet Kara", "Fatma Demir", "Murat Yılmaz", "Zehra Aksoy", "Emre Çelik", "Sude Öztürk", "Leyla Şahin", "Kemal Aydın", "Berna Koç", "Tarık Yıldız"];
const EXTRA_CNOS = ["C487234", "C519832", "C302011", "C411209", "C522301", "C398820", "C601223", "C712341", "C823456", "C934567"];

function seedFdm() {
  const db = getFdmDb();

  // Domains
  const domains = [
    { id: "payment",         label: "Payment Fraud",       icon: "₺",  color: "#0891B2" },
    { id: "credit_card",     label: "Credit Card Fraud",   icon: "💳", color: "#8B5CF6" },
    { id: "application",     label: "Application Fraud",   icon: "📋", color: "#F59E0B" },
    { id: "account_takeover",label: "Account Takeover",    icon: "🔓", color: "#EF4444" },
    { id: "internal",        label: "Internal Fraud",      icon: "🏢", color: "#6366F1" },
  ];
  const insertDomain = db.prepare(`INSERT OR IGNORE INTO fdm_fraud_domains (id, label, icon, color) VALUES (?, ?, ?, ?)`);
  for (const d of domains) insertDomain.run(d.id, d.label, d.icon, d.color);

  // Rules
  const insertRule = db.prepare(`INSERT OR IGNORE INTO fdm_fraud_rules (id, domain_id, description) VALUES (?, ?, ?)`);
  const ruleDomains = ["payment", "credit_card", "application", "account_takeover", "internal"];
  for (let i = 100; i <= 600; i++) {
    const domId = ruleDomains[(i - 100) % 5];
    insertRule.run(`RULE-${i}`, domId, `Kural ${i}: otomatik fraud tespiti`);
  }

  // Transactions (first 44 from FIXED_SEED, then 456 generated)
  const insertTxn = db.prepare(`
    INSERT OR IGNORE INTO fdm_transactions
      (id, source, source_label, source_color, entity_type, entity_key, severity, score, trigger_rule, mark_status, create_date, case_id, amount, currency, customer_name, customer_no)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTxnBulk = db.transaction((rows) => {
    for (const r of rows) {
      insertTxn.run(
        r.id, r.source, r.source_label, r.source_color,
        r.entity_type, r.entity_key, r.severity, r.score,
        r.trigger_rule, r.mark_status, r.create_date,
        r.case_id, r.amount, r.currency, r.customer_name, r.customer_no
      );
    }
  });

  const rows = [];
  for (let i = 0; i < FIXED_SEED.length; i++) {
    const s = FIXED_SEED[i];
    rows.push({
      id: `TRX-${String(900100 + i)}`,
      source: s.src,
      source_label: SOURCE_LABELS[s.src],
      source_color: SOURCE_COLORS[s.src],
      entity_type: s.et,
      entity_key: entityKeyFor(s.et, i),
      severity: s.sev,
      score: scoreFor(s.sev, i),
      trigger_rule: `RULE-${100 + (i * 37) % 500}`,
      mark_status: s.ms,
      create_date: `${s.day}.${s.mon}.2026 ${s.hour}:${s.min}`,
      case_id: s.caseId || null,
      amount: s.amt,
      currency: s.cur,
      customer_name: s.cn,
      customer_no: s.cno,
    });
  }

  // Generate extra transactions 44 -> 499
  for (let i = FIXED_SEED.length; i < 500; i++) {
    const src = EXTRA_SOURCES[i % EXTRA_SOURCES.length];
    const sev = EXTRA_SEVS[i % EXTRA_SEVS.length];
    const ms = EXTRA_MARK[i % EXTRA_MARK.length];
    const et = EXTRA_ET[i % EXTRA_ET.length];
    const nameIdx = i % EXTRA_NAMES.length;
    // Date: spread over Oct 2025 - Mar 2026
    const dayOfYear = i % 170; // ~170 days
    const baseDate = new Date(2025, 9, 1); // Oct 1, 2025
    baseDate.setDate(baseDate.getDate() + dayOfYear);
    const dd = String(baseDate.getDate()).padStart(2, '0');
    const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
    const yy = baseDate.getFullYear();
    const hh = String(i % 24).padStart(2, '0');
    const mi = String((i * 7) % 60).padStart(2, '0');
    const currencies = ["TRY", "TRY", "TRY", "USD"];
    const amounts = [500, 1200, 3500, 8900, 15000, 42000, 98000, 175000, 280000, 650000];
    rows.push({
      id: `TRX-${String(900100 + i)}`,
      source: src,
      source_label: SOURCE_LABELS[src] || src,
      source_color: SOURCE_COLORS[src] || "#6B7280",
      entity_type: et,
      entity_key: entityKeyFor(et, i),
      severity: sev,
      score: scoreFor(sev, i),
      trigger_rule: `RULE-${100 + (i * 37) % 500}`,
      mark_status: ms === "Case Assigned" ? "Marked" : ms, // don't auto-assign extra ones
      create_date: `${dd}.${mm}.${yy} ${hh}:${mi}`,
      case_id: null,
      amount: amounts[i % amounts.length],
      currency: currencies[i % currencies.length],
      customer_name: EXTRA_NAMES[nameIdx],
      customer_no: EXTRA_CNOS[nameIdx],
    });
  }

  insertTxnBulk(rows);

  // Entities derived from transactions
  const insertEntity = db.prepare(`INSERT OR IGNORE INTO fdm_entities (entity_type, entity_key, customer_name, customer_no) VALUES (?, ?, ?, ?)`);
  const insertEntitiesBulk = db.transaction((rows) => {
    for (const r of rows) insertEntity.run(r.entity_type, r.entity_key, r.customer_name, r.customer_no);
  });
  insertEntitiesBulk(rows);

  db.close();
  console.log(`FDM seeded: ${rows.length} transactions`);
}

module.exports = { seedFdm };
