import { teachingStyleQuestions } from './teachingStyleQuestions';
import { Question } from '../types';

// ... (keep existing exports)
export const teachingStyleProfiles = {
  "Authoritative Instructor": {
    strengths: ["Clear classroom structure", "Effective discipline management", "Direct instruction"],
    blindSpots: ["May inhibit student creativity", "Less adaptable to individual needs", "Risk of disengagement"],
    recommendations: ["Try incorporating more student-led activities", "Allow for flexible seating or grouping", "Practice positive reinforcement over strict discipline"]
  },
  "Structured Educator": {
    strengths: ["Organized lesson plans", "Clear learning objectives", "Data-driven improvement"],
    blindSpots: ["May be too rigid with pacing", "Might overlook emotional cues", "Could stifle spontaneous learning moments"],
    recommendations: ["Build 'flex time' into lessons", "Allow students to choose assessment methods", "Focus on qualitative feedback alongside scores"]
  },
  "Facilitator Coach": {
    strengths: ["High student engagement", "Strong emotional safety", "Encourages critical thinking"],
    blindSpots: ["Classroom may feel chaotic", "Content coverage might suffer", "Assessment can be subjective"],
    recommendations: ["Establish clear boundaries within the freedom", "Ensure core curriculum standards are met", "Use rubrics to standardize subjective assessments"]
  },
  "Engagement Driver": {
    strengths: ["High energy lessons", "Strong student motivation", "Memorable learning experiences"],
    blindSpots: ["May prioritize fun over depth", "Quiet students might feel overwhelmed", "Reliance on extrinsic rewards"],
    recommendations: ["Balance excitement with deep reflection", "Create space for quiet contemplation", "Shift gradually from prizes to intrinsic motivation"]
  },
  "Learning Architect": {
    strengths: ["Constructivist approach", "Deep understanding focus", "Growth-oriented assessment"],
    blindSpots: ["Planning is time-consuming", "Struggling students may get lost", "Less focus on rote memorization checks"],
    recommendations: ["Scaffold complex tasks for lower achievers", "Use quick checks for understanding", "Share planning load with colleagues"]
  },
  "Innovation Leader": {
    strengths: ["Adaptable to change", "Uses technology effectively", "Creative problem solving"],
    blindSpots: ["Constant change can confuse students", "May neglect traditional basics", "Technology reliance"],
    recommendations: ["Ensure consistency in routines", "Don't abandon proven traditional methods entirely", "Have backup plans for tech failures"]
  },
  "Traditionalist": {
    strengths: ["Strong content knowledge transmission", "Clear standards", "Predictable environment"],
    blindSpots: ["Passive student role", "Low engagement", "Resistance to modern needs"],
    recommendations: ["Integrate one active learning strategy per week", "Try formative assessment without grading", "Connect content to students' lives"]
  },
  "Student-Centered Mentor": {
    strengths: ["Strong relationships", "Tailored instruction", "Safe learning environment"],
    blindSpots: ["Boundaries can blur", "High emotional labor for teacher", "May avoid necessary conflict"],
    recommendations: ["Maintain professional boundaries", "Prioritize self-care", "Practice holding students accountable firmly but kindly"]
  }
};

export const axisDescriptions = {
  axisAuthority: {
    title: "Authority vs Facilitation",
    low: "High Authority",
    high: "High Facilitation",
    description: "Measures the balance between teacher control and student empowerment."
  },
  axisKnowledge: {
    title: "Transmission vs Construction",
    low: "Transmission",
    high: "Construction",
    description: "Measures whether you deliver knowledge or help students build it."
  },
  axisMotivation: {
    title: "Motivation Style",
    low: "Extrinsic",
    high: "Intrinsic",
    description: "Measures how you drive student effort (rewards vs interest)."
  },
  axisAssessment: {
    title: "Assessment Mindset",
    low: "Judgment",
    high: "Growth",
    description: "Measures if assessment is used to rank or to improve."
  },
  axisAdaptability: {
    title: "Adaptability",
    low: "Fixed",
    high: "Adaptive",
    description: "Measures cognitive flexibility and willingness to change methods."
  },
  axisClimate: {
    title: "Emotional Climate",
    low: "Fear-based",
    high: "Safe",
    description: "Measures the psychological safety and relationship quality."
  }
};

export const generateDeepDiveQuestions = (countPerAxis = 8): Question[] => {
    // Pools definition based on Axes (Aligned with scoring logic)
    const pools = {
        authorityPos: [7, 18, 20, 22, 24, 93, 94, 96, 97, 99, 100, 101, 103, 104, 106, 162],
        authorityNeg: [1, 2, 6, 17, 19, 21, 23, 95, 98, 102, 105, 143, 158],
        
        knowledgePos: [11, 12, 13, 15, 16, 92, 163],
        knowledgeNeg: [9, 10, 14, 91, 130],
        
        assessmentPos: [34, 35, 36, 38, 40, 121, 122, 124, 125, 126, 128, 129, 131, 132, 133, 138, 146, 150],
        assessmentNeg: [33, 37, 39, 123, 127],
        
        climatePos: [50, 51, 53, 54, 55, 137, 155, 156, 157, 159],
        climateNeg: [49, 52, 56, 148],
        
        adaptPos: [42, 43, 44, 45, 47, 48, 107, 108, 110, 111, 112, 114, 115, 117, 118, 119, 120, 134, 144, 160],
        adaptNeg: [41, 46, 109, 113, 116, 140, 141, 145],
        
        motivationAll: [25, 26, 27, 28, 29, 30, 31, 32, 161, 164],
        
        // Innovation is a derived secondary metric but useful to include
        innovationAll: [57, 58, 59, 60, 61, 62, 63, 64, 135, 136, 139, 142, 147, 149, 151, 152, 153, 154]
    };

    const getRandomSubset = (arr: number[], count: number) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    };

    // Calculate how many positive vs negative to take for balanced axes
    // We aim for countPerAxis total per axis.
    const split = Math.floor(countPerAxis / 2);
    
    let selectedIds = [
        ...getRandomSubset(pools.authorityPos, split),
        ...getRandomSubset(pools.authorityNeg, split),
        
        ...getRandomSubset(pools.knowledgePos, split),
        ...getRandomSubset(pools.knowledgeNeg, split),
        
        ...getRandomSubset(pools.assessmentPos, split),
        ...getRandomSubset(pools.assessmentNeg, split),
        
        ...getRandomSubset(pools.climatePos, split),
        ...getRandomSubset(pools.climateNeg, split),
        
        ...getRandomSubset(pools.adaptPos, split),
        ...getRandomSubset(pools.adaptNeg, split),
        
        // Motivation and Innovation are often "All" pools in this simplified structure, 
        // but we can just pick countPerAxis from them directly
        ...getRandomSubset(pools.motivationAll, countPerAxis),
        ...getRandomSubset(pools.innovationAll, countPerAxis)
    ];

    // Remove duplicates (though pools are mostly distinct, some might overlap in theory if design changes)
    selectedIds = Array.from(new Set(selectedIds));

    // Map to actual question objects
    return selectedIds
        .map(id => teachingStyleQuestions.find(q => q.id === id)!)
        .filter(Boolean)
        .sort((a, b) => a.id - b.id); // Sort by ID or shuffle? Shuffle is better for test taking.
        // .sort(() => Math.random() - 0.5);
};
