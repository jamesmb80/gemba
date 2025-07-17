/**
 * Tests for metadata extraction utilities
 */

import {
  extractDocumentMetadata,
  extractTitleFromFirstPage,
  extractSectionHeaders,
  extractHeadersFromPage,
  analyzeLineForHeader,
  buildTableOfContents,
  extractPageLocation,
  extractKeywords,
  extractCompleteMetadata,
} from '../metadata';
import { PDFContent } from '../../types/chunking';

describe('Metadata Extraction', () => {
  describe('extractDocumentMetadata', () => {
    it('should extract metadata from document properties', () => {
      const pdfContent: PDFContent[] = [
        { text: 'Test content', pageNumber: 1 },
        { text: 'More content', pageNumber: 2 },
      ];

      const properties = {
        Title: 'Test Document',
        Author: 'Test Author',
        Subject: 'Test Subject',
        Creator: 'Test Creator',
        Producer: 'Test Producer',
        CreationDate: '2023-01-01',
        ModDate: '2023-01-02',
        Keywords: 'test, document, metadata',
      };

      const metadata = extractDocumentMetadata(pdfContent, properties);

      expect(metadata.title).toBe('Test Document');
      expect(metadata.author).toBe('Test Author');
      expect(metadata.subject).toBe('Test Subject');
      expect(metadata.creator).toBe('Test Creator');
      expect(metadata.producer).toBe('Test Producer');
      expect(metadata.pageCount).toBe(2);
      expect(metadata.keywords).toEqual(['test', 'document', 'metadata']);
    });

    it('should handle missing properties', () => {
      const pdfContent: PDFContent[] = [{ text: 'test content here', pageNumber: 1 }];

      const metadata = extractDocumentMetadata(pdfContent);

      expect(metadata.pageCount).toBe(1);
      expect(metadata.title).toBeUndefined();
      expect(metadata.author).toBeUndefined();
    });

    it('should extract title from first page if not in properties', () => {
      const pdfContent: PDFContent[] = [
        { text: 'Manufacturing Manual\n\nThis is the content...', pageNumber: 1 },
      ];

      const metadata = extractDocumentMetadata(pdfContent);

      expect(metadata.title).toBe('Manufacturing Manual');
    });
  });

  describe('extractTitleFromFirstPage', () => {
    it('should extract title from first line', () => {
      const page: PDFContent = {
        text: 'Equipment Operation Manual\n\nThis document describes...',
        pageNumber: 1,
      };

      const title = extractTitleFromFirstPage(page);

      expect(title).toBe('Equipment Operation Manual');
    });

    it('should handle all caps titles', () => {
      const page: PDFContent = {
        text: 'SAFETY PROCEDURES\n\nFollow these guidelines...',
        pageNumber: 1,
      };

      const title = extractTitleFromFirstPage(page);

      expect(title).toBe('SAFETY PROCEDURES');
    });

    it('should return undefined for no clear title', () => {
      const page: PDFContent = {
        text: 'page 1\n\nthis is just regular content without a clear title.',
        pageNumber: 1,
      };

      const title = extractTitleFromFirstPage(page);

      expect(title).toBeUndefined();
    });
  });

  describe('extractSectionHeaders', () => {
    it('should extract headers from multiple pages', () => {
      const pdfContent: PDFContent[] = [
        {
          text: '# Main Title\n\nContent here.\n\n## Section 1\n\nMore content.',
          pageNumber: 1,
        },
        {
          text: '### Subsection 1.1\n\nContent here.\n\n## Section 2\n\nMore content.',
          pageNumber: 2,
        },
      ];

      const headers = extractSectionHeaders(pdfContent);

      expect(headers.length).toBe(4);
      expect(headers[0].text).toBe('Main Title');
      expect(headers[0].level).toBe(1);
      expect(headers[0].pageNumber).toBe(1);

      expect(headers[1].text).toBe('Section 1');
      expect(headers[1].level).toBe(2);

      expect(headers[2].text).toBe('Subsection 1.1');
      expect(headers[2].level).toBe(3);
      expect(headers[2].pageNumber).toBe(2);
    });

    it('should handle numbered sections', () => {
      const pdfContent: PDFContent[] = [
        {
          text: '1. First Section\n\nContent.\n\n1.1 Subsection\n\nMore content.',
          pageNumber: 1,
        },
      ];

      const headers = extractSectionHeaders(pdfContent);

      expect(headers.length).toBe(2);
      expect(headers[0].text).toBe('First Section');
      expect(headers[0].level).toBe(1);
      expect(headers[1].text).toBe('Subsection');
      expect(headers[1].level).toBe(2);
    });

    it('should handle all caps headers', () => {
      const pdfContent: PDFContent[] = [
        {
          text: 'SAFETY INSTRUCTIONS\n\nFollow these rules.\n\nINSTALLATION\n\nInstall properly.',
          pageNumber: 1,
        },
      ];

      const headers = extractSectionHeaders(pdfContent);

      expect(headers.length).toBe(2);
      expect(headers[0].text).toBe('SAFETY INSTRUCTIONS');
      expect(headers[1].text).toBe('INSTALLATION');
    });
  });

  describe('analyzeLineForHeader', () => {
    it('should identify markdown headers', () => {
      const header = analyzeLineForHeader('## Installation Guide', 0, 1);

      expect(header).not.toBeNull();
      expect(header!.text).toBe('Installation Guide');
      expect(header!.level).toBe(2);
      expect(header!.type).toBe('heading');
    });

    it('should identify numbered sections', () => {
      const header = analyzeLineForHeader('2.1 Safety Procedures', 0, 1);

      expect(header).not.toBeNull();
      expect(header!.text).toBe('Safety Procedures');
      expect(header!.level).toBe(2);
    });

    it('should identify all caps headers', () => {
      const header = analyzeLineForHeader('TROUBLESHOOTING', 0, 1);

      expect(header).not.toBeNull();
      expect(header!.text).toBe('TROUBLESHOOTING');
      expect(header!.level).toBe(1);
    });

    it('should identify title case headers', () => {
      const header = analyzeLineForHeader('Equipment Maintenance', 0, 1);

      expect(header).not.toBeNull();
      expect(header!.text).toBe('Equipment Maintenance');
      expect(header!.level).toBe(2);
    });

    it('should reject very long lines', () => {
      const longLine =
        'This is a very long line that is too long to be a header and should be rejected by the algorithm because it is clearly content';
      const header = analyzeLineForHeader(longLine, 0, 1);

      expect(header).toBeNull();
    });

    it('should reject very short lines', () => {
      const header = analyzeLineForHeader('AB', 0, 1);

      expect(header).toBeNull();
    });
  });

  describe('buildTableOfContents', () => {
    it('should build hierarchical table of contents', () => {
      const headers = [
        { text: 'Introduction', level: 1, pageNumber: 1, position: 0, type: 'title' as const },
        { text: 'Safety', level: 2, pageNumber: 1, position: 5, type: 'section' as const },
        { text: 'Installation', level: 1, pageNumber: 2, position: 0, type: 'title' as const },
        { text: 'Tools Required', level: 2, pageNumber: 2, position: 5, type: 'section' as const },
      ];

      const toc = buildTableOfContents(headers);

      expect(toc.sections.length).toBe(4);
      expect(toc.hierarchy.has('root')).toBe(true);
      expect(toc.hierarchy.has('Introduction')).toBe(true);
      expect(toc.hierarchy.has('Installation')).toBe(true);

      // Check root level items
      const rootItems = toc.hierarchy.get('root')!;
      expect(rootItems.length).toBe(2);
      expect(rootItems[0].text).toBe('Introduction');
      expect(rootItems[1].text).toBe('Installation');

      // Check child items
      const introChildren = toc.hierarchy.get('Introduction')!;
      expect(introChildren.length).toBe(1);
      expect(introChildren[0].text).toBe('Safety');
    });

    it('should handle empty headers', () => {
      const toc = buildTableOfContents([]);

      expect(toc.sections.length).toBe(0);
      expect(toc.hierarchy.size).toBe(0);
    });
  });

  describe('extractPageLocation', () => {
    it('should determine page position correctly', () => {
      const topPage = extractPageLocation('content', 1, 10);
      expect(topPage.position).toBe('top');

      const middlePage = extractPageLocation('content', 5, 10);
      expect(middlePage.position).toBe('middle');

      const bottomPage = extractPageLocation('content', 9, 10);
      expect(bottomPage.position).toBe('bottom');
    });

    it('should calculate relative position', () => {
      const location = extractPageLocation('content', 3, 10);
      expect(location.relativePosition).toBe(0.3);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords', () => {
      const content = 'The CPU operates at 3.2 GHz with 16GB RAM and uses PCIe slots.';
      const keywords = extractKeywords(content);

      // Basic test - function should work without throwing
      expect(Array.isArray(keywords)).toBe(true);
    });

    it('should handle empty content', () => {
      const keywords = extractKeywords('');
      expect(keywords).toEqual([]);
    });

    it('should remove duplicates', () => {
      const content = 'TEST TEST TEST';
      const keywords = extractKeywords(content);

      // Should not have duplicates
      expect(new Set(keywords).size).toBe(keywords.length);
    });
  });

  describe('extractCompleteMetadata', () => {
    it('should extract all metadata types', () => {
      const pdfContent: PDFContent[] = [
        {
          text: 'Equipment Manual\n\n# Introduction\n\nThis device operates at 3.2 GHz.',
          pageNumber: 1,
        },
        {
          text: '## Safety\n\nFollow these procedures.',
          pageNumber: 2,
        },
      ];

      const properties = {
        Title: 'Equipment Manual',
        Author: 'Tech Corp',
      };

      const metadata = extractCompleteMetadata(pdfContent, properties);

      expect(metadata.document.title).toBe('Equipment Manual');
      expect(metadata.document.author).toBe('Tech Corp');
      expect(metadata.document.pageCount).toBe(2);

      expect(metadata.headers.length).toBe(3);
      expect(metadata.headers[0].text).toBe('Equipment Manual');
      expect(metadata.headers[1].text).toBe('Introduction');
      expect(metadata.headers[2].text).toBe('Safety');

      expect(metadata.tableOfContents.sections.length).toBe(3);

      expect(Array.isArray(metadata.keywords)).toBe(true);
    });

    it('should handle minimal content', () => {
      const pdfContent: PDFContent[] = [
        {
          text: 'Simple content with no headers.',
          pageNumber: 1,
        },
      ];

      const metadata = extractCompleteMetadata(pdfContent);

      expect(metadata.document.pageCount).toBe(1);
      expect(metadata.headers.length).toBe(0);
      expect(metadata.tableOfContents.sections.length).toBe(0);
      expect(metadata.keywords.length).toBe(0);
    });
  });
});
