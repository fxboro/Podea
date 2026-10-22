import React, { useState, useEffect } from 'react';
import { Client } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    SparklesIcon, 
    XMarkIcon, 
    CheckIcon, 
    ShoppingBagIcon, 
    UserIcon, 
    CheckCircleIcon,
    TagIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export interface UpsellCatalogItem {
    id: string;
    name: string;
    price: number;
    category: 'product' | 'service';
    defaultReason: {
        de: string;
        en: string;
    };
    description: {
        de: string;
        en: string;
    };
}

const UPSELL_CATALOG: UpsellCatalogItem[] = [
    {
        id: 'u-1',
        name: 'Diabetiker-Spezialcreme',
        price: 18.50,
        category: 'product',
        defaultReason: {
            de: 'Hautschutzbarriere & Feuchtigkeit bei Diabetes Typ 1/2',
            en: 'Skin barrier protection & deep moisture for Diabetes Typ 1/2'
        },
        description: {
            de: 'Urea 10% Spezialbalsam zur Rissprävention',
            en: '10% Urea intensive balm for fissure prevention'
        }
    },
    {
        id: 'u-2',
        name: 'Silikon-Druckschutzring',
        price: 9.90,
        category: 'product',
        defaultReason: {
            de: 'Entlastung bei Druckstellen, Clavus & Hammerzehen',
            en: 'Pressure relief for corns, clavus & hammer toes'
        },
        description: {
            de: 'Medizinisches Soft-Silikon, abwaschbar & wiederverwendbar',
            en: 'Medical soft silicone, washable & reusable'
        }
    },
    {
        id: 'u-3',
        name: 'Nagelöl-Pflegestift',
        price: 14.50,
        category: 'product',
        defaultReason: {
            de: 'Nagelfalzpflege & Tiefenschutz gegen Brüchigkeit',
            en: 'Nail fold care & deep protection against brittleness'
        },
        description: {
            de: 'Mit Teebaumöl, Vitamin E und Jojoba',
            en: 'Formulated with tea tree oil, vitamin E and jojoba'
        }
    },
    {
        id: 'u-4',
        name: 'Fußcreme „Vital“ Kräuter',
        price: 16.00,
        category: 'product',
        defaultReason: {
            de: 'Regeneration beanspruchter Füße & Hornhautreduktion',
            en: 'Regeneration for fatigued feet & callus reduction'
        },
        description: {
            de: 'Natürliche Kräuterextrakte für tägliche Heimpflege',
            en: 'Natural herbal extracts for daily home care'
        }
    },
    {
        id: 'u-5',
        name: 'Feuchtigkeitspackung Intensiv',
        price: 15.00,
        category: 'service',
        defaultReason: {
            de: 'Tiefenwirksame Feuchtigkeitsmaske nach der Behandlung',
            en: 'Deep nourishing moisture mask following treatment'
        },
        description: {
            de: '10 Min. wärmende Einwirkphase mit Wirkstoffkomplex',
            en: '10-minute warm infusion with active ingredient complex'
        }
    },
    {
        id: 'u-6',
        name: 'Hand- & Fußmassage (10 Min)',
        price: 12.00,
        category: 'service',
        defaultReason: {
            de: 'Durchblutungsförderung & Linderung von Spannungen',
            en: 'Stimulates circulation & alleviates tension'
        },
        description: {
            de: 'Sanfte Massage entlang der Reflexzonen',
            en: 'Gentle massage along foot reflex zones'
        }
    },
    {
        id: 'u-7',
        name: 'Schützende Nagellack-Versiegelung',
        price: 10.00,
        category: 'service',
        defaultReason: {
            de: 'Keratinschutz & optische Veredelung',
            en: 'Keratin protection & polished cosmetic finish'
        },
        description: {
            de: 'Atmungsaktiver Lack mit pflegendem Schutzfilm',
            en: 'Breathable polish with protective conditioning film'
        }
    }
];

interface PractitionerFABProps {
    currentClient?: Client | null;
    availableClients?: Client[];
    onUpdateClient: (updatedClient: Client) => void;
    onNoteAdded?: (note: string) => void;
    onUpsellAssigned?: (upsellName: string, price: number) => void;
    className?: string;
}

export const PractitionerFAB: React.FC<PractitionerFABProps> = ({
    currentClient,
    availableClients = [],
    onUpdateClient,
    onNoteAdded,
    onUpsellAssigned,
    className = 'bottom-24 right-4 sm:bottom-28 sm:right-6 lg:bottom-8 lg:right-8'
}) => {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';

    // Speed Dial open/closed state
    const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
    
    // Active modal dialog: 'note' | 'upsell' | null
    const [activeModal, setActiveModal] = useState<'note' | 'upsell' | null>(null);

    // Selected client state for modals
    const clientsList = currentClient 
        ? [currentClient, ...availableClients.filter(c => c.id !== currentClient.id)]
        : availableClients;

    const [selectedClientId, setSelectedClientId] = useState<number>(
        currentClient?.id || (clientsList.length > 0 ? clientsList[0].id : 0)
    );

    useEffect(() => {
        if (currentClient) {
            setSelectedClientId(currentClient.id);
        } else if (clientsList.length > 0 && !selectedClientId) {
            setSelectedClientId(clientsList[0].id);
        }
    }, [currentClient, clientsList]);

    const activeTargetClient = clientsList.find(c => c.id === selectedClientId) || currentClient || clientsList[0];

    // Quick Note Form State
    const [noteContent, setNoteContent] = useState('');
    const [noteCategory, setNoteCategory] = useState<'finding' | 'measure' | 'instruction'>('finding');

    // Upsell Form State
    const [selectedUpsellId, setSelectedUpsellId] = useState<string>(UPSELL_CATALOG[0].id);
    const [customReason, setCustomReason] = useState<string>('');
    const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
    const [customName, setCustomName] = useState<string>('');
    const [customPrice, setCustomPrice] = useState<string>('15.00');
    const [customCategory, setCustomCategory] = useState<'product' | 'service'>('product');

    // Toast feedback state
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Quick Phrases for Notes
    const quickPhrases = [
        t({ de: 'Hornhaut abgetragen', en: 'Callus removed' }),
        t({ de: 'Nagelfalz gereinigt & desinfiziert', en: 'Nail fold cleansed & disinfected' }),
        t({ de: 'Wundkontrolle unauffällig', en: 'Wound check unremarkable' }),
        t({ de: 'Pflegebalsam appliziert', en: 'Care balm applied' }),
        t({ de: 'Druckentlastung angepasst', en: 'Pressure relief fitted' }),
        t({ de: 'Patient schmerzfrei', en: 'Patient pain-free' }),
        t({ de: 'Wiedervorstellung in 4 Wochen', en: 'Follow-up in 4 weeks' })
    ];

    const handleAddQuickPhrase = (phrase: string) => {
        setNoteContent(prev => prev ? `${prev}, ${phrase}` : phrase);
    };

    // Save Note Handler
    const handleSaveNote = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!noteContent.trim() || !activeTargetClient) return;

        const timeNow = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const categoryLabel = noteCategory === 'finding' 
            ? t({ de: 'Befund', en: 'Finding' })
            : noteCategory === 'measure'
            ? t({ de: 'Maßnahme', en: 'Action' })
            : t({ de: 'Hinweis', en: 'Notice' });

        const formattedNote = `[${timeNow} - ${categoryLabel}] ${noteContent.trim()}`;
        const updatedNotes = [formattedNote, ...(activeTargetClient.notes || [])];

        const updatedClient: Client = {
            ...activeTargetClient,
            notes: updatedNotes
        };

        onUpdateClient(updatedClient);
        if (onNoteAdded) onNoteAdded(formattedNote);

        triggerToast(t({
            de: `Notiz für ${activeTargetClient.name} erfolgreich erfasst.`,
            en: `Note for ${activeTargetClient.name} saved successfully.`
        }));

        setNoteContent('');
        setActiveModal(null);
        setIsSpeedDialOpen(false);
    };

    // Assign Upsell Handler
    const handleAssignUpsell = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!activeTargetClient) return;

        let upsellToAdd: { name: string; price: number; reason: string; category: 'product' | 'service' };

        if (isCustomMode) {
            if (!customName.trim()) return;
            const parsedPrice = parseFloat(customPrice.replace(',', '.')) || 0;
            upsellToAdd = {
                name: customName.trim(),
                price: parsedPrice,
                reason: customReason.trim() || t({ de: 'Individuelle Empfehlung der Behandlerin', en: 'Custom practitioner recommendation' }),
                category: customCategory
            };
        } else {
            const catalogItem = UPSELL_CATALOG.find(u => u.id === selectedUpsellId) || UPSELL_CATALOG[0];
            upsellToAdd = {
                name: catalogItem.name,
                price: catalogItem.price,
                reason: customReason.trim() || catalogItem.defaultReason[language],
                category: catalogItem.category
            };
        }

        const existingUpsells = activeTargetClient.suggestedUpsells || [];
        const alreadyExists = existingUpsells.some(u => u.name.toLowerCase() === upsellToAdd.name.toLowerCase());
        const updatedUpsells = alreadyExists 
            ? existingUpsells.map(u => u.name.toLowerCase() === upsellToAdd.name.toLowerCase() ? upsellToAdd : u)
            : [upsellToAdd, ...existingUpsells];

        // Audit Trail entry in client notes
        const timeNow = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const auditEntry = `[${timeNow} - ${t({ de: 'Empfehlung', en: 'Recommendation' })}] ${upsellToAdd.name} (€ ${upsellToAdd.price.toFixed(2)}) ${t({ de: 'für Kassen-Checkout zugewiesen', en: 'assigned for checkout' })}`;
        const updatedNotes = [auditEntry, ...(activeTargetClient.notes || [])];

        const updatedClient: Client = {
            ...activeTargetClient,
            suggestedUpsells: updatedUpsells,
            notes: updatedNotes
        };

        onUpdateClient(updatedClient);
        if (onUpsellAssigned) onUpsellAssigned(upsellToAdd.name, upsellToAdd.price);

        triggerToast(t({
            de: `„${upsellToAdd.name}“ für ${activeTargetClient.name} zugewiesen.`,
            en: `"${upsellToAdd.name}" assigned to ${activeTargetClient.name}.`
        }));

        setCustomReason('');
        setCustomName('');
        setIsCustomMode(false);
        setActiveModal(null);
        setIsSpeedDialOpen(false);
    };

    return (
        <>
            {/* Backdrop for Speed Dial Menu */}
            <AnimatePresence>
                {isSpeedDialOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSpeedDialOpen(false)}
                        className="fixed inset-0 bg-p-primary/20 backdrop-blur-xs z-40 transition-opacity"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Floating Action Button & Speed Dial Container */}
            <div className={`fixed z-40 flex flex-col items-end gap-3 ${className}`}>
                
                {/* Speed Dial Action Items */}
                <AnimatePresence>
                    {isSpeedDialOpen && (
                        <div className="flex flex-col items-end gap-3 mb-1 select-none">
                            
                            {/* Option 1: Quick Note Entry */}
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: 0.05 }}
                                className="flex items-center gap-2.5"
                            >
                                <span className="bg-white/95 text-p-primary text-xs font-semibold px-3 py-1.5 rounded-xl border border-p-stone shadow-md backdrop-blur-sm whitespace-nowrap">
                                    {t({ de: 'Schnellnotiz erfassen', en: 'Quick Clinical Note' })}
                                </span>
                                <button
                                    onClick={() => {
                                        setIsSpeedDialOpen(false);
                                        setActiveModal('note');
                                    }}
                                    className="w-12 h-12 rounded-2xl bg-white border border-p-stone/80 text-p-primary hover:text-p-accent shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-p-accent/40"
                                    title={t({ de: 'Neue Notiz verfassen', en: 'Write new note' })}
                                >
                                    <PencilSquareIcon className="w-5 h-5 text-p-primary group-hover:text-p-accent transition-colors" />
                                </button>
                            </motion.div>

                            {/* Option 2: Immediate Upsell Assignment */}
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2.5"
                            >
                                <span className="bg-white/95 text-p-primary text-xs font-semibold px-3 py-1.5 rounded-xl border border-p-stone shadow-md backdrop-blur-sm whitespace-nowrap">
                                    {t({ de: 'Upsell-Empfehlung zuweisen', en: 'Assign Upsell' })}
                                </span>
                                <button
                                    onClick={() => {
                                        setIsSpeedDialOpen(false);
                                        setActiveModal('upsell');
                                    }}
                                    className="w-12 h-12 rounded-2xl bg-p-primary text-p-accent hover:bg-p-primary/90 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-p-accent/40"
                                    title={t({ de: 'Empfehlung oder Produkt zuweisen', en: 'Assign product or add-on recommendation' })}
                                >
                                    <SparklesIcon className="w-5 h-5 text-p-accent group-hover:rotate-12 transition-transform" />
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Primary Floating Action Trigger Button */}
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-p-accent/30 ${
                        isSpeedDialOpen 
                            ? 'bg-p-primary text-white rotate-45 border border-white/20' 
                            : 'bg-p-accent text-p-primary hover:bg-p-accent/90 border border-p-accent/40 hover:shadow-2xl'
                    }`}
                    aria-label={t({ de: 'Schnellaktionen für Behandler', en: 'Practitioner quick actions' })}
                    title={t({ de: 'Schnellaktionen (Notiz / Upsell)', en: 'Quick Actions (Note / Upsell)' })}
                >
                    {isSpeedDialOpen ? (
                        <PlusIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                    ) : (
                        <div className="relative flex items-center justify-center">
                            <PlusIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                            <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute -top-1 -right-1 text-p-primary animate-pulse" />
                        </div>
                    )}
                </motion.button>
            </div>

            {/* Instant Confirmation Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-28 left-4 right-4 sm:left-auto sm:right-28 z-50 sm:max-w-md pointer-events-none"
                    >
                        <div className="bg-p-primary text-white p-3.5 rounded-2xl shadow-2xl border border-p-accent/40 flex items-center gap-3">
                            <div className="p-1.5 rounded-xl bg-p-success/20 text-p-success flex-shrink-0">
                                <CheckCircleIcon className="w-5 h-5 text-p-success" />
                            </div>
                            <p className="text-xs font-medium text-white flex-1">{toastMessage}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL 1: QUICK NOTE ENTRY DIALOG */}
            <AnimatePresence>
                {activeModal === 'note' && activeTargetClient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal(null)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white rounded-3xl shadow-2xl border border-p-stone w-full max-w-lg p-5 sm:p-6 relative z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-p-stone/60 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-p-accent/15 text-p-primary">
                                        <PencilSquareIcon className="w-5 h-5 text-p-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-serif font-bold text-p-primary">
                                            {t({ de: 'Schnelle Behandlungsnotiz', en: 'Quick Clinical Note' })}
                                        </h3>
                                        <p className="text-[11px] text-p-text/60">
                                            {t({ de: 'Dokumentation gem. § 630f BGB', en: 'Clinical record acc. to § 630f BGB' })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="p-1.5 text-p-text/40 hover:text-p-primary rounded-xl hover:bg-p-surface transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveNote} className="space-y-4 pt-4">
                                
                                {/* Target Client Selector */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block mb-1.5">
                                        {t({ de: 'Patient/in auswählen', en: 'Target Client' })}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedClientId}
                                            onChange={(e) => setSelectedClientId(Number(e.target.value))}
                                            className="w-full bg-p-background border border-p-stone rounded-xl px-3.5 py-2.5 text-xs text-p-primary font-medium focus:outline-none focus:border-p-accent"
                                        >
                                            {clientsList.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({c.appointmentTime} Uhr · {c.lastTreatment})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Patient quick badge strip */}
                                    <div className="flex items-center gap-2 mt-2 text-[11px] text-p-text/70 bg-p-surface/80 p-2 rounded-xl border border-p-stone/50">
                                        <UserIcon className="w-3.5 h-3.5 text-p-accent flex-shrink-0" />
                                        <span className="font-semibold text-p-primary">{activeTargetClient.name}</span>
                                        <span aria-hidden="true">·</span>
                                        <span className="font-mono tabular-nums">{activeTargetClient.appointmentTime} Uhr</span>
                                        {activeTargetClient.medicalFlags?.length > 0 && (
                                            <>
                                                <span aria-hidden="true">·</span>
                                                <span className="text-p-warning font-semibold truncate">
                                                    ⚠️ {activeTargetClient.medicalFlags[0]}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Category Selector */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block mb-1.5">
                                        {t({ de: 'Kategorie', en: 'Category' })}
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-p-background rounded-xl border border-p-stone text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setNoteCategory('finding')}
                                            className={`py-1.5 rounded-lg font-medium transition-all ${
                                                noteCategory === 'finding'
                                                    ? 'bg-white text-p-primary shadow-xs font-semibold'
                                                    : 'text-p-text/70 hover:text-p-primary'
                                            }`}
                                        >
                                            {t({ de: 'Befund', en: 'Finding' })}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNoteCategory('measure')}
                                            className={`py-1.5 rounded-lg font-medium transition-all ${
                                                noteCategory === 'measure'
                                                    ? 'bg-white text-p-primary shadow-xs font-semibold'
                                                    : 'text-p-text/70 hover:text-p-primary'
                                            }`}
                                        >
                                            {t({ de: 'Maßnahme', en: 'Action' })}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNoteCategory('instruction')}
                                            className={`py-1.5 rounded-lg font-medium transition-all ${
                                                noteCategory === 'instruction'
                                                    ? 'bg-white text-p-primary shadow-xs font-semibold'
                                                    : 'text-p-text/70 hover:text-p-primary'
                                            }`}
                                        >
                                            {t({ de: 'Hinweis', en: 'Notice' })}
                                        </button>
                                    </div>
                                </div>

                                {/* Text Input */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 flex justify-between">
                                        <span>{t({ de: 'Notiztext', en: 'Note Text' })}</span>
                                        <span className="font-mono text-p-text/40">{noteContent.length} {t({ de: 'Zeichen', en: 'chars' })}</span>
                                    </label>
                                    <textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        rows={3}
                                        placeholder={t({
                                            de: 'z.B. Hornhaut abgetragen, Nagelspange sitzt einwandfrei, keine Entzündung...',
                                            en: 'e.g. Callus debrided, orthonyx brace fits well, no signs of inflammation...'
                                        })}
                                        className="w-full p-3 bg-white border border-p-stone rounded-xl text-xs sm:text-sm text-p-primary placeholder:text-p-text/40 focus:outline-none focus:border-p-accent focus:ring-1 focus:ring-p-accent/20 resize-none"
                                        autoFocus
                                    />
                                </div>

                                {/* Quick Phrases Chips */}
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block mb-1.5">
                                        {t({ de: 'Textbausteine (1-Klick):', en: 'Quick Templates (1-Click):' })}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {quickPhrases.map((phrase, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleAddQuickPhrase(phrase)}
                                                className="px-2.5 py-1 text-[11px] rounded-lg bg-p-background border border-p-stone hover:border-p-accent hover:bg-p-accent/10 text-p-primary transition-all active:scale-95"
                                            >
                                                + {phrase}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-p-stone/50">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModal(null)}
                                        className="px-4 py-2.5 rounded-xl border border-p-stone text-xs font-semibold text-p-text hover:text-p-primary hover:bg-p-surface transition-colors"
                                    >
                                        {t({ de: 'Abbrechen', en: 'Cancel' })}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!noteContent.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-p-primary text-white hover:bg-p-primary/90 text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
                                    >
                                        <CheckIcon className="w-4 h-4 text-p-accent" />
                                        <span>{t({ de: 'Notiz speichern', en: 'Save Note' })}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 2: IMMEDIATE UPSELL ASSIGNMENT DIALOG */}
            <AnimatePresence>
                {activeModal === 'upsell' && activeTargetClient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal(null)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white rounded-3xl shadow-2xl border border-p-stone w-full max-w-lg p-5 sm:p-6 relative z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-p-stone/60 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-p-primary text-p-accent">
                                        <SparklesIcon className="w-5 h-5 text-p-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-serif font-bold text-p-primary">
                                            {t({ de: 'Pflege-Empfehlung sofort zuweisen', en: 'Assign Upsell Recommendation' })}
                                        </h3>
                                        <p className="text-[11px] text-p-text/60">
                                            {t({ de: 'Wird sofort für Kassen-Checkout & Akte vorgemerkt', en: 'Directly reserved for POS checkout & clinical record' })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="p-1.5 text-p-text/40 hover:text-p-primary rounded-xl hover:bg-p-surface transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAssignUpsell} className="space-y-4 pt-4">
                                
                                {/* Target Client Selector */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block mb-1.5">
                                        {t({ de: 'Empfänger-Patient/in', en: 'Target Client' })}
                                    </label>
                                    <select
                                        value={selectedClientId}
                                        onChange={(e) => setSelectedClientId(Number(e.target.value))}
                                        className="w-full bg-p-background border border-p-stone rounded-xl px-3.5 py-2.5 text-xs text-p-primary font-medium focus:outline-none focus:border-p-accent"
                                    >
                                        {clientsList.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.appointmentTime} Uhr)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mode Switch: Standard Catalog vs. Custom Item */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-p-text/50">
                                        {t({ de: 'Artikel & Empfehlungsauswahl', en: 'Item & Recommendation Selection' })}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomMode(!isCustomMode)}
                                        className="text-xs text-p-accent font-semibold hover:underline"
                                    >
                                        {isCustomMode 
                                            ? t({ de: '← Aus Katalog wählen', en: '← Choose from catalog' }) 
                                            : t({ de: '+ Eigener Artikel', en: '+ Custom item' })}
                                    </button>
                                </div>

                                {!isCustomMode ? (
                                    /* Catalog Selection */
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {UPSELL_CATALOG.map((item) => {
                                            const isSelected = selectedUpsellId === item.id;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => {
                                                        setSelectedUpsellId(item.id);
                                                        setCustomReason('');
                                                    }}
                                                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                        isSelected 
                                                            ? 'border-p-accent bg-p-accent/10 shadow-xs ring-1 ring-p-accent/30' 
                                                            : 'border-p-stone/70 bg-p-surface/60 hover:bg-white hover:border-p-stone'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-xs text-p-primary truncate">{item.name}</span>
                                                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-p-background text-p-text/60 border border-p-stone">
                                                                {item.category === 'product' ? t({ de: 'Produkt', en: 'Product' }) : t({ de: 'Leistung', en: 'Service' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-p-text/60 truncate mt-0.5">
                                                            {item.description[language]}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <span className="font-serif font-bold text-sm text-p-primary block font-mono tabular-nums">
                                                            € {item.price.toFixed(2)}
                                                        </span>
                                                        {isSelected && (
                                                            <span className="text-[10px] text-p-accent font-bold inline-flex items-center gap-0.5">
                                                                <CheckIcon className="w-3 h-3" /> {t({ de: 'Gewählt', en: 'Selected' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Custom Item Input */
                                    <div className="space-y-3 bg-p-surface/70 p-3.5 rounded-2xl border border-p-stone/80">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block mb-1">
                                                {t({ de: 'Artikelbezeichnung', en: 'Item Name' })}
                                            </label>
                                            <input
                                                type="text"
                                                value={customName}
                                                onChange={(e) => setCustomName(e.target.value)}
                                                placeholder={t({ de: 'z.B. Orthonyxie Nagelkorrekturspange', en: 'e.g. Orthonyx Brace Fitting' })}
                                                className="w-full bg-white border border-p-stone rounded-xl px-3 py-2 text-xs text-p-primary font-medium focus:outline-none focus:border-p-accent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block mb-1">
                                                    {t({ de: 'Preis (€)', en: 'Price (€)' })}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customPrice}
                                                    onChange={(e) => setCustomPrice(e.target.value)}
                                                    className="w-full bg-white border border-p-stone rounded-xl px-3 py-2 text-xs text-p-primary font-mono tabular-nums font-semibold focus:outline-none focus:border-p-accent"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block mb-1">
                                                    {t({ de: 'Typ', en: 'Type' })}
                                                </label>
                                                <select
                                                    value={customCategory}
                                                    onChange={(e) => setCustomCategory(e.target.value as 'product' | 'service')}
                                                    className="w-full bg-white border border-p-stone rounded-xl px-3 py-2 text-xs text-p-primary font-medium focus:outline-none focus:border-p-accent"
                                                >
                                                    <option value="product">{t({ de: 'Produkt (Kauf)', en: 'Product (Retail)' })}</option>
                                                    <option value="service">{t({ de: 'Zusatzleistung', en: 'Add-on Service' })}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Indication / Clinical Reason */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-p-text/50 block">
                                        {t({ de: 'Klinische Indikation / Empfehlungsgrund', en: 'Clinical Reason / Indication' })}
                                    </label>
                                    <input
                                        type="text"
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        placeholder={!isCustomMode 
                                            ? UPSELL_CATALOG.find(u => u.id === selectedUpsellId)?.defaultReason[language] 
                                            : t({ de: 'z.B. Zur Entlastung der Digitus IV Druckstelle', en: 'e.g. To relieve pressure on 4th toe' })
                                        }
                                        className="w-full bg-white border border-p-stone rounded-xl px-3 py-2 text-xs text-p-primary placeholder:text-p-text/40 focus:outline-none focus:border-p-accent"
                                    />
                                    <span className="text-[10px] text-p-text/50 italic block">
                                        {t({ 
                                            de: 'Wird auf der Quittung und in den Behandlungsbefunden vermerkt.', 
                                            en: 'Will appear on the invoice summary and clinical findings.' 
                                        })}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-p-stone/50">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModal(null)}
                                        className="px-4 py-2.5 rounded-xl border border-p-stone text-xs font-semibold text-p-text hover:text-p-primary hover:bg-p-surface transition-colors"
                                    >
                                        {t({ de: 'Abbrechen', en: 'Cancel' })}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl bg-p-accent text-p-primary hover:bg-p-accent/90 text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                                    >
                                        <SparklesIcon className="w-4 h-4 text-p-primary" />
                                        <span>{t({ de: 'Empfehlung zuweisen', en: 'Assign Upsell' })}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PractitionerFAB;
