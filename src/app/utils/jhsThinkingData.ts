// JHS Thinking Styles Assessment Data (Ages 11-14)

export interface JHSQuestion {
  id: number;
  section: 'creative' | 'analytical' | 'practical' | 'reflective';
  text: string;
}

export const JHS_QUESTIONS: JHSQuestion[] = [
  // 🎨 CREATIVE THINKING (1-6)
  {
    id: 1,
    section: 'creative',
    text: 'I like to think of new ways to do things — even if it\'s not the normal way.'
  },
  {
    id: 2,
    section: 'creative',
    text: 'I often have ideas that surprise people.'
  },
  {
    id: 3,
    section: 'creative',
    text: 'I enjoy drawing, building, writing, or designing something original.'
  },
  {
    id: 4,
    section: 'creative',
    text: 'I can turn a small idea into a bigger one.'
  },
  {
    id: 5,
    section: 'creative',
    text: 'When I see a problem, I like to ask, "What if we tried this instead?"'
  },
  {
    id: 6,
    section: 'creative',
    text: 'I love to mix imagination with real-life stuff — like creating, inventing, or dreaming.'
  },

  // 🔍 ANALYTICAL THINKING (7-12)
  {
    id: 7,
    section: 'analytical',
    text: 'I enjoy puzzles, riddles, or brain games that make me think deeply.'
  },
  {
    id: 8,
    section: 'analytical',
    text: 'I like to find out why or how something works.'
  },
  {
    id: 9,
    section: 'analytical',
    text: 'I notice small details that others often miss.'
  },
  {
    id: 10,
    section: 'analytical',
    text: 'I like when facts and reasons help me understand something clearly.'
  },
  {
    id: 11,
    section: 'analytical',
    text: 'Before I decide, I like to look at all sides of a situation.'
  },
  {
    id: 12,
    section: 'analytical',
    text: 'I get excited when I find the right answer after thinking hard.'
  },

  // 🛠️ PRACTICAL THINKING (13-18)
  {
    id: 13,
    section: 'practical',
    text: 'I like using what I\'ve learned to fix or improve things.'
  },
  {
    id: 14,
    section: 'practical',
    text: 'I enjoy helping others solve real-life problems.'
  },
  {
    id: 15,
    section: 'practical',
    text: 'I remember lessons better when I can try them in real life.'
  },
  {
    id: 16,
    section: 'practical',
    text: 'I can find a simple way to solve tricky problems.'
  },
  {
    id: 17,
    section: 'practical',
    text: 'I prefer doing things that have visible results (like building, organizing, or planning).'
  },
  {
    id: 18,
    section: 'practical',
    text: 'I like seeing how my ideas work outside the classroom.'
  },

  // 💭 REFLECTIVE THINKING (19-24)
  {
    id: 19,
    section: 'reflective',
    text: 'After I finish something, I like to think about what went well and what didn\'t.'
  },
  {
    id: 20,
    section: 'reflective',
    text: 'I try to understand other people\'s ideas or feelings, even when I don\'t agree.'
  },
  {
    id: 21,
    section: 'reflective',
    text: 'When I make a mistake, I learn from it and try again.'
  },
  {
    id: 22,
    section: 'reflective',
    text: 'I sometimes stop and ask myself, "Why did I choose that?"'
  },
  {
    id: 23,
    section: 'reflective',
    text: 'I notice how my feelings affect my choices.'
  },
  {
    id: 24,
    section: 'reflective',
    text: 'I like talking about what I learned from a situation or activity.'
  }
];

export interface ThinkingStyle {
  name: string;
  emoji: string;
  friendlyName: string;
  description: string;
  color: string;
}

export const THINKING_STYLES: Record<string, ThinkingStyle> = {
  creative: {
    name: 'Creative',
    emoji: '🎨',
    friendlyName: 'The Idea Explorer',
    description: 'Loves imagination, innovation, and bold new thoughts.',
    color: '#FF715B'
  },
  analytical: {
    name: 'Analytical',
    emoji: '🔍',
    friendlyName: 'The Smart Detective',
    description: 'Solves problems with logic, patterns, and facts.',
    color: '#6B4C9A'
  },
  practical: {
    name: 'Practical',
    emoji: '🛠️',
    friendlyName: 'The Real-World Builder',
    description: 'Turns ideas into real results; loves to make things work.',
    color: '#5B7DB1'
  },
  reflective: {
    name: 'Reflective',
    emoji: '💭',
    friendlyName: 'The Wise Observer',
    description: 'Thinks deeply, learns from experiences, and understands others.',
    color: '#9B59B6'
  }
};

export interface SHSProgram {
  rank: number;
  icon: string;
  name: 'Visual Arts' | 'Home Economics (Creative Design)' | 'General Arts (Communication)' | 'General Science' | 'ICT / Computer Science' | 'Business' | 'Technical / Vocational' | 'Agricultural Science' | 'Business (Entrepreneurship)' | 'Health Science / Home Economics' | 'General Arts (Social Studies)' | 'Education';
  matchingStyles: string[];
  whyItFits: string;
  futureCareers: string;
  didYouKnow: string;
  miniChallenge?: string;
}

export const SHS_PROGRAMS: Record<string, SHSProgram[]> = {
  // Creative dominant
  creative: [
    {
      rank: 1,
      icon: '🎨',
      name: 'Visual Arts',
      matchingStyles: ['creative', 'reflective'],
      whyItFits: 'You express your ideas through color, shapes, and emotions — Visual Arts helps you share how you see the world!',
      futureCareers: 'Graphic designer, writer, fashion designer, media producer, architect',
      didYouKnow: 'Artists use both sides of their brain — the creative AND the logical side!'
    },
    {
      rank: 2,
      icon: '🏠',
      name: 'Home Economics (Creative Design)',
      matchingStyles: ['creative', 'practical'],
      whyItFits: 'You love creating beautiful, useful things — Home Economics lets you design fashion, décor, and culinary masterpieces!',
      futureCareers: 'Fashion designer, interior decorator, chef, event planner',
      didYouKnow: 'Fashion designers sketch over 100 designs before choosing the perfect one!'
    },
    {
      rank: 3,
      icon: '💬',
      name: 'General Arts (Communication)',
      matchingStyles: ['creative', 'reflective'],
      whyItFits: 'You\'re thoughtful and expressive — Arts help you explore people, culture, and stories that inspire change!',
      futureCareers: 'Writer, journalist, teacher, public speaker, content creator',
      didYouKnow: 'Great communicators can change the world with just their words!'
    }
  ],

  // Analytical dominant
  analytical: [
    {
      rank: 1,
      icon: '⚗️',
      name: 'General Science',
      matchingStyles: ['analytical', 'practical'],
      whyItFits: 'You enjoy asking "why" and love figuring out how things work — Science helps you explore the world through discovery and problem-solving!',
      futureCareers: 'Engineer, researcher, accountant, computer programmer, scientist',
      didYouKnow: 'Scientists make discoveries that change millions of lives!',
      miniChallenge: 'Predict which will melt faster—ice cube in salt vs. sugar. Test + explain.'
    },
    {
      rank: 2,
      icon: '💻',
      name: 'ICT / Computer Science',
      matchingStyles: ['analytical', 'creative'],
      whyItFits: 'You like patterns and design — ICT lets you use logic and imagination to create apps, games, and new technology!',
      futureCareers: 'Software developer, game designer, data analyst, cybersecurity specialist',
      didYouKnow: 'Every app you use was created by someone who loves solving puzzles!',
      miniChallenge: 'Write "pseudocode" for making tea (step-by-step).'
    },
    {
      rank: 3,
      icon: '💼',
      name: 'Business',
      matchingStyles: ['analytical', 'practical'],
      whyItFits: 'You love structure, logic, and seeing results — Business teaches you how to manage money, people, and ideas!',
      futureCareers: 'Accountant, entrepreneur, banker, business analyst',
      didYouKnow: 'Business skills help you turn any idea into reality!',
      miniChallenge: 'Set a price for 12 cupcakes if 4 cost ¢10. What discount for 12?'
    }
  ],

  // Practical dominant
  practical: [
    {
      rank: 1,
      icon: '🔧',
      name: 'Technical / Vocational',
      matchingStyles: ['practical', 'analytical'],
      whyItFits: 'You enjoy working with your hands and seeing results — this track helps you build, create, and solve real-world problems!',
      futureCareers: 'Technician, entrepreneur, builder, mechanic, electrician',
      didYouKnow: 'Skilled workers build everything from bridges to phones!',
      miniChallenge: 'Sketch a shelf that uses exactly 6 screws; label lengths.'
    },
    {
      rank: 2,
      icon: '🌾',
      name: 'Agricultural Science',
      matchingStyles: ['practical', 'reflective'],
      whyItFits: 'You love nature and solving real problems — Agriculture helps you grow food, protect the environment, and feed the world!',
      futureCareers: 'Agricultural scientist, farmer, environmental specialist',
      didYouKnow: 'Farmers feed everyone on Earth — that\'s a superpower!'
    },
    {
      rank: 3,
      icon: '🏪',
      name: 'Business (Entrepreneurship)',
      matchingStyles: ['practical', 'creative'],
      whyItFits: 'You love turning ideas into action — Business helps you start your own projects and make them successful!',
      futureCareers: 'Entrepreneur, shop owner, business manager',
      didYouKnow: 'Some of the world\'s biggest companies started in garages!'
    }
  ],

  // Reflective dominant
  reflective: [
    {
      rank: 1,
      icon: '❤️',
      name: 'Health Science / Home Economics',
      matchingStyles: ['reflective', 'practical'],
      whyItFits: 'You care about people and love helping — Health or Home Economics lets you use your skills to improve lives!',
      futureCareers: 'Nurse, counselor, nutritionist, social worker',
      didYouKnow: 'Healthcare workers are everyday heroes who save lives!',
      miniChallenge: 'Plan a balanced snack: carb, protein, fruit/veg—explain choice.'
    },
    {
      rank: 2,
      icon: '📚',
      name: 'General Arts (Social Studies)',
      matchingStyles: ['reflective', 'creative'],
      whyItFits: 'You\'re thoughtful and love understanding people — Arts help you explore history, culture, and human behavior!',
      futureCareers: 'Teacher, psychologist, social worker, historian',
      didYouKnow: 'Understanding people is the first step to making the world better!'
    },
    {
      rank: 3,
      icon: '🎓',
      name: 'Education',
      matchingStyles: ['reflective', 'practical'],
      whyItFits: 'You love helping others learn and grow — Education lets you inspire the next generation!',
      futureCareers: 'Teacher, education officer, school counselor',
      didYouKnow: 'Great teachers change lives forever!'
    }
  ]
};

export const MIXED_STYLES: Record<string, { personalityType: string; programs: string[] }> = {
  'creative-analytical': {
    personalityType: 'Inventive Thinker',
    programs: ['General Science', 'ICT / Computer Science', 'Design Technology']
  },
  'analytical-reflective': {
    personalityType: 'Insightful Thinker',
    programs: ['General Arts', 'Education', 'Health Science']
  },
  'practical-creative': {
    personalityType: 'Innovator / Builder',
    programs: ['Visual Arts', 'Technical / Vocational', 'Entrepreneurship']
  },
  'reflective-creative': {
    personalityType: 'Empathetic Creator',
    programs: ['General Arts', 'Languages', 'Home Economics']
  },
  'practical-analytical': {
    personalityType: 'Logical Problem Solver',
    programs: ['Engineering', 'Technical Science', 'ICT']
  }
};

export const MOTIVATION_MESSAGES = [
  "Your brain loves challenges — feed it a puzzle today!",
  "Big ideas start with small questions — keep asking why!",
  "You learn faster when you share what you know!",
  "One smart thought today can spark a great idea tomorrow!",
  "Every question you ask makes your brain stronger!",
  "Mistakes are just steps on the road to success!",
  "Your unique thinking style is your superpower!",
  "Great minds think differently — just like you!"
];

// Career Explorer Data
export interface Career {
  title: string;
  emoji: string;
  description: string;
  whatYouDo: string[];
  skillsNeeded: string[];
  educationPath: string;
  salaryRange: string;
  funFact: string;
  matchingStyles: string[];
}

export const CAREER_PATHS: Record<string, Career[]> = {
  creative: [
    {
      title: 'Graphic Designer',
      emoji: '🎨',
      description: 'Create visual designs for websites, ads, magazines, and brands',
      whatYouDo: [
        'Design logos, posters, and social media graphics',
        'Choose colors, fonts, and layouts that tell a story',
        'Work with clients to bring their vision to life',
        'Use software like Adobe Photoshop and Illustrator'
      ],
      skillsNeeded: ['Creativity', 'Attention to detail', 'Communication', 'Technology skills'],
      educationPath: 'Visual Arts → College/University (Graphic Design, Fine Arts) → Internships',
      salaryRange: '₱20,000 - ₱80,000/month (depends on experience)',
      funFact: 'The Nike swoosh logo was designed by a student for just $35!',
      matchingStyles: ['creative', 'analytical']
    },
    {
      title: 'Architect',
      emoji: '🏛️',
      description: 'Design buildings, homes, and spaces where people live and work',
      whatYouDo: [
        'Draw blueprints and 3D models of buildings',
        'Combine art, math, and engineering to create structures',
        'Visit construction sites to ensure designs are built correctly',
        'Think about safety, beauty, and how people will use the space'
      ],
      skillsNeeded: ['Creativity', 'Math & science', 'Problem-solving', 'Drawing/sketching'],
      educationPath: 'Visual Arts/Science → University (Architecture, 5 years) → License exam',
      salaryRange: '₱25,000 - ₱150,000/month',
      funFact: 'Architects designed the world\'s tallest building, Burj Khalifa, to withstand earthquakes!',
      matchingStyles: ['creative', 'practical', 'analytical']
    },
    {
      title: 'Content Creator / YouTuber',
      emoji: '📹',
      description: 'Create videos, blogs, or social media content that entertains and educates',
      whatYouDo: [
        'Film and edit videos on topics you love',
        'Write scripts, captions, and engaging stories',
        'Build an audience and interact with followers',
        'Earn through ads, sponsorships, or selling products'
      ],
      skillsNeeded: ['Creativity', 'Video editing', 'Communication', 'Consistency'],
      educationPath: 'General Arts/Any strand → College (Media, Communication) or self-taught',
      salaryRange: '₱0 - ₱500,000+/month (highly variable)',
      funFact: 'Some YouTubers earn millions by simply sharing their passions!',
      matchingStyles: ['creative', 'reflective']
    },
    {
      title: 'Fashion Designer',
      emoji: '👗',
      description: 'Design clothing, accessories, and fashion collections',
      whatYouDo: [
        'Sketch clothing designs and choose fabrics',
        'Create patterns and sew prototypes',
        'Follow fashion trends and create new styles',
        'Organize fashion shows or sell designs to brands'
      ],
      skillsNeeded: ['Creativity', 'Sewing/crafting', 'Trend awareness', 'Business sense'],
      educationPath: 'Home Economics → College (Fashion Design) → Portfolio building',
      salaryRange: '₱15,000 - ₱100,000+/month',
      funFact: 'Coco Chanel started as a hat maker and became a fashion icon!',
      matchingStyles: ['creative', 'practical']
    }
  ],
  
  analytical: [
    {
      title: 'Software Developer',
      emoji: '💻',
      description: 'Build apps, websites, and computer programs',
      whatYouDo: [
        'Write code in languages like Python, Java, or JavaScript',
        'Create apps people use every day (like games, social media, banking apps)',
        'Fix bugs and improve existing software',
        'Work with teams to solve technical problems'
      ],
      skillsNeeded: ['Logic & problem-solving', 'Math', 'Patience', 'Continuous learning'],
      educationPath: 'Science/ICT → University (Computer Science, IT) → Coding bootcamps',
      salaryRange: '₱30,000 - ₱200,000+/month',
      funFact: 'The first computer programmer was a woman named Ada Lovelace in the 1800s!',
      matchingStyles: ['analytical', 'creative']
    },
    {
      title: 'Data Scientist',
      emoji: '📊',
      description: 'Analyze large amounts of information to help companies make smart decisions',
      whatYouDo: [
        'Collect and clean data from various sources',
        'Use statistics and AI to find patterns and trends',
        'Create visualizations (charts, graphs) to explain findings',
        'Help businesses predict customer behavior or improve services'
      ],
      skillsNeeded: ['Math & statistics', 'Critical thinking', 'Programming', 'Communication'],
      educationPath: 'Science → University (Data Science, Statistics, Computer Science) → Certifications',
      salaryRange: '₱40,000 - ₱250,000+/month',
      funFact: 'Data scientists helped Netflix recommend shows you might like!',
      matchingStyles: ['analytical', 'practical']
    },
    {
      title: 'Civil Engineer',
      emoji: '🏗️',
      description: 'Design and build infrastructure like roads, bridges, and buildings',
      whatYouDo: [
        'Plan construction projects using math and physics',
        'Make sure structures are safe and can last for years',
        'Supervise construction teams on-site',
        'Solve problems like flooding, traffic, or earthquakes'
      ],
      skillsNeeded: ['Math & science', 'Problem-solving', 'Leadership', 'Attention to detail'],
      educationPath: 'Science → University (Civil Engineering, 5 years) → License exam',
      salaryRange: '₱25,000 - ₱120,000+/month',
      funFact: 'Engineers built bridges that can hold thousands of cars at once!',
      matchingStyles: ['analytical', 'practical']
    },
    {
      title: 'Doctor / Surgeon',
      emoji: '⚕️',
      description: 'Diagnose illnesses and treat patients to improve their health',
      whatYouDo: [
        'Examine patients and run medical tests',
        'Prescribe treatments and medications',
        'Perform surgeries (if you become a surgeon)',
        'Keep learning about new medical discoveries'
      ],
      skillsNeeded: ['Science knowledge', 'Empathy', 'Problem-solving', 'Focus & dedication'],
      educationPath: 'Science → Pre-Med (4 years) → Med School (4 years) → Residency (3-7 years)',
      salaryRange: '₱50,000 - ₱500,000+/month',
      funFact: 'Doctors save lives every day and are always learning!',
      matchingStyles: ['analytical', 'reflective']
    }
  ],
  
  practical: [
    {
      title: 'Electrician',
      emoji: '⚡',
      description: 'Install and repair electrical systems in homes, buildings, and factories',
      whatYouDo: [
        'Install wiring, outlets, and lighting systems',
        'Troubleshoot and fix electrical problems',
        'Read blueprints and follow safety codes',
        'Work on construction sites or in people\'s homes'
      ],
      skillsNeeded: ['Technical skills', 'Problem-solving', 'Safety awareness', 'Physical fitness'],
      educationPath: 'Technical/Vocational → TESDA certification → Apprenticeship',
      salaryRange: '₱15,000 - ₱60,000/month',
      funFact: 'Electricians keep the world powered — from hospitals to your home!',
      matchingStyles: ['practical', 'analytical']
    },
    {
      title: 'Chef / Culinary Expert',
      emoji: '👨‍🍳',
      description: 'Prepare delicious food and create new recipes in restaurants or hotels',
      whatYouDo: [
        'Cook meals for customers or special events',
        'Design menus and experiment with flavors',
        'Manage kitchen staff and food supplies',
        'Ensure food safety and quality'
      ],
      skillsNeeded: ['Cooking skills', 'Creativity', 'Time management', 'Teamwork'],
      educationPath: 'Home Economics → Culinary school or apprenticeship → Kitchen experience',
      salaryRange: '₱18,000 - ₱150,000+/month',
      funFact: 'Celebrity chefs can earn millions and travel the world!',
      matchingStyles: ['practical', 'creative']
    },
    {
      title: 'Nurse',
      emoji: '🩺',
      description: 'Care for sick or injured people in hospitals, clinics, or homes',
      whatYouDo: [
        'Check vital signs (temperature, blood pressure)',
        'Give medications and treatments prescribed by doctors',
        'Comfort patients and their families',
        'Work closely with doctors and medical teams'
      ],
      skillsNeeded: ['Compassion', 'Science knowledge', 'Communication', 'Stamina'],
      educationPath: 'Science → University (Nursing, 4 years) → License exam',
      salaryRange: '₱20,000 - ₱100,000+/month (higher abroad)',
      funFact: 'Nurses are the backbone of healthcare and can work anywhere in the world!',
      matchingStyles: ['practical', 'reflective']
    },
    {
      title: 'Automotive Technician',
      emoji: '🔧',
      description: 'Repair and maintain cars, motorcycles, and other vehicles',
      whatYouDo: [
        'Diagnose engine and mechanical problems',
        'Replace parts like brakes, batteries, and tires',
        'Perform regular maintenance (oil changes, tune-ups)',
        'Use diagnostic tools and computer systems'
      ],
      skillsNeeded: ['Mechanical skills', 'Problem-solving', 'Technology', 'Detail-oriented'],
      educationPath: 'Technical strand → TESDA certification → On-the-job training',
      salaryRange: '₱15,000 - ₱70,000/month',
      funFact: 'Modern cars have computers, so mechanics now use laptops to fix them!',
      matchingStyles: ['practical', 'analytical']
    }
  ],
  
  reflective: [
    {
      title: 'Psychologist / Counselor',
      emoji: '🧠',
      description: 'Help people understand their emotions and solve personal challenges',
      whatYouDo: [
        'Listen to people\'s problems and provide guidance',
        'Conduct therapy sessions and assessments',
        'Help with mental health issues like anxiety or depression',
        'Work in schools, hospitals, or private practice'
      ],
      skillsNeeded: ['Empathy', 'Active listening', 'Communication', 'Patience'],
      educationPath: 'General Arts → University (Psychology, 4 years) → Master\'s degree → License',
      salaryRange: '₱25,000 - ₱100,000+/month',
      funFact: 'Psychologists help people live happier, healthier lives!',
      matchingStyles: ['reflective', 'analytical']
    },
    {
      title: 'Teacher',
      emoji: '👩‍🏫',
      description: 'Educate and inspire the next generation of students',
      whatYouDo: [
        'Plan lessons and teach subjects you\'re passionate about',
        'Grade assignments and track student progress',
        'Create a positive learning environment',
        'Mentor students and help them reach their potential'
      ],
      skillsNeeded: ['Communication', 'Patience', 'Organization', 'Subject expertise'],
      educationPath: 'Any strand → University (Education, 4 years) → License exam',
      salaryRange: '₱18,000 - ₱80,000/month (public vs private)',
      funFact: 'Teachers shape future doctors, engineers, and leaders!',
      matchingStyles: ['reflective', 'creative']
    },
    {
      title: 'Social Worker',
      emoji: '🤝',
      description: 'Help individuals and communities overcome challenges and improve their lives',
      whatYouDo: [
        'Support families facing poverty, abuse, or crisis',
        'Connect people to resources (food, shelter, healthcare)',
        'Advocate for children, elderly, or vulnerable groups',
        'Work with government agencies or NGOs'
      ],
      skillsNeeded: ['Empathy', 'Communication', 'Problem-solving', 'Resilience'],
      educationPath: 'General Arts → University (Social Work, 4 years) → License exam',
      salaryRange: '₱20,000 - ₱60,000/month',
      funFact: 'Social workers change lives and make communities stronger!',
      matchingStyles: ['reflective', 'practical']
    },
    {
      title: 'Writer / Author',
      emoji: '✍️',
      description: 'Create stories, articles, books, or scripts that inform or entertain',
      whatYouDo: [
        'Write novels, short stories, or poetry',
        'Research and write articles for magazines or websites',
        'Create scripts for movies, TV shows, or plays',
        'Edit and revise your work until it\'s perfect'
      ],
      skillsNeeded: ['Creativity', 'Grammar & language', 'Research', 'Discipline'],
      educationPath: 'General Arts → University (Literature, Creative Writing, Journalism) or self-taught',
      salaryRange: '₱15,000 - ₱200,000+/month (highly variable)',
      funFact: 'J.K. Rowling wrote Harry Potter in cafes and became a billionaire!',
      matchingStyles: ['reflective', 'creative']
    }
  ]
};