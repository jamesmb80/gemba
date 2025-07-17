import { supabase } from '../supabaseClient';
import type {
  Embedding,
  DocumentChunk,
  VectorSearchParams,
  VectorSearchResult,
} from '../types/vector';

/**
 * Recommended batch size for bulk operations to avoid timeouts
 */
const BATCH_SIZE = 1000;

/**
 * Vector database operations with connection pooling best practices
 */
export const vectorDb = {
  /**
   * Insert embeddings in batch for efficiency
   * @param embeddings - Array of embedding objects to insert
   * @returns Promise<Embedding[]> - Array of inserted embeddings with generated IDs
   * @throws Error if insertion fails or validation error occurs
   */
  async insertEmbeddings(embeddings: Omit<Embedding, 'id' | 'created_at' | 'updated_at'>[]) {
    if (!embeddings || embeddings.length === 0) {
      throw new Error('Cannot insert empty embeddings array');
    }

    // Validate embedding dimensions
    for (const embedding of embeddings) {
      if (!embedding.embedding || embedding.embedding.length !== 1536) {
        throw new Error(
          `Invalid embedding dimension. Expected 1536, got ${embedding.embedding?.length || 0}`,
        );
      }
    }

    const { data, error } = await supabase.from('embeddings').insert(embeddings).select();

    if (error) {
      throw new Error(`Failed to insert embeddings: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Insert embeddings in batches for large datasets
   * @param embeddings - Array of embedding objects to insert
   * @param batchSize - Number of embeddings per batch (default: 1000)
   * @returns Promise<Embedding[]> - Array of all inserted embeddings
   */
  async insertEmbeddingsBatch(
    embeddings: Omit<Embedding, 'id' | 'created_at' | 'updated_at'>[],
    batchSize: number = BATCH_SIZE,
  ) {
    if (!embeddings || embeddings.length === 0) {
      return [];
    }

    const results: Embedding[] = [];

    for (let i = 0; i < embeddings.length; i += batchSize) {
      const batch = embeddings.slice(i, i + batchSize);
      const batchResult = await this.insertEmbeddings(batch);
      results.push(...batchResult);
    }

    return results;
  },

  /**
   * Insert document chunks in batch
   * @param chunks - Array of document chunk objects to insert
   * @returns Promise<DocumentChunk[]> - Array of inserted chunks with generated IDs
   * @throws Error if insertion fails or validation error occurs
   */
  async insertDocumentChunks(chunks: Omit<DocumentChunk, 'id' | 'created_at' | 'updated_at'>[]) {
    if (!chunks || chunks.length === 0) {
      throw new Error('Cannot insert empty chunks array');
    }

    // Validate chunk data integrity
    for (const chunk of chunks) {
      if (!chunk.tenant_id || !chunk.document_id) {
        throw new Error('Missing required fields: tenant_id and document_id are required');
      }
      if (chunk.chunk_index < 0) {
        throw new Error('chunk_index must be non-negative');
      }
    }

    const { data, error } = await supabase.from('document_chunks').insert(chunks).select();

    if (error) {
      throw new Error(`Failed to insert document chunks: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Insert document chunks in batches for large datasets
   * @param chunks - Array of document chunk objects to insert
   * @param batchSize - Number of chunks per batch (default: 1000)
   * @returns Promise<DocumentChunk[]> - Array of all inserted chunks
   */
  async insertDocumentChunksBatch(
    chunks: Omit<DocumentChunk, 'id' | 'created_at' | 'updated_at'>[],
    batchSize: number = BATCH_SIZE,
  ) {
    if (!chunks || chunks.length === 0) {
      return [];
    }

    const results: DocumentChunk[] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchResult = await this.insertDocumentChunks(batch);
      results.push(...batchResult);
    }

    return results;
  },

  /**
   * Perform vector similarity search
   * Note: This will be implemented as a Supabase function in a future story
   */
  async searchSimilar(params: VectorSearchParams): Promise<VectorSearchResult[]> {
    // Placeholder for vector search - will be implemented as RPC function
    throw new Error('Vector search not yet implemented - requires Supabase function');
  },

  /**
   * Get chunks for a document with their embeddings
   * @param documentId - UUID of the document to retrieve chunks for
   * @returns Promise<DocumentChunk[]> - Array of document chunks with embeddings
   * @throws Error if retrieval fails or document not found
   */
  async getDocumentChunks(documentId: string) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const { data, error } = await supabase
      .from('document_chunks')
      .select(
        `
        *,
        embeddings (
          id,
          embedding,
          chunk_text
        )
      `,
      )
      .eq('document_id', documentId)
      .order('chunk_index');

    if (error) {
      throw new Error(`Failed to retrieve document chunks: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Delete all embeddings and chunks for a document
   * @param documentId - UUID of the document to delete
   * @throws Error if deletion fails
   */
  async deleteDocument(documentId: string) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    // Cascading delete will remove embeddings automatically via foreign key constraint
    const { error } = await supabase.from('document_chunks').delete().eq('document_id', documentId);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  },

  /**
   * Health check for vector database connectivity and extension status
   * @returns Promise<{connected: boolean, vectorEnabled: boolean, error: string | null}>
   */
  async healthCheck() {
    try {
      // Test basic connectivity
      const { data, error } = await supabase.from('document_chunks').select('count').limit(1);

      if (error) throw error;

      // Test vector extension
      const { data: vectorTest, error: vectorError } = await supabase.rpc('vector_dims', {
        vector: [1, 2, 3],
      });

      return {
        connected: true,
        vectorEnabled: !vectorError,
        error: null,
      };
    } catch (error) {
      return {
        connected: false,
        vectorEnabled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

/**
 * Utility function for retrying operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 100,
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on non-retryable errors
      if (lastError.message.includes('row-level security')) {
        throw lastError;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Monitor connection pool health
 */
export async function monitorConnectionHealth() {
  const { data, error } = await supabase.rpc('get_connection_stats');

  if (error) {
    console.error('Failed to get connection stats:', error);
    return null;
  }

  return data;
}
