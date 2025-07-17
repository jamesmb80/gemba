# Environment Setup Guide for Vector Database

## Overview
This guide documents the process for setting up vector database infrastructure across development and staging environments.

## Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Access to Supabase project dashboard
- Environment variables configured

## Development Environment Setup

### 1. Apply Migrations

```bash
# Navigate to project root
cd /path/to/GembaFix

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply migrations to development database
supabase db push

# Verify migration was applied
supabase db status
```

### 2. Verify pgvector Installation

```sql
-- Run in Supabase SQL Editor (Development)
-- Check extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Test vector operations
SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector;

-- Verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('embeddings', 'document_chunks');
```

### 3. Environment Variables

Create/update `frontend/.env.local`:
```env
# Development Environment
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key
VECTOR_SEARCH_ENABLED=false
```

## Staging Environment Setup

### 1. Create Staging Project (if not exists)

1. Go to https://app.supabase.com
2. Create new project for staging
3. Note the project URL and keys

### 2. Apply Migrations to Staging

```bash
# Create staging configuration
cp .env.local .env.staging

# Update .env.staging with staging credentials
# NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
# etc...

# Apply migrations to staging
supabase db push --db-url postgresql://postgres:[staging-password]@[staging-host]:5432/postgres
```

### 3. Verify Staging Setup

Run the same verification queries as development in the staging SQL editor.

## Environment-Specific Configuration

### Development Configuration

```typescript
// frontend/src/config/environment.ts
export const config = {
  development: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    vectorSearchEnabled: process.env.VECTOR_SEARCH_ENABLED === 'true',
    vectorIndexLists: 100, // Smaller for dev
    debugMode: true
  },
  staging: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    vectorSearchEnabled: process.env.VECTOR_SEARCH_ENABLED === 'true',
    vectorIndexLists: 100,
    debugMode: false
  },
  production: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    vectorSearchEnabled: process.env.VECTOR_SEARCH_ENABLED === 'true',
    vectorIndexLists: 200, // Larger for production
    debugMode: false
  }
};

export function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  return config[env as keyof typeof config];
}
```

## Testing Across Environments

### Basic Functionality Test

```typescript
// Run this test in each environment
import { vectorDb } from '@/lib/db/vector';

async function testEnvironment() {
  console.log('Testing environment:', process.env.NODE_ENV);
  
  // Test health check
  const health = await vectorDb.healthCheck();
  console.log('Health check:', health);
  
  // Test basic insert (requires auth)
  if (health.connected && health.vectorEnabled) {
    try {
      const testChunk = await vectorDb.insertDocumentChunks([{
        tenant_id: 'test-tenant',
        document_id: 'test-doc',
        chunk_index: 1,
        chunk_type: 'text' as const
      }]);
      console.log('Insert test passed');
      
      // Clean up
      await vectorDb.deleteDocument('test-doc');
    } catch (error) {
      console.error('Insert test failed:', error);
    }
  }
}
```

## Migration Management

### Rolling Back Migrations

If issues occur, rollback procedure:

```sql
-- Rollback script (run in SQL editor)
-- 1. Disable feature flag first
UPDATE app_config SET value = 'false' WHERE key = 'VECTOR_SEARCH_ENABLED';

-- 2. Drop tables (cascades to embeddings)
DROP TABLE IF EXISTS document_chunks CASCADE;

-- 3. Drop extension
DROP EXTENSION IF EXISTS vector;

-- 4. Verify cleanup
SELECT * FROM pg_extension WHERE extname = 'vector';
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('embeddings', 'document_chunks');
```

## Environment Monitoring

### Key Metrics by Environment

| Metric | Development | Staging | Production |
|--------|-------------|---------|------------|
| Max Connections | 50 | 100 | 200+ |
| Vector Index Lists | 100 | 100 | 200 |
| Debug Logging | Enabled | Disabled | Disabled |
| Feature Flags | All enabled | Selective | Conservative |

### Health Checks

```bash
# Development
curl https://your-dev-project.supabase.co/rest/v1/

# Staging  
curl https://your-staging-project.supabase.co/rest/v1/

# Check vector extension specifically
psql [connection-string] -c "SELECT vector_dims('[1,2,3]'::vector);"
```

## Troubleshooting

### Common Issues

1. **Migration fails with "extension not available"**
   - Ensure your Supabase plan supports pgvector
   - Contact Supabase support to enable it

2. **RLS policies blocking operations**
   - Verify JWT contains tenant_id claim
   - Check auth configuration

3. **Performance differences between environments**
   - Compare connection pool settings
   - Check index parameters
   - Verify resource allocation

## Next Steps

After environment setup:
1. Run integration tests in each environment
2. Configure monitoring alerts
3. Document environment-specific URLs
4. Set up CI/CD pipeline for automated deployments