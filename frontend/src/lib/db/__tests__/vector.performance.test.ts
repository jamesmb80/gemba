/**
 * Performance tests for vector database operations
 */

import { vectorDb } from '../vector';
import type { VectorSearchParams } from '../../types/vector';

// Mock Supabase client for performance testing
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

describe('Vector Database Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Batch Insert Performance', () => {
    it('should handle large batch inserts efficiently', async () => {
      const mockInsert = jest.fn().mockImplementation(
        (data) =>
          new Promise(
            (resolve) =>
              setTimeout(
                () =>
                  resolve({
                    data: data.map((_: any, i: number) => ({ id: `emb-${i}` })),
                    error: null,
                  }),
                200,
              ), // Simulate 200ms for batch insert
          ),
      );

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const batchEmbeddings = Array.from({ length: 1000 }, (_, i) => ({
        tenant_id: 'test-tenant',
        document_id: `doc-${i}`,
        chunk_id: `chunk-${i}`,
        chunk_text: `Test content ${i}`,
        chunk_metadata: { batch: i },
        embedding: new Array(1536).fill(0.1),
      }));

      const startTime = Date.now();
      const results = await vectorDb.insertEmbeddings(batchEmbeddings);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(results).toHaveLength(1000);
      expect(mockInsert).toHaveBeenCalledWith(batchEmbeddings);
    });

    it('should handle concurrent batch operations', async () => {
      const mockInsert = jest.fn().mockImplementation(
        (data) =>
          new Promise(
            (resolve) =>
              setTimeout(
                () =>
                  resolve({
                    data: data.map((_: any, i: number) => ({ id: `emb-${i}` })),
                    error: null,
                  }),
                100,
              ), // 100ms per batch
          ),
      );

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const createBatch = (batchId: number) =>
        Array.from({ length: 100 }, (_, i) => ({
          tenant_id: 'test-tenant',
          document_id: `doc-${batchId}-${i}`,
          chunk_id: `chunk-${batchId}-${i}`,
          chunk_text: `Test content ${batchId}-${i}`,
          chunk_metadata: { batch: batchId },
          embedding: new Array(1536).fill(0.1),
        }));

      const startTime = Date.now();

      // Run 5 concurrent batches
      const promises = Array.from({ length: 5 }, (_, i) =>
        vectorDb.insertEmbeddings(createBatch(i)),
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // Should complete in roughly the same time as a single batch due to concurrency
      expect(endTime - startTime).toBeLessThan(300);
      expect(results).toHaveLength(5);
      expect(mockInsert).toHaveBeenCalledTimes(5);
    });
  });

  describe('Document Chunk Performance', () => {
    it('should handle large document chunk operations', async () => {
      const mockInsert = jest.fn().mockImplementation(
        (data) =>
          new Promise(
            (resolve) =>
              setTimeout(
                () =>
                  resolve({
                    data: data.map((_: any, i: number) => ({ id: `chunk-${i}` })),
                    error: null,
                  }),
                50,
              ), // 50ms for chunk insert
          ),
      );

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const largeChunkBatch = Array.from({ length: 500 }, (_, i) => ({
        tenant_id: 'test-tenant',
        document_id: `doc-${Math.floor(i / 50)}`,
        chunk_index: i % 50,
        chunk_type: 'text' as const,
        page_number: Math.floor(i / 50) + 1,
        section_header: `Section ${i % 10}`,
      }));

      const startTime = Date.now();
      const results = await vectorDb.insertDocumentChunks(largeChunkBatch);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
      expect(results).toHaveLength(500);
    });

    it('should handle document retrieval efficiently', async () => {
      const mockSelect = jest.fn().mockImplementation(
        () =>
          new Promise(
            (resolve) =>
              setTimeout(
                () =>
                  resolve({
                    data: Array.from({ length: 50 }, (_, i) => ({
                      id: `chunk-${i}`,
                      chunk_index: i,
                      embeddings: [
                        {
                          id: `emb-${i}`,
                          embedding: new Array(1536).fill(0.1),
                          chunk_text: `Test content ${i}`,
                        },
                      ],
                    })),
                    error: null,
                  }),
                100,
              ), // 100ms to retrieve document
          ),
      );

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              select: mockSelect,
            }),
          }),
        }),
      });

      const startTime = Date.now();
      const results = await vectorDb.getDocumentChunks('large-doc');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(300);
      expect(results).toHaveLength(50);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should handle large vector arrays without excessive memory usage', async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: [{ id: 'test-id' }],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      // Create large embedding array (1536 dimensions)
      const largeEmbedding = new Array(1536).fill(0).map(
        (_, i) => Math.sin(i * 0.01), // Varied values to simulate real embeddings
      );

      const initialMemory = process.memoryUsage();

      // Run multiple operations with large vectors
      const promises = Array.from({ length: 20 }, (_, i) =>
        vectorDb.insertEmbeddings([
          {
            tenant_id: 'test-tenant',
            document_id: `doc-${i}`,
            chunk_id: `chunk-${i}`,
            chunk_text: `Test content ${i}`,
            chunk_metadata: { index: i },
            embedding: largeEmbedding,
          },
        ]),
      );

      await Promise.all(promises);

      const finalMemory = process.memoryUsage();

      // Memory increase should be reasonable (less than 50MB)
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });

  describe('Connection Pool Performance', () => {
    it('should handle rapid sequential operations', async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: [{ id: 'test-id' }],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const startTime = Date.now();

      // Run 50 sequential operations
      const results = [];
      for (let i = 0; i < 50; i++) {
        const result = await vectorDb.insertEmbeddings([
          {
            tenant_id: 'test-tenant',
            document_id: `doc-${i}`,
            chunk_id: `chunk-${i}`,
            chunk_text: `Test content ${i}`,
            chunk_metadata: { index: i },
            embedding: new Array(1536).fill(0.1),
          },
        ]);
        results.push(result);
      }

      const endTime = Date.now();

      // Should complete all operations within reasonable time
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
      expect(results).toHaveLength(50);
      expect(mockInsert).toHaveBeenCalledTimes(50);
    });

    it('should handle connection pool recovery', async () => {
      let callCount = 0;
      const mockInsert = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 5) {
          // First 5 calls fail due to connection pool issues
          return Promise.resolve({
            data: null,
            error: { message: 'Connection pool exhausted' },
          });
        }
        // Subsequent calls succeed
        return Promise.resolve({
          data: [{ id: 'test-id' }],
          error: null,
        });
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      });

      const testEmbedding = [
        {
          tenant_id: 'test-tenant',
          document_id: 'test-doc',
          chunk_id: 'test-chunk',
          chunk_text: 'Test content',
          chunk_metadata: {},
          embedding: new Array(1536).fill(0.1),
        },
      ];

      // First 5 attempts should fail
      for (let i = 0; i < 5; i++) {
        await expect(vectorDb.insertEmbeddings(testEmbedding)).rejects.toThrow(
          'Connection pool exhausted',
        );
      }

      // Subsequent attempts should succeed
      const result = await vectorDb.insertEmbeddings(testEmbedding);
      expect(result).toEqual([{ id: 'test-id' }]);
      expect(mockInsert).toHaveBeenCalledTimes(6);
    });
  });

  describe('Health Check Performance', () => {
    it('should complete health checks quickly', async () => {
      const mockSelect = jest.fn().mockImplementation(
        () =>
          new Promise(
            (resolve) =>
              setTimeout(
                () =>
                  resolve({
                    data: [{ count: 1 }],
                    error: null,
                  }),
                50,
              ), // 50ms response time
          ),
      );

      const mockRpc = jest.fn().mockImplementation(
        () =>
          new Promise(
            (resolve) =>
              setTimeout(
                () =>
                  resolve({
                    data: 3,
                    error: null,
                  }),
                50,
              ), // 50ms response time
          ),
      );

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            select: mockSelect,
          }),
        }),
      });

      mockSupabase.rpc = mockRpc;

      const startTime = Date.now();
      const result = await vectorDb.healthCheck();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
      expect(result).toEqual({
        connected: true,
        vectorEnabled: true,
        error: null,
      });
    });

    it('should handle health check timeouts gracefully', async () => {
      const mockSelect = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Health check timeout')), 1000),
            ),
        );

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            select: mockSelect,
          }),
        }),
      });

      const startTime = Date.now();
      const result = await vectorDb.healthCheck();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1100); // Should handle timeout
      expect(result).toEqual({
        connected: false,
        vectorEnabled: false,
        error: 'Health check timeout',
      });
    });
  });

  describe('Vector Search Performance (Placeholder)', () => {
    it('should handle vector search failure quickly', async () => {
      const searchParams: VectorSearchParams = {
        query_embedding: new Array(1536).fill(0.1),
        tenant_id: 'test-tenant',
        limit: 10,
      };

      const startTime = Date.now();

      try {
        await vectorDb.searchSimilar(searchParams);
      } catch (error) {
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(10); // Should fail immediately
        expect(error).toEqual(
          new Error('Vector search not yet implemented - requires Supabase function'),
        );
      }
    });
  });
});
