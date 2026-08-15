'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, RefreshCw, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function ApprovalPending() {
  const { user, status, refreshUser, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    setCheckMessage(null);
    try {
      const updated = await refreshUser();
      if (updated?.profile?.status === 'approved') {
        setCheckMessage('Congratulations! Your account has been approved.');
      } else {
        setCheckMessage('Status updated: Your account is still awaiting administrator review.');
      }
    } catch {
      setCheckMessage('Failed to check status. Please verify your connection.');
    } finally {
      setRefreshing(false);
    }
  };

  const isRejected = status === 'rejected';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-4 sm:p-6 lg:p-8">
      {/* Background ambient elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
      >
        {/* Top decorative stripe */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${isRejected ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500'}`} />

        {/* Icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg relative">
          {isRejected ? (
            <div className="w-full h-full rounded-3xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">
              <ShieldAlert size={40} />
            </div>
          ) : (
            <div className="w-full h-full rounded-3xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center">
              <Clock size={40} className="animate-pulse" />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-xs">
            {isRejected ? '❌' : '⏳'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border bg-amber-50 border-amber-200 text-amber-800">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          {isRejected ? 'Account Rejected' : 'Approval Pending'}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          {isRejected ? 'Access Not Approved' : 'Account Under Review'}
        </h1>

        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
          Hello <span className="font-semibold text-gray-900">{user?.first_name || user?.username}</span>! 
          {isRejected
            ? ' Your request to access the AI English Voice Tutor dashboard has not been approved by an administrator.'
            : ' Only approved accounts can access the conversational dashboard and AI tutor. Your account is currently queued for administrator approval.'}
        </p>

        {/* User Card info */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 mb-6 text-left text-xs text-gray-600 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Username:</span>
            <span className="font-semibold text-gray-800">{user?.username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Email:</span>
            <span className="font-medium text-gray-800">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Target English Level:</span>
            <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {user?.profile?.english_level || 'B1'}
            </span>
          </div>
        </div>

        {/* Status message notice if refreshed */}
        {checkMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium"
          >
            {checkMessage}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[var(--primary)]/20 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Checking Status...' : 'Check Approval Status'}
          </button>

          <button
            onClick={logout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all active:scale-95 cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Tip footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <Mail size={14} />
          <span>Need faster activation? Contact administrator support.</span>
        </div>
      </motion.div>
    </div>
  );
}

export default ApprovalPending;
