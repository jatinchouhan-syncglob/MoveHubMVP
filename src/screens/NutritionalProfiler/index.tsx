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
import { INBDPSketchPayload, INBDPFinalPayload, IQuestion } from './types';
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

export const NutritionalProfilerScreen: React.FC = () => {
  const { openDrawer } = useDrawer();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [form, setForm] = useState<INBDPSketchPayload>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentStep = NBDP_STEPS[currentStepIndex];
  const totalSteps = NBDP_STEPS.length;

  // Auto-scroll to top whenever step changes so user starts at the 1st question of the step
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentStepIndex]);

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
      ]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalPayload: INBDPFinalPayload = {
      uhid: 'SAUSHA5546', // Dynamically linked or profile default
      timestamp_epoch: Math.floor(Date.now() / 1000),
      nutrition_sketch_payload: form,
    };

    try {
      // Simulate network dispatch / storage
      await new Promise<void>(resolve => setTimeout(() => resolve(), 600));

      Alert.alert(
        'Nutritional Profile Saved! 🎉',
        'Your dietary responses have been submitted successfully.',
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
        'Unable to save profiler data. Please try again.',
        [{ text: 'OK' }]
      );
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
              const isSelected = form[q.id] === option.value;
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
              const isChecked = selectedList.includes(option.value);
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
            <Text style={styles.headerTitle}>Nutritional Profiler</Text>
            <Text style={styles.headerSubtitle}>Layer 5.5 Dietary &amp; Fueling Profiler</Text>
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
    </SafeAreaView>
  );
};

export default NutritionalProfilerScreen;
