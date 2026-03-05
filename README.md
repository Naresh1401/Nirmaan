# 🏗️ Nirmaan — Construction Materials Marketplace

**Digital Infrastructure for Construction Material Supply**

Nirmaan is a full-stack construction materials marketplace platform connecting builders, suppliers, and delivery partners. It features real-time pricing, AI-powered material estimation, business credit, OTP authentication, and a comprehensive admin dashboard.

---

## 📑 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables & API Keys](#environment-variables--api-keys)
- [Getting Started](#getting-started)
- [End-to-End Workflow](#end-to-end-workflow)
- [API Reference](#api-reference)
- [Security](#security)
- [Frontend Pages](#frontend-pages)
- [Deployment](#deployment)

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Next.js 16    │────▶│   FastAPI 0.109  │────▶│  PostgreSQL 17   │
│   Port 3000     │     │   Port 8000      │     │  Port 5433       │
│   TailwindCSS   │     │   Uvicorn ASGI   │     │  asyncpg driver  │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────▼─────┐     ┌──────▼──────┐
              │   Redis    │     │   Twilio    │
              │ Port 6379  │     │  SMS / OTP  │
              └───────────┘     └─────────────┘
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11 | Runtime |
| FastAPI | 0.109.2 | REST API framework |
| SQLAlchemy | 2.0.27 | Async ORM (asyncpg driver) |
| PostgreSQL | 17 | Primary database |
| Pydantic | 2.6.1 | Data validation & settings |
| python-jose | 3.3.0 | JWT token generation |
| bcrypt | via passlib | Password hashing |
| Twilio | 9.10.2 | SMS OTP delivery |
| Celery + Redis | 5.3.6 | Background task queue |
| boto3 | 1.34.34 | AWS S3 file uploads |
| geopy | 2.4.1 | Geolocation / distance |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Utility-first styling |
| Lucide React | 0.312 | Icon library |
| Zustand | 4.5.0 | State management |
| React Query | 5.17.0 | Server state / caching |
| Axios | 1.6.5 | HTTP client |

---

## Project Structure

```
NIRMAN/
├── .env                          # Environment variables (all API keys)
├── docker-compose.yml            # Full-stack Docker deployment
├── README.md                     # This file
│
├── backend/
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Backend container
│   ├── alembic.ini               # DB migration config
│   ├── venv/                     # Python virtual environment
│   └── app/
│       ├── main.py               # FastAPI app entry point
│       ├── core/
│       │   ├── config.py         # Settings (pydantic-settings, loads .env)
│       │   ├── database.py       # Async SQLAlchemy engine & session
│       │   ├── security.py       # JWT, password hashing, auth dependency
│       │   └── middleware.py     # Security headers, rate limit, sanitization
│       ├── models/
│       │   ├── user.py           # User (username, phone, email, role)
│       │   ├── product.py        # Product & MaterialCategory
│       │   ├── supplier.py       # Supplier profiles
│       │   ├── order.py          # Order, OrderItem, SubOrder
│       │   ├── delivery.py       # DeliveryPartner, Delivery
│       │   ├── review.py         # Product/Supplier reviews
│       │   ├── payment.py        # Payment records
│       │   ├── inventory.py      # Inventory & price change logs
│       │   └── quality.py        # Quality checks
│       ├── schemas/              # Pydantic request/response schemas
│       ├── routers/
│       │   ├── auth.py           # Register, login, OTP, forgot password
│       │   ├── products.py       # CRUD products & categories
│       │   ├── orders.py         # Order placement & management
│       │   ├── suppliers.py      # Supplier registration & inventory
│       │   ├── delivery.py       # Delivery partner ops & tracking
│       │   ├── search.py         # Full-text search
│       │   ├── admin.py          # Admin dashboard & management
│       │   ├── estimator.py      # AI material estimator & chat
│       │   ├── reviews.py        # Review system
│       │   ├── prices.py         # Price history & trends
│       │   ├── credit.py         # Business credit system
│       │   └── inventory.py      # Stock & price management
│       └── services/
│           ├── otp.py            # OTP generation, Twilio SMS, verification
│           ├── estimator.py      # Construction material calculations
│           ├── logistics.py      # Delivery logistics
│           ├── matching.py       # Supplier matching
│           └── notifications.py  # Notification service
│
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── src/
│       ├── context/
│       │   └── AuthContext.tsx    # Auth state (login, register, logout)
│       ├── components/
│       │   ├── Navbar.tsx        # Navigation with auth state
│       │   ├── Footer.tsx        # Site footer with links
│       │   ├── ChatBot.tsx       # AI Civil Engineering Estimator
│       │   ├── AuthGuard.tsx     # Route protection wrapper
│       │   ├── ProductCard.tsx   # Product display card
│       │   └── NirmaanLogo.tsx   # Brand logo component
│       └── app/                  # Next.js App Router pages
│           ├── page.tsx          # Homepage (hero, categories, featured)
│           ├── login/            # Login (password + OTP tabs)
│           ├── register/         # 2-step registration
│           ├── forgot-password/  # 4-step password reset wizard
│           ├── products/         # Product listing & detail
│           ├── cart/             # Shopping cart
│           ├── checkout/         # Order checkout
│           ├── orders/           # Order history & tracking
│           ├── suppliers/        # Supplier directory
│           ├── supplier/         # Supplier dashboard
│           ├── delivery/         # Delivery partner dashboard
│           ├── estimator/        # AI material estimator
│           ├── credit/           # Business credit dashboard
│           ├── admin/            # Admin panel (6-tab dashboard)
│           ├── about/            # About Nirmaan
│           ├── contact/          # Contact us
│           ├── blog/             # Construction blog
│           ├── careers/          # Job listings
│           ├── help/             # FAQ & help center
│           ├── terms/            # Terms of service
│           ├── privacy/          # Privacy policy
│           └── partner/          # Partner with us
```

---

## Prerequisites

| Requirement | Version | Check Command |
|---|---|---|
| Node.js | ≥ 18 | `node --version` |
| Python | 3.11+ | `python3 --version` |
| PostgreSQL | 17 | `psql --version` |
| Redis | 7+ (optional) | `redis-cli ping` |

---

## Environment Variables & API Keys

All configuration is managed through the `.env` file at the project root. The backend loads it automatically via `pydantic-settings`.

### `.env` File

```env
# ═══════════════════════════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════════════════════════
DATABASE_URL=postgresql+asyncpg://nirmaan:nirmaan@localhost:5433/nirmaan

# ═══════════════════════════════════════════════════════════════
# AUTH & SECURITY
# ═══════════════════════════════════════════════════════════════
# Generate a secure key: python3 -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ═══════════════════════════════════════════════════════════════
# REDIS (for Celery task queue)
# ═══════════════════════════════════════════════════════════════
REDIS_URL=redis://localhost:6379/0

# ═══════════════════════════════════════════════════════════════
# CORS & FRONTEND
# ═══════════════════════════════════════════════════════════════
CORS_ORIGINS=["http://localhost:3000"]
NEXT_PUBLIC_API_URL=http://localhost:8000

# ═══════════════════════════════════════════════════════════════
# TWILIO — SMS OTP Delivery
# ═══════════════════════════════════════════════════════════════
# Sign up: https://www.twilio.com/try-twilio (free trial = $15 credit)
# Console: https://console.twilio.com → Account SID & Auth Token
# Buy a phone number from the Twilio console (~$1.15/month)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# ═══════════════════════════════════════════════════════════════
# GOOGLE MAPS (optional — delivery routing)
# ═══════════════════════════════════════════════════════════════
# Console: https://console.cloud.google.com/apis/credentials
# Enable: Maps JavaScript API, Geocoding API, Directions API
GOOGLE_MAPS_API_KEY=

# ═══════════════════════════════════════════════════════════════
# RAZORPAY — Payment Gateway (optional)
# ═══════════════════════════════════════════════════════════════
# Dashboard: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# ═══════════════════════════════════════════════════════════════
# AWS S3 — File/Image Uploads (optional)
# ═══════════════════════════════════════════════════════════════
# Console: https://console.aws.amazon.com/iam → Create access key
S3_BUCKET=nirmaan-uploads
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### API Key Setup Guide

| Service | Required? | Free Tier | How to Get |
|---|---|---|---|
| **Twilio** | For real SMS OTP | $15 trial credit | 1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio) 2. Copy Account SID & Auth Token from Console 3. Buy a phone number ($1.15/mo) |
| **Google Maps** | Optional | $200/mo free | 1. Go to [Google Cloud Console](https://console.cloud.google.com) 2. Enable Maps APIs 3. Create API key under Credentials |
| **Razorpay** | Optional | Test mode free | 1. Sign up at [razorpay.com](https://razorpay.com) 2. Generate API keys from Dashboard → Settings → API Keys |
| **AWS S3** | Optional | 5GB free | 1. Create an S3 bucket in [AWS Console](https://console.aws.amazon.com/s3) 2. Create IAM user with S3 access 3. Generate access key |

> **Note:** Without Twilio configured, OTPs appear in the terminal console and as a blue "Dev Mode OTP" box on the frontend — no SMS is sent. The app works fully in dev mode without any external API keys.

---

## Getting Started

### 1. Clone & Setup Database

```bash
# Clone the repository
git clone https://github.com/Naresh1401/Nirmaan.git
cd Nirmaan

# Start PostgreSQL (if using Homebrew)
brew services start postgresql@17

# Create database and user
psql -h localhost -p 5433 -U postgres -c "CREATE USER nirmaan WITH PASSWORD 'nirmaan' CREATEDB;"
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE nirmaan OWNER nirmaan;"
```

### 2. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
DATABASE_URL="postgresql+asyncpg://nirmaan:nirmaan@localhost:5433/nirmaan" \
SECRET_KEY="dev-secret-key" \
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend auto-creates all database tables on first startup.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

### 4. Access the Application

| URL | Description |
|---|---|
| http://localhost:3000 | Frontend application |
| http://localhost:8000 | Backend API root |
| http://localhost:8000/docs | Swagger API docs (debug mode only) |
| http://localhost:8000/health | Health check |

### 5. Docker Deployment (alternative)

```bash
docker-compose up --build
```

This launches PostgreSQL, Redis, backend, and frontend in containers.

---

## End-to-End Workflow

### 1. User Registration & Authentication

```
┌──────────┐     ┌──────────────┐     ┌───────────┐     ┌──────────┐
│  User     │────▶│  Register    │────▶│  Choose   │────▶│  Set     │
│  Opens    │     │  Page        │     │  Role     │     │  Password│
│  /register│     │  (Step 1)    │     │           │     │  (Step 2)│
└──────────┘     └──────────────┘     └───────────┘     └──────────┘
                                                              │
                                                              ▼
                                                     ┌──────────────┐
                                                     │  Auto-Login   │
                                                     │  JWT Tokens   │
                                                     │  Redirect /   │
                                                     └──────────────┘
```

**Registration fields:** Full Name, Username (optional), Phone, Email (optional), City, Password
**Roles:** Customer, Supplier, Delivery Partner
**Login options:** Username/Phone/Email + Password, OR Phone + OTP (passwordless)
**Password Recovery:** Via phone number or email → OTP → Reset

### 2. Customer Journey

```
Browse Products ──▶ Add to Cart ──▶ Checkout ──▶ Track Order ──▶ Review
     │                                  │              │
     ▼                                  ▼              ▼
  AI Estimator                    Auto-split by    Real-time
  (calculate materials            supplier into    delivery
   for your build)                sub-orders       tracking
```

1. **Browse / Search** — Filter by category, city, price. Full-text search.
2. **AI Estimator** — Enter area + floors + structure type → get exact material quantities & costs.
3. **Add to Cart** — Select quantity, view from multiple suppliers.
4. **Checkout** — Address, delivery priority (standard/express/urgent). Auto-calculates:
   - Delivery fee (based on order value + priority)
   - Platform fee (3.5%)
   - Per-supplier sub-order splitting
5. **Track Order** — Status: Pending → Confirmed → Picked Up → In Transit → Delivered.
6. **Review** — Rate supplier and delivery partner (1-5 stars).

### 3. Supplier Journey

```
Register ──▶ Verify Business ──▶ List Products ──▶ Manage Orders ──▶ Analytics
    │               │                  │                 │
    ▼               ▼                  ▼                 ▼
 GST, PAN      Admin approves     Set prices,      View revenue,
 Address       verification       stock levels     ratings, orders
```

1. **Register as Supplier** — Provide business name, GST, PAN, address, delivery radius.
2. **Admin Verification** — Admin reviews and approves/rejects the supplier.
3. **List Products** — Add products with name, price, stock, specs, images.
4. **Manage Inventory** — Bulk update stock and prices. All changes logged with history.
5. **Receive Orders** — Orders auto-assigned from customer purchases.
6. **Manage Credit** — Apply for business credit (up to ₹1,00,000), make repayments.

### 4. Delivery Partner Journey

```
Register ──▶ Go Online ──▶ Accept Deliveries ──▶ Update Status ──▶ Complete
    │              │                │                   │
    ▼              ▼                ▼                   ▼
 Vehicle       Toggle          Pickup from          Mark delivered,
 details       availability   supplier             upload photo
```

1. **Register** — Vehicle type, number, capacity, license, service city.
2. **Toggle Availability** — Set online/offline status.
3. **Update Location** — Send GPS coordinates for real-time tracking.
4. **Manage Deliveries** — Update status: Picked Up → In Transit → Delivered. Record photos, weigh materials.

### 5. Admin Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
├──────────┬──────────┬──────────┬──────────┬────────┬────────┤
│Dashboard │  Users   │  Orders  │Suppliers │Products│Security│
│          │          │          │          │        │        │
│ KPIs     │ List all │ Filter   │ Pending  │ Stock  │ Rate   │
│ Revenue  │ Activate │ Status   │ Verify   │ OOS    │ Limits │
│ Charts   │ Roles    │ Override │ Revenue  │ Search │ Logs   │
└──────────┴──────────┴──────────┴──────────┴────────┴────────┘
```

- **Dashboard Tab** — Total users, suppliers, products, orders, GMV, revenue (24h/7d/30d).
- **Users Tab** — Search, filter by role, activate/deactivate accounts, change roles.
- **Orders Tab** — All orders, filter by status/date, override status, update payment.
- **Suppliers Tab** — Verify pending suppliers, view revenue per supplier.
- **Products Tab** — Monitor stock levels, find out-of-stock items.
- **Security Tab** — Rate limiting stats, active OTP count.

### 6. Credit System Flow

```
Apply ──▶ Auto-Approved ──▶ Use for Orders ──▶ Repay ──▶ Increase Limit
                │                                 │
                ▼                                 ▼
         Initial limit               Credit score
         up to ₹1,00,000            improves
```

### 7. OTP Authentication Flow

```
┌─────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│  Enter   │────▶│  Twilio   │────▶│  User    │────▶│  Verify  │
│  Phone   │     │  sends    │     │  gets    │     │  6-digit │
│  or Email│     │  SMS OTP  │     │  SMS     │     │  code    │
└─────────┘     └───────────┘     └──────────┘     └──────────┘
                     │
              No Twilio configured?
                     │
                     ▼
              ┌──────────────┐
              │  Dev Mode:   │
              │  OTP shown   │
              │  on screen   │
              └──────────────┘
```

---

## API Reference

**Base URL:** `http://localhost:8000`

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | App info & status |
| GET | `/health` | Health check |

### Authentication — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register new user (customer/supplier/delivery_partner) |
| POST | `/login` | — | Login with username/phone/email + password |
| POST | `/refresh-token` | — | Refresh access token |
| GET | `/me` | ✅ | Get current user profile |
| POST | `/otp/send` | — | Send OTP for passwordless login |
| POST | `/otp/verify` | — | Verify OTP and login |
| POST | `/forgot-password` | — | Send OTP for password reset (phone or email) |
| POST | `/reset-password` | — | Reset password with OTP |

### Products — `/api/v1/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | — | List all material categories |
| GET | `/` | — | List products (filters: category, city, price, sort) |
| GET | `/{product_id}` | — | Get product details |
| POST | `/` | ✅ Supplier | Create a product |
| PUT | `/{product_id}` | ✅ Owner | Update a product |
| DELETE | `/{product_id}` | ✅ Owner | Soft-delete a product |

### Orders — `/api/v1/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create order (auto-splits by supplier) |
| GET | `/` | ✅ | List user's orders |
| GET | `/{order_id}` | ✅ | Get order details |
| PUT | `/{order_id}/cancel` | ✅ | Cancel order (if pending/confirmed) |

### Suppliers — `/api/v1/suppliers`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List suppliers (filter by city, verified) |
| GET | `/{supplier_id}` | — | Get supplier details |
| POST | `/register` | ✅ | Register as supplier |
| PUT | `/{supplier_id}` | ✅ Owner | Update supplier info |
| PUT | `/{supplier_id}/inventory` | ✅ Owner | Bulk update stock & prices |

### Delivery — `/api/v1/deliveries`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/partners/register` | ✅ | Register as delivery partner |
| PUT | `/partners/availability` | ✅ | Toggle online/offline |
| PUT | `/partners/location` | ✅ | Update GPS coordinates |
| GET | `/active` | ✅ | Get active deliveries |
| PUT | `/{delivery_id}/status` | ✅ | Update delivery status |
| GET | `/{delivery_id}/tracking` | — | Real-time delivery tracking |

### Search — `/api/v1/search`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Full-text search (products + suppliers) |

### AI Estimator — `/api/v1/estimator`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/estimate` | — | Calculate material quantities & costs |
| POST | `/chat` | — | Chat with AI construction assistant |
| GET | `/rates` | — | Current material & labor rates |
| GET | `/structure-types` | — | Supported structure types |

### Reviews — `/api/v1/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Submit a review (1-5 stars) |
| GET | `/supplier/{supplier_id}` | — | Get supplier reviews |

### Prices — `/api/v1/prices`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/product/{product_id}` | — | Price history (7-365 days) |
| GET | `/trends` | — | Market-wide price trends |

### Credit — `/api/v1/credit`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/apply` | ✅ | Apply for business credit |
| GET | `/account` | ✅ | Get credit account details |
| GET | `/transactions` | ✅ | Credit transaction history |
| POST | `/repay` | ✅ | Make a credit repayment |
| POST | `/increase-limit` | ✅ | Request credit limit increase |

### Inventory — `/api/v1/inventory`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/logs` | ✅ | Inventory change logs |
| GET | `/price-history/{product_id}` | ✅ | Price change history |
| POST | `/update-stock` | ✅ Supplier/Admin | Update stock level |
| POST | `/update-price` | ✅ Supplier/Admin | Update product price |

### Admin — `/api/v1/admin` (Admin role required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Full analytics (users, revenue, orders, GMV) |
| GET | `/users` | List all users with filters |
| GET | `/users/{user_id}` | Detailed user info + stats |
| PUT | `/users/{user_id}/toggle-active` | Activate/deactivate user |
| PUT | `/users/{user_id}/role` | Change user role |
| GET | `/orders` | List all orders with filters |
| PUT | `/orders/{order_id}/status` | Override order status |
| PUT | `/orders/{order_id}/payment-status` | Update payment status |
| GET | `/suppliers` | List all suppliers with revenue |
| GET | `/suppliers/pending` | Pending verifications |
| PUT | `/suppliers/{supplier_id}/verify` | Approve/reject supplier |
| GET | `/products` | All products (stock monitoring) |
| GET | `/orders/overview` | Order analytics (N days) |
| GET | `/credit/overview` | Credit system stats |
| GET | `/deliveries` | Delivery operations overview |
| POST | `/create-admin` | Create a new admin user |

**Total: 57 API endpoints** across 12 resource routers.

---

## Security

### Middleware Stack (applied to every request)

| Layer | Protection |
|---|---|
| **SecurityHeadersMiddleware** | `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` (blocks camera/mic/geo/payment), strips `Server` header |
| **RateLimitMiddleware** | Auth endpoints: 10 req/60s per IP. General API: 120 req/60s per IP. Returns `429 Too Many Requests` with `Retry-After` header |
| **InputSanitizationMiddleware** | Blocks SQL injection (`UNION SELECT`, `DROP TABLE`, `' OR '1'='1'`) and XSS (`<script>`, `javascript:`, `onerror=`) in request bodies and query params |
| **CORSMiddleware** | Only allows configured origins (default: `localhost:3000`) |
| **TrustedHostMiddleware** | Only allows `localhost`, `127.0.0.1`, `*.nirmaan.co` |

### Authentication

- **JWT Tokens** — 30-minute access token, 7-day refresh token
- **Password Hashing** — bcrypt with salt
- **Password Strength** — Minimum 8 characters, 1 uppercase, 1 lowercase, 1 digit
- **Brute Force Protection** — 1-second delay on failed login attempts
- **OTP Security** — 6-digit codes, 5-minute expiry, max 3 attempts, 60-second cooldown between sends
- **Admin Protection** — Admin role cannot be self-assigned during registration
- **Anti-Enumeration** — Login/OTP/forgot-password return generic messages to prevent user enumeration

---

## Frontend Pages

| Route | Description | Auth Required |
|---|---|---|
| `/` | Homepage — hero, categories, featured products, testimonials | — |
| `/login` | Sign in (Password or OTP tab) | — |
| `/register` | 2-step registration wizard | — |
| `/forgot-password` | 4-step password reset (phone/email → OTP → new password → success) | — |
| `/products` | Product listing with filters & search | — |
| `/products/[id]` | Product detail page | — |
| `/cart` | Shopping cart | ✅ |
| `/checkout` | Order checkout | ✅ |
| `/orders` | Order history & tracking | ✅ |
| `/suppliers` | Supplier directory | — |
| `/supplier` | Supplier dashboard (manage products/orders) | ✅ Supplier |
| `/delivery` | Delivery partner dashboard | ✅ Delivery Partner |
| `/estimator` | AI material estimator | — |
| `/credit` | Business credit dashboard | ✅ |
| `/admin` | Admin panel (6-tab dashboard) | ✅ Admin |
| `/about` | About Nirmaan | — |
| `/contact` | Contact form | — |
| `/blog` | Construction blog | — |
| `/careers` | Job listings | — |
| `/help` | FAQ & help center | — |
| `/terms` | Terms of service | — |
| `/privacy` | Privacy policy | — |
| `/partner` | Partner with us | — |

---

## Deployment

### Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop
docker-compose down
```

### Manual Deployment

```bash
# Terminal 1: Start PostgreSQL
brew services start postgresql@17

# Terminal 2: Start Backend
cd backend && source venv/bin/activate
DATABASE_URL="postgresql+asyncpg://nirmaan:nirmaan@localhost:5433/nirmaan" \
SECRET_KEY="$(openssl rand -hex 32)" \
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 3: Start Frontend
cd frontend
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

### Production Checklist

- [ ] Generate a secure `SECRET_KEY`: `python3 -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Configure real Twilio credentials for SMS OTP
- [ ] Set `DEBUG=False` (disables Swagger docs)
- [ ] Restrict `CORS_ORIGINS` to your production domain
- [ ] Use HTTPS with proper SSL certificates
- [ ] Set up Redis for rate limiting persistence and Celery tasks
- [ ] Configure AWS S3 for image/file uploads
- [ ] Set up Razorpay for payment processing
- [ ] Use Alembic for database migrations instead of auto-create
- [ ] Set up monitoring and log aggregation

---

## License

Private — Nirmaan Marketplace © 2026

---

*Built with ❤️ for India's construction industry*
