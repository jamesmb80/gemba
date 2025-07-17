/**
 * Configuration interface for chunk parameters
 */

import { ChunkConfig, DEFAULT_CHUNK_CONFIG } from '../types/chunking';

export interface ChunkConfigValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Configuration manager for chunking parameters
 */
export class ChunkConfigManager {
  private static instance: ChunkConfigManager;
  private config: ChunkConfig;

  private constructor() {
    this.config = { ...DEFAULT_CHUNK_CONFIG };
  }

  static getInstance(): ChunkConfigManager {
    if (!ChunkConfigManager.instance) {
      ChunkConfigManager.instance = new ChunkConfigManager();
    }
    return ChunkConfigManager.instance;
  }

  /**
   * Gets current configuration
   */
  getConfig(): ChunkConfig {
    return { ...this.config };
  }

  /**
   * Updates configuration with validation
   */
  updateConfig(newConfig: Partial<ChunkConfig>): ChunkConfigValidation {
    const validation = this.validateConfig(newConfig);

    if (validation.isValid) {
      this.config = { ...this.config, ...newConfig };
    }

    return validation;
  }

  /**
   * Validates configuration parameters
   */
  validateConfig(config: Partial<ChunkConfig>): ChunkConfigValidation {
    const errors: string[] = [];

    // Validate chunk size
    if (config.chunkSize !== undefined) {
      if (config.chunkSize < 100) {
        errors.push('Chunk size must be at least 100 tokens');
      }
      if (config.chunkSize > 10000) {
        errors.push('Chunk size cannot exceed 10,000 tokens');
      }
    }

    // Validate overlap
    if (config.overlap !== undefined) {
      if (config.overlap < 0) {
        errors.push('Overlap cannot be negative');
      }
      if (config.chunkSize !== undefined && config.overlap >= config.chunkSize) {
        errors.push('Overlap must be less than chunk size');
      }
      if (this.config.chunkSize && config.overlap >= this.config.chunkSize) {
        errors.push('Overlap must be less than current chunk size');
      }
      if (config.overlap > 2000) {
        errors.push('Overlap cannot exceed 2,000 tokens');
      }
    }

    // Validate minimum chunk size
    if (config.minChunkSize !== undefined) {
      if (config.minChunkSize < 10) {
        errors.push('Minimum chunk size must be at least 10 tokens');
      }
      if (config.chunkSize !== undefined && config.minChunkSize >= config.chunkSize) {
        errors.push('Minimum chunk size must be less than chunk size');
      }
      if (this.config.chunkSize && config.minChunkSize >= this.config.chunkSize) {
        errors.push('Minimum chunk size must be less than current chunk size');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Resets configuration to defaults
   */
  resetToDefaults(): void {
    this.config = { ...DEFAULT_CHUNK_CONFIG };
  }

  /**
   * Gets configuration presets for different use cases
   */
  getPresets(): Record<string, ChunkConfig> {
    return {
      small: {
        chunkSize: 500,
        overlap: 50,
        respectSentences: true,
        respectParagraphs: true,
        minChunkSize: 50,
      },
      medium: {
        chunkSize: 1000,
        overlap: 200,
        respectSentences: true,
        respectParagraphs: true,
        minChunkSize: 100,
      },
      large: {
        chunkSize: 2000,
        overlap: 400,
        respectSentences: true,
        respectParagraphs: false,
        minChunkSize: 200,
      },
      technical: {
        chunkSize: 1500,
        overlap: 300,
        respectSentences: false,
        respectParagraphs: true,
        minChunkSize: 150,
      },
      manual: {
        chunkSize: 800,
        overlap: 100,
        respectSentences: true,
        respectParagraphs: true,
        minChunkSize: 80,
      },
    };
  }

  /**
   * Applies a preset configuration
   */
  applyPreset(presetName: string): boolean {
    const presets = this.getPresets();
    const preset = presets[presetName];

    if (!preset) {
      return false;
    }

    this.config = { ...preset };
    return true;
  }

  /**
   * Gets configuration as JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Loads configuration from JSON string
   */
  fromJSON(json: string): ChunkConfigValidation {
    try {
      const config = JSON.parse(json) as Partial<ChunkConfig>;
      return this.updateConfig(config);
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid JSON format'],
      };
    }
  }

  /**
   * Estimates processing time based on configuration
   */
  estimateProcessingTime(documentLength: number): {
    estimatedChunks: number;
    estimatedTimeMs: number;
  } {
    const estimatedChunks = Math.ceil(
      documentLength / (this.config.chunkSize - this.config.overlap),
    );

    // Rough estimation: 10ms per chunk + 5ms per 1000 characters
    const estimatedTimeMs = estimatedChunks * 10 + (documentLength / 1000) * 5;

    return {
      estimatedChunks,
      estimatedTimeMs,
    };
  }
}

/**
 * Configuration validation utilities
 */
export const ChunkConfigUtils = {
  /**
   * Validates configuration without updating
   */
  validate: (config: Partial<ChunkConfig>): ChunkConfigValidation => {
    const manager = ChunkConfigManager.getInstance();
    return manager.validateConfig(config);
  },

  /**
   * Creates a configuration from environment variables
   */
  fromEnvironment: (): ChunkConfig => {
    return {
      chunkSize: parseInt(process.env.CHUNK_SIZE || '1000'),
      overlap: parseInt(process.env.CHUNK_OVERLAP || '200'),
      respectSentences: process.env.RESPECT_SENTENCES !== 'false',
      respectParagraphs: process.env.RESPECT_PARAGRAPHS !== 'false',
      minChunkSize: parseInt(process.env.MIN_CHUNK_SIZE || '100'),
    };
  },

  /**
   * Optimizes configuration for document type
   */
  optimizeForDocumentType: (
    documentType: 'manual' | 'technical' | 'guide' | 'specification',
  ): ChunkConfig => {
    const baseConfig = { ...DEFAULT_CHUNK_CONFIG };

    switch (documentType) {
      case 'manual':
        return {
          ...baseConfig,
          chunkSize: 800,
          overlap: 100,
          respectSentences: true,
          respectParagraphs: true,
        };
      case 'technical':
        return {
          ...baseConfig,
          chunkSize: 1500,
          overlap: 300,
          respectSentences: false,
          respectParagraphs: true,
        };
      case 'guide':
        return {
          ...baseConfig,
          chunkSize: 1200,
          overlap: 200,
          respectSentences: true,
          respectParagraphs: true,
        };
      case 'specification':
        return {
          ...baseConfig,
          chunkSize: 2000,
          overlap: 400,
          respectSentences: false,
          respectParagraphs: false,
        };
      default:
        return baseConfig;
    }
  },
};
