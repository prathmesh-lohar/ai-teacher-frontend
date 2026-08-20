'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';
import { LearningModule } from '@/types/learning';
import { getLearningModules } from '@/services/learningApi';

const DEFAULT_MENTORS: Record<string, { name: string; seed: string }> = {
  english_speaking: { name: 'Dr. Sarah Smith', seed: 'Sarah' },
  interview_prep: { name: 'Michael Chang', seed: 'Michael' },
  business_english: { name: 'Victoria Sterling', seed: 'Victoria' },
  pronunciation: { name: 'David Miller', seed: 'David' },
  grammar_vocab: { name: 'Emma Watson', seed: 'Emma' },
};

interface ContinueLearningProps {
  modules?: LearningModule[];
  onSelectCourse?: (module: LearningModule) => void;
  onSeeAll?: () => void;
}

export function ContinueLearning({ modules: initialModules, onSelectCourse, onSeeAll }: ContinueLearningProps) {
  const [modulesList, setModulesList] = useState<LearningModule[]>(initialModules || []);
  const [loading, setLoading] = useState<boolean>(!initialModules || initialModules.length === 0);

  useEffect(() => {
    if (initialModules && initialModules.length > 0) {
      setModulesList(initialModules);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchModules = async () => {
      try {
        setLoading(true);
        const data = await getLearningModules();
        if (isMounted) {
          setModulesList(data);
        }
      } catch (err) {
        console.error('Failed to fetch learning modules for Continue Learning:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchModules();
    return () => {
      isMounted = false;
    };
  }, [initialModules]);

  return (
    <section aria-label="Active Courses" className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-lg text-[var(--text-heading)]">Continue Learning</h2>
          <p className="text-[11px] text-[var(--text-sub)] mt-0.5">Resume your structured speaking modules & interactive drills</p>
        </div>
        <button 
          onClick={onSeeAll}
          className="text-[var(--primary)] text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 group"
        >
          <span>See All Topics</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="min-w-[280px] max-w-[280px] bg-white rounded-3xl p-4 border border-gray-100 shadow-xs flex-shrink-0 animate-pulse space-y-3">
              <div className="h-32 bg-gray-100 rounded-2xl" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-2 bg-gray-100 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : modulesList.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
          <Layers size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-xs text-gray-500">No active learning modules found.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {modulesList.map((module) => {
            const mentorInfo = DEFAULT_MENTORS[module.category] || { name: 'Fluent AI Coach', seed: 'Coach' };
            const progressPercent = module.tutorial_count > 0
              ? Math.round((module.completed_tutorials_count / module.tutorial_count) * 100)
              : 0;

            const badgeVariant = module.category === 'english_speaking'
              ? 'speaking'
              : module.category === 'interview_prep'
              ? 'grammar'
              : 'vocabulary';

            return (
              <motion.article
                key={module.id}
                whileHover={{ y: -5 }}
                onClick={() => onSelectCourse?.(module)}
                className="min-w-[285px] max-w-[285px] bg-white rounded-[22px] p-3.5 border border-gray-100/90 shadow-xs group cursor-pointer hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300 flex-shrink-0 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Banner with Play Overlay */}
                  <div className="h-32 bg-slate-900 rounded-2xl mb-3 overflow-hidden relative shadow-inner">
                    <img 
                      src={module.thumbnail_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop'} 
                      alt={module.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Duration Chip */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
                      <Clock size={10} className="text-cyan-300" />
                      <span>{module.total_duration_minutes || 15}m</span>
                    </div>

                    {/* Play Hover Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-2xs">
                      <div className="w-10 h-10 rounded-full bg-white text-[var(--primary)] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play size={16} className="fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Category & Lessons Count */}
                  <div className="flex items-center justify-between">
                    <Badge variant={badgeVariant}>
                      {module.category_display || module.category}
                    </Badge>
                    <span className="text-[10px] font-extrabold text-[var(--text-sub)]">
                      {module.completed_tutorials_count}/{module.tutorial_count} Lessons
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-extrabold mt-2 text-[var(--text-heading)] leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                    {module.title}
                  </h3>
                  
                  {/* Coach / Mentor */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-100 flex-shrink-0">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentorInfo.seed}`} 
                        alt={`${mentorInfo.name}'s avatar`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] text-[var(--text-sub)] font-semibold truncate">Coach {mentorInfo.name}</span>
                  </div>
                </div>

                {/* Progress Bar Footer */}
                <div className="mt-4 pt-2.5 border-t border-gray-50">
                  <div className="flex justify-between text-[10px] font-bold text-[var(--text-sub)] mb-1.5">
                    <span>Topic Mastery</span>
                    <span className="text-[var(--text-heading)] font-extrabold">{progressPercent}%</span>
                  </div>
                  <div className="bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={cn(
                        "h-full rounded-full transition-all",
                        progressPercent === 100 
                          ? 'bg-emerald-500' 
                          : module.category === 'english_speaking' 
                          ? 'bg-blue-500' 
                          : module.category === 'interview_prep' 
                          ? 'bg-orange-500' 
                          : 'bg-purple-500'
                      )} 
                    />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ContinueLearning;
