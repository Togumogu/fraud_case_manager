import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const USERS = {
  analyst: { id: 1, name: "Elif Yılmaz", role: "analyst", roleLabel: "Fraud Analist" },
  manager: { id: 2, name: "Burak Şen", role: "manager", roleLabel: "Yönetici" },
  admin: { id: 3, name: "Zeynep Demir", role: "admin", roleLabel: "Admin" },
};
const FRAUD_DOMAINS = [
  { id: "payment", label: "Payment Fraud", icon: "₺", color: "#0891B2" },
  { id: "credit_card", label: "Credit Card Fraud", icon: "💳", color: "#8B5CF6" },
  { id: "application", label: "Application Fraud", icon: "📋", color: "#F59E0B" },
  { id: "account_takeover", label: "Account Takeover", icon: "🔓", color: "#EF4444" },
  { id: "internal", label: "Internal Fraud", icon: "🏢", color: "#6366F1" },
];
const NOTIFICATIONS = [
  { id: 1, msg: "Fraud Özet Raporu hazırlandı", time: "5 dk önce", read: false },
  { id: 2, msg: "Vaka Aktivite Raporu gönderildi", time: "1 sa önce", read: false },
  { id: 3, msg: "Sistem bakımı planlandı", time: "2 sa önce", read: true },
];
const ACTIVE_USERS_LIST = ["Elif Yılmaz","Mehmet Öz","Ayşe Tan","Can Yıldız","Burak Şen","Selin Aydın"];

const REPORT_CATEGORIES = [
  { id:"case", label:"Vaka Raporları", icon:"folder", color:"#3B82F6", reports:[
    { id:"case_report", name:"Case Report", desc:"Vaka detayları ve durum özeti" },
    { id:"case_activity", name:"Vaka Aktivite Özeti", desc:"Dönemsel vaka sayısı, statü dağılımı, kapatma kararları" },
    { id:"case_txn_relation", name:"İşlem-Vaka İlişki Raporu", desc:"İşaretlenen işlemlere karşılık vakalar ve oranlar" },
    { id:"vaka_raporu", name:"Vaka Raporu", desc:"Tüm vaka bilgileri detaylı rapor" },
  ]},
  { id:"fraud", label:"Fraud & Senaryo Raporları", icon:"shield", color:"#EF4444", reports:[
    { id:"fraud_summary", name:"Fraud Özet Raporu", desc:"Fraud işlemler, tutarlar, banka/müşteri payları" },
    { id:"scenario_status", name:"Senaryo Durum Raporu", desc:"Senaryo bazlı durum ve sonuçlar" },
    { id:"scenario_summary", name:"Senaryo Özet Raporu", desc:"Tüm senaryolar için özet bilgiler" },
    { id:"scenario_fraud", name:"Senaryo Bazlı Sahtekarlık", desc:"Senaryo bazında sahtekarlık analizi" },
    { id:"scenario_close", name:"Senaryo İşlem Kapama", desc:"Senaryo bazında kapatılan işlemler" },
    { id:"scenario_channel", name:"Senaryo Kanal Kodu Fraud Sayısı", desc:"Kanal bazında senaryo fraud" },
    { id:"scenario_action", name:"Aksiyonlara Göre Senaryo", desc:"Aksiyon türlerine göre senaryo dağılımı" },
  ]},
  { id:"alert", label:"Alert & Aksiyon Raporları", icon:"bell", color:"#F59E0B", reports:[
    { id:"alert_report", name:"Alert Report", desc:"Alert detayları ve istatistikleri" },
    { id:"alarm_action", name:"Alarm Aksiyon Adetleri", desc:"Alarm bazlı aksiyon sayıları" },
    { id:"hourly_alarm", name:"Saat Bazında Alarm Listesi", desc:"Saatlik alarm dağılımı" },
    { id:"realtime_action", name:"Real Time Aksiyon Raporu", desc:"Gerçek zamanlı aksiyon sonuçları" },
    { id:"channel_action", name:"Kanal Bazlı Aksiyon", desc:"Kanal bazında aksiyon dağılımı" },
    { id:"manual_action", name:"Manuel Aksiyon Raporu", desc:"Manuel yapılan aksiyonlar" },
  ]},
  { id:"transaction", label:"İşlem Raporları", icon:"list", color:"#0891B2", reports:[
    { id:"all_transactions", name:"Tüm İşlemler Raporu", desc:"Dönemsel tüm işlem listesi" },
    { id:"transfer_detail", name:"Transfer Detay Raporu", desc:"Transfer işlem detayları" },
    { id:"iban_report", name:"IBAN Raporu", desc:"IBAN bazında işlem analizi" },
    { id:"txn_amount_channel", name:"İşlem Tutarı - Kanal Kodu", desc:"Kanal bazında işlem tutarı ve fraud" },
  ]},
  { id:"user", label:"Kullanıcı Raporları", icon:"users", color:"#8B5CF6", reports:[
    { id:"user_based", name:"Kullanıcı Bazlı Rapor", desc:"Kullanıcı performans metrikleri" },
    { id:"user_sla", name:"Kullanıcı SLA Raporu", desc:"SLA uyumluluk oranları" },
    { id:"user_activity", name:"Kullanıcı Aktivite Raporu", desc:"Kullanıcı bazında vaka sayıları", adminOnly:true },
    { id:"user_close", name:"Kullanıcı İşlem Kapama", desc:"Kullanıcı bazında kapama istatistikleri" },
    { id:"agent_close", name:"Agent Close Raporu", desc:"Agent bazında kapatma metrikleri" },
    { id:"top_fraud_saver", name:"En Çok Fraud Kurtaran", desc:"Fraud önleme performans sıralaması" },
  ]},
  { id:"performance", label:"Performans & Analiz", icon:"chart", color:"#059669", reports:[
    { id:"rule_performance", name:"Kural Performans Raporu", desc:"Kural bazında tetiklenme oranları" },
    { id:"top_fraud_scenario", name:"En Çok Fraud Yakalayan Senaryo", desc:"Senaryo başarı sıralaması" },
    { id:"top_reject", name:"En Çok Red Veren Senaryo", desc:"Online red veren senaryolar" },
    { id:"no_catch", name:"İşlem Yakalamayan Senaryolar", desc:"Performans altı senaryolar" },
    { id:"department_report", name:"Bölüm Raporu", desc:"Bölüm bazında operasyonel metrikler" },
  ]},
  { id:"device", label:"Cihaz & Güvenlik", icon:"lock", color:"#DC2626", reports:[
    { id:"ip_report", name:"IP Raporu", desc:"IP bazında fraud analizi" },
    { id:"device_report", name:"Device Raporu", desc:"Cihaz bazında işlem analizi" },
    { id:"malware", name:"Zararlı Yazılım Raporu", desc:"Zararlı yazılım tespitleri" },
    { id:"email_query", name:"Eposta Sorgu Raporu", desc:"E-posta bazında sorgu" },
    { id:"sim_block", name:"SIM Bloke Sorgu", desc:"SIM bloke durumu sorgulama" },
    { id:"phone_query", name:"Telefon Sorgu Raporu", desc:"Telefon numarası bazında sorgu" },
  ]},
  { id:"other", label:"Diğer Raporlar", icon:"more", color:"#64748B", reports:[
    { id:"pool_detail", name:"Havuz Detay Durumu", desc:"Havuz bazında detaylı durum" },
    { id:"siper_monthly", name:"Siper Aylık Raporu", desc:"Aylık Siper analiz raporu" },
    { id:"comm_history", name:"Mail-SMS-IVN-NFC Tarihçe", desc:"İletişim kanalları tarihçesi" },
  ]},
];

const MANUAL_SECTIONS = [
  { id:"varliklar", label:"Varlıklar", desc:"Müşteri, hesap, kart, cihaz bilgileri" },
  { id:"yorumlar", label:"Yorumlar", desc:"Vaka yorumları ve notlar" },
  { id:"ekler", label:"Ekler", desc:"Eklenen dosyalar ve belgeler" },
  { id:"iliskiler", label:"İlişkili Vakalar", desc:"Üst-Alt ve Kardeş vaka ilişkileri" },
  { id:"islemler", label:"İşlemler", desc:"Vakaya bağlı işlem kayıtları" },
  { id:"gecmis", label:"Geçmiş", desc:"Tüm aktivite geçmişi" },
];
const MANUAL_TXN_COLUMNS = [
  { id:"txn_id", label:"İşlem ID", def:true },{ id:"txn_date", label:"İşlem Tarihi", def:true },
  { id:"txn_amount", label:"İşlem Tutarı", def:true },{ id:"txn_currency", label:"Para Birimi", def:true },
  { id:"txn_source", label:"İşlem Kaynağı", def:false },{ id:"txn_entity_type", label:"Varlık Tipi", def:false },
  { id:"txn_entity_key", label:"Varlık Anahtarı", def:false },{ id:"fraud_score", label:"Fraud Skoru", def:true },
  { id:"trigger_rule", label:"Tetikleyen Kural", def:false },{ id:"mark_status", label:"İşaretlenme Durumu", def:false },
  { id:"channel_code", label:"Kanal Kodu", def:false },{ id:"customer_name", label:"Müşteri Adı", def:false },
  { id:"customer_no", label:"Müşteri No", def:false },
];
const MANUAL_CASE_COLUMNS = [
  { id:"case_id", label:"Vaka ID", def:true },{ id:"case_name", label:"Vaka Adı", def:true },
  { id:"case_status", label:"Durum", def:true },{ id:"case_severity", label:"Önem Derecesi", def:true },
  { id:"case_owner", label:"Atanan Kişi", def:false },{ id:"case_create_date", label:"Oluşturma Tarihi", def:true },
  { id:"case_update_date", label:"Güncelleme Tarihi", def:false },{ id:"case_domain", label:"Domain", def:false },
  { id:"case_total_amount", label:"Toplam Tutar", def:true },{ id:"case_fraud_bank", label:"Banka Payı", def:false },
  { id:"case_fraud_customer", label:"Müşteri Payı", def:false },{ id:"case_close_reason", label:"Kapatma Nedeni", def:false },
  { id:"case_description", label:"Açıklama", def:false },{ id:"case_txn_count", label:"İşlem Sayısı", def:false },
];

const MANUAL_GROUP_OPTIONS = [
  {id:"",label:"Gruplama Yok"},{id:"case_status",label:"Duruma Göre"},{id:"case_severity",label:"Önem Derecesine Göre"},
  {id:"case_owner",label:"Atanan Kişiye Göre"},{id:"case_domain",label:"Domain'e Göre"},
];
const MANUAL_SORT_OPTIONS = [
  {id:"case_id",label:"Vaka ID"},{id:"case_name",label:"Vaka Adı"},{id:"case_create_date",label:"Oluşturma Tarihi"},
  {id:"case_total_amount",label:"Toplam Tutar"},{id:"case_severity",label:"Önem Derecesi"},{id:"case_status",label:"Durum"},
];
const MANUAL_EXPORT_FORMATS = [
  {id:"xlsx",label:"Excel (.xlsx)",icon:"📊",desc:"Tablo ve grafikler dahil"},
  {id:"pdf",label:"PDF",icon:"📄",desc:"Yazdırmaya uygun format"},
  {id:"csv",label:"CSV",icon:"📋",desc:"Ham veri, analiz araçları için"},
];

const MOCK_CASES = [
  { id:2471, name:"Şüpheli EFT Transferi", status:"Open", severity:"critical", owner:"Elif Yılmaz", date:"06.03.2026", amount:"₺284.500" },
  { id:2470, name:"Çoklu Kanal Fraud", status:"Open", severity:"high", owner:"Mehmet Öz", date:"06.03.2026", amount:"₺157.200" },
  { id:2469, name:"Sahte Belge Dolandırıcılığı", status:"Pending Closure", severity:"high", owner:"Elif Yılmaz", date:"05.03.2026", amount:"₺92.000" },
  { id:2468, name:"Kart Dolandırıcılığı", status:"Closed", severity:"medium", owner:"Ayşe Tan", date:"05.03.2026", amount:"₺43.750" },
  { id:2467, name:"Başvuru Sahteciliği", status:"Open", severity:"medium", owner:null, date:"05.03.2026", amount:"₺0" },
  { id:2466, name:"Online Bankacılık Fraud", status:"Pending Closure", severity:"medium", owner:"Mehmet Öz", date:"04.03.2026", amount:"$178.300" },
  { id:2465, name:"Hesap Ele Geçirme", status:"Open", severity:"critical", owner:"Ayşe Tan", date:"04.03.2026", amount:"₺520.000" },
  { id:2464, name:"İç Fraud Şüphesi", status:"Open", severity:"high", owner:null, date:"05.03.2026", amount:"₺65.000" },
  { id:2463, name:"Sahte Kimlik Başvurusu", status:"Open", severity:"medium", owner:"Elif Yılmaz", date:"04.03.2026", amount:"₺31.200" },
  { id:2462, name:"Dijital Cüzdan Fraud", status:"Open", severity:"low", owner:"Can Yıldız", date:"03.03.2026", amount:"₺8.900" },
  { id:2460, name:"POS Dolandırıcılığı", status:"Closed", severity:"high", owner:"Mehmet Öz", date:"02.03.2026", amount:"₺198.000" },
  { id:2459, name:"ATM Skimming", status:"Closed", severity:"critical", owner:"Elif Yılmaz", date:"01.03.2026", amount:"₺345.600" },
];

const C = { sidebar:"#0F172A", sidebarHover:"#1E293B", primary:"#1E40AF", primaryLight:"#3B82F6", bg:"#F1F5F9", text:"#0F172A", textSecondary:"#64748B", border:"#E2E8F0", success:"#059669", warning:"#D97706", danger:"#DC2626" };
const STATUS_MAP = { Open:{ label:"Açık", bg:"#DBEAFE", color:"#1E40AF" }, Closed:{ label:"Kapalı", bg:"#D1FAE5", color:"#065F46" }, "Pending Closure":{ label:"Kapatma Bekliyor", bg:"#FEF3C7", color:"#92400E" } };
const SEVERITY_MAP = { critical:{ label:"Kritik", bg:"#FEE2E2", color:"#991B1B" }, high:{ label:"Yüksek", bg:"#FEF3C7", color:"#92400E" }, medium:{ label:"Orta", bg:"#DBEAFE", color:"#1E40AF" }, low:{ label:"Düşük", bg:"#F3F4F6", color:"#374151" } };

const Icons = {
  Dashboard:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  CaseCreate:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Cases:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  MyCases:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Reports:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Globe:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Search:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Download:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Play:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  ChevronDown:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronRight:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Mail:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  FileText:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Check:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Collapse:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>,
  Expand:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
  Clock:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Sliders:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>,
  Spinner:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>,
  TransactionSearch:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Moon:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  LogOut:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};
const CatIcon = ({type,size=15})=>{const s={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};const m={folder:<svg {...s}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,shield:<svg {...s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,bell:<svg {...s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>,list:<svg {...s}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>,users:<svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,chart:<svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,lock:<svg {...s}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,more:<svg {...s}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>};return m[type]||m.folder;};
const Badge=({label,bg,color})=><span style={{padding:"3px 8px",borderRadius:4,fontSize:11.5,fontWeight:500,background:bg,color,whiteSpace:"nowrap"}}>{label}</span>;

export default function SCMReports({ onNavigate, currentRole = "analyst", onRoleChange, selectedDomain = "payment", onDomainChange, notifications = [], onMarkAllRead, onMarkRead } = {}) {
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [reportMode]=useState("standard");
  const [selectedCategory,setSelectedCategory]=useState(null);
  const [selectedReport,setSelectedReport]=useState(null);
  const [dateFrom,setDateFrom]=useState("");const [dateTo,setDateTo]=useState("");
  const [currency,setCurrency]=useState("original");
  const [filterStatus,setFilterStatus]=useState([]);const [filterSeverity,setFilterSeverity]=useState([]);const [filterOwner,setFilterOwner]=useState("");
  const [reportStatus,setReportStatus]=useState("idle");const [reportData,setReportData]=useState(null);const [showPreviewModal,setShowPreviewModal]=useState(false);const [showDownloadPopup,setShowDownloadPopup]=useState(false);const [downloadFormat,setDownloadFormat]=useState(null);const [showDocPreview,setShowDocPreview]=useState(false);
  const [selectedCases,setSelectedCases]=useState(new Set(MOCK_CASES.map(c=>c.id)));
  const [searchQuery,setSearchQuery]=useState("");
  const [expandedCats,setExpandedCats]=useState(new Set(["case"]));
  const [toast,setToast]=useState(null);
  const [manualSections,setManualSections]=useState(new Set(["varliklar","islemler"]));
  const [manualTxnCols,setManualTxnCols]=useState(new Set(MANUAL_TXN_COLUMNS.filter(c=>c.def).map(c=>c.id)));
  const [manualCaseCols,setManualCaseCols]=useState(new Set(MANUAL_CASE_COLUMNS.filter(c=>c.def).map(c=>c.id)));
  const [manualStep,setManualStep]=useState(1);
  const [manualGroupBy,setManualGroupBy]=useState("");
  const [manualSortBy,setManualSortBy]=useState("case_id");
  const [manualSortDir,setManualSortDir]=useState("desc");
  const [manualExportFmt,setManualExportFmt]=useState("xlsx");
  const [savedTemplates]=useState([
    {id:1,name:"Aylık Fraud Özeti",sections:["varliklar","islemler","yorumlar"],caseCols:6,txnCols:5},
    {id:2,name:"Vaka Detay Raporu",sections:["varliklar","yorumlar","ekler","iliskiler","gecmis"],caseCols:10,txnCols:0},
    {id:3,name:"İşlem Analizi",sections:["islemler"],caseCols:4,txnCols:11},
  ]);
  const [manualDateFrom,setManualDateFrom]=useState("");const [manualDateTo,setManualDateTo]=useState("");
  const [manualCurrency,setManualCurrency]=useState("original");const [manualReportName,setManualReportName]=useState("");

  const recentReports=[
    {id:1,name:"Fraud Özet Raporu",ranAt:"06.03.2026 14:30",dateRange:"01.02 - 28.02.2026",type:"online"},
    {id:2,name:"Vaka Aktivite Özeti",ranAt:"05.03.2026 10:15",dateRange:"01.03 - 05.03.2026",type:"email"},
    {id:3,name:"Kullanıcı SLA Raporu",ranAt:"04.03.2026 16:45",dateRange:"01.01 - 28.02.2026",type:"online"},
  ];

  const canRun=dateFrom&&dateTo;

  // Compute filtered preview cases (shown before running report)
  const previewCases=(()=>{let d=[...MOCK_CASES];if(filterStatus.length>0)d=d.filter(c=>filterStatus.includes(c.status));if(filterSeverity.length>0)d=d.filter(c=>filterSeverity.includes(c.severity));if(filterOwner)d=d.filter(c=>c.owner===filterOwner);return d;})();

  // When filters change, auto-select all matching cases
  useEffect(()=>{setSelectedCases(new Set(previewCases.map(c=>c.id)));},[filterStatus.join(","),filterSeverity.join(","),filterOwner]);

  const showT=(type,msg)=>{setToast({type,msg});setTimeout(()=>setToast(null),4000);};
  const toggleCat=id=>{setExpandedCats(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});};
  const handleSelectReport=(r,cat)=>{setSelectedReport(r);setSelectedCategory(cat);setReportStatus("idle");setReportData(null);setDateFrom("");setDateTo("");setCurrency("original");setFilterStatus([]);setFilterSeverity([]);setFilterOwner("");setSelectedCases(new Set(MOCK_CASES.map(c=>c.id)));};
  const toggleArr=(arr,setArr,val)=>setArr(p=>p.includes(val)?p.filter(v=>v!==val):[...p,val]);
  const handleRun=()=>{if(!canRun||selectedCases.size===0)return;setReportStatus("loading");setTimeout(()=>{const d=previewCases.filter(c=>selectedCases.has(c.id));setReportData(d);setReportStatus("ready");setShowPreviewModal(true);showT("success",`"${selectedReport.name}" raporu oluşturuldu. ${d.length} vaka ile hazırlandı.`);},1500);};
  const handleEmail=()=>{if(reportStatus!=="ready")return;setReportStatus("sent");showT("info","Rapor e-posta adresinize gönderilecektir.");};
  const handleExport=(fmt="xlsx")=>{if(reportStatus!=="ready")return;showT("success",`"${selectedReport.name}" ${fmt==="docx"?"Word (.docx)":"Excel (.xlsx)"} olarak indiriliyor...`);setShowDownloadPopup(false);};
  const isReady=reportStatus==="ready";

  const filteredCats=searchQuery?REPORT_CATEGORIES.map(c=>({...c,reports:c.reports.filter(r=>r.name.toLowerCase().includes(searchQuery.toLowerCase())||r.desc.toLowerCase().includes(searchQuery.toLowerCase()))})).filter(c=>c.reports.length>0):REPORT_CATEGORIES;

  const SideBtn=({item,active,onClick})=>(
    <button onClick={onClick} title={sidebarCollapsed?item.label:undefined} style={{display:"flex",alignItems:"center",gap:12,padding:sidebarCollapsed?"12px 16px":"10px 16px",borderRadius:8,border:"none",cursor:"pointer",width:"100%",textAlign:"left",background:active?"rgba(59,130,246,0.15)":"transparent",color:active?"#60A5FA":"#94A3B8",transition:"all 0.15s",justifyContent:sidebarCollapsed?"center":"flex-start"}}
      onMouseEnter={e=>{if(!active)e.currentTarget.style.background=C.sidebarHover;}} onMouseLeave={e=>{if(!active)e.currentTarget.style.background=active?"rgba(59,130,246,0.15)":"transparent";}}>
      <span style={{flexShrink:0,display:"flex"}}>{item.icon}</span>
      {!sidebarCollapsed&&<div><div style={{fontSize:13.5,fontWeight:active?600:500,lineHeight:1.3}}>{item.label}</div><div style={{fontSize:10.5,color:"#475569",lineHeight:1.2}}>{item.sublabel}</div></div>}
    </button>
  );

  return (
    <div className="scm-layout">
      <style>{`@keyframes slideIn{from{transform:translateY(-10px);opacity:0}to{transform:translateY(0);opacity:1}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <Sidebar
        activePage="reports"
        onNavigate={onNavigate}
        user={USERS[currentRole]}
        selectedDomain={selectedDomain}
        onDomainChange={onDomainChange}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(c => !c)}
        notifications={notifications}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
      />

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header style={{background:"#fff",borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><Icons.Reports/><span style={{fontSize:16,fontWeight:700,color:C.text}}>Raporlar</span><span style={{fontSize:12,color:C.textSecondary}}>Reports</span></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",gap:4,background:"#F1F5F9",borderRadius:8,padding:3}}>{["analyst","manager","admin"].map(r=><button key={r} onClick={()=>onRoleChange&&onRoleChange(r)} style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:currentRole===r?C.primary:"#fff",color:currentRole===r?"#fff":C.textSecondary}}>{r==="analyst"?"Analist":r==="manager"?"Yönetici":"Admin"}</button>)}</div>
            <button style={{display:"flex",alignItems:"center",gap:4,padding:"6px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",fontSize:12,color:C.textSecondary}}><Icons.Globe/> TR</button>
          </div>
        </header>

        <main style={{flex:1,overflow:"auto",padding:24}} >
          {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",borderRadius:10,background:toast.type==="success"?"#059669":"#3B82F6",color:"#fff",fontSize:13,fontWeight:500,boxShadow:"0 6px 20px rgba(0,0,0,0.15)",display:"flex",alignItems:"center",gap:8,animation:"slideIn 0.3s ease"}}>{toast.type==="success"?<Icons.Check/>:<Icons.Mail/>} {toast.msg}</div>}

          {/* ══════ DOWNLOAD FORMAT POPUP ══════ */}
          {showDownloadPopup&&(
            <div onClick={()=>setShowDownloadPopup(false)} style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",width:360,overflow:"hidden",animation:"slideIn 0.2s ease"}}>
                <div style={{padding:"18px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>Format Seç</div>
                  <button onClick={()=>setShowDownloadPopup(false)} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.textSecondary}}><Icons.X/></button>
                </div>
                <div style={{padding:"16px 22px",display:"flex",flexDirection:"column",gap:10}}>
                  <button onClick={()=>{setDownloadFormat("xlsx");setShowDownloadPopup(false);setShowDocPreview(true);}} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:10,border:"1px solid #D1FAE5",background:"#F0FDF4",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="#D1FAE5"} onMouseLeave={e=>e.currentTarget.style.background="#F0FDF4"}>
                    <div style={{width:40,height:40,borderRadius:10,background:"#059669",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/><line x1="15" y1="9" x2="15" y2="21"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:13.5,fontWeight:600,color:"#065F46"}}>Excel (.xlsx)</div>
                      <div style={{fontSize:11.5,color:"#047857",marginTop:2}}>Tablo formatında, filtrelenebilir</div>
                    </div>
                    <span style={{marginLeft:"auto",fontSize:11,color:"#059669",fontWeight:500}}>Önizle →</span>
                  </button>
                  <button onClick={()=>{setDownloadFormat("docx");setShowDownloadPopup(false);setShowDocPreview(true);}} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:10,border:"1px solid #DBEAFE",background:"#EFF6FF",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="#DBEAFE"} onMouseLeave={e=>e.currentTarget.style.background="#EFF6FF"}>
                    <div style={{width:40,height:40,borderRadius:10,background:"#1D4ED8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:13.5,fontWeight:600,color:"#1E3A8A"}}>Word (.docx)</div>
                      <div style={{fontSize:11.5,color:"#1D4ED8",marginTop:2}}>Belge formatında, yazdırılabilir</div>
                    </div>
                    <span style={{marginLeft:"auto",fontSize:11,color:"#1D4ED8",fontWeight:500}}>Önizle →</span>
                  </button>
                </div>
                <div style={{padding:"12px 22px",borderTop:`1px solid ${C.border}`,background:"#F8FAFC"}}>
                  <div style={{fontSize:11,color:C.textSecondary,textAlign:"center"}}>{reportData?.length||0} vaka · {selectedReport?.name}</div>
                </div>
              </div>
            </div>
          )}

          {/* ══════ DOC PREVIEW MODAL ══════ */}
          {showDocPreview&&reportData&&downloadFormat&&(
            <div onClick={()=>setShowDocPreview(false)} style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",zIndex:3100,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
              <div onClick={e=>e.stopPropagation()} style={{display:"flex",flexDirection:"column",width:"100%",maxWidth:900,maxHeight:"90vh",borderRadius:16,overflow:"hidden",boxShadow:"0 32px 100px rgba(0,0,0,0.35)"}}>

                {/* Doc App Bar */}
                {downloadFormat==="xlsx"?(
                  <div style={{background:"#1D6A36",padding:"0",flexShrink:0}}>
                    <div style={{background:"#1D6A36",padding:"6px 16px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:20,height:20,background:"#fff",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="13" height="13" viewBox="0 0 24 24" fill="#1D6A36"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9" stroke="#fff" strokeWidth="1.5"/><line x1="3" y1="15" x2="21" y2="15" stroke="#fff" strokeWidth="1.5"/><line x1="9" y1="9" x2="9" y2="21" stroke="#fff" strokeWidth="1.5"/><line x1="15" y1="9" x2="15" y2="21" stroke="#fff" strokeWidth="1.5"/></svg></div>
                      <span style={{color:"#fff",fontSize:13,fontWeight:500,flex:1}}>{selectedReport?.name}.xlsx — Önizleme</span>
                      <button onClick={()=>setShowDocPreview(false)} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:18,lineHeight:1,padding:"2px 6px"}}>✕</button>
                    </div>
                    <div style={{background:"#217346",padding:"3px 16px",display:"flex",gap:20}}>
                      {["Dosya","Giriş","Ekle","Sayfa Düzeni","Formüller","Veri","Gözden Geçir"].map(m=><span key={m} style={{color:"rgba(255,255,255,0.85)",fontSize:11.5,cursor:"default",padding:"2px 0"}}>{m}</span>)}
                    </div>
                    <div style={{background:"#F3F3F3",padding:"4px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #D0D0D0"}}>
                      <div style={{background:"#fff",border:"1px solid #BDBDBD",borderRadius:2,padding:"2px 8px",fontSize:11.5,minWidth:44,textAlign:"center",color:"#333"}}>A1</div>
                      <div style={{width:1,height:16,background:"#BDBDBD"}}/>
                      <span style={{fontSize:12,color:"#444",flex:1,fontFamily:"'Calibri',sans-serif"}}>Vaka ID</span>
                    </div>
                  </div>
                ):(
                  <div style={{background:"#2B579A",padding:"0",flexShrink:0}}>
                    <div style={{background:"#2B579A",padding:"6px 16px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:20,height:20,background:"#fff",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="13" height="13" viewBox="0 0 24 24" fill="#2B579A"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8" fill="none" stroke="#fff" strokeWidth="1.5"/></svg></div>
                      <span style={{color:"#fff",fontSize:13,fontWeight:500,flex:1}}>{selectedReport?.name}.docx — Önizleme</span>
                      <button onClick={()=>setShowDocPreview(false)} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:18,lineHeight:1,padding:"2px 6px"}}>✕</button>
                    </div>
                    <div style={{background:"#2B579A",borderTop:"1px solid rgba(255,255,255,0.15)",padding:"3px 16px",display:"flex",gap:20}}>
                      {["Dosya","Giriş","Ekle","Tasarım","Düzen","Başvurular","Gözden Geçir"].map(m=><span key={m} style={{color:"rgba(255,255,255,0.85)",fontSize:11.5,cursor:"default",padding:"2px 0"}}>{m}</span>)}
                    </div>
                  </div>
                )}

                {/* Doc Content */}
                <div style={{flex:1,overflowY:"auto",background:downloadFormat==="xlsx"?"#F3F3F3":"#B0BEC5"}}>
                  {downloadFormat==="xlsx"?(
                    /* ── EXCEL SHEET ── */
                    <div style={{fontSize:12,fontFamily:"'Calibri','Segoe UI',sans-serif"}}>
                      {/* Column headers */}
                      <div style={{display:"flex",position:"sticky",top:0,zIndex:5,background:"#F3F3F3",borderBottom:"1px solid #BDBDBD"}}>
                        <div style={{width:46,minWidth:46,borderRight:"1px solid #BDBDBD",borderBottom:"1px solid #BDBDBD",background:"#F3F3F3"}}/>
                        {["A","B","C","D","E","F","G"].map((l,i)=>(
                          <div key={l} style={{flex:[0.8,2,1,0.9,1.1,0.9,1][i],minWidth:[60,160,80,72,90,72,90][i],padding:"3px 0",textAlign:"center",borderRight:"1px solid #BDBDBD",background:"#F3F3F3",color:"#444",fontSize:11.5,fontWeight:500}}>{l}</div>
                        ))}
                      </div>
                      {/* Header row */}
                      <div style={{display:"flex",borderBottom:"2px solid #9E9E9E"}}>
                        <div style={{width:46,minWidth:46,padding:"5px 0",textAlign:"center",borderRight:"1px solid #BDBDBD",background:"#E8F5E9",color:"#444",fontSize:11,fontWeight:600}}>1</div>
                        {["Vaka ID","Vaka Adı","Durum","Önem","Atanan","Tarih","Tutar"].map((h,i)=>(
                          <div key={h} style={{flex:[0.8,2,1,0.9,1.1,0.9,1][i],minWidth:[60,160,80,72,90,72,90][i],padding:"5px 8px",borderRight:"1px solid #BDBDBD",background:"#E8F5E9",fontWeight:700,color:"#1B5E20",fontSize:11.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h}</div>
                        ))}
                      </div>
                      {/* Data rows */}
                      {reportData.map((row,ri)=>(
                        <div key={row.id} style={{display:"flex",borderBottom:"1px solid #E0E0E0",background:ri%2===0?"#fff":"#F9FBF9"}}>
                          <div style={{width:46,minWidth:46,padding:"4px 0",textAlign:"center",borderRight:"1px solid #BDBDBD",background:"#F3F3F3",color:"#666",fontSize:11}}>{ri+2}</div>
                          <div style={{flex:0.8,minWidth:60,padding:"4px 8px",borderRight:"1px solid #E0E0E0",color:"#1565C0",fontFamily:"'Courier New',monospace",fontSize:11.5}}>#{row.id}</div>
                          <div style={{flex:2,minWidth:160,padding:"4px 8px",borderRight:"1px solid #E0E0E0",color:"#212121",fontSize:11.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</div>
                          <div style={{flex:1,minWidth:80,padding:"4px 8px",borderRight:"1px solid #E0E0E0",fontSize:11.5}}>{(STATUS_MAP[row.status]||STATUS_MAP.Open).label}</div>
                          <div style={{flex:0.9,minWidth:72,padding:"4px 8px",borderRight:"1px solid #E0E0E0",fontSize:11.5}}>{(SEVERITY_MAP[row.severity]||SEVERITY_MAP.medium).label}</div>
                          <div style={{flex:1.1,minWidth:90,padding:"4px 8px",borderRight:"1px solid #E0E0E0",fontSize:11.5,color:"#444"}}>{row.owner||"-"}</div>
                          <div style={{flex:0.9,minWidth:72,padding:"4px 8px",borderRight:"1px solid #E0E0E0",fontSize:11.5,color:"#616161"}}>{row.date}</div>
                          <div style={{flex:1,minWidth:90,padding:"4px 8px",fontSize:11.5,textAlign:"right",fontFamily:"'Courier New',monospace",color:"#212121"}}>{row.amount}</div>
                        </div>
                      ))}
                      {/* Sheet tab */}
                      <div style={{background:"#E0E0E0",borderTop:"1px solid #BDBDBD",padding:"4px 0",display:"flex",gap:0}}>
                        <div style={{background:"#fff",border:"1px solid #BDBDBD",borderBottom:"none",padding:"3px 16px",fontSize:11.5,color:"#333",marginLeft:8,borderRadius:"3px 3px 0 0"}}>Rapor1</div>
                        <div style={{padding:"3px 16px",fontSize:11.5,color:"#999"}}>+</div>
                      </div>
                    </div>
                  ):(
                    /* ── WORD DOCUMENT ── */
                    <div style={{padding:"32px",display:"flex",justifyContent:"center"}}>
                      <div style={{background:"#fff",width:"100%",maxWidth:720,minHeight:600,boxShadow:"0 2px 12px rgba(0,0,0,0.18)",padding:"60px 72px",fontFamily:"'Calibri','Georgia',serif",fontSize:11,color:"#111",lineHeight:1.5}}>
                        {/* Header */}
                        <div style={{borderBottom:"2px solid #2B579A",paddingBottom:10,marginBottom:20,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
                          <div>
                            <div style={{fontSize:9,color:"#666",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>SADE SCM — Vaka Yönetim Sistemi</div>
                            <div style={{fontSize:20,fontWeight:700,color:"#2B579A",lineHeight:1.2}}>{selectedReport?.name}</div>
                          </div>
                          <div style={{textAlign:"right",fontSize:9,color:"#888"}}>
                            <div>Oluşturulma: {new Date().toLocaleDateString("tr-TR")}</div>
                            <div>Dönem: {dateFrom} — {dateTo}</div>
                          </div>
                        </div>
                        {/* Summary */}
                        <div style={{marginBottom:16,padding:"8px 12px",background:"#EFF6FF",borderLeft:"3px solid #2B579A",fontSize:10.5}}>
                          <strong>Rapor Özeti:</strong> Bu rapor <strong>{reportData.length} vaka</strong> içermektedir.{" "}
                          {Object.entries(STATUS_MAP).map(([k,v])=>{const c=reportData.filter(r=>r.status===k).length;return c>0?`${v.label}: ${c}  `:null;}).filter(Boolean)}
                        </div>
                        {/* Table */}
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,marginBottom:20}}>
                          <thead>
                            <tr style={{background:"#2B579A"}}>
                              {["Vaka ID","Vaka Adı","Durum","Önem","Atanan","Tarih","Tutar"].map((h,i)=>(
                                <th key={h} style={{padding:"6px 8px",color:"#fff",fontWeight:700,textAlign:i===6?"right":"left",border:"1px solid #1e4080",fontSize:9.5,whiteSpace:"nowrap"}}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.map((row,ri)=>{
                              const sc=STATUS_MAP[row.status]||STATUS_MAP.Open;
                              const sv=SEVERITY_MAP[row.severity]||SEVERITY_MAP.medium;
                              return(
                                <tr key={row.id} style={{background:ri%2===0?"#fff":"#F0F4FF"}}>
                                  <td style={{padding:"5px 8px",border:"1px solid #C5D3E8",color:"#1D4ED8",fontFamily:"monospace",fontSize:9.5}}>#{row.id}</td>
                                  <td style={{padding:"5px 8px",border:"1px solid #C5D3E8",fontSize:10}}>{row.name}</td>
                                  <td style={{padding:"5px 8px",border:"1px solid #C5D3E8",fontSize:9.5}}>{sc.label}</td>
                                  <td style={{padding:"5px 8px",border:"1px solid #C5D3E8",fontSize:9.5}}>{sv.label}</td>
                                  <td style={{padding:"5px 8px",border:"1px solid #C5D3E8",fontSize:9.5,color:"#444"}}>{row.owner||"-"}</td>
                                  <td style={{padding:"5px 8px",border:"1px solid #C5D3E8",fontSize:9.5,color:"#555"}}>{row.date}</td>
                                  <td style={{padding:"5px 8px",border:"1px solid #C5D3E8",textAlign:"right",fontFamily:"monospace",fontSize:9.5}}>{row.amount}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {/* Footer */}
                        <div style={{borderTop:"1px solid #C5D3E8",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:8.5,color:"#999"}}>
                          <span>SADE SCM — Gizli</span>
                          <span>1 / 1</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Bar */}
                <div style={{background:downloadFormat==="xlsx"?"#1D6A36":"#2B579A",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                  <button onClick={()=>{setShowDocPreview(false);setShowDownloadPopup(true);}} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:7,padding:"7px 16px",color:"#fff",fontSize:12.5,cursor:"pointer"}}>← Geri</button>
                  <div style={{fontSize:11.5,color:"rgba(255,255,255,0.7)"}}>{reportData.length} vaka · {downloadFormat==="xlsx"?"Excel (.xlsx)":"Word (.docx)"}</div>
                  <button onClick={()=>{handleExport(downloadFormat);setShowDocPreview(false);}} style={{background:"#fff",border:"none",borderRadius:7,padding:"8px 22px",color:downloadFormat==="xlsx"?"#1D6A36":"#2B579A",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Icons.Download/> İndir</button>
                </div>

              </div>
            </div>
          )}

          {/* ══════ PREVIEW MODAL ══════ */}
          {showPreviewModal&&reportData&&(
            <div onClick={()=>setShowPreviewModal(false)} style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
              <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,boxShadow:"0 24px 80px rgba(0,0,0,0.25)",width:"100%",maxWidth:860,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>

                {/* Modal Header */}
                <div style={{padding:"16px 24px",borderBottom:`1px solid ${C.border}`,background:"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:C.text}}>{selectedReport?.name}</div>
                      <div style={{fontSize:11.5,color:C.textSecondary,marginTop:1}}>{dateFrom} — {dateTo} · {reportData.length} vaka · {currency==="original"?"Orijinal para birimi":currency}</div>
                    </div>
                  </div>
                  <button onClick={()=>setShowPreviewModal(false)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.textSecondary,flexShrink:0}}><Icons.X/></button>
                </div>

                {/* Badges Summary */}
                <div style={{padding:"10px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",flexShrink:0}}>
                  <span style={{fontSize:10.5,fontWeight:600,color:C.textSecondary,textTransform:"uppercase",letterSpacing:"0.04em",marginRight:4}}>Özet:</span>
                  {Object.entries(STATUS_MAP).map(([k,v])=>{const cnt=reportData.filter(r=>r.status===k).length;return cnt>0?<span key={k} style={{fontSize:11,padding:"3px 9px",borderRadius:4,background:v.bg,color:v.color,fontWeight:500}}>{v.label}: {cnt}</span>:null;})}
                  {Object.entries(SEVERITY_MAP).map(([k,v])=>{const cnt=reportData.filter(r=>r.severity===k).length;return cnt>0?<span key={k} style={{fontSize:11,padding:"3px 9px",borderRadius:4,background:v.bg,color:v.color,fontWeight:500}}>{v.label}: {cnt}</span>:null;})}
                </div>

                {/* Data Table */}
                <div style={{overflowY:"auto",flex:1}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead><tr style={{background:"#F8FAFC",position:"sticky",top:0,zIndex:2}}>
                      {["Vaka ID","Vaka Adı","Durum","Önem","Atanan","Tarih","Tutar"].map((h,i)=>(
                        <th key={i} style={{padding:"10px 16px",textAlign:i===6?"right":"left",fontWeight:600,color:C.textSecondary,fontSize:11,borderBottom:`2px solid ${C.border}`,textTransform:"uppercase",letterSpacing:"0.03em",whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>{reportData.map(row=>{
                      const sc=STATUS_MAP[row.status]||STATUS_MAP.Open;
                      const sv=SEVERITY_MAP[row.severity]||SEVERITY_MAP.medium;
                      return(
                        <tr key={row.id} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{padding:"9px 16px",fontFamily:"'JetBrains Mono',monospace",fontWeight:500,fontSize:12,color:C.primaryLight}}>#{row.id}</td>
                          <td style={{padding:"9px 16px",fontWeight:500,color:C.text,fontSize:12.5}}>{row.name}</td>
                          <td style={{padding:"9px 16px"}}><Badge label={sc.label} bg={sc.bg} color={sc.color}/></td>
                          <td style={{padding:"9px 16px"}}><Badge label={sv.label} bg={sv.bg} color={sv.color}/></td>
                          <td style={{padding:"9px 16px",color:row.owner?C.text:C.textSecondary,fontSize:12}}>{row.owner||"Atanmamış"}</td>
                          <td style={{padding:"9px 16px",color:C.textSecondary,fontSize:12}}>{row.date}</td>
                          <td style={{padding:"9px 16px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontWeight:500,fontSize:12}}>{row.amount}</td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                  {reportData.length===0&&<div style={{padding:"60px 20px",textAlign:"center",color:C.textSecondary,fontSize:13}}>Önizleme için veri bulunamadı.</div>}
                </div>

                {/* Modal Footer */}
                <div style={{padding:"14px 24px",borderTop:`1px solid ${C.border}`,background:"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                  <button onClick={()=>setShowPreviewModal(false)} style={{fontSize:12.5,color:C.textSecondary,background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 16px",cursor:"pointer"}}>Kapat</button>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setShowDownloadPopup(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 20px",borderRadius:8,border:"none",background:C.success,fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer"}}><Icons.Download/> Dosya İndir</button>
                    <button onClick={()=>{handleEmail();setShowPreviewModal(false);}} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 20px",borderRadius:8,border:"none",background:C.primaryLight,fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer"}}><Icons.Mail/> E-posta Gönder</button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ══════ STANDARD REPORTS ══════ */}
          {reportMode==="standard"&&<div style={{display:"flex",gap:20,minHeight:"calc(100vh - 120px)"}}>
            {/* Left Catalog */}
            <div style={{width:340,flexShrink:0,background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 12px",border:`1px solid ${C.border}`,borderRadius:8,background:"#F8FAFC"}}>
                  <Icons.Search/><input type="text" placeholder="Rapor ara..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{flex:1,border:"none",background:"transparent",padding:"9px 0",fontSize:13,outline:"none",color:C.text}}/>
                  {searchQuery&&<button onClick={()=>setSearchQuery("")} style={{background:"none",border:"none",cursor:"pointer",color:C.textSecondary,display:"flex",padding:2}}><Icons.X/></button>}
                </div>
                <div style={{fontSize:11,color:C.textSecondary,marginTop:8}}>{filteredCats.reduce((s,c)=>s+c.reports.length,0)} rapor mevcut</div>
              </div>
              <div style={{flex:1,overflow:"auto",padding:"8px 0"}}>
                {filteredCats.map(cat=><div key={cat.id}>
                  <button onClick={()=>toggleCat(cat.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 16px",border:"none",cursor:"pointer",background:"transparent",textAlign:"left",color:C.text}} onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{width:28,height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:`${cat.color}15`,color:cat.color,flexShrink:0}}><CatIcon type={cat.icon}/></div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{cat.label}</div><div style={{fontSize:11,color:C.textSecondary}}>{cat.reports.length} rapor</div></div>
                    <span style={{transform:expandedCats.has(cat.id)?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"flex",color:C.textSecondary}}><Icons.ChevronRight/></span>
                  </button>
                  {expandedCats.has(cat.id)&&<div style={{padding:"0 8px 4px 8px"}}>{cat.reports.map(rp=>{
                    const sel=selectedReport?.id===rp.id;const adm=rp.adminOnly&&currentRole!=="admin";
                    return <button key={rp.id} onClick={()=>!adm&&handleSelectReport(rp,cat.id)} disabled={adm} style={{display:"flex",width:"100%",padding:"9px 12px 9px 40px",borderRadius:6,border:"none",cursor:adm?"not-allowed":"pointer",background:sel?`${cat.color}10`:"transparent",textAlign:"left",opacity:adm?0.45:1,borderLeft:sel?`3px solid ${cat.color}`:"3px solid transparent"}} onMouseEnter={e=>{if(!sel&&!adm)e.currentTarget.style.background="#F8FAFC";}} onMouseLeave={e=>{if(!sel&&!adm)e.currentTarget.style.background=sel?`${cat.color}10`:"transparent";}}>
                      <div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:sel?600:500,color:sel?cat.color:C.text,lineHeight:1.3}}>{rp.name}</div><div style={{fontSize:11,color:C.textSecondary,marginTop:2,lineHeight:1.3}}>{rp.desc}</div>{adm&&<span style={{fontSize:10,color:C.warning,fontWeight:600}}>Yalnızca Admin</span>}</div>
                    </button>;
                  })}</div>}
                </div>)}
              </div>
            </div>

            {/* Right */}
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:16,minWidth:0}}>
              {!selectedReport?<div style={{flex:1,background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}>
                <div style={{width:72,height:72,borderRadius:16,background:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}><Icons.FileText/></div>
                <div style={{fontSize:17,fontWeight:600,color:C.text,marginBottom:6}}>Rapor Seçin</div>
                <div style={{fontSize:13,color:C.textSecondary,textAlign:"center",maxWidth:380,lineHeight:1.5}}>Soldaki listeden çalıştırmak istediğiniz raporu seçin. Tarih aralığı ve filtreleri belirleyip raporu çalıştırın veya Excel olarak dışa aktarın.</div>
                {recentReports.length>0&&<div style={{marginTop:32,width:"100%",maxWidth:480}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Icons.Clock/> Son Çalıştırılan Raporlar</div>
                  {recentReports.map(r=><div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:8,border:`1px solid ${C.border}`,marginBottom:6,background:"#FAFBFC"}}>
                    <div><div style={{fontSize:13,fontWeight:500,color:C.text}}>{r.name}</div><div style={{fontSize:11,color:C.textSecondary,marginTop:2}}>{r.dateRange} · {r.ranAt}</div></div>
                    <span style={{fontSize:11,fontWeight:500,padding:"3px 8px",borderRadius:4,background:r.type==="online"?"#D1FAE5":"#DBEAFE",color:r.type==="online"?"#065F46":"#1E40AF"}}>{r.type==="online"?"Hazır":"Gönderildi"}</span>
                  </div>)}
                  <div style={{fontSize:11,color:C.textSecondary,marginTop:8,lineHeight:1.6,padding:"8px 12px",background:"#F8FAFC",borderRadius:6}}>
                    <strong>Hazır:</strong> "Raporla" ile sayfada oluşturuldu — görüntülenebilir ve indirilebilir.<br/><strong>Gönderildi:</strong> "E-posta Gönder" ile arka planda hazırlanıp e-posta adresinize iletildi.
                  </div>
                </div>}
              </div>:<>
                {/* Config Card */}
                <div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"18px 22px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:`${REPORT_CATEGORIES.find(c=>c.id===selectedCategory)?.color||C.primaryLight}15`,color:REPORT_CATEGORIES.find(c=>c.id===selectedCategory)?.color||C.primaryLight}}><CatIcon type={REPORT_CATEGORIES.find(c=>c.id===selectedCategory)?.icon||"folder"} size={17}/></div>
                      <div><div style={{fontSize:16,fontWeight:700,color:C.text}}>{selectedReport.name}</div><div style={{fontSize:12,color:C.textSecondary}}>{selectedReport.desc}</div></div>
                    </div>
                    <button onClick={()=>{setSelectedReport(null);setSelectedCategory(null);setReportData(null);setReportStatus("idle");}} style={{background:"none",border:"none",cursor:"pointer",color:C.textSecondary,padding:4}}><Icons.X/></button>
                  </div>
                  {/* Date + Currency */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"flex-end",marginBottom:14}}>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.03em"}}>Başlangıç Tarihi *</label><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",minWidth:150}}/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.03em"}}>Bitiş Tarihi *</label><input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} max={new Date().toISOString().split("T")[0]} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",minWidth:150}}/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.03em"}}>Para Birimi</label><select value={currency} onChange={e=>setCurrency(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",minWidth:140,cursor:"pointer"}}><option value="original">Orijinal Para Birimi</option><option value="TRY">TRY</option><option value="USD">USD</option></select></div>
                  </div>
                  {/* Filters */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"flex-end",marginBottom:14,padding:"14px 0 0",borderTop:`1px solid ${C.border}`}}>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:6,textTransform:"uppercase"}}>Durum</label><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {Object.entries(STATUS_MAP).map(([k,v])=><button key={k} onClick={()=>toggleArr(filterStatus,setFilterStatus,k)} style={{padding:"5px 10px",borderRadius:6,fontSize:11.5,fontWeight:500,cursor:"pointer",background:filterStatus.includes(k)?v.bg:"#F8FAFC",color:filterStatus.includes(k)?v.color:C.textSecondary,border:`1px solid ${filterStatus.includes(k)?v.color+"40":C.border}`}}>{v.label}</button>)}
                      {filterStatus.length===0&&<span style={{fontSize:11,color:C.textSecondary,padding:"5px 0",fontStyle:"italic"}}>Tümü</span>}
                    </div></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:6,textTransform:"uppercase"}}>Önem Derecesi</label><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {Object.entries(SEVERITY_MAP).map(([k,v])=><button key={k} onClick={()=>toggleArr(filterSeverity,setFilterSeverity,k)} style={{padding:"5px 10px",borderRadius:6,fontSize:11.5,fontWeight:500,cursor:"pointer",background:filterSeverity.includes(k)?v.bg:"#F8FAFC",color:filterSeverity.includes(k)?v.color:C.textSecondary,border:`1px solid ${filterSeverity.includes(k)?v.color+"40":C.border}`}}>{v.label}</button>)}
                      {filterSeverity.length===0&&<span style={{fontSize:11,color:C.textSecondary,padding:"5px 0",fontStyle:"italic"}}>Tümü</span>}
                    </div></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:6,textTransform:"uppercase"}}>Atanan</label><select value={filterOwner} onChange={e=>setFilterOwner(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,color:C.text,outline:"none",minWidth:140,cursor:"pointer"}}><option value="">Tümü</option>{ACTIVE_USERS_LIST.map(u=><option key={u} value={u}>{u}</option>)}</select></div>
                  </div>
                  {/* Actions */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:14,borderTop:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,color:canRun?isReady?"#059669":C.textSecondary:C.warning,fontWeight:isReady?600:400}}>{!canRun?"Tarih aralığı girilmeden rapor çalıştırılamaz.":isReady?`✓ Önizleme hazır — ${reportData?.length||0} vaka · Dosya indirebilir veya e-posta gönderebilirsiniz`:`${selectedCases.size} / ${previewCases.length} vaka seçili`}</div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={handleRun} disabled={!canRun||selectedCases.size===0||reportStatus==="loading"||isReady} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 20px",borderRadius:8,border:"none",background:canRun&&selectedCases.size>0&&!isReady?C.primary:"#94A3B8",cursor:canRun&&selectedCases.size>0&&!isReady?"pointer":"not-allowed",fontSize:13,fontWeight:600,color:"#fff"}}>{reportStatus==="loading"?<span style={{animation:"spin 1s linear infinite",display:"flex"}}><Icons.Spinner/></span>:<Icons.Play/>} Raporla ({selectedCases.size})</button>
                      <button onClick={()=>isReady&&setShowDownloadPopup(true)} disabled={!isReady} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 18px",borderRadius:8,border:`1px solid ${isReady?C.success:C.border}`,background:isReady?C.success:"#F8FAFC",cursor:isReady?"pointer":"not-allowed",fontSize:13,fontWeight:600,color:isReady?"#fff":C.textSecondary,opacity:isReady?1:0.4}}><Icons.Download/> Dosya İndir</button>
                      <button onClick={handleEmail} disabled={!isReady} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 18px",borderRadius:8,border:`1px solid ${isReady?C.primaryLight:C.border}`,background:isReady?C.primaryLight:"#F8FAFC",cursor:isReady?"pointer":"not-allowed",fontSize:13,fontWeight:600,color:isReady?"#fff":C.textSecondary,opacity:isReady?1:0.4}}><Icons.Mail/> E-posta Gönder</button>
                    </div>
                  </div>
                </div>

                {/* Case Selection Table — idle state */}
                {reportStatus==="idle"&&(
                <div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                  <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FAFBFC"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,fontWeight:600,color:C.text}}>Vaka Seçimi</span><span style={{fontSize:11,color:C.textSecondary}}>({previewCases.length} vaka, {selectedCases.size} seçili)</span></div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>setSelectedCases(new Set(previewCases.map(c=>c.id)))} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",color:C.primaryLight,fontWeight:500}}>Tümünü Seç</button>
                      <button onClick={()=>setSelectedCases(new Set())} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",color:C.textSecondary,fontWeight:500}}>Tümünü Kaldır</button>
                    </div>
                  </div>
                  <div style={{maxHeight:320,overflow:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead><tr style={{background:"#F8FAFC",position:"sticky",top:0,zIndex:2}}>
                        <th style={{padding:"9px 14px",width:40,borderBottom:`2px solid ${C.border}`}}><input type="checkbox" checked={previewCases.length>0&&previewCases.every(c=>selectedCases.has(c.id))} onChange={()=>{const a=previewCases.every(c=>selectedCases.has(c.id));setSelectedCases(a?new Set():new Set(previewCases.map(c=>c.id)));}} style={{cursor:"pointer",width:15,height:15,accentColor:C.primary}}/></th>
                        {["Vaka ID","Vaka Adı","Durum","Önem","Atanan","Tarih","Tutar"].map((h,i)=><th key={i} style={{padding:"9px 14px",textAlign:i===6?"right":"left",fontWeight:600,color:C.textSecondary,fontSize:11,borderBottom:`2px solid ${C.border}`,textTransform:"uppercase",letterSpacing:"0.03em",whiteSpace:"nowrap"}}>{h}</th>)}
                      </tr></thead>
                      <tbody>{previewCases.map(row=>{const ck=selectedCases.has(row.id);const sc=STATUS_MAP[row.status]||STATUS_MAP.Open;const sv=SEVERITY_MAP[row.severity]||SEVERITY_MAP.medium;return(
                        <tr key={row.id} onClick={()=>setSelectedCases(p=>{const n=new Set(p);n.has(row.id)?n.delete(row.id):n.add(row.id);return n;})} style={{borderBottom:`1px solid ${C.border}`,cursor:"pointer",opacity:ck?1:0.5}} onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{padding:"8px 14px"}}><input type="checkbox" checked={ck} readOnly style={{cursor:"pointer",width:15,height:15,accentColor:C.primary}}/></td>
                          <td style={{padding:"8px 14px",fontFamily:"'JetBrains Mono',monospace",fontWeight:500,fontSize:12,color:C.primaryLight}}>#{row.id}</td>
                          <td style={{padding:"8px 14px",fontWeight:500,color:C.text,fontSize:12.5}}>{row.name}</td>
                          <td style={{padding:"8px 14px"}}><Badge label={sc.label} bg={sc.bg} color={sc.color}/></td>
                          <td style={{padding:"8px 14px"}}><Badge label={sv.label} bg={sv.bg} color={sv.color}/></td>
                          <td style={{padding:"8px 14px",color:row.owner?C.text:C.textSecondary,fontSize:12}}>{row.owner||"Atanmamış"}</td>
                          <td style={{padding:"8px 14px",color:C.textSecondary,fontSize:12}}>{row.date}</td>
                          <td style={{padding:"8px 14px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontWeight:500,fontSize:12}}>{row.amount}</td>
                        </tr>);})}</tbody>
                    </table>
                    {previewCases.length===0&&<div style={{padding:"40px 20px",textAlign:"center",color:C.textSecondary,fontSize:13}}>Seçili filtrelere uyan vaka bulunamadı.</div>}
                  </div>
                </div>)}

                {/* Loading */}
                {reportStatus==="loading"&&<div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"60px 40px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{textAlign:"center"}}><div style={{animation:"spin 1.5s linear infinite",display:"inline-flex",color:C.primaryLight,marginBottom:12}}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg></div><div style={{fontSize:14,fontWeight:500,color:C.text}}>Rapor oluşturuluyor</div><div style={{fontSize:12,color:C.textSecondary,marginTop:4}}>Seçili {selectedCases.size} vaka işleniyor...</div></div>
                </div>}

                {/* Ready — compact summary card */}
                {isReady&&reportData&&<div style={{background:"#F0FDF4",borderRadius:12,border:"1px solid #BBF7D0",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div>
                      <div style={{fontSize:13.5,fontWeight:700,color:"#065F46"}}>Rapor hazır — {reportData.length} vaka</div>
                      <div style={{fontSize:11.5,color:"#047857",marginTop:2}}>{dateFrom} — {dateTo} · {selectedReport?.name}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <button onClick={()=>setShowPreviewModal(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 18px",borderRadius:8,border:"1px solid #059669",background:"#059669",fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer"}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Önizlemeyi Aç
                    </button>
                    <button onClick={()=>{setReportStatus("idle");setReportData(null);}} style={{fontSize:12,color:"#047857",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Sıfırla</button>
                  </div>
                </div>}

                {/* Email Sent */}
                {reportStatus==="sent"&&<div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"60px 40px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{textAlign:"center"}}><div style={{width:56,height:56,borderRadius:14,background:"#EFF6FF",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16,color:C.primaryLight}}><Icons.Mail/></div><div style={{fontSize:15,fontWeight:600,color:C.text}}>E-posta ile Gönderildi</div><div style={{fontSize:13,color:C.textSecondary,marginTop:6,maxWidth:320,lineHeight:1.5}}>Raporunuz kayıtlı e-posta adresinize iletilecektir.</div><button onClick={()=>{setReportStatus("idle");setReportData(null);}} style={{marginTop:20,fontSize:12,color:C.primaryLight,background:"none",border:`1px solid ${C.primaryLight}`,borderRadius:6,padding:"6px 16px",cursor:"pointer",fontWeight:500}}>Yeni Rapor Oluştur</button></div>
                </div>}
              </>}
            </div>
          </div>}

          {/* ══════ MANUEL RAPOR (removed) ══════ */}
          {false&&<div style={{display:"flex",gap:20,minHeight:"calc(100vh - 120px)"}}>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:16}}>

              {/* Step Indicator */}
              <div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"16px 22px"}}>
                <div style={{display:"flex",alignItems:"center",gap:0}}>
                  {[{n:1,label:"Kapsam & Genel",sub:"Tarih, para birimi, şablon"},{n:2,label:"İçerik Seçimi",sub:"Bölümler ve sütunlar"},{n:3,label:"Düzen & Çıktı",sub:"Gruplama, sıralama, format"}].map((s,i)=>(
                    <div key={s.n} style={{display:"flex",alignItems:"center",flex:1}}>
                      <button onClick={()=>setManualStep(s.n)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderRadius:8,border:"none",cursor:"pointer",background:manualStep===s.n?"#7C3AED10":"transparent",flex:1,textAlign:"left"}}>
                        <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0,background:manualStep===s.n?"#7C3AED":manualStep>s.n?"#D1FAE5":"#F1F5F9",color:manualStep===s.n?"#fff":manualStep>s.n?"#059669":C.textSecondary}}>{manualStep>s.n?"✓":s.n}</div>
                        <div><div style={{fontSize:12.5,fontWeight:manualStep===s.n?600:500,color:manualStep===s.n?"#7C3AED":C.text}}>{s.label}</div><div style={{fontSize:10.5,color:C.textSecondary}}>{s.sub}</div></div>
                      </button>
                      {i<2&&<div style={{width:40,height:2,background:manualStep>s.n?"#7C3AED":"#E2E8F0",flexShrink:0,borderRadius:1}}/>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Kapsam */}
              {manualStep===1&&<>
                {/* Saved Templates */}
                <div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"18px 22px"}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:4}}>Kayıtlı Şablonlar</div>
                  <div style={{fontSize:11,color:C.textSecondary,marginBottom:12}}>Önceden kaydedilmiş rapor konfigürasyonları — hızlı başlangıç için seçin</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {savedTemplates.map(t=>(
                      <button key={t.id} onClick={()=>showT("success",`"${t.name}" şablonu yüklendi.`)} style={{padding:"10px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:"#FAFBFC",cursor:"pointer",textAlign:"left",flex:"1 1 180px",minWidth:180,transition:"all 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#7C3AED"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                        <div style={{fontSize:12.5,fontWeight:600,color:C.text,marginBottom:4}}>{t.name}</div>
                        <div style={{fontSize:11,color:C.textSecondary}}>{t.sections.length} bölüm · {t.caseCols} vaka sütunu{t.txnCols>0?` · ${t.txnCols} işlem sütunu`:""}</div>
                      </button>
                    ))}
                    <button style={{padding:"10px 16px",borderRadius:8,border:`1.5px dashed ${C.border}`,background:"transparent",cursor:"pointer",textAlign:"center",flex:"1 1 140px",minWidth:140,color:C.textSecondary,fontSize:12,fontWeight:500}}>+ Yeni Şablon Kaydet</button>
                  </div>
                </div>
                {/* General Info */}
                <div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"18px 22px"}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Genel Bilgiler</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"flex-end"}}>
                    <div style={{flex:1,minWidth:200}}><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>Rapor Adı</label><input type="text" placeholder="Ör: Mart 2026 Fraud Analizi" value={manualReportName} onChange={e=>setManualReportName(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",boxSizing:"border-box"}}/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>Başlangıç *</label><input type="date" value={manualDateFrom} onChange={e=>setManualDateFrom(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none"}}/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>Bitiş *</label><input type="date" value={manualDateTo} onChange={e=>setManualDateTo(e.target.value)} max={new Date().toISOString().split("T")[0]} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none"}}/></div>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:5,textTransform:"uppercase"}}>Para Birimi</label><select value={manualCurrency} onChange={e=>setManualCurrency(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",cursor:"pointer"}}><option value="original">Orijinal</option><option value="TRY">TRY</option><option value="USD">USD</option></select></div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={()=>setManualStep(2)} disabled={!manualDateFrom||!manualDateTo} style={{padding:"10px 28px",borderRadius:8,border:"none",background:manualDateFrom&&manualDateTo?"#7C3AED":"#94A3B8",color:"#fff",fontSize:13,fontWeight:600,cursor:manualDateFrom&&manualDateTo?"pointer":"not-allowed"}}>Devam →</button></div>
              </>}

              {/* Step 2: İçerik Seçimi */}
              {manualStep===2&&<>
                <div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"18px 22px"}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:4}}>Rapora Dahil Edilecek Bölümler</div>
                  <div style={{fontSize:11,color:C.textSecondary,marginBottom:14}}>Hangi vaka bölümlerinin rapora ekleneceğini seçin</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {MANUAL_SECTIONS.map(sec=>{const a=manualSections.has(sec.id);return(
                      <button key={sec.id} onClick={()=>setManualSections(p=>{const n=new Set(p);n.has(sec.id)?n.delete(sec.id):n.add(sec.id);return n;})} style={{padding:"12px 14px",borderRadius:8,textAlign:"left",cursor:"pointer",background:a?"#7C3AED08":"#FAFBFC",border:`1.5px solid ${a?"#7C3AED":C.border}`,transition:"all 0.15s"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:a?"#7C3AED":C.text}}>{sec.label}</span>{a&&<span style={{color:"#7C3AED"}}><Icons.Check/></span>}</div>
                        <div style={{fontSize:11,color:C.textSecondary,lineHeight:1.3}}>{sec.desc}</div>
                      </button>);})}
                  </div>
                </div>
                <div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"18px 22px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>Vaka Satır Başlıkları</div><div style={{fontSize:11,color:C.textSecondary}}>Raporda görünecek vaka sütunları</div></div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>setManualCaseCols(new Set(MANUAL_CASE_COLUMNS.map(c=>c.id)))} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",color:C.primaryLight,fontWeight:500}}>Tümünü Seç</button>
                      <button onClick={()=>setManualCaseCols(new Set())} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",color:C.textSecondary,fontWeight:500}}>Temizle</button>
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{MANUAL_CASE_COLUMNS.map(col=>{const a=manualCaseCols.has(col.id);return<button key={col.id} onClick={()=>setManualCaseCols(p=>{const n=new Set(p);n.has(col.id)?n.delete(col.id):n.add(col.id);return n;})} style={{padding:"6px 12px",borderRadius:6,fontSize:12,fontWeight:500,cursor:"pointer",background:a?"#1E40AF10":"#F8FAFC",color:a?C.primary:C.textSecondary,border:`1px solid ${a?C.primary+"40":C.border}`}}>{col.label}</button>;})}</div>
                </div>
                {manualSections.has("islemler")&&<div style={{background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"18px 22px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>İşlem Tablo Satır Başlıkları</div><div style={{fontSize:11,color:C.textSecondary}}>İşlem bölümünde görünecek sütunlar</div></div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>setManualTxnCols(new Set(MANUAL_TXN_COLUMNS.map(c=>c.id)))} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",color:"#0891B2",fontWeight:500}}>Tümünü Seç</button>
                      <button onClick={()=>setManualTxnCols(new Set())} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",color:C.textSecondary,fontWeight:500}}>Temizle</button>
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{MANUAL_TXN_COLUMNS.map(col=>{const a=manualTxnCols.has(col.id);return<button key={col.id} onClick={()=>setManualTxnCols(p=>{const n=new Set(p);n.has(col.id)?n.delete(col.id):n.add(col.id);return n;})} style={{padding:"6px 12px",borderRadius:6,fontSize:12,fontWeight:500,cursor:"pointer",background:a?"#0891B210":"#F8FAFC",color:a?"#0891B2":C.textSecondary,border:`1px solid ${a?"#0891B240":C.border}`}}>{col.label}</button>;})}</div>
                </div>}
                <div style={{display:"flex",justifyContent:"space-between"}}><button onClick={()=>setManualStep(1)} style={{padding:"10px 28px",borderRadius:8,border:`1px solid ${C.border}`,background:"#fff",color:C.text,fontSize:13,fontWeight:500,cursor:"pointer"}}>← Geri</button><button onClick={()=>setManualStep(3)} style={{padding:"10px 28px",borderRadius:8,border:"none",background:"#7C3AED",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Devam →</button></div>
              </>}

              {/* Step 3: Düzen & Çıktı */}
              {manualStep===3&&<>
                <div style={{display:"flex",gap:16}}>
                  {/* Grouping & Sorting */}
                  <div style={{flex:1,background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"18px 22px"}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Gruplama & Sıralama</div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:6,textTransform:"uppercase"}}>Gruplama</label>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {MANUAL_GROUP_OPTIONS.map(g=><button key={g.id} onClick={()=>setManualGroupBy(g.id)} style={{padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:500,cursor:"pointer",background:manualGroupBy===g.id?"#7C3AED10":"#F8FAFC",color:manualGroupBy===g.id?"#7C3AED":C.textSecondary,border:`1px solid ${manualGroupBy===g.id?"#7C3AED40":C.border}`}}>{g.label}</button>)}
                      </div>
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:11,fontWeight:600,color:C.textSecondary,display:"block",marginBottom:6,textTransform:"uppercase"}}>Sıralama</label>
                      <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
                        <select value={manualSortBy} onChange={e=>setManualSortBy(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,color:C.text,outline:"none",cursor:"pointer",flex:1}}>
                          {MANUAL_SORT_OPTIONS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                        <div style={{display:"flex",borderRadius:6,overflow:"hidden",border:`1px solid ${C.border}`}}>
                          <button onClick={()=>setManualSortDir("asc")} style={{padding:"7px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:manualSortDir==="asc"?"#7C3AED":"#fff",color:manualSortDir==="asc"?"#fff":C.textSecondary}}>↑ Artan</button>
                          <button onClick={()=>setManualSortDir("desc")} style={{padding:"7px 12px",border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:manualSortDir==="desc"?"#7C3AED":"#fff",color:manualSortDir==="desc"?"#fff":C.textSecondary}}>↓ Azalan</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Export Format */}
                  <div style={{width:280,flexShrink:0,background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,padding:"18px 22px"}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Çıktı Formatı</div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {MANUAL_EXPORT_FORMATS.map(fmt=>(
                        <button key={fmt.id} onClick={()=>setManualExportFmt(fmt.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:8,border:`1.5px solid ${manualExportFmt===fmt.id?"#7C3AED":C.border}`,background:manualExportFmt===fmt.id?"#7C3AED08":"#FAFBFC",cursor:"pointer",textAlign:"left"}}>
                          <span style={{fontSize:20}}>{fmt.icon}</span>
                          <div><div style={{fontSize:13,fontWeight:600,color:manualExportFmt===fmt.id?"#7C3AED":C.text}}>{fmt.label}</div><div style={{fontSize:11,color:C.textSecondary}}>{fmt.desc}</div></div>
                          {manualExportFmt===fmt.id&&<span style={{marginLeft:"auto",color:"#7C3AED"}}><Icons.Check/></span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <button onClick={()=>setManualStep(2)} style={{padding:"10px 28px",borderRadius:8,border:`1px solid ${C.border}`,background:"#fff",color:C.text,fontSize:13,fontWeight:500,cursor:"pointer"}}>← Geri</button>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>showT("success",`"${manualReportName||"Manuel Rapor"}" ${manualExportFmt.toUpperCase()} olarak indiriliyor...`)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 24px",borderRadius:8,border:"none",background:"#7C3AED",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}><Icons.Download/> Rapor Oluştur & İndir</button>
                    <button onClick={()=>showT("info","Rapor e-posta adresinize gönderilecektir.")} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 20px",borderRadius:8,border:`1px solid ${C.border}`,background:"#fff",color:C.text,fontSize:13,fontWeight:500,cursor:"pointer"}}><Icons.Mail/> E-posta Gönder</button>
                  </div>
                </div>
              </>}
            </div>

            {/* Live Preview Panel */}
            <div style={{width:300,flexShrink:0,background:"#fff",borderRadius:12,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden",position:"sticky",top:24,maxHeight:"calc(100vh - 140px)"}}>
              <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,background:"linear-gradient(135deg,#7C3AED08,#8B5CF608)"}}><div style={{fontSize:13,fontWeight:600,color:"#7C3AED"}}>Canlı Önizleme</div><div style={{fontSize:11,color:C.textSecondary,marginTop:2}}>Rapor yapısı</div></div>
              <div style={{flex:1,overflow:"auto",padding:"14px 18px"}}>
                {/* Mini report structure preview */}
                <div style={{fontSize:11,fontWeight:600,color:C.textSecondary,textTransform:"uppercase",letterSpacing:"0.03em",marginBottom:8}}>Rapor Başlığı</div>
                <div style={{padding:"8px 10px",background:"#F8FAFC",borderRadius:6,marginBottom:12,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{manualReportName||"İsimsiz Rapor"}</div>
                  <div style={{fontSize:10.5,color:C.textSecondary,marginTop:2}}>{manualDateFrom&&manualDateTo?`${manualDateFrom} — ${manualDateTo}`:"Tarih belirtilmedi"} · {manualCurrency==="original"?"Orijinal":manualCurrency}</div>
                </div>

                {manualGroupBy&&<div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:600,color:"#7C3AED",textTransform:"uppercase",marginBottom:4}}>Gruplama: {MANUAL_GROUP_OPTIONS.find(g=>g.id===manualGroupBy)?.label}</div><div style={{borderLeft:"2px solid #7C3AED40",paddingLeft:8,marginLeft:4}}><div style={{fontSize:10,color:C.textSecondary,fontStyle:"italic"}}>Her grup için aşağıdaki yapı tekrarlanır</div></div></div>}

                <div style={{fontSize:11,fontWeight:600,color:C.textSecondary,textTransform:"uppercase",letterSpacing:"0.03em",marginBottom:6}}>Vaka Tablosu</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:12}}>
                  {MANUAL_CASE_COLUMNS.filter(c=>manualCaseCols.has(c.id)).map(c=><span key={c.id} style={{padding:"2px 6px",borderRadius:3,fontSize:9.5,background:"#EFF6FF",color:C.primary,border:"1px solid #BFDBFE"}}>{c.label}</span>)}
                  {manualCaseCols.size===0&&<span style={{fontSize:10,color:C.warning,fontStyle:"italic"}}>Sütun seçilmedi</span>}
                </div>

                {MANUAL_SECTIONS.filter(s=>manualSections.has(s.id)).map(s=>(
                  <div key={s.id} style={{marginBottom:10}}>
                    <div style={{fontSize:10,fontWeight:600,color:"#7C3AED",textTransform:"uppercase",marginBottom:4}}>↳ {s.label}</div>
                    {s.id==="islemler"&&manualTxnCols.size>0&&<div style={{display:"flex",flexWrap:"wrap",gap:2}}>{MANUAL_TXN_COLUMNS.filter(c=>manualTxnCols.has(c.id)).map(c=><span key={c.id} style={{padding:"2px 6px",borderRadius:3,fontSize:9.5,background:"#F0FDFA",color:"#0891B2",border:"1px solid #99F6E4"}}>{c.label}</span>)}</div>}
                    {s.id!=="islemler"&&<div style={{height:12,background:`repeating-linear-gradient(90deg,#E2E8F0 0px,#E2E8F0 30px,transparent 30px,transparent 34px)`,borderRadius:2,opacity:0.5}}/>}
                  </div>
                ))}

                {manualSections.size===0&&<div style={{padding:"12px 0",color:C.textSecondary,fontSize:11,fontStyle:"italic"}}>Bölüm seçilmedi</div>}

                <div style={{padding:"10px 0",borderTop:`1px solid ${C.border}`,marginTop:8}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.textSecondary,textTransform:"uppercase",marginBottom:6}}>Özet</div>
                  <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>
                    <div>Bölüm: <strong>{manualSections.size}</strong></div>
                    <div>Vaka sütunu: <strong>{manualCaseCols.size}</strong></div>
                    {manualSections.has("islemler")&&<div>İşlem sütunu: <strong>{manualTxnCols.size}</strong></div>}
                    <div>Sıralama: <strong>{MANUAL_SORT_OPTIONS.find(s=>s.id===manualSortBy)?.label} ({manualSortDir==="asc"?"↑":"↓"})</strong></div>
                    <div>Format: <strong>{manualExportFmt.toUpperCase()}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>}
        </main>
      </div>
    </div>
  );
}
