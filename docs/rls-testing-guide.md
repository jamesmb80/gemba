# RLS Testing Guide for Multi-Tenant Isolation

## Overview
Row Level Security (RLS) policies ensure complete data isolation between tenants. All policies use the tenant_id from the JWT token to filter data automatically.

## Policy Implementation

### Embeddings Table Policies
1. **SELECT**: Only rows where `tenant_id` matches JWT claim
2. **INSERT**: Only allows inserting with matching `tenant_id`
3. **UPDATE**: Only can update own tenant's rows
4. **DELETE**: Only can delete own tenant's rows

### Document Chunks Table Policies
- Identical policy structure to embeddings table
- Ensures chunk metadata is also tenant-isolated

## Testing RLS Policies

### Manual Testing Steps

1. **Create Test Users with Different Tenants**
   ```javascript
   // In Supabase Dashboard or via API
   // User 1: tenant_id = 'tenant-123'
   // User 2: tenant_id = 'tenant-456'
   ```

2. **Test Data Insertion**
   ```sql
   -- As User 1 (tenant-123)
   INSERT INTO document_chunks (tenant_id, document_id, chunk_index, chunk_type)
   VALUES ('tenant-123', gen_random_uuid(), 1, 'text');
   -- Should succeed

   -- Attempt to insert for different tenant
   INSERT INTO document_chunks (tenant_id, document_id, chunk_index, chunk_type)
   VALUES ('tenant-456', gen_random_uuid(), 1, 'text');
   -- Should fail
   ```

3. **Test Data Selection**
   ```sql
   -- As User 1 (tenant-123)
   SELECT * FROM document_chunks;
   -- Should only see tenant-123 records

   -- As User 2 (tenant-456)
   SELECT * FROM document_chunks;
   -- Should only see tenant-456 records (none if no data)
   ```

4. **Test Cross-Tenant Access Prevention**
   ```sql
   -- As User 1, try to update User 2's data
   UPDATE document_chunks 
   SET chunk_type = 'modified' 
   WHERE tenant_id = 'tenant-456';
   -- Should return 0 rows affected
   ```

### Integration Test Example

```typescript
// frontend/src/lib/db/__tests__/vector.test.ts
import { createClient } from '@supabase/supabase-js';

describe('RLS Multi-tenant Isolation', () => {
  let tenant1Client: any;
  let tenant2Client: any;

  beforeEach(() => {
    // Create clients with different tenant JWTs
    tenant1Client = createClient(url, key, {
      auth: { jwt: createJwtWithTenant('tenant-123') }
    });
    
    tenant2Client = createClient(url, key, {
      auth: { jwt: createJwtWithTenant('tenant-456') }
    });
  });

  test('tenant can only see own data', async () => {
    // Insert data as tenant 1
    const { data: inserted } = await tenant1Client
      .from('document_chunks')
      .insert({ 
        tenant_id: 'tenant-123',
        document_id: 'doc-1',
        chunk_index: 1,
        chunk_type: 'text'
      });

    // Try to read as tenant 2
    const { data: tenant2Data } = await tenant2Client
      .from('document_chunks')
      .select();
    
    expect(tenant2Data).toHaveLength(0);

    // Read as tenant 1
    const { data: tenant1Data } = await tenant1Client
      .from('document_chunks')
      .select();
    
    expect(tenant1Data).toHaveLength(1);
    expect(tenant1Data[0].tenant_id).toBe('tenant-123');
  });
});
```

## Monitoring RLS Effectiveness

1. **Query Logs**: Monitor Supabase logs for any queries without tenant filters
2. **Performance**: RLS adds minimal overhead with proper indexes
3. **Audit**: Periodically verify no cross-tenant data access

## Troubleshooting

### Common Issues
1. **"new row violates row-level security policy"**
   - Ensure tenant_id in INSERT matches JWT claim
   - Verify JWT contains tenant_id claim

2. **No data returned**
   - Check JWT has correct tenant_id
   - Verify data exists for that tenant

3. **Performance degradation**
   - Ensure tenant_id columns are indexed
   - Monitor query plans for sequential scans