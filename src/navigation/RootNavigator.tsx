import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { RootStackParamList } from './navigationTypes';

import SplashScreen from '../screens/Splash';
import DisclaimerScreen from '../screens/Disclaimer';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';
import ProfileSetupScreen from '../screens/ProfileSetup';
import { WellnessPacingProfileScreen } from '../screens/WellnessPacingProfile';
import { WellnessPrescriptionScreen } from '../screens/WellnessPrescription';
import { DemoWorkoutLogScreen } from '../screens/DemoWorkoutLog';
import { DemoSearchHubScreen } from '../screens/DemoWorkoutLog/DemoSearchHub';
import { DemoWearableSyncScreen } from '../screens/DemoWorkoutLog/DemoWearableSync';
import { DemoPostWorkoutSummaryScreen } from '../screens/DemoWorkoutLog/DemoPostWorkoutSummary';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.SPLASH as 'Splash'}
      screenOptions={{
        headerShown: false, // Screens manage their own headers
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name={ROUTES.SPLASH as 'Splash'} 
        component={SplashScreen} 
      />
      <Stack.Screen 
        name={ROUTES.DISCLAIMER as 'Disclaimer'} 
        component={DisclaimerScreen} 
      />
      <Stack.Screen 
        name={ROUTES.LOGIN as 'Login'} 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name={ROUTES.SIGNUP as 'Signup'} 
        component={SignupScreen} 
      />
      <Stack.Screen 
        name={ROUTES.PROFILE_SETUP as 'ProfileSetup'} 
        component={ProfileSetupScreen} 
      />
      <Stack.Screen 
        name={ROUTES.WELLNESS_PACING_PROFILE as 'WellnessPacingProfile'} 
        component={WellnessPacingProfileScreen} 
      />
      <Stack.Screen 
        name={ROUTES.WELLNESS_PRESCRIPTION as 'WellnessPrescription'} 
        component={WellnessPrescriptionScreen} 
      />
      <Stack.Screen 
        name={ROUTES.DRAWER as 'DrawerNavigator'} 
        component={DrawerNavigator} 
      />
      <Stack.Screen 
        name={ROUTES.DEMO_WORKOUT_LOG as 'DemoWorkoutLog'} 
        component={DemoWorkoutLogScreen} 
      />
      <Stack.Screen 
        name={ROUTES.DEMO_SEARCH_HUB as 'DemoSearchHub'} 
        component={DemoSearchHubScreen} 
      />
      <Stack.Screen 
        name={ROUTES.DEMO_WEARABLE_SYNC as 'DemoWearableSync'} 
        component={DemoWearableSyncScreen} 
      />
      <Stack.Screen 
        name={ROUTES.DEMO_POST_WORKOUT_SUMMARY as 'DemoPostWorkoutSummary'} 
        component={DemoPostWorkoutSummaryScreen} 
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
