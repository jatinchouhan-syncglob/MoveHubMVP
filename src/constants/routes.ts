export const ROUTES = {
  SPLASH: 'Splash',
  DISCLAIMER: 'Disclaimer',
  PROFILE_SETUP: 'ProfileSetup',
  WELLNESS_PACING_PROFILE: 'WellnessPacingProfile',
  WELLNESS_PRESCRIPTION: 'WellnessPrescription',
  DRAWER: 'DrawerNavigator',
  DASHBOARD: 'Dashboard',
  ACTIVITY_TRACKING: 'ActivityTracking',
  LEADERBOARD: 'Leaderboard',
  INSIGHTS: 'Insights',
  PROFILE: 'Profile',
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];
