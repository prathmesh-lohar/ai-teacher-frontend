'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Video, MessageSquare, Sparkles, Radio, CheckCircle } from 'lucide-react';
import { ChatMode } from './TalkModeSelector';

interface ConnectingStateProps {
  mode: ChatMode;
  topic: string;
  onConnected: () => void;
  onCancel: () => void;
}

export function ConnectingState({ mode, topic, onConnected, onCancel }: ConnectingStateProps) {
  const [step, setStep] = useState(0);

  const steps = [
    'Initializing Neural AI Engine...',
    `Loading ${topic} Knowledge Context...`,
    mode === 'voice' 
      ? 'Calibrating Real-time Audio Stream...' 
      : mode === 'video' 
      ? 'Syncing HD AI Video Avatar & Camera...' 
      : 'Setting up Interactive Grammar Workspace...',
    'Connection Established! Starting Session...',
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 600);
    const timer2 = setTimeout(() => setStep(2), 1200);
    const timer3 = setTimeout(() => setStep(3), 1800);
    const timer4 = setTimeout(() => {
      onConnected();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onConnected]);

  const modeIcon = {
    voice: Mic,
    video: Video,
    text: MessageSquare,
  }[mode];

  const modeTitle = {
    voice: 'AI Voice Call',
    video: 'AI HD Video Call',
    text: 'AI Text Tutor',
  }[mode];

  const modeGradient = {
    voice: 'from-blue-600 to-indigo-600',
    video: 'from-purple-600 to-pink-600',
    text: 'from-emerald-600 to-teal-600',
  }[mode];

  const Icon = modeIcon;

  return (
    <div className="h-full flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center relative overflow-hidden"
      >
        {/* Animated Pulsing Ring Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${modeGradient} opacity-20 animate-ping`} />
          <div className={`absolute inset-2 rounded-full bg-gradient-to-tr ${modeGradient} opacity-30 animate-pulse`} />
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${modeGradient} text-white flex items-center justify-center shadow-lg relative z-10`}>
            <Icon size={32} />
          </div>
        </div>

        {/* Header Text */}
        <h2 className="text-xl font-extrabold text-[var(--text-heading)] mb-1">
          Connecting to {modeTitle}
        </h2>
        <p className="text-xs font-medium text-[var(--text-sub)] mb-6">
          Topic: <span className="text-[var(--primary)] font-bold">{topic}</span>
        </p>

        {/* Step-by-Step Progress */}
        <div className="space-y-3 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
          {steps.map((text, idx) => {
            const isDone = step > idx;
            const isCurrent = step === idx;

            return (
              <div key={idx} className="flex items-center gap-3 text-xs">
                {isDone ? (
                  <CheckCircle size={16} className="text-green-500 shrink-0" />
                ) : isCurrent ? (
                  <Radio size={16} className="text-[var(--primary)] animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className={`font-semibold ${
                  isDone 
                    ? 'text-gray-800' 
                    : isCurrent 
                    ? 'text-[var(--primary)] font-bold' 
                    : 'text-gray-400'
                }`}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors px-4 py-2"
        >
          Cancel Connection
        </button>

        {/* Decorative Light Glow */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-tr ${modeGradient} opacity-10 rounded-full blur-xl pointer-events-none`} />
      </motion.div>
    </div>
  );
}

export default ConnectingState;
