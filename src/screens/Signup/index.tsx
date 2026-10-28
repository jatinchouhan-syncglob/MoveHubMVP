import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';
import { ROUTES } from '../../constants/routes';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { apiService, prefetchStepsLogsData } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import { IMAGES } from '../../assets/images';
import { styles } from './styles';

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  
  // Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Refs for keyboard navigation
  const lastNameInputRef = useRef<any>(null);
  const emailInputRef = useRef<any>(null);
  const phoneNumberInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);
  const referralCodeInputRef = useRef<any>(null);
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
  const [showPassword, setShowPassword] = useState(false);
  const [referralFocused, setReferralFocused] = useState(false);

  // Errors
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [termsError, setTermsError] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Custom Alert Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

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
      const response = await apiService.signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password,
        phoneNumber: phoneNumber.trim(),
        referralCode: referralCode.trim() || undefined,
        whatsappCommunication: whatsappCommunication,
        termsAndCondition: termsAndCondition,
      });

      console.log('[SignupScreen] Signup API Response inside Screen:', JSON.stringify(response, null, 2));

      if (response && response.status === 'Success') {
        const userData = response.data || {};
        const authToken = userData.token || response.token;
        if (authToken) {
          await storageHelper.setItem(STORAGE_KEYS.TOKEN, authToken);
        }
        
        const rawPromo = (
          userData.referralCode ||
          userData.referral_code ||
          userData.promocode ||
          userData.promoCode ||
          response.referralCode ||
          response.promocode ||
          referralCode ||
          ''
        ).toString().trim().toUpperCase();
        const isMass = rawPromo === 'MASS01';

        // Save the profile locally without dummy biometrics
        const userProfile: UserProfile = {
          uhid: userData.uhid || '',
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          age: userData?.age || 0,
          weight: userData?.weight || 0,
          height: userData?.height || 0,
          isSetupComplete: true,
          email: userData.email || email.trim(),
          token: authToken,
          referralCode: userData.referralCode || referralCode.trim() || undefined,
          promocode: isMass ? 'MASS01' : (userData.promocode || userData.promoCode || undefined),
          promoCode: isMass ? 'MASS01' : (userData.promocode || userData.promoCode || undefined),
        };
        await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, userProfile);

        if (isMass) {
          await storageHelper.setItem(STORAGE_KEYS.PROMO_CODE, 'MASS01');
        } else {
          await storageHelper.removeItem(STORAGE_KEYS.PROMO_CODE);
        }

        // Navigate to the Setup Profile screen
        prefetchStepsLogsData(userProfile.uhid).catch(() => {});

        // Navigate directly to the main app (Drawer), bypassing General Information
        navigation.replace(ROUTES.DRAWER);
      } else {
        setAlertTitle('Registration Failed');
        setAlertMessage(response?.message || 'Failed to create account. Please try again.');
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to create account. Please check your network connection.';
      setAlertTitle('Registration Error');
      setAlertMessage(serverMessage);
      setAlertVisible(true);
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
              <Image
                source={IMAGES.uncurlLogo}
                style={styles.brandLogoImage}
                resizeMode="contain"
              />
            </View>

            {/* Glassmorphic Signup Card */}
            <View style={styles.card}>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitleText}>Join Uncurl: health to begin tracking your biometric pacing</Text>

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
                        returnKeyType="next"
                        onSubmitEditing={() => lastNameInputRef.current?.focus()}
                        blurOnSubmit={false}
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
                        ref={lastNameInputRef}
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
                        returnKeyType="next"
                        onSubmitEditing={() => emailInputRef.current?.focus()}
                        blurOnSubmit={false}
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
                    ref={emailInputRef}
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
                    returnKeyType="next"
                    onSubmitEditing={() => phoneNumberInputRef.current?.focus()}
                    blurOnSubmit={false}
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
                    ref={phoneNumberInputRef}
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
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    blurOnSubmit={false}
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
                    ref={passwordInputRef}
                    style={styles.textInput}
                    placeholder="Enter password"
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
                    onSubmitEditing={() => referralCodeInputRef.current?.focus()}
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

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>REFERRAL CODE (OPTIONAL)</Text>
                <View style={[
                  styles.inputWrapper, 
                  referralFocused && styles.inputWrapperFocused
                ]}>
                  <Text style={[styles.inputIcon, referralFocused && { color: theme.colors.secondaryDark }]}>🎫</Text>
                  <TextInput
                    ref={referralCodeInputRef}
                    style={styles.textInput}
                    placeholder="Enter referral code (optional)"
                    placeholderTextColor={theme.colors.textLight}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    value={referralCode}
                    onFocus={() => setReferralFocused(true)}
                    onBlur={() => setReferralFocused(false)}
                    onChangeText={setReferralCode}
                    returnKeyType="done"
                    onSubmitEditing={handleSignup}
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
                <View style={[styles.termsRow, { marginTop: 12 }]}>
                  <TouchableOpacity
                    style={styles.termsCheckboxArea}
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
                  </TouchableOpacity>

                  <View style={styles.termsTextWrap}>
                    <Text style={styles.termsNormalText}>
                      <Text
                        onPress={() => {
                          setTermsAndCondition(prev => !prev);
                          setTermsError('');
                        }}
                      >
                        I agree to the{' '}
                      </Text>
                      <Text
                        style={styles.termsLinkText}
                        onPress={() => navigation.navigate(ROUTES.PRIVACY_POLICY)}
                      >
                        Terms & Conditions
                      </Text>
                    </Text>
                  </View>
                </View>
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
      
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
};

export default SignupScreen;

