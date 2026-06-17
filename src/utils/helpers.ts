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

