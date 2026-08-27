import { NavigatorScreenParams } from '@react-navigation/native';

export type DrawerParamList = {
  Dashboard: undefined;
  ActivityTracking: undefined;
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
  WellnessPrescription: undefined;
  DrawerNavigator: NavigatorScreenParams<DrawerParamList>;
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
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
