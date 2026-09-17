// ─────────────────────────────────────────────────────────────────────────────
// Interview Module Types
// ─────────────────────────────────────────────────────────────────────────────

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead_exec';
export type ModuleType = 'single' | 'panel';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface ScriptQuestion {
  id: number;
  order: number;
  speaker_name: string;
  question_text: string;
  expected_answer_hint: string;
  time_limit_seconds: number;
}

export interface InterviewModule {
  id: number;
  title: string;
  description: string;
  module_type: ModuleType;
  field: string;
  target_role: string;
  experience_level: ExperienceLevel;
  interview_types: string[];
  interviewer_name: string;
  is_published: boolean;
  created_by: number | null;
  created_by_username: string | null;
  created_at: string;
  updated_at: string;
  questions: ScriptQuestion[];
  question_count: number;
}

// Write payload (for creating/updating a module)
export interface InterviewModulePayload {
  title: string;
  description?: string;
  module_type?: ModuleType;
  field: string;
  target_role?: string;
  experience_level?: ExperienceLevel;
  interview_types?: string[];
  interviewer_name?: string;
  is_published?: boolean;
  questions?: Omit<ScriptQuestion, 'id'>[];
}

export interface InterviewSession {
  id: number;
  module: number;
  module_title: string;
  module_field: string;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
  has_report: boolean;
}

export interface SessionAnswer {
  question_id: number;
  answer_text: string;
  audio_duration_s: number;
  was_skipped: boolean;
}

export interface QuestionFeedback {
  question: string;
  answer: string;
  score: number;
  tip: string;
  ideal_answer?: string;
}

export interface InterviewReport {
  id: number;
  session_id: number;
  module_title: string;
  overall_score: number;
  summary: string;
  question_feedback: QuestionFeedback[];
  generated_at: string;
}
