import { Search, Bell, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-transparent mb-2">
      <div className="relative flex-1 max-w-[400px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search your course..."
          className="w-full bg-white border border-gray-100 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all shadow-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center cursor-pointer shadow-sm text-text-sub hover:text-primary transition-colors"
        >
          <Bell size={18} />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
        </motion.button>

        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer group hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden ring-2 ring-white">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" />
          </div>
          <span className="text-sm font-semibold text-text-heading">Alex Morgan</span>
          <ChevronDown size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </header>
  );
}
