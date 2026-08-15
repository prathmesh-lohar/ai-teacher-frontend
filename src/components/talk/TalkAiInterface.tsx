'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, MessageSquare, LayoutGrid, Sparkles, SlidersHorizontal } from 'lucide-react';
import TalkModeSelector, { ChatMode } from './TalkModeSelector';
import ConnectingState from './ConnectingState';
import VoiceChatView from './VoiceChatView';
import VideoChatView from './VideoChatView';
import TextChatView from './TextChatView';

const topics = [
  { id: 'ielts', label: 'IELTS Speaking Test' },
  { id: 'interview', label: 'Job Interview Prep' },
  { id: 'casual', label: 'Daily Casual Talk' },
  { id: 'business', label: 'Business English' },
];

export type ViewTab = ChatMode | 'hub';

export function TalkAiInterface() {
  const [activeTab, setActiveTab] = useState<ViewTab>('voice');
  const [selectedTopic, setSelectedTopic] = useState('IELTS Speaking Test');
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingTab, setPendingTab] = useState<ChatMode>('voice');

  const handleTabChange = (tab: ViewTab) => {
    if (tab === 'hub') {
      setActiveTab('hub');
      return;
    }

    if (tab !== activeTab) {
      setPendingTab(tab);
      setIsConnecting(true);
    }
  };

  const handleSelectModeFromHub = (mode: ChatMode, topic: string) => {
    setSelectedTopic(topic);
    setPendingTab(mode);
    setIsConnecting(true);
  };

  const handleConnected = () => {
    setActiveTab(pendingTab);
    setIsConnecting(false);
  };

  const handleCancelConnection = () => {
    setIsConnecting(false);
  };

  const tabs: { id: ViewTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'voice', label: 'Voice Call', icon: Mic, badge: 'HD Audio' },
    { id: 'video', label: 'Video Call', icon: Video, badge: '1080p' },
    { id: 'text', label: 'AI Chat', icon: MessageSquare, badge: 'Grammar' },
    { id: 'hub', label: 'Mode Hub', icon: LayoutGrid },
  ];

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-gradient-to-b from-slate-50/50 to-white/80 rounded-[2rem]">
      {/* Top Header with Tab Bar & Topic Switcher */}
      <div className="px-4 lg:px-6 pt-4 pb-3 border-b border-gray-200/70 bg-white/80 backdrop-blur-md shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 z-20">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl border border-gray-200/60 shadow-inner w-full md:w-auto overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--primary)] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-gray-200/80"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} className={isActive ? 'text-[var(--primary)]' : 'text-gray-500'} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold tracking-tight ${
                      isActive ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'bg-gray-200/70 text-gray-500'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Topic Selector & AI Status */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200/70 text-xs font-semibold text-gray-700">
            <SlidersHorizontal size={14} className="text-[var(--primary)] ml-1" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-gray-800 focus:outline-none cursor-pointer pr-1"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.label}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Neural Engine Active</span>
          </div>
        </div>
      </div>

      {/* Main Tab Content Stage */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Connecting State Modal/Overlay */}
          {isConnecting ? (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ConnectingState
                mode={pendingTab}
                topic={selectedTopic}
                onConnected={handleConnected}
                onCancel={handleCancelConnection}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {activeTab === 'voice' && (
                <VoiceChatView
                  topic={selectedTopic}
                  onEndCall={() => setActiveTab('hub')}
                  onSwitchMode={(mode) => handleTabChange(mode)}
                />
              )}

              {activeTab === 'video' && (
                <VideoChatView
                  topic={selectedTopic}
                  onEndCall={() => setActiveTab('hub')}
                  onSwitchMode={(mode) => handleTabChange(mode)}
                />
              )}

              {activeTab === 'text' && (
                <TextChatView
                  topic={selectedTopic}
                  onSwitchMode={(mode) => handleTabChange(mode)}
                  onBackToSelector={() => setActiveTab('hub')}
                />
              )}

              {activeTab === 'hub' && (
                <TalkModeSelector onSelectMode={handleSelectModeFromHub} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TalkAiInterface;


