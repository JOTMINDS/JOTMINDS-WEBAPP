import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';

const app = new Hono();

// Helper to verify authentication and get Supabase client
async function getSupabase(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  
  return supabase;
}

app.get('/', async (c) => {
  const supabase = await getSupabase(c.req.raw);
  if (!supabase) return c.json({ error: 'Unauthorized' }, 401);

  const institutionId = c.req.query('institutionId');
  
  try {
    let query = supabase.from('role_profiles').select('*');
    if (institutionId) {
      query = query.eq('org_id', institutionId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return c.json({ success: true, profiles: data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post('/', async (c) => {
  const supabase = await getSupabase(c.req.raw);
  if (!supabase) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { data, error } = await supabase.from('role_profiles').insert([body]).select().single();
    
    if (error) throw error;
    return c.json({ success: true, profile: data }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.put('/:id', async (c) => {
  const supabase = await getSupabase(c.req.raw);
  if (!supabase) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { data, error } = await supabase.from('role_profiles').update(body).eq('id', id).select().single();
    
    if (error) throw error;
    return c.json({ success: true, profile: data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.delete('/:id', async (c) => {
  const supabase = await getSupabase(c.req.raw);
  if (!supabase) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  
  try {
    const { error } = await supabase.from('role_profiles').delete().eq('id', id);
    if (error) throw error;
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.get('/:id/fit-scores', async (c) => {
  const supabase = await getSupabase(c.req.raw);
  if (!supabase) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  
  try {
    const { data, error } = await supabase.from('cognitive_role_fit_scores').select('*').eq('role_id', id);
    if (error) throw error;
    return c.json({ success: true, fitScores: data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
