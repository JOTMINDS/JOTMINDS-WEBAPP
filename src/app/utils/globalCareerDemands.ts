import { RoleCognitiveDemand } from './cognitiveRoleFitEngine';

export interface GlobalCareer {
  id: string;
  title: string;
  category: string;
  description: string;
  demands: RoleCognitiveDemand;
}

export const GLOBAL_CAREERS: GlobalCareer[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'Technology',
    description: 'Design, develop, and maintain complex software systems. Requires deep analytical thinking and tolerance for ambiguity when solving undocumented problems.',
    demands: {
      analyticalDepth: 9,
      ambiguityTolerance: 7,
      emotionalLaborLoad: 3,
      decisionSpeed: 6,
      stakeholderComplexity: 5,
      repetitionVsInnovation: 8,
      socialExposure: 4,
      detailSensitivity: 9,
      autonomyRequired: 7,
      cognitiveLoadVolatility: 6
    }
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    category: 'Business & Tech',
    description: 'Guide the success of a product and lead the cross-functional team that is responsible for improving it. Requires managing diverse stakeholders and high cognitive volatility.',
    demands: {
      analyticalDepth: 7,
      ambiguityTolerance: 9,
      emotionalLaborLoad: 7,
      decisionSpeed: 8,
      stakeholderComplexity: 9,
      repetitionVsInnovation: 8,
      socialExposure: 8,
      detailSensitivity: 6,
      autonomyRequired: 8,
      cognitiveLoadVolatility: 9
    }
  },
  {
    id: 'counseling-psychologist',
    title: 'Counseling Psychologist',
    category: 'Healthcare',
    description: 'Help individuals understand their emotions and navigate life challenges. Requires immense emotional labor and strong social exposure.',
    demands: {
      analyticalDepth: 6,
      ambiguityTolerance: 8,
      emotionalLaborLoad: 10,
      decisionSpeed: 4,
      stakeholderComplexity: 7,
      repetitionVsInnovation: 5,
      socialExposure: 9,
      detailSensitivity: 7,
      autonomyRequired: 8,
      cognitiveLoadVolatility: 7
    }
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data & Analytics',
    description: 'Review data to identify key insights and build visualizations. Requires high detail sensitivity and analytical depth, with less social exposure.',
    demands: {
      analyticalDepth: 9,
      ambiguityTolerance: 5,
      emotionalLaborLoad: 2,
      decisionSpeed: 5,
      stakeholderComplexity: 4,
      repetitionVsInnovation: 6,
      socialExposure: 3,
      detailSensitivity: 9,
      autonomyRequired: 6,
      cognitiveLoadVolatility: 4
    }
  },
  {
    id: 'marketing-strategist',
    title: 'Marketing Strategist',
    category: 'Business',
    description: 'Develop marketing campaigns and brand positioning. Requires high innovation, social exposure, and the ability to process ambiguous market trends.',
    demands: {
      analyticalDepth: 6,
      ambiguityTolerance: 8,
      emotionalLaborLoad: 6,
      decisionSpeed: 7,
      stakeholderComplexity: 8,
      repetitionVsInnovation: 9,
      socialExposure: 7,
      detailSensitivity: 5,
      autonomyRequired: 7,
      cognitiveLoadVolatility: 8
    }
  },
  {
    id: 'healthcare-administrator',
    title: 'Healthcare Administrator',
    category: 'Healthcare',
    description: 'Manage clinical facilities and hospital operations. Requires managing complex stakeholders, high decision speed, and high detail sensitivity.',
    demands: {
      analyticalDepth: 7,
      ambiguityTolerance: 7,
      emotionalLaborLoad: 8,
      decisionSpeed: 9,
      stakeholderComplexity: 10,
      repetitionVsInnovation: 4,
      socialExposure: 8,
      detailSensitivity: 8,
      autonomyRequired: 8,
      cognitiveLoadVolatility: 9
    }
  },
  {
    id: 'financial-auditor',
    title: 'Financial Auditor',
    category: 'Finance',
    description: 'Examine financial statements to ensure accuracy and compliance. Requires extreme detail sensitivity and low ambiguity tolerance.',
    demands: {
      analyticalDepth: 8,
      ambiguityTolerance: 2,
      emotionalLaborLoad: 3,
      decisionSpeed: 4,
      stakeholderComplexity: 5,
      repetitionVsInnovation: 2,
      socialExposure: 4,
      detailSensitivity: 10,
      autonomyRequired: 7,
      cognitiveLoadVolatility: 4
    }
  },
  {
    id: 'creative-director',
    title: 'Creative Director',
    category: 'Arts & Design',
    description: 'Lead the creative vision of projects and design teams. Requires extremely high innovation potential and tolerance for ambiguity.',
    demands: {
      analyticalDepth: 4,
      ambiguityTolerance: 9,
      emotionalLaborLoad: 6,
      decisionSpeed: 7,
      stakeholderComplexity: 7,
      repetitionVsInnovation: 10,
      socialExposure: 7,
      detailSensitivity: 6,
      autonomyRequired: 9,
      cognitiveLoadVolatility: 8
    }
  }
];
