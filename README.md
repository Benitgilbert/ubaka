# UBAKA - Enterprise Commerce & Business Management Workspace

![Abelus Banner](abelus_banner.png)

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Framework: React 19](https://img.shields.io/badge/Frontend-React%2019-blue.svg)](https://react.dev/)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)
[![Database: Supabase / Prisma](https://img.shields.io/badge/Database-Supabase%20%2F%20Prisma-blueviolet.svg)](https://supabase.com/)

**Ubaka** is a centralized, multi-tenant enterprise software workspace managed by **Ubaka Tech**. It houses customized business management portals, e-commerce storefronts, and compliance systems designed to scale digital commerce and physical retail operations across Rwanda.

---

## 📂 Project Architecture

This repository is organized as a multi-project workspace:

```text
ubaka/
├── kurimacye/               # Kuri Macye Marketplace & POS Ecosystem
│   ├── kurimacye-backend/   # Node.js Express API (Prisma + Supabase)
│   └── kurimacye-frontend/  # React 19 Storefront (Tailwind CSS)
│
├── ubakatech/               # Ubaka Tech Platform (MIS Portal)
│   ├── ubakatech-backend/   # Express API + WebSockets
│   └── ubakatech-frontend/  # Vite + React Client Application
│
└── rra-certification-docs/  # Rwanda Revenue Authority Compliance Documents
    └── VSDC specifications and monitoring forms
```

---

## 🌟 Main Sub-Projects

### 🏪 1. Kuri Macye (`kurimacye/`)
A premium hybrid retail ecosystem connecting independent local merchants with customers, integrated with the custom domain **`kurimacye.co.rw`**.
* **Unified POS & Shift Security**: Local cashier interface featuring cash/mobile money payment integrations and active shift drawer auditing.
* **Abonné Subscriptions**: Credit-based representative tracking and monthly subscription ledger systems.
* **Professional Reporting Engine**: Dynamic layout generation using `pdfkit` for accounting audits.
* **Multivendor Governance**: Direct control over commissions, seller payouts, and products.

### 🏢 2. Ubaka Tech MIS (`ubakatech/`)
An internal Management Information System (MIS) portal for Ubaka Tech, bridging organizational tools and services, integrated with the domain **`ubakatech.co.rw`**.
* **Vite-based SPA**: Lightweight, fast, modern frontend application.
* **Real-time Synchronization**: Powered by `Socket.io` for instant updates.
* **Lightweight DB Mapping**: Prisma Schema tailored for rapid operations.

### 🛡️ 3. RRA Compliance (`rra-certification-docs/`)
Specifications and monitoring guides for Rwanda Revenue Authority (RRA) Virtual Sales Data Controller (VSDC) integration, ensuring that billing systems are aligned with local tax compliance standards.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Clients** | React 19, Vite, Tailwind CSS, Chart.js, React Router 7 |
| **Backend Services** | Node.js (Express 4/5), WebSockets (Socket.io), Pino Logger |
| **Database & ORM** | PostgreSQL via Supabase, Prisma ORM |
| **Auth & Security** | Supabase Auth + JWT, Passport.js, Helmet |
| **Reporting & PDF** | PDFKit (Dynamic invoice generation), Handlebars Templates |
| **Media Assets** | Cloudinary integration |

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v20+)
* PostgreSQL / Supabase DB instance
* Cloudinary API keys (for media upload)

### Quick Setup

#### 🛒 Setup Kuri Macye
1. **Configure Backend**:
   ```bash
   cd kurimacye/kurimacye-backend
   npm install
   # Create .env using env.example (configure DATABASE_URL and SUPABASE keys)
   npx prisma generate
   npm run dev
   ```
2. **Configure Frontend**:
   ```bash
   cd ../kurimacye-frontend
   npm install
   # Configure .env.production / .env.example (set REACT_APP_API_URL to http://localhost:5000/api)
   npm start
   ```

#### 🏢 Setup Ubaka Tech MIS
1. **Configure Backend**:
   ```bash
   cd ubakatech/ubakatech-backend
   npm install
   # Create .env using .env.example
   npx prisma generate
   npm run dev
   ```
2. **Configure Frontend**:
   ```bash
   cd ../ubakatech-frontend
   npm install
   npm run dev
   ```

---

*Copyright © 2026 Ubaka Tech. Proprietary License. All rights reserved.*
