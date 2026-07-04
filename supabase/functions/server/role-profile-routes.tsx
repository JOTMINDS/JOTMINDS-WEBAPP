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
  
  return { supabase, user: data.user };
}

function mapToDb(clientPayload: any, userId: string) {
  return {
    title: clientPayload.name || clientPayload.title,
    org_id: clientPayload.orgId || clientPayload.org_id,
    cognitive_demands: clientPayload.idealScores || clientPayload.cognitive_demands,
    created_by: userId,
    description: clientPayload.description,
    department: clientPayload.department,
    is_active: clientPayload.isActive !== undefined ? clientPayload.isActive : clientPayload.is_active,
  };
}

function mapToClient(dbRecord: any) {
  return {
    ...dbRecord,
    name: dbRecord.title,
    orgId: dbRecord.org_id,
    idealScores: dbRecord.cognitive_demands,
    isActive: dbRecord.is_active
  };
}

app.get('/', async (c) => {
  const auth = await getSupabase(c.req.raw);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  const { supabase } = auth;

  const institutionId = c.req.query('institutionId');
  
  try {
    let query = supabase.from('role_profiles').select('*');
    if (institutionId) {
      query = query.eq('org_id', institutionId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return c.json({ success: true, profiles: data.map(mapToClient) });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post('/', async (c) => {
  const auth = await getSupabase(c.req.raw);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  const { supabase, user } = auth;

  try {
    const body = await c.req.json();
    const dbPayload = mapToDb(body, user.id);
    const { data, error } = await supabase.from('role_profiles').insert([dbPayload]).select().single();
    
    if (error) throw error;
    return c.json({ success: true, profile: mapToClient(data) }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.put('/:id', async (c) => {
  const auth = await getSupabase(c.req.raw);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  const { supabase, user } = auth;

  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const dbPayload = mapToDb(body, user.id);
    const { data, error } = await supabase.from('role_profiles').update(dbPayload).eq('id', id).select().single();
    
    if (error) throw error;
    return c.json({ success: true, profile: mapToClient(data) });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.delete('/:id', async (c) => {
  const auth = await getSupabase(c.req.raw);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  const { supabase } = auth;

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
  const auth = await getSupabase(c.req.raw);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  const { supabase } = auth;

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
