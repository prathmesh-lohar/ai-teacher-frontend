'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';

export interface Mentor {
  name: string;
  role: string;
  avatarSeed: string;
  bg: string;
}

const defaultMentors: Mentor[] = [
  { name: 'Dr. Sarah Smith', role: 'IELTS Expert', avatarSeed: 'Sarah', bg: 'bg-blue-100' },
  { name: 'John Doe', role: 'Business English', avatarSeed: 'John', bg: 'bg-purple-100' },
  { name: 'Lisa Ray', role: 'Grammar Coach', avatarSeed: 'Lisa', bg: 'bg-orange-100' },
];

const weeklyData = [
  { day: 'M', height: 40 },
  { day: 'T', height: 70 },
  { day: 'W', height: 55 },
  { day: 'T', height: 85, active: true },
  { day: 'F', height: 30 },
  { day: 'S', height: 60 },
  { day: 'S', height: 45 },
];

interface RightPanelProps {
  progressPercentage?: number;
  userName?: string;
  mentors?: Mentor[];
}

export function RightPanel({
  progressPercentage = 32,
  userName = "Alex",
  mentors = defaultMentors,
}: RightPanelProps) {
  const strokeDashoffset = 251.2 * (1 - progressPercentage / 100);

  return (
    <aside aria-label="Learning Analytics and Mentors" className="w-[240px] h-full flex flex-col gap-5 p-6 bg-transparent overflow-y-auto hidden xl:flex border-l border-gray-100 custom-scrollbar flex-shrink-0">
      {/* Profile Overall Progress Card */}
      <section className="bg-white rounded-[24px] shadow-sm p-6 flex flex-col items-center border border-gray-100">
        <div className="relative mb-4">
          <svg className="rotate-[-90deg]" width="100" height="100" aria-label={`Progress: ${progressPercentage}%`}>
            <circle 
              className="text-gray-100" 
              strokeWidth="8" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
            />
            <motion.circle 
              className="text-[var(--primary)]" 
              strokeWidth="8" 
              strokeDasharray="251.2" 
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[var(--text-heading)]">{progressPercentage}%</span>
            <span className="text-[10px] text-[var(--text-sub)] font-medium uppercase tracking-wider">Progress</span>
          </div>
        </div>
        <h3 className="font-bold text-sm text-[var(--text-heading)] text-center">Good Morning, {userName}!</h3>
        <p className="text-xs text-[var(--text-sub)] text-center mt-1 leading-relaxed">
          You've completed 4 lessons this week. Keep up the great work!
        </p>
      </section>

      {/* Weekly Stats Section */}
      <section className="bg-white rounded-[24px] shadow-sm p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-[var(--text-heading)]">Weekly Stats</h3>
          <button className="text-gray-400 hover:text-[var(--primary)] transition-colors p-1" aria-label="Add target goal">
            <Plus size={16} />
          </button>
        </div>
        
        {/* Animated Bar Chart */}
        <div className="flex items-end justify-between h-20 gap-2 px-1">
          {weeklyData.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${item.height}%` }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className={cn(
                "w-3 rounded-t-sm transition-colors cursor-pointer hover:opacity-80",
                item.active ? "bg-[var(--primary)] shadow-sm" : "bg-gray-100"
              )}
              title={`${item.day}: ${item.height}% activity`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[8px] text-gray-400 uppercase font-bold px-0.5 tracking-widest">
          {weeklyData.map((item, i) => (
            <span key={i}>{item.day}</span>
          ))}
        </div>
      </section>

      {/* Mentor Recommendations Section */}
      <section className="bg-white rounded-[24px] shadow-sm p-5 border border-gray-100 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-[var(--text-heading)]">My Mentors</h3>
          <button className="text-[var(--primary)] text-[10px] font-bold hover:underline cursor-pointer">
            See All
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {mentors.map((mentor, index) => (
            <div key={index} className="flex items-center justify-between group">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn("w-8 h-8 rounded-lg overflow-hidden ring-1 ring-gray-100 flex-shrink-0", mentor.bg)}>
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.avatarSeed}`} 
                    alt={`${mentor.name} avatar`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--text-heading)] leading-tight truncate">{mentor.name}</p>
                  <p className="text-[10px] text-[var(--text-sub)] truncate mt-0.5">{mentor.role}</p>
                </div>
              </div>
              <button 
                className="bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-bold px-3 py-1 rounded-full hover:bg-[var(--primary)] hover:text-white transition-all flex-shrink-0 ml-1"
                aria-label={`Follow ${mentor.name}`}
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default RightPanel;
