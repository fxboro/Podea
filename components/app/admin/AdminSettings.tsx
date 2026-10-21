
import React, { useState } from 'react';
import AppHeader from '../AppHeader';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { View } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { services as initialServices, addons as initialAddons, products as initialProducts, recommendationRules as initialRules } from '../../../data/mockData';
import { PencilSquareIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

type Tab = 'services' | 'addons' | 'products' | 'rules';

const AdminSettings: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';
    const [activeTab, setActiveTab] = useState<Tab>('services');
    const [isEditing, setIsEditing] = useState(false);
    
    // Local state for edits
    const [services, setServices] = useState(initialServices);
    const [products, setProducts] = useState(initialProducts);
    const [rules, setRules] = useState(initialRules);

    const handleServiceChange = (index: number, field: string, value: string) => {
        const newServices = [...services];
        (newServices[index] as any)[field] = field === 'name' ? value : Number(value);
        setServices(newServices);
    };

    const handleProductChange = (index: number, field: string, value: string) => {
        const newProducts = [...products];
        (newProducts[index] as any)[field] = field === 'name' ? value : Number(value);
        setProducts(newProducts);
    };

    const toggleRule = (id: number) => {
        setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'services':
                return (
                    <div>
                        {/* Mobile Stacked View (< md) */}
                        <div className="md:hidden space-y-3">
                            {services.map((s, i) => (
                                <div key={i} className="p-4 rounded-xl border border-p-stone/70 bg-white shadow-xs space-y-2.5">
                                    <div>
                                        <label className="text-[10px] uppercase font-semibold text-p-text/50 block mb-1">
                                            {t({ de: 'Leistung', en: 'Service' })}
                                        </label>
                                        {isEditing ? (
                                            <input 
                                                className="w-full bg-p-background border border-p-stone rounded-lg px-2.5 py-1.5 text-xs text-p-primary font-medium" 
                                                value={s.name} 
                                                onChange={(e) => handleServiceChange(i, 'name', e.target.value)} 
                                            />
                                        ) : (
                                            <p className="font-semibold text-p-primary text-sm">{s.name}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-p-stone/40">
                                        <div>
                                            <label className="text-[10px] uppercase font-semibold text-p-text/50 block mb-1">
                                                {t({ de: 'Preis (€)', en: 'Price (€)' })}
                                            </label>
                                            {isEditing ? (
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-p-background border border-p-stone rounded-lg px-2.5 py-1.5 text-xs text-p-primary" 
                                                    value={s.price} 
                                                    onChange={(e) => handleServiceChange(i, 'price', e.target.value)} 
                                                />
                                            ) : (
                                                <span className="font-semibold text-p-primary text-xs">€{s.price.toFixed(2)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-semibold text-p-text/50 block mb-1">
                                                {t({ de: 'Dauer (Min)', en: 'Duration (min)' })}
                                            </label>
                                            {isEditing ? (
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-p-background border border-p-stone rounded-lg px-2.5 py-1.5 text-xs text-p-primary" 
                                                    value={s.duration} 
                                                    onChange={(e) => handleServiceChange(i, 'duration', e.target.value)} 
                                                />
                                            ) : (
                                                <span className="text-p-text/80 text-xs">{s.duration} Min</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View (>= md) */}
                        <table className="hidden md:table w-full text-left">
                            <thead>
                                <tr className="border-b border-p-stone">
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-p-text/50">
                                        {t({ de: 'Leistung', en: 'Service' })}
                                    </th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-p-text/50">
                                        {t({ de: 'Preis (€)', en: 'Price (€)' })}
                                    </th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-p-text/50">
                                        {t({ de: 'Dauer (Min)', en: 'Duration (min)' })}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>{services.map((s, i) => (
                                <tr key={i} className="border-b border-p-stone/40 hover:bg-p-surface transition-colors">
                                    <td className="p-4 font-medium text-p-primary">
                                        {isEditing ? <input className="w-full bg-white border border-p-stone rounded px-2 py-1" value={s.name} onChange={(e) => handleServiceChange(i, 'name', e.target.value)} /> : s.name}
                                    </td>
                                    <td className="p-4 text-p-text">
                                         {isEditing ? <input type="number" className="w-20 bg-white border border-p-stone rounded px-2 py-1" value={s.price} onChange={(e) => handleServiceChange(i, 'price', e.target.value)} /> : `€${s.price.toFixed(2)}`}
                                    </td>
                                    <td className="p-4 text-p-text">
                                         {isEditing ? <input type="number" className="w-20 bg-white border border-p-stone rounded px-2 py-1" value={s.duration} onChange={(e) => handleServiceChange(i, 'duration', e.target.value)} /> : `${s.duration} ${isEnglish ? 'min' : 'Min'}`}
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                );
            case 'addons':
                return (
                    <div className="p-8 text-center text-p-text/50 italic">
                        {t({ 
                            de: 'Add-ons Bearbeitung in dieser Demo deaktiviert.', 
                            en: 'Add-ons editing is disabled in this demo.' 
                        })}
                    </div>
                );
            case 'products':
                return (
                    <div>
                        {/* Mobile Stacked View (< md) */}
                        <div className="md:hidden space-y-3">
                            {products.map((p, i) => (
                                <div key={i} className={`p-4 rounded-xl border border-p-stone/70 bg-white shadow-xs space-y-2.5 ${p.stock < p.lowStockThreshold ? 'border-p-warning/50 bg-p-warning/5' : ''}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-p-primary text-sm">{p.name}</p>
                                            <span className="text-[11px] text-p-text/60 capitalize">{p.type}</span>
                                        </div>
                                        {p.stock < p.lowStockThreshold && (
                                            <span className="text-p-warning text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-p-warning/15 border border-p-warning/30">
                                                {t({ de: 'Niedrig', en: 'Low' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="pt-2 border-t border-p-stone/40">
                                        <label className="text-[10px] uppercase font-semibold text-p-text/50 block mb-1">
                                            {t({ de: 'Lagerbestand', en: 'Stock' })}
                                        </label>
                                        {isEditing ? (
                                            <input 
                                                type="number" 
                                                className="w-full bg-p-background border border-p-stone rounded-lg px-2.5 py-1.5 text-xs text-p-primary" 
                                                value={p.stock} 
                                                onChange={(e) => handleProductChange(i, 'stock', e.target.value)} 
                                            />
                                        ) : (
                                            <span className="font-mono font-bold text-p-primary text-xs">
                                                {p.stock} {t({ de: 'Stück', en: 'units' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View (>= md) */}
                        <table className="hidden md:table w-full text-left">
                            <thead>
                                <tr className="border-b border-p-stone">
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-p-text/50">
                                        {t({ de: 'Produkt', en: 'Product' })}
                                    </th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-p-text/50">
                                        {t({ de: 'Typ', en: 'Type' })}
                                    </th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-p-text/50">
                                        {t({ de: 'Lagerbestand', en: 'Stock' })}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>{products.map((p, i) => (
                                <tr key={i} className={`border-b border-p-stone/40 hover:bg-p-surface transition-colors ${p.stock < p.lowStockThreshold ? 'bg-p-warning/5' : ''}`}>
                                    <td className="p-4 font-medium text-p-primary">{p.name}</td>
                                    <td className="p-4 text-p-text capitalize">{p.type}</td>
                                    <td className="p-4 text-p-text">
                                        {isEditing ? (
                                            <input type="number" className="w-20 bg-white border border-p-stone rounded px-2 py-1" value={p.stock} onChange={(e) => handleProductChange(i, 'stock', e.target.value)} />
                                        ) : (
                                            <>
                                                {p.stock} 
                                                {p.stock < p.lowStockThreshold && (
                                                    <span className="text-p-warning text-[10px] uppercase font-bold tracking-wider ml-2">
                                                        {t({ de: 'Niedrig', en: 'Low' })}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                );
            case 'rules':
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-p-accent/5 border border-p-accent/10 rounded-lg mb-6 flex items-start gap-3">
                            <SparklesIcon className="w-6 h-6 text-p-accent flex-shrink-0 mt-0.5"/>
                            <p className="text-sm text-p-primary/80 leading-relaxed">
                                <strong>Podea Intelligence:</strong> {t({
                                    de: 'Definieren Sie hier Regeln, wann bestimmte Produkte oder Leistungen automatisch vorgeschlagen werden sollen.',
                                    en: 'Define clinical intelligence rules for when specific products or add-on treatments should be recommended.'
                                })}
                            </p>
                        </div>

                        {/* Mobile Stacked View (< md) */}
                        <div className="md:hidden space-y-3">
                            {rules.map((r) => (
                                <div key={r.id} className="p-4 rounded-xl border border-p-stone/70 bg-white shadow-xs space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2 py-1 bg-p-stone/30 rounded text-xs font-mono text-p-text">
                                            {r.condition}
                                        </span>
                                        <button 
                                            onClick={() => toggleRule(r.id)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${r.active ? 'bg-p-success' : 'bg-gray-200'}`}
                                            aria-label={t({ de: 'Regel aktivieren/deaktivieren', en: 'Toggle rule active/inactive' })}
                                        >
                                            <span className={`${r.active ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                                        </button>
                                    </div>
                                    <div className="pt-2 border-t border-p-stone/40">
                                        <label className="text-[10px] uppercase font-semibold text-p-text/50 block mb-0.5">
                                            {t({ de: 'Empfehlung', en: 'Recommendation' })}
                                        </label>
                                        <p className="text-xs text-p-text font-serif italic">{r.suggestion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View (>= md) */}
                        <table className="hidden md:table w-full text-left">
                            <thead>
                                <tr className="border-b border-p-stone">
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-p-text/50">
                                        {t({ de: 'Wenn (Bedingung)', en: 'If (Condition)' })}
                                    </th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-p-text/50">
                                        {t({ de: 'Dann Vorschlag', en: 'Then Suggestion' })}
                                    </th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-p-text/50">
                                        {t({ de: 'Status', en: 'Status' })}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>{rules.map((r) => (
                                <tr key={r.id} className="border-b border-p-stone/40 hover:bg-p-surface transition-colors">
                                    <td className="p-4 font-medium text-p-primary">
                                        <span className="px-2 py-1 bg-p-stone/30 rounded text-xs font-mono text-p-text">{r.condition}</span>
                                    </td>
                                    <td className="p-4 text-p-text font-serif italic">{r.suggestion}</td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => toggleRule(r.id)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${r.active ? 'bg-p-success' : 'bg-gray-200'}`}
                                        >
                                            <span className={`${r.active ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                                        </button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{tabId: Tab, children: React.ReactNode}> = ({tabId, children}) => (
        <button 
            onClick={() => setActiveTab(tabId)}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 font-medium text-xs sm:text-sm rounded-full transition-all duration-300 whitespace-nowrap shrink-0 min-h-[40px] ${
                activeTab === tabId ? 'bg-p-primary text-white shadow-soft font-semibold' : 'text-p-text/60 hover:text-p-primary hover:bg-p-surface'
            }`}
        >{children}</button>
    );

    return (
        <div className="min-h-screen bg-p-background">
            <AppHeader 
                title={t({ de: 'Einstellungen', en: 'Settings' })} 
                role={t({ de: 'Studio Admin', en: 'Studio Admin' })} 
                setView={setView} 
            />
            <main className="max-w-7xl mx-auto p-3.5 sm:p-6 md:p-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 sm:mb-8">
                    <button 
                        onClick={() => setView('adminDashboard')} 
                        className="text-xs font-bold uppercase tracking-widest text-p-text/50 hover:text-p-primary transition-colors py-1 self-start"
                    >
                        {t({ de: '← Zurück zum Dashboard', en: '← Back to Dashboard' })}
                    </button>
                    {activeTab !== 'rules' && (
                        <Button 
                            variant={isEditing ? 'primary' : 'secondary'} 
                            onClick={() => setIsEditing(!isEditing)} 
                            className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider self-start sm:self-auto min-h-[40px]"
                        >
                             {isEditing 
                                ? <><CheckIcon className="w-4 h-4"/> {t({ de: 'Speichern', en: 'Save' })}</> 
                                : <><PencilSquareIcon className="w-4 h-4"/> {t({ de: 'Bearbeiten', en: 'Edit' })}</>}
                        </Button>
                    )}
                </div>
                
                <Card className="p-4 sm:p-6 md:p-8">
                    <div className="border-b border-p-stone mb-6 sm:mb-8 pb-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                           <TabButton tabId="services">{t({ de: 'Leistungen', en: 'Services' })}</TabButton>
                           <TabButton tabId="addons">{t({ de: 'Add-ons', en: 'Add-ons' })}</TabButton>
                           <TabButton tabId="products">{t({ de: 'Produkte', en: 'Products' })}</TabButton>
                           <TabButton tabId="rules">{t({ de: 'Empfehlungs-Logik', en: 'Recommendation Logic' })}</TabButton>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {renderContent()}
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default AdminSettings;
