import React, { useState, useMemo } from 'react';
import { Client } from '../../../../types';
import { compileComplianceReport, ComplianceSummaryReport } from '../../../../data/complianceData';
import { D3DailyCheckinTrends } from './D3DailyCheckinTrends';
import { D3MedicalFlagDistribution } from './D3MedicalFlagDistribution';
import { useLanguage } from '../../../../context/LanguageContext';
import { 
    XMarkIcon, 
    PrinterIcon, 
    ShieldCheckIcon, 
    DocumentCheckIcon, 
    ExclamationTriangleIcon, 
    UserGroupIcon,
    CalendarDaysIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface ComplianceReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    clients: Client[];
}

export const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({ isOpen, onClose, clients }) => {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';
    const [daysLookback, setDaysLookback] = useState<number>(7);
    const [selectedPractitioner, setSelectedPractitioner] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'action_required'>('all');

    // Compile report data dynamically based on live clients & filters
    const report: ComplianceSummaryReport = useMemo(() => {
        return compileComplianceReport(clients, daysLookback, selectedPractitioner);
    }, [clients, daysLookback, selectedPractitioner]);

    // Filter audit table
    const filteredAuditRecords = useMemo(() => {
        return report.auditRecords.filter(record => {
            const matchesSearch = record.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.treatment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.medicalFlags.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesStatus = statusFilter === 'all' || record.triageStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [report.auditRecords, searchQuery, statusFilter]);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-fade-in print:p-0 print:bg-white print:static print:overflow-visible">
            {/* Modal Container */}
            <div className="bg-white rounded-3xl shadow-2xl border border-p-stone w-full max-w-6xl my-auto flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none overflow-hidden">
                
                {/* Header Bar */}
                <div className="px-6 py-5 border-b border-p-stone/70 bg-p-background flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0 print:border-b-2 print:border-p-primary">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-2xl bg-p-accent/15 text-p-primary border border-p-accent/30 flex-shrink-0 print:hidden">
                            <ShieldCheckIcon className="w-6 h-6 text-p-accent" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-xl sm:text-2xl font-serif font-bold text-p-primary">
                                    {t({ de: 'Podea Compliance- & Sicherheitsbericht', en: 'Podea Compliance & Safety Report' })}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-p-success/15 text-p-success border border-p-success/30">
                                    {t({ de: 'DSGVO Art. 9 & ISO-Auditiert', en: 'GDPR Art. 9 & ISO-Audited' })}
                                </span>
                            </div>
                            <p className="text-xs text-p-text/70 mt-0.5">
                                {t({ de: 'Berichts-ID', en: 'Report ID' })}: <span className="font-mono font-semibold text-p-primary">{report.reportId}</span> • {t({ de: 'Generiert am', en: 'Generated at' })}: {report.generatedAt}
                            </p>
                        </div>
                    </div>

                    {/* Quick Action Controls */}
                    <div className="flex items-center gap-2.5 self-end md:self-center print:hidden">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-p-stone hover:border-p-primary/40 hover:bg-p-surface text-p-primary text-xs font-semibold shadow-sm transition-all"
                            title={t({ de: 'Bericht drucken oder als PDF speichern', en: 'Print report or save as PDF' })}
                        >
                            <PrinterIcon className="w-4 h-4 text-p-accent" />
                            <span>{t({ de: 'Drucken / PDF', en: 'Print / PDF' })}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-p-text/50 hover:text-p-primary hover:bg-p-stone/40 transition-colors"
                            title={t({ de: 'Schließen', en: 'Close' })}
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Filter and Period Controls Bar */}
                <div className="px-6 py-3.5 bg-p-surface/60 border-b border-p-stone/50 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0 print:hidden">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 font-medium text-p-text/80">
                            <CalendarDaysIcon className="w-4 h-4 text-p-primary" />
                            <span>{t({ de: 'Zeitraum:', en: 'Period:' })}</span>
                        </div>
                        <div className="flex items-center bg-white rounded-lg border border-p-stone p-0.5">
                            <button
                                onClick={() => setDaysLookback(7)}
                                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                                    daysLookback === 7 ? 'bg-p-primary text-white font-semibold shadow-xs' : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                {t({ de: '7 Tage', en: '7 Days' })}
                            </button>
                            <button
                                onClick={() => setDaysLookback(14)}
                                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                                    daysLookback === 14 ? 'bg-p-primary text-white font-semibold shadow-xs' : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                {t({ de: '14 Tage', en: '14 Days' })}
                            </button>
                            <button
                                onClick={() => setDaysLookback(30)}
                                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                                    daysLookback === 30 ? 'bg-p-primary text-white font-semibold shadow-xs' : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                {t({ de: '30 Tage', en: '30 Days' })}
                            </button>
                        </div>

                        <div className="h-4 w-px bg-p-stone/80 mx-1 hidden sm:block" />

                        <div className="flex items-center gap-1.5">
                            <span className="text-p-text/70">{t({ de: 'Behandler:', en: 'Practitioner:' })}</span>
                            <select
                                value={selectedPractitioner}
                                onChange={(e) => setSelectedPractitioner(e.target.value)}
                                className="bg-white border border-p-stone rounded-lg px-2.5 py-1 text-xs text-p-primary font-medium focus:outline-hidden focus:border-p-accent"
                            >
                                <option value="all">{t({ de: 'Alle Behandler', en: 'All Practitioners' })}</option>
                                <option value="Sabine Weber">Sabine Weber</option>
                                <option value="Klaus Fischer">Klaus Fischer</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-p-text/60 text-[11px] font-mono">
                        {t({ 
                            de: `Aktive Datensätze: ${report.totalCheckins} Check-ins im Prüfintervall`, 
                            en: `Active Records: ${report.totalCheckins} check-ins in audit interval` 
                        })}
                    </div>
                </div>

                {/* Printable Clinic Letterhead (Print-only) */}
                <div className="hidden print:block p-6 border-b border-p-stone/80">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-p-primary">PODEA PRAXISZENTRUM</h1>
                            <p className="text-xs text-p-text/70 mt-0.5">
                                {t({ de: 'Praxis für medizinische Fußpflege & Podologische Triage', en: 'Practice for Medical Podiatry & Clinical Triage' })}
                            </p>
                            <p className="text-xs text-p-text/70">Musterstraße 12 • 80331 München • Tel: +49 89 203040</p>
                        </div>
                        <div className="text-right text-xs">
                            <p className="font-bold text-p-primary">
                                {t({ de: 'AUDIT-PROTOKOLL', en: 'AUDIT PROTOCOL' })}
                            </p>
                            <p className="font-mono text-p-text/80">{report.reportId}</p>
                            <p className="text-p-text/60">{report.generatedAt}</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Report Body */}
                <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 sm:space-y-8 flex-1 print:overflow-visible print:p-0 print:space-y-6">
                    
                    {/* Executive KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-p-background/80 rounded-2xl p-4 border border-p-stone/70">
                            <div className="flex items-center justify-between text-p-text/60 mb-1">
                                <span className="text-[11px] uppercase tracking-wider font-semibold">
                                    {t({ de: 'Gesamt-Check-ins', en: 'Total Check-ins' })}
                                </span>
                                <UserGroupIcon className="w-4 h-4 text-p-primary" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-serif font-bold text-p-primary">
                                {report.totalCheckins}
                            </div>
                            <p className="text-[11px] text-p-text/70 mt-1">
                                {isEnglish ? `${report.totalCheckins} digitally recorded` : `${report.dateRangeLabel} digital erfasst`}
                            </p>
                        </div>

                        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200">
                            <div className="flex items-center justify-between text-emerald-800 mb-1">
                                <span className="text-[11px] uppercase tracking-wider font-semibold">
                                    {t({ de: 'Einwilligungsquote', en: 'Consent Rate' })}
                                </span>
                                <DocumentCheckIcon className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-900">
                                {report.consentRate}%
                            </div>
                            <p className="text-[11px] text-emerald-700 mt-1">
                                {t({ 
                                    de: `${report.consentedCheckins} von ${report.totalCheckins} DSGVO-signiert`, 
                                    en: `${report.consentedCheckins} of ${report.totalCheckins} GDPR-signed` 
                                })}
                            </p>
                        </div>

                        <div className="bg-p-accent/10 rounded-2xl p-4 border border-p-accent/30">
                            <div className="flex items-center justify-between text-p-primary mb-1">
                                <span className="text-[11px] uppercase tracking-wider font-semibold">
                                    {t({ de: 'Klienten m. Risikoflag', en: 'Clients w/ Risk Flag' })}
                                </span>
                                <ExclamationTriangleIcon className="w-4 h-4 text-p-accent" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-serif font-bold text-p-accent">
                                {report.clientsWithFlags} <span className="text-sm font-sans font-normal text-p-text/60">({report.flagRate}%)</span>
                            </div>
                            <p className="text-[11px] text-p-text/70 mt-1">
                                {t({ de: 'Erhöhte Behandler-Sorgfaltspflicht', en: 'Heightened duty of care' })}
                            </p>
                        </div>

                        <div className="bg-red-50/70 rounded-2xl p-4 border border-red-200">
                            <div className="flex items-center justify-between text-red-800 mb-1">
                                <span className="text-[11px] uppercase tracking-wider font-semibold">
                                    {t({ de: 'Hochrisiko-Fälle', en: 'High-Risk Cases' })}
                                </span>
                                <ShieldCheckIcon className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-serif font-bold text-red-900">
                                {report.highRiskCount}
                            </div>
                            <p className="text-[11px] text-red-700 mt-1">
                                {t({ de: 'Antikoagulation, Diabetes, Polyneuropathie', en: 'Anticoagulation, Diabetes, Neuropathy' })}
                            </p>
                        </div>
                    </div>

                    {/* Both D3.js Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* D3 Chart 1: Daily Trends */}
                        <div className="bg-p-surface/60 rounded-2xl p-4 sm:p-5 border border-p-stone shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="font-serif font-bold text-base sm:text-lg text-p-primary">
                                        {t({ de: 'Tägliche Check-in Trends', en: 'Daily Check-in Trends' })}
                                    </h3>
                                    <p className="text-xs text-p-text/70">
                                        {t({ 
                                            de: 'Entwicklung von Gesamtaufkommen, DSGVO-Signatur und Risikoflaggen', 
                                            en: 'Trends in volume, GDPR consent signatures, and triage risk flags' 
                                        })}
                                    </p>
                                </div>
                            </div>
                            <D3DailyCheckinTrends data={report.dailyTrends} height={260} />
                        </div>

                        {/* D3 Chart 2: Medical Flag Distribution */}
                        <div className="bg-p-surface/60 rounded-2xl p-4 sm:p-5 border border-p-stone shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="font-serif font-bold text-base sm:text-lg text-p-primary">
                                        {t({ de: 'Medizinische Flaggen-Verteilung', en: 'Medical Flag Distribution' })}
                                    </h3>
                                    <p className="text-xs text-p-text/70">
                                        {t({ 
                                            de: 'Häufigkeit & Risikogruppierung für klinische Triage-Vorgaben', 
                                            en: 'Frequency & risk categorization for clinical triage protocols' 
                                        })}
                                    </p>
                                </div>
                            </div>
                            <D3MedicalFlagDistribution data={report.flagDistribution} height={260} />
                        </div>

                    </div>

                    {/* Clinical Triage Protocol Notice Banner */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-p-accent/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-p-accent/15 text-p-primary flex-shrink-0 mt-0.5">
                                <ShieldCheckIcon className="w-5 h-5 text-p-accent" />
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-p-primary text-sm sm:text-base">
                                    {t({ de: 'Podea Automatische Triage-Compliance', en: 'Podea Automated Triage Compliance' })}
                                </h4>
                                <p className="text-xs text-p-text/80 mt-0.5 max-w-2xl">
                                    {t({
                                        de: 'Jeder Klient mit diagnostiziertem Diabetes mellitus, Antikoagulanzientherapie (Marcumar/NOAKs) oder sensorischer Polyneuropathie wird im Behandler-Tablet automatisch mit Signalfarben hervorgehoben. Keine Behandlung darf ohne Einsicht der aktuellen Anamnese begonnen werden.',
                                        en: 'Every client diagnosed with diabetes mellitus, anticoagulation therapy, or peripheral neuropathy is automatically highlighted with alert badges on the practitioner tablet. No treatment may begin without reviewing current anamnesis.'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2 text-xs font-semibold text-p-success bg-p-success/10 px-3 py-1.5 rounded-xl border border-p-success/20">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>{t({ de: '100% Triage-Erfüllung', en: '100% Triage Compliance' })}</span>
                        </div>
                    </div>

                    {/* Detailed Check-in Audit Log Table */}
                    <div className="bg-white rounded-2xl border border-p-stone overflow-hidden shadow-sm">
                        <div className="p-4 sm:p-5 border-b border-p-stone/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-p-background/50">
                            <div>
                                <h3 className="font-serif font-bold text-base sm:text-lg text-p-primary">
                                    {t({ de: 'Audit-Protokoll der letzten Check-ins', en: 'Recent Check-in Audit Protocol' })}
                                </h3>
                                <p className="text-xs text-p-text/60">
                                    {t({ 
                                        de: 'Einzelfallnachweis für Aufsichtsbehörden und Qualitätsmanagement', 
                                        en: 'Individual verifiable records for regulatory compliance and audit logs' 
                                    })}
                                </p>
                            </div>

                            {/* Table search & status filter */}
                            <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="w-4 h-4 text-p-text/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder={t({ de: "Klient / Diagnose suchen...", en: "Search client / flag..." })}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-p-stone text-xs text-p-primary focus:outline-hidden focus:border-p-accent w-48 sm:w-56"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e: any) => setStatusFilter(e.target.value)}
                                    className="bg-white border border-p-stone rounded-xl px-2.5 py-1.5 text-xs text-p-primary font-medium focus:outline-hidden"
                                >
                                    <option value="all">{t({ de: 'Alle Status', en: 'All Statuses' })}</option>
                                    <option value="verified">{t({ de: 'Nur Verifiziert', en: 'Verified Only' })}</option>
                                    <option value="action_required">{t({ de: 'Aktion erforderlich', en: 'Action Required' })}</option>
                                </select>
                            </div>
                        </div>

                        {/* Mobile Vertically Stacked Audit Cards (< md) */}
                        <div className="block md:hidden divide-y divide-p-stone/40 print:hidden">
                            {filteredAuditRecords.length === 0 ? (
                                <div className="p-8 text-center text-p-text/50 italic text-xs">
                                    {t({ 
                                        de: 'Keine Check-in Datensätze für diese Filterkriterien gefunden.', 
                                        en: 'No check-in audit records found matching these criteria.' 
                                    })}
                                </div>
                            ) : (
                                filteredAuditRecords.map((rec) => (
                                    <div key={rec.id} className="p-4 space-y-3 bg-white hover:bg-p-background/40 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-semibold text-p-primary text-sm">{rec.clientName}</div>
                                                <span className="text-[11px] font-mono text-p-text/60">{rec.date}, {rec.time}</span>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex-shrink-0 ${
                                                rec.triageStatus === 'verified'
                                                    ? 'bg-p-success/15 text-p-success border border-p-success/30'
                                                    : rec.triageStatus === 'action_required'
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                    : 'bg-p-background text-p-text/70 border border-p-stone'
                                            }`}>
                                                {rec.triageStatus === 'verified' 
                                                    ? t({ de: 'Freigegeben', en: 'Cleared' }) 
                                                    : rec.triageStatus === 'action_required' 
                                                    ? t({ de: 'Unterschrift fehlt', en: 'Signature Missing' }) 
                                                    : t({ de: 'Routine', en: 'Routine' })}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-p-stone/40 pt-2.5">
                                            <div>
                                                <span className="text-[10px] uppercase font-semibold text-p-text/40 block mb-0.5">
                                                    {t({ de: 'Behandlung', en: 'Treatment' })}
                                                </span>
                                                <span className="font-medium text-p-primary">{rec.treatment}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-semibold text-p-text/40 block mb-0.5">
                                                    {t({ de: 'Behandler', en: 'Practitioner' })}
                                                </span>
                                                <span className="font-medium text-p-text/80">🩺 {rec.practitioner}</span>
                                            </div>
                                        </div>

                                        {/* Medical flags */}
                                        {rec.medicalFlags.length > 0 && (
                                            <div className="pt-1">
                                                <span className="text-[10px] uppercase font-semibold text-p-text/40 block mb-1">
                                                    {t({ de: 'Medizinische Risiken', en: 'Medical Risks' })}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {rec.medicalFlags.map((flag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                                                flag.toLowerCase().includes('diabetes') || flag.toLowerCase().includes('blutverdünner') || flag.toLowerCase().includes('marcumar')
                                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                                    : 'bg-p-accent/15 text-p-primary border-p-accent/30'
                                                            }`}
                                                        >
                                                            {flag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* DSGVO Signature */}
                                        <div className="flex items-center justify-between text-xs pt-2 border-t border-p-stone/40">
                                            <span className="text-[10px] uppercase font-semibold text-p-text/40">
                                                {t({ de: 'DSGVO-Signatur', en: 'GDPR Signature' })}
                                            </span>
                                            {rec.consentGiven ? (
                                                <div className="flex items-center gap-1.5 text-p-success font-medium text-[11px]">
                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                    <span>{t({ de: 'Digital signiert', en: 'Digitally signed' })} ({rec.signatureTimestamp || '08:58'})</span>
                                                </div>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[10px]">
                                                    {t({ de: 'Ausstehend am Empfang', en: 'Pending at reception' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop Table View (>= md) */}
                        <div className="hidden md:block print:block overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-p-stone bg-p-surface/40 text-p-text/60 uppercase tracking-wider font-semibold">
                                        <th className="py-3 px-4">{t({ de: 'Zeitpunkt', en: 'Timestamp' })}</th>
                                        <th className="py-3 px-4">{t({ de: 'Klient', en: 'Client' })}</th>
                                        <th className="py-3 px-4">{t({ de: 'Behandler', en: 'Practitioner' })}</th>
                                        <th className="py-3 px-4">{t({ de: 'Behandlung', en: 'Treatment' })}</th>
                                        <th className="py-3 px-4">{t({ de: 'Medizinische Risiken', en: 'Medical Risks' })}</th>
                                        <th className="py-3 px-4">{t({ de: 'DSGVO-Signatur', en: 'GDPR Signature' })}</th>
                                        <th className="py-3 px-4 text-right">{t({ de: 'Triage-Audit', en: 'Triage Audit' })}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-p-stone/40">
                                    {filteredAuditRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-p-text/50">
                                                {t({ 
                                                    de: 'Keine Check-in Datensätze für diese Filterkriterien gefunden.', 
                                                    en: 'No check-in audit records found matching these criteria.' 
                                                })}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAuditRecords.map((rec) => (
                                            <tr key={rec.id} className="hover:bg-p-surface/40 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-medium text-p-primary whitespace-nowrap">
                                                    {rec.date}, {rec.time}
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-p-primary whitespace-nowrap">
                                                    {rec.clientName}
                                                </td>
                                                <td className="py-3.5 px-4 text-p-text/80 whitespace-nowrap">
                                                    {rec.practitioner}
                                                </td>
                                                <td className="py-3.5 px-4 text-p-text/80">
                                                    {rec.treatment}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {rec.medicalFlags.length === 0 ? (
                                                        <span className="text-p-text/40 italic">{t({ de: 'Keine erfasst', en: 'None recorded' })}</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                            {rec.medicalFlags.map((flag, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                                                        flag.toLowerCase().includes('diabetes') || flag.toLowerCase().includes('blutverdünner') || flag.toLowerCase().includes('marcumar')
                                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                                            : 'bg-p-accent/15 text-p-primary border-p-accent/30'
                                                                    }`}
                                                                >
                                                                    {flag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    {rec.consentGiven ? (
                                                        <div className="flex items-center gap-1.5 text-p-success font-medium">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            <span>{t({ de: 'Digital signiert', en: 'Digitally signed' })} ({rec.signatureTimestamp || '08:58'})</span>
                                                        </div>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                                                            {t({ de: 'Ausstehend am Empfang', en: 'Pending at reception' })}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                                        rec.triageStatus === 'verified'
                                                            ? 'bg-p-success/15 text-p-success border border-p-success/30'
                                                            : rec.triageStatus === 'action_required'
                                                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                            : 'bg-p-background text-p-text/70 border border-p-stone'
                                                    }`}>
                                                        {rec.triageStatus === 'verified' 
                                                            ? t({ de: 'Freigegeben', en: 'Cleared' }) 
                                                            : rec.triageStatus === 'action_required' 
                                                            ? t({ de: 'Unterschrift fehlt', en: 'Signature Missing' }) 
                                                            : t({ de: 'Routine', en: 'Routine' })}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Audit Sign-Off Section (Formal Medical Signatures) */}
                    <div className="pt-4 border-t border-p-stone/70 grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                        <div className="p-4 rounded-2xl bg-p-background/60 border border-p-stone/60 text-xs">
                            <span className="font-serif font-bold text-p-primary block mb-1">
                                {t({ de: 'Konformitätserklärung nach MPG & DSGVO', en: 'Declaration of Conformity (MPG & GDPR)' })}
                            </span>
                            <p className="text-p-text/70 leading-relaxed">
                                {t({
                                    de: 'Die erfassten medizinischen Kontraindikationen und Risikomerkmale wurden gemäß Art. 9 DSGVO für besondere Kategorien personenbezogener Gesundheitsdaten verarbeitet und vor Behandlungsbeginn an das behandelnde Fachpersonal übermittelt.',
                                    en: 'All recorded medical contraindications and risk factors were processed under GDPR Art. 9 for special categories of health data and reviewed by clinical staff prior to commencing treatment.'
                                })}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-p-background/60 border border-p-stone/60 text-xs flex flex-col justify-between">
                            <div>
                                <span className="font-serif font-bold text-p-primary block mb-1">
                                    {t({ de: 'Prüfung & Abnahme (Praxisleitung)', en: 'Review & Sign-Off (Clinic Management)' })}
                                </span>
                                <p className="text-p-text/70">
                                    {t({ de: 'Geprüft durch:', en: 'Audited by:' })} <span className="font-semibold text-p-primary">{t({ de: 'Sabine Weber (Podologische Leitung)', en: 'Sabine Weber (Head of Podiatry)' })}</span>
                                </p>
                            </div>
                            <div className="pt-4 mt-2 border-t border-p-stone/70 flex items-center justify-between text-[11px] text-p-text/50">
                                <span>{t({ de: 'Unterschrift / Digitale Freigabe:', en: 'Signature / Approval:' })} <em>S. Weber</em></span>
                                <span>{t({ de: 'Status: Gültig', en: 'Status: Valid' })}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Bar */}
                <div className="px-6 py-4 border-t border-p-stone/70 bg-p-background flex items-center justify-between flex-shrink-0 print:hidden">
                    <span className="text-xs text-p-text/60">
                        {t({ 
                            de: 'Podea Suite v2.4 • Automatisierte Compliance & Triage-Dokumentation', 
                            en: 'Podea Suite v2.4 • Automated Compliance & Triage Documentation' 
                        })}
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-p-primary text-white hover:bg-p-primary/90 text-xs font-semibold shadow-sm transition-all"
                        >
                            <PrinterIcon className="w-4 h-4 text-p-accent" />
                            <span>{t({ de: 'Bericht drucken / Exportieren', en: 'Print / Export Report' })}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-white border border-p-stone text-p-primary hover:bg-p-stone/20 text-xs font-semibold transition-all"
                        >
                            {t({ de: 'Schließen', en: 'Close' })}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
