/**
 * Tests for specialized content type handlers
 */

import {
  extractTables,
  extractLists,
  extractDiagrams,
  extractCodeBlocks,
  extractTechnicalFormats,
  analyzeSpecialContent,
  shouldKeepTogether,
  calculateSpecialContentWeight,
} from '../content-handlers';

describe('Content Handlers', () => {
  describe('extractTables', () => {
    it('should extract markdown-style tables', () => {
      const content = `
Before table content.

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

After table content.
      `;

      const tables = extractTables(content, 1);

      expect(tables.length).toBe(1);
      expect(tables[0].headers).toEqual(['Header 1', 'Header 2', 'Header 3']);
      expect(tables[0].rows).toEqual([
        ['Cell 1', 'Cell 2', 'Cell 3'],
        ['Cell 4', 'Cell 5', 'Cell 6'],
      ]);
      expect(tables[0].columnCount).toBe(3);
      expect(tables[0].rowCount).toBe(2);
    });

    it('should extract pipe-separated tables', () => {
      const content = `
Specifications:
Part | Size | Weight | Material
A123 | 10mm | 5kg | Steel
B456 | 20mm | 8kg | Aluminum
      `;

      const tables = extractTables(content, 1);

      expect(tables.length).toBe(1);
      expect(tables[0].headers).toEqual(['Part', 'Size', 'Weight', 'Material']);
      expect(tables[0].rows).toEqual([
        ['A123', '10mm', '5kg', 'Steel'],
        ['B456', '20mm', '8kg', 'Aluminum'],
      ]);
    });

    it('should extract ASCII tables with borders', () => {
      const content = `
+----------+----------+----------+
| Header 1 | Header 2 | Header 3 |
+----------+----------+----------+
| Value 1  | Value 2  | Value 3  |
+----------+----------+----------+
      `;

      const tables = extractTables(content, 1);

      expect(tables.length).toBe(1);
      expect(tables[0].headers).toEqual(['Header 1', 'Header 2', 'Header 3']);
      expect(tables[0].rows).toEqual([['Value 1', 'Value 2', 'Value 3']]);
    });

    it('should find table captions', () => {
      const content = `
Table 1: Equipment Specifications
| Part | Size | Weight |
|------|------|--------|
| A123 | 10mm | 5kg    |
      `;

      const tables = extractTables(content, 1);

      expect(tables.length).toBe(1);
      expect(tables[0].caption).toBe('Table 1: Equipment Specifications');
    });

    it('should handle space-separated tables', () => {
      const content = `
Part    Size    Weight    Material
A123    10mm    5kg       Steel
B456    20mm    8kg       Aluminum
      `;

      const tables = extractTables(content, 1);

      expect(tables.length).toBe(1);
      expect(tables[0].headers).toEqual(['Part', 'Size', 'Weight', 'Material']);
      expect(tables[0].rows).toEqual([
        ['A123', '10mm', '5kg', 'Steel'],
        ['B456', '20mm', '8kg', 'Aluminum'],
      ]);
    });
  });

  describe('extractLists', () => {
    it('should extract bullet lists', () => {
      const content = `
Safety procedures:
• Always wear safety goggles
• Check equipment before use
• Follow lockout/tagout procedures
• Report any damage immediately
      `;

      const lists = extractLists(content, 1);

      expect(lists.length).toBe(1);
      expect(lists[0].type).toBe('bullet');
      expect(lists[0].items.length).toBe(4);
      expect(lists[0].items[0].content).toBe('Always wear safety goggles');
      expect(lists[0].items[0].bulletType).toBe('•');
    });

    it('should extract numbered lists', () => {
      const content = `
Installation steps:
1. Remove packaging materials
2. Check all components are present
3. Connect power supply
4. Run initial calibration
5. Test all functions
      `;

      const lists = extractLists(content, 1);

      expect(lists.length).toBe(1);
      expect(lists[0].type).toBe('numbered');
      expect(lists[0].items.length).toBe(5);
      expect(lists[0].items[0].content).toBe('Remove packaging materials');
      expect(lists[0].items[0].index).toBe(1);
      expect(lists[0].items[0].bulletType).toBe('numbered');
    });

    it('should extract definition lists', () => {
      const content = `
Terminology:
RPM: Revolutions per minute
PSI: Pounds per square inch
CFM: Cubic feet per minute
      `;

      const lists = extractLists(content, 1);

      expect(lists.length).toBe(1);
      expect(lists[0].type).toBe('definition');
      expect(lists[0].items.length).toBe(3);
      expect(lists[0].items[0].content).toBe('RPM: Revolutions per minute');
      expect(lists[0].items[0].bulletType).toBe('definition');
    });

    it('should handle nested lists', () => {
      const content = `
Maintenance checklist:
1. Daily checks
  • Oil levels
  • Temperature readings
  • Pressure gauges
2. Weekly checks
  • Filter condition
  • Belt tension
3. Monthly checks
  • Calibration
      `;

      const lists = extractLists(content, 1);

      expect(lists.length).toBe(2); // Main numbered list and nested bullet list
      expect(lists[0].type).toBe('numbered');
      expect(lists[0].items.length).toBe(3);
      expect(lists[1].type).toBe('bullet');
      expect(lists[1].items.length).toBe(3);
      expect(lists[1].isNested).toBe(true);
    });

    it('should handle different bullet types', () => {
      const content = `
Requirements:
- Primary requirement
* Secondary requirement
+ Additional requirement
▪ Special requirement
      `;

      const lists = extractLists(content, 1);

      expect(lists.length).toBe(1);
      expect(lists[0].type).toBe('bullet');
      expect(lists[0].items.length).toBe(4);
      expect(lists[0].items[0].bulletType).toBe('-');
      expect(lists[0].items[1].bulletType).toBe('*');
      expect(lists[0].items[2].bulletType).toBe('+');
      expect(lists[0].items[3].bulletType).toBe('▪');
    });
  });

  describe('extractDiagrams', () => {
    it('should extract figure references', () => {
      const content = `
See the installation diagram below.

Figure 1: Motor Assembly Diagram
This shows the complete motor assembly with all components labeled.

Refer to Figure 2.1 for wiring details.
      `;

      const diagrams = extractDiagrams(content, 1);

      expect(diagrams.length).toBe(2);
      expect(diagrams[0].type).toBe('figure');
      expect(diagrams[0].reference).toBe('1');
      expect(diagrams[0].title).toBe('Motor Assembly Diagram');
      expect(diagrams[0].caption).toBe(
        'This shows the complete motor assembly with all components labeled.',
      );

      expect(diagrams[1].type).toBe('figure');
      expect(diagrams[1].reference).toBe('2.1');
    });

    it('should extract diagram references', () => {
      const content = `
The system layout is shown in Diagram 3.
      `;

      const diagrams = extractDiagrams(content, 1);

      expect(diagrams.length).toBe(1);
      expect(diagrams[0].type).toBe('diagram');
      expect(diagrams[0].reference).toBe('3');
    });

    it('should extract chart references', () => {
      const content = `
Performance data is shown in Chart 4: Performance Curves
The chart displays torque vs speed characteristics.
      `;

      const diagrams = extractDiagrams(content, 1);

      expect(diagrams.length).toBe(1);
      expect(diagrams[0].type).toBe('chart');
      expect(diagrams[0].reference).toBe('4');
      expect(diagrams[0].title).toBe('Performance Curves');
    });

    it('should extract image placeholders', () => {
      const content = `
[image]
See the photo above for proper positioning.
      `;

      const diagrams = extractDiagrams(content, 1);

      expect(diagrams.length).toBe(1);
      expect(diagrams[0].type).toBe('image');
      expect(diagrams[0].reference).toBe('unnamed');
    });
  });

  describe('extractCodeBlocks', () => {
    it('should extract fenced code blocks', () => {
      const content = `
Configuration example:

\`\`\`json
{
  "motor": {
    "rpm": 1800,
    "voltage": 480,
    "current": 25
  }
}
\`\`\`

End of configuration.
      `;

      const codeBlocks = extractCodeBlocks(content, 1);

      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].language).toBe('json');
      expect(codeBlocks[0].content).toContain('"motor"');
      expect(codeBlocks[0].content).toContain('"rpm": 1800');
    });

    it('should extract indented code blocks', () => {
      const content = `
Example configuration:

    START_MOTOR
    SET_SPEED 1800
    SET_VOLTAGE 480
    ENABLE_MONITORING
    
Continue with normal operation.
      `;

      const codeBlocks = extractCodeBlocks(content, 1);

      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].content).toContain('START_MOTOR');
      expect(codeBlocks[0].content).toContain('SET_SPEED 1800');
      expect(codeBlocks[0].language).toBeUndefined();
    });

    it('should handle code blocks without language', () => {
      const content = `
Command sequence:

\`\`\`
INIT
START
RUN
STOP
\`\`\`
      `;

      const codeBlocks = extractCodeBlocks(content, 1);

      expect(codeBlocks.length).toBe(1);
      expect(codeBlocks[0].language).toBeUndefined();
      expect(codeBlocks[0].content).toContain('INIT');
    });
  });

  describe('extractTechnicalFormats', () => {
    it('should extract measurements', () => {
      const content = `
Specifications:
- Length: 150mm
- Width: 75mm  
- Height: 100mm
- Weight: 2.5kg
- Operating temperature: 20°C to 85°C
- Pressure: 150 PSI
- Frequency: 60 Hz
      `;

      const formats = extractTechnicalFormats(content, 1);

      expect(formats.length).toBeGreaterThan(0);

      const measurements = formats.filter((f) => f.type === 'measurement');
      expect(measurements.length).toBeGreaterThan(5);

      const lengthMeasurement = measurements.find((m) => m.content.includes('150mm'));
      expect(lengthMeasurement).toBeDefined();
      expect(lengthMeasurement?.content).toBe('150mm');
    });

    it('should extract part numbers', () => {
      const content = `
Parts list:
- Motor: M-1234-ABC
- Bearing: BRG-567
- Seal: Part #: S-890-XYZ
- Gasket: P/N: GAS-123
      `;

      const formats = extractTechnicalFormats(content, 1);

      const partNumbers = formats.filter((f) => f.type === 'part_number');
      expect(partNumbers.length).toBeGreaterThan(0);

      const motorPart = partNumbers.find((p) => p.content.includes('M-1234-ABC'));
      expect(motorPart).toBeDefined();
    });

    it('should extract formulas', () => {
      const content = `
Calculations:
Power = Voltage × Current
P = V × I
Torque = Force × Distance
Formula: Efficiency = Output / Input × 100%
      `;

      const formats = extractTechnicalFormats(content, 1);

      const formulas = formats.filter((f) => f.type === 'formula');
      expect(formulas.length).toBeGreaterThan(0);

      const powerFormula = formulas.find((f) => f.content.includes('P = V × I'));
      expect(powerFormula).toBeDefined();
    });

    it('should extract dimensional specifications', () => {
      const content = `
Dimensional tolerances:
- Shaft diameter: 25.0 ± 0.1 mm
- Bore size: 50 x 30 mm
- Thread pitch: M12 x 1.5
      `;

      const formats = extractTechnicalFormats(content, 1);

      const measurements = formats.filter((f) => f.type === 'measurement');
      expect(measurements.length).toBeGreaterThan(0);

      const tolerance = measurements.find((m) => m.content.includes('25.0 ± 0.1 mm'));
      expect(tolerance).toBeDefined();
    });
  });

  describe('analyzeSpecialContent', () => {
    it('should analyze complex manufacturing content', () => {
      const content = `
# Motor Installation Guide

## Safety Requirements
• Always wear safety goggles
• Ensure power is disconnected
• Use proper lifting equipment

## Specifications
| Parameter | Value | Unit |
|-----------|-------|------|
| Voltage   | 480   | V    |
| Current   | 25    | A    |
| RPM       | 1800  | rpm  |

## Installation Steps
1. Position motor on mounting base
2. Align with driven equipment
3. Connect electrical supply
4. Test rotation direction

See Figure 1 for wiring diagram.

Configuration file example:
\`\`\`json
{
  "motor_id": "M-1234",
  "voltage": 480,
  "current": 25
}
\`\`\`

Technical specifications:
- Power: 15kW
- Efficiency: 92%
- Part number: M-1234-ABC
      `;

      const analysis = analyzeSpecialContent(content, 1);

      expect(analysis.lists.length).toBeGreaterThanOrEqual(2); // Safety list and installation steps
      expect(analysis.tables.length).toBe(1); // Specifications table
      expect(analysis.diagrams.length).toBe(1); // Figure 1 reference
      expect(analysis.codeBlocks.length).toBe(1); // JSON config
      expect(analysis.technicalFormats.length).toBeGreaterThan(0); // Various measurements and part numbers
    });
  });

  describe('shouldKeepTogether', () => {
    it('should keep tables together', () => {
      const content = `
      | A | B | C |
      |---|---|---|
      | 1 | 2 | 3 |
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const keepTogether = shouldKeepTogether(content, specialContent);

      expect(keepTogether).toBe(true);
    });

    it('should keep short lists together', () => {
      const content = `
      • Item 1
      • Item 2
      • Item 3
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const keepTogether = shouldKeepTogether(content, specialContent);

      expect(keepTogether).toBe(true);
    });

    it('should not keep very long lists together', () => {
      const content = `
      ${Array.from({ length: 15 }, (_, i) => `• Item ${i + 1}`).join('\n')}
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const keepTogether = shouldKeepTogether(content, specialContent);

      expect(keepTogether).toBe(false);
    });

    it('should keep code blocks together', () => {
      const content = `
      \`\`\`javascript
      console.log('Hello');
      \`\`\`
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const keepTogether = shouldKeepTogether(content, specialContent);

      expect(keepTogether).toBe(true);
    });

    it('should keep diagrams together', () => {
      const content = `
      Figure 1: System Overview
      See the diagram above for details.
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const keepTogether = shouldKeepTogether(content, specialContent);

      expect(keepTogether).toBe(true);
    });

    it('should not keep regular text together', () => {
      const content = `
      This is just regular text content without any special formatting whatsoever.
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const keepTogether = shouldKeepTogether(content, specialContent);

      expect(keepTogether).toBe(false);
    });
  });

  describe('calculateSpecialContentWeight', () => {
    it('should assign higher weight to tables', () => {
      const content = `
      | A | B |
      |---|---|
      | 1 | 2 |
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const weight = calculateSpecialContentWeight(specialContent);

      expect(weight).toBeGreaterThan(1.0);
    });

    it('should assign highest weight to code blocks', () => {
      const content = `
      \`\`\`javascript
      console.log('test');
      \`\`\`
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const weight = calculateSpecialContentWeight(specialContent);

      expect(weight).toBeGreaterThan(1.5);
      expect(weight).toBe(1.8);
    });

    it('should combine weights for multiple content types', () => {
      const content = `
      | A | B |
      |---|---|
      | 1 | 2 |
      
      • List item 1
      • List item 2
      
      Figure 1: Diagram
      
      \`\`\`json
      {"test": true}
      \`\`\`
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const weight = calculateSpecialContentWeight(specialContent);

      // Should be 1.5 * 1.3 * 1.4 * 1.8 = 4.914
      expect(weight).toBeGreaterThan(4.0);
    });

    it('should return 1.0 for regular content', () => {
      const content = `
      This is just regular text content with no special formatting whatsoever.
      `;

      const specialContent = analyzeSpecialContent(content, 1);
      const weight = calculateSpecialContentWeight(specialContent);

      expect(weight).toBe(1.0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const analysis = analyzeSpecialContent('', 1);

      expect(analysis.tables.length).toBe(0);
      expect(analysis.lists.length).toBe(0);
      expect(analysis.diagrams.length).toBe(0);
      expect(analysis.codeBlocks.length).toBe(0);
      expect(analysis.technicalFormats.length).toBe(0);
    });

    it('should handle malformed tables', () => {
      const content = `
      | Header
      | Missing pipes
      Just text
      `;

      const tables = extractTables(content, 1);

      // Should handle gracefully, may or may not detect as table
      expect(Array.isArray(tables)).toBe(true);
    });

    it('should handle nested list edge cases', () => {
      const content = `
      1. Item 1
      
      2. Item 2
        • Sub item
      
      3. Item 3
      `;

      const lists = extractLists(content, 1);

      expect(lists.length).toBeGreaterThan(0);
      expect(lists[0].type).toBe('numbered');
    });
  });
});
