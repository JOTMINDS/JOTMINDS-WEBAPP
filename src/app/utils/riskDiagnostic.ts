import { User, Assessment } from '../types';
import { calculateStudentEngagementAndRisk } from '../components/SchoolAnalyticsDashboard';
import { formatDate } from './dateFormat';

export interface DiagnosticRootCause {
  title: string;
  category: 'completion' | 'experiential' | 'thinking' | 'decision' | 'recency';
  severity: 'critical' | 'moderate' | 'low' | 'positive';
  explanation: string;
  impactOnLearning: string;
}

export interface PrescriptiveIntervention {
  target: 'Teacher' | 'Student' | 'Counselor / School';
  action: string;
  priority: 'urgent' | 'high' | 'routine';
  rationale: string;
}

export interface StudentRiskDiagnostic {
  studentId: string;
  studentName: string;
  riskLevel: 'high' | 'medium' | 'low' | 'unassessed';
  diagnosticConfidence: number; // 0 - 100%
  primaryRiskFactor: string;
  severity: 'Critical' | 'Moderate' | 'Low' | 'Pending';
  pedagogicalSummary: string;
  rootCauses: DiagnosticRootCause[];
  interventions: PrescriptiveIntervention[];
  metrics: {
    engagementScore: number;
    completedCount: number;
    daysSinceLastActive: number;
    learningStyle?: string;
    thinkingStyle?: string;
    decisionStyle?: string;
    experientialBalanceScore?: number; // 0-100
    decisionBalanceScore?: number; // 0-100
  };
  learningPathway: string;
  diagnosedAt: string;
}

/**
 * Deterministic Pedagogical Diagnostic Engine
 * Evaluates cognitive assessments, engagement velocity, and modality asymmetries
 * to produce actionable risk evaluations without any dependency on external labels.
 */
export function diagnoseStudentRisk(
  student: User, 
  assessments: Assessment[]
): StudentRiskDiagnostic {
  const studentAssessments = assessments.filter(
    a => a.userId === student.id && (a.completed || a.completedAt || (a as any).status === 'completed')
  );

  const latestLearning = studentAssessments
    .filter(a => a.type === 'kolb' || (a.type as any) === 'learning')
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];

  const latestThinking = studentAssessments
    .filter(a => ['sternberg', 'jhs-thinking', 'shs-thinking', 'adult-thinking', 'child-thinking'].includes(a.type))
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];

  const latestDecision = studentAssessments
    .filter(a => a.type === 'dual-process' || (a.type as any) === 'decision')
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];

  const completedCount = [latestLearning, latestThinking, latestDecision].filter(Boolean).length;

  // Determine recency
  let daysSinceLastActive = 999;
  const dates = studentAssessments
    .map(a => a.completedAt ? new Date(a.completedAt).getTime() : 0)
    .filter(t => t > 0);
  
  if (dates.length > 0) {
    const mostRecentMs = Math.max(...dates);
    daysSinceLastActive = Math.max(0, Math.floor((Date.now() - mostRecentMs) / (1000 * 60 * 60 * 24)));
  }

  // Calculate engagement score using standard formula
  const completedTypes = studentAssessments.map(a => a.type);
  const avgScore = 75; // Baseline normalized score
  const { engagementScore, risk } = calculateStudentEngagementAndRisk(
    student,
    studentAssessments,
    completedTypes,
    avgScore,
    null,
    null
  );

  // Extract Learning Modality Scores
  const learningScore = latestLearning?.score?.kolb?.scores || 
    (latestLearning?.score as any)?.learning?.scores || 
    latestLearning?.score?.kolb || 
    (latestLearning?.score as any)?.learning || {};

  const ce = Number(learningScore.CE ?? learningScore.concreteExperience ?? learningScore.ConcreteExperience ?? 0);
  const ro = Number(learningScore.RO ?? learningScore.reflectiveObservation ?? learningScore.ReflectiveObservation ?? 0);
  const ac = Number(learningScore.AC ?? learningScore.abstractConceptualization ?? learningScore.AbstractConceptualization ?? 0);
  const ae = Number(learningScore.AE ?? learningScore.activeExperimentation ?? learningScore.ActiveExperimentation ?? 0);
  const learningStyle = latestLearning?.score?.kolb?.style || (latestLearning?.score as any)?.learning?.style || (latestLearning ? 'Assessed' : undefined);

  // Extract Thinking Style
  let thinkingStyle: string | undefined = undefined;
  if (latestThinking) {
    if (latestThinking.type === 'sternberg') {
      thinkingStyle = latestThinking.score.sternberg?.style;
    } else if (latestThinking.type === 'jhs-thinking') {
      const s = latestThinking.score['jhs-thinking']?.primaryStyle;
      thinkingStyle = s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Assessed';
    } else if (latestThinking.type === 'shs-thinking') {
      thinkingStyle = latestThinking.score['shs-thinking']?.primaryStyle;
    } else if (latestThinking.type === 'adult-thinking') {
      thinkingStyle = latestThinking.score['adult-thinking']?.dominantStyle;
    } else if (latestThinking.type === 'child-thinking') {
      thinkingStyle = latestThinking.score['child-thinking']?.primaryStyle;
    }
  }

  // Extract Decision Style
  const decisionStyle = (latestDecision?.score as any)?.dualProcess?.style || 
    (latestDecision?.score as any)?.decision?.style || 
    (latestDecision?.score as any)?.['dual-process']?.style || 
    (latestDecision ? 'Assessed' : undefined);

  // Measure experiential balance
  const graspingDiff = Math.abs(ce - ac);
  const processingDiff = Math.abs(ae - ro);
  const experientialBalanceScore = latestLearning ? Math.max(0, 100 - Math.round(((graspingDiff + processingDiff) / 96) * 100)) : undefined;

  // Root cause determination
  const rootCauses: DiagnosticRootCause[] = [];
  const interventions: PrescriptiveIntervention[] = [];

  // Case 1: Unassessed
  if (completedCount === 0) {
    rootCauses.push({
      title: 'Unmapped Cognitive Profile',
      category: 'completion',
      severity: 'moderate',
      explanation: 'No foundational learning, thinking, or decision assessments have been completed.',
      impactOnLearning: 'Instructors lack visibility into student grasping preferences and risk blind spots.'
    });

    interventions.push({
      target: 'Teacher',
      action: 'Assign 10-minute experiential learning onboarding assessment during the next classroom or advisory period.',
      priority: 'urgent',
      rationale: 'Establishes baseline cognitive profiling to unlock personalized learning accommodations.'
    });
    interventions.push({
      target: 'Student',
      action: 'Complete your initial Learning Style diagnostic on your dashboard.',
      priority: 'urgent',
      rationale: 'Unlocks tailored study habits and cognitive badges.'
    });

    return {
      studentId: student.id,
      studentName: student.name,
      riskLevel: 'unassessed',
      diagnosticConfidence: 30,
      primaryRiskFactor: 'Unassessed Cognitive Baseline',
      severity: 'Pending',
      pedagogicalSummary: `${student.name} has not yet completed any cognitive diagnostic assessments. Baseline profiling is required to determine instructional needs.`,
      rootCauses,
      interventions,
      metrics: {
        engagementScore: 0,
        completedCount: 0,
        daysSinceLastActive: 999
      },
      learningPathway: 'Phase 1: Foundational Cognitive Onboarding',
      diagnosedAt: new Date().toISOString()
    };
  }

  // Case 2: Incomplete Assessments
  if (completedCount < 3) {
    const missing: string[] = [];
    if (!latestLearning) missing.push('Learning Style (Kolb)');
    if (!latestThinking) missing.push('Thinking Style (Triarchic)');
    if (!latestDecision) missing.push('Decision Style (Dual-Process)');

    rootCauses.push({
      title: 'Incomplete Cognitive Triangulation',
      category: 'completion',
      severity: completedCount === 1 ? 'critical' : 'moderate',
      explanation: `Only ${completedCount} of 3 core cognitive modules completed. Missing: ${missing.join(', ')}.`,
      impactOnLearning: 'Pedagogical interventions may address partial strengths while overlooking decision or analytical bottlenecks.'
    });

    interventions.push({
      target: 'Teacher',
      action: `Prompt ${student.name} to complete the remaining assessment${missing.length > 1 ? 's' : ''} (${missing.join(', ')}).`,
      priority: 'high',
      rationale: 'Enables complete multidimensional cognitive diagnostic.'
    });
  }

  // Case 3: Activity Recency & Disengagement
  if (daysSinceLastActive > 45) {
    rootCauses.push({
      title: 'Learning Velocity Stagnation',
      category: 'recency',
      severity: daysSinceLastActive > 60 ? 'critical' : 'moderate',
      explanation: `No assessment activity or progress recorded in ${daysSinceLastActive} days.`,
      impactOnLearning: 'Risk of academic regression and declining retention of personalized study strategies.'
    });

    interventions.push({
      target: 'Teacher',
      action: 'Conduct a brief 1-on-1 pedagogical check-in to identify potential barriers or motivational drop-off.',
      priority: 'urgent',
      rationale: 'Re-engages dormant students before performance dips affect term examinations.'
    });
    interventions.push({
      target: 'Counselor / School',
      action: 'Review attendance and cross-subject participation records for concurrent disengagement signals.',
      priority: 'high',
      rationale: 'Ensures coordinated academic and wellbeing support.'
    });
  }

  // Case 4: Cognitive Grasping Asymmetry (Kolb CE vs AC)
  if (latestLearning && graspingDiff >= 20) {
    if (ce > ac) {
      rootCauses.push({
        title: 'Concrete-Dominant Grasping Asymmetry',
        category: 'experiential',
        severity: 'moderate',
        explanation: `Concrete Experience (${ce}/48) heavily exceeds Abstract Conceptualization (${ac}/48).`,
        impactOnLearning: 'Student excels with real-world scenarios but experiences cognitive fatigue with purely abstract mathematical or theoretical proofs.'
      });
      interventions.push({
        target: 'Teacher',
        action: 'Anchor all theoretical concepts with concrete physical demonstrations, real-life analogies, and visual models before introducing formal abstractions.',
        priority: 'high',
        rationale: 'Bridges concrete intuition to abstract academic standards.'
      });
    } else {
      rootCauses.push({
        title: 'Abstract-Dominant Grasping Asymmetry',
        category: 'experiential',
        severity: 'moderate',
        explanation: `Abstract Conceptualization (${ac}/48) heavily exceeds Concrete Experience (${ce}/48).`,
        impactOnLearning: 'Student thrives on logical models but may find collaborative human dynamics or hands-on exploratory labs unmotivating.'
      });
      interventions.push({
        target: 'Teacher',
        action: 'Frame hands-on and group projects around theoretical modeling, system architecture, or logical puzzles.',
        priority: 'routine',
        rationale: 'Leverages conceptual strengths to build experiential engagement.'
      });
    }
  }

  // Case 5: Cognitive Processing Asymmetry (Kolb AE vs RO)
  if (latestLearning && processingDiff >= 20) {
    if (ro > ae) {
      rootCauses.push({
        title: 'Reflective Inhibition (Analysis Paralysis)',
        category: 'experiential',
        severity: 'moderate',
        explanation: `Reflective Observation (${ro}/48) heavily exceeds Active Experimentation (${ae}/48).`,
        impactOnLearning: 'Student tends to over-observe and deliberate, showing hesitance to commit answers or participate actively in timed class exercises.'
      });
      interventions.push({
        target: 'Teacher',
        action: 'Implement low-stakes, timed micro-activities with rapid feedback loops to build rapid execution confidence.',
        priority: 'high',
        rationale: 'Decreases fear of error and expands active experimentation.'
      });
      interventions.push({
        target: 'Student',
        action: 'Practice drafting answers immediately on scratch paper rather than seeking internal perfection before writing.',
        priority: 'high',
        rationale: 'Trains active response fluency.'
      });
    } else {
      rootCauses.push({
        title: 'Impulsive Trial-and-Error Bias',
        category: 'experiential',
        severity: 'moderate',
        explanation: `Active Experimentation (${ae}/48) heavily exceeds Reflective Observation (${ro}/48).`,
        impactOnLearning: 'Student rushes into trial-and-error problem solving without analyzing constraints or reviewing past errors.'
      });
      interventions.push({
        target: 'Teacher',
        action: 'Require structured planning pauses (e.g., 2-minute outline phase) before permitting problem execution.',
        priority: 'high',
        rationale: 'Fosters metacognitive evaluation prior to action.'
      });
    }
  }

  // Case 6: Decision Modality Vulnerability (Dual-Process)
  if (decisionStyle) {
    const isIntuitive = decisionStyle.toLowerCase().includes('intuitive') || decisionStyle.toLowerCase().includes('heuristic');
    if (isIntuitive && risk === 'high') {
      rootCauses.push({
        title: 'Heuristic Over-Reliance Under Pressure',
        category: 'decision',
        severity: 'critical',
        explanation: 'Dominant System 1 intuitive decision making can lead to systematic pattern-matching errors on tricky examination prompts.',
        impactOnLearning: 'High likelihood of jumping to initial impressions and misreading negative/compound conditions in questions.'
      });
      interventions.push({
        target: 'Student',
        action: 'Adopt the "Double-Check Verification" routine: actively underline key qualifiers (e.g., NOT, ALWAYS, EXCEPT) before selecting answers.',
        priority: 'urgent',
        rationale: 'Forces deliberate System 2 cognitive activation.'
      });
    }
  }

  // Baseline positive health check if low risk
  if (rootCauses.length === 0 && risk === 'low') {
    rootCauses.push({
      title: 'Balanced Cognitive Profile',
      category: 'completion',
      severity: 'positive',
      explanation: 'All assessment modalities completed with balanced processing and consistent engagement velocity.',
      impactOnLearning: 'Demonstrates resilient learning capability across diverse instructional contexts.'
    });
    interventions.push({
      target: 'Teacher',
      action: 'Provide extension and leadership challenges (e.g. peer tutoring, open-ended research inquiry).',
      priority: 'routine',
      rationale: 'Maintains intellectual momentum and promotes cognitive mastery.'
    });
  }

  // Determine Primary Risk Factor & Severity
  let primaryRiskFactor = 'Balanced Cognitive Trajectory';
  let severity: 'Critical' | 'Moderate' | 'Low' | 'Pending' = 'Low';

  if (risk === 'high') {
    severity = 'Critical';
    if (daysSinceLastActive > 45) {
      primaryRiskFactor = `Engagement Stagnation (${daysSinceLastActive} days dormant)`;
    } else if (completedCount < 2) {
      primaryRiskFactor = 'Critical Assessment Deficit';
    } else if (graspingDiff >= 20 || processingDiff >= 20) {
      primaryRiskFactor = 'Severe Cognitive Modality Asymmetry';
    } else {
      primaryRiskFactor = 'Sub-threshold Academic Engagement';
    }
  } else if (risk === 'medium') {
    severity = 'Moderate';
    if (completedCount < 3) {
      primaryRiskFactor = `Incomplete Triangulation (${completedCount}/3 assessments)`;
    } else {
      primaryRiskFactor = 'Mild Cognitive Asymmetry';
    }
  }

  // Diagnostic Confidence Calculation
  let diagnosticConfidence = 45;
  if (completedCount === 1) diagnosticConfidence = 60;
  if (completedCount === 2) diagnosticConfidence = 78;
  if (completedCount === 3) diagnosticConfidence = 94;
  if (daysSinceLastActive <= 30 && completedCount === 3) diagnosticConfidence = 98;

  // Pedagogical Summary Synthesis
  let pedagogicalSummary = '';
  if (risk === 'high') {
    pedagogicalSummary = `${student.name} is currently flagged for Priority Support due to ${primaryRiskFactor.toLowerCase()}. Immediate instructional scaffolding and a structured check-in are recommended to reverse engagement deceleration and restore academic trajectory.`;
  } else if (risk === 'medium') {
    pedagogicalSummary = `${student.name} demonstrates emerging cognitive capability but requires targeted support for ${primaryRiskFactor.toLowerCase()}. Completing pending assessments and calibrating instructional pace will optimize learning growth.`;
  } else {
    pedagogicalSummary = `${student.name} maintains an On Track learning trajectory with balanced cognitive engagement across assessed domains. Continue fostering autonomous exploration and advanced problem-solving challenges.`;
  }

  const learningPathway = risk === 'high' 
    ? 'Remedial Acceleration & Scaffolding Pathway'
    : risk === 'medium'
      ? 'Targeted Cognitive Calibration Pathway'
      : 'Advanced Inquiring & Synthesis Pathway';

  return {
    studentId: student.id,
    studentName: student.name,
    riskLevel: risk,
    diagnosticConfidence,
    primaryRiskFactor,
    severity,
    pedagogicalSummary,
    rootCauses,
    interventions,
    metrics: {
      engagementScore,
      completedCount,
      daysSinceLastActive,
      learningStyle,
      thinkingStyle,
      decisionStyle,
      experientialBalanceScore
    },
    learningPathway,
    diagnosedAt: new Date().toISOString()
  };
}
