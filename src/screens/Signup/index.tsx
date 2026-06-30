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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { ROUTES } from '../../constants/routes';
import { CustomButton } from '../../components/common/CustomButton';
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
    <SafeAreaView style={styles.container}>
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
          <View style={styles.card}>
            {/* Header Rocket Emoji Circle */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🚀</Text>
            </View>
            
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>Join MoveHub to begin tracking your pacing</Text>

            {/* Input Forms */}
            <View style={styles.formContainer}>
              {/* Row for First Name & Last Name */}
              <View style={styles.inputRow}>
                <View style={styles.flexHalf}>
                  <Text style={styles.inputLabel}>FIRST NAME</Text>
                  <TextInput
                    style={[styles.textInput, firstNameError !== '' && styles.textInputError]}
                    placeholder=""
                    placeholderTextColor={theme.colors.textLight}
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={firstName}
                    onChangeText={val => {
                      setFirstName(val);
                      setFirstNameError('');
                    }}
                  />
                  {firstNameError !== '' && <Text style={styles.errorText}>{firstNameError}</Text>}
                </View>
                
                <View style={[styles.flexHalf, { marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>LAST NAME</Text>
                  <TextInput
                    style={[styles.textInput, lastNameError !== '' && styles.textInputError]}
                    placeholder=""
                    placeholderTextColor={theme.colors.textLight}
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={lastName}
                    onChangeText={val => {
                      setLastName(val);
                      setLastNameError('');
                    }}
                  />
                  {lastNameError !== '' && <Text style={styles.errorText}>{lastNameError}</Text>}
                </View>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.textInput, emailError !== '' && styles.textInputError]}
                placeholder="Enter your email address"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={val => {
                  setEmail(val);
                  setEmailError('');
                }}
              />
              {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>PHONE NUMBER</Text>
              <TextInput
                style={[styles.textInput, phoneNumberError !== '' && styles.textInputError]}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                value={phoneNumber}
                onChangeText={val => {
                  setPhoneNumber(val);
                  setPhoneNumberError('');
                }}
              />
              {phoneNumberError !== '' && <Text style={styles.errorText}>{phoneNumberError}</Text>}

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>PASSWORD</Text>
              <TextInput
                style={[styles.textInput, passwordError !== '' && styles.textInputError]}
                placeholder="Enter password"
                placeholderTextColor={theme.colors.textLight}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={val => {
                  setPassword(val);
                  setPasswordError('');
                }}
              />
              {passwordError !== '' && <Text style={styles.errorText}>{passwordError}</Text>}

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>REFERRAL CODE (OPTIONAL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter referral code (optional)"
                placeholderTextColor={theme.colors.textLight}
                autoCapitalize="characters"
                autoCorrect={false}
                value={referralCode}
                onChangeText={setReferralCode}
              />

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

            <CustomButton
              title="Create Account"
              onPress={handleSignup}
              variant="primary"
              loading={loading}
              disabled={loading}
              style={styles.submitBtn}
            />

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  blurRing1: {
    position: 'absolute',
    top: '10%',
    left: '-10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primaryLight + '30',
    zIndex: -1,
  },
  blurRing2: {
    position: 'absolute',
    bottom: '15%',
    right: '-10%',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.secondary + '10',
    zIndex: -1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 184, 166, 0.15)',
    marginBottom: theme.spacing.md,
  },
  iconText: {
    fontSize: 32,
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
    marginTop: 4,
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
  textInput: {
    width: '100%',
    height: 50,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  textInputError: {
    borderColor: theme.colors.error,
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
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
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
    height: 50,
    borderRadius: 14,
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

export default SignupScreen;
