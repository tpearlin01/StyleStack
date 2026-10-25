# StyleStack

## AI Mini Project — Semester V, Computer Engineering, DBIT

## Problem Statement

Traditional online apparel shopping platforms can make it difficult for customers to discover relevant products, manage shopping carts, and complete purchases with a clear breakdown of costs. At the same time, store administrators need an efficient way to manage product catalogs, track inventory, process orders, and monitor store performance.

## StyleStack addresses these needs through a full-stack fashion e-commerce platform that brings product discovery, dynamic filtering, shopping cart management, order processing, automated GST calculation, invoice generation, and administrative analytics into a unified system. It aims to provide customers with a smooth shopping experience while simplifying essential store management operations.

## Architecture & Directory Structure

StyleStack is organized as a monorepo partitioned into two core workspaces:

```text
StyleStack/
├── frontend/                     # Client application (Princel Tixeira)
│   ├── public/                   # Static assets & catalog imagery
│   ├── src/
│   │   ├── assets/               # Brand artwork and SVG icons
│   │   ├── components/           # UI components (Navbar, CartDrawer, Modals, etc.)
│   │   ├── context/              # React Context (AuthContext, CartContext)
│   │   ├── services/             # Decoupled API service layer with mock fallback
│   │   ├── utils/                # Order persistence and thermal receipt helpers
│   │   ├── App.jsx               # Root client component
│   │   └── main.jsx              # React DOM entry point
│   ├── index.html                # Vite HTML entry
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   └── vite.config.js            # Vite build configuration
│
├── backend/                      # Server application & API (Pearlin Tixeira)
│   ├── data/                     # Seed stores & JSON-backed data repositories
│   ├── middleware/               # Express middleware (upload, error handling)
│   ├── src/
│   │   ├── config/               # Database connection & configurations
│   │   ├── controllers/          # Business logic handlers (auth, products, orders, analytics)
│   │   ├── routes/               # Modular Express API routers
│   │   ├── app.js                # Express app setup, CORS, route mounting
│   │   └── server.js             # Server listener & environment configuration
│   ├── tests/                    # Jest & Supertest integration test suites
│   ├── uploads/                  # Multer file storage destination
│   └── package.json              # Backend dependencies and scripts
│
├── AGENTS.md                     # Monorepo development rules & agent protocols
├── PRD.md                        # Product Requirements Document
└── README.md                     # Project documentation & setup guide
```

### Primary Directory Responsibilities

- **`/frontend`**: Focuses on user experience, responsive catalog navigation, product discovery with multi-criteria filtering, local cart state synchronization, real-time modal quick views, and print-ready checkout receipts. Communicates with the backend through an abstracted service layer (`frontend/src/services/api.js`) that seamlessly falls back to high-fidelity mock data if running offline.
- **`/backend`**: Provides a secure REST API implementing modular MVC-style architecture. Responsibilities include authentication handling, product catalog CRUD, image uploads with Multer, order placement with stock inventory deduction, automated 5% GST tax computation, and administrative business intelligence analytics.

---

## Backend Setup & API

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB** _(Optional)_: Local MongoDB instance or MongoDB Atlas cluster connection URI. The backend includes a seed JSON fallback store for turnkey zero-config execution.

### Environment Variables

Configure your backend environment by creating a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Populate the following variables in `backend/.env`:

| Variable      | Description                                           | Default / Example                      |
| :------------ | :---------------------------------------------------- | :------------------------------------- |
| `PORT`        | HTTP port on which the Express server listens         | `5000`                                 |
| `MONGODB_URI` | MongoDB connection connection string (local or Atlas) | `mongodb://localhost:27017/stylestack` |
| `JWT_SECRET`  | Secret key used for signing authentication tokens     | `mysecretkey`                          |

### Installation & Run Commands

From the project root:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install all dependencies
npm install

# 3. Start the development server with live reload (nodemon)
npm run dev

# 4. Alternatively, start for production
npm start
```

The backend server boots on `http://localhost:5000` with CORS configured to accept requests from the Vite frontend at `http://localhost:5173`.

### Running Test Suites

StyleStack backend features automated unit and integration tests powered by **Jest** and **Supertest**:

```bash
# From within the backend/ directory:
npm test
```

The test runner executes 6 comprehensive test suites covering all primary endpoints:

- `tests/health.test.js` — Health check endpoint verification
- `tests/auth.test.js` — Registration and authentication workflows
- `tests/products.test.js` — Catalog queries, product filtering, creation, and stock updates
- `tests/orders.test.js` — Order processing, stock deduction, and 5% GST tax calculations
- `tests/analytics.test.js` — Business metrics, customer sentiment, and return rates
- `tests/upload.test.js` — Multipart file uploads and static file serving

---

## API Endpoints Reference

All API responses follow a uniform JSON payload format:

- **Success**: `{ "success": true, "data": ... }`
- **Error**: `{ "success": false, "message": "..." }`

### API Route Overview

| Domain        | Method   | Endpoint                  | Description                                                                   |
| :------------ | :------- | :------------------------ | :---------------------------------------------------------------------------- |
| **System**    | `GET`    | `/api/health`             | Health check endpoint returning status and current server timestamp           |
| **Auth**      | `POST`   | `/api/auth/register`      | Register a new user account                                                   |
|               | `POST`   | `/api/auth/login`         | Authenticate user credentials and return auth payload                         |
| **Products**  | `GET`    | `/api/products`           | Retrieve catalog products (supports `?category=`, `?gender=`, and `?search=`) |
|               | `GET`    | `/api/products/:id`       | Fetch detailed information for a specific product                             |
|               | `POST`   | `/api/products`           | Create a new product with multipart image upload (`image`)                    |
|               | `PATCH`  | `/api/products/:id/stock` | Decrement or update stock quantity for a product                              |
|               | `DELETE` | `/api/products/:id`       | Remove a product from the catalog                                             |
| **Orders**    | `POST`   | `/api/orders`             | Place a new order with stock validation and automated **5% GST** computation  |
|               | `GET`    | `/api/orders`             | Retrieve all placed orders (sorted by recency)                                |
|               | `GET`    | `/api/orders/:id`         | Fetch order details and itemized invoice by order ID                          |
|               | `PATCH`  | `/api/orders/:id/status`  | Update order delivery status (`Placed`, `Dispatched`, `Delivered`)            |
| **Analytics** | `GET`    | `/api/analytics/overview` | High-level sales KPIs, total revenue, average order value, and volume         |
|               | `GET`    | `/api/analytics/feedback` | Customer satisfaction (CSAT) scores, rating distribution, and reviews         |
|               | `GET`    | `/api/analytics/returns`  | Return rate metrics, categorized return reasons, and item diagnostics         |
| **Uploads**   | `POST`   | `/api/upload`             | Upload catalog image via Multer (stored under `/uploads/`)                    |

### Automated 5% GST Computation

When an order is submitted to `POST /api/orders`, the backend calculates item totals, checks inventory availability, and automatically computes tax and final invoice pricing:

$$\text{Subtotal} = \sum (\text{Quantity} \times \text{Unit Price})$$
$$\text{Tax Amount (5\% GST)} = \text{round}(\text{Subtotal} \times 0.05, 2)$$
$$\text{Total Amount} = \text{Subtotal} + \text{Tax Amount}$$

Upon completion, an itemized order receipt containing a generated `orderId` (e.g. `ORD-847291`), timestamp, customer details, and pricing summary is returned and recorded.

---

## Frontend Setup (Quickstart)

To run the client application alongside the backend:

```bash
# 1. In a separate terminal, navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Launch Vite development server
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## Team & Credits

StyleStack is collaboratively created and maintained by:

- **Princel Tixeira** — Frontend Architecture, UI/UX Engineering, Responsive Component Design, and Client State Management.
- **Pearlin Tixeira** — Backend Architecture, REST API Design, Database Integrations, Multer File Pipeline, and Automated Testing.

---

## License & Documentation

- Detailed product requirements and user stories: [PRD.md](PRD.md)
- Collaboration protocols and agent branching rules: [AGENTS.md](AGENTS.md)
