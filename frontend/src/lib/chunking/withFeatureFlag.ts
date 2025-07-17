/**
 * Feature flag wrapper for chunking functionality
 */

import { isFeatureEnabled } from '../featureFlags';
import { DocumentChunker } from './algorithm';
import { ChunkConfig, DocumentChunk, PDFContent } from '../types/chunking';

export class ChunkingService {
  private chunker: DocumentChunker;

  constructor(config?: Partial<ChunkConfig>) {
    this.chunker = new DocumentChunker(config);
  }

  /**
   * Chunks a document if feature flag is enabled
   * @throws Error if chunking is disabled
   */
  async chunkDocument(
    documentId: string,
    tenantId: string,
    pdfContent: PDFContent[],
    documentTitle?: string,
    documentAuthor?: string,
  ): Promise<DocumentChunk[]> {
    if (!isFeatureEnabled('CHUNKING_ENABLED')) {
      throw new Error(
        'Document chunking is currently disabled. Enable CHUNKING_ENABLED feature flag to use this functionality.',
      );
    }

    try {
      // Log chunking start for monitoring
      console.log(`[ChunkingService] Starting chunking for document ${documentId}`);
      const startTime = Date.now();

      const chunks = this.chunker.chunkDocument(
        documentId,
        tenantId,
        pdfContent,
        documentTitle,
        documentAuthor,
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log completion for monitoring
      console.log(
        `[ChunkingService] Completed chunking for document ${documentId}. Created ${chunks.length} chunks in ${duration}ms`,
      );

      // Check for performance issues (threshold from story: 5 minutes for 500 pages)
      const pagesProcessed = pdfContent.length;
      const msPerPage = duration / pagesProcessed;
      const projected500PageTime = msPerPage * 500;

      if (projected500PageTime > 300000) {
        // 5 minutes in ms
        console.warn(
          `[ChunkingService] Performance warning: Projected time for 500 pages is ${projected500PageTime}ms (${projected500PageTime / 60000} minutes)`,
        );
      }

      return chunks;
    } catch (error) {
      console.error(`[ChunkingService] Error chunking document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Checks if chunking is enabled
   */
  static isEnabled(): boolean {
    return isFeatureEnabled('CHUNKING_ENABLED');
  }

  /**
   * Gets the current chunking configuration
   */
  getConfig(): ChunkConfig {
    return this.chunker.getConfig();
  }

  /**
   * Updates chunking configuration
   */
  updateConfig(newConfig: Partial<ChunkConfig>): void {
    this.chunker.updateConfig(newConfig);
  }
}

/**
 * Default chunking service instance
 */
export const chunkingService = new ChunkingService();

/**
 * Helper function to check if chunking should be attempted
 */
export function shouldAttemptChunking(): boolean {
  return ChunkingService.isEnabled();
}

/**
 * Monitoring helper for chunking failures
 */
export interface ChunkingMetrics {
  documentId: string;
  success: boolean;
  chunkCount?: number;
  duration?: number;
  error?: string;
  timestamp: Date;
}

const chunkingMetrics: ChunkingMetrics[] = [];

export function recordChunkingMetrics(metrics: ChunkingMetrics): void {
  chunkingMetrics.push(metrics);

  // Keep only last 100 entries
  if (chunkingMetrics.length > 100) {
    chunkingMetrics.shift();
  }
}

export function getChunkingFailureRate(): number {
  if (chunkingMetrics.length === 0) return 0;

  const failures = chunkingMetrics.filter((m) => !m.success).length;
  return (failures / chunkingMetrics.length) * 100;
}

export function getRecentChunkingMetrics(count: number = 10): ChunkingMetrics[] {
  return chunkingMetrics.slice(-count);
}
