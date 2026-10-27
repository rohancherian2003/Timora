# TIMORA™ — Kerala's Smart Timber Marketplace
### *TIMBER · PEOPLE · POSSIBILITIES*

[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-7%20Passed-success)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Timora** is a digital marketplace and logistics bridge engineered for Kerala's raw timber ecosystem. It directly connects house owners, buyers, master carpenters, and licensed sawmills across Kerala's 14 districts — ensuring transparent pricing, verified Forest Form IV transit compliance, and standard Hoppus rule volume calculations with zero middlemen fees.

---

## 🌲 Key Features

### 1. Raw Timber Stock Exchange
* **Species Traded**: Nilambur Teak (*തേക്ക്*), African Mahogany (*മഹാഗണി*), Old-Growth Wild Jack / Anjili (*ആഞ്ഞിലി*), Estate Rubberwood (*റബർ*), Heritage Rosewood / Veetti (*ഈട്ടി*), and Varikka Plavu (*പ്ലാവ്*).
* **Pure Raw Stock Only**: Search validation engine actively detects and filters out non-timber keywords (e.g. furniture, sofa, plywood).
* **Form IV Transit Badges**: Transparent verification indicators showing whether wood lots have valid Kerala Forest Department transit passes.

### 2. Kerala Standard Hoppus Rule CFT Calculator
* Built-in calculator following the official Kerala government timber measurement method:
  $$\text{Volume (CFT)} = \left(\frac{\text{Mid-Girth in Inches}}{4}\right)^2 \times \frac{\text{Length in Feet}}{144}$$
* Instant cost estimations based on live market rate per CFT.

### 3. Licensed Timber Mills Directory (`/mills`)
* Directory of licensed sawmills across Ernakulam, Pathanamthitta, Kottayam, Thrissur, and Kozhikode.
* Lists horizontal band-saw rates (₹65 - ₹85 / CFT), kiln seasoning plant availability, verified owner phone & WhatsApp, and customer reviews.
* Login-protected quoting and review submission.

### 4. Interactive Grievance & Support Ticketing Cell
* Floating **Raise a Ticket** button on the home page.
* Allows buyers, sellers, and carpenters to file tickets regarding wood quality, measurement variations, checkpost delays, or transit permits.
* **Admin Resolution Console**: Moderators can review tickets, write custom solution messages, and mark them as resolved.
* **Live Resolution Banner**: Real-time resolution notifications broadcast directly to the user's dashboard with the admin's official response.

### 5. Multi-Role Authentication & Session Protection
* **Dedicated Dashboards**: Role-isolated portals for **Timber Buyers**, **Depot Sellers**, and **Super Admins**.
* **1-Click Instant Demo Access**: Quick demo buttons for rapid evaluation and presentation.
* **Back-Navigation Protection**: Authenticated users are prevented from accidentally returning to the login/register screen via the browser back button.
* **Inactivity Session Timeout**: Automatically terminates idle sessions after 25 minutes of inactivity and prompts a secure re-authentication modal.

### 6. Carpenters & Transport Logistics Directories
* **Master Carpenters (`/carpenters`)**: Profiles of traditional Kerala carpenters specializing in roofing joinery (*കഴുക്കോൽ*), door frames (*കട്ടിള*), and wood carving.
* **Timber Transport (`/transport`)**: Directory of crane-mounted multi-axle trucks and covered flatbeds specializing in long log transit.

---

## 🎨 Color Palette

Timora incorporates an earthy, minimal visual palette inspired by seasoned timber, forest flora, and sand:

| Color | Hex | Role |
| :--- | :--- | :--- |
| **Sand Beige** | `#E7E1D6` | Primary background and soft card containers |
| **Moss Green** | `#5B6147` | Primary brand accent and interactive buttons |
| **Deep Olive** | `#3F452F` | Headings, active states, and emphasis |
| **Dark Wood** | `#4A3626` | Deep wood typography and high-contrast titles |
| **Natural Wood** | `#7A5A3A` | Secondary text and dimension metadata |
| **Olive Gray** | `#8A8F6E` | Badges, borders, and subtle accents |
| **Warm Taupe** | `#8E7F6B` | Borders, dividers, and neutral accents |

---

## 📁 Repository Structure

```
mcakju_timber_new/
├── apps/
│   ├── web/               # React 18 + Vite + Tailwind CSS Single-Page App
│   │   ├── src/
│   │   │   ├── components/ # BrandLogo, RaiseTicketModal, SessionTimeoutModal
│   │   │   ├── context/    # AuthContext with 25-min session timeout & demo roles
│   │   │   ├── pages/      # Marketplace, Details, Mills, Calculator, Dashboards
│   │   │   └── utils/      # ticketService (LocalStorage persistence & event bus)
│   │   └── package.json
│   └── api/               # Express + PostgreSQL backend service (REST API)
├── packages/
│   └── shared/            # Shared calculations, CFT formulas & Zod validators
├── vercel.json            # Vercel single-page app deployment routing configuration
├── netlify.toml           # Netlify single-page app deployment configuration
└── package.json           # Turborepo root workspace
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or later (v20+ recommended)
* **npm**: v9.0.0 or later

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rohancherian2003/Timora.git
   cd Timora
   ```

2. **Install all monorepo dependencies**:
   ```bash
   npm install
   ```

3. **Start the Web Application**:
   ```bash
   npm run dev -w @timora/web
   ```
   Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

4. **Build for Production**:
   ```bash
   npm run build -w @timora/web
   ```

5. **Run Unit Tests**:
   ```bash
   npm run test -w @timora/shared
   ```

---

## 🔑 Demo Login Credentials

For testing and demonstration, use the **1-Click Demo Login** buttons on the `/login` screen or the credentials below:

| Role | Mobile Number | PIN | Dashboard Route |
| :--- | :--- | :--- | :--- |
| **Timber Buyer** | `9847987654` | `123456` | `/dashboard/buyer` |
| **Depot Seller** | `9847120001` | `123456` | `/dashboard/seller` |
| **Super Admin** | `9847000000` | `123456` | `/admin` |

---

## 🌐 Free Public Hosting & Live Deployment

### Option A: 1-Click Free Hosting on Vercel (Recommended)
1. Go to **[https://vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
2. Select your repository: **`rohancherian2003/Timora`**.
3. In the configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web` (or leave default if importing the monorepo with `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. In under 1 minute, you will receive a free public URL (e.g. `https://timora.vercel.app`) with free SSL!

### Option B: 1-Click Free Hosting on Netlify
1. Go to **[https://app.netlify.com](https://app.netlify.com)** and log in with GitHub.
2. Click **Add new site** > **Import an existing project** > choose **`rohancherian2003/Timora`**.
3. Base directory: `apps/web` | Build command: `npm run build` | Publish directory: `apps/web/dist`.
4. Click **Deploy Site** for a live `*.netlify.app` domain.

---

## ⚖️ Legal & Forest Transit Compliance

All transactions and depot entries featured within Timora are structured in alignment with:
* **The Kerala Forest Produce Transit Rules, 1975**
* **Form IV / Form III Transit Permits** issued by the Kerala State Forest Department
* Standard volume measurement conventions certified by the Forest Research Institutes

---

## 👨‍💻 Author & Maintainer

* **Rohan Cherian** — [GitHub Profile](https://github.com/rohancherian2003)
* Repository: [https://github.com/rohancherian2003/Timora](https://github.com/rohancherian2003/Timora)
