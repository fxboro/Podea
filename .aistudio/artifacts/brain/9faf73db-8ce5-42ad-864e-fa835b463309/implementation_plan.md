# Podea Beta Production: Supabase Secure Authentication & Role Gating

This implementation plan transitions Podea from a prototype role switcher to an enterprise-grade, secure production authentication architecture powered by Supabase Auth and PostgreSQL Row Level Security (RLS), supporting Email/Password, Google OAuth, and strict role-based access gating for Admins, Practitioners, and Kiosk Terminals.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Client Check-in vs. Staff Authentication**:
> - **Clients (Kunden)** continue using frictionless phone number lookup and touchscreen digital signatures on the reception tablet without creating personal Supabase passwords or email accounts.
> - **Studio Staff & Admins** authenticate via Supabase Auth (Email/Password or Google OAuth).
> - **Tablet Terminals (Kiosk Mode)** authenticate as a dedicated, restricted device session bound to the studio tenant to prevent clients from tampering with clinic records or administrative controls.

- **Confirmed Decision 1**: Supabase Auth handles both Email/Password authentication and Google OAuth sign-in.
- **Confirmed Decision 2**: Role gating is enforced via a Supabase `profiles` table linked to `auth.users`, with roles: `admin`, `practitioner`, and `tablet`.
- **Open Configuration**: Supabase environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) will be managed via `.env` with a secure setup banner if credentials are not yet populated.

---

## 1. Overview & Core Concept

### What It Does
Replaces the unauthenticated demo role selector with a secure authentication and authorization layer. Studio owners, practitioners, and reception terminals sign in through a branded, accessible modal supporting password credentials and Google Single Sign-On (SSO). Upon authentication, the system verifies the user's role and routes them directly to their scoped portal while denying unauthorized access.

### Target Personas
1. **Studio Inhaberin / Admin**: Full administrative privileges over financial dashboards, ISO/GDPR compliance reports, practitioner rosters, and clinic settings.
2. **Behandler/in (Practitioner)**: Scoped access to assigned arriving clients, clinical health flags, treatment documentation, and billing printouts.
3. **Check-in Tablet (Reception)**: Restricted self-service kiosk mode running the patient check-in flow with zero exposure to clinic management or other patients' records.
4. **Clients**: Painless check-in at reception using phone number lookup without password friction.

### Key Value
- **DSGVO / GDPR Art. 9 Compliance**: Health records and signatures are protected behind encrypted sessions rather than open demo cards.
- **No Role Spying**: Practitioners cannot access clinic financials; clients cannot exit the kiosk terminal.
- **Zero Friction for Patients**: Retains fast reception check-in while hardening back-office security.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Staff Sign-in**:
   - Accessing `/` or clicking *"Mitarbeiter Login"* presents an editorial, calm login modal styled with Podea’s warm minimalist design language.
   - Users can choose between **Email & Password** or one-click **"Mit Google fortfahren"**.
   - Input validation provides instant inline feedback for format and credential errors.
2. **Role-Based Redirection**:
   - `admin` $\rightarrow$ redirected to `AdminDashboard` with compliance audit tools and revenue analytics.
   - `practitioner` $\rightarrow$ redirected to `PractitionerArrivals` filtered to their assigned chair/station.
   - `tablet` $\rightarrow$ locked into `TabletCheckinFlow` in full-screen kiosk mode.
3. **Session Persistence & Lock Screen**:
   - Active sessions persist securely in memory and refresh tokens via Supabase.
   - Header displays authenticated user profile (name, role badge, avatar/initials) with a **"Abmelden" (Sign out)** action.
   - Quick-lock PIN capability for shared practitioner treatment tablets.

### Visual Identity & Theme
- **Palette**: Deep slate primary (`#1F2A37`), warm stone surfaces (`#FDFBF7`, `#F5F2EB`), and metallic sage accents (`#6B8E78` / `#8FA89B`).
- **Typography**: Editorial serif headings (`Playfair Display` / serif font) paired with clean sans-serif UI typography for clinical clarity.
- **Micro-Interactions**: Smooth modal fade-in, responsive tab switching between Sign In and Password Reset, and animated loading indicators during OAuth redirects.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Authentication Engine (Supabase Auth)
- **Chosen Approach**: Integrate `@supabase/supabase-js` for identity, JWT session management, and OAuth flows.
- **Why**: Standardized OAuth 2.0 / PKCE handling, built-in email verification, PostgreSQL RLS compatibility, and easy local dev configuration.
- **Trade-Off**: Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. A graceful dev fallback mode is provided so local prototyping remains functional if keys are empty.

### Decision 2: Client Reception Kiosk Architecture
- **Chosen Approach**: Reception tablets run under an authenticated `tablet` role rather than anonymous public access.
- **Why**: Prevents arbitrary unauthenticated internet requests from flooding the check-in database, while allowing clients to check in without creating passwords.

### Decision 3: Role Hierarchy & Permission Gate
- **Role Permissions**:
  - `admin`: All views (`adminDashboard`, `adminSettings`, `practitionerArrivals`, `practitionerClient`, `tabletCheckin`).
  - `practitioner`: Treatment views only (`practitionerArrivals`, `practitionerClient`).
  - `tablet`: Kiosk view only (`tabletCheckin`).

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Podea Client Application                        │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                    Supabase Auth Provider                      │   │
│   │       (Session state, user profile, role token, sign-out)      │   │
│   └───────────────┬────────────────────────────────┬───────────────┘   │
│                   │                                │                   │
│         [Email/Password]                     [Google OAuth]            │
│                   │                                │                   │
│                   ▼                                ▼                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     Role Gate & Route Guard                    │   │
│   │        Inspects profile.role: 'admin' | 'practitioner'         │   │
│   └───────┬────────────────────────┬───────────────────────────────┘   │
│           │                        │                                   │
│           ▼                        ▼                                   │
│    ┌──────────────┐         ┌──────────────┐         ┌───────────────┐ │
│    │ Studio Admin │         │ Practitioner │         │ Kiosk Tablet  │ │
│    │  Dashboard   │         │   Arrivals   │         │   Check-in    │ │
│    └──────────────┘         └──────────────┘         └───────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Supabase API (HTTPS / WSS)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Supabase Cloud / Backend                        │
│  ┌───────────────────────┐          ┌────────────────────────────────┐ │
│  │   auth.users (Auth)   │ ───────> │  public.profiles (RBAC Role)   │ │
│  │  (Email, Google OAuth)│          │  (uid, role, studio_id, name)  │ │
│  └───────────────────────┘          └────────────────────────────────┘ │
│                                                     │                  │
│                                                     ▼                  │
│                                     ┌────────────────────────────────┐ │
│                                     │     PostgreSQL RLS Policies    │ │
│                                     │ (clients, checkins, audit_log) │ │
│                                     └────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Schema (PostgreSQL via Supabase)
1. **`profiles`**:
   - `id`: `uuid` primary key (references `auth.users.id` on delete cascade)
   - `role`: `text` check (`role IN ('admin', 'practitioner', 'tablet')`)
   - `full_name`: `text`
   - `studio_id`: `text` (default `'podea-main'`)
   - `created_at`: `timestamp with time zone`
2. **Security & RLS**:
   - `profiles` select: `auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`
   - Protected client records only queryable by authenticated `admin` and `practitioner` roles.

### Next Steps Upon Approval:
1. Install `@supabase/supabase-js`.
2. Create Supabase client utility (`src/lib/supabase.ts`) and `.env.example`.
3. Create `AuthContext.tsx` with session listener, Google OAuth popup/redirect, email login, and role resolution.
4. Build `AuthModal.tsx` and `RoleGate.tsx` components.
5. Secure existing views (`AdminDashboard`, `PractitionerArrivals`) behind the authenticated role gate.
