# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial React application scaffold with Vite
- TypeScript configuration for type safety
- Tailwind CSS + shadcn/ui for styling
- React Router for client-side routing
- Firebase SDK integration (Auth, Firestore)
- Authentication context and protected routes
- Page scaffolds for all planned features:
  - Job Finder (job submission)
  - Job Applications (match results)
  - Document Builder (AI resume/cover letter)
  - Content Items (experience/skills management)
  - AI Prompts (prompt customization)
  - Document History (generated documents)
  - Queue Management (admin job queue)
  - Settings (user preferences)
  - How It Works (documentation)
- Complete CI/CD pipeline with GitHub Actions
  - Automated deployment to staging on push to `staging` branch
  - Automated deployment to production on push to `main` branch
  - PR checks for linting, testing, and building
- Firebase Hosting configuration with security headers
- Makefile for common development tasks
- Comprehensive documentation:
  - CLAUDE.md - Claude Code guidance
  - CONTEXT.md - Architectural decisions
  - CONTRIBUTING.md - Development workflow
  - README.md - Project overview
- Environment variable templates (.env.example, .env.template)
- ESLint and Prettier configuration
- Claude Code configuration (.claude/settings.json)

## [0.1.0] - 2025-10-19

### Initial Release

**Project Structure:**
- Modern React application with Vite build system
- TypeScript for type safety
- Tailwind CSS + shadcn/ui component library
- React Router v6 for client-side routing
- Firebase integration for auth and data
- CI/CD with GitHub Actions
- Firebase Hosting deployment

**Features:**
- Standalone frontend for job search automation
- Integration points for Portfolio backend (AI generation)
- Integration points for Job-Finder Python service (scraping)
- Real-time data synchronization via Firestore
- Protected routes with Firebase Auth
- Responsive design with mobile-first approach

**Development Infrastructure:**
- Automated testing pipeline
- Automated deployment pipeline
- Local development with hot module replacement
- Firebase emulator support
- Comprehensive documentation
