export const STORAGE_KEYS = {
  USER_PROFILE: '@movehub_user_profile',
  ACTIVITIES: '@movehub_activities_v2',
  LAST_DISCLAIMER_ACCEPTED: '@movehub_disclaimer_accepted',
  PACING_PROFILE: '@movehub_pacing_profile',
  PACING_OTHER_TEXT: '@movehub_pacing_other_text',
  PACING_CARDIO_SUBS: '@movehub_pacing_cardio_subs',
  PACING_METABOLIC_SUBS: '@movehub_pacing_metabolic_subs',
  LEADERBOARD_LAST_RANKS: '@movehub_leaderboard_last_ranks',
} as const;

export type StorageKeyType = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

