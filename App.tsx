import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import DemoApp from './pages/DemoApp';
import { View } from './types';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';

export default function App() {
    const [view, setView] = useState<View>('landing');

    const renderView = () => {
        switch (view) {
            case 'landing':
                return <LandingPage onStartDemo={() => setView('roleSelector')} />;
            case 'roleSelector':
            case 'login':
            case 'adminDashboard':
            case 'adminSettings':
            case 'practitionerArrivals':
            case 'practitionerClient':
            case 'tabletCheckin':
                return <DemoApp initialView={view} setView={setView} />;
            default:
                return <LandingPage onStartDemo={() => setView('roleSelector')} />;
        }
    };

    return (
        <LanguageProvider>
            <AuthProvider>
                <div className="min-h-screen bg-p-background flex flex-col">
                    <PWAInstallBanner />
                    <div className="flex-1 flex flex-col">
                        {renderView()}
                    </div>
                    <OfflineIndicator />
                </div>
            </AuthProvider>
        </LanguageProvider>
    );
}
