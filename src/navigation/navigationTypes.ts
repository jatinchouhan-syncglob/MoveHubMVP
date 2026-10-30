import { NavigatorScreenParams } from '@react-navigation/native';

export type DrawerParamList = {
  Dashboard: undefined;
  ActivityTracking: undefined;
  NutritionalProfiler: undefined;
  ExercisePrescription: undefined;
  LifestyleProfiler: undefined;
  Leaderboard: undefined;
  Insights: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Disclaimer: undefined;
  Login: undefined;
  Signup: undefined;
  ProfileSetup: undefined;
  WellnessPacingProfile: undefined;
  DrawerNavigator: NavigatorScreenParams<DrawerParamList>;
  LeaderboardDetails: {
    player: any;
    phase: number;
    day: number;
  };
  DemoSearchHub: undefined;
  DemoWorkoutLog: {
    activityCode?: string;
    activityName: string;
    category: string;
    baseMet: number;
    cardio: number;
    strength: number;
    balance: number;
    recovery: number;
  };
  DemoWearableSync: {
    activityName: string;
    baseMet?: number;
    cardio?: number;
    strength?: number;
    balance?: number;
    recovery?: number;
  };
  DemoPostWorkoutSummary: {
    activityName?: string;
    baseMet?: number;
    cardio?: number;
    strength?: number;
    balance?: number;
    recovery?: number;
    duration?: number;
  };
  ResetPassword?: {
    email?: string;
  };
  ForgotPassword?: {
    email?: string;
  };
  PrivacyPolicy: undefined;
  JoinChallenge?: {
    arena?: any;
    arenaId?: string;
    arenaName?: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
