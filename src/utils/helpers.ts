/**
 * Generate a random unique ID string
 */
export const generateUUID = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Safely parse JSON strings with a fallback
 */
export const safeJsonParse = <T>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
};

/**
 * Mock delay helper
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Get initials from a full name
 */
export const getInitials = (name: string): string => {
  if (!name) return 'MH';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export type GenderOptionType = 'MALE' | 'FEMALE' | 'OTHER';

export const GENDER_OPTIONS: {
  id: GenderOptionType;
  label: string;
  icon: string;
}[] = [
  { id: 'MALE', label: 'Male', icon: '♂️' },
  { id: 'FEMALE', label: 'Female', icon: '♀️' },
  { id: 'OTHER', label: 'Other', icon: '⚧️' },
];

/**
 * Normalize backend/cached gender string to supported option IDs.
 */
export const normalizeGender = (
  value?: string | null,
): GenderOptionType | '' => {
  if (!value) return '';
  const upper = value.toString().trim().toUpperCase();
  if (upper === 'MALE' || upper === 'M') return 'MALE';
  if (upper === 'FEMALE' || upper === 'F') return 'FEMALE';
  if (upper === 'OTHER' || upper === 'NON_BINARY' || upper === 'NON-BINARY') {
    return 'OTHER';
  }
  return '';
};

export const DEFAULT_BEDTIME = '10:30 PM';

export interface ParsedBedtime {
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
}

/**
 * Parse 12-hour ("10:30 PM") or 24-hour ("22:30") bedtime strings into parts.
 */
export const parseBedtime = (raw?: unknown): ParsedBedtime => {
  if (typeof raw === 'string') {
    const trimmed = raw.trim().toUpperCase();
    const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (match12) {
      const h = parseInt(match12[1], 10);
      const m = Math.min(59, Math.max(0, parseInt(match12[2], 10)));
      const p = match12[3] as 'AM' | 'PM';
      if (h >= 1 && h <= 12) {
        return {
          hour: String(h),
          minute: String(m).padStart(2, '0'),
          period: p,
        };
      }
    }
    const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match24) {
      const h24 = parseInt(match24[1], 10);
      const m = Math.min(59, Math.max(0, parseInt(match24[2], 10)));
      if (h24 >= 0 && h24 <= 23) {
        const p: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
        const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
        return {
          hour: String(h12),
          minute: String(m).padStart(2, '0'),
          period: p,
        };
      }
    }
  }
  return { hour: '10', minute: '30', period: 'PM' };
};

/**
 * Normalize backend/cached bedtime value to formatted "hh:mm AM/PM" or empty string.
 */
export const normalizeBedtime = (raw?: unknown): string => {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return '';
  }
  const parsed = parseBedtime(raw);
  return `${parsed.hour}:${parsed.minute} ${parsed.period}`;
};

