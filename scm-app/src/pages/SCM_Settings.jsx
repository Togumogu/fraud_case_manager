import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { settings as settingsApi } from "../api/client";

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const USERS = {
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

// Domain-specific settings (each domain has its own independent settings)
const DOMAIN_SETTINGS = {
  payment: {
    maker_checker_enabled: true,
    notification_enabled: true,
    default_currency: "original",
    close_reasons: ["Soruşturma Tamamlandı", "Çözüme Kavuşturuldu", "Mükerrer", "Yanlış Alarm", "Kara Listeye Alındı"],
    reviewer_link_expiry_hours: 72,
    reviewer_inactivity_timeout_min: 30,
    reviewer_otp_enabled: true,
    case_delete_enabled: true,
    reopen_enabled: true,
  },
  credit_card: {
    maker_checker_enabled: true,
    notification_enabled: false,
    default_currency: "TRY",
    close_reasons: ["Soruşturma Tamamlandı", "Çözüme Kavuşturuldu", "Mükerrer"],
    reviewer_link_expiry_hours: 72,
    reviewer_inactivity_timeout_min: 30,
    reviewer_otp_enabled: true,
    case_delete_enabled: true,
    reopen_enabled: true,
  },
  application: {
    maker_checker_enabled: false,
    notification_enabled: false,
    default_currency: "original",
    close_reasons: ["Soruşturma Tamamlandı", "Çözüme Kavuşturuldu", "Mükerrer", "Başvuru Reddedildi"],
    reviewer_link_expiry_hours: 48,
    reviewer_inactivity_timeout_min: 20,
    reviewer_otp_enabled: true,
    case_delete_enabled: true,
    reopen_enabled: true,
  },
  account_takeover: {
    maker_checker_enabled: true,
    notification_enabled: true,
    default_currency: "USD",
    close_reasons: ["Soruşturma Tamamlandı", "Çözüme Kavuşturuldu", "Mükerrer", "Hesap Kurtarıldı"],
    reviewer_link_expiry_hours: 72,
    reviewer_inactivity_timeout_min: 30,
    reviewer_otp_enabled: true,
    case_delete_enabled: true,
    reopen_enabled: true,
  },
  internal: {
    maker_checker_enabled: true,
    notification_enabled: false,
    default_currency: "TRY",
    close_reasons: ["Soruşturma Tamamlandı", "Çözüme Kavuşturuldu", "Mükerrer", "Disiplin Sürecine Alındı"],
    reviewer_link_expiry_hours: 96,
    reviewer_inactivity_timeout_min: 15,
    reviewer_otp_enabled: true,
    case_delete_enabled: true,
    reopen_enabled: true,
  },
};


const NOTIFICATIONS = [
  { id: 1, text: "Sistem ayarı değiştirildi: Payment Fraud — maker_checker_enabled", time: "09:20", read: false },
  { id: 2, text: "Bildirim ayarı güncellendi: Payment Fraud", time: "09:15", read: true },
];

// ═══════════════════════════════════════════════════════════════
// PERMISSIONS & ROLES
// ═══════════════════════════════════════════════════════════════
const PERMISSION_CATEGORIES = [
  {
    key: "case", label: "Vaka Yönetimi",
    permissions: [
      { key: "case_view", label: "Vaka Görüntüleme", desc: "Vaka listesini ve detaylarını görüntüleme" },
      { key: "case_create", label: "Vaka Oluşturma", desc: "Yeni vaka oluşturma" },
      { key: "case_edit", label: "Vaka Düzenleme", desc: "Vaka adı, önem derecesi, açıklama düzenleme" },
      { key: "case_close", label: "Vaka Kapatma", desc: "Vakayı kapatma (kapama nedeni ile)" },
      { key: "case_delete", label: "Vaka Silme", desc: "Vakayı silme (nadiren verilen özel yetki)" },
      { key: "case_assign", label: "Vaka Atama", desc: "Vakayı başka kullanıcılara atama" },
      { key: "case_link", label: "Vaka İlişkilendirme", desc: "Vakalar arası Parent-Child / Sibling ilişki kurma" },
    ],
  },
  {
    key: "approval", label: "Onay Yönetimi",
    permissions: [
      { key: "case_approve", label: "Onay Verme (Checker)", desc: "Maker-Checker sürecinde onay/red verme" },
      { key: "approval_view", label: "Onay Bekleyenleri Görüntüleme", desc: "Onay kuyruğunu görüntüleme" },
    ],
  },
  {
    key: "review", label: "İnceleme (Review)",
    permissions: [
      { key: "case_review", label: "Review Yanıtlama", desc: "Review isteğini yanıtlama, yorum ve dosya ekleme" },
      { key: "case_review_invite", label: "Dış Reviewer Davet Etme", desc: "Sistem dışı kişileri e-posta ile review'a davet etme" },
      { key: "case_review_send", label: "Review Gönderme", desc: "Sistem içi kullanıcılara review isteği gönderme" },
    ],
  },
  {
    key: "transaction", label: "İşlem Yönetimi",
    permissions: [
      { key: "transaction_view", label: "İşlem Görüntüleme", desc: "İşlem listesi ve detaylarını görüntüleme (salt okunur)" },
      { key: "transaction_search", label: "İşlem Arama", desc: "FDM üzerinden işlem arama" },
    ],
  },
  {
    key: "reporting", label: "Raporlama",
    permissions: [
      { key: "report_run", label: "Rapor Çalıştırma", desc: "Rapor oluşturma ve çalıştırma" },
      { key: "report_export", label: "Rapor Dışa Aktarma", desc: "Raporu Excel (.xlsx) olarak indirme" },
    ],
  },
  {
    key: "admin", label: "Yönetim",
    permissions: [
      { key: "settings_manage", label: "Sistem Ayarları", desc: "Sistem yapılandırma ve ayar değişikliği" },
      { key: "user_manage", label: "Kullanıcı Yönetimi", desc: "Kullanıcı oluşturma, düzenleme, devre dışı bırakma" },
      { key: "role_manage", label: "Rol Yönetimi", desc: "Rol oluşturma, düzenleme ve yetki atama" },
    ],
  },
];

const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(c => c.permissions);

const INITIAL_ROLES = [
  {
    id: "fraud_analyst", name: "Fraud Analist", description: "Vaka oluşturma, soruşturma yürütme ve raporlama yetkilerine sahip temel operasyonel rol.",
    isDefault: true, userCount: 12, color: "#3B82F6",
    permissions: ["case_view", "case_create", "case_edit", "case_close", "case_link", "case_review", "case_review_send", "case_review_invite", "transaction_view", "transaction_search", "report_run", "report_export"],
  },
  {
    id: "reviewer", name: "İnceleyici", description: "Atanan vakaları görüntüleme ve review yanıtlama yetkisine sahip sınırlı rol.",
    isDefault: true, userCount: 4, color: "#8B5CF6",
    permissions: ["case_view", "case_review", "transaction_view", "report_run", "report_export"],
  },
  {
    id: "manager", name: "Yönetici", description: "Tüm vaka operasyonları, atama, onay ve kullanıcı yönetimi yetkilerine sahip süpervizör rol.",
    isDefault: true, userCount: 3, color: "#059669",
    permissions: ["case_view", "case_create", "case_edit", "case_close", "case_delete", "case_assign", "case_link", "case_approve", "approval_view", "case_review", "case_review_send", "case_review_invite", "transaction_view", "transaction_search", "report_run", "report_export", "user_manage"],
  },
  {
    id: "admin", name: "Admin", description: "Yalnızca sistem ayarları ve teknik yapılandırma yetkilerine sahip teknik yönetim rolü. Vaka/işlem verilerine erişim yoktur.",
    isDefault: true, userCount: 1, color: "#D97706",
    permissions: ["settings_manage", "user_manage", "role_manage", "approval_view", "case_approve", "report_run", "report_export"],
  },
  {
    id: "senior_analyst", name: "Kıdemli Analist", description: "Fraud Analist yetkilerine ek olarak onay verme ve vaka atama yetkisi bulunan özel rol.",
    isDefault: false, userCount: 2, color: "#0891B2",
    permissions: ["case_view", "case_create", "case_edit", "case_close", "case_assign", "case_link", "case_approve", "approval_view", "case_review", "case_review_send", "case_review_invite", "transaction_view", "transaction_search", "report_run", "report_export"],
  },
];

// ═══════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════
const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  CaseCreate: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Cases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  MyCases: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Collapse: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Domain: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  History: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Currency: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Layers: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  AlertCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Save: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Info: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Key: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Copy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  ExternalLink: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  XCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  UserMgmt: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  TransactionSearch: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Unlock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
};

// ═══════════════════════════════════════════════════════════════
// STYLE CONSTANTS
// ═══════════════════════════════════════════════════════════════
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
};

const CURRENCY_OPTIONS = [
  { value: "original", label: "Orijinal Para Birimi", desc: "SFD'den gelen orijinal para birimi" },
  { value: "TRY", label: "TRY — Türk Lirası", desc: "Yerel para birimi dönüşümü" },
  { value: "USD", label: "USD — Amerikan Doları", desc: "ABD doları dönüşümü" },
];

// ═══════════════════════════════════════════════════════════════
// TOAST COMPONENT
// ═══════════════════════════════════════════════════════════════
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }
  }, [toast]);
  if (!toast) return null;
  const bg = toast.type === "success" ? "#059669" : toast.type === "error" ? "#DC2626" : "#D97706";
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: bg, color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.18)", animation: "slideIn 0.3s ease", maxWidth: 400 }}>
      {toast.type === "success" ? <Icons.Check /> : <Icons.AlertCircle />}
      {toast.message}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TOGGLE COMPONENT
// ═══════════════════════════════════════════════════════════════
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    style={{
      width: 44, height: 24, borderRadius: 12, border: "none",
      background: checked ? C.primaryLight : "#CBD5E1",
      cursor: disabled ? "not-allowed" : "pointer",
      position: "relative", transition: "all 0.2s ease",
      opacity: disabled ? 0.5 : 1, flexShrink: 0,
    }}
  >
    <div style={{
      width: 18, height: 18, borderRadius: "50%", background: "#fff",
      position: "absolute", top: 3,
      left: checked ? 23 : 3,
      transition: "left 0.2s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </button>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function SCMSettings({ onNavigate, currentRole = "analyst", onRoleChange, selectedDomain = "payment", onDomainChange, notifications = [], onMarkAllRead, onMarkRead, fraudDomains: fraudDomainsProp, onDomainsChange } = {}) {

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Settings state - initialized from domain
  const [settings, setSettings] = useState({ ...DOMAIN_SETTINGS[selectedDomain] });
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("system");
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Role management state
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // null = create, object = edit
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [rolePerms, setRolePerms] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(PERMISSION_CATEGORIES.map(c => c.key));
  const [newCloseReason, setNewCloseReason] = useState("");

  // Domain management state
  const [domains, setDomains] = useState(fraudDomainsProp || FRAUD_DOMAINS);
  const [newDomainLabel, setNewDomainLabel] = useState("");

  // Sync when prop changes
  useEffect(() => {
    if (fraudDomainsProp && fraudDomainsProp.length > 0) setDomains(fraudDomainsProp);
  }, [fraudDomainsProp]);

  // Update settings when domain changes — try API first, fall back to mock
  useEffect(() => {
    setHasChanges(false);
    setNewCloseReason("");
    settingsApi.getDomain(selectedDomain).then(data => {
      setSettings({
        maker_checker_enabled: !!data.maker_checker_enabled,
        notification_enabled: !!data.notification_enabled,
        default_currency: data.default_currency,
        close_reasons: Array.isArray(data.close_reasons) ? data.close_reasons : JSON.parse(data.close_reasons || '[]'),
        reviewer_link_expiry_hours: data.reviewer_link_expiry_hours,
        reviewer_inactivity_timeout_min: data.reviewer_inactivity_timeout_min,
        reviewer_otp_enabled: !!data.reviewer_otp_enabled,
        case_delete_enabled: data.case_delete_enabled !== undefined ? !!data.case_delete_enabled : true,
        reopen_enabled: data.reopen_enabled !== undefined ? !!data.reopen_enabled : true,
      });
    }).catch(() => {
      setSettings({ ...DOMAIN_SETTINGS[selectedDomain] });
    });
  }, [selectedDomain]);

  const showToast = (type, message) => setToast({ type, message });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const addCloseReason = () => {
    const trimmed = newCloseReason.trim();
    if (!trimmed) { showToast("warning", "Kapatma nedeni boş olamaz"); return; }
    if (trimmed.length < 3) { showToast("warning", "Kapatma nedeni en az 3 karakter olmalıdır"); return; }
    if (trimmed.length > 150) { showToast("warning", "Kapatma nedeni en fazla 150 karakter olabilir"); return; }
    if (settings.close_reasons.includes(trimmed)) { showToast("error", "Bu kapatma nedeni zaten mevcut."); return; }
    if (settings.close_reasons.length >= 20) { showToast("warning", "En fazla 20 kapatma nedeni eklenebilir"); return; }
    updateSetting("close_reasons", [...settings.close_reasons, trimmed]);
    setNewCloseReason("");
  };

  const removeCloseReason = (reason) => {
    if (settings.close_reasons.length <= 1) { showToast("error", "En az bir kapatma nedeni bulunmalıdır."); return; }
    updateSetting("close_reasons", settings.close_reasons.filter(r => r !== reason));
  };

  const addDomain = () => {
    const trimmed = newDomainLabel.trim();
    if (!trimmed) { showToast("warning", "Domain adı boş olamaz"); return; }
    if (trimmed.length < 2) { showToast("warning", "Domain adı en az 2 karakter olmalıdır"); return; }
    if (trimmed.length > 60) { showToast("warning", "Domain adı en fazla 60 karakter olabilir"); return; }
    // Generate safe ASCII id
    const id = trimmed.toLowerCase()
      .replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u")
      .replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"");
    if (!id) { showToast("error", "Geçerli bir domain ID üretilemedi. Lütfen Latin harf veya rakam içeren bir ad girin."); return; }
    if (domains.find(d => d.id === id)) { showToast("error", "Bu isimde bir domain zaten mevcut."); return; }
    settingsApi.createDomain({ id, label: trimmed, icon: "🔍", created_by: USERS[currentRole]?.name || "System" })
      .then(newDom => {
        const updated = [...domains, newDom];
        setDomains(updated);
        if (onDomainsChange) onDomainsChange(updated);
        setNewDomainLabel("");
        showToast("success", `"${trimmed}" domaini eklendi`);
      }).catch(err => showToast("error", err.message || "Domain eklenemedi"));
  };

  const removeDomain = (id) => {
    if (domains.length <= 1) { showToast("error", "En az bir domain bulunmalıdır."); return; }
    setConfirmModal({
      title: "Domain Sil",
      message: `"${domains.find(d => d.id === id)?.label}" domainini kaldırmak istediğinize emin misiniz? Bu domain için ayarlar korunur, ancak yeni vakalar oluşturulamaz.`,
      onConfirm: () => {
        setConfirmModal(null);
        settingsApi.deleteDomain(id)
          .then(() => {
            const updated = domains.filter(d => d.id !== id);
            setDomains(updated);
            if (onDomainsChange) onDomainsChange(updated);
            showToast("success", "Domain kaldırıldı");
          }).catch(err => showToast("error", err.message || "Domain kaldırılamadı"));
      },
    });
  };

  const handleSave = () => {
    setConfirmModal({
      title: "Ayarları Kaydet",
      message: `"${domains.find(d => d.id === selectedDomain)?.label}" domaini için yapılan değişiklikleri kaydetmek istediğinize emin misiniz?`,
      onConfirm: () => {
        setHasChanges(false);
        setConfirmModal(null);
        // Persist to API
        settingsApi.updateDomain(selectedDomain, { ...settings, updated_by: USERS[currentRole]?.name || 'System' }).catch(() => {});
        showToast("success", "Ayarlar başarıyla kaydedildi. Denetim izi güncellendi.");
      },
    });
  };

  const handleDiscard = () => {
    settingsApi.getDomain(selectedDomain).then(data => {
      setSettings({
        maker_checker_enabled: !!data.maker_checker_enabled,
        notification_enabled: !!data.notification_enabled,
        default_currency: data.default_currency,
        close_reasons: Array.isArray(data.close_reasons) ? data.close_reasons : JSON.parse(data.close_reasons || '[]'),
        reviewer_link_expiry_hours: data.reviewer_link_expiry_hours,
        reviewer_inactivity_timeout_min: data.reviewer_inactivity_timeout_min,
        reviewer_otp_enabled: !!data.reviewer_otp_enabled,
        case_delete_enabled: data.case_delete_enabled !== undefined ? !!data.case_delete_enabled : true,
        reopen_enabled: data.reopen_enabled !== undefined ? !!data.reopen_enabled : true,
      });
    }).catch(() => {
      setSettings({ ...DOMAIN_SETTINGS[selectedDomain] });
    });
    setHasChanges(false);
    showToast("warning", "Değişiklikler geri alındı.");
  };

  // Role management functions
  const openCreateRole = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDesc("");
    setRolePerms([]);
    setExpandedCategories(PERMISSION_CATEGORIES.map(c => c.key));
    setRoleModalOpen(true);
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description);
    setRolePerms([...role.permissions]);
    setExpandedCategories(PERMISSION_CATEGORIES.map(c => c.key));
    setRoleModalOpen(true);
  };

  const openDuplicateRole = (role) => {
    setEditingRole(null);
    setRoleName(role.name + " (Kopya)");
    setRoleDesc(role.description);
    setRolePerms([...role.permissions]);
    setExpandedCategories(PERMISSION_CATEGORIES.map(c => c.key));
    setRoleModalOpen(true);
  };

  const togglePerm = (permKey) => {
    setRolePerms(prev => prev.includes(permKey) ? prev.filter(p => p !== permKey) : [...prev, permKey]);
  };

  const toggleCategory = (catKey) => {
    const cat = PERMISSION_CATEGORIES.find(c => c.key === catKey);
    const catPerms = cat.permissions.map(p => p.key);
    const allSelected = catPerms.every(p => rolePerms.includes(p));
    if (allSelected) {
      setRolePerms(prev => prev.filter(p => !catPerms.includes(p)));
    } else {
      setRolePerms(prev => [...new Set([...prev, ...catPerms])]);
    }
  };

  const toggleExpandCategory = (catKey) => {
    setExpandedCategories(prev => prev.includes(catKey) ? prev.filter(k => k !== catKey) : [...prev, catKey]);
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) { showToast("error", "Rol adı zorunludur."); return; }
    if (roleName.trim().length < 2) { showToast("error", "Rol adı en az 2 karakter olmalıdır."); return; }
    if (roleName.trim().length > 50) { showToast("error", "Rol adı en fazla 50 karakter olabilir."); return; }
    if (roleDesc.trim().length > 200) { showToast("error", "Rol açıklaması en fazla 200 karakter olabilir."); return; }
    const duplicate = roles.find(r => r.name.toLowerCase() === roleName.trim().toLowerCase() && (!editingRole || r.id !== editingRole.id));
    if (duplicate) { showToast("error", "Bu isimde bir rol zaten mevcut."); return; }
    if (rolePerms.length === 0) { showToast("error", "En az bir yetki seçilmelidir."); return; }
    if (editingRole) {
      setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, name: roleName.trim(), description: roleDesc.trim(), permissions: rolePerms } : r));
      showToast("success", `"${roleName.trim()}" rolü güncellendi.`);
    } else {
      const newId = roleName.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + "_" + Date.now();
      setRoles(prev => [...prev, { id: newId, name: roleName.trim(), description: roleDesc.trim(), isDefault: false, userCount: 0, color: "#6366F1", permissions: rolePerms }]);
      showToast("success", `"${roleName.trim()}" rolü oluşturuldu.`);
    }
    setRoleModalOpen(false);
  };

  const settingsSections = [
    { key: "system", label: "Sistem Ayarları", icon: <Icons.Shield /> },
    { key: "domains_mgmt", label: "Domain Yönetimi", icon: <Icons.Globe /> },
    { key: "notification", label: "Bildirim & E-posta", icon: <Icons.Mail /> },
    { key: "roles", label: "Rol Yönetimi", icon: <Icons.Key /> },
  ];

  const domainLabel = domains.find(d => d.id === selectedDomain)?.label || "";





  return (
    <div className="scm-layout">
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        *::-webkit-scrollbar { width: 6px; } *::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        input:focus, textarea:focus, select:focus { outline: 2px solid ${C.primaryLight}; outline-offset: -1px; }
      `}</style>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Sidebar
        activePage="settings"
        onNavigate={onNavigate}
        user={USERS[currentRole]}
        selectedDomain={selectedDomain}
        onDomainChange={onDomainChange}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(c => !c)}
        notifications={notifications}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
        fraudDomains={domains}
      />

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{
          padding: "16px 28px", background: "#fff", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>Ayarlar</h1>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.textSecondary }}>
              Sistem yapılandırma ve yönetişim ayarları — <span style={{ fontWeight: 600, color: C.primaryLight }}>{domainLabel}</span>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              {["analyst", "manager", "admin", "super"].map(role => (
                <button key={role} onClick={() => onRoleChange && onRoleChange(role)} style={{ padding: "6px 14px", fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", background: currentRole === role ? C.primary : "#fff", color: currentRole === role ? "#fff" : C.textSecondary, transition: "all 0.15s ease" }}>
                  {role === "analyst" ? "Analist" : role === "manager" ? "Yönetici" : role === "admin" ? "Admin" : "Super"}
                </button>
              ))}
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", fontSize: 12, color: C.textSecondary }}><Icons.Globe /> TR</button>
            {hasChanges && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, animation: "fadeIn 0.2s ease" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 12, color: C.warning, fontWeight: 600 }}>Kaydedilmemiş değişiklikler</span>
                <button onClick={handleDiscard} style={{ ...btnStyle, background: "#fff", color: C.textSecondary, border: `1px solid ${C.border}` }}>
                  Geri Al
                </button>
                <button onClick={handleSave} style={{ ...btnStyle, background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(30,64,175,0.3)" }}>
                  <Icons.Save /> Kaydet
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Settings Sidebar (sub-navigation) */}
          <div style={{ width: 240, background: "#fff", borderRight: `1px solid ${C.border}`, padding: "16px 12px", flexShrink: 0, overflow: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 12px", marginBottom: 8 }}>Yapılandırma</div>
            {settingsSections.map(section => (
              <button key={section.key}
                onClick={() => !section.disabled && setActiveSection(section.key)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8, border: "none",
                  background: activeSection === section.key ? "#EFF6FF" : "transparent",
                  color: section.disabled ? "#CBD5E1" : activeSection === section.key ? C.primary : C.text,
                  cursor: section.disabled ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: activeSection === section.key ? 600 : 500,
                  fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                  transition: "all 0.15s ease", marginBottom: 2,
                  opacity: section.disabled ? 0.5 : 1,
                }}
              >
                {section.icon}
                <span>{section.label}</span>
              </button>
            ))}

            {/* Domain info card */}
            <div style={{ marginTop: 20, padding: 14, background: "#F8FAFC", borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Aktif Domain</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{domains.find(d => d.id === selectedDomain)?.icon}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{domainLabel}</div>
                  <div style={{ fontSize: 10.5, color: C.textSecondary }}>Domain bazlı ayarlar</div>
                </div>
              </div>
              <div style={{ fontSize: 10.5, color: C.textSecondary, lineHeight: 1.5 }}>
                Her domain kendi bağımsız ayar setine sahiptir. Burada yaptığınız değişiklikler yalnızca seçili domaini etkiler.
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
            {/* SYSTEM SETTINGS */}
            {activeSection === "system" && (
              <div style={{ animation: "slideUp 0.3s ease" }}>
                <SectionHeader icon={<Icons.Shield />} title="Sistem Ayarları" subtitle="Maker-Checker yönetişimi ve operasyonel parametreler" />

                {/* Maker-Checker */}
                <SettingCard
                  icon={<Icons.Shield />}
                  title="Maker-Checker (Çift Onay)"
                  description="Açıldığında vaka kapatma işlemi için ikinci bir kullanıcının onayı (Checker) gerekir. Vaka silme işlemi bu ayardan bağımsız olarak her zaman Maker-Checker sürecine tabidir."
                  badge={settings.maker_checker_enabled ? { label: "Aktif", color: C.success } : { label: "Pasif", color: C.textSecondary }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 12.5, color: C.textSecondary }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, background: "#F1F5F9", padding: "2px 8px", borderRadius: 4, marginRight: 8 }}>maker_checker_enabled</span>
                      Varsayılan: <strong>Açık</strong>
                    </div>
                    <Toggle checked={settings.maker_checker_enabled} onChange={v => updateSetting("maker_checker_enabled", v)} />
                  </div>
                  {/* Info box about case deletion */}
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Icons.Info />
                    <div style={{ fontSize: 11.5, color: "#92400E", lineHeight: 1.5 }}>
                      <strong>Not:</strong> Vaka silme özelliği ayrı bir ayarla kontrol edilir. Silme aktifken, işlem her zaman Maker-Checker sürecine tabidir.
                    </div>
                  </div>
                </SettingCard>

                {/* Case Delete Toggle */}
                <SettingCard
                  icon={<Icons.Trash />}
                  title="Vaka Silme"
                  description="Açıldığında kullanıcılar vakaları silebilir. Kapatıldığında vaka silme opsiyonu hiçbir kullanıcı için görünmez."
                  badge={settings.case_delete_enabled ? { label: "Aktif", color: C.success } : { label: "Pasif", color: C.textSecondary }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 12.5, color: C.textSecondary }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, background: "#F1F5F9", padding: "2px 8px", borderRadius: 4, marginRight: 8 }}>case_delete_enabled</span>
                      Varsayılan: <strong>Açık</strong>
                    </div>
                    <Toggle checked={settings.case_delete_enabled} onChange={v => updateSetting("case_delete_enabled", v)} />
                  </div>
                  {settings.case_delete_enabled && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Icons.Info />
                      <div style={{ fontSize: 11.5, color: "#92400E", lineHeight: 1.5 }}>
                        <strong>Not:</strong> Vaka silme işlemi aktif olduğunda bile her zaman Maker-Checker sürecine tabidir.
                      </div>
                    </div>
                  )}
                </SettingCard>

                {/* Reopen Case Toggle */}
                <SettingCard
                  icon={<Icons.Unlock />}
                  title="Kapatılmış Vaka Yeniden Açma"
                  description="Açıldığında kullanıcılar kapatılmış vakaları yeniden açma talebinde bulunabilir. Yeniden açma işlemi her zaman Maker-Checker onayına tabidir. Kapatıldığında hiçbir kullanıcı kapatılmış vaka açamaz."
                  badge={settings.reopen_enabled ? { label: "Aktif", color: C.success } : { label: "Pasif", color: C.textSecondary }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 12.5, color: C.textSecondary }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, background: "#F1F5F9", padding: "2px 8px", borderRadius: 4, marginRight: 8 }}>reopen_enabled</span>
                      Varsayılan: <strong>Açık</strong>
                    </div>
                    <Toggle checked={settings.reopen_enabled} onChange={v => updateSetting("reopen_enabled", v)} />
                  </div>
                  {settings.reopen_enabled && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Icons.Info />
                      <div style={{ fontSize: 11.5, color: "#92400E", lineHeight: 1.5 }}>
                        <strong>Not:</strong> Yeniden açma işlemi aktif olduğunda bile her zaman Maker-Checker sürecine tabidir. Maker-Checker kapalı olsa dahi bu kural geçerlidir.
                      </div>
                    </div>
                  )}
                </SettingCard>

                {/* Default Currency */}
                <SettingCard
                  icon={<Icons.Currency />}
                  title="Varsayılan Para Birimi"
                  description="İşlem ve vaka listelerinde varsayılan olarak gösterilecek para birimi. SFD'den gelen orijinal para birimi veya dönüştürülmüş değerler gösterilebilir."
                >
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    {CURRENCY_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => updateSetting("default_currency", opt.value)}
                        style={{
                          flex: 1, padding: "12px 14px", borderRadius: 10,
                          border: `2px solid ${settings.default_currency === opt.value ? C.primaryLight : C.border}`,
                          background: settings.default_currency === opt.value ? "#EFF6FF" : "#fff",
                          cursor: "pointer", textAlign: "left", transition: "all 0.15s ease",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: settings.default_currency === opt.value ? C.primary : C.text, marginBottom: 4 }}>
                          {settings.default_currency === opt.value && <span style={{ marginRight: 6 }}>●</span>}
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.4 }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </SettingCard>

                {/* Close Reasons */}
                <SettingCard
                  icon={<Icons.XCircle />}
                  title="Vaka Kapatma Nedenleri"
                  description="Vaka kapatılırken seçilebilecek neden listesi. Her domain için farklı neden seti tanımlanabilir. Kapatma nedeni FDM'deki case tablosuna (close_reason) kaydedilir."
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {settings.close_reasons?.map((reason, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px 6px 14px", borderRadius: 8, background: "#F8FAFC", border: `1px solid ${C.border}`, fontSize: 12.5, color: C.text, fontWeight: 500 }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#EFF6FF", color: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                        {reason}
                        <button onClick={() => removeCloseReason(reason)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", padding: 2, marginLeft: 2, borderRadius: 4, transition: "color 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.color = C.danger}
                          onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>
                          <Icons.X />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={newCloseReason}
                      onChange={e => setNewCloseReason(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addCloseReason()}
                      placeholder="Yeni kapatma nedeni ekle..."
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={addCloseReason}
                      style={{ ...btnStyle, background: newCloseReason.trim() ? "#EFF6FF" : "#F8FAFC", color: newCloseReason.trim() ? C.primary : C.textSecondary, border: `1.5px solid ${newCloseReason.trim() ? "#BFDBFE" : C.border}`, cursor: newCloseReason.trim() ? "pointer" : "default" }}>
                      <Icons.Plus /> Ekle
                    </button>
                  </div>
                </SettingCard>

                {/* External Reviewer Settings */}
                <SettingCard
                  icon={<Icons.ExternalLink />}
                  title="Dış Reviewer Ayarları"
                  description="Sistem dışı kişilerin (şube operatörü, uyum birimi) e-posta ile review'a davet edilmesi için güvenlik parametreleri."
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 4 }}>
                    {/* Magic Link Expiry */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Magic Link Geçerlilik Süresi
                      </label>
                      <select value={settings.reviewer_link_expiry_hours} onChange={e => updateSetting("reviewer_link_expiry_hours", Number(e.target.value))}
                        style={{ ...inputStyle, cursor: "pointer" }}>
                        <option value={24}>24 saat</option>
                        <option value={48}>48 saat</option>
                        <option value={72}>72 saat</option>
                        <option value={96}>96 saat</option>
                        <option value={168}>1 hafta</option>
                      </select>
                      <div style={{ fontSize: 10.5, color: C.textSecondary, marginTop: 4 }}>Tek kullanımlık (single-use) link</div>
                    </div>

                    {/* Inactivity Timeout */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        İnaktivite Zaman Aşımı
                      </label>
                      <select value={settings.reviewer_inactivity_timeout_min} onChange={e => updateSetting("reviewer_inactivity_timeout_min", Number(e.target.value))}
                        style={{ ...inputStyle, cursor: "pointer" }}>
                        <option value={10}>10 dakika</option>
                        <option value={15}>15 dakika</option>
                        <option value={20}>20 dakika</option>
                        <option value={30}>30 dakika</option>
                        <option value={60}>60 dakika</option>
                      </select>
                      <div style={{ fontSize: 10.5, color: C.textSecondary, marginTop: 4 }}>İşlem yapılmazsa oturum sona erer</div>
                    </div>

                    {/* OTP Toggle */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        OTP Doğrulama
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                        <Toggle checked={settings.reviewer_otp_enabled} onChange={v => updateSetting("reviewer_otp_enabled", v)} />
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: settings.reviewer_otp_enabled ? C.success : C.textSecondary }}>
                          {settings.reviewer_otp_enabled ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <div style={{ fontSize: 10.5, color: C.textSecondary, marginTop: 4 }}>6 haneli OTP, maskeli e-posta</div>
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {/* DOMAIN MANAGEMENT */}
            {activeSection === "domains_mgmt" && (
              <div style={{ animation: "slideUp 0.3s ease" }}>
                <SectionHeader icon={<Icons.Globe />} title="Domain Yönetimi" subtitle="Sistemde tanımlı fraud domain'lerini yönetin. Eklenen domain'ler tüm sayfalardaki seçim listelerinde görünür." />

                <SettingCard
                  icon={<Icons.Globe />}
                  title="Tanımlı Domain'ler"
                  description="Her domain bağımsız ayar setine, vaka listesine ve raporlara sahiptir. Yeni domain eklendiğinde varsayılan ayarlarla otomatik oluşturulur."
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    {domains.map((domain) => (
                      <div key={domain.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 8px 14px", borderRadius: 10, background: "#F8FAFC", border: `1px solid ${C.border}`, fontSize: 13, color: C.text, fontWeight: 500 }}>
                        <span style={{ fontSize: 16, lineHeight: 1 }}>{domain.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12.5 }}>{domain.label}</div>
                          <div style={{ fontSize: 10.5, color: C.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{domain.id}</div>
                        </div>
                        {(currentRole === "super" || currentRole === "admin") && (
                          <button
                            onClick={() => removeDomain(domain.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", padding: 2, marginLeft: 4, borderRadius: 4, transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = C.danger}
                            onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
                            title="Domain'i kaldır"
                          >
                            <Icons.X />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {(currentRole === "super" || currentRole === "admin") && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={newDomainLabel}
                        onChange={e => setNewDomainLabel(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addDomain()}
                        placeholder="Yeni domain adı (örn. Mobil Bankacılık Fraud)..."
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button
                        onClick={addDomain}
                        style={{ ...btnStyle, background: newDomainLabel.trim() ? "#EFF6FF" : "#F8FAFC", color: newDomainLabel.trim() ? C.primary : C.textSecondary, border: `1.5px solid ${newDomainLabel.trim() ? "#BFDBFE" : C.border}`, cursor: newDomainLabel.trim() ? "pointer" : "default", flexShrink: 0 }}
                      >
                        <Icons.Plus /> Ekle
                      </button>
                    </div>
                  )}
                  {!(currentRole === "super" || currentRole === "admin") && (
                    <div style={{ padding: "10px 14px", background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A", display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "#92400E" }}>
                      <Icons.Info />
                      Domain eklemek/kaldırmak için Admin veya Super Admin yetkisi gereklidir.
                    </div>
                  )}
                </SettingCard>
              </div>
            )}

            {/* NOTIFICATION SETTINGS */}
            {activeSection === "notification" && (
              <div style={{ animation: "slideUp 0.3s ease" }}>
                <SectionHeader icon={<Icons.Mail />} title="Bildirim & E-posta Ayarları" subtitle="Sistem bildirimleri ve e-posta gönderim tercihleri" />

                <SettingCard
                  icon={<Icons.Mail />}
                  title="E-posta Bildirimleri"
                  description="Sistem bildirimleri için e-posta gönderimi. Kapalı olduğunda yalnızca uygulama içi bildirimler aktif kalır."
                  badge={settings.notification_enabled ? { label: "Aktif", color: C.success } : { label: "Pasif", color: C.textSecondary }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 12.5, color: C.textSecondary }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, background: "#F1F5F9", padding: "2px 8px", borderRadius: 4, marginRight: 8 }}>notification_enabled</span>
                      Varsayılan: <strong>Kapalı</strong>
                    </div>
                    <Toggle checked={settings.notification_enabled} onChange={v => updateSetting("notification_enabled", v)} />
                  </div>
                </SettingCard>

                {/* Notification Scope */}
                <SettingCard
                  icon={<Icons.Bell />}
                  title="E-posta Bildirim Kapsamı"
                  description="Aşağıdaki olaylar hem uygulama içi bildirim hem de e-posta olarak gönderilir."
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                    {[
                      { label: "Vaka Kapatma Onayı", desc: "Maker-Checker onay talepleri" },
                      { label: "Vaka Silme Onayı", desc: "Silme onay talepleri" },
                      { label: "Onay Kararı", desc: "Onaylandı / Reddedildi sonuçları" },
                      { label: "Vaka Atandı", desc: "Kullanıcıya vaka atama bildirimi" },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: "10px 14px", background: settings.notification_enabled ? "#F8FAFC" : "#FAFAFA", borderRadius: 8, border: `1px solid ${settings.notification_enabled ? C.border : "#E5E7EB"}`, opacity: settings.notification_enabled ? 1 : 0.5 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: C.textSecondary }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </SettingCard>
              </div>
            )}

            {/* ROLE MANAGEMENT */}
            {activeSection === "roles" && (
              <div style={{ animation: "slideUp 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <SectionHeader icon={<Icons.Key />} title="Rol Yönetimi" subtitle="Atomik yetkileri paketleyerek parametrik roller oluşturun" />
                  <button onClick={openCreateRole} style={{ ...btnStyle, background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(30,64,175,0.3)" }}>
                    <Icons.Plus /> Yeni Rol Oluştur
                  </button>
                </div>

                {/* Info banner */}
                <div style={{ padding: "14px 18px", background: "#EFF6FF", borderRadius: 10, border: "1px solid #BFDBFE", marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Icons.Info />
                  <div style={{ fontSize: 12, color: C.primary, lineHeight: 1.6 }}>
                    SCM, yetki tabanlı erişim modeli kullanır. Önce atomik yetkiler tanımlanır, ardından bu yetkiler paketlenerek roller oluşturulur.
                    Maker-Checker onay yetkisi dahil tüm yetkiler parametrik olarak rollere atanabilir.
                  </div>
                </div>

                {/* Role Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {roles.map(role => {
                    const permCount = role.permissions.length;
                    const totalPerms = ALL_PERMISSIONS.length;
                    const pct = Math.round((permCount / totalPerms) * 100);
                    return (
                      <div key={role.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 22px", transition: "box-shadow 0.2s", cursor: "default" }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                      >
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${role.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Icons.Key />
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 14.5, fontWeight: 700, color: C.text }}>{role.name}</span>
                                {role.isDefault && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#F1F5F9", color: C.textSecondary }}>Varsayılan</span>}
                              </div>
                              <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{role.userCount} kullanıcı</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => openDuplicateRole(role)} title="Kopyala" style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.textSecondary, transition: "all 0.15s" }}><Icons.Copy /></button>
                            <button onClick={() => openEditRole(role)} title="Düzenle" style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.textSecondary, transition: "all 0.15s" }}><Icons.Edit /></button>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{ margin: "0 0 14px", fontSize: 11.5, color: C.textSecondary, lineHeight: 1.5 }}>{role.description}</p>

                        {/* Permission bar */}
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 10.5, fontWeight: 600, color: C.textSecondary }}>{permCount} / {totalPerms} yetki</span>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: role.color }}>{pct}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: "#F1F5F9", overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 3, background: role.color, width: `${pct}%`, transition: "width 0.3s ease" }} />
                          </div>
                        </div>

                        {/* Permission pills preview */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {role.permissions.slice(0, 6).map(p => {
                            const perm = ALL_PERMISSIONS.find(ap => ap.key === p);
                            return perm ? (
                              <span key={p} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#F8FAFC", border: `1px solid ${C.border}`, color: C.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{p}</span>
                            ) : null;
                          })}
                          {role.permissions.length > 6 && (
                            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#EFF6FF", color: C.primaryLight, fontWeight: 600 }}>+{role.permissions.length - 6}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ═══ ROLE CREATE/EDIT MODAL ═══ */}
      {roleModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}>
          <div style={{ background: "#fff", borderRadius: 16, maxWidth: 720, width: "95%", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "scaleIn 0.2s ease" }}>
            {/* Modal Header */}
            <div style={{ padding: "22px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{editingRole ? "Rolü Düzenle" : "Yeni Rol Oluştur"}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textSecondary }}>Atomik yetkileri seçerek rol paketini yapılandırın</p>
              </div>
              <button onClick={() => setRoleModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", padding: 4 }}><Icons.X /></button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflow: "auto", padding: "22px 28px" }}>
              {/* Role Name & Description */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
                <FormField label="Rol Adı" required>
                  <input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="ör. Kıdemli Analist" style={inputStyle} />
                </FormField>
                <FormField label="Açıklama">
                  <input value={roleDesc} onChange={e => setRoleDesc(e.target.value)} placeholder="Rolün kısa tanımı" style={inputStyle} />
                </FormField>
              </div>

              {/* Permission Selection */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Yetkiler <span style={{ fontWeight: 500, color: C.textSecondary }}>({rolePerms.length} / {ALL_PERMISSIONS.length} seçili)</span></div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setRolePerms(ALL_PERMISSIONS.map(p => p.key))} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", color: C.primaryLight, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Tümünü Seç</button>
                    <button onClick={() => setRolePerms([])} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", color: C.textSecondary, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Temizle</button>
                  </div>
                </div>

                {/* Permission Categories */}
                {PERMISSION_CATEGORIES.map(cat => {
                  const catPerms = cat.permissions.map(p => p.key);
                  const selectedCount = catPerms.filter(p => rolePerms.includes(p)).length;
                  const allSelected = selectedCount === catPerms.length;
                  const someSelected = selectedCount > 0 && !allSelected;
                  const isExpanded = expandedCategories.includes(cat.key);
                  return (
                    <div key={cat.key} style={{ border: `1px solid ${selectedCount > 0 ? "#BFDBFE" : C.border}`, borderRadius: 10, marginBottom: 8, overflow: "hidden", background: selectedCount > 0 ? "#FAFCFF" : "#fff", transition: "all 0.15s" }}>
                      {/* Category Header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer" }} onClick={() => toggleExpandCategory(cat.key)}>
                        <button onClick={e => { e.stopPropagation(); toggleCategory(cat.key); }}
                          style={{
                            width: 20, height: 20, borderRadius: 4, border: `2px solid ${allSelected ? C.primaryLight : someSelected ? C.primaryLight : C.border}`,
                            background: allSelected ? C.primaryLight : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s",
                          }}>
                          {allSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          {someSelected && <div style={{ width: 10, height: 2, background: C.primaryLight, borderRadius: 1 }} />}
                        </button>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.text }}>{cat.label}</span>
                        <span style={{ fontSize: 11, color: C.textSecondary, fontWeight: 500 }}>{selectedCount}/{catPerms.length}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}><polyline points="6 9 12 15 18 9"/></svg>
                      </div>

                      {/* Permissions */}
                      {isExpanded && (
                        <div style={{ padding: "0 14px 10px" }}>
                          {cat.permissions.map(perm => {
                            const isChecked = rolePerms.includes(perm.key);
                            return (
                              <div key={perm.key} onClick={() => togglePerm(perm.key)}
                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", transition: "background 0.1s", marginBottom: 2, background: isChecked ? "#EFF6FF" : "transparent" }}
                                onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = "#F8FAFC"; }}
                                onMouseLeave={e => { if (!isChecked) e.currentTarget.style.background = "transparent"; }}
                              >
                                <div style={{
                                  width: 18, height: 18, borderRadius: 4, border: `2px solid ${isChecked ? C.primaryLight : C.border}`,
                                  background: isChecked ? C.primaryLight : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s",
                                }}>
                                  {isChecked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 12.5, fontWeight: isChecked ? 600 : 500, color: isChecked ? C.primary : C.text }}>{perm.label}</span>
                                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: C.textSecondary, background: "#F1F5F9", padding: "1px 6px", borderRadius: 3 }}>{perm.key}</span>
                                  </div>
                                  <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 1 }}>{perm.desc}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 28px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: C.textSecondary }}>
                <strong style={{ color: C.primaryLight }}>{rolePerms.length}</strong> yetki seçildi
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setRoleModalOpen(false)} style={{ ...btnStyle, background: "#fff", color: C.textSecondary, border: `1px solid ${C.border}` }}>İptal</button>
                <button onClick={handleSaveRole} style={{ ...btnStyle, background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(30,64,175,0.3)", opacity: (!roleName.trim() || rolePerms.length === 0) ? 0.5 : 1 }}>
                  <Icons.Check /> {editingRole ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONFIRM MODAL ═══ */}
      {confirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", maxWidth: 440, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "scaleIn 0.2s ease" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: C.text }}>{confirmModal.title}</h3>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{confirmModal.message}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmModal(null)} style={{ ...btnStyle, background: "#fff", color: C.textSecondary, border: `1px solid ${C.border}` }}>İptal</button>
              <button onClick={confirmModal.onConfirm} style={{ ...btnStyle, background: "linear-gradient(135deg, #1E40AF, #2563EB)", color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(30,64,175,0.3)" }}>
                <Icons.Check /> Onayla ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REUSABLE SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ color: C.primaryLight }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text }}>{title}</h2>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, color: C.textSecondary, paddingLeft: 30 }}>{subtitle}</p>
    </div>
  );
}

function SettingCard({ icon, title, description, badge, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px 24px", marginBottom: 16, transition: "box-shadow 0.2s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: C.primaryLight, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.text }}>{title}</h3>
            {badge && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: badge.color === C.success ? "#DCFCE7" : "#F1F5F9", color: badge.color }}>{badge.label}</span>
            )}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label} {required && <span style={{ color: C.danger }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// Shared styles
const btnStyle = {
  display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
  borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", transition: "all 0.15s",
};

const inputStyle = {
  width: "100%", padding: "9px 14px", borderRadius: 8,
  border: `1.5px solid ${C.border}`, fontSize: 13,
  background: "#F8FAFC", color: C.text,
  fontFamily: "'DM Sans', sans-serif",
};
