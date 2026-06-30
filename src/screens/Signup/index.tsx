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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    // Email pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // Simulate signup delay
      await new Promise(resolve => setTimeout(() => resolve(null), 1000));

      // Preset the user profile locally with the signed-up name
      const defaultProfile: UserProfile = {
        uhid: 'SAUSHA9775', // default dummy uhid for onboarding flow
        name: name.trim(),
        age: 30, // onboarding default fallback
        weight: 70.0,
        height: 170,
        calorieGoal: 2000,
        isSetupComplete: false,
      };
      await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, defaultProfile);

      // Navigate to the Setup Profile screen
      navigation.replace(ROUTES.PROFILE_SETUP);
    } catch (err) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
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
            <Text style={styles.subtitleText}>Join MoveHub to begin tracking your biometric pacing</Text>

            {/* Input Forms */}
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textLight}
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email address"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>PASSWORD</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Create a password (min. 6 chars)"
                placeholderTextColor={theme.colors.textLight}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Re-type your password"
                placeholderTextColor={theme.colors.textLight}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
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
