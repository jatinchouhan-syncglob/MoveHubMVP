import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDrawer } from '../../navigation/DrawerContext';
import {
  INTAKE_QUESTIONS,
  INITIAL_BIOMETRIC_RESET_CARD,
} from './mockData';
import { BiometricChecklistItem } from './types';
import { styles } from './styles';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';

const CORE_TARGETS_LIST = [
  {
    key: 'bse',
    name: 'Bio Sync Efficiency',
    icon: '⚡',
    target: '75.0',
    base: '64.2',
    unit: '',
  },
  {
    key: 'sedentary',
    name: 'Sedentary Index',
    icon: '🪑',
    target: '35.0',
    base: '68.5',
    unit: '',
  },
  {
    key: 'ppi',
    name: 'Pulse-Pace (PPI)',
    icon: '💓',
    target: '2.8',
    base: '3.6',
    unit: '',
  },
  {
    key: 'move',
    name: 'Move Economy',
    icon: '🏃',
    target: '92.0',
    base: '108.4',
    unit: 'kcal/km',
  },
  {
    key: 'stamina',
    name: 'Stamina (IS)',
    icon: '🔋',
    target: '80.0%',
    base: '68.0%',
    unit: '',
  },
  {
    key: 'heart',
    name: 'AHA Heart Volume',
    icon: '❤️',
    target: '150',
    base: '110',
    unit: 'pts',
  },
];

export interface ExercisePrescriptionProps {
  isEmbedded?: boolean;
  onNext?: () => void;
}

const findOptionIdByText = (questionId: string, textVal?: string | null): string => {
  if (!textVal) return '';
  const question = INTAKE_QUESTIONS.find(q => q.id === questionId);
  if (!question) return '';
  const trimmed = textVal.trim().toLowerCase();
  const match = question.options.find(
    opt =>
      opt.text.trim().toLowerCase() === trimmed ||
      opt.id.toLowerCase() === trimmed ||
      opt.text.toLowerCase().includes(trimmed) ||
      trimmed.includes(opt.text.toLowerCase()),
  );
  return match ? match.id : '';
};

const getOptionText = (questionId: string, optionId?: string): string => {
  if (!optionId) return '';
  const question = INTAKE_QUESTIONS.find(q => q.id === questionId);
  if (!question) return '';
  const option = question.options.find(opt => opt.id === optionId);
  return option ? option.text : '';
};

export const ExercisePrescriptionScreen: React.FC<ExercisePrescriptionProps> = ({
  isEmbedded = false,
  onNext,
}) => {
  const { openDrawer, setActiveScreen } = useDrawer();
  const [activeTab, setActiveTab] = useState<'intake' | 'biometric'>('intake');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Custom Alert Modal State
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  // Answers state for the 9-question intake matrix
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({
    q1: 'q1_fat_loss',
    q2: 'q2_mesomorph',
    q3: 'q3_lower_back',
    q4: 'q4_intermediate',
    q5: 'q5_desk',
    q6: 'q6_exhausted',
    q7: 'q7_moderate',
    q8: 'q8_regular',
    q9: 'q9_commercial',
  });

  // Biometric Checklist interactive state
  const [checklist, setChecklist] = useState<BiometricChecklistItem[]>(
    INITIAL_BIOMETRIC_RESET_CARD.checklist,
  );

  // Load existing saved prescription from backend on mount
  const loadLatestData = useCallback(async () => {
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
      console.log(`[ExercisePrescriptionScreen] Fetching latest prescription for UHID: ${targetUhid}`);
      const res = await apiService.getLatestExercisePrescription(targetUhid);

      if (res && res.status === 'Success' && res.data) {
        const d = res.data;
        const prefilled: { [qId: string]: string } = {};

        if (d.q1FitnessGoal) {
          const m = findOptionIdByText('q1', d.q1FitnessGoal);
          if (m) prefilled.q1 = m;
        }
        if (d.q2BodyFrame) {
          const m = findOptionIdByText('q2', d.q2BodyFrame);
          if (m) prefilled.q2 = m;
        }
        if (d.q3JointDiscomfort) {
          const m = findOptionIdByText('q3', d.q3JointDiscomfort);
          if (m) prefilled.q3 = m;
        }
        if (d.q4TrainingExperience) {
          const m = findOptionIdByText('q4', d.q4TrainingExperience);
          if (m) prefilled.q4 = m;
        }
        if (d.q5DailyWorkRoutine) {
          const m = findOptionIdByText('q5', d.q5DailyWorkRoutine);
          if (m) prefilled.q5 = m;
        }
        if (d.q6SleepWakingFatigue) {
          const m = findOptionIdByText('q6', d.q6SleepWakingFatigue);
          if (m) prefilled.q6 = m;
        }
        if (d.q7StressWorkload) {
          const m = findOptionIdByText('q7', d.q7StressWorkload);
          if (m) prefilled.q7 = m;
        }
        if (d.q8NutritionalPattern) {
          const m = findOptionIdByText('q8', d.q8NutritionalPattern);
          if (m) prefilled.q8 = m;
        }
        if (d.q9GymEquipmentAccess) {
          const m = findOptionIdByText('q9', d.q9GymEquipmentAccess);
          if (m) prefilled.q9 = m;
        }

        if (Object.keys(prefilled).length > 0) {
          setAnswers(prev => ({ ...prev, ...prefilled }));
        }
      }
    } catch (err) {
      console.warn('[ExercisePrescriptionScreen] Load latest error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLatestData();
  }, [loadLatestData]);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = INTAKE_QUESTIONS.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleToggleChecklist = (id: number) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'verified' ? 'pending' : 'verified',
            }
          : item,
      ),
    );
  };

  const hasValidMetricValue = (val: any): boolean => {
    if (val === undefined || val === null) return false;
    const s = String(val).trim();
    if (
      s === '' ||
      s.toLowerCase() === 'n/a' ||
      s.toLowerCase() === 'null' ||
      s.toLowerCase() === 'undefined' ||
      s === '-'
    ) {
      return false;
    }
    const num = parseFloat(s);
    if (!isNaN(num)) {
      return num > 0;
    }
    return true;
  };

  const isTargetItemValid = (item: any): boolean => {
    return hasValidMetricValue(item.target);
  };

  const renderComingSoonCard = (
    title: string,
    desc = 'Data will appear here once assessment calibration is completed.',
    icon = '⏳',
  ) => (
    <View style={styles.comingSoonCard}>
      <View style={styles.comingSoonIconCircle}>
        <Text style={styles.comingSoonIcon}>{icon}</Text>
      </View>
      <View style={styles.comingSoonTextCol}>
        <Text style={styles.comingSoonTitle}>{title}</Text>
        <Text style={styles.comingSoonDesc}>{desc}</Text>
      </View>
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
      </View>
    </View>
  );

  const handleSaveAndSubmit = async () => {
    // 1. Validation check
    const missing: string[] = [];
    INTAKE_QUESTIONS.forEach(q => {
      if (!answers[q.id]) {
        missing.push(`Q${q.number}: ${q.title}`);
      }
    });

    if (missing.length > 0) {
      setAlertTitle('Incomplete Intake Matrix');
      setAlertMessage(
        `Please select an option for all 9 questions before proceeding:\n• ${missing.slice(0, 3).join('\n• ')}${
          missing.length > 3 ? `\n...and ${missing.length - 3} more` : ''
        }`,
      );
      setAlertType('warning');
      setAlertVisible(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const targetUhid = profile?.uhid?.trim() || '';
      if (!targetUhid) {
        throw new Error('User UHID is not available');
      }
      const targetUserId = profile?.userId ? `USR-${profile.userId}` : '';

      const payload = {
        uhid: targetUhid,
        userId: targetUserId,
        q1FitnessGoal: getOptionText('q1', answers.q1),
        q2BodyFrame: getOptionText('q2', answers.q2),
        q3JointDiscomfort: getOptionText('q3', answers.q3),
        q4TrainingExperience: getOptionText('q4', answers.q4),
        q5DailyWorkRoutine: getOptionText('q5', answers.q5),
        q6SleepWakingFatigue: getOptionText('q6', answers.q6),
        q7StressWorkload: getOptionText('q7', answers.q7),
        q8NutritionalPattern: getOptionText('q8', answers.q8),
        q9GymEquipmentAccess: getOptionText('q9', answers.q9),
      };

      const res = await apiService.saveExercisePrescription(payload);
      if (res && res.status === 'Success') {
        setAlertTitle('Prescription Saved! 🧬');
        setAlertMessage(
          'Your 9-Question exercise prescription matrix has been recorded successfully.',
        );
        setAlertType('success');
        setAlertVisible(true);
      } else {
        setAlertTitle('Submission Error');
        setAlertMessage(res?.message || 'Failed to save exercise prescription.');
        setAlertType('error');
        setAlertVisible(true);
      }
    } catch (err: any) {
      console.error('[ExercisePrescriptionScreen] Save error:', err);
      setAlertTitle('Network Error');
      setAlertMessage(
        err?.response?.data?.message || 'Could not connect to server. Please try again.',
      );
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetIntake = () => {
    Alert.alert(
      'Reset Questionnaire',
      'Are you sure you want to reset your intake matrix answers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => setAnswers({}),
        },
      ],
    );
  };

  const Container = isEmbedded ? View : SafeAreaView;

  if (isLoading) {
    return (
      <Container style={styles.container}>
        {!isEmbedded && <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 12, color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>
            Loading Exercise Intake Matrix...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      {!isEmbedded && <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />}

      {/* Screen Top Header (Matching Nutritional & Lifestyle Profiler) */}
      {!isEmbedded ? (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
              <Text style={{ fontSize: 18, color: '#FFFFFF' }}>☰</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Exercise Strategies</Text>
              <Text style={styles.headerSubtitle}>Phase-2 C-MELA™ Clinical Intake</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetIntake}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Exercise Intake Matrix</Text>
            <Text style={{ fontSize: 11, color: '#94A3B8' }}>Phase-2 C-MELA™ Clinical Intake</Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetIntake}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top Mode Switcher Tabs (Only when not embedded) */}
      {!isEmbedded && (
        <View style={styles.modeTabBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.modeTabBtn, activeTab === 'intake' && styles.modeTabBtnActive]}
            onPress={() => setActiveTab('intake')}
          >
            <Text
              style={[styles.modeTabBtnText, activeTab === 'intake' && styles.modeTabBtnTextActive]}
            >
              📋 9-Q Intake ({answeredCount}/9)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.modeTabBtn, activeTab === 'biometric' && styles.modeTabBtnActive]}
            onPress={() => setActiveTab('biometric')}
          >
            <Text
              style={[styles.modeTabBtnText, activeTab === 'biometric' && styles.modeTabBtnTextActive]}
            >
              🧬 Biometric Reset
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* TAB 1: 9-QUESTION MOBILE-SIMPLIFIED INTAKE MATRIX                         */}
        {/* ========================================================================= */}
        {activeTab === 'intake' && (
          <View>
            {/* Intake Intro Banner */}
            <View style={styles.introBanner}>
              <View style={styles.introHeaderRow}>
                <View style={styles.introIconBox}>
                  <Text style={styles.introIcon}>🎯</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.introBadge}>C-MELA™ CLINICAL ENGINE</Text>
                  <Text style={styles.introTitle}>9-Question Intake Matrix</Text>
                </View>
              </View>
              <Text style={styles.introDesc}>
                Translates your physical choices into precise algorithmic constraints, joint safety limits, and adaptive gym machine allocations.
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>Matrix Completion</Text>
                  <Text style={styles.progressPctText}>
                    {progressPercent}% ({answeredCount}/{totalQuestions})
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
            </View>

            {/* Questions List */}
            {INTAKE_QUESTIONS.map(q => {
              const selectedOptId = answers[q.id];
              const isAnswered = !!selectedOptId;

              return (
                <View key={q.id} style={styles.questionCard}>
                  {/* Card Header */}
                  <View style={styles.qHeaderRow}>
                    <View
                      style={[
                        styles.qNumberBadge,
                        isAnswered && styles.qNumberBadgeAnswered,
                      ]}
                    >
                      <Text
                        style={[
                          styles.qNumberText,
                          isAnswered && styles.qNumberTextAnswered,
                        ]}
                      >
                        Q{q.number}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.qCategoryText}>{q.category}</Text>
                      <Text style={styles.qTitleText}>{q.questionText}</Text>
                    </View>
                  </View>

                  {/* Options */}
                  <View style={styles.optionsContainer}>
                    {q.options.map(opt => {
                      const isSelected = selectedOptId === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          activeOpacity={0.7}
                          style={[
                            styles.optionCard,
                            isSelected && styles.optionCardSelected,
                          ]}
                          onPress={() => handleSelectOption(q.id, opt.id)}
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInnerDot} />}
                          </View>

                          <View style={styles.optionContent}>
                            <View style={styles.optionTitleRow}>
                              {opt.icon && (
                                <Text style={styles.optionIcon}>{opt.icon}</Text>
                              )}
                              <Text
                                style={[
                                  styles.optionTitle,
                                  isSelected && styles.optionTitleSelected,
                                ]}
                              >
                                {opt.text}
                              </Text>
                            </View>
                            {opt.subtext && (
                              <Text style={styles.optionSubtext}>{opt.subtext}</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Bottom Actions */}
            <View style={styles.actionsBar}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.resetBtn}
                onPress={handleResetIntake}
                disabled={isSubmitting}
              >
                <Text style={styles.resetBtnText}>Reset Matrix</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.generateBtn, isSubmitting && { opacity: 0.7 }]}
                disabled={isSubmitting}
                onPress={handleSaveAndSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.generateBtnText}>
                    {isEmbedded
                      ? 'Submit & Next: Nutritional Profiler ➡️'
                      : 'Save & Generate Prescriptions ⚡'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VIEWPORT 1 - BIOMETRIC RESET CARD (7-Day Rolling Profile Track)    */}
        {/* ========================================================================= */}
        {!isEmbedded && activeTab === 'biometric' && (
          <View>
            <View style={styles.biometricMainCard}>
              {/* Header Badge & Title */}
              <View style={styles.bioTopHeader}>
                <View style={styles.bioBadgePill}>
                  <Text style={styles.bioBadgeIcon}>🧬</Text>
                  <Text style={styles.bioBadgeText}>
                    7-DAY ROLLING PRESCRIPTION
                  </Text>
                </View>
                <Text style={styles.bioCardMainTitle}>
                  Biometric Reset Blueprint
                </Text>
              </View>

              {/* Patient Meta Strip */}
              <View style={styles.bioPatientMetaBox}>
                <View style={styles.bioMetaChipsRow}>
                  <View style={styles.bioMetaChip}>
                    <Text style={styles.bioMetaChipLabel}>
                      UHID:{' '}
                      <Text style={styles.bioMetaChipValue}>
                        {profile?.uhid || INITIAL_BIOMETRIC_RESET_CARD.uhid}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.bioMetaChip}>
                    <Text style={styles.bioMetaChipLabel}>
                      Age:{' '}
                      <Text style={styles.bioMetaChipValue}>
                        {INITIAL_BIOMETRIC_RESET_CARD.age} yrs
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.bioMetaChip}>
                    <Text style={styles.bioMetaChipLabel}>
                      Sex:{' '}
                      <Text style={styles.bioMetaChipValue}>
                        {INITIAL_BIOMETRIC_RESET_CARD.sex}
                      </Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.bioProfileModeRow}>
                  <View style={styles.bioProfileDot} />
                  <Text style={styles.bioProfileModeText}>
                    Profile: {INITIAL_BIOMETRIC_RESET_CARD.profileMode}
                  </Text>
                </View>
              </View>

              {/* Weekly Tracking Window */}
              <View style={styles.bioWindowBox}>
                <View style={styles.bioWindowLeft}>
                  <Text style={styles.bioWindowLabel}>WEEKLY TRACKING WINDOW</Text>
                  <Text style={styles.bioWindowRange}>
                    📅 {INITIAL_BIOMETRIC_RESET_CARD.rangeStart} —{' '}
                    {INITIAL_BIOMETRIC_RESET_CARD.rangeEnd}
                  </Text>
                </View>
                <View style={styles.bioResetBadge}>
                  <Text style={styles.bioResetText}>
                    ⏳ Resets in {INITIAL_BIOMETRIC_RESET_CARD.resetsInDays}d
                  </Text>
                </View>
              </View>

              {/* Central Adaptive Target Ring */}
              <View style={styles.bioTargetSection}>
                <View style={styles.bioTargetRingOuter}>
                  <View style={styles.bioTargetRingInner}>
                    <Text style={styles.bioTargetBigScore}>
                      {INITIAL_BIOMETRIC_RESET_CARD.bseAdaptiveTarget.toFixed(1)}
                    </Text>
                    <Text style={styles.bioTargetSublabel}>ADAPTIVE TARGET</Text>
                    <Text style={styles.bioTargetMetricTitle}>BIO SYNC EFFICIENCY</Text>
                    <View style={styles.bioTargetStatusPill}>
                      <View style={styles.bioTargetGreenDot} />
                      <Text style={styles.bioTargetStatusText}>Optimal Pacing</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Core Targets */}
              <View style={styles.bioSectionTitleRow}>
                <Text style={styles.bioSectionHeaderIcon}>📋</Text>
                <Text style={styles.bioSectionHeader}>
                  Core Targets & Lifestyle Pacing
                </Text>
              </View>

              {/* Targets Table: Name, Base, Target */}
              {(() => {
                const validTargets = CORE_TARGETS_LIST.filter(isTargetItemValid);
                if (validTargets.length === 0) {
                  return renderComingSoonCard(
                    'Core Targets & Pacing',
                    'Targets are currently being calibrated and will appear soon.',
                    '🎯',
                  );
                }

                return (
                  <View style={styles.targetTableCard}>
                    <View style={styles.targetTableHeader}>
                      <View style={styles.targetTableColName}>
                        <Text style={styles.targetTableColHeaderText}>NAME</Text>
                      </View>
                      <View style={styles.targetTableColBase}>
                        <Text style={[styles.targetTableColHeaderText, styles.textCenter]}>BASE</Text>
                      </View>
                      <View style={styles.targetTableColTarget}>
                        <Text style={[styles.targetTableColHeaderText, styles.textRight]}>TARGET</Text>
                      </View>
                    </View>

                    {validTargets.map((item, idx) => {
                      const isLast = idx === validTargets.length - 1;
                      const formattedBase = hasValidMetricValue(item.base)
                        ? (item.unit ? `${item.base} ${item.unit}` : String(item.base))
                        : '-';
                      const formattedTarget = hasValidMetricValue(item.target)
                        ? (item.unit ? `${item.target} ${item.unit}` : String(item.target))
                        : '-';

                      return (
                        <View
                          key={item.key}
                          style={[
                            styles.targetTableRow,
                            isLast && styles.targetTableRowLast,
                            idx % 2 === 1 && styles.targetTableRowAlt,
                          ]}
                        >
                          <View style={[styles.targetTableColName, styles.targetNameRow]}>
                            <Text style={styles.targetRowIcon}>{item.icon}</Text>
                            <Text style={styles.targetRowNameText} numberOfLines={2}>
                              {item.name}
                            </Text>
                          </View>
                          <View style={styles.targetTableColBase}>
                            <Text style={styles.targetBaseText} numberOfLines={1}>
                              {formattedBase}
                            </Text>
                          </View>
                          <View style={styles.targetTableColTarget}>
                            <Text style={styles.targetTargetText} numberOfLines={1}>
                              {formattedTarget}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}

              {/* Weekly Foundational Checklist */}
              <View style={styles.bioSectionTitleRow}>
                <Text style={styles.bioSectionHeaderIcon}>🚀</Text>
                <Text style={styles.bioSectionHeader}>
                  Weekly Foundational Checklist
                </Text>
              </View>

              {(() => {
                const validChecklist = checklist.filter(
                  item => item && item.name && item.name.trim() !== '',
                );
                if (validChecklist.length === 0) {
                  return renderComingSoonCard(
                    'Protocol Checklist',
                    'Checklist protocols are being prepared and will appear soon.',
                    '📋',
                  );
                }

                return (
                  <View style={styles.bioChecklistContainer}>
                    {validChecklist.map(item => (
                      <View key={item.id} style={styles.bioChecklistItem}>
                        <View style={styles.bioChecklistHeaderRow}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.bioChecklistTitle}>
                              {item.id}. {item.name}
                            </Text>
                            <Text style={styles.bioChecklistSchedule}>
                              ⏱️ {item.duration} • {item.schedule}
                            </Text>
                          </View>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            style={[
                              styles.statusVerificationPill,
                              item.status === 'verified'
                                ? styles.statusPillVerified
                                : styles.statusPillPending,
                            ]}
                            onPress={() => handleToggleChecklist(item.id)}
                          >
                            <Text
                              style={[
                                styles.statusVerificationText,
                                item.status === 'verified'
                                  ? styles.statusTextVerified
                                  : styles.statusTextPending,
                              ]}
                            >
                              {item.status === 'verified' ? '✓ Verified' : 'Pending'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.bioChecklistRuleDesc}>
                          {item.ruleDescription}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })()}

              {/* Bounding Safety Ceilings */}
              {(() => {
                const ceilings = INITIAL_BIOMETRIC_RESET_CARD.safetyCeilings;
                if (!ceilings || !ceilings.maxHeartRateBpm) {
                  return renderComingSoonCard(
                    'Bounding Safety Ceilings',
                    'Physiological safety limits will be established based on your clinical assessment.',
                    '🛑',
                  );
                }
                return (
                  <View style={styles.bioSafetyBox}>
                    <View style={styles.bioSafetyHeaderRow}>
                      <Text style={styles.bioSafetyIcon}>🛑</Text>
                      <Text style={styles.bioSafetyTitle}>Bounding Safety Ceilings</Text>
                    </View>
                    <View style={styles.bioSafetyItem}>
                      <Text style={styles.bioSafetyLabel}>Heart Rate Limit Ceiling</Text>
                      <Text style={styles.bioSafetyValue}>{ceilings.maxHeartRateBpm} BPM</Text>
                    </View>
                    <View style={styles.bioSafetyDivider} />
                    <View style={styles.bioSafetyItem}>
                      <Text style={styles.bioSafetyLabel}>Continuous Sitting Max</Text>
                      <Text style={styles.bioSafetyValue}>{ceilings.continuousSittingMaxMins} Mins</Text>
                    </View>
                    <View style={styles.bioSafetyDivider} />
                    <View style={styles.bioSafetyItem}>
                      <Text style={styles.bioSafetyLabel}>Desk Stasis Break Rule</Text>
                      <Text style={styles.bioSafetyValue}>{ceilings.stasisBreakRule}</Text>
                    </View>
                  </View>
                );
              })()}

              {/* Physiological Rationale */}
              {(() => {
                const rationale = INITIAL_BIOMETRIC_RESET_CARD.clinicalRationale?.trim();
                if (!rationale) {
                  return renderComingSoonCard(
                    'Physiological Rationale & Citation',
                    'Evidence-based clinical rationale will appear here upon prescription formulation.',
                    '🔬',
                  );
                }
                return (
                  <View style={styles.bioRationaleBox}>
                    <View style={styles.bioRationaleHeaderRow}>
                      <Text style={styles.bioRationaleIcon}>🔬</Text>
                      <Text style={styles.bioRationaleTitle}>Physiological Rationale & Citation</Text>
                    </View>
                    <Text style={styles.bioRationaleText}>
                      {rationale}
                    </Text>
                  </View>
                );
              })()}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Custom Alert Modal for Submission Success & Error Feedback */}
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText={alertType === 'success' ? 'Next: Nutritional Profiler ➡️' : 'Dismiss'}
        onClose={() => {
          setAlertVisible(false);
          if (alertType === 'success') {
            if (isEmbedded && onNext) {
              onNext();
            } else if (setActiveScreen) {
              setActiveScreen('NutritionalProfiler');
            }
          }
        }}
      />
    </Container>
  );
};

export default ExercisePrescriptionScreen;
