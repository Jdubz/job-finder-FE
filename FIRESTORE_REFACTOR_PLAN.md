# Firestore Direct Access Refactor Plan

## Overview
Refactor frontend to use direct Firestore access instead of Cloud Functions API for improved performance and simplicity.

## Architecture Benefits
- **Performance**: No Cloud Functions round-trip latency
- **Real-time**: Native Firestore listeners for live updates
- **Cost**: Reduced Cloud Functions invocations
- **Simplicity**: Less abstraction layers

## Security Approach
- Leverage existing Firestore Security Rules (`firestore.rules`)
- Use role-based access control (viewer, editor, admin)
- Validate all writes with strict field-level rules
- Read-only access for worker-managed collections (job-matches, companies)

## Type Safety
- Use `@jsdubzw/job-finder-shared-types` for all Firestore documents
- Runtime validation with type guards
- Compile-time type checking

## Collections Refactored

### ✅ Already Using Direct Firestore
- `job-finder-config/ai-prompts` - via `prompts-client.ts`

### 🔄 To Refactor to Direct Firestore

#### 1. **content-items** Collection
- **Current**: `content-items-client.ts` (API calls)
- **New**: `src/services/firestore/content-items.service.ts`
- **Types**: `ContentItemDocument` from shared-types
- **Security**: Editor can CRUD own items
- **Features**: Hierarchy support, filtering, reordering

#### 2. **job-matches** Collection
- **Current**: `job-matches-client.ts` (API calls)
- **New**: `src/services/firestore/job-matches.service.ts`
- **Types**: `JobMatchDocument` from shared-types
- **Security**: Read-only from FE (worker writes only)
- **Features**: Real-time listeners, filtering, pagination

#### 3. **job-queue** Collection
- **Current**: `job-queue-client.ts` (API calls)
- **New**: `src/services/firestore/job-queue.service.ts`
- **Types**: `QueueItemDocument` from shared-types
- **Security**: Users can CRUD own pending items
- **Features**: Status tracking, retry management

#### 4. **job-finder-config** Collection (expand)
- **Current**: Partially in `prompts-client.ts`, `config-client.ts`
- **New**: Consolidate into `src/services/firestore/config.service.ts`
- **Security**: Authenticated read, editor/admin write

### 🚫 Keep as Cloud Functions API

#### **generator** Endpoints
- **Why**: Requires server-side AI processing (OpenAI/Gemini API)
- **Keep**: `generator-client.ts`
- **Routes**:
  - `POST /generator/generate` - Document generation
  - `GET /generator/requests/:id` - Poll generation status

#### **system-health** Endpoints
- **Why**: Server-side metrics and monitoring
- **Keep**: `system-health-client.ts`

## Implementation Steps

### Phase 1: Create Firestore Services (Week 1)
1. Create `src/services/firestore/` directory
2. Implement `content-items.service.ts`
3. Implement `job-matches.service.ts`
4. Implement `job-queue.service.ts`
5. Consolidate `config.service.ts`

### Phase 2: Update Pages (Week 1-2)
1. Refactor `ContentItemsPage.tsx` to use new service
2. Refactor `JobApplicationsPage.tsx` for job-matches
3. Refactor `QueueManagementPage.tsx` for job-queue
4. Update all other consumers

### Phase 3: Security Hardening (Week 2)
1. Review and tighten `firestore.rules`
2. Add field-level validation
3. Restrict `job-finder-config` write to admin-only (except ai-prompts)
4. Add comprehensive test suite for security rules

### Phase 4: Cleanup (Week 2)
1. Remove deprecated API clients
2. Remove unused API routes from backend
3. Update documentation
4. Performance testing

## Security Rules Changes Needed

### Current Issue: `job-finder-config` Too Permissive
```javascript
// BEFORE (line 262)
allow write: if isEditor() || isAdmin();

// AFTER - More granular
match /job-finder-config/{configId} {
  allow read: if isAuthenticated();

  // AI prompts can be edited by editors
  allow write: if configId == 'ai-prompts' && isEditor();

  // All other config requires admin
  allow write: if isAdmin();
}
```

### Add Timestamp Validation on Updates
```javascript
function hasValidUpdateTimestamps() {
  return request.resource.data.updatedAt is timestamp &&
         request.resource.data.updatedAt > resource.data.updatedAt;
}
```

## Testing Strategy
1. Unit tests for each Firestore service
2. Security rules emulator tests
3. Integration tests with emulator
4. Manual security penetration testing

## Rollout Strategy
1. Feature flag new services (parallel run with API)
2. Monitor for errors/performance
3. Gradual migration page by page
4. Remove old API clients after 1 week stability

## Metrics to Track
- Read latency (Firestore vs API)
- Write success rate
- Security rule violations
- Cloud Functions cost reduction
- Page load times

## Files to Create
```
src/services/firestore/
├── content-items.service.ts
├── job-matches.service.ts
├── job-queue.service.ts
├── config.service.ts
├── types.ts (re-export from shared-types)
└── utils.ts (timestamp conversion, etc)
```

## Files to Modify
- All pages using API clients
- `src/api/index.ts` - update exports

## Files to Delete (after migration)
- `src/api/content-items-client.ts`
- `src/api/job-matches-client.ts`
- `src/api/job-queue-client.ts`
- `src/api/config-client.ts`

## Risk Mitigation
1. **Data Loss**: Use Firestore transactions for critical writes
2. **Security Bypass**: Comprehensive rules testing before deployment
3. **Performance Regression**: Monitor and optimize queries
4. **Rollback Plan**: Keep API clients until proven stable
