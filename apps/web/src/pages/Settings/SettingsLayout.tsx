import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export const SettingsLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-body)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '250px', 
        borderRight: '1px solid #E5E7EB', 
        background: '#fff',
        padding: 'var(--spacing-xl)'
      }}>
        <h2 className="font-serif" style={{ marginTop: 0, marginBottom: 'var(--spacing-lg)' }}>Settings</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <NavLink 
            to="/settings/services"
            style={({ isActive }) => ({
              padding: '8px 12px',
              borderRadius: '4px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-primary)' : 'var(--color-primary-muted)',
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
              color: isActive ? 'var(--color-primary)' : 'var(--color-primary-muted)',
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
              color: isActive ? 'var(--color-primary)' : 'var(--color-primary-muted)',
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
