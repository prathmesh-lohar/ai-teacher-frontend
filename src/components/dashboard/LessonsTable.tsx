'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles, Clock, BookOpen, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Tutorial } from '@/types/learning';
import { getTutorials } from '@/services/learningApi';

const COACH_MAP: Record<string, { name: string; role: string; seed: string }> = {
  english_speaking: { name: 'Dr. Sarah Smith', role: 'Fluency & Pronunciation Expert', seed: 'Sarah' },
  interview_prep: { name: 'Michael Chang', role: 'Tech & Career Interview Coach', seed: 'Michael' },
  business_english: { name: 'Victoria Sterling', role: 'Executive Negotiation Specialist', seed: 'Victoria' },
  pronunciation: { name: 'David Miller', role: 'Phonetics & Accent Coach', seed: 'David' },
  grammar_vocab: { name: 'Emma Watson', role: 'Academic Writing Coach', seed: 'Emma' },
};

const FILTER_TABS = [
  { id: 'all', label: 'All Drills' },
  { id: 'english_speaking', label: 'Speaking' },
  { id: 'interview_prep', label: 'Interview' },
  { id: 'business_english', label: 'Business' },
  { id: 'pronunciation', label: 'Pronunciation' },
];

interface LessonsTableProps {
  lessons?: Tutorial[];
  onActionClick?: (tutorial: Tutorial) => void;
}

export function LessonsTable({ lessons: initialLessons, onActionClick }: LessonsTableProps) {
  const [tutorialsList, setTutorialsList] = useState<Tutorial[]>(initialLessons || []);
  const [loading, setLoading] = useState<boolean>(!initialLessons || initialLessons.length === 0);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (initialLessons && initialLessons.length > 0) {
      setTutorialsList(initialLessons);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchTutorials = async () => {
      try {
        setLoading(true);
        const data = await getTutorials({ limit: 12 });
        if (isMounted) {
          setTutorialsList(data);
        }
      } catch (err) {
        console.error('Failed to fetch tutorials for Lessons Table:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTutorials();
    return () => {
      isMounted = false;
    };
  }, [initialLessons]);

  const filteredTutorials = useMemo(() => {
    return tutorialsList.filter((item) => {
      const matchesCategory = selectedFilter === 'all' || item.module_category === selectedFilter;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.module_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [tutorialsList, selectedFilter, searchQuery]);

  return (
    <section aria-label="Scheduled Lessons Table" className="bg-white rounded-[26px] p-6 lg:p-7 shadow-xs border border-gray-100/90 space-y-6">
      
      {/* Header and Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--text-heading)]">Curated Learning Lessons</h2>
          <p className="text-[11px] text-[var(--text-sub)] mt-0.5">Interactive video drills, comprehensive notes, and AI practice prompts</p>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search drills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 rounded-xl text-xs text-gray-700 placeholder-gray-400 border border-gray-100 focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === tab.id
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-36" />
                  <div className="h-2.5 bg-gray-200 rounded w-48" />
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="w-16 h-8 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredTutorials.length === 0 ? (
        <div className="p-10 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 space-y-2">
          <BookOpen size={28} className="mx-auto text-gray-400" />
          <p className="text-xs font-bold text-gray-700">No lessons match your current filter</p>
          <p className="text-[11px] text-gray-400">Try selecting another topic tab or resetting the search query.</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-extrabold text-[var(--text-sub)] uppercase tracking-wider">
                <th scope="col" className="pb-3 px-3">Lesson & Coach</th>
                <th scope="col" className="pb-3 px-3">Topic Category</th>
                <th scope="col" className="pb-3 px-3">Summary / AI Focus</th>
                <th scope="col" className="pb-3 px-3 text-center">Status</th>
                <th scope="col" className="pb-3 px-3 text-right">Practice Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/80">
              {filteredTutorials.map((tutorial) => {
                const coach = COACH_MAP[tutorial.module_category] || { name: 'AI Language Coach', role: 'Communication Specialist', seed: 'Coach' };
                const badgeVariant = tutorial.module_category === 'english_speaking'
                  ? 'speaking'
                  : tutorial.module_category === 'interview_prep'
                  ? 'grammar'
                  : 'vocabulary';

                return (
                  <tr key={tutorial.id} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden ring-1 ring-gray-100 flex-shrink-0 flex items-center justify-center shadow-2xs">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${coach.seed}`} 
                            alt={`${coach.name}'s avatar`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[var(--text-heading)] group-hover:text-[var(--primary)] transition-colors">
                            {tutorial.title}
                          </p>
                          <p className="text-[10px] text-[var(--text-sub)] font-medium mt-0.5">
                            {tutorial.module_title} • <span className="font-semibold text-gray-500">{tutorial.duration_minutes}m</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant={badgeVariant}>
                        {tutorial.module_category_display || tutorial.module_category.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs">
                      <p className="text-[11px] text-[var(--text-sub)] line-clamp-1 leading-relaxed">
                        {tutorial.summary || tutorial.practice_prompt || 'Comprehensive practical drill and vocabulary usage.'}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {tutorial.is_completed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 size={11} className="text-emerald-500" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                          <PlayCircle size={11} className="text-amber-500" /> Ready
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onActionClick?.(tutorial)}
                        aria-label={`Start drill for ${tutorial.title}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer ml-auto"
                      >
                        <span>Start Drill</span>
                        <ArrowRight size={13} />
                      </motion.button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default LessonsTable;
