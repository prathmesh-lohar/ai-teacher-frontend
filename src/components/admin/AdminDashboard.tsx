'use client';

import React from 'react';
import { BarChart3, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  return (
    <div className="flex-1 flex items-center justify-center p-12 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm"
      >
        <div className="w-20 h-20 rounded-3xl bg-[var(--primary-soft)] border border-[var(--primary)]/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <BarChart3 size={36} className="text-[var(--primary)]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-[var(--text-sub)] text-sm leading-relaxed mb-6">
          Analytics, usage statistics, and user practice insights will be displayed here.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-[var(--text-sub)]">
          <Clock size={13} className="text-gray-400" />
          <span>Under development</span>
          <Sparkles size={13} className="text-[var(--primary)]" />
        </div>
      </motion.div>
    </div>
  );
}
