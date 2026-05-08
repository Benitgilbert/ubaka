# ABELUS - Unified Commerce & Business Management Platform

![Abelus Banner](abelus_banner.png)

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Framework: React 19](https://img.shields.io/badge/Frontend-React%2019-blue.svg)](https://react.dev/)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)
[![Database: Supabase/Prisma](https://img.shields.io/badge/Database-Supabase%20%2F%20Prisma-blueviolet.svg)](https://supabase.com/)

**Abelus** is an enterprise-grade, multi-tenant commerce ecosystem designed to bridge the gap between digital marketplaces and physical retail operations. It provides a seamless experience for customers, a robust operating system for sellers, and a high-level command center for business owners.

---

## 🌟 Core Pillars

### 🛒 Consumer Marketplace
A high-performance storefront designed for conversion.
- **Advanced Discovery**: Multi-vendor search, category filtering, and attribute-based navigation.
- **Seamless Checkout**: Multi-seller cart management and integrated payment gateways.
- **Trust & Engagement**: Product reviews, wishlists, and real-time order tracking.

### 🏪 Seller & POS Operating System
A comprehensive toolset for day-to-day business operations.
- **Hybrid POS**: A unified Point of Sale system for both walk-in and online orders.
- **Shift & Cash Management**: Strict shift enforcement with automated reconciliation and expense tracking.
- **Inventory Control**: Real-time stock management with support for variations and packaging.
- **Abonne Tracking**: Advanced credit and subscription management with "Fiche de Suivi" (tracking sheets).

### 🛡️ Administrative Command Center
Strategic oversight and system governance.
- **Financial Auditing**: Deep-dive reporting with audit-ready PDF generation and dynamic status tracking.
- **Multi-Vendor Governance**: Seller verification, commission management, and payout processing.
- **CMS & Marketing**: Integrated tools for banners, blogs, coupons, and flash sales.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS, Chart.js, React Router 7 |
| **Backend** | Node.js (Express 5), Pino (Advanced Logging) |
| **Database** | PostgreSQL via Supabase, Prisma ORM |
| **Auth** | Supabase Auth + JWT / Passport.js |
| **Reporting** | PDFKit (Dynamic PDF Generation), Handlebars |
| **Storage** | Cloudinary (Media Asset Management) |

---

## 🚀 Key Features Highlights

### 📊 Professional Financial Reporting
Abelus features a sophisticated reporting engine that generates high-fidelity PDF documents.
- **Audit Parity**: Reports are designed for pixel-perfect parity with accounting standards.
- **Dynamic Metrics**: 4-card dashboard summaries for real-time financial snapshots.
- **Verification Logs**: Detailed "Collected By" tracking for physical goods movement.

### ⏱️ Shift-Based Security
To ensure financial accountability, the system mandates an active shift for all POS operations.
- **Balance Reconciliation**: Automated calculation of expected vs. actual drawer balances.
- **Expense Integration**: Direct recording of shift-related expenses with automatic deduction from totals.

### 💳 Abonne (Subscription/Credit) System
Specialized module for managing recurring customers and credit-based transactions.
- **Transaction History**: Comprehensive logging of credit usage and repayments.
- **Representative Tracking**: Tracking which staff member fulfilled specific "Abonne" requests.

---

## 📂 Project Structure

```text
abelus/
├── abelus-backend/       # Express 5 API (Prisma + Supabase)
│   ├── prisma/             # Schema & Migrations
│   ├── controllers/        # Business Logic
│   ├── routes/             # RESTful API Endpoints
│   ├── middleware/         # RBAC & Security
│   └── config/             # Logger & Passport Config
│
└── abelus-frontend/      # React 19 Application (Tailwind CSS)
    ├── src/
    │   ├── components/     # UI Design System
    │   ├── context/        # Global State Management
    │   ├── pages/          # Feature-specific Views
    │   └── utils/          # API & Formatting Helpers
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v20+)
- Supabase Project (PostgreSQL)
- Cloudinary Account (for media)

### Installation

1. **Clone & Setup Environment**
   ```bash
   git clone https://github.com/Benitgilbert/abeluss.git
   cd abeluss/abelus
   ```

2. **Backend Configuration**
   ```bash
   cd abelus-backend
   npm install
   # Create .env with MONGO_URI, SUPABASE_URL, SUPABASE_KEY, etc.
   npx prisma generate
   npm run dev
   ```

3. **Frontend Configuration**
   ```bash
   cd ../abelus-frontend
   npm install
   npm start
   ```

---

## 📈 Recent Updates
- ✅ **Optimized PDF Engine**: Enhanced column layouts and status indicators for audit-ready reports.
- ✅ **Owner Overview**: New strategic dashboard for global business performance tracking.
- ✅ **Strict Shift Enforcement**: Mandatory shift verification for POS security.
- ✅ **Abonne Representative Tracking**: Added "Collected By" field for improved accountability.

---

## 📄 License
Proprietary to Abelus Custom Solutions. Unauthorized copying of this project, via any medium, is strictly prohibited.

---
*Generated with ❤️ by Antigravity for Abelus.*
