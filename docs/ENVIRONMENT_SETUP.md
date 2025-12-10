# Environment Setup Guide

This guide explains how to set up your local development environment for Property Passport UK v7.0.

## Prerequisites

- Node.js ≥20.19.6 (use `nvm use 20` if using nvm)
- Supabase CLI installed and linked to your project
- Git (for version control)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ppuk-v7-mvp-main
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Environment Variables

Copy the example environment file and fill in your values:

```bash
# From project root
cp .env.example .env.local
```

Edit `.env.local` with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test Environment Setup

For Playwright E2E tests, create a test-specific environment file:

```bash
cp .env.example .env.test.local
```

Update `.env.test.local` with test Supabase credentials:

```env
SUPABASE_TEST_URL=https://your-test-project.supabase.co
SUPABASE_TEST_ANON_KEY=your-test-anon-key
SUPABASE_TEST_SERVICE_ROLE_KEY=your-test-service-role-key
SUPABASE_SERVICE_ROLE_USER_ID=service-role-user-id
NODE_ENV=test
PLAYWRIGHT_TEST=true
```

## Supabase Project Configuration

### Link to Supabase Project

```bash
supabase link --project-ref jarbgvpyudutzeqtazoo
```

### Run Migrations

```bash
supabase db reset
```

This will:
- Apply all migrations from `supabase/migrations/`
- Run seed data from `supabase/seed.sql`
- Set up storage buckets and policies

### Verify Setup

```bash
# Check Supabase connection
supabase status

# Verify schema
supabase db diff --linked
```

## Local Development

### Start Development Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

### Run Tests

```bash
# E2E tests
npm run test:e2e

# RLS tests
npm run test:rls

# Integration tests
npm run test:integration
```

## Environment Variables Reference

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (safe for client-side)

### Optional Variables

- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only, never commit)
- `NODE_ENV` - Environment mode (`development`, `production`, `test`)
- `PLAYWRIGHT_TEST` - Set to `true` when running Playwright tests

### Test-Specific Variables

- `SUPABASE_TEST_URL` - Test Supabase project URL
- `SUPABASE_TEST_ANON_KEY` - Test anonymous key
- `SUPABASE_TEST_SERVICE_ROLE_KEY` - Test service role key
- `SUPABASE_SERVICE_ROLE_USER_ID` - Service role user ID for test cleanup

## Security Notes

⚠️ **Never commit `.env.local` or any file containing actual credentials to version control.**

The `.gitignore` file is configured to exclude:
- `.env*` files
- `.env.local`
- `.env.*.local`

Always use `.env.example` as a template and fill in your own values locally.

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Verify all environment variables are set:
   ```bash
   cat .env.local
   ```

2. Check Node version:
   ```bash
   node --version  # Should be ≥20.19.6
   ```

3. Clear Next.js cache:
   ```bash
   rm -rf frontend/.next
   npm run build
   ```

### Supabase Connection Issues

1. Verify Supabase project is linked:
   ```bash
   supabase status
   ```

2. Check Supabase credentials in `.env.local`

3. Verify network connectivity to Supabase

### Test Failures

1. Ensure test environment variables are set in `.env.test.local`
2. Verify test Supabase project has seed data:
   ```bash
   supabase db reset
   ```
3. Check Playwright configuration in `frontend/playwright.config.ts`

## Next Steps

After environment setup:

1. Review [README.md](README.md) for project overview
2. Check [REPO_STRUCTURE.md](REPO_STRUCTURE.md) for codebase organization
3. Read [PPUK_V7_COMPLETE_BLUEPRINT_V2.md](PPUK_V7_COMPLETE_BLUEPRINT_V2.md) for architecture details

