'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff,
  Sparkles, 
  Wand2, 
  Video, 
  Volume2, 
  VolumeX,
  MessageSquare,
  ArrowLeft,
  Languages,
  ChevronDown,
  Pause,
  Play,
  PhoneOff,
  AlertCircle,
  Check,
  BookOpen,
  FileText,
  Loader2,
  X
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { ChatMode } from './TalkModeSelector';
import { NATIVE_LANGUAGES, TTS_PROVIDERS, TTSProviderId } from '@/types/voice';
import { speechPlayer } from '@/audio/speechPlayer';
import { useAuth } from '@/context/AuthContext';
import { useVoiceSession, UserSessionContext } from '@/hooks/useVoiceSession';
import { SessionReportDetailView } from '@/components/reports/SessionReportDetailView';

interface TextChatViewProps {
  topic: string;
  onSwitchMode: (mode: ChatMode) => void;
  onBackToSelector: () => void;
  onViewReports?: () => void;
}

export function TextChatView({ topic, onSwitchMode, onBackToSelector, onViewReports }: TextChatViewProps) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [silenceCountdown, setSilenceCountdown] = useState<number>(30);
  const [switchToast, setSwitchToast] = useState<string | null>(null);
  const [playingSpeechKey, setPlayingSpeechKey] = useState<string | null>(null);
  const [dismissedMistakeKeys, setDismissedMistakeKeys] = useState<Set<string>>(new Set());
  const [expandedEnglishRules, setExpandedEnglishRules] = useState<Set<string>>(new Set());
  const [isDictating, setIsDictating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasEndedRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Saved native language preference
  const [savedNativeLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const l = localStorage.getItem('talk_native_language');
      if (l) return l;
    }
    return user?.profile?.native_language || 'Hindi';
  });

  const userContext: UserSessionContext | undefined = user
    ? {
        name: user.first_name || user.username || 'Student',
        english_level: user.profile?.english_level || 'B1',
        native_language: user.profile?.native_language || savedNativeLang,
        occupation: user.profile?.occupation || 'Professional',
        interests: user.profile?.interests || ['technology', 'general conversations'],
        goals: user.profile?.goals || ['improve spoken English', 'speak with natural fluency'],
      }
    : undefined;

  // Real-time conversation hook connected to Django Backend WebSocket
  const {
    state,
    isConnected,
    currentCaption,
    turns,
    latestMistakes,
    report,
    ttsProvider,
    ttsVoice,
    nativeLanguage,
    isPaused,
    maxDurationSeconds,
    inactivityTimeoutSeconds,
    togglePause,
    updateNativeLanguage,
    sendTextMessage,
    endSession,
  } = useVoiceSession({
    topic,
    sessionType: 'text_chat',
    correctionMode: 'realtime',
    autoStart: true,
    autoTurnEnabled: false,
    initialNativeLanguage: user?.profile?.native_language || savedNativeLang,
    userContext,
  });

  // Sync silenceCountdown with dynamic inactivityTimeoutSeconds from DB
  useEffect(() => {
    if (inactivityTimeoutSeconds) {
      setSilenceCountdown(inactivityTimeoutSeconds);
    }
  }, [inactivityTimeoutSeconds]);

  // 1. Session Duration Timer using dynamic maxDurationSeconds from DB
  useEffect(() => {
    if (isPaused || report || state === 'ended' || !isConnected) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => {
        const next = prev + 1;
        // Auto-end chat if max duration is reached (dynamic from DB)
        if (next >= maxDurationSeconds && !hasEndedRef.current) {
          hasEndedRef.current = true;
          showFeedbackToast(`⏱️ Session time limit reached (${formatTime(maxDurationSeconds)}). Generating report...`);
          handleEndChat('max_duration_reached');
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, report, state, isConnected, maxDurationSeconds]);

  // 2. Inactivity Timeout using dynamic inactivityTimeoutSeconds from DB
  useEffect(() => {
    if (isPaused || report || state === 'ended' || !isConnected) return;

    // Reset inactivity countdown while AI is thinking/speaking or user is actively typing
    if (state === 'ai_thinking' || state === 'ai_speaking' || state === 'user_processing') {
      setSilenceCountdown(inactivityTimeoutSeconds || 30);
      return;
    }

    const inactivityInterval = setInterval(() => {
      setSilenceCountdown((prev) => {
        if (prev <= 1) {
          if (!hasEndedRef.current) {
            hasEndedRef.current = true;
            showFeedbackToast(`🔇 Chat auto-ended due to ${inactivityTimeoutSeconds || 30}s of inactivity. Generating report...`);
            handleEndChat('inactivity_timeout');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(inactivityInterval);
  }, [isPaused, report, state, isConnected, inactivityTimeoutSeconds]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, currentCaption, state]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showFeedbackToast = (msg: string) => {
    setSwitchToast(msg);
    setTimeout(() => {
      setSwitchToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleEndChat = (reason: string = 'user_ended') => {
    hasEndedRef.current = true;
    speechPlayer.stop();
    setPlayingSpeechKey(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    endSession(reason);
  };

  const currentNativeLangConfig =
    NATIVE_LANGUAGES.find((l) => l.id === nativeLanguage) || NATIVE_LANGUAGES[0];

  const handleNativeLanguageChange = (langId: string) => {
    updateNativeLanguage(langId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('talk_native_language', langId);
    }
    const langInfo = NATIVE_LANGUAGES.find((l) => l.id === langId);
    showFeedbackToast(`Explanations set to ${langInfo?.flag || '🌐'} ${langInfo?.name} (${langInfo?.nativeName})`);
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
    const trimmed = inputText.trim();
    if (!trimmed || isPaused) return;

    // Reset silence countdown upon user activity
    setSilenceCountdown(inactivityTimeoutSeconds || 30);
    sendTextMessage(trimmed);
    setInputText('');
  };

  const toggleEnglishRule = (key: string) => {
    setExpandedEnglishRules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const dismissMistake = (key: string) => {
    setDismissedMistakeKeys((prev) => new Set(prev).add(key));
  };

  // Web Speech API Voice Dictation
  const handleToggleDictation = () => {
    if (isDictating) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsDictating(false);
      return;
    }

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showFeedbackToast('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsDictating(true);
        showFeedbackToast('🎙️ Listening... Speak now');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
          setSilenceCountdown(inactivityTimeoutSeconds || 30);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('[Dictation Error]', err);
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start dictation:', err);
      setIsDictating(false);
    }
  };

  const promptSuggestions = [
    "Could you give 3 academic synonyms for this?",
    "Explain my last grammar mistake in detail",
    "Suggest Band 8 IELTS phrases for this idea",
    "How can I sound more natural in discussions?"
  ];

  const isAiThinking = state === 'ai_thinking';
  const isAiSpeaking = state === 'ai_speaking';
  const isUserProcessing = state === 'user_processing';

  // If session concluded and report is generated, show full Diagnostic Report View
  if (report) {
    return (
      <SessionReportDetailView
        sessionId={report.session_id}
        initialData={{
          session: {
            id: report.session_id,
            title: topic,
            topic: topic,
            session_type: 'Interactive Chat',
            correction_mode: 'realtime',
            status: 'completed',
            max_duration_seconds: maxDurationSeconds,
            inactivity_timeout_seconds: inactivityTimeoutSeconds,
            end_reason: report.end_reason,
            started_at: new Date().toISOString(),
            duration_seconds: report.duration_seconds || callDuration,
            turns_count: turns.length,
            report: report,
          },
          report,
          turns,
        }}
        onBack={() => {
          speechPlayer.stop();
          onBackToSelector();
        }}
        onStartPractice={() => {
          speechPlayer.stop();
          onBackToSelector();
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSelector}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
            title="Back to Mode Options"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-sm sm:text-base text-[var(--text-heading)]">Interactive Chat Tutor</h2>
              <span className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? (isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse') : 'bg-amber-500'}`} />
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
                {isConnected ? (isPaused ? 'PAUSED' : 'Live AI') : 'Connecting...'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-sub)] truncate max-w-[180px] sm:max-w-none">
              Topic: <span className="font-semibold text-gray-700">{topic}</span>
            </p>
          </div>
        </div>

        {/* Dynamic DB Time Limit, Native Language, Pause, & Mode Switches */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Native Language Select */}
          <div className="relative flex items-center bg-indigo-50/90 hover:bg-indigo-100/90 border border-indigo-200 rounded-xl px-2.5 py-1.5 transition-all shadow-xs">
            <Languages size={13} className="text-indigo-600 mr-1.5 shrink-0" />
            <select
              aria-label="Native language for feedback"
              value={nativeLanguage}
              onChange={(e) => handleNativeLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-indigo-900 outline-none cursor-pointer pr-4 appearance-none"
            >
              {NATIVE_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="text-indigo-600 pointer-events-none absolute right-2" />
          </div>

          {/* Dynamic DB Session Duration Timer */}
          <div className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition-all ${
            isPaused
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : callDuration >= maxDurationSeconds - 30
              ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
              : 'bg-gray-50 border-gray-200 text-emerald-700'
          }`}>
            {isPaused && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
            <span>{formatTime(callDuration)}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">{formatTime(maxDurationSeconds)}</span>
            {isPaused && <span className="text-[9px] font-sans font-extrabold uppercase text-amber-700 ml-0.5">Paused</span>}
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={() => togglePause()}
            title={isPaused ? 'Resume Session' : 'Pause Session'}
            className={`p-2 rounded-xl border transition-all ${
              isPaused 
                ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
            }`}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>

          {/* End Chat & Get Report Button */}
          <button
            onClick={() => handleEndChat('user_ended')}
            title="Finish Chat and Generate Diagnostic Report"
            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
          >
            <PhoneOff size={13} />
            <span className="hidden sm:inline">End & Report</span>
          </button>

          {/* Reports Navigation Button */}
          {onViewReports && (
            <button
              onClick={onViewReports}
              title="View Past Reports"
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              <FileText size={13} />
              <span className="hidden sm:inline">Reports</span>
            </button>
          )}

          {/* Mode switch pills */}
          <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => onSwitchMode('voice')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-gray-600 hover:text-[var(--primary)] hover:bg-white rounded-lg transition-all"
            >
              <Mic size={13} />
              <span>Voice</span>
            </button>
            <button
              onClick={() => onSwitchMode('video')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-gray-600 hover:text-[var(--primary)] hover:bg-white rounded-lg transition-all"
            >
              <Video size={13} />
              <span>Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notifications & Warnings */}
      <AnimatePresence>
        {switchToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-emerald-700 text-white px-4 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md shadow-lg shadow-emerald-900/20 whitespace-nowrap"
          >
            <Check size={14} className="text-emerald-200" />
            <span>{switchToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inactivity Warning Toast */}
      <AnimatePresence>
        {!report && state !== 'ended' && !isPaused && isConnected && state === 'idle' && silenceCountdown <= 10 && silenceCountdown > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-xl ring-2 ring-amber-400 whitespace-nowrap animate-bounce"
          >
            <AlertCircle size={15} className="shrink-0" />
            <span>No activity detected. Session will auto-end in {silenceCountdown}s...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar bg-slate-50/40">
        {/* Intro Greeting Card if turns empty */}
        {turns.length === 0 && !isAiThinking && !isAiSpeaking && (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1">Starting Interactive Conversation...</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Connecting to the AI Tutor for <span className="font-semibold text-gray-700">{topic}</span>. The tutor will greet you shortly!
            </p>
          </div>
        )}

        {/* Conversation Turns Streamed from Backend */}
        {turns.map((turn, index) => {
          const isUser = turn.speaker === 'user';
          const turnKey = `turn-${turn.id || index}-${turn.speaker}`;

          return (
            <React.Fragment key={turnKey}>
              {isUser ? (
                /* User Message Bubble */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3.5 flex-row-reverse"
                >
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-sm">
                    {user?.first_name ? user.first_name[0].toUpperCase() : 'ME'}
                  </div>
                  <div className="max-w-xl space-y-2">
                    <div className="bg-emerald-600 text-white p-4 sm:p-5 rounded-3xl rounded-tr-none shadow-md shadow-emerald-600/10">
                      <p className="text-sm leading-relaxed font-medium">
                        {turn.transcript}
                      </p>
                      <p className="text-[10px] text-emerald-100 mt-2 font-bold uppercase tracking-wider">
                        YOU
                      </p>
                    </div>

                    {/* Linguistic Corrections from Backend for this Turn */}
                    {autoCorrect && turn.mistakes && turn.mistakes.length > 0 && (
                      <div className="space-y-2">
                        {turn.mistakes.map((mistake, mIdx) => {
                          const mistakeKey = `mistake-${index}-${mIdx}-${mistake.original_text}`;
                          if (dismissedMistakeKeys.has(mistakeKey)) return null;

                          return (
                            <motion.div
                              key={mistakeKey}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white border border-amber-200 p-3.5 rounded-2xl shadow-xs text-xs space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Badge variant="grammar">Grammar Feedback</Badge>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                                    {currentNativeLangConfig.flag} {currentNativeLangConfig.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handlePlaySpeech(mistake.corrected_text, `audio-${mistakeKey}-en`, 'English', 'en-US')}
                                    title="Listen to corrected English"
                                    className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                                  >
                                    {playingSpeechKey === `audio-${mistakeKey}-en` ? <VolumeX size={14} className="text-emerald-600" /> : <Volume2 size={14} />}
                                  </button>
                                  <button
                                    onClick={() => dismissMistake(mistakeKey)}
                                    title="Dismiss note"
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Comparison */}
                              <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="line-through text-red-500 font-medium">"{mistake.original_text}"</span>
                                <span className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                                  "{mistake.corrected_text}"
                                </span>
                              </div>

                              {/* Native Language Explanation */}
                              {mistake.native_explanation && (
                                <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-950 font-medium leading-relaxed">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-bold text-indigo-700">💡 {currentNativeLangConfig.name} ({currentNativeLangConfig.nativeName}) Explanation:</span>
                                    <button
                                      onClick={() => handlePlaySpeech(mistake.native_explanation!, `audio-${mistakeKey}-native`, currentNativeLangConfig.name, currentNativeLangConfig.langCode)}
                                      title={`Listen in ${currentNativeLangConfig.name}`}
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                        playingSpeechKey === `audio-${mistakeKey}-native`
                                          ? 'bg-indigo-600 text-white shadow-xs animate-pulse'
                                          : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
                                      }`}
                                    >
                                      {playingSpeechKey === `audio-${mistakeKey}-native` ? <VolumeX size={11} /> : <Volume2 size={11} />}
                                      <span>{playingSpeechKey === `audio-${mistakeKey}-native` ? 'Stop' : `Listen in ${currentNativeLangConfig.name}`}</span>
                                    </button>
                                  </div>
                                  <p className="text-[11px]">{mistake.native_explanation}</p>
                                </div>
                              )}

                              {/* English Grammar Rule Toggle */}
                              {mistake.explanation && (
                                <div>
                                  <button
                                    onClick={() => toggleEnglishRule(mistakeKey)}
                                    className="text-[10px] text-gray-500 hover:text-gray-800 underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <BookOpen size={11} />
                                    <span>{expandedEnglishRules.has(mistakeKey) ? 'Hide English Rule' : 'Show English Rule'}</span>
                                  </button>
                                  {expandedEnglishRules.has(mistakeKey) && (
                                    <div className="mt-1.5 p-2 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-700 flex items-start justify-between gap-2">
                                      <span><strong className="text-gray-900">English Rule:</strong> {mistake.explanation}</span>
                                      <button
                                        onClick={() => handlePlaySpeech(mistake.explanation, `audio-${mistakeKey}-rule`, 'English', 'en-US')}
                                        title="Listen to rule"
                                        className="shrink-0 p-1 text-gray-400 hover:text-blue-600"
                                      >
                                        <Volume2 size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* AI Tutor Message Bubble */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3.5"
                >
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs border border-emerald-200">
                    <Wand2 size={16} />
                  </div>
                  <div className="bg-white p-4 sm:p-5 rounded-3xl rounded-tl-none max-w-xl border border-gray-100 shadow-sm relative group">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={11} />
                        AI TUTOR
                      </span>
                      {/* Audio playback button for AI response */}
                      <button
                        onClick={() => handlePlaySpeech(turn.transcript, `ai-msg-${turnKey}`, 'English', 'en-US')}
                        title="Listen to AI Tutor response"
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                          playingSpeechKey === `ai-msg-${turnKey}`
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {playingSpeechKey === `ai-msg-${turnKey}` ? <VolumeX size={11} /> : <Volume2 size={11} />}
                        <span>{playingSpeechKey === `ai-msg-${turnKey}` ? 'Stop' : 'Listen'}</span>
                      </button>
                    </div>

                    <p className="text-sm text-[var(--text-heading)] leading-relaxed font-normal">
                      {turn.transcript}
                    </p>
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          );
        })}

        {/* Live Streaming AI Indicator */}
        {(isAiSpeaking || isAiThinking || isUserProcessing) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3.5"
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs border border-emerald-200 animate-pulse">
              <Wand2 size={16} />
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-3xl rounded-tl-none max-w-xl border border-emerald-100 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} className="animate-spin" />
                  {isAiThinking ? 'AI TUTOR IS THINKING...' : isUserProcessing ? 'ANALYZING RESPONSE...' : 'AI TUTOR IS RESPONDING...'}
                </span>
              </div>
              
              {currentCaption && state === 'ai_speaking' ? (
                <p className="text-sm text-[var(--text-heading)] leading-relaxed font-normal">
                  {currentCaption}
                  <span className="inline-block w-1.5 h-4 bg-emerald-600 ml-1 animate-pulse" />
                </p>
              ) : (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area & Quick AI Hints */}
      <div className="p-4 sm:p-6 lg:p-7 bg-white border-t border-gray-100 shrink-0">
        {/* Suggestion Pills */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
          <span className="text-xs font-bold text-gray-400 shrink-0">Quick Hints:</span>
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(prompt);
                setSilenceCountdown(inactivityTimeoutSeconds || 30);
              }}
              className="text-xs font-medium text-gray-600 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 px-3 py-1.5 rounded-full transition-all shrink-0 border border-gray-200"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className={`flex items-center gap-2 sm:gap-3 bg-gray-50 border p-2 rounded-3xl transition-all ${
          isDictating 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40' 
            : 'border-gray-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 focus-within:bg-white'
        }`}>
          {/* Voice Dictation Button */}
          <button 
            type="button"
            aria-label={isDictating ? 'Stop Voice Dictation' : 'Start Voice Dictation'}
            onClick={handleToggleDictation}
            className={`p-2.5 sm:p-3 rounded-2xl shadow-xs border transition-all ${
              isDictating 
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-white text-gray-600 hover:text-emerald-700 border-gray-200 hover:bg-gray-50'
            }`}
            title={isDictating ? 'Stop speech recognition' : 'Speech to text dictation'}
          >
            {isDictating ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input 
            type="text" 
            value={inputText}
            disabled={isPaused || !isConnected}
            onChange={(e) => {
              setInputText(e.target.value);
              setSilenceCountdown(inactivityTimeoutSeconds || 30);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isPaused 
                ? 'Conversation is paused. Click Play button above to resume.'
                : !isConnected
                ? 'Connecting to AI conversation...'
                : isDictating 
                ? 'Listening to speech... (Click mic to stop)'
                : 'Type your message or response in English...'
            }
            className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-gray-400 font-medium px-2 disabled:opacity-60"
          />

          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={!inputText.trim() || isPaused || !isConnected}
            onClick={handleSend}
            aria-label="Send message"
            className="p-2.5 sm:p-3 bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-2xl shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isUserProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </motion.button>
        </div>

        {/* Footer info: Grammar Feedback status & time notice */}
        <div className="flex items-center justify-between mt-2.5 px-2 flex-wrap gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={autoCorrect}
              onChange={(e) => setAutoCorrect(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
            />
            <span className="font-semibold text-[var(--text-sub)] group-hover:text-[var(--text-heading)] transition-colors">
              Live Grammar & Native Explanation Active
            </span>
          </label>
          <span className="text-gray-400 font-medium">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px] font-mono text-gray-600">Enter</kbd> to send
          </span>
        </div>
      </div>
    </div>
  );
}

export default TextChatView;

