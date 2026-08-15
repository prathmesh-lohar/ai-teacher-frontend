'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Mic, 
  Sparkles, 
  Wand2, 
  History, 
  Video, 
  Volume2, 
  VolumeX,
  CheckCircle2, 
  MessageSquare,
  ArrowLeft,
  Languages,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { ChatMode } from './TalkModeSelector';
import { NATIVE_LANGUAGES } from '@/types/voice';
import { speechPlayer } from '@/audio/speechPlayer';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  correction?: string;
  nativeCorrection?: string;
  topicHighlight?: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'ai',
    text: "Hello Prathmesh! I'm your AI English partner. Today we can practice natural conversation or prepare for your IELTS exam. What's on your mind?",
    timestamp: '09:41 AM',
  },
  {
    id: '2',
    sender: 'user',
    text: "I want to focus on using academic vocabulary more naturally during discussions. Can we practice a debate topic?",
    timestamp: '09:42 AM',
  },
  {
    id: '3',
    sender: 'ai',
    text: "Excellent choice! Let's discuss: \"The impact of technology on traditional education systems.\" Should we evaluate the benefits first, or jump into counter-arguments?",
    timestamp: '09:42 AM',
    correction: 'Tutor Suggestion: Instead of "I want to focus", consider "I aim to concentrate" for higher band score.',
    nativeCorrection: 'मराठी / हिन्दी सल्ला: "I want to focus" च्या ऐवजी "I aim to concentrate" वापरा, यामुळे उच्च बँड स्कोर मिळतो.',
    topicHighlight: "The impact of technology on traditional education systems.",
  },
];

interface TextChatViewProps {
  topic: string;
  onSwitchMode: (mode: ChatMode) => void;
  onBackToSelector: () => void;
}

export function TextChatView({ topic, onSwitchMode, onBackToSelector }: TextChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [playingSpeechKey, setPlayingSpeechKey] = useState<string | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('talk_native_language') || 'Marathi';
    }
    return 'Marathi';
  });

  const currentNativeLangConfig =
    NATIVE_LANGUAGES.find((l) => l.id === nativeLanguage) || NATIVE_LANGUAGES[0];

  const handleNativeLanguageChange = (langId: string) => {
    setNativeLanguage(langId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('talk_native_language', langId);
    }
  };

  const handlePlaySpeech = (text: string, key: string, language?: string, langCode?: string) => {
    if (playingSpeechKey === key) {
      speechPlayer.stop();
      setPlayingSpeechKey(null);
      return;
    }

    speechPlayer.play(text, {
      key,
      language: language || 'English',
      langCode: langCode || (language ? (NATIVE_LANGUAGES.find(l => l.name === language || l.id === language)?.langCode || 'en-US') : 'en-US'),
      onStart: () => setPlayingSpeechKey(key),
      onEnd: () => setPlayingSpeechKey((prev) => (prev === key ? null : prev)),
      onError: () => setPlayingSpeechKey((prev) => (prev === key ? null : prev)),
    });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate AI Response with Live Native Correction
    setTimeout(() => {
      let simulatedNativeTip = '';
      let simulatedCorrection = '';

      if (autoCorrect) {
        if (nativeLanguage === 'Marathi') {
          simulatedCorrection = 'Grammar Tip: Remember to use appropriate tense agreement for complex sentences.';
          simulatedNativeTip = 'मराठी स्पष्टीकरण: वाक्यात काळ आणि क्रियापदाचे रूप सुसंगत ठेवा.';
        } else if (nativeLanguage === 'Hindi' || nativeLanguage === 'Hinglish') {
          simulatedCorrection = 'Grammar Tip: Notice the subject-verb agreement in formal speaking.';
          simulatedNativeTip = 'हिन्दी व्याख्या: औपचारिक बातचीत में subject और verb का सही तालमेल रखें।';
        } else {
          simulatedCorrection = 'Grammar Tip: Great phrasing! Try varying sentence connectors for fluency.';
          simulatedNativeTip = `Tip in ${currentNativeLangConfig.name}: Maintain continuous sentence cadence for higher fluency score.`;
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `That's a thoughtful point about "${userMsg.text.slice(0, 35)}...". Could you elaborate more on the practical challenges?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        correction: simulatedCorrection || undefined,
        nativeCorrection: simulatedNativeTip || undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  const promptSuggestions = [
    "Give 3 academic synonyms for this",
    "Explain my last grammar mistake",
    "Suggest Band 8 IELTS phrases",
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="px-6 lg:px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSelector}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
            title="Back to Mode Options"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-[var(--text-heading)]">Interactive Chat Tutor</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-[var(--text-sub)]">Topic: <span className="font-semibold text-gray-700">{topic}</span></p>
          </div>
        </div>

        {/* Native Language and Quick Mode Switches */}
        <div className="flex items-center gap-3">
          {/* Native Language Select */}
          <div className="relative flex items-center bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-xl px-2.5 py-1.5 transition-all shadow-xs">
            <Languages size={13} className="text-indigo-600 mr-2 shrink-0" />
            <select
              aria-label="Native language for feedback"
              value={nativeLanguage}
              onChange={(e) => handleNativeLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-indigo-900 outline-none cursor-pointer pr-4 appearance-none"
            >
              {NATIVE_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="text-indigo-600 pointer-events-none absolute right-2" />
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => onSwitchMode('voice')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[var(--primary)] hover:bg-white rounded-lg transition-all"
            >
              <Mic size={14} />
              <span>Voice</span>
            </button>
            <button
              onClick={() => onSwitchMode('video')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[var(--primary)] hover:bg-white rounded-lg transition-all"
            >
              <Video size={14} />
              <span>Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <React.Fragment key={msg.id}>
            {msg.sender === 'ai' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <Wand2 size={16} />
                </div>
                <div className="bg-gray-50 p-5 rounded-3xl rounded-tl-none max-w-lg border border-gray-100 shadow-sm">
                  {msg.correction && (
                    <div className="flex flex-col gap-2 mb-3 bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="success">Grammar Feedback</Badge>
                          {msg.nativeCorrection && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                              {currentNativeLangConfig.flag} {currentNativeLangConfig.name}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handlePlaySpeech(msg.correction!, `msg-${msg.id}-english`, 'English', 'en-US')}
                          title="Listen to English correction"
                          className="text-gray-400 hover:text-blue-600 p-1 transition-colors"
                        >
                          {playingSpeechKey === `msg-${msg.id}-english` ? <VolumeX size={14} className="text-blue-600" /> : <Volume2 size={14} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">{msg.correction}</p>
                      
                      {msg.nativeCorrection && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 font-medium leading-relaxed">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-indigo-700">💡 {currentNativeLangConfig.name} ({currentNativeLangConfig.nativeName}) Tip:</span>
                            <button
                              onClick={() => handlePlaySpeech(msg.nativeCorrection!, `msg-${msg.id}-native`, currentNativeLangConfig.name, currentNativeLangConfig.langCode)}
                              title={`Listen to explanation in ${currentNativeLangConfig.name}`}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                playingSpeechKey === `msg-${msg.id}-native`
                                  ? 'bg-indigo-600 text-white shadow-xs animate-pulse'
                                  : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
                              }`}
                            >
                              {playingSpeechKey === `msg-${msg.id}-native` ? <VolumeX size={11} /> : <Volume2 size={11} />}
                              <span>{playingSpeechKey === `msg-${msg.id}-native` ? 'Stop' : `Listen in ${currentNativeLangConfig.name}`}</span>
                            </button>
                          </div>
                          {msg.nativeCorrection}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-[var(--text-heading)] leading-relaxed">
                    {msg.text}
                  </p>
                  <p className="text-[10px] text-[var(--text-sub)] mt-2 font-medium uppercase tracking-wider">
                    AI TUTOR • {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 flex-row-reverse"
              >
                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mt-1 ring-2 ring-white">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Prathmesh" alt="Me" className="w-full h-full object-cover" />
                </div>
                <div className="bg-[var(--primary)] text-white p-5 rounded-3xl rounded-tr-none max-w-lg shadow-md shadow-[var(--primary-soft)]">
                  <p className="text-sm leading-relaxed font-medium">
                    {msg.text}
                  </p>
                  <p className="text-[10px] opacity-75 mt-2 font-bold uppercase tracking-wider">
                    ME • {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom Prompt Chips & Input Box */}
      <div className="p-6 lg:p-8 bg-white border-t border-gray-100">
        {/* Suggestion Pills */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
          <span className="text-xs font-bold text-gray-400 shrink-0">Quick AI Hints:</span>
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(prompt)}
              className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 px-3 py-1.5 rounded-full transition-all shrink-0 border border-gray-200"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 bg-[var(--primary-bg)] border border-gray-200 p-2 rounded-3xl group focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all">
          <button 
            aria-label="Voice dictation"
            onClick={() => setInputText("I think integrating artificial intelligence can personalize the learning process.")}
            className="p-3 bg-white text-[var(--text-sub)] hover:text-[var(--primary)] rounded-2xl shadow-sm border border-gray-100 transition-all hover:scale-105"
            title="Voice to text dictation"
          >
            <Mic size={20} />
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message or response here..."
            className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-gray-400 font-medium px-2"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            aria-label="Send message"
            className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center"
          >
            <Send size={18} />
          </motion.button>
        </div>

        <div className="flex items-center justify-between mt-3 px-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={autoCorrect}
              onChange={(e) => setAutoCorrect(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
            />
            <span className="text-xs font-semibold text-[var(--text-sub)] group-hover:text-[var(--text-heading)] transition-colors">
              Grammar Feedback Active
            </span>
          </label>
          <span className="text-xs font-medium text-gray-400">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}

export default TextChatView;
