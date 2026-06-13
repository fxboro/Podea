# Podea Production Security Checklist & QA Test Matrix

This document defines Podea's security boundaries, compliance requirements (GDPR/HIPAA), and validation testing strategy.

---

## 1. QA Test Matrix

Podea utilizes a multi-tiered testing strategy to guarantee security, data isolation, and user-flow validation before production release.

### A. Test Execution Plan

| Test Category | Target Component | Tooling | Execution Command | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Firestore Security Rules** | Database Rules | Jest / Firebase Rules Emulator | `npm run test:backend` | Assures tenant-isolation boundaries and role checks prevent unauthorized access. |
| **End-to-End (E2E)** | Auth & Kiosk flow | Playwright | `npm run test:e2e` | Simulates guest check-in, registration, and onboarding flows. |
| **Cloud Functions** | Event/Audit triggers | Jest | `npm run test:backend` | Assures audit trail generation and compliance triggers run on intake submission. |

---

### B. Manual Verification Matrix (QA checklist)

- [ ] **Onboarding & Subscription Check**:
  - Sign up as a new user, navigate to checkout, simulate billing webhook, verify user gets upgraded to `studio_admin` claims automatically.
- [ ] **Kiosk Patient Flow**:
  - Access kiosk via tablet view, search client by name/phone, complete intake form submission, check signature captures, verify check-in logs.
- [ ] **Practitioner Workspace Review**:
  - Log in as practitioner, access Review Queue, verify critical warnings load, complete treatment notes draft, sign off session, verify data status changes.
- [ ] **Inventory settings**:
  - Lower stock item below reorder trigger point, verify low stock alert displays on dashboard Action Required panel.

---

## 2. Production Security Checklist

Prior to launching to production, verify the following configuration vectors:

### A. Authentication & Custom Claims
- [ ] Custom user claims (`studioId`, `role`) are protected. Writes to custom user claims are restricted to the Cloud Function `setCustomUserClaims` which executes under strict permission controls.
- [ ] All client-side routers verify claims configurations through `ProtectedRoute` and `RoleGate`.
- [ ] Firebase Auth tokens are configured with standard expirations; client-side listeners refresh tokens on claim updates.

### B. Multi-Tenant Database Isolation
- [ ] **Firestore Rules Enforced**:
  - `request.auth.token.studioId == studioId` is appended to all matching queries within the `/studios/{studioId}` sub-path.
  - Frontdesk staff members are strictly forbidden from viewing clinical files (`/treatments/{treatmentId}`).
  - Audit logs are immutable and can only be updated via functions admin contexts.

### C. Secrets Management
- [ ] Third-party credentials (Twilio tokens, Lexoffice API keys, Stripe/Paddle webhook signatures) are stored securely using Google Cloud Secret Manager (configured via `defineSecret`).
- [ ] API keys are never checked into git repos or hardcoded into functions scripts.

---

## 3. GDPR Compliance Framework

### A. Right to Erasure (Right to be Forgotten)
Podea includes a compliance execution path to purge Personally Identifiable Information (PII) and Protected Health Information (PHI) while maintaining financial reporting constraints.

1. **Triggering**: Executed via the callable cloud function `processGdprDeletion` (restricted to `studio_admin` or `platform_admin`).
2. **Purge Action**:
   - Deletes Client profile.
   - Cleans all related records in `intake_submissions`, `consents`, `treatments`, `risk_flags`, and `appointments` sub-collections.
   - Financial ledger entries in accounting logs remain anonymous to preserve accounting balances without leaking PII.
3. **Audit Trail**: Logs the event securely to the immutable audit trail with an anonymized operator footprint.

### B. PHI Isolation (Data Minimization)
- Medical details, signatures, and treatment pictures are isolated from regular receptionist views. Only designated practitioner and admin roles can fetch charting sub-collections.

---

## 4. Performance & Caching Audits

To ensure responsive and cost-effective database queries:

- **Query Indexing**: Custom Firestore index rules are defined in `firestore.indexes.json` to prevent un-indexed query errors when loading appointments sorted by time.
- **Client Bundling**: Vite uses route-based code splitting to ensure that heavy practitioner/settings modules do not slow down the lightweight kiosk tablet loading time.
