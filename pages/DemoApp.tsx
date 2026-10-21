
import React, { useState } from 'react';
import { View } from '../types';
import RoleSelector from '../components/app/RoleSelector';
import AdminDashboard from '../components/app/admin/AdminDashboard';
import AdminSettings from '../components/app/admin/AdminSettings';
import PractitionerArrivals from '../components/app/practitioner/PractitionerArrivals';
import ClientDetailView from '../components/app/practitioner/ClientDetailView';
import TabletCheckinFlow from '../components/app/tablet/TabletCheckinFlow';
import { Client } from '../types';
import { clients as initialClients } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import MobileNav from '../components/app/MobileNav';
import RoleGate from '../components/auth/RoleGate';
import Login from '../components/auth/Login';
import { useLanguage } from '../context/LanguageContext';

interface DemoAppProps {
    initialView: View;
    setView: (view: View) => void;
}

const DemoApp: React.FC<DemoAppProps> = ({ initialView, setView }) => {
    const { t } = useLanguage();
    const [currentView, setCurrentView] = useState<View>(initialView);
    const [allClients, setAllClients] = useState<Client[]>(initialClients);
    const [selectedClient, setSelectedClient] = useState<Client | null>(initialClients[0]);

    const handleSelectClient = (client: Client) => {
        setSelectedClient(client);
        setCurrentView('practitionerClient');
    };

    const handleUpdateClient = (updatedClient: Client) => {
        setAllClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
        if (selectedClient?.id === updatedClient.id) {
            setSelectedClient(updatedClient);
        }
    };

    const handleCompleteCheckin = (newClientData: Partial<Client>) => {
        // Find if client already exists by phone
        const existingClientIndex = allClients.findIndex(c => c.phone === newClientData.phone);
        
        if (existingClientIndex >= 0) {
            // Update existing client
            const updatedClients = [...allClients];
            updatedClients[existingClientIndex] = {
                ...updatedClients[existingClientIndex],
                ...newClientData,
                status: 'waiting',
                medicalFlags: newClientData.medicalFlags 
                    ? [...new Set([...updatedClients[existingClientIndex].medicalFlags, ...newClientData.medicalFlags])]
                    : updatedClients[existingClientIndex].medicalFlags
            };
            setAllClients(updatedClients);
        } else {
            // Create new client
            const newClient: Client = {
                id: Date.now(),
                name: newClientData.name || t({ de: 'Neuer Kunde', en: 'New Client' }),
                phone: newClientData.phone || '',
                appointmentTime: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
                practitioner: 'Sabine Weber', // Default for demo
                status: 'waiting',
                medicalFlags: newClientData.medicalFlags || [],
                lastTreatment: t({ de: 'Erstbesuch', en: 'Initial Visit' }),
                notes: newClientData.notes || [],
                suggestedUpsells: []
            };
            setAllClients(prev => [...prev, newClient]);
        }
    };

    const renderContent = () => {
        switch (currentView) {
            case 'roleSelector':
                return <RoleSelector setView={setCurrentView} />;
            case 'login':
                return <Login setView={setCurrentView} />;
            case 'adminDashboard':
                return (
                    <RoleGate allowedRoles={['admin']} setView={setCurrentView} currentViewName={t({ de: 'Studio Admin Dashboard', en: 'Studio Admin Dashboard' })}>
                        <AdminDashboard setView={setCurrentView} clients={allClients} onSelectClient={handleSelectClient} />
                    </RoleGate>
                );
            case 'adminSettings':
                return (
                    <RoleGate allowedRoles={['admin']} setView={setCurrentView} currentViewName={t({ de: 'Studio Einstellungen', en: 'Studio Settings' })}>
                        <AdminSettings setView={setCurrentView} />
                    </RoleGate>
                );
            case 'practitionerArrivals':
                return (
                    <RoleGate allowedRoles={['practitioner', 'admin']} setView={setCurrentView} currentViewName={t({ de: 'Behandler/in Ankünfte', en: 'Practitioner Arrivals' })}>
                        <PractitionerArrivals setView={setCurrentView} onSelectClient={handleSelectClient} clients={allClients} />
                    </RoleGate>
                );
            case 'practitionerClient':
                return (
                    <RoleGate allowedRoles={['practitioner', 'admin']} setView={setCurrentView} currentViewName={t({ de: 'Behandlungsdokumentation', en: 'Treatment Documentation' })}>
                        <ClientDetailView setView={setCurrentView} client={selectedClient} onUpdateClient={handleUpdateClient} />
                    </RoleGate>
                );
            case 'tabletCheckin':
                return <TabletCheckinFlow setView={setCurrentView} onCompleteCheckin={handleCompleteCheckin} />;
            default:
                return <RoleSelector setView={setCurrentView} />;
        }
    };

    return (
        <div className={`min-h-screen bg-p-background font-sans text-p-text overflow-x-hidden ${
            currentView !== 'roleSelector' && currentView !== 'tabletCheckin' && currentView !== 'login' ? 'pb-20 md:pb-0' : ''
        }`}>
           <AnimatePresence mode="wait">
               <motion.div
                   key={currentView}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.3, ease: 'easeInOut' }}
                   className="h-full w-full"
               >
                   {renderContent()}
               </motion.div>
           </AnimatePresence>

           {/* Mobile Navigation Dock */}
           <MobileNav 
               currentView={currentView} 
               setView={setCurrentView} 
           />
        </div>
    );
};

export default DemoApp;
