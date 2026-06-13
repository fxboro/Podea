import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@podea/ui';
import { RoleGate } from '../../components/RoleGate';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Bell, Sparkles, TrendingUp, Calendar, CheckCircle2, LogOut, Settings, Award, CalendarCheck } from 'lucide-react';
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
    const match = servicePriceStr.match(/€(\d+(\.\d+)?)/);
    const addedPrice = match ? parseFloat(match[1]) : 45.00;

    const confirmPitch = window.confirm(`Pitching Upsell to ${clientName}. Do you want to add this upgrade to the active session?`);
    if (confirmPitch) {
      try {
        setPitchedUpsellIds(prev => [...prev, arrivalId]);
        setLocalMetricsAdjustment(prev => ({
          revenue: prev.revenue + addedPrice,
          upsellRevenue: prev.upsellRevenue + addedPrice,
          pitches: prev.pitches + 1,
          acceptedPitches: prev.acceptedPitches + 1
        }));

        if (studioId) {
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

  // Derive user initials for avatar
  const userInitials = (() => {
    const name = auth.currentUser?.displayName;
    if (!name) return 'SM';
    const parts = name.split(' ');
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  })();

  // ---- LOADING SKELETON STATE ----
  if (loading) {
    return (
      <div className="skeleton-page">
        {/* Top Nav skeleton */}
        <div className="dashboard-topnav">
          <div className="topnav-left">
            <div className="topnav-logo">P</div>
            <div className="skeleton-block" style={{ width: 100, height: 18 }} />
          </div>
          <div className="topnav-right">
            <div className="skeleton-block" style={{ width: 34, height: 34, borderRadius: '50%' }} />
          </div>
        </div>

        <div className="skeleton-container">
          {/* Header skeleton */}
          <div className="skeleton-header">
            <div>
              <div className="skeleton-block" style={{ width: 320, height: 28, marginBottom: 8 }} />
              <div className="skeleton-block" style={{ width: 240, height: 16 }} />
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="skeleton-stats-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-block skeleton-stat-card" />
            ))}
          </div>

          {/* Layout skeleton */}
          <div className="skeleton-layout">
            <div className="skeleton-block skeleton-arrivals" />
            <div className="skeleton-sidebar">
              <div className="skeleton-block skeleton-alerts" />
              <div className="skeleton-block skeleton-intel" />
            </div>
          </div>
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
  
  const totalPitches = 2 + localMetricsAdjustment.pitches;
  const acceptedPitches = (displayUpsellRevenue > 0 ? Math.ceil(displayUpsellRevenue / 45) : 0) + localMetricsAdjustment.acceptedPitches;
  const displayConversionRate = Math.min(Math.round((acceptedPitches / totalPitches) * 100), 100);

  const monthlyGoal = 15000.00;
  const goalProgressPercentage = Math.min(Math.round((displayRevenueMonth / monthlyGoal) * 100), 100);

  const statCards = [
    { label: 'Revenue Today', value: formatCurrency(displayRevenueToday), trend: `Base: ${formatCurrency(displayRevenueToday - displayUpsellRevenue)}`, positive: true, icon: <TrendingUp size={18} />, accentClass: 'accent-gold', iconClass: 'icon-gold' },
    { label: 'Upsell Revenue', value: formatCurrency(displayUpsellRevenue), trend: `${displayConversionRate}% Conv Rate`, positive: true, icon: <Sparkles size={18} />, accentClass: 'accent-gold', iconClass: 'icon-gold' },
    { label: 'Appointments', value: metrics.appointmentsToday, trend: 'Scheduled', positive: true, icon: <Calendar size={18} />, accentClass: 'accent-green', iconClass: 'icon-green' },
    { label: 'Completion Rate', value: `${metrics.completionRate}%`, trend: 'Finished', positive: metrics.completionRate > 50, icon: <CheckCircle2 size={18} />, accentClass: 'accent-green', iconClass: 'icon-green' }
  ];

  return (
    <div className="dashboard-page">
      {/* ---- Top Navigation Bar ---- */}
      <nav className="dashboard-topnav">
        <div className="topnav-left">
          <div className="topnav-logo">P</div>
          <span className="topnav-studio-name">Podea</span>
        </div>

        <div className="topnav-center">
          <Calendar size={14} />
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        <div className="topnav-right">
          <div className="topnav-avatar" title={auth.currentUser?.displayName || 'User'}>
            {userInitials}
          </div>
          <RoleGate allowedRoles={['studio_admin', 'platform_admin']}>
            <button 
              className="topnav-icon-btn" 
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </RoleGate>
          <button 
            className="topnav-icon-btn" 
            onClick={() => auth.signOut()}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* ---- Dashboard Content ---- */}
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-title">
            <h1 className="font-serif">
              Welcome back, {claims?.role === 'platform_admin' ? 'Platform Admin' : 'Studio Manager'}
            </h1>
            <p>Here's what's happening at your studio today.</p>
          </div>
        </header>

        {/* ---- Stats Overview ---- */}
        <div className="stats-grid">
          {statCards.map((stat, idx) => (
            <div key={idx} className={`stat-card ${stat.accentClass}`}>
              <div className="stat-card-top">
                <h3 className="stat-card-header">{stat.label}</h3>
                <div className={`stat-icon-container ${stat.iconClass}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="stat-card-value">{stat.value}</div>
              <span className={`stat-card-trend ${stat.positive ? 'trend-positive' : 'trend-neutral'}`}>
                {stat.trend}
              </span>
            </div>
          ))}
        </div>

        {/* ---- Main Content Grid ---- */}
        <div className="dashboard-layout">
          
          {/* Left Column: Arrivals */}
          <div className="arrivals-section">
            <div className="section-header">
              <h2 className="font-serif">Today's Arrivals</h2>
              <Button variant="secondary" onClick={() => navigate('/dashboard')} style={{ fontSize: '13px', padding: '6px 16px' }}>
                Refresh
              </Button>
            </div>

            <div className="arrivals-list">
              {/* Table header */}
              <div className="arrivals-table-header">
                <div className="arrivals-col-time">Time</div>
                <div className="arrivals-col-client">Client &amp; Service</div>
                <div className="arrivals-col-actions">Status</div>
              </div>

              {initialArrivals.length === 0 ? (
                <div className="arrivals-empty">
                  <div className="arrivals-empty-icon">
                    <CalendarCheck size={22} />
                  </div>
                  <p className="arrivals-empty-title">No appointments scheduled</p>
                  <p className="arrivals-empty-text">When clients check in, they'll appear here in real time.</p>
                </div>
              ) : (
                initialArrivals.map((arrival) => {
                  const isPitched = pitchedUpsellIds.includes(arrival.id);
                  const isClickable = arrival.status === 'arrived' || arrival.status === 'in_session';
                  
                  return (
                    <div 
                      key={arrival.id} 
                      className={`arrival-row ${isClickable ? 'clickable' : ''}`}
                      onClick={() => {
                        if (isClickable) navigate(`/practitioner/chart/${arrival.id}`);
                      }}
                    >
                      <div className="arrival-time">{arrival.time}</div>
                      
                      <div className="arrival-info">
                        <div className="client-name-wrapper">
                          <span className="client-name">{arrival.clientName}</span>
                          {arrival.isVIP && <span className="vip-badge">VIP</span>}
                        </div>
                        <div className="arrival-service">{arrival.service}</div>
                      </div>

                      <div className="arrival-actions" onClick={(e) => e.stopPropagation()}>
                        {arrival.upsellSuggestion && (arrival.status === 'expected' || arrival.status === 'arrived') && (
                          <div className="inline-upsell-pitch">
                            <span className="pitch-text">
                              {isPitched ? '✨ Upgrade Applied!' : `✨ ${arrival.upsellSuggestion}`}
                            </span>
                            {!isPitched && (
                              <button 
                                onClick={() => handlePitchUpsell(arrival.id, arrival.clientName, arrival.upsellSuggestion!)}
                                className="podea-btn podea-btn-accent"
                                style={{ padding: '3px 10px', fontSize: '11px', borderRadius: '4px' }}
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

                        {isClickable && (
                          <Button 
                            variant="primary" 
                            onClick={() => navigate(`/practitioner/chart/${arrival.id}`)}
                            style={{ padding: '5px 14px', fontSize: '12px' }}
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

          {/* Right Column: Alerts & Intelligence */}
          <div className="sidebar-column">
            
            {/* Action Required / Alerts */}
            <div className="alerts-section">
              <div className="alerts-section-header">
                <div className="alerts-icon-container">
                  <Bell size={14} />
                </div>
                <h2 className="font-serif">Action Required</h2>
              </div>

              <div className="alerts-list">
                {activeAlerts.length === 0 ? (
                  <div className="alerts-empty">
                    ✓ All caught up! No critical actions required.
                  </div>
                ) : (
                  activeAlerts.map(alert => (
                    <div key={alert.id} className={`alert-item alert-severity-${alert.severity}`}>
                      <div className="alert-content">
                        <p className="alert-message">{alert.message}</p>
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

            {/* Revenue Intelligence */}
            <div className="intelligence-card">
              <h3>
                <Sparkles size={16} /> Revenue Intelligence
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
                  <div style={{ padding: 'var(--spacing-md)', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textAlign: 'center' }}>
                    No active upsell opportunities remaining.
                  </div>
                )}
              </div>

              {/* Active Rules */}
              <hr className="intelligence-divider" />
              <h4 className="active-rules-header">
                <Award size={14} /> Active Upsell Rules ({activeRules.length})
              </h4>
              <div className="active-rules-list">
                {activeRules.map(rule => (
                  <div key={rule.id} className="active-rule-item">
                    Trigger Service IDs: {rule.triggerServiceIds.join(', ')}
                  </div>
                ))}
              </div>

              {/* Revenue Progress */}
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
                  <span>Projected: {goalProgressPercentage}% Achieved</span>
                  <span>Incl. Upsell</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
