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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';
import { ROUTES } from '../../constants/routes';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { apiService } from '../../services/api';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Inputs
  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Alert modal states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);

  // Refs for sequential focus
  const passwordInputRef = useRef<any>(null);
  const confirmPasswordInputRef = useRef<any>(null);

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params?.email]);

  const handleForgotPassword = async () => {
    let hasError = false;

    // Reset errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

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
      setPasswordError('New password is required.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your new password.');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const response = await apiService.forgotPassword({
        email: email.trim(),
        password: password,
        confirmPassword: confirmPassword,
      });

      console.log('[ForgotPasswordScreen] Response:', JSON.stringify(response, null, 2));

      if (response && (response.status === 'Success' || response.status === 'success' || response.statusCode === 200)) {
        setIsSuccessAlert(true);
        setAlertTitle('Password Reset Successful! 🎉');
        setAlertMessage(response?.message || 'Your password has been updated successfully. You can now sign in with your new password.');
        setAlertVisible(true);
      } else {
        setIsSuccessAlert(false);
        setAlertTitle('Reset Failed');
        setAlertMessage(response?.message || 'Failed to update password. Please check your details.');
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('[ForgotPasswordScreen] Error:', err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to reset password. Please check your network connection.';
      setIsSuccessAlert(false);
      setAlertTitle('Reset Error');
      setAlertMessage(serverMessage);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    if (isSuccessAlert) {
      navigation.navigate(ROUTES.LOGIN as any);
    }
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#eef2ff', '#e0e7ff']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader title="Forgot Password" showBackButton />

        {/* Ambient Glowing Background Elements */}
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
            {/* Top Brand / Feature Icon Header */}
            <View style={styles.brandContainer}>
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                style={styles.logoBadge}
              >
                <Text style={styles.logoText}>🔑</Text>
              </LinearGradient>
              <Text style={styles.brandTitle}>
                Move<Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Hub</Text>
              </Text>
              <Text style={styles.brandTagline}>Account Recovery & Password Reset</Text>
            </View>

            {/* Glassmorphic Card */}
            <View style={styles.card}>
              <Text style={styles.welcomeText}>Forgot Password</Text>
              <Text style={styles.subtitleText}>
                Enter your registered email and set a new password to recover access to your account
              </Text>

              {generalError !== '' && (
                <View style={styles.generalErrorBanner}>
                  <Text style={styles.generalErrorText}>⚠️ {generalError}</Text>
                </View>
              )}

              {/* Form Input Fields */}
              <View style={styles.formContainer}>
                {/* Email Address */}
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    emailFocused && styles.inputWrapperFocused,
                    emailError !== '' && styles.inputWrapperError,
                  ]}
                >
                  <Text style={[styles.inputIcon, emailFocused && { color: theme.colors.primary }]}>
                    ✉️
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your registered email"
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

                {/* New Password */}
                <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                  NEW PASSWORD
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    passwordFocused && styles.inputWrapperFocused,
                    passwordError !== '' && styles.inputWrapperError,
                  ]}
                >
                  <Text style={[styles.inputIcon, passwordFocused && { color: theme.colors.primary }]}>
                    🔒
                  </Text>
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.textInput}
                    placeholder="Enter new password"
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
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                    blurOnSubmit={false}
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

                {/* Confirm New Password */}
                <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                  CONFIRM NEW PASSWORD
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    confirmPasswordFocused && styles.inputWrapperFocused,
                    confirmPasswordError !== '' && styles.inputWrapperError,
                  ]}
                >
                  <Text style={[styles.inputIcon, confirmPasswordFocused && { color: theme.colors.primary }]}>
                    🔒
                  </Text>
                  <TextInput
                    ref={confirmPasswordInputRef}
                    style={styles.textInput}
                    placeholder="Confirm new password"
                    placeholderTextColor={theme.colors.textLight}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={confirmPassword}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    onChangeText={val => {
                      setConfirmPassword(val);
                      setConfirmPasswordError('');
                    }}
                    returnKeyType="go"
                    onSubmitEditing={handleForgotPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.eyeContainer}>
                      <Text style={styles.eyeText}>👁️</Text>
                      {!showConfirmPassword && <View style={styles.eyeSlash} />}
                    </View>
                  </TouchableOpacity>
                </View>
                {confirmPasswordError !== '' && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
              </View>

              {/* Submit Gradient Button */}
              <TouchableOpacity
                onPress={handleForgotPassword}
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
                    <Text style={styles.submitBtnText}>Reset Password</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Link back to Sign In */}
              <View style={styles.footerLinkContainer}>
                <Text style={styles.footerLinkLabel}>Remember your password? </Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN as any)}>
                  <Text style={styles.footerLinkAction}>Sign In</Text>
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
        type={isSuccessAlert ? 'success' : 'error'}
        buttonText={isSuccessAlert ? 'Sign In Now' : 'Dismiss'}
        icon={isSuccessAlert ? '🎉' : '⚠️'}
        onClose={handleAlertClose}
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
    marginTop: 10,
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
    fontSize: 34,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: theme.colors.text,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
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
    width: '100%',
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
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  generalErrorBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    marginBottom: 16,
    width: '100%',
  },
  generalErrorText: {
    fontSize: 12.5,
    color: theme.colors.error,
    textAlign: 'center',
    fontWeight: '600',
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
    alignSelf: 'flex-start',
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
});

export default ForgotPasswordScreen;
