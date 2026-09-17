'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  SkipForward,
  X,
  ChevronRight,
  Loader2,
  Check,
  PhoneOff,
  Edit3,
  Sparkles,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import AnimatedInterviewer from './AnimatedInterviewer';
import { speechPlayer } from '@/audio/speechPlayer';
import { AudioRecorder } from '@/audio/recorder';
import interviewService from '@/services/interviewService';
import { apiFetch } from '@/services/api';
import type {
  InterviewModule,
  InterviewSession,
  SessionAnswer,
  InterviewReport,
} from '@/types/interview';

type RunnerState =
  | 'intro'
  | 'playing_question'
  | 'user_turn'
  | 'processing_turn'
  | 'next'
  | 'wrap_up'
  | 'generating_report'
  | 'done';

type InterviewerAvatarState = 'idle' | 'talking' | 'listening';

interface SessionRunnerProps {
  module: InterviewModule;
  onComplete: (report: InterviewReport) => void;
  onExit: () => void;
}

/**
 * Robust STT Transcriber:
 * 1. Uploads audio blob as multipart/form-data via apiFetch (auto JWT + token refresh)
 * 2. Falls back to base64 JSON payload
 * 3. Logs received transcription extensively
 */
async function callWhisperSTT(blob: Blob): Promise<string> {
  console.log(`[Interview STT] Starting transcription for audio blob: ${blob.size} bytes, type: ${blob.type || 'audio/webm'}`);
  if (!blob || blob.size < 200) {
    console.warn('[Interview STT] Audio blob is too small (< 200 bytes), skipping STT call.');
    return '';
  }

  // Attempt 1: Multipart FormData
  try {
    const formData = new FormData();
    formData.append('audio', blob, 'answer.webm');
    formData.append('language', 'en');

    console.log('[Interview STT] Sending multipart audio to /api/ai/stt/transcribe/...');
    const data = await apiFetch<{ text?: string }>('/api/ai/stt/transcribe/', {
      method: 'POST',
      body: formData,
    });

    const text = (data?.text || '').trim();
    console.log('[Interview STT] >>> RECEIVED TRANSCRIPTION (Multipart): <<<', JSON.stringify(text));
    if (text) return text;
  } catch (err: any) {
    console.warn('[Interview STT] Multipart upload failed:', err?.message || err);
  }

  // Attempt 2: Base64 JSON fallback
  try {
    console.log('[Interview STT] Falling back to Base64 JSON upload...');
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);

    const data = await apiFetch<{ text?: string }>('/api/ai/stt/transcribe/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio: base64Audio,
        language: 'en',
      }),
    });

    const text = (data?.text || '').trim();
    console.log('[Interview STT] >>> RECEIVED TRANSCRIPTION (Base64 JSON): <<<', JSON.stringify(text));
    return text;
  } catch (err: any) {
    console.warn('[Interview STT] Base64 upload failed:', err?.message || err);
    return '';
  }
}

export default function SessionRunner({ module, onComplete, onExit }: SessionRunnerProps) {
  const [runnerState, setRunnerState] = useState<RunnerState>('intro');
  const [avatarState, setAvatarState] = useState<InterviewerAvatarState>('idle');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [isEditingText, setIsEditingText] = useState(false);
  const isEditingTextRef = useRef(false);
  useEffect(() => {
    isEditingTextRef.current = isEditingText;
  }, [isEditingText]);

  const [lastTranscript, setLastTranscript] = useState("");
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");

  // 3-Second Silence Auto-Submit (driven by AudioRecorder Continuous VAD)
  const [silenceCountdown, setSilenceCountdown] = useState<number>(3);
  const [hasSpoken, setHasSpoken] = useState<boolean>(false);
  const hasSpokenRef = useRef<boolean>(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const speechRecRef = useRef<any>(null);
  const speechRecTranscriptRef = useRef<string>("");
  const liveTranscriptRef = useRef<string>("");
  const recordStartTimeRef = useRef<number>(0);
  const currentAnswerRef = useRef<string>("");
  const isSubmittingAnswerRef = useRef<boolean>(false);
  const answersRef = useRef<SessionAnswer[]>([]);
  const questionSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSubmitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speakingQuestionIndexRef = useRef<number | null>(null);
  const postSpeechDelayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const questions = module.questions || [];
  const currentQ = questions[currentQIndex];
  const progress =
    questions.length > 0 ? (currentQIndex / questions.length) * 100 : 0;
  const isAiSpeaking = runnerState === 'playing_question' || avatarState === 'talking';

  // Gentle reminder if candidate sits silently for 45 seconds before starting to speak
  useEffect(() => {
    if (runnerState !== "user_turn") {
      setSilenceCountdown(3);
      setHasSpoken(false);
      hasSpokenRef.current = false;
      return;
    }

    const preSpeechTimer = setTimeout(() => {
      if (!hasSpokenRef.current && !isEditingTextRef.current) {
        setStatusText(
          'Waiting for your answer... Speak into your mic or click "Type / Edit" below.'
        );
      }
    }, 45000);

    return () => clearTimeout(preSpeechTimer);
  }, [runnerState]);

  useEffect(() => {
    return () => {
      cleanupAllAudio();
      if (questionSafetyTimerRef.current) {
        clearTimeout(questionSafetyTimerRef.current);
      }
      if (postSpeechDelayTimerRef.current) {
        clearTimeout(postSpeechDelayTimerRef.current);
      }
    };
  }, []);

  const cleanupAllAudio = () => {
    if (questionSafetyTimerRef.current) {
      clearTimeout(questionSafetyTimerRef.current);
      questionSafetyTimerRef.current = null;
    }
    if (postSpeechDelayTimerRef.current) {
      clearTimeout(postSpeechDelayTimerRef.current);
      postSpeechDelayTimerRef.current = null;
    }
    speakingQuestionIndexRef.current = null;
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch (_) { }
      speechRecRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.cleanup();
      recorderRef.current = null;
    }
    speechPlayer.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_) { }
    }
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    setIsRecording(false);
    setLiveVolume(0);
  };

  const beginSession = useCallback(async () => {
    setError('');
    try {
      setStatusText('Starting session...');
      speakingQuestionIndexRef.current = null;
      const s = await interviewService.startSession(module.id);
      setSession(s);
      setRunnerState('playing_question');
    } catch (e: any) {
      setError(e.message || 'Failed to start session');
    }
  }, [module.id]);

  const openMicrophone = useCallback(async () => {
    console.log(`[Interview] Opening microphone for Question ${currentQIndex + 1}...`);
    setStatusText('Listening to your answer... (Auto-submits after 3s silence)');
    setIsRecording(true);
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    currentAnswerRef.current = '';
    speechRecTranscriptRef.current = '';
    recordStartTimeRef.current = Date.now();
    isSubmittingAnswerRef.current = false;
    setAvatarState('listening');
    setSilenceCountdown(3);
    setHasSpoken(false);
    hasSpokenRef.current = false;

    // 1. Adaptive Continuous VAD with 3-Second Silence Auto-Detection
    try {
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;

      const started = await recorder.startContinuousVAD(
        {
          onVolumeUpdate: (vol) => {
            // Throttled volume update to avoid re-rendering entire component 60 times a second
            setLiveVolume((prev) => (Math.abs(prev - vol) > 3 ? vol : prev));
          },
          onSpeechStart: () => {
            console.log('[Interview VAD] User speech started!');
            hasSpokenRef.current = true;
            setHasSpoken(true);
            setSilenceCountdown(3);
            setStatusText('Hearing your voice... (Speaking)');
          },
          onSilenceProgress: (remainingSecs) => {
            if (isEditingTextRef.current || isSubmittingAnswerRef.current) return;
            if (!hasSpokenRef.current) return;
            setSilenceCountdown(remainingSecs);
            if (remainingSecs < 3) {
              setStatusText(`Silence detected (${remainingSecs}s)...`);
            } else {
              setStatusText('Hearing your voice... (Speaking)');
            }
          },
          onSpeechEnd: async (audioBlob) => {
            if (isEditingTextRef.current) {
              console.log('[Interview VAD] User is typing/editing manually. Skipping auto-submit.');
              return;
            }
            console.log(`[Interview VAD] >>> 3s SILENCE DETECTED! Auto-submitting answer: ${audioBlob.size} bytes <<<`);
            setStatusText('3s silence detected — auto-submitting answer with Whisper AI...');
            await handleCompleteCurrentAnswer(audioBlob);
          },
        },
        {
          speechThreshold: 20, // matching Talk with AI
          silenceThresholdMs: 3000, // 3.0s silence threshold
          minSpeechDurationMs: 400,
          maxSpeechDurationMs: currentQ?.time_limit_seconds ? currentQ.time_limit_seconds * 1000 : 90000,
          isAiSpeaking: () => speechPlayer.isCurrentlyPlaying(),
        }
      );

      if (started) {
        console.log('[Interview] Continuous VAD active — microphone listening with 3s pause auto-detection.');
      } else {
        console.warn('[Interview] Continuous VAD start returned false.');
        setStatusText('Mic access error — please type your answer below.');
      }
    } catch (err: any) {
      console.warn('[Interview] Failed to start AudioRecorder VAD:', err);
      setStatusText('Microphone unavailable — please type your answer.');
    }

    // 2. Parallel Browser Web Speech API for Real-Time Subtitles & Activity Sync
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';

          rec.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; ++i) {
              fullText += event.results[i][0].transcript;
            }
            const clean = fullText.trim();
            if (clean) {
              hasSpokenRef.current = true;
              setHasSpoken(true);
              setSilenceCountdown(3);
              recorderRef.current?.touchSpeechActivity();
              console.log('[Interview] Live SpeechRecognition:', JSON.stringify(clean));
              speechRecTranscriptRef.current = clean;
              currentAnswerRef.current = clean;
              liveTranscriptRef.current = clean;
              setLiveTranscript(clean);
            }
          };

          rec.onend = () => {
            console.log('[Interview] SpeechRecognition ended.');
            if (speechRecTranscriptRef.current && !currentAnswerRef.current) {
              currentAnswerRef.current = speechRecTranscriptRef.current;
              liveTranscriptRef.current = speechRecTranscriptRef.current;
            }
          };

          rec.onerror = (err: any) => {
            const code = err?.error || '';
            if (code !== 'no-speech' && code !== 'network') {
              console.warn('[Interview] SpeechRecognition error:', code);
            }
          };

          speechRecRef.current = rec;
          rec.start();
          console.log('[Interview] Live SpeechRecognition started.');
        } catch (recErr) {
          console.warn('[Interview] SpeechRecognition start failed:', recErr);
        }
      }
    }
  }, [currentQIndex, currentQ]);

  const closeMicrophone = useCallback(() => {
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    if (speechRecRef.current) {
      const lastKnown = speechRecTranscriptRef.current || liveTranscriptRef.current;
      if (lastKnown && !currentAnswerRef.current) {
        currentAnswerRef.current = lastKnown;
      }
      try { speechRecRef.current.stop(); } catch (_) { }
      speechRecRef.current = null;
    }
    setIsRecording(false);
    setLiveVolume(0);
  }, []);

  const speakQuestion = useCallback(async () => {
    if (!currentQ) return;

    // Prevent re-triggering speech for the same question index
    if (speakingQuestionIndexRef.current === currentQIndex) {
      return;
    }
    speakingQuestionIndexRef.current = currentQIndex;

    console.log(`[Interview] Speaking Question ${currentQIndex + 1}: "${currentQ.question_text.slice(0, 60)}..."`);
    setAvatarState('talking');
    setStatusText(`${currentQ.speaker_name} is asking a question...`);
    currentAnswerRef.current = '';
    speechRecTranscriptRef.current = '';
    liveTranscriptRef.current = '';
    setLiveTranscript('');
    setLastTranscript('');
    setIsEditingText(false);

    // Make sure microphone is fully closed while AI speaks
    closeMicrophone();

    if (questionSafetyTimerRef.current) {
      clearTimeout(questionSafetyTimerRef.current);
      questionSafetyTimerRef.current = null;
    }
    if (postSpeechDelayTimerRef.current) {
      clearTimeout(postSpeechDelayTimerRef.current);
      postSpeechDelayTimerRef.current = null;
    }

    let hasHandledEnd = false;
    const finishQuestionAndListen = () => {
      if (hasHandledEnd) return;
      hasHandledEnd = true;

      if (questionSafetyTimerRef.current) {
        clearTimeout(questionSafetyTimerRef.current);
        questionSafetyTimerRef.current = null;
      }

      console.log(`[Interview] AI completed speaking question ${currentQIndex + 1}. Preparing microphone...`);
      // A small clean pause (350ms) after speech audio concludes ensures:
      // 1. Candidate hears the entire sentence with zero interruption
      // 2. Hardware output speaker buffer flushes so microphone doesn't capture TTS echo
      postSpeechDelayTimerRef.current = setTimeout(() => {
        postSpeechDelayTimerRef.current = null;
        setAvatarState('listening');
        setRunnerState('user_turn');
        openMicrophone();
      }, 350);
    };

    // Calculate generous safety deadline based on word count (minimum 45s, up to 90s)
    const wordCount = (currentQ.question_text || '').trim().split(/\s+/).length;
    const safetyTimeoutMs = Math.max(45000, wordCount * 1200 + 35000);

    // Safety watchdog: only triggers if playback totally stalled or user gesture blocked
    questionSafetyTimerRef.current = setTimeout(() => {
      if (hasHandledEnd) return;

      // If speech is still actively outputting, DO NOT cut it off!
      if (speechPlayer.isCurrentlyPlaying()) {
        console.log('[Interview] Safety timer fired but AI speech is still actively playing — keeping mic closed.');
        // Re-check after 6 seconds
        questionSafetyTimerRef.current = setTimeout(() => {
          if (!hasHandledEnd && !speechPlayer.isCurrentlyPlaying()) {
            console.warn('[Interview] AI speech finished after extended check — opening mic.');
            finishQuestionAndListen();
          }
        }, 6000);
        return;
      }

      console.warn('[Interview] AI speech safety timeout reached without active playback — stopping audio & opening microphone.');
      speechPlayer.stop();
      finishQuestionAndListen();
    }, safetyTimeoutMs);

    try {
      await speechPlayer.play(currentQ.question_text, {
        key: `interview-q-${currentQIndex}`,
        language: 'English',
        langCode: 'en-US',
        onEnd: () => {
          console.log(`[Interview] TTS onEnd fired for Question ${currentQIndex + 1}`);
          finishQuestionAndListen();
        },
        onError: (err) => {
          console.warn('[Interview] Question TTS failed or muted:', err);
          speechPlayer.stop();
          finishQuestionAndListen();
        },
      });
    } catch (e) {
      console.warn('[Interview] Question speech error:', e);
      speechPlayer.stop();
      finishQuestionAndListen();
    }
  }, [currentQ, currentQIndex, openMicrophone, closeMicrophone]);

  useEffect(() => {
    if (runnerState === 'playing_question') {
      speakQuestion();
    }
  }, [runnerState, speakQuestion]);

  const handleInterruptAndAnswer = () => {
    if (questionSafetyTimerRef.current) {
      clearTimeout(questionSafetyTimerRef.current);
      questionSafetyTimerRef.current = null;
    }
    if (postSpeechDelayTimerRef.current) {
      clearTimeout(postSpeechDelayTimerRef.current);
      postSpeechDelayTimerRef.current = null;
    }
    speechPlayer.stop();
    setAvatarState('listening');
    setRunnerState('user_turn');
    openMicrophone();
  };

  const handleSaveAndNext = () => {
    if (isAiSpeaking || runnerState === 'processing_turn') {
      return;
    }
    handleCompleteCurrentAnswer();
  };

  const handleCompleteCurrentAnswer = async (passedBlob?: Blob) => {
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    if (isSubmittingAnswerRef.current) {
      console.log('[Interview] Already submitting current answer, ignoring duplicate call.');
      return;
    }
    isSubmittingAnswerRef.current = true;
    hasSpokenRef.current = false;

    setRunnerState('processing_turn');
    setAvatarState('idle');
    setStatusText('Processing and transcribing your answer...');

    const duration = Math.max(1, (Date.now() - recordStartTimeRef.current) / 1000);

    // 1. Get audio blob either from VAD onSpeechEnd or from manual stopRecording
    let audioBlob: Blob | null = passedBlob || null;
    if (!audioBlob && recorderRef.current) {
      try {
        audioBlob = await recorderRef.current.stopRecording();
        console.log(`[Interview STT] Manual submit clicked. Captured Blob: ${audioBlob?.size ?? 0} bytes`);
      } catch (recErr) {
        console.warn('[Interview] Error stopping AudioRecorder on manual submit:', recErr);
      }
    }

    if (recorderRef.current) {
      recorderRef.current.cleanup();
      recorderRef.current = null;
    }

    closeMicrophone();

    const manualOrLiveText = (
      currentAnswerRef.current ||
      speechRecTranscriptRef.current ||
      liveTranscriptRef.current
    ).trim();

    let finalTranscript = manualOrLiveText;

    // 2. Transcribe via Whisper STT if audio was captured
    if (audioBlob && audioBlob.size > 200) {
      setStatusText('Transcribing your answer with  AI...');
      const whisperText = await callWhisperSTT(audioBlob);
      if (whisperText) {
        finalTranscript = whisperText;
        console.log('[Interview STT] >>> Using Whisper AI result: <<<', JSON.stringify(finalTranscript));
      } else {
        console.log('[Interview STT] Whisper returned empty, using browser transcript:', JSON.stringify(finalTranscript));
      }
    } else {
      console.log('[Interview STT] No audio blob available, using browser transcript:', JSON.stringify(finalTranscript));
    }

    if (!finalTranscript) {
      finalTranscript = '(No spoken response detected)';
      console.warn('[Interview STT] All transcript sources were empty.');
    }

    console.log(`[Interview] >>> FINAL SAVED ANSWER FOR QUESTION ${currentQIndex + 1}: <<<`, JSON.stringify(finalTranscript));
    setLastTranscript(finalTranscript);
    currentAnswerRef.current = finalTranscript;
    recordAnswer(finalTranscript, duration);
    isSubmittingAnswerRef.current = false;
  };

  const recordAnswer = useCallback(
    (transcript: string, duration: number, skipped = false) => {
      if (!currentQ) return;

      const answer: SessionAnswer = {
        question_id: currentQ.id,
        answer_text: transcript,
        audio_duration_s: duration,
        was_skipped: skipped,
      };

      console.log(`[Interview] Recording answer for Q${currentQIndex + 1}:`, JSON.stringify(transcript));

      const existingIdx = answersRef.current.findIndex((a) => a.question_id === currentQ.id);
      if (existingIdx >= 0) {
        answersRef.current[existingIdx] = answer;
      } else {
        answersRef.current.push(answer);
      }
      const nextAnswers = [...answersRef.current];
      setAnswers(nextAnswers);
      console.log(`[Interview] Total answers collected so far: ${nextAnswers.length}/${questions.length}`);

      const nextIndex = currentQIndex + 1;
      speechPlayer.stop();

      if (nextIndex >= questions.length) {
        cleanupAllAudio();
        setAvatarState('idle');
        setRunnerState('wrap_up');
        handleWrapUpWithAnswers(nextAnswers);
      } else {
        speakingQuestionIndexRef.current = null;
        setCurrentQIndex(nextIndex);
        setAvatarState('idle');
        setRunnerState('playing_question');
      }
    },
    [currentQ, currentQIndex, questions.length]
  );

  const handleSkip = () => {
    cleanupAllAudio();
    console.log(`[Interview] Skipped Question ${currentQIndex + 1}`);
    recordAnswer('(Skipped)', 0, true);
  };

  const handleWrapUpWithAnswers = async (currentAnswers: SessionAnswer[]) => {
    if (!session) return;
    cleanupAllAudio();

    console.log(`[Interview] Submitting all ${currentAnswers.length} answers to backend...`);
    setRunnerState('generating_report');
    setStatusText('Evaluating your answers and generating coaching report...');

    try {
      await interviewService.submitAnswers(session.id, currentAnswers);
      await interviewService.updateSession(session.id, 'completed');
      setStatusText('Finalizing evaluation report & CEFR scoring...');
      const report = await interviewService.fetchReport(session.id);
      setRunnerState('done');
      onComplete(report);
    } catch (e: any) {
      console.error('[Interview] Wrap-up error:', e);
      setError(e.message || 'Failed to generate report');
      try {
        const report = await interviewService.fetchReport(session.id);
        onComplete(report);
      } catch (_) {
        setError('Report could not be loaded. Please check your reports tab.');
      }
    }
  };

  const handleExit = (generateReport: boolean = true) => {
    cleanupAllAudio();
    const effectiveAnswers = [...answersRef.current];
    if (
      currentQ &&
      currentAnswerRef.current &&
      !effectiveAnswers.some((a) => a.question_id === currentQ.id)
    ) {
      effectiveAnswers.push({
        question_id: currentQ.id,
        answer_text: currentAnswerRef.current,
        audio_duration_s: Math.max(1, (Date.now() - recordStartTimeRef.current) / 1000),
        was_skipped: false,
      });
    }
    if (generateReport && session && effectiveAnswers.length > 0) {
      handleWrapUpWithAnswers(effectiveAnswers);
    } else {
      onExit();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#07091a] flex flex-col selection:bg-indigo-500/30">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10 shrink-0 bg-slate-950/60 backdrop-blur-md">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-bold truncate">{module.title}</p>
          {runnerState !== 'intro' && runnerState !== 'generating_report' && runnerState !== 'done' && (
            <p className="text-xs text-indigo-400 font-semibold mt-0.5">
              Question {currentQIndex + 1} of {questions.length}
            </p>
          )}
        </div>

        <div className="flex-1 mx-4 sm:mx-8 max-w-md hidden sm:block">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {session && runnerState !== 'intro' && runnerState !== 'generating_report' && runnerState !== 'done' && (
            <button
              onClick={() => handleExit(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/30 hover:border-red-500/50 text-xs font-normal transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              title="End interview now and see your performance report"
            >
              <PhoneOff size={13} />
              <span>End &amp; View Report</span>
            </button>
          )}
          {/* <button
            onClick={() => handleExit(answersRef.current.length > 0)}
            className="p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Leave Session"
          >
            <X size={18} />
          </button> */}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 sm:px-6 overflow-y-auto custom-scrollbar py-6">
        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {runnerState === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="text-center max-w-lg w-full"
            >
              <AnimatedInterviewer state="idle" speakerName={module.interviewer_name} size={160} />
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-6 mb-2 tracking-tight">
                {module.title}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-2">{module.description}</p>
              <p className="text-indigo-400 text-xs font-semibold mb-6">
                {questions.length} questions &middot; {module.target_role || module.field}
              </p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left mb-6 text-xs sm:text-sm text-slate-300 space-y-2">
                <p className="flex items-center gap-2"><span>🎙️</span><span>Speak clearly into your microphone after each question.</span></p>
                <p className="flex items-center gap-2"><span>⚡</span><span>Advanced AI transcribes and processes your responses in real time.</span></p>
                <p className="flex items-center gap-2"><span>📊</span><span>In-Depth Evaluation - Detailed report, grammar, and tips.</span></p>
              </div>
              <button
                onClick={beginSession}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/30 text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <span>Start Practice Interview</span>
                <ChevronRight size={18} />
              </button>
              {error && <p className="text-red-400 text-xs mt-4">{error}</p>}
            </motion.div>
          )}

          {/* Question / User Turn Screen */}
          {(runnerState === 'playing_question' || runnerState === 'user_turn' || runnerState === 'processing_turn') && (
            <motion.div
              key={`q-${currentQIndex}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center gap-5 w-full max-w-xl"
            >
              <AnimatedInterviewer
                state={avatarState}
                speakerName={currentQ?.speaker_name || module.interviewer_name}
                size={165}
              />

              {/* Question Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-indigo-400 font-extrabold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span>{currentQ?.speaker_name || 'Interviewer'}</span>
                  </p>
                  {runnerState === 'playing_question' && (
                    <button
                      onClick={handleInterruptAndAnswer}
                      className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Skip question audio and start speaking immediately"
                    >
                      <Mic size={12} />
                      <span>Answer Now</span>
                    </button>
                  )}
                </div>
                <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
                  {currentQ?.question_text}
                </p>
              </div>

              {/* User Turn Section */}
              {(runnerState === 'user_turn' || runnerState === 'processing_turn') && (
                <div className="flex flex-col items-center gap-4 w-full">
                  {/* 3-Second Silence Warning Toast (matching Talk with AI style) */}
                  <AnimatePresence>
                    {runnerState === 'user_turn' && hasSpoken && silenceCountdown < 3 && silenceCountdown > 0 && !isEditingText && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="bg-amber-500/25 border border-amber-500/60 text-amber-200 px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md shadow-xl ring-2 ring-amber-500/30 w-full animate-bounce"
                      >
                        <AlertCircle size={15} className="text-amber-400 shrink-0" />
                        <span>Silence detected. Auto-submitting in {silenceCountdown}s... (keep speaking to continue)</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Status & Real-Time Audio Level Indicator */}
                  <div
                    className={`flex items-center justify-between w-full px-5 py-3 rounded-2xl border transition-all ${runnerState === 'processing_turn'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : isRecording
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                      {runnerState === 'processing_turn' ? (
                        <Loader2 size={16} className="animate-spin text-amber-400 shrink-0" />
                      ) : isRecording ? (
                        <Mic size={16} className="animate-pulse text-emerald-400 shrink-0" />
                      ) : (
                        <MicOff size={16} className="shrink-0" />
                      )}
                      <span>{statusText}</span>
                    </div>

                    {/* Dynamic Sound Wave Bars */}
                    {isRecording && (
                      <div className="flex items-center gap-1 shrink-0 h-4">
                        {[0.6, 1.2, 0.8, 1.4, 0.9].map((multiplier, i) => {
                          const heightPct = Math.min(100, Math.max(20, liveVolume * multiplier * 2));
                          return (
                            <span
                              key={i}
                              className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                              style={{ height: `${heightPct}%` }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Transcript Display Box */}
                  <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-4 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-indigo-400" />
                        <span>Your Answer (Live Transcript):</span>
                      </span>
                      <button
                        onClick={() => setIsEditingText(!isEditingText)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={11} />
                        <span>{isEditingText ? 'Done Editing' : 'Type / Edit'}</span>
                      </button>
                    </div>

                    {isEditingText ? (
                      <textarea
                        value={liveTranscript}
                        onChange={(e) => {
                          setLiveTranscript(e.target.value);
                          liveTranscriptRef.current = e.target.value;
                          currentAnswerRef.current = e.target.value;
                        }}
                        placeholder="Type or edit your response here..."
                        className="w-full h-24 bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    ) : (
                      <p className="text-sm text-slate-200 leading-relaxed min-h-[44px]">
                        {liveTranscript ? (
                          <span className="text-emerald-300 font-medium">"{liveTranscript}"</span>
                        ) : (
                          <span className="text-slate-500 italic">
                            Listening for your voice... Speak into your mic or click Type / Edit.
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Card Action Hint and Quick Trigger */}
                  <div className="flex items-center justify-between gap-3 w-full pt-1">
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Auto-submits after 3s silence, or use <strong>Save and Next</strong> below.</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCompleteCurrentAnswer()}
                      disabled={isAiSpeaking || runnerState === 'processing_turn'}
                      className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check size={14} />
                      <span>Save and Next</span>
                    </button>
                  </div>
                </div>
              )}

              {runnerState === 'playing_question' && (
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Volume2 size={14} className="text-indigo-400 animate-pulse" />
                  <span>{statusText}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Wrap up / Report Generation */}
          {(runnerState === 'wrap_up' || runnerState === 'generating_report') && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-md"
            >
              <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl">
                <Loader2 size={36} className="animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-extrabold text-xl">Generating Instant Evaluation...</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{statusText}</p>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Action Bar */}
      {(runnerState === 'playing_question' || runnerState === 'user_turn' || runnerState === 'processing_turn') && (
        <div className="shrink-0 px-4 sm:px-8 py-3.5 border-t border-white/10 flex items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-xl z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
          <button
            onClick={handleSkip}
            disabled={runnerState === 'processing_turn'}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-slate-700/70 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 hover:border-slate-600"
            title="Skip this question and move to next"
          >
            <SkipForward size={16} className="text-slate-400" />
            <span>Skip Question</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="font-mono">Question {currentQIndex + 1} of {questions.length}</span>
          </div>

          <button
            onClick={handleSaveAndNext}
            disabled={isAiSpeaking || runnerState === 'processing_turn'}
            className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all ${isAiSpeaking || runnerState === 'processing_turn'
              ? 'bg-slate-800/80 text-slate-400 border border-slate-700/50 opacity-50 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
              }`}
            title={
              isAiSpeaking
                ? 'Interviewer is speaking. Please listen before saving...'
                : runnerState === 'processing_turn'
                  ? 'Saving answer...'
                  : currentQIndex === questions.length - 1
                    ? 'Save answer and view report'
                    : 'Save answer and go to next question'
            }
          >
            {runnerState === 'processing_turn' ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Saving Answer...</span>
              </>
            ) : isAiSpeaking ? (
              <>
                <Volume2 size={16} className="animate-pulse text-indigo-400" />
                <span>Save and Next</span>
              </>
            ) : (
              <>
                <Check size={17} className="stroke-[2.5]" />
                <span>Save and Next</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
