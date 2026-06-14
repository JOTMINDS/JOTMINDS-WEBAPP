import { AssessmentScore } from '../types';
import { teachingStyleQuestions } from './teachingStyleQuestions';

export const calculateTeachingStyleScore = (responses: number[]): AssessmentScore['teaching-style'] => {
  // Helper to get response for a specific question ID (1-based index in questions array)
  // responses array is 0-indexed, so we map question ID to index-1
  const getResponse = (id: number) => {
    return responses[id - 1] || 0; // Return 0 if missing/unanswered
  };

  const calculateAxisScore = (positiveIds: number[], negativeIds: number[]) => {
    // Filter to only include questions that were actually answered (value > 0)
    const validPositive = positiveIds.filter(id => getResponse(id) > 0);
    const validNegative = negativeIds.filter(id => getResponse(id) > 0);

    // If no data at all for this axis, return 50 (Neutral)
    if (validPositive.length === 0 && validNegative.length === 0) {
        return 50;
    }

    // Calculate averages based only on answered questions
    const positiveSum = validPositive.reduce((sum, id) => sum + getResponse(id), 0);
    const positiveAvg = validPositive.length > 0 ? positiveSum / validPositive.length : 3; // Default to neutral 3 if side missing

    const negativeSum = validNegative.reduce((sum, id) => sum + getResponse(id), 0);
    const negativeAvg = validNegative.length > 0 ? negativeSum / validNegative.length : 3; // Default to neutral 3 if side missing

    // Formula: (Positive – Negative + 4) / 8 × 100
    return Math.round(((positiveAvg - negativeAvg + 4) / 8) * 100);
  };

  // A. Authority vs Facilitation
  const axisAuthority = calculateAxisScore(
    [7, 18, 20, 22, 24, 93, 94, 96, 97, 99, 100, 101, 103, 104, 106, 162], // Positive (Facilitation)
    [1, 2, 6, 17, 19, 21, 23, 95, 98, 102, 105, 143, 158] // Negative (Authority)
  );

  // B. Knowledge Transmission vs Construction
  const axisKnowledge = calculateAxisScore(
    [11, 12, 13, 15, 16, 92, 163], // Positive (Construction)
    [9, 10, 14, 91, 130] // Negative (Transmission)
  );

  // C. Motivation Style
  const axisMotivation = calculateAxisScore(
    [26, 27, 28, 29, 31, 32, 161, 164], // Positive (Intrinsic)
    [25, 30] // Negative (Extrinsic)
  );

  // D. Assessment Mindset
  const axisAssessment = calculateAxisScore(
    [34, 35, 36, 38, 40, 121, 122, 124, 125, 126, 128, 129, 131, 132, 133, 138, 146, 150], // Positive (Growth)
    [33, 37, 39, 123, 127] // Negative (Judgment)
  );

  // E. Adaptability
  const axisAdaptability = calculateAxisScore(
    [42, 43, 44, 45, 47, 48, 107, 108, 110, 111, 112, 114, 115, 117, 118, 119, 120, 134, 144, 160], // Positive (Adaptive)
    [41, 46, 109, 113, 116, 140, 141, 145] // Negative (Fixed)
  );

  // F. Emotional Climate
  const axisClimate = calculateAxisScore(
    [50, 51, 53, 54, 55, 137, 155, 156, 157, 159], // Positive (Safe)
    [49, 52, 56, 148] // Negative (Fear-based)
  );

  // Calculate Innovation Score (Section H average, normalized to 100)
  // Questions 57-64
  const innovationIds = [57, 58, 59, 60, 61, 62, 63, 64, 135, 136, 139, 142, 147, 149, 151, 152, 153, 154];
  const validInnovation = innovationIds.filter(id => getResponse(id) > 0);
  
  let innovationNormalized = 50; // Default neutral
  if (validInnovation.length > 0) {
      const innovationSum = validInnovation.reduce((sum, id) => sum + getResponse(id), 0);
      const innovationAvg = innovationSum / validInnovation.length;
      innovationNormalized = Math.round(((innovationAvg - 1) / 4) * 100);
  }


  // Determine Profile
  // We need to determine a Primary and Secondary style.
  // The prompt gives rules for specific profiles. We can check which criteria are met and assign the best fit.

  const profiles = [
    { name: "Authoritative Instructor", score: (axisAuthority < 40 && axisAdaptability < 40) ? 10 : 0 },
    { name: "Structured Educator", score: (axisAuthority < 40 && axisAssessment > 60) ? 10 : 0 },
    { name: "Facilitator Coach", score: (axisAuthority > 60 && axisClimate > 60) ? 10 : 0 },
    { name: "Engagement Driver", score: (axisMotivation > 60) ? 10 : 0 }, // Maybe add condition
    { name: "Learning Architect", score: (axisKnowledge > 60 && axisAssessment > 60) ? 10 : 0 },
    { name: "Innovation Leader", score: (axisAdaptability > 60 && innovationNormalized > 60) ? 10 : 0 },
    { name: "Traditionalist", score: (axisKnowledge < 40 && axisAssessment < 40) ? 10 : 0 },
    { name: "Student-Centered Mentor", score: (axisClimate > 60 && axisKnowledge > 60) ? 10 : 0 },
  ];
  
  // Since rules are strict boolean logic in prompt, multiple might apply or none. 
  // We need a fallback or a way to rank them.
  // Let's calculate a "fit score" for each profile based on distance from the target thresholds.
  
  // Refined Logic: Calculate distance to "ideal" for each profile.
  // We'll normalize all to 0-100 scale where 100 is perfect fit.
  
  const getFit = (actual: number, target: number, isMin: boolean) => {
    // If isMin is true, we want actual > target. Fit increases as actual increases.
    // If isMin is false, we want actual < target. Fit increases as actual decreases.
    if (isMin) {
        if (actual >= target) return 100;
        return (actual / target) * 100;
    } else {
        if (actual <= target) return 100;
        // target=40. actual=100 -> 0. actual=40 -> 100.
        // Fit = (1 - (actual - target) / (100 - target)) * 100?
        // if actual=100, target=40: (1 - 60/60) = 0.
        // if actual=70, target=40: (1 - 30/60) = 0.5.
        return Math.max(0, (1 - (actual - target) / (100 - target)) * 100);
    }
  };

  const profileScores = [
    { 
      name: "Authoritative Instructor", 
      fit: (getFit(axisAuthority, 40, false) + getFit(axisAdaptability, 40, false)) / 2 
    },
    { 
      name: "Structured Educator", 
      fit: (getFit(axisAuthority, 40, false) + getFit(axisAssessment, 60, true)) / 2 
    },
    { 
      name: "Facilitator Coach", 
      fit: (getFit(axisAuthority, 60, true) + getFit(axisClimate, 60, true)) / 2 
    },
    { 
      name: "Engagement Driver", 
      fit: getFit(axisMotivation, 70, true) // Single dimension, so higher threshold?
    },
    { 
      name: "Learning Architect", 
      fit: (getFit(axisKnowledge, 60, true) + getFit(axisAssessment, 60, true)) / 2 
    },
    { 
      name: "Innovation Leader", 
      fit: (getFit(axisAdaptability, 60, true) + getFit(innovationNormalized, 60, true)) / 2 
    },
    { 
      name: "Traditionalist", 
      fit: (getFit(axisKnowledge, 40, false) + getFit(axisAssessment, 40, false)) / 2 
    },
    { 
      name: "Student-Centered Mentor", 
      fit: (getFit(axisClimate, 60, true) + getFit(axisKnowledge, 60, true)) / 2 
    }
  ];

  // Sort by fit descending
  profileScores.sort((a, b) => b.fit - a.fit);

  return {
    primaryStyle: profileScores[0].name,
    secondaryStyle: profileScores[1].name,
    scores: {
      authority: 0, // Legacy/unused?
      facilitation: 0,
      transmission: 0,
      construction: 0,
      extrinsic: 0,
      intrinsic: 0,
      judgment: 0,
      growth: 0,
      fixed: 0,
      adaptive: 0,
      fearBased: 0,
      safe: 0,
      
      axisAuthority,
      axisKnowledge,
      axisMotivation,
      axisAssessment,
      axisAdaptability,
      axisClimate
    }
  };
};
