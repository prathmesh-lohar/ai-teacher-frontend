export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

export interface TokenUsageSummary {
  total_tokens: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_requests: number;
  active_users_count: number;
  total_users_count: number;
}

export interface ModelUsageStat {
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  request_count: number;
  percentage: number;
}

export interface UserTokenUsage {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string | null;
  plan: PlanType;
  status: string;
  is_staff: boolean;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  request_count: number;
  last_active?: string | null;
  date_joined?: string;
}

export interface RecentTokenActivity {
  id: number;
  username: string;
  model_name: string;
  feature: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  created_at: string;
}

export interface AdminTokenUsageResponse {
  summary: TokenUsageSummary;
  models: ModelUsageStat[];
  users: UserTokenUsage[];
  recent_activity: RecentTokenActivity[];
}

export interface UpdatePlanResponse {
  success: boolean;
  user_id: number;
  username: string;
  plan: PlanType;
  message: string;
}
