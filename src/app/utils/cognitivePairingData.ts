export type AdultStyle = 'creative' | 'analytical' | 'practical' | 'reflective';

export interface PairingInsight {
  title: string;
  description: string;
  strengths: string[];
  challenges: string[];
  tips: string[];
  alignmentLevel: 'High' | 'Moderate' | 'Different';
}

// Sternberg Match (Creative, Analytical, Practical)
export function getSternbergPairing(parentStyle: AdultStyle, childStyle: string): PairingInsight {
  const cStyle = childStyle.toLowerCase(); // 'imaginative', 'analytical', 'practical'
  
  // MATCH: Analytical Parent + Analytical Child
  if (parentStyle === 'analytical' && cStyle === 'analytical') {
    return {
      title: "The Logic Team",
      description: "You both thrive on structure, logic, and breaking down complex problems. This makes communication clear and direct.",
      strengths: ["Problem-solving together", "Creating organized plans", "Rational discussions"],
      challenges: ["May overthink simple decisions", "Can forget to leave room for creative exploration"],
      tips: [
        "Use step-by-step logic to tackle their harder homework assignments.",
        "Encourage each other to brainstorm wild, illogical ideas just for fun occasionally."
      ],
      alignmentLevel: 'High'
    };
  }

  // MATCH: Practical Parent + Practical Child
  if (parentStyle === 'practical' && cStyle === 'practical') {
    return {
      title: "The Doers",
      description: "You both learn by doing and value real-world application. You prefer knowing *why* something is useful before learning it.",
      strengths: ["Executing projects efficiently", "Hands-on learning", "Focusing on what works"],
      challenges: ["Might rush through theory/reading", "Can become impatient with abstract concepts"],
      tips: [
        "Relate their schoolwork directly to real-world tasks or careers.",
        "Take breaks to do hands-on activities when they are stuck on abstract homework."
      ],
      alignmentLevel: 'High'
    };
  }

  // MATCH: Creative/Reflective Parent + Imaginative Child
  if ((parentStyle === 'creative' || parentStyle === 'reflective') && cStyle === 'imaginative') {
    return {
      title: "The Visionaries",
      description: "You both see the world through a lens of endless possibilities and value original thinking over strict rules.",
      strengths: ["Brainstorming unique ideas", "Creative expression", "Thinking outside the box"],
      challenges: ["Staying organized", "Sticking to a rigid schedule"],
      tips: [
        "Use storytelling, art, or roleplay to help them understand difficult concepts.",
        "Help them build a loose structure for their tasks so their creativity doesn't lead to missed deadlines."
      ],
      alignmentLevel: 'High'
    };
  }

  // MISMATCH: Analytical Parent + Imaginative Child
  if (parentStyle === 'analytical' && cStyle === 'imaginative') {
    return {
      title: "Structure Meets Imagination",
      description: "You prefer organized, logical approaches, while your child thrives on open-ended creativity and exploration.",
      strengths: ["You provide the structure they need to succeed", "They bring fresh, creative perspectives to your routines"],
      challenges: ["You might find their approach chaotic", "They might find your methods too restrictive"],
      tips: [
        "Provide a framework (like a schedule), but let them decide *how* to do the tasks within it.",
        "When explaining things, use metaphors and visuals instead of just facts and data."
      ],
      alignmentLevel: 'Different'
    };
  }

  // MISMATCH: Practical Parent + Imaginative Child
  if (parentStyle === 'practical' && cStyle === 'imaginative') {
    return {
      title: "Reality Meets Fantasy",
      description: "You are focused on what works in the real world, while your child is focused on what *could* be.",
      strengths: ["You help ground their ideas in reality", "They inspire you to think outside the box"],
      challenges: ["They may resist purely functional tasks", "You may struggle to see the point of their theoretical ideas"],
      tips: [
        "Let them brainstorm wildly first, then gently help them pick the most realistic idea to execute.",
        "Show them how their creative ideas can solve real-world, practical problems."
      ],
      alignmentLevel: 'Different'
    };
  }

  // MISMATCH: Creative Parent + Analytical Child
  if (parentStyle === 'creative' && cStyle === 'analytical') {
    return {
      title: "Idea Meets Logic",
      description: "You love exploring new possibilities, but your child wants facts, logic, and clear steps.",
      strengths: ["You encourage them to think bigger", "They help you create realistic plans"],
      challenges: ["They might get frustrated if you don't give them clear instructions", "You might feel they are too rigid"],
      tips: [
        "Give them clear, step-by-step instructions for tasks.",
        "When they get stuck in the details, use your creativity to help them zoom out and see the big picture."
      ],
      alignmentLevel: 'Different'
    };
  }

  // Default fallback for other combinations
  return {
    title: "Complementary Styles",
    description: "You each bring unique cognitive strengths to the table, creating a balanced dynamic.",
    strengths: ["Learning from each other's approaches", "Covering each other's blind spots"],
    challenges: ["Communicating complex ideas requires extra patience"],
    tips: [
      "Notice when they are struggling with your teaching style and try explaining it differently.",
      "Celebrate the fact that you think differently—it makes your team stronger!"
    ],
    alignmentLevel: 'Moderate'
  };
}

// Kolb Match (Accommodating, Assimilating, Diverging, Converging)
export function getKolbPairing(parentStyle: AdultStyle, childStyle: string): PairingInsight {
  const cStyle = childStyle.toLowerCase(); // 'accommodating', 'assimilating', 'diverging', 'converging'
  
  if (parentStyle === 'reflective' && (cStyle === 'assimilating' || cStyle === 'diverging')) {
    return {
      title: "The Deep Thinkers",
      description: "You both value taking time to reflect and observe before acting. You prefer a thoughtful, considered approach.",
      strengths: ["Deep conversations", "Thorough understanding", "Thoughtful decision making"],
      challenges: ["May suffer from analysis paralysis", "Hesitant to jump into action"],
      tips: [
        "Give them plenty of time to process new information before asking for an answer.",
        "Help them set a \"time limit\" on thinking so they eventually move into action."
      ],
      alignmentLevel: 'High'
    };
  }

  if (parentStyle === 'practical' && (cStyle === 'accommodating' || cStyle === 'converging')) {
    return {
      title: "The Action Takers",
      description: "You both prefer to jump in, experiment, and learn through active trial-and-error.",
      strengths: ["Quick to start tasks", "Hands-on problem solving", "High energy engagement"],
      challenges: ["Might skip reading the instructions", "Can make hasty mistakes"],
      tips: [
        "Let them do hands-on experiments rather than just reading from a textbook.",
        "Remind them (and yourself!) to pause and read the directions before starting a project."
      ],
      alignmentLevel: 'High'
    };
  }

  if (parentStyle === 'analytical' && cStyle === 'accommodating') {
    return {
      title: "Analysis vs. Action",
      description: "You prefer to analyze and plan, while your child prefers to jump right in and figure it out on the fly.",
      strengths: ["You provide the strategy, they provide the execution"],
      challenges: ["You want them to slow down; they want to speed up"],
      tips: [
        "Don't force them to write long outlines before they start; let them create a \"rough draft\" by doing.",
        "Help them review their work *after* they've finished their hands-on process."
      ],
      alignmentLevel: 'Different'
    };
  }

  return {
    title: "Balanced Learning",
    description: "Your learning styles have different focuses, meaning you process experiences in complementary ways.",
    strengths: ["You can show them new ways to approach a problem", "Diverse problem-solving skills"],
    challenges: ["They might not learn well using the methods that worked best for you in school"],
    tips: [
      "Pay attention to whether they need to 'watch' or 'do' to learn best.",
      "Adapt your support to their style, even if it feels unnatural to you."
    ],
    alignmentLevel: 'Moderate'
  };
}

// Dual Process Match (Intuitive, Analytical, Balanced)
export function getDualProcessPairing(parentStyle: AdultStyle, childStyle: string): PairingInsight {
  const cStyle = childStyle.toLowerCase(); 

  if (parentStyle === 'analytical' && cStyle === 'analytical') {
    return {
      title: "The Deliberators",
      description: "You both prefer to take your time and weigh all the evidence before making a decision.",
      strengths: ["Careful, well-thought-out choices", "Avoiding impulsive mistakes"],
      challenges: ["Decision fatigue", "Taking too long on simple choices"],
      tips: [
        "Teach them how to categorize decisions into 'big' (needs time) and 'small' (can be quick).",
        "Praise their thoroughness while encouraging them to trust their gut on minor issues."
      ],
      alignmentLevel: 'High'
    };
  }

  if ((parentStyle === 'creative' || parentStyle === 'practical') && cStyle === 'intuitive') {
    return {
      title: "The Quick Deciders",
      description: "You both tend to rely on gut feelings, quick pattern recognition, and heuristics to make decisions rapidly.",
      strengths: ["Fast decision making", "Trusting instincts", "Navigating ambiguous situations"],
      challenges: ["Jumping to conclusions", "Missing hidden details"],
      tips: [
        "When they are doing homework, challenge them to 'double-check' their gut-reaction answers.",
        "Play games that require slowing down and finding hidden clues."
      ],
      alignmentLevel: 'High'
    };
  }

  if (parentStyle === 'analytical' && cStyle === 'intuitive') {
    return {
      title: "Logic Meets Instinct",
      description: "You prefer to gather all the facts, while your child prefers to trust their immediate gut feeling.",
      strengths: ["You can help them slow down and verify", "They can help you make faster choices"],
      challenges: ["They might feel you are over-complicating things", "You might feel they are being careless"],
      tips: [
        "Ask them *why* their gut is telling them an answer, helping them vocalize their intuition.",
        "Don't dismiss their fast answers; instead, guide them to prove their answer is correct."
      ],
      alignmentLevel: 'Different'
    };
  }

  return {
    title: "Balanced Decision Making",
    description: "You bring different decision-making speeds and styles to the table.",
    strengths: ["Covering both fast and slow thinking approaches"],
    challenges: ["Understanding why the other person chose their method"],
    tips: [
      "Discuss *how* you make big decisions with them so they can see your process.",
      "Recognize that their decision process might be different but equally valid."
    ],
    alignmentLevel: 'Moderate'
  };
}
