import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';
import { kolbQuestions, sternbergQuestions, dualProcessQuestions } from './full-question-bank.tsx';

// VERSION 2.1.1 - Fixed AutoPlan percentages calculation + naming mismatches + enhanced logging
const moduleLoadTime = new Date().toISOString();
console.log(`[AssessmentRoutes] v2.1.1.1 module loaded at ${moduleLoadTime} - AutoPlan fixes active`);

// Helper to generate skill plan UUID
function uuid() {
  return crypto.randomUUID();
}

const app = new Hono();

// Create Supabase client helper
const getSupabaseClient = (serviceRole = false) => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceRole ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! : Deno.env.get('SUPABASE_ANON_KEY')!
  );
};

// Helper to verify authentication
const verifyAuth = async (request: Request) => {
  // Check for admin token in custom header first
  const adminToken = request.headers.get('X-Admin-Token');
  
  if (adminToken && adminToken.startsWith('admin-token-')) {
    // Return admin user
    return {
      id: 'admin-001',
      email: 'admin@jotminds.com',
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    };
  }
  
  // Otherwise verify Supabase JWT
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseClient(true);
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return data.user;
  } catch (error) {
    console.log('[verifyAuth] Error verifying token:', error);
    return null;
  }
};

// ============= VERSIONED QUESTION SETS =============

// Initialize default question sets in KV store (run once)
const initializeQuestionSets = async () => {
  // Check if questions are already initialized
  const existingV1 = await kv.get('questions:kolb:v1');
  if (existingV1) {
    console.log('[Questions] Question sets already initialized');
    return;
  }

  console.log('[Questions] Initializing versioned question sets with full 300-question bank...');

  // Kolb Learning Styles v1 (100 Questions)
  await kv.set('questions:kolb:v1', {
    version: 'v1',
    framework: 'kolb',
    createdAt: '2024-12-01T00:00:00.000Z',
    description: 'Full Kolb Learning Styles Assessment - 100 Questions (25 per quadrant)',
    totalQuestions: 100,
    distribution: {
      Diverging: 25,
      Assimilating: 25,
      Converging: 25,
      Accommodating: 25
    },
    questions: kolbQuestions.map(q => ({
      id: `kolb-${q.id}`,
      question: q.question,
      options: [
        { text: 'Strongly Disagree', value: 1 },
        { text: 'Disagree', value: 2 },
        { text: 'Neutral', value: 3 },
        { text: 'Agree', value: 4 },
        { text: 'Strongly Agree', value: 5 }
      ],
      style: q.style,
      points: q.points
    }))
  });

  // Sternberg Thinking Styles v1 (100 Questions)
  await kv.set('questions:sternberg:v1', {
    version: 'v1',
    framework: 'sternberg',
    createdAt: '2024-12-01T00:00:00.000Z',
    description: 'Full Sternberg Thinking Styles Assessment - 100 Questions',
    totalQuestions: 100,
    distribution: {
      Analytical: 34,
      Creative: 33,
      Practical: 33
    },
    questions: sternbergQuestions.map(q => ({
      id: `sternberg-${q.id}`,
      question: q.question,
      options: [
        { text: 'Strongly Disagree', value: 1 },
        { text: 'Disagree', value: 2 },
        { text: 'Neutral', value: 3 },
        { text: 'Agree', value: 4 },
        { text: 'Strongly Agree', value: 5 }
      ],
      style: q.style,
      points: q.points
    }))
  });

  // Dual-Process Decision Making v1 (100 Questions)
  await kv.set('questions:dual-process:v1', {
    version: 'v1',
    framework: 'dual-process',
    createdAt: '2024-12-01T00:00:00.000Z',
    description: 'Full Dual-Process Decision Making Assessment - 100 Questions (50 per style)',
    totalQuestions: 100,
    distribution: {
      Intuitive: 50,
      Reflective: 50
    },
    questions: dualProcessQuestions.map(q => ({
      id: `dual-process-${q.id}`,
      question: q.question,
      options: [
        { text: 'Strongly Disagree', value: 1 },
        { text: 'Disagree', value: 2 },
        { text: 'Neutral', value: 3 },
        { text: 'Agree', value: 4 },
        { text: 'Strongly Agree', value: 5 }
      ],
      style: q.style,
      points: q.points
    }))
  });

  console.log('[Questions] Full 300-question bank initialized successfully:');
  console.log('[Questions] - Kolb: 100 questions (25 per quadrant)');
  console.log('[Questions] - Sternberg: 100 questions (34/33/33 distribution)');
  console.log('[Questions] - Dual-Process: 100 questions (50 per style)');
};

// ============= PROGRESS ROUTES (must come before generic :framework/:version route) =============

// Save assessment progress
app.post('/assessment/progress', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { assessmentType, currentQuestion, answers, completed } = await c.req.json();
    
    const progressKey = `progress:${user.id}:${assessmentType}`;
    await kv.set(progressKey, {
      userId: user.id,
      assessmentType,
      currentQuestion,
      answers,
      completed,
      lastUpdated: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`[Progress] Error saving assessment progress: ${error}`);
    return c.json({ error: 'Failed to save progress' }, 500);
  }
});

// Get assessment progress
app.get('/assessment/progress/:assessmentType', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const assessmentType = c.req.param('assessmentType');
    const progressKey = `progress:${user.id}:${assessmentType}`;
    const progress = await kv.get(progressKey);

    // Check if progress has expired (7 days old)
    if (progress && progress.lastUpdated) {
      const lastUpdated = new Date(progress.lastUpdated);
      const now = new Date();
      const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 7) {
        console.log(`[Progress] Progress expired (${Math.round(daysSinceUpdate)} days old), deleting...`);
        await kv.del(progressKey);
        return c.json({ success: true, progress: null });
      }
    }

    return c.json({ success: true, progress });
  } catch (error) {
    console.log(`[Progress] Error fetching assessment progress: ${error}`);
    return c.json({ error: 'Failed to fetch progress' }, 500);
  }
});

// ============= AUTO SKILL PLAN GENERATION =============

/**
 * Maps assessment scores to skill dimensions for auto-generating Skill Builder plans.
 * Lower percentages indicate weaker areas that could benefit from targeted practice.
 */
function mapAssessmentToSkillDimensions(assessmentType: string, results: any): Array<{ dimensionId: string; score: number }> {
  console.log(`[AutoPlan] v2.1.1 - mapAssessmentToSkillDimensions called with type: ${assessmentType}`);

  // Defensive check: ensure results exists
  if (!results || typeof results !== 'object') {
    console.error('[AutoPlan] v2.1.1 - Invalid results (null or not object):', results);
    return [];
  }

  // Extract assessment data - handle nested structure and naming variations
  // Try exact match first, then camelCase version, then direct results
  const camelCaseType = assessmentType.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  let assessmentData = results[assessmentType] || results[camelCaseType] || results;

  console.log(`[AutoPlan] v2.1.1 - Assessment type: ${assessmentType}, camelCase: ${camelCaseType}`);
  console.log(`[AutoPlan] v2.1.1 - Available keys in results:`, Object.keys(results));
  console.log(`[AutoPlan] v2.1.1 - Extracted assessment data:`, JSON.stringify(assessmentData, null, 2));

  // Get scores and calculate percentages if needed
  let percentages: Record<string, number> = {};

  console.log(`[AutoPlan] v2.1.1 - Checking for percentages:`, !!assessmentData.percentages);
  console.log(`[AutoPlan] v2.1.1 - Checking for scores:`, !!assessmentData.scores);
  console.log(`[AutoPlan] v2.1.1 - assessmentData type:`, typeof assessmentData);
  console.log(`[AutoPlan] v2.1.1 - assessmentData keys:`, Object.keys(assessmentData || {}));

  if (assessmentData.percentages) {
    // Already has percentages
    percentages = assessmentData.percentages;
    console.log(`[AutoPlan] v2.1.1 - Using existing percentages:`, percentages);
  } else if (assessmentData.scores) {
    // Has raw scores, calculate percentages as proportion of total
    const scores = assessmentData.scores;
    const total = Object.values(scores).reduce((sum: number, score) => sum + (score as number), 0);

    Object.keys(scores).forEach(key => {
      percentages[key] = total > 0 ? Math.round(((scores[key] as number) / total) * 100) : 0;
    });

    console.log(`[AutoPlan] v2.1.1 - Calculated percentages from scores for ${assessmentType}:`, percentages);
  } else {
    console.error('[AutoPlan] v2.1.1 - No scores or percentages found in assessmentData:', JSON.stringify(assessmentData, null, 2));
    console.error('[AutoPlan] v2.1.1 - Original results:', JSON.stringify(results, null, 2));
    return [];
  }

  // Map framework scores to skill dimensions
  // Lower scores = opportunity areas for growth
  const dimensions: Array<{ dimensionId: string; score: number }> = [];

  if (assessmentType === 'kolb') {
    // Kolb learning styles → skill dimensions
    // Diverging (feeling + watching) → emotional_regulation + curiosity
    // Assimilating (watching + thinking) → metacognition
    // Converging (thinking + doing) → problem_solving
    // Accommodating (doing + feeling) → curiosity + emotional_regulation

    dimensions.push(
      { dimensionId: 'metacognition', score: (percentages.Assimilating ?? 0) as number },
      { dimensionId: 'problem_solving', score: (percentages.Converging ?? 0) as number },
      { dimensionId: 'curiosity', score: Math.max(
        (percentages.Diverging ?? 0) as number,
        (percentages.Accommodating ?? 0) as number
      ) },
      { dimensionId: 'emotional_regulation', score: Math.max(
        (percentages.Diverging ?? 0) as number,
        (percentages.Accommodating ?? 0) as number
      ) }
    );
  } else if (assessmentType === 'sternberg') {
    // Sternberg thinking styles → skill dimensions
    // Analytical → metacognition + problem_solving
    // Creative → curiosity
    // Practical → problem_solving

    dimensions.push(
      { dimensionId: 'metacognition', score: (percentages.analytical ?? percentages.Analytical ?? 0) as number },
      { dimensionId: 'problem_solving', score: Math.max(
        (percentages.analytical ?? percentages.Analytical ?? 0) as number,
        (percentages.practical ?? percentages.Practical ?? 0) as number
      ) },
      { dimensionId: 'curiosity', score: (percentages.creative ?? percentages.Creative ?? 0) as number }
    );
  } else if (assessmentType === 'dual-process') {
    // Dual-process decision making → skill dimensions
    // Reflective (System 2) → metacognition + problem_solving
    // Intuitive (System 1) → emotional_regulation

    const system2Score = (percentages.system2 ?? percentages.Reflective ?? 0) as number;
    const system1Score = (percentages.system1 ?? percentages.Intuitive ?? 0) as number;

    dimensions.push(
      { dimensionId: 'metacognition', score: system2Score },
      { dimensionId: 'problem_solving', score: system2Score },
      { dimensionId: 'emotional_regulation', score: system1Score }
    );
  }

  console.log(`[AutoPlan] Mapped dimensions for ${assessmentType}:`, dimensions);
  return dimensions;
}

/**
 * Auto-generates a Skill Builder plan if the user scored low in any dimension.
 * Threshold: < 25% indicates a significant opportunity area.
 */
async function autoGenerateSkillPlan(userId: string, assessmentType: string, results: any, resultKey: string) {
  try {
    console.log(`[AutoPlan] v2.1.1 - Starting auto-generation for user ${userId}, type: ${assessmentType}`);
    console.log(`[AutoPlan] v2.1.1 - Input results:`, JSON.stringify(results, null, 2));

    const dimensions = mapAssessmentToSkillDimensions(assessmentType, results);

    // Check if we have valid dimensions
    if (!dimensions || dimensions.length === 0) {
      console.log(`[AutoPlan] No dimensions mapped for user ${userId} assessment ${assessmentType}`);
      return null;
    }

    // Find weakest dimension (lowest score)
    const weakestDimension = dimensions.reduce((min, dim) =>
      dim.score < min.score ? dim : min
    );

    // Only auto-generate if the weakest dimension is below 25%
    const WEAKNESS_THRESHOLD = 25;
    if (weakestDimension.score >= WEAKNESS_THRESHOLD) {
      console.log(`[AutoPlan] No weak dimensions for user ${userId} (weakest: ${weakestDimension.dimensionId} at ${weakestDimension.score}%)`);
      return null;
    }

    console.log(`[AutoPlan] Detected weak dimension for user ${userId}: ${weakestDimension.dimensionId} (${weakestDimension.score}%)`);

    // Check if user already has an active plan for this dimension
    const existingPlans = await kv.getByPrefix(`skillplan:${userId}:`);
    const hasActivePlan = existingPlans?.some((plan: any) =>
      plan.dimensionId === weakestDimension.dimensionId &&
      plan.status === 'active'
    );

    if (hasActivePlan) {
      console.log(`[AutoPlan] User ${userId} already has active plan for ${weakestDimension.dimensionId}, skipping auto-generation`);
      return null;
    }

    // Generate the plan (importing activity bank logic from skill-plan-routes)
    const ACTIVITY_BANK: Record<string, { games: string[]; prompts: string[]; challenges: string[] }> = {
      metacognition: {
        games: ['memory-match', 'n-back', 'stroop'],
        prompts: [
          'What did you learn today that surprised you?',
          'Describe a moment when you changed your mind.',
          'How did you check that your answer was right?',
        ],
        challenges: [
          'Solve one problem out loud — narrate your steps.',
          'Re-explain something you learned to a younger person.',
          'Pick one mistake from this week and write down what it taught you.',
        ],
      },
      problem_solving: {
        games: ['stroop', 'pattern', 'n-back'],
        prompts: [
          'What is the hardest problem you faced today?',
          'List three different ways to solve the same problem.',
        ],
        challenges: [
          'Take one daily task and find a faster way to do it.',
          'Plan a project in 5 steps before starting.',
        ],
      },
      curiosity: {
        games: ['memory-match', 'pattern'],
        prompts: [
          'What is one question you cannot stop thinking about?',
          'Pick something ordinary and write 5 things you do not know about it.',
        ],
        challenges: [
          'Learn one new word and use it in conversation.',
          'Ask three people: "What changed your mind recently?"',
        ],
      },
      emotional_regulation: {
        games: ['memory-match'],
        prompts: [
          'Name the feeling you had most today and what triggered it.',
          'Describe a moment you stayed calm when it was hard.',
        ],
        challenges: [
          'When you feel rushed, take 3 slow breaths before acting.',
          'Write a kind message to someone — including yourself.',
        ],
      },
    };

    const bank = ACTIVITY_BANK[weakestDimension.dimensionId] || ACTIVITY_BANK.metacognition;
    const pick = <T,>(arr: T[], day: number): T => arr[day % arr.length];
    const lengthDays = 7;

    const activities = Array.from({ length: lengthDays }, (_, i) => ({
      day: i + 1,
      gameId: pick(bank.games, i),
      promptId: `prompt:${weakestDimension.dimensionId}:${i % bank.prompts.length}`,
      challengeId: `challenge:${weakestDimension.dimensionId}:${i % bank.challenges.length}`,
      completed: false,
      completedAt: null as string | null,
    }));

    const now = new Date().toISOString();
    const plan = {
      planId: uuid(),
      userId,
      dimensionId: weakestDimension.dimensionId,
      tier: 'adult',
      lengthDays,
      currentDay: 1,
      status: 'active' as const,
      activities,
      sourceResultId: resultKey,
      createdAt: now,
      updatedAt: now,
    };

    await kv.set(`skillplan:${userId}:${plan.planId}`, plan);
    console.log(`[AutoPlan] ✓ Created plan ${plan.planId} for ${weakestDimension.dimensionId} (user ${userId})`);

    return plan;
  } catch (error) {
    console.error(`[AutoPlan] Error auto-generating skill plan: ${error}`);
    return null;
  }
}

// Helper function to determine primary style from scores
const determinePrimaryStyle = (scores: any, type: string) => {
  if (type === 'kolb' || type === 'learning') {
    const { CE = 0, RO = 0, AC = 0, AE = 0 } = scores;
    const acCE = AC - CE;
    const aeRO = AE - RO;
    
    if (acCE > 0 && aeRO > 0) return 'Converging';
    if (acCE > 0 && aeRO < 0) return 'Assimilating';
    if (acCE < 0 && aeRO < 0) return 'Diverging';
    return 'Accommodating';
  } else if (type === 'sternberg') {
    const { analytical = 0, creative = 0, practical = 0 } = scores;
    if (analytical >= creative && analytical >= practical) return 'Analytical';
    if (creative >= analytical && creative >= practical) return 'Creative';
    return 'Practical';
  } else if (type === 'dual-process' || type === 'decision') {
    const { system1 = 0, system2 = 0 } = scores;
    return system1 > system2 ? 'Intuitive' : 'Reflective';
  }
  return 'Unknown';
};

// Submit assessment results
app.post('/assessment/submit', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { assessmentType, answers, results, strengths, weaknesses, recommendations } = await c.req.json();

    // Calculate confidence metrics if confidence data is present
    let confidenceMetrics = null;
    if (answers && Array.isArray(answers) && answers.length > 0 && typeof answers[0] === 'object' && 'confidence' in answers[0]) {
      const confidenceLevels = answers.map((a: any) => a.confidence);
      const avgConfidence = confidenceLevels.reduce((sum: number, c: number) => sum + c, 0) / confidenceLevels.length;
      const lowConfidenceCount = confidenceLevels.filter((c: number) => c <= 2).length;
      const highConfidenceCount = confidenceLevels.filter((c: number) => c >= 4).length;

      confidenceMetrics = {
        average: Math.round(avgConfidence * 100) / 100,
        distribution: {
          guessing: confidenceLevels.filter((c: number) => c === 1).length,
          unsure: confidenceLevels.filter((c: number) => c === 2).length,
          neutral: confidenceLevels.filter((c: number) => c === 3).length,
          confident: confidenceLevels.filter((c: number) => c === 4).length,
          verySure: confidenceLevels.filter((c: number) => c === 5).length,
        },
        lowConfidencePercentage: Math.round((lowConfidenceCount / answers.length) * 100),
        highConfidencePercentage: Math.round((highConfidenceCount / answers.length) * 100),
      };

      console.log(`[Confidence] Calculated metrics for ${assessmentType}:`, confidenceMetrics);
    }

    // Save results
    const resultKey = `result:${user.id}:${assessmentType}`;
    await kv.set(resultKey, {
      id: resultKey,  // Include the ID in the stored data
      userId: user.id,
      assessmentType,
      answers,
      results,
      strengths,
      weaknesses,
      recommendations,
      confidenceMetrics, // NEW: Store confidence metrics
      completedAt: new Date().toISOString()
    });

    // Update user profile
    const userProfile = await kv.get(`user:${user.id}`) || {};
    const assessmentsCompleted = userProfile.assessmentsCompleted || [];
    if (!assessmentsCompleted.includes(assessmentType)) {
      assessmentsCompleted.push(assessmentType);
    }
    
    await kv.set(`user:${user.id}`, {
      ...userProfile,
      assessmentsCompleted
    });

    // Clear progress
    await kv.del(`progress:${user.id}:${assessmentType}`);

    // Auto-generate Skill Builder plan if user scored low in any dimension
    const autoPlan = await autoGenerateSkillPlan(user.id, assessmentType, results, resultKey);

    // [SEND NOTIFICATION TO TEACHER]
    if (userProfile.role === 'student' && userProfile.teacherId) {
      try {
        const teacherProfile = await kv.get(`user:${userProfile.teacherId}`);
        if (teacherProfile && teacherProfile.email) {
          const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_eFr3vz6q_G7KDp6TjnDLVUX2JyouKEbfG';
          
          const assessmentNames: Record<string, string> = {
            learning: 'Learning Style Assessment',
            kolb: 'Learning Style Assessment',
            decision: 'Decision Style Assessment',
            'dual-process': 'Decision Style Assessment',
            'adult-thinking': 'Thinking Style Assessment',
            'shs-thinking': 'Thinking Style Assessment',
            'jhs-thinking': 'Thinking Style Assessment',
            'child-thinking': 'Thinking Style Assessment',
            sternberg: 'Thinking Style Assessment'
          };
          
          const niceAssessmentName = assessmentNames[assessmentType] || 'Assessment';
          
          // Determine the primary style or use the one provided by frontend
          let primaryStyle = 'N/A';
          if (results) {
            primaryStyle = results.primaryStyle || results.dominantStyle || determinePrimaryStyle(results, assessmentType);
          }
          
          const studentName = userProfile.name || 'Your student';
          
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'JotMinds Notifications <service@jotminds.com>',
              to: teacherProfile.email,
              subject: `${studentName} completed the ${niceAssessmentName}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://www.jotminds.com/logo.png" alt="JotMinds Logo" style="height: 48px; width: auto;" />
                  </div>
                  <h2>Assessment Completed!</h2>
                  <p>Great news! <strong>${studentName}</strong> has just completed the <strong>${niceAssessmentName}</strong>.</p>
                  <div style="padding: 15px; background: #f4f4f5; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 16px;"><strong>Primary Style Detected:</strong> <span style="color: #4F46E5;">${primaryStyle}</span></p>
                  </div>
                  <p style="margin-top: 20px; font-size: 14px; color: #333;">
                    Log into your JotMinds Teacher Portal to view detailed insights, strengths, weaknesses, and tailored recommendations.
                  </p>
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://www.jotminds.com/teacher" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Student Results</a>
                  </div>
                </div>
              `
            })
          }).catch(err => console.error('[Submit] Failed to send email to teacher:', err));
        }
      } catch (e) {
        console.error('[Submit] Failed to notify teacher:', e);
      }
    }

    return c.json({
      success: true,
      resultId: resultKey,
      autoGeneratedPlan: autoPlan ? {
        planId: autoPlan.planId,
        dimensionId: autoPlan.dimensionId,
        message: `We created a 7-day ${autoPlan.dimensionId} plan to help you grow in this area!`
      } : null
    });
  } catch (error) {
    console.log(`[Submit] Error submitting assessment: ${error}`);
    return c.json({ error: 'Failed to submit assessment' }, 500);
  }
});

// Get assessment results for a specific type
app.get('/assessment/results/:assessmentType', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const assessmentType = c.req.param('assessmentType');
    const resultKey = `result:${user.id}:${assessmentType}`;
    console.log(`[Results] Fetching ${assessmentType} for user ${user.id}, key: ${resultKey}`);
    
    const results = await kv.get(resultKey);
    console.log(`[Results] Retrieved data:`, results);
    console.log(`[Results] Data type:`, typeof results);
    console.log(`[Results] Is null?`, results === null);
    console.log(`[Results] Is undefined?`, results === undefined);
    
    // Let's also check if there are ANY keys for this user
    const allUserKeys = await kv.getByPrefix(`result:${user.id}:`);
    console.log(`[Results] All keys for user ${user.id}:`, allUserKeys);
    console.log(`[Results] Number of results found:`, allUserKeys?.length || 0);

    // Include debug info in response
    return c.json({ 
      success: true, 
      results,
      _debug: {
        key: resultKey,
        dataType: typeof results,
        isNull: results === null,
        isUndefined: results === undefined,
        allKeysCount: allUserKeys?.length || 0,
        allKeys: allUserKeys?.map((k: any) => k.id || k.key || JSON.stringify(k))
      }
    });
  } catch (error) {
    console.log(`[Results] Error fetching assessment results: ${error}`);
    return c.json({ error: 'Failed to fetch results' }, 500);
  }
});

// Helper function to determine primary style from scores (MOVED UP)

// Get all assessment results for user
app.get('/assessment/results', async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userIdsParam = c.req.query('userIds');
    if (userIdsParam) {
      // Role validation: Only admins, school admins, or teachers can query others' assessments
      const profile = await kv.get(`user:${user.id}`);
      const role = profile?.role || user.user_metadata?.role || '';
      
      if (role !== 'school_admin' && role !== 'admin' && role !== 'teacher' && user.id !== 'admin-001') {
        return c.json({ error: 'Forbidden' }, 403);
      }
      
      const targetIds = userIdsParam.split(',');
      const allResults = await Promise.all(
        targetIds.map(id => kv.getByPrefix(`result:${id}:`))
      );
      const flattened = allResults.flat();
      return c.json({ success: true, results: flattened });
    }

    const resultKeys = await kv.getByPrefix(`result:${user.id}:`);
    
    return c.json({ success: true, results: resultKeys });
  } catch (error) {
    console.log(`[Results] Error fetching all assessment results: ${error}`);
    return c.json({ error: 'Failed to fetch results' }, 500);
  }
});

// ============= QUESTION ROUTES =============

/**
 * Shuffle an array using Fisher-Yates algorithm with optional seed
 * @param array - Array to shuffle
 * @param seed - Optional seed for deterministic randomization
 */
function shuffleArray<T>(array: T[], seed?: string): T[] {
  const shuffled = [...array]; // Create a copy to avoid mutation
  
  if (seed) {
    // Seeded random number generator (simple LCG)
    let seedNum = 0;
    for (let i = 0; i < seed.length; i++) {
      seedNum = ((seedNum << 5) - seedNum) + seed.charCodeAt(i);
      seedNum = seedNum & seedNum; // Convert to 32-bit integer
    }
    
    const seededRandom = () => {
      seedNum = (seedNum * 9301 + 49297) % 233280;
      return seedNum / 233280;
    };
    
    // Fisher-Yates shuffle with seeded random
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } else {
    // Fisher-Yates shuffle with Math.random()
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  
  return shuffled;
}

// List all available versions for a framework
app.get('/assessment/:framework/versions', async (c) => {
  try {
    const framework = c.req.param('framework');

    // Get all versions for this framework
    const allVersions = await kv.getByPrefix(`questions:${framework}:`);

    const versions = allVersions.map((q: any) => ({
      version: q.version,
      description: q.description,
      questionCount: q.questions?.length || 0,
      createdAt: q.createdAt
    }));

    return c.json({
      success: true,
      framework,
      versions
    });
  } catch (error) {
    console.log(`Error listing versions: ${error}`);
    return c.json({ error: 'Failed to list versions' }, 500);
  }
});

// Get assessment questions by framework and version
app.get('/assessment/:framework/:version', async (c) => {
  try {
    const framework = c.req.param('framework');
    const version = c.req.param('version');
    
    // Get query parameters for randomization
    const randomize = c.req.query('randomize') === 'true';
    const seed = c.req.query('seed'); // Optional seed for deterministic randomization
    const userId = c.req.query('userId'); // For generating user-specific seed

    // Validate framework
    const validFrameworks = ['kolb', 'sternberg', 'dual-process'];
    if (!validFrameworks.includes(framework)) {
      return c.json({ error: `Invalid framework. Must be one of: ${validFrameworks.join(', ')}` }, 400);
    }

    // Validate version format
    if (!version.match(/^v\d+$/)) {
      return c.json({ error: 'Invalid version format. Must be v1, v2, v3, etc.' }, 400);
    }

    const questionSet = await kv.get(`questions:${framework}:${version}`);

    if (!questionSet) {
      return c.json({ error: `Question set not found for ${framework} ${version}` }, 404);
    }

    let questions = questionSet.questions;
    let usedSeed = null;
    
    // Apply randomization if requested
    if (randomize) {
      // Generate or use provided seed
      if (seed) {
        usedSeed = seed;
      } else if (userId) {
        // Create a unique seed based on user, framework, and current timestamp for true randomization
        const timestamp = Date.now(); // Use milliseconds for unique shuffle each time
        usedSeed = `${userId}-${framework}-${version}-${timestamp}`;
      } else {
        // Use random seed based on current timestamp
        usedSeed = `random-${Date.now()}`;
      }
      
      questions = shuffleArray(questions, usedSeed);
      console.log(`[Questions] Randomized ${framework} ${version} with seed: ${usedSeed}`);
      
      // Verify question integrity after shuffle (no mixing between frameworks)
      const verifyQuestions = questions.every((q: any) => q.id.startsWith(`${framework}-`));
      if (!verifyQuestions) {
        console.error(`[Questions] ⚠️ WARNING: Question integrity check FAILED for ${framework}!`);
      } else {
        console.log(`[Questions] ✅ Question integrity verified - all questions belong to ${framework}`);
      }
    }

    // Select exactly 12 questions with balanced style/dimension distribution
    let selectedQuestions = [];
    if (framework === 'kolb') {
      const styles = ['Diverging', 'Assimilating', 'Converging', 'Accommodating'];
      styles.forEach(style => {
        const styleQuestions = questions.filter((q: any) => q.style === style);
        selectedQuestions.push(...styleQuestions.slice(0, 3)); // 3 questions per style = 12 total
      });
    } else if (framework === 'sternberg') {
      const styles = ['Analytical', 'Creative', 'Practical'];
      styles.forEach(style => {
        const styleQuestions = questions.filter((q: any) => q.style === style);
        selectedQuestions.push(...styleQuestions.slice(0, 4)); // 4 questions per style = 12 total
      });
    } else if (framework === 'dual-process') {
      const styles = ['Intuitive', 'Reflective'];
      styles.forEach(style => {
        const styleQuestions = questions.filter((q: any) => q.style === style);
        selectedQuestions.push(...styleQuestions.slice(0, 6)); // 6 questions per style = 12 total
      });
    } else {
      selectedQuestions = questions.slice(0, 12);
    }
    questions = selectedQuestions;

    console.log(`[Questions] Retrieved ${framework} ${version} with ${questions.length} questions${randomize ? ' (randomized)' : ''}`);

    return c.json({
      success: true,
      framework,
      version,
      description: questionSet.description,
      questionCount: questions.length,
      createdAt: questionSet.createdAt,
      randomized: randomize,
      seed: usedSeed,
      questions
    });
  } catch (error) {
    console.log(`Error fetching assessment questions: ${error}`);
    return c.json({ error: 'Failed to fetch assessment questions' }, 500);
  }
});

// ============= SERVER-SIDE SCORING =============

// Calculate Kolb scores with Likert scale (1-5)
const calculateKolbScores = (answers: any[]) => {
  const scores: Record<string, number> = {
    Accommodating: 0,
    Diverging: 0,
    Assimilating: 0,
    Converging: 0
  };

  // Sum up Likert scale values (1-5) for each style
  answers.forEach(answer => {
    if (answer.selectedStyle && scores.hasOwnProperty(answer.selectedStyle)) {
      const value = answer.selectedValue || 3; // Default to neutral if not provided
      scores[answer.selectedStyle] += value;
    }
  });

  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const percentages: Record<string, number> = {};

  Object.keys(scores).forEach(style => {
    percentages[style] = total > 0 ? Math.round((scores[style] / total) * 100) : 0;
  });

  const dominantStyle = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );

  return {
    scores,
    percentages,
    dominantStyle,
    totalQuestions: answers.length,
    maxPossibleScore: answers.length * 5
  };
};

// Calculate Sternberg scores with Likert scale (1-5)
const calculateSternbergScores = (answers: any[]) => {
  const scores: Record<string, number> = {
    Analytical: 0,
    Creative: 0,
    Practical: 0
  };

  // Sum up Likert scale values (1-5) for each style
  answers.forEach(answer => {
    if (answer.selectedStyle && scores.hasOwnProperty(answer.selectedStyle)) {
      const value = answer.selectedValue || 3; // Default to neutral if not provided
      scores[answer.selectedStyle] += value;
    }
  });

  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const percentages: Record<string, number> = {};

  Object.keys(scores).forEach(style => {
    percentages[style] = total > 0 ? Math.round((scores[style] / total) * 100) : 0;
  });

  const dominantStyle = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );

  return {
    scores,
    percentages,
    dominantStyle,
    totalQuestions: answers.length,
    maxPossibleScore: answers.length * 5
  };
};

// Calculate Dual-Process scores with Likert scale (1-5)
const calculateDualProcessScores = (answers: any[]) => {
  const tempScores: Record<string, number> = {
    Intuitive: 0,
    Reflective: 0
  };

  // Sum up Likert scale values (1-5) for each style
  answers.forEach(answer => {
    if (answer.selectedStyle && tempScores.hasOwnProperty(answer.selectedStyle)) {
      const value = answer.selectedValue || 3; // Default to neutral if not provided
      tempScores[answer.selectedStyle] += value;
    }
  });

  // Normalize to system1/system2 format to match frontend expectations
  const scores = {
    system1: tempScores.Intuitive,
    system2: tempScores.Reflective
  };

  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const percentages: Record<string, number> = {};

  Object.keys(scores).forEach(style => {
    percentages[style] = total > 0 ? Math.round(((scores as any)[style] / total) * 100) : 0;
  });

  const dominantStyle = scores.system1 > scores.system2 ? 'Intuitive' : 'Reflective';

  return {
    scores,
    percentages,
    dominantStyle,
    totalQuestions: answers.length,
    maxPossibleScore: answers.length * 5
  };
};

// Server-side scoring endpoint
app.post('/assessment/:framework/score', async (c) => {
  try {
    const framework = c.req.param('framework');
    const { answers, version } = await c.req.json();

    if (!answers || !Array.isArray(answers)) {
      return c.json({ error: 'Answers array is required' }, 400);
    }

    let results;
    switch (framework) {
      case 'kolb':
        results = calculateKolbScores(answers);
        break;
      case 'sternberg':
        results = calculateSternbergScores(answers);
        break;
      case 'dual-process':
        results = calculateDualProcessScores(answers);
        break;
      default:
        return c.json({ error: 'Invalid framework' }, 400);
    }

    console.log(`[Scoring] Calculated ${framework} scores:`, results);

    return c.json({
      success: true,
      framework,
      version: version || 'v1',
      results,
      calculatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.log(`Error calculating scores: ${error}`);
    return c.json({ error: 'Failed to calculate scores' }, 500);
  }
});

// Initialize questions on server start (non-blocking)
initializeQuestionSets().catch(err => {
  console.error('[Questions] Failed to initialize question sets:', err);
});

export default app;