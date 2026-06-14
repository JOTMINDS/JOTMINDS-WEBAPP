// Assessment question pools for each framework

export const learningStyleQuestions = [
  {
    id: 'ls1',
    question: 'When learning something new, I prefer to:',
    options: [
      { text: 'See demonstrations and visual examples', style: 'Visual' },
      { text: 'Listen to explanations and discussions', style: 'Auditory' },
      { text: 'Try it hands-on and practice', style: 'Kinesthetic' },
      { text: 'Read about it and take notes', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls2',
    question: 'I remember information best when:',
    options: [
      { text: 'I can picture it in my mind', style: 'Visual' },
      { text: 'I hear it repeated or discussed', style: 'Auditory' },
      { text: 'I write it down or create summaries', style: 'Reading/Writing' },
      { text: 'I physically engage with the material', style: 'Kinesthetic' }
    ]
  },
  {
    id: 'ls3',
    question: 'During group work, I tend to:',
    options: [
      { text: 'Create diagrams or visual organizers', style: 'Visual' },
      { text: 'Lead discussions and explain ideas verbally', style: 'Auditory' },
      { text: 'Build models or demonstrate concepts', style: 'Kinesthetic' },
      { text: 'Document findings and write reports', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls4',
    question: 'When studying for exams, I:',
    options: [
      { text: 'Review charts, graphs, and highlighted notes', style: 'Visual' },
      { text: 'Talk through the material with others', style: 'Auditory' },
      { text: 'Use flashcards and practice problems', style: 'Kinesthetic' },
      { text: 'Rewrite notes and create outlines', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls5',
    question: 'I find it easier to understand:',
    options: [
      { text: 'Maps, diagrams, and infographics', style: 'Visual' },
      { text: 'Podcasts, lectures, and audio recordings', style: 'Auditory' },
      { text: 'Simulations, experiments, and activities', style: 'Kinesthetic' },
      { text: 'Articles, textbooks, and written instructions', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls6',
    question: 'My ideal classroom includes:',
    options: [
      { text: 'Lots of visual aids and colorful materials', style: 'Visual' },
      { text: 'Group discussions and presentations', style: 'Auditory' },
      { text: 'Lab work and hands-on projects', style: 'Kinesthetic' },
      { text: 'Reading assignments and essay writing', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls7',
    question: 'When giving directions, I prefer to:',
    options: [
      { text: 'Draw a map or show the route', style: 'Visual' },
      { text: 'Explain verbally step by step', style: 'Auditory' },
      { text: 'Walk through it physically', style: 'Kinesthetic' },
      { text: 'Write down the directions', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls8',
    question: 'I concentrate best when:',
    options: [
      { text: 'The environment is visually organized', style: 'Visual' },
      { text: 'There is background music or sound', style: 'Auditory' },
      { text: 'I can move around or fidget', style: 'Kinesthetic' },
      { text: 'I have written materials to reference', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls9',
    question: 'To solve a problem, I usually:',
    options: [
      { text: 'Visualize different solutions', style: 'Visual' },
      { text: 'Talk it through with someone', style: 'Auditory' },
      { text: 'Try different approaches practically', style: 'Kinesthetic' },
      { text: 'Research and read about solutions', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls10',
    question: 'I express my understanding by:',
    options: [
      { text: 'Creating presentations or posters', style: 'Visual' },
      { text: 'Giving oral explanations', style: 'Auditory' },
      { text: 'Demonstrating or performing', style: 'Kinesthetic' },
      { text: 'Writing detailed responses', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls11',
    question: 'When assembling furniture, I:',
    options: [
      { text: 'Follow the picture diagrams', style: 'Visual' },
      { text: 'Ask for verbal guidance', style: 'Auditory' },
      { text: 'Jump in and figure it out by doing', style: 'Kinesthetic' },
      { text: 'Read the written instructions carefully', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls12',
    question: 'My notes typically include:',
    options: [
      { text: 'Drawings, colors, and symbols', style: 'Visual' },
      { text: 'Key phrases from discussions', style: 'Auditory' },
      { text: 'Brief reminders of activities done', style: 'Kinesthetic' },
      { text: 'Detailed written explanations', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls13',
    question: 'I learn new technology by:',
    options: [
      { text: 'Watching tutorial videos', style: 'Visual' },
      { text: 'Having someone explain it to me', style: 'Auditory' },
      { text: 'Exploring and clicking around', style: 'Kinesthetic' },
      { text: 'Reading the manual or help guide', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls14',
    question: 'In free time, I enjoy:',
    options: [
      { text: 'Watching videos or browsing images', style: 'Visual' },
      { text: 'Listening to music or podcasts', style: 'Auditory' },
      { text: 'Playing sports or crafting', style: 'Kinesthetic' },
      { text: 'Reading books or articles', style: 'Reading/Writing' }
    ]
  },
  {
    id: 'ls15',
    question: 'When recalling memories, I remember:',
    options: [
      { text: 'What I saw - visual details', style: 'Visual' },
      { text: 'What was said - conversations', style: 'Auditory' },
      { text: 'What I did - actions and feelings', style: 'Kinesthetic' },
      { text: 'What I wrote or read about it', style: 'Reading/Writing' }
    ]
  }
];

export const thinkingStyleQuestions = [
  {
    id: 'ts1',
    question: 'When facing a complex problem, I tend to:',
    options: [
      { text: 'Break it into smaller, logical steps', style: 'Analytical' },
      { text: 'Look at the big picture and connections', style: 'Holistic' },
      { text: 'Brainstorm multiple creative solutions', style: 'Creative' },
      { text: 'Apply proven methods that worked before', style: 'Practical' }
    ]
  },
  {
    id: 'ts2',
    question: 'I approach new challenges by:',
    options: [
      { text: 'Researching and analyzing data', style: 'Analytical' },
      { text: 'Considering the broader context', style: 'Holistic' },
      { text: 'Exploring innovative approaches', style: 'Creative' },
      { text: 'Using reliable, tested strategies', style: 'Practical' }
    ]
  },
  {
    id: 'ts3',
    question: 'When working on projects, I prefer to:',
    options: [
      { text: 'Follow a systematic plan with clear steps', style: 'Analytical' },
      { text: 'Understand how everything fits together', style: 'Holistic' },
      { text: 'Experiment with original ideas', style: 'Creative' },
      { text: 'Focus on what will actually work', style: 'Practical' }
    ]
  },
  {
    id: 'ts4',
    question: 'My thinking process is best described as:',
    options: [
      { text: 'Linear and sequential', style: 'Analytical' },
      { text: 'Integrative and interconnected', style: 'Holistic' },
      { text: 'Abstract and imaginative', style: 'Creative' },
      { text: 'Concrete and results-oriented', style: 'Practical' }
    ]
  },
  {
    id: 'ts5',
    question: 'I feel most confident when:',
    options: [
      { text: 'I have facts and evidence to support my thinking', style: 'Analytical' },
      { text: 'I understand the complete system', style: 'Holistic' },
      { text: 'I can think outside the box', style: 'Creative' },
      { text: 'I can see tangible results', style: 'Practical' }
    ]
  },
  {
    id: 'ts6',
    question: 'When learning new concepts, I:',
    options: [
      { text: 'Examine each component in detail', style: 'Analytical' },
      { text: 'Look for patterns and relationships', style: 'Holistic' },
      { text: 'Make unique connections and analogies', style: 'Creative' },
      { text: 'Think about real-world applications', style: 'Practical' }
    ]
  },
  {
    id: 'ts7',
    question: 'My ideal work environment encourages:',
    options: [
      { text: 'Precision and accuracy', style: 'Analytical' },
      { text: 'Collaboration and synthesis', style: 'Holistic' },
      { text: 'Innovation and experimentation', style: 'Creative' },
      { text: 'Efficiency and productivity', style: 'Practical' }
    ]
  },
  {
    id: 'ts8',
    question: 'When making plans, I:',
    options: [
      { text: 'Create detailed, structured outlines', style: 'Analytical' },
      { text: 'Consider all stakeholders and impacts', style: 'Holistic' },
      { text: 'Design flexible, adaptable approaches', style: 'Creative' },
      { text: 'Focus on achievable, concrete goals', style: 'Practical' }
    ]
  },
  {
    id: 'ts9',
    question: 'I am most interested in:',
    options: [
      { text: 'Understanding the underlying principles', style: 'Analytical' },
      { text: 'Seeing the interconnected whole', style: 'Holistic' },
      { text: 'Discovering new possibilities', style: 'Creative' },
      { text: 'Implementing effective solutions', style: 'Practical' }
    ]
  },
  {
    id: 'ts10',
    question: 'When evaluating ideas, I prioritize:',
    options: [
      { text: 'Logical consistency and rigor', style: 'Analytical' },
      { text: 'Overall coherence and balance', style: 'Holistic' },
      { text: 'Originality and novelty', style: 'Creative' },
      { text: 'Feasibility and usefulness', style: 'Practical' }
    ]
  },
  {
    id: 'ts11',
    question: 'My strengths include:',
    options: [
      { text: 'Critical thinking and problem-solving', style: 'Analytical' },
      { text: 'Systems thinking and synthesis', style: 'Holistic' },
      { text: 'Imagination and innovation', style: 'Creative' },
      { text: 'Common sense and pragmatism', style: 'Practical' }
    ]
  },
  {
    id: 'ts12',
    question: 'I communicate ideas by:',
    options: [
      { text: 'Using data and logical arguments', style: 'Analytical' },
      { text: 'Explaining relationships and context', style: 'Holistic' },
      { text: 'Using metaphors and stories', style: 'Creative' },
      { text: 'Providing clear, actionable points', style: 'Practical' }
    ]
  },
  {
    id: 'ts13',
    question: 'When faced with uncertainty, I:',
    options: [
      { text: 'Gather more information to analyze', style: 'Analytical' },
      { text: 'Consider multiple perspectives', style: 'Holistic' },
      { text: 'Trust my intuition and insights', style: 'Creative' },
      { text: 'Take practical steps forward', style: 'Practical' }
    ]
  },
  {
    id: 'ts14',
    question: 'Success for me means:',
    options: [
      { text: 'Solving problems correctly', style: 'Analytical' },
      { text: 'Creating harmony and integration', style: 'Holistic' },
      { text: 'Generating original contributions', style: 'Creative' },
      { text: 'Achieving measurable outcomes', style: 'Practical' }
    ]
  },
  {
    id: 'ts15',
    question: 'I prefer tasks that are:',
    options: [
      { text: 'Structured and well-defined', style: 'Analytical' },
      { text: 'Collaborative and multifaceted', style: 'Holistic' },
      { text: 'Open-ended and exploratory', style: 'Creative' },
      { text: 'Goal-oriented and hands-on', style: 'Practical' }
    ]
  }
];

export const decisionStyleQuestions = [
  {
    id: 'ds1',
    question: 'When making important decisions, I usually:',
    options: [
      { text: 'Analyze all available data carefully', style: 'Data-Driven' },
      { text: 'Trust my gut feeling', style: 'Intuitive' },
      { text: 'Consult with others and seek input', style: 'Collaborative' },
      { text: 'Make quick choices and adjust as needed', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds2',
    question: 'My decision-making process involves:',
    options: [
      { text: 'Creating pros/cons lists and comparisons', style: 'Data-Driven' },
      { text: 'Reflecting on what feels right', style: 'Intuitive' },
      { text: 'Discussing options with trusted people', style: 'Collaborative' },
      { text: 'Going with my first instinct', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds3',
    question: 'I feel confident in my decisions when:',
    options: [
      { text: 'They are backed by solid evidence', style: 'Data-Driven' },
      { text: 'They align with my inner sense', style: 'Intuitive' },
      { text: 'Others agree and support them', style: 'Collaborative' },
      { text: 'I can adapt them if things change', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds4',
    question: 'When time is limited, I:',
    options: [
      { text: 'Focus on the most critical data points', style: 'Data-Driven' },
      { text: 'Rely on my experience and instincts', style: 'Intuitive' },
      { text: 'Get quick input from key people', style: 'Collaborative' },
      { text: 'Make the call and move forward', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds5',
    question: 'Before committing to a choice, I need to:',
    options: [
      { text: 'Review all facts and figures', style: 'Data-Driven' },
      { text: 'Feel at peace with it internally', style: 'Intuitive' },
      { text: 'Ensure team alignment', style: 'Collaborative' },
      { text: 'Just feel ready to act', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds6',
    question: 'I reconsider decisions when:',
    options: [
      { text: 'New data emerges', style: 'Data-Driven' },
      { text: 'Something doesn\'t feel right', style: 'Intuitive' },
      { text: 'Others raise valid concerns', style: 'Collaborative' },
      { text: 'Circumstances change', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds7',
    question: 'My biggest decision-making strength is:',
    options: [
      { text: 'Thorough analysis and objectivity', style: 'Data-Driven' },
      { text: 'Strong intuition and insight', style: 'Intuitive' },
      { text: 'Building consensus and buy-in', style: 'Collaborative' },
      { text: 'Flexibility and adaptability', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds8',
    question: 'When others disagree with my decision, I:',
    options: [
      { text: 'Present the evidence supporting it', style: 'Data-Driven' },
      { text: 'Explain my reasoning and perspective', style: 'Intuitive' },
      { text: 'Listen and look for compromise', style: 'Collaborative' },
      { text: 'Remain open to changing course', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds9',
    question: 'I avoid decisions that:',
    options: [
      { text: 'Lack sufficient information', style: 'Data-Driven' },
      { text: 'Don\'t align with my values', style: 'Intuitive' },
      { text: 'Create unnecessary conflict', style: 'Collaborative' },
      { text: 'Lock me into rigid commitments', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds10',
    question: 'My decision-making style is:',
    options: [
      { text: 'Methodical and systematic', style: 'Data-Driven' },
      { text: 'Reflective and value-based', style: 'Intuitive' },
      { text: 'Inclusive and consultative', style: 'Collaborative' },
      { text: 'Dynamic and responsive', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds11',
    question: 'After making a decision, I typically:',
    options: [
      { text: 'Track metrics to evaluate it', style: 'Data-Driven' },
      { text: 'Reflect on how it feels', style: 'Intuitive' },
      { text: 'Check in with those affected', style: 'Collaborative' },
      { text: 'Move on to the next thing', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds12',
    question: 'In group decisions, I contribute by:',
    options: [
      { text: 'Providing data and analysis', style: 'Data-Driven' },
      { text: 'Offering insights and perspectives', style: 'Intuitive' },
      { text: 'Facilitating discussion', style: 'Collaborative' },
      { text: 'Keeping things moving forward', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds13',
    question: 'I learn from decisions by:',
    options: [
      { text: 'Analyzing outcomes objectively', style: 'Data-Driven' },
      { text: 'Reflecting on the experience', style: 'Intuitive' },
      { text: 'Discussing with others involved', style: 'Collaborative' },
      { text: 'Trying different approaches', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds14',
    question: 'For major life decisions, I:',
    options: [
      { text: 'Research extensively', style: 'Data-Driven' },
      { text: 'Listen to my inner voice', style: 'Intuitive' },
      { text: 'Talk it through with loved ones', style: 'Collaborative' },
      { text: 'Trust the process will unfold', style: 'Spontaneous' }
    ]
  },
  {
    id: 'ds15',
    question: 'I regret decisions that were:',
    options: [
      { text: 'Made without enough information', style: 'Data-Driven' },
      { text: 'Against my better judgment', style: 'Intuitive' },
      { text: 'Made without considering others', style: 'Collaborative' },
      { text: 'Too rigid or inflexible', style: 'Spontaneous' }
    ]
  }
];

// Function to generate personalized 12-question subset using seeded random
export const generatePersonalizedQuestions = (userId: string, allQuestions: any[]) => {
  // Create a seeded random number generator
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let random = seed;
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };
  
  // Fisher-Yates shuffle with seeded random
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return first 12 questions
  return shuffled.slice(0, 12);
};

// Calculate results from answers
export const calculateResults = (answers: any[], assessmentType: string) => {
  const counts: { [key: string]: number } = {};
  
  answers.forEach(answer => {
    const style = answer.selectedStyle;
    counts[style] = (counts[style] || 0) + 1;
  });
  
  // Convert to percentages
  const total = answers.length;
  const results: { [key: string]: number } = {};
  
  Object.keys(counts).forEach(style => {
    results[style] = Math.round((counts[style] / total) * 100);
  });
  
  return results;
};

// Generate strengths, weaknesses, and recommendations
export const generateInsights = (results: { [key: string]: number }, assessmentType: string) => {
  const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const secondary = sorted.length > 1 ? sorted[1][0] : null;
  
  const insights: { [key: string]: any } = {
    'learning': {
      'Visual': {
        strengths: [
          'Excellent at understanding charts, graphs, and diagrams',
          'Strong spatial awareness and memory for visual details',
          'Effective at organizing information visually'
        ],
        weaknesses: [
          'May struggle with purely verbal instructions',
          'Could miss details in audio-only presentations',
          'Might need visual aids to stay engaged'
        ],
        recommendations: [
          'Use mind maps and color-coding in your notes',
          'Watch educational videos and visual demonstrations',
          'Create visual summaries of written materials',
          'Request visual materials from instructors when possible'
        ]
      },
      'Auditory': {
        strengths: [
          'Excellent listening and verbal communication skills',
          'Strong ability to remember spoken information',
          'Effective in group discussions and debates'
        ],
        weaknesses: [
          'May find silent reading less effective',
          'Could be distracted by noise',
          'Might struggle with purely visual information'
        ],
        recommendations: [
          'Record lectures and listen to them again',
          'Participate actively in class discussions',
          'Read materials aloud to yourself',
          'Use mnemonic devices and verbal repetition'
        ]
      },
      'Kinesthetic': {
        strengths: [
          'Learn best through hands-on experience',
          'Strong motor skills and physical coordination',
          'Excellent at practical application of concepts'
        ],
        weaknesses: [
          'May struggle with prolonged sitting and listening',
          'Could find abstract concepts challenging without physical connection',
          'Might need more time for traditional reading-based learning'
        ],
        recommendations: [
          'Take frequent breaks to move around while studying',
          'Use hands-on activities and experiments when possible',
          'Create physical models or act out concepts',
          'Incorporate movement into your learning routine'
        ]
      },
      'Reading/Writing': {
        strengths: [
          'Strong reading comprehension and writing skills',
          'Excellent at taking detailed notes',
          'Effective at organizing and synthesizing information'
        ],
        weaknesses: [
          'May miss nuances in verbal communication',
          'Could spend too much time on written materials',
          'Might struggle with purely experiential learning'
        ],
        recommendations: [
          'Rewrite notes in your own words',
          'Create written summaries and outlines',
          'Use lists, definitions, and written explanations',
          'Keep a learning journal to reflect on new concepts'
        ]
      }
    },
    'thinking': {
      'Analytical': {
        strengths: [
          'Excellent logical reasoning and critical thinking',
          'Strong problem-solving with systematic approaches',
          'Effective at breaking down complex issues'
        ],
        weaknesses: [
          'May overanalyze and experience analysis paralysis',
          'Could miss the big picture by focusing on details',
          'Might struggle with ambiguity and incomplete information'
        ],
        recommendations: [
          'Balance detailed analysis with holistic thinking',
          'Set time limits for decision-making to avoid overthinking',
          'Practice considering emotional and intuitive factors',
          'Collaborate with creative thinkers for balanced perspectives'
        ]
      },
      'Holistic': {
        strengths: [
          'Excellent at seeing patterns and connections',
          'Strong systems thinking and integration skills',
          'Effective at considering multiple perspectives'
        ],
        weaknesses: [
          'May overlook important details',
          'Could struggle with step-by-step processes',
          'Might have difficulty with linear, sequential tasks'
        ],
        recommendations: [
          'Partner with analytical thinkers for detail work',
          'Create visual maps of systems and relationships',
          'Practice breaking down big ideas into actionable steps',
          'Use your synthesis skills in collaborative projects'
        ]
      },
      'Creative': {
        strengths: [
          'Excellent at generating innovative ideas',
          'Strong imagination and original thinking',
          'Effective at finding unique solutions'
        ],
        weaknesses: [
          'May struggle with conventional methods',
          'Could have difficulty with routine tasks',
          'Might need help with practical implementation'
        ],
        recommendations: [
          'Balance creativity with practical constraints',
          'Seek feedback to refine innovative ideas',
          'Partner with practical thinkers for execution',
          'Document your creative process for future reference'
        ]
      },
      'Practical': {
        strengths: [
          'Excellent at implementation and execution',
          'Strong focus on real-world results',
          'Effective at finding workable solutions quickly'
        ],
        weaknesses: [
          'May dismiss innovative or theoretical approaches',
          'Could miss opportunities for optimization',
          'Might struggle with abstract or philosophical concepts'
        ],
        recommendations: [
          'Consider long-term implications alongside immediate results',
          'Explore creative alternatives before settling on solutions',
          'Balance efficiency with innovation',
          'Connect abstract concepts to practical applications'
        ]
      }
    },
    'decision': {
      'Data-Driven': {
        strengths: [
          'Makes well-informed, objective decisions',
          'Strong analytical and research skills',
          'Minimizes bias through evidence-based approach'
        ],
        weaknesses: [
          'May delay decisions waiting for perfect information',
          'Could overlook intuition and emotional factors',
          'Might struggle when data is unavailable or ambiguous'
        ],
        recommendations: [
          'Set deadlines for data gathering to avoid analysis paralysis',
          'Consider qualitative factors alongside quantitative data',
          'Practice making decisions with incomplete information',
          'Balance data analysis with stakeholder input'
        ]
      },
      'Intuitive': {
        strengths: [
          'Quick decision-making based on experience',
          'Strong pattern recognition and insight',
          'Effective in ambiguous or novel situations'
        ],
        weaknesses: [
          'May be influenced by unconscious biases',
          'Could struggle to justify decisions to others',
          'Might overlook important factual information'
        ],
        recommendations: [
          'Validate intuitions with data when possible',
          'Reflect on past decisions to understand your intuition',
          'Document your reasoning process for transparency',
          'Seek diverse perspectives to challenge assumptions'
        ]
      },
      'Collaborative': {
        strengths: [
          'Builds consensus and team alignment',
          'Considers diverse perspectives and inputs',
          'Creates buy-in and shared ownership'
        ],
        weaknesses: [
          'May take longer to reach decisions',
          'Could struggle with unpopular but necessary choices',
          'Might compromise too much to maintain harmony'
        ],
        recommendations: [
          'Set clear timelines for collaborative decision processes',
          'Practice making tough decisions when consensus isn\'t possible',
          'Distinguish between decisions requiring input vs. approval',
          'Develop skills in facilitating efficient group discussions'
        ]
      },
      'Spontaneous': {
        strengths: [
          'Highly adaptable and flexible',
          'Quick to seize opportunities',
          'Comfortable with uncertainty and change'
        ],
        weaknesses: [
          'May make impulsive decisions without adequate reflection',
          'Could struggle with long-term planning',
          'Might change direction too frequently'
        ],
        recommendations: [
          'Build in brief reflection before major decisions',
          'Consider potential consequences of quick choices',
          'Balance spontaneity with strategic planning',
          'Communicate changes clearly to those affected'
        ]
      }
    }
  };
  
  const typeKey = assessmentType === 'learning' ? 'learning' : 
                  assessmentType === 'thinking' ? 'thinking' : 'decision';
  
  const dominantInsights = insights[typeKey][dominant];
  
  return {
    strengths: dominantInsights.strengths,
    weaknesses: dominantInsights.weaknesses,
    recommendations: dominantInsights.recommendations,
    dominantStyle: dominant,
    secondaryStyle: secondary
  };
};
