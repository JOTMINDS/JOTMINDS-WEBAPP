/**
 * Dynamic Text Variation System
 * Generates varied, theory-driven, but non-clinical phrasing for assessment reports.
 */

// Helper to pick a random item from an array
const sample = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const getOrganizationalAssessmentText = (
  type: string,
  mainStyle: string,
  fitRequirement: string
): string => {
  const style = mainStyle.toLowerCase();
  const fit = fitRequirement.toLowerCase() || 'diverse capabilities';

  const variations = {
    kolb: [
      `This individual demonstrates ${style} learning agility, making them well-suited for roles requiring ${fit}. Focus on leveraging their natural strengths while developing complementary skills for maximum organizational value.`,
      `With a tendency towards ${style} processing, this profile suggests a strong fit for environments that demand ${fit}. Consider pairing them with team members who have complementary approaches to maximize overall effectiveness.`,
      `Their profile points toward an inclination for ${style} learning. They are likely to thrive in positions where ${fit} is a priority. Targeted development can help them expand their repertoire of learning strategies.`
    ],
    sternberg: [
      `With a ${style} thinking orientation, this profile indicates strong capabilities in ${fit}. Strategic placement in appropriate roles and targeted development can maximize both individual and organizational performance.`,
      `This individual's answers suggest a preference for ${style} problem-solving, which aligns well with tasks involving ${fit}. They can provide significant value when allowed to apply this preferred cognitive strategy.`,
      `Demonstrating a primary inclination for ${style} processing, they are well-equipped to handle responsibilities that center on ${fit}. Encourage cross-functional collaboration to leverage their unique perspective.`
    ],
    'dual-process': [
      `The ${style} decision-making profile suggests effective performance in ${fit}. Consider role alignment and training to optimize decision quality across different business scenarios.`,
      `Their approach indicates a natural lean toward ${style} judgments, making them highly capable in situations requiring ${fit}. Providing the right context will enable them to make optimal choices.`,
      `With an inclination for ${style} cognitive processing, this individual shows potential for excelling in areas demanding ${fit}. Awareness of their decision-making style is key to their continued professional growth.`
    ]
  };

  const selectedVariations = variations[type as keyof typeof variations] || variations['kolb'];
  return sample(selectedVariations);
};

export const getPersonalDevelopmentText = (
  mainStyle: string,
  improvement: string
): string => {
  const style = mainStyle;
  const area = improvement?.toLowerCase() || 'developing new strategies';

  const variations = [
    `Your ${style} profile is a strength to build upon. Focus on ${area} while leveraging your natural abilities. The detailed analysis below provides specific strategies for your growth journey.`,
    `Your answers indicate a primary preference for ${style}. While this is a valuable asset, paying attention to ${area} can round out your capabilities. Explore the insights below to discover how to expand your potential.`,
    `You typically lean towards a ${style} approach. You can enhance your effectiveness by working on ${area}. The customized strategies provided here will serve as a guide for your continued development.`
  ];

  return sample(variations);
};

export const getFrameworkExplanation = (type: string): string => {
  switch (type) {
    case 'learning':
    case 'kolb':
      return "This module looks at how you process new information—whether through hands-on experience, observation, conceptualizing, or active testing. It is guided by the principles of Experiential Learning.";
    case 'thinking':
    case 'sternberg':
      return "This module examines your approach to problem-solving, exploring analytical, creative, and practical methods. It draws upon foundational theories of human intelligence.";
    case 'decision':
    case 'dual-process':
      return "This module maps out how you navigate choices, balancing fast, intuitive reactions against slower, deliberate reasoning. It is informed by Dual Process models of cognition.";
    default:
      return "This assessment helps you understand your unique cognitive profile.";
  }
};

export const getCareerDisclaimer = (): string => {
  const variations = [
    "Please note: Interests and aptitudes naturally evolve over time. Use these suggestions as a starting point for discovery rather than a strict roadmap.",
    "Keep in mind that career paths are rarely linear. These pathways align with your current preferences but are meant for exploration, not prescription.",
    "Remember: Your profile is dynamic. These suggestions are designed to inspire your thinking about potential futures, not to limit your options."
  ];
  return sample(variations);
};

export const GLOBAL_DISCLAIMER = "Important Note: JotMinds offers research-backed insights derived from your responses and foundational educational theories. Our tools aim to foster self-discovery, learning, and reflection. They do not constitute clinical diagnoses, medical advice, IQ metrics, or formal psychological evaluations, and shouldn't be the primary factor in critical life choices.";
