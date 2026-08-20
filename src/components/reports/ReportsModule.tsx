'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Calendar,
  Clock,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Volume2,
  VolumeX,
  X,
  RotateCcw,
  FileText,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { PracticeSessionRecord, ReportsResponse, SessionReportData, ConversationTurn } from '@/types/voice';
import { speechPlayer } from '@/audio/speechPlayer';
import { Button } from '@/components/common/Button';
import { SessionReportDetailView } from './SessionReportDetailView';

interface ReportsModuleProps {
  onStartPractice?: (topic?: string) => void;
}

export function ReportsModule({ onStartPractice }: ReportsModuleProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<PracticeSessionRecord[]>([]);
  const [stats, setStats] = useState<ReportsResponse['stats']>({
    total_sessions: 0,
    total_seconds: 0,
    total_minutes: 0,
    avg_overall_score: 0,
    avg_grammar_score: 0,
    avg_fluency_score: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all');
  const [selectedScoreFilter, setSelectedScoreFilter] = useState('all');
  
  // Selected Report for Deep Dive Inspection
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<{
    session: PracticeSessionRecord;
    report: SessionReportData;
    turns: ConversationTurn[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'feedback' | 'transcript'>('feedback');
  const [playingTurnId, setPlayingTurnId] = useState<number | null>(null);

  const fetchReports = async () => {
    if (!isAuthenticated) {
      setReports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<ReportsResponse>('/api/ai/reports/');
      if (data && data.reports) {
        setReports(data.reports);
        if (data.stats) setStats(data.stats);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.warn('Failed to fetch reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchReports();
      } else {
        setLoading(false);
        setReports([]);
      }
    }
  }, [isAuthenticated, authLoading]);

  // Fetch full report & transcript details when a session is selected
  const handleSelectReport = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setLoadingDetail(true);
    try {
      const detail = await apiFetch<{
        session: PracticeSessionRecord;
        report: SessionReportData;
        turns: ConversationTurn[];
      }>(`/api/ai/reports/${sessionId}/`);
      if (detail && detail.report) {
        setSelectedReportDetail(detail);
      }
    } catch (err) {
      console.error('Failed to fetch report detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePlaySpeech = (text: string, turnId: number) => {
    if (playingTurnId === turnId) {
      speechPlayer.stop();
      setPlayingTurnId(null);
      return;
    }

    speechPlayer.play(text, {
      key: `turn-${turnId}`,
      language: 'English',
      langCode: 'en-US',
      onStart: () => setPlayingTurnId(turnId),
      onEnd: () => setPlayingTurnId(null),
      onError: () => setPlayingTurnId(null),
    });
  };

  const formatDuration = (secs: number) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
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
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  // Filtered reports
  const filteredReports = reports.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.report?.summary && item.report.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic =
      selectedTopicFilter === 'all' || item.topic.toLowerCase().includes(selectedTopicFilter.toLowerCase());

    const hasReport = !!item.report;
    const score = item.report?.overall_score || 0;
    const matchesScore =
      selectedScoreFilter === 'all' ||
      (selectedScoreFilter === 'high' && hasReport && score >= 80) ||
      (selectedScoreFilter === 'medium' && hasReport && score >= 65 && score < 80) ||
      (selectedScoreFilter === 'low' && hasReport && score < 65) ||
      (selectedScoreFilter === 'pending' && !hasReport);

    return matchesSearch && matchesTopic && matchesScore;
  });

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
          <FileText size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Sign In to View Your Reports</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Please log in to your account to view your personal speech practice history, CEFR performance scores, and conversation feedback.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            if (typeof window !== 'undefined') window.location.href = '/login';
          }}
          className="mt-2"
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  // If a report is selected, render the dedicated full-page Report & Transcript View!
  if (selectedSessionId) {
    return (
      <SessionReportDetailView
        sessionId={selectedSessionId}
        onBack={() => {
          setSelectedSessionId(null);
          fetchReports();
        }}
        onStartPractice={onStartPractice}
      />
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden shrink-0">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-300 text-xs font-extrabold uppercase tracking-wider">
              Performance Analytics
            </span>
            <span className="text-xs text-slate-300 font-medium">• CEFR AI Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Voice Practice Reports & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Review detailed feedback from your AI conversations, grammar corrections, vocabulary breakdown, and fluency progress reports.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          {onStartPractice && (
            <Button
              variant="primary"
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 rounded-2xl flex items-center gap-2"
              onClick={() => onStartPractice()}
            >
              <Sparkles size={16} />
              <span>Start New Talk Session</span>
            </Button>
          )}
        </div>

       
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      </div> */}

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500">Total Sessions</span>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats.total_sessions}</p>
            <span className="text-[10px] font-bold text-emerald-600">All Completed Sessions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[var(--primary)] flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500">Practice Time</span>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats.total_minutes}m</p>
            <span className="text-[10px] font-bold text-blue-600">Total Speaking Time</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500">Avg Overall Score</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.avg_overall_score}%</p>
            <span className="text-[10px] font-bold text-emerald-600">CEFR Benchmark</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award size={24} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500">Avg Fluency</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-600">{stats.avg_fluency_score}%</p>
            <span className="text-[10px] font-bold text-blue-600">Spoken Naturalness</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm shrink-0">
        <div className="relative flex-1 w-full">
          <Search size={16} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reports by topic or summary keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Topic Filter */}
          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">All Topics</option>
            <option value="ielts">IELTS Speaking</option>
            <option value="interview">Job Interview</option>
            <option value="casual">Daily Casual</option>
            <option value="business">Business</option>
          </select>

          {/* Score Filter */}
          <select
            value={selectedScoreFilter}
            onChange={(e) => setSelectedScoreFilter(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">All Sessions ({reports.length})</option>
            <option value="high">Score 80%+ (Proficient)</option>
            <option value="medium">Score 65-79% (Competent)</option>
            <option value="low">Score &lt; 65% (Developing)</option>
            <option value="pending">Needs Evaluation</option>
          </select>

          <button
            onClick={fetchReports}
            title="Refresh Reports"
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-100 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Reports List / Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-gray-500">Loading your performance reports...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No practice reports found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              {reports.length === 0
                ? `${user?.first_name || user?.username || 'You'} have not completed any AI voice practice sessions yet. Start a conversation to receive instant diagnostic reports.`
                : 'No reports matched your search filters. Try adjusting your search query.'}
            </p>
            {onStartPractice && (
              <Button
                variant="primary"
                size="md"
                onClick={() => onStartPractice()}
                className="mt-2"
              >
                Start Voice Practice Now
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((session) => {
              const rep = session.report;
              const hasReport = !!rep;
              const score = rep?.overall_score;

              return (
                <motion.div
                  key={session.id}
                  whileHover={{ y: -3 }}
                  onClick={() => handleSelectReport(session.id)}
                  className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Top: Topic, Date, and Score */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wide px-2 py-0.5 rounded-md bg-blue-50">
                          {session.session_type || 'Voice Session'}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 mt-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {session.topic}
                        </h4>
                      </div>

                      {hasReport && score !== undefined ? (
                        <div className={`px-2.5 py-1 rounded-xl border text-xs font-black shrink-0 ${getScoreColor(score)}`}>
                          {score}/100
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>Generate Report</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata: Date, Duration, End Reason */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{formatDate(session.started_at)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        <span>{formatDuration(session.duration_seconds)}</span>
                      </div>
                      {session.end_reason && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {session.end_reason === 'max_duration_reached'
                              ? '5-min cap'
                              : session.end_reason === 'inactivity_timeout'
                              ? '30s silence'
                              : 'completed'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Sub-Score Bars */}
                    {rep ? (
                      <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-t border-b border-gray-50 text-[10px]">
                        <div>
                          <span className="text-gray-400 font-semibold block">Grammar</span>
                          <span className="font-bold text-gray-800">{rep.grammar_score}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block">Vocabulary</span>
                          <span className="font-bold text-gray-800">{rep.vocabulary_score}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block">Fluency</span>
                          <span className="font-bold text-gray-800">{rep.fluency_score}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2.5 my-2 border-t border-b border-gray-50 text-[11px] text-slate-500 italic">
                        Conversation recorded. Click to generate instant AI score breakdown & transcript review.
                      </div>
                    )}

                    {/* Summary Excerpt */}
                    {rep?.summary && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic mb-3">
                        "{rep.summary}"
                      </p>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={13} />
                      <span>{session.turns_count || 0} dialogue turns</span>
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{hasReport ? 'View Full Report' : 'Generate Report'}</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsModule;
