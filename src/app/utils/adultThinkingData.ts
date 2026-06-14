// Adult Thinking Styles Assessment Data (Ages 19+)
// Four thinking styles: Creative, Analytical, Practical, Reflective

export interface AdultQuestion {
  id: number;
  text: string;
  style: 'creative' | 'analytical' | 'practical' | 'reflective';
  section: string;
}

export interface CareerPath {
  name: string;
  description: string;
  thinkingStyles: string[];
  industries: string[];
  keySkills: string[];
  careerProgression: string[];
  averageSalaryRange: string;
  growthOpportunities: string[];
}

// 24 Questions - 6 per thinking style
export const adultQuestions: AdultQuestion[] = [
  // CREATIVE THINKING (6 questions)
  {
    id: 1,
    text: "In my professional work, I actively seek innovative solutions and unconventional approaches to challenges",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 2,
    text: "I thrive in environments that encourage experimentation and value original ideas",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 3,
    text: "When brainstorming, I can easily generate multiple creative alternatives to any given problem",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 4,
    text: "I find satisfaction in developing new concepts, designs, or strategies from scratch",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 5,
    text: "I'm comfortable with ambiguity and can transform abstract ideas into tangible outcomes",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 6,
    text: "I regularly challenge conventional wisdom and established practices to find better ways of doing things",
    style: 'creative',
    section: 'Creative Thinking'
  },

  // ANALYTICAL THINKING (6 questions)
  {
    id: 7,
    text: "I excel at breaking down complex problems into manageable components for systematic analysis",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 8,
    text: "I make decisions based on data, evidence, and logical reasoning rather than intuition alone",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 9,
    text: "I'm skilled at identifying patterns, trends, and relationships in information",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 10,
    text: "I critically evaluate arguments and claims by examining their underlying assumptions and logic",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 11,
    text: "I enjoy conducting research and analyzing information to solve problems or answer questions",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 12,
    text: "I'm adept at using quantitative methods and metrics to evaluate performance and outcomes",
    style: 'analytical',
    section: 'Analytical Thinking'
  },

  // PRACTICAL THINKING (6 questions)
  {
    id: 13,
    text: "I focus on implementing solutions that produce tangible, measurable results",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 14,
    text: "I'm skilled at resource management and optimizing processes for maximum efficiency",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 15,
    text: "I excel at translating strategic plans into actionable steps and deliverables",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 16,
    text: "I prioritize pragmatic solutions that work within real-world constraints and limitations",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 17,
    text: "I'm effective at project management and ensuring tasks are completed on time and within budget",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 18,
    text: "I value hands-on experience and learn best through direct application and practice",
    style: 'practical',
    section: 'Practical Thinking'
  },

  // REFLECTIVE THINKING (6 questions)
  {
    id: 19,
    text: "I regularly engage in self-assessment to understand my strengths, weaknesses, and growth areas",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 20,
    text: "I value deep contemplation and take time to consider multiple perspectives before acting",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 21,
    text: "I'm skilled at understanding complex interpersonal dynamics and emotional intelligence",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 22,
    text: "I learn from experiences by analyzing what worked, what didn't, and why",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 23,
    text: "I'm conscious of ethical implications and consider the broader impact of decisions on stakeholders",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 24,
    text: "I engage in continuous professional development and seek feedback to improve my practice",
    style: 'reflective',
    section: 'Reflective Thinking'
  }
];

// Career Paths Database with Thinking Style Alignments
export const careerPaths: CareerPath[] = [
  // CREATIVE-FOCUSED CAREERS
  {
    name: "Creative Director / Art Director",
    description: "Lead creative teams in developing visual concepts, brand strategies, and innovative campaigns for advertising, marketing, or media companies",
    thinkingStyles: ['creative', 'analytical', 'practical'],
    industries: ['Advertising', 'Marketing', 'Media & Entertainment', 'Design Agencies'],
    keySkills: ['Visual design', 'Creative strategy', 'Team leadership', 'Brand development', 'Client management'],
    careerProgression: ['Junior Designer', 'Senior Designer', 'Art Director', 'Creative Director', 'Chief Creative Officer'],
    averageSalaryRange: '₱40,000 - ₱150,000/month',
    growthOpportunities: ['Start own creative agency', 'Freelance consulting', 'International creative roles', 'Teaching/mentoring']
  },
  {
    name: "UX/UI Designer",
    description: "Design user-centered digital experiences by combining research, visual design, and interaction design principles",
    thinkingStyles: ['creative', 'analytical', 'practical'],
    industries: ['Technology', 'E-commerce', 'Finance', 'Healthcare', 'Startups'],
    keySkills: ['User research', 'Wireframing', 'Prototyping', 'Visual design', 'Usability testing', 'Design systems'],
    careerProgression: ['Junior UX Designer', 'UX Designer', 'Senior UX Designer', 'Lead UX Designer', 'Head of Design'],
    averageSalaryRange: '₱35,000 - ₱120,000/month',
    growthOpportunities: ['Product management transition', 'Design leadership', 'Freelance/consulting', 'Design thinking facilitation']
  },
  {
    name: "Content Creator / Digital Strategist",
    description: "Develop engaging content strategies and create multimedia content across digital platforms to build brand presence",
    thinkingStyles: ['creative', 'practical'],
    industries: ['Social Media', 'Marketing', 'Publishing', 'E-commerce', 'Entertainment'],
    keySkills: ['Content creation', 'Social media strategy', 'Copywriting', 'Video production', 'Analytics', 'SEO'],
    careerProgression: ['Content Writer', 'Content Specialist', 'Content Strategist', 'Head of Content', 'Chief Content Officer'],
    averageSalaryRange: '₱25,000 - ₱100,000/month',
    growthOpportunities: ['Personal brand building', 'Influencer marketing', 'Agency ownership', 'Online course creation']
  },
  {
    name: "Architect / Urban Planner",
    description: "Design buildings, spaces, and urban environments that balance aesthetics, functionality, and sustainability",
    thinkingStyles: ['creative', 'analytical', 'practical'],
    industries: ['Architecture', 'Real Estate', 'Urban Development', 'Construction', 'Government'],
    keySkills: ['Architectural design', 'CAD/BIM software', 'Project management', 'Building codes', 'Sustainability'],
    careerProgression: ['Junior Architect', 'Architect', 'Senior Architect', 'Principal Architect', 'Firm Partner'],
    averageSalaryRange: '₱30,000 - ₱120,000/month',
    growthOpportunities: ['Own architecture firm', 'Specialized design (green architecture)', 'International projects', 'Academic positions']
  },

  // ANALYTICAL-FOCUSED CAREERS
  {
    name: "Data Scientist / Data Analyst",
    description: "Extract insights from complex datasets using statistical analysis, machine learning, and data visualization",
    thinkingStyles: ['analytical', 'practical'],
    industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Consulting'],
    keySkills: ['Python/R programming', 'Statistical analysis', 'Machine learning', 'Data visualization', 'SQL', 'Business intelligence'],
    careerProgression: ['Junior Data Analyst', 'Data Analyst', 'Senior Data Analyst', 'Data Scientist', 'Lead Data Scientist'],
    averageSalaryRange: '₱40,000 - ₱150,000/month',
    growthOpportunities: ['AI/ML specialization', 'Chief Data Officer', 'Data consulting', 'Research positions']
  },
  {
    name: "Software Engineer / Developer",
    description: "Design, develop, test, and maintain software applications and systems using various programming languages and frameworks",
    thinkingStyles: ['analytical', 'practical', 'creative'],
    industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Gaming'],
    keySkills: ['Programming languages', 'Software architecture', 'Algorithm design', 'Version control', 'Testing', 'DevOps'],
    careerProgression: ['Junior Developer', 'Software Engineer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager'],
    averageSalaryRange: '₱40,000 - ₱200,000/month',
    growthOpportunities: ['Technical architect', 'CTO', 'Startup founder', 'Open source contributor', 'International remote work']
  },
  {
    name: "Financial Analyst / Investment Analyst",
    description: "Analyze financial data, market trends, and investment opportunities to provide strategic recommendations",
    thinkingStyles: ['analytical', 'reflective'],
    industries: ['Banking', 'Investment', 'Corporate Finance', 'Consulting', 'Insurance'],
    keySkills: ['Financial modeling', 'Market analysis', 'Excel/financial software', 'Valuation', 'Risk assessment', 'Reporting'],
    careerProgression: ['Financial Analyst', 'Senior Analyst', 'Finance Manager', 'Finance Director', 'CFO'],
    averageSalaryRange: '₱35,000 - ₱150,000/month',
    growthOpportunities: ['Portfolio management', 'Private equity', 'Corporate leadership', 'Financial consulting']
  },
  {
    name: "Research Scientist",
    description: "Conduct scientific research, design experiments, and contribute to knowledge advancement in specialized fields",
    thinkingStyles: ['analytical', 'reflective'],
    industries: ['Academia', 'Pharmaceuticals', 'Biotechnology', 'Government Research', 'R&D'],
    keySkills: ['Research methodology', 'Data analysis', 'Scientific writing', 'Laboratory techniques', 'Grant writing', 'Critical thinking'],
    careerProgression: ['Research Assistant', 'Research Associate', 'Senior Scientist', 'Principal Scientist', 'Research Director'],
    averageSalaryRange: '₱30,000 - ₱120,000/month',
    growthOpportunities: ['Academic tenure', 'Research leadership', 'Industry consulting', 'Patent development']
  },

  // PRACTICAL-FOCUSED CAREERS
  {
    name: "Project Manager",
    description: "Plan, execute, and oversee projects from initiation to completion, ensuring delivery within scope, time, and budget",
    thinkingStyles: ['practical', 'analytical', 'reflective'],
    industries: ['Construction', 'IT', 'Consulting', 'Manufacturing', 'Healthcare'],
    keySkills: ['Project planning', 'Risk management', 'Stakeholder management', 'Agile/Scrum', 'Budgeting', 'Leadership'],
    careerProgression: ['Project Coordinator', 'Project Manager', 'Senior PM', 'Program Manager', 'PMO Director'],
    averageSalaryRange: '₱40,000 - ₱150,000/month',
    growthOpportunities: ['Portfolio management', 'Operations leadership', 'Consulting', 'International project roles']
  },
  {
    name: "Operations Manager",
    description: "Optimize business operations, improve efficiency, and manage day-to-day activities to achieve organizational goals",
    thinkingStyles: ['practical', 'analytical'],
    industries: ['Manufacturing', 'Logistics', 'Retail', 'Hospitality', 'Services'],
    keySkills: ['Process optimization', 'Supply chain management', 'Quality control', 'Team management', 'KPI tracking', 'Lean Six Sigma'],
    careerProgression: ['Operations Coordinator', 'Operations Manager', 'Senior Operations Manager', 'Director of Operations', 'COO'],
    averageSalaryRange: '₱40,000 - ₱140,000/month',
    growthOpportunities: ['General management', 'Consulting', 'Process improvement specialist', 'C-suite executive']
  },
  {
    name: "Business Development Manager",
    description: "Identify growth opportunities, build partnerships, and drive revenue through strategic relationships and market expansion",
    thinkingStyles: ['practical', 'creative', 'analytical'],
    industries: ['Technology', 'Sales', 'Consulting', 'Real Estate', 'Manufacturing'],
    keySkills: ['Sales strategy', 'Negotiation', 'Market analysis', 'Relationship building', 'Proposal development', 'CRM'],
    careerProgression: ['BD Executive', 'BD Manager', 'Senior BD Manager', 'Head of BD', 'VP Business Development'],
    averageSalaryRange: '₱40,000 - ₱180,000/month',
    growthOpportunities: ['Entrepreneurship', 'Partnership leadership', 'International expansion', 'Executive roles']
  },
  {
    name: "IT Manager / Systems Administrator",
    description: "Manage IT infrastructure, ensure system reliability, and support technology needs across the organization",
    thinkingStyles: ['practical', 'analytical'],
    industries: ['Technology', 'Corporate IT', 'Healthcare', 'Finance', 'Education'],
    keySkills: ['Systems administration', 'Network management', 'Cybersecurity', 'Cloud computing', 'IT support', 'Vendor management'],
    careerProgression: ['IT Support', 'Systems Admin', 'IT Manager', 'IT Director', 'CIO'],
    averageSalaryRange: '₱35,000 - ₱130,000/month',
    growthOpportunities: ['Cloud architecture', 'IT consulting', 'Cybersecurity specialization', 'Technology leadership']
  },

  // REFLECTIVE-FOCUSED CAREERS
  {
    name: "Human Resources Manager",
    description: "Develop HR strategies, manage talent acquisition and development, and foster organizational culture",
    thinkingStyles: ['reflective', 'practical', 'analytical'],
    industries: ['Corporate', 'Consulting', 'Healthcare', 'Education', 'Government'],
    keySkills: ['Talent management', 'Employee relations', 'Organizational development', 'HR analytics', 'Conflict resolution', 'Compliance'],
    careerProgression: ['HR Specialist', 'HR Manager', 'Senior HR Manager', 'HR Director', 'CHRO'],
    averageSalaryRange: '₱35,000 - ₱130,000/month',
    growthOpportunities: ['People operations leadership', 'HR consulting', 'Organizational development', 'Executive coaching']
  },
  {
    name: "Psychologist / Counselor",
    description: "Provide mental health support, conduct assessments, and help individuals overcome personal and professional challenges",
    thinkingStyles: ['reflective', 'analytical'],
    industries: ['Healthcare', 'Education', 'Corporate Wellness', 'Private Practice', 'NGOs'],
    keySkills: ['Counseling techniques', 'Psychological assessment', 'Empathy', 'Active listening', 'Intervention strategies', 'Ethics'],
    careerProgression: ['Psychology Intern', 'Licensed Psychologist', 'Clinical Psychologist', 'Senior Psychologist', 'Practice Owner'],
    averageSalaryRange: '₱30,000 - ₱100,000/month',
    growthOpportunities: ['Private practice', 'Specialized therapy', 'Corporate consulting', 'Training and supervision']
  },
  {
    name: "Learning & Development Manager",
    description: "Design and implement training programs to enhance employee skills, knowledge, and organizational performance",
    thinkingStyles: ['reflective', 'practical', 'creative'],
    industries: ['Corporate', 'Education', 'Consulting', 'Technology', 'Healthcare'],
    keySkills: ['Instructional design', 'Training delivery', 'Learning technologies', 'Needs assessment', 'Program evaluation', 'Coaching'],
    careerProgression: ['Training Specialist', 'L&D Manager', 'Senior L&D Manager', 'Head of L&D', 'Chief Learning Officer'],
    averageSalaryRange: '₱35,000 - ₱120,000/month',
    growthOpportunities: ['Corporate university leadership', 'Independent consulting', 'Online course creation', 'Executive development']
  },
  {
    name: "Social Impact Manager / CSR Specialist",
    description: "Develop and manage corporate social responsibility programs and social impact initiatives",
    thinkingStyles: ['reflective', 'practical'],
    industries: ['Non-profit', 'Corporate CSR', 'Social Enterprises', 'International Development', 'Government'],
    keySkills: ['Program management', 'Stakeholder engagement', 'Impact measurement', 'Grant writing', 'Community relations', 'Sustainability'],
    careerProgression: ['CSR Coordinator', 'CSR Manager', 'Head of Social Impact', 'Sustainability Director', 'VP Corporate Affairs'],
    averageSalaryRange: '₱30,000 - ₱110,000/month',
    growthOpportunities: ['Non-profit leadership', 'Social entrepreneurship', 'International development', 'Policy advocacy']
  },

  // BALANCED/HYBRID CAREERS
  {
    name: "Product Manager",
    description: "Define product vision, prioritize features, and work cross-functionally to deliver products that meet market needs",
    thinkingStyles: ['analytical', 'creative', 'practical'],
    industries: ['Technology', 'E-commerce', 'Finance', 'Healthcare', 'Consumer Goods'],
    keySkills: ['Product strategy', 'Market research', 'Agile methodologies', 'Data analysis', 'Stakeholder management', 'UX principles'],
    careerProgression: ['Associate PM', 'Product Manager', 'Senior PM', 'Group PM', 'VP Product', 'CPO'],
    averageSalaryRange: '₱50,000 - ₱200,000/month',
    growthOpportunities: ['Startup founder', 'Product leadership', 'Consulting', 'Venture capital']
  },
  {
    name: "Marketing Manager",
    description: "Develop and execute marketing strategies to build brand awareness, generate leads, and drive business growth",
    thinkingStyles: ['creative', 'analytical', 'practical'],
    industries: ['Consumer Goods', 'Technology', 'Retail', 'Services', 'E-commerce'],
    keySkills: ['Marketing strategy', 'Digital marketing', 'Brand management', 'Campaign management', 'Analytics', 'Budget management'],
    careerProgression: ['Marketing Specialist', 'Marketing Manager', 'Senior Marketing Manager', 'Marketing Director', 'CMO'],
    averageSalaryRange: '₱40,000 - ₱150,000/month',
    growthOpportunities: ['Brand leadership', 'Marketing consulting', 'Agency ownership', 'Growth marketing specialist']
  },
  {
    name: "Management Consultant",
    description: "Advise organizations on strategy, operations, and organizational improvement to solve complex business challenges",
    thinkingStyles: ['analytical', 'reflective', 'creative'],
    industries: ['Consulting Firms', 'Corporate Strategy', 'Finance', 'Technology', 'Healthcare'],
    keySkills: ['Problem-solving', 'Strategic thinking', 'Data analysis', 'Presentation skills', 'Client management', 'Change management'],
    careerProgression: ['Analyst', 'Consultant', 'Senior Consultant', 'Manager', 'Partner'],
    averageSalaryRange: '₱50,000 - ₱250,000/month',
    growthOpportunities: ['Partner track', 'Independent consulting', 'Corporate strategy roles', 'Interim executive']
  },
  {
    name: "Entrepreneur / Business Owner",
    description: "Build and grow your own business venture, taking on all aspects of business management and innovation",
    thinkingStyles: ['creative', 'practical', 'analytical', 'reflective'],
    industries: ['Any industry based on business model'],
    keySkills: ['Business planning', 'Financial management', 'Sales', 'Leadership', 'Innovation', 'Resilience', 'Networking'],
    careerProgression: ['Startup founder', 'Growing business', 'Established business', 'Multiple ventures', 'Serial entrepreneur'],
    averageSalaryRange: 'Variable based on business success',
    growthOpportunities: ['Business scaling', 'Exit and reinvest', 'Angel investing', 'Mentoring other entrepreneurs']
  }
];

// Thinking Style Descriptions for Adults
export const adultThinkingStyles = {
  creative: {
    name: 'Creative Thinking',
    emoji: '🎨',
    color: '#FF715B',
    description: 'You excel at innovation, generating novel ideas, and approaching challenges from unique perspectives.',
    strengths: [
      'Innovation and ideation',
      'Adaptive problem-solving',
      'Vision and conceptualization',
      'Embracing ambiguity and change'
    ],
    developmentTips: [
      'Balance creativity with structured execution',
      'Develop skills in presenting ideas persuasively to stakeholders',
      'Learn to evaluate and prioritize among multiple creative options',
      'Build cross-functional collaboration skills'
    ]
  },
  analytical: {
    name: 'Analytical Thinking',
    emoji: '🔍',
    color: '#6B4C9A',
    description: 'You have exceptional ability to analyze data, identify patterns, and make evidence-based decisions.',
    strengths: [
      'Data-driven decision making',
      'Critical thinking and evaluation',
      'Problem decomposition and solving',
      'Research and investigation'
    ],
    developmentTips: [
      'Practice communicating complex analyses to non-technical audiences',
      'Develop intuition alongside analytical rigor',
      'Learn to act decisively even with incomplete data',
      'Balance analysis with timely execution'
    ]
  },
  practical: {
    name: 'Practical Thinking',
    emoji: '🛠️',
    color: '#C1E1C1',
    description: 'You focus on implementation, efficiency, and achieving tangible results in real-world contexts.',
    strengths: [
      'Execution and implementation',
      'Resource optimization',
      'Process management',
      'Results orientation'
    ],
    developmentTips: [
      'Develop strategic thinking beyond immediate tasks',
      'Cultivate innovation alongside efficiency',
      'Consider long-term implications and sustainability',
      'Balance speed with quality and stakeholder needs'
    ]
  },
  reflective: {
    name: 'Reflective Thinking',
    emoji: '💭',
    color: '#8E7CC3',
    description: 'You possess strong self-awareness, emotional intelligence, and ability to learn from experience.',
    strengths: [
      'Self-awareness and growth mindset',
      'Emotional intelligence',
      'Perspective-taking and empathy',
      'Ethical reasoning and values-driven decisions'
    ],
    developmentTips: [
      'Balance reflection with decisive action',
      'Set clear timelines for contemplation and decision-making',
      'Share insights proactively to influence outcomes',
      'Develop confidence in your intuitive judgments'
    ]
  }
};
