# StyleStack

**AI Mini Project — Semester V, Computer Engineering, DBIT**

StyleStack is a full-stack fashion e-commerce platform designed to simplify online apparel shopping and store management. It provides product browsing, filtering, cart and order management, product image uploads, invoice generation, and administrative analytics.

## Problem Statement

Managing an apparel store involves maintaining product catalogs, processing customer orders, organizing product images, and monitoring sales. These tasks can become difficult without a centralized system.

StyleStack addresses these challenges through a web-based e-commerce application that combines a customer-facing shopping interface with backend services for product management, order processing, and store analytics.

## Key Features

- **Product Catalog:** Browse and filter apparel products.
- **Shopping Cart:** Manage products selected for purchase.
- **Order Management:** Create and manage customer orders.
- **Admin Management:** Support product administration and store operations.
- **Image Uploads:** Handle product image uploads using Multer.
- **Invoice Generation:** Generate invoices with 5% GST.
- **Store Analytics:** Provide insights into store activity.
- **REST API:** Connect the frontend with backend services.
- **Automated Testing:** Test backend functionality using Jest and Supertest.

## Key Differentiators

- Integrated customer shopping and store management.
- Centralized product and order operations.
- Automated invoice generation with GST calculation.
- Store analytics for administrative use.
- Modular frontend and backend architecture.
- Support for MongoDB with JSON-based fallback storage, where configured by the application.

## Tech Stack

| Component          | Technology         | Purpose                                |
| ------------------ | ------------------ | -------------------------------------- |
| Frontend           | React              | User interface and reusable components |
| Development Server | Vite               | Frontend development and build tooling |
| Styling            | Tailwind CSS       | Responsive interface styling           |
| Backend            | Node.js            | Server-side JavaScript runtime         |
| API Framework      | Express.js         | REST API and request handling          |
| Database           | MongoDB            | Database storage when configured       |
| Fallback Storage   | JSON files         | Local data storage where supported     |
| Authentication     | JWT                | Token-based authentication             |
| File Uploads       | Multer             | Product image upload handling          |
| Testing            | Jest and Supertest | Backend testing                        |
| Payment & Checkout | Simulated Engine   | Zero-risk 3D-Secure, UPI QR, and COD   |
| Email Service      | Nodemailer + Gmail | Transactional email notifications      |

## Project Architecture

StyleStack follows a client-server architecture. The React frontend communicates with the Node.js and Express backend through REST API endpoints.

```text
StyleStack/
├── frontend/
│   └── React application
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── data/
│   │   ├── products.json
│   │   └── orders.json
│   └── tests/
├── PRD.md
├── AGENTS.md
└── README.md
```

The directory tree highlights the main project components. Additional files and directories may exist in the repository.

### Directory Responsibilities

- **frontend/** — Customer-facing interface and shopping functionality.
- **backend/controllers/** — Request handling and application logic.
- **backend/routes/** — REST API route definitions.
- **backend/middleware/** — Request processing, error handling, and related middleware.
- **backend/data/** — JSON data files used by the application.
- **backend/tests/** — Automated backend tests.
- **PRD.md** — Product requirements documentation.
- **AGENTS.md** — Project-specific development guidance.

## Application Architecture

The application is organized into three main layers:

1. **Frontend:** Displays the product catalog and provides the shopping interface.
2. **Backend:** Processes API requests, handles business logic, and manages application operations.
3. **Data Storage:** Uses the configured database or supported JSON-based storage mechanism.

The frontend sends HTTP requests to the backend. Express routes direct requests to the relevant controllers, while middleware supports request processing and error handling.

## Installation and Setup

### Prerequisites

- Node.js and npm
- Git
- MongoDB, if using MongoDB storage

### Clone the Repository

```bash
git clone https://github.com/tpearlin01/StyleStack.git
cd StyleStack
```

### Backend Setup

Open a terminal in the project directory and run:

```bash
cd backend
npm install
```

Configure the required environment variables in the backend `.env` file.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

These are configuration examples. Use the variable names and values required by the actual backend implementation. Keep secret values out of version control.

Start the backend using the script defined in `backend/package.json`:

```bash
npm start
```

### Frontend Setup

Open a separate terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite to access the frontend.

## Database and Data Storage

StyleStack features a production-ready **MongoDB Atlas** integration with an intelligent, resilient fallback mechanism.

### 1. MongoDB Atlas Setup Instructions

Follow these steps to connect StyleStack to a free-tier MongoDB Atlas cluster:

1. **Create an Atlas Account:**
   - Sign up or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Deploy a Free Cluster (M0 Sandbox):**
   - Click **Create Database** &rarr; Select the **M0 Free** cluster tier &rarr; Choose your preferred cloud provider and region (e.g., AWS / Mumbai).
3. **Configure Database Access (User Credentials):**
   - In the Atlas sidebar, navigate to **Security** &rarr; **Database Access**.
   - Click **Add New Database User**.
   - Select **Password** authentication.
   - Enter a username (e.g., `stylestack_admin`) and a secure password.
   - Assign the built-in role: **Read and write to any database**.
4. **Configure Network Access (IP Whitelist):**
   - In the Atlas sidebar, navigate to **Security** &rarr; **Network Access**.
   - Click **Add IP Address**.
   - For local development and Azure cloud deployment, choose **Allow Access From Anywhere** (`0.0.0.0/0`) or add your current public IP address.
5. **Obtain the Connection String:**
   - In the Atlas sidebar, click **Database** &rarr; Click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the SRV connection URI:
     ```text
     mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
     ```
6. **Set Connection String in `backend/.env`:**
   - In `backend/.env`, set `MONGODB_URI` with your actual username, password, and database name (e.g., `stylestack`):
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/stylestack?retryWrites=true&w=majority
     ```

### 2. Startup Connection Sequence & Fallback Mechanism

- **Pre-Flight Connection:** The backend (`backend/src/server.js` and `backend/app.js`) connects to MongoDB Atlas *before* launching the Express HTTP listener.
- **Graceful Error Handling:** If `MONGODB_URI` is missing or the cluster is temporarily unreachable (e.g., DNS error, IP block, network disconnect), the server catches the error, outputs clear diagnostic logs, and engages the local JSON store (`backend/src/data/store.js`) as a fallback so development and testing never stall.
- **Dynamic Mode Detection:** The backend logs its active state on startup:
  - `[DB] Storage Mode: MONGODB_ATLAS (Primary)`
  - `[DB Mode] Falling back gracefully to local JSON fallback store.`

### 3. Automated Zero-Loss Data Migration

On the first successful connection to an empty MongoDB database:
- The migration utility (`backend/src/utils/migrate.js`) scans `backend/data/products.json` and `backend/data/orders.json`.
- It idempotently seeds all catalog products (130+ apparel items), historical orders, and default users without duplicating records.
- If existing documents are found, they are preserved intact without data loss.

### 4. Models and Data Schema

- **Product (`backend/src/models/Product.js`):** Supports `id`, `name`/`title`, `brand`, `category`, `gender`, `price`, `sizes`, `stock`/`inStock`/`stockQuantity`, `badge`, `image`/`imageUrl`, `rating`, `reviewsCount`, and `description`. Pre-save hooks keep field aliases in sync.
- **Order (`backend/src/models/Order.js`):** Stores `id`/`orderId`, `customer` info, itemized apparel items, `subtotal`, `taxAmount`/`gstAmount` (5% GST), `shippingFee`, `total`/`totalAmount`, order `status` (`Placed`, `Dispatched`, `Delivered`), `paymentMethod`, `paymentStatus` (`Pending`, `Completed`), and Razorpay transaction IDs.
- **User (`backend/src/models/User.js`):** Manages `id`, `name`, `firstName`, `lastName`, `email`, `password`, and `role` (`customer`, `admin`).

### 5. Stock Management & Order Processing

When an order is submitted:
1. Stock availability is verified for each item in MongoDB.
2. An order document is created with full tax and customer breakdowns.
3. Inventory is automatically decremented (`$inc: { stock: -qty, stockQuantity: -qty, inStock: -qty }`).
4. Order confirmation email is dispatched via Nodemailer.

## API Documentation

The backend exposes REST API endpoints for product management, authentication, order processing, analytics, and file uploads.

The following reference summarizes the API groups documented for StyleStack. Confirm supported methods and request fields in the corresponding backend route and controller files.

| API Endpoint              | Purpose                                |
| ------------------------- | -------------------------------------- |
| `/api/health`             | Health check                           |
| `/api/auth/register`      | User registration                      |
| `/api/auth/login`         | User login                             |
| `/api/products`           | Product listing and product operations |
| `/api/orders`             | Order creation and order listing       |
| `/api/orders/:id`         | Retrieve an order by its identifier    |
| `/api/orders/:id/status`  | Update order status                    |
| `/api/analytics/overview` | Store analytics overview               |
| `/api/analytics/feedback` | Analytics-related feedback operations  |
| `/api/analytics/returns`  | Return-related analytics               |
| `/api/upload`             | File upload handling                   |
| `/api/email/test`          | Test Gmail SMTP email transmission     |

Product filtering and CRUD operations depend on the supported route methods and query parameters. Authentication requirements and access permissions depend on the corresponding middleware and route configuration.

### API Request Handling

The backend uses Express routes and controllers to process HTTP requests. Depending on the endpoint, requests may include query parameters, headers, or a JSON request body. The backend returns a response containing the result or an error.

## Invoice Generation

StyleStack supports invoice generation with 5% GST.

- **Subtotal:** Sum of the applicable item prices.
- **GST:** 5% of the applicable taxable amount.
- **Total:** Subtotal plus GST.

The final calculation follows the invoice logic implemented in the application.

## Testing

The backend uses Jest and Supertest for automated testing.

The test suites help verify backend functionality, request handling, and API responses.

Run the test script defined in `backend/package.json`:

```bash
cd backend
npm test
```

## Order Processing, Simulated Payment & Cloud Setup

### 1. Simulated Checkout and Payment Processing

StyleStack features a zero-risk simulated checkout engine that validates and processes payments without requiring external third-party payment gateways:

- **Cash on Delivery (COD):** Allows customers to place orders instantly with `Payment Status: Pending`, ideal for physical goods delivery.
- **Instant UPI / GPay:** Supports dynamic UPI QR code scanning and UPI ID (VPA) verification simulation.
- **Credit / Debit Card (3D-Secure Verified):** Validates 16-digit card number, MM/YY expiry, CVV, and cardholder name, followed by a simulated 3D-Secure bank OTP modal:
  - **Success Simulation:** Entering demo OTP `123456` (or clicking *Auto-Fill Demo OTP*) confirms payment and transitions to the interactive invoice receipt.
  - **Failure Simulation:** Entering `000000` (or clicking *Simulate Failure*) simulates bank decline and displays an explicit payment failure alert with retry guidance.
- **Automated Order Creation & Stock Update:** Successful orders are saved to MongoDB Atlas, inventory is decremented, and an order confirmation email is dispatched.

### 2. Gmail SMTP Notifications via Nodemailer

StyleStack dispatches automated transactional emails using Nodemailer with Gmail SMTP.

#### Generating a Google Gmail App Password

1. Log into your Google Account and go to [Google Account Security](https://myaccount.google.com/security).
2. Enable **2-Step Verification** if not already enabled.
3. Search for or navigate to [App Passwords](https://myaccount.google.com/apppasswords).
4. Enter an app name (e.g., `StyleStack Store`) and click **Create**.
5. Copy the generated 16-character passcode.
6. Add to `backend/.env`:
   ```env
   EMAIL_USER=your_store_email@gmail.com
   EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

#### Email Notification Types

- **Order Confirmation Email:** Triggered when a customer places an order. Includes order reference, itemized clothing list with sizes and quantities, subtotal, 5% GST, free shipping, and delivery destination.
- **Payment Confirmation Receipt:** Triggered upon verified payment simulation. Includes transaction reference, total amount paid, and verified badge.
- **Resilience & Deduplication:** All email operations are non-blocking. If SMTP credentials are missing or network times out, orders remain created and safe. An in-memory deduplication index prevents duplicate email dispatches.

### 3. Azure App Service and Cloud Deployment

StyleStack is optimized for deployment on Azure App Service (Backend) and Azure Static Web Apps (Frontend).

#### Backend Deployment (Azure App Service)

1. **Port Binding:** The backend listens on `process.env.PORT` and binds to `0.0.0.0` (required for Azure App Service Linux containers).
2. **Startup Command:** Set startup command in Azure Portal to:
   ```bash
   node app.js
   ```
3. **Application Settings (Environment Variables):**
   In Azure Portal &rarr; App Service &rarr; **Configuration** / **Environment variables**:
   - `PORT`: Set automatically by Azure.
   - `CLIENT_URL`: `https://<your-static-web-app>.azurestaticapps.net`
   - `MONGODB_URI`: Azure Cosmos DB MongoDB connection string or MongoDB Atlas URI (or leave empty for JSON fallback).
   - `JWT_SECRET`: Secure random string.
   - `EMAIL_USER`: Your Gmail address.
   - `EMAIL_APP_PASSWORD`: Your 16-character Google App Password.

#### Frontend Deployment (Azure Static Web Apps)

1. Connect your repository to **Azure Static Web Apps**.
2. **App location:** `/frontend`
3. **Output location:** `dist`
4. **Environment Variables:**
   - `VITE_API_BASE_URL`: `https://<your-app-service-name>.azurewebsites.net`
5. Single Page Application (SPA) routing is pre-configured in `frontend/public/staticwebapp.config.json`.
