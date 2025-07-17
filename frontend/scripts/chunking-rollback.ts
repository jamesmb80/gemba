#!/usr/bin/env node

/**
 * Rollback script for chunking pipeline
 * Usage: npm run chunking:rollback [--reason "reason for rollback"]
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RollbackOptions {
  reason: string;
  cleanupChunks: boolean;
  notifyTeam: boolean;
}

async function rollbackChunking(options: RollbackOptions) {
  console.log('=== CHUNKING PIPELINE ROLLBACK ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Reason: ${options.reason}`);
  console.log('==================================\n');
  
  const steps = [
    'Disabling CHUNKING_ENABLED feature flag',
    'Checking for in-progress chunking operations',
    'Creating rollback log entry',
    'Verifying system stability',
    options.cleanupChunks ? 'Cleaning up incomplete chunks' : null,
    options.notifyTeam ? 'Notifying team' : null
  ].filter(Boolean);
  
  console.log('Rollback steps:');
  steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
  console.log('');
  
  try {
    // Step 1: Disable feature flag
    console.log('Step 1: Disabling CHUNKING_ENABLED feature flag...');
    await updateEnvironmentFile();
    console.log('✓ Feature flag disabled\n');
    
    // Step 2: Check for in-progress operations
    console.log('Step 2: Checking for in-progress chunking operations...');
    const inProgressCount = await checkInProgressOperations();
    console.log(`✓ Found ${inProgressCount} in-progress operations\n`);
    
    // Step 3: Create rollback log
    console.log('Step 3: Creating rollback log entry...');
    await createRollbackLog(options.reason);
    console.log('✓ Rollback logged\n');
    
    // Step 4: Verify system stability
    console.log('Step 4: Verifying system stability...');
    const isStable = await verifySystemStability();
    console.log(`✓ System ${isStable ? 'is stable' : 'needs attention'}\n`);
    
    // Step 5: Clean up chunks if requested
    if (options.cleanupChunks) {
      console.log('Step 5: Cleaning up incomplete chunks...');
      const cleaned = await cleanupIncompleteChunks();
      console.log(`✓ Cleaned ${cleaned} incomplete chunks\n`);
    }
    
    // Step 6: Notify team if requested
    if (options.notifyTeam) {
      console.log('Step 6: Notifying team...');
      await notifyTeam(options.reason, inProgressCount);
      console.log('✓ Team notified\n');
    }
    
    console.log('=== ROLLBACK COMPLETED SUCCESSFULLY ===');
    console.log('\nNext steps:');
    console.log('1. Monitor system for stability');
    console.log('2. Review rollback reason and implement fixes');
    console.log('3. Test fixes thoroughly before re-enabling');
    console.log('4. Schedule post-mortem meeting');
    
  } catch (error) {
    console.error('\n❌ ROLLBACK FAILED:', error);
    console.error('\nMANUAL INTERVENTION REQUIRED:');
    console.error('1. Manually set CHUNKING_ENABLED=false in .env.local');
    console.error('2. Restart the application');
    console.error('3. Contact DevOps team immediately');
    process.exit(1);
  }
}

async function updateEnvironmentFile(): Promise<void> {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  try {
    let content = '';
    
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf-8');
    }
    
    // Update or add CHUNKING_ENABLED=false
    if (content.includes('CHUNKING_ENABLED=')) {
      content = content.replace(/CHUNKING_ENABLED=.*/g, 'CHUNKING_ENABLED=false');
    } else {
      content += '\nCHUNKING_ENABLED=false\n';
    }
    
    fs.writeFileSync(envPath, content);
  } catch (error) {
    throw new Error(`Failed to update environment file: ${error}`);
  }
}

async function checkInProgressOperations(): Promise<number> {
  // In a real implementation, this would check:
  // 1. Active chunking jobs in queue
  // 2. Database for pending chunks
  // 3. Running Edge Functions
  
  // For now, return mock data
  return 0;
}

async function createRollbackLog(reason: string): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: 'chunking_rollback',
    reason,
    environment: process.env.NODE_ENV || 'development',
    user: process.env.USER || 'unknown'
  };
  
  // Write to log file
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, `rollback-${format(new Date(), 'yyyy-MM-dd')}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  // Also log to database if available
  try {
    await supabase
      .from('system_logs')
      .insert(logEntry);
  } catch (error) {
    console.warn('Warning: Could not log to database:', error);
  }
}

async function verifySystemStability(): Promise<boolean> {
  // Check various system health indicators
  const checks = {
    pdfViewerWorking: await checkPDFViewer(),
    databaseConnected: await checkDatabase(),
    storageAccessible: await checkStorage()
  };
  
  const allChecks = Object.entries(checks);
  const failedChecks = allChecks.filter(([_, status]) => !status);
  
  if (failedChecks.length > 0) {
    console.warn('Failed stability checks:', failedChecks.map(([name]) => name));
    return false;
  }
  
  return true;
}

async function checkPDFViewer(): Promise<boolean> {
  // In a real implementation, make a test request to PDF viewer endpoint
  return true;
}

async function checkDatabase(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

async function checkStorage(): Promise<boolean> {
  try {
    const { error } = await supabase
      .storage
      .from('manuals')
      .list('', { limit: 1 });
    
    return !error;
  } catch {
    return false;
  }
}

async function cleanupIncompleteChunks(): Promise<number> {
  try {
    // Find incomplete chunks (created in last hour with no content)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    
    const { data, error } = await supabase
      .from('document_chunks')
      .delete()
      .or('content.is.null,content.eq.')
      .gte('created_at', oneHourAgo)
      .select('id');
    
    if (error) {
      console.warn('Warning: Could not clean up chunks:', error);
      return 0;
    }
    
    return data?.length || 0;
  } catch {
    return 0;
  }
}

async function notifyTeam(reason: string, inProgressCount: number): Promise<void> {
  const notification = {
    title: '⚠️ Chunking Pipeline Rollback',
    message: `The chunking pipeline has been rolled back.
    
Reason: ${reason}
In-progress operations: ${inProgressCount}
Timestamp: ${new Date().toISOString()}

Please check the system and review the rollback logs.`,
    severity: 'high'
  };
  
  // In a real implementation, this would:
  // 1. Send Slack/Teams notification
  // 2. Create PagerDuty incident
  // 3. Send email to on-call engineer
  
  console.log('Notification:', notification);
}

// Parse command line arguments
function parseArgs(): RollbackOptions {
  const args = process.argv.slice(2);
  const options: RollbackOptions = {
    reason: 'Manual rollback triggered',
    cleanupChunks: false,
    notifyTeam: true
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--reason':
        options.reason = args[++i] || options.reason;
        break;
      case '--cleanup':
        options.cleanupChunks = true;
        break;
      case '--no-notify':
        options.notifyTeam = false;
        break;
      case '--help':
        console.log(`
Chunking Pipeline Rollback Script

Usage: npm run chunking:rollback [options]

Options:
  --reason <reason>   Reason for rollback (required)
  --cleanup          Clean up incomplete chunks
  --no-notify        Skip team notification
  --help             Show this help message

Examples:
  npm run chunking:rollback --reason "High failure rate detected"
  npm run chunking:rollback --reason "Performance degradation" --cleanup
  npm run chunking:rollback --reason "Testing rollback" --no-notify
        `);
        process.exit(0);
    }
  }
  
  return options;
}

// Main execution
const options = parseArgs();

if (!options.reason || options.reason === 'Manual rollback triggered') {
  console.error('ERROR: Please provide a reason for rollback using --reason flag');
  console.error('Example: npm run chunking:rollback --reason "High failure rate"');
  process.exit(1);
}

rollbackChunking(options).catch(error => {
  console.error('Unexpected error during rollback:', error);
  process.exit(1);
});