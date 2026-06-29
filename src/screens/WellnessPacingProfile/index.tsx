import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { ROUTES } from '../../constants/routes';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomButton } from '../../components/common/CustomButton';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { apiService } from '../../services/api';

interface PacingModeOption {
  id: string;
  title: string;
  subtext: string;
  emoji: string;
  color: string;
}

const PACING_OPTIONS: PacingModeOption[] = [
  {
    id: 'cardio_pacing',
    title: 'Cardiovascular Pacing Mode',
    subtext: 'Hypertension, High BP, CVD, or Heart Disease, Stroke',
    emoji: '🩵',
    color: '#06b6d4', // Cyan
  },
  {
    id: 'metabolic_buffer',
    title: 'Metabolic Optimization Buffer',
    subtext: 'Diabetes, PCOS, PCOD, or Fatty Liver, Thyroid (Hyper and Hypo)',
    emoji: '🧡',
    color: '#f97316', // Orange
  },
  {
    id: 'joint_focus',
    title: 'Joint & Muscle Density Focus',
    subtext: 'For general joint stiffness or structural limitations',
    emoji: '🦾',
    color: '#10b981', // Green
  },
  {
    id: 'pulmonary_balancing',
    title: 'Pulmonary Volume Balancing',
    subtext: 'Maps to Asthma, COPD, or Respiratory Pacing',
    emoji: '🫁',
    color: '#8b5cf6', // Purple
  },
  {
    id: 'vascular_stabilization',
    title: 'Vascular Flow Stabilization',
    subtext: 'Maps to Low Blood Pressure management',
    emoji: '🩸',
    color: '#ef4444', // Red
  },
  {
    id: 'systemic_restoration',
    title: 'Systemic Energy Restoration Loop',
    subtext: 'For post-illness recovery, cellular rest, CKD, or Oncological conditioning',
    emoji: '🧘',
    color: '#ec4899', // Pink
  },
  {
    id: 'none',
    title: 'None',
    subtext: 'You do not have any lifestyle diseases or other limitations.',
    emoji: '🛡️',
    color: '#64748b', // Slate
  },
  {
    id: 'other',
    title: 'Other',
    subtext: 'Your wellness limitation is not covered above.',
    emoji: '🌀',
    color: '#0f172a', // Charcoal
  },
];

const CARDIO_SUB_OPTIONS = [
  { id: 'hypertension', label: 'A: Controlled Hypertension / High Blood Pressure' },
  { id: 'heart_disease', label: 'B: Heart Disease (CVD / Ischemic / Valvular) or History of Stroke' }
];

const METABOLIC_SUB_OPTIONS = [
  { id: 'diabetes_t1_t2', label: 'A: Type 1 / Type 2 Diabetes' },
  { id: 'pcos_pcod', label: 'B: Polycystic Ovary Syndrome (PCOS) / PCOD' },
  { id: 'thyroid_fatty_liver', label: 'C: Thyroid Disorders (Hyper / Hypo) or Fatty Liver Disease' }
];

export const WellnessPacingProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');
  const [selectedCardioSubs, setSelectedCardioSubs] = useState<string[]>([]);
  const [selectedMetabolicSubs, setSelectedMetabolicSubs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSavedPacing = async () => {
      try {
        const savedIds = await storageHelper.getItem<string[]>(STORAGE_KEYS.PACING_PROFILE);
        if (savedIds && savedIds.length > 0) {
          setSelectedIds(savedIds);
        }
        const savedOther = await storageHelper.getItem<string>(STORAGE_KEYS.PACING_OTHER_TEXT);
        if (savedOther) {
          setOtherText(savedOther);
        }
        const savedCardio = await storageHelper.getItem<string[]>(STORAGE_KEYS.PACING_CARDIO_SUBS);
        if (savedCardio) {
          setSelectedCardioSubs(savedCardio);
        }
        const savedMetabolic = await storageHelper.getItem<string[]>(STORAGE_KEYS.PACING_METABOLIC_SUBS);
        if (savedMetabolic) {
          setSelectedMetabolicSubs(savedMetabolic);
        }
      } catch (error) {
        console.error('Failed to load pacing profile from storage:', error);
      }
    };
    loadSavedPacing();
  }, []);

  const toggleOption = (id: string) => {
    setSelectedIds((prev) => {
      let updated: string[];
      if (id === 'none') {
        // Selecting None deselects everything else
        updated = prev.includes('none') ? [] : ['none'];
      } else {
        // Selecting any other option deselects None
        const filtered = prev.filter((item) => item !== 'none');
        updated = filtered.includes(id)
          ? filtered.filter((item) => item !== id)
          : [...filtered, id];
      }

      // Clear sub-options if parent is deselected
      if (!updated.includes('cardio_pacing')) {
        setSelectedCardioSubs([]);
      }
      if (!updated.includes('metabolic_buffer')) {
        setSelectedMetabolicSubs([]);
      }
      if (!updated.includes('other')) {
        setOtherText('');
      }

      return updated;
    });
  };

  const toggleCardioSub = (subId: string) => {
    setSelectedCardioSubs((prev) =>
      prev.includes(subId)
        ? prev.filter((item) => item !== subId)
        : [...prev, subId]
    );
  };

  const toggleMetabolicSub = (subId: string) => {
    setSelectedMetabolicSubs((prev) =>
      prev.includes(subId)
        ? prev.filter((item) => item !== subId)
        : [...prev, subId]
    );
  };

  const handleSavePacing = async () => {
    setSaving(true);
    try {
      await apiService.savePacingProfile({
        selectedPacingModes: selectedIds,
        otherText: selectedIds.includes('other') ? otherText.trim() : undefined,
        selectedCardioSubModes: selectedIds.includes('cardio_pacing') ? selectedCardioSubs : undefined,
        selectedMetabolicSubModes: selectedIds.includes('metabolic_buffer') ? selectedMetabolicSubs : undefined,
      });

      // Save selected pacing profiles to storage for clinical alignment integrations
      await storageHelper.setItem(STORAGE_KEYS.PACING_PROFILE, selectedIds);

      // Save custom other text if "other" is selected
      if (selectedIds.includes('other')) {
        await storageHelper.setItem(STORAGE_KEYS.PACING_OTHER_TEXT, otherText);
      } else {
        await storageHelper.removeItem(STORAGE_KEYS.PACING_OTHER_TEXT);
      }

      // Save selected sub-options to storage
      if (selectedIds.includes('cardio_pacing')) {
        await storageHelper.setItem(STORAGE_KEYS.PACING_CARDIO_SUBS, selectedCardioSubs);
      } else {
        await storageHelper.removeItem(STORAGE_KEYS.PACING_CARDIO_SUBS);
      }

      if (selectedIds.includes('metabolic_buffer')) {
        await storageHelper.setItem(STORAGE_KEYS.PACING_METABOLIC_SUBS, selectedMetabolicSubs);
      } else {
        await storageHelper.removeItem(STORAGE_KEYS.PACING_METABOLIC_SUBS);
      }
      
      // Navigate to the next step: Disclaimer
      navigation.replace(ROUTES.DISCLAIMER);
    } catch (error) {
      console.error('Failed to save pacing configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Pacing Profile" />

      {/* Background Soft Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Onboarding Stage Step Indicator */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>STEP 2 OF 2: PACING PROFILE</Text>
          <View style={styles.stepLineBg}>
            <View style={[styles.stepLineFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Screen Heading */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Personalise Your Pacing Profile</Text>
          <Text style={styles.subtitle}>
            Select any lifestyle adjustments or fitness limitations so our engine can calibrate your safe daily thresholds and maximize your functional Quality of Life (QOL).
          </Text>
        </View>

        {/* Selection Status Badge */}
        <View style={styles.statusBadgeRow}>
          <Text style={styles.statusBadgeText}>
            Selected: <Text style={styles.boldStatusText}>{selectedIds.length} of 8</Text>
          </Text>
        </View>

        {/* List of Pacing Options */}
        <View style={styles.optionsList}>
          {PACING_OPTIONS.map((option) => {
            const isSelected = selectedIds.includes(option.id);
            return (
              <View key={option.id} style={styles.optionWrapper}>
                <TouchableOpacity
                  onPress={() => toggleOption(option.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.optionCard,
                    isSelected && { borderColor: option.color }
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.activeHighlightBar, { backgroundColor: option.color }]} />
                  )}
                  
                  <View style={styles.cardLayoutRow}>
                    {/* Emoji Tile */}
                    <View style={[
                      styles.emojiTile, 
                      { backgroundColor: isSelected ? option.color + '15' : theme.colors.background }
                    ]}>
                      <Text style={styles.emojiText}>{option.emoji}</Text>
                    </View>

                    <View style={styles.cardMainTextContainer}>
                      <Text style={[
                        styles.cardTitle,
                        isSelected && { color: theme.colors.text }
                      ]}>
                        {option.title}
                      </Text>
                      <Text style={styles.cardSubtext}>{option.subtext}</Text>
                    </View>

                    {/* Custom Checkbox view */}
                    <View style={[
                      styles.checkboxOutline,
                      isSelected && { borderColor: option.color, backgroundColor: option.color }
                    ]}>
                      {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                  </View>
                </TouchableOpacity>

                {option.id === 'cardio_pacing' && isSelected && (
                  <View style={[styles.subOptionsContainer, { borderColor: 'rgba(6, 182, 212, 0.3)', backgroundColor: 'rgba(6, 182, 212, 0.05)' }]}>
                    <Text style={[styles.subInputLabel, { color: '#06b6d4' }]}>
                      Select Cardiovascular Sub-Profile *
                    </Text>
                    {CARDIO_SUB_OPTIONS.map((sub, idx) => {
                      const isSubSelected = selectedCardioSubs.includes(sub.id);
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          style={[
                            styles.subOptionRow,
                            idx < CARDIO_SUB_OPTIONS.length - 1 && styles.subOptionRowBorder
                          ]}
                          onPress={() => toggleCardioSub(sub.id)}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.subCheckboxOutline,
                            isSubSelected && { borderColor: '#06b6d4', backgroundColor: '#06b6d4' }
                          ]}>
                            {isSubSelected && <Text style={styles.subCheckboxCheck}>✓</Text>}
                          </View>
                          <Text style={styles.subOptionLabel}>{sub.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    {selectedCardioSubs.length === 0 && (
                      <Text style={{ fontSize: 11, color: theme.colors.warning, marginTop: 6, fontWeight: '600' }}>
                        ⚠️ Please select at least one cardiovascular sub-option.
                      </Text>
                    )}
                  </View>
                )}

                {option.id === 'metabolic_buffer' && isSelected && (
                  <View style={[styles.subOptionsContainer, { borderColor: 'rgba(249, 115, 22, 0.3)', backgroundColor: 'rgba(249, 115, 22, 0.05)' }]}>
                    <Text style={[styles.subInputLabel, { color: '#f97316' }]}>
                      Select Metabolic Sub-Profile *
                    </Text>
                    {METABOLIC_SUB_OPTIONS.map((sub, idx) => {
                      const isSubSelected = selectedMetabolicSubs.includes(sub.id);
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          style={[
                            styles.subOptionRow,
                            idx < METABOLIC_SUB_OPTIONS.length - 1 && styles.subOptionRowBorder
                          ]}
                          onPress={() => toggleMetabolicSub(sub.id)}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.subCheckboxOutline,
                            isSubSelected && { borderColor: '#f97316', backgroundColor: '#f97316' }
                          ]}>
                            {isSubSelected && <Text style={styles.subCheckboxCheck}>✓</Text>}
                          </View>
                          <Text style={styles.subOptionLabel}>{sub.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    {selectedMetabolicSubs.length === 0 && (
                      <Text style={{ fontSize: 11, color: theme.colors.warning, marginTop: 6, fontWeight: '600' }}>
                        ⚠️ Please select at least one metabolic sub-option.
                      </Text>
                    )}
                  </View>
                )}

                {option.id === 'other' && isSelected && (
                  <View style={styles.otherInputContainer}>
                    <Text style={[styles.otherInputLabel, { color: theme.colors.primary }]}>
                      Add your limitation here *
                    </Text>
                    <TextInput
                      style={[
                        styles.otherInput,
                        {
                          borderColor: otherText.trim() === '' ? theme.colors.warning : theme.colors.primary,
                          borderWidth: 1.5,
                        }
                      ]}
                      value={otherText}
                      onChangeText={setOtherText}
                      placeholder="Type your custom limitation (required)..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      numberOfLines={2}
                    />
                    {otherText.trim() === '' && (
                      <Text style={{ fontSize: 11, color: theme.colors.warning, marginTop: 6, fontWeight: '600' }}>
                        ⚠️ This field is required to calibrate your pacing profile.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Action Submit CTA Button */}
        <View style={styles.ctaContainer}>
          <CustomButton
            title="CALIBRATE & VIEW PRESCRIPTION"
            onPress={handleSavePacing}
            variant="primary"
            loading={saving}
            disabled={
              saving ||
              selectedIds.length === 0 ||
              (selectedIds.includes('other') && otherText.trim() === '') ||
              (selectedIds.includes('cardio_pacing') && selectedCardioSubs.length === 0) ||
              (selectedIds.includes('metabolic_buffer') && selectedMetabolicSubs.length === 0)
            }
            style={styles.submitBtn}
            textStyle={styles.submitBtnText}
          />
        </View>
      </ScrollView>
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
    top: '10%',
    left: '-15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primaryLight + '20',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '15%',
    right: '-15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.secondary + '05',
    zIndex: -1,
  },
  scrollContent: {
    padding: theme.spacing.containerPadding,
    paddingBottom: theme.spacing.xxl,
  },
  stepContainer: {
    marginBottom: theme.spacing.lg,
  },
  stepText: {
    fontSize: 10.5,
    fontWeight: '800' as any,
    color: theme.colors.primary,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.xs,
  },
  stepLineBg: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepLineFill: {
    width: '66.6%', // Second step of onboarding (2/3)
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  headerSection: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as any,
    color: theme.colors.text,
    lineHeight: 32,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  statusBadgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    marginBottom: theme.spacing.lg,
  },
  statusBadgeText: {
    fontSize: 12.5,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  boldStatusText: {
    fontWeight: 'bold',
  },
  optionsList: {
    marginBottom: theme.spacing.lg,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  activeHighlightBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 5,
  },
  cardLayoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emojiText: {
    fontSize: 22,
  },
  cardMainTextContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 12,
    color: theme.colors.textLight,
    lineHeight: 16,
  },
  checkboxOutline: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxCheck: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ctaContainer: {
    marginTop: theme.spacing.sm,
  },
  submitBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  optionWrapper: {
    marginBottom: theme.spacing.md,
  },
  otherInputContainer: {
    backgroundColor: '#EEF2FF', // Soft Indigo background
    borderWidth: 1.5,
    borderColor: '#C7D2FE', // Light Indigo border
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: theme.spacing.md,
    marginTop: -4,
    zIndex: -1,
  },
  otherInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  otherInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.text,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  subOptionsContainer: {
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: theme.spacing.md,
    marginTop: -4,
    zIndex: -1,
  },
  subInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  subOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  subOptionRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  subCheckboxOutline: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: theme.colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginRight: theme.spacing.sm,
  },
  subCheckboxCheck: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  subOptionLabel: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

export default WellnessPacingProfileScreen;
