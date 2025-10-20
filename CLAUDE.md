# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Overview

This is the **Job Finder Frontend** - a standalone React application for job search automation, AI-powered resume generation, and job application management. It integrates with:

- **job-finder-FE Backend** (Firebase Functions) - AI resume generation, contact form
- **Job-Finder Python Service** - Job scraping, matching, and queue management
- **Shared Firestore Database** - Real-time data synchronization

**Key Technologies:**
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Routing:** React Router v6
- **State Management:** React Context API + Firebase Auth
- **Backend Integration:** Firebase SDK + REST APIs
- **Build Tool:** Vite (fast HMR, optimized production builds)

## Project Structure

```
job-finder-FE/
├── .claude/                # Claude Code configuration
├── .github/workflows/      # GitHub Actions CI/CD
├── src/
│   ├── components/         # Reusable React components
│   │   ├── auth/          # Authentication components
│   │   ├── layout/        # Layout components (nav, sidebar)
│   │   └── ui/            # shadcn/ui component library
│   ├── pages/             # Page-level components
│   │   ├── auth/          # Login, Unauthorized
│   │   ├── job-finder/    # Job submission page
│   │   ├── job-applications/  # Match results display
│   │   ├── document-builder/  # AI resume/cover letter builder
│   │   ├── content-items/ # Experience/skills management
│   │   ├── ai-prompts/    # AI prompt customization
│   │   ├── document-history/  # Generated document history
│   │   ├── queue-management/  # Admin job queue management
│   │   └── settings/      # User settings
│   ├── contexts/          # React contexts (Auth)
│   ├── config/            # Configuration files
│   │   ├── api.ts        # API base URLs and endpoints
│   │   └── firebase.ts   # Firebase initialization
│   ├── lib/               # Utility functions
│   │   └── utils.ts      # Tailwind merge, cn helper
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Root component
│   ├── router.tsx         # Route definitions
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles + Tailwind
├── public/                # Static assets
├── scripts/               # Build and utility scripts
├── firebase.json          # Firebase hosting configuration
├── .firebaserc           # Firebase project aliases
├── Makefile              # Development commands
└── package.json          # Dependencies and scripts
```

## Common Development Commands

### Daily Development

```bash
# Start dev server (port 5173)
npm run dev
# or
make dev

# Build for production
npm run build
# or
make build

# Preview production build
npm run preview
# or
make preview

# Run linting
npm run lint
# or
make lint

# Fix linting issues
npm run lint:fix
# or
make lint-fix

# Run tests
npm test
# or
make test
```

### Firebase Development

```bash
# Serve locally with Firebase emulators
firebase emulators:start
# or
make firebase-serve

# Deploy to staging
make deploy-staging

# Deploy to production
make deploy-prod
```

### Process Management

```bash
# Kill all dev servers
make kill
```

## Architecture Patterns

### Authentication Flow

```typescript
// Protected routes require authentication
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>

// Public routes redirect authenticated users
import { PublicRoute } from '@/components/auth/PublicRoute'

<Route element={<PublicRoute />}>
  <Route path="/login" element={<LoginPage />} />
</Route>
```

### State Management

**Auth State** (Context):
```typescript
import { useAuth } from '@/contexts/AuthContext'

const { user, loading, isEditor, login, logout } = useAuth()
```

**Component State** (useState/useReducer):
- Local form state
- UI state (modals, dropdowns)

**Server State** (Firebase Realtime):
- Firestore listeners for real-time updates
- No client-side caching needed

### API Integration

**Firebase Functions:**
```typescript
import { api } from '@/config/api'

// AI resume generation
const response = await fetch(`${api.functions.generateResume}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
```

**Firestore Direct Access:**
```typescript
import { db } from '@/config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

// Real-time job matches
const q = query(
  collection(db, 'job-matches'),
  where('userId', '==', user.uid)
)
onSnapshot(q, (snapshot) => {
  // Update UI
})
```

## Environment Configuration

### Development (`.env.development`)

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_USE_EMULATORS=true
```

### Staging (`.env.staging`)

```env
VITE_FIREBASE_API_KEY=your-staging-key
VITE_FIREBASE_AUTH_DOMAIN=staging.example.com
VITE_FIREBASE_PROJECT_ID=project-staging
VITE_API_BASE_URL=https://staging-api.example.com
```

### Production (`.env.production`)

```env
VITE_FIREBASE_API_KEY=your-production-key
VITE_FIREBASE_AUTH_DOMAIN=example.com
VITE_FIREBASE_PROJECT_ID=project-production
VITE_API_BASE_URL=https://api.example.com
```

## Shared Types Integration

This project uses types from `@jdubz/job-finder-shared-types`:

```typescript
import type {
  QueueItem,
  JobMatch,
  QueueSettings,
  AISettings
} from '@jdubz/job-finder-shared-types'
```

**Installing shared types:**
```bash
npm install ../job-finder-shared-types
```

## Git Workflow

**Branch Strategy:**
```
feature_branch → staging → main
```

**Rules:**
1. Create feature branches from `staging`
2. Create PR: `feature → staging`
3. Test on staging deployment
4. Create PR: `staging → main` for production
5. **Never push directly to `main`**

**Deployment:**
- Push to `staging` → auto-deploys to staging.example.com
- Merge to `main` → auto-deploys to production

## Testing Checklist (Before Merging to Main)

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Feature tested on staging
- [ ] Auth works (if auth-related changes)
- [ ] No console errors or warnings
- [ ] Mobile responsive (all breakpoints)
- [ ] Accessibility tested

## Component Library (shadcn/ui)

Add new components:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

Components are added to `src/components/ui/` and can be customized.

## Styling Guidelines

**Use Tailwind utility classes:**
```tsx
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
```

**Use cn() helper for conditional classes:**
```tsx
import { cn } from '@/lib/utils'

<button className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

## Important Notes

### Security

- **Firebase Auth:** All protected routes check authentication
- **API Keys:** Never commit `.env` files - use `.env.example`
- **CORS:** Backend APIs configured to allow staging + production origins
- **Rate Limiting:** Contact form and AI generation rate limited

### Performance

- **Code Splitting:** React Router lazy loads page components
- **Bundle Size:** Monitor with `npm run build` output
- **Image Optimization:** Use WebP format, lazy loading
- **Firebase SDK:** Only import needed modules

### Common Issues

1. **Dev server won't start:** Check port 5173 is free
2. **Firebase connection fails:** Verify environment variables
3. **Build fails:** Clear node_modules and reinstall
4. **Type errors:** Check shared-types package is installed

## Documentation

- [Architecture](./CONTEXT.md) - System design and patterns
- [Contributing](./CONTRIBUTING.md) - Development workflow
- [Changelog](./CHANGELOG.md) - Version history

## Cross-Project Integration

### job-finder-FE Backend Functions

**Endpoints:**
- `POST /manageGenerator` - AI resume/cover letter generation
- `POST /handleContactForm` - Contact form submission

### Job-Finder Python Service

**Shared Firestore Collections:**
- `job-queue` - Job processing queue
- `job-matches` - AI-analyzed matches
- `job-finder-config` - Settings and stop-lists

**Data Flow:**
1. User submits job URL (this app)
2. Python service processes queue
3. Creates JobMatch if score ≥ threshold
4. User sees match in real-time (this app)
5. User generates custom resume (this app → portfolio backend)

## Deployment

### Firebase Hosting

**Staging:**
```bash
npm run deploy:staging
```

**Production:**
```bash
npm run deploy:production
```

### Alternative Hosting (Vercel/Netlify)

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

## Troubleshooting

### Firebase Emulator Issues

1. **Port conflicts:** Change ports in `firebase.json`
2. **Auth not working:** Ensure emulators are running
3. **Data not persisting:** Check `--export-on-exit` flag

### Build Issues

1. **Out of memory:** Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096`
2. **Type errors:** Run `npm run type-check`
3. **Import errors:** Check path aliases in `tsconfig.json`

## Worker B Implementation Summary

### Completed Features (Worker B - UI Heavy)

#### Phase B1: AI Prompts Page ✅
- **Location:** `src/pages/ai-prompts/AIPromptsPage.tsx`
- **API Client:** `src/api/prompts-client.ts`
- **Features:**
  - 4-tab interface for different prompt types (Resume, Cover Letter, Scraping, Matching)
  - Variable interpolation with `{{variable}}` syntax
  - Real-time variable extraction and preview
  - Save and reset to defaults functionality
  - Editor-only access protection
- **Types:** Uses `PromptConfig`, `PromptType` from shared types

#### Phase B2: Job Finder Config Page ✅
- **Location:** `src/pages/job-finder-config/JobFinderConfigPage.tsx`
- **Features:**
  - 3-tab interface (Stop List, Queue Settings, AI Settings)
  - Stop List CRUD operations for companies, keywords, domains
  - Queue settings configuration (concurrency, retries, timeouts)
  - AI model settings (model, temperature, max tokens, top_p)
  - Editor-only access protection
- **API Methods:** `getStopList`, `updateStopList`, `getQueueSettings`, `updateQueueSettings`, `getAISettings`, `updateAISettings`

#### Phase B3: Document History Page ✅
- **Location:** `src/pages/document-history/DocumentHistoryPage.tsx`
- **Features:**
  - Document list with search by title/company
  - Filter by type (resume/cover letter)
  - Sort by date, title, or company
  - Download documents as PDF/DOCX
  - Delete with confirmation dialog
  - Empty state handling
- **API Methods:** `getDocumentHistory`, `deleteDocument`, `downloadDocument`

#### Phase B4: Settings Page ✅
- **Location:** `src/pages/settings/SettingsPage.tsx`
- **Features:**
  - Account information display with role badges
  - Theme switcher (light/dark) with localStorage persistence
  - User defaults editor (resume style, font, AI settings override)
  - Save functionality with success/error alerts
- **API Methods:** `getUserDefaults`, `updateUserDefaults`

#### Phase B5: E2E Test Suite ✅
- **Location:** `e2e/` directory
- **Configuration:** `playwright.config.ts`
- **Test Files:**
  - `authentication.spec.ts` - Auth flows and route protection
  - `job-finder.spec.ts` - Job submission and queue status
  - `job-applications.spec.ts` - Job matches and filtering
  - `document-builder.spec.ts` - Document generation flow
  - `accessibility.spec.ts` - A11y compliance tests
  - `configuration.spec.ts` - Config pages testing
- **Helpers:** `e2e/fixtures/helpers.ts` with mock utilities
- **Note:** Tests use `test.skip()` for unauthenticated states

#### Phase B6: CI/CD Pipeline ✅
- **Location:** `.github/workflows/`
- **Workflows:**
  - `ci.yml` - Lint, type-check, test, build, E2E tests (on PR/push)
  - `deploy-staging.yml` - Auto-deploy to staging (on push to staging branch)
  - `deploy-production.yml` - Auto-deploy to production (on push to main branch)
- **Documentation:** `.github/workflows/README.md` with setup instructions
- **Note:** Uses committed .env files, requires Firebase service account secret

#### Phase B7: Documentation ✅
- **Updated Files:**
  - `README.md` - Enhanced with new features and scripts
  - `API.md` - Complete API client documentation
  - `ARCHITECTURE.md` - System architecture and patterns
  - `CLAUDE.md` - Worker B implementation summary (this section)
- **Key Documentation:**
  - All API clients with method signatures and examples
  - Architecture patterns and data flow diagrams
  - Testing strategy and examples
  - Deployment architecture and security considerations

### API Clients Created/Enhanced

1. **PromptsClient** (`src/api/prompts-client.ts`)
   - CRUD operations for AI prompts
   - Default prompts constant
   - Variable extraction utilities

2. **ConfigClient** (enhanced)
   - Stop list management
   - Queue settings management
   - AI settings management

3. **GeneratorClient** (enhanced)
   - User defaults CRUD

### Components Created

1. **UI Components:**
   - `src/components/ui/checkbox.tsx` - Added for Worker A's queue management

2. **Page Components:**
   - `src/pages/ai-prompts/AIPromptsPage.tsx`
   - Updated: `src/pages/job-finder-config/JobFinderConfigPage.tsx`
   - Updated: `src/pages/document-history/DocumentHistoryPage.tsx`
   - Updated: `src/pages/settings/SettingsPage.tsx`

### Router Updates

- Moved AI Prompts route to editor-only protected routes section
- All new pages properly integrated with route protection

### Dependencies Added

- `@playwright/test` - E2E testing framework
- `@radix-ui/react-checkbox` - Checkbox primitive for UI

### Test Scripts Added

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed",
"test:e2e:debug": "playwright test --debug"
```

## Future Enhancements

- [x] Add E2E tests (Playwright) - COMPLETED Worker B
- [x] Add comprehensive documentation - COMPLETED Worker B
- [ ] Add unit tests coverage to 80%+
- [ ] Add Storybook for component development
- [ ] Add performance monitoring
- [ ] Add error tracking (Sentry)
- [ ] Add analytics
- [ ] Add PWA support
- [ ] Add accessibility testing with axe-playwright
