import { apiFetch } from '@/services/api';
import { LearningModule, LearningModuleDetail, Tutorial, LearningStats } from '@/types/learning';

export async function getLearningModules(params?: { category?: string; level?: string; search?: string }): Promise<LearningModule[]> {
  const queryParams = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    queryParams.append('category', params.category);
  }
  if (params?.level && params.level !== 'all') {
    queryParams.append('level', params.level);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const queryStr = queryParams.toString();
  const endpoint = `/api/learning/modules/${queryStr ? `?${queryStr}` : ''}`;
  return apiFetch<LearningModule[]>(endpoint);
}

export async function getLearningModuleDetail(identifier: string | number): Promise<LearningModuleDetail> {
  return apiFetch<LearningModuleDetail>(`/api/learning/modules/${identifier}/`);
}

export async function getTutorialDetail(tutorialId: number): Promise<Tutorial> {
  return apiFetch<Tutorial>(`/api/learning/tutorials/${tutorialId}/`);
}

export async function toggleTutorialCompleted(tutorialId: number): Promise<{
  tutorial_id: number;
  is_completed: boolean;
  completed_at: string | null;
  message: string;
}> {
  return apiFetch<{
    tutorial_id: number;
    is_completed: boolean;
    completed_at: string | null;
    message: string;
  }>(`/api/learning/tutorials/${tutorialId}/complete/`, {
    method: 'POST',
  });
}

export async function getTutorials(params?: { category?: string; limit?: number }): Promise<Tutorial[]> {
  const queryParams = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    queryParams.append('category', params.category);
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const queryStr = queryParams.toString();
  const endpoint = `/api/learning/tutorials/${queryStr ? `?${queryStr}` : ''}`;
  return apiFetch<Tutorial[]>(endpoint);
}

export async function getLearningStats(): Promise<LearningStats> {
  return apiFetch<LearningStats>('/api/learning/stats/');
}
