/**
 * Adaptive Microphone Capture & Voice Activity Detection (VAD) Engine
 * Features:
 * - Dynamic background noise floor estimation & adaptive thresholding
 * - Dual-threshold hysteresis (higher start threshold, lower silence threshold)
 * - Energy delta tracking to distinguish human voice peaks from steady ambient noise (fan, AC, traffic)
 * - Max utterance safety dispatch to prevent hanging
 * - Device speaker echo isolation during AI speech
 */

export interface VADCallbacks {
  onVolumeUpdate?: (volume: number) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: (audioBlob: Blob) => void;
  onBargeIn?: () => void;
  /** Called each frame during post-speech silence with remaining seconds before auto-submit */
  onSilenceProgress?: (remainingSeconds: number) => void;
}

export interface VADOptions {
  speechThreshold?: number; // Base start threshold (default: 20)
  silenceThresholdMs?: number; // Milliseconds of silence to consider speech finished (default: 1200ms)
  minSpeechDurationMs?: number; // Minimum speech duration to trigger send (default: 400ms)
  maxSpeechDurationMs?: number; // Max speech duration before auto-dispatching (default: 15000ms)
  isAiSpeaking?: () => boolean; // Check if AI is outputting audio
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;

  // Adaptive VAD State
  private isMonitoring: boolean = false;
  private isUserSpeaking: boolean = false;
  private speechStartTime: number = 0;
  private lastAudibleTime: number = 0;
  private peakSpeechVolume: number = 0;

  // Dynamic Background Noise Floor (moving baseline)
  private noiseFloor: number = 10;
  private noiseSamples: number[] = [];
  private consecutiveSpeechFrames: number = 0;
  private consecutiveAudibleFrames: number = 0;

  private callbacks: VADCallbacks = {};
  private options: VADOptions = {
    speechThreshold: 18,
    silenceThresholdMs: 1200,
    minSpeechDurationMs: 400,
    maxSpeechDurationMs: 45000,
  };

  /**
   * Initializes microphone stream with optimal noise reduction and starts adaptive VAD
   */
  public async startContinuousVAD(
    callbacks: VADCallbacks,
    options: Partial<VADOptions> = {}
  ): Promise<boolean> {
    this.callbacks = callbacks;
    this.options = { ...this.options, ...options };

    try {
      if (!this.audioStream || !this.audioStream.active) {
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      this.setupAudioAnalysis();
      this.isMonitoring = true;
      this.startVADLoop();
      return true;
    } catch (err) {
      console.error('Failed to start continuous VAD / microphone:', err);
      return false;
    }
  }

  private setupAudioAnalysis() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {
        console.warn('AudioContext close warning:', e);
      }
    }

    if (!this.audioStream) return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.25;
      this.sourceNode = this.audioContext.createMediaStreamSource(this.audioStream);
      this.sourceNode.connect(this.analyser);
    } catch (e) {
      console.warn('Audio analyser setup failed:', e);
    }
  }

  private startVADLoop() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudioFrame = () => {
      if (!this.isMonitoring || !this.analyser || !this.audioStream?.active) {
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);

      // Focus on human speech band (~180Hz to 3200Hz).
      // Reject sub-bass table rumblings and high-frequency fan/preamp hiss (>3200Hz).
      const sampleRate = this.audioContext?.sampleRate || 48000;
      const binHz = sampleRate / (this.analyser.fftSize || 256);
      const startBin = Math.max(1, Math.floor(180 / binHz));
      const endBin = Math.min(bufferLength - 1, Math.ceil(3200 / binHz));

      let sum = 0;
      let speechBinCount = 0;
      for (let i = startBin; i <= endBin; i++) {
        sum += dataArray[i];
        speechBinCount++;
      }
      const average = sum / (speechBinCount || 1);
      const volume = Math.min(100, Math.round((average / 128) * 100));

      this.callbacks.onVolumeUpdate?.(volume);

      const now = Date.now();
      const isAiSpeaking = this.options.isAiSpeaking ? this.options.isAiSpeaking() : false;

      // When AI is speaking through speakers, isolate microphone from speaker echo
      if (isAiSpeaking) {
        if (this.isUserSpeaking) {
          this.isUserSpeaking = false;
          this.cancelInternalRecording();
        }
        this.animFrameId = requestAnimationFrame(checkAudioFrame);
        return;
      }

      // --- Dynamic Noise Floor Tracking ---
      if (!this.isUserSpeaking) {
        this.noiseSamples.push(volume);
        if (this.noiseSamples.length > 40) {
          this.noiseSamples.shift();
        }
        // Baseline noise is the lowest 30% quantile of recent idle samples
        const sorted = [...this.noiseSamples].sort((a, b) => a - b);
        const baseline = sorted[Math.floor(sorted.length * 0.3)] ?? volume;
        this.noiseFloor = Math.max(4, Math.min(35, baseline));
      }

      // --- Adaptive Thresholds with Environmental Noise Rejection ---
      const baseThreshold = this.options.speechThreshold ?? 18;
      // Speech start threshold requires clear vocal energy above room noise (+7dB)
      const speechStartThreshold = Math.max(baseThreshold, this.noiseFloor + 7);
      // Silence threshold detects return to ambient noise
      const silenceThreshold = Math.max(8, this.noiseFloor + 3);

      if (!this.isUserSpeaking) {
        // Checking for speech start: require 2 consecutive frames to ignore random sharp clicks
        if (volume >= speechStartThreshold) {
          this.consecutiveSpeechFrames++;
          if (this.consecutiveSpeechFrames >= 2) {
            this.isUserSpeaking = true;
            this.speechStartTime = now;
            this.lastAudibleTime = now;
            this.peakSpeechVolume = volume;
            this.consecutiveAudibleFrames = 3;
            this.startInternalRecording();
            this.callbacks.onSpeechStart?.();
          }
        } else {
          this.consecutiveSpeechFrames = 0;
        }
      } else {
        // User is currently speaking -> track peak and check for silence
        if (volume > this.peakSpeechVolume) {
          this.peakSpeechVolume = volume;
        }

        // Environmental noise rejection:
        // Voice is only active if it's above silence floor AND above 30% of peak speech energy
        const isVoiceActive = volume >= silenceThreshold && volume >= Math.max(9, this.peakSpeechVolume * 0.30);

        if (isVoiceActive) {
          this.consecutiveAudibleFrames++;
          if (this.consecutiveAudibleFrames >= 2) {
            this.lastAudibleTime = now;
          }
        } else {
          this.consecutiveAudibleFrames = 0;
        }

        const silenceDuration = now - this.lastAudibleTime;
        const totalSpeechDuration = now - this.speechStartTime;
        const requiredSilence = this.options.silenceThresholdMs ?? 1200; // 1.2s matching Talk with AI
        const minSpeechDuration = this.options.minSpeechDurationMs ?? 400;
        const maxSpeechDuration = this.options.maxSpeechDurationMs ?? 45000;

        // Report silence countdown progress to UI (e.g. interview 3s countdown toast)
        if (!isVoiceActive && silenceDuration > 0 && silenceDuration < requiredSilence) {
          const remainingSecs = Math.ceil((requiredSilence - silenceDuration) / 1000);
          this.callbacks.onSilenceProgress?.(remainingSecs);
        } else if (isVoiceActive) {
          // Reset countdown display while user is actively speaking
          const fullSecs = Math.ceil(requiredSilence / 1000);
          this.callbacks.onSilenceProgress?.(fullSecs);
        }

        // Pause detected after user spoke, or safety max speech duration reached
        if (silenceDuration >= requiredSilence || totalSpeechDuration >= maxSpeechDuration) {
          console.log(`[AudioRecorder VAD] Pause detected! silenceDuration=${silenceDuration}ms >= ${requiredSilence}ms (NoiseFloor=${this.noiseFloor}, Vol=${volume}, Peak=${this.peakSpeechVolume})`);
          this.isUserSpeaking = false;
          this.consecutiveSpeechFrames = 0;
          this.consecutiveAudibleFrames = 0;
          if (totalSpeechDuration >= minSpeechDuration) {
            this.stopInternalRecordingAndDispatch();
          } else {
            // Discard short clicks/keyboard noise
            this.cancelInternalRecording();
          }
        }
      }

      this.animFrameId = requestAnimationFrame(checkAudioFrame);
    };

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.animFrameId = requestAnimationFrame(checkAudioFrame);
  }

  private startInternalRecording() {
    if (!this.audioStream) return;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch (_) { }
    }

    this.audioChunks = [];
    let mediaRecorder: MediaRecorder;
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      mediaRecorder = new MediaRecorder(this.audioStream, { mimeType });
    } catch (_) {
      mediaRecorder = new MediaRecorder(this.audioStream);
    }

    this.mediaRecorder = mediaRecorder;
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    try {
      // 100ms slices ensure chunks are buffered continuously and quickly
      this.mediaRecorder.start(100);
    } catch (e) {
      console.error('Failed to start MediaRecorder in VAD:', e);
    }
  }

  private stopInternalRecordingAndDispatch() {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      if (this.audioChunks.length > 0) {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];
        this.callbacks.onSpeechEnd?.(blob);
      }
      return;
    }

    if (this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.requestData();
      } catch (_) { }
    }

    this.mediaRecorder.onstop = () => {
      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(this.audioChunks, { type: mimeType });
      this.audioChunks = [];
      this.callbacks.onSpeechEnd?.(blob);
    };

    try {
      this.mediaRecorder.stop();
    } catch (e) {
      console.warn('Error stopping media recorder in VAD:', e);
      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(this.audioChunks, { type: mimeType });
      this.audioChunks = [];
      this.callbacks.onSpeechEnd?.(blob);
    }
  }

  private cancelInternalRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn('Error stopping canceled recorder:', e);
      }
    }
    this.audioChunks = [];
  }

  /**
   * Manual direct recording with real-time volume level tracking
   */
  public async startRecording(onVolumeUpdate?: (volume: number) => void): Promise<boolean> {
    try {
      this.audioChunks = [];
      if (!this.audioStream || !this.audioStream.active) {
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      this.setupAudioAnalysis();
      this.isMonitoring = true;

      if (onVolumeUpdate) {
        this.callbacks.onVolumeUpdate = onVolumeUpdate;
        this.startVolumeMonitoringLoop();
      }

      let mediaRecorder: MediaRecorder;
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/mp4';
        mediaRecorder = new MediaRecorder(this.audioStream, { mimeType });
      } catch (_) {
        mediaRecorder = new MediaRecorder(this.audioStream);
      }

      this.mediaRecorder = mediaRecorder;
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Collect data slices every 250ms for reliability
      this.mediaRecorder.start(250);
      return true;
    } catch (err) {
      console.error('Failed to access microphone:', err);
      return false;
    }
  }

  private startVolumeMonitoringLoop() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkVolume = () => {
      if (!this.isMonitoring || !this.analyser || !this.audioStream?.active) {
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      let count = 0;
      for (let i = 2; i < bufferLength - 10; i++) {
        sum += dataArray[i];
        count++;
      }
      const average = sum / (count || 1);
      const volume = Math.min(100, Math.round((average / 128) * 100));

      this.callbacks.onVolumeUpdate?.(volume);
      this.animFrameId = requestAnimationFrame(checkVolume);
    };

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.animFrameId = requestAnimationFrame(checkVolume);
  }

  /**
   * Stop recording and resolve with complete audio Blob
   */
  public stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      this.isMonitoring = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }

      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];
        resolve(blob);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];
        resolve(audioBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn('Error stopping manual recording:', e);
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];
        resolve(blob);
      }
    });
  }

  public pauseVAD() {
    this.isMonitoring = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resumeVAD() {
    if (!this.isMonitoring && this.audioStream?.active) {
      this.isMonitoring = true;
      this.startVADLoop();
    }
  }

  public resetSpeakingState() {
    this.isUserSpeaking = false;
    this.peakSpeechVolume = 0;
    this.cancelInternalRecording();
  }

  /**
   * External signal that speech activity was detected (e.g. browser SpeechRecognition result).
   * Resets the silence timer to prevent premature auto-submit while user is genuinely speaking.
   */
  public touchSpeechActivity() {
    if (this.isUserSpeaking) {
      this.lastAudibleTime = Date.now();
      this.consecutiveAudibleFrames = 3;
    }
  }

  public cleanup() {
    this.isMonitoring = false;
    this.isUserSpeaking = false;
    this.peakSpeechVolume = 0;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn('Error during mediaRecorder stop:', e);
      }
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {
        console.warn('Error closing audioContext:', e);
      }
      this.audioContext = null;
    }
  }
}
