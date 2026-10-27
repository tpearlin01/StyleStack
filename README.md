# StyleStack 👗

StyleStack is a full-stack fashion e-commerce application designed to provide a smooth online shopping experience. It includes product browsing, filtering, cart management, order processing, and administrative features.

## Problem Statement

Traditional clothing stores often face challenges in managing product catalogs, tracking orders, and providing customers with a convenient shopping experience. StyleStack aims to simplify these processes through a centralized e-commerce platform.

## Key Features

- Product catalog with filtering and browsing
- Shopping cart management
- Order processing and tracking
- Admin features for managing products
- Product image uploads
- Analytics and store insights
- Invoice generation with 5% GST
- REST API for frontend-backend communication
- Backend integration and automated testing

## Key Differentiators

- Simple and user-friendly shopping experience
- Centralized product and order management
- Automated invoice generation
- Admin-focused store analytics
- Modular frontend and backend architecture

## Project Architecture

```text
StyleStack/
├── frontend/             # React frontend application
├── backend/
│   ├── controllers/      # Request handling logic
│   ├── routes/           # API route definitions
│   ├── middleware/       # Middleware and error handling
│   ├── data/             # JSON-backed data files
│   ├── tests/             # Backend test suites
│   └── ...
├── README.md
└── ...
```

## Directory Responsibilities

- **frontend:** User interface and customer-facing shopping features.
- **backend:** Server-side logic and REST API.
- **controllers:** Handles application requests and responses.
- **routes:** Defines available API endpoints.
- **middleware:** Handles request processing and errors.
- **data:** Contains JSON data files used by the application.
- **tests:** Contains automated backend tests.

## Tech Stack

| Component          | Technology         | Purpose                                   |
| ------------------ | ------------------ | ----------------------------------------- |
| Frontend           | React              | Builds the user interface                 |
| Development Server | Vite               | Runs the frontend development environment |
| Styling            | Tailwind CSS       | Provides responsive styling               |
| Backend            | Node.js            | Runs server-side JavaScript               |
| API Framework      | Express.js         | Handles HTTP requests and routes          |
| Database           | MongoDB            | Database option when configured           |
| Fallback Storage   | JSON files         | Stores data using local JSON files        |
| Authentication     | JWT                | Supports token-based authentication       |
| File Uploads       | Multer             | Handles uploaded files                    |
| Testing            | Jest and Supertest | Tests backend functionality               |

## Application Architecture

StyleStack follows a client-server architecture.

1. The frontend displays products and provides the shopping interface.
2. The backend processes requests and applies application logic.
3. REST API endpoints connect the frontend and backend.
4. Data is stored using the configured storage mechanism.
5. The testing framework helps verify backend functionality.

## Backend Setup

### Prerequisites

- Node.js and npm
- Git
- MongoDB, if using MongoDB storage

### Installation

Clone the repository:

```bash
git clone https://github.com/tpearlin01/StyleStack.git
cd StyleStack
```

Navigate to the backend directory:

```bash
cd backend
npm install
```

### Environment Variables

Configure the environment variables required by the backend in a `.env` file.

Example:

```env
PORT=5000
JWT_SECRET=your_secret_key
MONGODB_URI=your_mongodb_connection_string
```

Replace the example values with your actual configuration. Use only the variables supported by your implementation.

### Run the Backend

```bash
npm start
```

If your project uses a different start script, check the `scripts` section of `backend/package.json`.

## Database & Data Storage

StyleStack supports application data management through its configured storage mechanism.

### MongoDB

When MongoDB is configured, it can be used to store application data such as products and orders.

### JSON Storage

The backend also contains JSON data files under `backend/data/`, including:

- `products.json`
- `orders.json`

These files provide a local data-storage option where supported by the application.

### Data Handling

- Product data supports catalog operations.
- Order data supports order-related operations.
- The backend processes requests through its controllers and routes.
- The actual storage method depends on the application's implementation and configuration.

## API Endpoints Reference

The backend exposes REST API endpoints for application functionality. Refer to the backend route files for the exact paths and HTTP methods.

| Feature        | Purpose                                 |
| -------------- | --------------------------------------- |
| Products       | Retrieve and manage product information |
| Orders         | Handle order-related operations         |
| Analytics      | Provide store statistics and insights   |
| Authentication | Handle authentication where implemented |
| File Uploads   | Process product image uploads           |

**Note:** Confirm the exact endpoint paths, HTTP methods, and authentication requirements from the implemented backend routes before using them.

## API Usage Guide

REST APIs allow the frontend and other clients to communicate with the backend using HTTP requests.

A typical API request includes:

1. The API endpoint URL.
2. The appropriate HTTP method, such as GET, POST, PUT, or DELETE.
3. Required request headers.
4. A request body when the endpoint requires data.
5. The server response containing the result or error information.

Example request using JavaScript:

```javascript
fetch("http://localhost:5000/api/products")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return response.json();
  })
  .then((products) => {
    console.log(products);
  })
  .catch((error) => {
    console.error(error);
  });
```

Replace the example URL with the actual API endpoint configured in your project.

## Invoice Calculation

StyleStack includes invoice generation with 5% GST.

The general calculation is:

- **Subtotal:** Sum of the item prices.
- **GST:** 5% of the applicable taxable amount.
- **Total:** Subtotal plus GST.

The final invoice calculation should follow the tax logic implemented by the application.

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Vite provides the frontend development server. Open the local URL displayed in the terminal to access the application.

## Testing

The backend uses Jest and Supertest for automated testing.

Run the test command configured in `backend/package.json`. For example, if the project defines a `test` script:

```bash
npm test
```

Tests help verify API responses, request handling, and backend functionality.

## Team & Credits

StyleStack is a collaborative full-stack development project.

- **Frontend:** React, Vite, and Tailwind CSS
- **Backend:** Node.js and Express.js
- **Testing:** Jest and Supertest

## License & Documentation

Refer to the repository's license file and project configuration for licensing and additional implementation details.
