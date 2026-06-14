import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    );
  }
  return supabaseClient;
};