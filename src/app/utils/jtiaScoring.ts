import { jtiaQuestions, JTIADomain, jtiaDomainDescriptions, JTIAQuestion } from './jtiaQuestions';

export interface JTIACapabilityItem {
  title: string;
  domain: JTIADomain;
  score: number; // 0 - 100
  description: string;
}

export interface JTIAAIRecommendations {
  resources: string[];
  activities: string[];
  coaching: string[];
  pathways: string[];
  executiveSummary?: string;
  pedagogicalArchetype?: string;
}

export interface JTIAReportData {
  domainScores: {
    cognitive: number;
    instructional: number;
    leadership: number;
    relationship: number;
    professional: number;
  };
  subCompetencies: Record<string, number>;
  strengths: JTIACapabilityItem[];
  growthOpportunities: JTIACapabilityItem[];
  recommendations: JTIAAIRecommendations;
  overallScore: number;
  completedAt: string;
}

const DOMAIN_KEY_MAP: Record<JTIADomain, keyof JTIAReportData['domainScores']> = {
  "Cognitive Intelligence": "cognitive",
  "Instructional Intelligence": "instructional",
  "Classroom Leadership": "leadership",
  "Relationship Intelligence": "relationship",
  "Professional Intelligence": "professional"
};

const SUBCOMPETENCY_EXPLANATIONS: Record<string, { strength: string; growth: string }> = {
  "Critical Thinking": {
    strength: "Exemplary ability to evaluate educational evidence, challenge assumptions, and analyze classroom data before acting.",
    growth: "Opportunity to further embed structured analytical protocols when diagnosing unexpected classroom trends."
  },
  "Decision Making": {
    strength: "Calm, evidence-backed decision making under pressure, balancing curriculum milestones with student understanding.",
    growth: "Opportunity to refine real-time instructional pivoting when formative feedback reveals divergent comprehension."
  },
  "Reflective Practice": {
    strength: "Consistently seeks student and peer feedback, maintaining high self-awareness to evolve pedagogical methods.",
    growth: "Opportunity to establish regular journaling or systematic audit loops for evaluating term-long teaching outcomes."
  },
  "Problem Solving": {
    strength: "Creative problem solver who turns classroom resource constraints and scheduling roadblocks into engaging learning opportunities.",
    growth: "Opportunity to expand collaborative problem-solving routines with grade-level teams for systemic challenges."
  },
  "Strategic Thinking": {
    strength: "Mastery of backwards design and anticipatory scaffolding, aligning daily instruction with end-of-year real-world competencies.",
    growth: "Opportunity to strengthen long-term curricular roadmap planning to disarm student misconceptions earlier."
  },
  "Adaptability": {
    strength: "Highly agile teaching style that smoothly adjusts vocabulary, tone, and modalities to suit diverse learner cohorts.",
    growth: "Opportunity to practice rapid instructional adaptation when unexpected policy or schedule shifts occur."
  },
  "Differentiated Instruction": {
    strength: "Skilled at designing tiered learning pathways and flexible groupings that challenge all learners without lowering rigor.",
    growth: "Opportunity to introduce more varied multi-modal expression formats for neurodivergent and kinesthetic learners."
  },
  "Formative Assessment": {
    strength: "Uses daily diagnostic checks and error analysis to adjust teaching live, ensuring no student is left behind.",
    growth: "Opportunity to train students more deeply in self-assessment rubrics so they can identify their own learning gaps."
  },
  "Feedback": {
    strength: "Delivers prompt, actionable, and constructive feedback that empowers students to apply corrections immediately.",
    growth: "Opportunity to build structured peer-critique protocols so students learn to exchange helpful feedback."
  },
  "Questioning Techniques": {
    strength: "Expert use of Socratic questioning and intentional wait time to elicit deep reasoning from quiet and vocal students alike.",
    growth: "Opportunity to balance convergent recall checks with open-ended divergent prompts that spark analytical debate."
  },
  "Curriculum Alignment": {
    strength: "Precise alignment between classroom activities, assignments, and national/institutional core standards.",
    growth: "Opportunity to collaborate on vertical grade-level articulation to prevent curriculum redundancy across years."
  },
  "Learning Transfer": {
    strength: "Excels at connecting classroom theory to authentic real-world workplace and community problem-solving.",
    growth: "Opportunity to embed explicit analogies and metacognitive reflection on how skills transfer outside school."
  },
  "Classroom Management": {
    strength: "Seamless classroom routines and autonomous material systems that maximize productive learning minutes.",
    growth: "Opportunity to refine subtle non-verbal proximity cues to manage low-level chatter without pausing instruction."
  },
  "Behaviour Management": {
    strength: "Restorative, de-escalating leadership that separates behavioral deficits from academic potential with dignity.",
    growth: "Opportunity to integrate executive function coaching for students struggling with self-regulation."
  },
  "Learner Motivation": {
    strength: "Inspires intrinsic motivation through student autonomy, micro-success scaffolding, and growth mindset praise.",
    growth: "Opportunity to gradually replace extrinsic reward structures with deeper self-directed inquiry challenges."
  },
  "Positive Classroom Culture": {
    strength: "Creates an emotionally safe, welcoming environment where mistakes are celebrated as stepping stones to mastery.",
    growth: "Opportunity to establish peer-celebration rituals that reinforce empathy and mutual support daily."
  },
  "Inclusive Leadership": {
    strength: "Ensures cultural heritage and diverse lived experiences are celebrated across all lessons and classroom dialogues.",
    growth: "Opportunity to audit classroom discussion patterns to elevate marginalized or quieter student voices."
  },
  "Leadership Under Pressure": {
    strength: "Maintains professional poise and emotional anchoring during school crises, exam seasons, and difficult conferences.",
    growth: "Opportunity to protect personal wellness and classroom morale during high-stress institutional audits."
  },
  "Empathy": {
    strength: "Active, non-defensive listening and deep understanding of student emotional needs and personal circumstances.",
    growth: "Opportunity to schedule proactive check-ins with struggling learners before academic drops occur."
  },
  "Inclusive Communication": {
    strength: "Jargon-free, culturally responsive communication across diverse linguistic and socio-economic family backgrounds.",
    growth: "Opportunity to expand multi-channel family communication portals to accommodate varied parent work schedules."
  },
  "Collaboration": {
    strength: "Generous sharer of resources and collaborative team player who elevates departmental and school-wide teaching quality.",
    growth: "Opportunity to invite more frequent peer observation and co-teaching cycles."
  },
  "Family Engagement": {
    strength: "Partners proactively with parents and guardians, sharing positive milestones and home-friendly learning strategies.",
    growth: "Opportunity to engage families earlier in the semester before academic or behavioral concerns emerge."
  },
  "Conflict Resolution": {
    strength: "Restorative mediator who resolves student and colleague tensions calmly, focusing on mutual dignity.",
    growth: "Opportunity to coach students explicitly in peer mediation and conflict negotiation language."
  },
  "Respect for Diversity": {
    strength: "Weaves diverse global perspectives and cultural respect into daily curriculum and classroom discussions.",
    growth: "Opportunity to inspect textbook resources more critically to challenge subtle stereotypes."
  },
  "Professional Ethics": {
    strength: "Unwavering commitment to student confidentiality, academic integrity, equity, and impartial fairness.",
    growth: "Opportunity to lead departmental workshops on ethical grading and inclusive scholarship."
  },
  "Continuous Learning": {
    strength: "Dedicated lifelong learner who regularly integrates modern educational psychology and neuroscience into lessons.",
    growth: "Opportunity to participate more actively in professional learning communities and peer inquiry groups."
  },
  "Innovation": {
    strength: "Forward-thinking innovator who tests emerging AI tools and pedagogical pilot projects to enhance student engagement.",
    growth: "Opportunity to document pilot outcomes and share innovative prototypes with school leadership."
  },
  "Coaching and Mentoring": {
    strength: "Empathetic mentor who builds confidence and self-reflection in junior teachers and student-teachers.",
    growth: "Opportunity to formalize structured observation rubrics when coaching peer faculty members."
  },
  "Change Management": {
    strength: "Resilient change leader who guides peers through curriculum transitions with supportive milestones.",
    growth: "Opportunity to lead communication efforts during institutional change to ease faculty anxiety."
  },
  "Educational Leadership": {
    strength: "Influential educator who advocates constructively for teacher wellness, equity, and school-wide excellence.",
    growth: "Opportunity to contribute insights to educational networks and regional ministry committees."
  }
};

/**
 * Calculate complete JTIA report from numeric responses array (1 - 5 scale)
 */
export function calculateJTIAScore(responses: number[] = [], sessionQuestions: JTIAQuestion[] = jtiaQuestions): JTIAReportData {
  const domainTotals: Record<JTIADomain, { sum: number; count: number }> = {
    "Cognitive Intelligence": { sum: 0, count: 0 },
    "Instructional Intelligence": { sum: 0, count: 0 },
    "Classroom Leadership": { sum: 0, count: 0 },
    "Relationship Intelligence": { sum: 0, count: 0 },
    "Professional Intelligence": { sum: 0, count: 0 }
  };

  const subCompetencyTotals: Record<string, { sum: number; count: number }> = {};

  sessionQuestions.forEach((q, idx) => {
    const rawVal = responses[idx] || 4; // default to proficient (4) if unrated
    const normalized = Math.min(100, Math.max(20, (rawVal / 5) * 100));

    domainTotals[q.domain].sum += normalized;
    domainTotals[q.domain].count += 1;

    if (!subCompetencyTotals[q.subCompetency]) {
      subCompetencyTotals[q.subCompetency] = { sum: 0, count: 0 };
    }
    subCompetencyTotals[q.subCompetency].sum += normalized;
    subCompetencyTotals[q.subCompetency].count += 1;
  });

  const domainScores = {
    cognitive: Math.round(domainTotals["Cognitive Intelligence"].sum / (domainTotals["Cognitive Intelligence"].count || 1)),
    instructional: Math.round(domainTotals["Instructional Intelligence"].sum / (domainTotals["Instructional Intelligence"].count || 1)),
    leadership: Math.round(domainTotals["Classroom Leadership"].sum / (domainTotals["Classroom Leadership"].count || 1)),
    relationship: Math.round(domainTotals["Relationship Intelligence"].sum / (domainTotals["Relationship Intelligence"].count || 1)),
    professional: Math.round(domainTotals["Professional Intelligence"].sum / (domainTotals["Professional Intelligence"].count || 1))
  };

  const subCompetencies: Record<string, number> = {};
  Object.keys(subCompetencyTotals).forEach(sub => {
    subCompetencies[sub] = Math.round(subCompetencyTotals[sub].sum / subCompetencyTotals[sub].count);
  });

  // Sort subcompetencies by score descending
  const sortedSubs = Object.entries(subCompetencies).sort((a, b) => b[1] - a[1]);

  const strengths: JTIACapabilityItem[] = sortedSubs.slice(0, 5).map(([sub, score]) => {
    const domain = sessionQuestions.find(q => q.subCompetency === sub)?.domain || "Cognitive Intelligence";
    const expl = SUBCOMPETENCY_EXPLANATIONS[sub]?.strength || `Consistently demonstrates high professional capability in ${sub}.`;
    return {
      title: sub,
      domain,
      score,
      description: expl
    };
  });

  const growthOpportunities: JTIACapabilityItem[] = sortedSubs.slice(-4).reverse().map(([sub, score]) => {
    const domain = sessionQuestions.find(q => q.subCompetency === sub)?.domain || "Cognitive Intelligence";
    const expl = SUBCOMPETENCY_EXPLANATIONS[sub]?.growth || `Targeted professional development in ${sub} can elevate classroom impact and student learning outcomes.`;
    return {
      title: sub,
      domain,
      score,
      description: expl
    };
  });

  const overallScore = Math.round(
    (domainScores.cognitive +
      domainScores.instructional +
      domainScores.leadership +
      domainScores.relationship +
      domainScores.professional) / 5
  );

  const recommendations = generatePersonalizedRecommendations(
    domainScores,
    strengths,
    growthOpportunities
  );

  return {
    domainScores,
    subCompetencies,
    strengths,
    growthOpportunities,
    recommendations,
    overallScore,
    completedAt: new Date().toISOString()
  };
}

/**
 * Generate culturally relevant, personalized recommendations grounded in NaCCA / GES standards
 * and African classroom context when AI is offline or as standard baseline.
 */
export function generatePersonalizedRecommendations(
  domainScores: Record<string, number>,
  strengths: Array<{ title: string; domain: string; description?: string }>,
  growthOpportunities: Array<{ title: string; domain: string; description?: string }>,
  teacherName?: string
): JTIAAIRecommendations {
  // Find highest and lowest scoring domains
  const sortedDomains = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
  const topDomainEntry = sortedDomains[0] || ['instructional', 80];
  const lowestDomainEntry = sortedDomains[sortedDomains.length - 1] || ['cognitive', 65];

  const topDomainName = topDomainEntry[0].charAt(0).toUpperCase() + topDomainEntry[0].slice(1);
  const lowestDomainName = lowestDomainEntry[0].charAt(0).toUpperCase() + lowestDomainEntry[0].slice(1);

  const primaryStrength = strengths[0]?.title || `${topDomainName} Intelligence`;
  const primaryGrowth = growthOpportunities[0]?.title || `${lowestDomainName} Intelligence`;

  return {
    resources: [
      `NaCCA / GES Standards-Based Curriculum Toolkit: Differentiated instructional protocols leveraging your high ${topDomainName} mastery (${primaryStrength}).`,
      `West African Classroom Low-Cost TLM Manual: Practical guides for creating concrete manipulative teaching aids from local materials to boost ${lowestDomainName} engagement.`,
      `Ghana Education Service (GES) PLC Handbook: Collaborative lesson study templates and peer micro-teaching strategies.`,
      `JotMinds Cognitive Diversity In Action: Field guide for mapping student learning styles to lesson pacing in large classrooms.`
    ],
    activities: [
      `Formative Exit Slips: End each lesson with a 3-minute check on learning aligned to NaCCA core competencies before student dismissal.`,
      `Think-Pair-Share with Structured Wait-Time: Build confidence by allowing students 5 seconds of silence before sharing in pairs to reinforce ${primaryGrowth}.`,
      `Differentiated Task Cards: Organize tiered practice sets (Core, Scaffolded, Extension) using real-world Ghanaian community examples.`,
      `Socratic Circle Modeling: Utilize gradual release ('I Do, We Do, You Do') to guide abstract reasoning and collaborative problem solving.`
    ],
    coaching: [
      `Departmental Peer Observation: Pair with a senior subject teacher for a 20-minute exchange focusing on ${primaryGrowth} and student question-flow.`,
      `School PLC Lesson Study: Present an upcoming unit plan during your weekly school Professional Learning Community (PLC) session for feedback.`,
      `Student Feedback Pulse: Run a short, anonymous 3-question survey once per term asking learners which classroom activities help them understand best.`,
      `Curriculum Leader Debrief: Meet with your head of department or academic supervisor to align termly scheme of work milestones with learner progress.`
    ],
    pathways: [
      `School-Based INSET Lead: Facilitate peer professional development workshops on effective TLM utilization and differentiated instruction.`,
      `Curriculum Differentiation Mentor: Guide early-career teachers in tailoring lesson plans to diverse cognitive styles and special educational needs.`,
      `Subject Area PLC Coordinator: Lead departmental coordination in continuous assessment methods aligned to national testing frameworks.`,
      `Institutional Assessment Lead: Champion cognitive and formative evaluation strategies across your school cluster.`
    ],
    executiveSummary: `Demonstrates exemplary capability in ${topDomainName} Intelligence (${primaryStrength}). A targeted focus on ${lowestDomainName} Intelligence through structured peer activities and localized TLMs will yield exceptional growth in classroom impact.`,
    pedagogicalArchetype: `${topDomainName}-Driven Facilitator`
  };
}

/**
 * Generate aggregated School Intelligence Dashboard insights from an array of teacher JTIA reports
 */
export interface JTIASchoolAggregatedInsights {
  totalTeachersAssessed: number;
  overallSchoolIntelligence: number;
  domainAverages: {
    cognitive: number;
    instructional: number;
    leadership: number;
    relationship: number;
    professional: number;
  };
  competencyHeatmap: Array<{
    subCompetency: string;
    domain: JTIADomain;
    averageScore: number;
    readinessLevel: 'Exemplary' | 'Proficient' | 'Developing' | 'Emerging';
  }>;
  pdPriorities: Array<{
    title: string;
    domain: JTIADomain;
    averageScore: number;
    recommendedProgram: string;
    impactArea: string;
  }>;
  growthPatterns: {
    highSynergyDomains: string[];
    collaborativeOpportunities: string[];
    workforceReadiness: number;
  };
}

export function generateSchoolJTIAInsights(reports: JTIAReportData[] = []): JTIASchoolAggregatedInsights {
  if (!reports || reports.length === 0) {
    return {
      totalTeachersAssessed: 0,
      overallSchoolIntelligence: 0,
      domainAverages: { cognitive: 0, instructional: 0, leadership: 0, relationship: 0, professional: 0 },
      competencyHeatmap: [],
      pdPriorities: [],
      growthPatterns: {
        highSynergyDomains: [],
        collaborativeOpportunities: [],
        workforceReadiness: 0
      }
    };
  }

  const count = reports.length;
  const domainAverages = {
    cognitive: Math.round(reports.reduce((s, r) => s + r.domainScores.cognitive, 0) / count),
    instructional: Math.round(reports.reduce((s, r) => s + r.domainScores.instructional, 0) / count),
    leadership: Math.round(reports.reduce((s, r) => s + r.domainScores.leadership, 0) / count),
    relationship: Math.round(reports.reduce((s, r) => s + r.domainScores.relationship, 0) / count),
    professional: Math.round(reports.reduce((s, r) => s + r.domainScores.professional, 0) / count)
  };

  const overallSchoolIntelligence = Math.round(
    (domainAverages.cognitive +
      domainAverages.instructional +
      domainAverages.leadership +
      domainAverages.relationship +
      domainAverages.professional) / 5
  );

  // Aggregate subcompetency averages
  const subSums: Record<string, { sum: number; count: number; domain: JTIADomain }> = {};
  reports.forEach(r => {
    Object.entries(r.subCompetencies).forEach(([sub, val]) => {
      if (!subSums[sub]) {
        const domain = jtiaQuestions.find(q => q.subCompetency === sub)?.domain || "Cognitive Intelligence";
        subSums[sub] = { sum: 0, count: 0, domain };
      }
      subSums[sub].sum += val;
      subSums[sub].count += 1;
    });
  });

  const competencyHeatmap = Object.entries(subSums).map(([subCompetency, data]) => {
    const avg = Math.round(data.sum / (data.count || 1));
    let readinessLevel: 'Exemplary' | 'Proficient' | 'Developing' | 'Emerging' = 'Proficient';
    if (avg >= 88) readinessLevel = 'Exemplary';
    else if (avg >= 75) readinessLevel = 'Proficient';
    else if (avg >= 62) readinessLevel = 'Developing';
    else readinessLevel = 'Emerging';

    return {
      subCompetency,
      domain: data.domain,
      averageScore: avg,
      readinessLevel
    };
  }).sort((a, b) => b.averageScore - a.averageScore);

  // Lowest 3 competencies form PD priorities
  const lowest3 = [...competencyHeatmap].sort((a, b) => a.averageScore - b.averageScore).slice(0, 3);
  const pdPriorities = lowest3.map((item, idx) => {
    const programs: Record<string, { program: string; impact: string }> = {
      "Formative Assessment": {
        program: "Real-Time Diagnostic Checks & Data-Driven Pivoting Workshop",
        impact: "Accelerates student mastery by identifying and remediating learning gaps immediately."
      },
      "Differentiated Instruction": {
        program: "Universal Design for Learning (UDL) & Tiered Pathways Seminar",
        impact: "Enhances engagement and comprehension for diverse and neurodivergent learners."
      },
      "Questioning Techniques": {
        program: "Socratic Dialogues & Higher-Order Inquiry Lab",
        impact: "Elevates classroom discourse and critical analytical depth."
      },
      "Reflective Practice": {
        program: "Systematic Pedagogical Audits & Peer Coaching Circle",
        impact: "Fosters self-sustaining professional growth and continuous instructional refinement."
      },
      "Empathy": {
        program: "Trauma-Informed Classroom Leadership & Active Listening Protocol",
        impact: "Strengthens student-teacher trust and prevents behavioral disengagement."
      }
    };
    const defaultProgram = {
      program: `Targeted Mastery Workshop in ${item.subCompetency}`,
      impact: `Empowers faculty with evidence-based strategies to strengthen ${item.domain.toLowerCase()} across classrooms.`
    };
    const pd = programs[item.subCompetency] || defaultProgram;

    return {
      title: item.subCompetency,
      domain: item.domain,
      averageScore: item.averageScore,
      recommendedProgram: pd.program,
      impactArea: pd.impact
    };
  });

  return {
    totalTeachersAssessed: count,
    overallSchoolIntelligence,
    domainAverages,
    competencyHeatmap,
    pdPriorities,
    growthPatterns: {
      highSynergyDomains: ["Relationship Intelligence", "Classroom Leadership"],
      collaborativeOpportunities: [
        "Peer Observation Exchange: Pairing exemplary instructional leaders with developing faculty.",
        "Cross-Departmental PLC: Synthesizing critical thinking frameworks across STEM and Humanities."
      ],
      workforceReadiness: overallSchoolIntelligence
    }
  };
}
