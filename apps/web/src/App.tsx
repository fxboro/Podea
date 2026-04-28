
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Auth/Login';
import { Onboarding } from './pages/Auth/Onboarding';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';
import { Unauthorized } from './pages/Auth/Unauthorized';
import { JoinInvite } from './pages/Auth/JoinInvite';
import { KioskMain } from './pages/Kiosk/KioskMain';
import { ReviewQueue } from './pages/Practitioner/ReviewQueue';
import { TreatmentWorkspace } from './pages/Practitioner/TreatmentWorkspace';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
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

          {/* Default Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
