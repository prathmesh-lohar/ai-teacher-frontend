'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TalkModeSelector, { ChatMode } from './TalkModeSelector';
import ConnectingState from './ConnectingState';
import VoiceChatView from './VoiceChatView';
import VideoChatView from './VideoChatView';
import TextChatView from './TextChatView';

export type ViewTab = ChatMode | 'hub';

interface TalkAiInterfaceProps {
  onViewReports?: () => void;
  initialTopic?: string;
  initialMode?: ChatMode | 'hub';
  launchTrigger?: number;
}

export function TalkAiInterface({
  onViewReports,
  initialTopic,
  initialMode = 'hub',
  launchTrigger = 0,
}: TalkAiInterfaceProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>(initialMode);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || 'Daily Casual Talk');
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingTab, setPendingTab] = useState<ChatMode>(
    initialMode && initialMode !== 'hub' ? initialMode : 'voice'
  );

  // Sync state whenever external launchTrigger fires or initial props change
  useEffect(() => {
    if (launchTrigger > 0 || (initialMode && initialMode !== 'hub')) {
      if (initialTopic) {
        setSelectedTopic(initialTopic);
      }
      if (initialMode && initialMode !== 'hub') {
        setPendingTab(initialMode);
        setActiveTab(initialMode);
        setIsConnecting(false);
      }
    }
  }, [launchTrigger, initialTopic, initialMode]);

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

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-gradient-to-b from-slate-50/50 to-white/80 rounded-[2rem]">
      {/* Main Tab Content Stage */}
      <div className="flex-1 w-full relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {/* Connecting State Modal/Overlay */}
          {isConnecting ? (
            <motion.div
              key={`connecting-${pendingTab}-${selectedTopic}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
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
              key={`${activeTab}-${selectedTopic}-${launchTrigger}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="h-full w-full flex-1 flex flex-col"
            >
              {activeTab === 'voice' && (
                <VoiceChatView
                  key={`voice-${selectedTopic}-${launchTrigger}`}
                  topic={selectedTopic}
                  onEndCall={() => setActiveTab('hub')}
                  onSwitchMode={(mode) => handleTabChange(mode)}
                  onViewReports={onViewReports}
                />
              )}

              {activeTab === 'video' && (
                <VideoChatView
                  key={`video-${selectedTopic}-${launchTrigger}`}
                  topic={selectedTopic}
                  onEndCall={() => setActiveTab('hub')}
                  onSwitchMode={(mode) => handleTabChange(mode)}
                />
              )}

              {activeTab === 'text' && (
                <TextChatView
                  key={`text-${selectedTopic}-${launchTrigger}`}
                  topic={selectedTopic}
                  onSwitchMode={(mode) => handleTabChange(mode)}
                  onBackToSelector={() => setActiveTab('hub')}
                  onViewReports={onViewReports}
                />
              )}

              {activeTab === 'hub' && (
                <TalkModeSelector 
                  onSelectMode={handleSelectModeFromHub} 
                  onViewReports={onViewReports}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TalkAiInterface;
