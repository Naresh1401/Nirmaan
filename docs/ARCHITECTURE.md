# Technical Architecture — Nirmaan

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENTS                               │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │ Web App  │  │ Mobile   │  │ Supplier Dashboard    │  │
│  │ (Next.js)│  │ (React   │  │ (Next.js)             │  │
│  │          │  │  Native) │  │                       │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬────────────┘  │
└───────┼──────────────┼───────────────────┼───────────────┘
        │              │                   │
        ▼              ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│                   API GATEWAY / LOAD BALANCER             │
│                      (Nginx / AWS ALB)                    │
└──────────────────────────┬───────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Auth       │  │  Core API    │  │  Logistics   │
│   Service    │  │  (FastAPI)   │  │  Service     │
│              │  │              │  │  (FastAPI)   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────────────────────────────────────────────────┐
│                    DATA LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ PostgreSQL │  │   Redis    │  │  S3 / CloudStorage │ │
│  │ (Primary)  │  │  (Cache +  │  │  (Images, Docs)    │ │
│  │            │  │  Sessions) │  │                    │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Technology Stack Details

### Frontend

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with SSR, app router |
| **TypeScript** | Type safety across all frontend code |
| **TailwindCSS** | Utility-first CSS framework |
| **Zustand** | Lightweight state management |
| **React Query** | Server state management, caching |
| **Socket.io Client** | Real-time order tracking |
| **Google Maps JS API** | Delivery tracking, supplier maps |
| **next-intl** | i18n (Telugu, Hindi, English) |

### Backend

| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance Python API framework |
| **SQLAlchemy 2.0** | ORM with async support |
| **Alembic** | Database migrations |
| **Pydantic v2** | Data validation and serialization |
| **Celery + Redis** | Background task processing |
| **WebSockets** | Real-time notifications and tracking |
| **python-jose** | JWT token handling |
| **Passlib + bcrypt** | Password hashing |

### Database

| Technology | Purpose |
|-----------|---------|
| **PostgreSQL 15** | Primary relational database |
| **PostGIS** | Geospatial queries (supplier/driver locations) |
| **Redis** | Caching, session storage, rate limiting |
| **S3-compatible** | File storage (product images, documents) |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local development orchestration |
| **GitHub Actions** | CI/CD pipeline |
| **AWS EC2 / GCP Compute** | Application hosting |
| **AWS RDS / Cloud SQL** | Managed PostgreSQL |
| **AWS ElastiCache** | Managed Redis |
| **CloudFront / CDN** | Static asset delivery |
| **Razorpay** | Payment processing |

---

## Database Schema (Core Tables)

```
users
├── id (UUID, PK)
├── email (unique)
├── phone (unique)
├── password_hash
├── full_name
├── role (CUSTOMER | SUPPLIER | DRIVER | ADMIN)
├── is_verified
├── avatar_url
├── created_at
└── updated_at

suppliers
├── id (UUID, PK)
├── user_id (FK → users)
├── business_name
├── gst_number
├── pan_number
├── address
├── city
├── state
├── pincode
├── latitude
├── longitude
├── is_verified
├── rating (decimal)
├── total_orders
├── subscription_tier (FREE | SILVER | GOLD | ENTERPRISE)
└── created_at

categories
├── id (UUID, PK)
├── name
├── slug
├── icon_url
├── parent_id (FK → categories, nullable)
└── sort_order

products
├── id (UUID, PK)
├── supplier_id (FK → suppliers)
├── category_id (FK → categories)
├── name
├── description
├── unit (KG | BAG | PIECE | CUBIC_FT | TON | LOAD)
├── price (decimal)
├── mrp (decimal)
├── stock_quantity (integer)
├── min_order_quantity (integer)
├── images (JSONB)
├── specifications (JSONB)
├── is_active
└── created_at

orders
├── id (UUID, PK)
├── order_number (unique, e.g., NRM-2026-00001)
├── customer_id (FK → users)
├── status (PENDING | CONFIRMED | PROCESSING | IN_TRANSIT | DELIVERED | CANCELLED)
├── delivery_address
├── delivery_lat
├── delivery_lng
├── subtotal (decimal)
├── delivery_fee (decimal)
├── platform_fee (decimal)
├── total_amount (decimal)
├── payment_status (PENDING | PAID | REFUNDED)
├── payment_method
├── notes
├── scheduled_date
├── priority (STANDARD | EXPRESS | URGENT)
├── created_at
└── updated_at

order_items
├── id (UUID, PK)
├── order_id (FK → orders)
├── product_id (FK → products)
├── supplier_id (FK → suppliers)
├── quantity
├── unit_price (decimal)
├── total_price (decimal)
├── status (PENDING | CONFIRMED | PICKED_UP | DELIVERED)
└── sub_order_number

delivery_partners
├── id (UUID, PK)
├── user_id (FK → users)
├── vehicle_type (AUTO | MINI_TRUCK | LCV | TRUCK | TRACTOR | TIPPER | FLATBED)
├── vehicle_number
├── license_number
├── is_available
├── current_lat
├── current_lng
├── rating (decimal)
├── total_deliveries
├── completion_rate (decimal)
└── created_at

deliveries
├── id (UUID, PK)
├── order_id (FK → orders)
├── partner_id (FK → delivery_partners)
├── status (ASSIGNED | PICKUP | IN_TRANSIT | DELIVERED)
├── pickup_locations (JSONB)
├── delivery_location (JSONB)
├── estimated_pickup_time
├── estimated_delivery_time
├── actual_pickup_time
├── actual_delivery_time
├── pickup_photo_url
├── delivery_photo_url
├── weight_at_pickup (decimal)
├── distance_km (decimal)
├── delivery_fee (decimal)
└── created_at

reviews
├── id (UUID, PK)
├── order_id (FK → orders)
├── reviewer_id (FK → users)
├── supplier_id (FK → suppliers, nullable)
├── partner_id (FK → delivery_partners, nullable)
├── rating (integer, 1-5)
├── comment
└── created_at
```

---

## API Design (Key Endpoints)

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/refresh-token
```

### Products & Search
```
GET    /api/v1/products                    # List/search products
GET    /api/v1/products/{id}               # Product details
GET    /api/v1/categories                  # Material categories
GET    /api/v1/search?q=cement&city=peddapalli  # Full-text search
```

### Suppliers
```
GET    /api/v1/suppliers                   # List suppliers
GET    /api/v1/suppliers/{id}              # Supplier profile
GET    /api/v1/suppliers/{id}/products     # Supplier's products
POST   /api/v1/suppliers/register          # Supplier registration
PUT    /api/v1/suppliers/{id}/inventory    # Update stock
```

### Orders
```
POST   /api/v1/orders                      # Create order
GET    /api/v1/orders                      # List user's orders
GET    /api/v1/orders/{id}                 # Order details
PUT    /api/v1/orders/{id}/cancel          # Cancel order
GET    /api/v1/orders/{id}/tracking        # Real-time tracking
```

### Delivery
```
GET    /api/v1/deliveries/active           # Driver's active deliveries
PUT    /api/v1/deliveries/{id}/status      # Update delivery status
PUT    /api/v1/deliveries/{id}/location    # Update driver location
POST   /api/v1/deliveries/{id}/proof       # Upload delivery proof
```

### Admin
```
GET    /api/v1/admin/dashboard             # Platform analytics
GET    /api/v1/admin/suppliers/pending     # Pending verifications
PUT    /api/v1/admin/suppliers/{id}/verify # Verify supplier
GET    /api/v1/admin/orders/overview       # Order analytics
```

---

## Data & AI Opportunities

### 1. Material Demand Forecasting
- Predict demand by material, city, and season
- Input: historical orders, weather, construction permits, festivals
- Model: Time-series (Prophet / LSTM)
- Use: Help suppliers stock appropriately

### 2. Dynamic Pricing Intelligence
- Track price trends across suppliers
- Alert customers to price drops
- Suggest optimal purchase timing
- Model: Regression + market signals

### 3. Smart Material Estimation
- Input: building plan (sq ft, floors, type)
- Output: complete bill of materials with quantities
- Use: Help customers know exactly what to order
- Model: Rule-based initially, ML-enhanced later

### 4. Logistics Optimization
- Route optimization for multi-pickup deliveries
- Driver-order matching with ML scoring
- Delivery time prediction
- Fleet demand forecasting

### 5. Supplier Scoring
- Predict supplier reliability
- Auto-detect quality issues from reviews
- Recommend best suppliers per material
- Fraud detection
