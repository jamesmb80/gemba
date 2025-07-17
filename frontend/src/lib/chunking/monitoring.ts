/**
 * Monitoring and alerting for chunking pipeline
 */

import {
  getChunkingFailureRate,
  getRecentChunkingMetrics,
  ChunkingMetrics,
  recordChunkingMetrics,
} from './withFeatureFlag';
import { isFeatureEnabled } from '../featureFlags';

export interface ChunkingHealthStatus {
  healthy: boolean;
  failureRate: number;
  recentFailures: number;
  recentTimeouts: number;
  averageProcessingTime: number;
  recommendations: string[];
  shouldRollback: boolean;
}

export interface RollbackThresholds {
  maxFailureRate: number;
  maxConsecutiveTimeouts: number;
  maxTimeoutsPerHour: number;
  maxProcessingTimeMs: number;
  minChunksPerDocument: number;
}

const DEFAULT_THRESHOLDS: RollbackThresholds = {
  maxFailureRate: 5, // 5% failure rate
  maxConsecutiveTimeouts: 3,
  maxTimeoutsPerHour: 5,
  maxProcessingTimeMs: 300000, // 5 minutes for 500 pages
  minChunksPerDocument: 1,
};

/**
 * Monitors chunking health and determines if rollback is needed
 */
export class ChunkingMonitor {
  private thresholds: RollbackThresholds;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: ((status: ChunkingHealthStatus) => void)[] = [];

  constructor(thresholds: Partial<RollbackThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Gets current health status of chunking pipeline
   */
  getHealthStatus(): ChunkingHealthStatus {
    const failureRate = getChunkingFailureRate();
    const recentMetrics = getRecentChunkingMetrics(100);

    // Calculate recent failures and timeouts
    const recentFailures = recentMetrics.filter((m) => !m.success).length;
    const recentTimeouts = recentMetrics.filter(
      (m) => !m.success && m.error?.toLowerCase().includes('timeout'),
    ).length;

    // Calculate consecutive timeouts
    let consecutiveTimeouts = 0;
    for (let i = recentMetrics.length - 1; i >= 0; i--) {
      const metric = recentMetrics[i];
      if (!metric.success && metric.error?.toLowerCase().includes('timeout')) {
        consecutiveTimeouts++;
      } else if (metric.success) {
        break;
      }
    }

    // Calculate timeouts in last hour
    const oneHourAgo = Date.now() - 3600000;
    const timeoutsLastHour = recentMetrics.filter(
      (m) =>
        !m.success &&
        m.error?.toLowerCase().includes('timeout') &&
        m.timestamp.getTime() > oneHourAgo,
    ).length;

    // Calculate average processing time
    const successfulMetrics = recentMetrics.filter((m) => m.success && m.duration);
    const averageProcessingTime =
      successfulMetrics.length > 0
        ? successfulMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) /
          successfulMetrics.length
        : 0;

    // Build recommendations
    const recommendations: string[] = [];
    let shouldRollback = false;

    if (failureRate > this.thresholds.maxFailureRate) {
      recommendations.push(
        `Failure rate (${failureRate.toFixed(1)}%) exceeds threshold (${this.thresholds.maxFailureRate}%)`,
      );
      shouldRollback = true;
    }

    if (consecutiveTimeouts >= this.thresholds.maxConsecutiveTimeouts) {
      recommendations.push(
        `Consecutive timeouts (${consecutiveTimeouts}) exceed threshold (${this.thresholds.maxConsecutiveTimeouts})`,
      );
      shouldRollback = true;
    }

    if (timeoutsLastHour >= this.thresholds.maxTimeoutsPerHour) {
      recommendations.push(
        `Timeouts in last hour (${timeoutsLastHour}) exceed threshold (${this.thresholds.maxTimeoutsPerHour})`,
      );
      shouldRollback = true;
    }

    if (averageProcessingTime > this.thresholds.maxProcessingTimeMs) {
      recommendations.push(
        `Average processing time (${(averageProcessingTime / 1000).toFixed(1)}s) exceeds threshold (${(this.thresholds.maxProcessingTimeMs / 1000).toFixed(1)}s)`,
      );
      recommendations.push('Consider optimizing chunking algorithm or increasing resources');
    }

    // Check if chunking is producing valid output
    const emptyChunkDocuments = recentMetrics.filter(
      (m) => m.success && (m.chunkCount === 0 || m.chunkCount === undefined),
    ).length;

    if (emptyChunkDocuments > 0) {
      recommendations.push(`${emptyChunkDocuments} documents produced no chunks`);
      recommendations.push('Check document parsing and chunking logic');
    }

    const healthy = !shouldRollback && failureRate < 2 && recommendations.length === 0;

    if (healthy) {
      recommendations.push('Chunking pipeline is operating normally');
    } else if (shouldRollback) {
      recommendations.unshift('IMMEDIATE ROLLBACK RECOMMENDED');
    }

    return {
      healthy,
      failureRate,
      recentFailures,
      recentTimeouts,
      averageProcessingTime,
      recommendations,
      shouldRollback,
    };
  }

  /**
   * Starts monitoring chunking health
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    this.monitoringInterval = setInterval(() => {
      if (!isFeatureEnabled('CHUNKING_ENABLED')) {
        return; // Skip monitoring if chunking is disabled
      }

      const status = this.getHealthStatus();

      // Log status
      if (!status.healthy) {
        console.warn('[ChunkingMonitor] Unhealthy status detected:', status);
      }

      // Trigger alerts
      if (status.shouldRollback) {
        console.error('[ChunkingMonitor] ROLLBACK TRIGGERED:', status.recommendations);
        this.triggerAlerts(status);
      }

      // Call registered callbacks
      this.alertCallbacks.forEach((callback) => callback(status));
    }, intervalMs);

    console.log(`[ChunkingMonitor] Started monitoring with ${intervalMs}ms interval`);
  }

  /**
   * Stops monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[ChunkingMonitor] Stopped monitoring');
    }
  }

  /**
   * Registers a callback for health status updates
   */
  onHealthUpdate(callback: (status: ChunkingHealthStatus) => void): () => void {
    this.alertCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Triggers rollback alerts
   */
  private triggerAlerts(status: ChunkingHealthStatus): void {
    // In a real implementation, this would:
    // 1. Send alerts to monitoring service (e.g., PagerDuty, Datadog)
    // 2. Email/Slack notifications to team
    // 3. Create incident ticket
    // 4. Trigger automatic rollback if configured

    console.error('=== CHUNKING ROLLBACK ALERT ===');
    console.error('Status:', status);
    console.error('Recommended Actions:');
    console.error('1. Set CHUNKING_ENABLED=false immediately');
    console.error('2. Review recent chunking metrics');
    console.error('3. Check server resources');
    console.error('4. Notify development team');
    console.error('================================');
  }

  /**
   * Simulates various failure scenarios for testing
   */
  simulateFailure(type: 'timeout' | 'error' | 'empty' | 'slow'): void {
    const timestamp = new Date();

    switch (type) {
      case 'timeout':
        recordChunkingMetrics({
          documentId: `test-timeout-${Date.now()}`,
          success: false,
          error: 'Operation timeout: Chunking took too long',
          timestamp,
        });
        break;

      case 'error':
        recordChunkingMetrics({
          documentId: `test-error-${Date.now()}`,
          success: false,
          error: 'Unexpected error during chunking',
          timestamp,
        });
        break;

      case 'empty':
        recordChunkingMetrics({
          documentId: `test-empty-${Date.now()}`,
          success: true,
          chunkCount: 0,
          duration: 1000,
          timestamp,
        });
        break;

      case 'slow':
        recordChunkingMetrics({
          documentId: `test-slow-${Date.now()}`,
          success: true,
          chunkCount: 100,
          duration: 400000, // 6.67 minutes
          timestamp,
        });
        break;
    }
  }
}

/**
 * Default monitor instance
 */
export const chunkingMonitor = new ChunkingMonitor();

/**
 * React hook for chunking health status
 */
export function useChunkingHealth(refreshInterval: number = 5000): ChunkingHealthStatus {
  const [status, setStatus] = React.useState<ChunkingHealthStatus>(() =>
    chunkingMonitor.getHealthStatus(),
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(chunkingMonitor.getHealthStatus());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return status;
}
