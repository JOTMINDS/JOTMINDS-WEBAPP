// SHS Thinking Styles Assessment Scoring (Ages 15-18)

import { shsQuestions, tertiaryPrograms, TertiaryProgram } from './shsThinkingData';

export interface SHSResponse {
  questionId: number;
  value: number; // 1-5 Likert scale
}

export interface SHSScores {
  creative: number;
  analytical: number;
  practical: number;
  reflective: number;
}

export interface SHSResults {
  scores: SHSScores;
  percentages: SHSScores;
  dominantStyle: 'creative' | 'analytical' | 'practical' | 'reflective';
  personalityType: string;
  topPrograms: TertiaryProgram[];
  timestamp: string;
}

export function calculateSHSScores(responses: SHSResponse[]): SHSResults {
  // Initialize scores
  const rawScores: SHSScores = {
    creative: 0,
    analytical: 0,
    practical: 0,
    reflective: 0
  };

  // Calculate raw scores by summing responses for each style
  responses.forEach(response => {
    const question = shsQuestions.find(q => q.id === response.questionId);
    if (question) {
      rawScores[question.style] += response.value;
    }
  });

  // Calculate total possible score for each style (6 questions × 5 max points = 30)
  const maxScorePerStyle = 30;

  // Convert to percentages
  const percentages: SHSScores = {
    creative: Math.round((rawScores.creative / maxScorePerStyle) * 100),
    analytical: Math.round((rawScores.analytical / maxScorePerStyle) * 100),
    practical: Math.round((rawScores.practical / maxScorePerStyle) * 100),
    reflective: Math.round((rawScores.reflective / maxScorePerStyle) * 100)
  };

  // Find dominant style
  const dominantStyle = Object.entries(percentages).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0] as 'creative' | 'analytical' | 'practical' | 'reflective';

  // Determine personality type based on style combination
  const personalityType = determinePersonalityType(percentages);

  // Get top 3 program recommendations
  const topPrograms = recommendPrograms(percentages);

  return {
    scores: rawScores,
    percentages,
    dominantStyle,
    personalityType,
    topPrograms,
    timestamp: new Date().toISOString()
  };
}

function determinePersonalityType(percentages: SHSScores): string {
  const sorted = Object.entries(percentages)
    .sort((a, b) => b[1] - a[1])
    .map(([style]) => style);

  const primary = sorted[0];
  const secondary = sorted[1];

  // Personality types based on dominant and secondary styles
  const types: { [key: string]: string } = {
    'creative-analytical': 'The Innovator',
    'creative-practical': 'The Designer',
    'creative-reflective': 'The Artist',
    'analytical-creative': 'The Scientist',
    'analytical-practical': 'The Strategist',
    'analytical-reflective': 'The Scholar',
    'practical-creative': 'The Builder',
    'practical-analytical': 'The Engineer',
    'practical-reflective': 'The Organizer',
    'reflective-creative': 'The Philosopher',
    'reflective-analytical': 'The Researcher',
    'reflective-practical': 'The Counselor'
  };

  return types[`${primary}-${secondary}`] || 'The Balanced Thinker';
}

function recommendPrograms(percentages: SHSScores): TertiaryProgram[] {
  // Score each program based on alignment with student's thinking styles
  const programScores = tertiaryPrograms.map(program => {
    let score = 0;

    // Calculate alignment score
    program.thinkingStyles.forEach((style, index) => {
      const styleKey = style as keyof SHSScores;
      const weight = index === 0 ? 3 : index === 1 ? 2 : 1; // Primary style weighted more
      score += percentages[styleKey] * weight;
    });

    return { program, score };
  });

  // Sort by score and return top 3
  return programScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.program);
}

export function getSHSInsights(results: SHSResults): {
  strengths: string[];
  recommendations: string[];
  careerPaths: string[];
} {
  const { dominantStyle, percentages } = results;

  const strengths: string[] = [];
  const recommendations: string[] = [];
  const careerPaths: string[] = [];

  // Identify strong thinking styles (>= 70%)
  Object.entries(percentages).forEach(([style, percentage]) => {
    if (percentage >= 70) {
      if (style === 'creative') {
        strengths.push('Strong creative and innovative thinking');
        recommendations.push('Explore programs in arts, design, or creative industries');
        careerPaths.push('Creative professions like architecture, multimedia, or communication');
      } else if (style === 'analytical') {
        strengths.push('Excellent analytical and logical reasoning');
        recommendations.push('Consider STEM programs or research-focused fields');
        careerPaths.push('Science, technology, mathematics, or research careers');
      } else if (style === 'practical') {
        strengths.push('Strong practical problem-solving abilities');
        recommendations.push('Look into applied sciences, engineering, or business programs');
        careerPaths.push('Engineering, IT, business, or healthcare professions');
      } else if (style === 'reflective') {
        strengths.push('Deep reflective and introspective thinking');
        recommendations.push('Explore social sciences, humanities, or counseling programs');
        careerPaths.push('Psychology, education, social work, or research careers');
      }
    }
  });

  // Add general insights based on personality type
  if (results.personalityType.includes('Innovator')) {
    recommendations.push('Seek programs that value both creativity and analytical thinking');
  } else if (results.personalityType.includes('Strategist')) {
    recommendations.push('Focus on programs requiring strategic planning and execution');
  } else if (results.personalityType.includes('Scholar')) {
    recommendations.push('Consider research-oriented or academic programs');
  }

  return { strengths, recommendations, careerPaths };
}
