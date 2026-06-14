import { AssessmentScore, KolbStyle, SternbergStyle, DualProcessStyle, GhanaMapping, Question } from '../types';

export function calculateKolbScore(responses: number[], questions: Question[]): AssessmentScore['kolb'] {
  const scores = { CE: 0, RO: 0, AC: 0, AE: 0 };
  
  responses.forEach((response, index) => {
    if (questions[index]) {
      const dimension = questions[index].dimension as keyof typeof scores;
      scores[dimension] += response;
    }
  });

  // Determine style based on AC-CE and AE-RO axes
  const acCe = scores.AC - scores.CE;
  const aeRo = scores.AE - scores.RO;
  
  let style: KolbStyle;
  if (acCe > 0 && aeRo > 0) {
    style = 'Converging';
  } else if (acCe > 0 && aeRo < 0) {
    style = 'Assimilating';
  } else if (acCe < 0 && aeRo < 0) {
    style = 'Diverging';
  } else {
    style = 'Accommodating';
  }

  return { style, scores };
}

export function calculateSternbergScore(responses: number[], questions: Question[]): AssessmentScore['sternberg'] {
  const scores = { analytical: 0, creative: 0, practical: 0 };
  
  responses.forEach((response, index) => {
    if (questions[index]) {
      const dimension = questions[index].dimension as keyof typeof scores;
      scores[dimension] += response;
    }
  });

  const max = Math.max(scores.analytical, scores.creative, scores.practical);
  let style: SternbergStyle;
  if (scores.analytical === max) {
    style = 'Analytical';
  } else if (scores.creative === max) {
    style = 'Creative';
  } else {
    style = 'Practical';
  }

  return { style, scores };
}

export function calculateDualProcessScore(responses: number[], questions: Question[]): AssessmentScore['dualProcess'] {
  const scores = { system1: 0, system2: 0 };
  
  responses.forEach((response, index) => {
    if (questions[index]) {
      const dimension = questions[index].dimension as keyof typeof scores;
      scores[dimension] += response;
    }
  });

  const diff = Math.abs(scores.system1 - scores.system2);
  let style: DualProcessStyle;
  if (diff < 5) {
    style = 'Balanced';
  } else if (scores.system1 > scores.system2) {
    style = 'Intuitive';
  } else {
    style = 'Reflective';
  }

  return { style, scores };
}

export function getGhanaMapping(score: AssessmentScore): GhanaMapping {
  const kolbStyle = score.kolb?.style;
  const sternbergStyle = score.sternberg?.style;
  
  const shsTrack: string[] = [];
  const tertiaryFocus: string[] = [];
  const careerSuggestions: string[] = [];
  let decisionTip = '';

  // SHS Track recommendations
  if (kolbStyle === 'Converging' || sternbergStyle === 'Analytical') {
    shsTrack.push('Science', 'General Science');
    tertiaryFocus.push('Engineering', 'Computer Science', 'Medicine', 'Mathematics');
    careerSuggestions.push('Engineer', 'Doctor', 'Scientist', 'IT Specialist', 'Researcher');
  }
  
  if (kolbStyle === 'Diverging' || sternbergStyle === 'Creative') {
    shsTrack.push('Visual Arts', 'General Arts');
    tertiaryFocus.push('Fine Arts', 'Communication Studies', 'Design', 'Creative Writing');
    careerSuggestions.push('Artist', 'Designer', 'Writer', 'Media Professional', 'Architect');
  }
  
  if (kolbStyle === 'Assimilating') {
    shsTrack.push('General Arts', 'General Science');
    tertiaryFocus.push('Law', 'Social Sciences', 'Research', 'Academia');
    careerSuggestions.push('Lawyer', 'Researcher', 'Professor', 'Analyst', 'Consultant');
  }
  
  if (kolbStyle === 'Accommodating' || sternbergStyle === 'Practical') {
    shsTrack.push('Business', 'Technical/Vocational', 'Agricultural Science');
    tertiaryFocus.push('Business Administration', 'Entrepreneurship', 'Applied Sciences');
    careerSuggestions.push('Entrepreneur', 'Business Manager', 'Project Manager', 'Technician');
  }

  // Decision tip based on dual process style
  if (score.dualProcess) {
    if (score.dualProcess.style === 'Intuitive') {
      decisionTip = 'You make quick decisions. Balance this with careful planning for important academic choices.';
    } else if (score.dualProcess.style === 'Reflective') {
      decisionTip = 'You think carefully before deciding. Trust your preparation and don\'t overthink during exams.';
    } else {
      decisionTip = 'You balance intuition and reflection well. Use both approaches as situations require.';
    }
  } else {
    // Provide a general tip based on learning and thinking styles when decision style is not available
    if (kolbStyle === 'Diverging') {
      decisionTip = 'Consider multiple perspectives before making important choices. Seek input from others.';
    } else if (kolbStyle === 'Assimilating') {
      decisionTip = 'Gather all the facts and analyze systematically before making major decisions.';
    } else if (kolbStyle === 'Converging') {
      decisionTip = 'Trust your problem-solving skills. Test ideas practically before committing.';
    } else if (kolbStyle === 'Accommodating') {
      decisionTip = 'Be flexible and ready to adapt. Learn from experiences as you go.';
    } else if (sternbergStyle === 'Analytical') {
      decisionTip = 'Break down complex choices into smaller parts. Evaluate pros and cons carefully.';
    } else if (sternbergStyle === 'Creative') {
      decisionTip = 'Explore creative alternatives. Don\'t limit yourself to conventional options.';
    } else if (sternbergStyle === 'Practical') {
      decisionTip = 'Focus on what works in real-world situations. Choose practical, actionable paths.';
    } else {
      decisionTip = 'Take your "Decision Style" assessment to get personalized decision-making tips.';
    }
  }

  return {
    shsTrack: [...new Set(shsTrack)],
    tertiaryFocus: [...new Set(tertiaryFocus)],
    decisionTip,
    careerSuggestions: [...new Set(careerSuggestions)],
  };
}

export function getStyleDescription(type: 'kolb' | 'sternberg' | 'dual-process', style: string): string {
  const descriptions: Record<string, string> = {
    // Kolb
    'Diverging': 'You prefer to watch, feel, and think. You excel at seeing things from multiple perspectives and working in groups.',
    'Assimilating': 'You prefer logical, organized thinking. You excel at understanding theories and creating systematic plans.',
    'Converging': 'You prefer to think and do. You excel at solving problems and applying ideas to practical situations.',
    'Accommodating': 'You prefer to feel and do. You excel at hands-on experiences and adapting to new situations.',
    
    // Sternberg
    'Analytical': 'You excel at analyzing, comparing, and evaluating. You enjoy breaking down problems and thinking critically.',
    'Creative': 'You excel at creating, imagining, and designing. You enjoy thinking of new possibilities and original solutions.',
    'Practical': 'You excel at applying knowledge to real-world situations. You focus on what works in everyday life.',
    
    // Dual Process
    'Intuitive': 'You tend to make quick decisions based on gut feelings and pattern recognition.',
    'Reflective': 'You tend to think carefully and deliberately, analyzing options before deciding.',
    'Balanced': 'You effectively use both intuitive and reflective thinking, depending on the situation.',
  };

  return descriptions[style] || '';
}
