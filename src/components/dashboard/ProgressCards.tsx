'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Book, Volume2, Mic2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatItem {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}

const defaultStats: StatItem[] = [
  { id: 'grammar', icon: Book, label: 'Grammar', value: '2/8', sub: 'completed', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'vocabulary', icon: Volume2, label: 'Vocabulary', value: '3/8', sub: 'completed', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'speaking', icon: Mic2, label: 'Speaking', value: '6/12', sub: 'completed', color: 'text-orange-600', bg: 'bg-orange-50' },
];

interface ProgressCardsProps {
  stats?: StatItem[];
  onCardClick?: (statId: string) => void;
}

export function ProgressCards({ stats = defaultStats, onCardClick }: ProgressCardsProps) {
  return (
    <section aria-label="Learning Metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => onCardClick?.(stat.id)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group cursor-pointer hover:border-[var(--primary)]/20 transition-all"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 transition-transform group-hover:scale-105", stat.bg, stat.color)}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-wider mb-0.5">{stat.label}</p>
              <p className="text-sm font-bold text-[var(--text-heading)]">
                {stat.value} <span className="text-xs font-normal text-[var(--text-sub)]">{stat.sub}</span>
              </p>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}

export default ProgressCards;
