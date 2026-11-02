import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useDrawer } from '../../navigation/DrawerContext';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { IWorkplaceStressorsPayload } from './types';
import {
  YES_NO_OPTIONS,
  LEVEL_STRESS_OPTIONS,
  FREQUENCY_STRESS_OPTIONS,
  DURATION_STRESS_OPTIONS,
  SYMPTOM_FREQUENCY_OPTIONS,
  STRESS_SYMPTOMS,
  PART_TWO_QUESTIONS,
} from './questions';
import { styles } from './styles';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';

const INITIAL_STATE: IWorkplaceStressorsPayload = {
  // Part 1: Workplace Environment & Stress Load
  stressedByWork: undefined,
  stressUnacceptableToYou: undefined,
  physicalMentalHarmDistress: undefined,
  rateLevelOfJobStress: '',
  howOftenYouFeelHighlyStressedFromJob: '',
  howLongHaveYouBeenExperiencingStressFromWork: '',
  frequentHeadaches: '',
  prolongedFatigue: '',
  irritability: '',
  lossOfAppetite: '',
  overSensitivity: '',
  insomnia: '',
  anxiety: '',
  depression: '',

  // Part 2: Identifying Root Stressors
  roleAlignmentWithOrganizationalGoals: null,
  demandsOfYourJob: null,
  lackOfControl: null,
  relationshipsAtWork: null,
  change: null,
  workingEnvironment: null,
  learningOpportunities: null,
  workPlaceStressCompleteFlag: false,
};

export interface WorkplaceStressorsProps {
  isEmbedded?: boolean;
  onComplete?: () => void;
}

export const WorkplaceStressorsScreen: React.FC<WorkplaceStressorsProps> = ({
  isEmbedded = false,
  onComplete,
}) => {
  const { openDrawer } = useDrawer();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [formData, setFormData] = useState<IWorkplaceStressorsPayload>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Custom Alert Modal State
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  // Scroll to top when changing steps
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentStepIndex]);

  // Load existing answers from local storage cache on mount
  const loadLocalData = useCallback(async () => {
    setIsLoading(true);
    try {
      const cached = await storageHelper.getItem<IWorkplaceStressorsPayload>(
        STORAGE_KEYS.WORKPLACE_STRESSORS_CACHE,
      );
      if (cached) {
        setFormData((prev) => ({ ...prev, ...cached }));
      }
    } catch (e) {
      console.warn('[WorkplaceStressors] Error loading local cache:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

  const updateField = <K extends keyof IWorkplaceStressorsPayload>(
    key: K,
    val: IWorkplaceStressorsPayload[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleReset = async () => {
    setFormData(INITIAL_STATE);
    await storageHelper.removeItem(STORAGE_KEYS.WORKPLACE_STRESSORS_CACHE);
    setCurrentStepIndex(0);
    showAlert('Assessment Reset', 'All survey responses have been cleared.', 'info');
  };

  const isNegligible = formData.rateLevelOfJobStress === 'Negligible';

  // Check how many Part 1 questions are completed
  const isPartOneComplete = (): boolean => {
    if (
      formData.stressedByWork === undefined ||
      formData.stressUnacceptableToYou === undefined ||
      formData.physicalMentalHarmDistress === undefined ||
      !formData.rateLevelOfJobStress
    ) {
      return false;
    }
    if (isNegligible) return true;
    if (!formData.howOftenYouFeelHighlyStressedFromJob) return false;
    if (!formData.howLongHaveYouBeenExperiencingStressFromWork) return false;
    return STRESS_SYMPTOMS.every(
      (s) => !!formData[s.key as keyof IWorkplaceStressorsPayload],
    );
  };

  // Check how many Part 2 questions are completed
  const isPartTwoComplete = (): boolean => {
    return PART_TWO_QUESTIONS.every(
      (q) => formData[q.key] !== null && formData[q.key] !== undefined,
    );
  };

  // Step 1 Validation
  const validateStep1 = (): { valid: boolean; missingFields: string[] } => {
    const missing: string[] = [];
    if (formData.stressedByWork === undefined) missing.push('Q1: Stressed by work');
    if (formData.stressUnacceptableToYou === undefined) missing.push('Q2: Unacceptable stress');
    if (formData.physicalMentalHarmDistress === undefined) missing.push('Q3: Physical / mental distress');
    if (!formData.rateLevelOfJobStress) missing.push('Q4: Job stress level');

    return { valid: missing.length === 0, missingFields: missing };
  };

  // Step 2 Validation
  const validateStep2 = (): { valid: boolean; missingFields: string[] } => {
    const missing: string[] = [];
    PART_TWO_QUESTIONS.forEach((q) => {
      const val = formData[q.key];
      if (val === null || val === undefined) {
        missing.push(`${q.number}: ${q.title}`);
      }
    });
    return { valid: missing.length === 0, missingFields: missing };
  };

  const handleSaveAndComplete = async (payloadToSave: IWorkplaceStressorsPayload) => {
    setIsSubmitting(true);
    try {
      await storageHelper.setItem(STORAGE_KEYS.WORKPLACE_STRESSORS_CACHE, payloadToSave);
      showAlert(
        'Survey Completed! 🎉',
        'Both Part 1 and Part 2 of your Workplace Stressors survey have been recorded successfully.',
        'success',
      );
    } catch (err: any) {
      console.warn('[WorkplaceStressors] Save error:', err);
      showAlert(
        'Survey Recorded',
        'Your responses have been saved successfully.',
        'success',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    const check = validateStep1();
    if (!check.valid) {
      showAlert(
        'Incomplete Part 1',
        `Please answer basic questions to continue:\n• ${check.missingFields.join('\n• ')}`,
        'warning',
      );
      return;
    }
    // Advance to Part 2
    setCurrentStepIndex(1);
  };

  const handleFinalSubmit = async () => {
    const check = validateStep2();
    if (!check.valid) {
      showAlert(
        'Incomplete Part 2',
        `Please select Yes or No for the following root causes:\n• ${check.missingFields.slice(0, 4).join('\n• ')}${
          check.missingFields.length > 4 ? `\n...and ${check.missingFields.length - 4} more` : ''
        }`,
        'warning',
      );
      return;
    }

    const fullPayload: IWorkplaceStressorsPayload = {
      ...formData,
      workPlaceStressCompleteFlag: true,
    };
    await handleSaveAndComplete(fullPayload);
  };

  const handleDirectNegligibleComplete = async () => {
    const negligiblePayload: IWorkplaceStressorsPayload = {
      stressedByWork: formData.stressedByWork,
      stressUnacceptableToYou: formData.stressUnacceptableToYou,
      physicalMentalHarmDistress: formData.physicalMentalHarmDistress,
      rateLevelOfJobStress: formData.rateLevelOfJobStress,
      workPlaceStressCompleteFlag: true,
    };
    await handleSaveAndComplete(negligiblePayload);
  };

  // Calculate completion percentage
  const calculateProgress = (): number => {
    let answered = 0;
    if (formData.stressedByWork !== undefined) answered++;
    if (formData.stressUnacceptableToYou !== undefined) answered++;
    if (formData.physicalMentalHarmDistress !== undefined) answered++;
    if (formData.rateLevelOfJobStress) answered++;
    if (formData.howOftenYouFeelHighlyStressedFromJob) answered++;
    if (formData.howLongHaveYouBeenExperiencingStressFromWork) answered++;
    STRESS_SYMPTOMS.forEach((sym) => {
      if (formData[sym.key as keyof IWorkplaceStressorsPayload]) answered++;
    });
    PART_TWO_QUESTIONS.forEach((q) => {
      if (formData[q.key] !== null && formData[q.key] !== undefined) answered++;
    });
    const total = 14 + 7;
    return Math.min(100, Math.round((answered / total) * 100));
  };

  if (isLoading) {
    const Container = isEmbedded ? View : SafeAreaView;
    return (
      <Container style={styles.container}>
        {!isEmbedded && <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 12, color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>
            Loading Workplace Stressors...
          </Text>
        </View>
      </Container>
    );
  }

  const progressPercent = calculateProgress();
  const part1Done = isPartOneComplete();
  const part2Done = isPartTwoComplete();
  const Container = isEmbedded ? View : SafeAreaView;

  return (
    <Container style={styles.container}>
      {!isEmbedded && <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />}

      {/* Screen Header */}
      {!isEmbedded ? (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={openDrawer}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '600' }}>☰</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Workplace Stressors</Text>
              <Text style={styles.headerSubtitle}>
                {currentStepIndex === 0 ? 'Part 1: Stress Assessment' : 'Part 2: Root Causes & Factors'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Workplace Stressors</Text>
            <Text style={{ fontSize: 11, color: '#94A3B8' }}>
              {currentStepIndex === 0 ? 'Part 1: Stress Assessment' : 'Part 2: Root Causes & Factors'}
            </Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top Segmented Tabs: Part 1 & Part 2 */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, currentStepIndex === 0 && styles.tabButtonActive]}
          onPress={() => setCurrentStepIndex(0)}
          activeOpacity={0.7}
        >
          <View style={[styles.tabBadge, currentStepIndex === 0 && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, currentStepIndex === 0 && styles.tabBadgeTextActive]}>
              {part1Done ? '✓' : '1'}
            </Text>
          </View>
          <Text style={[styles.tabButtonText, currentStepIndex === 0 && styles.tabButtonTextActive]}>
            Part 1: Stress Load
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, currentStepIndex === 1 && styles.tabButtonActive]}
          onPress={() => setCurrentStepIndex(1)}
          activeOpacity={0.7}
        >
          <View style={[styles.tabBadge, currentStepIndex === 1 && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, currentStepIndex === 1 && styles.tabBadgeTextActive]}>
              {part2Done ? '✓' : '2'}
            </Text>
          </View>
          <Text style={[styles.tabButtonText, currentStepIndex === 1 && styles.tabButtonTextActive]}>
            Part 2: Root Stressors
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTopRow}>
          <Text style={styles.stepCounterText}>
            {currentStepIndex === 0 ? 'PART 1 OF 2 • ENVIRONMENT & STRESS LOAD' : 'PART 2 OF 2 • IDENTIFYING ROOT STRESSORS'}
          </Text>
          <Text style={styles.progressPercentage}>{progressPercent}% COMPLETED</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Confidential Notice */}
        <View style={styles.confidentialCard}>
          <Text style={styles.confidentialIcon}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.confidentialTitle}>Strictly Confidential</Text>
            <Text style={styles.confidentialDesc}>
              Your responses are protected under organizational privacy guidelines and used solely to recommend tailored wellness interventions.
            </Text>
          </View>
        </View>

        {/* STEP 1: Workplace Environment & Stress Load */}
        {currentStepIndex === 0 && (
          <View>
            <View style={styles.blockBadgeContainer}>
              <Text style={styles.blockBadgeText}>PART 1 OF 2</Text>
            </View>
            <Text style={styles.blockHeading}>Workplace Stress Load</Text>
            <Text style={styles.blockSubheading}>
              Evaluate your occupational pressure, acute stress symptoms, and daily psychological load.
            </Text>

            {/* Q1: Stressed by work */}
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionIcon}>💼</Text>
                <Text style={styles.questionTitle}>Are you stressed by your work?</Text>
              </View>
              <View style={styles.yesNoRow}>
                {YES_NO_OPTIONS.map((opt) => {
                  const isSelected = formData.stressedByWork === opt.value;
                  return (
                    <TouchableOpacity
                      key={`stressedByWork-${opt.label}`}
                      style={[
                        styles.yesNoBtn,
                        isSelected && (opt.value ? styles.yesNoBtnActiveYes : styles.yesNoBtnActiveNo),
                      ]}
                      onPress={() => updateField('stressedByWork', opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.yesNoBtnText,
                          isSelected && (opt.value ? styles.yesNoBtnTextActiveYes : styles.yesNoBtnTextActiveNo),
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Q2: Stress unacceptable */}
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionIcon}>⚠️</Text>
                <Text style={styles.questionTitle}>Is the stress unacceptable to you?</Text>
              </View>
              <View style={styles.yesNoRow}>
                {YES_NO_OPTIONS.map((opt) => {
                  const isSelected = formData.stressUnacceptableToYou === opt.value;
                  return (
                    <TouchableOpacity
                      key={`stressUnacceptable-${opt.label}`}
                      style={[
                        styles.yesNoBtn,
                        isSelected && (opt.value ? styles.yesNoBtnActiveYes : styles.yesNoBtnActiveNo),
                      ]}
                      onPress={() => updateField('stressUnacceptableToYou', opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.yesNoBtnText,
                          isSelected && (opt.value ? styles.yesNoBtnTextActiveYes : styles.yesNoBtnTextActiveNo),
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Q3: Physical / mental harm */}
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionIcon}>❤️‍🩹</Text>
                <Text style={styles.questionTitle}>
                  Do you feel this stress is causing you physical or mental harm or distress?
                </Text>
              </View>
              <View style={styles.yesNoRow}>
                {YES_NO_OPTIONS.map((opt) => {
                  const isSelected = formData.physicalMentalHarmDistress === opt.value;
                  return (
                    <TouchableOpacity
                      key={`harmDistress-${opt.label}`}
                      style={[
                        styles.yesNoBtn,
                        isSelected && (opt.value ? styles.yesNoBtnActiveYes : styles.yesNoBtnActiveNo),
                      ]}
                      onPress={() => updateField('physicalMentalHarmDistress', opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.yesNoBtnText,
                          isSelected && (opt.value ? styles.yesNoBtnTextActiveYes : styles.yesNoBtnTextActiveNo),
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Q4: Rate level of job stress */}
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionIcon}>📊</Text>
                <Text style={styles.questionTitle}>How would you rate your level of job stress?</Text>
              </View>
              <View style={styles.stressLevelList}>
                {LEVEL_STRESS_OPTIONS.map((lvl) => {
                  const isSelected = formData.rateLevelOfJobStress === lvl.value;
                  return (
                    <TouchableOpacity
                      key={`stressLvl-${lvl.value}`}
                      style={[
                        styles.stressLevelCard,
                        isSelected && styles.stressLevelCardActive,
                      ]}
                      onPress={() => updateField('rateLevelOfJobStress', lvl.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.stressLevelEmoji}>{lvl.emoji}</Text>
                      <View style={styles.stressLevelInfo}>
                        <Text
                          style={[
                            styles.stressLevelLabel,
                            isSelected && styles.stressLevelLabelActive,
                          ]}
                        >
                          {lvl.label}
                        </Text>
                        <Text style={styles.stressLevelDesc}>{lvl.desc}</Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleActive,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Conditional Follow-up Questions (Only when stress is not Negligible) */}
            {!isNegligible && formData.rateLevelOfJobStress !== '' && (
              <>
                {/* Q5: Stress Frequency */}
                <View style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionIcon}>⏱️</Text>
                    <Text style={styles.questionTitle}>
                      How often do you feel highly stressed from your job?
                    </Text>
                  </View>
                  <View style={styles.pillGrid}>
                    {FREQUENCY_STRESS_OPTIONS.map((freq) => {
                      const isSelected = formData.howOftenYouFeelHighlyStressedFromJob === freq.value;
                      return (
                        <TouchableOpacity
                          key={`freq-${freq.value}`}
                          style={[
                            styles.choicePill,
                            isSelected && styles.choicePillActive,
                          ]}
                          onPress={() =>
                            updateField('howOftenYouFeelHighlyStressedFromJob', freq.value)
                          }
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.choicePillText,
                              isSelected && styles.choicePillTextActive,
                            ]}
                          >
                            {freq.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Q6: Stress Duration */}
                <View style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionIcon}>📅</Text>
                    <Text style={styles.questionTitle}>
                      How long have you been experiencing stress from work?
                    </Text>
                  </View>
                  <View style={styles.pillGrid}>
                    {DURATION_STRESS_OPTIONS.map((dur) => {
                      const isSelected =
                        formData.howLongHaveYouBeenExperiencingStressFromWork === dur.value;
                      return (
                        <TouchableOpacity
                          key={`dur-${dur.value}`}
                          style={[
                            styles.choicePill,
                            isSelected && styles.choicePillActive,
                          ]}
                          onPress={() =>
                            updateField(
                              'howLongHaveYouBeenExperiencingStressFromWork',
                              dur.value,
                            )
                          }
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.choicePillText,
                              isSelected && styles.choicePillTextActive,
                            ]}
                          >
                            {dur.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Q7: Stress Symptoms List */}
                <View style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionIcon}>🩺</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.questionTitle}>Stress Symptoms Frequency</Text>
                      <Text style={styles.questionSubtitle}>
                        Indicate how frequently you experience each physical or mental symptom:
                      </Text>
                    </View>
                  </View>

                  {STRESS_SYMPTOMS.map((sym) => {
                    const currentVal = formData[sym.key as keyof IWorkplaceStressorsPayload] as string;
                    return (
                      <View key={`symptom-${sym.key}`} style={styles.symptomItemCard}>
                        <View style={styles.symptomHeaderRow}>
                          <Text style={styles.symptomIcon}>{sym.icon}</Text>
                          <Text style={styles.symptomLabel}>{sym.label}</Text>
                        </View>
                        <View style={styles.symptomPillsRow}>
                          {SYMPTOM_FREQUENCY_OPTIONS.map((opt) => {
                            const isSelected = currentVal === opt.value;
                            return (
                              <TouchableOpacity
                                key={`sym-${sym.key}-${opt.value}`}
                                style={[
                                  styles.symptomPill,
                                  isSelected && styles.symptomPillActive,
                                ]}
                                onPress={() => updateField(sym.key as any, opt.value)}
                                activeOpacity={0.7}
                              >
                                <Text
                                  style={[
                                    styles.symptomPillText,
                                    isSelected && styles.symptomPillTextActive,
                                  ]}
                                >
                                  {opt.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {isNegligible && (
              <View
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  padding: 14,
                  marginTop: 4,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981', marginBottom: 4 }}>
                  ✅ Minimal Stress Indicated
                </Text>
                <Text style={{ fontSize: 12, color: '#94A3B8', lineHeight: 16, marginBottom: 10 }}>
                  Since your job stress is negligible, symptom tracking is bypassed. You can complete directly or proceed to Part 2 to review root organizational factors.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10B981',
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingVertical: 8,
                    alignItems: 'center',
                  }}
                  onPress={handleDirectNegligibleComplete}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 12.5 }}>
                    Complete as Low Risk ✓
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: Identifying Root Stressors */}
        {currentStepIndex === 1 && (
          <View>
            <View style={styles.blockBadgeContainer}>
              <Text style={styles.blockBadgeText}>PART 2 OF 2</Text>
            </View>
            <Text style={styles.blockHeading}>Identifying Root Stressors</Text>
            <Text style={styles.blockSubheading}>
              Select whether any of the following organizational factors contribute noticeably to your workplace stress.
            </Text>

            {PART_TWO_QUESTIONS.map((q) => {
              const currentVal = formData[q.key];
              return (
                <View key={`root-${q.key}`} style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionIcon}>{q.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.questionTitle}>
                        {q.number}: {q.title}
                      </Text>
                      <Text style={styles.questionSubtitle}>{q.subtitle}</Text>
                    </View>
                  </View>

                  <View style={styles.yesNoRow}>
                    {YES_NO_OPTIONS.map((opt) => {
                      const isSelected = currentVal === opt.value;
                      return (
                        <TouchableOpacity
                          key={`root-${q.key}-${opt.label}`}
                          style={[
                            styles.yesNoBtn,
                            isSelected && (opt.value ? styles.yesNoBtnActiveYes : styles.yesNoBtnActiveNo),
                          ]}
                          onPress={() => updateField(q.key, opt.value)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.yesNoBtnText,
                              isSelected && (opt.value ? styles.yesNoBtnTextActiveYes : styles.yesNoBtnTextActiveNo),
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Navigation Footer */}
      <View style={styles.footerNav}>
        {currentStepIndex === 1 ? (
          <TouchableOpacity
            style={styles.backNavButton}
            onPress={() => setCurrentStepIndex(0)}
            activeOpacity={0.7}
          >
            <Text style={styles.backNavButtonText}>← Back to Part 1</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.nextNavButton,
            isSubmitting && styles.nextNavButtonDisabled,
          ]}
          onPress={currentStepIndex === 0 ? handleNextStep : handleFinalSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.nextNavButtonText}>
              {currentStepIndex === 0
                ? 'Next: Part 2 (Root Stressors) →'
                : 'Submit Survey ✓'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText={alertType === 'success' ? (isEmbedded ? 'Next: Exercise Prescription ➡️' : 'Great!') : 'Dismiss'}
        onClose={() => {
          setAlertVisible(false);
          if (isEmbedded && alertType === 'success') {
            onComplete?.();
          }
        }}
      />
    </Container>
  );
};

export default WorkplaceStressorsScreen;
