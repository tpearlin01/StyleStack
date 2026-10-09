# AGENTS.md — Development Guidelines for StyleStack

## 1. Project Context
* **App Name:** StyleStack
* **Stack:** React (Vite) + Tailwind CSS (Frontend), Node.js + Express + Mongoose (Backend).
* **Workspace Setup:** Monorepo with two root directories: `/frontend` and `/backend`.

## 2. Agent Rules for Frontend Development (Princel)
* **Directory Scope:** Confine changes to `/frontend`.
* **Zero Backend Blocking:** Use a decoupled API service layer (`frontend/src/services/api.js`). Provide high-fidelity mock data by default so features (filtering, cart changes, instant checkout invoice generation) run standalone without a live server.
* **UI/UX Standard:** Clean, modern fashion aesthetic. Use responsive Tailwind layouts, clear typography, and Lucide React icons.
* **State Management:** Use React Context or standard hooks (`useState`, `useReducer`) for cart and user state. Persist cart data to `localStorage`.
* **Bill / Receipt Generation:** Immediately show invoice breakdowns on checkout (Itemized list, Subtotal, 5% GST, Shipping fee, Total, Order ID).

## 3. Agent Rules for Backend Development (Pearlin)
* **Directory Scope:** Confine changes to `/backend`.
* **API Standards:** Return uniform JSON payloads:
  - Success: `{ "success": true, "data": ... }`
  - Error: `{ "success": false, "message": "..." }`
* **CORS & Environment:** Enable `cors()` to allow `http://localhost:5173` (Vite dev server). Read sensitive keys from `.env` via `dotenv`.
* **Validation:** Validate incoming request bodies before database operations. Return HTTP 400 with meaningful error messages for invalid inputs.
* **Database & Storage:** Integrate Mongoose for MongoDB Atlas and configure Multer for file/image handling.

## 4. Git Collaboration Protocol
* Never commit `.env` or `node_modules/` files.
* Work strictly inside your assigned branch (`frontend` for Princel, `backend` for Pearlin).
* Merge code through GitHub Pull Requests into `main`.
