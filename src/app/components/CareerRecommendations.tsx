import { useState, useMemo } from 'react';
import { Briefcase, ExternalLink, BookOpen, Target, Sparkles, TrendingUp, Clock, DollarSign, Lightbulb, Calendar, Link as LinkIcon, Search, Filter, Heart, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { generateSkillPlan } from '../utils/skillPlanApi';
import { toast } from 'sonner';
import { recordCareerExploration, recordCareerFavorite } from '../utils/gamification';
import { useAuth } from './AuthContext';
import { celebrateLevelUp, celebrateBadgeUnlock } from '../utils/confettiAnimations';
import { getCareerDisclaimer } from '../utils/reportTextVariations';

interface Career {
  title: string;
  description: string;
  whySuitsYou: string;
  skillsNeeded: string[];
  howToBuildSkills: string[];
  ghanaRelevance?: string;
  recommendedDimension?: string;
  detailedDescription?: string;
  typicalSalaryRange?: string;
  workEnvironment?: string;
  careerGrowth?: string;
  interviewTips?: string[];
  dayInLife?: string[];
  resourceLinks?: Array<{ title: string; url: string }>;
}

interface CareerRecommendationsProps {
  cognitiveStyle: string;
  assessmentType: string;
  onNavigateToSkillBuilder?: (dimensionId: string) => void;
}

export function CareerRecommendations({ cognitiveStyle, assessmentType, onNavigateToSkillBuilder }: CareerRecommendationsProps) {
  const { user } = useAuth();
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedDimension, setSelectedDimension] = useState<string>('all');

  const getCareers = (): Career[] => {
    // Kolb Learning Styles
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          return [
            {
              title: 'Counseling Psychologist',
              description: 'Help individuals understand their emotions and navigate life challenges',
              whySuitsYou: 'Your ability to see multiple perspectives and empathize with others makes you excellent at understanding people\'s experiences and guiding them toward solutions.',
              skillsNeeded: ['Active listening', 'Emotional intelligence', 'Communication', 'Patience'],
              howToBuildSkills: [
                'Take psychology courses',
                'Volunteer at student counseling centers',
                'Practice reflective journaling',
                'Join peer support groups'
              ],
              ghanaRelevance: 'Growing demand in schools, hospitals, and NGOs across Ghana',
              recommendedDimension: 'emotional_regulation'
            },
            {
              title: 'Human Resources Manager',
              description: 'Manage employee relations, recruitment, and organizational culture',
              whySuitsYou: 'Your reflective nature and people-centered approach help you understand diverse viewpoints and create inclusive workplace environments.',
              skillsNeeded: ['Interpersonal skills', 'Conflict resolution', 'Organizational skills', 'Empathy'],
              howToBuildSkills: [
                'Study organizational behavior',
                'Join student leadership roles',
                'Participate in mediation training',
                'Intern with HR departments'
              ],
              ghanaRelevance: 'Essential in all medium to large companies and government institutions',
              recommendedDimension: 'emotional_regulation'
            },
            {
              title: 'Social Worker',
              description: 'Support vulnerable communities and advocate for social justice',
              whySuitsYou: 'Your ability to listen deeply and understand complex human situations makes you naturally suited for community support work.',
              skillsNeeded: ['Empathy', 'Cultural awareness', 'Advocacy', 'Problem-solving'],
              howToBuildSkills: [
                'Volunteer with local NGOs',
                'Study social work or sociology',
                'Engage in community service',
                'Learn about social justice issues'
              ],
              ghanaRelevance: 'High demand in NGOs, government agencies, and community organizations',
              recommendedDimension: 'emotional_regulation'
            }
          ];
        
        case 'assimilating':
          return [
            {
              title: 'Research Scientist',
              description: 'Conduct systematic research to advance knowledge in your field',
              whySuitsYou: 'Your love for theories, logical thinking, and structured analysis makes you perfect for systematic research and discovery.',
              skillsNeeded: ['Analytical thinking', 'Research methodology', 'Data analysis', 'Technical writing'],
              howToBuildSkills: [
                'Engage in undergraduate research projects',
                'Learn statistical analysis tools',
                'Read academic journals regularly',
                'Present at student research conferences'
              ],
              ghanaRelevance: 'Opportunities in universities, research institutes like CSIR, and international organizations',
              recommendedDimension: 'problem_solving'
            },
            {
              title: 'Data Analyst',
              description: 'Transform complex data into actionable business insights',
              whySuitsYou: 'Your ability to organize information logically and identify patterns makes you excellent at extracting meaning from data.',
              skillsNeeded: ['Statistical analysis', 'Programming (Python/R)', 'Data visualization', 'Critical thinking'],
              howToBuildSkills: [
                'Learn Excel, Python, or R',
                'Take online courses in data science',
                'Practice with real datasets',
                'Build a portfolio of analysis projects'
              ],
              ghanaRelevance: 'Growing field in banks, telecom companies, and tech startups',
              recommendedDimension: 'problem_solving'
            },
            {
              title: 'University Lecturer',
              description: 'Teach and conduct research in academic institutions',
              whySuitsYou: 'Your preference for conceptual thinking and structured knowledge makes you ideal for academic teaching and scholarship.',
              skillsNeeded: ['Subject expertise', 'Presentation skills', 'Research abilities', 'Patience'],
              howToBuildSkills: [
                'Excel academically in your major',
                'Pursue graduate studies',
                'Assist professors with research',
                'Practice teaching peers'
              ],
              ghanaRelevance: 'Universities and polytechnics nationwide seek qualified lecturers',
              recommendedDimension: 'metacognition'
            }
          ];

        case 'converging':
          return [
            {
              title: 'Software Engineer',
              description: 'Design, develop, and maintain software applications',
              whySuitsYou: 'Your practical problem-solving skills and love for applying technical knowledge make you perfect for building functional software solutions.',
              skillsNeeded: ['Programming', 'Problem-solving', 'Logical thinking', 'Testing'],
              howToBuildSkills: [
                'Learn programming languages (Python, JavaScript)',
                'Build personal coding projects',
                'Contribute to open-source projects',
                'Complete coding challenges on platforms like HackerRank'
              ],
              ghanaRelevance: 'Rapidly growing tech sector in Accra and Kumasi',
              recommendedDimension: 'problem_solving',
              detailedDescription: 'Software engineers design, develop, test, and maintain software systems. You\'ll work on everything from mobile apps to enterprise systems, collaborating with designers, product managers, and other engineers to build solutions that solve real problems.',
              typicalSalaryRange: 'GH₵ 3,000 - 15,000/month (Entry to Senior level)',
              workEnvironment: 'Mix of office and remote work. Collaborative team environment with daily standups, code reviews, and pair programming sessions.',
              careerGrowth: 'Junior Developer → Mid-level Engineer → Senior Engineer → Tech Lead → Engineering Manager or Architect',
              interviewTips: [
                'Practice data structures and algorithms on LeetCode',
                'Build projects that demonstrate your coding skills',
                'Prepare to explain your technical decisions',
                'Be ready for live coding challenges',
                'Show enthusiasm for learning new technologies'
              ],
              dayInLife: [
                '9:00 AM - Team standup meeting to discuss progress',
                '9:30 AM - Code review of teammate\'s pull requests',
                '10:30 AM - Deep work on feature development',
                '12:30 PM - Lunch break',
                '1:30 PM - Pair programming session with junior developer',
                '3:00 PM - Debug production issue',
                '4:30 PM - Documentation and testing',
                '5:30 PM - End of day, plan tomorrow\'s tasks'
              ],
              resourceLinks: [
                { title: 'FreeCodeCamp', url: 'https://www.freecodecamp.org' },
                { title: 'Ghana Tech Lab', url: 'https://ghanatechlab.com' },
                { title: 'GitHub Student Pack', url: 'https://education.github.com/pack' }
              ]
            },
            {
              title: 'Biomedical Engineer',
              description: 'Apply engineering principles to healthcare and medical devices',
              whySuitsYou: 'Your ability to solve practical problems using technical knowledge is ideal for developing medical solutions.',
              skillsNeeded: ['Engineering principles', 'Biology knowledge', 'Technical design', 'Innovation'],
              howToBuildSkills: [
                'Study biology and engineering',
                'Join innovation labs or maker spaces',
                'Participate in design competitions',
                'Intern at hospitals or medical companies'
              ],
              ghanaRelevance: 'Emerging field in teaching hospitals and medical equipment companies',
              recommendedDimension: 'problem_solving'
            },
            {
              title: 'Civil Engineer',
              description: 'Design and oversee construction of infrastructure projects',
              whySuitsYou: 'Your practical, results-oriented approach is perfect for creating tangible structures that solve real-world problems.',
              skillsNeeded: ['Technical drawing', 'Mathematics', 'Project management', 'Structural analysis'],
              howToBuildSkills: [
                'Study civil engineering',
                'Learn CAD software',
                'Visit construction sites',
                'Join engineering student associations'
              ],
              ghanaRelevance: 'High demand due to infrastructure development across Ghana',
              recommendedDimension: 'problem_solving'
            }
          ];

        case 'accommodating':
          return [
            {
              title: 'Entrepreneur',
              description: 'Start and grow your own business ventures',
              whySuitsYou: 'Your adaptability, risk-taking nature, and hands-on approach make you perfect for the dynamic world of entrepreneurship.',
              skillsNeeded: ['Initiative', 'Adaptability', 'Sales', 'Financial management'],
              howToBuildSkills: [
                'Start a small business while studying',
                'Join entrepreneurship clubs',
                'Learn basic accounting and marketing',
                'Network with local business owners'
              ],
              ghanaRelevance: 'Ghana\'s entrepreneurial ecosystem is vibrant with programs like NABCO and GEA',
              recommendedDimension: 'curiosity'
            },
            {
              title: 'Event Coordinator',
              description: 'Plan and execute events, conferences, and celebrations',
              whySuitsYou: 'Your spontaneous, action-oriented nature and ability to adapt quickly make you excellent at managing dynamic event situations.',
              skillsNeeded: ['Organization', 'Creativity', 'Communication', 'Problem-solving under pressure'],
              howToBuildSkills: [
                'Volunteer to organize campus events',
                'Learn project management basics',
                'Build vendor relationships',
                'Practice multitasking'
              ],
              ghanaRelevance: 'Growing events industry for corporate, social, and cultural occasions',
              recommendedDimension: 'problem_solving'
            },
            {
              title: 'Sales Manager',
              description: 'Lead sales teams and drive revenue growth',
              whySuitsYou: 'Your people skills, adaptability, and action-oriented approach are perfect for the fast-paced world of sales.',
              skillsNeeded: ['Persuasion', 'Relationship building', 'Goal orientation', 'Resilience'],
              howToBuildSkills: [
                'Take marketing and sales courses',
                'Practice negotiation skills',
                'Join sales competitions',
                'Intern with sales teams'
              ],
              ghanaRelevance: 'Essential role in all industries from telecom to consumer goods',
              recommendedDimension: 'emotional_regulation'
            }
          ];

        default:
          return getDefaultCareers();
      }
    }

    // Sternberg Thinking Styles
    if (assessmentType === 'sternberg') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'analytical':
          return [
            {
              title: 'Financial Analyst',
              description: 'Analyze financial data to guide investment and business decisions',
              whySuitsYou: 'Your strong analytical skills and ability to evaluate complex information make you ideal for financial analysis and forecasting.',
              skillsNeeded: ['Financial modeling', 'Excel proficiency', 'Critical thinking', 'Attention to detail'],
              howToBuildSkills: [
                'Study finance and accounting',
                'Learn Excel and financial software',
                'Follow financial markets',
                'Complete financial modeling courses'
              ],
              ghanaRelevance: 'Banks, investment firms, and large corporations seek skilled analysts',
              recommendedDimension: 'problem_solving'
            },
            {
              title: 'Medical Doctor',
              description: 'Diagnose and treat illnesses, injuries, and diseases',
              whySuitsYou: 'Your analytical approach to problem-solving and attention to detail are crucial for accurate diagnosis and treatment.',
              skillsNeeded: ['Medical knowledge', 'Diagnostic reasoning', 'Attention to detail', 'Empathy'],
              howToBuildSkills: [
                'Excel in science subjects',
                'Study for WASSCE and NSMQ',
                'Shadow doctors at hospitals',
                'Join health clubs'
              ],
              ghanaRelevance: 'Critical shortage of doctors in Ghana creates strong career prospects',
              recommendedDimension: 'problem_solving'
            },
            {
              title: 'Lawyer / Legal Consultant',
              description: 'Provide legal advice and represent clients in legal matters',
              whySuitsYou: 'Your ability to analyze arguments, identify flaws, and build logical cases makes you well-suited for legal practice.',
              skillsNeeded: ['Legal research', 'Argumentation', 'Writing', 'Critical analysis'],
              howToBuildSkills: [
                'Study law',
                'Join debate clubs',
                'Practice legal writing',
                'Intern at law firms'
              ],
              ghanaRelevance: 'Law remains a prestigious and in-demand profession in Ghana',
              recommendedDimension: 'problem_solving'
            }
          ];

        case 'creative':
          return [
            {
              title: 'Graphic Designer',
              description: 'Create visual content for brands, media, and advertising',
              whySuitsYou: 'Your creative thinking and ability to generate original ideas make you perfect for visual communication and design.',
              skillsNeeded: ['Design software (Adobe Suite)', 'Creativity', 'Visual communication', 'Client management'],
              howToBuildSkills: [
                'Learn Photoshop, Illustrator, and Figma',
                'Build a design portfolio',
                'Take on freelance projects',
                'Study design principles'
              ],
              ghanaRelevance: 'Growing demand in advertising agencies, media houses, and startups',
              recommendedDimension: 'curiosity',
              detailedDescription: 'Graphic designers create visual content for print and digital media. You\'ll design logos, marketing materials, social media graphics, and brand identities that help businesses communicate effectively with their audiences.',
              typicalSalaryRange: 'GH₵ 1,500 - 8,000/month (Entry to Senior level)',
              workEnvironment: 'Agency or freelance work. Mix of independent creative time and client meetings. Often deadline-driven with multiple projects running simultaneously.',
              careerGrowth: 'Junior Designer → Mid-level Designer → Senior Designer → Art Director → Creative Director',
              interviewTips: [
                'Build a strong portfolio showcasing diverse work',
                'Be prepared to walk through your design process',
                'Show how you handle client feedback and revisions',
                'Demonstrate knowledge of current design trends',
                'Bring examples of problem-solving through design'
              ],
              dayInLife: [
                '8:30 AM - Review client briefs and project timelines',
                '9:00 AM - Concept development for new branding project',
                '11:00 AM - Client presentation via Zoom',
                '12:00 PM - Lunch and social media inspiration browsing',
                '1:00 PM - Design execution in Adobe Creative Suite',
                '3:30 PM - Feedback incorporation and revisions',
                '5:00 PM - Portfolio updates and skill development',
                '6:00 PM - Wrap up and plan next day'
              ],
              resourceLinks: [
                { title: 'Behance (Portfolio)', url: 'https://www.behance.net' },
                { title: 'Canva Design School', url: 'https://www.canva.com/learn/' },
                { title: 'Adobe Creative Cloud', url: 'https://www.adobe.com/creativecloud.html' }
              ]
            },
            {
              title: 'Content Creator / Influencer',
              description: 'Create engaging content for social media and digital platforms',
              whySuitsYou: 'Your innovative thinking and unique perspective help you create content that stands out and engages audiences.',
              skillsNeeded: ['Creativity', 'Social media savvy', 'Video editing', 'Storytelling'],
              howToBuildSkills: [
                'Start a YouTube channel or blog',
                'Learn video editing',
                'Study successful creators',
                'Build an authentic online presence'
              ],
              ghanaRelevance: 'Rapidly growing digital economy with brands seeking authentic voices',
              recommendedDimension: 'curiosity'
            },
            {
              title: 'Innovation Consultant',
              description: 'Help organizations develop new products, services, and strategies',
              whySuitsYou: 'Your ability to think outside the box and generate novel solutions makes you valuable for driving organizational innovation.',
              skillsNeeded: ['Creative problem-solving', 'Business strategy', 'Facilitation', 'Research'],
              howToBuildSkills: [
                'Study business innovation',
                'Join innovation hubs',
                'Practice design thinking',
                'Read about emerging trends'
              ],
              ghanaRelevance: 'Consulting firms and progressive companies need innovation specialists',
              recommendedDimension: 'curiosity'
            }
          ];

        case 'practical':
          return [
            {
              title: 'Project Manager',
              description: 'Plan, execute, and deliver projects on time and within budget',
              whySuitsYou: 'Your practical approach, ability to apply knowledge, and focus on results make you excellent at managing complex projects.',
              skillsNeeded: ['Organization', 'Leadership', 'Risk management', 'Communication'],
              howToBuildSkills: [
                'Lead student projects',
                'Learn project management tools',
                'Study for PMP certification',
                'Intern with project teams'
              ],
              ghanaRelevance: 'Every industry needs skilled project managers',
              recommendedDimension: 'problem_solving'
            },
            {
              title: 'Nurse Practitioner',
              description: 'Provide direct patient care and health services',
              whySuitsYou: 'Your practical, hands-on approach and ability to handle real-world situations make you ideal for direct patient care.',
              skillsNeeded: ['Medical knowledge', 'Practical skills', 'Empathy', 'Quick decision-making'],
              howToBuildSkills: [
                'Study nursing',
                'Volunteer at health facilities',
                'Practice clinical skills',
                'Join nursing associations'
              ],
              ghanaRelevance: 'High demand nationwide in hospitals and community health centers',
              recommendedDimension: 'emotional_regulation'
            },
            {
              title: 'Operations Manager',
              description: 'Optimize business processes and day-to-day operations',
              whySuitsYou: 'Your ability to translate ideas into action and solve everyday problems efficiently makes you perfect for operations management.',
              skillsNeeded: ['Process optimization', 'Problem-solving', 'Leadership', 'Analytical thinking'],
              howToBuildSkills: [
                'Study business operations',
                'Learn Lean Six Sigma',
                'Intern in operations roles',
                'Analyze business processes'
              ],
              ghanaRelevance: 'Essential role in manufacturing, logistics, and service companies',
              recommendedDimension: 'problem_solving'
            }
          ];

        default:
          return getDefaultCareers();
      }
    }

    // Unified Cognitive Profile (from combined assessments)
    if (assessmentType === 'cognitive-profile') {
      const archetype = cognitiveStyle.toLowerCase();

      // Map cognitive archetypes to careers
      if (archetype.includes('innovative') || archetype.includes('explorer')) {
        return [
          {
            title: 'Innovation Consultant',
            description: 'Help organizations develop new products, services, and strategies',
            whySuitsYou: 'Your innovative mindset and exploratory nature make you excellent at identifying breakthrough opportunities.',
            skillsNeeded: ['Creative problem-solving', 'Business strategy', 'Facilitation', 'Research'],
            howToBuildSkills: [
              'Study business innovation',
              'Join innovation hubs',
              'Practice design thinking',
              'Read about emerging trends'
            ],
            ghanaRelevance: 'Consulting firms and progressive companies need innovation specialists',
            recommendedDimension: 'curiosity'
          },
          {
            title: 'Entrepreneur',
            description: 'Start and grow your own business ventures',
            whySuitsYou: 'Your exploratory mindset and creative approach help you identify opportunities and build new solutions.',
            skillsNeeded: ['Initiative', 'Adaptability', 'Sales', 'Financial management'],
            howToBuildSkills: [
              'Start a small business while studying',
              'Join entrepreneurship clubs',
              'Learn basic accounting and marketing',
              'Network with local business owners'
            ],
            ghanaRelevance: 'Ghana\'s entrepreneurial ecosystem is vibrant with programs like NABCO and GEA',
            recommendedDimension: 'curiosity'
          },
          {
            title: 'Product Designer',
            description: 'Design user-centered digital products and experiences',
            whySuitsYou: 'Your innovative thinking helps you create novel solutions that users love.',
            skillsNeeded: ['Design thinking', 'User research', 'Prototyping', 'Visual design'],
            howToBuildSkills: [
              'Learn Figma and design tools',
              'Study user psychology',
              'Build a portfolio',
              'Practice user interviews'
            ],
            ghanaRelevance: 'Growing tech startups need skilled product designers',
            recommendedDimension: 'curiosity'
          }
        ];
      }

      if (archetype.includes('systematic') || archetype.includes('analyzer')) {
        return [
          {
            title: 'Data Scientist',
            description: 'Extract insights from complex data using statistical methods',
            whySuitsYou: 'Your systematic approach and analytical mindset are perfect for rigorous data analysis.',
            skillsNeeded: ['Statistics', 'Programming', 'Machine learning', 'Data visualization'],
            howToBuildSkills: [
              'Learn Python and R',
              'Study statistics deeply',
              'Work on Kaggle competitions',
              'Build ML projects'
            ],
            ghanaRelevance: 'Banks, telecom, and fintech companies need data scientists',
            recommendedDimension: 'problem_solving'
          },
          {
            title: 'Research Scientist',
            description: 'Conduct systematic research to advance knowledge',
            whySuitsYou: 'Your methodical analysis and love for deep investigation make you ideal for research.',
            skillsNeeded: ['Research methods', 'Statistical analysis', 'Critical thinking', 'Academic writing'],
            howToBuildSkills: [
              'Engage in research projects',
              'Learn advanced statistics',
              'Read academic papers',
              'Present at conferences'
            ],
            ghanaRelevance: 'Universities and research institutes seek qualified researchers',
            recommendedDimension: 'problem_solving'
          },
          {
            title: 'Financial Analyst',
            description: 'Analyze financial data to guide business decisions',
            whySuitsYou: 'Your systematic thinking helps you identify patterns and forecast trends accurately.',
            skillsNeeded: ['Financial modeling', 'Excel', 'Analysis', 'Attention to detail'],
            howToBuildSkills: [
              'Study finance and accounting',
              'Master Excel',
              'Learn financial software',
              'Follow market trends'
            ],
            ghanaRelevance: 'Banks and corporations need skilled financial analysts',
            recommendedDimension: 'problem_solving'
          }
        ];
      }

      if (archetype.includes('pragmatic') || archetype.includes('builder')) {
        return [
          {
            title: 'Project Manager',
            description: 'Lead projects from conception to delivery',
            whySuitsYou: 'Your practical execution skills help you deliver projects on time and within budget.',
            skillsNeeded: ['Organization', 'Leadership', 'Risk management', 'Communication'],
            howToBuildSkills: [
              'Lead student projects',
              'Learn PM tools',
              'Study for certifications',
              'Practice stakeholder management'
            ],
            ghanaRelevance: 'Every industry needs skilled project managers',
            recommendedDimension: 'problem_solving'
          },
          {
            title: 'Software Engineer',
            description: 'Build practical software solutions',
            whySuitsYou: 'Your builder mentality helps you create functional, working systems.',
            skillsNeeded: ['Programming', 'Problem-solving', 'Testing', 'Version control'],
            howToBuildSkills: [
              'Learn programming languages',
              'Build real projects',
              'Contribute to open source',
              'Practice algorithms'
            ],
            ghanaRelevance: 'Rapidly growing tech sector in Accra',
            recommendedDimension: 'problem_solving'
          },
          {
            title: 'Operations Manager',
            description: 'Optimize business processes',
            whySuitsYou: 'Your pragmatic approach helps streamline operations and deliver results.',
            skillsNeeded: ['Process optimization', 'Leadership', 'Analytics', 'Problem-solving'],
            howToBuildSkills: [
              'Study operations management',
              'Learn Lean Six Sigma',
              'Intern in operations',
              'Analyze processes'
            ],
            ghanaRelevance: 'Manufacturing and service companies need operations managers',
            recommendedDimension: 'problem_solving'
          }
        ];
      }

      if (archetype.includes('versatile') || archetype.includes('balanced')) {
        return [
          {
            title: 'Business Analyst',
            description: 'Bridge business needs and technical solutions',
            whySuitsYou: 'Your versatile thinking helps you understand multiple perspectives.',
            skillsNeeded: ['Analysis', 'Communication', 'Technical understanding', 'Problem-solving'],
            howToBuildSkills: [
              'Study business and IT',
              'Learn requirements gathering',
              'Practice process mapping',
              'Develop communication skills'
            ],
            ghanaRelevance: 'Tech and consulting firms need business analysts',
            recommendedDimension: 'problem_solving'
          },
          {
            title: 'Product Manager',
            description: 'Define and launch successful products',
            whySuitsYou: 'Your balanced approach helps you juggle user needs, business goals, and technical constraints.',
            skillsNeeded: ['Strategy', 'Communication', 'Data analysis', 'User empathy'],
            howToBuildSkills: [
              'Learn product frameworks',
              'Build side projects',
              'Study successful products',
              'Practice user interviews'
            ],
            ghanaRelevance: 'Tech startups need product managers',
            recommendedDimension: 'problem_solving'
          },
          {
            title: 'Consultant',
            description: 'Solve business problems for diverse clients',
            whySuitsYou: 'Your versatile skills help you adapt to different industries and challenges.',
            skillsNeeded: ['Problem-solving', 'Communication', 'Analysis', 'Presentation'],
            howToBuildSkills: [
              'Study case frameworks',
              'Practice case interviews',
              'Build business knowledge',
              'Develop presentation skills'
            ],
            ghanaRelevance: 'Consulting firms serve growing Ghanaian businesses',
            recommendedDimension: 'problem_solving'
          }
        ];
      }

      // Default careers for other archetypes
      return getDefaultCareers();
    }

    // Dual-Process Decision Styles
    if (assessmentType === 'dual-process') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'intuitive':
        case 'balanced':
          return [
            {
              title: 'Emergency Medical Technician',
              description: 'Provide immediate medical care in emergency situations',
              whySuitsYou: 'Your ability to make quick, intuitive decisions under pressure is crucial for emergency medical response.',
              skillsNeeded: ['Quick thinking', 'Medical knowledge', 'Stress management', 'Physical fitness'],
              howToBuildSkills: [
                'Get EMT certification',
                'Volunteer with ambulance services',
                'Practice emergency scenarios',
                'Stay physically fit'
              ],
              ghanaRelevance: 'Growing emergency medical services across urban areas',
              recommendedDimension: 'metacognition'
            },
            {
              title: 'Creative Director',
              description: 'Lead creative teams in advertising and media',
              whySuitsYou: 'Your intuitive sense of what works and quick pattern recognition help you guide creative direction effectively.',
              skillsNeeded: ['Creative vision', 'Leadership', 'Trend awareness', 'Decision-making'],
              howToBuildSkills: [
                'Build a creative portfolio',
                'Lead creative projects',
                'Study successful campaigns',
                'Network in creative industries'
              ],
              ghanaRelevance: 'Advertising agencies and media houses need creative leadership',
              recommendedDimension: 'curiosity'
            }
          ];

        case 'reflective':
          return [
            {
              title: 'Research Analyst',
              description: 'Conduct in-depth research and analysis for organizations',
              whySuitsYou: 'Your deliberate, thorough approach to decision-making makes you excellent at producing well-researched insights.',
              skillsNeeded: ['Research methods', 'Critical thinking', 'Writing', 'Patience'],
              howToBuildSkills: [
                'Take research methodology courses',
                'Write research papers',
                'Learn data analysis tools',
                'Work on research projects'
              ],
              ghanaRelevance: 'Think tanks, NGOs, and government agencies need skilled researchers',
              recommendedDimension: 'problem_solving'
            },
            {
              title: 'Strategic Planner',
              description: 'Develop long-term strategies for organizations',
              whySuitsYou: 'Your reflective nature and careful analysis of information make you ideal for strategic planning and forecasting.',
              skillsNeeded: ['Strategic thinking', 'Analysis', 'Forecasting', 'Communication'],
              howToBuildSkills: [
                'Study business strategy',
                'Analyze case studies',
                'Learn scenario planning',
                'Intern in strategy roles'
              ],
              ghanaRelevance: 'Corporations and government need strategic planning expertise',
              recommendedDimension: 'problem_solving'
            }
          ];

        default:
          return getDefaultCareers();
      }
    }

    return getDefaultCareers();
  };

  function getDefaultCareers(): Career[] {
    return [
      {
        title: 'Business Analyst',
        description: 'Bridge business needs and technical solutions',
        whySuitsYou: 'Your balanced skills help you understand both business and technical perspectives.',
        skillsNeeded: ['Analysis', 'Communication', 'Technical understanding', 'Problem-solving'],
        howToBuildSkills: [
          'Study business and IT',
          'Learn requirements gathering',
          'Practice process mapping',
          'Intern in analyst roles'
        ],
        ghanaRelevance: 'Growing demand in tech and consulting firms',
        recommendedDimension: 'problem_solving'
      }
    ];
  }

  const handleBuildSkills = async (career: Career) => {
    if (!career.recommendedDimension) {
      toast.error('No skill dimension defined for this career');
      return;
    }

    if (!onNavigateToSkillBuilder) {
      toast.error('Navigation not configured');
      return;
    }

    setCreatingPlan(true);
    try {
      await generateSkillPlan({
        dimensionId: career.recommendedDimension,
        tier: 'adult',
        lengthDays: 7,
        sourceResultId: '',
        sourceCareer: career.title,
      });

      toast.success(`Created a ${career.recommendedDimension.replace(/_/g, ' ')} skill plan for ${career.title}!`);
      setIsModalOpen(false);
      onNavigateToSkillBuilder(career.recommendedDimension);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create skill plan');
    } finally {
      setCreatingPlan(false);
    }
  };

  const careers = getCareers();

  // Filter and search careers
  const filteredCareers = useMemo(() => {
    let result = careers;

    // Apply dimension filter
    if (selectedDimension !== 'all') {
      result = result.filter(c => c.recommendedDimension === selectedDimension);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.skillsNeeded.some(s => s.toLowerCase().includes(query))
      );
    }

    return result;
  }, [careers, selectedDimension, searchQuery]);

  const favoriteCareers = useMemo(() => {
    return filteredCareers.filter(c => favorites.has(c.title));
  }, [filteredCareers, favorites]);

  const toggleFavorite = (careerTitle: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(careerTitle)) {
      newFavorites.delete(careerTitle);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(careerTitle);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);

    // Award XP for favoriting careers
    if (user) {
      const reward = recordCareerFavorite(user.id, newFavorites.size);
      if (reward) {
        toast.success(reward.message, {
          description: `+${reward.xpEarned} XP earned`,
          duration: 4000,
        });
        if (reward.leveledUp) {
          celebrateLevelUp();
          toast.success(`🎉 Level Up! You're now ${reward.levelTitle}`, {
            duration: 5000,
          });
        }
        reward.newBadges.forEach(badge => {
          celebrateBadgeUnlock(badge.rarity);
          toast.success(`🏆 Badge Unlocked: ${badge.name}`, {
            description: badge.description,
            duration: 5000,
          });
        });
      }
    }
  };

  const handleCareerClick = (career: Career) => {
    setSelectedCareer(career);
    setIsModalOpen(true);

    // Award XP for exploring first career
    if (user) {
      const reward = recordCareerExploration(user.id);
      if (reward) {
        toast.success(reward.message, {
          description: `+${reward.xpEarned} XP earned`,
          duration: 4000,
        });
        if (reward.leveledUp) {
          celebrateLevelUp();
          toast.success(`🎉 Level Up! You're now ${reward.levelTitle}`, {
            duration: 5000,
          });
        }
        reward.newBadges.forEach(badge => {
          celebrateBadgeUnlock(badge.rarity);
          toast.success(`🏆 Badge Unlocked: ${badge.name}`, {
            description: badge.description,
            duration: 5000,
          });
        });
      }
    }
  };

  return (
    <>
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search careers by title, description, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedDimension === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDimension('all')}
              >
                All Careers ({careers.length})
              </Button>
              <Button
                variant={selectedDimension === 'problem_solving' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDimension('problem_solving')}
              >
                Problem Solving
              </Button>
              <Button
                variant={selectedDimension === 'curiosity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDimension('curiosity')}
              >
                Curiosity
              </Button>
              <Button
                variant={selectedDimension === 'emotional_regulation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDimension('emotional_regulation')}
              >
                Emotional Intelligence
              </Button>
              <Button
                variant={selectedDimension === 'metacognition' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDimension('metacognition')}
              >
                Metacognition
              </Button>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredCareers.length} of {careers.length} careers
              </span>
              {favorites.size > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 fill-current text-red-500" />
                  {favorites.size} favorite{favorites.size > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Section */}
      {favoriteCareers.length > 0 && (
        <Card className="border-2 border-red-200 bg-gradient-to-br from-white to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-current text-red-500" />
              Your Favorites
            </CardTitle>
            <CardDescription>Careers you've bookmarked for later</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoriteCareers.map((career, index) => (
                <button
                  key={index}
                  onClick={() => handleCareerClick(career)}
                  className="text-left p-4 rounded-lg border-2 border-red-300 hover:border-red-500 hover:shadow-md transition-all relative group"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(career.title);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Heart className="h-5 w-5 fill-current text-red-500" />
                  </button>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 pr-8">
                    {career.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {career.description}
                  </p>
                  <div className="flex items-center text-sm text-red-600 dark:text-red-400 font-medium">
                    Learn more
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Careers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>
              {selectedDimension === 'all' ? 'Potential Career Trajectories' : 'Filtered Trajectories'}
            </CardTitle>
          </div>
          <CardDescription>
            <div className="mb-2">Pathways that may align with your {cognitiveStyle} profile.</div>
            <div className="text-xs italic text-amber-600 dark:text-amber-400">
              {getCareerDisclaimer()}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCareers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No careers match your search criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDimension('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCareers.map((career, index) => (
              <button
                key={index}
                onClick={() => handleCareerClick(career)}
                className="text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all relative group"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(career.title);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Heart className={`h-5 w-5 ${favorites.has(career.title) ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                </button>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 pr-8">
                  {career.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {career.description}
                </p>
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Learn more
                  <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </button>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Career Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedCareer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-primary" />
                  {selectedCareer.title}
                </DialogTitle>
                <DialogDescription className="text-base">{selectedCareer.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Why This Suits You */}
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Why This Suits You
                    </h3>
                  </div>
                  <p className="text-green-800 dark:text-green-200">
                    {selectedCareer.whySuitsYou}
                  </p>
                </div>

                {/* Detailed Description */}
                {selectedCareer.detailedDescription && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      What You'll Do
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedCareer.detailedDescription}
                    </p>
                  </div>
                )}

                {/* Career Info Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedCareer.typicalSalaryRange && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                        <h4 className="font-semibold">Typical Salary in Ghana</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCareer.typicalSalaryRange}
                      </p>
                    </div>
                  )}

                  {selectedCareer.careerGrowth && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold">Career Growth Path</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCareer.careerGrowth}
                      </p>
                    </div>
                  )}
                </div>

                {/* Work Environment */}
                {selectedCareer.workEnvironment && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Work Environment
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                      {selectedCareer.workEnvironment}
                    </p>
                  </div>
                )}

                {/* Skills Needed */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Skills Needed
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.skillsNeeded.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* How to Build Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      How to Build These Skills
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedCareer.howToBuildSkills.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interview Tips */}
                {selectedCareer.interviewTips && selectedCareer.interviewTips.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                        Interview Preparation Tips
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {selectedCareer.interviewTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-yellow-800 dark:text-yellow-200 text-sm">
                          <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* A Day in the Life */}
                {selectedCareer.dayInLife && selectedCareer.dayInLife.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        A Day in the Life
                      </h3>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg space-y-2">
                      {selectedCareer.dayInLife.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                          <span className="text-indigo-800 dark:text-indigo-200">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resource Links */}
                {selectedCareer.resourceLinks && selectedCareer.resourceLinks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon className="w-5 h-5 text-teal-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Learning Resources
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {selectedCareer.resourceLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ghana Relevance */}
                {selectedCareer.ghanaRelevance && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      🇬🇭 Relevance in Ghana
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedCareer.ghanaRelevance}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between gap-3 border-t pt-4">
                {selectedCareer.recommendedDimension && onNavigateToSkillBuilder && (
                  <Button
                    onClick={() => handleBuildSkills(selectedCareer)}
                    disabled={creatingPlan}
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {creatingPlan ? 'Creating Plan...' : 'Build Skills for This Career'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className={selectedCareer.recommendedDimension && onNavigateToSkillBuilder ? '' : 'flex-1'}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
