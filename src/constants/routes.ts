export const ROUTES = {
  SPLASH: 'Splash',
  DISCLAIMER: 'Disclaimer',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  PROFILE_SETUP: 'ProfileSetup',
  WELLNESS_PACING_PROFILE: 'WellnessPacingProfile',
  WELLNESS_PRESCRIPTION: 'WellnessPrescription',
  DRAWER: 'DrawerNavigator',
  DASHBOARD: 'Dashboard',
  ACTIVITY_TRACKING: 'ActivityTracking',
  LEADERBOARD: 'Leaderboard',
  INSIGHTS: 'Insights',
  PROFILE: 'Profile',
  DEMO_WORKOUT_LOG: 'DemoWorkoutLog',
  DEMO_SEARCH_HUB: 'DemoSearchHub',
  DEMO_WEARABLE_SYNC: 'DemoWearableSync',
  DEMO_POST_WORKOUT_SUMMARY: 'DemoPostWorkoutSummary',
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];
