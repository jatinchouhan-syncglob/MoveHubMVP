import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';
import { ROUTES } from '../../constants/routes';
import { CustomHeader } from '../../components/common/CustomHeader';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  
  // Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [whatsappCommunication, setWhatsappCommunication] = useState(true);
  const [termsAndCondition, setTermsAndCondition] = useState(false);

  // Focus states for premium highlights
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [referralFocused, setReferralFocused] = useState(false);

  // Errors
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [termsError, setTermsError] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    let hasError = false;

    // Reset errors
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');
    setPhoneNumberError('');
    setTermsError('');

    if (!firstName.trim()) {
      setFirstNameError('First name required.');
      hasError = true;
    }

    if (!lastName.trim()) {
      setLastNameError('Last name required.');
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError('Email is required.');
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please enter a valid email.');
        hasError = true;
      }
    }

    if (!phoneNumber.trim()) {
      setPhoneNumberError('Phone number required.');
      hasError = true;
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        setPhoneNumberError('Enter a valid 10-digit number.');
        hasError = true;
      }
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Must be at least 6 characters.');
      hasError = true;
    }

    if (!termsAndCondition) {
      setTermsError('You must agree to the Terms & Conditions.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      // Simulate signup delay
      await new Promise(resolve => setTimeout(() => resolve(null), 1000));

      // Preset the user profile locally with the signed-up name
      const defaultProfile: UserProfile = {
        uhid: 'SAUSHA9775',
        name: `${firstName.trim()} ${lastName.trim()}`,
        age: 30,
        weight: 70.0,
        height: 170,
        calorieGoal: 2000,
        isSetupComplete: false,
      };
      await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, defaultProfile);

      // Navigate to the Setup Profile screen
      navigation.replace(ROUTES.PROFILE_SETUP);
    } catch (err) {
      setPasswordError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#eef2ff', '#ccfbf1']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <CustomHeader title="Sign Up" />
        
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
                colors={['#14b8a6', '#0d9488']}
                style={styles.logoBadge}
              >
                <Text style={styles.logoText}>🚀</Text>
              </LinearGradient>
              <Text style={styles.brandTitle}>
                Move<Text style={{ color: theme.colors.secondaryDark, fontWeight: '800' }}>Hub</Text>
              </Text>
              <Text style={styles.brandTagline}>AI-Powered Bio-Computational Pacing</Text>
            </View>

            {/* Glassmorphic Signup Card */}
            <View style={styles.card}>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitleText}>Join MoveHub to begin tracking your biometric pacing</Text>

              {/* Input Forms */}
              <View style={styles.formContainer}>
                {/* Row for First Name & Last Name */}
                <View style={styles.inputRow}>
                  <View style={styles.flexHalf}>
                    <Text style={styles.inputLabel}>FIRST NAME</Text>
                    <View style={[
                      styles.inputWrapper, 
                      firstNameFocused && styles.inputWrapperFocused,
                      firstNameError !== '' && styles.inputWrapperError
                    ]}>
                      <Text style={[styles.inputIcon, firstNameFocused && { color: theme.colors.secondaryDark }]}>👤</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder=""
                        placeholderTextColor={theme.colors.textLight}
                        autoCapitalize="words"
                        autoCorrect={false}
                        value={firstName}
                        onFocus={() => setFirstNameFocused(true)}
                        onBlur={() => setFirstNameFocused(false)}
                        onChangeText={val => {
                          setFirstName(val);
                          setFirstNameError('');
                        }}
                      />
                    </View>
                    {firstNameError !== '' && <Text style={styles.errorText}>{firstNameError}</Text>}
                  </View>
                  
                  <View style={[styles.flexHalf, { marginLeft: 12 }]}>
                    <Text style={styles.inputLabel}>LAST NAME</Text>
                    <View style={[
                      styles.inputWrapper, 
                      lastNameFocused && styles.inputWrapperFocused,
                      lastNameError !== '' && styles.inputWrapperError
                    ]}>
                      <Text style={[styles.inputIcon, lastNameFocused && { color: theme.colors.secondaryDark }]}>👤</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder=""
                        placeholderTextColor={theme.colors.textLight}
                        autoCapitalize="words"
                        autoCorrect={false}
                        value={lastName}
                        onFocus={() => setLastNameFocused(true)}
                        onBlur={() => setLastNameFocused(false)}
                        onChangeText={val => {
                          setLastName(val);
                          setLastNameError('');
                        }}
                      />
                    </View>
                    {lastNameError !== '' && <Text style={styles.errorText}>{lastNameError}</Text>}
                  </View>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>EMAIL ADDRESS</Text>
                <View style={[
                  styles.inputWrapper, 
                  emailFocused && styles.inputWrapperFocused,
                  emailError !== '' && styles.inputWrapperError
                ]}>
                  <Text style={[styles.inputIcon, emailFocused && { color: theme.colors.secondaryDark }]}>✉️</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email address"
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
                  />
                </View>
                {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>PHONE NUMBER</Text>
                <View style={[
                  styles.inputWrapper, 
                  phoneNumberFocused && styles.inputWrapperFocused,
                  phoneNumberError !== '' && styles.inputWrapperError
                ]}>
                  <Text style={[styles.inputIcon, phoneNumberFocused && { color: theme.colors.secondaryDark }]}>📞</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your phone number"
                    placeholderTextColor={theme.colors.textLight}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={phoneNumber}
                    onFocus={() => setPhoneNumberFocused(true)}
                    onBlur={() => setPhoneNumberFocused(false)}
                    onChangeText={val => {
                      setPhoneNumber(val);
                      setPhoneNumberError('');
                    }}
                  />
                </View>
                {phoneNumberError !== '' && <Text style={styles.errorText}>{phoneNumberError}</Text>}

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>PASSWORD</Text>
                <View style={[
                  styles.inputWrapper, 
                  passwordFocused && styles.inputWrapperFocused,
                  passwordError !== '' && styles.inputWrapperError
                ]}>
                  <Text style={[styles.inputIcon, passwordFocused && { color: theme.colors.secondaryDark }]}>🔒</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter password"
                    placeholderTextColor={theme.colors.textLight}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChangeText={val => {
                      setPassword(val);
                      setPasswordError('');
                    }}
                  />
                </View>
                {passwordError !== '' && <Text style={styles.errorText}>{passwordError}</Text>}

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>REFERRAL CODE (OPTIONAL)</Text>
                <View style={[
                  styles.inputWrapper, 
                  referralFocused && styles.inputWrapperFocused
                ]}>
                  <Text style={[styles.inputIcon, referralFocused && { color: theme.colors.secondaryDark }]}>🎫</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter referral code (optional)"
                    placeholderTextColor={theme.colors.textLight}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    value={referralCode}
                    onFocus={() => setReferralFocused(true)}
                    onBlur={() => setReferralFocused(false)}
                    onChangeText={setReferralCode}
                  />
                </View>

                {/* Custom Checkbox - WhatsApp */}
                <TouchableOpacity
                  style={[styles.checkboxRow, { marginTop: 18 }]}
                  onPress={() => setWhatsappCommunication(prev => !prev)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.customCheckbox, whatsappCommunication && styles.customCheckboxChecked]}>
                    {whatsappCommunication && <Text style={styles.customCheckMark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Allow updates & alerts via WhatsApp
                  </Text>
                </TouchableOpacity>

                {/* Custom Checkbox - Terms */}
                <TouchableOpacity
                  style={[styles.checkboxRow, { marginTop: 12 }]}
                  onPress={() => {
                    setTermsAndCondition(prev => !prev);
                    setTermsError('');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.customCheckbox, 
                    termsAndCondition && styles.customCheckboxChecked,
                    termsError !== '' && styles.customCheckboxError
                  ]}>
                    {termsAndCondition && <Text style={styles.customCheckMark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the Terms & Conditions
                  </Text>
                </TouchableOpacity>
                {termsError !== '' && <Text style={styles.errorText}>{termsError}</Text>}
              </View>

              {/* Gradient Submit Button */}
              <TouchableOpacity
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
                style={styles.submitBtn}
              >
                <LinearGradient
                  colors={['#14b8a6', '#0d9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Link to Sign In */}
              <View style={styles.footerLinkContainer}>
                <Text style={styles.footerLinkLabel}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN as any)}>
                  <Text style={styles.footerLinkAction}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    top: '10%',
    left: '-10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    zIndex: -1,
  },
  blurRing2: {
    position: 'absolute',
    bottom: '15%',
    right: '-10%',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
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
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0d9488',
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
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.05,
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
    paddingHorizontal: 12,
  },
  formContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
  },
  flexHalf: {
    flex: 1,
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
    borderColor: theme.colors.secondaryDark,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.borderDark,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  customCheckboxChecked: {
    borderColor: theme.colors.secondaryDark,
    backgroundColor: theme.colors.secondaryDark,
  },
  customCheckboxError: {
    borderColor: theme.colors.error,
  },
  customCheckMark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxLabel: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0d9488',
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
    color: theme.colors.secondaryDark,
  },
});

export default SignupScreen;
