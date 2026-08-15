import { motion } from 'motion/react';
import { ArrowRight, MoreHorizontal } from 'lucide-react';

const lessons = [
  {
    id: 1,
    mentor: 'Dr. Sarah Smith',
    role: 'IELTS Expert',
    type: 'Grammar',
    description: 'Mastering the use of conditionals in academic writing and formal speaking.',
    status: 'Upcoming',
    time: '2:00 PM',
  },
  {
    id: 2,
    mentor: 'John Doe',
    role: 'Business English',
    type: 'Speaking',
    description: 'Negotiation tactics and professional terminology for global business.',
    status: 'In Progress',
    time: 'Live',
  },
  {
    id: 3,
    mentor: 'Lisa Ray',
    role: 'Grammar Coach',
    type: 'Vocabulary',
    description: 'Idiomatic expressions and collocations common in native conversations.',
    status: 'Completed',
    time: '10:00 AM',
  }
];

export default function LessonsTable() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-heading">All Lessons</h2>
          <p className="text-[11px] text-text-sub mt-0.5">Manage and track your scheduled learning sessions</p>
        </div>
        <button className="p-2 border border-gray-50 rounded-lg text-text-sub hover:bg-gray-50 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-2 py-3 text-[10px] font-bold text-text-sub uppercase tracking-widest">Mentor</th>
              <th className="px-2 py-3 text-[10px] font-bold text-text-sub uppercase tracking-widest">Type</th>
              <th className="px-2 py-3 text-[10px] font-bold text-text-sub uppercase tracking-widest">Description</th>
              <th className="px-2 py-3 text-[10px] font-bold text-text-sub uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="group hover:bg-gray-50/50 transition-all">
                <td className="px-2 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden ring-1 ring-gray-50">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lesson.mentor}`} alt={lesson.mentor} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-heading">{lesson.mentor}</p>
                      <p className="text-[9px] text-text-sub font-medium leading-none">{lesson.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                    ${lesson.type === 'Grammar' ? 'bg-orange-100 text-orange-600' : 
                      lesson.type === 'Speaking' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
                  `}>
                    {lesson.type}
                  </span>
                </td>
                <td className="px-2 py-4 max-w-xs">
                  <p className="text-[11px] text-text-sub line-clamp-1 leading-relaxed">{lesson.description}</p>
                </td>
                <td className="px-2 py-4 text-right">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-text-sub group-hover:bg-primary group-hover:text-white transition-all shadow-sm mx-auto mr-0"
                  >
                    <ArrowRight size={14} />
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
