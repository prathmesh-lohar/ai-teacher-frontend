import { motion } from 'motion/react';
import { Book, Volume2, Mic2 } from 'lucide-react';

const stats = [
  { icon: Book, label: 'Grammar', value: '2/8', sub: 'watched', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Volume2, label: 'Vocabulary', value: '3/8', sub: 'watched', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Mic2, label: 'Speaking', value: '6/12', sub: 'watched', color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function ProgressCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          whileHover={{ y: -5 }}
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4 group cursor-pointer"
        >
          <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg`}>
            {stat.label.charAt(0)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
            <p className="text-sm font-bold text-text-heading">{stat.value} {stat.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
