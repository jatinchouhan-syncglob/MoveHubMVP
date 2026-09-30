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

  // Multi-step Flow: 'otp' -> 'reset'
  const [currentStep, setCurrentStep] = useState<'otp' | 'reset'>('otp');

  // Step 1: Mobile OTP States
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Step 2: Reset Password States (Email / Mobile + Password)
  const [accountIdentifier, setAccountIdentifier] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [identifierFocused, setIdentifierFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // General Loading & Alert States
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('error');
  const [alertIcon, setAlertIcon] = useState<string | undefined>(undefined);
  const [shouldNavigateOnClose, setShouldNavigateOnClose] = useState(false);

  // Refs for focus management
  const otpInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);
  const confirmPasswordInputRef = useRef<any>(null);

  useEffect(() => {
    if (route.params?.email) {
      setAccountIdentifier(route.params.email);
    }
  }, [route.params?.email]);

  // Resend Countdown Timer
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

  // ================= Step 1: Send OTP Handler =================
  const handleSendForgotPasswordOtp = async () => {
    setMobileError('');
    setGeneralError('');
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
      const response = await apiService.sendForgotPasswordOtp(cleanMobile);
      console.log('[ForgotPasswordScreen] sendForgotPasswordOtp Response:', JSON.stringify(response, null, 2));

      if (response && (response.status === 'Success' || response.status === 'success' || response.statusCode === 200)) {
        setOtpSent(true);
        setResendTimer(30);
        setCanResend(false);
        setAlertType('success');
        setAlertIcon('✅');
        setAlertTitle('OTP Sent! 📲');
        setAlertMessage(response?.message || `A verification code has been sent to +91 ${cleanMobile}.`);
        setShouldNavigateOnClose(false);
        setAlertVisible(true);
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 600);
      } else {
        setAlertType('error');
        setAlertIcon('⚠️');
        setAlertTitle('Failed to Send OTP');
        setAlertMessage(response?.message || 'Could not send verification OTP. Please try again.');
        setShouldNavigateOnClose(false);
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('sendForgotPasswordOtp error:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to send OTP. Please check your network connection.';
      setAlertType('error');
      setAlertIcon('⚠️');
      setAlertTitle('OTP Error');
      setAlertMessage(serverMessage);
      setShouldNavigateOnClose(false);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // ================= Step 1: Verify OTP Handler =================
  const handleVerifyForgotPasswordOtp = async () => {
    setOtpError('');
    setGeneralError('');
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
      const response = await apiService.verifyForgotPasswordOtp({
        mobile: cleanMobile,
        otp: cleanOtp,
      });

      console.log('[ForgotPasswordScreen] verifyForgotPasswordOtp Response:', JSON.stringify(response, null, 2));

      if (response && (response.status === 'Success' || response.status === 'success' || response.statusCode === 200)) {
        const receivedToken = response.data?.resetToken || '';
        setResetToken(receivedToken);

        // Pre-fill identifier if currently empty
        if (!accountIdentifier) {
          setAccountIdentifier(cleanMobile);
        }

        // Transition to Step 2 (Reset Password Form)
        setCurrentStep('reset');
        setAlertType('success');
        setAlertIcon('✅');
        setAlertTitle('Identity Verified! 🎉');
        setAlertMessage(response?.message || 'OTP verified successfully. You can now set your new password.');
        setShouldNavigateOnClose(false);
        setAlertVisible(true);
      } else {
        setAlertType('error');
        setAlertIcon('⚠️');
        setAlertTitle('Verification Failed');
        setAlertMessage(response?.message || 'Invalid or expired OTP. Please try again.');
        setShouldNavigateOnClose(false);
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('verifyForgotPasswordOtp error:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to verify OTP. Please try again.';
      setAlertType('error');
      setAlertIcon('⚠️');
      setAlertTitle('Verification Error');
      setAlertMessage(serverMessage);
      setShouldNavigateOnClose(false);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // ================= Step 2: Reset Password Handler =================
  const handleResetPassword = async () => {
    let hasError = false;
    setIdentifierError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    const cleanIdentifier = accountIdentifier.trim();
    if (!cleanIdentifier) {
      setIdentifierError('Email address or mobile number is required.');
      hasError = true;
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
      const cleanMobile = mobile.replace(/[^0-9]/g, '');
      const response = await apiService.forgotPassword({
        email: cleanIdentifier,
        mobile: cleanMobile || undefined,
        password: password,
        confirmPassword: confirmPassword,
        resetToken: resetToken || undefined,
      });

      console.log('[ForgotPasswordScreen] Password Reset Response:', JSON.stringify(response, null, 2));

      if (response && (response.status === 'Success' || response.status === 'success' || response.statusCode === 200)) {
        setAlertType('success');
        setAlertIcon('🎉');
        setAlertTitle('Password Reset Successful! 🎉');
        setAlertMessage(response?.message || 'Your password has been updated successfully. You can now sign in with your new password.');
        setShouldNavigateOnClose(true);
        setAlertVisible(true);
      } else {
        setAlertType('error');
        setAlertIcon('⚠️');
        setAlertTitle('Reset Failed');
        setAlertMessage(response?.message || 'Failed to update password. Please check your details.');
        setShouldNavigateOnClose(false);
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('[ForgotPasswordScreen] Reset Error:', err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to reset password. Please check your network connection.';
      setAlertType('error');
      setAlertIcon('⚠️');
      setAlertTitle('Reset Error');
      setAlertMessage(serverMessage);
      setShouldNavigateOnClose(false);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    if (shouldNavigateOnClose) {
      navigation.navigate(ROUTES.LOGIN as any);
    }
  };

  const handleHeaderBack = () => {
    if (currentStep === 'reset') {
      setCurrentStep('otp');
    } else {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#eef2ff', '#e0e7ff']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader
          title="Account Recovery"
          showBackButton
          onBackPress={handleHeaderBack}
        />

        {/* Ambient Glowing Background Elements */}
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
            {/* Top Brand Header */}
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
              <Text style={styles.brandTagline}>Reset & Secure Your Password</Text>
            </View>

            {/* Step Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.stepItem, currentStep === 'otp' && styles.stepItemActive]}>
                <View style={[styles.stepCircle, (currentStep === 'otp' || currentStep === 'reset') && styles.stepCircleActive]}>
                  <Text style={styles.stepCircleText}>{currentStep === 'reset' ? '✓' : '1'}</Text>
                </View>
                <Text style={[styles.stepLabel, currentStep === 'otp' && styles.stepLabelActive]}>Verify OTP</Text>
              </View>

              <View style={[styles.stepLine, currentStep === 'reset' && styles.stepLineActive]} />

              <View style={[styles.stepItem, currentStep === 'reset' && styles.stepItemActive]}>
                <View style={[styles.stepCircle, currentStep === 'reset' && styles.stepCircleActive]}>
                  <Text style={styles.stepCircleText}>2</Text>
                </View>
                <Text style={[styles.stepLabel, currentStep === 'reset' && styles.stepLabelActive]}>Set Password</Text>
              </View>
            </View>

            {/* Glassmorphic Card */}
            <View style={styles.card}>
              {generalError !== '' && (
                <View style={styles.generalErrorBanner}>
                  <Text style={styles.generalErrorText}>⚠️ {generalError}</Text>
                </View>
              )}

              {/* ================= STEP 1: MOBILE OTP VERIFICATION ================= */}
              {currentStep === 'otp' && (
                <View style={styles.formContainer}>
                  <Text style={styles.welcomeText}>Verify Mobile OTP</Text>
                  <Text style={styles.subtitleText}>
                    Enter your registered mobile number to receive a 6-digit verification code.
                  </Text>

                  {!otpSent ? (
                    <>
                      <Text style={styles.inputLabel}>REGISTERED MOBILE NUMBER</Text>
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
                          onSubmitEditing={handleSendForgotPasswordOtp}
                        />
                      </View>
                      {mobileError !== '' && <Text style={styles.errorText}>{mobileError}</Text>}

                      <TouchableOpacity
                        onPress={handleSendForgotPasswordOtp}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={[styles.submitBtn, { marginTop: 22 }]}
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
                            <Text style={styles.submitBtnText}>Send Verification OTP</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
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
                          onSubmitEditing={handleVerifyForgotPasswordOtp}
                        />
                      </View>
                      {otpError !== '' && <Text style={styles.errorText}>{otpError}</Text>}

                      {/* Resend Timer */}
                      <View style={styles.resendOtpRow}>
                        {canResend ? (
                          <TouchableOpacity onPress={handleSendForgotPasswordOtp} disabled={loading}>
                            <Text style={styles.resendOtpAction}>Resend OTP</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.resendOtpTimer}>
                            Resend OTP in <Text style={{ fontWeight: '700', color: theme.colors.primary }}>{resendTimer}s</Text>
                          </Text>
                        )}
                      </View>

                      {/* Verify Button */}
                      <TouchableOpacity
                        onPress={handleVerifyForgotPasswordOtp}
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
                            <Text style={styles.submitBtnText}>Verify OTP & Continue</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {/* ================= STEP 2: SET NEW PASSWORD FORM ================= */}
              {currentStep === 'reset' && (
                <View style={styles.formContainer}>
                  <Text style={styles.welcomeText}>Set New Password</Text>
                  <Text style={styles.subtitleText}>
                    Your OTP is verified. Enter your registered email or phone and create your new password.
                  </Text>

                  {/* Verified Badge */}
                  {mobile !== '' && (
                    <View style={styles.verifiedBadgeRow}>
                      <Text style={styles.verifiedBadgeIcon}>✅</Text>
                      <Text style={styles.verifiedBadgeText}>
                        Verified Mobile: <Text style={{ fontWeight: '700' }}>+91 {mobile}</Text>
                      </Text>
                    </View>
                  )}

                  {/* Email / Mobile Identifier Input */}
                  <Text style={styles.inputLabel}>EMAIL OR PHONE NUMBER</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      identifierFocused && styles.inputWrapperFocused,
                      identifierError !== '' && styles.inputWrapperError,
                    ]}
                  >
                    <Text style={[styles.inputIcon, identifierFocused && { color: theme.colors.primary }]}>
                      👤
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter registered email or phone"
                      placeholderTextColor={theme.colors.textLight}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={accountIdentifier}
                      onFocus={() => setIdentifierFocused(true)}
                      onBlur={() => setIdentifierFocused(false)}
                      onChangeText={val => {
                        setAccountIdentifier(val);
                        setIdentifierError('');
                      }}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                  {identifierError !== '' && <Text style={styles.errorText}>{identifierError}</Text>}

                  {/* New Password Input */}
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

                  {/* Confirm Password Input */}
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
                      onSubmitEditing={handleResetPassword}
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

                  {/* Reset Password Button */}
                  <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={loading}
                    activeOpacity={0.8}
                    style={[styles.submitBtn, { marginTop: 24 }]}
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
                        <Text style={styles.submitBtnText}>Reset Password & Sign In</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

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
        type={alertType}
        buttonText={alertType === 'success' ? (shouldNavigateOnClose ? 'Sign In Now' : 'OK') : 'Dismiss'}
        icon={alertIcon || (alertType === 'success' ? '✅' : '⚠️')}
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
    bottom: '10%',
    left: '-15%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    zIndex: -1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItemActive: {
    opacity: 1,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  stepCircleActive: {
    backgroundColor: '#6366f1',
  },
  stepCircleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94a3b8',
  },
  stepLabelActive: {
    color: '#334155',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#6366f1',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 18,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 18,
  },
  verifiedBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  verifiedBadgeText: {
    fontSize: 13,
    color: '#065f46',
  },
  generalErrorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  generalErrorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#ffffff',
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  countryCodeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  otpTextInput: {
    letterSpacing: 8,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  eyeBtn: {
    padding: 6,
  },
  eyeContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 16,
  },
  eyeSlash: {
    position: 'absolute',
    width: 18,
    height: 2,
    backgroundColor: '#ef4444',
    transform: [{ rotate: '45deg' }],
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 5,
    marginLeft: 4,
  },
  mobileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  mobileInfoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  editNumberBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editNumberText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  resendOtpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  resendOtpTimer: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  resendOtpAction: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 18,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
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
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  footerLinkLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  footerLinkAction: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

export default ForgotPasswordScreen;
