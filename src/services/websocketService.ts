import { storageHelper } from '../storage/storageHelper';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { UserProfile } from '../types';

const WS_BASE_URL = 'ws://13.127.122.202:8081/backend/ws-health-report';

export type HealthReportSocketCallback = (data: any) => void;

class HealthReportWebSocketService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private messageListeners: HealthReportSocketCallback[] = [];
  private currentUhid: string | null = null;
  private reconnectTimer: any = null;

  public async connect(uhidOverride?: string) {
    let targetUhid = uhidOverride;

    if (!targetUhid) {
      const cachedProfile = await storageHelper.getItem<UserProfile>(
        STORAGE_KEYS.USER_PROFILE
      );
      targetUhid = cachedProfile?.uhid || 'SAUSHA5546';
    }

    this.currentUhid = targetUhid;

    // If socket is already open for same uhid, avoid duplicate connections
    if (this.socket && this.isConnected) {
      console.log(`[WebSocket] Already connected for UHID: ${this.currentUhid}`);
      return;
    }

    this.closeExistingSocket();

    const fullWsUrl = `${WS_BASE_URL}?uhid=${encodeURIComponent(targetUhid)}`;
    console.log(`[WebSocket] Connecting to: ${fullWsUrl}`);

    try {
      this.socket = new WebSocket(fullWsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log(`[WebSocket] Connected successfully for UHID: ${this.currentUhid}`);
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event: WebSocketMessageEvent) => {
        console.log('[WebSocket] 📩 Message received from server:', event.data);
        try {
          const parsedData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          this.notifyListeners(parsedData);
        } catch (err) {
          console.log('[WebSocket] 📩 Raw text message:', event.data);
          this.notifyListeners(event.data);
        }
      };

      this.socket.onerror = (error: WebSocketErrorEvent) => {
        console.warn('[WebSocket] ⚠️ Connection error:', error);
      };

      this.socket.onclose = (event: WebSocketCloseEvent) => {
        this.isConnected = false;
        console.log(`[WebSocket] 🔌 Connection closed (code ${event.code}, reason: ${event.reason || 'None'}).`);
        this.scheduleReconnect();
      };
    } catch (err) {
      console.error('[WebSocket] Failed to instantiate WebSocket:', err);
    }
  }

  public subscribe(callback: HealthReportSocketCallback): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(data: any) {
    this.messageListeners.forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error('[WebSocket] Error executing listener callback:', err);
      }
    });
  }

  private scheduleReconnect() {
    if (!this.currentUhid) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      console.log('[WebSocket] 🔄 Reconnecting WebSocket...');
      this.connect(this.currentUhid || undefined);
    }, 5000);
  }

  public closeExistingSocket() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  public disconnect() {
    console.log('[WebSocket] Disconnecting WebSocket...');
    this.closeExistingSocket();
    this.messageListeners = [];
    this.currentUhid = null;
  }
}

export const healthReportWebSocketService = new HealthReportWebSocketService();
