import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time issues
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  return key;
}

// Lazy client creation using getter
let _supabase: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
    }
    return _supabase[prop as keyof typeof _supabase];
  }
});

// Add this for server-side usage in API routes
export function createSupabaseServerClient(url?: string, key?: string) {
  return createClient(url || getSupabaseUrl(), key || getSupabaseAnonKey());
}
