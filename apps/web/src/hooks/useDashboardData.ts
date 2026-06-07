import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment, Service, Client, Product, UpsellRule, AddOn, RiskFlag } from '@podea/shared-types/interfaces';

export interface DashboardMetrics {
  revenueToday: number;
  revenueMonth: number;
  appointmentsToday: number;
  completionRate: number;
  upsellRevenueToday: number;
  upsellConversionRate: number;
  totalPotentialRevenue: number;
}

export interface ProcessedArrival {
  id: string;
  clientName: string;
  time: string;
  service: string;
  status: Appointment['status'] | 'expected' | 'arrived' | 'in_session';
  upsellSuggestion?: string;
  isVIP?: boolean;
}

export interface DashboardAlert {
  id: string;
  type: 'inventory' | 'compliance' | 'system';
  message: string;
  severity: 'low' | 'medium' | 'critical';
}

export const useDashboardData = () => {
  const { claims } = useAuth();
  const studioId = claims?.studioId;

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenueToday: 0,
    revenueMonth: 0,
    appointmentsToday: 0,
    completionRate: 0,
    upsellRevenueToday: 0,
    upsellConversionRate: 0,
    totalPotentialRevenue: 0,
  });
  
  const [arrivals, setArrivals] = useState<ProcessedArrival[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [activeRules, setActiveRules] = useState<UpsellRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studioId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch Appointments for today
        const appointmentsRef = collection(db, 'studios', studioId, 'appointments');
        const qToday = query(
          appointmentsRef,
          where('startTime', '>=', Timestamp.fromDate(today)),
          where('startTime', '<=', Timestamp.fromDate(endOfDay)),
          orderBy('startTime', 'asc')
        );
        const todaySnapshot = await getDocs(qToday);
        const todayAppointments = todaySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));

        // Fetch References
        const clientsRef = collection(db, 'studios', studioId, 'clients');
        const servicesRef = collection(db, 'studios', studioId, 'services');
        const rulesRef = collection(db, 'studios', studioId, 'upsellRules');
        const addonsRef = collection(db, 'studios', studioId, 'addons');
        const flagsRef = collection(db, 'studios', studioId, 'risk_flags');
        
        const [clientsSnap, servicesSnap, rulesSnap, addonsSnap, flagsSnap] = await Promise.all([
          getDocs(clientsRef),
          getDocs(servicesRef),
          getDocs(rulesRef),
          getDocs(addonsRef),
          getDocs(flagsRef)
        ]);

        const clientsMap = new Map(clientsSnap.docs.map(d => [d.id, d.data() as Client]));
        const servicesMap = new Map(servicesSnap.docs.map(d => [d.id, d.data() as Service]));
        const addonsMap = new Map(addonsSnap.docs.map(d => [d.id, d.data() as AddOn]));
        const rules = rulesSnap.docs.map(d => ({ id: d.id, ...d.data() } as UpsellRule)).filter(r => r.active);
        setActiveRules(rules);

        // Map risk flags by clientId
        const flagsMap = new Map<string, RiskFlag[]>();
        flagsSnap.docs.forEach(d => {
          const flag = { id: d.id, ...d.data() } as RiskFlag;
          const list = flagsMap.get(flag.clientId) || [];
          list.push(flag);
          flagsMap.set(flag.clientId, list);
        });

        // Metrics calculations setup
        let revToday = 0;
        let upsellRevToday = 0;
        let completedToday = 0;
        let totalPitchesToday = 0;
        let acceptedPitchesToday = 0;
        let potentialRevenueToday = 0;

        const processedArrivals: ProcessedArrival[] = [];

        for (const appt of todayAppointments) {
          const service = servicesMap.get(appt.serviceId);
          const client = clientsMap.get(appt.clientId);
          const clientFlags = flagsMap.get(appt.clientId) || [];
          const isVIP = client?.tags?.includes('vip') || false;
          
          let basePrice = service ? service.price : 0;
          let apptUpsellPrice = 0;

          // Calculate actual revenue from completed appointment addons
          if (appt.addOnIds && appt.addOnIds.length > 0) {
            appt.addOnIds.forEach(addonId => {
              const addon = addonsMap.get(addonId);
              if (addon) {
                apptUpsellPrice += addon.price;
              }
            });
          }

          if (appt.status === 'completed') {
            completedToday++;
            revToday += basePrice + apptUpsellPrice;
            upsellRevToday += apptUpsellPrice;
          }

          // Rule-based Upsell Engine Logic with Risk Filters & VIP Preference
          let upsellSuggestion = undefined;
          
          if (appt.status === 'scheduled' || appt.status === 'checked_in') {
            const applicableRule = rules.find(r => r.triggerServiceIds.includes(appt.serviceId));
            if (applicableRule && applicableRule.recommendedAddOnIds && applicableRule.recommendedAddOnIds.length > 0) {
              
              // 1. Gather candidates
              let candidateAddOns = applicableRule.recommendedAddOnIds
                .map(id => addonsMap.get(id))
                .filter((addon): addon is AddOn => addon !== undefined && addon.status === 'active');

              // 2. Apply Risk Filters: Exclude add-ons containing ingredients client is allergic to
              if (clientFlags.length > 0) {
                candidateAddOns = candidateAddOns.filter(addon => {
                  const hasContraindication = clientFlags.some(flag => {
                    const desc = flag.description.toLowerCase();
                    const addonName = addon.name.toLowerCase();
                    // Match descriptors like allergy or warning triggers
                    return desc.includes(addonName) || addonName.split(' ').some(word => word.length > 3 && desc.includes(word));
                  });
                  return !hasContraindication;
                });
              }

              // 3. VIP prioritization: sort by price descending to offer premium upgrades
              if (isVIP) {
                candidateAddOns.sort((a, b) => b.price - a.price);
              } else {
                candidateAddOns.sort((a, b) => a.price - b.price);
              }

              // 4. Recommend the best fit candidate
              if (candidateAddOns.length > 0) {
                const bestFitAddon = candidateAddOns[0];
                upsellSuggestion = `Add ${bestFitAddon.name} (+€${bestFitAddon.price})`;
                totalPitchesToday++;
                potentialRevenueToday += bestFitAddon.price;

                if (appt.addOnIds && appt.addOnIds.includes(bestFitAddon.id!)) {
                  acceptedPitchesToday++;
                }
              }
            }
          }

          const arrivalStatusMap: Record<string, ProcessedArrival['status']> = {
            'scheduled': 'expected',
            'checked_in': 'arrived',
            'in_progress': 'in_session',
            'completed': 'completed',
            'cancelled': 'expected', // fallback mapping
          };

          processedArrivals.push({
            id: appt.id!,
            clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
            time: (appt.startTime as any).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            service: service ? service.name : 'Unknown Service',
            status: arrivalStatusMap[appt.status] || 'expected',
            upsellSuggestion,
            isVIP
          });
        }

        setArrivals(processedArrivals);
        
        const calculatedConversionRate = totalPitchesToday > 0 
          ? Math.round((acceptedPitchesToday / totalPitchesToday) * 100) 
          : 0;

        // Calculate Month Revenue: daily total projected + safe extrapolation
        setMetrics({
          revenueToday: revToday,
          revenueMonth: revToday * 20, 
          appointmentsToday: todayAppointments.length,
          completionRate: todayAppointments.length ? Math.round((completedToday / todayAppointments.length) * 100) : 0,
          upsellRevenueToday: upsellRevToday,
          upsellConversionRate: calculatedConversionRate,
          totalPotentialRevenue: revToday + potentialRevenueToday
        });

        // Aggregating Alerts
        const newAlerts: DashboardAlert[] = [];
        
        // 1. Inventory Alerts
        const productsRef = collection(db, 'studios', studioId, 'products');
        const productsSnap = await getDocs(productsRef);
        productsSnap.docs.forEach(doc => {
          const product = doc.data() as Product;
          if (product.reorderPoint !== undefined && product.stockLevel <= product.reorderPoint) {
            newAlerts.push({
              id: `inv_${product.id}`,
              type: 'inventory',
              message: `${product.name} is running low (${product.stockLevel} remaining)`,
              severity: product.stockLevel === 0 ? 'critical' : 'medium'
            });
          }
        });

        // 2. Compliance Alerts (Pending Review Consents)
        const consentsRef = collection(db, 'studios', studioId, 'consents');
        const pendingConsentsSnap = await getDocs(query(consentsRef, where('practitionerReviewed', '==', false)));
        if (!pendingConsentsSnap.empty) {
           newAlerts.push({
             id: 'comp_consents',
             type: 'compliance',
             message: `${pendingConsentsSnap.size} Medical Consents require Practitioner Review`,
             severity: 'critical'
           });
        }

        setAlerts(newAlerts);

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studioId]);

  return { metrics, arrivals, alerts, activeRules, loading };
};
