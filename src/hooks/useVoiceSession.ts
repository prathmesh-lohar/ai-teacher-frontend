'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ConversationState,
  CorrectionMode,
  ConversationTurn,
  LanguageMistake,
  SessionReportData,
  TTSProviderId,
} from '@/types/voice';
import { VoiceWebSocketService } from '@/services/websocket/voiceSocket';
import { AudioQueuePlayer } from '@/audio/player';
import { AudioRecorder } from '@/audio/recorder';

export interface UserSessionContext {
  name?: string;
  english_level?: string;
  native_language?: string;
  occupation?: string;
  interests?: string[];
  goals?: string[];
}

interface UseVoiceSessionProps {
  topic?: string;
  correctionMode?: CorrectionMode;
  autoStart?: boolean;
  autoTurnEnabled?: boolean;
  initialTtsProvider?: TTSProviderId;
  initialTtsVoice?: string;
  initialNativeLanguage?: string;
  userContext?: UserSessionContext;
}

export function useVoiceSession({
  topic = 'Daily Casual Talk',
  correctionMode = 'realtime',
  autoStart = true,
  autoTurnEnabled = true,
  initialTtsProvider = 'edge',
  initialTtsVoice = 'en-IN-NeerjaNeural',
  initialNativeLanguage = 'Hindi',
  userContext,
}: UseVoiceSessionProps = {}) {
  const [state, setState] = useState<ConversationState>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [latestMistakes, setLatestMistakes] = useState<LanguageMistake[]>([]);
  const [report, setReport] = useState<SessionReportData | null>(null);
  const [isHandsFree, setIsHandsFree] = useState(autoTurnEnabled);
  const [isPaused, setIsPaused] = useState(false);
  const [maxDurationSeconds, setMaxDurationSeconds] = useState<number>(300);
  const [inactivityTimeoutSeconds, setInactivityTimeoutSeconds] = useState<number>(30);

  // Active TTS provider and voice
  const [ttsProvider, setTtsProvider] = useState<TTSProviderId>(initialTtsProvider);
  const [ttsVoice, setTtsVoice] = useState<string>(initialTtsVoice);

  // Active Native Language for corrections
  const [nativeLanguage, setNativeLanguage] = useState<string>(initialNativeLanguage);

  const socketServiceRef = useRef<VoiceWebSocketService | null>(null);
  const playerRef = useRef<AudioQueuePlayer | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const activeAiTurnTextRef = useRef<string>('');
  const hasReceivedAudioChunksRef = useRef<boolean>(false);
  const isAiSpeakingRef = useRef<boolean>(false);
  const isHandsFreeRef = useRef<boolean>(autoTurnEnabled);
  const isPausedRef = useRef<boolean>(false);
  const ttsConfigRef = useRef<{ provider: TTSProviderId; voice: string }>({
    provider: initialTtsProvider,
    voice: initialTtsVoice,
  });
  const nativeLangRef = useRef<string>(initialNativeLanguage);
  const userContextRef = useRef<UserSessionContext | undefined>(userContext);

  // Keep refs updated
  useEffect(() => {
    userContextRef.current = userContext;
  }, [userContext]);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    ttsConfigRef.current = { provider: ttsProvider, voice: ttsVoice };
  }, [ttsProvider, ttsVoice]);

  useEffect(() => {
    nativeLangRef.current = nativeLanguage;
  }, [nativeLanguage]);

  // Handle explicit speech interruption (Barge-In)
  const handleBargeIn = useCallback(() => {
    if (isPausedRef.current) return;
    console.log('[useVoiceSession] User barge-in detected');
    playerRef.current?.interrupt();
    isAiSpeakingRef.current = false;
    socketServiceRef.current?.send({ type: 'user.start' });
    setState('user_speaking');
    setIsRecording(true);
  }, []);

  // Initialize Player, Recorder, VAD and Socket
  useEffect(() => {
    const player = new AudioQueuePlayer(
      (playing) => {
        isAiSpeakingRef.current = playing;
        if (playing) {
          setState('ai_speaking');
        } else {
          setState((prev) => (prev === 'ai_speaking' ? 'idle' : prev));
        }
      },
      () => {
        // Teacher finished speaking entire turn -> Auto listen for student response
        console.log('[useVoiceSession] Teacher finished speaking -> Auto-listening for student response');
        isAiSpeakingRef.current = false;
        setState('idle');
        recorderRef.current?.resetSpeakingState();
      }
    );
    playerRef.current = player;

    const recorder = new AudioRecorder();
    recorderRef.current = recorder;

    const socket = new VoiceWebSocketService();
    socketServiceRef.current = socket;

    const unsubscribe = socket.subscribe((event) => {
      switch (event.type) {
        case 'session.started':
          setIsConnected(true);
          setState(event.state || 'idle');
          if (event.tts_provider) setTtsProvider(event.tts_provider);
          if (event.tts_voice) setTtsVoice(event.tts_voice);
          if (event.native_language) setNativeLanguage(event.native_language);
          if (event.max_duration_seconds) setMaxDurationSeconds(Number(event.max_duration_seconds));
          if (event.inactivity_timeout_seconds) setInactivityTimeoutSeconds(Number(event.inactivity_timeout_seconds));

          // Start continuous VAD listening for automatic hands-free turn taking
          if (isHandsFreeRef.current && !isPausedRef.current) {
            recorder.startContinuousVAD(
              {
                onVolumeUpdate: (vol) => {
                  if (!isPausedRef.current) {
                    setVolumeLevel((prev) => (Math.abs(prev - vol) > 4 ? vol : prev));
                  }
                },
                onBargeIn: () => {
                  if (!isPausedRef.current) handleBargeIn();
                },
                onSpeechStart: () => {
                  if (isHandsFreeRef.current && !isPausedRef.current) {
                    player.interrupt();
                    isAiSpeakingRef.current = false;
                    socket.send({ type: 'user.start' });
                    setState('user_speaking');
                    setIsRecording(true);
                  }
                },
                onSpeechEnd: (audioBlob) => {
                  if (isHandsFreeRef.current && !isPausedRef.current) {
                    setIsRecording(false);
                    setVolumeLevel(0);
                    setState('user_processing');
                    if (audioBlob && audioBlob.size > 0) {
                      socket.sendAudioBlob(audioBlob);
                    }
                  }
                },
              },
              {
                speechThreshold: 18,
                silenceThresholdMs: 1200,
                maxSpeechDurationMs: 15000,
                isAiSpeaking: () => isAiSpeakingRef.current,
              }
            );
          }
          break;

        case 'tts.updated':
          if (event.provider) setTtsProvider(event.provider);
          if (event.voice) setTtsVoice(event.voice);
          break;

        case 'native_language.updated':
          if (event.native_language) setNativeLanguage(event.native_language);
          break;

        case 'ai.thinking':
          setState('ai_thinking');
          break;

        case 'ai.start':
          setState('ai_speaking');
          isAiSpeakingRef.current = true;
          activeAiTurnTextRef.current = '';
          hasReceivedAudioChunksRef.current = false;
          break;

        case 'ai.token':
          activeAiTurnTextRef.current += event.token;
          setCurrentCaption(activeAiTurnTextRef.current);
          break;

        case 'ai.audio':
          if (event.audio) {
            hasReceivedAudioChunksRef.current = true;
            isAiSpeakingRef.current = true;
            setState('ai_speaking');
            player.enqueue(event.audio, event.mime_type || 'audio/mpeg');
          }
          break;

        case 'ai.end':
          if (event.full_text) {
            setCurrentCaption(event.full_text);
            // If backend didn't send audio chunks, fallback to Web Speech
            if (!hasReceivedAudioChunksRef.current) {
              isAiSpeakingRef.current = true;
              setState('ai_speaking');
              player.enqueueSpeech(event.full_text);
            }
            setTurns((prev) => [
              ...prev,
              {
                turn_index: prev.length,
                speaker: 'assistant',
                transcript: event.full_text,
              },
            ]);
          }
          break;

        case 'user.transcript':
          if (event.text) {
            setCurrentCaption(event.text);
            setTurns((prev) => [
              ...prev,
              {
                turn_index: prev.length,
                speaker: 'user',
                transcript: event.text,
              },
            ]);
          }
          break;

        case 'correction.detected':
          if (event.mistakes && event.mistakes.length > 0) {
            setLatestMistakes(event.mistakes);
            setTurns((prev) => {
              const updated = [...prev];
              for (let i = updated.length - 1; i >= 0; i--) {
                if (updated[i].speaker === 'user') {
                  updated[i] = {
                    ...updated[i],
                    mistakes: event.mistakes,
                  };
                  break;
                }
              }
              return updated;
            });
          }
          break;

        case 'state.changed':
          if (event.state) {
            setState(event.state);
          }
          break;

        case 'ai.interrupted':
          player.interrupt();
          isAiSpeakingRef.current = false;
          setState('interrupted');
          break;

        case 'session.report':
          if (event.report) {
            setReport(event.report);
            setState('ended');
          }
          break;

        case 'error':
          console.warn('[useVoiceSession Error]', event.message);
          break;
      }
    });

    // Generate session ID and connect
    const generateUUID = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const initSession = async () => {
      const sessionId = generateUUID();
      const connected = await socket.connect(sessionId);
      if (connected) {
        setIsConnected(true);
        socket.send({
          type: 'session.start',
          topic,
          correction_mode: correctionMode,
          native_language: nativeLangRef.current,
          tts_provider: ttsConfigRef.current.provider,
          tts_voice: ttsConfigRef.current.voice,
          user_context: userContextRef.current,
        });
      }
    };

    if (autoStart) {
      initSession();
    }

    return () => {
      unsubscribe();
      player.interrupt();
      recorder.cleanup();
      socket.disconnect();
    };
  }, [topic, correctionMode, autoStart, handleBargeIn]);

  // Real-time switch TTS provider / voice
  const updateTtsConfig = useCallback((newProvider: TTSProviderId, newVoice: string) => {
    setTtsProvider(newProvider);
    setTtsVoice(newVoice);
    ttsConfigRef.current = { provider: newProvider, voice: newVoice };

    if (socketServiceRef.current) {
      socketServiceRef.current.send({
        type: 'tts.config',
        provider: newProvider,
        voice: newVoice,
      });
    }
  }, []);

  // Real-time switch native language for corrections
  const updateNativeLanguage = useCallback((newLanguage: string) => {
    setNativeLanguage(newLanguage);
    nativeLangRef.current = newLanguage;

    if (socketServiceRef.current) {
      socketServiceRef.current.send({
        type: 'native_language.config',
        native_language: newLanguage,
      });
    }
  }, []);

  // Toggle Hands-Free Auto Mode vs Manual Push-to-Talk
  const toggleHandsFree = useCallback((enabled?: boolean) => {
    setIsHandsFree((prev) => {
      const next = enabled !== undefined ? enabled : !prev;
      isHandsFreeRef.current = next;
      if (!next && recorderRef.current) {
        recorderRef.current.pauseVAD();
      } else if (next && recorderRef.current) {
        recorderRef.current.resumeVAD();
      }
      return next;
    });
  }, []);

  // Start speaking / recording manually if needed
  const startSpeaking = useCallback(async () => {
    playerRef.current?.interrupt();
    isAiSpeakingRef.current = false;
    socketServiceRef.current?.send({ type: 'user.start' });
    setState('user_speaking');

    if (recorderRef.current) {
      const ok = await recorderRef.current.startRecording((vol) => {
        setVolumeLevel(vol);
      });
      if (ok) {
        setIsRecording(true);
      }
    }
  }, []);

  // Finish speaking manually and transmit audio blob
  const stopSpeaking = useCallback(async () => {
    if (!isRecording || !recorderRef.current) return;
    setIsRecording(false);
    setVolumeLevel(0);
    setState('user_processing');

    const blob = await recorderRef.current.stopRecording();
    if (blob && blob.size > 0 && socketServiceRef.current) {
      socketServiceRef.current.sendAudioBlob(blob);
    }
  }, [isRecording]);

  // Explicit interruption button
  const interruptAi = useCallback(() => {
    playerRef.current?.interrupt();
    isAiSpeakingRef.current = false;
    socketServiceRef.current?.send({ type: 'user.interrupt' });
    setState('idle');
  }, []);

  // Pause / Resume Session
  const togglePause = useCallback((paused?: boolean) => {
    setIsPaused((prev) => {
      const next = paused !== undefined ? paused : !prev;
      isPausedRef.current = next;
      if (next) {
        // Pausing: stop current audio output, pause VAD input, cancel active user recording
        playerRef.current?.interrupt();
        isAiSpeakingRef.current = false;
        recorderRef.current?.pauseVAD();
        recorderRef.current?.resetSpeakingState();
        socketServiceRef.current?.send({ type: 'user.interrupt' });
        setState('idle');
        setIsRecording(false);
        setVolumeLevel(0);
      } else {
        // Resuming: reset speaking state and resume continuous VAD if hands-free
        recorderRef.current?.resetSpeakingState();
        if (isHandsFreeRef.current) {
          recorderRef.current?.resumeVAD();
        }
        setState('idle');
      }
      return next;
    });
  }, []);

  // End session and request report
  const endSession = useCallback((endReason: string = 'completed') => {
    playerRef.current?.interrupt();
    recorderRef.current?.cleanup();
    socketServiceRef.current?.send({ 
      type: 'session.end',
      end_reason: endReason
    });
  }, []);

  return {
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
    maxDurationSeconds,
    inactivityTimeoutSeconds,
    togglePause,
    toggleHandsFree,
    updateTtsConfig,
    updateNativeLanguage,
    startSpeaking,
    stopSpeaking,
    interruptAi,
    endSession,
  };
}
