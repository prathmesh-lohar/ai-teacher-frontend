'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, ShieldAlert, ArrowLeft, LogOut, Lock, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ModuleList from '@/components/admin/interview/ModuleList';
import TokenUsageDashboard from '@/components/admin/token/TokenUsageDashboard';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user, login, logout } = useAuth();
  const [tab, setTab] = useState('interview');

  // Inline admin login state if unauthenticated
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    try {
      const loggedInUser = await login(loginUsername.trim(), loginPassword.trim());
      if (!loggedInUser.is_staff) {
        setLoginError('This account does not have administrator privileges.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Invalid username or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--primary-bg)]">
        <div className="w-9 h-9 border-3 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Not authenticated — show Admin Login card
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-[var(--primary-bg)] p-4 relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border border-gray-100 rounded-[28px] shadow-soft p-8 relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[var(--primary-soft)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[var(--primary)] shadow-sm">
              <Shield size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Sign In</h1>
            <p className="text-[var(--text-sub)] text-sm mt-1">
              Authenticate with staff credentials to access the management portal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <ShieldAlert size={16} className="shrink-0 text-red-500" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield size={16} />
                  <span>Access Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-[var(--text-sub)]">
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              <span>Back to App</span>
            </Link>
            <Link
              href="/login"
              className="hover:text-[var(--primary)] transition-colors font-medium"
            >
              Regular Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Authenticated but not staff — Access Denied Screen
  if (!user?.is_staff) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-[var(--primary-bg)] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white border border-gray-100 rounded-[28px] shadow-soft p-8 text-center"
        >
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-600 border border-amber-200">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Admin Privileges Required</h1>
          <p className="text-[var(--text-sub)] text-sm leading-relaxed mb-4">
            You are currently signed in as <span className="font-semibold text-gray-900">@{user?.username}</span>, but this account does not have administrator permissions.
          </p>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6 text-xs text-gray-600 text-left flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
            <span>If you believe this is an error, please contact the system administrator to grant your account staff access.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={15} />
              <span>Back to App</span>
            </Link>
            <button
              onClick={logout}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={15} />
              <span>Switch Account</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Authenticated Staff — Render Admin Panel
  return (
    <div className="flex h-screen w-screen bg-[var(--primary-bg)] overflow-hidden p-2 lg:p-4 gap-4">
      <AdminSidebar currentTab={tab} setTab={setTab} />

      <main className="flex-1 flex flex-col min-w-0 bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col"
            >
              <AdminDashboard />
            </motion.div>
          )}
          {tab === 'tokens' && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TokenUsageDashboard />
            </motion.div>
          )}
          {tab === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <ModuleList />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
