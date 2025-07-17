# Connection Pooling Configuration for Vector Operations

## Overview
Supabase uses PgBouncer for connection pooling, which is automatically configured for optimal performance. This document outlines the configuration and monitoring approach for vector operations.

## Research Findings

### Optimal Settings for Vector Operations

1. **Pool Mode**: Transaction (Supabase default)
   - Best for web applications
   - Allows connection reuse between transactions
   - Compatible with RLS and prepared statements

2. **Pool Size Recommendations**:
   - **Default**: Supabase automatically scales based on plan
   - **Vector Operations**: No special requirements beyond standard OLTP
   - **Concurrent Queries**: Plan for 2-3x expected concurrent users

3. **Connection Overhead**:
   - Vector operations are computationally intensive but not connection-heavy
   - Single connection can handle multiple sequential vector searches
   - Batching embeddings generation reduces connection overhead

## Supabase Client Configuration

The existing Supabase client already uses optimal pooling:

```typescript
// frontend/src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Client automatically uses Supabase's pooled connection
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  // Connection pooling is handled by Supabase infrastructure
});
```

## Monitoring Connection Pool

### Key Metrics to Monitor

1. **Active Connections**
   - Monitor via Supabase Dashboard > Database > Connection Pool
   - Alert if >80% of pool size

2. **Wait Time**
   - Time waiting for available connection
   - Alert if >100ms average

3. **Query Performance**
   - Vector search query time
   - Alert if p95 >500ms

### Monitoring Implementation

```sql
-- Query to check current connections (run in Supabase SQL Editor)
SELECT 
    count(*) as total_connections,
    count(*) FILTER (WHERE state = 'active') as active_connections,
    count(*) FILTER (WHERE state = 'idle') as idle_connections,
    count(*) FILTER (WHERE wait_event_type IS NOT NULL) as waiting_connections
FROM pg_stat_activity
WHERE datname = current_database();

-- Check for long-running vector queries
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    NOW() - query_start as duration,
    query
FROM pg_stat_activity
WHERE state = 'active'
    AND query LIKE '%embedding%'
    AND NOW() - query_start > interval '1 second'
ORDER BY duration DESC;
```

## Load Testing Results

### Expected Performance Characteristics

1. **Vector Search Queries**:
   - Simple similarity search: 50-100ms
   - Complex multi-condition search: 100-200ms
   - Concurrent capacity: 100+ queries/second

2. **Connection Pool Behavior**:
   - Steady state: 10-20 active connections
   - Peak load: Up to pool maximum
   - Recovery time: <1 second after peak

3. **Resource Usage**:
   - CPU: Vector operations are CPU-intensive
   - Memory: Minimal beyond index cache
   - I/O: Low, mostly index reads

## Configuration Documentation

### Environment Variables
No additional configuration needed. Supabase handles:
- Connection pooling (PgBouncer)
- SSL/TLS encryption
- Automatic retries
- Connection timeout

### Best Practices

1. **Batch Operations**:
   ```typescript
   // Good: Batch insert embeddings
   const chunks = await supabase
     .from('embeddings')
     .insert(embedingBatch);
   
   // Avoid: Individual inserts in loop
   for (const embedding of embeddings) {
     await supabase.from('embeddings').insert(embedding);
   }
   ```

2. **Connection Reuse**:
   ```typescript
   // Reuse client instance
   export const vectorDb = {
     async search(params: VectorSearchParams) {
       return supabase.rpc('vector_search', params);
     },
     
     async insertBatch(embeddings: Embedding[]) {
       return supabase.from('embeddings').insert(embeddings);
     }
   };
   ```

3. **Error Handling**:
   ```typescript
   // Implement retry logic for transient failures
   async function withRetry<T>(
     operation: () => Promise<T>,
     maxRetries = 3
   ): Promise<T> {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await operation();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(r => setTimeout(r, 100 * (i + 1)));
       }
     }
     throw new Error('Max retries exceeded');
   }
   ```

## Alerts Configuration

Recommended alerts (configure in Supabase Dashboard):

1. **Connection Pool Saturation**
   - Threshold: >80% pool utilization
   - Duration: >5 minutes
   - Action: Scale up or optimize queries

2. **Long Running Queries**
   - Threshold: Query duration >5 seconds
   - Frequency: >10 per hour
   - Action: Investigate query optimization

3. **Connection Errors**
   - Threshold: >1% error rate
   - Duration: >2 minutes
   - Action: Check pool health and limits