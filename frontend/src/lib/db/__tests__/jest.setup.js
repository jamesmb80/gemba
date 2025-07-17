/**
 * Jest setup for vector database tests
 */

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock config directory
jest.mock('@/config/environment', () => ({
  getConfig: jest.fn(() => ({
    vectorSearchEnabled: false,
    environment: 'test',
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
      serviceRoleKey: 'test-service-role-key',
    },
  })),
}));

// Performance test helpers
global.measurePerformance = (fn) => {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  return { result, duration: end - start };
};

global.measureAsyncPerformance = async (fn) => {
  const start = Date.now();
  const result = await fn();
  const end = Date.now();
  return { result, duration: end - start };
};

// Test data generators
global.generateTestEmbedding = (dimension = 1536) => {
  return Array.from({ length: dimension }, (_, i) => Math.sin(i * 0.01) * Math.cos(i * 0.02));
};

global.generateTestEmbeddings = (count = 10, dimension = 1536) => {
  return Array.from({ length: count }, (_, i) => ({
    tenant_id: `tenant-${i % 3}`, // Distribute across 3 tenants
    document_id: `doc-${i}`,
    chunk_id: `chunk-${i}`,
    embedding: generateTestEmbedding(dimension),
    metadata: {
      page: Math.floor(i / 10) + 1,
      section: `section-${i % 5}`,
      type: i % 2 === 0 ? 'text' : 'code',
    },
  }));
};

// Mock Supabase response generators
global.createMockSupabaseResponse = (data, error = null) => ({
  data,
  error,
});

global.createMockSupabaseError = (message, code = 'PGRST000') => ({
  message,
  code,
  details: null,
  hint: null,
});

// Test utilities
global.expectValidEmbedding = (embedding) => {
  expect(embedding).toHaveProperty('id');
  expect(embedding).toHaveProperty('tenant_id');
  expect(embedding).toHaveProperty('document_id');
  expect(embedding).toHaveProperty('chunk_id');
  expect(embedding).toHaveProperty('embedding');
  expect(embedding).toHaveProperty('metadata');
  expect(Array.isArray(embedding.embedding)).toBe(true);
  expect(embedding.embedding.length).toBe(1536);
};

global.expectValidSearchResult = (result) => {
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('similarity');
  expect(result).toHaveProperty('chunk_text');
  expect(typeof result.similarity).toBe('number');
  expect(result.similarity).toBeGreaterThanOrEqual(0);
  expect(result.similarity).toBeLessThanOrEqual(1);
};

// Console log suppression for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Suppress console logs unless explicitly needed
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console functions
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(30000); // 30 seconds

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
