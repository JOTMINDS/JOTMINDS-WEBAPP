/**
 * Internal Framework Mapping Table
 * 
 * This file maintains the backend mapping of assessment modules to their theoretical frameworks.
 * It is used for future audits, scientific documentation, and transparency.
 */

export interface FrameworkMapping {
  assessment: string;
  itemModule: string;
  construct: string;
  frameworkSource: string;
  scoreDimension: string;
  reportOutput: string;
}

export const frameworkMappings: FrameworkMapping[] = [
  {
    assessment: "JotMinds Learner Assessment",
    itemModule: "Learning Style",
    construct: "Experiential Learning Preferences",
    frameworkSource: "Kolb's Experiential Learning Theory",
    scoreDimension: "CE, RO, AC, AE (Concrete Experience, Reflective Observation, Abstract Conceptualization, Active Experimentation)",
    reportOutput: "Learning Style Insights"
  },
  {
    assessment: "JotMinds Learner Assessment",
    itemModule: "Thinking Style",
    construct: "Cognitive Processing & Intelligence",
    frameworkSource: "Sternberg's Triarchic Theory of Intelligence",
    scoreDimension: "Analytical, Creative, Practical",
    reportOutput: "Thinking Strategy Score"
  },
  {
    assessment: "JotMinds Learner Assessment",
    itemModule: "Decision Style",
    construct: "Decision-Making Processing",
    frameworkSource: "Dual Process Theory (Kahneman)",
    scoreDimension: "System 1 (Intuitive), System 2 (Analytical)",
    reportOutput: "Decision Style Preference"
  }
];
