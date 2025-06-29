import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add this for server-side usage in API routes
export function createSupabaseServerClient(url?: string, key?: string) {
  return createClient(url || supabaseUrl, key || supabaseAnonKey);
}
