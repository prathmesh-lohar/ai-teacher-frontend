'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  CheckCircle,
  Circle,
  FileText,
  Lightbulb,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Share2,
  Check,
  ArrowLeft,
  Mic,
  MessageSquare,
  Search,
  Globe
} from 'lucide-react';
import { Tutorial, LearningModuleDetail } from '@/types/learning';
import { toggleTutorialCompleted } from '@/services/learningApi';
import { Button } from '@/components/common/Button';

interface VideoTutorialPlayerProps {
  module: LearningModuleDetail;
  tutorial: Tutorial;
  onBack: () => void;
  onSelectTutorial: (tutorial: Tutorial) => void;
  onStartPractice?: (topic?: string, mode?: 'voice' | 'text') => void;
  onProgressUpdated?: (tutorialId: number, isCompleted: boolean) => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0`;
  }
  return null;
}

export function VideoTutorialPlayer({
  module,
  tutorial,
  onBack,
  onSelectTutorial,
  onStartPractice,
  onProgressUpdated,
}: VideoTutorialPlayerProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'takeaways' | 'practice'>('notes');
  const [isCompleted, setIsCompleted] = useState(tutorial.is_completed);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedUrl = getYouTubeEmbedUrl(tutorial.video_url);

  const currentIndex = module.tutorials.findIndex((t) => t.id === tutorial.id);
  const prevTutorial = currentIndex > 0 ? module.tutorials[currentIndex - 1] : null;
  const nextTutorial = currentIndex < module.tutorials.length - 1 ? module.tutorials[currentIndex + 1] : null;

  const handleToggleComplete = async () => {
    try {
      setIsUpdating(true);
      const res = await toggleTutorialCompleted(tutorial.id);
      setIsCompleted(res.is_completed);
      if (onProgressUpdated) {
        onProgressUpdated(tutorial.id, res.is_completed);
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 max-w-7xl mx-auto pb-8"
    >
      {/* Top Navigation & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all border border-gray-200/80 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Tutorials</span>
          </button>
          
          <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-soft)] px-2.5 py-0.5 rounded-full">
              {module.category_display}
            </span>
            <span className="text-xs text-gray-400 font-medium hidden md:inline">
              {module.title} • Lesson {currentIndex + 1} of {module.tutorials.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Mark as Completed Button */}
          <button
            onClick={handleToggleComplete}
            disabled={isUpdating}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-400 hover:text-emerald-600'
            }`}
          >
            {isCompleted ? <CheckCircle size={15} /> : <Circle size={15} />}
            <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
            title="Share Lesson"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Dedicated Workspace (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Video Player, Title, Summary & Module Lessons (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Video Container */}
          <div className="relative aspect-video w-full bg-black rounded-[24px] overflow-hidden shadow-md border border-gray-900">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={tutorial.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                src={tutorial.video_url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Lesson Details Card */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {tutorial.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold shrink-0">
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-sky-600" />
                  {tutorial.duration_minutes} Minutes
                </span>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${tutorial.title} ${module.category_display} tutorial guide`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-[var(--primary)] text-xs font-semibold border border-gray-200 transition-all cursor-pointer shadow-2xs"
                  title="Search more about this topic on Google"
                >
                  <Search size={13} className="text-sky-600" />
                  <span>Search on Google</span>
                  <ExternalLink size={11} className="text-gray-400" />
                </a>
              </div>
            </div>

            {tutorial.summary && (
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                {tutorial.summary}
              </p>
            )}

            {/* More About This Topic Section */}
            <div className="bg-sky-50/50 rounded-2xl p-3.5 border border-sky-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                  <Globe size={13} className="text-sky-600" />
                  More About This Topic
                </span>
                <span className="text-[10px] text-sky-600 font-medium">Explore on Google</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  `${tutorial.title} examples`,
                  `${tutorial.title} practice exercises`,
                  `${tutorial.title} common mistakes`,
                ].map((query, idx) => (
                  <a
                    key={idx}
                    href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-sky-100/60 text-sky-800 text-[11px] font-medium border border-sky-200/60 transition-all shadow-2xs"
                  >
                    <Search size={11} className="text-sky-500" />
                    <span>{query}</span>
                    <ExternalLink size={9} className="opacity-50" />
                  </a>
                ))}
              </div>
            </div>

            {/* Course Playlist Nav */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Course Lessons ({module.tutorials.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => prevTutorial && onSelectTutorial(prevTutorial)}
                    disabled={!prevTutorial}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/60 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>
                  <button
                    onClick={() => nextTutorial && onSelectTutorial(nextTutorial)}
                    disabled={!nextTutorial}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/60 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {module.tutorials.map((item, idx) => {
                  const isSelected = item.id === tutorial.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectTutorial(item)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-bold border border-[var(--primary)]/20 shadow-xs'
                          : 'hover:bg-gray-50 text-gray-700 font-medium bg-gray-50/40 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-gray-400 font-medium">{item.duration_minutes}m</span>
                        {item.is_completed && <CheckCircle size={14} className="text-emerald-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Tabbed Notes, Takeaways & AI Practice (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* Tab Selection */}
          <div className="flex items-center border-b border-gray-100 px-4 pt-3 bg-gray-50/60 gap-2">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'notes'
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-white shadow-xs'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText size={14} />
              <span>Study Notes</span>
            </button>

            <button
              onClick={() => setActiveTab('takeaways')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'takeaways'
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-white shadow-xs'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Lightbulb size={14} />
              <span>Takeaways</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'practice'
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-white shadow-xs'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Sparkles size={14} />
              <span>AI Practice</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
            
            {/* Tab 1: Notes & Dialogue Scripts */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-sans">
                  <div className="whitespace-pre-line text-xs sm:text-sm font-normal text-gray-800 space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                    {tutorial.notes}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Key Takeaways */}
            {activeTab === 'takeaways' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Key Takeaways & Core Concepts
                </h4>
                {tutorial.key_takeaways && tutorial.key_takeaways.length > 0 ? (
                  <div className="space-y-2.5">
                    {tutorial.key_takeaways.map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100/80 text-xs text-amber-950 font-medium leading-relaxed"
                      >
                        <div className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                          {i + 1}
                        </div>
                        <span>{point}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No takeaways listed for this lesson.</p>
                )}
              </div>
            )}

            {/* Tab 3: AI Practice Prompt */}
            {activeTab === 'practice' && (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shadow-xs">
                    <Sparkles size={22} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    Practice This Topic Live with AI
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Reinforce what you just learned in this video by speaking in real-time with FluentAI.
                  </p>

                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
                      Suggested Speaking Scenario:
                    </span>
                    <p className="text-xs font-semibold text-gray-800 leading-relaxed italic">
                      "{tutorial.practice_prompt || `Let's practice the core scenario and phrases from ${tutorial.title}.`}"
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2.5">
                  {/* Voice Drill Button */}
                  <Button
                    variant="primary"
                    className="w-full justify-center gap-2 py-3 rounded-2xl shadow-md text-xs font-bold"
                    onClick={() => {
                      if (onStartPractice) {
                        onStartPractice(tutorial.practice_prompt || tutorial.title, 'voice');
                      }
                    }}
                  >
                    <Mic size={16} />
                    <span>Launch Voice Drill in Talk AI</span>
                    <ArrowRight size={16} />
                  </Button>

                  {/* Text Chat Button */}
                  <button
                    onClick={() => {
                      if (onStartPractice) {
                        onStartPractice(tutorial.practice_prompt || tutorial.title, 'text');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-xs hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer"
                  >
                    <MessageSquare size={16} className="text-emerald-600" />
                    <span>Launch AI Text Chat with this Topic</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Module Bar */}
          <div className="p-4 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 truncate max-w-[220px]">
              Course: <strong className="text-gray-800">{module.title}</strong>
            </span>

            {nextTutorial && (
              <button
                onClick={() => onSelectTutorial(nextTutorial)}
                className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
              >
                <span>Next: {nextTutorial.title}</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
}
