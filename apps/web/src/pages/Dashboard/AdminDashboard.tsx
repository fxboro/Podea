import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button, Card } from '@podea/ui';
import { RoleGate } from '../../components/RoleGate';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Bell, Sparkles, TrendingUp, Calendar, CheckCircle2, LogOut, Settings, Award } from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const { claims } = useAuth();
  const navigate = useNavigate();
  const studioId = claims?.studioId;
  
  const { metrics, arrivals: initialArrivals, alerts: initialAlerts, activeRules, loading } = useDashboardData();

  // Local state to support interactive UI features (resolving alerts, pitching upsells)
  const [resolvedAlertIds, setResolvedAlertIds] = useState<string[]>([]);
  const [pitchedUpsellIds, setPitchedUpsellIds] = useState<string[]>([]);
  const [localMetricsAdjustment, setLocalMetricsAdjustment] = useState({ revenue: 0, upsellRevenue: 0, pitches: 0, acceptedPitches: 0 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleResolveAlert = (alertId: string, alertType: string) => {
    if (alertType === 'compliance') {
      navigate('/practitioner/review');
    } else {
      setResolvedAlertIds(prev => [...prev, alertId]);
    }
  };

  const handlePitchUpsell = async (arrivalId: string, clientName: string, servicePriceStr: string) => {
    // Extract price from string, e.g., "Add Hydration Mask (+€45)" -> 45
    const match = servicePriceStr.match(/€(\d+(\.\d+)?)/);
    const addedPrice = match ? parseFloat(match[1]) : 45.00;

    const confirmPitch = window.confirm(`Pitching Upsell to ${clientName}. Do you want to add this upgrade to the active session?`);
    if (confirmPitch) {
      try {
        setPitchedUpsellIds(prev => [...prev, arrivalId]);
        // Update local state metrics instantly for premium reactive feel
        setLocalMetricsAdjustment(prev => ({
          revenue: prev.revenue + addedPrice,
          upsellRevenue: prev.upsellRevenue + addedPrice,
          pitches: prev.pitches + 1,
          acceptedPitches: prev.acceptedPitches + 1
        }));

        if (studioId) {
          // Update the appointment addon list in the background
          const apptRef = doc(db, `studios/${studioId}/appointments`, arrivalId);
          await updateDoc(apptRef, {
            notes: `System Auto-Note: Upsell accepted during check-in: ${servicePriceStr}`
          });
        }
      } catch (err) {
        console.error("Failed to update upsell in backend, updating local state only:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFEA]">
        <div style={{ textAlign: 'center' }}>
          <h2 className="font-serif text-3xl mb-2" style={{ color: 'var(--color-primary-text)' }}>Loading Podea Workspace...</h2>
          <p style={{ color: 'var(--color-primary-muted)' }}>Preparing dashboard metrics and medical compliance data</p>
        </div>
      </div>
    );
  }

  // Filter out resolved alerts
  const activeAlerts = initialAlerts.filter(a => !resolvedAlertIds.includes(a.id));

  // Compute metrics combining live Firestore data + local interactive simulations
  const displayRevenueToday = metrics.revenueToday + localMetricsAdjustment.revenue;
  const displayUpsellRevenue = metrics.upsellRevenueToday + localMetricsAdjustment.upsellRevenue;
  const displayRevenueMonth = metrics.revenueMonth + (localMetricsAdjustment.revenue * 20);
  
  // Calculate dynamic conversion rate
  const totalPitches = 2 + localMetricsAdjustment.pitches; // Mock base pitches of 2 + active ones
  const acceptedPitches = (displayUpsellRevenue > 0 ? Math.ceil(displayUpsellRevenue / 45) : 0) + localMetricsAdjustment.acceptedPitches;
  const displayConversionRate = Math.min(Math.round((acceptedPitches / totalPitches) * 100), 100);

  const monthlyGoal = 15000.00;
  const goalProgressPercentage = Math.min(Math.round((displayRevenueMonth / monthlyGoal) * 100), 100);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-title">
          <h1 className="font-serif">
            Welcome back, {claims?.role === 'platform_admin' ? 'Platform Admin' : 'Studio Manager'}
          </h1>
          <p>
            Here's what's happening at your studio today.
          </p>
        </div>
        <div className="dashboard-header-actions">
          <span className="dashboard-date">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <RoleGate allowedRoles={['studio_admin', 'platform_admin']}>
            <Button variant="secondary" onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings className="w-4 h-4" /> Settings
            </Button>
          </RoleGate>
          <Button variant="secondary" onClick={() => auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut className="w-4 h-4" /> Log Out
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="stats-grid">
        {[
          { label: 'Revenue Today', value: formatCurrency(displayRevenueToday), trend: `Base: ${formatCurrency(displayRevenueToday - displayUpsellRevenue)}`, positive: true, icon: <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-accent)' }} /> },
          { label: 'Upsell Revenue Today', value: formatCurrency(displayUpsellRevenue), trend: `${displayConversionRate}% Conv Rate`, positive: true, icon: <Sparkles className="w-5 h-5" style={{ color: 'var(--color-accent)' }} /> },
          { label: 'Appointments Today', value: metrics.appointmentsToday, trend: 'Scheduled', positive: true, icon: <Calendar className="w-5 h-5" style={{ color: 'var(--color-status-success)' }} /> },
          { label: 'Completion Rate', value: `${metrics.completionRate}%`, trend: 'Finished', positive: metrics.completionRate > 50, icon: <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-status-success)' }} /> }
        ].map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xs)' }}>
              <h3 className="stat-card-header">{stat.label}</h3>
              {stat.icon}
            </div>
            <div className="stat-card-body">
              <span className="stat-card-value">
                {stat.value}
              </span>
              <span className={`stat-card-trend ${stat.positive ? 'trend-positive' : 'trend-neutral'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-layout">
        {/* Main Column: Arrivals & Schedule */}
        <div className="arrivals-section">
          <div className="section-header">
            <h2 className="font-serif">Today's Arrivals</h2>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Refresh Queue</Button>
          </div>

          <div className="arrivals-list">
            {initialArrivals.length === 0 ? (
              <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-primary-muted)' }}>
                No appointments scheduled for today.
              </div>
            ) : (
              initialArrivals.map((arrival) => {
                const isPitched = pitchedUpsellIds.includes(arrival.id);
                
                return (
                  <div key={arrival.id} className="arrival-row" onClick={() => {
                    if (arrival.status === 'arrived' || arrival.status === 'in_session') {
                      navigate(`/practitioner/chart/${arrival.id}`);
                    }
                  }}>
                    <div className="arrival-time">
                      {arrival.time}
                    </div>
                    
                    <div className="arrival-info">
                      <div className="client-name-wrapper">
                        <span className="client-name">
                          {arrival.clientName}
                        </span>
                        {arrival.isVIP && (
                          <span className="vip-badge">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="arrival-service">
                        {arrival.service}
                      </div>
                    </div>

                    <div className="arrival-actions" onClick={(e) => e.stopPropagation()}>
                      {arrival.upsellSuggestion && (arrival.status === 'expected' || arrival.status === 'arrived') && (
                        <div className="inline-upsell-pitch">
                          <span className="pitch-text">
                            {isPitched ? '✨ Upgrade Applied!' : `✨ Recommend: ${arrival.upsellSuggestion}`}
                          </span>
                          {!isPitched && (
                            <button 
                              onClick={() => handlePitchUpsell(arrival.id, arrival.clientName, arrival.upsellSuggestion!)}
                              className="podea-btn podea-btn-accent"
                              style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '4px' }}
                            >
                              Pitch
                            </button>
                          )}
                        </div>
                      )}
                      
                      <span className={`status-badge status-${arrival.status}`}>
                        {arrival.status === 'expected' ? 'expected' :
                         arrival.status === 'arrived' ? 'waiting' :
                         arrival.status === 'in_session' ? 'in session' : 'completed'}
                      </span>

                      {(arrival.status === 'arrived' || arrival.status === 'in_session') && (
                        <Button 
                          variant="primary" 
                          onClick={() => navigate(`/practitioner/chart/${arrival.id}`)}
                          style={{ padding: '6px 16px', fontSize: '13px' }}
                        >
                          Chart
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Alerts & Upsell Intelligence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          
          {/* Action Required / Alerts */}
          <div className="alerts-section">
            <h2 className="font-serif" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell className="w-5 h-5 text-gray-500" /> Action Required
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {activeAlerts.length === 0 ? (
                <Card style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-primary-muted)' }}>
                  All caught up! No critical actions required.
                </Card>
              ) : (
                activeAlerts.map(alert => (
                  <div key={alert.id} className={`alert-item alert-severity-${alert.severity}`}>
                    <div className="alert-content">
                      <p className="alert-message">
                        {alert.message}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleResolveAlert(alert.id, alert.type)}
                      className="alert-action-btn"
                    >
                      {alert.type === 'compliance' ? 'Review' : 'Resolve'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upsell Intelligence Module */}
          <div className="intelligence-card">
            <h3>
              <Sparkles className="w-5 h-5 text-amber-300" /> Revenue Intelligence
            </h3>
            <p className="intelligence-subtitle">
              AI recommendations based on user history and intake forms
            </p>
            
            <div className="upsell-opportunities-list">
              {initialArrivals.some(a => a.upsellSuggestion && !pitchedUpsellIds.includes(a.id)) ? (
                initialArrivals.filter(a => a.upsellSuggestion && !pitchedUpsellIds.includes(a.id)).map(arrival => (
                  <div key={arrival.id} className="upsell-opportunity-item">
                    <div className="opportunity-client">{arrival.clientName}</div>
                    <div className="opportunity-suggestion">
                      Scheduled for {arrival.service}. Pitch upgrade: <strong>{arrival.upsellSuggestion}</strong>.
                    </div>
                    <span className="opportunity-badge">High Probability</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: 'var(--spacing-md)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>
                  No active upsell opportunities remaining.
                </div>
              )}
            </div>

            {/* Active Rules List */}
            <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h4 style={{ fontSize: '14px', margin: '0 0 var(--spacing-xs)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award className="w-4 h-4 text-amber-300" /> Active Upsell Rules ({activeRules.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                {activeRules.map(rule => (
                  <div key={rule.id} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '4px' }}>
                    Trigger Service IDs: {rule.triggerServiceIds.join(', ')}
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Preview Progress Track */}
            <div className="revenue-preview-container">
              <div className="revenue-preview-header">
                <span>Monthly Revenue Goal</span>
                <strong>{formatCurrency(displayRevenueMonth)} / {formatCurrency(monthlyGoal)}</strong>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${goalProgressPercentage}%` }}
                />
              </div>
              <div className="revenue-preview-details">
                <span>Projected Monthly Target: {goalProgressPercentage}% Achieved</span>
                <span>Includes Upsell Revenue</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
