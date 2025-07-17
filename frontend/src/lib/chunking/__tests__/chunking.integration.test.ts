/**
 * Integration tests for chunking pipeline with various PDF formats
 */

import { DocumentChunker } from '../algorithm';
import { ChunkingService } from '../withFeatureFlag';
import { PDFContent } from '../../types/chunking';
import { isFeatureEnabled } from '../../featureFlags';

// Mock feature flags
jest.mock('../../featureFlags', () => ({
  isFeatureEnabled: jest.fn(),
}));

describe('Chunking Pipeline Integration Tests', () => {
  const mockIsFeatureEnabled = isFeatureEnabled as jest.MockedFunction<typeof isFeatureEnabled>;

  beforeEach(() => {
    mockIsFeatureEnabled.mockReturnValue(true);
  });

  describe('Manufacturing Manual Processing', () => {
    it('should process a typical manufacturing manual structure', async () => {
      const manufacturingManual: PDFContent[] = [
        {
          text: `
ACME Manufacturing Equipment Manual
Model: XYZ-2000
Version: 3.2
Date: January 2025

Table of Contents
1. Safety Instructions
2. Installation Guide
3. Operation Manual
4. Maintenance Schedule
5. Troubleshooting Guide
6. Parts Catalog
          `,
          pageNumber: 1,
        },
        {
          text: `
1. SAFETY INSTRUCTIONS

WARNING: High voltage equipment. Disconnect power before servicing.

CAUTION: Moving parts can cause injury. Keep hands clear during operation.

1.1 General Safety Guidelines
• Always wear appropriate PPE
• Follow lockout/tagout procedures
• Verify equipment is grounded
• Never bypass safety interlocks

1.2 Electrical Safety
Voltage: 480V 3-phase
Current: 50A maximum
Frequency: 60Hz
          `,
          pageNumber: 2,
        },
        {
          text: `
2. INSTALLATION GUIDE

2.1 Site Preparation
Required clearances:
- Front: 36 inches
- Sides: 24 inches
- Rear: 18 inches
- Top: 48 inches

Foundation requirements:
| Parameter | Specification |
|-----------|---------------|
| Thickness | 6 inches min  |
| Concrete  | 3000 PSI      |
| Rebar     | #4 @ 12" OC   |

2.2 Electrical Connection
1. Verify power is OFF
2. Connect L1, L2, L3 to terminals
3. Connect ground wire
4. Torque connections to 50 lb-ft
          `,
          pageNumber: 3,
        },
        {
          text: `
3. OPERATION MANUAL

3.1 Startup Procedure
1. Check all safety devices
2. Verify proper lubrication
3. Set operating parameters:
   - Temperature: 180°F
   - Pressure: 125 PSI
   - Speed: 1800 RPM
4. Press START button
5. Monitor for abnormal conditions

3.2 Normal Operation
During operation, monitor:
• Temperature gauge (normal: 170-190°F)
• Pressure gauge (normal: 120-130 PSI)
• Vibration levels
• Oil level indicator

\`\`\`
// Control sequence
if (temperature > 200) {
  alarm.activate();
  motor.stop();
}
\`\`\`
          `,
          pageNumber: 4,
        },
        {
          text: `
4. MAINTENANCE SCHEDULE

Daily:
□ Check oil level
□ Inspect safety guards
□ Clean air filters

Weekly:
□ Lubricate bearings
□ Check belt tension
□ Test emergency stop

Monthly:
□ Replace filters
□ Calibrate sensors
□ Inspect electrical connections

Part Numbers:
- Oil Filter: OF-123456
- Air Filter: AF-789012
- Belt: BT-345678
          `,
          pageNumber: 5,
        },
        {
          text: `
5. TROUBLESHOOTING GUIDE

Problem: Motor won't start
Possible Causes:
1. No power → Check circuit breaker
2. E-stop activated → Reset button
3. Overload tripped → Check amp draw

Problem: Excessive vibration
See Figure 5.1 for vibration analysis chart
Refer to Section 3.2 for normal levels

Problem: High temperature
WARNING: Temperatures above 220°F can cause damage
1. Check coolant level
2. Verify fan operation
3. Clean heat exchanger
          `,
          pageNumber: 6,
        },
      ];

      const service = new ChunkingService();
      const chunks = await service.chunkDocument(
        'manual-xyz-2000',
        'tenant-123',
        manufacturingManual,
        'XYZ-2000 Equipment Manual',
        'ACME Manufacturing',
      );

      // Verify basic chunking
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.length).toBeLessThan(20); // Reasonable for 6 pages

      // Verify metadata extraction
      const firstChunk = chunks[0];
      expect(firstChunk.metadata.documentContext?.manufacturerName).toContain('ACME');
      expect(firstChunk.metadata.documentContext?.equipmentModel).toBe('XYZ-2000');
      expect(firstChunk.metadata.documentContext?.manualVersion).toBe('3.2');

      // Verify special content detection
      const hasWarnings = chunks.some((c) => c.metadata.semanticContext?.warnings.length > 0);
      expect(hasWarnings).toBe(true);

      const hasParts = chunks.some((c) =>
        c.metadata.semanticContext?.entities.some((e) => e.type === 'part'),
      );
      expect(hasParts).toBe(true);

      const hasMeasurements = chunks.some((c) =>
        c.metadata.semanticContext?.entities.some((e) => e.type === 'measurement'),
      );
      expect(hasMeasurements).toBe(true);

      const hasProcedures = chunks.some((c) => c.metadata.semanticContext?.procedures.length > 0);
      expect(hasProcedures).toBe(true);

      // Verify table preservation
      const hasTable = chunks.some((c) => c.metadata.contentType.hasTable);
      expect(hasTable).toBe(true);

      // Verify code block detection
      const hasCode = chunks.some((c) => c.metadata.contentType.hasCode);
      expect(hasCode).toBe(true);

      // Verify section hierarchy
      const sectionTypes = new Set(
        chunks.map((c) => c.metadata.sectionContext?.sectionType).filter(Boolean),
      );
      expect(sectionTypes.has('safety')).toBe(true);
      expect(sectionTypes.has('procedures')).toBe(true);
      expect(sectionTypes.has('maintenance')).toBe(true);
      expect(sectionTypes.has('troubleshooting')).toBe(true);

      // Verify cross-references
      const hasCrossRefs = chunks.some(
        (c) => c.metadata.semanticContext?.crossReferences.length > 0,
      );
      expect(hasCrossRefs).toBe(true);
    });

    it('should handle complex technical specifications', async () => {
      const technicalSpecs: PDFContent[] = [
        {
          text: `
TECHNICAL SPECIFICATIONS

Model: HydroPress-5000
Serial Range: HP5K-2024-0001 to HP5K-2024-9999

Performance Specifications:
| Parameter | Min | Nominal | Max | Units |
|-----------|-----|---------|-----|-------|
| Pressure  | 500 | 750     | 1000| PSI   |
| Flow Rate | 10  | 15      | 20  | GPM   |
| Temp      | 60  | 180     | 220 | °F    |
| Speed     | 600 | 1200    | 1800| RPM   |

Electrical Requirements:
• Voltage: 460VAC ±10%
• Current: 125A FLA, 150A LRA
• Power: 75HP (56kW)
• Frequency: 60Hz ±1Hz
• Phase: 3-phase, 4-wire + ground

Physical Dimensions:
Width: 48" (1219mm)
Height: 72" (1829mm)
Depth: 36" (914mm)
Weight: 2,500 lbs (1,134 kg)

Environmental Conditions:
Operating Temperature: 32°F to 104°F (0°C to 40°C)
Storage Temperature: -4°F to 140°F (-20°C to 60°C)
Humidity: 10% to 90% non-condensing
Altitude: Up to 6,560 ft (2,000m) without derating
          `,
          pageNumber: 1,
        },
      ];

      const chunker = new DocumentChunker();
      const chunks = chunker.chunkDocument(
        'spec-hp5k',
        'tenant-123',
        technicalSpecs,
        'HydroPress-5000 Technical Specifications',
      );

      // Should keep technical tables together
      const tableChunks = chunks.filter((c) => c.metadata.contentType.hasTable);
      expect(tableChunks.length).toBeGreaterThan(0);

      // Should extract numerous measurements
      const allMeasurements = chunks.flatMap(
        (c) => c.metadata.semanticContext?.entities.filter((e) => e.type === 'measurement') || [],
      );
      expect(allMeasurements.length).toBeGreaterThan(10);

      // Should identify part numbers
      const partNumbers = chunks.flatMap(
        (c) =>
          c.metadata.semanticContext?.entities.filter(
            (e) => e.type === 'part' && e.value.includes('HP5K'),
          ) || [],
      );
      expect(partNumbers.length).toBeGreaterThan(0);
    });

    it('should handle multi-language manuals', async () => {
      const multiLangManual: PDFContent[] = [
        {
          text: `
SAFETY INSTRUCTIONS / INSTRUCTIONS DE SÉCURITÉ

WARNING: Disconnect power before servicing.
AVERTISSEMENT: Débrancher l'alimentation avant l'entretien.

CAUTION: Hot surfaces. Allow to cool before touching.
ATTENTION: Surfaces chaudes. Laisser refroidir avant de toucher.

Operating Instructions:
1. Press START button
2. Monitor temperature gauge
3. Adjust speed as needed

Instructions d'utilisation:
1. Appuyer sur le bouton DÉMARRER
2. Surveiller le thermomètre
3. Ajuster la vitesse au besoin
          `,
          pageNumber: 1,
        },
      ];

      const chunker = new DocumentChunker();
      const chunks = chunker.chunkDocument('manual-multilang', 'tenant-123', multiLangManual);

      // Should preserve both languages
      expect(chunks[0].content).toContain('WARNING');
      expect(chunks[0].content).toContain('AVERTISSEMENT');

      // Should detect warnings in both languages
      const warnings = chunks[0].metadata.semanticContext?.warnings || [];
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should handle manufacturing process diagrams and figures', async () => {
      const diagramManual: PDFContent[] = [
        {
          text: `
ASSEMBLY PROCEDURE

Step 1: Install Base Unit
Refer to Figure 2.1 for base unit orientation.
See Diagram A for mounting hole locations.

Step 2: Connect Hydraulic Lines
[Figure 2.2: Hydraulic Connection Diagram]
- Red line: High pressure supply
- Blue line: Return line
- Yellow line: Pilot pressure

Step 3: Electrical Connections
[Diagram B: Wiring Schematic]
Connect according to the wiring diagram shown above.
Ensure proper phase rotation (see Figure 2.3).

Note: Diagrams not to scale. 
For detailed drawings, see Appendix C.
          `,
          pageNumber: 1,
        },
      ];

      const chunker = new DocumentChunker();
      const chunks = chunker.chunkDocument('manual-diagrams', 'tenant-123', diagramManual);

      // Should detect diagram references
      expect(chunks[0].metadata.contentType.hasDiagram).toBe(true);

      // Should extract figure references
      const crossRefs = chunks[0].metadata.semanticContext?.crossReferences || [];
      const figureRefs = crossRefs.filter((ref) => ref.targetType === 'figure');
      expect(figureRefs.length).toBeGreaterThan(0);
    });

    it('should handle error codes and troubleshooting tables', async () => {
      const errorCodeManual: PDFContent[] = [
        {
          text: `
ERROR CODE REFERENCE

| Code | Description | Cause | Solution |
|------|-------------|-------|----------|
| E001 | Motor Overload | Excessive load or locked rotor | Check mechanical load, verify free rotation |
| E002 | High Temperature | Cooling failure or overload | Check cooling system, reduce load |
| E003 | Low Oil Pressure | Oil pump failure or low oil | Check oil level, test pump pressure |
| E004 | Sensor Fault | Disconnected or failed sensor | Check sensor connections, replace if needed |
| E005 | Communication Error | Network or protocol issue | Verify network settings, check cables |

ALARM PRIORITIES
• CRITICAL (Red): E001, E002 - Immediate shutdown required
• WARNING (Yellow): E003, E004 - Operation may continue with caution
• NOTICE (Blue): E005 - Information only

For detailed troubleshooting procedures, see Section 8.
          `,
          pageNumber: 1,
        },
      ];

      const chunker = new DocumentChunker();
      const chunks = chunker.chunkDocument('manual-errors', 'tenant-123', errorCodeManual);

      // Should keep error table together
      const tableChunk = chunks.find((c) => c.metadata.contentType.hasTable);
      expect(tableChunk).toBeDefined();
      expect(tableChunk?.content).toContain('E001');
      expect(tableChunk?.content).toContain('E005');

      // Should detect priority warnings
      const warnings = chunks[0].metadata.semanticContext?.warnings || [];
      expect(warnings.some((w) => w.includes('CRITICAL'))).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle corrupted or malformed content', async () => {
      const malformedContent: PDFContent[] = [
        {
          text: `
Title���with���bad���encoding

Some text with 
broken
formatting and incomplete
          `,
          pageNumber: 1,
        },
        {
          text: `
| Incomplete table
| Missing cells |
More text here...
          `,
          pageNumber: 2,
        },
      ];

      const service = new ChunkingService();

      // Should not throw error
      await expect(
        service.chunkDocument('malformed-doc', 'tenant-123', malformedContent),
      ).resolves.toBeDefined();
    });

    it('should handle extremely long pages', async () => {
      const veryLongPage: PDFContent[] = [
        {
          text: 'This is a sentence. '.repeat(5000), // ~20,000 words
          pageNumber: 1,
        },
      ];

      const chunker = new DocumentChunker();
      const chunks = chunker.chunkDocument('long-doc', 'tenant-123', veryLongPage);

      // Should create many chunks
      expect(chunks.length).toBeGreaterThan(10);

      // All chunks should maintain relationships
      for (let i = 1; i < chunks.length - 1; i++) {
        expect(chunks[i].relationships.previousChunkId).toBe(chunks[i - 1].id);
        expect(chunks[i].relationships.nextChunkId).toBe(chunks[i + 1].id);
      }
    });

    it('should handle documents with no clear structure', async () => {
      const unstructuredContent: PDFContent[] = [
        {
          text: `
random text without any headers or structure just continuous 
text that goes on and on without clear paragraph breaks or 
sections making it difficult to determine natural boundaries 
for chunking but the algorithm should still handle it gracefully
and create reasonable chunks based on size constraints alone
          `.replace(/\n/g, ' '),
          pageNumber: 1,
        },
      ];

      const chunker = new DocumentChunker({
        chunkSize: 50,
        overlap: 10,
      });

      const chunks = chunker.chunkDocument('unstructured-doc', 'tenant-123', unstructuredContent);

      expect(chunks.length).toBeGreaterThan(1);

      // Should still respect word boundaries
      chunks.forEach((chunk) => {
        expect(chunk.content).not.toMatch(/\s$/); // No trailing space
        expect(chunk.content).not.toMatch(/^\s/); // No leading space
      });
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle a 100-page document efficiently', async () => {
      const largePdfContent: PDFContent[] = Array.from({ length: 100 }, (_, i) => ({
        text: `
Page ${i + 1} of Manufacturing Manual

This page contains various technical information including:
- Part numbers: PN-${1000 + i}, PN-${2000 + i}
- Measurements: ${10 + i}mm, ${20 + i}kg, ${30 + i}°C
- Procedures: Step 1, Step 2, Step 3

Technical specifications and detailed instructions follow...
        `.repeat(5),
        pageNumber: i + 1,
      }));

      const startTime = Date.now();

      const service = new ChunkingService();
      const chunks = await service.chunkDocument(
        'large-manual',
        'tenant-123',
        largePdfContent,
        'Large Manufacturing Manual',
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 30 seconds for 100 pages)
      expect(duration).toBeLessThan(30000);

      // Should create appropriate number of chunks
      expect(chunks.length).toBeGreaterThan(100);
      expect(chunks.length).toBeLessThan(1000);

      // Should maintain quality
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk.metadata.endPage).toBe(100);
      expect(lastChunk.relationships.previousChunkId).toBeDefined();
    });
  });
});
