#!/usr/bin/env node

/**
 * Quick test script to verify chunking pipeline functionality
 */

const { DocumentChunker } = require('../src/lib/chunking/algorithm');

console.log('Testing Document Chunking Pipeline...\n');

try {
  // Create a test document
  const testDocument = [
    {
      text: `
GEMBA Manufacturing Manual
Model: TEST-1000
Version: 1.0

SAFETY WARNING: Always disconnect power before servicing.

1. Installation
Required tools:
- Torque wrench
- Multimeter
- Safety equipment

2. Maintenance
Daily: Check oil level
Weekly: Inspect belts
Monthly: Replace filters

Part Numbers:
- Oil Filter: OF-12345
- Air Filter: AF-67890
      `,
      pageNumber: 1
    }
  ];

  // Initialize chunker
  console.log('1. Initializing DocumentChunker...');
  const chunker = new DocumentChunker({
    chunkSize: 500,
    overlap: 100
  });
  console.log('✓ Chunker initialized\n');

  // Process document
  console.log('2. Processing test document...');
  const chunks = chunker.chunkDocument(
    'test-doc-1',
    'test-tenant',
    testDocument,
    'TEST-1000 Manual',
    'GEMBA Manufacturing'
  );
  console.log(`✓ Document processed into ${chunks.length} chunks\n`);

  // Verify results
  console.log('3. Verifying results...');
  
  if (chunks.length === 0) {
    throw new Error('No chunks created!');
  }

  const firstChunk = chunks[0];
  console.log('First chunk ID:', firstChunk.id);
  console.log('Content preview:', firstChunk.content.substring(0, 100) + '...');
  console.log('Metadata:', {
    documentTitle: firstChunk.metadata.documentContext?.documentTitle,
    manufacturerName: firstChunk.metadata.documentContext?.manufacturerName,
    equipmentModel: firstChunk.metadata.documentContext?.equipmentModel,
    warnings: firstChunk.metadata.semanticContext?.warnings?.length || 0,
    parts: firstChunk.metadata.semanticContext?.entities?.filter(e => e.type === 'part').length || 0
  });

  console.log('\n✓ All tests passed!');
  console.log('\nSummary:');
  console.log(`- Chunks created: ${chunks.length}`);
  console.log(`- Warnings detected: ${chunks.filter(c => c.metadata.semanticContext?.warnings?.length > 0).length}`);
  console.log(`- Parts detected: ${chunks.filter(c => c.metadata.semanticContext?.entities?.some(e => e.type === 'part')).length}`);
  
} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}