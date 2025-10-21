.PHONY: help install dev dev-stop dev-status dev-logs build preview clean test lint lint-fix type-check emulators emulators-stop emulators-status firebase-serve deploy-staging deploy-prod kill

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
RESET := \033[0m

help: ## Show this help message
	@echo "$(CYAN)Job Finder Frontend - Development Commands$(RESET)"
	@echo "=========================================="
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(CYAN)%-20s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# ============================================================================
# Standard Development Targets (Consistent across all repos)
# ============================================================================

install: ## Install dependencies
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	@npm install
	@echo "$(GREEN)✓ Dependencies installed$(RESET)"

dev: ## Start Vite development server (port 5173)
	@echo "$(CYAN)Starting Vite development server (port 5173)...$(RESET)"
	@npm run dev

dev-stop: ## Stop Vite development server
	@echo "$(CYAN)Stopping Vite dev server...$(RESET)"
	@lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 5173$(RESET)"
	@echo "$(GREEN)✓ Vite dev server stopped$(RESET)"

dev-status: ## Check if Vite dev server is running
	@echo "$(CYAN)Checking Vite dev server status...$(RESET)"
	@if curl -s http://localhost:5173 > /dev/null 2>&1; then \
		echo "$(GREEN)✓ Vite dev server is running (port 5173)$(RESET)"; \
		echo "  View at: http://localhost:5173"; \
	else \
		echo "$(YELLOW)⚠ Vite dev server is not running$(RESET)"; \
		echo "  Start with: make dev"; \
	fi

dev-logs: ## Show development logs (Vite has integrated logs)
	@echo "$(CYAN)Vite logs are shown in the dev server output$(RESET)"
	@echo "  Start server with: make dev"

build: ## Build production bundle
	@echo "$(CYAN)Building production bundle...$(RESET)"
	@npm run build
	@echo "$(GREEN)✓ Build complete$(RESET)"

preview: ## Preview production build (port 4173)
	@echo "$(CYAN)Previewing production build (port 4173)...$(RESET)"
	@npm run preview

clean: ## Clean build artifacts
	@echo "$(CYAN)Cleaning build artifacts...$(RESET)"
	@rm -rf dist node_modules/.vite
	@echo "$(GREEN)✓ Clean complete$(RESET)"

test: ## Run unit tests
	@echo "$(CYAN)Running unit tests...$(RESET)"
	@npm test

test-watch: ## Run tests in watch mode
	@echo "$(CYAN)Running tests in watch mode...$(RESET)"
	@npm run test:watch

test-coverage: ## Run tests with coverage
	@echo "$(CYAN)Running tests with coverage...$(RESET)"
	@npm run test:coverage

test-e2e: ## Run end-to-end tests
	@echo "$(CYAN)Running E2E tests...$(RESET)"
	@npm run test:e2e

lint: ## Run ESLint and TypeScript checks
	@echo "$(CYAN)Running ESLint and TypeScript checks...$(RESET)"
	@npm run lint

lint-fix: ## Auto-fix linting issues
	@echo "$(CYAN)Auto-fixing linting issues...$(RESET)"
	@npm run lint:fix

type-check: ## Run TypeScript type checking
	@echo "$(CYAN)Running TypeScript type checking...$(RESET)"
	@npx tsc --noEmit

# ============================================================================
# Frontend-Specific Targets
# ============================================================================

emulators: ## Start Firebase emulators (NOTE: Should be started from BE repo)
	@echo "$(YELLOW)⚠ WARNING: Firebase emulators should be started from the BE repo$(RESET)"
	@echo "  The BE repo contains firestore.rules, firestore.indexes.json, and functions code"
	@echo ""
	@echo "  Run this instead:"
	@echo "    cd ../job-finder-BE && make emulators"
	@echo ""
	@echo "  Or from the manager repo:"
	@echo "    make dev-backend"
	@echo ""
	@read -p "Continue anyway? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "$(CYAN)Starting Firebase emulators from FE repo...$(RESET)"
	@firebase emulators:start

emulators-stop: ## Stop Firebase emulators
	@echo "$(CYAN)Stopping Firebase emulators...$(RESET)"
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 8080$(RESET)"
	@lsof -ti:9099 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 9099$(RESET)"
	@lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 5001$(RESET)"
	@lsof -ti:4000 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 4000$(RESET)"
	@lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 5000$(RESET)"
	@echo "$(GREEN)✓ Emulators stopped$(RESET)"

emulators-status: ## Check if Firebase emulators are running
	@echo "$(CYAN)Checking Firebase emulator status...$(RESET)"
	@if curl -s http://localhost:8080 > /dev/null 2>&1; then \
		echo "$(GREEN)✓ Firestore emulator running (port 8080)$(RESET)"; \
	else \
		echo "$(YELLOW)⚠ Firestore emulator not running$(RESET)"; \
	fi
	@if curl -s http://localhost:9099 > /dev/null 2>&1; then \
		echo "$(GREEN)✓ Auth emulator running (port 9099)$(RESET)"; \
	else \
		echo "$(YELLOW)⚠ Auth emulator not running$(RESET)"; \
	fi
	@if curl -s http://localhost:4000 > /dev/null 2>&1; then \
		echo "$(GREEN)✓ Emulator UI running (port 4000)$(RESET)"; \
		echo "  View at: http://localhost:4000"; \
	else \
		echo "$(YELLOW)⚠ Emulator UI not running$(RESET)"; \
	fi

firebase-serve: emulators ## Alias for emulators

firebase-login: ## Login to Firebase
	@echo "$(CYAN)Logging into Firebase...$(RESET)"
	@firebase login

# ============================================================================
# Deployment Targets
# ============================================================================

deploy-staging: ## Deploy to staging environment
	@echo "$(CYAN)Deploying to staging...$(RESET)"
	@echo "Building application with staging environment..."
	@npm run build:staging
	@echo "Deploying to Firebase Hosting (staging target)..."
	@firebase deploy --only hosting:staging
	@echo "$(GREEN)✓ Deployed to staging$(RESET)"

deploy-prod: ## Deploy to production environment
	@echo "$(RED)⚠ WARNING: Deploying to PRODUCTION!$(RESET)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "Building application with production environment..."
	@npm run build:production
	@echo "Deploying to Firebase Hosting (production target)..."
	@firebase deploy --only hosting:production
	@echo "$(GREEN)✓ Deployed to production$(RESET)"

# ============================================================================
# Process Management & Utilities
# ============================================================================

kill: ## Kill all dev servers and emulators
	@echo "$(CYAN)Killing all dev servers...$(RESET)"
	@lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 5173$(RESET)"
	@lsof -ti:4173 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 4173$(RESET)"
	@lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 5000$(RESET)"
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 8080$(RESET)"
	@lsof -ti:9099 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 9099$(RESET)"
	@lsof -ti:4000 | xargs kill -9 2>/dev/null || echo "$(YELLOW)No process on port 4000$(RESET)"
	@echo "$(GREEN)✓ All dev servers stopped$(RESET)"

health-check: ## Run health check for frontend services
	@echo "$(CYAN)Running frontend health check...$(RESET)"
	@bash ../scripts/dev/health-check.sh

.DEFAULT_GOAL := help
