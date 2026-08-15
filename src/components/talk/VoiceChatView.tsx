'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  PhoneOff, 
  Sparkles, 
  Subtitles, 
  Video, 
  MessageSquare,
  Zap,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  TrendingUp,
  Radio,
  Globe,
  Settings2,
  Check,
  ChevronDown,
  Languages,
  BookOpen,
  Volume1,
  Pause,
  Play
} from 'lucide-react';
import { ChatMode } from './TalkModeSelector';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { TTS_PROVIDERS, TTSProviderId, NATIVE_LANGUAGES, NativeLanguageOption } from '@/types/voice';
import { speechPlayer } from '@/audio/speechPlayer';

interface VoiceChatViewProps {
  topic: string;
  onEndCall: () => void;
  onSwitchMode: (mode: ChatMode) => void;
}

export function VoiceChatView({ topic, onEndCall, onSwitchMode }: VoiceChatViewProps) {
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [switchToast, setSwitchToast] = useState<string | null>(null);
  const [showEnglishRule, setShowEnglishRule] = useState(false);
  const [playingSpeechKey, setPlayingSpeechKey] = useState<string | null>(null);

  // Initialize initial provider and voice from localStorage if available
  const [savedProvider] = useState<TTSProviderId>(() => {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('talk_tts_provider') as TTSProviderId;
      if (p && TTS_PROVIDERS.some((tp) => tp.id === p)) return p;
    }
    return 'gtts';
  });

  const [savedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('talk_tts_voice');
      if (v) return v;
    }
    return 'en-in'; // Indian English default
  });

  const [savedNativeLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const l = localStorage.getItem('talk_native_language');
      if (l) return l;
    }
    return 'Hindi';
  });

  const {
    state,
    isConnected,
    currentCaption,
    isRecording,
    volumeLevel,
    turns,
    latestMistakes,
    report,
    ttsProvider,
    ttsVoice,
    nativeLanguage,
    isHandsFree,
    isPaused,
    togglePause,
    toggleHandsFree,
    updateTtsConfig,
    updateNativeLanguage,
    startSpeaking,
    stopSpeaking,
    interruptAi,
    endSession,
  } = useVoiceSession({
    topic,
    correctionMode: 'realtime',
    autoStart: true,
    autoTurnEnabled: true,
    initialTtsProvider: savedProvider,
    initialTtsVoice: savedVoice,
    initialNativeLanguage: savedNativeLang,
  });

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    speechPlayer.stop();
    setPlayingSpeechKey(null);
    endSession();
    if (!report) {
      setTimeout(() => onEndCall(), 800);
    }
  };

  // Find active provider, active voice, and active native language metadata
  const currentProviderConfig = TTS_PROVIDERS.find((p) => p.id === ttsProvider) || TTS_PROVIDERS[0];
  const currentVoiceConfig =
    currentProviderConfig.voices.find((v) => v.id === ttsVoice) ||
    currentProviderConfig.voices[0];
  const currentNativeLangConfig =
    NATIVE_LANGUAGES.find((l) => l.id === nativeLanguage) || NATIVE_LANGUAGES[0];

  const handleProviderChange = (newProviderId: TTSProviderId) => {
    const targetProvider = TTS_PROVIDERS.find((p) => p.id === newProviderId) || TTS_PROVIDERS[0];
    const newVoice = targetProvider.defaultVoice;
    
    updateTtsConfig(newProviderId, newVoice);
    if (typeof window !== 'undefined') {
      localStorage.setItem('talk_tts_provider', newProviderId);
      localStorage.setItem('talk_tts_voice', newVoice);
    }

    const voiceInfo = targetProvider.voices.find((v) => v.id === newVoice);
    showSwitchFeedback(`Switched engine to ${targetProvider.name} (${voiceInfo?.name || newVoice})`);
  };

  const handleVoiceChange = (newVoiceId: string) => {
    updateTtsConfig(ttsProvider, newVoiceId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('talk_tts_voice', newVoiceId);
    }

    const voiceInfo = currentProviderConfig.voices.find((v) => v.id === newVoiceId);
    showSwitchFeedback(`Voice changed to ${voiceInfo?.flag || '🎙️'} ${voiceInfo?.name || newVoiceId} in real-time`);
  };

  const handleNativeLanguageChange = (newLangId: string) => {
    updateNativeLanguage(newLangId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('talk_native_language', newLangId);
    }

    const langInfo = NATIVE_LANGUAGES.find((l) => l.id === newLangId);
    showSwitchFeedback(`Explanations set to ${langInfo?.flag || '🌐'} ${langInfo?.name} (${langInfo?.nativeName})`);
  };

  const showSwitchFeedback = (message: string) => {
    setSwitchToast(message);
    setTimeout(() => {
      setSwitchToast((prev) => (prev === message ? null : prev));
    }, 3000);
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

  const handleTogglePause = () => {
    if (!isPaused) {
      speechPlayer.stop();
      setPlayingSpeechKey(null);
    }
    togglePause();
    showSwitchFeedback(isPaused ? 'Conversation Resumed' : 'Conversation Paused');
  };

  const isAiSpeaking = state === 'ai_speaking';
  const isUserSpeaking = isRecording || state === 'user_speaking';
  const isAiThinking = state === 'ai_thinking' || state === 'user_processing';
  const isInterrupted = state === 'interrupted';

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-[2rem] text-white overflow-hidden relative border border-slate-800 shadow-2xl">
      {/* Voice Call Top Bar */}
      <div className="px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles size={20} className={isAiSpeaking ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">AI Spoken English Tutor</h2>
              <span className={`w-2 h-2 rounded-full ${isConnected ? (isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse') : 'bg-amber-500'}`} />
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                {isConnected ? (isPaused ? 'PAUSED' : `${currentProviderConfig.name}`) : 'Connecting...'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Topic: <span className="text-slate-200 font-medium">{topic}</span></p>
          </div>
        </div>

        {/* Live TTS, Voice & Native Language Quick Selectors */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Native Language Correction Select */}
          <div className="relative flex items-center bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/40 rounded-xl px-2.5 py-1.5 transition-all shadow-sm">
            <Languages size={13} className="text-indigo-300 mr-2 shrink-0" />
            <select
              aria-label="Select Native Language for Corrections"
              value={nativeLanguage}
              onChange={(e) => handleNativeLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-indigo-100 outline-none cursor-pointer pr-4 appearance-none"
            >
              {NATIVE_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-slate-900 text-slate-200 py-1">
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="text-indigo-300 pointer-events-none absolute right-2" />
          </div>

          {/* TTS Provider Select */}
          <div className="relative flex items-center bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1.5 transition-all shadow-sm">
            <Radio size={13} className="text-blue-400 mr-2 shrink-0" />
            <select
              aria-label="Select TTS Engine"
              value={ttsProvider}
              onChange={(e) => handleProviderChange(e.target.value as TTSProviderId)}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer pr-4 appearance-none"
            >
              {TTS_PROVIDERS.map((provider) => (
                <option key={provider.id} value={provider.id} className="bg-slate-900 text-slate-200 py-1">
                  {provider.name} ({provider.badge})
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="text-slate-400 pointer-events-none absolute right-2" />
          </div>

          {/* Voice & Accent Select */}
          <div className="relative flex items-center bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1.5 transition-all shadow-sm">
            <Globe size={13} className="text-emerald-400 mr-2 shrink-0" />
            <select
              aria-label="Select Voice and Accent"
              value={ttsVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer pr-4 appearance-none"
            >
              {currentProviderConfig.voices.map((voice) => (
                <option key={voice.id} value={voice.id} className="bg-slate-900 text-slate-200 py-1">
                  {voice.flag} {voice.name} ({voice.accent})
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="text-slate-400 pointer-events-none absolute right-2" />
          </div>

          {/* Call Duration Timer with Paused Indicator */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
            isPaused
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-blue-400'
          }`}>
            {isPaused && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
            <span>{formatTime(callDuration)}</span>
            {isPaused && <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-300 ml-0.5">Paused</span>}
          </div>

          {/* Quick Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => onSwitchMode('video')}
              title="Switch to Video Chat"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Video size={15} />
            </button>
            <button
              onClick={() => onSwitchMode('text')}
              title="Switch to Text Chat"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <MessageSquare size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Stage: Animated Voice Orb & Live Waveform */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 overflow-y-auto custom-scrollbar">
        <div className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none" />

        {/* Real-time Voice / Language Switch Toast Pill */}
        <AnimatePresence>
          {switchToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-4 z-30 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md shadow-lg shadow-emerald-500/10"
            >
              <Check size={14} className="text-emerald-400" />
              <span>{switchToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Voice, Native Language & Pause/Hands-Free Status Info Bar */}
        <div className="mb-3 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 flex items-center flex-wrap justify-center gap-2.5 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-1.5">
            <span>{currentVoiceConfig.flag}</span>
            <span className="font-semibold text-slate-100">{currentVoiceConfig.name}</span>
          </div>
          <span className="text-slate-500">•</span>
          <div className="flex items-center gap-1.5 text-indigo-300">
            <span>{currentNativeLangConfig.flag}</span>
            <span className="font-semibold">Corrections in {currentNativeLangConfig.name}</span>
          </div>
          <span className="text-slate-500">•</span>
          {isPaused ? (
            <div className="flex items-center gap-1 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-0.5" />
              <span>Voice Talk Paused</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
              <span>Hands-Free Auto Turn & Barge-In Active</span>
            </div>
          )}
        </div>

        {/* Realtime Linguistic Feedback Badge (Native Language & English) */}
        <AnimatePresence>
          {latestMistakes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="mb-4 max-w-xl w-full bg-gradient-to-br from-amber-500/15 via-slate-850 to-indigo-950/40 border border-amber-500/40 p-4 rounded-2xl shadow-xl backdrop-blur-xl relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <AlertCircle size={14} />
                  </div>
                  <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                    Live Grammar Insight ({latestMistakes[0].category || 'Grammar'})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-semibold">
                    {currentNativeLangConfig.flag} {currentNativeLangConfig.name} Mode
                  </span>
                </div>
                <button
                  onClick={() =>
                    handlePlaySpeech(
                      latestMistakes[0].corrected_text,
                      'english-correction',
                      'English',
                      'en-US'
                    )
                  }
                  title="Listen to corrected English pronunciation"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                    playingSpeechKey === 'english-correction'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {playingSpeechKey === 'english-correction' ? (
                    <>
                      <VolumeX size={12} className="text-white" />
                      <span>Stop English</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={12} />
                      <span>Hear English</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mistake Comparison */}
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400 mr-2 text-[11px]">You said:</span>
                  <span className="line-through text-red-400/90 font-medium">"{latestMistakes[0].original_text}"</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="text-slate-400 font-normal text-[11px]">Say:</span>
                  <span className="bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    "{latestMistakes[0].corrected_text}"
                  </span>
                </div>
              </div>

              {/* Native Language Explanation Pill with Native Listen Option */}
              {latestMistakes[0].native_explanation ? (
                <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-xs shadow-inner">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                      <span className="text-sm">{currentNativeLangConfig.flag}</span>
                      <span>{currentNativeLangConfig.name} Explanation:</span>
                    </div>

                    {/* Dedicated Native Audio Listen Button (e.g. Marathi / Hindi) */}
                    <button
                      onClick={() =>
                        handlePlaySpeech(
                          latestMistakes[0].native_explanation!,
                          'native-explanation',
                          currentNativeLangConfig.name,
                          currentNativeLangConfig.langCode
                        )
                      }
                      title={`Listen to explanation in ${currentNativeLangConfig.name}`}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-sm ${
                        playingSpeechKey === 'native-explanation'
                          ? 'bg-indigo-600 text-white shadow-indigo-500/40 border border-indigo-400 ring-2 ring-indigo-400/30'
                          : 'bg-indigo-900/90 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 hover:border-indigo-400'
                      }`}
                    >
                      {playingSpeechKey === 'native-explanation' ? (
                        <>
                          <VolumeX size={12} className="text-white" />
                          <span>Stop Native</span>
                          <span className="flex items-end gap-0.5 ml-1 h-3">
                            <span className="w-1 h-full bg-white rounded-full animate-pulse" />
                            <span className="w-1 h-2 bg-white rounded-full animate-pulse [animation-delay:150ms]" />
                            <span className="w-1 h-full bg-white rounded-full animate-pulse [animation-delay:300ms]" />
                          </span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} className="text-indigo-300" />
                          <span>{currentNativeLangConfig.listenLabel || `Listen in ${currentNativeLangConfig.name}`}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-indigo-100 font-medium leading-relaxed">
                    {latestMistakes[0].native_explanation}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-amber-400 font-semibold mr-1">Rule:</span>
                    {latestMistakes[0].explanation}
                  </div>
                  <button
                    onClick={() =>
                      handlePlaySpeech(
                        latestMistakes[0].explanation,
                        'english-rule',
                        'English',
                        'en-US'
                      )
                    }
                    title="Listen to grammar rule"
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-300 border border-slate-700"
                  >
                    <Volume2 size={12} />
                    <span>Listen</span>
                  </button>
                </div>
              )}

              {/* Toggle to view English grammar rule */}
              {latestMistakes[0].native_explanation && (
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => setShowEnglishRule(!showEnglishRule)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer flex items-center gap-1"
                  >
                    <BookOpen size={11} />
                    <span>{showEnglishRule ? 'Hide English Grammar Rule' : 'Show English Grammar Rule'}</span>
                  </button>
                </div>
              )}

              {showEnglishRule && latestMistakes[0].explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 p-2.5 rounded-lg bg-slate-900 text-[11px] text-slate-300 border border-slate-800 flex items-start justify-between gap-2"
                >
                  <div className="leading-relaxed">
                    <span className="text-amber-400 font-semibold mr-1">English Rule:</span>
                    {latestMistakes[0].explanation}
                  </div>
                  <button
                    onClick={() =>
                      handlePlaySpeech(
                        latestMistakes[0].explanation,
                        'english-rule',
                        'English',
                        'en-US'
                      )
                    }
                    title="Listen to English rule"
                    className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold border transition-all ${
                      playingSpeechKey === 'english-rule'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700'
                    }`}
                  >
                    {playingSpeechKey === 'english-rule' ? <VolumeX size={11} /> : <Volume2 size={11} />}
                    <span>{playingSpeechKey === 'english-rule' ? 'Stop' : 'Listen'}</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Voice Orb */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          <div className="relative flex items-center justify-center">
            {/* AI Speaking Waves */}
            {isAiSpeaking && !isPaused && (
              <>
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute w-64 h-64 rounded-full bg-blue-500/20 border border-blue-400/30"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="absolute w-48 h-48 rounded-full bg-indigo-500/30 border border-indigo-400/40"
                />
              </>
            )}

            {/* User Speaking Waves */}
            {isUserSpeaking && !isPaused && (
              <motion.div 
                animate={{ scale: [1, 1 + (volumeLevel / 100) * 0.4, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                className="absolute w-56 h-56 rounded-full bg-emerald-500/20 border border-emerald-400/30"
              />
            )}

            {/* Central Orb Avatar */}
            <div className={`relative z-10 w-36 h-36 rounded-full bg-gradient-to-tr ${
              isPaused
                ? 'from-amber-600 via-yellow-600 to-amber-700 shadow-amber-500/30 ring-amber-500/40'
                : isAiSpeaking
                ? 'from-blue-600 via-indigo-600 to-sky-400 shadow-blue-500/40'
                : isUserSpeaking
                ? 'from-emerald-500 via-teal-600 to-cyan-400 shadow-emerald-500/40'
                : isAiThinking
                ? 'from-amber-500 via-orange-600 to-yellow-400 animate-pulse'
                : isInterrupted
                ? 'from-purple-500 via-indigo-600 to-pink-400'
                : 'from-emerald-600 to-teal-700 ring-emerald-400/50'
            } shadow-2xl flex flex-col items-center justify-center p-2 ring-4 ring-slate-800 transition-all duration-300`}>
              <div className="w-20 h-20 rounded-full bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white mb-1">
                {isPaused ? (
                  <Pause size={34} className="text-amber-200" />
                ) : (
                  <Sparkles size={36} className={isAiSpeaking ? 'animate-bounce' : isUserSpeaking ? 'animate-pulse' : ''} />
                )}
              </div>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-white/90 text-center px-1">
                {isPaused
                  ? 'Talk Paused'
                  : isAiSpeaking
                  ? 'Teacher Speaking'
                  : isUserSpeaking
                  ? 'You Speaking'
                  : isAiThinking
                  ? 'AI Thinking...'
                  : isInterrupted
                  ? 'Interrupted'
                  : 'AI Listening'}
              </span>
            </div>
          </div>

          {/* Paused Action Card */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mt-4 flex items-center gap-3 bg-amber-950/60 border border-amber-500/40 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-semibold text-amber-200">Voice talk is paused. Take your time!</span>
                </div>
                <button
                  onClick={handleTogglePause}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Play size={13} className="fill-slate-950" />
                  <span>Resume</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Soundwave Bars */}
        <div className="flex items-center gap-1.5 h-12 my-6">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: isPaused
                  ? 4
                  : isAiSpeaking
                  ? [8, Math.floor(Math.random() * 36) + 12, 8]
                  : isUserSpeaking
                  ? [8, Math.min(44, Math.floor((volumeLevel / 100) * 44) + (i % 3) * 6), 8]
                  : [4, 8, 4],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.35 + (i % 5) * 0.08,
                ease: 'easeInOut',
              }}
              className={`w-1.5 rounded-full ${
                isPaused
                  ? 'bg-slate-700'
                  : isAiSpeaking
                  ? 'bg-blue-400'
                  : isUserSpeaking
                  ? 'bg-emerald-400'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Live Captions Subtitle Box */}
        {showCaptions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-lg text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Subtitles size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live Subtitles • {isPaused ? 'Talk Paused' : isAiSpeaking ? 'Teacher Audio' : isUserSpeaking ? 'Student Audio' : 'Conversation Flow'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-relaxed min-h-[1.5rem]">
              {isPaused
                ? '"Session is paused. Click resume to continue practicing spoken English."'
                : currentCaption
                ? `"${currentCaption}"`
                : 'Listening for conversation...'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Voice Call Control Toolbar */}
      <div className="p-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Captions Toggle Button */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
              showCaptions
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Subtitles size={18} />
            <span className="hidden sm:inline">Captions</span>
          </button>

          {/* Pause / Resume Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTogglePause}
            title={isPaused ? "Resume conversation" : "Pause conversation"}
            className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-600/30 ring-2 ring-emerald-400/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40 hover:border-amber-400'
            }`}
          >
            {isPaused ? (
              <>
                <Play size={18} className="fill-current" />
                <span>Resume Talk</span>
              </>
            ) : (
              <>
                <Pause size={18} />
                <span>Pause</span>
              </>
            )}
          </motion.button>

          {isAiSpeaking && !isPaused && (
            <button
              onClick={interruptAi}
              className="px-3.5 py-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-2xl text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors animate-pulse"
            >
              <Zap size={15} />
              <span>Interrupt Teacher</span>
            </button>
          )}
        </div>

        {/* Primary Call Controls: Hands-Free Auto Active / Paused Pill */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={isPaused ? handleTogglePause : undefined}
            className={`px-6 py-3.5 rounded-full flex items-center gap-3 font-extrabold shadow-lg transition-all ${
              isPaused
                ? 'bg-amber-950/90 border border-amber-500/60 text-amber-300 cursor-pointer hover:bg-amber-900/90'
                : isUserSpeaking
                ? 'bg-emerald-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/30'
                : isAiSpeaking
                ? 'bg-blue-600 text-white shadow-blue-600/40'
                : isAiThinking
                ? 'bg-amber-600 text-white shadow-amber-600/40'
                : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
            }`}
          >
            {isPaused ? (
              <>
                <Pause size={22} className="text-amber-400 animate-pulse" />
                <span className="text-sm">Session Paused (Click to Resume)</span>
              </>
            ) : (
              <>
                <Mic size={22} className={isUserSpeaking ? 'animate-bounce text-white' : isAiSpeaking ? 'text-blue-300' : 'text-emerald-400 animate-pulse'} />
                <span className="text-sm">
                  {isUserSpeaking
                    ? 'Speaking (Auto sends when you pause)'
                    : isAiSpeaking
                    ? 'Teacher Speaking (Listen to question)'
                    : isAiThinking
                    ? 'AI is processing your answer...'
                    : 'AI Listening (Speak freely)'}
                </span>
              </>
            )}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndCall}
            title="End Session & Generate Report"
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all cursor-pointer"
          >
            <PhoneOff size={22} />
          </motion.button>
        </div>

        {/* Info Hint */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium">
          {isPaused ? (
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Paused</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Hands-Free VAD Active</span>
            </div>
          )}
        </div>
      </div>

      {/* End-of-Session Performance Report Modal */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg z-50 flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <Award size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">English Performance Report</h3>
                    <p className="text-xs text-slate-400">{topic} • Duration: {formatTime(report.duration_seconds || callDuration)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-blue-400">{report.overall_score}</span>
                  <span className="text-xs text-slate-400 block font-semibold">/ 100 Overall</span>
                </div>
              </div>

              {/* Metric Breakdown Progress Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-400 block">Grammar</span>
                  <span className="text-lg font-extrabold text-white">{report.grammar_score}%</span>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${report.grammar_score}%` }} />
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-400 block">Vocabulary</span>
                  <span className="text-lg font-extrabold text-white">{report.vocabulary_score}%</span>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${report.vocabulary_score}%` }} />
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-400 block">Fluency</span>
                  <span className="text-lg font-extrabold text-white">{report.fluency_score}%</span>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${report.fluency_score}%` }} />
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-400 block">Confidence</span>
                  <span className="text-lg font-extrabold text-white">{report.confidence_score}%</span>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${report.confidence_score}%` }} />
                  </div>
                </div>
              </div>

              {/* Examiner Summary */}
              {report.summary && (
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{report.summary}"</p>
                </div>
              )}

              {/* Strengths & Recommendations */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {report.strengths?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Key Strengths
                    </h4>
                    <ul className="space-y-1.5 text-slate-300">
                      {report.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
                      <TrendingUp size={14} /> Actionable Focus
                    </h4>
                    <ul className="space-y-1.5 text-slate-300">
                      {report.recommendations.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-400">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onEndCall}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <span>Close & Return to Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VoiceChatView;
