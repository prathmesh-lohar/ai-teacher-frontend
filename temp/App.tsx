import { useState } from 'react';
import Sidebar from '@/src/components/layout/Sidebar';
import Header from '@/src/components/layout/Header';
import RightPanel from '@/src/components/layout/RightPanel';
import HeroBanner from '@/src/components/dashboard/HeroBanner';
import ProgressCards from '@/src/components/dashboard/ProgressCards';
import ContinueLearning from '@/src/components/dashboard/ContinueLearning';
import LessonsTable from '@/src/components/dashboard/LessonsTable';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Sparkles, Wand2 } from 'lucide-react';

export default function App() {
  const [currentTab, setTab] = useState('dashboard');

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden selection:bg-primary/20 p-2 lg:p-4 gap-4">
      {/* Sidebar - Desktop Only */}
      <Sidebar currentTab={currentTab} setTab={setTab} />

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-500 overflow-hidden relative glass-card rounded-[24px]">
        <Header />
        
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-24 lg:pb-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {currentTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10 py-6"
              >
                <HeroBanner />
                <ProgressCards />
                <ContinueLearning />
                <LessonsTable />
              </motion.div>
            )}

            {currentTab === 'talk' && (
              <motion.div
                key="talk"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full flex flex-col py-6"
              >
                <div className="flex-1 flex flex-col bg-white rounded-[3rem] shadow-soft border border-gray-100 overflow-hidden relative">
                  {/* Chat Header */}
                  <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
                        <Sparkles size={24} />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <h2 className="font-bold text-text-heading">AI Teacher Duo</h2>
                        <div className="flex items-center gap-2">
                           <p className="text-xs text-text-sub">Always online to help you practice</p>
                           <span className="w-1 h-1 bg-gray-300 rounded-full" />
                           <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Fluent</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-text-sub hover:bg-gray-100 transition-colors">Conversation History</button>
                    </div>
                  </div>

                  {/* Chat Body */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                        <Wand2 size={14} />
                      </div>
                      <div className="bg-gray-50 p-5 rounded-3xl rounded-tl-none max-w-lg border border-gray-100 shadow-sm">
                        <p className="text-sm text-text-heading leading-relaxed">
                          Hello Prathmesh! I'm your AI English partner. Today we can practice natural conversation or prepare for your IELTS exam. What's on your mind?
                        </p>
                        <p className="text-[10px] text-text-sub mt-2 font-medium uppercase tracking-wider">AI TUTOR • 09:41 AM</p>
                      </div>
                    </div>

                    <div className="flex gap-4 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mt-1">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Prathmesh" alt="Me" />
                      </div>
                      <div className="bg-primary text-white p-5 rounded-3xl rounded-tr-none max-w-lg shadow-lg shadow-primary/20">
                        <p className="text-sm leading-relaxed font-medium">
                          I want to focus on using academic vocabulary more naturally during discussions. Can we practice a debate topic?
                        </p>
                        <p className="text-[10px] opacity-70 mt-2 font-bold uppercase tracking-wider">ME • 09:42 AM</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                        <Wand2 size={14} />
                      </div>
                      <div className="bg-gray-50 p-5 rounded-3xl rounded-tl-none max-w-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Correction</span>
                           <span className="text-[10px] text-text-sub font-medium">Instead of "I want to focus", consider "I aim to concentrate" for higher band score.</span>
                        </div>
                        <p className="text-sm text-text-heading leading-relaxed">
                          Excellent choice! Let's discuss: <span className="font-bold underline decoration-primary/30">"The impact of technology on traditional education systems."</span> Should we evaluate the benefits first, or jump into the counter-arguments?
                        </p>
                        <p className="text-[10px] text-text-sub mt-2 font-medium uppercase tracking-wider">AI TUTOR • 09:42 AM</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-8 bg-white border-t border-gray-50">
                    <div className="flex items-center gap-4 bg-background border border-gray-100 p-2 rounded-3xl shadow-inner-soft group focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                      <button className="p-3 bg-white text-text-sub hover:text-primary rounded-2xl shadow-sm border border-gray-50 transition-all">
                         <Mic size={20} />
                      </button>
                      <input 
                        type="text" 
                        placeholder="Type your message here..."
                        className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-gray-400 font-medium px-2"
                      />
                      <button className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center justify-center group-hover:rotate-12">
                         <Send size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-6 mt-4 justify-center">
                       <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                          <span className="text-xs font-semibold text-text-sub group-hover:text-text-heading transition-colors">Auto-Correction On</span>
                       </label>
                       <div className="w-px h-3 bg-gray-200" />
                       <span className="text-xs font-semibold text-text-sub">324 tokens remaining</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentTab !== 'dashboard' && currentTab !== 'talk' && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-center p-20"
              >
                <div className="max-w-md">
                   <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                      <Sparkles size={40} />
                   </div>
                   <h2 className="text-2xl font-bold text-text-heading mb-2">Modules Under Development</h2>
                   <p className="text-text-sub text-sm">We're currently perfecting the {currentTab} module using advanced linguistic AI models. Stay tuned!</p>
                   <button 
                    onClick={() => setTab('dashboard')}
                    className="mt-8 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
                   >
                     Back to dashboard
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around p-4 z-50 rounded-t-[2rem] shadow-2xl">
           <button onClick={() => setTab('dashboard')} className={currentTab === 'dashboard' ? 'text-primary' : 'text-text-sub'}><LayoutDashboard /></button>
           <button onClick={() => setTab('learn')} className={currentTab === 'learn' ? 'text-primary' : 'text-text-sub'}><BookOpen /></button>
           <button onClick={() => setTab('talk')} className={currentTab === 'talk' ? 'text-primary' : 'text-text-sub'}><MessageSquare /></button>
           <button onClick={() => setTab('roleplay')} className={currentTab === 'roleplay' ? 'text-primary' : 'text-text-sub'}><UserCircle /></button>
           <button key="profile-mobile" className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Prathmesh" alt="" />
           </button>
        </div>
      </main>

      {/* Right Sidebar - Desktop Only */}
      <RightPanel />
    </div>
  );
}

// Helper icons for mobile nav (imported locally for the scope of App.tsx)
import { LayoutDashboard, BookOpen, MessageSquare, UserCircle } from 'lucide-react';
