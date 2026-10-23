import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, useColorScheme, AppState, Alert, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/query/queryClient';
import RootNavigator from './src/navigation/RootNavigator';
import {
  syncHealthConnectAnalytics,
  getHealthConnectWorkManagerStatus,
  openHealthConnectBatteryOptimizationSettings,
  openHealthConnectExactAlarmSettings,
  getHealthConnectAccessState,
} from './src/services/healthConnect';
import ReactNativeBiometrics from 'react-native-biometrics';
import { storageHelper } from './src/storage/storageHelper';
import { STORAGE_KEYS } from './src/storage/storageKeys';
import { AppLockOverlay } from './src/components/common/AppLockOverlay';
import {
  navigationRef,
  navigateToDashboardSteps,
  getCurrentRouteName,
  getGlobalDashboardTab,
} from './src/navigation/navigationRef';
import { HealthConnectPermissionModal } from './src/components/common/HealthConnectPermissionModal';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const appState = useRef(AppState.currentState);
  const biometricsRequiredRef = useRef(false);
  const isAlertShowingRef = useRef(false);
  
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [biometricsTypeLabel, setBiometricsTypeLabel] = useState('Biometrics');
  const [lockKey, setLockKey] = useState(0);
  const [isHealthConnectModalVisible, setIsHealthConnectModalVisible] = useState(false);

  const checkHealthConnectPermissionsStatus = async () => {
    if (Platform.OS !== 'android') return;

    try {
      // 1. User MUST be logged in
      const token = await storageHelper.getItem<string>(STORAGE_KEYS.TOKEN);
      if (!token) {
        setIsHealthConnectModalVisible(false);
        return;
      }

      // Check promo code: if MASS01, suppress health connect permission modal completely!
      const userProfile = await storageHelper.getItem<any>(STORAGE_KEYS.USER_PROFILE);
      const activePromo = (userProfile?.promocode || userProfile?.promoCode || '').toString().trim().toUpperCase();
      if (activePromo === 'MASS01') {
        setIsHealthConnectModalVisible(false);
        return;
      }

      // 2. Do not show modal on pre-login or onboarding auth screens
      const currentRoute = getCurrentRouteName();
      const unauthenticatedRoutes = [
        'Splash',
        'Login',
        'Signup',
        'ForgotPassword',
        'ResetPassword',
        'Disclaimer',
      ];
      if (currentRoute && unauthenticatedRoutes.includes(currentRoute)) {
        setIsHealthConnectModalVisible(false);
        return;
      }

      // 3. If user is already looking at Dashboard Steps Tracking tab, do not show blocking modal
      if (getGlobalDashboardTab() === 'steps' && (!currentRoute || currentRoute === 'DrawerNavigator' || currentRoute === 'Dashboard')) {
        return;
      }

      const access = await getHealthConnectAccessState();
      const isConnected = access.availability === 'available' && access.hasAllPermissions;

      if (isConnected) {
        setIsHealthConnectModalVisible(false);
        return;
      }

      setIsHealthConnectModalVisible(true);
    } catch (err) {
      console.warn('[Health Connect Global Check] Failed to check access state:', err);
    }
  };

  const checkNativeBackgroundPermissions = async () => {
    if (Platform.OS !== 'android') return;
    if (isAlertShowingRef.current) return;

    try {
      const token = await storageHelper.getItem<string>(STORAGE_KEYS.TOKEN);
      if (!token) return;

      // Suppress background permission alerts for MASS01 promo code
      const userProfile = await storageHelper.getItem<any>(STORAGE_KEYS.USER_PROFILE);
      const activePromo = (userProfile?.promocode || userProfile?.promoCode || '').toString().trim().toUpperCase();
      if (activePromo === 'MASS01') {
        return;
      }

      const nativeStatus = await getHealthConnectWorkManagerStatus();
      if (!nativeStatus) return;

      const { exactAlarmAllowed, batteryOptimizationIgnored } = nativeStatus;

      if (!batteryOptimizationIgnored || !exactAlarmAllowed) {
        let message =
          'To ensure your health data is synchronized automatically in the background, please:\n\n';
        if (!batteryOptimizationIgnored) {
          message +=
            '• Disable battery restrictions (Select "Don\'t Restrict" / "Ignore Battery Optimization")\n';
        }
        if (!exactAlarmAllowed) {
          message += '• Allow scheduling exact alarms\n';
        }

        isAlertShowingRef.current = true;

        Alert.alert(
          'Background Sync Settings Required',
          message,
          [
            {
              text: 'Configure Settings',
              onPress: async () => {
                isAlertShowingRef.current = false;
                if (!batteryOptimizationIgnored) {
                  await openHealthConnectBatteryOptimizationSettings();
                } else if (!exactAlarmAllowed) {
                  await openHealthConnectExactAlarmSettings();
                }
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                isAlertShowingRef.current = false;
              },
            },
          ],
          {
            cancelable: true,
            onDismiss: () => {
              isAlertShowingRef.current = false;
            },
          }
        );
      }
    } catch (err) {
      console.warn('[Global Permissions] Failed to check background sync permissions:', err);
    }
  };

  useEffect(() => {
    const initBiometrics = async () => {
      try {
        const rnBiometrics = new ReactNativeBiometrics();
        const { available, biometryType } = await rnBiometrics.isSensorAvailable();
        
        let label = 'Biometrics';
        if (biometryType === 'TouchID') {
          label = 'Touch ID';
        } else if (biometryType === 'FaceID') {
          label = 'Face ID';
        } else {
          label = 'Fingerprint / Face ID';
        }
        setBiometricsTypeLabel(label);

        const isEnabled = await storageHelper.getItem<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
        
        if (available && isEnabled) {
          biometricsRequiredRef.current = true;
          setIsAppLocked(true);
          setLockKey(Date.now());
        }
      } catch (err) {
        console.warn('Biometric init error', err);
      }
    };
    initBiometrics();
  }, []);

  // Periodic permission check every 1 minute and initial trigger
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      checkNativeBackgroundPermissions();
      checkHealthConnectPermissionsStatus();
    }, 2000);

    const permissionInterval = setInterval(() => {
      checkNativeBackgroundPermissions();
      checkHealthConnectPermissionsStatus();
    }, 60 * 1000); // Trigger every 1 minute

    return () => {
      clearTimeout(initialTimer);
      clearInterval(permissionInterval);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Immediate check when returning from Settings, Health Connect, or background
        setTimeout(() => {
          checkNativeBackgroundPermissions();
          checkHealthConnectPermissionsStatus();
        }, 500);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Run an initial sync on app startup
    syncHealthConnectAnalytics().catch(err => {
      console.warn('[Foreground Sync] Initial startup sync failed:', err);
    });

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
          <NavigationContainer ref={navigationRef}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <RootNavigator />
            {isAppLocked && (
              <AppLockOverlay
                key={lockKey}
                onUnlock={() => setIsAppLocked(false)}
                biometricsTypeLabel={biometricsTypeLabel}
              />
            )}
            <HealthConnectPermissionModal
              visible={isHealthConnectModalVisible}
              onNavigateToHealthConnect={() => {
                setIsHealthConnectModalVisible(false);
                navigateToDashboardSteps();
              }}
              onDismiss={() => {
                setIsHealthConnectModalVisible(false);
              }}
            />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

export default App;

