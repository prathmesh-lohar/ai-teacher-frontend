'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff, Briefcase, RefreshCw, Sparkles } from 'lucide-react';
import { fetchAdminModules, deleteModule, updateModule } from '@/services/interviewService';
import type { InterviewModule } from '@/types/interview';
import ModuleCreator from './ModuleCreator';

const EXPERIENCE_LABELS: Record<string, string> = {
  entry: 'Entry',
  mid: 'Mid',
  senior: 'Senior',
  lead_exec: 'Lead/Exec',
};

export default function ModuleList() {
  const [modules, setModules] = useState<InterviewModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  const [creatorInitialStep, setCreatorInitialStep] = useState<number>(0);
  const [editingModule, setEditingModule] = useState<InterviewModule | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadModules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminModules();
      setModules(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadModules(); }, [loadModules]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this module? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteModule(id);
      setModules((prev) => prev.filter((m) => m.id !== id));
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (mod: InterviewModule) => {
    setTogglingId(mod.id);
    try {
      const updated = await updateModule(mod.id, { is_published: !mod.is_published });
      setModules((prev) => prev.map((m) => (m.id === mod.id ? updated : m)));
    } catch (e: any) {
      alert(e.message || 'Failed to update');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaved = () => {
    setShowCreator(false);
    setEditingModule(null);
    loadModules();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Interview Modules</h1>
          <p className="text-[var(--text-sub)] text-sm mt-0.5">
            {modules.length} configured module{modules.length !== 1 ? 's' : ''} for practice sessions
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadModules}
            title="Refresh module list"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[var(--primary)]' : ''} />
          </button>
          <button
            onClick={() => {
              setEditingModule(null);
              setCreatorInitialStep(1);
              setShowCreator(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--primary)] to-indigo-600 hover:from-[var(--primary-hover)] hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Generate Script with AI</span>
          </button>
          <button
            onClick={() => {
              setEditingModule(null);
              setCreatorInitialStep(0);
              setShowCreator(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Manually</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && modules.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl p-8 max-w-lg mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary)]/20 flex items-center justify-center mx-auto mb-4 text-[var(--primary)]">
            <Sparkles size={28} />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No interview modules created yet</h3>
          <p className="text-[var(--text-sub)] text-sm mb-5">
            Use our AI generator to automatically create realistic interview scripts with questions and ideal answers in seconds.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setEditingModule(null);
                setCreatorInitialStep(1);
                setShowCreator(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-[var(--primary)] to-indigo-600 hover:from-[var(--primary-hover)] hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>Generate Script with AI</span>
            </button>
            <button
              onClick={() => {
                setEditingModule(null);
                setCreatorInitialStep(0);
                setShowCreator(true);
              }}
              className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Create Manually
            </button>
          </div>
        </div>
      )}

      {/* Module List / Table */}
      {!loading && modules.length > 0 && (
        <div className="space-y-2.5">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_130px_110px_90px_120px] gap-4 px-5 py-2 text-xs text-[var(--text-sub)] font-semibold uppercase tracking-wider">
            <span>Module</span>
            <span>Field</span>
            <span>Level</span>
            <span>Questions</span>
            <span>Status</span>
          </div>

          <AnimatePresence>
            {modules.map((mod) => (
              <motion.div
                key={mod.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="grid grid-cols-[1fr_130px_110px_90px_120px] gap-4 items-center bg-white border border-gray-200/80 hover:border-[var(--primary)]/40 hover:shadow-soft rounded-2xl px-5 py-4 transition-all group"
              >
                {/* Title & Info */}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[var(--primary)] transition-colors">
                    {mod.title}
                  </p>
                  <p className="text-xs text-[var(--text-sub)] truncate mt-0.5">
                    {mod.interviewer_name} · {mod.module_type === 'single' ? 'Single Speaker' : 'Panel'}
                  </p>
                </div>

                {/* Career Field */}
                <div>
                  <span className="inline-block text-xs font-medium text-[var(--primary)] bg-[var(--primary-soft)] px-2.5 py-1 rounded-lg truncate max-w-full">
                    {mod.field === 'all' ? 'All Fields' : mod.field}
                  </span>
                </div>

                {/* Level */}
                <div>
                  <span className="inline-block text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {EXPERIENCE_LABELS[mod.experience_level] || mod.experience_level}
                  </span>
                </div>

                {/* Question Count */}
                <div>
                  <span className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                    {mod.question_count} Qs
                  </span>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePublish(mod)}
                    disabled={togglingId === mod.id}
                    title={mod.is_published ? 'Live — click to unpublish' : 'Draft — click to publish'}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                      mod.is_published
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {mod.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                    {mod.is_published ? 'Live' : 'Draft'}
                  </button>

                  <button
                    onClick={() => {
                      setEditingModule(mod);
                      setCreatorInitialStep(0);
                      setShowCreator(true);
                    }}
                    title="Edit Module"
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(mod.id)}
                    disabled={deletingId === mod.id}
                    title="Delete Module"
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Module Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <ModuleCreator
            editingModule={editingModule}
            initialStep={creatorInitialStep}
            onClose={() => { setShowCreator(false); setEditingModule(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
