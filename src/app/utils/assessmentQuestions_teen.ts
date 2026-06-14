import { Question } from '../types';

/**
 * COMPREHENSIVE QUESTION BANK FOR AGES 15-18
 * Total: 300 questions (100 per framework)
 * - Kolb Learning Styles: 100 questions
 * - Sternberg Thinking Styles: 100 questions
 * - Dual-Process Decision Making: 100 questions
 */

// ============================================================================
// A. KOLB LEARNING STYLE QUESTIONS (100 questions)
// Four dimensions: CE, RO, AC, AE (25 questions each)
// ============================================================================

export const kolbQuestionsTeen: Question[] = [
  // ===== Concrete Experience (CE) - 25 questions =====
  // Questions 1-20: Experience-Based Learning
  { id: 1, text: "I learn best when I can touch or experience things directly", dimension: "CE" },
  { id: 2, text: "I remember lessons better when they relate to real-life examples", dimension: "CE" },
  { id: 3, text: "I prefer learning through activities instead of long explanations", dimension: "CE" },
  { id: 4, text: "I enjoy schoolwork more when it connects to things I've lived before", dimension: "CE" },
  { id: 5, text: "I understand lessons faster when the teacher shows demonstrations", dimension: "CE" },
  { id: 6, text: "I learn best when I can use my senses (seeing, touching, hearing)", dimension: "CE" },
  { id: 7, text: "I prefer working with real objects instead of diagrams", dimension: "CE" },
  { id: 8, text: "I like role-plays or acting out ideas to learn them", dimension: "CE" },
  { id: 9, text: "I learn quickly when the topic has something to do with my life", dimension: "CE" },
  { id: 10, text: "I enjoy learning through experiments", dimension: "CE" },
  { id: 11, text: "I prefer group activities where we share experiences", dimension: "CE" },
  { id: 12, text: "I understand concepts better when I see how they affect people", dimension: "CE" },
  { id: 13, text: "I like real-life stories more than theories", dimension: "CE" },
  { id: 14, text: "I like using pictures or videos when learning", dimension: "CE" },
  { id: 15, text: "I prefer hands-on projects", dimension: "CE" },
  { id: 16, text: "I enjoy learning when I can physically move around", dimension: "CE" },
  { id: 17, text: "I learn better when I can use tools or objects", dimension: "CE" },
  { id: 18, text: "I like field trips more than classroom lessons", dimension: "CE" },
  { id: 19, text: "I prefer activities where I can participate directly", dimension: "CE" },
  { id: 20, text: "I enjoy learning through games that involve movement", dimension: "CE" },
  
  // Questions 81-85: Holistic Integration (CE-focused)
  { id: 81, text: "I prefer learning methods that combine activities and thinking", dimension: "CE" },
  { id: 82, text: "I learn best when I can observe, think, and then try it myself", dimension: "CE" },
  { id: 83, text: "I enjoy subjects where I can both read and experiment", dimension: "CE" },
  { id: 84, text: "I like when teachers mix explanations with activities", dimension: "CE" },
  { id: 85, text: "I understand best through examples before doing tasks", dimension: "CE" },
  
  // ===== Reflective Observation (RO) - 25 questions =====
  // Questions 21-40: Reflective Learning
  { id: 21, text: "I like to think quietly before answering questions", dimension: "RO" },
  { id: 22, text: "I learn best when I have time to reflect on new ideas", dimension: "RO" },
  { id: 23, text: "I prefer watching others before trying something new", dimension: "RO" },
  { id: 24, text: "I understand lessons by observing carefully", dimension: "RO" },
  { id: 25, text: "I like analyzing different points of view", dimension: "RO" },
  { id: 26, text: "I learn well when I can take notes and think about them later", dimension: "RO" },
  { id: 27, text: "I prefer thinking deeply before joining discussions", dimension: "RO" },
  { id: 28, text: "I enjoy reviewing my work before submitting it", dimension: "RO" },
  { id: 29, text: "I understand better when I see examples first", dimension: "RO" },
  { id: 30, text: "I like listening more than speaking in class", dimension: "RO" },
  { id: 31, text: "I often think about how things could be improved", dimension: "RO" },
  { id: 32, text: "I enjoy comparing different ideas", dimension: "RO" },
  { id: 33, text: "I learn by watching demonstrations quietly", dimension: "RO" },
  { id: 34, text: "I prefer to observe group work before participating", dimension: "RO" },
  { id: 35, text: "I like sitting back and understanding the whole picture first", dimension: "RO" },
  { id: 36, text: "I enjoy looking for patterns in what I learn", dimension: "RO" },
  { id: 37, text: "I like to reflect on what went well or wrong after assignments", dimension: "RO" },
  { id: 38, text: "I enjoy thinking alone before discussing with others", dimension: "RO" },
  { id: 39, text: "I learn better when given time to reflect after each lesson", dimension: "RO" },
  { id: 40, text: "I prefer re-reading and reviewing notes at home", dimension: "RO" },
  
  // Questions 86-90: Holistic Integration (RO-focused)
  { id: 86, text: "I like when lessons connect theory to real life", dimension: "RO" },
  { id: 87, text: "I prefer learning that includes teamwork and reflection", dimension: "RO" },
  { id: 88, text: "I learn well when I can try different approaches", dimension: "RO" },
  { id: 89, text: "I enjoy connecting ideas across subjects", dimension: "RO" },
  { id: 90, text: "I prefer lessons that let me think, test, and adjust", dimension: "RO" },
  
  // ===== Abstract Conceptualization (AC) - 25 questions =====
  // Questions 41-60: Theory-Based Learning
  { id: 41, text: "I like learning rules and formulas", dimension: "AC" },
  { id: 42, text: "I prefer structured lessons with clear explanations", dimension: "AC" },
  { id: 43, text: "I enjoy solving logical problems", dimension: "AC" },
  { id: 44, text: "I like lessons that explain the 'why' behind things", dimension: "AC" },
  { id: 45, text: "I understand best when information is organized", dimension: "AC" },
  { id: 46, text: "I enjoy subjects with theories (science, math)", dimension: "AC" },
  { id: 47, text: "I learn well when instructions are detailed", dimension: "AC" },
  { id: 48, text: "I prefer clear objectives before starting a task", dimension: "AC" },
  { id: 49, text: "I enjoy analyzing diagrams and charts", dimension: "AC" },
  { id: 50, text: "I like lessons that challenge me to think deeply", dimension: "AC" },
  { id: 51, text: "I enjoy discussing ideas and concepts", dimension: "AC" },
  { id: 52, text: "I prefer reading textbooks over doing activities", dimension: "AC" },
  { id: 53, text: "I learn better when the teacher explains step-by-step", dimension: "AC" },
  { id: 54, text: "I enjoy comparing theories and models", dimension: "AC" },
  { id: 55, text: "I prefer lessons that require thinking, not guessing", dimension: "AC" },
  { id: 56, text: "I like understanding principles behind how things work", dimension: "AC" },
  { id: 57, text: "I enjoy writing essays about what I've learned", dimension: "AC" },
  { id: 58, text: "I like subjects with definitions and rules", dimension: "AC" },
  { id: 59, text: "I prefer lessons that use data and facts", dimension: "AC" },
  { id: 60, text: "I learn best by thinking logically", dimension: "AC" },
  
  // Questions 91-95: Holistic Integration (AC-focused)
  { id: 91, text: "I learn better when there is a balance between listening and doing", dimension: "AC" },
  { id: 92, text: "I enjoy subjects that require both creativity and logic", dimension: "AC" },
  { id: 93, text: "I prefer teachers who use many teaching methods", dimension: "AC" },
  { id: 94, text: "I like working on long-term projects", dimension: "AC" },
  { id: 95, text: "I understand better when I can relate lessons to the world", dimension: "AC" },
  
  // ===== Active Experimentation (AE) - 25 questions =====
  // Questions 61-80: Testing/Doing Learning
  { id: 61, text: "I like trying out new ideas immediately", dimension: "AE" },
  { id: 62, text: "I learn best by 'doing something' with what I've learned", dimension: "AE" },
  { id: 63, text: "I prefer to test things instead of just thinking about them", dimension: "AE" },
  { id: 64, text: "I enjoy solving problems through trial and error", dimension: "AE" },
  { id: 65, text: "I like taking part in debates", dimension: "AE" },
  { id: 66, text: "I learn by experimenting and seeing what happens", dimension: "AE" },
  { id: 67, text: "I prefer group activities where we build something", dimension: "AE" },
  { id: 68, text: "I enjoy teamwork and participation", dimension: "AE" },
  { id: 69, text: "I like practical work over long explanations", dimension: "AE" },
  { id: 70, text: "I prefer finding my own solutions instead of following steps", dimension: "AE" },
  { id: 71, text: "I enjoy learning tasks that involve challenges", dimension: "AE" },
  { id: 72, text: "I learn more when I try different methods", dimension: "AE" },
  { id: 73, text: "I prefer action-based class activities", dimension: "AE" },
  { id: 74, text: "I enjoy games that require strategy", dimension: "AE" },
  { id: 75, text: "I try things first and improve them later", dimension: "AE" },
  { id: 76, text: "I like asking questions to test ideas", dimension: "AE" },
  { id: 77, text: "I enjoy applying lessons to real situations", dimension: "AE" },
  { id: 78, text: "I prefer assignments where I can experiment", dimension: "AE" },
  { id: 79, text: "I enjoy hands-on science experiments", dimension: "AE" },
  { id: 80, text: "I like learning by doing and adjusting as I go", dimension: "AE" },
  
  // Questions 96-100: Holistic Integration (AE-focused)
  { id: 96, text: "I enjoy thinking about how I learn", dimension: "AE" },
  { id: 97, text: "I prefer tasks that challenge both my mind and skills", dimension: "AE" },
  { id: 98, text: "I like learning step-by-step, then practicing", dimension: "AE" },
  { id: 99, text: "I enjoy figuring things out on my own", dimension: "AE" },
  { id: 100, text: "I learn best when lessons combine theory, practice, and reflection", dimension: "AE" },
];

// ============================================================================
// B. STERNBERG THINKING STYLE QUESTIONS (100 questions)
// Three dimensions: analytical, creative, practical (33-34 questions each)
// ============================================================================

export const sternbergQuestionsTeen: Question[] = [
  // ===== Analytical Thinking - 34 questions =====
  // Questions 1-20: Core Analytical
  { id: 1, text: "I enjoy solving logic puzzles", dimension: "analytical" },
  { id: 2, text: "I like comparing different ideas to see which is best", dimension: "analytical" },
  { id: 3, text: "I can easily spot errors in arguments", dimension: "analytical" },
  { id: 4, text: "I like looking for evidence before believing something", dimension: "analytical" },
  { id: 5, text: "I enjoy subjects that involve analyzing information", dimension: "analytical" },
  { id: 6, text: "I like breaking big problems into smaller parts", dimension: "analytical" },
  { id: 7, text: "I enjoy organizing facts and details", dimension: "analytical" },
  { id: 8, text: "I look for patterns in everything I learn", dimension: "analytical" },
  { id: 9, text: "I prefer step-by-step instructions", dimension: "analytical" },
  { id: 10, text: "I like evaluating different solutions before choosing one", dimension: "analytical" },
  { id: 11, text: "I enjoy identifying causes and effects", dimension: "analytical" },
  { id: 12, text: "I like checking if arguments make sense", dimension: "analytical" },
  { id: 13, text: "I enjoy reading factual or informational content", dimension: "analytical" },
  { id: 14, text: "I like figuring out logical explanations", dimension: "analytical" },
  { id: 15, text: "I enjoy making charts and lists to understand things", dimension: "analytical" },
  { id: 16, text: "I like asking questions that need clear answers", dimension: "analytical" },
  { id: 17, text: "I enjoy debating using facts", dimension: "analytical" },
  { id: 18, text: "I like exercises that test my reasoning", dimension: "analytical" },
  { id: 19, text: "I enjoy solving math problems with multiple steps", dimension: "analytical" },
  { id: 20, text: "I like analyzing why things work", dimension: "analytical" },
  
  // Questions 61-74: Blended Styles (Analytical-focused)
  { id: 61, text: "I enjoy tasks that require both creativity and logic", dimension: "analytical" },
  { id: 62, text: "I like approaching problems from multiple angles", dimension: "analytical" },
  { id: 63, text: "I enjoy analyzing creative ideas", dimension: "analytical" },
  { id: 70, text: "I like thinking carefully before trying new ideas", dimension: "analytical" },
  { id: 71, text: "I enjoy testing creative ideas to see which works best", dimension: "analytical" },
  { id: 72, text: "I like adjusting ideas based on what works in real life", dimension: "analytical" },
  { id: 73, text: "I enjoy making sense out of new or surprising ideas", dimension: "analytical" },
  { id: 74, text: "I like improving my creative ideas using logic", dimension: "analytical" },
  
  // Questions 81-86: Higher-Level Thinking (Analytical-focused)
  { id: 83, text: "I enjoy thinking deeply about topics I find interesting", dimension: "analytical" },
  { id: 84, text: "I like solving complicated problems", dimension: "analytical" },
  { id: 87, text: "I enjoy analyzing stories or movies for deeper meaning", dimension: "analytical" },
  { id: 90, text: "I like thinking through challenges step-by-step", dimension: "analytical" },
  { id: 95, text: "I enjoy finding patterns in creative concepts", dimension: "analytical" },
  { id: 98, text: "I like thinking about the meaning behind ideas", dimension: "analytical" },
  
  // ===== Creative Thinking - 33 questions =====
  // Questions 21-40: Core Creative
  { id: 21, text: "I enjoy coming up with unusual ideas", dimension: "creative" },
  { id: 22, text: "I like imagining new possibilities", dimension: "creative" },
  { id: 23, text: "I enjoy drawing, designing, or building creative things", dimension: "creative" },
  { id: 24, text: "I like thinking outside the box", dimension: "creative" },
  { id: 25, text: "I enjoy creating stories or imagining new worlds", dimension: "creative" },
  { id: 26, text: "I like tasks where there is no single right answer", dimension: "creative" },
  { id: 27, text: "I enjoy brainstorming", dimension: "creative" },
  { id: 28, text: "I like experimenting with different ways to solve a problem", dimension: "creative" },
  { id: 29, text: "I enjoy arts, music, or creative writing", dimension: "creative" },
  { id: 30, text: "I like surprising people with new ideas", dimension: "creative" },
  { id: 31, text: "I enjoy looking at things from different angles", dimension: "creative" },
  { id: 32, text: "I like inventing new solutions", dimension: "creative" },
  { id: 33, text: "I enjoy combining ideas in unexpected ways", dimension: "creative" },
  { id: 34, text: "I like imagining how things could be improved", dimension: "creative" },
  { id: 35, text: "I enjoy creative projects more than tests", dimension: "creative" },
  { id: 36, text: "I like turning ordinary things into something new", dimension: "creative" },
  { id: 37, text: "I enjoy visualizing ideas", dimension: "creative" },
  { id: 38, text: "I like exploring 'what if' questions", dimension: "creative" },
  { id: 39, text: "I enjoy dreaming up original ideas", dimension: "creative" },
  { id: 40, text: "I like thinking freely without strict rules", dimension: "creative" },
  
  // Questions 64-69: Blended Styles (Creative-focused)
  { id: 64, text: "I like applying creative solutions to practical problems", dimension: "creative" },
  { id: 65, text: "I enjoy exploring different types of thinking", dimension: "creative" },
  { id: 66, text: "I like mixing imagination with logic", dimension: "creative" },
  { id: 67, text: "I enjoy creative activities that also require planning", dimension: "creative" },
  { id: 68, text: "I like solving problems in unique but effective ways", dimension: "creative" },
  { id: 69, text: "I enjoy practical projects that require creativity", dimension: "creative" },
  
  // Questions 75-82: Blended & Higher-Level (Creative-focused)
  { id: 75, text: "I enjoy projects that require both thinking and doing", dimension: "creative" },
  { id: 76, text: "I like finding new uses for ordinary things", dimension: "creative" },
  { id: 79, text: "I enjoy applying creativity to schoolwork", dimension: "creative" },
  { id: 81, text: "I enjoy imagining how the future could be different", dimension: "creative" },
  { id: 85, text: "I enjoy asking questions that others don't think about", dimension: "creative" },
  { id: 86, text: "I like generating multiple solutions before choosing one", dimension: "creative" },
  { id: 89, text: "I enjoy turning mistakes into new ideas", dimension: "creative" },
  
  // ===== Practical Thinking - 33 questions =====
  // Questions 41-60: Core Practical
  { id: 41, text: "I enjoy solving real-world problems", dimension: "practical" },
  { id: 42, text: "I like applying what I learn to real-life situations", dimension: "practical" },
  { id: 43, text: "I prefer practical tasks over theoretical ones", dimension: "practical" },
  { id: 44, text: "I enjoy fixing or improving things", dimension: "practical" },
  { id: 45, text: "I like coming up with solutions that actually work", dimension: "practical" },
  { id: 46, text: "I enjoy making plans for everyday tasks", dimension: "practical" },
  { id: 47, text: "I like learning skills I can use immediately", dimension: "practical" },
  { id: 48, text: "I enjoy managing time and tasks efficiently", dimension: "practical" },
  { id: 49, text: "I prefer doing rather than imagining", dimension: "practical" },
  { id: 50, text: "I like helping people solve real problems", dimension: "practical" },
  { id: 51, text: "I enjoy using tools or resources to solve challenges", dimension: "practical" },
  { id: 52, text: "I like figuring out shortcuts to get things done", dimension: "practical" },
  { id: 53, text: "I enjoy organizing my surroundings", dimension: "practical" },
  { id: 54, text: "I like applying learned steps to real problems", dimension: "practical" },
  { id: 55, text: "I enjoy solving practical challenges", dimension: "practical" },
  { id: 56, text: "I like learning by doing real activities", dimension: "practical" },
  { id: 57, text: "I enjoy building or assembling things", dimension: "practical" },
  { id: 58, text: "I like understanding how things work in real life", dimension: "practical" },
  { id: 59, text: "I prefer simple and effective solutions", dimension: "practical" },
  { id: 60, text: "I like making decisions that help me in daily life", dimension: "practical" },
  
  // Questions 77-80: Blended Styles (Practical-focused)
  { id: 77, text: "I enjoy comparing creative ideas to real needs", dimension: "practical" },
  { id: 78, text: "I like solving puzzles using unique methods", dimension: "practical" },
  { id: 80, text: "I like balancing new ideas with practical results", dimension: "practical" },
  
  // Questions 82, 88, 91-94, 96-97, 99-100: Higher-Level (Practical-focused)
  { id: 82, text: "I like improving ideas or objects I use daily", dimension: "practical" },
  { id: 88, text: "I like designing new systems or ways of doing things", dimension: "practical" },
  { id: 91, text: "I enjoy experimenting with different ways to think", dimension: "practical" },
  { id: 92, text: "I like building things that solve problems", dimension: "practical" },
  { id: 93, text: "I enjoy thinking about how to improve society", dimension: "practical" },
  { id: 94, text: "I like exploring questions that don't have one answer", dimension: "practical" },
  { id: 96, text: "I like evaluating ideas based on usefulness", dimension: "practical" },
  { id: 97, text: "I enjoy planning solutions for imaginary scenarios", dimension: "practical" },
  { id: 99, text: "I enjoy rethinking old ideas in new ways", dimension: "practical" },
  { id: 100, text: "I like combining creative and practical thinking to solve problems", dimension: "practical" },
];

// ============================================================================
// C. DUAL-PROCESS DECISION STYLE QUESTIONS (100 questions)
// Two dimensions: system1 (intuitive), system2 (reflective) (50 questions each)
// ============================================================================

export const dualProcessQuestionsTeen: Question[] = [
  // ===== System 1 (Intuitive) - 50 questions =====
  // Questions 1-20: Core Intuitive
  { id: 1, text: "I make decisions quickly based on my first feeling", dimension: "system1" },
  { id: 2, text: "I often rely on my instincts", dimension: "system1" },
  { id: 3, text: "I can decide fast without thinking too much", dimension: "system1" },
  { id: 4, text: "I trust my first reaction", dimension: "system1" },
  { id: 5, text: "I can solve problems quickly under pressure", dimension: "system1" },
  { id: 6, text: "I often choose what feels right", dimension: "system1" },
  { id: 7, text: "I can understand situations immediately", dimension: "system1" },
  { id: 8, text: "I rely more on feelings than analysis in some decisions", dimension: "system1" },
  { id: 9, text: "I enjoy making decisions on the spot", dimension: "system1" },
  { id: 10, text: "I feel confident making fast choices", dimension: "system1" },
  { id: 11, text: "I notice patterns instantly", dimension: "system1" },
  { id: 12, text: "I can make good decisions without much information", dimension: "system1" },
  { id: 13, text: "I often guess correctly based on my instincts", dimension: "system1" },
  { id: 14, text: "I enjoy quick decision tasks", dimension: "system1" },
  { id: 15, text: "I react quickly in unexpected situations", dimension: "system1" },
  { id: 16, text: "I decide based on what seems obvious", dimension: "system1" },
  { id: 17, text: "I make quick judgments about people or things", dimension: "system1" },
  { id: 18, text: "I act first and think later sometimes", dimension: "system1" },
  { id: 19, text: "I rely on experience, not analysis", dimension: "system1" },
  { id: 20, text: "I prefer fast decision-making to slow thinking", dimension: "system1" },
  
  // Questions 41-50: Balanced Thinking (System1-leaning)
  { id: 41, text: "I sometimes decide fast and sometimes slowly depending on the situation", dimension: "system1" },
  { id: 42, text: "I switch between instinct and logic easily", dimension: "system1" },
  { id: 43, text: "I know when to trust my intuition", dimension: "system1" },
  { id: 45, text: "I use both feelings and evidence to decide", dimension: "system1" },
  { id: 46, text: "I mix fast and slow thinking", dimension: "system1" },
  { id: 47, text: "I can decide quickly when needed", dimension: "system1" },
  { id: 49, text: "I adjust my decision style based on the problem", dimension: "system1" },
  { id: 50, text: "I use different styles for different challenges", dimension: "system1" },
  
  // Questions 54, 59, 66, 67, 75, 78: Real-Life & Evaluation (System1)
  { id: 54, text: "I trust my instincts when I'm unsure", dimension: "system1" },
  { id: 59, text: "I act fast when the situation is urgent", dimension: "system1" },
  { id: 65, text: "I trust my past experiences in decisions", dimension: "system1" },
  { id: 66, text: "I rely on my observations to decide quickly", dimension: "system1" },
  { id: 67, text: "I look for patterns before choosing", dimension: "system1" },
  { id: 75, text: "I trust my experience when stressed", dimension: "system1" },
  { id: 78, text: "I rely on instinct when I don't have time", dimension: "system1" },
  
  // Questions 71-72, 80, 86: Handling Pressure & Self-Awareness (System1)
  { id: 71, text: "I think clearly even in stressful situations", dimension: "system1" },
  { id: 72, text: "I can make fast choices when needed", dimension: "system1" },
  { id: 80, text: "I make my best decisions when I feel calm", dimension: "system1" },
  { id: 86, text: "I understand when my instincts are strong", dimension: "system1" },
  
  // Questions 91, 95, 100: Higher-Level Skills (System1)
  { id: 91, text: "I can balance different opinions before choosing", dimension: "system1" },
  { id: 95, text: "I think about other people's feelings when deciding", dimension: "system1" },
  { id: 100, text: "I learn from both fast and slow decisions", dimension: "system1" },
  
  // ===== System 2 (Reflective) - 50 questions =====
  // Questions 21-40: Core Reflective
  { id: 21, text: "I take time to analyze before making decisions", dimension: "system2" },
  { id: 22, text: "I prefer to think carefully before acting", dimension: "system2" },
  { id: 23, text: "I weigh pros and cons before choosing", dimension: "system2" },
  { id: 24, text: "I double-check information before deciding", dimension: "system2" },
  { id: 25, text: "I enjoy slow and thoughtful decision-making", dimension: "system2" },
  { id: 26, text: "I rely on logic more than feelings", dimension: "system2" },
  { id: 27, text: "I prefer detailed information before deciding", dimension: "system2" },
  { id: 28, text: "I take longer but make careful decisions", dimension: "system2" },
  { id: 29, text: "I like planning before acting", dimension: "system2" },
  { id: 30, text: "I analyze many options before choosing one", dimension: "system2" },
  { id: 31, text: "I think deeply when decisions are important", dimension: "system2" },
  { id: 32, text: "I prefer structured steps when choosing", dimension: "system2" },
  { id: 33, text: "I reflect on past decisions to improve", dimension: "system2" },
  { id: 34, text: "I avoid rushing decisions", dimension: "system2" },
  { id: 35, text: "I need time alone to think before choosing", dimension: "system2" },
  { id: 36, text: "I consider future consequences when deciding", dimension: "system2" },
  { id: 37, text: "I enjoy evaluating different perspectives", dimension: "system2" },
  { id: 38, text: "I gather evidence before making conclusions", dimension: "system2" },
  { id: 39, text: "I try to understand all details before acting", dimension: "system2" },
  { id: 40, text: "I like thinking through problems fully", dimension: "system2" },
  
  // Questions 44, 48: Balanced Thinking (System2-leaning)
  { id: 44, text: "I know when careful thinking is needed", dimension: "system2" },
  { id: 48, text: "I can think carefully when needed", dimension: "system2" },
  
  // Questions 51-53, 55-58, 60: Real-Life Scenarios (System2)
  { id: 51, text: "I think before spending money", dimension: "system2" },
  { id: 52, text: "I choose friends carefully", dimension: "system2" },
  { id: 53, text: "I judge risks before trying something new", dimension: "system2" },
  { id: 55, text: "I slow down when decisions feel important", dimension: "system2" },
  { id: 56, text: "I ask others for advice before deciding", dimension: "system2" },
  { id: 57, text: "I change my mind if I get new information", dimension: "system2" },
  { id: 58, text: "I think about long-term consequences", dimension: "system2" },
  { id: 60, text: "I prefer clear steps for making decisions", dimension: "system2" },
  
  // Questions 61-64, 68-70: Evaluating Information (System2)
  { id: 61, text: "I check facts before believing something", dimension: "system2" },
  { id: 62, text: "I question information that seems wrong", dimension: "system2" },
  { id: 63, text: "I analyze messages or news carefully", dimension: "system2" },
  { id: 64, text: "I avoid reacting without checking details", dimension: "system2" },
  { id: 68, text: "I think logically to solve problems", dimension: "system2" },
  { id: 69, text: "I avoid making decisions based on emotion alone", dimension: "system2" },
  { id: 70, text: "I avoid making decisions without thinking at all", dimension: "system2" },
  
  // Questions 73-74, 76-77, 79: Handling Pressure (System2)
  { id: 73, text: "I stay calm when the decision is hard", dimension: "system2" },
  { id: 74, text: "I slow down when I feel unsure", dimension: "system2" },
  { id: 76, text: "I avoid rushing unless it's necessary", dimension: "system2" },
  { id: 77, text: "I prefer thinking slowly under pressure", dimension: "system2" },
  { id: 79, text: "I take breaks to think better", dimension: "system2" },
  
  // Questions 81-85, 87-90: Self-Awareness (System2)
  { id: 81, text: "I know my strengths in decision-making", dimension: "system2" },
  { id: 82, text: "I recognize when I'm being too fast", dimension: "system2" },
  { id: 83, text: "I can tell when I'm overthinking", dimension: "system2" },
  { id: 84, text: "I know when I need more information", dimension: "system2" },
  { id: 85, text: "I notice when emotions influence my decisions", dimension: "system2" },
  { id: 87, text: "I ask for help when needed", dimension: "system2" },
  { id: 88, text: "I know when to trust myself", dimension: "system2" },
  { id: 89, text: "I reflect on my decisions afterward", dimension: "system2" },
  { id: 90, text: "I try to improve my decision-making each time", dimension: "system2" },
  
  // Questions 92-94, 96-99: Higher-Level Skills (System2)
  { id: 92, text: "I decide based on goals, not pressure", dimension: "system2" },
  { id: 93, text: "I understand that mistakes help me learn", dimension: "system2" },
  { id: 94, text: "I change strategies when one doesn't work", dimension: "system2" },
  { id: 96, text: "I can solve complex problems by breaking them down", dimension: "system2" },
  { id: 97, text: "I avoid making decisions to impress others", dimension: "system2" },
  { id: 98, text: "I think through problems from multiple sides", dimension: "system2" },
  { id: 99, text: "I decide based on facts, not rumors", dimension: "system2" },
];

/**
 * QUESTION BANK SUMMARY
 * 
 * KOLB (100 questions - 25 per dimension):
 * - CE (Concrete Experience): Questions 1-20, 81-85
 * - RO (Reflective Observation): Questions 21-40, 86-90
 * - AC (Abstract Conceptualization): Questions 41-60, 91-95
 * - AE (Active Experimentation): Questions 61-80, 96-100
 * 
 * STERNBERG (100 questions):
 * - Analytical: 34 questions (1-20, 61-63, 70-74, 83-84, 87, 90, 95, 98)
 * - Creative: 33 questions (21-40, 64-69, 75-76, 79, 81, 85-86, 89)
 * - Practical: 33 questions (41-60, 77-78, 80, 82, 88, 91-94, 96-97, 99-100)
 * 
 * DUAL-PROCESS (100 questions - 50 per dimension):
 * - System1 (Intuitive): Questions 1-20, 41-43, 45-47, 49-50, 54, 59, 65-67, 71-72, 75, 78, 80, 86, 91, 95, 100
 * - System2 (Reflective): Questions 21-40, 44, 48, 51-53, 55-58, 60-64, 68-70, 73-74, 76-77, 79, 81-85, 87-90, 92-94, 96-99
 * 
 * All questions are:
 * - Age-appropriate for teens (15-18 years)
 * - Framework-aligned with research models
 * - Designed for 5-point Likert scale scoring
 * - Ready for personalized selection (12 questions per assessment)
 */
