import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { StaffMember, Role } from '../../../types';
import { 
    getStaffMembers, 
    inviteStaffViaSupabase, 
    updateStaffRoleInSupabase, 
    removeStaffMemberFromSupabase,
    isSupabaseConfigured
} from '../../../services/supabase';
import { 
    UserGroupIcon, 
    UserPlusIcon, 
    EnvelopeIcon, 
    ShieldCheckIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    TrashIcon, 
    ArrowPathIcon,
    SparklesIcon,
    LockClosedIcon,
    XMarkIcon,
    KeyIcon,
    ChevronDownIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

interface AdminUserManagementProps {
    isOpen?: boolean;
    onClose?: () => void;
    isModal?: boolean;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
    isOpen = true,
    onClose,
    isModal = false
}) => {
    const { profile: currentAdmin, isConfigured } = useAuth();
    const { t } = useLanguage();

    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Invite form state
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'admin' | 'practitioner'>('practitioner');
    const [specialization, setSpecialization] = useState('Podologie / Fußpflege');
    const [comments, setComments] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [lastInvitedMetadata, setLastInvitedMetadata] = useState<any>(null);

    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'practitioner'>('all');

    const loadStaff = async () => {
        setIsLoading(true);
        try {
            const list = await getStaffMembers();
            setStaffList(list);
        } catch (err) {
            console.error('Failed to load staff roster:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStaff();
    }, []);

    if (!isOpen) return null;

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError(null);
        setInviteSuccess(null);
        setIsInviting(true);

        try {
            const res = await inviteStaffViaSupabase({
                email,
                fullName,
                role,
                specialization,
                notes: comments,
                invitedBy: currentAdmin?.fullName || currentAdmin?.email || 'Studioleitung'
            });

            if (res.success && res.staff) {
                setInviteSuccess(
                    t({
                        de: `Einladung für ${fullName} (${email}) erfolgreich erstellt mit Rolle "${role === 'admin' ? 'Studio Admin' : 'Behandler/in'}".`,
                        en: `Invitation for ${fullName} (${email}) created successfully with role "${role}".`
                    })
                );
                setLastInvitedMetadata(res.staff.metadata);
                // Clear form
                setEmail('');
                setFullName('');
                setComments('');
                setSpecialization(role === 'admin' ? 'Praxisleitung' : 'Podologie / Fußpflege');
                // Refresh list
                await loadStaff();
            } else {
                setInviteError(res.error || 'Fehler beim Versenden der Einladung.');
            }
        } catch (err: any) {
            setInviteError(err.message || 'Unerwarteter Fehler bei der Einladung.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRoleChange = async (member: StaffMember, newRole: 'admin' | 'practitioner') => {
        if (member.role === newRole) return;
        
        // Optimistic update
        setStaffList(prev => prev.map(s => s.id === member.id ? { ...s, role: newRole } : s));
        await updateStaffRoleInSupabase(member.id, member.email, newRole);
    };

    const handleRemoveStaff = async (member: StaffMember) => {
        const confirmed = window.confirm(
            t({
                de: `Möchten Sie ${member.fullName} (${member.email}) wirklich aus dem Studio-Team entfernen?`,
                en: `Are you sure you want to remove ${member.fullName} (${member.email}) from the studio team?`
            })
        );
        if (!confirmed) return;

        // Optimistic delete
        setStaffList(prev => prev.filter(s => s.id !== member.id));
        await removeStaffMemberFromSupabase(member.id, member.email);
    };

    const filteredStaff = staffList.filter(s => {
        if (roleFilter !== 'all' && s.role !== roleFilter) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                s.fullName.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                (s.specialization && s.specialization.toLowerCase().includes(q))
            );
        }
        return true;
    });

    const handleOpenInviteModal = () => {
        setEmail('');
        setFullName('');
        setComments('');
        setRole('practitioner');
        setSpecialization('Podologie / Fußpflege');
        setInviteSuccess(null);
        setInviteError(null);
        setShowInviteModal(true);
    };

    const content = (
        <div className="space-y-6">
            {/* Top Stat and Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-p-stone/70 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-xl bg-p-primary text-white">
                            <UserGroupIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-p-primary">
                            {t({ de: 'Mitarbeiter- & Rollenverwaltung', en: 'Staff & Role Management' })}
                        </h2>
                        <span className="text-[10px] font-mono uppercase bg-p-accent/15 text-p-primary px-2.5 py-0.5 rounded-full font-bold border border-p-accent/30">
                            Supabase RBAC
                        </span>
                    </div>
                    <p className="text-xs text-p-text/70">
                        {t({ 
                            de: 'Verwalten Sie Praxisberechtigungen und laden Sie Behandlerinnen oder Co-Admins per Supabase Auth Metadata ein.',
                            en: 'Manage studio access permissions and invite practitioners or co-admins via Supabase Auth Metadata.'
                        })}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpenInviteModal}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-p-primary text-white hover:bg-p-primary/90 text-xs font-semibold shadow-md transition active:scale-95"
                    >
                        <UserPlusIcon className="w-4 h-4 text-p-accent" />
                        <span>{t({ de: 'Neues Teammitglied einladen', en: 'Invite Staff Member' })}</span>
                    </button>
                    {onClose && isModal && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-p-text/60 hover:text-p-primary hover:bg-p-stone/40 transition"
                            aria-label="Schließen"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Compliance Banner */}
            <div className="bg-gradient-to-r from-p-surface to-white p-4 rounded-2xl border border-p-stone/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-p-success/15 border border-p-success/30 flex items-center justify-center text-p-success flex-shrink-0">
                        <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                        <p className="font-semibold text-p-primary">
                            {t({ de: 'DSGVO Art. 9 & ISO 9001 Rollentrennung aktiv', en: 'GDPR Art. 9 & ISO 9001 Role Isolation Active' })}
                        </p>
                        <p className="text-p-text/70 mt-0.5 text-[11px]">
                            {t({ 
                                de: 'Behandler/innen sehen ausschließlich zugewiesene Behandlungsdaten. Finanzberichte & Compliance-Audits bleiben Administratoren vorbehalten.',
                                en: 'Practitioners access assigned patient treatment records only. Revenue analytics and compliance audits remain strictly admin-gated.'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 text-[11px] font-mono text-p-text/60 bg-p-background px-2.5 py-1 rounded-lg border border-p-stone">
                    <span>{staffList.filter(s => s.role === 'admin').length} {t({ de: 'Admins', en: 'Admins' })}</span>
                    <span>•</span>
                    <span>{staffList.filter(s => s.role === 'practitioner').length} {t({ de: 'Behandler/innen', en: 'Practitioners' })}</span>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t({ de: 'Mitarbeiter nach Name, E-Mail oder Rolle suchen...', en: 'Search staff by name, email, or role...' })}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-p-stone text-p-primary focus:outline-none focus:border-p-accent shadow-xs placeholder:text-p-text/40"
                    />
                    <div className="absolute left-3 top-2.5 text-p-text/40 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-p-text/60 uppercase">{t({ de: 'Filter:', en: 'Filter:' })}</span>
                    <div className="inline-flex rounded-xl bg-p-stone/40 p-1 border border-p-stone">
                        <button
                            onClick={() => setRoleFilter('all')}
                            className={`px-3 py-1 text-xs rounded-lg transition font-medium ${
                                roleFilter === 'all' ? 'bg-white text-p-primary shadow-xs font-semibold' : 'text-p-text/70 hover:text-p-primary'
                            }`}
                        >
                            {t({ de: 'Alle', en: 'All' })} ({staffList.length})
                        </button>
                        <button
                            onClick={() => setRoleFilter('admin')}
                            className={`px-3 py-1 text-xs rounded-lg transition font-medium ${
                                roleFilter === 'admin' ? 'bg-white text-p-primary shadow-xs font-semibold' : 'text-p-text/70 hover:text-p-primary'
                            }`}
                        >
                            👑 Admin ({staffList.filter(s => s.role === 'admin').length})
                        </button>
                        <button
                            onClick={() => setRoleFilter('practitioner')}
                            className={`px-3 py-1 text-xs rounded-lg transition font-medium ${
                                roleFilter === 'practitioner' ? 'bg-white text-p-primary shadow-xs font-semibold' : 'text-p-text/70 hover:text-p-primary'
                            }`}
                        >
                            🩺 {t({ de: 'Behandler', en: 'Practitioners' })} ({staffList.filter(s => s.role === 'practitioner').length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Staff Roster: Mobile Vertically Stacked Cards (< md) */}
            <div className="block md:hidden space-y-3">
                {isLoading ? (
                    <div className="bg-white rounded-2xl border border-p-stone p-8 text-center text-p-text/50">
                        <ArrowPathIcon className="w-5 h-5 mx-auto animate-spin mb-1 text-p-accent" />
                        <span>{t({ de: 'Lade Teamliste aus Supabase...', en: 'Loading staff roster from Supabase...' })}</span>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-p-stone p-8 text-center text-p-text/50 italic">
                        {t({ de: 'Keine Mitarbeiter gefunden.', en: 'No staff members found.' })}
                    </div>
                ) : (
                    filteredStaff.map(member => {
                        const isCurrentLoggedAdmin = currentAdmin?.email.toLowerCase() === member.email.toLowerCase();
                        return (
                            <div 
                                key={member.id} 
                                className="bg-white rounded-2xl border border-p-stone/80 p-4 shadow-xs flex flex-col gap-3"
                            >
                                {/* Row 1: Member Header & Status */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${
                                            member.role === 'admin' 
                                                ? 'bg-p-primary text-white border border-p-primary/20' 
                                                : 'bg-p-accent/20 text-p-primary border border-p-accent/30'
                                        }`}>
                                            {member.fullName.substring(0, 2)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-p-primary flex items-center gap-1.5 text-sm truncate">
                                                <span className="truncate">{member.fullName}</span>
                                                {isCurrentLoggedAdmin && (
                                                    <span className="text-[9px] bg-p-accent/20 text-p-primary px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                                                        {t({ de: 'Sie', en: 'You' })}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-p-text/60 font-mono truncate block">
                                                {member.email}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 bg-p-background px-2.5 py-1 rounded-full border border-p-stone/60 flex-shrink-0">
                                        <span className={`w-2 h-2 rounded-full ${
                                            member.status === 'active' ? 'bg-p-success' : 'bg-p-warning animate-pulse'
                                        }`} />
                                        <span className="text-[10px] font-bold text-p-primary capitalize">
                                            {member.status === 'active' 
                                                ? t({ de: 'Aktiv', en: 'Active' }) 
                                                : t({ de: 'Eingeladen', en: 'Invited' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Row 2: Stacked Details (Role & Specialization) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs border-t border-p-stone/40 pt-2.5">
                                    <div>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-p-text/50 block mb-0.5">
                                            {t({ de: 'Rolle & Rechte', en: 'Role & Permissions' })}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                                            member.role === 'admin'
                                                ? 'bg-p-primary text-white shadow-xs'
                                                : 'bg-p-accent/20 text-p-primary border border-p-accent/40'
                                        }`}>
                                            {member.role === 'admin' 
                                                ? t({ de: '👑 Admin', en: '👑 Admin' }) 
                                                : t({ de: '🩺 Behandler', en: '🩺 Practitioner' })}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-p-text/50 block mb-0.5">
                                            {t({ de: 'Fachbereich', en: 'Department' })}
                                        </span>
                                        <span className="text-p-primary font-medium text-xs truncate block">
                                            {member.specialization || t({ de: 'Allgemeine Praxis', en: 'General Practice' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Row 3: Activity Timestamp & Notes */}
                                <div className="text-[11px] text-p-text/60 flex items-center justify-between border-t border-p-stone/40 pt-2">
                                    <span className="flex items-center gap-1">
                                        <ClockIcon className="w-3.5 h-3.5 text-p-accent flex-shrink-0" />
                                        <span>
                                            {member.status === 'active' 
                                                ? (member.lastActive || t({ de: 'Online', en: 'Online' })) 
                                                : `${t({ de: 'Eingeladen:', en: 'Invited:' })} ${member.invitedAt || t({ de: 'Kürzlich', en: 'Recently' })}`
                                            }
                                        </span>
                                    </span>
                                    {member.notes && (
                                        <span className="text-p-text/70 italic text-[10px] truncate max-w-[150px]" title={member.notes}>
                                            "{member.notes}"
                                        </span>
                                    )}
                                </div>

                                {/* Row 4: Actions Bar */}
                                <div className="flex items-center gap-2 pt-2 border-t border-p-stone/50">
                                    <div className="flex-1">
                                        <select
                                            value={member.role}
                                            onChange={e => handleRoleChange(member, e.target.value as 'admin' | 'practitioner')}
                                            disabled={isCurrentLoggedAdmin}
                                            className="w-full py-2 px-3 text-xs rounded-xl border border-p-stone bg-p-background font-medium text-p-primary focus:outline-none focus:border-p-accent disabled:opacity-50"
                                            title={isCurrentLoggedAdmin ? t({ de: 'Eigene Rolle kann nicht entzogen werden', en: 'Cannot revoke your own role' }) : t({ de: 'Rolle ändern', en: 'Change role' })}
                                        >
                                            <option value="practitioner">🩺 {t({ de: 'Behandler/in', en: 'Practitioner' })}</option>
                                            <option value="admin">👑 {t({ de: 'Studio Admin', en: 'Studio Admin' })}</option>
                                        </select>
                                    </div>
                                    {!isCurrentLoggedAdmin && (
                                        <button
                                            onClick={() => handleRemoveStaff(member)}
                                            className="p-2.5 rounded-xl text-p-warning hover:bg-p-warning/10 border border-p-warning/30 transition flex items-center justify-center min-w-[38px] min-h-[38px]"
                                            title={t({ de: 'Mitarbeiter entfernen', en: 'Remove staff member' })}
                                            aria-label="Mitarbeiterzugang widerrufen"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Staff Roster: Desktop Table View (>= md) */}
            <div className="hidden md:block bg-white rounded-2xl border border-p-stone shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-p-stone/70 bg-p-background/60 text-p-text/70 uppercase text-[10px] tracking-wider font-semibold">
                                <th className="py-3 px-4">{t({ de: 'Teammitglied', en: 'Team Member' })}</th>
                                <th className="py-3 px-4">{t({ de: 'Zugeordnete Rolle & Berechtigung', en: 'Assigned Role & Permissions' })}</th>
                                <th className="py-3 px-4">{t({ de: 'Fachbereich / Station', en: 'Department / Station' })}</th>
                                <th className="py-3 px-4">{t({ de: 'Status & Aktivität', en: 'Status & Activity' })}</th>
                                <th className="py-3 px-4 text-right">{t({ de: 'Rolle anpassen / Aktionen', en: 'Manage Role / Actions' })}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-p-stone/40">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-p-text/50">
                                        <ArrowPathIcon className="w-5 h-5 mx-auto animate-spin mb-1 text-p-accent" />
                                        <span>{t({ de: 'Lade Teamliste aus Supabase...', en: 'Loading staff roster from Supabase...' })}</span>
                                    </td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-p-text/50 italic">
                                        {t({ de: 'Keine Mitarbeiter gefunden.', en: 'No staff members found.' })}
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map(member => {
                                    const isCurrentLoggedAdmin = currentAdmin?.email.toLowerCase() === member.email.toLowerCase();
                                    return (
                                        <tr key={member.id} className="hover:bg-p-background/40 transition-colors">
                                            {/* Name & Email */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                                                        member.role === 'admin' 
                                                            ? 'bg-p-primary text-white border border-p-primary/20' 
                                                            : 'bg-p-accent/20 text-p-primary border border-p-accent/30'
                                                    }`}>
                                                        {member.fullName.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-p-primary flex items-center gap-1.5">
                                                            <span>{member.fullName}</span>
                                                            {isCurrentLoggedAdmin && (
                                                                <span className="text-[9px] bg-p-accent/15 text-p-primary px-1.5 py-0.2 rounded font-bold">
                                                                    {t({ de: 'Sie', en: 'You' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-p-text/60 font-mono">
                                                            {member.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role & Metadata Badge */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                                        member.role === 'admin'
                                                            ? 'bg-p-primary text-white shadow-xs'
                                                            : 'bg-p-accent/20 text-p-primary border border-p-accent/40'
                                                    }`}>
                                                        <span>{member.role === 'admin' ? '👑 Studio Admin' : `🩺 ${t({ de: 'Behandler/in', en: 'Practitioner' })}`}</span>
                                                    </span>

                                                    <span className="text-[9px] font-mono bg-p-stone/40 px-1.5 py-0.5 rounded text-p-text/60 border border-p-stone/60" title="Supabase user_metadata.role">
                                                        raw_metadata: "{member.role}"
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Specialization */}
                                            <td className="py-3.5 px-4 text-p-text/80 font-medium">
                                                {member.specialization || t({ de: 'Allgemeine Praxis', en: 'General Practice' })}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-2 h-2 rounded-full ${
                                                            member.status === 'active' ? 'bg-p-success' : 'bg-p-warning animate-pulse'
                                                        }`} />
                                                        <span className="font-semibold text-[11px] text-p-primary capitalize">
                                                            {member.status === 'active' 
                                                                ? t({ de: 'Aktiv', en: 'Active' }) 
                                                                : t({ de: 'Einladung versendet', en: 'Invitation Sent' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-p-text/50">
                                                        {member.status === 'active' 
                                                            ? (member.lastActive || t({ de: 'Online', en: 'Online' })) 
                                                            : `${t({ de: 'Eingeladen:', en: 'Invited:' })} ${member.invitedAt || t({ de: 'Kürzlich', en: 'Recently' })}`
                                                        }
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5 justify-end">
                                                    {/* Quick Role Switcher */}
                                                    <select
                                                        value={member.role}
                                                        onChange={e => handleRoleChange(member, e.target.value as 'admin' | 'practitioner')}
                                                        disabled={isCurrentLoggedAdmin}
                                                        className="py-1 px-2 text-[11px] rounded-lg border border-p-stone bg-p-background font-medium text-p-primary focus:outline-none focus:border-p-accent disabled:opacity-50"
                                                        title={isCurrentLoggedAdmin ? t({ de: 'Eigene Administrator-Rolle kann nicht entzogen werden', en: 'Cannot revoke your own admin role' }) : t({ de: 'Rolle in Supabase Auth Metadata ändern', en: 'Change role in Supabase Auth metadata' })}
                                                    >
                                                        <option value="practitioner">🩺 {t({ de: 'Behandler/in', en: 'Practitioner' })}</option>
                                                        <option value="admin">👑 {t({ de: 'Studio Admin', en: 'Studio Admin' })}</option>
                                                    </select>

                                                    {/* Delete / Revoke */}
                                                    {!isCurrentLoggedAdmin && (
                                                        <button
                                                            onClick={() => handleRemoveStaff(member)}
                                                            className="p-1.5 rounded-lg text-p-text/40 hover:text-p-warning hover:bg-p-warning/10 transition"
                                                            title={t({ de: 'Mitarbeiterzugang widerrufen', en: 'Revoke staff access' })}
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal / Drawer */}
            {showInviteModal && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
                    onClick={() => setShowInviteModal(false)}
                >
                    <div 
                        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-p-stone text-p-primary relative overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top Accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-p-primary via-p-accent to-p-primary" />

                        <div className="flex justify-between items-start mb-5 pt-1">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-p-primary">
                                    {t({ de: 'Neues Teammitglied einladen', en: 'Invite Staff Member' })}
                                </h3>
                                <p className="text-xs text-p-text/70 mt-0.5">
                                    {t({ de: 'Erstellt den Account mit hinterlegten Supabase Auth Metadaten.', en: 'Creates account with configured Supabase Auth metadata.' })}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="p-1.5 rounded-lg text-p-text/60 hover:text-p-primary hover:bg-p-stone/40 transition"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSendInvite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-p-primary mb-1">
                                    {t({ de: 'Vollständiger Name des Mitarbeiters', en: 'Full Name of Staff Member' })}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder={t({ de: 'z.B. Anna Schmidt', en: 'e.g. Anna Smith' })}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-p-background/50 border border-p-stone text-p-primary focus:outline-none focus:border-p-accent shadow-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-p-primary mb-1">
                                    {t({ de: 'E-Mail-Adresse für Einladung', en: 'Email Address for Invitation' })}
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="anna.schmidt@podea-studio.de"
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-p-background/50 border border-p-stone text-p-primary focus:outline-none focus:border-p-accent shadow-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-p-primary mb-1.5">
                                    {t({ de: 'Rolle zuweisen (in Supabase Auth Metadata)', en: 'Assign Role (in Supabase Auth Metadata)' })}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => {
                                            setRole('practitioner');
                                            if (specialization === 'Praxisleitung') setSpecialization('Podologie / Fußpflege');
                                        }}
                                        className={`p-3 rounded-2xl border cursor-pointer transition ${
                                            role === 'practitioner'
                                                ? 'bg-p-accent/15 border-p-accent text-p-primary shadow-xs font-semibold'
                                                : 'bg-white border-p-stone hover:bg-p-background/60 text-p-text/70'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-serif font-bold">🩺 {t({ de: 'Behandler/in', en: 'Practitioner' })}</span>
                                            {role === 'practitioner' && <CheckIcon className="w-4 h-4 text-p-accent" />}
                                        </div>
                                        <p className="text-[11px] leading-relaxed font-normal opacity-80">
                                            {t({
                                                de: 'Termin-Triage, medizinische Flags, Behandlungsdokumentation & Quittungsdruck.',
                                                en: 'Appointment triage, medical risk flags, treatment documentation & receipts.'
                                            })}
                                        </p>
                                    </div>

                                    <div
                                        onClick={() => {
                                            setRole('admin');
                                            setSpecialization('Praxisleitung');
                                        }}
                                        className={`p-3 rounded-2xl border cursor-pointer transition ${
                                            role === 'admin'
                                                ? 'bg-p-primary text-white border-p-primary shadow-xs font-semibold'
                                                : 'bg-white border-p-stone hover:bg-p-background/60 text-p-text/70'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-serif font-bold">👑 {t({ de: 'Studio Admin', en: 'Studio Admin' })}</span>
                                            {role === 'admin' && <CheckIcon className="w-4 h-4 text-p-accent" />}
                                        </div>
                                        <p className="text-[11px] leading-relaxed font-normal opacity-80">
                                            {t({
                                                de: 'Umsatz-KPIs, Compliance-Audits, Studio-Einstellungen und Mitarbeiterverwaltung.',
                                                en: 'Revenue KPIs, compliance audits, studio settings and staff management.'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-p-primary mb-1">
                                    {t({ de: 'Fachbereich / Station (optional)', en: 'Department / Station (optional)' })}
                                </label>
                                <input
                                    type="text"
                                    value={specialization}
                                    onChange={e => setSpecialization(e.target.value)}
                                    placeholder={t({ de: 'z.B. Medizinische Fußpflege / Orthonyxie', en: 'e.g. Medical Pedicure / Orthonyxia' })}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-p-background/50 border border-p-stone text-p-primary focus:outline-none focus:border-p-accent shadow-xs"
                                />
                            </div>

                            {/* Optional comments / message to the invited staff member */}
                            <div>
                                <label className="block text-xs font-semibold text-p-primary mb-1">
                                    {t({ de: 'Nachricht / Notiz an das Teammitglied (optional)', en: 'Note / Message to staff member (optional)' })}
                                </label>
                                <textarea
                                    rows={2}
                                    value={comments}
                                    onChange={e => setComments(e.target.value)}
                                    placeholder={t({ 
                                        de: 'z.B. Herzlich willkommen im Studio-Team! Bitte richten Sie Ihr Passwort ein.', 
                                        en: 'e.g. Welcome to our studio team! Please set up your password.' 
                                    })}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-p-background/50 border border-p-stone text-p-primary focus:outline-none focus:border-p-accent shadow-xs resize-none placeholder:text-p-text/40"
                                />
                            </div>

                            {inviteError && (
                                <div className="p-3 rounded-xl bg-p-warning/10 border border-p-warning/30 text-xs text-p-warning">
                                    {inviteError}
                                </div>
                            )}

                            {inviteSuccess && (
                                <div className="p-3 rounded-xl bg-p-success/10 border border-p-success/30 text-xs text-p-success flex items-start gap-2">
                                    <CheckCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{inviteSuccess}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2.5 rounded-xl border border-p-stone hover:bg-p-stone/30 text-xs font-semibold text-p-text/70 transition"
                                >
                                    {t({ de: 'Abbrechen', en: 'Cancel' })}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isInviting}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-p-primary text-white hover:bg-p-primary/90 text-xs font-semibold shadow-md transition disabled:opacity-50 active:scale-95"
                                >
                                    {isInviting ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 animate-spin text-p-accent" />
                                            <span>{t({ de: 'Wird gesendet...', en: 'Sending...' })}</span>
                                        </>
                                    ) : (
                                        <>
                                            <EnvelopeIcon className="w-4 h-4 text-p-accent" />
                                            <span>{t({ de: 'Einladung jetzt versenden', en: 'Send Invitation Now' })}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    if (isModal) {
        return (
            <div 
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in print:hidden no-print"
                onClick={onClose}
            >
                <div 
                    className="w-full max-w-5xl bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-p-stone max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {content}
                </div>
            </div>
        );
    }

    return content;
};

export default AdminUserManagement;
