import { motion } from 'motion/react';
import { Clock, Star } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const courses = [
  {
    id: 1,
    tag: 'Grammar',
    title: 'Advanced Passive Voice in Context',
    mentor: 'Dr. Sarah Smith',
    progress: 45,
    lessons: 12,
    rating: 4.8,
    color: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    tag: 'Speaking',
    title: 'Academic Presentation Fluency',
    mentor: 'John Doe',
    progress: 72,
    lessons: 8,
    rating: 4.9,
    color: 'bg-purple-500',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
  }
];

export default function ContinueLearning() {
  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-text-heading">Continue Learning</h2>
        <span className="text-primary text-xs font-bold cursor-pointer hover:underline">See All</span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {courses.map((course) => (
          <motion.div
            key={course.id}
            whileHover={{ y: -5 }}
            className="min-w-[280px] max-w-[280px] bg-white rounded-2xl p-3 border border-gray-100 shadow-sm group cursor-pointer"
          >
            <div className="h-24 bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
              course.tag === 'Grammar' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
            )}>
              {course.tag}
            </span>
            <h3 className="text-sm font-bold mt-2 text-text-heading leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden ring-1 ring-white">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.mentor}`} alt={course.mentor} />
              </div>
              <span className="text-[10px] text-gray-500 font-medium">Mentor: {course.mentor.split(' ').pop()}.</span>
            </div>
            <div className="mt-4 bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={cn(
                  "h-full rounded-full transition-all",
                  course.tag === 'Grammar' ? 'bg-orange-400' : 'bg-blue-400'
                )} 
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

