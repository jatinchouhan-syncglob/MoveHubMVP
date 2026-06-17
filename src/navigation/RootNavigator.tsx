import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { RootStackParamList } from './navigationTypes';

import SplashScreen from '../screens/Splash';
import DisclaimerScreen from '../screens/Disclaimer';
import ProfileSetupScreen from '../screens/ProfileSetup';
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
        name={ROUTES.PROFILE_SETUP as 'ProfileSetup'} 
        component={ProfileSetupScreen} 
      />
      <Stack.Screen 
        name={ROUTES.DRAWER as 'DrawerNavigator'} 
        component={DrawerNavigator} 
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
