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
    strength: "Forward-thinking innovator who tests emerging digital tools and pedagogical pilot projects to enhance student engagement.",
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
 * Wording that development recommendations use for the curriculum a teacher teaches.
 */
export interface CurriculumContext {
  name: string;
  toolkit: string;          // curriculum toolkit / planning resource
  community: string;        // learning community / PLC wording
  assessmentTerm: string;   // how the curriculum talks about checking learning
  localContext: string;     // examples the teacher should draw on
  aiContext: string;        // instruction line for the AI prompt
}

export function getCurriculumContext(framework?: string): CurriculumContext {
  const f = (framework || '').toLowerCase();
  if (/\bnational\b/.test(f) || f.includes('nacca') || /\bges\b/.test(f)) {
    return {
      name: 'Ghana National Curriculum (NaCCA / GES)',
      toolkit: 'NaCCA / GES Standards-Based Curriculum Toolkit',
      community: 'Ghana Education Service (GES) school PLC',
      assessmentTerm: 'NaCCA core competencies and learning indicators',
      localContext: 'local Ghanaian examples and low-cost teaching and learning materials (TLMs)',
      aiContext: 'Ground recommendations in the NaCCA / GES curriculum, GES school PLC and INSET practice, and low-cost local TLMs.',
    };
  }
  if (f.includes('british') || f.includes('cambridge') || f.includes('edexcel') || f.includes('pearson')) {
    return {
      name: 'British Curriculum (Cambridge / Pearson Edexcel)',
      toolkit: 'Cambridge / Edexcel syllabus and teacher support resources',
      community: 'subject department professional learning group',
      assessmentTerm: 'syllabus learning objectives, success criteria and exam command words',
      localContext: 'examples and past-paper style questions relevant to your learners',
      aiContext: 'Ground recommendations in the Cambridge / Pearson Edexcel syllabus, assessment objectives, command words, and exam-board teacher training.',
    };
  }
  if (f.includes('baccalaureate') || /\bib\b/.test(f)) {
    return {
      name: 'International Baccalaureate (IB)',
      toolkit: 'IB programme resources and unit planner',
      community: 'IB collaborative planning team',
      assessmentTerm: 'IB assessment criteria, ATL skills and learner profile attributes',
      localContext: 'global contexts and inquiry questions connected to your learners',
      aiContext: 'Ground recommendations in IB inquiry-based practice, units of inquiry, ATL skills, the learner profile and IB professional development workshops.',
    };
  }
  if (f.includes('oxford')) {
    return {
      name: 'Oxford International Curriculum',
      toolkit: 'Oxford International teacher resources',
      community: 'school professional learning team',
      assessmentTerm: 'learning intentions and success criteria',
      localContext: 'cross-curricular links and examples relevant to your learners',
      aiContext: 'Ground recommendations in the Oxford International Curriculum: learning intentions, success criteria and cross-curricular links.',
    };
  }
  return {
    name: 'your curriculum',
    toolkit: 'Curriculum planning toolkit for your syllabus',
    community: 'school professional learning community (PLC)',
    assessmentTerm: 'your curriculum learning outcomes',
    localContext: "examples and low-cost materials from your learners' own community",
    aiContext: 'Keep recommendations general enough to fit any curriculum; do not assume a particular national curriculum.',
  };
}

/**
 * Generate personalized recommendations tailored to the curriculum the teacher teaches,
 * used when AI is offline or as the standard baseline.
 */
export function generatePersonalizedRecommendations(
  domainScores: Record<string, number>,
  strengths: Array<{ title: string; domain: string; description?: string }>,
  growthOpportunities: Array<{ title: string; domain: string; description?: string }>,
  teacherName?: string,
  curriculum?: string
): JTIAAIRecommendations {
  const cur = getCurriculumContext(curriculum);
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
      `${cur.toolkit}: Differentiated instructional protocols leveraging your high ${topDomainName} mastery (${primaryStrength}).`,
      `Guide to ${cur.localContext}: ideas for concrete teaching aids that boost ${lowestDomainName} engagement.`,
      `${cur.community} handbook: Collaborative lesson study templates and peer micro-teaching strategies.`,
      `JotMinds Cognitive Diversity In Action: Field guide for mapping student learning styles to lesson pacing in large classrooms.`
    ],
    activities: [
      `Formative Exit Slips: End each lesson with a 3-minute check on learning aligned to ${cur.assessmentTerm} before student dismissal.`,
      `Think-Pair-Share with Structured Wait-Time: Build confidence by allowing students 5 seconds of silence before sharing in pairs to reinforce ${primaryGrowth}.`,
      `Differentiated Task Cards: Organize tiered practice sets (Core, Scaffolded, Extension) using ${cur.localContext}.`,
      `Socratic Circle Modeling: Utilize gradual release ('I Do, We Do, You Do') to guide abstract reasoning and collaborative problem solving.`
    ],
    coaching: [
      `Departmental Peer Observation: Pair with a senior subject teacher for a 20-minute exchange focusing on ${primaryGrowth} and student question-flow.`,
      `Lesson Study: Present an upcoming unit plan to your ${cur.community} for feedback.`,
      `Student Feedback Pulse: Run a short, anonymous 3-question survey once per term asking learners which classroom activities help them understand best.`,
      `Curriculum Leader Debrief: Meet with your head of department or academic supervisor to align termly scheme of work milestones with learner progress.`
    ],
    pathways: [
      `School-Based Training Lead: Facilitate peer professional development workshops on effective teaching resources and differentiated instruction.`,
      `Curriculum Differentiation Mentor: Guide early-career teachers in tailoring lesson plans to diverse cognitive styles and special educational needs.`,
      `Subject Area Coordinator: Lead departmental coordination in assessment methods aligned to ${cur.name === 'your curriculum' ? 'your curriculum' : cur.name}.`,
      `Institutional Assessment Lead: Champion cognitive and formative evaluation strategies across your school cluster.`
    ],
    executiveSummary: `Demonstrates exemplary capability in ${topDomainName} Intelligence (${primaryStrength}). A targeted focus on ${lowestDomainName} Intelligence through structured peer activities and ${cur.localContext} will yield exceptional growth in classroom impact.`,
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

  const count = reports.length || 1;
  // Average only the scores that exist; a missing score must not be filled in with a made-up value
  const avgOf = (pick: (r: JTIAReportData) => number | undefined) => {
    const vals = reports.map(pick).filter((v): v is number => typeof v === 'number' && !isNaN(v));
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };
  const domainAverages = {
    cognitive: avgOf(r => r.domainScores?.cognitive),
    instructional: avgOf(r => r.domainScores?.instructional),
    leadership: avgOf(r => r.domainScores?.leadership),
    relationship: avgOf(r => r.domainScores?.relationship),
    professional: avgOf(r => r.domainScores?.professional)
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
    Object.entries(r.subCompetencies || {}).forEach(([sub, val]) => {
      if (!subSums[sub]) {
        const domain = jtiaQuestions.find(q => q.subCompetency === sub)?.domain || "Cognitive Intelligence";
        subSums[sub] = { sum: 0, count: 0, domain };
      }
      if (typeof val !== 'number' || isNaN(val)) return;
      subSums[sub].sum += val;
      subSums[sub].count += 1;
    });
  });

  const competencyHeatmap = Object.entries(subSums).filter(([, d]) => d.count > 0).map(([subCompetency, data]) => {
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

  // Strongest and weakest domains come from the data, not a fixed list
  const domainLabels: Record<string, string> = {
    cognitive: 'Cognitive Intelligence',
    instructional: 'Instructional Intelligence',
    leadership: 'Classroom Leadership',
    relationship: 'Relationship Intelligence',
    professional: 'Professional Intelligence',
  };
  const rankedDomains = Object.entries(domainAverages).sort((a, b) => b[1] - a[1]);
  const strongest = rankedDomains.slice(0, 2).map(([k]) => domainLabels[k]);
  const weakest = domainLabels[rankedDomains[rankedDomains.length - 1][0]];

  return {
    totalTeachersAssessed: count,
    overallSchoolIntelligence,
    domainAverages,
    competencyHeatmap,
    pdPriorities,
    growthPatterns: {
      highSynergyDomains: strongest,
      collaborativeOpportunities: [
        `Peer Observation Exchange: Pair teachers strong in ${strongest[0]} with colleagues who are still developing in it.`,
        `Staff Learning Sessions: Use your strongest teachers to lead short sessions on ${weakest}, your school's lowest-scoring area.`
      ],
      workforceReadiness: overallSchoolIntelligence
    }
  };
}
