/**
 * Tests for text preprocessing and cleaning utilities
 */

import {
  preprocessText,
  cleanForEmbedding,
  validateTextQuality,
  DEFAULT_CLEANING_OPTIONS,
} from '../preprocessing';

describe('Text Preprocessing', () => {
  describe('preprocessText', () => {
    it('should handle basic text normalization', () => {
      const text = `This  is    a   test    with   extra   spaces.
      
      
      
      And multiple line breaks.`;

      const result = preprocessText(text);

      expect(result.content).toBe('This is a test with extra spaces.\n\nAnd multiple line breaks.');
      expect(result.transformations).toContain('Normalized whitespace');
      expect(result.transformations).toContain('Removed extra line breaks');
      expect(result.originalLength).toBe(text.length);
      expect(result.normalizedLength).toBe(result.content.length);
    });

    it('should preserve special content during cleaning', () => {
      const text = `
      Here is a table:
      | Header 1 | Header 2 | Header 3 |
      |----------|----------|----------|
      | Cell 1   | Cell 2   | Cell 3   |
      
      And here is code:
      \`\`\`javascript
      console.log('Hello    World');
      \`\`\`
      
      Formula: P = V × I
      
      See Figure 1 for details.
      `;

      const result = preprocessText(text);

      expect(result.content).toContain('| Header 1 | Header 2 | Header 3 |');
      expect(result.content).toContain("console.log('Hello    World');");
      expect(result.content).toContain('P = V × I');
      expect(result.content).toContain('Figure 1 for details');
      expect(result.preservedElements.length).toBe(4);
    });

    it('should fix encoding issues', () => {
      const text =
        'It\u00E2\u20AC\u2122s a \u00E2\u20AC\u0153test\u00E2\u20AC\u009D with encoding issues.';

      const result = preprocessText(text);

      expect(result.content).toBe('It\'s a "test" with encoding issues.');
      expect(result.transformations).toContain('Fixed encoding issues');
    });

    it('should normalize Unicode characters', () => {
      const text = 'Cafe\u0301 with e\u0301 (e + \u0301)'; // é as combining characters

      const result = preprocessText(text);

      expect(result.content).toBe('Café with é (e + ´)'); // Should normalize to composed form
      expect(result.transformations).toContain('Normalized Unicode characters');
    });

    it('should remove non-printable characters', () => {
      const text = 'Text with\u0000\u0001\u0002 control characters\u001F.';

      const result = preprocessText(text);

      expect(result.content).toBe('Text with control characters.');
      expect(result.transformations).toContain('Removed non-printable characters');
    });

    it('should normalize quotes', () => {
      const text = '\u201cHello\u201d and \u2018world\u2019 with various quotes.';

      const result = preprocessText(text);

      expect(result.content).toBe('"Hello" and \'world\' with various quotes.');
      expect(result.transformations).toContain('Normalized quotes');
    });

    it('should normalize dashes', () => {
      const text = 'Em dash \u2014 and en dash \u2013 should be normalized.';

      const result = preprocessText(text);

      expect(result.content).toBe('Em dash - and en dash - should be normalized.');
      expect(result.transformations).toContain('Normalized dashes');
    });

    it('should handle empty text', () => {
      const result = preprocessText('');

      expect(result.content).toBe('');
      expect(result.transformations).toEqual([]);
      expect(result.originalLength).toBe(0);
      expect(result.normalizedLength).toBe(0);
    });

    it('should handle text with only whitespace', () => {
      const text = '   \t\n\n   ';

      const result = preprocessText(text);

      expect(result.content.trim()).toBe('');
      expect(result.transformations).toContain('Normalized whitespace');
    });

    it('should respect cleaning options', () => {
      const text = 'Text  with    extra   spaces.';

      const result = preprocessText(text, {
        normalizeWhitespace: false,
        removeExtraLineBreaks: false,
      });

      expect(result.content).toBe(text);
      expect(result.transformations).not.toContain('Normalized whitespace');
    });

    it('should handle complex manufacturing content', () => {
      const text = `
      # Motor Installation Guide
      
      ## Safety   Requirements
      •   Always    wear safety goggles
      •   Ensure power   is   disconnected
      
      ## Specifications
      | Parameter | Value | Unit |
      |-----------|-------|------|
      | Voltage   | 480   | V    |
      | Current   | 25    | A    |
      
      Configuration:
      \`\`\`json
      {
        "motor_id": "M-1234",
        "voltage": 480
      }
      \`\`\`
      
      Power calculation: P = V × I
      
      See Figure 2.1 for wiring diagram.
      `;

      const result = preprocessText(text);

      expect(result.content).toContain('# Motor Installation Guide');
      expect(result.content).toContain('• Always wear safety goggles');
      expect(result.content).toContain('| Parameter | Value | Unit |');
      expect(result.content).toContain('"motor_id": "M-1234"');
      expect(result.content).toContain('P = V × I');
      expect(result.content).toContain('Figure 2.1 for wiring diagram');
    });
  });

  describe('cleanForEmbedding', () => {
    it('should clean text optimally for embeddings', () => {
      const text = `
      This  is    a   test    with   extra   spaces.
      
      
      
      And multiple line breaks.
      
      | Table | Data |
      |-------|------|
      | A     | B    |
      `;

      const result = cleanForEmbedding(text);

      expect(result).toContain('This is a test with extra spaces.');
      expect(result).toContain('And multiple line breaks.');
      expect(result).toContain('| Table | Data |');
      expect(result).not.toContain('   '); // No multiple spaces
    });

    it('should preserve manufacturing-specific content', () => {
      const text = `
      Motor specs: 480V, 25A, 1800 RPM
      Part number: M-1234-ABC
      Formula: Torque = Force × Distance
      See Figure 3.1 for assembly.
      `;

      const result = cleanForEmbedding(text);

      expect(result).toContain('480V, 25A, 1800 RPM');
      expect(result).toContain('M-1234-ABC');
      expect(result).toContain('Torque = Force × Distance');
      expect(result).toContain('Figure 3.1 for assembly');
    });
  });

  describe('validateTextQuality', () => {
    it('should validate high-quality text', () => {
      const original = 'This is a test with good content.';
      const processed = 'This is a test with good content.';

      const result = validateTextQuality(original, processed);

      expect(result.isValid).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.qualityScore).toBe(100);
    });

    it('should detect excessive content loss', () => {
      const original = 'This is a very long text with lots of content that should be preserved.';
      const processed = 'Short text.';

      const result = validateTextQuality(original, processed);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Excessive content loss (>50%)');
      expect(result.qualityScore).toBeLessThan(100);
    });

    it('should detect table structure degradation', () => {
      const original = `
      | Header 1 | Header 2 |
      |----------|----------|
      | Cell 1   | Cell 2   |
      | Cell 3   | Cell 4   |
      `;
      const processed = 'Header 1 Header 2 Cell 1 Cell 2';

      const result = validateTextQuality(original, processed);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Table structure degradation');
      expect(result.qualityScore).toBeLessThan(100);
    });

    it('should detect malformed text', () => {
      const original = 'This is a test.';
      const processed = 'This is undefined test with null values.';

      const result = validateTextQuality(original, processed);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains undefined/null values');
      expect(result.qualityScore).toBeLessThan(100);
    });

    it('should detect excessive repetition', () => {
      const original = 'This is a test.';
      const processed = 'This is a test.This is a test.This is a test.This is a test.';

      const result = validateTextQuality(original, processed);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Excessive content repetition detected');
      expect(result.qualityScore).toBeLessThan(100);
    });

    it('should handle edge cases', () => {
      const original = '';
      const processed = '';

      const result = validateTextQuality(original, processed);

      expect(result.isValid).toBe(true);
      expect(result.qualityScore).toBe(100);
    });
  });

  describe('encoding fixes', () => {
    it('should fix Windows-1252 encoding issues', () => {
      const encodingTests = [
        ['Itâ€™s a test', "It's a test"],
        ['â€œHelloâ€\u009D', '"Hello"'],
        ['Em dashâ€"here', 'Em dash—here'],
        ['En dashâ€"here', 'En dash–here'],
        ['Café with Ã©', 'Café with é'],
        ['Señor with Ã±', 'Señor with ñ'],
        ['Temperature: 25Â°C', 'Temperature: 25°C'],
        ['Pressure: 150Â±5 PSI', 'Pressure: 150±5 PSI'],
        ['Area: 10mÂ²', 'Area: 10m²'],
        ['Volume: 5mÂ³', 'Volume: 5m³'],
        ['Ratio: Â¼ to Â½', 'Ratio: ¼ to ½'],
      ];

      for (const [input, expected] of encodingTests) {
        const result = preprocessText(input);
        expect(result.content).toBe(expected);
      }
    });
  });

  describe('whitespace normalization', () => {
    it('should normalize various whitespace characters', () => {
      const text = 'Text\u00A0with\u2000various\u2009whitespace\u202Fcharacters.';

      const result = preprocessText(text);

      expect(result.content).toBe('Text with various whitespace characters.');
    });

    it('should handle tabs correctly', () => {
      const text = 'Text\twith\ttabs\there.';

      const result = preprocessText(text);

      expect(result.content).toBe('Text with tabs here.');
    });

    it('should trim line whitespace', () => {
      const text = '   Line with leading spaces   \n   Another line   ';

      const result = preprocessText(text);

      expect(result.content).toBe('Line with leading spaces\nAnother line');
    });
  });

  describe('line break handling', () => {
    it('should normalize line endings', () => {
      const text = 'Line 1\r\nLine 2\rLine 3\nLine 4';

      const result = preprocessText(text);

      expect(result.content).toBe('Line 1\nLine 2\nLine 3\nLine 4');
    });

    it('should reduce excessive line breaks', () => {
      const text = 'Line 1\n\n\n\n\nLine 2\n\n\n\nLine 3';

      const result = preprocessText(text);

      expect(result.content).toBe('Line 1\n\nLine 2\n\nLine 3');
    });
  });

  describe('special content preservation', () => {
    it('should preserve table formatting', () => {
      const text = `
      Normal text here.
      | Header | Value |
      |--------|-------|
      | Item 1 | 100   |
      | Item 2 | 200   |
      More normal text.
      `;

      const result = preprocessText(text);

      expect(result.content).toContain('| Header | Value |');
      expect(result.content).toContain('| Item 1 | 100   |');
      expect(result.preservedElements.some((e) => e.type === 'table')).toBe(true);
    });

    it('should preserve code block formatting', () => {
      const text = `
      Configuration example:
      \`\`\`json
      {
        "setting": "value",
        "number": 42
      }
      \`\`\`
      End of example.
      `;

      const result = preprocessText(text);

      expect(result.content).toContain('```json');
      expect(result.content).toContain('"setting": "value"');
      expect(result.preservedElements.some((e) => e.type === 'code')).toBe(true);
    });

    it('should preserve formula formatting', () => {
      const text = 'Power calculation: P = V × I where V is voltage.';

      const result = preprocessText(text);

      expect(result.content).toContain('P = V × I');
      expect(result.preservedElements.some((e) => e.type === 'formula')).toBe(true);
    });

    it('should preserve diagram references', () => {
      const text = `
      See Figure 2.1 for wiring diagram.
      Refer to Diagram 3 for assembly.
      Chart 4.5 shows performance data.
      Image 1 displays the component.
      `;

      const result = preprocessText(text);

      expect(result.content).toContain('Figure 2.1 for wiring diagram');
      expect(result.content).toContain('Diagram 3 for assembly');
      expect(result.content).toContain('Chart 4.5 shows performance data');
      expect(result.content).toContain('Image 1 displays the component');
      expect(result.preservedElements.filter((e) => e.type === 'diagram').length).toBe(4);
    });
  });

  describe('default options', () => {
    it('should use sensible defaults', () => {
      expect(DEFAULT_CLEANING_OPTIONS.normalizeWhitespace).toBe(true);
      expect(DEFAULT_CLEANING_OPTIONS.removeExtraLineBreaks).toBe(true);
      expect(DEFAULT_CLEANING_OPTIONS.normalizeUnicode).toBe(true);
      expect(DEFAULT_CLEANING_OPTIONS.fixEncodingIssues).toBe(true);
      expect(DEFAULT_CLEANING_OPTIONS.preserveStructure).toBe(true);
      expect(DEFAULT_CLEANING_OPTIONS.removeNonPrintable).toBe(true);
      expect(DEFAULT_CLEANING_OPTIONS.normalizeQuotes).toBe(true);
      expect(DEFAULT_CLEANING_OPTIONS.normalizeDashes).toBe(true);
      expect(DEFAULT_CLEANING_OPTIONS.preserveSpecialContent).toBe(true);
    });
  });
});
