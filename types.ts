export interface AnalysisResult {
  summary: string;
  documentType: 'Prescription' | 'Consent Form' | 'Lab Report' | 'Other';
  consentAnalysis?: {
    risks: string[];
    missingClauses: string[];
    suggestion: string;
    complexityScore: number; // 1-10
  };
  doctorRecommendations: {
    specialty: string;
    reason: string;
    urgency: 'Routine' | 'Urgent' | 'Immediate';
  }[];
  rawText?: string;
}

export interface TranslationResult {
  language: string;
  translatedText: string;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  audioData: string | null; // Base64 audio
}

export enum AppState {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD'
}

export interface LanguageOption {
  code: string;
  name: string;
}
