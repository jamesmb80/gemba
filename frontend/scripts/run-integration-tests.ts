#!/usr/bin/env node

/**
 * Integration Test Runner for Vector Database + Chunking Pipeline
 * Ensures proper environment setup before running tests
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('');
  log(`${'='.repeat(60)}`, colors.cyan);
  log(title, colors.bright + colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
  console.log('');
}

function runCommand(command: string, description: string): boolean {
  log(`→ ${description}`, colors.blue);
  try {
    execSync(command, { stdio: 'inherit' });
    log('✓ Success', colors.green);
    return true;
  } catch (error) {
    log('✗ Failed', colors.red);
    return false;
  }
}

async function main() {
  logSection('Integration Test Runner - Vector DB + Chunking Pipeline');
  
  // Step 1: Check environment
  log('Checking environment setup...', colors.yellow);
  
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    log('⚠️  .env.local not found. Using default local Supabase settings.', colors.yellow);
    log('   For custom setup, create .env.local with:', colors.yellow);
    log('   NEXT_PUBLIC_SUPABASE_URL=your_url', colors.yellow);
    log('   SUPABASE_SERVICE_ROLE_KEY=your_key', colors.yellow);
  } else {
    log('✓ Environment file found', colors.green);
  }
  
  // Step 2: Check Supabase status
  logSection('Checking Supabase Status');
  
  const supabaseRunning = runCommand(
    'supabase status 2>/dev/null || true',
    'Checking if Supabase is running'
  );
  
  if (!supabaseRunning) {
    log('Supabase not running. Starting it now...', colors.yellow);
    runCommand('supabase start', 'Starting Supabase');
  }
  
  // Step 3: Run migrations
  logSection('Running Database Migrations');
  
  log('Checking for pgvector extension...', colors.yellow);
  const migrationPath = path.join(__dirname, '..', '..', 'supabase', 'migrations', '20250116_pgvector_setup.sql');
  
  if (fs.existsSync(migrationPath)) {
    runCommand(
      'supabase db push --dry-run',
      'Checking migration status'
    );
    
    runCommand(
      'supabase db push',
      'Applying migrations'
    );
  } else {
    log('⚠️  Migration file not found. Please ensure migrations are set up.', colors.yellow);
  }
  
  // Step 4: Run tests
  logSection('Running Integration Tests');
  
  // Test vector database infrastructure
  log('Phase 1: Testing Vector Database Infrastructure', colors.bright);
  runCommand(
    'npx jest src/lib/__tests__/integration/vector-chunking-pipeline.test.ts --testNamePattern="Vector Database Infrastructure" --verbose',
    'Running vector database tests'
  );
  
  // Test chunking pipeline
  log('\nPhase 2: Testing Document Chunking Pipeline', colors.bright);
  runCommand(
    'npx jest src/lib/__tests__/integration/vector-chunking-pipeline.test.ts --testNamePattern="Document Chunking Pipeline" --verbose',
    'Running chunking pipeline tests'
  );
  
  // Test end-to-end integration
  log('\nPhase 3: Testing End-to-End Integration', colors.bright);
  runCommand(
    'npx jest src/lib/__tests__/integration/vector-chunking-pipeline.test.ts --testNamePattern="End-to-End Pipeline Integration" --verbose',
    'Running end-to-end tests'
  );
  
  // Test performance
  log('\nPhase 4: Testing Performance and Scalability', colors.bright);
  runCommand(
    'npx jest src/lib/__tests__/integration/vector-chunking-pipeline.test.ts --testNamePattern="Performance and Scalability" --verbose',
    'Running performance tests'
  );
  
  // Run all tests together for final verification
  logSection('Running All Tests Together');
  
  const allTestsPass = runCommand(
    'npx jest src/lib/__tests__/integration/vector-chunking-pipeline.test.ts --verbose --coverage',
    'Running complete test suite'
  );
  
  // Step 5: Generate report
  logSection('Test Summary');
  
  if (allTestsPass) {
    log('✓ All integration tests passed!', colors.green + colors.bright);
    log('✓ Vector database infrastructure is working', colors.green);
    log('✓ Document chunking pipeline is functioning', colors.green);
    log('✓ End-to-end integration is successful', colors.green);
    log('✓ Performance meets requirements', colors.green);
    
    log('\nThe pipeline is ready for deployment!', colors.green + colors.bright);
  } else {
    log('✗ Some tests failed. Please review the output above.', colors.red + colors.bright);
    log('Common issues to check:', colors.yellow);
    log('- Is Supabase running? (supabase status)', colors.yellow);
    log('- Are migrations applied? (supabase db push)', colors.yellow);
    log('- Are environment variables set correctly?', colors.yellow);
    log('- Is pgvector extension installed?', colors.yellow);
    
    process.exit(1);
  }
  
  // Optional: Run existing chunking tests
  logSection('Running Existing Chunking Tests (Optional)');
  
  log('Running unit tests...', colors.blue);
  runCommand(
    'npx jest src/lib/chunking/__tests__/algorithm.test.ts --verbose',
    'Chunking algorithm unit tests'
  );
  
  log('Running integration tests...', colors.blue);
  runCommand(
    'npx jest src/lib/chunking/__tests__/chunking.integration.test.ts --verbose',
    'Chunking integration tests'
  );
  
  log('Running performance tests...', colors.blue);
  runCommand(
    'npx jest src/lib/chunking/__tests__/chunking.performance.test.ts --verbose',
    'Chunking performance tests'
  );
  
  logSection('All Tests Complete! 🎉');
}

// Run the test suite
main().catch(error => {
  log(`Error: ${error.message}`, colors.red);
  process.exit(1);
});