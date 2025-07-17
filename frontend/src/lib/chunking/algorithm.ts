/**
 * Core chunking algorithm implementation
 */

import {
  ChunkConfig,
  DocumentChunk,
  ChunkMetadata,
  ChunkRelationships,
  PDFContent,
  TokenCount,
  DEFAULT_CHUNK_CONFIG,
  CONTENT_PATTERNS,
} from '../types/chunking';
import {
  analyzeSpecialContent,
  shouldKeepTogether,
  calculateSpecialContentWeight,
} from './content-handlers';
import { preprocessText, cleanForEmbedding, validateTextQuality } from './preprocessing';
import { MetadataEnhancer } from './metadata-enhancer';

/**
 * Simple token counting utility
 * Approximates tokens as words + punctuation
 */
export function countTokens(text: string): TokenCount {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const punctuation = (text.match(/[.,!?;:()[\]{}]/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;
  const whitespace = (text.match(/\s/g) || []).length;

  return {
    count: words.length + punctuation + numbers,
    breakdown: {
      text: words.length,
      whitespace,
      punctuation,
      numbers,
    },
  };
}

/**
 * Finds sentence boundaries in text
 */
export function findSentenceBoundaries(text: string): number[] {
  const boundaries: number[] = [];
  const regex = /[.!?]+/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Skip if this is the last match and it's at the end
    if (match.index + match[0].length >= text.length) {
      break;
    }
    boundaries.push(match.index + match[0].length);
  }

  return boundaries;
}

/**
 * Finds paragraph boundaries in text
 */
export function findParagraphBoundaries(text: string): number[] {
  const boundaries: number[] = [];
  const regex = /\n\s*\n/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    boundaries.push(match.index + match[0].length);
  }

  return boundaries;
}

/**
 * Finds the best boundary within a range to split text
 */
export function findBestBoundary(
  text: string,
  startIndex: number,
  maxIndex: number,
  config: ChunkConfig,
): number {
  const searchText = text.substring(startIndex, maxIndex);

  // Try paragraph boundaries first
  if (config.respectParagraphs) {
    const paragraphBoundaries = findParagraphBoundaries(searchText);
    if (paragraphBoundaries.length > 0) {
      const lastParagraphBoundary = paragraphBoundaries[paragraphBoundaries.length - 1];
      return startIndex + lastParagraphBoundary;
    }
  }

  // Try sentence boundaries
  if (config.respectSentences) {
    const sentenceBoundaries = findSentenceBoundaries(searchText);
    if (sentenceBoundaries.length > 0) {
      const lastSentenceBoundary = sentenceBoundaries[sentenceBoundaries.length - 1];
      return startIndex + lastSentenceBoundary;
    }
  }

  // Fall back to word boundaries
  const words = searchText.split(/\s+/);
  let wordPosition = 0;
  for (let i = 0; i < words.length - 1; i++) {
    wordPosition += words[i].length;
    // Add space
    while (wordPosition < searchText.length && /\s/.test(searchText[wordPosition])) {
      wordPosition++;
    }

    if (wordPosition < searchText.length * 0.8) {
      continue;
    }

    return startIndex + wordPosition;
  }

  // If no good boundary found, use max index
  return maxIndex;
}

/**
 * Detects content types in a chunk
 */
export function detectContentTypes(text: string) {
  return {
    hasTable: CONTENT_PATTERNS.TABLE_START.test(text),
    hasList: CONTENT_PATTERNS.LIST_BULLETED.test(text) || CONTENT_PATTERNS.LIST_NUMBERED.test(text),
    hasImage: /\[image\]|\[figure\]|\[diagram\]/i.test(text),
    hasCode: CONTENT_PATTERNS.CODE_BLOCK.test(text),
    hasDiagram: /diagram|figure|chart|graph/i.test(text),
  };
}

/**
 * Extracts section information from text
 */
export function extractSectionInfo(
  text: string,
  allText: string,
  startIndex: number,
): {
  sectionHeader?: string;
  subsectionHeader?: string;
  tocPath?: string[];
  hierarchyLevel: number;
} {
  // Look backwards from current position to find section headers
  const beforeText = allText.substring(0, startIndex + text.length);
  const headerMatches = beforeText.match(/^#{1,6}\s+(.+)$/gm);

  if (headerMatches && headerMatches.length > 0) {
    const lastHeader = headerMatches[headerMatches.length - 1];
    const headerLevel = (lastHeader.match(/^#+/) || [''])[0].length;
    const headerText = lastHeader.replace(/^#+\s+/, '').trim();

    return {
      sectionHeader: headerText,
      hierarchyLevel: headerLevel,
      tocPath: [headerText],
    };
  }

  // Also check within the current text for headers
  const internalHeaders = text.match(/^#{1,6}\s+(.+)$/gm);
  if (internalHeaders && internalHeaders.length > 0) {
    const firstHeader = internalHeaders[0];
    const headerLevel = (firstHeader.match(/^#+/) || [''])[0].length;
    const headerText = firstHeader.replace(/^#+\s+/, '').trim();

    return {
      sectionHeader: headerText,
      hierarchyLevel: headerLevel,
      tocPath: [headerText],
    };
  }

  return {
    hierarchyLevel: 0,
  };
}

/**
 * Main chunking algorithm
 */
export class DocumentChunker {
  private config: ChunkConfig;

  constructor(config: Partial<ChunkConfig> = {}) {
    this.config = { ...DEFAULT_CHUNK_CONFIG, ...config };
  }

  /**
   * Chunks a document into smaller pieces
   */
  chunkDocument(
    documentId: string,
    tenantId: string,
    pdfContent: PDFContent[],
    documentTitle?: string,
    documentAuthor?: string,
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];

    // Create metadata enhancer instance
    const metadataEnhancer = new MetadataEnhancer();

    // Record extraction start time
    const extractionStart = Date.now();

    // Combine all page content
    const rawText = pdfContent
      .map((page) => page.text)
      .join('\n\n')
      .trim();

    // Skip empty documents
    if (!rawText || rawText.length === 0) {
      return chunks;
    }

    // Skip documents with only whitespace
    if (!/\S/.test(rawText)) {
      return chunks;
    }

    // Record extraction end and preprocessing start
    const extractionEnd = Date.now();
    metadataEnhancer.setExtractionTimings(extractionStart, extractionEnd);

    const preprocessingStart = Date.now();

    // Preprocess text for optimal chunking and embedding quality
    const preprocessed = preprocessText(rawText, {
      normalizeWhitespace: true,
      removeExtraLineBreaks: true,
      normalizeUnicode: true,
      fixEncodingIssues: true,
      preserveStructure: true,
      removeNonPrintable: true,
      normalizeQuotes: true,
      normalizeDashes: true,
      preserveSpecialContent: true,
    });

    const fullText = preprocessed.content;

    // Record preprocessing end and chunking start
    const preprocessingEnd = Date.now();
    metadataEnhancer.setPreprocessingTimings(preprocessingStart, preprocessingEnd);

    const chunkingStart = Date.now();

    let currentIndex = 0;
    let chunkIndex = 0;

    while (currentIndex < fullText.length) {
      const chunkId = `${documentId}_chunk_${chunkIndex}`;

      // Calculate chunk end position
      const maxChunkEnd = Math.min(currentIndex + this.config.chunkSize, fullText.length);

      // Find the best boundary
      const chunkEnd = findBestBoundary(fullText, currentIndex, maxChunkEnd, this.config);

      // Extract chunk content
      const rawChunkContent = fullText.substring(currentIndex, chunkEnd).trim();

      // Apply final cleaning for embedding optimization
      const chunkContent = cleanForEmbedding(rawChunkContent);

      // Analyze special content types
      const specialContent = analyzeSpecialContent(chunkContent, 1);

      // Check if content should be kept together
      if (shouldKeepTogether(chunkContent, specialContent)) {
        // Try to keep special content together by adjusting chunk boundaries
        const adjustedEnd = this.adjustBoundaryForSpecialContent(
          fullText,
          currentIndex,
          chunkEnd,
          specialContent,
        );
        if (adjustedEnd !== chunkEnd) {
          // Use adjusted boundary
          const adjustedContent = fullText.substring(currentIndex, adjustedEnd).trim();
          const specialChunk = this.createChunkWithSpecialContent(
            adjustedContent,
            documentId,
            tenantId,
            chunkIndex,
            pdfContent,
            documentTitle,
            documentAuthor,
            fullText,
            currentIndex,
            adjustedEnd,
          );
          chunks.push(specialChunk);

          // Move to next chunk
          currentIndex = adjustedEnd - this.config.overlap;
          if (currentIndex <= adjustedEnd - adjustedContent.length) {
            currentIndex = adjustedEnd;
          }
          chunkIndex++;
          continue;
        }
      }

      // Skip if chunk is too small
      if (countTokens(chunkContent).count < this.config.minChunkSize && chunkIndex > 0) {
        // Add to previous chunk instead
        if (chunks.length > 0) {
          chunks[chunks.length - 1].content += '\n' + chunkContent;
        }
        break;
      }

      // Find which pages this chunk spans
      const { startPage, endPage } = this.findPageSpan(pdfContent, currentIndex, chunkEnd);

      // Extract section information
      const sectionInfo = extractSectionInfo(chunkContent, fullText, currentIndex);

      // Re-analyze special content for metadata
      const contentAnalysis = analyzeSpecialContent(chunkContent, 1);
      const contentWeight = calculateSpecialContentWeight(contentAnalysis);
      const baseTokens = countTokens(chunkContent);

      // Validate text quality
      const qualityValidation = validateTextQuality(rawChunkContent, chunkContent);

      // Create chunk metadata
      const metadata: ChunkMetadata = {
        id: chunkId,
        documentId,
        chunkIndex,
        startPage,
        endPage,
        sectionHeader: sectionInfo.sectionHeader,
        subsectionHeader: sectionInfo.subsectionHeader,
        documentTitle,
        documentAuthor,
        tocPath: sectionInfo.tocPath,
        pagePosition: this.determinePagePosition(currentIndex, chunkEnd, fullText.length),
        contentType: detectContentTypes(chunkContent),
        tokenCount: {
          ...baseTokens,
          count: Math.round(baseTokens.count * contentWeight),
        },
        specialContent: {
          tables: contentAnalysis.tables.length,
          lists: contentAnalysis.lists.length,
          diagrams: contentAnalysis.diagrams.length,
          codeBlocks: contentAnalysis.codeBlocks.length,
          technicalFormats: contentAnalysis.technicalFormats.length,
          weight: contentWeight,
        },
        preprocessing: {
          originalLength: rawChunkContent.length,
          normalizedLength: chunkContent.length,
          transformations: [], // Individual chunk transformations would be minimal
          qualityScore: qualityValidation.qualityScore,
        },
      };

      // Create chunk relationships
      const relationships: ChunkRelationships = {
        previousChunkId: chunkIndex > 0 ? `${documentId}_chunk_${chunkIndex - 1}` : undefined,
        nextChunkId:
          chunkEnd < fullText.length ? `${documentId}_chunk_${chunkIndex + 1}` : undefined,
        parentChunkId: undefined, // Will be set in post-processing
        childChunkIds: [],
        hierarchyLevel: sectionInfo.hierarchyLevel,
      };

      // Create the chunk
      const chunk: DocumentChunk = {
        id: chunkId,
        content: chunkContent,
        metadata,
        relationships,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      chunks.push(chunk);

      // Move to next chunk with overlap
      const nextIndex = chunkEnd - this.config.overlap;
      if (nextIndex <= currentIndex) {
        // If overlap would put us at same position, move forward
        currentIndex = chunkEnd;
      } else {
        currentIndex = nextIndex;
      }
      chunkIndex++;
    }

    // Post-process to establish parent-child relationships
    this.establishHierarchicalRelationships(chunks);

    // Record chunking end time
    const chunkingEnd = Date.now();
    metadataEnhancer.setChunkingTimings(chunkingStart, chunkingEnd);

    // Enhance chunks with comprehensive metadata
    const enhancedChunks = metadataEnhancer.enhanceChunks(chunks, pdfContent, {
      documentTitle,
      documentAuthor,
    });

    return enhancedChunks;
  }

  /**
   * Finds which pages a chunk spans
   */
  private findPageSpan(
    pdfContent: PDFContent[],
    startIndex: number,
    endIndex: number,
  ): {
    startPage: number;
    endPage: number;
  } {
    let currentIndex = 0;
    let startPage = 1;
    let endPage = 1;

    for (const page of pdfContent) {
      const pageEndIndex = currentIndex + page.text.length + 2; // +2 for \n\n

      if (currentIndex <= startIndex && startIndex < pageEndIndex) {
        startPage = page.pageNumber;
      }

      if (currentIndex <= endIndex && endIndex <= pageEndIndex) {
        endPage = page.pageNumber;
        break;
      }

      currentIndex = pageEndIndex;
    }

    return { startPage, endPage };
  }

  /**
   * Determines position within page
   */
  private determinePagePosition(
    startIndex: number,
    endIndex: number,
    totalLength: number,
  ): 'top' | 'middle' | 'bottom' {
    const relativeStart = startIndex / totalLength;
    const relativeEnd = endIndex / totalLength;
    const relativeMid = (relativeStart + relativeEnd) / 2;

    if (relativeMid < 0.33) return 'top';
    if (relativeMid > 0.66) return 'bottom';
    return 'middle';
  }

  /**
   * Establishes parent-child relationships between chunks
   */
  private establishHierarchicalRelationships(chunks: DocumentChunk[]): void {
    for (let i = 0; i < chunks.length; i++) {
      const currentChunk = chunks[i];
      const currentLevel = currentChunk.relationships.hierarchyLevel;

      // Find parent (previous chunk with lower hierarchy level)
      for (let j = i - 1; j >= 0; j--) {
        const potentialParent = chunks[j];
        if (potentialParent.relationships.hierarchyLevel < currentLevel) {
          currentChunk.relationships.parentChunkId = potentialParent.id;
          potentialParent.relationships.childChunkIds.push(currentChunk.id);
          break;
        }
      }
    }
  }

  /**
   * Adjusts chunk boundary to keep special content together
   */
  private adjustBoundaryForSpecialContent(
    fullText: string,
    startIndex: number,
    originalEnd: number,
    specialContent: any,
  ): number {
    // If we have tables, try to include the entire table
    if (specialContent.tables.length > 0) {
      // Find the end of the last table
      const lastTable = specialContent.tables[specialContent.tables.length - 1];
      const tableEnd = this.findContentEnd(fullText, startIndex, 'table');
      return Math.min(tableEnd, fullText.length);
    }

    // If we have code blocks, include the entire block
    if (specialContent.codeBlocks.length > 0) {
      const codeEnd = this.findContentEnd(fullText, startIndex, 'code');
      return Math.min(codeEnd, fullText.length);
    }

    // If we have short lists, include the entire list
    if (specialContent.lists.length > 0) {
      const totalItems = specialContent.lists.reduce((sum, list) => sum + list.items.length, 0);
      if (totalItems <= 10) {
        const listEnd = this.findContentEnd(fullText, startIndex, 'list');
        return Math.min(listEnd, fullText.length);
      }
    }

    return originalEnd;
  }

  /**
   * Finds the end of special content
   */
  private findContentEnd(fullText: string, startIndex: number, contentType: string): number {
    const searchText = fullText.substring(startIndex);

    switch (contentType) {
      case 'table':
        // Find the end of table-like content
        const tableEnd = searchText.search(/\n\n(?![|\-\+\s])/);
        return tableEnd === -1 ? fullText.length : startIndex + tableEnd;

      case 'code':
        // Find the end of code block
        const codeEnd = searchText.search(/```\s*$/m);
        return codeEnd === -1 ? fullText.length : startIndex + codeEnd + 3;

      case 'list':
        // Find the end of list
        const listEnd = searchText.search(/\n\n(?![•\-\*\+\d\.\s])/);
        return listEnd === -1 ? fullText.length : startIndex + listEnd;

      default:
        return fullText.length;
    }
  }

  /**
   * Creates a chunk with special content handling
   */
  private createChunkWithSpecialContent(
    content: string,
    documentId: string,
    tenantId: string,
    chunkIndex: number,
    pdfContent: PDFContent[],
    documentTitle?: string,
    documentAuthor?: string,
    fullText?: string,
    startIndex?: number,
    endIndex?: number,
  ): DocumentChunk {
    const chunkId = `${documentId}_chunk_${chunkIndex}`;
    const specialContent = analyzeSpecialContent(content, 1);

    // Calculate weighted token count
    const baseTokens = countTokens(content);
    const weight = calculateSpecialContentWeight(specialContent);

    // Find page span
    const { startPage, endPage } = this.findPageSpan(
      pdfContent,
      startIndex || 0,
      endIndex || content.length,
    );

    // Extract section information
    const sectionInfo = extractSectionInfo(content, fullText || content, startIndex || 0);

    // Validate text quality
    const qualityValidation = validateTextQuality(content, content);

    // Create enhanced metadata with special content info
    const metadata: ChunkMetadata = {
      id: chunkId,
      documentId,
      chunkIndex,
      startPage,
      endPage,
      sectionHeader: sectionInfo.sectionHeader,
      subsectionHeader: sectionInfo.subsectionHeader,
      documentTitle,
      documentAuthor,
      tocPath: sectionInfo.tocPath,
      pagePosition: this.determinePagePosition(
        startIndex || 0,
        endIndex || content.length,
        fullText?.length || content.length,
      ),
      contentType: detectContentTypes(content),
      tokenCount: {
        ...baseTokens,
        count: Math.round(baseTokens.count * weight), // Apply weight
      },
      specialContent: {
        tables: specialContent.tables.length,
        lists: specialContent.lists.length,
        diagrams: specialContent.diagrams.length,
        codeBlocks: specialContent.codeBlocks.length,
        technicalFormats: specialContent.technicalFormats.length,
        weight,
      },
      preprocessing: {
        originalLength: content.length,
        normalizedLength: content.length,
        transformations: [],
        qualityScore: qualityValidation.qualityScore,
      },
    };

    // Create relationships
    const relationships: ChunkRelationships = {
      previousChunkId: chunkIndex > 0 ? `${documentId}_chunk_${chunkIndex - 1}` : undefined,
      nextChunkId: undefined, // Will be set by caller
      parentChunkId: undefined,
      childChunkIds: [],
      hierarchyLevel: sectionInfo.hierarchyLevel,
    };

    return {
      id: chunkId,
      content,
      metadata,
      relationships,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Updates configuration
   */
  updateConfig(newConfig: Partial<ChunkConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current configuration
   */
  getConfig(): ChunkConfig {
    return { ...this.config };
  }
}
