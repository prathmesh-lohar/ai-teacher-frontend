'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Video, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Volume2, 
  Camera, 
  FileText, 
  ArrowRight,
  Headphones,
  CheckCircle2,
  Globe2,
  Cpu,
  Radio,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

export type ChatMode = 'voice' | 'video' | 'text';

export interface TalkModeSelectorProps {
  onSelectMode: (mode: ChatMode, topic: string) => void;
  onViewReports?: () => void;
}

const topics = [
  { id: 'ielts', label: 'IELTS Speaking Test', icon: Sparkles, level: 'Band 7.5+' },
  { id: 'interview', label: 'Job Interview Prep', icon: Zap, level: 'Professional' },
  { id: 'casual', label: 'Daily Casual Talk', icon: Headphones, level: 'Conversational' },
  { id: 'business', label: 'Business English', icon: FileText, level: 'Executive' },
];

export function TalkModeSelector({ onSelectMode, onViewReports }: TalkModeSelectorProps) {
  const [selectedTopic, setSelectedTopic] = useState('Daily Casual Talk');
  const [activeTabTopic, setActiveTabTopic] = useState('casual');

  const modeOptions = [
    {
      id: 'voice' as ChatMode,
      title: 'Voice Chat with AI',
      subtitle: 'Real-time Hands-free Audio Call',
      description: 'Fluid, natural spoken conversation with instant speech synthesis, accent feedback, and real-time pronunciation scoring.',
      icon: Mic,
      badge: '🔥 98% Popular',
      badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-200/60',
      gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      borderHover: 'hover:border-blue-400/80 hover:shadow-blue-500/15',
      glowColor: 'bg-blue-500/10',
      btnGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30',
      tagColor: 'text-blue-600 bg-blue-50',
      features: [
        'Real-time soundwave response engine',
        'Hindi & Native real-time corrections',
        'Speed control (0.8x to 1.5x audio)',
      ],
      // Simulated live visual preview inside card header
      previewWidget: (
        <div className="w-full h-24 bg-gradient-to-br from-blue-900/90 to-indigo-950 rounded-2xl p-3 flex items-center justify-between border border-blue-500/20 relative overflow-hidden group-hover:border-blue-400/40 transition-colors">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <span>AI Voice Neural Engine</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </p>
              <p className="text-[9px] text-blue-200/80 font-mono">Latency: 14ms • Ultra HD</p>
            </div>
          </div>
          {/* Animated sound equalizer bars */}
          <div className="flex items-center gap-1 h-8 relative z-10">
            {[40, 75, 55, 90, 60, 85, 45].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: ['20%', `${h}%`, '30%'] }}
                transition={{ repeat: Infinity, duration: 0.8 + i * 0.1, ease: 'easeInOut' }}
                className="w-1 bg-gradient-to-t from-blue-400 to-cyan-300 rounded-full"
              />
            ))}
          </div>
          {/* Ambient background glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
        </div>
      ),
    },
    {
      id: 'video' as ChatMode,
      title: 'Video Chat with AI',
      subtitle: 'HD Face-to-Face Mentor Stream',
      description: 'Interactive video call with a lifelike AI Video Mentor, featuring live WebRTC webcam preview and lip-sync expression analysis.',
      icon: Video,
      badge: '🎥 1080p HD',
      badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-200/60',
      gradient: 'from-purple-600 via-indigo-600 to-pink-500',
      borderHover: 'hover:border-purple-400/80 hover:shadow-purple-500/15',
      glowColor: 'bg-purple-500/10',
      btnGradient: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/30',
      tagColor: 'text-purple-600 bg-purple-50',
      features: [
        '3D Animated AI Mentor Avatar',
        'Live WebRTC webcam PiP preview',
        'Pronunciation & posture HUD',
      ],
      // Simulated live video preview inside card header
      previewWidget: (
        <div className="w-full h-24 bg-gradient-to-br from-purple-950 to-slate-950 rounded-2xl p-3 flex items-center justify-between border border-purple-500/20 relative overflow-hidden group-hover:border-purple-400/40 transition-colors">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/40 overflow-hidden flex items-center justify-center">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&style=circle" 
                alt="AI Video Mentor" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <span>AI Mentor Sarah</span>
                <span className="text-[9px] bg-purple-500/30 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-400/30">HD 60fps</span>
              </p>
              <p className="text-[9px] text-purple-200/80 font-mono">Facial HUD: Active</p>
            </div>
          </div>
          {/* PiP Mini Cam frame */}
          <div className="w-10 h-12 rounded-lg bg-slate-900 border border-purple-400/50 flex flex-col items-center justify-center text-purple-300 text-[8px] font-bold relative z-10 shadow-md">
            <Camera size={14} className="mb-0.5" />
            <span>YOU</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />
        </div>
      ),
    },
    {
      id: 'text' as ChatMode,
      title: 'Text Chat with AI',
      subtitle: 'Deep Written & Grammar Studio',
      description: 'Master writing fluency with instant sentence-by-sentence tutor suggestions, academic band 8+ vocabulary, and voice note dictation.',
      icon: MessageSquare,
      badge: '📝 Deep Feedback',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-500',
      borderHover: 'hover:border-emerald-400/80 hover:shadow-emerald-500/15',
      glowColor: 'bg-emerald-500/10',
      btnGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30',
      tagColor: 'text-emerald-600 bg-emerald-50',
      features: [
        'Instant grammar & style breakdown',
        'IELTS Band 8+ academic vocab tips',
        'Speech-to-text voice note dictation',
      ],
      // Simulated live text preview inside card header
      previewWidget: (
        <div className="w-full h-24 bg-gradient-to-br from-emerald-950 to-slate-950 rounded-2xl p-3 flex flex-col justify-between border border-emerald-500/20 relative overflow-hidden group-hover:border-emerald-400/40 transition-colors">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Auto-Correction Active
            </span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-400/30">Band 8.5 Tip</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-xl border border-emerald-500/30 text-[10px] text-slate-200 relative z-10 leading-snug">
            <span className="text-emerald-400 font-bold">Suggested:</span> "I aim to concentrate" instead of "I want to focus".
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
        </div>
      ),
    },
  ];

  return (
    <div className="h-full w-full flex flex-col justify-between py-5 px-4 sm:px-6 lg:px-8 overflow-y-auto custom-scrollbar relative">
      {/* Background Subtle Gradient Mesh Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 text-[var(--primary)] text-xs font-bold mb-3 shadow-xs">
          <Flame size={14} className="text-orange-500 animate-pulse" />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold">
            Next-Gen AI Learning Hub 3.0
          </span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight leading-tight">
          How would you like to practice today?
        </h1>
        <p className="text-sm text-[var(--text-sub)] mt-2 max-w-3xl mx-auto leading-relaxed font-medium">
          Choose your preferred AI interaction format below. You can seamlessly switch modes at any time during your practice session.
        </p>

        {/* Topic Selector Bar & View Reports CTA - Full Width */}
        <div className="mt-6 w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="p-2 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-md w-full flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
            {topics.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTopic === t.label;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTopic(t.label);
                    setActiveTabTopic(t.id);
                  }}
                  className={`flex items-center justify-between gap-2 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer w-full ${
                    isSelected
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md shadow-[var(--primary-soft)] scale-[1.01]'
                      : 'bg-gray-50/80 text-gray-700 hover:bg-gray-100 hover:text-black border border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon size={15} className="shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200/60 text-gray-500'
                  }`}>
                    {t.level}
                  </span>
                </button>
              );
            })}
          </div>

          {onViewReports && (
            <button
              onClick={onViewReports}
              className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer hover:shadow-md shrink-0 w-full lg:w-auto px-5"
            >
              <FileText size={16} />
              <span>View Past Reports</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* 3 Interactive Mode Cards Grid - Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full my-auto relative z-10">
        {modeOptions.map((mode, index) => {
          const Icon = mode.icon;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.12 }}
              onClick={() => onSelectMode(mode.id, selectedTopic)}
              className={`group relative bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 lg:p-7 border border-gray-200/80 shadow-md hover:shadow-2xl ${mode.borderHover} transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden transform hover:-translate-y-1.5 w-full`}
            >
              {/* Card Top: Live Widget & Header */}
              <div>
                {/* Visual Widget Header */}
                <div className="mb-5">
                  {mode.previewWidget}
                </div>

                {/* Title & Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${mode.tagColor} px-2.5 py-1 rounded-lg`}>
                    {mode.subtitle}
                  </span>
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${mode.badgeClass}`}>
                    {mode.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-[var(--text-heading)] mt-1 group-hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                  <span>{mode.title}</span>
                </h3>

                <p className="text-xs text-[var(--text-sub)] mt-2 leading-relaxed font-medium">
                  {mode.description}
                </p>

                {/* Features Checklist */}
                <div className="space-y-2.5 py-4 my-4 border-t border-b border-gray-100">
                  {mode.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-700 font-semibold">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Action CTA Button */}
              <div className="mt-2 pt-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-extrabold text-white py-3.5 px-5 rounded-2xl ${mode.btnGradient} shadow-lg transition-all group-hover:shadow-xl`}
                >
                  <span>Connect to {mode.id.toUpperCase()} Studio</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* Decorative Subtle Glowing Corner Orb */}
              <div className={`absolute -right-12 -bottom-12 w-48 h-48 ${mode.glowColor} rounded-full blur-3xl group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Status Bar - Full Width */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 pt-4 border-t border-gray-200/60 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-semibold gap-3 relative z-10"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>AI Neural Engines Online</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-600 font-medium">Topic: <span className="text-[var(--primary)] font-bold">{selectedTopic}</span></span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Globe2 size={13} /> Real-time Speech Sync
          </span>
          <span className="flex items-center gap-1">
            <Cpu size={13} /> 100% Privacy Protected
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default TalkModeSelector;

