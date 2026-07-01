import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Helper to verify authentication
async function verifyAuth(request: Request) {
  const adminToken = request.headers.get('X-Admin-Token');
  if (adminToken && adminToken.startsWith('admin-token-')) {
    return { id: 'admin-001', email: 'admin@jotminds.com' };
  }
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');

  const { createClient } = await import('npm:@supabase/supabase-js');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Generate Unified Cognitive Profile
 * Aggregates Kolb, Sternberg, and Dual-Process assessments into a single profile
 */
async function generateUnifiedProfile(userId: string) {
  // Fetch all assessment results
  const kolbResult = await kv.get(`result:${userId}:kolb`);
  const sternbergResult = await kv.get(`result:${userId}:sternberg`);
  const dualProcessResult = await kv.get(`result:${userId}:dual-process`);

  // Check if user has completed all three assessments
  const completedAssessments = [
    kolbResult ? 'kolb' : null,
    sternbergResult ? 'sternberg' : null,
    dualProcessResult ? 'dual-process' : null,
  ].filter(Boolean) as string[];

  if (completedAssessments.length === 0) {
    // Fallback: check if they have a unified thinking assessment (Adult/SHS/JHS)
    const adultResult = await kv.get(`result:${userId}:adult-thinking`);
    const shsResult = await kv.get(`result:${userId}:shs-thinking`);
    const jhsResult = await kv.get(`result:${userId}:jhs-thinking`);

    const fallbackResult = adultResult || shsResult || jhsResult;
    
    if (fallbackResult) {
      const type = fallbackResult.assessmentType || 'thinking';
      const scores = fallbackResult.results?.percentages || fallbackResult.results?.scores || {};
      
      return {
        // Core Dimensions
        learningAgility: scores.reflective || 50, 
        analyticalDepth: scores.analytical || 0,
        creativeCapacity: scores.creative || 0,
        practicalExecution: scores.practical || 0,
        intuitiveSpeed: scores.creative || 0,
        reflectiveDepth: scores.reflective || 0,
        
        // Derived Meta-Dimensions
        cognitiveFlexibility: 50, 
        innovationPotential: Math.round(((scores.creative || 0) + (scores.analytical || 0)) / 2),
        executionCapability: Math.round(((scores.practical || 0) + (scores.analytical || 0)) / 2),
        metacognitiveAwareness: 50,

        // Summary Stats
        completedAssessments: [type],
        profileCompleteness: 100, 
        dominantStyle: fallbackResult.results?.dominantStyle || fallbackResult.results?.primaryStyle || 'Balanced',
        cognitiveArchetype: fallbackResult.results?.professionalProfile || fallbackResult.results?.personalityType || 'Balanced Learner',

        // Metadata
        generatedAt: new Date().toISOString(),
        sourceResults: {
          [type]: fallbackResult.id || null
        }
      };
    }

    return null; // No assessments completed at all
  }

  // Extract scores with safe defaults
  const kolbScores = kolbResult?.results?.percentages || {};
  const sternbergScores = sternbergResult?.results?.percentages || {};
  const dualProcessScores = dualProcessResult?.results?.percentages || {};

  // Calculate unified dimensions (normalized 0-100 scale)
  const profile = {
    // Core Dimensions
    learningAgility: calculateLearningAgility(kolbScores),
    analyticalDepth: sternbergScores.Analytical || 0,
    creativeCapacity: sternbergScores.Creative || 0,
    practicalExecution: sternbergScores.Practical || 0,
    intuitiveSpeed: dualProcessScores.system1 || 0,
    reflectiveDepth: dualProcessScores.system2 || 0,

    // Derived Meta-Dimensions
    cognitiveFlexibility: calculateCognitiveFlexibility(kolbScores),
    innovationPotential: calculateInnovationPotential(sternbergScores, dualProcessScores),
    executionCapability: calculateExecutionCapability(sternbergScores, kolbScores),
    metacognitiveAwareness: calculateMetacognitiveAwareness(
      kolbResult?.confidenceMetrics,
      sternbergResult?.confidenceMetrics,
      dualProcessResult?.confidenceMetrics
    ),

    // Summary Stats
    completedAssessments,
    profileCompleteness: (completedAssessments.length / 3) * 100,
    dominantStyle: identifyDominantStyle(kolbScores, sternbergScores, dualProcessScores),
    cognitiveArchetype: identifyCognitiveArchetype(kolbScores, sternbergScores, dualProcessScores),

    // Metadata
    generatedAt: new Date().toISOString(),
    sourceResults: {
      kolb: kolbResult?.id || null,
      sternberg: sternbergResult?.id || null,
      dualProcess: dualProcessResult?.id || null,
    }
  };

  return profile;
}

// Learning Agility = Balance across all Kolb styles (higher = more adaptable)
function calculateLearningAgility(kolbScores: Record<string, number>): number {
  const scores = Object.values(kolbScores);
  if (scores.length === 0) return 0;

  // Calculate standard deviation (lower = more balanced = higher agility)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Convert to 0-100 scale (lower stdDev = higher agility)
  const agility = Math.max(0, 100 - (stdDev * 2));
  return Math.round(agility);
}

// Cognitive Flexibility = Ability to shift between Kolb quadrants
function calculateCognitiveFlexibility(kolbScores: Record<string, number>): number {
  const scores = Object.values(kolbScores);
  if (scores.length < 2) return 0;

  // High flexibility = no single dominant style (all scores relatively close)
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const range = max - min;

  // Lower range = higher flexibility
  const flexibility = Math.max(0, 100 - range);
  return Math.round(flexibility);
}

// Innovation Potential = Creative thinking + Intuitive decision making
function calculateInnovationPotential(
  sternbergScores: Record<string, number>,
  dualProcessScores: Record<string, number>
): number {
  const creative = sternbergScores.Creative || 0;
  const intuitive = dualProcessScores.system1 || 0;

  // Weighted average (creativity is stronger signal)
  const innovation = (creative * 0.7) + (intuitive * 0.3);
  return Math.round(innovation);
}

// Execution Capability = Practical thinking + Active experimentation
function calculateExecutionCapability(
  sternbergScores: Record<string, number>,
  kolbScores: Record<string, number>
): number {
  const practical = sternbergScores.Practical || 0;
  const accommodating = kolbScores.Accommodating || 0; // Doing + Feeling
  const converging = kolbScores.Converging || 0; // Doing + Thinking

  const activeExperimentation = Math.max(accommodating, converging);
  const execution = (practical * 0.6) + (activeExperimentation * 0.4);
  return Math.round(execution);
}

// Metacognitive Awareness = Average confidence across all assessments
function calculateMetacognitiveAwareness(...confidenceMetrics: any[]): number {
  const validMetrics = confidenceMetrics.filter(m => m && m.average);
  if (validMetrics.length === 0) return 50; // Default neutral

  const avgConfidence = validMetrics.reduce((sum, m) => sum + m.average, 0) / validMetrics.length;

  // Convert 1-5 scale to 0-100
  const awareness = ((avgConfidence - 1) / 4) * 100;
  return Math.round(awareness);
}

// Identify dominant cognitive style
function identifyDominantStyle(
  kolbScores: Record<string, number>,
  sternbergScores: Record<string, number>,
  dualProcessScores: Record<string, number>
): string {
  const allScores = {
    ...kolbScores,
    ...sternbergScores,
    ...dualProcessScores
  };

  const dominant = Object.entries(allScores).reduce((max, [key, value]) =>
    value > max.value ? { key, value } : max,
    { key: 'Balanced', value: 0 }
  );

  return dominant.key;
}

// Identify cognitive archetype based on pattern matching
function identifyCognitiveArchetype(
  kolbScores: Record<string, number>,
  sternbergScores: Record<string, number>,
  dualProcessScores: Record<string, number>
): string {
  const creative = sternbergScores.Creative || 0;
  const analytical = sternbergScores.Analytical || 0;
  const practical = sternbergScores.Practical || 0;
  const intuitive = dualProcessScores.system1 || 0;
  const reflective = dualProcessScores.system2 || 0;
  const diverging = kolbScores.Diverging || 0;

  // Pattern matching for archetypes
  if (creative > 35 && diverging > 30 && intuitive > 50) {
    return 'Innovative Explorer';
  }
  if (analytical > 35 && reflective > 50) {
    return 'Systematic Analyzer';
  }
  if (practical > 35 && (kolbScores.Converging || 0) > 30) {
    return 'Pragmatic Builder';
  }
  if (creative > 30 && analytical > 30 && practical > 30) {
    return 'Versatile Thinker';
  }
  if (intuitive > 60 && practical > 30) {
    return 'Action-Oriented Intuitive';
  }
  if (reflective > 60 && analytical > 30) {
    return 'Deep Deliberator';
  }
  if (diverging > 35 && creative > 30) {
    return 'Creative Synthesizer';
  }
  if ((kolbScores.Assimilating || 0) > 35 && analytical > 30) {
    return 'Conceptual Theorist';
  }

  return 'Balanced Generalist';
}

// POST /cognitive-profile/generate
app.post('/generate', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const profile = await generateUnifiedProfile(user.id);

  if (!profile) {
    return c.json({
      error: 'No assessments completed',
      message: 'Complete at least one assessment to generate your cognitive profile'
    }, 400);
  }

  // Save current profile to KV store
  await kv.set(`profile:${user.id}`, profile);

  // Save profile snapshot to history for tracking evolution
  const timestamp = new Date().toISOString();
  const historyKey = `profile-history:${user.id}:${timestamp}`;
  await kv.set(historyKey, {
    ...profile,
    snapshotAt: timestamp
  });

  console.log(`[Profile] Generated unified profile for user ${user.id}`);
  console.log(`[Profile] Archetype: ${profile.cognitiveArchetype}`);
  console.log(`[Profile] Saved snapshot to history: ${historyKey}`);

  return c.json({ profile });
});

// GET /cognitive-profile
app.get('/', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  // Try to get existing profile
  let profile = await kv.get(`profile:${user.id}`);

  // If no profile exists or it's stale, regenerate
  if (!profile) {
    profile = await generateUnifiedProfile(user.id);
    if (profile) {
      await kv.set(`profile:${user.id}`, profile);
    }
  }

  if (!profile) {
    return c.json({
      error: 'No profile available',
      message: 'Complete at least one assessment to generate your cognitive profile'
    }, 404);
  }

  return c.json({ profile });
});

// DELETE /cognitive-profile (force regeneration)
app.delete('/', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  await kv.del(`profile:${user.id}`);

  return c.json({ success: true, message: 'Profile deleted. Will regenerate on next request.' });
});

// POST /cognitive-profile/share - Create a shareable link
app.post('/share', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  // Get user's current profile, generating it on the fly if it doesn't exist yet
  // (e.g. sharing straight after completing the thinking-profile assessment).
  let profile = await kv.get(`profile:${user.id}`);
  if (!profile) {
    profile = await generateUnifiedProfile(user.id);
    if (profile) {
      await kv.set(`profile:${user.id}`, profile);
    }
  }
  if (!profile) {
    return c.json({ error: 'Complete at least one assessment before sharing your profile.' }, 404);
  }

  // Generate unique share token
  const shareToken = crypto.randomUUID();

  // Store shared profile data (without sensitive user info)
  const sharedProfile = {
    cognitiveArchetype: profile.cognitiveArchetype,
    dominantStyle: profile.dominantStyle,
    learningAgility: profile.learningAgility,
    analyticalDepth: profile.analyticalDepth,
    creativeCapacity: profile.creativeCapacity,
    practicalExecution: profile.practicalExecution,
    intuitiveSpeed: profile.intuitiveSpeed,
    reflectiveDepth: profile.reflectiveDepth,
    cognitiveFlexibility: profile.cognitiveFlexibility,
    innovationPotential: profile.innovationPotential,
    executionCapability: profile.executionCapability,
    metacognitiveAwareness: profile.metacognitiveAwareness,
    profileCompleteness: profile.profileCompleteness,
    completedAssessments: profile.completedAssessments,
    generatedAt: profile.generatedAt,
    shareToken,
    sharedBy: user.id,
    sharedAt: new Date().toISOString(),
  };

  await kv.set(`shared-profile:${shareToken}`, sharedProfile);

  console.log(`[Profile] Created share link for user ${user.id}: ${shareToken}`);

  return c.json({ shareToken });
});

// GET /cognitive-profile/shared/:token - Get a shared profile
app.get('/shared/:token', async (c) => {
  const token = c.req.param('token');

  const sharedProfile = await kv.get(`shared-profile:${token}`);

  if (!sharedProfile) {
    return c.json({ error: 'Shared profile not found or expired' }, 404);
  }

  return c.json({ profile: sharedProfile });
});

// GET /cognitive-profile/history - Get all profile snapshots
app.get('/history', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  // Get all profile history snapshots
  const historySnapshots = await kv.getByPrefix(`profile-history:${user.id}:`);

  if (!historySnapshots || historySnapshots.length === 0) {
    return c.json({ history: [], message: 'No profile history yet. Complete assessments and regenerate your profile to start tracking.' });
  }

  // Sort by timestamp (newest first)
  const sortedHistory = historySnapshots.sort((a: any, b: any) => {
    const timeA = new Date(a.snapshotAt || a.generatedAt).getTime();
    const timeB = new Date(b.snapshotAt || b.generatedAt).getTime();
    return timeB - timeA;
  });

  return c.json({ history: sortedHistory, count: sortedHistory.length });
});

// GET /cognitive-profile/evolution - Get profile evolution metrics
app.get('/evolution', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  // Get all profile history snapshots
  const historySnapshots = await kv.getByPrefix(`profile-history:${user.id}:`);

  if (!historySnapshots || historySnapshots.length < 2) {
    return c.json({
      evolution: null,
      message: 'Need at least 2 profile snapshots to track evolution. Complete assessments again to see your progress!'
    });
  }

  // Sort by timestamp (oldest first for comparison)
  const sortedHistory = historySnapshots.sort((a: any, b: any) => {
    const timeA = new Date(a.snapshotAt || a.generatedAt).getTime();
    const timeB = new Date(b.snapshotAt || b.generatedAt).getTime();
    return timeA - timeB;
  });

  const firstProfile = sortedHistory[0];
  const latestProfile = sortedHistory[sortedHistory.length - 1];

  // Calculate dimension changes
  const dimensionChanges = {
    learningAgility: (latestProfile.learningAgility || 0) - (firstProfile.learningAgility || 0),
    analyticalDepth: (latestProfile.analyticalDepth || 0) - (firstProfile.analyticalDepth || 0),
    creativeCapacity: (latestProfile.creativeCapacity || 0) - (firstProfile.creativeCapacity || 0),
    practicalExecution: (latestProfile.practicalExecution || 0) - (firstProfile.practicalExecution || 0),
    intuitiveSpeed: (latestProfile.intuitiveSpeed || 0) - (firstProfile.intuitiveSpeed || 0),
    reflectiveDepth: (latestProfile.reflectiveDepth || 0) - (firstProfile.reflectiveDepth || 0),
    cognitiveFlexibility: (latestProfile.cognitiveFlexibility || 0) - (firstProfile.cognitiveFlexibility || 0),
    innovationPotential: (latestProfile.innovationPotential || 0) - (firstProfile.innovationPotential || 0),
    executionCapability: (latestProfile.executionCapability || 0) - (firstProfile.executionCapability || 0),
    metacognitiveAwareness: (latestProfile.metacognitiveAwareness || 0) - (firstProfile.metacognitiveAwareness || 0),
  };

  // Identify improvements and areas needing work
  const improvements = Object.entries(dimensionChanges)
    .filter(([_, change]) => change > 5)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([dimension, change]) => ({ dimension, change }));

  const declines = Object.entries(dimensionChanges)
    .filter(([_, change]) => change < -5)
    .sort((a, b) => (a[1] as number) - (b[1] as number))
    .map(([dimension, change]) => ({ dimension, change }));

  // Calculate overall growth percentage
  const totalChange = Object.values(dimensionChanges).reduce((sum, val) => sum + val, 0);
  const avgChange = totalChange / Object.keys(dimensionChanges).length;

  return c.json({
    evolution: {
      firstSnapshot: {
        date: firstProfile.snapshotAt || firstProfile.generatedAt,
        archetype: firstProfile.cognitiveArchetype
      },
      latestSnapshot: {
        date: latestProfile.snapshotAt || latestProfile.generatedAt,
        archetype: latestProfile.cognitiveArchetype
      },
      dimensionChanges,
      improvements,
      declines,
      overallGrowth: Math.round(avgChange * 10) / 10,
      snapshotCount: sortedHistory.length,
      timeSpan: {
        days: Math.floor(
          (new Date(latestProfile.snapshotAt || latestProfile.generatedAt).getTime() -
            new Date(firstProfile.snapshotAt || firstProfile.generatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      }
    }
  });
});

export default app;
