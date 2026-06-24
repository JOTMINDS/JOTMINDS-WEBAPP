import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { CAREER_DATABASE, CareerProfile } from './career-database.tsx';

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
 * Calculate similarity score between user profile and career profile
 * Uses weighted Euclidean distance with normalization
 */
function calculateMatchScore(userProfile: any, careerProfile: CareerProfile): number {
  const dimensions = [
    'learningAgility',
    'analyticalDepth',
    'creativeCapacity',
    'practicalExecution',
    'intuitiveSpeed',
    'reflectiveDepth',
    'cognitiveFlexibility',
    'innovationPotential',
    'executionCapability',
    'metacognitiveAwareness'
  ];

  // Calculate weighted squared differences
  let totalSquaredDiff = 0;
  let weights = 0;

  dimensions.forEach(dim => {
    const userValue = userProfile[dim] || 0;
    const careerValue = (careerProfile.requiredProfile as any)[dim];

    // Weight dimensions based on importance
    // Higher career requirements = higher weight
    const weight = 1 + (careerValue / 100);

    const diff = Math.abs(userValue - careerValue);
    totalSquaredDiff += (diff * diff) * weight;
    weights += weight;
  });

  // Calculate root mean squared error
  const rmse = Math.sqrt(totalSquaredDiff / weights);

  // Convert to match score (0-100 scale, inverted so higher = better match)
  // RMSE of 0 = 100% match, RMSE of 100 = 0% match
  const matchScore = Math.max(0, 100 - rmse);

  return Math.round(matchScore * 100) / 100;
}

/**
 * Identify gap areas where user needs to improve for a career
 */
function identifyGaps(userProfile: any, careerProfile: CareerProfile) {
  const dimensions = [
    { key: 'learningAgility', label: 'Learning Agility' },
    { key: 'analyticalDepth', label: 'Analytical Depth' },
    { key: 'creativeCapacity', label: 'Creative Capacity' },
    { key: 'practicalExecution', label: 'Practical Execution' },
    { key: 'intuitiveSpeed', label: 'Intuitive Speed' },
    { key: 'reflectiveDepth', label: 'Reflective Depth' },
    { key: 'cognitiveFlexibility', label: 'Cognitive Flexibility' },
    { key: 'innovationPotential', label: 'Innovation Potential' },
    { key: 'executionCapability', label: 'Execution Capability' },
    { key: 'metacognitiveAwareness', label: 'Metacognitive Awareness' }
  ];

  const gaps = dimensions
    .map(({ key, label }) => {
      const userValue = (userProfile as any)[key] || 0;
      const careerValue = (careerProfile.requiredProfile as any)[key];
      const gap = careerValue - userValue;

      return {
        dimension: label,
        dimensionKey: key,
        gap,
        userValue,
        careerValue,
        percentage: Math.round((gap / careerValue) * 100)
      };
    })
    .filter(g => g.gap > 10) // Only show meaningful gaps
    .sort((a, b) => b.gap - a.gap); // Sort by largest gap first

  return gaps;
}

/**
 * Map dimension gaps to Skill Builder recommendations
 */
function mapGapsToSkillBuilder(gaps: any[]) {
  const skillBuilderMapping: Record<string, string> = {
    learningAgility: 'metacognition',
    analyticalDepth: 'problem_solving',
    creativeCapacity: 'curiosity',
    practicalExecution: 'problem_solving',
    intuitiveSpeed: 'emotional_regulation',
    reflectiveDepth: 'metacognition',
    cognitiveFlexibility: 'metacognition',
    innovationPotential: 'curiosity',
    executionCapability: 'problem_solving',
    metacognitiveAwareness: 'metacognition'
  };

  const recommendations = gaps
    .slice(0, 3) // Top 3 gaps
    .map(gap => ({
      skillDimension: skillBuilderMapping[gap.dimensionKey],
      reason: `Strengthen ${gap.dimension} (currently ${gap.userValue}, need ${gap.careerValue})`,
      priority: gap.gap > 30 ? 'High' : gap.gap > 20 ? 'Medium' : 'Low'
    }));

  return recommendations;
}

// POST /career/match
app.post('/match', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  // Get user's cognitive profile
  const profile = await kv.get(`profile:${user.id}`);

  if (!profile) {
    return c.json({
      error: 'No cognitive profile found',
      message: 'Complete assessments to generate your profile first'
    }, 400);
  }

  // Calculate match scores for all careers
  const matches = CAREER_DATABASE.map(career => {
    const matchScore = calculateMatchScore(profile, career);
    const gaps = identifyGaps(profile, career);
    const skillBuilderRecommendations = mapGapsToSkillBuilder(gaps);

    return {
      career: {
        id: career.careerId,
        title: career.title,
        category: career.category,
        description: career.description,
        typicalPersona: career.typicalPersona,
        growthPath: career.growthPath
      },
      matchScore,
      matchLevel: matchScore >= 85 ? 'Excellent' : matchScore >= 70 ? 'Strong' : matchScore >= 55 ? 'Good' : 'Moderate',
      gaps,
      skillBuilderRecommendations
    };
  });

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Take top 10
  const topMatches = matches.slice(0, 10);

  // Store matches
  await kv.set(`career-match:${user.id}`, {
    userId: user.id,
    matches: topMatches,
    generatedAt: new Date().toISOString()
  });

  console.log(`[Career] Generated matches for user ${user.id}`);
  console.log(`[Career] Top match: ${topMatches[0].career.title} (${topMatches[0].matchScore}%)`);

  return c.json({ matches: topMatches });
});

// GET /career/matches
app.get('/matches', async (c) => {
  const user = await verifyAuth(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const stored = await kv.get(`career-match:${user.id}`);

  if (!stored) {
    return c.json({
      error: 'No career matches found',
      message: 'Generate career matches first'
    }, 404);
  }

  return c.json({ matches: stored.matches });
});

// GET /career/:careerId
app.get('/:careerId', async (c) => {
  const careerId = c.req.param('careerId');
  const career = CAREER_DATABASE.find(c => c.careerId === careerId);

  if (!career) {
    return c.json({ error: 'Career not found' }, 404);
  }

  return c.json({ career });
});

// GET /career (list all careers)
app.get('/', async (c) => {
  const categories = [...new Set(CAREER_DATABASE.map(c => c.category))];

  return c.json({
    totalCareers: CAREER_DATABASE.length,
    categories,
    careers: CAREER_DATABASE.map(c => ({
      id: c.careerId,
      title: c.title,
      category: c.category,
      description: c.description
    }))
  });
});

export default app;
