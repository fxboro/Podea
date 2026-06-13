import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const SettingsLayout: React.FC = () => {
  const [isBackHovered, setIsBackHovered] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '250px', 
        borderRight: '1px solid #E5E7EB', 
        background: '#fff',
        padding: 'var(--spacing-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)'
      }}>
        <div>
          <Link 
            to="/dashboard" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: isBackHovered ? 'var(--color-accent)' : 'var(--color-primary-muted)',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: 'var(--spacing-md)',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
          >
            <ArrowLeft 
              size={16} 
              style={{
                transform: isBackHovered ? 'translateX(-4px)' : 'none',
                transition: 'transform 0.2s ease'
              }}
            />
            Back to Dashboard
          </Link>
          
          <h2 className="font-serif" style={{ marginTop: 0, marginBottom: 'var(--spacing-lg)' }}>Settings</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <NavLink 
            to="/settings/services"
            style={({ isActive }) => ({
              padding: '8px 12px',
              borderRadius: '4px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-primary-text)' : 'var(--color-primary-muted)',
              background: isActive ? 'var(--color-bg-surface)' : 'transparent',
              fontWeight: isActive ? 500 : 400
            })}
          >
            Services
          </NavLink>
          <NavLink 
            to="/settings/addons"
            style={({ isActive }) => ({
              padding: '8px 12px',
              borderRadius: '4px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-primary-text)' : 'var(--color-primary-muted)',
              background: isActive ? 'var(--color-bg-surface)' : 'transparent',
              fontWeight: isActive ? 500 : 400
            })}
          >
            Add-ons
          </NavLink>
          <NavLink 
            to="/settings/inventory"
            style={({ isActive }) => ({
              padding: '8px 12px',
              borderRadius: '4px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-primary-text)' : 'var(--color-primary-muted)',
              background: isActive ? 'var(--color-bg-surface)' : 'transparent',
              fontWeight: isActive ? 500 : 400
            })}
          >
            Products & Inventory
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: 'var(--spacing-xl)', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};
