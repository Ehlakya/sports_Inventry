# Sports Inventory Management System Backend

An enterprise-grade, backend-only **Sports Inventory Management System** built using Node.js, Express.js, PostgreSQL, Sequelize ORM, and Role-Based Access Control (RBAC).

---

## 🌟 Key Features

1. **Authentication & Session Security**:
   - JWT authentication via short-lived access tokens.
   - Long-lived session management via refresh tokens stored in the database.
   - Secure password hashing using bcrypt.
2. **Role-Based Access Control (RBAC)**:
   - Three distinct roles: `ADMIN`, `SUPPLIER`, and `CUSTOMER`.
   - Middleware-level verification of roles before granting route access.
3. **Role-Based Product Pricing**:
   - Customers see only `customerPrice`.
   - Suppliers see only `supplierPrice`.
   - Admins see both `customerPrice` and `supplierPrice`.
4. **GST Logic**:
   - **Customer orders** are charged **18% GST** (Subtotal = Product Customer Price $\times$ Qty).
   - **Supplier orders** are charged **12% GST** (Subtotal = Product Supplier Price $\times$ Qty).
5. **Real-time Inventory & Stock Reductions**:
   - Stock is verified at the specific size configuration level.
   - Placing orders automatically decrements stock inside a database transaction, updates the product's sum quantity, and writes inventory transaction logs.
6. **Delivery Date Calculation**:
   - Dynamically calculates `estimatedDeliveryDate` = Order Date + 7 Days.
   - Formats delivery dates (e.g. `"10 June 2026"`) and includes `"deliveryWithin": "1 Week"`.
7. **Separate Role-based Dashboards**:
   - **Admin Dashboard**: Total Products, Suppliers, Customers, Orders, available stock count, Sales Summaries, and Low Stock Alerts (stock < 10).
   - **Supplier Dashboard**: Total Bulk Orders, Order History, Pending Orders, Completed Orders.
   - **Customer Dashboard**: Recent Orders (last 5), Total Orders, and Cart Summaries.
8. **Stateless Cart Calculations**:
   - Enjoys helper cart calculation endpoints (`POST /api/v1/orders/cart-summary`) that validate stocks and return prices and delivery schedules without modifying DB states.

---

## 📂 Project Architecture (MVC + Services)

```
d:\Sports/
├── package.json
├── .env.example
├── .env
├── README.md
├── scratch/
│   └── test-endpoints.js
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── category.controller.js
    │   ├── dashboard.controller.js
    │   ├── inventory.controller.js
    │   ├── order.controller.js
    │   └── product.controller.js
    ├── middleware/
    │   ├── auth.middleware.js
    │   ├── error.middleware.js
    │   └── validate.middleware.js
    ├── models/
    │   ├── index.js
    │   ├── user.model.js
    │   ├── category.model.js
    │   ├── product.model.js
    │   ├── productSize.model.js
    │   ├── order.model.js
    │   ├── orderItem.model.js
    │   ├── salesSummary.model.js
    │   └── inventoryTransaction.model.js
    ├── routes/
    │   ├── index.js
    │   ├── auth.routes.js
    │   ├── category.routes.js
    │   ├── product.routes.js
    │   ├── order.routes.js
    │   ├── dashboard.routes.js
    │   └── inventory.routes.js
    ├── services/
    │   ├── dashboard.service.js
    │   ├── order.service.js
    └── validations/
        ├── auth.validation.js
        ├── category.validation.js
        ├── order.validation.js
        └── product.validation.js
```

---

## 🛠 Setup & Run Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** database server

### 2. Install Dependencies
Run from the root directory:
```bash
npm install
```
*(On Windows systems blocking script execution, use `npm.cmd install`)*

### 3. Environment Variables Config
Create a `.env` file in the root directory (based on `.env.example`):
```ini
PORT=5000
NODE_ENV=development

# Database Settings
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=sports_inventory
DB_USER=postgres
DB_PASS=postgres

# Secret Keys
JWT_SECRET=supersecretjwtkeyforaccess123!
JWT_REFRESH_SECRET=supersecretjwtkeyforrefresh456!
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Setup Database & Inject Seeders
Ensure PostgreSQL is running and the database matches `DB_NAME`. If not created, create it:
```bash
psql -U postgres -c "CREATE DATABASE sports_inventory;"
```
Execute the reset and initialization script to build tables and seed mock data:
```bash
npm run seed
```

### 5. Running the Application
To run in development mode (using nodemon):
```bash
npm run dev
```
To run in production mode:
```bash
npm start
```

### 6. Running Verification Tests
To execute the automated end-to-end integration tests:
```bash
npm test
```

---

## 👤 Seeder Accounts

You can test roles immediately using these seeded credentials:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@sports.com` | `admin123` | Full access, product creation, stock updates, revenue auditing. |
| **SUPPLIER** | `supplier@sports.com` | `supplier123` | Views products and sizes, places bulk orders, sees supplier dashboard. |
| **CUSTOMER** | `customer@sports.com` | `customer123` | Browses products, adds items to cart, places customer orders, views history. |

---

## 🌐 API Endpoint Reference

All endpoints are prefixed with `/api/v1`.

### 1. Authentication
* `POST /auth/register` - Registers a new user. (Validates name, email, password, role, phone, address).
* `POST /auth/login` - Signs in user. Returns an access token and a refresh token.
* `POST /auth/refresh` - Requests a new access token using a valid refresh token.
* `POST /auth/logout` - (Auth required) Invalidates and clears the user's refresh token.

### 2. Categories (Auth Required)
* `GET /categories` - Fetches all product categories.
* `POST /categories` - (Admin only) Creates a new category.
* `PUT /categories/:id` - (Admin only) Updates a category name.
* `DELETE /categories/:id` - (Admin only) Deletes a category.

### 3. Products (Auth Required)
* `GET /products` - Fetches all products. Allows query parameters `search` (text search), `categoryId` (category filter), and `brand` (brand filter). Sanitizes pricing.
* `GET /products/:id` - Fetches detailed product details.
* `GET /products/:id/sizes` - (Admin/Supplier only) Fetches size options and stocks.
* `POST /products` - (Admin only) Creates a new product. Can optionally accept an array of sizes with initial stock.
* `PUT /products/:id` - (Admin only) Updates product details.
* `DELETE /products/:id` - (Admin only) Deletes a product.
* `PUT /products/:id/sizes` - (Admin only) Updates stock configuration for multiple sizes.

### 4. Orders (Auth Required)
* `GET /orders` - Fetches order history. (Admin gets all, Customers/Suppliers get their own).
* `GET /orders/:id` - Fetches single order details.
* `POST /orders` - (Customer/Supplier only) Places a new order and triggers inventory reduction.
* `POST /orders/cart-summary` - (Customer/Supplier only) Returns subtotal, GST, delivery date for cart items without database modification.
* `PUT /orders/:id/status` - (Admin only) Updates an order status (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

### 5. Dashboards (Auth Required)
* `GET /dashboard` - Fetches customized dashboard statistics depending on the authenticated role.

### 6. Inventory & Audits (Auth Required, Admin Only)
* `GET /inventory/transactions` - Lists all database stock transaction logs.
* `GET /inventory/sales-summary` - Fetches sales and revenue numbers.
