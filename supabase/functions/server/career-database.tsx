// Career Database with Required Cognitive Profiles
// Each career has a required profile across 10 dimensions (0-100 scale)

export interface CareerProfile {
  careerId: string;
  title: string;
  category: string;
  description: string;
  requiredProfile: {
    learningAgility: number;
    analyticalDepth: number;
    creativeCapacity: number;
    practicalExecution: number;
    intuitiveSpeed: number;
    reflectiveDepth: number;
    cognitiveFlexibility: number;
    innovationPotential: number;
    executionCapability: number;
    metacognitiveAwareness: number;
  };
  typicalPersona: string;
  growthPath: string[];
}

export const CAREER_DATABASE: CareerProfile[] = [
  // STEM Careers
  {
    careerId: 'software-engineer',
    title: 'Software Engineer',
    category: 'Technology',
    description: 'Design, develop, and maintain software applications and systems',
    requiredProfile: {
      learningAgility: 75,
      analyticalDepth: 85,
      creativeCapacity: 60,
      practicalExecution: 80,
      intuitiveSpeed: 50,
      reflectiveDepth: 75,
      cognitiveFlexibility: 70,
      innovationPotential: 65,
      executionCapability: 85,
      metacognitiveAwareness: 70
    },
    typicalPersona: 'Systematic Analyzer with strong execution',
    growthPath: ['Junior Developer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager']
  },

  {
    careerId: 'data-scientist',
    title: 'Data Scientist',
    category: 'Technology',
    description: 'Extract insights from data using statistical analysis and machine learning',
    requiredProfile: {
      learningAgility: 70,
      analyticalDepth: 95,
      creativeCapacity: 50,
      practicalExecution: 70,
      intuitiveSpeed: 40,
      reflectiveDepth: 90,
      cognitiveFlexibility: 65,
      innovationPotential: 55,
      executionCapability: 70,
      metacognitiveAwareness: 75
    },
    typicalPersona: 'Deep Deliberator with analytical mastery',
    growthPath: ['Data Analyst', 'Data Scientist', 'Senior Data Scientist', 'Chief Data Officer']
  },

  {
    careerId: 'product-designer',
    title: 'Product Designer (UX/UI)',
    category: 'Design',
    description: 'Create user-centered digital experiences and interfaces',
    requiredProfile: {
      learningAgility: 70,
      analyticalDepth: 60,
      creativeCapacity: 90,
      practicalExecution: 75,
      intuitiveSpeed: 80,
      reflectiveDepth: 55,
      cognitiveFlexibility: 80,
      innovationPotential: 85,
      executionCapability: 75,
      metacognitiveAwareness: 65
    },
    typicalPersona: 'Innovative Explorer with strong intuition',
    growthPath: ['Junior Designer', 'Product Designer', 'Senior Designer', 'Design Director']
  },

  {
    careerId: 'product-manager',
    title: 'Product Manager',
    category: 'Business',
    description: 'Define product strategy and guide cross-functional teams',
    requiredProfile: {
      learningAgility: 80,
      analyticalDepth: 75,
      creativeCapacity: 70,
      practicalExecution: 85,
      intuitiveSpeed: 75,
      reflectiveDepth: 70,
      cognitiveFlexibility: 85,
      innovationPotential: 70,
      executionCapability: 90,
      metacognitiveAwareness: 80
    },
    typicalPersona: 'Versatile Thinker with execution focus',
    growthPath: ['Associate PM', 'Product Manager', 'Senior PM', 'VP of Product']
  },

  {
    careerId: 'research-scientist',
    title: 'Research Scientist',
    category: 'Science',
    description: 'Conduct original research to advance scientific knowledge',
    requiredProfile: {
      learningAgility: 75,
      analyticalDepth: 95,
      creativeCapacity: 80,
      practicalExecution: 60,
      intuitiveSpeed: 45,
      reflectiveDepth: 95,
      cognitiveFlexibility: 70,
      innovationPotential: 85,
      executionCapability: 65,
      metacognitiveAwareness: 85
    },
    typicalPersona: 'Conceptual Theorist with creative depth',
    growthPath: ['Research Associate', 'Scientist', 'Senior Scientist', 'Principal Investigator']
  },

  // Creative Careers
  {
    careerId: 'entrepreneur',
    title: 'Entrepreneur / Startup Founder',
    category: 'Business',
    description: 'Build and scale new businesses from the ground up',
    requiredProfile: {
      learningAgility: 90,
      analyticalDepth: 65,
      creativeCapacity: 85,
      practicalExecution: 90,
      intuitiveSpeed: 90,
      reflectiveDepth: 55,
      cognitiveFlexibility: 95,
      innovationPotential: 90,
      executionCapability: 95,
      metacognitiveAwareness: 75
    },
    typicalPersona: 'Action-Oriented Intuitive with innovation drive',
    growthPath: ['Founder', 'CEO', 'Serial Entrepreneur', 'Venture Partner']
  },

  {
    careerId: 'marketing-strategist',
    title: 'Marketing Strategist',
    category: 'Marketing',
    description: 'Develop and execute marketing campaigns to drive growth',
    requiredProfile: {
      learningAgility: 75,
      analyticalDepth: 70,
      creativeCapacity: 85,
      practicalExecution: 80,
      intuitiveSpeed: 75,
      reflectiveDepth: 60,
      cognitiveFlexibility: 80,
      innovationPotential: 80,
      executionCapability: 85,
      metacognitiveAwareness: 70
    },
    typicalPersona: 'Creative Synthesizer with practical edge',
    growthPath: ['Marketing Coordinator', 'Marketing Manager', 'Director', 'CMO']
  },

  {
    careerId: 'writer-author',
    title: 'Writer / Author',
    category: 'Creative',
    description: 'Create original written content, stories, and narratives',
    requiredProfile: {
      learningAgility: 65,
      analyticalDepth: 60,
      creativeCapacity: 95,
      practicalExecution: 70,
      intuitiveSpeed: 80,
      reflectiveDepth: 75,
      cognitiveFlexibility: 70,
      innovationPotential: 90,
      executionCapability: 70,
      metacognitiveAwareness: 80
    },
    typicalPersona: 'Innovative Explorer with reflective depth',
    growthPath: ['Freelance Writer', 'Published Author', 'Bestselling Author', 'Literary Icon']
  },

  // Professional Services
  {
    careerId: 'management-consultant',
    title: 'Management Consultant',
    category: 'Consulting',
    description: 'Advise organizations on strategy, operations, and transformation',
    requiredProfile: {
      learningAgility: 85,
      analyticalDepth: 90,
      creativeCapacity: 70,
      practicalExecution: 85,
      intuitiveSpeed: 65,
      reflectiveDepth: 80,
      cognitiveFlexibility: 90,
      innovationPotential: 70,
      executionCapability: 85,
      metacognitiveAwareness: 85
    },
    typicalPersona: 'Versatile Thinker with analytical strength',
    growthPath: ['Analyst', 'Consultant', 'Manager', 'Partner']
  },

  {
    careerId: 'project-manager',
    title: 'Project Manager',
    category: 'Operations',
    description: 'Plan, execute, and deliver projects on time and within budget',
    requiredProfile: {
      learningAgility: 70,
      analyticalDepth: 70,
      creativeCapacity: 55,
      practicalExecution: 95,
      intuitiveSpeed: 60,
      reflectiveDepth: 65,
      cognitiveFlexibility: 75,
      innovationPotential: 50,
      executionCapability: 95,
      metacognitiveAwareness: 75
    },
    typicalPersona: 'Pragmatic Builder with execution mastery',
    growthPath: ['Coordinator', 'Project Manager', 'Program Manager', 'PMO Director']
  },

  // Education & Healthcare
  {
    careerId: 'teacher-educator',
    title: 'Teacher / Educator',
    category: 'Education',
    description: 'Educate and mentor students across various subjects',
    requiredProfile: {
      learningAgility: 75,
      analyticalDepth: 65,
      creativeCapacity: 70,
      practicalExecution: 75,
      intuitiveSpeed: 70,
      reflectiveDepth: 75,
      cognitiveFlexibility: 80,
      innovationPotential: 65,
      executionCapability: 75,
      metacognitiveAwareness: 85
    },
    typicalPersona: 'Balanced Generalist with metacognitive strength',
    growthPath: ['Teacher', 'Lead Teacher', 'Department Head', 'Principal']
  },

  {
    careerId: 'clinical-psychologist',
    title: 'Clinical Psychologist',
    category: 'Healthcare',
    description: 'Assess and treat mental health conditions through therapy',
    requiredProfile: {
      learningAgility: 70,
      analyticalDepth: 80,
      creativeCapacity: 65,
      practicalExecution: 70,
      intuitiveSpeed: 75,
      reflectiveDepth: 90,
      cognitiveFlexibility: 75,
      innovationPotential: 60,
      executionCapability: 70,
      metacognitiveAwareness: 95
    },
    typicalPersona: 'Deep Deliberator with exceptional self-awareness',
    growthPath: ['Intern', 'Licensed Psychologist', 'Senior Psychologist', 'Clinical Director']
  },

  // Additional High-Demand Careers
  {
    careerId: 'financial-analyst',
    title: 'Financial Analyst',
    category: 'Finance',
    description: 'Analyze financial data to guide investment and business decisions',
    requiredProfile: {
      learningAgility: 70,
      analyticalDepth: 90,
      creativeCapacity: 50,
      practicalExecution: 80,
      intuitiveSpeed: 55,
      reflectiveDepth: 85,
      cognitiveFlexibility: 65,
      innovationPotential: 50,
      executionCapability: 80,
      metacognitiveAwareness: 75
    },
    typicalPersona: 'Systematic Analyzer with practical focus',
    growthPath: ['Analyst', 'Senior Analyst', 'Associate', 'Portfolio Manager']
  },

  {
    careerId: 'sales-executive',
    title: 'Sales Executive',
    category: 'Sales',
    description: 'Build relationships and close deals to drive revenue growth',
    requiredProfile: {
      learningAgility: 75,
      analyticalDepth: 60,
      creativeCapacity: 70,
      practicalExecution: 85,
      intuitiveSpeed: 90,
      reflectiveDepth: 50,
      cognitiveFlexibility: 80,
      innovationPotential: 65,
      executionCapability: 90,
      metacognitiveAwareness: 70
    },
    typicalPersona: 'Action-Oriented Intuitive with people skills',
    growthPath: ['Sales Rep', 'Account Executive', 'Sales Manager', 'VP of Sales']
  },

  {
    careerId: 'architect',
    title: 'Architect',
    category: 'Design',
    description: 'Design buildings and spaces that are functional and aesthetically pleasing',
    requiredProfile: {
      learningAgility: 70,
      analyticalDepth: 75,
      creativeCapacity: 90,
      practicalExecution: 80,
      intuitiveSpeed: 65,
      reflectiveDepth: 70,
      cognitiveFlexibility: 75,
      innovationPotential: 85,
      executionCapability: 80,
      metacognitiveAwareness: 70
    },
    typicalPersona: 'Creative Synthesizer with technical skills',
    growthPath: ['Intern Architect', 'Licensed Architect', 'Senior Architect', 'Principal']
  },

  {
    careerId: 'mechanical-engineer',
    title: 'Mechanical Engineer',
    category: 'Engineering',
    description: 'Design and develop mechanical systems and devices',
    requiredProfile: {
      learningAgility: 70,
      analyticalDepth: 85,
      creativeCapacity: 60,
      practicalExecution: 90,
      intuitiveSpeed: 50,
      reflectiveDepth: 75,
      cognitiveFlexibility: 65,
      innovationPotential: 65,
      executionCapability: 90,
      metacognitiveAwareness: 70
    },
    typicalPersona: 'Pragmatic Builder with analytical rigor',
    growthPath: ['Junior Engineer', 'Engineer', 'Senior Engineer', 'Engineering Director']
  },

  {
    careerId: 'journalist',
    title: 'Journalist',
    category: 'Media',
    description: 'Investigate and report on news stories and current events',
    requiredProfile: {
      learningAgility: 80,
      analyticalDepth: 75,
      creativeCapacity: 75,
      practicalExecution: 75,
      intuitiveSpeed: 80,
      reflectiveDepth: 70,
      cognitiveFlexibility: 85,
      innovationPotential: 70,
      executionCapability: 80,
      metacognitiveAwareness: 75
    },
    typicalPersona: 'Versatile Thinker with quick adaptability',
    growthPath: ['Reporter', 'Journalist', 'Senior Correspondent', 'Editor-in-Chief']
  },

  {
    careerId: 'lawyer',
    title: 'Lawyer / Attorney',
    category: 'Legal',
    description: 'Represent clients and provide legal counsel',
    requiredProfile: {
      learningAgility: 75,
      analyticalDepth: 95,
      creativeCapacity: 60,
      practicalExecution: 80,
      intuitiveSpeed: 60,
      reflectiveDepth: 90,
      cognitiveFlexibility: 70,
      innovationPotential: 55,
      executionCapability: 80,
      metacognitiveAwareness: 85
    },
    typicalPersona: 'Systematic Analyzer with reflective depth',
    growthPath: ['Associate', 'Attorney', 'Senior Associate', 'Partner']
  },

  {
    careerId: 'human-resources',
    title: 'HR Business Partner',
    category: 'Human Resources',
    description: 'Manage talent, culture, and organizational development',
    requiredProfile: {
      learningAgility: 75,
      analyticalDepth: 65,
      creativeCapacity: 65,
      practicalExecution: 80,
      intuitiveSpeed: 75,
      reflectiveDepth: 70,
      cognitiveFlexibility: 85,
      innovationPotential: 60,
      executionCapability: 80,
      metacognitiveAwareness: 85
    },
    typicalPersona: 'Balanced Generalist with people focus',
    growthPath: ['HR Generalist', 'HR Business Partner', 'HR Director', 'CHRO']
  },

  {
    careerId: 'ai-ml-engineer',
    title: 'AI/ML Engineer',
    category: 'Technology',
    description: 'Build and deploy artificial intelligence and machine learning systems',
    requiredProfile: {
      learningAgility: 85,
      analyticalDepth: 95,
      creativeCapacity: 75,
      practicalExecution: 80,
      intuitiveSpeed: 55,
      reflectiveDepth: 85,
      cognitiveFlexibility: 75,
      innovationPotential: 80,
      executionCapability: 85,
      metacognitiveAwareness: 75
    },
    typicalPersona: 'Systematic Analyzer with innovation drive',
    growthPath: ['ML Engineer', 'Senior ML Engineer', 'ML Architect', 'AI Research Lead']
  },

  {
    careerId: 'chef',
    title: 'Chef / Culinary Artist',
    category: 'Culinary',
    description: 'Create innovative dishes and manage kitchen operations',
    requiredProfile: {
      learningAgility: 70,
      analyticalDepth: 55,
      creativeCapacity: 90,
      practicalExecution: 85,
      intuitiveSpeed: 85,
      reflectiveDepth: 50,
      cognitiveFlexibility: 75,
      innovationPotential: 85,
      executionCapability: 90,
      metacognitiveAwareness: 65
    },
    typicalPersona: 'Innovative Explorer with execution mastery',
    growthPath: ['Line Cook', 'Sous Chef', 'Executive Chef', 'Restaurant Owner']
  }
];
