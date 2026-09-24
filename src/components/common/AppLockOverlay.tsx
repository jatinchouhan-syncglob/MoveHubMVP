import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeBiometrics from 'react-native-biometrics';
import { theme } from '../../theme';

interface AppLockOverlayProps {
  onUnlock: () => void;
  biometricsTypeLabel?: string;
}

export const AppLockOverlay: React.FC<AppLockOverlayProps> = ({
  onUnlock,
  biometricsTypeLabel = 'Biometrics',
}) => {
  const [authenticating, setAuthenticating] = useState(false);
  const [errorText, setErrorText] = useState('');
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const triggerBiometricUnlock = async () => {
    if (authenticating) return;
    setAuthenticating(true);
    setErrorText('');

    // Pulse animation on lock icon
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }),
    ]).start();

    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: `Unlock MoveHub using ${biometricsTypeLabel}`,
        cancelButtonText: 'Close',
      });

      if (success) {
        onUnlock();
      } else {
        setErrorText('Authentication cancelled.');
      }
    } catch (err: any) {
      console.warn('[AppLock] Biometric authentication error:', err);
      setErrorText(err.message || 'Authentication failed.');
    } finally {
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerBiometricUnlock();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleExitApp = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e1b4b', '#0f172a']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Glow ring */}
        <Animated.View style={[styles.lockIconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#6366f1', '#4f46e5']}
            style={styles.lockGlowRing}
          >
            <Text style={styles.lockEmoji}>🔒</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.title}>MoveHub Locked</Text>
        <Text style={styles.subtitle}>
          Authentication is required to access your wellness dashboard
        </Text>

        {authenticating ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.statusText}>Initializing scan...</Text>
          </View>
        ) : (
          <View style={styles.actionContainer}>
            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
            
            <TouchableOpacity
              style={styles.unlockButton}
              activeOpacity={0.8}
              onPress={triggerBiometricUnlock}
            >
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.unlockButtonText}>
                  Unlock with {biometricsTypeLabel}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {Platform.OS === 'android' ? (
              <TouchableOpacity
                style={styles.exitButton}
                activeOpacity={0.7}
                onPress={handleExitApp}
              >
                <Text style={styles.exitButtonText}>Exit Application</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>

      <Text style={styles.footerText}>Secure Biometric Lock v2.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  lockIconContainer: {
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  lockGlowRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lockEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 15,
    marginLeft: 10,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#f43f5e',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  unlockButton: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  exitButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  exitButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    color: '#475569',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
