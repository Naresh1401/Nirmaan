# Deployment Guide – Nirmaan Platform

> End-to-end guide: local development → staging → production

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Docker Deployment](#docker-deployment)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Cloud Deployment (AWS)](#cloud-deployment-aws)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | `brew install python@3.11` |
| Node.js | 18+ | `brew install node@18` |
| Docker | 24+ | [docker.com](https://docker.com) |
| Docker Compose | 2.20+ | Included with Docker Desktop |
| PostgreSQL | 15+ | `brew install postgresql@15` (optional, Docker preferred) |
| Redis | 7+ | `brew install redis` (optional, Docker preferred) |
| Git | 2.40+ | `brew install git` |
| GitHub CLI | 2.0+ | `brew install gh` |

---

## 2. Local Development Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/Naresh1401/Nirmaan.git
cd Nirmaan
```

### Step 2: Copy environment file

```bash
cp .env.example .env
# Edit .env with your actual values
```

### Step 3: One-command setup

```bash
make setup
```

This will:
- Copy `.env.example` → `.env`
- Build Docker images
- Start PostgreSQL and Redis
- Wait for services to be healthy

---

## 3. Environment Configuration

Edit `.env` and set these critical values:

```env
# Security (CHANGE THESE!)
SECRET_KEY=your-random-64-char-string
ADMIN_EMAIL=admin@nirmaan.co.in

# Database
DATABASE_URL=postgresql+asyncpg://nirmaan:nirmaan@localhost:5432/nirmaan
REDIS_URL=redis://localhost:6379/0

# External APIs (get keys from respective dashboards)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
GOOGLE_MAPS_API_KEY=AIzaSyxxxxx
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_S3_BUCKET=nirmaan-uploads
```

### Generate a secure SECRET_KEY:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## 4. Database Setup

### With Docker (recommended):

Database starts automatically with `docker compose up`.

### Run migrations:

```bash
make db-migrate
# or manually:
cd backend && alembic upgrade head
```

### Seed initial data:

```bash
cd backend && python -m app.seeds.initial
```

### Useful database commands:

```bash
make db-shell      # Open psql
make db-reset      # Wipe and recreate (DESTRUCTIVE)
make db-rollback   # Undo last migration
```

---

## 5. Running the Application

### Option A: Docker (recommended)

```bash
# Start everything
make dev

# Start in background
make dev-bg

# Check status
make status

# View logs
make logs
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

### Option B: Run locally (without Docker)

**Terminal 1 – Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm install
npm run dev
```

> Make sure PostgreSQL and Redis are running locally or via Docker.

---

## 6. Testing

### Backend tests:

```bash
make backend-test

# With coverage
cd backend && pytest tests/ -v --cov=app --cov-report=html
```

### Frontend tests:

```bash
cd frontend && npm test
```

### Lint everything:

```bash
make backend-lint
make frontend-lint
```

---

## 7. Docker Deployment

### Build production images:

```bash
docker compose build
```

### Architecture:

```
                    ┌─────────────────┐
                    │   Nginx/Caddy   │ ← Reverse proxy + SSL
                    │   (port 80/443) │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐       ┌──────────▼──────────┐
    │    Frontend        │       │     Backend          │
    │    (Next.js)       │       │     (FastAPI)        │
    │    port 3000       │       │     port 8000        │
    └───────────────────┘       └──────────┬──────────┘
                                           │
                              ┌────────────┴────────────┐
                              │                         │
                    ┌─────────▼──────┐       ┌─────────▼──────┐
                    │  PostgreSQL    │       │     Redis       │
                    │  port 5432    │       │   port 6379     │
                    └───────────────┘       └────────────────┘
```

### Docker Compose commands:

```bash
docker compose up -d          # Start all
docker compose ps             # Check status
docker compose logs -f        # Stream logs
docker compose down           # Stop all
docker compose down -v        # Stop + delete volumes (DESTRUCTIVE)
```

---

## 8. CI/CD Pipeline

### GitHub Actions workflow (`.github/workflows/ci.yml`):

The pipeline runs automatically on:
- **Push** to `main` or `develop`
- **Pull requests** to `main`

### Pipeline stages:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Backend     │     │  Frontend    │     │  Docker      │
│  Tests       │     │  Build       │     │  Build       │
│              │     │              │     │              │
│ • Lint       │     │ • Type check │     │ • Build      │
│ • Unit tests │     │ • Lint       │     │   images     │
│ • Postgres   │     │ • Build      │     │ • Push to    │
│   integration│     │              │     │   registry   │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │                    ▲
       └────────────────────┴────────────────────┘
                   (must pass first)
```

### Merging workflow:

```bash
# Create feature branch
git checkout -b feature/add-payment

# Make changes, commit
git add .
git commit -m "feat: add Razorpay payment integration"

# Push & create PR
git push origin feature/add-payment
gh pr create --title "Add payment integration" --body "Adds Razorpay..."

# CI runs automatically. After approval:
gh pr merge
```

---

## 9. Cloud Deployment (AWS)

### Recommended Architecture:

| Component | AWS Service | Cost (est.) |
|-----------|------------|-------------|
| Frontend | Vercel or S3 + CloudFront | Free–$20/mo |
| Backend | EC2 t3.small or ECS Fargate | $15–$50/mo |
| Database | RDS PostgreSQL (db.t3.micro) | $15/mo |
| Cache | ElastiCache Redis (t3.micro) | $12/mo |
| Storage | S3 | $1–$5/mo |
| Domain | Route 53 | $12/yr |
| SSL | ACM (free) | Free |
| **Total** | | **~$55–$100/mo** |

### Step-by-step AWS deployment:

#### 9.1 – Set up EC2 instance

```bash
# Launch Ubuntu 22.04 t3.small instance
# Security group: allow ports 22, 80, 443

# SSH in
ssh -i nirmaan-key.pem ubuntu@<EC2-IP>

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin
```

#### 9.2 – Deploy application

```bash
# Clone repo on server
git clone https://github.com/Naresh1401/Nirmaan.git
cd Nirmaan

# Set environment
cp .env.example .env
nano .env  # Set production values

# Start services
docker compose up -d

# Verify
docker compose ps
curl http://localhost:8000/health
```

#### 9.3 – Set up Nginx reverse proxy

```bash
sudo apt install nginx certbot python3-certbot-nginx

sudo tee /etc/nginx/sites-available/nirmaan << 'EOF'
server {
    server_name nirmaan.co.in www.nirmaan.co.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /docs {
        proxy_pass http://localhost:8000/docs;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/nirmaan /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL certificate
sudo certbot --nginx -d nirmaan.co.in -d www.nirmaan.co.in
```

#### 9.4 – Set up RDS (managed database)

```bash
# Create RDS instance via AWS Console:
# Engine: PostgreSQL 15
# Instance: db.t3.micro
# Storage: 20GB gp3
# Make publicly accessible: No (same VPC as EC2)

# Update .env with RDS endpoint:
DATABASE_URL=postgresql+asyncpg://nirmaan:<password>@<rds-endpoint>:5432/nirmaan
```

#### 9.5 – Set up S3 for file uploads

```bash
# Create S3 bucket: nirmaan-uploads
# Enable CORS on the bucket
# Create IAM user with S3 access
# Update .env with credentials
```

---

## 10. Monitoring & Maintenance

### Health checks:

```bash
# Quick health check
make health

# Detailed check
curl http://localhost:8000/health | python3 -m json.tool
```

### Log management:

```bash
# View all logs
make logs

# Backend only
make logs-backend

# Search for errors
docker compose logs backend 2>&1 | grep -i error
```

### Backup database:

```bash
# Backup
docker compose exec postgres pg_dump -U nirmaan nirmaan > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20240101.sql | docker compose exec -T postgres psql -U nirmaan nirmaan
```

### Update deployment:

```bash
# On the server
cd Nirmaan
git pull origin main
docker compose down
docker compose up --build -d
```

### Automated backup (cron):

```bash
# Add to crontab (crontab -e)
0 2 * * * cd /home/ubuntu/Nirmaan && docker compose exec -T postgres pg_dump -U nirmaan nirmaan | gzip > /home/ubuntu/backups/nirmaan_$(date +\%Y\%m\%d).sql.gz
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start everything | `make dev` |
| Stop everything | `make stop` |
| View logs | `make logs` |
| Run tests | `make backend-test` |
| Check health | `make health` |
| DB shell | `make db-shell` |
| Deploy | `git push origin main` (CI/CD handles it) |
| First-time setup | `make setup` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | `lsof -i :8000` then `kill <PID>` |
| Docker build fails | `docker compose build --no-cache` |
| DB connection refused | Wait for healthcheck: `docker compose ps` |
| Permission denied | `sudo chown -R $USER:$USER .` |
| Frontend can't reach API | Check `NEXT_PUBLIC_API_URL` in `.env` |
| Migrations fail | `make db-reset` (destructive) |

---

*Last updated: 2025 | Nirmaan – Building India's Construction Supply Chain*
