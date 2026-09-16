import { API_BASE_URL } from '@/config/env';

/**
 * Multilingual Speech Synthesis Player
 * Supports native language audio playback (Marathi, Hindi, etc.) and English corrections
 * using Backend Neural Edge/gTTS API with fallback to Browser Web Speech API.
 */

class MultilingualSpeechPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  private activeKey: string | null = null;
  private onEndCallbacks: Set<() => void> = new Set();
  private activePlaybackId: number = 0;

  private getBackendBaseUrl(): string {
    return API_BASE_URL;
  }

  /**
   * Stop any currently playing audio or speech synthesis immediately
   */
  public stop() {
    this.activePlaybackId++;
    this.isPlaying = false;
    this.activeKey = null;

    if (this.currentAudio) {
      try {
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch (e) {
        console.warn('Error pausing audio:', e);
      }
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Error cancelling speech synthesis:', e);
      }
      if (this.currentUtterance) {
        this.currentUtterance.onend = null;
        this.currentUtterance.onerror = null;
        this.currentUtterance = null;
      }
    }

    // Clear callbacks without invoking them on manual cancellation/stop
    this.onEndCallbacks.clear();
  }

  public getActiveKey(): string | null {
    return this.isPlaying ? this.activeKey : null;
  }

  public isCurrentlyPlaying(key?: string): boolean {
    if (!this.isPlaying) return false;
    return key ? this.activeKey === key : true;
  }

  /**
   * Play speech for a given text in native language (e.g. Marathi) or English
   */
  public async play(
    text: string,
    options: {
      key?: string;
      language?: string;
      langCode?: string;
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): Promise<void> {
    const cleanText = (text || '').trim();
    if (!cleanText) return;

    // If already playing this exact key, stop it (toggle behavior)
    if (options.key && this.activeKey === options.key && this.isPlaying) {
      this.stop();
      return;
    }

    // Stop previous playback
    this.stop();

    const currentId = this.activePlaybackId;
    const key = options.key || 'speech';
    this.activeKey = key;
    this.isPlaying = true;

    if (options.onEnd) {
      this.onEndCallbacks.add(options.onEnd);
    }

    options.onStart?.();

    const language = options.language || 'English';
    const langCode = options.langCode || 'en-US';

    // Step 1: Try High-Quality Backend Neural TTS API (supports Marathi, Hindi, etc.)
    try {
      const backendUrl = this.getBackendBaseUrl();
      const params = new URLSearchParams({
        text: cleanText,
        language: language,
        provider: 'edge',
      });

      const audioUrl = `${backendUrl}/api/ai/tts/synthesize/?${params.toString()}`;
      
      const audio = new Audio();
      this.currentAudio = audio;

      const playPromise = new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          if (this.activePlaybackId === currentId) {
            const callbacks = Array.from(this.onEndCallbacks);
            this.stop();
            callbacks.forEach((cb) => cb());
            resolve();
          } else {
            resolve();
          }
        };

        audio.onerror = (e) => {
          if (this.activePlaybackId === currentId) {
            reject(e);
          } else {
            resolve();
          }
        };

        audio.src = audioUrl;
        audio.play().catch((err) => {
          if (this.activePlaybackId === currentId) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      await playPromise;
      return;
    } catch (apiError) {
      // If playback was cancelled or stopped during the fetch/play, DO NOT FALLBACK!
      if (this.activePlaybackId !== currentId || !this.isPlaying) {
        return;
      }
      console.warn('[SpeechPlayer] Backend TTS failed or offline, falling back to Web Speech API:', apiError);
    }

    // Step 2: Browser Web Speech API Fallback
    if (this.activePlaybackId !== currentId || !this.isPlaying) {
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = options.rate || 0.95;
        utterance.pitch = 1.0;
        utterance.lang = langCode;

        // Try to match best voice
        const voices = window.speechSynthesis.getVoices();
        const lowerLang = language.toLowerCase();
        const lowerCode = langCode.toLowerCase().replace('_', '-');

        const matchedVoice = voices.find((v) => {
          const vLang = v.lang.toLowerCase().replace('_', '-');
          const vName = v.name.toLowerCase();
          return (
            vLang === lowerCode ||
            vLang.startsWith(lowerCode.slice(0, 2)) ||
            vName.includes(lowerLang)
          );
        });

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onend = () => {
          if (this.activePlaybackId === currentId) {
            const callbacks = Array.from(this.onEndCallbacks);
            this.stop();
            callbacks.forEach((cb) => cb());
          }
        };

        utterance.onerror = (e) => {
          if (this.activePlaybackId === currentId) {
            console.warn('[SpeechPlayer] Web Speech API playback error:', e);
            this.stop();
            options.onError?.(e);
          }
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        if (this.activePlaybackId === currentId) {
          console.error('[SpeechPlayer] Synthesis error:', err);
          this.stop();
          options.onError?.(err);
        }
      }
    } else {
      this.stop();
    }
  }
}

export const speechPlayer = new MultilingualSpeechPlayer();
