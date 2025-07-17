/**
 * Tests for chunking configuration
 */

import { ChunkConfigManager, ChunkConfigUtils } from '../config';
import { ChunkConfig, DEFAULT_CHUNK_CONFIG } from '../../types/chunking';

describe('ChunkConfigManager', () => {
  let manager: ChunkConfigManager;

  beforeEach(() => {
    manager = ChunkConfigManager.getInstance();
    manager.resetToDefaults();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const manager1 = ChunkConfigManager.getInstance();
      const manager2 = ChunkConfigManager.getInstance();

      expect(manager1).toBe(manager2);
    });
  });

  describe('getConfig', () => {
    it('should return default configuration initially', () => {
      const config = manager.getConfig();

      expect(config).toEqual(DEFAULT_CHUNK_CONFIG);
    });

    it('should return a copy of the configuration', () => {
      const config1 = manager.getConfig();
      const config2 = manager.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });
  });

  describe('updateConfig', () => {
    it('should update valid configuration', () => {
      const newConfig: Partial<ChunkConfig> = {
        chunkSize: 1500,
        overlap: 300,
      };

      const result = manager.updateConfig(newConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);

      const config = manager.getConfig();
      expect(config.chunkSize).toBe(1500);
      expect(config.overlap).toBe(300);
    });

    it('should reject invalid chunk size', () => {
      const invalidConfig: Partial<ChunkConfig> = {
        chunkSize: 50, // Too small
      };

      const result = manager.updateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Chunk size must be at least 100 tokens');

      // Configuration should not be updated
      const config = manager.getConfig();
      expect(config.chunkSize).toBe(DEFAULT_CHUNK_CONFIG.chunkSize);
    });

    it('should reject chunk size that is too large', () => {
      const invalidConfig: Partial<ChunkConfig> = {
        chunkSize: 15000, // Too large
      };

      const result = manager.updateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Chunk size cannot exceed 10,000 tokens');
    });

    it('should reject negative overlap', () => {
      const invalidConfig: Partial<ChunkConfig> = {
        overlap: -50,
      };

      const result = manager.updateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Overlap cannot be negative');
    });

    it('should reject overlap greater than chunk size', () => {
      const invalidConfig: Partial<ChunkConfig> = {
        chunkSize: 500,
        overlap: 600,
      };

      const result = manager.updateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Overlap must be less than chunk size');
    });

    it('should reject overlap that exceeds current chunk size', () => {
      // First set a chunk size
      manager.updateConfig({ chunkSize: 500 });

      // Then try to set overlap larger than current chunk size
      const invalidConfig: Partial<ChunkConfig> = {
        overlap: 600,
      };

      const result = manager.updateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Overlap must be less than current chunk size');
    });

    it('should reject minimum chunk size that is too small', () => {
      const invalidConfig: Partial<ChunkConfig> = {
        minChunkSize: 5,
      };

      const result = manager.updateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum chunk size must be at least 10 tokens');
    });

    it('should reject minimum chunk size greater than chunk size', () => {
      const invalidConfig: Partial<ChunkConfig> = {
        chunkSize: 500,
        minChunkSize: 600,
      };

      const result = manager.updateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum chunk size must be less than chunk size');
    });
  });

  describe('validateConfig', () => {
    it('should validate configuration without updating', () => {
      const originalConfig = manager.getConfig();

      const invalidConfig: Partial<ChunkConfig> = {
        chunkSize: 50,
      };

      const result = manager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);

      // Configuration should remain unchanged
      const currentConfig = manager.getConfig();
      expect(currentConfig).toEqual(originalConfig);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset configuration to defaults', () => {
      // Change configuration
      manager.updateConfig({ chunkSize: 2000, overlap: 400 });

      // Reset to defaults
      manager.resetToDefaults();

      const config = manager.getConfig();
      expect(config).toEqual(DEFAULT_CHUNK_CONFIG);
    });
  });

  describe('getPresets', () => {
    it('should return predefined presets', () => {
      const presets = manager.getPresets();

      expect(presets).toHaveProperty('small');
      expect(presets).toHaveProperty('medium');
      expect(presets).toHaveProperty('large');
      expect(presets).toHaveProperty('technical');
      expect(presets).toHaveProperty('manual');

      // Verify preset structure
      expect(presets.small.chunkSize).toBe(500);
      expect(presets.medium.chunkSize).toBe(1000);
      expect(presets.large.chunkSize).toBe(2000);
    });
  });

  describe('applyPreset', () => {
    it('should apply valid preset', () => {
      const result = manager.applyPreset('small');

      expect(result).toBe(true);

      const config = manager.getConfig();
      expect(config.chunkSize).toBe(500);
      expect(config.overlap).toBe(50);
    });

    it('should reject invalid preset', () => {
      const result = manager.applyPreset('nonexistent');

      expect(result).toBe(false);

      // Configuration should remain unchanged
      const config = manager.getConfig();
      expect(config).toEqual(DEFAULT_CHUNK_CONFIG);
    });
  });

  describe('JSON serialization', () => {
    it('should serialize configuration to JSON', () => {
      manager.updateConfig({ chunkSize: 1500, overlap: 300 });

      const json = manager.toJSON();
      const parsed = JSON.parse(json);

      expect(parsed.chunkSize).toBe(1500);
      expect(parsed.overlap).toBe(300);
    });

    it('should deserialize configuration from JSON', () => {
      const config = {
        chunkSize: 1500,
        overlap: 300,
        respectSentences: false,
        respectParagraphs: true,
        minChunkSize: 150,
      };

      const json = JSON.stringify(config);
      const result = manager.fromJSON(json);

      expect(result.isValid).toBe(true);

      const currentConfig = manager.getConfig();
      expect(currentConfig.chunkSize).toBe(1500);
      expect(currentConfig.overlap).toBe(300);
      expect(currentConfig.respectSentences).toBe(false);
    });

    it('should reject invalid JSON', () => {
      const invalidJson = '{ invalid json }';

      const result = manager.fromJSON(invalidJson);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid JSON format');
    });

    it('should validate deserialized configuration', () => {
      const invalidConfig = {
        chunkSize: 50, // Too small
        overlap: -10, // Negative
      };

      const json = JSON.stringify(invalidConfig);
      const result = manager.fromJSON(json);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('estimateProcessingTime', () => {
    it('should estimate processing time correctly', () => {
      const documentLength = 10000;

      const estimate = manager.estimateProcessingTime(documentLength);

      expect(estimate.estimatedChunks).toBeGreaterThan(0);
      expect(estimate.estimatedTimeMs).toBeGreaterThan(0);
    });

    it('should scale with document length', () => {
      const shortDoc = 1000;
      const longDoc = 10000;

      const shortEstimate = manager.estimateProcessingTime(shortDoc);
      const longEstimate = manager.estimateProcessingTime(longDoc);

      expect(longEstimate.estimatedChunks).toBeGreaterThan(shortEstimate.estimatedChunks);
      expect(longEstimate.estimatedTimeMs).toBeGreaterThan(shortEstimate.estimatedTimeMs);
    });
  });
});

describe('ChunkConfigUtils', () => {
  describe('validate', () => {
    it('should validate configuration without creating manager instance', () => {
      const config: Partial<ChunkConfig> = {
        chunkSize: 1500,
        overlap: 300,
      };

      const result = ChunkConfigUtils.validate(config);

      expect(result.isValid).toBe(true);
    });
  });

  describe('fromEnvironment', () => {
    it('should create configuration from environment variables', () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        CHUNK_SIZE: '1500',
        CHUNK_OVERLAP: '300',
        RESPECT_SENTENCES: 'false',
        MIN_CHUNK_SIZE: '150',
      };

      const config = ChunkConfigUtils.fromEnvironment();

      expect(config.chunkSize).toBe(1500);
      expect(config.overlap).toBe(300);
      expect(config.respectSentences).toBe(false);
      expect(config.minChunkSize).toBe(150);

      // Restore environment
      process.env = originalEnv;
    });

    it('should use defaults when environment variables are not set', () => {
      const config = ChunkConfigUtils.fromEnvironment();

      expect(config.chunkSize).toBe(1000);
      expect(config.overlap).toBe(200);
      expect(config.respectSentences).toBe(true);
    });
  });

  describe('optimizeForDocumentType', () => {
    it('should optimize for manual documents', () => {
      const config = ChunkConfigUtils.optimizeForDocumentType('manual');

      expect(config.chunkSize).toBe(800);
      expect(config.overlap).toBe(100);
      expect(config.respectSentences).toBe(true);
      expect(config.respectParagraphs).toBe(true);
    });

    it('should optimize for technical documents', () => {
      const config = ChunkConfigUtils.optimizeForDocumentType('technical');

      expect(config.chunkSize).toBe(1500);
      expect(config.overlap).toBe(300);
      expect(config.respectSentences).toBe(false);
      expect(config.respectParagraphs).toBe(true);
    });

    it('should optimize for guide documents', () => {
      const config = ChunkConfigUtils.optimizeForDocumentType('guide');

      expect(config.chunkSize).toBe(1200);
      expect(config.overlap).toBe(200);
    });

    it('should optimize for specification documents', () => {
      const config = ChunkConfigUtils.optimizeForDocumentType('specification');

      expect(config.chunkSize).toBe(2000);
      expect(config.overlap).toBe(400);
      expect(config.respectSentences).toBe(false);
      expect(config.respectParagraphs).toBe(false);
    });

    it('should return default for unknown document type', () => {
      const config = ChunkConfigUtils.optimizeForDocumentType('unknown' as any);

      expect(config).toEqual(DEFAULT_CHUNK_CONFIG);
    });
  });
});
