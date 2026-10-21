# Podea — Intelligent Studio Check-in & Compliance Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Custom_Design_System-38b2ac.svg)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_Ready-purple.svg)](https://web.dev/progressive-web-apps/)

**Podea** is an intelligent check-in, clinical documentation, and regulatory compliance platform engineered specifically for **podiatry practices, medical foot care clinics, and wellness studios**. It digitizes front-desk reception, enforces stringent medical compliance (German Civil Code § 630f BGB & EU GDPR Art. 7/9), unlocks intelligent treatment upsells, and provides practice owners with an enterprise-grade administrative cockpit.

---

## 🌟 Key Features

### 1. 📱 Self-Service Tablet Kiosk (`TabletCheckinFlow.tsx`)
- **Frictionless Patient Check-in**: Automated telephone verification lookup for returning and new patients.
- **GDPR / DSGVO Art. 7 & 9 Compliance**: Legally compliant medical data consent forms with interactive electronic signature capture (`react-signature-canvas`).
- **Targeted Medical Anamnesis**: Guided clinical health questionnaires assessing high-risk conditions:
  - Diabetic foot syndrome (*Diabetiker Typ I/II*)
  - Anticoagulant therapy (*Blutverdünner / Marcumar*)
  - Cardiac pacemakers & electronic implants (*Herzschrittmacher*)
  - Contact allergies and neurodermatitis (*Allergien / Pflasterallergie*)
- **Reception Queue Dispatch**: Real-time broadcast alerting practitioners the exact moment a patient completes check-in.

### 2. 🩺 Practitioner Clinical Workspace (`PractitionerArrivals.tsx`, `ClientDetailView.tsx`)
- **Arrivals Board**: Real-time queue showing waiting patients, scheduled arrival times, assigned practitioner, and highlighted medical warnings.
- **Treatment Stopwatch & Timer**: Integrated procedure stopwatch tracking treatment duration in accordance with billing time blocks.
- **Audit-Proof Documentation (§ 630f BGB)**:
  - Structured clinical notes with timestamped quick phrases.
  - Sterilization & Instrument Protocol: Mandatory verification of autoclave sterile packaging batch numbers (*Sterilgutdokumentation*).
  - Pre-treatment safety checklists enforcing risk assessment prior to sharp instrument use.
- **Intelligent Treatment Upsells**: Context-aware product and add-on recommendations (e.g., medical foot balms, silicone pressure reliefs, orthotic braces) calculated from patient findings.
- **Dual Signatures**: Patient and practitioner digital signature collection finalizing documentation directly on the treatment tablet.

### 3. 🧾 Audit-Proof Medical Invoicing (`PrintableInvoiceSummary.tsx`)
- **Compliant Fee Structure**: Itemized billing breaking down base treatments, statutory 19% VAT calculations, and add-on care products.
- **Hygiene & Sterilization Audit Trail**: Formally documented verification numbers for autoclaved instruments printed directly on the receipt.
- **Print & PDF Preview**: Standard DIN A4 print styling optimized for direct fiscal printing or PDF export.

### 4. 📊 Admin Command Center (`AdminDashboard.tsx`)
- **Flexible 12-Column Grid Architecture**: Enterprise dashboard layout providing optimal data density across desktop, tablet, and mobile devices.
- **Responsive Table Collapse (< 768px)**:
  - On desktop ($\ge$ 768px): High-density tabular data grids with tabular figures (`font-mono tabular-nums`) and full column data.
  - On mobile ($<$ 768px): Data tables collapse into touch-friendly, finger-spaced cards containing status badges, clinical warnings, and direct-action triggers—eliminating horizontal scrolling.
- **Recharts Analytics Hub**:
  - Daily revenue breakdown comparing base treatment revenue and AI-driven upsell revenue.
  - Toggle between stacked bars, grouped bars, and intraday hourly progression curves.
  - 7-day revenue total, upsell conversion rate, and average added margin per patient.
- **Multi-Tab Data Journal**:
  - *Today’s Schedule & Appointments*: Live search, status filtering (*Waiting*, *In Progress*, *Done*), and direct record inspection.
  - *Billing & Invoice Journal*: Real-time record of completed checkouts, payment methods (EC-Karte, Cash, Invoice), and fiscal status.
  - *Practitioner Shifts & Room Allocation*: Room assignments, completion progress, and upsell metrics per clinician.
- **Live Waiting Room Monitor**: Real-time indicator tracking patient wait times in reception with one-click call-in actions.

### 5. 🛡️ Interactive Compliance & Risk Analysis (`ComplianceReportModal.tsx`)
- **D3.js Data Visualizations**:
  - `D3DailyCheckinTrends.tsx`: Interactive multi-metric area chart with date filtering and volume trends.
  - `D3MedicalFlagDistribution.tsx`: Dynamic distribution chart detailing high-risk clinical conditions across the patient base.
- **Audit Scorecards**: Instant visibility into GDPR consent coverage, sterilization logs, and documentation completeness.

### 6. 👥 Role-Based Access Control (RBAC) & Team Management (`AdminUserManagement.tsx`)
- **Supabase Auth Integration**: Secure authentication with role-based access separating **Studio Admins** and **Practitioners**.
- **Staff Invitation Flow**: Dedicated interface for inviting new podiatrists and co-admins via metadata provisioning.
- **Role Gate Enforcer (`RoleGate.tsx`)**: Route-level protection safeguarding sensitive business settings and financial records.

### 7. 🌐 Bilingual Internationalization (`LanguageContext.tsx`)
- Native support for both **German (de)** and **English (en)** across every screen, dialog, chart tooltip, and invoice receipt.
- Instant, non-refreshing language switching accessible in the application header.

### 8. ⚡ Progressive Web App (PWA) & Offline Capability
- Offline readiness powered by `vite-plugin-pwa` and Service Worker auto-update.
- In-app install banner and button for kiosk tablet home-screen deployment.
- Real-time offline indicator alerting staff when network connectivity is disrupted.

---

## 🛠️ Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern functional components, React Hooks |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | Strict static typing and interface contracts |
| **Build Tool** | [Vite 6.2](https://vitejs.dev/) | Ultra-fast HMR and optimized production bundling |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Custom domain palette (`p-primary`, `p-accent`, `p-background`, `p-surface`) |
| **Motion & UI** | [Motion (React)](https://motion.dev/) | Fluid micro-interactions and modal transitions |
| **Charts & Dataviz** | [Recharts 3.8](https://recharts.org/) & [D3.js 7](https://d3js.org/) | Stacked revenue analytics & interactive compliance distributions |
| **Icons** | [@heroicons/react 2.2](https://heroicons.com/) | Outline and solid SVG icon sets |
| **Signatures** | `react-signature-canvas` | Vector canvas for biometric patient & clinician signatures |
| **Database & Auth** | [@supabase/supabase-js](https://supabase.com/) | Authentication, user profiles, and staff role management |
| **AI Capabilities** | [@google/genai](https://www.npmjs.com/package/@google/genai) | Gemini TypeScript SDK for intelligent upsell recommendations |

---

## 📁 Project Structure

```text
├── index.html                           # Application entry point with PWA meta & font definitions
├── index.tsx                            # Root React 19 mount & Service Worker registration
├── App.tsx                              # Main application container & global context providers
├── types.ts                             # Core TypeScript definitions (Client, View, Role, Staff)
│
├── components/
│   ├── app/
│   │   ├── AppHeader.tsx                # Universal top bar with language switch, role badge & auth
│   │   ├── MobileNav.tsx                # Bottom thumb-friendly mobile dock navigation
│   │   ├── RoleSelector.tsx             # Interactive demo role switcher (Admin / Practitioner / Kiosk)
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx       # 12-column responsive dashboard with auto-collapsing data tables
│   │   │   ├── AdminSettings.tsx        # Studio catalog, pricing, service durations & low-stock alerts
│   │   │   ├── AdminUserManagement.tsx  # Supabase RBAC staff roster, role editor & invitation modal
│   │   │   └── compliance/
│   │   │       ├── ComplianceReportModal.tsx      # Regulatory compliance audit modal
│   │   │       ├── D3DailyCheckinTrends.tsx       # D3 area chart tracking patient check-ins
│   │   │       └── D3MedicalFlagDistribution.tsx  # D3 bar chart analyzing clinical risk flags
│   │   │
│   │   ├── practitioner/
│   │   │   ├── PractitionerArrivals.tsx # Live arrival board with real-time waiting room dispatch
│   │   │   ├── ClientDetailView.tsx     # Comprehensive § 630f BGB treatment & hygiene documentation
│   │   │   └── PrintableInvoiceSummary.tsx # DIN A4 fiscal receipt & sterile batch verification log
│   │   │
│   │   └── tablet/
│   │       └── TabletCheckinFlow.tsx    # Multi-step self-service kiosk with electronic signature canvas
│   │
│   ├── auth/
│   │   ├── AuthModal.tsx                # Authentication modal dialog
│   │   ├── Login.tsx                    # Supabase Auth login screen with security key verification
│   │   └── RoleGate.tsx                 # Client-side permission barrier protecting restricted views
│   │
│   ├── pwa/
│   │   ├── OfflineIndicator.tsx         # Live network state banner
│   │   ├── PWAInstallBanner.tsx         # Promotional prompt for kiosk installation
│   │   └── PWAInstallButton.tsx         # Standalone install affordance
│   │
│   └── ui/
│       ├── Button.tsx                   # Reusable button with variants
│       └── Card.tsx                     # Single-elevation surface container
│
├── context/
│   ├── AuthContext.tsx                  # Supabase authentication session & profile manager
│   └── LanguageContext.tsx              # Bilingual internationalization provider (DE/EN)
│
├── data/
│   └── mockData.ts                      # Initial seed dataset (services, add-ons, patients, rules)
│
└── services/
    ├── supabase.ts                      # Supabase client wrapper and safe credential validation
    └── gemini.ts                        # Gemini AI integration for intelligent clinical upsells
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (v9+) or `bun`

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone <repository-url>
   cd podea-intelligent-studio-check-in
   ```

2. Install all required dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory by copying the example:
   ```bash
   cp .env.example .env
   ```

   Configure your Supabase credentials:
   ```env
   # Public anon / publishable key (SAFE for browser use)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
   ```
   > ⚠️ **Important Security Note**: Only supply the public `anon` / `publishable` key in `VITE_SUPABASE_ANON_KEY`. Never place the secret `service_role` key in frontend environment variables.

### Running in Development

Start the local Vite development server:
```bash
npm run dev
```
The application will launch on `http://localhost:3000` (or the port indicated in your console).

### Quality Verification & Compilation

Run TypeScript validation and linting:
```bash
npm run lint
```

Build the production distribution:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 🎨 Design System & Visual Identity

The user interface follows a bespoke, healthcare-wellness visual language designed to promote calm, trust, and clarity:

| Color Token | Hex Value | Purpose |
| :--- | :--- | :--- |
| `p-primary` | `#1F2A37` | Deep slate blue for headers, text hierarchy, and primary buttons |
| `p-background` | `#F4EFEA` | Warm ivory canvas providing an organic, non-clinical ambiance |
| `p-surface` | `#FCFAF8` | Elevated card surfaces and touch input backgrounds |
| `p-accent` | `#C7A75D` | Champagne gold accent for highlights, AI recommendations, and badges |
| `p-success` | `#4A6C5C` | Deep sage green for completed statuses and GDPR approvals |
| `p-warning` | `#BE5A5A` | Rose clay for high-risk medical alerts and hygiene reminders |
| `p-stone` | `#E7E5E4` | Hairline border dividers maintaining single-elevation depth |

### Responsive Design Breakpoints
- **Mobile ($<$ 768px)**: Data tables collapse into tactile cards with $\ge 44\text{px}$ touch targets and single-column orientation. Fixed elements respect a 15% mobile viewport cap.
- **Tablet (768px – 1023px)**: Multi-column stat cards and full-width data tables with horizontal scroll resilience.
- **Desktop ($\ge$ 1024px)**: 12-column flexible grid system balancing data operations and real-time waiting room monitoring.

---

## ⚖️ Legal & Medical Regulatory Framework

Podea is architected to satisfy rigorous German and European regulatory demands for medical wellness practices:
1. **German Civil Code (§ 630f BGB - *Behandlungsdokumentation*)**:
   - Immediate recording of diagnosis, anamnesis, therapy, and clinical findings.
   - Audit-proof documentation with practitioner timestamps and non-destructive notes.
2. **Medical Device Operator Ordinance (*MPBetreibV*) & Hygiene Regulations**:
   - Tracking of sterile instrument batch numbers (*Sterilgut-Chargennummer*) directly tied to individual patient treatment records.
3. **EU General Data Protection Regulation (GDPR / DSGVO)**:
   - Specific consent under **Art. 7** and explicit consent for special categories of data (health data) under **Art. 9 (2)(a)**.
   - Secure biometric electronic signatures captured with device timestamps.

---

## 📄 License

This software prototype is developed for demonstration and operational validation in professional podiatry and medical wellness environments. All rights reserved.
