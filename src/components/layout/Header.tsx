'use client';

import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onOpenProfile?: () => void;
}

export function Header({
  onSearch,
  onOpenProfile,
}: HeaderProps) {
  const { user, isApproved } = useAuth();

  const displayName = user
    ? user.first_name || user.username
    : "Student";

  const avatarUrl = user?.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Alex'}`;

  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-8 bg-transparent mb-2 shrink-0">
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-[400px]">
        <label htmlFor="course-search" className="sr-only">Search your course</label>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        <input 
          id="course-search"
          type="search" 
          placeholder="Search lessons, tutors, or topics..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] transition-all shadow-sm placeholder:text-gray-400 font-medium"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Notifications"
          className="relative w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center cursor-pointer shadow-sm text-[var(--text-sub)] hover:text-[var(--primary)] transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </motion.button>

        {/* Profile Card Trigger */}
        <div 
          onClick={onOpenProfile}
          tabIndex={0}
          role="button"
          aria-label="User Profile Menu"
          className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer group hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden ring-2 ring-white flex-shrink-0">
            <img src={avatarUrl} alt={`${displayName}'s profile avatar`} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-[var(--text-heading)] leading-none">{displayName}</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
              {isApproved ? (
                <span className="text-emerald-600 font-medium">Approved</span>
              ) : (
                <span className="text-amber-600 font-medium">Pending</span>
              )}
            </span>
          </div>
          <ChevronDown size={14} className="text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
        </div>
      </div>
    </header>
  );
}

export default Header;
