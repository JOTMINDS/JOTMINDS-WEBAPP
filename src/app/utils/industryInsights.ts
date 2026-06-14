import { IndustrySector, KolbStyle, SternbergStyle, DualProcessStyle } from '../types';

export interface IndustryInsight {
  sector: IndustrySector;
  keySkills: string[];
  relevantRoles: string[];
  cognitiveProfile: string;
  developmentTips: string[];
}

// Industry-specific insights based on cognitive profile
export const industryProfiles: Record<IndustrySector, IndustryInsight> = {
  Healthcare: {
    sector: 'Healthcare',
    keySkills: ['Patient care', 'Quick decision-making', 'Empathy', 'Attention to detail', 'Stress management'],
    relevantRoles: ['Doctor', 'Nurse', 'Healthcare Administrator', 'Medical Researcher', 'Pharmacist'],
    cognitiveProfile: 'Healthcare professionals need balanced analytical and intuitive thinking, with strong practical application skills.',
    developmentTips: [
      'Practice decision-making under pressure',
      'Develop patient communication skills',
      'Study evidence-based medicine',
      'Build stress resilience techniques',
    ],
  },
  'Educational Institutions': {
    sector: 'Educational Institutions',
    keySkills: ['Communication', 'Patience', 'Adaptability', 'Creativity', 'Assessment skills'],
    relevantRoles: ['Teacher', 'Education Administrator', 'Curriculum Developer', 'Academic Advisor', 'Trainer'],
    cognitiveProfile: 'Educators benefit from creative thinking combined with practical application and reflective observation.',
    developmentTips: [
      'Explore diverse teaching methodologies',
      'Practice active listening',
      'Develop lesson planning skills',
      'Study educational psychology',
    ],
  },
  Agriculture: {
    sector: 'Agriculture',
    keySkills: ['Problem-solving', 'Resource management', 'Sustainability thinking', 'Technical knowledge', 'Adaptability'],
    relevantRoles: ['Agronomist', 'Farm Manager', 'Agricultural Researcher', 'Extension Officer', 'Agribusiness Manager'],
    cognitiveProfile: 'Agriculture professionals need strong practical skills with analytical thinking for optimizing yields and sustainability.',
    developmentTips: [
      'Learn data-driven farming techniques',
      'Study climate adaptation strategies',
      'Develop business planning skills',
      'Practice hands-on experimentation',
    ],
  },
  Manufacturing: {
    sector: 'Manufacturing',
    keySkills: ['Process optimization', 'Quality control', 'Problem-solving', 'Systems thinking', 'Safety management'],
    relevantRoles: ['Production Manager', 'Quality Assurance Specialist', 'Industrial Engineer', 'Operations Manager', 'Supply Chain Coordinator'],
    cognitiveProfile: 'Manufacturing requires convergent thinking with strong analytical and practical skills for process improvement.',
    developmentTips: [
      'Study lean manufacturing principles',
      'Develop statistical analysis skills',
      'Practice root cause analysis',
      'Learn automation technologies',
    ],
  },
  'Financial Services': {
    sector: 'Financial Services',
    keySkills: ['Analytical thinking', 'Risk assessment', 'Precision', 'Data interpretation', 'Client relations'],
    relevantRoles: ['Financial Analyst', 'Accountant', 'Investment Advisor', 'Risk Manager', 'Auditor'],
    cognitiveProfile: 'Finance professionals excel with strong analytical thinking, reflective observation, and systematic decision-making.',
    developmentTips: [
      'Master financial modeling',
      'Study regulatory frameworks',
      'Develop data analysis skills',
      'Practice scenario planning',
    ],
  },
  Technology: {
    sector: 'Technology',
    keySkills: ['Innovation', 'Problem-solving', 'Continuous learning', 'Logical thinking', 'Collaboration'],
    relevantRoles: ['Software Developer', 'Data Scientist', 'IT Manager', 'UX Designer', 'Systems Architect'],
    cognitiveProfile: 'Tech professionals benefit from creative and analytical thinking with strong active experimentation skills.',
    developmentTips: [
      'Practice algorithmic thinking',
      'Build side projects',
      'Stay updated with emerging technologies',
      'Develop debugging methodologies',
    ],
  },
  Telecommunications: {
    sector: 'Telecommunications',
    keySkills: ['Technical expertise', 'Customer service', 'Network management', 'Problem-solving', 'Strategic planning'],
    relevantRoles: ['Network Engineer', 'Telecommunications Specialist', 'Customer Success Manager', 'Infrastructure Manager', 'Technical Support'],
    cognitiveProfile: 'Telecom professionals need balanced analytical and practical thinking with strong problem-solving abilities.',
    developmentTips: [
      'Master network protocols',
      'Develop troubleshooting frameworks',
      'Study emerging connectivity technologies',
      'Build customer communication skills',
    ],
  },
  'Retail & Distribution': {
    sector: 'Retail & Distribution',
    keySkills: ['Customer service', 'Inventory management', 'Sales strategy', 'Trend analysis', 'Team coordination'],
    relevantRoles: ['Store Manager', 'Buyer', 'Sales Representative', 'Merchandiser', 'Distribution Coordinator'],
    cognitiveProfile: 'Retail professionals excel with practical thinking, intuitive customer insights, and accommodating learning styles.',
    developmentTips: [
      'Study consumer behavior',
      'Develop inventory optimization skills',
      'Practice sales techniques',
      'Learn market trend analysis',
    ],
  },
  'Logistics & Transport': {
    sector: 'Logistics & Transport',
    keySkills: ['Planning', 'Route optimization', 'Time management', 'Problem-solving', 'Coordination'],
    relevantRoles: ['Logistics Manager', 'Supply Chain Analyst', 'Transport Coordinator', 'Warehouse Manager', 'Operations Planner'],
    cognitiveProfile: 'Logistics professionals need strong analytical and practical thinking with systematic planning abilities.',
    developmentTips: [
      'Master route optimization techniques',
      'Study supply chain management',
      'Develop contingency planning skills',
      'Learn logistics software systems',
    ],
  },
  'Hospitality & Tourism': {
    sector: 'Hospitality & Tourism',
    keySkills: ['Customer service', 'Cultural awareness', 'Flexibility', 'Communication', 'Event management'],
    relevantRoles: ['Hotel Manager', 'Event Coordinator', 'Tour Guide', 'Guest Relations Manager', 'Travel Consultant'],
    cognitiveProfile: 'Hospitality professionals benefit from diverging thinking with strong interpersonal and creative skills.',
    developmentTips: [
      'Develop cultural intelligence',
      'Practice conflict resolution',
      'Study customer experience design',
      'Build event planning expertise',
    ],
  },
  'Energy & Utilities': {
    sector: 'Energy & Utilities',
    keySkills: ['Technical knowledge', 'Safety management', 'Sustainability thinking', 'Regulatory compliance', 'Infrastructure planning'],
    relevantRoles: ['Energy Manager', 'Utilities Engineer', 'Sustainability Consultant', 'Plant Operator', 'Renewable Energy Specialist'],
    cognitiveProfile: 'Energy professionals need strong analytical thinking with practical application and long-term planning abilities.',
    developmentTips: [
      'Study renewable energy technologies',
      'Develop systems thinking',
      'Master safety protocols',
      'Learn energy efficiency optimization',
    ],
  },
  Other: {
    sector: 'Other',
    keySkills: ['Adaptability', 'Critical thinking', 'Communication', 'Problem-solving', 'Continuous learning'],
    relevantRoles: ['Various professional roles'],
    cognitiveProfile: 'Successful professionals across industries benefit from balanced cognitive abilities and growth mindset.',
    developmentTips: [
      'Identify your industry-specific requirements',
      'Develop transferable skills',
      'Practice continuous learning',
      'Build professional networks',
    ],
  },
};

export function getIndustryInsights(sector: IndustrySector): IndustryInsight {
  return industryProfiles[sector];
}

// Get personalized insights based on cognitive profile and industry
export function getPersonalizedIndustryInsights(
  sector: IndustrySector,
  kolbStyle?: KolbStyle,
  sternbergStyle?: SternbergStyle,
  dualProcessStyle?: DualProcessStyle
): string[] {
  const insights: string[] = [];
  const industryProfile = industryProfiles[sector];

  if (kolbStyle) {
    switch (sector) {
      case 'Healthcare':
        if (kolbStyle === 'Converging') {
          insights.push('Your converging style is ideal for medical diagnosis and treatment planning.');
        } else if (kolbStyle === 'Accommodating') {
          insights.push('Your accommodating style excels in patient care and emergency response.');
        }
        break;
      case 'Technology':
        if (kolbStyle === 'Assimilating') {
          insights.push('Your assimilating style is perfect for system design and architecture.');
        } else if (kolbStyle === 'Diverging') {
          insights.push('Your diverging style brings innovation to UX design and product development.');
        }
        break;
      case 'Financial Services':
        if (kolbStyle === 'Assimilating') {
          insights.push('Your assimilating style is excellent for financial modeling and risk analysis.');
        }
        break;
    }
  }

  if (sternbergStyle) {
    switch (sector) {
      case 'Manufacturing':
        if (sternbergStyle === 'Analytical') {
          insights.push('Your analytical thinking is valuable for quality control and process optimization.');
        } else if (sternbergStyle === 'Practical') {
          insights.push('Your practical skills excel in hands-on production management.');
        }
        break;
      case 'Retail & Distribution':
        if (sternbergStyle === 'Creative') {
          insights.push('Your creative thinking drives innovative merchandising and customer experiences.');
        } else if (sternbergStyle === 'Practical') {
          insights.push('Your practical approach is ideal for inventory management and store operations.');
        }
        break;
    }
  }

  if (dualProcessStyle) {
    switch (sector) {
      case 'Healthcare':
        if (dualProcessStyle === 'Balanced') {
          insights.push('Your balanced approach helps you make quick yet considered medical decisions.');
        }
        break;
      case 'Financial Services':
        if (dualProcessStyle === 'Reflective') {
          insights.push('Your reflective thinking is crucial for thorough financial analysis.');
        }
        break;
      case 'Hospitality & Tourism':
        if (dualProcessStyle === 'Intuitive') {
          insights.push('Your intuitive approach helps you read customers and anticipate their needs.');
        }
        break;
    }
  }

  // Add general industry insights
  insights.push(`In ${sector}, professionals typically need: ${industryProfile.keySkills.slice(0, 3).join(', ')}.`);

  return insights.length > 0 ? insights : [`Your cognitive profile can be valuable in various ${sector} roles.`];
}

// Get career growth recommendations based on industry
export function getIndustryCareerGrowth(
  sector: IndustrySector,
  currentRole?: string
): string[] {
  const recommendations: string[] = [];
  const industryProfile = industryProfiles[sector];

  recommendations.push(`Explore these ${sector} roles: ${industryProfile.relevantRoles.slice(0, 3).join(', ')}`);
  recommendations.push(...industryProfile.developmentTips.slice(0, 2));

  return recommendations;
}
