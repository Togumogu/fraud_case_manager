const { initScmSchema, getDb } = require('../connection');

const USERS_DATA = [
  { id: 1,  name: "Elif Yılmaz",  role: "analyst",  role_label: "Fraud Analist",  email: "elif@bank.com",    domain_id: "payment" },
  { id: 2,  name: "Burak Şen",    role: "manager",  role_label: "Yönetici",       email: "burak@bank.com",   domain_id: "payment" },
  { id: 3,  name: "Zeynep Demir", role: "admin",    role_label: "Admin",          email: "zeynep@bank.com",  domain_id: "payment" },
  { id: 4,  name: "Mehmet Öz",    role: "analyst",  role_label: "Fraud Analist",  email: "mehmet@bank.com",  domain_id: "payment" },
  { id: 5,  name: "Ayşe Tan",     role: "analyst",  role_label: "Fraud Analist",  email: "ayse@bank.com",    domain_id: "credit_card" },
  { id: 6,  name: "Can Yıldız",   role: "analyst",  role_label: "Fraud Analist",  email: "can@bank.com",     domain_id: "application" },
  { id: 7,  name: "Selin Aydın",  role: "reviewer", role_label: "İnceleyici",     email: "selin@bank.com",   domain_id: "payment" },
  { id: 8,  name: "Ali Vural",    role: "analyst",  role_label: "Fraud Analist",  email: "ali@bank.com",     domain_id: "internal" },
  { id: 9,  name: "Zehra Koç",    role: "analyst",  role_label: "Fraud Analist",  email: "zehra@bank.com",   domain_id: "account_takeover" },
  { id: 10, name: "Murat Demir",  role: "manager",  role_label: "Yönetici",       email: "murat@bank.com",   domain_id: "credit_card" },
];

// Cases matching existing mock: IDs 2455-2471
const MOCK_CASES = [
  { id: 2471, name: "Şüpheli EFT Transferi",          status: "Open",            severity: "critical", owner: null,          create_user: "Elif Yılmaz",  create_date: "06.03.2026", update_user: "Elif Yılmaz",  update_date: "06.03.2026", total_amount: 284500,  currency: "TRY", domain_id: "payment" },
  { id: 2470, name: "Çoklu Kanal Fraud",               status: "Open",            severity: "high",     owner: "Mehmet Öz",   create_user: "Burak Şen",    create_date: "06.03.2026", update_user: "Mehmet Öz",    update_date: "06.03.2026", total_amount: 157200,  currency: "TRY", domain_id: "credit_card" },
  { id: 2469, name: "Sahte Belge Dolandırıcılığı",     status: "Pending Closure", severity: "high",     owner: "Elif Yılmaz", create_user: "Elif Yılmaz",  create_date: "05.03.2026", update_user: "Elif Yılmaz",  update_date: "06.03.2026", total_amount: 92000,   currency: "TRY", domain_id: "payment" },
  { id: 2468, name: "Kart Dolandırıcılığı",            status: "Closed",          severity: "medium",   owner: "Ayşe Tan",    create_user: "Ayşe Tan",     create_date: "05.03.2026", update_user: "Burak Şen",    update_date: "06.03.2026", total_amount: 43750,   currency: "TRY", domain_id: "credit_card" },
  { id: 2467, name: "Başvuru Sahteciliği",             status: "Open",            severity: "medium",   owner: null,          create_user: "Can Yıldız",   create_date: "05.03.2026", update_user: "Can Yıldız",   update_date: "05.03.2026", total_amount: 0,       currency: "TRY", domain_id: "application" },
  { id: 2466, name: "Online Bankacılık Fraud",         status: "Pending Closure", severity: "medium",   owner: "Mehmet Öz",   create_user: "Mehmet Öz",    create_date: "04.03.2026", update_user: "Mehmet Öz",    update_date: "05.03.2026", total_amount: 178300,  currency: "TRY", domain_id: "payment" },
  { id: 2465, name: "Hesap Ele Geçirme",               status: "Open",            severity: "critical", owner: "Ayşe Tan",    create_user: "Burak Şen",    create_date: "04.03.2026", update_user: "Ayşe Tan",     update_date: "05.03.2026", total_amount: 520000,  currency: "TRY", domain_id: "account_takeover" },
  { id: 2464, name: "İç Fraud Şüphesi",               status: "Open",            severity: "high",     owner: null,          create_user: "Burak Şen",    create_date: "05.03.2026", update_user: "Burak Şen",    update_date: "05.03.2026", total_amount: 65000,   currency: "TRY", domain_id: "internal" },
  { id: 2463, name: "Sahte Kimlik Başvurusu",          status: "Open",            severity: "medium",   owner: "Elif Yılmaz", create_user: "Elif Yılmaz",  create_date: "04.03.2026", update_user: "Elif Yılmaz",  update_date: "05.03.2026", total_amount: 31200,   currency: "TRY", domain_id: "application" },
  { id: 2462, name: "Dijital Cüzdan Fraud",            status: "Open",            severity: "low",      owner: "Can Yıldız",  create_user: "Selin Aydın",  create_date: "03.03.2026", update_user: "Can Yıldız",   update_date: "04.03.2026", total_amount: 8900,    currency: "TRY", domain_id: "payment" },
  { id: 2461, name: "Dijital Cüzdan Kötüye Kullanım", status: "Open",            severity: "medium",   owner: null,          create_user: "Can Yıldız",   create_date: "04.03.2026", update_user: "Can Yıldız",   update_date: "04.03.2026", total_amount: 14500,   currency: "TRY", domain_id: "payment" },
  { id: 2460, name: "POS Dolandırıcılığı",            status: "Closed",          severity: "high",     owner: "Mehmet Öz",   create_user: "Mehmet Öz",    create_date: "02.03.2026", update_user: "Burak Şen",    update_date: "04.03.2026", total_amount: 198000,  currency: "TRY", domain_id: "payment" },
  { id: 2459, name: "ATM Skimming",                   status: "Closed",          severity: "critical", owner: "Elif Yılmaz", create_user: "Elif Yılmaz",  create_date: "01.03.2026", update_user: "Elif Yılmaz",  update_date: "03.03.2026", total_amount: 345600,  currency: "TRY", domain_id: "credit_card" },
  { id: 2458, name: "Mobil Bankacılık Fraud",          status: "Open",            severity: "high",     owner: "Ayşe Tan",    create_user: "Burak Şen",    create_date: "01.03.2026", update_user: "Ayşe Tan",     update_date: "03.03.2026", total_amount: 72400,   currency: "TRY", domain_id: "payment" },
  { id: 2457, name: "Kredi Başvurusu Fraud",           status: "Open",            severity: "low",      owner: "Can Yıldız",  create_user: "Can Yıldız",   create_date: "28.02.2026", update_user: "Can Yıldız",   update_date: "02.03.2026", total_amount: 250000,  currency: "TRY", domain_id: "application" },
  { id: 2456, name: "Çek Dolandırıcılığı",            status: "Closed",          severity: "medium",   owner: "Elif Yılmaz", create_user: "Elif Yılmaz",  create_date: "27.02.2026", update_user: "Burak Şen",    update_date: "01.03.2026", total_amount: 56700,   currency: "TRY", domain_id: "payment" },
  { id: 2455, name: "Test Vakası",                     status: "Deleted",         severity: "low",      owner: "Can Yıldız",  create_user: "Can Yıldız",   create_date: "25.02.2026", update_user: "Burak Şen",    update_date: "28.02.2026", total_amount: 0,       currency: "TRY", domain_id: "payment" },
];

// Historical cases IDs 2420-2454
const HISTORICAL_NAMES = [
  "Sahte Çek İşlemi", "Kimlik Hırsızlığı", "Sahte Kredi Başvurusu", "ATM Dolandırıcılığı",
  "Online Ödeme Fraud", "Sahte Banka Havalesi", "Phishing Saldırısı", "Hesap Dolandırıcılığı",
  "İzinsiz Kart Kullanımı", "Sahte Fatura Ödemesi", "Hesap Ele Geçirme", "SIM Kart Dolandırıcılığı",
  "E-Ticaret Fraud", "Banka Kartı Klonlama", "Sahte Transfer Emri", "İç Sisteme İzinsiz Erişim",
  "Sahte Personel Başvurusu", "Müşteri Hesabı Suistimali", "ATM Skimming Girişimi", "Dijital Cüzdan İhlali",
  "QR Kod Dolandırıcılığı", "Sahte IBAN Transferi", "POS Terminal Fraud", "Kara Para Aklama Şüphesi",
  "Sahte Belge ile Kredi", "Sahte İmza Tespiti", "Yetkisiz Para Transferi", "Sahte Müşteri Kaydı",
  "Hesap Dondurma Talebi", "Kart Şifresi Çalma", "İnternetten Sahte Alışveriş", "Sahte SWIFT Mesajı",
  "BEC Dolandırıcılığı", "Sahte Çek Tahsilatı", "Kurumsal Hesap İhlali",
];
const HIST_STATUSES = ["Open", "Closed", "Closed", "Open", "Pending Closure"];
const HIST_SEVS = ["critical", "high", "medium", "low"];
const HIST_OWNERS = ["Elif Yılmaz", "Mehmet Öz", "Ayşe Tan", "Can Yıldız", "Ali Vural", null];
const HIST_CREATORS = ["Elif Yılmaz", "Burak Şen", "Mehmet Öz", "Can Yıldız", "Ayşe Tan"];
const HIST_DOMAINS = ["payment", "credit_card", "application", "account_takeover", "internal"];

function seedScm() {
  initScmSchema();
  const db = getDb();

  // Users
  const insertUser = db.prepare(`INSERT OR IGNORE INTO users (id, name, role, role_label, email, domain_id) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const u of USERS_DATA) insertUser.run(u.id, u.name, u.role, u.role_label, u.email, u.domain_id);

  // Cases
  const insertCase = db.prepare(`
    INSERT OR IGNORE INTO cases (id, name, status, severity, owner, create_user, create_date, update_user, update_date, total_amount, currency, domain_id, is_deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Insert mock cases
  for (const c of MOCK_CASES) {
    insertCase.run(
      c.id, c.name, c.status === "Deleted" ? "Open" : c.status,
      c.severity, c.owner, c.create_user, c.create_date,
      c.update_user, c.update_date, c.total_amount, c.currency,
      c.domain_id, c.status === "Deleted" ? 1 : 0
    );
  }

  // Historical cases
  for (let i = 0; i < 35; i++) {
    const caseId = 2420 + i;
    const status = HIST_STATUSES[i % HIST_STATUSES.length];
    const daysAgo = 30 + i * 2;
    const base = new Date('2026-03-19');
    base.setDate(base.getDate() - daysAgo);
    const dd = String(base.getDate()).padStart(2, '0');
    const mm = String(base.getMonth() + 1).padStart(2, '0');
    const yyyy = base.getFullYear();
    const dateStr = `${dd}.${mm}.${yyyy}`;

    insertCase.run(
      caseId,
      HISTORICAL_NAMES[i % HISTORICAL_NAMES.length],
      status,
      HIST_SEVS[i % HIST_SEVS.length],
      HIST_OWNERS[i % HIST_OWNERS.length],
      HIST_CREATORS[i % HIST_CREATORS.length],
      dateStr,
      HIST_CREATORS[(i + 1) % HIST_CREATORS.length],
      dateStr,
      Math.floor(1000 + (i * 12345) % 500000),
      "TRY",
      HIST_DOMAINS[i % HIST_DOMAINS.length],
      0
    );
  }

  // Case transactions (link to FDM IDs)
  const insertCaseTxn = db.prepare(`INSERT OR IGNORE INTO case_transactions (case_id, fdm_txn_id, linked_by) VALUES (?, ?, ?)`);
  // Specific linkages matching mock data
  const txnLinks = [
    { case_id: 2459, txn_id: "TRX-900133" }, // Case Assigned in seed
    { case_id: 2465, txn_id: "TRX-900134" },
    { case_id: 2463, txn_id: "TRX-900135" },
    { case_id: 2464, txn_id: "TRX-900136" },
    { case_id: 2460, txn_id: "TRX-900137" },
  ];
  for (const l of txnLinks) insertCaseTxn.run(l.case_id, l.txn_id, "system");

  // Add 2-4 more txns per mock case
  const allTxnIds = [];
  for (let i = 0; i < 44; i++) allTxnIds.push(`TRX-${String(900100 + i)}`);
  let txnIdx = 0;
  for (const c of MOCK_CASES) {
    const alreadyLinked = new Set(txnLinks.filter(l => l.case_id === c.id).map(l => l.txn_id));
    const count = 2 + (c.id % 3);
    for (let j = 0; j < count; j++) {
      const txnId = allTxnIds[txnIdx % allTxnIds.length];
      txnIdx++;
      if (!alreadyLinked.has(txnId)) {
        try { insertCaseTxn.run(c.id, txnId, c.create_user); } catch (_) {}
        alreadyLinked.add(txnId);
      }
    }
  }

  // Comments
  const insertComment = db.prepare(`INSERT INTO case_comments (case_id, user_name, content, created_at) VALUES (?, ?, ?, ?)`);
  const COMMENTS = [
    "İlk inceleme tamamlandı. Müşteri bilgileri doğrulanıyor.",
    "Şüpheli işlem örüntüsü tespit edildi. Ek belgeler istendi.",
    "Müşteri ifadesi alındı. Soruşturma devam ediyor.",
    "FDM verileri analiz edildi. Yüksek fraud skoru doğrulandı.",
    "İlgili birimlerle koordinasyon sağlandı.",
    "Belge incelemesi tamamlandı. Karar aşamasına geçildi.",
    "Dış kaynaklardan bilgi talep edildi.",
    "Teknik analiz raporu hazırlandı.",
  ];
  for (const c of MOCK_CASES) {
    const count = 3 + (c.id % 4);
    for (let j = 0; j < count; j++) {
      const user = HIST_CREATORS[j % HIST_CREATORS.length];
      const daysAgo = j + 1;
      const d = new Date('2026-03-19');
      d.setDate(d.getDate() - daysAgo);
      insertComment.run(c.id, user, COMMENTS[j % COMMENTS.length], d.toISOString());
    }
  }

  // History
  const insertHistory = db.prepare(`INSERT INTO case_history (case_id, user_name, action, action_type, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)`);
  const ACTION_TYPES = ["create", "comment", "assign", "upload", "close", "review"];
  const ACTION_LABELS = ["Vaka oluşturuldu", "Yorum eklendi", "Vaka atandı", "Dosya yüklendi", "Vaka kapatıldı", "İnceleme tamamlandı"];
  for (const c of MOCK_CASES) {
    // Creation entry
    const created = new Date('2026-03-19');
    created.setDate(created.getDate() - 10);
    insertHistory.run(c.id, c.create_user, "Vaka oluşturuldu", "create", `Vaka #${c.id} oluşturuldu`, created.toISOString());
    // 2-4 more entries
    const count = 2 + (c.id % 3);
    for (let j = 0; j < count; j++) {
      const d = new Date('2026-03-19');
      d.setDate(d.getDate() - (9 - j));
      const aIdx = (j + 1) % ACTION_TYPES.length;
      insertHistory.run(c.id, HIST_CREATORS[j % HIST_CREATORS.length], ACTION_LABELS[aIdx], ACTION_TYPES[aIdx], null, d.toISOString());
    }
  }

  // Reviews
  const insertReview = db.prepare(`
    INSERT INTO case_reviews (case_id, reviewer_name, reviewer_email, review_type, status, comment, request_note, requested_by, requested_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const REVIEWERS = ["Selin Aydın", "Ali Vural", "Zehra Koç"];
  const REVIEW_NOTES = ["Lütfen müşteri profilindeki tutarsızlıkları değerlendiriniz.", "ATM kamera görüntülerini inceleyip değerlendirmenizi rica ederim.", "İşlem kalıplarını kontrol ediniz."];
  for (const c of MOCK_CASES) {
    const count = 1 + (c.id % 2);
    for (let j = 0; j < count; j++) {
      const reviewer = REVIEWERS[j % REVIEWERS.length];
      const status = j === 0 ? "pending" : "completed";
      const d = new Date('2026-03-19');
      d.setDate(d.getDate() - j - 1);
      insertReview.run(c.id, reviewer, `${reviewer.toLowerCase().replace(' ', '.')}@bank.com`, "internal", status,
        status === "completed" ? "İnceleme tamamlandı. Bulgular not edildi." : null,
        REVIEW_NOTES[j % REVIEW_NOTES.length],
        c.create_user, d.toISOString()
      );
    }
  }

  // Approval requests
  const insertApproval = db.prepare(`
    INSERT INTO approval_requests (type, case_id, case_name, requested_by, requested_at, reason, status, severity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertApproval.run("case_close", 2469, "Sahte Belge Dolandırıcılığı", "Elif Yılmaz", "2026-03-05T14:22:00.000Z", "Soruşturma Tamamlandı", "pending", "high");
  insertApproval.run("case_close", 2466, "Online Bankacılık Fraud", "Mehmet Öz", "2026-03-05T11:05:00.000Z", "Çözüme Kavuşturuldu", "pending", "medium");
  insertApproval.run("case_delete", 2455, "Test Vakası", "Can Yıldız", "2026-03-04T16:30:00.000Z", "Mükerrer", "pending", "low");

  // Domain settings
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO domain_settings (domain_id, maker_checker_enabled, notification_enabled, default_currency, close_reasons, reviewer_link_expiry_hours, reviewer_inactivity_timeout_min, reviewer_otp_enabled, case_delete_enabled, reopen_enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const DOMAIN_SETTINGS = {
    payment:         { mc: 1, notif: 1, cur: "original", reasons: '["Soruşturma Tamamlandı","Çözüme Kavuşturuldu","Mükerrer","Yanlış Alarm","Kara Listeye Alındı"]', expiry: 72, timeout: 30, otp: 1, del: 1, reopen: 1 },
    credit_card:     { mc: 1, notif: 0, cur: "TRY",      reasons: '["Soruşturma Tamamlandı","Çözüme Kavuşturuldu","Mükerrer"]', expiry: 72, timeout: 30, otp: 1, del: 1, reopen: 1 },
    application:     { mc: 0, notif: 0, cur: "original", reasons: '["Soruşturma Tamamlandı","Çözüme Kavuşturuldu","Mükerrer","Başvuru Reddedildi"]', expiry: 48, timeout: 20, otp: 1, del: 1, reopen: 1 },
    account_takeover:{ mc: 1, notif: 1, cur: "TRY",      reasons: '["Soruşturma Tamamlandı","Çözüme Kavuşturuldu","Mükerrer","Hesap Kurtarıldı"]', expiry: 72, timeout: 30, otp: 1, del: 1, reopen: 1 },
    internal:        { mc: 1, notif: 0, cur: "TRY",      reasons: '["Soruşturma Tamamlandı","Çözüme Kavuşturuldu","Mükerrer","Disiplin Sürecine Alındı"]', expiry: 96, timeout: 15, otp: 1, del: 1, reopen: 1 },
  };
  for (const [domId, s] of Object.entries(DOMAIN_SETTINGS)) {
    insertSetting.run(domId, s.mc, s.notif, s.cur, s.reasons, s.expiry, s.timeout, s.otp, s.del, s.reopen);
  }

  // Domains list
  const insertDomain = db.prepare(`
    INSERT OR IGNORE INTO domains (id, label, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)
  `);
  insertDomain.run('payment',          'Payment Fraud',       '₺',  '#0891B2', 0);
  insertDomain.run('credit_card',      'Credit Card Fraud',   '💳', '#8B5CF6', 1);
  insertDomain.run('application',      'Application Fraud',   '📋', '#F59E0B', 2);
  insertDomain.run('account_takeover', 'Account Takeover',    '🔓', '#EF4444', 3);
  insertDomain.run('internal',         'Internal Fraud',      '🏢', '#6366F1', 4);

  // Settings audit log
  const insertAudit = db.prepare(`
    INSERT INTO settings_audit_log (user_name, domain, setting, old_value, new_value, timestamp) VALUES (?, ?, ?, ?, ?, ?)
  `);
  const auditEntries = [
    ["Zeynep Demir", "Payment Fraud", "maker_checker_enabled", "false", "true", "2026-03-14T09:20:00.000Z"],
    ["Zeynep Demir", "Payment Fraud", "notification_enabled", "false", "true", "2026-03-14T09:18:00.000Z"],
    ["Zeynep Demir", "Account Takeover", "notification_enabled", "false", "true", "2026-03-12T16:42:00.000Z"],
    ["Zeynep Demir", "Credit Card Fraud", "default_currency", "original", "TRY", "2026-03-11T14:05:00.000Z"],
    ["Zeynep Demir", "Application Fraud", "maker_checker_enabled", "true", "false", "2026-03-10T11:30:00.000Z"],
  ];
  for (const e of auditEntries) insertAudit.run(...e);

  console.log('SCM seeded: users, cases, comments, history, reviews, approvals, settings');
}

module.exports = { seedScm };
