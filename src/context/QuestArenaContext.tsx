import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import EventSource from 'react-native-sse';
import { QuestArenaSSEData, UserProfile } from '../types';
import { createQuestArenaSSE } from '../services/questArenaSSE';
import { storageHelper } from '../storage/storageHelper';
import { STORAGE_KEYS } from '../storage/storageKeys';

interface QuestArenaContextType {
  data: QuestArenaSSEData | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdated: Date | null;
  error: string | null;
  reconnect: () => void;
}

const QuestArenaContext = createContext<QuestArenaContextType>({
  data: null,
  isConnected: false,
  isConnecting: false,
  lastUpdated: null,
  error: null,
  reconnect: () => {},
});

export const QuestArenaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<QuestArenaSSEData | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sseRef = useRef<EventSource<any> | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connectSSE = useCallback(async () => {
    // Clean up existing instance
    if (sseRef.current) {
      try {
        sseRef.current.close();
      } catch (e) {
        // ignore
      }
      sseRef.current = null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const cachedProfile = await storageHelper.getItem<UserProfile>(
        STORAGE_KEYS.USER_PROFILE,
      );
      const targetUhid = cachedProfile?.uhid?.trim() || 'JATCHO5525';

      console.log(`[QuestArenaContext] Initiating SSE connection for UHID: ${targetUhid}`);

      const sseInstance = createQuestArenaSSE(targetUhid, {
        onOpen: () => {
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
        },
        onConnected: () => {
          setIsConnected(true);
          setIsConnecting(false);
        },
        onInitial: incoming => {
          console.log('[QuestArenaContext] Received initial_quest_arena:', incoming?.STATUS);
          setData(incoming);
          setLastUpdated(new Date());
          setIsConnected(true);
          setIsConnecting(false);
        },
        onTick: incoming => {
          console.log('[QuestArenaContext] Received QUEST_ARENA_TICK:', incoming?.STATUS);
          setData(incoming);
          setLastUpdated(new Date());
          setIsConnected(true);
          setIsConnecting(false);
        },
        onPartial: incoming => {
          console.log('[QuestArenaContext] Received quest_arena_partial:', incoming?.STATUS);
          setData(incoming);
          setLastUpdated(new Date());
          setIsConnected(true);
          setIsConnecting(false);
        },
        onError: err => {
          console.warn('[QuestArenaContext] SSE error:', err?.message || err);
          setIsConnected(false);
          setIsConnecting(false);
          setError('Live connection interrupted. Reconnecting...');
        },
        onClose: () => {
          setIsConnected(false);
          setIsConnecting(false);
        },
      });

      sseRef.current = sseInstance;
    } catch (err: any) {
      console.warn('[QuestArenaContext] Setup exception:', err);
      setIsConnecting(false);
      setIsConnected(false);
      setError(err?.message || 'Failed to initialize live stream');
    }
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      connectSSE();
    }, 500);
  }, [connectSSE]);

  useEffect(() => {
    connectSSE();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (sseRef.current) {
        try {
          sseRef.current.close();
        } catch (e) {
          // ignore
        }
        sseRef.current = null;
      }
    };
  }, [connectSSE]);

  return (
    <QuestArenaContext.Provider
      value={{
        data,
        isConnected,
        isConnecting,
        lastUpdated,
        error,
        reconnect,
      }}
    >
      {children}
    </QuestArenaContext.Provider>
  );
};

export const useQuestArena = (): QuestArenaContextType => {
  return useContext(QuestArenaContext);
};
