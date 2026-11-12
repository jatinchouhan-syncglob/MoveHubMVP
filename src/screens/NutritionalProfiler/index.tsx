import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useDrawer } from '../../navigation/DrawerContext';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import { INBDPSketchPayload } from './types';
import { NBDP_STEPS, NBDP_QUESTIONS } from './questions';
import { styles } from './styles';

const DEFAULT_FORM: INBDPSketchPayload = {
  processed_sugar_frequency: '',
  glycogen_substrate_source: '',
  pre_workout_fueling_status: '',
  post_workout_intake_window: '',
  daily_water_intake_liters: 0,
  hydration_distribution_pattern: '',
  processed_sodium_exposure: '',
  table_salt_behavior: '',
  protein_intake_density: '',
  dominant_lipid_profile: [],
  microbiome_substrate_frequency: '',
  late_night_ingestion_gap: '',
  dietary_archetype_profile: [],
  satiety_volume_envelope: '',
};

export interface NutritionalProfilerProps {
  isEmbedded?: boolean;
  onComplete?: () => void;
}

export const NutritionalProfilerScreen: React.FC<NutritionalProfilerProps> = ({
  isEmbedded = false,
  onComplete,
}) => {
  const { openDrawer } = useDrawer();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [form, setForm] = useState<INBDPSketchPayload>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Custom Alert Modal State for success/error feedback
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const currentStep = NBDP_STEPS[currentStepIndex];
  const totalSteps = NBDP_STEPS.length;

  // Auto-scroll to top whenever step changes so user starts at the 1st question of the step
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentStepIndex]);

  // Load existing profile and latest questionnaire data on mount
  const loadLatestProfiler = useCallback(async () => {
    setIsLoading(true);
    try {
      const cachedProfile = await storageHelper.getItem<UserProfile>(
        STORAGE_KEYS.USER_PROFILE,
      );
      if (cachedProfile) {
        setProfile(cachedProfile);
      }
      const targetUhid = cachedProfile?.uhid?.trim() || '';
      if (!targetUhid) {
        setIsLoading(false);
        return;
      }
      console.log(`[NutritionalProfiler] Loading latest profiler for UHID: ${targetUhid}...`);

      const res = await apiService.getLatestNutritionalProfiler(targetUhid);
      if (res && res.status === 'Success' && res.data) {
        const d = res.data;
        console.log('[NutritionalProfiler] Existing profiler data loaded:', d);
        setForm({
          processed_sugar_frequency: d.q1SugarRefinedFlourFrequency || '',
          glycogen_substrate_source: d.q2PrimaryCarbohydrateSource || '',
          pre_workout_fueling_status: d.q3PreWorkoutIntake || '',
          post_workout_intake_window: d.q4PostWorkoutIntake || '',
          daily_water_intake_liters: typeof d.q5DailyWaterLiters === 'number' ? d.q5DailyWaterLiters : 0,
          hydration_distribution_pattern: d.q6FluidDistribution || '',
          processed_sodium_exposure: d.q7ProcessedFoodFrequency || '',
          table_salt_behavior: d.q8SaltBehavior || '',
          protein_intake_density: d.q9ProteinConsumptionTarget || '',
          dominant_lipid_profile: Array.isArray(d.q10FatSources) ? d.q10FatSources : [],
          microbiome_substrate_frequency: d.q11FermentedFoodsFrequency || '',
          late_night_ingestion_gap: d.q12LateNightEatingGap || '',
          dietary_archetype_profile: Array.isArray(d.q13DietaryProfileAllergies) ? d.q13DietaryProfileAllergies : [],
          satiety_volume_envelope: d.q14EatingCapacitySatiety || '',
        });
      }
    } catch (err: any) {
      console.warn('[NutritionalProfiler] Error loading latest profiler:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLatestProfiler();
  }, [loadLatestProfiler]);

  // Counts how many questions (out of 14) have been answered
  const countAnsweredQuestions = (): number => {
    let count = 0;
    const allQuestionIds = Object.keys(NBDP_QUESTIONS) as (keyof INBDPSketchPayload)[];
    for (const qId of allQuestionIds) {
      const q = NBDP_QUESTIONS[qId];
      const val = form[qId];
      if (q.type === 'slider') {
        if (typeof val === 'number' && val > 0) {
          count++;
        }
      } else if (q.type === 'checkbox') {
        if (Array.isArray(val) && val.length > 0) {
          count++;
        }
      } else if (q.type === 'radio') {
        if (typeof val === 'string' && val.trim().length > 0) {
          count++;
        }
      }
    }
    return count;
  };

  const answeredCount = countAnsweredQuestions();
  // 14 questions total: 1 answer = ~7%, 2 answers = 14%, ..., 14 answers = 100%
  const progressPercent = answeredCount === 14 ? 100 : Math.round((answeredCount / 14) * 100);

  // Updates single-select or numerical value
  const handleSingleSelect = (questionId: keyof INBDPSketchPayload, value: string | number) => {
    setForm(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Updates multi-select array (checkboxes)
  const handleMultiSelectToggle = (questionId: keyof INBDPSketchPayload, value: string) => {
    setForm(prev => {
      const currentList = (prev[questionId] as string[]) || [];
      const exists = currentList.includes(value);
      const updatedList = exists
        ? currentList.filter(item => item !== value)
        : [...currentList, value];

      return {
        ...prev,
        [questionId]: updatedList,
      };
    });
  };

  // Water slider helper
  const adjustWater = (delta: number) => {
    setForm(prev => {
      const current = prev.daily_water_intake_liters === 0 ? 2.5 : prev.daily_water_intake_liters;
      const newVal = Math.min(6.0, Math.max(0.5, Number((current + delta).toFixed(2))));
      return {
        ...prev,
        daily_water_intake_liters: newVal,
      };
    });
  };

  // Validation check for current step
  const isStepValid = (): boolean => {
    return currentStep.questionIds.every(qId => {
      const q = NBDP_QUESTIONS[qId];
      const val = form[qId];

      if (q.type === 'slider') {
        return typeof val === 'number' && val > 0;
      }
      if (q.type === 'checkbox') {
        return Array.isArray(val) && val.length > 0;
      }
      return typeof val === 'string' && val.trim().length > 0;
    });
  };

  const handleNext = () => {
    if (!isStepValid()) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Section',
        text2: 'Please answer both questions before proceeding to the next step.',
      });
      return;
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Profiler',
      'Are you sure you want to reset all your nutritional answers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setForm(DEFAULT_FORM);
            setCurrentStepIndex(0);
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            Toast.show({
              type: 'info',
              text1: 'Profiler Reset',
              text2: 'All answers have been cleared.',
            });
          },
        },
      ],
    );
  };

  const handleSubmit = async () => {
    if (!isStepValid()) {
      setAlertTitle('Incomplete Section');
      setAlertMessage('Please answer all questions before submitting.');
      setAlertType('warning');
      setAlertModalVisible(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const targetUhid = profile?.uhid?.trim() || '';
      if (!targetUhid) {
        throw new Error('User UHID is not available');
      }
      const targetUserId = profile?.userId ? `USR_${profile.userId}` : '';

      const payload = {
        uhid: targetUhid,
        userId: targetUserId,
        q1SugarRefinedFlourFrequency: form.processed_sugar_frequency,
        q2PrimaryCarbohydrateSource: form.glycogen_substrate_source,
        q3PreWorkoutIntake: form.pre_workout_fueling_status,
        q4PostWorkoutIntake: form.post_workout_intake_window,
        q5DailyWaterLiters: form.daily_water_intake_liters,
        q6FluidDistribution: form.hydration_distribution_pattern,
        q7ProcessedFoodFrequency: form.processed_sodium_exposure,
        q8SaltBehavior: form.table_salt_behavior,
        q9ProteinConsumptionTarget: form.protein_intake_density,
        q10FatSources: form.dominant_lipid_profile,
        q11FermentedFoodsFrequency: form.microbiome_substrate_frequency,
        q12LateNightEatingGap: form.late_night_ingestion_gap,
        q13DietaryProfileAllergies: form.dietary_archetype_profile,
        q14EatingCapacitySatiety: form.satiety_volume_envelope,
        notes: 'Test',
      };

      console.log('[NutritionalProfilerScreen] Submitting payload:', payload);
      const res = await apiService.saveNutritionalProfiler(payload);

      if (res && res.status === 'Success') {
        setAlertTitle('Nutritional Profile Saved! 🥗');
        setAlertMessage(res.message || 'Your dietary responses have been submitted successfully.');
        setAlertType('success');
        setAlertModalVisible(true);
      } else {
        setAlertTitle('Submission Failed');
        setAlertMessage(res?.message || 'Unable to save profiler data. Please try again.');
        setAlertType('error');
        setAlertModalVisible(true);
      }
    } catch (error: any) {
      console.error('[NutritionalProfilerScreen] Submit error:', error);
      setAlertTitle('Submission Error');
      setAlertMessage(
        error?.response?.data?.message || 'Unable to save profiler data. Please check your network connection.',
      );
      setAlertType('error');
      setAlertModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renders a single question card
  const renderQuestionCard = (qId: keyof INBDPSketchPayload) => {
    const q = NBDP_QUESTIONS[qId];
    if (!q) return null;

    return (
      <View key={q.id} style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <View style={styles.questionNumberBadge}>
            <Text style={styles.questionNumberText}>Q{q.questionNumber}</Text>
          </View>
          <View style={styles.questionTitleContainer}>
            <Text style={styles.questionTitle}>{q.title}</Text>
            {q.description ? (
              <Text style={styles.questionDescription}>{q.description}</Text>
            ) : null}
          </View>
        </View>

        {/* Radio Type */}
        {q.type === 'radio' && q.options && (
          <View style={styles.optionsList}>
            {q.options.map(option => {
              const isSelected = form[q.id] === option.value || form[q.id] === option.label;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.7}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => handleSingleSelect(q.id, option.value)}
                >
                  <View style={[styles.radioOuterCircle, isSelected && styles.radioOuterCircleSelected]}>
                    {isSelected ? <View style={styles.radioInnerCircle} /> : null}
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {option.label}
                    </Text>
                    {option.description ? (
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    ) : null}
                    {option.isFlag ? (
                      <View style={styles.flagBadge}>
                        <Text style={styles.flagBadgeText}>Inflammatory Risk Trigger</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Checkbox Type (Multi-Select) */}
        {q.type === 'checkbox' && q.options && (
          <View style={styles.optionsList}>
            {q.options.map(option => {
              const selectedList = (form[q.id] as string[]) || [];
              const isChecked = selectedList.includes(option.value) || selectedList.includes(option.label);
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.7}
                  style={[styles.optionRow, isChecked && styles.optionRowSelected]}
                  onPress={() => handleMultiSelectToggle(q.id, option.value)}
                >
                  <View style={[styles.checkboxSquare, isChecked && styles.checkboxSquareSelected]}>
                    {isChecked ? <Text style={styles.checkboxCheckmark}>✓</Text> : null}
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionLabel, isChecked && styles.optionLabelSelected]}>
                      {option.label}
                    </Text>
                    {option.description ? (
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Slider / Numeric Water Volume */}
        {q.type === 'slider' && (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderValueDisplay}>
              <Text style={styles.sliderValueBigText}>
                {form.daily_water_intake_liters.toFixed(2)}
              </Text>
              <Text style={styles.sliderUnitText}>Liters / day</Text>
            </View>

            <View style={styles.sliderButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.sliderStepBtn}
                onPress={() => adjustWater(-0.5)}
              >
                <Text style={styles.sliderStepBtnText} numberOfLines={1}>-0.5 L</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.sliderStepBtn}
                onPress={() => adjustWater(-0.25)}
              >
                <Text style={styles.sliderStepBtnText} numberOfLines={1}>-0.25 L</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.sliderStepBtn}
                onPress={() => adjustWater(+0.25)}
              >
                <Text style={styles.sliderStepBtnText} numberOfLines={1}>+0.25 L</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.sliderStepBtn}
                onPress={() => adjustWater(+0.5)}
              >
                <Text style={styles.sliderStepBtnText} numberOfLines={1}>+0.5 L</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickPicksHeader}>
              <Text style={styles.quickPicksTitle}>Quick Presets</Text>
            </View>

            <View style={styles.quickPicksRow}>
              {[1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map(val => (
                <TouchableOpacity
                  key={val}
                  activeOpacity={0.7}
                  style={[
                    styles.quickPickPill,
                    form.daily_water_intake_liters === val && styles.quickPickPillActive,
                  ]}
                  onPress={() => handleSingleSelect('daily_water_intake_liters', val)}
                >
                  <Text
                    style={[
                      styles.quickPickText,
                      form.daily_water_intake_liters === val && styles.quickPickTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {val.toFixed(1)} L
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {form.daily_water_intake_liters > 0 && form.daily_water_intake_liters < 2.5 && (
              <View style={styles.warningCard}>
                <Text style={{ fontSize: 16 }}>⚠️</Text>
                <Text style={styles.warningCardText}>
                  Hydration Deficit Alert: Intake &lt; 2.5L triggers active osmotic deficit flag.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const Container = isEmbedded ? View : SafeAreaView;

  if (isLoading) {
    return (
      <Container style={styles.container}>
        {!isEmbedded && <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 }}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={{ marginTop: 12, color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>
            Loading Nutritional Profiler...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      {!isEmbedded && <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />}

      {/* Screen Top Header */}
      {!isEmbedded ? (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
              <Text style={{ fontSize: 18, color: '#FFFFFF' }}>☰</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Nutritional Profiler</Text>
              <Text style={styles.headerSubtitle}>Layer 5.5 Dietary &amp; Fueling Profiler</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Nutritional Profiler</Text>
            <Text style={{ fontSize: 11, color: '#94A3B8' }}>Layer 5.5 Dietary &amp; Fueling Profiler</Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTopRow}>
          <Text style={styles.stepCounterText}>
            STEP {currentStepIndex + 1} OF {totalSteps}
          </Text>
          <Text style={styles.progressPercentage}>{progressPercent}% COMPLETED</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Main Body */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View style={styles.sectionBadgeContainer}>
            <Text style={styles.sectionBadgeText}>Section {currentStep.sectionNumber}</Text>
          </View>
          <Text style={styles.sectionHeading}>{currentStep.sectionTitle}</Text>
          <Text style={styles.sectionSubheading}>{currentStep.sectionSubtitle}</Text>

          {currentStep.questionIds.map(qId => renderQuestionCard(qId))}
        </View>
      </ScrollView>

      {/* Footer Navigation Bar */}
      <View style={styles.footerNav}>
        {currentStepIndex > 0 ? (
          <TouchableOpacity
            style={styles.backNavButton}
            onPress={handlePrevious}
          >
            <Text style={styles.backNavButtonText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}

        <TouchableOpacity
          style={[
            styles.nextNavButton,
            !isStepValid() && styles.nextNavButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0A0E17" size="small" />
          ) : (
            <Text style={styles.nextNavButtonText}>
              {currentStepIndex === totalSteps - 1
                ? 'Submit Profiler ✓'
                : 'Next Step →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Alert Modal for Submission Success & Error Feedback */}
      <CustomAlertModal
        visible={alertModalVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText={alertType === 'success' ? (isEmbedded ? 'Complete Assessment ✅' : 'OK') : 'Dismiss'}
        onClose={() => {
          setAlertModalVisible(false);
          if (alertType === 'success') {
            onComplete?.();
          }
        }}
      />
    </Container>
  );
};

export default NutritionalProfilerScreen;
