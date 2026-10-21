
import { Client, Service, Addon, Product, RecommendationRule } from '../types';

export const clients: Client[] = [
    {
        id: 1,
        name: 'Anna Schmidt',
        phone: '...1234',
        appointmentTime: '09:00',
        practitioner: 'Sabine Weber',
        status: 'waiting',
        medicalFlags: ['Diabetes Typ 2', 'Blutverdünner'],
        lastTreatment: 'Medizinische Fußpflege',
        notes: ['Rechter großer Zeh empfindlich', 'Bevorzugt warmes Fußbad'],
        suggestedUpsells: [
            { name: 'Diabetiker-Spezialcreme', price: 18.50, reason: 'Indikation: Diabetes Typ 2 (Hautschutz)', category: 'product' }
        ],
        history: [
            {
                id: 'h-1',
                date: '18. Sep 2026',
                treatment: 'Medizinische Fußpflege',
                practitioner: 'Sabine Weber',
                durationMinutes: 44,
                notes: 'Hyperkeratose an beiden Fersen schonend abgetragen. Rechter Großzehennagel begradigt. Patientin schmerzfrei.',
                medicalFlags: ['Diabetes Typ 2', 'Blutverdünner'],
                purchasedItems: ['Diabetiker-Spezialcreme (18,50 €)']
            },
            {
                id: 'h-2',
                date: '14. Aug 2026',
                treatment: 'Medizinische Fußpflege & Druckschutz',
                practitioner: 'Sabine Weber',
                durationMinutes: 48,
                notes: 'Clavus (Hühnerauge) an Digitus II links enukleiert. Druckentlastung angepasst. Keine Mikroläsionen trotz Antikoagulation.',
                medicalFlags: ['Diabetes Typ 2', 'Neu erfasst: Blutverdünner (Marcumar)']
            },
            {
                id: 'h-3',
                date: '03. Jul 2026',
                treatment: 'Podologische Befunderhebung & Basispflege',
                practitioner: 'Sabine Weber',
                durationMinutes: 50,
                notes: 'Erstaufnahme: Monofilament-Test unauffällig, Fußpulse tastbar. Hygiene- & Inspektionsberatung bei Diabetes durchgeführt.',
                medicalFlags: ['Diabetes Typ 2']
            }
        ]
    },
    {
        id: 2,
        name: 'Jürgen Klein',
        phone: '...5678',
        appointmentTime: '09:30',
        practitioner: 'Klaus Fischer',
        status: 'waiting',
        medicalFlags: [],
        lastTreatment: 'Klassische Maniküre',
        notes: ['Fragt oft nach neuen Handcremes'],
        suggestedUpsells: [
            { name: 'Handmassage (10 Min)', price: 12, reason: 'Kundenhistorie: Hohes Stresslevel', category: 'service' },
            { name: 'Handcreme "Samt"', price: 24, reason: 'Saison: Winter / Trockene Haut', category: 'product' }
        ],
        history: [
            {
                id: 'h-21',
                date: '22. Sep 2026',
                treatment: 'Klassische Maniküre & Handmassage',
                practitioner: 'Klaus Fischer',
                durationMinutes: 40,
                notes: 'Nagelformung und Nagelhautentfernung. Entspannende Handmassage mit Jojobaöl. Stark beanspruchte Hautstellen beruhigt.',
                purchasedItems: ['Handcreme "Samt" (24,00 €)']
            },
            {
                id: 'h-22',
                date: '15. Aug 2026',
                treatment: 'Klassische Maniküre',
                practitioner: 'Klaus Fischer',
                durationMinutes: 30,
                notes: 'Routinemaniküre durchgeführt. Nägel poliert.'
            }
        ]
    },
    {
        id: 3,
        name: 'Maria Berger',
        phone: '...1122',
        appointmentTime: '10:00',
        practitioner: 'Sabine Weber',
        status: 'in-progress',
        medicalFlags: ['Allergie: Lanolin'],
        lastTreatment: 'Wellness-Pediküre',
        notes: [],
        suggestedUpsells: [
            { name: 'Nagellack "Ruby Red"', price: 10, reason: 'Präferenz: Wählt oft Rot-Töne', category: 'service' }
        ],
        history: [
            {
                id: 'h-31',
                date: '12. Sep 2026',
                treatment: 'Wellness-Pediküre & Lackierung',
                practitioner: 'Sabine Weber',
                durationMinutes: 60,
                notes: 'Peeling ohne Lanolin-Zusatz durchgeführt. UV-Lack aufgetragen. Sehr zufriedene Klientin.',
                medicalFlags: ['Allergie: Lanolin']
            }
        ]
    },
    {
        id: 4,
        name: 'Tom Wagner',
        phone: '...3344',
        appointmentTime: '11:00',
        practitioner: 'Klaus Fischer',
        status: 'done',
        medicalFlags: [],
        lastTreatment: 'Herren-Haarschnitt',
        notes: ['Nächstes mal Seiten etwas kürzer'],
        suggestedUpsells: [
            { name: 'Bartpflege-Öl', price: 25, reason: 'Zusatzverkauf: Bartpflege', category: 'product' }
        ],
        history: [
            {
                id: 'h-41',
                date: '28. Sep 2026',
                treatment: 'Herren-Haarschnitt & Bartkontur',
                practitioner: 'Klaus Fischer',
                durationMinutes: 32,
                notes: 'Klassischer Fasson-Schnitt mit Schere über Kamm. Bartöl zur Pflege eingearbeitet.',
                purchasedItems: ['Bartpflege-Öl (25,00 €)']
            }
        ]
    },
    {
        id: 5,
        name: 'Christian Weber',
        phone: '...7788',
        appointmentTime: '08:30',
        practitioner: 'Sabine Weber',
        status: 'done',
        medicalFlags: [],
        lastTreatment: 'Podologische Basispflege',
        notes: ['Sehr pünktlich', 'Verwendet gerne neutrale Fußbäder'],
        suggestedUpsells: [
            { name: 'Nagelöl-Pflegestift', price: 14.50, reason: 'Nagelfalzpflege & Tiefenschutz', category: 'product' }
        ],
        history: [
            {
                id: 'h-51',
                date: '10. Sep 2026',
                treatment: 'Podologische Basispflege',
                practitioner: 'Sabine Weber',
                durationMinutes: 35,
                notes: 'Reguläre Nagel- und Hornhautpflege. Keine pathologischen Befunde.',
                purchasedItems: ['Nagelöl-Pflegestift (14,50 €)']
            }
        ]
    },
    {
        id: 6,
        name: 'Eberhard Krause',
        phone: '...9900',
        appointmentTime: '11:30',
        practitioner: 'Sabine Weber',
        status: 'waiting',
        medicalFlags: ['Polyneuropathie', 'Marcumar / Antikoaguliert', 'Allergie: Jod'],
        lastTreatment: 'Diabetische Komplexbehandlung',
        notes: ['Sensibilitätsverlust an beiden Großzehen', 'Nur atraumatische Instrumente verwenden'],
        suggestedUpsells: [
            { name: 'Silikon-Druckschutzring', price: 9.90, reason: 'Druckstellenprävention Digitus IV', category: 'product' },
            { name: 'Diabetiker-Spezialcreme', price: 18.50, reason: 'Schutzbarriere bei reduzierter Schweißsekretion', category: 'product' }
        ],
        history: [
            {
                id: 'h-61',
                date: '05. Aug 2026',
                treatment: 'Diabetische Komplexbehandlung',
                practitioner: 'Sabine Weber',
                durationMinutes: 50,
                notes: 'Prüfung Temperaturempfinden & Vibration (Stimmgabel 2/8). Druckstellen am Metatarsalköpfchen I entlastet.',
                medicalFlags: ['Polyneuropathie', 'Marcumar / Antikoaguliert', 'Allergie: Jod'],
                purchasedItems: ['Silikon-Druckschutzring (9,90 €)']
            }
        ]
    }
];

export const services: Service[] = [
    { name: 'Medizinische Fußpflege', price: 45, vat: 19, duration: 45 },
    { name: 'Wellness-Pediküre', price: 60, vat: 19, duration: 60 },
    { name: 'Klassische Maniküre', price: 30, vat: 19, duration: 30 },
    { name: 'Herren-Haarschnitt', price: 35, vat: 19, duration: 30 },
];

export const addons: Addon[] = [
    { name: 'Feuchtigkeitspackung', price: 15 },
    { name: 'Handmassage (10 Min)', price: 12 },
    { name: 'Nagellack', price: 10 },
    { name: 'Augenbrauen zupfen', price: 8 },
];

export const products: Product[] = [
    { name: 'Fußcreme "Vital"', type: 'retail', stock: 12, lowStockThreshold: 5 },
    { name: 'Handcreme "Samt"', type: 'retail', stock: 4, lowStockThreshold: 5 },
    { name: 'Bartpflege-Öl "Holz"', type: 'retail', stock: 8, lowStockThreshold: 3 },
    { name: 'Desinfektionsmittel', type: 'consumable', stock: 25, lowStockThreshold: 10 },
    { name: 'Einmalhandschuhe (Box)', type: 'consumable', stock: 15, lowStockThreshold: 20 },
];

export const recommendationRules: RecommendationRule[] = [
    { id: 1, condition: 'Medizinischer Hinweis: Diabetes', suggestion: 'Diabetiker-Spezialcreme', active: true },
    { id: 2, condition: 'Jahreszeit: Winter (Nov-Feb)', suggestion: 'Feuchtigkeitspackung Intensiv', active: true },
    { id: 3, condition: 'Historie: >3 Lack-Behandlungen', suggestion: 'Nagelpflege-Öl Home', active: true },
    { id: 4, condition: 'Alter: >60 & Fußpflege', suggestion: 'Sicherheits-Check (Sturzprophylaxe)', active: false },
];
