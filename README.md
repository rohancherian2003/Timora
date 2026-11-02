# TIMORA™ — Kerala's Smart Timber Marketplace
### *TIMBER · PEOPLE · POSSIBILITIES*

[![Production Web App](https://img.shields.io/badge/Live%20Web%20App-timora--rho.vercel.app-5B6147?style=for-the-badge&logo=vercel&logoColor=white)](https://timora-rho.vercel.app/)
[![Production Backend API](https://img.shields.io/badge/Live%20API-timora--backend--three.vercel.app-4A3626?style=for-the-badge&logo=vercel&logoColor=white)](https://timora-backend-three.vercel.app/api/v1)
[![Tests Passing](https://img.shields.io/badge/Vitest-186%20Tests%20Passing-emerald?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-black?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.3-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

> **TIMORA™** is an end-to-end digital marketplace, timber calculation suite, and logistics bridge engineered specifically for Kerala's native timber industry. It directly bridges house owners, building contractors, timber growers, master wood artisans (*ആശാരിമാർ*), licensed sawmills (*തടി മില്ലുകൾ*), and specialized heavy transit operators across all 14 districts of Kerala — ensuring transparent pricing, verified Forest Department Form IV transit permits, and authentic Kerala Quarter-Girth Hoppus volume calculations with zero middlemen brokerage.

---

## 🌐 Live Deployments

| Component | Live Production URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App (PWA)** | [https://timora-rho.vercel.app/](https://timora-rho.vercel.app/) | React 18, Vite, Tailwind CSS, PWA offline caching, English/Malayalam |
| **Backend REST API** | [https://timora-backend-three.vercel.app/](https://timora-backend-three.vercel.app/) | Express.js, TypeScript, PostgreSQL (Supabase), Serverless Vercel engine |
| **API Metadata & Spec** | [https://timora-backend-three.vercel.app/api/v1](https://timora-backend-three.vercel.app/api/v1) | Production API health metadata, versioning, and service endpoints |

---

## 🌲 Core Platform Features

### 1. Raw Timber Stock Exchange (`/marketplace`)
* **Species Traded**: Nilambur Teak (*തേക്ക്*), African Mahogany (*മഹാഗണി*), Old-Growth Wild Jack / Anjili (*ആഞ്ഞിലി*), Estate Rubberwood (*റബർ*), Heritage Rosewood / Veetti (*ഈട്ടി*), and Varikka Plavu (*പ്ലാവ്*).
* **Pure Raw Stock Guard**: Search query parser and filter engine actively identifies and rejects non-timber products (e.g. ready-made furniture, sofas, plywood).
* **Form IV Transit Badges**: Live indicators certifying whether lots have verified Forest Department Form IV Transit Permits.
* **Instant Loading Skeletons**: 6-point visual card hierarchy with reserved aspect ratio image placeholders to prevent cumulative layout shift (CLS).

### 2. Kerala Standard Hoppus Rule CFT Calculator (`/calculator`)
* Mathematical engine conforming strictly to the Kerala Forest & Public Works Department formula:
  $$\text{Volume (CFT)} = \left(\frac{\text{Mid-Girth in Inches}}{4}\right)^2 \times \frac{\text{Length in Feet}}{144}$$
* **Sawn Timber Rectangular CFT**:
  $$\text{Volume (CFT)} = \frac{\text{Length (ft)} \times \text{Width (in)} \times \text{Thickness (in)}}{144} \times \text{Pieces}$$
* Instant metric-imperial conversions ($\text{CFT} \longleftrightarrow \text{m}^3$) and live estimated cost calculations in Indian Rupees (₹).

### 3. Licensed Timber Mills Directory (`/mills`)
* Geo-sorted directory of licensed sawmills across Ernakulam, Pathanamthitta, Kottayam, Thrissur, Palakkad, and Kozhikode.
* Provides live band-saw sawing rates (₹65 - ₹85 / CFT), kiln-seasoning capacity, direct WhatsApp integration, and customer reviews.
* Context-aware authentication modals safeguarding mill owners from spam while allowing verified buyers to request custom cutting quotes.

### 4. Master Carpenter Wood Artisan Directory (`/carpenters`)
* Curated directory of verified master wood artisans (*വിദഗ്ദ്ധ ആശാരിമാർ*) specializing in:
  - Traditional Kerala Nalukettu & Temple joinery
  - Heavy timber roof trusses (*കഴുക്കോൽ പണി*)
  - Solid teak front entrance doors & intricate relief carvings
  - Moisture testing, seasoning, and wood preservation

### 5. Specialized Timber Logistics & Haulage (`/transport`)
* Directory of licensed transport operators equipped for raw log haulage:
  - Self-loading hydraulic crane-equipped heavy flatbeds
  - Long-bed multi-axle timber lorries
  - Pre-inspected compliance for Forest Form IV inter-district transit

### 6. Interactive Multi-Role Dashboards
* **Timber Buyer Portal (`/dashboard/buyer`)**: Track timber orders, review active price enquiries, verify delivery status, and rate sellers.
* **Depot Seller Portal (`/dashboard/seller`)**: Manage timber inventory, upload high-resolution timber photographs, track live CFT pricing, and manage incoming buyer bids.
* **Mill Owner Portal (`/dashboard/mill-owner`)**: Manage sawn timber batches, log daily sawing output, and publish available seasoned stock.
* **Carpenter Portal (`/dashboard/carpenter`)**: Receive joinery enquiries, manage wood carving commissions, and display verified artisan credentials.
* **Transport Owner Portal (`/dashboard/transport`)**: Register haulage fleet vehicles, display tonnage capacities, and confirm transit consignments.
* **Admin Control Cell (`/admin`)**: Moderate new business registrations, review depot license certificates, audit user activity logs, and resolve support grievances.

### 7. Support Grievances & Live Notification Cell
* In-dashboard notification bell and live feed polling for instant status updates (order delivery, review confirmations, admin approvals).
* Authoritative support ticketing system assigning serial ticket numbers (`TKT-YYYY-NNNN`) with priority escalations.

### 8. Full Loading States & Skeleton UX
* Comprehensive loading states across every page, filter change, modal submission, and asynchronous API dispatch.
* Interactive buttons automatically disable and render animated spinners (`Loader2`) to eliminate double submissions and provide immediate feedback.

### 9. Bilingual Localization (English & Malayalam)
* 1-Click language toggle on every screen with natural Malayalam (*മലയാളം*) typography and localized trade terms.

---

## 🔑 Pre-Seeded Demo Accounts (Instant Evaluation)

The production Supabase PostgreSQL database is pre-seeded with 6 role-specific demo accounts. You can click any role on the `/login` screen for 1-click authentication or log in with the credentials below:

| Role | Contact Name | Mobile Number | Security PIN | Direct Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **Timber Buyer** | Suresh Kumar | `9847987654` | `123456` | `/dashboard/buyer` |
| **Individual Seller** | K. R. Madhavan | `9847120001` | `123456` | `/dashboard/seller` |
| **Timber Mill Owner** | Perumbavoor Sawmill | `9847120002` | `123456` | `/dashboard/mill-owner` |
| **Master Carpenter** | Master Binu Achari | `9847330001` | `123456` | `/dashboard/carpenter` |
| **Transport Owner** | Malabar Haulage | `9847440001` | `123456` | `/dashboard/transport` |
| **Admin Cell** | Chief Moderator | `9847000000` | `123456` | `/admin` |

---

## 📁 Monorepo Architecture

```
mcakju_timber_new/
├── apps/
│   ├── web/                         # React 18 + Vite + Tailwind CSS Single-Page Application (PWA)
│   │   ├── src/
│   │   │   ├── components/          # Reusable UI widgets, Modals, Loaders, Navigation
│   │   │   ├── context/             # AuthContext (JWT session, 25-min timeout, role routing)
│   │   │   ├── lib/                 # Axios API client with dynamic host resolution & interceptors
│   │   │   ├── pages/
│   │   │   │   ├── public/          # Marketplace, ListingDetail, Calculator, Mills, Transport
│   │   │   │   ├── auth/            # LoginPage, RegisterPage
│   │   │   │   ├── buyer/           # BuyerDashboard
│   │   │   │   ├── seller/          # SellerDashboard, TimberMillOwnerDashboard
│   │   │   │   ├── carpenter/       # CarpenterDashboard, CarpenterDirectoryPage
│   │   │   │   ├── transport/       # TransportOwnerDashboard
│   │   │   │   └── admin/           # AdminDashboard
│   │   │   └── utils/               # Local catalogue fallback, ticket service, Hoppus formatters
│   │   ├── vercel.json              # Web rewrite proxy to backend API & SPA routing
│   │   └── package.json
│   ├── api/                         # Express.js REST API Microservice (Node.js + TypeScript)
│   │   ├── src/
│   │   │   ├── config/              # Environment variables, database pool, JWT secrets
│   │   │   ├── db/                  # SQL migrations, database seeders, connection handlers
│   │   │   ├── middleware/          # Auth guards, role checks, rate limiting, error handlers
│   │   │   ├── modules/
│   │   │   │   ├── auth/            # Authentication, registration, phone change, PIN validation
│   │   │   │   ├── listings/        # Timber catalog, inventory query, photo uploads
│   │   │   │   ├── orders/          # Trade order creation, delivery confirmation
│   │   │   │   ├── directory/       # Sawmills, Carpenters, Transports queries
│   │   │   │   ├── reviews/         # Verified buyer reviews & rating aggregations
│   │   │   │   ├── support/         # Support grievance tickets & in-dashboard notifications
│   │   │   │   └── admin/           # Seller verification & platform moderation
│   │   │   ├── app.ts               # Express configuration, CORS, body parsers, routes
│   │   │   └── index.ts             # Server entrypoint
│   │   ├── vercel.json              # Serverless API deployment configuration
│   │   └── package.json
│   └── mobile/                      # Expo / React Native mobile codebase
│       └── package.json
├── packages/
│   └── shared/                      # Isomorphic TypeScript shared business logic
│       ├── src/
│       │   ├── utils/               # Hoppus quarter-girth & rectangular CFT formulas
│       │   ├── formatters/          # Indian Rupee (INR) and metric unit converters
│       │   └── schemas/             # Shared Zod validation schemas
│       └── package.json
├── turbo.json                       # Turborepo task pipeline configuration
├── package.json                     # Monorepo root workspace configuration
└── README.md
```

---

## 🛠️ REST API Reference

Base Production URL: `https://timora-backend-three.vercel.app/api/v1`

### Authentication (`/auth`)
* `POST /auth/login`: Authenticate with 10-digit mobile number and 6-digit security PIN. Returns JWT Bearer token.
* `POST /auth/register`: Multi-step registration for buyers, sellers, sawmills, carpenters, or transport owners.
* `GET  /auth/profile`: Fetch current authenticated user's profile and credentials.
* `PATCH /auth/profile`: Update business name, sawmill brand, district, and operational details.
* `POST /auth/phone/verify-change`: Secure self-service phone number update with OTP verification.

### Timber Listings (`/listings`)
* `GET  /listings`: Search and filter timber stock by keyword, species, district, timber type, and grade.
* `GET  /listings/:id`: Fetch listing details by UUID (with seller info, measurements, and photo gallery).
* `POST /listings`: Post new timber lot for admin approval (requires seller/mill authentication).
* `GET  /listings/seller/me`: Retrieve current seller's own timber inventory with approval status.
* `POST /listings/:id/images`: Upload high-resolution timber photograph to Supabase Storage.

### Service Directories (`/mills`, `/carpenters`, `/transports`)
* `GET  /mills`: Retrieve registered Kerala sawmills with sawing rates and location.
* `GET  /carpenters`: Retrieve verified master carpenters with specializations and contact info.
* `GET  /transports`: Retrieve verified timber logistics fleets and vehicle specifications.

### Orders & Enquiries (`/orders`, `/enquiries`)
* `GET  /orders`: Fetch active and past timber trade consignments for the authenticated user.
* `PATCH /orders/:id/confirm-delivery`: Buyer confirmation acknowledging delivery of timber lot.
* `POST /enquiries`: Submit formal price offer and enquiry for a specific timber listing.

### Reviews & Support (`/reviews`, `/support`)
* `POST /reviews`: Submit a verified review for a completed timber transaction.
* `POST /support/tickets`: Create support grievance ticket and receive authoritative `TKT-YYYY-NNNN` ID.
* `GET  /support/notifications`: Retrieve user's in-dashboard notifications.
* `PATCH /support/notifications/:id/read`: Mark notification as read.

### Admin Controls (`/admin`)
* `GET   /admin/sellers/pending`: Retrieve pending seller, mill, and transport business registrations.
* `PATCH /admin/sellers/:id/approve`: Approve applicant business and activate live selling privileges.
* `PATCH /admin/sellers/:id/reject`: Request additional documentation or reject registration with recorded reason.

---

## 🎨 Color Palette & Visual Identity

Timora features an organic, minimal palette reflecting seasoned timber, foliage, and natural stone:

| Color | Hex | Visual Role |
| :--- | :--- | :--- |
| **Sand Beige** | `#E7E1D6` | Primary background, surface badges, and soft containers |
| **Moss Green** | `#5B6147` | Primary brand action color, active tabs, and primary buttons |
| **Deep Olive** | `#3F452F` | Hover button states, bold headings, and emphasis |
| **Dark Wood** | `#4A3626` | High-contrast typography, brand logo, and lot titles |
| **Natural Wood** | `#7A5A3A` | Secondary text, measurements, and dimension metadata |
| **Warm Taupe** | `#8E7F6B` | Dividers, subtle input borders, and badge borders |

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or later (v20+ LTS recommended)
* **npm**: v9.0.0 or later
* **PostgreSQL / Supabase**: Connection string (optional for local mock preview, required for live DB)

### 1. Clone the Repository
```bash
git clone https://github.com/rohancherian2003/Timora.git
cd Timora
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create `.env` in `apps/api/`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_KEY=your_supabase_service_role_key
```

Create `.env` in `apps/web/`:
```env
VITE_API_URL=http://localhost:3001/api/v1
```

### 4. Run Database Migrations & Seed Demo Accounts
```bash
npm run db:migrate --workspace=apps/api
npm run db:seed --workspace=apps/api
```

### 5. Start Development Servers
Run the full stack via Turborepo:
```bash
npm run dev
```
Or run workspaces individually:
```bash
# Start backend API (runs on http://localhost:3001)
npm run dev --workspace=apps/api

# Start web frontend (runs on http://localhost:5173)
npm run dev --workspace=apps/web
```

---

## 🧪 Automated Testing & Code Quality

The codebase maintains **186 automated tests** spanning unit formulas, API endpoints, integration flows, and frontend navigation:

```bash
# Run all tests across the monorepo (186 passing tests)
npm run test

# Run API test suite (138 tests)
npm run test --workspace=apps/api

# Run Frontend test suite (40 tests)
npm run test --workspace=apps/web

# Run Shared calculations test suite (8 tests)
npm run test --workspace=packages/shared

# Run TypeScript typechecks
npm run typecheck
```

---

## 📦 Deployment

### Deploy Frontend to Vercel
1. Set Root Directory to `apps/web`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL`: `https://timora-backend-three.vercel.app/api/v1`

### Deploy Backend to Vercel
1. Set Root Directory to `apps/api`.
2. Ensure `apps/api/vercel.json` routes all requests to `src/index.ts`.
3. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY`).

---

## ⚖️ Regulatory & Forest Transit Compliance

All transactions, log specifications, and depot entries within Timora are architected to uphold:
* **The Kerala Forest Produce Transit Rules, 1975**
* **Form IV / Form III Transit Permits** issued by the Kerala State Forest Department
* Standard volume measurement conventions certified by the Forest Research Institutes (KFRI)

---

## 👨‍💻 Author & Maintainer

* **Rohan Cherian** — [GitHub Profile](https://github.com/rohancherian2003)
* Repository: [https://github.com/rohancherian2003/Timora](https://github.com/rohancherian2003/Timora)
* License: [MIT License](LICENSE)
