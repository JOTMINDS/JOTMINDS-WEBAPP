import { createClient } from 'npm:@supabase/supabase-js';

const getSupabaseClient = (serviceRole = false) => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceRole ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! : Deno.env.get('SUPABASE_ANON_KEY')!
  );
};

// Durable admin check backed by the platform_admins table (see migration
// 20260916120000_create_platform_admins.sql). Not app_metadata: Supabase
// Auth's own sign-in/session-refresh lifecycle recomputes
// app_metadata.provider/providers and appears to replace the whole
// app_metadata object when it does, silently dropping custom fields like
// role. A table only this app's own code writes to isn't subject to that.
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient(true);
    const { data, error } = await supabase
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.log(`[isPlatformAdmin] Error: ${error.message}`);
      return false;
    }
    return !!data;
  } catch (error) {
    console.log(`[isPlatformAdmin] Error: ${error}`);
    return false;
  }
}

// Verifies the caller is authenticated AND a platform admin. Returns the
// authenticated user (with .id, .email, etc.) or null.
export async function verifyPlatformAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseClient(true);
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    const isAdmin = await isPlatformAdmin(data.user.id);
    if (!isAdmin) return null;
    return data.user;
  } catch {
    return null;
  }
}
