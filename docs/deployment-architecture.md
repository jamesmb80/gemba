# GembaFix Deployment Architecture

## Document Information
- **Version**: 1.0
- **Date**: January 17, 2025
- **Author**: Winston (System Architect)
- **Status**: Production Ready

## Executive Summary

This document outlines the deployment architecture for GembaFix, a modern manufacturing troubleshooting application. The architecture leverages Vercel for frontend hosting, Supabase for database and vector storage, and GitHub Actions for CI/CD, providing a scalable, secure, and maintainable production environment.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Vercel Frontend Hosting](#vercel-frontend-hosting)
4. [Supabase Backend Infrastructure](#supabase-backend-infrastructure)
5. [Environment Configuration](#environment-configuration)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Security Architecture](#security-architecture)
8. [Monitoring & Observability](#monitoring--observability)
9. [Disaster Recovery](#disaster-recovery)
10. [Cost Optimization](#cost-optimization)

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Production Environment                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐        ┌─────────────────┐                 │
│  │                 │        │                 │                 │
│  │     Vercel      │◄──────►│    Supabase     │                 │
│  │   (Frontend)    │        │   (Backend)     │                 │
│  │                 │        │                 │                 │
│  └────────┬────────┘        └────────┬────────┘                 │
│           │                           │                          │
│           ▼                           ▼                          │
│  ┌─────────────────┐        ┌─────────────────┐                 │
│  │   Edge Network  │        │  PostgreSQL +   │                 │
│  │   (CDN/Cache)   │        │    pgvector     │                 │
│  └─────────────────┘        └─────────────────┘                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │
                    ┌───────────┴───────────┐
                    │    GitHub Actions     │
                    │      (CI/CD)          │
                    └───────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Hosting**: Vercel (Frontend), Supabase (Backend)
- **Database**: PostgreSQL with pgvector extension
- **Authentication**: Supabase Auth (JWT-based)
- **File Storage**: Supabase Storage
- **Vector Search**: pgvector for embeddings
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics, Supabase Dashboard

## Architecture Components

### 1. Frontend Layer (Vercel)
- Next.js application with App Router
- Server-side rendering (SSR) and static generation
- Edge functions for API routes
- Global CDN distribution

### 2. Backend Layer (Supabase)
- PostgreSQL database with pgvector
- Real-time subscriptions
- Row Level Security (RLS)
- Edge functions for serverless compute

### 3. Integration Layer
- RESTful APIs
- WebSocket connections for real-time features
- JWT-based authentication

## Vercel Frontend Hosting

### Configuration

Create `vercel.json` in the project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "devCommand": "cd frontend && npm run dev",
  "regions": ["iad1"],
  "functions": {
    "frontend/src/app/api/anthropic-proxy/route.ts": {
      "maxDuration": 60
    },
    "frontend/src/app/api/pdf/[...path]/route.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "ANTHROPIC_API_KEY": "@anthropic-api-key"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Deployment Process

1. **Connect Repository**
   ```bash
   vercel link
   vercel env pull
   ```

2. **Configure Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add ANTHROPIC_API_KEY
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Performance Optimizations

- **Image Optimization**: Automatic via Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Edge Caching**: Static assets cached at edge locations
- **Compression**: Automatic Brotli compression

## Supabase Backend Infrastructure

### Database Schema

```sql
-- Core Tables
├── auth.users (Supabase Auth)
├── public.machines
├── public.sessions
├── public.messages
├── public.manuals
├── public.embeddings (pgvector)
└── public.document_chunks

-- Indexes
├── embeddings_embedding_idx (IVFFlat)
├── embeddings_tenant_id_idx
├── embeddings_document_id_idx
└── document_chunks_document_id_idx
```

### Vector Storage Configuration

```sql
-- pgvector setup
CREATE EXTENSION vector;

-- Embedding storage (1536 dimensions for OpenAI ada-002)
CREATE TABLE embeddings (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    embedding vector(1536),
    chunk_text TEXT,
    chunk_metadata JSONB
);

-- IVFFlat index for similarity search
CREATE INDEX embeddings_embedding_idx ON embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Row Level Security (RLS)

```sql
-- Tenant isolation
CREATE POLICY "Tenant isolation for embeddings" ON embeddings
    FOR ALL
    USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);
```

### Edge Functions

Deploy Supabase Edge Functions:

```bash
supabase functions deploy process-pdf
```

Function configuration:
```typescript
// supabase/functions/process-pdf/index.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}
```

## Environment Configuration

### Production Environment Variables

```bash
# .env.production (Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
ANTHROPIC_API_KEY=[anthropic-api-key]

# Feature Flags
NEXT_PUBLIC_ENVIRONMENT=production
CHUNKING_ENABLED=false
VECTOR_SEARCH_ENABLED=false

# Security
NEXT_PUBLIC_APP_URL=https://gembafix.com
NODE_ENV=production
```

### Configuration Management

1. **Environment-specific configs**
   ```typescript
   // frontend/src/config/environment.ts
   export const config = {
     api: {
       baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
       timeout: 30000,
       retries: 3
     },
     features: {
       chunking: process.env.CHUNKING_ENABLED === 'true',
       vectorSearch: process.env.VECTOR_SEARCH_ENABLED === 'true'
     }
   }
   ```

2. **Feature Flag System**
   ```typescript
   // frontend/src/lib/featureFlags.ts
   export const isFeatureEnabled = (flag: string): boolean => {
     return process.env[`NEXT_PUBLIC_${flag}`] === 'true'
   }
   ```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm run test:unit
          npm run lint
          npm run type-check
      
      - name: Build application
        run: |
          cd frontend
          npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend

  database:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Run migrations
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### Deployment Stages

1. **Development**: Feature branches → Preview deployments
2. **Staging**: `develop` branch → Staging environment
3. **Production**: `main` branch → Production deployment

### Rollback Strategy

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Database rollback
supabase db reset --linked
supabase migration repair --status reverted [version]
```

## Security Architecture

### Authentication & Authorization

1. **JWT-based Authentication**
   - Supabase Auth handles user sessions
   - JWTs include tenant_id for multi-tenancy
   - 24-hour token expiration

2. **API Security**
   ```typescript
   // Middleware for API routes
   export async function middleware(request: NextRequest) {
     const token = request.headers.get('authorization')
     
     if (!token) {
       return new Response('Unauthorized', { status: 401 })
     }
     
     const { data, error } = await supabase.auth.getUser(token)
     if (error) {
       return new Response('Invalid token', { status: 401 })
     }
   }
   ```

3. **Environment Security**
   - Sensitive keys only in server-side environment
   - Service role key never exposed to client
   - CORS properly configured

### Data Protection

1. **Encryption**
   - TLS 1.3 for all connections
   - At-rest encryption in Supabase
   - Encrypted environment variables

2. **Access Control**
   - Row Level Security (RLS) for tenant isolation
   - API rate limiting
   - Input validation and sanitization

## Monitoring & Observability

### Application Monitoring

1. **Vercel Analytics**
   ```typescript
   // frontend/src/app/layout.tsx
   import { Analytics } from '@vercel/analytics/react'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

2. **Error Tracking**
   ```typescript
   // frontend/src/lib/errorReporting.ts
   export function reportError(error: Error, context?: any) {
     console.error('Application Error:', error, context)
     // Send to monitoring service
   }
   ```

3. **Performance Metrics**
   - Core Web Vitals tracking
   - API response time monitoring
   - Database query performance

### Logging Strategy

```typescript
// Structured logging
const log = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({ 
      level: 'info', 
      message, 
      data, 
      timestamp: new Date().toISOString() 
    }))
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      error: error?.stack || error, 
      timestamp: new Date().toISOString() 
    }))
  }
}
```

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Daily automated backups (Supabase)
   - Point-in-time recovery (7 days)
   - Geographic redundancy

2. **Code Backups**
   - Git repository (GitHub)
   - Deployment snapshots (Vercel)

### Recovery Procedures

1. **Database Recovery**
   ```bash
   # Restore from backup
   supabase db restore --backup [backup-id]
   ```

2. **Application Recovery**
   ```bash
   # Rollback deployment
   vercel rollback [deployment-id]
   ```

### RTO/RPO Targets

- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 24 hours

## Cost Optimization

### Resource Allocation

1. **Vercel (Frontend)**
   - Pro plan: $20/month per member
   - Bandwidth: 1TB included
   - Serverless executions: 1000 hours included

2. **Supabase (Backend)**
   - Pro plan: $25/month
   - Database: 8GB included
   - Storage: 100GB included
   - Vector operations: Pay-per-use

### Optimization Strategies

1. **Caching**
   - Static asset caching at edge
   - API response caching where appropriate
   - Database query result caching

2. **Resource Scaling**
   - Auto-scaling for serverless functions
   - Database connection pooling
   - Lazy loading for frontend assets

3. **Cost Monitoring**
   ```typescript
   // Track API usage
   export async function trackApiUsage(endpoint: string) {
     await supabase
       .from('api_usage')
       .insert({ 
         endpoint, 
         timestamp: new Date(), 
         cost: calculateCost(endpoint) 
       })
   }
   ```

## Deployment Checklist

### Pre-Deployment

- [ ] Run full test suite
- [ ] Update environment variables
- [ ] Review security configurations
- [ ] Check database migrations
- [ ] Verify feature flags are disabled

### Deployment

- [ ] Deploy database migrations
- [ ] Deploy application to Vercel
- [ ] Verify health endpoints
- [ ] Run smoke tests
- [ ] Monitor error rates

### Post-Deployment

- [ ] Enable feature flags gradually
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Verify backup systems
- [ ] Update documentation

## Appendix

### Useful Commands

```bash
# Vercel
vercel dev              # Local development
vercel deploy           # Deploy preview
vercel --prod          # Deploy production
vercel env pull        # Pull environment variables

# Supabase
supabase start         # Local development
supabase db push       # Push migrations
supabase functions deploy  # Deploy edge functions
supabase gen types     # Generate TypeScript types

# GitHub Actions
gh workflow run deploy.yml  # Manually trigger deployment
gh run list               # List workflow runs
```

### References

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

---

This deployment architecture provides a robust, scalable, and secure foundation for the GembaFix manufacturing troubleshooting application, with clear paths for growth and optimization.