.PHONY: help dev build preview clean install lint lint-fix test firebase-serve deploy-staging deploy-prod kill

help:
	@echo "Job Finder Frontend - Development Commands"
	@echo "=========================================="
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start Vite development server (port 5173)"
	@echo "  make build            - Build production bundle"
	@echo "  make preview          - Preview production build (port 4173)"
	@echo "  make clean            - Clean build artifacts"
	@echo "  make install          - Install dependencies"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             - Run ESLint and TypeScript checks"
	@echo "  make lint-fix         - Auto-fix linting issues"
	@echo "  make test             - Run unit tests"
	@echo "  make type-check       - Run TypeScript type checking"
	@echo ""
	@echo "Firebase:"
	@echo "  make firebase-serve   - Serve with Firebase emulators (port 5000)"
	@echo "  make firebase-login   - Login to Firebase"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-staging   - Deploy to staging environment"
	@echo "  make deploy-prod      - Deploy to production environment"
	@echo ""
	@echo "Process Management:"
	@echo "  make kill             - Kill all dev servers"
	@echo ""

# Development
dev:
	@echo "Starting Vite development server (port 5173)..."
	npm run dev

build:
	@echo "Building production bundle..."
	npm run build

preview:
	@echo "Previewing production build (port 4173)..."
	npm run preview

clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist node_modules/.vite

install:
	@echo "Installing dependencies..."
	npm install

# Code Quality
lint:
	@echo "Running ESLint and TypeScript checks..."
	npm run lint

lint-fix:
	@echo "Auto-fixing linting issues..."
	npm run lint -- --fix

test:
	@echo "Running unit tests..."
	npm test

type-check:
	@echo "Running TypeScript type checking..."
	npx tsc --noEmit

# Firebase
firebase-serve:
	@echo "Starting Firebase emulators..."
	@echo "- Hosting: http://localhost:5000"
	@echo "- Auth:    http://localhost:9099"
	@echo "- UI:      http://localhost:4000"
	firebase emulators:start

firebase-login:
	@echo "Logging into Firebase..."
	firebase login

# Deployment
deploy-staging:
	@echo "Deploying to staging..."
	@echo "Building application with staging environment..."
	npm run build:staging
	@echo "Deploying to Firebase Hosting (staging target)..."
	firebase deploy --only hosting:staging

deploy-prod:
	@echo "Deploying to production..."
	@echo "WARNING: This will deploy to production!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "Building application with production environment..."
	npm run build:production
	@echo "Deploying to Firebase Hosting (production target)..."
	firebase deploy --only hosting:production

# Process Management
kill:
	@echo "Killing all dev servers..."
	@echo "Stopping Vite dev server (port 5173)..."
	@lsof -ti:5173 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Vite preview server (port 4173)..."
	@lsof -ti:4173 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Firebase hosting emulator (port 5000)..."
	@lsof -ti:5000 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Firebase Auth emulator (port 9099)..."
	@lsof -ti:9099 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Firebase Emulator UI (port 4000)..."
	@lsof -ti:4000 | xargs kill -9 2>/dev/null || true
	@echo "✓ All dev servers stopped"
