import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';
import { ROUTES } from '../../constants/routes';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { BiometricConsentModal } from '../../components/common/BiometricConsentModal';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import {
  getHealthConnectWorkManagerStatus,
  openHealthConnectExactAlarmSettings,
  openHealthConnectBatteryOptimizationSettings,
} from '../../services/healthConnect';
import ReactNativeBiometrics from 'react-native-biometrics';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    const checkNativePermissions = async () => {
      if (Platform.OS !== 'android') return;
      try {
        const nativeStatus = await getHealthConnectWorkManagerStatus();
        if (!nativeStatus) return;

        const { exactAlarmAllowed, batteryOptimizationIgnored } = nativeStatus;
        
        if (!batteryOptimizationIgnored || !exactAlarmAllowed) {
          let message = 'To ensure your health data is synchronized automatically in the background, please:\n\n';
          if (!batteryOptimizationIgnored) {
            message += '• Disable battery restrictions (Select "Don\'t Restrict" / "Ignore Battery Optimization")\n';
          }
          if (!exactAlarmAllowed) {
            message += '• Allow scheduling exact alarms\n';
          }
          
          Alert.alert(
            'Background Sync Settings Required',
            message,
            [
              {
                text: 'Configure Settings',
                onPress: async () => {
                  if (!batteryOptimizationIgnored) {
                    await openHealthConnectBatteryOptimizationSettings();
                  } else if (!exactAlarmAllowed) {
                    await openHealthConnectExactAlarmSettings();
                  }
                }
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
        }
      } catch (err) {
        console.warn('Failed to check background sync permissions:', err);
      }
    };
    
    const timer = setTimeout(() => {
      checkNativePermissions();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordInputRef = useRef<any>(null);
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Biometrics States
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsTypeLabel, setBiometricsTypeLabel] = useState('');
  const [hasBiometricsEnabled, setHasBiometricsEnabled] = useState(false);

  // Error States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom Alert Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Biometric Consent Modal States
  const [biometricConsentVisible, setBiometricConsentVisible] = useState(false);
  const [tempProfileData, setTempProfileData] = useState<UserProfile | null>(null);
  const [tempPlainPassword, setTempPlainPassword] = useState('');

  // Check biometric availability on screen mount
  React.useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const rnBiometrics = new ReactNativeBiometrics();
        const { available, biometryType } = await rnBiometrics.isSensorAvailable();
        if (available) {
          setBiometricsAvailable(true);
          if (biometryType === 'TouchID') {
            setBiometricsTypeLabel('Touch ID');
          } else if (biometryType === 'FaceID') {
            setBiometricsTypeLabel('Face ID');
          } else {
            setBiometricsTypeLabel('Fingerprint / Face ID');
          }
          
          // Check if user previously enabled biometrics
          const enabled = await storageHelper.getItem<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
          if (enabled) {
            setHasBiometricsEnabled(true);
            const savedCredentials = await storageHelper.getItem<{ email: string }>(
              STORAGE_KEYS.BIOMETRICS_CREDENTIALS
            );
            if (savedCredentials?.email) {
              setEmail(savedCredentials.email);
            }
          }
        }
      } catch (err) {
        console.warn('[LoginScreen] Error checking biometrics:', err);
      }
    };
    
    // Small delay to make transition smoother
    const timer = setTimeout(() => {
      checkBiometricAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleBiometricLogin = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: `Authenticate to sign in using ${biometricsTypeLabel || 'Biometrics'}`,
      });

      if (success) {
        console.log('[LoginScreen] Biometric authentication successful!');
        const savedCredentials = await storageHelper.getItem<{ email: string; password: string }>(
          STORAGE_KEYS.BIOMETRICS_CREDENTIALS
        );

        if (savedCredentials && savedCredentials.email && savedCredentials.password) {
          setLoading(true);
          const response = await apiService.signin({
            email: savedCredentials.email,
            password: savedCredentials.password,
          });

          console.log('[LoginScreen] Biometric Signin Response:', JSON.stringify(response, null, 2));

          if (response && response.status === 'Success') {
            const userData = response.data || {};
            const userProfile: UserProfile = {
              uhid: userData.uhid || 'SAUSHA9775',
              name: userData.name || (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'Saurabh Sharma'),
              age: userData.age || 30,
              weight: userData.weight || 70,
              height: userData.height || 170,
              calorieGoal: userData.calorieGoal || 2400,
              isSetupComplete: userData.isSetupComplete !== undefined ? userData.isSetupComplete : true,
              email: userData.email || savedCredentials.email,
            };
            await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, userProfile);

            if (userProfile.isSetupComplete) {
              navigation.replace(ROUTES.DRAWER);
            } else {
              navigation.replace(ROUTES.PROFILE_SETUP);
            }
          } else {
            setAlertTitle('Biometric Sign In Failed');
            setAlertMessage(response?.message || 'Verification failed on server side.');
            setAlertVisible(true);
          }
        } else {
          Alert.alert(
            'Credentials Not Found',
            'No credentials saved for biometrics. Please log in with password once to enable biometric login.'
          );
        }
      }
    } catch (err: any) {
      console.error('[LoginScreen] Biometric login error:', err);
      Alert.alert('Authentication Failed', err.message || 'Fingerprint authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    let hasError = false;

    // Reset errors
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email address is required.');
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please enter a valid email address.');
        hasError = true;
      }
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const response = await apiService.signin({
        email: email.trim(),
        password: password,
      });

      console.log('[LoginScreen] Signin API Response inside Screen:', JSON.stringify(response, null, 2));

      if (response && response.status === 'Success') {
        const userData = response.data || {};
        
        // Save the profile to storage
        const userProfile: UserProfile = {
          uhid: userData.uhid || 'SAUSHA9775',
          name: userData.name || (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'Saurabh Sharma'),
          age: userData.age || 30,
          weight: userData.weight || 70,
          height: userData.height || 170,
          calorieGoal: userData.calorieGoal || 2400,
          isSetupComplete: userData.isSetupComplete !== undefined ? userData.isSetupComplete : true,
          email: userData.email || email.trim(),
        };
        await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, userProfile);

        // Check if user has biometric opt-in already enabled
        const isBiometricOptedIn = await storageHelper.getItem<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
        if (biometricsAvailable && !isBiometricOptedIn) {
          setTempProfileData(userProfile);
          setTempPlainPassword(password);
          setBiometricConsentVisible(true);
        } else {
          // If biometrics is already enabled, update stored password in case it was changed
          if (isBiometricOptedIn) {
            await storageHelper.setItem(STORAGE_KEYS.BIOMETRICS_CREDENTIALS, {
              email: email.trim(),
              password: password,
            });
          }

          if (userProfile.isSetupComplete) {
            navigation.replace(ROUTES.DRAWER);
          } else {
            navigation.replace(ROUTES.PROFILE_SETUP);
          }
        }
      } else {
        setAlertTitle('Sign In Failed');
        setAlertMessage(response?.message || 'Invalid credentials or login failed.');
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to sign in. Please check your network connection.';
      setAlertTitle('Sign In Error');
      setAlertMessage(serverMessage);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableBiometrics = async () => {
    setBiometricConsentVisible(false);
    if (tempProfileData) {
      await storageHelper.setItem(STORAGE_KEYS.BIOMETRICS_ENABLED, true);
      await storageHelper.setItem(STORAGE_KEYS.BIOMETRICS_CREDENTIALS, {
        email: tempProfileData.email,
        password: tempPlainPassword,
      });
      if (tempProfileData.isSetupComplete) {
        navigation.replace(ROUTES.DRAWER);
      } else {
        navigation.replace(ROUTES.PROFILE_SETUP);
      }
    }
  };

  const handleCancelBiometrics = () => {
    setBiometricConsentVisible(false);
    if (tempProfileData) {
      if (tempProfileData.isSetupComplete) {
        navigation.replace(ROUTES.DRAWER);
      } else {
        navigation.replace(ROUTES.PROFILE_SETUP);
      }
    }
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#eef2ff', '#e0e7ff']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader title="Sign In" />
        
        {/* Background glowing rings */}
        <View style={styles.blurRing1} />
        <View style={styles.blurRing2} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Brand Logo Section */}
            <View style={styles.brandContainer}>
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                style={styles.logoBadge}
              >
                <Text style={styles.logoText}>🏃‍♂️</Text>
              </LinearGradient>
              <Text style={styles.brandTitle}>
                Move<Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Hub</Text>
              </Text>
              <Text style={styles.brandTagline}>AI-Powered Bio-Computational Pacing</Text>
            </View>
            {/* Glassmorphic Login Card */}
            <View style={styles.card}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>
                Sign in to sync your biometrics and pacing targets
              </Text>

              {/* Input Forms */}
              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View style={[
                  styles.inputWrapper, 
                  emailFocused && styles.inputWrapperFocused,
                  emailError !== '' && styles.inputWrapperError
                ]}>
                  <Text style={[styles.inputIcon, emailFocused && { color: theme.colors.primary }]}>✉️</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.colors.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onChangeText={val => {
                      setEmail(val);
                      setEmailError('');
                    }}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
                {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}

                <Text style={[styles.inputLabel, { marginTop: 18 }]}>
                  PASSWORD
                </Text>
                <View style={[
                  styles.inputWrapper, 
                  passwordFocused && styles.inputWrapperFocused,
                  passwordError !== '' && styles.inputWrapperError
                ]}>
                  <Text style={[styles.inputIcon, passwordFocused && { color: theme.colors.primary }]}>🔒</Text>
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.textInput}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.textLight}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChangeText={val => {
                      setPassword(val);
                      setPasswordError('');
                    }}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.eyeContainer}>
                      <Text style={styles.eyeText}>👁️</Text>
                      {!showPassword && <View style={styles.eyeSlash} />}
                    </View>
                  </TouchableOpacity>
                </View>
                {passwordError !== '' && <Text style={styles.errorText}>{passwordError}</Text>}
              </View>

              {/* Gradient Submit Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
                style={styles.submitBtn}
              >
                <LinearGradient
                  colors={['#6366f1', '#4f46e5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Biometric Button just below the Sign In button */}
              {biometricsAvailable && hasBiometricsEnabled && (
                <TouchableOpacity
                  onPress={handleBiometricLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                  style={styles.biometricBtn}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f8fafc']}
                    style={styles.biometricGradient}
                  >
                    <Text style={styles.biometricIcon}>🧬</Text>
                    <Text style={styles.biometricText}>Sign In with {biometricsTypeLabel || 'Biometrics'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Link to Sign Up */}
              <View style={styles.footerLinkContainer}>
                <Text style={styles.footerLinkLabel}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.SIGNUP as any)}>
                  <Text style={styles.footerLinkAction}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <BiometricConsentModal
        visible={biometricConsentVisible}
        biometricTypeLabel={biometricsTypeLabel}
        onEnable={handleEnableBiometrics}
        onCancel={handleCancelBiometrics}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  blurRing1: {
    position: 'absolute',
    top: '5%',
    right: '-15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    zIndex: -1,
  },
  blurRing2: {
    position: 'absolute',
    bottom: '15%',
    left: '-15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    zIndex: -1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    fontSize: 38,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.colors.text,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800' as any,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: 16,
  },
  formContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800' as any,
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#ffffff',
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(244, 63, 94, 0.02)',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    color: theme.colors.textLight,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  footerLinkLabel: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
  },
  footerLinkAction: {
    fontSize: 13.5,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  eyeBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 16,
  },
  eyeSlash: {
    position: 'absolute',
    width: 18,
    height: 1.8,
    backgroundColor: '#64748b', // slate-500
    transform: [{ rotate: '-45deg' }],
  },
  biometricBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  biometricGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  biometricText: {
    color: '#475569', // slate-600
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
