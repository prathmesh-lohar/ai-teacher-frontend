'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type InterviewerState = 'idle' | 'talking' | 'listening';

interface AnimatedInterviewerProps {
  state: InterviewerState;
  speakerName?: string;
  size?: number;
}

export default function AnimatedInterviewer({
  state,
  speakerName = 'Interviewer',
  size = 200,
}: AnimatedInterviewerProps) {
  const isTalking = state === 'talking';
  const isListening = state === 'listening';

  // Responsive scaling factor relative to base 200px
  const scale = size / 200;

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Outer Studio Stage Container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size + 60, height: size + 60 }}
      >
        {/* Ambient Talking Soundwave Rings */}
        {isTalking && (
          <>
            <motion.div
              className="absolute rounded-full border-2 border-indigo-500/30"
              style={{ width: size + 36, height: size + 36 }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 0.15, 0.6],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full border-2 border-violet-500/20"
              style={{ width: size + 64, height: size + 64 }}
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.4, 0.05, 0.4],
              }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.2, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Listening Glow Halo */}
        {isListening && (
          <motion.div
            className="absolute rounded-full border-2 border-emerald-500/40 bg-emerald-500/5"
            style={{ width: size + 32, height: size + 32 }}
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.8, 0.3, 0.8],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Character Portrait Stage Frame */}
        <div
          className={`relative rounded-full overflow-hidden shadow-2xl transition-all duration-500 flex items-center justify-center ${
            isTalking
              ? 'ring-4 ring-indigo-500/60 shadow-indigo-500/30'
              : isListening
              ? 'ring-4 ring-emerald-500/60 shadow-emerald-500/25'
              : 'ring-2 ring-white/15'
          }`}
          style={{
            width: size,
            height: size,
            background: 'radial-gradient(circle at 50% 35%, #1e1b4b 0%, #0f172a 70%, #020617 100%)',
          }}
        >
          {/* Subtle Stage Studio Lighting */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-indigo-500/10 pointer-events-none" />

          {/* Animated Character Body & Head */}
          <motion.div
            className="relative flex flex-col items-center justify-center w-full h-full"
            animate={
              isTalking
                ? {
                    y: [0, -3.5, 1, -2.5, 0],
                    rotate: [-1.2, 1, -0.8, 1.4, 0],
                  }
                : isListening
                ? {
                    y: [0, 1.5, 0],
                    rotate: [1.8, 2.2, 1.8],
                  }
                : {
                    y: [0, -1.5, 0],
                    rotate: 0,
                  }
            }
            transition={
              isTalking
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : isListening
                ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ transformOrigin: 'bottom center' }}
          >
            {/* SVG Character Illustration */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Skin gradient */}
                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FCD5B5" />
                  <stop offset="100%" stopColor="#F5B28B" />
                </linearGradient>
                {/* Hair gradient */}
                <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D1B36" />
                  <stop offset="100%" stopColor="#1A1024" />
                </linearGradient>
                {/* Suit blazer gradient */}
                <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#312E81" />
                  <stop offset="100%" stopColor="#1E1B4B" />
                </linearGradient>
                {/* Shirt gradient */}
                <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F8FAFC" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
                {/* Headset gradient */}
                <linearGradient id="headsetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>

              {/* ── SHOULDERS / SUIT ──────────────────────────────── */}
              <g id="body">
                {/* Blazer shoulders */}
                <path
                  d="M30 200 C35 155 60 145 100 145 C140 145 165 155 170 200 Z"
                  fill="url(#blazerGrad)"
                />
                {/* Shirt Collar / V-Neck */}
                <path
                  d="M80 145 L100 180 L120 145 Z"
                  fill="url(#shirtGrad)"
                />
                {/* Lapels */}
                <path
                  d="M75 145 L95 185 L85 195 L65 152 Z"
                  fill="#282566"
                />
                <path
                  d="M125 145 L105 185 L115 195 L135 152 Z"
                  fill="#282566"
                />
                {/* Tie / Pendant */}
                <path
                  d="M97 175 L103 175 L101 200 L99 200 Z"
                  fill="#6366F1"
                />
              </g>

              {/* ── NECK ───────────────────────────────────────────── */}
              <rect x="88" y="125" width="24" height="26" rx="6" fill="#F0A67E" />

              {/* ── HEAD & EARS ────────────────────────────────────── */}
              <g id="head">
                {/* Ears */}
                <ellipse cx="61" cy="98" rx="7" ry="11" fill="#F5B28B" />
                <ellipse cx="139" cy="98" rx="7" ry="11" fill="#F5B28B" />

                {/* Head base */}
                <ellipse cx="100" cy="96" rx="40" ry="46" fill="url(#skinGrad)" />

                {/* Cheek Blush */}
                <ellipse cx="74" cy="107" rx="6" ry="3.5" fill="#F87171" opacity="0.35" />
                <ellipse cx="126" cy="107" rx="6" ry="3.5" fill="#F87171" opacity="0.35" />

                {/* Professional Hair Back/Top */}
                <path
                  d="M58 85 C56 50 75 42 100 42 C125 42 144 50 142 85 C135 68 128 62 100 62 C72 62 65 68 58 85 Z"
                  fill="url(#hairGrad)"
                />
                <path
                  d="M58 85 C54 100 58 115 62 118 C64 105 66 90 70 80 Z"
                  fill="url(#hairGrad)"
                />
                <path
                  d="M142 85 C146 100 142 115 138 118 C136 105 134 90 130 80 Z"
                  fill="url(#hairGrad)"
                />

                {/* Modern Studio Headset Band */}
                <path
                  d="M58 90 C56 55 76 40 100 40 C124 40 144 55 142 90"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Headset Ear Cushions */}
                <rect x="52" y="86" width="9" height="22" rx="4" fill="#312E81" />
                <rect x="139" y="86" width="9" height="22" rx="4" fill="#312E81" />
                {/* Headset Microphone Boom */}
                <path
                  d="M56 102 Q60 126 80 126"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Mic Tip / LED */}
                <circle
                  cx="81"
                  cy="126"
                  r="3.5"
                  fill={isTalking ? '#818CF8' : isListening ? '#34D399' : '#64748B'}
                />

                {/* Eyebrows */}
                <path
                  d="M72 82 Q81 78 89 82"
                  fill="none"
                  stroke="#2D1B36"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M111 82 Q119 78 128 82"
                  fill="none"
                  stroke="#2D1B36"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Nose */}
                <path
                  d="M100 95 Q102 104 97 106 L103 106"
                  fill="none"
                  stroke="#E08B67"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            </svg>

            {/* ── ANIMATED EYES (Natural periodic blinking) ───────────── */}
            <div
              className="absolute flex items-center justify-between pointer-events-none"
              style={{
                top: '43.5%',
                width: '38%',
                left: '31%',
              }}
            >
              {/* Left Eye */}
              <motion.div
                className="relative bg-white rounded-full flex items-center justify-center overflow-hidden shadow-xs"
                style={{ width: 14 * scale, height: 11 * scale }}
                animate={
                  isTalking
                    ? { scaleY: [1, 1, 0.08, 1, 1, 1, 0.08, 1] }
                    : isListening
                    ? { scaleY: [1, 1, 1, 0.08, 1, 1] }
                    : { scaleY: [1, 1, 1, 1, 0.08, 1] }
                }
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  times: [0, 0.42, 0.45, 0.49, 0.88, 0.91, 0.95, 1],
                  ease: 'easeInOut',
                }}
              >
                {/* Iris & Pupil */}
                <div
                  className="rounded-full bg-[#1e1b4b] relative flex items-center justify-center"
                  style={{ width: 8.5 * scale, height: 8.5 * scale }}
                >
                  <div
                    className="absolute bg-[#3b82f6] rounded-full"
                    style={{ width: 4 * scale, height: 4 * scale }}
                  />
                  {/* Catchlight reflection */}
                  <div
                    className="absolute top-0.5 right-0.5 bg-white rounded-full"
                    style={{ width: 2.5 * scale, height: 2.5 * scale }}
                  />
                </div>
              </motion.div>

              {/* Right Eye */}
              <motion.div
                className="relative bg-white rounded-full flex items-center justify-center overflow-hidden shadow-xs"
                style={{ width: 14 * scale, height: 11 * scale }}
                animate={
                  isTalking
                    ? { scaleY: [1, 1, 0.08, 1, 1, 1, 0.08, 1] }
                    : isListening
                    ? { scaleY: [1, 1, 1, 0.08, 1, 1] }
                    : { scaleY: [1, 1, 1, 1, 0.08, 1] }
                }
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  times: [0, 0.42, 0.45, 0.49, 0.88, 0.91, 0.95, 1],
                  ease: 'easeInOut',
                }}
              >
                {/* Iris & Pupil */}
                <div
                  className="rounded-full bg-[#1e1b4b] relative flex items-center justify-center"
                  style={{ width: 8.5 * scale, height: 8.5 * scale }}
                >
                  <div
                    className="absolute bg-[#3b82f6] rounded-full"
                    style={{ width: 4 * scale, height: 4 * scale }}
                  />
                  {/* Catchlight reflection */}
                  <div
                    className="absolute top-0.5 right-0.5 bg-white rounded-full"
                    style={{ width: 2.5 * scale, height: 2.5 * scale }}
                  />
                </div>
              </motion.div>
            </div>

            {/* ── ANIMATED TALKING MOUTH (The Core Talking Effect!) ──── */}
            <div
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                top: '57%',
                width: '100%',
              }}
            >
              {isTalking ? (
                /* TALKING MOUTH: Opens, shifts vowel/consonant shapes, reveals teeth and tongue */
                <motion.div
                  className="bg-[#4a121a] overflow-hidden relative shadow-inner border border-[#3b0b12]"
                  animate={{
                    height: [
                      5 * scale,
                      18 * scale,
                      8 * scale,
                      22 * scale,
                      11 * scale,
                      19 * scale,
                      6 * scale,
                      24 * scale,
                      13 * scale,
                      5 * scale,
                    ],
                    width: [
                      24 * scale,
                      30 * scale,
                      26 * scale,
                      33 * scale,
                      25 * scale,
                      29 * scale,
                      26 * scale,
                      34 * scale,
                      28 * scale,
                      24 * scale,
                    ],
                    borderRadius: [
                      '6px 6px 10px 10px',
                      '14px 14px 18px 18px',
                      '8px 8px 12px 12px',
                      '18px 18px 22px 22px',
                      '10px 10px 14px 14px',
                      '14px 14px 18px 18px',
                      '6px 6px 10px 10px',
                      '20px 20px 24px 24px',
                      '12px 12px 16px 16px',
                      '6px 6px 10px 10px',
                    ],
                  }}
                  transition={{
                    duration: 1.05,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Upper Teeth */}
                  <div
                    className="absolute top-0 inset-x-1.5 bg-white/95 rounded-b-sm shadow-xs"
                    style={{ height: 4.5 * scale }}
                  />
                  {/* Tongue depth */}
                  <motion.div
                    className="absolute bottom-0 inset-x-2 bg-[#e0657b] rounded-t-full"
                    style={{ height: 6 * scale }}
                    animate={{ scaleY: [0.8, 1.3, 0.7, 1.2, 0.8] }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              ) : isListening ? (
                /* LISTENING MOUTH: Attentive, gentle pleasant closed smile */
                <div
                  className="border-b-[2.5px] border-[#993b48] rounded-b-full transition-all"
                  style={{ width: 22 * scale, height: 4.5 * scale }}
                />
              ) : (
                /* IDLE / READY MOUTH: Relaxed neutral pleasant line */
                <div
                  className="border-b-2 border-[#993b48] rounded-b-full transition-all"
                  style={{ width: 19 * scale, height: 2.5 * scale }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dynamic Sound Waveform Visualizer (Active when talking) */}
      <div className="h-6 flex items-center justify-center gap-1">
        {isTalking ? (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            {[8, 16, 22, 14, 26, 18, 10].map((h, i) => (
              <motion.span
                key={i}
                className="w-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full inline-block"
                animate={{
                  height: [4, h, 6, h * 0.7, 4],
                }}
                transition={{
                  duration: 0.55,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: 'easeInOut',
                }}
              />
            ))}
            <span className="text-[10px] font-bold text-indigo-300 ml-1.5 uppercase tracking-wider">
              Speaking
            </span>
          </div>
        ) : isListening ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
              Listening to you...
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Ready
            </span>
          </div>
        )}
      </div>

      {/* Speaker Name Tag */}
      <div className="flex flex-col items-center">
        <span className="text-white font-bold text-base tracking-tight">{speakerName}</span>
        <span className="text-slate-400 text-xs">AI Interviewer</span>
      </div>
    </div>
  );
}
