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

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(() => resolve(null), 1000));

      // Go to setup profile after successful login
      navigation.replace(ROUTES.PROFILE_SETUP);
    } catch (err) {
      setPasswordError('Failed to sign in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Sign In" />
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
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🔐</Text>
            </View>

            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>
              Sign in to continue your fitness pacing targets
            </Text>
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.textInput, emailError !== '' && styles.textInputError]}
                placeholder="Enter your email"
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

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                PASSWORD
              </Text>
              <TextInput
                style={[styles.textInput, passwordError !== '' && styles.textInputError]}
                placeholder="Enter your password"
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
            </View>

            <CustomButton
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              loading={loading}
              disabled={loading}
              style={styles.submitBtn}
            />

            <View style={styles.footerLinkContainer}>
              <Text style={styles.footerLinkLabel}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.SIGNUP as any)}
              >
                <Text style={styles.footerLinkAction}>Sign Up</Text>
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
    top: '15%',
    left: '-10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primaryLight + '30',
    zIndex: -1,
  },
  blurRing2: {
    position: 'absolute',
    bottom: '25%',
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
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.15)',
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
});

export default LoginScreen;
