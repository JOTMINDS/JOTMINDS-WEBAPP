// Teacher Intelligence & School Analytics System
// Provides classroom insights, differentiated learning recommendations, and analytics

export interface StudentCognitiveProfile {
  userId: string;
  studentName: string;
  age: number;
  grade: string;
  cognitiveScores: {
    learningAgility: number;
    analyticalDepth: number;
    creativeCapacity: number;
    practicalExecution: number;
    intuitiveSpeed: number;
    reflectiveDepth: number;
  };
  archetype: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  thinkingStyle: 'analytical' | 'creative' | 'practical' | 'mixed';
  decisionStyle: 'intuitive' | 'reflective' | 'mixed';
  strengths: string[];
  challenges: string[];
  lastAssessment: string;
}

export interface ClassroomDistribution {
  totalStudents: number;
  learningStyles: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    mixed: number;
  };
  thinkingStyles: {
    analytical: number;
    creative: number;
    practical: number;
    mixed: number;
  };
  decisionStyles: {
    intuitive: number;
    reflective: number;
    mixed: number;
  };
  archetypes: Record<string, number>;
  averageScores: {
    learningAgility: number;
    analyticalDepth: number;
    creativeCapacity: number;
    practicalExecution: number;
    intuitiveSpeed: number;
    reflectiveDepth: number;
  };
  distribution: {
    highPerformers: number; // avg > 75
    midPerformers: number; // avg 50-75
    needsSupport: number; // avg < 50
  };
}

export interface DifferentiatedLessonPlan {
  id: string;
  subject: string;
  topic: string;
  grade: string;
  objectives: string[];
  duration: number; // minutes

  // Differentiated by learning style
  visualActivities: LessonActivity[];
  auditoryActivities: LessonActivity[];
  kinestheticActivities: LessonActivity[];

  // Differentiated by thinking style
  analyticalChallenges: LessonActivity[];
  creativeChallenges: LessonActivity[];
  practicalChallenges: LessonActivity[];

  // Assessment strategies
  assessmentMethods: AssessmentMethod[];

  // Support materials
  materials: string[];
  adaptations: Adaptation[];

  createdAt: string;
}

export interface LessonActivity {
  title: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  groupSize: 'individual' | 'pair' | 'small-group' | 'whole-class';
  materials: string[];
  instructions: string[];
}

export interface AssessmentMethod {
  type: 'quiz' | 'project' | 'presentation' | 'written' | 'practical' | 'discussion';
  description: string;
  suitableFor: string[]; // Learning/thinking styles
  rubric?: string;
}

export interface Adaptation {
  for: 'visual' | 'auditory' | 'kinesthetic' | 'high-performing' | 'needs-support';
  description: string;
  resources: string[];
}

export interface StudentRecommendation {
  studentId: string;
  studentName: string;
  recommendations: {
    teachingApproaches: string[];
    learningActivities: string[];
    assessmentMethods: string[];
    supportStrategies: string[];
    extensionActivities: string[];
  };
  peerPairingsSuggestions: Array<{
    partnerId: string;
    partnerName: string;
    reason: string;
  }>;
  parentCommunication: {
    strengths: string[];
    growthAreas: string[];
    homeSupport: string[];
  };
}

export interface ClassroomInsight {
  type: 'strength' | 'challenge' | 'opportunity' | 'alert';
  title: string;
  description: string;
  affectedStudents: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

// Analyze classroom cognitive distribution
export function analyzeClassroom(students: StudentCognitiveProfile[]): ClassroomDistribution {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      learningStyles: { visual: 0, auditory: 0, kinesthetic: 0, mixed: 0 },
      thinkingStyles: { analytical: 0, creative: 0, practical: 0, mixed: 0 },
      decisionStyles: { intuitive: 0, reflective: 0, mixed: 0 },
      archetypes: {},
      averageScores: {
        learningAgility: 0,
        analyticalDepth: 0,
        creativeCapacity: 0,
        practicalExecution: 0,
        intuitiveSpeed: 0,
        reflectiveDepth: 0,
      },
      distribution: { highPerformers: 0, midPerformers: 0, needsSupport: 0 },
    };
  }

  const learningStyles = { visual: 0, auditory: 0, kinesthetic: 0, mixed: 0 };
  const thinkingStyles = { analytical: 0, creative: 0, practical: 0, mixed: 0 };
  const decisionStyles = { intuitive: 0, reflective: 0, mixed: 0 };
  const archetypes: Record<string, number> = {};

  let totalScores = {
    learningAgility: 0,
    analyticalDepth: 0,
    creativeCapacity: 0,
    practicalExecution: 0,
    intuitiveSpeed: 0,
    reflectiveDepth: 0,
  };

  let highPerformers = 0;
  let midPerformers = 0;
  let needsSupport = 0;

  students.forEach(student => {
    // Count learning styles
    learningStyles[student.learningStyle]++;

    // Count thinking styles
    thinkingStyles[student.thinkingStyle]++;

    // Count decision styles
    decisionStyles[student.decisionStyle]++;

    // Count archetypes
    archetypes[student.archetype] = (archetypes[student.archetype] || 0) + 1;

    // Sum scores
    Object.keys(totalScores).forEach(key => {
      totalScores[key as keyof typeof totalScores] += student.cognitiveScores[key as keyof typeof student.cognitiveScores];
    });

    // Categorize performance
    const avgScore = Object.values(student.cognitiveScores).reduce((a, b) => a + b, 0) / 6;
    if (avgScore > 75) highPerformers++;
    else if (avgScore >= 50) midPerformers++;
    else needsSupport++;
  });

  const count = students.length;
  const averageScores = {
    learningAgility: Math.round(totalScores.learningAgility / count),
    analyticalDepth: Math.round(totalScores.analyticalDepth / count),
    creativeCapacity: Math.round(totalScores.creativeCapacity / count),
    practicalExecution: Math.round(totalScores.practicalExecution / count),
    intuitiveSpeed: Math.round(totalScores.intuitiveSpeed / count),
    reflectiveDepth: Math.round(totalScores.reflectiveDepth / count),
  };

  return {
    totalStudents: count,
    learningStyles,
    thinkingStyles,
    decisionStyles,
    archetypes,
    averageScores,
    distribution: { highPerformers, midPerformers, needsSupport },
  };
}

// Generate classroom insights
export function generateClassroomInsights(
  distribution: ClassroomDistribution,
  students: StudentCognitiveProfile[]
): ClassroomInsight[] {
  const insights: ClassroomInsight[] = [];

  // Check for dominant learning style
  const dominantLearning = Object.entries(distribution.learningStyles)
    .sort(([, a], [, b]) => b - a)[0];

  if (dominantLearning[1] > distribution.totalStudents * 0.5) {
    insights.push({
      type: 'opportunity',
      title: `${dominantLearning[0]} Learners Dominate`,
      description: `${Math.round((dominantLearning[1] / distribution.totalStudents) * 100)}% of students are ${dominantLearning[0]} learners`,
      affectedStudents: dominantLearning[1],
      recommendation: `Incorporate more ${dominantLearning[0]} activities, but ensure other learning styles are represented`,
      priority: 'medium',
    });
  }

  // Check for students needing support
  if (distribution.distribution.needsSupport > 0) {
    insights.push({
      type: 'alert',
      title: 'Students Need Additional Support',
      description: `${distribution.distribution.needsSupport} students scoring below 50 average`,
      affectedStudents: distribution.distribution.needsSupport,
      recommendation: 'Implement targeted interventions and differentiated support',
      priority: 'high',
    });
  }

  // Check for balanced class
  const learningBalance = Math.max(...Object.values(distribution.learningStyles)) / distribution.totalStudents;
  if (learningBalance < 0.4) {
    insights.push({
      type: 'strength',
      title: 'Well-Balanced Learning Styles',
      description: 'Class has diverse learning preferences',
      affectedStudents: distribution.totalStudents,
      recommendation: 'Use varied teaching methods to engage all learners',
      priority: 'low',
    });
  }

  // Check for thinking style gaps
  const lowAnalytical = distribution.averageScores.analyticalDepth < 50;
  const lowCreative = distribution.averageScores.creativeCapacity < 50;

  if (lowAnalytical) {
    insights.push({
      type: 'challenge',
      title: 'Analytical Thinking Needs Development',
      description: 'Class average analytical depth is below 50',
      affectedStudents: students.filter(s => s.cognitiveScores.analyticalDepth < 50).length,
      recommendation: 'Incorporate more problem-solving and logic-based activities',
      priority: 'high',
    });
  }

  if (lowCreative) {
    insights.push({
      type: 'challenge',
      title: 'Creative Thinking Needs Development',
      description: 'Class average creative capacity is below 50',
      affectedStudents: students.filter(s => s.cognitiveScores.creativeCapacity < 50).length,
      recommendation: 'Add more open-ended projects and creative challenges',
      priority: 'high',
    });
  }

  return insights;
}

// Generate student-specific recommendations
export function generateStudentRecommendations(
  student: StudentCognitiveProfile,
  classmates: StudentCognitiveProfile[]
): StudentRecommendation {
  const recommendations: StudentRecommendation = {
    studentId: student.userId,
    studentName: student.studentName,
    recommendations: {
      teachingApproaches: [],
      learningActivities: [],
      assessmentMethods: [],
      supportStrategies: [],
      extensionActivities: [],
    },
    peerPairingsSuggestions: [],
    parentCommunication: {
      strengths: student.strengths.slice(0, 3),
      growthAreas: student.challenges.slice(0, 3),
      homeSupport: [],
    },
  };

  // Teaching approaches based on learning style
  switch (student.learningStyle) {
    case 'visual':
      recommendations.recommendations.teachingApproaches.push(
        'Use diagrams, charts, and visual aids',
        'Provide written instructions and notes',
        'Encourage mind mapping and concept visualization'
      );
      break;
    case 'auditory':
      recommendations.recommendations.teachingApproaches.push(
        'Use verbal explanations and discussions',
        'Incorporate podcasts and audio materials',
        'Encourage reading aloud and verbal summaries'
      );
      break;
    case 'kinesthetic':
      recommendations.recommendations.teachingApproaches.push(
        'Include hands-on activities and experiments',
        'Allow movement breaks and active learning',
        'Use physical manipulatives and role-play'
      );
      break;
  }

  // Learning activities based on thinking style
  switch (student.thinkingStyle) {
    case 'analytical':
      recommendations.recommendations.learningActivities.push(
        'Logic puzzles and problem-solving tasks',
        'Data analysis and research projects',
        'Step-by-step systematic approaches'
      );
      break;
    case 'creative':
      recommendations.recommendations.learningActivities.push(
        'Open-ended projects and brainstorming',
        'Art integration and creative writing',
        'Design thinking challenges'
      );
      break;
    case 'practical':
      recommendations.recommendations.learningActivities.push(
        'Real-world applications and case studies',
        'Hands-on projects with tangible outcomes',
        'Community-based learning'
      );
      break;
  }

  // Assessment methods
  const avgScore = Object.values(student.cognitiveScores).reduce((a, b) => a + b, 0) / 6;

  if (avgScore > 75) {
    recommendations.recommendations.assessmentMethods.push(
      'Independent projects',
      'Advanced problem-solving tasks',
      'Peer teaching opportunities'
    );
    recommendations.recommendations.extensionActivities.push(
      'Leadership roles in group work',
      'Advanced reading materials',
      'Mentoring other students'
    );
  } else if (avgScore < 50) {
    recommendations.recommendations.supportStrategies.push(
      'Additional one-on-one time',
      'Scaffolded learning materials',
      'Frequent check-ins and feedback',
      'Small group instruction'
    );
  }

  // Peer pairing suggestions (complementary cognitive profiles)
  const complementaryPeers = classmates
    .filter(c => c.userId !== student.userId)
    .map(peer => {
      let score = 0;
      let reasons: string[] = [];

      // Complement learning style
      if (peer.learningStyle !== student.learningStyle) {
        score += 2;
        reasons.push(`Different learning style (${peer.learningStyle})`);
      }

      // Balance thinking style
      if (
        (student.thinkingStyle === 'analytical' && peer.thinkingStyle === 'creative') ||
        (student.thinkingStyle === 'creative' && peer.thinkingStyle === 'analytical')
      ) {
        score += 3;
        reasons.push('Complementary thinking styles');
      }

      // Similar performance level
      const studentAvg = Object.values(student.cognitiveScores).reduce((a, b) => a + b, 0) / 6;
      const peerAvg = Object.values(peer.cognitiveScores).reduce((a, b) => a + b, 0) / 6;
      if (Math.abs(studentAvg - peerAvg) < 15) {
        score += 1;
        reasons.push('Similar performance level');
      }

      return { peer, score, reasons: reasons.join(', ') };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  recommendations.peerPairingsSuggestions = complementaryPeers.map(({ peer, reasons }) => ({
    partnerId: peer.userId,
    partnerName: peer.studentName,
    reason: reasons,
  }));

  // Parent communication suggestions
  recommendations.parentCommunication.homeSupport = [
    `Encourage ${student.learningStyle} learning at home`,
    `Practice ${student.thinkingStyle} thinking through everyday activities`,
    'Maintain consistent learning routines',
  ];

  if (student.cognitiveScores.learningAgility < 50) {
    recommendations.parentCommunication.homeSupport.push(
      'Review new concepts multiple times',
      'Break learning into smaller chunks'
    );
  }

  return recommendations;
}

// Generate differentiated lesson plan
export function generateDifferentiatedLesson(
  subject: string,
  topic: string,
  grade: string,
  classDistribution: ClassroomDistribution
): DifferentiatedLessonPlan {
  // This would be enhanced with AI in production
  // For now, we'll return a template structure

  return {
    id: `lesson_${Date.now()}`,
    subject,
    topic,
    grade,
    objectives: [
      `Understand key concepts of ${topic}`,
      'Apply learning through practical activities',
      'Demonstrate mastery through assessment',
    ],
    duration: 60,

    visualActivities: [
      {
        title: 'Visual Concept Mapping',
        description: 'Create a visual diagram of the main concepts',
        duration: 15,
        difficulty: 'medium',
        groupSize: 'pair',
        materials: ['Paper', 'Colored markers', 'Concept templates'],
        instructions: [
          'Review the main concepts',
          'Sketch the relationships between ideas',
          'Add colors and symbols to represent connections',
          'Present your map to the class',
        ],
      },
    ],

    auditoryActivities: [
      {
        title: 'Think-Pair-Share Discussion',
        description: 'Discuss concepts with a partner and share with class',
        duration: 15,
        difficulty: 'easy',
        groupSize: 'pair',
        materials: ['Discussion prompts'],
        instructions: [
          'Think individually about the question',
          'Discuss with your partner',
          'Share key points with the class',
        ],
      },
    ],

    kinestheticActivities: [
      {
        title: 'Hands-On Demonstration',
        description: 'Act out or build models of concepts',
        duration: 20,
        difficulty: 'medium',
        groupSize: 'small-group',
        materials: ['Building materials', 'Props', 'Workspace'],
        instructions: [
          'Review the concept',
          'Plan your demonstration',
          'Create your model or act it out',
          'Explain your creation to others',
        ],
      },
    ],

    analyticalChallenges: [
      {
        title: 'Problem-Solving Challenge',
        description: 'Solve a complex problem using systematic thinking',
        duration: 20,
        difficulty: 'hard',
        groupSize: 'individual',
        materials: ['Problem worksheets', 'Graph paper'],
        instructions: [
          'Read the problem carefully',
          'Identify known and unknown variables',
          'Develop a step-by-step solution',
          'Verify your answer',
        ],
      },
    ],

    creativeChallenges: [
      {
        title: 'Creative Project',
        description: 'Design an original solution or creation',
        duration: 25,
        difficulty: 'hard',
        groupSize: 'pair',
        materials: ['Art supplies', 'Building materials', 'Technology'],
        instructions: [
          'Brainstorm creative ideas',
          'Sketch your design',
          'Build or create your project',
          'Present your innovation',
        ],
      },
    ],

    practicalChallenges: [
      {
        title: 'Real-World Application',
        description: 'Apply concepts to a real-world scenario',
        duration: 20,
        difficulty: 'medium',
        groupSize: 'small-group',
        materials: ['Case study materials', 'Planning sheets'],
        instructions: [
          'Review the real-world scenario',
          'Identify how concepts apply',
          'Develop a practical solution',
          'Present your approach',
        ],
      },
    ],

    assessmentMethods: [
      {
        type: 'quiz',
        description: 'Short formative assessment',
        suitableFor: ['analytical', 'reflective'],
      },
      {
        type: 'project',
        description: 'Creative demonstration of understanding',
        suitableFor: ['creative', 'kinesthetic', 'practical'],
      },
      {
        type: 'presentation',
        description: 'Verbal explanation of concepts',
        suitableFor: ['auditory', 'creative'],
      },
    ],

    materials: [
      'Whiteboard and markers',
      'Student handouts',
      'Visual aids',
      'Manipulatives',
      'Technology (tablets/computers)',
    ],

    adaptations: [
      {
        for: 'needs-support',
        description: 'Provide scaffolded notes and extended time',
        resources: ['Guided notes template', 'Simplified instructions'],
      },
      {
        for: 'high-performing',
        description: 'Offer extension challenges and leadership roles',
        resources: ['Advanced problems', 'Peer teaching opportunities'],
      },
    ],

    createdAt: new Date().toISOString(),
  };
}
