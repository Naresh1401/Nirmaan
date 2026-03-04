# ─────────────────────────────────────────────────────────
# Nirmaan – Development & Deployment Makefile
# ─────────────────────────────────────────────────────────

.PHONY: help dev stop build test clean deploy logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ── Local Development ───────────────────────────────────

dev: ## Start all services (docker-compose)
	docker compose up --build

dev-bg: ## Start all services in background
	docker compose up --build -d

stop: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose down && docker compose up --build -d

logs: ## Tail logs for all services
	docker compose logs -f

logs-backend: ## Tail backend logs
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs
	docker compose logs -f frontend

# ── Backend ─────────────────────────────────────────────

backend-dev: ## Run backend locally (no Docker)
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

backend-test: ## Run backend tests
	cd backend && pytest tests/ -v --tb=short

backend-lint: ## Lint backend code
	cd backend && ruff check .

backend-format: ## Format backend code
	cd backend && ruff format .

backend-shell: ## Open shell in backend container
	docker compose exec backend bash

# ── Frontend ────────────────────────────────────────────

frontend-dev: ## Run frontend locally (no Docker)
	cd frontend && npm run dev

frontend-build: ## Build frontend
	cd frontend && npm run build

frontend-lint: ## Lint frontend code
	cd frontend && npm run lint

frontend-shell: ## Open shell in frontend container
	docker compose exec frontend sh

# ── Database ────────────────────────────────────────────

db-shell: ## Open psql shell
	docker compose exec postgres psql -U nirmaan -d nirmaan

db-migrate: ## Run database migrations
	cd backend && alembic upgrade head

db-rollback: ## Rollback last migration
	cd backend && alembic downgrade -1

db-reset: ## Reset database (DESTRUCTIVE)
	docker compose down -v
	docker compose up -d postgres
	sleep 3
	cd backend && alembic upgrade head

# ── Build & Deploy ──────────────────────────────────────

build: ## Build all Docker images
	docker compose build

clean: ## Remove all containers, volumes, images
	docker compose down -v --rmi all --remove-orphans

deploy-staging: ## Deploy to staging
	@echo "Deploying to staging..."
	docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d

deploy-prod: ## Deploy to production
	@echo "Deploying to production..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# ── Utilities ───────────────────────────────────────────

setup: ## First-time project setup
	@echo "Setting up Nirmaan..."
	cp -n .env.example .env || true
	docker compose build
	docker compose up -d postgres redis
	sleep 3
	@echo "\n✅ Setup complete! Run 'make dev' to start."

status: ## Show service status
	docker compose ps

health: ## Check service health
	@echo "Backend:" && curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || echo "  ❌ Not running"
	@echo "\nFrontend:" && curl -s -o /dev/null -w "  HTTP %{http_code}" http://localhost:3000 2>/dev/null || echo "  ❌ Not running"
	@echo ""
