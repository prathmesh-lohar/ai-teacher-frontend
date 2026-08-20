'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Briefcase, Sparkles, GraduationCap, LucideIcon, CheckCircle, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LearningStats } from '@/types/learning';
import { getLearningStats } from '@/services/learningApi';

export interface StatItem {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  percent: number;
  color: string;
  bg: string;
  barColor: string;
}

interface ProgressCardsProps {
  stats?: LearningStats | null;
  onCardClick?: (statId: string) => void;
}

export function ProgressCards({ stats: initialStats, onCardClick }: ProgressCardsProps) {
  const [statsData, setStatsData] = useState<LearningStats | null>(initialStats || null);
  const [loading, setLoading] = useState<boolean>(!initialStats);

  useEffect(() => {
    if (initialStats) {
      setStatsData(initialStats);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getLearningStats();
        if (isMounted) {
          setStatsData(data);
        }
      } catch (err) {
        console.error('Failed to fetch learning stats from backend:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [initialStats]);

  // Generate dynamic stats items from real backend data
  const renderItems: StatItem[] = React.useMemo(() => {
    if (!statsData) {
      return [
        { id: 'english_speaking', icon: MessageSquare, label: 'Speaking & Fluency', value: '0/0', sub: 'completed', percent: 0, color: 'text-amber-600', bg: 'bg-amber-50', barColor: 'bg-amber-500' },
        { id: 'interview_prep', icon: Briefcase, label: 'Interview Prep', value: '0/0', sub: 'completed', percent: 0, color: 'text-blue-600', bg: 'bg-blue-50', barColor: 'bg-blue-500' },
        { id: 'business_english', icon: GraduationCap, label: 'Business English', value: '0/0', sub: 'completed', percent: 0, color: 'text-purple-600', bg: 'bg-purple-50', barColor: 'bg-purple-500' },
      ];
    }

    const cats = statsData.categories || {};
    const items: StatItem[] = [];

    if (cats.english_speaking) {
      const p = cats.english_speaking.total > 0 ? Math.round((cats.english_speaking.completed / cats.english_speaking.total) * 100) : 0;
      items.push({
        id: 'english_speaking',
        icon: MessageSquare,
        label: 'Speaking & Fluency',
        value: `${cats.english_speaking.completed}/${cats.english_speaking.total}`,
        sub: 'completed',
        percent: p,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        barColor: 'bg-amber-500',
      });
    }

    if (cats.interview_prep) {
      const p = cats.interview_prep.total > 0 ? Math.round((cats.interview_prep.completed / cats.interview_prep.total) * 100) : 0;
      items.push({
        id: 'interview_prep',
        icon: Briefcase,
        label: 'Interview Prep',
        value: `${cats.interview_prep.completed}/${cats.interview_prep.total}`,
        sub: 'completed',
        percent: p,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        barColor: 'bg-blue-500',
      });
    }

    if (cats.business_english) {
      const p = cats.business_english.total > 0 ? Math.round((cats.business_english.completed / cats.business_english.total) * 100) : 0;
      items.push({
        id: 'business_english',
        icon: GraduationCap,
        label: 'Business English',
        value: `${cats.business_english.completed}/${cats.business_english.total}`,
        sub: 'completed',
        percent: p,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        barColor: 'bg-purple-500',
      });
    } else if (cats.pronunciation) {
      const p = cats.pronunciation.total > 0 ? Math.round((cats.pronunciation.completed / cats.pronunciation.total) * 100) : 0;
      items.push({
        id: 'pronunciation',
        icon: Sparkles,
        label: 'Pronunciation & Accent',
        value: `${cats.pronunciation.completed}/${cats.pronunciation.total}`,
        sub: 'completed',
        percent: p,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        barColor: 'bg-emerald-500',
      });
    }

    return items;
  }, [statsData]);

  if (loading) {
    return (
      <section aria-label="Learning Metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-2.5 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-28" />
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full w-full mt-3" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section aria-label="Learning Metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {renderItems.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => onCardClick?.(stat.id)}
            className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100/90 hover:border-gray-200 hover:shadow-md flex flex-col justify-between group cursor-pointer transition-all duration-300 relative overflow-hidden"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 transition-transform group-hover:scale-105 shadow-2xs", stat.bg, stat.color)}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-[var(--text-sub)] uppercase tracking-wider mb-0.5">{stat.label}</p>
                    <p className="text-base font-extrabold text-[var(--text-heading)]">
                      {stat.value} <span className="text-xs font-normal text-[var(--text-sub)]">{stat.sub}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-[var(--primary)] transition-colors">
                  <span className="text-[10px] bg-gray-50 group-hover:bg-[var(--primary-soft)] px-2 py-0.5 rounded-full transition-colors">
                    {stat.percent}%
                  </span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="mt-4 space-y-1">
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.percent}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={cn("h-full rounded-full transition-all", stat.barColor)}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}

export default ProgressCards;
