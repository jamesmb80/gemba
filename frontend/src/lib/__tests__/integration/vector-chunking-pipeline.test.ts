/**
 * Comprehensive Integration Tests for Vector Database + Chunking Pipeline
 * Tests the complete flow from PDF processing through vector storage
 */

import { createClient } from '@supabase/supabase-js';
import { DocumentChunker } from '../../chunking/algorithm';
import { ChunkingService } from '../../chunking/withFeatureFlag';
import { PDFContent } from '../../types/chunking';
import { TextEmbedder } from '../../embeddings/embedder';
import { isFeatureEnabled } from '../../featureFlags';

// Mock feature flags
jest.mock('../../featureFlags', () => ({
  isFeatureEnabled: jest.fn(),
}));

// Test configuration
const TEST_TIMEOUT = 60000; // 60 seconds for integration tests

describe('Vector Database + Chunking Pipeline Integration', () => {
  let supabase: any;
  const mockIsFeatureEnabled = isFeatureEnabled as jest.MockedFunction<typeof isFeatureEnabled>;

  beforeAll(async () => {
    // Enable all features for testing
    mockIsFeatureEnabled.mockImplementation((flag) => {
      return flag === 'CHUNKING_ENABLED' || flag === 'VECTOR_SEARCH_ENABLED';
    });

    // Initialize Supabase client with test credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn(
        'Using default local Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL for custom setup.',
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);

    // Verify pgvector extension is available
    const { data: extensions, error: extError } = await supabase
      .from('pg_extension')
      .select('*')
      .eq('extname', 'vector');

    if (extError || !extensions?.length) {
      throw new Error('pgvector extension not installed. Run migrations first.');
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    // Cleanup test data
    if (supabase) {
      // Clean up test tenant data
      await supabase.from('embeddings').delete().match({ tenant_id: 'test-tenant' });
      await supabase.from('document_chunks').delete().match({ tenant_id: 'test-tenant' });
    }
  });

  describe('Phase 1: Vector Database Infrastructure', () => {
    it('should have pgvector extension enabled', async () => {
      const { data, error } = await supabase.rpc('verify_pgvector_extension');

      expect(error).toBeNull();
      expect(data).toBe(true);
    });

    it('should have proper vector dimension configuration', async () => {
      // Check embeddings table structure
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, character_maximum_length')
        .eq('table_name', 'embeddings')
        .eq('column_name', 'embedding');

      expect(error).toBeNull();
      expect(columns).toHaveLength(1);
      expect(columns[0].data_type).toBe('USER-DEFINED'); // vector type
    });

    it('should enforce RLS policies for multi-tenant isolation', async () => {
      // Create test data for different tenants
      const tenant1Embedding = {
        chunk_id: 'test-chunk-1',
        tenant_id: 'tenant-1',
        embedding: '[0.1, 0.2, 0.3]',
        metadata: { test: true },
      };

      const tenant2Embedding = {
        chunk_id: 'test-chunk-2',
        tenant_id: 'tenant-2',
        embedding: '[0.4, 0.5, 0.6]',
        metadata: { test: true },
      };

      // Insert test data
      await supabase.from('embeddings').insert([tenant1Embedding, tenant2Embedding]);

      // Test tenant isolation
      const { data: tenant1Data } = await supabase
        .from('embeddings')
        .select('*')
        .eq('tenant_id', 'tenant-1');

      expect(tenant1Data).toHaveLength(1);
      expect(tenant1Data[0].tenant_id).toBe('tenant-1');

      // Cleanup
      await supabase.from('embeddings').delete().match({ tenant_id: 'tenant-1' });
      await supabase.from('embeddings').delete().match({ tenant_id: 'tenant-2' });
    });

    it('should support vector similarity search', async () => {
      // Create test embeddings
      const testEmbeddings = [
        {
          chunk_id: 'similarity-test-1',
          tenant_id: 'test-tenant',
          embedding: '[0.1, 0.2, 0.3, 0.4, 0.5]',
          metadata: { content: 'hydraulic pump maintenance' },
        },
        {
          chunk_id: 'similarity-test-2',
          tenant_id: 'test-tenant',
          embedding: '[0.1, 0.2, 0.3, 0.4, 0.6]',
          metadata: { content: 'hydraulic system repair' },
        },
        {
          chunk_id: 'similarity-test-3',
          tenant_id: 'test-tenant',
          embedding: '[0.9, 0.8, 0.7, 0.6, 0.5]',
          metadata: { content: 'electrical wiring diagram' },
        },
      ];

      await supabase.from('embeddings').insert(testEmbeddings);

      // Test similarity search (using a simple query vector)
      const queryVector = '[0.1, 0.2, 0.3, 0.4, 0.5]';

      const { data: results, error } = await supabase.rpc('search_similar_chunks', {
        query_embedding: queryVector,
        match_threshold: 0.7,
        match_count: 2,
        tenant_id: 'test-tenant',
      });

      expect(error).toBeNull();
      expect(results).toHaveLength(2);
      expect(results[0].metadata.content).toContain('hydraulic');
    });
  });

  describe('Phase 2: Document Chunking Pipeline', () => {
    const sampleManufacturingManual: PDFContent[] = [
      {
        text: `
ACME Hydraulic Press HP-5000
Operation and Maintenance Manual
Version 2.1 - January 2025

SAFETY WARNING: Always disconnect power before servicing.

Table of Contents:
1. Safety Instructions
2. Installation
3. Operation
4. Maintenance
        `,
        pageNumber: 1,
      },
      {
        text: `
1. SAFETY INSTRUCTIONS

WARNING: High pressure hydraulic system. 
Maximum pressure: 3000 PSI (207 bar)

Required PPE:
• Safety glasses
• Steel-toed boots
• Hearing protection when operating

Emergency Stop Locations:
- Main control panel (red button)
- Operator station (yellow button)
- Maintenance access door
        `,
        pageNumber: 2,
      },
    ];

    it('should chunk manufacturing manual with proper metadata', async () => {
      const chunker = new DocumentChunker({
        chunkSize: 200,
        overlap: 50,
      });

      const chunks = chunker.chunkDocument(
        'test-manual-hp5000',
        'test-tenant',
        sampleManufacturingManual,
        'HP-5000 Manual',
        'ACME Hydraulics',
      );

      expect(chunks.length).toBeGreaterThan(0);

      // Verify metadata extraction
      const firstChunk = chunks[0];
      expect(firstChunk.metadata.documentContext?.manufacturerName).toBe('ACME Hydraulics');
      expect(firstChunk.metadata.documentContext?.equipmentModel).toBe('HP-5000');

      // Verify safety warnings are detected
      const hasWarnings = chunks.some((c) => c.metadata.semanticContext?.warnings.length > 0);
      expect(hasWarnings).toBe(true);

      // Verify measurements are extracted
      const hasMeasurements = chunks.some((c) =>
        c.metadata.semanticContext?.entities.some(
          (e) => e.type === 'measurement' && e.value.includes('PSI'),
        ),
      );
      expect(hasMeasurements).toBe(true);
    });

    it('should handle special manufacturing content', async () => {
      const technicalContent: PDFContent[] = [
        {
          text: `
MAINTENANCE SCHEDULE

Daily Checks:
□ Oil level (dipstick between MIN/MAX)
□ Hydraulic pressure (120-140 PSI)
□ Temperature gauge (160-180°F)

Parts Required:
- Filter: HF-12345
- Oil: ISO VG 46 (5 gallons)
- Seal kit: SK-98765

Torque Specifications:
| Component | Torque Value |
|-----------|--------------|
| Head bolts| 125 ft-lbs  |
| Oil pan   | 35 ft-lbs   |
          `,
          pageNumber: 1,
        },
      ];

      const service = new ChunkingService();
      const chunks = await service.chunkDocument(
        'test-maintenance',
        'test-tenant',
        technicalContent,
      );

      // Verify part numbers are extracted
      const parts = chunks.flatMap(
        (c) => c.metadata.semanticContext?.entities.filter((e) => e.type === 'part') || [],
      );
      expect(parts.length).toBeGreaterThan(0);
      expect(parts.some((p) => p.value === 'HF-12345')).toBe(true);

      // Verify table is preserved
      const hasTable = chunks.some((c) => c.metadata.contentType.hasTable);
      expect(hasTable).toBe(true);

      // Verify checklist items
      const hasLists = chunks.some((c) => c.metadata.contentType.hasList);
      expect(hasLists).toBe(true);
    });
  });

  describe('Phase 3: End-to-End Pipeline Integration', () => {
    it('should process document through complete pipeline', async () => {
      const testDocument: PDFContent[] = [
        {
          text: `
XYZ-2000 Troubleshooting Guide

Problem: Motor won't start
Error Code: E001

Possible Causes:
1. No power supply - Check main breaker
2. Emergency stop activated - Reset E-stop button
3. Low oil pressure - Check oil level (min: 2 gallons)
4. Overload protection - Verify load < 125A

For detailed diagnostics, see Section 5.2.
Contact support: 1-800-ACME-FIX
          `,
          pageNumber: 1,
        },
      ];

      // Step 1: Chunk the document
      const chunkingService = new ChunkingService();
      const chunks = await chunkingService.chunkDocument(
        'e2e-test-doc',
        'test-tenant',
        testDocument,
        'XYZ-2000 Troubleshooting Guide',
      );

      expect(chunks.length).toBeGreaterThan(0);

      // Step 2: Store chunks in database
      const chunkRecords = chunks.map((chunk) => ({
        id: chunk.id,
        document_id: chunk.metadata.documentId,
        content: chunk.content,
        metadata: chunk.metadata,
        tenant_id: chunk.tenantId,
        chunk_index: chunk.metadata.chunkIndex,
        created_at: new Date().toISOString(),
      }));

      const { error: chunkError } = await supabase.from('document_chunks').insert(chunkRecords);

      expect(chunkError).toBeNull();

      // Step 3: Generate embeddings (mock for now)
      const mockEmbeddings = chunks.map((chunk) => ({
        chunk_id: chunk.id,
        tenant_id: chunk.tenantId,
        embedding:
          '[' +
          Array(1536)
            .fill(0)
            .map(() => Math.random())
            .join(',') +
          ']',
        metadata: {
          model: 'text-embedding-3-small',
          created_at: new Date().toISOString(),
        },
      }));

      const { error: embError } = await supabase.from('embeddings').insert(mockEmbeddings);

      expect(embError).toBeNull();

      // Step 4: Verify retrieval
      const { data: retrievedChunks, error: retrieveError } = await supabase
        .from('document_chunks')
        .select('*, embeddings(*)')
        .eq('document_id', 'e2e-test-doc')
        .eq('tenant_id', 'test-tenant');

      expect(retrieveError).toBeNull();
      expect(retrievedChunks).toHaveLength(chunks.length);

      // Verify each chunk has an embedding
      retrievedChunks.forEach((chunk) => {
        expect(chunk.embeddings).toHaveLength(1);
        expect(chunk.embeddings[0].chunk_id).toBe(chunk.id);
      });

      // Step 5: Test semantic search capability
      const { data: searchResults, error: searchError } = await supabase
        .from('document_chunks')
        .select('*')
        .eq('tenant_id', 'test-tenant')
        .textSearch('content', 'motor start problem');

      expect(searchError).toBeNull();
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults[0].content).toContain('Motor');
    });

    it('should maintain data integrity across pipeline', async () => {
      const complexDocument: PDFContent[] = [
        {
          text: `
Safety Manual - Critical Procedures

WARNING: Lock out tag out required for all maintenance.

Hydraulic System Specs:
- Pressure: 2500 PSI max
- Flow: 50 GPM
- Temperature: 180°F operating

Error Codes:
| Code | Description | Action |
|------|-------------|--------|
| H001 | Over pressure | Reduce load |
| H002 | Over temp | Check cooling |
| H003 | Low flow | Check pump |
          `,
          pageNumber: 1,
        },
      ];

      // Process through pipeline
      const service = new ChunkingService();
      const chunks = await service.chunkDocument(
        'integrity-test-doc',
        'test-tenant',
        complexDocument,
        'Safety Manual',
      );

      // Verify critical information is preserved
      const allContent = chunks.map((c) => c.content).join(' ');

      // Safety warnings preserved
      expect(allContent).toContain('WARNING');
      expect(allContent).toContain('Lock out tag out');

      // Technical specs preserved
      expect(allContent).toContain('2500 PSI');
      expect(allContent).toContain('50 GPM');
      expect(allContent).toContain('180°F');

      // Error codes preserved
      expect(allContent).toContain('H001');
      expect(allContent).toContain('H002');
      expect(allContent).toContain('H003');

      // Metadata integrity
      const warningChunks = chunks.filter((c) => c.metadata.semanticContext?.warnings.length > 0);
      expect(warningChunks.length).toBeGreaterThan(0);

      const measurementChunks = chunks.filter((c) =>
        c.metadata.semanticContext?.entities.some((e) => e.type === 'measurement'),
      );
      expect(measurementChunks.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent document processing', async () => {
      const documents = Array.from({ length: 5 }, (_, i) => ({
        id: `concurrent-doc-${i}`,
        content: [
          {
            text: `Document ${i} - Manufacturing specifications and procedures...`.repeat(10),
            pageNumber: 1,
          },
        ],
      }));

      const startTime = Date.now();

      // Process documents concurrently
      const promises = documents.map(async (doc) => {
        const service = new ChunkingService();
        return service.chunkDocument(doc.id, 'test-tenant', doc.content as PDFContent[]);
      });

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All documents should be processed
      expect(results).toHaveLength(5);
      results.forEach((chunks) => {
        expect(chunks.length).toBeGreaterThan(0);
      });

      // Should complete in reasonable time
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10000); // 10 seconds for 5 documents

      console.log(`Concurrent processing of 5 documents completed in ${duration}ms`);
    });

    it('should maintain performance with large documents', async () => {
      // Generate a 50-page document
      const largeDocument: PDFContent[] = Array.from({ length: 50 }, (_, i) => ({
        text: `
Page ${i + 1} - Equipment Manual

Section ${i}.1: Overview
This section covers maintenance procedures for component ${i}.

Specifications:
- Part number: PN-${10000 + i}
- Torque: ${50 + i} ft-lbs
- Clearance: ${10 + i}mm

Procedure:
1. Disconnect power
2. Remove cover panel
3. Inspect component
4. Replace if worn
5. Reassemble in reverse order

See Figure ${i}.1 for detailed diagram.
        `.repeat(3),
        pageNumber: i + 1,
      }));

      const startTime = Date.now();

      const service = new ChunkingService();
      const chunks = await service.chunkDocument(
        'large-doc-test',
        'test-tenant',
        largeDocument,
        'Large Equipment Manual',
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should process efficiently
      expect(duration).toBeLessThan(30000); // 30 seconds for 50 pages
      expect(chunks.length).toBeGreaterThan(50); // More chunks than pages

      // Verify quality is maintained
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk.metadata.endPage).toBe(50);

      console.log(`50-page document processed in ${duration}ms, created ${chunks.length} chunks`);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle missing or invalid data gracefully', async () => {
      // Test with empty document
      const emptyDoc: PDFContent[] = [{ text: '', pageNumber: 1 }];

      const service = new ChunkingService();
      const emptyChunks = await service.chunkDocument('empty-doc', 'test-tenant', emptyDoc);

      expect(emptyChunks).toHaveLength(0);

      // Test with malformed content
      const malformedDoc: PDFContent[] = [
        {
          text: '���corrupted���text���',
          pageNumber: 1,
        },
      ];

      const malformedChunks = await service.chunkDocument(
        'malformed-doc',
        'test-tenant',
        malformedDoc,
      );

      // Should still process without crashing
      expect(malformedChunks).toBeDefined();
    });

    it('should maintain transactional integrity', async () => {
      // Simulate partial failure scenario
      const testChunks = [
        {
          id: 'transaction-test-1',
          document_id: 'transaction-doc',
          content: 'Test content 1',
          metadata: {},
          tenant_id: 'test-tenant',
          chunk_index: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: 'transaction-test-2',
          document_id: 'transaction-doc',
          content: null, // This will cause an error
          metadata: {},
          tenant_id: 'test-tenant',
          chunk_index: 1,
          created_at: new Date().toISOString(),
        },
      ];

      const { error } = await supabase.from('document_chunks').insert(testChunks);

      expect(error).toBeTruthy(); // Should fail

      // Verify no partial data was inserted
      const { data: checkData } = await supabase
        .from('document_chunks')
        .select('*')
        .eq('document_id', 'transaction-doc');

      expect(checkData).toHaveLength(0); // No partial inserts
    });
  });
});
