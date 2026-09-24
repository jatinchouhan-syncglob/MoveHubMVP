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
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Inputs
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [oldPasswordFocused, setOldPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Success alert modal
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);

  // Refs for sequential field focus
  const oldPasswordInputRef = useRef<any>(null);
  const newPasswordInputRef = useRef<any>(null);
  const confirmPasswordInputRef = useRef<any>(null);

  const handleResetPassword = async () => {
    let hasError = false;

    // Reset errors
    setEmailError('');
    setOldPasswordError('');
    setNewPasswordError('');
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

    if (!oldPassword.trim()) {
      setOldPasswordError('Current password is required.');
      hasError = true;
    }

    if (!newPassword.trim()) {
      setNewPasswordError('New password is required.');
      hasError = true;
    } else if (newPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters.');
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your new password.');
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const response = await apiService.resetPassword({
        email: email.trim(),
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      console.log('[ResetPasswordScreen] Reset Password API Response:', JSON.stringify(response, null, 2));

      if (response && response.status === 'Success') {
        setIsSuccessAlert(true);
        setAlertTitle('Password Reset Successful! 🎉');
        setAlertMessage('Your password has been updated successfully.');
        setAlertVisible(true);
      } else {
        setIsSuccessAlert(false);
        setAlertTitle('Reset Failed');
        setAlertMessage(response?.message || 'Failed to reset password. Please check your credentials.');
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to reset password. Please check your current password and network connection.';
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
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#eef2ff', '#e0e7ff']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader title="Reset Password" showBackButton />

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
                <Text style={styles.logoText}>🔐</Text>
              </LinearGradient>
              <Text style={styles.brandTitle}>
                Move<Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Hub</Text>
              </Text>
              <Text style={styles.brandTagline}>Security & Password Management</Text>
            </View>

            {/* Glassmorphic Card */}
            <View style={styles.card}>
              <Text style={styles.welcomeText}>Update Password</Text>
              <Text style={styles.subtitleText}>
                Enter your registered email and current password to create a new secure password
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
                    onSubmitEditing={() => oldPasswordInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
                {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}

                {/* Current Password */}
                <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                  CURRENT PASSWORD
                </Text>
                <View style={[
                  styles.inputWrapper,
                  oldPasswordFocused && styles.inputWrapperFocused,
                  oldPasswordError !== '' && styles.inputWrapperError
                ]}>
                  <Text style={[styles.inputIcon, oldPasswordFocused && { color: theme.colors.primary }]}>🔒</Text>
                  <TextInput
                    ref={oldPasswordInputRef}
                    style={styles.textInput}
                    placeholder="Enter old password"
                    placeholderTextColor={theme.colors.textLight}
                    secureTextEntry={!showOldPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={oldPassword}
                    onFocus={() => setOldPasswordFocused(true)}
                    onBlur={() => setOldPasswordFocused(false)}
                    onChangeText={val => {
                      setOldPassword(val);
                      setOldPasswordError('');
                    }}
                    returnKeyType="next"
                    onSubmitEditing={() => newPasswordInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.eyeContainer}>
                      <Text style={styles.eyeText}>👁️</Text>
                      {!showOldPassword && <View style={styles.eyeSlash} />}
                    </View>
                  </TouchableOpacity>
                </View>
                {oldPasswordError !== '' && <Text style={styles.errorText}>{oldPasswordError}</Text>}

                {/* New Password */}
                <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                  NEW PASSWORD
                </Text>
                <View style={[
                  styles.inputWrapper,
                  newPasswordFocused && styles.inputWrapperFocused,
                  newPasswordError !== '' && styles.inputWrapperError
                ]}>
                  <Text style={[styles.inputIcon, newPasswordFocused && { color: theme.colors.primary }]}>🔒</Text>
                  <TextInput
                    ref={newPasswordInputRef}
                    style={styles.textInput}
                    placeholder="Enter new password"
                    placeholderTextColor={theme.colors.textLight}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={newPassword}
                    onFocus={() => setNewPasswordFocused(true)}
                    onBlur={() => setNewPasswordFocused(false)}
                    onChangeText={val => {
                      setNewPassword(val);
                      setNewPasswordError('');
                    }}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.eyeContainer}>
                      <Text style={styles.eyeText}>👁️</Text>
                      {!showNewPassword && <View style={styles.eyeSlash} />}
                    </View>
                  </TouchableOpacity>
                </View>
                {newPasswordError !== '' && <Text style={styles.errorText}>{newPasswordError}</Text>}

                {/* Confirm New Password */}
                <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                  CONFIRM NEW PASSWORD
                </Text>
                <View style={[
                  styles.inputWrapper,
                  confirmPasswordFocused && styles.inputWrapperFocused,
                  confirmPasswordError !== '' && styles.inputWrapperError
                ]}>
                  <Text style={[styles.inputIcon, confirmPasswordFocused && { color: theme.colors.primary }]}>🔒</Text>
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
              </View>

              {/* Submit Gradient Button */}
              <TouchableOpacity
                onPress={handleResetPassword}
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={isSuccessAlert ? 'success' : 'error'}
        buttonText={isSuccessAlert ? 'Continue' : 'Dismiss'}
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  lockedBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
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
  inputWrapperDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
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
  inputIconDisabled: {
    fontSize: 16,
    marginRight: 10,
    color: '#94a3b8',
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  textInputDisabled: {
    color: '#475569',
    fontWeight: '600',
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
});

export default ResetPasswordScreen;
