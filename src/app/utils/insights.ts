import { AssessmentScore, KolbStyle, SternbergStyle, DualProcessStyle } from '../types';

export interface AssessmentInsights {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  organizationalFit: string[];
  continuousReview: string[];
}

export function generateKolbInsights(style: KolbStyle, scores: AssessmentScore['kolb']['scores']): AssessmentInsights {
  const insights: AssessmentInsights = {
    strengths: [],
    weaknesses: [],
    improvements: [],
    organizationalFit: [],
    continuousReview: []
  };

  // Calculate relative strengths
  const maxScore = Math.max(scores.CE, scores.RO, scores.AC, scores.AE);
  const minScore = Math.min(scores.CE, scores.RO, scores.AC, scores.AE);

  switch (style) {
    case 'Diverging':
      insights.strengths = [
        'Strong imaginative ability and brainstorming skills',
        'Excellent at viewing situations from multiple perspectives',
        'Good at understanding people and emotional intelligence',
        'Creative problem-solving and generating innovative ideas',
        'Works well in group settings and collaborative environments'
      ];
      insights.weaknesses = [
        'May struggle with making quick decisions',
        'Can have difficulty with practical implementation',
        'Might overthink situations without taking action',
        'May avoid technical or systematic approaches',
        'Can be indecisive when faced with structured tasks'
      ];
      insights.improvements = [
        'Practice making decisions with limited information',
        'Develop skills in creating actionable plans from ideas',
        'Work on time management and meeting deadlines',
        'Build confidence in technical or analytical tasks',
        'Learn to balance reflection with action'
      ];
      insights.organizationalFit = [
        'Ideal for: Creative roles, R&D, marketing, design, customer insights',
        'Team contribution: Brings diverse perspectives and creative solutions',
        'Leadership style: Collaborative, people-oriented, consensus-building'
      ];
      insights.continuousReview = [
        'Monitor: Ability to translate ideas into actionable outcomes',
        'Develop: Decision-making speed and implementation skills',
        'Leverage: Creative thinking in strategic planning sessions'
      ];
      break;

    case 'Assimilating':
      insights.strengths = [
        'Excellent at creating theoretical models and frameworks',
        'Strong logical and analytical thinking abilities',
        'Good at organizing information into coherent structures',
        'Skilled in research and information synthesis',
        'Prefers systematic and structured approaches'
      ];
      insights.weaknesses = [
        'May focus too much on theory over practical application',
        'Can struggle with people-oriented or emotional situations',
        'Might overlook practical constraints in planning',
        'May have difficulty with ambiguous or unstructured problems',
        'Can be perceived as impractical or detached'
      ];
      insights.improvements = [
        'Practice applying theories to real-world situations',
        'Develop interpersonal and emotional intelligence skills',
        'Work on flexibility in unstructured environments',
        'Seek opportunities to test ideas practically',
        'Build skills in communicating complex ideas simply'
      ];
      insights.organizationalFit = [
        'Ideal for: Research, strategic planning, analysis, data science, academia',
        'Team contribution: Provides structured thinking and systematic approaches',
        'Leadership style: Analytical, process-driven, knowledge-focused'
      ];
      insights.continuousReview = [
        'Monitor: Practical application of theoretical knowledge',
        'Develop: Interpersonal skills and emotional intelligence',
        'Leverage: Analytical abilities in complex problem-solving'
      ];
      break;

    case 'Converging':
      insights.strengths = [
        'Strong problem-solving abilities with practical solutions',
        'Excellent at applying ideas to real-world situations',
        'Good at technical tasks and systematic approaches',
        'Skilled in making decisions and taking action',
        'Prefers practical experimentation and testing'
      ];
      insights.weaknesses = [
        'May rush to solutions without exploring alternatives',
        'Can struggle with interpersonal or emotional aspects',
        'Might overlook creative or unconventional approaches',
        'May have difficulty in ambiguous situations',
        'Can be impatient with lengthy discussions or debates'
      ];
      insights.improvements = [
        'Practice considering multiple perspectives before deciding',
        'Develop patience for exploration and brainstorming',
        'Work on interpersonal and communication skills',
        'Learn to appreciate creative and unconventional ideas',
        'Build comfort with ambiguity and uncertainty'
      ];
      insights.organizationalFit = [
        'Ideal for: Engineering, operations, project management, technical roles',
        'Team contribution: Drives practical implementation and results',
        'Leadership style: Task-oriented, results-focused, efficient'
      ];
      insights.continuousReview = [
        'Monitor: Consideration of alternative approaches and team input',
        'Develop: Interpersonal skills and collaborative decision-making',
        'Leverage: Problem-solving abilities in critical projects'
      ];
      break;

    case 'Accommodating':
      insights.strengths = [
        'Excellent hands-on learning and practical experimentation',
        'Strong adaptability and flexibility in changing situations',
        'Good at executing plans and taking action',
        'Skilled at learning from experience and trial-and-error',
        'Comfortable with risk-taking and new challenges'
      ];
      insights.weaknesses = [
        'May lack systematic planning and organization',
        'Can struggle with theoretical or abstract concepts',
        'Might act impulsively without sufficient analysis',
        'May have difficulty with long-term strategic planning',
        'Can be perceived as disorganized or unfocused'
      ];
      insights.improvements = [
        'Develop skills in planning and strategic thinking',
        'Practice analyzing situations before taking action',
        'Work on building theoretical understanding',
        'Learn to balance action with reflection',
        'Improve organizational and time management skills'
      ];
      insights.organizationalFit = [
        'Ideal for: Sales, entrepreneurship, field work, hands-on technical roles',
        'Team contribution: Drives action and brings practical experience',
        'Leadership style: Action-oriented, adaptable, entrepreneurial'
      ];
      insights.continuousReview = [
        'Monitor: Planning and strategic thinking capabilities',
        'Develop: Analytical skills and systematic approaches',
        'Leverage: Adaptability in dynamic market conditions'
      ];
      break;
  }

  // Add specific notes based on score variations
  if (maxScore - minScore > 15) {
    insights.improvements.push('Work on developing your weaker dimensions for more balanced learning');
  }

  return insights;
}

export function generateSternbergInsights(style: SternbergStyle, scores: AssessmentScore['sternberg']['scores']): AssessmentInsights {
  const insights: AssessmentInsights = {
    strengths: [],
    weaknesses: [],
    improvements: [],
    organizationalFit: [],
    continuousReview: []
  };

  switch (style) {
    case 'Analytical':
      insights.strengths = [
        'Excellent critical thinking and problem analysis abilities',
        'Strong at breaking down complex problems systematically',
        'Good at comparing and contrasting different options',
        'Skilled in logical reasoning and evidence-based decisions',
        'Effective at evaluating and critiquing ideas'
      ];
      insights.weaknesses = [
        'May over-analyze situations and delay decisions',
        'Can struggle with novel or unprecedented problems',
        'Might overlook practical implementation challenges',
        'May be less comfortable with ambiguous situations',
        'Can appear overly critical or negative to others'
      ];
      insights.improvements = [
        'Practice making decisions with incomplete information',
        'Develop comfort with creative and unconventional solutions',
        'Work on balancing analysis with practical action',
        'Build skills in handling ambiguity and uncertainty',
        'Learn to present critiques constructively'
      ];
      insights.organizationalFit = [
        'Ideal for: Strategy, consulting, quality assurance, risk management, analytics',
        'Team contribution: Provides thorough analysis and risk assessment',
        'Leadership style: Data-driven, methodical, quality-focused'
      ];
      insights.continuousReview = [
        'Monitor: Speed of decision-making and action-taking',
        'Develop: Creative problem-solving and innovation',
        'Leverage: Analytical skills in strategic initiatives'
      ];
      break;

    case 'Creative':
      insights.strengths = [
        'Excellent at generating novel ideas and innovative solutions',
        'Strong imagination and ability to think outside the box',
        'Good at challenging assumptions and traditional approaches',
        'Skilled at seeing connections others might miss',
        'Comfortable with ambiguity and open-ended problems'
      ];
      insights.weaknesses = [
        'May generate ideas without practical implementation',
        'Can struggle with routine or structured tasks',
        'Might overlook constraints and practical limitations',
        'May have difficulty with detailed execution',
        'Can be seen as impractical or unrealistic'
      ];
      insights.improvements = [
        'Develop skills in evaluating and refining ideas',
        'Practice considering practical constraints and resources',
        'Work on following through with implementation',
        'Build discipline for routine but necessary tasks',
        'Learn to communicate ideas in practical terms'
      ];
      insights.organizationalFit = [
        'Ideal for: Innovation, R&D, product development, marketing, design',
        'Team contribution: Drives innovation and fresh perspectives',
        'Leadership style: Visionary, innovative, change-oriented'
      ];
      insights.continuousReview = [
        'Monitor: Conversion of creative ideas into viable solutions',
        'Develop: Practical implementation and analytical evaluation',
        'Leverage: Innovation capabilities in product development'
      ];
      break;

    case 'Practical':
      insights.strengths = [
        'Excellent at applying knowledge to real-world situations',
        'Strong common sense and practical problem-solving',
        'Good at understanding context and environmental factors',
        'Skilled at adapting solutions to specific situations',
        'Effective at making things work in practice'
      ];
      insights.weaknesses = [
        'May overlook innovative or unconventional solutions',
        'Can struggle with theoretical or abstract concepts',
        'Might focus too much on immediate rather than long-term',
        'May have difficulty with novel or unprecedented situations',
        'Can be resistant to change or new approaches'
      ];
      insights.improvements = [
        'Develop comfort with theoretical frameworks',
        'Practice considering innovative alternatives',
        'Work on long-term strategic thinking',
        'Build skills in analytical evaluation',
        'Learn to balance practicality with innovation'
      ];
      insights.organizationalFit = [
        'Ideal for: Operations, implementation, customer service, field management',
        'Team contribution: Ensures practical execution and real-world viability',
        'Leadership style: Results-oriented, pragmatic, grounded'
      ];
      insights.continuousReview = [
        'Monitor: Openness to innovative approaches and new methods',
        'Develop: Strategic thinking and analytical capabilities',
        'Leverage: Practical skills in operational excellence'
      ];
      break;
  }

  // Add balance recommendations
  const { analytical, creative, practical } = scores;
  const total = analytical + creative + practical;
  const avgScore = total / 3;
  const variance = Math.max(
    Math.abs(analytical - avgScore),
    Math.abs(creative - avgScore),
    Math.abs(practical - avgScore)
  );

  if (variance > 10) {
    insights.improvements.push('Consider developing your weaker thinking styles for more versatile problem-solving');
  }

  return insights;
}

export function generateDualProcessInsights(style: DualProcessStyle, scores: AssessmentScore['dualProcess']['scores']): AssessmentInsights {
  const insights: AssessmentInsights = {
    strengths: [],
    weaknesses: [],
    improvements: [],
    organizationalFit: [],
    continuousReview: []
  };

  switch (style) {
    case 'Intuitive':
      insights.strengths = [
        'Excellent at making quick decisions under pressure',
        'Strong pattern recognition and rapid assessment',
        'Good at reading situations and people intuitively',
        'Skilled at multitasking and handling multiple inputs',
        'Effective in fast-paced, dynamic environments'
      ];
      insights.weaknesses = [
        'May make hasty decisions without full analysis',
        'Can be influenced by biases and first impressions',
        'Might overlook important details or alternatives',
        'May struggle with complex analytical tasks',
        'Can have difficulty explaining decision rationale'
      ];
      insights.improvements = [
        'Practice slowing down for important decisions',
        'Develop awareness of cognitive biases',
        'Work on systematic analysis for complex problems',
        'Build skills in documenting decision-making processes',
        'Learn to validate intuitions with data when possible'
      ];
      insights.organizationalFit = [
        'Ideal for: Emergency response, sales, customer service, fast-paced operations',
        'Team contribution: Provides quick responses and rapid problem-solving',
        'Leadership style: Decisive, action-oriented, responsive'
      ];
      insights.continuousReview = [
        'Monitor: Quality of decisions made under time pressure',
        'Develop: Analytical thinking and systematic evaluation',
        'Leverage: Quick decision-making in time-sensitive situations'
      ];
      break;

    case 'Reflective':
      insights.strengths = [
        'Excellent at thorough analysis and careful consideration',
        'Strong at evaluating multiple perspectives and alternatives',
        'Good at avoiding biases through systematic thinking',
        'Skilled at complex problem-solving and planning',
        'Effective at making well-reasoned, defensible decisions'
      ];
      insights.weaknesses = [
        'May over-analyze and delay necessary decisions',
        'Can struggle in fast-paced or time-pressured situations',
        'Might miss opportunities requiring quick action',
        'May be perceived as slow or indecisive',
        'Can experience analysis paralysis'
      ];
      insights.improvements = [
        'Practice making decisions with time constraints',
        'Develop comfort with calculated risks',
        'Work on trusting your intuition for minor decisions',
        'Build skills in rapid assessment and triage',
        'Learn to identify when "good enough" is sufficient'
      ];
      insights.organizationalFit = [
        'Ideal for: Strategic planning, research, policy development, quality control',
        'Team contribution: Provides thorough analysis and risk mitigation',
        'Leadership style: Thoughtful, deliberate, strategic'
      ];
      insights.continuousReview = [
        'Monitor: Speed of decision-making when urgency is required',
        'Develop: Intuitive judgment and rapid response capabilities',
        'Leverage: Analytical depth in strategic decisions'
      ];
      break;

    case 'Balanced':
      insights.strengths = [
        'Flexible decision-making approach based on context',
        'Can adapt between quick and thorough analysis as needed',
        'Good at knowing when to trust intuition vs. analyze deeply',
        'Skilled at balancing speed with accuracy',
        'Effective in various types of situations and environments'
      ];
      insights.weaknesses = [
        'May struggle to identify which approach is optimal',
        'Can experience uncertainty about decision-making method',
        'Might not excel at either extreme (speed or depth)',
        'May need more time to determine approach before deciding',
        'Can appear inconsistent in decision-making style'
      ];
      insights.improvements = [
        'Develop clear criteria for choosing decision approach',
        'Practice both quick assessment and deep analysis',
        'Work on recognizing situational cues faster',
        'Build confidence in switching between modes',
        'Learn to communicate your decision-making process clearly'
      ];
      insights.organizationalFit = [
        'Ideal for: General management, project leadership, diverse roles, consulting',
        'Team contribution: Provides adaptable approach to various challenges',
        'Leadership style: Flexible, situational, balanced'
      ];
      insights.continuousReview = [
        'Monitor: Effectiveness of approach selection in different contexts',
        'Develop: Both intuitive and analytical capabilities further',
        'Leverage: Adaptability across varying business situations'
      ];
      break;
  }

  return insights;
}

export function getAssessmentInsights(assessment: any): AssessmentInsights {
  if (assessment.score.kolb) {
    return generateKolbInsights(assessment.score.kolb.style, assessment.score.kolb.scores);
  } else if (assessment.score.sternberg) {
    return generateSternbergInsights(assessment.score.sternberg.style, assessment.score.sternberg.scores);
  } else if (assessment.score.dualProcess) {
    return generateDualProcessInsights(assessment.score.dualProcess.style, assessment.score.dualProcess.scores);
  }
  
  return {
    strengths: [],
    weaknesses: [],
    improvements: [],
    organizationalFit: [],
    continuousReview: []
  };
}
