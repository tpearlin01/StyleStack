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
| Payment Gateway    | Razorpay           | Online payment processing (Test mode)  |
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

StyleStack supports data storage through its configured backend storage mechanism.

### MongoDB

MongoDB can be used to store application data when the database integration is configured. The connection settings must match the backend implementation.

### JSON Storage

The backend includes JSON data files under `backend/data/`:

- `products.json` — Product data.
- `orders.json` — Order data.

These files support local data storage where the application is configured to use them.

### Data Handling

- Product operations use the backend's product-management logic.
- Order operations use the backend's order-management logic.
- Controllers and routes handle requests involving application data.
- The active storage mechanism depends on the implemented configuration.

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
| `/api/payment/razorpay/order` | Razorpay order creation            |
| `/api/payment/razorpay/verify`| Payment signature verification     |
| `/api/payment/razorpay/failure`| Payment cancellation/failure logging|
| `/api/payment/razorpay/config`| Public Razorpay key configuration  |
| `/api/payment/email/test` | Test Gmail SMTP email transmission     |

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

## Cloud Integration and Payment Gateway Setup

### 1. Razorpay Test Mode Integration

StyleStack integrates the Razorpay payment gateway in Test Mode for zero-risk simulated transactions.

#### Getting Razorpay Test Credentials

1. Sign up or log in at [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Toggle to **Test Mode** in the top navigation bar.
3. Navigate to **Account & Settings** &rarr; **API Keys**.
4. Click **Generate Test Key** and copy:
   - `Key ID` (e.g. `rzp_test_...`)
   - `Key Secret`
5. Add to `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
   RAZORPAY_KEY_SECRET=YourKeySecretHere
   ```
6. Add public Key ID to `frontend/.env` (optional, backend also provides it dynamically):
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
   ```

#### Payment Flow Security

- **Server-Side Order Creation:** Payment orders are created via `POST /api/payment/razorpay/order` on the backend.
- **Cryptographic Signature Verification:** Upon frontend checkout completion, `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` are sent to `POST /api/payment/razorpay/verify`. The backend validates the signature using HMAC SHA256 before marking the order as `Paid`.
- **Zero Card Data Storage:** Customer card numbers and CVV codes are handled exclusively by Razorpay PCI-DSS compliant iframe modals and never touch StyleStack servers.

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
- **Payment Confirmation Receipt:** Triggered immediately upon server-side cryptographic payment verification. Includes Razorpay transaction reference, total amount paid, and verified badge.
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
   - `MONGODB_URI`: Azure Cosmos DB MongoDB connection string (or leave empty for JSON fallback).
   - `JWT_SECRET`: Secure random string.
   - `RAZORPAY_KEY_ID`: Your Razorpay Test Key ID.
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Test Key Secret.
   - `EMAIL_USER`: Your Gmail address.
   - `EMAIL_APP_PASSWORD`: Your 16-character Google App Password.

#### Frontend Deployment (Azure Static Web Apps)

1. Connect your repository to **Azure Static Web Apps**.
2. **App location:** `/frontend`
3. **Output location:** `dist`
4. **Environment Variables:**
   - `VITE_API_BASE_URL`: `https://<your-app-service-name>.azurewebsites.net`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_test_...`
5. Single Page Application (SPA) routing is pre-configured in `frontend/public/staticwebapp.config.json`.
