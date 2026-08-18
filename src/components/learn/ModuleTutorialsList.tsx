'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Clock,
  CheckCircle,
  Circle,
  FileText,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { LearningModuleDetail, Tutorial } from '@/types/learning';
import { Button } from '@/components/common/Button';

interface ModuleTutorialsListProps {
  module: LearningModuleDetail;
  onBack: () => void;
  onSelectTutorial: (tutorial: Tutorial) => void;
}

export function ModuleTutorialsList({
  module,
  onBack,
  onSelectTutorial,
}: ModuleTutorialsListProps) {
  const completedCount = module.tutorials.filter((t) => t.is_completed).length;
  const progressPercent = module.tutorials.length > 0
    ? Math.round((completedCount / module.tutorials.length) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-7xl mx-auto pb-8"
    >
      {/* Top Bar with Back Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all border border-gray-200/80 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to All Topics</span>
          </button>

          <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-soft)] px-2.5 py-0.5 rounded-full">
              {module.category_display}
            </span>
            <span className="text-xs text-gray-500 font-semibold hidden md:inline">
              {module.level_display}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Clock size={14} className="text-[var(--primary)]" />
          <span>{module.total_duration_minutes} Mins Total</span>
        </div>
      </div>

      {/* Module Overview Banner Card */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--primary)] text-white shadow-xs">
              {module.category_display}
            </span>
            <span className="text-xs text-sky-200 font-medium">
              {module.tutorials.length} Lessons Available
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {module.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
            {module.description}
          </p>

          {/* Progress Bar inside Banner */}
          <div className="pt-2 max-w-md space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-sky-200">
              <span>Your Progress</span>
              <span>{completedCount} / {module.tutorials.length} Completed ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Decorative Graphic Background */}
        <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-[var(--primary)]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Tutorials / Lessons List Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Tutorial Lessons
          </h2>
          <p className="text-xs text-gray-500">
            Select a tutorial to watch the video explanation and review study notes.
          </p>
        </div>
      </div>

      {/* Tutorials Cards List */}
      <div className="space-y-3">
        {module.tutorials.map((tutorial, index) => {
          return (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectTutorial(tutorial)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                tutorial.is_completed
                  ? 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/70'
                  : 'bg-white border-gray-100 hover:border-[var(--primary)]/30 hover:bg-sky-50/30 hover:shadow-sm'
              }`}
            >
              {/* Left Side: Lesson Number & Title/Summary */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Number or Checkmark Circle */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs transition-transform group-hover:scale-105 ${
                  tutorial.is_completed
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-[var(--primary-soft)] text-[var(--primary)]'
                }`}>
                  {tutorial.is_completed ? <CheckCircle size={18} /> : <span>{index + 1}</span>}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                      {tutorial.title}
                    </h3>
                    {tutorial.is_completed && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>

                  {tutorial.summary && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {tutorial.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-sky-600" />
                      {tutorial.duration_minutes} Mins
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} className="text-amber-600" />
                      Study Notes Included
                    </span>
                    {tutorial.practice_prompt && (
                      <span className="flex items-center gap-1 text-[var(--primary)] font-semibold">
                        <Sparkles size={12} />
                        AI Practice Prompt
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Action Button */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  variant={tutorial.is_completed ? 'secondary' : 'primary'}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5 shadow-xs"
                >
                  <Play size={13} className={tutorial.is_completed ? 'text-gray-700' : 'fill-white'} />
                  <span>{tutorial.is_completed ? 'Review Lesson' : 'Start Lesson'}</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
