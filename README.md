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
