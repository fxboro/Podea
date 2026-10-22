import React, { useState, useMemo } from 'react';
import AppHeader from '../AppHeader';
import Card from '../../ui/Card';
import { View, Client } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { 
    BellIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    PlayIcon,
    BarsArrowDownIcon,
    ExclamationTriangleIcon,
    UserIcon,
    ShieldExclamationIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import PractitionerFAB from './PractitionerFAB';

export type SortOption = 'earliest' | 'name' | 'priority';

interface PractitionerArrivalsProps {
    setView: (view: View) => void;
    onSelectClient: (client: Client) => void;
    clients: Client[];
    onUpdateClient?: (client: Client) => void;
}

const PractitionerArrivals: React.FC<PractitionerArrivalsProps> = ({ setView, onSelectClient, clients, onUpdateClient }) => {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';

    // Current practitioner filter: Sabine Weber
    const practitionerClients = useMemo(() => {
        return clients.filter(c => c.practitioner === 'Sabine Weber');
    }, [clients]);

    const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'in-progress' | 'done'>('all');
    const [sortBy, setSortBy] = useState<SortOption>('earliest');
    const [searchQuery, setSearchQuery] = useState('');

    // Count of clients with active medical flags
    const priorityClientsCount = useMemo(() => {
        return practitionerClients.filter(c => c.medicalFlags && c.medicalFlags.length > 0).length;
    }, [practitionerClients]);

    // 1. Status and Search Filtering
    const filteredClients = useMemo(() => {
        return practitionerClients.filter(c => {
            // Status filter
            if (statusFilter !== 'all' && c.status !== statusFilter) {
                return false;
            }
            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const nameMatches = c.name.toLowerCase().includes(query);
                const flagMatches = c.medicalFlags.some(flag => flag.toLowerCase().includes(query));
                const treatmentMatches = c.lastTreatment.toLowerCase().includes(query);
                if (!nameMatches && !flagMatches && !treatmentMatches) {
                    return false;
                }
            }
            return true;
        });
    }, [practitionerClients, statusFilter, searchQuery]);

    // 2. Sorting based on toggle: 'Earliest Arrival', 'By Name', or 'Priority'
    const sortedClients = useMemo(() => {
        return [...filteredClients].sort((a, b) => {
            if (sortBy === 'earliest') {
                // Earliest Arrival: Chronological comparison of appointmentTime ("08:30" < "09:00" < "10:00")
                const timeComp = a.appointmentTime.localeCompare(b.appointmentTime);
                if (timeComp !== 0) return timeComp;
                return a.name.localeCompare(b.name, isEnglish ? 'en' : 'de', { sensitivity: 'base' });
            }

            if (sortBy === 'name') {
                // By Name: Alphabetical sorting
                return a.name.localeCompare(b.name, isEnglish ? 'en' : 'de', { sensitivity: 'base' });
            }

            if (sortBy === 'priority') {
                // Priority: Clients with active medical flags first!
                const aFlagsCount = a.medicalFlags?.length || 0;
                const bFlagsCount = b.medicalFlags?.length || 0;

                // Sort descending by number of active medical flags
                if (bFlagsCount !== aFlagsCount) {
                    return bFlagsCount - aFlagsCount;
                }

                // Secondary sort: earliest appointment time for equal flag count
                const timeComp = a.appointmentTime.localeCompare(b.appointmentTime);
                if (timeComp !== 0) return timeComp;

                return a.name.localeCompare(b.name, isEnglish ? 'en' : 'de', { sensitivity: 'base' });
            }

            return 0;
        });
    }, [filteredClients, sortBy, isEnglish]);

    const getStatusBadge = (status: Client['status']) => {
        switch (status) {
            case 'waiting':
                return {
                    label: t({ de: 'Wartend', en: 'Waiting' }),
                    bg: 'bg-blue-50 text-blue-700 border-blue-200',
                    dot: 'bg-blue-500'
                };
            case 'in-progress':
                return {
                    label: t({ de: 'In Behandlung', en: 'In Treatment' }),
                    bg: 'bg-p-accent/15 text-p-primary border-p-accent/30',
                    dot: 'bg-p-accent animate-pulse'
                };
            case 'done':
                return {
                    label: t({ de: 'Abgeschlossen', en: 'Completed' }),
                    bg: 'bg-p-success/15 text-p-success border-p-success/30',
                    dot: 'bg-p-success'
                };
            default:
                return {
                    label: status,
                    bg: 'bg-gray-100 text-gray-700 border-gray-200',
                    dot: 'bg-gray-400'
                };
        }
    };

    return (
        <div className="min-h-screen bg-p-background">
            <AppHeader 
                title={t({ de: 'Meine Ankünfte', en: 'My Arrivals' })} 
                role={t({ de: 'Behandler/in: Sabine Weber', en: 'Practitioner: Sabine Weber' })} 
                setView={setView} 
            />
            <main className="max-w-7xl mx-auto p-3.5 sm:p-6 md:p-10 space-y-5 sm:space-y-6">
                
                {/* Header Title & Summary Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-p-stone/60 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-serif text-p-primary">
                                {t({ de: 'Tages-Übersicht & Triage', en: 'Daily Overview & Triage' })}
                            </h2>
                            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-p-surface border border-p-stone text-p-primary">
                                {t({ 
                                    de: `${practitionerClients.length} Termine heute`, 
                                    en: `${practitionerClients.length} appointments today` 
                                })}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-p-text/60 mt-1">
                            {t({ 
                                de: `Zugewiesen an Sabine Weber • ${priorityClientsCount} Klient(en) mit aktiven medizinischen Risikoflaggen`, 
                                en: `Assigned to Sabine Weber • ${priorityClientsCount} client(s) with active medical risk flags` 
                            })}
                        </p>
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full md:w-72">
                        <MagnifyingGlassIcon className="w-4 h-4 text-p-text/40 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t({ de: 'Name oder med. Befund suchen...', en: 'Search name or medical flag...' })}
                            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white border border-p-stone/80 text-p-primary placeholder:text-p-text/40 focus:outline-none focus:ring-2 focus:ring-p-primary/20 focus:border-p-primary transition-all shadow-xs"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-p-text/40 hover:text-p-primary"
                                aria-label="Clear search"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Controls Area: Status Filter & Sorting Feature */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/60 p-3 sm:p-4 rounded-2xl border border-p-stone/60 backdrop-blur-xs">
                    
                    {/* Status Filter Segmented Control */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-p-text/60 uppercase tracking-wider mr-1 hidden sm:inline-block">
                            {t({ de: 'Status:', en: 'Status:' })}
                        </span>
                        <div className="flex items-center gap-1 p-1 bg-p-surface rounded-xl border border-p-stone/70 overflow-x-auto scrollbar-none max-w-full">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-white text-p-primary shadow-xs font-semibold'
                                        : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                {t({ de: 'Alle', en: 'All' })} ({practitionerClients.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('waiting')}
                                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                                    statusFilter === 'waiting'
                                        ? 'bg-white text-p-primary shadow-xs font-semibold'
                                        : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                {t({ de: 'Wartend', en: 'Waiting' })} ({practitionerClients.filter(c => c.status === 'waiting').length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('in-progress')}
                                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                                    statusFilter === 'in-progress'
                                        ? 'bg-white text-p-primary shadow-xs font-semibold'
                                        : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                {t({ de: 'Aktiv', en: 'Active' })} ({practitionerClients.filter(c => c.status === 'in-progress').length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('done')}
                                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                                    statusFilter === 'done'
                                        ? 'bg-white text-p-primary shadow-xs font-semibold'
                                        : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                {t({ de: 'Fertig', en: 'Done' })} ({practitionerClients.filter(c => c.status === 'done').length})
                            </button>
                        </div>
                    </div>

                    {/* Sorting Feature Toggle Group */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-p-text/60 uppercase tracking-wider mr-1 hidden sm:inline-block">
                            {t({ de: 'Sortierung:', en: 'Sort by:' })}
                        </span>
                        <div 
                            className="flex items-center gap-1 p-1 bg-p-surface rounded-xl border border-p-stone/70 overflow-x-auto scrollbar-none max-w-full"
                            role="group"
                            aria-label={t({ de: 'Klienten sortieren', en: 'Sort clients' })}
                        >
                            {/* Option 1: Earliest Arrival */}
                            <button
                                onClick={() => setSortBy('earliest')}
                                title={t({ de: 'Nach frühester Ankunftszeit / Uhrzeit sortieren', en: 'Sort by earliest arrival time' })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                                    sortBy === 'earliest'
                                        ? 'bg-white text-p-primary shadow-xs font-semibold'
                                        : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                <ClockIcon className="w-3.5 h-3.5 text-p-primary/70" />
                                <span>{t({ de: 'Früheste Ankunft', en: 'Earliest Arrival' })}</span>
                                <span className="hidden sm:inline text-[10px] text-p-text/50">({t({ de: 'Zeit', en: 'Time' })})</span>
                            </button>

                            {/* Option 2: By Name */}
                            <button
                                onClick={() => setSortBy('name')}
                                title={t({ de: 'Alphabetisch nach Kundenname sortieren', en: 'Sort alphabetically by name' })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                                    sortBy === 'name'
                                        ? 'bg-white text-p-primary shadow-xs font-semibold'
                                        : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                <BarsArrowDownIcon className="w-3.5 h-3.5 text-p-primary/70" />
                                <span>{t({ de: 'Nach Name', en: 'By Name' })}</span>
                                <span className="hidden sm:inline text-[10px] text-p-text/50">(A-Z)</span>
                            </button>

                            {/* Option 3: Priority (those with active medical flags) */}
                            <button
                                onClick={() => setSortBy('priority')}
                                title={t({ de: 'Klienten mit aktiven medizinischen Kontraindikationen und Risiken zuerst', en: 'Clients with active medical alerts first' })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                                    sortBy === 'priority'
                                        ? 'bg-p-warning/15 text-p-primary border border-p-warning/30 shadow-xs font-bold'
                                        : 'text-p-text/70 hover:text-p-primary'
                                }`}
                            >
                                <ExclamationTriangleIcon className={`w-3.5 h-3.5 ${sortBy === 'priority' ? 'text-p-warning fill-p-warning/20' : 'text-p-warning'}`} />
                                <span>{t({ de: 'Priorität', en: 'Priority' })}</span>
                                <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] bg-p-warning/20 text-p-warning font-bold">
                                    {priorityClientsCount}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Priority Triage Banner when 'Priority' sort is active */}
                {sortBy === 'priority' && (
                    <div className="flex items-center gap-3 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 shadow-xs animate-fadeIn">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                            <ExclamationTriangleIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-amber-950">
                                {t({ 
                                    de: `Prioritäts-Triage aktiv (${priorityClientsCount} Klienten mit Risikofaktoren)`, 
                                    en: `Priority Triage active (${priorityClientsCount} clients with risk factors)` 
                                })}
                            </p>
                            <p className="text-amber-800 text-[11px] mt-0.5">
                                {t({
                                    de: 'Klienten mit bestehenden medizinischen Kontraindikationen (z. B. Diabetes, Antikoagulation, Allergien) werden vorrangig gelistet für eine schnellere Behandlungsplanung.',
                                    en: 'Clients with clinical contraindications (e.g. diabetes, anticoagulation, neuropathy) are prioritized for safety-first treatment planning.'
                                })}
                            </p>
                        </div>
                        <button
                            onClick={() => setSortBy('earliest')}
                            className="text-[11px] text-amber-800 hover:text-amber-950 font-medium underline whitespace-nowrap self-start sm:self-center"
                        >
                            {t({ de: 'Zurück zu Uhrzeit', en: 'Reset to Time' })}
                        </button>
                    </div>
                )}

                {/* Client Grid */}
                {sortedClients.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-p-stone/60 p-6 space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-p-surface flex items-center justify-center text-p-text/40">
                            <FunnelIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-p-primary">
                            {t({ de: 'Keine Klienten gefunden', en: 'No clients found' })}
                        </h3>
                        <p className="text-xs text-p-text/60 max-w-sm mx-auto">
                            {searchQuery 
                                ? (isEnglish ? `No results for "${searchQuery}" with current filters.` : `Keine Ergebnisse für "${searchQuery}" mit den aktuellen Filtern.`) 
                                : t({ de: 'Keine Klienten mit diesem Status für heute vorhanden.', en: 'No clients with this status found for today.' })}
                        </p>
                        <div className="flex justify-center gap-2 pt-2">
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-p-surface border border-p-stone hover:bg-white text-p-primary transition-colors"
                                >
                                    {t({ de: 'Suche zurücksetzen', en: 'Clear search' })}
                                </button>
                            )}
                            {statusFilter !== 'all' && (
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-p-primary text-white hover:bg-p-primary/90 transition-colors"
                                >
                                    {t({ de: 'Alle Status anzeigen', en: 'Show all statuses' })}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                        {sortedClients.map((client, index) => {
                            const badge = getStatusBadge(client.status);
                            const hasFlags = client.medicalFlags && client.medicalFlags.length > 0;
                            const isHighPriority = sortBy === 'priority' && hasFlags;

                            return (
                                <Card 
                                    key={client.id} 
                                    onClick={() => onSelectClient(client)} 
                                    className={`relative group p-4 sm:p-6 active:scale-[0.98] transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                                        isHighPriority 
                                            ? 'border-amber-300 ring-2 ring-amber-400/20 bg-gradient-to-b from-amber-50/30 to-white shadow-sm' 
                                            : 'border-p-stone/60 hover:border-p-stone hover:shadow-md'
                                    }`}
                                >
                                    <div>
                                        {/* Top row: Time badge & Status */}
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-p-background border border-p-stone/70 text-p-primary flex items-center gap-1">
                                                    <ClockIcon className="w-3.5 h-3.5 text-p-text/60" />
                                                    {client.appointmentTime} {isEnglish ? '' : 'Uhr'}
                                                </span>

                                                {/* In Priority sorting mode, show ranking indicator */}
                                                {sortBy === 'priority' && hasFlags && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                                                        <ExclamationTriangleIcon className="w-3 h-3" />
                                                        {t({ de: 'Prio', en: 'Priority' })} #{index + 1}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                                {badge.label}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl sm:text-2xl font-serif text-p-primary group-hover:text-p-accent transition-colors mb-2">
                                            {client.name}
                                        </h3>
                                        
                                        <div className="space-y-2.5 mb-4">
                                            <p className="text-xs sm:text-sm text-p-text border-l-2 border-p-stone pl-3 line-clamp-2">
                                                {client.lastTreatment}
                                            </p>
                                            
                                            {hasFlags ? (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-p-warning bg-p-warning/10 p-2.5 rounded-lg border border-p-warning/25">
                                                        <BellIcon className="w-4 h-4 flex-shrink-0 text-p-warning animate-bounce"/>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="text-xs font-bold text-amber-900">
                                                                    {client.medicalFlags.length} {t({ 
                                                                        de: `med. Hinweis${client.medicalFlags.length > 1 ? 'e' : ''}`, 
                                                                        en: `medical alert${client.medicalFlags.length > 1 ? 's' : ''}` 
                                                                    })}
                                                                </span>
                                                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-p-warning/20 text-p-warning">
                                                                    {t({ de: 'Triage-relevant', en: 'Triage Alert' })}
                                                                </span>
                                                            </div>
                                                            <div className="text-[11px] text-amber-800/90 truncate mt-0.5">
                                                                {client.medicalFlags.join(' • ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-p-text/40 text-xs px-2 py-1.5 bg-p-surface/60 rounded-lg">
                                                    <ShieldExclamationIcon className="w-3.5 h-3.5 opacity-60" />
                                                    <span className="text-[11px]">{t({ de: 'Keine Kontraindikationen vermerkt', en: 'No contraindications recorded' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer: Action affordance */}
                                    <div className="pt-3 border-t border-p-stone/50 flex items-center justify-between text-xs text-p-primary font-medium group-hover:text-p-accent transition-colors">
                                        <span className="flex items-center gap-1.5">
                                            {client.status === 'waiting' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                                            {client.status === 'in-progress' && <span className="w-2 h-2 rounded-full bg-p-accent animate-ping" />}
                                            {client.status === 'done' && <CheckCircleIcon className="w-3.5 h-3.5 text-p-success" />}
                                            {client.status === 'waiting' 
                                                ? t({ de: 'Behandlung vorbereiten', en: 'Prepare treatment' }) 
                                                : client.status === 'in-progress' 
                                                ? t({ de: 'Aktiv dokumentieren', en: 'Active documentation' }) 
                                                : t({ de: 'Details & Beleg', en: 'Details & Invoice' })}
                                        </span>
                                        <span className="text-p-text/40 group-hover:translate-x-1 transition-transform font-bold">&rarr;</span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Floating Action Button (FAB) for Quick Notes & Immediate Upsell */}
            <PractitionerFAB
                availableClients={practitionerClients}
                onUpdateClient={onUpdateClient || (() => {})}
                className="bottom-20 right-4 sm:bottom-24 sm:right-6 md:bottom-8 md:right-8"
            />
        </div>
    );
};

export default PractitionerArrivals;
