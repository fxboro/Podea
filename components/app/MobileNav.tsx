import React from 'react';
import { View } from '../../types';
import { 
    ChartBarIcon, 
    UserGroupIcon, 
    UserCircleIcon, 
    DeviceTabletIcon 
} from '@heroicons/react/24/outline';
import { 
    ChartBarIcon as ChartBarSolid, 
    UserGroupIcon as UserGroupSolid, 
    UserCircleIcon as UserCircleSolid, 
    DeviceTabletIcon as DeviceTabletSolid 
} from '@heroicons/react/24/solid';

import { useLanguage } from '../../context/LanguageContext';

interface MobileNavProps {
    currentView: View;
    setView: (view: View) => void;
    unreadCount?: number;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, setView, unreadCount = 0 }) => {
    const { t } = useLanguage();

    // Hide mobile nav on roleSelector, login, and landing page
    if (currentView === 'roleSelector' || (currentView as string) === 'landing' || currentView === 'login') {
        return null;
    }

    const navItems = [
        {
            id: 'admin',
            label: t({ de: 'Admin', en: 'Admin' }),
            view: 'adminDashboard' as View,
            isActive: currentView === 'adminDashboard' || currentView === 'adminSettings',
            icon: ChartBarIcon,
            activeIcon: ChartBarSolid,
            badge: unreadCount > 0 ? unreadCount : undefined
        },
        {
            id: 'arrivals',
            label: t({ de: 'Ankünfte', en: 'Arrivals' }),
            view: 'practitionerArrivals' as View,
            isActive: currentView === 'practitionerArrivals',
            icon: UserGroupIcon,
            activeIcon: UserGroupSolid,
        },
        {
            id: 'client',
            label: t({ de: 'Behandlung', en: 'Treatment' }),
            view: 'practitionerClient' as View,
            isActive: currentView === 'practitionerClient',
            icon: UserCircleIcon,
            activeIcon: UserCircleSolid,
        },
        {
            id: 'tablet',
            label: t({ de: 'Tablet', en: 'Tablet' }),
            view: 'tabletCheckin' as View,
            isActive: currentView === 'tabletCheckin',
            icon: DeviceTabletIcon,
            activeIcon: DeviceTabletSolid,
        }
    ];

    return (
        <nav 
            aria-label="Mobile Navigation"
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-p-stone/70 shadow-lg pb-safe print:hidden no-print"
        >
            <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
                {navItems.map(item => {
                    const Icon = item.isActive ? item.activeIcon : item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.view)}
                            className={`flex flex-col items-center justify-center h-full min-h-[44px] relative py-1 transition-all duration-200 select-none ${
                                item.isActive 
                                    ? 'text-p-primary font-semibold' 
                                    : 'text-p-text/60 hover:text-p-primary active:scale-95'
                            }`}
                        >
                            <div className="relative">
                                <Icon className={`w-5 h-5 transition-transform duration-200 ${item.isActive ? 'scale-110 text-p-accent' : ''}`} />
                                {item.badge && (
                                    <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-p-warning text-[9px] font-bold text-white shadow-sm animate-pulse">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[11px] tracking-tight mt-1 transition-colors ${
                                item.isActive ? 'text-p-primary font-semibold' : 'text-p-text/70'
                            }`}>
                                {item.label}
                            </span>
                            {item.isActive && (
                                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-p-accent" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
