// SHS Thinking Styles Assessment Data (Ages 15-18)
// Four thinking styles: Creative, Analytical, Practical, Reflective

export interface SHSQuestion {
  id: number;
  text: string;
  style: 'creative' | 'analytical' | 'practical' | 'reflective';
  section: string;
}

export interface TertiaryProgram {
  name: string;
  description: string;
  thinkingStyles: string[];
  careerPaths: string[];
  universities: string[];
  skills: string[];
}

// 24 Questions - 6 per thinking style
export const shsQuestions: SHSQuestion[] = [
  // CREATIVE THINKING (6 questions)
  {
    id: 1,
    text: "When working on a group project, I prefer to brainstorm innovative solutions rather than follow traditional methods",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 2,
    text: "I enjoy exploring artistic or creative subjects like design, music, or writing in my free time",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 3,
    text: "I find it easy to think of multiple ways to solve a problem, even unconventional ones",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 4,
    text: "I get excited about projects that allow me to express my original ideas and imagination",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 5,
    text: "When reading or watching stories, I often imagine alternative endings or plotlines",
    style: 'creative',
    section: 'Creative Thinking'
  },
  {
    id: 6,
    text: "I'm comfortable taking creative risks, even if the outcome is uncertain",
    style: 'creative',
    section: 'Creative Thinking'
  },

  // ANALYTICAL THINKING (6 questions)
  {
    id: 7,
    text: "I enjoy solving complex math or logic problems that require systematic thinking",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 8,
    text: "Before making decisions, I carefully analyze all available information and evidence",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 9,
    text: "I prefer subjects that involve clear rules, patterns, and logical reasoning",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 10,
    text: "I question claims and arguments until I understand the underlying logic",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 11,
    text: "I excel at identifying patterns and relationships between different concepts",
    style: 'analytical',
    section: 'Analytical Thinking'
  },
  {
    id: 12,
    text: "I enjoy researching topics in depth to understand how things work",
    style: 'analytical',
    section: 'Analytical Thinking'
  },

  // PRACTICAL THINKING (6 questions)
  {
    id: 13,
    text: "I prefer learning through hands-on activities and real-world applications",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 14,
    text: "When faced with a problem, I focus on finding solutions that work in practice",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 15,
    text: "I'm skilled at organizing tasks and managing my time effectively",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 16,
    text: "I value efficiency and like to find the most practical way to achieve goals",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 17,
    text: "I'm comfortable using tools, technology, or resources to complete tasks",
    style: 'practical',
    section: 'Practical Thinking'
  },
  {
    id: 18,
    text: "I prefer subjects that have clear, real-world applications and uses",
    style: 'practical',
    section: 'Practical Thinking'
  },

  // REFLECTIVE THINKING (6 questions)
  {
    id: 19,
    text: "I regularly think about my experiences and what I can learn from them",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 20,
    text: "I enjoy exploring philosophical questions and discussing deeper meanings",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 21,
    text: "I'm aware of my strengths and weaknesses and actively work on self-improvement",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 22,
    text: "Before making important decisions, I take time to consider different perspectives",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 23,
    text: "I find value in understanding my emotions and how they influence my choices",
    style: 'reflective',
    section: 'Reflective Thinking'
  },
  {
    id: 24,
    text: "I enjoy journaling, meditation, or other activities that promote self-awareness",
    style: 'reflective',
    section: 'Reflective Thinking'
  }
];

// Tertiary Programs Database with Thinking Style Alignments
export const tertiaryPrograms: TertiaryProgram[] = [
  // CREATIVE-FOCUSED PROGRAMS
  {
    name: "BS Architecture",
    description: "Design and plan buildings, structures, and spaces that are both functional and aesthetically pleasing",
    thinkingStyles: ['creative', 'analytical', 'practical'],
    careerPaths: ['Architect', 'Urban Planner', 'Interior Designer', 'Landscape Architect'],
    universities: ['UP Diliman', 'UST', 'Mapúa University', 'DLSU Manila'],
    skills: ['Spatial reasoning', 'Creative design', 'Technical drawing', 'Project management']
  },
  {
    name: "BA Fine Arts",
    description: "Express ideas and emotions through visual media including painting, sculpture, and digital art",
    thinkingStyles: ['creative', 'reflective'],
    careerPaths: ['Visual Artist', 'Art Director', 'Gallery Curator', 'Art Teacher'],
    universities: ['UP Diliman', 'UST', 'DLSU-CSB', 'FEATI University'],
    skills: ['Artistic expression', 'Visual composition', 'Art history', 'Critical analysis']
  },
  {
    name: "BS Multimedia Arts",
    description: "Create digital content combining graphics, animation, video, and interactive media",
    thinkingStyles: ['creative', 'practical'],
    careerPaths: ['Graphic Designer', 'Animator', 'UX/UI Designer', 'Video Editor'],
    universities: ['DLSU-CSB', 'Mapúa University', 'Adamson University', 'FEU'],
    skills: ['Digital design', 'Animation', 'Video production', 'User experience']
  },
  {
    name: "BA Communication",
    description: "Study media, journalism, public relations, and strategic communication",
    thinkingStyles: ['creative', 'analytical', 'practical'],
    careerPaths: ['Journalist', 'PR Specialist', 'Content Creator', 'Marketing Manager'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'UST'],
    skills: ['Writing', 'Public speaking', 'Media literacy', 'Strategic thinking']
  },
  {
    name: "BA Creative Writing",
    description: "Develop skills in fiction, poetry, creative nonfiction, and screenwriting",
    thinkingStyles: ['creative', 'reflective'],
    careerPaths: ['Author', 'Screenwriter', 'Editor', 'Content Writer'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'Silliman University'],
    skills: ['Storytelling', 'Literary analysis', 'Editing', 'Research']
  },

  // ANALYTICAL-FOCUSED PROGRAMS
  {
    name: "BS Computer Science",
    description: "Study algorithms, programming, software development, and computational theory",
    thinkingStyles: ['analytical', 'practical'],
    careerPaths: ['Software Engineer', 'Data Scientist', 'AI Specialist', 'Systems Architect'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'ADMU'],
    skills: ['Programming', 'Algorithm design', 'Problem-solving', 'Systems thinking']
  },
  {
    name: "BS Mathematics",
    description: "Explore pure and applied mathematics, statistics, and mathematical modeling",
    thinkingStyles: ['analytical', 'reflective'],
    careerPaths: ['Mathematician', 'Actuary', 'Data Analyst', 'Research Scientist'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'UST', 'DLSU Manila'],
    skills: ['Mathematical reasoning', 'Abstract thinking', 'Statistical analysis', 'Proof writing']
  },
  {
    name: "BS Physics",
    description: "Study matter, energy, and the fundamental laws governing the universe",
    thinkingStyles: ['analytical', 'reflective'],
    careerPaths: ['Physicist', 'Research Scientist', 'Data Scientist', 'Science Educator'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'UST', 'MSU-IIT'],
    skills: ['Scientific reasoning', 'Experimental design', 'Mathematical modeling', 'Critical thinking']
  },
  {
    name: "BS Chemistry",
    description: "Investigate the composition, structure, properties, and changes of matter",
    thinkingStyles: ['analytical', 'practical'],
    careerPaths: ['Chemist', 'Pharmaceutical Scientist', 'Quality Control Analyst', 'Research Scientist'],
    universities: ['UP Diliman', 'UST', 'Ateneo de Manila', 'DLSU Manila'],
    skills: ['Laboratory techniques', 'Chemical analysis', 'Problem-solving', 'Data interpretation']
  },
  {
    name: "BS Accountancy",
    description: "Learn financial reporting, auditing, taxation, and business analysis",
    thinkingStyles: ['analytical', 'practical'],
    careerPaths: ['CPA', 'Auditor', 'Financial Analyst', 'Tax Consultant'],
    universities: ['UST', 'DLSU Manila', 'UP Diliman', 'San Beda University'],
    skills: ['Financial analysis', 'Attention to detail', 'Regulatory knowledge', 'Ethics']
  },

  // PRACTICAL-FOCUSED PROGRAMS
  {
    name: "BS Engineering (Various)",
    description: "Apply science and mathematics to design, build, and maintain systems and structures",
    thinkingStyles: ['practical', 'analytical'],
    careerPaths: ['Engineer', 'Project Manager', 'Technical Consultant', 'R&D Specialist'],
    universities: ['UP Diliman', 'Mapúa University', 'DLSU Manila', 'Ateneo de Manila'],
    skills: ['Technical design', 'Problem-solving', 'Project management', 'Innovation']
  },
  {
    name: "BS Nursing",
    description: "Provide patient care, health education, and medical support in healthcare settings",
    thinkingStyles: ['practical', 'reflective'],
    careerPaths: ['Registered Nurse', 'Nurse Practitioner', 'Healthcare Administrator', 'Clinical Specialist'],
    universities: ['UST', 'FEU', 'UP Manila', 'St. Paul University'],
    skills: ['Patient care', 'Medical knowledge', 'Compassion', 'Critical thinking']
  },
  {
    name: "BS Information Technology",
    description: "Manage computer systems, networks, databases, and IT infrastructure",
    thinkingStyles: ['practical', 'analytical'],
    careerPaths: ['IT Specialist', 'Network Administrator', 'Database Manager', 'Cybersecurity Analyst'],
    universities: ['DLSU Manila', 'Mapúa University', 'TIP', 'AMA University'],
    skills: ['Systems management', 'Network configuration', 'Troubleshooting', 'Technical support']
  },
  {
    name: "BS Business Administration",
    description: "Study management, marketing, finance, and entrepreneurship for business careers",
    thinkingStyles: ['practical', 'analytical'],
    careerPaths: ['Business Manager', 'Entrepreneur', 'Marketing Specialist', 'Operations Manager'],
    universities: ['DLSU Manila', 'Ateneo de Manila', 'UP Diliman', 'UST'],
    skills: ['Leadership', 'Strategic planning', 'Decision-making', 'Communication']
  },
  {
    name: "BS Hospitality Management",
    description: "Learn hotel operations, tourism, event planning, and customer service excellence",
    thinkingStyles: ['practical', 'creative'],
    careerPaths: ['Hotel Manager', 'Event Coordinator', 'Tourism Officer', 'Restaurant Manager'],
    universities: ['DLSU-CSB', 'UST', 'FEU', 'Centro Escolar University'],
    skills: ['Customer service', 'Event management', 'Operations', 'Leadership']
  },

  // REFLECTIVE-FOCUSED PROGRAMS
  {
    name: "BA Psychology",
    description: "Study human behavior, mental processes, and psychological development",
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Psychologist', 'Counselor', 'HR Specialist', 'Researcher'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'UST'],
    skills: ['Emotional intelligence', 'Research methods', 'Counseling', 'Assessment']
  },
  {
    name: "BA Philosophy",
    description: "Explore fundamental questions about existence, knowledge, values, and reasoning",
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Academic', 'Ethicist', 'Policy Analyst', 'Consultant'],
    universities: ['Ateneo de Manila', 'UST', 'UP Diliman', 'San Beda University'],
    skills: ['Critical thinking', 'Logical reasoning', 'Ethical analysis', 'Argumentation']
  },
  {
    name: "BA Sociology",
    description: "Analyze social behavior, institutions, and the forces that shape society",
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Social Researcher', 'Community Organizer', 'Policy Analyst', 'NGO Worker'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'UST'],
    skills: ['Social analysis', 'Research', 'Critical thinking', 'Community engagement']
  },
  {
    name: "BA Political Science",
    description: "Study government systems, political behavior, public policy, and international relations",
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Policy Analyst', 'Diplomat', 'Political Consultant', 'Public Servant'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'DLSU Manila', 'UST'],
    skills: ['Political analysis', 'Research', 'Communication', 'Strategic thinking']
  },
  {
    name: "BA Education",
    description: "Prepare to teach and inspire learners across different educational levels",
    thinkingStyles: ['reflective', 'practical'],
    careerPaths: ['Teacher', 'Curriculum Developer', 'Educational Consultant', 'School Administrator'],
    universities: ['UP Diliman', 'DLSU Manila', 'PNU', 'UST'],
    skills: ['Pedagogical knowledge', 'Classroom management', 'Communication', 'Patience']
  },

  // BALANCED/HYBRID PROGRAMS
  {
    name: "BS Medical Technology",
    description: "Perform laboratory tests and analyses crucial for disease diagnosis and treatment",
    thinkingStyles: ['analytical', 'practical'],
    careerPaths: ['Medical Technologist', 'Laboratory Manager', 'Research Technician', 'Quality Analyst'],
    universities: ['UST', 'UP Manila', 'FEU', 'Centro Escolar University'],
    skills: ['Laboratory skills', 'Analytical thinking', 'Attention to detail', 'Medical knowledge']
  },
  {
    name: "BS Biology",
    description: "Study living organisms, ecosystems, genetics, and biological processes",
    thinkingStyles: ['analytical', 'reflective'],
    careerPaths: ['Biologist', 'Environmental Scientist', 'Research Scientist', 'Conservation Officer'],
    universities: ['UP Diliman', 'UST', 'Ateneo de Manila', 'DLSU Manila'],
    skills: ['Scientific research', 'Data analysis', 'Laboratory techniques', 'Environmental awareness']
  },
  {
    name: "BA Anthropology",
    description: "Study human cultures, societies, evolution, and diversity across time and space",
    thinkingStyles: ['reflective', 'analytical'],
    careerPaths: ['Anthropologist', 'Museum Curator', 'Cultural Consultant', 'Researcher'],
    universities: ['UP Diliman', 'Ateneo de Manila', 'Silliman University', 'Xavier University'],
    skills: ['Cultural analysis', 'Research methods', 'Ethnography', 'Critical thinking']
  },
  {
    name: "BS Environmental Science",
    description: "Address environmental challenges through science, policy, and sustainability practices",
    thinkingStyles: ['analytical', 'reflective', 'practical'],
    careerPaths: ['Environmental Scientist', 'Sustainability Consultant', 'Conservation Manager', 'Policy Analyst'],
    universities: ['UP Diliman', 'DLSU Manila', 'Ateneo de Manila', 'Silliman University'],
    skills: ['Environmental analysis', 'Sustainability', 'Research', 'Problem-solving']
  }
];

// Thinking Style Descriptions for SHS Students
export const shsThinkingStyles = {
  creative: {
    name: 'Creative Thinking',
    emoji: '🎨',
    color: '#FF715B',
    description: 'You excel at generating original ideas, thinking outside the box, and finding innovative solutions.',
    strengths: [
      'Imagination and originality',
      'Artistic and creative expression',
      'Flexible thinking and adaptability',
      'Risk-taking and experimentation'
    ],
    growthTips: [
      'Balance creativity with practical implementation',
      'Learn to communicate your ideas clearly to others',
      'Develop organizational skills to bring ideas to fruition',
      'Study successful innovators and their methods'
    ]
  },
  analytical: {
    name: 'Analytical Thinking',
    emoji: '🔍',
    color: '#6B4C9A',
    description: 'You have strong logical reasoning skills and excel at breaking down complex problems systematically.',
    strengths: [
      'Logical reasoning and critical thinking',
      'Pattern recognition and analysis',
      'Evidence-based decision making',
      'Research and investigation skills'
    ],
    growthTips: [
      'Practice explaining complex ideas in simple terms',
      'Develop emotional intelligence alongside logic',
      'Learn to work with incomplete information',
      'Engage in collaborative problem-solving'
    ]
  },
  practical: {
    name: 'Practical Thinking',
    emoji: '🛠️',
    color: '#C1E1C1',
    description: 'You focus on real-world applications, hands-on solutions, and efficient implementation.',
    strengths: [
      'Hands-on problem solving',
      'Time management and organization',
      'Resource optimization',
      'Goal-oriented execution'
    ],
    growthTips: [
      'Consider long-term implications beyond immediate solutions',
      'Develop strategic thinking skills',
      'Stay open to innovative approaches',
      'Balance efficiency with quality and ethics'
    ]
  },
  reflective: {
    name: 'Reflective Thinking',
    emoji: '💭',
    color: '#8E7CC3',
    description: 'You are introspective, thoughtful, and skilled at understanding yourself and others deeply.',
    strengths: [
      'Self-awareness and emotional intelligence',
      'Perspective-taking and empathy',
      'Philosophical and ethical reasoning',
      'Learning from experience'
    ],
    growthTips: [
      'Balance reflection with action',
      'Practice making timely decisions',
      'Share your insights with others',
      'Apply your understanding to practical problems'
    ]
  }
};
