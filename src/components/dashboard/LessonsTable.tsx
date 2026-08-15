'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/common/Badge';

export interface Lesson {
  id: number;
  mentor: string;
  mentorAvatarSeed: string;
  role: string;
  type: 'Grammar' | 'Speaking' | 'Vocabulary';
  description: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  time: string;
}

const defaultLessons: Lesson[] = [
  {
    id: 1,
    mentor: 'Dr. Sarah Smith',
    mentorAvatarSeed: 'Sarah',
    role: 'IELTS Expert',
    type: 'Grammar',
    description: 'Mastering the use of conditionals in academic writing and formal speaking.',
    status: 'Upcoming',
    time: '2:00 PM',
  },
  {
    id: 2,
    mentor: 'John Doe',
    mentorAvatarSeed: 'John',
    role: 'Business English',
    type: 'Speaking',
    description: 'Negotiation tactics and professional terminology for global business.',
    status: 'In Progress',
    time: 'Live',
  },
  {
    id: 3,
    mentor: 'Lisa Ray',
    mentorAvatarSeed: 'Lisa',
    role: 'Grammar Coach',
    type: 'Vocabulary',
    description: 'Idiomatic expressions and collocations common in native conversations.',
    status: 'Completed',
    time: '10:00 AM',
  }
];

interface LessonsTableProps {
  lessons?: Lesson[];
  onActionClick?: (lesson: Lesson) => void;
}

export function LessonsTable({ lessons = defaultLessons, onActionClick }: LessonsTableProps) {
  return (
    <section aria-label="Scheduled Lessons Table" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-heading)]">All Scheduled Lessons</h2>
          <p className="text-[11px] text-[var(--text-sub)] mt-0.5">Manage and track your active English learning sessions</p>
        </div>
        <button className="p-2 border border-gray-100 rounded-lg text-[var(--text-sub)] hover:bg-gray-50 transition-colors" aria-label="Table options">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th scope="col" className="px-3 py-3 text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-widest">Mentor</th>
              <th scope="col" className="px-3 py-3 text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-widest">Type</th>
              <th scope="col" className="px-3 py-3 text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-widest">Description</th>
              <th scope="col" className="px-3 py-3 text-[10px] font-bold text-[var(--text-sub)] uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="group hover:bg-gray-50/70 transition-all">
                <td className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden ring-1 ring-gray-100 flex-shrink-0">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lesson.mentorAvatarSeed}`} 
                        alt={`${lesson.mentor} avatar`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-heading)]">{lesson.mentor}</p>
                      <p className="text-[9px] text-[var(--text-sub)] font-medium leading-none mt-0.5">{lesson.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <Badge variant={lesson.type === 'Grammar' ? 'grammar' : lesson.type === 'Speaking' ? 'speaking' : 'vocabulary'}>
                    {lesson.type}
                  </Badge>
                </td>
                <td className="px-3 py-4 max-w-xs">
                  <p className="text-[11px] text-[var(--text-sub)] line-clamp-1 leading-relaxed">{lesson.description}</p>
                </td>
                <td className="px-3 py-4 text-right">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onActionClick?.(lesson)}
                    aria-label={`Open lesson with ${lesson.mentor}`}
                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[var(--text-sub)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all shadow-sm ml-auto"
                  >
                    <ArrowRight size={14} />
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default LessonsTable;
