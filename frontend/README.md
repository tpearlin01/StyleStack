# StyleStack — Dress & Clothing Hub

StyleStack is a modern luxury apparel storefront featuring dynamic cart state isolation, real-time checkout with thermal receipt emulation, an embossed auth experience, and a live synchronized Admin Intelligence Portal.

---

## What Has Been Built in Frontend

### 1. Storefront & Catalog
- **Curated Catalog:** Normalized item pricing within accessible price ranges with balanced MRP discounting.
- **Dynamic Category & Attribute Filters:** Filter by apparel category, gender, size, and stock availability.
- **Responsive Product Cards:** Interactive quick view, size selection, dynamic badges (`On Sale`, `New Arrival`), and smooth add-to-cart feedback.

### 2. Isolated Per-User Cart & Checkout System
- **Dynamic Cart Isolation:** Per-user cart separation keyed to session identity without pre-filling or hardcoding account records.
- **Flat Rate & Transparent Tax Logic:** 5% standard GST calculation with automated subtotal threshold shipping discounts.
- **Truck Delivery Order Animation:** Animated interactive dispatch button triggered during order processing.
- **Cash on Delivery (COD) Conditional Flow:**
  - Automated conditional status handling (`STATUS: PENDING ON ARRIVAL`).
  - Dynamic confirmation banner updates specifically tailored for COD orders.

### 3. POS-80T Official Digital Thermal Receipt
- **Thermal Printer Emulation:** Realistic POS-80T receipt printer slide animation.
- **Dynamic Order Attributes:** Unique generated Order ID, live timestamps, itemized product listings, tax breakdowns, and payment state tags.

### 4. Embossed Neumorphic Auth Suite (`/login`)
- **Dual Sliding Panel Container:** Sliding animation between **Sign In** and **Create Account** views.
- **StyleStack Luxury Brand Header:** Custom gold monogram emblem with elevated luxury typography.
- **Tactile Embossed & Glassmorphic Finish:** Frosted glass background backdrop filter combined with inset/embossed shadows.
- **Autofill Overrides:** CSS dark-mode autofill fixes preventing default browser white backgrounds.
- **Dual Portal Roles:** Single-click role toggle between **Customer** and **Admin** portals.
- **Client-Side Validation:** Inline validation checks for email syntax, password lengths, and confirmation matching.

### 5. Live Admin Intelligence & Analytics Portal
- **Dynamic Metric Synchronization:** Synchronized KPI stats (**Total Revenue**, **Total Orders**, **Low Stock Items**) computed from actual stored order records rather than static placeholders.
- **Reordered Operational Tabs:**
  1. `Recent Customer Orders` — Live orders log with status controls.
  2. `Customer Feedback & Reviews` — Customer reviews with verified purchaser badges, fit feedback, and star breakdown.
  3. `Sales & Return Analytics` — Restock urgency indicators paired with detailed return cause categorization (Size/Fit, Color/Fabric hue discrepancies, Packaging integrity).
  4. `Catalog & Inventory` — Complete inventory table with stock indicators.
  5. `+ Add New Apparel Item` — Manual catalogue addition modal.
- **Universal Image Error Handling:** Graceful `onError` fallback handlers across all table rows and review cards to eliminate broken thumbnail links.

---

## Tech Stack
- **Framework:** React / Vite
- **Styling:** Tailwind CSS & Custom CSS (Glassmorphism + Neumorphism)
- **State Management:** React Context API & Browser Storage Hooks
- **Icons & UI:** Lucide React / Custom SVG Assets

---

## Local Development Setup

```bash
cd frontend
npm install
npm run dev
```
