'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  Clock,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Volume2,
  VolumeX,
  TrendingUp,
  RotateCcw,
  Languages,
  BookOpen,
  Check,
  ChevronDown,
  Layers,
  Flame,
  FileText
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { PracticeSessionRecord, SessionReportData, ConversationTurn, LanguageMistake } from '@/types/voice';
import { speechPlayer } from '@/audio/speechPlayer';
import { Button } from '@/components/common/Button';

interface SessionReportDetailViewProps {
  sessionId: string;
  initialData?: {
    session?: PracticeSessionRecord;
    report?: SessionReportData;
    turns?: ConversationTurn[];
  };
  onBack: () => void;
  onStartPractice?: (topic?: string) => void;
}

export function SessionReportDetailView({
  sessionId,
  initialData,
  onBack,
  onStartPractice,
}: SessionReportDetailViewProps) {
  const [session, setSession] = useState<PracticeSessionRecord | null>(initialData?.session || null);
  const [report, setReport] = useState<SessionReportData | null>(initialData?.report || null);
  const [turns, setTurns] = useState<ConversationTurn[]>(initialData?.turns || []);
  const [loading, setLoading] = useState(!initialData?.report);
  
  // Audio playback state
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchReportDetail();
    }
  }, [sessionId]);

  const fetchReportDetail = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{
        session: PracticeSessionRecord;
        report: SessionReportData;
        turns: ConversationTurn[];
      }>(`/api/ai/reports/${sessionId}/`);
      if (data) {
        setSession(data.session);
        setReport(data.report);
        setTurns(data.turns || []);
      }
    } catch (err) {
      console.error('Failed to load report detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySpeech = (text: string, key: string, language: string = 'English', langCode: string = 'en-US') => {
    if (playingAudioKey === key) {
      speechPlayer.stop();
      setPlayingAudioKey(null);
      return;
    }

    speechPlayer.play(text, {
      key,
      language,
      langCode,
      onStart: () => setPlayingAudioKey(key),
      onEnd: () => setPlayingAudioKey(null),
      onError: () => setPlayingAudioKey(null),
    });
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 65) return 'text-blue-400';
    return 'text-amber-400';
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
    if (score >= 65) return 'bg-blue-500/15 border-blue-500/30 text-blue-300';
    return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
  };

  // Extract all mistakes across all turns
  const allMistakes: { mistake: LanguageMistake; turnIndex: number; userTranscript: string }[] = [];
  turns.forEach((t) => {
    if (t.speaker === 'user' && t.mistakes && t.mistakes.length > 0) {
      t.mistakes.forEach((m) => {
        allMistakes.push({
          mistake: m,
          turnIndex: t.turn_index,
          userTranscript: t.transcript,
        });
      });
    }
  });

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 gap-4 bg-slate-950 text-white rounded-[2rem] border border-slate-800">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-300">Compiling complete diagnostic report and grammar analysis...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 gap-4 bg-slate-950 text-white rounded-[2rem] p-8 text-center border border-slate-800">
        <AlertCircle size={48} className="text-amber-400" />
        <h2 className="text-xl font-bold">Report Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md">
          Unable to retrieve the session evaluation. Please check your connection and try again.
        </p>
        <Button variant="primary" onClick={onBack}>
          Back to Reports Hub
        </Button>
      </div>
    );
  }

  const topicName = session?.topic || report.topic || 'English Speaking Practice';
  const durationSecs = session?.duration_seconds || report.duration_seconds || 0;
  const endReason = session?.end_reason || report.end_reason || 'completed';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Top Navigation & Session Header */}
      <div className="px-5 sm:px-8 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 flex-wrap backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speechPlayer.stop();
              onBack();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Reports Hub</span>
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-black text-white">{topicName}</h1>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                endReason === 'max_duration_reached'
                  ? 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                  : endReason === 'inactivity_timeout'
                  ? 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                  : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
              }`}>
                {endReason === 'max_duration_reached'
                  ? '⏱️ 5-Min Cap'
                  : endReason === 'inactivity_timeout'
                  ? '🔇 30s Silence Auto-End'
                  : '🎉 Completed'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{formatDate(session?.started_at || report.created_at)}</span>
              <span>•</span>
              <span>Duration: <strong className="text-slate-200">{formatDuration(durationSecs)}</strong></span>
              <span>•</span>
              <span>Mistakes: <strong className="text-amber-400 font-bold">{allMistakes.length}</strong></span>
            </p>
          </div>
        </div>

        {/* Quick Jump Buttons & Practice Again */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => scrollToSection('sec-scorecard')}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors font-semibold cursor-pointer"
            >
              📊 Scorecard
            </button>
            <button
              onClick={() => scrollToSection('sec-conversation')}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors font-semibold cursor-pointer"
            >
              💬 Conversation & Corrections ({turns.length})
            </button>
          </div>

          {onStartPractice && (
            <Button
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2"
              onClick={() => {
                speechPlayer.stop();
                onStartPractice(topicName);
              }}
            >
              <RotateCcw size={14} />
              <span>Practice Again</span>
            </Button>
          )}
        </div>
      </div>

      {/* Unified Single Scrollable Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 space-y-10">
        
        {/* ======================================================== */}
        {/* SECTION 1: COMPREHENSIVE CEFR SCORECARD & METRICS        */}
        {/* ======================================================== */}
        <section id="sec-scorecard" className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-400">
            <Award size={16} />
            <span>1. Overall Assessment & CEFR Scorecard</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            {/* Overall Score Circle */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-3 shadow-md">
                <Award size={32} />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Overall Speaking Score
              </span>
              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className={`text-5xl sm:text-6xl font-black tracking-tight ${getScoreColor(report.overall_score)}`}>
                  {report.overall_score}
                </span>
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getScoreBadgeClass(report.overall_score)}`}>
                {report.overall_score >= 80 ? 'CEFR C1 • Proficient Spoken' : report.overall_score >= 65 ? 'CEFR B2 • Competent Conversational' : 'CEFR B1 • Developing Fluency'}
              </span>
            </div>

            {/* Sub-Score Bars & Examiner Summary */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4 relative z-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">Grammar</span>
                  <span className="text-xl font-black text-white">{report.grammar_score}%</span>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${report.grammar_score}%` }} />
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">Vocabulary</span>
                  <span className="text-xl font-black text-white">{report.vocabulary_score}%</span>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${report.vocabulary_score}%` }} />
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">Fluency</span>
                  <span className="text-xl font-black text-white">{report.fluency_score}%</span>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${report.fluency_score}%` }} />
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">Confidence</span>
                  <span className="text-xl font-black text-white">{report.confidence_score}%</span>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${report.confidence_score}%` }} />
                  </div>
                </div>
              </div>

              {/* Examiner Summary */}
              {report.summary && (
                <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed italic">
                  <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wider block not-italic mb-1">
                    Examiner Assessment Summary
                  </span>
                  "{report.summary}"
                </div>
              )}
            </div>

            <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Strengths, Recommendations & Practice Plan Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Strengths */}
            <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>What You Did Well</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.strengths && report.strengths.length > 0 ? (
                  report.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/60">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">Good conversational effort maintained throughout.</li>
                )}
              </ul>
            </div>

            {/* Actionable Recommendations */}
            <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <TrendingUp size={16} />
                <span>Growth & Improvement Areas</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.recommendations && report.recommendations.length > 0 ? (
                  report.recommendations.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/60">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">Continue regular daily speaking practice to build vocabulary speed.</li>
                )}
              </ul>
            </div>

            {/* 3-Day Action Plan */}
            <div className="bg-slate-900/90 p-5 rounded-3xl border border-indigo-500/20 bg-indigo-950/20 space-y-3">
              <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <Sparkles size={16} />
                <span>Suggested 3-Day Action Plan</span>
              </h3>
              <div className="space-y-2">
                {report.practice_plan && report.practice_plan.length > 0 ? (
                  report.practice_plan.map((step, idx) => (
                    <div key={idx} className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <span className="text-[10px] font-extrabold text-indigo-400 block mb-0.5">Day {idx + 1}</span>
                      <p className="text-slate-300 leading-snug">{step}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Practice 5 minutes daily on varied IELTS topics.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* INTERVIEW QUESTIONS & COACHING FEEDBACK (IF PRESENT)     */}
        {/* ======================================================== */}
        {report.question_feedback && report.question_feedback.length > 0 && (
          <section id="sec-interview-feedback" className="space-y-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                <Sparkles size={16} />
                <span>Interview Questions & Coaching Assessment ({report.question_feedback.length} questions)</span>
              </div>
              <span className="text-xs text-slate-400">
                Evaluated response scores & personalized suggestions for improvement
              </span>
            </div>

            <div className="space-y-4">
              {report.question_feedback.map((qItem, qIdx) => {
                const score = qItem.score || 0;
                const scoreColor = score >= 7 ? 'text-emerald-400' : score >= 4 ? 'text-amber-400' : 'text-red-400';
                const scoreBg = score >= 7 ? 'bg-emerald-500/10 border-emerald-500/30' : score >= 4 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

                return (
                  <div key={qIdx} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                          Q{qIdx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug">{qItem.question}</h4>
                      </div>
                      <span className={`text-xs font-black px-3 py-1 rounded-xl border ${scoreBg} ${scoreColor} shrink-0`}>
                        {score}/10
                      </span>
                    </div>

                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Candidate Spoken Response</span>
                      <p className="text-xs sm:text-sm text-slate-300 italic">
                        "{qItem.answer || '(No answer provided)'}"
                      </p>
                    </div>

                    {qItem.tip && (
                      <div className="bg-indigo-950/30 border border-indigo-500/25 rounded-xl p-3.5 flex items-start gap-2.5">
                        <TrendingUp size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 flex-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">Coaching Tip for Next Time</span>
                          <p className="text-xs text-slate-200 leading-relaxed">{qItem.tip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: COMPLETE CONVERSATION CHAT WITH CORRECTIONS   */}
        {/* ======================================================== */}
        <section id="sec-conversation" className="space-y-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-400">
              <MessageSquare size={16} />
              <span>2. Complete Conversation Dialogue with Inline Corrections ({turns.length} turns)</span>
            </div>
            <span className="text-xs text-slate-400">
              Full chronological transcript with detailed grammar corrections and native explanations
            </span>
          </div>

          <div className="space-y-5">
            {turns.map((turn, tIdx) => {
              const isUser = turn.speaker === 'user';
              const hasMistakes = isUser && turn.mistakes && turn.mistakes.length > 0;

              return (
                <div
                  key={turn.id || tIdx}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                    isUser
                      ? hasMistakes
                        ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/40 shadow-lg'
                        : 'bg-blue-950/20 border-blue-500/30'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  {/* Turn Header */}
                  <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                        isUser
                          ? hasMistakes
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isUser ? 'Student' : 'AI Teacher'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Turn #{turn.turn_index + 1}</span>

                      {hasMistakes && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                          <AlertCircle size={11} />
                          <span>{turn.mistakes?.length} mistake{turn.mistakes && turn.mistakes.length > 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handlePlaySpeech(turn.transcript, `chat-turn-${turn.id || tIdx}`)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        playingAudioKey === `chat-turn-${turn.id || tIdx}`
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                      }`}
                    >
                      {playingAudioKey === `chat-turn-${turn.id || tIdx}` ? (
                        <>
                          <VolumeX size={13} className="text-white animate-pulse" />
                          <span className="text-[10px]">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} />
                          <span className="text-[10px]">Listen</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Utterance Text Bubble */}
                  <p className="text-sm text-slate-100 font-medium leading-relaxed">
                    "{turn.transcript}"
                  </p>

                  {/* Attached Mistakes and Corrections for this specific turn */}
                  {hasMistakes && (
                    <div className="mt-4 pt-3 border-t border-slate-800/90 space-y-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Linguistic Feedback & Correction for this turn:</span>
                      </span>

                      <div className="grid gap-3">
                        {turn.mistakes?.map((mistake: LanguageMistake, mIdx: number) => (
                          <div
                            key={mistake.id || mIdx}
                            className="bg-slate-950/90 p-4 rounded-xl border border-amber-500/30 space-y-3 shadow-md"
                          >
                            {/* Category Header */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                                  {mistake.category || 'Grammar'}
                                </span>
                                <span className="text-[9px] uppercase font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  Severity: {mistake.severity || 'minor'}
                                </span>
                              </div>

                              <button
                                onClick={() =>
                                  handlePlaySpeech(
                                    mistake.corrected_text,
                                    `chat-corr-${mistake.id || mIdx}`,
                                    'English',
                                    'en-US'
                                  )
                                }
                                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/25 transition-colors"
                              >
                                <Volume2 size={12} />
                                <span>Hear Corrected English</span>
                              </button>
                            </div>

                            {/* Comparison: Spoken vs Corrected */}
                            <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                              <div className="bg-red-950/25 p-3 rounded-xl border border-red-500/30">
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block mb-1">
                                  ❌ What you said:
                                </span>
                                <p className="text-red-200 line-through font-semibold text-sm">
                                  "{mistake.original_text}"
                                </p>
                              </div>

                              <div className="bg-emerald-950/25 p-3 rounded-xl border border-emerald-500/30">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block mb-1">
                                  ✅ Corrected English:
                                </span>
                                <p className="text-emerald-200 font-bold text-sm">
                                  "{mistake.corrected_text}"
                                </p>
                              </div>
                            </div>

                            {/* Grammar Rule */}
                            {mistake.explanation && (
                              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 block flex items-center gap-1">
                                  <BookOpen size={12} />
                                  <span>Grammar Concept & Rule:</span>
                                </span>
                                <p className="text-slate-200 leading-relaxed font-medium">
                                  {mistake.explanation}
                                </p>
                              </div>
                            )}

                            {/* Native Language Explanation */}
                            {mistake.native_explanation && (
                              <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 p-3.5 rounded-xl border border-indigo-500/30 text-xs space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                                    <Languages size={13} className="text-indigo-400" />
                                    <span>Native Language Explanation (मातृभाषा व्याख्या):</span>
                                  </span>
                                  <button
                                    onClick={() =>
                                      handlePlaySpeech(
                                        mistake.native_explanation || '',
                                        `chat-native-${mistake.id || mIdx}`,
                                        'Hindi',
                                        'hi-IN'
                                      )
                                    }
                                    className="text-[10px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-400/30 transition-colors"
                                  >
                                    <Volume2 size={11} />
                                    <span>सुनें (Listen)</span>
                                  </button>
                                </div>
                                <p className="text-indigo-100 leading-relaxed font-medium">
                                  {mistake.native_explanation}
                                </p>
                              </div>
                            )}

                            {/* Band 8 Alternative */}
                            {mistake.better_alternative && (
                              <div className="bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-500/30 text-xs flex items-start gap-2">
                                <Sparkles size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[10px] font-bold text-cyan-300 block">Band 8+ / C1 Alternative:</span>
                                  <p className="text-cyan-100 font-semibold">{mistake.better_alternative}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Footer Return Bar */}
      <div className="px-6 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <button
          onClick={() => {
            speechPlayer.stop();
            onBack();
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
        >
          Return to Reports Hub
        </button>

        {onStartPractice && (
          <Button
            variant="primary"
            size="sm"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/30"
            onClick={() => {
              speechPlayer.stop();
              onStartPractice(topicName);
            }}
          >
            Start Another Practice Session
          </Button>
        )}
      </div>
    </div>
  );
}

export default SessionReportDetailView;
