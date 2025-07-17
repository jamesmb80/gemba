/**
 * Feature flag system for controlling feature rollout
 */

import React from 'react';
import { getConfig } from '@/config/environment';

export type FeatureFlag =
  | 'VECTOR_SEARCH_ENABLED'
  | 'MULTI_TENANT_ENABLED'
  | 'ANALYTICS_ENABLED'
  | 'CHUNKING_ENABLED';

interface FeatureFlagConfig {
  defaultValue: boolean;
  description: string;
  rollbackPriority: 'critical' | 'high' | 'medium' | 'low';
}

const featureFlags: Record<FeatureFlag, FeatureFlagConfig> = {
  VECTOR_SEARCH_ENABLED: {
    defaultValue: false,
    description: 'Enable vector database search functionality',
    rollbackPriority: 'critical',
  },
  MULTI_TENANT_ENABLED: {
    defaultValue: true,
    description: 'Enable multi-tenant data isolation',
    rollbackPriority: 'critical',
  },
  ANALYTICS_ENABLED: {
    defaultValue: false,
    description: 'Enable analytics dashboard',
    rollbackPriority: 'low',
  },
  CHUNKING_ENABLED: {
    defaultValue: false,
    description: 'Enable document chunking pipeline for PDF processing',
    rollbackPriority: 'high',
  },
};

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // First check environment variable
  const envValue = process.env[flag];
  if (envValue !== undefined) {
    return envValue === 'true';
  }

  // Special handling for feature flags from config
  if (flag === 'VECTOR_SEARCH_ENABLED') {
    return getConfig().vectorSearchEnabled;
  }

  if (flag === 'CHUNKING_ENABLED') {
    return getConfig().chunkingEnabled;
  }

  // Fall back to default value
  return featureFlags[flag].defaultValue;
}

/**
 * Get all feature flags and their current status
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  const flags = Object.keys(featureFlags) as FeatureFlag[];
  return flags.reduce(
    (acc, flag) => {
      acc[flag] = isFeatureEnabled(flag);
      return acc;
    },
    {} as Record<FeatureFlag, boolean>,
  );
}

/**
 * Toggle a feature flag (for testing/development only)
 * In production, this should be done via environment variables
 * @param flag - The feature flag to toggle
 * @param enabled - Whether to enable or disable the flag
 * @throws Error if attempted in production environment
 */
export function toggleFeatureFlag(flag: FeatureFlag, enabled: boolean): void {
  if (getConfig().environment === 'production') {
    throw new Error('Feature flags cannot be toggled in production environment');
  }

  // This would typically update a local storage or session storage value
  // For now, we'll just log the change
  console.log(`Feature flag ${flag} toggled to ${enabled}`);
}

/**
 * Get feature flag metadata
 */
export function getFeatureFlagInfo(flag: FeatureFlag): FeatureFlagConfig & { enabled: boolean } {
  return {
    ...featureFlags[flag],
    enabled: isFeatureEnabled(flag),
  };
}

/**
 * Check if critical features are enabled for rollback decisions
 */
export function getCriticalFeatureStatus(): { flag: FeatureFlag; enabled: boolean }[] {
  return (Object.keys(featureFlags) as FeatureFlag[])
    .filter((flag) => featureFlags[flag].rollbackPriority === 'critical')
    .map((flag) => ({
      flag,
      enabled: isFeatureEnabled(flag),
    }));
}

/**
 * React hook for using feature flags
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  // In a real implementation, this might subscribe to flag changes
  // For now, it's a simple wrapper
  return isFeatureEnabled(flag);
}

/**
 * Higher-order component for feature-flagged components
 */
export function withFeatureFlag<P extends object>(
  flag: FeatureFlag,
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>,
): React.ComponentType<P> {
  return (props: P) => {
    const enabled = isFeatureEnabled(flag);

    if (enabled) {
      return React.createElement(Component, props);
    }

    if (FallbackComponent) {
      return React.createElement(FallbackComponent, props);
    }

    return null;
  };
}
