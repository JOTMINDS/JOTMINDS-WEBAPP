import { createClient } from 'npm:@supabase/supabase-js';

export const getSupabaseClient = (serviceRole = false) =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceRole ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! : Deno.env.get('SUPABASE_ANON_KEY')!,
  );

/**
 * Verify the caller and return their user object (with `.id`), or null.
 * Mirrors the verifyAuth used in assessment-routes so the new routes enforce
 * the same data-isolation guarantees instead of trusting a body/param userId.
 */
export const verifyAuth = async (request: Request) => {


  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  // The anon key is not a user token — reject it so callers can't act as a user.
  if (!token || token === Deno.env.get('SUPABASE_ANON_KEY')) return null;

  try {
    const supabase = getSupabaseClient(true);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
};
