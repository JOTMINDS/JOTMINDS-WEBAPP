/**
 * Truly Personalized Assessment Insights Generator
 * Generates dynamic, context-aware insights based on user profile and actual scores
 */

// ============= STYLE-SPECIFIC INSIGHT TEMPLATES =============

const kolbInsightTemplates = {
  Accommodating: {
    core_strength: 'hands-on, experiential learning',
    learning_preference: 'direct experience and practical application',
    decision_approach: 'intuitive and action-oriented',
    work_style: 'adaptive and collaborative',
    challenge: 'theoretical concepts and abstract planning'
  },
  Diverging: {
    core_strength: 'creative ideation and multiple perspectives',
    learning_preference: 'observation and brainstorming',
    decision_approach: 'reflective and open-ended',
    work_style: 'imaginative and people-focused',
    challenge: 'making decisive choices and practical implementation'
  },
  Assimilating: {
    core_strength: 'logical analysis and theoretical modeling',
    learning_preference: 'reading, research, and systematic thinking',
    decision_approach: 'analytical and methodical',
    work_style: 'detail-oriented and intellectually rigorous',
    challenge: 'real-world application and interpersonal dynamics'
  },
  Converging: {
    core_strength: 'practical problem-solving and application',
    learning_preference: 'hands-on experimentation and technical tasks',
    decision_approach: 'logical and solution-focused',
    work_style: 'goal-driven and efficient',
    challenge: 'ambiguous situations and creative exploration'
  }
};

const sternbergInsightTemplates = {
  Analytical: {
    core_strength: 'critical evaluation and logical reasoning',
    thinking_preference: 'systematic analysis and comparison',
    problem_approach: 'methodical deconstruction',
    work_style: 'precise and evidence-based',
    challenge: 'novel situations requiring unconventional thinking'
  },
  Creative: {
    core_strength: 'innovative ideation and original thinking',
    thinking_preference: 'imagination and possibility exploration',
    problem_approach: 'outside-the-box solutions',
    work_style: 'inventive and experimental',
    challenge: 'routine tasks and strict adherence to conventions'
  },
  Practical: {
    core_strength: 'real-world application and contextual intelligence',
    thinking_preference: 'pragmatic solutions and adaptation',
    problem_approach: 'street-smart and situational',
    work_style: 'results-oriented and adaptive',
    challenge: 'purely theoretical problems without clear applications'
  }
};

const dualProcessInsightTemplates = {
  Intuitive: {
    core_strength: 'rapid pattern recognition and gut instincts',
    decision_preference: 'fast, automatic processing',
    problem_approach: 'holistic and experience-based',
    work_style: 'spontaneous and responsive',
    challenge: 'avoiding cognitive biases and overconfidence'
  },
  Reflective: {
    core_strength: 'deliberate analysis and systematic evaluation',
    decision_preference: 'slow, controlled processing',
    problem_approach: 'thorough and evidence-based',
    work_style: 'careful and methodical',
    challenge: 'time-pressured decisions requiring quick action'
  }
};

// ============= CONTEXT-AWARE RECOMMENDATION GENERATORS =============

const getEducationalContext = (educationLevel?: string, age?: number, role?: string): string => {
  // Determine educational stage from multiple sources
  if (educationLevel) {
    if (educationLevel.includes('Primary') || educationLevel.includes('JHS')) return 'secondary';
    if (educationLevel.includes('SHS')) return 'high-school';
    if (educationLevel.includes('University') || educationLevel.includes('Tertiary')) return 'university';
  }
  
  if (age) {
    if (age < 13) return 'secondary';
    if (age >= 13 && age <= 18) return 'high-school';
    if (age > 18 && age <= 25) return 'university';
    if (age > 25) return 'professional';
  }
  
  if (role) {
    if (role === 'student') return 'student';
    if (role === 'professional') return 'professional';
    if (role === 'teacher') return 'educator';
  }
  
  return 'general';
};

const getContextualLearningActivities = (
  context: string, 
  style: string, 
  framework: string
): string[] => {
  const activities: Record<string, Record<string, string[]>> = {
    secondary: {
      Accommodating: [
        'Science lab experiments and hands-on projects',
        'Group activities and collaborative learning tasks',
        'Field trips and real-world exploration',
        'Role-playing exercises in social studies'
      ],
      Diverging: [
        'Creative writing and artistic projects',
        'Group discussions and peer brainstorming',
        'Journal reflections on learning experiences',
        'Multimedia presentations combining different perspectives'
      ],
      Assimilating: [
        'Independent reading and research assignments',
        'Structured note-taking and concept mapping',
        'Mathematical problem-solving and logic puzzles',
        'Organized study groups focused on theory'
      ],
      Converging: [
        'Practice problems and applied exercises',
        'Computer programming or technical projects',
        'Building models or prototypes',
        'Standardized test preparation'
      ]
    },
    'high-school': {
      Accommodating: [
        'Internships and work-based learning opportunities',
        'Team sports and extracurricular leadership',
        'Community service projects',
        'Practical applications of academic concepts'
      ],
      Diverging: [
        'Creative portfolio development across subjects',
        'Debate club and philosophical discussions',
        'Interdisciplinary research projects',
        'Cultural exchange and diverse perspective exploration'
      ],
      Assimilating: [
        'Advanced coursework in theoretical subjects',
        'Independent research and academic writing',
        'Online courses for deeper subject mastery',
        'Study strategies emphasizing comprehension over memorization'
      ],
      Converging: [
        'STEM competitions and technical challenges',
        'Applied science projects with measurable outcomes',
        'Technical skill certifications',
        'Standardized test strategies and practice'
      ]
    },
    university: {
      Accommodating: [
        'Industry internships and co-op programs',
        'Research assistant positions with hands-on components',
        'Study abroad and immersive learning experiences',
        'Entrepreneurship projects and startup involvement'
      ],
      Diverging: [
        'Cross-disciplinary research collaborations',
        'Creative thesis or capstone projects',
        'Participation in think tanks or ideation sessions',
        'Cultural studies and humanities exploration'
      ],
      Assimilating: [
        'Graduate-level theoretical coursework',
        'Systematic literature reviews and meta-analyses',
        'Academic conference presentations',
        'Teaching assistant roles requiring deep subject knowledge'
      ],
      Converging: [
        'Applied research with industry applications',
        'Technical certifications alongside degree',
        'Consulting projects solving real problems',
        'Lab-based experimental research'
      ]
    },
    professional: {
      Accommodating: [
        'Cross-functional project teams and rotations',
        'On-the-job training and mentorship programs',
        'Client-facing work requiring adaptability',
        'Leadership development through real challenges'
      ],
      Diverging: [
        'Innovation labs and creative problem-solving workshops',
        'Cross-industry networking and idea exchange',
        'Design thinking and human-centered design projects',
        'Strategic planning and futures thinking initiatives'
      ],
      Assimilating: [
        'Professional certifications and advanced degrees',
        'Industry research and white paper development',
        'Expert-level conference attendance',
        'Systematic process improvement initiatives'
      ],
      Converging: [
        'Technical project leadership roles',
        'Performance consulting and troubleshooting',
        'Results-driven management positions',
        'Efficiency optimization and systems implementation'
      ]
    }
  };
  
  return activities[context]?.[style] || [
    'Explore learning opportunities aligned with your style',
    'Seek experiences that leverage your natural strengths',
    'Challenge yourself with activities outside your comfort zone'
  ];
};

// ============= DYNAMIC INSIGHT GENERATION =============

interface UserProfile {
  age?: number;
  role?: string;
  educationLevel?: string;
  school?: string;
  position?: string;
  industrySector?: string;
  name?: string;
}

/**
 * Generate truly personalized strengths based on user profile and scores
 */
export const generateDetailedStrengths = (
  results: any, 
  framework: string,
  userProfile?: UserProfile
): string[] => {
  const { dominantStyle, percentages, scores } = results;
  const strengths: string[] = [];
  
  // Get template for dominant style
  let template: any = {};
  if (framework === 'kolb') {
    template = kolbInsightTemplates[dominantStyle as keyof typeof kolbInsightTemplates];
  } else if (framework === 'sternberg') {
    template = sternbergInsightTemplates[dominantStyle as keyof typeof sternbergInsightTemplates];
  } else if (framework === 'dual-process') {
    template = dualProcessInsightTemplates[dominantStyle as keyof typeof dualProcessInsightTemplates];
  }
  
  if (!template) return ['Unable to generate insights'];
  
  // Calculate score distribution
  const dominantPercentage = percentages[dominantStyle] || percentages[Object.keys(percentages)[0]];
  const sortedStyles = Object.entries(percentages)
    .sort(([, a], [, b]) => (b as number) - (a as number));
  
  // Strength 1: Personalized dominant style statement
  const styleType = framework === 'dual-process' ? 'decision-making style' : 
                   framework === 'kolb' ? 'learning style' : 'thinking style';
  
  let strengthIntro = `Your ${styleType} is predominantly ${dominantStyle} (${dominantPercentage}%)`;
  
  if (dominantPercentage >= 50) {
    strengthIntro += ', indicating a very strong and consistent preference';
  } else if (dominantPercentage >= 40) {
    strengthIntro += ', showing a clear but not overwhelming preference';
  } else {
    strengthIntro += ', suggesting a balanced profile with multiple strengths';
  }
  strengths.push(strengthIntro);
  
  // Strength 2: Core strength with context
  const context = getEducationalContext(userProfile?.educationLevel, userProfile?.age, userProfile?.role);
  let coreStrengthText = `You excel at ${template.core_strength}`;
  
  if (context === 'secondary' || context === 'high-school') {
    coreStrengthText += ', which serves you well in academic settings';
  } else if (context === 'university') {
    coreStrengthText += ', a valuable asset in higher education';
  } else if (context === 'professional') {
    coreStrengthText += `, particularly valuable in ${userProfile?.position || 'your professional role'}`;
  }
  strengths.push(coreStrengthText);
  
  // Strength 3: Preference with personalized context
  if (framework === 'kolb') {
    strengths.push(`You learn best through ${template.learning_preference}, making active engagement crucial for your success`);
  } else if (framework === 'sternberg') {
    strengths.push(`Your thinking naturally gravitates toward ${template.thinking_preference}, giving you a distinct cognitive advantage`);
  } else {
    strengths.push(`You make decisions through ${template.decision_preference}, which defines your cognitive processing style`);
  }
  
  // Strength 4: Work style with real-world application
  let workStyleText = `Your ${template.work_style} approach`;
  if (userProfile?.position) {
    workStyleText += ` aligns well with roles like ${userProfile.position}`;
  } else if (context === 'student') {
    workStyleText += ' makes you effective in collaborative academic environments';
  } else {
    workStyleText += ' shapes how you tackle problems and interact with others';
  }
  strengths.push(workStyleText);
  
  // Strength 5: Secondary style if significant (>25%)
  if (sortedStyles.length > 1 && (sortedStyles[1][1] as number) > 25) {
    const secondaryStyle = sortedStyles[1][0];
    const secondaryPercentage = sortedStyles[1][1];
    const difference = dominantPercentage - (secondaryPercentage as number);
    
    if (difference < 15) {
      strengths.push(`You demonstrate balanced versatility with nearly equal ${dominantStyle} (${dominantPercentage}%) and ${secondaryStyle} (${secondaryPercentage}%) tendencies, allowing you to adapt your approach based on context`);
    } else {
      strengths.push(`You also show strong ${secondaryStyle} capabilities (${secondaryPercentage}%), providing flexibility when your primary style isn't optimal`);
    }
  }
  
  // Strength 6: Specific score insight
  const totalScore = Object.values(scores).reduce((sum: any, score: any) => sum + (score as number), 0 as any);
  const avgScore = (totalScore as any) / Object.keys(scores).length;
  
  if (avgScore > 0) {
    const engagementLevel = dominantPercentage >= 45 ? 'highly consistent' : 'moderately consistent';
    strengths.push(`Your response patterns show ${engagementLevel} alignment with your dominant style, reflecting authentic self-awareness`);
  }
  
  return strengths;
};

/**
 * Generate personalized weaknesses/growth areas
 */
export const generateDetailedWeaknesses = (
  results: any, 
  framework: string,
  userProfile?: UserProfile
): string[] => {
  const { dominantStyle, percentages } = results;
  const weaknesses: string[] = [];
  
  // Get template
  let template: any = {};
  if (framework === 'kolb') {
    template = kolbInsightTemplates[dominantStyle as keyof typeof kolbInsightTemplates];
  } else if (framework === 'sternberg') {
    template = sternbergInsightTemplates[dominantStyle as keyof typeof sternbergInsightTemplates];
  } else if (framework === 'dual-process') {
    template = dualProcessInsightTemplates[dominantStyle as keyof typeof dualProcessInsightTemplates];
  }
  
  if (!template) return [];
  
  // Weakness 1: Core challenge with context
  const context = getEducationalContext(userProfile?.educationLevel, userProfile?.age, userProfile?.role);
  let challengeText = `You may find ${template.challenge} more challenging due to your ${dominantStyle.toLowerCase()} preference`;
  
  if (context === 'university' || context === 'high-school') {
    challengeText += ', which can impact certain academic requirements';
  } else if (context === 'professional') {
    challengeText += ', which may require conscious effort in some work situations';
  }
  weaknesses.push(challengeText);
  
  // Weakness 2-4: Identify underdeveloped styles with specific percentages
  const sortedStyles = Object.entries(percentages)
    .sort(([, a], [, b]) => (a as number) - (b as number));
  
  sortedStyles.slice(0, 2).forEach(([style, percentage]) => {
    if ((percentage as number) < 20 && style !== dominantStyle) {
      const gap = percentages[dominantStyle] - (percentage as number);
      
      let developmentText = `Your ${style} abilities are underdeveloped (${percentage}%), representing a ${gap}% gap from your dominant style`;
      
      if (framework === 'kolb' && style === 'Assimilating') {
        developmentText += ', which may limit your theoretical understanding';
      } else if (framework === 'kolb' && style === 'Accommodating') {
        developmentText += ', which could reduce your adaptability in dynamic situations';
      } else if (framework === 'sternberg' && style === 'Creative') {
        developmentText += ', potentially limiting innovative problem-solving';
      } else if (framework === 'sternberg' && style === 'Practical') {
        developmentText += ', which may affect real-world application of knowledge';
      }
      
      weaknesses.push(developmentText);
    }
  });
  
  // Weakness: Over-reliance on dominant style
  const dominantPercentage = percentages[dominantStyle];
  if (dominantPercentage > 50) {
    weaknesses.push(`With ${dominantPercentage}% concentration in ${dominantStyle}, you may over-rely on this approach even when alternative strategies would be more effective`);
  }
  
  // Weakness: Balance assessment
  const styleCount = Object.keys(percentages).length;
  const isVeryImbalanced = sortedStyles.some(([, p]) => (p as number) < 10);
  
  if (isVeryImbalanced) {
    weaknesses.push('Your highly specialized profile may limit versatility in situations requiring diverse cognitive approaches');
  }
  
  return weaknesses.slice(0, 5); // Limit to 5 most relevant
};

/**
 * Generate personalized, actionable recommendations
 */
export const generateDetailedRecommendations = (
  results: any, 
  framework: string,
  userProfile?: UserProfile
): string[] => {
  const { dominantStyle, percentages } = results;
  const recommendations: string[] = [];
  
  const context = getEducationalContext(userProfile?.educationLevel, userProfile?.age, userProfile?.role);
  
  // Recommendation 1: Leverage dominant strength in context
  let leverageText = `Actively seek opportunities that leverage your ${dominantStyle.toLowerCase()} strengths`;
  
  if (userProfile?.school) {
    leverageText += ` at ${userProfile.school}`;
  } else if (userProfile?.position) {
    leverageText += ` in your role as ${userProfile.position}`;
  }
  
  recommendations.push(leverageText);
  
  // Recommendations 2-5: Context-specific learning activities
  const activities = getContextualLearningActivities(context, dominantStyle, framework);
  recommendations.push(...activities.slice(0, 4));
  
  // Recommendation: Address weakest area
  const sortedStyles = Object.entries(percentages)
    .sort(([, a], [, b]) => (a as number) - (b as number));
  
  if (sortedStyles.length > 0) {
    const weakestStyle = sortedStyles[0][0];
    const weakestPercentage = sortedStyles[0][1];
    
    if ((weakestPercentage as number) < 20) {
      recommendations.push(`Deliberately practice ${weakestStyle.toLowerCase()} approaches to build versatility - start with low-stakes situations to build confidence`);
    }
  }
  
  // Recommendation: Balance development
  const dominantPercentage = percentages[dominantStyle];
  if (dominantPercentage > 50) {
    recommendations.push('Challenge yourself to use alternative approaches at least once per week, even when your preferred style feels more comfortable');
  }
  
  // Recommendation: Collaboration strategy
  const complementaryStyles = Object.entries(percentages)
    .filter(([style, p]) => style !== dominantStyle && (p as number) < 25)
    .map(([style]) => style.toLowerCase());
  
  if (complementaryStyles.length > 0) {
    recommendations.push(`Partner with individuals strong in ${complementaryStyles.join(' or ')} styles to create well-rounded team dynamics`);
  }
  
  // Context-specific meta recommendation
  if (context === 'professional' && userProfile?.industrySector) {
    recommendations.push(`In ${userProfile.industrySector}, your ${dominantStyle.toLowerCase()} profile can be a differentiator - document and reflect on situations where it creates unique value`);
  } else if (context === 'university' || context === 'high-school') {
    recommendations.push('Use this self-knowledge to select courses, majors, and career paths that align with your natural cognitive strengths');
  }
  
  return recommendations.slice(0, 8); // Provide 8 actionable recommendations
};
