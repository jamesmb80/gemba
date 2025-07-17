/**
 * Tests for chunking algorithm
 */

import {
  DocumentChunker,
  countTokens,
  findSentenceBoundaries,
  findParagraphBoundaries,
  findBestBoundary,
  detectContentTypes,
} from '../algorithm';
import { ChunkConfig, PDFContent, DEFAULT_CHUNK_CONFIG } from '../../types/chunking';

describe('DocumentChunker', () => {
  let chunker: DocumentChunker;

  beforeEach(() => {
    chunker = new DocumentChunker();
  });

  describe('countTokens', () => {
    it('should count tokens correctly', () => {
      const text = 'Hello world! This is a test.';
      const result = countTokens(text);

      expect(result.count).toBe(8); // 6 words + 2 punctuation
      expect(result.breakdown.text).toBe(6);
      expect(result.breakdown.punctuation).toBe(2);
    });

    it('should handle empty text', () => {
      const result = countTokens('');
      expect(result.count).toBe(0);
    });

    it('should count numbers correctly', () => {
      const text = 'Page 123 has 456 items.';
      const result = countTokens(text);

      expect(result.breakdown.numbers).toBe(2);
      expect(result.count).toBe(8); // 4 words + 2 numbers + 1 punctuation + 1 for number detection
    });
  });

  describe('findSentenceBoundaries', () => {
    it('should find sentence boundaries correctly', () => {
      const text = 'First sentence. Second sentence! Third sentence?';
      const boundaries = findSentenceBoundaries(text);

      expect(boundaries.length).toBe(2);
      expect(boundaries[0]).toBe(15); // After "First sentence."
      expect(boundaries[1]).toBe(32); // After "Second sentence!"
    });

    it('should handle text with no sentence boundaries', () => {
      const text = 'No sentence boundaries here';
      const boundaries = findSentenceBoundaries(text);

      expect(boundaries.length).toBe(0);
    });
  });

  describe('findParagraphBoundaries', () => {
    it('should find paragraph boundaries correctly', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      const boundaries = findParagraphBoundaries(text);

      expect(boundaries.length).toBe(2);
    });

    it('should handle text with no paragraph boundaries', () => {
      const text = 'No paragraph boundaries here';
      const boundaries = findParagraphBoundaries(text);

      expect(boundaries.length).toBe(0);
    });
  });

  describe('findBestBoundary', () => {
    it('should prefer paragraph boundaries', () => {
      const text = 'First paragraph.\n\nSecond paragraph. Third sentence.';
      const config: ChunkConfig = {
        ...DEFAULT_CHUNK_CONFIG,
        respectParagraphs: true,
        respectSentences: true,
      };

      const boundary = findBestBoundary(text, 0, 30, config);

      // Should find paragraph boundary around position 18
      expect(boundary).toBeGreaterThan(15);
      expect(boundary).toBeLessThan(25);
    });

    it('should fall back to sentence boundaries when no paragraph boundaries', () => {
      const text = 'First sentence. Second sentence. Third sentence.';
      const config: ChunkConfig = {
        ...DEFAULT_CHUNK_CONFIG,
        respectParagraphs: true,
        respectSentences: true,
      };

      const boundary = findBestBoundary(text, 0, 30, config);

      // Should find sentence boundary around position 15
      expect(boundary).toBe(15);
    });
  });

  describe('detectContentTypes', () => {
    it('should detect tables', () => {
      const text = '| Header 1 | Header 2 |\n| Value 1 | Value 2 |';
      const result = detectContentTypes(text);

      expect(result.hasTable).toBe(true);
      expect(result.hasList).toBe(false);
    });

    it('should detect bulleted lists', () => {
      const text = '• First item\n• Second item\n• Third item';
      const result = detectContentTypes(text);

      expect(result.hasList).toBe(true);
      expect(result.hasTable).toBe(false);
    });

    it('should detect numbered lists', () => {
      const text = '1. First item\n2. Second item\n3. Third item';
      const result = detectContentTypes(text);

      expect(result.hasList).toBe(true);
    });

    it('should detect code blocks', () => {
      const text = '```javascript\nconst x = 1;\n```';
      const result = detectContentTypes(text);

      expect(result.hasCode).toBe(true);
    });

    it('should detect images', () => {
      const text = 'See [image] below for reference.';
      const result = detectContentTypes(text);

      expect(result.hasImage).toBe(true);
    });

    it('should detect diagrams', () => {
      const text = 'The diagram shows the process flow.';
      const result = detectContentTypes(text);

      expect(result.hasDiagram).toBe(true);
    });
  });

  describe('chunkDocument', () => {
    it('should chunk a simple document correctly', () => {
      const pdfContent: PDFContent[] = [
        {
          text: 'This is page 1 content. It has multiple sentences to test chunking.',
          pageNumber: 1,
        },
        {
          text: 'This is page 2 content. It continues the document.',
          pageNumber: 2,
        },
      ];

      const chunks = chunker.chunkDocument(
        'test-doc',
        'test-tenant',
        pdfContent,
        'Test Document',
        'Test Author',
      );

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].metadata.documentId).toBe('test-doc');
      expect(chunks[0].metadata.documentTitle).toBe('Test Document');
      expect(chunks[0].metadata.documentAuthor).toBe('Test Author');
      expect(chunks[0].tenantId).toBe('test-tenant');
    });

    it('should maintain chunk relationships', () => {
      const pdfContent: PDFContent[] = [
        {
          text: 'First part of document. '.repeat(100), // Force multiple chunks
          pageNumber: 1,
        },
      ];

      const chunks = chunker.chunkDocument('test-doc', 'test-tenant', pdfContent);

      if (chunks.length > 1) {
        // Check first chunk
        expect(chunks[0].relationships.previousChunkId).toBeUndefined();
        expect(chunks[0].relationships.nextChunkId).toBe('test-doc_chunk_1');

        // Check second chunk
        expect(chunks[1].relationships.previousChunkId).toBe('test-doc_chunk_0');
        expect(chunks[1].relationships.nextChunkId).toBeDefined();
      }
    });

    it('should handle small documents', () => {
      const pdfContent: PDFContent[] = [
        {
          text: 'Small document.',
          pageNumber: 1,
        },
      ];

      const chunks = chunker.chunkDocument('test-doc', 'test-tenant', pdfContent);

      expect(chunks.length).toBe(1);
      expect(chunks[0].content).toBe('Small document.');
    });

    it('should respect chunk size configuration', () => {
      const customConfig: ChunkConfig = {
        ...DEFAULT_CHUNK_CONFIG,
        chunkSize: 5, // Very small to force multiple chunks
        overlap: 2,
        minChunkSize: 2,
      };

      const customChunker = new DocumentChunker(customConfig);

      const pdfContent: PDFContent[] = [
        {
          text: 'This is a very long document that should definitely be split into multiple chunks because it exceeds the configured chunk size limit by a significant amount.',
          pageNumber: 1,
        },
      ];

      const chunks = customChunker.chunkDocument('test-doc', 'test-tenant', pdfContent);

      expect(chunks.length).toBeGreaterThan(1);

      // Each chunk should be roughly within the size limit
      chunks.forEach((chunk) => {
        const tokenCount = countTokens(chunk.content);
        expect(tokenCount.count).toBeLessThanOrEqual(
          customConfig.chunkSize + customConfig.overlap + 5,
        ); // Allow some flexibility
      });
    });

    it('should preserve page information', () => {
      const pdfContent: PDFContent[] = [
        {
          text: 'Page 1 content.',
          pageNumber: 1,
        },
        {
          text: 'Page 2 content.',
          pageNumber: 2,
        },
      ];

      const chunks = chunker.chunkDocument('test-doc', 'test-tenant', pdfContent);

      expect(chunks[0].metadata.startPage).toBe(1);
      expect(chunks[0].metadata.endPage).toBeGreaterThanOrEqual(1);
    });

    it('should detect content types in chunks', () => {
      const pdfContent: PDFContent[] = [
        {
          text: '# Section Header\n\n• First item\n• Second item\n\n| Col1 | Col2 |\n| A | B |',
          pageNumber: 1,
        },
      ];

      const chunks = chunker.chunkDocument('test-doc', 'test-tenant', pdfContent);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].metadata.contentType.hasList).toBe(true);

      // Check that content types are detected properly
      const allContent = chunks.map((c) => c.content).join('\n');
      expect(allContent).toContain('First item');
      expect(allContent).toContain('Second item');

      // Check that special content metadata is included
      const hasSpecialContent = chunks.some(
        (c) =>
          c.metadata.specialContent &&
          (c.metadata.specialContent.lists > 0 || c.metadata.specialContent.tables > 0),
      );
      expect(hasSpecialContent).toBe(true);
    });
  });

  describe('configuration management', () => {
    it('should allow configuration updates', () => {
      const newConfig: Partial<ChunkConfig> = {
        chunkSize: 500,
        overlap: 50,
      };

      chunker.updateConfig(newConfig);
      const config = chunker.getConfig();

      expect(config.chunkSize).toBe(500);
      expect(config.overlap).toBe(50);
      expect(config.respectSentences).toBe(DEFAULT_CHUNK_CONFIG.respectSentences);
    });

    it('should return a copy of configuration', () => {
      const config1 = chunker.getConfig();
      const config2 = chunker.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Should be different objects
    });
  });

  describe('hierarchical relationships', () => {
    it('should establish parent-child relationships', () => {
      const pdfContent: PDFContent[] = [
        {
          text: '# Main Section\n\nMain content here.\n\n## Subsection\n\nSubsection content here.',
          pageNumber: 1,
        },
      ];

      const chunks = chunker.chunkDocument('test-doc', 'test-tenant', pdfContent);

      // Should have chunks with different hierarchy levels
      const hasHierarchy = chunks.some((chunk) => chunk.relationships.hierarchyLevel > 0);
      expect(hasHierarchy).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty documents', () => {
      const pdfContent: PDFContent[] = [];

      const chunks = chunker.chunkDocument('test-doc', 'test-tenant', pdfContent);

      expect(chunks.length).toBe(0);
    });

    it('should handle documents with only whitespace', () => {
      const pdfContent: PDFContent[] = [
        {
          text: '   \n\n   \t  ',
          pageNumber: 1,
        },
      ];

      const chunks = chunker.chunkDocument('test-doc', 'test-tenant', pdfContent);

      expect(chunks.length).toBe(0);
    });

    it('should handle very long single sentences', () => {
      const longSentence = 'This is a very long sentence that goes on and on and on '.repeat(50);
      const pdfContent: PDFContent[] = [
        {
          text: longSentence,
          pageNumber: 1,
        },
      ];

      const chunks = chunker.chunkDocument('test-doc', 'test-tenant', pdfContent);

      expect(chunks.length).toBeGreaterThan(1);
    });
  });
});
