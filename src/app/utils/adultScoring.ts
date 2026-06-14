// Adult Thinking Styles Assessment Scoring (Ages 19+)

import { adultQuestions, careerPaths, CareerPath } from './adultThinkingData';

export interface AdultResponse {
  questionId: number;
  value: number; // 1-5 Likert scale
}

export interface AdultScores {
  creative: number;
  analytical: number;
  practical: number;
  reflective: number;
}

export interface AdultResults {
  scores: AdultScores;
  percentages: AdultScores;
  dominantStyle: 'creative' | 'analytical' | 'practical' | 'reflective';
  professionalProfile: string;
  topCareerPaths: CareerPath[];
  timestamp: string;
}

export function calculateAdultScores(responses: AdultResponse[]): AdultResults {
  // Initialize scores
  const rawScores: AdultScores = {
    creative: 0,
    analytical: 0,
    practical: 0,
    reflective: 0
  };

  // Calculate raw scores by summing responses for each style
  responses.forEach(response => {
    const question = adultQuestions.find(q => q.id === response.questionId);
    if (question) {
      rawScores[question.style] += response.value;
    }
  });

  // Calculate total possible score for each style (6 questions × 5 max points = 30)
  const maxScorePerStyle = 30;

  // Convert to percentages
  const percentages: AdultScores = {
    creative: Math.round((rawScores.creative / maxScorePerStyle) * 100),
    analytical: Math.round((rawScores.analytical / maxScorePerStyle) * 100),
    practical: Math.round((rawScores.practical / maxScorePerStyle) * 100),
    reflective: Math.round((rawScores.reflective / maxScorePerStyle) * 100)
  };

  // Find dominant style
  const dominantStyle = Object.entries(percentages).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0] as 'creative' | 'analytical' | 'practical' | 'reflective';

  // Determine professional profile based on style combination
  const professionalProfile = determineProfessionalProfile(percentages);

  // Get top 3 career path recommendations
  const topCareerPaths = recommendCareerPaths(percentages);

  return {
    scores: rawScores,
    percentages,
    dominantStyle,
    professionalProfile,
    topCareerPaths,
    timestamp: new Date().toISOString()
  };
}

function determineProfessionalProfile(percentages: AdultScores): string {
  const sorted = Object.entries(percentages)
    .sort((a, b) => b[1] - a[1])
    .map(([style]) => style);

  const primary = sorted[0];
  const secondary = sorted[1];

  // Professional profiles based on dominant and secondary styles
  const profiles: { [key: string]: string } = {
    'creative-analytical': 'The Strategic Innovator',
    'creative-practical': 'The Design Implementer',
    'creative-reflective': 'The Visionary Leader',
    'analytical-creative': 'The Data-Driven Innovator',
    'analytical-practical': 'The Systems Optimizer',
    'analytical-reflective': 'The Strategic Thinker',
    'practical-creative': 'The Pragmatic Innovator',
    'practical-analytical': 'The Execution Expert',
    'practical-reflective': 'The Adaptive Manager',
    'reflective-creative': 'The Conscious Creator',
    'reflective-analytical': 'The Thoughtful Analyst',
    'reflective-practical': 'The Intentional Leader'
  };

  return profiles[`${primary}-${secondary}`] || 'The Balanced Professional';
}

function recommendCareerPaths(percentages: AdultScores): CareerPath[] {
  // Score each career path based on alignment with professional's thinking styles
  const careerScores = careerPaths.map(career => {
    let score = 0;

    // Calculate alignment score
    career.thinkingStyles.forEach((style, index) => {
      const styleKey = style as keyof AdultScores;
      const weight = index === 0 ? 3 : index === 1 ? 2 : 1; // Primary style weighted more
      score += percentages[styleKey] * weight;
    });

    return { career, score };
  });

  // Sort by score and return top 3
  return careerScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.career);
}

export function getAdultInsights(results: AdultResults): {
  strengths: string[];
  recommendations: string[];
  developmentAreas: string[];
} {
  const { dominantStyle, percentages } = results;

  const strengths: string[] = [];
  const recommendations: string[] = [];
  const developmentAreas: string[] = [];

  // Identify strong thinking styles (>= 70%)
  Object.entries(percentages).forEach(([style, percentage]) => {
    if (percentage >= 70) {
      if (style === 'creative') {
        strengths.push('Exceptional innovation and creative problem-solving abilities');
        recommendations.push('Seek roles that value innovation, design thinking, and creative strategy');
        developmentAreas.push('Balance creative ideation with structured execution frameworks');
      } else if (style === 'analytical') {
        strengths.push('Outstanding analytical and data-driven decision-making skills');
        recommendations.push('Pursue careers in data science, research, or strategic analysis');
        developmentAreas.push('Develop storytelling skills to communicate complex analyses effectively');
      } else if (style === 'practical') {
        strengths.push('Strong execution capabilities and results-oriented approach');
        recommendations.push('Excel in operations, project management, or business development roles');
        developmentAreas.push('Enhance strategic thinking and long-term planning capabilities');
      } else if (style === 'reflective') {
        strengths.push('Deep self-awareness and exceptional emotional intelligence');
        recommendations.push('Consider people leadership, HR, counseling, or consulting careers');
        developmentAreas.push('Practice making timely decisions and taking decisive action');
      }
    }
  });

  // Add general insights based on professional profile
  if (results.professionalProfile.includes('Innovator')) {
    recommendations.push('Leverage both creative and analytical strengths in innovation roles');
  } else if (results.professionalProfile.includes('Leader')) {
    recommendations.push('Pursue leadership positions that value vision and people development');
  } else if (results.professionalProfile.includes('Expert')) {
    recommendations.push('Develop deep expertise and consider specialist or consulting paths');
  }

  // Identify development areas for weaker styles (< 50%)
  Object.entries(percentages).forEach(([style, percentage]) => {
    if (percentage < 50) {
      if (style === 'creative') {
        developmentAreas.push('Practice creative thinking techniques and embrace experimentation');
      } else if (style === 'analytical') {
        developmentAreas.push('Strengthen data analysis skills and evidence-based decision making');
      } else if (style === 'practical') {
        developmentAreas.push('Focus on implementation skills and project execution');
      } else if (style === 'reflective') {
        developmentAreas.push('Develop self-awareness through reflection and feedback seeking');
      }
    }
  });

  return { strengths, recommendations, developmentAreas };
}
