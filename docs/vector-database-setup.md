# Vector Database Setup Documentation

## pgvector Extension

### Version Information
- **Extension**: pgvector
- **Expected Version**: Latest available in Supabase (typically 0.5.0+)
- **Vector Dimensions**: 1536 (configured for OpenAI ada-002 embeddings)

### Capabilities

#### Distance Metrics
1. **Cosine Distance** (`<->`) - Default, best for normalized embeddings
2. **Euclidean Distance** (`<#>`) - L2 distance
3. **Inner Product** (`<@>`) - Dot product similarity

#### Index Types
- **IVFFlat**: Currently configured with 100 lists for initial deployment
  - Good for up to 1M vectors
  - Faster build time
  - Slightly lower recall
- **HNSW**: Available for future scaling
  - Better for >1M vectors
  - Higher memory usage
  - Better recall

#### Key Functions
- `vector_dims()`: Get dimensions of a vector
- `vector_norm()`: Calculate vector magnitude
- Vector arithmetic: Addition, subtraction, scalar multiplication

### Performance Characteristics
- **Query Speed**: Sub-100ms for similarity search on <1M vectors with IVFFlat
- **Index Build Time**: Linear with number of vectors
- **Memory Usage**: ~4KB per vector (1536 dimensions * 4 bytes/float32)

### Scaling Considerations
1. **Current Setup**: IVFFlat with 100 lists
   - Optimal for 10K-1M vectors
   - Reindex recommended at 1M vectors

2. **Future Scaling**:
   - Switch to HNSW index for >1M vectors
   - Increase lists parameter: sqrt(n) where n = number of vectors
   - Consider partitioning by tenant for very large deployments

### Multi-tenant Isolation
- Row Level Security (RLS) enforced at database level
- Tenant ID extracted from JWT token
- All queries automatically filtered by tenant
- No cross-tenant data access possible

### Connection Pooling
- Supabase manages connection pooling automatically
- PgBouncer in transaction mode
- Default pool size suitable for vector operations
- Monitor active connections via Supabase dashboard

### Rollback Procedures
1. **Feature Flag**: `VECTOR_SEARCH_ENABLED` controls vector search activation
2. **Quick Disable**: Set feature flag to false
3. **Full Rollback**: 
   ```sql
   DROP TABLE IF EXISTS embeddings CASCADE;
   DROP TABLE IF EXISTS document_chunks CASCADE;
   DROP EXTENSION IF EXISTS vector;
   ```

### Monitoring
- Query performance: Monitor p95 latency
- Index efficiency: Track sequential scans vs index scans
- Memory usage: Monitor via Supabase dashboard
- Connection pool saturation: Alert if >80% utilized