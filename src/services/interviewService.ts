import { API_BASE_URL } from '@/config/env';
import { getStoredTokens } from './api';
import type {
  InterviewModule,
  InterviewModulePayload,
  InterviewSession,
  SessionAnswer,
  InterviewReport,
} from '@/types/interview';

const BASE = `${API_BASE_URL}/api/interview`;

async function authFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const { access } = getStoredTokens();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || data?.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as T;
}

// ─── MODULE APIs ───────────────────────────────────────────────────────────

/** List published modules filtered by current user's profile */
export async function fetchUserModules(field?: string): Promise<InterviewModule[]> {
  const url = field ? `${BASE}/modules/?field=${encodeURIComponent(field)}` : `${BASE}/modules/`;
  return authFetch<InterviewModule[]>(url);
}

/** Admin: list ALL modules including unpublished */
export async function fetchAdminModules(): Promise<InterviewModule[]> {
  return authFetch<InterviewModule[]>(`${BASE}/modules/admin/`);
}

/** Get single module detail with full script */
export async function fetchModuleDetail(id: number): Promise<InterviewModule> {
  return authFetch<InterviewModule>(`${BASE}/modules/${id}/`);
}

/** Admin: create a new module */
export async function createModule(payload: InterviewModulePayload): Promise<InterviewModule> {
  return authFetch<InterviewModule>(`${BASE}/modules/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Admin: update a module (partial) */
export async function updateModule(id: number, payload: Partial<InterviewModulePayload>): Promise<InterviewModule> {
  return authFetch<InterviewModule>(`${BASE}/modules/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** Admin: delete a module */
export async function deleteModule(id: number): Promise<void> {
  return authFetch<void>(`${BASE}/modules/${id}/`, { method: 'DELETE' });
}

// ─── SESSION APIs ──────────────────────────────────────────────────────────

/** Start a new interview session for a module */
export async function startSession(moduleId: number): Promise<InterviewSession> {
  return authFetch<InterviewSession>(`${BASE}/sessions/`, {
    method: 'POST',
    body: JSON.stringify({ module_id: moduleId }),
  });
}

/** List current user's past sessions */
export async function fetchUserSessions(): Promise<InterviewSession[]> {
  return authFetch<InterviewSession[]>(`${BASE}/sessions/`);
}

/** Mark session as completed or abandoned */
export async function updateSession(
  sessionId: number,
  status: 'completed' | 'abandoned'
): Promise<InterviewSession> {
  return authFetch<InterviewSession>(`${BASE}/sessions/${sessionId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/** Bulk-submit all answers for a session */
export async function submitAnswers(
  sessionId: number,
  answers: SessionAnswer[]
): Promise<{ saved: number }> {
  return authFetch<{ saved: number }>(`${BASE}/sessions/${sessionId}/answers/`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

/** Fetch report for a completed session (generates lazily via LLM if needed) */
export async function fetchReport(sessionId: number): Promise<InterviewReport> {
  return authFetch<InterviewReport>(`${BASE}/sessions/${sessionId}/report/`);
}

// ─── AI SCRIPT GENERATOR ───────────────────────────────────────────────────

export interface GenerateScriptPayload {
  title: string;
  field: string;
  target_role: string;
  experience_level: string;
  interview_types: string[];
  interviewer_name: string;
  description?: string;
  question_count?: number;
  focus_instructions?: string;
}

export interface GeneratedQuestionItem {
  order: number;
  speaker_name: string;
  question_text: string;
  expected_answer_hint: string;
  time_limit_seconds: number;
}

export const generateScriptWithAI = async (
  payload: GenerateScriptPayload
): Promise<{
  questions: GeneratedQuestionItem[];
  source: string;
}> => {
  return authFetch(`${BASE}/modules/generate-script/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/** Transcribe user audio blob via backend Groq Whisper STT */
export async function transcribeAudioBlob(blob: Blob, language: string = 'en'): Promise<string> {
  const { access } = getStoredTokens();
  const formData = new FormData();
  formData.append('audio', blob, 'answer.webm');
  formData.append('language', language);

  const res = await fetch(`${API_BASE_URL}/api/ai/stt/transcribe/`, {
    method: 'POST',
    headers: {
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`STT HTTP error ${res.status}`);
  }
  const data = await res.json();
  return data.text || '';
}

const interviewService = {
  fetchUserModules,
  fetchAdminModules,
  fetchModuleDetail,
  createModule,
  updateModule,
  deleteModule,
  startSession,
  fetchUserSessions,
  updateSession,
  submitAnswers,
  fetchReport,
  generateScriptWithAI,
  transcribeAudioBlob,
};

export default interviewService;
