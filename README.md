# Multi-Vendor E-Commerce Marketplace (Amazon-Style)

A production-grade, full-stack multi-vendor marketplace web platform built with **Spring Boot 3 (Java 17/21)**, **PostgreSQL**, **Spring Security (JWT + 2FA OTP)**, and **React (Vite + Tailwind CSS)**.

---

## 🌟 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17+, Spring Boot 3.3.4, Spring Security, Spring Data JPA, Spring Mail (SMTP), JJWT 0.12.6, Maven |
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, React Router Dom v6, Lucide Icons |
| **Database** | PostgreSQL 17+ (Schema & Seed SQL scripts provided) |
| **Authentication** | Two-Factor Authentication: Email + Password &rarr; 6-Digit Time-Bound OTP &rarr; JWT Bearer Token |

---

## 📂 Project Architecture

```
d:/MVECM/
├── database/
│   ├── schema.sql            # PostgreSQL schema definitions with FKs, indexes & constraints
│   └── seed_data.sql          # Seed data (Admin, demo user, categories, vendors & 12 products)
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/mvecm/
│       │   ├── MvecmApplication.java
│       │   ├── config/        # SecurityConfig, CorsConfig, DataInitializer
│       │   ├── controller/    # Auth, Product, Category, Vendor, Cart, Order, User, Admin
│       │   ├── dto/           # Strongly-typed request/response models with @Valid constraints
│       │   ├── entity/        # JPA Entities (User, OtpToken, Product, Category, Vendor, Order...)
│       │   ├── exception/     # ResourceNotFound, BadRequest, Unauthorized & GlobalHandler
│       │   ├── repository/    # Spring Data JPA repositories with filter queries
│       │   ├── security/      # JwtUtils, JwtFilter, CustomUserDetails & EntryPoint
│       │   └── service/       # Business logic for Auth, Mail, Storefront & Seller Central
│       └── resources/
│           └── application.properties
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── api/client.js      # Axios instance with automatic JWT Authorization interceptor
│       ├── context/           # AuthContext (OTP & sessions), CartContext
│       ├── components/        # Navbar, SubNavbar, Footer, ProductCard, Modal, Toast...
│       └── pages/             # Home, ProductDetail, Cart, Checkout, MyOrders, Profile, Login, Register, AdminDashboard
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Database Setup (PostgreSQL)

Make sure PostgreSQL is running on your system (Default port `5432`).

1. Open PowerShell / Terminal and create the database:
   ```powershell
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -p 5432 -U postgres -c "CREATE DATABASE mvecm_db;"
   ```

2. Execute the schema and seed scripts:
   ```powershell
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -p 5432 -U postgres -d mvecm_db -f "d:\MVECM\database\schema.sql"
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -p 5432 -U postgres -d mvecm_db -f "d:\MVECM\database\seed_data.sql"
   ```

*(Note: The database tables and initial users can also be automatically managed by Spring Boot via JPA `hibernate.ddl-auto=update` and the built-in `DataInitializer`).*

---

### 2. Backend Configuration & Launch

1. Review or configure [application.properties](file:///d:/MVECM/backend/src/main/resources/application.properties):
   ```properties
   spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:mvecm_db}
   spring.datasource.username=postgres
   spring.datasource.password=root@123

   # Gmail SMTP App Password (Optional in dev mode)
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   app.otp.dev-mode=true
   ```

2. Run the Spring Boot application:
   ```powershell
   cd d:\MVECM\backend
   mvn spring-boot:run
   ```
   *The backend starts at `http://localhost:8080`.*

> **💡 Developer OTP Mode:** When `app.otp.dev-mode=true`, the 6-digit OTP is printed prominently in the backend console (`[SECURITY OTP CODE]: >>> 123456 <<<`) and returned in the login response. The frontend includes a convenient **1-Click Auto-Fill** button during testing, allowing full functionality even without live SMTP credentials.

---

### 3. Frontend Launch

1. Open a new terminal and install dependencies (already pre-built):
   ```powershell
   cd d:\MVECM\frontend
   npm run dev
   ```

2. Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | OTP Flow |
|---|---|---|---|
| **Admin** | `admin@mvecm.com` | `Admin@123` | Server sends 6-digit OTP &rarr; Auto-Fill / enter OTP &rarr; Redirects to `/admin` |
| **Customer** | `customer@example.com` | `Customer@123` | Server sends 6-digit OTP &rarr; Enter OTP &rarr; Redirects to Storefront |

*Both demo accounts can also be populated with 1-click on the Login page.*

---

## 🛡️ Core Feature Walkthrough

### 1. Authentication & Security
- **Registration**: Name, email, password (BCrypt hashed), and role selection (`USER` / `ADMIN`).
- **Two-Step Login**: Email + Password &rarr; Server sends 6-digit OTP (expires in 5 minutes, max 3 attempts) &rarr; Enter OTP &rarr; Issues HMAC-SHA256 JWT.
- **Role-Based Guards**: Admin portal (`/api/admin/**` and `/admin`) is accessible only to users with role `ADMIN`.

### 2. Amazon-Style Storefront
- **Top Navigation**: Logo with Amazon smile accent, delivery address, multi-department search bar with category filter, account & lists dropdown, cart with badge counter.
- **Catalog & Filters**: Promotional banner carousel, department cards, filter sidebar (categories, price bands, vendor brands, sort orders).
- **Product Details & Buy Box**: High-res imagery, rating stars, Prime badge, urgency stock indicators, quantity selector, "Add to Cart", and "Buy Now".
- **Cart & Subtotal**: Free shipping progress indicator, quantity stepper, real-time total calculator.
- **Checkout Wizard**: Saved delivery address book or new address form, Cash on Delivery (COD) or Mock Credit Card payment, instant order generation with stock deduction.
- **My Orders**: Real-time status progress tracking (`PLACED` &rarr; `SHIPPED` &rarr; `DELIVERED`).

### 3. Seller Central (Admin Dashboard)
- **Executive Metrics**: Gross revenue, total orders, active catalog items, registered users, and status breakdown.
- **Product Management**: Searchable catalog table with modal forms to create, edit, change pricing/discounts/stock, or delete items.
- **Category Management**: Full CRUD for store departments and taxonomy.
- **Vendor Management**: Full CRUD for marketplace merchant stores.
- **Order Management**: Monitor customer orders and transition fulfillment statuses (`PLACED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **User Management**: View customer/admin directory and instantly toggle account block/unblock status.

---

## 📡 Key REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Validate credentials and trigger 6-digit OTP
- `POST /api/auth/verify-otp` - Verify OTP and receive JWT token
- `POST /api/auth/resend-otp` - Request a fresh OTP

### Storefront Catalog (`/api/products`, `/api/categories`, `/api/vendors`)
- `GET /api/products` - Filtered & paginated product search
- `GET /api/products/{id}` - Product details
- `GET /api/categories` - List active categories
- `GET /api/vendors` - List active vendors

### Cart & Orders (`/api/cart`, `/api/orders`, `/api/user`)
- `GET /api/cart` - View shopping cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}?quantity={qty}` - Update quantity
- `DELETE /api/cart/items/{id}` - Remove item
- `POST /api/orders` - Place order from cart
- `GET /api/orders` - View user orders
- `GET /api/user/profile` & `PUT /api/user/profile` - Profile management
- `GET /api/user/addresses` & `POST /api/user/addresses` - Address book

### Admin Portal (`/api/admin/**`)
- `GET /api/admin/overview` - Analytics & metrics summary
- `GET`, `POST`, `PUT`, `DELETE /api/admin/products` - Product CRUD
- `GET`, `POST`, `PUT`, `DELETE /api/admin/categories` - Category CRUD
- `GET`, `POST`, `PUT`, `DELETE /api/admin/vendors` - Vendor CRUD
- `GET /api/admin/orders` - View all marketplace orders
- `PUT /api/admin/orders/{id}/status` - Update order status
- `GET /api/admin/users` - User directory
- `PUT /api/admin/users/{id}/toggle-block` - Block/unblock user
