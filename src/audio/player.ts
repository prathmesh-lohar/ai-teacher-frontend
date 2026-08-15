/**
 * Client-Side Audio Queue & Interruption Player
 * Plays streamed server audio chunks (WAV/MP3) with seamless Web Speech fallback.
 */
export class AudioQueuePlayer {
  private queue: Array<{ type: 'audio' | 'speech'; src?: string; text?: string }> = [];
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private onStateChange?: (playing: boolean) => void;
  private onPlaybackFinished?: () => void;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isAudioUnlocked: boolean = false;

  constructor(
    onStateChange?: (playing: boolean) => void,
    onPlaybackFinished?: () => void
  ) {
    this.onStateChange = onStateChange;
    this.onPlaybackFinished = onPlaybackFinished;
  }

  public setOnPlaybackFinished(callback: () => void) {
    this.onPlaybackFinished = callback;
  }

  /**
   * Warm up browser audio playback permissions to avoid autoplay blocking
   */
  public unlockAudio() {
    if (this.isAudioUnlocked) return;
    this.isAudioUnlocked = true;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }
    } catch (e) {
      console.warn('AudioContext warmup warning:', e);
    }
  }

  /**
   * Enqueue a base64 or blob audio chunk from server
   */
  public enqueue(audioSource: string | Blob, mimeType: string = 'audio/mpeg') {
    this.unlockAudio();
    let src: string;
    if (audioSource instanceof Blob) {
      src = URL.createObjectURL(audioSource);
    } else if (
      audioSource.startsWith('data:audio') ||
      audioSource.startsWith('http') ||
      audioSource.startsWith('blob:')
    ) {
      src = audioSource;
    } else {
      src = `data:${mimeType};base64,${audioSource}`;
    }

    this.queue.push({ type: 'audio', src });
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  /**
   * Enqueue spoken text using browser Web Speech synthesis if backend audio chunk is absent
   */
  public enqueueSpeech(text: string) {
    if (!text || !text.trim()) return;
    this.unlockAudio();
    this.queue.push({ type: 'speech', text: text.trim() });
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      const wasPlaying = this.isPlaying;
      this.isPlaying = false;
      this.currentAudio = null;
      this.currentUtterance = null;
      this.onStateChange?.(false);
      if (wasPlaying) {
        // Teacher finished speaking all queued audio -> notify to auto-listen for student
        this.onPlaybackFinished?.();
      }
      return;
    }

    this.isPlaying = true;
    this.onStateChange?.(true);

    const item = this.queue.shift()!;

    if (item.type === 'audio' && item.src) {
      const src = item.src;
      const audio = new Audio(src);
      this.currentAudio = audio;

      audio.onended = () => {
        if (src.startsWith('blob:')) {
          URL.revokeObjectURL(src);
        }
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        this.playNext();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error chunk skipped:', e);
        if (src.startsWith('blob:')) {
          URL.revokeObjectURL(src);
        }
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        this.playNext();
      };

      try {
        await audio.play();
      } catch (err) {
        console.warn('Playback blocked by browser policy or interrupted:', err);
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        this.playNext();
      }
    } else if (item.type === 'speech' && item.text && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) => (v.lang.startsWith('en') && v.name.includes('Natural')) || (v.lang.startsWith('en') && v.name.includes('Google')) || v.lang === 'en-US'
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        this.playNext();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        this.playNext();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      this.playNext();
    }
  }

  /**
   * Immediately aborts any playing audio or speech synthesis and flushes the queue
   */
  public interrupt() {
    this.queue = [];
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        console.warn('Error pausing current audio:', e);
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
    this.onStateChange?.(false);
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public hasQueuedItems(): boolean {
    return this.queue.length > 0;
  }
}
