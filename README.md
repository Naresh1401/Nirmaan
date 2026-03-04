# 🏗️ Nirmaan — Digital Infrastructure for Construction Material Supply

> *Digitizing construction procurement the way Amazon digitized retail, Swiggy digitized food delivery, and Uber digitized transportation.*

## Vision

Nirmaan is a **construction materials marketplace and logistics coordination platform** that digitizes procurement for contractors, builders, and home builders across India. We connect material suppliers, contractors, delivery partners, and construction customers on a single platform — solving fragmented supply chains, price opacity, logistics inefficiency, and unreliable delivery.

## Problem

India's **$800B+ construction industry** still relies on:
- Fragmented, unorganized suppliers with no digital presence
- Phone-based ordering with zero price transparency
- Unreliable delivery with no tracking
- No supplier discovery — builders rely on word-of-mouth
- Manual procurement management for large projects

## Solution

Nirmaan provides:
- **Material Marketplace** — Search, compare, and order construction materials
- **Logistics Coordination** — Integrated delivery with real-time tracking
- **Supplier Management** — Verified suppliers with ratings and quality scores
- **Smart Procurement** — AI-powered demand forecasting and price optimization
- **Project Management** — Bulk procurement tools for contractors

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL 15 |
| Cache | Redis |
| Realtime | WebSockets |
| Maps | Google Maps API |
| Payments | Razorpay |
| Deployment | Docker, AWS/GCP |
| CI/CD | GitHub Actions |

## Project Structure

```
NIRMAN/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routers/      # API endpoints
│   │   ├── services/     # Business logic
│   │   └── core/         # Config, security, database
│   ├── alembic/          # Database migrations
│   ├── tests/            # Backend tests
│   └── Dockerfile
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client, utilities
│   │   ├── hooks/        # Custom React hooks
│   │   └── types/        # TypeScript types
│   └── Dockerfile
├── docs/                 # Business & strategy docs
├── .github/workflows/    # CI/CD pipelines
├── docker-compose.yml    # Full stack orchestration
├── Makefile              # Development commands
└── DEPLOYMENT.md         # Deployment guide
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Naresh1401/Nirmaan.git
cd Nirmaan

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Documentation

| Document | Description |
|----------|-------------|
| [Business Model](docs/BUSINESS_MODEL.md) | Revenue streams, unit economics |
| [Growth Strategy](docs/GROWTH_STRATEGY.md) | 3-phase expansion plan |
| [Logistics Design](docs/LOGISTICS_DESIGN.md) | Delivery network architecture |
| [Supplier Onboarding](docs/SUPPLIER_ONBOARDING.md) | Onboarding playbook |
| [Investor Pitch](docs/INVESTOR_PITCH.md) | Pitch deck content |
| [Architecture](docs/ARCHITECTURE.md) | Technical architecture |
| [Deployment Guide](DEPLOYMENT.md) | End-to-end deployment |
| [Competitive Analysis](docs/COMPETITIVE_ANALYSIS.md) | Market positioning |

## Market Opportunity

- **TAM**: ₹12 lakh crore ($150B) — India construction materials market
- **SAM**: ₹2 lakh crore ($25B) — Tier 2/3 city procurement
- **SOM**: ₹2,000 crore ($250M) — First 5 years, Telangana + AP focus

## License

Proprietary — All rights reserved © 2026 Nirmaan
