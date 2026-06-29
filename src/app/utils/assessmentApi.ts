import { projectId, publicAnonKey } from './supabase/info';
import { 
  generateDetailedStrengths, 
  generateDetailedWeaknesses, 
  generateDetailedRecommendations 
} from './assessmentInsights';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-fc8eb847`;

import { getAuthToken } from './api';

const getFrameworkName = (type: string): string => {
  switch (type) {
    case 'learning':
      return 'kolb';
    case 'thinking':
      return 'sternberg';
    case 'decision':
      return 'dual-process';
    default:
      return type;
  }
};

// Helper for authorized headers that supports admin token bypass
const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const isAdminToken = token?.startsWith('admin-token-');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (isAdminToken) {
    headers['X-Admin-Token'] = token;
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  } else {
    headers['Authorization'] = `Bearer ${token || publicAnonKey}`;
  }
  
  return headers;
};

/**
 * Fetch versioned assessment questions from backend
 * @param framework - 'kolb', 'sternberg', or 'dual-process'
 * @param version - 'v1', 'v2', 'v3', etc.
 * @param options - Additional options for fetching questions
 */
export const fetchAssessmentQuestions = async (
  framework: string,
  version: string = 'v1',
  options: {
    randomize?: boolean;
    seed?: string;
    userId?: string;
  } = {}
): Promise<any> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    // Enable randomization by default for better user experience
    const randomize = options.randomize !== undefined ? options.randomize : true;
    if (randomize) {
      params.append('randomize', 'true');
      
      // Use provided seed, or userId if available
      if (options.seed) {
        params.append('seed', options.seed);
      } else if (options.userId) {
        params.append('userId', options.userId);
      }
    }
    
    const queryString = params.toString();
    const url = `${BASE_URL}/assessment/${framework}/${version}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch assessment questions');
    }

    const data = await response.json();
    console.log(`[AssessmentAPI] Fetched ${framework} ${version} questions:`, {
      questionCount: data.questionCount,
      randomized: data.randomized,
      seed: data.seed
    });
    
    return data;
  } catch (error) {
    console.error('[AssessmentAPI] Error fetching questions:', error);
    throw error;
  }
};

/**
 * List all available versions for a framework
 */
export const listAssessmentVersions = async (framework: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/assessment/${framework}/versions`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to list assessment versions');
    }

    return await response.json();
  } catch (error) {
    console.error('[AssessmentAPI] Error listing versions:', error);
    throw error;
  }
};

/**
 * Calculate scores on the server side
 * @param framework - 'kolb', 'sternberg', or 'dual-process'
 * @param answers - Array of answer objects
 * @param version - Version of the question set used
 */
export const calculateScoresOnServer = async (
  framework: string,
  answers: any[],
  version: string = 'v1'
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/assessment/${framework}/score`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answers, version })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to calculate scores');
    }

    const data = await response.json();
    console.log(`[AssessmentAPI] Server-calculated scores for ${framework}:`, data);
    
    return data;
  } catch (error) {
    console.error('[AssessmentAPI] Error calculating scores:', error);
    throw error;
  }
};

/**
 * Auto-save assessment progress (every 3 seconds)
 * @param assessmentType - 'learning', 'thinking', or 'decision'
 * @param currentQuestion - Current question index
 * @param answers - Array of answers so far
 * @param completed - Whether assessment is completed
 */
export const autoSaveProgress = async (
  assessmentType: string,
  currentQuestion: number,
  answers: any[],
  completed: boolean = false
): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/assessment/progress`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        assessmentType,
        currentQuestion,
        answers,
        completed
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save progress');
    }

    console.log(`[AssessmentAPI] Progress auto-saved for ${assessmentType} at question ${currentQuestion}`);
  } catch (error) {
    console.error('[AssessmentAPI] Error saving progress:', error);
    throw error;
  }
};

/**
 * Submit completed assessment with server-side scoring
 * @param type - 'learning', 'thinking', or 'decision'
 * @param answers - All answers from the assessment
 * @param version - Version of questions used
 * @param userProfile - User profile data for personalization
 */
export const submitAssessmentWithServerScoring = async (
  type: string,
  answers: any[],
  version: string = 'v1',
  userProfile?: any
): Promise<any> => {
  try {
    const framework = getFrameworkName(type);
    
    // Calculate scores on server
    const scoringResult = await calculateScoresOnServer(framework, answers, version);
    
    console.log(`[AssessmentAPI] Generating personalized insights for ${framework}:`, {
      results: scoringResult.results,
      userContext: {
        age: userProfile?.age,
        role: userProfile?.role,
        educationLevel: userProfile?.educationLevel,
        position: userProfile?.position
      }
    });
    
    // Generate truly personalized insights using user profile
    const strengths = generateDetailedStrengths(scoringResult.results, framework, userProfile);
    const weaknesses = generateDetailedWeaknesses(scoringResult.results, framework, userProfile);
    const recommendations = generateDetailedRecommendations(scoringResult.results, framework, userProfile);
    
    console.log(`[AssessmentAPI] Generated ${strengths.length} strengths, ${weaknesses.length} weaknesses, ${recommendations.length} recommendations`);
    
    // Submit assessment results
    const response = await fetch(`${BASE_URL}/assessment/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        assessmentType: type,
        answers,
        results: scoringResult.results,
        version,
        scoredAt: scoringResult.calculatedAt,
        strengths,
        weaknesses,
        recommendations
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit assessment');
    }

    const data = await response.json();
    console.log(`[AssessmentAPI] Assessment submitted successfully:`, data);
    
    // Determine dominant and secondary style
    const sorted = Object.entries(scoringResult.results).sort((a: any, b: any) => b[1] - a[1]);
    const dominantStyle = sorted[0]?.[0] || '';
    const secondaryStyle = sorted[1]?.[1] > 0 ? sorted[1]?.[0] : null;

    return {
      ...data,
      results: scoringResult.results,
      insights: {
        strengths,
        weaknesses,
        recommendations,
        dominantStyle,
        secondaryStyle
      }
    };
  } catch (error) {
    console.error('[AssessmentAPI] Error submitting assessment:', error);
    throw error;
  }
};

/**
 * Fetch all assessment results for the currently logged-in user from the server
 */
/**
 * Normalize raw server assessment-result records (`result:{userId}:{type}`, as
 * returned by `/assessment/results`) into the local `Assessment` shape used
 * across the dashboards:
 *   { id, userId, type, responses, score: { kolb|sternberg|dualProcess|'teaching-style': {...} }, completedAt, completed, fromServer }
 *
 * Handles the learning|thinking|decision -> kolb|sternberg|dual-process remap,
 * reconstructs kolb CE/RO/AC/AE when only style buckets are present, and passes
 * teaching-style (and any other type) through under its own key. Tolerant of a
 * missing/stringified `results` payload and of the legacy `type` field name.
 */
export const normalizeServerResults = (rawResults: any[]): any[] => {
  if (!Array.isArray(rawResults)) return [];

  const capitalize = (str: string) => {
    if (!str) return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return rawResults.map((r: any) => {
    let type = r.assessmentType || r.type;
    if (type === 'learning') type = 'kolb';
    else if (type === 'thinking') type = 'sternberg';
    else if (type === 'decision') type = 'dual-process';

    let res = r.results || {};
    if (typeof res === 'string') {
      try { res = JSON.parse(res); } catch { res = {}; }
    }
    const rawScores = res.scores || res || {};
    const scoreObj: any = {};

    // Some submissions store the full score object already keyed by framework
    // (e.g. results = { dualProcess: { style, scores } } or { kolb: {...} }).
    // In that case use it directly instead of reconstructing from flat scores.
    const canonicalKey = type === 'dual-process' ? 'dualProcess' : type;
    if (res && typeof res === 'object' && res[canonicalKey]) {
      scoreObj[canonicalKey] = res[canonicalKey];
      return {
        id: r.id || r.resultKey || `server-${type}-${r.completedAt}`,
        userId: r.userId,
        type,
        responses: [],
        score: scoreObj,
        completedAt: r.completedAt,
        completed: true,
        fromServer: true,
      };
    }

    if (type === 'kolb') {
      const style = capitalize(res.dominantStyle || res.style || 'Unknown');

      // Reconstruct CE, RO, AC, AE from style scores when not stored directly
      const totalQ = res.totalQuestions || 12;
      const maxPerStyle = (totalQ / 4) * 5; // e.g. 15 for 12 questions

      const diverging = rawScores.Diverging || rawScores.diverging || 0;
      const accommodating = rawScores.Accommodating || rawScores.accommodating || 0;
      const assimilating = rawScores.Assimilating || rawScores.assimilating || 0;
      const converging = rawScores.Converging || rawScores.converging || 0;

      const ce = rawScores.CE !== undefined ? rawScores.CE : Math.round(((diverging + accommodating) / (maxPerStyle * 2)) * 48);
      const ro = rawScores.RO !== undefined ? rawScores.RO : Math.round(((diverging + assimilating) / (maxPerStyle * 2)) * 48);
      const ac = rawScores.AC !== undefined ? rawScores.AC : Math.round(((assimilating + converging) / (maxPerStyle * 2)) * 48);
      const ae = rawScores.AE !== undefined ? rawScores.AE : Math.round(((accommodating + converging) / (maxPerStyle * 2)) * 48);

      scoreObj.kolb = {
        style,
        scores: { CE: ce, RO: ro, AC: ac, AE: ae, Diverging: diverging, Accommodating: accommodating, Assimilating: assimilating, Converging: converging },
      };
    } else if (type === 'sternberg') {
      const style = capitalize(res.dominantStyle || res.style || 'Unknown');
      scoreObj.sternberg = {
        style,
        scores: {
          analytical: rawScores.analytical !== undefined ? rawScores.analytical : (rawScores.Analytical || 0),
          creative: rawScores.creative !== undefined ? rawScores.creative : (rawScores.Creative || 0),
          practical: rawScores.practical !== undefined ? rawScores.practical : (rawScores.Practical || 0),
        },
      };
    } else if (type === 'dual-process') {
      const style = capitalize(res.dominantStyle || res.style || 'Unknown');
      scoreObj.dualProcess = {
        style,
        scores: {
          system1: rawScores.system1 !== undefined ? rawScores.system1 : (rawScores.System1 || rawScores.intuitive || rawScores.Intuitive || 0),
          system2: rawScores.system2 !== undefined ? rawScores.system2 : (rawScores.System2 || rawScores.reflective || rawScores.Reflective || 0),
        },
      };
    } else {
      // teaching-style and any other type: pass results through under its own key
      scoreObj[type] = res;
    }

    return {
      id: r.id || r.resultKey || `server-${type}-${r.completedAt}`,
      userId: r.userId,
      type,
      responses: [],
      score: scoreObj,
      completedAt: r.completedAt,
      completed: true,
      fromServer: true,
    };
  });
};

export const fetchMyAssessmentResults = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/assessment/results`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch assessment results');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('[AssessmentAPI] Error fetching my assessment results:', error);
    return [];
  }
};

/**
 * Submit Teaching Style assessment results to KV server
 */
export const submitTeachingStyleAssessment = async (
  responses: number[],
  score: any
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/assessment/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        assessmentType: 'teaching-style',
        answers: responses.map((val, idx) => ({ questionId: idx + 1, value: val })),
        results: score,
        strengths: [],
        weaknesses: [],
        recommendations: []
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit teaching style assessment');
    }

    return await response.json();
  } catch (error) {
    console.error('[AssessmentAPI] Error submitting teaching style assessment:', error);
    throw error;
  }
};