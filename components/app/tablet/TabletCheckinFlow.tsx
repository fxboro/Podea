
import React, { useState, useEffect, useRef } from 'react';
import { View, Client } from '../../../types';
import Button from '../../ui/Button';
import { CheckCircleIcon, PencilIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import SignatureCanvas from 'react-signature-canvas';
import { analyzeHealthNotes } from '../../../services/geminiService';
import LanguageToggle from '../../ui/LanguageToggle';
import { useLanguage } from '../../../context/LanguageContext';

const FooterSecurity: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-p-text/50 uppercase tracking-widest">
            <LockClosedIcon className="w-3 h-3 text-p-accent" />
            <span>{t({ de: "End-to-End Verschlüsselung | ISO 27001 Zertifiziert", en: "End-to-End Encryption | ISO 27001 Certified" })}</span>
        </div>
    );
};

const WelcomeScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    const { t } = useLanguage();
    return (
        <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-serif text-p-primary mb-6 tracking-tight">
                {t({ de: "Willkommen bei", en: "Welcome to" })}
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-p-accent mb-16 tracking-widest uppercase">'Schwesterherz'</h2>
            <Button onClick={onNext} variant="primary" className="px-12 py-4 text-lg bg-p-primary hover:bg-p-primary/90 shadow-2xl">
                {t({ de: "Check-in starten", en: "Start Check-in" })}
            </Button>
            <FooterSecurity />
        </div>
    );
};

const PhoneInputScreen: React.FC<{ onNext: (phone: string) => void }> = ({ onNext }) => {
    const { t } = useLanguage();
    const [phone, setPhone] = useState('');
    
    const handleKeyClick = (key: string) => {
        if (key === 'del') {
            setPhone(p => p.slice(0, -1));
        } else if (phone.length < 11) {
            setPhone(p => p + key);
        }
    };

    return (
        <div className="text-center w-full max-w-sm animate-fade-in">
            <h2 className="text-2xl font-serif text-p-primary mb-2">
                {t({ de: "Ihre Mobilfunknummer", en: "Your Mobile Phone Number" })}
            </h2>
            <p className="text-p-text/60 mb-6 font-light">
                {t({ de: "Bitte geben Sie Ihre Nummer zur Identifizierung ein.", en: "Please enter your number for check-in identification." })}
            </p>
            
            <div className="h-14 sm:h-16 w-full border-b-2 border-p-primary/10 flex items-center justify-center text-3xl sm:text-4xl tracking-[0.2em] font-serif text-p-primary mb-6 sm:mb-8">
                {phone}
                <span className="animate-pulse text-p-accent">|</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
                {'123456789'.split('').map(k => (
                    <button 
                        key={k} 
                        onClick={() => handleKeyClick(k)} 
                        className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-full border border-p-primary/10 text-xl sm:text-2xl font-light text-p-primary hover:bg-p-primary hover:text-white hover:border-transparent transition-all duration-300 focus:outline-none active:scale-95 flex items-center justify-center select-none"
                    >
                        {k}
                    </button>
                ))}
                <div/>
                <button 
                    onClick={() => handleKeyClick('0')} 
                    className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-full border border-p-primary/10 text-xl sm:text-2xl font-light text-p-primary hover:bg-p-primary hover:text-white hover:border-transparent transition-all duration-300 focus:outline-none active:scale-95 flex items-center justify-center select-none"
                >
                    0
                </button>
                <button 
                    onClick={() => handleKeyClick('del')} 
                    className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-full text-lg sm:text-xl font-medium text-p-warning/70 hover:text-p-warning hover:bg-p-warning/5 transition-all duration-300 focus:outline-none flex items-center justify-center select-none active:scale-95"
                    aria-label="Delete"
                >
                    &larr;
                </button>
            </div>
            
            <Button disabled={phone.length < 4} onClick={() => onNext(phone)} variant="primary" className="w-full text-base sm:text-lg py-3.5 sm:py-4 shadow-lg disabled:opacity-30">
                {t({ de: "Weiter", en: "Continue" })}
            </Button>
            <FooterSecurity />
        </div>
    );
};

const RegistrationScreen: React.FC<{ onNext: (name: string) => void }> = ({ onNext }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');

    return (
        <div className="text-center w-full max-w-sm animate-fade-in">
             <h2 className="text-2xl font-serif text-p-primary mb-2">
                 {t({ de: "Neu bei uns?", en: "First time with us?" })}
             </h2>
             <p className="text-p-text/60 mb-8 font-light">
                 {t({ 
                     de: "Wir konnten Ihre Nummer nicht finden. Bitte geben Sie Ihren Namen ein.", 
                     en: "We couldn't find your number. Please enter your name to register." 
                 })}
             </p>
             
             <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder={t({ de: "Ihr Vor- und Nachname", en: "First and Last Name" })}
                className="w-full h-16 bg-white border-b-2 border-p-primary/20 text-center text-2xl font-serif text-p-primary focus:outline-none focus:border-p-accent mb-12 placeholder:text-p-text/20"
             />

             <Button disabled={name.length < 2} onClick={() => onNext(name)} variant="primary" className="w-full text-lg py-4 shadow-lg disabled:opacity-30">
                 {t({ de: "Registrieren & Weiter", en: "Register & Continue" })}
             </Button>
             <FooterSecurity />
        </div>
    );
};

const ConfirmationScreen: React.FC<{ title: string; subtitle: string; onNext: () => void; buttonText: string }> = ({ title, subtitle, onNext, buttonText }) => (
    <div className="text-center max-w-lg animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-serif text-p-primary mb-6">{title}</h2>
        <p className="text-p-text/70 mb-12 text-lg font-light leading-relaxed">{subtitle}</p>
        <Button onClick={onNext} variant="primary" className="px-12 py-4 text-lg shadow-xl">{buttonText}</Button>
        <FooterSecurity />
    </div>
);

const ConsentScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    const { t } = useLanguage();
    const [consents, setConsents] = useState({
        dataPrivacy: false,
        medicalData: false,
    });

    const allChecked = consents.dataPrivacy && consents.medicalData;

    return (
        <div className="text-center max-w-lg animate-fade-in w-full">
            <h2 className="text-3xl font-serif text-p-primary mb-2">
                {t({ de: "Datenschutz & Einwilligung", en: "Privacy & Consent" })}
            </h2>
            <p className="text-p-text/70 mb-8 font-light">
                {t({ de: "Bitte bestätigen Sie die rechtlichen Grundlagen für Ihre Behandlung.", en: "Please confirm the legal frameworks for your treatment." })}
            </p>
            
            <div className="space-y-4 mb-10 text-left">
                <label className="flex items-start gap-4 p-4 rounded-xl border border-p-stone/50 hover:border-p-primary/30 hover:bg-p-surface transition-all cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={consents.dataPrivacy}
                        onChange={() => setConsents(prev => ({...prev, dataPrivacy: !prev.dataPrivacy}))}
                        className="mt-1 w-5 h-5 text-p-primary border-p-stone rounded focus:ring-p-accent"
                    />
                    <div className="text-sm text-p-primary">
                        <span className="font-bold block mb-1">
                            {t({ de: "Datenschutzerklärung (DSGVO)", en: "Privacy Policy (GDPR)" })}
                        </span>
                        <span className="text-p-text/70 font-light">
                            {t({ 
                                de: "Ich stimme der Verarbeitung meiner personenbezogenen Daten gemäß der Datenschutzerklärung zu.", 
                                en: "I agree to the processing of my personal data in accordance with the privacy policy." 
                            })}
                        </span>
                    </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-xl border border-p-stone/50 hover:border-p-primary/30 hover:bg-p-surface transition-all cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={consents.medicalData}
                        onChange={() => setConsents(prev => ({...prev, medicalData: !prev.medicalData}))}
                        className="mt-1 w-5 h-5 text-p-primary border-p-stone rounded focus:ring-p-accent"
                    />
                    <div className="text-sm text-p-primary">
                        <span className="font-bold block mb-1">
                            {t({ de: "Gesundheitsdaten & Schweigepflicht", en: "Health Data & Confidentiality" })}
                        </span>
                        <span className="text-p-text/70 font-light">
                            {t({ 
                                de: "Ich willige ein, dass gesundheitsbezogene Daten für meine Behandlung dokumentiert werden.", 
                                en: "I consent to the recording of health-related data for my podiatric treatment." 
                            })}
                        </span>
                    </div>
                </label>
            </div>

            <Button disabled={!allChecked} onClick={onNext} variant="primary" className="w-full py-4 shadow-xl disabled:opacity-50">
                {t({ de: "Zur Unterschrift", en: "Proceed to Signature" })}
            </Button>
            <FooterSecurity />
        </div>
    );
};

const SignatureScreen: React.FC<{ 
    clientName: string; 
    onNext: (signatureDataUrl: string) => void; 
    isProcessing?: boolean 
}> = ({ clientName, onNext, isProcessing }) => {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';
    const [signed, setSigned] = useState(false);
    const sigPad = useRef<SignatureCanvas>(null);
    const currentDate = new Date().toLocaleDateString(isEnglish ? 'en-US' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const handleClear = () => {
        sigPad.current?.clear();
        setSigned(false);
    };

    const handleConfirm = () => {
        if (!sigPad.current || sigPad.current.isEmpty()) return;
        const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
        onNext(dataUrl);
    };

    return (
        <div className="text-center max-w-lg animate-fade-in w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-p-accent/15 text-p-primary text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldCheckIcon className="w-4 h-4 text-p-accent" />
                <span>{t({ de: "Rechtsgültige Bestätigung", en: "Legally Binding Confirmation" })}</span>
            </div>

            <h2 className="text-3xl font-serif text-p-primary mb-2">
                {t({ de: "Digitale Einwilligung", en: "Digital Consent" })}
            </h2>
            <p className="text-p-text/70 mb-6 font-light text-sm">
                {t({ 
                    de: "Bitte bestätigen Sie die DSGVO- und Behandlungsvereinbarung mit Ihrer Unterschrift.", 
                    en: "Please confirm the GDPR and treatment agreement with your digital signature." 
                })}
            </p>

            {/* Document summary preview box */}
            <div className="bg-p-surface border border-p-stone/70 rounded-xl p-4 mb-6 text-left text-xs space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-p-primary font-semibold border-b border-p-stone/60 pb-1.5">
                    <span className="font-serif">
                        {t({ de: "Einwilligung & Behandlungsvertrag", en: "Consent & Treatment Agreement" })}
                    </span>
                    <span className="font-mono text-[10px] text-p-text/60">DSGVO / GDPR Art. 7 & 9</span>
                </div>
                <p className="text-p-text/80 text-[11px] leading-relaxed">
                    {t({ 
                        de: `Hiermit willige ich (${clientName}) in die Verarbeitung meiner personenbezogenen Daten sowie gesundheitlicher Angaben zum Zweck der fachgerechten Behandlung und Dokumentation ein.`,
                        en: `I hereby (${clientName}) consent to the processing of my personal and health-related data for professional podiatric treatment and clinical documentation.`
                    })}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-p-stone/40 text-[10px] text-p-text/60 font-mono">
                    <span>{t({ de: "Unterzeichner/in", en: "Signer" })}: <strong>{clientName}</strong></span>
                    <span>{t({ de: "Datum", en: "Date" })}: <strong>{currentDate}</strong></span>
                </div>
            </div>

            {/* Signature Canvas Box */}
            <div className="relative w-full h-44 sm:h-56 rounded-2xl border-2 mb-4 bg-white border-p-primary/20 overflow-hidden shadow-inner focus-within:border-p-primary transition-all">
                <SignatureCanvas 
                    ref={sigPad}
                    penColor="#1F2A37"
                    minWidth={1.5}
                    maxWidth={3.2}
                    velocityFilterWeight={0.7}
                    canvasProps={{
                        className: 'w-full h-full cursor-crosshair touch-none select-none'
                    }}
                    onEnd={() => setSigned(true)}
                />

                {/* Signature Guide Line & Watermark */}
                {!signed ? (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-p-text/40 p-2">
                        <PencilIcon className="w-6 h-6 sm:w-7 sm:h-7 mb-1.5 opacity-40 text-p-accent"/>
                        <span className="text-[11px] sm:text-xs uppercase tracking-widest font-medium text-center">
                            {t({ de: "Hier mit Finger oder Stift unterschreiben", en: "Sign here with finger or stylus" })}
                        </span>
                        <div className="absolute bottom-4 left-6 right-6 sm:left-10 sm:right-10 flex items-center gap-2 border-b border-dashed border-p-stone text-p-text/30 pb-0.5">
                            <span className="text-xs font-bold text-p-primary/30">✕</span>
                            <span className="text-[9px] sm:text-[10px]">
                                {t({ de: "Unterschrift des Kunden / der Kundin", en: "Client Signature" })}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="absolute top-2.5 right-2.5 pointer-events-none flex items-center gap-1.5 bg-p-success/10 text-p-success border border-p-success/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        {t({ de: "Unterschrift erfasst", en: "Signature Captured" })}
                    </div>
                )}
            </div>

            {/* Legal Security Seal */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-p-text/50 font-mono mb-6 px-1 gap-1">
                <span className="flex items-center gap-1">
                    <LockClosedIcon className="w-3 h-3 text-p-success" />
                    {t({ de: "eIDAS konform • 256-bit SSL", en: "eIDAS compliant • 256-bit SSL" })}
                </span>
                <span>{t({ de: "Zeitstempel revisionssicher", en: "Audit-proof timestamp" })}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                <Button 
                    disabled={!signed || isProcessing} 
                    onClick={handleClear} 
                    variant="secondary" 
                    className="w-full sm:w-1/3 py-3 sm:py-4 text-xs sm:text-sm min-h-[44px]"
                >
                    {t({ de: "Löschen", en: "Clear" })}
                </Button>
                <Button 
                    disabled={!signed || isProcessing} 
                    onClick={handleConfirm} 
                    variant="primary" 
                    className="w-full sm:w-2/3 py-3 sm:py-4 shadow-xl disabled:opacity-50 text-xs sm:text-sm font-medium min-h-[44px]"
                >
                    {isProcessing 
                        ? t({ de: 'Wird verarbeitet...', en: 'Processing...' }) 
                        : t({ de: 'Einwilligung bestätigen', en: 'Confirm Consent' })}
                </Button>
            </div>
            <FooterSecurity />
        </div>
    );
};

const HealthInputScreen: React.FC<{ onNext: (details: string) => void }> = ({ onNext }) => {
    const { t } = useLanguage();
    const [details, setDetails] = useState('');

    return (
        <div className="text-center max-w-lg animate-fade-in w-full">
            <h2 className="text-3xl font-serif text-p-primary mb-2">
                {t({ de: "Änderungen erfassen", en: "Record Health Updates" })}
            </h2>
            <p className="text-p-text/70 mb-8 font-light">
                {t({ 
                    de: "Bitte beschreiben Sie kurz die gesundheitlichen Änderungen.", 
                    en: "Please briefly describe any health changes or new medications." 
                })}
            </p>
            
            <textarea 
                className="w-full h-40 bg-white border border-p-stone rounded-xl p-6 text-lg text-p-primary focus:ring-2 focus:ring-p-accent focus:border-transparent outline-none resize-none mb-8 shadow-inner"
                placeholder={t({ 
                    de: "z.B. Neue Medikamente, Schwangerschaft, OP...", 
                    en: "e.g. New medications, blood thinners, surgery, pregnancy..." 
                })}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
            />

            <Button disabled={details.length < 3} onClick={() => onNext(details)} variant="primary" className="w-full py-4 shadow-xl">
                {t({ de: "Speichern & Weiter", en: "Save & Continue" })}
            </Button>
            <FooterSecurity />
        </div>
    );
};

const HealthQuestionScreen: React.FC<{ onNext: () => void; onYes: () => void }> = ({ onNext, onYes }) => {
    const { t } = useLanguage();
    return (
        <div className="text-center max-w-lg animate-fade-in">
            <h2 className="text-3xl font-serif text-p-primary mb-6">
                {t({ de: "Gesundheits-Update", en: "Health Update" })}
            </h2>
            <p className="text-p-text/70 mb-12 text-lg font-light leading-relaxed">
                {t({ 
                    de: "Haben sich seit Ihrem letzten Besuch relevante gesundheitliche Änderungen ergeben (z.B. neue Medikamente, Allergien, Operationen)?", 
                    en: "Have there been any relevant health changes since your last visit (e.g., new medications, blood thinners, surgeries)?" 
                })}
            </p>
            <div className="flex flex-col gap-4">
                <Button onClick={onNext} variant="secondary" className="w-full py-4 border-p-primary/20 hover:border-p-primary">
                    {t({ de: "Nein, keine Änderungen", en: "No, no changes" })}
                </Button>
                <Button onClick={onYes} variant="primary" className="w-full py-4 bg-p-primary hover:bg-p-primary/90">
                    {t({ de: "Ja, es gibt Änderungen", en: "Yes, there are updates" })}
                </Button>
            </div>
            <FooterSecurity />
        </div>
    );
};

const ArrivalScreen: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="text-center max-w-lg animate-fade-in">
            <div className="inline-block p-6 rounded-full bg-p-success/10 text-p-success mb-8">
                <CheckCircleIcon className="w-20 h-20"/>
            </div>
            <h2 className="text-4xl font-serif text-p-primary mb-6">
                {t({ de: "Vielen Dank", en: "Thank You" })}
            </h2>
            <p className="text-p-text/70 text-lg font-light leading-relaxed">
                {t({ 
                    de: "Sie sind erfolgreich angemeldet.", 
                    en: "You are checked in successfully." 
                })} <br/>
                {t({ 
                    de: "Bitte nehmen Sie kurz Platz.", 
                    en: "Please take a seat in the waiting area." 
                })} <br/>
                {t({ 
                    de: "Ihr/e Behandler/in ist informiert.", 
                    en: "Your practitioner has been notified." 
                })}
            </p>
            <FooterSecurity />
        </div>
    );
};


type Step = 'welcome' | 'phone' | 'registration' | 'recognition' | 'consent' | 'signature' | 'health' | 'healthInput' | 'arrival';

const TabletCheckinFlow: React.FC<{ setView: (view: View) => void; onCompleteCheckin: (client: Partial<Client>) => void }> = ({ setView, onCompleteCheckin }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState<Step>('welcome');
    const [clientData, setClientData] = useState<{phone: string, name: string, notes: string[]}>({phone: '', name: 'Anna Schmidt', notes: []});
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (step === 'arrival') {
            const timer = setTimeout(() => {
                setStep('welcome');
                setClientData({phone: '', name: 'Anna Schmidt', notes: []}); // Reset
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [step]);
    
    const handlePhoneNext = (phone: string) => {
        setClientData(prev => ({ ...prev, phone }));
        if (phone.endsWith('0000')) {
            // New user simulation if number ends in 0000
            setStep('registration');
        } else {
            // Existing user (Anna)
            setStep('recognition');
        }
    };

    const handleRegistrationNext = (name: string) => {
        setClientData(prev => ({ ...prev, name }));
        setStep('recognition');
    };

    const handleHealthInputNext = (details: string) => {
        setClientData(prev => ({ 
            ...prev, 
            notes: [...prev.notes, t({ de: `Gesundheits-Update: ${details}`, en: `Health update: ${details}` })] 
        }));
        setStep('consent');
    };

    const handleSignatureNext = async (signatureDataUrl: string) => {
        setIsProcessing(true);
        const timestamp = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        try {
            const medicalFlags = await analyzeHealthNotes(clientData.notes);
            
            onCompleteCheckin({
                name: clientData.name,
                phone: clientData.phone,
                notes: clientData.notes,
                medicalFlags: medicalFlags,
                signature: signatureDataUrl,
                signatureTimestamp: timestamp,
                consentGiven: true
            });
            setStep('arrival');
        } catch (error) {
            console.error("Error during check-in processing:", error);
            // Fallback in case of error
            onCompleteCheckin({
                name: clientData.name,
                phone: clientData.phone,
                notes: clientData.notes,
                medicalFlags: [],
                signature: signatureDataUrl,
                signatureTimestamp: timestamp,
                consentGiven: true
            });
            setStep('arrival');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'welcome':
                return <WelcomeScreen onNext={() => setStep('phone')} />;
            case 'phone':
                return <PhoneInputScreen onNext={handlePhoneNext} />;
            case 'registration':
                return <RegistrationScreen onNext={handleRegistrationNext} />;
            case 'recognition':
                return (
                    <ConfirmationScreen 
                        title={t({ 
                            de: `Willkommen, ${clientData.name.split(' ')[0]}.`, 
                            en: `Welcome, ${clientData.name.split(' ')[0]}.` 
                        })} 
                        subtitle={t({ 
                            de: "Wir haben Ihren Termin für 09:00 Uhr vorbereitet.", 
                            en: "We have prepared your appointment for 09:00 AM." 
                        })} 
                        onNext={() => setStep('health')} 
                        buttonText={t({ de: "Check-in fortsetzen", en: "Continue Check-in" })} 
                    />
                );
            case 'health':
                return <HealthQuestionScreen onNext={() => setStep('consent')} onYes={() => setStep('healthInput')} />;
            case 'healthInput':
                return <HealthInputScreen onNext={handleHealthInputNext} />;
            case 'consent':
                return <ConsentScreen onNext={() => setStep('signature')} />;
            case 'signature':
                return (
                    <SignatureScreen 
                        clientName={clientData.name}
                        onNext={handleSignatureNext} 
                        isProcessing={isProcessing} 
                    />
                );
            case 'arrival':
                return <ArrivalScreen />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-p-background overflow-y-auto">
             <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-p-primary via-p-accent to-p-primary opacity-20"></div>
                <button 
                    onClick={() => setView('roleSelector')} 
                    className="absolute top-4 left-4 sm:top-6 sm:left-6 text-xs uppercase tracking-widest text-p-text/60 hover:text-p-primary transition p-2 min-h-[44px] flex items-center z-20"
                >
                    &larr; {t({ de: 'Demo beenden', en: 'Exit Demo' })}
                </button>
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                    <LanguageToggle variant="compact" />
                </div>
                
                <div className="w-full max-w-4xl flex items-center justify-center min-h-0 sm:min-h-[560px] bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-p-stone/50 p-4 sm:p-8 md:p-10 my-4 sm:my-8">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default TabletCheckinFlow;
