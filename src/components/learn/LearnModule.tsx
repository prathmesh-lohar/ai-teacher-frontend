'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  MessageSquare,
  Briefcase,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Play,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { LearningModule, LearningModuleDetail, Tutorial, LearningCategory, LearningLevel } from '@/types/learning';
import { getLearningModules, getLearningModuleDetail } from '@/services/learningApi';
import { ModuleTutorialsList } from './ModuleTutorialsList';
import { VideoTutorialPlayer } from './VideoTutorialPlayer';
import { Button } from '@/components/common/Button';

interface LearnModuleProps {
  onStartPractice?: (topic?: string, mode?: 'voice' | 'text') => void;
}

const CATEGORY_TABS: { id: LearningCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'All Topics', icon: Layers },
  { id: 'english_speaking', label: 'English Speaking', icon: MessageSquare },
  { id: 'interview_prep', label: 'Interview Prep', icon: Briefcase },
  { id: 'business_english', label: 'Business English', icon: GraduationCap },
  { id: 'pronunciation', label: 'Pronunciation', icon: Sparkles },
];

export function LearnModule({ onStartPractice }: LearnModuleProps) {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<LearningCategory>('all');
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Module & Tutorial for Drill-down Navigation
  const [activeModuleDetail, setActiveModuleDetail] = useState<LearningModuleDetail | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const data = await getLearningModules({
        category: selectedCategory,
        level: selectedLevel,
        search: searchQuery,
      });
      setModules(data);
    } catch (err) {
      console.error('Failed to load modules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [selectedCategory, selectedLevel]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModules();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Step 1 -> Step 2: Click Topic to list all its tutorials
  const handleOpenModule = async (moduleId: number) => {
    try {
      setLoadingDetail(true);
      const detail = await getLearningModuleDetail(moduleId);
      setActiveModuleDetail(detail);
      setActiveTutorial(null); // Show the tutorials list first
    } catch (err) {
      console.error('Failed to load module detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Step 2 -> Step 3: Click a tutorial to open the dedicated video & notes player
  const handleSelectTutorial = (tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
  };

  const handleProgressUpdated = (tutorialId: number, isCompleted: boolean) => {
    // Update local active module detail state
    if (activeModuleDetail) {
      const updatedTutorials = activeModuleDetail.tutorials.map((t) =>
        t.id === tutorialId ? { ...t, is_completed: isCompleted } : t
      );
      setActiveModuleDetail({
        ...activeModuleDetail,
        tutorials: updatedTutorials,
      });
    }

    // Refresh module list counters
    setModules((prev) =>
      prev.map((mod) => {
        if (activeModuleDetail && mod.id === activeModuleDetail.id) {
          const delta = isCompleted ? 1 : -1;
          return {
            ...mod,
            completed_tutorials_count: Math.max(0, mod.completed_tutorials_count + delta),
          };
        }
        return mod;
      })
    );
  };

  // -------------------------------------------------------------
  // LEVEL 3: Dedicated Tutorial Video & Notes Player View
  // -------------------------------------------------------------
  if (activeModuleDetail && activeTutorial) {
    return (
      <VideoTutorialPlayer
        module={activeModuleDetail}
        tutorial={activeTutorial}
        onBack={() => {
          // Go back to Level 2 (tutorials list of this module)
          setActiveTutorial(null);
        }}
        onSelectTutorial={(tut) => setActiveTutorial(tut)}
        onStartPractice={onStartPractice}
        onProgressUpdated={handleProgressUpdated}
      />
    );
  }

  // -------------------------------------------------------------
  // LEVEL 2: Module/Topic Tutorials List View
  // -------------------------------------------------------------
  if (activeModuleDetail) {
    return (
      <ModuleTutorialsList
        module={activeModuleDetail}
        onBack={() => {
          // Go back to Level 1 (All Topics)
          setActiveModuleDetail(null);
          setActiveTutorial(null);
        }}
        onSelectTutorial={handleSelectTutorial}
      />
    );
  }

  // -------------------------------------------------------------
  // LEVEL 1: All Topics / Modules Grid View
  // -------------------------------------------------------------
  return (
    <div className="space-y-5 py-2 max-w-7xl mx-auto">
      
      {/* Category Tabs & Search Toolbar */}
      <div className="space-y-3">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20 scale-[1.02]'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Level Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics by keywords, grammar, or interview skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/80 rounded-xl text-xs text-gray-800 placeholder-gray-400 border border-gray-100 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
            />
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as LearningLevel)}
              className="px-3 py-2 bg-gray-50/80 rounded-xl text-xs font-medium text-gray-700 border border-gray-100 focus:outline-none focus:border-[var(--primary)] transition-all cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

      </div>

      {/* Topics / Modules Grid */}
      {loading || loadingDetail ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4 animate-pulse">
              <div className="h-44 bg-gray-200 rounded-2xl w-full" />
              <div className="h-5 bg-gray-200 rounded-md w-3/4" />
              <div className="h-4 bg-gray-100 rounded-md w-full" />
              <div className="h-10 bg-gray-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto space-y-3 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mx-auto">
            <BookOpen size={30} />
          </div>
          <h3 className="text-base font-bold text-gray-800">No topics found</h3>
          <p className="text-xs text-gray-500">
            Try adjusting your search filter or selecting another category tab above.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedLevel('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((module) => {
            const isCompleted = module.tutorial_count > 0 && module.completed_tutorials_count >= module.tutorial_count;
            const progressPercent = module.tutorial_count > 0
              ? Math.round((module.completed_tutorials_count / module.tutorial_count) * 100)
              : 0;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleOpenModule(module.id)}
                className="bg-white rounded-[26px] border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-gray-200"
              >
                <div>
                  {/* Module Thumbnail Banner */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={module.thumbnail_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop'}
                      alt={module.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badges on Thumbnail */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 text-gray-900 backdrop-blur-md shadow-sm">
                        {module.category_display}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize bg-black/50 text-white backdrop-blur-md border border-white/20">
                        {module.level_display}
                      </span>
                    </div>

                    {/* Progress Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <Clock size={13} className="text-sky-300" />
                        <span>{module.total_duration_minutes} mins total</span>
                      </div>
                      <span className="text-xs font-bold text-sky-200">
                        {module.completed_tutorials_count}/{module.tutorial_count} Lessons
                      </span>
                    </div>
                  </div>

                  {/* Module Details Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                      {module.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {module.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-medium text-gray-400">
                        <span>Topic Progress</span>
                        <span className="text-gray-700 font-bold">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            progressPercent === 100 ? 'bg-emerald-500' : 'bg-[var(--primary)]'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="p-5 pt-0">
                  <Button
                    variant="primary"
                    className="w-full justify-center gap-2 rounded-2xl py-2.5 shadow-sm text-xs font-bold pointer-events-none"
                  >
                    <span>View Lessons ({module.tutorial_count})</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
