'use client';

import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  UserCircle,
  Briefcase,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  FileText,
  Shield,
  LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

const defaultMenuItems: MenuItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  // { id: 'profile', icon: UserCircle, label: 'My Profile' },
  { id: 'learn', icon: BookOpen, label: 'Learn' },
  { id: 'talk', icon: MessageSquare, label: 'Talk AI' },
  { id: 'interview', icon: Briefcase, label: 'Interview' },
  { id: 'reports', icon: FileText, label: 'Reports' },

  // { id: 'task', icon: CheckSquare, label: 'Task' },
  // { id: 'group', icon: Users, label: 'Group' },
];

interface SidebarProps {
  currentTab: string;
  setTab: (tabId: string) => void;
  menuItems?: MenuItem[];
}

export function Sidebar({ currentTab, setTab, menuItems = defaultMenuItems }: SidebarProps) {
  const { user, isApproved, logout } = useAuth();

  return (
    <aside aria-label="Main Navigation" className="w-[220px] h-full flex flex-col bg-white border-r border-gray-100 p-6 hidden lg:flex rounded-r-[24px] shadow-sm flex-shrink-0">
      {/* Brand Logo */}
      <div
        onClick={() => setTab('dashboard')}
        className="flex items-center gap-3 mb-8 pl-2 cursor-pointer group"
      >
        <div className="w-9 h-9 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white ring-4 ring-[var(--primary)]/10 shadow-md group-hover:scale-105 transition-transform">
          <div className="w-3.5 h-3.5 bg-white rounded-full" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-[var(--primary)]">FluentAI</span>
          <span className="text-[10px] font-semibold text-[var(--text-sub)] tracking-wide uppercase">AI English Partner</span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1.5" aria-label="App Modules">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "sidebar-item text-left w-full cursor-pointer",
                isActive && "active"
              )}
            >
              <Icon size={18} className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-sub)]'} />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* User Quick Mini-Card */}
      {user && (
        <div
          onClick={() => setTab('profile')}
          className="mb-3 p-2.5 rounded-2xl bg-gray-50 hover:bg-blue-50/60 border border-gray-100 cursor-pointer transition-all flex items-center gap-2.5"
        >
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
              {isApproved ? (
                <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Approved
                </span>
              ) : (
                <span className="text-[10px] font-medium text-amber-600 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Footer Controls */}
      <div className="pt-3 border-t border-gray-100 flex flex-col gap-1">
        {/* <button 
          onClick={() => setTab('profile')}
          className={cn("sidebar-item text-left w-full cursor-pointer", currentTab === 'profile' && "active")}
        >
          <Settings size={18} className="text-[var(--text-sub)]" />
          <span className="text-sm">Account Settings</span>
        </button> */}
        {user?.is_staff && (
          <Link
            href="/admin"
            className="sidebar-item text-left w-full text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors cursor-pointer"
          >
            <Shield size={18} className="text-[var(--primary)]" />
            <span className="text-sm font-semibold">Admin Panel</span>
          </Link>
        )}
        <button
          onClick={logout}
          className="sidebar-item text-left w-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
