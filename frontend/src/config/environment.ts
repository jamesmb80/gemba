/**
 * Environment-specific configuration for vector database
 */

interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  vectorSearchEnabled: boolean;
  vectorIndexLists: number;
  debugMode: boolean;
  environment: 'development' | 'staging' | 'production';
  chunkingEnabled: boolean;
}

const config = {
  development: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    vectorSearchEnabled: process.env.VECTOR_SEARCH_ENABLED === 'true',
    vectorIndexLists: 100,
    debugMode: true,
    environment: 'development' as const,
    chunkingEnabled: process.env.CHUNKING_ENABLED === 'true',
  },
  staging: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    vectorSearchEnabled: process.env.VECTOR_SEARCH_ENABLED === 'true',
    vectorIndexLists: 100,
    debugMode: false,
    environment: 'staging' as const,
    chunkingEnabled: process.env.CHUNKING_ENABLED === 'true',
  },
  production: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    vectorSearchEnabled: process.env.VECTOR_SEARCH_ENABLED === 'true',
    vectorIndexLists: 200,
    debugMode: false,
    environment: 'production' as const,
    chunkingEnabled: process.env.CHUNKING_ENABLED === 'true',
  },
};

export function getConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV || 'development';
  return config[env as keyof typeof config];
}

export function isVectorSearchEnabled(): boolean {
  return getConfig().vectorSearchEnabled;
}

export function isChunkingEnabled(): boolean {
  return getConfig().chunkingEnabled;
}

export function getEnvironment(): string {
  return getConfig().environment;
}

export function isDebugMode(): boolean {
  return getConfig().debugMode;
}
