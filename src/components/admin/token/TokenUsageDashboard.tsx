'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Layers,
  Users,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  ChevronDown,
  ArrowUpRight,
  Clock,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  Shield,
  Crown,
  Filter
} from 'lucide-react';
import { fetchAdminTokenUsage, updateUserPlan } from '@/services/adminService';
import type {
  AdminTokenUsageResponse,
  ModelUsageStat,
  UserTokenUsage,
  PlanType,
  RecentTokenActivity,
} from '@/types/tokenUsage';
import { cn } from '@/lib/utils';

// Color & styling map for plans
const PLAN_CONFIG: Record<
  PlanType,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  free: {
    label: 'Free',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: Sparkles,
  },
  starter: {
    label: 'Starter',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    icon: Zap,
  },
  pro: {
    label: 'Pro',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Activity,
  },
  enterprise: {
    label: 'Enterprise',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Crown,
  },
};

const ALL_PLANS: PlanType[] = ['free', 'starter', 'pro', 'enterprise'];

export default function TokenUsageDashboard() {
  const [data, setData] = useState<AdminTokenUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [showRecentLogs, setShowRecentLogs] = useState(false);

  // Plan changing state
  const [openDropdownUserId, setOpenDropdownUserId] = useState<number | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const response = await fetchAdminTokenUsage();
      setData(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch token usage data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle plan update
  const handlePlanChange = async (userId: number, newPlan: PlanType) => {
    setOpenDropdownUserId(null);
    setUpdatingUserId(userId);

    try {
      const res = await updateUserPlan(userId, newPlan);
      // Optimistically update local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u)),
        };
      });
      setToastMessage({
        text: res.message || `Plan updated to ${PLAN_CONFIG[newPlan].label}`,
        type: 'success',
      });
    } catch (err: any) {
      setToastMessage({
        text: err?.message || 'Failed to update user plan',
        type: 'error',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPlan =
        selectedPlanFilter === 'all' || user.plan === selectedPlanFilter;

      return matchesSearch && matchesPlan;
    });
  }, [data?.users, searchQuery, selectedPlanFilter]);

  // Maximum user tokens for scale bar
  const maxUserTokens = useMemo(() => {
    if (!data?.users || data.users.length === 0) return 1;
    return Math.max(...data.users.map((u) => u.total_tokens), 1);
  }, [data?.users]);

  // Color generator for model distribution bar
  const MODEL_COLORS = [
    'bg-[var(--primary)]',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-amber-500',
    'bg-pink-500',
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white">
        <div className="w-10 h-10 border-3 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500">Aggregating token metrics & user tiers...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white text-center">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Failed to load token usage</h3>
        <p className="text-sm text-gray-500 mb-5 max-w-md">{error}</p>
        <button
          onClick={() => loadData()}
          className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--primary-hover)] transition-colors cursor-pointer flex items-center gap-2"
        >
          <RefreshCw size={15} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const summary = data?.summary;
  const models = data?.models || [];
  const recentLogs = data?.recent_activity || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-6 right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-elevated border text-sm font-medium backdrop-blur-md',
              toastMessage.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
                : 'bg-red-50/95 border-red-200 text-red-800'
            )}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-20">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Token Usage & Plans</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Analytics
            </span>
          </div>
          <p className="text-xs text-[var(--text-sub)]">
            Analyze overall platform consumption, model utilization, and manage user subscription tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowRecentLogs(!showRecentLogs)}
            className={cn(
              'px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 cursor-pointer',
              showRecentLogs
                ? 'bg-[var(--primary)] text-white border-transparent shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            )}
          >
            <Activity size={14} />
            <span>{showRecentLogs ? 'Hide Recent Activity' : 'View Recent Activity'}</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw size={16} className={cn(refreshing && 'animate-spin text-[var(--primary)]')} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* 1. OVERALL METRIC CARDS */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Tokens */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--primary)]/5 via-white to-white border border-[var(--primary)]/15 shadow-soft relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Tokens
                </span>
                <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                  <Zap size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mb-2">
                {(summary?.total_tokens || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span className="inline-flex items-center text-[var(--primary)] font-medium bg-[var(--primary-soft)] px-1.5 py-0.5 rounded">
                  Prompt: {(summary?.total_prompt_tokens || 0).toLocaleString()}
                </span>
                <span>•</span>
                <span className="inline-flex items-center text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">
                  Completion: {(summary?.total_completion_tokens || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Card 2: Total Requests */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-white border border-indigo-100 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total LLM Requests
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mb-2">
                {(summary?.total_requests || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500">
                Avg. {summary && summary.total_requests > 0
                  ? Math.round(summary.total_tokens / summary.total_requests).toLocaleString()
                  : 0}{' '}
                tokens per request
              </div>
            </div>

            {/* Card 3: Active AI Users */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/60 via-white to-white border border-teal-100 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Active AI Users
                </span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mb-2">
                {summary?.active_users_count || 0}{' '}
                <span className="text-sm font-normal text-gray-400">
                  / {summary?.total_users_count || 0} registered
                </span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      summary && summary.total_users_count > 0
                        ? Math.min(100, (summary.active_users_count / summary.total_users_count) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Card 4: Top Model Utilization */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 via-white to-white border border-amber-100 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Primary Model
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Crown size={16} />
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900 truncate mb-1" title={models[0]?.model_name || 'N/A'}>
                {models[0]?.model_name || 'None'}
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>Usage share:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {models[0]?.percentage || 0}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT LIVE ACTIVITY DRAWER (Optional/Toggleable) */}
        <AnimatePresence>
          {showRecentLogs && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-bold tracking-tight">Recent AI Model Invocations</h3>
                  </div>
                  <span className="text-xs text-slate-400">Latest 30 requests</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                  {recentLogs.length === 0 ? (
                    <p className="text-slate-500 text-xs py-2">No recent generation logs found.</p>
                  ) : (
                    recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-xl bg-slate-800/70 border border-slate-700/50 hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold">@{log.username}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-cyan-300 truncate max-w-xs">{log.model_name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">
                            {log.feature}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                          <span>
                            Tokens: <strong className="text-white">{log.total_tokens}</strong> (in: {log.prompt_tokens}, out: {log.completion_tokens})
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {log.created_at ? new Date(log.created_at).toLocaleTimeString() : ''}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 2. MODEL-WISE USAGE BREAKDOWN */}
        <section className="p-6 rounded-2xl bg-white border border-gray-100 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Layers size={18} className="text-[var(--primary)]" />
                Model-Wise Usage Breakdown
              </h2>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                Distribution of prompt and completion tokens across integrated LLM architectures.
              </p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              {models.length} Models Deployed
            </span>
          </div>

          {/* Model Distribution Stacked Bar */}
          {summary && summary.total_tokens > 0 && (
            <div className="mb-6">
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                {models.map((m, idx) => (
                  <div
                    key={m.model_name}
                    className={cn('h-full transition-all duration-300', MODEL_COLORS[idx % MODEL_COLORS.length])}
                    style={{ width: `${m.percentage}%` }}
                    title={`${m.model_name}: ${m.percentage}% (${m.total_tokens.toLocaleString()} tokens)`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs">
                {models.map((m, idx) => (
                  <div key={m.model_name} className="flex items-center gap-1.5">
                    <span className={cn('w-2.5 h-2.5 rounded-full', MODEL_COLORS[idx % MODEL_COLORS.length])} />
                    <span className="font-medium text-gray-700">{m.model_name}</span>
                    <span className="text-gray-400">({m.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Models Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Model Name</th>
                  <th className="pb-3 text-right">Requests</th>
                  <th className="pb-3 text-right">Prompt Tokens</th>
                  <th className="pb-3 text-right">Completion Tokens</th>
                  <th className="pb-3 text-right">Total Tokens</th>
                  <th className="pb-3 text-right pr-2">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {models.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-gray-500">
                      No model usage data recorded yet.
                    </td>
                  </tr>
                ) : (
                  models.map((m, idx) => (
                    <tr key={m.model_name} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 pl-2 font-semibold text-gray-900 flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full shrink-0', MODEL_COLORS[idx % MODEL_COLORS.length])} />
                        <span className="font-mono text-xs">{m.model_name}</span>
                      </td>
                      <td className="py-3 text-right text-xs text-gray-600">
                        {m.request_count.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-xs text-gray-600">
                        {m.prompt_tokens.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-xs text-gray-600">
                        {m.completion_tokens.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-xs font-bold text-gray-900">
                        {m.total_tokens.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-xs pr-2">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 font-semibold text-gray-700 text-[11px]">
                          {m.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. EACH USER'S TOKEN USAGE & PLAN MANAGEMENT */}
        <section className="p-6 rounded-2xl bg-white border border-gray-100 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Users size={18} className="text-[var(--primary)]" />
                User Token Usage & Subscription Management
              </h2>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                Inspect per-user token consumption and seamlessly adjust subscription tiers.
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Plan Filter Chips */}
              <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
                <button
                  onClick={() => setSelectedPlanFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer',
                    selectedPlanFilter === 'all'
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  All ({data?.users.length || 0})
                </button>
                {ALL_PLANS.map((p) => {
                  const count = data?.users.filter((u) => u.plan === p).length || 0;
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedPlanFilter(p)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg font-medium transition-colors capitalize cursor-pointer',
                        selectedPlanFilter === p
                          ? 'bg-white text-gray-900 shadow-xs font-semibold'
                          : 'text-gray-500 hover:text-gray-900'
                      )}
                    >
                      {p} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pl-2">User Profile</th>
                  <th className="pb-3">Current Plan</th>
                  <th className="pb-3 text-left">Total Tokens</th>
                  <th className="pb-3 text-right">In / Out Ratio</th>
                  <th className="pb-3 text-right">Requests</th>
                  <th className="pb-3 text-right">Last Active</th>
                  <th className="pb-3 text-center pr-2">Manage Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-gray-500">
                      No users found matching your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const planConfig = PLAN_CONFIG[user.plan] || PLAN_CONFIG.free;
                    const PlanIcon = planConfig.icon;
                    const tokenPercentage = Math.round((user.total_tokens / maxUserTokens) * 100);
                    const isDropdownOpen = openDropdownUserId === user.id;
                    const isUpdating = updatingUserId === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/60 transition-colors group">
                        {/* User Column */}
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              <img
                                src={
                                  user.avatar_url ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                                }
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900 text-xs truncate">
                                  {user.full_name}
                                </span>
                                {user.is_staff && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
                                    Staff
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-500 truncate">
                                @{user.username} {user.email && `• ${user.email}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Current Plan Badge */}
                        <td className="py-3.5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs',
                              planConfig.bg,
                              planConfig.text,
                              planConfig.border
                            )}
                          >
                            <PlanIcon size={12} />
                            <span>{planConfig.label}</span>
                          </span>
                        </td>

                        {/* Total Tokens + Visual Bar */}
                        <td className="py-3.5 text-left min-w-[150px]">
                          <div className="text-xs font-bold text-gray-900">
                            {user.total_tokens.toLocaleString()}{' '}
                            <span className="font-normal text-gray-400 text-[10px]">toks</span>
                          </div>
                          <div className="w-28 bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="bg-[var(--primary)] h-full rounded-full transition-all duration-300"
                              style={{ width: `${tokenPercentage}%` }}
                            />
                          </div>
                        </td>

                        {/* In / Out Breakdown */}
                        <td className="py-3.5 text-right text-xs text-gray-500 font-mono">
                          <span className="text-[var(--primary)]">{user.prompt_tokens.toLocaleString()}</span>
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-indigo-600">{user.completion_tokens.toLocaleString()}</span>
                        </td>

                        {/* Requests Count */}
                        <td className="py-3.5 text-right text-xs font-medium text-gray-700">
                          {user.request_count.toLocaleString()}
                        </td>

                        {/* Last Active */}
                        <td className="py-3.5 text-right text-xs text-gray-500">
                          {user.last_active ? (
                            <span title={new Date(user.last_active).toLocaleString()}>
                              {new Date(user.last_active).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Change Plan Action Dropdown */}
                        <td className="py-3.5 text-center pr-2 relative">
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setOpenDropdownUserId(isDropdownOpen ? null : user.id)}
                              disabled={isUpdating}
                              className={cn(
                                'px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                                isDropdownOpen
                                  ? 'bg-gray-100 border-gray-300 text-gray-900'
                                  : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-2xs'
                              )}
                            >
                              {isUpdating ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <span>Change Plan</span>
                                  <ChevronDown size={13} className="text-gray-400" />
                                </>
                              )}
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                              {isDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-2 mt-1.5 w-44 rounded-2xl bg-white border border-gray-200/90 shadow-elevated py-1.5 z-30"
                                >
                                  <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    Assign Tier
                                  </div>
                                  {ALL_PLANS.map((planKey) => {
                                    const cfg = PLAN_CONFIG[planKey];
                                    const Icon = cfg.icon;
                                    const isCurrent = user.plan === planKey;

                                    return (
                                      <button
                                        key={planKey}
                                        type="button"
                                        onClick={() => handlePlanChange(user.id, planKey)}
                                        className={cn(
                                          'w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer',
                                          isCurrent && 'bg-[var(--primary-soft)] font-bold text-[var(--primary)]'
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Icon size={14} className={cfg.text} />
                                          <span>{cfg.label}</span>
                                        </div>
                                        {isCurrent && <Check size={14} className="text-[var(--primary)]" />}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
