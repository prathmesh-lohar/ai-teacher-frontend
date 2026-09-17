import { apiFetch } from './api';
import type { AdminTokenUsageResponse, PlanType, UpdatePlanResponse } from '@/types/tokenUsage';

/**
 * Fetches platform-wide token analytics, model breakdown, user token usage, and recent logs.
 * Requires admin / staff privileges.
 */
export async function fetchAdminTokenUsage(): Promise<AdminTokenUsageResponse> {
  return apiFetch<AdminTokenUsageResponse>('/api/accounts/admin/token-usage/');
}

/**
 * Updates a user's subscription plan (free, starter, pro, enterprise).
 * Requires admin / staff privileges.
 */
export async function updateUserPlan(userId: number, plan: PlanType): Promise<UpdatePlanResponse> {
  return apiFetch<UpdatePlanResponse>(`/api/accounts/admin/users/${userId}/plan/`, {
    method: 'PATCH',
    body: JSON.stringify({ plan }),
  });
}
