/**
 * Teaching-style (Teaching Insights / JTIA) helpers shared by the school screens.
 *
 * A teacher who only completed the Teaching Insights assessment has no learning,
 * thinking or decision style of their own. Their results are compared with the
 * students' styles through the teaching axes instead (see computeTeachingFit).
 */

export interface LearningStyleData { style: string; scores: { CE: number; RO: number; AC: number; AE: number } }
export interface ThinkingStyleData { style: string; scores: Record<string, number>; assessmentType: string }
export interface DecisionStyleData { style: string; scores: { intuitive: number; reflective: number } }
export interface TeachingStyleData { primaryStyle: string; secondaryStyle: string; axes: Record<string, number> }


export function extractTeaching(assessments: any[]): TeachingStyleData | null {
  const a = assessments.filter((x: any) => 
    (x.type === 'jtia' || x.type === 'teaching-style' || x.type === 'teaching') && 
    (x.completedAt || x.completed || x.report || x.results || x.score?.jtia || x.score?.['teaching-style'])
  ).sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];

  if (!a) return null;

  const jtia = a.report || a.results?.jtia || a.score?.jtia || a.results || a.score?.['teaching-style'] || {};
  const teachStyle = a.score?.['teaching-style'] || (jtia.scores?.axisAuthority ? jtia : {});

  // Extract or derive the 6 axes
  const rawAxes = teachStyle.scores || jtia.scores || jtia.axes || {};
  const domainScores = jtia.domainScores || {};

  const axisAuthority = rawAxes.axisAuthority ?? domainScores.leadership ?? 70;
  const axisKnowledge = rawAxes.axisKnowledge ?? domainScores.instructional ?? 70;
  const axisMotivation = rawAxes.axisMotivation ?? Math.round(((domainScores.relationship ?? 70) + (domainScores.leadership ?? 70)) / 2);
  const axisAssessment = rawAxes.axisAssessment ?? domainScores.instructional ?? 70;
  const axisAdaptability = rawAxes.axisAdaptability ?? domainScores.cognitive ?? 70;
  const axisClimate = rawAxes.axisClimate ?? domainScores.relationship ?? 75;

  const axes: Record<string, number> = {
    axisAuthority,
    axisKnowledge,
    axisMotivation,
    axisAssessment,
    axisAdaptability,
    axisClimate,
    cognitive: domainScores.cognitive ?? axisAdaptability,
    instructional: domainScores.instructional ?? axisKnowledge,
    leadership: domainScores.leadership ?? axisAuthority,
    relationship: domainScores.relationship ?? axisClimate,
    professional: domainScores.professional ?? axisAssessment,
  };

  let primaryStyle = teachStyle.primaryStyle || jtia.primaryStyle || jtia.topSynergyDomain;
  let secondaryStyle = teachStyle.secondaryStyle || jtia.secondaryStyle;

  if (!primaryStyle) {
    const getFit = (actual: number, target: number, isMin: boolean) => {
      if (isMin) return actual >= target ? 100 : (actual / target) * 100;
      return actual <= target ? 100 : Math.max(0, (1 - (actual - target) / (100 - target)) * 100);
    };
    const profileScores = [
      { name: "Authoritative Instructor", fit: (getFit(axisAuthority, 40, false) + getFit(axisAdaptability, 40, false)) / 2 },
      { name: "Structured Educator", fit: (getFit(axisAuthority, 40, false) + getFit(axisAssessment, 60, true)) / 2 },
      { name: "Facilitator Coach", fit: (getFit(axisAuthority, 60, true) + getFit(axisClimate, 60, true)) / 2 },
      { name: "Engagement Driver", fit: getFit(axisMotivation, 70, true) },
      { name: "Learning Architect", fit: (getFit(axisKnowledge, 60, true) + getFit(axisAssessment, 60, true)) / 2 },
      { name: "Innovation Leader", fit: (getFit(axisAdaptability, 60, true) + getFit(domainScores.cognitive ?? 50, 60, true)) / 2 },
      { name: "Traditionalist", fit: (getFit(axisKnowledge, 40, false) + getFit(axisAssessment, 40, false)) / 2 },
      { name: "Student-Centered Mentor", fit: (getFit(axisClimate, 60, true) + getFit(axisKnowledge, 60, true)) / 2 },
    ].sort((a, b) => b.fit - a.fit);

    primaryStyle = profileScores[0]?.name || 'Facilitator Coach';
    secondaryStyle = secondaryStyle || profileScores[1]?.name || `${jtia.overallScore || 70}/100 Overall`;
  }

  if (!secondaryStyle) {
    secondaryStyle = `${jtia.overallScore || 70}/100 Overall`;
  }

  return {
    primaryStyle,
    secondaryStyle,
    axes
  };
}

export function extractLearning(assessments: any[]): LearningStyleData | null {
  const a = assessments.filter((x: any) => 
    (x.type === 'kolb' || x.type === 'learning') && 
    (x.completedAt || x.completed) && 
    (x.score?.kolb || x.score?.learning || x.results?.kolb || x.results?.scores)
  ).sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];

  if (!a) return null;
  const k = a.score?.kolb || a.score?.learning || a.results?.kolb || a.results || {};
  const scores = k.scores || {};
  return { 
    style: k.style || k.dominantStyle || 'Converging', 
    scores: { CE: scores.CE ?? 0, RO: scores.RO ?? 0, AC: scores.AC ?? 0, AE: scores.AE ?? 0 } 
  };
}

export function extractThinking(assessments: any[]): ThinkingStyleData | null {
  const all = assessments.filter((x: any) => (x.completedAt || x.completed) && (x.score || x.results || x.report));
  for (const type of ['sternberg', 'thinking', 'adult-thinking', 'shs-thinking', 'jhs-thinking']) {
    const a = all.filter((x: any) => x.type === type).sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];
    if (!a) continue;
    const s = a.score || {};
    if ((type === 'sternberg' || type === 'thinking') && s.sternberg) {
      return { style: s.sternberg.style, scores: s.sternberg.scores, assessmentType: 'Sternberg' };
    }
    const ts = s['adult-thinking'] || s['shs-thinking'] || s['jhs-thinking'] || s.thinking || a.report || a.results;
    if (!ts) continue;
    const rawScores: Record<string, number> = ts.scores || {};
    const primary = ts.style || ts.primaryStyle || ts.dominantStyle || Object.entries(rawScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';
    return { 
      style: primary.charAt(0).toUpperCase() + primary.slice(1), 
      scores: rawScores, 
      assessmentType: type === 'adult-thinking' ? 'Adult' : type === 'shs-thinking' ? 'SHS' : type === 'jhs-thinking' ? 'JHS' : 'Sternberg' 
    };
  }
  return null;
}

export function extractDecision(assessments: any[]): DecisionStyleData | null {
  const a = assessments.filter((x: any) => 
    (x.type === 'dual-process' || x.type === 'decision') && 
    (x.completedAt || x.completed) && 
    (x.score?.dualProcess || x.score?.decision || x.results?.dualProcess || x.results?.scores || x.report)
  ).sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];

  if (!a) return null;
  const d = a.score?.dualProcess || a.score?.decision || a.results?.dualProcess || a.report || a.results || {};
  const scores = d.scores || {};
  const sys1 = scores.intuitive ?? scores.System1 ?? scores.system1 ?? 0;
  const sys2 = scores.reflective ?? scores.System2 ?? scores.system2 ?? 0;
  const raw = String(d.style || d.dominantStyle || (sys1 >= sys2 ? 'Intuitive' : 'Reflective'));
  const style = raw.trim().split(/\s+/)[0]; // "Intuitive Dominant" -> "Intuitive"
  return {
    style: style.charAt(0).toUpperCase() + style.slice(1).toLowerCase(),
    scores: { intuitive: sys1, reflective: sys2 },
  };
}


export function computeTeachingThinkingAlignment(axes: Record<string, number>, thinkingStyle: string): number {
  let s = 60;
  const { axisAdaptability = 50, axisClimate = 50, axisKnowledge = 50, axisAuthority = 50, axisMotivation = 50, axisAssessment = 50 } = axes;
  if (thinkingStyle === 'Creative') { s += axisAdaptability > 60 ? 15 : axisAdaptability < 40 ? -15 : 0; s += axisClimate > 60 ? 10 : 0; s += axisKnowledge > 60 ? 8 : 0; s += axisAuthority < 40 ? 5 : axisAuthority > 70 ? -10 : 0; }
  else if (thinkingStyle === 'Analytical') { s += axisAssessment > 55 ? 10 : 0; s += axisClimate > 50 ? 8 : axisClimate < 35 ? -12 : 0; s += axisAdaptability > 50 ? 5 : 0; }
  else if (thinkingStyle === 'Practical') { s += axisMotivation > 55 ? 10 : 0; s += axisAdaptability > 50 ? 8 : 0; s += axisKnowledge < 30 ? -10 : 0; }
  else if (thinkingStyle === 'Reflective') { s += axisClimate > 65 ? 18 : axisClimate < 40 ? -20 : 0; s += axisAssessment > 60 ? 10 : 0; }
  return Math.max(30, Math.min(98, Math.round(s)));
}

export function computeLearningTeachingAlignment(axes: Record<string, number>, kolbStyle: string): number {
  let s = 60;
  const { axisKnowledge = 50, axisAdaptability = 50, axisAuthority = 50, axisClimate = 50 } = axes;
  // Diverging: experiential, feeling-based → suits facilitative, safe, constructive teaching
  if (kolbStyle === 'Diverging') { s += axisClimate > 55 ? 12 : 0; s += axisKnowledge > 55 ? 10 : 0; s += axisAuthority < 45 ? 8 : 0; }
  // Assimilating: abstract, reflective → suits transmission, structured
  else if (kolbStyle === 'Assimilating') { s += axisKnowledge < 55 ? 10 : 0; s += axisAdaptability > 45 ? 5 : 0; }
  // Converging: abstract, active → suits structured problem-solving
  else if (kolbStyle === 'Converging') { s += axisAdaptability > 50 ? 10 : 0; s += axisClimate > 50 ? 5 : 0; }
  // Accommodating: concrete, active → suits engagement, facilitation
  else if (kolbStyle === 'Accommodating') { s += axisAdaptability > 55 ? 12 : 0; s += axisClimate > 55 ? 8 : 0; s += axisKnowledge > 50 ? 5 : 0; }
  return Math.max(30, Math.min(98, Math.round(s)));
}

export function computeDecisionTeachingAlignment(axes: Record<string, number>, decisionStyle: string): number {
  let s = 65;
  const { axisAdaptability = 50, axisAssessment = 50, axisClimate = 50 } = axes;
  if (decisionStyle === 'Intuitive') { s += axisAdaptability > 55 ? 15 : axisAdaptability < 40 ? -10 : 0; s += axisClimate > 55 ? 8 : 0; }
  else if (decisionStyle === 'Reflective') { s += axisAssessment > 55 ? 15 : 0; s += axisClimate > 55 ? 8 : 0; s += axisAdaptability > 45 ? 5 : 0; }
  else if (decisionStyle === 'Balanced') { s += 10; } // balanced is always a good fit
  return Math.max(30, Math.min(98, Math.round(s)));
}


// ─── Teaching fit against a student body ──────────────────────────────────────

export interface StudentStyles { learning?: string | null; thinking?: string | null; decision?: string | null }
export interface StyleFit {
  dimension: 'Thinking' | 'Learning' | 'Decision';
  style: string;
  students: number;
  /** 0-100: how well the teachers' teaching approach suits students of this style */
  fit: number;
}

/** Styles of one student, read from their completed assessments. */
export function extractStudentStyles(assessments: any[]): StudentStyles {
  return {
    learning: extractLearning(assessments)?.style ?? null,
    thinking: extractThinking(assessments)?.style ?? null,
    decision: extractDecision(assessments)?.style ?? null,
  };
}

/**
 * For every style found among the students, the average fit of the given teachers'
 * teaching axes with it. Lowest fit first, so the biggest gaps lead.
 */
export function computeTeachingFit(teacherAxes: Array<Record<string, number>>, students: StudentStyles[]): StyleFit[] {
  if (teacherAxes.length === 0) return [];
  const counts = new Map<string, { dimension: StyleFit['dimension']; style: string; students: number }>();
  const bump = (dimension: StyleFit['dimension'], style?: string | null) => {
    if (!style) return;
    const key = `${dimension}:${style}`;
    const entry = counts.get(key) || { dimension, style, students: 0 };
    entry.students++;
    counts.set(key, entry);
  };
  students.forEach(s => {
    bump('Thinking', s.thinking);
    bump('Learning', s.learning);
    bump('Decision', s.decision);
  });

  const fitFor = (axes: Record<string, number>, dimension: StyleFit['dimension'], style: string) =>
    dimension === 'Thinking' ? computeTeachingThinkingAlignment(axes, style)
    : dimension === 'Learning' ? computeLearningTeachingAlignment(axes, style)
    : computeDecisionTeachingAlignment(axes, style);

  return Array.from(counts.values())
    .map(e => ({
      ...e,
      fit: Math.round(teacherAxes.reduce((sum, axes) => sum + fitFor(axes, e.dimension, e.style), 0) / teacherAxes.length),
    }))
    .sort((a, b) => a.fit - b.fit || b.students - a.students);
}

/** One teacher's overall fit with a set of students, weighted by how many students share each style. */
export function teacherFitWithStudents(axes: Record<string, number>, students: StudentStyles[]): number | null {
  const rows = computeTeachingFit([axes], students);
  const total = rows.reduce((n, r) => n + r.students, 0);
  if (total === 0) return null;
  return Math.round(rows.reduce((sum, r) => sum + r.fit * r.students, 0) / total);
}

/** Practical advice for the staff when a student style is not well served. */
export const STYLE_TEACHING_ADVICE: Record<string, string> = {
  Creative: 'Add open-ended tasks with more than one right answer, and check that marking criteria do not penalise unusual approaches.',
  Analytical: 'Show the reasoning step by step, and include problems that ask students to compare options and justify a choice.',
  Practical: 'Link topics to real uses and give hands-on tasks with a visible result.',
  Reflective: 'Leave thinking time before answers are expected, and use short review or journal prompts.',
  Diverging: 'Use discussion, stories and group work, and let students respond to examples before the rule is given.',
  Assimilating: 'Give a clear structure and a model to organise the content around, with time for independent study.',
  Converging: 'Set problem-solving tasks with a clear goal and let students test ideas against real situations.',
  Accommodating: 'Let students try tasks first, with quick feedback, and use movement and practical demonstrations.',
  Intuitive: 'Start with the big picture and analogies, then fill in the detail, and welcome quick responses.',
  Balanced: 'Vary the pace: mix quick-response activities with tasks that need careful thought.',
};
