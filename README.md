# Majlis Al Oud Google Review Reward System 🏆✨

A production-ready enterprise web application designed for **Majlis Al Oud Perfumes UAE** to automate branch-specific QR code scanning, Google OAuth login, invoice receipt verification, Google Business review routing, weighted spin wheel reward draws, and full executive super admin management.

---

## 🌟 Initial Physical Branches
1. **Kalba Branch** (Code: `kalba`)
2. **Ras Al Khaimah (RAK) Branch** (Code: `rak`)
3. **Halwan Sharjah Branch** (Code: `sharjah`)

*The system is scalable to dynamically add new branches without modifying source code.*

---

## 🚀 Key Features

### 🛒 Customer Flow
1. **QR Code Branch Detection**: Scans branch QR code (`/?branch=kalba`). Automatically identifies the branch without manual customer selection.
2. **Google OAuth Authentication**: Secure one-click Google identity verification.
3. **Invoice Verification**: Validates invoice existence, branch ownership, eligibility status, non-expiration, and double-spin prevention.
4. **Google Business Review Redirect**: Automatically redirects customer to the branch's exact Google Business Review URL.
5. **Luxury Animated Spin Wheel**:
   - Exactly **10 prize segments** with custom colors, icons, and display order.
   - **Weighted Random Selection Engine** (Not equal probability). Administrator can alter weights anytime.
   - 1 Invoice = 1 Review = 1 Spin (Double spin lock).
   - Confetti victory celebration & printable reward claim voucher.

### 🛡️ Super Admin Panel (`/admin`)
- **Dashboard**: Real-time stats for Today's Reviews, Today's Spins, Today's Winners, Total Reviews, Total Winners, Total Invoices, Total Branches, and visual charts.
- **Branch Management**: Create, edit, disable, delete branches. Generate unique QR codes, download QR as **PNG** and printable **PDF poster**.
- **Invoice Management**: Single invoice creation, CSV bulk import/upload, status toggles, search, and branch filters.
- **Spin Prize Management**: Add, edit, delete 10 prize segments, change weights, manage stock, display order, and color themes. Shows live normalized probability percentages ($\frac{W_i}{\sum W_j} \times 100\%$).
- **Reports**: Default shows ONLY today's records. Filter by invoice number, date range, branch, or prize. Summary section showing Prize Distribution counts. Export to **Excel (.xlsx)**, **PDF**, and **CSV**.
- **Customer History Log**: Complete audit table storing Customer Name, Google Email, Google Account ID, Branch, Invoice Number, Prize Won, Review Date, Spin Date, QR Code Used, and IP Address.

---

## ⚙️ Quick Start

### 1. Seed Database
```bash
npm run seed
```

### 2. Start Backend Server
```bash
npm --prefix backend run dev
```

### 3. Start Frontend Dev Server
```bash
npm --prefix frontend run dev
```

---

## 🔑 Default Super Admin Credentials
- **URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@majlisaloud.ae`
- **Password**: `Admin@123456`
