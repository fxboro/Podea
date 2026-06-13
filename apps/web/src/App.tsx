
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Auth/Login';
import { Onboarding } from './pages/Auth/Onboarding';
import { VerifyEmail } from './pages/Auth/VerifyEmail';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';
import { Unauthorized } from './pages/Auth/Unauthorized';
import { JoinInvite } from './pages/Auth/JoinInvite';
import { KioskMain } from './pages/Kiosk/KioskMain';
import { ReviewQueue } from './pages/Practitioner/ReviewQueue';
import { TreatmentWorkspace } from './pages/Practitioner/TreatmentWorkspace';
import { SettingsLayout } from './pages/Settings/SettingsLayout';
import { ServicesManager } from './pages/Settings/ServicesManager';
import { ProductsManager } from './pages/Settings/ProductsManager';
import { AddOnsManager } from './pages/Settings/AddOnsManager';
import { LandingPage } from './pages/LandingPage';

import './index.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/join/:inviteId" element={<JoinInvite />} />
            
            {/* Awaiting Payment / Claims Sync Screen */}
            <Route path="/checkout/pending" element={
                <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                  <h2 className="font-serif">Zahlung wird verifiziert... Bitte warten.</h2>
                </div>
            } />


          {/* Protected Main Router */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['studio_admin', 'platform_admin', 'practitioner']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/kiosk" element={
            <ProtectedRoute allowedRoles={['studio_admin', 'platform_admin', 'frontdesk']}>
              <KioskMain />
            </ProtectedRoute>
          } />

          <Route path="/practitioner/review" element={
            <ProtectedRoute allowedRoles={['studio_admin', 'practitioner']}>
              <ReviewQueue />
            </ProtectedRoute>
          } />

          <Route path="/practitioner/chart/:appointmentId" element={
            <ProtectedRoute allowedRoles={['studio_admin', 'practitioner']}>
              <TreatmentWorkspace />
            </ProtectedRoute>
          } />

          {/* Settings Sub-Router */}
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['studio_admin', 'platform_admin']}>
              <SettingsLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="services" replace />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="addons" element={<AddOnsManager />} />
            <Route path="inventory" element={<ProductsManager />} />
          </Route>

          {/* Default Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
