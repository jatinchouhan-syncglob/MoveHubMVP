export const STORAGE_KEYS = {
  USER_PROFILE: '@movehub_user_profile',
  ACTIVITIES: '@movehub_activities',
  LAST_DISCLAIMER_ACCEPTED: '@movehub_disclaimer_accepted',
} as const;

export type StorageKeyType = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
