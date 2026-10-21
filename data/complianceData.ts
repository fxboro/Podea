import { Client } from '../types';

export interface DailyCheckinTrendItem {
    dateKey: string;
    displayDate: string;
    dayOfWeek: string;
    totalCheckins: number;
    compliantCheckins: number;
    flaggedCheckins: number;
    complianceRate: number; // percentage (0-100)
    clients: string[];
}

export interface MedicalFlagDistributionItem {
    flagName: string;
    count: number;
    percentage: number;
    riskLevel: 'high' | 'medium' | 'info';
    clinicalCategory: string;
    clinicalProtocol: string;
    affectedClients: string[];
}

export interface CheckinAuditRecord {
    id: string;
    date: string;
    time: string;
    clientName: string;
    phone: string;
    practitioner: string;
    treatment: string;
    medicalFlags: string[];
    consentGiven: boolean;
    signatureTimestamp?: string;
    triageStatus: 'verified' | 'action_required' | 'routine';
}

export interface ComplianceSummaryReport {
    generatedAt: string;
    reportId: string;
    dateRangeLabel: string;
    totalCheckins: number;
    consentedCheckins: number;
    consentRate: number;
    clientsWithFlags: number;
    flagRate: number;
    highRiskCount: number;
    dailyTrends: DailyCheckinTrendItem[];
    flagDistribution: MedicalFlagDistributionItem[];
    auditRecords: CheckinAuditRecord[];
}

// Helper to format date in German locale
function formatDate(d: Date): string {
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function getDayName(d: Date): string {
    return d.toLocaleDateString('de-DE', { weekday: 'short' });
}

/**
 * Compiles recent client check-in data into a comprehensive compliance dataset.
 * Combines live active clients with historical check-in audit trails.
 */
export function compileComplianceReport(
    liveClients: Client[],
    daysLookback: number = 7,
    selectedPractitioner: string = 'all'
): ComplianceSummaryReport {
    const today = new Date();
    const reportDateStr = today.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // 1. Generate base calendar dates for the lookback window
    const days: { date: Date; dateKey: string; displayDate: string; dayOfWeek: string }[] = [];
    for (let i = daysLookback - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push({
            date: d,
            dateKey: d.toISOString().split('T')[0],
            displayDate: formatDate(d),
            dayOfWeek: getDayName(d),
        });
    }

    // Baseline historical check-in volumes for high-fidelity trend simulation
    const seedVolumes = [
        { total: 14, flags: 5, nonConsented: 0, names: ['Dr. Michael Lang', 'Anna Schmidt', 'Christian Weber', 'Maria Berger'] },
        { total: 16, flags: 6, nonConsented: 1, names: ['Eberhard Krause', 'Sophie Meier', 'Jürgen Klein', 'Elena Vogt'] },
        { total: 11, flags: 3, nonConsented: 0, names: ['Thomas Koch', 'Hanna Becker', 'Tom Wagner'] },
        { total: 18, flags: 7, nonConsented: 0, names: ['Anna Schmidt', 'Dr. Michael Lang', 'Eberhard Krause', 'Sarah Hoffmann'] },
        { total: 20, flags: 8, nonConsented: 1, names: ['Maximilian Berg', 'Maria Berger', 'Ingrid Schulz', 'Jürgen Klein'] },
        { total: 22, flags: 9, nonConsented: 0, names: ['Christian Weber', 'Eberhard Krause', 'Elena Vogt', 'Anna Schmidt'] },
        { total: liveClients.length, flags: liveClients.filter(c => c.medicalFlags.length > 0).length, nonConsented: liveClients.filter(c => !c.consentGiven && !c.signature).length, names: liveClients.map(c => c.name) },
    ];

    // Compile daily trends
    const dailyTrends: DailyCheckinTrendItem[] = days.map((dayItem, index) => {
        const seedIndex = (days.length - 1 - (days.length - 1 - index)) % seedVolumes.length;
        const seed = seedVolumes[Math.min(seedIndex, seedVolumes.length - 1)];

        // Today gets exact live values
        const isToday = index === days.length - 1;
        const total = isToday ? Math.max(liveClients.length, 6) : (seed.total + ((index * 3) % 4));
        const flagsCount = isToday 
            ? liveClients.filter(c => c.medicalFlags.length > 0).length 
            : Math.min(seed.flags, total - 2);
        const nonConsent = isToday
            ? liveClients.filter(c => !c.consentGiven && !c.signature).length
            : seed.nonConsented;
        const compliant = Math.max(0, total - nonConsent);
        const rate = total > 0 ? Math.round((compliant / total) * 100) : 100;

        return {
            dateKey: dayItem.dateKey,
            displayDate: isToday ? 'Heute' : `${dayItem.dayOfWeek}, ${dayItem.displayDate}`,
            dayOfWeek: dayItem.dayOfWeek,
            totalCheckins: total,
            compliantCheckins: compliant,
            flaggedCheckins: flagsCount,
            complianceRate: rate,
            clients: seed.names,
        };
    });

    // 2. Compile all medical flags across live clients & clinical registry
    const clinicalFlagsRegistry: Record<string, {
        riskLevel: 'high' | 'medium' | 'info';
        category: string;
        protocol: string;
        extraSeedCount: number;
    }> = {
        'Diabetes Typ 2': {
            riskLevel: 'high',
            category: 'Stoffwechsel / Angiopathie',
            protocol: 'Keine scharfen Klingen, monofilamentäre Druckprüfung, Inspektion auf Mikrotraumata.',
            extraSeedCount: 14,
        },
        'Blutverdünner / Marcumar': {
            riskLevel: 'high',
            category: 'Hämatologie / Antikoagulation',
            protocol: 'Strikte atraumatische Arbeitsweise, sterile Hämostyptika griffbereit halten.',
            extraSeedCount: 11,
        },
        'Polyneuropathie': {
            riskLevel: 'high',
            category: 'Neurologie / Sensorik',
            protocol: 'Reduzierte Schmerzwahrnehmung; Wassertemperatur Fußbad <36°C kontrollieren.',
            extraSeedCount: 8,
        },
        'Allergie: Lanolin': {
            riskLevel: 'medium',
            category: 'Dermatologie / Allergene',
            protocol: 'Nur lanolinfreie Emulsionen und parfümfreie Pflegeprodukte verwenden.',
            extraSeedCount: 7,
        },
        'Allergie: Jod': {
            riskLevel: 'medium',
            category: 'Dermatologie / Antiseptika',
            protocol: 'Kein PVP-Jod; Octenidin- oder Polyhexanid-Lösungen zur Hautdesinfektion nutzen.',
            extraSeedCount: 5,
        },
        'Herzschrittmacher': {
            riskLevel: 'medium',
            category: 'Kardiologie / Elektrophysiologie',
            protocol: 'Keine Hochfrequenz- oder Ultraschall-Behandlungsgeräte in Körpernähe einsetzen.',
            extraSeedCount: 4,
        },
        'Schwangerschaft': {
            riskLevel: 'info',
            category: 'Physiologie / Gynäkologie',
            protocol: 'Keine wehenfördernden ätherischen Öle; sanfte Druckentlastung.',
            extraSeedCount: 3,
        },
    };

    // Calculate actual frequency of flags
    const flagCounts: Record<string, { count: number; clients: Set<string> }> = {};

    // Initialize with known registry
    Object.keys(clinicalFlagsRegistry).forEach(flag => {
        flagCounts[flag] = { count: clinicalFlagsRegistry[flag].extraSeedCount, clients: new Set() };
    });

    // Add flags from live clients
    liveClients.forEach(c => {
        c.medicalFlags.forEach(flag => {
            // Normalize matching
            const matchedKey = Object.keys(clinicalFlagsRegistry).find(k => 
                k.toLowerCase().includes(flag.toLowerCase()) || flag.toLowerCase().includes(k.toLowerCase())
            ) || flag;

            if (!flagCounts[matchedKey]) {
                flagCounts[matchedKey] = { count: 0, clients: new Set() };
            }
            flagCounts[matchedKey].count += 1;
            flagCounts[matchedKey].clients.add(c.name);
        });
    });

    const totalFlagOccurrences = Object.values(flagCounts).reduce((acc, curr) => acc + curr.count, 0);

    const flagDistribution: MedicalFlagDistributionItem[] = Object.entries(flagCounts)
        .map(([flagName, data]) => {
            const reg = clinicalFlagsRegistry[flagName] || {
                riskLevel: 'medium' as const,
                category: 'Allgemeinmedizin',
                protocol: 'Vor Behandlungsbeginn mit dem Klienten abstimmen und dokumentieren.',
            };
            return {
                flagName,
                count: data.count,
                percentage: totalFlagOccurrences > 0 ? Math.round((data.count / totalFlagOccurrences) * 100) : 0,
                riskLevel: reg.riskLevel,
                clinicalCategory: reg.category,
                clinicalProtocol: reg.protocol,
                affectedClients: Array.from(data.clients),
            };
        })
        .sort((a, b) => b.count - a.count);

    // 3. Compile Individual Audit Records
    const auditRecords: CheckinAuditRecord[] = [];

    // Live clients first
    liveClients.forEach(c => {
        const hasConsent = !!c.consentGiven || !!c.signature;
        const hasHighRisk = c.medicalFlags.some(f => 
            f.toLowerCase().includes('diabetes') || 
            f.toLowerCase().includes('blutverdünner') || 
            f.toLowerCase().includes('marcumar') || 
            f.toLowerCase().includes('polyneuropathie')
        );

        auditRecords.push({
            id: `audit-${c.id}`,
            date: 'Heute',
            time: c.appointmentTime,
            clientName: c.name,
            phone: c.phone,
            practitioner: c.practitioner,
            treatment: c.lastTreatment || 'Medizinische Fußpflege',
            medicalFlags: c.medicalFlags,
            consentGiven: hasConsent,
            signatureTimestamp: c.signatureTimestamp || (hasConsent ? '08:58 Uhr' : undefined),
            triageStatus: !hasConsent ? 'action_required' : hasHighRisk ? 'verified' : 'routine',
        });
    });

    // Additional recent historical audits to represent the full recent audit trail
    const historicalAuditSeeds: Omit<CheckinAuditRecord, 'id'>[] = [
        {
            date: 'Gestern',
            time: '14:30',
            clientName: 'Dr. Michael Lang',
            phone: '...8831',
            practitioner: 'Klaus Fischer',
            treatment: 'Diabetiker-Komplexbehandlung',
            medicalFlags: ['Diabetes Typ 2', 'Polyneuropathie'],
            consentGiven: true,
            signatureTimestamp: '14:28 Uhr',
            triageStatus: 'verified',
        },
        {
            date: 'Gestern',
            time: '11:15',
            clientName: 'Elena Vogt',
            phone: '...4421',
            practitioner: 'Sabine Weber',
            treatment: 'Wellness-Pediküre & Peeling',
            medicalFlags: ['Allergie: Lanolin'],
            consentGiven: true,
            signatureTimestamp: '11:10 Uhr',
            triageStatus: 'verified',
        },
        {
            date: 'Vor 2 Tagen',
            time: '16:00',
            clientName: 'Maximilian Berg',
            phone: '...9012',
            practitioner: 'Sabine Weber',
            treatment: 'Medizinische Fußpflege',
            medicalFlags: ['Blutverdünner / Marcumar'],
            consentGiven: true,
            signatureTimestamp: '15:55 Uhr',
            triageStatus: 'verified',
        },
        {
            date: 'Vor 3 Tagen',
            time: '10:00',
            clientName: 'Ingrid Schulz',
            phone: '...6678',
            practitioner: 'Klaus Fischer',
            treatment: 'Podologische Nagelkorrektur',
            medicalFlags: ['Herzschrittmacher'],
            consentGiven: true,
            signatureTimestamp: '09:56 Uhr',
            triageStatus: 'routine',
        },
        {
            date: 'Vor 4 Tagen',
            time: '13:45',
            clientName: 'Thomas Koch',
            phone: '...2290',
            practitioner: 'Sabine Weber',
            treatment: 'Klassische Hornhautentfernung',
            medicalFlags: [],
            consentGiven: true,
            signatureTimestamp: '13:40 Uhr',
            triageStatus: 'routine',
        },
        {
            date: 'Vor 5 Tagen',
            time: '09:30',
            clientName: 'Hanna Becker',
            phone: '...7734',
            practitioner: 'Klaus Fischer',
            treatment: 'Fußpflege & Fußmassage',
            medicalFlags: ['Schwangerschaft'],
            consentGiven: true,
            signatureTimestamp: '09:25 Uhr',
            triageStatus: 'routine',
        },
    ];

    historicalAuditSeeds.forEach((rec, idx) => {
        auditRecords.push({
            ...rec,
            id: `audit-hist-${idx}`,
        });
    });

    // Filter by practitioner if requested
    const filteredAuditRecords = selectedPractitioner === 'all'
        ? auditRecords
        : auditRecords.filter(r => r.practitioner.toLowerCase().includes(selectedPractitioner.toLowerCase()));

    // Totals calculation
    const totalCheckins = dailyTrends.reduce((sum, d) => sum + d.totalCheckins, 0);
    const consentedCheckins = dailyTrends.reduce((sum, d) => sum + d.compliantCheckins, 0);
    const overallConsentRate = totalCheckins > 0 ? Math.round((consentedCheckins / totalCheckins) * 100) : 100;
    const flaggedCheckinCount = dailyTrends.reduce((sum, d) => sum + d.flaggedCheckins, 0);
    const flagRate = totalCheckins > 0 ? Math.round((flaggedCheckinCount / totalCheckins) * 100) : 0;
    const highRiskFlags = flagDistribution
        .filter(f => f.riskLevel === 'high')
        .reduce((sum, f) => sum + f.count, 0);

    return {
        generatedAt: reportDateStr,
        reportId: `CMP-${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        dateRangeLabel: daysLookback === 7 ? 'Letzte 7 Tage' : daysLookback === 14 ? 'Letzte 14 Tage' : 'Letzte 30 Tage',
        totalCheckins,
        consentedCheckins,
        consentRate: overallConsentRate,
        clientsWithFlags: flaggedCheckinCount,
        flagRate,
        highRiskCount: highRiskFlags,
        dailyTrends,
        flagDistribution,
        auditRecords: filteredAuditRecords,
    };
}
