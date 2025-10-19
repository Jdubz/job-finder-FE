# GitHub Actions CI/CD Configuration

This directory contains GitHub Actions workflows for the job-finder-app frontend.

## Workflows

### 1. CI Workflow (`ci.yml`)

Runs on every pull request and push to main/staging/develop branches.

**Jobs:**
- **Lint**: Runs ESLint and Prettier checks
- **Type Check**: Validates TypeScript types
- **Test**: Runs unit tests with Vitest
- **Build**: Builds the application with Vite
- **E2E**: Runs Playwright end-to-end tests on Chromium and Firefox

**Required Secrets:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_BASE_URL`

### 2. Staging Deployment (`deploy-staging.yml`)

Automatically deploys to Firebase Hosting staging environment when code is pushed to the `staging` branch.

**Environment:** `staging`
**URL:** https://staging.job-finder-app.web.app

**Additional Secrets:**
- `VITE_API_BASE_URL_STAGING`
- `FIREBASE_SERVICE_ACCOUNT_STAGING`
- `FIREBASE_PROJECT_ID`

### 3. Production Deployment (`deploy-production.yml`)

Automatically deploys to Firebase Hosting production environment when code is pushed to the `main` branch.

**Environment:** `production`
**URL:** https://job-finder-app.web.app

**Features:**
- Runs tests before deployment
- Creates GitHub release for each deployment
- Sends notifications on success/failure

**Additional Secrets:**
- `VITE_API_BASE_URL_PRODUCTION`
- `FIREBASE_SERVICE_ACCOUNT_PRODUCTION`
- `FIREBASE_PROJECT_ID`

## Setting Up Secrets

### In GitHub Repository Settings:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

#### Firebase Configuration (for all environments):
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
FIREBASE_PROJECT_ID=your-project-id
```

#### API URLs:
```
VITE_API_BASE_URL=https://api.job-finder-app.com
VITE_API_BASE_URL_STAGING=https://staging-api.job-finder-app.com
VITE_API_BASE_URL_PRODUCTION=https://api.job-finder-app.com
```

#### Firebase Service Accounts:
```
FIREBASE_SERVICE_ACCOUNT_STAGING=<staging-service-account-json>
FIREBASE_SERVICE_ACCOUNT_PRODUCTION=<production-service-account-json>
```

### Getting Firebase Service Account JSON:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Copy the entire JSON content
6. Paste it as a GitHub secret (as a single-line string)

## Branch Protection Rules

It's recommended to set up branch protection for `main` and `staging`:

1. Go to **Settings** → **Branches**
2. Add rule for `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass: `lint`, `type-check`, `test`, `build`
   - ✅ Require branches to be up to date
3. Add rule for `staging`:
   - ✅ Require status checks to pass: `lint`, `build`

## Manual Deployment

You can manually trigger deployments using the "workflow_dispatch" event:

1. Go to **Actions** tab
2. Select the workflow (Deploy to Staging/Production)
3. Click **Run workflow**
4. Select the branch
5. Click **Run workflow**

## Monitoring

Check deployment status:
- **Actions Tab**: View all workflow runs
- **Environments**: View deployment history and URLs
- **Firebase Console**: Check hosting deployment details

## Troubleshooting

### Build fails with "Module not found"
- Check that all dependencies are listed in `package.json`
- Verify import paths are correct

### E2E tests fail
- Check if Firebase emulator is needed for auth
- Verify test environment variables are set
- Review Playwright traces in artifacts

### Deployment fails
- Verify Firebase service account has correct permissions
- Check Firebase project quotas
- Ensure `.firebaserc` has correct project targets

## Local Testing of Workflows

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act

# Test CI workflow
act pull_request

# Test with secrets
act -s VITE_FIREBASE_API_KEY=xxx pull_request
```
