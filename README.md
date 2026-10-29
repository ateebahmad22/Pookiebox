# PookieBox 🎀

> **"A Little Box, A Lot of Love"**

PookieBox is a modern, premium aesthetic gifting e-commerce platform with a coquette-inspired visual identity. It features an interactive 3D gift box builder powered by Three.js, a dedicated birthday concierge scheduler, full-stack shopping bag with server-side price validation, Razorpay checkout with sandbox mode, and automated transactional emails.

---

## ✨ Key Features

- **Interactive 3D Gift Box Builder**:
  - Procedural pastel keepsake box with satin ribbons (Classic Double Bow, Butterfly Bow, Minimalist Tie, Rosette Knot).
  - Smooth animated hinged lid with open/close states and fairy sparkle particles.
  - Automatic 3D arrangement of gifts inside the box (plushies, chocolates, jewelry, flowers, stationery).
  - Orbit, drag, rotate, and zoom 3D controls with responsive layout.
  - Automatic real-time itemized price breakdown.

- **Birthday & Surprise Scheduler**:
  - Save birthdays for friends, partners, and family.
  - Live countdown timer to upcoming celebrations.
  - Smart gift suggestions matching budget and preferences.
  - "Build Box for this Birthday" shortcut that pre-loads matched gifts.
  - Automated email reminder scheduling.

- **Boutique Gift Catalog**:
  - Categorized gifts (Teddy Bears & Plushies, Chocolates & Treats, Jewellery & Accessories, Flowers, Personalised Gifts, Cute Stationery, Digital Gifts).
  - Search, sort by price and rating, and category filtering.
  - Detailed product modal and wishlist toggle.

- **Full-Stack Shopping Cart & Checkout**:
  - Preserves custom 3D gift box configurations with recipient name and personalized notes.
  - Server-verified pricing via `/api/cart/calculate`.
  - Coupon code support (`POOKIE10`, `LOVE100`, `SWEET20`).
  - Free shipping threshold calculation.

- **Secure Payments (Razorpay)**:
  - Server-side Razorpay order creation and HMAC SHA256 signature verification.
  - Labeled Sandbox / Test Mode fallback when live API keys are not supplied.

- **Transactional Email Automation & Admin Atelier**:
  - Automated order confirmation, payment receipt, and shipping emails.
  - Admin dashboard with overview KPIs, product management, order lifecycle controls, and email delivery logs with HTML preview.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **3D Graphics**: Three.js (Procedural geometries, PBR materials, studio lighting)
- **Backend**: Express.js server (`server.ts`) with Vite dev middleware
- **Data Persistence**: JSON Database Store with automatic seeding (`server/db.ts`)
- **Payments**: Razorpay API & Sandbox Test Gateway (`server/razorpay.ts`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your keys:
- `RAZORPAY_KEY_ID` (Optional - runs in Sandbox Test Mode if omitted)
- `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY` (Optional)

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🎀 License
MIT
