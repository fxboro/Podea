
export type Language = 'de' | 'en';

export interface Translations {
  de: string;
  en: string;
}

export type Role = 'admin' | 'practitioner' | 'tablet';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  studioId?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface StaffMember {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'practitioner';
  specialization?: string;
  status: 'active' | 'invited' | 'inactive';
  invitedAt?: string;
  lastActive?: string;
  notes?: string;
  metadata?: {
    role: string;
    full_name: string;
    studio_id: string;
    specialization?: string;
    invited_by?: string;
    notes?: string;
  };
}

export type View = 
  | 'landing'
  | 'roleSelector'
  | 'login'
  | 'adminDashboard'
  | 'adminSettings'
  | 'practitionerArrivals'
  | 'practitionerClient'
  | 'tabletCheckin';

export interface Client {
  id: number;
  name: string;
  phone: string;
  appointmentTime: string;
  practitioner: string;
  status: 'waiting' | 'in-progress' | 'done' | 'late';
  medicalFlags: string[];
  lastTreatment: string;
  notes: string[];
  signature?: string;
  signatureTimestamp?: string;
  consentGiven?: boolean;
  history?: TreatmentHistoryEntry[];
  // Refined Upsell Structure
  suggestedUpsells: { 
    name: string; 
    price: number; 
    reason: string; // The "Why"
    category: 'product' | 'service';
  }[];
}

export interface TreatmentHistoryEntry {
  id: string;
  date: string;
  treatment: string;
  practitioner: string;
  durationMinutes?: number;
  notes: string;
  medicalFlags?: string[];
  purchasedItems?: string[];
}

export interface Service {
    name: string;
    price: number;
    vat: number;
    duration: number;
}

export interface Addon {
    name: string;
    price: number;
}

export interface Product {
    name: string;
    type: 'retail' | 'consumable';
    stock: number;
    lowStockThreshold: number;
}

// New Interface for Admin Rules
export interface RecommendationRule {
    id: number;
    condition: string;
    suggestion: string;
    active: boolean;
}
