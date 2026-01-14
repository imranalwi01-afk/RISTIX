# Makefile for IFRS9 Development Environment
# See docker-compose.dev.yml for service definitions

# Variables
COMPOSE_FILE := docker-compose.dev.yml
COMPOSE := docker-compose -f $(COMPOSE_FILE)
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
# 🚀 Startup & Shutdown
# ==============================================================================

.PHONY: up
up: ## Start backend, db, and redis (Profile: dev)
	$(COMPOSE) --profile dev up -d

.PHONY: db
db: ## Start ONLY databases (Profile: db)
	$(COMPOSE) --profile db up -d

.PHONY: backend
backend: ## Start ONLY backend (Profile: backend)
	$(COMPOSE) --profile backend up -d

.PHONY: frontend
frontend: ## Start ONLY frontend (Docker - Profile: app)
	$(COMPOSE) --profile app up -d frontend

.PHONY: dev-frontend
dev-frontend: ## Run frontend LOCALLY (pnpm)
	pnpm --filter frontend run dev

.PHONY: dev
dev: ## Alias for up
	$(COMPOSE) --profile dev up -d

.PHONY: up-full
up-full: ## Start ALL services including frontend (Profile: full)
	$(COMPOSE) --profile full up -d

.PHONY: prod
prod: ## Start PRODUCTION environment (Profile: full)
	docker-compose -f docker-compose.prod.yml --profile full up -d

prod-app: ## Start PRODUCTION apps only (Profile: app)
	docker-compose -f docker-compose.prod.yml --profile app up -d

.PHONY: prod-frontend
prod-frontend: ## Start PRODUCTION frontend only (Profile: app)
	docker-compose -f docker-compose.prod.yml --profile app up -d frontend

.PHONY: deploy-frontend
deploy-frontend: ## Deploy PRODUCTION frontend (Build & Up)
	docker-compose -f docker-compose.prod.yml --profile app up -d --build frontend

.PHONY: prod-db
prod-db: ## Start PRODUCTION databases only (Profile: db)
	docker-compose -f docker-compose.prod.yml --profile db up -d

.PHONY: deploy
deploy: ## Deploy PRODUCTION (Build & Up - Profile: full)
	docker-compose -f docker-compose.prod.yml --profile full up -d --build

.PHONY: deploy-app
deploy-app: ## Deploy PRODUCTION apps (Build & Up - Profile: app)
	docker-compose -f docker-compose.prod.yml --profile app up -d --build

.PHONY: prod-stop
prod-stop: ## Stop PRODUCTION environment
	docker-compose -f docker-compose.prod.yml stop

.PHONY: stop
stop: ## Stop all running services
	$(COMPOSE) stop

.PHONY: down
down: ## Stop and remove containers and networks
	$(COMPOSE) down

.PHONY: restart
restart: ## Restart all services
	$(COMPOSE) restart

# ==============================================================================
# 🛠️ Maintenance & Development
# ==============================================================================

.PHONY: build
build: ## Rebuild all images
	$(COMPOSE) build

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
