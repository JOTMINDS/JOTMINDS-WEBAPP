import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import { kolbQuestions, sternbergQuestions, dualProcessQuestions } from './full-question-bank.tsx';

const app = new Hono();

const getServiceClient = () =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

const verifyAdmin = (request: Request): boolean => {
  const adminToken = request.headers.get('X-Admin-Token');
  if (adminToken && adminToken.startsWith('admin-token-')) return true;
  const auth = request.headers.get('Authorization');
  if (auth) {
    const token = auth.replace('Bearer ', '');
    return token.startsWith('admin-token-');
  }
  return false;
};

// ─────────────────────────────────────────────
// Ensure the table exists
// ─────────────────────────────────────────────
async function ensureTable(supabase: ReturnType<typeof getServiceClient>) {
  const ddl = `
    create table if not exists assessment_questions (
      id uuid primary key default gen_random_uuid(),
      external_id text,
      assessment_type text not null,
      framework text not null,
      age_group text not null default 'general',
      dimension text not null,
      question_text text not null,
      question_format text not null default 'likert',
      options jsonb default null,
      points integer default 1,
      display_order integer,
      is_active boolean default true,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create index if not exists idx_aq_type_group on assessment_questions(assessment_type, age_group);
  `;
  const { error } = await supabase.rpc('exec_sql', { sql: ddl }).maybeSingle();
  // exec_sql may not exist – try raw query via pg_catalog instead
  if (error) {
    // Fall through: table creation is also handled via migration
    console.log('[seed] Table DDL note:', error.message);
  }
}

// ─────────────────────────────────────────────
// Build the unified question rows
// ─────────────────────────────────────────────
function buildRows() {
  const rows: any[] = [];
  let order = 1;

  // ── 1. Kolb Learning Styles (100 q, general/full-question-bank) ──
  kolbQuestions.forEach((q: any) => {
    rows.push({
      external_id: `kolb-general-${q.id}`,
      assessment_type: 'learning',
      framework: 'kolb',
      age_group: 'general',
      dimension: q.style,
      question_text: q.question,
      question_format: 'likert',
      options: null,
      points: q.points ?? 1,
      display_order: order++,
      is_active: true
    });
  });

  // ── 2. Sternberg Thinking Styles (100 q) ──
  sternbergQuestions.forEach((q: any) => {
    rows.push({
      external_id: `sternberg-general-${q.id}`,
      assessment_type: 'thinking',
      framework: 'sternberg',
      age_group: 'general',
      dimension: q.style,
      question_text: q.question,
      question_format: 'likert',
      options: null,
      points: q.points ?? 1,
      display_order: order++,
      is_active: true
    });
  });

  // ── 3. Dual-Process Decision (100 q) ──
  dualProcessQuestions.forEach((q: any) => {
    rows.push({
      external_id: `dual-process-general-${q.id}`,
      assessment_type: 'decision',
      framework: 'dual-process',
      age_group: 'general',
      dimension: q.style,
      question_text: q.question,
      question_format: 'likert',
      options: null,
      points: q.points ?? 1,
      display_order: order++,
      is_active: true
    });
  });

  // ── 4. VARK Multiple-Choice Learning (15 q) ──
  const varkLearning = [
    { id: 'ls1', question: 'When learning something new, I prefer to:', options: [{ text: 'See demonstrations and visual examples', style: 'Visual' }, { text: 'Listen to explanations and discussions', style: 'Auditory' }, { text: 'Try it hands-on and practice', style: 'Kinesthetic' }, { text: 'Read about it and take notes', style: 'Reading/Writing' }] },
    { id: 'ls2', question: 'I remember information best when:', options: [{ text: 'I can picture it in my mind', style: 'Visual' }, { text: 'I hear it repeated or discussed', style: 'Auditory' }, { text: 'I write it down or create summaries', style: 'Reading/Writing' }, { text: 'I physically engage with the material', style: 'Kinesthetic' }] },
    { id: 'ls3', question: 'During group work, I tend to:', options: [{ text: 'Create diagrams or visual organizers', style: 'Visual' }, { text: 'Lead discussions and explain ideas verbally', style: 'Auditory' }, { text: 'Build models or demonstrate concepts', style: 'Kinesthetic' }, { text: 'Document findings and write reports', style: 'Reading/Writing' }] },
    { id: 'ls4', question: 'When studying for exams, I:', options: [{ text: 'Review charts, graphs, and highlighted notes', style: 'Visual' }, { text: 'Talk through the material with others', style: 'Auditory' }, { text: 'Use flashcards and practice problems', style: 'Kinesthetic' }, { text: 'Rewrite notes and create outlines', style: 'Reading/Writing' }] },
    { id: 'ls5', question: 'I find it easier to understand:', options: [{ text: 'Maps, diagrams, and infographics', style: 'Visual' }, { text: 'Podcasts, lectures, and audio recordings', style: 'Auditory' }, { text: 'Simulations, experiments, and activities', style: 'Kinesthetic' }, { text: 'Articles, textbooks, and written instructions', style: 'Reading/Writing' }] },
    { id: 'ls6', question: 'My ideal classroom includes:', options: [{ text: 'Lots of visual aids and colorful materials', style: 'Visual' }, { text: 'Group discussions and presentations', style: 'Auditory' }, { text: 'Lab work and hands-on projects', style: 'Kinesthetic' }, { text: 'Reading assignments and essay writing', style: 'Reading/Writing' }] },
    { id: 'ls7', question: 'When giving directions, I prefer to:', options: [{ text: 'Draw a map or show the route', style: 'Visual' }, { text: 'Explain verbally step by step', style: 'Auditory' }, { text: 'Walk through it physically', style: 'Kinesthetic' }, { text: 'Write down the directions', style: 'Reading/Writing' }] },
    { id: 'ls8', question: 'I concentrate best when:', options: [{ text: 'The environment is visually organized', style: 'Visual' }, { text: 'There is background music or sound', style: 'Auditory' }, { text: 'I can move around or fidget', style: 'Kinesthetic' }, { text: 'I have written materials to reference', style: 'Reading/Writing' }] },
    { id: 'ls9', question: 'To solve a problem, I usually:', options: [{ text: 'Visualize different solutions', style: 'Visual' }, { text: 'Talk it through with someone', style: 'Auditory' }, { text: 'Try different approaches practically', style: 'Kinesthetic' }, { text: 'Research and read about solutions', style: 'Reading/Writing' }] },
    { id: 'ls10', question: 'I express my understanding by:', options: [{ text: 'Creating presentations or posters', style: 'Visual' }, { text: 'Giving oral explanations', style: 'Auditory' }, { text: 'Demonstrating or performing', style: 'Kinesthetic' }, { text: 'Writing detailed responses', style: 'Reading/Writing' }] },
    { id: 'ls11', question: 'When assembling furniture, I:', options: [{ text: 'Follow the picture diagrams', style: 'Visual' }, { text: 'Ask for verbal guidance', style: 'Auditory' }, { text: 'Jump in and figure it out by doing', style: 'Kinesthetic' }, { text: 'Read the written instructions carefully', style: 'Reading/Writing' }] },
    { id: 'ls12', question: 'My notes typically include:', options: [{ text: 'Drawings, colors, and symbols', style: 'Visual' }, { text: 'Key phrases from discussions', style: 'Auditory' }, { text: 'Brief reminders of activities done', style: 'Kinesthetic' }, { text: 'Detailed written explanations', style: 'Reading/Writing' }] },
    { id: 'ls13', question: 'I learn new technology by:', options: [{ text: 'Watching tutorial videos', style: 'Visual' }, { text: 'Having someone explain it to me', style: 'Auditory' }, { text: 'Exploring and clicking around', style: 'Kinesthetic' }, { text: 'Reading the manual or help guide', style: 'Reading/Writing' }] },
    { id: 'ls14', question: 'In free time, I enjoy:', options: [{ text: 'Watching videos or browsing images', style: 'Visual' }, { text: 'Listening to music or podcasts', style: 'Auditory' }, { text: 'Playing sports or crafting', style: 'Kinesthetic' }, { text: 'Reading books or articles', style: 'Reading/Writing' }] },
    { id: 'ls15', question: 'When recalling memories, I remember:', options: [{ text: 'What I saw - visual details', style: 'Visual' }, { text: 'What was said - conversations', style: 'Auditory' }, { text: 'What I did - actions and feelings', style: 'Kinesthetic' }, { text: 'What I wrote or read about it', style: 'Reading/Writing' }] }
  ];

  varkLearning.forEach((q) => {
    // Primary style from first option
    const primaryStyle = q.options[0].style;
    rows.push({
      external_id: `vark-${q.id}`,
      assessment_type: 'learning',
      framework: 'vark',
      age_group: 'general',
      dimension: 'Multi-Style',
      question_text: q.question,
      question_format: 'multiple-choice',
      options: q.options,
      points: 1,
      display_order: order++,
      is_active: true
    });
  });

  // ── 5. Sternberg Thinking Multiple-Choice (15 q) ──
  const sternbergMC = [
    { id: 'ts1', question: 'When facing a complex problem, I tend to:', options: [{ text: 'Break it into smaller, logical steps', style: 'Analytical' }, { text: 'Look at the big picture and connections', style: 'Holistic' }, { text: 'Brainstorm multiple creative solutions', style: 'Creative' }, { text: 'Apply proven methods that worked before', style: 'Practical' }] },
    { id: 'ts2', question: 'I approach new challenges by:', options: [{ text: 'Researching and analyzing data', style: 'Analytical' }, { text: 'Considering the broader context', style: 'Holistic' }, { text: 'Exploring innovative approaches', style: 'Creative' }, { text: 'Using reliable, tested strategies', style: 'Practical' }] },
    { id: 'ts3', question: 'When working on projects, I prefer to:', options: [{ text: 'Follow a systematic plan with clear steps', style: 'Analytical' }, { text: 'Understand how everything fits together', style: 'Holistic' }, { text: 'Experiment with original ideas', style: 'Creative' }, { text: 'Focus on what will actually work', style: 'Practical' }] },
    { id: 'ts4', question: 'My thinking process is best described as:', options: [{ text: 'Linear and sequential', style: 'Analytical' }, { text: 'Integrative and interconnected', style: 'Holistic' }, { text: 'Abstract and imaginative', style: 'Creative' }, { text: 'Concrete and results-oriented', style: 'Practical' }] },
    { id: 'ts5', question: 'I feel most confident when:', options: [{ text: 'I have facts and evidence to support my thinking', style: 'Analytical' }, { text: 'I understand the complete system', style: 'Holistic' }, { text: 'I can think outside the box', style: 'Creative' }, { text: 'I can see tangible results', style: 'Practical' }] },
    { id: 'ts6', question: 'When learning new concepts, I:', options: [{ text: 'Examine each component in detail', style: 'Analytical' }, { text: 'Look for patterns and relationships', style: 'Holistic' }, { text: 'Make unique connections and analogies', style: 'Creative' }, { text: 'Think about real-world applications', style: 'Practical' }] },
    { id: 'ts7', question: 'My ideal work environment encourages:', options: [{ text: 'Precision and accuracy', style: 'Analytical' }, { text: 'Collaboration and synthesis', style: 'Holistic' }, { text: 'Innovation and experimentation', style: 'Creative' }, { text: 'Efficiency and productivity', style: 'Practical' }] },
    { id: 'ts8', question: 'When making plans, I:', options: [{ text: 'Create detailed, structured outlines', style: 'Analytical' }, { text: 'Consider all stakeholders and impacts', style: 'Holistic' }, { text: 'Design flexible, adaptable approaches', style: 'Creative' }, { text: 'Focus on achievable, concrete goals', style: 'Practical' }] },
    { id: 'ts9', question: 'I am most interested in:', options: [{ text: 'Understanding the underlying principles', style: 'Analytical' }, { text: 'Seeing the interconnected whole', style: 'Holistic' }, { text: 'Discovering new possibilities', style: 'Creative' }, { text: 'Implementing effective solutions', style: 'Practical' }] },
    { id: 'ts10', question: 'When evaluating ideas, I prioritize:', options: [{ text: 'Logical consistency and rigor', style: 'Analytical' }, { text: 'Overall coherence and balance', style: 'Holistic' }, { text: 'Originality and novelty', style: 'Creative' }, { text: 'Feasibility and usefulness', style: 'Practical' }] },
    { id: 'ts11', question: 'My strengths include:', options: [{ text: 'Critical thinking and problem-solving', style: 'Analytical' }, { text: 'Systems thinking and synthesis', style: 'Holistic' }, { text: 'Imagination and innovation', style: 'Creative' }, { text: 'Common sense and pragmatism', style: 'Practical' }] },
    { id: 'ts12', question: 'I communicate ideas by:', options: [{ text: 'Using data and logical arguments', style: 'Analytical' }, { text: 'Explaining relationships and context', style: 'Holistic' }, { text: 'Using metaphors and stories', style: 'Creative' }, { text: 'Providing clear, actionable points', style: 'Practical' }] },
    { id: 'ts13', question: 'When faced with uncertainty, I:', options: [{ text: 'Gather more information to analyze', style: 'Analytical' }, { text: 'Consider multiple perspectives', style: 'Holistic' }, { text: 'Trust my intuition and insights', style: 'Creative' }, { text: 'Take practical steps forward', style: 'Practical' }] },
    { id: 'ts14', question: 'Success for me means:', options: [{ text: 'Solving problems correctly', style: 'Analytical' }, { text: 'Creating harmony and integration', style: 'Holistic' }, { text: 'Generating original contributions', style: 'Creative' }, { text: 'Achieving measurable outcomes', style: 'Practical' }] },
    { id: 'ts15', question: 'I prefer tasks that are:', options: [{ text: 'Structured and well-defined', style: 'Analytical' }, { text: 'Collaborative and multifaceted', style: 'Holistic' }, { text: 'Open-ended and exploratory', style: 'Creative' }, { text: 'Goal-oriented and hands-on', style: 'Practical' }] }
  ];

  sternbergMC.forEach((q) => {
    rows.push({
      external_id: `sternberg-mc-${q.id}`,
      assessment_type: 'thinking',
      framework: 'sternberg-mc',
      age_group: 'general',
      dimension: 'Multi-Style',
      question_text: q.question,
      question_format: 'multiple-choice',
      options: q.options,
      points: 1,
      display_order: order++,
      is_active: true
    });
  });

  // ── 6. Decision Style Multiple-Choice (15 q) ──
  const decisionMC = [
    { id: 'ds1', question: 'When making important decisions, I usually:', options: [{ text: 'Analyze all available data carefully', style: 'Data-Driven' }, { text: 'Trust my gut feeling', style: 'Intuitive' }, { text: 'Consult with others and seek input', style: 'Collaborative' }, { text: 'Make quick choices and adjust as needed', style: 'Spontaneous' }] },
    { id: 'ds2', question: 'My decision-making process involves:', options: [{ text: 'Creating pros/cons lists and comparisons', style: 'Data-Driven' }, { text: 'Reflecting on what feels right', style: 'Intuitive' }, { text: 'Discussing options with trusted people', style: 'Collaborative' }, { text: 'Going with my first instinct', style: 'Spontaneous' }] },
    { id: 'ds3', question: 'I feel confident in my decisions when:', options: [{ text: 'They are backed by solid evidence', style: 'Data-Driven' }, { text: 'They align with my inner sense', style: 'Intuitive' }, { text: 'Others agree and support them', style: 'Collaborative' }, { text: 'I can adapt them if things change', style: 'Spontaneous' }] },
    { id: 'ds4', question: 'When time is limited, I:', options: [{ text: 'Focus on the most critical data points', style: 'Data-Driven' }, { text: 'Rely on my experience and instincts', style: 'Intuitive' }, { text: 'Get quick input from key people', style: 'Collaborative' }, { text: 'Make the call and move forward', style: 'Spontaneous' }] },
    { id: 'ds5', question: 'Before committing to a choice, I need to:', options: [{ text: 'Review all facts and figures', style: 'Data-Driven' }, { text: 'Feel at peace with it internally', style: 'Intuitive' }, { text: 'Ensure team alignment', style: 'Collaborative' }, { text: 'Just feel ready to act', style: 'Spontaneous' }] },
    { id: 'ds6', question: 'I reconsider decisions when:', options: [{ text: 'New data emerges', style: 'Data-Driven' }, { text: "Something doesn't feel right", style: 'Intuitive' }, { text: 'Others raise valid concerns', style: 'Collaborative' }, { text: 'Circumstances change', style: 'Spontaneous' }] },
    { id: 'ds7', question: 'My biggest decision-making strength is:', options: [{ text: 'Thorough analysis and objectivity', style: 'Data-Driven' }, { text: 'Strong intuition and insight', style: 'Intuitive' }, { text: 'Building consensus and buy-in', style: 'Collaborative' }, { text: 'Flexibility and adaptability', style: 'Spontaneous' }] },
    { id: 'ds8', question: 'I would describe my decision style as:', options: [{ text: 'Methodical and evidence-based', style: 'Data-Driven' }, { text: 'Instinctive and feeling-driven', style: 'Intuitive' }, { text: 'Inclusive and consultative', style: 'Collaborative' }, { text: 'Quick and opportunistic', style: 'Spontaneous' }] },
    { id: 'ds9', question: 'When a decision goes wrong, I:', options: [{ text: 'Review the data to find what was missed', style: 'Data-Driven' }, { text: 'Reflect on what my intuition was saying', style: 'Intuitive' }, { text: 'Discuss with others what could be improved', style: 'Collaborative' }, { text: 'Adjust quickly and try again', style: 'Spontaneous' }] },
    { id: 'ds10', question: 'For major life decisions, I:', options: [{ text: 'Create a detailed comparison matrix', style: 'Data-Driven' }, { text: 'Meditate or sleep on it', style: 'Intuitive' }, { text: 'Seek advice from mentors or friends', style: 'Collaborative' }, { text: 'Go with what excites me most', style: 'Spontaneous' }] },
    { id: 'ds11', question: 'I trust decisions most when they are:', options: [{ text: 'Supported by research and facts', style: 'Data-Driven' }, { text: 'Aligned with my values', style: 'Intuitive' }, { text: 'Made with others in mind', style: 'Collaborative' }, { text: 'Made in the moment', style: 'Spontaneous' }] },
    { id: 'ds12', question: 'My ideal decision-making process takes:', options: [{ text: 'As long as needed to gather all data', style: 'Data-Driven' }, { text: 'Time for quiet reflection', style: 'Intuitive' }, { text: 'Time for group discussion', style: 'Collaborative' }, { text: 'As little time as possible', style: 'Spontaneous' }] },
    { id: 'ds13', question: 'When I am uncertain, I:', options: [{ text: 'Seek more information', style: 'Data-Driven' }, { text: 'Wait for clarity from within', style: 'Intuitive' }, { text: 'Ask others for their view', style: 'Collaborative' }, { text: 'Make a decision and adapt', style: 'Spontaneous' }] },
    { id: 'ds14', question: 'I am best at decisions that involve:', options: [{ text: 'Quantitative analysis', style: 'Data-Driven' }, { text: 'Personal values and meaning', style: 'Intuitive' }, { text: 'People and relationships', style: 'Collaborative' }, { text: 'Rapid response to opportunity', style: 'Spontaneous' }] },
    { id: 'ds15', question: 'Others would describe my decision-making as:', options: [{ text: 'Rational and thorough', style: 'Data-Driven' }, { text: 'Thoughtful and principled', style: 'Intuitive' }, { text: 'Democratic and inclusive', style: 'Collaborative' }, { text: 'Decisive and action-oriented', style: 'Spontaneous' }] }
  ];

  decisionMC.forEach((q) => {
    rows.push({
      external_id: `decision-mc-${q.id}`,
      assessment_type: 'decision',
      framework: 'vark-decision',
      age_group: 'general',
      dimension: 'Multi-Style',
      question_text: q.question,
      question_format: 'multiple-choice',
      options: q.options,
      points: 1,
      display_order: order++,
      is_active: true
    });
  });

  return rows;
}

// ─────────────────────────────────────────────
// POST /seed-questions — run the full seed
// ─────────────────────────────────────────────
app.post('/seed-questions', async (c) => {
  if (!verifyAdmin(c.req.raw)) {
    return c.json({ error: 'Unauthorized. Admin token required.' }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const mode: 'upsert' | 'replace' | 'skip_existing' = body.mode ?? 'upsert';

  const supabase = getServiceClient();
  const rows = buildRows();

  try {
    // ── Optionally clear existing data
    if (mode === 'replace') {
      const { error: delError } = await supabase
        .from('assessment_questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
      if (delError) {
        return c.json({ error: `Failed to clear table: ${delError.message}` }, 500);
      }
    }

    // ── Batch insert (100 at a time)
    const BATCH = 100;
    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);

      if (mode === 'skip_existing') {
        // Insert only rows whose external_id doesn't already exist
        const extIds = batch.map((r) => r.external_id);
        const { data: existing } = await supabase
          .from('assessment_questions')
          .select('external_id')
          .in('external_id', extIds);
        const existingIds = new Set((existing ?? []).map((r: any) => r.external_id));
        const toInsert = batch.filter((r) => !existingIds.has(r.external_id));
        skipped += batch.length - toInsert.length;
        if (toInsert.length === 0) continue;

        const { error } = await supabase.from('assessment_questions').insert(toInsert);
        if (error) errors.push(error.message);
        else inserted += toInsert.length;
      } else {
        // Upsert on external_id
        const { error } = await supabase
          .from('assessment_questions')
          .upsert(batch, { onConflict: 'external_id', ignoreDuplicates: false });
        if (error) errors.push(error.message);
        else inserted += batch.length;
      }
    }

    // ── Summary
    const summary = {
      total_rows: rows.length,
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      breakdown: {
        kolb_general: rows.filter((r) => r.framework === 'kolb').length,
        sternberg_general: rows.filter((r) => r.framework === 'sternberg').length,
        dual_process_general: rows.filter((r) => r.framework === 'dual-process').length,
        vark_mc: rows.filter((r) => r.framework === 'vark').length,
        sternberg_mc: rows.filter((r) => r.framework === 'sternberg-mc').length,
        decision_mc: rows.filter((r) => r.framework === 'vark-decision').length
      }
    };

    return c.json({ success: errors.length === 0, mode, ...summary });
  } catch (err: any) {
    return c.json({ error: err?.message ?? 'Unknown error during seed' }, 500);
  }
});

// ─────────────────────────────────────────────
// GET /seed-questions/status — count rows per group
// ─────────────────────────────────────────────
app.get('/seed-questions/status', async (c) => {
  if (!verifyAdmin(c.req.raw)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('assessment_questions')
    .select('assessment_type, framework, age_group, question_format')
    .eq('is_active', true);

  if (error) {
    return c.json({ error: error.message, exists: false }, 200);
  }

  // Group counts
  const groups: Record<string, number> = {};
  (data ?? []).forEach((row: any) => {
    const key = `${row.assessment_type}|${row.framework}|${row.age_group}|${row.question_format}`;
    groups[key] = (groups[key] ?? 0) + 1;
  });

  return c.json({
    exists: true,
    total: data?.length ?? 0,
    groups
  });
});

export default app;
