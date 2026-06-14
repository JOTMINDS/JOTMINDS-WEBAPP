// Kids Assessment Questions (Ages 6-10)
// Scenario-based, visual-first, concrete questions

export interface KidsQuestionChoice {
  id: 'A' | 'B' | 'C';
  emoji: string;              // Visual representation
  label: string;              // Short text (5-10 words)
  narration: string;          // What Jot says for this choice
  category: 'creative' | 'analytical' | 'practical' | 'reflective';
  points: number;             // Always 1 for now
}

export interface KidsQuestion {
  id: number;
  scenarioEmoji: string;      // Emoji representation until we have illustrations
  scenarioDescription: string; // For accessibility/fallback
  jotNarration: string;       // What Jot says to introduce the scenario
  prompt: string;             // Usually "What would you do?"
  choices: KidsQuestionChoice[];
}

export const kidsQuestions: KidsQuestion[] = [
  // CREATIVE THINKING (Q1-Q5)
  
  {
    id: 1,
    scenarioEmoji: '🎨',
    scenarioDescription: 'Kids at art table with blank paper',
    jotNarration: "It's art time! What do you want to make?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '🌈🦄',
        label: 'Something from my imagination!',
        narration: 'Make something from my imagination',
        category: 'creative',
        points: 1
      },
      {
        id: 'B',
        emoji: '📋✓',
        label: 'The same as the teacher showed us',
        narration: 'Copy what the teacher showed us',
        category: 'analytical',
        points: 1
      },
      {
        id: 'C',
        emoji: '🎁💌',
        label: 'Something I can use or give to someone',
        narration: 'Make something useful or a gift',
        category: 'practical',
        points: 1
      }
    ]
  },

  {
    id: 2,
    scenarioEmoji: '🤖',
    scenarioDescription: 'Toy robot with wheel fallen off',
    jotNarration: "Oh no! Your toy broke. What do you do?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '🔧',
        label: 'Try to fix it myself!',
        narration: 'Try to fix it',
        category: 'practical',
        points: 1
      },
      {
        id: 'B',
        emoji: '✨',
        label: 'Turn it into something new!',
        narration: 'Make it into something new',
        category: 'creative',
        points: 1
      },
      {
        id: 'C',
        emoji: '🔍',
        label: 'Find out why it broke',
        narration: 'Figure out why it broke',
        category: 'analytical',
        points: 1
      }
    ]
  },

  {
    id: 3,
    scenarioEmoji: '📚',
    scenarioDescription: 'Teacher reading a story',
    jotNarration: "The teacher stops reading. What do you think about?",
    prompt: "What do you think?",
    choices: [
      {
        id: 'A',
        emoji: '🌟',
        label: 'What if the story went a different way?',
        narration: 'What if it ended differently',
        category: 'creative',
        points: 1
      },
      {
        id: 'B',
        emoji: '❓',
        label: 'Why did the character do that?',
        narration: 'Why did they do that',
        category: 'analytical',
        points: 1
      },
      {
        id: 'C',
        emoji: '💭',
        label: 'When this happened to me...',
        narration: 'When this happened to me',
        category: 'reflective',
        points: 1
      }
    ]
  },

  {
    id: 4,
    scenarioEmoji: '🏃',
    scenarioDescription: 'Playground with different areas',
    jotNarration: "Recess! Where do you go?",
    prompt: "Where do you go?",
    choices: [
      {
        id: 'A',
        emoji: '🏖️',
        label: 'Somewhere I can make up a game!',
        narration: 'Make up my own game',
        category: 'creative',
        points: 1
      },
      {
        id: 'B',
        emoji: '⚽',
        label: 'Where I can play and move around!',
        narration: 'Play sports and run around',
        category: 'practical',
        points: 1
      },
      {
        id: 'C',
        emoji: '🧩',
        label: 'Where there are puzzles and challenges!',
        narration: 'Do puzzles and brain games',
        category: 'analytical',
        points: 1
      }
    ]
  },

  {
    id: 5,
    scenarioEmoji: '🧱',
    scenarioDescription: 'Big pile of blocks',
    jotNarration: "Here are lots of blocks! What do you build?",
    prompt: "What do you build?",
    choices: [
      {
        id: 'A',
        emoji: '🏰',
        label: 'Something cool from my imagination!',
        narration: 'A castle or spaceship from my imagination',
        category: 'creative',
        points: 1
      },
      {
        id: 'B',
        emoji: '🏠',
        label: 'Something that follows the picture',
        narration: 'Follow the instructions',
        category: 'analytical',
        points: 1
      },
      {
        id: 'C',
        emoji: '🎢',
        label: 'Something I can test and use!',
        narration: 'Something I can test like a ramp',
        category: 'practical',
        points: 1
      }
    ]
  },

  // ANALYTICAL THINKING (Q6-Q10)

  {
    id: 6,
    scenarioEmoji: '🎁',
    scenarioDescription: 'Wrapped gift box',
    jotNarration: "There's a box! What do you do?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '🔍',
        label: 'Try to figure out what\'s inside!',
        narration: 'Shake it and guess what\'s inside',
        category: 'analytical',
        points: 1
      },
      {
        id: 'B',
        emoji: '🎉',
        label: 'Open it right away!',
        narration: 'Open it right now',
        category: 'practical',
        points: 1
      },
      {
        id: 'C',
        emoji: '💭',
        label: 'Imagine all the things it could be!',
        narration: 'Imagine what could be inside',
        category: 'creative',
        points: 1
      }
    ]
  },

  {
    id: 7,
    scenarioEmoji: '🚗',
    scenarioDescription: 'Toy car or simple machine',
    jotNarration: "Look at this cool toy! What interests you?",
    prompt: "What interests you?",
    choices: [
      {
        id: 'A',
        emoji: '🎮',
        label: 'Playing with it!',
        narration: 'Playing with it',
        category: 'practical',
        points: 1
      },
      {
        id: 'B',
        emoji: '⚙️',
        label: 'How it works inside!',
        narration: 'How it works inside',
        category: 'analytical',
        points: 1
      },
      {
        id: 'C',
        emoji: '✨',
        label: 'Making it look even cooler!',
        narration: 'Decorating it',
        category: 'creative',
        points: 1
      }
    ]
  },

  {
    id: 8,
    scenarioEmoji: '🍎',
    scenarioDescription: '5 apples, 2 friends',
    jotNarration: "You have 5 apples and 2 friends. What do you think?",
    prompt: "What do you think?",
    choices: [
      {
        id: 'A',
        emoji: '🔢',
        label: 'How can we share them fairly?',
        narration: 'How to share them fairly',
        category: 'analytical',
        points: 1
      },
      {
        id: 'B',
        emoji: '🥧',
        label: 'Let\'s make something with them!',
        narration: 'Make applesauce or pie',
        category: 'practical',
        points: 1
      },
      {
        id: 'C',
        emoji: '😊',
        label: 'The apples could be characters in a game!',
        narration: 'Pretend they are characters',
        category: 'creative',
        points: 1
      }
    ]
  },

  {
    id: 9,
    scenarioEmoji: '🌧️',
    scenarioDescription: 'Window with rain outside',
    jotNarration: "It's raining! Can't go outside. What do you do?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '🔬',
        label: 'Watch how the rain works!',
        narration: 'Watch the rain and learn about it',
        category: 'analytical',
        points: 1
      },
      {
        id: 'B',
        emoji: '🏰',
        label: 'Make up an indoor adventure!',
        narration: 'Build a fort and pretend',
        category: 'creative',
        points: 1
      },
      {
        id: 'C',
        emoji: '🧹',
        label: 'Do something useful inside!',
        narration: 'Clean my room or organize',
        category: 'practical',
        points: 1
      }
    ]
  },

  {
    id: 10,
    scenarioEmoji: '➕',
    scenarioDescription: 'Math problem with two different answers',
    jotNarration: "You and your friend got different answers. What do you do?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '🤔',
        label: 'Figure out who\'s right and why!',
        narration: 'Check both answers to see who\'s right',
        category: 'analytical',
        points: 1
      },
      {
        id: 'B',
        emoji: '👨‍🏫',
        label: 'Ask the teacher to help us!',
        narration: 'Ask the teacher for help',
        category: 'reflective',
        points: 1
      },
      {
        id: 'C',
        emoji: '🧪',
        label: 'Try both ways and see what works!',
        narration: 'Test both ways',
        category: 'practical',
        points: 1
      }
    ]
  },

  // PRACTICAL THINKING (Q11-Q15)

  {
    id: 11,
    scenarioEmoji: '🧸',
    scenarioDescription: 'Messy playroom',
    jotNarration: "Time to clean up! What do you do first?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '💪',
        label: 'Just start putting things away!',
        narration: 'Start cleaning right away',
        category: 'practical',
        points: 1
      },
      {
        id: 'B',
        emoji: '📦',
        label: 'Make a plan for where everything goes!',
        narration: 'Sort everything first',
        category: 'analytical',
        points: 1
      },
      {
        id: 'C',
        emoji: '🎵',
        label: 'Make cleaning into a fun game!',
        narration: 'Turn it into a game',
        category: 'creative',
        points: 1
      }
    ]
  },

  {
    id: 12,
    scenarioEmoji: '🍪',
    scenarioDescription: 'Kitchen with ingredients',
    jotNarration: "You're hungry! What do you make?",
    prompt: "What would you make?",
    choices: [
      {
        id: 'A',
        emoji: '🥪',
        label: 'Something quick I know how to make!',
        narration: 'Make a sandwich or something simple',
        category: 'practical',
        points: 1
      },
      {
        id: 'B',
        emoji: '📖',
        label: 'Follow a recipe to make something new!',
        narration: 'Follow a recipe',
        category: 'analytical',
        points: 1
      },
      {
        id: 'C',
        emoji: '🎨',
        label: 'Something fun and creative!',
        narration: 'Make a food face or art',
        category: 'creative',
        points: 1
      }
    ]
  },

  {
    id: 13,
    scenarioEmoji: '🙋',
    scenarioDescription: 'Little sibling trying to reach something',
    jotNarration: "Someone needs help! What do you do?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '🪑',
        label: 'Find something to help them reach!',
        narration: 'Get a stool or chair',
        category: 'practical',
        points: 1
      },
      {
        id: 'B',
        emoji: '👨‍🏫',
        label: 'Show them how to do it themselves!',
        narration: 'Teach them how',
        category: 'reflective',
        points: 1
      },
      {
        id: 'C',
        emoji: '🤝',
        label: 'Just help them right away!',
        narration: 'Help them get it',
        category: 'practical',
        points: 1
      }
    ]
  },

  {
    id: 14,
    scenarioEmoji: '🌱',
    scenarioDescription: 'Garden with seeds',
    jotNarration: "Let's plant something! What interests you?",
    prompt: "What interests you?",
    choices: [
      {
        id: 'A',
        emoji: '💧',
        label: 'Taking care of it every day!',
        narration: 'Water it and watch it grow',
        category: 'practical',
        points: 1
      },
      {
        id: 'B',
        emoji: '📚',
        label: 'Learning how plants grow!',
        narration: 'Learn about how plants work',
        category: 'analytical',
        points: 1
      },
      {
        id: 'C',
        emoji: '🌳',
        label: 'Imagining it growing super tall!',
        narration: 'Imagine a giant beanstalk',
        category: 'creative',
        points: 1
      }
    ]
  },

  {
    id: 15,
    scenarioEmoji: '🎲',
    scenarioDescription: 'Kids playing a new game',
    jotNarration: "Your friend doesn't know the game. What do you do?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '👥',
        label: 'Show them by playing together!',
        narration: 'Just start playing and they\'ll learn',
        category: 'practical',
        points: 1
      },
      {
        id: 'B',
        emoji: '📋',
        label: 'Explain all the rules first!',
        narration: 'Tell them the rules',
        category: 'analytical',
        points: 1
      },
      {
        id: 'C',
        emoji: '✨',
        label: 'Make up new rules together!',
        narration: 'Invent a new game',
        category: 'creative',
        points: 1
      }
    ]
  },

  // REFLECTIVE THINKING (Q16-Q20)

  {
    id: 16,
    scenarioEmoji: '💦',
    scenarioDescription: 'Spilled milk or dropped project',
    jotNarration: "Oops! Something went wrong. What do you do?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '🧹',
        label: 'Clean it up and keep going!',
        narration: 'Clean it up and move on',
        category: 'practical',
        points: 1
      },
      {
        id: 'B',
        emoji: '💭',
        label: 'Think about how to not do it again',
        narration: 'Figure out how to prevent it',
        category: 'reflective',
        points: 1
      },
      {
        id: 'C',
        emoji: '🔄',
        label: 'Try a different way!',
        narration: 'Try a new approach',
        category: 'creative',
        points: 1
      }
    ]
  },

  {
    id: 17,
    scenarioEmoji: '👋',
    scenarioDescription: 'New kid at school',
    jotNarration: "There's a new kid! What do you do?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '😊',
        label: 'Go say hi and be friendly!',
        narration: 'Say hi and introduce myself',
        category: 'reflective',
        points: 1
      },
      {
        id: 'B',
        emoji: '⚽',
        label: 'Ask them to play with us!',
        narration: 'Invite them to play',
        category: 'practical',
        points: 1
      },
      {
        id: 'C',
        emoji: '🎨',
        label: 'Make something special to welcome them!',
        narration: 'Make them a welcome card',
        category: 'creative',
        points: 1
      }
    ]
  },

  {
    id: 18,
    scenarioEmoji: '✏️',
    scenarioDescription: 'Teacher giving suggestions on work',
    jotNarration: "Your teacher has ideas to make your work better. How do you feel?",
    prompt: "How do you feel?",
    choices: [
      {
        id: 'A',
        emoji: '🌟',
        label: 'Great! I want to make it better!',
        narration: 'Happy to improve',
        category: 'reflective',
        points: 1
      },
      {
        id: 'B',
        emoji: '🤔',
        label: 'I want to understand what to change',
        narration: 'Want to understand the changes',
        category: 'analytical',
        points: 1
      },
      {
        id: 'C',
        emoji: '💖',
        label: 'I like it how it is!',
        narration: 'Happy with my original idea',
        category: 'creative',
        points: 1
      }
    ]
  },

  {
    id: 19,
    scenarioEmoji: '👥',
    scenarioDescription: 'Group project',
    jotNarration: "Everyone has different ideas. What do you do?",
    prompt: "What would you do?",
    choices: [
      {
        id: 'A',
        emoji: '🗳️',
        label: 'Listen and pick the best one together!',
        narration: 'Vote on the best idea',
        category: 'reflective',
        points: 1
      },
      {
        id: 'B',
        emoji: '✨',
        label: 'Mix all the ideas into one!',
        narration: 'Combine all the ideas',
        category: 'creative',
        points: 1
      },
      {
        id: 'C',
        emoji: '🧪',
        label: 'Try each one and see what works!',
        narration: 'Test each idea',
        category: 'practical',
        points: 1
      }
    ]
  },

  {
    id: 20,
    scenarioEmoji: '🏆',
    scenarioDescription: 'Kid with completed project',
    jotNarration: "You did it! What do you think about?",
    prompt: "What do you think?",
    choices: [
      {
        id: 'A',
        emoji: '📣',
        label: 'Showing everyone what I made!',
        narration: 'Show everyone',
        category: 'practical',
        points: 1
      },
      {
        id: 'B',
        emoji: '💭',
        label: 'What I could do even better!',
        narration: 'How to improve next time',
        category: 'reflective',
        points: 1
      },
      {
        id: 'C',
        emoji: '✨',
        label: 'What I want to make next!',
        narration: 'My next project',
        category: 'creative',
        points: 1
      }
    ]
  }
];

// Helper function to calculate results
export const calculateKidsAssessmentResults = (
  answers: Record<number, 'A' | 'B' | 'C'>
): {
  creative: number;
  analytical: number;
  practical: number;
  reflective: number;
  totalQuestions: number;
  answeredQuestions: number;
} => {
  const scores = {
    creative: 0,
    analytical: 0,
    practical: 0,
    reflective: 0
  };

  kidsQuestions.forEach(question => {
    const chosenAnswerId = answers[question.id];
    if (chosenAnswerId) {
      const choice = question.choices.find(c => c.id === chosenAnswerId);
      if (choice) {
        scores[choice.category] += choice.points;
      }
    }
  });

  return {
    ...scores,
    totalQuestions: kidsQuestions.length,
    answeredQuestions: Object.keys(answers).length
  };
};

// Get primary and secondary thinking styles
export const getThinkingStyles = (scores: {
  creative: number;
  analytical: number;
  practical: number;
  reflective: number;
}) => {
  const sortedStyles = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([style]) => style);

  return {
    primary: sortedStyles[0],
    secondary: sortedStyles[1],
    scores
  };
};

// Get encouragement message based on style
export const getStyleMessage = (style: string): string => {
  const messages = {
    creative: "You love using your imagination! 🎨",
    analytical: "You're great at figuring things out! 🔍",
    practical: "You like to get things done! 🛠️",
    reflective: "You learn and grow every day! 💭"
  };
  
  return messages[style as keyof typeof messages] || "You're awesome!";
};

// Get style description for kids
export const getStyleDescription = (style: string): string => {
  const descriptions = {
    creative: "You think in pictures and love making new things!",
    analytical: "You like solving puzzles and understanding how things work!",
    practical: "You're good at doing things and helping others!",
    reflective: "You think about what you learn and how to get better!"
  };
  
  return descriptions[style as keyof typeof descriptions] || "You have a unique way of thinking!";
};
