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
import { ILifestyleSketchPayload, ILifestyleFinalPayload } from './types';
import { LIFESTYLE_STEPS, LIFESTYLE_QUESTIONS } from './questions';
import { styles } from './styles';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';

const DEFAULT_FORM: ILifestyleSketchPayload = {
  // Block 1
  diagnosed_cardiovascular_conditions: '',
  metabolic_disorders: '',
  respiratory_system_health: '',
  structural_orthopedic_conditions: '',

  // Block 2
  early_onset_cardiovascular_disease: '',
  familial_diabetes_track: '',
  neurological_decline_track: '',
  familial_bone_density_deficits: '',

  // Block 3
  tobacco_nicotine_exposure: '',
  alcohol_consumption_volume: '',
  sedentary_off_work_habits: '',
  chronic_sleep_duration: '',

  // Block 4
  ultra_processed_food_frequency: '',
  daily_protein_allocation: '',
  hydration_baseline: '',
  chronic_caloric_mismatch: '',
};

export const LifestyleProfilerScreen: React.FC = () => {
  const { openDrawer } = useDrawer();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [form, setForm] = useState<ILifestyleSketchPayload>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const currentStep = LIFESTYLE_STEPS[currentStepIndex];
  const totalSteps = LIFESTYLE_STEPS.length;

  // Auto-scroll to top whenever step changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentStepIndex]);

  // Load latest questionnaire from GET API on mount
  const loadLatestQuestionnaire = useCallback(async () => {
    setIsLoading(true);
    try {
      const cachedProfile = await storageHelper.getItem<UserProfile>(
        STORAGE_KEYS.USER_PROFILE,
      );
      const targetUhid = cachedProfile?.uhid || 'JATCHO5525';
      console.log(`[LifestyleProfiler] Loading latest questionnaire for UHID: ${targetUhid}...`);

      const res = await apiService.getLatestLifestyleQuestionnaire(targetUhid);
      if (res && res.status === 'Success' && res.data) {
        const d = res.data;
        console.log('[LifestyleProfiler] Existing questionnaire loaded:', d);
        setForm({
          diagnosed_cardiovascular_conditions:
            d.q1CardiovascularConditions === true ? 'Yes' : d.q1CardiovascularConditions === false ? 'No' : '',
          metabolic_disorders:
            d.q2MetabolicDisorders === true ? 'Yes' : d.q2MetabolicDisorders === false ? 'No' : '',
          respiratory_system_health:
            d.q3RespiratoryHealth === true ? 'Yes' : d.q3RespiratoryHealth === false ? 'No' : '',
          structural_orthopedic_conditions:
            d.q4OrthopedicConditions === true ? 'Yes' : d.q4OrthopedicConditions === false ? 'No' : '',
          early_onset_cardiovascular_disease:
            d.q5EarlyOnsetCardiovascularDisease === true ? 'Yes' : d.q5EarlyOnsetCardiovascularDisease === false ? 'No' : '',
          familial_diabetes_track:
            d.q6FamilialDiabetes === true ? 'Yes' : d.q6FamilialDiabetes === false ? 'No' : '',
          neurological_decline_track:
            d.q7NeurologicalDecline === true ? 'Yes' : d.q7NeurologicalDecline === false ? 'No' : '',
          familial_bone_density_deficits:
            d.q8BoneDensityDeficits === true ? 'Yes' : d.q8BoneDensityDeficits === false ? 'No' : '',
          tobacco_nicotine_exposure:
            d.q9TobaccoNicotineExposure === true ? 'Yes' : d.q9TobaccoNicotineExposure === false ? 'No' : '',
          alcohol_consumption_volume:
            d.q10AlcoholConsumption === true ? 'Yes' : d.q10AlcoholConsumption === false ? 'No' : '',
          sedentary_off_work_habits:
            d.q11SedentaryHabits === true ? 'Yes' : d.q11SedentaryHabits === false ? 'No' : '',
          chronic_sleep_duration:
            d.q12ChronicSleepDuration === true ? 'Yes' : d.q12ChronicSleepDuration === false ? 'No' : '',
          ultra_processed_food_frequency:
            d.q13UltraProcessedFood === true ? 'Yes' : d.q13UltraProcessedFood === false ? 'No' : '',
          daily_protein_allocation:
            d.q14ProteinAllocation === true ? 'Yes' : d.q14ProteinAllocation === false ? 'No' : '',
          hydration_baseline:
            d.q15HydrationBaseline === true ? 'Yes' : d.q15HydrationBaseline === false ? 'No' : '',
          chronic_caloric_mismatch:
            d.q16CaloricMismatch === true ? 'Yes' : d.q16CaloricMismatch === false ? 'No' : '',
        });
      }
    } catch (err) {
      console.warn('[LifestyleProfiler] Non-fatal error loading previous questionnaire:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLatestQuestionnaire();
  }, [loadLatestQuestionnaire]);

  // Counts how many questions (out of 16) have been answered
  const countAnsweredQuestions = (): number => {
    let count = 0;
    const allQuestionIds = Object.keys(LIFESTYLE_QUESTIONS) as (keyof ILifestyleSketchPayload)[];
    for (const qId of allQuestionIds) {
      const val = form[qId];
      if (typeof val === 'string' && val.trim().length > 0) {
        count++;
      }
    }
    return count;
  };

  const answeredCount = countAnsweredQuestions();
  // 16 questions total: each answer adds ~6.25%, 16 answers = 100%
  const progressPercent = answeredCount === 16 ? 100 : Math.round((answeredCount / 16) * 100);

  // Updates Yes/No value for a question
  const handleSelectAnswer = (questionId: keyof ILifestyleSketchPayload, value: string) => {
    setForm(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Validation check for all 4 questions in current step
  const isStepValid = (): boolean => {
    return currentStep.questionIds.every(qId => {
      const val = form[qId];
      return typeof val === 'string' && val.trim().length > 0;
    });
  };

  const handleNext = () => {
    if (!isStepValid()) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Section',
        text2: 'Please answer all 4 questions before proceeding to the next step.',
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
      'Reset Questionnaire',
      'Are you sure you want to reset all your questionnaire answers?',
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
              text1: 'Questionnaire Reset',
              text2: 'All answers have been cleared.',
            });
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cachedProfile = await storageHelper.getItem<UserProfile>(
        STORAGE_KEYS.USER_PROFILE,
      );
      const targetUhid = cachedProfile?.uhid || 'JATCHO5525';
      const userId = cachedProfile?.userId ? `USR_${cachedProfile.userId}` : 'USR_101';

      const payload = {
        uhid: targetUhid,
        userId: userId,
        q1CardiovascularConditions: form.diagnosed_cardiovascular_conditions === 'Yes',
        q2MetabolicDisorders: form.metabolic_disorders === 'Yes',
        q3RespiratoryHealth: form.respiratory_system_health === 'Yes',
        q4OrthopedicConditions: form.structural_orthopedic_conditions === 'Yes',
        q5EarlyOnsetCardiovascularDisease: form.early_onset_cardiovascular_disease === 'Yes',
        q6FamilialDiabetes: form.familial_diabetes_track === 'Yes',
        q7NeurologicalDecline: form.neurological_decline_track === 'Yes',
        q8BoneDensityDeficits: form.familial_bone_density_deficits === 'Yes',
        q9TobaccoNicotineExposure: form.tobacco_nicotine_exposure === 'Yes',
        q10AlcoholConsumption: form.alcohol_consumption_volume === 'Yes',
        q11SedentaryHabits: form.sedentary_off_work_habits === 'Yes',
        q12ChronicSleepDuration: form.chronic_sleep_duration === 'Yes',
        q13UltraProcessedFood: form.ultra_processed_food_frequency === 'Yes',
        q14ProteinAllocation: form.daily_protein_allocation === 'Yes',
        q15HydrationBaseline: form.hydration_baseline === 'Yes',
        q16CaloricMismatch: form.chronic_caloric_mismatch === 'Yes',
        notes: 'Completed from mobile app',
      };

      console.log('[LifestyleProfiler] Submitting questionnaire payload:', JSON.stringify(payload, null, 2));
      const res = await apiService.saveLifestyleQuestionnaire(payload);
      console.log('[LifestyleProfiler] Save response:', res);

      setAlertTitle('Questionnaire Saved! 🎉');
      setAlertMessage(res?.message || 'Your personal, family, and lifestyle data has been recorded successfully.');
      setAlertType('success');
      setAlertModalVisible(true);
    } catch (error: any) {
      console.error('[LifestyleProfiler] Error saving questionnaire:', error);
      setAlertTitle('Submission Failed');
      setAlertMessage(error?.response?.data?.message || 'Unable to save questionnaire data. Please try again.');
      setAlertType('error');
      setAlertModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renders a single question card
  const renderQuestionCard = (qId: keyof ILifestyleSketchPayload) => {
    const q = LIFESTYLE_QUESTIONS[qId];
    if (!q) return null;

    const selectedValue = form[q.id];

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

        {/* Yes / No Options */}
        <View style={styles.yesNoRow}>
          {q.options.map(option => {
            const isSelected = selectedValue === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.7}
                style={[
                  styles.yesNoButton,
                  isSelected && styles.yesNoButtonSelected,
                ]}
                onPress={() => handleSelectAnswer(q.id, option.value)}
              >
                <View
                  style={[
                    styles.radioOuterCircle,
                    isSelected && styles.radioOuterCircleSelected,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInnerCircle} /> : null}
                </View>
                <Text
                  style={[
                    styles.yesNoButtonText,
                    isSelected && styles.yesNoButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />

      {/* Screen Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
            <Text style={{ fontSize: 18, color: '#FFFFFF' }}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Lifestyle Questionnaire</Text>
            <Text style={styles.headerSubtitle}>16-Point Personal, Family &amp; Habit Profiler</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

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
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={{ marginTop: 12, color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>
            Loading your lifestyle profile...
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={styles.blockBadgeContainer}>
              <Text style={styles.blockBadgeText}>Block {currentStep.blockNumber}</Text>
            </View>
            <Text style={styles.blockHeading}>{currentStep.blockTitle}</Text>
            <Text style={styles.blockSubheading}>{currentStep.blockSubtitle}</Text>

            {currentStep.questionIds.map(qId => renderQuestionCard(qId))}
          </View>
        </ScrollView>
      )}

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
                ? 'Submit Questionnaire ✓'
                : 'Next Step →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Success & Error Feedback Modal */}
      <CustomAlertModal
        visible={alertModalVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText={alertType === 'success' ? 'Great!' : 'Dismiss'}
        onClose={() => setAlertModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default LifestyleProfilerScreen;
