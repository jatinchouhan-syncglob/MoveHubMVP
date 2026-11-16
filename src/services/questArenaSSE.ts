import EventSource, { CustomEvent } from 'react-native-sse';
import { QuestArenaSSEData } from '../types';

export const QUEST_ARENA_SSE_BASE_URL = 'http://3.108.89.35/api/v1/quest-arena/live-stream';

export type QuestArenaSSEEventType =
  | 'initial_quest_arena'
  | 'QUEST_ARENA_TICK'
  | 'quest_arena_partial'
  | 'connected'
  | 'open'
  | 'error'
  | 'close';

export interface QuestArenaSSECallbacks {
  onInitial?: (data: QuestArenaSSEData) => void;
  onTick?: (data: QuestArenaSSEData) => void;
  onPartial?: (data: QuestArenaSSEData) => void;
  onConnected?: (data: any) => void;
  onError?: (error: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function createQuestArenaSSE(
  uhid: string = 'JATCHO5525',
  callbacks: QuestArenaSSECallbacks,
): EventSource<'initial_quest_arena' | 'QUEST_ARENA_TICK' | 'quest_arena_partial' | 'connected'> {
  const targetUhid = uhid && uhid.trim() ? uhid.trim() : 'JATCHO5525';
  const url = `${QUEST_ARENA_SSE_BASE_URL}?uhid=${encodeURIComponent(targetUhid)}`;
  console.log(`[QuestArenaSSE] Connecting to: ${url}`);

  const es = new EventSource<
    'initial_quest_arena' | 'QUEST_ARENA_TICK' | 'quest_arena_partial' | 'connected'
  >(url, {
    headers: {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });

  const parseData = (raw: string | null): QuestArenaSSEData | null => {
    if (!raw) return null;
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (err) {
      console.warn('[QuestArenaSSE] Failed to parse JSON:', err, raw);
      return null;
    }
  };

  es.addEventListener('open', () => {
    console.log(`[QuestArenaSSE] Connection open for UHID: ${targetUhid}`);
    callbacks.onOpen?.();
  });

  es.addEventListener('connected', (event: CustomEvent<'connected'>) => {
    console.log('[QuestArenaSSE] Connected event received:', event.data);
    const parsed = parseData(event.data);
    callbacks.onConnected?.(parsed || {});
  });

  es.addEventListener('initial_quest_arena', (event: CustomEvent<'initial_quest_arena'>) => {
    console.log('[QuestArenaSSE] initial_quest_arena event received');
    const parsed = parseData(event.data);
    if (parsed) {
      callbacks.onInitial?.(parsed);
    }
  });

  es.addEventListener('QUEST_ARENA_TICK', (event: CustomEvent<'QUEST_ARENA_TICK'>) => {
    console.log('[QuestArenaSSE] QUEST_ARENA_TICK event received');
    const parsed = parseData(event.data);
    if (parsed) {
      callbacks.onTick?.(parsed);
    }
  });

  es.addEventListener('quest_arena_partial', (event: CustomEvent<'quest_arena_partial'>) => {
    console.log('[QuestArenaSSE] quest_arena_partial event received');
    const parsed = parseData(event.data);
    if (parsed) {
      callbacks.onPartial?.(parsed);
    }
  });

  es.addEventListener('message', (event: any) => {
    if (event.data && typeof event.data === 'string' && event.data.startsWith('{')) {
      const parsed = parseData(event.data);
      if (parsed) {
        callbacks.onTick?.(parsed);
      }
    }
  });

  es.addEventListener('error', (event: any) => {
    console.warn('[QuestArenaSSE] Error event occurred:', event?.message || event);
    callbacks.onError?.(event);
  });

  es.addEventListener('close', () => {
    console.log(`[QuestArenaSSE] Connection closed for UHID: ${targetUhid}`);
    callbacks.onClose?.();
  });

  return es;
}
