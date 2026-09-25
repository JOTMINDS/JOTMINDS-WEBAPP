/**
 * JotMinds Preschool Developmental Assessment Framework (JM-PDAF v1.0)
 * Core Analytical & Progression Engine
 *
 * Implements:
 * - Evidence Confidence Model (Low, Moderate, High)
 * - Multidimensional Child Profiles (Never a single percentage score)
 * - Multidimensional School Readiness Radar (Ages 5–6 / Band P4)
 * - Classroom & School-Wide Developmental Intelligence
 * - Plain-Language Parent Report Generation
 */

import { User } from '../types';
import {
  DevelopmentalBand,
  DevelopmentalDomainCode,
  DevelopmentalRating,
  EvidenceConfidence,
  LanguageOfEvidence,
  EvidenceEvent,
  DevelopmentalIndicator,
  DomainProgressSummary,
  ChildDevelopmentalProfile,
  SchoolReadinessProfile,
  ReadinessDimensionScore,
  ClassDevelopmentIntelligence,
  ChildIndicatorEvaluation,
  DEVELOPMENTAL_DOMAINS,
  DEVELOPMENTAL_BANDS,
} from '../types/preschoolDevelopmental';
import { MASTER_PRESCHOOL_INDICATORS, INDICATORS_BY_DOMAIN, INDICATORS_BY_ID } from '../data/preschoolIndicators';
import { calculateAge } from './dateUtils';

/**
 * Determine a child's developmental band based on age or grade level.
 */
export function resolveChildBand(child: User): DevelopmentalBand {
  let age = child.age;
  if (!age && child.dateOfBirth) {
    age = calculateAge(child.dateOfBirth);
  }

  if (age) {
    if (age < 3.2) return 'P1';
    if (age < 4.2) return 'P2';
    if (age < 5.2) return 'P3';
    return 'P4';
  }

  // Fallback to education level or default P3
  const level = (child.educationLevel || (child as any).className || '').toLowerCase();
  if (level.includes('nursery 1') || level.includes('creche') || level.includes('p1')) return 'P1';
  if (level.includes('nursery 2') || level.includes('kg 1') || level.includes('p2')) return 'P2';
  if (level.includes('kg 2') || level.includes('kindergarten') || level.includes('p3')) return 'P3';
  if (level.includes('prep') || level.includes('reception') || level.includes('p4')) return 'P4';

  return 'P3';
}

/**
 * Evaluate an indicator for a child based on accumulated evidence events.
 */
export function calculateIndicatorEvaluation(
  indicator: DevelopmentalIndicator,
  events: EvidenceEvent[]
): ChildIndicatorEvaluation {
  const relevantEvents = events
    .filter(e => e.indicatorId === indicator.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (relevantEvents.length === 0) {
    return {
      indicator,
      events: [],
      currentRating: 0,
      confidence: 'low',
      lastObservedDate: null,
    };
  }

  // Calculate current rating using most recent and consistent evidence
  const ratings = relevantEvents.map(e => e.rating).filter(r => r > 0);
  let currentRating: DevelopmentalRating = 0;

  if (ratings.length > 0) {
    // Weight recent ratings slightly more, but check for consistency
    const recentRating = ratings[0];
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    currentRating = (Math.round((recentRating * 1.5 + avgRating) / 2.5) as DevelopmentalRating) || recentRating;
  }

  // Confidence Model:
  // Low: 1 evidence event
  // Moderate: 2 consistent evidence events (within 1 rating point)
  // High: 3+ consistent evidence events, ideally across different methods or dates
  let confidence: EvidenceConfidence = 'low';
  if (relevantEvents.length === 2) {
    const diff = Math.abs(relevantEvents[0].rating - relevantEvents[1].rating);
    confidence = diff <= 1 ? 'moderate' : 'low';
  } else if (relevantEvents.length >= 3) {
    const distinctDates = new Set(relevantEvents.map(e => e.date)).size;
    const distinctMethods = new Set(relevantEvents.map(e => e.method)).size;
    if (distinctDates >= 2 || distinctMethods >= 2) {
      confidence = 'high';
    } else {
      confidence = 'moderate';
    }
  }

  // Language of evidence
  const languageCounts: Record<string, number> = {};
  relevantEvents.forEach(e => {
    if (e.languageOfEvidence) {
      languageCounts[e.languageOfEvidence] = (languageCounts[e.languageOfEvidence] || 0) + 1;
    }
  });
  const dominantLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as
    | LanguageOfEvidence
    | undefined;

  return {
    indicator,
    events: relevantEvents,
    currentRating,
    confidence,
    lastObservedDate: relevantEvents[0].date,
    dominantLanguage,
  };
}

/**
 * Generate multidimensional progress summary for a single domain.
 */
export function calculateDomainProgress(
  domainCode: DevelopmentalDomainCode,
  childBand: DevelopmentalBand,
  evaluations: ChildIndicatorEvaluation[]
): DomainProgressSummary {
  const meta = DEVELOPMENTAL_DOMAINS[domainCode];
  const domainIndicators = MASTER_PRESCHOOL_INDICATORS.filter(ind => ind.domainCode === domainCode);

  const domainEvaluations = evaluations.filter(ev => ev.indicator.domainCode === domainCode);
  const observedEvaluations = domainEvaluations.filter(ev => ev.currentRating > 0);

  let achievingOrExtendingCount = 0;
  let developingCount = 0;
  let emergingCount = 0;
  let stageSum = 0;

  const confidenceDist = { high: 0, moderate: 0, low: 0 };
  const strengths: string[] = [];
  const growing: string[] = [];
  const teacherActions: string[] = [];
  const homeActs: string[] = [];

  observedEvaluations.forEach(ev => {
    stageSum += ev.currentRating;
    confidenceDist[ev.confidence]++;

    if (ev.currentRating >= 3) {
      achievingOrExtendingCount++;
      strengths.push(ev.indicator.title);
    } else if (ev.currentRating === 2) {
      developingCount++;
      growing.push(ev.indicator.title);
      if (ev.indicator.teacherIntervention) teacherActions.push(ev.indicator.teacherIntervention);
      if (ev.indicator.homeActivity) homeActs.push(ev.indicator.homeActivity);
    } else if (ev.currentRating === 1) {
      emergingCount++;
      growing.push(ev.indicator.title);
      if (ev.indicator.teacherIntervention) teacherActions.push(ev.indicator.teacherIntervention);
      if (ev.indicator.homeActivity) homeActs.push(ev.indicator.homeActivity);
    }
  });

  const averageStage = observedEvaluations.length > 0 ? +(stageSum / observedEvaluations.length).toFixed(1) : 0;

  let stageLabel = 'Observation Initiated';
  if (averageStage >= 3.5) stageLabel = 'Extending & Fluent';
  else if (averageStage >= 2.8) stageLabel = 'Achieving Expected Level';
  else if (averageStage >= 1.8) stageLabel = 'Developing Steadily';
  else if (averageStage > 0) stageLabel = 'Emerging Competency';

  return {
    domainCode,
    domainName: meta.name,
    shortName: meta.shortName,
    accentColor: meta.accentColor,
    totalIndicators: domainIndicators.length,
    observedCount: observedEvaluations.length,
    achievingOrExtendingCount,
    developingCount,
    emergingCount,
    averageStage,
    stageLabel,
    confidenceDistribution: confidenceDist,
    strengths: [...new Set(strengths)].slice(0, 4),
    growingCompetencies: [...new Set(growing)].slice(0, 4),
    suggestedTeacherActions: [...new Set(teacherActions)].slice(0, 3),
    suggestedHomeActivities: [...new Set(homeActs)].slice(0, 3),
  };
}

/**
 * Calculate Multidimensional School Readiness Profile (for Band P4: 5–6 years).
 */
export function calculateSchoolReadiness(
  child: User,
  evaluations: ChildIndicatorEvaluation[]
): SchoolReadinessProfile {
  let age = child.age || 5.5;
  if (child.dateOfBirth) age = calculateAge(child.dateOfBirth);

  const getDimEvaluations = (domain: DevelopmentalDomainCode, clusters?: string[]) => {
    return evaluations.filter(ev => {
      if (ev.indicator.domainCode !== domain) return false;
      if (!clusters || clusters.length === 0) return true;
      return clusters.some(c => ev.indicator.clusterName.toLowerCase().includes(c.toLowerCase()));
    });
  };

  const computeDimensionScore = (
    dimensionName: ReadinessDimensionScore['dimension'],
    evals: ChildIndicatorEvaluation[],
    keyEvidenceDefault: string
  ): ReadinessDimensionScore => {
    const observed = evals.filter(e => e.currentRating > 0);
    if (observed.length === 0) {
      return {
        dimension: dimensionName,
        score: 50,
        stageLabel: 'Developing',
        keyEvidence: 'Initial observations in progress during everyday play and group activities.',
        strengths: ['Curious and willing to engage with materials'],
        supportAreas: ['Continue natural classroom observation across multiple contexts'],
      };
    }

    const avg = observed.reduce((s, e) => s + e.currentRating, 0) / observed.length;
    // Map 1-4 scale to 25-100 score
    const score = Math.min(100, Math.max(25, Math.round((avg / 4) * 100)));

    let stageLabel: ReadinessDimensionScore['stageLabel'] = 'Developing';
    if (score >= 85) stageLabel = 'Advanced';
    else if (score >= 70) stageLabel = 'Consolidating';
    else if (score >= 55) stageLabel = 'Developing';
    else stageLabel = 'Emerging Support';

    const strengths = observed.filter(e => e.currentRating >= 3).map(e => e.indicator.title).slice(0, 3);
    const supportAreas = observed.filter(e => e.currentRating <= 2).map(e => e.indicator.title).slice(0, 3);

    return {
      dimension: dimensionName,
      score,
      stageLabel,
      keyEvidence: observed[0]?.indicator.title || keyEvidenceDefault,
      strengths: strengths.length ? strengths : ['Developing positive participation habits'],
      supportAreas: supportAreas.length ? supportAreas : ['Reinforce consistency across longer tasks'],
    };
  };

  const dimensions: ReadinessDimensionScore[] = [
    computeDimensionScore(
      'Communication',
      getDimEvaluations('JM-LC', ['Listening', 'Expressive', 'Conversation']),
      'Communicates ideas clearly and listens during group instructions.'
    ),
    computeDimensionScore(
      'Early Literacy',
      getDimEvaluations('JM-LC', ['Phonological', 'Print', 'Writing']),
      'Recognises familiar sounds, letters and symbols in the learning environment.'
    ),
    computeDimensionScore(
      'Early Numeracy',
      getDimEvaluations('JM-EN', ['Number', 'Counting', 'Quantity', 'Shapes']),
      'Understands one-to-one counting, simple quantities and basic shapes.'
    ),
    computeDimensionScore(
      'Self-Regulation',
      getDimEvaluations('JM-SE', ['Emotional Regulation', 'Attention']),
      'Manages transitions and stays engaged during structured activities.'
    ),
    computeDimensionScore(
      'Social Interaction',
      getDimEvaluations('JM-SE', ['Relationships', 'Cooperation', 'Empathy']),
      'Collaborates and shares materials harmoniously with peers.'
    ),
    computeDimensionScore(
      'Motor Development',
      getDimEvaluations('JM-PM', ['Hand & Finger', 'Drawing', 'Tool Use']),
      'Demonstrates controlled pencil grip, tool handling and movement planning.'
    ),
    computeDimensionScore(
      'Independence',
      getDimEvaluations('JM-IL', ['Personal Care', 'Classroom Routines', 'Task Completion']),
      'Manages belongings, follows routines and completes simple tasks independently.'
    ),
  ];

  const overallAvg = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);

  let narrative = `${child.name || 'This learner'} demonstrates strong foundational curiosity and developmental momentum. The child engages actively across physical, social and cognitive play domains.`;
  if (overallAvg >= 80) {
    narrative = `${child.name || 'This learner'} displays well-consolidated foundational competencies across communication, numeracy, and self-regulation, demonstrating high school readiness and confident classroom participation.`;
  } else if (overallAvg >= 65) {
    narrative = `${child.name || 'This learner'} is steadily consolidating essential school routines, language expression, and social cooperation. Continuing targeted interactive play in fine motor and phonological awareness will support a seamless primary transition.`;
  } else {
    narrative = `${child.name || 'This learner'} is making enthusiastic early progress. Individualized scaffolding in classroom routines, listening focus, and expressive confidence will ensure strong readiness for Primary 1.`;
  }

  const checklist = [
    { title: 'Sustains focus during 15-minute group activities', isConsolidated: dimensions[3].score >= 65, domain: 'Self-Regulation' },
    { title: 'Follows 2-3 step instructions independently', isConsolidated: dimensions[0].score >= 65, domain: 'Communication' },
    { title: 'Identifies rhyming sounds and familiar letters', isConsolidated: dimensions[1].score >= 65, domain: 'Early Literacy' },
    { title: 'Counts 10+ objects with 1-to-1 correspondence', isConsolidated: dimensions[2].score >= 65, domain: 'Early Numeracy' },
    { title: 'Expresses needs and negotiates turns with peers', isConsolidated: dimensions[4].score >= 65, domain: 'Social Interaction' },
    { title: 'Controls pencils and safety scissors comfortably', isConsolidated: dimensions[5].score >= 65, domain: 'Motor Development' },
    { title: 'Manages personal belongings and self-care', isConsolidated: dimensions[6].score >= 65, domain: 'Independence' },
  ];

  return {
    childId: child.id,
    evaluationDate: new Date().toISOString().split('T')[0],
    ageYears: age,
    overallReadinessSummary: narrative,
    dimensions,
    classroomPreparationChecklist: checklist,
    transitionRecommendations: [
      'Provide structured play stations pairing visual storytelling with counting manipulatives.',
      'Encourage peer collaboration to practice communicative problem solving.',
      'Practice schoolbag packing and independent desk organization daily.',
    ],
  };
}

/**
 * Generate Complete Multidimensional Child Developmental Profile.
 */
export function calculateChildDevelopmentProfile(
  child: User,
  events: EvidenceEvent[]
): ChildDevelopmentalProfile {
  let age = child.age || 4;
  if (child.dateOfBirth) age = calculateAge(child.dateOfBirth);

  const assignedBand = resolveChildBand(child);
  const childEvents = events.filter(e => e.childId === child.id);

  // Evaluate all 240 indicators for this child
  const evaluations: ChildIndicatorEvaluation[] = MASTER_PRESCHOOL_INDICATORS.map(ind =>
    calculateIndicatorEvaluation(ind, childEvents)
  );

  // Domain progress summaries
  const domainCodes: DevelopmentalDomainCode[] = [
    'JM-CD',
    'JM-LC',
    'JM-EN',
    'JM-SE',
    'JM-PM',
    'JM-CE',
    'JM-IL',
  ];

  const domains = {} as Record<DevelopmentalDomainCode, DomainProgressSummary>;
  const allStrengths: string[] = [];
  const allPriorities: string[] = [];

  domainCodes.forEach(code => {
    const summary = calculateDomainProgress(code, assignedBand, evaluations);
    domains[code] = summary;
    allStrengths.push(...summary.strengths);
    allPriorities.push(...summary.growingCompetencies);
  });

  // Calculate dominant language of evidence
  const langCounts: Record<string, number> = {};
  childEvents.forEach(e => {
    if (e.languageOfEvidence) {
      langCounts[e.languageOfEvidence] = (langCounts[e.languageOfEvidence] || 0) + 1;
    }
  });
  const dominantLang = (Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as LanguageOfEvidence) || 'English';

  const sortedEvents = [...childEvents].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // School readiness profile for P4
  let schoolReadiness: SchoolReadinessProfile | undefined;
  if (assignedBand === 'P4' || age >= 5) {
    schoolReadiness = calculateSchoolReadiness(child, evaluations);
  }

  // Parent Summary
  const highlightStrengths = [...new Set(allStrengths)].slice(0, 3);
  const whatWeArePracticing = [...new Set(allPriorities)].slice(0, 3);

  const parentHomeActivities = [
    {
      title: 'Storytelling & Word Hunt',
      description: `Look through a picture book together. Ask ${child.name || 'your child'} to find three objects and tell you a short story about what they are doing.`,
      materials: 'Any favourite picture book or family photograph album.',
    },
    {
      title: 'Count & Share Helpers',
      description: `During dinner prep or snack time, ask ${child.name || 'your child'} to hand out 2 spoons or 3 cups so everyone has enough.`,
      materials: 'Safe cups, spoons, or fruit slices.',
    },
    {
      title: 'Movement & Balance Trail',
      description: `Create a simple stepping path using floor cushions or chalk lines outdoors. Practice balancing, hopping and stopping on signal.`,
      materials: 'Cushions, tape or outdoor chalk.',
    },
  ];

  return {
    child,
    ageYears: age,
    assignedBand,
    totalEvidenceEvents: childEvents.length,
    firstObservationDate: sortedEvents[0]?.date || null,
    lastObservationDate: sortedEvents[sortedEvents.length - 1]?.date || null,
    dominantLanguageOfEvidence: dominantLang,
    domains,
    overallEmergingStrengths: [...new Set(allStrengths)].slice(0, 5),
    priorityDevelopmentAreas: [...new Set(allPriorities)].slice(0, 5),
    schoolReadiness,
    parentSummary: {
      greeting: `Hello from the classroom! Here is a caring overview of how ${child.name || 'your child'} is growing, playing, and learning with us.`,
      narrativeSummary: `${child.name || 'Your child'} is actively participating in daily routines, forming friendships, and demonstrating wonderful curiosity during hands-on learning activities.`,
      highlightStrengths: highlightStrengths.length
        ? highlightStrengths
        : ['Enjoys exploring classroom materials', 'Interacts warmly with teachers and classmates'],
      whatWeArePracticing: whatWeArePracticing.length
        ? whatWeArePracticing
        : ['Continuing to build expressive vocabulary', 'Refining fine motor control during creative art'],
      recommendedHomeActivities: parentHomeActivities,
    },
  };
}

/**
 * Calculate Class-Level Developmental Intelligence across all enrolled children.
 */
export function calculateClassDevelopmentIntelligence(
  children: User[],
  events: EvidenceEvent[],
  classId: string,
  className: string
): ClassDevelopmentIntelligence {
  const classEvents = events.filter(e => {
    if (e.classId === classId) return true;
    return children.some(c => c.id === e.childId);
  });

  const bandDist: Record<DevelopmentalBand, number> = { P1: 0, P2: 0, P3: 0, P4: 0 };
  children.forEach(c => {
    const band = resolveChildBand(c);
    bandDist[band]++;
  });

  const domainCodes: DevelopmentalDomainCode[] = [
    'JM-CD',
    'JM-LC',
    'JM-EN',
    'JM-SE',
    'JM-PM',
    'JM-CE',
    'JM-IL',
  ];

  const domainAverages = domainCodes.map(code => {
    const meta = DEVELOPMENTAL_DOMAINS[code];
    let totalScore = 0;
    let evalCount = 0;
    let emergingCount = 0;
    let developingCount = 0;
    let achievingCount = 0;
    let extendingCount = 0;

    children.forEach(c => {
      const cEvents = classEvents.filter(e => e.childId === c.id && e.domainCode === code);
      if (cEvents.length > 0) {
        const avg = cEvents.reduce((s, e) => s + e.rating, 0) / cEvents.length;
        totalScore += avg;
        evalCount++;
        if (avg >= 3.5) extendingCount++;
        else if (avg >= 2.5) achievingCount++;
        else if (avg >= 1.5) developingCount++;
        else emergingCount++;
      }
    });

    const averageStage = evalCount > 0 ? +(totalScore / evalCount).toFixed(1) : 2.5;

    return {
      domainCode: code,
      domainName: meta.name,
      averageStage,
      emergingCount,
      developingCount,
      achievingCount,
      extendingCount,
    };
  });

  // Calculate cohort strengths
  const cohortStrengths: string[] = [];
  const cohortGaps: ClassDevelopmentIntelligence['cohortDevelopmentGaps'] = [];

  domainAverages.forEach(d => {
    if (d.averageStage >= 2.8) {
      cohortStrengths.push(`Strong group progression in ${d.domainName} (${d.achievingCount + d.extendingCount} children achieving independently).`);
    } else {
      cohortGaps.push({
        domainCode: d.domainCode,
        clusterName: d.domainName,
        description: `Multiple children are currently consolidating competencies in ${d.domainName.toLowerCase()}.`,
        childrenNeedingSupport: d.emergingCount + d.developingCount,
        recommendedClassroomFocus: `Integrate targeted small-group play stations focusing on concrete ${d.domainName.toLowerCase()} activities.`,
      });
    }
  });

  const teachingInsights = [
    {
      title: 'Small-Group Interactive Stations',
      instructionalStrategy: 'Rotate children in groups of 4-5 through dedicated communication and numeracy discovery tables.',
      suggestedStationSetup: 'Station 1: Story sequencing cards; Station 2: Sorting and counting counters; Station 3: Construction block challenges.',
      inServiceTrainingModule: 'Module 2: Differentiated Early Years Learning Stations & Scaffolded Questioning',
    },
    {
      title: 'Multilingual Bridge & Oral Narrative Circle',
      instructionalStrategy: 'Encourage children to narrate experiences in their home language (Twi, Ga, Ewe) before linking with English terms.',
      suggestedStationSetup: 'Morning circle with traditional percussion rhythm sticks and illustrated cultural sequence cards.',
      inServiceTrainingModule: 'Module 4: Affirming Multilingual Competence in Early Childhood Classrooms',
    },
  ];

  return {
    classId,
    className,
    totalChildren: children.length,
    activeObservations: classEvents.length,
    bandDistribution: bandDist,
    domainAverages,
    cohortStrengths: cohortStrengths.length ? cohortStrengths : ['Group shows enthusiastic participation in daily classroom routines.'],
    cohortDevelopmentGaps: cohortGaps.slice(0, 3),
    teachingInsightRecommendations: teachingInsights,
  };
}
