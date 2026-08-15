import { VoiceSocketEvent } from '@/types/voice';
import { getWebSocketUrl } from '@/config/env';

export type VoiceSocketCallback = (event: VoiceSocketEvent) => void;

export class VoiceWebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<VoiceSocketCallback> = new Set();
  private reconnectAttempts: number = 0;
  private url: string = '';

  public connect(sessionId: string = 'default'): Promise<boolean> {
    return new Promise((resolve) => {
      this.url = getWebSocketUrl(`/ws/voice/${sessionId}/`);

      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log('[VoiceWebSocket] Connected successfully to', this.url);
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            this.notify(parsed);
          } catch (err) {
            console.error('[VoiceWebSocket] Error parsing message:', err);
          }
        };

        this.socket.onerror = (err) => {
          console.warn('[VoiceWebSocket] WebSocket error:', err);
          resolve(false);
        };

        this.socket.onclose = (event) => {
          console.log('[VoiceWebSocket] Disconnected with code:', event.code);
          this.notify({ type: 'socket.disconnected', code: event.code });
        };
      } catch (err) {
        console.error('[VoiceWebSocket] Failed to instantiate WebSocket:', err);
        resolve(false);
      }
    });
  }

  public subscribe(callback: VoiceSocketCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(event: VoiceSocketEvent) {
    this.listeners.forEach((callback) => {
      try {
        callback(event);
      } catch (err) {
        console.error('[VoiceWebSocket] Error in subscriber callback:', err);
      }
    });
  }

  public send(event: VoiceSocketEvent) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    } else {
      console.warn('[VoiceWebSocket] Cannot send message, socket not open.');
    }
  }

  public sendAudioBlob(blob: Blob) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      this.send({
        type: 'user.audio.end',
        audio: base64Data,
      });
    };
    reader.readAsDataURL(blob);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
