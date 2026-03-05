# Nirmaan Admin Dashboard — Complete Technical Documentation

> **Version:** 2.0 &nbsp;|&nbsp; **Last Updated:** March 2026 &nbsp;|&nbsp; **Status:** Production-Ready

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [API Endpoints Specification](#2-api-endpoints-specification)
3. [Frontend Page Structure](#3-frontend-page-structure)
4. [Security Implementation](#4-security-implementation)
5. [Prediction Module Design](#5-prediction-module-design)
6. [Deployment Guidance](#6-deployment-guidance)
7. [Admin Panel Go-Live Security Checklist](#7-admin-panel-go-live-security-checklist)

---

## 1. Database Schema

### 1.1 New Admin Models

All admin models are defined in `backend/app/models/admin.py`.

#### `admin_profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | Auto-increment |
| user_id | Integer FK → users.id | Links to existing user |
| admin_role | Enum(AdminRoleType) | super_admin, ops_admin, supplier_admin, finance_admin, support_admin |
| custom_permissions | JSONB | Override permissions list |
| is_2fa_enabled | Boolean | Whether TOTP is active |
| failed_login_attempts | Integer | Brute-force counter |
| locked_until | DateTime | Account lock expiry |
| ip_allowlist | JSONB | Allowed IP addresses |
| created_at / updated_at | DateTime | Timestamps |

#### `totp_devices`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | |
| admin_profile_id | Integer FK → admin_profiles.id | |
| secret | String(64) | TOTP shared secret (encrypted at rest) |
| is_confirmed | Boolean | Whether user confirmed via code |
| created_at | DateTime | |

#### `backup_codes`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | |
| admin_profile_id | Integer FK → admin_profiles.id | |
| code_hash | String(128) | SHA-256 hash of backup code |
| is_used | Boolean | One-time flag |
| created_at | DateTime | |

#### `admin_sessions`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | |
| admin_profile_id | Integer FK → admin_profiles.id | |
| session_token | String(128) | Unique, indexed |
| ip_address | String(45) | Client IP |
| user_agent | Text | Browser/client UA |
| step_up_verified_at | DateTime | Re-auth for sensitive ops |
| expires_at | DateTime | Session TTL (24h default) |
| created_at | DateTime | |

#### `audit_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | |
| admin_user_id | Integer FK → users.id | Acting admin |
| action | String(100) | e.g. "update_order_status" |
| entity_type | String(50) | e.g. "order", "user" |
| entity_id | String(50) | Target entity ID |
| before_state | JSONB | Snapshot before change |
| after_state | JSONB | Snapshot after change |
| ip_address | String(45) | |
| reason | Text | Admin-provided justification |
| created_at | DateTime | Immutable timestamp |

#### `disputes`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | |
| order_id | Integer FK → orders.id | |
| raised_by_user_id | Integer FK → users.id | |
| assigned_admin_id | Integer FK (nullable) | |
| dispute_type | String(50) | quality, delivery, billing, other |
| status | String(20) | open, investigating, resolved, closed |
| priority | String(20) | critical, high, medium, low |
| description | Text | |
| resolution | Text (nullable) | |
| resolution_type | String(30) (nullable) | refund, replacement, credit, rejected |
| refund_amount | Float (nullable) | |
| evidence | JSONB | Uploaded file refs |
| created_at / updated_at | DateTime | |

#### `system_alerts`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | |
| alert_type | String(50) | inventory, security, system, business |
| severity | String(20) | critical, high, medium, low, info |
| title | String(200) | |
| message | Text | |
| is_read | Boolean | |
| is_resolved | Boolean | |
| created_at | DateTime | |

#### `forecast_results`
| Column | Type | Description |
|--------|------|-------------|
| id | Integer PK | |
| forecast_type | String(50) | revenue, demand, stockout, delivery_delay |
| entity_type | String(50) (nullable) | product, supplier |
| entity_id | String(50) (nullable) | |
| period_start / period_end | DateTime | Forecast window |
| predicted_value | Float | |
| lower_bound / upper_bound | Float | 95% confidence interval |
| model_name | String(50) | e.g. "trend_ema_blend" |
| model_version | String(20) | |
| metrics | JSONB | MAE, RMSE, etc. |
| created_at | DateTime | |

### 1.2 RBAC — Roles & Permissions

**5 Roles:**
| Role | Scopes |
|------|--------|
| `super_admin` | ALL scopes (30+) |
| `ops_admin` | orders.*, inventory.*, deliveries.*, products.*, suppliers.verify |
| `supplier_admin` | suppliers.*, products.*, inventory.* |
| `finance_admin` | payments.*, refunds.*, credit.*, analytics.revenue |
| `support_admin` | disputes.*, reviews.*, users.view, orders.view |

**30+ Permission Scopes:**
```
users.view, users.edit, users.suspend
orders.view, orders.edit, orders.refund
products.view, products.edit, products.delete
suppliers.view, suppliers.verify, suppliers.edit
inventory.view, inventory.adjust
deliveries.view, deliveries.assign
payments.view, payments.process, refunds.process
credit.view, credit.adjust
disputes.view, disputes.resolve, disputes.create
reviews.view, reviews.moderate
analytics.view, analytics.revenue, analytics.forecast
audit.view
alerts.view, alerts.manage
settings.view, settings.edit
admins.create, admins.edit
system.health
```

### 1.3 Entity Relationship Diagram

```
users (1) ──── (0..1) admin_profiles
admin_profiles (1) ──── (0..n) totp_devices
admin_profiles (1) ──── (0..n) backup_codes
admin_profiles (1) ──── (0..n) admin_sessions
users (1) ──── (0..n) audit_logs
orders (1) ──── (0..n) disputes
users (1) ──── (0..n) disputes (raised_by)
```

---

## 2. API Endpoints Specification

### 2.1 Admin Authentication (`/api/v1/admin/auth`)

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| POST | `/login` | None | — | Admin credentials login |
| POST | `/verify-2fa` | Partial | — | TOTP code verification |
| POST | `/verify-backup-code` | Partial | — | Backup code verification |
| POST | `/setup-2fa` | Full | — | Generate TOTP secret + QR |
| POST | `/confirm-2fa` | Full | — | Confirm TOTP setup |
| POST | `/regenerate-backup-codes` | Full | — | Generate new backup codes |
| POST | `/step-up-verify` | Full | — | Re-auth for sensitive ops |
| GET | `/sessions` | Full | — | List active sessions |
| DELETE | `/sessions/{id}` | Full | — | Revoke a session |
| GET | `/me` | Full | — | Current admin profile |
| POST | `/create-admin` | Full | admins.create | Promote user to admin |
| PUT | `/admins/{user_id}/profile` | Full | admins.edit | Update admin profile/role |
| POST | `/logout` | Full | — | Invalidate session |

**Login Flow:**
1. `POST /login` → Returns `{ requires_2fa: true, temp_token: "..." }` or `{ access_token, admin }`.
2. If 2FA required: `POST /verify-2fa` with `{ temp_token, totp_code }` → Returns `{ access_token, admin }`.
3. If TOTP device lost: `POST /verify-backup-code` with `{ temp_token, backup_code }`.

### 2.2 Admin Dashboard (`/api/v1/admin/v2`)

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| **Dashboard** | | | |
| GET | `/dashboard` | — | Full KPI summary |
| GET | `/recommendations` | analytics.view | AI-generated action items |
| **Users** | | | |
| GET | `/users` | users.view | List/search users (paginated) |
| GET | `/users/{id}` | users.view | User detail + recent orders |
| PUT | `/users/{id}/toggle-active` | users.suspend | Activate/deactivate user |
| PUT | `/users/{id}/role` | users.edit | Change user role |
| **Orders** | | | |
| GET | `/orders` | orders.view | List/filter orders |
| GET | `/orders/{id}` | orders.view | Order detail + timeline |
| PUT | `/orders/{id}/status` | orders.edit | Update order status |
| GET | `/orders/overview` | orders.view | Status distribution stats |
| POST | `/orders/{id}/refund` | orders.refund | Process refund (step-up 2FA) |
| **Suppliers** | | | |
| GET | `/suppliers` | suppliers.view | List all suppliers |
| GET | `/suppliers/pending` | suppliers.verify | Pending KYC verification |
| PUT | `/suppliers/{id}/verify` | suppliers.verify | Approve/reject supplier |
| **Products** | | | |
| GET | `/products` | products.view | List products (paginated) |
| PUT | `/products/{id}` | products.edit | Update product + price history |
| **Inventory** | | | |
| GET | `/inventory/low-stock` | inventory.view | Below-threshold products |
| PUT | `/inventory/{product_id}/adjust` | inventory.adjust | Adjust quantity + audit |
| **Deliveries** | | | |
| GET | `/deliveries` | deliveries.view | List deliveries |
| GET | `/deliveries/partners` | deliveries.view | Delivery partner summary |
| PUT | `/deliveries/{id}/assign` | deliveries.assign | Assign delivery partner |
| **Disputes** | | | |
| GET | `/disputes` | disputes.view | List/filter disputes |
| POST | `/disputes` | disputes.create | Create dispute |
| PUT | `/disputes/{id}/resolve` | disputes.resolve | Resolve with type + refund |
| **Reviews** | | | |
| GET | `/reviews` | reviews.view | List reviews (rating filter) |
| **Payments** | | | |
| GET | `/payments/overview` | payments.view | Revenue + payment stats |
| GET | `/credit/overview` | credit.view | Credit system summary |
| **Analytics** | | | |
| GET | `/analytics/revenue-trend` | analytics.revenue | Daily revenue series |
| GET | `/analytics/top-products` | analytics.view | Top products by revenue |
| GET | `/analytics/top-suppliers` | analytics.view | Top suppliers by revenue |
| GET | `/analytics/customers` | analytics.view | Customer insights |
| **Predictions** | | | |
| GET | `/predictions/revenue` | analytics.forecast | Revenue forecast |
| GET | `/predictions/demand/{product_id}` | analytics.forecast | Product demand forecast |
| GET | `/predictions/stockouts` | analytics.forecast | Stockout predictions |
| GET | `/predictions/delivery-delays` | analytics.forecast | Delivery delay risks |
| **System** | | | |
| GET | `/audit-logs` | audit.view | Query audit trail |
| GET | `/alerts` | alerts.view | System alerts |
| PUT | `/alerts/{id}/read` | alerts.manage | Mark alert as read |
| GET | `/system/health` | system.health | DB + service health check |

### 2.3 Response Format

All endpoints return JSON. Paginated endpoints use:
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 20
}
```

Error responses:
```json
{
  "detail": "Error message describing what went wrong"
}
```

HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden/no permission), 404 (not found), 423 (account locked), 429 (rate limited).

---

## 3. Frontend Page Structure

### 3.1 Route Map (`/admin/*`)

```
/admin/
├── login/          → 3-step login (credentials → TOTP → backup code)
├── page.tsx        → Dashboard KPIs, recommendations, status distribution
├── layout.tsx      → AdminProvider context, Sidebar, TopBar, AdminShell
├── users/          → User list/search, detail modal, suspend/role change
├── orders/         → Order list/filter, detail modal, status update, timeline
├── suppliers/      → All suppliers table + Pending KYC tab with verify/reject
├── products/       → Product list, activate/deactivate, stock indicators
├── inventory/      → Stockout predictions, low-stock table, adjustment modal
├── deliveries/     → 3 tabs: deliveries, partners, delay risk analytics
├── payments/       → Revenue card, payment grid, credit overview
├── disputes/       → Dispute list, resolve modal with type/refund
├── reviews/        → Rating distribution, review table, detail modal
├── analytics/      → 4 tabs: revenue trend, products/suppliers, customers, forecast
├── security/       → 4 tabs: audit logs, system alerts, health, sessions
└── settings/       → 3 tabs: profile, 2FA setup, create admin
```

### 3.2 Component Architecture

**AdminProvider** (React Context):
- Stores: `admin` object, `token`, `isAuthenticated`
- Exposes: `login()`, `logout()`, `hasPermission(scope)`, `adminFetch(url, options)` (auto-injects Bearer token, auto-logout on 401)

**AdminShell** (Layout wrapper):
- Auto-redirects to `/admin/login` if unauthenticated
- Renders Sidebar + TopBar + page content

**Sidebar** (13 nav items):
- Permission-gated visibility per role
- Collapsible with icon-only mode
- Active route highlighting
- Role badge display

### 3.3 Design System

- **Framework:** Pure TailwindCSS (no component library)
- **Color palette:** Orange-500/600 primary, Gray-50–900 neutrals
- **Cards:** `bg-white rounded-xl border border-gray-200`
- **Tables:** Sticky headers, hover rows, pagination
- **Modals:** `fixed inset-0 bg-black/50` overlay + centered card
- **Badges:** Rounded-full colored pills per status
- **Charts:** CSS-based bar charts with hover tooltips
- **Icons:** Lucide React

---

## 4. Security Implementation

### 4.1 Authentication

| Feature | Implementation |
|---------|----------------|
| Password hashing | bcrypt (12 rounds) |
| JWT tokens | HS256, 30-min access, 7-day refresh |
| Admin tokens | Separate `nirmaan_admin_token` / `nirmaan_admin_user` in localStorage |
| Session management | Server-side sessions in `admin_sessions` table, 24h TTL |
| 2FA | TOTP (RFC 6238) via pyotp, ±1 window tolerance |
| Backup codes | 10 codes per admin, SHA-256 hashed, single-use |

### 4.2 Brute Force Protection

```
Attempt 1-2: No delay
Attempt 3: 1 minute lockout
Attempt 4: 5 minutes
Attempt 5: 15 minutes
Attempt 6-9: 1 hour
Attempt 10+: 30-minute hard lock
```

- Counter resets on successful login
- `failed_login_attempts` tracked per admin profile
- `locked_until` checked on every login attempt

### 4.3 RBAC Enforcement

Every dashboard endpoint checks permissions via `require_permission(scope)` dependency:

```python
@router.get("/orders")
async def list_orders(
    admin = Depends(require_permission(PermissionScope.ORDERS_VIEW))
):
    ...
```

Permission resolution:
1. Check `admin_profile.admin_role` against `ROLE_PERMISSIONS` mapping
2. Check `admin_profile.custom_permissions` overrides
3. `super_admin` has all permissions

### 4.4 Step-Up Authentication

Sensitive operations (refunds, role changes) require re-authentication:
1. Client calls `POST /step-up-verify` with TOTP code
2. Server updates `admin_sessions.step_up_verified_at`
3. Step-up expires after 15 minutes
4. Sensitive endpoints check `step_up_verified_at` timestamp

### 4.5 Audit Trail

Every admin mutation creates an immutable `AuditLog` entry:
- Before/after state snapshots (JSONB diff)
- Admin user ID, IP address, timestamp
- Free-text reason field for accountability

### 4.6 IP Allowlisting

Optional per-admin IP restriction:
- `admin_profiles.ip_allowlist` (JSONB array)
- Checked on every authenticated request
- Empty list = allow all (disabled)

### 4.7 Frontend Security

- Admin context auto-logout on 401 responses
- Sidebar items hidden when permission not granted
- Token stored separately from consumer auth
- No admin routes accessible without valid session

---

## 5. Prediction Module Design

### 5.1 Architecture

File: `backend/app/services/analytics.py`

All predictions use in-database statistical models (no external ML dependencies):

```
Historical Data (SQL) → Statistical Models → Confidence Intervals → API Response
```

### 5.2 Statistical Models

| Model | Formula | Use Case |
|-------|---------|----------|
| Simple Moving Average | SMA(n) = Σ(x_i) / n | Baseline smoothing |
| Exponential Moving Average | EMA_t = α·x_t + (1-α)·EMA_{t-1} | Trend-following |
| Linear Trend | y = mx + b (least squares regression) | Trend projection |
| Trend+EMA Blend | 0.6·Linear + 0.4·EMA | Final prediction |

### 5.3 Confidence Intervals

95% confidence bounds using residual standard deviation:

```
σ = sqrt(Σ(actual_i - predicted_i)² / n)
Upper = predicted + 1.96 · σ · sqrt(1 + 1/n)
Lower = predicted - 1.96 · σ · sqrt(1 + 1/n)
```

### 5.4 Forecast Functions

| Function | Input | Output |
|----------|-------|--------|
| `forecast_revenue(db, days)` | Daily revenue history | Per-day predicted revenue with CI |
| `forecast_product_demand(db, product_id, days)` | Order line items | Per-day predicted units with CI |
| `predict_stockouts(db)` | Current stock vs daily consumption | Days-until-stockout, risk level, reorder qty |
| `predict_delivery_delays(db)` | Delivery timestamps | On-time rate, avg delay, at-risk deliveries |
| `customer_insights(db)` | Order history | Top customers, repeat rate, segmentation |
| `generate_recommendations(db)` | Multiple sources | Actionable alerts across all modules |

### 5.5 Stockout Risk Levels

| Level | Days Until Stockout |
|-------|---------------------|
| Critical | ≤ 3 days |
| High | 4–7 days |
| Medium | 8–14 days |

Recommended reorder quantity: `daily_consumption × 30` (1-month safety stock).

### 5.6 Recommendations Engine

Generates actionable items from:
- Low stock products → "Reorder X units of Product Y"
- Pending supplier KYC → "N suppliers awaiting verification"
- Stale orders (>3 days in confirmed) → "N orders need attention"
- Revenue trend → "Revenue up/down X% vs previous period"
- Unread system alerts → "N alerts need attention"

---

## 6. Deployment Guidance

### 6.1 Prerequisites

| Component | Requirement |
|-----------|-------------|
| Python | 3.11+ |
| Node.js | 18+ |
| PostgreSQL | 15+ (project uses 17) |
| OS | Linux/macOS (production: Ubuntu 22.04 LTS) |

### 6.2 Environment Variables

```env
# Backend
DATABASE_URL=postgresql+asyncpg://nirmaan:STRONG_PASSWORD@localhost:5433/nirmaan
SECRET_KEY=<random-256-bit-hex>
ADMIN_JWT_EXPIRY_MINUTES=30
SESSION_TTL_HOURS=24
CORS_ORIGINS=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 6.3 Database Migration

Tables auto-create via SQLAlchemy `metadata.create_all()` in the FastAPI lifespan handler. For production, use Alembic:

```bash
# Generate migration
alembic revision --autogenerate -m "add admin tables"

# Apply
alembic upgrade head
```

### 6.4 First Admin Setup

```sql
-- 1. Ensure a user exists with is_admin=true
UPDATE users SET is_admin = true WHERE username = 'admin';

-- 2. The admin_profiles record is auto-created on first login
-- 3. The first admin gets super_admin role by default
```

### 6.5 Production Deployment

```bash
# Backend (systemd or Docker)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 --timeout 120

# Frontend
npm run build && npm start

# Reverse proxy (Nginx)
server {
    listen 443 ssl;
    server_name admin.nirmaan.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### 6.6 Backup & Recovery

```bash
# Daily database backup
pg_dump -U nirmaan -h localhost -p 5433 nirmaan | gzip > backup_$(date +%F).sql.gz

# Restore
gunzip -c backup_2026-03-04.sql.gz | psql -U nirmaan -h localhost -p 5433 nirmaan
```

---

## 7. Admin Panel Go-Live Security Checklist

### Pre-Launch (Must Complete)

- [ ] **Secrets & Keys**
  - [ ] Generate cryptographically random `SECRET_KEY` (min 256-bit)
  - [ ] Rotate all default/dev passwords
  - [ ] Store secrets in environment variables or vault (never in code)
  - [ ] Remove all hardcoded credentials from codebase

- [ ] **Authentication**
  - [ ] Enforce 2FA for all admin accounts
  - [ ] Verify brute-force protection is active (test lockout after 5 attempts)
  - [ ] Confirm session expiry (24h) is enforced
  - [ ] Test backup code flow (generate, use, exhaust)
  - [ ] Verify logout invalidates server-side session

- [ ] **Authorization**
  - [ ] Test RBAC: each role can ONLY access permitted endpoints
  - [ ] Verify `super_admin` is limited to trusted personnel
  - [ ] Test step-up auth for refunds and role changes
  - [ ] Confirm custom_permissions override works correctly

- [ ] **Network & Transport**
  - [ ] Enable HTTPS (TLS 1.2+) on all endpoints
  - [ ] Redirect HTTP → HTTPS
  - [ ] Set HSTS header (`Strict-Transport-Security: max-age=31536000`)
  - [ ] Configure CORS to allow only your domain(s)
  - [ ] Set `Secure`, `HttpOnly`, `SameSite=Strict` on any cookies

- [ ] **Database Security**
  - [ ] Use a dedicated DB user with minimal privileges
  - [ ] Enable SSL for database connections
  - [ ] Run database on a private network (no public IP)
  - [ ] Verify all JSONB fields are parameterized (no SQL injection)

- [ ] **Input Validation**
  - [ ] All inputs validated via Pydantic schemas
  - [ ] File uploads restricted by type and size
  - [ ] Rate limiting on login endpoint (5 req/min per IP)
  - [ ] XSS prevention (React auto-escapes, no dangerouslySetInnerHTML)

### Audit & Monitoring

- [ ] **Logging**
  - [ ] Audit log captures ALL admin mutations
  - [ ] Logs include: timestamp, admin ID, action, entity, IP, before/after state
  - [ ] Audit logs are immutable (no UPDATE/DELETE)
  - [ ] Application logs don't contain sensitive data (passwords, tokens)

- [ ] **Monitoring**
  - [ ] Set up health check endpoint monitoring
  - [ ] Alert on: failed login spikes, account lockouts, error rate > 1%
  - [ ] Monitor disk space for log rotation
  - [ ] Set up uptime monitoring (external)

### Operational Readiness

- [ ] **Backup**
  - [ ] Automated daily database backups configured
  - [ ] Backup restoration tested and documented
  - [ ] Backups stored in a separate location/region

- [ ] **Access Control**
  - [ ] Document all admin accounts and their roles
  - [ ] Minimum 2 super_admins (bus factor)
  - [ ] IP allowlisting configured for super_admins
  - [ ] Admin creation requires super_admin approval

- [ ] **Incident Response**
  - [ ] Document procedure for: compromised admin account
  - [ ] Document procedure for: data breach notification
  - [ ] Emergency session revocation tested (`DELETE /sessions/{id}`)
  - [ ] Know how to lock all admin accounts quickly

### Post-Launch

- [ ] **Regular Reviews**
  - [ ] Weekly audit log review
  - [ ] Monthly access review (revoke unused accounts)
  - [ ] Quarterly password rotation
  - [ ] Semi-annual penetration test

- [ ] **Updates**
  - [ ] Monitor CVEs for: FastAPI, SQLAlchemy, Next.js, pyotp
  - [ ] Keep dependencies updated (Dependabot/Renovate)
  - [ ] Test updates in staging before production

---

## File Reference

| File | Purpose |
|------|---------|
| `backend/app/models/admin.py` | 8 SQLAlchemy models + RBAC enums |
| `backend/app/schemas/admin.py` | 20+ Pydantic request/response schemas |
| `backend/app/services/admin_security.py` | Brute force, TOTP, sessions, audit, IP |
| `backend/app/services/analytics.py` | Prediction engine (6 forecast functions) |
| `backend/app/routers/admin_auth.py` | Auth router (15 endpoints, 2FA flow) |
| `backend/app/routers/admin_dashboard.py` | Dashboard API (40+ CRUD endpoints) |
| `frontend/src/app/admin/layout.tsx` | AdminProvider, Sidebar, TopBar |
| `frontend/src/app/admin/login/page.tsx` | 3-step admin login |
| `frontend/src/app/admin/page.tsx` | Dashboard (KPIs, recommendations) |
| `frontend/src/app/admin/users/page.tsx` | User management |
| `frontend/src/app/admin/orders/page.tsx` | Order management |
| `frontend/src/app/admin/suppliers/page.tsx` | Supplier management + KYC |
| `frontend/src/app/admin/products/page.tsx` | Product management |
| `frontend/src/app/admin/inventory/page.tsx` | Inventory + stockout predictions |
| `frontend/src/app/admin/deliveries/page.tsx` | Deliveries + delay analytics |
| `frontend/src/app/admin/payments/page.tsx` | Payments + credit overview |
| `frontend/src/app/admin/disputes/page.tsx` | Dispute resolution |
| `frontend/src/app/admin/reviews/page.tsx` | Review moderation |
| `frontend/src/app/admin/analytics/page.tsx` | Analytics + forecasts (4 tabs) |
| `frontend/src/app/admin/security/page.tsx` | Audit logs, alerts, health, sessions |
| `frontend/src/app/admin/settings/page.tsx` | Profile, 2FA setup, admin creation |

---

*Built with FastAPI + Next.js + PostgreSQL. Pure TailwindCSS frontend. No external ML dependencies.*
