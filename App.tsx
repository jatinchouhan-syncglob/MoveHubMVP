import React, { useEffect, useRef } from 'react';
import { StatusBar, useColorScheme, AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/query/queryClient';
import RootNavigator from './src/navigation/RootNavigator';
import { syncHealthConnectAnalytics } from './src/services/healthConnect';
import ReactNativeBiometrics from 'react-native-biometrics';
import { storageHelper } from './src/storage/storageHelper';
import { STORAGE_KEYS } from './src/storage/storageKeys';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const appState = useRef(AppState.currentState);
  const biometricsRequiredRef = useRef(false);

  const authenticate = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      await rnBiometrics.simplePrompt({
        promptMessage: 'Unlock MoveHub',
        cancelButtonText: 'Cancel'
      });
    } catch (err) {
      console.warn('[App] Biometric auth error:', err);
    }
  };

  useEffect(() => {
    const initBiometrics = async () => {
      try {
        const rnBiometrics = new ReactNativeBiometrics();
        const { available } = await rnBiometrics.isSensorAvailable();
        const isEnabled = await storageHelper.getItem<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
        
        if (available && isEnabled) {
          biometricsRequiredRef.current = true;
          setTimeout(() => {
            authenticate();
          }, 600);
        }
      } catch (err) {
        console.warn('Biometric init error', err);
      }
    };
    initBiometrics();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (biometricsRequiredRef.current) {
          setTimeout(() => authenticate(), 300);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Setup periodic sync loop every 30 minutes (1,800,000 ms) while app is active
    const syncInterval = setInterval(() => {
      console.log('[Foreground Sync] Running periodic 30-minute Health Connect sync...');
      syncHealthConnectAnalytics().catch(err => {
        console.warn('[Foreground Sync] Periodic sync failed:', err);
      });
    }, 30 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

export default App;

