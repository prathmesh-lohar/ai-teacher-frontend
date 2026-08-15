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

  private getBackendBaseUrl(): string {
    return API_BASE_URL;
  }

  /**
   * Stop any currently playing audio or speech synthesis
   */
  public stop() {
    if (this.currentAudio) {
      try {
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
      this.currentUtterance = null;
    }

    this.isPlaying = false;
    this.activeKey = null;

    // Trigger end callbacks
    this.onEndCallbacks.forEach((cb) => cb());
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
          this.stop();
          resolve();
        };

        audio.onerror = (e) => {
          reject(e);
        };

        audio.src = audioUrl;
        audio.play().catch((err) => {
          reject(err);
        });
      });

      await playPromise;
      return;
    } catch (apiError) {
      console.warn('[SpeechPlayer] Backend TTS failed or offline, falling back to Web Speech API:', apiError);
    }

    // Step 2: Browser Web Speech API Fallback
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
          this.stop();
        };

        utterance.onerror = (e) => {
          console.warn('[SpeechPlayer] Web Speech API playback error:', e);
          this.stop();
          options.onError?.(e);
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('[SpeechPlayer] Synthesis error:', err);
        this.stop();
        options.onError?.(err);
      }
    } else {
      this.stop();
    }
  }
}

export const speechPlayer = new MultilingualSpeechPlayer();
