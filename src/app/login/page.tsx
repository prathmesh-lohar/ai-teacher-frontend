'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Headphones
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both your username and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--primary-bg)] p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-[var(--primary-soft)]">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Brand & Product Showcase */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 space-y-6 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm text-xs font-semibold text-[var(--primary)]">
            <Sparkles size={14} className="text-amber-500" />
            <span>AI-Powered Spoken English Voice Tutor</span>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-white ring-8 ring-[var(--primary)]/10 shadow-lg">
              <Headphones size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">FluentAI</h1>
              <p className="text-xs text-[var(--text-sub)] font-medium">Real-Time Conversational Fluency</p>
            </div>
          </div>

          <p className="text-[var(--text-sub)] text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
            Practice real-time spoken English with personalized AI speech tutoring, instant pronunciation corrections, and customized career scenarios.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3 text-left">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900">Approval-Gated</h2>
                <p className="text-[11px] text-gray-500">Only verified users access live AI tutors</p>
              </div>
            </div>

            <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3 text-left">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900">Low-Latency Audio</h2>
                <p className="text-[11px] text-gray-500">Sub-second speech response loops</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Sign-In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-6 bg-white/95 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-gray-200/50"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-heading)]">Sign In to Your Account</h2>
            <p className="text-xs text-[var(--text-sub)] mt-1">Enter your credentials to access your personalized tutoring space</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-center gap-2.5"
            >
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-gray-700 ml-1">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <span className="text-[11px] text-[var(--primary)] font-medium cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl py-3 pl-10 pr-10 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-95 active:scale-[0.99] transition-all shadow-md shadow-[var(--primary)]/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration note */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <span className="text-[var(--primary)] font-semibold cursor-pointer hover:underline">
              Self sign-up opening soon
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
