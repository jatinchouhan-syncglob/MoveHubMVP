import React, { useState, useRef, useEffect } from 'react';
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
import { apiService, prefetchStepsLogsData } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import { syncHealthConnectAnalytics } from '../../services/healthConnect';
import ReactNativeBiometrics from 'react-native-biometrics';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Active Tab Mode ('email' or 'otp')
  const [authMode, setAuthMode] = useState<'email' | 'otp'>('email');

  // Email/Password fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordInputRef = useRef<any>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Mobile OTP fields
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputRef = useRef<any>(null);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');

  // General Loading & Alert States
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');

  // Biometrics States
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsTypeLabel, setBiometricsTypeLabel] = useState('');
  const [hasBiometricsEnabled, setHasBiometricsEnabled] = useState(false);
  const [biometricConsentVisible, setBiometricConsentVisible] = useState(false);
  const [tempProfileData, setTempProfileData] = useState<UserProfile | null>(null);
  const [tempPlainPassword, setTempPlainPassword] = useState('');

  // Check biometric availability on screen mount
  useEffect(() => {
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

    const timer = setTimeout(() => {
      checkBiometricAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // OTP Resend Countdown Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, resendTimer]);

  // Biometric Login Handler
  const handleBiometricLogin = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: `Authenticate to sign in using ${biometricsTypeLabel || 'Biometrics'}`,
      });

      if (success) {
        const savedCredentials = await storageHelper.getItem<{ email: string; password: string }>(
          STORAGE_KEYS.BIOMETRICS_CREDENTIALS
        );

        if (savedCredentials && savedCredentials.email && savedCredentials.password) {
          setLoading(true);
          const response = await apiService.signin({
            email: savedCredentials.email,
            password: savedCredentials.password,
          });

          if (response && response.status === 'Success') {
            const userData = response.data || {};
            const authToken = userData.token || response.token;
            if (authToken) {
              await storageHelper.setItem(STORAGE_KEYS.TOKEN, authToken);
            }
            const userProfile: UserProfile = {
              uhid: userData.uhid || 'SAUSHA9775',
              name: userData.name || (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'Saurabh Sharma'),
              age: userData.age || 30,
              weight: userData.weight || 70,
              height: userData.height || 170,
              calorieGoal: userData.calorieGoal || 2400,
              isSetupComplete: userData.isSetupComplete !== undefined ? userData.isSetupComplete : true,
              email: userData.email || savedCredentials.email,
              token: authToken,
            };
            await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, userProfile);
            syncHealthConnectAnalytics().catch(() => {});
            prefetchStepsLogsData(userProfile.uhid).catch(() => {});

            if (userProfile.isSetupComplete) {
              navigation.replace(ROUTES.DRAWER);
            } else {
              navigation.replace(ROUTES.PROFILE_SETUP);
            }
          } else {
            setAlertType('error');
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

  // Email/Password Login Handler
  const handleEmailLogin = async () => {
    let hasError = false;
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

      console.log('[LoginScreen] Signin API Response:', JSON.stringify(response, null, 2));

      if (response && response.status === 'Success') {
        const userData = response.data || {};
        const authToken = userData.token || response.token;
        if (authToken) {
          await storageHelper.setItem(STORAGE_KEYS.TOKEN, authToken);
        }

        const userProfile: UserProfile = {
          uhid: userData.uhid || 'SAUSHA9775',
          name: userData.name || (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'Saurabh Sharma'),
          age: userData.age || 30,
          weight: userData.weight || 70,
          height: userData.height || 170,
          calorieGoal: userData.calorieGoal || 2400,
          isSetupComplete: userData.isSetupComplete !== undefined ? userData.isSetupComplete : true,
          email: userData.email || email.trim(),
          token: authToken,
        };
        await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, userProfile);
        syncHealthConnectAnalytics().catch(() => {});
        prefetchStepsLogsData(userProfile.uhid).catch(() => {});

        const isBiometricOptedIn = await storageHelper.getItem<boolean>(STORAGE_KEYS.BIOMETRICS_ENABLED);
        if (biometricsAvailable && !isBiometricOptedIn) {
          setTempProfileData(userProfile);
          setTempPlainPassword(password);
          setBiometricConsentVisible(true);
        } else {
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
        setAlertType('error');
        setAlertTitle('Sign In Failed');
        setAlertMessage(response?.message || 'Invalid credentials or login failed.');
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to sign in. Please check your network connection.';
      setAlertType('error');
      setAlertTitle('Sign In Error');
      setAlertMessage(serverMessage);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Send Login OTP Handler
  const handleSendLoginOtp = async () => {
    setMobileError('');
    const cleanMobile = mobile.replace(/[^0-9]/g, '');

    if (!cleanMobile) {
      setMobileError('Mobile number is required.');
      return;
    }
    if (cleanMobile.length < 10) {
      setMobileError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.sendLoginOtp(cleanMobile);
      console.log('[LoginScreen] sendLoginOtp Response:', JSON.stringify(response, null, 2));

      if (response && (response.status === 'Success' || response.status === 'success' || response.statusCode === 200)) {
        setOtpSent(true);
        setResendTimer(30);
        setCanResend(false);
        setAlertType('success');
        setAlertTitle('OTP Sent! 📲');
        setAlertMessage(response?.message || `A 6-digit verification code has been sent to +91 ${cleanMobile}.`);
        setAlertVisible(true);
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 600);
      } else {
        setAlertType('error');
        setAlertTitle('Failed to Send OTP');
        setAlertMessage(response?.message || 'Could not send OTP. Please check the mobile number.');
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('sendLoginOtp error:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to send OTP. Please check your network connection.';
      setAlertType('error');
      setAlertTitle('OTP Error');
      setAlertMessage(serverMessage);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Resend Login OTP Handler
  const handleResendLoginOtp = async () => {
    if (!canResend) return;
    await handleSendLoginOtp();
  };

  // Validate Login OTP Handler
  const handleValidateLoginOtp = async () => {
    setOtpError('');
    const cleanOtp = otp.trim();
    const cleanMobile = mobile.replace(/[^0-9]/g, '');

    if (!cleanOtp) {
      setOtpError('Please enter the OTP.');
      return;
    }
    if (cleanOtp.length < 4) {
      setOtpError('Please enter a valid OTP code.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.validateLoginOtp({
        mobile: cleanMobile,
        otp: cleanOtp,
      });

      console.log('[LoginScreen] validateLoginOtp Response:', JSON.stringify(response, null, 2));

      if (response && (response.status === 'Success' || response.status === 'success' || response.statusCode === 200)) {
        const userData = response.data || {};
        const authToken = userData.token || response.token;
        if (authToken) {
          await storageHelper.setItem(STORAGE_KEYS.TOKEN, authToken);
        }

        const userProfile: UserProfile = {
          uhid: userData.uhid || 'JATCHO5525',
          name: userData.name || (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'User'),
          age: userData.age || 30,
          weight: userData.weight || 70,
          height: userData.height || 170,
          calorieGoal: userData.calorieGoal || 2400,
          isSetupComplete: userData.isSetupComplete !== undefined ? userData.isSetupComplete : true,
          email: userData.email || '',
          token: authToken,
        };
        await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, userProfile);
        syncHealthConnectAnalytics().catch(() => {});
        prefetchStepsLogsData(userProfile.uhid).catch(() => {});

        if (userProfile.isSetupComplete) {
          navigation.replace(ROUTES.DRAWER);
        } else {
          navigation.replace(ROUTES.PROFILE_SETUP);
        }
      } else {
        setAlertType('error');
        setAlertTitle('Verification Failed');
        setAlertMessage(response?.message || 'Invalid or expired OTP. Please try again.');
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('validateLoginOtp error:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to verify OTP. Please try again.';
      setAlertType('error');
      setAlertTitle('Verification Error');
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
        email: tempProfileData.email || '',
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

              {/* Segmented Mode Switch Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, authMode === 'email' && styles.tabButtonActive]}
                  onPress={() => {
                    setAuthMode('email');
                    setMobileError('');
                    setOtpError('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabButtonText, authMode === 'email' && styles.tabButtonTextActive]}>
                    ✉️ Email
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, authMode === 'otp' && styles.tabButtonActive]}
                  onPress={() => {
                    setAuthMode('otp');
                    setEmailError('');
                    setPasswordError('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabButtonText, authMode === 'otp' && styles.tabButtonTextActive]}>
                    📱 Mobile OTP
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ================= EMAIL & PASSWORD FORM ================= */}
              {authMode === 'email' && (
                <View style={styles.formContainer}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      emailFocused && styles.inputWrapperFocused,
                      emailError !== '' && styles.inputWrapperError,
                    ]}
                  >
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

                  <Text style={[styles.inputLabel, { marginTop: 18 }]}>PASSWORD</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      passwordFocused && styles.inputWrapperFocused,
                      passwordError !== '' && styles.inputWrapperError,
                    ]}
                  >
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
                      onSubmitEditing={handleEmailLogin}
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

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD as any, { email: email.trim() })}
                    style={styles.forgotPasswordContainer}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Email Sign In Button */}
                  <TouchableOpacity
                    onPress={handleEmailLogin}
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
                </View>
              )}

              {/* ================= MOBILE OTP FORM ================= */}
              {authMode === 'otp' && (
                <View style={styles.formContainer}>
                  {!otpSent ? (
                    <>
                      <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          mobileFocused && styles.inputWrapperFocused,
                          mobileError !== '' && styles.inputWrapperError,
                        ]}
                      >
                        <View style={styles.countryCodeBadge}>
                          <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                        </View>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter 10-digit mobile number"
                          placeholderTextColor={theme.colors.textLight}
                          keyboardType="phone-pad"
                          maxLength={10}
                          value={mobile}
                          onFocus={() => setMobileFocused(true)}
                          onBlur={() => setMobileFocused(false)}
                          onChangeText={val => {
                            setMobile(val.replace(/[^0-9]/g, ''));
                            setMobileError('');
                          }}
                          returnKeyType="go"
                          onSubmitEditing={handleSendLoginOtp}
                        />
                      </View>
                      {mobileError !== '' && <Text style={styles.errorText}>{mobileError}</Text>}

                      <TouchableOpacity
                        onPress={handleSendLoginOtp}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={[styles.submitBtn, { marginTop: 20 }]}
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
                            <Text style={styles.submitBtnText}>Send OTP</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {/* Mobile Number Info & Edit */}
                      <View style={styles.mobileInfoRow}>
                        <Text style={styles.mobileInfoText}>
                          OTP sent to <Text style={{ fontWeight: '700', color: theme.colors.text }}>+91 {mobile}</Text>
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setOtpSent(false);
                            setOtp('');
                            setOtpError('');
                          }}
                          style={styles.editNumberBtn}
                        >
                          <Text style={styles.editNumberText}>Change</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.inputLabel, { marginTop: 12 }]}>ENTER 6-DIGIT OTP</Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          otpFocused && styles.inputWrapperFocused,
                          otpError !== '' && styles.inputWrapperError,
                        ]}
                      >
                        <Text style={[styles.inputIcon, otpFocused && { color: theme.colors.primary }]}>🔢</Text>
                        <TextInput
                          ref={otpInputRef}
                          style={[styles.textInput, styles.otpTextInput]}
                          placeholder="• • • • • •"
                          placeholderTextColor={theme.colors.textLight}
                          keyboardType="number-pad"
                          maxLength={6}
                          value={otp}
                          onFocus={() => setOtpFocused(true)}
                          onBlur={() => setOtpFocused(false)}
                          onChangeText={val => {
                            setOtp(val.replace(/[^0-9]/g, ''));
                            setOtpError('');
                          }}
                          returnKeyType="go"
                          onSubmitEditing={handleValidateLoginOtp}
                        />
                      </View>
                      {otpError !== '' && <Text style={styles.errorText}>{otpError}</Text>}

                      {/* Resend OTP Timer / Button */}
                      <View style={styles.resendOtpRow}>
                        {canResend ? (
                          <TouchableOpacity onPress={handleResendLoginOtp} disabled={loading}>
                            <Text style={styles.resendOtpAction}>Resend OTP</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.resendOtpTimer}>
                            Resend OTP in <Text style={{ fontWeight: '700', color: theme.colors.primary }}>{resendTimer}s</Text>
                          </Text>
                        )}
                      </View>

                      {/* Verify & Sign In Button */}
                      <TouchableOpacity
                        onPress={handleValidateLoginOtp}
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
                            <Text style={styles.submitBtnText}>Verify & Sign In</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {/* Biometric Button */}
              {authMode === 'email' && biometricsAvailable && hasBiometricsEnabled && (
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
        type={alertType}
        buttonText={alertType === 'success' ? 'OK' : 'Dismiss'}
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
    marginBottom: 20,
  },
  logoBadge: {
    width: 72,
    height: 72,
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
    fontSize: 36,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.colors.text,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    marginTop: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    padding: 22,
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
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  formContainer: {
    width: '100%',
    marginBottom: 10,
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
  countryCodeBadge: {
    paddingRight: 10,
    marginRight: 8,
    borderRightWidth: 1.5,
    borderRightColor: '#e2e8f0',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
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
  otpTextInput: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 6,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4f46e5',
  },
  mobileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  mobileInfoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  editNumberBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editNumberText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  resendOtpRow: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 4,
  },
  resendOtpAction: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  resendOtpTimer: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
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
    backgroundColor: '#64748b',
    transform: [{ rotate: '-45deg' }],
  },
  biometricBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    marginTop: 12,
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
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
