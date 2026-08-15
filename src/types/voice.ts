export type ConversationState =
  | 'idle'
  | 'ai_thinking'
  | 'ai_speaking'
  | 'user_speaking'
  | 'user_processing'
  | 'interrupted'
  | 'ended';

export type CorrectionMode = 'realtime' | 'after_session';

export interface LanguageMistake {
  id?: number;
  original_text: string;
  corrected_text: string;
  explanation: string;
  native_explanation?: string;
  category: string;
  severity: 'minor' | 'moderate' | 'severe';
}

export interface NativeLanguageOption {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  badge?: string;
  langCode: string;
  listenLabel?: string;
  edgeVoice?: string;
}

export const NATIVE_LANGUAGES: NativeLanguageOption[] = [
  { id: 'Hindi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', badge: 'Popular', langCode: 'hi-IN', listenLabel: 'हिन्दी में सुनें (Listen in Hindi)', edgeVoice: 'hi-IN-SwaraNeural' },
  { id: 'Hinglish', name: 'Hinglish', nativeName: 'Hinglish', flag: '🇮🇳', badge: 'Conversational', langCode: 'hi-IN', listenLabel: 'Hinglish में सुनें', edgeVoice: 'hi-IN-SwaraNeural' },
  { id: 'Marathi', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', langCode: 'mr-IN', listenLabel: 'मराठीत ऐका (Listen in Marathi)', edgeVoice: 'mr-IN-AarohiNeural' },
  { id: 'Bengali', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', langCode: 'bn-IN', listenLabel: 'বাংলায় শুনুন (Listen in Bengali)', edgeVoice: 'bn-IN-TanishaaNeural' },
  { id: 'Telugu', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', langCode: 'te-IN', listenLabel: 'తెలుగులో వినండి (Listen in Telugu)', edgeVoice: 'te-IN-ShrutiNeural' },
  { id: 'Tamil', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', langCode: 'ta-IN', listenLabel: 'தமிழில் கேட்க (Listen in Tamil)', edgeVoice: 'ta-IN-PallaviNeural' },
  { id: 'Gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', langCode: 'gu-IN', listenLabel: 'ગુજરાતીમાં સાંભળો (Listen in Gujarati)', edgeVoice: 'gu-IN-DhwaniNeural' },
  { id: 'Kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', langCode: 'kn-IN', listenLabel: 'ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ (Listen in Kannada)', edgeVoice: 'kn-IN-SapnaNeural' },
  { id: 'Spanish', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', langCode: 'es-ES', listenLabel: 'Escuchar en Español', edgeVoice: 'es-ES-ElviraNeural' },
  { id: 'None', name: 'English Only', nativeName: 'English', flag: '🌐', langCode: 'en-IN', listenLabel: 'Listen in English', edgeVoice: 'en-IN-NeerjaNeural' },
];

export interface ConversationTurn {
  id?: number;
  turn_index: number;
  speaker: 'user' | 'assistant' | 'system';
  transcript: string;
  interrupted?: boolean;
  mistakes?: LanguageMistake[];
}

export interface SessionReportData {
  session_id: string;
  overall_score: number;
  grammar_score: number;
  vocabulary_score: number;
  fluency_score: number;
  confidence_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  practice_plan: string[];
  duration_seconds?: number;
}

export interface VoiceSocketEvent {
  type: string;
  [key: string]: any;
}

export type TTSProviderId = 'gtts' | 'edge' | 'piper' | 'groq' | 'elevenlabs';

export interface TTSVoiceOption {
  id: string;
  name: string;
  accent: string;
  flag: string;
  gender?: 'Female' | 'Male' | 'Neutral';
}

export interface TTSProviderConfig {
  id: TTSProviderId;
  name: string;
  description: string;
  badge: string;
  defaultVoice: string;
  voices: TTSVoiceOption[];
}

export const TTS_PROVIDERS: TTSProviderConfig[] = [
  {
    id: 'piper',
    name: 'Piper Neural (Local / Offline)',
    description: 'Ultra-fast local neural ONNX synthesis with zero latency',
    badge: 'Local Neural',
    defaultVoice: 'en_US-lessac-medium',
    voices: [
      { id: 'en_US-lessac-medium', name: 'Lessac (US Neutral)', accent: 'United States', flag: '🇺🇸', gender: 'Female' },
      { id: 'en_US-amy-medium', name: 'Amy (US Expressive)', accent: 'United States', flag: '🇺🇸', gender: 'Female' },
      { id: 'en_US-ryan-medium', name: 'Ryan (US Male)', accent: 'United States', flag: '🇺🇸', gender: 'Male' },
      { id: 'en_GB-alan-medium', name: 'Alan (UK Male)', accent: 'United Kingdom', flag: '🇬🇧', gender: 'Male' },
      { id: 'en_GB-jenny_dioco-medium', name: 'Jenny (UK Female)', accent: 'United Kingdom', flag: '🇬🇧', gender: 'Female' },
      { id: 'hi_IN-pratham-medium', name: 'Pratham (Hindi / Indian)', accent: 'India (Hindi)', flag: '🇮🇳', gender: 'Male' },
      { id: 'hi_IN-rohan-medium', name: 'Rohan (Hindi / Indian)', accent: 'India (Hindi)', flag: '🇮🇳', gender: 'Male' },
    ],
  },
  {
    id: 'edge',
    name: 'Microsoft Edge Neural',
    description: 'High-definition neural speech with natural Indian voices',
    badge: 'HD Neural',
    defaultVoice: 'en-IN-NeerjaNeural',
    voices: [
      { id: 'en-IN-NeerjaNeural', name: 'Neerja (Indian)', accent: 'India (en-IN)', flag: '🇮🇳', gender: 'Female' },
      { id: 'en-IN-PrabhatNeural', name: 'Prabhat (Indian)', accent: 'India (en-IN)', flag: '🇮🇳', gender: 'Male' },
      { id: 'en-US-AriaNeural', name: 'Aria (US)', accent: 'United States', flag: '🇺🇸', gender: 'Female' },
      { id: 'en-US-GuyNeural', name: 'Guy (US)', accent: 'United States', flag: '🇺🇸', gender: 'Male' },
      { id: 'en-GB-SoniaNeural', name: 'Sonia (UK)', accent: 'United Kingdom', flag: '🇬🇧', gender: 'Female' },
      { id: 'en-GB-RyanNeural', name: 'Ryan (UK)', accent: 'United Kingdom', flag: '🇬🇧', gender: 'Male' },
      { id: 'en-AU-NatashaNeural', name: 'Natasha (AU)', accent: 'Australia', flag: '🇦🇺', gender: 'Female' },
    ],
  },
  {
    id: 'gtts',
    name: 'Google TTS (gTTS)',
    description: 'Ultra-reliable Google Text-to-Speech with Indian accent',
    badge: 'Popular',
    defaultVoice: 'en-in',
    voices: [
      { id: 'en-in', name: 'Indian English', accent: 'India (en-IN)', flag: '🇮🇳', gender: 'Female' },
      { id: 'en-us', name: 'US English', accent: 'United States', flag: '🇺🇸', gender: 'Female' },
      { id: 'en-uk', name: 'British English', accent: 'United Kingdom', flag: '🇬🇧', gender: 'Female' },
      { id: 'en-au', name: 'Australian English', accent: 'Australia', flag: '🇦🇺', gender: 'Female' },
      { id: 'en-ca', name: 'Canadian English', accent: 'Canada', flag: '🇨🇦', gender: 'Female' },
      { id: 'hi-in', name: 'Hinglish / Hindi', accent: 'India (Hindi)', flag: '🇮🇳', gender: 'Female' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq Orpheus TTS',
    description: 'Sub-second real-time conversational streaming',
    badge: 'Ultra Fast',
    defaultVoice: 'autumn',
    voices: [
      { id: 'autumn', name: 'Autumn', accent: 'US Natural', flag: '🇺🇸', gender: 'Female' },
      { id: 'diana', name: 'Diana', accent: 'US Expressive', flag: '🇺🇸', gender: 'Female' },
      { id: 'hannah', name: 'Hannah', accent: 'US Warm', flag: '🇺🇸', gender: 'Female' },
      { id: 'austin', name: 'Austin', accent: 'US Casual', flag: '🇺🇸', gender: 'Male' },
      { id: 'daniel', name: 'Daniel', accent: 'US Deep', flag: '🇺🇸', gender: 'Male' },
      { id: 'todd', name: 'Todd', accent: 'US Conversational', flag: '🇺🇸', gender: 'Male' },
    ],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs Studio',
    description: 'Hyper-realistic AI voices (Requires API key)',
    badge: 'Premium',
    defaultVoice: '21m00Tcm4TlvDq8ikWAM',
    voices: [
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', accent: 'American Calm', flag: '🇺🇸', gender: 'Female' },
      { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', accent: 'American Strong', flag: '🇺🇸', gender: 'Female' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', accent: 'American Soft', flag: '🇺🇸', gender: 'Female' },
      { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', accent: 'American Well-rounded', flag: '🇺🇸', gender: 'Male' },
      { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', accent: 'American Deep', flag: '🇺🇸', gender: 'Male' },
    ],
  },
];

