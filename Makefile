# Makefile for IFRS9 Development Environment
# See docker-compose.dev.yml for service definitions

# Variables
LOCAL_COMPOSE_DIR := ops/local
DEV_COMPOSE_DIR := ops/dev
PROD_COMPOSE_DIR := ops/prod
COMPOSE_FILE := $(LOCAL_COMPOSE_DIR)/docker-compose.yml
COMPOSE := docker-compose -f $(COMPOSE_FILE) --env-file $(LOCAL_COMPOSE_DIR)/.env
BACKEND_SERVICE := new-backend
DB_SERVICE := postgres

# Default target
.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ==============================================================================
# 🚀 LOCAL DEVELOPMENT
# ==============================================================================

.PHONY: up
up: ## [LOCAL] Start backend, db, and redis
	$(COMPOSE) --profile dev up -d

.PHONY: db
db: ## [LOCAL] Start ONLY databases
	$(COMPOSE) --profile db up -d

.PHONY: backend
backend: ## [LOCAL] Start ONLY backend
	$(COMPOSE) --profile backend up -d

.PHONY: analytics
analytics: ## [LOCAL] Start ONLY R Analytics
	$(COMPOSE) --profile analytics up -d r-analytics

.PHONY: frontend
frontend: ## [LOCAL] Start ONLY frontend (Docker)
	$(COMPOSE) --profile app up -d frontend

.PHONY: dev-frontend
dev-frontend: ## [LOCAL] Run frontend LOCALLY (pnpm)
	cd packages/frontend && pnpm run dev

.PHONY: frontend-dev
frontend-dev: ## [LOCAL] Start frontend in Docker (hot-reload)
	@echo "🌐 Starting frontend (hot-reload) in Docker..."
	$(COMPOSE) --profile dev --profile dev-frontend up -d frontend-dev

.PHONY: frontend-dev-no-deps
frontend-dev-no-deps: ## [LOCAL] Start frontend in Docker (hot-reload) WITHOUT starting dependencies
	@echo "🌐 Starting frontend (hot-reload) in Docker (no dependencies)..."
	$(COMPOSE) --profile dev-frontend up -d --no-deps frontend-dev

.PHONY: dev
dev: ## [LOCAL] Start Development Env (Backend + DB)
	$(COMPOSE) --profile dev up -d

.PHONY: up-full
up-full: ## [LOCAL] Start ALL services (Backend + Frontend Hot Reload)
	$(COMPOSE) --profile full up -d

.PHONY: dev-docker
dev-docker: ## [LOCAL] Start Backend + Frontend with HOT RELOAD in Docker
	$(COMPOSE) --profile dev-frontend up -d

# Convenient shortcuts
.PHONY: local-full
local-full: ## [LOCAL] Quick start: Full stack with hot reload (Frontend + Backend + DB)
	@echo "🚀 Starting full local development stack..."
	$(COMPOSE) --profile full up

.PHONY: local-db
local-db: ## [LOCAL] Quick start: Databases only
	@echo "🗄️ Starting databases..."
	$(COMPOSE) --profile db up -d

.PHONY: local-backend
local-backend: ## [LOCAL] Quick start: Backend only
	@echo "⚡ Starting backend..."
	$(COMPOSE) --profile backend up

.PHONY: local-frontend
local-frontend: ## [LOCAL] Quick start: Frontend only (requires backend running)
	@echo "🌐 Starting frontend..."
	$(COMPOSE) --profile backend-only --profile frontend-only up -d

.PHONY: local-logs
local-logs: ## [LOCAL] View logs for all local services
	$(COMPOSE) logs -f

# ==============================================================================
# 🔧 DEV SERVER (STAGING)
# ==============================================================================
DEV_COMPOSE := docker-compose -f $(DEV_COMPOSE_DIR)/docker-compose.yml --env-file $(DEV_COMPOSE_DIR)/.env

.PHONY: dev-server
dev-server: ## [DEV] Start DEV SERVER environment (Profile: full)
	$(DEV_COMPOSE) --profile full up -d

.PHONY: dev-server-app
dev-server-app: ## [DEV] Start DEV SERVER apps only (Profile: app)
	$(DEV_COMPOSE) --profile app up -d

.PHONY: dev-server-db
dev-server-db: ## [DEV] Start DEV SERVER databases only (Profile: db)
	$(DEV_COMPOSE) --profile db up -d

.PHONY: dev-server-deploy
dev-server-deploy: ## [DEV] Deploy DEV SERVER (Build & Up - Profile: full)
	$(DEV_COMPOSE) --profile full up -d --build

.PHONY: dev-server-stop
dev-server-stop: ## [DEV] Stop DEV SERVER environment
	$(DEV_COMPOSE) stop

.PHONY: dev-server-down
dev-server-down: ## [DEV] Stop and remove DEV SERVER containers
	$(DEV_COMPOSE) down

# ==============================================================================
# 🚀 PRODUCTION
# ==============================================================================
PROD_COMPOSE := docker-compose -f $(PROD_COMPOSE_DIR)/docker-compose.yml --env-file $(PROD_COMPOSE_DIR)/.env

.PHONY: prod
prod: ## [PROD] Start PRODUCTION environment (Profile: full)
	$(PROD_COMPOSE) --profile full up -d

.PHONY: prod-app
prod-app: ## [PROD] Start PRODUCTION apps only (Profile: app)
	$(PROD_COMPOSE) --profile app up -d

.PHONY: prod-frontend
prod-frontend: ## [PROD] Start PRODUCTION frontend only
	$(PROD_COMPOSE) --profile app up -d frontend

.PHONY: deploy-frontend
deploy-frontend: ## [PROD] Deploy PRODUCTION frontend (Build & Up)
	$(PROD_COMPOSE) --profile app up -d --build frontend

.PHONY: prod-db
prod-db: ## [PROD] Start PRODUCTION databases only
	$(PROD_COMPOSE) --profile db up -d

.PHONY: deploy
deploy: ## [PROD] Deploy PRODUCTION (Build & Up - Profile: full)
	$(PROD_COMPOSE) --profile full up -d --build

.PHONY: deploy-app
deploy-app: ## [PROD] Deploy PRODUCTION apps (Build & Up - Profile: app)
	$(PROD_COMPOSE) --profile app up -d --build

.PHONY: prod-stop
prod-stop: ## [PROD] Stop PRODUCTION environment
	$(PROD_COMPOSE) stop

.PHONY: stop
stop: ## Stop all running services
	$(COMPOSE) stop

.PHONY: down
down: ## Stop and remove containers and networks
	$(COMPOSE) down

.PHONY: restart
restart: ## Restart all services
	$(COMPOSE) restart

.PHONY: restart-backend
restart-backend: ## [LOCAL] Restart backend only
	$(COMPOSE) --profile backend up -d --build --force-recreate new-backend

.PHONY: restart-frontend
restart-frontend: ## [LOCAL] Restart frontend (Docker static) only
	$(COMPOSE) --profile app up -d --build --force-recreate frontend

.PHONY: restart-analytics
restart-analytics: ## [LOCAL] Restart analytics only (Profile: analytics)
	$(COMPOSE) --profile analytics up -d --build --force-recreate r-analytics

# ==============================================================================
# 🛠️ Maintenance & Development
# ==============================================================================

.PHONY: build
build: ## Rebuild all images
	$(COMPOSE) build

.PHONY: build-backend
build-backend: ## [LOCAL] Build backend image only
	$(COMPOSE) build new-backend

.PHONY: build-frontend
build-frontend: ## [LOCAL] Build frontend image only
	$(COMPOSE) build frontend

.PHONY: build-analytics
build-analytics: ## [LOCAL] Build analytics image only
	$(COMPOSE) --profile analytics build r-analytics

.PHONY: bund
bund: ## Bundle the backend using bun (inside container)
	$(COMPOSE) exec $(BACKEND_SERVICE) bun run build

.PHONY: build-no-cache
build-no-cache: ## Rebuild all images without cache
	$(COMPOSE) build --no-cache

.PHONY: logs
logs: ## Tail logs for all services
	$(COMPOSE) logs -f

.PHONY: logs-backend
logs-backend: ## Tail logs for backend service only
	$(COMPOSE) logs -f $(BACKEND_SERVICE)

.PHONY: prune
prune: ## Prune docker build cache and stopped containers
	docker builder prune -f
	docker container prune -f

.PHONY: prune-full
prune-full: ## Deep clean: remove unused images, containers, and networks (KEEPS VOLUMES/DATA)
	docker system prune -a -f

.PHONY: prune-volumes
prune-volumes: ## ⚠️ Danger: Remove unused volumes (DELETES DATABASE DATA)
	docker volume prune -f

# ==============================================================================
# 🐚 Access & Utilities
# ==============================================================================

.PHONY: shell
shell: ## Open a shell inside the backend container
	$(COMPOSE) exec $(BACKEND_SERVICE) /bin/bash 2>/dev/null || $(COMPOSE) exec $(BACKEND_SERVICE) /bin/sh

.PHONY: db-shell
db-shell: ## Connect to the PostgreSQL database via psql
	$(COMPOSE) exec $(DB_SERVICE) psql -U postgres -d ifrspro_platform_admin

.PHONY: migrate
migrate: ## Run database migrations
	$(COMPOSE) exec $(BACKEND_SERVICE) bun run db:migrate

.PHONY: db-studio
db-studio: ## Start Drizzle Studio (if accessible via port)
	$(COMPOSE) exec $(BACKEND_SERVICE) bun run db:studio

.PHONY: clean
clean: ## Stop and remove containers, networks, AND volumes (CAUTION)
	$(COMPOSE) down -v
