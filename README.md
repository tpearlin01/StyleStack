# StyleStack

**AI & Cloud Computing Mini Project — Semester V, Computer Engineering, DBIT**

StyleStack is a cloud-native, full-stack fashion e-commerce platform designed to streamline online apparel retail, interactive garment previews, automated taxation, and distributed store management.

The application architecture demonstrates multi-tier cloud integration across five distinct cloud delivery models: **Platform as a Service (PaaS)** for both frontend edge and backend runtimes, **Database as a Service (DBaaS)** for resilient persistence, **Storage as a Service (STaaS)** for cloud asset management, **Software as a Service (SaaS)** for transactional customer communication, and **Function as a Service (FaaS)** for event-driven serverless inventory monitoring.

---

## Cloud Delivery & Service Models

| Delivery Model      | Cloud Service                   | Component / Purpose                                                                                                                     |
| :------------------ | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **PaaS (Frontend)** | **Vercel**                      | Edge hosting, continuous deployment (CI/CD), global CDN distribution, and SSL termination for the React Vite SPA.                       |
| **PaaS (Backend)**  | **Microsoft Azure App Service** | Fully managed Linux Node.js runtime hosting the Express 5 REST API (`stylestack-api`) with zero OS maintenance.                         |
| **DBaaS**           | **MongoDB Atlas**               | Managed document database cluster for users, products, orders, and reviews, backed by local JSON fallback storage.                      |
| **STaaS**           | **Azure Blob Storage**          | Locally redundant cloud storage (`stylestackfnstorage`) providing persistent storage for function packages and runtime metadata.        |
| **SaaS**            | **Nodemailer via SMTP/Gmail**   | Cloud-delivered transactional email service dispatching itemized customer order confirmations and invoice receipts.                     |
| **FaaS**            | **Azure Functions**             | Serverless HTTP microservice (`stylestack-alerts-fn`) running `lowStockAlert` on Node.js 22 to evaluate inventory thresholds on demand. |

---

## Key Features

- **Interactive Storefront & Apparel Preview:** Browse and filter apparel collections by category, gender, and price with instant cart synchronization.
- **Serverless Inventory Alerts (FaaS):** Isolated on-demand cloud function that analyzes stock counts and triggers administrative threshold alerts.
- **Resilient Multi-Mode Data Persistence (DBaaS):** Primary cloud data clustering via MongoDB Atlas with automatic, graceful failover to local JSON storage during upstream connectivity drops.
- **Automated Invoice & Tax Generation:** Dynamic calculations featuring 5% Goods and Services Tax (GST) and itemized delivery fee logic.
- **Simulated Multi-Channel Checkout:** Zero-risk checkout supporting Cash on Delivery (COD), UPI QR generation, and 3D-Secure credit/debit card OTP verification.
- **Transactional Customer Notifications (SaaS):** Automated non-blocking email delivery via Nodemailer with Gmail SMTP.
- **Store Analytics & Administration:** Administrative dashboard to manage apparel catalogs, inspect customer feedback, and evaluate gross revenue metrics.
- **Automated Backend Testing:** End-to-end API unit and integration testing via Jest and Supertest.

---

## Tech Stack

| Component             | Technology                  | Purpose                                                            |
| :-------------------- | :-------------------------- | :----------------------------------------------------------------- |
| Frontend Framework    | React.js (Vite)             | Single-page application (SPA) and component rendering              |
| Frontend PaaS         | Vercel                      | Production edge build and CDN deployment                           |
| Styling & Icons       | Tailwind CSS & Lucide Icons | Responsive styling and vector UI iconography                       |
| Backend Runtime       | Node.js (20/22 LTS)         | Server-side JavaScript execution engine                            |
| Backend Framework     | Express.js 5                | RESTful API routing, middleware, and request handling              |
| Backend PaaS          | Azure App Service (Linux)   | Managed cloud application runtime hosting `stylestack-api`         |
| Serverless FaaS       | Azure Functions v4          | Serverless HTTP Trigger microservice (`stylestack-alerts-fn`)      |
| Cloud Storage (STaaS) | Azure Blob Storage          | Storage account (`stylestackfnstorage`) for metadata and artifacts |
| Database (DBaaS)      | MongoDB Atlas               | Managed NoSQL document database cluster                            |
| Fallback Storage      | Local JSON Files            | Offline-first data persistence fallback                            |
| Authentication        | JSON Web Tokens (JWT)       | Stateless authorization and role-based access control              |
| Email Service (SaaS)  | Nodemailer + Gmail SMTP     | Transactional invoice dispatches and order notifications           |
| Testing Suites        | Jest & Supertest            | Automated test-driven validation of route handlers                 |

---

## Project Structure

```text
StyleStack/
├── frontend/                     # React + Vite client-side single page application
│   ├── src/
│   │   ├── components/            # Reusable UI widgets, navigation, and modals
│   │   ├── pages/                 # Storefront, apparel preview, cart, and admin views
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Express.js REST API backend
│   ├── src/
│   │   ├── controllers/           # Business logic handlers (auth, products, orders)
│   │   ├── routes/                # API endpoint definitions
│   │   ├── models/                # Mongoose schemas (User, Product, Order)
│   │   ├── middleware/            # CORS, authentication, and error validation
│   │   ├── data/                  # JSON fallback store (products.json, orders.json)
│   │   └── utils/                 # Migration utilities and SMTP email transporter
│   ├── tests/                     # Jest automated test suites
│   ├── app.js                     # Express app initialization
│   ├── server.js                  # HTTP listener and pre-flight database connection
│   └── package.json
│
├── stock-fn/                     # Azure Functions (FaaS) Serverless Microservice
│   ├── src/
│   │   └── functions/
│   │       └── lowStockAlert.js   # HTTP Trigger evaluating inventory threshold logic
│   ├── host.json                  # Azure Functions runtime configuration
│   └── package.json               # @azure/functions v4 dependencies
│
├── PRD.md                        # Product Requirements Documentation
├── AGENTS.md                     # Engineering guidance and system specs
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Node.js (v18.x, v20.x, or v22.x LTS) and npm
- Git
- Azure CLI (optional, for deploying serverless functions)
- MongoDB Atlas account (or use local fallback)

### 1. Clone the Repository

```bash
git clone https://github.com/tpearlin01/StyleStack.git
cd StyleStack
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_store_email@gmail.com
EMAIL_APP_PASSWORD=your_google_app_password
CLIENT_URL=http://localhost:5173
```

Start the backend using the script defined in `backend/package.json`:

```bash
npm start
```

### 3. Frontend Setup

Open a separate terminal from the repository root:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Run the development server:

```bash
npm run dev
```

### 4. Automated Testing

Run the test script defined in `backend/package.json`:

```bash
cd backend
npm test
```

---

## Database Architecture & Resilient Fallback

StyleStack implements a hybrid persistence strategy designed for high availability:

- **Primary Cluster (DBaaS):** Connects to a cloud-hosted MongoDB Atlas cluster over an encrypted TLS/SSL connection.
- **Graceful Failover:** If the database URI is absent or the remote cluster is unreachable (due to network partitioning or DNS latency), the system automatically engages an in-memory JSON fallback engine (`backend/src/data/store.js`). The frontend continues operating without runtime exceptions.
- **Automated Idempotent Seeding:** On the initial successful connection to an empty MongoDB database, the migration utility (`backend/src/utils/migrate.js`) scans local JSON datasets and seeds catalog collections without duplicating records.

---

## Serverless Microservice (FaaS Implementation)

An independent serverless HTTP microservice is deployed on Azure Functions (`stylestack-alerts-fn`) running on the Node.js 22 runtime.

**Function Details:**

- **Function Name:** `lowStockAlertTrigger`
- **Type:** HTTP Trigger (POST)
- **Endpoint:** `https://stylestack-alerts-fn.azurewebsites.net/api/lowStockAlert`

**Behavior:**

Accepts a JSON body containing `itemName` and `currentStock`. If the inventory level is 5 or below, it immediately returns an alert flag and warning string; otherwise, it returns nominal status. The microservice executes on demand and scales to zero when idle.

### Testing the Cloud Function

```bash
curl -X POST https://stylestack-alerts-fn.azurewebsites.net/api/lowStockAlert \
  -H "Content-Type: application/json" \
  -d '{"itemName": "Oversized Tee", "currentStock": 2}'
```

**Expected JSON Response:**

```json
{
  "alert": true,
  "message": "LOW STOCK WARNING: Oversized Tee has only 2 units left!"
}
```

---

## REST API Reference

| Endpoint                  | Method | Description                                                      |
| :------------------------ | :----- | :--------------------------------------------------------------- |
| `/api/health`             | GET    | Health check endpoint returning backend and database status      |
| `/api/auth/register`      | POST   | Register a new customer or administrative account                |
| `/api/auth/login`         | POST   | Authenticate credentials and return a signed JWT                 |
| `/api/products`           | GET    | Retrieve and filter apparel catalog collections                  |
| `/api/products/:id`       | GET    | Retrieve individual product metadata and stock quantity          |
| `/api/orders`             | POST   | Create a new order, calculate 5% GST, and decrement inventory    |
| `/api/orders`             | GET    | Retrieve customer order history                                  |
| `/api/orders/:id/status`  | PATCH  | Update delivery tracking status (Placed, Dispatched, Delivered)  |
| `/api/analytics/overview` | GET    | Administrative summary of total revenue, orders, and products    |
| `/api/email/test`         | POST   | Verify transactional SMTP connectivity with Google mail gateways |
| `/api/lowStockAlert`      | POST   | Independent serverless FaaS endpoint for low-stock evaluations   |

---

## Mobile Viewport & Performance Optimizations

StyleStack is fully optimized for responsive mobile viewports (tested against 375px iPhone and 412px Android profiles):

- **Touch Targets:** All interactive controls (buttons, quantity toggles, category pills, filter chips) adhere to the 44x44px minimum touch target standard (WCAG 2.5.5).
- **Navigation:** Compact sticky header with a smooth slide-in mobile navigation drawer, backdrop blur, and outside-click dismissal.
- **Fluid Grid:** Mobile-first catalog grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) with tight padding and safe badge truncation.
- **Client Performance:**
  - Native `loading="lazy"` and `decoding="async"` on all product image thumbnails.
  - Explicit aspect-ratio bounding (`aspect-[3/4]`) preventing Cumulative Layout Shifts (CLS).
  - 280ms debounce handler on search and filter inputs preventing redundant renders.
  - Component memoization with `React.memo` and `useMemo` catalog slicing.
  - Optimized Vite bundle splitting separating vendor React and icon chunks.
- **Backend Optimization:**
  - Query field projections on `/api/products` returning lean card payloads to save mobile bandwidth.
  - Gzip compression enabled for all JSON and static responses.

---

## Production Cloud Deployment Summary

- **Frontend (Vercel PaaS):** Built directly from the repository's `frontend/` directory. Static assets and client routing are handled on Vercel's global edge network. The environment variable `VITE_API_BASE_URL` points to the live Azure App Service backend.
- **Backend (Azure App Service PaaS):** Deployed as a Node.js Linux container under the `StyleStack-RG` resource group. Application settings securely store `MONGODB_URI`, `JWT_SECRET`, and SMTP credentials.
- **Microservice (Azure Functions FaaS):** Deployed using Azure CLI zip deployment into the Consumption Plan Function App `stylestack-alerts-fn`, backed by storage account `stylestackfnstorage`.
- **Database (MongoDB Atlas DBaaS):** Managed M0 cluster deployed in the AWS Mumbai region with global network whitelisting enabled for Azure App Service outbound IP ranges.
