import EventSource, { CustomEvent, ErrorEvent } from 'react-native-sse';
import { LeaderboardSSEData, Phase1LeaderboardItem } from '../types';

export const LEADERBOARD_SSE_BASE_URL = 'http://3.108.89.35/api/v1/leaderboard';

export type SSEEventType =
  | 'leaderboard_snapshot'
  | 'leaderboard_update'
  | 'leaderboard_partial'
  | 'connected'
  | 'open'
  | 'error'
  | 'close';

export interface LeaderboardSSECallbacks {
  onSnapshot?: (data: LeaderboardSSEData) => void;
  onUpdate?: (data: LeaderboardSSEData) => void;
  onPartial?: (data: LeaderboardSSEData) => void;
  onConnected?: (data: any) => void;
  onError?: (error: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function createLeaderboardSSE(
  challengeId: string = 'ecfl_longevity_challenge_01',
  callbacks: LeaderboardSSECallbacks,
  uhid?: string,
): EventSource<'leaderboard_snapshot' | 'leaderboard_update' | 'leaderboard_partial' | 'connected'> {
  const queryParam = uhid && uhid.trim() ? `?uhid=${encodeURIComponent(uhid.trim())}` : '';
  const url = `${LEADERBOARD_SSE_BASE_URL}/${challengeId}/stream${queryParam}`;
  console.log(`[LeaderboardSSE] Connecting to: ${url}`);

  const es = new EventSource<
    'leaderboard_snapshot' | 'leaderboard_update' | 'leaderboard_partial' | 'connected'
  >(url, {
    headers: {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });

  const parseData = (raw: string | null): LeaderboardSSEData | null => {
    if (!raw) return null;
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (err) {
      console.warn('[LeaderboardSSE] Failed to parse JSON:', err, raw);
      return null;
    }
  };

  es.addEventListener('open', () => {
    console.log(`[LeaderboardSSE] Connection open for: ${challengeId}`);
    callbacks.onOpen?.();
  });

  es.addEventListener('connected', (event: CustomEvent<'connected'>) => {
    console.log('[LeaderboardSSE] Connected event received:', event.data);
    const parsed = parseData(event.data);
    callbacks.onConnected?.(parsed || {});
  });

  es.addEventListener('leaderboard_snapshot', (event: CustomEvent<'leaderboard_snapshot'>) => {
    console.log('[LeaderboardSSE] leaderboard_snapshot event received (Redis Complete)');
    const parsed = parseData(event.data);
    if (parsed) {
      callbacks.onSnapshot?.(parsed);
    }
  });

  es.addEventListener('leaderboard_update', (event: CustomEvent<'leaderboard_update'>) => {
    console.log('[LeaderboardSSE] leaderboard_update event received (Live Update)');
    const parsed = parseData(event.data);
    if (parsed) {
      callbacks.onUpdate?.(parsed);
    }
  });

  es.addEventListener('leaderboard_partial', (event: CustomEvent<'leaderboard_partial'>) => {
    console.log('[LeaderboardSSE] leaderboard_partial event received (PostgreSQL Fallback)');
    const parsed = parseData(event.data);
    if (parsed) {
      callbacks.onPartial?.(parsed);
    }
  });

  es.addEventListener('error', (event: any) => {
    console.warn('[LeaderboardSSE] Error event occurred:', event?.message || event);
    callbacks.onError?.(event);
  });

  es.addEventListener('close', () => {
    console.log(`[LeaderboardSSE] Connection closed for: ${challengeId}`);
    callbacks.onClose?.();
  });

  return es;
}
