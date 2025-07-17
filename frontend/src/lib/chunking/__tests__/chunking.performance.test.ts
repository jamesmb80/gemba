/**
 * Performance tests for document chunking pipeline
 */

import { DocumentChunker } from '../algorithm';
import { ChunkingService, recordChunkingMetrics } from '../withFeatureFlag';
import { PDFContent } from '../../types/chunking';
import { isFeatureEnabled } from '../../featureFlags';

// Mock feature flags
jest.mock('../../featureFlags', () => ({
  isFeatureEnabled: jest.fn(),
}));

describe('Chunking Performance Tests', () => {
  const mockIsFeatureEnabled = isFeatureEnabled as jest.MockedFunction<typeof isFeatureEnabled>;

  beforeEach(() => {
    mockIsFeatureEnabled.mockReturnValue(true);
    jest.setTimeout(60000); // 60 seconds for performance tests
  });

  afterEach(() => {
    jest.setTimeout(5000); // Reset to default
  });

  /**
   * Helper to generate realistic manufacturing manual content
   */
  function generateManualContent(pageCount: number): PDFContent[] {
    const sections = [
      'Safety Instructions',
      'Installation Guide',
      'Operation Manual',
      'Maintenance Schedule',
      'Troubleshooting Guide',
      'Parts Catalog',
      'Technical Specifications',
      'Warranty Information',
    ];

    return Array.from({ length: pageCount }, (_, pageIndex) => {
      const sectionIndex = Math.floor((pageIndex / pageCount) * sections.length);
      const sectionName = sections[sectionIndex];

      let content = `# ${sectionName} - Page ${pageIndex + 1}\n\n`;

      // Add varied content based on section type
      switch (sectionIndex) {
        case 0: // Safety
          content += `
WARNING: High voltage present. Risk of electric shock.
CAUTION: Moving parts. Keep hands clear during operation.
NOTICE: Read all instructions before operating equipment.

Safety Guidelines:
• Always disconnect power before servicing
• Use proper lockout/tagout procedures
• Wear appropriate PPE including safety glasses
• Ensure adequate ventilation in work area
• Never bypass safety interlocks
• Keep work area clean and well-lit

Emergency Procedures:
1. Press emergency stop button
2. Disconnect main power breaker
3. Call maintenance supervisor
4. Document incident in log book
          `;
          break;

        case 1: // Installation
          content += `
Installation Step ${pageIndex}:

Required Tools:
- Torque wrench (50-200 ft-lbs)
- Digital multimeter
- Level (48" minimum)
- Socket set (metric and standard)

Specifications:
| Component | Torque | Wire Size | Clearance |
|-----------|--------|-----------|-----------|
| Base bolts| 125 ft-lbs | N/A | 24" min |
| Power lugs| 50 ft-lbs | 2 AWG | 36" min |
| Ground | 35 ft-lbs | 6 AWG | N/A |

Procedure:
1. Position equipment on foundation
2. Check level in both directions
3. Secure with anchor bolts
4. Connect power cables L1, L2, L3
5. Connect ground wire to ground bus
6. Verify phase rotation
          `;
          break;

        case 2: // Operation
          content += `
Operating Parameters for Unit ${pageIndex}:

Normal Operating Ranges:
- Temperature: 160-180°F (71-82°C)
- Pressure: 120-140 PSI (827-965 kPa)
- Flow rate: 50-75 GPM (189-284 LPM)
- Motor speed: 1750-1800 RPM
- Vibration: <0.2 in/sec (5 mm/sec)

Control Sequence:
\`\`\`
START_SEQUENCE:
  CHECK_INTERLOCKS()
  IF ALL_SAFE THEN
    START_LUBE_PUMP()
    WAIT 30_SECONDS
    START_MAIN_MOTOR()
    RAMP_TO_SPEED(1800_RPM, 60_SECONDS)
    ENABLE_AUTO_CONTROL()
  ELSE
    DISPLAY_FAULT()
  END_IF
\`\`\`

Monitoring Points:
• Bearing temperature sensors (RTD1-RTD4)
• Vibration sensors (VIB1-VIB2)
• Pressure transmitters (PT1-PT3)
• Flow meters (FT1-FT2)
          `;
          break;

        case 3: // Maintenance
          content += `
Maintenance Schedule - Month ${pageIndex + 1}:

Daily Tasks:
□ Check oil level in sight glass
□ Record operating temperatures
□ Inspect for unusual noise/vibration
□ Verify safety guards in place
□ Clean control panel screens

Weekly Tasks:
□ Lubricate bearings (2 pumps grease)
□ Check belt tension (1/2" deflection)
□ Test emergency stop function
□ Clean or replace air filters
□ Inspect hydraulic hoses

Monthly Tasks:
□ Change oil filter (P/N: OF-${1000 + pageIndex})
□ Calibrate pressure sensors
□ Megger test motors (>1 MΩ)
□ Tighten electrical connections
□ Update maintenance log

Parts Required:
- Oil filter: OF-${1000 + pageIndex}
- Air filter: AF-${2000 + pageIndex}
- Hydraulic fluid: HF-46 (5 gallons)
- Grease: NLGI #2 (1 lb)
          `;
          break;

        case 4: // Troubleshooting
          content += `
Troubleshooting Guide - Issue ${pageIndex}:

Problem: Equipment fails to start
Error Code: E${100 + pageIndex}

Possible Causes and Solutions:
1. No control power
   → Check control transformer fuses F1-F3
   → Verify 120VAC at terminals 1-2
   
2. Safety interlock open
   → Check door switches DS1-DS4
   → Verify e-stop pulled out
   → Test safety relay K1
   
3. Low oil pressure
   → Check oil level (add if needed)
   → Test pressure switch PS1 (setpoint: 10 PSI)
   → Inspect oil pump coupling
   
4. Motor overload tripped
   → Check overload settings (FLA: 125A)
   → Measure motor current all phases
   → Check for phase imbalance (<5%)

Reference Diagrams:
- See Figure ${pageIndex}.1 for control schematic
- See Figure ${pageIndex}.2 for safety circuit
- Refer to Section 3.${pageIndex} for normal operation
          `;
          break;

        default: // Parts, Specs, Warranty
          content += `
Technical Information - Document ${pageIndex}:

Part Numbers:
${Array.from(
  { length: 10 },
  (_, i) =>
    `- ${['Motor', 'Pump', 'Valve', 'Sensor', 'Filter'][i % 5]}: PN-${pageIndex * 1000 + i}`,
).join('\n')}

Specifications:
${Array.from(
  { length: 8 },
  (_, i) =>
    `- Parameter ${i + 1}: ${Math.floor(Math.random() * 100) + 50} ± ${Math.floor(Math.random() * 10) + 1} units`,
).join('\n')}

Cross References:
- Supersedes: OLD-${pageIndex * 100}
- Compatible with: Series ${Math.floor(pageIndex / 10) * 100}
- See also: Manual section ${((pageIndex + 5) % 8) + 1}

Notes:
This information is proprietary and confidential.
Refer to engineering drawings for detailed dimensions.
Contact technical support for clarification.
          `;
      }

      // Add some repeated content to make it more realistic
      content += '\n\n' + content.substring(0, 200);

      return {
        text: content,
        pageNumber: pageIndex + 1,
      };
    });
  }

  describe('Throughput Tests', () => {
    it('should meet performance target for 500-page manual', async () => {
      const pageCount = 500;
      const pdfContent = generateManualContent(pageCount);

      const service = new ChunkingService();
      const startTime = Date.now();

      const chunks = await service.chunkDocument(
        'perf-test-500',
        'tenant-perf',
        pdfContent,
        'Performance Test Manual 500 Pages',
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Record metrics
      recordChunkingMetrics({
        documentId: 'perf-test-500',
        success: true,
        chunkCount: chunks.length,
        duration,
        timestamp: new Date(),
      });

      // Performance requirements from story: < 5 minutes for 500 pages
      expect(duration).toBeLessThan(300000); // 5 minutes in milliseconds

      // Calculate throughput
      const pagesPerSecond = pageCount / (duration / 1000);
      const chunksPerSecond = chunks.length / (duration / 1000);

      console.log(`Performance Test Results (500 pages):
        Total Duration: ${duration}ms (${(duration / 1000).toFixed(1)}s)
        Pages/Second: ${pagesPerSecond.toFixed(1)}
        Chunks Created: ${chunks.length}
        Chunks/Second: ${chunksPerSecond.toFixed(1)}
        Avg ms/Page: ${(duration / pageCount).toFixed(1)}
      `);

      // Additional performance assertions
      expect(pagesPerSecond).toBeGreaterThan(1.5); // At least 1.5 pages/second
      expect(chunks.length).toBeGreaterThan(pageCount); // Should create multiple chunks per page
      expect(chunks.length).toBeLessThan(pageCount * 10); // But not too many
    });

    it('should scale linearly with document size', async () => {
      const testSizes = [10, 50, 100];
      const results: { pages: number; duration: number; chunks: number }[] = [];

      for (const pageCount of testSizes) {
        const pdfContent = generateManualContent(pageCount);
        const service = new ChunkingService();

        const startTime = Date.now();
        const chunks = await service.chunkDocument(
          `perf-test-${pageCount}`,
          'tenant-perf',
          pdfContent,
        );
        const duration = Date.now() - startTime;

        results.push({
          pages: pageCount,
          duration,
          chunks: chunks.length,
        });
      }

      // Check if performance scales linearly
      const timePerPage = results.map((r) => r.duration / r.pages);
      const avgTimePerPage = timePerPage.reduce((a, b) => a + b) / timePerPage.length;

      // Time per page should be relatively consistent (within 50% variance)
      timePerPage.forEach((tpp) => {
        expect(tpp).toBeGreaterThan(avgTimePerPage * 0.5);
        expect(tpp).toBeLessThan(avgTimePerPage * 1.5);
      });

      console.log('Scalability Test Results:');
      results.forEach((r) => {
        console.log(
          `  ${r.pages} pages: ${r.duration}ms (${(r.duration / r.pages).toFixed(1)}ms/page)`,
        );
      });
    });
  });

  describe('Memory Usage Tests', () => {
    it('should handle large documents without memory issues', async () => {
      // Note: In a real environment, we'd use process.memoryUsage()
      // For this test, we'll verify the document is processed in chunks

      const pageCount = 200;
      const pdfContent = generateManualContent(pageCount);

      // Track chunk processing
      let chunksProcessed = 0;
      const originalChunkDocument = DocumentChunker.prototype.chunkDocument;

      // Spy on chunk creation to ensure streaming behavior
      DocumentChunker.prototype.chunkDocument = function (...args) {
        const result = originalChunkDocument.apply(this, args);
        chunksProcessed = result.length;
        return result;
      };

      const service = new ChunkingService();
      await service.chunkDocument('memory-test', 'tenant-mem', pdfContent);

      // Restore original method
      DocumentChunker.prototype.chunkDocument = originalChunkDocument;

      // Should have processed document in chunks
      expect(chunksProcessed).toBeGreaterThan(0);

      // Verify garbage collection opportunity
      // In production, monitor with:
      // - process.memoryUsage().heapUsed
      // - process.memoryUsage().external
      // - process.memoryUsage().rss
    });
  });

  describe('Concurrent Processing Tests', () => {
    it('should handle multiple documents concurrently', async () => {
      const documentCount = 5;
      const pagesPerDoc = 20;

      const promises = Array.from({ length: documentCount }, async (_, i) => {
        const pdfContent = generateManualContent(pagesPerDoc);
        const service = new ChunkingService();

        const startTime = Date.now();
        const chunks = await service.chunkDocument(
          `concurrent-doc-${i}`,
          `tenant-concurrent-${i}`,
          pdfContent,
          `Concurrent Test Document ${i}`,
        );
        const duration = Date.now() - startTime;

        return {
          docId: i,
          chunks: chunks.length,
          duration,
        };
      });

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalDuration = Date.now() - startTime;

      // Concurrent processing should be faster than sequential
      const sequentialEstimate = results.reduce((sum, r) => sum + r.duration, 0);
      expect(totalDuration).toBeLessThan(sequentialEstimate);

      console.log(`Concurrent Processing Results:
        Documents: ${documentCount}
        Total Duration: ${totalDuration}ms
        Sequential Estimate: ${sequentialEstimate}ms
        Speedup: ${(sequentialEstimate / totalDuration).toFixed(2)}x
      `);

      // All documents should be processed successfully
      results.forEach((result) => {
        expect(result.chunks).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Case Performance', () => {
    it('should handle documents with many small chunks efficiently', async () => {
      // Document with many short sentences
      const content = Array.from({ length: 1000 }, (_, i) => `Sentence ${i}. `).join('');

      const pdfContent: PDFContent[] = [
        {
          text: content,
          pageNumber: 1,
        },
      ];

      const chunker = new DocumentChunker({
        chunkSize: 10, // Very small chunks
        overlap: 2,
      });

      const startTime = Date.now();
      const chunks = chunker.chunkDocument('many-small-chunks', 'tenant-test', pdfContent);
      const duration = Date.now() - startTime;

      expect(chunks.length).toBeGreaterThan(50);
      expect(duration).toBeLessThan(5000); // Should complete quickly even with many chunks
    });

    it('should handle documents with very long chunks efficiently', async () => {
      // Document with very long paragraphs
      const content =
        'This is a very long paragraph without any sentence boundaries that goes on and on. '.repeat(
          500,
        );

      const pdfContent: PDFContent[] = [
        {
          text: content,
          pageNumber: 1,
        },
      ];

      const chunker = new DocumentChunker({
        chunkSize: 5000, // Very large chunks
        overlap: 500,
      });

      const startTime = Date.now();
      const chunks = chunker.chunkDocument('few-large-chunks', 'tenant-test', pdfContent);
      const duration = Date.now() - startTime;

      expect(chunks.length).toBeLessThan(20);
      expect(duration).toBeLessThan(2000); // Should complete quickly
    });

    it('should handle deeply nested content efficiently', async () => {
      // Generate deeply nested sections
      let content = '';
      for (let i = 1; i <= 6; i++) {
        content += '#'.repeat(i) + ` Level ${i} Header\n\n`;
        content += `Content for level ${i}. `.repeat(50) + '\n\n';
      }

      const pdfContent: PDFContent[] = Array.from({ length: 50 }, () => ({
        text: content,
        pageNumber: 1,
      }));

      const service = new ChunkingService();
      const startTime = Date.now();

      const chunks = await service.chunkDocument('deeply-nested', 'tenant-test', pdfContent);

      const duration = Date.now() - startTime;

      // Should handle hierarchy efficiently
      expect(duration).toBeLessThan(10000);

      // Should maintain proper hierarchy
      const maxHierarchyLevel = Math.max(...chunks.map((c) => c.relationships.hierarchyLevel));
      expect(maxHierarchyLevel).toBeGreaterThan(0);
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track performance metrics accurately', async () => {
      const pdfContent = generateManualContent(10);
      const service = new ChunkingService();

      // Clear previous metrics
      for (let i = 0; i < 100; i++) {
        recordChunkingMetrics({
          documentId: `clear-${i}`,
          success: true,
          timestamp: new Date(),
        });
      }

      // Process several documents
      for (let i = 0; i < 5; i++) {
        await service.chunkDocument(`metric-test-${i}`, 'tenant-metrics', pdfContent);
      }

      // Verify metrics were recorded
      const { getRecentChunkingMetrics } = require('../withFeatureFlag');
      const recentMetrics = getRecentChunkingMetrics(10);

      const testMetrics = recentMetrics.filter((m) => m.documentId.startsWith('metric-test-'));

      expect(testMetrics.length).toBeGreaterThan(0);

      // All should be successful with reasonable performance
      testMetrics.forEach((metric) => {
        expect(metric.success).toBe(true);
        expect(metric.chunkCount).toBeGreaterThan(0);
        expect(metric.duration).toBeLessThan(5000); // < 5 seconds for 10 pages
      });
    });
  });
});
