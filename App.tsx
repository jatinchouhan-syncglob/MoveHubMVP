import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { syncHealthConnectAnalytics } from './src/services/healthConnect';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;

