# TIMORA™ (തിമോറ) — Smart Timber Marketplace
## Complete Architectural, Technical & Workflow Specification for AI Systems

> **Purpose of this Document:**  
> This specification provides an exhaustive, structured summary of the **Timora** project. It is formatted to be fed into any AI model (Claude, GPT, Gemini, DeepSeek, etc.) to immediately grant complete context regarding the business domain, technical stack, UI/UX design patterns, authentication mechanics, user workflows, database schema, and operational state.

---

## 1. Executive Summary & Domain Definition

- **Project Name:** TIMORA™ (തിമോറ) — Kerala's Smart Timber Marketplace
- **Tagline:** Direct Mill-to-Buyer Raw Timber Trading Platform (No finished furniture, only raw timber, round logs, rough-sawn planks, squared beams, and firewood).
- **Geographic & Legal Context:** State of Kerala, India. Strictly adheres to:
  - Kerala Forest Produce Transit Rules, 1975
  - Form IV / Form III transit passes
  - Kerala Hoppus Rule for Round Log CFT volume calculation:  
    $$\text{CFT} = \left(\frac{\text{Girth in inches}}{4}\right)^2 \times \frac{\text{Length in feet}}{144}$$
- **Bilingual Support:** 100% bilingual — English (`en`) and Malayalam (`ml` - മലയാളം).

---

## 2. Monorepo Structure & Tech Stack

The project is structured as a **Turborepo** monorepo:

```
timora/
├── apps/
│   ├── web/               # Frontend Application (React 18 + Vite 6 + TypeScript)
│   └── api/               # Backend REST API (Node.js + Express 4 + TypeScript)
├── packages/
│   └── shared/            # Shared DTOs, Hoppus CFT math, validators, types
├── package.json           # Root workspace configuration (npm workspaces)
├── turbo.json             # Turborepo task pipeline
└── vercel.json            # Vercel SPA build and rewrite configuration
```

### Detailed Tech Stack:
| Layer | Technologies & Libraries |
|---|---|
| **Frontend (`apps/web`)** | React 18, Vite 6, TypeScript 5.7, Tailwind CSS 3.4, React Router DOM 6, React Hook Form, Zod, Lucide React, Framer Motion, Axios, `@tanstack/react-query` |
| **Backend (`apps/api`)** | Node.js (ESM), Express 4.21, TypeScript, `pg` (PostgreSQL client pool), Argon2 password/PIN hashing, JSON Web Tokens (`jsonwebtoken`), Zod validation, Pino logger, Helmet, CORS, Multer |
| **Shared Library (`packages/shared`)** | Shared TypeScript interfaces, Indian phone/PIN validators, CFT calculations, Kerala timber species metadata |
| **Database** | PostgreSQL 14+ (Supabase / Render PostgreSQL compatible), 18+ normalized relational tables |
| **Testing & Tooling** | Vitest, Supertest, ESLint 9, Prettier, Turbo |

---

## 3. UI/UX Design System & Patterns

### 3.1 Color Palette (Kerala Timber & Earth Tones)
Timora utilizes a strict organic palette representing Kerala's timber heritage:
- **Walnut / Deep Timber (`#4A3626`):** Primary brand color, headers, primary buttons, accents.
- **Forest Moss Olive (`#5B6147`):** Secondary brand color, active navigation highlights, success states, nature accents.
- **Warm Wood Cream / Parchment (`#E7E1D6`):** Backgrounds, surface cards, input fills, subtle borders.
- **Muted Bark / Stone (`#8E7F6B`):** Subtext, inactive labels, secondary borders.
- **Purity White / Dark Neutral:** `#FFFFFF` for readable card content, `#1C1917` (Stone-900) for high-contrast typography.

### 3.2 Branding & Logo Guidelines
- **Logo Component:** `BrandLogo.tsx`
- **Icon:** Handcrafted carved 'T' emblem inside a stylized timber log ring.
- **Wordmark:** `TIMORA` in bold uppercase serif typography with the trademark symbol `™` positioned as a superscript directly at the upper right of the letter 'A' (`TIMORA™`), without awkward line-breaks or baseline offsets.

### 3.3 UI Component & Architectural Rules
1. **Modal Dialogs (Zero Viewport Clipping):**  
   Every modal (`SignOutConfirmModal`, `RaiseTicketModal`, `SessionTimeoutModal`) MUST use `createPortal(jsx, document.body)`. This guarantees modals render above headers and sidebars without getting clipped by overflow containers.
2. **Back-Button Trap in Protected Portals:**  
   `ProtectedRoute` intercepts the browser `popstate` event with `window.history.pushState(null, '', window.location.href)`. This prevents logged-in users from accidentally navigating back out to public guest views.
3. **Guest Route Guard (`GuestRoute`):**  
   Logged-in users navigating to `/login` or `/register` are automatically redirected to their role-specific dashboard.
4. **Session Inactivity Guard (`SessionTimeoutModal`):**  
   Monitors mouse, keyboard, touch, and scroll events. Times out after 25 minutes of inactivity, clearing credentials and presenting a friendly re-login prompt.
5. **Mobile Navigation:**  
   Sticky bottom navigation bar with quick access to Marketplace, Calculator, Carpenters, and user Dashboard.

---

## 4. User Roles & Core Workflows

### 4.1 Guest / Public User
- **Marketplace Browsing:** Real-time search by timber species (Teak, Rosewood, Anjili, Mahogany, Jackfruit, Eucalyptus, Firewood), district filter across all 14 Kerala districts, log grade (A/B/C), and form (Round log, Plank, Beam).
- **Hoppus CFT & Metric Calculator (`/calculator`):**  
  Calculates Cubic Feet (CFT) and Cubic Meters ($m^3$) using girth and length inputs, factoring in Kerala Forest Department bark allowances.
- **Timber Mills Directory (`/mills`):** Search licensed sawmills with saw type (Band saw, Gang saw), daily sawing capacity, and contact info.
- **Master Carpenters Directory (`/carpenters`):** Certified artisans for traditional Kerala joinery, roof truss construction, and wood seasoning.
- **Timber Transit Lorries (`/transport`):** Heavy vehicle logistics directory specialized in timber transport with Kerala Forest Transit pass clearance.

### 4.2 Buyer Persona
- **Credentials (Demo/Testing):** Mobile `9847987654`, PIN `123456`.
- **Workflow:**
  1. Searches timber listings and inspects photo galleries, moisture content (%), and certificate scans.
  2. Submits formal price enquiry / purchase request specifying required CFT and delivery destination.
  3. Tracks orders, delivery stages, and payment receipts.
  4. Raises support disputes (`RaiseTicketModal`) with automatic reference tracking (e.g., `TKT-173000...`).

### 4.3 Seller Persona
- **Credentials (Demo/Testing):** Mobile `9847120001`, PIN `123456`.
- **Workflow:**
  1. Creates new timber listings with species, log count, girth (inches), length (feet), calculated CFT, price per CFT, timber origin, and depot location.
  2. Receives buyer enquiries and approves/rejects price quotes.
  3. Dispatches timber consignments with attached Kerala Form IV transit documents.

### 4.4 Admin Persona
- **Credentials (Demo/Testing):** Mobile `9847000000`, PIN `123456`.
- **Workflow:**
  1. Moderates and approves seller depot licenses.
  2. Reviews pending disputes, flags fraudulent timber batches.
  3. Audits system transactions, platform analytics, and user access status.

---

## 5. Backend Architecture & Database Design

### 5.1 API Modules (`apps/api/src/modules/`)
- `auth`: Phone OTP challenge dispatch + verification, 6-digit PIN login, Argon2 password hashing, JWT issue (15 min access, 7 days refresh).
- `listings`: Timber inventory CRUD, filtering by species, grade, district, price range.
- `enquiries`: Buyer-seller price quotation negotiation pipeline.
- `orders`: Transaction lifecycle (placed, confirmed, in-transit, delivered, completed).
- `support`: Helpdesk ticket submission, reference ID generation, message threads.
- `admin`: User status toggling, audit trails, dispute adjudication.

### 5.2 Database Entities (PostgreSQL)
1. `timber_species` & `timber_types`: Catalogs (Teak, Rosewood, Mahogany, Planks, Beams).
2. `kerala_districts`: 14 Kerala districts with English and Malayalam naming.
3. `users` & `user_profiles`: Universal identity, role-based constraints, language preferences.
4. `seller_profiles` & `carpenter_profiles`: Role-specific metadata, licenses, portfolios.
5. `timber_listings`: Product listings with dimensions, CFT, moisture %, grade, pricing, and status.
6. `orders` & `enquiries`: B2B buyer-seller commerce transactions.
7. `support_tickets` & `support_ticket_messages`: Dispute resolution.
8. `transport_providers` & `transport_quotes`: Logistics network.

---

## 6. Current Deployment Status & Next Steps

1. **Frontend:** Successfully deployed on **Vercel** (`https://timora-rho.vercel.app`), fully responsive across desktop, tablet, and mobile.
2. **Current Data Mode:** Runs on high-fidelity client-side state + `localStorage` mock data, supporting smooth demo presentations.
3. **Backend Transition:** Ready to deploy on **Render.com** (Free Web Service) with **PostgreSQL** (Render Postgres or Supabase). Frontend is pre-equipped with `apps/web/src/lib/api.ts` to switch to live HTTP REST calls upon specifying `VITE_API_URL`.

---
*Document Version: 1.0.0 | Generated for AI Pair-Programming & System Handover*
