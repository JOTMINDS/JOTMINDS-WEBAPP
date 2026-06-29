import { ProfessionalCognitiveProfile } from './professionalCognitiveScoring';
import { CognitiveProfile } from './cognitiveProfileApi';
export interface RoleCognitiveDemand {
  analyticalDepth: number; // 1-10
  ambiguityTolerance: number; // 1-10
  emotionalLaborLoad: number; // 1-10
  decisionSpeed: number; // 1-10
  stakeholderComplexity: number; // 1-10
  repetitionVsInnovation: number; // 1-10 (1 = Repetitive, 10 = Innovative)
  socialExposure: number; // 1-10
  detailSensitivity: number; // 1-10
  autonomyRequired: number; // 1-10
  cognitiveLoadVolatility: number; // 1-10
}

export interface CognitiveRoleFitScore {
  fitScore: number; // 0-100
  fitCategory: 'Natural Accelerator' | 'Strong Alignment' | 'Adaptable Fit' | 'Strain Risk' | 'Misalignment Risk';
  riskFlags: string[];
  gapMap: Record<keyof RoleCognitiveDemand, { candidate: number; required: number; gap: number }>;
  performancePrediction: {
    successProjection90Day: string;
    burnoutRisk: 'Low' | 'Medium' | 'High' | 'Severe';
  };
}

/**
 * Maps the candidate's existing cognitive profile (from assessments)
 * to the 10-dimensional 1-10 scale used by the Role Cognitive Demand.
 */
export function mapCandidateToDimensions(profile: ProfessionalCognitiveProfile): RoleCognitiveDemand {
  // Normalize scores from 0-30 to 1-10 scale
  const norm = (score: number) => Math.max(1, Math.min(10, Math.round((score / 30) * 10)));
  
  const learning = norm(profile.learning.score);
  const thinking = norm(profile.thinking.score);
  const decision = norm(profile.decisionMaking.score);
  const motivation = profile.motivation ? norm(profile.motivation.score) : 5;

  return {
    analyticalDepth: profile.thinking.style.includes('Analytical') ? Math.max(7, thinking) : Math.max(1, thinking - 3),
    ambiguityTolerance: profile.decisionMaking.style === 'Intuitive Decision Maker' ? Math.max(7, decision) : Math.max(1, decision - 3),
    emotionalLaborLoad: profile.motivation?.style.includes('Collaborative') ? Math.max(7, motivation) : Math.max(1, motivation - 2),
    decisionSpeed: profile.decisionMaking.style === 'Intuitive Decision Maker' ? 9 : profile.decisionMaking.style === 'Reflective Decision Maker' ? 3 : 6,
    stakeholderComplexity: profile.motivation?.style.includes('Collaborative') ? Math.max(6, motivation) : 4,
    repetitionVsInnovation: profile.thinking.style.includes('Creative') ? 9 : profile.thinking.style === 'Analytical Thinker' ? 4 : 6,
    socialExposure: profile.motivation?.style.includes('Collaborative') || profile.motivation?.style.includes('Autonomous') ? 8 : 3,
    detailSensitivity: profile.thinking.style.includes('Analytical') ? 9 : 4,
    autonomyRequired: profile.motivation?.style.includes('Autonomous') ? 9 : profile.motivation?.style.includes('Dependent') ? 2 : 5,
    cognitiveLoadVolatility: profile.decisionMaking.style.includes('Balanced') ? 9 : profile.learning.style === 'Hands-On Learner' ? 8 : 4,
  };
}

/**
 * Maps the student's 0-100 CognitiveProfile to the 10-dimensional 1-10 scale used by the Role Cognitive Demand.
 */
export function mapStudentToDimensions(profile: CognitiveProfile): RoleCognitiveDemand {
  const norm = (score: number) => Math.max(1, Math.min(10, Math.round(score / 10)));
  
  return {
    analyticalDepth: norm(profile.analyticalDepth),
    ambiguityTolerance: norm(profile.cognitiveFlexibility),
    emotionalLaborLoad: norm(profile.metacognitiveAwareness), // Proxied from metacognition
    decisionSpeed: norm(profile.intuitiveSpeed),
    stakeholderComplexity: norm(profile.cognitiveFlexibility), // Proxied from flexibility
    repetitionVsInnovation: norm(profile.innovationPotential),
    socialExposure: 5, // Neutral fallback for students unless specified
    detailSensitivity: norm(profile.practicalExecution),
    autonomyRequired: norm(profile.executionCapability),
    cognitiveLoadVolatility: norm(profile.learningAgility),
  };
}

export function calculateRoleFitScore(
  candidateProfile: ProfessionalCognitiveProfile | CognitiveProfile,
  roleDemand: RoleCognitiveDemand
): CognitiveRoleFitScore {
  const candidateDimensions = 'learningAgility' in candidateProfile 
    ? mapStudentToDimensions(candidateProfile as CognitiveProfile)
    : mapCandidateToDimensions(candidateProfile as ProfessionalCognitiveProfile);

  const gapMap: any = {};
  
  let totalDifference = 0;
  let maxPossibleDifference = 90; // 9 max difference * 10 dimensions

  // 1. Calculate Gap Map
  (Object.keys(roleDemand) as Array<keyof RoleCognitiveDemand>).forEach(key => {
    const candidateVal = candidateDimensions[key];
    const requiredVal = roleDemand[key];
    const gap = candidateVal - requiredVal;
    
    gapMap[key] = { candidate: candidateVal, required: requiredVal, gap };
    
    // Weighted penalties (e.g., being under-qualified is worse than over-qualified in some dimensions)
    if (gap < 0) {
      totalDifference += Math.abs(gap) * 1.2; // 20% penalty for being under the requirement
    } else {
      totalDifference += gap * 0.8; // slight penalty for over-qualification (boredom risk)
    }
  });

  // 2. Base Fit Score Calculation
  const rawScore = 100 - ((totalDifference / maxPossibleDifference) * 100);
  
  // Specific weighted adjustments based on requested specs:
  // Cognitive compatibility (40%), Decision rhythm (15%), Emotional load (15%), Social (15%), Energy (15%)
  const decisionGap = Math.abs(gapMap.decisionSpeed.gap);
  const emotionalGap = Math.abs(gapMap.emotionalLaborLoad.gap);
  const socialGap = Math.abs(gapMap.socialExposure.gap);
  const energyGap = Math.abs(gapMap.cognitiveLoadVolatility.gap);

  let weightedScore = rawScore;
  weightedScore -= (decisionGap * 1.5);
  weightedScore -= (emotionalGap * 1.5);
  weightedScore -= (socialGap * 1.5);
  weightedScore -= (energyGap * 1.5);

  const finalFitScore = Math.max(0, Math.min(100, Math.round(weightedScore)));

  // 3. Fit Category
  let fitCategory: CognitiveRoleFitScore['fitCategory'] = 'Misalignment Risk';
  if (finalFitScore >= 85) fitCategory = 'Natural Accelerator';
  else if (finalFitScore >= 70) fitCategory = 'Strong Alignment';
  else if (finalFitScore >= 55) fitCategory = 'Adaptable Fit';
  else if (finalFitScore >= 40) fitCategory = 'Strain Risk';

  // 4. Risk Flags
  const riskFlags: string[] = [];
  if (gapMap.cognitiveLoadVolatility.gap < -3) riskFlags.push('⚠ High Burnout Probability');
  if (gapMap.decisionSpeed.gap < -3) riskFlags.push('⚠ Decision Friction Likely');
  if (gapMap.socialExposure.gap < -3) riskFlags.push('⚠ Social Fatigue Risk');
  if (gapMap.decisionSpeed.gap > 3 && roleDemand.decisionSpeed <= 4) riskFlags.push('⚠ Overthinking in High-Speed Role');
  if (gapMap.repetitionVsInnovation.gap > 3 && roleDemand.repetitionVsInnovation <= 3) riskFlags.push('⚠ Under-Stimulation Risk');
  if (gapMap.autonomyRequired.gap < -3) riskFlags.push('⚠ Conflict with Authority Structure');

  // 5. Performance Prediction
  let burnoutRisk: 'Low' | 'Medium' | 'High' | 'Severe' = 'Low';
  if (finalFitScore < 40 || gapMap.cognitiveLoadVolatility.gap < -4) burnoutRisk = 'Severe';
  else if (finalFitScore < 55 || gapMap.emotionalLaborLoad.gap < -3) burnoutRisk = 'High';
  else if (finalFitScore < 70) burnoutRisk = 'Medium';

  let successProjection90Day = 'Fast Start Probability: 85%+. Minimal coaching required.';
  if (finalFitScore < 85) successProjection90Day = 'Adaptation Curve Length: 4-6 weeks. Standard onboarding required.';
  if (finalFitScore < 70) successProjection90Day = 'Adaptation Curve Length: 8-12 weeks. High coaching intensity required.';
  if (finalFitScore < 55) successProjection90Day = 'Severe adaptation challenges projected. Immediate mentorship intervention necessary.';

  return {
    fitScore: finalFitScore,
    fitCategory,
    riskFlags,
    gapMap,
    performancePrediction: {
      successProjection90Day,
      burnoutRisk
    }
  };
}

export function generatePersonalizedReport(fitScore: CognitiveRoleFitScore, roleTitle: string, isCandidateView: boolean) {
  // Response Variability Engine (Deterministic Logic)
  const tones = {
    executive: 'Strategic alignment indicates',
    coaching: 'To thrive in this role, consider',
    direct: 'The data shows',
  };

  const getTone = () => {
    if (fitScore.fitScore >= 85) return tones.executive;
    if (fitScore.fitScore >= 55) return tones.coaching;
    return tones.direct;
  };

  if (isCandidateView) {
    return {
      alignment: `${getTone()} a ${fitScore.fitScore}% match with the ${roleTitle} role. You are classified as a ${fitScore.fitCategory}.`,
      struggles: fitScore.riskFlags.length > 0 
        ? `You may encounter friction in areas such as: ${fitScore.riskFlags.map(f => f.replace('⚠ ', '')).join(', ')}.`
        : 'There are no major cognitive misalignments detected.',
      adaptationPlan: fitScore.fitScore >= 70 
        ? 'Lean into your natural strengths. You will likely accelerate quickly in this role.' 
        : 'Focus on pacing your energy and seeking mentorship around decision speed and emotional labor expectations.',
      interviewTips: `Highlight your ability to handle ${fitScore.gapMap.analyticalDepth.candidate >= 7 ? 'complex analysis' : 'practical execution'}.`
    };
  } else {
    return {
      summary: `Candidate Fit: ${fitScore.fitScore}% (${fitScore.fitCategory})`,
      riskAnalysis: `Burnout Risk is ${fitScore.performancePrediction.burnoutRisk}. Identified flags: ${fitScore.riskFlags.join(' | ')}`,
      recommendation: fitScore.fitScore >= 70 ? 'Hire' : fitScore.fitScore >= 55 ? 'Hire with coaching plan' : 'Not recommended',
      replacementRiskIndex: fitScore.performancePrediction.burnoutRisk === 'Severe' ? 'High (6-month flight risk)' : 'Low (Stable)'
    };
  }
}
