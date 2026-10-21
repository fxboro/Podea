import React, { useState, useEffect, useRef } from 'react';
import Card from '../../ui/Card';
import AppHeader from '../AppHeader';
import { View, Client } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ArrowUpIcon, 
    BellIcon, 
    BanknotesIcon as CashIcon, 
    Cog6ToothIcon as CogIcon,
    ChartBarIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    XMarkIcon,
    ShieldCheckIcon,
    DocumentChartBarIcon,
    UserGroupIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ClockIcon,
    CalendarDaysIcon,
    ReceiptPercentIcon,
    ExclamationTriangleIcon,
    ChevronRightIcon,
    QueueListIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ComplianceReportModal } from './compliance/ComplianceReportModal';
import { AdminUserManagement } from './AdminUserManagement';
import { 
    BarChart, 
    Bar, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';

export interface CheckinNotification {
    id: string;
    clientId: number;
    clientName: string;
    appointmentTime: string;
    practitioner: string;
    timestamp: string;
    treatment?: string;
    hasConsent: boolean;
    unread: boolean;
}

interface RecentInvoice {
    id: string;
    clientName: string;
    time: string;
    service: string;
    upsellItem?: string;
    amount: number;
    paymentMethod: 'EC-Karte' | 'Bar' | 'Rechnung';
    status: 'paid' | 'pending';
}

interface PractitionerDuty {
    name: string;
    role: string;
    scheduledCount: number;
    completedCount: number;
    upsellRate: number;
    room: string;
    status: 'active' | 'in-session' | 'break';
}

const getDailyRevenueData = (lang: string) => [
  { day: lang === 'en' ? 'Mon, 09' : 'Mo, 09.', baseRevenue: 520, upsellRevenue: 135, clients: 12 },
  { day: lang === 'en' ? 'Tue, 10' : 'Di, 10.', baseRevenue: 610, upsellRevenue: 180, clients: 14 },
  { day: lang === 'en' ? 'Wed, 11' : 'Mi, 11.', baseRevenue: 480, upsellRevenue: 115, clients: 10 },
  { day: lang === 'en' ? 'Thu, 12' : 'Do, 12.', baseRevenue: 740, upsellRevenue: 245, clients: 16 },
  { day: lang === 'en' ? 'Fri, 13' : 'Fr, 13.', baseRevenue: 860, upsellRevenue: 310, clients: 18 },
  { day: lang === 'en' ? 'Sat, 14' : 'Sa, 14.', baseRevenue: 980, upsellRevenue: 390, clients: 20 },
  { day: lang === 'en' ? 'Today' : 'Heute', baseRevenue: 650, upsellRevenue: 195, clients: 13 },
];

const mockIntradayData = [
  { time: '08:00', revenue: 120 },
  { time: '10:00', revenue: 350 },
  { time: '12:00', revenue: 450 },
  { time: '14:00', revenue: 600 },
  { time: '16:00', revenue: 845 },
];

const CustomBarTooltip = ({ active, payload, label, isEnglish }: any) => {
    if (active && payload && payload.length) {
        const base = payload.find((p: any) => p.dataKey === 'baseRevenue')?.value || 0;
        const upsell = payload.find((p: any) => p.dataKey === 'upsellRevenue')?.value || 0;
        const total = base + upsell;
        const upsellShare = total > 0 ? Math.round((upsell / total) * 100) : 0;

        return (
            <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-p-stone shadow-lg text-xs font-sans min-w-[210px]">
                <p className="font-serif font-semibold text-sm text-p-primary mb-2 border-b border-p-stone/60 pb-1.5 flex items-center justify-between">
                    <span>{label}</span>
                    <span className="text-[10px] font-sans font-normal uppercase tracking-wider text-p-text/60">
                        {isEnglish ? 'Daily Summary' : 'Tagesübersicht'}
                    </span>
                </p>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-p-text">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#1F2A37] inline-block" />
                            {isEnglish ? 'Treatment:' : 'Behandlung:'}
                        </span>
                        <span className="font-semibold text-p-primary font-mono tabular-nums">€ {base.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-p-text">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#C7A75D] inline-block" />
                            {isEnglish ? 'Add-on (Upsell):' : 'Zusatzverkauf (Upsell):'}
                        </span>
                        <span className="font-semibold text-p-accent font-mono tabular-nums">€ {upsell.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 mt-1.5 border-t border-p-stone/50 flex items-center justify-between">
                        <span className="font-semibold text-p-primary">{isEnglish ? 'Total Revenue:' : 'Gesamtumsatz:'}</span>
                        <span className="font-bold text-p-primary text-sm font-mono tabular-nums">€ {total.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 bg-p-background/80 rounded px-2 py-1 flex items-center justify-between text-[11px] text-p-success font-medium">
                        <span className="flex items-center gap-1">
                            <SparklesIcon className="w-3.5 h-3.5" />
                            {isEnglish ? 'Upsell Share:' : 'Upsell-Anteil:'}
                        </span>
                        <span className="font-bold font-mono tabular-nums">+{upsellShare}%</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const StatCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    trend?: string; 
    trendPositive?: boolean;
    subtitle?: string;
    onClick?: () => void;
}> = ({ title, value, icon, trend, trendPositive = true, subtitle, onClick }) => {
    const cardContent = (
        <Card className={`flex items-center justify-between gap-3 p-4 sm:p-5 h-full transition-all ${
            onClick ? 'cursor-pointer hover:border-p-accent/60 hover:shadow-md active:scale-[0.99]' : ''
        }`}>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="p-2.5 sm:p-3 rounded-xl bg-p-background border border-p-stone/60 text-p-primary flex-shrink-0">
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-p-text/60 mb-0.5 truncate font-medium">
                        {title}
                    </p>
                    <p className="text-xl sm:text-2xl font-serif font-bold text-p-primary truncate font-mono tabular-nums">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-[11px] text-p-text/50 truncate mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-semibold flex-shrink-0 border ${
                    trendPositive 
                        ? 'bg-p-success/10 text-p-success border-p-success/20' 
                        : 'bg-p-warning/10 text-p-warning border-p-warning/20'
                }`}>
                    <ArrowTrendingUpIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="font-mono tabular-nums">{trend}</span>
                </div>
            )}
        </Card>
    );

    return onClick ? <div onClick={onClick} className="h-full">{cardContent}</div> : cardContent;
};

const AdminDashboard: React.FC<{ 
    setView: (view: View) => void; 
    clients: Client[]; 
    onSelectClient?: (client: Client) => void; 
}> = ({ setView, clients, onSelectClient }) => {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';
    const todayArrivals = clients;
    const dailyRevenueData = getDailyRevenueData(language);
    
    // Visualization Controls
    const [chartMode, setChartMode] = useState<'bar' | 'area'>('bar');
    const [barLayout, setBarLayout] = useState<'stacked' | 'grouped'>('stacked');
    
    // Operational Data Hub Controls
    const [activeTab, setActiveTab] = useState<'appointments' | 'invoices' | 'team'>('appointments');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'in-progress' | 'done'>('all');

    // Modals
    const [isComplianceReportOpen, setIsComplianceReportOpen] = useState(false);
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

    // Real-time Notifications State
    const [notifications, setNotifications] = useState<CheckinNotification[]>([
        {
            id: 'notif-1',
            clientId: 1,
            clientName: 'Anna Schmidt',
            appointmentTime: '09:00',
            practitioner: 'Sabine Weber',
            treatment: 'Medizinische Fußpflege',
            timestamp: '08:58',
            hasConsent: true,
            unread: true,
        }
    ]);
    const [activeToast, setActiveToast] = useState<CheckinNotification | null>(null);
    const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
    const prevClientsRef = useRef<Client[]>(clients);

    // Mock Recent Invoices for Secondary Data Table
    const recentInvoices: RecentInvoice[] = [
        {
            id: 'INV-2026-084',
            clientName: 'Anna Schmidt',
            time: '09:42',
            service: isEnglish ? 'Medical Foot Care' : 'Medizinische Fußpflege',
            upsellItem: isEnglish ? 'Intensive Foot Balm' : 'Fußbalsam Intensiv',
            amount: 64.00,
            paymentMethod: 'EC-Karte',
            status: 'paid'
        },
        {
            id: 'INV-2026-083',
            clientName: 'Dr. Michael Lang',
            time: '08:55',
            service: isEnglish ? 'Diabetic Foot Care' : 'Diabetiker-Behandlung',
            upsellItem: isEnglish ? 'Silicone Pressure Guard' : 'Druckschutz-Silikon',
            amount: 72.50,
            paymentMethod: 'Bar',
            status: 'paid'
        },
        {
            id: 'INV-2026-082',
            clientName: 'Sarah Hoffmann',
            time: '08:30',
            service: isEnglish ? 'Classic Manicure' : 'Klassische Maniküre',
            amount: 35.00,
            paymentMethod: 'EC-Karte',
            status: 'paid'
        },
        {
            id: 'INV-2026-081',
            clientName: 'Maximilian Berg',
            time: '08:10',
            service: isEnglish ? 'Nail Brace Therapy' : 'Nagelkorrekturspange',
            upsellItem: isEnglish ? 'Antiseptic Solution' : 'Antiseptische Lösung',
            amount: 88.00,
            paymentMethod: 'Rechnung',
            status: 'pending'
        }
    ];

    // Mock Practitioner Team Status
    const teamDuties: PractitionerDuty[] = [
        {
            name: 'Sabine Weber',
            role: isEnglish ? 'Lead Podiatrist' : 'Leitende Podologin',
            scheduledCount: 4,
            completedCount: 2,
            upsellRate: 38,
            room: isEnglish ? 'Treatment Room 1' : 'Behandlungsraum 1',
            status: 'in-session'
        },
        {
            name: 'Klaus Fischer',
            role: isEnglish ? 'State-certified Podiatrist' : 'Staatl. anerk. Podologe',
            scheduledCount: 3,
            completedCount: 1,
            upsellRate: 25,
            room: isEnglish ? 'Treatment Room 2' : 'Behandlungsraum 2',
            status: 'active'
        }
    ];

    // Watch for newly checked-in clients from Tablet
    useEffect(() => {
        const prev = prevClientsRef.current;
        if (clients.length > prev.length) {
            const newClient = clients[clients.length - 1];
            const newNotif: CheckinNotification = {
                id: `notif-${Date.now()}`,
                clientId: newClient.id,
                clientName: newClient.name,
                appointmentTime: newClient.appointmentTime,
                practitioner: newClient.practitioner,
                treatment: newClient.lastTreatment || (isEnglish ? 'Initial Visit' : 'Erstbesuch'),
                timestamp: new Date().toLocaleTimeString(isEnglish ? 'en-US' : 'de-DE', { hour: '2-digit', minute: '2-digit' }),
                hasConsent: !!newClient.consentGiven || !!newClient.signature,
                unread: true,
            };
            setNotifications(prevNotifs => [newNotif, ...prevNotifs]);
            setActiveToast(newNotif);
        } else {
            for (const curr of clients) {
                const old = prev.find(p => p.id === curr.id);
                if (old && (curr.signature && !old.signature)) {
                    const notif: CheckinNotification = {
                        id: `notif-${Date.now()}`,
                        clientId: curr.id,
                        clientName: curr.name,
                        appointmentTime: curr.appointmentTime,
                        practitioner: curr.practitioner,
                        treatment: curr.lastTreatment,
                        timestamp: curr.signatureTimestamp || new Date().toLocaleTimeString(isEnglish ? 'en-US' : 'de-DE', { hour: '2-digit', minute: '2-digit' }),
                        hasConsent: true,
                        unread: true,
                    };
                    setNotifications(prevNotifs => [notif, ...prevNotifs]);
                    setActiveToast(notif);
                    break;
                }
            }
        }
        prevClientsRef.current = clients;
    }, [clients, isEnglish]);

    // Auto-dismiss toast
    useEffect(() => {
        if (activeToast) {
            const timer = setTimeout(() => {
                setActiveToast(null);
            }, 6500);
            return () => clearTimeout(timer);
        }
    }, [activeToast]);

    const handleSimulateCheckin = () => {
        const sampleCheckins = [
            { name: 'Maximilian Berg', treatment: 'Medizinische Fußpflege', practitioner: 'Sabine Weber' },
            { name: 'Elena Vogt', treatment: 'Wellness-Pediküre', practitioner: 'Sabine Weber' },
            { name: 'Dr. Michael Lang', treatment: 'Diabetiker-Behandlung', practitioner: 'Klaus Fischer' },
            { name: 'Sarah Hoffmann', treatment: 'Klassische Maniküre', practitioner: 'Klaus Fischer' }
        ];
        const sample = sampleCheckins[Math.floor(Math.random() * sampleCheckins.length)];
        const timeNow = new Date().toLocaleTimeString(isEnglish ? 'en-US' : 'de-DE', { hour: '2-digit', minute: '2-digit' });

        const simNotif: CheckinNotification = {
            id: `notif-${Date.now()}`,
            clientId: Date.now(),
            clientName: sample.name,
            appointmentTime: timeNow,
            practitioner: sample.practitioner,
            treatment: sample.treatment,
            timestamp: timeNow,
            hasConsent: true,
            unread: true,
        };

        setNotifications(prevNotifs => [simNotif, ...prevNotifs]);
        setActiveToast(simNotif);
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    // Revenue Aggregation
    const totalWeeklyBase = dailyRevenueData.reduce((acc, curr) => acc + curr.baseRevenue, 0);
    const totalWeeklyUpsell = dailyRevenueData.reduce((acc, curr) => acc + curr.upsellRevenue, 0);
    const totalWeeklyRevenue = totalWeeklyBase + totalWeeklyUpsell;
    const avgUpsellPercent = Math.round((totalWeeklyUpsell / totalWeeklyRevenue) * 100);

    // Filter appointments
    const filteredAppointments = todayArrivals.filter(c => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                c.name.toLowerCase().includes(q) ||
                (c.practitioner && c.practitioner.toLowerCase().includes(q)) ||
                (c.lastTreatment && c.lastTreatment.toLowerCase().includes(q))
            );
        }
        return true;
    });

    const waitingCount = todayArrivals.filter(c => c.status === 'waiting').length;
    const inProgressCount = todayArrivals.filter(c => c.status === 'in-progress').length;
    const completedCount = todayArrivals.filter(c => c.status === 'done').length;

    const NotificationBell = (
        <div className="relative">
            <button
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                className="relative p-2 rounded-xl border border-p-stone/70 bg-white/80 hover:bg-white text-p-text hover:text-p-primary transition-all shadow-xs flex items-center justify-center min-w-[38px] min-h-[38px]"
                title={t({ de: 'Tablet Check-in Benachrichtigungen', en: 'Tablet Check-in Notifications' })}
            >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-p-warning opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-p-warning text-[10px] font-bold text-white items-center justify-center font-mono">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Notification Dropdown Menu */}
            {isNotifMenuOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsNotifMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-p-stone p-4 z-50 animate-fade-in text-left">
                        <div className="flex items-center justify-between pb-3 border-b border-p-stone/60">
                            <div className="flex items-center gap-2">
                                <span className="font-serif font-bold text-p-primary text-sm">
                                    {t({ de: 'Tablet Check-ins', en: 'Tablet Check-ins' })}
                                </span>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-p-accent/15 text-p-primary border border-p-accent/30 font-mono">
                                        {unreadCount} {t({ de: 'Neu', en: 'New' })}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                                    className="text-[11px] text-p-text/60 hover:text-p-primary underline font-medium"
                                >
                                    {t({ de: 'Als gelesen markieren', en: 'Mark as read' })}
                                </button>
                            )}
                        </div>

                        <div className="divide-y divide-p-stone/40 max-h-80 overflow-y-auto mt-1">
                            {notifications.length === 0 ? (
                                <p className="text-xs text-p-text/50 py-6 text-center">
                                    {t({ de: 'Keine neuen Meldungen vorhanden', en: 'No new notifications available' })}
                                </p>
                            ) : (
                                notifications.map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => {
                                            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
                                        }}
                                        className={`py-3 px-2 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                                            item.unread ? 'bg-p-background/60 hover:bg-p-background' : 'hover:bg-p-surface'
                                        }`}
                                    >
                                        <div className="p-2 rounded-xl bg-p-success/15 text-p-success flex-shrink-0 mt-0.5">
                                            <DevicePhoneMobileIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-p-primary truncate">{item.clientName}</span>
                                                <span className="text-[10px] font-mono text-p-text/50 tabular-nums">{item.timestamp}</span>
                                            </div>
                                            <p className="text-p-text/70 text-[11px] mt-0.5">
                                                {item.treatment} • {item.practitioner}
                                            </p>
                                            {item.hasConsent && (
                                                <span className="inline-flex items-center gap-1 text-[10px] text-p-success font-medium mt-1">
                                                    <CheckCircleIcon className="w-3 h-3" /> {t({ de: 'DSGVO bestätigt', en: 'GDPR verified' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const HeaderAction = (
        <div className="flex items-center gap-2">
            <button
                onClick={() => setIsUserManagementOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-p-stone/70 bg-white/80 hover:bg-white text-p-text hover:text-p-primary transition-all shadow-xs text-xs font-semibold"
                title={t({ de: 'Mitarbeiter- & Rollenverwaltung via Supabase Auth', en: 'Staff & Role Management via Supabase Auth' })}
            >
                <UserGroupIcon className="w-4 h-4 text-p-accent" />
                <span className="hidden md:inline">{t({ de: 'Team & Rollen', en: 'Team & Roles' })}</span>
            </button>
            <button
                onClick={() => setIsComplianceReportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-p-stone/70 bg-white/80 hover:bg-white text-p-text hover:text-p-primary transition-all shadow-xs text-xs font-semibold"
                title={t({ de: 'Compliance-Bericht mit D3.js Charts generieren', en: 'Generate Compliance Report with D3.js charts' })}
            >
                <ShieldCheckIcon className="w-4 h-4 text-p-accent" />
                <span className="hidden sm:inline">{t({ de: 'Compliance-Bericht', en: 'Compliance Report' })}</span>
            </button>
            {NotificationBell}
        </div>
    );

    return (
        <div className="min-h-screen bg-p-background">
            <AppHeader 
                title={t({ de: 'Dashboard', en: 'Dashboard' })} 
                role={t({ de: 'Studio Admin', en: 'Studio Admin' })} 
                setView={setView} 
                rightAction={HeaderAction}
            />

            {/* Real-time Tablet Check-in Toast Alert */}
            <AnimatePresence>
                {activeToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed top-16 sm:top-20 left-3 right-3 sm:left-auto sm:right-8 z-50 sm:max-w-sm"
                    >
                        <div className="bg-white/95 backdrop-blur-md border border-p-accent/40 shadow-2xl rounded-2xl p-3.5 sm:p-4 ring-1 ring-black/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-p-accent via-p-success to-p-accent" />

                            <div className="flex items-start gap-3 sm:gap-3.5 pt-0.5">
                                <div className="relative flex-shrink-0 mt-0.5">
                                    <div className="p-2 sm:p-2.5 rounded-xl bg-p-success/15 text-p-success border border-p-success/20">
                                        <DevicePhoneMobileIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-p-success opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-p-success"></span>
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-p-accent">
                                            {t({ de: 'Live: Tablet Check-in', en: 'Live: Tablet Check-in' })}
                                        </span>
                                        <span className="text-[10px] font-mono text-p-text/50 tabular-nums">{activeToast.timestamp}</span>
                                    </div>
                                    <h4 className="font-serif font-bold text-p-primary text-sm sm:text-base truncate mt-0.5">
                                        {activeToast.clientName}
                                    </h4>
                                    <p className="text-xs text-p-text/80 mt-0.5 truncate">
                                        {activeToast.treatment} {t({ de: 'bei', en: 'with' })} {activeToast.practitioner}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-p-success bg-p-success/10 px-2 py-0.5 rounded-full border border-p-success/20">
                                            <CheckCircleIcon className="w-3 h-3" />
                                            {t({ de: 'DSGVO signiert', en: 'GDPR signed' })}
                                        </span>
                                        <span className="text-[10px] text-p-text/60">
                                            {t({ de: 'Wartet im Empfangsbereich', en: 'Waiting in reception area' })}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveToast(null)}
                                    className="p-1 text-p-text/40 hover:text-p-primary rounded-lg hover:bg-p-background transition-colors flex-shrink-0"
                                    title={t({ de: 'Schließen', en: 'Close' })}
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flexible Responsive Layout Container */}
            <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
                
                {/* 1. Flexible KPI Metrics Grid (1 col on mobile -> 2 on tablet -> 4 on desktop) */}
                <section aria-label="Key Performance Indicators">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
                        <StatCard 
                            title={t({ de: 'Umsatz (Heute)', en: 'Revenue (Today)' })} 
                            value="€ 845,00" 
                            subtitle={t({ de: '13 Behandlungen abgeschlossen', en: '13 treatments completed' })}
                            icon={<CashIcon className="w-5 h-5 sm:w-6 sm:h-6 text-p-primary"/>}
                            trend="+14%" 
                            trendPositive={true}
                        />
                        <StatCard 
                            title={t({ de: 'Upsell-Erfolgsrate', en: 'Upsell Rate' })} 
                            value={`${avgUpsellPercent}%`} 
                            subtitle={t({ de: 'Ø +€ 15,00 Mehrertrag', en: 'Avg. +€ 15.00 extra revenue' })}
                            icon={<ArrowUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-p-accent"/>}
                            trend="+8%" 
                            trendPositive={true}
                        />
                        <StatCard 
                            title={t({ de: 'Heutige Termine', en: 'Today’s Appointments' })} 
                            value={`${todayArrivals.length}`} 
                            subtitle={`${waitingCount} ${t({ de: 'wartend', en: 'waiting' })} · ${inProgressCount} ${t({ de: 'in Behandlung', en: 'in treatment' })}`}
                            icon={<CalendarDaysIcon className="w-5 h-5 sm:w-6 sm:h-6 text-p-primary"/>}
                            trend={t({ de: 'Plan voll', en: 'Full' })}
                            trendPositive={true}
                        />
                        <StatCard 
                            title={t({ de: 'Compliance & Hygiene', en: 'Compliance & Safety' })} 
                            value="100%" 
                            subtitle={t({ de: '2 Prüfungen offen · D3 Bericht', en: '2 checks open · D3 report' })}
                            icon={<ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-p-accent"/>} 
                            trend={t({ de: 'Audit-Bereit', en: 'Audit-Ready' })}
                            trendPositive={true}
                            onClick={() => setIsComplianceReportOpen(true)}
                        />
                    </div>
                </section>

                {/* 2. Flexible Revenue & AI Insights Hub */}
                <section aria-label="Revenue & Performance Analytics">
                    <Card className="w-full space-y-5 sm:space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-p-stone/60 pb-5">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-lg sm:text-xl font-serif text-p-primary">
                                        {chartMode === 'bar' 
                                            ? t({ de: 'Tagesumsatz & Upsell-Performance', en: 'Daily Revenue & Upsell Performance' })
                                            : t({ de: 'Umsatzverlauf (Heute)', en: 'Revenue Trend (Today)' })}
                                    </h2>
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-p-accent/15 text-p-primary border border-p-accent/30">
                                        <SparklesIcon className="w-3 h-3 text-p-accent" />
                                        {t({ de: 'KI-Insights', en: 'AI Insights' })}
                                    </span>
                                </div>
                                <p className="text-xs text-p-text/70">
                                    {chartMode === 'bar' 
                                        ? t({ de: 'Täglicher Vergleich von Behandlungserlösen und Zusatzverkäufen (letzte 7 Tage)', en: 'Daily comparison of treatment revenue and add-on sales (last 7 days)' })
                                        : t({ de: 'Stündliche Umsatzentwicklung des aktuellen Praxistages', en: 'Hourly revenue progress of today\'s schedule' })}
                                </p>
                            </div>

                            {/* Chart Controls & Mode Switcher */}
                            <div className="flex flex-wrap items-center gap-2">
                                {chartMode === 'bar' && (
                                    <div className="flex items-center bg-p-background p-1 rounded-xl border border-p-stone text-xs">
                                        <button 
                                            onClick={() => setBarLayout('stacked')}
                                            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                                barLayout === 'stacked' 
                                                    ? 'bg-white text-p-primary shadow-xs font-semibold' 
                                                    : 'text-p-text hover:text-p-primary'
                                            }`}
                                        >
                                            {t({ de: 'Gestapelt', en: 'Stacked' })}
                                        </button>
                                        <button 
                                            onClick={() => setBarLayout('grouped')}
                                            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                                barLayout === 'grouped' 
                                                    ? 'bg-white text-p-primary shadow-xs font-semibold' 
                                                    : 'text-p-text hover:text-p-primary'
                                            }`}
                                        >
                                            {t({ de: 'Nebeneinander', en: 'Grouped' })}
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center bg-p-background p-1 rounded-xl border border-p-stone text-xs">
                                    <button 
                                        onClick={() => setChartMode('bar')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                                            chartMode === 'bar' 
                                                ? 'bg-p-primary text-white shadow-xs font-semibold' 
                                                : 'text-p-text hover:text-p-primary'
                                        }`}
                                    >
                                        <ChartBarIcon className="w-3.5 h-3.5" />
                                        <span>{t({ de: 'Tages-Balken', en: 'Daily Bars' })}</span>
                                    </button>
                                    <button 
                                        onClick={() => setChartMode('area')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                                            chartMode === 'area' 
                                                ? 'bg-p-primary text-white shadow-xs font-semibold' 
                                                : 'text-p-text hover:text-p-primary'
                                        }`}
                                    >
                                        <span>{t({ de: 'Stunden-Kurve', en: 'Hourly Curve' })}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chart Container */}
                        <div className="h-60 sm:h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartMode === 'bar' ? (
                                    <BarChart 
                                        data={dailyRevenueData} 
                                        margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
                                        barGap={4}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" opacity={0.7} />
                                        <XAxis 
                                            dataKey="day" 
                                            stroke="#78716C" 
                                            fontSize={11} 
                                            tickLine={false} 
                                            axisLine={{ stroke: '#E7E5E4' }} 
                                        />
                                        <YAxis 
                                            stroke="#78716C" 
                                            fontSize={11} 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickFormatter={(value) => `€${value}`} 
                                            width={42}
                                        />
                                        <Tooltip content={<CustomBarTooltip isEnglish={isEnglish} />} />
                                        <Legend 
                                            verticalAlign="top" 
                                            align="right"
                                            wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                                            formatter={(value) => (
                                                <span className="text-p-text font-medium ml-1">
                                                    {value === 'baseRevenue' 
                                                        ? t({ de: 'Basis-Behandlung', en: 'Base Treatment' }) 
                                                        : t({ de: 'Zusatzverkäufe & Upsells', en: 'Add-on Sales & Upsells' })}
                                                </span>
                                            )}
                                        />
                                        <Bar 
                                            dataKey="baseRevenue" 
                                            name="baseRevenue"
                                            fill="#1F2A37" 
                                            stackId={barLayout === 'stacked' ? 'revenue' : undefined}
                                            radius={barLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                                            maxBarSize={44}
                                        />
                                        <Bar 
                                            dataKey="upsellRevenue" 
                                            name="upsellRevenue"
                                            fill="#C7A75D" 
                                            stackId={barLayout === 'stacked' ? 'revenue' : undefined}
                                            radius={[4, 4, 0, 0]} 
                                            maxBarSize={44}
                                        />
                                    </BarChart>
                                ) : (
                                    <AreaChart data={mockIntradayData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#C7A75D" stopOpacity={0.35}/>
                                                <stop offset="95%" stopColor="#C7A75D" stopOpacity={0.02}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="time" stroke="#78716C" fontSize={11} tickLine={false} axisLine={{ stroke: '#E7E5E4' }} />
                                        <YAxis stroke="#78716C" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} width={42} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" opacity={0.7} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E7E5E4', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
                                            itemStyle={{ color: '#1F2A37', fontWeight: 600 }}
                                            formatter={(value: number) => [`€${value},00`, isEnglish ? 'Revenue' : 'Umsatz']}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#C7A75D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>

                        {/* Upsell Impact Breakdown Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-4 border-t border-p-stone/60">
                            <div className="bg-p-background/80 rounded-xl p-3 border border-p-stone/50">
                                <span className="text-[11px] font-semibold text-p-text/60 uppercase tracking-wider block">
                                    {t({ de: '7-Tage Gesamtumsatz', en: '7-Day Total Revenue' })}
                                </span>
                                <span className="text-base sm:text-lg font-serif font-bold text-p-primary mt-0.5 block font-mono tabular-nums">
                                    € {totalWeeklyRevenue.toLocaleString(isEnglish ? 'en-US' : 'de-DE', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="bg-p-accent/10 rounded-xl p-3 border border-p-accent/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-p-primary uppercase tracking-wider block">
                                        {t({ de: 'Durch KI-Upsell', en: 'Via AI Upsell' })}
                                    </span>
                                    <span className="text-[10px] font-bold text-p-accent bg-white/90 px-1.5 py-0.5 rounded font-mono tabular-nums">+{avgUpsellPercent}%</span>
                                </div>
                                <span className="text-base sm:text-lg font-serif font-bold text-p-accent mt-0.5 block font-mono tabular-nums">
                                    +€ {totalWeeklyUpsell.toLocaleString(isEnglish ? 'en-US' : 'de-DE', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="bg-p-success/10 rounded-xl p-3 border border-p-success/30">
                                <span className="text-[11px] font-semibold text-p-success uppercase tracking-wider block">
                                    {t({ de: 'Ø Mehrertrag pro Kunde', en: 'Avg. Added Revenue / Client' })}
                                </span>
                                <span className="text-base sm:text-lg font-serif font-bold text-p-success mt-0.5 block font-mono tabular-nums">
                                    +€ {(totalWeeklyUpsell / dailyRevenueData.reduce((a, c) => a + c.clients, 0)).toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* 3. Flexible Operations Hub (12-column grid: 8 cols Data Tables + 4 cols Quick Access & Waiting Queue) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* Primary Data Operations (Spans 8 of 12 columns on desktop) */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="p-4 sm:p-6 space-y-5">
                            
                            {/* Header with Segmented Navigation Tabs */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-p-stone/70">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-serif font-bold text-p-primary">
                                        {activeTab === 'appointments' && t({ de: 'Heutige Termine & Behandlungsplan', en: "Today's Schedule & Appointments" })}
                                        {activeTab === 'invoices' && t({ de: 'Kassen- & Abrechnungsjournal', en: 'Billing & Invoices Ledger' })}
                                        {activeTab === 'team' && t({ de: 'Behandler-Einsatzplan & Kapazität', en: 'Practitioner Shift & Capacity' })}
                                    </h2>
                                    <p className="text-xs text-p-text/60 mt-0.5">
                                        {activeTab === 'appointments' && t({ de: `${todayArrivals.length} Klienten eingetragen · Automatische Kiosk-Synchronisation`, en: `${todayArrivals.length} clients scheduled · Real-time kiosk sync` })}
                                        {activeTab === 'invoices' && t({ de: 'Heutige Rechnungen & Upsell-Buchungen nach § 630f BGB', en: 'Today’s receipts & upsell bookings acc. to § 630f BGB' })}
                                        {activeTab === 'team' && t({ de: 'Aktive Behandlungsstationen & Raumbelegung', en: 'Active treatment rooms & practitioner allocation' })}
                                    </p>
                                </div>

                                {/* Tab Selector Control */}
                                <div className="flex items-center p-1 bg-p-background rounded-xl border border-p-stone text-xs self-start sm:self-auto">
                                    <button
                                        onClick={() => setActiveTab('appointments')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                                            activeTab === 'appointments'
                                                ? 'bg-white text-p-primary shadow-xs font-semibold'
                                                : 'text-p-text/70 hover:text-p-primary'
                                        }`}
                                    >
                                        {t({ de: 'Termine', en: 'Appointments' })}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('invoices')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                                            activeTab === 'invoices'
                                                ? 'bg-white text-p-primary shadow-xs font-semibold'
                                                : 'text-p-text/70 hover:text-p-primary'
                                        }`}
                                    >
                                        {t({ de: 'Abrechnungen', en: 'Invoices' })}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('team')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                                            activeTab === 'team'
                                                ? 'bg-white text-p-primary shadow-xs font-semibold'
                                                : 'text-p-text/70 hover:text-p-primary'
                                        }`}
                                    >
                                        {t({ de: 'Team', en: 'Team' })}
                                    </button>
                                </div>
                            </div>

                            {/* Search & Status Filters for Appointments View */}
                            {activeTab === 'appointments' && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-p-surface/60 p-3 rounded-xl border border-p-stone/60">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <MagnifyingGlassIcon className="w-4 h-4 text-p-text/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder={t({ de: 'Patient, Behandler oder Leistung suchen...', en: 'Search patient, practitioner or treatment...' })}
                                            className="w-full pl-9 pr-3 py-1.5 bg-white border border-p-stone rounded-lg text-xs text-p-primary placeholder:text-p-text/40 focus:outline-none focus:border-p-accent focus:ring-1 focus:ring-p-accent/20"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-p-text/40 hover:text-p-primary"
                                                title={t({ de: 'Filter löschen', en: 'Clear filter' })}
                                            >
                                                <XMarkIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Status Filter Buttons */}
                                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
                                        <button
                                            onClick={() => setStatusFilter('all')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                                statusFilter === 'all'
                                                    ? 'bg-p-primary text-white font-semibold'
                                                    : 'bg-white border border-p-stone text-p-text hover:text-p-primary'
                                            }`}
                                        >
                                            {t({ de: 'Alle', en: 'All' })} ({todayArrivals.length})
                                        </button>
                                        <button
                                            onClick={() => setStatusFilter('waiting')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                                                statusFilter === 'waiting'
                                                    ? 'bg-blue-600 text-white font-semibold'
                                                    : 'bg-white border border-p-stone text-blue-700 hover:bg-blue-50/50'
                                            }`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                                            {t({ de: 'Wartend', en: 'Waiting' })} ({waitingCount})
                                        </button>
                                        <button
                                            onClick={() => setStatusFilter('in-progress')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                                                statusFilter === 'in-progress'
                                                    ? 'bg-p-accent text-p-primary font-semibold'
                                                    : 'bg-white border border-p-stone text-p-primary hover:bg-p-accent/10'
                                            }`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-p-accent inline-block" />
                                            {t({ de: 'In Behandlung', en: 'In Progress' })} ({inProgressCount})
                                        </button>
                                        <button
                                            onClick={() => setStatusFilter('done')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                                                statusFilter === 'done'
                                                    ? 'bg-p-success text-white font-semibold'
                                                    : 'bg-white border border-p-stone text-p-success hover:bg-p-success/10'
                                            }`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-p-success inline-block" />
                                            {t({ de: 'Erledigt', en: 'Done' })} ({completedCount})
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* TAB 1: APPOINTMENTS DATA TABLE & MOBILE CARDS (< 768px)  */}
                            {/* ======================================================== */}
                            {activeTab === 'appointments' && (
                                <>
                                    {filteredAppointments.length === 0 ? (
                                        <div className="bg-p-surface rounded-2xl border border-dashed border-p-stone p-8 text-center text-p-text/60">
                                            <CalendarDaysIcon className="w-8 h-8 mx-auto text-p-text/30 mb-2" />
                                            <p className="font-semibold text-p-primary text-sm">
                                                {t({ de: 'Keine Termine gefunden', en: 'No appointments match criteria' })}
                                            </p>
                                            <p className="text-xs text-p-text/60 mt-1">
                                                {t({ de: 'Versuchen Sie einen anderen Suchbegriff oder Status-Filter.', en: 'Try adjusting your search query or status filter.' })}
                                            </p>
                                            {(searchQuery || statusFilter !== 'all') && (
                                                <button
                                                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                                                    className="mt-3 px-3 py-1.5 rounded-lg bg-white border border-p-stone text-xs font-semibold text-p-primary hover:bg-p-background transition"
                                                >
                                                    {t({ de: 'Filter zurücksetzen', en: 'Reset filters' })}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {/* MOBILE CARDS VIEW: Screens smaller than 768px (< md) */}
                                            <div className="block md:hidden space-y-3">
                                                {filteredAppointments.map(client => (
                                                    <div
                                                        key={client.id}
                                                        onClick={() => {
                                                            if (onSelectClient) {
                                                                onSelectClient(client);
                                                            } else {
                                                                setView('practitionerClient');
                                                            }
                                                        }}
                                                        className="p-4 rounded-2xl border border-p-stone/80 bg-white hover:bg-p-surface active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-3 shadow-xs"
                                                    >
                                                        {/* Card Header: Time + Status */}
                                                        <div className="flex items-center justify-between gap-2 border-b border-p-stone/50 pb-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-p-background border border-p-stone text-p-primary tabular-nums">
                                                                    {client.appointmentTime} {isEnglish ? '' : 'Uhr'}
                                                                </span>
                                                                {client.signature && (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] text-p-success font-medium">
                                                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                        <span>{t({ de: 'DSGVO OK', en: 'GDPR OK' })}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full flex-shrink-0 flex items-center gap-1 ${
                                                                client.status === 'waiting' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                                client.status === 'in-progress' ? 'bg-p-accent/15 text-p-accent border border-p-accent/30' :
                                                                'bg-p-success/15 text-p-success border border-p-success/30'
                                                            }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                                    client.status === 'waiting' ? 'bg-blue-600' :
                                                                    client.status === 'in-progress' ? 'bg-p-accent animate-pulse' :
                                                                    'bg-p-success'
                                                                }`} />
                                                                {client.status === 'waiting' 
                                                                    ? t({ de: 'Wartet', en: 'Waiting' })
                                                                    : client.status === 'in-progress'
                                                                    ? t({ de: 'In Behandlung', en: 'In Progress' })
                                                                    : t({ de: 'Erledigt', en: 'Done' })}
                                                            </span>
                                                        </div>

                                                        {/* Patient & Treatment Details */}
                                                        <div>
                                                            <h3 className="font-serif font-bold text-p-primary text-base">
                                                                {client.name}
                                                            </h3>
                                                            <p className="text-xs text-p-text/80 mt-0.5 font-medium">
                                                                {client.lastTreatment || t({ de: 'Erstbesuch', en: 'Initial Visit' })}
                                                            </p>
                                                            <p className="text-[11px] text-p-text/60 mt-0.5 flex items-center gap-1.5">
                                                                <span>🩺 {client.practitioner}</span>
                                                                <span aria-hidden="true">·</span>
                                                                <span className="font-mono tabular-nums">{client.phone}</span>
                                                            </p>
                                                        </div>

                                                        {/* Medical Flags */}
                                                        {client.medicalFlags && client.medicalFlags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                {client.medicalFlags.map((flag, idx) => (
                                                                    <span 
                                                                        key={idx} 
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-p-warning/15 text-p-warning font-semibold border border-p-warning/30"
                                                                    >
                                                                        <ExclamationTriangleIcon className="w-3 h-3 flex-shrink-0" />
                                                                        {flag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Action Trigger */}
                                                        <div className="pt-2 border-t border-p-stone/40 flex items-center justify-between text-xs font-semibold text-p-accent">
                                                            <span>{t({ de: 'Dokumentation öffnen', en: 'Open Documentation' })}</span>
                                                            <ChevronRightIcon className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* DESKTOP DATA TABLE VIEW: Screens 768px and wider (>= md) */}
                                            <div className="hidden md:block overflow-x-auto border border-p-stone/70 rounded-2xl bg-white shadow-xs">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="border-b border-p-stone bg-p-background/40">
                                                            <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                                {t({ de: 'Uhrzeit', en: 'Time' })}
                                                            </th>
                                                            <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                                {t({ de: 'Patient/in', en: 'Patient' })}
                                                            </th>
                                                            <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                                {t({ de: 'Leistung', en: 'Treatment' })}
                                                            </th>
                                                            <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                                {t({ de: 'Behandler/in', en: 'Practitioner' })}
                                                            </th>
                                                            <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                                {t({ de: 'Hinweise', en: 'Alerts' })}
                                                            </th>
                                                            <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                                {t({ de: 'Status', en: 'Status' })}
                                                            </th>
                                                            <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50 text-right">
                                                                {t({ de: 'Aktion', en: 'Action' })}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-p-stone/40">
                                                        {filteredAppointments.map(client => (
                                                            <tr 
                                                                key={client.id} 
                                                                onClick={() => {
                                                                    if (onSelectClient) onSelectClient(client);
                                                                    else setView('practitionerClient');
                                                                }}
                                                                className="hover:bg-p-surface/90 transition-colors cursor-pointer group"
                                                            >
                                                                <td className="py-3.5 px-4 font-mono font-bold text-p-primary whitespace-nowrap tabular-nums">
                                                                    {client.appointmentTime}
                                                                </td>
                                                                <td className="py-3.5 px-4 font-medium text-p-primary">
                                                                    <div className="font-semibold text-sm group-hover:text-p-accent transition-colors">
                                                                        {client.name}
                                                                    </div>
                                                                    <span className="text-[11px] text-p-text/50 font-mono tabular-nums block">
                                                                        {client.phone}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3.5 px-4 text-p-text/80 font-medium">
                                                                    {client.lastTreatment || t({ de: 'Erstbesuch', en: 'Initial Visit' })}
                                                                </td>
                                                                <td className="py-3.5 px-4 text-p-text/70 whitespace-nowrap">
                                                                    🩺 {client.practitioner}
                                                                </td>
                                                                <td className="py-3.5 px-4">
                                                                    {client.medicalFlags && client.medicalFlags.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-1 max-w-[170px]">
                                                                            {client.medicalFlags.map((flag, idx) => (
                                                                                <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-p-warning/15 text-p-warning font-semibold border border-p-warning/30 whitespace-nowrap">
                                                                                    ⚠️ {flag}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-p-text/40 text-[11px]">—</span>
                                                                    )}
                                                                </td>
                                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                                                        client.status === 'waiting' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                        client.status === 'in-progress' ? 'bg-p-accent/10 text-p-accent border-p-accent/25' :
                                                                        'bg-p-success/10 text-p-success border-p-success/25'
                                                                    }`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                                            client.status === 'waiting' ? 'bg-blue-600' :
                                                                            client.status === 'in-progress' ? 'bg-p-accent animate-pulse' :
                                                                            'bg-p-success'
                                                                        }`} />
                                                                        {client.status === 'waiting' 
                                                                            ? t({ de: 'Wartet', en: 'Waiting' })
                                                                            : client.status === 'in-progress'
                                                                            ? t({ de: 'In Behandlung', en: 'In Progress' })
                                                                            : t({ de: 'Erledigt', en: 'Done' })}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                                    <button
                                                                        className="px-2.5 py-1 rounded-lg bg-p-background hover:bg-p-accent/20 text-p-primary text-[11px] font-semibold border border-p-stone transition group-hover:border-p-accent/50"
                                                                    >
                                                                        {t({ de: 'Öffnen →', en: 'Open →' })}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {/* ======================================================== */}
                            {/* TAB 2: INVOICES & REVENUE LEDGER (< 768px COLLAPSES)     */}
                            {/* ======================================================== */}
                            {activeTab === 'invoices' && (
                                <div className="space-y-4">
                                    {/* Mobile Cards View (< md / < 768px) */}
                                    <div className="block md:hidden space-y-3">
                                        {recentInvoices.map(inv => (
                                            <div 
                                                key={inv.id}
                                                className="p-4 rounded-2xl border border-p-stone/80 bg-white shadow-xs space-y-2.5"
                                            >
                                                <div className="flex items-center justify-between border-b border-p-stone/40 pb-2">
                                                    <span className="font-mono text-xs font-bold text-p-primary">{inv.id}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        inv.status === 'paid' 
                                                            ? 'bg-p-success/15 text-p-success border border-p-success/30' 
                                                            : 'bg-p-warning/15 text-p-warning border border-p-warning/30'
                                                    }`}>
                                                        {inv.status === 'paid' ? t({ de: 'Bezahlt', en: 'Paid' }) : t({ de: 'Ausstehend', en: 'Pending' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-serif font-bold text-p-primary text-base">{inv.clientName}</span>
                                                    <span className="text-base font-bold font-mono text-p-primary tabular-nums">€ {inv.amount.toFixed(2)}</span>
                                                </div>
                                                <div className="text-xs text-p-text/70 space-y-0.5">
                                                    <div>• {inv.service}</div>
                                                    {inv.upsellItem && (
                                                        <div className="text-p-accent font-medium flex items-center gap-1">
                                                            <SparklesIcon className="w-3 h-3" />
                                                            {inv.upsellItem}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-p-text/50 pt-2 border-t border-p-stone/40">
                                                    <span>{t({ de: 'Zahlart:', en: 'Method:' })} <strong className="text-p-primary">{inv.paymentMethod}</strong></span>
                                                    <span className="font-mono tabular-nums">{inv.time} Uhr</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop Table View (>= md / >= 768px) */}
                                    <div className="hidden md:block overflow-x-auto border border-p-stone/70 rounded-2xl bg-white shadow-xs">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-p-stone bg-p-background/40">
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                        {t({ de: 'Beleg-Nr.', en: 'Invoice #' })}
                                                    </th>
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                        {t({ de: 'Patient', en: 'Patient' })}
                                                    </th>
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                        {t({ de: 'Leistung & Zusatzverkauf', en: 'Service & Add-on' })}
                                                    </th>
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                        {t({ de: 'Betrag', en: 'Amount' })}
                                                    </th>
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                        {t({ de: 'Zahlungsart', en: 'Payment' })}
                                                    </th>
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">
                                                        {t({ de: 'Status', en: 'Status' })}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-p-stone/40">
                                                {recentInvoices.map(inv => (
                                                    <tr key={inv.id} className="hover:bg-p-surface transition-colors">
                                                        <td className="py-3.5 px-4 font-mono font-bold text-p-primary">{inv.id}</td>
                                                        <td className="py-3.5 px-4 font-medium text-p-primary">{inv.clientName}</td>
                                                        <td className="py-3.5 px-4">
                                                            <div className="text-p-text">{inv.service}</div>
                                                            {inv.upsellItem && (
                                                                <div className="text-p-accent text-[11px] font-medium flex items-center gap-1">
                                                                    <SparklesIcon className="w-3 h-3" />
                                                                    {inv.upsellItem}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-bold text-p-primary tabular-nums">
                                                            € {inv.amount.toFixed(2)}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-p-text/70">{inv.paymentMethod}</td>
                                                        <td className="py-3.5 px-4">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                inv.status === 'paid' 
                                                                    ? 'bg-p-success/10 text-p-success border border-p-success/20' 
                                                                    : 'bg-p-warning/10 text-p-warning border border-p-warning/20'
                                                            }`}>
                                                                {inv.status === 'paid' ? t({ de: 'Bezahlt', en: 'Paid' }) : t({ de: 'Ausstehend', en: 'Pending' })}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* TAB 3: TEAM & PRACTITIONER SHIFTS (< 768px COLLAPSES)   */}
                            {/* ======================================================== */}
                            {activeTab === 'team' && (
                                <div className="space-y-4">
                                    {/* Mobile Cards View (< md / < 768px) */}
                                    <div className="block md:hidden space-y-3">
                                        {teamDuties.map((p, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl border border-p-stone/80 bg-white shadow-xs space-y-3">
                                                <div className="flex items-center justify-between border-b border-p-stone/40 pb-2">
                                                    <div>
                                                        <h3 className="font-serif font-bold text-p-primary text-base">{p.name}</h3>
                                                        <span className="text-xs text-p-text/60">{p.role}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        p.status === 'in-session' ? 'bg-p-accent/15 text-p-primary border border-p-accent/30' : 'bg-p-success/15 text-p-success border border-p-success/30'
                                                    }`}>
                                                        {p.status === 'in-session' ? t({ de: 'In Behandlung', en: 'In Session' }) : t({ de: 'Bereit', en: 'Available' })}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="bg-p-background p-2 rounded-lg border border-p-stone/50">
                                                        <span className="text-[10px] text-p-text/50 uppercase block">{t({ de: 'Termine Heute', en: 'Today’s Clients' })}</span>
                                                        <span className="font-bold text-p-primary font-mono tabular-nums">{p.completedCount} / {p.scheduledCount}</span>
                                                    </div>
                                                    <div className="bg-p-background p-2 rounded-lg border border-p-stone/50">
                                                        <span className="text-[10px] text-p-text/50 uppercase block">{t({ de: 'Upsell-Quote', en: 'Upsell Conversion' })}</span>
                                                        <span className="font-bold text-p-accent font-mono tabular-nums">{p.upsellRate}%</span>
                                                    </div>
                                                </div>
                                                <div className="text-[11px] text-p-text/60 flex items-center justify-between">
                                                    <span>📍 {p.room}</span>
                                                    <button 
                                                        onClick={() => setIsUserManagementOpen(true)}
                                                        className="text-p-accent hover:underline font-semibold"
                                                    >
                                                        {t({ de: 'Rechte bearbeiten →', en: 'Manage role →' })}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop Table View (>= md / >= 768px) */}
                                    <div className="hidden md:block overflow-x-auto border border-p-stone/70 rounded-2xl bg-white shadow-xs">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-p-stone bg-p-background/40">
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">{t({ de: 'Behandler/in', en: 'Practitioner' })}</th>
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">{t({ de: 'Station', en: 'Room' })}</th>
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">{t({ de: 'Terminauslastung', en: 'Schedule Progress' })}</th>
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">{t({ de: 'Upsell-Quote', en: 'Upsell Rate' })}</th>
                                                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-p-text/50">{t({ de: 'Status', en: 'Status' })}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-p-stone/40">
                                                {teamDuties.map((p, idx) => (
                                                    <tr key={idx} className="hover:bg-p-surface transition-colors">
                                                        <td className="py-3.5 px-4 font-medium text-p-primary">
                                                            <div className="font-semibold text-sm">{p.name}</div>
                                                            <span className="text-[11px] text-p-text/50">{p.role}</span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-p-text/70">📍 {p.room}</td>
                                                        <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-p-primary">
                                                            {p.completedCount} / {p.scheduledCount} {t({ de: 'erledigt', en: 'completed' })}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-p-accent">
                                                            {p.upsellRate}%
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                p.status === 'in-session' ? 'bg-p-accent/15 text-p-primary border border-p-accent/30' : 'bg-p-success/15 text-p-success border border-p-success/30'
                                                            }`}>
                                                                {p.status === 'in-session' ? t({ de: 'In Behandlung', en: 'In Session' }) : t({ de: 'Bereit', en: 'Available' })}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Secondary Operations: Quick Access & Live Queue (Spans 4 of 12 columns on desktop) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Live Waiting Room Monitor */}
                        <Card className="space-y-4">
                            <div className="flex items-center justify-between border-b border-p-stone/60 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                                    <h3 className="font-serif font-bold text-p-primary text-base">
                                        {t({ de: 'Warteraum-Monitor', en: 'Waiting Room Live' })}
                                    </h3>
                                </div>
                                <span className="font-mono text-xs font-bold text-p-primary bg-p-background px-2 py-0.5 rounded-lg border border-p-stone">
                                    {waitingCount} {t({ de: 'anwesend', en: 'present' })}
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {todayArrivals.filter(c => c.status === 'waiting').length === 0 ? (
                                    <p className="text-xs text-p-text/50 py-3 text-center italic">
                                        {t({ de: 'Derzeit keine Patienten im Warteraum.', en: 'No patients currently in reception.' })}
                                    </p>
                                ) : (
                                    todayArrivals.filter(c => c.status === 'waiting').map(client => (
                                        <div 
                                            key={client.id}
                                            onClick={() => {
                                                if (onSelectClient) onSelectClient(client);
                                                else setView('practitionerClient');
                                            }}
                                            className="p-3 rounded-xl border border-blue-200/80 bg-blue-50/40 hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-between group"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-semibold text-xs text-p-primary truncate">{client.name}</div>
                                                <div className="text-[11px] text-p-text/60 truncate">
                                                    {client.appointmentTime} Uhr · {client.practitioner}
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-1 rounded-lg border border-blue-200 shadow-xs flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {t({ de: 'Aufrufen →', en: 'Call in →' })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Quick Access Control Card */}
                        <Card className="space-y-4">
                            <h3 className="text-base font-serif font-bold text-p-primary border-b border-p-stone/60 pb-3">
                                {t({ de: 'Studio Schnellzugriff', en: 'Studio Quick Actions' })}
                            </h3>
                            <div className="space-y-2.5">
                                <button 
                                    onClick={handleSimulateCheckin} 
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-p-accent/40 bg-p-accent/5 hover:bg-p-accent/15 transition-all group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-p-accent/20 text-p-primary group-hover:scale-105 transition-transform">
                                            <DevicePhoneMobileIcon className="w-4 h-4 text-p-accent"/>
                                        </div>
                                        <div>
                                            <span className="font-medium text-p-primary block text-xs">
                                                {t({ de: 'Check-in simulieren', en: 'Simulate Check-in' })}
                                            </span>
                                            <span className="text-[10px] text-p-text/60">
                                                {t({ de: 'Tablet-Benachrichtigung testen', en: 'Test tablet notification' })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-p-accent group-hover:translate-x-0.5 transition-transform">+ Test</span>
                                </button>

                                <button 
                                    onClick={() => setIsComplianceReportOpen(true)} 
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-p-accent/40 bg-white hover:bg-p-surface transition-all group text-left shadow-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-p-accent/15 text-p-primary group-hover:scale-105 transition-transform border border-p-accent/30">
                                            <DocumentChartBarIcon className="w-4 h-4 text-p-accent"/>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium text-p-primary block text-xs">
                                                    {t({ de: 'Compliance-Bericht', en: 'Compliance Report' })}
                                                </span>
                                                <span className="text-[9px] font-mono font-bold bg-p-accent/20 text-p-primary px-1.5 py-0.2 rounded">D3.js</span>
                                            </div>
                                            <span className="text-[10px] text-p-text/60">
                                                {t({ de: 'Tages-Trends & Risikoverteilung', en: 'Daily trends & risk distribution' })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-p-accent group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                                </button>

                                <button 
                                    onClick={() => setIsUserManagementOpen(true)} 
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-p-accent/40 bg-white hover:bg-p-surface transition-all group text-left shadow-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-p-primary text-white group-hover:scale-105 transition-transform">
                                            <UserGroupIcon className="w-4 h-4 text-p-accent"/>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium text-p-primary block text-xs">
                                                    {t({ de: 'Team- & Rollenverwaltung', en: 'Staff & Role Management' })}
                                                </span>
                                                <span className="text-[9px] font-mono font-bold bg-p-accent/20 text-p-primary px-1.5 py-0.2 rounded">RBAC</span>
                                            </div>
                                            <span className="text-[10px] text-p-text/60">
                                                {t({ de: 'Mitarbeiter einladen & Rechte steuern', en: 'Invite staff & manage permissions' })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-p-accent group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                                </button>

                                <button 
                                    onClick={() => setView('adminSettings')} 
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-p-stone hover:border-p-primary/30 hover:bg-p-surface transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-p-background text-p-text/60 group-hover:text-p-primary">
                                            <CogIcon className="w-4 h-4"/>
                                        </div>
                                        <span className="font-medium text-p-primary text-xs">
                                            {t({ de: 'Studio Einstellungen', en: 'Studio Settings' })}
                                        </span>
                                    </div>
                                    <span className="text-p-text/40 group-hover:translate-x-1 transition-transform text-xs">&rarr;</span>
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Comprehensive Compliance & Safety Report Modal */}
            <ComplianceReportModal 
                isOpen={isComplianceReportOpen} 
                onClose={() => setIsComplianceReportOpen(false)} 
                clients={clients} 
            />

            {/* Staff & Role Management Modal (Supabase RBAC) */}
            <AdminUserManagement 
                isOpen={isUserManagementOpen} 
                onClose={() => setIsUserManagementOpen(false)} 
                isModal={true} 
            />
        </div>
    );
};

export default AdminDashboard;
