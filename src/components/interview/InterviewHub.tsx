'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, RefreshCw, UserCircle, ChevronRight,
  Clock, MessageSquare, Layers, Filter
} from 'lucide-react';
import { fetchUserModules } from '@/services/interviewService';
import type { InterviewModule, InterviewReport } from '@/types/interview';
import { useAuth } from '@/context/AuthContext';
import SessionRunner from './SessionRunner';
import SessionReport from './SessionReport';

const EXPERIENCE_LABELS: Record<string, string> = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior',
  lead_exec: 'Lead / Exec',
};

type HubView = 'hub' | 'session' | 'report';

interface InterviewHubProps {
  onViewReport?: (sessionId: string) => void;
}

export default function InterviewHub({ onViewReport }: InterviewHubProps = {}) {
  const { user } = useAuth();
  const profile = user?.profile;

  const [view, setView] = useState<HubView>('hub');
  const [modules, setModules] = useState<InterviewModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModule, setActiveModule] = useState<InterviewModule | null>(null);
  const [activeReport, setActiveReport] = useState<InterviewReport | null>(null);
  const [filterTab, setFilterTab] = useState<'for_you' | 'all'>('for_you');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUserModules();
      setModules(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter logic: fuzzy match for "for_you", fallback to all modules if empty
  const filteredModules = filterTab === 'for_you'
    ? (() => {
        if (!profile?.interview_field) return modules;
        const uField = profile.interview_field.toLowerCase().trim();
        const matches = modules.filter((m) => {
          const mField = (m.field || '').toLowerCase().trim();
          return mField === 'all' || mField.includes(uField) || uField.includes(mField);
        });
        return matches.length > 0 ? matches : modules;
      })()
    : modules;

  const handleStartSession = (mod: InterviewModule) => {
    setActiveModule(mod);
    setView('session');
  };

  const handleSessionComplete = (report: InterviewReport) => {
    setActiveReport(report);
    if (onViewReport && report.session_id) {
      onViewReport(`interview-${report.session_id}`);
    } else {
      setView('report');
    }
  };

  const handleRetake = () => {
    if (activeModule) setView('session');
  };

  const handleBackToHub = () => {
    setActiveModule(null);
    setActiveReport(null);
    setView('hub');
  };

  // ── Session view ─────────────────────────────────────────────────────────
  if (view === 'session' && activeModule) {
    return (
      <SessionRunner
        module={activeModule}
        onComplete={handleSessionComplete}
        onExit={handleBackToHub}
      />
    );
  }

  // ── Report view ──────────────────────────────────────────────────────────
  if (view === 'report' && activeReport) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-[var(--text-heading)]">Session Report</h2>
          <p className="text-xs text-[var(--text-sub)] mt-0.5">{activeReport.module_title}</p>
        </div>
        <SessionReport
          report={activeReport}
          onRetake={handleRetake}
          onBack={handleBackToHub}
        />
      </div>
    );
  }

  // ── Hub view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2.5">
            <Briefcase size={22} className="text-[var(--primary)]" />
            Interview Prep
          </h2>
          {profile?.target_role && (
            <p className="text-sm text-[var(--text-sub)] mt-1">
              Tailored for <span className="font-semibold text-[var(--text-body)]">{profile.target_role}</span>
              {profile.interview_field && (
                <span className="text-[var(--text-sub)]"> · {profile.interview_field}</span>
              )}
              {profile.experience_level && (
                <span className="ml-2 text-xs bg-[var(--primary-soft)] text-[var(--primary)] px-2 py-0.5 rounded-lg font-medium">
                  {EXPERIENCE_LABELS[profile.experience_level] || profile.experience_level}
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="p-2 rounded-xl border border-gray-200 text-[var(--text-sub)] hover:bg-gray-50 hover:text-[var(--primary)] transition-all"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { id: 'for_you', label: '✦ For You' },
          { id: 'all', label: 'All Modules' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              filterTab === tab.id
                ? 'bg-[var(--primary)] text-white border-transparent shadow-sm'
                : 'bg-white border-gray-200 text-[var(--text-sub)] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredModules.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary-soft)] flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} className="text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-heading)] mb-2">No modules available yet</h3>
          {filterTab === 'for_you' ? (
            <p className="text-[var(--text-sub)] text-sm mb-4">
              No modules match your profile settings. Update your interview profile or browse all modules.
            </p>
          ) : (
            <p className="text-[var(--text-sub)] text-sm mb-4">
              No interview modules have been published yet.
            </p>
          )}
          {filterTab === 'for_you' && (
            <button
              onClick={() => setFilterTab('all')}
              className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--primary-hover)] transition-all"
            >
              Browse All Modules
            </button>
          )}
        </motion.div>
      )}

      {/* Module cards */}
      {!loading && filteredModules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredModules.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group bg-white border border-gray-100 rounded-3xl p-5 hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all cursor-pointer"
                onClick={() => handleStartSession(mod)}
              >
                {/* Tags row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-[var(--primary-soft)] text-[var(--primary)] px-2.5 py-1 rounded-lg font-medium">
                    {mod.field === 'all' ? 'All Fields' : mod.field}
                  </span>
                  {mod.experience_level && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg font-medium">
                      {EXPERIENCE_LABELS[mod.experience_level] || mod.experience_level}
                    </span>
                  )}
                  {mod.module_type === 'panel' && (
                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      Panel
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-[var(--text-heading)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                  {mod.title}
                </h3>
                {mod.description && (
                  <p className="text-xs text-[var(--text-sub)] mb-3 line-clamp-2">{mod.description}</p>
                )}
                {mod.target_role && (
                  <p className="text-xs text-[var(--text-sub)] mb-3">
                    Role: <span className="text-[var(--text-body)] font-medium">{mod.target_role}</span>
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-[var(--text-sub)]">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {mod.question_count} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      ~{Math.ceil(mod.question_count * 2)} min
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--primary)] text-xs font-semibold group-hover:gap-2 transition-all">
                    Start Practice
                    <ChevronRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* No interview profile set */}
      {!profile?.interview_field && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4">
          <UserCircle size={22} className="text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Set up your interview profile</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Configure your career field and target role to get personalized module recommendations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
