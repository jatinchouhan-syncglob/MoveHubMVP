export const ROUTES = {
  SPLASH: 'Splash',
  DISCLAIMER: 'Disclaimer',
  PROFILE_SETUP: 'ProfileSetup',
  DRAWER: 'DrawerNavigator',
  DASHBOARD: 'Dashboard',
  ACTIVITY_TRACKING: 'ActivityTracking',
  LEADERBOARD: 'Leaderboard',
  INSIGHTS: 'Insights',
  PROFILE: 'Profile',
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];
