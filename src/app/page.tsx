'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, MessageSquare, UserCircle, Sparkles, LogIn } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import HeroBanner from '@/components/dashboard/HeroBanner';
import ProgressCards from '@/components/dashboard/ProgressCards';
import ContinueLearning from '@/components/dashboard/ContinueLearning';
import LessonsTable from '@/components/dashboard/LessonsTable';
import TalkAiInterface from '@/components/talk/TalkAiInterface';
import ProfileModule from '@/components/profile/ProfileModule';
import ApprovalPending from '@/components/auth/ApprovalPending';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';

export default function Home() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isApproved } = useAuth();
  const [currentTab, setTab] = useState('dashboard');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Loading State
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--primary-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-sub)]">Loading FluentAI...</span>
        </div>
      </div>
    );
  }

  // Not authenticated redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--primary-bg)] p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[var(--primary)] mx-auto shadow-md">
            <LogIn size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Redirecting to Sign In...</h2>
          <Button variant="primary" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated BUT NOT APPROVED: Show ApprovalPending Gate
  if (!isApproved) {
    return <ApprovalPending />;
  }

  // Authenticated AND APPROVED: Full Dashboard & AI Access
  return (
    <div className="flex h-screen w-screen bg-[var(--primary-bg)] overflow-hidden selection:bg-[var(--primary-soft)] p-2 lg:p-4 gap-4">
      {/* Desktop Sidebar */}
      <Sidebar currentTab={currentTab} setTab={setTab} />

      {/* Main Content Workspace Area (Full Width) */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-500 overflow-hidden relative glass-card rounded-[24px]">
        {currentTab !== 'talk' && <Header onOpenProfile={() => setTab('profile')} />}
        
        <div className={currentTab === 'talk' ? "flex-1 overflow-hidden p-0 custom-scrollbar flex flex-col" : "flex-1 overflow-y-auto px-6 lg:px-8 pb-24 lg:pb-8 custom-scrollbar"}>
          <AnimatePresence mode="wait">
            {/* Dashboard Module */}
            {currentTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 py-4"
              >
                <HeroBanner onStart={() => setTab('talk')} />
                <ProgressCards onCardClick={() => setTab('learn')} />
                <ContinueLearning onSelectCourse={() => setTab('talk')} />
                <LessonsTable onActionClick={() => setTab('talk')} />
              </motion.div>
            )}

            {/* Profile Module */}
            {currentTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="py-4"
              >
                <ProfileModule />
              </motion.div>
            )}

            {/* AI Talk Module */}
            {currentTab === 'talk' && (
              <motion.div
                key="talk"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <TalkAiInterface />
              </motion.div>
            )}

            {/* Module Development Placeholder for other tabs */}
            {currentTab !== 'dashboard' && currentTab !== 'talk' && currentTab !== 'profile' && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="h-full flex items-center justify-center text-center p-12"
              >
                <div className="max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-[var(--primary-soft)] rounded-3xl flex items-center justify-center text-[var(--primary)] mx-auto mb-6">
                    <Sparkles size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-2 capitalize">
                    {currentTab} Module
                  </h2>
                  <p className="text-[var(--text-sub)] text-sm leading-relaxed">
                    We are crafting the AI-powered {currentTab} experience with interactive speaking drills and real-time linguistic feedback.
                  </p>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="mt-6"
                    onClick={() => setTab('dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation Toolbar */}
        <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around p-3 z-50 rounded-t-[2rem] shadow-2xl">
          <button 
            onClick={() => setTab('dashboard')} 
            aria-label="Dashboard"
            className={currentTab === 'dashboard' ? 'text-[var(--primary)]' : 'text-[var(--text-sub)]'}
          >
            <LayoutDashboard size={24} />
          </button>
          <button 
            onClick={() => setTab('learn')} 
            aria-label="Learn"
            className={currentTab === 'learn' ? 'text-[var(--primary)]' : 'text-[var(--text-sub)]'}
          >
            <BookOpen size={24} />
          </button>
          <button 
            onClick={() => setTab('talk')} 
            aria-label="Talk AI"
            className={currentTab === 'talk' ? 'text-[var(--primary)]' : 'text-[var(--text-sub)]'}
          >
            <MessageSquare size={24} />
          </button>
          <button 
            onClick={() => setTab('profile')} 
            aria-label="Profile"
            className={currentTab === 'profile' ? 'text-[var(--primary)]' : 'text-[var(--text-sub)]'}
          >
            <UserCircle size={24} />
          </button>
        </nav>
      </main>
    </div>
  );
}
