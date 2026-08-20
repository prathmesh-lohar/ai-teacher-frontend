'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Mic, MessageSquare, Briefcase, Zap, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onStart?: (topic?: string) => void;
}

export function HeroBanner({
  title = "Master Fluent English Speaking with AI",
  subtitle = "Interactive real-time voice conversations, personalized vocabulary expansions, and instant grammatical feedback tailored to your goals.",
  buttonText = "Start Voice Practice Now",
  onStart,
}: HeroBannerProps) {
  const quickTopics = [
    { label: 'Daily Casual Talk', icon: Mic, color: 'hover:border-amber-300' },
    { label: 'Job Interview Drill', icon: Briefcase, color: 'hover:border-blue-300' },
    { label: 'Business Negotiation', icon: MessageSquare, color: 'hover:border-emerald-300' },
  ];

  return (
    <section 
      aria-label="Welcome Banner" 
      className="relative rounded-[28px] p-6 sm:p-8 lg:p-10 text-white overflow-hidden shadow-xl shadow-blue-900/10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] border border-white/10"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading, Subtitle & CTAs */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Live AI Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles size={13} className="text-cyan-300" />
            <span>AI Real-Time Tutor Online</span>
          </div>

          {/* Main H1 Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-xs">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
            {subtitle}
          </p>

          {/* Action Button & Shortcuts */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStart?.()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Mic size={16} />
                <span>{buttonText}</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>

            {/* Quick Practice Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Zap size={12} className="text-amber-400" /> Quick Topics:
              </span>
              {quickTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <button
                    key={topic.label}
                    onClick={() => onStart?.(topic.label)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-slate-200 text-[11px] font-medium transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <Icon size={12} className="text-cyan-300" />
                    <span>{topic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: AI Tutor Interactive Preview Card (Desktop / Tablet) */}
        <div className="lg:col-span-5 hidden sm:block">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-2xl space-y-4"
          >
            {/* Header with AI Avatar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-md">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&style=circle" 
                    alt="AI Tutor Sarah" 
                    className="w-full h-full object-cover rounded-xl bg-slate-900"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Sarah</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </h4>
                  <p className="text-[10px] text-cyan-300 font-medium">Native Fluency Coach</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                Live Speech HUD
              </span>
            </div>

            {/* Simulated Live Feedback Message */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 size={12} /> Instant Correction
                </span>
                <span>Band 8.5 Style</span>
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                <span className="text-cyan-300 font-bold">"Try using: </span> 
                <span>'I would be thrilled to contribute' instead of 'I want to help'."</span>
              </p>
            </div>

            {/* Dynamic Waveform Visualizer simulation */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 font-mono">Audio Sync: 48kHz</span>
              <div className="flex items-center gap-1">
                {[12, 24, 18, 28, 14, 22, 32, 16, 26, 10, 20].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
