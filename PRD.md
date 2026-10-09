# Product Requirement Document (PRD) — StyleStack

## 1. Project Summary
StyleStack is a modern fashion and apparel e-commerce web platform engineered with a decoupled React frontend and a Node.js/Express backend integrated with cloud-managed services.

## 2. Core Stakeholders & Roles
* **Customer / Shopper:** Explores catalogs, filters by size/style, adds items to persistent cart, completes simulated checkout, views generated instant invoice.
* **Store Administrator:** Tracks orders, views inventory levels, and uploads clothing items with images stored in the cloud.

## 3. Architecture & Data Contracts

### 3.1 Data Models
* **Product:** `_id`, `name`, `brand`, `price`, `category` (Ethnic, Western, Formals, Streetwear), `sizes` (S, M, L, XL), `stockQuantity`, `imageUrl`, `description`
* **Order:** `_id`, `customerName`, `customerEmail`, `shippingAddress`, `items` (`productId`, `name`, `size`, `quantity`, `unitPrice`), `subtotal`, `taxAmount`, `totalAmount`, `status` (`Placed`, `Dispatched`, `Delivered`), `createdAt`

### 3.2 Key API Endpoints
* `GET /api/products` — Retrieve all catalog items (query filters: category, size, sort).
* `POST /api/products` — Create a product with image upload (Admin).
* `POST /api/orders` — Place an order, compute totals, deduct stock.
* `GET /api/orders` — Retrieve past orders (Admin).
* `PATCH /api/orders/:id/status` — Modify order status.

## 4. Workstream Deliverables

### Frontend (Princel)
* Responsive navigation with category links and real-time cart badge.
* Product grid with multi-filter controls (category chips, price slider, size selector).
* Product quick-view modal with size selection and stock status.
* Cart drawer with quantity adjusters, promo code calculations, and instant bill breakdown.
* Order Confirmation / Digital Bill page ready for print/download.
* Admin panel view: Catalog manager with image preview and order status tracking table.

### Backend & Cloud (Pearlin)
* Express.js server architecture with modular routing (`/routes`, `/controllers`, `/models`).
* MongoDB Atlas schemas with data validation rules.
* Image upload pipeline using Multer and cloud bucket integration.
* Order processing service with stock deduction and invoice payload calculation.
* Health check route `GET /api/health` for connection confirmation
