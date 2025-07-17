/**
 * Tests for chunking rollback procedures
 */

import { ChunkingMonitor, ChunkingHealthStatus } from '../monitoring';
import { recordChunkingMetrics, getChunkingFailureRate } from '../withFeatureFlag';
import { isFeatureEnabled } from '../../featureFlags';

// Mock feature flags
jest.mock('../../featureFlags', () => ({
  isFeatureEnabled: jest.fn(),
}));

// Mock React for the hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn((initial) => [initial, jest.fn()]),
  useEffect: jest.fn(),
}));

describe('Rollback Procedures', () => {
  const mockIsFeatureEnabled = isFeatureEnabled as jest.MockedFunction<typeof isFeatureEnabled>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFeatureEnabled.mockReturnValue(true);

    // Clear metrics
    while (getChunkingFailureRate() > 0) {
      // Reset metrics by recording successes
      for (let i = 0; i < 100; i++) {
        recordChunkingMetrics({
          documentId: `reset-${i}`,
          success: true,
          timestamp: new Date(),
        });
      }
    }
  });

  describe('ChunkingMonitor', () => {
    let monitor: ChunkingMonitor;

    beforeEach(() => {
      monitor = new ChunkingMonitor();
    });

    afterEach(() => {
      monitor.stopMonitoring();
    });

    it('should detect healthy status when no issues', () => {
      // Record some successful operations
      for (let i = 0; i < 10; i++) {
        recordChunkingMetrics({
          documentId: `doc${i}`,
          success: true,
          chunkCount: 50,
          duration: 5000,
          timestamp: new Date(),
        });
      }

      const status = monitor.getHealthStatus();

      expect(status.healthy).toBe(true);
      expect(status.shouldRollback).toBe(false);
      expect(status.failureRate).toBe(0);
      expect(status.recommendations).toContain('Chunking pipeline is operating normally');
    });

    it('should trigger rollback when failure rate exceeds threshold', () => {
      // Record 6 failures out of 100 (6% failure rate)
      for (let i = 0; i < 94; i++) {
        recordChunkingMetrics({
          documentId: `success${i}`,
          success: true,
          timestamp: new Date(),
        });
      }

      for (let i = 0; i < 6; i++) {
        recordChunkingMetrics({
          documentId: `fail${i}`,
          success: false,
          error: 'Chunking failed',
          timestamp: new Date(),
        });
      }

      const status = monitor.getHealthStatus();

      expect(status.healthy).toBe(false);
      expect(status.shouldRollback).toBe(true);
      expect(status.failureRate).toBeGreaterThan(5);
      expect(status.recommendations).toContain('IMMEDIATE ROLLBACK RECOMMENDED');
      expect(status.recommendations.some((r) => r.includes('Failure rate'))).toBe(true);
    });

    it('should trigger rollback on consecutive timeouts', () => {
      // Record some successes first
      for (let i = 0; i < 5; i++) {
        recordChunkingMetrics({
          documentId: `success${i}`,
          success: true,
          timestamp: new Date(),
        });
      }

      // Record 3 consecutive timeouts
      for (let i = 0; i < 3; i++) {
        recordChunkingMetrics({
          documentId: `timeout${i}`,
          success: false,
          error: 'Operation timeout',
          timestamp: new Date(),
        });
      }

      const status = monitor.getHealthStatus();

      expect(status.shouldRollback).toBe(true);
      expect(status.recentTimeouts).toBeGreaterThanOrEqual(3);
      expect(status.recommendations.some((r) => r.includes('Consecutive timeouts'))).toBe(true);
    });

    it('should trigger rollback on too many timeouts per hour', () => {
      const now = Date.now();

      // Record 5 timeouts in the last hour
      for (let i = 0; i < 5; i++) {
        recordChunkingMetrics({
          documentId: `timeout${i}`,
          success: false,
          error: 'timeout error',
          timestamp: new Date(now - i * 60000), // Spread over last 5 minutes
        });
      }

      const status = monitor.getHealthStatus();

      expect(status.shouldRollback).toBe(true);
      expect(status.recommendations.some((r) => r.includes('Timeouts in last hour'))).toBe(true);
    });

    it('should warn on slow processing', () => {
      // Record slow but successful operations
      for (let i = 0; i < 5; i++) {
        recordChunkingMetrics({
          documentId: `slow${i}`,
          success: true,
          chunkCount: 100,
          duration: 400000, // 6.67 minutes
          timestamp: new Date(),
        });
      }

      const status = monitor.getHealthStatus();

      expect(status.healthy).toBe(false);
      expect(status.shouldRollback).toBe(false); // Slow but not rollback worthy
      expect(status.averageProcessingTime).toBeGreaterThan(300000);
      expect(status.recommendations.some((r) => r.includes('Average processing time'))).toBe(true);
      expect(status.recommendations.some((r) => r.includes('Consider optimizing'))).toBe(true);
    });

    it('should warn on empty chunk documents', () => {
      // Record documents that produced no chunks
      for (let i = 0; i < 3; i++) {
        recordChunkingMetrics({
          documentId: `empty${i}`,
          success: true,
          chunkCount: 0,
          duration: 1000,
          timestamp: new Date(),
        });
      }

      const status = monitor.getHealthStatus();

      expect(status.healthy).toBe(false);
      expect(status.recommendations.some((r) => r.includes('documents produced no chunks'))).toBe(
        true,
      );
      expect(status.recommendations.some((r) => r.includes('Check document parsing'))).toBe(true);
    });

    it('should not monitor when chunking is disabled', () => {
      mockIsFeatureEnabled.mockReturnValue(false);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const alertCallbacks: ChunkingHealthStatus[] = [];

      monitor.onHealthUpdate((status) => alertCallbacks.push(status));
      monitor.startMonitoring(100); // 100ms interval for testing

      // Wait for monitoring interval
      jest.advanceTimersByTime(150);

      expect(alertCallbacks).toHaveLength(0);
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should call alert callbacks on unhealthy status', () => {
      const callbacks: ChunkingHealthStatus[] = [];
      const unsubscribe = monitor.onHealthUpdate((status) => callbacks.push(status));

      // Trigger unhealthy status
      for (let i = 0; i < 10; i++) {
        recordChunkingMetrics({
          documentId: `fail${i}`,
          success: false,
          timestamp: new Date(),
        });
      }

      // Start monitoring
      monitor.startMonitoring(100);

      // Wait for monitoring interval
      setTimeout(() => {
        expect(callbacks.length).toBeGreaterThan(0);
        expect(callbacks[0].healthy).toBe(false);

        // Test unsubscribe
        unsubscribe();
        const prevLength = callbacks.length;

        setTimeout(() => {
          expect(callbacks.length).toBe(prevLength);
        }, 150);
      }, 150);
    });

    it('should simulate various failure scenarios', () => {
      const initialFailureRate = getChunkingFailureRate();

      // Simulate timeout
      monitor.simulateFailure('timeout');
      const metrics = getChunkingFailureRate();
      expect(metrics).toBeGreaterThan(initialFailureRate);

      // Simulate error
      monitor.simulateFailure('error');

      // Simulate empty chunks
      monitor.simulateFailure('empty');

      // Simulate slow processing
      monitor.simulateFailure('slow');

      const status = monitor.getHealthStatus();
      expect(status.recentFailures).toBeGreaterThan(0);
    });
  });

  describe('Rollback Thresholds', () => {
    it('should use custom thresholds', () => {
      const monitor = new ChunkingMonitor({
        maxFailureRate: 10,
        maxConsecutiveTimeouts: 5,
        maxTimeoutsPerHour: 10,
        maxProcessingTimeMs: 600000, // 10 minutes
        minChunksPerDocument: 5,
      });

      // Record 8% failure rate (below custom 10% threshold)
      for (let i = 0; i < 92; i++) {
        recordChunkingMetrics({
          documentId: `success${i}`,
          success: true,
          timestamp: new Date(),
        });
      }

      for (let i = 0; i < 8; i++) {
        recordChunkingMetrics({
          documentId: `fail${i}`,
          success: false,
          timestamp: new Date(),
        });
      }

      const status = monitor.getHealthStatus();

      expect(status.failureRate).toBeGreaterThan(5); // Would trigger default
      expect(status.failureRate).toBeLessThan(10); // But not custom
      expect(status.shouldRollback).toBe(false);
    });
  });

  describe('Error Logging', () => {
    it('should log rollback alerts to console', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const monitor = new ChunkingMonitor();

      // Trigger rollback condition
      for (let i = 0; i < 10; i++) {
        recordChunkingMetrics({
          documentId: `fail${i}`,
          success: false,
          error: 'Critical failure',
          timestamp: new Date(),
        });
      }

      monitor.startMonitoring(50);

      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('ROLLBACK TRIGGERED'));
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('CHUNKING ROLLBACK ALERT'),
        );

        consoleErrorSpy.mockRestore();
      }, 100);
    });
  });
});
