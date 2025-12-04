import { LanguageOption } from "./types";

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ur', name: 'Urdu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'mai', name: 'Maithili' },
  { code: 'sat', name: 'Santali' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'ne', name: 'Nepali' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'kok', name: 'Konkani' },
  { code: 'doi', name: 'Dogri' },
  { code: 'mni', name: 'Manipuri' },
  { code: 'brx', name: 'Bodo' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'en', name: 'English' }
];

export const VOICE_OPTIONS = [
  { id: 'Kore', name: 'Kore (Balanced - Female)' },
  { id: 'Fenrir', name: 'Fenrir (Deep - Male)' },
  { id: 'Puck', name: 'Puck (Soft - Male)' },
  { id: 'Charon', name: 'Charon (Formal - Male)' },
  { id: 'Zephyr', name: 'Zephyr (Bright - Female)' }
];

export const FEATURES = [
  {
    title: "T5-Style Summarization",
    description: "Simplifies complex medical jargon into plain text using advanced abstractive summarization techniques.",
    icon: "FileText"
  },
  {
    title: "mBART-Level Translation",
    description: "High-accuracy neural machine translation for 22+ Indian regional languages, breaking communication barriers.",
    icon: "Globe"
  },
  {
    title: "Consent Guard",
    description: "Analyzes legal consent forms for risks and suggests experienced specialists for second opinions.",
    icon: "ShieldAlert"
  },
  {
    title: "Smart Voice (TTS)",
    description: "Reads prescriptions and summaries aloud with natural voice modulation for better accessibility.",
    icon: "Volume2"
  }
];

export const FAQ_ITEMS = [
  {
    question: "Is the translation accurate for medical terms?",
    answer: "Yes, our model is specifically fine-tuned on medical datasets to ensure accuracy. However, we always recommend it as a supplementary tool to professional interpreters for critical procedures."
  },
  {
    question: "Does it require an internet connection?",
    answer: "Currently, yes. ArogyaVani uses cloud-based AI to provide the most powerful summarization and translation capabilities available."
  },
  {
    question: "Is patient data stored?",
    answer: "No. We process documents in real-time and do not store any personal health information (PHI) on our servers, ensuring full privacy and HIPAA compliance."
  },
  {
    question: "How many languages are supported?",
    answer: "We currently support 22 Indian regional languages including Hindi, Kannada, Tamil, Telugu, Bengali, and more."
  }
];

export const LANDING_CONTENT = {
  hero: {
    title: "ArogyaVani",
    subtitle: "Your AI Health Companion",
    description: "Empowering patients with AI-driven insights. Summarize prescriptions, decode consent forms, and break language barriers with our advanced healthcare neural engine."
  },
  about: {
    title: "The Technology Behind The Care",
    text: "ArogyaVani integrates state-of-the-art Generative AI to perform tasks traditionally requiring massive compute power. We utilize advanced transformer architectures to provide T5-class summarization, mBART-class translation, and Coqui-style speech synthesis—all optimized for instant healthcare assistance."
  }
};
