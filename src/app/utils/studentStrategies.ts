/**
 * Builds teaching strategies and support areas for one student from their own numbers,
 * not from a canned list per style. Each item names the evidence behind it so a teacher
 * can see why it was suggested for this student.
 */

export interface StrategyItem {
  title: string;
  action: string;
  evidence: string;
}

export interface StudentStrategyInput {
  firstName: string;
  kolb?: { ce: number; ro: number; ac: number; ae: number; style?: string };
  thinkingStyle?: string;
  decisionStyle?: string;
  decisionBalanceScore?: number;
  engagementScore?: number;
  daysSinceLastActive?: number;
  completedCount: number;
}

type Mode = 'CE' | 'RO' | 'AC' | 'AE';

const KOLB_MAX = 48;

const MODE_LABEL: Record<Mode, string> = {
  CE: 'Concrete Experience',
  RO: 'Reflective Observation',
  AC: 'Abstract Conceptualization',
  AE: 'Active Experimentation',
};

const MODE_PLAIN: Record<Mode, string> = {
  CE: 'learns through real experiences and feelings',
  RO: 'learns by watching and reflecting before acting',
  AC: 'learns through ideas, logic and theory',
  AE: 'learns by doing and testing things out',
};

const MODE_ACTION: Record<Mode, string> = {
  CE: 'Open each new topic with a real example, story or object they can relate to before giving the rule.',
  RO: 'Show a worked example first and give quiet time to observe and think before asking them to respond.',
  AC: 'Give the underlying model or rule up front, with a clear structure they can organise notes around.',
  AE: 'Let them try the task first and explain the idea afterwards, with quick feedback to adjust.',
};

const MODE_SUPPORT: Record<Mode, string> = {
  CE: 'Link new content to something familiar from their own life, and check how they feel about it as well as what they know.',
  RO: 'Build in a short pause before they answer, and let them watch a peer or the teacher model the step first.',
  AC: 'Add a simple framework or diagram to a topic so the ideas connect, rather than leaving facts separate.',
  AE: 'Turn one question per lesson into a small hands-on task so they practise applying the idea.',
};

// How a student's strongest learning mode combines with their thinking style.
const COMBINED: Record<Mode, Record<string, string>> = {
  CE: {
    analytical: 'Use real cases they can examine: ask them to compare two situations and say which works better and why.',
    creative: 'Let them respond to an experience through a story, drawing or role-play before any formal write-up.',
    practical: 'Tie lessons to jobs and daily life they know, and ask what they would do in that situation.',
    reflective: 'Pair an experience with a short journal entry about what they noticed and felt.',
  },
  RO: {
    analytical: 'Give them material to study ahead of class, then ask for a reasoned critique rather than a quick answer.',
    creative: 'Give thinking time, then invite an original idea or alternative approach to the example shown.',
    practical: 'Show how a real task is done step by step, then ask them to explain how they would apply it.',
    reflective: 'Use reflection prompts at the end of a lesson: what changed in my thinking today?',
  },
  AC: {
    analytical: 'Offer logic problems, proofs or data to work through, and ask them to defend the method they chose.',
    creative: 'Ask them to build their own model or analogy for the idea and explain it to the class.',
    practical: 'Show a theory then immediately a use of it, such as a calculation behind something they see daily.',
    reflective: 'Give a concept map to complete after reading, then ask what is still unclear.',
  },
  AE: {
    analytical: 'Set experiments with a hypothesis to test and results to record, then ask what the data shows.',
    creative: 'Give open-ended build or design tasks with several valid answers and time to iterate.',
    practical: 'Use real-world projects with a tangible result, such as a product, plan or demonstration.',
    reflective: 'Follow each hands-on task with two minutes to write what worked and what they would change.',
  },
};

const normalise = (s?: string) => (s || '').trim().toLowerCase();

function modesOf(kolb: NonNullable<StudentStrategyInput['kolb']>) {
  const list: Array<{ mode: Mode; score: number }> = [
    { mode: 'CE', score: kolb.ce },
    { mode: 'RO', score: kolb.ro },
    { mode: 'AC', score: kolb.ac },
    { mode: 'AE', score: kolb.ae },
  ];
  return list.sort((a, b) => b.score - a.score);
}

export function buildStudentStrategies(input: StudentStrategyInput): { strategies: StrategyItem[]; support: StrategyItem[] } {
  const { firstName } = input;
  const strategies: StrategyItem[] = [];
  const support: StrategyItem[] = [];
  const thinking = normalise(input.thinkingStyle);
  const hasKolb = !!input.kolb && [input.kolb.ce, input.kolb.ro, input.kolb.ac, input.kolb.ae].some(n => n > 0);

  if (hasKolb && input.kolb) {
    const ranked = modesOf(input.kolb);
    const top = ranked[0];
    const second = ranked[1];
    const weakest = ranked[3];
    const spread = top.score - weakest.score;
    const lean = spread >= KOLB_MAX * 0.45 ? 'strongly' : spread >= KOLB_MAX * 0.25 ? 'clearly' : 'only slightly';

    if (spread < KOLB_MAX * 0.15) {
      strategies.push({
        title: 'Vary how you introduce new ideas',
        action: `${firstName} scores close to evenly on all four modes, so no single approach will suit every topic. Rotate between an example first, a worked demo, a rule first and a hands-on try, and note which they pick up fastest.`,
        evidence: `Scores ${ranked.map(r => `${r.mode} ${r.score}`).join(', ')}: only ${spread} points between the highest and lowest.`,
      });
    } else {
      strategies.push({
        title: `Teach through ${MODE_LABEL[top.mode]}`,
        action: MODE_ACTION[top.mode],
        evidence: `${firstName} ${MODE_PLAIN[top.mode]}: ${MODE_LABEL[top.mode]} is ${top.score}/${KOLB_MAX}, ${lean} ahead of ${MODE_LABEL[weakest.mode]} at ${weakest.score}.`,
      });
      if (second.score >= top.score - 4 && second.mode !== top.mode) {
        strategies.push({
          title: `Combine with ${MODE_LABEL[second.mode]}`,
          action: `${MODE_ACTION[second.mode]} Together with the first approach this gives ${firstName} two routes into the same idea.`,
          evidence: `${MODE_LABEL[second.mode]} is close behind at ${second.score}/${KOLB_MAX}.`,
        });
      }
    }

    const combo = COMBINED[top.mode][thinking];
    if (combo && spread >= KOLB_MAX * 0.15) {
      strategies.push({
        title: `Match their ${input.thinkingStyle} thinking`,
        action: combo,
        evidence: `${MODE_LABEL[top.mode]} as the top mode (${top.score}) together with ${/^[aeiou]/.test(thinking) ? 'an' : 'a'} ${thinking} thinking style.`,
      });
    }

    if (weakest.score < KOLB_MAX * 0.5 && spread >= KOLB_MAX * 0.25) {
      support.push({
        title: `Build ${MODE_LABEL[weakest.mode]}`,
        action: MODE_SUPPORT[weakest.mode],
        evidence: `${MODE_LABEL[weakest.mode]} is ${firstName}'s lowest mode at ${weakest.score}/${KOLB_MAX}.`,
      });
    }
  }

  if (!hasKolb && thinking) {
    const generic: Record<string, string> = {
      analytical: 'Give problems that need comparing and evaluating options, and ask for the reasoning behind answers.',
      creative: 'Offer open-ended tasks with more than one valid answer, and value original approaches.',
      practical: 'Connect each lesson to a real use, and use case studies with a clear outcome.',
      reflective: 'Allow thinking time and use short journalling or review prompts.',
    };
    if (generic[thinking]) {
      strategies.push({
        title: `Teach to their ${input.thinkingStyle} thinking`,
        action: generic[thinking],
        evidence: `Thinking style result: ${input.thinkingStyle}. The learning-style assessment has not been completed yet, so this is the only signal so far.`,
      });
    }
  }

  const decision = normalise(input.decisionStyle);
  if (decision.startsWith('intuitive')) {
    const bal = input.decisionBalanceScore != null ? ` (balance ${Math.round(input.decisionBalanceScore)}/100)` : '';
    strategies.push({
      title: 'Slow down quick answers',
      action: `${firstName} tends to answer on instinct. Ask "what makes you say that?" and give a 30-second pause before accepting an answer on multi-step problems.`,
      evidence: `Decision style: ${input.decisionStyle}${bal}.`,
    });
    support.push({
      title: 'Practise evidence-based decisions',
      action: 'Use tasks where they must list two pieces of evidence before choosing, such as compare-and-justify questions.',
      evidence: `Decision style is intuitive-leaning${bal}.`,
    });
  } else if (decision.startsWith('reflective')) {
    const bal = input.decisionBalanceScore != null ? ` (balance ${Math.round(input.decisionBalanceScore)}/100)` : '';
    strategies.push({
      title: 'Allow thinking time, then build speed',
      action: `${firstName} prefers to think things through. Give notice before cold-calling and add short low-stakes timed tasks so quick decisions become comfortable.`,
      evidence: `Decision style: ${input.decisionStyle}${bal}.`,
    });
  }

  if (input.completedCount === 0) {
    support.push({
      title: 'Start with the first assessment',
      action: `${firstName} has no completed assessments, so nothing above can be personalised yet. Ask them to complete the learning-style assessment first.`,
      evidence: 'No assessments completed.',
    });
  } else if (input.completedCount < 3) {
    support.push({
      title: 'Finish the remaining assessments',
      action: `Only ${input.completedCount} of the 3 core assessments are done. Completing the rest will sharpen these suggestions.`,
      evidence: `${input.completedCount} assessment${input.completedCount === 1 ? '' : 's'} completed.`,
    });
  }

  if (input.daysSinceLastActive != null && input.daysSinceLastActive >= 14 && input.completedCount > 0) {
    support.push({
      title: 'Check in personally',
      action: `${firstName} has not been active for a while. A short one-to-one chat about what is getting in the way is likely to help more than another task.`,
      evidence: `Last active ${input.daysSinceLastActive} days ago.`,
    });
  } else if (input.engagementScore != null && input.engagementScore >= 70) {
    strategies.push({
      title: 'Give them a stretch role',
      action: `${firstName} is highly engaged. Offer an extension task or let them explain an idea to a classmate to deepen their own understanding.`,
      evidence: `Engagement score ${input.engagementScore}/100.`,
    });
  } else if (input.engagementScore != null && input.engagementScore < 40 && input.completedCount > 0) {
    support.push({
      title: 'Lift engagement with a small win',
      action: `Set one short, achievable task this week that suits their strongest mode and acknowledge it when done.`,
      evidence: `Engagement score ${input.engagementScore}/100.`,
    });
  }

  return { strategies, support };
}
