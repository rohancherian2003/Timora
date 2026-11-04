# 🌲 TIMORA™ — Kerala's Smart Timber Marketplace
### *Connecting Timber, People & Possibilities across God's Own Country*

[![Production Web Client](https://img.shields.io/badge/Live%20Web%20App-timora--rho.vercel.app-5B6147?style=for-the-badge&logo=vercel&logoColor=white)](https://timora-rho.vercel.app/)
[![Production Backend API](https://img.shields.io/badge/Live%20API-timora--backend--three.vercel.app-4A3626?style=for-the-badge&logo=vercel&logoColor=white)](https://timora-backend-three.vercel.app/api/v1)
[![Tests Passing](https://img.shields.io/badge/Vitest-223%20Tests%20Passing-emerald?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-stone?style=for-the-badge)](LICENSE)

---

**TIMORA™** is an end-to-end digital marketplace, timber volume calculation engine, and logistics compliance bridge built specifically for Kerala's native timber economy. By eliminating speculative middlemen and informal brokerage, TIMORA directly connects verified residential and commercial buyers, individual agricultural tree growers, licensed sawmill depots, master wood joiners (*ആശാരിമാർ*), and certified heavy transit operators across all 14 districts of Kerala.

The platform provides transparent cubic-foot (CFT) pricing, authentic Kerala Quarter-Girth Hoppus calculations, multi-role compliance moderation, and verified Forest Department Form IV transit permits.

---

## 1. 🏗️ Tech Stack & Architecture

TIMORA™ is architected as a high-performance, modular monorepo powered by **Turborepo** and **npm workspaces**, delivering an instantaneous single-page application experience coupled with a serverless Express microservice backend.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (SPA)                              │
│   React 18 · Vite 6 · Tailwind CSS · Lucide Icons · TanStack Query     │
│       Bilingual i18n Engine (English & Malayalam / മലയാളം)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTPS / JSON REST API
                        (Strict 15m JWT Session)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       SERVERLESS BACKEND LAYER                         │
│     Node.js · Express.js · TypeScript · Vercel Serverless Functions    │
│    Argon2id PIN Auth · Zod Validation · Pino Logger · Rate Limiters    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         PostgreSQL Wire Protocol
                           (Connection Pooling)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                         PERSISTENCE LAYER                              │
│       PostgreSQL 15+ (Supabase / Neon Cloud) · Row-Level Cascades      │
│      Relational Multi-Role Profiles · Audit Logs · Inventory Ledger    │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Technologies

| Layer | Technologies & Tools | Architectural Purpose |
| :--- | :--- | :--- |
| **Frontend Web Client** | **React 18.3**, **Vite 6.0**, **TypeScript 5.7**, **Tailwind CSS 3.4**, **Lucide React**, **TanStack React Query v5**, **Axios** | High-speed Single-Page Application (SPA) with zero-redundancy mobile viewports, responsive layouts, and PWA capabilities. |
| **Backend REST API** | **Node.js 18+**, **Express.js 4.21**, **TypeScript**, **Argon2**, **jsonwebtoken**, **Zod**, **Helmet**, **Pino** | Serverless function runtime on Vercel handling multi-role RBAC, inventory mutations, grievance queues, and audit trails. |
| **Database & Storage** | **PostgreSQL** (Supabase / Neon), **pg (node-postgres)** connection pool, **Supabase Cloud Storage** | Relational ACID data store with row-level constraints, indexed geo-lookups, and secure S3-compatible image buckets. |
| **Deployment & Hosting** | **Vercel Edge & Serverless Platform**, Custom Domain DNS, Automatic SSL | Dual independent deployments for client and API with customized routing rewrites and zero cold-start caching headers. |
| **Internationalization** | **Bilingual Native i18n Engine** (English & Malayalam) | In-memory language toggle preserving native timber terms (*തേക്ക്*, *മഹാഗണി*, *ആഞ്ഞിലി*, *ഈട്ടി*, *ഹോപ്പസ് സി.എഫ്.ടി*). |

---

## 2. 👥 Multi-Role Dashboard Ecosystem

TIMORA™ implements strict Role-Based Access Control (RBAC) across six dedicated actor dashboards. Authenticating with a registered Kerala mobile number (`+91 XXXXXXXXXX`) and 6-digit security PIN dynamically directs users to their role-specific workspace.

```
                               ┌───────────────┐
                               │ TIMORA™ Auth  │
                               │ Mobile + PIN  │
                               └───────┬───────┘
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
        ▼              ▼               ▼               ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│ Verified     ││ Individual   ││ Timber Mill  ││ Master       ││ Transporter  │
│ Buyer        ││ Seller       ││ Owner        ││ Carpenter    ││ Owner        │
│ Dashboard    ││ Dashboard    ││ Dashboard    ││ Dashboard    ││ Dashboard    │
└──────────────┘└──────────────┘└──────────────┘└──────────────┘└──────────────┘
                                       │ (Admin Role)
                                       ▼
                               ┌───────────────┐
                               │ Super Admin   │
                               │ Regulatory    │
                               │ Cell Console  │
                               └───────────────┘
```

### 1. Verified Buyer Dashboard (`/dashboard/buyer`)
* **Live Timber Procurement**: Browse vetted raw round logs, sawn timber planks, and square trusses with transparent CFT pricing.
* **Order Lifecycle & Delivery Confirmation**: Real-time order progress tracking (`Awaiting Confirmation` $\rightarrow$ `Transit Dispatched` $\rightarrow$ `Delivered`). Includes one-click **"Confirm Delivery Received"** mutation updating the ledger and releasing review privileges.
* **Grievance Redressal**: File support tickets with image evidence and view administrative resolution notes.
* **Artisan & Transit Directory Booking**: Directly request quotes from master joiners and licensed crane lorries.

### 2. Individual Timber Seller Dashboard (`/dashboard/seller`)
* **Farmstead & Estate Listing Studio**: Publish timber lots (Teak, Mahogany, Anjili, Rubberwood) with girth, length, and district tags.
* **Inquiry Management**: Receive, evaluate, and counter buyer volume offers in real time.
* **Sales Ledger & Batch Tracking**: Monitor active, completed, and archived tree harvests.

### 3. Timber Mill / Sawmill Owner Dashboard (`/dashboard/mill`)
* **Depot Batch Management**: Ingest rough timber logs and log processed sawn timber planks and squared beams.
* **Live Stock Reconciliation**: Instant volume deduction upon order confirmation to prevent accidental overselling.
* **Sawmill Credentials Showcase**: Display government sawmill licenses (e.g. `KL-SAW-EKM-1048`), heavy band saw counts, and daily CFT capacity.

### 4. Master Carpenter / Artisan Dashboard (`/dashboard/carpenter`)
* **Craftsmanship Showcase**: Display traditional Kerala roof truss joinery (*തച്ചുശാസ്ത്രം* / Nalukettu trusses), custom doors, and hand-carved panels.
* **Client Work Requests**: Accept or decline custom project briefs from residential builders and heritage property renovators.
* **Verified Artisan Badge**: Admin-audited verification ensuring authentic master craftsman credentials.

### 5. Transporter / Logistics Owner Dashboard (`/dashboard/transport`)
* **Timber Transit Manifests**: Log vehicle fleet (hydraulic crane carriers, heavy lorries) with Kerala registration numbers.
* **Form IV Compliance Gate**: Ensure all active transit assignments possess valid Kerala Forest Department Form IV transit permits.
* **Haulage Dispatch Management**: Update consignment statuses from mill pickup to destination timber depot or buyer site.

### 6. Super Admin Console (`/admin`)
* **Multi-Role Regulatory Verification**: Audit pending business credentials across Individual Sellers, Sawmills, Artisans, and Transporters. One-click Approve, Request Additional Documents, or Reject with audit reasons.
* **Listing Quality Inspection**: Inspect raw timber listings, cross-check species validity, verify photo authenticity, and censor non-timber consumer products (e.g. finished furniture, plywood).
* **Audit Trail & System Monitoring**: Immutable administrative action log tracking actor, target entity, timestamp, and notes.

---

## 3. ✨ Key Engineering & UX Highlights

### 🆔 Memorable Identity System (`TMR-[ROLE]-[XXXX]`)
Raw 36-character database UUIDs (e.g., `701321e1-55ed-4867-b551-12c301a22470`) have been eliminated from all user-facing interfaces. TIMORA™ dynamically formats deterministic, memorable identity badges using role classification and registration entropy:

$$\text{User ID} = \mathbf{TMR}\text{-}[\text{ROLE\_CODE}]\text{-}[\text{4\_CHARS}]$$

* **Master Carpenter**: `TMR-CRP-2247`
* **Verified Buyer**: `TMR-BYR-7044`
* **Individual Seller**: `TMR-SLR-3001`
* **Timber Mill Owner**: `TMR-MIL-1200`
* **Transport Provider**: `TMR-TRN-4400`
* **Super Admin**: `TMR-ADM-0001`

### ⏱️ Strict 15-Minute Session Security
* **Automated Client-Side Idle Timeout**: Monitors DOM interaction events (`mousemove`, `keydown`, `touchstart`, `scroll`). After **15 minutes of inactivity**, the active session is cleared, local authentication state is destroyed, and a modal prompts re-authentication.
* **Synchronized Backend JWT Expiration**: All signed authentication tokens enforce `expiresIn: '15m'`, guaranteeing that stale or compromised tokens cannot access serverless endpoints.

### 👤 Standardized 3-Action Profile Menu
The top-right user menu is standardized across every authenticated role to strictly three core destinations:
1. **My Dashboard** — Instant routing to the user's role-specific command center.
2. **Edit Profile & Settings** — Dedicated modal allowing profile updates, clean phone inspection (`+91 XXXXXXXXXX`), and district adjustments.
3. **Sign Out** — Secure session revocation with confirmation guard.

### 📱 Strict Mobile Navigation Guard (`< 768px`)
* **Zero Visual Redundancy**: Redundant top-bar navigation links and duplicate auth buttons are hidden on mobile viewports (`hidden md:flex`), leaving only the TIMORA™ brand mark and language toggle.
* **Fixed Mobile Bottom Navigation**: High-contrast, ergonomic bottom action bar for instantaneous switching between Marketplace, CFT Calculator, Service Directories, and User Account.
* **Gesture & History Guard**: Uses `overscroll-behavior-x: none` and route-trapped UI navigation (`useStrictUINavigation`) to eliminate accidental browser back-swipe exits.

### 📐 Kerala Standard Hoppus Rule CFT Calculator
Implements the authentic formula specified by the Kerala Forest Department and PWD:

$$\text{Round Log Volume (CFT)} = \left(\frac{G}{4}\right)^2 \times \frac{L}{144}$$

$$\text{Sawn Beam Volume (CFT)} = \frac{L \times W \times T}{144} \times N$$

*Where:*
* $G$ = Mid-girth (circumference) in inches
* $L$ = Length of log in feet
* $W$ = Width in inches, $T$ = Thickness in inches
* $N$ = Number of identical sawn pieces

---

## 4. 📁 Project Structure (Active Web App Only)

```text
mcakju_timber_new/
├── package.json                         # Monorepo configuration (Turborepo + npm workspaces)
├── turbo.json                           # Pipeline execution definitions (build, dev, test)
│
├── apps/
│   ├── web/                             # ACTIVE FRONTEND CLIENT
│   │   ├── index.html                   # HTML entrypoint with PWA headers
│   │   ├── package.json                 # Web dependencies (React, Vite, Tailwind, TanStack Query)
│   │   ├── vite.config.ts               # Vite configuration (PWA plugin, asset optimization)
│   │   ├── vercel.json                  # Client rewrite rules (SPA routing & asset headers)
│   │   └── src/
│   │       ├── main.tsx                 # React DOM mount point & chunk error listeners
│   │       ├── App.tsx                  # Root router, AppHeader, UserNavMenu, strict auth guard
│   │       ├── index.css                # Tailwind directives & responsive layout utilities
│   │       ├── components/              # UI Components
│   │       │   ├── BackButton.tsx       # Trapped back navigation button
│   │       │   ├── BrandLogo.tsx        # High-res SVG brand identity mark
│   │       │   ├── EditProfileModal.tsx # Universal profile editor & phone formatter
│   │       │   ├── SessionTimeoutModal  # 15-minute inactivity timeout countdown
│   │       │   ├── SignOutConfirmModal  # Safe sign-out confirmation dialog
│   │       │   └── ...                  # Review, ticket, and status modals
│   │       ├── pages/                   # Application Pages & Role Dashboards
│   │       │   ├── admin/               # Super Admin verification & audit console
│   │       │   ├── auth/                # Login & Registration pages
│   │       │   ├── buyer/               # Verified Buyer order & procurement dashboard
│   │       │   ├── carpenter/           # Master Carpenter dashboard & public directory
│   │       │   ├── seller/              # Individual Seller & Timber Mill dashboards
│   │       │   ├── transport/           # Transporter dashboard & haulage directory
│   │       │   └── public/              # Marketplace, Calculator, Detail & Mill pages
│   │       ├── context/
│   │       │   └── AuthContext.tsx      # Authentication state, 15m timer, role switching
│   │       ├── hooks/
│   │       │   └── useStrictUINavigation # UI-trapped history navigation guard
│   │       ├── lib/
│   │       │   └── api.ts               # Axios client with JWT interceptor & demo handlers
│   │       └── utils/
│   │           ├── ticketService.ts     # Client ticket persistence & dispatch
│   │           └── timberListings.ts    # Listing queries and status filters
│   │
│   └── api/                             # ACTIVE SERVERLESS REST API
│       ├── api/
│       │   └── index.ts                 # Vercel Serverless Function entrypoint
│       ├── package.json                 # Backend dependencies (Express, Argon2, pg, Zod)
│       ├── vercel.json                  # Serverless function rewrite rules (/(.*) -> /api)
│       └── src/
│           ├── app.ts                   # Express application factory, CORS, rate limiting
│           ├── index.ts                 # Local development server bootstrapper
│           ├── config/
│           │   └── database.ts          # PostgreSQL connection pool (pg.Pool)
│           ├── db/
│           │   ├── migrate.ts           # Migration executor
│           │   ├── migrations/          # Versioned SQL migrations (001 - 004)
│           │   └── seed.ts              # Idempotent demo database seeder
│           ├── middleware/
│           │   ├── auth.ts              # JWT verification & 15m expiration validator
│           │   ├── rbac.ts              # Role-Based Access Control validator
│           │   └── errorHandler.ts      # Global centralized error handler
│           └── modules/                 # Modular Domain Controllers & Routes
│               ├── admin/               # Approvals, pending seller applications
│               ├── auth/                # PIN verification, registration, OTP challenges
│               ├── listings/            # Timber lot CRUD, species validation
│               ├── orders/              # Order state transitions, delivery confirmation
│               └── support/             # Grievance ticket redressal system
│
└── packages/
    └── shared/                          # SHARED UTILITY & TYPINGS PACKAGE
        ├── package.json                 # @timora/shared package manifest
        └── src/
            ├── index.ts                 # Main exports
            ├── types/                   # Shared TypeScript interfaces & enums
            └── utils/
                ├── calculator.ts        # Hoppus rule CFT mathematical formulas
                ├── formatters.ts        # TMR-ROLE-XXXX and clean +91 phone formatters
                └── validation.ts        # Shared Zod validation schemas
```

---

## 5. 🗄️ Relational Entity-Relationship (ER) Diagram

The diagram below reflects the active PostgreSQL relational schema operating in production:

```mermaid
erDiagram
    USERS ||--|| USER_PROFILES : "has profile"
    USERS ||--o| SELLER_PROFILES : "extends as"
    USERS ||--o| CARPENTER_PROFILES : "extends as"
    USERS ||--o| TRANSPORT_OWNER_PROFILES : "extends as"
    USERS ||--o{ TIMBER_MILLS : "owns"
    USERS ||--o{ TIMBER_LISTINGS : "publishes"
    USERS ||--o{ ORDERS : "places as buyer"
    USERS ||--o{ SUPPORT_TICKETS : "submits"
    USERS ||--o{ ADMIN_AUDIT_LOGS : "performed by"

    KERALA_DISTRICTS ||--o{ USER_PROFILES : "located in"
    KERALA_DISTRICTS ||--o{ TIMBER_LISTINGS : "harvested in"
    KERALA_DISTRICTS ||--o{ TIMBER_MILLS : "stationed in"

    TIMBER_SPECIES ||--o{ TIMBER_LISTINGS : "classifies"
    TIMBER_TYPES ||--o{ TIMBER_LISTINGS : "categorizes"

    TIMBER_LISTINGS ||--o{ LISTING_IMAGES : "contains"
    TIMBER_LISTINGS ||--o{ ORDERS : "ordered in"

    ORDERS ||--o{ ORDER_STATUS_HISTORY : "tracks"
    ORDERS ||--o| REVIEWS : "evaluated in"

    SUPPORT_TICKETS ||--o{ SUPPORT_TICKET_MESSAGES : "contains"

    USERS {
        uuid id PK
        varchar phone UK
        varchar pin_hash
        varchar role
        boolean is_active
        timestamp created_at
    }

    USER_PROFILES {
        uuid user_id PK,FK
        varchar name
        integer district_id FK
        varchar language_pref
        varchar account_tier
    }

    SELLER_PROFILES {
        uuid user_id PK,FK
        varchar business_name
        varchar seller_subtype
        varchar approval_status
        uuid approved_by FK
    }

    CARPENTER_PROFILES {
        uuid user_id PK,FK
        varchar business_name
        integer experience_yrs
        numeric rating
        varchar approval_status
    }

    TRANSPORT_OWNER_PROFILES {
        uuid id PK
        uuid user_id FK
        varchar business_name
        integer vehicle_count
        numeric max_tonnage
        boolean form_iv_cleared
        varchar approval_status
    }

    TIMBER_MILLS {
        uuid id PK
        uuid owner_id FK
        varchar mill_name
        varchar license_no
        numeric daily_cft_capacity
        varchar approval_status
    }

    TIMBER_LISTINGS {
        uuid id PK
        uuid seller_id FK
        varchar title
        integer species_id FK
        integer timber_type_id FK
        numeric quantity
        varchar unit
        numeric price_per_cft
        varchar status
    }

    ORDERS {
        uuid id PK
        uuid listing_id FK
        uuid buyer_id FK
        uuid seller_id FK
        numeric agreed_qty
        numeric agreed_price
        varchar status
        boolean buyer_confirmed
    }

    SUPPORT_TICKETS {
        uuid id PK
        uuid user_id FK
        varchar reference UK
        varchar category
        varchar status
    }
```

---

## 6. ⚙️ Environment Variables & Configuration

### Frontend Client Configuration (`apps/web/.env`)

```env
# Base URL for the Express REST API backend
# Local Development:
VITE_API_URL=http://localhost:3001/api/v1

# Production Vercel Deployment:
# VITE_API_URL=https://timora-backend-three.vercel.app/api/v1
```

### Backend API Configuration (`apps/api/.env`)

```env
# Server Runtime
NODE_ENV=development
PORT=3001
LOG_LEVEL=info

# Cross-Origin Resource Sharing (Comma-separated allowed domains)
CORS_ORIGINS=http://localhost:5173,https://timora-rho.vercel.app,https://timora.vercel.app

# PostgreSQL Cloud Database Connection
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]?sslmode=require
DATABASE_SSL=true

# Authentication & Session Security (Strict 15m)
JWT_SECRET=super-secure-production-random-secret-key-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Argon2id PIN Hashing Parameters
ARGON2_MEMORY=65536
ARGON2_ITERATIONS=3
ARGON2_PARALLELISM=4

# Supabase Storage (Timber Listing Images)
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_BACKEND_SERVICE_ROLE_KEY]
SUPABASE_STORAGE_BUCKET=timber-listings
IMAGE_MAX_SIZE_BYTES=10485760

# OTP Configuration
OTP_DEMO_MODE=true
OTP_EXPIRY_SECONDS=300
OTP_MAX_ATTEMPTS=3
```

---

## 7. 🚀 Getting Started & Local Development

### Prerequisites
* **Node.js**: `v18.0.0` or later (LTS recommended)
* **npm**: `v9.0.0` or later
* **PostgreSQL**: Local instance or remote cloud database (Supabase / Neon)

### 1. Clone the Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/rohancherian2003/Timora.git
cd Timora

# Install all workspace dependencies from root
npm install
```

### 2. Configure Environment Files
```bash
# Set up backend environment
cp .env.example apps/api/.env

# Set up frontend environment
cp apps/web/.env.example apps/web/.env
```
*(Ensure `DATABASE_URL` in `apps/api/.env` points to a live PostgreSQL database).*

### 3. Initialize Database Migrations & Seed Data
```bash
# Build the shared utility library first
npm run build -w @timora/shared

# Execute PostgreSQL schema migrations
npm run db:migrate

# Seed demo profiles for all roles (Buyer, Sellers, Carpenters, Transporters, Admin)
npm run db:seed
```

### 4. Run Development Servers Concurrently
```bash
# Starts both frontend (Vite :5173) and backend (Express :3001) concurrently via Turborepo
npm run dev
```
* **Web Client**: [http://localhost:5173](http://localhost:5173)
* **REST API**: [http://localhost:3001/api/v1](http://localhost:3001/api/v1)

### 5. Execute Test Suite
```bash
# Run all unit and integration tests across all workspaces
npm test

# Run workspace-specific tests
npm test --workspace=apps/web
npm test --workspace=apps/api
npm test --workspace=packages/shared
```

### 6. Production Compilation
```bash
# Typecheck and compile production assets
npm run build
```

---

## 8. 🌐 Deployment & Vercel Configuration

TIMORA™ is optimized for zero-maintenance serverless deployment on **Vercel** across two distinct projects (Frontend SPA and Backend API).

### Frontend Routing (`apps/web/vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/api/:match*",
      "destination": "https://timora-backend-three.vercel.app/api/:match*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/index.html",
      "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

### Backend Serverless Routing (`apps/api/vercel.json`)
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

### Custom Domain DNS Configuration
To route your branded domain (e.g., `timora.in`) to the Vercel edge network:
* **Root Domain (`@`)**: Add a DNS `A` record pointing to `76.76.21.21`.
* **Subdomain (`www` or `api`)**: Add a DNS `CNAME` record pointing to `cname.vercel-dns.com`.
* **SSL Certificates**: Provisioned and renewed automatically via Vercel Let's Encrypt CA integration.

---

## 9. 🛡️ Security & Regulatory Compliance

### Authentication & Token Security
* **Argon2id Key Derivation**: User PINs are hashed using memory-hard Argon2id (`memoryCost: 65536`, `iterations: 3`). Plaintext PINs are never persisted or logged.
* **JWT Token Sanitization**: User identity tokens carry strict `15m` validity windows, signing only non-sensitive claims (`userId`, `role`).
* **Connection Security**: Cloud database access requires SSL encryption (`sslmode=require`), rejecting plaintext network traffic.

### Kerala Forest Produce Transit Rules (1975) Compliance
TIMORA™ embeds statutory forestry compliance directly into its digital workflows:
* **Form IV Transit Clearance**: Transporters registered on TIMORA must declare clearance under the *Kerala Forest Produce Transit Rules, 1975*.
* **Permit Attachment**: Timber consignments moving across Kerala revenue districts support attaching Forest Department Form IV transit permits, enabling real-time inspection at forest check-posts.
* **Species Categorization**: Native reserved species (Nilambur Teak, Rosewood/Veetti, Sandalwood) are flagged for mandatory transit passes before dispatch orders are approved.

---

## 📄 License & Attribution

TIMORA™ — Kerala's Smart Timber Marketplace. Proprietary software. All rights reserved.  
Engineered for Kerala's timber growers, sawmillers, wood artisans, and builders.
