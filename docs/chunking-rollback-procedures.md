# Document Chunking Pipeline - Rollback Procedures

## Overview

This document outlines the rollback procedures for the document chunking pipeline feature in GembaFix. The chunking pipeline processes PDF manuals into intelligent chunks for improved search and AI-powered assistance.

## Feature Flag

- **Flag Name**: `CHUNKING_ENABLED`
- **Default Value**: `false`
- **Priority**: High
- **Location**: Environment variable and feature flag system

## Rollback Triggers

The chunking feature should be rolled back if any of the following conditions are met:

### 1. Performance Degradation
- **Trigger**: PDF upload processing time exceeds 5 minutes for a 500-page document
- **Threshold**: 3 consecutive timeouts or 5 timeouts within 1 hour
- **Detection**: Monitor `ChunkingService` logs for performance warnings

### 2. High Failure Rate
- **Trigger**: Chunking failure rate exceeds 5%
- **Threshold**: Calculated over last 100 chunking attempts
- **Detection**: Use `getChunkingFailureRate()` from `withFeatureFlag.ts`

### 3. PDF Viewer Breakage
- **Trigger**: Existing PDF viewer functionality stops working
- **Threshold**: Any confirmed breakage of core functionality
- **Detection**: User reports or automated UI tests

### 4. Memory/Resource Issues
- **Trigger**: Server memory usage spikes or out-of-memory errors
- **Threshold**: Memory usage exceeds 85% during chunking
- **Detection**: Server monitoring alerts

### 5. Data Corruption
- **Trigger**: Chunks are created with invalid or corrupted data
- **Threshold**: Any instance of data corruption
- **Detection**: Quality validation failures in chunking pipeline

## Rollback Steps

### Immediate Rollback (Emergency)

1. **Disable Feature Flag**
   ```bash
   # Set environment variable
   export CHUNKING_ENABLED=false
   
   # Or update .env file
   echo "CHUNKING_ENABLED=false" >> .env.local
   ```

2. **Stop Background Jobs**
   - If using queue system, pause chunking jobs
   - Cancel any in-progress chunking operations

3. **Notify Team**
   ```bash
   # Send alert to team
   echo "ALERT: Chunking pipeline rolled back due to [REASON]" | notify-team
   ```

### Controlled Rollback

1. **Monitor Current State**
   ```typescript
   // Check current metrics
   import { getChunkingFailureRate, getRecentChunkingMetrics } from '@/lib/chunking/withFeatureFlag';
   
   const failureRate = getChunkingFailureRate();
   const recentMetrics = getRecentChunkingMetrics(20);
   console.log(`Current failure rate: ${failureRate}%`);
   console.log('Recent metrics:', recentMetrics);
   ```

2. **Disable for New Documents**
   - Set `CHUNKING_ENABLED=false`
   - Allow existing chunks to remain
   - Monitor system stability

3. **Clean Up Failed Chunks** (if needed)
   ```sql
   -- Identify failed chunking attempts
   SELECT dc.* FROM document_chunks dc
   WHERE dc.created_at > NOW() - INTERVAL '1 hour'
   AND dc.content IS NULL OR dc.content = '';
   
   -- Remove invalid chunks
   DELETE FROM document_chunks
   WHERE content IS NULL OR content = '';
   ```

4. **Verify PDF Viewer**
   - Test manual viewing functionality
   - Ensure no regression in existing features

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Chunking Performance**
   ```typescript
   // Monitor in ChunkingService
   const msPerPage = duration / pagesProcessed;
   const projected500PageTime = msPerPage * 500;
   
   if (projected500PageTime > 300000) { // 5 minutes
     // Alert: Performance degradation detected
   }
   ```

2. **Failure Rate**
   ```typescript
   // Check failure rate periodically
   const failureRate = getChunkingFailureRate();
   if (failureRate > 5) {
     // Alert: High failure rate detected
   }
   ```

3. **Resource Usage**
   - Monitor server CPU during chunking
   - Track memory usage patterns
   - Watch for disk I/O spikes

### Alert Configuration

```typescript
// Example monitoring setup
export function monitorChunkingHealth() {
  const interval = setInterval(() => {
    const failureRate = getChunkingFailureRate();
    const recentMetrics = getRecentChunkingMetrics(10);
    
    // Check failure rate
    if (failureRate > 5) {
      console.error('[ALERT] Chunking failure rate exceeded 5%:', failureRate);
      // Trigger rollback procedure
    }
    
    // Check for timeouts
    const timeouts = recentMetrics.filter(m => 
      !m.success && m.error?.includes('timeout')
    ).length;
    
    if (timeouts >= 3) {
      console.error('[ALERT] Multiple chunking timeouts detected:', timeouts);
      // Trigger rollback procedure
    }
  }, 60000); // Check every minute
  
  return () => clearInterval(interval);
}
```

## Data Preservation

During rollback, ensure:

1. **Existing PDF files remain accessible**
   - PDF storage in Supabase Storage is independent
   - Manual viewing should continue to work

2. **Partial chunks are handled**
   - Mark incomplete chunks with status flag
   - Prevent partial data from being used

3. **User experience is maintained**
   - Fallback to original PDF viewer
   - No visible errors to end users

## Recovery Procedures

After resolving issues:

1. **Identify Root Cause**
   - Review error logs
   - Analyze performance metrics
   - Check resource utilization

2. **Implement Fixes**
   - Address performance bottlenecks
   - Fix memory leaks
   - Resolve data corruption issues

3. **Test Thoroughly**
   ```bash
   # Run chunking tests
   npm run test:chunking
   
   # Test with sample documents
   npm run test:chunking:integration
   
   # Performance test
   npm run test:chunking:performance
   ```

4. **Gradual Re-enablement**
   - Enable for small subset of users
   - Monitor metrics closely
   - Gradually increase rollout

## Communication Plan

### Internal Communication
1. Alert development team immediately
2. Document issue in incident report
3. Schedule post-mortem meeting

### User Communication
- If visible impact: "We're currently experiencing issues with document processing. Your manuals remain accessible."
- If no visible impact: No user communication needed

## Testing Rollback Procedures

Regular testing ensures rollback procedures work when needed:

1. **Monthly Rollback Drill**
   - Simulate failure condition
   - Execute rollback steps
   - Verify system recovery

2. **Automated Tests**
   ```typescript
   describe('Rollback procedures', () => {
     it('should handle feature flag disable gracefully', async () => {
       // Enable chunking
       process.env.CHUNKING_ENABLED = 'true';
       
       // Start chunking operation
       const promise = chunkingService.chunkDocument(...);
       
       // Disable mid-operation
       process.env.CHUNKING_ENABLED = 'false';
       
       // Verify graceful handling
       await expect(promise).rejects.toThrow();
     });
   });
   ```

## Appendix: Quick Reference

### Emergency Contacts
- Lead Developer: [Contact]
- DevOps Team: [Contact]
- Product Owner: [Contact]

### Quick Commands
```bash
# Disable chunking
export CHUNKING_ENABLED=false

# Check failure rate
npm run chunking:metrics

# View recent errors
npm run chunking:errors

# Run rollback script
npm run chunking:rollback
```

### Rollback Checklist
- [ ] Set CHUNKING_ENABLED=false
- [ ] Stop background jobs
- [ ] Notify team
- [ ] Monitor system stability
- [ ] Test PDF viewer functionality
- [ ] Document incident
- [ ] Schedule post-mortem

---

Last Updated: 2025-01-16
Version: 1.0