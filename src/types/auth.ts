export type AccountStatus = 'pending' | 'approved' | 'rejected';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface UserProfile {
  status: AccountStatus;
  english_level: CEFRLevel;
  native_language: string;
  occupation: string;
  interests: string[];
  goals: string[];
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  profile: UserProfile;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  status: AccountStatus;
}

export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  profile?: Partial<UserProfile>;
  english_level?: CEFRLevel;
  native_language?: string;
  occupation?: string;
  interests?: string[];
  goals?: string[];
  avatar_url?: string | null;
}
