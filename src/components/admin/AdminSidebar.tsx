'use client';

import React from 'react';
import { LayoutDashboard, Briefcase, ArrowLeft, Shield, LogOut, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface AdminSidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'tokens', icon: Cpu, label: 'Token Usage' },
  { id: 'interview', icon: Briefcase, label: 'Interview Modules' },
];

export default function AdminSidebar({ currentTab, setTab }: AdminSidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-[230px] h-full flex flex-col bg-white border-r border-gray-100 p-6 hidden lg:flex rounded-r-[24px] shadow-sm flex-shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 pl-1 group">
        <div className="w-9 h-9 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white ring-4 ring-[var(--primary)]/10 shadow-sm transition-transform group-hover:scale-105">
          <Shield size={18} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-[var(--primary)]">FluentAI</span>
          </div>
          <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary-soft)] px-1.5 py-0.5 rounded uppercase tracking-wider w-fit">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab(item.id)}
              className={cn(
                'sidebar-item text-left w-full cursor-pointer',
                isActive && 'active'
              )}
            >
              <Icon size={18} className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-sub)]'} />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Admin User Mini Card */}
      {user && (
        <div className="mb-3 p-2.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-200 shrink-0">
            <img
              src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">
              {user.first_name || user.username}
            </p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
              <span className="text-[10px] font-medium text-[var(--primary)]">
                Staff Admin
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="pt-3 border-t border-gray-100 flex flex-col gap-1">
        <Link
          href="/"
          className="sidebar-item text-left w-full text-[var(--text-sub)] hover:text-[var(--primary)]"
        >
          <ArrowLeft size={17} />
          <span className="text-sm">Back to App</span>
        </Link>
        <button
          onClick={logout}
          className="sidebar-item text-left w-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut size={17} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
