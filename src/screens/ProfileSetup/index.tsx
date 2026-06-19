import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { ROUTES } from '../../constants/routes';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomHeader } from '../../components/common/CustomHeader';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';

export const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');

  // Local active focused state to highlight border
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isFormValid = name.trim() !== '' && age.trim() !== '' && weight.trim() !== '' && height.trim() !== '' && goal.trim() !== '';

  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      const profileData = {
        name: name.trim() || 'Alex Rivera',
        age: parseInt(age, 10) || 28,
        weight: parseFloat(weight) || 74.5,
        height: parseFloat(height) || 178,
        calorieGoal: parseInt(goal, 10) || 2400,
        isSetupComplete: true,
      };

      // Simulating API persistence
      await apiService.updateProfile(profileData);
      // Simulating Local Storage cache
      await storageHelper.setItem(STORAGE_KEYS.USER_PROFILE, profileData);

      // Navigate to Wellness Pacing Profile Screen
      navigation.replace(ROUTES.WELLNESS_PACING_PROFILE);
    } catch (error) {
      console.error('Failed to complete profile setup:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={STRINGS.PROFILE_SETUP.TITLE} />
      
      {/* Background Soft Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Progress Step Indicator */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepText}>STEP 1 OF 3: PROFILE SETUP</Text>
            <View style={styles.stepLineBg}>
              <View style={styles.stepLineFill} />
            </View>
          </View>

          {/* Headline Section */}
          <View style={styles.headerSection}>
            <Text style={styles.subtitle}>{STRINGS.PROFILE_SETUP.SUBTITLE}</Text>
          </View>
          
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>🎯 Personal Biometrics</Text>
            <View style={styles.divider} />

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>👤</Text>
                <Text style={styles.label}>{STRINGS.PROFILE_SETUP.LABEL_NAME}</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'name' && styles.inputFocused
                ]}
                placeholder={STRINGS.PROFILE_SETUP.PLACEHOLDER_NAME}
                placeholderTextColor={theme.colors.textLight}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Age Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>🎂</Text>
                <Text style={styles.label}>{STRINGS.PROFILE_SETUP.LABEL_AGE}</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'age' && styles.inputFocused
                ]}
                placeholder={STRINGS.PROFILE_SETUP.PLACEHOLDER_AGE}
                placeholderTextColor={theme.colors.textLight}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                onFocus={() => setFocusedField('age')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Weight Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>⚖️</Text>
                <Text style={styles.label}>{STRINGS.PROFILE_SETUP.LABEL_WEIGHT}</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'weight' && styles.inputFocused
                ]}
                placeholder={STRINGS.PROFILE_SETUP.PLACEHOLDER_WEIGHT}
                placeholderTextColor={theme.colors.textLight}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                onFocus={() => setFocusedField('weight')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Height Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>📏</Text>
                <Text style={styles.label}>{STRINGS.PROFILE_SETUP.LABEL_HEIGHT}</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'height' && styles.inputFocused
                ]}
                placeholder={STRINGS.PROFILE_SETUP.PLACEHOLDER_HEIGHT}
                placeholderTextColor={theme.colors.textLight}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                onFocus={() => setFocusedField('height')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Calorie Goal Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>🔥</Text>
                <Text style={styles.label}>{STRINGS.PROFILE_SETUP.LABEL_GOAL}</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'goal' && styles.inputFocused
                ]}
                placeholder={STRINGS.PROFILE_SETUP.PLACEHOLDER_GOAL}
                placeholderTextColor={theme.colors.textLight}
                keyboardType="numeric"
                value={goal}
                onChangeText={setGoal}
                onFocus={() => setFocusedField('goal')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.footer}>
          <CustomButton
            title={STRINGS.PROFILE_SETUP.SUBMIT_BUTTON}
            onPress={handleCompleteSetup}
            loading={loading}
            disabled={loading || !isFormValid}
            style={styles.button}
          />
          <CustomButton
            title="Skip & Use Demo Profile"
            onPress={handleCompleteSetup}
            variant="text"
            disabled={loading}
            style={styles.skipButton}
          />
        </View>
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
  glowSpot1: {
    position: 'absolute',
    top: '5%',
    right: '-15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primaryLight + '25',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '20%',
    left: '-15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.secondary + '08',
    zIndex: -1,
  },
  stepContainer: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 4,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  stepLineBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    width: '100%',
    overflow: 'hidden',
  },
  stepLineFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    width: '33.3%', // First step of onboarding (1/3)
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  headerSection: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    // iOS shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Android elevation
    elevation: 4,
    marginBottom: theme.spacing.xl,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  label: {
    fontSize: 15, // slightly increased size
    fontWeight: theme.fonts.weights.semibold as any,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusMd,
    height: 50,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16.5, // slightly increased font size
    color: theme.colors.text,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    backgroundColor: theme.colors.surface,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  button: {
    width: '100%',
  },
  skipButton: {
    width: '100%',
    marginTop: theme.spacing.xs,
  },
});

export default ProfileSetupScreen;
