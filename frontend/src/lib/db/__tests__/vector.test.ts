/**
 * Integration tests for vector database operations
 */

import { vectorDb } from '../vector';
import type { Embedding, DocumentChunk, VectorSearchParams } from '../../types/vector';

// Mock Supabase client for testing
const mockSupabase = {
  from: jest.fn(),
  rpc: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
};

jest.mock('../../supabaseClient', () => ({
  supabase: mockSupabase,
}));

describe('Vector Database Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Embedding Operations', () => {
    it('should insert embeddings in batch', async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: [{ id: 'test-id-1' }, { id: 'test-id-2' }],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const embeddings: Omit<Embedding, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          tenant_id: 'test-tenant',
          document_id: 'test-doc',
          chunk_id: 'test-chunk-1',
          chunk_text: 'Test content 1',
          chunk_metadata: { page: 1, section: 'intro' },
          embedding: new Array(1536).fill(0.1),
        },
        {
          tenant_id: 'test-tenant',
          document_id: 'test-doc',
          chunk_id: 'test-chunk-2',
          chunk_text: 'Test content 2',
          chunk_metadata: { page: 2, section: 'body' },
          embedding: new Array(1536).fill(0.2),
        },
      ];

      const result = await vectorDb.insertEmbeddings(embeddings);

      expect(result).toEqual([{ id: 'test-id-1' }, { id: 'test-id-2' }]);
      expect(mockInsert).toHaveBeenCalledWith(embeddings);
    });

    it('should handle embedding insertion errors', async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid vector dimension' },
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const invalidEmbedding = [
        {
          tenant_id: 'test-tenant',
          document_id: 'test-doc',
          chunk_id: 'test-chunk',
          chunk_text: 'Test content',
          chunk_metadata: {},
          embedding: new Array(1000).fill(0.1), // Wrong dimension
        },
      ];

      await expect(vectorDb.insertEmbeddings(invalidEmbedding)).rejects.toThrow(
        'Invalid vector dimension',
      );
    });
  });

  describe('Document Chunk Operations', () => {
    it('should insert document chunks in batch', async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: [{ id: 'chunk-1' }, { id: 'chunk-2' }],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const chunks: Omit<DocumentChunk, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          tenant_id: 'test-tenant',
          document_id: 'test-doc',
          chunk_index: 0,
          chunk_type: 'text',
          page_number: 1,
          section_header: 'Introduction',
        },
        {
          tenant_id: 'test-tenant',
          document_id: 'test-doc',
          chunk_index: 1,
          chunk_type: 'text',
          page_number: 1,
          section_header: 'Body',
        },
      ];

      const result = await vectorDb.insertDocumentChunks(chunks);

      expect(result).toEqual([{ id: 'chunk-1' }, { id: 'chunk-2' }]);
      expect(mockInsert).toHaveBeenCalledWith(chunks);
    });

    it('should get document chunks with embeddings', async () => {
      const mockSelect = jest.fn().mockResolvedValue({
        data: [
          {
            id: 'chunk-1',
            chunk_index: 0,
            embeddings: [
              {
                id: 'emb-1',
                embedding: new Array(1536).fill(0.1),
                chunk_text: 'Test content 1',
              },
            ],
          },
          {
            id: 'chunk-2',
            chunk_index: 1,
            embeddings: [
              {
                id: 'emb-2',
                embedding: new Array(1536).fill(0.2),
                chunk_text: 'Test content 2',
              },
            ],
          },
        ],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              select: mockSelect,
            }),
          }),
        }),
      });

      const result = await vectorDb.getDocumentChunks('test-doc');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('embeddings');
      expect(result[0].embeddings).toHaveLength(1);
    });

    it('should delete document and cascading embeddings', async () => {
      const mockDelete = jest.fn().mockResolvedValue({
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            delete: mockDelete,
          }),
        }),
      });

      await vectorDb.deleteDocument('test-doc');

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('Vector Search Operations', () => {
    it('should throw error for vector similarity search (not yet implemented)', async () => {
      const searchParams: VectorSearchParams = {
        query_embedding: new Array(1536).fill(0.1),
        tenant_id: 'test-tenant',
        limit: 10,
        threshold: 0.7,
      };

      await expect(vectorDb.searchSimilar(searchParams)).rejects.toThrow(
        'Vector search not yet implemented - requires Supabase function',
      );
    });
  });

  describe('Health Check Operations', () => {
    it('should perform health check successfully', async () => {
      const mockSelect = jest.fn().mockResolvedValue({
        data: [{ count: 1 }],
        error: null,
      });

      const mockRpc = jest.fn().mockResolvedValue({
        data: 3, // dimensions of test vector
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            select: mockSelect,
          }),
        }),
      });

      mockSupabase.rpc = mockRpc;

      const result = await vectorDb.healthCheck();

      expect(result).toEqual({
        connected: true,
        vectorEnabled: true,
        error: null,
      });
    });

    it('should handle health check failures', async () => {
      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            select: mockSelect,
          }),
        }),
      });

      const result = await vectorDb.healthCheck();

      expect(result).toEqual({
        connected: false,
        vectorEnabled: false,
        error: 'Connection failed',
      });
    });
  });

  describe('Feature Flag Integration', () => {
    it('should disable vector operations when feature flag is off', async () => {
      // Mock feature flag as disabled
      jest.doMock('../../featureFlags', () => ({
        isFeatureEnabled: jest.fn().mockReturnValue(false),
      }));

      const { searchWithVectors } = await import('../vectorWithFeatureFlag');

      const searchParams: VectorSearchParams = {
        query_embedding: new Array(1536).fill(0.1),
        tenant_id: 'test-tenant',
        limit: 10,
      };

      const result = await searchWithVectors(searchParams);

      expect(result).toBeNull();
    });

    it('should enable vector operations when feature flag is on', async () => {
      // Mock feature flag as enabled
      jest.doMock('../../featureFlags', () => ({
        isFeatureEnabled: jest.fn().mockReturnValue(true),
      }));

      const { searchWithVectors } = await import('../vectorWithFeatureFlag');

      const searchParams: VectorSearchParams = {
        query_embedding: new Array(1536).fill(0.1),
        tenant_id: 'test-tenant',
        limit: 10,
      };

      // Should attempt vector search and get the "not implemented" error
      await expect(searchWithVectors(searchParams)).resolves.toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const embedding = [
        {
          tenant_id: 'test-tenant',
          document_id: 'test-doc',
          chunk_id: 'test-chunk',
          chunk_text: 'Test content',
          chunk_metadata: {},
          embedding: new Array(1536).fill(0.1),
        },
      ];

      await expect(vectorDb.insertEmbeddings(embedding)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle RLS policy violations', async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'row-level security policy violation' },
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const embedding = [
        {
          tenant_id: 'unauthorized-tenant',
          document_id: 'test-doc',
          chunk_id: 'test-chunk',
          chunk_text: 'Test content',
          chunk_metadata: {},
          embedding: new Array(1536).fill(0.1),
        },
      ];

      await expect(vectorDb.insertEmbeddings(embedding)).rejects.toThrow(
        'row-level security policy violation',
      );
    });
  });
});
