import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import { reviews as reviewsApi, cases as casesApi, comments as commentsApi, transactions as txnsApi, history as historyApi, attachments as attachmentsApi, relations as relationsApi } from "../api/client";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", email: "elif@bank.com" },
  manager: { id: 2, name: "Burak Şen", role: "manager", email: "burak@bank.com" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", email: "zeynep@bank.com" },
  super: { id: 4, name: "Toygun Baysal", role: "super", email: "toygun@bank.com" },
};

const FRAUD_DOMAINS = [
  { id: "payment", label: "Payment Fraud", icon: "₺", color: "#0891B2" },
  { id: "credit_card", label: "Credit Card Fraud", icon: "💳", color: "#8B5CF6" },
  { id: "application", label: "Application Fraud", icon: "📋", color: "#F59E0B" },
  { id: "account_takeover", label: "Account Takeover", icon: "🔓", color: "#EF4444" },
  { id: "internal", label: "Internal Fraud", icon: "🏢", color: "#6366F1" },
];

const PENDING_REVIEWS = [
  { id: 1, caseId: "#2470", caseName: "Çoklu Kanal Fraud", sender: "Burak Şen", sentDate: "07.03.2026 09:00", note: "Lütfen müşteri profilindeki tutarsızlıkları değerlendiriniz.", status: "pending", domain: "Credit Card Fraud", severity: "high" },
  { id: 2, caseId: "#2465", caseName: "Hesap Ele Geçirme", sender: "Elif Yılmaz", sentDate: "06.03.2026 14:30", note: "ATM kamera görüntülerini inceleyip değerlendirmenizi rica ederim.", status: "pending", domain: "Account Takeover", severity: "critical" },
  { id: 3, caseId: "#2459", caseName: "ATM Skimming Şüphesi", sender: "Burak Şen", sentDate: "05.03.2026 16:00", note: "İşlem desenleri ve müşteri harcama profilini karşılaştırınız.", status: "pending", domain: "Payment Fraud", severity: "medium" },
];

const COMPLETED_REVIEWS = [
  { id: 4, caseId: "#2455", caseName: "Online Bankacılık Fraud", sender: "Can Yıldız", sentDate: "04.03.2026 11:00", completedDate: "04.03.2026 15:30", note: "IP adreslerini ve cihaz parmak izlerini kontrol ediniz.", status: "completed", domain: "Account Takeover", severity: "high", responseComment: "IP adresleri farklı ülkelerden gelmiş. Cihaz parmak izi eşleşmiyor. Fraud olarak değerlendirdim." },
  { id: 5, caseId: "#2448", caseName: "Sahte Kimlik Başvurusu", sender: "Elif Yılmaz", sentDate: "03.03.2026 09:15", completedDate: "03.03.2026 14:00", note: "Belgelerin otantikliğini doğrulayınız.", status: "completed", domain: "Application Fraud", severity: "medium", responseComment: "Kimlik belgesinde hologram eksikliği tespit edildi. Sahte olma ihtimali yüksek." },
];

// Case detail data per review case — keyed by caseId
const REVIEW_CASE_DATA_MAP = {
  "#2470": {
    caseId: "#2470",
    caseName: "Çoklu Kanal Fraud",
    domain: "Credit Card Fraud",
    status: "Open",
    severity: "high",
    createdDate: "05.03.2026",
    assignee: "Burak Şen",
    totalAmount: 187500.00,
    currency: "TRY",
    bankShare: 125000.00,
    customerShare: 62500.00,
    entities: {
      customers: [
        { id: "CUS-001234", name: "Ahmet Kara", phone: "+90 532 XXX XX 45", email: "a***@email.com" },
        { id: "CUS-005678", name: "Fatma Kara", phone: "+90 505 XXX XX 12", email: "f***@email.com" },
      ],
      debitCards: [
        { cardNo: "**** **** **** 4523", cardType: "Visa", expiry: "09/2028", status: "Aktif" },
        { cardNo: "**** **** **** 7891", cardType: "MasterCard", expiry: "03/2027", status: "Bloke" },
      ],
      creditCards: [
        { cardNo: "**** **** **** 1234", cardType: "Visa", expiry: "12/2027", status: "Aktif" },
        { cardNo: "**** **** **** 5678", cardType: "MasterCard", expiry: "06/2026", status: "Bloke" },
      ],
    },
    transactions: [
      { id: "TXN-001", date: "05.03.2026 14:22", type: "EFT", amount: 75000, currency: "TRY", channel: "Internet", status: "Şüpheli", score: 92 },
      { id: "TXN-002", date: "05.03.2026 14:25", type: "Havale", amount: 50000, currency: "TRY", channel: "Mobil", status: "Şüpheli", score: 88 },
      { id: "TXN-003", date: "05.03.2026 14:30", type: "POS", amount: 42500, currency: "TRY", channel: "Fiziksel", status: "Şüpheli", score: 78 },
      { id: "TXN-004", date: "05.03.2026 15:10", type: "ATM", amount: 20000, currency: "TRY", channel: "ATM", status: "Şüpheli", score: 85 },
    ],
    comments: [
      { id: 1, user: "Burak Şen", date: "05.03.2026 15:00", text: "Vaka oluşturuldu. Çoklu kanaldan şüpheli işlemler tespit edildi.", fromReview: false },
      { id: 2, user: "Burak Şen", date: "06.03.2026 09:30", text: "Müşteri ile iletişime geçildi. Hesap geçici olarak donduruldu.", fromReview: false },
      { id: 3, user: "Burak Şen", date: "07.03.2026 10:00", text: "ATM kamera görüntüleri talep edildi.", fromReview: false },
    ],
    attachments: [
      { id: 1, name: "ATM_Kamera_Goruntuleri.pdf", size: "4.2 MB", uploader: "Burak Şen", date: "06.03.2026 15:35" },
      { id: 2, name: "Musteri_Beyan_Formu.docx", size: "1.1 MB", uploader: "Burak Şen", date: "06.03.2026 16:10" },
    ],
    relatedCases: [
      { id: "#2465", name: "Hesap Ele Geçirme", relation: "Kardeş Vaka", status: "Open", severity: "critical", domain: "Account Takeover", assignee: "Elif Yılmaz", createdDate: "04.03.2026", totalAmount: 95000, currency: "TRY", bankShare: 65000, customerShare: 30000,
        entities: {
          customers: [{ id: "CUS-001234", name: "Ahmet Kara", phone: "+90 532 XXX XX 45", email: "a***@email.com" }],
          debitCards: [{ cardNo: "**** **** **** 4523", cardType: "Visa", expiry: "09/2028", status: "Aktif" }],
          creditCards: [],
        },
        transactions: [
          { id: "TXN-101", date: "04.03.2026 09:15", type: "EFT", amount: 55000, currency: "TRY", channel: "Internet", status: "Şüpheli", score: 95 },
          { id: "TXN-102", date: "04.03.2026 09:22", type: "Havale", amount: 40000, currency: "TRY", channel: "Mobil", status: "Şüpheli", score: 91 },
        ],
        comments: [
          { id: 1, user: "Elif Yılmaz", date: "04.03.2026 10:00", text: "Hesap ele geçirme şüphesi. IP adresi yurt dışından.", fromReview: false },
        ],
        history: [
          { id: 1, action: "Vaka oluşturuldu", user: "Elif Yılmaz", date: "04.03.2026 09:45", detail: "2 işlem ile vaka oluşturuldu." },
        ],
      },
      { id: "#2458", name: "Sahte Kart Kullanımı", relation: "Üst-Alt Vaka", status: "Closed", severity: "medium", domain: "Credit Card Fraud", assignee: "Can Yıldız", createdDate: "02.03.2026", totalAmount: 32000, currency: "TRY", bankShare: 32000, customerShare: 0,
        entities: {
          customers: [{ id: "CUS-001234", name: "Ahmet Kara", phone: "+90 532 XXX XX 45", email: "a***@email.com" }],
          debitCards: [],
          creditCards: [{ cardNo: "**** **** **** 3456", cardType: "MasterCard", expiry: "01/2025", status: "Bloke" }],
        },
        transactions: [
          { id: "TXN-201", date: "02.03.2026 18:05", type: "POS", amount: 18000, currency: "TRY", channel: "Fiziksel", status: "Fraud", score: 96 },
          { id: "TXN-202", date: "02.03.2026 18:12", type: "POS", amount: 14000, currency: "TRY", channel: "Fiziksel", status: "Fraud", score: 94 },
        ],
        comments: [
          { id: 1, user: "Can Yıldız", date: "02.03.2026 19:00", text: "Sahte kart kullanımı doğrulandı. Kart iptal edildi.", fromReview: false },
        ],
        history: [
          { id: 1, action: "Vaka oluşturuldu", user: "Can Yıldız", date: "02.03.2026 18:30", detail: "2 işlem ile vaka oluşturuldu." },
          { id: 2, action: "Vaka kapatıldı", user: "Can Yıldız", date: "03.03.2026 14:00", detail: "Fraud onaylandı, kart iptal edildi." },
        ],
      },
    ],
    history: [
      { id: 1, action: "Vaka oluşturuldu", user: "Burak Şen", date: "05.03.2026 15:00", detail: "4 işlem ile vaka oluşturuldu." },
      { id: 2, action: "Yorum eklendi", user: "Burak Şen", date: "06.03.2026 09:30", detail: "Müşteri ile iletişim notu." },
      { id: 3, action: "Dosya yüklendi", user: "Burak Şen", date: "06.03.2026 15:35", detail: "ATM_Kamera_Goruntuleri.pdf yüklendi." },
      { id: 4, action: "İnceleme talep edildi", user: "Burak Şen", date: "07.03.2026 09:00", detail: "Mehmet Öz'e inceleme gönderildi." },
    ],
  },
  "#2465": {
    caseId: "#2465",
    caseName: "Hesap Ele Geçirme",
    domain: "Account Takeover",
    status: "Open",
    severity: "critical",
    createdDate: "04.03.2026",
    assignee: "Elif Yılmaz",
    totalAmount: 95000.00,
    currency: "TRY",
    bankShare: 65000.00,
    customerShare: 30000.00,
    entities: {
      customers: [
        { id: "CUS-001234", name: "Ahmet Kara", phone: "+90 532 XXX XX 45", email: "a***@email.com" },
      ],
      debitCards: [
        { cardNo: "**** **** **** 4523", cardType: "Visa", expiry: "09/2028", status: "Aktif" },
      ],
      creditCards: [],
    },
    transactions: [
      { id: "TXN-101", date: "04.03.2026 09:15", type: "EFT", amount: 55000, currency: "TRY", channel: "Internet", status: "Şüpheli", score: 95 },
      { id: "TXN-102", date: "04.03.2026 09:22", type: "Havale", amount: 40000, currency: "TRY", channel: "Mobil", status: "Şüpheli", score: 91 },
    ],
    comments: [
      { id: 1, user: "Elif Yılmaz", date: "04.03.2026 10:00", text: "Hesap ele geçirme şüphesi. IP adresi yurt dışından.", fromReview: false },
      { id: 2, user: "Elif Yılmaz", date: "04.03.2026 14:30", text: "Müşteri doğrulaması yapıldı, yetkisiz erişim teyit edildi.", fromReview: false },
    ],
    attachments: [
      { id: 1, name: "IP_Analiz_Raporu.pdf", size: "1.8 MB", uploader: "Elif Yılmaz", date: "04.03.2026 11:20" },
    ],
    relatedCases: [
      { id: "#2470", name: "Çoklu Kanal Fraud", relation: "Kardeş Vaka", status: "Open", severity: "high", domain: "Credit Card Fraud", assignee: "Burak Şen", createdDate: "05.03.2026", totalAmount: 187500, currency: "TRY", bankShare: 125000, customerShare: 62500,
        entities: { customers: [{ id: "CUS-001234", name: "Ahmet Kara", phone: "+90 532 XXX XX 45", email: "a***@email.com" }], debitCards: [], creditCards: [] },
        transactions: [{ id: "TXN-001", date: "05.03.2026 14:22", type: "EFT", amount: 75000, currency: "TRY", channel: "Internet", status: "Şüpheli", score: 92 }],
        comments: [{ id: 1, user: "Burak Şen", date: "05.03.2026 15:00", text: "Çoklu kanaldan şüpheli işlemler.", fromReview: false }],
        history: [{ id: 1, action: "Vaka oluşturuldu", user: "Burak Şen", date: "05.03.2026 15:00", detail: "4 işlem ile vaka oluşturuldu." }],
      },
    ],
    history: [
      { id: 1, action: "Vaka oluşturuldu", user: "Elif Yılmaz", date: "04.03.2026 09:45", detail: "2 işlem ile vaka oluşturuldu." },
      { id: 2, action: "Yorum eklendi", user: "Elif Yılmaz", date: "04.03.2026 10:00", detail: "IP adresi yurt dışından tespiti notu eklendi." },
      { id: 3, action: "İnceleme talep edildi", user: "Elif Yılmaz", date: "06.03.2026 14:30", detail: "Mehmet Öz'e inceleme gönderildi." },
    ],
  },
  "#2459": {
    caseId: "#2459",
    caseName: "ATM Skimming Şüphesi",
    domain: "Payment Fraud",
    status: "Open",
    severity: "medium",
    createdDate: "03.03.2026",
    assignee: "Can Yıldız",
    totalAmount: 48000.00,
    currency: "TRY",
    bankShare: 36000.00,
    customerShare: 12000.00,
    entities: {
      customers: [
        { id: "CUS-009876", name: "Mehmet Demir", phone: "+90 541 XXX XX 78", email: "m***@email.com" },
      ],
      debitCards: [
        { cardNo: "**** **** **** 6789", cardType: "Visa", expiry: "11/2027", status: "Bloke" },
      ],
      creditCards: [],
    },
    transactions: [
      { id: "TXN-301", date: "03.03.2026 22:15", type: "ATM", amount: 15000, currency: "TRY", channel: "ATM", status: "Şüpheli", score: 89 },
      { id: "TXN-302", date: "03.03.2026 22:18", type: "ATM", amount: 15000, currency: "TRY", channel: "ATM", status: "Şüpheli", score: 87 },
      { id: "TXN-303", date: "03.03.2026 22:22", type: "ATM", amount: 18000, currency: "TRY", channel: "ATM", status: "Şüpheli", score: 91 },
    ],
    comments: [
      { id: 1, user: "Can Yıldız", date: "03.03.2026 23:00", text: "Aynı ATM'den ardışık çekim tespit edildi. Skimming şüphesi.", fromReview: false },
      { id: 2, user: "Can Yıldız", date: "04.03.2026 09:30", text: "ATM kamerası incelemeye alındı. Cihaz üzerinde ek aparatı olabilir.", fromReview: false },
    ],
    attachments: [
      { id: 1, name: "ATM_Lokasyon_Raporu.pdf", size: "980 KB", uploader: "Can Yıldız", date: "04.03.2026 10:00" },
    ],
    relatedCases: [],
    history: [
      { id: 1, action: "Vaka oluşturuldu", user: "Can Yıldız", date: "03.03.2026 23:00", detail: "3 işlem ile vaka oluşturuldu." },
      { id: 2, action: "Kart bloke edildi", user: "Can Yıldız", date: "03.03.2026 23:05", detail: "Müşteri kartı bloke edildi." },
      { id: 3, action: "İnceleme talep edildi", user: "Burak Şen", date: "05.03.2026 16:00", detail: "Mehmet Öz'e inceleme gönderildi." },
    ],
  },
  "#2455": {
    caseId: "#2455",
    caseName: "Online Bankacılık Fraud",
    domain: "Account Takeover",
    status: "Open",
    severity: "high",
    createdDate: "02.03.2026",
    assignee: "Can Yıldız",
    totalAmount: 120000.00,
    currency: "TRY",
    bankShare: 84000.00,
    customerShare: 36000.00,
    entities: {
      customers: [
        { id: "CUS-003456", name: "Ayşe Yılmaz", phone: "+90 555 XXX XX 34", email: "ay***@email.com" },
      ],
      debitCards: [],
      creditCards: [
        { cardNo: "**** **** **** 9012", cardType: "Visa", expiry: "05/2028", status: "Aktif" },
      ],
    },
    transactions: [
      { id: "TXN-401", date: "02.03.2026 03:15", type: "EFT", amount: 80000, currency: "TRY", channel: "Internet", status: "Şüpheli", score: 94 },
      { id: "TXN-402", date: "02.03.2026 03:18", type: "Havale", amount: 40000, currency: "TRY", channel: "Internet", status: "Şüpheli", score: 90 },
    ],
    comments: [
      { id: 1, user: "Can Yıldız", date: "02.03.2026 09:00", text: "Gece saatlerinde yüksek tutarlı transferler. IP farklı ülkeden.", fromReview: false },
    ],
    attachments: [],
    relatedCases: [],
    history: [
      { id: 1, action: "Vaka oluşturuldu", user: "Can Yıldız", date: "02.03.2026 09:00", detail: "2 işlem ile vaka oluşturuldu." },
      { id: 2, action: "İnceleme talep edildi", user: "Can Yıldız", date: "04.03.2026 11:00", detail: "Mehmet Öz'e inceleme gönderildi." },
    ],
  },
  "#2448": {
    caseId: "#2448",
    caseName: "Sahte Kimlik Başvurusu",
    domain: "Application Fraud",
    status: "Open",
    severity: "medium",
    createdDate: "01.03.2026",
    assignee: "Elif Yılmaz",
    totalAmount: 250000.00,
    currency: "TRY",
    bankShare: 250000.00,
    customerShare: 0,
    entities: {
      customers: [
        { id: "CUS-007890", name: "Ali Koç", phone: "+90 530 XXX XX 90", email: "al***@email.com" },
      ],
      debitCards: [],
      creditCards: [],
    },
    transactions: [
      { id: "TXN-501", date: "01.03.2026 10:30", type: "Kredi Başvurusu", amount: 250000, currency: "TRY", channel: "Şube", status: "Şüpheli", score: 82 },
    ],
    comments: [
      { id: 1, user: "Elif Yılmaz", date: "01.03.2026 11:00", text: "Kimlik belgesi doğrulama sonucu şüpheli. Hologram kontrolü gerekiyor.", fromReview: false },
    ],
    attachments: [
      { id: 1, name: "Kimlik_Fotokopi.pdf", size: "2.1 MB", uploader: "Elif Yılmaz", date: "01.03.2026 11:05" },
    ],
    relatedCases: [],
    history: [
      { id: 1, action: "Vaka oluşturuldu", user: "Elif Yılmaz", date: "01.03.2026 11:00", detail: "1 işlem ile vaka oluşturuldu." },
      { id: 2, action: "İnceleme talep edildi", user: "Elif Yılmaz", date: "03.03.2026 09:15", detail: "Mehmet Öz'e inceleme gönderildi." },
    ],
  },
};

// Helper to get case data for a review (by caseId), with fallback
const getReviewCaseData = (caseId) => REVIEW_CASE_DATA_MAP[caseId] || REVIEW_CASE_DATA_MAP["#2470"];

// ─── STYLE CONSTANTS ─────────────────────────────────────────────────────────

const C = {
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
  purple: "#7C3AED",
  purpleLight: "#8B5CF6",
  purpleBg: "#F5F3FF",
};

const SEVERITY = {
  critical: { label: "Kritik", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  high: { label: "Yüksek", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  medium: { label: "Orta", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  low: { label: "Düşük", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};

// ─── ICONS ───────────────────────────────────────────────────────────────────

const I = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  CaseCreate: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Cases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  MyCases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Review: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Send: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  File: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  Upload: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  User: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Comment: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Link: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  CheckCircle: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Fingerprint: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6"/><path d="M12 10c-2 0-3 1.5-3 3.5 0 2 .5 4 1 5.5"/><path d="M8.5 22c.5-1.5 1-4 1-6.5 0-2 1-3.5 2.5-3.5s2.5 1.5 2.5 3.5c0 1.5-.5 3-1 4.5"/><path d="M14 22c.5-1.5 1-3.5 1-5.5 0-2-1-3.5-3-3.5"/><path d="M18 16c0-1-.5-2.5-2-4"/></svg>,
  TransactionSearch: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

// ─── TOAST ───────────────────────────────────────────────────────────────────

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const bg = toast.type === "success" ? C.success : toast.type === "error" ? C.danger : C.warning;
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: bg, color: "#fff", padding: "14px 22px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 10, animation: "slideIn .3s ease" }}>
      <span>{toast.msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, display: "flex" }}><I.X /></button>
    </div>
  );
}

// ─── MODAL WRAPPER ───────────────────────────────────────────────────────────

function Mdl({ t, onClose, w = 480, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ width: w, maxWidth: "95vw", maxHeight: "85vh", background: "#fff", borderRadius: 16, boxShadow: "0 25px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{t}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4 }}><I.X /></button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── CASE DETAIL READ-ONLY (shared between internal + external) ──────────────

function CaseDetailReadOnly({ caseData, isExternal, onComment, onComplete, comments, newComment, setNewComment, reviewCompleted }) {
  const [activeTab, setActiveTab] = useState("entities");
  const [drawerCase, setDrawerCase] = useState(null);
  const [entityFilter, setEntityFilter] = useState("all");

  const tabs = [
    { key: "entities", label: "Varlıklar", sublabel: "Entities" },
    { key: "comments", label: "Yorumlar", sublabel: "Comments", count: comments.length },
    { key: "attachments", label: "Ekler", sublabel: "Attachments", count: caseData.attachments.length },
    { key: "history", label: "Geçmiş", sublabel: "History" },
    { key: "transactions", label: "İşlemler", sublabel: "Transactions", count: caseData.transactions.length },
    { key: "related", label: "İlişkili Vakalar", sublabel: "Related Cases", count: caseData.relatedCases.length },
  ];

  const sev = SEVERITY[caseData.severity];
  const fmt = (n) => new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <div style={{ position: "relative" }}>
      {/* Watermark for external */}
      {isExternal && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.04 }}>
          <div style={{ transform: "rotate(-30deg)", fontSize: 48, fontWeight: 800, color: C.text, letterSpacing: "0.05em", whiteSpace: "nowrap", userSelect: "none" }}>
            GİZLİ — YETKİSİZ PAYLAŞIM YASAKTIR
          </div>
        </div>
      )}

      {/* Case Header */}
      <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px 28px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.primaryLight, fontFamily: "'JetBrains Mono', monospace" }}>{caseData.caseId}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "#DCFCE7", color: "#166534", textTransform: "uppercase" }}>{caseData.status}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>{sev.label}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{caseData.caseName}</h2>
            <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>
              {caseData.domain} · Oluşturulma: {caseData.createdDate} · Atanan: {caseData.assignee}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: `${C.purple}10`, borderRadius: 8, border: `1px solid ${C.purple}25` }}>
            <I.Review />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.purple }}>Salt Okunur — İnceleme Modu</span>
          </div>
        </div>

        {/* Fraud Amount Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Toplam Tutar", value: caseData.totalAmount, color: C.primary, bg: "#EFF6FF" },
            { label: "Banka Payı", value: caseData.bankShare, color: C.danger, bg: "#FEF2F2" },
            { label: "Müşteri Payı", value: caseData.customerShare, color: C.warning, bg: "#FFFBEB" },
          ].map((card, i) => (
            <div key={i} style={{ padding: "14px 16px", background: card.bg, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: card.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {fmt(card.value)} <span style={{ fontSize: 11, fontWeight: 500 }}>{caseData.currency}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Fraud Distribution Bar (read-only) */}
        {(() => {
          const total = caseData.totalAmount;
          const bank = caseData.bankShare;
          const cust = caseData.customerShare;
          const rem = Math.max(0, total - bank - cust);
          const bankPct = total > 0 ? (bank / total) * 100 : 0;
          const custPct = total > 0 ? (cust / total) * 100 : 0;
          const remPct = Math.max(0, 100 - bankPct - custPct);
          return (
            <div style={{ marginTop: 16, padding: "14px 18px", background: "#FAFBFD", borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 10 }}>Fraud Tutarı Dağılımı</div>
              <div style={{ height: 10, borderRadius: 5, display: "flex", overflow: "hidden", marginBottom: 10, background: "#E2E8F0" }}>
                {bankPct > 0 && <div style={{ width: `${bankPct}%`, background: "#1E40AF" }} />}
                {custPct > 0 && <div style={{ width: `${custPct}%`, background: "#F59E0B" }} />}
                {remPct > 0.5 && <div style={{ width: `${remPct}%`, background: "#CBD5E1" }} />}
              </div>
              <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#1E40AF" }} />
                  <span style={{ color: C.textSecondary }}>Banka Payı</span>
                  <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(bank)} {caseData.currency}</span>
                  <span style={{ fontSize: 11, color: "#1E40AF", fontWeight: 600, opacity: 0.7 }}>(%{bankPct.toFixed(1)})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#F59E0B" }} />
                  <span style={{ color: C.textSecondary }}>Müşteri Payı</span>
                  <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(cust)} {caseData.currency}</span>
                  <span style={{ fontSize: 11, color: "#D97706", fontWeight: 600, opacity: 0.7 }}>(%{custPct.toFixed(1)})</span>
                </div>
                {rem > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: "#CBD5E1" }} />
                    <span style={{ color: C.textSecondary }}>Belirlenmemiş</span>
                    <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: C.warning }}>{fmt(rem)} {caseData.currency}</span>
                    <span style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600, opacity: 0.7 }}>(%{remPct.toFixed(1)})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: 20 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: "12px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
            color: activeTab === tab.key ? C.primary : C.textSecondary, background: "transparent",
            borderBottom: `2px solid ${activeTab === tab.key ? C.primary : "transparent"}`, marginBottom: -2,
            fontFamily: "'DM Sans', sans-serif", transition: "all .15s", display: "flex", alignItems: "center", gap: 6,
          }}>
            {tab.label}
            {tab.count != null && <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: activeTab === tab.key ? `${C.primary}14` : "#F1F5F9", color: activeTab === tab.key ? C.primary : C.textSecondary }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>

        {/* Entities Tab */}
        {activeTab === "entities" && (
          <div style={{ padding: 20 }}>
            {/* Sub-filter pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[
                { key: "all", label: "Tümü" },
                { key: "customer", label: "Müşteri" },
                { key: "debit", label: "Banka Kartı" },
                { key: "credit", label: "Kredi Kartı" },
              ].map(f => (
                <button key={f.key} onClick={() => setEntityFilter(f.key)} style={{
                  padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                  border: `1px solid ${entityFilter === f.key ? C.primaryLight : C.border}`,
                  background: entityFilter === f.key ? `${C.primaryLight}10` : "#fff",
                  color: entityFilter === f.key ? C.primaryLight : C.textSecondary,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s",
                }}>{f.label}</button>
              ))}
            </div>

            {/* Müşteriler */}
            {(entityFilter === "all" || entityFilter === "customer") && caseData.entities.customers && caseData.entities.customers.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <I.User />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Müşteriler ({caseData.entities.customers.length})</span>
                </div>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC" }}>
                        {["MÜŞTERİ NO", "AD SOYAD", "TELEFON", "E-POSTA"].map((h, i) => (
                          <th key={i} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10.5, fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}`, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {caseData.entities.customers.map((cust, i) => (
                        <tr key={i} style={{ borderBottom: i < caseData.entities.customers.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: C.primaryLight, fontSize: 12 }}>{cust.id}</td>
                          <td style={{ padding: "12px 16px", fontWeight: 500 }}>{cust.name}</td>
                          <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.textSecondary }}>{cust.phone}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: C.textSecondary }}>{cust.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Banka Kartları */}
            {(entityFilter === "all" || entityFilter === "debit") && caseData.entities.debitCards && caseData.entities.debitCards.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>💳</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Banka Kartları ({caseData.entities.debitCards.length})</span>
                </div>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC" }}>
                        {["KART NO", "KART TİPİ", "SON KULLANMA", "DURUM"].map((h, i) => (
                          <th key={i} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10.5, fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}`, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {caseData.entities.debitCards.map((card, i) => (
                        <tr key={i} style={{ borderBottom: i < caseData.entities.debitCards.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 13 }}>{card.cardNo}</td>
                          <td style={{ padding: "12px 16px" }}>{card.cardType}</td>
                          <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{card.expiry}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: card.status === "Aktif" ? "#DCFCE7" : "#FEE2E2", color: card.status === "Aktif" ? "#166534" : "#991B1B" }}>{card.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Kredi Kartları */}
            {(entityFilter === "all" || entityFilter === "credit") && caseData.entities.creditCards && caseData.entities.creditCards.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>💳</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Kredi Kartları ({caseData.entities.creditCards.length})</span>
                </div>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC" }}>
                        {["KART NO", "KART TİPİ", "SON KULLANMA", "DURUM"].map((h, i) => (
                          <th key={i} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10.5, fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}`, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {caseData.entities.creditCards.map((card, i) => (
                        <tr key={i} style={{ borderBottom: i < caseData.entities.creditCards.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 13 }}>{card.cardNo}</td>
                          <td style={{ padding: "12px 16px" }}>{card.cardType}</td>
                          <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{card.expiry}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: card.status === "Aktif" ? "#DCFCE7" : "#FEE2E2", color: card.status === "Aktif" ? "#166534" : "#991B1B" }}>{card.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["İşlem ID", "Tarih", "Tür", "Tutar", "Kanal", "Durum", "Skor"].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {caseData.transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: C.primaryLight, fontSize: 12 }}>{tx.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12 }}>{tx.date}</td>
                    <td style={{ padding: "12px 16px" }}>{tx.type}</td>
                    <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt(tx.amount)} {tx.currency}</td>
                    <td style={{ padding: "12px 16px" }}>{tx.channel}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: "#FEF3C7", color: "#92400E" }}>{tx.status}</span></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${tx.score}%`, height: "100%", background: tx.score >= 90 ? C.danger : tx.score >= 80 ? C.warning : C.primaryLight, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: tx.score >= 90 ? C.danger : tx.score >= 80 ? C.warning : C.text }}>{tx.score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              {comments.map(c => (
                <div key={c.id} style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12 }}>
                  <Avatar name={c.user} size={32} style={{ background: c.fromReview ? `${C.purple}14` : `${C.primaryLight}14`, color: c.fromReview ? C.purple : C.primaryLight }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.user}</span>
                      {c.fromReview && <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: C.purpleBg, color: C.purple }}>İnceleme Yorumu</span>}
                      <span style={{ fontSize: 11, color: C.textSecondary }}>{c.date}</span>
                    </div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Comment input */}
            {!reviewCompleted && (
              <div style={{ display: "flex", gap: 10 }}>
                <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="İnceleme yorumunuzu yazın..." style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }} onKeyDown={e => { if (e.key === "Enter" && newComment.trim()) onComment(); }} />
                <button onClick={onComment} disabled={!newComment.trim()} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: newComment.trim() ? C.purple : "#E2E8F0", color: newComment.trim() ? "#fff" : "#94A3B8", fontSize: 13, fontWeight: 600, cursor: newComment.trim() ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
                  <I.Send /> Gönder
                </button>
              </div>
            )}
          </div>
        )}

        {/* Attachments Tab */}
        {activeTab === "attachments" && (
          <div style={{ padding: 20 }}>
            {caseData.attachments.map(att => (
              <div key={att.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: C.primaryLight }}><I.File /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{att.name}</div>
                    <div style={{ fontSize: 11, color: C.textSecondary }}>{att.size} · {att.uploader} · {att.date}</div>
                  </div>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, cursor: "pointer", color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
                  <I.Download /> İndir
                </button>
              </div>
            ))}
            {/* Upload for reviewer */}
            {!reviewCompleted && (
              <div style={{ marginTop: 16, padding: "20px", border: `2px dashed ${C.border}`, borderRadius: 10, textAlign: "center", cursor: "pointer" }}>
                <I.Upload />
                <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 6 }}>Dosya yüklemek için tıklayın veya sürükleyin</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>PDF, DOCX, XLSX, JPG, PNG · Maks 25MB</div>
              </div>
            )}
          </div>
        )}

        {/* Related Cases Tab */}
        {activeTab === "related" && (
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {caseData.relatedCases.map((rc, i) => {
                const rcSev = SEVERITY[rc.severity] || SEVERITY.medium;
                return (
                  <div key={i} onClick={() => setDrawerCase(rc)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer", transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#FAFBFE"; e.currentTarget.style.borderColor = C.primaryLight + "50"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.border; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: C.purpleBg, display: "flex", alignItems: "center", justifyContent: "center", color: C.purple }}><I.Link /></div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.primaryLight, fontFamily: "'JetBrains Mono', monospace" }}>{rc.id}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{rc.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.textSecondary }}>
                          <span>{rc.relation}</span>
                          <span>·</span>
                          <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: rc.status === "Open" ? "#DCFCE7" : "#F3F4F6", color: rc.status === "Open" ? "#166534" : "#374151" }}>{rc.status}</span>
                          {rc.severity && <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: rcSev.bg, color: rcSev.color }}>{rcSev.label}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.textSecondary }}>
                      <span style={{ fontSize: 12 }}>Detay</span>
                      <I.ChevronRight />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div style={{ padding: 20 }}>
            {caseData.history.map((h, i) => (
              <div key={h.id} style={{ display: "flex", gap: 16, position: "relative", paddingBottom: i < caseData.history.length - 1 ? 20 : 0 }}>
                {i < caseData.history.length - 1 && <div style={{ position: "absolute", left: 15, top: 32, bottom: 0, width: 2, background: C.border }} />}
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                  <I.Clock />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{h.action}</div>
                  <div style={{ fontSize: 12, color: C.textSecondary }}>{h.user} · {h.date}</div>
                  <div style={{ fontSize: 12, color: C.text, marginTop: 4, lineHeight: 1.5 }}>{h.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Related Case Drawer ── */}
      {drawerCase && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000 }} onClick={() => setDrawerCase(null)}>
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)" }} />
          {/* Drawer Panel */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 640, maxWidth: "90vw", height: "100vh", background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", animation: "slideInRight .25s ease" }} onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", flexShrink: 0 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.primaryLight, fontFamily: "'JetBrains Mono', monospace" }}>{drawerCase.id}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: drawerCase.status === "Open" ? "#DCFCE7" : "#F3F4F6", color: drawerCase.status === "Open" ? "#166534" : "#374151", textTransform: "uppercase" }}>{drawerCase.status}</span>
                  {drawerCase.severity && (() => { const s = SEVERITY[drawerCase.severity]; return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>; })()}
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{drawerCase.name}</h3>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{drawerCase.domain} · {drawerCase.relation} · Atanan: {drawerCase.assignee}</div>
              </div>
              <button onClick={() => setDrawerCase(null)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.textSecondary }}><I.X /></button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
              {/* Amount Cards */}
              {drawerCase.totalAmount && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Toplam Tutar", value: drawerCase.totalAmount, color: C.primary, bg: "#EFF6FF" },
                    { label: "Banka Payı", value: drawerCase.bankShare, color: C.danger, bg: "#FEF2F2" },
                    { label: "Müşteri Payı", value: drawerCase.customerShare, color: C.warning, bg: "#FFFBEB" },
                  ].map((card, i) => (
                    <div key={i} style={{ padding: "12px 14px", background: card.bg, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: C.textSecondary, marginBottom: 3 }}>{card.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: card.color, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(card.value)} <span style={{ fontSize: 10, fontWeight: 500 }}>{drawerCase.currency}</span></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Entities */}
              {drawerCase.entities && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Varlıklar</div>
                  {/* Müşteriler */}
                  {drawerCase.entities.customers && drawerCase.entities.customers.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Müşteriler ({drawerCase.entities.customers.length})</div>
                      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead><tr style={{ background: "#F8FAFC" }}>
                            {["MÜŞTERİ NO", "AD SOYAD", "TELEFON"].map((h, j) => (
                              <th key={j} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}`, letterSpacing: "0.04em" }}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {drawerCase.entities.customers.map((cust, j) => (
                              <tr key={j}><td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: C.primaryLight, fontSize: 11 }}>{cust.id}</td><td style={{ padding: "8px 12px" }}>{cust.name}</td><td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.textSecondary }}>{cust.phone}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {/* Kart sections */}
                  {[{ data: drawerCase.entities.debitCards, label: "Banka Kartları" }, { data: drawerCase.entities.creditCards, label: "Kredi Kartları" }].map((section, si) => (
                    section.data && section.data.length > 0 && (
                      <div key={si} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>{section.label} ({section.data.length})</div>
                        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead><tr style={{ background: "#F8FAFC" }}>
                              {["KART NO", "KART TİPİ", "SON KULLANMA", "DURUM"].map((h, j) => (
                                <th key={j} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}`, letterSpacing: "0.04em" }}>{h}</th>
                              ))}
                            </tr></thead>
                            <tbody>
                              {section.data.map((card, j) => (
                                <tr key={j}><td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 11 }}>{card.cardNo}</td><td style={{ padding: "8px 12px" }}>{card.cardType}</td><td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{card.expiry}</td><td style={{ padding: "8px 12px" }}><span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 600, background: card.status === "Aktif" ? "#DCFCE7" : "#FEE2E2", color: card.status === "Aktif" ? "#166534" : "#991B1B" }}>{card.status}</span></td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Transactions */}
              {drawerCase.transactions && drawerCase.transactions.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>İşlemler ({drawerCase.transactions.length})</div>
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC" }}>
                          {["İşlem ID", "Tarih", "Tür", "Tutar", "Kanal", "Durum", "Skor"].map((h, j) => (
                            <th key={j} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {drawerCase.transactions.map(tx => (
                          <tr key={tx.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: C.primaryLight, fontSize: 11 }}>{tx.id}</td>
                            <td style={{ padding: "10px 12px", fontSize: 11 }}>{tx.date}</td>
                            <td style={{ padding: "10px 12px" }}>{tx.type}</td>
                            <td style={{ padding: "10px 12px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmt(tx.amount)} {tx.currency}</td>
                            <td style={{ padding: "10px 12px" }}>{tx.channel}</td>
                            <td style={{ padding: "10px 12px" }}><span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: tx.status === "Fraud" ? "#FEE2E2" : "#FEF3C7", color: tx.status === "Fraud" ? "#991B1B" : "#92400E" }}>{tx.status}</span></td>
                            <td style={{ padding: "10px 12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 50, height: 5, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ width: `${tx.score}%`, height: "100%", background: tx.score >= 90 ? C.danger : tx.score >= 80 ? C.warning : C.primaryLight, borderRadius: 3 }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: tx.score >= 90 ? C.danger : tx.score >= 80 ? C.warning : C.text }}>{tx.score}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Comments */}
              {drawerCase.comments && drawerCase.comments.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Yorumlar ({drawerCase.comments.length})</div>
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    {drawerCase.comments.map(c => (
                      <div key={c.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
                        <Avatar name={c.user} size={28} style={{ background: `${C.primaryLight}14`, color: C.primaryLight }} />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{c.user}</span>
                            <span style={{ fontSize: 10, color: C.textSecondary }}>{c.date}</span>
                          </div>
                          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{c.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              {drawerCase.history && drawerCase.history.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Geçmiş ({drawerCase.history.length})</div>
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                    {drawerCase.history.map((h, i) => (
                      <div key={h.id} style={{ display: "flex", gap: 12, position: "relative", paddingBottom: i < drawerCase.history.length - 1 ? 14 : 0 }}>
                        {i < drawerCase.history.length - 1 && <div style={{ position: "absolute", left: 11, top: 26, bottom: 0, width: 2, background: C.border }} />}
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                          <I.Clock />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 1 }}>{h.action}</div>
                          <div style={{ fontSize: 11, color: C.textSecondary }}>{h.user} · {h.date}</div>
                          {h.detail && <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>{h.detail}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        </div>
      )}
    </div>
  );
}

// ─── EXTERNAL REVIEWER FLOW ──────────────────────────────────────────────────

function ExternalReviewerFlow({ onBack }) {
  const [step, setStep] = useState("verify"); // verify → review → completed
  const [otpCode, setOtpCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const externalCaseData = getReviewCaseData("#2470");
  const [comments, setComments] = useState([...externalCaseData.comments]);
  const [newComment, setNewComment] = useState("");
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [countdown, setCountdown] = useState(1440); // 24h in minutes
  const [otpResent, setOtpResent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 60000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const handleVerify = () => {
    if (!otpCode.trim()) { setVerifyError("Lütfen e-posta ile gönderilen doğrulama kodunu girin."); return; }
    // Demo: accept any 6-digit code
    if (otpCode.trim().length < 6) { setVerifyError("Doğrulama kodu 6 haneli olmalıdır."); return; }
    if (!/^\d{6}$/.test(otpCode.trim())) { setVerifyError("Doğrulama kodu yalnızca rakamlardan oluşmalıdır."); return; }
    setVerifyError("");
    setStep("review");
  };

  const handleResendOtp = () => {
    setOtpResent(true);
    setTimeout(() => setOtpResent(false), 5000);
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    const n = new Date();
    setComments(p => [...p, { id: p.length + 1, user: "Dış İncelemeci", date: `${String(n.getDate()).padStart(2, "0")}.${String(n.getMonth() + 1).padStart(2, "0")}.${n.getFullYear()} ${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`, text: newComment, fromReview: true }]);
    setNewComment("");
    showToast("success", "Yorumunuz eklendi.");
  };

  const handleComplete = () => {
    setShowConfirmModal(false);
    setReviewCompleted(true);
    setStep("completed");
    showToast("success", "İncelemeniz başarıyla tamamlandı.");
  };

  // ── VERIFY STEP ──
  if (step === "verify") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E40AF 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif" }}>
        <div style={{ width: 420, background: "#fff", borderRadius: 20, boxShadow: "0 25px 80px rgba(0,0,0,0.3)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "32px 32px 24px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#fff" }}>
              <I.Shield />
            </div>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: C.text }}>Doğrulama Kodu</h2>
            <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>
              E-posta adresinize gönderilen 6 haneli kodu girin
            </p>
          </div>

          {/* Form */}
          <div style={{ padding: "28px 32px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#EFF6FF", borderRadius: 10, marginBottom: 20, border: "1px solid #BFDBFE" }}>
              <I.Mail />
              <div>
                <div style={{ fontSize: 11, color: C.textSecondary }}>Davet gönderen</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Burak Şen — NEXUS</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#F8FAFC", borderRadius: 10, marginBottom: 20, border: `1px solid ${C.border}` }}>
              <I.User />
              <div>
                <div style={{ fontSize: 11, color: C.textSecondary }}>Gönderildiği e-posta</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>a****@example.com</div>
              </div>
            </div>

            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: C.text }}>Doğrulama Kodu (OTP) *</label>
            <input value={otpCode} onChange={e => { setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setVerifyError(""); }} placeholder="• • • • • •" maxLength={6} style={{ width: "100%", padding: "14px 16px", border: `1px solid ${verifyError ? C.danger : C.border}`, borderRadius: 10, fontSize: 22, fontFamily: "'JetBrains Mono', monospace", marginBottom: verifyError ? 6 : 16, boxSizing: "border-box", textAlign: "center", letterSpacing: "0.4em", fontWeight: 600 }} onKeyDown={e => { if (e.key === "Enter") handleVerify(); }} />
            {verifyError && <div style={{ fontSize: 12, color: C.danger, marginBottom: 14 }}>{verifyError}</div>}

            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <button onClick={handleResendOtp} disabled={otpResent} style={{ background: "none", border: "none", fontSize: 12, color: otpResent ? C.success : C.primaryLight, cursor: otpResent ? "default" : "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {otpResent ? "✓ Kod tekrar gönderildi" : "Kodu tekrar gönder"}
              </button>
            </div>

            <button onClick={handleVerify} style={{ width: "100%", padding: "13px 20px", borderRadius: 10, border: "none", background: otpCode.length === 6 ? "linear-gradient(135deg, #1E40AF, #3B82F6)" : "#E2E8F0", color: otpCode.length === 6 ? "#fff" : "#94A3B8", fontSize: 14, fontWeight: 600, cursor: otpCode.length === 6 ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <I.Lock /> Doğrula ve Devam Et
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, padding: "10px 14px", background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A" }}>
              <I.Clock />
              <span style={{ fontSize: 11, color: "#92400E" }}>Bu bağlantı tek kullanımlıktır ve {Math.floor(countdown / 60)} saat {countdown % 60} dakika içinde geçerliliğini yitirecektir.</span>
            </div>
          </div>

          {/* Demo back link */}
          <div style={{ padding: "0 32px 20px", textAlign: "center" }}>
            <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 12, color: C.textSecondary, cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>← Demo: Sistem İçi Görünüme Dön</button>
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETED STEP ──
  if (step === "completed") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #ECFDF5, #D1FAE5, #A7F3D0)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif" }}>
        <div style={{ width: 440, background: "#fff", borderRadius: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.1)", overflow: "hidden", textAlign: "center", padding: "48px 40px" }}>
          <div style={{ marginBottom: 20 }}><I.CheckCircle /></div>
          <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 700, color: C.text }}>Teşekkürler!</h2>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>
            İncelemeniz başarıyla tamamlandı ve vaka sahibine iletildi.
          </p>
          <p style={{ margin: "0 0 28px", fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>
            Bu sayfayı güvenle kapatabilirsiniz. Bağlantınız artık geçersizdir.
          </p>
          <div style={{ padding: "14px 18px", background: "#F8FAFC", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>İncelenen vaka</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{externalCaseData.caseId} — {externalCaseData.caseName}</div>
          </div>
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 12, color: C.textSecondary, cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>← Demo: Sistem İçi Görünüme Dön</button>
        </div>
      </div>
    );
  }

  // ── REVIEW STEP (External minimal interface) ──
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Minimal top bar (no full navigation) */}
      <header style={{ height: 56, background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>S</div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>NEXUS</span>
            <span style={{ fontSize: 11, color: C.textSecondary, marginLeft: 8 }}>Dış İnceleme Portalı</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#FFFBEB", borderRadius: 6, border: "1px solid #FDE68A" }}>
            <I.Clock />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#92400E" }}>Oturum aktif</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Avatar name="Dış İncelemeci" size={28} style={{ background: `${C.purple}14`, color: C.purple }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>Dış İncelemeci</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 80px" }}>
        {/* Review context banner */}
        <div style={{ background: "linear-gradient(135deg, #5B21B6, #7C3AED)", borderRadius: 14, padding: "20px 28px", marginBottom: 20, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>İnceleme Talebi</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{externalCaseData.caseId} — {externalCaseData.caseName}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Gönderen: Burak Şen · 07.03.2026 09:00</div>
          </div>
          {!reviewCompleted && (
            <button onClick={() => setShowConfirmModal(true)} style={{ padding: "10px 24px", borderRadius: 10, border: "2px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(4px)" }}>
              <I.Check /> İncelemeyi Tamamla
            </button>
          )}
        </div>

        {/* Review Note */}
        <div style={{ background: C.purpleBg, borderRadius: 10, padding: "14px 18px", marginBottom: 20, border: `1px solid #DDD6FE`, display: "flex", gap: 12 }}>
          <I.Comment />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, marginBottom: 2 }}>İnceleme Notu</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>Lütfen müşteri profilindeki tutarsızlıkları değerlendiriniz.</div>
          </div>
        </div>

        {/* Case Detail */}
        <CaseDetailReadOnly
          caseData={externalCaseData}
          isExternal={true}
          onComment={handleComment}
          onComplete={() => setShowConfirmModal(true)}
          comments={comments}
          newComment={newComment}
          setNewComment={setNewComment}
          reviewCompleted={reviewCompleted}
        />
      </main>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <Mdl t="İncelemeyi Tamamla" onClose={() => setShowConfirmModal(false)} w={440}>
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.purpleBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.purple }}>
              <I.Check />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>İncelemenizi tamamlamak istediğinizden emin misiniz?</h3>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>Bu işlem geri alınamaz. Tamamladıktan sonra bu bağlantı geçersiz hale gelecektir.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: "11px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.text, fontFamily: "'DM Sans', sans-serif" }}>Vazgeç</button>
              <button onClick={handleComplete} style={{ flex: 1, padding: "11px 18px", borderRadius: 8, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <I.Check /> Tamamla
              </button>
            </div>
          </div>
        </Mdl>
      )}

      {/* Demo back button */}
      <div style={{ position: "fixed", bottom: 20, left: 20, zIndex: 200 }}>
        <button onClick={onBack} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(15,23,42,0.8)", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif", backdropFilter: "blur(4px)" }}>
          <I.ArrowLeft /> Demo: Sistem İçi Görünüm
        </button>
      </div>
    </div>
  );
}

// ─── INTERNAL REVIEW PAGE ────────────────────────────────────────────────────

function InternalReviewPage({ currentRole, onRoleChange, user, onViewExternal, onNavigate, myCasesCount = 0, pendingApprovalsCount = 0, reviewCount = 0, notifications = [], onMarkAllRead, onMarkRead, selectedDomain = "payment", onDomainChange, fraudDomains }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewCaseData, setReviewCaseData] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingReviews, setPendingReviews] = useState([...PENDING_REVIEWS]);
  const [completedReviews, setCompletedReviews] = useState([...COMPLETED_REVIEWS]);

  useEffect(() => {
    reviewsApi.listAll({ reviewer_name: user.name, status: 'pending' })
      .then(rows => {
        if (rows.length > 0) {
          const fmt = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
          setPendingReviews(rows.map(r => ({ id: r.id, caseId: `#${r.case_id}`, caseName: r.case_name || `Vaka #${r.case_id}`, sender: r.requested_by, sentDate: fmt(r.requested_at), note: null, status: 'pending', severity: r.severity || 'medium', _caseId: r.case_id, _reviewId: r.id })));
        }
      }).catch(() => {});
    reviewsApi.listAll({ reviewer_name: user.name, status: 'completed' })
      .then(rows => {
        if (rows.length > 0) {
          const fmt = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
          setCompletedReviews(rows.map(r => ({ id: r.id, caseId: `#${r.case_id}`, caseName: r.case_name || `Vaka #${r.case_id}`, sender: r.requested_by, sentDate: fmt(r.requested_at), completedDate: fmt(r.completed_at), status: 'completed', severity: r.severity || 'medium', responseComment: r.comment || null })));
        }
      }).catch(() => {});
  }, [user.name]);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  // Fetch case detail from API when a review is selected
  const loadCaseForReview = async (review) => {
    const numericId = review._caseId || review.caseId?.replace('#', '');
    if (!numericId) return;
    setCaseLoading(true);
    try {
      const [caseRow, cmts, txnRows, hist, atts, rels] = await Promise.all([
        casesApi.get(numericId).catch(() => null),
        commentsApi.list(numericId).catch(() => []),
        txnsApi.list(numericId).catch(() => []),
        historyApi.list(numericId).catch(() => []),
        attachmentsApi.list(numericId).catch(() => []),
        relationsApi.list(numericId).catch(() => []),
      ]);
      if (!caseRow) {
        // API case not found — fall back to mock map
        const fallback = getReviewCaseData(review.caseId);
        setReviewCaseData(fallback);
        setComments([...fallback.comments]);
        setCaseLoading(false);
        return;
      }
      const fmt = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
      const fmtDate = (s) => { if (!s) return '—'; if (/^\d{2}\.\d{2}\.\d{4}/.test(s)) return s; const d = new Date(s); return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; };
      const commentsData = (Array.isArray(cmts) ? cmts : cmts?.data || []).map(c => ({
        id: c.id, user: c.user_name || c.user, date: fmt(c.created_at) || c.date, text: c.content || c.text, fromReview: !!c.from_review,
      }));
      const txnData = (Array.isArray(txnRows) ? txnRows : txnRows?.data || []).map(t => ({
        id: t.id || t.fdm_txn_id, date: fmt(t.date || t.created_at) || '—', type: t.type || t.transaction_type || '—',
        amount: t.amount || 0, currency: t.currency || caseRow.currency || 'TRY',
        channel: t.channel || '—', status: t.fraud_status || t.status || '—', score: t.score || t.fraud_score || 0,
      }));
      const histData = (Array.isArray(hist) ? hist : hist?.data || []).map(h => ({
        id: h.id, action: h.action, user: h.user_name || h.user, date: fmt(h.created_at) || h.date, detail: h.detail || '',
      }));
      const attData = (Array.isArray(atts) ? atts : atts?.data || []).map(a => ({
        id: a.id, name: a.file_name || a.name, size: a.file_size || '—', uploader: a.uploaded_by || '—', date: fmt(a.created_at) || '—',
      }));
      const relData = (Array.isArray(rels) ? rels : rels?.data || []).map(r => ({
        id: `#${r.related_case_id || r.id}`, name: r.related_case_name || r.name || `Vaka #${r.related_case_id}`,
        relation: r.relationship_type || '—', status: r.status || 'Open', severity: r.severity || 'medium',
        domain: r.domain || '—', assignee: r.owner || '—', createdDate: fmtDate(r.create_date),
        totalAmount: r.total_amount || 0, currency: r.currency || 'TRY', bankShare: r.bank_share || 0, customerShare: r.customer_share || 0,
        entities: { customers: [], debitCards: [], creditCards: [] }, transactions: [], comments: [],
        history: [],
      }));
      const built = {
        caseId: `#${caseRow.id}`,
        caseName: caseRow.name,
        domain: caseRow.domain_id || '—',
        status: caseRow.status,
        severity: caseRow.severity || 'medium',
        createdDate: fmtDate(caseRow.create_date),
        assignee: caseRow.owner || '—',
        totalAmount: caseRow.total_amount || 0,
        currency: caseRow.currency || 'TRY',
        bankShare: caseRow.bank_share || 0,
        customerShare: caseRow.customer_share || 0,
        entities: { customers: [], debitCards: [], creditCards: [] },
        transactions: txnData,
        comments: commentsData,
        attachments: attData,
        relatedCases: relData,
        history: histData,
      };
      setReviewCaseData(built);
      setComments([...commentsData]);
    } catch {
      // Fallback to mock map on error
      const fallback = getReviewCaseData(review.caseId);
      setReviewCaseData(fallback);
      setComments([...fallback.comments]);
    }
    setCaseLoading(false);
  };

  const handleComment = () => {
    if (!newComment.trim() || !selectedReview) return;
    const n = new Date();
    const dateStr = `${String(n.getDate()).padStart(2, "0")}.${String(n.getMonth() + 1).padStart(2, "0")}.${n.getFullYear()} ${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
    const commentText = newComment.trim();
    setComments(p => [...p, { id: Date.now(), user: user.name, date: dateStr, text: commentText, fromReview: true }]);
    setNewComment("");
    // Save to API
    const numericId = selectedReview._caseId || selectedReview.caseId?.replace('#', '');
    if (numericId) {
      commentsApi.create(numericId, { user_name: user.name, content: commentText, from_review: true }).catch(() => {});
    }
    showToast("success", "İnceleme yorumunuz eklendi.");
  };

  const handleComplete = () => {
    setShowConfirmModal(false);
    const completed = { ...selectedReview, status: 'completed', completedDate: new Date().toLocaleString('tr-TR').slice(0, 16).replace(',', '') };
    setPendingReviews(p => p.filter(r => r.id !== selectedReview.id));
    setCompletedReviews(p => [completed, ...p]);
    const numericId = selectedReview._caseId || selectedReview.caseId?.replace('#', '');
    if (selectedReview._caseId && selectedReview._reviewId) {
      const lastReviewComment = comments.filter(c => c.fromReview).pop();
      reviewsApi.update(selectedReview._caseId, selectedReview._reviewId, { status: 'completed', comment: lastReviewComment?.text || null }).catch(() => {});
    }
    // Add history entry for review completion on the case
    if (numericId) {
      historyApi.create(numericId, {
        user_name: user.name,
        action: 'İnceleme tamamlandı',
        action_type: 'review',
        detail: `${user.name} tarafından inceleme sonuçlandırıldı.`,
      }).catch(() => {});
    }
    showToast("success", "İnceleme tamamlandı.");
    setSelectedReview(null);
    setReviewCaseData(null);
    setComments([]);
  };

  const allReviews = activeTab === "pending" ? pendingReviews : completedReviews;

  // ── CASE DETAIL VIEW (when a review is selected) ──
  if (selectedReview) {
    return (
      <div className="scm-layout">
        <Toast toast={toast} onClose={() => setToast(null)} />

        <Sidebar
          activePage="reviews"
          onNavigate={onNavigate}
          user={USERS[currentRole]}
          selectedDomain={selectedDomain}
          onDomainChange={onDomainChange}
          collapsed={sidebarCollapsed}
          onCollapseToggle={() => setSidebarCollapsed(c => !c)}
          myCasesCount={myCasesCount}
          pendingApprovalsCount={pendingApprovalsCount}
          reviewCount={reviewCount}
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          onMarkRead={onMarkRead}
          fraudDomains={fraudDomains}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <header style={{ height: 64, background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => { setSelectedReview(null); setReviewCaseData(null); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
                <I.ArrowLeft /> Geri
              </button>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>İnceleme — {selectedReview.caseName}</h1>
                <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>Salt Okunur Mod · Gönderen: {selectedReview.sender}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setShowConfirmModal(true)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
                <I.Check /> İncelemeyi Tamamla
              </button>
            </div>
          </header>

          <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
            {/* Review Note */}
            <div style={{ background: C.purpleBg, borderRadius: 10, padding: "14px 18px", marginBottom: 20, border: `1px solid #DDD6FE`, display: "flex", gap: 12 }}>
              <I.Comment />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, marginBottom: 2 }}>İnceleme Notu — {selectedReview.sender}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{selectedReview.note}</div>
              </div>
            </div>

            {caseLoading || !reviewCaseData ? (
              <div style={{ textAlign: "center", padding: 60, color: C.textSecondary, fontSize: 14 }}>Vaka verileri yükleniyor...</div>
            ) : (
              <CaseDetailReadOnly
                caseData={reviewCaseData}
                isExternal={false}
                onComment={handleComment}
                onComplete={() => setShowConfirmModal(true)}
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                reviewCompleted={false}
              />
            )}
          </main>
        </div>

        {/* Confirm Modal */}
        {showConfirmModal && (
          <Mdl t="İncelemeyi Tamamla" onClose={() => setShowConfirmModal(false)} w={440}>
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.purpleBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.purple }}>
                <I.Check />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>İncelemenizi tamamlamak istediğinizden emin misiniz?</h3>
              <p style={{ margin: "0 0 24px", fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>Bu işlem geri alınamaz. Tamamlandığında vaka sahibine bildirim gönderilecektir.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: "11px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.text, fontFamily: "'DM Sans', sans-serif" }}>Vazgeç</button>
                <button onClick={handleComplete} style={{ flex: 1, padding: "11px 18px", borderRadius: 8, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <I.Check /> Tamamla
                </button>
              </div>
            </div>
          </Mdl>
        )}
      </div>
    );
  }

  // ── REVIEW LIST VIEW ──
  return (
    <div className="scm-layout">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Sidebar
        activePage="reviews"
        onNavigate={onNavigate}
        user={USERS[currentRole]}
        selectedDomain={selectedDomain}
        onDomainChange={onDomainChange}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(c => !c)}
        myCasesCount={myCasesCount}
        pendingApprovalsCount={pendingApprovalsCount}
        reviewCount={reviewCount}
        notifications={notifications}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
        fraudDomains={fraudDomains}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 64, background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: C.text }}>İncelemem İçin Gönderilenler</h1>
            <p style={{ fontSize: 12, color: C.textSecondary, margin: 0 }}>Bana review için atanmış vakalar</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              {["analyst", "manager", "admin", "super"].map(role => (
                <button key={role} onClick={() => onRoleChange && onRoleChange(role)} style={{ padding: "6px 14px", fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", background: currentRole === role ? C.primary : "#fff", color: currentRole === role ? "#fff" : C.textSecondary, transition: "all 0.15s ease" }}>
                  {role === "analyst" ? "Analist" : role === "manager" ? "Yönetici" : role === "admin" ? "Admin" : "Super"}
                </button>
              ))}
            </div>
            {/* Demo: View External */}
            <button onClick={onViewExternal} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.purple}40`, background: C.purpleBg, color: C.purple, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              <I.Mail /> Demo: Dış İncelemeci Görünümü
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: C.textSecondary }}><I.Globe /> TR</button>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Bekleyen İncelemeler", sublabel: "Pending Reviews", value: pendingReviews.length, color: C.warning, bg: "#FFFBEB", icon: <I.Clock /> },
              { label: "Tamamlanan İncelemeler", sublabel: "Completed Reviews", value: completedReviews.length, color: C.success, bg: "#ECFDF5", icon: <I.Check /> },
              { label: "Toplam İnceleme", sublabel: "Total Reviews", value: pendingReviews.length + completedReviews.length, color: C.purple, bg: C.purpleBg, icon: <I.Review /> },
            ].map((card, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>{card.icon}</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: card.color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{card.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{card.label}</div>
                <div style={{ fontSize: 11, color: C.textSecondary }}>{card.sublabel}</div>
              </div>
            ))}
          </div>

          {/* Tab Toggle */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", width: "fit-content" }}>
            {[
              { key: "pending", label: "Bekleyen", count: pendingReviews.length },
              { key: "completed", label: "Tamamlanan", count: completedReviews.length },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: "10px 24px", border: "none", cursor: "pointer",
                background: activeTab === tab.key ? C.primary : "#fff",
                color: activeTab === tab.key ? "#fff" : C.textSecondary,
                fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all .15s",
              }}>
                {tab.label}
                <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 10, background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : C.bg }}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Review List */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Case ID", "Vaka Adı", "Gönderen", "Gönderim Tarihi", "Önem", activeTab === "completed" ? "Tamamlanma" : "İnceleme Notu", ""].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allReviews.map(r => {
                  const sev = SEVERITY[r.severity];
                  return (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FAFBFE"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                      onClick={() => setSelectedReview(r)}
                    >
                      <td style={{ padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: C.primaryLight, fontSize: 12 }}>{r.caseId}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 500 }}>{r.caseName}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${C.primaryLight}14`, display: "flex", alignItems: "center", justifyContent: "center", color: C.primaryLight, fontSize: 10, fontWeight: 600 }}>
                            {r.sender.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span style={{ fontSize: 12 }}>{r.sender}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: C.textSecondary }}>{r.sentDate}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>{sev.label}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: C.textSecondary, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {activeTab === "completed" ? r.completedDate : r.note}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {activeTab === "pending" ? (
                          <button onClick={(e) => { e.stopPropagation(); setSelectedReview(r); loadCaseForReview(r); }}
                            style={{ padding:"6px 16px", borderRadius:6, border:"none", background:C.purpleBg, color:C.purple, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                            <I.Review /> İncele
                          </button>
                        ) : (
                          <span style={{ fontSize:12, color:"#059669", fontWeight:600 }}>✓ Tamamlandı</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {allReviews.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "#64748B", fontSize: 13 }}>
                      {activeTab === "pending" ? "İncelemeniz için bekleyen kayıt bulunmuyor." : "Tamamlanan inceleme bulunmuyor."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function SCMReview({ onNavigate, currentRole = "analyst", onRoleChange, selectedDomain = "payment", onDomainChange, myCasesCount = 0, pendingApprovalsCount = 0, reviewCount = 0, notifications = [], onMarkAllRead, onMarkRead, fraudDomains } = {}) {
  const [viewMode, setViewMode] = useState("internal");
  const user = USERS[currentRole];

  if (viewMode === "external") {
    return <ExternalReviewerFlow onBack={() => setViewMode("internal")} />;
  }

  return (
    <InternalReviewPage
      currentRole={currentRole}
      onRoleChange={onRoleChange}
      user={user}
      onViewExternal={() => setViewMode("external")}
      onNavigate={onNavigate}
      myCasesCount={myCasesCount}
      pendingApprovalsCount={pendingApprovalsCount}
      reviewCount={reviewCount}
      notifications={notifications}
      onMarkAllRead={onMarkAllRead}
      onMarkRead={onMarkRead}
      selectedDomain={selectedDomain}
      onDomainChange={onDomainChange}
      fraudDomains={fraudDomains}
    />

  );
}
