import { z } from 'zod';

// Reusable base entity trait for all documents to include common timestamps
const baseEntity = z.object({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 1. Global Collections
export const UserSchema = baseEntity.extend({
  uid: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  globalRoles: z.array(z.string()).optional() // e.g., ["platform_admin"]
});

// 2. Tenant Root & Configuration
export const StudioSchema = baseEntity.extend({
  id: z.string().min(1),
  name: z.string().min(1),
  timezone: z.string().min(1), // e.g., "America/New_York"
  currency: z.string().min(1), // e.g., "USD"
  branding: z.object({
    logoUrl: z.string().url().optional(),
    primaryColor: z.string().optional()
  }).optional(),
  status: z.enum(['active', 'suspended'])
});

// 3. Tenant Subcollections

export const ClientSchema = baseEntity.extend({
  id: z.string().optional(), // usually document ID
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  dob: z.date(),
  gdprConsentDate: z.date().optional(), // required for EU, making optional generally
  status: z.enum(['active', 'inactive', 'flagged']),
  tags: z.array(z.string()).optional()
});

export const MembershipSchema = baseEntity.extend({
  id: z.string().optional(),
  clientId: z.string().min(1),
  tierName: z.string().min(1),
  status: z.enum(['active', 'past_due', 'cancelled']),
  billingCycle: z.enum(['monthly', 'annual']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  creditsRemaining: z.number().int().default(0)
});

export const ServiceSchema = baseEntity.extend({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  durationMinutes: z.number().min(1),
  price: z.number().min(0),
  colorCode: z.string().optional(),
  requiredConsentTemplateIds: z.array(z.string()).optional(),
  status: z.enum(['active', 'archived'])
});

export const AddOnSchema = baseEntity.extend({
  id: z.string().optional(),
  name: z.string().min(1),
  durationAddedMinutes: z.number().min(0),
  price: z.number().min(0),
  applicableServiceIds: z.array(z.string()).optional(),
  status: z.enum(['active', 'archived'])
});

export const ProductSchema = baseEntity.extend({
  id: z.string().optional(),
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  stockLevel: z.number().int(),
  reorderPoint: z.number().int().optional(),
  status: z.enum(['active', 'archived'])
});

export const InventoryLogSchema = baseEntity.extend({
  id: z.string().optional(),
  productId: z.string().min(1),
  changeAmount: z.number().int(),
  previousStock: z.number().int(),
  newStock: z.number().int(),
  reason: z.enum(['sale', 'restock', 'adjustment', 'damage']),
  userId: z.string().min(1),
  timestamp: z.date()
});

export const AppointmentSchema = baseEntity.extend({
  id: z.string().optional(),
  clientId: z.string().min(1),
  staffId: z.string().min(1),
  serviceId: z.string().min(1),
  addOnIds: z.array(z.string()).optional(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(['scheduled', 'checked_in', 'in_progress', 'completed', 'no_show', 'cancelled']),
  notes: z.string().optional()
});

export const CheckinSchema = baseEntity.extend({
  id: z.string().optional(),
  clientId: z.string().min(1),
  appointmentId: z.string().optional(),
  checkinTime: z.date(),
  method: z.enum(['kiosk', 'frontdesk', 'mobile_app'])
});

export const ConsentTemplateSchema = baseEntity.extend({
  id: z.string().optional(),
  title: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  version: z.number().int().min(1),
  requiresSignature: z.boolean().default(true),
  status: z.enum(['draft', 'published', 'archived'])
});

export const ConsentSchema = baseEntity.extend({
  id: z.string().optional(),
  clientId: z.string().min(1),
  templateId: z.string().min(1),
  templateVersion: z.number().int().min(1),
  appointmentId: z.string().optional(),
  signedAt: z.date(),
  signatureDataUrl: z.string().optional(),
  ipAddress: z.string().optional(),
  status: z.enum(['valid', 'revoked', 'expired']).default('valid'),
  pdfUrl: z.string().url().optional(), // For PDF export
  practitionerReviewed: z.boolean().default(false),
  practitionerId: z.string().optional()
});

export const IntakeFormTemplateSchema = baseEntity.extend({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  version: z.number().int().min(1),
  fields: z.array(z.object({
    id: z.string().min(1),
    type: z.enum(['text', 'textarea', 'boolean', 'select', 'multiselect', 'date']),
    label: z.string().min(1),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(), // For select/multiselect
    riskTriggers: z.array(z.object({
      condition: z.any(), // e.g. "Yes", or a specific option
      severity: z.enum(['low', 'medium', 'critical']),
      flagDescription: z.string()
    })).optional()
  })),
  status: z.enum(['draft', 'published', 'archived'])
});

export const IntakeFormSubmissionSchema = baseEntity.extend({
  id: z.string().optional(),
  clientId: z.string().min(1),
  templateId: z.string().min(1),
  templateVersion: z.number().int().min(1),
  appointmentId: z.string().optional(),
  submittedAt: z.date(),
  data: z.record(z.any()), // Map of fieldId -> value
  practitionerReviewed: z.boolean().default(false),
  practitionerId: z.string().optional(),
  reviewNotes: z.string().optional(),
  pdfUrl: z.string().url().optional()
});

export const TreatmentSchema = baseEntity.extend({
  id: z.string().optional(),
  clientId: z.string().min(1),
  appointmentId: z.string().min(1),
  staffId: z.string().min(1),
  notes: z.string().min(1),
  beforePhotoUrls: z.array(z.string().url()).optional(),
  afterPhotoUrls: z.array(z.string().url()).optional(),
  chartingData: z.record(z.any()).optional()
});

export const RiskFlagSchema = baseEntity.extend({
  id: z.string().optional(),
  clientId: z.string().min(1),
  type: z.enum(['medical_condition', 'allergy', 'behavioral']),
  severity: z.enum(['low', 'medium', 'critical']),
  description: z.string().min(1),
  resolvedAt: z.date().optional(),
  createdBy: z.string().optional()
});

export const UpsellRuleSchema = baseEntity.extend({
  id: z.string().optional(),
  triggerServiceIds: z.array(z.string()),
  recommendedAddOnIds: z.array(z.string()).optional(),
  recommendedProductIds: z.array(z.string()).optional(),
  pitchScript: z.string().optional(),
  active: z.boolean().default(true)
});

export const DashboardSchema = baseEntity.extend({
  id: z.string().optional(),
  userId: z.string().min(1),
  layoutConfig: z.record(z.any()),
  defaultDateRange: z.string().optional()
});

export const AuditLogSchema = baseEntity.extend({
  id: z.string().optional(),
  action: z.string().min(1),
  actorId: z.string().min(1),
  targetType: z.string().min(1),
  targetId: z.string().min(1),
  timestamp: z.date(),
  diff: z.record(z.any()).optional()
});
