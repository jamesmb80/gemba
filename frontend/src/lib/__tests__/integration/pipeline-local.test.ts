/**
 * Local Integration Tests for Chunking Pipeline
 * Tests the chunking pipeline components without requiring Supabase
 */

import { DocumentChunker } from '../../chunking/algorithm';
import { ChunkingService } from '../../chunking/withFeatureFlag';
import { MetadataEnhancer } from '../../chunking/metadata-enhancer';
import { PDFContent } from '../../types/chunking';
import { isFeatureEnabled } from '../../featureFlags';

// Mock feature flags
jest.mock('../../featureFlags', () => ({
  isFeatureEnabled: jest.fn(),
}));

describe('Local Chunking Pipeline Integration Tests', () => {
  const mockIsFeatureEnabled = isFeatureEnabled as jest.MockedFunction<typeof isFeatureEnabled>;

  beforeEach(() => {
    mockIsFeatureEnabled.mockReturnValue(true);
  });

  describe('Complete Pipeline Flow', () => {
    it('should process a manufacturing manual end-to-end', async () => {
      const manufacturingManual: PDFContent[] = [
        {
          text: `
GEMBA Manufacturing Equipment Manual
Model: GEMBA-5000
Version: 1.0
Date: January 2025

Table of Contents:
1. Safety Instructions
2. Installation Guide
3. Operation Manual
4. Maintenance Schedule
5. Troubleshooting Guide
          `,
          pageNumber: 1,
        },
        {
          text: `
1. SAFETY INSTRUCTIONS

WARNING: High voltage equipment. Risk of electric shock.
CAUTION: Moving parts. Keep hands clear during operation.

Required PPE:
• Safety glasses (ANSI Z87.1)
• Steel-toed boots (ASTM F2413)
• Hearing protection (NRR 25+)

Emergency Procedures:
1. Press emergency stop button
2. Disconnect main power breaker
3. Call maintenance supervisor at ext. 5555
4. Document incident in log book

Critical Safety Parameters:
- Maximum pressure: 3000 PSI
- Operating temperature: 160-180°F
- Voltage: 480V 3-phase
          `,
          pageNumber: 2,
        },
        {
          text: `
4. MAINTENANCE SCHEDULE

Daily Maintenance:
□ Check oil level (should be between MIN/MAX marks)
□ Inspect safety guards for damage
□ Test emergency stop function
□ Record operating parameters in log

Weekly Maintenance:
□ Lubricate bearings (2 pumps of grease)
□ Check belt tension (1/2" deflection)
□ Clean or replace air filters
□ Inspect hydraulic hoses for wear

Parts List:
- Oil filter: OF-12345
- Air filter: AF-67890
- Hydraulic fluid: ISO VG 46
- Bearing grease: NLGI #2

Torque Specifications:
| Component      | Torque Value |
|---------------|--------------|
| Head bolts    | 125 ft-lbs   |
| Cover bolts   | 35 ft-lbs    |
| Drain plug    | 25 ft-lbs    |
          `,
          pageNumber: 3,
        },
      ];

      // Initialize services
      const chunkingService = new ChunkingService();
      const startTime = Date.now();

      // Process document
      const chunks = await chunkingService.chunkDocument(
        'test-manual-gemba-5000',
        'test-tenant',
        manufacturingManual,
        'GEMBA-5000 Equipment Manual',
        'GEMBA Manufacturing',
      );

      const processingTime = Date.now() - startTime;

      // Basic assertions
      expect(chunks).toBeDefined();
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.length).toBeLessThan(20); // Reasonable for 3 pages

      // Performance check
      expect(processingTime).toBeLessThan(5000); // Should process in under 5 seconds

      // Verify chunk structure
      chunks.forEach((chunk, index) => {
        expect(chunk.id).toBe(`test-manual-gemba-5000_chunk_${index}`);
        expect(chunk.tenantId).toBe('test-tenant');
        expect(chunk.content).toBeTruthy();
        expect(chunk.metadata).toBeDefined();
        expect(chunk.relationships).toBeDefined();
      });

      // Verify metadata enhancement
      const firstChunk = chunks[0];
      expect(firstChunk.metadata.documentContext).toBeDefined();
      expect(firstChunk.metadata.documentContext?.manufacturerName).toContain('GEMBA');
      expect(firstChunk.metadata.documentContext?.equipmentModel).toBe('GEMBA-5000');
      expect(firstChunk.metadata.documentContext?.manualVersion).toBe('1.0');

      // Verify special content detection
      const warningChunks = chunks.filter((c) => c.metadata.semanticContext?.warnings.length > 0);
      expect(warningChunks.length).toBeGreaterThan(0);

      const partChunks = chunks.filter((c) =>
        c.metadata.semanticContext?.entities.some((e) => e.type === 'part'),
      );
      expect(partChunks.length).toBeGreaterThan(0);

      const measurementChunks = chunks.filter((c) =>
        c.metadata.semanticContext?.entities.some((e) => e.type === 'measurement'),
      );
      expect(measurementChunks.length).toBeGreaterThan(0);

      // Verify table handling
      const tableChunks = chunks.filter((c) => c.metadata.contentType.hasTable);
      expect(tableChunks.length).toBeGreaterThan(0);

      // Verify chunk relationships
      for (let i = 0; i < chunks.length; i++) {
        if (i > 0) {
          expect(chunks[i].relationships.previousChunkId).toBe(chunks[i - 1].id);
        }
        if (i < chunks.length - 1) {
          expect(chunks[i].relationships.nextChunkId).toBe(chunks[i + 1].id);
        }
      }

      console.log(`
Pipeline Test Results:
- Document processed successfully
- Processing time: ${processingTime}ms
- Chunks created: ${chunks.length}
- Warnings detected: ${warningChunks.length}
- Parts detected: ${partChunks.filter((c) => c.metadata.semanticContext?.entities.some((e) => e.type === 'part')).length}
- Measurements detected: ${measurementChunks.filter((c) => c.metadata.semanticContext?.entities.some((e) => e.type === 'measurement')).length}
      `);
    });

    it('should handle edge cases gracefully', async () => {
      const edgeCases = [
        {
          name: 'Empty document',
          content: [{ text: '', pageNumber: 1 }],
          expectedChunks: 0,
        },
        {
          name: 'Only whitespace',
          content: [{ text: '   \n\n\t\t   ', pageNumber: 1 }],
          expectedChunks: 0,
        },
        {
          name: 'Very short content',
          content: [{ text: 'Test', pageNumber: 1 }],
          expectedChunks: 0, // Below minimum chunk size
        },
        {
          name: 'Unicode and special characters',
          content: [{ text: 'Test with émojis 🔧 and symbols ™®©', pageNumber: 1 }],
          expectedChunks: 0, // Still below minimum
        },
      ];

      const service = new ChunkingService();

      for (const testCase of edgeCases) {
        const chunks = await service.chunkDocument(
          `edge-case-${testCase.name}`,
          'test-tenant',
          testCase.content as PDFContent[],
        );

        expect(chunks.length).toBe(testCase.expectedChunks);
        console.log(`Edge case "${testCase.name}": ${chunks.length} chunks`);
      }
    });

    it('should maintain quality with concurrent processing', async () => {
      const documents = Array.from({ length: 3 }, (_, i) => ({
        id: `concurrent-doc-${i}`,
        content: [
          {
            text: `
Document ${i} - Equipment Manual

Safety Notice:
WARNING: Read all instructions before operating.

Specifications:
- Model: EQUIP-${1000 + i}
- Power: ${100 + i * 10}HP
- Weight: ${500 + i * 50}kg

Maintenance Schedule:
Daily: Check oil level
Weekly: Inspect belts
Monthly: Replace filters

Part Numbers:
- Filter: FLT-${2000 + i}
- Belt: BLT-${3000 + i}
          `.repeat(3), // Make it longer to ensure multiple chunks
            pageNumber: 1,
          },
        ],
      }));

      const service = new ChunkingService();
      const startTime = Date.now();

      // Process documents concurrently
      const results = await Promise.all(
        documents.map((doc) =>
          service.chunkDocument(
            doc.id,
            'test-tenant',
            doc.content as PDFContent[],
            `Equipment Manual ${doc.id}`,
          ),
        ),
      );

      const totalTime = Date.now() - startTime;

      // Verify all documents processed
      expect(results.length).toBe(3);
      results.forEach((chunks, i) => {
        expect(chunks.length).toBeGreaterThan(0);

        // Verify metadata quality is maintained
        const hasWarnings = chunks.some((c) => c.metadata.semanticContext?.warnings.length > 0);
        expect(hasWarnings).toBe(true);

        const hasParts = chunks.some((c) =>
          c.metadata.semanticContext?.entities.some((e) => e.type === 'part'),
        );
        expect(hasParts).toBe(true);
      });

      console.log(`Concurrent processing: 3 documents in ${totalTime}ms`);
      expect(totalTime).toBeLessThan(10000); // Should complete in under 10 seconds
    });
  });

  describe('Metadata Enhancement Validation', () => {
    it('should enhance metadata comprehensively', () => {
      const enhancer = new MetadataEnhancer();
      const testChunks = [
        {
          id: 'test-chunk-1',
          content: 'Safety WARNING: High voltage. Part number: PN-12345. Temperature: 180°F.',
          metadata: {
            id: 'test-chunk-1',
            documentId: 'test-doc',
            chunkIndex: 0,
            startPage: 1,
            endPage: 1,
          } as any,
          relationships: {
            hierarchyLevel: 1,
          } as any,
          tenantId: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const pdfContent: PDFContent[] = [
        {
          text: testChunks[0].content,
          pageNumber: 1,
        },
      ];

      const enhanced = enhancer.enhanceChunks(testChunks, pdfContent, {
        documentTitle: 'Test Manual',
        manufacturerName: 'Test Corp',
      });

      expect(enhanced[0].metadata.documentContext).toBeDefined();
      expect(enhanced[0].metadata.sectionContext).toBeDefined();
      expect(enhanced[0].metadata.processingStats).toBeDefined();
      expect(enhanced[0].metadata.contentStats).toBeDefined();
      expect(enhanced[0].metadata.semanticContext).toBeDefined();
      expect(enhanced[0].metadata.qualityMetrics).toBeDefined();

      // Verify specific extractions
      const semanticContext = enhanced[0].metadata.semanticContext!;
      expect(semanticContext.warnings.length).toBeGreaterThan(0);
      expect(
        semanticContext.entities.some((e) => e.type === 'part' && e.value === 'PN-12345'),
      ).toBe(true);
      expect(
        semanticContext.entities.some((e) => e.type === 'measurement' && e.value.includes('°F')),
      ).toBe(true);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance targets for various document sizes', async () => {
      const testSizes = [
        { pages: 10, maxTime: 5000 },
        { pages: 50, maxTime: 15000 },
        { pages: 100, maxTime: 30000 },
      ];

      const service = new ChunkingService();

      for (const test of testSizes) {
        const content: PDFContent[] = Array.from({ length: test.pages }, (_, i) => ({
          text: `
Page ${i + 1} - Technical Documentation

This page contains various technical information including specifications,
procedures, warnings, and part numbers. Content is repeated to simulate
a realistic document size for performance testing.

WARNING: Follow all safety procedures.
Part numbers: PN-${1000 + i}, PN-${2000 + i}
Measurements: ${10 + i}mm, ${20 + i}kg, ${30 + i}°C
          `.repeat(5),
          pageNumber: i + 1,
        }));

        const startTime = Date.now();
        const chunks = await service.chunkDocument(
          `perf-test-${test.pages}`,
          'test-tenant',
          content,
        );
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(test.maxTime);
        expect(chunks.length).toBeGreaterThan(test.pages); // Should create multiple chunks per page

        console.log(
          `${test.pages} pages: ${duration}ms (${(duration / test.pages).toFixed(1)}ms/page)`,
        );
      }
    });
  });
});
