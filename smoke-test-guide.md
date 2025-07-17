# Smoke Test Guide - Stories 1.1 & 1.2

## Pre-Deployment Verification

### ✅ Build Status
- Application builds successfully with `npm run build`
- No fatal errors in build output
- Feature flags properly configured (both disabled by default)

## Post-Deployment Smoke Tests

### 1. Basic Application Health
- [ ] Application loads at deployment URL
- [ ] No JavaScript errors in browser console
- [ ] User authentication flows work
- [ ] Navigation between pages functions correctly

### 2. Database Connectivity
- [ ] Application connects to Supabase database
- [ ] User sessions are properly stored
- [ ] Basic CRUD operations work (machines, manuals, etc.)

### 3. Feature Flag System
- [ ] Feature flags are disabled by default
- [ ] Feature flag service loads without errors
- [ ] Admin can check feature flag status

### 4. Phase 1: Vector Search Enablement
**After enabling VECTOR_SEARCH_ENABLED flag:**
- [ ] Vector database tables are accessible
- [ ] No errors when vector search system initializes
- [ ] pgvector extension is working
- [ ] Basic vector operations don't crash the app

### 5. Phase 2: Document Chunking Enablement
**After enabling CHUNKING_ENABLED flag:**
- [ ] Document upload interface works
- [ ] PDF processing doesn't crash
- [ ] Chunking pipeline executes without errors
- [ ] Chunks are properly stored in database

## Test Credentials
```
Email: james@example.com
Password: Password
```

## Critical Error Indicators
**Immediate rollback required if:**
- Application doesn't load or shows white screen
- Database connection errors
- User authentication completely broken
- JavaScript errors preventing core functionality

## Performance Benchmarks
- Page load time: < 3 seconds
- Database query time: < 200ms average
- Document processing: < 30 seconds per document
- Vector search: < 1 second per query

## Monitoring URLs
- Application health: `/api/health` (if available)
- Database status: Check Supabase dashboard
- Error logs: Check application logs
- Performance metrics: Monitor API response times

## Rollback Procedure
1. **Disable feature flags** immediately through environment variables
2. **Revert deployment** if application-level issues
3. **Contact development team** if database issues suspected
4. **Document issues** for post-incident analysis

## Success Criteria
- ✅ All basic application functions work
- ✅ No errors in browser console
- ✅ Database operations function correctly
- ✅ Feature flags can be enabled safely
- ✅ Performance meets benchmarks

---

**Run these tests after each deployment and before enabling feature flags.**