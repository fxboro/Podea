import React from 'react';
import { Client } from '../../../types';
import { services } from '../../../data/mockData';
import { useLanguage } from '../../../context/LanguageContext';
import { 
    PrinterIcon, 
    XMarkIcon, 
    CheckCircleIcon, 
    ShieldCheckIcon,
    DocumentTextIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface PrintableInvoiceSummaryProps {
    client: Client;
    upsellSold: boolean;
    checklist: {
        risk: boolean;
        riskTime: string | null;
        kit: boolean;
        kitTime: string | null;
    };
    elapsedSeconds: number;
    plannedMinutes: number;
    treatmentStartTime: string | null;
    treatmentEndTime: string | null;
    onClosePreview?: () => void;
    isModalPreview?: boolean;
}

export const PrintableInvoiceSummary: React.FC<PrintableInvoiceSummaryProps> = ({
    client,
    upsellSold,
    checklist,
    elapsedSeconds,
    plannedMinutes,
    treatmentStartTime,
    treatmentEndTime,
    onClosePreview,
    isModalPreview = false,
}) => {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';
    const serviceObj = services.find(s => s.name === client.lastTreatment);
    const basePrice = serviceObj?.price || 45.0;
    const upsellItem = client.suggestedUpsells[0];
    const upsellPrice = upsellSold && upsellItem ? upsellItem.price : 0;
    const totalBrutto = basePrice + upsellPrice;
    const nettoAmount = totalBrutto / 1.19;
    const vatAmount = totalBrutto - nettoAmount;

    const today = new Date();
    const currentDateStr = today.toLocaleDateString(isEnglish ? 'en-US' : 'de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const dateCode = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const invoiceNumber = `RE-2026-${String(client.id).padStart(4, '0')}-${dateCode}`;

    const formatDuration = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const actualDurationStr = elapsedSeconds > 0 
        ? `${formatDuration(elapsedSeconds)} ${isEnglish ? 'min.' : 'Min.'}` 
        : `${plannedMinutes}:00 ${isEnglish ? 'min.' : 'Min.'}`;

    const handlePrint = () => {
        window.print();
    };

    const documentContent = (
        <div className="bg-white text-gray-900 p-8 sm:p-12 max-w-4xl mx-auto shadow-sm print:shadow-none print:p-0 font-sans print:text-black">
            {/* Header: Practice Branding & Document Metadata */}
            <div className="border-b-2 border-gray-900 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                            PODEA
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-gray-100 border border-gray-300 text-gray-700">
                            {t({ de: 'Praxis & Fachinstitut', en: 'Clinic & Specialist Practice' })}
                        </span>
                    </div>
                    <p className="text-xs font-serif italic text-gray-600 mt-1">
                        {t({ 
                            de: 'Institut für medizinische Podologie & apparative Fußtherapie', 
                            en: 'Institute for Medical Podiatry & Advanced Foot Therapy' 
                        })}
                    </p>
                    <div className="text-[11px] text-gray-500 mt-3 space-y-0.5 font-light">
                        <p>Friedrichstraße 108 • 10117 Berlin-Mitte</p>
                        <p>Tel: +49 (0)30 89201-0 • Fax: -89 • E-Mail: empfang@podea.de</p>
                        <p>USt-IdNr.: DE318920412 • St.-Nr.: 34/281/90124 • IK: 591102941</p>
                    </div>
                </div>

                <div className="sm:text-right bg-gray-50 print:bg-transparent p-4 sm:p-0 rounded-xl border sm:border-0 border-gray-200">
                    <span className="inline-block px-2.5 py-1 bg-gray-900 text-white print:bg-black print:text-white text-[10px] font-bold tracking-wider uppercase rounded mb-2">
                        {t({ de: 'Behandlungsnachweis & Rechnung', en: 'Treatment Certificate & Invoice' })}
                    </span>
                    <h2 className="font-mono text-sm sm:text-base font-bold text-gray-900">
                        {invoiceNumber}
                    </h2>
                    <div className="text-xs text-gray-600 mt-2 space-y-0.5">
                        <p><span className="text-gray-400">{t({ de: 'Datum:', en: 'Date:' })}</span> <strong className="text-gray-900">{currentDateStr}</strong></p>
                        <p><span className="text-gray-400">{t({ de: 'Terminzeit:', en: 'Time:' })}</span> <strong className="text-gray-900">{client.appointmentTime} {isEnglish ? '' : 'Uhr'}</strong></p>
                        <p><span className="text-gray-400">{t({ de: 'Behandler/in:', en: 'Practitioner:' })}</span> <strong className="text-gray-900">{client.practitioner}</strong></p>
                    </div>
                </div>
            </div>

            {/* Client / Patient Information Bar */}
            <div className="bg-gray-50 print:bg-gray-50/70 border border-gray-200 rounded-xl p-4 sm:p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs page-break-inside-avoid">
                <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">
                        {t({ de: 'Patient / Klient', en: 'Patient / Client' })}
                    </span>
                    <p className="text-base font-serif font-bold text-gray-900">{client.name}</p>
                    <p className="text-gray-500 font-mono text-[11px] mt-0.5">{t({ de: 'Klienten-ID:', en: 'Client ID:' })} KND-{String(client.id).padStart(5, '0')}</p>
                    <p className="text-gray-500 text-[11px]">{t({ de: 'Mobil:', en: 'Mobile:' })} {client.phone}</p>
                </div>

                <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">
                        {t({ de: 'Anamnese & Risikoklasse', en: 'Anamnesis & Risk Class' })}
                    </span>
                    {client.medicalFlags && client.medicalFlags.length > 0 ? (
                        <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[11px] font-semibold">
                                ⚠️ {client.medicalFlags.join(', ')}
                            </span>
                            <p className="text-[10px] text-gray-500">
                                {t({ de: 'Besondere Sorgfaltspflicht gem. PodG', en: 'Clinical duty of care pursuant to PodG' })}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-700 font-medium">
                            {t({ de: 'Regulärer Befund (Keine Risikofaktoren)', en: 'Standard clinical record (No risk flags)' })}
                        </p>
                    )}
                </div>

                <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">
                        {t({ de: 'Dokumentationsstatus', en: 'Documentation Status' })}
                    </span>
                    <p className="font-semibold text-gray-900">
                        {client.status === 'done' 
                            ? t({ de: '✓ Vollständig abgeschlossen', en: '✓ Fully Completed' }) 
                            : t({ de: 'In Behandlung / Verifiziert', en: 'In Treatment / Verified' })}
                    </p>
                    <p className="text-gray-500 text-[10px]">
                        {t({ de: 'Rechtskonform nach § 630f BGB & DSGVO', en: 'Legally compliant under § 630f BGB & GDPR' })}
                    </p>
                </div>
            </div>

            {/* Itemized Services & Invoicing Table */}
            <div className="mb-8 page-break-inside-avoid">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
                    <span>{t({ de: '1. Erbrachte Leistungen & Produkte', en: '1. Provided Services & Products' })}</span>
                    <span className="font-mono text-[11px] text-gray-500 font-normal">{t({ de: 'Währung: EUR (€)', en: 'Currency: EUR (€)' })}</span>
                </h3>

                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-gray-300 text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
                            <th className="py-2.5 px-3">{t({ de: 'Pos.', en: 'Item' })}</th>
                            <th className="py-2.5 px-3">{t({ de: 'Bezeichnung der Leistung', en: 'Service / Product Description' })}</th>
                            <th className="py-2.5 px-3 text-center">{t({ de: 'Dauer (Soll/Ist)', en: 'Duration (Est./Actual)' })}</th>
                            <th className="py-2.5 px-3 text-center">{t({ de: 'MwSt.', en: 'VAT' })}</th>
                            <th className="py-2.5 px-3 text-right">{t({ de: 'Einzelpreis', en: 'Unit Price' })}</th>
                            <th className="py-2.5 px-3 text-right">{t({ de: 'Gesamt', en: 'Total' })}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="py-3 px-3 font-mono font-bold text-gray-700">01</td>
                            <td className="py-3 px-3">
                                <span className="font-semibold text-gray-900 block">{client.lastTreatment}</span>
                                <span className="text-[11px] text-gray-500 font-light">
                                    {t({ 
                                        de: 'Fachgerechte podologische Behandlung inkl. Anamnese, Nagelschnitt und Hautabtragung.', 
                                        en: 'Professional podiatric treatment incl. anamnesis, nail treatment, and hyperkeratosis removal.' 
                                    })}
                                </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-gray-700">
                                {plannedMinutes} {isEnglish ? 'min.' : 'Min.'} / <strong className="text-gray-900">{actualDurationStr}</strong>
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-gray-600">19%</td>
                            <td className="py-3 px-3 text-right font-mono">{basePrice.toFixed(2)} €</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">{basePrice.toFixed(2)} €</td>
                        </tr>

                        {upsellSold && upsellItem && (
                            <tr className="bg-emerald-50/40 print:bg-transparent">
                                <td className="py-3 px-3 font-mono font-bold text-gray-700">02</td>
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-gray-900">{upsellItem.name}</span>
                                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-medium print:border print:border-gray-400">
                                            {upsellItem.category === 'product' 
                                                ? t({ de: 'Pflegeprodukt', en: 'Care Product' }) 
                                                : t({ de: 'Zusatzleistung', en: 'Add-on Service' })}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-gray-500 font-light block">
                                        {upsellItem.reason}
                                    </span>
                                </td>
                                <td className="py-3 px-3 text-center text-gray-400 font-mono">—</td>
                                <td className="py-3 px-3 text-center font-mono text-gray-600">19%</td>
                                <td className="py-3 px-3 text-right font-mono">{upsellItem.price.toFixed(2)} €</td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">{upsellItem.price.toFixed(2)} €</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Subtotals & Total Summary Box */}
                <div className="mt-4 flex justify-end">
                    <div className="w-full sm:w-72 bg-gray-50 print:bg-transparent border border-gray-200 rounded-xl p-4 text-xs space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>{t({ de: 'Nettobetrag:', en: 'Net Amount:' })}</span>
                            <span className="font-mono">{nettoAmount.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>{t({ de: 'Gesetzliche MwSt. (19%):', en: 'Statutory VAT (19%):' })}</span>
                            <span className="font-mono">{vatAmount.toFixed(2)} €</span>
                        </div>
                        <div className="border-t-2 border-gray-900 pt-2 flex justify-between items-baseline font-bold text-gray-900">
                            <span className="text-sm uppercase tracking-wide">{t({ de: 'Rechnungsbetrag:', en: 'Invoice Total:' })}</span>
                            <span className="text-lg font-mono font-bold text-gray-900">{totalBrutto.toFixed(2)} €</span>
                        </div>
                        <p className="text-[10px] text-gray-500 pt-1 text-right">
                            {t({ de: 'Zahlungsart: Bar / EC-Cash / Auf Rechnung', en: 'Payment: Cash / Debit / Invoice' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Hygiene & Safety Checklist Audit (Patientenrechtegesetz § 630f BGB) */}
            <div className="mb-8 border border-gray-200 rounded-xl p-4 bg-gray-50/60 print:bg-transparent page-break-inside-avoid">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2.5 flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-700" />
                    <span>{t({ de: '2. Hygiene- & Sicherheits-Protokoll (Sterilgutdokumentation)', en: '2. Hygiene & Safety Protocol (Sterile Supply Log)' })}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-800">{t({ de: 'Anamnese- & Risikoprüfung:', en: 'Medical History & Risk Assessment:' })}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                checklist.risk ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                                {checklist.risk ? t({ de: '✓ Vollständig', en: '✓ Complete' }) : t({ de: 'Ausstehend', en: 'Pending' })}
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                            {t({ de: 'Hautinspektion & Kontraindikations-Ausschluss durchgeführt um:', en: 'Skin inspection & contraindication check performed at:' })} <strong>{checklist.riskTime || '08:58'}</strong>
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-800">{t({ de: 'Instrumenten-Sterilbesteck:', en: 'Sterile Instrument Set:' })}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                checklist.kit ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                                {checklist.kit ? t({ de: '✓ Freigegeben', en: '✓ Cleared' }) : t({ de: 'Ausstehend', en: 'Pending' })}
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                            {t({ de: 'Sterilisationssiegel & Chargenprüfung intakt:', en: 'Sterilization seal & batch audit intact:' })} <strong>{checklist.kitTime || '08:59'}</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Clinical Practitioner Notes & Findings */}
            <div className="mb-8 page-break-inside-avoid">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <DocumentTextIcon className="w-4 h-4 text-gray-700" />
                    <span>{t({ de: '3. Behandlungsbefund & Verlaufsdokumentation', en: '3. Clinical Findings & Treatment Progress Log' })}</span>
                </h3>
                {client.notes && client.notes.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 text-xs">
                        {client.notes.map((note, index) => (
                            <div key={index} className="flex items-start gap-2 text-gray-800 border-b border-gray-100 last:border-0 pb-1.5 last:pb-0">
                                <span className="text-gray-400 font-mono text-[10px] mt-0.5">#{index + 1}</span>
                                <span className="leading-relaxed">{note}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                        {t({ 
                            de: 'Keine abweichenden pathologischen Auffälligkeiten vermerkt. Regelgerechter Behandlungsverlauf.', 
                            en: 'No anomalous pathological findings noted. Standard treatment course.' 
                        })}
                    </p>
                )}
            </div>

            {/* Legal Consent, Patient Signature & Practitioner Stamp */}
            <div className="border-t-2 border-gray-900 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 page-break-inside-avoid">
                {/* Patient / Client Digital Signature Box */}
                <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/50 print:bg-transparent">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600">
                            {t({ de: 'Unterschrift Patient/in (DSGVO Art. 7 & 9)', en: 'Patient Signature (GDPR Art. 7 & 9)' })}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {t({ de: 'eIDAS Verifiziert', en: 'eIDAS Verified' })}
                        </span>
                    </div>

                    <div className="h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2 mb-2">
                        {client.signature ? (
                            <img 
                                src={client.signature} 
                                alt={t({ de: `Signatur von ${client.name}`, en: `Signature of ${client.name}` })} 
                                className="h-16 max-w-full object-contain filter contrast-150"
                            />
                        ) : (
                            <div className="text-center">
                                <span className="font-serif italic text-gray-700 text-sm">
                                    {client.name}
                                </span>
                                <span className="block text-[9px] text-gray-400 font-mono">
                                    {t({ de: '[Digital am Check-in Terminal erfasst]', en: '[Recorded digitally at check-in terminal]' })}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                        <span>{t({ de: 'Datum:', en: 'Date:' })} {currentDateStr}</span>
                        <span>SHA256: eIDAS-POD-{client.id}</span>
                    </div>
                </div>

                {/* Practitioner Stamp & Signature */}
                <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/50 print:bg-transparent flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600">
                                {t({ de: 'Behandler/in & Praxisstempel', en: 'Practitioner & Clinic Stamp' })}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">
                                {t({ de: 'Zertifizierte Podologie', en: 'Certified Podology' })}
                            </span>
                        </div>
                        <div className="h-20 bg-white border border-gray-200 rounded-lg flex flex-col justify-end p-2.5 mb-2 relative overflow-hidden">
                            {/* Watermark / Stamp Outline */}
                            <div className="absolute top-1 right-2 border-2 border-dashed border-gray-300/80 rounded px-2 py-1 text-[9px] font-mono uppercase text-gray-400 transform -rotate-6">
                                {t({ de: 'Podea Praxis • Berlin', en: 'Podea Clinic • Berlin' })}
                            </div>
                            <div className="border-b border-gray-400 pb-1">
                                <span className="font-serif italic text-gray-800 text-sm">
                                    {client.practitioner}
                                </span>
                            </div>
                            <span className="text-[9px] text-gray-400 mt-1 font-mono">
                                {t({ de: 'Staatlich anerkannte/r Podologe/in', en: 'State-certified Podiatrist' })}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                        <span>Berlin, {currentDateStr}</span>
                        <span>{t({ de: 'Stempel & Unterschrift', en: 'Stamp & Signature' })}</span>
                    </div>
                </div>
            </div>

            {/* Document Footer Disclaimer */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 font-light gap-2">
                <span>{t({ de: 'Dokumentation & Rechnung nach § 630f BGB • Revisionssicher archiviert', en: 'Documentation & invoice acc. to § 630f German Civil Code • Audit-proof archived' })}</span>
                <span>{t({ de: 'Podea Studio System v2.6 • Seite 1 von 1', en: 'Podea Studio System v2.6 • Page 1 of 1' })}</span>
            </div>
        </div>
    );

    // If displayed in preview modal mode on screen
    if (isModalPreview) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-p-primary/70 backdrop-blur-sm overflow-y-auto no-print">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in border border-p-stone">
                    {/* Modal Toolbar Header */}
                    <div className="px-5 py-4 bg-p-surface border-b border-p-stone flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-p-primary text-white">
                                <PrinterIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-p-primary text-base">
                                    {t({ de: 'Dokumenten-Vorschau: Behandlungsbeleg & Rechnung', en: 'Document Preview: Treatment Receipt & Invoice' })}
                                </h3>
                                <p className="text-xs text-p-text/60">
                                    {t({ de: 'Kunde', en: 'Client' })}: {client.name} • {t({ de: 'Rechnungs-Nr', en: 'Invoice No' })}: {invoiceNumber}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-p-primary hover:bg-p-primary/90 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 min-h-[40px]"
                            >
                                <PrinterIcon className="w-4 h-4 text-p-accent" />
                                <span>{t({ de: 'Jetzt drucken / PDF', en: 'Print Now / PDF' })}</span>
                            </button>
                            {onClosePreview && (
                                <button
                                    onClick={onClosePreview}
                                    className="p-2 text-p-text/60 hover:text-p-primary hover:bg-p-stone/40 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                                    title={t({ de: 'Schließen', en: 'Close' })}
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Document Container */}
                    <div className="overflow-y-auto p-4 sm:p-8 bg-gray-100 flex-1">
                        <div className="shadow-lg rounded-xl overflow-hidden bg-white">
                            {documentContent}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default rendered as dedicated print-only component
    return (
        <div id="printable-invoice" className="hidden print:block print:w-full print:m-0 print:p-0">
            {documentContent}
        </div>
    );
};

export default PrintableInvoiceSummary;
