# StyleStack

## AI Mini Project — Semester V, Computer Engineering, DBIT

StyleStack is a full-stack fashion and apparel e-commerce platform built with a React frontend and a Node.js/Express REST API backend. It supports product discovery, shopping cart management, order processing, automated 5% GST calculation, invoice generation, image uploads, and administrative analytics.

## Problem Statement

Traditional online apparel shopping platforms can make it difficult for customers to discover relevant products, manage shopping carts, and complete purchases with a clear breakdown of costs. At the same time, store administrators need an efficient way to manage product catalogs, track inventory, process orders, and monitor store performance.

StyleStack addresses these needs through a full-stack fashion e-commerce platform that brings product discovery, dynamic filtering, shopping cart management, order processing, automated GST calculation, invoice generation, and administrative analytics into a unified system. It aims to provide customers with a smooth shopping experience while simplifying essential store management operations.

## Key Features

### Customer Features

- **Dynamic Product Catalog:** Browse apparel with category, gender, and search filters.
- **Shopping Cart:** Add and manage items through the cart experience.
- **Quick Product View:** View product details using interactive modals.
- **Order Placement:** Place orders with inventory availability checks.
- **Automated GST Calculation:** Calculate 5% GST and the final payable amount.
- **Thermal Invoice Generation:** Generate print-ready receipts with order details and a price breakdown.

### Administrative Features

- **Product Management:** Create products, update stock, and remove catalog products.
- **Image Uploads:** Upload product images using Multer.
- **Order Management:** View orders and update their delivery status.
- **Store Analytics:** View sales metrics, customer feedback, ratings, and return trends.

## Key Differentiators

- **Integrated Shopping Workflow:** Combines product discovery, cart management, order placement, and invoicing in one platform.
- **Inventory-Aware Orders:** Checks product stock during order processing and deducts inventory.
- **Transparent Pricing:** Calculates GST automatically and provides an itemized price breakdown.
- **Administrative Insights:** Provides analytics for sales, customer satisfaction, and product returns.
- **Decoupled Architecture:** Separates the React frontend from the Express REST API, making each easier to maintain and develop.
- **Flexible Data Handling:** Supports a JSON-backed fallback store when a MongoDB connection is not configured.

## Architecture & Directory Structure

StyleStack is organized as a monorepo with two main workspaces:

```text
StyleStack/
├── frontend/                      # Client application (Princel Tixeira)
│   ├── public/                     # Static assets and catalog imagery
│   ├── src/
│   │   ├── assets/                 # Brand artwork and SVG icons
│   │   ├── components/             # UI components (Navbar, CartDrawer, modals, etc.)
│   │   ├── context/                # React Context (AuthContext, CartContext)
│   │   ├── services/               # API service layer with mock fallback
│   │   ├── utils/                  # Order persistence and receipt helpers
│   │   ├── App.jsx                 # Root client component
│   │   └── main.jsx                # React DOM entry point
│   ├── index.html                  # Vite HTML entry
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── vite.config.js              # Vite build configuration
├── backend/                        # Server application and API (Pearlin Tixeira)
│   ├── data/                       # Seed stores and JSON-backed data repositories
│   ├── middleware/                 # Express middleware (uploads, error handling)
│   ├── src/
│   │   ├── config/                 # Database connection and configuration
│   │   ├── controllers/             # Business logic (auth, products, orders, analytics)
│   │   ├── routes/                 # Express API routers
│   │   ├── app.js                  # Express setup, CORS, and route mounting
│   │   └── server.js               # Server listener and environment configuration
│   ├── tests/                      # Jest and Supertest test suites
│   ├── uploads/                    # Multer upload destination
│   └── package.json                # Backend dependencies and scripts
├── AGENTS.md                       # Development rules and agent protocols
├── PRD.md                          # Product Requirements Document
└── README.md                       # Project documentation and setup guide
```

### Primary Directory Responsibilities

- **`/frontend`:** Handles the responsive catalog, product filtering, cart state, quick-view modals, and print-ready receipts. The API service layer (`frontend/src/services/api.js`) can fall back to mock data when the backend is unavailable.
- **`/backend`:** Provides the REST API for authentication, product catalog operations, image uploads, order placement, stock deduction, 5% GST calculation, and administrative analytics.

## Tech Stack

| Component          | Technology         | Purpose                                           |
| ------------------ | ------------------ | ------------------------------------------------- |
| Frontend           | React              | Builds the user interface and reusable components |
| Development Server | Vite               | Runs the frontend development environment         |
| Styling            | Tailwind CSS       | Provides responsive styling                       |
| Backend            | Node.js            | Runs the server-side application                  |
| API Framework      | Express.js         | Handles API routes and HTTP requests              |
| Database           | MongoDB            | Stores application data when configured           |
| Fallback Storage   | JSON files         | Provides an alternative data storage mechanism    |
| Authentication     | JWT                | Supports token-based authentication               |
| File Uploads       | Multer             | Handles uploaded product images                   |
| Testing            | Jest and Supertest | Supports backend testing                          |

## Application Architecture

StyleStack follows a client-server architecture. The frontend communicates with the backend through REST API endpoints.

- **Frontend:** Displays products, manages the shopping cart, and provides the customer interface.
- **Backend:** Handles authentication, product operations, order processing, and analytics.
- **Data Storage:** Uses MongoDB when configured, with JSON-backed fallback storage.
- **API Communication:** Connects the frontend and backend through HTTP requests.

## Backend Setup & API

### Prerequisites

- **Node.js:** Version 18 or higher
- **npm:** Version 9 or higher
- **MongoDB (optional):** A local MongoDB instance or MongoDB Atlas connection URI. The backend includes a JSON fallback store for zero-configuration execution.

### Environment Variables

Create a `.env` file in the `backend/` directory. From the project root:

```bash
cd backend
cp .env.example .env
```

Set the following variables in `backend/.env`:

| Variable      | Description                               | Default / Example                      |
| ------------- | ----------------------------------------- | -------------------------------------- |
| `PORT`        | HTTP port used by the Express server      | `5000`                                 |
| `MONGODB_URI` | MongoDB connection string                 | `mongodb://localhost:27017/stylestack` |
| `JWT_SECRET`  | Secret used to sign authentication tokens | Set your own secret value              |

Do not use a sample JWT secret in a deployed application.

### Installation & Run Commands

Run these commands from the project root:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Alternatively, start the server normally
npm start
```

The backend is expected to run at `http://localhost:5000`. CORS is configured for the Vite frontend at `http://localhost:5173`.

### Running Test Suites

The backend uses Jest and Supertest for automated tests. From the `backend/` directory, run:

```bash
npm test
```

The README currently documents six test suites:

- `tests/health.test.js` — Health check endpoint
- `tests/auth.test.js` — Registration and authentication
- `tests/products.test.js` — Product queries, filtering, creation, and stock updates
- `tests/orders.test.js` — Order processing, stock deduction, and GST calculations
- `tests/analytics.test.js` — Business metrics, feedback, and return rates
- `tests/upload.test.js` — Multipart file uploads and static file serving

## API Endpoints Reference

The API is documented as returning JSON responses in these general formats:

- **Success:** `{ "success": true, "data": ... }`
- **Error:** `{ "success": false, "message": "..." }`

### API Route Overview

| Domain         | Method   | Endpoint                  | Description                                                                      |
| -------------- | -------- | ------------------------- | -------------------------------------------------------------------------------- |
| System         | `GET`    | `/api/health`             | Returns health status and server timestamp                                       |
| Authentication | `POST`   | `/api/auth/register`      | Registers a user account                                                         |
| Authentication | `POST`   | `/api/auth/login`         | Authenticates user credentials                                                   |
| Products       | `GET`    | `/api/products`           | Retrieves products; supports `category`, `gender`, and `search` query parameters |
| Products       | `GET`    | `/api/products/:id`       | Retrieves one product                                                            |
| Products       | `POST`   | `/api/products`           | Creates a product; supports multipart image upload using `image`                 |
| Products       | `PATCH`  | `/api/products/:id/stock` | Updates product stock                                                            |
| Products       | `DELETE` | `/api/products/:id`       | Removes a product                                                                |
| Orders         | `POST`   | `/api/orders`             | Places an order, validates stock, and calculates 5% GST                          |
| Orders         | `GET`    | `/api/orders`             | Retrieves placed orders                                                          |
| Orders         | `GET`    | `/api/orders/:id`         | Retrieves an order and its invoice details                                       |
| Orders         | `PATCH`  | `/api/orders/:id/status`  | Updates order status (`Placed`, `Dispatched`, or `Delivered`)                    |
| Analytics      | `GET`    | `/api/analytics/overview` | Returns sales KPIs, revenue, average order value, and order volume               |
| Analytics      | `GET`    | `/api/analytics/feedback` | Returns customer satisfaction, rating distribution, and reviews                  |
| Analytics      | `GET`    | `/api/analytics/returns`  | Returns return-rate metrics and categorized return reasons                       |
| Uploads        | `POST`   | `/api/upload`             | Uploads a catalog image using Multer                                             |

### Automated 5% GST Calculation

When an order is submitted to `POST /api/orders`, the backend checks inventory and calculates the subtotal, GST, and final total.

- **Subtotal** = sum of quantity × unit price for all items
- **GST amount** = round(subtotal × 0.05, 2)
- **Total amount** = subtotal + GST amount

The order receipt includes an order ID, timestamp, customer details, and pricing summary.

## Frontend Setup (Quickstart)

Open a separate terminal from the project root and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend is expected to run at `http://localhost:5173`.

## Team & Credits

- **Princel Tixeira:** Frontend architecture, UI/UX, responsive component design, and client state management.
- **Pearlin Tixeira:** Backend architecture, REST API design, database integration, Multer file handling, and automated testing.

## License & Documentation

- Product requirements and user stories: [`PRD.md`](PRD.md)
- Development and collaboration protocols: [`AGENTS.md`](AGENTS.md)
