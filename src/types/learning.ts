export type LearningCategory = 
  | 'all' 
  | 'english_speaking' 
  | 'interview_prep' 
  | 'business_english' 
  | 'pronunciation' 
  | 'grammar_vocab';

export type LearningLevel = 'all' | 'beginner' | 'intermediate' | 'advanced';

export interface Tutorial {
  id: number;
  module: number;
  module_title: string;
  module_category: string;
  title: string;
  slug: string;
  video_url: string;
  duration_minutes: number;
  summary: string;
  notes: string;
  key_takeaways: string[];
  practice_prompt: string;
  order: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningModule {
  id: number;
  title: string;
  slug: string;
  category: LearningCategory;
  category_display: string;
  level: LearningLevel;
  level_display: string;
  description: string;
  thumbnail_url?: string;
  icon_name: string;
  estimated_hours: number;
  order: number;
  tutorial_count: number;
  total_duration_minutes: number;
  completed_tutorials_count: number;
  created_at: string;
}

export interface LearningModuleDetail extends LearningModule {
  tutorials: Tutorial[];
  updated_at: string;
}

export interface LearningStats {
  total_modules: number;
  total_tutorials: number;
  completed_tutorials: number;
  speaking_tutorials_count: number;
  interview_tutorials_count: number;
}
