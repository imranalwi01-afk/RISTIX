# packages/frontend/Makefile

.PHONY: dev vps local clean

# Default to local development
dev: local

# Standard Local Development (uses .env.local)
local:
	@echo "🚀 Starting Frontend (Local Mode)..."
	./start.sh

# VPS Development (uses .env.vps)
vps:
	@echo "🚀 Starting Frontend (VPS Mode)..."
	@if [ -f .env.local ]; then mv .env.local .env.local.bak; fi
	@cp .env.vps .env.local
	./start.sh
	@echo "⚠️  Note: .env.local was replaced with .env.vps. Original saved as .env.local.bak"

# Restore Local Environment
restore-local:
	@if [ -f .env.local.bak ]; then mv .env.local.bak .env.local; echo "✅ Restored .env.local"; else echo "ℹ️  No backup found to restore"; fi

clean:
	rm -rf .next node_modules/.cache
