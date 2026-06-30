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
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
