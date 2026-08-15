import { motion } from 'motion/react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Plus } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const data = [
  { day: 'M', value: 40 },
  { day: 'T', value: 70 },
  { day: 'W', value: 50 },
  { day: 'T', value: 90 },
  { day: 'F', value: 60 },
  { day: 'S', value: 30 },
  { day: 'S', value: 45 },
];

const mentors = [
  { name: 'Dr. Sarah Smith', role: 'IELTS Expert', color: 'bg-blue-100' },
  { name: 'John Doe', role: 'Business English', color: 'bg-purple-100' },
  { name: 'Lisa Ray', role: 'Grammar Coach', color: 'bg-orange-100' },
];

export default function RightPanel() {
  return (
    <div className="w-[240px] h-full flex flex-col gap-5 p-6 bg-transparent overflow-y-auto hidden xl:flex border-l border-gray-100">
      {/* Profile Card */}
      <div className="bg-white rounded-[24px] shadow-sm p-6 flex flex-col items-center border border-gray-100">
        <div className="relative mb-4">
          <svg className="rotate-[-90deg]" width="100" height="100">
            <circle className="text-gray-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
            <circle 
              className="text-primary" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.32)} 
              strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">32%</span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Progress</span>
          </div>
        </div>
        <h3 className="font-bold text-sm text-text-heading">Good Morning, Alex!</h3>
        <p className="text-xs text-text-sub text-center mt-1 leading-relaxed">You've completed 4 lessons this week. Keep it up!</p>
      </div>

      {/* Weekly Stats */}
      <div className="bg-white rounded-[24px] shadow-sm p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-text-heading">Weekly Stats</h3>
          <button className="text-gray-400 hover:text-primary transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex items-end justify-between h-20 gap-2 px-1">
          {[40, 70, 55, 85, 30, 60, 45].map((height, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className={cn(
                "w-3 rounded-t-sm transition-colors",
                i === 3 ? "bg-primary" : "bg-gray-100"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[8px] text-gray-400 uppercase font-bold px-0.5 tracking-widest">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
      </div>

      {/* Mentor List */}
      <div className="bg-white rounded-[24px] shadow-sm p-5 border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-text-heading">My Mentors</h3>
          <span className="text-primary text-[10px] font-bold cursor-pointer hover:underline">See All</span>
        </div>
        <div className="flex flex-col gap-4 overflow-hidden">
          {mentors.map((mentor, index) => (
            <div key={index} className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg overflow-hidden ring-1 ring-gray-50", mentor.color)}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} alt={mentor.name} />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-heading leading-tight truncate w-24">{mentor.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate w-24">Native Speaker</p>
                </div>
              </div>
              <button className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full hover:bg-primary/10 transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
