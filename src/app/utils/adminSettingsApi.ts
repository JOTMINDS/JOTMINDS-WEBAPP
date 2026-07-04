export interface JotMindsAdminSettings {
  questionBankEnabled: boolean;
  scoringThresholds: {
    strongPreference: number;
    developingPreference: number;
    emergingPreference: number;
    growthOpportunity: number;
  };
  styleDescriptionsEnabled: boolean;
  careerMappingsEnabled: boolean;
  reportDisclaimerText: string;
  recommendationTextTemplate: string;
}

const DEFAULT_SETTINGS: JotMindsAdminSettings = {
  questionBankEnabled: true,
  scoringThresholds: {
    strongPreference: 30,
    developingPreference: 20,
    emergingPreference: 10,
    growthOpportunity: 0,
  },
  styleDescriptionsEnabled: true,
  careerMappingsEnabled: true,
  reportDisclaimerText: "Important Note: JotMinds provides evidence-informed insights based on user responses and established theories in education and psychology. It is designed to support self-awareness, learning, reflection, and development. It is not a medical, clinical, diagnostic, IQ, or psychometric certification tool, and should not be used as the sole basis for high-stakes decisions.",
  recommendationTextTemplate: "Career pathways that may align with your current profile",
};

const SETTINGS_KEY = 'jotminds_admin_settings';

export const getAdminSettings = (): JotMindsAdminSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error("Error loading admin settings", error);
  }
  
  return DEFAULT_SETTINGS;
};

export const saveAdminSettings = (settings: JotMindsAdminSettings): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving admin settings", error);
  }
};
