import { Question } from '../types';
import { 
  kolbQuestionsTeen, 
  sternbergQuestionsTeen, 
  dualProcessQuestionsTeen 
} from './assessmentQuestions_teen';
import {
  kolbQuestionsTertiary,
  sternbergQuestionsTertiary,
  dualProcessQuestionsTertiary
} from './assessmentQuestions_tertiary';

/**
 * JOTMINDS ASSESSMENT QUESTION BANKS
 * 
 * Question banks organized by age group:
 * - Ages 19-25 (Tertiary): 600 comprehensive questions (200 per framework)
 * - Ages 15-18: 300 comprehensive questions (100 per framework)
 * - Ages 11-14: Original educational questions (40 per framework)
 * - Ages 6-10: Kids Mode questions (500 approved replacement questions)
 * - Organizational: Workplace-focused questions
 */

/**
 * Generate a consistent random seed from a user ID
 * This ensures the same user always gets the same questions
 */
function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const combinedSeed = seed + index;
  for (let i = 0; i < combinedSeed.length; i++) {
    const char = combinedSeed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647;
}

/**
 * Select random questions from a pool based on user ID
 * Ensures consistent selection for the same user (or random if randomize=true)
 */
function selectRandomQuestions(
  allQuestions: Question[],
  dimensions: string[],
  questionsPerDimension: number,
  userId: string,
  randomize: boolean = false
): Question[] {
  const selected: Question[] = [];
  
  // If randomize is true, add timestamp to seed for different shuffle each time
  const seed = randomize ? `${userId}-${Date.now()}` : userId;
  
  dimensions.forEach((dimension, dimIndex) => {
    // Get all questions for this dimension
    const dimensionQuestions = allQuestions.filter(q => q.dimension === dimension);
    
    // Create a copy to shuffle
    const shuffled = [...dimensionQuestions];
    
    // Seeded shuffle using user ID (+ timestamp if randomizing) + dimension
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomValue = seededRandom(seed + dimension, i);
      const j = Math.floor(randomValue * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Take the required number of questions
    selected.push(...shuffled.slice(0, questionsPerDimension));
  });
  
  return selected;
}

/**
 * Get personalized questions for a user (12 questions total)
 * Supports age-based question selection for ages 15-18
 * 
 * @param assessmentType - Type of assessment (kolb, sternberg, dual-process)
 * @param userId - User ID for consistent question selection
 * @param isOrganizational - Whether this is organizational assessment
 * @param userAge - Optional: User's age for age-appropriate questions (default: undefined for ages 11-14)
 * @param randomize - Optional: If true, generates different questions on each call for re-takes
 */
export function getPersonalizedQuestions(
  assessmentType: 'kolb' | 'sternberg' | 'dual-process',
  userId: string,
  isOrganizational: boolean = false,
  userAge?: number,
  randomize: boolean = false
): Question[] {
  let allQuestions: Question[];
  let dimensions: string[];
  let questionsPerDimension: number;
  
  // Determine which question bank to use based on age
  const useTeen15to18 = userAge && userAge >= 15 && userAge <= 18;
  const useTertiary19to25 = userAge && userAge >= 19 && userAge <= 25;
  
  if (assessmentType === 'kolb') {
    if (useTertiary19to25) {
      allQuestions = kolbQuestionsTertiary;
    } else if (useTeen15to18) {
      allQuestions = kolbQuestionsTeen;
    } else {
      allQuestions = isOrganizational ? orgKolbQuestions : kolbQuestions;
    }
    dimensions = ['CE', 'RO', 'AC', 'AE'];
    questionsPerDimension = 3; // 4 dimensions × 3 = 12 questions
  } else if (assessmentType === 'sternberg') {
    if (useTertiary19to25) {
      allQuestions = sternbergQuestionsTertiary;
    } else if (useTeen15to18) {
      allQuestions = sternbergQuestionsTeen;
    } else {
      allQuestions = isOrganizational ? orgSternbergQuestions : sternbergQuestions;
    }
    dimensions = ['analytical', 'creative', 'practical'];
    questionsPerDimension = 4; // 3 dimensions × 4 = 12 questions
  } else {
    if (useTertiary19to25) {
      allQuestions = dualProcessQuestionsTertiary;
    } else if (useTeen15to18) {
      allQuestions = dualProcessQuestionsTeen;
    } else {
      allQuestions = isOrganizational ? orgDualProcessQuestions : dualProcessQuestions;
    }
    dimensions = ['system1', 'system2'];
    questionsPerDimension = 6; // 2 dimensions × 6 = 12 questions
  }
  
  return selectRandomQuestions(allQuestions, dimensions, questionsPerDimension, userId, randomize);
}

// Your Learning Style - Educational Version
export const kolbQuestions: Question[] = [
  // Concrete Experience (CE) - 10 questions
  { id: 1, text: "I learn best when I'm personally involved in an experience", dimension: "CE" },
  { id: 2, text: "I prefer to learn through doing rather than just reading or listening", dimension: "CE" },
  { id: 3, text: "I often rely on gut feelings or intuition to make decisions", dimension: "CE" },
  { id: 4, text: "I enjoy learning through real-life examples and practical situations", dimension: "CE" },
  { id: 5, text: "I feel most engaged when I can connect emotionally to what I'm learning", dimension: "CE" },
  { id: 6, text: "I prefer hands-on practice to theory or written instructions", dimension: "CE" },
  { id: 7, text: "I enjoy working with others and sharing experiences", dimension: "CE" },
  { id: 8, text: "I like to try new things, even if I'm unsure how they'll turn out", dimension: "CE" },
  { id: 9, text: "I learn a lot by observing people and feelings in real situations", dimension: "CE" },
  { id: 10, text: "I'm open-minded and willing to explore different ways of doing things", dimension: "CE" },
  
  // Reflective Observation (RO) - 10 questions
  { id: 11, text: "I prefer to observe and think before taking action", dimension: "RO" },
  { id: 12, text: "I often take time to reflect on what happened after an experience", dimension: "RO" },
  { id: 13, text: "I learn best by watching others and considering different perspectives", dimension: "RO" },
  { id: 14, text: "I like to analyze situations carefully before making a decision", dimension: "RO" },
  { id: 15, text: "I often take notes or mentally replay what I've learned to understand it better", dimension: "RO" },
  { id: 16, text: "I value quiet moments to think about what I've experienced", dimension: "RO" },
  { id: 17, text: "I notice patterns and details that others might overlook", dimension: "RO" },
  { id: 18, text: "I prefer to watch first and act later", dimension: "RO" },
  { id: 19, text: "I enjoy learning by listening to others' experiences", dimension: "RO" },
  { id: 20, text: "I often think about how things could have gone differently after events", dimension: "RO" },
  
  // Abstract Conceptualization (AC) - 10 questions
  { id: 21, text: "I like to understand the theory behind things", dimension: "AC" },
  { id: 22, text: "I enjoy analyzing problems logically", dimension: "AC" },
  { id: 23, text: "I prefer facts and ideas over emotions when learning", dimension: "AC" },
  { id: 24, text: "I feel confident when I can explain things clearly to others", dimension: "AC" },
  { id: 25, text: "I like to organize and structure what I learn", dimension: "AC" },
  { id: 26, text: "I enjoy creating models or frameworks to understand situations", dimension: "AC" },
  { id: 27, text: "I learn best when information is logical and well-structured", dimension: "AC" },
  { id: 28, text: "I prefer to focus on ideas and principles rather than personal experiences", dimension: "AC" },
  { id: 29, text: "I often compare concepts to find what makes the most sense", dimension: "AC" },
  { id: 30, text: "I'm good at turning experiences into clear, logical conclusions", dimension: "AC" },
  
  // Active Experimentation (AE) - 10 questions
  { id: 31, text: "I enjoy putting new ideas into action", dimension: "AE" },
  { id: 32, text: "I learn best by trying things out for myself", dimension: "AE" },
  { id: 33, text: "I like to experiment to see what works", dimension: "AE" },
  { id: 34, text: "I prefer learning through practice rather than discussion", dimension: "AE" },
  { id: 35, text: "I take initiative to test what I've learned", dimension: "AE" },
  { id: 36, text: "I feel energized when I can see results from my efforts", dimension: "AE" },
  { id: 37, text: "I learn by solving real problems", dimension: "AE" },
  { id: 38, text: "I'm comfortable taking risks when learning something new", dimension: "AE" },
  { id: 39, text: "I like to apply theories to real-life situations", dimension: "AE" },
  { id: 40, text: "I often adjust and improve based on what I discover from doing", dimension: "AE" },
];

// Learning Agility - Organizational Version
export const orgKolbQuestions: Question[] = [
  // Concrete Experience
  { id: 1, text: "I learn best through hands-on practice and real experiences", dimension: "CE" },
  { id: 2, text: "I enjoy trying new things to see what works", dimension: "CE" },
  { id: 3, text: "I prefer learning through experience rather than theory", dimension: "CE" },
  { id: 4, text: "I'm open to exploring ideas, even if I might make mistakes", dimension: "CE" },
  { id: 5, text: "I feel most engaged when I can experience something directly", dimension: "CE" },
  
  // Reflective Observation
  { id: 6, text: "I often take time to think about what worked and what didn't", dimension: "RO" },
  { id: 7, text: "I learn a lot by watching others and reflecting on what I see", dimension: "RO" },
  { id: 8, text: "I prefer to observe a situation before getting involved", dimension: "RO" },
  { id: 9, text: "I like to analyze my experiences before making changes", dimension: "RO" },
  { id: 10, text: "I value quiet reflection as part of my learning process", dimension: "RO" },
  
  // Abstract Conceptualization
  { id: 11, text: "I like to understand the theory or concept behind what I do", dimension: "AC" },
  { id: 12, text: "I enjoy analyzing information to find patterns or meanings", dimension: "AC" },
  { id: 13, text: "I prefer logical explanations over emotional ones", dimension: "AC" },
  { id: 14, text: "I often create mental models or frameworks to organize ideas", dimension: "AC" },
  { id: 15, text: "I connect experiences to bigger ideas or systems when learning", dimension: "AC" },
  
  // Active Experimentation
  { id: 16, text: "I like to apply what I've learned right away", dimension: "AE" },
  { id: 17, text: "I enjoy testing ideas to see if they work", dimension: "AE" },
  { id: 18, text: "I learn best by doing and experimenting", dimension: "AE" },
  { id: 19, text: "I like to take initiative and act on new concepts", dimension: "AE" },
  { id: 20, text: "I prefer to learn by trying out new approaches", dimension: "AE" },
];

// Your Thinking Style - Educational Version
export const sternbergQuestions: Question[] = [
  // Analytical Thinking - 10 questions
  { id: 1, text: "I enjoy solving problems that require logic and reasoning", dimension: "analytical" },
  { id: 2, text: "I like breaking complex ideas into smaller parts to understand them", dimension: "analytical" },
  { id: 3, text: "I prefer clear facts and evidence over opinions when making decisions", dimension: "analytical" },
  { id: 4, text: "I can easily spot errors or inconsistencies in information", dimension: "analytical" },
  { id: 5, text: "I enjoy comparing different options before choosing the best one", dimension: "analytical" },
  { id: 6, text: "I rely on analysis and structured thinking to solve problems", dimension: "analytical" },
  { id: 7, text: "I often question assumptions to find out what's really true", dimension: "analytical" },
  { id: 8, text: "I prefer making decisions based on data rather than emotion", dimension: "analytical" },
  { id: 9, text: "I like organizing information to make sense of it", dimension: "analytical" },
  { id: 10, text: "I enjoy learning when it challenges me to think critically", dimension: "analytical" },
  
  // Creative Thinking - 10 questions
  { id: 11, text: "I enjoy coming up with original ideas or solutions", dimension: "creative" },
  { id: 12, text: "I like finding new ways to solve old problems", dimension: "creative" },
  { id: 13, text: "I often think of creative alternatives when something doesn't work", dimension: "creative" },
  { id: 14, text: "I enjoy imagining possibilities that others might not consider", dimension: "creative" },
  { id: 15, text: "I'm open to experimenting with new or unusual ideas", dimension: "creative" },
  { id: 16, text: "I like expressing myself in unique or creative ways", dimension: "creative" },
  { id: 17, text: "I easily connect unrelated ideas to form new ones", dimension: "creative" },
  { id: 18, text: "I'm comfortable thinking outside the box when solving problems", dimension: "creative" },
  { id: 19, text: "I often see opportunities for improvement that others miss", dimension: "creative" },
  { id: 20, text: "I enjoy challenges that require innovation or creativity", dimension: "creative" },
  
  // Practical Thinking - 10 questions
  { id: 21, text: "I'm good at finding practical solutions that work in real life", dimension: "practical" },
  { id: 22, text: "I can quickly adapt when situations change", dimension: "practical" },
  { id: 23, text: "I'm confident applying what I know to new or unfamiliar situations", dimension: "practical" },
  { id: 24, text: "I prefer solutions that are realistic and doable", dimension: "practical" },
  { id: 25, text: "I can easily figure out how to get things done efficiently", dimension: "practical" },
  { id: 26, text: "I learn best from real-world experiences rather than theory", dimension: "practical" },
  { id: 27, text: "I handle unexpected problems calmly and effectively", dimension: "practical" },
  { id: 28, text: "I focus on actions that produce results, not just ideas", dimension: "practical" },
  { id: 29, text: "I'm good at organizing people or resources to achieve a goal", dimension: "practical" },
  { id: 30, text: "I can translate ideas into steps that make sense in everyday life", dimension: "practical" },
];

// Thinking Diversity - Organizational Version
export const orgSternbergQuestions: Question[] = [
  // Analytical Thinking
  { id: 1, text: "I analyze problems carefully before making decisions", dimension: "analytical" },
  { id: 2, text: "I enjoy solving puzzles or logical challenges", dimension: "analytical" },
  { id: 3, text: "I base my conclusions on facts and evidence", dimension: "analytical" },
  { id: 4, text: "I like evaluating pros and cons before acting", dimension: "analytical" },
  { id: 5, text: "I think critically about the details of a situation", dimension: "analytical" },
  
  // Creative Thinking
  { id: 6, text: "I enjoy finding new and original ways to solve problems", dimension: "creative" },
  { id: 7, text: "I often think of ideas others might overlook", dimension: "creative" },
  { id: 8, text: "I like brainstorming or experimenting with unusual solutions", dimension: "creative" },
  { id: 9, text: "I feel energized when creating something new or different", dimension: "creative" },
  { id: 10, text: "I often connect unrelated ideas to form new concepts", dimension: "creative" },
  
  // Practical Thinking
  { id: 11, text: "I prefer solutions that work in real life, not just in theory", dimension: "practical" },
  { id: 12, text: "I quickly figure out how to get things done effectively", dimension: "practical" },
  { id: 13, text: "I adapt easily when faced with real-world challenges", dimension: "practical" },
  { id: 14, text: "I focus on what's realistic and achievable", dimension: "practical" },
  { id: 15, text: "I use common sense when applying what I've learned", dimension: "practical" },
];

// Your Decision Style - Educational Version
export const dualProcessQuestions: Question[] = [
  // Intuitive/Automatic Thinking - 10 questions
  { id: 1, text: "I often make decisions based on my gut feeling", dimension: "system1" },
  { id: 2, text: "I can sense when something feels right or wrong without much thought", dimension: "system1" },
  { id: 3, text: "I trust my instincts more than detailed analysis", dimension: "system1" },
  { id: 4, text: "I make choices quickly, even with limited information", dimension: "system1" },
  { id: 5, text: "I often go with what feels natural instead of overthinking", dimension: "system1" },
  { id: 6, text: "I can recognize patterns or problems almost instantly", dimension: "system1" },
  { id: 7, text: "I rely on experience more than logic when deciding", dimension: "system1" },
  { id: 8, text: "I prefer to act first and analyze later", dimension: "system1" },
  { id: 9, text: "I find it easy to make snap judgments that usually turn out right", dimension: "system1" },
  { id: 10, text: "I feel confident relying on intuition in familiar situations", dimension: "system1" },
  
  // Analytical/Deliberate Thinking - 10 questions
  { id: 11, text: "I prefer to think carefully before making important decisions", dimension: "system2" },
  { id: 12, text: "I take time to evaluate all options before choosing one", dimension: "system2" },
  { id: 13, text: "I rely on facts and evidence rather than feelings when deciding", dimension: "system2" },
  { id: 14, text: "I like to plan my actions and anticipate possible outcomes", dimension: "system2" },
  { id: 15, text: "I double-check information before drawing conclusions", dimension: "system2" },
  { id: 16, text: "I enjoy solving problems that require logical reasoning", dimension: "system2" },
  { id: 17, text: "I rarely make big decisions without thorough consideration", dimension: "system2" },
  { id: 18, text: "I weigh the pros and cons before taking any major step", dimension: "system2" },
  { id: 19, text: "I think through the consequences of my choices in detail", dimension: "system2" },
  { id: 20, text: "I prefer deliberate, well-thought-out solutions to quick fixes", dimension: "system2" },
];

// Decision Intelligence - Organizational Version
export const orgDualProcessQuestions: Question[] = [
  // Intuitive/Automatic Thinking
  { id: 1, text: "I often trust my instincts when making quick decisions", dimension: "system1" },
  { id: 2, text: "I make fast choices when I recognize familiar patterns", dimension: "system1" },
  { id: 3, text: "I rely on experience more than detailed analysis", dimension: "system1" },
  { id: 4, text: "I usually go with my gut feeling when something feels right", dimension: "system1" },
  { id: 5, text: "I'm comfortable making decisions on the spot", dimension: "system1" },
  
  // Analytical/Deliberate Thinking
  { id: 6, text: "I take time to think through important decisions carefully", dimension: "system2" },
  { id: 7, text: "I prefer to review all the information before deciding", dimension: "system2" },
  { id: 8, text: "I analyze multiple options before choosing one", dimension: "system2" },
  { id: 9, text: "I base my choices on logic and evidence, not just feelings", dimension: "system2" },
  { id: 10, text: "I like structured, step-by-step thinking when solving problems", dimension: "system2" },
];