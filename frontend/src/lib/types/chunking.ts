/**
 * Types for document chunking functionality
 */

export interface ChunkConfig {
  /** Maximum size of each chunk in tokens */
  chunkSize: number;
  /** Number of tokens to overlap between chunks */
  overlap: number;
  /** Whether to respect sentence boundaries */
  respectSentences: boolean;
  /** Whether to respect paragraph boundaries */
  respectParagraphs: boolean;
  /** Minimum chunk size to avoid very small chunks */
  minChunkSize: number;
}

export interface ChunkMetadata {
  /** Unique identifier for the chunk */
  id: string;
  /** Document this chunk belongs to */
  documentId: string;
  /** Sequential chunk number within document */
  chunkIndex: number;
  /** Page number where chunk starts */
  startPage: number;
  /** Page number where chunk ends */
  endPage: number;
  /** Section header this chunk belongs to */
  sectionHeader?: string;
  /** Subsection header if applicable */
  subsectionHeader?: string;
  /** Document title */
  documentTitle?: string;
  /** Document author */
  documentAuthor?: string;
  /** Table of contents path */
  tocPath?: string[];
  /** Position within the page (top, middle, bottom) */
  pagePosition?: 'top' | 'middle' | 'bottom';
  /** Content type indicators */
  contentType: {
    hasTable: boolean;
    hasList: boolean;
    hasImage: boolean;
    hasCode: boolean;
    hasDiagram: boolean;
  };
  /** Token count information */
  tokenCount?: TokenCount;
  /** Special content analysis */
  specialContent?: {
    tables: number;
    lists: number;
    diagrams: number;
    codeBlocks: number;
    technicalFormats: number;
    weight: number;
  };
  /** Text preprocessing information */
  preprocessing?: {
    originalLength: number;
    normalizedLength: number;
    transformations: string[];
    qualityScore: number;
  };
  /** Document-level context (enhanced metadata) */
  documentContext?: {
    fileName?: string;
    fileSize?: number;
    pageCount: number;
    language?: string;
    createdDate?: Date;
    modifiedDate?: Date;
    documentType?: string;
    manufacturerName?: string;
    equipmentModel?: string;
    manualVersion?: string;
  };
  /** Section hierarchy and navigation (enhanced metadata) */
  sectionContext?: {
    fullPath: string[];
    depth: number;
    sectionNumber?: string;
    parentSections: string[];
    siblingCount: number;
    positionInSection: number;
    sectionType?:
      | 'introduction'
      | 'safety'
      | 'specifications'
      | 'procedures'
      | 'troubleshooting'
      | 'maintenance'
      | 'parts'
      | 'appendix'
      | 'other';
  };
  /** Processing statistics (enhanced metadata) */
  processingStats?: {
    extractionTime: number;
    preprocessingTime: number;
    chunkingTime: number;
    enhancementTime: number;
    totalProcessingTime: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  /** Content statistics (enhanced metadata) */
  contentStats?: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageWordLength: number;
    readabilityScore?: number;
    technicalDensity: number;
    uniqueTerms: number;
    keyTerms: string[];
  };
  /** Semantic context (enhanced metadata) */
  semanticContext?: {
    topics: string[];
    keyPhrases: string[];
    entities: any[];
    crossReferences: any[];
    warnings: string[];
    procedures: string[];
  };
  /** Quality metrics (enhanced metadata) */
  qualityMetrics?: {
    completeness: number;
    coherence: number;
    relevance: number;
    technicalAccuracy?: number;
    structuralIntegrity: number;
    embeddingReadiness: number;
  };
}

export interface ChunkRelationships {
  /** Previous chunk ID */
  previousChunkId?: string;
  /** Next chunk ID */
  nextChunkId?: string;
  /** Parent chunk ID (for nested content) */
  parentChunkId?: string;
  /** Child chunk IDs */
  childChunkIds: string[];
  /** Section hierarchy level (0 = main section, 1 = subsection, etc.) */
  hierarchyLevel: number;
}

export interface DocumentChunk {
  /** Unique identifier */
  id: string;
  /** Raw text content of the chunk */
  content: string;
  /** Metadata about the chunk */
  metadata: ChunkMetadata;
  /** Relationships to other chunks */
  relationships: ChunkRelationships;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Timestamp when chunk was created */
  createdAt: Date;
  /** Timestamp when chunk was last updated */
  updatedAt: Date;
}

export interface ChunkingProgress {
  /** Unique ID for the chunking job */
  jobId: string;
  /** Document being processed */
  documentId: string;
  /** Current status */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  /** Total number of pages to process */
  totalPages: number;
  /** Number of pages processed */
  processedPages: number;
  /** Total number of chunks created */
  totalChunks: number;
  /** Current chunk being processed */
  currentChunk: number;
  /** Error message if failed */
  errorMessage?: string;
  /** Started timestamp */
  startedAt: Date;
  /** Completed timestamp */
  completedAt?: Date;
  /** Estimated completion time */
  estimatedCompletion?: Date;
  /** Tenant ID */
  tenantId: string;
}

export interface ChunkingResult {
  /** Job ID for tracking */
  jobId: string;
  /** Array of created chunks */
  chunks: DocumentChunk[];
  /** Final processing statistics */
  statistics: {
    totalPages: number;
    totalChunks: number;
    averageChunkSize: number;
    processingTimeMs: number;
    specialContentCounts: {
      tables: number;
      lists: number;
      images: number;
      diagrams: number;
      codeBlocks: number;
    };
  };
}

export interface PDFContent {
  /** Extracted text content */
  text: string;
  /** Page number */
  pageNumber: number;
  /** Raw PDF structure data */
  structureData?: any;
  /** Detected sections and headers */
  sections?: {
    header: string;
    level: number;
    startIndex: number;
    endIndex: number;
  }[];
  /** Detected special content */
  specialContent?: {
    tables: Array<{
      startIndex: number;
      endIndex: number;
      content: string;
    }>;
    lists: Array<{
      startIndex: number;
      endIndex: number;
      type: 'bulleted' | 'numbered';
      content: string;
    }>;
    images: Array<{
      startIndex: number;
      description?: string;
    }>;
    codeBlocks: Array<{
      startIndex: number;
      endIndex: number;
      content: string;
      language?: string;
    }>;
  };
}

export interface TokenCount {
  /** Total number of tokens */
  count: number;
  /** Breakdown by content type */
  breakdown: {
    text: number;
    whitespace: number;
    punctuation: number;
    numbers: number;
  };
}

// Default configuration
export const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  chunkSize: 1000,
  overlap: 200,
  respectSentences: true,
  respectParagraphs: true,
  minChunkSize: 100,
};

// Content type patterns for detection
export const CONTENT_PATTERNS = {
  TABLE_START: /\|.*\|/m,
  LIST_BULLETED: /^\s*[•\-\*]\s+/m,
  LIST_NUMBERED: /^\s*\d+\.\s+/m,
  CODE_BLOCK: /```[\s\S]*?```/g,
  SECTION_HEADER: /^\s*#+\s+(.+)$/m,
  PAGE_BREAK: /\f|\n\s*\n\s*\n/g,
} as const;
