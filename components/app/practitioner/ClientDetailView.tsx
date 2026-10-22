
import React, { useState, useEffect } from 'react';
import AppHeader from '../AppHeader';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { View, Client } from '../../../types';
import { services } from '../../../data/mockData';
import { useLanguage } from '../../../context/LanguageContext';
import { 
    BellIcon, 
    SparklesIcon, 
    ClipboardDocumentCheckIcon as ClipboardCheckIcon, 
    PlayIcon, 
    PauseIcon,
    CheckIcon, 
    LockClosedIcon, 
    InformationCircleIcon, 
    ClockIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    PencilSquareIcon,
    TrashIcon,
    CalendarDaysIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    UserCircleIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';
import PrintableInvoiceSummary from './PrintableInvoiceSummary';
import PractitionerFAB from './PractitionerFAB';

const TreatmentHistoryTimeline: React.FC<{ client: Client }> = ({ client }) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(true);
    const history = client.history || [];
    const totalVisits = history.length + 1;

    return (
        <Card className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-p-stone/50 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-p-accent/15 text-p-primary">
                        <CalendarDaysIcon className="w-5 h-5 text-p-accent" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-serif text-p-primary">
                                {t({ de: 'Behandlungshistorie & Verlauf', en: 'Treatment History & Progress' })}
                            </h2>
                            <span className="text-[11px] font-semibold text-p-primary bg-p-background px-2.5 py-0.5 rounded-full border border-p-stone/70">
                                {totalVisits} {t({ de: 'Termine dokumentiert', en: 'Appointments documented' })}
                            </span>
                        </div>
                        <p className="text-xs text-p-text/60">
                            {t({ 
                                de: 'Frühere Termine, Befundnotizen und historische Risikofaktoren im Überblick', 
                                en: 'Past appointments, clinical findings, and medical flag history at a glance' 
                            })}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1.5 text-xs text-p-text/70 hover:text-p-primary font-medium transition-colors self-start sm:self-auto bg-p-background px-3 py-1.5 rounded-lg border border-p-stone/50"
                >
                    <span>{isExpanded ? t({ de: 'Kompakt anzeigen', en: 'Show compact' }) : t({ de: 'Alle Details', en: 'Show all details' })}</span>
                    {isExpanded ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Quick Relationship Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-p-surface border border-p-stone/50">
                    <span className="text-[10px] uppercase font-bold text-p-text/50 block">
                        {t({ de: 'Klientenstatus', en: 'Client Status' })}
                    </span>
                    <span className="font-semibold text-p-primary mt-0.5 block">
                        {t({ de: 'Stammkunde seit Mai 2026', en: 'Regular client since May 2026' })}
                    </span>
                </div>
                <div className="p-3 rounded-xl bg-p-surface border border-p-stone/50">
                    <span className="text-[10px] uppercase font-bold text-p-text/50 block">
                        {t({ de: 'Behandlungsrhythmus', en: 'Treatment Cadence' })}
                    </span>
                    <span className="font-semibold text-p-primary mt-0.5 block">
                        {t({ de: 'Ø 4-5 Wochen Intervall', en: 'Ø 4-5 week interval' })}
                    </span>
                </div>
                <div className="p-3 rounded-xl bg-p-surface border border-p-stone/50 col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-p-text/50 block">
                        {t({ de: 'Stammbehandler/in', en: 'Assigned Practitioner' })}
                    </span>
                    <span className="font-semibold text-p-primary mt-0.5 block flex items-center gap-1">
                        <UserCircleIcon className="w-3.5 h-3.5 text-p-accent" />
                        {client.practitioner}
                    </span>
                </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 sm:pl-8 border-l-2 border-p-stone/80 ml-3 sm:ml-4 space-y-7 pt-1">
                {/* Active / Current Appointment Node */}
                <div className="relative">
                    {/* Pulsing Node */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full bg-white border-2 border-p-accent flex items-center justify-center shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-p-accent animate-ping opacity-75" />
                        <span className="absolute w-2 h-2 rounded-full bg-p-accent" />
                    </div>

                    <div className="bg-p-accent/10 border border-p-accent/30 rounded-xl p-4 space-y-2.5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-p-accent/20 pb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-xs uppercase tracking-wider text-p-primary">
                                    {t({ de: 'Heute (Aktueller Termin)', en: 'Today (Current Appointment)' })}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-p-primary font-mono border border-p-accent/30">
                                    {client.appointmentTime}
                                </span>
                            </div>
                            <span className="text-[11px] font-medium text-p-primary">
                                {t({ de: 'Behandler/in:', en: 'Practitioner:' })} <strong>{client.practitioner}</strong>
                            </span>
                        </div>

                        <div>
                            <span className="text-[10px] uppercase font-bold text-p-text/50 block">
                                {t({ de: 'Gebuchte Leistung:', en: 'Booked Service:' })}
                            </span>
                            <p className="font-serif font-semibold text-p-primary text-sm mt-0.5">
                                {client.lastTreatment}
                            </p>
                        </div>

                        {client.medicalFlags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] font-bold uppercase text-p-warning flex items-center gap-1">
                                    <BellIcon className="w-3 h-3" /> {t({ de: 'Risikofaktoren:', en: 'Risk Factors:' })}
                                </span>
                                {client.medicalFlags.map(flag => (
                                    <span key={flag} className="px-2 py-0.5 bg-p-warning/10 text-p-warning border border-p-warning/20 rounded text-[11px] font-semibold">
                                        {flag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {client.notes.length > 0 && isExpanded && (
                            <div className="text-xs text-p-text/80 bg-white/80 p-3 rounded-lg border border-p-stone/50 mt-1 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block">
                                    {t({ de: 'Dokumentierte Präferenzen / Anamnese:', en: 'Documented Preferences / Medical History:' })}
                                </span>
                                {client.notes.slice(0, 3).map((n, i) => (
                                    <p key={i} className="text-xs text-p-text flex items-start gap-1.5">
                                        <span className="mt-1 w-1 h-1 rounded-full bg-p-accent block flex-shrink-0" />
                                        <span>{n}</span>
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Historical Treatment Nodes */}
                {history.length === 0 ? (
                    <div className="relative pt-2">
                        <div className="absolute -left-[31px] sm:-left-[39px] top-2.5 w-6 h-6 rounded-full bg-white border-2 border-p-stone flex items-center justify-center text-p-text/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-p-stone" />
                        </div>
                        <p className="text-xs text-p-text/50 italic bg-p-surface p-3 rounded-lg border border-p-stone/40">
                            {t({ 
                                de: 'Erstbesuch — Bislang keine Vorbehandlungen in der elektronischen Kartei archiviert.', 
                                en: 'Initial visit — No previous treatments archived in electronic chart.' 
                            })}
                        </p>
                    </div>
                ) : (
                    history.map((entry, idx) => (
                        <div key={entry.id || idx} className="relative group">
                            {/* Circle Node */}
                            <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-white border-2 border-p-primary/40 group-hover:border-p-primary flex items-center justify-center transition-colors shadow-sm">
                                <CheckIcon className="w-3 h-3 text-p-primary/70 group-hover:text-p-primary" />
                            </div>

                            <div className="bg-white border border-p-stone/70 rounded-xl p-4 space-y-2.5 hover:border-p-primary/30 hover:shadow-sm transition-all">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-p-stone/40 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-serif font-bold text-sm text-p-primary">
                                            {entry.date}
                                        </span>
                                        {entry.durationMinutes && (
                                            <span className="text-[10px] text-p-text/50 font-mono">
                                                • {entry.durationMinutes} {t({ de: 'Min', en: 'min' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-p-text/60">
                                        <span>{t({ de: 'Behandler/in:', en: 'Practitioner:' })}</span>
                                        <span className="font-semibold text-p-primary">{entry.practitioner}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-p-primary text-xs tracking-wide">
                                        {entry.treatment}
                                    </h4>
                                </div>

                                {/* Practitioner Clinical Notes */}
                                <div className="p-3 bg-p-surface rounded-lg border border-p-stone/40 text-xs text-p-text leading-relaxed">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block mb-1">
                                        {t({ de: 'Befund & Behandlungsnotiz:', en: 'Findings & Treatment Notes:' })}
                                    </span>
                                    <p>{entry.notes}</p>
                                </div>

                                {/* Medical Flag History at that appointment */}
                                {entry.medicalFlags && entry.medicalFlags.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-p-warning flex items-center gap-1">
                                            <BellIcon className="w-3 h-3" /> {t({ de: 'Historische Risikofaktoren:', en: 'Historical Risk Factors:' })}
                                        </span>
                                        {entry.medicalFlags.map((flag, fIdx) => (
                                            <span 
                                                key={fIdx} 
                                                className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                                                    flag.includes('Neu') 
                                                        ? 'bg-p-warning/15 text-p-warning border-p-warning/30 font-bold' 
                                                        : 'bg-p-background text-p-text/80 border-p-stone'
                                                }`}
                                            >
                                                {flag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Purchased products / upsells */}
                                {entry.purchasedItems && entry.purchasedItems.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-p-text/70">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-p-accent flex items-center gap-1">
                                            <SparklesIcon className="w-3 h-3" /> {t({ de: 'Zusatzkauf:', en: 'Purchased Add-on:' })}
                                        </span>
                                        {entry.purchasedItems.map((prod, pIdx) => (
                                            <span key={pIdx} className="bg-p-accent/10 text-p-primary px-2 py-0.5 rounded text-[10px] font-medium border border-p-accent/20">
                                                {prod}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

const ClientDetailView: React.FC<{ setView: (view: View) => void; client: Client | null; onUpdateClient: (client: Client) => void }> = ({ setView, client, onUpdateClient }) => {
    const { t } = useLanguage();
    // Safety check state with timestamps
    const [checklist, setChecklist] = useState<{
        risk: boolean;
        riskTime: string | null;
        kit: boolean;
        kitTime: string | null;
    }>({ 
        risk: false, 
        riskTime: null, 
        kit: false, 
        kitTime: null 
    });
    
    const [upsellSold, setUpsellSold] = useState(false);

    // Treatment Stopwatch / Duration Tracking
    const plannedMinutes = client 
        ? (services.find(s => s.name === client.lastTreatment)?.duration || 45) 
        : 45;
    const plannedSeconds = plannedMinutes * 60;

    const [elapsedSeconds, setElapsedSeconds] = useState<number>(
        client?.status === 'in-progress' ? 14 * 60 + 25 : client?.status === 'done' ? plannedSeconds - 180 : 0
    );
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(client?.status === 'in-progress');
    const [treatmentStartTime, setTreatmentStartTime] = useState<string | null>(
        client?.status === 'in-progress' ? '09:05:12' : client?.status === 'done' ? '09:00:00' : null
    );
    const [treatmentEndTime, setTreatmentEndTime] = useState<string | null>(
        client?.status === 'done' ? '09:42:00' : null
    );

    // Stopwatch interval
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerRunning && client?.status === 'in-progress') {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning, client?.status]);

    if (!client) {
        return (
            <div className="flex items-center justify-center h-screen bg-p-background">
                <p>{t({ de: 'Klient nicht gefunden.', en: 'Client not found.' })}</p>
                <button onClick={() => setView('practitionerArrivals')}>{t({ de: 'Zurück', en: 'Go back' })}</button>
            </div>
        );
    }

    const status = client.status;

    const getCurrentTime = () => new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const getCurrentTimeWithSeconds = () => new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const formatTime = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleRisk = () => {
        setChecklist(prev => ({
            ...prev,
            risk: !prev.risk,
            riskTime: !prev.risk ? getCurrentTime() : null
        }));
    };

    const toggleKit = () => {
        setChecklist(prev => ({
            ...prev,
            kit: !prev.kit,
            kitTime: !prev.kit ? getCurrentTime() : null
        }));
    };

    const handleStartTreatment = () => {
        const timeNow = getCurrentTimeWithSeconds();
        setTreatmentStartTime(timeNow);
        setElapsedSeconds(0);
        setIsTimerRunning(true);
        onUpdateClient({ ...client, status: 'in-progress' });
    };

    const handleFinishTreatment = () => {
        const timeNow = getCurrentTimeWithSeconds();
        setTreatmentEndTime(timeNow);
        setIsTimerRunning(false);
        onUpdateClient({ ...client, status: 'done' });
    };

    const handleToggleTimerPause = () => {
        setIsTimerRunning(prev => !prev);
    };

    // Internal Treatment Notes State & Handlers
    const [treatmentNote, setTreatmentNote] = useState('');
    const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
    const [recentNoteAuditTime, setRecentNoteAuditTime] = useState<string | null>(null);

    const quickPhrases = [
        t({ de: 'Hornhaut abgetragen', en: 'Callus removed' }),
        t({ de: 'Nagelfalz gereinigt', en: 'Nail fold cleansed' }),
        t({ de: 'Wundkontrolle unauffällig', en: 'Wound check unremarkable' }),
        t({ de: 'Pflegebalsam appliziert', en: 'Care balm applied' }),
        t({ de: 'Wiedervorstellung in 4 Wochen', en: 'Follow-up in 4 weeks' })
    ];

    const handleAddQuickPhrase = (phrase: string) => {
        setTreatmentNote(prev => prev ? `${prev}, ${phrase}` : phrase);
    };

    const handleSaveTreatmentNote = () => {
        if (!treatmentNote.trim() || !client) return;
        const timeNow = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const formattedEntry = `[${timeNow} - ${t({ de: 'Befund', en: 'Finding' })}] ${treatmentNote.trim()}`;
        const updatedNotes = [formattedEntry, ...client.notes];
        
        onUpdateClient({
            ...client,
            notes: updatedNotes
        });
        setTreatmentNote('');
        setRecentNoteAuditTime(timeNow);
        setNoteSavedFeedback(true);
        setTimeout(() => {
            setNoteSavedFeedback(false);
        }, 3000);
    };

    const handleDeleteNote = (indexToDelete: number) => {
        if (!client) return;
        const updatedNotes = client.notes.filter((_, idx) => idx !== indexToDelete);
        onUpdateClient({
            ...client,
            notes: updatedNotes
        });
    };

    const [mobileTab, setMobileTab] = useState<'treatment' | 'notes' | 'audit'>('treatment');
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);

    const handleDirectPrint = () => {
        window.print();
    };

    const handleQuickCompleteSafetyCheck = () => {
        const timeNow = getCurrentTime();
        setChecklist({
            risk: true,
            riskTime: timeNow,
            kit: true,
            kitTime: timeNow
        });
    };

    const isSafetyCheckComplete = checklist.risk && checklist.kit;
    const progressPercent = Math.min(Math.round((elapsedSeconds / plannedSeconds) * 100), 100);
    const isOvertime = elapsedSeconds > plannedSeconds;
    const overtimeDiff = isOvertime ? elapsedSeconds - plannedSeconds : plannedSeconds - elapsedSeconds;

    // Modular Card Definitions for Responsive Desktop & Mobile Rendering
    const stopwatchCard = (
        <Card className={`border transition-all duration-300 p-4 sm:p-6 ${
            status === 'in-progress' 
                ? isOvertime 
                    ? 'border-p-warning/50 bg-p-warning/5 shadow-sm' 
                    : 'border-p-accent/40 bg-white shadow-soft ring-1 ring-p-accent/20' 
                : status === 'done'
                    ? 'border-p-success/30 bg-p-success/5'
                    : 'border-p-stone/70 bg-white'
        }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-p-stone/50">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 sm:p-3 rounded-xl transition-colors flex-shrink-0 ${
                        status === 'in-progress' 
                            ? isOvertime 
                                ? 'bg-p-warning/15 text-p-warning' 
                                : 'bg-p-accent/15 text-p-accent' 
                            : status === 'done' 
                                ? 'bg-p-success/15 text-p-success' 
                                : 'bg-p-primary/10 text-p-primary'
                    }`}>
                        <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif font-semibold text-p-primary text-base">
                                {t({ de: 'Behandlungs-Timer', en: 'Treatment Timer' })}
                            </h3>
                            {status === 'in-progress' && (
                                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                                    isOvertime
                                        ? 'bg-p-warning/15 text-p-warning border-p-warning/30 animate-pulse'
                                        : 'bg-p-accent/15 text-p-primary border-p-accent/30 animate-pulse'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOvertime ? 'bg-p-warning' : 'bg-p-accent'}`} />
                                    {isTimerRunning ? t({ de: 'Läuft', en: 'Running' }) : t({ de: 'Pausiert', en: 'Paused' })}
                                </span>
                            )}
                            {status === 'done' && (
                                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-p-success/15 text-p-success border border-p-success/30">
                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                    {t({ de: 'Abgeschlossen', en: 'Completed' })}
                                </span>
                            )}
                            {status === 'waiting' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-p-stone text-p-text/70">
                                    {t({ de: 'Bereit zum Start', en: 'Ready to Start' })}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-p-text/60 mt-0.5 truncate">
                            {client.lastTreatment} • {t({ de: 'Geplant:', en: 'Planned:' })} <span className="font-semibold text-p-primary">{plannedMinutes} {t({ de: 'Min', en: 'min' })}</span>
                        </p>
                    </div>
                </div>

                {/* Stopwatch display & quick controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-p-stone/40">
                    {status === 'in-progress' && (
                        <button
                            onClick={handleToggleTimerPause}
                            title={isTimerRunning ? t({ de: 'Timer pausieren', en: 'Pause timer' }) : t({ de: 'Timer fortsetzen', en: 'Resume timer' })}
                            className="p-2 sm:p-2.5 rounded-lg border border-p-stone hover:bg-p-surface transition-colors text-p-primary shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-medium"
                        >
                            {isTimerRunning ? (
                                <>
                                    <PauseIcon className="w-4 h-4 text-p-text" />
                                    <span className="sm:hidden">{t({ de: 'Pause', en: 'Pause' })}</span>
                                </>
                            ) : (
                                <>
                                    <PlayIcon className="w-4 h-4 text-p-success" />
                                    <span className="sm:hidden text-p-success">{t({ de: 'Weiter', en: 'Resume' })}</span>
                                </>
                            )}
                        </button>
                    )}

                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-p-text/50 block">
                            {t({ de: 'Ist-Zeit / Soll-Zeit', en: 'Actual / Target Time' })}
                        </span>
                        <div className="flex items-baseline justify-end gap-1 font-mono">
                            <span className={`text-xl sm:text-2xl font-bold tracking-tight ${
                                status === 'in-progress' 
                                    ? isOvertime ? 'text-p-warning' : 'text-p-primary' 
                                    : status === 'done' 
                                        ? 'text-p-success' 
                                        : 'text-p-text/50'
                            }`}>
                                {formatTime(elapsedSeconds)}
                            </span>
                            <span className="text-xs text-p-text/50 font-normal">/ {formatTime(plannedSeconds)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar & Status Pill */}
            <div className="pt-3 space-y-2">
                <div className="w-full bg-p-stone/50 h-2 sm:h-2.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                            isOvertime 
                                ? 'bg-p-warning' 
                                : status === 'done' 
                                    ? 'bg-p-success' 
                                    : 'bg-p-accent'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-xs text-p-text/70">
                    <div className="truncate mr-2">
                        {status === 'waiting' && (
                            <span>{t({ de: 'Startet bei Klick auf „Behandlung starten“', en: 'Starts when clicking "Start Treatment"' })}</span>
                        )}
                        {status === 'in-progress' && (
                            isOvertime ? (
                                <span className="text-p-warning font-semibold flex items-center gap-1">
                                    <span>⚠️</span> +{formatTime(overtimeDiff)} {t({ de: 'Min Überzeit', en: 'min overtime' })}
                                </span>
                            ) : (
                                <span className="text-p-primary font-medium">
                                    {t({ de: `Noch ${formatTime(overtimeDiff)} Min verbleibend`, en: `${formatTime(overtimeDiff)} min remaining` })}
                                </span>
                            )
                        )}
                        {status === 'done' && (
                            <span className="text-p-success font-medium">
                                {t({ de: 'Dauer:', en: 'Duration:' })} {formatTime(elapsedSeconds)} {t({ de: 'Min', en: 'min' })} ({isOvertime ? `+${formatTime(overtimeDiff)} ${t({ de: 'Überzeit', en: 'overtime' })}` : `${formatTime(overtimeDiff)} ${t({ de: 'schneller', en: 'faster' })}`})
                            </span>
                        )}
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-p-text/60 flex-shrink-0">
                        {progressPercent}%
                    </span>
                </div>
            </div>
        </Card>
    );

    const safetyCheckCard = (
        <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-p-stone/50 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-p-success/15 text-p-success">
                        <ClipboardCheckIcon className="w-5 h-5"/>
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-serif text-p-primary">
                            {t({ de: 'Sicherheits-Check', en: 'Safety Check' })}
                        </h2>
                        <p className="text-[11px] text-p-text/60">
                            {t({ de: 'Pflichtprüfung vor Behandlungsbeginn', en: 'Mandatory verification before treatment start' })}
                        </p>
                    </div>
                </div>

                {!isSafetyCheckComplete && (
                    <button
                        onClick={handleQuickCompleteSafetyCheck}
                        className="text-xs px-2.5 py-1 rounded-lg bg-p-accent/15 text-p-primary hover:bg-p-accent/25 font-semibold transition-all border border-p-accent/30"
                    >
                        {t({ de: 'Beide abhaken', en: 'Check both' })}
                    </button>
                )}
            </div>

            <div className="space-y-2.5">
                <div 
                    onClick={toggleRisk}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 border min-h-[48px] ${
                        checklist.risk 
                            ? 'bg-p-success/10 border-p-success/30' 
                            : 'bg-p-surface border-p-stone/70 hover:border-p-primary/20'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                            checklist.risk ? 'bg-p-success border-p-success' : 'border-p-stone bg-white'
                        }`}>
                            {checklist.risk && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-medium ${checklist.risk ? 'text-p-success' : 'text-p-primary'}`}>
                            {t({ de: 'Risikohinweise & Anamnese geprüft', en: 'Risk factors & medical history verified' })}
                        </span>
                    </div>
                    {checklist.risk && (
                        <span className="text-[10px] text-p-text/60 font-mono flex-shrink-0 ml-2">
                            {checklist.riskTime}
                        </span>
                    )}
                </div>

                <div 
                    onClick={toggleKit}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 border min-h-[48px] ${
                        checklist.kit 
                            ? 'bg-p-success/10 border-p-success/30' 
                            : 'bg-p-surface border-p-stone/70 hover:border-p-primary/20'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                            checklist.kit ? 'bg-p-success border-p-success' : 'border-p-stone bg-white'
                        }`}>
                            {checklist.kit && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-medium ${checklist.kit ? 'text-p-success' : 'text-p-primary'}`}>
                            {t({ de: 'Steriles Instrumentenset vorbereitet', en: 'Sterile instrument set prepared' })}
                        </span>
                    </div>
                    {checklist.kit && (
                        <span className="text-[10px] text-p-text/60 font-mono flex-shrink-0 ml-2">
                            {checklist.kitTime}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );

    const medicalFlagsCard = client.medicalFlags.length > 0 ? (
        <Card className="border border-p-warning/25 bg-p-warning/5 p-4 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-p-warning/15 text-p-warning">
                    <BellIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                </div>
                <h2 className="text-base sm:text-lg font-serif text-p-primary">
                    {t({ de: 'Medizinische Anamnese', en: 'Medical History' })}
                </h2>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {client.medicalFlags.map(flag => (
                    <span key={flag} className="px-3 py-1 bg-white text-p-warning border border-p-warning/20 text-xs sm:text-sm font-medium rounded-lg shadow-sm">
                        {flag}
                    </span>
                ))}
            </div>
        </Card>
    ) : null;

    const notesCard = (
        <Card className="space-y-5 sm:space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-p-stone/50 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-p-accent/15 text-p-primary">
                        <DocumentTextIcon className="w-5 h-5 text-p-accent" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-serif text-p-primary">
                            {t({ de: 'Interne Behandlungsnotizen', en: 'Internal Clinical Notes' })}
                        </h2>
                        <p className="text-xs text-p-text/60">
                            {t({ de: 'Befunde, Maßnahmen und Dokumentation', en: 'Findings, actions, and documentation' })}
                        </p>
                    </div>
                </div>
                {noteSavedFeedback && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-p-success/15 text-p-success border border-p-success/30 animate-fade-in">
                        <CheckIcon className="w-3.5 h-3.5" />
                        {t({ de: 'Gespeichert', en: 'Saved' })}
                    </span>
                )}
            </div>

            {/* Previous treatment summary */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-p-surface border border-p-stone/60 flex items-center justify-between text-xs">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block">
                        {t({ de: 'Letzte Behandlung', en: 'Last Treatment' })}
                    </span>
                    <span className="font-serif font-semibold text-p-primary text-xs sm:text-sm mt-0.5 block">{client.lastTreatment}</span>
                </div>
                <span className="text-[11px] text-p-text/60 bg-white px-2.5 py-1 rounded-md border border-p-stone/50">
                    {t({ de: 'Termin:', en: 'Appointment:' })} {client.appointmentTime}
                </span>
            </div>

            {/* Textarea Input Section */}
            <div className="space-y-3">
                <div className="space-y-1">
                    <label htmlFor="treatmentNote" className="text-xs font-bold uppercase tracking-widest text-p-text/60 flex items-center justify-between">
                        <span>{t({ de: 'Neue Behandlungsnotiz verfassen', en: 'Compose new clinical note' })}</span>
                        <span className="font-mono text-[10px] text-p-text/40">{treatmentNote.length} {t({ de: 'Zeichen', en: 'chars' })}</span>
                    </label>
                    <textarea
                        id="treatmentNote"
                        value={treatmentNote}
                        onChange={(e) => setTreatmentNote(e.target.value)}
                        onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveTreatmentNote();
                            }
                        }}
                        placeholder={t({ 
                            de: 'Notizen zur Behandlung eingeben (z.B. Hornhaut abgetragen, Nagelspange sitzt gut, Pflegebalsam aufgetragen...)', 
                            en: 'Enter treatment notes (e.g. callus removed, orthonyx brace seated well, care balm applied...)' 
                        })}
                        rows={3}
                        className="w-full p-3.5 text-base sm:text-sm bg-white border border-p-stone rounded-xl text-p-primary placeholder:text-p-text/40 focus:outline-none focus:ring-2 focus:ring-p-accent/50 focus:border-p-accent transition-all resize-y shadow-inner font-sans"
                    />
                </div>

                {/* Quick action text chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-p-text/50 uppercase tracking-wider mr-1">
                        {t({ de: 'Bausteine:', en: 'Templates:' })}
                    </span>
                    {quickPhrases.map((phrase) => (
                        <button
                            key={phrase}
                            type="button"
                            onClick={() => handleAddQuickPhrase(phrase)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-p-background border border-p-stone/70 hover:border-p-accent hover:bg-p-accent/10 text-p-text hover:text-p-primary transition-colors active:scale-95"
                        >
                            + {phrase}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-p-text/40 font-mono hidden sm:inline">
                        {t({ de: 'Shortcut:', en: 'Shortcut:' })} <kbd className="px-1.5 py-0.5 rounded bg-p-background border border-p-stone text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-p-background border border-p-stone text-[10px]">Enter</kbd>
                    </span>
                    <Button
                        variant="primary"
                        onClick={handleSaveTreatmentNote}
                        disabled={!treatmentNote.trim()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm disabled:opacity-40"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                        {t({ de: 'Notiz speichern', en: 'Save note' })}
                    </Button>
                </div>
            </div>

            {/* Chronological Notes History */}
            <div className="pt-5 border-t border-p-stone/50 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-p-text/60">
                    {t({ de: 'Gespeicherte Notizen', en: 'Saved Notes' })} ({client.notes.length})
                </h3>
                {client.notes.length === 0 ? (
                    <p className="text-xs text-p-text/50 italic py-2">
                        {t({ 
                            de: 'Noch keine Notizen vorhanden. Nutzen Sie das obige Textfeld zur Dokumentation.', 
                            en: 'No notes recorded yet. Use the text box above to document findings.' 
                        })}
                    </p>
                ) : (
                    <ul className="space-y-2.5">
                        {client.notes.map((note, i) => (
                            <li 
                                key={i} 
                                className="group flex items-start justify-between gap-3 p-3 rounded-xl bg-p-surface/70 border border-p-stone/40 hover:border-p-stone hover:bg-p-surface transition-all"
                            >
                                <div className="flex items-start gap-2.5 text-xs text-p-primary leading-relaxed min-w-0">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-p-accent flex-shrink-0" />
                                    <span className="break-words">{note}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteNote(i)}
                                    title={t({ de: 'Notiz entfernen', en: 'Delete note' })}
                                    className="p-1.5 text-p-text/40 hover:text-p-warning transition-opacity rounded hover:bg-p-warning/10 flex-shrink-0"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );

    const auditAndSignatureCard = (
        <div className="space-y-6">
            {/* Digital Consent & Signature Verification Card */}
            <Card className="p-4 sm:p-6 bg-white space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-p-success/15 text-p-success">
                            <CheckCircleIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-serif font-bold text-p-primary">
                                {t({ de: 'DSGVO-Einwilligung & Signatur', en: 'GDPR Consent & Signature' })}
                            </h4>
                            <p className="text-[10px] text-p-text/60">
                                {t({ de: 'Digital erfasst am Tablet-Kiosk', en: 'Digitally recorded at tablet kiosk' })}
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-p-success/10 text-p-success font-semibold border border-p-success/20">
                        {t({ de: 'Archiviert', en: 'Archived' })}
                    </span>
                </div>

                {client.signature ? (
                    <div className="bg-p-surface rounded-xl p-3 border border-p-stone/50 flex flex-col items-center justify-center">
                        <img 
                            src={client.signature} 
                            alt={t({ de: `Unterschrift von ${client.name}`, en: `Signature of ${client.name}` })} 
                            className="h-16 max-w-full object-contain filter contrast-125"
                        />
                        <div className="w-full pt-1.5 mt-1 border-t border-dashed border-p-stone flex items-center justify-between text-[10px] text-p-text/50 font-mono">
                            <span>{t({ de: 'Unterzeichner:', en: 'Signer:' })} {client.name}</span>
                            <span>{t({ de: 'Erfasst:', en: 'Recorded:' })} {client.signatureTimestamp || '08:59:04'}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-p-surface/60 rounded-xl p-3 border border-p-stone/40 text-center">
                        <p className="text-xs font-serif italic text-p-primary/70">
                            {client.name} {t({ de: '(Digital erfasst)', en: '(Digitally recorded)' })}
                        </p>
                        <div className="pt-1 mt-1 border-t border-p-stone/40 flex items-center justify-between text-[10px] text-p-text/50 font-mono">
                            <span>{t({ de: 'DSGVO Art. 7 & 9 bestätigt', en: 'GDPR Art. 7 & 9 confirmed' })}</span>
                            <span>08:59:04</span>
                        </div>
                    </div>
                )}
            </Card>

            {/* Audit Log Card */}
            <Card className="p-4 sm:p-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-p-text/50 flex items-center gap-2 border-b border-p-stone/50 pb-2">
                    <ClockIcon className="w-3.5 h-3.5"/> {t({ de: 'Audit-Protokoll (Heute)', en: 'Audit Log (Today)' })}
                </h3>
                <ul className="space-y-2 text-xs text-p-text/70 font-mono">
                    <li className="flex justify-between">
                        <span>{t({ de: 'Check-in (Tablet)', en: 'Check-in (Tablet)' })}</span>
                        <span>08:58:12</span>
                    </li>
                    <li className="flex justify-between">
                        <span>{t({ de: 'Einwilligung DSGVO', en: 'GDPR Consent' })}</span>
                        <span>08:59:04</span>
                    </li>
                    <li className="flex justify-between">
                        <span>{t({ de: 'Akte geöffnet (S. Weber)', en: 'Chart opened (S. Weber)' })}</span>
                        <span>09:02:30</span>
                    </li>
                    {checklist.risk && (
                        <li className="flex justify-between text-p-primary">
                            <span>{t({ de: 'Sicherheits-Check: Risiko', en: 'Safety Check: Risk' })}</span>
                            <span>{checklist.riskTime}</span>
                        </li>
                    )}
                    {checklist.kit && (
                        <li className="flex justify-between text-p-primary">
                            <span>{t({ de: 'Sicherheits-Check: Instrumente', en: 'Safety Check: Instruments' })}</span>
                            <span>{checklist.kitTime}</span>
                        </li>
                    )}
                    {treatmentStartTime && (
                        <li className="flex justify-between text-p-primary font-medium">
                            <span>{t({ de: 'Behandlung gestartet', en: 'Treatment started' })}</span>
                            <span>{treatmentStartTime}</span>
                        </li>
                    )}
                    {recentNoteAuditTime && (
                        <li className="flex justify-between text-p-primary font-medium">
                            <span>{t({ de: 'Notiz erfasst', en: 'Note recorded' })}</span>
                            <span>{recentNoteAuditTime}</span>
                        </li>
                    )}
                    {treatmentEndTime && (
                        <li className="flex justify-between text-p-success font-medium">
                            <span>{t({ de: 'Behandlung beendet', en: 'Treatment finished' })} ({formatTime(elapsedSeconds)})</span>
                            <span>{treatmentEndTime}</span>
                        </li>
                    )}
                </ul>
            </Card>

            {/* Treatment Documentation & Invoice Print Card */}
            <Card className="p-4 sm:p-6 space-y-3 bg-white border border-p-stone/70">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-p-accent/15 text-p-primary">
                            <PrinterIcon className="w-4 h-4 text-p-accent" />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-serif font-bold text-p-primary">
                                {t({ de: 'Rechnungsbeleg & Dokumentation', en: 'Invoice Receipt & Documentation' })}
                            </h4>
                            <p className="text-[10px] text-p-text/60">
                                {t({ de: 'Druck & PDF-Ausgabe gem. § 630f BGB & GoBD', en: 'Print & PDF export acc. to § 630f BGB & GoBD' })}
                            </p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-p-text/70 leading-relaxed font-light">
                    {t({ 
                        de: 'Erzeugt einen revisionssicheren Behandlungsbeleg inklusive dokumentierter Behandlungszeit, Sterilgutprüfung, klinischer Befunde und digitaler Patientensignatur für die physische Dokumentenakte oder Krankenkassen.', 
                        en: 'Generates an audit-proof treatment receipt including documented time, sterile supplies audit, clinical findings, and digital patient signature for paper archives or insurance.' 
                    })}
                </p>
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="primary"
                        onClick={() => setShowInvoicePreview(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider"
                    >
                        <PrinterIcon className="w-4 h-4 text-p-accent" />
                        <span>{t({ de: 'Beleg drucken / PDF', en: 'Print Receipt / PDF' })}</span>
                    </Button>
                    <button
                        onClick={handleDirectPrint}
                        className="px-4 py-2 rounded-xl border border-p-stone text-xs font-medium text-p-text hover:text-p-primary hover:bg-p-surface transition-all flex items-center justify-center gap-1.5 min-h-[40px] active:scale-95"
                        title={t({ de: 'Direktdruck via window.print()', en: 'Direct print via window.print()' })}
                    >
                        {t({ de: 'Direkt drucken', en: 'Direct Print' })}
                    </button>
                </div>
            </Card>
        </div>
    );

    const upsellCard = (
        <div className={`rounded-xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-500 ${upsellSold ? 'bg-p-success' : 'bg-p-primary'}`}>
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className={`p-2 rounded-lg ${upsellSold ? 'bg-white/20 text-white' : 'bg-p-accent/20 text-p-accent'}`}>
                    {upsellSold ? <CheckIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
                </div>
                <h2 className="text-base sm:text-lg font-serif tracking-wide text-white">
                    {upsellSold ? t({ de: 'Vorgemerkt', en: 'Reserved' }) : t({ de: 'Pflege-Empfehlung', en: 'Care Recommendation' })}
                </h2>
            </div>
            
            {!upsellSold ? (
                <>
                    <p className="text-white/70 text-xs sm:text-sm mb-4 font-light leading-relaxed">
                        {t({ de: 'Basierend auf der Anamnese & Präferenzen:', en: 'Based on medical history & preferences:' })}
                    </p>

                    <div className="space-y-4 relative z-10">
                        {client.suggestedUpsells.map(upsell => (
                            <div key={upsell.name} className="flex flex-col gap-3">
                                <div className="flex items-start gap-2 mb-0.5">
                                    <InformationCircleIcon className="w-4 h-4 text-p-accent mt-0.5 flex-shrink-0"/>
                                    <span className="text-xs text-p-accent font-medium uppercase tracking-wider">{upsell.reason}</span>
                                </div>
                                <div className="p-3.5 bg-white/10 border border-white/10 rounded-xl flex justify-between items-center backdrop-blur-sm">
                                    <div className="min-w-0 mr-2">
                                        <span className="font-medium text-white/90 block text-xs sm:text-sm truncate">{upsell.name}</span>
                                        <span className="text-[11px] text-white/50 capitalize">
                                            {upsell.category === 'product' ? t({ de: 'Produktverkauf', en: 'Product Sale' }) : t({ de: 'Zusatzleistung', en: 'Add-on Service' })}
                                        </span>
                                    </div>
                                    <span className="font-serif text-p-accent text-sm sm:text-base font-semibold">€{upsell.price.toFixed(2)}</span>
                                </div>
                                <button 
                                    onClick={() => setUpsellSold(true)}
                                    className="w-full py-3 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-white/15 min-h-[44px]"
                                >
                                    {t({ de: 'Hinzufügen (+ Umsatz)', en: 'Add to Bill (+ Revenue)' })}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-white/90 animate-fade-in relative z-10">
                    <p className="mb-4 text-xs sm:text-sm leading-relaxed">
                        {t({ de: 'Die Empfehlung wurde für den Kassen-Checkout vorgemerkt.', en: 'Recommendation reserved for checkout.' })}
                    </p>
                    <div className="p-3.5 bg-white/10 rounded-xl border border-white/20">
                        <div className="flex justify-between items-center text-sm">
                            <span>{t({ de: 'Position', en: 'Item' })}</span>
                            <span className="font-bold">€{client.suggestedUpsells[0]?.price.toFixed(2)}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setUpsellSold(false)} 
                        className="mt-4 text-xs text-white/60 hover:text-white underline p-1"
                    >
                        {t({ de: 'Empfehlung entfernen', en: 'Remove recommendation' })}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
        <div className="min-h-screen bg-p-background pb-28 md:pb-12 print:hidden">
            <AppHeader title={client.name} role={t({ de: 'Behandler/in: Sabine Weber', en: 'Practitioner: Sabine Weber' })} setView={setView} />
            <main className="max-w-7xl mx-auto p-3.5 sm:p-6 md:p-10 space-y-5 sm:space-y-6">
                
                {/* Header Back & Action Row */}
                <div className="flex items-center justify-between gap-3 border-b border-p-stone/60 pb-4">
                    <button 
                        onClick={() => setView('practitionerArrivals')} 
                        className="text-xs font-bold uppercase tracking-widest text-p-text/50 hover:text-p-primary transition-colors flex items-center gap-1.5 py-1"
                    >
                        <span>&larr;</span> {t({ de: 'Zurück zur Übersicht', en: 'Back to overview' })}
                    </button>

                    {/* Mobile Quick Print Button */}
                    <button
                        onClick={() => setShowInvoicePreview(true)}
                        className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-p-stone/80 bg-white text-xs font-semibold text-p-primary hover:bg-p-surface transition-all shadow-sm active:scale-95"
                        title={t({ de: 'Behandlungsbeleg drucken / PDF', en: 'Print receipt / PDF' })}
                    >
                        <PrinterIcon className="w-4 h-4 text-p-accent" />
                        <span>{t({ de: 'Beleg drucken', en: 'Print Receipt' })}</span>
                    </button>
                    
                    {/* Desktop Status Action Button & Print Trigger */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowInvoicePreview(true)}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                            title={t({ de: 'Rechnung & Behandlungsbeleg drucken (PDF)', en: 'Print receipt / invoice (PDF)' })}
                        >
                            <PrinterIcon className="w-4 h-4 text-p-accent" />
                            <span>{t({ de: 'Beleg / Rechnung drucken', en: 'Print Receipt / Invoice' })}</span>
                        </Button>

                        {status === 'waiting' && (
                            <div className="flex flex-col items-end gap-1.5">
                                <Button 
                                    variant="primary" 
                                    onClick={handleStartTreatment} 
                                    disabled={!isSafetyCheckComplete}
                                    className={`flex items-center gap-2 pl-6 pr-8 ${!isSafetyCheckComplete ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}`}
                                >
                                    {isSafetyCheckComplete ? <PlayIcon className="w-4 h-4 text-p-accent" /> : <LockClosedIcon className="w-4 h-4" />} 
                                    {t({ de: 'Behandlung starten', en: 'Start treatment' })}
                                </Button>
                                {!isSafetyCheckComplete && (
                                    <span className="text-[10px] uppercase tracking-widest text-p-warning font-bold">
                                        {t({ de: 'Sicherheits-Check erforderlich', en: 'Safety check required' })}
                                    </span>
                                )}
                            </div>
                        )}
                        {status === 'in-progress' && (
                            <Button variant="accent" onClick={handleFinishTreatment} className="flex items-center gap-2 pl-6 pr-8">
                                <CheckIcon className="w-4 h-4" /> {t({ de: 'Behandlung abschließen', en: 'Complete treatment' })}
                            </Button>
                        )}
                        {status === 'done' && (
                            <span className="px-4 py-2 bg-p-success/10 text-p-success rounded-full text-xs font-semibold border border-p-success/20">
                                {t({ de: 'Behandlung abgeschlossen', en: 'Treatment completed' })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Mobile Tabs Switcher (< lg) */}
                <div className="lg:hidden flex items-center p-1 bg-p-surface rounded-xl border border-p-stone/70 text-xs font-medium">
                    <button
                        onClick={() => setMobileTab('treatment')}
                        className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
                            mobileTab === 'treatment'
                                ? 'bg-white text-p-primary font-bold shadow-sm'
                                : 'text-p-text/70 hover:text-p-primary'
                        }`}
                    >
                        {t({ de: 'Behandlung & Timer', en: 'Treatment & Timer' })}
                    </button>
                    <button
                        onClick={() => setMobileTab('notes')}
                        className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
                            mobileTab === 'notes'
                                ? 'bg-white text-p-primary font-bold shadow-sm'
                                : 'text-p-text/70 hover:text-p-primary'
                        }`}
                    >
                        {t({ de: 'Notizen & Verlauf', en: 'Notes & History' })}
                    </button>
                    <button
                        onClick={() => setMobileTab('audit')}
                        className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
                            mobileTab === 'audit'
                                ? 'bg-white text-p-primary font-bold shadow-sm'
                                : 'text-p-text/70 hover:text-p-primary'
                        }`}
                    >
                        {t({ de: 'Audit & Signatur', en: 'Audit & Signature' })}
                    </button>
                </div>

                {/* Mobile Tab Content Views (< lg) */}
                <div className="block lg:hidden space-y-4">
                    {mobileTab === 'treatment' && (
                        <>
                            {stopwatchCard}
                            {safetyCheckCard}
                            {medicalFlagsCard}
                            {upsellCard}
                        </>
                    )}

                    {mobileTab === 'notes' && (
                        <>
                            {notesCard}
                            <TreatmentHistoryTimeline client={client} />
                        </>
                    )}

                    {mobileTab === 'audit' && (
                        <>
                            {auditAndSignatureCard}
                        </>
                    )}
                </div>

                {/* Desktop Multi-Column Grid (>= lg) */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {stopwatchCard}
                        {medicalFlagsCard}
                        {notesCard}
                        <TreatmentHistoryTimeline client={client} />
                        {auditAndSignatureCard}
                    </div>

                    <div className="space-y-6">
                        {safetyCheckCard}
                        {upsellCard}
                    </div>
                </div>
            </main>

            {/* Sticky Mobile Action Bar (pinned above bottom navigation dock on small screens) */}
            <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-p-stone/70 shadow-lg">
                <div className="max-w-md mx-auto">
                    {status === 'waiting' && (
                        <div>
                            {!isSafetyCheckComplete ? (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <span className="text-[10px] uppercase font-bold text-p-warning block">
                                            {t({ de: 'Sicherheit', en: 'Safety' })}
                                        </span>
                                        <span className="text-xs text-p-text font-medium truncate block">
                                            {t({ de: 'Checkliste ausstehend', en: 'Checklist pending' })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMobileTab('treatment');
                                            handleQuickCompleteSafetyCheck();
                                        }}
                                        className="px-4 py-2.5 bg-p-warning/15 hover:bg-p-warning/25 text-p-warning text-xs font-bold rounded-xl border border-p-warning/30 whitespace-nowrap active:scale-95 transition-all min-h-[44px]"
                                    >
                                        {t({ de: '✓ Checkliste abhaken', en: '✓ Complete Checklist' })}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleStartTreatment}
                                    className="w-full h-12 bg-p-primary text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
                                >
                                    <PlayIcon className="w-4 h-4 text-p-accent" />
                                    <span>{t({ de: 'Behandlung starten', en: 'Start treatment' })}</span>
                                </button>
                            )}
                        </div>
                    )}

                    {status === 'in-progress' && (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleToggleTimerPause}
                                    className="p-2.5 rounded-xl border border-p-stone bg-p-surface text-p-primary active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    title={isTimerRunning ? t({ de: 'Timer pausieren', en: 'Pause timer' }) : t({ de: 'Timer fortsetzen', en: 'Resume timer' })}
                                >
                                    {isTimerRunning ? <PauseIcon className="w-5 h-5 text-p-text" /> : <PlayIcon className="w-5 h-5 text-p-success" />}
                                </button>
                                <div>
                                    <span className="text-[9px] uppercase font-bold text-p-text/50 block">
                                        {t({ de: 'Timer', en: 'Timer' })}
                                    </span>
                                    <span className={`font-mono font-bold text-sm ${isOvertime ? 'text-p-warning' : 'text-p-primary'}`}>
                                        {formatTime(elapsedSeconds)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleFinishTreatment}
                                className="flex-1 h-12 bg-p-accent text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                            >
                                <CheckIcon className="w-4 h-4" />
                                <span>{t({ de: 'Behandlung abschließen', en: 'Complete treatment' })}</span>
                            </button>
                        </div>
                    )}

                    {status === 'done' && (
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <CheckCircleIcon className="w-5 h-5 text-p-success flex-shrink-0" />
                                <span className="text-xs font-semibold text-p-success truncate">
                                    {t({ de: 'Beendet', en: 'Finished' })} ({formatTime(elapsedSeconds)})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowInvoicePreview(true)}
                                    className="px-3 py-2 rounded-xl border border-p-stone bg-white text-p-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 min-h-[40px]"
                                    title={t({ de: 'Beleg drucken', en: 'Print Receipt' })}
                                >
                                    <PrinterIcon className="w-4 h-4 text-p-accent" />
                                    <span>{t({ de: 'Beleg', en: 'Receipt' })}</span>
                                </button>
                                <button
                                    onClick={() => setView('practitionerArrivals')}
                                    className="px-3.5 py-2 rounded-xl bg-p-primary text-white text-xs font-medium min-h-[40px] active:scale-95"
                                >
                                    {t({ de: 'Zurück', en: 'Back' })}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Dedicated Print-Only Document Component (Displayed strictly when window.print() is executed) */}
        <PrintableInvoiceSummary
            client={client}
            upsellSold={upsellSold}
            checklist={checklist}
            elapsedSeconds={elapsedSeconds}
            plannedMinutes={plannedMinutes}
            treatmentStartTime={treatmentStartTime}
            treatmentEndTime={treatmentEndTime}
        />

        {/* Interactive Screen Preview Modal with Print Trigger */}
        {showInvoicePreview && (
            <PrintableInvoiceSummary
                client={client}
                upsellSold={upsellSold}
                checklist={checklist}
                elapsedSeconds={elapsedSeconds}
                plannedMinutes={plannedMinutes}
                treatmentStartTime={treatmentStartTime}
                treatmentEndTime={treatmentEndTime}
                isModalPreview={true}
                onClosePreview={() => setShowInvoicePreview(false)}
            />
        )}

        {/* Floating Action Button (FAB) for Quick Notes & Immediate Upsell */}
        <PractitionerFAB
            currentClient={client}
            onUpdateClient={onUpdateClient}
            onNoteAdded={() => {
                setRecentNoteAuditTime(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
                setNoteSavedFeedback(true);
                setTimeout(() => setNoteSavedFeedback(false), 3000);
            }}
            className="bottom-32 right-4 sm:bottom-32 sm:right-6 lg:bottom-8 lg:right-8"
        />
        </>
    );
};

export default ClientDetailView;
