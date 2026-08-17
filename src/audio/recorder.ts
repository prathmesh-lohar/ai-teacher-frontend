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

  private callbacks: VADCallbacks = {};
  private options: VADOptions = {
    speechThreshold: 20,
    silenceThresholdMs: 1200,
    minSpeechDurationMs: 400,
    maxSpeechDurationMs: 15000,
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

      // Focus on human speech frequencies (~150Hz - 3400Hz, upper bins ignore sub-bass hum)
      let sum = 0;
      let speechBinCount = 0;
      for (let i = 2; i < bufferLength - 10; i++) {
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
        // Baseline noise is the lowest 25% quantile of recent idle samples
        const sorted = [...this.noiseSamples].sort((a, b) => a - b);
        const baseline = sorted[Math.floor(sorted.length * 0.25)] ?? volume;
        this.noiseFloor = Math.max(4, Math.min(30, baseline));
      }

      // --- Adaptive Thresholds ---
      // Speech start threshold needs clear energy above ambient noise
      const speechStartThreshold = Math.max(this.options.speechThreshold || 20, this.noiseFloor + 10);
      // Silence threshold is dynamic: when volume drops back close to ambient noise level or below 40% of speech peak
      const silenceThreshold = Math.max(12, this.noiseFloor + 5);

      if (!this.isUserSpeaking) {
        // Checking for speech start
        if (volume >= speechStartThreshold) {
          this.isUserSpeaking = true;
          this.speechStartTime = now;
          this.lastAudibleTime = now;
          this.peakSpeechVolume = volume;
          this.startInternalRecording();
          this.callbacks.onSpeechStart?.();
        }
      } else {
        // User is currently speaking -> track peak and check for silence or max duration
        if (volume > this.peakSpeechVolume) {
          this.peakSpeechVolume = volume;
        }

        // Voice active if above silence threshold AND above 35% of peak utterance volume
        const isVoiceActive =
          volume >= silenceThreshold && volume >= Math.max(14, this.peakSpeechVolume * 0.35);

        if (isVoiceActive) {
          this.lastAudibleTime = now;
        }

        const silenceDuration = now - this.lastAudibleTime;
        const totalSpeechDuration = now - this.speechStartTime;
        const requiredSilence = this.options.silenceThresholdMs || 1200;
        const minSpeechDuration = this.options.minSpeechDurationMs || 400;
        const maxSpeechDuration = this.options.maxSpeechDurationMs || 15000;

        // Condition 1: Silence detected after user spoke
        // Condition 2: Safety max speech duration reached (prevent hanging in very noisy room)
        if (silenceDuration >= requiredSilence || totalSpeechDuration >= maxSpeechDuration) {
          this.isUserSpeaking = false;
          if (totalSpeechDuration >= minSpeechDuration) {
            this.stopInternalRecordingAndDispatch();
          } else {
            // Discard short clicks/ambient spikes
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

    this.audioChunks = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    try {
      this.mediaRecorder = new MediaRecorder(this.audioStream, { mimeType });
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      this.mediaRecorder.start();
    } catch (e) {
      console.error('Failed to start MediaRecorder:', e);
    }
  }

  private stopInternalRecordingAndDispatch() {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      if (this.audioChunks.length > 0) {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        this.callbacks.onSpeechEnd?.(blob);
      }
      return;
    }

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioChunks = [];
      this.callbacks.onSpeechEnd?.(blob);
    };

    try {
      this.mediaRecorder.stop();
    } catch (e) {
      console.warn('Error stopping media recorder:', e);
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
   * Manual fallback start recording
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

      if (onVolumeUpdate) {
        this.callbacks.onVolumeUpdate = onVolumeUpdate;
        this.setupAudioAnalysis();
      }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(this.audioStream, { mimeType });
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (err) {
      console.error('Failed to access microphone:', err);
      return false;
    }
  }

  /**
   * Manual fallback stop recording
   */
  public stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        resolve(blob);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        resolve(audioBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn('Error stopping manual recording:', e);
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
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
