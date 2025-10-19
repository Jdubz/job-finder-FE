# Job Finder Frontend

A modern React application for the Job Finder platform, built with React 18, TypeScript, Vite, and shadcn/ui.

## Overview

This is the dedicated frontend application for Job Finder, extracted from the portfolio monorepo. It provides a streamlined, professional UI for job discovery, queue management, and AI-powered job matching.

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
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm run test        # Run tests
npm run test:ui     # Run tests with UI
```

## Environment Variables

See `.env.template` for required environment variables.

Key variables:
- `VITE_FIREBASE_*` - Firebase configuration
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_ENVIRONMENT` - Current environment (development/staging/production)

## Deployment

The application is deployed to Firebase Hosting with two environments:

- **Staging:** `staging.job-finder.joshwentworth.com`
- **Production:** `job-finder.joshwentworth.com`

Deployment is automated via GitHub Actions on branch merges.

## Shared Types

This project uses `@jsdubzw/job-finder-shared-types` for type safety across frontend, backend, and Firebase Functions.

## Contributing

See the main migration plan documentation for contribution guidelines.

## Related Projects

- **portfolio** - Original monorepo (home page and contact form)
- **job-finder** - Python backend for job discovery and AI matching
- **job-finder-shared-types** - Shared TypeScript types

## License

Private - All Rights Reserved
