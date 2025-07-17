/**
 * Tests for metadata enhancement functionality
 */

import { MetadataEnhancer, EnhancedChunkMetadata } from '../metadata-enhancer';
import { DocumentChunk, PDFContent } from '../../types/chunking';

describe('MetadataEnhancer', () => {
  let enhancer: MetadataEnhancer;

  beforeEach(() => {
    enhancer = new MetadataEnhancer();
  });

  // Helper function to create test chunks
  const createTestChunk = (
    id: string,
    content: string,
    options: {
      sectionHeader?: string;
      hierarchyLevel?: number;
      parentChunkId?: string;
      chunkIndex?: number;
    } = {},
  ): DocumentChunk => ({
    id,
    content,
    metadata: {
      id,
      documentId: 'test-doc',
      chunkIndex: options.chunkIndex || 0,
      startPage: 1,
      endPage: 1,
      sectionHeader: options.sectionHeader,
      contentType: {
        hasTable: false,
        hasList: false,
        hasCode: false,
        hasImage: false,
        hasDiagram: false,
      },
    },
    relationships: {
      hierarchyLevel: options.hierarchyLevel || 0,
      parentChunkId: options.parentChunkId,
      childChunkIds: [],
      previousChunkId: undefined,
      nextChunkId: undefined,
    },
    tenantId: 'test-tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Helper function to create test PDF content
  const createTestPDFContent = (text: string, pageNumber: number = 1): PDFContent => ({
    text,
    pageNumber,
  });

  describe('enhanceChunks', () => {
    it('should enhance chunks with comprehensive metadata', () => {
      const chunks = [
        createTestChunk('chunk1', 'This is the introduction to the motor assembly guide.', {
          sectionHeader: 'Introduction',
          hierarchyLevel: 0,
          chunkIndex: 0,
        }),
        createTestChunk(
          'chunk2',
          'Safety WARNING: Always disconnect power before servicing. The voltage is 480V.',
          {
            sectionHeader: 'Safety Instructions',
            hierarchyLevel: 1,
            parentChunkId: 'chunk1',
            chunkIndex: 1,
          },
        ),
      ];

      const pdfContent = [
        createTestPDFContent(
          'Motor Assembly Guide\nModel: M-1234\nManufacturer: ACME Corp\nVersion: 2.1',
        ),
        createTestPDFContent('Introduction and safety content here'),
      ];

      const enhancedChunks = enhancer.enhanceChunks(chunks, pdfContent);

      expect(enhancedChunks.length).toBe(2);

      // Check first chunk metadata
      const firstMeta = enhancedChunks[0].metadata as EnhancedChunkMetadata;
      expect(firstMeta.documentContext).toBeDefined();
      expect(firstMeta.documentContext.pageCount).toBe(2);
      expect(firstMeta.documentContext.manufacturerName).toBe('ACME Corp');
      expect(firstMeta.documentContext.equipmentModel).toBe('M-1234');
      expect(firstMeta.documentContext.manualVersion).toBe('2.1');

      expect(firstMeta.sectionContext).toBeDefined();
      expect(firstMeta.sectionContext.fullPath).toEqual(['Introduction']);
      expect(firstMeta.sectionContext.depth).toBe(0);
      expect(firstMeta.sectionContext.sectionType).toBe('introduction');

      expect(firstMeta.contentStats).toBeDefined();
      expect(firstMeta.contentStats.wordCount).toBeGreaterThan(0);
      expect(firstMeta.contentStats.sentenceCount).toBeGreaterThan(0);

      expect(firstMeta.processingStats).toBeDefined();
      expect(firstMeta.processingStats.totalProcessingTime).toBeGreaterThan(0);

      // Check second chunk metadata
      const secondMeta = enhancedChunks[1].metadata as EnhancedChunkMetadata;
      expect(secondMeta.sectionContext.fullPath).toEqual(['Introduction', 'Safety Instructions']);
      expect(secondMeta.sectionContext.sectionType).toBe('safety');

      expect(secondMeta.semanticContext.warnings.length).toBeGreaterThan(0);
      expect(secondMeta.semanticContext.entities.some((e) => e.type === 'warning')).toBe(true);
      expect(
        secondMeta.semanticContext.entities.some(
          (e) => e.type === 'measurement' && e.value.includes('480V'),
        ),
      ).toBe(true);
    });

    it('should handle empty chunks array', () => {
      const chunks: DocumentChunk[] = [];
      const pdfContent: PDFContent[] = [];

      const enhancedChunks = enhancer.enhanceChunks(chunks, pdfContent);

      expect(enhancedChunks).toEqual([]);
    });

    it('should extract document type correctly', () => {
      const chunks = [createTestChunk('chunk1', 'Content here')];

      const testCases = [
        { text: 'User Manual for Model X', expectedType: 'user_manual' },
        { text: 'Service Manual - Professional Use Only', expectedType: 'service_manual' },
        { text: 'Installation Guide v1.0', expectedType: 'installation_guide' },
        { text: 'Parts Catalog 2024', expectedType: 'parts_catalog' },
        { text: 'Technical Specification Sheet', expectedType: 'technical_specification' },
        { text: 'Safety Instructions Manual', expectedType: 'safety_manual' },
        { text: 'Equipment Documentation', expectedType: 'general_manual' },
      ];

      for (const testCase of testCases) {
        const pdfContent = [createTestPDFContent(testCase.text)];
        const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
        const meta = enhanced[0].metadata as EnhancedChunkMetadata;

        expect(meta.documentContext.documentType).toBe(testCase.expectedType);
      }
    });
  });

  describe('content statistics', () => {
    it('should calculate word and sentence statistics correctly', () => {
      const chunks = [
        createTestChunk(
          'chunk1',
          'This is a test. It has multiple sentences! How many words are there?',
        ),
      ];

      const pdfContent = [createTestPDFContent('Test document')];
      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
      const meta = enhanced[0].metadata as EnhancedChunkMetadata;

      expect(meta.contentStats.wordCount).toBe(13);
      expect(meta.contentStats.sentenceCount).toBe(3);
      expect(meta.contentStats.averageWordLength).toBeGreaterThan(3);
      expect(meta.contentStats.uniqueTerms).toBe(12); // "is" appears twice
    });

    it('should extract technical terms', () => {
      const chunks = [
        createTestChunk(
          'chunk1',
          'The motor operates at 1800 RPM with a voltage of 480V and current of 25A. Temperature should not exceed 85°C.',
        ),
      ];

      const pdfContent = [createTestPDFContent('Technical manual')];
      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
      const meta = enhanced[0].metadata as EnhancedChunkMetadata;

      expect(meta.contentStats.technicalDensity).toBeGreaterThan(0);
      expect(meta.contentStats.keyTerms).toContain('motor');
      expect(meta.contentStats.keyTerms).toContain('temperature');
    });

    it('should calculate readability score', () => {
      const chunks = [createTestChunk('chunk1', 'Simple text. Short words. Easy read.')];

      const pdfContent = [createTestPDFContent('Test')];
      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
      const meta = enhanced[0].metadata as EnhancedChunkMetadata;

      expect(meta.contentStats.readabilityScore).toBeDefined();
      expect(meta.contentStats.readabilityScore).toBeGreaterThan(0);
      expect(meta.contentStats.readabilityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('semantic context extraction', () => {
    it('should extract entities correctly', () => {
      const chunks = [
        createTestChunk(
          'chunk1',
          'Part number M-1234-ABC requires tool T-567. WARNING: High voltage 480V present. Torque to 50 Nm.',
        ),
      ];

      const pdfContent = [createTestPDFContent('Test')];
      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
      const meta = enhanced[0].metadata as EnhancedChunkMetadata;

      const entities = meta.semanticContext.entities;

      // Check part entity
      const partEntity = entities.find((e) => e.type === 'part' && e.value === 'M-1234-ABC');
      expect(partEntity).toBeDefined();
      expect(partEntity?.confidence).toBeGreaterThan(0.8);

      // Check measurement entities
      const voltageEntity = entities.find(
        (e) => e.type === 'measurement' && e.value.includes('480V'),
      );
      expect(voltageEntity).toBeDefined();

      const torqueEntity = entities.find(
        (e) => e.type === 'measurement' && e.value.includes('50 Nm'),
      );
      expect(torqueEntity).toBeDefined();

      // Check warning entity
      const warningEntity = entities.find((e) => e.type === 'warning');
      expect(warningEntity).toBeDefined();
      expect(warningEntity?.category).toBe('WARNING');
    });

    it('should extract cross references', () => {
      const chunks = [
        createTestChunk(
          'chunk1',
          'See section 3.2 for details. Refer to Figure 4.1 for wiring diagram. Additional info on page 42.',
        ),
      ];

      const pdfContent = [createTestPDFContent('Test')];
      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
      const meta = enhanced[0].metadata as EnhancedChunkMetadata;

      const refs = meta.semanticContext.crossReferences;

      expect(refs.some((r) => r.targetType === 'section' && r.target === '3.2')).toBe(true);
      expect(refs.some((r) => r.targetType === 'figure' && r.target === '4.1')).toBe(true);
      expect(refs.some((r) => r.targetType === 'page' && r.target === '42')).toBe(true);
    });

    it('should extract procedures', () => {
      const chunks = [
        createTestChunk(
          'chunk1',
          '1. Remove the cover plate.\n2. Disconnect the power cable.\n3. Install the new component.\nVerify proper operation.',
        ),
      ];

      const pdfContent = [createTestPDFContent('Test')];
      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
      const meta = enhanced[0].metadata as EnhancedChunkMetadata;

      const procedures = meta.semanticContext.procedures;

      expect(procedures.length).toBeGreaterThan(0);
      expect(procedures[0]).toBe('Remove the cover plate.');
      expect(procedures[1]).toBe('Disconnect the power cable.');
      expect(procedures[2]).toBe('Install the new component.');
    });
  });

  describe('section context', () => {
    it('should build correct section hierarchy', () => {
      const chunks = [
        createTestChunk('chunk1', 'Chapter 1', { sectionHeader: 'Chapter 1', hierarchyLevel: 0 }),
        createTestChunk('chunk2', 'Section 1.1', {
          sectionHeader: 'Section 1.1',
          hierarchyLevel: 1,
          parentChunkId: 'chunk1',
        }),
        createTestChunk('chunk3', 'Subsection 1.1.1', {
          sectionHeader: 'Subsection 1.1.1',
          hierarchyLevel: 2,
          parentChunkId: 'chunk2',
        }),
      ];

      const pdfContent = [createTestPDFContent('Test')];
      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);

      const meta3 = enhanced[2].metadata as EnhancedChunkMetadata;
      expect(meta3.sectionContext.fullPath).toEqual([
        'Chapter 1',
        'Section 1.1',
        'Subsection 1.1.1',
      ]);
      expect(meta3.sectionContext.parentSections).toEqual(['Chapter 1', 'Section 1.1']);
      expect(meta3.sectionContext.depth).toBe(2);
    });

    it('should detect section types', () => {
      const testCases = [
        { text: 'Introduction to the system', expectedType: 'introduction' },
        { text: 'Safety warnings and precautions', expectedType: 'safety' },
        { text: 'Technical specifications', expectedType: 'specifications' },
        { text: 'Installation procedures', expectedType: 'procedures' },
        { text: 'Troubleshooting guide', expectedType: 'troubleshooting' },
        { text: 'Maintenance schedule', expectedType: 'maintenance' },
        { text: 'Parts list and ordering', expectedType: 'parts' },
        { text: 'Appendix A: Glossary', expectedType: 'appendix' },
        { text: 'Random content', expectedType: 'other' },
      ];

      for (const testCase of testCases) {
        const chunks = [createTestChunk('chunk1', testCase.text)];
        const pdfContent = [createTestPDFContent('Test')];
        const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
        const meta = enhanced[0].metadata as EnhancedChunkMetadata;

        expect(meta.sectionContext.sectionType).toBe(testCase.expectedType);
      }
    });
  });

  describe('quality metrics', () => {
    it('should calculate completeness score', () => {
      const completeChunk = createTestChunk(
        'chunk1',
        'This is a complete sentence with proper punctuation. It has sufficient content to be meaningful.',
      );
      const incompleteChunk = createTestChunk('chunk2', 'This is incomplete and');

      const pdfContent = [createTestPDFContent('Test')];

      const enhanced1 = enhancer.enhanceChunks([completeChunk], pdfContent);
      const enhanced2 = enhancer.enhanceChunks([incompleteChunk], pdfContent);

      const meta1 = enhanced1[0].metadata as EnhancedChunkMetadata;
      const meta2 = enhanced2[0].metadata as EnhancedChunkMetadata;

      expect(meta1.qualityMetrics.completeness).toBeGreaterThan(meta2.qualityMetrics.completeness);
    });

    it('should calculate relevance based on semantic content', () => {
      const relevantChunk = createTestChunk(
        'chunk1',
        'Part M-123 installation: 1. Remove cover. 2. Install component. See Figure 3.1 for details. WARNING: High voltage.',
      );
      const lessRelevantChunk = createTestChunk(
        'chunk2',
        'This is some general text without specific technical content.',
      );

      const pdfContent = [createTestPDFContent('Test')];

      const enhanced1 = enhancer.enhanceChunks([relevantChunk], pdfContent);
      const enhanced2 = enhancer.enhanceChunks([lessRelevantChunk], pdfContent);

      const meta1 = enhanced1[0].metadata as EnhancedChunkMetadata;
      const meta2 = enhanced2[0].metadata as EnhancedChunkMetadata;

      expect(meta1.qualityMetrics.relevance).toBeGreaterThan(meta2.qualityMetrics.relevance);
    });

    it('should calculate embedding readiness', () => {
      const goodChunk = createTestChunk(
        'chunk1',
        'This is a well-formatted chunk with appropriate length. It contains meaningful content that is suitable for embedding. The text is clear and contains relevant technical information without being overly dense with jargon.',
      );
      const badChunk = createTestChunk('chunk2', 'Short.');

      const pdfContent = [createTestPDFContent('Test')];

      const enhanced1 = enhancer.enhanceChunks([goodChunk], pdfContent);
      const enhanced2 = enhancer.enhanceChunks([badChunk], pdfContent);

      const meta1 = enhanced1[0].metadata as EnhancedChunkMetadata;
      const meta2 = enhanced2[0].metadata as EnhancedChunkMetadata;

      expect(meta1.qualityMetrics.embeddingReadiness).toBeGreaterThan(
        meta2.qualityMetrics.embeddingReadiness,
      );
    });
  });

  describe('processing statistics', () => {
    it('should track timing information', () => {
      const chunks = [createTestChunk('chunk1', 'Test content')];
      const pdfContent = [createTestPDFContent('Test')];

      // Set some timing information
      enhancer.setExtractionTimings(1000, 2000);
      enhancer.setPreprocessingTimings(2000, 3000);
      enhancer.setChunkingTimings(3000, 4000);

      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
      const meta = enhanced[0].metadata as EnhancedChunkMetadata;

      expect(meta.processingStats.extractionTime).toBe(1000);
      expect(meta.processingStats.preprocessingTime).toBe(1000);
      expect(meta.processingStats.chunkingTime).toBe(1000);
      expect(meta.processingStats.totalProcessingTime).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle chunks with minimal content', () => {
      const chunks = [createTestChunk('chunk1', '')];
      const pdfContent = [createTestPDFContent('')];

      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);
      const meta = enhanced[0].metadata as EnhancedChunkMetadata;

      expect(meta.contentStats.wordCount).toBe(0);
      expect(meta.contentStats.sentenceCount).toBe(0);
      expect(meta.semanticContext.entities).toEqual([]);
      expect(meta.qualityMetrics.completeness).toBe(0);
    });

    it('should handle malformed section headers', () => {
      const chunks = [
        createTestChunk('chunk1', 'Content', { sectionHeader: undefined }),
        createTestChunk('chunk2', 'More content', {
          sectionHeader: '   ',
          parentChunkId: 'chunk1',
        }),
      ];

      const pdfContent = [createTestPDFContent('Test')];
      const enhanced = enhancer.enhanceChunks(chunks, pdfContent);

      const meta1 = enhanced[0].metadata as EnhancedChunkMetadata;
      const meta2 = enhanced[1].metadata as EnhancedChunkMetadata;

      expect(meta1.sectionContext.fullPath).toEqual([]);
      expect(meta2.sectionContext.fullPath).toEqual(['   ']);
    });
  });
});
