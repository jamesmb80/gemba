/**
 * Jest configuration for vector database tests
 */

module.exports = {
  displayName: 'Vector Database Tests',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.performance.test.ts'],
  collectCoverageFrom: [
    '../vector.ts',
    '../vectorWithFeatureFlag.ts',
    '../../featureFlags.ts',
    '../../types/vector.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/vector',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 10000, // 10 seconds for performance tests
  verbose: true,
};
