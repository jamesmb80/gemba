/**
 * Integration tests for feature flag system
 */

import {
  isFeatureEnabled,
  getAllFeatureFlags,
  toggleFeatureFlag,
  getFeatureFlagInfo,
  getCriticalFeatureStatus,
  useFeatureFlag,
} from '../featureFlags';
import { getConfig } from '@/config/environment';

jest.mock('@/config/environment', () => ({
  getConfig: jest.fn(),
}));

describe('Feature Flag System Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    // Mock default config
    (getConfig as jest.Mock).mockReturnValue({
      vectorSearchEnabled: false,
      environment: 'development',
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variable Integration', () => {
    it('should read VECTOR_SEARCH_ENABLED from environment', () => {
      process.env.VECTOR_SEARCH_ENABLED = 'true';

      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(true);
    });

    it('should default to false when environment variable is not set', () => {
      delete process.env.VECTOR_SEARCH_ENABLED;

      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(false);
    });

    it('should handle string "false" correctly', () => {
      process.env.VECTOR_SEARCH_ENABLED = 'false';

      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(false);
    });

    it('should handle invalid environment values', () => {
      process.env.VECTOR_SEARCH_ENABLED = 'invalid';

      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(false);
    });
  });

  describe('Configuration Integration', () => {
    it('should fall back to config when environment variable is not set', () => {
      delete process.env.VECTOR_SEARCH_ENABLED;

      (getConfig as jest.Mock).mockReturnValue({
        vectorSearchEnabled: true,
        environment: 'development',
      });

      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(true);
    });

    it('should prefer environment variable over config', () => {
      process.env.VECTOR_SEARCH_ENABLED = 'false';

      (getConfig as jest.Mock).mockReturnValue({
        vectorSearchEnabled: true,
        environment: 'development',
      });

      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(false);
    });
  });

  describe('Multiple Feature Flags', () => {
    it('should handle multiple feature flags correctly', () => {
      process.env.VECTOR_SEARCH_ENABLED = 'true';
      process.env.MULTI_TENANT_ENABLED = 'true';
      process.env.ANALYTICS_ENABLED = 'false';

      const flags = getAllFeatureFlags();

      expect(flags.VECTOR_SEARCH_ENABLED).toBe(true);
      expect(flags.MULTI_TENANT_ENABLED).toBe(true);
      expect(flags.ANALYTICS_ENABLED).toBe(false);
    });

    it('should use default values when environment variables are not set', () => {
      delete process.env.VECTOR_SEARCH_ENABLED;
      delete process.env.MULTI_TENANT_ENABLED;
      delete process.env.ANALYTICS_ENABLED;

      const flags = getAllFeatureFlags();

      expect(flags.VECTOR_SEARCH_ENABLED).toBe(false); // Default false
      expect(flags.MULTI_TENANT_ENABLED).toBe(true); // Default true
      expect(flags.ANALYTICS_ENABLED).toBe(false); // Default false
    });
  });

  describe('Feature Flag Metadata', () => {
    it('should provide complete feature flag information', () => {
      process.env.VECTOR_SEARCH_ENABLED = 'true';

      const info = getFeatureFlagInfo('VECTOR_SEARCH_ENABLED');

      expect(info).toEqual({
        defaultValue: false,
        description: 'Enable vector database search functionality',
        rollbackPriority: 'critical',
        enabled: true,
      });
    });

    it('should identify critical features', () => {
      process.env.VECTOR_SEARCH_ENABLED = 'true';
      process.env.MULTI_TENANT_ENABLED = 'true';
      process.env.ANALYTICS_ENABLED = 'false';

      const criticalFeatures = getCriticalFeatureStatus();

      expect(criticalFeatures).toHaveLength(2);
      expect(criticalFeatures).toContainEqual({
        flag: 'VECTOR_SEARCH_ENABLED',
        enabled: true,
      });
      expect(criticalFeatures).toContainEqual({
        flag: 'MULTI_TENANT_ENABLED',
        enabled: true,
      });
    });
  });

  describe('Development vs Production Behavior', () => {
    it('should allow toggling in development', () => {
      (getConfig as jest.Mock).mockReturnValue({
        environment: 'development',
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      toggleFeatureFlag('VECTOR_SEARCH_ENABLED', true);

      expect(consoleSpy).toHaveBeenCalledWith('Feature flag VECTOR_SEARCH_ENABLED toggled to true');

      consoleSpy.mockRestore();
    });

    it('should warn when toggling in production', () => {
      (getConfig as jest.Mock).mockReturnValue({
        environment: 'production',
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      toggleFeatureFlag('VECTOR_SEARCH_ENABLED', true);

      expect(consoleSpy).toHaveBeenCalledWith('Feature flags should not be toggled in production');

      consoleSpy.mockRestore();
    });
  });

  describe('React Hook Integration', () => {
    it('should work with React hook pattern', () => {
      process.env.VECTOR_SEARCH_ENABLED = 'true';

      const enabled = useFeatureFlag('VECTOR_SEARCH_ENABLED');

      expect(enabled).toBe(true);
    });

    it('should handle disabled features', () => {
      process.env.VECTOR_SEARCH_ENABLED = 'false';

      const enabled = useFeatureFlag('VECTOR_SEARCH_ENABLED');

      expect(enabled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing config gracefully', () => {
      delete process.env.VECTOR_SEARCH_ENABLED;

      (getConfig as jest.Mock).mockImplementation(() => {
        throw new Error('Config not found');
      });

      // Should fall back to default value
      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(false);
    });

    it('should handle undefined config values', () => {
      delete process.env.VECTOR_SEARCH_ENABLED;

      (getConfig as jest.Mock).mockReturnValue({
        vectorSearchEnabled: undefined,
        environment: 'development',
      });

      // Should fall back to default value
      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(false);
    });
  });

  describe('Rollback Scenario Testing', () => {
    it('should support immediate rollback via environment variable', () => {
      // Initially enabled
      process.env.VECTOR_SEARCH_ENABLED = 'true';
      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(true);

      // Immediate rollback
      process.env.VECTOR_SEARCH_ENABLED = 'false';
      expect(isFeatureEnabled('VECTOR_SEARCH_ENABLED')).toBe(false);

      // Verify critical features are properly disabled
      const criticalFeatures = getCriticalFeatureStatus();
      const vectorFeature = criticalFeatures.find((f) => f.flag === 'VECTOR_SEARCH_ENABLED');
      expect(vectorFeature?.enabled).toBe(false);
    });

    it('should handle partial rollback scenarios', () => {
      // All features enabled
      process.env.VECTOR_SEARCH_ENABLED = 'true';
      process.env.MULTI_TENANT_ENABLED = 'true';
      process.env.ANALYTICS_ENABLED = 'true';

      // Partial rollback - disable only vector search
      process.env.VECTOR_SEARCH_ENABLED = 'false';

      const flags = getAllFeatureFlags();
      expect(flags.VECTOR_SEARCH_ENABLED).toBe(false);
      expect(flags.MULTI_TENANT_ENABLED).toBe(true);
      expect(flags.ANALYTICS_ENABLED).toBe(true);
    });

    it('should handle emergency rollback of all critical features', () => {
      // All features enabled
      process.env.VECTOR_SEARCH_ENABLED = 'true';
      process.env.MULTI_TENANT_ENABLED = 'true';
      process.env.ANALYTICS_ENABLED = 'true';

      // Emergency rollback of critical features
      process.env.VECTOR_SEARCH_ENABLED = 'false';
      process.env.MULTI_TENANT_ENABLED = 'false';

      const criticalFeatures = getCriticalFeatureStatus();

      criticalFeatures.forEach((feature) => {
        expect(feature.enabled).toBe(false);
      });
    });
  });
});
