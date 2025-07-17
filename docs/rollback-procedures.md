# Vector Database Rollback Procedures

## Overview
This document outlines the procedures for rolling back the vector database infrastructure in case of issues.

## Rollback Triggers

### Critical Triggers (Immediate Rollback)
1. **Database Performance Degradation**
   - Query performance degrades >20% from baseline
   - CPU usage consistently >90%
   - Memory pressure causing OOM errors

2. **Data Integrity Issues**
   - Cross-tenant data leakage detected
   - RLS policies not enforcing properly
   - Foreign key constraints violated

3. **Service Availability**
   - Database connection failures >5% of requests
   - pgvector extension causing crashes
   - Blocking queries from vector operations

### Warning Triggers (Monitor Closely)
1. **Performance Concerns**
   - Vector search latency >500ms (p95)
   - Index rebuild taking >1 hour
   - Connection pool saturation >80%

2. **Resource Usage**
   - Memory usage increase >50%
   - Disk usage growing rapidly
   - High number of idle connections

## Rollback Procedures

### Quick Rollback (Feature Flag)

**Time to Execute**: <1 minute
**Data Loss**: None

1. **Disable Vector Search**
   ```bash
   # Set environment variable
   export VECTOR_SEARCH_ENABLED=false
   
   # Or update .env file
   VECTOR_SEARCH_ENABLED=false
   ```

2. **Verify Disabled**
   ```typescript
   // Application should fall back to non-vector search
   import { isFeatureEnabled } from '@/lib/featureFlags';
   console.log('Vector search enabled:', isFeatureEnabled('VECTOR_SEARCH_ENABLED'));
   ```

### Partial Rollback (Keep Tables, Disable Usage)

**Time to Execute**: 5-10 minutes
**Data Loss**: None (data preserved)

1. **Disable Feature Flag** (as above)

2. **Drop Indexes Only**
   ```sql
   -- Drop vector indexes to improve performance
   DROP INDEX IF EXISTS embeddings_embedding_idx;
   
   -- Keep data tables for future re-enablement
   ```

3. **Monitor Performance**
   - Check query performance
   - Monitor resource usage

### Full Rollback (Complete Removal)

**Time to Execute**: 15-30 minutes
**Data Loss**: All vector embeddings and chunks

1. **Create Backup** (Optional but Recommended)
   ```sql
   -- Export data if needed for future
   COPY (SELECT * FROM embeddings) TO '/tmp/embeddings_backup.csv' CSV HEADER;
   COPY (SELECT * FROM document_chunks) TO '/tmp/chunks_backup.csv' CSV HEADER;
   ```

2. **Disable Feature Flag**
   ```bash
   export VECTOR_SEARCH_ENABLED=false
   ```

3. **Execute Rollback Script**
   ```bash
   # Run the rollback SQL
   psql $DATABASE_URL -f supabase/migrations/rollback_pgvector.sql
   ```

4. **Verify Rollback**
   ```sql
   -- Check extension removed
   SELECT * FROM pg_extension WHERE extname = 'vector';
   -- Should return 0 rows
   
   -- Check tables removed
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('embeddings', 'document_chunks');
   -- Should return 0 rows
   ```

5. **Update Application**
   - Deploy with vector features disabled
   - Remove vector-related UI elements

## Monitoring During Rollback

### Key Metrics to Watch

1. **Application Metrics**
   - Error rate
   - Response times
   - User complaints

2. **Database Metrics**
   - Connection count
   - Query performance
   - CPU/Memory usage

3. **Business Metrics**
   - Search functionality working
   - User workflows uninterrupted

### Health Checks

```typescript
// Quick health check
async function verifyRollback() {
  // Check feature flag
  const vectorEnabled = isFeatureEnabled('VECTOR_SEARCH_ENABLED');
  console.log('Vector search enabled:', vectorEnabled);
  
  // Check database connectivity
  const { data, error } = await supabase
    .from('machines')
    .select('count')
    .limit(1);
  
  console.log('Database accessible:', !error);
  
  // Verify vector tables gone (if full rollback)
  const { error: vectorError } = await supabase
    .from('embeddings')
    .select('count')
    .limit(1);
  
  console.log('Vector tables removed:', !!vectorError);
}
```

## Recovery Procedures

### Re-enabling After Rollback

If issues are resolved and you want to re-enable:

1. **Fix Underlying Issues**
   - Address performance problems
   - Resolve data integrity issues
   - Increase resources if needed

2. **Re-apply Migration**
   ```bash
   supabase db push
   ```

3. **Gradual Rollout**
   - Enable for small percentage of users
   - Monitor closely
   - Increase percentage gradually

## Communication Plan

### Internal Team
1. **Immediate**: Slack/Teams notification to engineering
2. **Within 15 min**: Incident report started
3. **Within 1 hour**: Root cause analysis begun

### Users (if Full Rollback)
1. **If Degraded Service**: Status page update
2. **If Feature Removal**: In-app notification
3. **If Data Loss**: Direct communication to affected users

## Post-Rollback Actions

1. **Incident Review**
   - Document what triggered rollback
   - Identify root cause
   - Create action items

2. **Testing Improvements**
   - Add tests for failure scenario
   - Improve monitoring
   - Update rollback procedures

3. **Re-deployment Planning**
   - Address all issues found
   - Plan gradual rollout
   - Enhance monitoring

## Decision Matrix

| Symptom | Severity | Rollback Type | Timeline |
|---------|----------|---------------|----------|
| Search returns no results | High | Feature Flag | Immediate |
| Query timeout >30s | Critical | Full | Within 15 min |
| Memory usage >90% | Critical | Partial | Within 30 min |
| Cross-tenant data leak | Critical | Full | Immediate |
| Slow searches (>1s) | Medium | Monitor | 1-2 hours |
| Index rebuild fails | Medium | Partial | 1 hour |

## Emergency Contacts

- **On-call Engineer**: [Rotation schedule]
- **Database Admin**: [Contact]
- **Product Owner**: [Contact]
- **Supabase Support**: support@supabase.com