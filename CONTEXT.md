# Job Finder Frontend - Architectural Context

**Last Updated**: 2025-10-19
**Version**: 0.1.0

This document serves as the single source of truth for architectural decisions, design patterns, and important context for the Job Finder Frontend application.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Key Design Decisions](#key-design-decisions)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Security & Performance](#security--performance)
6. [Development Patterns](#development-patterns)
7. [Integration Points](#integration-points)

---

## System Architecture

### Overview

The Job Finder Frontend is a **standalone React application** that provides a modern UI for job search automation and AI-powered document generation. It integrates with two backend systems:

1. **job-finder-FE Backend Functions** - AI resume/cover letter generation
2. **Job-Finder Python Service** - Job scraping and matching

```
┌────────────────────────────────────────────────────────┐
│              Job Finder Frontend (React)               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Job Finder   │  │   Document   │  │  Settings   │  │
│  │ (Submit Jobs)│  │   Builder    │  │  & Config   │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
└────────────────────┬───────────────────┬───────────────┘
                     │                   │
            ┌────────┴────────┐  ┌───────┴────────┐
            │    Firestore    │  │   Firebase     │
            │   (Real-time)   │  │   Functions    │
            └────────┬────────┘  └───────┬────────┘
                     │                   │
         ┌───────────┴──────────┐        │
         │                      │        │
    ┌────┴────┐          ┌──────┴─────┐ │
    │  Job    │          │    Job     │ │
    │ Finder  │          │   Matches  │ │
    │ (Python)│          │            │ │
    └─────────┘          └────────────┘ │
                                        │
                              ┌─────────┴──────────┐
                              │  AI Resume Gen     │
                              │  (Cloud Functions) │
                              └────────────────────┘
```

### Technology Choices

**Why React + Vite?**
- Fast development with Hot Module Replacement (HMR)
- Modern build tooling with optimized production bundles
- Tree-shaking and code splitting built-in
- TypeScript support out of the box
- Smaller bundle size vs. Create React App

**Why Tailwind CSS + shadcn/ui?**
- Utility-first approach for rapid development
- Highly customizable component library
- Accessible components (ARIA compliant)
- Consistent design system
- No runtime CSS-in-JS overhead

**Why Firebase Hosting?**
- Global CDN with excellent performance
- Easy integration with Firebase Auth
- Preview channels for testing
- Automatic SSL certificates
- Simple deployment workflow

---

## Key Design Decisions

### 1. Client-Side Routing (React Router)

**Why**: Single Page Application (SPA) with instant navigation

- No full page reloads
- Protected routes for authenticated pages
- Public routes for login/unauthorized
- URL-based navigation state

### 2. Real-Time Data with Firestore

**Why**: Live updates without polling

- Job queue status updates in real-time
- New job matches appear instantly
- No need for manual refresh
- Optimistic UI updates

### 3. Context-Based State Management

**Why**: Simple and sufficient for this app

- Auth state in `AuthContext`
- No need for Redux/Zustand complexity
- Local component state for UI
- Server state managed by Firestore listeners

### 4. Shared Type System

**Why**: Type safety across projects

- `@jdubz/job-finder-shared-types` package
- Single source of truth for data structures
- Prevents type mismatches between frontend/backend
- Mirrors Python Pydantic models

### 5. Environment-Based Configuration

**Why**: Support multiple environments

- Development (emulators)
- Staging (testing)
- Production (live)
- Environment variables for API keys and endpoints

---

## Technology Stack

### Frontend
- **React 18** - UI library with hooks and concurrent features
- **TypeScript** - Type safety and better DX
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library

### Backend Integration
- **Firebase SDK** - Auth, Firestore, Functions
- **Fetch API** - HTTP requests to Cloud Functions
- **Firestore Listeners** - Real-time data subscriptions

### Development Tools
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Vite** - Fast builds and HMR

### CI/CD
- **GitHub Actions** - Automated testing and deployment
- **Firebase Hosting** - Static site hosting

---

## Project Structure

```
job-finder-FE/
├── .claude/                    # Claude Code configuration
│   ├── settings.json          # Project metadata
│   └── agents/                # Custom Claude agents
│
├── .github/workflows/          # CI/CD pipelines
│   ├── deploy-staging.yml     # Auto-deploy to staging
│   ├── deploy-production.yml  # Auto-deploy to production
│   └── pr-checks.yml          # PR validation
│
├── src/
│   ├── components/            # Reusable React components
│   │   ├── auth/             # Authentication guards
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PublicRoute.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── MainLayout.tsx
│   │   │   └── Navigation.tsx
│   │   └── ui/               # shadcn/ui components (auto-generated)
│   │
│   ├── pages/                # Page-level components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── UnauthorizedPage.tsx
│   │   ├── job-finder/
│   │   │   └── JobFinderPage.tsx
│   │   ├── job-applications/
│   │   │   └── JobApplicationsPage.tsx
│   │   ├── document-builder/
│   │   │   └── DocumentBuilderPage.tsx
│   │   ├── content-items/
│   │   │   └── ContentItemsPage.tsx
│   │   ├── ai-prompts/
│   │   │   └── AIPromptsPage.tsx
│   │   ├── document-history/
│   │   │   └── DocumentHistoryPage.tsx
│   │   ├── queue-management/
│   │   │   └── QueueManagementPage.tsx
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   ├── how-it-works/
│   │   │   └── HowItWorksPage.tsx
│   │   └── HomePage.tsx
│   │
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx  # Firebase Auth state
│   │
│   ├── config/               # Configuration
│   │   ├── api.ts           # API endpoints
│   │   └── firebase.ts      # Firebase initialization
│   │
│   ├── lib/                  # Utilities
│   │   └── utils.ts         # Tailwind merge, cn helper
│   │
│   ├── types/                # TypeScript types
│   │   └── routes.ts        # Route types
│   │
│   ├── App.tsx              # Root component
│   ├── router.tsx           # Route definitions
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles + Tailwind directives
│
├── public/                   # Static assets
│   └── vite.svg
│
├── scripts/                  # Build and utility scripts
│
├── firebase.json            # Firebase hosting config
├── .firebaserc             # Firebase project targets
├── Makefile                # Development commands
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # Tailwind CSS config
├── eslint.config.js        # ESLint configuration
├── .prettierrc.json        # Prettier configuration
├── components.json         # shadcn/ui config
└── package.json            # Dependencies and scripts
```

---

## Security & Performance

### Security Measures

**Authentication**:
- Firebase Auth with Google OAuth
- Protected routes require valid ID token
- Custom claims for editor role
- Token refresh handled automatically

**API Security**:
- CORS configured on backend functions
- Rate limiting on AI generation
- Input validation on all forms
- Secure environment variable handling

**Hosting Security Headers**:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Content-Security-Policy

### Performance Optimizations

**Build-Time**:
- Code splitting with React.lazy()
- Tree-shaking unused code
- Minification and compression
- Asset optimization (images, fonts)

**Runtime**:
- CDN delivery via Firebase Hosting
- Aggressive caching for static assets
- Lazy loading for page components
- Firestore query optimization

**Bundle Size**:
- Vite's optimized chunking
- Only import needed Firebase modules
- shadcn/ui components on-demand
- No large dependencies

---

## Development Patterns

### Git Workflow

```
feature_branch → staging → main
```

**Rules**:
1. Create feature branches from `staging`
2. Create PR: `feature → staging`
3. Test on staging deployment (auto-deployed)
4. Create PR: `staging → main` for production
5. Never push directly to `main`

### Component Patterns

**Page Components**:
- One component per page
- Named `<Name>Page.tsx`
- Located in `src/pages/<feature>/`
- Handle data fetching and state

**Reusable Components**:
- Generic, composable components
- Located in `src/components/`
- Accept props for customization
- No business logic

**shadcn/ui Components**:
- Generated in `src/components/ui/`
- Customizable via Tailwind
- Follow accessibility best practices

### State Management

**Auth State** (Context):
```typescript
const { user, loading, isEditor, login, logout } = useAuth()
```

**Component State** (useState):
```typescript
const [formData, setFormData] = useState<FormData>({})
```

**Server State** (Firestore):
```typescript
onSnapshot(query, (snapshot) => {
  setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
})
```

### Testing Strategy

**Unit Tests** (Vitest - Future):
- Component rendering tests
- Utility function tests
- Hook tests

**E2E Tests** (Playwright - Future):
- User flows (login, submit job, generate resume)
- Cross-browser testing
- Mobile responsive testing

---

## Integration Points

### 1. job-finder-FE Backend (Firebase Functions)

**Endpoints**:
- `POST /manageGenerator` - AI resume/cover letter generation
- `GET /manageGenerator/history` - Document history
- `GET /manageGenerator/defaults` - User defaults

**Authentication**: Bearer token in Authorization header

**Data Flow**:
1. User fills document builder form
2. Frontend sends request to Cloud Function
3. Function generates PDF with AI
4. Returns download URL
5. Stores in `generator_history` collection

### 2. Job-Finder Python Service

**Shared Firestore Collections**:

**`job-queue`** - Jobs to process
```typescript
interface QueueItem {
  type: 'manual' | 'automated'
  status: 'pending' | 'processing' | 'success' | 'failed'
  url: string
  company_name: string
  // ... from @jdubz/job-finder-shared-types
}
```

**`job-matches`** - AI-analyzed matches
```typescript
interface JobMatch {
  userId: string
  score: number
  matchReason: string
  jobTitle: string
  company: string
  // ... from @jdubz/job-finder-shared-types
}
```

**`job-finder-config`** - Configuration
```typescript
// Documents:
// - stop-list: { companies: string[], keywords: string[] }
// - queue-settings: { maxRetries: number, ... }
// - ai-settings: { provider: 'openai' | 'gemini', ... }
```

**Data Flow**:
1. User submits job URL (frontend → Firestore `job-queue`)
2. Python service polls queue, processes job
3. Creates `JobMatch` if score ≥ threshold
4. Frontend displays match in real-time (Firestore listener)

### 3. Shared Types Package

**Installation**:
```bash
npm install ../job-finder-shared-types
```

**Usage**:
```typescript
import type { QueueItem, JobMatch } from '@jdubz/job-finder-shared-types'
```

**Important**: When updating types:
1. Update TypeScript types in `job-finder-shared-types`
2. Update Python Pydantic models in `job-finder`
3. Rebuild shared-types: `cd ../job-finder-shared-types && npm run build`
4. Test all three projects

---

## Future Enhancements

### Short-Term (v0.2)
- [ ] Add unit tests with Vitest
- [ ] Add E2E tests with Playwright
- [ ] Add error boundary for better error handling
- [ ] Add loading states for all async operations
- [ ] Add toast notifications for user feedback

### Mid-Term (v0.3)
- [ ] Add Storybook for component development
- [ ] Add performance monitoring
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (privacy-friendly)
- [ ] Add PWA support (offline mode)

### Long-Term (v1.0)
- [ ] Add resume template customization
- [ ] Add job board integrations (LinkedIn, Indeed)
- [ ] Add interview preparation tools
- [ ] Add application tracking dashboard
- [ ] Add team collaboration features

---

## Deployment

### Environments

**Development** (Local):
- URL: http://localhost:5173
- Firebase: Emulators
- API: Local functions

**Staging**:
- URL: https://job-finder-staging.web.app
- Firebase: `job-finder-staging` target
- API: Staging Cloud Functions
- Auto-deploys on push to `staging`

**Production**:
- URL: https://job-finder.joshwentworth.com
- Firebase: `job-finder-production` target
- API: Production Cloud Functions
- Auto-deploys on merge to `main`

### Deployment Workflow

1. **Feature Development** → Push to feature branch
2. **PR to Staging** → CI runs tests, blocks if failing
3. **Merge to Staging** → Auto-deploys to staging.example.com
4. **Test on Staging** → Manual testing
5. **PR to Main** → Final review
6. **Merge to Main** → Auto-deploys to production

---

## Contact

For questions about this architecture:
- **Email**: hello@joshwentworth.com
- **Developer**: Josh Wentworth
