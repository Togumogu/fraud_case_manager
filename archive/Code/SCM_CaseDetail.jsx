import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", roleLabel: "Fraud Analist" },
  manager: { id: 2, name: "Burak Şen", role: "manager", roleLabel: "Yönetici" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", roleLabel: "Admin" },
};
const ACTIVE_USERS = [
  { id: 1, name: "Elif Yılmaz", role: "Fraud Analist", email: "elif@bank.com" },
  { id: 4, name: "Mehmet Öz", role: "Fraud Analist", email: "mehmet@bank.com" },
  { id: 5, name: "Ayşe Tan", role: "Fraud Analist", email: "ayse@bank.com" },
  { id: 6, name: "Can Yıldız", role: "Fraud Analist", email: "can@bank.com" },
  { id: 7, name: "Selin Aydın", role: "İnceleyici", email: "selin@bank.com" },
  { id: 2, name: "Burak Şen", role: "Yönetici", email: "burak@bank.com" },
];
const DOMAINS = ["Payment Fraud", "Credit Card Fraud", "Application Fraud", "Internal Fraud", "Account Takeover"];
const STATUS_CONFIG = {
  Open: { label: "Open", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  Closed: { label: "Closed", bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  "Pending Closure": { label: "Pending Closure", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
};
const SEVERITY_CONFIG = {
  critical: { label: "Kritik", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  high: { label: "Yüksek", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  medium: { label: "Orta", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  low: { label: "Düşük", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};
const CLOSE_REASONS = ["Soruşturma Tamamlandı","Çözüme Kavuşturuldu","Mükerrer","Yanlış Alarm","Yetersiz Kanıt","Diğer"];
const CASE_DATA = { id: 2470, name: "Çoklu Kanal Fraud", status: "Open", severity: "high", owner: "Elif Yılmaz", ownerId: 1, createUser: "Burak Şen", createDate: "06.03.2026", createTime: "09:15", updateUser: "Elif Yılmaz", updateDate: "07.03.2026", updateTime: "14:32", description: "Birden fazla kanaldan (ATM, internet bankacılığı ve mobil) gerçekleştirilen şüpheli işlemler. Müşteri hesabına yetkisiz erişim tespit edilmiştir.", totalAmount: 157200, currency: "TRY", bankShare: 94320, customerShare: 62880 };
const CASE_TRANSACTIONS = [
  { id: "TXN-20260301-001", date: "01.03.2026 14:22", type: "Havale", amount: 45000, currency: "TRY", fraudStatus: true, fraudAmount: 45000, bankShare: 27000, customerShare: 18000 },
  { id: "TXN-20260302-015", date: "02.03.2026 09:45", type: "EFT", amount: 62200, currency: "TRY", fraudStatus: true, fraudAmount: 62200, bankShare: 37320, customerShare: 24880 },
  { id: "TXN-20260303-022", date: "03.03.2026 16:10", type: "Kredi Kartı", amount: 28500, currency: "TRY", fraudStatus: true, fraudAmount: 28500, bankShare: 17100, customerShare: 11400 },
  { id: "TXN-20260304-007", date: "04.03.2026 11:30", type: "ATM Çekim", amount: 15000, currency: "TRY", fraudStatus: true, fraudAmount: 15000, bankShare: 9000, customerShare: 6000 },
  { id: "TXN-20260305-003", date: "05.03.2026 08:55", type: "Online Ödeme", amount: 6500, currency: "TRY", fraudStatus: false, fraudAmount: 0, bankShare: 0, customerShare: 0 },
];
const CASE_ENTITIES = {
  customers: [{ customerNo: "CUS-001234", name: "Ahmet Kara", phone: "+90 532 XXX XX 45", email: "a***@email.com" },{ customerNo: "CUS-005678", name: "Fatma Kara", phone: "+90 505 XXX XX 12", email: "f***@email.com" }],
  debitCards: [{ cardNumber: "**** **** **** 4523", cardType: "Visa", expiryDate: "09/2028", status: "Active" },{ cardNumber: "**** **** **** 7891", cardType: "MasterCard", expiryDate: "03/2027", status: "Blocked" }],
  creditCards: [{ cardNumber: "**** **** **** 1234", cardType: "Visa", expiryDate: "12/2027", status: "Active" },{ cardNumber: "**** **** **** 5678", cardType: "MasterCard", expiryDate: "06/2026", status: "Blocked" }],
};
// Comments include review-sourced items
const CASE_COMMENTS = [
  { id: 1, user: "Burak Şen", date: "06.03.2026 09:20", text: "Vaka oluşturuldu. Çoklu kanaldan şüpheli işlemler tespit edildi.", fromReview: false },
  { id: 2, user: "Elif Yılmaz", date: "06.03.2026 11:45", text: "Müşteri ile iletişime geçildi. Hesap geçici olarak donduruldu.", fromReview: false },
  { id: 3, user: "Elif Yılmaz", date: "06.03.2026 15:30", text: "ATM kamera görüntüleri talep edildi. İşlem saatlerinde müşterinin farklı lokasyonda olduğu tespit edildi.", fromReview: false },
  { id: 4, user: "Mehmet Öz", date: "07.03.2026 10:00", text: "İşlem kalıpları bilinen dolandırıcılık şemasıyla uyumlu. Müşterinin son 3 aydaki harcama profili normalden %340 sapma gösteriyor.", fromReview: true, reviewLabel: "İnceleme Yorumu" },
];
const CASE_ATTACHMENTS = [
  { id: 1, name: "ATM_Kamera_Goruntuleri.pdf", size: "4.2 MB", uploader: "Elif Yılmaz", date: "06.03.2026 15:35", fromReview: false },
  { id: 2, name: "Musteri_Beyan_Formu.docx", size: "1.1 MB", uploader: "Elif Yılmaz", date: "06.03.2026 16:10", fromReview: false },
  { id: 3, name: "Fraud_Analiz_Raporu.xlsx", size: "2.8 MB", uploader: "Mehmet Öz", date: "07.03.2026 10:05", fromReview: true, reviewLabel: "İnceleme Eki" },
];
const CASE_HISTORY = [
  { id: 1, action: "Vaka oluşturuldu", user: "Burak Şen", date: "06.03.2026 09:15", detail: "Vaka 'Çoklu Kanal Fraud' olarak oluşturuldu." },
  { id: 2, action: "Vaka atandı", user: "Burak Şen", date: "06.03.2026 09:16", detail: "Vaka Elif Yılmaz'a atandı." },
  { id: 3, action: "Yorum eklendi", user: "Burak Şen", date: "06.03.2026 09:20", detail: "Yeni yorum eklendi." },
  { id: 4, action: "Dosya yüklendi", user: "Elif Yılmaz", date: "06.03.2026 15:35", detail: "ATM_Kamera_Goruntuleri.pdf yüklendi." },
  { id: 5, action: "Review gönderildi", user: "Elif Yılmaz", date: "07.03.2026 09:00", detail: "Mehmet Öz'e review için gönderildi." },
  { id: 6, action: "Review tamamlandı", user: "Mehmet Öz", date: "07.03.2026 10:00", detail: "Review tamamlandı. Yorum ve dosya eklendi." },
  { id: 7, action: "Önem derecesi güncellendi", user: "Elif Yılmaz", date: "07.03.2026 14:30", detail: "'Orta' → 'Yüksek' olarak güncellendi." },
];
const RELATED_CASES = [
  { id: 2465, name: "Hesap Ele Geçirme", relationshipType: "Kardeş", status: "Open", createDate: "04.03.2026", totalAmount: 520000, currency: "TRY" },
  { id: 2458, name: "Mobil Bankacılık Fraud", relationshipType: "Alt Vaka", status: "Open", createDate: "01.03.2026", totalAmount: 72400, currency: "TRY" },
];
const PENDING_REVIEWS = [
  { id: 1, reviewer: "Mehmet Öz", status: "completed", sentDate: "07.03.2026 09:00", completedDate: "07.03.2026 10:00", note: "Lütfen müşteri profilindeki tutarsızlıkları değerlendiriniz.", responseComment: "İşlem kalıpları bilinen dolandırıcılık şemasıyla uyumlu. Müşterinin son 3 aydaki harcama profili normalden %340 sapma gösteriyor.", responseAttachments: [{ name: "Fraud_Analiz_Raporu.xlsx", size: "2.8 MB" }] },
  { id: 2, reviewer: "Ayşe Tan", status: "pending", sentDate: "07.03.2026 14:00", completedDate: null, note: "ATM kamera görüntülerini inceleyip değerlendirmenizi rica ederim.", responseComment: null, responseAttachments: [] },
];
const CONSOLIDATED_AMOUNT = CASE_DATA.totalAmount + RELATED_CASES.reduce((s, r) => s + r.totalAmount, 0);
const ALL_CASES_FOR_LINK = [
  { id: 2469, name: "Sahte Belge Dolandırıcılığı", status: "Open", severity: "high", createDate: "05.03.2026", altSeviyeSayisi: 0 },
  { id: 2468, name: "Kart Dolandırıcılığı", status: "Closed", severity: "medium", createDate: "05.03.2026", altSeviyeSayisi: 0 },
  { id: 2467, name: "Başvuru Sahteciliği", status: "Open", severity: "medium", createDate: "05.03.2026", altSeviyeSayisi: 1 },
  { id: 2464, name: "İç Fraud Şüphesi", status: "Open", severity: "high", createDate: "05.03.2026", altSeviyeSayisi: 0 },
  { id: 2463, name: "Sahte Kimlik Başvurusu", status: "Open", severity: "medium", createDate: "04.03.2026", altSeviyeSayisi: 0 },
  { id: 2462, name: "Dijital Cüzdan Fraud", status: "Open", severity: "low", createDate: "03.03.2026", altSeviyeSayisi: 2 },
  { id: 2460, name: "POS Dolandırıcılığı", status: "Closed", severity: "high", createDate: "02.03.2026", altSeviyeSayisi: 0 },
  { id: 2459, name: "ATM Skimming", status: "Closed", severity: "critical", createDate: "01.03.2026", altSeviyeSayisi: 1 },
];
const AVAILABLE_TRANSACTIONS = [
  { id: "TXN-20260306-011", date: "06.03.2026 10:15", type: "Havale", amount: 22000, currency: "TRY", score: 87, markStatus: "Marked", entityKey: "CUS-001234" },
  { id: "TXN-20260306-018", date: "06.03.2026 14:30", type: "EFT", amount: 15500, currency: "TRY", score: 72, markStatus: "Marked", entityKey: "CUS-005678" },
  { id: "TXN-20260307-004", date: "07.03.2026 09:20", type: "Kredi Kartı", amount: 8900, currency: "TRY", score: 65, markStatus: "Marked", entityKey: "CUS-001234" },
  { id: "TXN-20260307-009", date: "07.03.2026 11:45", type: "Online Ödeme", amount: 3200, currency: "USD", score: 45, markStatus: "Unmarked", entityKey: "CUS-005678" },
  { id: "TXN-20260308-002", date: "08.03.2026 08:10", type: "ATM Çekim", amount: 5000, currency: "TRY", score: 91, markStatus: "Marked", entityKey: "CUS-001234" },
  { id: "TXN-20260308-014", date: "08.03.2026 15:40", type: "POS", amount: 1250, currency: "TRY", score: 33, markStatus: "Unmarked", entityKey: "CUS-005678" },
];
// Recent external reviewer history for autocomplete
const RECENT_EXT_EMAILS = ["ali.vural@uyum.com","zehra.koc@sube.bank.com","murat.demir@operasyon.com","deniz.aydin@audit.com","serkan.yilmaz@compliance.com"];
const RECENT_EXT_NAMES = ["Ali Vural","Zehra Koç","Murat Demir","Deniz Aydın","Serkan Yılmaz"];
const NOTIFICATIONS = [
  { id: 1, text: "Ayşe Tan size #2470 vakasını incelemeniz için gönderdi", time: "14:00", read: false },
  { id: 2, text: "Vaka #2466 kapatma onayı bekleniyor", time: "11:05", read: false },
  { id: 3, text: "Vaka #2471 size atandı", time: "09:15", read: true },
];

// ═══════════════════════════════════════════════════════════════
// ICONS & CONSTANTS
// ═══════════════════════════════════════════════════════════════
const I = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  CaseCreate: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Cases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  MyCases: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  ChDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Edit: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Send: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Lock: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Upload: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Download: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Link: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Plus: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  User: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Review: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Approval: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Deleted: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  File: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Hierarchy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="14"/><circle cx="6" cy="19" r="3"/><circle cx="18" cy="19" r="3"/><line x1="12" y1="14" x2="6" y2="16"/><line x1="12" y1="14" x2="18" y2="16"/></svg>,
  Mail: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Globe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};
const C = { sidebar: "#0F172A", sidebarHover: "#1E293B", sidebarActive: "#1E40AF", primary: "#1E40AF", primaryLight: "#3B82F6", accent: "#F59E0B", bg: "#F1F5F9", card: "#FFFFFF", text: "#0F172A", textSecondary: "#64748B", border: "#E2E8F0", success: "#059669", warning: "#D97706", danger: "#DC2626" };
const fmt = (a, c = "TRY") => `${{ TRY: "₺", USD: "$", EUR: "€" }[c] || ""}${a.toLocaleString("tr-TR")}`;

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function SCMCaseDetail({ onNavigate } = {}) {
  const [currentRole, setCurrentRole] = useState("analyst");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("cases");
  const [casesExpanded, setCasesExpanded] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("Payment Fraud");
  const [showNotifPanel, setShowNotifPanel] = useState(false);


  const [caseData, setCaseData] = useState({ ...CASE_DATA });
  const [activeTab, setActiveTab] = useState("entities");
  const [entityFilter, setEntityFilter] = useState("customers");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: CASE_DATA.name, severity: CASE_DATA.severity, description: CASE_DATA.description });

  // Fraud distribution
  const [bankShareVal, setBankShareVal] = useState(CASE_DATA.bankShare);
  const [customerShareVal, setCustomerShareVal] = useState(CASE_DATA.customerShare);
  const remainder = Math.max(0, caseData.totalAmount - bankShareVal - customerShareVal);
  const bankPct = caseData.totalAmount > 0 ? (bankShareVal / caseData.totalAmount) * 100 : 0;
  const custPct = caseData.totalAmount > 0 ? (customerShareVal / caseData.totalAmount) * 100 : 0;
  const remPct = 100 - bankPct - custPct;

  // Modals
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closeComment, setCloseComment] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRelateModal, setShowRelateModal] = useState(false);
  const [showAddTxnModal, setShowAddTxnModal] = useState(false);
  const [relateError, setRelateError] = useState("");
  const [relateMode, setRelateMode] = useState("alt"); // "alt" | "ust" | "kardes"
  const [selectedRelateCase, setSelectedRelateCase] = useState(null);

  // Review
  const [reviewMode, setReviewMode] = useState("internal");
  const [reviewSearchQ, setReviewSearchQ] = useState("");
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [reviewNote, setReviewNote] = useState("");
  const [extName, setExtName] = useState("");
  const [extEmail, setExtEmail] = useState("");
  const [showExtEmailSugg, setShowExtEmailSugg] = useState(false);
  const [showExtNameSugg, setShowExtNameSugg] = useState(false);
  const [reviewDetailData, setReviewDetailData] = useState(null);

  // Relate filters
  const [relateCaseFilter, setRelateCaseFilter] = useState("");
  const [relateStatusFilter, setRelateStatusFilter] = useState("all");

  // Txn modal filters
  const [txnSearch, setTxnSearch] = useState("");
  const [txnMarkFilter, setTxnMarkFilter] = useState("all");
  const [txnTypeFilter, setTxnTypeFilter] = useState("all");
  const [txnDateFrom, setTxnDateFrom] = useState("");
  const [txnDateTo, setTxnDateTo] = useState("");
  const [selectedTxns, setSelectedTxns] = useState(new Set());

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(CASE_COMMENTS);
  const [attachments, setAttachments] = useState(CASE_ATTACHMENTS);
  const [toast, setToast] = useState(null);

  const user = USERS[currentRole];
  const isOwner = user.id === caseData.ownerId;
  const canClose = caseData.status === "Open";
  const canDelete = caseData.status === "Open";
  const canReview = isOwner && caseData.status === "Open";
  const showToast = (t, m) => { setToast({ type: t, msg: m }); setTimeout(() => setToast(null), 4000); };

  const handleCloseCase = () => { if (!closeReason || !closeComment.trim()) return; setCaseData(d => ({ ...d, status: "Pending Closure" })); showToast("info", "Kapatma isteği gönderildi."); setShowCloseModal(false); setCloseReason(""); setCloseComment(""); };
  const handleDeleteComment = (id) => { setComments(p => p.filter(c => c.id !== id)); showToast("success", "Yorum silindi."); };
  const handleDeleteAttachment = (id) => { setAttachments(p => p.filter(a => a.id !== id)); showToast("success", "Dosya kaldırıldı."); };
  const resetReview = () => { setShowReviewModal(false); setSelectedReviewers([]); setReviewNote(""); setReviewSearchQ(""); setExtEmail(""); setExtName(""); setReviewMode("internal"); };
  const handleSendReview = () => { if (reviewMode === "internal") { if (!selectedReviewers.length) return; showToast("success", `İnceleme ${selectedReviewers.length} kişiye gönderildi.`); } else { if (!extEmail || !extName) return; showToast("success", `Davet ${extEmail} adresine gönderildi.`); } resetReview(); };
  const handleAddComment = () => { if (!newComment.trim()) return; const n = new Date(); setComments(p => [...p, { id: p.length + 1, user: user.name, date: `${String(n.getDate()).padStart(2,"0")}.${String(n.getMonth()+1).padStart(2,"0")}.${n.getFullYear()} ${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`, text: newComment, fromReview: false }]); setNewComment(""); showToast("success", "Yorum eklendi."); };
  const handleSaveEdit = () => { setCaseData(d => ({ ...d, ...editForm })); setIsEditing(false); showToast("success", "Vaka güncellendi."); };
  const handleSaveFraud = () => { setCaseData(d => ({ ...d, bankShare: bankShareVal, customerShare: customerShareVal })); showToast("success", "Dağılım güncellendi."); };
  const handleAddTxns = () => { if (!selectedTxns.size) return; showToast("success", `${selectedTxns.size} işlem eklendi.`); setShowAddTxnModal(false); setSelectedTxns(new Set()); setTxnSearch(""); setTxnMarkFilter("all"); setTxnTypeFilter("all"); setTxnDateFrom(""); setTxnDateTo(""); };

  const sW = sidebarCollapsed ? 64 : 260;
  const subItems = [{ key: "my_cases", label: "Vakalarım", icon: <I.MyCases />, badge: 14 },{ key: "review_sent", label: "İncelemem İçin Gönderilenler", icon: <I.Review />, badge: 3 },{ key: "pending_approvals", label: "Onay Bekleyenler", icon: <I.Approval />, badge: 2 },{ key: "deleted_cases", label: "Silinmiş Vakalar", icon: <I.Deleted />, badge: 0 }];
  const navItems = [{ key: "dashboard", label: "Dashboard", sublabel: "Ana Sayfa", icon: <I.Dashboard /> },{ key: "case_creation", label: "Vaka Oluşturma", sublabel: "Case Creation", icon: <I.CaseCreate /> },{ key: "cases", label: "Vaka Listesi", sublabel: "Case List", icon: <I.Cases />, expandable: true },{ key: "reports", label: "Raporlar", sublabel: "Reports", icon: <I.Reports /> },...(currentRole === "admin" ? [{ key: "settings", label: "Ayarlar", sublabel: "Settings", icon: <I.Settings /> }] : [])];
  const tabs = [{ key: "entities", label: "Varlıklar" },{ key: "comments", label: "Yorumlar", badge: comments.length },{ key: "attachments", label: "Ekler", badge: attachments.length },{ key: "history", label: "Geçmiş" },{ key: "transactions", label: "İşlemler", badge: CASE_TRANSACTIONS.length },{ key: "related", label: "İlişkili Vakalar", badge: RELATED_CASES.length }];
  const filteredExtEmails = RECENT_EXT_EMAILS.filter(e => !extEmail || e.toLowerCase().includes(extEmail.toLowerCase()));
  const filteredExtNames = RECENT_EXT_NAMES.filter(n => !extName || n.toLowerCase().includes(extName.toLowerCase()));
  const filteredTxns = AVAILABLE_TRANSACTIONS.filter(t => { if (txnSearch && !t.id.toLowerCase().includes(txnSearch.toLowerCase()) && !t.entityKey.toLowerCase().includes(txnSearch.toLowerCase())) return false; if (txnMarkFilter !== "all" && t.markStatus !== txnMarkFilter) return false; if (txnTypeFilter !== "all" && t.type !== txnTypeFilter) return false; return true; });
  const filteredCases = ALL_CASES_FOR_LINK.filter(c => { if (relateCaseFilter && !String(c.id).includes(relateCaseFilter) && !c.name.toLowerCase().includes(relateCaseFilter.toLowerCase())) return false; if (relateStatusFilter !== "all" && c.status !== relateStatusFilter) return false; return true; });

  const ss = { btn: { display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", transition: "all .15s", border: "none" } };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans',sans-serif", background: C.bg, overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        *{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:#CBD5E1 transparent} *::-webkit-scrollbar{width:6px} *::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
        input:focus,textarea:focus,select:focus{outline:2px solid ${C.primaryLight};outline-offset:-1px}`}</style>

      {/* ── Sidebar ── */}
      <aside style={{ width: sW, minWidth: sW, height: "100vh", background: C.sidebar, display: "flex", flexDirection: "column", transition: "all .25s cubic-bezier(.4,0,.2,1)", zIndex: 50 }}>
        <div style={{ padding: sidebarCollapsed ? "20px 12px" : "20px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {!sidebarCollapsed && <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}><div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${C.primaryLight},${C.primary})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>S</div><div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>SADE SCM</div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>v1.0.0</div></div></div>}
          <button onClick={() => setSidebarCollapsed(v => !v)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4, display: "flex" }}><I.Menu /></button>
        </div>
        {/* Domain Selector */}
        {!sidebarCollapsed && <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Alan Seçimi</div>
          <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: C.sidebarHover, color: "#fff", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {navItems.map(item => <div key={item.key}>
            <button onClick={() => { setActiveNav(item.key); if (item.expandable) setCasesExpanded(v => !v); if (onNavigate && !item.expandable) onNavigate(item.key); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: sidebarCollapsed ? "10px" : "10px 14px", borderRadius: 8, border: "none", background: activeNav === item.key ? C.sidebarActive : "transparent", color: activeNav === item.key ? "#fff" : "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 13.5, fontWeight: activeNav === item.key ? 600 : 400, fontFamily: "'DM Sans',sans-serif", justifyContent: sidebarCollapsed ? "center" : "flex-start", marginBottom: 2 }}
              onMouseEnter={e => { if (activeNav !== item.key) e.currentTarget.style.background = C.sidebarHover; }} onMouseLeave={e => { if (activeNav !== item.key) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ display: "flex", flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && <><div style={{ flex: 1, textAlign: "left" }}><div>{item.label}</div><div style={{ fontSize: 10, opacity: 0.5 }}>{item.sublabel}</div></div>{item.expandable && <span style={{ display: "flex", transition: "transform .2s", transform: casesExpanded ? "rotate(0)" : "rotate(-90deg)" }}><I.ChDown /></span>}</>}
            </button>
            {item.expandable && casesExpanded && !sidebarCollapsed && <div style={{ marginLeft: 20, borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 12, marginTop: 2, marginBottom: 4 }}>
              {subItems.map(s => <button key={s.key} onClick={() => { setActiveNav(s.key); if (onNavigate) onNavigate(s.key); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", background: activeNav === s.key ? "rgba(59,130,246,0.15)" : "transparent", color: activeNav === s.key ? "#93C5FD" : "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", marginBottom: 1 }}
                onMouseEnter={e => { if (activeNav !== s.key) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }} onMouseLeave={e => { if (activeNav !== s.key) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ display: "flex", flexShrink: 0 }}>{s.icon}</span><span style={{ flex: 1, textAlign: "left" }}>{s.label}</span>
                {s.badge > 0 && <span style={{ background: "rgba(59,130,246,0.2)", color: "#93C5FD", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10 }}>{s.badge}</span>}
              </button>)}
            </div>}
          </div>)}
        </nav>
        {/* User section with notification */}
        {!sidebarCollapsed && <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${C.primaryLight},#7C3AED)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{user.name.split(" ").map(n => n[0]).join("")}</div>
            <div style={{ flex: 1 }}><div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>{user.name}</div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{user.roleLabel}</div></div>
            <button onClick={() => setShowNotifPanel(v => !v)} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: 4, display: "flex" }}>
              <I.Bell />{NOTIFICATIONS.filter(n => !n.read).length > 0 && <span style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, background: C.danger, borderRadius: "50%", fontSize: 8, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{NOTIFICATIONS.filter(n => !n.read).length}</span>}
            </button>
          </div>
          {showNotifPanel && <div style={{ marginTop: 10, background: C.sidebarHover, borderRadius: 8, padding: "8px 0", maxHeight: 180, overflowY: "auto" }}>
            {NOTIFICATIONS.map(n => <div key={n.id} style={{ padding: "8px 12px", fontSize: 11, color: n.read ? "rgba(255,255,255,0.4)" : "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)", lineHeight: 1.4 }}>
              {!n.read && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.primaryLight, marginRight: 6 }} />}{n.text}
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{n.time}</div>
            </div>)}
          </div>}
        </div>}
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 56, background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4 }}><I.Back /></button>
            <div><div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Vaka Detayı</div><div style={{ fontSize: 11, color: C.textSecondary, fontFamily: "'JetBrains Mono',monospace" }}>Case Overview — #{caseData.id}</div></div>
          </div>
          <select value={currentRole} onChange={e => setCurrentRole(e.target.value)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 500, background: "#F8FAFC", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", color: C.text }}>
            <option value="analyst">Fraud Analist</option><option value="manager">Yönetici</option><option value="admin">Admin</option>
          </select>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
          {/* ── Case Header ── */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px 28px", marginBottom: 20, animation: "slideUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 300 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${SEVERITY_CONFIG[caseData.severity]?.bg},${SEVERITY_CONFIG[caseData.severity]?.border})`, display: "flex", alignItems: "center", justifyContent: "center" }}><I.File /></div>
                  <div>
                    {isEditing ? <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ fontSize: 20, fontWeight: 700, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontFamily: "'DM Sans',sans-serif", width: 320 }} />
                    : <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{caseData.name}</h1>}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.textSecondary }}>#{caseData.id}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: STATUS_CONFIG[caseData.status]?.bg, color: STATUS_CONFIG[caseData.status]?.color, border: `1px solid ${STATUS_CONFIG[caseData.status]?.border}` }}>{caseData.status}</span>
                      {isEditing ? <select value={editForm.severity} onChange={e => setEditForm(f => ({ ...f, severity: e.target.value }))} style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px", fontFamily: "'DM Sans',sans-serif" }}>
                        {Object.entries(SEVERITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select> : <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: SEVERITY_CONFIG[caseData.severity]?.bg, color: SEVERITY_CONFIG[caseData.severity]?.color, border: `1px solid ${SEVERITY_CONFIG[caseData.severity]?.border}` }}>{SEVERITY_CONFIG[caseData.severity]?.label}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 16 }}>
                  {[{ l: "Oluşturan", v: caseData.createUser, i: <I.User /> },{ l: "Oluşturma Tarihi", v: `${caseData.createDate} ${caseData.createTime}`, i: <I.Clock /> },{ l: "Son Güncelleyen", v: caseData.updateUser, i: <I.User /> },{ l: "Güncelleme Tarihi", v: `${caseData.updateDate} ${caseData.updateTime}`, i: <I.Clock /> },{ l: "Atanan Kişi", v: caseData.owner || "Atanmamış" }].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      {item.i && <span style={{ color: C.textSecondary, marginTop: 2, display: "flex" }}>{item.i}</span>}
                      <div><div style={{ fontSize: 10, color: C.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.l}</div><div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>{item.v}</div></div>
                    </div>))}
                </div>
                {/* Editable description */}
                {isEditing ? <div style={{ marginTop: 14 }}><label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 500, display: "block", marginBottom: 4 }}>Açıklama</label><textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", resize: "vertical", minHeight: 60 }} /></div>
                : caseData.description && <div style={{ marginTop: 14, padding: "10px 14px", background: "#FAFBFD", borderRadius: 8, border: `1px solid ${C.border}` }}><div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 3 }}>Açıklama</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{caseData.description}</div></div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, minWidth: 300 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {isEditing ? <>
                    <button onClick={handleSaveEdit} style={{ ...ss.btn, background: C.success, color: "#fff" }}><I.Check /> Kaydet</button>
                    <button onClick={() => setIsEditing(false)} style={{ ...ss.btn, background: "#F1F5F9", color: C.textSecondary }}><I.X /> İptal</button>
                  </> : <>
                    {canClose && <button onClick={() => setShowCloseModal(true)} style={{ ...ss.btn, background: C.primary, color: "#fff" }}><I.Lock /> Kapat</button>}
                    {canReview && <button onClick={() => setShowReviewModal(true)} style={{ ...ss.btn, background: "#7C3AED", color: "#fff" }}><I.Send /> İncelemeye Gönder</button>}
                    <button onClick={() => setIsEditing(true)} style={{ ...ss.btn, background: "#F8FAFC", color: C.text, border: `1px solid ${C.border}` }}><I.Edit /> Düzenle</button>
                    {canDelete && <button onClick={() => setShowDeleteModal(true)} style={{ ...ss.btn, background: "#FEF2F2", color: C.danger, border: "1px solid #FECACA" }}><I.Trash /> Sil</button>}
                  </>}
                </div>
                <div style={{ display: "flex", gap: 10, width: "100%" }}>
                  <div style={{ flex: 1, background: "#F8FAFC", borderRadius: 12, padding: "14px 18px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.textSecondary, fontWeight: 500, textTransform: "uppercase", marginBottom: 4 }}>Vaka Fraud Tutarı</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(caseData.totalAmount, caseData.currency)}</div>
                  </div>
                  {RELATED_CASES.length > 0 && <div style={{ flex: 1, background: "#F5F3FF", borderRadius: 12, padding: "14px 18px", border: "1px solid #DDD6FE" }}>
                    <div style={{ fontSize: 10, color: "#5B21B6", fontWeight: 500, textTransform: "uppercase", marginBottom: 4 }}>Konsolide Toplam</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#5B21B6", fontFamily: "'JetBrains Mono',monospace" }}>{fmt(CONSOLIDATED_AMOUNT, caseData.currency)}</div>
                    <div style={{ fontSize: 10, color: "#7C3AED", marginTop: 2 }}>{RELATED_CASES.length} ilişkili vaka dahil</div>
                  </div>}
                </div>
              </div>
            </div>

            {/* Fraud Distribution */}
            <div style={{ marginTop: 20, padding: "16px 20px", background: "#FAFBFD", borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Fraud Tutarı Dağılımı</div>
              <div style={{ height: 12, borderRadius: 6, display: "flex", overflow: "hidden", marginBottom: 12, background: "#E2E8F0" }}>
                {bankPct > 0 && <div style={{ width: `${bankPct}%`, background: "#1E40AF", transition: "width .3s" }} />}
                {custPct > 0 && <div style={{ width: `${custPct}%`, background: "#F59E0B", transition: "width .3s" }} />}
                {remPct > 0.5 && <div style={{ width: `${remPct}%`, background: "#CBD5E1", transition: "width .3s" }} />}
              </div>
              <div style={{ display: "flex", gap: 20, marginBottom: 14, fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#1E40AF" }} /><span style={{ color: C.textSecondary }}>Banka Payı</span><span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(bankShareVal, caseData.currency)}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#F59E0B" }} /><span style={{ color: C.textSecondary }}>Müşteri Payı</span><span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(customerShareVal, caseData.currency)}</span></div>
                {remainder > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#CBD5E1" }} /><span style={{ color: C.textSecondary }}>Belirlenmemiş</span><span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: C.warning }}>{fmt(remainder, caseData.currency)}</span></div>}
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160 }}><label style={{ fontSize: 11, color: "#1E40AF", fontWeight: 600, display: "block", marginBottom: 4 }}>Banka Payı</label><input type="number" min="0" max={caseData.totalAmount - customerShareVal} value={bankShareVal} onChange={e => setBankShareVal(Math.max(0, Math.min(parseInt(e.target.value)||0, caseData.totalAmount - customerShareVal)))} style={{ width: "100%", padding: "8px 12px", border: "1px solid #BFDBFE", borderRadius: 8, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, borderLeft: "3px solid #1E40AF" }} /></div>
                <div style={{ flex: 1, minWidth: 160 }}><label style={{ fontSize: 11, color: "#D97706", fontWeight: 600, display: "block", marginBottom: 4 }}>Müşteri Payı</label><input type="number" min="0" max={caseData.totalAmount - bankShareVal} value={customerShareVal} onChange={e => setCustomerShareVal(Math.max(0, Math.min(parseInt(e.target.value)||0, caseData.totalAmount - bankShareVal)))} style={{ width: "100%", padding: "8px 12px", border: "1px solid #FDE68A", borderRadius: 8, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, borderLeft: "3px solid #F59E0B" }} /></div>
                <div style={{ flex: 1, minWidth: 160 }}><label style={{ fontSize: 11, color: C.textSecondary, display: "block", marginBottom: 4 }}>Toplam</label><div style={{ padding: "8px 12px", background: "#E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{fmt(caseData.totalAmount, caseData.currency)}</div></div>
                <button onClick={handleSaveFraud} style={{ ...ss.btn, background: C.primary, color: "#fff" }}>Kaydet</button>
              </div>
            </div>

            {/* Reviews Status */}
            {PENDING_REVIEWS.length > 0 && <div style={{ marginTop: 16, padding: "12px 16px", background: "#F5F3FF", borderRadius: 8, border: "1px solid #DDD6FE" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#5B21B6", marginBottom: 8 }}>İnceleme Durumu</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {PENDING_REVIEWS.map(r => { const done = r.status === "completed"; return (
                  <div key={r.id} onClick={() => { if (done) setReviewDetailData(r); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#fff", borderRadius: 6, border: "1px solid #DDD6FE", cursor: done ? "pointer" : "default", transition: "all .15s" }}
                    onMouseEnter={e => { if (done) { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(124,58,237,.12)"; } }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#DDD6FE"; e.currentTarget.style.boxShadow = "none"; }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: done ? C.success : C.warning }} />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{r.reviewer}</span>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 6px", borderRadius: 4, background: done ? "#D1FAE5" : "#FEF3C7", color: done ? "#065F46" : "#92400E" }}>{done ? "Tamamlandı" : "Bekliyor"}</span>
                    {done && <I.ChRight />}
                  </div>); })}
              </div>
            </div>}
          </div>

          {/* ── Content Tabs ── */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, animation: "slideUp .4s ease" }}>
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, overflow: "auto" }}>
              {tabs.map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "14px 20px", border: "none", background: "transparent", borderBottom: activeTab === tab.key ? `2px solid ${C.primaryLight}` : "2px solid transparent", color: activeTab === tab.key ? C.primaryLight : C.textSecondary, fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{tab.label}</span>{tab.badge !== undefined && <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: activeTab === tab.key ? `${C.primaryLight}15` : "#F1F5F9", color: activeTab === tab.key ? C.primaryLight : C.textSecondary }}>{tab.badge}</span>}
              </button>)}
            </div>
            <div style={{ padding: "20px 24px", minHeight: 300 }}>
              {activeTab === "entities" && <EntitiesTab ef={entityFilter} setEf={setEntityFilter} />}
              {activeTab === "comments" && <CommentsTab comments={comments} nc={newComment} setNc={setNewComment} onAdd={handleAddComment} onDel={handleDeleteComment} cu={user.name} />}
              {activeTab === "attachments" && <AttachmentsTab att={attachments} onDel={handleDeleteAttachment} cu={user.name} />}
              {activeTab === "history" && <HistoryTab />}
              {activeTab === "transactions" && <TransactionsTab onAdd={() => setShowAddTxnModal(true)} />}
              {activeTab === "related" && <RelatedCasesTab onAdd={() => setShowRelateModal(true)} />}
            </div>
          </div>
          <div style={{ height: 40 }} />
        </main>
      </div>

      {/* ═══ MODALS ═══ */}
      {showCloseModal && <Mdl t="Vakayı Kapat" onClose={() => { setShowCloseModal(false); setCloseReason(""); setCloseComment(""); }}>
        <div style={{ fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}><strong>#{caseData.id} — {caseData.name}</strong> vakasını kapatmak istediğinize emin misiniz?</div>
        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Kapatma Nedeni *</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>{CLOSE_REASONS.map(r => <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1px solid ${closeReason === r ? C.primaryLight : C.border}`, background: closeReason === r ? `${C.primaryLight}08` : "#fff", cursor: "pointer" }}><input type="radio" name="cr" checked={closeReason === r} onChange={() => setCloseReason(r)} style={{ accentColor: C.primaryLight }} /><span style={{ fontSize: 13, fontWeight: closeReason === r ? 600 : 400 }}>{r}</span></label>)}</div>
        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Kapatma Yorumu *</label>
        <textarea value={closeComment} onChange={e => setCloseComment(e.target.value)} placeholder="Kapatma gerekçenizi detaylı açıklayın..." style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", resize: "vertical", minHeight: 80, marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><MBtn l="İptal" onClick={() => setShowCloseModal(false)} /><MBtn l="Onay İsteği Gönder" p disabled={!closeReason || !closeComment.trim()} onClick={handleCloseCase} /></div>
      </Mdl>}

      {/* Combined Review */}
      {showReviewModal && <Mdl t="İncelemeye Gönder" onClose={resetReview} w={560}>
        <div style={{ display: "flex", marginBottom: 20, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
          {[{ k: "internal", l: "Sistem İçi", ic: <I.User /> },{ k: "external", l: "Dış İncelemeci", ic: <I.Mail /> }].map(m => <button key={m.k} onClick={() => setReviewMode(m.k)} style={{ flex: 1, padding: "10px 16px", border: "none", background: reviewMode === m.k ? C.primary : "#fff", color: reviewMode === m.k ? "#fff" : C.textSecondary, fontSize: 13, fontWeight: reviewMode === m.k ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{m.ic} {m.l}</button>)}
        </div>
        {reviewMode === "internal" ? <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Reviewer Seçimi *</label>
          <input placeholder="Ad veya e-posta ile ara..." value={reviewSearchQ} onChange={e => setReviewSearchQ(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, marginBottom: 8 }} />
          {selectedReviewers.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>{selectedReviewers.map(r => <span key={r.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: `${C.primaryLight}12`, color: C.primaryLight, fontSize: 12, fontWeight: 500, border: `1px solid ${C.primaryLight}30` }}>{r.name}<button onClick={() => setSelectedReviewers(p => p.filter(x => x.id !== r.id))} style={{ background: "none", border: "none", cursor: "pointer", color: C.primaryLight, display: "flex", padding: 0 }}><I.X /></button></span>)}</div>}
          <div style={{ maxHeight: 180, overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
            {ACTIVE_USERS.filter(u => u.id !== user.id && (!reviewSearchQ || u.name.toLowerCase().includes(reviewSearchQ.toLowerCase()) || u.email.toLowerCase().includes(reviewSearchQ.toLowerCase()))).map(u => { const sel = selectedReviewers.some(s => s.id === u.id); return <div key={u.id} onClick={() => { if (sel) setSelectedReviewers(p => p.filter(x => x.id !== u.id)); else setSelectedReviewers(p => [...p, u]); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${C.border}`, background: sel ? `${C.primaryLight}06` : "#fff" }} onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#F8FAFC"; }} onMouseLeave={e => { e.currentTarget.style.background = sel ? `${C.primaryLight}06` : "#fff"; }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: sel ? C.primaryLight : "#E2E8F0", color: sel ? "#fff" : C.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>{u.name.split(" ").map(n => n[0]).join("")}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div><div style={{ fontSize: 11, color: C.textSecondary }}>{u.role} • {u.email}</div></div>
              {sel && <span style={{ color: C.primaryLight }}><I.Check /></span>}
            </div>; })}
          </div>
        </div> : <div style={{ marginBottom: 16 }}>
          {/* External: Name first, then email with autocomplete */}
          <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Ad Soyad *</label>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <input value={extName} onChange={e => { setExtName(e.target.value); setShowExtNameSugg(true); }} onFocus={() => setShowExtNameSugg(true)} onBlur={() => setTimeout(() => setShowExtNameSugg(false), 200)} placeholder="Davet edilen kişinin adı" style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }} />
            {showExtNameSugg && filteredExtNames.length > 0 && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,.08)", zIndex: 10, maxHeight: 140, overflow: "auto" }}>
              {filteredExtNames.map(n => <div key={n} onMouseDown={() => { setExtName(n); setShowExtNameSugg(false); const idx = RECENT_EXT_NAMES.indexOf(n); if (idx >= 0) setExtEmail(RECENT_EXT_EMAILS[idx]); }} style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", borderBottom: `1px solid ${C.border}` }} onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>{n}</div>)}
            </div>}
          </div>
          <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>E-posta Adresi *</label>
          <div style={{ position: "relative" }}>
            <input type="email" value={extEmail} onChange={e => { setExtEmail(e.target.value); setShowExtEmailSugg(true); }} onFocus={() => setShowExtEmailSugg(true)} onBlur={() => setTimeout(() => setShowExtEmailSugg(false), 200)} placeholder="ornek@sirket.com" style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }} />
            {showExtEmailSugg && filteredExtEmails.length > 0 && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,.08)", zIndex: 10, maxHeight: 140, overflow: "auto" }}>
              {filteredExtEmails.map(e => <div key={e} onMouseDown={() => { setExtEmail(e); setShowExtEmailSugg(false); }} style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", borderBottom: `1px solid ${C.border}` }} onMouseEnter={ev => ev.currentTarget.style.background = "#F8FAFC"} onMouseLeave={ev => ev.currentTarget.style.background = "#fff"}>{e}</div>)}
            </div>}
          </div>
        </div>}
        <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>İnceleme Notu</label><textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="İncelemenin nedenini açıklayın..." style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", resize: "vertical", minHeight: 80 }} /></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><MBtn l="İptal" onClick={resetReview} /><MBtn l={reviewMode === "internal" ? `İncelemeye Gönder${selectedReviewers.length ? ` (${selectedReviewers.length})` : ""}` : "Davet Gönder"} p disabled={reviewMode === "internal" ? !selectedReviewers.length : !extEmail || !extName} onClick={handleSendReview} bg="#7C3AED" /></div>
      </Mdl>}

      {/* Delete */}
      {showDeleteModal && <Mdl t="Vakayı Sil" onClose={() => setShowDeleteModal(false)}>
        <div style={{ padding: "14px 16px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.danger, marginBottom: 6 }}>Bu vakayı silmek istediğinize emin misiniz?</div>
          <div style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.5 }}><strong>#{caseData.id} — {caseData.name}</strong> vakası silinmek üzere işaretlenecektir. Bu işlem için yönetici onayı gereklidir.</div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><MBtn l="İptal" onClick={() => setShowDeleteModal(false)} /><MBtn l="Silme Talebi Gönder" bg={C.danger} p onClick={() => { setShowDeleteModal(false); showToast("info", "Silme talebi gönderildi."); }} /></div>
      </Mdl>}

      {/* Relate — only child (Alt Vaka) */}
      {/* Relate Modal — visual tree preview */}
      {showRelateModal && <Mdl t="Vaka İlişkilendir" onClose={() => { setShowRelateModal(false); setRelateError(""); setSelectedRelateCase(null); setRelateMode("alt"); }} w={620}>
        {/* ── Relationship Type Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { k: "ust", label: "Üst Vaka Ata", desc: "Seçilen vaka bu vakanın üstüne yerleşir", icon: "↑", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
            { k: "alt", label: "Alt Vaka Ekle", desc: "Seçilen vaka bu vakanın altına yerleşir", icon: "↓", color: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE" },
            { k: "kardes", label: "Kardeş Vaka", desc: "İki vaka eş düzeyde bağlanır", icon: "↔", color: "#059669", bg: "#F0FDF4", border: "#BBF7D0" },
          ].map(m => (
            <button key={m.k} onClick={() => { setRelateMode(m.k); setRelateError(""); setSelectedRelateCase(null); }}
              style={{ padding: "14px 10px", borderRadius: 10, border: `2px solid ${relateMode === m.k ? m.color : C.border}`, background: relateMode === m.k ? m.bg : "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "center", transition: "all .15s" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: relateMode === m.k ? m.color : C.text }}>{m.label}</div>
              <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 2, lineHeight: 1.3 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* ── Visual Preview ── */}
        {selectedRelateCase && (() => {
          const cur = { id: caseData.id, name: caseData.name };
          const sel = selectedRelateCase;
          const parentCase = relateMode === "ust" ? sel : cur;
          const childCase = relateMode === "ust" ? cur : sel;
          const isSibling = relateMode === "kardes";
          const nodeStyle = (isHighlight, color) => ({ padding: "8px 14px", borderRadius: 8, border: `2px solid ${isHighlight ? color : C.border}`, background: isHighlight ? `${color}08` : "#fff", display: "flex", alignItems: "center", gap: 8, minWidth: 0 });
          const labelStyle = { fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.5px" };
          return (
            <div style={{ padding: "16px", background: "#FAFBFD", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>İlişki Önizleme</div>
              {isSibling ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                  <div style={nodeStyle(true, "#059669")}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: C.primaryLight }}>#{cur.id}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{cur.name}</span>
                    <span style={{ ...labelStyle, background: "#EFF6FF", color: "#1E40AF" }}>Mevcut</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ fontSize: 18, color: "#059669" }}>⟷</div>
                    <div style={{ fontSize: 9, color: "#059669", fontWeight: 600 }}>Kardeş</div>
                  </div>
                  <div style={nodeStyle(true, "#059669")}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: C.primaryLight }}>#{sel.id}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{sel.name}</span>
                    <span style={{ ...labelStyle, background: "#F0FDF4", color: "#059669" }}>Seçilen</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={nodeStyle(relateMode === "ust", "#7C3AED")}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: C.primaryLight }}>#{parentCase.id}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{parentCase.name}</span>
                    <span style={{ ...labelStyle, background: parentCase.id === cur.id ? "#EFF6FF" : "#F5F3FF", color: parentCase.id === cur.id ? "#1E40AF" : "#7C3AED" }}>{parentCase.id === cur.id ? "Mevcut" : "Seçilen"}</span>
                    <span style={{ ...labelStyle, background: "#F5F3FF", color: "#7C3AED" }}>Üst Vaka</span>
                  </div>
                  <div style={{ width: 2, height: 20, background: C.border, position: "relative" }}>
                    <div style={{ position: "absolute", bottom: -4, left: -3, width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `6px solid ${C.border}` }} />
                  </div>
                  <div style={nodeStyle(relateMode === "alt", "#1E40AF")}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: C.primaryLight }}>#{childCase.id}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{childCase.name}</span>
                    <span style={{ ...labelStyle, background: childCase.id === cur.id ? "#EFF6FF" : "#F5F3FF", color: childCase.id === cur.id ? "#1E40AF" : "#7C3AED" }}>{childCase.id === cur.id ? "Mevcut" : "Seçilen"}</span>
                    <span style={{ ...labelStyle, background: "#EFF6FF", color: "#1E40AF" }}>Alt Vaka</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Depth warning for hierarchical ── */}
        {relateMode !== "kardes" && <div style={{ padding: "8px 12px", background: "#F8FAFC", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, color: C.textSecondary, lineHeight: 1.5, marginBottom: 12 }}>
          Üst-alt vaka hiyerarşisi en fazla <strong style={{ color: C.text }}>3 seviye</strong> derinliğe izin verir.
        </div>}

        {relateError && <div style={{ marginBottom: 12, padding: "10px 14px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA", color: C.danger, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}><I.Alert /> {relateError}</div>}

        {/* ── Case List ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input value={relateCaseFilter} onChange={e => setRelateCaseFilter(e.target.value)} placeholder="Vaka ID veya isim ile ara..." style={{ flex: 1, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }} />
          <select value={relateStatusFilter} onChange={e => setRelateStatusFilter(e.target.value)} style={{ padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, background: "#fff" }}>
            <option value="all">Tüm Durumlar</option><option value="Open">Open</option><option value="Closed">Closed</option>
          </select>
        </div>
        <div style={{ maxHeight: 220, overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
          {filteredCases.map(c => {
            const mx = 3, cur = 2;
            const blocked = relateMode === "alt" ? (cur + 1 + c.altSeviyeSayisi) > mx : relateMode === "ust" ? (c.altSeviyeSayisi + 1 + cur) > mx : false;
            const isSelected = selectedRelateCase?.id === c.id;
            return (
            <div key={c.id} onClick={() => { if (blocked) { setRelateError(`Vaka #${c.id} ile ilişki kurulamaz: maksimum hiyerarşi derinliğini (${mx} seviye) aşar.`); return; } setSelectedRelateCase({ id: c.id, name: c.name }); setRelateError(""); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: blocked ? "not-allowed" : "pointer", borderBottom: `1px solid ${C.border}`, opacity: blocked ? 0.45 : 1, background: isSelected ? `${C.primaryLight}08` : "#fff", borderLeft: isSelected ? `3px solid ${C.primaryLight}` : "3px solid transparent" }}
              onMouseEnter={e => { if (!blocked && !isSelected) e.currentTarget.style.background = "#F8FAFC"; }} onMouseLeave={e => { e.currentTarget.style.background = isSelected ? `${C.primaryLight}08` : "#fff"; }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.primaryLight, fontWeight: 600 }}>#{c.id}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{c.name}</span>
              {relateMode !== "kardes" && c.altSeviyeSayisi > 0 && <span style={{ fontSize: 10, color: C.warning, padding: "1px 6px", borderRadius: 4, background: "#FEF3C7", border: "1px solid #FDE68A" }}>{c.altSeviyeSayisi} alt seviye</span>}
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: STATUS_CONFIG[c.status]?.bg, color: STATUS_CONFIG[c.status]?.color }}>{c.status}</span>
              {blocked && <span style={{ fontSize: 10, color: C.danger }}>⚠</span>}
              {isSelected && <span style={{ color: C.primaryLight }}><I.Check /></span>}
            </div>); })}
          {filteredCases.length === 0 && <div style={{ padding: 20, textAlign: "center", color: C.textSecondary, fontSize: 13 }}>Sonuç bulunamadı</div>}
        </div>

        {/* ── Confirm ── */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <MBtn l="İptal" onClick={() => { setShowRelateModal(false); setRelateError(""); setSelectedRelateCase(null); setRelateMode("alt"); }} />
          <MBtn l={relateMode === "ust" ? "Üst Vaka Olarak Ata" : relateMode === "alt" ? "Alt Vaka Olarak Ekle" : "Kardeş Vaka Olarak Bağla"} p disabled={!selectedRelateCase} onClick={() => {
            if (!selectedRelateCase) return;
            const msg = relateMode === "ust" ? `#${selectedRelateCase.id} üst vaka olarak atandı.` : relateMode === "alt" ? `#${selectedRelateCase.id} alt vaka olarak eklendi.` : `#${selectedRelateCase.id} kardeş vaka olarak bağlandı.`;
            setShowRelateModal(false); setRelateCaseFilter(""); setRelateStatusFilter("all"); setRelateError(""); setSelectedRelateCase(null); setRelateMode("alt"); showToast("success", msg);
          }} bg={relateMode === "ust" ? "#7C3AED" : relateMode === "alt" ? "#1E40AF" : "#059669"} />
        </div>
      </Mdl>}

      {/* Add Transaction */}
      {showAddTxnModal && <Mdl t="İşlem Ekle" onClose={() => { setShowAddTxnModal(false); setSelectedTxns(new Set()); setTxnSearch(""); setTxnMarkFilter("all"); setTxnTypeFilter("all"); setTxnDateFrom(""); setTxnDateTo(""); }} w={700}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <input value={txnSearch} onChange={e => setTxnSearch(e.target.value)} placeholder="İşlem ID, müşteri no ile arayın..." style={{ flex: 1, minWidth: 180, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }} />
          <select value={txnMarkFilter} onChange={e => setTxnMarkFilter(e.target.value)} style={{ padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, background: "#fff" }}>
            <option value="all">Tüm Durumlar</option><option value="Marked">İşaretli</option><option value="Unmarked">İşaretsiz</option>
          </select>
          <select value={txnTypeFilter} onChange={e => setTxnTypeFilter(e.target.value)} style={{ padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, background: "#fff" }}>
            <option value="all">Tüm Türler</option><option value="Havale">Havale</option><option value="EFT">EFT</option><option value="Kredi Kartı">Kredi Kartı</option><option value="ATM Çekim">ATM Çekim</option><option value="Online Ödeme">Online Ödeme</option><option value="POS">POS</option>
          </select>
          <input type="date" value={txnDateFrom} onChange={e => setTxnDateFrom(e.target.value)} placeholder="Tarih başlangıç" style={{ padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
          <input type="date" value={txnDateTo} onChange={e => setTxnDateTo(e.target.value)} placeholder="Tarih bitiş" style={{ padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
        </div>
        {selectedTxns.size > 0 && <div style={{ marginBottom: 8, padding: "6px 12px", background: `${C.primaryLight}08`, borderRadius: 6, fontSize: 12, color: C.primaryLight, fontWeight: 600 }}>{selectedTxns.size} işlem seçildi</div>}
        <div style={{ maxHeight: 320, overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["","İşlem ID","Tarih","Tür","Tutar","Skor","Durum"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, background: "#FAFBFD", position: "sticky", top: 0 }}>{h}</th>)}</tr></thead>
            <tbody>{filteredTxns.map(t => { const sel = selectedTxns.has(t.id); return <tr key={t.id} onClick={() => { const n = new Set(selectedTxns); if (sel) n.delete(t.id); else n.add(t.id); setSelectedTxns(n); }} style={{ cursor: "pointer", background: sel ? `${C.primaryLight}06` : "#fff" }} onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#F8FAFC"; }} onMouseLeave={e => { e.currentTarget.style.background = sel ? `${C.primaryLight}06` : "#fff"; }}>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, width: 36 }}><input type="checkbox" checked={sel} readOnly style={{ accentColor: C.primaryLight }} /></td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, color: C.primaryLight }}>{t.id}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{t.date}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{t.type}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600 }}>{fmt(t.amount, t.currency)}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{t.score}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}><span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: t.markStatus === "Marked" ? "#FEE2E2" : "#F3F4F6", color: t.markStatus === "Marked" ? "#991B1B" : "#374151" }}>{t.markStatus === "Marked" ? "İşaretli" : "İşaretsiz"}</span></td>
            </tr>; })}{filteredTxns.length === 0 && <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: C.textSecondary, fontSize: 13, borderBottom: `1px solid ${C.border}` }}>Sonuç bulunamadı</td></tr>}</tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}><MBtn l="İptal" onClick={() => { setShowAddTxnModal(false); setSelectedTxns(new Set()); }} /><MBtn l={`Vakaya Ekle (${selectedTxns.size})`} p disabled={!selectedTxns.size} onClick={handleAddTxns} /></div>
      </Mdl>}

      {/* Review Detail Drawer */}
      {reviewDetailData && <>
        <div onClick={() => setReviewDetailData(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 500, animation: "fadeIn .2s" }} />
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, background: "#fff", zIndex: 501, boxShadow: "-8px 0 30px rgba(0,0,0,.12)", display: "flex", flexDirection: "column", animation: "slideIn .25s" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>İnceleme Detayı</h3><span style={{ fontSize: 12, color: C.textSecondary }}>{reviewDetailData.reviewer}</span></div>
            <button onClick={() => setReviewDetailData(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4 }}><I.X /></button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {[{ l: "İncelemeci", v: reviewDetailData.reviewer },{ l: "Durum", v: <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: "#D1FAE5", color: "#065F46" }}>Tamamlandı</span> },{ l: "Gönderilme", v: reviewDetailData.sentDate },{ l: "Tamamlanma", v: reviewDetailData.completedDate }].map((it, i) => <div key={i}><div style={{ fontSize: 10, color: C.textSecondary, fontWeight: 500, textTransform: "uppercase", marginBottom: 2 }}>{it.l}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{it.v}</div></div>)}
            </div>
            {reviewDetailData.note && <div style={{ marginBottom: 20, padding: "14px 16px", background: "#F5F3FF", borderRadius: 10, border: "1px solid #DDD6FE" }}><div style={{ fontSize: 11, fontWeight: 600, color: "#5B21B6", marginBottom: 6 }}>İstek Notu</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{reviewDetailData.note}</div></div>}
            {reviewDetailData.responseComment && <div style={{ marginBottom: 20, padding: "14px 16px", background: "#F0FDF4", borderRadius: 10, border: "1px solid #BBF7D0" }}><div style={{ fontSize: 11, fontWeight: 600, color: "#166534", marginBottom: 6 }}>İnceleme Yorumu</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{reviewDetailData.responseComment}</div></div>}
            {reviewDetailData.responseAttachments?.length > 0 && <div><div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Eklenen Dosyalar</div>{reviewDetailData.responseAttachments.map((a, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#F8FAFC", borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6 }}><div style={{ width: 32, height: 32, borderRadius: 6, background: "#D1FAE5", color: "#065F46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{a.name.split(".").pop().toUpperCase()}</div><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 11, color: C.textSecondary }}>{a.size}</div></div><button style={{ background: "none", border: "none", cursor: "pointer", color: C.primaryLight, display: "flex", padding: 4 }}><I.Download /></button></div>)}</div>}
          </div>
        </div>
      </>}

      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, padding: "12px 20px", borderRadius: 10, background: toast.type === "success" ? "#065F46" : C.primary, color: "#fff", fontSize: 13, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.15)", animation: "slideUp .3s", display: "flex", alignItems: "center", gap: 8, maxWidth: 420 }}>{toast.type === "success" ? <I.Check /> : <I.Alert />}{toast.msg}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════
function Mdl({ t, children, onClose, w = 520 }) {
  return <><div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 500, animation: "fadeIn .2s" }} /><div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: w, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto", background: "#fff", borderRadius: 16, zIndex: 501, boxShadow: "0 20px 60px rgba(0,0,0,.15)", animation: "scaleIn .25s" }}><div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t}</h3><button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4 }}><I.X /></button></div><div style={{ padding: "20px 24px" }}>{children}</div></div></>;
}
function MBtn({ l, onClick, p, disabled, bg }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: "8px 20px", borderRadius: 8, border: p ? "none" : `1px solid ${C.border}`, background: disabled ? "#CBD5E1" : p ? (bg || C.primary) : "#fff", color: p ? "#fff" : C.text, fontSize: 13, fontWeight: p ? 600 : 500, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif" }}>{l}</button>;
}
const th = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${C.border}`, background: "#FAFBFD" };
const td = { padding: "10px 14px", fontSize: 13, color: C.text, borderBottom: `1px solid ${C.border}` };
const SPill = ({ s }) => { const c = s === "Active" ? { bg: "#D1FAE5", c: "#065F46", b: "#A7F3D0" } : { bg: "#FEE2E2", c: "#991B1B", b: "#FECACA" }; return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: c.bg, color: c.c, border: `1px solid ${c.b}` }}>{s === "Active" ? "Aktif" : "Bloke"}</span>; };
const ReviewBadge = () => <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE", marginLeft: 6 }}>İnceleme</span>;

function EntitiesTab({ ef, setEf }) {
  const fs = [{ k: "customers", l: "Müşteri" },{ k: "debitCards", l: "Banka Kartı" },{ k: "creditCards", l: "Kredi Kartı" }];
  return <div>
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>{fs.map(f => <button key={f.k} onClick={() => setEf(f.k)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${ef === f.k ? C.primaryLight : C.border}`, background: ef === f.k ? `${C.primaryLight}10` : "#fff", color: ef === f.k ? C.primaryLight : C.textSecondary, fontSize: 12, fontWeight: ef === f.k ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>{f.l}</button>)}</div>
    {(ef === "customers") && <div style={{ marginBottom: 20 }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><I.User /> Müşteriler ({CASE_ENTITIES.customers.length})</div><table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}><thead><tr>{["Müşteri No","Ad Soyad","Telefon","E-posta"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{CASE_ENTITIES.customers.map((c,i) => <tr key={i}><td style={{ ...td, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: C.primaryLight }}>{c.customerNo}</td><td style={td}>{c.name}</td><td style={{ ...td, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{c.phone}</td><td style={{ ...td, fontSize: 12 }}>{c.email}</td></tr>)}</tbody></table></div>}
    {(ef === "debitCards") && <div style={{ marginBottom: 20 }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Banka Kartları ({CASE_ENTITIES.debitCards.length})</div><table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}><thead><tr>{["Kart No","Kart Tipi","Son Kullanma","Durum"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{CASE_ENTITIES.debitCards.map((c,i) => <tr key={i}><td style={{ ...td, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600 }}>{c.cardNumber}</td><td style={td}>{c.cardType}</td><td style={td}>{c.expiryDate}</td><td style={td}><SPill s={c.status} /></td></tr>)}</tbody></table></div>}
    {(ef === "creditCards") && <div style={{ marginBottom: 20 }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Kredi Kartları ({CASE_ENTITIES.creditCards.length})</div><table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}><thead><tr>{["Kart No","Kart Tipi","Son Kullanma","Durum"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{CASE_ENTITIES.creditCards.map((c,i) => <tr key={i}><td style={{ ...td, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600 }}>{c.cardNumber}</td><td style={td}>{c.cardType}</td><td style={td}>{c.expiryDate}</td><td style={td}><SPill s={c.status} /></td></tr>)}</tbody></table></div>}
  </div>;
}

function CommentsTab({ comments, nc, setNc, onAdd, onDel, cu }) {
  return <div>
    <div style={{ marginBottom: 20 }}>{comments.map((c, i) => <div key={c.id} style={{ padding: "14px 16px", marginBottom: 8, borderRadius: 10, background: i % 2 === 0 ? "#FAFBFD" : "#fff", border: `1px solid ${c.fromReview ? "#DDD6FE" : C.border}`, animation: `slideUp .3s ease ${i * 0.05}s both` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 26, height: 26, borderRadius: "50%", background: c.fromReview ? "#7C3AED" : C.primaryLight, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{c.user.split(" ").map(n => n[0]).join("")}</div><span style={{ fontSize: 13, fontWeight: 600 }}>{c.user}</span>{c.fromReview && <ReviewBadge />}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.textSecondary, display: "flex", alignItems: "center", gap: 4 }}><I.Clock /> {c.date}</span>
          {c.user === cu && !c.fromReview && <button onClick={() => onDel(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4, borderRadius: 4 }} onMouseEnter={e => { e.currentTarget.style.color = C.danger; e.currentTarget.style.background = "#FEF2F2"; }} onMouseLeave={e => { e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = "none"; }}><I.Trash /></button>}
        </div>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, paddingLeft: 34 }}>{c.text}</div>
    </div>)}</div>
    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Yeni Yorum</div><textarea value={nc} onChange={e => setNc(e.target.value)} placeholder="Yorumunuzu yazın..." style={{ width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", resize: "vertical", minHeight: 80, marginBottom: 8 }} /><div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={onAdd} disabled={!nc.trim()} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: nc.trim() ? C.primary : "#CBD5E1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: nc.trim() ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}><I.Send /> Yorum Ekle</button></div></div>
  </div>;
}

function AttachmentsTab({ att, onDel, cu }) {
  const fc = { pdf: "#DC2626", docx: "#1E40AF", xlsx: "#059669" };
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{att.length} dosya</div><button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px dashed ${C.primaryLight}`, background: `${C.primaryLight}06`, color: C.primaryLight, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}><I.Upload /> Dosya Yükle</button></div>
    <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <thead><tr>{["Dosya Adı","Boyut","Yükleyen","Tarih",""].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
      <tbody>{att.map(a => { const ext = a.name.split(".").pop(); return <tr key={a.id}>
        <td style={td}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: 6, background: `${fc[ext] || C.textSecondary}12`, color: fc[ext] || C.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>{ext}</div><span style={{ fontWeight: 500 }}>{a.name}</span>{a.fromReview && <ReviewBadge />}</div></td>
        <td style={{ ...td, fontSize: 12, color: C.textSecondary }}>{a.size}</td><td style={{ ...td, fontSize: 12 }}>{a.uploader}</td><td style={{ ...td, fontSize: 12, color: C.textSecondary }}>{a.date}</td>
        <td style={{ ...td, textAlign: "right" }}><div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}><button style={{ background: "none", border: "none", cursor: "pointer", color: C.primaryLight, display: "flex", padding: 4 }}><I.Download /></button>{a.uploader === cu && !a.fromReview && <button onClick={() => onDel(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4, borderRadius: 4 }} onMouseEnter={e => { e.currentTarget.style.color = C.danger; e.currentTarget.style.background = "#FEF2F2"; }} onMouseLeave={e => { e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = "none"; }}><I.Trash /></button>}</div></td>
      </tr>; })}</tbody>
    </table>
  </div>;
}

function HistoryTab() {
  const ac = { "Vaka oluşturuldu": "#059669", "Vaka atandı": "#D97706", "Yorum eklendi": "#2563EB", "Dosya yüklendi": "#0891B2", "Review gönderildi": "#7C3AED", "Review tamamlandı": "#059669", "Önem derecesi güncellendi": "#DC2626" };
  return <div style={{ position: "relative", paddingLeft: 24 }}><div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: C.border }} />
    {CASE_HISTORY.map((h, i) => <div key={h.id} style={{ position: "relative", paddingBottom: 20, paddingLeft: 20, animation: `slideUp .3s ease ${i * 0.04}s both` }}>
      <div style={{ position: "absolute", left: -4, top: 4, width: 10, height: 10, borderRadius: "50%", background: ac[h.action] || C.textSecondary, border: "2px solid #fff", boxShadow: `0 0 0 2px ${ac[h.action] || C.textSecondary}30` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div><div style={{ fontSize: 13, fontWeight: 600, color: ac[h.action] || C.text }}>{h.action}</div><div style={{ fontSize: 12, marginTop: 2 }}>{h.detail}</div><div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{h.user}</div></div><span style={{ fontSize: 11, color: C.textSecondary, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}><I.Clock /> {h.date}</span></div>
    </div>)}
  </div>;
}

function TransactionsTab({ onAdd }) {
  const t2 = { padding: "10px 12px", fontSize: 12.5, color: C.text, borderBottom: `1px solid ${C.border}` };
  return <div>
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}><I.Plus /> İşlem Ekle</button></div>
    <div style={{ overflow: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <thead><tr>{["İşlem ID","Tarih","Tür","Tutar","Para Birimi","Fraud","Fraud Tutarı","Banka Payı","Müşteri Payı"].map(h => <th key={h} style={{ ...th, padding: "10px 12px", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
      <tbody>{CASE_TRANSACTIONS.map(t => <tr key={t.id}>
        <td style={{ ...t2, fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 600, color: C.primaryLight }}>{t.id}</td><td style={{ ...t2, fontSize: 12 }}>{t.date}</td><td style={t2}>{t.type}</td>
        <td style={{ ...t2, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(t.amount, t.currency)}</td><td style={t2}>{t.currency}</td>
        <td style={t2}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: t.fraudStatus ? "#FEE2E2" : "#D1FAE5", color: t.fraudStatus ? "#991B1B" : "#065F46" }}>{t.fraudStatus ? "Fraud" : "Temiz"}</span></td>
        <td style={{ ...t2, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: t.fraudAmount > 0 ? C.danger : C.textSecondary }}>{t.fraudAmount > 0 ? fmt(t.fraudAmount, t.currency) : "—"}</td>
        <td style={{ ...t2, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{t.bankShare > 0 ? fmt(t.bankShare, t.currency) : "—"}</td>
        <td style={{ ...t2, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{t.customerShare > 0 ? fmt(t.customerShare, t.currency) : "—"}</td>
      </tr>)}</tbody>
    </table></div>
  </div>;
}

function RelatedCasesTab({ onAdd }) {
  const rtc = { "Üst Vaka": { bg: "#F5F3FF", c: "#5B21B6", b: "#DDD6FE" }, "Alt Vaka": { bg: "#EFF6FF", c: "#1E40AF", b: "#BFDBFE" }, "Kardeş": { bg: "#F0FDF4", c: "#166534", b: "#BBF7D0" } };
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><I.Hierarchy /> {RELATED_CASES.length} ilişkili vaka</div><button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}><I.Plus /> İlişkili Vaka Ekle</button></div>
    {RELATED_CASES.length > 0 ? <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <thead><tr>{["Case ID","Vaka Adı","İlişki Türü","Durum","Fraud Tutarı","Oluşturma Tarihi",""].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
      <tbody>{RELATED_CASES.map(rc => { const r = rtc[rc.relationshipType] || rtc["Kardeş"]; return <tr key={rc.id}>
        <td style={{ ...td, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: C.primaryLight }}>#{rc.id}</td><td style={{ ...td, fontWeight: 500 }}>{rc.name}</td>
        <td style={td}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: r.bg, color: r.c, border: `1px solid ${r.b}` }}>{rc.relationshipType}</span></td>
        <td style={td}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: STATUS_CONFIG[rc.status]?.bg, color: STATUS_CONFIG[rc.status]?.color }}>{rc.status}</span></td>
        <td style={{ ...td, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600 }}>{fmt(rc.totalAmount, rc.currency)}</td>
        <td style={{ ...td, fontSize: 12, color: C.textSecondary }}>{rc.createDate}</td>
        <td style={{ ...td, textAlign: "right" }}><button style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 11, fontWeight: 500, padding: "4px 8px" }}>Kaldır</button></td>
      </tr>; })}</tbody>
    </table> : <div style={{ textAlign: "center", padding: "40px 20px", color: C.textSecondary }}><I.Link /><p style={{ marginTop: 8, fontSize: 13 }}>Henüz ilişkili vaka bulunmamaktadır.</p></div>}
  </div>;
}
