'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';

export interface Course {
  id: number;
  tag: 'Grammar' | 'Speaking' | 'Vocabulary';
  title: string;
  mentor: string;
  mentorAvatarSeed: string;
  progress: number;
  image: string;
}

const defaultCourses: Course[] = [
  {
    id: 1,
    tag: 'Grammar',
    title: 'Advanced Passive Voice in Context',
    mentor: 'Dr. Sarah Smith',
    mentorAvatarSeed: 'Sarah',
    progress: 45,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    tag: 'Speaking',
    title: 'Academic Presentation Fluency',
    mentor: 'John Doe',
    mentorAvatarSeed: 'John',
    progress: 72,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    tag: 'Vocabulary',
    title: 'IELTS Academic Wordlist Masterclass',
    mentor: 'Lisa Ray',
    mentorAvatarSeed: 'Lisa',
    progress: 60,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60'
  }
];

interface ContinueLearningProps {
  courses?: Course[];
  onSelectCourse?: (course: Course) => void;
}

export function ContinueLearning({ courses = defaultCourses, onSelectCourse }: ContinueLearningProps) {
  return (
    <section aria-label="Active Courses" className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-[var(--text-heading)]">Continue Learning</h2>
        <button className="text-[var(--primary)] text-xs font-bold hover:underline cursor-pointer">
          See All
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {courses.map((course) => (
          <motion.article
            key={course.id}
            whileHover={{ y: -4 }}
            onClick={() => onSelectCourse?.(course)}
            className="min-w-[280px] max-w-[280px] bg-white rounded-2xl p-3 border border-gray-100 shadow-sm group cursor-pointer hover:shadow-md transition-all flex-shrink-0"
          >
            <div className="h-28 bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                loading="lazy"
              />
            </div>
            
            <Badge variant={course.tag === 'Grammar' ? 'grammar' : course.tag === 'Speaking' ? 'speaking' : 'vocabulary'}>
              {course.tag}
            </Badge>

            <h3 className="text-sm font-bold mt-2 text-[var(--text-heading)] leading-tight line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
              {course.title}
            </h3>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-50 flex-shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.mentorAvatarSeed}`} 
                  alt={`${course.mentor}'s avatar`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] text-[var(--text-sub)] font-medium">Mentor: {course.mentor}</span>
            </div>

            <div className="mt-4 bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={cn(
                  "h-full rounded-full transition-all",
                  course.tag === 'Grammar' ? 'bg-orange-400' : course.tag === 'Speaking' ? 'bg-blue-400' : 'bg-purple-400'
                )} 
              />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default ContinueLearning;
