'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TalkModeSelector, { ChatMode } from './TalkModeSelector';
import ConnectingState from './ConnectingState';
import VoiceChatView from './VoiceChatView';
import VideoChatView from './VideoChatView';
import TextChatView from './TextChatView';

export type ViewTab = ChatMode | 'hub';

export function TalkAiInterface() {
  const [activeTab, setActiveTab] = useState<ViewTab>('hub');
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

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-gradient-to-b from-slate-50/50 to-white/80 rounded-[2rem]">
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


