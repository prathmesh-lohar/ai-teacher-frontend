import { motion } from 'motion/react';
import { Sparkles, Play } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-r from-[#6C63FF] to-[#8E7CFF] rounded-[28px] p-10 text-white relative overflow-hidden shadow-lg shadow-purple-500/20">
      <div className="relative z-10 w-full lg:w-2/3">
        <h1 className="text-3xl font-bold mb-3 leading-tight">Sharpen Your English Skills with AI</h1>
        <p className="text-white/80 text-sm mb-6 max-w-md leading-relaxed">
          Master grammar, expand vocabulary, and practice speaking with our advanced AI mentor anytime, anywhere.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-[#6C63FF] font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-gray-50 text-sm transition-all"
        >
          Start Learning
        </motion.button>
      </div>
      <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 hidden lg:block">
        <Star size={280} fill="white" stroke="none" />
      </div>
    </section>
  );
}

import { Star } from 'lucide-react';
