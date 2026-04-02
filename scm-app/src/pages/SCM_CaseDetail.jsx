import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";
import { comments as commentsApi, attachments as attachmentsApi, history as historyApi, reviews as reviewsApi, relations as relationsApi, transactions as txnsApi, fdm as fdmApi, cases as casesApi, approvals as approvalsApi, settings as settingsApi } from "../api/client";

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", roleLabel: "Fraud Analist" },
  manager: { id: 2, name: "Burak Şen", role: "manager", roleLabel: "Yönetici" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", roleLabel: "Admin" },
  super: { id: 4, name: "Toygun Baysal", role: "super", roleLabel: "Super Admin" },
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
const DOMAIN_LABEL_TO_ID = { "Payment Fraud": "payment", "Credit Card Fraud": "credit_card", "Application Fraud": "application", "Internal Fraud": "internal", "Account Takeover": "account_takeover" };
const STATUS_CONFIG = {
  Open: { label: "Open", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  Closed: { label: "Closed", bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  "Pending Closure": { label: "Pending Closure", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  "Pending Reopen": { label: "Pending Reopen", bg: "#EDE9FE", color: "#5B21B6", border: "#DDD6FE" },
  "Pending Delete": { label: "Pending Delete", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
};
const SEVERITY_CONFIG = {
  critical: { label: "Kritik", bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  high: { label: "Yüksek", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  medium: { label: "Orta", bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  low: { label: "Düşük", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
};
const CLOSE_REASONS = ["Soruşturma Tamamlandı","Çözüme Kavuşturuldu","Mükerrer","Yanlış Alarm","Yetersiz Kanıt","Diğer"];
const REOPEN_REASONS = ["Yeni Kanıt Bulundu","Soruşturma Eksik Kaldı","Hatalı Kapatma","Müşteri İtirazı","Ek İnceleme Gerekiyor","Diğer"];
const CASE_DATA = { id: 2470, name: "Çoklu Kanal Fraud", status: "Open", severity: "high", owner: "Elif Yılmaz", ownerId: 1, createUser: "Burak Şen", createDate: "06.03.2026", createTime: "09:15", updateUser: "Elif Yılmaz", updateDate: "07.03.2026", updateTime: "14:32", description: "Birden fazla kanaldan (ATM, internet bankacılığı ve mobil) gerçekleştirilen şüpheli işlemler. Müşteri hesabına yetkisiz erişim tespit edilmiştir.", totalAmount: 157200, currency: "TRY", bankShare: 94320, customerShare: 62880, transactions: null };
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
  { id: 5, action: "İnceleme talep edildi", user: "Elif Yılmaz", date: "07.03.2026 09:00", detail: "Mehmet Öz'e inceleme için gönderildi." },
  { id: 6, action: "İnceleme tamamlandı", user: "Mehmet Öz", date: "07.03.2026 10:00", detail: "İnceleme tamamlandı. Yorum ve dosya eklendi." },
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
  Unlock: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  File: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Hierarchy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="14"/><circle cx="6" cy="19" r="3"/><circle cx="18" cy="19" r="3"/><line x1="12" y1="14" x2="6" y2="16"/><line x1="12" y1="14" x2="18" y2="16"/></svg>,
  Mail: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Globe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  TransactionSearch: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  PlusCircle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  ArrowRightCircle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  MessageSquare: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  UploadCloud: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  AlertTriangle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  RefreshCw: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  PieChart: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  Layers: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Unlink: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M5.17 11.75l-1.71 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/></svg>,
};
const C = { sidebar: "#0F172A", sidebarHover: "#1E293B", sidebarActive: "#1E40AF", primary: "#1E40AF", primaryLight: "#3B82F6", accent: "#F59E0B", bg: "#F1F5F9", card: "#FFFFFF", text: "#0F172A", textSecondary: "#64748B", border: "#E2E8F0", success: "#059669", warning: "#D97706", danger: "#DC2626" };
const fmt = (a, c = "TRY") => `${{ TRY: "₺", USD: "$", EUR: "€" }[c] || ""}${(a ?? 0).toLocaleString("tr-TR")}`;

// ═══════════════════════════════════════════════════════════════
// TIMELINE CONSTANTS
// ═══════════════════════════════════════════════════════════════
const TR_DAYS = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

const HISTORY_ACTION_CONFIG = {
  "Vaka oluşturuldu":                    { icon: I.PlusCircle,       color: "#059669", category: "create" },
  "Vaka atandı":                         { icon: I.ArrowRightCircle, color: "#D97706", category: "assign" },
  "Yorum eklendi":                       { icon: I.MessageSquare,    color: "#2563EB", category: "comment" },
  "Dosya yüklendi":                      { icon: I.UploadCloud,      color: "#0891B2", category: "upload" },
  "İnceleme talep edildi":               { icon: I.Review,           color: "#7C3AED", category: "review" },
  "İnceleme tamamlandı":                 { icon: I.Check,            color: "#059669", category: "review" },
  "İnceleme yorumu eklendi":             { icon: I.Review,           color: "#7C3AED", category: "review" },
  "Önem derecesi güncellendi":           { icon: I.AlertTriangle,    color: "#DC2626", category: "severity" },
  "Vaka kapatma talebi gönderildi":      { icon: I.X,               color: "#DC2626", category: "request" },
  "Vaka yeniden açma talebi gönderildi": { icon: I.RefreshCw,        color: "#D97706", category: "request" },
  "Vaka silme talebi gönderildi":        { icon: I.Trash,            color: "#DC2626", category: "request" },
  "Vaka güncellendi":                    { icon: I.Edit,             color: "#2563EB", category: "update" },
  "Fraud dağılımı güncellendi":          { icon: I.PieChart,         color: "#D97706", category: "update" },
  "İşlem(ler) eklendi":                  { icon: I.Layers,           color: "#0891B2", category: "txn" },
  "İlişkili vaka eklendi":               { icon: I.Link,             color: "#7C3AED", category: "relation" },
  "İlişkili vaka kaldırıldı":            { icon: I.Unlink,           color: "#DC2626", category: "relation" },
};

const HISTORY_FILTER_CHIPS = [
  { key: "create",   label: "Oluşturma",  color: "#059669" },
  { key: "assign",   label: "Atama",      color: "#D97706" },
  { key: "comment",  label: "Yorum",      color: "#2563EB" },
  { key: "upload",   label: "Dosya",      color: "#0891B2" },
  { key: "review",   label: "İnceleme",   color: "#7C3AED" },
  { key: "severity", label: "Önem",       color: "#DC2626" },
  { key: "request",  label: "Talepler",   color: "#DC2626" },
  { key: "update",   label: "Güncelleme", color: "#2563EB" },
  { key: "txn",      label: "İşlemler",   color: "#0891B2" },
  { key: "relation", label: "İlişkiler",  color: "#7C3AED" },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function SCMCaseDetail({ onNavigate, initialCase, onCaseUpdated, currentRole = "analyst", onRoleChange, selectedDomain = "payment", onDomainChange, myCasesCount = 0, pendingApprovalsCount = 0, reviewCount = 0, notifications = [], addNotification, onMarkAllRead, onMarkRead, showToast: showToastProp, fraudDomains } = {}) {
  const baseCase = initialCase ? { ...initialCase } : {};

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [caseData, setCaseData] = useState({ ...baseCase });
  const [activeTab, setActiveTab] = useState("entities");
  const [entityFilter, setEntityFilter] = useState("customers");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: baseCase.name, severity: baseCase.severity, description: baseCase.description });

  // Fraud distribution
  const [bankShareVal, setBankShareVal] = useState(baseCase.bankShare ?? 0);
  const [customerShareVal, setCustomerShareVal] = useState(baseCase.customerShare ?? 0);
  const rawRemainder = (caseData.totalAmount || 0) - bankShareVal - customerShareVal;
  const remainder = Math.max(0, rawRemainder);
  const isOverage = rawRemainder < 0;
  const isExactMatch = rawRemainder === 0 && (caseData.totalAmount || 0) > 0;
  const isPartial = rawRemainder > 0;
  const bankPct = caseData.totalAmount > 0 ? (bankShareVal / caseData.totalAmount) * 100 : 0;
  const custPct = caseData.totalAmount > 0 ? (customerShareVal / caseData.totalAmount) * 100 : 0;
  const remPct = 100 - bankPct - custPct;

  // Modals
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closeComment, setCloseComment] = useState("");
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [reopenComment, setReopenComment] = useState("");
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
  const [availableTxns, setAvailableTxns] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(CASE_COMMENTS);
  const [attachments, setAttachments] = useState(CASE_ATTACHMENTS);
  const [caseHistory, setCaseHistory] = useState(CASE_HISTORY);
  const [pendingReviews, setPendingReviews] = useState(PENDING_REVIEWS);
  const [caseTxns, setCaseTxns] = useState(CASE_TRANSACTIONS);
  const [relatedCases, setRelatedCases] = useState(RELATED_CASES);
  const [toast, setToast] = useState(null);
  const [subResourcesLoading, setSubResourcesLoading] = useState(true);
  const [caseDeleteEnabled, setCaseDeleteEnabled] = useState(true);
  const [caseReopenEnabled, setCaseReopenEnabled] = useState(true);

  // Fetch domain settings
  useEffect(() => {
    if (!selectedDomain) return;
    settingsApi.getDomain(selectedDomain).then(data => {
      setCaseDeleteEnabled(data.case_delete_enabled !== undefined ? !!data.case_delete_enabled : true);
      setCaseReopenEnabled(data.reopen_enabled !== undefined ? !!data.reopen_enabled : true);
    }).catch(() => {});
  }, [selectedDomain]);

  // Load case sub-resources from API when case ID is available
  useEffect(() => {
    const id = baseCase.id;
    if (!id) { setSubResourcesLoading(false); return; }
    casesApi.get(id).then(data => {
      if (data.bank_share != null)     setBankShareVal(data.bank_share);
      if (data.customer_share != null) setCustomerShareVal(data.customer_share);
    }).catch(() => {}); // non-critical — fallback to initialCase values
    const formatDate = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    };
    let pending = 2;
    const checkDone = () => { if (--pending === 0) setSubResourcesLoading(false); };
    commentsApi.list(id).then(data => {
      setComments(data.map(c => ({ id: c.id, user: c.user_name, date: formatDate(c.created_at), text: c.content, fromReview: !!c.from_review, reviewLabel: c.from_review ? "İnceleme Yorumu" : undefined })));
    }).catch((err) => { if (showToastProp) showToastProp("error", err?.message || "Yorumlar yüklenemedi"); }).finally(checkDone);
    attachmentsApi.list(id).then(data => {
      setAttachments(data.map(a => ({ id: a.id, name: a.file_name, size: a.file_size ? `${(a.file_size/1024).toFixed(1)} KB` : '—', uploader: a.uploaded_by, date: formatDate(a.uploaded_at), fromReview: !!a.from_review })));
    }).catch((err) => { if (showToastProp) showToastProp("error", err?.message || "Ekler yüklenemedi"); }).finally(checkDone);
    historyApi.list(id).then(data => {
      setCaseHistory(data.map(h => ({ id: h.id, action: h.action, user: h.user_name, date: formatDate(h.created_at), detail: h.detail || '' })));
    }).catch(() => {}); // non-critical — mock history is fine
    reviewsApi.list(id).then(data => {
      setPendingReviews(data.map(r => ({ id: r.id, reviewer: r.reviewer_name, status: r.status, sentDate: formatDate(r.requested_at), completedDate: r.completed_at ? formatDate(r.completed_at) : null, note: r.request_note || null, responseComment: r.comment || null, responseAttachments: [] })));
    }).catch(() => {}); // non-critical — fallback to mock reviews
    txnsApi.list(id).then(data => {
      setCaseTxns(data.map(t => ({ id: t.id, date: t.create_date, type: t.source_label || t.source, amount: t.amount, currency: t.currency, fraudStatus: true, fraudAmount: t.amount, bankShare: 0, customerShare: 0 })));
    }).catch(() => {}); // non-critical — fallback to mock transactions
    relationsApi.list(id).then(data => {
      setRelatedCases(data.map(r => ({ id: r.related_case_id, name: r.related_case_name || `Vaka #${r.related_case_id}`, relationshipType: r.relation_type === 'sibling' ? 'Kardeş' : r.relation_type === 'parent' ? 'Üst Vaka' : r.relation_type === 'child' ? 'Alt Vaka' : 'İlişkili', status: r.related_case_status || 'Open', createDate: '', totalAmount: 0, currency: 'TRY' })));
    }).catch(() => {}); // non-critical — fallback to mock relations
  }, [baseCase.id]);

  // Fetch FDM transactions when modal opens
  useEffect(() => {
    if (!showAddTxnModal) return;
    setLoadingTxns(true);
    fdmApi.transactions({ limit: 100 })
      .then(res => {
        const rows = Array.isArray(res) ? res : (res.data || []);
        const linkedIds = new Set(caseTxns.map(t => t.id));
        setAvailableTxns(rows.filter(t => !linkedIds.has(t.id)));
      })
      .catch(() => setAvailableTxns([]))
      .finally(() => setLoadingTxns(false));
  }, [showAddTxnModal]);

  const user = USERS[currentRole];
  const isOwner = user.id === caseData.ownerId;
  const canClose = caseData.status === "Open";
  const canDelete = caseData.status === "Open" && caseDeleteEnabled;
  const canReview = caseData.status === "Open" && currentRole !== "admin";
  const canReopen = caseData.status === "Closed" && currentRole !== "admin" && caseReopenEnabled;
  const isReadOnly = caseData.status === "Closed" || caseData.status === "Pending Delete" || caseData.is_deleted === 1;
  const showToast = (t, m) => {
    setToast({ type: t, msg: m });
    setTimeout(() => setToast(null), 4000);
    // Bubble errors up to global toast stack too
    if (t === "error" && showToastProp) showToastProp(t, m);
  };
  const logHistory = (action, actionType, detail) => {
    if (!baseCase.id) return;
    historyApi.create(baseCase.id, { user_name: user.name, action, action_type: actionType || 'update', detail: detail || null }).catch(() => {});
    setCaseHistory(p => [{ id: Date.now(), action, user: user.name, date: new Date().toLocaleString('tr-TR').replace(',','').slice(0,16), detail: detail || '' }, ...p]);
  };

  const handleCloseCase = () => {
    if (!closeReason) { showToast("warning", "Kapatma nedeni seçilmelidir"); return; }
    if (!closeComment.trim()) { showToast("warning", "Kapanış yorumu zorunludur"); return; }
    if (closeComment.trim().length < 3) { showToast("warning", "Kapanış yorumu en az 3 karakter olmalıdır"); return; }
    const updated = { ...caseData, status: "Pending Closure", close_reason: closeReason };
    setCaseData(updated);
    if (onCaseUpdated) onCaseUpdated(updated);
    setShowCloseModal(false);
    setCloseReason("");
    setCloseComment("");
    if (addNotification) addNotification("case_closed_pending", `#${baseCase.id || caseData.id} kapatma onayına gönderildi — ${caseData.name}`, baseCase.id || caseData.id);
    if (baseCase.id) {
      casesApi.update(baseCase.id, { status: 'Pending Closure', close_reason: closeReason, update_user: user.name })
        .catch((err) => showToast("error", err?.message || "Vaka güncellenemedi"));
      approvalsApi.create({ type: 'case_close', case_id: baseCase.id, case_name: caseData.name, requested_by: user.name, reason: closeReason, severity: caseData.severity })
        .catch((err) => showToast("error", err?.message || "Onay talebi oluşturulamadı"));
      logHistory('Vaka kapatma talebi gönderildi', 'status', `Neden: ${closeReason}`);
    }
    if (onNavigate) onNavigate("cases");
  };
  const handleReopenCase = () => {
    if (!reopenReason) { showToast("warning", "Yeniden açma nedeni seçilmelidir"); return; }
    if (!reopenComment.trim()) { showToast("warning", "Yorum zorunludur"); return; }
    const updated = { ...caseData, status: "Pending Reopen" };
    setCaseData(updated);
    if (onCaseUpdated) onCaseUpdated(updated);
    setShowReopenModal(false);
    setReopenReason("");
    setReopenComment("");
    if (addNotification) addNotification("case_updated", `#${baseCase.id || caseData.id} yeniden açma onayına gönderildi — ${caseData.name}`, baseCase.id || caseData.id);
    if (baseCase.id) {
      casesApi.update(baseCase.id, { status: 'Pending Reopen', update_user: user.name })
        .catch((err) => showToast("error", err?.message || "Vaka güncellenemedi"));
      approvalsApi.create({ type: 'case_reopen', case_id: baseCase.id, case_name: caseData.name, requested_by: user.name, reason: reopenReason, severity: caseData.severity })
        .catch((err) => showToast("error", err?.message || "Onay talebi oluşturulamadı"));
      logHistory('Vaka yeniden açma talebi gönderildi', 'status', `Neden: ${reopenReason}`);
    }
    if (onNavigate) onNavigate("cases");
  };
  const handleDeleteComment = (id) => { setComments(p => p.filter(c => c.id !== id)); showToast("success", "Yorum silindi."); };
  const handleDeleteAttachment = (id) => { setAttachments(p => p.filter(a => a.id !== id)); showToast("success", "Dosya kaldırıldı."); };
  const resetReview = () => { setShowReviewModal(false); setSelectedReviewers([]); setReviewNote(""); setReviewSearchQ(""); setExtEmail(""); setExtName(""); setReviewMode("internal"); };
  const handleSendReview = () => {
    if (reviewMode === "internal") {
      if (!selectedReviewers.length) { showToast("warning", "En az bir inceleyici seçilmelidir"); return; }
      if (baseCase.id) {
        selectedReviewers.forEach(r => {
          reviewsApi.create(baseCase.id, { reviewer_name: r.name, review_type: 'internal', requested_by: user.name, request_note: reviewNote || undefined })
            .catch((err) => showToast("error", err?.message || "İnceleme gönderilemedi"));
        });
        const names = selectedReviewers.map(r => r.name).join(", ");
        logHistory('İnceleme talep edildi', 'review', `${names} kişi(ler)e inceleme için gönderildi.`);
      }
      const names = selectedReviewers.map(r => r.name).join(", ");
      showToast("success", `İnceleme ${selectedReviewers.length} kişiye gönderildi.`);
      if (addNotification) addNotification("review_sent", `#${baseCase.id || caseData.id} incelemeye gönderildi → ${names}`, baseCase.id || caseData.id);
    } else {
      if (!extName.trim()) { showToast("warning", "İnceleyici adı zorunludur"); return; }
      if (extName.trim().length < 2) { showToast("warning", "İnceleyici adı en az 2 karakter olmalıdır"); return; }
      if (extName.trim().length > 100) { showToast("warning", "İnceleyici adı en fazla 100 karakter olabilir"); return; }
      if (!extEmail.trim()) { showToast("warning", "E-posta adresi zorunludur"); return; }
      if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(extEmail.trim())) { showToast("warning", "Geçerli bir e-posta adresi giriniz"); return; }
      if (baseCase.id) {
        reviewsApi.create(baseCase.id, { reviewer_name: extName, reviewer_email: extEmail, review_type: 'external', requested_by: user.name, request_note: reviewNote || undefined })
          .catch((err) => showToast("error", err?.message || "Dış inceleme gönderilemedi"));
        logHistory('İnceleme talep edildi', 'review', `${extName} (${extEmail}) dış incelemeye gönderildi.`);
      }
      showToast("success", `Davet ${extEmail} adresine gönderildi.`);
      if (addNotification) addNotification("review_sent", `#${baseCase.id || caseData.id} dış incelemeye gönderildi → ${extEmail}`, baseCase.id || caseData.id);
    }
    resetReview();
  };
  const handleAddComment = () => {
    if (!newComment.trim() || newComment.trim().length < 3) {
      showToast("warning", "Yorum en az 3 karakter olmalıdır");
      return;
    }
    if (newComment.trim().length > 5000) {
      showToast("warning", "Yorum en fazla 5000 karakter olabilir");
      return;
    }
    const n = new Date();
    const dateStr = `${String(n.getDate()).padStart(2,"0")}.${String(n.getMonth()+1).padStart(2,"0")}.${n.getFullYear()} ${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;
    const optimistic = { id: Date.now(), user: user.name, date: dateStr, text: newComment, fromReview: false };
    setComments(p => [...p, optimistic]);
    setNewComment("");
    showToast("success", "Yorum eklendi.");
    if (addNotification) addNotification("comment_added", `#${baseCase.id || caseData.id} — ${user.name} yorum ekledi`, baseCase.id || caseData.id);
    if (baseCase.id) {
      commentsApi.create(baseCase.id, { user_name: user.name, content: newComment })
        .catch((err) => showToast("error", err?.message || "Yorum kaydedilemedi"));
      logHistory('Yorum eklendi', 'comment', newComment.length > 80 ? newComment.slice(0, 80) + '…' : newComment);
    }
  };
  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.name.trim()) { showToast("warning", "Vaka adı zorunludur"); return; }
    if (editForm.name.trim().length < 3) { showToast("warning", "Vaka adı en az 3 karakter olmalıdır"); return; }
    if (editForm.name.trim().length > 200) { showToast("warning", "Vaka adı en fazla 200 karakter olabilir"); return; }
    if (!editForm.severity) { showToast("warning", "Önem derecesi seçilmelidir"); return; }
    if (editForm.description && editForm.description.length > 2000) { showToast("warning", "Açıklama en fazla 2000 karakter olabilir"); return; }
    const prev = caseData;
    const updated = { ...prev, ...editForm, name: editForm.name.trim() };
    setCaseData(updated);
    if (onCaseUpdated) onCaseUpdated(updated);
    if (addNotification) {
      if (editForm.owner && editForm.owner !== prev.owner) {
        addNotification("case_assigned", `#${baseCase.id || prev.id} — ${editForm.owner} kişisine atandı`, baseCase.id || prev.id);
      } else {
        addNotification("case_updated", `#${baseCase.id || prev.id} güncellendi — ${prev.name}`, baseCase.id || prev.id);
      }
    }
    if (baseCase.id) {
      const changes = [];
      if (editForm.owner && editForm.owner !== prev.owner) changes.push(`Sahip: ${prev.owner || '—'} → ${editForm.owner}`);
      if (editForm.severity && editForm.severity !== prev.severity) changes.push(`Önem: ${prev.severity || '—'} → ${editForm.severity}`);
      if (editForm.name && editForm.name !== prev.name) changes.push(`Ad: ${prev.name} → ${editForm.name}`);
      if (editForm.description !== undefined && editForm.description !== prev.description) changes.push('Açıklama güncellendi');
      if (editForm.owner && editForm.owner !== prev.owner) {
        logHistory('Vaka atandı', 'assignment', `${editForm.owner} kişisine atandı`);
      }
      if (editForm.severity && editForm.severity !== prev.severity) {
        logHistory('Önem derecesi güncellendi', 'update', `${prev.severity || '—'} → ${editForm.severity}`);
      }
      if (changes.length > 0 && !(editForm.owner && editForm.owner !== prev.owner) && !(editForm.severity && editForm.severity !== prev.severity)) {
        logHistory('Vaka güncellendi', 'update', changes.join(', '));
      }
      casesApi.update(baseCase.id, { ...editForm, update_user: user.name })
        .catch((err) => showToast("error", err?.message || "Vaka güncellenemedi"));
    }
    setIsEditing(false);
    showToast("success", "Vaka güncellendi.");
  };
  const handleSaveFraud = () => {
    if (bankShareVal < 0 || customerShareVal < 0) { showToast("warning", "Paylar negatif olamaz"); return; }
    setCaseData(d => ({ ...d, bankShare: bankShareVal, customerShare: customerShareVal }));
    if (baseCase.id) {
      casesApi.update(baseCase.id, { bank_share: bankShareVal, customer_share: customerShareVal, update_user: user.name })
        .then(() => showToast("success", "Dağılım güncellendi."))
        .catch(() => showToast("error", "Kayıt sırasında hata oluştu."));
      logHistory('Fraud dağılımı güncellendi', 'update', `Banka payı: ${bankShareVal}, Müşteri payı: ${customerShareVal}`);
    } else {
      showToast("success", "Dağılım güncellendi.");
    }
  };
  const handleAddTxns = async () => {
    if (!selectedTxns.size) return;
    const caseId = baseCase.id;
    const user = USERS[currentRole];
    const txnsToAdd = availableTxns.filter(t => selectedTxns.has(t.id));
    try {
      if (caseId) {
        await Promise.all(txnsToAdd.map(t => txnsApi.link(caseId, { fdm_txn_id: t.id, linked_by: user.name })));
        const freshTxns = await txnsApi.list(caseId);
        setCaseTxns(Array.isArray(freshTxns) ? freshTxns : []);
      } else {
        setCaseTxns(prev => [...prev, ...txnsToAdd]);
      }
      showToast("success", `${selectedTxns.size} işlem eklendi.`);
      if (caseId) {
        const txnIds = txnsToAdd.map(t => t.id).join(', ');
        logHistory('İşlem(ler) eklendi', 'transaction', `${txnsToAdd.length} işlem bağlandı: ${txnIds}`);
      }
    } catch (err) {
      showToast("error", err?.message || "İşlem eklenirken hata oluştu.");
    }
    setShowAddTxnModal(false); setSelectedTxns(new Set()); setTxnSearch(""); setTxnMarkFilter("all"); setTxnTypeFilter("all"); setTxnDateFrom(""); setTxnDateTo("");
  };

  const tabs = [{ key: "entities", label: "Varlıklar" },{ key: "comments", label: "Yorumlar", badge: comments.length },{ key: "attachments", label: "Ekler", badge: attachments.length },{ key: "history", label: "Geçmiş" },{ key: "transactions", label: "İşlemler", badge: caseTxns.length },{ key: "related", label: "İlişkili Vakalar", badge: relatedCases.length }];
  const filteredExtEmails = RECENT_EXT_EMAILS.filter(e => !extEmail || e.toLowerCase().includes(extEmail.toLowerCase()));
  const filteredExtNames = RECENT_EXT_NAMES.filter(n => !extName || n.toLowerCase().includes(extName.toLowerCase()));
  const filteredTxns = availableTxns.filter(t => { const id = t.id || ''; const entityKey = t.entityKey || t.entity_key || t.customer_no || ''; const markStatus = t.markStatus || t.mark_status || ''; const type = t.type || t.source_label || ''; if (txnSearch && !id.toLowerCase().includes(txnSearch.toLowerCase()) && !entityKey.toLowerCase().includes(txnSearch.toLowerCase())) return false; if (txnMarkFilter !== "all" && markStatus !== txnMarkFilter) return false; if (txnTypeFilter !== "all" && type !== txnTypeFilter) return false; return true; });
  const filteredCases = ALL_CASES_FOR_LINK.filter(c => { if (relateCaseFilter && !String(c.id).includes(relateCaseFilter) && !c.name.toLowerCase().includes(relateCaseFilter.toLowerCase())) return false; if (relateStatusFilter !== "all" && c.status !== relateStatusFilter) return false; return true; });

  const ss = { btn: { display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", transition: "all .15s", border: "none" } };

  if (!initialCase) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:16 }}>
        <span style={{ fontSize:16, color:"#64748B" }}>Vaka bulunamadı.</span>
        <button onClick={() => onNavigate && onNavigate("cases")} style={{ padding:"8px 18px", borderRadius:8, background:"#1E40AF", color:"#fff", border:"none", cursor:"pointer", fontSize:13, fontWeight:600 }}>
          Vaka Listesine Dön
        </button>
      </div>
    );
  }

  return (
    <div className="scm-layout">
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        *::-webkit-scrollbar{width:6px} *::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
        input:focus,textarea:focus,select:focus{outline:2px solid ${C.primaryLight};outline-offset:-1px}`}</style>

      <Sidebar
        activePage="cases"
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

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 56, background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => { if (onNavigate) onNavigate("cases"); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4 }}><I.Back /></button>
            <div><div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Vaka Detayı</div><div style={{ fontSize: 11, color: C.textSecondary, fontFamily: "'JetBrains Mono',monospace" }}>Case Overview — #{caseData.id}</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              {["analyst", "manager", "admin", "super"].map(role => (
                <button key={role} onClick={() => onRoleChange && onRoleChange(role)} style={{ padding: "6px 14px", fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", background: currentRole === role ? C.primary : "#fff", color: currentRole === role ? "#fff" : C.textSecondary, transition: "all 0.15s ease" }}>
                  {role === "analyst" ? "Analist" : role === "manager" ? "Yönetici" : role === "admin" ? "Admin" : "Super"}
                </button>
              ))}
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: C.textSecondary }}><I.Globe /> TR</button>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
          {/* ── Read-only Banner ── */}
          {isReadOnly && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", marginBottom: 16, borderRadius: 10, background: caseData.status === "Pending Delete" ? "#FEF2F2" : "#F0FDF4", border: `1px solid ${caseData.status === "Pending Delete" ? "#FECACA" : "#A7F3D0"}`, color: caseData.status === "Pending Delete" ? "#991B1B" : "#065F46", fontSize: 13, fontWeight: 500 }}>
            <I.Lock />
            <span>{caseData.status === "Pending Delete" ? "Bu vaka silinme onayı bekliyor. Düzenleme yapılamaz." : "Bu vaka kapalıdır. Düzenleme yapılamaz."}</span>
          </div>}
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
                    {canReopen && <button onClick={() => setShowReopenModal(true)} style={{ ...ss.btn, background: "#7C3AED", color: "#fff" }}><I.Unlock /> Yeniden Aç</button>}
                    {canReview && !isReadOnly && <button onClick={() => setShowReviewModal(true)} style={{ ...ss.btn, background: "#7C3AED", color: "#fff" }}><I.Send /> İncelemeye Gönder</button>}
                    {!isReadOnly && <button onClick={() => setIsEditing(true)} style={{ ...ss.btn, background: "#F8FAFC", color: C.text, border: `1px solid ${C.border}` }}><I.Edit /> Düzenle</button>}
                    {canDelete && !isReadOnly && <button onClick={() => setShowDeleteModal(true)} style={{ ...ss.btn, background: "#FEF2F2", color: C.danger, border: "1px solid #FECACA" }}><I.Trash /> Sil</button>}
                  </>}
                </div>
                <div style={{ display: "flex", gap: 10, width: "100%" }}>
                  <div style={{ flex: 1, background: "#F8FAFC", borderRadius: 12, padding: "14px 18px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.textSecondary, fontWeight: 500, textTransform: "uppercase", marginBottom: 4 }}>Vaka Fraud Tutarı</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(caseData.totalAmount, caseData.currency)}</div>
                  </div>
                  {relatedCases.length > 0 && <div style={{ flex: 1, background: "#F5F3FF", borderRadius: 12, padding: "14px 18px", border: "1px solid #DDD6FE" }}>
                    <div style={{ fontSize: 10, color: "#5B21B6", fontWeight: 500, textTransform: "uppercase", marginBottom: 4 }}>Konsolide Toplam</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#5B21B6", fontFamily: "'JetBrains Mono',monospace" }}>{fmt((caseData.totalAmount || 0) + relatedCases.reduce((s, r) => s + (r.totalAmount || 0), 0), caseData.currency)}</div>
                    <div style={{ fontSize: 10, color: "#7C3AED", marginTop: 2 }}>{relatedCases.length} ilişkili vaka dahil</div>
                  </div>}
                </div>
              </div>
            </div>

            {/* Fraud Distribution — Enhanced with visual-only validation */}
            <div style={{
              marginTop: 20,
              padding: "20px 24px",
              background: "#FAFBFD",
              borderRadius: 12,
              border: `1.5px solid ${isOverage ? '#DC2626' : isExactMatch ? '#059669' : C.border}`,
              boxShadow: isOverage ? '0 0 0 3px rgba(220,38,38,0.08)' : isExactMatch ? '0 0 0 3px rgba(5,150,105,0.08)' : '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'border-color 0.25s, box-shadow 0.25s',
            }}>
              {/* Header: title + status badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Fraud Tutarı Dağılımı</div>
                <div style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: isOverage ? '#FEE2E2' : isExactMatch ? '#D1FAE5' : '#FEF3C7',
                  color: isOverage ? '#991B1B' : isExactMatch ? '#065F46' : '#92400E',
                  display: 'flex', alignItems: 'center', gap: 4,
                  border: `1px solid ${isOverage ? '#FECACA' : isExactMatch ? '#A7F3D0' : '#FDE68A'}`,
                }}>
                  {isOverage ? '⚠ Toplam Aşıldı!' : isExactMatch ? '✓ Tam Dağıtım' : 'Kısmi Dağıtım'}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 16, borderRadius: 8, display: "flex", overflow: "hidden",
                marginBottom: 6,
                background: isOverage ? '#FEE2E2' : '#E2E8F0',
                transition: 'all 0.3s',
              }}>
                {bankPct > 0 && <div style={{ width: `${Math.min(bankPct, 100)}%`, background: "#1E40AF", transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)" }} />}
                {custPct > 0 && <div style={{ width: `${Math.min(custPct, Math.max(0, 100 - Math.min(bankPct, 100)))}%`, background: "#F59E0B", transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)" }} />}
                {isPartial && remPct > 0.5 && <div style={{ width: `${remPct}%`, background: "#CBD5E1", transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)" }} />}
              </div>

              {/* Sum vs Total comparison line */}
              <div style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", marginBottom: 14, fontWeight: 600, color: isOverage ? '#DC2626' : isExactMatch ? '#059669' : C.textSecondary }}>
                Dağıtılan: {fmt(bankShareVal + customerShareVal, caseData.currency)} / {fmt(caseData.totalAmount, caseData.currency)}
                {isOverage && <span style={{ marginLeft: 8, fontSize: 11, background: '#FEE2E2', padding: '1px 6px', borderRadius: 4 }}>+{fmt(Math.abs(rawRemainder), caseData.currency)} aşım</span>}
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 20, marginBottom: 16, fontSize: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#1E40AF" }} />
                  <span style={{ color: C.textSecondary }}>Banka Payı</span>
                  <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(bankShareVal, caseData.currency)}</span>
                  <span style={{ fontSize: 11, color: "#1E40AF", fontWeight: 600, opacity: 0.7 }}>(%{bankPct.toFixed(1)})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#F59E0B" }} />
                  <span style={{ color: C.textSecondary }}>Müşteri Payı</span>
                  <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(customerShareVal, caseData.currency)}</span>
                  <span style={{ fontSize: 11, color: "#D97706", fontWeight: 600, opacity: 0.7 }}>(%{custPct.toFixed(1)})</span>
                </div>
                {isPartial && remainder > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: "#CBD5E1" }} />
                    <span style={{ color: C.textSecondary }}>Belirlenmemiş</span>
                    <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: C.warning }}>{fmt(remainder, caseData.currency)}</span>
                    <span style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600, opacity: 0.7 }}>(%{remPct.toFixed(1)})</span>
                  </div>
                )}
                {isOverage && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: "#DC2626" }} />
                    <span style={{ color: '#DC2626', fontWeight: 600 }}>Aşım</span>
                    <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: '#DC2626' }}>{fmt(Math.abs(rawRemainder), caseData.currency)}</span>
                  </div>
                )}
              </div>

              {/* Inputs + Total + Save */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ fontSize: 11, color: "#1E40AF", fontWeight: 600, display: "block", marginBottom: 4 }}>Banka Payı</label>
                  <input
                    type="number" min="0" value={bankShareVal}
                    onChange={e => setBankShareVal(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={isReadOnly}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, outline: "none", transition: "border-color 0.2s",
                      border: isOverage ? "1.5px solid #DC2626" : "1px solid #BFDBFE",
                      borderLeft: `3px solid ${isOverage ? '#DC2626' : '#1E40AF'}`,
                      background: isOverage ? '#FEF2F2' : '#fff',
                      ...(isReadOnly ? { opacity: 0.6, cursor: "not-allowed" } : {}) }} />
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ fontSize: 11, color: "#D97706", fontWeight: 600, display: "block", marginBottom: 4 }}>Müşteri Payı</label>
                  <input
                    type="number" min="0" value={customerShareVal}
                    onChange={e => setCustomerShareVal(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={isReadOnly}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, outline: "none", transition: "border-color 0.2s",
                      border: isOverage ? "1.5px solid #DC2626" : "1px solid #FDE68A",
                      borderLeft: `3px solid ${isOverage ? '#DC2626' : '#F59E0B'}`,
                      background: isOverage ? '#FEF2F2' : '#fff',
                      ...(isReadOnly ? { opacity: 0.6, cursor: "not-allowed" } : {}) }} />
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ fontSize: 11, color: C.textSecondary, display: "block", marginBottom: 4 }}>Toplam</label>
                  <div style={{ padding: "8px 12px", background: "#E2E8F0", borderRadius: 8, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{fmt(caseData.totalAmount, caseData.currency)}</div>
                </div>
                {!isReadOnly && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    {isOverage && <span style={{ fontSize: 10.5, color: '#DC2626', fontWeight: 600 }}>⚠ Toplam tutar aşılıyor</span>}
                    <button onClick={handleSaveFraud} style={{ ...ss.btn, background: C.primary, color: "#fff" }}>Kaydet</button>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Status */}
            {pendingReviews.length > 0 && <div style={{ marginTop: 16, padding: "12px 16px", background: "#F5F3FF", borderRadius: 8, border: "1px solid #DDD6FE" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#5B21B6", marginBottom: 8 }}>İnceleme Durumu</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {pendingReviews.map(r => { const done = r.status === "completed"; return (
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
              {subResourcesLoading && (activeTab === "comments" || activeTab === "attachments") ? (
                <>
                  <style>{`@keyframes kpiPulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ padding: "14px 16px", marginBottom: 8, borderRadius: 10, background: i % 2 === 0 ? "#FAFBFD" : "#fff", border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 80, height: 12, borderRadius: 5, background: "#E2E8F0", animation: `kpiPulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
                        <div style={{ width: 100, height: 12, borderRadius: 5, background: "#E2E8F0", animation: `kpiPulse 1.4s ease-in-out ${i * 0.1 + 0.05}s infinite` }} />
                      </div>
                      <div style={{ width: `${65 + i * 8}%`, height: 13, borderRadius: 5, background: "#E2E8F0", animation: `kpiPulse 1.4s ease-in-out ${i * 0.1 + 0.1}s infinite` }} />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {activeTab === "entities" && <EntitiesTab ef={entityFilter} setEf={setEntityFilter} />}
                  {activeTab === "comments" && <CommentsTab comments={comments} nc={newComment} setNc={setNewComment} onAdd={handleAddComment} onDel={handleDeleteComment} cu={user.name} readOnly={isReadOnly} />}
                  {activeTab === "attachments" && <AttachmentsTab att={attachments} onDel={handleDeleteAttachment} cu={user.name} readOnly={isReadOnly} />}
                  {activeTab === "history" && <HistoryTab history={caseHistory} />}
                  {activeTab === "transactions" && <TransactionsTab onAdd={() => setShowAddTxnModal(true)} onRemove={async (txnId) => {
                    const caseId = baseCase.id;
                    if (!caseId) { setCaseTxns(prev => prev.filter(t => t.id !== txnId)); return; }
                    try {
                      await txnsApi.unlink(caseId, txnId);
                      const freshTxns = await txnsApi.list(caseId);
                      setCaseTxns(Array.isArray(freshTxns) ? freshTxns : []);
                      showToast("success", "İşlem vakadan kaldırıldı.");
                      logHistory('İşlem kaldırıldı', 'transaction', `İşlem ${txnId} vakadan çıkarıldı`);
                    } catch (err) {
                      showToast("error", err?.message || "İşlem kaldırılırken hata oluştu.");
                    }
                  }} transactions={caseTxns} readOnly={isReadOnly} />}
                  {activeTab === "related" && <RelatedCasesTab onAdd={() => setShowRelateModal(true)} onRemove={async (relatedId) => {
                    const caseId = baseCase.id;
                    if (!caseId) { setRelatedCases(prev => prev.filter(r => r.id !== relatedId)); return; }
                    try {
                      await relationsApi.delete(caseId, relatedId);
                      setRelatedCases(prev => prev.filter(r => r.id !== relatedId));
                      showToast("success", `#${relatedId} ilişkisi kaldırıldı.`);
                      logHistory('İlişkili vaka kaldırıldı', 'relation', `#${relatedId} ilişkisi kaldırıldı`);
                    } catch (err) { showToast("error", err?.message || "İlişki kaldırılırken hata oluştu."); }
                  }} relatedCases={relatedCases} readOnly={isReadOnly} />}
                </>
              )}
            </div>
          </div>
          <div style={{ height: 40 }} />
        </main>
      </div>

      {/* ═══ MODALS ═══ */}
      {showCloseModal && <Modal title="Vakayı Kapat" onClose={() => { setShowCloseModal(false); setCloseReason(""); setCloseComment(""); }}>
        <div style={{ fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}><strong>#{caseData.id} — {caseData.name}</strong> vakasını kapatmak istediğinize emin misiniz?</div>
        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Kapatma Nedeni *</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>{CLOSE_REASONS.map(r => <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1px solid ${closeReason === r ? C.primaryLight : C.border}`, background: closeReason === r ? `${C.primaryLight}08` : "#fff", cursor: "pointer" }}><input type="radio" name="cr" checked={closeReason === r} onChange={() => setCloseReason(r)} style={{ accentColor: C.primaryLight }} /><span style={{ fontSize: 13, fontWeight: closeReason === r ? 600 : 400 }}>{r}</span></label>)}</div>
        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Kapatma Yorumu *</label>
        <textarea value={closeComment} onChange={e => setCloseComment(e.target.value)} placeholder="Kapatma gerekçenizi detaylı açıklayın..." style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", resize: "vertical", minHeight: 80, marginBottom: 16 }} />
        <Modal.Footer>
          <Modal.Button label="İptal" onClick={() => setShowCloseModal(false)} />
          <Modal.Button label="Onay İsteği Gönder" primary disabled={!closeReason || !closeComment.trim()} onClick={handleCloseCase} />
        </Modal.Footer>
      </Modal>}

      {showReopenModal && <Modal title="Vakayı Yeniden Aç" onClose={() => { setShowReopenModal(false); setReopenReason(""); setReopenComment(""); }}>
        <div style={{ fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}><strong>#{caseData.id} — {caseData.name}</strong> vakasını yeniden açmak istediğinize emin misiniz? Bu işlem Maker-Checker onayına gönderilecektir.</div>
        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Yeniden Açma Nedeni *</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>{REOPEN_REASONS.map(r => <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1px solid ${reopenReason === r ? "#7C3AED" : C.border}`, background: reopenReason === r ? "#F5F3FF" : "#fff", cursor: "pointer" }}><input type="radio" name="rr" checked={reopenReason === r} onChange={() => setReopenReason(r)} style={{ accentColor: "#7C3AED" }} /><span style={{ fontSize: 13, fontWeight: reopenReason === r ? 600 : 400 }}>{r}</span></label>)}</div>
        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Yeniden Açma Gerekçesi *</label>
        <textarea value={reopenComment} onChange={e => setReopenComment(e.target.value)} placeholder="Vakayı neden yeniden açmak istediğinizi detaylı açıklayın..." style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "'DM Sans',sans-serif", resize: "vertical", minHeight: 80, marginBottom: 16 }} />
        <Modal.Footer>
          <Modal.Button label="İptal" onClick={() => setShowReopenModal(false)} />
          <Modal.Button label="Onay İsteği Gönder" primary disabled={!reopenReason || !reopenComment.trim()} onClick={handleReopenCase} />
        </Modal.Footer>
      </Modal>}

      {/* Combined Review */}
      {showReviewModal && <Modal title="İncelemeye Gönder" onClose={resetReview} width={560}>
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
        <Modal.Footer>
          <Modal.Button label="İptal" onClick={resetReview} />
          <Modal.Button label={reviewMode === "internal" ? `İncelemeye Gönder${selectedReviewers.length ? ` (${selectedReviewers.length})` : ""}` : "Davet Gönder"} primary disabled={reviewMode === "internal" ? !selectedReviewers.length : !extEmail || !extName} onClick={handleSendReview} bg="#7C3AED" />
        </Modal.Footer>
      </Modal>}

      {/* Delete */}
      {showDeleteModal && <Modal title="Vakayı Sil" onClose={() => setShowDeleteModal(false)}>
        <div style={{ padding: "14px 16px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.danger, marginBottom: 6 }}>Bu vakayı silmek istediğinize emin misiniz?</div>
          <div style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.5 }}><strong>#{caseData.id} — {caseData.name}</strong> vakası silinmek üzere işaretlenecektir. Bu işlem için yönetici onayı gereklidir.</div>
        </div>
        <Modal.Footer>
          <Modal.Button label="İptal" onClick={() => setShowDeleteModal(false)} />
          <Modal.Button label="Silme Talebi Gönder" primary bg={C.danger} onClick={() => {
            setShowDeleteModal(false);
            const updated = { ...caseData, status: "Pending Delete" };
            setCaseData(updated);
            if (onCaseUpdated) onCaseUpdated(updated);
            if (addNotification) addNotification("case_updated", `#${baseCase.id || caseData.id} silme onayına gönderildi — ${caseData.name}`, baseCase.id || caseData.id);
            if (baseCase.id) {
              casesApi.update(baseCase.id, { status: 'Pending Delete', update_user: user.name }).catch(() => {});
              approvalsApi.create({ type: 'case_delete', case_id: baseCase.id, case_name: caseData.name, requested_by: user.name, reason: 'Silme talebi', severity: caseData.severity }).catch(() => {});
              logHistory('Vaka silme talebi gönderildi', 'status', 'Silme onayına gönderildi');
            }
            if (onNavigate) onNavigate("cases");
          }} />
        </Modal.Footer>
      </Modal>}

      {/* Relate — only child (Alt Vaka) */}
      {/* Relate Modal — visual tree preview */}
      {showRelateModal && <Modal title="Vaka İlişkilendir" onClose={() => { setShowRelateModal(false); setRelateError(""); setSelectedRelateCase(null); setRelateMode("alt"); }} width={620}>
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
        <Modal.Footer style={{ marginTop: 16 }}>
          <Modal.Button label="İptal" onClick={() => { setShowRelateModal(false); setRelateError(""); setSelectedRelateCase(null); setRelateMode("alt"); }} />
          <Modal.Button label={relateMode === "ust" ? "Üst Vaka Olarak Ata" : relateMode === "alt" ? "Alt Vaka Olarak Ekle" : "Kardeş Vaka Olarak Bağla"} primary disabled={!selectedRelateCase} onClick={async () => {
            if (!selectedRelateCase) return;
            const caseId = baseCase.id;
            const user = USERS[currentRole];
            const relationType = relateMode === "ust" ? "parent" : relateMode === "alt" ? "child" : "sibling";
            const msg = relateMode === "ust" ? `#${selectedRelateCase.id} üst vaka olarak atandı.` : relateMode === "alt" ? `#${selectedRelateCase.id} alt vaka olarak eklendi.` : `#${selectedRelateCase.id} kardeş vaka olarak bağlandı.`;
            try {
              if (caseId) {
                await relationsApi.create(caseId, { related_case_id: selectedRelateCase.id, relation_type: relationType, created_by: user.name });
                const freshRelations = await relationsApi.list(caseId);
                setRelatedCases(Array.isArray(freshRelations) ? freshRelations.map(r => ({ id: r.related_case_id, name: r.related_case_name || `Vaka #${r.related_case_id}`, relationshipType: r.relation_type === 'sibling' ? 'Kardeş' : r.relation_type === 'parent' ? 'Üst Vaka' : r.relation_type === 'child' ? 'Alt Vaka' : 'İlişkili', status: r.related_case_status || 'Open', createDate: '', totalAmount: 0, currency: 'TRY' })) : []);
              } else {
                setRelatedCases(prev => [...prev, { id: selectedRelateCase.id, name: selectedRelateCase.name, relationshipType: relateMode === "ust" ? "Üst Vaka" : relateMode === "alt" ? "Alt Vaka" : "Kardeş", status: selectedRelateCase.status, createDate: selectedRelateCase.createDate, totalAmount: 0, currency: "TRY" }]);
              }
              showToast("success", msg);
              if (caseId) logHistory('İlişkili vaka eklendi', 'relation', msg);
            } catch (err) {
              showToast("error", err?.message || "İlişki eklenirken hata oluştu.");
            }
            setShowRelateModal(false); setRelateCaseFilter(""); setRelateStatusFilter("all"); setRelateError(""); setSelectedRelateCase(null); setRelateMode("alt");
          }} bg={relateMode === "ust" ? "#7C3AED" : relateMode === "alt" ? "#1E40AF" : "#059669"} />
        </Modal.Footer>
      </Modal>}

      {/* Add Transaction */}
      {showAddTxnModal && <Modal title="İşlem Ekle" onClose={() => { setShowAddTxnModal(false); setSelectedTxns(new Set()); setTxnSearch(""); setTxnMarkFilter("all"); setTxnTypeFilter("all"); setTxnDateFrom(""); setTxnDateTo(""); }} width={700}>
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
        {loadingTxns ? <div style={{ padding: 40, textAlign: "center", color: C.textSecondary, fontSize: 13 }}>Yükleniyor...</div> : <div style={{ maxHeight: 320, overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["","İşlem ID","Tarih","Tür","Tutar","Skor","Durum"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, background: "#FAFBFD", position: "sticky", top: 0 }}>{h}</th>)}</tr></thead>
            <tbody>{filteredTxns.map(t => { const sel = selectedTxns.has(t.id); const ms = t.markStatus || t.mark_status || ''; return <tr key={t.id} onClick={() => { const n = new Set(selectedTxns); if (sel) n.delete(t.id); else n.add(t.id); setSelectedTxns(n); }} style={{ cursor: "pointer", background: sel ? `${C.primaryLight}06` : "#fff" }} onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#F8FAFC"; }} onMouseLeave={e => { e.currentTarget.style.background = sel ? `${C.primaryLight}06` : "#fff"; }}>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, width: 36 }}><input type="checkbox" checked={sel} readOnly style={{ accentColor: C.primaryLight }} /></td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, color: C.primaryLight }}>{t.id}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{t.date || t.create_date}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{t.type || t.source_label}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600 }}>{fmt(t.amount, t.currency)}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>{t.score}</td>
              <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}><span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: ms === "Marked" ? "#FEE2E2" : "#F3F4F6", color: ms === "Marked" ? "#991B1B" : "#374151" }}>{ms === "Marked" ? "İşaretli" : "İşaretsiz"}</span></td>
            </tr>; })}{filteredTxns.length === 0 && <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: C.textSecondary, fontSize: 13, borderBottom: `1px solid ${C.border}` }}>Sonuç bulunamadı</td></tr>}</tbody>
          </table>
        </div>}
        <Modal.Footer style={{ marginTop: 16 }}>
          <Modal.Button label="İptal" onClick={() => { setShowAddTxnModal(false); setSelectedTxns(new Set()); }} />
          <Modal.Button label={`Vakaya Ekle (${selectedTxns.size})`} primary disabled={!selectedTxns.size} onClick={handleAddTxns} />
        </Modal.Footer>
      </Modal>}

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
            {/* İnceleme Yorumları — from_review comments + responseComment fallback */}
            {(() => {
              const rc = comments.filter(c => c.fromReview);
              if (rc.length > 0) {
                return <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#166534", marginBottom: 8 }}>İnceleme Yorumları</div>
                  {rc.map(c => <div key={c.id} style={{ padding: "12px 14px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #BBF7D0", marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 600 }}>{c.user}</span><span style={{ fontSize: 11, color: C.textSecondary }}>{c.date}</span></div>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}>{c.text}</div>
                  </div>)}
                </div>;
              }
              if (reviewDetailData.responseComment) {
                return <div style={{ marginBottom: 20, padding: "14px 16px", background: "#F0FDF4", borderRadius: 10, border: "1px solid #BBF7D0" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#166534", marginBottom: 6 }}>İnceleme Yorumu</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>{reviewDetailData.responseComment}</div>
                </div>;
              }
              return null;
            })()}
            {/* İnceleme Ekleri — fromReview attachments + responseAttachments fallback */}
            {(() => {
              const ra = attachments.filter(a => a.fromReview);
              const list = ra.length > 0 ? ra : (reviewDetailData.responseAttachments || []);
              if (!list.length) return null;
              return <div>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>İnceleme Ekleri</div>
                {list.map((a, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#F8FAFC", borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: "#D1FAE5", color: "#065F46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{(a.name || '').split(".").pop().toUpperCase()}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 11, color: C.textSecondary }}>{a.size}</div></div>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: C.primaryLight, display: "flex", padding: 4 }}><I.Download /></button>
                </div>)}
              </div>;
            })()}
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

function CommentsTab({ comments, nc, setNc, onAdd, onDel, cu, readOnly }) {
  return <div>
    <div style={{ marginBottom: 20 }}>{comments.map((c, i) => <div key={c.id} style={{ padding: "14px 16px", marginBottom: 8, borderRadius: 10, background: i % 2 === 0 ? "#FAFBFD" : "#fff", border: `1px solid ${c.fromReview ? "#DDD6FE" : C.border}`, animation: `slideUp .3s ease ${i * 0.05}s both` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 26, height: 26, borderRadius: "50%", background: c.fromReview ? "#7C3AED" : C.primaryLight, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{c.user.split(" ").map(n => n[0]).join("")}</div><span style={{ fontSize: 13, fontWeight: 600 }}>{c.user}</span>{c.fromReview && <ReviewBadge />}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.textSecondary, display: "flex", alignItems: "center", gap: 4 }}><I.Clock /> {c.date}</span>
          {!readOnly && c.user === cu && !c.fromReview && <button onClick={() => onDel(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4, borderRadius: 4 }} onMouseEnter={e => { e.currentTarget.style.color = C.danger; e.currentTarget.style.background = "#FEF2F2"; }} onMouseLeave={e => { e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = "none"; }}><I.Trash /></button>}
        </div>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, paddingLeft: 34 }}>{c.text}</div>
    </div>)}</div>
    {!readOnly && <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Yeni Yorum</div><textarea value={nc} onChange={e => setNc(e.target.value)} placeholder="Yorumunuzu yazın..." style={{ width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", resize: "vertical", minHeight: 80, marginBottom: 8 }} /><div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={onAdd} disabled={!nc.trim()} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: nc.trim() ? C.primary : "#CBD5E1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: nc.trim() ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}><I.Send /> Yorum Ekle</button></div></div>}
  </div>;
}

function AttachmentsTab({ att, onDel, cu, readOnly }) {
  const fc = { pdf: "#DC2626", docx: "#1E40AF", xlsx: "#059669" };
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{att.length} dosya</div>{!readOnly && <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px dashed ${C.primaryLight}`, background: `${C.primaryLight}06`, color: C.primaryLight, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}><I.Upload /> Dosya Yükle</button>}</div>
    <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <thead><tr>{["Dosya Adı","Boyut","Yükleyen","Tarih",""].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
      <tbody>{att.map(a => { const ext = a.name.split(".").pop(); return <tr key={a.id}>
        <td style={td}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: 6, background: `${fc[ext] || C.textSecondary}12`, color: fc[ext] || C.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>{ext}</div><span style={{ fontWeight: 500 }}>{a.name}</span>{a.fromReview && <ReviewBadge />}</div></td>
        <td style={{ ...td, fontSize: 12, color: C.textSecondary }}>{a.size}</td><td style={{ ...td, fontSize: 12 }}>{a.uploader}</td><td style={{ ...td, fontSize: 12, color: C.textSecondary }}>{a.date}</td>
        <td style={{ ...td, textAlign: "right" }}><div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}><button style={{ background: "none", border: "none", cursor: "pointer", color: C.primaryLight, display: "flex", padding: 4 }}><I.Download /></button>{!readOnly && a.uploader === cu && !a.fromReview && <button onClick={() => onDel(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4, borderRadius: 4 }} onMouseEnter={e => { e.currentTarget.style.color = C.danger; e.currentTarget.style.background = "#FEF2F2"; }} onMouseLeave={e => { e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = "none"; }}><I.Trash /></button>}</div></td>
      </tr>; })}</tbody>
    </table>
  </div>;
}

function parseDateTR(str) {
  if (!str) return null;
  const [datePart, timePart] = str.split(" ");
  const [d, m, y] = datePart.split(".").map(Number);
  const [hh, mm] = (timePart || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

function formatDateGroupHeader(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const month = TR_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const day = TR_DAYS[date.getDay()];
  return `${d} ${month} ${year} — ${day}`;
}

function formatRelativeTime(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return null;
}

function groupByDate(history) {
  const map = new Map();
  for (const h of history) {
    const date = parseDateTR(h.date);
    const key = date ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}` : "unknown";
    if (!map.has(key)) map.set(key, { dateKey: key, dateLabel: date ? formatDateGroupHeader(date) : "Tarih Bilinmiyor", items: [] });
    map.get(key).items.push(h);
  }
  return Array.from(map.values());
}

function highlightChange(detail, color) {
  if (!detail) return null;
  const idx = detail.indexOf("→");
  if (idx === -1) return detail;
  const before = detail.substring(0, idx).trim();
  const after = detail.substring(idx + 1).trim();
  return <span>
    <span style={{ textDecoration: "line-through", color: C.textSecondary }}>{before}</span>
    {" → "}
    <span style={{ fontWeight: 700, color }}>{after}</span>
  </span>;
}

function HistoryTab({ history = CASE_HISTORY }) {
  const [selectedTypes, setSelectedTypes] = useState([]);

  const filtered = useMemo(() => {
    if (selectedTypes.length === 0) return history;
    return history.filter(h => {
      const cfg = HISTORY_ACTION_CONFIG[h.action];
      return cfg && selectedTypes.includes(cfg.category);
    });
  }, [history, selectedTypes]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const toggleType = key => setSelectedTypes(prev =>
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
  );

  let globalIdx = 0;

  return <div>
    {/* Filter Chips */}
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
      {HISTORY_FILTER_CHIPS.map(chip => {
        const sel = selectedTypes.includes(chip.key);
        return <button key={chip.key} onClick={() => toggleType(chip.key)} style={{
          padding: "4px 12px", borderRadius: 999,
          border: `1px solid ${sel ? chip.color + "60" : C.border}`,
          background: sel ? chip.color + "15" : "transparent",
          color: sel ? chip.color : C.textSecondary,
          fontSize: 11, fontWeight: 600, cursor: "pointer",
          fontFamily: "'DM Sans',sans-serif", transition: "all .15s ease",
        }}>{chip.label}</button>;
      })}
      {selectedTypes.length > 0 && <button onClick={() => setSelectedTypes([])} style={{
        padding: "4px 12px", borderRadius: 999, border: "none",
        background: "transparent", color: C.primaryLight,
        fontSize: 11, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif", textDecoration: "underline",
      }}>Temizle</button>}
    </div>

    {selectedTypes.length > 0 && <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 12 }}>
      {selectedTypes.length} filtre aktif
    </div>}

    {/* Empty State */}
    {groups.length === 0 && <div style={{ textAlign: "center", padding: "48px 20px", color: C.textSecondary }}>
      <I.Clock />
      <p style={{ marginTop: 8, fontSize: 13, fontWeight: 500 }}>
        {selectedTypes.length > 0 ? "Seçili filtrelere uygun geçmiş kaydı bulunamadı." : "Henüz geçmiş kaydı bulunmamaktadır."}
      </p>
      {selectedTypes.length > 0 && <button onClick={() => setSelectedTypes([])} style={{
        marginTop: 8, background: "none", border: "none",
        color: C.primaryLight, fontSize: 12, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif",
      }}>Filtreleri Temizle</button>}
    </div>}

    {/* Grouped Timeline */}
    {groups.map(group => <div key={group.dateKey}>
      {/* Date Separator */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 12px" }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, whiteSpace: "nowrap", letterSpacing: 0.3, fontFamily: "'DM Sans',sans-serif" }}>{group.dateLabel}</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 40 }}>
        <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: C.border }} />

        {group.items.map(h => {
          const cfg = HISTORY_ACTION_CONFIG[h.action] || { icon: I.Clock, color: C.textSecondary, category: "other" };
          const ActionIcon = cfg.icon;
          const date = parseDateTR(h.date);
          const rel = date ? formatRelativeTime(date) : null;
          const idx = globalIdx++;

          return <div key={h.id} style={{ position: "relative", paddingBottom: 16, paddingLeft: 28, animation: `slideUp .3s ease ${Math.min(idx * 0.03, 0.5)}s both` }}>
            {/* Timeline Dot with Icon */}
            <div style={{
              position: "absolute", left: -15, top: 2, width: 30, height: 30, borderRadius: "50%",
              background: cfg.color + "15", border: `2px solid ${cfg.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: cfg.color, zIndex: 1,
            }}><ActionIcon /></div>

            {/* Event Card */}
            <div
              style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: "12px 16px", transition: "box-shadow .15s ease, border-color .15s ease",
                cursor: "default",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = cfg.color + "40"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}
            >
              {/* Top: action badge + time */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 700, color: cfg.color,
                  background: cfg.color + "12", padding: "2px 10px", borderRadius: 6,
                }}>{h.action}</span>
                <span style={{ fontSize: 11, color: C.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
                  <I.Clock /> {rel || h.date}
                </span>
              </div>

              {/* Detail */}
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5, marginBottom: 8 }}>
                {highlightChange(h.detail, cfg.color)}
              </div>

              {/* Bottom: user avatar + name + absolute date */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: cfg.color + "18", color: cfg.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                }}>{h.user?.charAt(0).toUpperCase()}</div>
                <span style={{ fontSize: 11.5, fontWeight: 500, color: C.text }}>{h.user}</span>
                <span style={{ fontSize: 10.5, color: C.textSecondary, marginLeft: "auto" }}>{h.date}</span>
              </div>
            </div>
          </div>;
        })}
      </div>
    </div>)}
  </div>;
}

function TransactionsTab({ onAdd, onRemove, transactions, readOnly }) {
  const txns = transactions || [];
  const t2 = { padding: "10px 12px", fontSize: 12.5, color: C.text, borderBottom: `1px solid ${C.border}` };
  const thStyle = { padding: "10px 12px", fontSize: 11, fontWeight: 700, color: C.textSecondary, background: "#F8FAFC", textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" };
  return <div>
    {!readOnly && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}><I.Plus /> İşlem Ekle</button></div>}
    <div style={{ overflow: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <thead><tr>{["İşlem ID","Tarih / Kaynak","Tür / Kural","Tutar","Para Birimi","Önem","Fraud Skoru / Tutar","Durum", ...(!readOnly ? [""] : [])].map(h => <th key={h || "_actions"} style={thStyle}>{h}</th>)}</tr></thead>
      <tbody>{txns.map(t => {
        const isCaseTxn = "fraudStatus" in t;
        const date = isCaseTxn ? t.date : t.createDate;
        const type = isCaseTxn ? t.type : t.sourceLabel;
        const sev = isCaseTxn ? null : t.severity;
        const score = isCaseTxn ? null : t.score;
        const status = isCaseTxn ? (t.fraudStatus ? "Fraud" : "Temiz") : t.markStatus;
        const statusBg = { Fraud: "#FEE2E2", Temiz: "#D1FAE5", Marked: "#ECFDF5", Unmarked: "#F3F4F6", "Case Assigned": "#EDE9FE" }[status] || "#F3F4F6";
        const statusClr = { Fraud: "#991B1B", Temiz: "#065F46", Marked: "#065F46", Unmarked: "#6B7280", "Case Assigned": "#5B21B6" }[status] || "#6B7280";
        const sevBg = { Critical:"#FEE2E2", High:"#FEF3C7", Medium:"#DBEAFE", Low:"#F3F4F6" }[sev] || "transparent";
        const sevClr = { Critical:"#991B1B", High:"#92400E", Medium:"#1E40AF", Low:"#374151" }[sev] || "inherit";
        const scoreOrAmt = score !== null && score !== undefined ? score : (t.fraudAmount > 0 ? fmt(t.fraudAmount, t.currency) : "—");
        return <tr key={t.id}>
          <td style={{ ...t2, fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 600, color: C.primaryLight }}>{t.id}</td>
          <td style={{ ...t2, fontSize: 12 }}>{date}</td>
          <td style={t2}>{type}</td>
          <td style={{ ...t2, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(t.amount, t.currency)}</td>
          <td style={t2}>{t.currency}</td>
          <td style={t2}>{sev ? <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: sevBg, color: sevClr }}>{sev}</span> : "—"}</td>
          <td style={{ ...t2, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{scoreOrAmt}</td>
          <td style={t2}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: statusBg, color: statusClr }}>{status}</span></td>
          {!readOnly && <td style={{ ...t2, textAlign: "right" }}><button onClick={() => onRemove && onRemove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 11, fontWeight: 500, padding: "4px 8px" }}>Kaldır</button></td>}
        </tr>;
      })}</tbody>
    </table></div>
  </div>;
}

function RelatedCasesTab({ onAdd, onRemove, relatedCases = RELATED_CASES, readOnly }) {
  const rtc = { "Üst Vaka": { bg: "#F5F3FF", c: "#5B21B6", b: "#DDD6FE" }, "Alt Vaka": { bg: "#EFF6FF", c: "#1E40AF", b: "#BFDBFE" }, "Kardeş": { bg: "#F0FDF4", c: "#166534", b: "#BBF7D0" } };
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><I.Hierarchy /> {relatedCases.length} ilişkili vaka</div>{!readOnly && <button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}><I.Plus /> İlişkili Vaka Ekle</button>}</div>
    {relatedCases.length > 0 ? <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <thead><tr>{["Case ID","Vaka Adı","İlişki Türü","Durum","Fraud Tutarı","Oluşturma Tarihi",""].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
      <tbody>{relatedCases.map(rc => { const r = rtc[rc.relationshipType] || rtc["Kardeş"]; return <tr key={rc.id}>
        <td style={{ ...td, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: C.primaryLight }}>#{rc.id}</td><td style={{ ...td, fontWeight: 500 }}>{rc.name}</td>
        <td style={td}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: r.bg, color: r.c, border: `1px solid ${r.b}` }}>{rc.relationshipType}</span></td>
        <td style={td}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6, background: STATUS_CONFIG[rc.status]?.bg, color: STATUS_CONFIG[rc.status]?.color }}>{rc.status}</span></td>
        <td style={{ ...td, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600 }}>{fmt(rc.totalAmount, rc.currency)}</td>
        <td style={{ ...td, fontSize: 12, color: C.textSecondary }}>{rc.createDate}</td>
        {!readOnly && <td style={{ ...td, textAlign: "right" }}><button onClick={() => onRemove && onRemove(rc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 11, fontWeight: 500, padding: "4px 8px" }}>Kaldır</button></td>}
      </tr>; })}</tbody>
    </table> : <div style={{ textAlign: "center", padding: "40px 20px", color: C.textSecondary }}><I.Link /><p style={{ marginTop: 8, fontSize: 13 }}>Henüz ilişkili vaka bulunmamaktadır.</p></div>}
  </div>;
}
