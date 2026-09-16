'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ArrowLeft, ChevronDown, ChevronUp, Star, TrendingUp, MessageSquare } from 'lucide-react';
import type { InterviewReport, QuestionFeedback } from '@/types/interview';

interface SessionReportProps {
  report: InterviewReport;
  onRetake: () => void;
  onBack: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

function QuestionFeedbackCard({ item, index }: { item: QuestionFeedback; index: number }) {
  const [open, setOpen] = useState(false);
  const scoreColor = item.score >= 7 ? 'text-emerald-400' : item.score >= 4 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = item.score >= 7 ? 'bg-emerald-500/10 border-emerald-500/20' : item.score >= 4 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-white/10 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="w-7 h-7 rounded-xl bg-white/10 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <p className="flex-1 text-sm text-white truncate">{item.question}</p>
        <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${scoreBg} ${scoreColor} shrink-0`}>
          {item.score}/10
        </span>
        {open ? <ChevronUp size={15} className="text-slate-500 shrink-0" /> : <ChevronDown size={15} className="text-slate-500 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 px-4 py-4 space-y-3 bg-black/20"
          >
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5"><MessageSquare size={11} /> Your Answer</p>
              <p className="text-sm text-slate-300 italic">
                {item.answer || <span className="text-slate-600">(no answer recorded)</span>}
              </p>
            </div>
            {item.tip && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-2.5">
                <p className="text-xs text-indigo-300 font-medium mb-1 flex items-center gap-1.5">
                  <TrendingUp size={11} /> Improvement Tip
                </p>
                <p className="text-sm text-slate-300">{item.tip}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SessionReport({ report, onRetake, onBack }: SessionReportProps) {
  const scoreLabel =
    report.overall_score >= 80 ? 'Excellent' :
    report.overall_score >= 60 ? 'Good' :
    report.overall_score >= 40 ? 'Fair' : 'Needs Practice';

  const scoreEmoji =
    report.overall_score >= 80 ? '🌟' :
    report.overall_score >= 60 ? '👍' :
    report.overall_score >= 40 ? '💪' : '📖';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 space-y-8 max-w-2xl mx-auto w-full"
    >
      {/* Score header */}
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-sm mb-4"
        >
          {report.module_title} — Interview Complete
        </motion.p>

        <div className="flex flex-col items-center gap-3 mb-6">
          <ScoreRing score={report.overall_score} />
          <div>
            <p className="text-xl font-bold text-white">
              {scoreEmoji} {scoreLabel}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">Overall Performance Score</p>
          </div>
        </div>

        {/* Summary */}
        {report.summary && (
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-left">
            <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5">
              <Star size={11} className="text-amber-400" /> AI Coach Summary
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
          </div>
        )}
      </div>

      {/* Per-question feedback */}
      {report.question_feedback?.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-medium mb-3">Question-by-Question Feedback</p>
          <div className="space-y-2">
            {report.question_feedback.map((item, i) => (
              <QuestionFeedbackCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white transition-all text-sm flex-1 justify-center"
        >
          <ArrowLeft size={15} />
          Interview Hub
        </button>
        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 flex-1 justify-center"
        >
          <RotateCcw size={15} />
          Retake Interview
        </button>
      </div>
    </motion.div>
  );
}
