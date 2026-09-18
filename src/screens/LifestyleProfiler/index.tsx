import React, { useState, useRef, useEffect } from 'react';
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
import { ILifestyleSketchPayload, ILifestyleFinalPayload } from './types';
import { LIFESTYLE_STEPS, LIFESTYLE_QUESTIONS } from './questions';
import { styles } from './styles';

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentStep = LIFESTYLE_STEPS[currentStepIndex];
  const totalSteps = LIFESTYLE_STEPS.length;

  // Auto-scroll to top whenever step changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentStepIndex]);

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
    const finalPayload: ILifestyleFinalPayload = {
      uhid: 'SAUSHA5546', // Dynamically linked or user profile default
      timestamp_epoch: Math.floor(Date.now() / 1000),
      lifestyle_questionnaire_payload: form,
    };

    try {
      // Simulate network dispatch / storage
      await new Promise<void>(resolve => setTimeout(() => resolve(), 600));

      Alert.alert(
        'Lifestyle Questionnaire Saved! 🎉',
        'Your personal, family, and lifestyle data has been recorded successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setForm(DEFAULT_FORM);
              setCurrentStepIndex(0);
              scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert(
        'Submission Failed',
        'Unable to save questionnaire data. Please try again.',
        [{ text: 'OK' }]
      );
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
    </SafeAreaView>
  );
};

export default LifestyleProfilerScreen;
