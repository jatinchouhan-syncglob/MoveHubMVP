import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { useDrawer } from '../../navigation/DrawerContext';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { IQoLAnswers, QoLScore } from './types';
import { QOL_INTRO_TEXT, QOL_SECTIONS } from './questions';
import { styles } from './styles';

export const QualityOfLifeScreen: React.FC = () => {
  const { setActiveScreen } = useDrawer();
  const scrollViewRef = useRef<ScrollView>(null);

  // Form answers state
  const [answers, setAnswers] = useState<IQoLAnswers>({});
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  // Load cached answers on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await storageHelper.getItem<IQoLAnswers>(STORAGE_KEYS.QUALITY_OF_LIFE_CACHE);
        if (cached) {
          setAnswers(cached);
        }
      } catch (err) {
        console.warn('[QualityOfLife] Error loading cache:', err);
      }
    };
    loadCachedData();
  }, []);

  // Total 6 questions
  const totalQuestions = 6;
  const questionKeys: (keyof IQoLAnswers)[] = [
    'q1_qol_rating',
    'q2_health_satisfaction',
    'q3_physical_pain',
    'q4_medical_treatment',
    'q5_enjoy_life',
    'q6_meaningful_life',
  ];

  const answeredCount = questionKeys.filter(k => answers[k] !== undefined && answers[k] !== null).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const isComplete = answeredCount === totalQuestions;

  // Select option handler
  const handleSelectOption = async (field: keyof IQoLAnswers, value: QoLScore) => {
    const updated = {
      ...answers,
      [field]: value,
    };
    setAnswers(updated);
    try {
      await storageHelper.setItem(STORAGE_KEYS.QUALITY_OF_LIFE_CACHE, updated);
    } catch (e) {
      console.warn('[QualityOfLife] Error auto-saving:', e);
    }
  };

  // Reset form handler
  const handleReset = () => {
    Alert.alert(
      'Reset Assessment',
      'Are you sure you want to clear all your answers and start over?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setAnswers({});
            try {
              await storageHelper.removeItem(STORAGE_KEYS.QUALITY_OF_LIFE_CACHE);
            } catch (e) {
              console.warn('[QualityOfLife] Error clearing cache:', e);
            }
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          },
        },
      ]
    );
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!isComplete) {
      setAlertTitle('Incomplete Survey');
      setAlertMessage(`Please answer all ${totalQuestions} questions before submitting. (${answeredCount}/${totalQuestions} completed)`);
      setAlertType('warning');
      setAlertModalVisible(true);
      return;
    }

    try {
      const payload: IQoLAnswers = {
        ...answers,
        completedAt: new Date().toISOString(),
      };
      await storageHelper.setItem(STORAGE_KEYS.QUALITY_OF_LIFE_CACHE, payload);

      setAlertTitle('Survey Submitted');
      setAlertMessage(
        'Thank you for completing the HR-Quality of Life (WHOQOL-BREF) assessment. Your responses have been recorded successfully.'
      );
      setAlertType('success');
      setAlertModalVisible(true);
    } catch (error) {
      console.error('[QualityOfLife] Error submitting assessment:', error);
      setAlertTitle('Submission Error');
      setAlertMessage('Could not save your responses. Please try again.');
      setAlertType('error');
      setAlertModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />

      {/* Top Header */}
      <CustomHeader
        title="HR-Quality of Life (QoL)"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
        rightComponent={
          <View style={styles.headerRightActions}>
            {answeredCount > 0 ? (
              <TouchableOpacity
                style={styles.resetButton}
                activeOpacity={0.7}
                onPress={handleReset}
                accessibilityLabel="Reset Assessment"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                    stroke="#EF4444"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M3 3v5h5"
                    stroke="#EF4444"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            ) : (
              <View style={styles.resetPlaceholder} />
            )}
          </View>
        }
      />

      {/* Real-time Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTopRow}>
          <Text style={styles.stepCounterText}>
            6 QUESTIONS • {answeredCount}/6 ANSWERED
          </Text>
          <Text style={styles.progressPercentage}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(5, progressPercent)}%` },
            ]}
          />
        </View>
      </View>

      {/* Scrollable Survey Questions */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro / Clinical Disclaimer Box */}
        <View style={styles.introCard}>
          <View style={styles.introHeaderRow}>
            <View style={styles.introTitleBadgeRow}>
              <Text style={styles.introIcon}>🩺</Text>
              <Text style={styles.introTitle}>{QOL_INTRO_TEXT.title}</Text>
            </View>
            <View style={styles.whoBadge}>
              <Text style={styles.whoBadgeText}>{QOL_INTRO_TEXT.instrument}</Text>
            </View>
          </View>
          <Text style={styles.introDescription}>{QOL_INTRO_TEXT.description}</Text>
          <View style={styles.introInstructionRow}>
            <Text style={styles.introInstructionText}>👉 {QOL_INTRO_TEXT.instruction}</Text>
          </View>
        </View>

        {/* Survey Sections */}
        {QOL_SECTIONS.map(section => (
          <View key={section.id} style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.subtitle && (
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
              )}
            </View>

            {/* Informational Callout Banner (e.g. Last 2 weeks) */}
            {section.noticeBanner && (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeIcon}>ℹ️</Text>
                <Text style={styles.noticeText}>{section.noticeBanner}</Text>
              </View>
            )}

            {/* Questions List */}
            {section.questions.map(q => {
              const selectedValue = answers[q.field];
              return (
                <View key={q.id} style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <View style={styles.qNumberBadge}>
                      <Text style={styles.qNumberText}>Q{q.qNumber}</Text>
                    </View>
                    <Text style={styles.questionText}>{q.text}</Text>
                  </View>

                  {/* Options Vertical Stack with Scores */}
                  <View style={styles.optionsContainer}>
                    {q.options.map(opt => {
                      const isSelected = selectedValue === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            styles.optionRow,
                            isSelected && styles.optionRowActive,
                          ]}
                          activeOpacity={0.8}
                          onPress={() => handleSelectOption(q.field, opt.value)}
                        >
                          <View style={styles.optionLeft}>
                            <View
                              style={[
                                styles.optionRadioDot,
                                isSelected && styles.optionRadioDotActive,
                              ]}
                            >
                              {isSelected && <View style={styles.optionRadioInnerDot} />}
                            </View>
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.optionTextActive,
                              ]}
                            >
                              {opt.label}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.optionScoreBadge,
                              isSelected && styles.optionScoreBadgeActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionScoreText,
                                isSelected && styles.optionScoreTextActive,
                              ]}
                            >
                              {opt.value}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Fixed Bottom Submit Action */}
      <View style={styles.footerNav}>
        <TouchableOpacity
          style={[styles.submitBtn, !isComplete && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>
            {isComplete ? 'Submit Assessment' : `Complete All Questions (${answeredCount}/6)`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Alert / Success Feedback Modal */}
      <CustomAlertModal
        visible={alertModalVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText={alertType === 'success' ? 'Continue' : 'Dismiss'}
        onClose={() => {
          setAlertModalVisible(false);
          if (alertType === 'success') {
            setActiveScreen('FitnessTraining');
          }
        }}
      />
    </SafeAreaView>
  );
};

export default QualityOfLifeScreen;
