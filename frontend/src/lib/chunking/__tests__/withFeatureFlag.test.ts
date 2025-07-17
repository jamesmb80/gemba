/**
 * Tests for chunking feature flag functionality
 */

import {
  ChunkingService,
  shouldAttemptChunking,
  recordChunkingMetrics,
  getChunkingFailureRate,
  getRecentChunkingMetrics,
} from '../withFeatureFlag';
import { isFeatureEnabled } from '../../featureFlags';
import { PDFContent } from '../../types/chunking';

// Mock the feature flags module
jest.mock('../../featureFlags', () => ({
  isFeatureEnabled: jest.fn(),
}));

// Mock the algorithm module
jest.mock('../algorithm', () => ({
  DocumentChunker: jest.fn().mockImplementation(() => ({
    chunkDocument: jest.fn().mockReturnValue([
      { id: 'chunk1', content: 'Test chunk 1' },
      { id: 'chunk2', content: 'Test chunk 2' },
    ]),
    getConfig: jest.fn().mockReturnValue({
      chunkSize: 1000,
      overlap: 200,
      respectSentences: true,
      respectParagraphs: true,
      minChunkSize: 100,
    }),
    updateConfig: jest.fn(),
  })),
}));

describe('ChunkingService', () => {
  const mockIsFeatureEnabled = isFeatureEnabled as jest.MockedFunction<typeof isFeatureEnabled>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear metrics between tests
    while (getRecentChunkingMetrics(100).length > 0) {
      getRecentChunkingMetrics(100).pop();
    }
  });

  const createTestPDFContent = (pageCount: number = 1): PDFContent[] => {
    return Array.from({ length: pageCount }, (_, i) => ({
      text: `Page ${i + 1} content`,
      pageNumber: i + 1,
    }));
  };

  describe('chunkDocument', () => {
    it('should chunk document when feature flag is enabled', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);

      const service = new ChunkingService();
      const pdfContent = createTestPDFContent(2);

      const chunks = await service.chunkDocument(
        'doc123',
        'tenant123',
        pdfContent,
        'Test Document',
        'Test Author',
      );

      expect(chunks).toHaveLength(2);
      expect(chunks[0].id).toBe('chunk1');
      expect(chunks[1].id).toBe('chunk2');
    });

    it('should throw error when feature flag is disabled', async () => {
      mockIsFeatureEnabled.mockReturnValue(false);

      const service = new ChunkingService();
      const pdfContent = createTestPDFContent(1);

      await expect(
        service.chunkDocument('doc123', 'tenant123', pdfContent, 'Test Document', 'Test Author'),
      ).rejects.toThrow('Document chunking is currently disabled');
    });

    it('should log performance warning for slow processing', async () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock slow processing by overriding Date.now
      let callCount = 0;
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => {
        callCount++;
        // Return start time on first call, end time on second call
        return callCount === 1 ? 1000 : 1000 + 1000; // 1 second for 1 page = 500 seconds for 500 pages
      });

      const service = new ChunkingService();
      const pdfContent = createTestPDFContent(1);

      await service.chunkDocument('doc123', 'tenant123', pdfContent);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ChunkingService] Performance warning:'),
      );

      // Restore Date.now
      Date.now = originalDateNow;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('isEnabled', () => {
    it('should return true when feature flag is enabled', () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      expect(ChunkingService.isEnabled()).toBe(true);
    });

    it('should return false when feature flag is disabled', () => {
      mockIsFeatureEnabled.mockReturnValue(false);
      expect(ChunkingService.isEnabled()).toBe(false);
    });
  });

  describe('shouldAttemptChunking', () => {
    it('should return true when chunking is enabled', () => {
      mockIsFeatureEnabled.mockReturnValue(true);
      expect(shouldAttemptChunking()).toBe(true);
    });

    it('should return false when chunking is disabled', () => {
      mockIsFeatureEnabled.mockReturnValue(false);
      expect(shouldAttemptChunking()).toBe(false);
    });
  });

  describe('chunking metrics', () => {
    it('should record successful chunking metrics', () => {
      const metrics = {
        documentId: 'doc123',
        success: true,
        chunkCount: 10,
        duration: 1500,
        timestamp: new Date(),
      };

      recordChunkingMetrics(metrics);

      const recent = getRecentChunkingMetrics(1);
      expect(recent).toHaveLength(1);
      expect(recent[0]).toMatchObject({
        documentId: 'doc123',
        success: true,
        chunkCount: 10,
        duration: 1500,
      });
    });

    it('should record failed chunking metrics', () => {
      const metrics = {
        documentId: 'doc456',
        success: false,
        error: 'Out of memory',
        timestamp: new Date(),
      };

      recordChunkingMetrics(metrics);

      const recent = getRecentChunkingMetrics(1);
      expect(recent).toHaveLength(1);
      expect(recent[0]).toMatchObject({
        documentId: 'doc456',
        success: false,
        error: 'Out of memory',
      });
    });

    it('should calculate failure rate correctly', () => {
      // Record 3 successes and 2 failures
      recordChunkingMetrics({ documentId: 'doc1', success: true, timestamp: new Date() });
      recordChunkingMetrics({ documentId: 'doc2', success: true, timestamp: new Date() });
      recordChunkingMetrics({ documentId: 'doc3', success: false, timestamp: new Date() });
      recordChunkingMetrics({ documentId: 'doc4', success: true, timestamp: new Date() });
      recordChunkingMetrics({ documentId: 'doc5', success: false, timestamp: new Date() });

      const failureRate = getChunkingFailureRate();
      expect(failureRate).toBe(40); // 2 failures out of 5 = 40%
    });

    it('should return 0 failure rate when no metrics recorded', () => {
      // Clear all metrics first
      while (getRecentChunkingMetrics(100).length > 0) {
        getRecentChunkingMetrics(100).pop();
      }

      const failureRate = getChunkingFailureRate();
      expect(failureRate).toBe(0);
    });

    it('should limit stored metrics to 100 entries', () => {
      // Record 105 metrics
      for (let i = 0; i < 105; i++) {
        recordChunkingMetrics({
          documentId: `doc${i}`,
          success: true,
          timestamp: new Date(),
        });
      }

      const allMetrics = getRecentChunkingMetrics(200);
      expect(allMetrics.length).toBeLessThanOrEqual(100);
    });
  });

  describe('configuration', () => {
    it('should get current configuration', () => {
      const service = new ChunkingService();
      const config = service.getConfig();

      expect(config).toMatchObject({
        chunkSize: 1000,
        overlap: 200,
        respectSentences: true,
        respectParagraphs: true,
        minChunkSize: 100,
      });
    });

    it('should update configuration', () => {
      const service = new ChunkingService();

      service.updateConfig({
        chunkSize: 2000,
        overlap: 300,
      });

      // Verify updateConfig was called on the underlying chunker
      expect(service['chunker'].updateConfig).toHaveBeenCalledWith({
        chunkSize: 2000,
        overlap: 300,
      });
    });
  });
});
