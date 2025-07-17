# GembaFix Deployment Setup Guide

## Overview
This guide walks you through the complete deployment setup for GembaFix, from account creation to production deployment.

---

## Step 1: Vercel Account and Project Setup

### 1.1 Create Vercel Account

**User Actions:**
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub" (recommended)
3. Authorize Vercel to access your GitHub account
4. Complete the signup process

### 1.2 Install Vercel CLI

**User Actions:**
1. Open your terminal
2. Run: `npm install -g vercel`
3. Verify installation: `vercel --version`

### 1.3 Connect Your Project

**User Actions:**
1. Navigate to your project directory: `cd /Users/jamesbryant1/Desktop/GembaFix`
2. Run: `vercel link`
3. When prompted:
   - Confirm this is the correct directory: **Yes**
   - Select your Vercel scope (your username/team)
   - Link to existing project? **No** (we're creating new)
   - Project name: `gembafix` (or your preferred name)
   - Which directory is your code located? `./frontend`

**Technical Implementation:**
After linking, I'll create the Vercel configuration file for you.

### 1.4 Configure Project Settings

**User Actions:**
1. Go to https://vercel.com/dashboard
2. Click on your `gembafix` project
3. Go to "Settings" tab
4. Under "General":
   - Framework Preset: **Next.js**
   - Node.js Version: **20.x**
   - Build & Output Settings:
     - Build Command: `cd frontend && npm run build`
     - Output Directory: `frontend/.next`
     - Install Command: `cd frontend && npm install`

---

## Step 2: Supabase Production Environment Setup

### 2.1 Create Supabase Account

**User Actions:**
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### 2.2 Create New Project

**User Actions:**
1. Click "New project"
2. Fill in:
   - Organization: Create new or select existing
   - Project name: `gembafix-prod`
   - Database Password: **Generate a strong password and save it securely!**
   - Region: Choose closest to your users (e.g., US East)
   - Pricing Plan: Start with Free, upgrade as needed
3. Click "Create new project" (takes ~2 minutes)

### 2.3 Enable pgvector Extension

**User Actions:**
1. Once project is ready, go to "Database" → "Extensions"
2. Search for "vector"
3. Toggle ON the pgvector extension
4. Confirm the enable action

### 2.4 Get Project Credentials

**User Actions:**
1. Go to "Settings" → "API"
2. Copy and save these values:
   - Project URL: `https://[your-project-ref].supabase.co`
   - Anon/Public Key: `eyJ...` (long string)
   - Service Role Key: `eyJ...` (different long string) **KEEP THIS SECRET!**

### 2.5 Install Supabase CLI

**User Actions:**
1. Install via npm: `npm install -g supabase`
2. Verify: `supabase --version`
3. Login: `supabase login`
4. Follow the browser authentication flow

---

## Step 3: Environment Variables Configuration

### 3.1 Local Environment Setup

**User Actions:**
1. Create `frontend/.env.local` file
2. Copy this template and fill with your values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your service role key)

# API Keys
ANTHROPIC_API_KEY=sk-ant-... (your Anthropic API key)

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# Feature Flags
CHUNKING_ENABLED=false
VECTOR_SEARCH_ENABLED=false
```

### 3.2 Vercel Environment Variables

**User Actions:**
1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environment: ✓ Production, ✓ Preview, ✓ Development
   - Click "Save"

4. Repeat for all variables:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Sensitive - be careful!)
   - `ANTHROPIC_API_KEY` (⚠️ Sensitive)
   - `NEXT_PUBLIC_APP_URL` (use your production domain)
   - `NEXT_PUBLIC_ENVIRONMENT` (set to "production")
   - `CHUNKING_ENABLED` (set to "false")
   - `VECTOR_SEARCH_ENABLED` (set to "false")

**Alternative Method (CLI):**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste your value when prompted
# Repeat for each variable
```

---

## Step 4: GitHub Actions CI/CD Setup

### 4.1 Get Required Secrets

**User Actions:**

1. **Get Vercel Token:**
   - Go to https://vercel.com/account/tokens
   - Click "Create Token"
   - Name: `gembafix-deploy`
   - Scope: Full Access
   - Copy the token

2. **Get Vercel IDs:**
   - Run: `vercel project ls`
   - Note your Project ID
   - Run: `vercel team ls`
   - Note your Org/Team ID

3. **Get Supabase Access Token:**
   - Go to https://supabase.com/dashboard/account/tokens
   - Click "Generate new token"
   - Name: `gembafix-ci`
   - Copy the token

### 4.2 Add GitHub Secrets

**User Actions:**
1. Go to your GitHub repository
2. Navigate to "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret" for each:

   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your Vercel org/team ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
   - `SUPABASE_ACCESS_TOKEN`: Your Supabase access token
   - `SUPABASE_PROJECT_REF`: Your Supabase project reference (the part before .supabase.co)
   - `SUPABASE_URL`: Full Supabase URL
   - `SUPABASE_ANON_KEY`: Your anon key

### 4.3 Create GitHub Actions Workflow

**Technical Implementation:**
I'll create the workflow file for you after you've added the secrets.

---

## Step 5: Database Migration

### 5.1 Link Supabase Project

**User Actions:**
1. In your terminal, navigate to project root
2. Run: `supabase link --project-ref [your-project-ref]`
3. When prompted, confirm the link

### 5.2 Run Migrations

**User Actions:**
1. Check migration status: `supabase migration list`
2. Push migrations: `supabase db push`
3. Verify in Supabase dashboard under "Database" → "Tables"

---

## Step 6: Initial Deployment

### 6.1 Pre-deployment Checks

**User Actions:**
1. Ensure all environment variables are set in Vercel
2. Verify your code builds locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. Fix any build errors before proceeding

### 6.2 Deploy to Vercel

**User Actions:**

**Option A - Via CLI:**
```bash
vercel --prod
```

**Option B - Via Git Push:**
1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: initial production deployment"
   git push origin main
   ```
2. Vercel will auto-deploy from your main branch

### 6.3 Verify Deployment

**User Actions:**
1. Go to your Vercel dashboard
2. Click on the deployment
3. Check the deployment logs for errors
4. Click "Visit" to see your live site
5. Test basic functionality:
   - Homepage loads
   - Authentication works
   - No console errors

---

## Post-Deployment Checklist

**User Actions:**
1. [ ] Update `NEXT_PUBLIC_APP_URL` in Vercel to your production domain
2. [ ] Configure custom domain (if you have one):
   - Vercel Dashboard → Settings → Domains
   - Add your domain and follow DNS instructions
3. [ ] Set up monitoring alerts in Vercel
4. [ ] Enable Vercel Analytics (optional but recommended)
5. [ ] Test all critical user flows
6. [ ] Set up error alerting (optional)

---

## Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check Node version matches locally and on Vercel
   - Ensure all dependencies are in package.json
   - Check for TypeScript errors

2. **Supabase Connection Fails:**
   - Verify environment variables are correct
   - Check Supabase project is active
   - Ensure service role key is only used server-side

3. **Deployment Stuck:**
   - Check Vercel build logs
   - Verify GitHub Actions has correct permissions
   - Ensure all secrets are properly set

---

## Next Steps

Once deployed:
1. Monitor application performance
2. Set up regular database backups
3. Configure alerting for errors
4. Plan feature flag rollout strategy
5. Set up staging environment (optional)

Need help with any step? I'm here to assist!