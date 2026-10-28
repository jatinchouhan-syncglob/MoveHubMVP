import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { ROUTES } from '../../constants/routes';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomHeader } from '../../components/common/CustomHeader';
import { apiService } from '../../services/api';
import { UserProfile } from '../../types';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';

export type OccupationType = 'Student' | 'Homemaker' | 'Working Professional' | 'Retired';

const OCCUPATION_OPTIONS: { id: OccupationType; label: string; icon: string }[] = [
  { id: 'Student', label: 'Student', icon: '🎓' },
  { id: 'Working Professional', label: 'Working Professional', icon: '💼' },
  { id: 'Homemaker', label: 'Homemaker', icon: '🏡' },
  { id: 'Retired', label: 'Retired', icon: '🏖️' },
];

export const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // Occupation & Location Profile States (Requested by Client Anjan HB)
  const [occupation, setOccupation] = useState<OccupationType | ''>('');
  const [universityName, setUniversityName] = useState('');
  const [department, setDepartment] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');

  // Local active focused state to highlight border
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const cached = await storageHelper.getItem<UserProfile>(
          STORAGE_KEYS.USER_PROFILE,
        );
        if (cached) {
          // Pre-fill Name from signup if available
          if (
            cached.name &&
            cached.name.trim() !== '' &&
            cached.name !== 'Alex Rivera' &&
            cached.name !== 'Robert D.'
          ) {
            setName(cached.name.trim());
          }

          // For biometric values (age, weight, height), if setup is not yet complete (new user after signup),
          // DO NOT autofill them! Let the user type their real details, only showing placeholders.
          if (cached.isSetupComplete) {
            if (
              cached.age &&
              cached.age > 0 &&
              cached.age !== 28 &&
              cached.age !== 30 &&
              cached.age !== 55
            ) {
              setAge(String(cached.age));
            }
            if (
              cached.weight &&
              cached.weight > 0 &&
              cached.weight !== 74.5 &&
              cached.weight !== 70 &&
              cached.weight !== 75
            ) {
              setWeight(String(cached.weight));
            }
            if (
              cached.height &&
              cached.height > 0 &&
              cached.height !== 178 &&
              cached.height !== 170
            ) {
              setHeight(String(cached.height));
            }
            if (cached.occupation) setOccupation(cached.occupation as OccupationType);
            if (cached.universityName) setUniversityName(cached.universityName);
            if (cached.department) setDepartment(cached.department);
            if (cached.companyName) setCompanyName(cached.companyName);
            if (cached.location) setLocation(cached.location);
            if (cached.city) setCity(cached.city);
          }
        }
      } catch (err) {
        console.error('Failed to prefill profile in setup:', err);
      }
    };
    loadProfileData();
  }, []);

  const isFormValid =
    name.trim() !== '' &&
    age.trim() !== '' &&
    weight.trim() !== '' &&
    height.trim() !== '';

  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      const parsedAge = parseInt(age, 10);
      const parsedWeight = parseFloat(weight);
      const parsedHeight = parseFloat(height);

      const cached = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);

      const profileData: UserProfile = {
        ...cached,
        name: name.trim() || cached?.name || '',
        age: parsedAge,
        weight: parsedWeight,
        height: parsedHeight,
        calorieGoal: cached?.calorieGoal || 2400,
        isSetupComplete: true,
        occupation: occupation || undefined,
        universityName: occupation === 'Student' ? universityName.trim() : undefined,
        department: occupation === 'Student' ? department.trim() : undefined,
        companyName: occupation === 'Working Professional' ? companyName.trim() : undefined,
        location: location.trim() || undefined,
        city: city.trim() || undefined,
      };

      const effectivePromo = (
        cached?.promocode ||
        cached?.promoCode ||
        cached?.referralCode ||
        ''
      ).toString().trim().toUpperCase();
      const isMass = effectivePromo === 'MASS01';
      if (isMass) {
        profileData.promocode = 'MASS01';
        profileData.promoCode = 'MASS01';
        await storageHelper.setItem(STORAGE_KEYS.PROMO_CODE, 'MASS01');
      }

      // Call real backend API for profile setup
      await apiService.setupProfile({
        uhid: cached?.uhid,
        name: profileData.name,
        age: profileData.age,
        weight: profileData.weight,
        height: profileData.height,
        calorieGoal: profileData.calorieGoal || 2400,
        occupation: profileData.occupation,
        universityName: profileData.universityName,
        department: profileData.department,
        companyName: profileData.companyName,
        location: profileData.location,
        city: profileData.city,
      });

      // Update profile locally and cache in Local Storage
      await apiService.updateProfile(profileData);

      // Navigate directly to Disclaimer Screen
      navigation.replace(ROUTES.DISCLAIMER);
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Step Indicator */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepText}>GENERAL INFORMATION</Text>
            <View style={styles.stepLineBg}>
              <View style={styles.stepLineFill} />
            </View>
          </View>

          {/* Headline Section */}
          <View style={styles.headerSection}>
            <Text style={styles.subtitle}>{STRINGS.PROFILE_SETUP.SUBTITLE}</Text>
          </View>

          {/* ========================================================= */}
          {/* CARD 1: PERSONAL BIOMETRICS                              */}
          {/* ========================================================= */}
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
                style={[styles.input, styles.inputDisabled]}
                value={name}
                editable={false}
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
                  focusedField === 'age' && styles.inputFocused,
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
                  focusedField === 'weight' && styles.inputFocused,
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
                  focusedField === 'height' && styles.inputFocused,
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
          </View>

          {/* ========================================================= */}
          {/* CARD 2: OCCUPATION & LOCATION BACKGROUND (Requested by Anjan HB) */}
          {/* ========================================================= */}
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>💼 Occupation & Background</Text>
            <Text style={styles.cardSubtitle}>
              Select your primary lifestyle role to calibrate institutional and collegiate rankings.
            </Text>
            <View style={styles.divider} />

            {/* 4 Occupation Choices */}
            <View style={styles.occupationGrid}>
              {OCCUPATION_OPTIONS.map(opt => {
                const isSelected = occupation === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.occupationCard,
                      isSelected && styles.occupationCardActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setOccupation(opt.id)}
                  >
                    <Text style={styles.occupationIcon}>{opt.icon}</Text>
                    <Text
                      style={[
                        styles.occupationLabel,
                        isSelected && styles.occupationLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedCheckPill}>
                        <Text style={styles.selectedCheckText}>✓ Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CONDITIONAL FIELDS BASED ON SELECTION */}
            {occupation === 'Student' && (
              <View style={styles.conditionalSection}>
                <View style={styles.conditionalBanner}>
                  <Text style={styles.conditionalBannerText}>
                    🎓 Student Academic Information
                  </Text>
                </View>

                {/* University / College Name */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>🏛️</Text>
                    <Text style={styles.label}>University / College Name</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'university' && styles.inputFocused,
                    ]}
                    placeholder="e.g. Delhi University / IIT / BITS Pilani"
                    placeholderTextColor={theme.colors.textLight}
                    value={universityName}
                    onChangeText={setUniversityName}
                    onFocus={() => setFocusedField('university')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* Department / Stream */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>📚</Text>
                    <Text style={styles.label}>Department / Stream</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'department' && styles.inputFocused,
                    ]}
                    placeholder="e.g. Computer Science, Mechanical, MBA"
                    placeholderTextColor={theme.colors.textLight}
                    value={department}
                    onChangeText={setDepartment}
                    onFocus={() => setFocusedField('department')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* Campus Location / Area */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>📍</Text>
                    <Text style={styles.label}>Campus Location / Area</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'location' && styles.inputFocused,
                    ]}
                    placeholder="e.g. North Campus, Powai, Indiranagar"
                    placeholderTextColor={theme.colors.textLight}
                    value={location}
                    onChangeText={setLocation}
                    onFocus={() => setFocusedField('location')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* City */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>🏙️</Text>
                    <Text style={styles.label}>City</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'city' && styles.inputFocused,
                    ]}
                    placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                    placeholderTextColor={theme.colors.textLight}
                    value={city}
                    onChangeText={setCity}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            )}

            {occupation === 'Working Professional' && (
              <View style={styles.conditionalSection}>
                <View style={styles.conditionalBanner}>
                  <Text style={styles.conditionalBannerText}>
                    💼 Organization & Work Information
                  </Text>
                </View>

                {/* Company Name */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>🏢</Text>
                    <Text style={styles.label}>Company / Organization Name</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'company' && styles.inputFocused,
                    ]}
                    placeholder="e.g. Google, Infosys, Tata Consultancy Services"
                    placeholderTextColor={theme.colors.textLight}
                    value={companyName}
                    onChangeText={setCompanyName}
                    onFocus={() => setFocusedField('company')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* Office Location / Area */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>📍</Text>
                    <Text style={styles.label}>Office Location / Area</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'location' && styles.inputFocused,
                    ]}
                    placeholder="e.g. Electronic City, Cyber Hub, BKC"
                    placeholderTextColor={theme.colors.textLight}
                    value={location}
                    onChangeText={setLocation}
                    onFocus={() => setFocusedField('location')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* City */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>🏙️</Text>
                    <Text style={styles.label}>City</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'city' && styles.inputFocused,
                    ]}
                    placeholder="e.g. Bengaluru, Gurugram, Mumbai"
                    placeholderTextColor={theme.colors.textLight}
                    value={city}
                    onChangeText={setCity}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            )}

            {(occupation === 'Homemaker' || occupation === 'Retired') && (
              <View style={styles.conditionalSection}>
                <View style={styles.conditionalBanner}>
                  <Text style={styles.conditionalBannerText}>
                    {occupation === 'Homemaker' ? '🏡' : '🏖️'} Location & City Details
                  </Text>
                </View>

                {/* Locality / Area */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>📍</Text>
                    <Text style={styles.label}>Locality / Area</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'location' && styles.inputFocused,
                    ]}
                    placeholder="e.g. Indiranagar, Jayanagar, Vasant Kunj"
                    placeholderTextColor={theme.colors.textLight}
                    value={location}
                    onChangeText={setLocation}
                    onFocus={() => setFocusedField('location')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* City */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>🏙️</Text>
                    <Text style={styles.label}>City</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'city' && styles.inputFocused,
                    ]}
                    placeholder="e.g. Bengaluru, New Delhi, Pune"
                    placeholderTextColor={theme.colors.textLight}
                    value={city}
                    onChangeText={setCity}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            )}
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
    width: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 30,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    lineHeight: 18,
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
    fontSize: 17,
    marginRight: 6,
  },
  label: {
    fontSize: 14.5,
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
    fontSize: 15.5,
    color: theme.colors.text,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    backgroundColor: theme.colors.surface,
  },
  inputDisabled: {
    backgroundColor: '#e2e8f0',
    borderColor: '#cbd5e1',
    color: '#475569',
    opacity: 0.8,
  },

  // 4 Occupation Choice Cards
  occupationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
    marginBottom: theme.spacing.sm,
  },
  occupationCard: {
    width: '48%',
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusMd,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  occupationCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '35',
  },
  occupationIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  occupationLabel: {
    fontSize: 12.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    textAlign: 'center',
  },
  occupationLabelActive: {
    color: theme.colors.primary,
  },
  selectedCheckPill: {
    marginTop: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectedCheckText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Conditional Questions Section
  conditionalSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  conditionalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight + '25',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  conditionalBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: theme.colors.primary,
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
});

export default ProfileSetupScreen;
