# Job Finder Frontend

A modern React application for the Job Finder platform, built with React 18, TypeScript, Vite, and shadcn/ui.

## Overview

This is the dedicated frontend application for Job Finder. It provides a streamlined, professional UI for job discovery, queue management, and AI-powered job matching.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** shadcn/ui (blue theme)
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Authentication:** Firebase Auth
- **Database:** Cloud Firestore
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint (flat config) + Prettier

## Project Structure

```
src/
├── api/              # API client layer
├── components/       # Reusable components
│   └── ui/          # shadcn/ui components
├── config/          # Configuration files
├── contexts/        # React contexts (Auth, etc.)
├── features/        # Feature-based modules
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── test/            # Test setup and utilities
└── types/           # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.template .env
   ```

2. Fill in your Firebase configuration values in `.env`

### Development

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:ui      # Run E2E tests with Playwright UI
npm run test:e2e:headed  # Run E2E tests in headed mode
npm run test:e2e:debug   # Debug E2E tests
npm run type-check       # Run TypeScript type checking
```

## Environment Variables

See `.env.example` for required environment variables.

Key variables:
- `VITE_FIREBASE_*` - Firebase configuration (project-specific)
- `VITE_API_BASE_URL` - Backend API URL (auto-configured by environment)
- `VITE_USE_EMULATORS` - Enable Firebase emulators in development
- `VITE_ENVIRONMENT` - Current environment (development/staging/production)

### Environment Configuration

The application uses environment-specific configuration:

- **Development**: Uses Firebase emulators and `job-finder-dev` project
- **Staging**: Uses `job-finder-staging` project and Cloud Functions
- **Production**: Uses `job-finder-prod` project and Cloud Functions

API endpoints are automatically configured based on the build mode. See `src/config/api.ts` for details.

## Deployment

The application is deployed to Firebase Hosting with two environments:

- **Staging:** `staging.job-finder.joshwentworth.com`
- **Production:** `job-finder.joshwentworth.com`

Deployment is automated via GitHub Actions on branch merges.

## Shared Types

This project uses `@jsdubzw/job-finder-shared-types` for type safety across frontend, backend, and Firebase Functions.

## Contributing

See the main migration plan documentation for contribution guidelines.

## Features

### Core Features
- **Job Applications:** View and manage job matches with filtering and search
- **Job Finder:** Submit LinkedIn job URLs for automated processing
- **Document Builder:** Generate AI-powered resumes and cover letters
- **Document History:** Browse, download, and manage generated documents
- **Queue Management:** Monitor job processing queue status

### Configuration Features (Editor Role Required)
- **Job Finder Config:** Configure stop lists, queue settings, and AI parameters
- **AI Prompts:** Customize AI prompts for document generation with variable interpolation
- **Settings:** Manage user preferences, theme, and default settings

### Technical Features
- Protected routes with Firebase Authentication
- Role-based access control (user/editor roles)
- Real-time Firestore updates
- Responsive design with mobile support
- Dark mode support
- Comprehensive E2E test coverage
- CI/CD pipeline with automated deployments

## API Documentation

See [API.md](./API.md) for detailed API client documentation.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system architecture and component diagrams.

## Related Projects

- **job-finder-BE** - Firebase Functions backend for document generation and content management
- **job-finder** - Python queue worker for job discovery and scraping
- **job-finder-shared-types** - Shared TypeScript types across all projects

## License

Private - All Rights Reserved
